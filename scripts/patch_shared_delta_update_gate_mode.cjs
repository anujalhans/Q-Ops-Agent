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

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function replaceOnce(code, search, replacement) {
  if (!code.includes(search)) throw new Error(`Search text not found: ${search.slice(0, 160)}`);
  return code.replace(search, replacement);
}

function patchQualityGate(code) {
  code = replaceOnce(
    code,
    `const promptContext = $('Prompt Library').item.json || {};
const generationMode = String(promptContext.generationMode || '').toLowerCase() === 'update' ? 'update' : 'create';
const updateContext = (promptContext.updateContext && typeof promptContext.updateContext === 'object') ? promptContext.updateContext : {};`,
    `const promptContext = $('Prompt Library').item.json || {};
const restoreContext = $('Restore Job Context').item.json || {};
const updateContext =
  (promptContext.updateContext && typeof promptContext.updateContext === 'object') ? promptContext.updateContext :
  (restoreContext.updateContext && typeof restoreContext.updateContext === 'object') ? restoreContext.updateContext :
  (restoreContext.input?.updateContext && typeof restoreContext.input.updateContext === 'object') ? restoreContext.input.updateContext :
  {};
const generationMode = String(
  promptContext.generationMode ||
  restoreContext.generationMode ||
  restoreContext.input?.generationMode ||
  updateContext.generationMode ||
  ''
).toLowerCase() === 'update' || Boolean(updateContext.updateMode || updateContext.deltaRequested || updateContext.previousJobId)
  ? 'update'
  : 'create';`
  );

  code = replaceOnce(
    code,
    `const minWords = (generationMode === 'update' && ['test_strategy', 'test_plan', 'risk_matrix'].includes(documentType)) ? 300 : (MIN_WORD_COUNTS[documentType] || 500);`,
    `const isSharedDeltaUpdate = ['test_strategy', 'test_plan', 'risk_matrix'].includes(documentType)
  && (generationMode === 'update' || Boolean(updateContext.updateMode || updateContext.deltaRequested || updateContext.previousJobId));
const minWords = isSharedDeltaUpdate ? 300 : (MIN_WORD_COUNTS[documentType] || 500);`
  );

  new Function(code);
  return code;
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
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_delta_gate_mode_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const qualityGate = requireNode(nodes, 'Quality Gate');
    qualityGate.parameters.jsCode = patchQualityGate(qualityGate.parameters.jsCode);

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      now,
      workflowId
    ]);

    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        now,
        workflowId,
        row.activeVersionId
      ]);
    }

    console.log(JSON.stringify({
      workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      patched: [
        'Quality Gate reads generationMode from Prompt Library, Restore Job Context, and updateContext',
        'Shared Test Strategy/Test Plan/Risk Matrix delta updates use 300-word minimum even if item pairing drops Prompt Library fields'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
