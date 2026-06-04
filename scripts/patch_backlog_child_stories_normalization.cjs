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

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_child_stories_normalization_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const validateNode = requireNode(nodes, 'Validate Team Managed Backlog');
    const parserNode = requireNode(nodes, 'Robust Backlog JSON Parser');
    const validateCode = validateNode.parameters.jsCode;
    const parserCode = parserNode.parameters.jsCode;

    const beforeNested = `    ...toObjectArray(epic.stories),
    ...toObjectArray(epic.userStories),
    ...toObjectArray(epic.children),
    ...toObjectArray(epic.items)`;
    const afterNested = `    ...toObjectArray(epic.stories),
    ...toObjectArray(epic.userStories),
    ...toObjectArray(epic.childStories),
    ...toObjectArray(epic.children),
    ...toObjectArray(epic.items)`;
    if (!validateCode.includes(beforeNested)) throw new Error('Expected nested story normalization block not found');
    validateNode.parameters.jsCode = validateCode.replace(beforeNested, afterNested);

    const beforeShape = `  hasItems(generated.stories) ||
  hasItems(generated.userStories) ||
  hasItems(generated.features) ||`;
    const afterShape = `  hasItems(generated.stories) ||
  hasItems(generated.userStories) ||
  hasItems(generated.childStories) ||
  hasItems(generated.features) ||`;
    if (parserCode.includes(beforeShape) && !parserCode.includes('hasItems(generated.childStories)')) {
      parserNode.parameters.jsCode = parserCode.replace(beforeShape, afterShape);
    }

    new Function(validateNode.parameters.jsCode);
    new Function(parserNode.parameters.jsCode);

    const connections = row.connections ? parseAny(row.connections) : {};
    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      changes: [
        'Validate Team Managed Backlog now treats nested childStories as valid child stories',
        'Robust Backlog JSON Parser accepts top-level childStories if returned'
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
