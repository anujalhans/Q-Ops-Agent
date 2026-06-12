const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const sql = process.argv.slice(2).join(' ');
if (!sql) {
  console.error('Usage: node scripts/query_n8n_sqlite_readonly.cjs "<sql>"');
  process.exit(1);
}

const db = new sqlite3.Database('C:/Users/anujalhans01/.n8n/database.sqlite', sqlite3.OPEN_READONLY);
db.all(sql, (error, rows) => {
  if (error) {
    console.error(error.message || error);
    db.close();
    process.exit(1);
  }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
