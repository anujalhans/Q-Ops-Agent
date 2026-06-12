const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'QApRBFSaJgINsdHN';
const nodeName = 'Restore Completion Before Status Update';
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

const patchedCode = String.raw`const item = $('Build Backlog Completion Output').first().json;
const output = item.output && typeof item.output === 'object' ? item.output : {};

function array(value) {
  return Array.isArray(value) ? value.filter(entry => entry && typeof entry === 'object') : [];
}
function numberValue(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}
function coverageSummaryFromLedger(rows) {
  const summary = {
    mode: 'enforced',
    version: 'backlog-coverage-ledger-v1',
    gateStatus: 'passed',
    coverageLedgerCount: rows.length,
    coveredCount: 0,
    partialCount: 0,
    missingCount: 0,
    unknownCount: 0,
    excludedCount: 0,
    uncoveredCount: 0,
    blockingUncoveredCount: 0,
    missingItems: [],
  };
  for (const row of rows) {
    const status = String(row.coverageStatus || row.status || '').toLowerCase();
    if (status.includes('cover')) summary.coveredCount += 1;
    else if (status.includes('exclude')) summary.excludedCount += 1;
    else if (status.includes('partial') || status.includes('review')) {
      summary.partialCount += 1;
      summary.missingItems.push(row);
    } else {
      summary.missingCount += 1;
      summary.missingItems.push(row);
    }
  }
  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  if (summary.blockingUncoveredCount) summary.gateStatus = 'failed';
  else if (summary.partialCount) summary.gateStatus = 'warning';
  return summary;
}

const tokenUsage = output.tokenUsage || output.updateSummary?.tokenUsage || {
  source: output.updateSummary?.tokenUsage?.source || 'estimated',
  input: numberValue(output.tokensInput),
  output: numberValue(output.tokensOutput),
  total: numberValue(output.tokensTotal),
  estimatedCostUsd: numberValue(output.estimatedCostUsd),
};
tokenUsage.tokensInput = numberValue(tokenUsage.tokensInput, tokenUsage.input);
tokenUsage.tokensOutput = numberValue(tokenUsage.tokensOutput, tokenUsage.output);
tokenUsage.tokensTotal = numberValue(tokenUsage.tokensTotal, tokenUsage.total);
tokenUsage.input = numberValue(tokenUsage.input, tokenUsage.tokensInput);
tokenUsage.output = numberValue(tokenUsage.output, tokenUsage.tokensOutput);
tokenUsage.total = numberValue(tokenUsage.total, tokenUsage.tokensTotal);
tokenUsage.estimatedCostUsd = numberValue(tokenUsage.estimatedCostUsd, output.estimatedCostUsd);

const coverageLedger = array(output.coverageLedger).length
  ? array(output.coverageLedger)
  : array(output.qualityGate?.coverageLedger);
const coverageSummary = output.coverageSummary || output.qualityGate?.coverageSummary || coverageSummaryFromLedger(coverageLedger);
const tokenSavings = output.tokenSavings || output.updateSummary?.tokenSavings || null;

item.output = {
  ...output,
  tokenUsage,
  tokenSavings,
  coverageLedger,
  coverageSummary,
  qualityGate: {
    ...(output.qualityGate || {}),
    coverageLedger,
    coverageSummary,
  },
  updateSummary: output.updateSummary ? {
    ...output.updateSummary,
    tokenUsage: output.updateSummary.tokenUsage || tokenUsage,
    tokenSavings: output.updateSummary.tokenSavings || tokenSavings,
    coverageSummary: output.updateSummary.coverageSummary || coverageSummary,
    coverageLedgerCount: output.updateSummary.coverageLedgerCount || coverageSummary.coverageLedgerCount || coverageLedger.length,
  } : output.updateSummary,
  tokensInput: tokenUsage.input,
  tokensOutput: tokenUsage.output,
  tokensTotal: tokenUsage.total,
  estimatedCostUsd: tokenUsage.estimatedCostUsd,
};

return [{ json: item }];`;

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
    const node = nodes.find(item => item.name === nodeName);
    if (!node?.parameters) throw new Error(`Node not found: ${nodeName}`);
    const before = node.parameters.jsCode || '';
    if (before.includes('coverageSummaryFromLedger') && before.includes('item.output = {')) {
      console.log(JSON.stringify({ workflowId, nodeName, changed: false, reason: 'already patched' }, null, 2));
      return;
    }

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_completion_restore_standard_output_v1_${stamp()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));
    node.parameters.jsCode = patchedCode;

    let historyNodes = null;
    let historyConnections = null;
    if (historyRow) {
      historyNodes = parse(historyRow.nodes);
      historyConnections = parse(historyRow.connections) || {};
      const historyNode = historyNodes.find(item => item.name === nodeName);
      if (historyNode?.parameters) historyNode.parameters.jsCode = patchedCode;
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      now,
      workflowId,
    ]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(historyNodes),
        JSON.stringify(historyConnections),
        now,
        workflowId,
        row.activeVersionId,
      ]);
    }

    console.log(JSON.stringify({ workflowId, workflowName: row.name, nodeName, backupPath, changed: true }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
