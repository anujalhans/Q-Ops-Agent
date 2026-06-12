const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const supabaseCredential = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key',
  },
};

const jiraCredential = {
  jiraSoftwareCloudApi: {
    id: 'F5nyQnchcdE8LxV1',
    name: 'Jira SW Cloud account',
  },
};

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

function upsertNode(nodes, node) {
  const index = nodes.findIndex(item => item.name === node.name);
  if (index >= 0) {
    nodes[index] = {
      ...nodes[index],
      ...node,
      id: nodes[index].id,
    };
    return nodes[index];
  }
  nodes.push(node);
  return node;
}

function setConnection(connections, from, outputs) {
  connections[from] = { main: outputs };
}

function single(nodeName) {
  return [[{ node: nodeName, type: 'main', index: 0 }]];
}

function ifOutputs(trueNode, falseNode) {
  return [
    [{ node: trueNode, type: 'main', index: 0 }],
    [{ node: falseNode, type: 'main', index: 0 }],
  ];
}

function enableJiraRetry(node, maxTries = 8, waitBetweenTries = 30000, batchInterval = 2500) {
  node.retryOnFail = true;
  node.maxTries = maxTries;
  node.waitBetweenTries = waitBetweenTries;
  node.parameters = node.parameters || {};
  node.parameters.options = node.parameters.options || {};
  node.parameters.options.batching = {
    batch: {
      batchSize: 1,
      batchInterval,
    },
  };
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

function makeCodeNode(name, position, jsCode) {
  return {
    parameters: { jsCode },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    id: crypto.randomUUID(),
    name,
  };
}

function makeIfNode(name, position, conditionExpression) {
  return {
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [{
          leftValue: conditionExpression,
          rightValue: true,
          operator: { type: 'boolean', operation: 'true', singleValue: true },
        }],
      },
      options: {},
    },
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position,
    id: crypto.randomUUID(),
    name,
  };
}

const checkpointJsonBody = String.raw`={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: "Relates", status: ($json.action || "unknown") + "_publish_checkpoint", metadata: { action: $json.action, checkpoint: "jira_publish_pre_link", link_status: $json.linkStatus || "not_checked", canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}`;

const finalMappingJsonBody = String.raw`={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: "Relates", status: $json.linkStatus === "linked" || $json.linkStatus === "already_linked" ? "linked" : ($json.action === "updated" ? "updated" : ($json.action === "created" ? "created" : "reused")), metadata: { action: $json.action, checkpoint: "jira_publish_final", link_status: $json.linkStatus || "unknown", link_checked: Boolean($json.linkChecked), link_created: Boolean($json.linkCreated), link_already_existed: $json.linkStatus === "already_linked", canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}`;

const normalizeCreatedCode = String.raw`const expandedItems = $('Expand Story Test Case Items').all().map((item) => item.json || {});
const createdItems = $('Create Jira Test Case').all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return createdItems.map((item, index) => {
  const created = item.json || {};
  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};
  return {
    json: {
      ...source,
      action: 'created',
      testcaseKey: created.key,
      testcaseId: created.id,
      testcaseSelf: created.self,
      testcaseLink: source.jiraBaseUrl + '/browse/' + created.key,
      linkStatus: 'not_checked',
      linkChecked: false,
      linkCreated: false
    }
  };
});`;

const normalizeExistingCode = String.raw`const expandedItems = $('Expand Story Test Case Items').all().map((item) => item.json || {});
const searchItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return searchItems.map((item, index) => {
  const search = item.json || {};
  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};
  const existing = Array.isArray(search.issues) ? search.issues[0] : null;
  if (!existing?.key) throw new Error('Expected an existing Jira Test Case issue for stable label ' + source.stableLabel + ' but none was returned.');
  const generationMode = String(source.generationMode || '').trim().toLowerCase();
  const shouldUpdate = generationMode === 'update';
  const updateFields = {
    summary: source.createIssueBody?.fields?.summary || source.testCaseSummary,
    description: source.createIssueBody?.fields?.description || source.jiraDescription,
    labels: source.createIssueBody?.fields?.labels || [source.stableLabel, 'qops-story-test-cases']
  };
  return {
    json: {
      ...source,
      action: shouldUpdate ? 'updated' : 'reused',
      testcaseKey: existing.key,
      testcaseId: existing.id || null,
      testcaseSelf: existing.self || null,
      testcaseLink: source.jiraBaseUrl + '/browse/' + existing.key,
      updateIssueBody: { fields: updateFields },
      linkStatus: 'not_checked',
      linkChecked: false,
      linkCreated: false
    }
  };
});`;

const normalizeUpdatedCode = String.raw`const updatedSources = $('Normalize Existing Story Test Case').all().map((item) => item.json || {}).filter((item) => item.action === 'updated');
const responses = $input.all();
function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}
return responses.map((item, index) => {
  const source = updatedSources[pairedIndex(item, index)] || updatedSources[index] || updatedSources[0] || {};
  return {
    json: {
      ...source,
      linkStatus: 'not_checked',
      linkChecked: false,
      linkCreated: false
    }
  };
});`;

const linkNeededCode = String.raw`const sourceItems = $('Recover Story Test Case Publish Checkpoint Items').all().map((item) => item.json || {});
const issueItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

function linkedToStory(issue, storyKey) {
  const target = String(storyKey || '').trim();
  if (!target) return false;
  const links = Array.isArray(issue?.fields?.issuelinks) ? issue.fields.issuelinks : [];
  return links.some((link) => {
    const inward = String(link.inwardIssue?.key || '').trim();
    const outward = String(link.outwardIssue?.key || '').trim();
    return inward === target || outward === target;
  });
}

return issueItems.map((item, index) => {
  const issue = item.json || {};
  const source = sourceItems[pairedIndex(item, index)] || sourceItems[index] || sourceItems[0] || {};
  const alreadyLinked = linkedToStory(issue, source.storyKey);
  return {
    json: {
      ...source,
      linkChecked: true,
      linkNeeded: !alreadyLinked,
      linkStatus: alreadyLinked ? 'already_linked' : 'needs_link'
    }
  };
});`;

const normalizeLinkedCode = String.raw`const linkCandidates = $('Story Test Case Link Needed?').all().map((item) => item.json || {}).filter((item) => item.linkNeeded);
const responses = $input.all();
function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}
return responses.map((item, index) => {
  const source = linkCandidates[pairedIndex(item, index)] || linkCandidates[index] || linkCandidates[0] || {};
  return {
    json: {
      ...source,
      linkChecked: true,
      linkCreated: true,
      linkNeeded: false,
      linkStatus: 'linked'
    }
  };
});`;

const markAlreadyLinkedCode = String.raw`return $input.all().map((item) => ({
  json: {
    ...(item.json || {}),
    linkChecked: true,
    linkCreated: false,
    linkNeeded: false,
    linkStatus: 'already_linked'
  }
}));`;

const recoverCheckpointItemsCode = String.raw`function safeAll(nodeName) {
  try { return $(nodeName).all().map((item) => item.json || {}); }
  catch (error) {
    if (String(error?.message || error).includes("hasn't been executed")) return [];
    throw error;
  }
}

const createdItems = safeAll('Normalize Created Story Test Case');
const reusedItems = safeAll('Normalize Existing Story Test Case').filter(item => item.action !== 'updated');
const updatedItems = safeAll('Normalize Updated Existing Story Test Case');
const allItems = [...createdItems, ...reusedItems, ...updatedItems];
const uniqueItems = [];
const seen = new Set();
for (const item of allItems) {
  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join('|');
  if (!key || seen.has(key)) continue;
  seen.add(key);
  uniqueItems.push(item);
}
return uniqueItems.map(item => ({ json: item }));`;

function patchWorkflow(nodes, connections) {
  const searchNode = requireNode(nodes, 'Search Existing Test Case By Stable Label');
  const createNode = requireNode(nodes, 'Create Jira Test Case');
  const linkNode = requireNode(nodes, 'Link Created Test Case To Story');
  const updateNode = requireNode(nodes, 'Update Existing Jira Test Case');
  const normalizeCreated = requireNode(nodes, 'Normalize Created Story Test Case');
  const normalizeExisting = requireNode(nodes, 'Normalize Existing Story Test Case');
  const normalizeUpdated = requireNode(nodes, 'Normalize Updated Existing Story Test Case');
  const upsertFinal = requireNode(nodes, 'Upsert Story Test Case Mapping');

  enableJiraRetry(searchNode, 6, 20000, 1500);
  enableJiraRetry(createNode, 8, 30000, 2500);
  enableJiraRetry(updateNode, 6, 30000, 2500);
  enableJiraRetry(linkNode, 8, 45000, 3000);

  normalizeCreated.parameters.jsCode = normalizeCreatedCode;
  normalizeExisting.parameters.jsCode = normalizeExistingCode;
  normalizeUpdated.parameters.jsCode = normalizeUpdatedCode;

  linkNode.parameters.method = 'POST';
  linkNode.parameters.url = '={{ $json.jiraBaseUrl + "/rest/api/3/issueLink" }}';
  linkNode.parameters.jsonBody = '={{ JSON.stringify({ type: { name: "Relates" }, inwardIssue: { key: $json.storyKey }, outwardIssue: { key: $json.testcaseKey }, comment: { body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "Linked by Q-Ops Story Test Cases generation." }] }] } } }) }}';

  upsertFinal.parameters.jsonBody = finalMappingJsonBody;

  upsertNode(nodes, makeHttpNode('Upsert Story Test Case Publish Checkpoint', [5232, 96], {
    method: 'POST',
    url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpCustomAuth',
    sendHeaders: true,
    specifyHeaders: 'json',
    jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=representation" }',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: checkpointJsonBody,
    options: { batching: { batch: { batchSize: 1, batchInterval: 500 } } },
  }, supabaseCredential));

  upsertNode(nodes, makeHttpNode('Fetch Existing Test Case Story Links', [5472, 96], {
    method: 'GET',
    url: '={{ $json.jiraBaseUrl + "/rest/api/3/issue/" + encodeURIComponent($json.testcaseKey) + "?fields=issuelinks" }}',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'jiraSoftwareCloudApi',
    options: { batching: { batch: { batchSize: 1, batchInterval: 1500 } } },
  }, jiraCredential));
  enableJiraRetry(requireNode(nodes, 'Fetch Existing Test Case Story Links'), 6, 20000, 1500);

  upsertNode(nodes, makeCodeNode('Recover Story Test Case Publish Checkpoint Items', [5352, 96], recoverCheckpointItemsCode));
  upsertNode(nodes, makeCodeNode('Detect Existing Story Test Case Link', [5712, 96], linkNeededCode));
  upsertNode(nodes, makeIfNode('Story Test Case Link Needed?', [5952, 96], '={{ Boolean($json.linkNeeded) }}'));
  upsertNode(nodes, makeCodeNode('Normalize Linked Story Test Case', [6432, 16], normalizeLinkedCode));
  upsertNode(nodes, makeCodeNode('Mark Story Test Case Link Existing', [6432, 176], markAlreadyLinkedCode));

  setConnection(connections, 'Create Jira Test Case', single('Normalize Created Story Test Case'));
  setConnection(connections, 'Normalize Created Story Test Case', single('Upsert Story Test Case Publish Checkpoint'));
  setConnection(connections, 'Normalize Existing Story Test Case', single('Existing Test Case Needs Update?'));
  setConnection(connections, 'Existing Test Case Needs Update?', ifOutputs('Update Existing Jira Test Case', 'Upsert Story Test Case Publish Checkpoint'));
  setConnection(connections, 'Update Existing Jira Test Case', single('Normalize Updated Existing Story Test Case'));
  setConnection(connections, 'Normalize Updated Existing Story Test Case', single('Upsert Story Test Case Publish Checkpoint'));
  setConnection(connections, 'Upsert Story Test Case Publish Checkpoint', single('Recover Story Test Case Publish Checkpoint Items'));
  setConnection(connections, 'Recover Story Test Case Publish Checkpoint Items', single('Fetch Existing Test Case Story Links'));
  setConnection(connections, 'Fetch Existing Test Case Story Links', single('Detect Existing Story Test Case Link'));
  setConnection(connections, 'Detect Existing Story Test Case Link', single('Story Test Case Link Needed?'));
  setConnection(connections, 'Story Test Case Link Needed?', ifOutputs('Link Created Test Case To Story', 'Mark Story Test Case Link Existing'));
  setConnection(connections, 'Link Created Test Case To Story', single('Normalize Linked Story Test Case'));
  setConnection(connections, 'Normalize Linked Story Test Case', single('Upsert Story Test Case Mapping'));
  setConnection(connections, 'Mark Story Test Case Link Existing', single('Upsert Story Test Case Mapping'));
  setConnection(connections, 'Upsert Story Test Case Mapping', single('Finalize Story Test Case Result'));

  return {
    retryNodes: [
      searchNode.name,
      createNode.name,
      updateNode.name,
      linkNode.name,
      'Fetch Existing Test Case Story Links',
    ],
    addedNodes: [
      'Upsert Story Test Case Publish Checkpoint',
      'Recover Story Test Case Publish Checkpoint Items',
      'Fetch Existing Test Case Story Links',
      'Detect Existing Story Test Case Link',
      'Story Test Case Link Needed?',
      'Normalize Linked Story Test Case',
      'Mark Story Test Case Link Existing',
    ],
  };
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_stc_jira_publish_resilience_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = JSON.parse(row.connections);
    const patchSummary = patchWorkflow(nodes, connections);

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
      backupPath,
      updatedAt: now,
      ...patchSummary,
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
