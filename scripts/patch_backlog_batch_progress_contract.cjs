const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try { return JSON.parse(value); }
  catch { return flatted.parse(value); }
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

function patchPromptLibrary(code) {
  if (!code.includes('BATCHED BACKLOG GENERATION REQUIREMENT')) {
    code = code.replace(
      `'BACKLOG COVERAGE LEDGER REQUIREMENT:',
      '- The JSON must include document.coverageLedger as an array.',`,
      `'BACKLOG COVERAGE LEDGER REQUIREMENT:',
      '- The JSON must include document.coverageLedger as an array.',`
    );
    code = code.replace(
      `'- If an item is in scope, mappedEpicIds and mappedStoryIds must reference the generated epic/story correlation IDs that cover it.'`,
      `'- If an item is in scope, mappedEpicIds and mappedStoryIds must reference the generated epic/story correlation IDs that cover it.',
      '',
      'BATCHED BACKLOG GENERATION REQUIREMENT:',
      '- Plan generation in logical module batches before writing Jira backlog items.',
      '- Return document.batchPlan.modules with batchId, module, sourceReferences, intendedCoverageIds, and status.',
      '- Generate epics/stories batch-by-batch, then run a coverage review against document.coverageLedger.',
      '- If any in-scope module is missing or weak, retry only those missing/partial modules inside this same response and return document.retryBatches.',
      '- Merge recovered batch output into the final epics/stories arrays before returning JSON.',
      '- Return document.batchResults with completedBatches, retryingBatches, recoveredBatches, missingBatches, and notes.'`
    );
  }

  if (!code.includes('batchGenerationRequirement:')) {
    code = code.replace(
      `coverageLedgerRequirement: {
      enabled: true,
      version: 'backlog-coverage-ledger-v1',
      mode: 'enforced',
      requiredFor: 'user_stories',
      statuses: ['covered', 'partial', 'missing', 'excluded'],
      blockedStatuses: ['missing', 'unknown']
    },
    promptRouting: {`,
      `coverageLedgerRequirement: {
      enabled: true,
      version: 'backlog-coverage-ledger-v1',
      mode: 'enforced',
      requiredFor: 'user_stories',
      statuses: ['covered', 'partial', 'missing', 'excluded'],
      blockedStatuses: ['missing', 'unknown']
    },
    batchGenerationRequirement: {
      enabled: true,
      version: 'backlog-batch-progress-v1',
      mode: 'internal_retry',
      requiredFor: 'user_stories',
      retryScope: 'missing_or_partial_modules_only',
      outputFields: ['document.batchPlan', 'document.batchResults', 'document.retryBatches']
    },
    promptRouting: {`
    );
  }

  code = code.replace(
    `'14. For each coverageLedger row, map in-scope source items to actual generated epic/story correlation IDs. Use excluded only with a clear reason.',
      '15. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',
      '16. Return only valid JSON matching the output parser schema.'`,
    `'14. For each coverageLedger row, map in-scope source items to actual generated epic/story correlation IDs. Use excluded only with a clear reason.',
      '15. Include document.batchPlan, document.batchResults, and document.retryBatches so users can see what modules were generated, retried, recovered, or still missing.',
      '16. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',
      '17. Return only valid JSON matching the output parser schema.'`
  );

  return code;
}

function patchValidateBacklog(code) {
  if (code.includes('function normalizeBatchPlan')) return code;

  code = code.replace(
    `function summarizeCoverageLedger(coverageLedger) {
  const summary = {`,
    `function normalizeBatchPlan(value, coverageLedger) {
  const rows = Array.isArray(value?.modules)
    ? value.modules
    : Array.isArray(value?.batches)
      ? value.batches
      : Array.isArray(value)
        ? value
        : [];
  const modules = rows.length ? rows : coverageLedger.map(row => ({
    batchId: row.coverageId,
    module: row.moduleRequirement,
    sourceReferences: [row.sourceReference].filter(Boolean),
    intendedCoverageIds: [row.coverageId],
    status: row.coverageStatus
  }));
  return {
    version: 'backlog-batch-progress-v1',
    mode: 'internal_retry',
    modules: modules
      .filter(row => row && typeof row === 'object')
      .map((row, index) => ({
        batchId: firstText(row.batchId, row.id, row.coverageId, 'BATCH-' + String(index + 1).padStart(3, '0')),
        module: firstText(row.module, row.name, row.moduleRequirement, row.requirement, 'Module ' + String(index + 1)),
        sourceReferences: textList(row.sourceReferences, row.sourceReference, row.sources, row.evidence),
        intendedCoverageIds: textList(row.intendedCoverageIds, row.coverageIds, row.coverageId),
        status: normalizeCoverageStatus(row.status || row.coverageStatus || row.result || 'covered'),
        notes: firstText(row.notes, row.summary, row.resultNotes)
      }))
  };
}

function summarizeBatchPlan(batchPlan, coverageLedger, retryBatchesValue) {
  const retryRows = Array.isArray(retryBatchesValue)
    ? retryBatchesValue
    : retryBatchesValue && typeof retryBatchesValue === 'object'
      ? Object.values(retryBatchesValue)
      : [];
  const retryIds = new Set(retryRows.flatMap(row => textList(row.batchId, row.id, row.coverageId, row.coverageIds, row.module, row.moduleRequirement)).map(normalizeKey));
  const coverageById = new Map(coverageLedger.map(row => [normalizeKey(row.coverageId), row]));
  const batches = (batchPlan.modules || []).map(batch => {
    const coverageRows = batch.intendedCoverageIds
      .map(id => coverageById.get(normalizeKey(id)))
      .filter(Boolean);
    const statuses = coverageRows.length ? coverageRows.map(row => row.coverageStatus) : [batch.status];
    const status = statuses.includes('missing') || statuses.includes('unknown')
      ? 'missing'
      : statuses.includes('partial')
        ? 'partial'
        : statuses.includes('excluded')
          ? 'excluded'
          : 'covered';
    const retried = retryIds.has(normalizeKey(batch.batchId)) || retryIds.has(normalizeKey(batch.module)) || batch.intendedCoverageIds.some(id => retryIds.has(normalizeKey(id)));
    return {
      ...batch,
      status,
      retried,
      recovered: retried && status === 'covered',
      coverageIds: batch.intendedCoverageIds
    };
  });
  const retryingBatches = batches.filter(batch => ['partial', 'missing', 'unknown'].includes(batch.status)).length;
  const recoveredBatches = batches.filter(batch => batch.recovered).length;
  return {
    version: 'backlog-batch-progress-v1',
    mode: 'internal_retry',
    totalBatches: batches.length,
    completedBatches: batches.filter(batch => batch.status === 'covered' || batch.status === 'excluded').length,
    retryingBatches,
    recoveredBatches,
    missingBatches: batches.filter(batch => batch.status === 'missing' || batch.status === 'unknown').length,
    partialBatches: batches.filter(batch => batch.status === 'partial').length,
    batches
  };
}

function summarizeCoverageLedger(coverageLedger) {
  const summary = {`
  );

  code = code.replace(
    `coverageSummary.mappingWarnings = mappingWarnings.slice(0, 25);
coverageSummary.mappingWarningCount = mappingWarnings.length;
`,
    `coverageSummary.mappingWarnings = mappingWarnings.slice(0, 25);
coverageSummary.mappingWarningCount = mappingWarnings.length;
const retryBatches = Array.isArray(generated.document.retryBatches || generated.retryBatches)
  ? (generated.document.retryBatches || generated.retryBatches)
  : [];
const batchPlan = normalizeBatchPlan(generated.document.batchPlan || generated.batchPlan || generated.document.moduleBatchPlan, coverageLedger);
const batchSummary = summarizeBatchPlan(batchPlan, coverageLedger, retryBatches);
generated.document.batchPlan = batchPlan;
generated.document.batchResults = {
  ...(generated.document.batchResults || {}),
  ...batchSummary
};
generated.document.retryBatches = retryBatches;
coverageSummary.recoveredCount = batchSummary.recoveredBatches;
coverageSummary.recoveredItems = batchSummary.batches
  .filter(batch => batch.recovered)
  .slice(0, 25)
  .map(batch => ({ batchId: batch.batchId, moduleRequirement: batch.module, coverageStatus: batch.status }));
`
  );

  code = code.replace(
    `    coverageLedger,
    coverageSummary,
    qualityGate: {`,
    `    coverageLedger,
    coverageSummary,
    batchPlan,
    batchSummary,
    progress: {
      stage: 'coverage_reviewed',
      stageLabel: coverageSummary.gateStatus === 'warning' ? 'Coverage reviewed with warnings' : 'Coverage reviewed',
      progressPercent: 82,
      summary: 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',
      coverage: coverageSummary,
      batches: batchSummary.batches
    },
    qualityGate: {`
  );

  code = code.replace(
    `      missingCoverageItems: coverageSummary.missingItems
    }`,
    `      missingCoverageItems: coverageSummary.missingItems,
      batchPlan,
      batchSummary,
      progress: {
        stage: 'coverage_reviewed',
        stageLabel: coverageSummary.gateStatus === 'warning' ? 'Coverage reviewed with warnings' : 'Coverage reviewed',
        progressPercent: 82,
        summary: 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',
        coverage: coverageSummary,
        batches: batchSummary.batches
      }
    }`
  );

  return code;
}

function patchPrepareConfluence(code) {
  if (code.includes('<h2>Batch Generation Summary</h2>')) return code;
  code = code.replace(
    `const coverageTable = coverageRows
  ? '<table><tbody><tr><th>Coverage ID</th><th>Module / Requirement</th><th>Status</th><th>Mapped Output</th><th>Notes</th></tr>' + coverageRows + '</tbody></table>'
  : '<p>No coverage ledger rows were available.</p>';`,
    `const coverageTable = coverageRows
  ? '<table><tbody><tr><th>Coverage ID</th><th>Module / Requirement</th><th>Status</th><th>Mapped Output</th><th>Notes</th></tr>' + coverageRows + '</tbody></table>'
  : '<p>No coverage ledger rows were available.</p>';
const batchSummary = root.batchSummary || root.qualityGate?.batchSummary || root.generated?.document?.batchResults || {};
const batchRows = Array.isArray(batchSummary.batches) ? batchSummary.batches.slice(0, 30).map(batch =>
  '<tr><td>' + esc(batch.batchId) + '</td><td>' + esc(batch.module) + '</td><td>' + esc(batch.status) + '</td><td>' + esc(batch.retried ? 'Yes' : 'No') + '</td><td>' + esc((batch.coverageIds || []).join(', ')) + '</td></tr>'
).join('') : '';
const batchTable = batchRows
  ? '<table><tbody><tr><th>Batch ID</th><th>Module</th><th>Status</th><th>Retried</th><th>Coverage IDs</th></tr>' + batchRows + '</tbody></table>'
  : '<p>No batch-level details were returned.</p>';`
  );

  code = code.replace(
    `+ '<h2>Coverage Gate</h2><p>Status: <strong>' + esc(coverageSummary.gateStatus || root.qualityGate.coverageGate || 'not_reported') + '</strong> | Ledger rows: ' + esc(coverageSummary.coverageLedgerCount || 0) + ' | Covered: ' + esc(coverageSummary.coveredCount || 0) + ' | Partial: ' + esc(coverageSummary.partialCount || 0) + ' | Missing: ' + esc(coverageSummary.missingCount || 0) + '</p>' + coverageTable
  + '<h2>Jira Epics</h2><ul>'`,
    `+ '<h2>Coverage Gate</h2><p>Status: <strong>' + esc(coverageSummary.gateStatus || root.qualityGate.coverageGate || 'not_reported') + '</strong> | Ledger rows: ' + esc(coverageSummary.coverageLedgerCount || 0) + ' | Covered: ' + esc(coverageSummary.coveredCount || 0) + ' | Partial: ' + esc(coverageSummary.partialCount || 0) + ' | Missing: ' + esc(coverageSummary.missingCount || 0) + ' | Recovered: ' + esc(coverageSummary.recoveredCount || 0) + '</p>' + coverageTable
  + '<h2>Batch Generation Summary</h2><p>Total batches: ' + esc(batchSummary.totalBatches || 0) + ' | Completed: ' + esc(batchSummary.completedBatches || 0) + ' | Retried: ' + esc(batchSummary.recoveredBatches || 0) + ' | Missing: ' + esc(batchSummary.missingBatches || 0) + '</p>' + batchTable
  + '<h2>Jira Epics</h2><ul>'`
  );

  return code;
}

function patchReturnResult(code) {
  if (code.includes("stage: 'published'")) return code;
  code = code.replace(
    `coverageLedger: root.coverageLedger || root.qualityGate?.coverageLedger || root.generated?.document?.coverageLedger || [], coverageSummary: root.coverageSummary || root.qualityGate?.coverageSummary || null, sourceCoverage: root.qualityGate?.sourceCoverage || [], retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0, retrievalQuality: root.retrievalQuality || null`,
    `coverageLedger: root.coverageLedger || root.qualityGate?.coverageLedger || root.generated?.document?.coverageLedger || [], coverageSummary: root.coverageSummary || root.qualityGate?.coverageSummary || null, batchPlan: root.batchPlan || root.qualityGate?.batchPlan || root.generated?.document?.batchPlan || null, batchSummary: root.batchSummary || root.qualityGate?.batchSummary || root.generated?.document?.batchResults || null, progress: { stage: 'published', stageLabel: 'Published to Jira and Confluence', progressPercent: 100, summary: 'Epics and user stories were generated in module batches, coverage-reviewed, published to Jira, and summarized in Confluence.', coverage: root.coverageSummary || root.qualityGate?.coverageSummary || null, batches: root.batchSummary?.batches || root.qualityGate?.batchSummary?.batches || root.generated?.document?.batchResults?.batches || [] }, generationSummary: { epicCount: root.qualityGate?.epicCount || (root.jiraResults?.epics || []).length, storyCount: root.qualityGate?.storyCount || (root.jiraResults?.stories || []).length, coverageGate: root.coverageSummary?.gateStatus || root.qualityGate?.coverageGate || 'not_reported', batchCount: root.batchSummary?.totalBatches || root.qualityGate?.batchSummary?.totalBatches || 0 }, sourceCoverage: root.qualityGate?.sourceCoverage || [], retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0, retrievalQuality: root.retrievalQuality || null`
  );
  return code;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_batch_progress_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const connections = row.connections ? parseAny(row.connections) : {};

    const prompt = requireNode(nodes, 'Professional Prompt Library');
    const validate = requireNode(nodes, 'Validate Team Managed Backlog');
    const confluence = requireNode(nodes, 'Prepare Confluence Upsert');
    const result = requireNode(nodes, 'Return Team Managed Professional Result');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    validate.parameters.jsCode = patchValidateBacklog(validate.parameters.jsCode);
    confluence.parameters.jsCode = patchPrepareConfluence(confluence.parameters.jsCode);
    result.parameters.jsCode = patchReturnResult(result.parameters.jsCode);

    for (const node of [prompt, validate, confluence, result]) {
      try {
        new Function(node.parameters.jsCode);
      } catch (error) {
        const tmp = path.join(process.cwd(), `tmp_backlog_batch_${node.name.replace(/[^A-Za-z0-9_-]+/g, '_')}.js`);
        fs.writeFileSync(tmp, node.parameters.jsCode);
        throw new Error(`Code validation failed for ${node.name}: ${error.message}. Wrote ${tmp}`);
      }
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      added: [
        'batched backlog generation prompt contract',
        'batchPlan/batchSummary validation metadata',
        'batch summary in Confluence output',
        'final progress and generation summary in workflow result'
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
