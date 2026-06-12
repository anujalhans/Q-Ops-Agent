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

function patchConverterNode(node) {
  let code = String(node.parameters.jsCode || '');
  const before = "    .replace(/(<\\/table>)\\s*\\|+\\s*(?=<h[1-6]\\b|$)/gi, '$1');";
  const after = "    .replace(/(<\\/table>)\\s*\\|+\\s*(?=<h[1-6]\\b|$)/gi, '$1')\n    .replace(/<h[1-6][^>]*>\\s*End of document\\.\\s*<\\/h[1-6]>\\s*$/i, '');";
  let patches = 0;
  if (code.includes(before) && !code.includes('End of document')) {
    code = code.replace(before, after);
    patches += 1;
  }
  code = code.replace(/shared-final-validation-v16/g, 'shared-final-validation-v17');
  node.parameters.jsCode = code;
  return patches;
}

function patchUpdateNode(node) {
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) throw new Error('body.storage.value parameter not found.');

  let value = String(target.value || '');
  let patches = 0;

  const insertAfter = "  const baseSections = new Map(existingParts.sections);\n";
  const helper = String.raw`  if (type === 'risk_matrix' && !baseSections.has(sectionKey('Executive Summary'))) {
    const previousSummary = q.updateContext?.previousBatchSummary || updateSummary.batchSummary || q.batchSummary || {};
    const covered = Number(previousSummary.covered || q.coverageSummary?.coveredCount || 0);
    const review = Number(previousSummary.review || q.coverageSummary?.partialCount || q.coverageSummary?.uncoveredCount || 0);
    const summaryText = [
      'This Risk Matrix was selectively refreshed from the latest AstraCart project evidence and preserves stable risk governance context from the existing Confluence page.',
      'The update keeps the risk register, detailed risks, heat map, prioritization rationale, test-strategy linkage, and coverage ledger aligned to the current E2E scope.',
      covered || review ? ('Current coverage review indicates ' + covered + ' covered item(s) and ' + review + ' item(s) needing QA or business review before final sign-off.') : 'Coverage status should be reviewed in the Coverage Ledger before final sign-off.'
    ].join(' ');
    baseSections.set(sectionKey('Executive Summary'), {
      name: 'Executive Summary',
      html: '<h1>Executive Summary</h1><p>' + escapeHtml(summaryText) + '</p>'
    });
  }
`;

  if (value.includes(insertAfter) && !value.includes('This Risk Matrix was selectively refreshed')) {
    value = value.replace(insertAfter, insertAfter + helper);
    patches += 1;
  }

  target.value = value;
  return patches;
}

function patchNodes(nodes) {
  const converter = nodes.find((node) => node.name === 'Convert MD -> Confluence Formatted HTML');
  const updater = nodes.find((node) => node.name === 'Update existing Document on Confluence');
  if (!converter) throw new Error('Convert MD -> Confluence Formatted HTML node not found.');
  if (!updater) throw new Error('Update existing Document on Confluence node not found.');
  return {
    converterPatches: patchConverterNode(converter),
    updatePatches: patchUpdateNode(updater),
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_risk_matrix_update_executive_summary_v17_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);

    if (entityPatches.updatePatches < 1 || historyPatches.updatePatches < 1) {
      throw new Error(`Update patch incomplete: ${JSON.stringify({ entityPatches, historyPatches })}`);
    }

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
