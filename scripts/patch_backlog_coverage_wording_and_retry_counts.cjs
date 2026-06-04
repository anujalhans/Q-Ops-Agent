const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try { return JSON.parse(value); } catch { return flatted.parse(value); }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(err) {
    err ? reject(err) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    err ? reject(err) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function patchPromptLibrary(code) {
  if (!code.includes('NFR backlog coverage must not remain silently partial')) {
    code = code.replace(
      `'- If any in-scope module is missing or weak, retry only those missing/partial modules inside this same response and return document.retryBatches.',`,
      `'- If any in-scope module is missing or weak, retry only those missing/partial modules inside this same response and return document.retryBatches.',
      '- NFR backlog coverage must not remain silently partial: create explicit NFR/quality-enabler backlog items, map NFR acceptance criteria into relevant stories, or mark the NFR item excluded with a clear reason.',`
    );
  }

  if (!code.includes('partialCoveragePolicy:')) {
    code = code.replace(
      `batchGenerationRequirement: {
      enabled: true,
      version: 'backlog-batch-progress-v1',
      mode: 'internal_retry',
      requiredFor: 'user_stories',
      retryScope: 'missing_or_partial_modules_only',
      outputFields: ['document.batchPlan', 'document.batchResults', 'document.retryBatches']
    },
    promptRouting: {`,
      `batchGenerationRequirement: {
      enabled: true,
      version: 'backlog-batch-progress-v1',
      mode: 'internal_retry',
      requiredFor: 'user_stories',
      retryScope: 'missing_or_partial_modules_only',
      outputFields: ['document.batchPlan', 'document.batchResults', 'document.retryBatches']
    },
    partialCoveragePolicy: {
      nfrPolicy: 'resolve_or_exclude_with_reason',
      userMessage: 'Partial coverage means review needed, not retrying.'
    },
    promptRouting: {`
    );
  }

  return code;
}

function patchValidateBacklog(code) {
  code = code.replace(
    `const retryingBatches = batches.filter(batch => ['partial', 'missing', 'unknown'].includes(batch.status)).length;
  const recoveredBatches = batches.filter(batch => batch.recovered).length;`,
    `const retryingBatches = batches.filter(batch => batch.retried && !batch.recovered && ['partial', 'missing', 'unknown'].includes(batch.status)).length;
  const recoveredBatches = batches.filter(batch => batch.recovered).length;`
  );

  code = code.replace(
    `summary: 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',`,
    `summary: coverageSummary.gateStatus === 'warning'
        ? 'Backlog batches were generated and reviewed. Some coverage needs review before final sign-off.'
        : 'Backlog batches were generated, reviewed against the coverage ledger, and prepared for Jira publishing.',`
  );

  return code;
}

function patchPrepareConfluence(code) {
  code = code.replace(
    `+ '<h2>Batch Generation Summary</h2><p>Total batches: ' + esc(batchSummary.totalBatches || 0) + ' | Completed: ' + esc(batchSummary.completedBatches || 0) + ' | Retried: ' + esc(batchSummary.recoveredBatches || 0) + ' | Missing: ' + esc(batchSummary.missingBatches || 0) + '</p>' + batchTable`,
    `+ '<h2>Batch Generation Summary</h2><p>Total batches: ' + esc(batchSummary.totalBatches || 0) + ' | Completed: ' + esc(batchSummary.completedBatches || 0) + ' | Needs review: ' + esc(batchSummary.partialBatches || 0) + ' | Retrying: ' + esc(batchSummary.retryingBatches || 0) + ' | Recovered: ' + esc(batchSummary.recoveredBatches || 0) + ' | Missing: ' + esc(batchSummary.missingBatches || 0) + '</p>' + batchTable`
  );
  return code;
}

function patchReturnResult(code) {
  code = code.replace(
    `summary: 'Epics and user stories were generated in module batches, coverage-reviewed, published to Jira, and summarized in Confluence.',`,
    `summary: (root.coverageSummary?.gateStatus || root.qualityGate?.coverageSummary?.gateStatus) === 'warning'
        ? 'Epics and user stories were published, with coverage review warnings that need final review.'
        : 'Epics and user stories were generated in module batches, coverage-reviewed, published to Jira, and summarized in Confluence.',`
  );
  return code;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_coverage_wording_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const connections = row.connections ? parseAny(row.connections) : {};

    const prompt = requireNode(nodes, 'Professional Prompt Library');
    const validate = requireNode(nodes, 'Validate Team Managed Backlog');
    const confluence = requireNode(nodes, 'Prepare Confluence Upsert');
    const result = requireNode(nodes, 'Return Team Managed Professional Result');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    validate.parameters.jsCode = patchValidateBacklog(validate.parameters.jsCode);
    confluence.parameters.jsCode = patchPrepareConfluence(confluence.parameters.jsCode);
    result.parameters.jsCode = patchReturnResult(result.parameters.jsCode);

    for (const node of [prompt, validate, confluence, result]) {
      try {
        new Function(node.parameters.jsCode);
      } catch (error) {
        throw new Error(`Code validation failed for ${node.name}: ${error.message}`);
      }
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      changes: [
        'partial coverage wording clarified',
        'retryingBatches now requires actual retried unresolved batches',
        'Confluence batch summary distinguishes needs review, retrying, recovered, and missing'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
