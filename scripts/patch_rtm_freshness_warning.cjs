const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const queueWorkflowId = 'yPgr7mtUnL3E8QQP';
const retrievalWorkflowId = 'fullRetrievalD01';
const supabaseUrl = 'https://ifnznfspkjayhnooncrv.supabase.co';
const supabaseCredential = {
  httpCustomAuth: {
    id: 'DpZbhUxkEbKeXIiJ',
    name: 'supabase-service-role-key'
  }
};

function parseAny(value) {
  try { return JSON.parse(value); }
  catch { return require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted').parse(value); }
}
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function(err) { err ? reject(err) : resolve(this); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))); }
function requireNode(nodes, name) { const node = nodes.find(item => item.name === name); if (!node) throw new Error(`Node not found: ${name}`); return node; }
function upsertNode(nodes, node) { const index = nodes.findIndex(item => item.name === node.name); if (index >= 0) nodes[index] = { ...nodes[index], ...node, id: nodes[index].id || node.id }; else nodes.push(node); }
function setConnection(connections, from, outputs) { connections[from] = { main: outputs }; }
function httpGetNode(id, name, url, position) {
  return {
    parameters: { url, authentication: 'genericCredentialType', genericAuthType: 'httpCustomAuth', sendHeaders: true, specifyHeaders: 'json', jsonHeaders: '{ "Content-Type": "application/json" }', options: {} },
    id, name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position, alwaysOutputData: true, credentials: supabaseCredential
  };
}
function addSetAssignment(node, assignment) {
  const assignments = node.parameters?.assignments?.assignments;
  if (!Array.isArray(assignments)) throw new Error(`Set node assignments not found: ${node.name}`);
  const existing = assignments.find(item => item.name === assignment.name);
  if (existing) { existing.value = assignment.value; existing.type = assignment.type; }
  else assignments.push(assignment);
}

const buildContextCode = `const job = $('Combine Job And Runtime').item.json;

function collect(name) {
  return $items(name)
    .map(item => item.json)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter(Boolean);
}

function asObject(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}

function documentTypeOf(row) {
  const input = asObject(row.input);
  const output = asObject(row.output);
  return String(
    input.documentType ||
    output.documentType ||
    output.body?.documentType ||
    output.input?.documentType ||
    ''
  ).trim().toLowerCase();
}

function hasBacklogShape(row) {
  const output = asObject(row.output);
  return Array.isArray(output.jira?.epics) ||
    Array.isArray(output.epics) ||
    Array.isArray(output.jira?.stories);
}

function hasMappings(row) {
  const output = asObject(row.output);
  return Array.isArray(output.mappings) || Array.isArray(output.stories);
}

function firstArray(...values) {
  return values.find(value => Array.isArray(value)) || [];
}

function normalizeCategories(metadata) {
  const value = asObject(metadata);
  const raw = value.categories || value.testCategories || value.testTypes || value.type || value.category || [];
  const list = Array.isArray(raw) ? raw : String(raw || '').split(',');
  return [...new Set(list.map(item => String(item || '').trim()).filter(Boolean))];
}

function parseTime(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isoTime(value) {
  const timestamp = parseTime(value);
  return timestamp ? new Date(timestamp).toISOString() : null;
}

function eventTime(row) {
  return parseTime(row?.created_at) || parseTime(row?.updated_at) || null;
}

function compactJob(row) {
  if (!row) return null;
  return {
    jobId: row.job_id || null,
    createdAt: isoTime(row.created_at),
    updatedAt: isoTime(row.updated_at),
    status: row.status || null
  };
}

function buildFreshness(latestIngestion, backlogJob, testCaseJob) {
  const latestIngestionAt = eventTime(latestIngestion);
  const backlogAt = eventTime(backlogJob);
  const testCaseAt = eventTime(testCaseJob);
  const warnings = [];

  if (!backlogJob || !testCaseJob) {
    return {
      status: 'blocked',
      checkedAt: new Date().toISOString(),
      latestCompletedIngestion: compactJob(latestIngestion),
      backlogJob: compactJob(backlogJob),
      storyTestCaseJob: compactJob(testCaseJob),
      warnings: [{
        code: 'RTM_PREREQUISITES_MISSING',
        message: 'RTM freshness could not be fully evaluated because required upstream artifacts are missing.',
        recommendedAction: 'Generate Epics & User Stories and Story Test Cases before generating RTM.'
      }]
    };
  }

  if (latestIngestionAt && backlogAt && latestIngestionAt > backlogAt) {
    warnings.push({
      code: 'SOURCE_NEWER_THAN_BACKLOG',
      message: 'Completed source ingestion is newer than the Epics & User Stories job used for this RTM.',
      recommendedAction: 'Regenerate Epics & User Stories, then regenerate Story Test Cases and RTM for fully fresh traceability.'
    });
  }
  if (latestIngestionAt && testCaseAt && latestIngestionAt > testCaseAt) {
    warnings.push({
      code: 'SOURCE_NEWER_THAN_TEST_CASES',
      message: 'Completed source ingestion is newer than the Story Test Cases job used for this RTM.',
      recommendedAction: 'Regenerate Story Test Cases after refreshing backlog coverage.'
    });
  }
  if (backlogAt && testCaseAt && backlogAt > testCaseAt) {
    warnings.push({
      code: 'BACKLOG_NEWER_THAN_TEST_CASES',
      message: 'Epics & User Stories are newer than the Story Test Cases job used for this RTM.',
      recommendedAction: 'Regenerate Story Test Cases so test coverage reflects the latest stories.'
    });
  }

  return {
    status: warnings.length ? 'warning' : 'ready',
    checkedAt: new Date().toISOString(),
    latestCompletedIngestion: compactJob(latestIngestion),
    backlogJob: compactJob(backlogJob),
    storyTestCaseJob: compactJob(testCaseJob),
    warnings
  };
}

function compactEpic(epic) {
  return {
    epicKey: epic.jiraEpicKey || epic.epicKey || epic.key || null,
    epicId: epic.jiraEpicId || epic.epicId || epic.id || null,
    epicName: epic.epicName || epic.name || epic.summary || null,
    epicCorrelationId: epic.epicCorrelationId || epic.correlationId || null
  };
}

function compactStory(story) {
  return {
    storyKey: story.storyKey || story.jiraStoryKey || story.key || null,
    storyId: story.storyId || story.jiraStoryId || story.id || null,
    storySummary: story.summary || story.storySummary || story.name || null,
    parentEpicKey: story.parentEpicKey || story.epicKey || story.parent?.key || null,
    storyCorrelationId: story.storyCorrelationId || story.correlationId || null,
    storyUrl: story.storySelf || story.link || story.url || null
  };
}

const projectId = job.projectId || job.input?.projectId || null;
const projectName = job.projectName || job.input?.projectName || null;
const prerequisiteJobs = collect('Fetch RTM Prerequisite Jobs');
const completedIngestions = collect('Fetch RTM Completed Ingestion Jobs');
const allLinks = collect('Fetch RTM Story Testcase Links');

const backlogJobs = prerequisiteJobs.filter(row => {
  const docType = documentTypeOf(row);
  return docType === 'user_stories' || (!docType && hasBacklogShape(row));
});

const testCaseJobs = prerequisiteJobs.filter(row => {
  const docType = documentTypeOf(row);
  return docType === 'story_test_cases' || docType === 'test_cases' || hasMappings(row);
});

const backlogJob = backlogJobs[0] || null;
const testCaseJob = testCaseJobs[0] || null;
const latestCompletedIngestion = completedIngestions[0] || null;
const freshness = buildFreshness(latestCompletedIngestion, backlogJob, testCaseJob);
const backlogOutput = asObject(backlogJob?.output);
const epics = firstArray(backlogOutput.jira?.epics, backlogOutput.epics).map(compactEpic).filter(epic => epic.epicKey || epic.epicName);
const stories = firstArray(backlogOutput.jira?.stories, backlogOutput.stories).map(compactStory).filter(story => story.storyKey || story.storySummary);

const eligibleLinks = allLinks.filter(link => {
  if (!link.story_jira_key || !link.testcase_jira_key) return false;
  const status = String(link.status || '').toLowerCase();
  return !['failed', 'deleted', 'superseded'].includes(status);
});

let activeLinks = eligibleLinks.filter(link =>
  (testCaseJob?.job_id && link.job_id === testCaseJob.job_id) ||
  (backlogJob?.job_id && link.source_user_story_job_id === backlogJob.job_id)
);
if (!activeLinks.length) activeLinks = eligibleLinks;

const compactLinks = activeLinks.map(link => ({
  sourceTestCaseJobId: link.job_id || null,
  sourceUserStoryJobId: link.source_user_story_job_id || null,
  storyKey: link.story_jira_key || null,
  storyId: link.story_jira_id || null,
  storyCorrelationId: link.story_correlation_id || null,
  storySummary: link.story_summary || null,
  testcaseKey: link.testcase_jira_key || null,
  testcaseId: link.testcase_jira_id || null,
  testcaseSummary: link.testcase_summary || null,
  stableLabel: link.stable_label || null,
  linkType: link.link_type || null,
  status: link.status || null,
  categories: normalizeCategories(link.metadata)
}));

const dedupedLinks = [];
const seenLinks = new Set();
for (const link of compactLinks) {
  const key = [
    link.sourceTestCaseJobId || '',
    link.sourceUserStoryJobId || '',
    link.storyKey || '',
    link.testcaseKey || '',
    link.stableLabel || ''
  ].join('|');
  if (seenLinks.has(key)) continue;
  seenLinks.add(key);
  dedupedLinks.push(link);
}

const linkedStoryKeys = new Set(dedupedLinks.map(link => link.storyKey).filter(Boolean));
const storiesWithoutTestCases = stories.filter(story => story.storyKey && !linkedStoryKeys.has(story.storyKey));

const missing = [];
if (!projectId) missing.push('project_id');
if (!backlogJob) missing.push('completed Epics & User Stories job');
if (!stories.length) missing.push('generated user stories');
if (!testCaseJob) missing.push('completed Story Test Cases job');
if (!dedupedLinks.length) missing.push('story-to-test-case mappings in qa_story_testcase_links');

const ok = missing.length === 0;
const traceabilityContext = {
  version: 'two_layer_rtm_v1',
  projectId,
  projectName,
  backlogJobId: backlogJob?.job_id || null,
  storyTestCaseJobId: testCaseJob?.job_id || null,
  generatedAt: new Date().toISOString(),
  freshness,
  counts: {
    epics: epics.length,
    stories: stories.length,
    storyTestCaseLinks: dedupedLinks.length,
    linkedStories: linkedStoryKeys.size,
    storiesWithoutTestCases: storiesWithoutTestCases.length
  },
  epics,
  stories,
  storyTestCaseLinks: dedupedLinks,
  storiesWithoutTestCases
};

if (!ok) {
  return [{
    json: {
      ...job,
      ok: false,
      statusCode: 409,
      errorCode: 'RTM_PREREQUISITES_MISSING',
      message: 'Requirement Traceability Matrix needs completed Epics & User Stories and Story Test Cases for this project before it can be generated. Missing: ' + missing.join(', '),
      rtmPrerequisitesOk: false,
      rtmMissingPrerequisites: missing,
      rtmFreshness: freshness
    }
  }];
}

return [{
  json: {
    ...job,
    rtmPrerequisitesOk: true,
    rtmFreshness: freshness,
    input: {
      ...job.input,
      traceabilityMode: 'two_layer_rtm',
      traceabilityContext
    }
  }
}];`;

function patchQueueWorkflow(nodes, connections) {
  upsertNode(nodes, httpGetNode(
    'rtm-fetch-completed-ingestion-jobs',
    'Fetch RTM Completed Ingestion Jobs',
    `=${supabaseUrl}/rest/v1/doc_ingestion_jobs?project_id=eq.{{ encodeURIComponent($('Combine Job And Runtime').item.json.projectId || '') }}&status=eq.completed&order=created_at.desc&limit=25&select=job_id,status,created_at,updated_at,project_id,input,output`,
    [2464, -192]
  ));
  const build = requireNode(nodes, 'Build RTM Traceability Context');
  build.parameters.jsCode = buildContextCode;
  build.position = [2912, 0];
  requireNode(nodes, 'Fetch RTM Story Testcase Links').position = [2688, 0];
  requireNode(nodes, 'RTM Prerequisites Ready?').position = [3136, 0];
  requireNode(nodes, 'Persist Professional Job').position = [3360, 96];
  requireNode(nodes, 'Professional Job Persisted?').position = [3584, 96];
  requireNode(nodes, 'LOG: Professional Job Queued').position = [3808, 0];
  requireNode(nodes, 'Respond Queued').position = [4032, 0];
  requireNode(nodes, 'Respond Professional Retry Unavailable').position = [3808, 192];

  setConnection(connections, 'Fetch RTM Prerequisite Jobs', [[{ node: 'Fetch RTM Completed Ingestion Jobs', type: 'main', index: 0 }]]);
  setConnection(connections, 'Fetch RTM Completed Ingestion Jobs', [[{ node: 'Fetch RTM Story Testcase Links', type: 'main', index: 0 }]]);
  setConnection(connections, 'Fetch RTM Story Testcase Links', [[{ node: 'Build RTM Traceability Context', type: 'main', index: 0 }]]);
  setConnection(connections, 'Build RTM Traceability Context', [[{ node: 'RTM Prerequisites Ready?', type: 'main', index: 0 }]]);
  setConnection(connections, 'RTM Prerequisites Ready?', [
    [{ node: 'Persist Professional Job', type: 'main', index: 0 }],
    [{ node: 'Respond Invalid Request', type: 'main', index: 0 }]
  ]);
}

function patchRetrievalWorkflow(nodes) {
  const restore = requireNode(nodes, 'Restore Job Context');
  addSetAssignment(restore, {
    id: 'rtm-freshness-assignment',
    name: 'rtmFreshness',
    value: "={{ $('When Executed by Another Workflow').item.json.rtmFreshness || $('When Executed by Another Workflow').item.json.input?.traceabilityContext?.freshness || {} }}",
    type: 'object'
  });

  const prompt = requireNode(nodes, 'Prompt Library');
  let promptCode = prompt.parameters.jsCode;
  if (!promptCode.includes('freshness: context.freshness || {}')) {
    promptCode = promptCode.replace(
      'storiesWithoutTestCases: context.storiesWithoutTestCases || []',
      'storiesWithoutTestCases: context.storiesWithoutTestCases || [],\n    freshness: context.freshness || {}'
    );
  }
  if (!promptCode.includes('RTM freshness status:')) {
    promptCode = promptCode.replace(
      "'Two-layer traceability context JSON:',\n    JSON.stringify(compact)",
      "'RTM freshness status: ' + (context.freshness?.status || 'unknown') + '. If status is warning, mention that the RTM is generated with freshness warnings and do not imply upstream artifacts are fully current.',\n    'Two-layer traceability context JSON:',\n    JSON.stringify(compact)"
    );
  }
  prompt.parameters.jsCode = promptCode;

  const quality = requireNode(nodes, 'Quality Gate');
  let qualityCode = quality.parameters.jsCode;
  if (!qualityCode.includes('function buildRtmFreshnessNotice')) {
    const freshnessCode = String.raw`
function buildRtmFreshnessNotice() {
  if (documentType !== 'traceability_matrix') return '';
  const context = $('Prompt Library').item.json.traceabilityContext || {};
  const freshness = context.freshness || $('Prompt Library').item.json.rtmFreshness || {};
  const status = String(freshness.status || '').toLowerCase();
  if (!status || status === 'ready') return '';
  const warnings = Array.isArray(freshness.warnings) ? freshness.warnings : [];
  const lines = [
    '### RTM Freshness Notice',
    '',
    status === 'blocked'
      ? 'Freshness Status: Blocked - required upstream artifacts were missing when this RTM context was evaluated.'
      : 'Freshness Status: Warning - this RTM was generated, but one or more upstream artifacts may be stale.',
    '',
    '| Signal | Detail | Recommended Action |',
    '| --- | --- | --- |'
  ];
  if (warnings.length) {
    for (const warning of warnings) {
      lines.push('| ' + rtmTableCell(warning.code || 'FRESHNESS_WARNING') + ' | ' + rtmTableCell(warning.message || 'Freshness warning detected.') + ' | ' + rtmTableCell(warning.recommendedAction || 'Review upstream artifacts before audit use.') + ' |');
    }
  } else {
    lines.push('| FRESHNESS_WARNING | Freshness warning detected. | Review upstream artifacts before audit use. |');
  }
  lines.push('', 'Freshness checked at: ' + rtmTableCell(freshness.checkedAt || 'Not available'));
  return lines.join('\n');
}

function injectRtmFreshnessNotice(text) {
  if (documentType !== 'traceability_matrix') return text;
  const notice = buildRtmFreshnessNotice();
  if (!notice || /RTM Freshness Notice/i.test(text)) return text;
  const pattern = /(^\s*#*\s*(?:8\.\s*)?Governance & Audit Readiness Commentary\s*$)/mi;
  if (pattern.test(text)) {
    return String(text).replace(pattern, '$1\n\n' + notice + '\n');
  }
  return String(text || '') + '\n\n' + notice;
}
`;
    qualityCode = qualityCode.replace(
      'rawMarkdown = normalizeRtmGeneratedText(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);',
      freshnessCode + '\nrawMarkdown = normalizeRtmGeneratedText(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);\nrawMarkdown = injectRtmFreshnessNotice(rawMarkdown);'
    );
  } else if (!qualityCode.includes('rawMarkdown = injectRtmFreshnessNotice(rawMarkdown);')) {
    qualityCode = qualityCode.replace(
      'rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);',
      'rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);\nrawMarkdown = injectRtmFreshnessNotice(rawMarkdown);'
    );
  }
  quality.parameters.jsCode = qualityCode;
}

async function patchWorkflow(db, workflowId, patcher, suffix) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${suffix}_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));
  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  patcher(nodes, connections);
  for (const node of nodes) {
    const code = node.parameters?.jsCode;
    if (!code) continue;
    try {
      new Function(code);
    } catch (error) {
      fs.writeFileSync(path.join(process.cwd(), `tmp_rtm_freshness_${workflowId}_${node.name.replace(/[^A-Za-z0-9_-]+/g, '_')}.js`), code);
      throw new Error(`Code validation failed for ${workflowId} / ${node.name}: ${error.message}`);
    }
  }
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), new Date().toISOString(), workflowId]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), new Date().toISOString(), workflowId, row.activeVersionId]);
  }
  return { workflowId, workflowName: row.name, activeVersionId: row.activeVersionId, backupPath };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const queue = await patchWorkflow(db, queueWorkflowId, patchQueueWorkflow, 'rtm_freshness_warning');
    const retrieval = await patchWorkflow(db, retrievalWorkflowId, (nodes) => patchRetrievalWorkflow(nodes), 'rtm_freshness_warning');
    console.log(JSON.stringify({ patched: [queue, retrieval], added: ['Fetch RTM Completed Ingestion Jobs', 'traceabilityContext.freshness', 'RTM Freshness Notice'] }, null, 2));
  } finally { db.close(); }
}
main().catch(error => { console.error(error); process.exit(1); });
