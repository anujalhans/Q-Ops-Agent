const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const nodeName = 'Build Story Test Case Usage Checkpoint';
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, (error) => error ? reject(error) : resolve()));
}

function patchNodes(nodes) {
  const node = nodes.find((item) => item.name === nodeName);
  if (!node) throw new Error(`Node not found: ${nodeName}`);
  let code = String(node.parameters?.jsCode || '');
  const original = code;

  const replacements = new Map([
    [
      'Number(root.sourceStoryCount || root.totalStories || root.allStoryCount || 0) || 0',
      'Number(first.sourceStoryCount || first.totalStories || first.allStoryCount || 0) || stories.length || items.length',
    ],
    [
      'Number(root.selectedStoryCount || root.storyCount || 0) || 0',
      'Number(first.selectedStoryCount || first.deltaStoryCount || first.storyCount || 0) || stories.length || items.length',
    ],
    [
      'Number(root.plannedTestCaseCount || root.expectedTestCaseCount || 0) || 0',
      'Number(first.plannedTestCaseCount || first.expectedTestCaseCount || usageCheckpoint.plannedTestCaseCount || 0) || 0',
    ],
    [
      'Number(root.generatedTestCaseCount || root.testcaseCount || root.testCaseCount || 0) || 0',
      'Number(first.generatedTestCaseCount || first.testcaseCount || first.testCaseCount || usageCheckpoint.generatedTestCaseCount || 0) || 0',
    ],
    [
      'Array.isArray(root.testCases) ? root.testCases.length : 0',
      'usageCheckpoint.generatedTestCaseCount || items.reduce((sum, item) => sum + (Array.isArray(item.testCases) ? item.testCases.length : 0), 0)',
    ],
  ]);

  for (const [before, after] of replacements) {
    code = code.split(before).join(after);
  }

  if (code === original) throw new Error('No root references were patched; workflow may already be fixed or has drifted.');
  if (/\broot\./.test(code)) throw new Error('Unsafe root reference still exists after patch.');

  new Function(code);
  node.parameters.jsCode = code;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_stc_usage_checkpoint_root_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes || '[]');
    patchNodes(nodes);
    const nodesJson = JSON.stringify(nodes);
    const now = new Date().toISOString();

    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [nodesJson, now, workflowId]);
    if (historyRow) {
      const historyNodes = JSON.parse(historyRow.nodes || '[]');
      patchNodes(historyNodes);
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(historyNodes), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, nodeName, backupPath, updatedAt: now }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
