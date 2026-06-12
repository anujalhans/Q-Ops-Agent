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
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => {
    error ? reject(error) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function replaceOnce(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(from, to);
}

function patchUpdateConfluenceNode(node) {
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) throw new Error('Update existing Document on Confluence body.storage.value not found');
  let value = String(target.value || '');

  value = replaceOnce(
    value,
    `  const mergedLedgerHtml = mergedCoverageLedgerHtml();
  for (const [key, patchSection] of patchParts.sections.entries()) {`,
    `  const mergedLedgerHtml = mergedCoverageLedgerHtml();
  if (mergedLedgerHtml) {
    baseSections.set(coverageLedgerKey, { name: 'Coverage Ledger', html: mergedLedgerHtml });
  }
  for (const [key, patchSection] of patchParts.sections.entries()) {`,
    'always apply merged coverage ledger before no-change body selection'
  );

  value = replaceOnce(
    value,
    `  } else if (noChanges && cleanedExisting) {
    body = cleanedExisting;`,
    `  } else if (noChanges && cleanedExisting && !mergedLedgerHtml) {
    body = cleanedExisting;`,
    'route no-change updates with merged coverage through section rebuild'
  );

  target.value = value;
  return 2;
}

function patchNodes(nodes) {
  return {
    updateExistingDocumentOnConfluence: patchUpdateConfluenceNode(requireNode(nodes, 'Update existing Document on Confluence')),
  };
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_update_integrity_v3_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [
      JSON.stringify(entityNodes),
      workflowId,
    ]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, updatedAt = CURRENT_TIMESTAMP WHERE workflowId = ? AND versionId = ?', [
      JSON.stringify(historyNodes),
      workflowId,
      versionId,
    ]);

    console.log(JSON.stringify({
      ok: true,
      backupPath,
      versionId,
      entityPatches,
      historyPatches,
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
