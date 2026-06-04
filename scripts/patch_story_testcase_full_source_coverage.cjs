const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const buildStorySourceItemsCode = String.raw`const request = $('Normalize Story Test Case Request').first().json;
const rows = $input.all().map(item => item.json || {});
const normalizedProjectName = String(request.projectName || '').trim().toLowerCase();
const matchingJob = rows.find((row) => {
  const rowProjectId = String(row.project_id || '').trim();
  const rowProjectName = String(row.input?.projectName || row.input?.project_name || '').trim().toLowerCase();
  if (request.projectId && rowProjectId) return rowProjectId === String(request.projectId);
  return rowProjectName === normalizedProjectName;
});
if (!matchingJob) throw new Error('No completed Epics & User Stories generation job was found for project=' + request.projectName + '. Generate Epics & User Stories first, then retry Story Test Cases.');

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function storyKeyOf(story) {
  return String(story?.storyKey || story?.key || story?.issueKey || story?.jiraKey || '').trim();
}

function normalizeStory(story, sourceName) {
  const storyKey = storyKeyOf(story);
  if (!storyKey) return null;
  return {
    storyKey,
    storyId: story.storyId || story.id || story.issueId || '',
    storySummary: story.summary || story.storySummary || story.title || '',
    storyCorrelationId: story.storyCorrelationId || story.userStoryId || story.correlationId || '',
    storyStableLabel: story.stableLabel || '',
    storySelf: story.storySelf || story.self || '',
    storySource: sourceName,
  };
}

const storySources = [
  ...asArray(matchingJob.output?.stories).map(story => normalizeStory(story, 'output.stories')),
  ...asArray(matchingJob.output?.jira?.stories).map(story => normalizeStory(story, 'output.jira.stories')),
  ...asArray(matchingJob.output?.generated?.stories).map(story => normalizeStory(story, 'output.generated.stories')),
  ...asArray(matchingJob.output?.generated?.jira?.stories).map(story => normalizeStory(story, 'output.generated.jira.stories')),
  ...asArray(matchingJob.output?.backlog?.stories).map(story => normalizeStory(story, 'output.backlog.stories')),
].filter(Boolean);

const byStoryKey = new Map();
for (const story of storySources) {
  const existing = byStoryKey.get(story.storyKey) || {};
  byStoryKey.set(story.storyKey, {
    ...existing,
    ...story,
    storyId: existing.storyId || story.storyId,
    storySummary: existing.storySummary || story.storySummary,
    storyCorrelationId: existing.storyCorrelationId || story.storyCorrelationId,
    storyStableLabel: existing.storyStableLabel || story.storyStableLabel,
    storySelf: existing.storySelf || story.storySelf,
    storySource: [existing.storySource, story.storySource].filter(Boolean).join(', '),
  });
}

const storySourceJobId = matchingJob.job_id || null;
const stories = Array.from(byStoryKey.values()).sort((left, right) => left.storyKey.localeCompare(right.storyKey, undefined, { numeric: true }));
if (!stories.length) throw new Error('The latest Epics & User Stories job for project=' + request.projectName + ' does not contain Jira story references. Story Test Cases cannot be created until user stories exist in Jira.');

return stories.map((story, index) => ({
  json: {
    ...request,
    storySourceJobId,
    storySourceCount: stories.length,
    storyIndex: index + 1,
    totalStories: stories.length,
    storyKey: story.storyKey,
    storyId: story.storyId,
    storySummary: story.storySummary,
    storyCorrelationId: story.storyCorrelationId,
    storyStableLabel: story.storyStableLabel,
    storySelf: story.storySelf,
    storySource: story.storySource,
    storyLink: story.storyKey ? request.jiraBaseUrl + '/browse/' + story.storyKey : null,
  }
}));`;

function backup(row) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(
    path.join(backupDir, `workflow_${row.id}_before_story_testcase_full_source_coverage_${timestamp}.json`),
    JSON.stringify(row, null, 2),
  );
}

function patchFinalizeCode(jsCode) {
  const before = "const storyMap = new Map();\nuniqueItems.forEach((item) => { if (!storyMap.has(item.storyKey)) storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: item.storyId, summary: item.storySummary, storyCorrelationId: item.storyCorrelationId, storyLink: item.storyLink }); });\nconst stories = Array.from(storyMap.values());";
  const after = "const storyMap = new Map();\nsourceStoryItems.forEach((story) => { if (story.storyKey && !storyMap.has(story.storyKey)) storyMap.set(story.storyKey, { storyKey: story.storyKey, storyId: story.storyId, summary: story.storySummary || story.summary, storyCorrelationId: story.storyCorrelationId, storyLink: story.storyLink }); });\nuniqueItems.forEach((item) => {\n  if (!item.storyKey) return;\n  const existing = storyMap.get(item.storyKey) || {};\n  storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: existing.storyId || item.storyId, summary: existing.summary || item.storySummary, storyCorrelationId: existing.storyCorrelationId || item.storyCorrelationId, storyLink: existing.storyLink || item.storyLink });\n});\nconst stories = Array.from(storyMap.values()).sort((left, right) => String(left.storyKey || '').localeCompare(String(right.storyKey || ''), undefined, { numeric: true }));";
  if (!jsCode.includes(before)) {
    throw new Error('Finalize Story Test Case Result code did not contain the expected storyMap block.');
  }
  return jsCode.replace(before, after);
}

const db = new sqlite3.Database(dbPath);
db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error('Workflow not found: ' + workflowId);
  backup(row);

  const nodes = JSON.parse(row.nodes);
  const sourceNode = nodes.find((node) => node.name === 'Build Story Source Items');
  const finalizeNode = nodes.find((node) => node.name === 'Finalize Story Test Case Result');
  if (!sourceNode || !finalizeNode) throw new Error('Story Test Cases workflow missing expected source/finalize nodes.');

  sourceNode.parameters.jsCode = buildStorySourceItemsCode;
  finalizeNode.parameters.jsCode = patchFinalizeCode(finalizeNode.parameters.jsCode || '');

  const saveNodes = JSON.stringify(nodes);
  db.run(
    "update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
    [saveNodes, workflowId],
    (updateErr) => {
      if (updateErr) throw updateErr;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [workflowId], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) {
          console.log('Patched Story Test Cases workflow source-story coverage.');
          db.close();
          return;
        }
        db.run(
          "update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
          [saveNodes, workflowId, historyRow.versionId],
          (historyUpdateErr) => {
            if (historyUpdateErr) throw historyUpdateErr;
            console.log('Patched Story Test Cases workflow source-story coverage.');
            db.close();
          },
        );
      });
    },
  );
});
