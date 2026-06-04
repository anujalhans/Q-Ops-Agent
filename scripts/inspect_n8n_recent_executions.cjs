const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = process.argv[2];
const limit = Number(process.argv[3] || 20);

if (!workflowId) {
  console.error('Usage: node scripts/inspect_n8n_recent_executions.cjs <workflowId> [limit]');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all(
  `select id, workflowId, mode, status, startedAt, stoppedAt, retryOf, retrySuccessId
   from execution_entity
   where workflowId = ?
   order by id desc
   limit ?`,
  [workflowId, limit],
  (error, rows) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
  },
);
