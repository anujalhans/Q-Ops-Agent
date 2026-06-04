const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowIds = process.argv.slice(2);

if (!workflowIds.length) {
  console.error('Usage: node scripts/inspect_n8n_workflow_credentials.cjs <workflowId> [...]');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
  });
}

(async () => {
  for (const workflowId of workflowIds) {
    const rows = await all('select id, name, nodes from workflow_entity where id = ?', [workflowId]);
    if (!rows.length) {
      console.log(JSON.stringify({ workflowId, found: false }));
      continue;
    }
    const workflow = rows[0];
    const nodes = JSON.parse(workflow.nodes || '[]');
    const credentialNodes = nodes
      .filter((node) => node.credentials && Object.keys(node.credentials).length)
      .map((node) => ({
        nodeName: node.name,
        nodeType: node.type,
        credentials: node.credentials,
      }));
    console.log(JSON.stringify({
      workflowId,
      workflowName: workflow.name,
      credentialNodeCount: credentialNodes.length,
      credentialNodes,
    }, null, 2));
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
