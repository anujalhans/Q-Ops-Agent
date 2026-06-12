const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try {
    return JSON.parse(value);
  } catch {
    return flatted.parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => {
    error ? reject(error) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function patchConverterNode(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  if (!code.includes('function sanitizeConfluenceStorageHtml(input)')) {
    code = code.replace(
      'function normalizeCellText(html) {',
      `function sanitizeConfluenceStorageHtml(input) {
  let html = String(input || '');

  // Confluence Cloud Fabric rejects custom extension-like wrappers and styled storage fragments.
  // Keep the user-visible document content, but reduce the body to plain storage-safe HTML.
  html = html
    .replace(/<!--\\s*QOPS_[\\s\\S]*?-->/gi, '')
    .replace(/<div\\b[^>]*data-qops-[^>]*>/gi, '')
    .replace(/<div\\b[^>]*>/gi, '')
    .replace(/<\\/div>/gi, '')
    .replace(/<span\\b[^>]*>/gi, '')
    .replace(/<\\/span>/gi, '')
    .replace(/\\s(?:style|class|id|data-[a-z0-9_-]+)=("[^"]*"|'[^']*'|[^\\s>]+)/gi, '')
    .replace(/<\\/?font\\b[^>]*>/gi, '')
    .replace(/<script\\b[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<iframe\\b[\\s\\S]*?<\\/iframe>/gi, '')
    .replace(/<object\\b[\\s\\S]*?<\\/object>/gi, '')
    .replace(/<embed\\b[\\s\\S]*?<\\/embed>/gi, '')
    .replace(/<ac:structured-macro\\b[\\s\\S]*?<\\/ac:structured-macro>/gi, '')
    .replace(/<ac:adf-extension\\b[\\s\\S]*?<\\/ac:adf-extension>/gi, '')
    .replace(/<ac:extension\\b[\\s\\S]*?<\\/ac:extension>/gi, '')
    .replace(/<\\/?ac:[^>]+>/gi, '')
    .replace(/<\\/?ri:[^>]+>/gi, '')
    .replace(/(<br\\s*\\/?>\\s*){3,}/gi, '<br/><br/>');

  return html.trim();
}

function normalizeCellText(html) {`
    );
    patches += 1;
  }

  const styledCoverageBlock = `return [
    '<div data-qops-coverage-review="true" style="border:1px solid #e0b94f;border-radius:10px;padding:12px;margin:12px 0;background:#fff8e1;">',
    '<h2>Coverage Review Note</h2>',
    '<p>Q-Ops completed the document with coverage items that require QA or business review before final sign-off.</p>',
    rows ? '<ul>' + rows + '</ul>' : '<p>Coverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.</p>',
    '</div>'
  ].join('');`;
  const safeCoverageBlock = `return [
    '<h2>Coverage Review Note</h2>',
    '<p>Q-Ops completed the document with coverage items that require QA or business review before final sign-off.</p>',
    rows ? '<ul>' + rows + '</ul>' : '<p>Coverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.</p>',
    '<hr/>'
  ].join('');`;
  if (code.includes(styledCoverageBlock)) {
    code = code.replace(styledCoverageBlock, safeCoverageBlock);
    patches += 1;
  }

  if (!code.includes('html = sanitizeConfluenceStorageHtml(html);')) {
    code = code.replace(
      '\nreturn [{\n  json: {',
      '\nhtml = sanitizeConfluenceStorageHtml(html);\n\nreturn [{\n  json: {'
    );
    patches += 1;
  }

  code = code.replace(/shared-final-validation-v17/g, 'shared-final-validation-v18');
  code = code.replace(/shared-final-validation-v16/g, 'shared-final-validation-v18');
  code = code.replace(/shared-final-validation-v15/g, 'shared-final-validation-v18');
  code = code.replace(/shared-final-validation-v14/g, 'shared-final-validation-v18');

  node.parameters.jsCode = code;
  return patches;
}

function patchUpdateStorageValue(node) {
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) throw new Error('Update existing Document on Confluence body.storage.value not found');

  let value = String(target.value || '');
  let patches = 0;

  if (!value.includes('const sanitizeConfluenceStorageHtml = (input) =>')) {
    value = value.replace(
      '  const canonicalSections = {',
      `  const sanitizeConfluenceStorageHtml = (input) => String(input || '')
    .replace(/<!--\\s*QOPS_[\\s\\S]*?-->/gi, '')
    .replace(/<div\\b[^>]*data-qops-[^>]*>/gi, '')
    .replace(/<div\\b[^>]*>/gi, '')
    .replace(/<\\/div>/gi, '')
    .replace(/<span\\b[^>]*>/gi, '')
    .replace(/<\\/span>/gi, '')
    .replace(/\\s(?:style|class|id|data-[a-z0-9_-]+)=("[^"]*"|'[^']*'|[^\\s>]+)/gi, '')
    .replace(/<\\/?font\\b[^>]*>/gi, '')
    .replace(/<script\\b[\\s\\S]*?<\\/script>/gi, '')
    .replace(/<iframe\\b[\\s\\S]*?<\\/iframe>/gi, '')
    .replace(/<object\\b[\\s\\S]*?<\\/object>/gi, '')
    .replace(/<embed\\b[\\s\\S]*?<\\/embed>/gi, '')
    .replace(/<ac:structured-macro\\b[\\s\\S]*?<\\/ac:structured-macro>/gi, '')
    .replace(/<ac:adf-extension\\b[\\s\\S]*?<\\/ac:adf-extension>/gi, '')
    .replace(/<ac:extension\\b[\\s\\S]*?<\\/ac:extension>/gi, '')
    .replace(/<\\/?ac:[^>]+>/gi, '')
    .replace(/<\\/?ri:[^>]+>/gi, '')
    .replace(/(<br\\s*\\/?>\\s*){3,}/gi, '<br/><br/>')
    .trim();

  const canonicalSections = {`
    );
    patches += 1;
  }

  if (value.includes('return sanitizeUserFacingHtml(finalHtml);')) {
    value = value.replace('return sanitizeUserFacingHtml(finalHtml);', 'return sanitizeConfluenceStorageHtml(sanitizeUserFacingHtml(finalHtml));');
    patches += 1;
  } else if (value.includes('return finalHtml;')) {
    value = value.replace('return finalHtml;', 'return sanitizeConfluenceStorageHtml(finalHtml);');
    patches += 1;
  }

  value = value.replace(/shared-final-validation-v17/g, 'shared-final-validation-v18');
  value = value.replace(/shared-final-validation-v16/g, 'shared-final-validation-v18');
  value = value.replace(/shared-final-validation-v15/g, 'shared-final-validation-v18');
  value = value.replace(/shared-final-validation-v14/g, 'shared-final-validation-v18');

  target.value = value;
  return patches;
}

function hardenConfluenceHttpNode(node) {
  node.retryOnFail = true;
  node.maxTries = 2;
  node.waitBetweenTries = 3000;
  node.onError = 'continueRegularOutput';
  node.alwaysOutputData = true;
}

const confluenceFailureMetricBody = String.raw`={{ (() => {
  const restore = $('Restore Job Context').item.json || {};
  const preserved = $('Preserve Job ID').item.json || {};
  const q = $('Restore Quality Gate Output').item.json || {};
  const converter = ($items('Convert MD -> Confluence Formatted HTML', 0, 0)[0] || {}).json || {};
  const error = $json.error || {};
  const details = error.errorDetails || $json.errorDetails || {};
  const raw = Array.isArray(details.rawErrorMessage) ? details.rawErrorMessage.join(' | ') : (details.rawErrorMessage || error.rawErrorMessage || '');
  const httpCode = details.httpCode || error.httpCode || $json.httpCode || $json.statusCode || null;
  const message = error.message || $json.errorMessage || $json.message || 'Confluence publish failed';
  const description = error.description || $json.errorDescription || $json.description || raw || '';
  const tokenUsage = {
    source: q.tokenUsage?.source || 'estimated',
    input: Number(q.tokensInput) || Number(q.tokenUsage?.input) || 0,
    output: Number(q.tokensOutput) || Number(q.tokenUsage?.output) || 0,
    total: Number(q.tokensTotal) || Number(q.tokenUsage?.total) || 0,
    estimatedCostUsd: Number(q.estimatedCostUsd) || Number(q.tokenUsage?.estimatedCostUsd) || 0
  };
  return JSON.stringify({
    job_id: preserved.job_id || restore.jobId,
    project_name: preserved.projectName || restore.projectName,
    document_type: preserved.documentType || restore.documentType,
    pipeline: 'generation',
    event: 'JOB_FAILED',
    status: 'error',
    project_id: restore.projectId || null,
    requested_by: restore.requestedBy || null,
    error_message: message,
    duration_ms: Math.max(0, Date.now() - new Date(restore.startedAt || Date.now()).getTime()),
    word_count: Number(q.wordCount) || 0,
    tokens_input: tokenUsage.input,
    tokens_output: tokenUsage.output,
    tokens_total: tokenUsage.total,
    estimated_cost_usd: tokenUsage.estimatedCostUsd,
    metadata: {
      settings_version: restore.settingsVersion || null,
      project_id: restore.projectId || null,
      requested_by: restore.requestedBy || null,
      environment: restore.environmentKey || 'local',
      generation_model: restore.configSnapshot?.models?.generationModel || 'gpt-4.1-mini',
      chroma_collection: restore.configSnapshot?.chroma?.collection || 'qa-chunks-batches',
      failed_at: new Date().toISOString(),
      error_type: 'CONFLUENCE_PUBLISH_FAILED',
      error_description: description,
      http_code: httpCode,
      raw_error_message: raw,
      token_usage: tokenUsage,
      diagnostics: {
        version: 'confluence-fabric-resilience-v1',
        failedNode: error.node?.name || $json.nodeName || 'Confluence publish',
        errorType: 'CONFLUENCE_PUBLISH_FAILED',
        errorMessage: message,
        errorDescription: description,
        httpCode,
        rawErrorMessage: raw,
        operationMode: restore.generationMode || 'create',
        finalValidation: converter.finalValidation || q.finalValidation || null,
        confluencePayloadSanitized: true
      }
    }
  });
})() }}`;

const confluenceFailureStatusBody = String.raw`={{ (() => {
  const restore = $('Restore Job Context').item.json || {};
  const preserved = $('Preserve Job ID').item.json || {};
  const q = $('Restore Quality Gate Output').item.json || {};
  const converter = ($items('Convert MD -> Confluence Formatted HTML', 0, 0)[0] || {}).json || {};
  const error = $json.error || {};
  const details = error.errorDetails || $json.errorDetails || {};
  const raw = Array.isArray(details.rawErrorMessage) ? details.rawErrorMessage.join(' | ') : (details.rawErrorMessage || error.rawErrorMessage || '');
  const httpCode = details.httpCode || error.httpCode || $json.httpCode || $json.statusCode || null;
  const message = error.message || $json.errorMessage || $json.message || 'Confluence publish failed';
  const description = error.description || $json.errorDescription || $json.description || raw || '';
  const tokenUsage = {
    source: q.tokenUsage?.source || 'estimated',
    input: Number(q.tokensInput) || Number(q.tokenUsage?.input) || 0,
    output: Number(q.tokensOutput) || Number(q.tokenUsage?.output) || 0,
    total: Number(q.tokensTotal) || Number(q.tokenUsage?.total) || 0,
    estimatedCostUsd: Number(q.estimatedCostUsd) || Number(q.tokenUsage?.estimatedCostUsd) || 0
  };
  const diagnostics = {
    version: 'confluence-fabric-resilience-v1',
    failedNode: error.node?.name || $json.nodeName || 'Confluence publish',
    errorType: 'CONFLUENCE_PUBLISH_FAILED',
    errorMessage: message,
    errorDescription: description,
    httpCode,
    rawErrorMessage: raw,
    operationMode: restore.generationMode || 'create',
    finalValidation: converter.finalValidation || q.finalValidation || null,
    confluencePayloadSanitized: true
  };
  return JSON.stringify({
    status: 'failed',
    error: message,
    output: {
      error: true,
      errorType: 'CONFLUENCE_PUBLISH_FAILED',
      message,
      description,
      httpCode,
      rawErrorMessage: raw,
      failed_at: new Date().toISOString(),
      confluencePageId: null,
      url: null,
      documentType: restore.documentType || preserved.documentType || null,
      projectName: restore.projectName || preserved.projectName || null,
      operationMode: restore.generationMode || 'create',
      wordCount: Number(q.wordCount) || 0,
      tokensInput: tokenUsage.input,
      tokensOutput: tokenUsage.output,
      tokensTotal: tokenUsage.total,
      estimatedCostUsd: tokenUsage.estimatedCostUsd,
      tokenUsage,
      qualityGate: q.qualityGate || null,
      coverageSummary: q.coverageSummary || null,
      coverageLedger: q.coverageLedger || [],
      batchSummary: q.batchSummary || null,
      finalValidation: converter.finalValidation || q.finalValidation || null,
      diagnostics
    },
    updated_at: new Date().toISOString()
  });
})() }}`;

function patchFailureNodes(nodes) {
  const metric = requireNode(nodes, 'LOG: Confluence Job Failed');
  metric.parameters.jsonBody = confluenceFailureMetricBody;

  const status = requireNode(nodes, 'Update Job Status as Failed');
  status.parameters.url = "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $('Preserve Job ID').item.json.job_id || $('Restore Job Context').item.json.jobId }}&status=eq.processing";
  status.parameters.jsonHeaders = '{\n  "Content-Type": "application/json",\n  "Prefer": "return=representation"\n}';
  status.parameters.jsonBody = confluenceFailureStatusBody;
  status.credentials = {
    httpCustomAuth: {
      id: 'DpZbhUxkEbKeXIiJ',
      name: 'supabase-service-role-key',
    },
  };
}

function patchConnections(connections) {
  const version = connections['Version Number > 1?'];
  if (!version?.main) throw new Error('Version Number > 1? connection not found');
  if (!Array.isArray(version.main[1])) version.main[1] = [];
  const exists = version.main[1].some((conn) => conn.node === 'Merge6' && conn.type === 'main' && conn.index === 1);
  if (!exists) {
    version.main[1].push({ node: 'Merge6', type: 'main', index: 1 });
    return 1;
  }
  return 0;
}

function patchWorkflow(nodes, connections) {
  const converterPatches = patchConverterNode(requireNode(nodes, 'Convert MD -> Confluence Formatted HTML'));
  const updatePatches = patchUpdateStorageValue(requireNode(nodes, 'Update existing Document on Confluence'));

  hardenConfluenceHttpNode(requireNode(nodes, 'Upload Document on Confluence'));
  hardenConfluenceHttpNode(requireNode(nodes, 'Update existing Document on Confluence'));
  patchFailureNodes(nodes);
  const connectionPatches = patchConnections(connections);

  if (converterPatches < 2) throw new Error(`Converter patch incomplete: ${converterPatches}`);
  if (updatePatches < 1) throw new Error(`Update storage patch incomplete: ${updatePatches}`);

  return { converterPatches, updatePatches, connectionPatches };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT * FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!entity) throw new Error(`workflow_entity not found: ${workflowId}`);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    if (!history) throw new Error(`workflow_history not found: ${workflowId} / ${versionId}`);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_confluence_fabric_resilience_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      workflow_entity: entity,
      workflow_history: history,
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const entityConnections = parseAny(entity.connections || '{}');
    const historyNodes = parseAny(history.nodes);
    const historyConnections = parseAny(history.connections || '{}');

    const entityPatches = patchWorkflow(entityNodes, entityConnections);
    const historyPatches = patchWorkflow(historyNodes, historyConnections);
    const updatedAt = new Date().toISOString();

    await run(db, 'UPDATE workflow_entity SET nodes = ?, connections = ?, updatedAt = ? WHERE id = ?', [
      JSON.stringify(entityNodes),
      JSON.stringify(entityConnections),
      updatedAt,
      workflowId,
    ]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, connections = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [
      JSON.stringify(historyNodes),
      JSON.stringify(historyConnections),
      updatedAt,
      workflowId,
      versionId,
    ]);

    console.log(JSON.stringify({
      workflowId,
      versionId,
      backupPath,
      entityPatches,
      historyPatches,
      patched: [
        'Fabric-safe Confluence storage sanitizer for shared create/update HTML',
        'Amber coverage note now uses plain storage-safe HTML',
        'Confluence POST/PUT now continue to failure logging with retry/backoff',
        'Confluence failed metrics/status now persist HTTP diagnostics and token usage',
        'Update publish failures now route to the shared Confluence failure handler',
      ],
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
