const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'SG7khcKlhHst48WH';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

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
function normalizeCases(source, parsed) {
  const expectedIds = source.planItems.map(plan => plan.testCaseId);
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];
  const planById = new Map(source.planItems.map(plan => [plan.testCaseId.toUpperCase(), plan]));
  const normalized = [];
  const invalidIds = [];
  for (const test of testCases) {
    const id = String(test.testCaseId || '').trim().toUpperCase();
    if (!planById.has(id)) continue;
    const plan = planById.get(id) || {};
    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step => String(step || '').trim()).filter(Boolean) : [];
    if (steps.length < 3 || !String(test.expectedResult || '').trim()) {
      invalidIds.push(id);
      continue;
    }
    normalized.push({ ...plan, ...test, testCaseId: id, summary: String(test.summary || test.title || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testLevel: String(test.testLevel || plan.testLevel || 'UI').trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testType: String(test.testType || plan.testType || 'functional').trim(), priority: String(test.priority || plan.priority || 'Medium').trim(), riskLevel: String(test.riskLevel || plan.riskLevel || 'Medium').trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || 'Medium').trim(), requirementReference: String(test.requirementReference || test.requirement || plan.requirementReference || source.storyKey + ' story details').trim(), objective: String(test.objective || test.intent || plan.coverageIntent || '').trim(), testSteps: steps });
  }
  const returnedIds = new Set(normalized.map(test => test.testCaseId.toUpperCase()));
  const missing = expectedIds.filter(id => !returnedIds.has(id.toUpperCase()));
  return { normalized, missing: Array.from(new Set([...missing, ...invalidIds])) };
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
  const { normalized, missing } = normalizeCases(source, parsed);
  return { parsed: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, missing, rawJson: candidate, tokenOutput: Math.max(1, Math.ceil(candidate.length / 4)), wordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length) };
}
return responseItems.map((item, index) => {
  const source = sourceItems[index] || sourceItems[0] || {};
  try {
    const result = parseBatch(source, item);
    const tokensInput = Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4));
    const tokensOutput = result.tokenOutput;
    const failed = result.missing.length > 0;
    return { json: { ...source, parsedBatch: result.parsed, missingTestCaseIds: result.missing, batchWordCount: result.wordCount, batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: failed, batchParseError: failed ? ('Batch response missing or invalid requested IDs for ' + source.storyKey + ' batch ' + source.batchIndex + ': ' + result.missing.join(', ')) : null } };
  } catch (error) {
    return { json: { ...source, parsedBatch: { storyKey: source.storyKey, batchIndex: source.batchIndex, testCases: [] }, missingTestCaseIds: source.planItems.map(plan => plan.testCaseId), batchParseFailed: true, batchParseError: error.message || String(error) } };
  }
});`;

const prepareRetryCode = String.raw`const NL = String.fromCharCode(10);
function planLine(plan) {
  return [plan.testCaseId, plan.coverageCategory, plan.testLevel, plan.priority, plan.riskLevel, plan.summary, 'Requirement: ' + plan.requirementReference, 'Intent: ' + plan.coverageIntent].join(' | ');
}
return $input.all().map(item => {
  const source = item.json || {};
  const missingIds = Array.isArray(source.missingTestCaseIds) && source.missingTestCaseIds.length
    ? source.missingTestCaseIds.map(id => String(id).toUpperCase())
    : (source.planItems || []).map(plan => String(plan.testCaseId).toUpperCase());
  const retryPlanItems = (source.planItems || []).filter(plan => missingIds.includes(String(plan.testCaseId).toUpperCase()));
  const system = [
    'You are repairing only the missing Jira test cases from a failed batch response.',
    'Return one valid, complete JSON object only. No markdown. No prose outside JSON.',
    'The previous response failed validation: ' + (source.batchParseError || 'unknown parse error'),
    'Generate details only for the exact missing testCaseId values supplied in this retry request.',
    'Do not add new IDs. Do not omit requested IDs.',
    'Keep each item concise so JSON completes successfully.',
    'Every test case must have at least 3 concrete testSteps and a non-empty expectedResult.'
  ].join(NL);
  const user = [
    'Project: ' + source.projectName,
    'Story Key: ' + source.storyKey,
    'Story Summary: ' + source.storySummary,
    'Retry Batch: ' + source.batchIndex + ' of ' + source.batchCount,
    'Missing IDs only: ' + retryPlanItems.map(plan => plan.testCaseId).join(', '),
    '',
    'Story Description:',
    source.storyDescriptionText || 'No Jira description was available.',
    '',
    'Return valid JSON using schema { "storyKey": "...", "batchIndex": number, "testCases": [...] } for these exact missing plan items only:',
    ...retryPlanItems.map(planLine)
  ].join(NL);
  return { json: { ...source, planItems: retryPlanItems, missingTestCaseIds: retryPlanItems.map(plan => plan.testCaseId), system, user, batchRetryAttempt: 1 } };
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
function normalizeCases(source, parsed) {
  const expectedIds = source.planItems.map(plan => plan.testCaseId);
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];
  const planById = new Map(source.planItems.map(plan => [plan.testCaseId.toUpperCase(), plan]));
  const normalized = [];
  const invalidIds = [];
  for (const test of testCases) {
    const id = String(test.testCaseId || '').trim().toUpperCase();
    if (!planById.has(id)) continue;
    const plan = planById.get(id) || {};
    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step => String(step || '').trim()).filter(Boolean) : [];
    if (steps.length < 3 || !String(test.expectedResult || '').trim()) { invalidIds.push(id); continue; }
    normalized.push({ ...plan, ...test, testCaseId: id, summary: String(test.summary || test.title || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testLevel: String(test.testLevel || plan.testLevel || 'UI').trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || 'Functional').trim(), testType: String(test.testType || plan.testType || 'functional').trim(), priority: String(test.priority || plan.priority || 'Medium').trim(), riskLevel: String(test.riskLevel || plan.riskLevel || 'Medium').trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || 'Medium').trim(), requirementReference: String(test.requirementReference || test.requirement || plan.requirementReference || source.storyKey + ' story details').trim(), objective: String(test.objective || test.intent || plan.coverageIntent || '').trim(), testSteps: steps });
  }
  const returnedIds = new Set(normalized.map(test => test.testCaseId.toUpperCase()));
  const missing = expectedIds.filter(id => !returnedIds.has(id.toUpperCase()));
  return { normalized, missing: Array.from(new Set([...missing, ...invalidIds])) };
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
  const { normalized, missing } = normalizeCases(source, parsed);
  if (missing.length) throw new Error('Retry response missing or invalid requested IDs for ' + source.storyKey + ' batch ' + source.batchIndex + ': ' + missing.join(', '));
  const tokensInput = Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4));
  const tokensOutput = Math.max(1, Math.ceil(candidate.length / 4));
  return { json: { ...source, parsedBatch: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, batchWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length), batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: false, batchRetrySucceeded: true } };
});`;

const mergeCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const plannedStories = safeAll('Robust Story Test Case Parser');
const allBatches = safeAll('Build Story Test Case Detail Batches');
const initialParsed = safeAll('Robust Story Test Case Batch Parser');
const retryParsed = safeAll('Robust Story Test Case Batch Retry Parser');
const byBatchKey = new Map();
for (const batch of allBatches) {
  if (!batch.storyKey || !batch.batchIndex) continue;
  byBatchKey.set(batch.storyKey + '|' + batch.batchIndex, { source: batch, testCasesById: new Map(), metrics: [] });
}
for (const item of [...initialParsed, ...retryParsed]) {
  if (!item.storyKey || !item.batchIndex || !item.parsedBatch) continue;
  const key = item.storyKey + '|' + item.batchIndex;
  const bucket = byBatchKey.get(key) || { source: item, testCasesById: new Map(), metrics: [] };
  for (const test of item.parsedBatch.testCases || []) {
    if (test.testCaseId) bucket.testCasesById.set(String(test.testCaseId).toUpperCase(), test);
  }
  bucket.metrics.push(item);
  byBatchKey.set(key, bucket);
}
const incomplete = [];
for (const [key, bucket] of byBatchKey.entries()) {
  const expected = (bucket.source.planItems || []).map(plan => String(plan.testCaseId).toUpperCase());
  const missing = expected.filter(id => !bucket.testCasesById.has(id));
  if (missing.length) incomplete.push(key + ': ' + missing.join(', '));
}
if (incomplete.length) throw new Error('Merged Story Test Case batches are incomplete after retry. ' + incomplete.join(' | '));
return plannedStories.map((story) => {
  const storyBuckets = Array.from(byBatchKey.values()).filter(bucket => bucket.source.storyKey === story.storyKey).sort((a, b) => Number(a.source.batchIndex || 0) - Number(b.source.batchIndex || 0));
  const testCases = storyBuckets.flatMap(bucket => Array.from(bucket.testCasesById.values()).sort((a, b) => String(a.testCaseId).localeCompare(String(b.testCaseId))));
  const seen = new Set();
  const uniqueTestCases = testCases.filter(test => { const key = String(test.testCaseId || '').trim().toUpperCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; });
  const categoryDistribution = uniqueTestCases.reduce((acc, test) => { const key = test.coverageCategory || test.testCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const allMetrics = storyBuckets.flatMap(bucket => bucket.metrics);
  const batchTokensInput = allMetrics.reduce((sum, item) => sum + Number(item.batchTokensInput || 0), 0);
  const batchTokensOutput = allMetrics.reduce((sum, item) => sum + Number(item.batchTokensOutput || 0), 0);
  const batchCost = allMetrics.reduce((sum, item) => sum + Number(item.batchEstimatedCostUsd || 0), 0);
  const batchWordCount = allMetrics.reduce((sum, item) => sum + Number(item.batchWordCount || 0), 0);
  return { json: { ...story, parsed: { storyKey: story.storyKey, storySummary: story.storySummary, testCases: uniqueTestCases }, testCaseCount: uniqueTestCases.length, categoryDistribution, storyWordCount: Number(story.storyWordCount || 0) + batchWordCount, storyTokensInput: Number(story.storyTokensInput || 0) + batchTokensInput, storyTokensOutput: Number(story.storyTokensOutput || 0) + batchTokensOutput, storyEstimatedCostUsd: Number((Number(story.storyEstimatedCostUsd || 0) + batchCost).toFixed(6)) } };
});`;

fs.mkdirSync(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_story_testcase_partial_batch_retry_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));
    const nodes = JSON.parse(row.nodes);
    const patches = {
      'Robust Story Test Case Batch Parser': batchParserCode,
      'Prepare Story Test Case Batch Retry Prompt': prepareRetryCode,
      'Robust Story Test Case Batch Retry Parser': retryParserCode,
      'Merge Story Test Case Batches': mergeCode,
    };
    for (const [name, code] of Object.entries(patches)) {
      const node = nodes.find(item => item.name === name);
      if (!node) throw new Error(`Missing node: ${name}`);
      node.parameters.jsCode = code;
    }
    const nodesJson = JSON.stringify(nodes);
    db.run("update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?", [nodesJson, workflowId], function (updateErr) {
      if (updateErr) throw updateErr;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [workflowId], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) {
          console.log(JSON.stringify({ backupPath, workflowUpdated: this.changes, historyUpdated: 0 }, null, 2));
          db.close();
          return;
        }
        db.run("update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?", [nodesJson, workflowId, historyRow.versionId], function (historyUpdateErr) {
          if (historyUpdateErr) throw historyUpdateErr;
          console.log(JSON.stringify({ backupPath, workflowUpdated: 1, historyUpdated: this.changes, versionId: historyRow.versionId }, null, 2));
          db.close();
        });
      });
    });
  });
});
