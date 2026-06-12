const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_story_gap_warning_v1';
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Required node not found: ${name}`);
  return node;
}

function patchQualityGate(node) {
  let code = node.parameters.jsCode;
  const marker = `function buildCoverageBatchSummary(documentType, coverageLedger, coverageSummary) {`;
  const helper = String.raw`
function rtmStoryGapCoverageRows(context) {
  if (documentType !== 'traceability_matrix') return [];
  const missingStories = Array.isArray(context?.storiesWithoutTestCases) ? context.storiesWithoutTestCases : [];
  return missingStories
    .map((story) => {
      const storyKey = String(story?.storyKey || '').trim();
      const summary = String(story?.storySummary || story?.summary || '').trim();
      if (!storyKey && !summary) return null;
      return {
        coverageId: storyKey ? 'STORY-GAP-' + storyKey : 'STORY-GAP',
        moduleRequirement: [storyKey, summary].filter(Boolean).join(' - '),
        sourceReference: 'Current RTM traceability context - storiesWithoutTestCases',
        includedInOutput: 'Needs review',
        coverageStatus: 'missing',
        notes: 'Story has no generated test case links in the current Story Test Case traceability context.'
      };
    })
    .filter(Boolean);
}

function mergeCoverageRowsByKey(rows) {
  const merged = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const normalized = normalizeCoverageRow(row);
    if (!normalized.key) continue;
    merged.set(normalized.key, row);
  }
  return Array.from(merged.values());
}

`;
  if (!code.includes(marker)) throw new Error('Coverage batch summary marker was not found.');
  if (!code.includes('function rtmStoryGapCoverageRows')) {
    code = code.replace(marker, helper + '\n' + marker);
  }

  const oldBlock = String.raw`const rtmCoverageMerge = buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger);
const effectiveCoverageLedger = rtmCoverageMerge.coverageLedger;
if (rtmCoverageMerge.applied) {
  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));
  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\s+/).length : 0;
}`;
  const newBlock = String.raw`const rtmCoverageMerge = buildRtmEffectiveCoverageLedger(documentType, generationMode, updateContext, coverageLedger);
const traceabilityContextForGate = $('Prompt Library').item.json.traceabilityContext || data.traceabilityContext || {};
let effectiveCoverageLedger = mergeCoverageRowsByKey([
  ...(rtmCoverageMerge.coverageLedger || []),
  ...rtmStoryGapCoverageRows(traceabilityContextForGate)
]);
if (rtmCoverageMerge.applied || rtmStoryGapCoverageRows(traceabilityContextForGate).length) {
  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));
  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\s+/).length : 0;
}`;
  if (!code.includes(oldBlock)) throw new Error('RTM effective coverage ledger block was not found.');
  code = code.replace(oldBlock, newBlock);

  node.parameters.jsCode = code;
  new Function(code);
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const connections = JSON.parse(row.connections);
    patchQualityGate(requireNode(nodes, 'Quality Gate'));

    const now = new Date().toISOString();
    const nodesJson = JSON.stringify(nodes);
    const connectionsJson = JSON.stringify(connections);
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [nodesJson, connectionsJson, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, connectionsJson, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, workflowName: row.name, patched: ['Quality Gate'], backupPath }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
