const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try {
    return JSON.parse(value);
  } catch {
    return require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted').parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function insertAfter(code, marker, addition) {
  const index = code.indexOf(marker);
  if (index < 0) throw new Error(`Marker not found: ${marker}`);
  const end = index + marker.length;
  return code.slice(0, end) + addition + code.slice(end);
}

function replaceOnce(code, search, replacement) {
  if (!code.includes(search)) throw new Error(`Search text not found: ${search.slice(0, 120)}`);
  return code.replace(search, replacement);
}

function patchPromptLibrary(code) {
  if (!code.includes('const generationMode = String($json.generationMode')) {
    code = insertAfter(
      code,
      "const retryInstruction = String($json.retryInstruction || retryContext.retryInstruction || '').trim();\n",
      "const generationMode = String($json.generationMode || $json.input?.generationMode || retryContext.generationMode || '').toLowerCase() === 'update' ? 'update' : 'create';\nconst updateContext = ($json.updateContext && typeof $json.updateContext === 'object') ? $json.updateContext : ($json.input?.updateContext && typeof $json.input.updateContext === 'object' ? $json.input.updateContext : {});\n"
    );
  }

  if (!code.includes('function buildRtmUpdateInstructions(type, generationMode, updateContext, context)')) {
    code = insertAfter(
      code,
      "\n\nconst canonical = values => [...new Set(values.filter(Boolean))];",
      `\n\nfunction buildRtmUpdateInstructions(type, generationMode, updateContext, context) {
  if (type !== 'traceability_matrix' || generationMode !== 'update') return '';
  const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
  const previousCoverageSummary = updateContext.previousCoverageSummary || {};
  const previousBatchSummary = updateContext.previousBatchSummary || {};
  const compactUpdateContext = {
    previousJobId: updateContext.previousJobId || null,
    previousDocumentType: updateContext.previousDocumentType || null,
    previousConfluencePageId: updateContext.previousConfluencePageId || null,
    previousConfluenceUrl: updateContext.previousConfluenceUrl || null,
    previousCreatedAt: updateContext.previousCreatedAt || null,
    previousCoverageSummary,
    previousCoverageLedger,
    previousBatchSummary,
    currentBacklogJobId: context?.backlogJobId || null,
    currentStoryTestCaseJobId: context?.storyTestCaseJobId || null,
    currentCounts: context?.counts || {}
  };

  return [
    '==============================',
    'RTM UPDATE MODE',
    '==============================',
    '',
    'This is an update of an existing Requirement Traceability Matrix.',
    'Use the current two-layer traceability context as the source of truth for Jira Epics, User Stories, and Story Test Case links.',
    'Use the previous RTM coverage metadata only to identify what changed, what is unchanged, and what still needs review. Do not copy stale rows when the current context disagrees.',
    'If current evidence adds new requirements, story mappings, or test case links, update the matrix and call out the additions in a short RTM Update Summary near the top of the document.',
    'If current evidence shows no traceability change, state clearly: "No traceability changes were detected in the current source context."',
    'The final RTM must still be a complete current-state RTM, not a patch note only.',
    'Do not regenerate unrelated or invented coverage. Preserve stable mappings where current evidence still supports them.',
    '',
    'RTM update context JSON:',
    JSON.stringify(compactUpdateContext)
  ].join('\\n');
}`
    );
  }

  if (!code.includes('const rtmUpdateInstructions = buildRtmUpdateInstructions(type, generationMode, updateContext, traceabilityContext);')) {
    code = insertAfter(
      code,
      "const twoLayerRtmInstructions = buildTwoLayerRtmInstructions(type, traceabilityContext);\n",
      "const rtmUpdateInstructions = buildRtmUpdateInstructions(type, generationMode, updateContext, traceabilityContext);\n"
    );
  }

  code = code.replace(
    /const enhancedSystem = \[\s*selectedPrompt\.system,\s*retrievalProfileInstructions,\s*coverageLedgerInstructions,\s*twoLayerRtmInstructions\s*\]/,
    "const enhancedSystem = [\n  selectedPrompt.system,\n  retrievalProfileInstructions,\n  coverageLedgerInstructions,\n  twoLayerRtmInstructions,\n  rtmUpdateInstructions\n]"
  );

  code = code.replace(
    /const enhancedUser = \[\s*retrievalProfileInstructions,\s*coverageLedgerInstructions,\s*twoLayerRtmInstructions,/,
    "const enhancedUser = [\n  retrievalProfileInstructions,\n  coverageLedgerInstructions,\n  twoLayerRtmInstructions,\n  rtmUpdateInstructions,"
  );

  if (!code.includes('generationMode,\n    updateContext,')) {
    code = replaceOnce(
      code,
      "    traceabilityMode: $json.traceabilityMode || '',\n    traceabilityContext: traceabilityContext || {},",
      "    traceabilityMode: $json.traceabilityMode || '',\n    traceabilityContext: traceabilityContext || {},\n    generationMode,\n    updateContext,"
    );
  }

  return code;
}

const qualityHelpers = `
function normalizeCoverageStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['covered', 'passed', 'complete', 'completed', 'ok'].includes(normalized)) return 'covered';
  if (['partial', 'partially_covered', 'review', 'needs_review', 'warning'].includes(normalized)) return 'partial';
  if (['missing', 'not_covered', 'failed', 'no'].includes(normalized)) return 'missing';
  if (['excluded', 'out_of_scope', 'not_applicable', 'n/a'].includes(normalized)) return 'excluded';
  return normalized || 'unknown';
}

function coverageRowKey(row) {
  return [
    row.coverageId || row.coverageID || row.id || '',
    row.moduleRequirement || row.module || row.requirement || row['Module / Requirement'] || '',
    row.sourceReference || row.source || row['Source Reference'] || ''
  ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean).join('|');
}

function normalizeCoverageRow(row, index) {
  const raw = row && typeof row === 'object' ? row : {};
  return {
    key: coverageRowKey(raw) || 'row-' + index,
    coverageId: raw.coverageId || raw.coverageID || raw.id || raw['Coverage ID'] || 'COV-' + String(index + 1).padStart(3, '0'),
    moduleRequirement: raw.moduleRequirement || raw.module || raw.requirement || raw['Module / Requirement'] || 'Coverage item ' + (index + 1),
    sourceReference: raw.sourceReference || raw.source || raw['Source Reference'] || '',
    includedInOutput: raw.includedInOutput || raw.included || raw['Included In Output'] || '',
    coverageStatus: normalizeCoverageStatus(raw.coverageStatus || raw.status || raw['Coverage Status']),
    notes: raw.notes || raw['Notes'] || ''
  };
}

function buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary) {
  if (documentType !== 'traceability_matrix') return null;
  const rows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);
  const batches = rows.map(row => ({
    id: row.coverageId,
    label: row.moduleRequirement,
    sourceReference: row.sourceReference,
    status: row.coverageStatus === 'covered' || row.coverageStatus === 'excluded'
      ? 'complete'
      : row.coverageStatus === 'partial'
        ? 'partial'
        : 'missing',
    coverageStatus: row.coverageStatus,
    notes: row.notes,
    includedInOutput: row.includedInOutput
  }));
  const completedBatches = batches.filter(batch => batch.status === 'complete').length;
  const partialBatches = batches.filter(batch => batch.status === 'partial').length;
  const missingBatches = batches.filter(batch => batch.status === 'missing').length;
  const totalBatches = batches.length || Number(coverageSummary.coverageLedgerCount) || 0;
  return {
    enabled: true,
    version: 'rtm-coverage-batches-v1',
    documentType,
    totalBatches,
    completedBatches,
    partialBatches,
    missingBatches,
    recoveredBatches: 0,
    progressPercent: totalBatches ? Math.round((completedBatches / totalBatches) * 100) : 0,
    batches
  };
}

function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary) {
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
}
`;

function patchQualityGate(code) {
  if (!code.includes('const promptContext = $(\'Prompt Library\').item.json || {};')) {
    code = insertAfter(
      code,
      "const jobId = data.jobId; \n",
      "const promptContext = $('Prompt Library').item.json || {};\nconst generationMode = String(promptContext.generationMode || '').toLowerCase() === 'update' ? 'update' : 'create';\nconst updateContext = (promptContext.updateContext && typeof promptContext.updateContext === 'object') ? promptContext.updateContext : {};\n"
    );
  }

  if (!code.includes('function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary)')) {
    code = insertAfter(code, "\nconst sharedCoveragePlanningTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);", qualityHelpers);
  }

  if (!code.includes('const coverageBatchSummary = buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary);')) {
    code = insertAfter(
      code,
      "const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);\n",
      "const coverageBatchSummary = buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary);\nconst updateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, coverageBatchSummary);\n"
    );
  }

  if (!code.includes('generationMode,\n      updateContext,\n      updateSummary,')) {
    code = replaceOnce(
      code,
      "      jobId,\n      tokensInput:",
      "      jobId,\n      generationMode,\n      updateContext,\n      updateSummary,\n      batchSummary: coverageBatchSummary,\n      progress: {\n        coverageSummary,\n        batchSummary: coverageBatchSummary,\n        updateSummary\n      },\n      tokensInput:"
    );
  }

  if (!code.includes('updateSummary,\n        batchSummary: coverageBatchSummary,')) {
    code = replaceOnce(
      code,
      "        coverageGate: coverageSummary.gateStatus,\n        coveragePlanning: sharedCoveragePlanning,",
      "        coverageGate: coverageSummary.gateStatus,\n        coveragePlanning: sharedCoveragePlanning,\n        updateSummary,\n        batchSummary: coverageBatchSummary,"
    );
  }

  return code;
}

function addAssignment(node, assignment) {
  const assignments = node.parameters.assignments.assignments;
  if (!assignments.some(item => item.name === assignment.name)) {
    assignments.push(assignment);
  }
}

function patchSetNodes(nodes) {
  const restoreJobContext = requireNode(nodes, 'Restore Job Context');
  addAssignment(restoreJobContext, {
    id: 'rtm-generation-mode-assignment',
    name: 'generationMode',
    value: "={{ $('When Executed by Another Workflow').item.json.generationMode || $('When Executed by Another Workflow').item.json.input?.generationMode || 'create' }}",
    type: 'string'
  });
  addAssignment(restoreJobContext, {
    id: 'rtm-update-context-assignment',
    name: 'updateContext',
    value: "={{ $('When Executed by Another Workflow').item.json.updateContext || $('When Executed by Another Workflow').item.json.input?.updateContext || {} }}",
    type: 'object'
  });

  const restoreQuality = requireNode(nodes, 'Restore Quality Gate Output');
  addAssignment(restoreQuality, {
    id: 'rtm-update-summary-output',
    name: 'updateSummary',
    value: "={{ $('Quality Gate').item.json.updateSummary }}",
    type: 'object'
  });
  addAssignment(restoreQuality, {
    id: 'rtm-batch-summary-output',
    name: 'batchSummary',
    value: "={{ $('Quality Gate').item.json.batchSummary }}",
    type: 'object'
  });
  addAssignment(restoreQuality, {
    id: 'rtm-progress-output',
    name: 'progress',
    value: "={{ $('Quality Gate').item.json.progress }}",
    type: 'object'
  });
  addAssignment(restoreQuality, {
    id: 'rtm-generation-mode-output',
    name: 'generationMode',
    value: "={{ $('Quality Gate').item.json.generationMode }}",
    type: 'string'
  });
  addAssignment(restoreQuality, {
    id: 'rtm-update-context-output',
    name: 'updateContext',
    value: "={{ $('Quality Gate').item.json.updateContext }}",
    type: 'object'
  });
}

function completionFields() {
  return `    "documentType": {{ $('Restore Job Context').item.json.documentType ? JSON.stringify($('Restore Job Context').item.json.documentType) : 'null' }},
    "generationMode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.generationMode || $('Restore Job Context').item.json.generationMode || 'create') }},
    "updateOfJobId": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary?.updateOfJobId || $('Restore Job Context').item.json.updateContext?.previousJobId || null) }},
    "updateSummary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary || null) }},
    "coverageSummary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] }) }},
    "coverageLedger": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageLedger || []) }},
    "batchSummary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.batchSummary || null) }},
    "progress": {{ JSON.stringify($('Restore Quality Gate Output').item.json.progress || null) }},
    "qualityGate": {{ JSON.stringify($('Restore Quality Gate Output').item.json.qualityGate || null) }},
`;
}

function patchCompletionOutputBody(jsonBody) {
  if (jsonBody.includes('"updateSummary": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.updateSummary || null) }}')) {
    return jsonBody;
  }
  if (jsonBody.includes('"coverageSummary": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.coverageSummary')) {
    const start = jsonBody.indexOf('    "coverageSummary": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.coverageSummary');
    const end = jsonBody.indexOf('\n', start);
    if (start < 0 || end < 0) throw new Error('Could not locate existing coverageSummary completion field');
    return jsonBody.slice(0, start) + completionFields() + jsonBody.slice(end + 1);
  }
  return jsonBody.replace(
    '    "wordCount": {{ Number($(\'Restore Quality Gate Output\').item.json.wordCount) || 0 }},\n',
    '    "wordCount": {{ Number($(\'Restore Quality Gate Output\').item.json.wordCount) || 0 }},\n' + completionFields()
  );
}

function patchMetricBody(jsonBody) {
  if (jsonBody.includes('"generation_mode": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.generationMode')) {
    return removeDuplicateMetricCoverageFields(jsonBody);
  }
  const generationMetadata = `    "generation_mode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.generationMode || $('Restore Job Context').item.json.generationMode || 'create') }},
    "update_of_job_id": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary?.updateOfJobId || $('Restore Job Context').item.json.updateContext?.previousJobId || null) }},
    "update_summary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary || null) }},
`;
  const coverageMetadata = `    "generation_mode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.generationMode || $('Restore Job Context').item.json.generationMode || 'create') }},
    "update_of_job_id": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary?.updateOfJobId || $('Restore Job Context').item.json.updateContext?.previousJobId || null) }},
    "update_summary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary || null) }},
    "coverage_mode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.mode || 'dry_run') }},
    "coverage_gate_status": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.gateStatus || 'not_reported') }},
    "coverage_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.coverageLedgerCount) || 0 }},
    "covered_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.coveredCount) || 0 }},
    "partial_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.partialCount) || 0 }},
    "missing_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.missingCount) || 0 }},
    "excluded_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.excludedCount) || 0 }},
    "uncovered_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.uncoveredCount) || 0 }},
    "coverage_missing_items": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.missingItems || []) }},
`;
  const metadata = jsonBody.includes('"coverage_mode": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.coverageSummary')
    ? generationMetadata
    : coverageMetadata;
  return removeDuplicateMetricCoverageFields(jsonBody.replace(
    '    "output_type": "confluence",\n',
    '    "output_type": "confluence",\n' + metadata
  ));
}

function removeDuplicateMetricCoverageFields(jsonBody) {
  const first = jsonBody.indexOf('    "coverage_mode": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.coverageSummary');
  if (first < 0) return jsonBody;
  const second = jsonBody.indexOf('    "coverage_mode": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.coverageSummary', first + 1);
  if (second < 0) return jsonBody;
  const end = jsonBody.indexOf('    "token_usage":', second);
  if (end < 0) return jsonBody;
  return jsonBody.slice(0, second) + jsonBody.slice(end);
}

function patchHttpNodes(nodes) {
  for (const name of ['Update Job Status as Completed', 'Mark Job Status as Completed']) {
    const node = requireNode(nodes, name);
    node.parameters.jsonBody = patchCompletionOutputBody(node.parameters.jsonBody);
  }
  for (const name of ['LOG: Confluence Job Completed', 'LOG: Update Confluence Job Completed']) {
    const node = requireNode(nodes, name);
    node.parameters.jsonBody = patchMetricBody(node.parameters.jsonBody);
  }
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_rtm_update_parity_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const prompt = requireNode(nodes, 'Prompt Library');
    const qualityGate = requireNode(nodes, 'Quality Gate');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    qualityGate.parameters.jsCode = patchQualityGate(qualityGate.parameters.jsCode);
    patchSetNodes(nodes);
    patchHttpNodes(nodes);

    new Function(prompt.parameters.jsCode);
    new Function(qualityGate.parameters.jsCode);

    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      new Date().toISOString(),
      workflowId
    ]);

    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        new Date().toISOString(),
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
        'RTM update instructions',
        'RTM coverage batch summary',
        'RTM update summary',
        'create/update completion outputs',
        'completion metric metadata'
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
