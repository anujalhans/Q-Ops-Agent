const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function nowStamp() {
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

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${name}`);
  return node;
}

function replaceOnce(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`Could not find ${label}`);
  return text.replace(before, after);
}

function patchRetrieval(code) {
  let patched = code;
  if (patched.includes('BACKLOG_DELTA_SEMANTIC_V2_RETRIEVAL')) return patched;

  patched = replaceOnce(
    patched,
    `const BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL = true;
const updateMode = String(root.generationMode || '').toLowerCase() === 'update' || Boolean(root.updateMode || root.updateContext?.updateMode || root.updateOfJobId);`,
    `const BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL = true;
const BACKLOG_DELTA_SEMANTIC_V2_RETRIEVAL = true;
const updateMode = String(root.generationMode || '').toLowerCase() === 'update' || Boolean(root.updateMode || root.updateContext?.updateMode || root.updateOfJobId);`,
    'retrieval v2 marker',
  );

  patched = replaceOnce(
    patched,
    `function isBacklogDeltaCandidate(metadata, text = '') {
  const haystack = sourceTextForDelta(metadata, text).toLowerCase();
  const docType = normalizeKey(metaValue(metadata, ['docType', 'documentType', 'document_type']));
  if (docType === 'SUPPORTING') return true;
  if (deltaTerms.some(term => haystack.includes(term))) return true;
  return hasRequirementId(haystack) && /new|delta|support|addendum|enhancement|requirement/.test(haystack);
}`,
    `function backlogDeltaPriority(metadata, text = '') {
  const haystack = sourceTextForDelta(metadata, text).toLowerCase();
  const sourceName = String(metaValue(metadata, ['source', 'fileName', 'filename', 'file_name'], '')).toLowerCase();
  const docType = normalizeKey(metaValue(metadata, ['docType', 'documentType', 'document_type']));
  const supportingSource = /supporting|addendum|delta/.test(sourceName);
  const explicitRequirement = hasRequirementId(haystack);
  if (docType === 'SUPPORTING') return 300;
  if (supportingSource && explicitRequirement) return 280;
  if (supportingSource) return 240;
  if (explicitRequirement && /delta|addendum|change request|new requirement|supporting requirement|supporting functional|source type: supporting/.test(haystack)) return 200;
  return 0;
}
function isBacklogDeltaCandidate(metadata, text = '') {
  return backlogDeltaPriority(metadata, text) > 0;
}`,
    'strict retrieval delta candidate',
  );

  patched = replaceOnce(
    patched,
    `  const deltaCandidate = backlogUpdateMode && isBacklogDeltaCandidate(metadata, chunk.text);
  if (deltaCandidate) {
    profileScore += docType === 'SUPPORTING' ? 80 : 55;
    reasons.push(docType === 'SUPPORTING' ? 'update delta supporting evidence' : 'update delta candidate evidence');
  }

  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence, deltaCandidate };`,
    `  const deltaPriority = backlogUpdateMode ? backlogDeltaPriority(metadata, chunk.text) : 0;
  const deltaCandidate = deltaPriority > 0;
  if (deltaCandidate) {
    profileScore += deltaPriority;
    reasons.push(deltaPriority >= 240 ? 'update explicit supporting delta evidence' : 'update explicit requirement delta evidence');
  }

  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence, deltaCandidate, deltaPriority };`,
    'strict retrieval delta priority scoring',
  );

  patched = replaceOnce(
    patched,
    `  deltaCandidate: Boolean(d.deltaCandidate),
  docType: d.docType || 'UNKNOWN',`,
    `  deltaCandidate: Boolean(d.deltaCandidate),
  deltaPriority: Number(d.deltaPriority || 0),
  docType: d.docType || 'UNKNOWN',`,
    'retrieval context delta priority',
  );

  return patched;
}

function patchPrompt(code) {
  let patched = code;
  if (patched.includes('BACKLOG_DELTA_SEMANTIC_V2_PROMPT')) return patched;

  patched = replaceOnce(
    patched,
    `  const BACKLOG_DELTA_SEMANTIC_V1_PROMPT = true;
  const deltaTerms = [`,
    `  const BACKLOG_DELTA_SEMANTIC_V1_PROMPT = true;
  const BACKLOG_DELTA_SEMANTIC_V2_PROMPT = true;
  const deltaTerms = [`,
    'prompt v2 marker',
  );

  patched = replaceOnce(
    patched,
    `  const hasRequirementId = value => /\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/.test(String(value || '').toUpperCase());`,
    `  const extractRequirementIds = value => [...new Set((String(value || '').toUpperCase().match(/\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/g) || []).map(id => id.replace(/_/g, '-')))];
  const hasRequirementId = value => extractRequirementIds(value).length > 0;`,
    'prompt requirement id extraction',
  );

  patched = replaceOnce(
    patched,
    `  const isDeltaChunk = chunk => {
    const text = chunkText(chunk).toLowerCase();
    const docType = String(chunk.docType || '').toUpperCase();
    if (chunk.deltaCandidate || docType === 'SUPPORTING') return true;
    if (deltaTerms.some(term => text.includes(term))) return true;
    return hasRequirementId(text) && /new|delta|support|addendum|enhancement|requirement/.test(text);
  };`,
    `  const deltaPriority = chunk => {
    const text = chunkText(chunk);
    const lower = text.toLowerCase();
    const source = String(chunk.source || '').toLowerCase();
    const docType = String(chunk.docType || '').toUpperCase();
    const ids = extractRequirementIds(text);
    const supportingSource = /supporting|addendum|delta/.test(source);
    if (docType === 'SUPPORTING') return 400;
    if (supportingSource && ids.length) return 360;
    if (supportingSource) return 320;
    if (ids.length && /delta|addendum|change request|new requirement|supporting requirement|supporting functional|source type: supporting/.test(lower)) return 260;
    if (chunk.deltaCandidate && Number(chunk.deltaPriority || 0) > 0) return Number(chunk.deltaPriority);
    return 0;
  };
  const isDeltaChunk = chunk => deltaPriority(chunk) > 0;`,
    'strict prompt delta candidate',
  );

  patched = replaceOnce(
    patched,
    `  const deltaEvidence = updateMode ? retrievalContext.filter(isDeltaChunk) : [];
  const unresolvedEvidence = updateMode ? retrievalContext.filter(isUnresolvedFocusChunk) : [];
  const promptSeed = updateMode
    ? dedupeChunks([...deltaEvidence, ...unresolvedEvidence, ...retrievalContext])
    : retrievalContext;`,
    `  const deltaEvidence = updateMode
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
    : retrievalContext;`,
    'delta evidence ordered targets',
  );

  patched = replaceOnce(
    patched,
    `  'Delta target evidence chunks: ' + deltaEvidence.length,
  'Delta target sources: ' + (deltaEvidence.map(chunk => [chunk.docType || 'UNKNOWN', chunk.source || 'Unknown source', chunk.section || 'No section'].join(' | ')).slice(0, 12).join('; ') || 'none detected'),
  '',
  'Existing epics snapshot:',`,
    `  'Delta target evidence chunks: ' + deltaEvidence.length,
  'Delta target requirement IDs: ' + (deltaRequirementIds.join(', ') || 'none detected'),
  'Delta target sources: ' + (deltaEvidence.map(chunk => [chunk.docType || 'UNKNOWN', chunk.source || 'Unknown source', chunk.section || 'No section'].join(' | ')).slice(0, 12).join('; ') || 'none detected'),
  'Delta target details:',
  JSON.stringify(deltaTargetSummary),
  '',
  'Existing epics snapshot:',`,
    'delta target details in update summary',
  );

  patched = patched.replace(
    "'18. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET EVIDENCE item or unresolved coverage item.',",
    "'18. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET REQUIREMENT ID and unresolved coverage item. Do not stop after the first delta target.',",
  );
  patched = patched.replace(
    "'21. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions. If delta target evidence exists, do not return only reused backlog items unless each target is explicitly covered by existing Jira keys in noChangeReason.',",
    "'21. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions. If delta target requirement IDs exist, document.updateSummary.deltaRequirementIds and document.coverageLedger must account for each one, either mapped to a created/updated story or explicitly explained as already covered by existing Jira keys in noChangeReason.',",
  );

  patched = replaceOnce(
    patched,
    `    promptRouting: {
      route: 'professional_team_managed_backlog',`,
    `    updateDeltaTargets: updateMode ? {
      version: 'backlog-delta-targets-v2',
      requirementIds: deltaRequirementIds,
      targetCount: deltaRequirementIds.length,
      evidenceCount: deltaEvidence.length,
      targets: deltaTargetSummary
    } : null,
    promptRouting: {
      route: 'professional_team_managed_backlog',`,
    'prompt exposes update delta targets',
  );

  return patched;
}

function patchValidator(code) {
  let patched = code;
  if (patched.includes('BACKLOG_DELTA_SEMANTIC_V2_VALIDATE')) return patched;

  patched = replaceOnce(
    patched,
    `const BACKLOG_DELTA_SEMANTIC_V1_VALIDATE = true;
const updateModeActive = String(context.generationMode || '').toLowerCase() === 'update' || Boolean(context.updateMode || context.updateContext?.updateMode);`,
    `const BACKLOG_DELTA_SEMANTIC_V1_VALIDATE = true;
const BACKLOG_DELTA_SEMANTIC_V2_VALIDATE = true;
const updateModeActive = String(context.generationMode || '').toLowerCase() === 'update' || Boolean(context.updateMode || context.updateContext?.updateMode);`,
    'validator v2 marker',
  );

  patched = replaceOnce(
    patched,
    `if (updateModeActive && sourceChangedActive && (batchSummary.missingBatches > 0 || batchSummary.partialBatches > 0)) {
  const reviewBatches = batchSummary.batches`,
    `let promptDeltaTargets = {};
try { promptDeltaTargets = $('Professional Prompt Library').first().json.updateDeltaTargets || {}; } catch (error) { promptDeltaTargets = {}; }
const expectedDeltaIds = Array.isArray(promptDeltaTargets.requirementIds) ? promptDeltaTargets.requirementIds.map(id => String(id || '').toUpperCase()).filter(Boolean) : [];
const updateSummaryForDelta = generated.document?.updateSummary && typeof generated.document.updateSummary === 'object' ? generated.document.updateSummary : {};
const reportedDeltaText = JSON.stringify({
  updateSummaryDeltaRequirementIds: updateSummaryForDelta.deltaRequirementIds || [],
  coverageLedger,
  sourceCoverage,
  epics
}).toUpperCase();
const missingDeltaTargetIds = expectedDeltaIds.filter(id => !reportedDeltaText.includes(id));
if (updateModeActive && missingDeltaTargetIds.length) {
  const reviewRows = missingDeltaTargetIds.slice(0, 20).map(id => ({
    coverageId: id,
    moduleRequirement: 'Delta target requirement ' + id,
    coverageStatus: 'partial',
    notes: 'Detected supporting-document delta target was not mapped in this Backlog update output.'
  }));
  coverageSummary.gateStatus = 'warning';
  coverageSummary.deltaUpdateNeedsReview = true;
  coverageSummary.missingDeltaTargetIds = missingDeltaTargetIds;
  coverageSummary.partialCount = Math.max(coverageSummary.partialCount, reviewRows.length);
  coverageSummary.uncoveredCount = Math.max(coverageSummary.uncoveredCount, coverageSummary.partialCount);
  coverageSummary.missingItems = [...(coverageSummary.missingItems || []), ...reviewRows].slice(0, 25);
  for (const row of reviewRows) {
    batchSummary.batches.push({
      batchId: row.coverageId,
      module: row.moduleRequirement,
      sourceReferences: ['Professional Prompt Library delta target list'],
      intendedCoverageIds: [row.coverageId],
      status: 'partial',
      notes: row.notes,
      retried: false,
      recovered: false,
      coverageIds: [row.coverageId]
    });
  }
  batchSummary.totalBatches = batchSummary.batches.length;
  batchSummary.partialBatches = batchSummary.batches.filter(batch => batch.status === 'partial').length;
  batchSummary.completedBatches = batchSummary.batches.filter(batch => batch.status === 'covered' || batch.status === 'excluded').length;
  generated.document.deltaUpdateNeedsReview = true;
}

if (updateModeActive && sourceChangedActive && (batchSummary.missingBatches > 0 || batchSummary.partialBatches > 0)) {
  const reviewBatches = batchSummary.batches`,
    'validator expected delta target check',
  );

  return patched;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;
    const stamp = nowStamp();
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_delta_semantic_v2_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    requireNode(nodes, 'Check Chroma Retrieval Quality').parameters.jsCode = patchRetrieval(requireNode(nodes, 'Check Chroma Retrieval Quality').parameters.jsCode);
    requireNode(nodes, 'Professional Prompt Library').parameters.jsCode = patchPrompt(requireNode(nodes, 'Professional Prompt Library').parameters.jsCode);
    requireNode(nodes, 'Validate Team Managed Backlog').parameters.jsCode = patchValidator(requireNode(nodes, 'Validate Team Managed Backlog').parameters.jsCode);

    for (const name of ['Check Chroma Retrieval Quality', 'Professional Prompt Library', 'Backlog Delta Gate', 'Validate Team Managed Backlog']) {
      new Function(requireNode(nodes, name).parameters.jsCode);
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      workflowName: row.name,
      backupPath,
      updatedAt: now,
      changes: [
        'Update-mode Backlog delta detection now prioritizes SUPPORTING/delta files and explicit requirement IDs over generic old FRD keywords.',
        'Update prompt exposes an explicit delta target list and requires every target ID to be accounted for.',
        'Validator marks skipped delta target IDs as needs-review instead of allowing a green partial repair.'
      ]
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
