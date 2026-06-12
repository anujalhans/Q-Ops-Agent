const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const { parse: parseFlatted } = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const executionId = process.argv[2];
const nodeName = process.argv[3];

if (!executionId || !nodeName) {
  console.error('Usage: node scripts/inspect_n8n_execution_node.cjs <executionId> <nodeName>');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

function parseData(value) {
  try {
    return parseFlatted(value);
  } catch {
    return JSON.parse(value);
  }
}

(async () => {
  try {
    const row = await get('select data from execution_data where executionId = ?', [executionId]);
    if (!row) throw new Error(`No execution_data found for ${executionId}`);
    const data = parseData(row.data);
    const runs = data?.resultData?.runData?.[nodeName] || [];
    const summaries = runs.map((run, index) => ({
      index,
      error: run.error ? {
        message: run.error.message || '',
        description: run.error.description || '',
        node: run.error.node?.name || run.error.nodeName || nodeName,
      } : null,
      items: (run.data?.main?.[0] || []).map((item) => item?.json ?? item).slice(0, 5),
    }));
    console.log(JSON.stringify({ executionId, nodeName, runs: summaries }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
