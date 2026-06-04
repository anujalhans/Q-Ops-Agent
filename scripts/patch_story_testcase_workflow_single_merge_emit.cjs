const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'SG7khcKlhHst48WH';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

const mergeCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const currentInput = $input.all().map(item => item.json || {});
const plannedStories = safeAll('Robust Story Test Case Parser');
const allBatches = safeAll('Build Story Test Case Detail Batches');
const initialParsed = safeAll('Robust Story Test Case Batch Parser');
const retryParsed = safeAll('Robust Story Test Case Batch Retry Parser');
const failedInitialBatches = initialParsed.filter(item => item.batchParseFailed);
const currentHasRetryResult = currentInput.some(item => item.batchRetrySucceeded);
if (failedInitialBatches.length && !currentHasRetryResult) return [];

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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_story_testcase_single_merge_emit_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));
    const nodes = JSON.parse(row.nodes);
    const node = nodes.find(item => item.name === 'Merge Story Test Case Batches');
    if (!node) throw new Error('Missing node: Merge Story Test Case Batches');
    node.parameters.jsCode = mergeCode;
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
