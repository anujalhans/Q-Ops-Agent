const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'yPgr7mtUnL3E8QQP';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_queue_durable_start_v1';
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
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Required node not found: ${name}`);
  return node;
}

function ensureNode(nodes, node) {
  const existing = nodes.find((item) => item.name === node.name);
  if (existing) {
    existing.parameters = node.parameters;
    existing.type = node.type;
    existing.typeVersion = node.typeVersion;
    existing.position = node.position;
    if (node.credentials) existing.credentials = node.credentials;
    if (node.alwaysOutputData !== undefined) existing.alwaysOutputData = node.alwaysOutputData;
    return existing;
  }
  nodes.push(node);
  return node;
}

function connect(connections, from, outputs) {
  connections[from] = connections[from] || {};
  connections[from].main = outputs;
}

function mainOutput(to) {
  return [{ node: to, type: 'main', index: 0 }];
}

function compileCodeNodes(nodes, names) {
  for (const name of names) {
    const node = requireNode(nodes, name);
    if (node.parameters?.jsCode) new Function(node.parameters.jsCode);
  }
}

function patchWorkflow(row) {
  const nodes = JSON.parse(row.nodes);
  const connections = JSON.parse(row.connections);
  const persistNode = requireNode(nodes, 'Persist Professional Job');
  const rtmIfNode = requireNode(nodes, 'Traceability Matrix Request?');
  requireNode(nodes, 'Fetch RTM Prerequisite Jobs');
  requireNode(nodes, 'RTM Prerequisites Ready?');
  requireNode(nodes, 'Professional Job Persisted?');

  const credentials = persistNode.credentials;
  if (!credentials?.httpCustomAuth) throw new Error('Supabase httpCustomAuth credential reference was not found.');

  ensureNode(nodes, {
    id: 'rtm-persist-preparing-job-v1',
    name: 'Persist RTM Preparing Job',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position: [2240, -128],
    credentials,
    alwaysOutputData: true,
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, status: "preparing", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, retry_of_job_id: $json.retryOfJobId || null }) }}',
      options: {},
    },
  });

  ensureNode(nodes, {
    id: 'rtm-preparing-job-persisted-if-v1',
    name: 'RTM Preparing Job Persisted?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [2464, -128],
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [{
          leftValue: '={{ Object.keys($json).length }}',
          rightValue: 0,
          operator: { type: 'number', operation: 'gt' },
        }],
      },
      options: {},
    },
  });

  ensureNode(nodes, {
    id: 'rtm-promote-preparing-job-v1',
    name: 'Promote RTM Preparing Job to Pending',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position: [3360, -128],
    credentials,
    alwaysOutputData: true,
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.preparing',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ status: "pending", input: $json.input, updated_at: $now.toISO() }) }}',
      options: {},
    },
  });

  ensureNode(nodes, {
    id: 'rtm-mark-preparing-job-failed-v1',
    name: 'Mark RTM Preparing Job Failed',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position: [3360, 96],
    credentials,
    alwaysOutputData: true,
    parameters: {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.preparing',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ status: "failed", error: $json.message || "RTM prerequisites were not ready.", output: { status: "failed", errorType: $json.errorCode || "RTM_PREREQUISITES_MISSING", message: $json.message || "RTM prerequisites were not ready.", rtmMissingPrerequisites: $json.rtmMissingPrerequisites || [], rtmFreshness: $json.rtmFreshness || null }, updated_at: $now.toISO() }) }}',
      options: {},
    },
  });

  ensureNode(nodes, {
    id: 'rtm-respond-preparing-job-failed-v1',
    name: 'Respond RTM Prerequisite Job Failed',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.5,
    position: [3584, 96],
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: false, jobId: $("Build RTM Traceability Context").item.json.jobId, status: "failed", error: { code: $("Build RTM Traceability Context").item.json.errorCode || "RTM_PREREQUISITES_MISSING", message: $("Build RTM Traceability Context").item.json.message || "RTM prerequisites were not ready." } }) }}',
      options: {
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
  });

  ensureNode(nodes, {
    id: 'rtm-respond-queue-error-v1',
    name: 'Respond RTM Queue Error',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.5,
    position: [2688, -320],
    parameters: {
      respondWith: 'json',
      responseBody: '={{ JSON.stringify({ ok: false, error: { code: "RTM_QUEUE_PERSIST_FAILED", message: "The RTM job could not be recorded before prerequisite hydration." } }) }}',
      options: {
        responseCode: 503,
        responseHeaders: {
          entries: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
        },
      },
    },
  });

  // RTM now creates a durable preparing row before expensive prerequisite hydration.
  // The worker still only processes pending jobs, so RTM generation behavior is unchanged.
  connect(connections, rtmIfNode.name, [
    [mainOutput('Persist RTM Preparing Job')[0]],
    [mainOutput('Persist Professional Job')[0]],
  ]);
  connect(connections, 'Persist RTM Preparing Job', [
    [mainOutput('RTM Preparing Job Persisted?')[0]],
  ]);
  connect(connections, 'RTM Preparing Job Persisted?', [
    [mainOutput('Fetch RTM Prerequisite Jobs')[0]],
    [mainOutput('Respond RTM Queue Error')[0]],
  ]);
  connect(connections, 'RTM Prerequisites Ready?', [
    [mainOutput('Promote RTM Preparing Job to Pending')[0]],
    [mainOutput('Mark RTM Preparing Job Failed')[0]],
  ]);
  connect(connections, 'Promote RTM Preparing Job to Pending', [
    [mainOutput('Professional Job Persisted?')[0]],
  ]);
  connect(connections, 'Mark RTM Preparing Job Failed', [
    [mainOutput('Respond RTM Prerequisite Job Failed')[0]],
  ]);

  compileCodeNodes(nodes, ['Build RTM Traceability Context']);
  return { nodes, connections };
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

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const patched = patchWorkflow(row);
    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(patched.nodes);
    const connectionsJson = JSON.stringify(patched.connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }
    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, backupPath }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
