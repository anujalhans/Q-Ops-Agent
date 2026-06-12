const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function compileCodeNode(node) {
  if (node.parameters?.jsCode) new Function(node.parameters.jsCode);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_create_capacity_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const normalize = requireNode(nodes, 'Normalize Team Managed Request');
    let code = normalize.parameters.jsCode;

    const oldLine = "  maxTokens: Math.max(16000, Number(models.maxTokens || input.maxTokens || 16000) || 16000),";
    const newBlock = [
      "  maxTokens,",
    ].join('\n');

    if (!code.includes('BACKLOG_CREATE_CAPACITY_V1')) {
      code = code.replace(
        "const retrievalSearchQueries = {",
        [
          "const BACKLOG_CREATE_CAPACITY_V1 = true;",
          "const requestedGenerationMode = String(input.generationMode || input.generation_mode || '').trim().toLowerCase();",
          "const isCreateLikeGeneration = !input.updateMode && !input.updateOfJobId && requestedGenerationMode !== 'update';",
          "const configuredMaxTokens = Number(models.maxTokens || input.maxTokens || 0);",
          "const maxTokens = Math.max(isCreateLikeGeneration ? 30000 : 16000, Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0 ? configuredMaxTokens : 0);",
          "const retrievalSearchQueries = {",
        ].join('\n')
      );
    }

    if (!code.includes(oldLine)) {
      if (!code.includes('  maxTokens,')) {
        throw new Error('Could not locate maxTokens assignment in Normalize Team Managed Request');
      }
    } else {
      code = code.replace(oldLine, newBlock);
    }

    normalize.parameters.jsCode = code;
    compileCodeNode(normalize);

    const parser = requireNode(nodes, 'Robust Backlog JSON Parser');
    if (parser.parameters?.jsCode && parser.parameters.jsCode.includes('rerun with maxTokens >= 16000')) {
      parser.parameters.jsCode = parser.parameters.jsCode.replace(
        'rerun with maxTokens >= 16000, reduce retrieval context/topK, or split backlog generation into skeleton + enrichment steps.',
        'rerun with create maxTokens >= 30000, reduce retrieval context/topK, or split backlog generation into skeleton + enrichment steps.'
      );
      compileCodeNode(parser);
    }

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [nodesJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, backupPath, updatedAt: now }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
