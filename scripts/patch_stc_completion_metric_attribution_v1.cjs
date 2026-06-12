const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const label = 'stc_completion_metric_attribution_v1';
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

function makeHttpNode(name, position, parameters, credentials) {
  return {
    parameters,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position,
    id: crypto.randomUUID(),
    name,
    credentials,
  };
}

function setSingleConnection(connections, from, to) {
  connections[from] = { main: [[{ node: to, type: 'main', index: 0 }]] };
}

function upsertNode(nodes, nextNode) {
  const existing = nodes.find(item => item.name === nextNode.name);
  if (existing) {
    Object.assign(existing, nextNode, { id: existing.id });
    return existing;
  }
  nodes.push(nextNode);
  return nextNode;
}

const metricBody = String.raw`={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: "story_test_cases", pipeline: "generation", event: "JOB_COMPLETED", status: "info", project_id: $json.projectId || null, requested_by: $json.requestedBy || null, duration_ms: Math.max(0, Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime()), word_count: $json.wordCount || $json.output?.wordCount || 0, tokens_input: $json.tokensInput || $json.output?.tokensInput || $json.output?.tokenUsage?.input || $json.output?.tokenUsage?.tokensInput || 0, tokens_output: $json.tokensOutput || $json.output?.tokensOutput || $json.output?.tokenUsage?.output || $json.output?.tokenUsage?.tokensOutput || 0, tokens_total: $json.tokensTotal || $json.output?.tokensTotal || $json.output?.tokenUsage?.total || $json.output?.tokenUsage?.tokensTotal || 0, estimated_cost_usd: $json.estimatedCostUsd || $json.output?.estimatedCostUsd || $json.output?.tokenUsage?.estimatedCostUsd || 0, metadata: { metric_key: String($json.jobId || "") + ":JOB_COMPLETED:completed", persisted_by: "story_testcase_generator", generator_mode: "professional_story_test_cases", generation_mode: $json.generationMode || $json.output?.generationMode || "create", update_of_job_id: $json.updateOfJobId || $json.output?.updateOfJobId || null, retry_of_job_id: $json.retryOfJobId || $json.output?.retryOfJobId || null, source_user_story_job_id: $json.sourceUserStoryJobId || $json.output?.sourceUserStoryJobId || null, story_count: Array.isArray($json.stories) ? $json.stories.length : (Array.isArray($json.output?.stories) ? $json.output.stories.length : 0), testcase_count: Array.isArray($json.testCases) ? $json.testCases.length : (Array.isArray($json.output?.testCases) ? $json.output.testCases.length : 0), mapping_count: Array.isArray($json.mappings) ? $json.mappings.length : (Array.isArray($json.output?.mappings) ? $json.output.mappings.length : 0), testcase_created_count: $json.jira?.created || $json.output?.jira?.created || 0, testcase_updated_count: $json.jira?.updated || $json.output?.jira?.updated || 0, testcase_reused_count: $json.jira?.reused || $json.output?.jira?.reused || 0, coverage_status: $json.coverageSummary?.gateStatus || $json.output?.coverageSummary?.gateStatus || $json.qualityGate?.coverageSummary?.gateStatus || $json.output?.qualityGate?.coverageSummary?.gateStatus || null, missing_story_count: $json.coverageSummary?.missingCount || $json.output?.coverageSummary?.missingCount || 0, partial_story_count: $json.coverageSummary?.partialCount || $json.output?.coverageSummary?.partialCount || 0, requires_coverage_repair: Boolean(($json.coverageSummary?.partialCount || $json.output?.coverageSummary?.partialCount || 0) || ($json.coverageSummary?.missingCount || $json.output?.coverageSummary?.missingCount || 0)), repair_targets: ($json.coverageLedger || $json.output?.coverageLedger || []).filter(row => /partial|missing|review/i.test(String(row.coverageStatus || row.status || ""))).map(row => ({ storyKey: row.storyKey || row.sourceStoryKey || row.requirementId || null, storyId: row.storyId || null, storySummary: row.storySummary || row.summary || row.title || null, coverageStatus: row.coverageStatus || row.status || null, plannedTestCases: row.plannedTestCases || row.plannedTestCaseCount || null, generatedTestCases: row.generatedTestCases || row.generatedTestCaseCount || null, missingCategories: row.missingCategories || [] })) } }) }}`;

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = JSON.parse(row.connections);
    const logNode = requireNode(nodes, 'LOG: Direct Story Test Case Job Completed');
    const markNode = requireNode(nodes, 'Mark Direct Story Test Case Job Completed');

    logNode.parameters = {
      ...(logNode.parameters || {}),
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: metricBody,
      options: {},
    };

    // If this node ever runs in a retry/resume path, repair the terminal metric
    // attribution after the job has been marked complete. This is deliberately
    // after the existing status update and does not alter Jira publishing.
    upsertNode(nodes, makeHttpNode('Repair Direct Story Test Case Completion Metric Attribution', [7248, 96], {
      method: 'PATCH',
      url: '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?job_id=eq.{{ $json.jobId || $json.job_id }}&event=eq.JOB_COMPLETED&pipeline=eq.generation&document_type=eq.story_test_cases&requested_by=is.null',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ requested_by: $json.requestedBy || $json.requested_by || null, project_id: $json.projectId || $json.project_id || null }) }}',
      options: {},
    }, logNode.credentials));

    setSingleConnection(connections, 'Mark Direct Story Test Case Job Completed', 'Repair Direct Story Test Case Completion Metric Attribution');
    setSingleConnection(connections, 'Repair Direct Story Test Case Completion Metric Attribution', 'Return Direct Story Test Case Result');

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      ok: true,
      workflowId,
      workflowName: row.name,
      updatedAt: now,
      backupPath,
      patchedNodes: [
        'LOG: Direct Story Test Case Job Completed',
        'Repair Direct Story Test Case Completion Metric Attribution',
      ],
      downstreamStatusNodePreserved: markNode.name,
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
