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

const helper = `
function normalizeCoverageRow(row) {
  const coverageId = String(row?.coverageId || row?.coverage_id || row?.id || '').trim();
  const moduleRequirement = String(row?.moduleRequirement || row?.module_requirement || row?.requirement || row?.module || '').trim();
  const sourceReference = String(row?.sourceReference || row?.source_reference || row?.source || '').trim();
  const includedInOutput = String(row?.includedInOutput || row?.included_in_output || row?.included || '').trim();
  const coverageStatus = String(row?.coverageStatus || row?.coverage_status || row?.status || 'unknown').trim().toLowerCase();
  const notes = String(row?.notes || row?.note || row?.rationale || '').trim();
  const key = [coverageId, moduleRequirement].filter(Boolean).join('::').toLowerCase() || JSON.stringify(row || {});
  return { key, coverageId, moduleRequirement, sourceReference, includedInOutput, coverageStatus, notes };
}

function buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary) {
  const rows = (Array.isArray(coverageLedger) ? coverageLedger : []).map(normalizeCoverageRow);
  const total = rows.length || Number(coverageSummary?.coverageLedgerCount) || 0;
  const covered = Number(coverageSummary?.coveredCount) || rows.filter(row => row.coverageStatus === 'covered').length;
  const partial = Number(coverageSummary?.partialCount) || rows.filter(row => row.coverageStatus === 'partial').length;
  const missing = Number(coverageSummary?.missingCount) || rows.filter(row => row.coverageStatus === 'missing').length;
  const unknown = Number(coverageSummary?.unknownCount) || rows.filter(row => row.coverageStatus === 'unknown').length;
  const excluded = Number(coverageSummary?.excludedCount) || rows.filter(row => row.coverageStatus === 'excluded').length;
  const review = partial + missing + unknown;
  const complete = Math.max(0, covered + excluded);
  const progressPercent = total ? Math.round((complete / total) * 100) : 0;
  return {
    version: 'coverage-batch-summary-v1',
    documentType,
    total,
    covered,
    partial,
    missing,
    unknown,
    excluded,
    review,
    complete,
    progressPercent,
    gateStatus: coverageSummary?.gateStatus || coverageSummary?.status || 'not_reported',
    reviewItems: rows
      .filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus))
      .slice(0, 10)
      .map(row => ({
        coverageId: row.coverageId,
        moduleRequirement: row.moduleRequirement,
        coverageStatus: row.coverageStatus,
        notes: row.notes
      }))
  };
}
`;

function patchQualityGate(code) {
  if (code.includes('function buildCoverageBatchSummary(')) return code;
  const marker = 'function buildSharedDocumentDeltaUpdateSummary(';
  if (!code.includes(marker)) throw new Error('Shared delta update function marker not found.');
  const patched = code.replace(marker, `${helper.trim()}\n\n${marker}`);
  new Function(patched);
  return patched;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_coverage_batch_summary_${stamp}.json`);
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
      patched: ['Added normalizeCoverageRow and buildCoverageBatchSummary helpers to Quality Gate']
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
