const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = process.argv[2];
const nodeName = process.argv[3];

if (!workflowId || !nodeName) {
  console.error('Usage: node scripts/inspect_n8n_workflow_node_code.cjs <workflowId> <nodeName>');
  process.exit(1);
}

const db = new sqlite3.Database('C:/Users/anujalhans01/.n8n/database.sqlite', sqlite3.OPEN_READONLY);

db.get('select nodes from workflow_entity where id = ?', [workflowId], (error, row) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
    db.close();
    return;
  }
  const nodes = JSON.parse(row?.nodes || '[]');
  const found = nodes.find((node) => node.name === nodeName);
  if (!found) {
    console.error(`Node not found: ${nodeName}`);
    process.exitCode = 1;
    db.close();
    return;
  }
  console.log(found.parameters?.jsCode || JSON.stringify(found.parameters || {}, null, 2));
  db.close();
});
