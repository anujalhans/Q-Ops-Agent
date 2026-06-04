const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const generatorWorkflowId = 'SG7khcKlhHst48WH';
const workerWorkflowId = 'ivz13uFyjfCT8149';
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const httpCredential = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key',
  },
};

const buildDirectCompletionCode = String.raw`const result = $json || {};
const output = {
  documentType: 'story_test_cases',
  destination: { type: 'jira_test_cases', projectId: result.projectId || null },
  sourceUserStoryJobId: result.sourceUserStoryJobId || null,
  stories: Array.isArray(result.stories) ? result.stories : [],
  testCases: Array.isArray(result.testCases) ? result.testCases : [],
  mappings: Array.isArray(result.mappings) ? result.mappings : [],
  categoryDistribution: result.categoryDistribution || {},
  jira: result.jira || null,
  wordCount: Number(result.wordCount || 0),
  tokensInput: Number(result.tokensInput || 0),
  tokensOutput: Number(result.tokensOutput || 0),
  tokensTotal: Number(result.tokensTotal || 0),
  estimatedCostUsd: Number(result.estimatedCostUsd || 0),
};

return [{
  json: {
    ...result,
    generatorPersisted: true,
    output,
  },
}];`;

const returnDirectResultCode = String.raw`const persisted = $('Build Direct Story Test Case Completion Output').first().json;
const original = {
  documentType: persisted.documentType,
  jobId: persisted.jobId,
  projectId: persisted.projectId,
  projectName: persisted.projectName,
  sourceUserStoryJobId: persisted.output?.sourceUserStoryJobId || persisted.sourceUserStoryJobId || null,
  stories: persisted.output?.stories || persisted.stories || [],
  testCases: persisted.output?.testCases || persisted.testCases || [],
  mappings: persisted.output?.mappings || persisted.mappings || [],
  categoryDistribution: persisted.output?.categoryDistribution || persisted.categoryDistribution || {},
  jira: persisted.output?.jira || persisted.jira || null,
  wordCount: persisted.output?.wordCount || persisted.wordCount || 0,
  tokensInput: persisted.output?.tokensInput || persisted.tokensInput || 0,
  tokensOutput: persisted.output?.tokensOutput || persisted.tokensOutput || 0,
  tokensTotal: persisted.output?.tokensTotal || persisted.tokensTotal || 0,
  estimatedCostUsd: persisted.output?.estimatedCostUsd || persisted.estimatedCostUsd || 0,
  generatorPersisted: true,
};
return [{ json: original }];`;

const workerBuildCompletionCode = String.raw`const result = $json || {};
if (result.generatorPersisted || result.outputPersisted) {
  return [];
}
const input = $('Prepare Story Test Case Generator Input').first().json;
return [{
  json: {
    ...input,
    output: {
      documentType: 'story_test_cases',
      destination: { type: 'jira_test_cases', projectId: input.projectId || null },
      sourceUserStoryJobId: result.sourceUserStoryJobId || null,
      stories: Array.isArray(result.stories) ? result.stories : [],
      testCases: Array.isArray(result.testCases) ? result.testCases : [],
      mappings: Array.isArray(result.mappings) ? result.mappings : [],
      jira: result.jira || null,
      wordCount: result.wordCount || 0,
      tokensInput: result.tokensInput || 0,
      tokensOutput: result.tokensOutput || 0,
      tokensTotal: result.tokensTotal || 0,
      estimatedCostUsd: result.estimatedCostUsd || 0
    }
  }
}];`;

function makeCodeNode(name, x, y, jsCode) {
  return {
    parameters: { jsCode },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [x, y],
    id: crypto.randomUUID(),
    name,
  };
}

function makeHttpNode(name, x, y, parameters) {
  return {
    parameters,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position: [x, y],
    id: crypto.randomUUID(),
    name,
    credentials: httpCredential,
  };
}

function upsertNode(nodes, node) {
  const index = nodes.findIndex((item) => item.name === node.name);
  if (index >= 0) nodes[index] = { ...nodes[index], ...node, id: nodes[index].id };
  else nodes.push(node);
}

function connect(connections, from, to) {
  connections[from] = { main: [[{ node: to, type: 'main', index: 0 }]] };
}

fs.mkdirSync(backupDir, { recursive: true });
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('select * from workflow_entity where id = ?', [generatorWorkflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${generatorWorkflowId}`);
    const backupPath = path.join(backupDir, `workflow_${generatorWorkflowId}_before_story_testcase_direct_completion_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = JSON.parse(row.connections);

    upsertNode(nodes, makeCodeNode('Build Direct Story Test Case Completion Output', 3320, 280, buildDirectCompletionCode));
    upsertNode(nodes, makeHttpNode('LOG: Direct Story Test Case Job Completed', 3540, 280, {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: "generation", event: "JOB_COMPLETED", status: "info", project_id: $json.projectId, requested_by: $json.requestedBy, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.output.wordCount || 0, tokens_input: $json.output.tokensInput || 0, tokens_output: $json.output.tokensOutput || 0, tokens_total: $json.output.tokensTotal || 0, estimated_cost_usd: $json.output.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", source_user_story_job_id: $json.output.sourceUserStoryJobId, story_count: ($json.output.stories || []).length, testcase_count: ($json.output.testCases || []).length, mapping_count: ($json.output.mappings || []).length, settings_version: $json.settingsVersion, persisted_by: "story_testcase_generator" } }) }}',
      options: {},
    }));
    upsertNode(nodes, makeHttpNode('Mark Direct Story Test Case Job Completed', 3760, 280, {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}&status=eq.processing',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ status: "completed", output: $json.output, updated_at: $now.toISO() }) }}',
      options: {},
    }));
    upsertNode(nodes, makeCodeNode('Return Direct Story Test Case Result', 3980, 280, returnDirectResultCode));

    connect(connections, 'Finalize Story Test Case Result', 'Build Direct Story Test Case Completion Output');
    connect(connections, 'Build Direct Story Test Case Completion Output', 'LOG: Direct Story Test Case Job Completed');
    connect(connections, 'LOG: Direct Story Test Case Job Completed', 'Mark Direct Story Test Case Job Completed');
    connect(connections, 'Mark Direct Story Test Case Job Completed', 'Return Direct Story Test Case Result');

    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    db.run("update workflow_entity set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?", [nodesJson, connectionsJson, generatorWorkflowId], function (updateErr) {
      if (updateErr) throw updateErr;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [generatorWorkflowId], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) return;
        db.run("update workflow_history set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?", [nodesJson, connectionsJson, generatorWorkflowId, historyRow.versionId]);
      });
    });
  });

  db.get('select * from workflow_entity where id = ?', [workerWorkflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${workerWorkflowId}`);
    const backupPath = path.join(backupDir, `workflow_${workerWorkflowId}_before_story_testcase_direct_completion_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

    const nodes = JSON.parse(row.nodes);
    const node = nodes.find((item) => item.name === 'Build Story Test Case Completion Output');
    if (!node) throw new Error('Missing worker node: Build Story Test Case Completion Output');
    node.parameters.jsCode = workerBuildCompletionCode;
    const nodesJson = JSON.stringify(nodes);
    db.run("update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?", [nodesJson, workerWorkflowId], function (updateErr) {
      if (updateErr) throw updateErr;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [workerWorkflowId], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) return;
        db.run("update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?", [nodesJson, workerWorkflowId, historyRow.versionId]);
      });
    });
  });
});

setTimeout(() => {
  console.log(JSON.stringify({ patched: [generatorWorkflowId, workerWorkflowId], timestamp }, null, 2));
  db.close();
}, 1000);
