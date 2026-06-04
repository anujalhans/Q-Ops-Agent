const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const db = new sqlite3.Database('C:/Users/anujalhans01/.n8n/database.sqlite', sqlite3.OPEN_READONLY);

db.all(
  "select name, sql from sqlite_master where type = 'table' and name like '%workflow%' order by name",
  [],
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
