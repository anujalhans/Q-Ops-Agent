const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try { return JSON.parse(value); } catch { return flatted.parse(value); }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(err) {
    err ? reject(err) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    err ? reject(err) : resolve(row);
  }));
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT id, name, nodes, connections, versionId, activeVersionId FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!entity) throw new Error(`workflow_entity not found: ${workflowId}`);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    if (!history) throw new Error(`workflow_history not found: ${workflowId} / ${versionId}`);

    const entityNodes = parseAny(entity.nodes);
    const entityText = JSON.stringify(entityNodes);
    if (!entityText.includes('shared-final-validation-v10')) {
      throw new Error('workflow_entity does not contain V10 marker');
    }
    if (entityText.includes("$('Convert MD -> Confluence Formatted HTML').item.json.finalValidation")) {
      throw new Error('workflow_entity still contains invalid future-node reference');
    }

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_history_${versionId}_before_v10_snapshot_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      workflowId,
      versionId,
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    await run(db, 'UPDATE workflow_history SET nodes = ?, connections = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [
      entity.nodes,
      entity.connections,
      new Date().toISOString(),
      workflowId,
      versionId,
    ]);

    const updated = await get(db, 'SELECT nodes FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    const updatedText = JSON.stringify(parseAny(updated.nodes));
    if (!updatedText.includes('shared-final-validation-v10')) throw new Error('workflow_history V10 marker missing after patch');
    if (updatedText.includes("$('Convert MD -> Confluence Formatted HTML').item.json.finalValidation")) {
      throw new Error('workflow_history still contains invalid future-node reference after patch');
    }

    console.log(JSON.stringify({
      workflowId,
      versionId,
      backupPath,
      patched: 'workflow_history active version snapshot now matches V10 workflow_entity nodes',
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
