const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function nowStamp() {
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

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node?.parameters?.jsCode) throw new Error(`Code node not found: ${name}`);
  return node;
}

const gateCode = `const request = $json || {};
const updateContext = request.updateContext && typeof request.updateContext === 'object' ? request.updateContext : {};
const updateMode = String(request.generationMode || '').toLowerCase() === 'update' || Boolean(updateContext.updateMode || updateContext.previousJobId);
const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
const previousCoverageSummary = updateContext.previousCoverageSummary || {};
const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];
const status = String(previousCoverageSummary.gateStatus || previousCoverageSummary.status || '').toLowerCase();
const rows = previousCoverageLedger.length || Number(previousCoverageSummary.coverageLedgerCount || 0) || 0;
const unresolved = previousCoverageLedger.filter(row => {
  const value = String(row.coverageStatus || row.status || '').toLowerCase();
  return value.includes('partial') || value.includes('missing') || value.includes('unknown') || value.includes('gap') || value.includes('review');
});
const previousCoverageClean = rows > 0
  && unresolved.length === 0
  && !['warning', 'failed', 'not_reported'].includes(status)
  && (Number(previousCoverageSummary.missingCount) || 0) === 0
  && (Number(previousCoverageSummary.partialCount) || 0) === 0
  && (Number(previousCoverageSummary.unknownCount) || 0) === 0;
const sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length > 0;

const normalizeId = value => String(value || '').trim().toUpperCase().replace(/_/g, '-');
const expectedDeltaIds = Array.isArray(request.updateDeltaTargets?.requirementIds)
  ? [...new Set(request.updateDeltaTargets.requirementIds.map(normalizeId).filter(Boolean))]
  : [];
const previousSummary = updateContext.previousUpdateSummary && typeof updateContext.previousUpdateSummary === 'object'
  ? updateContext.previousUpdateSummary
  : {};
const previousResolvedText = JSON.stringify({
  deltaRequirementIds: previousSummary.deltaRequirementIds || [],
  resolvedCoverageIds: previousSummary.resolvedCoverageIds || [],
  unchangedCoverageIds: previousSummary.unchangedCoverageIds || [],
  coverageLedger: previousCoverageLedger,
  coverageSummary: previousCoverageSummary
}).toUpperCase().replace(/_/g, '-');
const missingExpectedDeltaIds = expectedDeltaIds.filter(id => !previousResolvedText.includes(id));

const noModelRequired = Boolean(
  updateMode
  && previousEpics.length
  && previousStories.length
  && previousCoverageClean
  && !sourceChanged
  && missingExpectedDeltaIds.length === 0
);

return [{ json: {
  ...request,
  backlogDeltaDecision: {
    version: 'backlog-delta-gate-v2-expected-targets',
    noModelRequired,
    reason: noModelRequired
      ? 'Previous live Jira/Confluence backlog coverage is complete and all detected delta target IDs are already accounted for.'
      : missingExpectedDeltaIds.length
        ? 'Generation required because detected delta target IDs are not accounted for by the previous Backlog update.'
        : 'Generation required because coverage/source delta check is not clean.',
    previousEpicCount: previousEpics.length,
    previousStoryCount: previousStories.length,
    previousCoverageRows: rows,
    unresolvedCoverageRows: unresolved.length,
    sourceChanged,
    updateReasons,
    expectedDeltaIds,
    missingExpectedDeltaIds
  }
} }];`;

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;
    const stamp = nowStamp();
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_delta_gate_expected_targets_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    requireNode(nodes, 'Backlog Delta Gate').parameters.jsCode = gateCode;
    new Function(gateCode);

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      workflowName: row.name,
      backupPath,
      updatedAt: now,
      changes: [
        'Backlog Delta Gate no-model path now checks Professional Prompt Library updateDeltaTargets.',
        'No-model reuse is blocked when expected delta requirement IDs are missing from the previous update summary/coverage.',
        'Create mode and normal model generation path are unchanged.'
      ]
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
