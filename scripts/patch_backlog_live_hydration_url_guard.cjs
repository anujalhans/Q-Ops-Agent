const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error);
    else resolve(this);
  }));
}

function findNode(nodes, name) {
  return nodes.find((node) => node.name === name);
}

function requireNode(nodes, name) {
  const node = findNode(nodes, name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_live_hydration_url_guard_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const buildRequest = requireNode(nodes, 'Build Live Update Snapshot Request');
    const jiraSearch = requireNode(nodes, 'Search Live Jira Backlog');
    const confluenceSearch = requireNode(nodes, 'Search Live Confluence Backlog');

    buildRequest.parameters.jsCode = buildRequest.parameters.jsCode.replace(
      "const projectKey = String(root.jiraProjectKey || '').trim();\nconst title = 'Professional QA Backlog - ' + (root.projectName || 'Unknown Project');",
      "const projectKey = String(root.jiraProjectKey || '').trim();\nconst jiraBaseUrl = String(root.jiraBaseUrl || 'https://anujalhans1.atlassian.net').replace(/\\/$/, '');\nconst confluenceBaseUrl = String(root.confluenceBaseUrl || 'https://anujalhans1.atlassian.net/wiki').replace(/\\/$/, '');\nconst title = 'Professional QA Backlog - ' + (root.projectName || 'Unknown Project');"
    ).replace(
      "liveJiraBacklogJql,",
      "jiraBaseUrl,\n    confluenceBaseUrl,\n    liveJiraBacklogJql,"
    );

    jiraSearch.parameters.url = "={{ ($json.jiraBaseUrl || 'https://anujalhans1.atlassian.net').replace(/\\/$/, '') }}/rest/api/3/search/jql";
    confluenceSearch.parameters.url = "={{ ($json.confluenceBaseUrl || 'https://anujalhans1.atlassian.net/wiki').replace(/\\/$/, '') }}/rest/api/content";

    new Function(buildRequest.parameters.jsCode);

    const now = new Date().toISOString();
    const connections = row.connections ? parseAny(row.connections) : {};
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      changes: [
        'Build Live Update Snapshot Request now supplies safe Jira/Confluence base URL defaults',
        'Search Live Jira Backlog and Search Live Confluence Backlog now guard URL expressions against missing base URLs'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
