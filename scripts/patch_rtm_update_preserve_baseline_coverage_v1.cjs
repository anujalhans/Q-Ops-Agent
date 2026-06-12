const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_update_preserve_baseline_coverage_v1';
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

  const oldKeyLine = "  const key = [coverageId, moduleRequirement].filter(Boolean).join('::').toLowerCase() || JSON.stringify(row || {});";
  const newKeyLine = "  const key = (coverageId || moduleRequirement || sourceReference || JSON.stringify(row || {})).toLowerCase();";
  if (code.includes(oldKeyLine)) {
    code = code.replace(oldKeyLine, newKeyLine);
  } else if (!code.includes(newKeyLine)) {
    throw new Error('normalizeCoverageRow key line was not found.');
  }

  const marker = 'function buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger) {';
  const helper = String.raw`
function rtmStatusRank(status) {
  const value = String(status || '').trim().toLowerCase();
  if (['covered', 'passed', 'complete', 'included'].includes(value)) return 3;
  if (['partial', 'needs review', 'warning'].includes(value)) return 2;
  if (['missing', 'unknown', 'not covered', 'failed'].includes(value)) return 1;
  return 0;
}

function rtmShouldPreservePreviousCoverage(previousRow, currentRow) {
  if (!previousRow || !currentRow || coverageRowIsExplicitlyRemoved(currentRow)) return false;
  const previous = normalizeCoverageRow(previousRow);
  const current = normalizeCoverageRow(currentRow);
  const previousRank = rtmStatusRank(previous.coverageStatus);
  const currentRank = rtmStatusRank(current.coverageStatus);
  if (previousRank < 3 || currentRank >= previousRank) return false;
  const currentText = [current.includedInOutput, current.notes, current.sourceReference].join(' ').toLowerCase();
  return currentRank <= 1
    && /\b(no linkage|not linked|missing in current|no story|no backlog|current context|current evidence|not found)\b/.test(currentText);
}

`;
  if (!code.includes(marker)) throw new Error('RTM effective coverage marker was not found.');
  if (!code.includes('function rtmShouldPreservePreviousCoverage')) {
    code = code.replace(marker, helper + marker);
  }

  const oldLoopBlock = String.raw`    if (!effectiveByKey.has(normalized.key)) {
      addedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
      continue;
    }
    if (previousComparableByKey.get(normalized.key) !== comparableCoverageRow(row)) {
      updatedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
    }`;
  const newLoopBlock = String.raw`    if (!effectiveByKey.has(normalized.key)) {
      addedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
      continue;
    }
    const previousRow = effectiveByKey.get(normalized.key);
    if (rtmShouldPreservePreviousCoverage(previousRow, row)) {
      continue;
    }
    if (previousComparableByKey.get(normalized.key) !== comparableCoverageRow(row)) {
      updatedRows.push(coverageLabel(row));
      effectiveByKey.set(normalized.key, row);
    }`;
  if (!code.includes(oldLoopBlock)) throw new Error('RTM merge loop block was not found.');
  code = code.replace(oldLoopBlock, newLoopBlock);

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
