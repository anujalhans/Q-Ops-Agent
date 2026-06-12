const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = process.argv[2];
if (!workflowId) {
  console.error('Usage: node scripts/sync_n8n_active_history_from_entity.cjs <workflowId>');
  process.exit(1);
}

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const db = new sqlite3.Database(dbPath);

function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve({ changes: this.changes });
  }));
}

function summarize(row) {
  const nodes = JSON.parse(row.nodes || '[]');
  const connections = JSON.parse(row.connections || '{}');
  return {
    versionId: row.versionId,
    nodeCount: nodes.length,
    hasFetchPublishedLinks: nodes.some((node) => node.name === 'Fetch Published Story Test Case Links'),
    buildSourceConnection: connections['Build Story Source Items'] || null,
    fetchConnection: connections['Fetch Published Story Test Case Links'] || null,
    hasStcDeltaScopeV3: nodes.some((node) => String(node.parameters?.jsCode || '').includes('stc-delta-scope-v3')),
    hasRepairTargetsSatisfiedGuard: nodes.some((node) => String(node.parameters?.jsCode || '').includes('including retry repair targets')),
  };
}

(async () => {
  fs.mkdirSync(backupDir, { recursive: true });

  const entity = await get(
    'select id, name, versionId, activeVersionId, nodes, connections from workflow_entity where id = ?',
    [workflowId],
  );
  if (!entity) throw new Error(`Workflow not found: ${workflowId}`);
  if (!entity.activeVersionId) throw new Error(`Workflow has no activeVersionId: ${workflowId}`);

  const history = await get(
    'select versionId, workflowId, nodes, connections from workflow_history where workflowId = ? and versionId = ?',
    [workflowId, entity.activeVersionId],
  );
  if (!history) throw new Error(`Active history row not found: ${workflowId} ${entity.activeVersionId}`);

  const backupPath = path.join(
    backupDir,
    `workflow_${workflowId}_active_history_${entity.activeVersionId}_before_sync_${stamp}.json`,
  );
  fs.writeFileSync(backupPath, JSON.stringify({ entity, history }, null, 2));

  const before = { entity: summarize(entity), activeHistory: summarize(history) };
  const result = await run(
    "update workflow_history set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
    [entity.nodes, entity.connections, workflowId, entity.activeVersionId],
  );
  const updatedHistory = await get(
    'select versionId, workflowId, nodes, connections from workflow_history where workflowId = ? and versionId = ?',
    [workflowId, entity.activeVersionId],
  );

  console.log(JSON.stringify({
    ok: true,
    workflowId,
    activeVersionId: entity.activeVersionId,
    backupPath,
    changes: result.changes,
    before,
    after: { activeHistory: summarize(updatedHistory) },
  }, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
