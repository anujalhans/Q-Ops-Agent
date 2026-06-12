const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function stamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      error ? reject(error) : resolve(this);
    });
  });
}

function parse(value) {
  if (!value) return null;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function stringify(value) {
  return JSON.stringify(value);
}

function requireCodeNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${name}`);
  return node;
}

async function patchWorkflow(db, workflowId, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  const nodes = parse(row.nodes);
  const connections = parse(row.connections) || {};
  if (!Array.isArray(nodes)) throw new Error(`workflow ${workflowId} nodes are not an array`);

  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_contract_v1_${stamp()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));

  const changes = patcher(nodes);
  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
    stringify(nodes),
    stringify(connections),
    now,
    workflowId,
  ]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
      stringify(nodes),
      stringify(connections),
      now,
      workflowId,
      row.activeVersionId,
    ]);
  }
  return { workflowId, name: row.name, backupPath, changes };
}

const returnResultCode = String.raw`const root = $input.first().json;
const confluence = root.confluenceResponse || {};
const base = confluence._links?.base || root.confluenceBaseUrl;
const webui = confluence._links?.webui || null;
const baseClean = String(base || '').endsWith('/') ? String(base || '').slice(0, -1) : String(base || '');
const confluenceUrl = webui ? baseClean + webui : null;

function array(value) {
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
}
function firstText(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}
function normalizeKey(value) {
  return firstText(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function textList(...values) {
  return [...new Set(values.flatMap(value => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value).split(/[;,]/);
  }).map(value => String(value || '').trim()).filter(Boolean))];
}
function coverageStatus(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('exclude')) return 'excluded';
  if (raw.includes('partial') || raw.includes('review') || raw.includes('at risk')) return 'partial';
  if (raw.includes('miss') || raw.includes('gap') || raw.includes('unknown') || raw.includes('not covered')) return 'missing';
  if (raw.includes('cover') || raw.includes('mapped') || raw.includes('include')) return 'covered';
  return 'unknown';
}
function summarizeCoverageLedger(rows) {
  const summary = {
    mode: 'enforced',
    version: 'backlog-coverage-ledger-v1',
    gateStatus: 'passed',
    coverageLedgerCount: rows.length,
    coveredCount: 0,
    partialCount: 0,
    missingCount: 0,
    unknownCount: 0,
    excludedCount: 0,
    uncoveredCount: 0,
    blockingUncoveredCount: 0,
    missingItems: [],
    mappingWarnings: [],
    mappingWarningCount: 0,
  };
  for (const row of rows) {
    const status = coverageStatus(row.coverageStatus || row.status);
    if (status === 'covered') summary.coveredCount += 1;
    else if (status === 'excluded') summary.excludedCount += 1;
    else if (status === 'partial') {
      summary.partialCount += 1;
      summary.missingItems.push(row);
    } else {
      summary.missingCount += 1;
      summary.missingItems.push(row);
    }
  }
  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  if (summary.blockingUncoveredCount) summary.gateStatus = 'failed';
  else if (summary.partialCount) summary.gateStatus = 'warning';
  return summary;
}
function addKnownIssueIds(set, item, kind) {
  const values = kind === 'epic'
    ? [item.epicCorrelationId, item.epicId, item.jiraEpicKey, item.epicKey, item.key, item.stableLabel, item.epicName]
    : [item.storyCorrelationId, item.userStoryId, item.storyId, item.jiraStoryKey, item.storyKey, item.key, item.stableLabel, item.summary];
  for (const value of values) {
    const key = normalizeKey(value);
    if (key) set.add(key);
  }
}

const updateContext = root.updateContext && typeof root.updateContext === 'object' ? root.updateContext : {};
const previousEpics = array(updateContext.previousEpics);
const previousStories = array(updateContext.previousStories);
const jiraEpics = array(root.jiraResults?.epics);
const jiraStories = array(root.jiraResults?.stories);
const knownEpics = new Set();
const knownStories = new Set();
jiraEpics.forEach(item => addKnownIssueIds(knownEpics, item, 'epic'));
previousEpics.forEach(item => addKnownIssueIds(knownEpics, item, 'epic'));
jiraStories.forEach(item => addKnownIssueIds(knownStories, item, 'story'));
previousStories.forEach(item => addKnownIssueIds(knownStories, item, 'story'));

let coverageLedger = array(root.coverageLedger || root.qualityGate?.coverageLedger || root.generated?.document?.coverageLedger);
coverageLedger = coverageLedger.map((row, index) => {
  const mappedEpicIds = textList(row.mappedEpicIds, row.epicCorrelationIds, row.epicIds, row.epics, row.epicId, row.epicCorrelationId);
  const mappedStoryIds = textList(row.mappedStoryIds, row.storyCorrelationIds, row.storyIds, row.userStoryIds, row.stories, row.storyId, row.storyCorrelationId);
  const mappedEpicMatches = mappedEpicIds.filter(id => knownEpics.has(normalizeKey(id)));
  const mappedStoryMatches = mappedStoryIds.filter(id => knownStories.has(normalizeKey(id)));
  let status = coverageStatus(row.coverageStatus || row.status || row.coverage);
  let notes = firstText(row.notes, row.rationale, row.reason);
  if (status === 'covered' && mappedStoryIds.length && !mappedStoryMatches.length) {
    status = 'partial';
    notes = [notes, 'Mapped story IDs were not found among published or preserved Jira stories.'].filter(Boolean).join(' ');
  }
  return {
    ...row,
    coverageId: firstText(row.coverageId, row.id, row.requirementId, 'BCOV-' + String(index + 1).padStart(3, '0')),
    moduleRequirement: firstText(row.moduleRequirement, row.module, row.requirement, row.capability, row.title, row.name),
    sourceReference: firstText(row.sourceReference, row.source, row.sourceRef, row.evidence),
    mappedEpicIds,
    mappedStoryIds,
    mappedEpicMatches,
    mappedStoryMatches,
    coverageStatus: status,
    notes,
  };
});
const coverageSummary = summarizeCoverageLedger(coverageLedger);
const tokenUsage = {
  source: root.tokenUsage?.source || root.qualityGate?.tokenUsage?.source || root.generated?.document?.updateSummary?.tokenUsage?.source || 'estimated',
  input: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,
  output: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,
  total: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,
  tokensInput: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,
  tokensOutput: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? 0) || 0,
  tokensTotal: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,
  estimatedCostUsd: Number(root.estimatedCostUsd ?? root.tokenUsage?.estimatedCostUsd ?? root.qualityGate?.estimatedCostUsd ?? 0) || 0,
};
const rawUpdateSummary = root.generated?.document?.updateSummary || root.updateSummary || null;

return [{ json: {
  jobId: root.jobId,
  projectName: root.projectName,
  documentType: root.documentType,
  jiraProjectType: 'team-managed',
  promptLibraryVersion: $('Professional Prompt Library').first().json.promptLibraryVersion,
  qualityGate: { ...(root.qualityGate || {}), coverageLedger, coverageSummary },
  wordCount: root.wordCount,
  tokensInput: tokenUsage.input,
  tokensOutput: tokenUsage.output,
  tokensTotal: tokenUsage.total,
  estimatedCostUsd: tokenUsage.estimatedCostUsd,
  tokenUsage,
  epics: jiraEpics,
  stories: jiraStories,
  jira: root.jiraResults,
  confluence: { pageId: confluence.id || null, title: confluence.title || root.confluenceTitle, action: root.confluenceAction, link: webui, url: confluenceUrl },
  url: confluenceUrl,
  confluenceUrl,
  generated: root.generated,
  coverageLedger,
  coverageSummary,
  batchPlan: root.batchPlan || root.qualityGate?.batchPlan || root.generated?.document?.batchPlan || null,
  batchSummary: root.batchSummary || root.qualityGate?.batchSummary || root.generated?.document?.batchResults || null,
  progress: {
    stage: 'published',
    stageLabel: 'Published to Jira and Confluence',
    progressPercent: 100,
    summary: coverageSummary.gateStatus === 'warning'
      ? 'Epics and user stories were published, with coverage review warnings that need final review.'
      : 'Epics and user stories were generated in module batches, coverage-reviewed, published to Jira, and summarized in Confluence.',
    coverage: coverageSummary,
    batches: root.batchSummary?.batches || root.qualityGate?.batchSummary?.batches || root.generated?.document?.batchResults?.batches || [],
  },
  generationSummary: {
    epicCount: jiraEpics.length,
    storyCount: jiraStories.length,
    coverageGate: coverageSummary.gateStatus,
    batchCount: root.batchSummary?.totalBatches || root.qualityGate?.batchSummary?.totalBatches || 0,
  },
  sourceCoverage: root.qualityGate?.sourceCoverage || [],
  retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0,
  retrievalQuality: root.retrievalQuality || null,
  generationMode: root.generationMode || 'create',
  updateContext: root.updateContext || null,
  updateSummary: rawUpdateSummary,
  tokenSavings: rawUpdateSummary?.tokenSavings || null,
} }];`;

const buildCompletionOutputCode = String.raw`const result = $json || {};
const input = $('Prepare Generator Input').first().json;

function array(value) {
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
}
function firstText(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}
function actionOf(item) {
  const action = String(item?.action || item?.operation || item?.status || '').trim().toLowerCase();
  if (['created', 'create', 'added', 'new'].includes(action)) return 'created';
  if (['updated', 'update', 'patched', 'modified'].includes(action)) return 'updated';
  if (['removed', 'remove', 'deleted', 'delete'].includes(action)) return 'removed';
  if (['reused', 'reuse', 'existing', 'unchanged', 'preserved', 'skipped'].includes(action)) return 'reused';
  return action || 'created';
}
function issueKey(item, kind) {
  return kind === 'epic'
    ? firstText(item.jiraEpicKey, item.epicKey, item.key, item.issueKey, item.jiraKey, item.epicCorrelationId, item.epicName)
    : firstText(item.storyKey, item.jiraStoryKey, item.key, item.issueKey, item.jiraKey, item.storyCorrelationId, item.summary);
}
function issueSummary(item, kind) {
  return kind === 'epic'
    ? firstText(item.epicName, item.name, item.summary, item.title, item.jiraEpicKey, item.epicKey)
    : firstText(item.summary, item.storySummary, item.name, item.title, item.storyKey, item.jiraStoryKey);
}
function normalizeActionItems(items, kind, actionOverride) {
  const seen = new Set();
  return array(items).map(item => {
    const action = actionOverride || actionOf(item);
    return {
      ...item,
      action,
      key: issueKey(item, kind),
      summary: issueSummary(item, kind),
    };
  }).filter(item => {
    const key = String(item.key || item.summary || '').toLowerCase();
    const dedupeKey = kind + ':' + actionOf(item) + ':' + key;
    if (!key || seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });
}
function summarizeCoverageLedger(rows) {
  const summary = {
    mode: 'enforced',
    version: 'backlog-coverage-ledger-v1',
    gateStatus: 'passed',
    coverageLedgerCount: rows.length,
    coveredCount: 0,
    partialCount: 0,
    missingCount: 0,
    unknownCount: 0,
    excludedCount: 0,
    uncoveredCount: 0,
    blockingUncoveredCount: 0,
    missingItems: [],
    mappingWarnings: [],
    mappingWarningCount: 0,
  };
  for (const row of rows) {
    const status = String(row.coverageStatus || row.status || '').toLowerCase();
    if (status.includes('cover')) summary.coveredCount += 1;
    else if (status.includes('exclude')) summary.excludedCount += 1;
    else if (status.includes('partial') || status.includes('review')) {
      summary.partialCount += 1;
      summary.missingItems.push(row);
    } else {
      summary.missingCount += 1;
      summary.missingItems.push(row);
    }
  }
  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  if (summary.blockingUncoveredCount) summary.gateStatus = 'failed';
  else if (summary.partialCount) summary.gateStatus = 'warning';
  return summary;
}

const confluenceUrl = result.confluence?.url || result.confluenceUrl || result.url || null;
const generationMode = input.generationMode || (input.retryContext?.retryMode ? 'retry' : 'create');
const updateContext = input.updateContext || {};
const previousEpics = array(updateContext.previousEpics);
const previousStories = array(updateContext.previousStories);
const currentEpics = array(result.epics || result.jira?.epics);
const currentStories = array(result.stories || result.jira?.stories);
const addedEpics = normalizeActionItems(currentEpics.filter(item => actionOf(item) === 'created'), 'epic', 'created');
const updatedEpics = normalizeActionItems(currentEpics.filter(item => actionOf(item) === 'updated'), 'epic', 'updated');
const removedEpics = normalizeActionItems(currentEpics.filter(item => actionOf(item) === 'removed'), 'epic', 'removed');
const addedStories = normalizeActionItems(currentStories.filter(item => actionOf(item) === 'created'), 'story', 'created');
const updatedStories = normalizeActionItems(currentStories.filter(item => actionOf(item) === 'updated'), 'story', 'updated');
const removedStories = normalizeActionItems(currentStories.filter(item => actionOf(item) === 'removed'), 'story', 'removed');
const preservedEpics = generationMode === 'update'
  ? normalizeActionItems(previousEpics, 'epic', 'reused')
  : normalizeActionItems(currentEpics.filter(item => actionOf(item) === 'reused'), 'epic', 'reused');
const preservedStories = generationMode === 'update'
  ? normalizeActionItems(previousStories, 'story', 'reused')
  : normalizeActionItems(currentStories.filter(item => actionOf(item) === 'reused'), 'story', 'reused');

const tokenUsage = {
  source: result.tokenUsage?.source || 'estimated',
  input: Number(result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,
  output: Number(result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,
  total: Number(result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,
  tokensInput: Number(result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,
  tokensOutput: Number(result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,
  tokensTotal: Number(result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,
  estimatedCostUsd: Number(result.tokenUsage?.estimatedCostUsd ?? result.estimatedCostUsd ?? 0) || 0,
};
const previousTokenUsage = updateContext.previousTokenUsage || {};
const baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;
const baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;
const tokenSavings = {
  estimatedBaselineTokens: baselineTokens || null,
  estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - tokenUsage.total) : 0,
  estimatedBaselineCostUsd: baselineCost || null,
  estimatedCostSavedUsd: baselineCost ? Math.max(0, Number((baselineCost - tokenUsage.estimatedCostUsd).toFixed(6))) : 0,
  estimatedSavingsPercent: baselineTokens ? Math.max(0, Math.round(((baselineTokens - tokenUsage.total) / baselineTokens) * 100)) : null,
};
const coverageLedger = array(result.coverageLedger || result.qualityGate?.coverageLedger || result.generated?.document?.coverageLedger);
const coverageSummary = result.coverageSummary || result.qualityGate?.coverageSummary || result.qualityGate?.progress?.coverage || summarizeCoverageLedger(coverageLedger);
const existingSummary = result.updateSummary || {};
const updateSummary = {
  ...existingSummary,
  enabled: true,
  version: 'backlog-update-summary-v2',
  documentType: 'user_stories',
  mode: generationMode,
  operationMode: generationMode === 'update' && input.retryOfJobId ? 'update_retry' : generationMode,
  deltaMode: generationMode === 'update',
  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,
  previousJobId: updateContext.previousJobId || input.updateOfJobId || null,
  previousBacklogBaselineCounts: {
    epics: previousEpics.length,
    stories: previousStories.length,
  },
  createdEpicCount: addedEpics.length,
  createdStoryCount: addedStories.length,
  updatedEpicCount: updatedEpics.length,
  updatedStoryCount: updatedStories.length,
  reusedEpicCount: preservedEpics.length,
  reusedStoryCount: preservedStories.length,
  removedEpicCount: removedEpics.length,
  removedStoryCount: removedStories.length,
  totalEpicCount: Math.max(0, (previousEpics.length || preservedEpics.length) + addedEpics.length - removedEpics.length),
  totalStoryCount: Math.max(0, (previousStories.length || preservedStories.length) + addedStories.length - removedStories.length),
  addedEpics,
  addedStories,
  updatedEpics,
  updatedStories,
  preservedEpics,
  preservedStories,
  removedEpics,
  removedStories,
  coverageSummary,
  coverageLedgerCount: coverageSummary.coverageLedgerCount || coverageLedger.length,
  tokenUsage,
  previousTokenUsage,
  tokenSavings,
  estimatedBaselineTokens: tokenSavings.estimatedBaselineTokens,
  estimatedTokensSaved: tokenSavings.estimatedTokensSaved,
  estimatedBaselineCostUsd: tokenSavings.estimatedBaselineCostUsd,
  estimatedCostSavedUsd: tokenSavings.estimatedCostSavedUsd,
  estimatedSavingsPercent: tokenSavings.estimatedSavingsPercent,
  message: [
    addedEpics.length ? addedEpics.length + ' epic' + (addedEpics.length === 1 ? '' : 's') + ' added' : '',
    addedStories.length ? addedStories.length + ' stor' + (addedStories.length === 1 ? 'y' : 'ies') + ' added' : '',
    updatedEpics.length ? updatedEpics.length + ' epic' + (updatedEpics.length === 1 ? '' : 's') + ' updated' : '',
    updatedStories.length ? updatedStories.length + ' stor' + (updatedStories.length === 1 ? 'y' : 'ies') + ' updated' : '',
  ].filter(Boolean).join(', ') || 'No backlog changes needed',
};

return [{
  json: {
    ...input,
    result,
    output: {
      settingsVersion: input.settingsVersion || null,
      destination: { type: 'jira_confluence', projectId: input.projectId || null },
      url: confluenceUrl,
      documentUrl: confluenceUrl,
      confluence: result.confluence || null,
      epics: currentEpics,
      stories: currentStories,
      professionalGenerator: true,
      generationMode,
      updateContext: generationMode === 'update' ? {
        previousJobId: updateContext.previousJobId || input.updateOfJobId || null,
        previousConfluencePageId: updateContext.previousConfluencePageId || null,
        previousConfluenceUrl: updateContext.previousConfluenceUrl || null,
        previousBacklogBaselineCounts: updateSummary.previousBacklogBaselineCounts,
        previousTokenUsage,
      } : null,
      updateSummary,
      tokenSavings,
      tokenUsage,
      qualityGate: { ...(result.qualityGate || {}), coverageLedger, coverageSummary },
      coverageLedger,
      coverageSummary,
      batchPlan: result.batchPlan || result.qualityGate?.batchPlan || null,
      batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,
      jira: result.jira || null,
      wordCount: result.wordCount || 0,
      tokensInput: tokenUsage.input,
      tokensOutput: tokenUsage.output,
      tokensTotal: tokenUsage.total,
      estimatedCostUsd: tokenUsage.estimatedCostUsd,
      promptLibraryVersion: result.promptLibraryVersion || null,
      sourceCoverage: result.sourceCoverage || [],
      retrievalEvidenceCount: result.retrievalEvidenceCount || 0,
      retrievalQuality: result.retrievalQuality || null,
      progress: result.progress || { stage: 'published', stageLabel: 'Published to Jira and Confluence', progressPercent: 100, coverage: coverageSummary },
    }
  }
}];`;

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const patched = [];
    patched.push(await patchWorkflow(db, 'Vwc6c8ehsRTF8svG', (nodes) => {
      const node = requireCodeNode(nodes, 'Return Team Managed Professional Result');
      node.parameters.jsCode = returnResultCode;
      new Function(returnResultCode);
      return ['Reconciled coverage ledger against published/preserved Jira epics and stories before returning Backlog result.'];
    }));
    patched.push(await patchWorkflow(db, 'QApRBFSaJgINsdHN', (nodes) => {
      const node = requireCodeNode(nodes, 'Build Backlog Completion Output');
      node.parameters.jsCode = buildCompletionOutputCode;
      new Function(buildCompletionOutputCode);
      return ['Persisted standard tokenUsage, coverageSummary, coverageLedger, action-based updateSummary, preserved baseline counts, and token savings for Backlog jobs.'];
    }));
    console.log(JSON.stringify({ patched }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
