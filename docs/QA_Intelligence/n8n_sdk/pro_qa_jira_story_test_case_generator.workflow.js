import { workflow, node, trigger, newCredential, ifElse } from '@n8n/workflow-sdk';

const start = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.1,
  config: {
    name: 'When Executed by Another Workflow',
    parameters: {
      inputSource: 'passthrough',
    },
    position: [0, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectId: 'project-id', projectName: 'ShopSmart', requestedBy: 'qops-user-id', settingsVersion: 1, configSnapshot: { jira: { projectKey: 'KAN', baseUrl: 'https://anujalhans1.atlassian.net', testCaseIssueTypeName: 'Test Case' }, models: { generationModel: 'gpt-4.1-mini', maxTokens: 12000 } } }],
});

const normalizeRequest = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize Story Test Case Request',
    parameters: {
      jsCode: `const input = $json || {};
const config = input.configSnapshot || input.config_snapshot || {};
const jira = config.jira || {};
const models = config.models || {};
const cleanBase = (value, fallback) => {
  const s = String(value || fallback || '');
  return s.endsWith('/') ? s.slice(0, -1) : s;
};
return [{
  json: {
    jobId: input.jobId || input.job_id || ('STC-' + Date.now()),
    projectId: input.projectId || input.project_id || null,
    projectName: input.projectName || input.project_name || 'Unknown Project',
    requestedBy: input.requestedBy || input.requested_by || null,
    settingsVersion: input.settingsVersion || input.settings_version || null,
    startedAt: input.startedAt || input.createdAt || new Date().toISOString(),
    jiraBaseUrl: cleanBase(input.jiraBaseUrl || jira.baseUrl, 'https://anujalhans1.atlassian.net'),
    jiraProjectKey: input.jiraProjectKey || jira.projectKey || 'KAN',
    testCaseIssueTypeName: input.testCaseIssueTypeName || jira.testCaseIssueTypeName || jira.testCaseIssueType || 'Test Case',
    generationModel: input.generationModel || models.generationModel || 'gpt-4.1-mini',
    maxTokens: Math.max(6000, Number(input.maxTokens || models.maxTokens || 12000) || 12000),
    idempotencyLabelPrefix: input.idempotencyLabelPrefix || jira.idempotencyLabelPrefix || 'qops',
    productOwner: input.productOwner || input.product_owner || 'Product Owner',
    configSnapshot: config
  }
}];`,
    },
    position: [224, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectId: 'project-id', projectName: 'ShopSmart', requestedBy: 'qops-user-id', jiraBaseUrl: 'https://anujalhans1.atlassian.net', jiraProjectKey: 'KAN', testCaseIssueTypeName: 'Test Case', generationModel: 'gpt-4.1-mini', maxTokens: 12000, idempotencyLabelPrefix: 'qops', productOwner: 'PO' }],
});

const fetchCompletedStoryJobs = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Completed User Story Jobs',
    parameters: {
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: 'status', value: 'eq.completed' },
          { name: 'input->>documentType', value: 'eq.user_stories' },
          { name: 'order', value: 'created_at.desc' },
          { name: 'limit', value: '25' },
          { name: 'select', value: 'job_id,project_id,requested_by,created_at,input,output' },
        ],
      },
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json" }',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [448, 0],
    alwaysOutputData: true,
  },
  output: [{ job_id: 'PRO-260512-RDR2ZR', project_id: 'project-id', requested_by: 'qops-user-id', created_at: '2026-05-12T07:13:13.767Z', input: { projectName: 'ShopSmart', documentType: 'user_stories' }, output: { jira: { stories: [{ storyKey: 'KAN-428', storyId: '10577', summary: 'User Registration and Profile Management UI', stableLabel: 'qops-kan-story-kan-us-001', storyCorrelationId: 'KAN-US-001' }] } } }],
});

const buildStorySourceItems = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Story Source Items',
    parameters: {
      jsCode: `const request = $('Normalize Story Test Case Request').first().json;
const rows = $input.all().map(item => item.json || {});
const normalizedProjectName = String(request.projectName || '').trim().toLowerCase();
const matchingJob = rows.find((row) => {
  const rowProjectId = String(row.project_id || '').trim();
  const rowProjectName = String(row.input?.projectName || row.input?.project_name || '').trim().toLowerCase();
  if (request.projectId && rowProjectId) return rowProjectId === String(request.projectId);
  return rowProjectName === normalizedProjectName;
});
if (!matchingJob) {
  throw new Error('No completed Epics & User Stories generation job was found for project=' + request.projectName + '. Generate Epics & User Stories first, then retry Story Test Cases.');
}
const storySourceJobId = matchingJob.job_id || null;
const stories = matchingJob.output?.jira?.stories || matchingJob.output?.stories || [];
if (!Array.isArray(stories) || !stories.length) {
  throw new Error('The latest Epics & User Stories job for project=' + request.projectName + ' does not contain Jira story references. Story Test Cases cannot be created until user stories exist in Jira.');
}
return stories.map((story, index) => ({
  json: {
    ...request,
    storySourceJobId,
    storyIndex: index + 1,
    totalStories: stories.length,
    storyKey: story.storyKey || story.key || '',
    storyId: story.storyId || story.id || '',
    storySummary: story.summary || '',
    storyCorrelationId: story.storyCorrelationId || story.userStoryId || '',
    storyStableLabel: story.stableLabel || '',
    storySelf: story.storySelf || story.self || '',
    storyLink: story.storyKey ? request.jiraBaseUrl + '/browse/' + story.storyKey : null
  }
}));
`,
    },
    position: [672, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectId: 'project-id', projectName: 'ShopSmart', storySourceJobId: 'PRO-260512-RDR2ZR', totalStories: 1, storyKey: 'KAN-428', storyId: '10577', storySummary: 'User Registration and Profile Management UI', storyCorrelationId: 'KAN-US-001', storyStableLabel: 'qops-kan-story-kan-us-001', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428', jiraBaseUrl: 'https://anujalhans1.atlassian.net', jiraProjectKey: 'KAN', testCaseIssueTypeName: 'Test Case', generationModel: 'gpt-4.1-mini', maxTokens: 12000, idempotencyLabelPrefix: 'qops' }],
});

const fetchJiraStoryIssue = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Fetch Jira Story Issue',
    parameters: {
      url: '={{ $json.jiraBaseUrl + "/rest/api/3/issue/" + encodeURIComponent($json.storyKey) + "?fields=summary,description,labels" }}',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'jiraSoftwareCloudApi',
      options: {},
    },
    credentials: {
      jiraSoftwareCloudApi: newCredential('Jira SW Cloud account'),
    },
    position: [896, 0],
  },
  output: [{ id: '10577', key: 'KAN-428', self: 'https://anujalhans1.atlassian.net/rest/api/3/issue/10577', fields: { summary: 'User Registration and Profile Management UI', labels: ['qops-kan-story-kan-us-001'], description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'As a user, I want to register with valid credentials so that I can access the platform.' }] }] } } }],
});

const preparePrompt = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Prepare Story Test Case Prompt',
    parameters: {
      jsCode: `const source = $('Build Story Source Items').item.json;
const issue = $json || {};
const NL = String.fromCharCode(10);

function flattenAdf(node) {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(flattenAdf).filter(Boolean).join(NL);
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  const content = Array.isArray(node.content) ? node.content.map(flattenAdf).filter(Boolean).join(node.type === 'paragraph' ? '' : NL) : '';
  if (node.type === 'paragraph') return content.trim();
  if (node.type === 'bulletList' || node.type === 'orderedList') return content.trim();
  if (node.type === 'listItem') return '- ' + content.trim();
  if (node.type === 'heading') return content.trim();
  return content.trim();
}

const descriptionText = flattenAdf(issue.fields?.description || '').replace(new RegExp(NL + '{3,}', 'g'), NL + NL).trim();
const storySummary = issue.fields?.summary || source.storySummary || source.storyKey;
const system = [
  'You are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready Jira Test Case issues from existing Jira user stories.',
  'You specialize in requirement decomposition, boundary and edge case design, negative testing, failure modeling, UI/API/integration validation, and automation feasibility optimization.',
  'Return one JSON object only. No markdown. No prose outside JSON.',
  'Avoid generic test cases. Every case must be specific to the story, realistic, execution-ready, and traceable to the available Jira story details.',
  'Use this exact schema:',
  '{',
  '  "storyKey": "KAN-123",',
  '  "storySummary": "Story title",',
  '  "testCases": [',
  '    {',
  '      "testCaseId": "TC-001",',
  '      "summary": "Short Jira-ready test case title",',
  '      "objective": "Why this test exists",',
  '      "requirementReference": "Story KAN-123 acceptance criterion or story detail covered",',
  '      "testLevel": "UI | API | SIT | FAT | Regression | Security | Performance | Network | Data | Accessibility",',
  '      "testCategory": "Positive | Negative | Boundary | Edge | Alternate | Exception | Integration | Validation | Resilience",',
  '      "preconditions": ["..."],',
  '      "testSteps": ["..."],',
  '      "testData": ["..."],',
  '      "expectedResult": "Observable outcome",',
  '      "priority": "High",',
  '      "riskLevel": "High",',
  '      "testType": "functional",',
  '      "automationFeasibility": "High",',
  '      "acceptanceCriteriaCovered": ["..."],',
  '      "notes": ["..."]',
  '    }',
  '  ]',
  '}',
  'Generate maximum useful coverage for this story. Do not cap output at 7 test cases.',
  'For simple or low-risk stories, generate at least 8 to 12 distinct test cases.',
  'For medium-complexity stories, generate at least 15 to 25 distinct test cases.',
  'For complex, integration-heavy, data-heavy, payment, authentication, authorization, or high-risk stories, generate 25 to 40 distinct test cases when the story details support it.',
  'Cover UI, FAT, SIT, regression, API/service, data validation, positive, negative, boundary, edge, alternate, exception, integration, security, performance, network/resilience, and accessibility scenarios wherever applicable.',
  'Do not invent unsupported systems or requirements. If a coverage type is not applicable, omit it rather than creating filler.',
  'Prioritize breadth first, then depth: cover distinct behaviors, validations, integrations, roles, permissions, data states, and failure modes before adding variants.',
  'Keep titles concise and professional for Jira.',
  'Every test case must have at least 3 clear steps, concrete test data where applicable, a concrete expected result, priority, risk level, and automation feasibility.',
  'Use stable, sequential testCaseId values from TC-001 onward.'
].join(NL);

const user = [
  'Project: ' + source.projectName,
  'Story Key: ' + source.storyKey,
  'Story Summary: ' + storySummary,
  'Story Correlation ID: ' + (source.storyCorrelationId || 'N/A'),
  '',
  'Story Description:',
  descriptionText || 'No Jira description was available. Use the story summary and source context only.',
  '',
  'Generate exhaustive, enterprise-grade, execution-ready Jira Test Case issues for this story.'
].join(NL);

return [{
  json: {
    ...source,
    storySummary,
    storyDescriptionText: descriptionText,
    system,
    user
  }
}];`,
    },
    position: [1120, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', storyDescriptionText: 'As a user, I want to register with valid credentials so that I can access the platform.', system: 'Return JSON only', user: 'Project: ShopSmart' }],
});

const openAiModel = node({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  version: 1.3,
  config: {
    name: 'OpenAI Chat Model',
    parameters: {
      model: {
        __rl: true,
        value: 'gpt-4.1-mini',
        mode: 'id',
        cachedResultName: 'gpt-4.1-mini',
      },
      builtInTools: {},
      options: {
        maxTokens: 12000,
      },
    },
    credentials: {
      openAiApi: newCredential('OpenAi Paid Account (Aonu)'),
    },
    position: [1280, 224],
  },
  output: [{ output: '{\"storyKey\":\"KAN-428\",\"storySummary\":\"User Registration and Profile Management UI\",\"testCases\":[{\"testCaseId\":\"TC-001\",\"summary\":\"Register with valid credentials\",\"objective\":\"Validate successful registration\",\"preconditions\":[\"User is on the registration screen\"],\"testSteps\":[\"Open registration screen\",\"Enter valid details\",\"Submit the form\"],\"expectedResult\":\"User account is created successfully\",\"priority\":\"High\",\"testType\":\"functional\",\"acceptanceCriteriaCovered\":[\"User can register a new account with valid credentials\"],\"notes\":[\"Happy path\"]}]}' }],
});

const testCaseAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Story Test Case Generator',
    parameters: {
      promptType: 'define',
      text: '={{ $json.user }}',
      options: {
        systemMessage: '={{ $json.system }}',
      },
    },
    subnodes: {
      model: openAiModel,
    },
    position: [1360, 0],
  },
  output: [{ output: '{"storyKey":"KAN-428","storySummary":"User Registration and Profile Management UI","testCases":[{"testCaseId":"TC-001","summary":"Register with valid credentials","objective":"Validate successful registration","preconditions":["User is on the registration screen"],"testSteps":["Open registration screen","Enter valid details","Submit the form"],"expectedResult":"User account is created successfully","priority":"High","testType":"functional","acceptanceCriteriaCovered":["User can register a new account with valid credentials"],"notes":["Happy path"]}]}' }],
});

const parseModelJson = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Robust Story Test Case Parser',
    parameters: {
      jsCode: `const source = $('Prepare Story Test Case Prompt').item.json;
const raw = $json.output ?? $json.text ?? $json.response ?? $json;
const NL = String.fromCharCode(10);
const BACKSLASH = String.fromCharCode(92);

const stringifyRaw = value => {
  if (value && typeof value === 'object') {
    if (typeof value.output === 'string') return value.output;
    if (typeof value.text === 'string') return value.text;
    if (typeof value.response === 'string') return value.response;
  }
  return String(value || '').trim();
};

const count = (text, pattern) => (text.match(pattern) || []).length;
const truncationMessage = text => {
  return 'Story Test Case parser detected incomplete or truncated model JSON for story ' + source.storyKey + '. Output chars=' + text.length + ', maxTokens=' + source.maxTokens + '. Please rerun or reduce prompt size.';
};

const extractBalancedJsonObject = text => {
  const firstBrace = text.indexOf('{');
  if (firstBrace < 0) throw new Error('Story Test Case parser received a response without a JSON object. Raw preview: ' + text.slice(0, 500));
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === BACKSLASH) escaped = true;
      else if (char === '\"') inString = false;
      continue;
    }
    if (char === '\"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(firstBrace, i + 1);
    }
  }
  throw new Error(truncationMessage(text) + ' JSON balance: {' + count(text, /{/g) + '/' + count(text, /}/g) + '}');
};

let text = stringifyRaw(raw);
if (!text) throw new Error('Story Test Case parser received an empty model response.');
const fence = String.fromCharCode(96, 96, 96);
const fenceStart = text.indexOf(fence);
const fenceEnd = text.lastIndexOf(fence);
if (fenceStart >= 0 && fenceEnd > fenceStart) {
  const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);
  if (firstLineEnd >= 0 && fenceEnd > firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();
}
const candidate = extractBalancedJsonObject(text);
let parsed;
try {
  parsed = JSON.parse(candidate);
} catch (error) {
  throw new Error('Story Test Case parser failed to parse model JSON: ' + error.message + '. Raw preview: ' + candidate.slice(0, 800));
}
if (!Array.isArray(parsed.testCases) || !parsed.testCases.length) {
  throw new Error('Story Test Case generator returned no testCases for story ' + source.storyKey + '.');
}
return [{
  json: {
    ...source,
    parsed,
    storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length),
    storyTokensInput: Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)),
    storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)),
    storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6))
  }
}];`,
    },
    position: [1600, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', storyKey: 'KAN-428', parsed: { storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', testCases: [{ testCaseId: 'TC-001', summary: 'Register with valid credentials', objective: 'Validate successful registration', preconditions: ['User is on the registration screen'], testSteps: ['Open registration screen', 'Enter valid details', 'Submit the form'], expectedResult: 'User account is created successfully', priority: 'High', testType: 'functional', acceptanceCriteriaCovered: ['User can register a new account with valid credentials'], notes: ['Happy path'] }] }, storyWordCount: 120, storyTokensInput: 800, storyTokensOutput: 400, storyEstimatedCostUsd: 0.001 }],
});

const expandTestCases = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Expand Story Test Case Items',
    parameters: {
      jsCode: `const source = $json;
const parsed = source.parsed || {};

const normalizeArray = value => Array.isArray(value) ? value.map(v => String(v || '').trim()).filter(Boolean) : (String(value || '').trim() ? [String(value).trim()] : []);
const slugify = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

function adfParagraph(text, strongLabel) {
  const content = [];
  if (strongLabel) {
    content.push({ type: 'text', text: strongLabel + ': ', marks: [{ type: 'strong' }] });
  }
  if (text) {
    content.push({ type: 'text', text: String(text).slice(0, 12000) });
  }
  return { type: 'paragraph', content };
}

function adfHeading(text, level = 3) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text: String(text).slice(0, 250) }] };
}

function adfBulletList(items) {
  const normalized = normalizeArray(items);
  if (!normalized.length) return null;
  return {
    type: 'bulletList',
    content: normalized.map(item => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: item.slice(0, 800) }] }] }))
  };
}

const storySummary = parsed.storySummary || source.storySummary || source.storyKey;
const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];

return testCases.map((testCase, index) => {
  const testCaseId = String(testCase.testCaseId || ('TC-' + String(index + 1).padStart(3, '0'))).trim();
  const summary = String(testCase.summary || ('Test ' + testCaseId + ' for ' + storySummary)).trim();
  const stableLabel = [source.idempotencyLabelPrefix || 'qops', 'tc', slugify(source.storyCorrelationId || source.storyKey), slugify(testCaseId), slugify(summary)].filter(Boolean).join('-').slice(0, 120);
  const preconditions = normalizeArray(testCase.preconditions);
  const testSteps = normalizeArray(testCase.testSteps);
  const testData = normalizeArray(testCase.testData);
  const acceptanceCriteriaCovered = normalizeArray(testCase.acceptanceCriteriaCovered);
  const notes = normalizeArray(testCase.notes);
  const requirementReference = String(testCase.requirementReference || (source.storyKey + ' story details')).trim();
  const testLevel = String(testCase.testLevel || 'UI').trim();
  const testCategory = String(testCase.testCategory || 'Functional').trim();
  const riskLevel = String(testCase.riskLevel || 'Medium').trim();
  const automationFeasibility = String(testCase.automationFeasibility || 'Medium').trim();
  const jiraDescription = {
    type: 'doc',
    version: 1,
    content: [
      adfHeading('Source Story', 3),
      adfParagraph(source.storyKey + ' - ' + storySummary),
      adfParagraph(testCase.objective || '', 'Objective'),
      adfParagraph(requirementReference, 'Requirement Reference'),
      adfParagraph(testLevel, 'Test Level'),
      adfParagraph(testCategory, 'Test Category'),
      adfParagraph(riskLevel, 'Risk Level'),
      adfParagraph(automationFeasibility, 'Automation Feasibility'),
      preconditions.length ? adfHeading('Preconditions', 3) : null,
      preconditions.length ? adfBulletList(preconditions) : null,
      testSteps.length ? adfHeading('Test Steps', 3) : null,
      testSteps.length ? adfBulletList(testSteps.map((step, stepIndex) => (stepIndex + 1) + '. ' + step)) : null,
      testData.length ? adfHeading('Test Data', 3) : null,
      testData.length ? adfBulletList(testData) : null,
      adfHeading('Expected Result', 3),
      adfParagraph(testCase.expectedResult || 'Expected result not provided by generator.'),
      acceptanceCriteriaCovered.length ? adfHeading('Acceptance Criteria Covered', 3) : null,
      acceptanceCriteriaCovered.length ? adfBulletList(acceptanceCriteriaCovered) : null,
      notes.length ? adfHeading('Notes', 3) : null,
      notes.length ? adfBulletList(notes) : null,
      adfHeading('Traceability', 3),
      adfParagraph(source.storyKey + ' | ' + (source.storyCorrelationId || 'N/A') + ' | Source Job ' + (source.storySourceJobId || 'N/A'))
    ].filter(Boolean)
  };

  return {
    json: {
      ...source,
      testCaseIndex: index + 1,
      testCaseId,
      testCaseSummary: summary,
      priority: String(testCase.priority || 'Medium'),
      testType: String(testCase.testType || 'functional'),
      requirementReference,
      testLevel,
      testCategory,
      riskLevel,
      automationFeasibility,
      objective: String(testCase.objective || '').trim(),
      preconditions,
      testSteps,
      testData,
      expectedResult: String(testCase.expectedResult || '').trim(),
      acceptanceCriteriaCovered,
      notes,
      stableLabel,
      jiraDescription,
      createIssueBody: {
        fields: {
          project: { key: source.jiraProjectKey },
          issuetype: { name: source.testCaseIssueTypeName || 'Test Case' },
          summary,
          description: jiraDescription,
          labels: [stableLabel, 'qops-story-test-cases', ('story-' + slugify(source.storyKey)).slice(0, 80)]
        }
      },
      linkIssueBody: {
        type: { name: 'Relates' },
        inwardIssue: { key: source.storyKey },
        outwardIssue: { key: '__REPLACE_TEST_CASE_KEY__' },
        comment: { body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Linked by Q-Ops Story Test Cases generation.' }] }] } }
      }
    }
  };
});`,
    },
    position: [1824, 0],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', storyCorrelationId: 'KAN-US-001', storySourceJobId: 'PRO-260512-RDR2ZR', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428', testCaseId: 'TC-001', testCaseSummary: 'Register with valid credentials', stableLabel: 'qops-tc-kan-us-001-tc-001-register-with-valid-credentials', createIssueBody: { fields: { project: { key: 'KAN' }, issuetype: { name: 'Test Case' }, summary: 'Register with valid credentials', description: { type: 'doc', version: 1, content: [] }, labels: ['qops-tc-kan-us-001-tc-001-register-with-valid-credentials', 'qops-story-test-cases'] } }, linkIssueBody: { type: { name: 'Relates' }, inwardIssue: { key: 'KAN-428' }, outwardIssue: { key: '__REPLACE_TEST_CASE_KEY__' } } }],
});

const searchExistingTestCase = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Search Existing Test Case By Stable Label',
    parameters: {
      url: '={{ $json.jiraBaseUrl + "/rest/api/3/search/jql" }}',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'jiraSoftwareCloudApi',
      sendQuery: true,
      queryParameters: {
        parameters: [
          { name: 'jql', value: '={{ "project = " + $json.jiraProjectKey + " AND issuetype = \\"" + ($json.testCaseIssueTypeName || "Test Case") + "\\" AND labels = \\"" + $json.stableLabel + "\\" ORDER BY created DESC" }}' },
          { name: 'fields', value: 'summary' },
          { name: 'maxResults', value: '1' },
        ],
      },
      options: {},
    },
    credentials: {
      jiraSoftwareCloudApi: newCredential('Jira SW Cloud account'),
    },
    position: [2048, 0],
    alwaysOutputData: true,
  },
  output: [{ issues: [] }],
});

const needsCreate = ifElse({
  version: 2.2,
  config: {
    name: 'Test Case Needs Create?',
    parameters: {
      conditions: {
        combinator: 'and',
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
        conditions: [
          {
            leftValue: '={{ (($json.issues || []).length) === 0 }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'true', singleValue: true },
          },
        ],
      },
    },
    position: [2272, 0],
  },
});

const createTestCase = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Create Jira Test Case',
    parameters: {
      method: 'POST',
      url: '={{ $("Expand Story Test Case Items").item.json.jiraBaseUrl + "/rest/api/3/issue" }}',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'jiraSoftwareCloudApi',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($("Expand Story Test Case Items").item.json.createIssueBody) }}',
      options: {},
    },
    credentials: {
      jiraSoftwareCloudApi: newCredential('Jira SW Cloud account'),
    },
    position: [2496, -96],
  },
  output: [{ id: '11001', key: 'KAN-500', self: 'https://anujalhans1.atlassian.net/rest/api/3/issue/11001' }],
});

const linkCreatedTestCase = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Link Created Test Case To Story',
    parameters: {
      method: 'POST',
      url: '={{ $("Expand Story Test Case Items").item.json.jiraBaseUrl + "/rest/api/3/issueLink" }}',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'jiraSoftwareCloudApi',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ type: { name: "Relates" }, inwardIssue: { key: $("Expand Story Test Case Items").item.json.storyKey }, outwardIssue: { key: $json.key }, comment: { body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: "Linked by Q-Ops Story Test Cases generation." }] }] } } }) }}',
      options: {},
    },
    credentials: {
      jiraSoftwareCloudApi: newCredential('Jira SW Cloud account'),
    },
    position: [2720, -96],
  },
  output: [{}],
});

const normalizeCreated = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize Created Story Test Case',
    parameters: {
      jsCode: `const source = $('Expand Story Test Case Items').item.json;
const created = $('Create Jira Test Case').item.json || {};
return [{
  json: {
    ...source,
    action: 'created',
    testcaseKey: created.key,
    testcaseId: created.id,
    testcaseSelf: created.self,
    testcaseLink: source.jiraBaseUrl + '/browse/' + created.key
  }
}];`,
    },
    position: [2944, -96],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', storySourceJobId: 'PRO-260512-RDR2ZR', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428', testCaseSummary: 'Register with valid credentials', stableLabel: 'qops-tc-kan-us-001-tc-001-register-with-valid-credentials', action: 'created', testcaseKey: 'KAN-500', testcaseId: '11001', testcaseSelf: 'https://anujalhans1.atlassian.net/rest/api/3/issue/11001', testcaseLink: 'https://anujalhans1.atlassian.net/browse/KAN-500' }],
});

const normalizeExisting = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize Existing Story Test Case',
    parameters: {
      jsCode: `const source = $('Expand Story Test Case Items').item.json;
const search = $json || {};
const existing = Array.isArray(search.issues) ? search.issues[0] : null;
if (!existing?.key) {
  throw new Error('Expected an existing Jira Test Case issue for stable label ' + source.stableLabel + ' but none was returned.');
}
return [{
  json: {
    ...source,
    action: 'reused',
    testcaseKey: existing.key,
    testcaseId: existing.id || null,
    testcaseSelf: existing.self || null,
    testcaseLink: source.jiraBaseUrl + '/browse/' + existing.key
  }
}];`,
    },
    position: [2496, 96],
  },
  output: [{ jobId: 'STC-260512-ABC123', projectName: 'ShopSmart', storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', storySourceJobId: 'PRO-260512-RDR2ZR', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428', testCaseSummary: 'Register with valid credentials', stableLabel: 'qops-tc-kan-us-001-tc-001-register-with-valid-credentials', action: 'reused', testcaseKey: 'KAN-500', testcaseId: '11001', testcaseSelf: 'https://anujalhans1.atlassian.net/rest/api/3/issue/11001', testcaseLink: 'https://anujalhans1.atlassian.net/browse/KAN-500' }],
});

const upsertMapping = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Upsert Story Test Case Mapping',
    parameters: {
      method: 'POST',
      url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpCustomAuth',
      sendHeaders: true,
      specifyHeaders: 'json',
      jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal" }',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: "Relates", status: $json.action === "created" ? "linked" : "reused", metadata: { action: $json.action, priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}',
      options: {},
    },
    credentials: {
      httpCustomAuth: newCredential('supabase-service-role-key'),
    },
    position: [3168, 0],
  },
  output: [{}],
});

const finalize = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Finalize Story Test Case Result',
    parameters: {
      jsCode: `function safeAll(nodeName) {
  try {
    return $(nodeName).all().map((item) => item.json || {});
  } catch (error) {
    if (String(error?.message || error).includes("hasn't been executed")) {
      return [];
    }
    throw error;
  }
}

const createdItems = safeAll('Normalize Created Story Test Case');
const reusedItems = safeAll('Normalize Existing Story Test Case');
const allItems = [...createdItems, ...reusedItems];
if (!allItems.length) {
  throw new Error('Story Test Case generator did not produce any reusable or created Jira Test Cases.');
}
const perStoryMetrics = $('Robust Story Test Case Parser').all().map(item => item.json || {});
const storyMap = new Map();
allItems.forEach((item) => {
  if (!storyMap.has(item.storyKey)) {
    storyMap.set(item.storyKey, {
      storyKey: item.storyKey,
      storyId: item.storyId,
      summary: item.storySummary,
      storyCorrelationId: item.storyCorrelationId,
      storyLink: item.storyLink
    });
  }
});
const stories = Array.from(storyMap.values());
const testCases = allItems.map((item) => ({
  action: item.action,
  testcaseKey: item.testcaseKey,
  testcaseId: item.testcaseId,
  testcaseSummary: item.testCaseSummary,
  testcaseLink: item.testcaseLink,
  storyKey: item.storyKey,
  storySummary: item.storySummary,
  stableLabel: item.stableLabel,
  priority: item.priority,
  riskLevel: item.riskLevel,
  testType: item.testType,
  testLevel: item.testLevel,
  testCategory: item.testCategory,
  automationFeasibility: item.automationFeasibility,
  requirementReference: item.requirementReference
}));
const mappings = allItems.map((item) => ({
  storyKey: item.storyKey,
  storySummary: item.storySummary,
  testcaseKey: item.testcaseKey,
  testcaseSummary: item.testCaseSummary,
  action: item.action
}));
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const first = allItems[0];
return [{
  json: {
    documentType: 'story_test_cases',
    jobId: first.jobId,
    projectId: first.projectId,
    projectName: first.projectName,
    sourceUserStoryJobId: first.storySourceJobId || null,
    stories,
    testCases,
    mappings,
    jira: {
      projectKey: first.jiraProjectKey,
      created: testCases.filter(item => item.action === 'created').length,
      reused: testCases.filter(item => item.action === 'reused').length
    },
    wordCount,
    tokensInput,
    tokensOutput,
    tokensTotal: tokensInput + tokensOutput,
    estimatedCostUsd
  }
}];`,
    },
    position: [3392, 0],
    executeOnce: true,
  },
  output: [{ documentType: 'story_test_cases', jobId: 'STC-260512-ABC123', projectId: 'project-id', projectName: 'ShopSmart', sourceUserStoryJobId: 'PRO-260512-RDR2ZR', stories: [{ storyKey: 'KAN-428', summary: 'User Registration and Profile Management UI', storyLink: 'https://anujalhans1.atlassian.net/browse/KAN-428' }], testCases: [{ action: 'created', testcaseKey: 'KAN-500', testcaseId: '11001', testcaseSummary: 'Register with valid credentials', testcaseLink: 'https://anujalhans1.atlassian.net/browse/KAN-500', storyKey: 'KAN-428', storySummary: 'User Registration and Profile Management UI', stableLabel: 'qops-tc-kan-us-001-tc-001-register-with-valid-credentials', priority: 'High', testType: 'functional' }], mappings: [{ storyKey: 'KAN-428', testcaseKey: 'KAN-500', action: 'created' }], jira: { projectKey: 'KAN', created: 1, reused: 0 }, wordCount: 120, tokensInput: 800, tokensOutput: 400, tokensTotal: 1200, estimatedCostUsd: 0.001 }],
});

export default workflow('pro-qa-jira-story-test-case-generator', 'PRO QA Jira Story Test Case Generator')
  .add(start)
  .to(normalizeRequest)
  .to(fetchCompletedStoryJobs)
  .to(buildStorySourceItems)
  .to(fetchJiraStoryIssue)
  .to(preparePrompt)
  .to(testCaseAgent)
  .to(parseModelJson)
  .to(expandTestCases)
  .to(searchExistingTestCase)
  .to(needsCreate.onTrue(
    createTestCase
      .to(linkCreatedTestCase)
      .to(normalizeCreated)
      .to(upsertMapping)
      .to(finalize)
  ).onFalse(
    normalizeExisting
      .to(upsertMapping)
      .to(finalize)
  ));
