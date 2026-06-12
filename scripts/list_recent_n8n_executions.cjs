const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = process.argv[2] || null;
const limit = Number(process.argv[3] || 25);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

(async () => {
  try {
    const where = workflowId ? 'where workflowId = ?' : '';
    const rows = await all(
      `select id, workflowId, mode, status, startedAt, stoppedAt
       from execution_entity
       ${where}
       order by startedAt desc
       limit ?`,
      workflowId ? [workflowId, limit] : [limit],
    );
    console.log(JSON.stringify({ workflowId, rows }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
