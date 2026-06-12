const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = process.argv[2] || 'Vwc6c8ehsRTF8svG';
const names = process.argv.slice(3);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get('select id, name, nodes, activeVersionId from workflow_entity where id = ?', [workflowId], (error, row) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
    db.close();
    return;
  }
  try {
    const nodes = JSON.parse(row.nodes || '[]');
    const selected = names.length
      ? nodes.filter((node) => names.includes(node.name))
      : nodes.filter((node) => node.type === 'n8n-nodes-base.code');
    console.log(JSON.stringify({
      workflow: { id: row.id, name: row.name, activeVersionId: row.activeVersionId },
      nodes: selected.map((node) => ({
        name: node.name,
        type: node.type,
        position: node.position,
        jsCode: node.parameters?.jsCode || null,
      })),
    }, null, 2));
  } catch (parseError) {
    console.error(parseError);
    process.exitCode = 1;
  } finally {
    db.close();
  }
});
