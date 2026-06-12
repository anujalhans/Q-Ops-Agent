const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error);
    else resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_retry_missing_delta_focus_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const promptNode = requireNode(nodes, 'Professional Prompt Library');
    let code = promptNode.parameters.jsCode;

    const summaryAnchor = `const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const unresolvedCoverage = previousCoverageLedger.filter(row => {`;
    const summaryPatch = `const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousCoverageSummary = updateContext.previousCoverageSummary && typeof updateContext.previousCoverageSummary === 'object' ? updateContext.previousCoverageSummary : {};
const previousBatchSummary = updateContext.previousBatchSummary && typeof updateContext.previousBatchSummary === 'object' ? updateContext.previousBatchSummary : {};
const unresolvedCoverage = previousCoverageLedger.filter(row => {`;
    if (!code.includes('const previousCoverageSummary = updateContext.previousCoverageSummary')) {
      if (!code.includes(summaryAnchor)) throw new Error('previous coverage summary anchor not found');
      code = code.replace(summaryAnchor, summaryPatch);
    }

    const idAnchor = `  const extractRequirementIds = value => [...new Set((String(value || '').toUpperCase().match(/\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/g) || []).map(id => id.replace(/_/g, '-')))];
  const hasRequirementId = value => extractRequirementIds(value).length > 0;`;
    const idPatch = `  const extractRequirementIds = value => [...new Set((String(value || '').toUpperCase().match(/\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/g) || []).map(id => id.replace(/_/g, '-')))];
  const previousMissingDeltaIds = [...new Set([
    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.missingDeltaTargetIds || [])),
    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.missingItems || [])),
    ...extractRequirementIds(JSON.stringify(previousCoverageSummary.partialItems || [])),
    ...extractRequirementIds(JSON.stringify((Array.isArray(previousBatchSummary.batches) ? previousBatchSummary.batches : []).filter(batch => /partial|missing|review|unknown/i.test(String(batch.status || '')))))
  ])];
  const hasRequirementId = value => extractRequirementIds(value).length > 0;`;
    if (!code.includes('const previousMissingDeltaIds = [...new Set([')) {
      if (!code.includes(idAnchor)) throw new Error('requirement id anchor not found');
      code = code.replace(idAnchor, idPatch);
    }

    const evidenceBlock = `  const deltaEvidence = updateMode
    ? retrievalContext.filter(isDeltaChunk).sort((a, b) => (deltaPriority(b) - deltaPriority(a)) || (Number(b.profileScore || 0) - Number(a.profileScore || 0)))
    : [];
  const unresolvedEvidence = updateMode ? retrievalContext.filter(isUnresolvedFocusChunk) : [];
  const deltaRequirementIds = [...new Set(deltaEvidence.flatMap(chunk => extractRequirementIds(chunkText(chunk))))];
  const deltaTargetSummary = deltaRequirementIds.map(id => {
    const chunk = deltaEvidence.find(item => extractRequirementIds(chunkText(item)).includes(id)) || {};
    return {
      requirementId: id,
      source: chunk.source || 'Delta evidence',
      docType: chunk.docType || 'UNKNOWN',
      section: chunk.section || '',
      excerpt: compactText(chunk.excerpt, 220)
    };
  });
  const promptSeed = updateMode
    ? dedupeChunks([...deltaEvidence, ...unresolvedEvidence, ...retrievalContext])
    : retrievalContext;
  const deltaChunkLimit = updateMode ? 18 : retrievalContext.length;
  const deltaExcerptLimit = updateMode ? 900 : 2500;`;
    const evidencePatch = `  const deltaEvidence = updateMode
    ? retrievalContext.filter(isDeltaChunk).sort((a, b) => (deltaPriority(b) - deltaPriority(a)) || (Number(b.profileScore || 0) - Number(a.profileScore || 0)))
    : [];
  const isPreviousMissingDeltaChunk = chunk => {
    if (!previousMissingDeltaIds.length) return false;
    const ids = extractRequirementIds(chunkText(chunk));
    return ids.some(id => previousMissingDeltaIds.includes(id));
  };
  const retryFocusEvidence = updateMode ? retrievalContext.filter(isPreviousMissingDeltaChunk) : [];
  const unresolvedEvidence = updateMode ? retrievalContext.filter(chunk => isUnresolvedFocusChunk(chunk) || isPreviousMissingDeltaChunk(chunk)) : [];
  const discoveredDeltaRequirementIds = deltaEvidence.flatMap(chunk => extractRequirementIds(chunkText(chunk)));
  const deltaRequirementIds = [...new Set([...previousMissingDeltaIds, ...discoveredDeltaRequirementIds])];
  const deltaTargetSummary = deltaRequirementIds.map(id => {
    const chunk = [...retryFocusEvidence, ...deltaEvidence, ...retrievalContext].find(item => extractRequirementIds(chunkText(item)).includes(id)) || {};
    return {
      requirementId: id,
      source: chunk.source || (previousMissingDeltaIds.includes(id) ? 'Previous coverage warning' : 'Delta evidence'),
      docType: chunk.docType || 'UNKNOWN',
      section: chunk.section || '',
      excerpt: compactText(chunk.excerpt || 'Requirement carried forward from previous partial Backlog update coverage.', 260),
      retryFocus: previousMissingDeltaIds.includes(id)
    };
  });
  const promptSeed = updateMode
    ? dedupeChunks([...retryFocusEvidence, ...deltaEvidence, ...unresolvedEvidence, ...retrievalContext])
    : retrievalContext;
  const deltaChunkLimit = updateMode ? 24 : retrievalContext.length;
  const deltaExcerptLimit = updateMode ? 1800 : 2500;`;
    if (!code.includes('const retryFocusEvidence = updateMode ? retrievalContext.filter(isPreviousMissingDeltaChunk) : [];')) {
      if (!code.includes(evidenceBlock)) throw new Error('delta evidence block anchor not found');
      code = code.replace(evidenceBlock, evidencePatch);
    }

    const summaryLine = `  'Delta target requirement IDs: ' + (deltaRequirementIds.join(', ') || 'none detected'),
  'Delta target sources: ' + (deltaEvidence.map(chunk => [chunk.docType || 'UNKNOWN', chunk.source || 'Unknown source', chunk.section || 'No section'].join(' | ')).slice(0, 12).join('; ') || 'none detected'),`;
    const summaryLinePatch = `  'Delta target requirement IDs: ' + (deltaRequirementIds.join(', ') || 'none detected'),
  'Update repair missing delta IDs from previous coverage: ' + (previousMissingDeltaIds.join(', ') || 'none'),
  'Delta target sources: ' + ([...retryFocusEvidence, ...deltaEvidence].map(chunk => [chunk.docType || 'UNKNOWN', chunk.source || 'Unknown source', chunk.section || 'No section'].join(' | ')).slice(0, 12).join('; ') || 'none detected'),`;
    if (!code.includes('Update repair missing delta IDs from previous coverage:')) {
      if (!code.includes(summaryLine)) throw new Error('update context summary anchor not found');
      code = code.replace(summaryLine, summaryLinePatch);
    }

    const criticalAnchor = `      '18. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET REQUIREMENT ID and unresolved coverage item. Do not stop after the first delta target.',
      '19. In update mode, the workflow will merge previous live Jira epics/stories after parsing. Do not include unchanged full descriptions in your JSON response.',`;
    const criticalPatch = `      '18. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET REQUIREMENT ID and unresolved coverage item. Do not stop after the first delta target.',
      '19. In update-repair mode, any IDs listed as Update repair missing delta IDs are mandatory focus items. Generate or update backlog coverage for those IDs first, and include each ID in sourceTraceability plus document.coverageLedger. Reuse previous Jira items where correlation IDs already exist; create only the missing delta backlog items.',
      '20. In update mode, the workflow will merge previous live Jira epics/stories after parsing. Do not include unchanged full descriptions in your JSON response.',`;
    if (!code.includes('Update repair missing delta IDs are mandatory focus items')) {
      if (!code.includes(criticalAnchor)) throw new Error('critical requirements anchor not found');
      code = code.replace(criticalAnchor, criticalPatch);
    }

    code = code.replace(`'20. In update mode, include document.updateSummary`, `'21. In update mode, include document.updateSummary`);
    code = code.replace(`'21. In update mode, keep output compact`, `'22. In update mode, keep output compact`);
    code = code.replace(`'22. Return only valid JSON matching the output parser schema.'`, `'23. Return only valid JSON matching the output parser schema.'`);
    code = code.replace(`version: 'backlog-delta-targets-v2',`, `version: 'backlog-delta-targets-v3',`);
    code = code.replace(`evidenceCount: deltaEvidence.length,`, `evidenceCount: deltaEvidence.length,\n      retryFocusIds: previousMissingDeltaIds,`);

    new Function(code);
    promptNode.parameters.jsCode = code;

    const connections = row.connections ? parseAny(row.connections) : {};
    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      changes: [
        'Professional Prompt Library now carries previous missing delta IDs into updateDeltaTargets',
        'Retry-focus evidence is promoted before broad delta evidence',
        'Update-repair prompt requires missing delta IDs to be covered first',
        'Update mode prompt excerpts expanded to preserve same-chunk supporting requirements'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
