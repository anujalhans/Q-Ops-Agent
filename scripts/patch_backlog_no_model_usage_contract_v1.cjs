const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function stamp() {
  const date = new Date();
  const pad = value => String(value).padStart(2, '0');
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
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function requireCodeNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${name}`);
  return node;
}

function patchGeneratorReturn(code) {
  if (code.includes('const noModelTokenUsage = root.generated?.document?.updateSummary?.tokenUsage?.source ===')) {
    return { code, changed: false };
  }
  const marker = `const coverageSummary = summarizeCoverageLedger(coverageLedger);
const tokenUsage = {`;
  if (!code.includes(marker)) throw new Error('Generator return tokenUsage marker not found');
  code = code.replace(marker, `const coverageSummary = summarizeCoverageLedger(coverageLedger);
const noModelTokenUsage = root.generated?.document?.updateSummary?.tokenUsage?.source === 'no_model_delta_gate'
  ? root.generated.document.updateSummary.tokenUsage
  : null;
const tokenUsage = {`);
  code = code.replace(
    "source: root.tokenUsage?.source || root.qualityGate?.tokenUsage?.source || root.generated?.document?.updateSummary?.tokenUsage?.source || 'estimated',",
    "source: noModelTokenUsage?.source || root.tokenUsage?.source || root.qualityGate?.tokenUsage?.source || root.generated?.document?.updateSummary?.tokenUsage?.source || 'estimated',"
  );
  code = code.replace(
    "input: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,",
    "input: Number(noModelTokenUsage?.input ?? root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,"
  );
  code = code.replace(
    "output: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,",
    "output: Number(noModelTokenUsage?.output ?? root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,"
  );
  code = code.replace(
    "total: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,",
    "total: Number(noModelTokenUsage?.total ?? root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,"
  );
  code = code.replace(
    "tokensInput: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,",
    "tokensInput: Number(noModelTokenUsage?.input ?? root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,"
  );
  code = code.replace(
    "tokensOutput: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,",
    "tokensOutput: Number(noModelTokenUsage?.output ?? root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,"
  );
  code = code.replace(
    "tokensTotal: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,",
    "tokensTotal: Number(noModelTokenUsage?.total ?? root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,"
  );
  code = code.replace(
    "estimatedCostUsd: Number(root.estimatedCostUsd ?? root.tokenUsage?.estimatedCostUsd ?? root.qualityGate?.estimatedCostUsd ?? 0) || 0,",
    "estimatedCostUsd: Number(noModelTokenUsage?.estimatedCostUsd ?? root.estimatedCostUsd ?? root.tokenUsage?.estimatedCostUsd ?? root.qualityGate?.estimatedCostUsd ?? 0) || 0,"
  );
  return { code, changed: true };
}

function patchWorkerCompletion(code) {
  if (code.includes('const noModelTokenUsage = result.updateSummary?.tokenUsage?.source ===')) {
    return { code, changed: false };
  }
  const marker = `const preservedStories = generationMode === 'update'
  ? normalizeActionItems(previousStories, 'story', 'reused')
  : normalizeActionItems(currentStories.filter(item => actionOf(item) === 'reused'), 'story', 'reused');

const tokenUsage = {`;
  if (!code.includes(marker)) throw new Error('Worker completion tokenUsage marker not found');
  code = code.replace(marker, `const preservedStories = generationMode === 'update'
  ? normalizeActionItems(previousStories, 'story', 'reused')
  : normalizeActionItems(currentStories.filter(item => actionOf(item) === 'reused'), 'story', 'reused');

const noModelTokenUsage = result.updateSummary?.tokenUsage?.source === 'no_model_delta_gate'
  ? result.updateSummary.tokenUsage
  : null;
const tokenUsage = {`);
  code = code.replace(
    "source: result.tokenUsage?.source || 'estimated',",
    "source: noModelTokenUsage?.source || result.tokenUsage?.source || 'estimated',"
  );
  code = code.replace(
    "input: Number(result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,",
    "input: Number(noModelTokenUsage?.input ?? result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,"
  );
  code = code.replace(
    "output: Number(result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,",
    "output: Number(noModelTokenUsage?.output ?? result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,"
  );
  code = code.replace(
    "total: Number(result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,",
    "total: Number(noModelTokenUsage?.total ?? result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,"
  );
  code = code.replace(
    "tokensInput: Number(result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,",
    "tokensInput: Number(noModelTokenUsage?.input ?? result.tokenUsage?.input ?? result.tokenUsage?.tokensInput ?? result.tokensInput ?? 0) || 0,"
  );
  code = code.replace(
    "tokensOutput: Number(result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,",
    "tokensOutput: Number(noModelTokenUsage?.output ?? result.tokenUsage?.output ?? result.tokenUsage?.tokensOutput ?? result.tokensOutput ?? 0) || 0,"
  );
  code = code.replace(
    "tokensTotal: Number(result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,",
    "tokensTotal: Number(noModelTokenUsage?.total ?? result.tokenUsage?.total ?? result.tokenUsage?.tokensTotal ?? result.tokensTotal ?? 0) || 0,"
  );
  code = code.replace(
    "estimatedCostUsd: Number(result.tokenUsage?.estimatedCostUsd ?? result.estimatedCostUsd ?? 0) || 0,",
    "estimatedCostUsd: Number(noModelTokenUsage?.estimatedCostUsd ?? result.tokenUsage?.estimatedCostUsd ?? result.estimatedCostUsd ?? 0) || 0,"
  );
  return { code, changed: true };
}

async function patchWorkflow(db, workflowId, nodeName, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  const nodes = parse(row.nodes);
  const connections = parse(row.connections) || {};
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_no_model_usage_contract_v1_${stamp()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));

  const node = requireCodeNode(nodes, nodeName);
  const patch = patcher(node.parameters.jsCode);
  node.parameters.jsCode = patch.code;

  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
    JSON.stringify(nodes),
    JSON.stringify(connections),
    now,
    workflowId,
  ]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      now,
      workflowId,
      row.activeVersionId,
    ]);
  }

  return { workflowId, workflowName: row.name, nodeName, backupPath, changed: patch.changed };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const results = [];
    results.push(await patchWorkflow(db, 'Vwc6c8ehsRTF8svG', 'Return Team Managed Professional Result', patchGeneratorReturn));
    results.push(await patchWorkflow(db, 'QApRBFSaJgINsdHN', 'Build Backlog Completion Output', patchWorkerCompletion));
    console.log(JSON.stringify({ results }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
