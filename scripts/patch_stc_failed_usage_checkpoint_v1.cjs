const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const generatorWorkflowId = 'SG7khcKlhHst48WH';
const workerWorkflowId = 'ivz13uFyjfCT8149';

const supabaseCredential = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key',
  },
};

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const found = nodes.find(node => node.name === name);
  if (!found) throw new Error(`Node not found: ${name}`);
  return found;
}

function upsertNode(nodes, node) {
  const existing = nodes.find(item => item.name === node.name);
  if (existing) {
    Object.assign(existing, node, { id: existing.id });
    return existing;
  }
  nodes.push(node);
  return node;
}

function single(nodeName) {
  return [[{ node: nodeName, type: 'main', index: 0 }]];
}

function setConnection(connections, from, outputs) {
  connections[from] = { main: outputs };
}

function makeCodeNode(name, position, jsCode) {
  return {
    parameters: { jsCode },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    id: crypto.randomUUID(),
    name,
  };
}

function makeHttpNode(name, position, parameters, extra = {}) {
  return {
    parameters,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position,
    id: crypto.randomUUID(),
    name,
    credentials: supabaseCredential,
    ...extra,
  };
}

const buildUsageCheckpointCode = String.raw`const items = $input.all().map(item => item.json || {});
if (!items.length) return [];

const first = items[0] || {};
const stories = items.map(item => ({
  storyKey: item.storyKey,
  storyId: item.storyId || null,
  storySummary: item.storySummary || item.storyKey,
  plannedTestCaseCount: Number(item.plannedTestCaseCount || item.testCaseCount || 0) || 0,
  generatedTestCaseCount: Array.isArray(item.parsed?.testCases) ? item.parsed.testCases.length : Number(item.testCaseCount || 0) || 0,
  categoryDistribution: item.categoryDistribution || {},
})).filter(item => item.storyKey);

const wordCount = items.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = items.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = items.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(items.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const tokensTotal = tokensInput + tokensOutput;
const tokenUsage = {
  source: 'story_testcase_generation_checkpoint',
  stage: 'pre_jira_publish',
  model: first.generationModel || null,
  input: tokensInput,
  output: tokensOutput,
  total: tokensTotal,
  tokensInput,
  tokensOutput,
  tokensTotal,
  estimatedCostUsd,
};
const usageCheckpoint = {
  version: 'stc-failed-usage-checkpoint-v1',
  stage: 'pre_jira_publish',
  capturedAt: new Date().toISOString(),
  storyCount: stories.length,
  plannedTestCaseCount: stories.reduce((sum, story) => sum + story.plannedTestCaseCount, 0),
  generatedTestCaseCount: stories.reduce((sum, story) => sum + story.generatedTestCaseCount, 0),
  wordCount,
  tokensInput,
  tokensOutput,
  tokensTotal,
  estimatedCostUsd,
  tokenUsage,
  stories,
};

return items.map(item => ({ json: { ...item, usageCheckpoint, tokenUsage, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd } }));`;

const persistUsageCheckpointJsonBody = String.raw`={{ JSON.stringify({ output: { documentType: "story_test_cases", destination: { type: "jira_test_cases", projectId: $json.projectId || null }, checkpoint: "story_testcase_generation_complete_pre_publish", usageCheckpoint: $json.usageCheckpoint, tokenUsage: $json.tokenUsage, wordCount: $json.wordCount || 0, tokensInput: $json.tokensInput || 0, tokensOutput: $json.tokensOutput || 0, tokensTotal: $json.tokensTotal || 0, estimatedCostUsd: $json.estimatedCostUsd || 0, generationMode: $json.generationMode || null, updateOfJobId: $json.updateContext?.previousJobId || null, retryOfJobId: $json.retryOfJobId || null, sourceUserStoryJobId: $json.storySourceJobId || null, failedUsageAvailable: true }, updated_at: $now.toISO() }) }}`;

const restoreUsageCheckpointItemsCode = String.raw`return $('Build Story Test Case Usage Checkpoint').all().map(item => ({ json: item.json || {} }));`;

function patchGenerator(nodes, connections) {
  requireNode(nodes, 'Merge Story Test Case Batches');
  requireNode(nodes, 'Expand Story Test Case Items');

  upsertNode(nodes, makeCodeNode('Build Story Test Case Usage Checkpoint', [3632, 112], buildUsageCheckpointCode));
  upsertNode(nodes, makeHttpNode('Persist Story Test Case Usage Checkpoint', [3824, 112], {
    method: 'PATCH',
    url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.processing',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpCustomAuth',
    sendHeaders: true,
    specifyHeaders: 'json',
    jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=minimal" }',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: persistUsageCheckpointJsonBody,
    options: {},
  }, { executeOnce: true }));
  upsertNode(nodes, makeCodeNode('Restore Story Test Case Usage Checkpoint Items', [4000, 112], restoreUsageCheckpointItemsCode));

  setConnection(connections, 'Merge Story Test Case Batches', single('Build Story Test Case Usage Checkpoint'));
  setConnection(connections, 'Build Story Test Case Usage Checkpoint', single('Persist Story Test Case Usage Checkpoint'));
  setConnection(connections, 'Persist Story Test Case Usage Checkpoint', single('Restore Story Test Case Usage Checkpoint Items'));
  setConnection(connections, 'Restore Story Test Case Usage Checkpoint Items', single('Expand Story Test Case Items'));

  return {
    workflowId: generatorWorkflowId,
    addedOrUpdatedNodes: [
      'Build Story Test Case Usage Checkpoint',
      'Persist Story Test Case Usage Checkpoint',
      'Restore Story Test Case Usage Checkpoint Items',
    ],
  };
}

const mergeFailureUsageCode = String.raw`const failure = $('Build Story Test Case Failure Output').first().json || {};
const row = Array.isArray($json) ? ($json[0] || {}) : ($json || {});
const persisted = row.output || {};
const persistedUsage = persisted.tokenUsage || persisted.usageCheckpoint?.tokenUsage || {};

function numberFrom(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
  }
  return 0;
}

const tokensInput = numberFrom(persisted.tokensInput, persistedUsage.tokensInput, persistedUsage.input);
const tokensOutput = numberFrom(persisted.tokensOutput, persistedUsage.tokensOutput, persistedUsage.output);
const tokensTotal = numberFrom(persisted.tokensTotal, persistedUsage.tokensTotal, persistedUsage.total, tokensInput + tokensOutput);
const estimatedCostUsd = numberFrom(persisted.estimatedCostUsd, persistedUsage.estimatedCostUsd, persistedUsage.estimated_cost_usd);
const wordCount = numberFrom(persisted.wordCount, persisted.usageCheckpoint?.wordCount);
const tokenUsage = tokensTotal ? {
  source: persistedUsage.source || 'story_testcase_generation_checkpoint',
  stage: persistedUsage.stage || persisted.usageCheckpoint?.stage || 'pre_jira_publish',
  model: persistedUsage.model || failure.generationModel || null,
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
    ...failure,
    wordCount,
    tokensInput,
    tokensOutput,
    tokensTotal,
    estimatedCostUsd,
    tokenUsage,
    output: {
      ...(failure.output || {}),
      wordCount,
      tokensInput,
      tokensOutput,
      tokensTotal,
      estimatedCostUsd,
      tokenUsage,
      usageCheckpoint: persisted.usageCheckpoint || null,
      failedUsageAvailable: Boolean(tokensTotal),
      failedAfterUsageCheckpoint: Boolean(tokensTotal),
    },
  },
}];`;

const logFailedJsonBody = String.raw`={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: "generation", event: "JOB_FAILED", status: "error", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.wordCount || $json.output?.wordCount || 0, tokens_input: $json.tokensInput || $json.output?.tokensInput || 0, tokens_output: $json.tokensOutput || $json.output?.tokensOutput || 0, tokens_total: $json.tokensTotal || $json.output?.tokensTotal || 0, estimated_cost_usd: $json.estimatedCostUsd || $json.output?.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", error_type: "STORY_TEST_CASES_FAILED", settings_version: $json.settingsVersion, failed_after_usage_checkpoint: Boolean($json.failedAfterUsageCheckpoint || $json.output?.failedAfterUsageCheckpoint), token_usage: $json.tokenUsage || $json.output?.tokenUsage || null, usage_checkpoint_stage: $json.output?.usageCheckpoint?.stage || null } }) }}`;

function patchWorker(nodes, connections) {
  requireNode(nodes, 'Build Story Test Case Failure Output');
  const logFailed = requireNode(nodes, 'LOG: Story Test Case Job Failed');
  const restoreFailure = requireNode(nodes, 'Restore Story Test Case Failure');

  upsertNode(nodes, makeHttpNode('Fetch Story Test Case Usage Checkpoint', [2144, 192], {
    method: 'GET',
    url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&select=output',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpCustomAuth',
    sendHeaders: true,
    specifyHeaders: 'json',
    jsonHeaders: '{ "Content-Type": "application/json" }',
    options: {},
  }, { alwaysOutputData: true }));
  upsertNode(nodes, makeCodeNode('Merge Story Test Case Failure Usage', [2320, 192], mergeFailureUsageCode));

  logFailed.parameters = logFailed.parameters || {};
  logFailed.parameters.jsonBody = logFailedJsonBody;
  restoreFailure.parameters = restoreFailure.parameters || {};
  restoreFailure.parameters.jsCode = 'return [{ json: $("Merge Story Test Case Failure Usage").first().json }];';

  setConnection(connections, 'Build Story Test Case Failure Output', single('Fetch Story Test Case Usage Checkpoint'));
  setConnection(connections, 'Fetch Story Test Case Usage Checkpoint', single('Merge Story Test Case Failure Usage'));
  setConnection(connections, 'Merge Story Test Case Failure Usage', single('LOG: Story Test Case Job Failed'));
  setConnection(connections, 'LOG: Story Test Case Job Failed', single('Restore Story Test Case Failure'));
  setConnection(connections, 'Restore Story Test Case Failure', single('Mark Story Test Case Job Failed'));

  return {
    workflowId: workerWorkflowId,
    addedOrUpdatedNodes: [
      'Fetch Story Test Case Usage Checkpoint',
      'Merge Story Test Case Failure Usage',
      'LOG: Story Test Case Job Failed',
      'Restore Story Test Case Failure',
    ],
  };
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
  const summary = patcher(nodes, connections);
  const now = new Date().toISOString();
  const nodesJson = JSON.stringify(nodes);
  const connectionsJson = JSON.stringify(connections);

  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
  }

  return {
    ...summary,
    workflowName: row.name,
    backupPath,
    updatedAt: now,
  };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const results = [];
    results.push(await updateWorkflow(db, generatorWorkflowId, 'stc_failed_usage_checkpoint_v1', patchGenerator));
    results.push(await updateWorkflow(db, workerWorkflowId, 'stc_failed_usage_checkpoint_v1', patchWorker));
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
