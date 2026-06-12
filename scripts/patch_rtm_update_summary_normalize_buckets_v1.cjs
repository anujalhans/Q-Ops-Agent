const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_update_summary_normalize_buckets_v1';
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

function patchQualityGate(node) {
  let code = node.parameters.jsCode;

  const helperMarker = 'function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary, mergeInfo = null) {';
  const helper = String.raw`
function normalizeRtmChangeBuckets(addedRows, updatedRows, preservedRows, removedRows) {
  const unique = (values) => {
    const seen = new Set();
    return (Array.isArray(values) ? values : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };
  const added = unique(addedRows);
  const removed = unique(removedRows);
  const addedKeys = new Set(added.map((value) => value.toLowerCase()));
  const removedKeys = new Set(removed.map((value) => value.toLowerCase()));
  const updated = unique(updatedRows)
    .filter((value) => !addedKeys.has(value.toLowerCase()) && !removedKeys.has(value.toLowerCase()));
  const changedKeys = new Set([
    ...added,
    ...updated,
    ...removed
  ].map((value) => value.toLowerCase()));
  const preserved = unique(preservedRows)
    .filter((value) => !changedKeys.has(value.toLowerCase()));
  return { addedRows: added, updatedRows: updated, preservedRows: preserved, removedRows: removed };
}

`;
  if (!code.includes(helperMarker)) throw new Error('RTM update summary marker was not found.');
  if (!code.includes('function normalizeRtmChangeBuckets')) {
    code = code.replace(helperMarker, helper + helperMarker);
  }

  const oldDeclarations = String.raw`  const addedRows = Array.isArray(mergeInfo?.addedRows) ? mergeInfo.addedRows : [];
  const updatedRows = Array.isArray(mergeInfo?.updatedRows) ? mergeInfo.updatedRows : [];
  const preservedRows = Array.isArray(mergeInfo?.preservedRows) ? mergeInfo.preservedRows : [];
  const removedRows = Array.isArray(mergeInfo?.removedRows) ? mergeInfo.removedRows : [];
  let createdCoverageRows = addedRows.length;
  let updatedCoverageRows = updatedRows.length;
  let reusedCoverageRows = preservedRows.length;
  let removedCoverageRows = removedRows.length;`;
  const newDeclarations = String.raw`  let {
    addedRows,
    updatedRows,
    preservedRows,
    removedRows
  } = normalizeRtmChangeBuckets(
    Array.isArray(mergeInfo?.addedRows) ? mergeInfo.addedRows : [],
    Array.isArray(mergeInfo?.updatedRows) ? mergeInfo.updatedRows : [],
    Array.isArray(mergeInfo?.preservedRows) ? mergeInfo.preservedRows : [],
    Array.isArray(mergeInfo?.removedRows) ? mergeInfo.removedRows : []
  );
  let createdCoverageRows = addedRows.length;
  let updatedCoverageRows = updatedRows.length;
  let reusedCoverageRows = preservedRows.length;
  let removedCoverageRows = removedRows.length;`;
  if (!code.includes(oldDeclarations)) throw new Error('RTM update summary bucket declarations were not found.');
  code = code.replace(oldDeclarations, newDeclarations);

  const oldFallbackTail = String.raw`    removedCoverageRows = previousRows.filter(row => !currentByKey.has(row.key) && coverageRowIsExplicitlyRemoved(row)).length;
  }`;
  const newFallbackTail = String.raw`    removedCoverageRows = previousRows.filter(row => !currentByKey.has(row.key) && coverageRowIsExplicitlyRemoved(row)).length;
    ({ addedRows, updatedRows, preservedRows, removedRows } = normalizeRtmChangeBuckets(addedRows, updatedRows, preservedRows, removedRows));
    createdCoverageRows = addedRows.length;
    updatedCoverageRows = updatedRows.length;
    reusedCoverageRows = preservedRows.length;
    removedCoverageRows = removedRows.length;
  }`;
  if (!code.includes(oldFallbackTail)) throw new Error('RTM fallback bucket tail was not found.');
  code = code.replace(oldFallbackTail, newFallbackTail);

  node.parameters.jsCode = code;
  new Function(code);
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
    patchQualityGate(requireNode(nodes, 'Quality Gate'));

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, patched: ['Quality Gate'], backupPath }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
