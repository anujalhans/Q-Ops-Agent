const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'yPgr7mtUnL3E8QQP';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_queue_prereq_execute_once_v1';
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
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Required node not found: ${name}`);
  return node;
}

function enableSingleExecution(node) {
  node.executeOnce = true;
  node.retryOnFail = true;
  node.maxTries = 3;
  node.waitBetweenTries = 5000;
}

function compileCodeNode(node) {
  if (node.parameters?.jsCode) new Function(node.parameters.jsCode);
}

function patchWorkflow(row) {
  const nodes = JSON.parse(row.nodes);
  const connections = JSON.parse(row.connections);
  const patched = [];

  for (const name of [
    'Fetch RTM Prerequisite Jobs',
    'Fetch RTM Completed Ingestion Jobs',
    'Fetch RTM Story Testcase Links',
  ]) {
    const node = requireNode(nodes, name);
    enableSingleExecution(node);
    patched.push(name);
  }

  const buildContext = requireNode(nodes, 'Build RTM Traceability Context');
  buildContext.executeOnce = true;
  compileCodeNode(buildContext);
  patched.push('Build RTM Traceability Context');

  return { nodes, connections, patched };
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const patched = patchWorkflow(row);
    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(patched.nodes);
    const connectionsJson = JSON.stringify(patched.connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, patched: patched.patched, backupPath }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
