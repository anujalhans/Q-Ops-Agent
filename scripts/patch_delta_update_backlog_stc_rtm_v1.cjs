const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function ensureCodeNode(nodes, name, position, jsCode) {
  let node = nodes.find(item => item.name === name);
  if (!node) {
    node = {
      parameters: { jsCode },
      id: crypto.randomUUID(),
      name,
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position,
    };
    nodes.push(node);
  }
  node.parameters = node.parameters || {};
  node.parameters.jsCode = jsCode;
  return node;
}

function ensureIfNode(nodes, name, position, leftExpression) {
  let node = nodes.find(item => item.name === name);
  if (!node) {
    node = {
      parameters: {},
      id: crypto.randomUUID(),
      name,
      type: 'n8n-nodes-base.if',
      typeVersion: 2.2,
      position,
    };
    nodes.push(node);
  }
  node.parameters = {
    conditions: {
      combinator: 'and',
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [{
        leftValue: leftExpression,
        rightValue: true,
        operator: { type: 'boolean', operation: 'true', singleValue: true },
      }],
    },
    options: {},
  };
  return node;
}

function connect(connections, from, outputs) {
  connections[from] = connections[from] || {};
  connections[from].main = outputs;
}

function compileCodeNodes(nodes, names) {
  for (const name of names) {
    const node = requireNode(nodes, name);
    if (node.parameters?.jsCode) new Function(node.parameters.jsCode);
  }
}

async function updateWorkflow(db, workflowId, label, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;

  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = JSON.parse(row.nodes);
  const connections = JSON.parse(row.connections);
  patcher(nodes, connections);

  const now = new Date().toISOString();
  const nodesJson = JSON.stringify(nodes);
  const connectionsJson = JSON.stringify(connections);
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
  }
  return { workflowId, name: row.name, backupPath };
}

const professionalQueueCode = String.raw`const now = new Date();
const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = ` + "`PRO-${datePart}-${randomPart}`" + String.raw`;
const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const input = $json.body || {};
const retryOfJobId = String(input.retryJobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);
const requestedGenerationMode = String(input.generationMode || input.mode || '').trim().toLowerCase();
const updateContext = input.updateContext && typeof input.updateContext === 'object' ? input.updateContext : {};
const updateOfJobId = String(input.updateOfJobId || updateContext.previousJobId || updateContext.previous_job_id || '').trim();
const isUpdate = requestedGenerationMode === 'update' || Boolean(updateOfJobId);
const generationMode = isUpdate ? 'update' : (isRetry ? 'retry' : 'create');
const documentTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix', 'test_cases', 'user_stories', 'traceability_matrix']);
const documentType = String(input.documentType || '').trim().toLowerCase();
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token' } }];
}
if (!String(input.projectName || '').trim() || !documentTypes.has(documentType)) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'projectName and supported documentType are required' } }];
}

const defaultRetryInstruction = isRetry
  ? [
      generationMode === 'update'
        ? 'This request is an update retry for a failed update attempt.'
        : 'This request is a regeneration retry for a failed generation attempt.',
      'Previous failed job id: ' + retryOfJobId + '.',
      'Preserve the same document type and project scope.',
      generationMode === 'update'
        ? 'Preserve update semantics, patch the previous successful target output, and do not create duplicate Jira or Confluence artifacts.'
        : 'If the previous attempt failed a quality gate, expand the output with grounded project evidence, include all required sections, and meet the configured minimum word count.',
      'Do not fabricate requirements; cite retrieved source metadata where available.'
    ].join(' ')
  : '';

const retryContext = {
  ...(input.retryContext || {}),
  retryOfJobId: isRetry ? retryOfJobId : null,
  retryMode: isRetry,
  generationMode,
  updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,
  retryInstruction: input.retryInstruction || defaultRetryInstruction
};

const normalizedUpdateContext = isUpdate ? {
  ...updateContext,
  previousJobId: updateOfJobId || updateContext.previousJobId || null,
  updateMode: true,
  deltaRequested: updateContext.deltaRequested !== false,
  preserveExistingBacklog: updateContext.preserveExistingBacklog !== false,
  retryOfJobId: isRetry ? retryOfJobId : (updateContext.retryOfJobId || null)
} : {};

return [{
  json: {
    ok: true,
    jobId,
    retryMode: isRetry,
    generationMode,
    updateMode: isUpdate,
    updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,
    retryOfJobId: isRetry ? retryOfJobId : null,
    retryInstruction: retryContext.retryInstruction,
    input: {
      ...input,
      retryJobId: undefined,
      jobId: undefined,
      retryOfJobId: isRetry ? retryOfJobId : null,
      retryContext,
      retryInstruction: retryContext.retryInstruction,
      generationMode,
      updateMode: isUpdate,
      updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,
      updateContext: normalizedUpdateContext,
      documentType,
      generatorMode: 'professional'
    },
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    projectId: input.projectId || null,
    environment: input.environment || 'local'
  }
}];`;

const storyQueueCode = String.raw`const now = new Date();
const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = 'STC-' + datePart + '-' + randomPart;
const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const input = $json.body || {};
const retryOfJobId = String(input.retryJobId || input.jobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);
const requestedMode = String(input.generationMode || '').trim().toLowerCase();
const generationMode = requestedMode === 'update' ? 'update' : (isRetry ? 'retry' : 'create');
const updateContext = input.updateContext && typeof input.updateContext === 'object' ? input.updateContext : {};
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token' } }];
}
if (!String(input.projectName || '').trim()) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'projectName is required' } }];
}
const documentType = String(input.documentType || '').trim().toLowerCase();
if (documentType !== 'story_test_cases') {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'documentType must be story_test_cases' } }];
}
const retryContext = {
  ...(input.retryContext || {}),
  retryMode: isRetry,
  retryOfJobId: retryOfJobId || null,
  generationMode,
  updateOfJobId: updateContext.previousJobId || input.updateOfJobId || null,
  retryInstruction: input.retryInstruction || null
};
return [{
  json: {
    ok: true,
    jobId,
    retryMode: isRetry,
    retryOfJobId: retryOfJobId || null,
    input: {
      ...input,
      retryJobId: undefined,
      jobId: undefined,
      retryOfJobId: retryOfJobId || null,
      retryContext,
      generatorMode: 'professional_story_test_cases',
      generationMode,
    },
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    projectId: input.projectId || null,
    environment: input.environment || 'local'
  }
}];`;

const backlogDeltaGateCode = String.raw`const request = $json || {};
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const updateMode = String(request.generationMode || '').toLowerCase() === 'update' || Boolean(updateContext.updateMode || updateContext.previousJobId);
const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousCoverageSummary = updateContext.previousCoverageSummary || {};
const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];
const status = String(previousCoverageSummary.gateStatus || previousCoverageSummary.status || '').toLowerCase();
const rows = previousCoverageLedger.length || Number(previousCoverageSummary.coverageLedgerCount || 0) || 0;
const unresolved = previousCoverageLedger.filter(row => {
  const value = String(row.coverageStatus || row.status || '').toLowerCase();
  return value.includes('partial') || value.includes('missing') || value.includes('unknown') || value.includes('gap') || value.includes('review');
});
const previousCoverageClean = rows > 0
  && unresolved.length === 0
  && !['warning', 'failed', 'not_reported'].includes(status)
  && (Number(previousCoverageSummary.missingCount) || 0) === 0
  && (Number(previousCoverageSummary.partialCount) || 0) === 0
  && (Number(previousCoverageSummary.unknownCount) || 0) === 0;
const sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length > 0;
const noModelRequired = Boolean(updateMode && previousEpics.length && previousStories.length && previousCoverageClean && !sourceChanged);
return [{ json: {
  ...request,
  backlogDeltaDecision: {
    version: 'backlog-delta-gate-v1',
    noModelRequired,
    reason: noModelRequired
      ? 'Previous live Jira/Confluence backlog coverage is complete and no source deltas were reported.'
      : 'Generation required because coverage/source delta check is not clean.',
    previousEpicCount: previousEpics.length,
    previousStoryCount: previousStories.length,
    previousCoverageRows: rows,
    unresolvedCoverageRows: unresolved.length,
    sourceChanged,
    updateReasons
  }
} }];`;

const backlogNoModelCode = String.raw`const request = $json || {};
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousCoverageSummary = updateContext.previousCoverageSummary || {};
const previousTokenUsage = updateContext.previousTokenUsage || {};
const baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;
const baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;
const currentTokens = 0;
const currentCost = 0;
const byEpic = new Map();
for (const epic of previousEpics) {
  const key = String(epic.epicCorrelationId || epic.epicId || epic.jiraEpicKey || epic.key || epic.epicName || '').trim();
  if (!key) continue;
  byEpic.set(key, { ...epic, action: epic.action || 'reused', stories: [] });
}
const firstEpic = byEpic.values().next().value || null;
for (const story of previousStories) {
  const parentKey = String(story.parentEpicCorrelationId || story.epicCorrelationId || story.epicId || story.parentEpicKey || '').trim();
  const target = byEpic.get(parentKey) || firstEpic;
  if (target) target.stories.push({ ...story, action: story.action || 'reused' });
}
const epics = Array.from(byEpic.values());
const sourceCoverage = previousCoverageLedger.map(row => ({
  source: row.sourceReference || 'Previous coverage ledger',
  coverageId: row.coverageId || '',
  status: row.coverageStatus || row.status || 'covered',
  moduleRequirement: row.moduleRequirement || row.requirement || ''
}));
const generated = {
  document: {
    title: 'Professional QA Backlog',
    summary: 'No backlog changes were needed. Existing Jira epics and stories were reused from the live project state.',
    coverageLedger: previousCoverageLedger,
    sourceCoverage,
    retrievalEvidence: sourceCoverage.slice(0, 50),
    batchPlan: { modules: [] },
    batchResults: {
      totalBatches: 0,
      completedBatches: 0,
      partialBatches: 0,
      retryingBatches: 0,
      recoveredBatches: 0,
      missingBatches: 0,
      batches: []
    },
    updateSummary: {
      enabled: true,
      version: 'backlog-delta-update-v1',
      documentType: 'user_stories',
      mode: 'update',
      deltaMode: true,
      noChangesDetected: true,
      noModelRequired: true,
      updateOfJobId: updateContext.previousJobId || request.updateOfJobId || null,
      reusedEpicCount: previousEpics.length,
      reusedStoryCount: previousStories.length,
      createdEpicCount: 0,
      createdStoryCount: 0,
      updatedEpicCount: 0,
      updatedStoryCount: 0,
      resolvedCoverageIds: [],
      unchangedCoverageIds: previousCoverageLedger.map(row => row.coverageId).filter(Boolean),
      tokenUsage: { source: 'no_model_delta_gate', input: currentTokens, output: 0, total: currentTokens, estimatedCostUsd: currentCost },
      previousTokenUsage,
      tokenSavings: {
        estimatedBaselineTokens: baselineTokens || null,
        estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - currentTokens) : 0,
        estimatedBaselineCostUsd: baselineCost || null,
        estimatedCostSavedUsd: baselineCost ? Math.max(0, baselineCost - currentCost) : 0,
        estimatedSavingsPercent: baselineTokens ? Math.round(((baselineTokens - currentTokens) / baselineTokens) * 100) : null
      },
      message: 'Live Jira and Confluence already cover the current backlog. Q-Ops reused existing epics and stories without invoking the backlog model.'
    }
  },
  epics
};
return [{ json: { output: generated } }];`;

const stcDeltaTargetsCode = String.raw`const request = $('Normalize Story Test Case Request').first().json;
const allStories = $input.all().map(item => item.json || {});
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const generationMode = String(request.generationMode || '').toLowerCase();
const previousLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousSummary = updateContext.previousCoverageSummary || {};
const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];
const status = String(previousSummary.gateStatus || previousSummary.status || '').toLowerCase();
const isClean = previousLedger.length > 0
  && !['warning', 'failed', 'not_reported'].includes(status)
  && (Number(previousSummary.missingCount) || 0) === 0
  && (Number(previousSummary.partialCount) || 0) === 0
  && (Number(previousSummary.unknownCount) || 0) === 0
  && !previousLedger.some(row => /partial|missing|unknown|review|gap/i.test(String(row.coverageStatus || row.status || '')));
const sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length > 0;
const rowByStory = new Map(previousLedger.map(row => [String(row.storyKey || row.sourceStoryKey || row.requirementId || '').trim(), row]));
const targetStories = generationMode === 'update'
  ? allStories.filter(story => {
      const row = rowByStory.get(String(story.storyKey || '').trim());
      if (!row) return true;
      const rowStatus = String(row.coverageStatus || row.status || '').toLowerCase();
      return /partial|missing|unknown|review|gap/.test(rowStatus);
    })
  : allStories;

if (generationMode === 'update' && isClean && !sourceChanged) {
  return [{ json: {
    ...request,
    noWork: true,
    allStories,
    storySourceJobId: allStories[0]?.storySourceJobId || null,
    storySourceCount: allStories.length,
    deltaDecision: {
      version: 'stc-delta-gate-v1',
      noModelRequired: true,
      reason: 'Previous Story Test Case coverage is clean and no source deltas were reported.',
      previousCoverageRows: previousLedger.length,
      sourceStoryCount: allStories.length
    }
  } }];
}

const selected = generationMode === 'update'
  ? (targetStories.length ? targetStories : (sourceChanged ? allStories : targetStories))
  : allStories;
return selected.map(story => ({ json: {
  ...story,
  noWork: false,
  deltaDecision: {
    version: 'stc-delta-gate-v1',
    noModelRequired: false,
    reason: generationMode === 'update' ? 'Story has missing/partial/new coverage or source context changed.' : 'Create mode generates full Story Test Case coverage.',
    selectedStoryCount: selected.length,
    sourceStoryCount: allStories.length,
    updateReasons
  }
} }));`;

const stcNoChangeCode = String.raw`const item = $json || {};
const updateContext = item.updateContext && typeof item.updateContext === 'object' ? item.updateContext : {};
const previousLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousSummary = updateContext.previousCoverageSummary || {};
const previousBatch = updateContext.previousBatchSummary || {};
const previousTokenUsage = updateContext.previousTokenUsage || {};
const baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;
const baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;
const stories = Array.isArray(item.allStories) ? item.allStories : [];
const coverageLedger = previousLedger.map((row, index) => ({
  ...row,
  coverageId: row.coverageId || 'STC-COV-' + String(index + 1).padStart(3, '0'),
  coverageStatus: row.coverageStatus || row.status || 'covered',
  status: row.status || row.coverageStatus || 'covered',
  action: row.action || 'reused'
}));
const covered = coverageLedger.filter(row => String(row.coverageStatus || row.status || '').toLowerCase() === 'covered').length;
const partial = coverageLedger.filter(row => /partial|review/i.test(String(row.coverageStatus || row.status || ''))).length;
const missing = coverageLedger.filter(row => /missing|unknown|gap/i.test(String(row.coverageStatus || row.status || ''))).length;
const coverageSummary = {
  ...previousSummary,
  status: missing ? 'failed' : partial ? 'warning' : 'passed',
  gateStatus: missing ? 'failed' : partial ? 'warning' : 'passed',
  total: coverageLedger.length || stories.length,
  coverageLedgerCount: coverageLedger.length || stories.length,
  covered,
  coveredCount: covered,
  partial,
  partialCount: partial,
  missing,
  missingCount: missing,
  score: coverageLedger.length ? Math.round(((covered + partial * 0.5) / coverageLedger.length) * 100) : 100,
  message: 'Existing Jira Story Test Case coverage was reused; no model generation was required.'
};
const batchSummary = {
  ...previousBatch,
  totalBatches: Number(previousBatch.totalBatches || 0),
  completedBatches: Number(previousBatch.completedBatches || 0),
  partialBatches: partial,
  missingBatches: missing,
  reusedFromPreviousUpdate: true
};
const updateSummary = {
  enabled: true,
  version: 'stc-delta-update-v1',
  documentType: 'story_test_cases',
  mode: 'update',
  deltaMode: true,
  noChangesDetected: true,
  noModelRequired: true,
  updateOfJobId: updateContext.previousJobId || null,
  sourceStoryCount: stories.length,
  reusedStoryCount: stories.length,
  createdTestCaseCount: 0,
  updatedTestCaseCount: 0,
  reusedTestCaseCount: coverageLedger.reduce((sum, row) => sum + (Number(row.generatedTestCases || row.linkedTestCases || row.testCaseCount || 0) || 0), 0),
  tokenUsage: { source: 'no_model_delta_gate', input: 0, output: 0, total: 0, estimatedCostUsd: 0 },
  previousTokenUsage,
  tokenSavings: {
    estimatedBaselineTokens: baselineTokens || null,
    estimatedTokensSaved: baselineTokens,
    estimatedBaselineCostUsd: baselineCost || null,
    estimatedCostSavedUsd: baselineCost,
    estimatedSavingsPercent: baselineTokens ? 100 : null
  },
  message: 'Existing Jira Story Test Cases already cover the current stories. Q-Ops reused the previous coverage without invoking the Story Test Case model.'
};
return [{ json: {
  documentType: 'story_test_cases',
  jobId: item.jobId,
  projectId: item.projectId,
  projectName: item.projectName,
  generationMode: 'update',
  updateContext,
  updateOfJobId: updateContext.previousJobId || null,
  retryOfJobId: item.retryOfJobId || null,
  sourceUserStoryJobId: item.storySourceJobId || null,
  stories,
  testCases: [],
  mappings: [],
  categoryDistribution: {},
  coverageSummary,
  batchSummary,
  coverageLedger,
  qualityGate: { passed: !missing, status: coverageSummary.gateStatus, coverageSummary, coverageLedger, batchSummary, updateSummary },
  jira: { projectKey: item.jiraProjectKey, created: 0, updated: 0, reused: updateSummary.reusedTestCaseCount },
  updateSummary,
  wordCount: 0,
  tokensInput: 0,
  tokensOutput: 0,
  tokensTotal: 0,
  estimatedCostUsd: 0
} }];`;

function patchProfessionalQueue(nodes) {
  requireNode(nodes, 'Prepare Professional Queue Request').parameters.jsCode = professionalQueueCode;
  compileCodeNodes(nodes, ['Prepare Professional Queue Request']);
}

function patchStoryQueue(nodes) {
  requireNode(nodes, 'Prepare Story Test Case Queue Request').parameters.jsCode = storyQueueCode;
  requireNode(nodes, 'Persist Story Test Case Job').parameters.jsonBody = '={{ JSON.stringify({ job_id: $json.jobId, status: "pending", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, retry_of_job_id: $json.retryOfJobId || null }) }}';
  compileCodeNodes(nodes, ['Prepare Story Test Case Queue Request']);
}

function patchBacklogWorkflow(nodes, connections) {
  ensureCodeNode(nodes, 'Backlog Delta Gate', [1040, 112], backlogDeltaGateCode);
  ensureIfNode(nodes, 'Backlog Delta No Model?', [1264, 112], '={{ Boolean($json.backlogDeltaDecision?.noModelRequired) }}');
  ensureCodeNode(nodes, 'Build Backlog No-Model Result', [1504, -96], backlogNoModelCode);

  connect(connections, 'Build Live Update Context', [[{ node: 'Professional Prompt Library', type: 'main', index: 0 }]]);
  connect(connections, 'Professional Prompt Library', [[{ node: 'Backlog Delta Gate', type: 'main', index: 0 }]]);
  connect(connections, 'Backlog Delta Gate', [[{ node: 'Backlog Delta No Model?', type: 'main', index: 0 }]]);
  connect(connections, 'Backlog Delta No Model?', [
    [{ node: 'Build Backlog No-Model Result', type: 'main', index: 0 }],
    [{ node: 'Professional QA Backlog Generator', type: 'main', index: 0 }],
  ]);
  connect(connections, 'Build Backlog No-Model Result', [[{ node: 'Validate Team Managed Backlog', type: 'main', index: 0 }]]);

  const ret = requireNode(nodes, 'Return Team Managed Professional Result');
  let code = ret.parameters.jsCode;
  if (!code.includes('updateSummary: root.generated?.document?.updateSummary || root.updateSummary || null, tokenSavings')) {
    code = code.replace(
      'generationMode: root.generationMode || \'create\', updateContext: root.updateContext || null, updateSummary: root.generated?.document?.updateSummary || root.updateSummary || null',
      'generationMode: root.generationMode || \'create\', updateContext: root.updateContext || null, updateSummary: root.generated?.document?.updateSummary || root.updateSummary || null, tokenSavings: (root.generated?.document?.updateSummary || root.updateSummary || null)?.tokenSavings || null'
    );
    ret.parameters.jsCode = code;
  }
  compileCodeNodes(nodes, ['Backlog Delta Gate', 'Build Backlog No-Model Result', 'Return Team Managed Professional Result']);
}

function patchStoryGenerator(nodes, connections) {
  ensureCodeNode(nodes, 'Build Story Test Case Delta Targets', [896, -112], stcDeltaTargetsCode);
  ensureIfNode(nodes, 'Story Test Case Delta Has No Work?', [1120, -112], '={{ Boolean($json.noWork) }}');
  ensureCodeNode(nodes, 'Build Story Test Case No-Change Result', [1344, -272], stcNoChangeCode);

  connect(connections, 'Build Story Source Items', [[{ node: 'Build Story Test Case Delta Targets', type: 'main', index: 0 }]]);
  connect(connections, 'Build Story Test Case Delta Targets', [[{ node: 'Story Test Case Delta Has No Work?', type: 'main', index: 0 }]]);
  connect(connections, 'Story Test Case Delta Has No Work?', [
    [{ node: 'Build Story Test Case No-Change Result', type: 'main', index: 0 }],
    [{ node: 'Fetch Jira Story Issue', type: 'main', index: 0 }],
  ]);
  connect(connections, 'Build Story Test Case No-Change Result', [[{ node: 'Build Direct Story Test Case Completion Output', type: 'main', index: 0 }]]);

  const finalize = requireNode(nodes, 'Finalize Story Test Case Result');
  let code = finalize.parameters.jsCode;
  if (!code.includes('previousLedgerByStory')) {
    code = code.replace(
      'function buildCoverage(sourceStories, plannedBatches, metricStories, stories, testCases, mappings) {',
      `function buildCoverage(sourceStories, plannedBatches, metricStories, stories, testCases, mappings) {
  const firstMetric = metricStories[0] || sourceStories[0] || {};
  const updateContext = firstMetric.updateContext && typeof firstMetric.updateContext === 'object' ? firstMetric.updateContext : {};
  const generationMode = String(firstMetric.generationMode || '').toLowerCase();
  const previousLedgerByStory = new Map((Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [])
    .map(row => [String(row.storyKey || row.sourceStoryKey || '').trim(), row])
    .filter(([key]) => key));`
    );
    code = code.replace(
      `const generated = story.testCases.length;
    const planned = story.planned || generated;`,
      `const generated = story.testCases.length;
    const previousRow = previousLedgerByStory.get(story.storyKey);
    const previousGenerated = Number(previousRow?.generatedTestCases || previousRow?.linkedTestCases || previousRow?.testCaseCount || 0) || 0;
    const planned = story.planned || generated || previousGenerated;`
    );
    code = code.replace(
      `const missingCategories = plannedCategories.filter(category => !generatedCategories.includes(category));`,
      `const previousStatus = String(previousRow?.coverageStatus || previousRow?.status || '').toLowerCase();
    const previousWasCovered = generationMode === 'update' && previousRow && previousStatus === 'covered' && !generated;
    const missingCategories = previousWasCovered ? [] : plannedCategories.filter(category => !generatedCategories.includes(category));`
    );
    code = code.replace(
      `const coverageStatus = !generated
      ? 'missing'
      : (planned && generated < planned) || missingCategories.length
        ? 'partial'
        : 'covered';`,
      `const coverageStatus = previousWasCovered
      ? 'covered'
      : !generated
        ? 'missing'
        : (planned && generated < planned) || missingCategories.length
          ? 'partial'
          : 'covered';`
    );
    code = code.replace(
      `generatedTestCases: generated,`,
      `generatedTestCases: generated || previousGenerated,
      reusedFromPreviousCoverage: Boolean(previousWasCovered),`
    );
    finalize.parameters.jsCode = code;
  }

  const completion = requireNode(nodes, 'Build Direct Story Test Case Completion Output');
  let completionCode = completion.parameters.jsCode;
  if (!completionCode.includes('updateSummary: result.updateSummary')) {
    completionCode = completionCode.replace(
      'qualityGate: result.qualityGate || null,',
      'qualityGate: result.qualityGate || null,\n  updateSummary: result.updateSummary || result.qualityGate?.updateSummary || null,\n  tokenSavings: (result.updateSummary || result.qualityGate?.updateSummary || null)?.tokenSavings || null,'
    );
    completion.parameters.jsCode = completionCode;
  }

  compileCodeNodes(nodes, [
    'Build Story Test Case Delta Targets',
    'Build Story Test Case No-Change Result',
    'Finalize Story Test Case Result',
    'Build Direct Story Test Case Completion Output',
  ]);
}

function patchRetrievalWorkflow(nodes) {
  const model = requireNode(nodes, 'OpenAI Chat Model');
  const maxTokens = model.parameters.options.maxTokens;
  if (typeof maxTokens === 'string') {
    model.parameters.options.maxTokens = maxTokens
      .replace("['test_strategy','test_plan','risk_matrix'].includes(type)", "['test_strategy','test_plan','risk_matrix','traceability_matrix'].includes(type)")
      .replace("const isSharedUpdate =", "const isSharedUpdate =");
  }

  const quality = requireNode(nodes, 'Quality Gate');
  let code = quality.parameters.jsCode;
  if (!code.includes('function enrichRtmUpdateSummaryWithTokenSavings')) {
    code = code.replace(
      'const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);',
      `function enrichRtmUpdateSummaryWithTokenSavings(summary, data, updateContext) {
  if (!summary || summary.documentType !== 'traceability_matrix') return summary;
  const previousTokenUsage = updateContext?.previousTokenUsage || {};
  const previousTokensTotal = Number(previousTokenUsage.total ?? previousTokenUsage.tokensTotal ?? updateContext?.previousTokensTotal ?? 0) || 0;
  const currentTokensTotal = Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0));
  const previousCostUsd = Number(previousTokenUsage.estimatedCostUsd ?? previousTokenUsage.estimated_cost_usd ?? 0) || 0;
  const currentCostUsd = Number(data.estimatedCostUsd) || 0;
  const estimatedTokensSaved = previousTokensTotal ? Math.max(0, previousTokensTotal - currentTokensTotal) : 0;
  const estimatedCostSavedUsd = previousCostUsd ? Math.max(0, previousCostUsd - currentCostUsd) : 0;
  const estimatedSavingsPercent = previousTokensTotal ? Math.round((estimatedTokensSaved / previousTokensTotal) * 100) : null;
  return {
    ...summary,
    deltaMode: summary.mode === 'update',
    tokenUsage: {
      source: data.tokenUsage?.source || 'estimated',
      input: Number(data.tokensInput) || 0,
      output: Number(data.tokensOutput) || 0,
      total: currentTokensTotal,
      estimatedCostUsd: currentCostUsd
    },
    previousTokenUsage,
    tokenSavings: {
      estimatedBaselineTokens: previousTokensTotal || null,
      estimatedTokensSaved,
      estimatedBaselineCostUsd: previousCostUsd || null,
      estimatedCostSavedUsd,
      estimatedSavingsPercent
    }
  };
}

const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);`
    );
    code = code.replace(
      'const updateSummary = normalizeUpdateSummary(sharedDeltaUpdateSummary || rtmUpdateSummary);',
      'const updateSummary = normalizeUpdateSummary(sharedDeltaUpdateSummary || enrichRtmUpdateSummaryWithTokenSavings(rtmUpdateSummary, data, updateContext));'
    );
    quality.parameters.jsCode = code;
  }
  compileCodeNodes(nodes, ['Quality Gate']);
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  const results = [];
  try {
    results.push(await updateWorkflow(db, 'yPgr7mtUnL3E8QQP', 'delta_update_retry_lineage_v1', (nodes) => patchProfessionalQueue(nodes)));
    results.push(await updateWorkflow(db, '8nuhDEewnnunXSbF', 'stc_retry_lineage_v1', (nodes) => patchStoryQueue(nodes)));
    results.push(await updateWorkflow(db, 'Vwc6c8ehsRTF8svG', 'backlog_delta_gate_v1', patchBacklogWorkflow));
    results.push(await updateWorkflow(db, 'SG7khcKlhHst48WH', 'stc_delta_gate_v1', patchStoryGenerator));
    results.push(await updateWorkflow(db, 'fullRetrievalD01', 'rtm_delta_savings_v1', (nodes) => patchRetrievalWorkflow(nodes)));
    console.log(JSON.stringify({ patched: results }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
