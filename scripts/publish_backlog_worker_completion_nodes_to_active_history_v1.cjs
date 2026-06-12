const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'QApRBFSaJgINsdHN';
const nodeNames = [
  'Build Backlog Completion Output',
  'Restore Completion Before Status Update',
];
const backupDir = path.resolve('docs/test_data/n8n_workflow_backups');

fs.mkdirSync(backupDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    if (error) reject(error);
    else resolve(this);
  }));
}

function parseNodes(value) {
  return JSON.parse(value || '[]');
}

function replaceNodes(historyNodes, entityNodes) {
  const replacements = new Map();
  for (const name of nodeNames) {
    const node = entityNodes.find((entry) => entry.name === name);
    if (!node) throw new Error(`Draft node not found: ${name}`);
    replacements.set(name, node);
  }

  let changed = false;
  const nextNodes = historyNodes.map((node) => {
    const replacement = replacements.get(node.name);
    if (!replacement) return node;
    changed = true;
    return replacement;
  });

  for (const name of nodeNames) {
    if (!historyNodes.some((node) => node.name === name)) {
      throw new Error(`Active history node not found: ${name}`);
    }
  }

  return { changed, nodes: nextNodes };
}

(async () => {
  const entity = (await all(
    'select id, name, nodes, activeVersionId from workflow_entity where id = ?',
    [workflowId],
  ))[0];
  if (!entity) throw new Error(`Workflow not found: ${workflowId}`);
  if (!entity.activeVersionId) throw new Error(`Workflow has no activeVersionId: ${workflowId}`);

  const history = (await all(
    'select versionId, nodes from workflow_history where workflowId = ? and versionId = ?',
    [workflowId, entity.activeVersionId],
  ))[0];
  if (!history) throw new Error(`Active history not found for ${workflowId} / ${entity.activeVersionId}`);

  const entityNodes = parseNodes(entity.nodes);
  const historyNodes = parseNodes(history.nodes);

  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const backupPath = path.join(
    backupDir,
    `workflow_${workflowId}_before_publish_backlog_completion_nodes_${stamp}.json`,
  );
  fs.writeFileSync(backupPath, JSON.stringify({
    workflowId,
    workflowName: entity.name,
    activeVersionId: entity.activeVersionId,
    patchedNodeNames: nodeNames,
    entityNodes,
    activeHistoryNodes: historyNodes,
  }, null, 2));

  const patched = replaceNodes(historyNodes, entityNodes);
  if (patched.changed) {
    await run(
      "update workflow_history set nodes = ?, updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') where workflowId = ? and versionId = ?",
      [JSON.stringify(patched.nodes), workflowId, entity.activeVersionId],
    );
  }

  console.log(JSON.stringify({
    workflowId,
    workflowName: entity.name,
    activeVersionId: entity.activeVersionId,
    patchedNodeNames: nodeNames,
    historyChanged: patched.changed,
    backupPath,
  }, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
