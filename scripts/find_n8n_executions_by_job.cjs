const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const jobId = process.argv[2];
const limit = Number(process.argv[3] || 25);

if (!jobId) {
  console.error('Usage: node scripts/find_n8n_executions_by_job.cjs <jobId> [limit]');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

function parseJson(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function summarizeRunData(data) {
  const resultData = data?.resultData || {};
  const runData = resultData.runData || {};
  const error = resultData.error || null;
  const nodeNames = Object.keys(runData);
  const failedNodes = Object.entries(runData)
    .flatMap(([nodeName, runs]) => (Array.isArray(runs) ? runs : []).map((run) => ({ nodeName, run })))
    .filter(({ run }) => run?.error)
    .map(({ nodeName, run }) => ({
      nodeName,
      message: run.error?.message || '',
      description: run.error?.description || '',
      node: run.error?.node?.name || run.error?.nodeName || nodeName,
    }));
  return {
    topError: error ? {
      message: error.message || '',
      description: error.description || '',
      node: error.node?.name || error.nodeName || '',
    } : null,
    failedNodes,
    nodeNames,
  };
}

(async () => {
  try {
    const rows = await all(
      `select e.id, e.workflowId, e.mode, e.status, e.startedAt, e.stoppedAt, d.data
       from execution_entity e
       left join execution_data d on d.executionId = e.id
       where d.data like ?
       order by e.startedAt desc
       limit ?`,
      [`%${jobId}%`, limit],
    );
    const matches = rows.map((row) => {
      const data = parseJson(row.data);
      return {
        id: row.id,
        workflowId: row.workflowId,
        mode: row.mode,
        status: row.status,
        startedAt: row.startedAt,
        stoppedAt: row.stoppedAt,
        ...summarizeRunData(data),
      };
    });
    console.log(JSON.stringify({ jobId, matches }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
