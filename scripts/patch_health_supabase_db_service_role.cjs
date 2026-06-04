const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'zdx8YtZJOMWtbv1L';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const supabaseServiceRoleCredential = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key',
  },
};

function parseJsonField(value) {
  if (typeof value === 'string') return JSON.parse(value);
  return value;
}

function backup(row) {
  fs.mkdirSync(backupDir, { recursive: true });
  const file = path.join(backupDir, `workflow_${row.id}_before_health_db_service_role_${timestamp}.json`);
  fs.writeFileSync(file, JSON.stringify(row, null, 2));
  return file;
}

const db = new sqlite3.Database(dbPath);

db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);

  const backupFile = backup(row);
  const nodes = parseJsonField(row.nodes);
  const target = nodes.find((node) => node.name === 'Check: Supabase DB');
  if (!target) throw new Error('Node not found: Check: Supabase DB');

  target.credentials = supabaseServiceRoleCredential;

  db.run(
    "update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
    [JSON.stringify(nodes), workflowId],
    (updateErr) => {
      if (updateErr) throw updateErr;

      db.get(
        'select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1',
        [workflowId],
        (historyErr, historyRow) => {
          if (historyErr) throw historyErr;
          if (!historyRow) {
            console.log(`Patched ${workflowId}. Backup: ${backupFile}`);
            db.close();
            return;
          }

          db.run(
            "update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
            [JSON.stringify(nodes), workflowId, historyRow.versionId],
            (historyUpdateErr) => {
              if (historyUpdateErr) throw historyUpdateErr;
              console.log(`Patched ${workflowId}. Backup: ${backupFile}`);
              db.close();
            }
          );
        }
      );
    }
  );
});
