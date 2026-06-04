const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.resolve('docs/test_data/n8n_workflow_backups');
const workflowIds = process.argv.slice(2);

const SERVICE_ROLE = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key',
  },
};

if (!workflowIds.length) {
  console.error('Usage: node scripts/patch_n8n_active_history_supabase_service_role.cjs <workflowId> [...]');
  process.exit(1);
}

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

function patchNodes(nodesText) {
  const nodes = JSON.parse(nodesText || '[]');
  let changed = false;
  const patched = nodes.map((node) => {
    const credential = node.credentials?.httpCustomAuth;
    if (!credential || credential.name !== 'supabase-anon-key') return node;
    changed = true;
    return {
      ...node,
      credentials: {
        ...node.credentials,
        ...SERVICE_ROLE,
      },
    };
  });
  return { nodes: patched, changed };
}

(async () => {
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  for (const workflowId of workflowIds) {
    const entityRows = await all('select id, name, nodes, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!entityRows.length) {
      console.log(`Workflow not found: ${workflowId}`);
      continue;
    }
    const entity = entityRows[0];
    const activeVersionId = entity.activeVersionId;
    const historyRows = activeVersionId
      ? await all('select versionId, workflowId, nodes from workflow_history where workflowId = ? and versionId = ?', [workflowId, activeVersionId])
      : [];

    const backup = {
      workflowId,
      workflowName: entity.name,
      activeVersionId,
      entityNodes: JSON.parse(entity.nodes || '[]'),
      activeHistoryNodes: historyRows[0] ? JSON.parse(historyRows[0].nodes || '[]') : null,
    };
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_active_history_service_role_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    const entityPatch = patchNodes(entity.nodes);
    if (entityPatch.changed) {
      await run(
        "update workflow_entity set nodes = ?, updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') where id = ?",
        [JSON.stringify(entityPatch.nodes), workflowId],
      );
    }

    let historyChanged = false;
    if (historyRows[0]) {
      const historyPatch = patchNodes(historyRows[0].nodes);
      historyChanged = historyPatch.changed;
      if (historyChanged) {
        await run(
          "update workflow_history set nodes = ?, updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') where workflowId = ? and versionId = ?",
          [JSON.stringify(historyPatch.nodes), workflowId, activeVersionId],
        );
      }
    }

    console.log(JSON.stringify({ workflowId, workflowName: entity.name, activeVersionId, entityChanged: entityPatch.changed, historyChanged, backupPath }, null, 2));
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
