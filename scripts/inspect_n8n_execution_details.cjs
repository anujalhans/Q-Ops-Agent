const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const { parse: parseFlatted } = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const executionId = process.argv[2];

if (!executionId) {
  console.error('Usage: node scripts/inspect_n8n_execution_details.cjs <executionId>');
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

function safeParse(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed[0]?.version && parsed[0]?.resultData) {
      return parseFlatted(value);
    }
    return parsed;
  } catch {
    try {
      return parseFlatted(value);
    } catch {
      return value;
    }
  }
}

function summarizeExecutionData(raw) {
  const data = safeParse(raw);
  const resultData = data?.resultData || {};
  const runData = resultData.runData || {};
  const error = resultData.error || null;
  const nodeSummaries = Object.entries(runData).map(([nodeName, runs]) => {
    const last = Array.isArray(runs) ? runs[runs.length - 1] : null;
    const firstItem = last?.data?.main?.[0]?.[0]?.json;
    return {
      nodeName,
      status: last?.error ? 'error' : 'ok',
      error: last?.error ? {
        message: last.error.message,
        description: last.error.description,
        node: last.error.node?.name || last.error.nodeName,
      } : null,
      itemPreview: firstItem && typeof firstItem === 'object' ? Object.fromEntries(
        Object.entries(firstItem).slice(0, 12)
      ) : firstItem,
    };
  });
  return { error, nodeSummaries };
}

(async () => {
  try {
    const execution = await get(
      'select id, workflowId, mode, status, startedAt, stoppedAt from execution_entity where id = ?',
      [executionId],
    );
    const tables = await all(
      "select name from sqlite_master where type = 'table' and name like '%execution%' order by name",
    );
    const dataTable = tables.find((row) => row.name === 'execution_data') ? 'execution_data' : null;
    let executionData = null;
    if (dataTable) {
      executionData = await get('select data from execution_data where executionId = ?', [executionId]);
    }
    console.log(JSON.stringify({
      execution,
      executionTables: tables.map((row) => row.name),
      details: executionData ? summarizeExecutionData(executionData.data) : null,
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
