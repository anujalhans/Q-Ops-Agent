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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_delta_accounting_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const validateNode = requireNode(nodes, 'Validate Team Managed Backlog');
    let code = validateNode.parameters.jsCode;

    const before = `const reportedDeltaText = JSON.stringify({
  updateSummaryDeltaRequirementIds: updateSummaryForDelta.deltaRequirementIds || [],
  coverageLedger,
  sourceCoverage,
  epics
}).toUpperCase();
const missingDeltaTargetIds = expectedDeltaIds.filter(id => !reportedDeltaText.includes(id));`;
    const after = `const reportedDeltaText = JSON.stringify({
  updateSummaryDeltaRequirementIds: updateSummaryForDelta.deltaRequirementIds || [],
  resolvedCoverageIds: updateSummaryForDelta.resolvedCoverageIds || [],
  unchangedCoverageIds: updateSummaryForDelta.unchangedCoverageIds || [],
  noChangeReason: updateSummaryForDelta.noChangeReason || '',
  coverageLedger,
  sourceCoverage,
  epics
}).toUpperCase();
const accountedDeltaIds = new Set([
  ...textList(updateSummaryForDelta.deltaRequirementIds),
  ...textList(updateSummaryForDelta.resolvedCoverageIds),
  ...textList(updateSummaryForDelta.unchangedCoverageIds),
  ...coverageLedger.flatMap(row => textList(row.coverageId, row.mappedCoverageIds, row.intendedCoverageIds)),
  ...sourceCoverage.flatMap(item => textList(item)),
  ...epics.flatMap(epic => textList(epic.sourceTraceability, epic.sourceReferences, (epic.stories || []).flatMap(story => textList(story.sourceTraceability, story.sourceReferences))))
].map(id => String(id || '').toUpperCase()).filter(Boolean));
const missingDeltaTargetIds = expectedDeltaIds.filter(id => !accountedDeltaIds.has(id) && !reportedDeltaText.includes(id));`;
    if (!code.includes('const accountedDeltaIds = new Set([')) {
      if (!code.includes(before)) throw new Error('delta accounting block anchor not found');
      code = code.replace(before, after);
    }

    new Function(code);
    validateNode.parameters.jsCode = code;

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
        'Update-mode delta target accounting now accepts resolvedCoverageIds and unchangedCoverageIds',
        'Compact update repairs no longer need to restate already-covered ledger rows to stay green',
        'Coverage ledger and source traceability still count as direct delta evidence'
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
