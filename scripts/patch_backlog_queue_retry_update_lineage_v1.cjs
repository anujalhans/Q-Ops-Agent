const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'yPgr7mtUnL3E8QQP';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  return JSON.parse(value);
}

function ensureNode(nodes, node) {
  const existing = nodes.find((item) => item.name === node.name);
  if (existing) {
    existing.parameters = node.parameters;
    existing.type = node.type;
    existing.typeVersion = node.typeVersion;
    existing.position = node.position;
    if (node.credentials) existing.credentials = node.credentials;
    return existing;
  }
  nodes.push(node);
  return node;
}

function setMainConnection(connections, from, to) {
  connections[from] = {
    main: [[{
      node: to,
      type: 'main',
      index: 0,
    }]],
  };
}

function patchWorkflow(row) {
  const nodes = parseJson(row.nodes, []);
  const connections = parseJson(row.connections, {});
  const runtimeNode = nodes.find((node) => node.name === 'Prepare Runtime Config Request');
  const readyNode = nodes.find((node) => node.name === 'Runtime Request Ready?');
  const templateHttpNode = nodes.find((node) => node.name === 'Resolve Runtime Config')
    || nodes.find((node) => node.name === 'Persist Professional Job');
  if (!runtimeNode || !readyNode || !templateHttpNode?.credentials?.httpCustomAuth) {
    throw new Error('Required queue creator nodes or Supabase credential reference not found');
  }

  ensureNode(nodes, {
    id: 'retry-lineage-fetch-source-job-v1',
    name: 'Fetch Retry Source QA Job',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position: [1344, 192],
    credentials: templateHttpNode.credentials,
    parameters: {
      url: "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ encodeURIComponent($json.projectId || $json.input?.projectId || '__none__') }}&select=job_id,status,input,output,retry_of_job_id,retried_by_job_id,retry_attempt,project_id,created_at,updated_at&order=created_at.desc&limit=50",
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    alwaysOutputData: true,
  });

  ensureNode(nodes, {
    id: 'retry-lineage-hydrate-update-v1',
    name: 'Hydrate Retry Update Lineage',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1568, 192],
    parameters: {
      jsCode: `const job = $('Prepare Runtime Config Request').item.json || {};

function asObject(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}

function clean(value) {
  return String(value || '').trim();
}

const sourceRows = $input.all()
  .flatMap(item => Array.isArray(item.json) ? item.json : [item.json])
  .filter(row => row && row.job_id)
  .filter(row => {
    const rowInput = asObject(row.input);
    const rowOutput = asObject(row.output);
    const rowDocumentType = clean(rowInput.documentType || rowOutput.documentType || rowOutput.body?.documentType).toLowerCase();
    const jobDocumentType = clean(job.input?.documentType || job.documentType).toLowerCase();
    return !jobDocumentType || !rowDocumentType || rowDocumentType === jobDocumentType;
  });

function rowDetails(row) {
  const sourceInput = asObject(row?.input);
  const sourceOutput = asObject(row?.output);
  const sourceRetryContext = asObject(sourceInput.retryContext);
  const sourceUpdateContext = asObject(sourceInput.updateContext);
  const sourceUpdateOfJobId = clean(
    sourceInput.updateOfJobId ||
    sourceUpdateContext.previousJobId ||
    sourceUpdateContext.previous_job_id ||
    sourceRetryContext.updateOfJobId ||
    sourceOutput.updateOfJobId ||
    sourceOutput.updateContext?.previousJobId ||
    sourceOutput.metadata?.update_of_job_id
  );
  const sourceGenerationMode = clean(sourceInput.generationMode || sourceRetryContext.generationMode || sourceOutput.generationMode || sourceOutput.metadata?.generation_mode).toLowerCase();
  const sourceWasUpdate = (
    sourceGenerationMode === 'update' ||
    sourceInput.updateMode === true ||
    sourceUpdateContext.updateMode === true ||
    Boolean(sourceUpdateOfJobId)
  );
  return { row, sourceInput, sourceOutput, sourceRetryContext, sourceUpdateContext, sourceUpdateOfJobId, sourceGenerationMode, sourceWasUpdate };
}

const byJobId = new Map(sourceRows.map(row => [row.job_id, row]));
const chainRows = [];
const seenChain = new Set();
let cursor = clean(job.retryOfJobId || job.input?.retryOfJobId || job.input?.retryContext?.retryOfJobId);
while (cursor && !seenChain.has(cursor)) {
  seenChain.add(cursor);
  const row = byJobId.get(cursor);
  if (!row) break;
  chainRows.push(row);
  cursor = clean(row.retry_of_job_id || asObject(row.input).retryOfJobId || asObject(row.input).retryContext?.retryOfJobId);
}
const candidateRows = [...chainRows, ...sourceRows];
const source = candidateRows.map(rowDetails).find(item => item.sourceWasUpdate) || rowDetails(chainRows[0] || sourceRows[0] || {});
const { row: sourceRow, sourceInput, sourceOutput, sourceUpdateContext, sourceUpdateOfJobId, sourceWasUpdate } = source;

if (!job.retryMode || !sourceWasUpdate) {
  return [{ json: job }];
}

const retryOfJobId = clean(job.retryOfJobId || job.input?.retryOfJobId || job.input?.retryContext?.retryOfJobId || sourceRow.job_id);
const updateOfJobId = sourceUpdateOfJobId || clean(job.updateOfJobId || job.input?.updateOfJobId || job.input?.updateContext?.previousJobId);
const existingUpdateContext = asObject(job.input?.updateContext);
const mergedUpdateContext = {
  ...sourceUpdateContext,
  ...existingUpdateContext,
  previousJobId: updateOfJobId || sourceUpdateContext.previousJobId || null,
  updateMode: true,
  deltaRequested: existingUpdateContext.deltaRequested ?? sourceUpdateContext.deltaRequested ?? true,
  preserveExistingBacklog: existingUpdateContext.preserveExistingBacklog ?? sourceUpdateContext.preserveExistingBacklog ?? true,
  retryOfJobId,
  retrySourceJobId: sourceRow.job_id || retryOfJobId,
  retryLineageHydrated: true
};
const retryInstruction = job.retryInstruction || job.input?.retryInstruction || 'Retry the failed update as an update repair. Preserve update semantics, patch the existing target output, and do not create duplicate Jira or Confluence artifacts.';
const retryContext = {
  ...(job.input?.retryContext || {}),
  retryOfJobId,
  retryMode: true,
  generationMode: 'update',
  updateOfJobId: updateOfJobId || null,
  previousStatus: sourceRow.status || job.input?.retryContext?.previousStatus || null,
  previousError: sourceOutput.message || sourceOutput.error || job.input?.retryContext?.previousError || null,
  retryInstruction
};

return [{
  json: {
    ...job,
    generationMode: 'update',
    updateMode: true,
    updateOfJobId: updateOfJobId || null,
    retryInstruction,
    input: {
      ...job.input,
      generationMode: 'update',
      updateMode: true,
      updateOfJobId: updateOfJobId || null,
      updateContext: mergedUpdateContext,
      retryContext,
      retryInstruction
    }
  }
}];`,
    },
  });

  const combineNode = nodes.find((node) => node.name === 'Combine Job And Runtime');
  if (!combineNode?.parameters?.jsCode) {
    throw new Error('Combine Job And Runtime node not found');
  }
  combineNode.parameters.jsCode = `const runtimeRaw = $input.first().json || {};
const runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;
const hydratedJob = $('Hydrate Retry Update Lineage').item?.json;
const fallbackJob = $('Prepare Runtime Config Request').item.json;
const job = hydratedJob && hydratedJob.ok !== false ? hydratedJob : fallbackJob;
const settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? 1;
const configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? runtime ?? {};
return [{ json: { ...job, settingsVersion, configSnapshot } }];`;

  setMainConnection(connections, 'Prepare Runtime Config Request', 'Fetch Retry Source QA Job');
  setMainConnection(connections, 'Fetch Retry Source QA Job', 'Hydrate Retry Update Lineage');
  setMainConnection(connections, 'Hydrate Retry Update Lineage', 'Runtime Request Ready?');

  return {
    nodes: JSON.stringify(nodes),
    connections: JSON.stringify(connections),
  };
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, nodes, connections from workflow_history where versionId = ?', [row.activeVersionId])
      : null;
    const stamp = nowStamp();
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_retry_update_lineage_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const entityPatch = patchWorkflow(row);
    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
      entityPatch.nodes,
      entityPatch.connections,
      now,
      workflowId,
    ]);

    if (historyRow) {
      const historyPatch = patchWorkflow({ ...historyRow, activeVersionId: historyRow.versionId });
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where versionId = ?', [
        historyPatch.nodes,
        historyPatch.connections,
        now,
        historyRow.versionId,
      ]);
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      nodes: ['Fetch Retry Source QA Job', 'Hydrate Retry Update Lineage'],
      backupPath,
      updatedAt: now,
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
