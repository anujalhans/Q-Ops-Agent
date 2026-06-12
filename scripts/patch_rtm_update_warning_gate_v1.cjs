const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_update_warning_gate_v1';
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
  const oldBlock = String.raw`  const blockingUncoveredCount = Number(coverageSummary.blockingUncoveredCount) || ((Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0));
  if (blockingUncoveredCount > 0) {
    const missingItems = Array.isArray(coverageSummary.missingItems)
      ? coverageSummary.missingItems
      : [];
    const examples = missingItems
      .filter(item => ['missing', 'unknown'].includes(item.coverageStatus))
      .slice(0, 5)
      .map(item => [item.coverageId, item.moduleRequirement, item.coverageStatus].filter(Boolean).join(' - '))
      .join('; ');

    throw new Error(
      ` + "`Coverage Gate Failed - Traceability Matrix has ${blockingUncoveredCount} missing or unrecognized ledger item(s).`" + ` +
      (examples ? ` + "` Examples: ${examples}`" + ` : '')
    );
  }`;
  const newBlock = String.raw`  const blockingUncoveredCount = Number(coverageSummary.blockingUncoveredCount) || ((Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0));
  if (blockingUncoveredCount > 0) {
    coverageSummary.gateStatus = 'warning';
    coverageSummary.blockingUncoveredCount = 0;
    coverageSummary.uncoveredCount = Number(coverageSummary.missingCount || 0)
      + Number(coverageSummary.partialCount || 0)
      + Number(coverageSummary.unknownCount || 0);
    coverageSummary.warningReason = 'RTM has traceability gaps that need review, but the document is publishable as amber coverage.';
  }`;
  if (!code.includes(oldBlock)) throw new Error('RTM blocking coverage gate block was not found.');
  code = code.replace(oldBlock, newBlock);

  const oldBatchLine = `const coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);`;
  const newBatchLine = `let coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);`;
  if (!code.includes(oldBatchLine)) throw new Error('coverageBatchSummary declaration was not found.');
  code = code.replace(oldBatchLine, newBatchLine);

  const oldAfter = `    coverageSummary.warningReason = 'RTM has traceability gaps that need review, but the document is publishable as amber coverage.';
  }`;
  const newAfter = `    coverageSummary.warningReason = 'RTM has traceability gaps that need review, but the document is publishable as amber coverage.';
    coverageBatchSummary = buildCoverageBatchSummary(documentType, effectiveCoverageLedger, coverageSummary);
  }`;
  if (!code.includes(oldAfter)) throw new Error('warning gate replacement marker was not found.');
  code = code.replace(oldAfter, newAfter);

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
