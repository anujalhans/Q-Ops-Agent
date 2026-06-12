const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const generatorWorkflowId = 'SG7khcKlhHst48WH';
const workerWorkflowId = 'ivz13uFyjfCT8149';
const label = 'stc_update_retry_scope_and_reconcile_v1';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, (error) => error ? reject(error) : resolve()));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function upsertNode(nodes, nextNode) {
  const existing = nodes.find((item) => item.name === nextNode.name);
  if (existing) {
    Object.assign(existing, nextNode, { id: existing.id });
    return existing;
  }
  nodes.push(nextNode);
  return nextNode;
}

function setSingleConnection(connections, from, to, outputIndex = 0) {
  if (!connections[from]) connections[from] = { main: [] };
  connections[from].main = connections[from].main || [];
  connections[from].main[outputIndex] = [{ node: to, type: 'main', index: 0 }];
}

function patchGenerator(nodes, connections) {
  const node = requireNode(nodes, 'Build Story Test Case Delta Targets');
  node.parameters.jsCode = String.raw`const request = $('Normalize Story Test Case Request').first().json;
let storyItems;
try {
  storyItems = $('Build Story Source Items').all();
} catch {
  storyItems = $input.all();
}
const allStories = storyItems.map(item => item.json || {});
const persistedLinks = $input.all()
  .map(item => item.json || {})
  .filter(row => row.story_jira_key || row.storyKey || row.testcase_jira_key || row.testcaseKey);
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const retryContext = request.retryContext && typeof request.retryContext === 'object' ? request.retryContext : {};
const generationMode = String(request.generationMode || '').toLowerCase();
const isUpdate = generationMode === 'update';
const isRetry = Boolean(
  request.retryJobId
  || request.retryOfJobId
  || retryContext.retryOfJobId
  || updateContext.retryRepairSourceJobId
);
const previousLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousSummary = updateContext.previousCoverageSummary || {};
const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];
const status = String(previousSummary.gateStatus || previousSummary.status || '').toLowerCase();

function keyOf(value) {
  const key = String(value || '').trim().toUpperCase();
  return /^KAN-\d+$/.test(key) ? key : '';
}

function addKey(target, value) {
  const key = keyOf(value);
  if (key) target.add(key);
}

function collectKeys(value, target, depth = 0) {
  if (!value || depth > 6) return;
  if (Array.isArray(value)) {
    value.forEach(item => collectKeys(item, target, depth + 1));
    return;
  }
  if (typeof value !== 'object') return;
  addKey(target, value.storyKey);
  addKey(target, value.jiraStoryKey);
  addKey(target, value.sourceStoryKey);
  addKey(target, value.issueKey);
  addKey(target, value.key);
  Object.entries(value).forEach(([field, nested]) => {
    if (/testcase|test_case/i.test(field)) return;
    if (/story|coverage|ledger|repair|publish|batch|mapping/i.test(field)) collectKeys(nested, target, depth + 1);
  });
}

function rowsFrom(...values) {
  return values.flatMap(value => Array.isArray(value) ? value : []);
}

const allStoryKeySet = new Set();
allStories.forEach(story => addKey(allStoryKeySet, story.storyKey || story.jiraStoryKey || story.key || story.issueKey));

const persistedLinksByStory = new Map();
persistedLinks.forEach(link => {
  const key = keyOf(link.story_jira_key || link.storyKey || link.jiraStoryKey || link.sourceStoryKey);
  const testKey = String(link.testcase_jira_key || link.testcaseKey || link.testCaseKey || '').trim();
  if (!key || !testKey) return;
  if (!persistedLinksByStory.has(key)) persistedLinksByStory.set(key, []);
  persistedLinksByStory.get(key).push(link);
});

function durableLedgerFromPersistedLinks() {
  return allStories.map((story, index) => {
    const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);
    const links = persistedLinksByStory.get(key) || [];
    const testCaseKeys = [...new Set(links.map(link => String(link.testcase_jira_key || link.testcaseKey || link.testCaseKey || '').trim()).filter(Boolean))];
    return {
      coverageId: 'STC-COV-' + String(index + 1).padStart(3, '0'),
      storyKey: key || story.storyKey,
      storyId: story.storyId || story.issueId || null,
      storySummary: story.storySummary || story.summary || key || 'Jira story',
      storyCorrelationId: story.storyCorrelationId || null,
      requirement: story.storySummary || story.summary || key || 'Jira story',
      sourceReference: key ? 'Jira Story ' + key : 'Jira Story',
      includedInOutput: testCaseKeys.length + ' persisted Jira test cases',
      generatedTestCases: testCaseKeys.length,
      plannedTestCases: testCaseKeys.length,
      mappingCount: testCaseKeys.length,
      testcaseKeys: testCaseKeys,
      coverageStatus: testCaseKeys.length ? 'covered' : 'missing',
      status: testCaseKeys.length ? 'covered' : 'missing',
      categoriesCovered: [],
      missingCategories: [],
      plannedCategories: [],
      notes: testCaseKeys.length
        ? 'Coverage reused from persisted Jira story-to-test-case mappings.'
        : 'No persisted Jira story-to-test-case mappings found.',
      action: 'reused',
      reusedFromPersistedMappings: true,
    };
  });
}

const baselineKeys = new Set();
collectKeys(previousLedger, baselineKeys);
collectKeys(updateContext.previousStoryKeys, baselineKeys);
collectKeys(updateContext.previousBatchSummary, baselineKeys);
collectKeys(updateContext.previousUpdateSummary, baselineKeys);
collectKeys(updateContext.previousStories, baselineKeys);

const explicitRepairRows = rowsFrom(
  updateContext.retryRepairTargets,
  updateContext.repairTargets,
  updateContext.publishGaps,
  updateContext.previousUpdateSummary?.repairTargets,
  updateContext.previousUpdateSummary?.publishGaps,
  retryContext.repairTargets,
  retryContext.publishGaps,
);
const explicitRepairKeys = new Set();
collectKeys(explicitRepairRows, explicitRepairKeys);

const changedKeys = new Set();
rowsFrom(updateContext.changedStories, updateContext.updatedStories, updateContext.deltaStories).forEach(row => collectKeys(row, changedKeys));
updateReasons.forEach(reason => {
  String(reason || '').match(/KAN-\d+/gi)?.forEach(key => addKey(changedKeys, key));
});

const rowByStory = new Map();
previousLedger.forEach(row => {
  const key = keyOf(row.storyKey || row.sourceStoryKey || row.jiraStoryKey || row.issueKey || row.key);
  if (key) rowByStory.set(key, row);
});

function rowNeedsRepair(row) {
  if (!row) return false;
  const rowStatus = String(row.coverageStatus || row.status || row.gateStatus || '').toLowerCase();
  return /partial|missing|unknown|review|gap|failed|warning|publish/i.test(rowStatus)
    || Number(row.missingPublishedCases || 0) > 0
    || (Array.isArray(row.missingCategories) && row.missingCategories.length > 0)
    || Boolean(row.publishGap);
}

const needsRepairKeys = new Set();
previousLedger.forEach(row => {
  if (rowNeedsRepair(row)) addKey(needsRepairKeys, row.storyKey || row.sourceStoryKey || row.jiraStoryKey || row.issueKey || row.key);
});

const newStoryKeys = new Set();
if (baselineKeys.size) {
  allStories.forEach(story => {
    const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);
    if (key && !baselineKeys.has(key)) newStoryKeys.add(key);
  });
}

const sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length > 0 || changedKeys.size > 0;
const isClean = previousLedger.length > 0
  && !['warning', 'failed', 'not_reported'].includes(status)
  && (Number(previousSummary.missingCount) || 0) === 0
  && (Number(previousSummary.partialCount) || 0) === 0
  && (Number(previousSummary.unknownCount) || 0) === 0
  && needsRepairKeys.size === 0;

if (!isUpdate) {
  return allStories.map(story => ({ json: { ...story, noWork: false, deltaDecision: { version: 'stc-delta-scope-v2', noModelRequired: false, reason: 'Create mode generates full Story Test Case coverage.', selectedStoryCount: allStories.length, sourceStoryCount: allStories.length } } }));
}

const persistedMappingsCoverAllStories = allStoryKeySet.size > 0
  && persistedLinksByStory.size > 0
  && Array.from(allStoryKeySet).every(key => (persistedLinksByStory.get(key) || []).length > 0);
if (isRetry && isUpdate && persistedMappingsCoverAllStories) {
  const durableLedger = durableLedgerFromPersistedLinks();
  const totalMappings = durableLedger.reduce((sum, row) => sum + (Number(row.mappingCount) || 0), 0);
  const durableUpdateContext = {
    ...updateContext,
    previousCoverageLedger: durableLedger,
    previousCoverageSummary: {
      ...(previousSummary || {}),
      status: 'passed',
      gateStatus: 'passed',
      total: durableLedger.length,
      coverageLedgerCount: durableLedger.length,
      covered: durableLedger.length,
      coveredCount: durableLedger.length,
      partial: 0,
      partialCount: 0,
      missing: 0,
      missingCount: 0,
      unknownCount: 0,
      score: 100,
      message: 'Persisted Jira story-to-test-case mappings already cover all current stories.',
    },
    previousBatchSummary: {
      ...(updateContext.previousBatchSummary || {}),
      totalBatches: durableLedger.length,
      completedBatches: durableLedger.length,
      partialBatches: 0,
      missingBatches: 0,
      reusedFromPersistedMappings: true,
    },
    persistedMappingBaseline: {
      source: 'qa_story_testcase_links',
      storyCount: durableLedger.length,
      mappingCount: totalMappings,
      sourceJobIds: [...new Set(persistedLinks.map(link => String(link.job_id || link.jobId || '').trim()).filter(Boolean))],
    },
  };
  return [{
    json: {
      ...request,
      updateContext: durableUpdateContext,
      noWork: true,
      allStories,
      storySourceJobId: allStories[0]?.storySourceJobId || null,
      storySourceCount: allStories.length,
      persistedLinkCount: totalMappings,
      deltaDecision: {
        version: 'stc-delta-scope-v3',
        noModelRequired: true,
        reason: explicitRepairKeys.size
          ? 'Persisted Jira story-to-test-case mappings already cover all current stories, including retry repair targets; retry can preserve existing coverage without model generation.'
          : 'Persisted Jira story-to-test-case mappings already cover all current stories; retry can preserve existing coverage without model generation.',
        previousCoverageRows: durableLedger.length,
        sourceStoryCount: allStories.length,
        persistedLinkCount: totalMappings,
        explicitRepairTargetCount: explicitRepairKeys.size,
        persistedMappingBaseline: true,
      },
    },
  }];
}

if (isClean && !sourceChanged && !newStoryKeys.size && !explicitRepairKeys.size) {
  return [{ json: { ...request, noWork: true, allStories, storySourceJobId: allStories[0]?.storySourceJobId || null, storySourceCount: allStories.length, deltaDecision: { version: 'stc-delta-scope-v2', noModelRequired: true, reason: 'Previous Story Test Case coverage is clean and no source deltas were reported.', previousCoverageRows: previousLedger.length, sourceStoryCount: allStories.length } } }];
}

const selectedKeys = new Set();
explicitRepairKeys.forEach(key => selectedKeys.add(key));
needsRepairKeys.forEach(key => selectedKeys.add(key));
newStoryKeys.forEach(key => selectedKeys.add(key));
changedKeys.forEach(key => selectedKeys.add(key));

if (!selectedKeys.size && !baselineKeys.size && !previousLedger.length) {
  throw new Error('STC delta scope unavailable: previous story coverage baseline was not available, so Q-Ops refused to run a full update regeneration. Retry after the prior STC output or repair targets are available.');
}

if (!selectedKeys.size) {
  return [{ json: { ...request, noWork: true, allStories, storySourceJobId: allStories[0]?.storySourceJobId || null, storySourceCount: allStories.length, deltaDecision: { version: 'stc-delta-scope-v2', noModelRequired: true, reason: 'No missing, partial, new, or changed stories were detected for this STC update.', previousCoverageRows: previousLedger.length, sourceStoryCount: allStories.length } } }];
}

const selected = allStories.filter(story => selectedKeys.has(keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey)));

if (!selected.length) {
  throw new Error('STC delta scope unavailable: selected repair story IDs were not found in live Jira source stories. Target stories: ' + Array.from(selectedKeys).join(', '));
}

if (isRetry && selected.length === allStories.length && allStories.length > 6 && !explicitRepairKeys.size) {
  throw new Error('STC retry scope unsafe: retry would regenerate all ' + allStories.length + ' stories because no explicit repair targets were available. Q-Ops stopped before model work to avoid unnecessary token/cost spend.');
}

return selected.map(story => {
  const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);
  const repairRow = rowByStory.get(key) || explicitRepairRows.find(row => keyOf(row.storyKey || row.jiraStoryKey || row.sourceStoryKey || row.issueKey || row.key) === key) || null;
  return { json: { ...story, noWork: false, deltaDecision: { version: 'stc-delta-scope-v2', noModelRequired: false, reason: newStoryKeys.has(key) ? 'New Jira story detected after backlog update.' : rowNeedsRepair(repairRow) ? 'Story has missing, partial, or publish-gap coverage.' : changedKeys.has(key) ? 'Story matched source update context.' : 'Story selected by explicit retry repair target.', selectedStoryCount: selected.length, sourceStoryCount: allStories.length, baselineStoryCount: baselineKeys.size, retryRepairTargetCount: explicitRepairKeys.size, updateReasons } } };
});`;
  new Function(node.parameters.jsCode);

  const fetchCompleted = requireNode(nodes, 'Fetch Completed User Story Jobs');
  upsertNode(nodes, {
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: 'project_id', value: '={{ "eq." + encodeURIComponent($json.projectId || "") }}' },
          { name: 'order', value: 'created_at.desc' },
          { name: 'limit', value: '2000' },
          { name: 'select', value: 'job_id,project_id,project_name,story_jira_key,story_jira_id,story_correlation_id,story_summary,testcase_jira_key,testcase_jira_id,testcase_summary,stable_label,status,metadata,created_at,updated_at' },
        ],
      },
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    id: crypto.randomUUID(),
    name: 'Fetch Published Story Test Case Links',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [800, -88],
    alwaysOutputData: true,
    executeOnce: true,
    credentials: fetchCompleted.credentials,
  });

  setSingleConnection(connections, 'Build Story Source Items', 'Fetch Published Story Test Case Links');
  setSingleConnection(connections, 'Fetch Published Story Test Case Links', 'Build Story Test Case Delta Targets');

  requireNode(nodes, 'Prepare Existing Story Test Case Update Request');
  const persistTemplate = requireNode(nodes, 'Persist Story Test Case Progress - Linking Traceability');

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`const sourceItems = $input.all();
const rows = sourceItems.map(item => item.json || {});
const first = rows[0] || {};

function compactNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function uniqueValues(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

const storyKeys = uniqueValues(rows.map(row => row.storyKey || row.issueKey || row.jiraStoryKey || row.key));
const testCaseKeys = uniqueValues(rows.map(row => row.testcaseKey || row.testCaseKey || row.jiraKey || row.key));
const output = {
  documentType: 'story_test_cases',
  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,
  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,
  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,
  progress: {
    version: 'stc-progress-v1',
    stage: 'updating_existing_jira_test_cases',
    stageLabel: 'Updating Existing Jira Test Cases',
    group: 'publishing',
    progressPercent: 72,
    summary: 'Q-Ops found existing Jira test cases and is updating only the changed reusable issues before link verification.',
    updatedAt: new Date().toISOString(),
    details: {
      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,
      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,
      storyCount: storyKeys.length || compactNumber(first.storyCount),
      existingUpdateTotal: rows.length,
      updatedTestCaseCount: rows.length,
      testCaseCount: testCaseKeys.length || rows.length,
      itemCount: rows.length,
    },
  },
};

if (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;
if (first.tokenUsage) output.tokenUsage = first.tokenUsage;
if (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;
if (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;
if (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;
if (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;
if (first.wordCount !== undefined) output.wordCount = first.wordCount;
if (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;

return sourceItems.map(item => ({
  ...item,
  json: {
    ...(item.json || {}),
    progress: output.progress,
    progressOutput: output,
  },
}));`,
    },
    id: crypto.randomUUID(),
    name: 'Build Story Test Case Progress - Updating Existing Jira',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [7920, -16],
  });
  new Function(requireNode(nodes, 'Build Story Test Case Progress - Updating Existing Jira').parameters.jsCode);

  upsertNode(nodes, {
    ...persistTemplate,
    id: crypto.randomUUID(),
    name: 'Persist Story Test Case Progress - Updating Existing Jira',
    position: [8144, -16],
  });

  upsertNode(nodes, {
    parameters: {
      jsCode: 'return $("Build Story Test Case Progress - Updating Existing Jira").all();',
    },
    id: crypto.randomUUID(),
    name: 'Restore Story Test Case Progress - Updating Existing Jira',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [8368, -16],
  });

  setSingleConnection(connections, 'Prepare Existing Story Test Case Update Request', 'Build Story Test Case Progress - Updating Existing Jira');
  setSingleConnection(connections, 'Build Story Test Case Progress - Updating Existing Jira', 'Persist Story Test Case Progress - Updating Existing Jira');
  setSingleConnection(connections, 'Persist Story Test Case Progress - Updating Existing Jira', 'Restore Story Test Case Progress - Updating Existing Jira');
  setSingleConnection(connections, 'Restore Story Test Case Progress - Updating Existing Jira', 'Update Existing Jira Test Case');
}

function patchWorker(nodes, connections) {
  const getPending = requireNode(nodes, 'Get Pending Story Test Case Jobs');
  requireNode(nodes, 'Pending Story Test Case Job Exists?');
  const noPending = requireNode(nodes, 'No Pending Story Test Case Jobs');
  const logFailed = requireNode(nodes, 'LOG: Story Test Case Job Failed');
  const markFailed = requireNode(nodes, 'Mark Story Test Case Job Failed');

  upsertNode(nodes, {
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: 'status', value: 'eq.processing' },
          { name: 'input->>generatorMode', value: 'eq.professional_story_test_cases' },
          { name: 'created_at', value: '={{ "lt." + new Date(Date.now() - 120 * 60 * 1000).toISOString() }}' },
          { name: 'updated_at', value: '={{ "lt." + new Date(Date.now() - 120 * 60 * 1000).toISOString() }}' },
          { name: 'order', value: 'updated_at.asc' },
          { name: 'limit', value: '1' },
          { name: 'select', value: 'job_id,status,input,output,error,project_id,requested_by,settings_version,config_snapshot,created_at,updated_at,retry_of_job_id,retry_attempt' },
        ],
      },
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    id: crypto.randomUUID(),
    name: 'Get Stale Story Test Case Processing Jobs',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [672, 400],
    credentials: getPending.credentials,
  });

  upsertNode(nodes, {
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ Object.keys($json).length }}',
            rightValue: 0,
            operator: { type: 'number', operation: 'gt' },
          },
        ],
      },
      options: {},
    },
    id: crypto.randomUUID(),
    name: 'Stale Story Test Case Job Exists?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position: [896, 400],
  });

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`const row = Array.isArray($json) ? ($json[0] || {}) : ($json || {});
const input = row.input || {};
const persisted = row.output || {};
const progress = persisted.progress || persisted.progressOutput?.progress || persisted.usageCheckpoint?.progress || {};
const usage = persisted.tokenUsage || persisted.usageCheckpoint?.tokenUsage || {};

function num(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

const tokensInput = num(usage.input, usage.tokensInput, persisted.tokensInput);
const tokensOutput = num(usage.output, usage.tokensOutput, persisted.tokensOutput);
const tokensTotal = num(usage.total, usage.tokensTotal, persisted.tokensTotal, tokensInput + tokensOutput);
const estimatedCostUsd = num(usage.estimatedCostUsd, usage.estimated_cost_usd, persisted.estimatedCostUsd);
const stageLabel = progress.stageLabel || progress.stage || persisted.usageCheckpoint?.stage || 'last recorded STC checkpoint';
const errorMessage = 'Story Test Cases workflow stopped before writing final status. Last checkpoint: ' + stageLabel + '. Retry will use repair/update scope and must not regenerate unrelated successful stories.';
const tokenUsage = tokensTotal ? {
  source: usage.source || 'story_testcase_reconciled_checkpoint',
  stage: usage.stage || persisted.usageCheckpoint?.stage || progress.stage || null,
  model: usage.model || input.model || null,
  input: tokensInput,
  output: tokensOutput,
  total: tokensTotal,
  tokensInput,
  tokensOutput,
  tokensTotal,
  estimatedCostUsd,
} : null;

return [{
  json: {
    jobId: row.job_id,
    projectId: row.project_id || input.projectId || null,
    projectName: input.projectName || input.project_name || 'Unknown project',
    documentType: 'story_test_cases',
    requestedBy: row.requested_by || input.requestedBy || null,
    settingsVersion: row.settings_version || input.settingsVersion || null,
    createdAt: row.created_at,
    startedAt: row.created_at,
    updatedAt: row.updated_at,
    retryOfJobId: row.retry_of_job_id || input.retryJobId || input.retryOfJobId || null,
    retryAttempt: row.retry_attempt || input.retryAttempt || null,
    errorMessage,
    wordCount: num(persisted.wordCount, persisted.usageCheckpoint?.wordCount),
    tokensInput,
    tokensOutput,
    tokensTotal,
    estimatedCostUsd,
    tokenUsage,
    failedAfterUsageCheckpoint: Boolean(tokensTotal),
    output: {
      ...persisted,
      error: true,
      errorType: 'STORY_TEST_CASES_WORKFLOW_CRASHED',
      message: errorMessage,
      failed_at: new Date().toISOString(),
      terminalStatus: 'failed',
      progress,
      wordCount: num(persisted.wordCount, persisted.usageCheckpoint?.wordCount),
      tokensInput,
      tokensOutput,
      tokensTotal,
      estimatedCostUsd,
      tokenUsage,
      failedUsageAvailable: Boolean(tokensTotal),
      failedAfterUsageCheckpoint: Boolean(tokensTotal),
      retryGuidance: 'Retry after the workflow fix is applied. The retry should reuse explicit repair targets/update context and avoid full regeneration.',
      details: {
        source: 'STC stale processing reconciliation',
        failedAtNode: 'Finalize Story Test Case Result or downstream final status update',
        lastCheckpoint: stageLabel,
        n8nExecutionStatus: 'crashed_or_interrupted',
        progress,
        selectedStoryCount: progress.details?.selectedStoryCount || progress.details?.storyCount || null,
        generatedTestCaseCount: progress.details?.generatedTestCaseCount || null,
        publishedTestCaseCount: progress.details?.publishedTestCaseCount || null,
      },
    },
  },
}];`,
    },
    id: crypto.randomUUID(),
    name: 'Build Stale Story Test Case Failure Output',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1120, 400],
  });

  upsertNode(nodes, {
    ...logFailed,
    id: crypto.randomUUID(),
    name: 'LOG: Stale Story Test Case Job Failed',
    position: [1344, 400],
  });

  upsertNode(nodes, {
    parameters: {
      jsCode: 'return [{ json: $("Build Stale Story Test Case Failure Output").first().json }];',
    },
    id: crypto.randomUUID(),
    name: 'Restore Stale Story Test Case Failure',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1568, 400],
  });

  upsertNode(nodes, {
    ...markFailed,
    id: crypto.randomUUID(),
    name: 'Mark Stale Story Test Case Job Failed',
    position: [1792, 400],
  });

  setSingleConnection(connections, 'Pending Story Test Case Job Exists?', 'Get Stale Story Test Case Processing Jobs', 1);
  setSingleConnection(connections, 'Get Stale Story Test Case Processing Jobs', 'Stale Story Test Case Job Exists?');
  setSingleConnection(connections, 'Stale Story Test Case Job Exists?', 'Build Stale Story Test Case Failure Output', 0);
  setSingleConnection(connections, 'Stale Story Test Case Job Exists?', noPending.name, 1);
  setSingleConnection(connections, 'Build Stale Story Test Case Failure Output', 'Mark Stale Story Test Case Job Failed');
  setSingleConnection(connections, 'Mark Stale Story Test Case Job Failed', 'Restore Stale Story Test Case Failure');
  setSingleConnection(connections, 'Restore Stale Story Test Case Failure', 'LOG: Stale Story Test Case Job Failed');
}

async function patchWorkflow(db, workflowId, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;

  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = JSON.parse(row.nodes || '[]');
  const connections = JSON.parse(row.connections || '{}');
  patcher(nodes, connections);

  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);

  if (historyRow) {
    const historyNodes = JSON.parse(historyRow.nodes || '[]');
    const historyConnections = JSON.parse(historyRow.connections || row.connections || '{}');
    patcher(historyNodes, historyConnections);
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(historyNodes), JSON.stringify(historyConnections), now, workflowId, row.activeVersionId]);
  }

  return { workflowId, backupPath, updatedAt: now };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const generator = await patchWorkflow(db, generatorWorkflowId, patchGenerator);
    const worker = await patchWorkflow(db, workerWorkflowId, patchWorker);
    console.log(JSON.stringify({ ok: true, label, generator, worker }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
