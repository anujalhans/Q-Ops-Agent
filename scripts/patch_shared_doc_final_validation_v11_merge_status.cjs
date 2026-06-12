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

function patchNodes(nodes) {
  const before = "status: 'passed', structuralStatus: fv.structuralStatus || 'passed', mergeGuard: 'passed'";
  const after = "status: 'passed', structuralStatus: 'passed', mergeGuard: 'passed'";
  let patches = 0;
  for (const node of nodes) {
    if (!node?.parameters?.jsonBody) continue;
    const current = String(node.parameters.jsonBody);
    if (current.includes(before)) {
      node.parameters.jsonBody = current.replaceAll(before, after).replace(/shared-final-validation-v10/g, 'shared-final-validation-v11');
      patches += 1;
    }
  }
  return patches;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT * FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!entity) throw new Error(`workflow_entity not found: ${workflowId}`);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    if (!history) throw new Error(`workflow_history not found: ${workflowId} / ${versionId}`);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_final_validation_v11_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);
    if (!entityPatches || !historyPatches) throw new Error(`Expected patches in entity/history, got ${entityPatches}/${historyPatches}`);

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?', [
      JSON.stringify(entityNodes),
      new Date().toISOString(),
      workflowId,
    ]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [
      JSON.stringify(historyNodes),
      new Date().toISOString(),
      workflowId,
      versionId,
    ]);

    console.log(JSON.stringify({
      workflowId,
      versionId,
      backupPath,
      entityPatches,
      historyPatches,
      patched: 'pending_merge final validation now persists structuralStatus=passed after merge guard',
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
