const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const generatorWorkflowId = 'SG7khcKlhHst48WH';
const workerWorkflowId = 'ivz13uFyjfCT8149';
const label = 'stc_progress_checkpoints_v1';
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

function removeNode(nodes, connections, name) {
  const index = nodes.findIndex(node => node.name === name);
  if (index >= 0) nodes.splice(index, 1);
  delete connections[name];
  for (const source of Object.keys(connections)) {
    for (const outputName of Object.keys(connections[source] || {})) {
      connections[source][outputName] = (connections[source][outputName] || [])
        .map(branch => (branch || []).filter(connection => connection.node !== name));
    }
  }
}

function connect(connections, from, to) {
  connections[from] = { main: [[{ node: to, type: 'main', index: 0 }]] };
}

function expression(value) {
  return `=${value}`;
}

function makeProgressCode(stage, stageLabel, group, progressPercent, summary, position) {
  const name = `Build Story Test Case Progress - ${stageLabel}`;
  return {
    parameters: {
      jsCode: `const sourceItems = $input.all();
const rows = sourceItems.map(item => item.json || {});
const first = rows[0] || {};

function compactNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function uniqueValues(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function countByStatus(pattern) {
  const regex = new RegExp(pattern, 'i');
  return rows.filter(row => regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || ''))).length;
}

function plannedCount() {
  return rows.reduce((sum, row) => {
    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);
    if (direct) return sum + direct;
    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;
    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;
    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;
    return sum + Math.max(planned, cases, generated, 0);
  }, 0);
}

function generatedCount() {
  return rows.reduce((sum, row) => {
    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);
    if (direct) return sum + direct;
    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;
    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;
    return sum + Math.max(cases, generated, 0);
  }, 0);
}

const storyKeys = uniqueValues(rows.map(row => row.storyKey || row.issueKey || row.jiraStoryKey || row.key));
const testCaseKeys = uniqueValues(rows.map(row => row.testCaseKey || row.jiraKey || row.issueKey || row.key));
const plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();
const generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();
const output = {
  documentType: 'story_test_cases',
  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,
  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,
  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,
  progress: {
    version: 'stc-progress-v1',
    stage: ${JSON.stringify(stage)},
    stageLabel: ${JSON.stringify(stageLabel)},
    group: ${JSON.stringify(group)},
    progressPercent: ${progressPercent},
    summary: ${JSON.stringify(summary)},
    updatedAt: new Date().toISOString(),
    details: {
      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,
      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,
      storyCount: storyKeys.length || compactNumber(first.storyCount),
      plannedTestCaseCount,
      generatedTestCaseCount,
      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),
      linkedTestCaseCount: countByStatus('linked|existing'),
      createdTestCaseCount: countByStatus('created|create'),
      reusedTestCaseCount: countByStatus('reused|existing'),
      updatedTestCaseCount: countByStatus('updated|update'),
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
}));`
    },
    id: `stc-progress-code-${stage}`,
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
  };
}

function makePersistNode(stage, stageLabel, position) {
  return {
    parameters: {
      method: 'PATCH',
      url: "={{ 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.' + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + '&status=eq.processing' }}",
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expression("{{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}"),
      options: {},
    },
    id: `stc-progress-persist-${stage}`,
    name: `Persist Story Test Case Progress - ${stageLabel}`,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position,
    executeOnce: true,
    alwaysOutputData: true,
  };
}

function makeRestoreNode(stage, stageLabel, codeNodeName, position) {
  return {
    parameters: {
      jsCode: `return $('${codeNodeName}').all();`
    },
    id: `stc-progress-restore-${stage}`,
    name: `Restore Story Test Case Progress - ${stageLabel}`,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
  };
}

function insertProgressChain(nodes, connections, fromName, toName, checkpoint) {
  const fromNode = requireNode(nodes, fromName);
  requireNode(nodes, toName);

  const codeName = `Build Story Test Case Progress - ${checkpoint.label}`;
  const persistName = `Persist Story Test Case Progress - ${checkpoint.label}`;
  const restoreName = `Restore Story Test Case Progress - ${checkpoint.label}`;

  [codeName, persistName, restoreName].forEach(name => removeNode(nodes, connections, name));

  const fromPosition = Array.isArray(fromNode.position) ? fromNode.position : [0, 0];
  const codeNode = makeProgressCode(checkpoint.stage, checkpoint.label, checkpoint.group, checkpoint.percent, checkpoint.summary, [fromPosition[0] + 220, fromPosition[1] - 80]);
  const persistNode = makePersistNode(checkpoint.stage, checkpoint.label, [fromPosition[0] + 460, fromPosition[1] - 80]);
  const restoreNode = makeRestoreNode(checkpoint.stage, checkpoint.label, codeName, [fromPosition[0] + 700, fromPosition[1] - 80]);
  nodes.push(codeNode, persistNode, restoreNode);

  connect(connections, fromName, codeName);
  connect(connections, codeName, persistName);
  connect(connections, persistName, restoreName);
  connect(connections, restoreName, toName);
}

function patchUsageCheckpointOutput(nodes) {
  const buildNode = requireNode(nodes, 'Build Story Test Case Usage Checkpoint');
  let code = buildNode.parameters.jsCode || '';
  if (code.includes("stage: 'publishing_to_jira'")) return;

  const insert = `

const progress = {
  version: 'stc-progress-v1',
  stage: 'publishing_to_jira',
  stageLabel: 'Publishing to Jira',
  group: 'publishing',
  progressPercent: 66,
  summary: 'Generated test cases are checkpointed. Q-Ops is creating, reusing, or updating Jira test cases.',
  updatedAt: new Date().toISOString(),
  details: {
    sourceStoryCount: Number(root.sourceStoryCount || root.totalStories || root.allStoryCount || 0) || 0,
    selectedStoryCount: Number(root.selectedStoryCount || root.storyCount || 0) || 0,
    plannedTestCaseCount: Number(root.plannedTestCaseCount || root.expectedTestCaseCount || 0) || 0,
    generatedTestCaseCount: Number(root.generatedTestCaseCount || root.testcaseCount || root.testCaseCount || 0) || 0,
    itemCount: Array.isArray(root.testCases) ? root.testCases.length : 0,
  },
};
`;
  const returnAnchor = 'return ';
  const returnIndex = code.lastIndexOf(returnAnchor);
  if (returnIndex === -1) throw new Error('Could not locate return in Build Story Test Case Usage Checkpoint');
  code = `${code.slice(0, returnIndex)}${insert}\n${code.slice(returnIndex)}`;
  const oldReturn = "return items.map(item => ({ json: { ...item, usageCheckpoint, tokenUsage, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd } }));";
  const newReturn = "return items.map(item => ({ json: { ...item, usageCheckpoint, tokenUsage, progress, progressOutput: { documentType: 'story_test_cases', destination: { type: 'jira_test_cases', projectId: item.projectId || first.projectId || null }, checkpoint: 'story_testcase_generation_complete_pre_publish', progress, usageCheckpoint, tokenUsage, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd, generationMode: item.generationMode || first.generationMode || null, updateOfJobId: item.updateContext?.previousJobId || first.updateContext?.previousJobId || null, retryOfJobId: item.retryOfJobId || first.retryOfJobId || null, sourceUserStoryJobId: item.storySourceJobId || first.storySourceJobId || null, failedUsageAvailable: true }, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd } }));";
  if (!code.includes(oldReturn)) throw new Error('Could not locate usage checkpoint return anchor');
  code = code.replace(oldReturn, newReturn);
  new Function(code);
  buildNode.parameters.jsCode = code;

  const persistNode = requireNode(nodes, 'Persist Story Test Case Usage Checkpoint');
  persistNode.parameters.jsonBody = expression("{{ JSON.stringify({ output: $json.progressOutput || { documentType: 'story_test_cases', checkpoint: 'story_testcase_generation_complete_pre_publish', usageCheckpoint: $json.usageCheckpoint, tokenUsage: $json.tokenUsage, tokensInput: $json.tokensInput, tokensOutput: $json.tokensOutput, tokensTotal: $json.tokensTotal, estimatedCostUsd: $json.estimatedCostUsd, wordCount: $json.wordCount, failedUsageAvailable: true }, updated_at: $now.toISO() }) }}");
}

function patchWorkerLock(nodes) {
  const lockNode = requireNode(nodes, 'Lock Story Test Case Job');
  lockNode.parameters.jsonBody = expression("{{ JSON.stringify({ status: 'processing', output: { documentType: 'story_test_cases', progress: { version: 'stc-progress-v1', stage: 'preparing', stageLabel: 'Preparing request', group: 'preparing', progressPercent: 8, summary: 'Q-Ops picked up the Story Test Cases job and is preparing the source story context.', updatedAt: $now.toISO(), details: { itemCount: 1 } } }, updated_at: $now.toISO() }) }}");
}

async function loadWorkflow(db, workflowId) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  return { row, historyRow, nodes: JSON.parse(row.nodes), connections: row.connections ? JSON.parse(row.connections) : {} };
}

async function saveWorkflow(db, loaded) {
  const now = new Date().toISOString();
  const nodesJson = JSON.stringify(loaded.nodes);
  const connectionsJson = JSON.stringify(loaded.connections);
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, loaded.row.id]);
  if (loaded.historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, loaded.row.id, loaded.row.activeVersionId]);
  }
  return now;
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const generator = await loadWorkflow(db, generatorWorkflowId);
    const worker = await loadWorkflow(db, workerWorkflowId);

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `stc_progress_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      generator: { workflow_entity: generator.row, workflow_history: generator.historyRow },
      worker: { workflow_entity: worker.row, workflow_history: worker.historyRow },
    }, null, 2));

    const checkpoints = [
      {
        from: 'Build Story Test Case Delta Targets',
        to: 'Story Test Case Delta Has No Work?',
        stage: 'planning_scope',
        label: 'Planning Scope',
        group: 'preparing',
        percent: 18,
        summary: 'Q-Ops loaded Jira stories and is deciding which stories need Story Test Case coverage.',
      },
      {
        from: 'Robust Story Test Case Parser',
        to: 'Build Story Test Case Detail Batches',
        stage: 'planning_coverage',
        label: 'Planning Coverage',
        group: 'planning',
        percent: 34,
        summary: 'Q-Ops prepared story-level coverage plans and category targets.',
      },
      {
        from: 'Merge Story Test Case Batches',
        to: 'Build Story Test Case Usage Checkpoint',
        stage: 'generating_test_cases',
        label: 'Generating Test Cases',
        group: 'generating',
        percent: 56,
        summary: 'Q-Ops generated batched Jira-ready test cases and is preparing the publish checkpoint.',
      },
      {
        from: 'Recover Story Test Case Publish Checkpoint Items',
        to: 'Fetch Existing Test Case Story Links',
        stage: 'linking_traceability',
        label: 'Linking Traceability',
        group: 'publishing',
        percent: 78,
        summary: 'Q-Ops is verifying story links and reusing existing links where possible.',
      },
      {
        from: 'Upsert Story Test Case Mapping',
        to: 'Finalize Story Test Case Result',
        stage: 'finalizing_coverage',
        label: 'Finalizing Coverage',
        group: 'finalizing',
        percent: 92,
        summary: 'Q-Ops is saving traceability mappings and calculating final coverage.',
      },
    ];

    checkpoints.forEach(checkpoint => insertProgressChain(generator.nodes, generator.connections, checkpoint.from, checkpoint.to, checkpoint));
    patchUsageCheckpointOutput(generator.nodes);
    patchWorkerLock(worker.nodes);

    const generatorUpdatedAt = await saveWorkflow(db, generator);
    const workerUpdatedAt = await saveWorkflow(db, worker);

    console.log(JSON.stringify({
      ok: true,
      label,
      backupPath,
      generatorWorkflowId,
      generatorWorkflowName: generator.row.name,
      generatorUpdatedAt,
      workerWorkflowId,
      workerWorkflowName: worker.row.name,
      workerUpdatedAt,
      checkpoints: checkpoints.map(item => item.stage),
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
