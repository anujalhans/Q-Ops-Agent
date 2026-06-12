const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const ids = process.argv.slice(2).map((value) => Number(value)).filter(Number.isInteger);

if (!ids.length) {
  console.error('Usage: node scripts/mark_n8n_orphan_executions_stopped.cjs <executionId> [executionId...]');
  process.exit(1);
}

const allowedWorkflowIds = new Set(['SG7khcKlhHst48WH', 'ivz13uFyjfCT8149']);
const now = new Date().toISOString().replace('T', ' ').replace('Z', '');
const db = new sqlite3.Database(dbPath);

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows))));
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve(this.changes || 0);
  }));
}

(async () => {
  try {
    const placeholders = ids.map(() => '?').join(',');
    const rows = await all(
      `select id, workflowId, mode, status, startedAt, stoppedAt
       from execution_entity
       where id in (${placeholders})
       order by id`,
      ids,
    );
    const unsafe = rows.filter((row) => !allowedWorkflowIds.has(row.workflowId));
    if (unsafe.length) {
      throw new Error(`Refusing to update non-STC workflow executions: ${unsafe.map((row) => `${row.id}:${row.workflowId}`).join(', ')}`);
    }

    const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `orphan_execution_rows_before_stop_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ ids, rows }, null, 2));

    const changes = await run(
      `update execution_entity
       set status = 'crashed', stoppedAt = ?
       where id in (${placeholders})
         and workflowId in ('SG7khcKlhHst48WH', 'ivz13uFyjfCT8149')
         and status in ('running', 'new')
         and stoppedAt is null`,
      [now, ...ids],
    );
    const after = await all(
      `select id, workflowId, mode, status, startedAt, stoppedAt
       from execution_entity
       where id in (${placeholders})
       order by id`,
      ids,
    );
    console.log(JSON.stringify({ ok: true, backupPath, changes, after }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
