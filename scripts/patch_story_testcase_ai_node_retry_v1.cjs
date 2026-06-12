const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
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

function enableRetry(node, maxTries, waitBetweenTries) {
  node.retryOnFail = true;
  node.maxTries = maxTries;
  node.waitBetweenTries = waitBetweenTries;
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_stc_ai_node_retry_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const targets = [
      { name: 'Story Test Case Generator', maxTries: 3, waitBetweenTries: 10000 },
      { name: 'OpenAI Chat Model', maxTries: 3, waitBetweenTries: 10000 },
      { name: 'Story Test Case Batch Generator', maxTries: 4, waitBetweenTries: 15000 },
      { name: 'OpenAI Chat Model - Batch', maxTries: 4, waitBetweenTries: 15000 },
      { name: 'Story Test Case Batch Retry Generator', maxTries: 4, waitBetweenTries: 15000 },
      { name: 'OpenAI Chat Model - Batch Retry', maxTries: 4, waitBetweenTries: 15000 },
    ];

    for (const target of targets) {
      enableRetry(requireNode(nodes, target.name), target.maxTries, target.waitBetweenTries);
    }

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [nodesJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      ok: true,
      workflowId,
      workflowName: row.name,
      patchedNodes: targets,
      backupPath,
      updatedAt: now,
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
