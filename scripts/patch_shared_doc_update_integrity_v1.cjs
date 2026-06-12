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
  return { value: source.replace(from, to), count: 1 };
}

function replaceAll(source, from, to, label) {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  const count = source.split(from).length - 1;
  return { value: source.split(from).join(to), count };
}

function patchQualityGate(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  const heuristic = "  if (baseline && total && total >= baseline * 0.75) normalized.operationMode = 'update_repair';\n";
  if (code.includes(heuristic)) {
    code = code.replace(heuristic, '');
    patches += 1;
  }

  const versions = replaceAll(code, 'shared-delta-update-v9', 'shared-delta-update-v10', 'quality gate shared update version');
  code = versions.value;
  patches += versions.count;

  node.parameters.jsCode = code;
  return patches;
}

const mergedCoverageHelpers = `  const normalizeCoverageStatus = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw.includes('exclude') || raw === 'n/a' || raw === 'not applicable') return 'excluded';
    if (raw.includes('partial') || raw.includes('review') || raw.includes('at risk')) return 'partial';
    if (raw.includes('miss') || raw.includes('gap') || raw.includes('unmapped') || raw.includes('not covered')) return 'missing';
    if (raw.includes('cover') || raw.includes('mapped') || raw.includes('included')) return 'covered';
    return raw || 'unknown';
  };

  const coverageRowKey = (row) => sectionKey(row?.coverageId || row?.moduleRequirement || row?.requirementId || row?.id || '');
  const normalizeCoverageRowForPublish = (row) => ({
    coverageId: String(row?.coverageId || row?.id || '').trim(),
    moduleRequirement: String(row?.moduleRequirement || row?.requirement || row?.title || '').trim(),
    sourceReference: String(row?.sourceReference || row?.source || '').trim(),
    includedInOutput: String(row?.includedInOutput || row?.included || '').trim(),
    coverageStatus: normalizeCoverageStatus(row?.coverageStatus || row?.status),
    notes: String(row?.notes || row?.rationale || '').trim()
  });

  const buildCoverageLedgerSectionHtml = (rows) => {
    const normalizedRows = (Array.isArray(rows) ? rows : [])
      .map(normalizeCoverageRowForPublish)
      .filter(row => row.coverageId || row.moduleRequirement);
    if (!normalizedRows.length) return '';
    const body = normalizedRows.map(row => '<tr>' + [
      row.coverageId,
      row.moduleRequirement,
      row.sourceReference,
      row.includedInOutput,
      row.coverageStatus,
      row.notes
    ].map(makeTd).join('') + '</tr>').join('');
    return '<h2>Coverage Ledger</h2><br/><table><tbody><tr><th>Coverage ID</th><th>Module / Requirement</th><th>Source Reference</th><th>Included In Output</th><th>Coverage Status</th><th>Notes</th></tr>' + body + '</tbody></table>';
  };

  const mergedCoverageLedgerHtml = () => {
    const previousRows = Array.isArray(q.updateContext?.previousCoverageLedger) ? q.updateContext.previousCoverageLedger : [];
    const currentRows = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];
    if (!previousRows.length && !currentRows.length) return '';
    const byKey = new Map();
    previousRows.map(normalizeCoverageRowForPublish).forEach(row => {
      const key = coverageRowKey(row);
      if (key) byKey.set(key, row);
    });
    currentRows.map(normalizeCoverageRowForPublish).forEach(row => {
      const key = coverageRowKey(row);
      if (key) byKey.set(key, row);
    });
    const shouldPreserveBaseline = previousRows.length > currentRows.length
      && !(Array.isArray(updateSummary.removedSections) && updateSummary.removedSections.some(section => sectionKey(section) === sectionKey('Coverage Ledger')));
    const rows = shouldPreserveBaseline ? Array.from(byKey.values()) : (currentRows.length ? currentRows : previousRows);
    return buildCoverageLedgerSectionHtml(rows);
  };

`;

function patchUpdateConfluenceNode(node) {
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) throw new Error('Update existing Document on Confluence body.storage.value not found');

  let value = String(target.value || '');
  let patches = 0;

  ({ value } = replaceOnce(
    value,
    '    const summary = q.coverageSummary || updateSummary.coverageSummary || {};',
    '    const summary = updateSummary.coverageSummary || q.coverageSummary || {};',
    'coverage review summary precedence'
  ));
  patches += 1;

  ({ value } = replaceOnce(
    value,
    '  const baseSections = new Map(existingParts.sections);\n',
    '  const baseSections = new Map(existingParts.sections);\n' + mergedCoverageHelpers,
    'merged coverage ledger helpers'
  ));
  patches += 1;

  ({ value } = replaceOnce(
    value,
    `  for (const [key, patchSection] of patchParts.sections.entries()) {
    if (compactEnough(patchSection.html) || key === sectionKey('Coverage Ledger')) {
      baseSections.set(key, patchSection);
    }
  }
`,
    `  const allowedPatchKeys = new Set([
    ...(Array.isArray(updateSummary.updatedSections) ? updateSummary.updatedSections : []),
    ...(Array.isArray(updateSummary.addedSections) ? updateSummary.addedSections : []),
    ...(Array.isArray(updateSummary.needsReviewSections) ? updateSummary.needsReviewSections : [])
  ].map(section => sectionKey(canonicalForKey(sectionKey(section)) || section)));
  const coverageLedgerKey = sectionKey('Coverage Ledger');
  allowedPatchKeys.add(coverageLedgerKey);
  (Array.isArray(updateSummary.removedSections) ? updateSummary.removedSections : [])
    .map(section => sectionKey(canonicalForKey(sectionKey(section)) || section))
    .forEach(key => baseSections.delete(key));
  const mergedLedgerHtml = mergedCoverageLedgerHtml();
  for (const [key, patchSection] of patchParts.sections.entries()) {
    if (!allowedPatchKeys.has(key)) continue;
    if (key === coverageLedgerKey && mergedLedgerHtml) {
      baseSections.set(key, { name: 'Coverage Ledger', html: mergedLedgerHtml });
      continue;
    }
    if (compactEnough(patchSection.html) || key === coverageLedgerKey) {
      baseSections.set(key, patchSection);
    }
  }
`,
    'apply only claimed shared update sections'
  ));
  patches += 1;

  ({ value } = replaceOnce(
    value,
    '  if (patchHasMostRequiredSections && patchSectionCount >= existingSectionCount) {',
    '  if (!cleanedExisting && patchHasMostRequiredSections && patchSectionCount >= existingSectionCount) {',
    'disable full patch replacement when existing content is available'
  ));
  patches += 1;

  if (value.includes('shared-final-validation-v18')) {
    const versionPatch = replaceAll(
      value,
      'shared-final-validation-v18',
      'shared-final-validation-v19',
      'update merge final validation version'
    );
    value = versionPatch.value;
    patches += versionPatch.count;
  }

  target.value = value;
  return patches;
}

function patchCompletionBodies(nodes) {
  const nodeNames = ['Mark Job Status as Completed', 'LOG: Update Confluence Job Completed'];
  let patches = 0;

  for (const name of nodeNames) {
    const node = requireNode(nodes, name);
    let body = String(node.parameters.jsonBody || '');
    const finalLedgerPatch = replaceAll(
      body,
      'const finalLedger = isSharedUpdate && rawLedger.length === 0 ? parseFinalLedger() : [];',
      'const finalLedger = isSharedUpdate ? parseFinalLedger() : [];',
      `${name} final coverage source`
    );
    body = finalLedgerPatch.value;
    patches += finalLedgerPatch.count;

    if (name === 'Mark Job Status as Completed') {
      const staleQualityGate = `"qualityGate": {{ JSON.stringify($('Restore Quality Gate Output').item.json.qualityGate || null) }},`;
      const normalizedQualityGate = `"qualityGate": {{ JSON.stringify((() => {
      const q = $('Restore Quality Gate Output').item.json || {};
      const restore = $('Restore Job Context').item.json || {};
      const type = String(q.documentType || restore.documentType || '').toLowerCase();
      const mode = String(q.generationMode || restore.generationMode || '').toLowerCase();
      return ['test_strategy', 'test_plan', 'risk_matrix'].includes(type) && mode === 'update' ? null : (q.qualityGate || null);
    })()) }},`;
      const qualityGatePatch = replaceOnce(body, staleQualityGate, normalizedQualityGate, 'remove stale nested shared update quality gate');
      body = qualityGatePatch.value;
      patches += qualityGatePatch.count;
    }

    node.parameters.jsonBody = body;
  }

  return patches;
}

function patchNodes(nodes) {
  return {
    qualityGate: patchQualityGate(requireNode(nodes, 'Quality Gate')),
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_update_integrity_v1_${stamp}.json`);
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
