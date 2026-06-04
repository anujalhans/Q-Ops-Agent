const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'QApRBFSaJgINsdHN';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backupPath = path.join(backupDir, `workflow_${workflowId}_before_reuse_action_counts_${stamp}.json`);

const db = new sqlite3.Database(dbPath);

db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error(`Workflow ${workflowId} not found`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

  const nodes = JSON.parse(row.nodes);
  const node = nodes.find(n => n.name === 'LOG: Professional Backlog Completed');
  if (!node) throw new Error('LOG: Professional Backlog Completed node not found');

  const before = node.parameters.jsonBody;
  const replacements = [
    ['e.action === "created"', '["created","create"].includes(e.action)'],
    ['e.action === "reused"', '["reused","reuse"].includes(e.action)'],
    ['s.action === "created"', '["created","create"].includes(s.action)'],
    ['s.action === "reused"', '["reused","reuse"].includes(s.action)'],
    ['e.action === "updated"', '["updated","update"].includes(e.action)'],
    ['s.action === "updated"', '["updated","update"].includes(s.action)']
  ];

  for (const [from, to] of replacements) {
    if (!node.parameters.jsonBody.includes(from)) {
      throw new Error(`Expected metric expression not found: ${from}`);
    }
    node.parameters.jsonBody = node.parameters.jsonBody.replace(from, to);
  }

  db.run(
    'update workflow_entity set nodes = ?, updatedAt = CURRENT_TIMESTAMP where id = ?',
    [JSON.stringify(nodes), workflowId],
    updateErr => {
      if (updateErr) throw updateErr;
      console.log(JSON.stringify({
        workflowId,
        patched: true,
        backupPath,
        changed: before !== node.parameters.jsonBody,
        changes: [
          'Professional backlog completion metrics now count reuse/create/update action aliases.'
        ]
      }, null, 2));
      db.close();
    }
  );
});
