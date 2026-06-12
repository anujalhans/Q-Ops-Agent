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
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
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

function patchRetrievalQuality(code) {
  let patched = code;

  patched = patched.replace(
    "secondaryDocTypes: ['HLD', 'LLD', 'API_SPEC', 'DATA_MODEL', 'ARCHITECTURE', 'TEST_CASES', 'TEST_PLAN'],",
    "secondaryDocTypes: ['HLD', 'LLD', 'API_SPEC', 'DATA_MODEL', 'ARCHITECTURE', 'TEST_CASES', 'TEST_PLAN', 'SUPPORTING'],",
  );
  patched = patched.replace(
    "quality: ['TEST_CASES', 'TEST_PLAN']",
    "quality: ['TEST_CASES', 'TEST_PLAN'],\n      supporting: ['SUPPORTING']",
  );

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL')) {
    patched = replaceOnce(
      patched,
      "const profile = retrievalProfiles[requestProfileKey] || retrievalProfiles.qa_document;\n",
      `const profile = retrievalProfiles[requestProfileKey] || retrievalProfiles.qa_document;

const BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL = true;
const updateMode = String(root.generationMode || '').toLowerCase() === 'update' || Boolean(root.updateMode || root.updateContext?.updateMode || root.updateOfJobId);
const backlogUpdateMode = updateMode && requestProfileKey === 'user_stories';
const deltaTerms = [
  'supporting', 'delta', 'addendum', 'change request', 'change log', 'new requirement',
  'new scope', 'enhancement', 'supplement', 'coverage gap', 'gap closure', 'updated requirement',
  'loyalty', 'wallet', 'store credit', 'marketplace', 'split shipment', 'fraud',
  'privacy', 'compliance', 'support operation', 'support ops'
];
const hasRequirementId = text => /\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/.test(String(text || '').toUpperCase());
const sourceTextForDelta = (metadata, text = '') => [
  metaValue(metadata, ['source', 'fileName', 'filename', 'file_name'], ''),
  metaValue(metadata, ['docType', 'documentType', 'document_type'], ''),
  metaValue(metadata, ['documentCategory'], ''),
  metaValue(metadata, ['artifactType'], ''),
  metaValue(metadata, ['sectionTitle', 'section', 'title', 'heading'], ''),
  String(text || '').slice(0, 2200)
].join(' | ');
function isBacklogDeltaCandidate(metadata, text = '') {
  const haystack = sourceTextForDelta(metadata, text).toLowerCase();
  const docType = normalizeKey(metaValue(metadata, ['docType', 'documentType', 'document_type']));
  if (docType === 'SUPPORTING') return true;
  if (deltaTerms.some(term => haystack.includes(term))) return true;
  return hasRequirementId(haystack) && /new|delta|support|addendum|enhancement|requirement/.test(haystack);
}
`,
      'retrieval delta helpers insertion',
    );

    patched = replaceOnce(
      patched,
      `  if (profile.primaryDocTypes.includes(docType)) {
    profileScore += 40;
    reasons.push('primary docType ' + docType);
  } else if (profile.secondaryDocTypes.includes(docType)) {
    profileScore += 22;
    reasons.push('secondary docType ' + docType);
  } else if (!docType || docType === 'UNKNOWN') {`,
      `  if (profile.primaryDocTypes.includes(docType)) {
    profileScore += 40;
    reasons.push('primary docType ' + docType);
  } else if (profile.secondaryDocTypes.includes(docType)) {
    profileScore += 22;
    reasons.push('secondary docType ' + docType);
  } else if (!docType || docType === 'UNKNOWN') {`,
      'docType scoring anchor',
    );

    patched = replaceOnce(
      patched,
      `  if (metadataConfidence > 0) {
    profileScore += Math.min(8, Math.round(metadataConfidence * 8));
  }

  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence };
};`,
      `  if (metadataConfidence > 0) {
    profileScore += Math.min(8, Math.round(metadataConfidence * 8));
  }

  const deltaCandidate = backlogUpdateMode && isBacklogDeltaCandidate(metadata, chunk.text);
  if (deltaCandidate) {
    profileScore += docType === 'SUPPORTING' ? 80 : 55;
    reasons.push(docType === 'SUPPORTING' ? 'update delta supporting evidence' : 'update delta candidate evidence');
  }

  return { profileScore, reasons, docType, documentCategory, artifactType, contentSource, sectionTitle, hasVisionContent, metadataConfidence, deltaCandidate };
};`,
      'retrieval delta score boost',
    );

    patched = replaceOnce(
      patched,
      `  profileMatchReasons: d.reasons,
  docType: d.docType || 'UNKNOWN',`,
      `  profileMatchReasons: d.reasons,
  deltaCandidate: Boolean(d.deltaCandidate),
  docType: d.docType || 'UNKNOWN',`,
      'retrieval context delta flag',
    );

    patched = replaceOnce(
      patched,
      `groupedEvidence.unclassified = retrievalContext.filter(chunk => !chunk.docType || normalizeKey(chunk.docType) === 'UNKNOWN').slice(0, 5);
`,
      `groupedEvidence.unclassified = retrievalContext.filter(chunk => !chunk.docType || normalizeKey(chunk.docType) === 'UNKNOWN').slice(0, 5);
if (backlogUpdateMode) {
  groupedEvidence.delta = retrievalContext.filter(chunk => chunk.deltaCandidate || normalizeKey(chunk.docType) === 'SUPPORTING').slice(0, 12);
}
`,
      'delta grouped evidence',
    );

    patched = replaceOnce(
      patched,
      `      topK: root.chromaTopK
    },`,
      `      topK: root.chromaTopK,
      updateMode,
      updateDeltaCandidateCount: retrievalContext.filter(chunk => chunk.deltaCandidate || normalizeKey(chunk.docType) === 'SUPPORTING').length
    },`,
      'retrieval quality delta count',
    );
  }

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_RETRIEVAL')) {
    throw new Error('retrieval semantic patch marker missing');
  }
  return patched;
}

function patchPromptLibrary(code) {
  let patched = code;

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_PROMPT')) {
    patched = replaceOnce(
      patched,
      `  const compactUnresolvedCoverage = unresolvedCoverage.map((row, index) => ({
    coverageId: row.coverageId || row.id || ('UNRESOLVED-' + (index + 1)),
    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),
    coverageStatus: row.coverageStatus || row.status || 'review',
    notes: compactText(row.notes || row.reason, 160)
  })).slice(0, 30);
  const deltaChunkLimit = updateMode ? 12 : retrievalContext.length;
  const deltaExcerptLimit = updateMode ? 1000 : 2500;
  const deltaGroupedLimit = updateMode ? 4 : 8;
  const promptRetrievalContext = retrievalContext.slice(0, deltaChunkLimit).map(chunk => ({
    ...chunk,
    excerpt: compactText(chunk.excerpt, deltaExcerptLimit)
  }));
  const promptGroupedEvidence = Object.fromEntries(Object.entries(groupedEvidence)
    .filter(([_, chunks]) => Array.isArray(chunks) && chunks.length)
    .map(([group, chunks]) => [group, chunks.slice(0, deltaGroupedLimit).map(chunk => ({
      ...chunk,
      excerpt: compactText(chunk.excerpt, updateMode ? 450 : 500)
    }))]));`,
      `  const compactUnresolvedCoverage = unresolvedCoverage.map((row, index) => ({
    coverageId: row.coverageId || row.id || ('UNRESOLVED-' + (index + 1)),
    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),
    coverageStatus: row.coverageStatus || row.status || 'review',
    notes: compactText(row.notes || row.reason, 160)
  })).slice(0, 30);

  const BACKLOG_DELTA_SEMANTIC_V1_PROMPT = true;
  const deltaTerms = [
    'supporting', 'delta', 'addendum', 'change request', 'change log', 'new requirement',
    'new scope', 'enhancement', 'supplement', 'coverage gap', 'gap closure', 'updated requirement',
    'loyalty', 'wallet', 'store credit', 'marketplace', 'split shipment', 'fraud',
    'privacy', 'compliance', 'support operation', 'support ops'
  ];
  const hasRequirementId = value => /\\b[A-Z]{2,10}[-_][A-Z0-9]{2,12}[-_]\\d{2,}\\b/.test(String(value || '').toUpperCase());
  const chunkText = chunk => [
    chunk.source,
    chunk.docType,
    chunk.documentCategory,
    chunk.artifactType,
    chunk.section,
    chunk.excerpt
  ].filter(Boolean).join(' | ');
  const isDeltaChunk = chunk => {
    const text = chunkText(chunk).toLowerCase();
    const docType = String(chunk.docType || '').toUpperCase();
    if (chunk.deltaCandidate || docType === 'SUPPORTING') return true;
    if (deltaTerms.some(term => text.includes(term))) return true;
    return hasRequirementId(text) && /new|delta|support|addendum|enhancement|requirement/.test(text);
  };
  const unresolvedText = unresolvedCoverage.map(row => [row.coverageId, row.moduleRequirement, row.requirement, row.notes].filter(Boolean).join(' ')).join(' ').toLowerCase();
  const isUnresolvedFocusChunk = chunk => {
    if (!unresolvedText) return false;
    const text = chunkText(chunk).toLowerCase();
    return unresolvedCoverage.some(row => {
      const terms = String(row.moduleRequirement || row.requirement || row.coverageId || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(term => term.length >= 5)
        .slice(0, 8);
      return terms.length && terms.some(term => text.includes(term));
    });
  };
  const dedupeChunks = chunks => {
    const seen = new Set();
    return chunks.filter(chunk => {
      const key = [chunk.chunkId, chunk.documentId, chunk.source, chunk.section, chunk.excerpt].filter(Boolean).join('|').slice(0, 260);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const deltaEvidence = updateMode ? retrievalContext.filter(isDeltaChunk) : [];
  const unresolvedEvidence = updateMode ? retrievalContext.filter(isUnresolvedFocusChunk) : [];
  const promptSeed = updateMode
    ? dedupeChunks([...deltaEvidence, ...unresolvedEvidence, ...retrievalContext])
    : retrievalContext;
  const deltaChunkLimit = updateMode ? 18 : retrievalContext.length;
  const deltaExcerptLimit = updateMode ? 900 : 2500;
  const deltaGroupedLimit = updateMode ? 6 : 8;
  const promptRetrievalContext = promptSeed.slice(0, deltaChunkLimit).map(chunk => ({
    ...chunk,
    excerpt: compactText(chunk.excerpt, deltaExcerptLimit)
  }));
  const promptGroupedEvidence = Object.fromEntries(Object.entries({
    ...(groupedEvidence || {}),
    ...(updateMode ? { delta: deltaEvidence } : {})
  })
    .filter(([_, chunks]) => Array.isArray(chunks) && chunks.length)
    .map(([group, chunks]) => [group, dedupeChunks(chunks).slice(0, deltaGroupedLimit).map(chunk => ({
      ...chunk,
      excerpt: compactText(chunk.excerpt, updateMode ? 450 : 500)
    }))]));`,
      'prompt delta evidence selection',
    );

    patched = replaceOnce(
      patched,
      `  'Unresolved coverage rows to resolve: ' + unresolvedCoverage.length,
  '',
  'Existing epics snapshot:',`,
      `  'Unresolved coverage rows to resolve: ' + unresolvedCoverage.length,
  'Delta target evidence chunks: ' + deltaEvidence.length,
  'Delta target sources: ' + (deltaEvidence.map(chunk => [chunk.docType || 'UNKNOWN', chunk.source || 'Unknown source', chunk.section || 'No section'].join(' | ')).slice(0, 12).join('; ') || 'none detected'),
  '',
  'Existing epics snapshot:',`,
      'update summary delta evidence',
    );

    patched = patched.replace(
      "updateMode ? 'Update mode is active. Return only new or materially changed delta epics/stories plus coverage ledger rows for new evidence; do not rewrite unchanged backlog items. Previous live Jira items are merged back by the workflow after parsing.' : 'Create mode is active. Generate a complete first backlog from project evidence.',",
      "updateMode ? 'Update mode is active. The DELTA TARGET EVIDENCE chunks are authoritative. Create or update backlog items only for those delta targets and unresolved coverage; do not rewrite unchanged backlog items. Previous live Jira items are merged back by the workflow after parsing.' : 'Create mode is active. Generate a complete first backlog from project evidence.',",
    );
    patched = patched.replace(
      "'18. In update mode, do not re-plan or rewrite already-covered modules. Return only new/updated delta epics and stories for new evidence or unresolved coverage.',",
      "'18. In update mode, do not re-plan or rewrite already-covered modules. Return new/updated delta epics and stories for every in-scope DELTA TARGET EVIDENCE item or unresolved coverage item.',",
    );
    patched = patched.replace(
      "'20. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, unchangedCoverageIds, and deltaRequirementIds.',",
      "'20. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, unchangedCoverageIds, deltaRequirementIds, and a concise noChangeReason only when no delta item needs a backlog change.',",
    );
    patched = patched.replace(
      "'21. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions.',",
      "'21. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions. If delta target evidence exists, do not return only reused backlog items unless each target is explicitly covered by existing Jira keys in noChangeReason.',",
    );
  }

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_PROMPT')) {
    throw new Error('prompt semantic patch marker missing');
  }
  return patched;
}

function patchValidator(code) {
  let patched = code;

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_VALIDATE')) {
    patched = replaceOnce(
      patched,
      `const batchPlan = normalizeBatchPlan(generated.document.batchPlan || generated.batchPlan || generated.document.moduleBatchPlan, coverageLedger);
const batchSummary = summarizeBatchPlan(batchPlan, coverageLedger, retryBatches);
generated.document.batchPlan = batchPlan;`,
      `const batchPlan = normalizeBatchPlan(generated.document.batchPlan || generated.batchPlan || generated.document.moduleBatchPlan, coverageLedger);
const batchSummary = summarizeBatchPlan(batchPlan, coverageLedger, retryBatches);

const BACKLOG_DELTA_SEMANTIC_V1_VALIDATE = true;
const updateModeActive = String(context.generationMode || '').toLowerCase() === 'update' || Boolean(context.updateMode || context.updateContext?.updateMode);
const updateReasonsActive = Array.isArray(context.updateContext?.updateReasons) && context.updateContext.updateReasons.filter(Boolean).length > 0;
const sourceChangedActive = Boolean(context.updateContext?.contextUpdated) || updateReasonsActive;
if (updateModeActive && sourceChangedActive && (batchSummary.missingBatches > 0 || batchSummary.partialBatches > 0)) {
  const reviewBatches = batchSummary.batches
    .filter(batch => ['missing', 'unknown', 'partial'].includes(batch.status))
    .slice(0, 12)
    .map(batch => ({
      coverageId: (batch.coverageIds || [])[0] || batch.batchId,
      moduleRequirement: batch.module,
      coverageStatus: batch.status === 'partial' ? 'partial' : 'partial',
      notes: 'Delta update batch needs review before it can be treated as covered.'
    }));
  coverageSummary.gateStatus = 'warning';
  coverageSummary.deltaUpdateNeedsReview = true;
  coverageSummary.deltaBatchReviewCount = reviewBatches.length;
  coverageSummary.partialCount = Math.max(coverageSummary.partialCount, reviewBatches.length || 1);
  coverageSummary.uncoveredCount = Math.max(coverageSummary.uncoveredCount, coverageSummary.partialCount);
  coverageSummary.missingItems = [...(coverageSummary.missingItems || []), ...reviewBatches].slice(0, 25);
  generated.document.deltaUpdateNeedsReview = true;
}

generated.document.batchPlan = batchPlan;`,
      'validator delta batch consistency guard',
    );

    patched = replaceOnce(
      patched,
      `        ? 'Backlog batches were generated and reviewed. Some coverage needs review before final sign-off.'
        : 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',`,
      `        ? 'Backlog batches were generated and reviewed. Some coverage needs review before final sign-off.'
        : 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',`,
      'progress summary anchor',
    );
  }

  if (!patched.includes('BACKLOG_DELTA_SEMANTIC_V1_VALIDATE')) {
    throw new Error('validator semantic patch marker missing');
  }
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_delta_semantic_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    requireNode(nodes, 'Check Chroma Retrieval Quality').parameters.jsCode = patchRetrievalQuality(requireNode(nodes, 'Check Chroma Retrieval Quality').parameters.jsCode);
    requireNode(nodes, 'Professional Prompt Library').parameters.jsCode = patchPromptLibrary(requireNode(nodes, 'Professional Prompt Library').parameters.jsCode);
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
        'Update-mode Backlog retrieval boosts SUPPORTING/delta chunks without changing create mode.',
        'Update-mode prompt evidence now promotes delta target chunks before older project context.',
        'Update-mode validation now marks missing/partial delta batches as needs-review instead of green passed.'
      ]
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
