const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function(error) {
    if (error) reject(error);
    else resolve(this);
  }));
}

function findNode(nodes, name) {
  return nodes.find((node) => node.name === name);
}

function requireNode(nodes, name) {
  const node = findNode(nodes, name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function codeNode(name, jsCode, position) {
  return {
    parameters: { jsCode },
    id: crypto.randomUUID(),
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
  };
}

function cloneHttpNode(source, name, parameters, position) {
  return {
    parameters,
    id: crypto.randomUUID(),
    name,
    type: source.type,
    typeVersion: source.typeVersion,
    position,
    credentials: source.credentials,
  };
}

const buildRequestCode = String.raw`
const root = $json;
const labelSafe = value => String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const projectKey = String(root.jiraProjectKey || '').trim();
const title = 'Professional QA Backlog - ' + (root.projectName || 'Unknown Project');
const liveJiraBacklogJql = projectKey
  ? 'project = ' + projectKey + ' AND labels = "qops-generated" AND labels = "qops-pro" ORDER BY updated DESC'
  : '';
return [{
  json: {
    ...root,
    updateContext: root.updateMode ? {
      ...(root.updateContext || {}),
      liveHydrationRequired: true,
      updateSourceOfTruth: 'jira_confluence_live'
    } : (root.updateContext || {}),
    liveJiraBacklogJql,
    liveConfluenceTitle: title,
    liveProjectLabelPrefix: labelSafe((root.idempotencyLabelPrefix || 'qops') + '-' + projectKey)
  }
}];
`;

const buildContextCode = String.raw`
const root = $('Build Live Update Snapshot Request').first().json;
const jiraResponse = $('Search Live Jira Backlog').first().json || {};
const confluenceResponse = $('Search Live Confluence Backlog').first().json || {};
const originalUpdateContext = root.updateContext && typeof root.updateContext === 'object' ? root.updateContext : {};

const clean = value => String(value ?? '').replace(/\r/g, '').trim();
const normalizeKey = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
const array = value => Array.isArray(value) ? value : [];

function adfText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfText).filter(Boolean).join('\n');
  if (typeof node !== 'object') return '';
  const own = typeof node.text === 'string' ? node.text : '';
  const children = Array.isArray(node.content) ? node.content.map(adfText).filter(Boolean).join(node.type === 'paragraph' || node.type === 'heading' ? '\n' : ' ') : '';
  return [own, children].filter(Boolean).join(own && children ? ' ' : '');
}

function stableLabel(labels, kind) {
  return array(labels).find(label => normalizeKey(label).includes(kind === 'epic' ? 'epic' : 'story') && normalizeKey(label).includes('qops')) || '';
}

function correlationFromLabel(label, kind) {
  const lower = String(label || '').toLowerCase();
  const marker = kind === 'epic' ? '-epic-' : '-story-';
  const index = lower.indexOf(marker);
  if (index < 0) return '';
  return lower.slice(index + marker.length).replace(/-/g, ' ').trim().toUpperCase().replace(/\s+/g, '-');
}

function extractLines(text, heading) {
  const lines = clean(text).split(/\n+/).map(line => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  const start = lines.findIndex(line => normalizeKey(line).includes(normalizeKey(heading)));
  if (start < 0) return [];
  const result = [];
  for (const line of lines.slice(start + 1)) {
    if (/^[A-Z][A-Za-z /&-]{2,40}:?$/.test(line) && !/^given|when|then/i.test(line)) break;
    result.push(line.replace(/^\d+[.)]\s*/, '').trim());
    if (result.length >= 12) break;
  }
  return result.filter(Boolean);
}

function issueType(issue) {
  return clean(issue?.fields?.issuetype?.name).toLowerCase();
}

function isEpic(issue) {
  const type = issueType(issue);
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return type === 'epic' || labels.some(label => label.includes('epic'));
}

function isStory(issue) {
  const type = issueType(issue);
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return type === 'story' || type === 'user story' || labels.some(label => label.includes('story'));
}

const issues = array(jiraResponse.issues);
const epics = issues.filter(isEpic);
const stories = issues.filter(isStory);
const epicByKey = new Map();

const previousEpics = epics.map(issue => {
  const labels = array(issue.fields?.labels);
  const stable = stableLabel(labels, 'epic');
  const correlation = correlationFromLabel(stable, 'epic') || clean(issue.key);
  const description = adfText(issue.fields?.description);
  const item = {
    jiraEpicKey: issue.key || null,
    jiraEpicId: issue.id || null,
    epicName: clean(issue.fields?.summary) || issue.key,
    epicSummary: description || clean(issue.fields?.summary),
    businessOutcome: description || clean(issue.fields?.summary),
    epicCorrelationId: correlation,
    stableLabel: stable || null,
    sourceReferences: ['Live Jira epic ' + issue.key],
    action: 'reused'
  };
  epicByKey.set(issue.key, item);
  return item;
});

const previousStories = stories.map(issue => {
  const labels = array(issue.fields?.labels);
  const stable = stableLabel(labels, 'story');
  const correlation = correlationFromLabel(stable, 'story') || clean(issue.key);
  const parentKey = clean(issue.fields?.parent?.key);
  const parentEpic = epicByKey.get(parentKey);
  const description = adfText(issue.fields?.description);
  const acceptanceCriteria = extractLines(description, 'Acceptance Criteria');
  return {
    storyKey: issue.key || null,
    jiraStoryKey: issue.key || null,
    storyId: issue.id || null,
    jiraStoryId: issue.id || null,
    summary: clean(issue.fields?.summary) || issue.key,
    parentEpicKey: parentKey || null,
    parentEpicCorrelationId: parentEpic?.epicCorrelationId || parentKey || null,
    storyCorrelationId: correlation,
    userStory: description || clean(issue.fields?.summary),
    userStoryDescription: description || clean(issue.fields?.summary),
    businessContext: description || clean(issue.fields?.summary),
    acceptanceCriteria: acceptanceCriteria.length ? acceptanceCriteria : ['Retain the existing acceptance criteria from Jira issue ' + issue.key + '.'],
    sourceReferences: ['Live Jira story ' + issue.key],
    stableLabel: stable || null,
    action: 'reused'
  };
});

const confluencePage = array(confluenceResponse.results)[0] || null;
const confluenceBody = clean(confluencePage?.body?.storage?.value);
const coverageRows = [];
if (confluenceBody) {
  const rowMatches = confluenceBody.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  for (const row of rowMatches) {
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(match => clean(match[1].replace(/<[^>]+>/g, ' ')));
    if (cells.length >= 3 && !/coverage id/i.test(cells[0])) {
      coverageRows.push({
        coverageId: cells[0],
        moduleRequirement: cells[1] || '',
        coverageStatus: cells[2] || 'unknown',
        mappedEpicIds: cells[3] ? cells[3].split(',').map(clean).filter(Boolean) : [],
        mappedStoryIds: cells[3] ? cells[3].split(',').map(clean).filter(Boolean) : [],
        notes: cells[4] || '',
        sourceReference: 'Live Confluence page ' + (confluencePage?.id || '')
      });
    }
  }
}

const liveUpdateContext = root.updateMode ? {
  ...originalUpdateContext,
  updateSourceOfTruth: 'jira_confluence_live',
  liveHydrationRequired: true,
  liveHydratedAt: new Date().toISOString(),
  previousConfluencePageId: confluencePage?.id || originalUpdateContext.previousConfluencePageId || null,
  previousConfluenceUrl: confluencePage?._links?.webui ? String(root.confluenceBaseUrl || '').replace(/\/$/, '') + confluencePage._links.webui : null,
  previousEpics,
  previousStories,
  previousCoverageLedger: coverageRows,
  previousCoverageSummary: {
    coverageLedgerCount: coverageRows.length,
    coveredCount: coverageRows.filter(row => /cover/i.test(row.coverageStatus)).length,
    partialCount: coverageRows.filter(row => /partial|review/i.test(row.coverageStatus)).length,
    missingCount: coverageRows.filter(row => /missing|gap|unknown/i.test(row.coverageStatus)).length
  },
  liveSnapshot: {
    jiraIssueCount: issues.length,
    epicCount: previousEpics.length,
    storyCount: previousStories.length,
    confluencePageFound: Boolean(confluencePage?.id),
    confluenceCoverageRows: coverageRows.length
  }
} : originalUpdateContext;

return [{
  json: {
    ...root,
    updateContext: liveUpdateContext,
    liveUpdateSnapshot: liveUpdateContext.liveSnapshot || null
  }
}];
`;

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_live_update_hydration_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const connections = row.connections ? parseAny(row.connections) : {};
    const jiraSearch = requireNode(nodes, 'Search Existing Epic in Jira');
    const confluenceSearch = requireNode(nodes, 'Search Existing Confluence Page');

    if (!findNode(nodes, 'Build Live Update Snapshot Request')) {
      nodes.push(codeNode('Build Live Update Snapshot Request', buildRequestCode, [192, 112]));
    } else {
      findNode(nodes, 'Build Live Update Snapshot Request').parameters.jsCode = buildRequestCode;
    }

    const liveJiraParams = JSON.parse(JSON.stringify(jiraSearch.parameters));
    liveJiraParams.queryParameters.parameters = [
      { name: 'jql', value: '={{ $json.liveJiraBacklogJql }}' },
      { name: 'maxResults', value: '100' },
      { name: 'fields', value: 'key,summary,status,labels,parent,issuetype,description,updated' },
    ];
    if (!findNode(nodes, 'Search Live Jira Backlog')) {
      nodes.push(cloneHttpNode(jiraSearch, 'Search Live Jira Backlog', liveJiraParams, [400, 112]));
    } else {
      findNode(nodes, 'Search Live Jira Backlog').parameters = liveJiraParams;
    }

    const liveConfluenceParams = JSON.parse(JSON.stringify(confluenceSearch.parameters));
    liveConfluenceParams.queryParameters.parameters = [
      { name: 'spaceKey', value: '={{ $json.confluenceSpaceKey }}' },
      { name: 'title', value: '={{ $("Build Live Update Snapshot Request").first().json.liveConfluenceTitle }}' },
      { name: 'expand', value: 'body.storage,version' },
      { name: 'limit', value: '1' },
    ];
    if (!findNode(nodes, 'Search Live Confluence Backlog')) {
      nodes.push(cloneHttpNode(confluenceSearch, 'Search Live Confluence Backlog', liveConfluenceParams, [608, 112]));
    } else {
      findNode(nodes, 'Search Live Confluence Backlog').parameters = liveConfluenceParams;
    }

    if (!findNode(nodes, 'Build Live Update Context')) {
      nodes.push(codeNode('Build Live Update Context', buildContextCode, [816, 112]));
    } else {
      findNode(nodes, 'Build Live Update Context').parameters.jsCode = buildContextCode;
    }

    connections['Check Chroma Retrieval Quality'] = { main: [[{ node: 'Build Live Update Snapshot Request', type: 'main', index: 0 }]] };
    connections['Build Live Update Snapshot Request'] = { main: [[{ node: 'Search Live Jira Backlog', type: 'main', index: 0 }]] };
    connections['Search Live Jira Backlog'] = { main: [[{ node: 'Search Live Confluence Backlog', type: 'main', index: 0 }]] };
    connections['Search Live Confluence Backlog'] = { main: [[{ node: 'Build Live Update Context', type: 'main', index: 0 }]] };
    connections['Build Live Update Context'] = { main: [[{ node: 'Professional Prompt Library', type: 'main', index: 0 }]] };

    for (const nodeName of ['Build Live Update Snapshot Request', 'Build Live Update Context']) {
      new Function(requireNode(nodes, nodeName).parameters.jsCode);
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      changes: [
        'inserted live Jira backlog search before prompt',
        'inserted live Confluence page read before prompt',
        'Build Live Update Context now derives previousEpics/previousStories/coverage from Jira/Confluence runtime data'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
