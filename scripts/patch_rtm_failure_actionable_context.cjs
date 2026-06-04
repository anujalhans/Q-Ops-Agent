const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'fullRetrievalD01';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const db = new sqlite3.Database(dbPath);

db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error('Workflow not found: ' + workflowId);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(
    path.join(backupDir, `workflow_${row.id}_before_rtm_failure_actionable_context_${timestamp}.json`),
    JSON.stringify(row, null, 2),
  );

  const nodes = JSON.parse(row.nodes);
  const failedNode = nodes.find((node) => node.name === 'Update Job Status as Failed1');
  if (!failedNode) throw new Error('Missing RTM quality-gate failure update node.');
  let body = String(failedNode.parameters?.jsonBody || '');

  if (!body.includes('"storiesWithoutTestCases"')) {
    const needle = '    "retryOfJobId": {{ $(\'Restore Job Context\').item.json.retryOfJobId ? JSON.stringify($(\'Restore Job Context\').item.json.retryOfJobId) : \'null\' }},\n';
    const insert = [
      needle.trimEnd(),
      '    "traceabilityContext": {{ JSON.stringify($(\'Prompt Library\').item.json.traceabilityContext || {}) }},',
      '    "storiesWithoutTestCases": {{ JSON.stringify(($(\'Prompt Library\').item.json.traceabilityContext || {}).storiesWithoutTestCases || []) }},',
    ].join('\n') + '\n';
    if (!body.includes(needle)) throw new Error('Could not locate retryOfJobId field in RTM failure output body.');
    body = body.replace(needle, insert);
  }

  failedNode.parameters.jsonBody = body;
  const saveNodes = JSON.stringify(nodes);
  db.run(
    "update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
    [saveNodes, workflowId],
    (updateErr) => {
      if (updateErr) throw updateErr;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [workflowId], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) {
          console.log('Patched RTM failure output with actionable traceability context.');
          db.close();
          return;
        }
        db.run(
          "update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
          [saveNodes, workflowId, historyRow.versionId],
          (historyUpdateErr) => {
            if (historyUpdateErr) throw historyUpdateErr;
            console.log('Patched RTM failure output with actionable traceability context.');
            db.close();
          },
        );
      });
    },
  );
});
