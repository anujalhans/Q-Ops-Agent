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

function replaceAll(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  const count = source.split(from).length - 1;
  return { value: source.split(from).join(to), count };
}

function patchUpdateConfluenceNode(node) {
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) throw new Error('Update existing Document on Confluence body.storage.value not found');
  let value = String(target.value || '');
  let patches = 0;

  const anchor = `    if (!['warning', 'failed', 'not_reported'].includes(status) && !warningItems.length) return '';`;
  const replacement = `    const previousCoverage = q.updateContext?.previousCoverageSummary || {};
    const previousCoveragePassed = String(previousCoverage.gateStatus || previousCoverage.status || '').toLowerCase() === 'passed'
      && (Number(previousCoverage.coverageLedgerCount || 0) > 0 || Array.isArray(q.updateContext?.previousCoverageLedger));
    if (!warningItems.length && previousCoveragePassed) return '';
    if (!['warning', 'failed', 'not_reported'].includes(status) && !warningItems.length) return '';`;
  const patch = replaceAll(value, anchor, replacement, 'suppress stale shared update coverage note');
  value = patch.value;
  patches += patch.count;

  target.value = value;
  return patches;
}

function patchCompletionBodies(nodes) {
  const nodeNames = ['Mark Job Status as Completed', 'LOG: Update Confluence Job Completed'];
  let patches = 0;
  const anchors = [
    `if (!summary || finalCoverage.source !== 'final_published_body') return summary; return { ...summary, coverageSummary: finalCoverage.summary, batchSummary: finalCoverage.batchSummary, coverageLedgerCount: finalCoverage.ledger.length };`,
    `if (!summary || finalCoverage.source !== 'final_published_body') return summary; return { ...summary, coverageSummary: finalCoverage.summary, batchSummary: finalCoverage.batchSummary, coverageLedgerCount: finalCoverage.ledger.length, needsReviewSections: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)) : summary.needsReviewSections, needsReviewSectionCount: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)).length : summary.needsReviewSectionCount };`,
  ];
  const replacement = `if (!summary) return summary;
const summaryLedgerCount = Number(summary.coverageLedgerCount || summary.coverageSummary?.coverageLedgerCount || summary.batchSummary?.total || 0) || 0;
if (!finalCoverage.ledger.length || (summaryLedgerCount > 0 && finalCoverage.source !== 'final_published_body')) return summary;
return {
  ...summary,
  coverageSummary: { ...finalCoverage.summary, carriedForwardFromPreviousUpdate: finalCoverage.source !== 'final_published_body' },
  batchSummary: finalCoverage.batchSummary,
  coverageLedgerCount: finalCoverage.ledger.length,
  needsReviewSections: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)) : summary.needsReviewSections,
  needsReviewSectionCount: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)).length : summary.needsReviewSectionCount
};`;

  for (const name of nodeNames) {
    const node = requireNode(nodes, name);
    let body = String(node.parameters.jsonBody || '');
    let patchedThisNode = 0;
    for (const anchor of anchors) {
      if (!body.includes(anchor)) continue;
      const patch = replaceAll(body, anchor, replacement, `${name} update summary final coverage normalization`);
      body = patch.value;
      patches += patch.count;
      patchedThisNode += patch.count;
    }
    if (!patchedThisNode) throw new Error(`Patch anchor not found: ${name} update summary final coverage normalization`);
    node.parameters.jsonBody = body;
  }
  return patches;
}

function patchNodes(nodes) {
  return {
    updateMerge: patchUpdateConfluenceNode(requireNode(nodes, 'Update existing Document on Confluence')),
    completionBodies: patchCompletionBodies(nodes),
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_update_integrity_v2_${stamp}.json`);
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
