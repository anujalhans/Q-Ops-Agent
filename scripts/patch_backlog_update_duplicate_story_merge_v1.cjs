const fs = require('fs');
const path = require('path');
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

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
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

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_duplicate_story_merge_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const validateNode = requireNode(nodes, 'Validate Team Managed Backlog');
    let code = validateNode.parameters.jsCode;

    const functionAnchor = `function mergePreviousStoriesForUpdateMode(epics, context) {
  if (!context.updateMode) return epics;`;
    const functionPatch = `function collapseDuplicateStoriesForUpdateMode(epics, context, generated) {
  const idMap = new Map();
  if (!context.updateMode) return idMap;

  const bySummary = new Map();
  for (const epic of epics) {
    const retainedStories = [];
    epic.stories = Array.isArray(epic.stories) ? epic.stories : [];
    for (const story of epic.stories) {
      const summaryKey = normalizeKey(story.summary);
      if (!summaryKey) {
        retainedStories.push(story);
        continue;
      }

      const existing = bySummary.get(summaryKey);
      if (!existing) {
        bySummary.set(summaryKey, { epic, story });
        retainedStories.push(story);
        continue;
      }

      const keep = existing.story;
      const droppedId = firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.id);
      const keepId = firstText(keep.storyCorrelationId, keep.userStoryId, keep.storyId, keep.id);
      if (droppedId && keepId && normalizeKey(droppedId) !== normalizeKey(keepId)) {
        idMap.set(droppedId, keepId);
      }

      keep.acceptanceCriteria = textList(keep.acceptanceCriteria, story.acceptanceCriteria);
      keep.primaryFlow = textList(keep.primaryFlow, story.primaryFlow);
      keep.alternateFlows = textList(keep.alternateFlows, story.alternateFlows);
      keep.exceptionHandling = textList(keep.exceptionHandling, story.exceptionHandling);
      keep.testScenarios = textList(keep.testScenarios, story.testScenarios);
      keep.sourceReferences = textList(keep.sourceReferences, story.sourceReferences, story.sourceTraceability);
      keep.sourceTraceability = textList(keep.sourceTraceability, story.sourceTraceability, story.sourceReferences);
      keep.testNotes = textList(keep.testNotes, story.testNotes).join(' ');
      keep.action = firstText(keep.action, 'updated');
      keep.updateMergedDuplicate = true;
    }
    epic.stories = retainedStories;
  }

  const rewriteIds = value => textList(value).map(id => idMap.get(id) || id);
  const rewriteRows = rows => {
    if (!Array.isArray(rows)) return;
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      if (row.mappedStoryIds !== undefined) row.mappedStoryIds = rewriteIds(row.mappedStoryIds);
      if (row.storyCorrelationIds !== undefined) row.storyCorrelationIds = rewriteIds(row.storyCorrelationIds);
      if (row.storyIds !== undefined) row.storyIds = rewriteIds(row.storyIds);
      if (row.userStoryIds !== undefined) row.userStoryIds = rewriteIds(row.userStoryIds);
      if (row.stories !== undefined) row.stories = rewriteIds(row.stories);
    }
  };

  if (generated && typeof generated === 'object') {
    if (generated.document && typeof generated.document === 'object') {
      rewriteRows(generated.document.coverageLedger);
    }
    rewriteRows(generated.coverageLedger);
    rewriteRows(generated.backlogCoverageLedger);
  }

  return idMap;
}

function mergePreviousStoriesForUpdateMode(epics, context) {
  if (!context.updateMode) return epics;`;
    if (!code.includes('function collapseDuplicateStoriesForUpdateMode(epics, context, generated)')) {
      if (!code.includes(functionAnchor)) throw new Error('mergePreviousStoriesForUpdateMode anchor not found');
      code = code.replace(functionAnchor, functionPatch);
    }

    const callAnchor = `epics = mergePreviousStoriesForUpdateMode(epics, context);
generated.epics = epics;`;
    const callPatch = `epics = mergePreviousStoriesForUpdateMode(epics, context);
const updateDuplicateStoryIdMap = collapseDuplicateStoriesForUpdateMode(epics, context, generated);
generated.epics = epics;`;
    if (!code.includes('const updateDuplicateStoryIdMap = collapseDuplicateStoriesForUpdateMode(epics, context, generated);')) {
      if (!code.includes(callAnchor)) throw new Error('collapse duplicate story call anchor not found');
      code = code.replace(callAnchor, callPatch);
    }

    const duplicateAnchor = `    if (storySummary && storySummaries.has(storySummary)) fatalErrors.push('Duplicate story summary: ' + story.summary);
    if (storySummary) storySummaries.add(storySummary);`;
    const duplicatePatch = `    if (storySummary && storySummaries.has(storySummary)) {
      if (context.updateMode && story.updateMergedDuplicate) {
        story.validationNote = firstText(story.validationNote, 'Duplicate update story summary merged into existing Jira story for idempotent update.');
      } else {
        fatalErrors.push('Duplicate story summary: ' + story.summary);
      }
    }
    if (storySummary) storySummaries.add(storySummary);`;
    if (!code.includes('Duplicate update story summary merged into existing Jira story for idempotent update.')) {
      if (!code.includes(duplicateAnchor)) throw new Error('duplicate story fatal anchor not found');
      code = code.replace(duplicateAnchor, duplicatePatch);
    }

    new Function(code);
    validateNode.parameters.jsCode = code;

    const connections = row.connections ? parseAny(row.connections) : {};
    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      changes: [
        'Update-mode duplicate story summaries are merged into the retained Jira story before validation',
        'Coverage ledger mappedStoryIds are rewritten from dropped duplicate correlation IDs to retained story IDs',
        'Duplicate story summary remains fatal for create mode and non-merged duplicates'
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
