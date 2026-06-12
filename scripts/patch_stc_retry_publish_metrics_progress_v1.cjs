const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const label = 'stc_retry_publish_metrics_progress_v1';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, (error) => error ? reject(error) : resolve()));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
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

function setSingleConnection(connections, from, to, outputIndex = 0) {
  if (!connections[from]) connections[from] = { main: [] };
  connections[from].main = connections[from].main || [];
  connections[from].main[outputIndex] = [{ node: to, type: 'main', index: 0 }];
}

function patchCreateRequestPath(nodes, connections) {
  const createNode = requireNode(nodes, 'Create Jira Test Case');
  const normalizeCreated = requireNode(nodes, 'Normalize Created Story Test Case');
  requireNode(nodes, 'Test Case Needs Create?');

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`const expandedItems = $('Expand Story Test Case Items').all().map((item) => item.json || {});
const searchItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return searchItems.map((item, index) => {
  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};
  if (!source.storyKey || !source.createIssueBody) {
    throw new Error('Unable to prepare Jira Test Case create request because source item context was not preserved.');
  }
  return {
    json: {
      ...source,
      searchResult: item.json || {},
      publishStage: 'create_request_prepared',
    },
  };
});`,
    },
    id: crypto.randomUUID(),
    name: 'Prepare Story Test Case Create Request',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [7584, -112],
  });

  createNode.parameters = {
    ...(createNode.parameters || {}),
    method: 'POST',
    url: '={{ $json.jiraBaseUrl + "/rest/api/3/issue" }}',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'jiraSoftwareCloudApi',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: '={{ JSON.stringify($json.createIssueBody) }}',
    options: {
      batching: {
        batch: {
          batchSize: 1,
          batchInterval: 2500,
        },
      },
    },
  };

  normalizeCreated.parameters.jsCode = String.raw`const createSources = $('Prepare Story Test Case Create Request').all().map((item) => item.json || {});
const createdItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return createdItems.map((item, index) => {
  const created = item.json || {};
  const source = createSources[pairedIndex(item, index)] || createSources[index] || createSources[0] || {};
  if (!source.storyKey || !created.key) {
    throw new Error('Created Jira Test Case response could not be paired to its source story/test case.');
  }
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
      linkCreated: false,
    },
  };
});`;

  setSingleConnection(connections, 'Test Case Needs Create?', 'Prepare Story Test Case Create Request', 0);
  setSingleConnection(connections, 'Prepare Story Test Case Create Request', 'Create Jira Test Case');
}

function patchFinalizeNode(nodes) {
  const node = requireNode(nodes, 'Finalize Story Test Case Result');
  let code = String(node.parameters?.jsCode || '');

  code = code.replace(
    "  sourceStories.forEach(story => ensureStory(story.storyKey, story));\n  metricStories.forEach(story => {\n    const current = ensureStory(story.storyKey, story);\n    if (current && !plannedBatches.length && Number(story.testCaseCount || 0) > current.planned) current.planned = Number(story.testCaseCount || 0);\n    Object.keys(story.categoryDistribution || {}).forEach(category => current?.plannedCategories.add(category));\n  });",
    String.raw`  sourceStories.forEach(story => ensureStory(story.storyKey, story));
  metricStories.forEach(story => {
    const current = ensureStory(story.storyKey, story);
    if (current) {
      const generatedByModel = Number(story.testCaseCount || story.generatedTestCaseCount || story.generatedTestCases || 0) || 0;
      current.modelGenerated = Math.max(Number(current.modelGenerated || 0) || 0, generatedByModel);
      if (!plannedBatches.length && generatedByModel > current.planned) current.planned = generatedByModel;
    }
    Object.keys(story.categoryDistribution || {}).forEach(category => current?.plannedCategories.add(category));
  });`
  );

  code = code.replace(
    "      generatedTestCases: generated || previousGenerated,\n      reusedFromPreviousCoverage: Boolean(previousWasCovered),\n      mappingCount: story.mappings.length,",
    String.raw`      generatedTestCases: generated || previousGenerated,
      modelGeneratedTestCases: Number(story.modelGenerated || 0) || 0,
      publishGap: Boolean((Number(story.modelGenerated || 0) || 0) && generated < (Number(story.modelGenerated || 0) || 0)),
      reusedFromPreviousCoverage: Boolean(previousWasCovered),
      mappingCount: story.mappings.length,`
  );

  code = code.replace(
    "const repairRows = [...missingRows, ...partialRows];\nconst repairTargets = repairRows.map(row => ({",
    String.raw`const repairRows = [...missingRows, ...partialRows];
const publishGaps = coverageRows
  .filter(row => Number(row.modelGeneratedTestCases || 0) > Number(row.mappingCount || 0))
  .map(row => ({
    storyKey: row.storyKey,
    storyId: row.storyId || null,
    storySummary: row.storySummary || row.requirement || row.storyKey,
    modelGeneratedTestCases: Number(row.modelGeneratedTestCases || 0) || 0,
    publishedMappings: Number(row.mappingCount || 0) || 0,
    missingPublishedCases: Math.max(0, Number(row.modelGeneratedTestCases || 0) - Number(row.mappingCount || 0)),
  }));
const publishGapByStory = new Map(publishGaps.map(row => [row.storyKey, row]));
const repairTargets = repairRows.map(row => ({`
  );

  code = code.replace(
    "  missingCategories: Array.isArray(row.missingCategories) ? row.missingCategories : [],\n}));",
    String.raw`  missingCategories: Array.isArray(row.missingCategories) ? row.missingCategories : [],
  publishGap: publishGapByStory.get(row.storyKey) || null,
}));`
  );

  code = code.replace(
    "  requiresCoverageRepair: repairTargets.length > 0,",
    String.raw`  requiresCoverageRepair: repairTargets.length > 0,
  publishGaps,`
  );

  code = code.replace(
    "const error = terminalStatus === 'failed'\n  ? 'Story Test Cases update did not satisfy required story coverage. Retry will target missing or partial stories only.'\n  : null;",
    String.raw`const error = terminalStatus === 'failed'
  ? (publishGaps.length
    ? 'Story Test Cases publish checkpoint incomplete for ' + publishGaps.map(row => row.storyKey).join(', ') + '. Retry will target missing or partial stories only.'
    : 'Story Test Cases update did not satisfy required story coverage. Retry will target missing or partial stories only.')
  : null;`
  );

  code = code.replace(
    "  repairTargets,\n  patchVersion: 'stc-update-gate-usage-summary-v1'",
    String.raw`  repairTargets,
  publishGaps,
  patchVersion: 'stc-retry-publish-metrics-progress-v1'`
  );

  if (!code.includes('publishGaps')) throw new Error('Finalize node publish gap patch did not apply.');
  new Function(code);
  node.parameters.jsCode = code;
}

function patchCompletionMetricGate(nodes, connections) {
  requireNode(nodes, 'Build Direct Story Test Case Completion Output');
  requireNode(nodes, 'LOG: Direct Story Test Case Job Completed');
  requireNode(nodes, 'Mark Direct Story Test Case Job Completed');

  upsertNode(nodes, {
    parameters: {
      conditions: {
        combinator: 'and',
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 3,
        },
        conditions: [
          {
            leftValue: '={{ String($json.terminalStatus || $json.output?.terminalStatus || "completed").toLowerCase() === "completed" }}',
            rightValue: true,
            operator: {
              type: 'boolean',
              operation: 'true',
              singleValue: true,
            },
          },
        ],
      },
      options: {},
    },
    id: crypto.randomUUID(),
    name: 'Story Test Case Completion Metrics Allowed?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position: [6880, 96],
  });

  setSingleConnection(connections, 'Build Direct Story Test Case Completion Output', 'Story Test Case Completion Metrics Allowed?');
  setSingleConnection(connections, 'Story Test Case Completion Metrics Allowed?', 'LOG: Direct Story Test Case Job Completed', 0);
  setSingleConnection(connections, 'Story Test Case Completion Metrics Allowed?', 'Mark Direct Story Test Case Job Completed', 1);
  setSingleConnection(connections, 'LOG: Direct Story Test Case Job Completed', 'Mark Direct Story Test Case Job Completed');
}

function patchWorkflow(nodes, connections) {
  patchCreateRequestPath(nodes, connections);
  patchFinalizeNode(nodes);
  patchCompletionMetricGate(nodes, connections);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes || '[]');
    const connections = JSON.parse(row.connections || '{}');
    patchWorkflow(nodes, connections);

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);

    if (historyRow) {
      const historyNodes = JSON.parse(historyRow.nodes || '[]');
      const historyConnections = JSON.parse(historyRow.connections || row.connections || '{}');
      patchWorkflow(historyNodes, historyConnections);
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(historyNodes), JSON.stringify(historyConnections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, label, backupPath, updatedAt: now }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
