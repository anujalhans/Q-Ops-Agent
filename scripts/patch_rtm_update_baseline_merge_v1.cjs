const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_update_baseline_merge_v1';
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Required node not found: ${name}`);
  return node;
}

function patchPromptLibrary(node) {
  let code = node.parameters.jsCode;
  const oldText = [
    "    'Use the current two-layer traceability context as the source of truth for Jira Epics, User Stories, and Story Test Case links.',",
    "    'Use the previous RTM coverage metadata only to identify what changed, what is unchanged, and what still needs review. Do not copy stale rows when the current context disagrees.',",
    "    'If current evidence adds new requirements, story mappings, or test case links, update the matrix and call out the additions in a short RTM Update Summary near the top of the document.',",
    "    'If current evidence shows no traceability change, state clearly: \"No traceability changes were detected in the current source context.\"',",
    "    'The final RTM must still be a complete current-state RTM, not a patch note only.',",
    "    'Do not regenerate unrelated or invented coverage. Preserve stable mappings where current evidence still supports them.',",
  ].join('\n');
  const newText = [
    "    'Use the current two-layer traceability context as the latest delta/current evidence for Jira Epics, User Stories, and Story Test Case links.',",
    "    'Merge this evidence with the previous RTM baseline. The previous RTM coverage rows are presumed preserved unless current evidence explicitly marks a requirement removed, deleted, superseded, or out of scope.',",
    "    'Absence of a previous requirement from the current context is not by itself a removal, because upstream Backlog/STC update outputs may be delta-shaped.',",
    "    'If current evidence adds new requirements, story mappings, or test case links, add those rows while preserving unaffected previous RTM rows.',",
    "    'If current evidence changes an existing requirement mapping, update that row and list it as updated in a short RTM Update Summary near the top of the document.',",
    "    'If current evidence explicitly removes a requirement or mapping, remove it and list the exact Coverage ID in the RTM Update Summary.',",
    "    'If current evidence shows no traceability change, state clearly: \"No traceability changes were detected in the current source context.\"',",
    "    'The final RTM must be the complete merged current-state RTM, not a delta-only patch note.',",
    "    'Do not invent coverage. Preserve stable mappings from the previous RTM when current evidence does not contradict them.',",
  ].join('\n');
  if (!code.includes(oldText)) {
    throw new Error('Prompt Library RTM update instruction block was not found.');
  }
  code = code.replace(oldText, newText);
  node.parameters.jsCode = code;
}

function patchQualityGate(node) {
  let code = node.parameters.jsCode;

  const marker = `function buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary) {`;
  const helper = String.raw`
function coverageRowIsExplicitlyRemoved(row) {
  const status = String(row?.coverageStatus || row?.coverage_status || row?.status || '').trim().toLowerCase();
  const included = String(row?.includedInOutput || row?.included_in_output || row?.included || '').trim().toLowerCase();
  const notes = String(row?.notes || row?.note || row?.rationale || '').trim().toLowerCase();
  return ['removed', 'deleted', 'superseded'].includes(status)
    || included === 'removed'
    || /\b(explicitly\s+)?(removed|deleted|superseded)\b/.test(notes);
}

function comparableCoverageRow(row) {
  const normalized = normalizeCoverageRow(row);
  return JSON.stringify({
    coverageId: normalized.coverageId,
    moduleRequirement: normalized.moduleRequirement,
    sourceReference: normalized.sourceReference,
    includedInOutput: normalized.includedInOutput,
    coverageStatus: normalized.coverageStatus,
    notes: normalized.notes
  });
}

function summarizeCoverageRows(rows, fallbackSummary = {}) {
  const normalizedRows = (Array.isArray(rows) ? rows : []).map(normalizeCoverageRow);
  const coveredCount = normalizedRows.filter(row => row.coverageStatus === 'covered').length;
  const partialCount = normalizedRows.filter(row => row.coverageStatus === 'partial').length;
  const missingCount = normalizedRows.filter(row => row.coverageStatus === 'missing').length;
  const unknownCount = normalizedRows.filter(row => row.coverageStatus === 'unknown').length;
  const excludedCount = normalizedRows.filter(row => ['excluded', 'out_of_scope'].includes(row.coverageStatus)).length;
  const warningItems = normalizedRows.filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus));
  return {
    ...fallbackSummary,
    version: fallbackSummary.version || 'coverage-ledger-v1',
    mode: fallbackSummary.mode || 'enforced',
    coverageLedgerCount: normalizedRows.length,
    coveredCount,
    partialCount,
    missingCount,
    unknownCount,
    excludedCount,
    uncoveredCount: missingCount + partialCount + unknownCount,
    blockingUncoveredCount: missingCount + partialCount + unknownCount,
    missingItems: warningItems.filter(row => row.coverageStatus === 'missing'),
    partialItems: warningItems.filter(row => row.coverageStatus === 'partial'),
    unknownItems: warningItems.filter(row => row.coverageStatus === 'unknown'),
    warningItems,
    gateStatus: warningItems.length ? 'warning' : 'passed'
  };
}

function coverageLabel(row) {
  const normalized = normalizeCoverageRow(row);
  return normalized.coverageId || normalized.moduleRequirement || normalized.key;
}

function buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger) {
  const currentLedger = Array.isArray(coverageLedger) ? coverageLedger : [];
  if (documentType !== 'traceability_matrix' || generationMode !== 'update') {
    return {
      applied: false,
      coverageLedger: currentLedger,
      addedRows: currentLedger.map(coverageLabel),
      updatedRows: [],
      preservedRows: [],
      removedRows: []
    };
  }

  const previousLedger = Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
  if (!previousLedger.length) {
    return {
      applied: false,
      coverageLedger: currentLedger,
      addedRows: currentLedger.map(coverageLabel),
      updatedRows: [],
      preservedRows: [],
      removedRows: []
    };
  }

  const effectiveByKey = new Map();
  const previousComparableByKey = new Map();
  for (const row of previousLedger) {
    const normalized = normalizeCoverageRow(row);
    effectiveByKey.set(normalized.key, row);
    previousComparableByKey.set(normalized.key, comparableCoverageRow(row));
  }

  const addedRows = [];
  const updatedRows = [];
  const removedRows = [];
  const touchedKeys = new Set();

  for (const row of currentLedger) {
    const normalized = normalizeCoverageRow(row);
    touchedKeys.add(normalized.key);
    if (coverageRowIsExplicitlyRemoved(row)) {
      if (effectiveByKey.has(normalized.key)) {
        effectiveByKey.delete(normalized.key);
        removedRows.push(coverageLabel(row));
      }
      continue;
    }
    if (!effectiveByKey.has(normalized.key)) {
      addedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
      continue;
    }
    if (previousComparableByKey.get(normalized.key) !== comparableCoverageRow(row)) {
      updatedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
    }
  }

  const preservedRows = [];
  for (const row of previousLedger) {
    const normalized = normalizeCoverageRow(row);
    if (!effectiveByKey.has(normalized.key)) continue;
    if (!touchedKeys.has(normalized.key)) preservedRows.push(coverageLabel(row));
    else if (!updatedRows.includes(coverageLabel(row)) && !removedRows.includes(coverageLabel(row))) preservedRows.push(coverageLabel(row));
  }

  return {
    applied: true,
    coverageLedger: Array.from(effectiveByKey.values()),
    addedRows,
    updatedRows,
    preservedRows,
    removedRows
  };
}

function rtmCoverageLedgerMarkdown(rows) {
  const values = Array.isArray(rows) ? rows : [];
  if (!values.length) return '';
  const escapeCell = (value) => String(value || '')
    .replace(/\|/g, ' - ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Not provided';
  const lines = [
    '### Coverage Ledger',
    '',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '|---|---|---|---|---|---|'
  ];
  for (const row of values) {
    const normalized = normalizeCoverageRow(row);
    lines.push('| ' + [
      normalized.coverageId,
      normalized.moduleRequirement,
      normalized.sourceReference,
      normalized.includedInOutput || 'Yes',
      normalized.coverageStatus || 'unknown',
      normalized.notes
    ].map(escapeCell).join(' | ') + ' |');
  }
  return lines.join('\n');
}

function replaceRtmCoverageLedgerMarkdown(text, rows) {
  if (documentType !== 'traceability_matrix' || !Array.isArray(rows) || !rows.length) return text;
  const replacement = rtmCoverageLedgerMarkdown(rows);
  const lines = String(text || '').split(/\r?\n/);
  const start = lines.findIndex(line => /^\s*#{0,6}\s*(?:7\.\s*)?Coverage\s+Ledger\s*:?\s*$/i.test(line.trim()));
  if (start < 0) return String(text || '').trim() + '\n\n' + replacement;
  let end = start + 1;
  while (end < lines.length && !/^\s*#{1,6}\s+/.test(lines[end])) end += 1;
  return [...lines.slice(0, start), replacement, ...lines.slice(end)].join('\n');
}

`;
  if (!code.includes(marker)) throw new Error('Coverage batch summary marker not found in Quality Gate.');
  if (!code.includes('function buildRtmEffectiveCoverageLedger')) {
    code = code.replace(marker, helper + '\n' + marker);
  }

  const oldSummaryFunction = String.raw`function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary) {
  if (documentType !== 'traceability_matrix') return null;
  const currentRows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);
  const previousRows = (Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger : []).map(normalizeCoverageRow);
  const previousByKey = new Map(previousRows.map(row => [row.key, row]));
  const currentByKey = new Map(currentRows.map(row => [row.key, row]));
  let createdCoverageRows = 0;
  let updatedCoverageRows = 0;
  let reusedCoverageRows = 0;

  for (const row of currentRows) {
    const previous = previousByKey.get(row.key);
    if (!previous) {
      createdCoverageRows += 1;
      continue;
    }
    const currentComparable = JSON.stringify({
      status: row.coverageStatus,
      included: row.includedInOutput,
      notes: row.notes
    });
    const previousComparable = JSON.stringify({
      status: previous.coverageStatus,
      included: previous.includedInOutput,
      notes: previous.notes
    });
    if (currentComparable === previousComparable) reusedCoverageRows += 1;
    else updatedCoverageRows += 1;
  }

  const removedCoverageRows = previousRows.filter(row => !currentByKey.has(row.key)).length;
  const missingCoverageRows = Number(coverageSummary.missingCount) || 0;
  const partialCoverageRows = Number(coverageSummary.partialCount) || 0;
  const reviewCoverageRows = missingCoverageRows + partialCoverageRows + (Number(coverageSummary.unknownCount) || 0);
  const noChangesDetected = generationMode === 'update'
    && previousRows.length > 0
    && createdCoverageRows === 0
    && updatedCoverageRows === 0
    && removedCoverageRows === 0;

  return {
    enabled: true,
    version: 'rtm-update-summary-v1',
    documentType,
    mode: generationMode || 'create',
    sourceOfTruth: updateContext?.updateSourceOfTruth || 'current_traceability_context',
    updateOfJobId: updateContext?.previousJobId || null,
    previousConfluencePageId: updateContext?.previousConfluencePageId || null,
    previousCoverageRows: previousRows.length,
    currentCoverageRows: currentRows.length,
    createdCoverageRows,
    updatedCoverageRows,
    reusedCoverageRows,
    removedCoverageRows,
    missingCoverageRows,
    partialCoverageRows,
    reviewCoverageRows,
    noChangesDetected,
    message: generationMode === 'update'
      ? noChangesDetected
        ? 'No traceability changes were detected in the current source context.'
        : 'RTM was refreshed against the current backlog and story test case traceability context.'
      : 'RTM was created from the current backlog and story test case traceability context.',
    batchSummary
  };
}`;

  const newSummaryFunction = String.raw`function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary, mergeInfo = null) {
  if (documentType !== 'traceability_matrix') return null;
  const currentRows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);
  const previousRows = (Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger : []).map(normalizeCoverageRow);
  const addedRows = Array.isArray(mergeInfo?.addedRows) ? mergeInfo.addedRows : [];
  const updatedRows = Array.isArray(mergeInfo?.updatedRows) ? mergeInfo.updatedRows : [];
  const preservedRows = Array.isArray(mergeInfo?.preservedRows) ? mergeInfo.preservedRows : [];
  const removedRows = Array.isArray(mergeInfo?.removedRows) ? mergeInfo.removedRows : [];
  let createdCoverageRows = addedRows.length;
  let updatedCoverageRows = updatedRows.length;
  let reusedCoverageRows = preservedRows.length;
  let removedCoverageRows = removedRows.length;

  if (!mergeInfo?.applied) {
    const previousByKey = new Map(previousRows.map(row => [row.key, row]));
    const currentByKey = new Map(currentRows.map(row => [row.key, row]));
    createdCoverageRows = 0;
    updatedCoverageRows = 0;
    reusedCoverageRows = 0;
    for (const row of currentRows) {
      const previous = previousByKey.get(row.key);
      if (!previous) {
        createdCoverageRows += 1;
        continue;
      }
      const currentComparable = JSON.stringify({
        status: row.coverageStatus,
        included: row.includedInOutput,
        notes: row.notes
      });
      const previousComparable = JSON.stringify({
        status: previous.coverageStatus,
        included: previous.includedInOutput,
        notes: previous.notes
      });
      if (currentComparable === previousComparable) reusedCoverageRows += 1;
      else updatedCoverageRows += 1;
    }
    removedCoverageRows = previousRows.filter(row => !currentByKey.has(row.key) && coverageRowIsExplicitlyRemoved(row)).length;
  }

  const missingCoverageRows = Number(coverageSummary.missingCount) || 0;
  const partialCoverageRows = Number(coverageSummary.partialCount) || 0;
  const reviewCoverageRows = missingCoverageRows + partialCoverageRows + (Number(coverageSummary.unknownCount) || 0);
  const noChangesDetected = generationMode === 'update'
    && previousRows.length > 0
    && createdCoverageRows === 0
    && updatedCoverageRows === 0
    && removedCoverageRows === 0;

  return {
    enabled: true,
    version: 'rtm-update-summary-v2',
    documentType,
    mode: generationMode || 'create',
    sourceOfTruth: updateContext?.updateSourceOfTruth || 'jira_confluence_live',
    updateOfJobId: updateContext?.previousJobId || null,
    previousConfluencePageId: updateContext?.previousConfluencePageId || null,
    previousCoverageRows: previousRows.length,
    currentCoverageRows: currentRows.length,
    createdCoverageRows,
    updatedCoverageRows,
    reusedCoverageRows,
    removedCoverageRows,
    addedRows,
    updatedRows,
    preservedRows,
    removedRows,
    missingCoverageRows,
    partialCoverageRows,
    reviewCoverageRows,
    noChangesDetected,
    message: generationMode === 'update'
      ? noChangesDetected
        ? 'No traceability changes were detected in the current source context.'
        : 'RTM update merged previous traceability baseline with current Backlog and Story Test Case updates.'
      : 'RTM was created from the current backlog and story test case traceability context.',
    batchSummary
  };
}`;

  if (!code.includes(oldSummaryFunction)) throw new Error('Original RTM update summary function was not found.');
  code = code.replace(oldSummaryFunction, newSummaryFunction);

  const oldBuild = `const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);
const coverageBatchSummary = buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary);
const rtmUpdateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, coverageBatchSummary);
const sharedDeltaUpdateSummary = buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, rawMarkdown, coverageLedger, coverageSummary, coverageBatchSummary, data);`;
  const newBuild = `const rtmCoverageMerge = buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger);
const effectiveCoverageLedger = rtmCoverageMerge.coverageLedger;
if (rtmCoverageMerge.applied) {
  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));
  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;
}
const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, effectiveCoverageLedger, coverageSummary);
const coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);
const rtmUpdateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, effectiveCoverageLedger, coverageSummary, coverageBatchSummary, rtmCoverageMerge);
const sharedDeltaUpdateSummary = buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, rawMarkdown, effectiveCoverageLedger, coverageSummary, coverageBatchSummary, data);`;
  if (!code.includes(oldBuild)) throw new Error('Coverage summary build block was not found.');
  code = code.replace(oldBuild, newBuild);

  code = code
    .replace(`  if (!coverageLedger.length) {`, `  if (!effectiveCoverageLedger.length) {`)
    .replace(`      coverageLedger,`, `      coverageLedger: effectiveCoverageLedger,`)
    .replace(`        coverageLedgerCount: Number(coverageSummary.coverageLedgerCount) || 0,`, `        coverageLedgerCount: Number(coverageSummary.coverageLedgerCount) || effectiveCoverageLedger.length || 0,`);

  node.parameters.jsCode = code;
}

function compileCode(node) {
  new Function(node.parameters.jsCode);
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

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = JSON.parse(row.connections);
    patchPromptLibrary(requireNode(nodes, 'Prompt Library'));
    patchQualityGate(requireNode(nodes, 'Quality Gate'));
    compileCode(requireNode(nodes, 'Prompt Library'));
    compileCode(requireNode(nodes, 'Quality Gate'));

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, patched: ['Prompt Library', 'Quality Gate'], backupPath }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
