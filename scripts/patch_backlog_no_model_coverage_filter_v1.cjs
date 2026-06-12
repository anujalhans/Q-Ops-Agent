const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function stamp() {
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

function parse(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function requireCodeNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${name}`);
  return node;
}

function insertCoverageFilterInLiveContext(code) {
  if (code.includes('const validCoverageRows = coverageRows.filter(isBacklogCoverageLedgerRow);')) {
    return { code, changed: false };
  }
  const marker = '\nconst liveUpdateContext = root.updateMode ? {';
  if (!code.includes(marker)) throw new Error('Live context insertion marker not found');
  const helper = String.raw`
function isBacklogCoverageLedgerRow(row) {
  const id = clean(row?.coverageId);
  const module = clean(row?.moduleRequirement);
  const status = clean(row?.coverageStatus || row?.status).toLowerCase();
  const notes = clean(row?.notes).toLowerCase();
  if (!id) return false;
  if (/^(coverage id|batch id)$/i.test(id)) return false;
  if (/^batch[-_\s]/i.test(id)) return false;
  if (/^module$/i.test(module)) return false;
  if (/^status$/i.test(status)) return false;
  if (notes === 'coverage ids') return false;
  return /(covered|partial|missing|excluded|review|gap|not covered|unknown)/i.test(status);
}

const validCoverageRows = coverageRows.filter(isBacklogCoverageLedgerRow);
`;
  code = code.replace(marker, helper + marker);
  code = code.replace('previousCoverageLedger: coverageRows,', 'previousCoverageLedger: validCoverageRows,');
  code = code.replace('coverageLedgerCount: coverageRows.length,', 'coverageLedgerCount: validCoverageRows.length,');
  code = code.replace('coveredCount: coverageRows.filter(row => /cover/i.test(row.coverageStatus)).length,', 'coveredCount: validCoverageRows.filter(row => /cover/i.test(row.coverageStatus)).length,');
  code = code.replace('partialCount: coverageRows.filter(row => /partial|review/i.test(row.coverageStatus)).length,', 'partialCount: validCoverageRows.filter(row => /partial|review/i.test(row.coverageStatus)).length,');
  code = code.replace('missingCount: coverageRows.filter(row => /missing|gap|unknown/i.test(row.coverageStatus)).length', 'missingCount: validCoverageRows.filter(row => /missing|gap|unknown/i.test(row.coverageStatus)).length');
  code = code.replace('confluenceCoverageRows: coverageRows.length', 'confluenceCoverageRows: validCoverageRows.length');
  return { code, changed: true };
}

function insertCoverageFilterInNoModelResult(code) {
  if (code.includes('const rawPreviousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger)')) {
    return { code, changed: false };
  }
  const original = "const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];";
  if (!code.includes(original)) throw new Error('No-model coverage ledger marker not found');
  const replacement = String.raw`const rawPreviousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
function isBacklogCoverageLedgerRow(row) {
  const id = String(row?.coverageId || '').trim();
  const module = String(row?.moduleRequirement || row?.requirement || '').trim();
  const status = String(row?.coverageStatus || row?.status || '').trim().toLowerCase();
  const notes = String(row?.notes || '').trim().toLowerCase();
  if (!id) return false;
  if (/^(coverage id|batch id)$/i.test(id)) return false;
  if (/^batch[-_\s]/i.test(id)) return false;
  if (/^module$/i.test(module)) return false;
  if (/^status$/i.test(status)) return false;
  if (notes === 'coverage ids') return false;
  return /(covered|partial|missing|excluded|review|gap|not covered|unknown)/i.test(status);
}
const previousCoverageLedger = rawPreviousCoverageLedger.filter(isBacklogCoverageLedgerRow);`;
  return { code: code.replace(original, replacement), changed: true };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;
    const nodes = parse(row.nodes);
    const connections = parse(row.connections) || {};
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_no_model_coverage_filter_v1_${stamp()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));

    const liveNode = requireCodeNode(nodes, 'Build Live Update Context');
    const noModelNode = requireCodeNode(nodes, 'Build Backlog No-Model Result');
    const livePatch = insertCoverageFilterInLiveContext(liveNode.parameters.jsCode);
    const noModelPatch = insertCoverageFilterInNoModelResult(noModelNode.parameters.jsCode);
    liveNode.parameters.jsCode = livePatch.code;
    noModelNode.parameters.jsCode = noModelPatch.code;

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      now,
      workflowId,
    ]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        JSON.stringify(connections),
        now,
        workflowId,
        row.activeVersionId,
      ]);
    }
    console.log(JSON.stringify({
      workflowId,
      workflowName: row.name,
      backupPath,
      changes: {
        buildLiveUpdateContext: livePatch.changed,
        buildBacklogNoModelResult: noModelPatch.changed,
      },
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
