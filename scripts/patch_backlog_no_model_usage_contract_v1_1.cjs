const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const nodeName = 'Return Team Managed Professional Result';
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

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;
    const nodes = parse(row.nodes);
    const connections = parse(row.connections) || {};
    const node = nodes.find(item => item.name === nodeName);
    if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${nodeName}`);

    const before = node.parameters.jsCode;
    const after = before.replace(
      "tokensOutput: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? 0) || 0,",
      "tokensOutput: Number(noModelTokenUsage?.output ?? root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? 0) || 0,"
    );
    if (after === before) {
      console.log(JSON.stringify({ workflowId, nodeName, changed: false }, null, 2));
      return;
    }

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_no_model_usage_contract_v1_1_${stamp()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));
    node.parameters.jsCode = after;

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

    console.log(JSON.stringify({ workflowId, workflowName: row.name, nodeName, backupPath, changed: true }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
