const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

const workflows = {
  uploadQueueCreator: 'iiR8d9v5oI8WzBPX',
  ingestionWorker: 'mlelxUdlNcoBIyru',
  vectorization: 'C9oZfZxpGFakzlB3',
  artifactReprocess: 'zHsg1Zr7oGOvhPFg',
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

function requireNode(nodes, nameOrPredicate) {
  const node = typeof nameOrPredicate === 'function'
    ? nodes.find(nameOrPredicate)
    : nodes.find(item => item.name === nameOrPredicate);
  if (!node) throw new Error(`Node not found: ${nameOrPredicate}`);
  return node;
}

function safeUrlHelperCode() {
  return `function encodeUrlPathSegments(value) {
  const text = String(value || '').trim();
  if (!text) return text;
  const match = text.match(/^([a-z][a-z0-9+.-]*:\\/\\/[^/?#]+)(\\/[^?#]*)([?#].*)?$/i);
  const encodeSegment = segment => {
    if (!segment) return segment;
    try { return encodeURIComponent(decodeURIComponent(segment)); }
    catch { return encodeURIComponent(segment); }
  };
  if (!match) return text.split('/').map(encodeSegment).join('/');
  return match[1] + match[2].split('/').map(encodeSegment).join('/') + (match[3] || '');
}
`;
}

function patchUploadQueueCreator(nodes) {
  const upload = requireNode(nodes, 'Upload Files to Supabase Storage');
  const buildMap = requireNode(nodes, 'Build File URL Map');

  upload.parameters.url = '=https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/uploaded-project-docs/{{ encodeURIComponent($json.projectId || $json.projectName || "unknown-project") }}/{{ $json.jobId }}/{{ encodeURIComponent($json.fileName) }}';

  buildMap.parameters.jsCode = `const splitItems = $('Split Binary Files for Supabase Upload').all();
if (splitItems.length === 0) throw new Error('No files uploaded successfully');
const first = splitItems[0].json;
const fileMap = {};
for (const item of splitItems) {
  const { fileKey, fileName, projectName, projectId, jobId } = item.json;
  const storageProjectSegment = encodeURIComponent(projectId || projectName || 'unknown-project');
  const encodedFileName = encodeURIComponent(fileName);
  fileMap[fileKey] = \`https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/\${storageProjectSegment}/\${jobId}/\${encodedFileName}\`;
}
return [{ json: { jobId: first.jobId, projectName: first.projectName, projectId: first.projectId || null, environment: first.environment || 'local', token: first.token, files: fileMap } }];`;

  return [
    'new upload storage paths use encoded projectId/project fallback segment',
    'public file URLs are built from the same safe storage segment',
  ];
}

function patchIngestionWorker(nodes) {
  const convert = requireNode(nodes, node => String(node.name || '').startsWith('Convert Files Object'));
  convert.parameters.jsCode = `${safeUrlHelperCode()}
const files = $json.files || {};

return Object.entries(files).map(([key, url]) => {
  return {
    json: {
      fileKey: key,
      fileUrl: encodeUrlPathSegments(url),
      projectName: $json.projectName,
      status: $json.status,
      jobId: $json.jobId,
      projectId: $json.projectId || null,
      requestedBy: $json.requestedBy || null,
      settingsVersion: $json.settingsVersion || null,
      configSnapshot: $json.configSnapshot || {},
      processingStartedAt: $json.processingStartedAt || null
    }
  };
});`;

  return ['worker normalizes legacy file URLs before download and vectorization handoff'];
}

function patchVectorization(nodes) {
  const rename = requireNode(nodes, 'Rename Binary File Keys');
  rename.parameters.jsCode = `${safeUrlHelperCode()}
const output = [];

function normalizeFiles(files) {
  if (!Array.isArray(files)) return files;
  return files.map(file => ({
    ...file,
    fileUrl: encodeUrlPathSegments(file.fileUrl || file.url || '')
  }));
}

for (const item of $input.all()) {
  const binaries = item.binary || {};
  const baseJson = {
    ...item.json,
    files: normalizeFiles(item.json.files)
  };

  for (const key of Object.keys(binaries)) {
    output.push({
      json: {
        ...baseJson,
        fileKey: key
      },
      binary: {
        data: binaries[key]
      }
    });
  }
}

return output;`;

  return ['vectorization workflow normalizes fileUrl before Extract Text + Image'];
}

function patchArtifactReprocess(nodes) {
  const prepare = requireNode(nodes, 'Prepare Reprocess Insert');
  prepare.parameters.jsCode = `${safeUrlHelperCode()}
const request = $('Prepare Reprocess Request').first().json || {};
const authUser = $('Verify Supabase Auth User').first().json || {};
const profile = $('Fetch Q-Ops User Profile').first().json || {};
const memberships = $items('Fetch Current User Project Memberships').map(i => i.json).filter(m => m && m.project_id);
const source = $('Fetch Reprocess Source Job').first().json || {};
function fail(code, message, statusCode = 400) { return [{ json: { ok: false, error: code, message, statusCode } }]; }
if (!request.accessToken || !authUser.id || !profile.id || profile.status !== 'active') return fail('unauthorized', 'Missing or invalid Supabase Auth token.', 401);
if (!request.jobId || !request.fileKey) return fail('bad_request', 'artifactId must be formatted as jobId:fileKey.', 400);
if (!source.job_id) return fail('not_found', 'Source artifact was not found.', 404);
if (source.status !== 'failed') return fail('not_reprocessable', 'Only failed artifacts can be reprocessed.', 409);
const isAdmin = profile.role === 'admin';
const allowedProjectIds = new Set(memberships.map(m => String(m.project_id)));
const sourceProjectId = source.project_id ? String(source.project_id) : '';
const sourceRequestedBy = source.requested_by ? String(source.requested_by) : '';
const hasProjectAccess = Boolean(sourceProjectId && allowedProjectIds.has(sourceProjectId));
if (!isAdmin && !hasProjectAccess) return fail('forbidden', 'You do not have access to reprocess this artifact.', 403);
const input = source.input || {};
const files = input.files || {};
const url = encodeUrlPathSegments(files[request.fileKey]);
if (!url) return fail('not_found', 'Source artifact file was not found on the source job.', 404);
const now = new Date();
const datePart = now.toISOString().slice(2,10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = \`ING-\${datePart}-\${randomPart}\`;
const requestedBy = sourceRequestedBy || profile.id;
const settingsVersion = source.settings_version || null;
const projectName = input.projectName || 'Unknown project';
const payload = { job_id: jobId, status: 'pending', input: { projectName, files: { [request.fileKey]: url }, reprocessOf: request.artifactId, reprocessRequestedBy: profile.id }, project_id: source.project_id || null, requested_by: requestedBy, settings_version: settingsVersion, config_snapshot: source.config_snapshot || null };
const metric = { job_id: jobId, project_id: source.project_id || null, requested_by: requestedBy, project_name: projectName, pipeline: 'ingestion', event: 'JOB_REPROCESS_QUEUED', status: 'info', total_files: 1, metadata: { reprocessOf: request.artifactId, sourceJobId: source.job_id, fileKey: request.fileKey, requestedBy: profile.id, projectId: source.project_id || null, settingsVersion, normalizedFileUrl: true } };
return [{ json: { ok: true, jobId, payload, metric } }];`;

  return ['artifact reprocess normalizes legacy source artifact URL before queueing'];
}

async function patchWorkflow(db, workflowId, patcher, stamp) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_safe_ingestion_urls_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  const changes = patcher(nodes);

  for (const node of nodes.filter(item => item.type === 'n8n-nodes-base.code' && item.parameters?.jsCode)) {
    try { new Function(node.parameters.jsCode); }
    catch (error) {
      const tmp = path.join(process.cwd(), `tmp_safe_url_${workflowId}_${node.name.replace(/[^A-Za-z0-9_-]+/g, '_')}.js`);
      fs.writeFileSync(tmp, node.parameters.jsCode);
      throw new Error(`Code validation failed for ${row.name} / ${node.name}: ${error.message}. Wrote ${tmp}`);
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
    const results = [];
    results.push(await patchWorkflow(db, workflows.uploadQueueCreator, patchUploadQueueCreator, stamp));
    results.push(await patchWorkflow(db, workflows.ingestionWorker, patchIngestionWorker, stamp));
    results.push(await patchWorkflow(db, workflows.vectorization, patchVectorization, stamp));
    results.push(await patchWorkflow(db, workflows.artifactReprocess, patchArtifactReprocess, stamp));
    console.log(JSON.stringify({ patched: results }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
