const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

const workflows = {
  artifactsApi: 'YFsr2hRD7BZlPCEK',
  ingestStatusApi: 'KeTwumg3JT7C46BD',
};

function parseAny(value) {
  try { return JSON.parse(value); }
  catch { return flatted.parse(value); }
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

function patchArtifactsApi(nodes) {
  const fetch = requireNode(nodes, 'Fetch Ingestion Jobs');
  const map = requireNode(nodes, 'Map Artifacts Response');

  const selectParam = fetch.parameters.queryParameters.parameters.find(item => item.name === 'select');
  selectParam.value = 'job_id,status,input,output,created_at,updated_at,error';

  map.parameters.jsCode = `function numberFromUnknown(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function extractionDetails(output) {
  const observability = output?.extractionObservability || output?.extraction_observability || {};
  const tokenUsage = output?.tokenUsage || output?.token_usage || {};
  const files = Array.isArray(observability.files) ? observability.files : [];
  const file = files[0] || {};
  const warnings = Array.isArray(observability.warnings)
    ? observability.warnings
    : Array.isArray(output?.warnings)
      ? output.warnings
      : [];
  const cleanWarnings = warnings.map(warning => String(warning || '').trim()).filter(Boolean);
  const warningCount = Number(observability.warningCount ?? observability.warning_count ?? output?.warningCount ?? cleanWarnings.length) || cleanWarnings.length;
  const metrics = {
    fileName: file.fileName || file.file_name || output?.fileName || '',
    docType: file.docType || file.doc_type || output?.docType || '',
    fileType: file.fileType || file.file_type || output?.fileType || '',
    chunks: numberFromUnknown(output?.totalChunksStored ?? output?.total_chunks_stored ?? output?.chunkCount ?? output?.chunk_count),
    words: numberFromUnknown(tokenUsage.embeddedWordCount ?? tokenUsage.embedded_word_count ?? output?.wordCount ?? output?.word_count),
    tokens: numberFromUnknown(tokenUsage.tokensTotal ?? tokenUsage.tokens_total ?? output?.tokensTotal ?? output?.tokens_total),
    costUsd: numberFromUnknown(tokenUsage.estimatedCostUsd ?? tokenUsage.estimated_cost_usd ?? output?.estimatedCostUsd ?? output?.estimated_cost_usd),
    durationMs: numberFromUnknown(file.durationMs ?? file.duration_ms ?? observability.durationMs ?? observability.duration_ms),
    fileSizeBytes: numberFromUnknown(file.fileSizeBytes ?? file.file_size_bytes ?? observability.fileSizeBytes ?? observability.file_size_bytes),
    responseBytesEstimated: numberFromUnknown(file.responseBytesEstimated ?? file.response_bytes_estimated ?? observability.responseBytesEstimated ?? observability.response_bytes_estimated),
    tables: numberFromUnknown(file.tableCount ?? file.table_count ?? observability.tableCount ?? observability.table_count),
    annotations: numberFromUnknown(file.annotationCount ?? file.annotation_count ?? observability.annotationCount ?? observability.annotation_count),
    links: numberFromUnknown(file.linkCount ?? file.link_count ?? observability.linkCount ?? observability.link_count),
    visualCandidates: numberFromUnknown(file.visualCandidatesDetected ?? file.visual_candidates_detected ?? observability.visualCandidatesDetected ?? observability.visual_candidates_detected),
    warnings: warningCount,
  };
  return {
    extractionMetrics: Object.values(metrics).some(value => Boolean(value)) ? metrics : null,
    extractionWarnings: cleanWarnings,
    extractionWarningCount: warningCount,
    extractionObservability: Object.keys(observability).length ? observability : null,
  };
}

const artifacts = [];
const statusMap = { completed: 'processed', failed: 'failed', pending: 'processing', processing: 'processing' };
for (const item of $input.all()) {
  const job = item.json;
  if (!job || !job.job_id) continue;
  const input = job.input || {};
  const files = input.files || {};
  const details = extractionDetails(job.output || {});
  for (const [type, url] of Object.entries(files)) {
    const rawName = String(url).split('/').pop() || type;
    artifacts.push({
      id: \`\${job.job_id}:\${type}\`,
      projectName: input.projectName || 'Unknown project',
      type,
      fileName: decodeURIComponent(rawName),
      uploadedAt: job.created_at,
      status: statusMap[job.status] || 'processing',
      url,
      jobId: job.job_id,
      output: job.output || null,
      extractionMetrics: details.extractionMetrics,
      extractionWarnings: details.extractionWarnings,
      extractionWarningCount: details.extractionWarningCount,
      extractionObservability: details.extractionObservability,
    });
  }
}
return [{ json: { artifacts } }];`;

  return ['Artifacts API now returns output and extraction detail fields for completed ingestion jobs'];
}

function patchIngestStatusApi(nodes) {
  const fetch = requireNode(nodes, 'Check Status');
  const code = requireNode(nodes, 'Code in JavaScript');
  const respond = requireNode(nodes, 'Respond to Webhook');

  const selectParam = fetch.parameters.queryParameters.parameters.find(item => item.name === 'select');
  selectParam.value = 'job_id,status,output,error';

  code.parameters.jsCode = `const inputJobId = $('Edit Fields').first().json.jobId;

if (!$json || !$json.job_id) {
  return [
    {
      json: {
        jobId: inputJobId,
        status: "not_found"
      }
    }
  ];
}

return [
  {
    json: {
      jobId: $json.job_id,
      status: $json.status,
      output: $json.output || null,
      error: $json.error || null
    }
  }
];`;

  respond.parameters.responseBody = '={{ $json }}';

  return ['Ingestion status API now returns output/error along with status'];
}

async function patchWorkflow(db, workflowId, patcher, stamp) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_extraction_details_api_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  const changes = patcher(nodes);

  for (const node of nodes.filter(item => item.type === 'n8n-nodes-base.code' && item.parameters?.jsCode)) {
    try { new Function(node.parameters.jsCode); }
    catch (error) {
      throw new Error(`Code validation failed for ${row.name} / ${node.name}: ${error.message}`);
    }
  }

  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
  }
  return { workflowId, workflowName: row.name, activeVersionId: row.activeVersionId, backupPath, changes };
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  try {
    const patched = [];
    patched.push(await patchWorkflow(db, workflows.artifactsApi, patchArtifactsApi, stamp));
    patched.push(await patchWorkflow(db, workflows.ingestStatusApi, patchIngestStatusApi, stamp));
    console.log(JSON.stringify({ patched }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
