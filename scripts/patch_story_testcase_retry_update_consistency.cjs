const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const queueWorkflowId = '8nuhDEewnnunXSbF';
const generatorWorkflowId = 'SG7khcKlhHst48WH';
const workerWorkflowId = 'ivz13uFyjfCT8149';
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

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

const prepareQueueRequestCode = String.raw`const now = new Date();
const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
const jobId = 'STC-' + datePart + '-' + randomPart;
const headers = $json.headers || {};
const authHeader = headers.authorization || headers.Authorization || '';
const input = $json.body || {};
const retryOfJobId = String(input.retryJobId || input.jobId || input.retryOfJobId || '').trim();
const isRetry = Boolean(retryOfJobId);
const requestedMode = String(input.generationMode || '').trim().toLowerCase();
const generationMode = requestedMode === 'update' ? 'update' : (isRetry ? 'retry' : 'create');
if (!String(authHeader).toLowerCase().startsWith('bearer ')) {
  return [{ json: { ok: false, statusCode: 401, errorCode: 'UNAUTHORIZED', message: 'Missing bearer token' } }];
}
if (!String(input.projectName || '').trim()) {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'projectName is required' } }];
}
const documentType = String(input.documentType || '').trim().toLowerCase();
if (documentType !== 'story_test_cases') {
  return [{ json: { ok: false, statusCode: 400, errorCode: 'INVALID_REQUEST', message: 'documentType must be story_test_cases' } }];
}
return [{
  json: {
    ok: true,
    jobId,
    retryMode: isRetry,
    retryOfJobId: retryOfJobId || null,
    input: {
      ...input,
      retryJobId: undefined,
      jobId: undefined,
      retryOfJobId: retryOfJobId || null,
      generatorMode: 'professional_story_test_cases',
      generationMode,
    },
    token: String(authHeader).replace(/^Bearer\s+/i, ''),
    projectId: input.projectId || null,
    environment: input.environment || 'local'
  }
}];`;

const queuePersistParameters = {
  method: 'POST',
  url: 'https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs',
  authentication: 'genericCredentialType',
  genericAuthType: 'httpCustomAuth',
  sendHeaders: true,
  specifyHeaders: 'json',
  jsonHeaders: '{ "Content-Type": "application/json", "Prefer": "return=representation" }',
  sendBody: true,
  specifyBody: 'json',
  jsonBody: '={{ JSON.stringify({ job_id: $json.jobId, status: "pending", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot }) }}',
  options: {},
};

const queueMetricBody = '={{ JSON.stringify({ job_id: $("Combine Story Test Case Job And Runtime").item.json.jobId, project_name: $("Combine Story Test Case Job And Runtime").item.json.input.projectName, document_type: $("Combine Story Test Case Job And Runtime").item.json.input.documentType, pipeline: "generation", event: $("Combine Story Test Case Job And Runtime").item.json.retryMode ? "JOB_RETRY_QUEUED" : ($("Combine Story Test Case Job And Runtime").item.json.input.generationMode === "update" ? "JOB_UPDATE_QUEUED" : "JOB_QUEUED"), status: "info", project_id: $("Combine Story Test Case Job And Runtime").item.json.projectId, requested_by: $("Combine Story Test Case Job And Runtime").item.json.requestedBy, metadata: { generator_mode: "professional_story_test_cases", generation_mode: $("Combine Story Test Case Job And Runtime").item.json.input.generationMode || ($("Combine Story Test Case Job And Runtime").item.json.retryMode ? "retry" : "create"), retry: Boolean($("Combine Story Test Case Job And Runtime").item.json.retryMode), retry_of_job_id: $("Combine Story Test Case Job And Runtime").item.json.retryOfJobId || $("Combine Story Test Case Job And Runtime").item.json.input.retryOfJobId || null, update_of_job_id: $("Combine Story Test Case Job And Runtime").item.json.input.updateContext?.previousJobId || null, product_owner: $("Combine Story Test Case Job And Runtime").item.json.input.productOwner, settings_version: $("Combine Story Test Case Job And Runtime").item.json.settingsVersion, environment: $("Combine Story Test Case Job And Runtime").item.json.environment } }) }}';

const queueResponseBody = '={{ JSON.stringify({ jobId: $("Combine Story Test Case Job And Runtime").item.json.jobId, status: "queued", generatorMode: "professional_story_test_cases", generationMode: $("Combine Story Test Case Job And Runtime").item.json.input.generationMode || ($("Combine Story Test Case Job And Runtime").item.json.retryMode ? "retry" : "create"), retryOfJobId: $("Combine Story Test Case Job And Runtime").item.json.retryOfJobId || null, retried: Boolean($("Combine Story Test Case Job And Runtime").item.json.retryMode) }) }}';

const normalizeGeneratorRequestCode = String.raw`const input = $json || {};
const config = input.configSnapshot || input.config_snapshot || {};
const publishing = config.publishing || {};
const jira = config.jira || {
  baseUrl: publishing.jiraBaseUrl,
  projectKey: publishing.jiraProjectKey,
  testCaseIssueTypeName: publishing.jiraTestCaseIssueTypeName,
  idempotencyLabelPrefix: publishing.jiraIdempotencyLabelPrefix
};
const models = config.models || {};
const cleanBase = (value, fallback) => {
  const s = String(value || fallback || '');
  return s.endsWith('/') ? s.slice(0, -1) : s;
};
const generationMode = String(input.generationMode || input.generation_mode || '').trim().toLowerCase() === 'update'
  ? 'update'
  : (String(input.generationMode || '').trim().toLowerCase() === 'retry' ? 'retry' : 'create');
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
    generationMode,
    updateContext: input.updateContext || input.update_context || null,
    retryOfJobId: input.retryOfJobId || input.retry_of_job_id || null,
    configSnapshot: config
  }
}];`;

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
      updateIssueBody: { fields: updateFields }
    }
  };
});`;

const updateExistingNode = {
  parameters: {
    method: 'PUT',
    url: '={{ $json.jiraBaseUrl + "/rest/api/3/issue/" + $json.testcaseKey }}',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'jiraSoftwareCloudApi',
    sendBody: true,
    specifyBody: 'json',
    jsonBody: '={{ JSON.stringify($json.updateIssueBody) }}',
    options: {},
  },
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.4,
  position: [5056, 112],
  id: crypto.randomUUID(),
  name: 'Update Existing Jira Test Case',
  alwaysOutputData: true,
  credentials: jiraCredential,
};

const existingNeedsUpdateNode = {
  parameters: {
    conditions: {
      combinator: 'and',
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: '={{ $json.action === "updated" }}',
          rightValue: true,
          operator: { type: 'boolean', operation: 'true', singleValue: true },
        },
      ],
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.2,
  position: [5056, 240],
  id: crypto.randomUUID(),
  name: 'Existing Test Case Needs Update?',
};

const normalizeUpdatedExistingNode = {
  parameters: {
    jsCode: String.raw`const updatedSources = $('Normalize Existing Story Test Case').all().map((item) => item.json || {}).filter((item) => item.action === 'updated');
const responses = $input.all();
function pairedIndex(item, fallback) {
  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;
  return Number.isInteger(paired?.item) ? paired.item : fallback;
}
return responses.map((item, index) => {
  const source = updatedSources[pairedIndex(item, index)] || updatedSources[index] || updatedSources[0] || {};
  return { json: source };
});`,
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [5280, 112],
  id: crypto.randomUUID(),
  name: 'Normalize Updated Existing Story Test Case',
};

const finalizeCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const createdItems = safeAll('Normalize Created Story Test Case');
const reusedItems = safeAll('Normalize Existing Story Test Case').filter(item => item.action !== 'updated');
const updatedItems = safeAll('Normalize Updated Existing Story Test Case');
const allItems = [...createdItems, ...reusedItems, ...updatedItems];
const expandedItems = safeAll('Expand Story Test Case Items');
if (expandedItems.length && allItems.length < expandedItems.length) return [];
if (!allItems.length) throw new Error('Story Test Case generator did not produce any reusable, updated, or created Jira Test Cases.');
const uniqueItems = [];
const seen = new Set();
for (const item of allItems) {
  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join('|');
  if (!key || seen.has(key)) continue;
  seen.add(key);
  uniqueItems.push(item);
}
const perStoryMetrics = safeAll('Merge Story Test Case Batches');
const sourceStoryItems = safeAll('Build Story Source Items');
const plannedBatches = safeAll('Build Story Test Case Detail Batches');
const storyMap = new Map();
uniqueItems.forEach((item) => { if (!storyMap.has(item.storyKey)) storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: item.storyId, summary: item.storySummary, storyCorrelationId: item.storyCorrelationId, storyLink: item.storyLink }); });
const stories = Array.from(storyMap.values());
const testCases = uniqueItems.map((item) => ({ action: item.action, testcaseKey: item.testcaseKey, testcaseId: item.testcaseId, testcaseSummary: item.testCaseSummary, testcaseLink: item.testcaseLink, storyKey: item.storyKey, storySummary: item.storySummary, stableLabel: item.stableLabel, legacyStableLabel: item.legacyStableLabel || null, coverageCategory: item.coverageCategory || null, priority: item.priority, riskLevel: item.riskLevel, testType: item.testType, testLevel: item.testLevel, testCategory: item.testCategory, automationFeasibility: item.automationFeasibility, requirementReference: item.requirementReference }));
const mappings = uniqueItems.map((item) => ({ storyKey: item.storyKey, storySummary: item.storySummary, testcaseKey: item.testcaseKey, testcaseSummary: item.testCaseSummary, action: item.action, coverageCategory: item.coverageCategory || null }));
const categoryDistribution = testCases.reduce((acc, item) => { const key = item.coverageCategory || item.testCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
function uniqueText(values) { return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean))); }
function storyLabel(story) { return [story.storyKey, story.summary || story.storySummary].filter(Boolean).join(' - '); }
function buildCoverage(sourceStories, plannedBatches, metricStories, stories, testCases, mappings) {
  const byStory = new Map();
  function ensureStory(key, seed = {}) {
    const storyKey = String(key || seed.storyKey || '').trim();
    if (!storyKey) return null;
    if (!byStory.has(storyKey)) {
      byStory.set(storyKey, {
        storyKey,
        storyId: seed.storyId || null,
        summary: seed.summary || seed.storySummary || '',
        storyCorrelationId: seed.storyCorrelationId || null,
        storyLink: seed.storyLink || null,
        planned: 0,
        plannedCategories: new Set(),
        testCases: [],
        mappings: [],
      });
    }
    const current = byStory.get(storyKey);
    current.storyId = current.storyId || seed.storyId || null;
    current.summary = current.summary || seed.summary || seed.storySummary || '';
    current.storyCorrelationId = current.storyCorrelationId || seed.storyCorrelationId || null;
    current.storyLink = current.storyLink || seed.storyLink || null;
    return current;
  }

  sourceStories.forEach(story => ensureStory(story.storyKey, story));
  metricStories.forEach(story => {
    const current = ensureStory(story.storyKey, story);
    if (current && Number(story.testCaseCount || 0) > current.planned) current.planned = Number(story.testCaseCount || 0);
    Object.keys(story.categoryDistribution || {}).forEach(category => current?.plannedCategories.add(category));
  });
  stories.forEach(story => ensureStory(story.storyKey, story));
  plannedBatches.forEach(batch => {
    const current = ensureStory(batch.storyKey, batch);
    if (!current) return;
    const planItems = Array.isArray(batch.planItems) ? batch.planItems : [];
    current.planned += planItems.length;
    planItems.forEach(plan => current.plannedCategories.add(String(plan.coverageCategory || plan.testCategory || 'Functional').trim() || 'Functional'));
  });
  testCases.forEach(testCase => {
    const current = ensureStory(testCase.storyKey, testCase);
    if (!current) return;
    current.testCases.push(testCase);
  });
  mappings.forEach(mapping => {
    const current = ensureStory(mapping.storyKey, mapping);
    if (!current) return;
    current.mappings.push(mapping);
  });

  const coverageLedger = Array.from(byStory.values()).sort((left, right) => left.storyKey.localeCompare(right.storyKey)).map((story, index) => {
    const generated = story.testCases.length;
    const planned = story.planned || generated;
    const generatedCategories = uniqueText(story.testCases.map(item => item.coverageCategory || item.testCategory));
    const plannedCategories = uniqueText(Array.from(story.plannedCategories));
    const missingCategories = plannedCategories.filter(category => !generatedCategories.includes(category));
    const actions = story.testCases.reduce((acc, item) => {
      const action = String(item.action || '').trim().toLowerCase();
      if (action === 'created') acc.created += 1;
      else if (action === 'updated') acc.updated += 1;
      else if (action === 'reused') acc.reused += 1;
      return acc;
    }, { created: 0, updated: 0, reused: 0 });
    const coverageStatus = !generated
      ? 'missing'
      : (planned && generated < planned) || missingCategories.length
        ? 'partial'
        : 'covered';
    const notes = coverageStatus === 'missing'
      ? 'No Jira test cases were published for this story.'
      : coverageStatus === 'partial'
        ? 'Some planned test cases or categories need review.'
        : 'Story has published Jira test-case coverage.';
    return {
      coverageId: 'STC-COV-' + String(index + 1).padStart(3, '0'),
      storyKey: story.storyKey,
      storyId: story.storyId,
      storySummary: story.summary,
      storyCorrelationId: story.storyCorrelationId,
      storyLink: story.storyLink,
      module: story.storyKey,
      requirement: story.summary || story.storyKey,
      sourceReference: 'Jira Story ' + story.storyKey,
      includedInOutput: generated + ' Jira test case' + (generated === 1 ? '' : 's'),
      coverageStatus,
      status: coverageStatus,
      plannedTestCases: planned,
      generatedTestCases: generated,
      mappingCount: story.mappings.length,
      categoriesCovered: generatedCategories,
      plannedCategories,
      missingCategories,
      actions,
      notes,
    };
  });
  const coveredItems = coverageLedger.filter(item => item.coverageStatus === 'covered');
  const partialItems = coverageLedger.filter(item => item.coverageStatus === 'partial');
  const missingItems = coverageLedger.filter(item => item.coverageStatus === 'missing');
  const total = coverageLedger.length;
  const gateStatus = missingItems.length ? 'failed' : (partialItems.length ? 'warning' : 'passed');
  const score = total ? Math.round(((coveredItems.length + partialItems.length * 0.5) / total) * 100) : 0;
  const summaryText = missingItems.length
    ? missingItems.length + ' source stor' + (missingItems.length === 1 ? 'y is' : 'ies are') + ' missing Jira test-case coverage.'
    : partialItems.length
      ? partialItems.length + ' source stor' + (partialItems.length === 1 ? 'y needs' : 'ies need') + ' coverage review.'
      : 'All source stories have Jira test-case coverage.';
  const coverageSummary = {
    status: gateStatus,
    gateStatus,
    total,
    coverageLedgerCount: total,
    covered: coveredItems.length,
    coveredCount: coveredItems.length,
    partial: partialItems.length,
    partialCount: partialItems.length,
    missing: missingItems.length,
    missingCount: missingItems.length,
    recovered: 0,
    recoveredCount: 0,
    score,
    coveredItems,
    partialItems,
    warningItems: partialItems,
    missingItems,
    storyCoverage: coverageLedger,
  };
  const batchSummary = {
    totalBatches: total,
    completedBatches: coveredItems.length,
    partialBatches: partialItems.length,
    missingBatches: missingItems.length,
    recoveredBatches: 0,
    batches: coverageLedger.map(item => ({
      batchId: item.coverageId,
      module: storyLabel(item),
      name: storyLabel(item),
      status: item.coverageStatus,
      coverageStatus: item.coverageStatus,
      plannedTestCases: item.plannedTestCases,
      generatedTestCases: item.generatedTestCases,
      categoriesCovered: item.categoriesCovered,
      missingCategories: item.missingCategories,
    })),
  };
  const qualityGate = {
    status: gateStatus,
    gateStatus,
    coverageSummary,
    batchSummary,
    coverageLedger,
    progress: {
      stage: 'story_test_case_coverage',
      stageLabel: 'Story test-case coverage',
      summary: summaryText,
      progressPercent: score,
      totalBatches: total,
      completedBatches: coveredItems.length,
      retryingBatches: 0,
      batches: batchSummary.batches,
    },
  };
  return { coverageSummary, batchSummary, coverageLedger, qualityGate };
}
const coverage = buildCoverage(sourceStoryItems, plannedBatches, perStoryMetrics, stories, testCases, mappings);
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const first = uniqueItems[0];
const generationMode = String(first.generationMode || '').trim().toLowerCase() === 'update' ? 'update' : (String(first.generationMode || '').trim().toLowerCase() === 'retry' ? 'retry' : 'create');
return [{ json: { documentType: 'story_test_cases', jobId: first.jobId, projectId: first.projectId, projectName: first.projectName, generationMode, updateContext: first.updateContext || null, updateOfJobId: first.updateContext?.previousJobId || null, retryOfJobId: first.retryOfJobId || null, sourceUserStoryJobId: first.storySourceJobId || null, stories, testCases, mappings, categoryDistribution, coverageSummary: coverage.coverageSummary, batchSummary: coverage.batchSummary, coverageLedger: coverage.coverageLedger, qualityGate: coverage.qualityGate, jira: { projectKey: first.jiraProjectKey, created: testCases.filter(item => item.action === 'created').length, updated: testCases.filter(item => item.action === 'updated').length, reused: testCases.filter(item => item.action === 'reused').length }, wordCount, tokensInput, tokensOutput, tokensTotal: tokensInput + tokensOutput, estimatedCostUsd } }];`;

const directCompletionCode = String.raw`const result = $json || {};
const output = {
  documentType: 'story_test_cases',
  destination: { type: 'jira_test_cases', projectId: result.projectId || null },
  generationMode: result.generationMode || null,
  updateContext: result.updateContext || null,
  updateOfJobId: result.updateOfJobId || result.updateContext?.previousJobId || null,
  retryOfJobId: result.retryOfJobId || null,
  sourceUserStoryJobId: result.sourceUserStoryJobId || null,
  stories: Array.isArray(result.stories) ? result.stories : [],
  testCases: Array.isArray(result.testCases) ? result.testCases : [],
  mappings: Array.isArray(result.mappings) ? result.mappings : [],
  categoryDistribution: result.categoryDistribution || {},
  coverageSummary: result.coverageSummary || result.qualityGate?.coverageSummary || null,
  batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,
  coverageLedger: Array.isArray(result.coverageLedger) ? result.coverageLedger : (Array.isArray(result.qualityGate?.coverageLedger) ? result.qualityGate.coverageLedger : []),
  qualityGate: result.qualityGate || null,
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

const directMetricBody = '={{ JSON.stringify({ job_id: $("Build Direct Story Test Case Completion Output").item.json.jobId, project_name: $("Build Direct Story Test Case Completion Output").item.json.projectName, document_type: $("Build Direct Story Test Case Completion Output").item.json.documentType, pipeline: "generation", event: "JOB_COMPLETED", status: "info", project_id: $("Build Direct Story Test Case Completion Output").item.json.projectId, requested_by: $("Build Direct Story Test Case Completion Output").item.json.requestedBy, duration_ms: Date.now() - new Date($("Build Direct Story Test Case Completion Output").item.json.startedAt || $("Build Direct Story Test Case Completion Output").item.json.createdAt || Date.now()).getTime(), word_count: $("Build Direct Story Test Case Completion Output").item.json.output.wordCount || 0, tokens_input: $("Build Direct Story Test Case Completion Output").item.json.output.tokensInput || 0, tokens_output: $("Build Direct Story Test Case Completion Output").item.json.output.tokensOutput || 0, tokens_total: $("Build Direct Story Test Case Completion Output").item.json.output.tokensTotal || 0, estimated_cost_usd: $("Build Direct Story Test Case Completion Output").item.json.output.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", generation_mode: $("Build Direct Story Test Case Completion Output").item.json.output.generationMode || $("Build Direct Story Test Case Completion Output").item.json.generationMode || "create", update_of_job_id: $("Build Direct Story Test Case Completion Output").item.json.output.updateOfJobId || null, retry_of_job_id: $("Build Direct Story Test Case Completion Output").item.json.output.retryOfJobId || null, source_user_story_job_id: $("Build Direct Story Test Case Completion Output").item.json.output.sourceUserStoryJobId, story_count: ($("Build Direct Story Test Case Completion Output").item.json.output.stories || []).length, testcase_count: ($("Build Direct Story Test Case Completion Output").item.json.output.testCases || []).length, testcase_created_count: $("Build Direct Story Test Case Completion Output").item.json.output.jira?.created || 0, testcase_updated_count: $("Build Direct Story Test Case Completion Output").item.json.output.jira?.updated || 0, testcase_reused_count: $("Build Direct Story Test Case Completion Output").item.json.output.jira?.reused || 0, mapping_count: ($("Build Direct Story Test Case Completion Output").item.json.output.mappings || []).length, settings_version: $("Build Direct Story Test Case Completion Output").item.json.settingsVersion, persisted_by: "story_testcase_generator" } }) }}';

const directMarkBody = '={{ JSON.stringify({ status: "completed", output: $("Build Direct Story Test Case Completion Output").item.json.output, updated_at: $now.toISO() }) }}';
const directMarkUrl = '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $("Build Direct Story Test Case Completion Output").item.json.jobId }}&status=eq.processing';

const returnDirectCode = String.raw`const persisted = $('Build Direct Story Test Case Completion Output').first().json;
const original = {
  documentType: persisted.documentType,
  jobId: persisted.jobId,
  projectId: persisted.projectId,
  projectName: persisted.projectName,
  generationMode: persisted.output?.generationMode || persisted.generationMode || null,
  updateContext: persisted.output?.updateContext || persisted.updateContext || null,
  updateOfJobId: persisted.output?.updateOfJobId || persisted.updateOfJobId || null,
  retryOfJobId: persisted.output?.retryOfJobId || persisted.retryOfJobId || null,
  sourceUserStoryJobId: persisted.output?.sourceUserStoryJobId || persisted.sourceUserStoryJobId || null,
  stories: persisted.output?.stories || persisted.stories || [],
  testCases: persisted.output?.testCases || persisted.testCases || [],
  mappings: persisted.output?.mappings || persisted.mappings || [],
  categoryDistribution: persisted.output?.categoryDistribution || persisted.categoryDistribution || {},
  coverageSummary: persisted.output?.coverageSummary || persisted.coverageSummary || null,
  batchSummary: persisted.output?.batchSummary || persisted.batchSummary || null,
  coverageLedger: persisted.output?.coverageLedger || persisted.coverageLedger || [],
  qualityGate: persisted.output?.qualityGate || persisted.qualityGate || null,
  jira: persisted.output?.jira || persisted.jira || null,
  wordCount: persisted.output?.wordCount || persisted.wordCount || 0,
  tokensInput: persisted.output?.tokensInput || persisted.tokensInput || 0,
  tokensOutput: persisted.output?.tokensOutput || persisted.tokensOutput || 0,
  tokensTotal: persisted.output?.tokensTotal || persisted.tokensTotal || 0,
  estimatedCostUsd: persisted.output?.estimatedCostUsd || persisted.estimatedCostUsd || 0,
  generatorPersisted: true,
};
return [{ json: original }];`;

const workerCompletionCode = String.raw`const result = $json || {};
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
      generationMode: result.generationMode || input.generationMode || null,
      updateContext: result.updateContext || input.updateContext || null,
      updateOfJobId: result.updateOfJobId || result.updateContext?.previousJobId || input.updateContext?.previousJobId || null,
      retryOfJobId: result.retryOfJobId || input.retryOfJobId || null,
      sourceUserStoryJobId: result.sourceUserStoryJobId || null,
      stories: Array.isArray(result.stories) ? result.stories : [],
      testCases: Array.isArray(result.testCases) ? result.testCases : [],
      mappings: Array.isArray(result.mappings) ? result.mappings : [],
      categoryDistribution: result.categoryDistribution || {},
      coverageSummary: result.coverageSummary || result.qualityGate?.coverageSummary || null,
      batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,
      coverageLedger: Array.isArray(result.coverageLedger) ? result.coverageLedger : (Array.isArray(result.qualityGate?.coverageLedger) ? result.qualityGate.coverageLedger : []),
      qualityGate: result.qualityGate || null,
      jira: result.jira || null,
      wordCount: result.wordCount || 0,
      tokensInput: result.tokensInput || 0,
      tokensOutput: result.tokensOutput || 0,
      tokensTotal: result.tokensTotal || 0,
      estimatedCostUsd: result.estimatedCostUsd || 0
    }
  }
}];`;

const workerMetricBody = '={{ JSON.stringify({ job_id: $("Build Story Test Case Completion Output").item.json.jobId, project_name: $("Build Story Test Case Completion Output").item.json.projectName, document_type: $("Build Story Test Case Completion Output").item.json.documentType, pipeline: "generation", event: "JOB_COMPLETED", status: "info", project_id: $("Build Story Test Case Completion Output").item.json.projectId, requested_by: $("Build Story Test Case Completion Output").item.json.requestedBy, duration_ms: Date.now() - new Date($("Build Story Test Case Completion Output").item.json.startedAt || $("Build Story Test Case Completion Output").item.json.createdAt || Date.now()).getTime(), word_count: $("Build Story Test Case Completion Output").item.json.output.wordCount || 0, tokens_input: $("Build Story Test Case Completion Output").item.json.output.tokensInput || 0, tokens_output: $("Build Story Test Case Completion Output").item.json.output.tokensOutput || 0, tokens_total: $("Build Story Test Case Completion Output").item.json.output.tokensTotal || 0, estimated_cost_usd: $("Build Story Test Case Completion Output").item.json.output.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", generation_mode: $("Build Story Test Case Completion Output").item.json.output.generationMode || $("Build Story Test Case Completion Output").item.json.generationMode || "create", update_of_job_id: $("Build Story Test Case Completion Output").item.json.output.updateOfJobId || null, retry_of_job_id: $("Build Story Test Case Completion Output").item.json.output.retryOfJobId || null, source_user_story_job_id: $("Build Story Test Case Completion Output").item.json.output.sourceUserStoryJobId, story_count: ($("Build Story Test Case Completion Output").item.json.output.stories || []).length, testcase_count: ($("Build Story Test Case Completion Output").item.json.output.testCases || []).length, testcase_created_count: $("Build Story Test Case Completion Output").item.json.output.jira?.created || 0, testcase_updated_count: $("Build Story Test Case Completion Output").item.json.output.jira?.updated || 0, testcase_reused_count: $("Build Story Test Case Completion Output").item.json.output.jira?.reused || 0, mapping_count: ($("Build Story Test Case Completion Output").item.json.output.mappings || []).length, settings_version: $("Build Story Test Case Completion Output").item.json.settingsVersion } }) }}';
const workerMarkBody = '={{ JSON.stringify({ status: "completed", output: $("Build Story Test Case Completion Output").item.json.output, updated_at: $now.toISO() }) }}';
const workerMarkUrl = '=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $("Build Story Test Case Completion Output").item.json.jobId }}&status=eq.processing';

const upsertMappingBody = '={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: "Relates", status: $json.action === "created" ? "linked" : ($json.action === "updated" ? "updated" : "reused"), metadata: { action: $json.action, canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}';

function backup(row, label) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(backupDir, `workflow_${row.id}_before_${label}_${timestamp}.json`), JSON.stringify(row, null, 2));
}

function parseWorkflow(row) {
  return {
    nodes: JSON.parse(row.nodes),
    connections: JSON.parse(row.connections),
  };
}

function saveWorkflow(db, id, nodes, connections, callback) {
  db.run(
    "update workflow_entity set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
    [JSON.stringify(nodes), JSON.stringify(connections), id],
    (err) => {
      if (err) throw err;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [id], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) return callback();
        db.run(
          "update workflow_history set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
          [JSON.stringify(nodes), JSON.stringify(connections), id, historyRow.versionId],
          (updateHistoryErr) => {
            if (updateHistoryErr) throw updateHistoryErr;
            callback();
          }
        );
      });
    }
  );
}

function upsertNode(nodes, node) {
  const index = nodes.findIndex((item) => item.name === node.name);
  if (index >= 0) {
    nodes[index] = { ...nodes[index], ...node, id: nodes[index].id };
  } else {
    nodes.push(node);
  }
}

function setConnection(connections, from, outputs) {
  connections[from] = { main: outputs };
}

function patchQueue(row) {
  const { nodes, connections } = parseWorkflow(row);
  backup(row, 'story_testcase_retry_child_jobs');
  const prepare = nodes.find((node) => node.name === 'Prepare Story Test Case Queue Request');
  const persist = nodes.find((node) => node.name === 'Persist Story Test Case Job');
  const log = nodes.find((node) => node.name === 'LOG: Story Test Case Job Queued');
  const respond = nodes.find((node) => node.name === 'Respond Queued');
  if (!prepare || !persist || !log || !respond) throw new Error('Queue workflow missing expected nodes.');
  prepare.parameters.jsCode = prepareQueueRequestCode;
  persist.parameters = queuePersistParameters;
  persist.credentials = supabaseCredential;
  log.parameters.jsonBody = queueMetricBody;
  respond.parameters.responseBody = queueResponseBody;
  return { nodes, connections };
}

function patchGenerator(row) {
  const { nodes, connections } = parseWorkflow(row);
  backup(row, 'story_testcase_update_existing_and_direct_completion');
  const normalize = nodes.find((node) => node.name === 'Normalize Story Test Case Request');
  const normalizeExisting = nodes.find((node) => node.name === 'Normalize Existing Story Test Case');
  const finalize = nodes.find((node) => node.name === 'Finalize Story Test Case Result');
  const directBuild = nodes.find((node) => node.name === 'Build Direct Story Test Case Completion Output');
  const directLog = nodes.find((node) => node.name === 'LOG: Direct Story Test Case Job Completed');
  const directMark = nodes.find((node) => node.name === 'Mark Direct Story Test Case Job Completed');
  const directReturn = nodes.find((node) => node.name === 'Return Direct Story Test Case Result');
  const upsertMapping = nodes.find((node) => node.name === 'Upsert Story Test Case Mapping');
  if (!normalize || !normalizeExisting || !finalize || !directBuild || !directLog || !directMark || !directReturn || !upsertMapping) throw new Error('Generator workflow missing expected nodes.');
  normalize.parameters.jsCode = normalizeGeneratorRequestCode;
  normalizeExisting.parameters.jsCode = normalizeExistingCode;
  finalize.parameters.jsCode = finalizeCode;
  directBuild.parameters.jsCode = directCompletionCode;
  directLog.parameters.jsonHeaders = '{ "Content-Type": "application/json", "Prefer": "return=representation" }';
  directLog.parameters.jsonBody = directMetricBody;
  directMark.parameters.url = directMarkUrl;
  directMark.parameters.jsonBody = directMarkBody;
  directReturn.parameters.jsCode = returnDirectCode;
  upsertMapping.parameters.jsonBody = upsertMappingBody;
  upsertNode(nodes, existingNeedsUpdateNode);
  upsertNode(nodes, updateExistingNode);
  upsertNode(nodes, normalizeUpdatedExistingNode);
  setConnection(connections, 'Normalize Existing Story Test Case', [[{ node: 'Existing Test Case Needs Update?', type: 'main', index: 0 }]]);
  setConnection(connections, 'Existing Test Case Needs Update?', [
    [{ node: 'Update Existing Jira Test Case', type: 'main', index: 0 }],
    [{ node: 'Upsert Story Test Case Mapping', type: 'main', index: 0 }],
  ]);
  setConnection(connections, 'Update Existing Jira Test Case', [[{ node: 'Normalize Updated Existing Story Test Case', type: 'main', index: 0 }]]);
  setConnection(connections, 'Normalize Updated Existing Story Test Case', [[{ node: 'Upsert Story Test Case Mapping', type: 'main', index: 0 }]]);
  setConnection(connections, 'LOG: Direct Story Test Case Job Completed', [[{ node: 'Mark Direct Story Test Case Job Completed', type: 'main', index: 0 }]]);
  return { nodes, connections };
}

function patchWorker(row) {
  const { nodes, connections } = parseWorkflow(row);
  backup(row, 'story_testcase_worker_completion_passthrough');
  const build = nodes.find((node) => node.name === 'Build Story Test Case Completion Output');
  const log = nodes.find((node) => node.name === 'LOG: Story Test Case Job Completed');
  const mark = nodes.find((node) => node.name === 'Mark Story Test Case Job Completed');
  if (!build || !log || !mark) throw new Error('Worker workflow missing expected nodes.');
  build.parameters.jsCode = workerCompletionCode;
  log.parameters.jsonHeaders = '{ "Content-Type": "application/json", "Prefer": "return=representation" }';
  log.parameters.jsonBody = workerMetricBody;
  mark.parameters.url = workerMarkUrl;
  mark.parameters.jsonBody = workerMarkBody;
  return { nodes, connections };
}

const db = new sqlite3.Database(dbPath);
const patches = [
  [queueWorkflowId, patchQueue],
  [generatorWorkflowId, patchGenerator],
  [workerWorkflowId, patchWorker],
];

let remaining = patches.length;
for (const [workflowId, patch] of patches) {
  db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const result = patch(row);
    saveWorkflow(db, workflowId, result.nodes, result.connections, () => {
      remaining -= 1;
      if (remaining === 0) {
        console.log(JSON.stringify({ patched: patches.map(([id]) => id), timestamp }, null, 2));
        db.close();
      }
    });
  });
}
