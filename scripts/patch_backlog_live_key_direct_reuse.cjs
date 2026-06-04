const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backupPath = path.join(backupDir, `workflow_${workflowId}_before_live_key_direct_reuse_${stamp}.json`);

function replaceNodeCode(node, before, after, label) {
  if (!node.parameters.jsCode.includes(before)) {
    throw new Error(`Could not find ${label}`);
  }
  node.parameters.jsCode = node.parameters.jsCode.replace(before, after);
}

const db = new sqlite3.Database(dbPath);

db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error(`Workflow ${workflowId} not found`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

  const nodes = JSON.parse(row.nodes);
  const determineEpic = nodes.find(node => node.name === 'Determine Epic Reuse Or Create');
  const determineStory = nodes.find(node => node.name === 'Determine Story Reuse Or Create');
  if (!determineEpic || !determineStory) throw new Error('Determine reuse/create nodes not found');

  replaceNodeCode(
    determineEpic,
    `return sources.map((source, index) => {
  const search = searches[index]?.json || {};
  const issue = Array.isArray(search.issues) && search.issues.length ? search.issues[0] : null;
  return { json: { ...source.json, action: issue?.key ? 'reuse' : 'create', existingEpicIssue: issue, jiraEpicId: issue?.id || null, jiraEpicKey: issue?.key || null, jiraEpicSelf: issue?.self || null } };
});`,
    `return sources.map((source, index) => {
  const sourceJson = source.json || {};
  const liveEpicKey = sourceJson.epic?.jiraEpicKey || sourceJson.epic?.epicKey || sourceJson.epic?.key || null;
  const liveEpicId = sourceJson.epic?.jiraEpicId || sourceJson.epic?.epicId || sourceJson.epic?.id || null;
  if (liveEpicKey) {
    return { json: { ...sourceJson, action: 'reuse', existingEpicIssue: null, jiraEpicId: liveEpicId, jiraEpicKey: liveEpicKey, jiraEpicSelf: sourceJson.epic?.jiraEpicSelf || null } };
  }
  const search = searches[index]?.json || {};
  const issue = Array.isArray(search.issues) && search.issues.length ? search.issues[0] : null;
  return { json: { ...sourceJson, action: issue?.key ? 'reuse' : 'create', existingEpicIssue: issue, jiraEpicId: issue?.id || null, jiraEpicKey: issue?.key || null, jiraEpicSelf: issue?.self || null } };
});`,
    'direct live epic key reuse'
  );

  replaceNodeCode(
    determineStory,
    `return sources.map((source, index) => {
  const search = searches[index]?.json || {};
  const issue = Array.isArray(search.issues) && search.issues.length ? search.issues[0] : null;
  return { json: { ...source.json, action: issue?.key ? 'reuse' : 'create', existingStoryIssue: issue, jiraStoryId: issue?.id || null, jiraStoryKey: issue?.key || null, jiraStorySelf: issue?.self || null } };
});`,
    `return sources.map((source, index) => {
  const sourceJson = source.json || {};
  const liveStoryKey = sourceJson.story?.jiraStoryKey || sourceJson.story?.storyKey || sourceJson.story?.key || null;
  const liveStoryId = sourceJson.story?.jiraStoryId || sourceJson.story?.storyId || sourceJson.story?.id || null;
  if (liveStoryKey) {
    return { json: { ...sourceJson, action: 'reuse', existingStoryIssue: null, jiraStoryId: liveStoryId, jiraStoryKey: liveStoryKey, jiraStorySelf: sourceJson.story?.jiraStorySelf || null } };
  }
  const search = searches[index]?.json || {};
  const issue = Array.isArray(search.issues) && search.issues.length ? search.issues[0] : null;
  return { json: { ...sourceJson, action: issue?.key ? 'reuse' : 'create', existingStoryIssue: issue, jiraStoryId: issue?.id || null, jiraStoryKey: issue?.key || null, jiraStorySelf: issue?.self || null } };
});`,
    'direct live story key reuse'
  );

  db.run(
    'update workflow_entity set nodes = ?, updatedAt = CURRENT_TIMESTAMP where id = ?',
    [JSON.stringify(nodes), workflowId],
    updateErr => {
      if (updateErr) throw updateErr;
      console.log(JSON.stringify({
        workflowId,
        patched: true,
        backupPath,
        changes: [
          'Existing live Jira epic keys are reused directly before label search fallback.',
          'Existing live Jira story keys are reused directly before label search fallback.'
        ]
      }, null, 2));
      db.close();
    }
  );
});
