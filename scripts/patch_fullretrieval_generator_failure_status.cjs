const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try {
    return JSON.parse(value);
  } catch {
    return require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted').parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_generator_failure_status_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const updateNode = requireNode(nodes, 'Update Job Status: Generator Agent Failed');
    updateNode.parameters.url = "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $('Handle: Generator Agent Failed').item.json.jobId }}&status=eq.processing";
    updateNode.parameters.jsonHeaders = '{\n  "Content-Type": "application/json",\n  "Prefer": "return=representation"\n}';
    updateNode.parameters.jsonBody = `={
  "status": "failed",
  "error": "{{ $('Handle: Generator Agent Failed').item.json.message }}",
  "output": {
    "error": true,
    "errorType": "GENERATOR_AGENT_FAILED",
    "message": "{{ $('Handle: Generator Agent Failed').item.json.message }}",
    "failed_at": "{{ $('Handle: Generator Agent Failed').item.json.timestamp }}"
  },
  "updated_at": "{{ new Date().toISOString() }}"
}`;
    updateNode.credentials = {
      httpCustomAuth: {
        id: 'DpZbhUxkEbKeXIiJ',
        name: 'supabase-service-role-key'
      }
    };
    updateNode.alwaysOutputData = true;

    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      new Date().toISOString(),
      workflowId
    ]);

    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        new Date().toISOString(),
        workflowId,
        row.activeVersionId
      ]);
    }

    console.log(JSON.stringify({
      workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      patchedNode: updateNode.name
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
