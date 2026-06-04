const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const backupPath = path.join(backupDir, `workflow_${workflowId}_before_live_update_noop_reuse_${stamp}.json`);

function replaceOnce(text, before, after, label) {
  if (!text.includes(before)) {
    throw new Error(`Could not find ${label}`);
  }
  return text.replace(before, after);
}

const db = new sqlite3.Database(dbPath);

db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error(`Workflow ${workflowId} not found`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

  const nodes = JSON.parse(row.nodes);
  const parser = nodes.find(node => node.name === 'Robust Backlog JSON Parser');
  const validate = nodes.find(node => node.name === 'Validate Team Managed Backlog');
  const liveContext = nodes.find(node => node.name === 'Build Live Update Context');
  if (!parser || !validate || !liveContext) {
    throw new Error('Required backlog nodes were not found');
  }

  liveContext.parameters.jsCode = replaceOnce(
    liveContext.parameters.jsCode,
    `function isEpic(issue) {
  const type = issueType(issue);
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return type === 'epic' || labels.some(label => label.includes('epic'));
}

function isStory(issue) {
  const type = issueType(issue);
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return type === 'story' || type === 'user story' || labels.some(label => label.includes('story'));
}`,
    `function isEpic(issue) {
  const type = issueType(issue);
  if (type) return type === 'epic';
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return labels.some(label => label.includes('epic')) && !labels.some(label => label.includes('story'));
}

function isStory(issue) {
  const type = issueType(issue);
  if (type) return type === 'story' || type === 'user story' || type === 'task';
  const labels = array(issue?.fields?.labels).map(normalizeKey);
  return labels.some(label => label.includes('story'));
}`,
    'live Jira issue type classification'
  );

  parser.parameters.jsCode = replaceOnce(
    parser.parameters.jsCode,
    `const hasItems = value => Array.isArray(value) && value.length > 0;
const hasBacklogShape =
  hasItems(generated.epics) ||
  hasItems(generated.stories) ||
  hasItems(generated.userStories) ||
  hasItems(generated.childStories) ||
  hasItems(generated.features) ||
  hasItems(generated.backlog?.epics) ||
  hasItems(generated.backlog?.stories) ||
  hasItems(generated.backlog?.userStories) ||
  hasItems(generated.backlog?.features);

if (!hasBacklogShape) {
  throw new Error('Backlog parser found JSON but missing usable epics/stories structure. Top-level keys: ' + Object.keys(generated || {}).join(', '));
}`,
    `const hasItems = value => Array.isArray(value) && value.length > 0;
let contextForShape = {};
try { contextForShape = $('Build Live Update Context').first().json || {}; } catch (error) {
  try { contextForShape = $('Check Chroma Retrieval Quality').first().json || {}; } catch (ignored) {}
}
const isUpdateNoop =
  Boolean(contextForShape.updateMode) &&
  generated.document &&
  generated.document.updateSummary &&
  Array.isArray(generated.epics);
const hasBacklogShape =
  hasItems(generated.epics) ||
  hasItems(generated.stories) ||
  hasItems(generated.userStories) ||
  hasItems(generated.childStories) ||
  hasItems(generated.features) ||
  hasItems(generated.backlog?.epics) ||
  hasItems(generated.backlog?.stories) ||
  hasItems(generated.backlog?.userStories) ||
  hasItems(generated.backlog?.features) ||
  isUpdateNoop;

if (!hasBacklogShape) {
  throw new Error('Backlog parser found JSON but missing usable epics/stories structure. Top-level keys: ' + Object.keys(generated || {}).join(', '));
}`,
    'parser update no-op shape guard'
  );

  validate.parameters.jsCode = replaceOnce(
    validate.parameters.jsCode,
    `let context;
try { context = $('Check Chroma Retrieval Quality').first().json; } catch (error) { context = $('Normalize Team Managed Request').first().json; }`,
    `let context;
try { context = $('Build Live Update Context').first().json; } catch (error) {
  try { context = $('Check Chroma Retrieval Quality').first().json; } catch (ignored) {
    context = $('Normalize Team Managed Request').first().json;
  }
}`,
    'validator live update context preference'
  );

  validate.parameters.jsCode = replaceOnce(
    validate.parameters.jsCode,
    `const seenEpicIds = new Set();
epics = epics.filter(epic => {`,
    `if (context.updateMode && epics.length === 0) {
  const previousEpics = previousBacklogEpicsFromUpdateContext(context);
  epics = previousEpics.map((epic, index) => normalizeEpic({
    ...epic,
    epicCorrelationId: firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.key),
    epicId: firstText(epic.epicId, epic.epicCorrelationId, epic.jiraEpicKey, epic.key),
    action: firstText(epic.action, 'reused')
  }, index));
}

const seenEpicIds = new Set();
epics = epics.filter(epic => {`,
    'validator seed previous epics for update no-op'
  );

  const updatedNodes = JSON.stringify(nodes);
  db.run(
    'update workflow_entity set nodes = ?, updatedAt = CURRENT_TIMESTAMP where id = ?',
    [updatedNodes, workflowId],
    updateErr => {
      if (updateErr) throw updateErr;
      console.log(JSON.stringify({
        workflowId,
        patched: true,
        backupPath,
        changes: [
          'Live Jira hydration now trusts Jira issue type before label fallback.',
          'Parser accepts update-mode no-op outputs with an updateSummary and empty epics.',
          'Validator uses live update context and seeds reused epics/stories from Jira when no new items are needed.'
        ]
      }, null, 2));
      db.close();
    }
  );
});
