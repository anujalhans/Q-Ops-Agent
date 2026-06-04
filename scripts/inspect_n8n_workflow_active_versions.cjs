const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = process.argv[2];

if (!workflowId) {
  console.error('Usage: node scripts/inspect_n8n_workflow_active_versions.cjs <workflowId>');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function credentialSummary(nodesText) {
  const nodes = JSON.parse(nodesText || '[]');
  return nodes
    .filter((node) => node.credentials && Object.keys(node.credentials).length)
    .map((node) => ({ nodeName: node.name, credentials: node.credentials }));
}

(async () => {
  const entityRows = await all('select id, name, versionId, activeVersionId, nodes from workflow_entity where id = ?', [workflowId]);
  const publishedRows = await all('select workflowId, publishedVersionId from workflow_published_version where workflowId = ?', [workflowId]);
  const historyRows = await all(
    'select versionId, workflowId, createdAt, updatedAt, nodes from workflow_history where workflowId = ? order by updatedAt desc, createdAt desc',
    [workflowId],
  );
  const entity = entityRows[0] || null;
  const published = publishedRows[0] || null;
  const activeVersionId = published?.publishedVersionId || entity?.activeVersionId || null;
  const activeHistory = historyRows.find((row) => row.versionId === activeVersionId) || null;
  console.log(JSON.stringify({
    workflowId,
    entityVersionId: entity?.versionId || null,
    entityActiveVersionId: entity?.activeVersionId || null,
    publishedVersionId: published?.publishedVersionId || null,
    entityCredentials: entity ? credentialSummary(entity.nodes) : [],
    activeHistoryVersionId: activeHistory?.versionId || null,
    activeHistoryCredentials: activeHistory ? credentialSummary(activeHistory.nodes) : [],
    historyVersions: historyRows.map((row) => ({ versionId: row.versionId, createdAt: row.createdAt, updatedAt: row.updatedAt })),
  }, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
