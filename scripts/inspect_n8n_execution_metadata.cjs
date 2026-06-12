const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const executionId = process.argv[2];

if (!executionId) {
  console.error('Usage: node scripts/inspect_n8n_execution_metadata.cjs <executionId>');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

(async () => {
  try {
    const execution = await get('select * from execution_entity where id = ?', [executionId]);
    const metadata = await all('select * from execution_metadata where executionId = ? order by key', [executionId]);
    const data = await get('select length(data) as dataLength, substr(data, 1, 500) as dataPreview from execution_data where executionId = ?', [executionId]);
    console.log(JSON.stringify({ execution, metadata, data }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
