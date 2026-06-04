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
  try {
    return JSON.parse(value);
  } catch {
    return require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted').parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function upsertNode(nodes, node) {
  const index = nodes.findIndex(item => item.name === node.name);
  if (index >= 0) nodes[index] = { ...nodes[index], ...node, id: nodes[index].id || node.id };
  else nodes.push(node);
}

function setConnection(connections, from, outputs) {
  connections[from] = { main: outputs };
}

function httpGetNode(id, name, url, position) {
  return {
    parameters: {
      url,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {}
    },
    id,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.4,
    position,
    alwaysOutputData: true,
    credentials: supabaseCredential
  };
}

function patchQueueWorkflow(nodes, connections) {
  requireNode(nodes, 'Combine Job And Runtime');
  requireNode(nodes, 'Persist Professional Job');
  requireNode(nodes, 'Respond Invalid Request');

  upsertNode(nodes, {
    parameters: {
      conditions: {
        combinator: 'and',
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 3
        },
        conditions: [
          {
            leftValue: '={{ $json.input?.documentType || $json.documentType }}',
            rightValue: 'traceability_matrix',
            operator: {
              type: 'string',
              operation: 'equals'
            }
          }
        ]
      },
      options: {}
    },
    id: 'rtm-two-layer-request-if',
    name: 'Traceability Matrix Request?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [2016, 96]
  });

  upsertNode(nodes, httpGetNode(
    'rtm-fetch-prereq-jobs',
    'Fetch RTM Prerequisite Jobs',
    `=${supabaseUrl}/rest/v1/qa_jobs?project_id=eq.{{ encodeURIComponent($('Combine Job And Runtime').item.json.projectId || '') }}&status=eq.completed&order=created_at.desc&limit=50&select=job_id,status,input,output,created_at,updated_at,project_id,requested_by`,
    [2240, 0]
  ));

  upsertNode(nodes, httpGetNode(
    'rtm-fetch-story-testcase-links',
    'Fetch RTM Story Testcase Links',
    `=${supabaseUrl}/rest/v1/qa_story_testcase_links?project_id=eq.{{ encodeURIComponent($('Combine Job And Runtime').item.json.projectId || '') }}&order=created_at.desc&limit=1000&select=job_id,source_user_story_job_id,story_jira_key,story_jira_id,story_correlation_id,story_summary,testcase_jira_key,testcase_jira_id,testcase_summary,stable_label,link_type,status,metadata,created_at,updated_at,project_id,project_name`,
    [2464, 0]
  ));

  upsertNode(nodes, {
    parameters: {
      jsCode: `const job = $('Combine Job And Runtime').item.json;

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

function hasStories(row) {
  const output = asObject(row.output);
  return Array.isArray(output.jira?.stories) || Array.isArray(output.stories);
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
const storyKeys = new Set(stories.map(story => story.storyKey).filter(Boolean));
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
      rtmMissingPrerequisites: missing
    }
  }];
}

return [{
  json: {
    ...job,
    rtmPrerequisitesOk: true,
    input: {
      ...job.input,
      traceabilityMode: 'two_layer_rtm',
      traceabilityContext
    }
  }
}];`
    },
    id: 'rtm-build-traceability-context',
    name: 'Build RTM Traceability Context',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2688, 0]
  });

  upsertNode(nodes, {
    parameters: {
      conditions: {
        combinator: 'and',
        options: {
          caseSensitive: true,
          leftValue: '',
          typeValidation: 'strict',
          version: 3
        },
        conditions: [
          {
            leftValue: '={{ $json.rtmPrerequisitesOk }}',
            rightValue: true,
            operator: {
              type: 'boolean',
              operation: 'true',
              singleValue: true
            }
          }
        ]
      },
      options: {}
    },
    id: 'rtm-prerequisites-ready-if',
    name: 'RTM Prerequisites Ready?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.3,
    position: [2912, 0]
  });

  requireNode(nodes, 'Persist Professional Job').position = [3136, 96];
  requireNode(nodes, 'Professional Job Persisted?').position = [3360, 96];
  requireNode(nodes, 'LOG: Professional Job Queued').position = [3584, 0];
  requireNode(nodes, 'Respond Queued').position = [3808, 0];
  requireNode(nodes, 'Respond Professional Retry Unavailable').position = [3584, 192];

  setConnection(connections, 'Combine Job And Runtime', [[{ node: 'Traceability Matrix Request?', type: 'main', index: 0 }]]);
  setConnection(connections, 'Traceability Matrix Request?', [
    [{ node: 'Fetch RTM Prerequisite Jobs', type: 'main', index: 0 }],
    [{ node: 'Persist Professional Job', type: 'main', index: 0 }]
  ]);
  setConnection(connections, 'Fetch RTM Prerequisite Jobs', [[{ node: 'Fetch RTM Story Testcase Links', type: 'main', index: 0 }]]);
  setConnection(connections, 'Fetch RTM Story Testcase Links', [[{ node: 'Build RTM Traceability Context', type: 'main', index: 0 }]]);
  setConnection(connections, 'Build RTM Traceability Context', [[{ node: 'RTM Prerequisites Ready?', type: 'main', index: 0 }]]);
  setConnection(connections, 'RTM Prerequisites Ready?', [
    [{ node: 'Persist Professional Job', type: 'main', index: 0 }],
    [{ node: 'Respond Invalid Request', type: 'main', index: 0 }]
  ]);
}

function addSetAssignment(node, assignment) {
  const assignments = node.parameters?.assignments?.assignments;
  if (!Array.isArray(assignments)) throw new Error(`Set node assignments not found: ${node.name}`);
  const existing = assignments.find(item => item.name === assignment.name);
  if (existing) {
    existing.value = assignment.value;
    existing.type = assignment.type;
  } else {
    assignments.push(assignment);
  }
}

function patchRetrievalWorkflow(nodes) {
  const restore = requireNode(nodes, 'Restore Job Context');
  addSetAssignment(restore, {
    id: 'rtm-traceability-context-assignment',
    name: 'traceabilityContext',
    value: "={{ $('When Executed by Another Workflow').item.json.traceabilityContext || $('When Executed by Another Workflow').item.json.input?.traceabilityContext || {} }}",
    type: 'object'
  });
  addSetAssignment(restore, {
    id: 'rtm-traceability-mode-assignment',
    name: 'traceabilityMode',
    value: "={{ $('When Executed by Another Workflow').item.json.traceabilityMode || $('When Executed by Another Workflow').item.json.input?.traceabilityMode || '' }}",
    type: 'string'
  });

  const prompt = requireNode(nodes, 'Prompt Library');
  let code = prompt.parameters.jsCode;

  if (!code.includes('function buildTwoLayerRtmInstructions')) {
    code = code.replace(
      "const retryContext = $json.retryContext || {};\nconst retryInstruction = String($json.retryInstruction || retryContext.retryInstruction || '').trim();",
      `const retryContext = $json.retryContext || {};
const retryInstruction = String($json.retryInstruction || retryContext.retryInstruction || '').trim();
const traceabilityContext = $json.traceabilityContext || {};

function buildTwoLayerRtmInstructions(type, context) {
  if (type !== 'traceability_matrix' || !context || context.version !== 'two_layer_rtm_v1') return '';
  const compact = {
    version: context.version,
    projectId: context.projectId,
    projectName: context.projectName,
    backlogJobId: context.backlogJobId,
    storyTestCaseJobId: context.storyTestCaseJobId,
    counts: context.counts,
    epics: context.epics || [],
    stories: context.stories || [],
    storyTestCaseLinks: context.storyTestCaseLinks || [],
    storiesWithoutTestCases: context.storiesWithoutTestCases || []
  };
  return [
    '==============================',
    'TWO-LAYER REQUIREMENT TRACEABILITY INPUT',
    '==============================',
    '',
    'Generate a true Requirement Traceability Matrix with exactly two traceability layers.',
    '',
    'Layer 1 must trace discovered source requirements to the generated Jira Epics and User Stories listed below.',
    'Layer 2 must trace generated User Stories to the generated Jira Test Cases listed below.',
    '',
    'Use only actual Jira epic keys, story keys, and test case keys supplied in this context. Do not invent Risk IDs, Test Case IDs, Epic IDs, Story IDs, automation statuses, or Jira links.',
    'If a requirement has no matching generated story, mark it Missing Backlog Coverage.',
    'If a story has no generated test case, mark it Missing Test Coverage.',
    'If coverage is inferred but incomplete, mark it Partial and explain why.',
    '',
    'Required RTM sections:',
    '1. Executive Coverage Summary',
    '2. Layer 1 - Requirements to Epics/User Stories',
    '3. Layer 1 Gaps - Requirements Without Backlog Coverage',
    '4. Layer 2 - User Stories to Generated Test Cases',
    '5. Layer 2 Gaps - Stories Without Test Case Coverage',
    '6. Coverage by Test Category',
    '7. Coverage Ledger',
    '',
    'Two-layer traceability context JSON:',
    JSON.stringify(compact)
  ].join('\\n');
}`
    );
  }

  if (!code.includes('const twoLayerRtmInstructions = buildTwoLayerRtmInstructions')) {
    code = code.replace(
      'const coverageLedgerInstructions = buildCoverageLedgerInstructions(type, retrievalProfile);',
      `const coverageLedgerInstructions = buildCoverageLedgerInstructions(type, retrievalProfile);
const twoLayerRtmInstructions = buildTwoLayerRtmInstructions(type, traceabilityContext);`
    );
  }

  code = code.replace(
    `const enhancedSystem = [
  selectedPrompt.system,
  retrievalProfileInstructions,
  coverageLedgerInstructions
].filter(Boolean).join('\\n\\n');`,
    `const enhancedSystem = [
  selectedPrompt.system,
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  twoLayerRtmInstructions
].filter(Boolean).join('\\n\\n');`
  );

  code = code.replace(
    `const enhancedUser = [
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  selectedPrompt.user,`,
    `const enhancedUser = [
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  twoLayerRtmInstructions,
  selectedPrompt.user,`
  );

  if (!code.includes('traceabilityContext: traceabilityContext || {},')) {
    code = code.replace(
      `coverageLedgerRequirement: {
      enabled: true,
      version: 'coverage-ledger-v1',
      mode: type === 'traceability_matrix' ? 'enforced' : 'dry_run',
      requiredFor: type === 'traceability_matrix',
      statuses: ['covered', 'partial', 'missing', 'excluded']
    },`,
      `coverageLedgerRequirement: {
      enabled: true,
      version: 'coverage-ledger-v1',
      mode: type === 'traceability_matrix' ? 'enforced' : 'dry_run',
      requiredFor: type === 'traceability_matrix',
      statuses: ['covered', 'partial', 'missing', 'excluded']
    },
    traceabilityMode: $json.traceabilityMode || '',
    traceabilityContext: traceabilityContext || {},`
    );
  }

  prompt.parameters.jsCode = code;
}

async function patchWorkflow(db, workflowId, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `workflow_${workflowId}_before_two_layer_rtm_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  patcher(nodes, connections);

  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
    JSON.stringify(nodes),
    JSON.stringify(connections),
    new Date().toISOString(),
    workflowId
  ]);

  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      new Date().toISOString(),
      workflowId,
      row.activeVersionId
    ]);
  }

  return { workflowId, workflowName: row.name, activeVersionId: row.activeVersionId, backupPath };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const queue = await patchWorkflow(db, queueWorkflowId, patchQueueWorkflow);
    const retrieval = await patchWorkflow(db, retrievalWorkflowId, (nodes) => patchRetrievalWorkflow(nodes));
    console.log(JSON.stringify({
      patched: [queue, retrieval],
      queueNodes: [
        'Traceability Matrix Request?',
        'Fetch RTM Prerequisite Jobs',
        'Fetch RTM Story Testcase Links',
        'Build RTM Traceability Context',
        'RTM Prerequisites Ready?'
      ],
      retrievalNodes: ['Restore Job Context', 'Prompt Library']
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
