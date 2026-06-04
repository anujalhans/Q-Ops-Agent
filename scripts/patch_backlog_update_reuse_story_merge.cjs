const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'Vwc6c8ehsRTF8svG';
const backupDir = path.join(__dirname, '..', 'docs', 'test_data', 'n8n_workflow_backups');

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
  if (!node.parameters || typeof node.parameters.jsCode !== 'string') {
    throw new Error(`Node does not have jsCode: ${name}`);
  }
  return node;
}

const mergeHelper = `
function previousBacklogStoriesFromUpdateContext(context) {
  const updateContext = context.updateContext && typeof context.updateContext === 'object' ? context.updateContext : {};
  const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
  return previousStories.filter(story => story && typeof story === 'object');
}

function previousBacklogEpicsFromUpdateContext(context) {
  const updateContext = context.updateContext && typeof context.updateContext === 'object' ? context.updateContext : {};
  const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
  return previousEpics.filter(epic => epic && typeof epic === 'object');
}

function mergePreviousStoriesForUpdateMode(epics, context) {
  if (!context.updateMode) return epics;
  const previousStories = previousBacklogStoriesFromUpdateContext(context);
  if (!previousStories.length) return epics;

  const previousEpics = previousBacklogEpicsFromUpdateContext(context);
  const epicByCorrelation = new Map();
  const epicByJiraKey = new Map();
  const epicByStableLabel = new Map();

  for (const epic of epics) {
    const correlation = normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.id));
    const jiraKey = normalizeKey(firstText(epic.jiraEpicKey, epic.epicKey, epic.key));
    const stable = normalizeKey(firstText(epic.stableLabel));
    if (correlation) epicByCorrelation.set(correlation, epic);
    if (jiraKey) epicByJiraKey.set(jiraKey, epic);
    if (stable) epicByStableLabel.set(stable, epic);
  }

  const enrichEpicFromSnapshot = (epic, snapshot) => {
    if (!snapshot) return;
    epic.jiraEpicKey = firstText(epic.jiraEpicKey, snapshot.jiraEpicKey, snapshot.epicKey, snapshot.key);
    epic.jiraEpicId = firstText(epic.jiraEpicId, snapshot.jiraEpicId, snapshot.epicId, snapshot.id);
    epic.stableLabel = firstText(epic.stableLabel, snapshot.stableLabel);
    epic.epicSummary = firstText(epic.epicSummary, snapshot.epicSummary, snapshot.summary);
    epic.businessOutcome = firstText(epic.businessOutcome, snapshot.businessOutcome, snapshot.businessObjective);
    epic.sourceReferences = textList(epic.sourceReferences, snapshot.sourceReferences, snapshot.sourceTraceability);
  };

  for (const epic of epics) {
    const match = previousEpics.find(snapshot => {
      const snapshotCorrelation = normalizeKey(firstText(snapshot.epicCorrelationId, snapshot.epicId, snapshot.id));
      const snapshotKey = normalizeKey(firstText(snapshot.jiraEpicKey, snapshot.epicKey, snapshot.key));
      const snapshotStable = normalizeKey(firstText(snapshot.stableLabel));
      return (
        (snapshotCorrelation && snapshotCorrelation === normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.id))) ||
        (snapshotKey && snapshotKey === normalizeKey(firstText(epic.jiraEpicKey, epic.epicKey, epic.key))) ||
        (snapshotStable && snapshotStable === normalizeKey(firstText(epic.stableLabel)))
      );
    });
    enrichEpicFromSnapshot(epic, match);
  }

  const existingStoryKeys = new Set();
  for (const epic of epics) {
    epic.stories = Array.isArray(epic.stories) ? epic.stories : [];
    for (const story of epic.stories) {
      const key = normalizeKey(firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.id, story.jiraStoryKey, story.storyKey, story.stableLabel));
      if (key) existingStoryKeys.add(key);
    }
  }

  const findTargetEpic = (story) => {
    const parentCorrelation = normalizeKey(firstText(story.parentEpicCorrelationId, story.epicCorrelationId, story.epicId, story.parentEpicId));
    const parentKey = normalizeKey(firstText(story.parentEpicKey, story.jiraEpicKey, story.epicKey));
    const parentStable = normalizeKey(firstText(story.parentEpicStableLabel, story.epicStableLabel));
    return epicByCorrelation.get(parentCorrelation) || epicByJiraKey.get(parentKey) || epicByStableLabel.get(parentStable) || null;
  };

  for (const rawStory of previousStories) {
    const storyKey = normalizeKey(firstText(rawStory.storyCorrelationId, rawStory.userStoryId, rawStory.storyId, rawStory.id, rawStory.jiraStoryKey, rawStory.storyKey, rawStory.stableLabel));
    if (storyKey && existingStoryKeys.has(storyKey)) continue;
    const targetEpic = findTargetEpic(rawStory);
    if (!targetEpic) continue;
    const story = normalizeStory(rawStory, targetEpic, targetEpic.stories.length);
    story.jiraStoryKey = firstText(story.jiraStoryKey, rawStory.jiraStoryKey, rawStory.storyKey, rawStory.key);
    story.jiraStoryId = firstText(story.jiraStoryId, rawStory.jiraStoryId, rawStory.storyId, rawStory.id);
    story.stableLabel = firstText(story.stableLabel, rawStory.stableLabel);
    story.action = firstText(story.action, rawStory.action, 'reused');
    story.acceptanceCriteria = textList(story.acceptanceCriteria, rawStory.acceptanceCriteria, rawStory.acceptance_criteria);
    story.sourceReferences = textList(story.sourceReferences, rawStory.sourceReferences, rawStory.sourceTraceability, targetEpic.sourceReferences);
    targetEpic.stories.push(story);
    if (storyKey) existingStoryKeys.add(storyKey);
  }

  return epics;
}
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_update_reuse_story_merge_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const validate = requireNode(nodes, 'Validate Team Managed Backlog');
    let code = validate.parameters.jsCode;

    if (!code.includes('function mergePreviousStoriesForUpdateMode')) {
      code = code.replace(
        `function normalizeBatchPlan(value, coverageLedger) {`,
        `${mergeHelper}\nfunction normalizeBatchPlan(value, coverageLedger) {`
      );
    }

    if (!code.includes('generated.epics = mergePreviousStoriesForUpdateMode')) {
      code = code.replace(
        `generated.epics = epics;\nconst fatalErrors = [];`,
        `epics = mergePreviousStoriesForUpdateMode(epics, context);\ngenerated.epics = epics;\nif (context.updateMode && !generated.document.updateSummary) {\n  const updateContext = context.updateContext && typeof context.updateContext === 'object' ? context.updateContext : {};\n  generated.document.updateSummary = {\n    previousJobId: updateContext.previousJobId || context.updateOfJobId || null,\n    reusedEpicCount: previousBacklogEpicsFromUpdateContext(context).length,\n    reusedStoryCount: previousBacklogStoriesFromUpdateContext(context).length,\n    createdEpicCount: 0,\n    createdStoryCount: 0,\n    updatedEpicCount: 0,\n    updatedStoryCount: 0,\n    note: 'Previous backlog snapshot merged for update-mode validation and Jira reuse.'\n  };\n}\nconst fatalErrors = [];`
      );
    }

    new Function(code);
    validate.parameters.jsCode = code;

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), row.connections, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), row.connections, now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      backupPath,
      change: 'Validate Team Managed Backlog merges previous stories during update mode when unchanged children are omitted by the model.'
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
