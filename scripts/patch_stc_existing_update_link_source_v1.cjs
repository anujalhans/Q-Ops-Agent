const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const label = 'stc_existing_update_link_source_v1';
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

function patchSearchSource(nodes, connections) {
  requireNode(nodes, 'Expand Story Test Case Items');
  requireNode(nodes, 'Search Existing Test Case By Stable Label');
  requireNode(nodes, 'Test Case Needs Create?');
  const prepareCreate = requireNode(nodes, 'Prepare Story Test Case Create Request');
  const normalizeExisting = requireNode(nodes, 'Normalize Existing Story Test Case');

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`const expandedItems = $('Expand Story Test Case Items').all().map((item) => item.json || {});
const searchItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return searchItems.map((item, index) => {
  const search = item.json || {};
  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};
  if (!source.storyKey || !source.stableLabel) {
    throw new Error('Unable to attach Story Test Case search result to source item at index ' + index + '.');
  }
  return {
    json: {
      ...source,
      searchResult: search,
      issues: Array.isArray(search.issues) ? search.issues : [],
      publishStage: 'existing_search_checked',
    },
  };
});`,
    },
    id: crypto.randomUUID(),
    name: 'Attach Story Test Case Search Source',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [7184, 36],
  });

  prepareCreate.parameters.jsCode = String.raw`const expandedItems = $('Expand Story Test Case Items').all().map((item) => item.json || {});
const branchItems = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return branchItems.map((item, index) => {
  const candidate = item.json || {};
  const source = candidate.createIssueBody
    ? candidate
    : (expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {});
  if (!source.storyKey || !source.createIssueBody) {
    throw new Error('Unable to prepare Jira Test Case create request because source item context was not preserved.');
  }
  return {
    json: {
      ...source,
      searchResult: candidate.searchResult || candidate,
      publishStage: 'create_request_prepared',
    },
  };
});`;

  normalizeExisting.parameters.jsCode = String.raw`return $input.all().map((item) => {
  const source = item.json || {};
  const search = source.searchResult || source;
  const existing = Array.isArray(search.issues) ? search.issues[0] : null;
  if (!source.storyKey || !source.stableLabel) {
    throw new Error('Existing Jira Test Case result is missing source story context.');
  }
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

  setSingleConnection(connections, 'Search Existing Test Case By Stable Label', 'Attach Story Test Case Search Source');
  setSingleConnection(connections, 'Attach Story Test Case Search Source', 'Test Case Needs Create?');
}

function patchUpdateSource(nodes, connections) {
  requireNode(nodes, 'Existing Test Case Needs Update?');
  requireNode(nodes, 'Update Existing Jira Test Case');
  const normalizeUpdated = requireNode(nodes, 'Normalize Updated Existing Story Test Case');

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`return $input.all().map((item, index) => {
  const source = item.json || {};
  if (!source.storyKey || !source.testcaseKey || !source.updateIssueBody) {
    throw new Error('Unable to prepare existing Story Test Case update request at index ' + index + '.');
  }
  return {
    json: {
      ...source,
      publishStage: 'update_request_prepared',
    },
  };
});`,
    },
    id: crypto.randomUUID(),
    name: 'Prepare Existing Story Test Case Update Request',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [8256, -12],
  });

  normalizeUpdated.parameters.jsCode = String.raw`const updateSources = $('Prepare Existing Story Test Case Update Request').all().map((item) => item.json || {});
const responses = $input.all();

function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}

return responses.map((item, index) => {
  const source = updateSources[pairedIndex(item, index)] || updateSources[index] || updateSources[0] || {};
  if (!source.storyKey || !source.testcaseKey) {
    throw new Error('Updated Jira Test Case response could not be paired to its source story/test case.');
  }
  return {
    json: {
      ...source,
      linkStatus: 'not_checked',
      linkChecked: false,
      linkCreated: false
    }
  };
});`;

  setSingleConnection(connections, 'Existing Test Case Needs Update?', 'Prepare Existing Story Test Case Update Request', 0);
  setSingleConnection(connections, 'Prepare Existing Story Test Case Update Request', 'Update Existing Jira Test Case');
}

function patchLinkSource(nodes, connections) {
  requireNode(nodes, 'Restore Story Test Case Progress - Linking Traceability');
  requireNode(nodes, 'Fetch Existing Test Case Story Links');
  const detectLink = requireNode(nodes, 'Detect Existing Story Test Case Link');

  upsertNode(nodes, {
    parameters: {
      jsCode: String.raw`return $input.all().map((item, index) => {
  const source = item.json || {};
  if (!source.storyKey || !source.testcaseKey) {
    throw new Error('Unable to prepare Story Test Case link check request at index ' + index + '.');
  }
  return {
    json: {
      ...source,
      publishStage: 'link_check_prepared',
    },
  };
});`,
    },
    id: crypto.randomUUID(),
    name: 'Prepare Story Test Case Link Check Request',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [9744, 28],
  });

  detectLink.parameters.jsCode = String.raw`const sourceItems = $('Prepare Story Test Case Link Check Request').all().map((item) => item.json || {});
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
  if (!source.storyKey || !source.testcaseKey) {
    throw new Error('Story Test Case link-check response could not be paired to its source story/test case.');
  }
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

  setSingleConnection(connections, 'Restore Story Test Case Progress - Linking Traceability', 'Prepare Story Test Case Link Check Request');
  setSingleConnection(connections, 'Prepare Story Test Case Link Check Request', 'Fetch Existing Test Case Story Links');
}

function patchWorkflow(nodes, connections) {
  patchSearchSource(nodes, connections);
  patchUpdateSource(nodes, connections);
  patchLinkSource(nodes, connections);
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
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);

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
