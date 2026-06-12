const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const label = 'backlog_standard_token_usage_v1';
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

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = row.connections ? JSON.parse(row.connections) : {};
    const returnNode = requireNode(nodes, 'Return Team Managed Professional Result');
    let code = returnNode.parameters.jsCode;

    if (!code.includes('const tokenUsage = {')) {
      const anchor = "const confluenceUrl = webui ? baseClean + webui : null;\n";
      const tokenUsageBlock = `${anchor}const tokenUsage = {
  source: root.tokenUsage?.source || root.qualityGate?.tokenUsage?.source || root.generated?.document?.updateSummary?.tokenUsage?.source || 'estimated',
  input: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,
  output: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,
  total: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,
  tokensInput: Number(root.tokensInput ?? root.tokenUsage?.input ?? root.tokenUsage?.tokensInput ?? root.qualityGate?.tokensInput ?? 0) || 0,
  tokensOutput: Number(root.tokensOutput ?? root.tokenUsage?.output ?? root.tokenUsage?.tokensOutput ?? root.qualityGate?.tokensOutput ?? 0) || 0,
  tokensTotal: Number(root.tokensTotal ?? root.tokenUsage?.total ?? root.tokenUsage?.tokensTotal ?? root.qualityGate?.tokensTotal ?? 0) || 0,
  estimatedCostUsd: Number(root.estimatedCostUsd ?? root.tokenUsage?.estimatedCostUsd ?? root.qualityGate?.estimatedCostUsd ?? 0) || 0
};
`;
      if (!code.includes(anchor)) throw new Error('Return node anchor not found');
      code = code.replace(anchor, tokenUsageBlock);
    }

    if (!code.includes('estimatedCostUsd: root.estimatedCostUsd, tokenUsage,')) {
      const before = 'estimatedCostUsd: root.estimatedCostUsd, epics:';
      const after = 'estimatedCostUsd: root.estimatedCostUsd, tokenUsage, epics:';
      if (!code.includes(before)) throw new Error('Return node output insertion anchor not found');
      code = code.replace(before, after);
    }

    new Function(code);
    returnNode.parameters.jsCode = code;

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      ok: true,
      workflowId,
      workflowName: row.name,
      updatedAt: now,
      backupPath,
      patchedNode: returnNode.name,
      change: 'Backlog final output now includes canonical tokenUsage while preserving legacy token aliases.',
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
