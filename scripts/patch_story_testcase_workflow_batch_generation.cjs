const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'SG7khcKlhHst48WH';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

const preparePlanCode = String.raw`const sourceItems = $('Build Story Source Items').all().map(item => item.json || {});
const issueItems = $input.all();
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
function buildSystemMessage() {
  return [
    'You are a Senior QA Test Architect designing complete risk-based test coverage from Jira user stories.',
    'First create a compact coverage plan only. Do not generate detailed steps in this pass.',
    'Return one valid JSON object only. No markdown. No prose outside JSON.',
    'The plan must maximize meaningful coverage without filler or duplicates.',
    'Use distinct categories so test cases remain traceable from a coverage perspective.',
    'Supported coverageCategory values include Positive, Negative, Functional, Smoke, Sanity, Regression, Security, Performance, Network, Accessibility, Boundary, Integration, Data, Resilience, Error Handling, Authorization, Authentication, Usability, Compatibility, Observability.',
    'Use this exact schema:',
    '{',
    '  "storyKey": "KAN-123",',
    '  "storySummary": "Story title",',
    '  "coveragePlan": [',
    '    {',
    '      "testCaseId": "TC-001",',
    '      "summary": "Short Jira-ready test case title",',
    '      "coverageCategory": "Positive",',
    '      "testLevel": "UI | API | SIT | FAT | Regression | Security | Performance | Network | Data | Accessibility",',
    '      "testCategory": "Positive | Negative | Boundary | Edge | Alternate | Exception | Integration | Validation | Resilience",',
    '      "testType": "functional",',
    '      "priority": "High",',
    '      "riskLevel": "High",',
    '      "automationFeasibility": "High",',
    '      "requirementReference": "Acceptance criterion or story detail covered",',
    '      "coverageIntent": "What unique behavior or risk this case covers"',
    '    }',
    '  ]',
    '}',
    'Generate the complete set of useful test cases for this story.',
    'Do not cap the plan at an arbitrary small number.',
    'For simple stories include all essential positive, negative, validation, boundary, smoke, sanity, and regression coverage.',
    'For complex, payment, auth, integration, data-heavy, network-sensitive, or security-sensitive stories include deeper category coverage.',
    'Avoid duplicate test intentions. Each planned item must cover a distinct behavior, role, data state, integration, failure mode, or quality risk.',
    'Use stable sequential testCaseId values from TC-001 onward.'
  ].join(NL);
}

return issueItems.map((item, index) => {
  const source = sourceItems[index] || sourceItems[0] || {};
  const issue = item.json || {};
  const descriptionText = flattenAdf(issue.fields?.description || '').replace(new RegExp(NL + '{3,}', 'g'), NL + NL).trim();
  const storySummary = issue.fields?.summary || source.storySummary || source.storyKey;
  const system = buildSystemMessage();
  const user = ['Project: ' + source.projectName, 'Story Key: ' + source.storyKey, 'Story Summary: ' + storySummary, 'Story Correlation ID: ' + (source.storyCorrelationId || 'N/A'), '', 'Story Description:', descriptionText || 'No Jira description was available. Use the story summary and source context only.', '', 'Create a complete compact test-case coverage plan for this story.'].join(NL);
  return { json: { ...source, storySummary, storyDescriptionText: descriptionText, system, user, planningPass: true } };
});`;

const planParserCode = String.raw`const sourceItems = $('Prepare Story Test Case Prompt').all().map(item => item.json || {});
const responseItems = $input.all();
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
const extractBalancedJsonObject = (source, text) => {
  const firstBrace = text.indexOf('{');
  if (firstBrace < 0) throw new Error('Coverage planner returned no JSON object for story ' + source.storyKey + '. Raw preview: ' + text.slice(0, 500));
  let depth = 0, inString = false, escaped = false;
  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === BACKSLASH) escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }
  }
  throw new Error('Coverage planner returned incomplete JSON for story ' + source.storyKey + '. Output chars=' + text.length);
};
const normalizeId = (value, index) => {
  const raw = String(value || '').trim().toUpperCase();
  const match = raw.match(/TC[-_\s]?(\d+)/);
  return 'TC-' + String(match ? Number(match[1]) : index + 1).padStart(3, '0');
};
const normalizeText = (value, fallback) => String(value || fallback || '').trim();

return responseItems.map((item, index) => {
  const source = sourceItems[index] || sourceItems[0] || {};
  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;
  let text = stringifyRaw(raw);
  if (!text) throw new Error('Coverage planner returned an empty response for story ' + source.storyKey + '.');
  const fence = String.fromCharCode(96, 96, 96);
  const fenceStart = text.indexOf(fence);
  const fenceEnd = text.lastIndexOf(fence);
  if (fenceStart >= 0 && fenceEnd > fenceStart) {
    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);
    if (firstLineEnd >= 0 && fenceEnd > firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();
  }
  const candidate = extractBalancedJsonObject(source, text);
  let parsed;
  try { parsed = JSON.parse(candidate); } catch (error) { throw new Error('Coverage planner JSON parse failed for story ' + source.storyKey + ': ' + error.message + '. Raw preview: ' + candidate.slice(0, 800)); }
  const planRaw = Array.isArray(parsed.coveragePlan) ? parsed.coveragePlan : (Array.isArray(parsed.testCases) ? parsed.testCases : []);
  if (!planRaw.length) throw new Error('Coverage planner returned no coveragePlan items for story ' + source.storyKey + '.');
  const seen = new Set();
  const coveragePlan = planRaw.map((entry, planIndex) => {
    let testCaseId = normalizeId(entry.testCaseId, planIndex);
    while (seen.has(testCaseId)) testCaseId = 'TC-' + String(seen.size + 1).padStart(3, '0');
    seen.add(testCaseId);
    return {
      testCaseId,
      summary: normalizeText(entry.summary, testCaseId + ' for ' + source.storySummary),
      coverageCategory: normalizeText(entry.coverageCategory || entry.category, 'Functional'),
      testLevel: normalizeText(entry.testLevel, 'UI'),
      testCategory: normalizeText(entry.testCategory, entry.coverageCategory || 'Functional'),
      testType: normalizeText(entry.testType, 'functional'),
      priority: normalizeText(entry.priority, 'Medium'),
      riskLevel: normalizeText(entry.riskLevel, 'Medium'),
      automationFeasibility: normalizeText(entry.automationFeasibility, 'Medium'),
      requirementReference: normalizeText(entry.requirementReference, source.storyKey + ' story details'),
      coverageIntent: normalizeText(entry.coverageIntent || entry.objective, entry.summary)
    };
  });
  const categoryDistribution = coveragePlan.reduce((acc, plan) => { const key = plan.coverageCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  return { json: { ...source, parsed: { storyKey: parsed.storyKey || source.storyKey, storySummary: parsed.storySummary || source.storySummary, coveragePlan }, coveragePlan, plannedTestCaseCount: coveragePlan.length, categoryDistribution, storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length), storyTokensInput: Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)), storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)), storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6)) } };
});`;

const buildBatchCode = String.raw`const plannerItems = $input.all().map(item => item.json || {});
const NL = String.fromCharCode(10);
const batchSize = 8;
function buildSystemMessage() {
  return [
    'You are a Senior QA Test Architect expanding an approved coverage plan into Jira-ready test cases.',
    'Return one valid JSON object only. No markdown. No prose outside JSON.',
    'Generate details only for the exact testCaseId values supplied in this batch.',
    'Do not add new IDs. Do not omit requested IDs.',
    'Preserve each supplied coverageCategory, testLevel, testCategory, priority, riskLevel, testType, requirementReference, and automationFeasibility unless the story details clearly require a safer correction.',
    'Use this exact schema:',
    '{',
    '  "storyKey": "KAN-123",',
    '  "batchIndex": 1,',
    '  "testCases": [',
    '    {',
    '      "testCaseId": "TC-001",',
    '      "summary": "Short Jira-ready test case title",',
    '      "objective": "Why this test exists",',
    '      "coverageCategory": "Positive",',
    '      "requirementReference": "Acceptance criterion or story detail covered",',
    '      "testLevel": "UI",',
    '      "testCategory": "Positive",',
    '      "preconditions": ["..."],',
    '      "testSteps": ["Step 1", "Step 2", "Step 3"],',
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
    'Every test case must have at least 3 concrete testSteps and a non-empty expectedResult.',
    'Prefer complete valid JSON over verbosity. Keep each field concise but execution-ready.'
  ].join(NL);
}
function planLine(plan) {
  return [plan.testCaseId, plan.coverageCategory, plan.testLevel, plan.priority, plan.riskLevel, plan.summary, 'Requirement: ' + plan.requirementReference, 'Intent: ' + plan.coverageIntent].join(' | ');
}

return plannerItems.flatMap((source) => {
  const plan = Array.isArray(source.coveragePlan) ? source.coveragePlan : [];
  const batches = [];
  for (let start = 0; start < plan.length; start += batchSize) {
    const planItems = plan.slice(start, start + batchSize);
    const batchIndex = Math.floor(start / batchSize) + 1;
    const batchCount = Math.ceil(plan.length / batchSize);
    const system = buildSystemMessage();
    const user = [
      'Project: ' + source.projectName,
      'Story Key: ' + source.storyKey,
      'Story Summary: ' + source.storySummary,
      'Story Correlation ID: ' + (source.storyCorrelationId || 'N/A'),
      'Batch: ' + batchIndex + ' of ' + batchCount,
      '',
      'Story Description:',
      source.storyDescriptionText || 'No Jira description was available.',
      '',
      'Approved coverage plan slice. Expand these exact IDs only:',
      ...planItems.map(planLine)
    ].join(NL);
    batches.push({ json: { ...source, batchIndex, batchCount, batchStart: start + 1, batchEnd: start + planItems.length, batchSize: planItems.length, planItems, system, user, detailBatch: true } });
  }
  return batches;
});`;

const batchParserCode = String.raw`const sourceItems = $('Build Story Test Case Detail Batches').all().map(item => item.json || {});
const responseItems = $input.all();
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
function extractBalancedJsonObject(source, text) {
  const firstBrace = text.indexOf('{');
  if (firstBrace < 0) throw new Error('No JSON object in batch response for ' + source.storyKey + ' batch ' + source.batchIndex);
  let depth = 0, inString = false, escaped = false;
  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === BACKSLASH) escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }
  }
  throw new Error('Incomplete JSON in batch response for ' + source.storyKey + ' batch ' + source.batchIndex + '. Output chars=' + text.length);
}
function parseBatch(source, item) {
  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;
  let text = stringifyRaw(raw);
  if (!text) throw new Error('Empty batch response for ' + source.storyKey + ' batch ' + source.batchIndex);
  const fence = String.fromCharCode(96, 96, 96);
  const fenceStart = text.indexOf(fence);
  const fenceEnd = text.lastIndexOf(fence);
  if (fenceStart >= 0 && fenceEnd > fenceStart) {
    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);
    if (firstLineEnd >= 0 && fenceEnd > firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();
  }
  const candidate = extractBalancedJsonObject(source, text);
  const parsed = JSON.parse(candidate);
  const expectedIds = source.planItems.map(plan => plan.testCaseId);
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];
  const returnedIds = new Set(testCases.map(test => String(test.testCaseId || '').trim().toUpperCase()));
  const missing = expectedIds.filter(id => !returnedIds.has(id.toUpperCase()));
  if (missing.length) throw new Error('Batch response missing requested IDs for ' + source.storyKey + ' batch ' + source.batchIndex + ': ' + missing.join(', '));
  const planById = new Map(source.planItems.map(plan => [plan.testCaseId.toUpperCase(), plan]));
  const normalized = expectedIds.map((id) => {
    const test = testCases.find(candidateTest => String(candidateTest.testCaseId || '').trim().toUpperCase() === id.toUpperCase()) || {};
    const plan = planById.get(id.toUpperCase()) || {};
    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step => String(step || '').trim()).filter(Boolean) : [];
    if (steps.length < 3) throw new Error('Batch response has fewer than 3 steps for ' + source.storyKey + ' ' + id);
    if (!String(test.expectedResult || '').trim()) throw new Error('Batch response has blank expectedResult for ' + source.storyKey + ' ' + id);
    return { ...plan, ...test, testCaseId: id, summary: String(test.summary || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testLevel: String(test.testLevel || plan.testLevel || 'UI').trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testType: String(test.testType || plan.testType || 'functional').trim(), priority: String(test.priority || plan.priority || 'Medium').trim(), riskLevel: String(test.riskLevel || plan.riskLevel || 'Medium').trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || 'Medium').trim(), requirementReference: String(test.requirementReference || plan.requirementReference || source.storyKey + ' story details').trim(), objective: String(test.objective || plan.coverageIntent || '').trim(), testSteps: steps };
  });
  return { parsed: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, rawJson: candidate, tokenOutput: Math.max(1, Math.ceil(candidate.length / 4)), wordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length) };
}

return responseItems.map((item, index) => {
  const source = sourceItems[index] || sourceItems[0] || {};
  try {
    const result = parseBatch(source, item);
    const tokensInput = Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4));
    const tokensOutput = result.tokenOutput;
    return { json: { ...source, parsedBatch: result.parsed, batchWordCount: result.wordCount, batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: false } };
  } catch (error) {
    return { json: { ...source, batchParseFailed: true, batchParseError: error.message || String(error) } };
  }
});`;

const ifRetryParameters = {
  conditions: {
    combinator: 'and',
    options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
    conditions: [
      {
        leftValue: '={{ $json.batchParseFailed === true }}',
        rightValue: true,
        operator: { type: 'boolean', operation: 'true', singleValue: true },
      },
    ],
  },
};

const prepareRetryCode = String.raw`const NL = String.fromCharCode(10);
function planLine(plan) {
  return [plan.testCaseId, plan.coverageCategory, plan.testLevel, plan.priority, plan.riskLevel, plan.summary, 'Requirement: ' + plan.requirementReference, 'Intent: ' + plan.coverageIntent].join(' | ');
}
return $input.all().map(item => {
  const source = item.json || {};
  const system = [
    'You are repairing a failed Jira test case batch response.',
    'Return one valid, complete JSON object only. No markdown. No prose outside JSON.',
    'The previous response failed validation: ' + (source.batchParseError || 'unknown parse error'),
    'Generate details only for the exact testCaseId values supplied in this batch.',
    'Do not add new IDs. Do not omit requested IDs.',
    'Keep each item concise so JSON completes successfully.',
    'Every test case must have at least 3 concrete testSteps and a non-empty expectedResult.'
  ].join(NL);
  const user = [
    'Project: ' + source.projectName,
    'Story Key: ' + source.storyKey,
    'Story Summary: ' + source.storySummary,
    'Retry Batch: ' + source.batchIndex + ' of ' + source.batchCount,
    '',
    'Story Description:',
    source.storyDescriptionText || 'No Jira description was available.',
    '',
    'Return valid JSON using schema { "storyKey": "...", "batchIndex": number, "testCases": [...] } for these exact plan items:',
    ...source.planItems.map(planLine)
  ].join(NL);
  return { json: { ...source, system, user, batchRetryAttempt: 1 } };
});`;

const retryParserCode = String.raw`const sourceItems = $('Prepare Story Test Case Batch Retry Prompt').all().map(item => item.json || {});
const responseItems = $input.all();
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
function extractBalancedJsonObject(source, text) {
  const firstBrace = text.indexOf('{');
  if (firstBrace < 0) throw new Error('Retry response has no JSON object for ' + source.storyKey + ' batch ' + source.batchIndex);
  let depth = 0, inString = false, escaped = false;
  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === BACKSLASH) escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }
  }
  throw new Error('Retry response still returned incomplete JSON for ' + source.storyKey + ' batch ' + source.batchIndex + '. Output chars=' + text.length);
}
return responseItems.map((item, index) => {
  const source = sourceItems[index] || sourceItems[0] || {};
  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;
  let text = stringifyRaw(raw);
  if (!text) throw new Error('Retry response was empty for ' + source.storyKey + ' batch ' + source.batchIndex);
  const fence = String.fromCharCode(96, 96, 96);
  const fenceStart = text.indexOf(fence);
  const fenceEnd = text.lastIndexOf(fence);
  if (fenceStart >= 0 && fenceEnd > fenceStart) {
    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);
    if (firstLineEnd >= 0 && fenceEnd > firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();
  }
  const candidate = extractBalancedJsonObject(source, text);
  let parsed;
  try { parsed = JSON.parse(candidate); } catch (error) { throw new Error('Retry JSON parse failed for ' + source.storyKey + ' batch ' + source.batchIndex + ': ' + error.message); }
  const expectedIds = source.planItems.map(plan => plan.testCaseId);
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];
  const returnedIds = new Set(testCases.map(test => String(test.testCaseId || '').trim().toUpperCase()));
  const missing = expectedIds.filter(id => !returnedIds.has(id.toUpperCase()));
  if (missing.length) throw new Error('Retry response missing requested IDs for ' + source.storyKey + ' batch ' + source.batchIndex + ': ' + missing.join(', '));
  const planById = new Map(source.planItems.map(plan => [plan.testCaseId.toUpperCase(), plan]));
  const normalized = expectedIds.map(id => {
    const test = testCases.find(candidateTest => String(candidateTest.testCaseId || '').trim().toUpperCase() === id.toUpperCase()) || {};
    const plan = planById.get(id.toUpperCase()) || {};
    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step => String(step || '').trim()).filter(Boolean) : [];
    if (steps.length < 3) throw new Error('Retry response has fewer than 3 steps for ' + source.storyKey + ' ' + id);
    if (!String(test.expectedResult || '').trim()) throw new Error('Retry response has blank expectedResult for ' + source.storyKey + ' ' + id);
    return { ...plan, ...test, testCaseId: id, summary: String(test.summary || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testLevel: String(test.testLevel || plan.testLevel || 'UI').trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testType: String(test.testType || plan.testType || 'functional').trim(), priority: String(test.priority || plan.priority || 'Medium').trim(), riskLevel: String(test.riskLevel || plan.riskLevel || 'Medium').trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || 'Medium').trim(), requirementReference: String(test.requirementReference || plan.requirementReference || source.storyKey + ' story details').trim(), objective: String(test.objective || plan.coverageIntent || '').trim(), testSteps: steps };
  });
  const tokensInput = Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4));
  const tokensOutput = Math.max(1, Math.ceil(candidate.length / 4));
  return { json: { ...source, parsedBatch: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, batchWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length), batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: false, batchRetrySucceeded: true } };
});`;

const mergeBatchesCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const plannedStories = safeAll('Robust Story Test Case Parser');
const allBatches = safeAll('Build Story Test Case Detail Batches');
const initialParsed = safeAll('Robust Story Test Case Batch Parser').filter(item => !item.batchParseFailed);
const retryParsed = safeAll('Robust Story Test Case Batch Retry Parser').filter(item => !item.batchParseFailed);
const byBatchKey = new Map();
for (const item of [...initialParsed, ...retryParsed]) {
  if (!item.storyKey || !item.batchIndex) continue;
  const key = item.storyKey + '|' + item.batchIndex;
  const existing = byBatchKey.get(key);
  if (!existing || item.batchRetrySucceeded) byBatchKey.set(key, item);
}
if (allBatches.length && byBatchKey.size < allBatches.length) return [];

return plannedStories.map((story) => {
  const storyBatches = Array.from(byBatchKey.values())
    .filter(item => item.storyKey === story.storyKey)
    .sort((a, b) => Number(a.batchIndex || 0) - Number(b.batchIndex || 0));
  const testCases = storyBatches.flatMap(item => item.parsedBatch?.testCases || []);
  const expectedCount = Number(story.plannedTestCaseCount || 0);
  if (expectedCount && testCases.length < expectedCount) throw new Error('Merged Story Test Case batches are incomplete for ' + story.storyKey + '. Expected ' + expectedCount + ', got ' + testCases.length + '.');
  const seen = new Set();
  const uniqueTestCases = testCases.filter(test => {
    const key = String(test.testCaseId || '').trim().toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => String(a.testCaseId).localeCompare(String(b.testCaseId)));
  const categoryDistribution = uniqueTestCases.reduce((acc, test) => { const key = test.coverageCategory || test.testCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const batchTokensInput = storyBatches.reduce((sum, item) => sum + Number(item.batchTokensInput || 0), 0);
  const batchTokensOutput = storyBatches.reduce((sum, item) => sum + Number(item.batchTokensOutput || 0), 0);
  const batchCost = storyBatches.reduce((sum, item) => sum + Number(item.batchEstimatedCostUsd || 0), 0);
  const batchWordCount = storyBatches.reduce((sum, item) => sum + Number(item.batchWordCount || 0), 0);
  return { json: { ...story, parsed: { storyKey: story.storyKey, storySummary: story.storySummary, testCases: uniqueTestCases }, testCaseCount: uniqueTestCases.length, categoryDistribution, storyWordCount: Number(story.storyWordCount || 0) + batchWordCount, storyTokensInput: Number(story.storyTokensInput || 0) + batchTokensInput, storyTokensOutput: Number(story.storyTokensOutput || 0) + batchTokensOutput, storyEstimatedCostUsd: Number((Number(story.storyEstimatedCostUsd || 0) + batchCost).toFixed(6)) } };
});`;

const expandCode = String.raw`const sources = $input.all().map((item) => item.json || {});
const normalizeArray = value => Array.isArray(value) ? value.map(v => String(v || '').trim()).filter(Boolean) : (String(value || '').trim() ? [String(value).trim()] : []);
const slugify = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
const unique = values => Array.from(new Set(values.filter(Boolean)));
function adfParagraph(text, strongLabel) { const content = []; if (strongLabel) content.push({ type: 'text', text: strongLabel + ': ', marks: [{ type: 'strong' }] }); if (text) content.push({ type: 'text', text: String(text).slice(0, 12000) }); return { type: 'paragraph', content }; }
function adfHeading(text, level = 3) { return { type: 'heading', attrs: { level }, content: [{ type: 'text', text: String(text).slice(0, 250) }] }; }
function adfBulletList(items) { const normalized = normalizeArray(items); if (!normalized.length) return null; return { type: 'bulletList', content: normalized.map(item => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: item.slice(0, 800) }] }] })) }; }

return sources.flatMap((source) => {
  const parsed = source.parsed || {};
  const storySummary = parsed.storySummary || source.storySummary || source.storyKey;
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];
  return testCases.map((testCase, index) => {
    const generatedTestCaseId = String(testCase.testCaseId || ('TC-' + String(index + 1).padStart(3, '0'))).trim();
    const slotId = generatedTestCaseId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('tc-' + String(index + 1).padStart(3, '0'));
    const summary = String(testCase.summary || ('Test ' + generatedTestCaseId + ' for ' + storySummary)).trim();
    const coverageCategory = String(testCase.coverageCategory || testCase.testCategory || 'Functional').trim();
    const storyIdentity = source.storyCorrelationId || source.storyKey;
    const canonicalStableLabel = [source.idempotencyLabelPrefix || 'qops', 'tc', slugify(storyIdentity), slotId].filter(Boolean).join('-').slice(0, 120);
    const legacyStableLabel = [source.idempotencyLabelPrefix || 'qops', 'tc', slugify(storyIdentity), slugify(generatedTestCaseId), slugify(summary)].filter(Boolean).join('-').slice(0, 120);
    const stableLabel = canonicalStableLabel;
    const allStableLabels = unique([stableLabel, legacyStableLabel]);
    const preconditions = normalizeArray(testCase.preconditions);
    const testSteps = normalizeArray(testCase.testSteps);
    const testData = normalizeArray(testCase.testData);
    const acceptanceCriteriaCovered = normalizeArray(testCase.acceptanceCriteriaCovered);
    const notes = normalizeArray(testCase.notes);
    const requirementReference = String(testCase.requirementReference || (source.storyKey + ' story details')).trim();
    const testLevel = String(testCase.testLevel || 'UI').trim();
    const testCategory = String(testCase.testCategory || coverageCategory || 'Functional').trim();
    const riskLevel = String(testCase.riskLevel || 'Medium').trim();
    const automationFeasibility = String(testCase.automationFeasibility || 'Medium').trim();
    const jiraDescription = { type: 'doc', version: 1, content: [adfHeading('Source Story', 3), adfParagraph(source.storyKey + ' - ' + storySummary), adfParagraph(testCase.objective || '', 'Objective'), adfParagraph(coverageCategory, 'Coverage Category'), adfParagraph(requirementReference, 'Requirement Reference'), adfParagraph(testLevel, 'Test Level'), adfParagraph(testCategory, 'Test Category'), adfParagraph(riskLevel, 'Risk Level'), adfParagraph(automationFeasibility, 'Automation Feasibility'), preconditions.length ? adfHeading('Preconditions', 3) : null, preconditions.length ? adfBulletList(preconditions) : null, testSteps.length ? adfHeading('Test Steps', 3) : null, testSteps.length ? adfBulletList(testSteps.map((step, stepIndex) => (stepIndex + 1) + '. ' + step)) : null, testData.length ? adfHeading('Test Data', 3) : null, testData.length ? adfBulletList(testData) : null, adfHeading('Expected Result', 3), adfParagraph(testCase.expectedResult || 'Expected result not provided by generator.'), acceptanceCriteriaCovered.length ? adfHeading('Acceptance Criteria Covered', 3) : null, acceptanceCriteriaCovered.length ? adfBulletList(acceptanceCriteriaCovered) : null, notes.length ? adfHeading('Notes', 3) : null, notes.length ? adfBulletList(notes) : null, adfHeading('Traceability', 3), adfParagraph(source.storyKey + ' | ' + (source.storyCorrelationId || 'N/A') + ' | Source Job ' + (source.storySourceJobId || 'N/A'))].filter(Boolean) };
    const labels = unique([stableLabel, legacyStableLabel, 'qops-story-test-cases', ('story-' + slugify(source.storyKey)).slice(0, 80), ('category-' + slugify(coverageCategory)).slice(0, 80), ('level-' + slugify(testLevel)).slice(0, 80)]);
    return { json: { ...source, testCaseIndex: index + 1, generatedTestCaseId, testCaseId: generatedTestCaseId, testCaseSummary: summary, coverageCategory, priority: String(testCase.priority || 'Medium'), testType: String(testCase.testType || 'functional'), requirementReference, testLevel, testCategory, riskLevel, automationFeasibility, objective: String(testCase.objective || '').trim(), preconditions, testSteps, testData, expectedResult: String(testCase.expectedResult || '').trim(), acceptanceCriteriaCovered, notes, stableLabel, canonicalStableLabel, legacyStableLabel, allStableLabels, jiraDescription, createIssueBody: { fields: { project: { key: source.jiraProjectKey }, issuetype: { name: source.testCaseIssueTypeName || 'Test Case' }, summary, description: jiraDescription, labels } }, linkIssueBody: { type: { name: 'Relates' }, inwardIssue: { key: source.storyKey }, outwardIssue: { key: '__REPLACE_TEST_CASE_KEY__' }, comment: { body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Linked by Q-Ops Story Test Cases generation.' }] }] } } } } };
  });
});`;

const finalizeCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const createdItems = safeAll('Normalize Created Story Test Case');
const reusedItems = safeAll('Normalize Existing Story Test Case');
const allItems = [...createdItems, ...reusedItems];
const expandedItems = safeAll('Expand Story Test Case Items');
if (expandedItems.length && allItems.length < expandedItems.length) return [];
if (!allItems.length) throw new Error('Story Test Case generator did not produce any reusable or created Jira Test Cases.');
const uniqueItems = [];
const seen = new Set();
for (const item of allItems) {
  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join('|');
  if (!key || seen.has(key)) continue;
  seen.add(key);
  uniqueItems.push(item);
}
const perStoryMetrics = safeAll('Merge Story Test Case Batches');
const storyMap = new Map();
uniqueItems.forEach((item) => { if (!storyMap.has(item.storyKey)) storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: item.storyId, summary: item.storySummary, storyCorrelationId: item.storyCorrelationId, storyLink: item.storyLink }); });
const stories = Array.from(storyMap.values());
const testCases = uniqueItems.map((item) => ({ action: item.action, testcaseKey: item.testcaseKey, testcaseId: item.testcaseId, testcaseSummary: item.testCaseSummary, testcaseLink: item.testcaseLink, storyKey: item.storyKey, storySummary: item.storySummary, stableLabel: item.stableLabel, legacyStableLabel: item.legacyStableLabel || null, coverageCategory: item.coverageCategory || null, priority: item.priority, riskLevel: item.riskLevel, testType: item.testType, testLevel: item.testLevel, testCategory: item.testCategory, automationFeasibility: item.automationFeasibility, requirementReference: item.requirementReference }));
const mappings = uniqueItems.map((item) => ({ storyKey: item.storyKey, storySummary: item.storySummary, testcaseKey: item.testcaseKey, testcaseSummary: item.testCaseSummary, action: item.action, coverageCategory: item.coverageCategory || null }));
const categoryDistribution = testCases.reduce((acc, item) => { const key = item.coverageCategory || item.testCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const first = uniqueItems[0];
return [{ json: { documentType: 'story_test_cases', jobId: first.jobId, projectId: first.projectId, projectName: first.projectName, sourceUserStoryJobId: first.storySourceJobId || null, stories, testCases, mappings, categoryDistribution, jira: { projectKey: first.jiraProjectKey, created: testCases.filter(item => item.action === 'created').length, reused: testCases.filter(item => item.action === 'reused').length }, wordCount, tokensInput, tokensOutput, tokensTotal: tokensInput + tokensOutput, estimatedCostUsd } }];`;

function codeNode(id, name, position, jsCode) {
  return { id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { jsCode } };
}

function agentNode(id, name, position) {
  return {
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.agent',
    typeVersion: 3.1,
    position,
    parameters: {
      promptType: 'define',
      text: '={{ $json.user }}',
      options: { systemMessage: '={{ $json.system }}' },
    },
  };
}

function modelNode(id, name, position, credentials) {
  return {
    id,
    name,
    type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
    typeVersion: 1.3,
    position,
    parameters: {
      model: { __rl: true, value: 'gpt-4.1-mini', mode: 'id', cachedResultName: 'gpt-4.1-mini' },
      builtInTools: {},
      options: { maxTokens: 12000 },
    },
    credentials,
  };
}

function ifNode(id, name, position) {
  return { id, name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position, parameters: ifRetryParameters };
}

function upsertOrAdd(nodes, node) {
  const index = nodes.findIndex(existing => existing.name === node.name);
  if (index >= 0) nodes[index] = { ...nodes[index], ...node, id: nodes[index].id || node.id };
  else nodes.push(node);
}

function patch(nodes, connections) {
  const openAiCredentials = nodes.find(node => node.name === 'OpenAI Chat Model')?.credentials;
  if (!openAiCredentials) throw new Error('OpenAI Chat Model credentials not found');

  nodes.find(node => node.name === 'Prepare Story Test Case Prompt').parameters.jsCode = preparePlanCode;
  nodes.find(node => node.name === 'Robust Story Test Case Parser').parameters.jsCode = planParserCode;
  nodes.find(node => node.name === 'Expand Story Test Case Items').parameters.jsCode = expandCode;
  nodes.find(node => node.name === 'Finalize Story Test Case Result').parameters.jsCode = finalizeCode;

  upsertOrAdd(nodes, codeNode('72b97599-e405-4d8b-a67d-b0ed413eab01', 'Build Story Test Case Detail Batches', [1920, 112], buildBatchCode));
  upsertOrAdd(nodes, agentNode('63eb2462-79d2-45b2-8948-42be03fb9510', 'Story Test Case Batch Generator', [2144, 112]));
  upsertOrAdd(nodes, modelNode('2bbddba7-43af-4a74-a490-ef44dbb1437d', 'OpenAI Chat Model - Batch', [2144, 336], openAiCredentials));
  upsertOrAdd(nodes, codeNode('f7509897-59df-45ca-a3a0-53b984eff6a1', 'Robust Story Test Case Batch Parser', [2368, 112], batchParserCode));
  upsertOrAdd(nodes, ifNode('6cf50361-27cd-4527-84dd-8a754db21e1e', 'Story Test Case Batch Needs Retry?', [2592, 112]));
  upsertOrAdd(nodes, codeNode('ea42c177-f221-4b39-a21e-15dddf84a542', 'Prepare Story Test Case Batch Retry Prompt', [2816, -80], prepareRetryCode));
  upsertOrAdd(nodes, agentNode('7a9d0b36-f1f4-4247-921b-18ed3ad2c57d', 'Story Test Case Batch Retry Generator', [3040, -80]));
  upsertOrAdd(nodes, modelNode('77536173-c6d6-4ef0-8075-8f8771985b65', 'OpenAI Chat Model - Batch Retry', [3040, -304], openAiCredentials));
  upsertOrAdd(nodes, codeNode('17ea3d82-4418-4b6d-87e4-7fc4b402a3c3', 'Robust Story Test Case Batch Retry Parser', [3264, -80], retryParserCode));
  upsertOrAdd(nodes, codeNode('5ff9b6b8-8a3d-4118-a2ef-0a944dbfc438', 'Merge Story Test Case Batches', [3488, 112], mergeBatchesCode));

  const pos = {
    'Expand Story Test Case Items': [3712, 112],
    'Search Existing Test Case By Stable Label': [3936, 112],
    'Test Case Needs Create?': [4160, 112],
    'Create Jira Test Case': [4384, 16],
    'Link Created Test Case To Story': [4608, 16],
    'Normalize Created Story Test Case': [4832, 16],
    'Normalize Existing Story Test Case': [4832, 208],
    'Upsert Story Test Case Mapping': [5056, 112],
    'Finalize Story Test Case Result': [5280, 112],
  };
  for (const [name, position] of Object.entries(pos)) {
    const node = nodes.find(item => item.name === name);
    if (node) node.position = position;
  }

  connections['Robust Story Test Case Parser'] = { main: [[{ node: 'Build Story Test Case Detail Batches', type: 'main', index: 0 }]] };
  connections['Build Story Test Case Detail Batches'] = { main: [[{ node: 'Story Test Case Batch Generator', type: 'main', index: 0 }]] };
  connections['Story Test Case Batch Generator'] = { main: [[{ node: 'Robust Story Test Case Batch Parser', type: 'main', index: 0 }]] };
  connections['OpenAI Chat Model - Batch'] = { ai_languageModel: [[{ node: 'Story Test Case Batch Generator', type: 'ai_languageModel', index: 0 }]] };
  connections['Robust Story Test Case Batch Parser'] = { main: [[{ node: 'Story Test Case Batch Needs Retry?', type: 'main', index: 0 }]] };
  connections['Story Test Case Batch Needs Retry?'] = { main: [[{ node: 'Prepare Story Test Case Batch Retry Prompt', type: 'main', index: 0 }], [{ node: 'Merge Story Test Case Batches', type: 'main', index: 0 }]] };
  connections['Prepare Story Test Case Batch Retry Prompt'] = { main: [[{ node: 'Story Test Case Batch Retry Generator', type: 'main', index: 0 }]] };
  connections['Story Test Case Batch Retry Generator'] = { main: [[{ node: 'Robust Story Test Case Batch Retry Parser', type: 'main', index: 0 }]] };
  connections['OpenAI Chat Model - Batch Retry'] = { ai_languageModel: [[{ node: 'Story Test Case Batch Retry Generator', type: 'ai_languageModel', index: 0 }]] };
  connections['Robust Story Test Case Batch Retry Parser'] = { main: [[{ node: 'Merge Story Test Case Batches', type: 'main', index: 0 }]] };
  connections['Merge Story Test Case Batches'] = { main: [[{ node: 'Expand Story Test Case Items', type: 'main', index: 0 }]] };

  return { nodes, connections };
}

fs.mkdirSync(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_story_testcase_batch_generation_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

    const { nodes, connections } = patch(JSON.parse(row.nodes), JSON.parse(row.connections));
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    db.run(
      "update workflow_entity set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
      [nodesJson, connectionsJson, workflowId],
      function updateWorkflowEntity(updateErr) {
        if (updateErr) throw updateErr;
        db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [workflowId], (historyErr, historyRow) => {
          if (historyErr) throw historyErr;
          if (!historyRow) {
            console.log(JSON.stringify({ backupPath, workflowUpdated: this.changes, historyUpdated: 0 }, null, 2));
            db.close();
            return;
          }
          db.run(
            "update workflow_history set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
            [nodesJson, connectionsJson, workflowId, historyRow.versionId],
            function updateWorkflowHistory(historyUpdateErr) {
              if (historyUpdateErr) throw historyUpdateErr;
              console.log(JSON.stringify({ backupPath, workflowUpdated: 1, historyUpdated: this.changes, versionId: historyRow.versionId, nodeCount: nodes.length }, null, 2));
              db.close();
            },
          );
        });
      },
    );
  });
});
