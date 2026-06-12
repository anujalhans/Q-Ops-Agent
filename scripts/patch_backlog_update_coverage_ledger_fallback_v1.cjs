const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function stamp() {
  const date = new Date();
  const pad = value => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      error ? reject(error) : resolve(this);
    });
  });
}

function parse(value) {
  if (!value) return null;
  if (typeof value === 'string') return JSON.parse(value);
  return value;
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`workflow not found: ${workflowId}`);

    const historyRow = row.activeVersionId
      ? await get(db, 'select nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    const nodes = parse(row.nodes);
    const connections = parse(row.connections) || {};
    if (!Array.isArray(nodes)) throw new Error('workflow nodes are not an array');

    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_coverage_ledger_fallback_v1_${stamp()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow: row, activeHistory: historyRow }, null, 2));

    const validateNode = nodes.find(node => node.name === 'Validate Team Managed Backlog');
    if (!validateNode?.parameters?.jsCode) throw new Error('Validate Team Managed Backlog code node not found');

    let code = validateNode.parameters.jsCode;
    const marker = 'Synthesized from update-mode generated/backlog baseline because the model omitted document.coverageLedger.';
    if (code.includes(marker)) {
      console.log(JSON.stringify({ patched: false, reason: 'fallback already present', backupPath }, null, 2));
      return;
    }

    const anchor = `generated.document.coverageLedger = coverageLedger;
let coverageSummary = summarizeCoverageLedger(coverageLedger);
`;

    const fallback = `if (context.updateMode && !coverageLedger.length) {
  const previousEpics = Array.isArray(context.updateContext?.previousEpics) ? context.updateContext.previousEpics : [];
  const previousStories = Array.isArray(context.updateContext?.previousStories) ? context.updateContext.previousStories : [];
  const generatedStoryPairs = epics.flatMap(epic =>
    (Array.isArray(epic.stories) ? epic.stories : []).map(story => ({ epic, story }))
  );
  const priorEpicByKey = new Map(previousEpics.map(epic => [
    normalizeKey(firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, epic.stableLabel, epic.epicName)),
    epic
  ]).filter(([key]) => key));
  const priorStories = previousStories.map(story => {
    const parentKey = normalizeKey(firstText(story.parentEpicCorrelationId, story.epicCorrelationId, story.parentEpicKey, story.jiraEpicKey, story.epicKey));
    return {
      epic: priorEpicByKey.get(parentKey) || {},
      story
    };
  });
  const fallbackStoryPairs = generatedStoryPairs.length ? generatedStoryPairs : priorStories;
  coverageLedger = fallbackStoryPairs.map(({ epic, story }, index) => {
    const storyId = firstText(story.storyCorrelationId, story.userStoryId, story.storyId, story.jiraStoryKey, story.storyKey, story.stableLabel, 'BACKLOG-STORY-' + (index + 1));
    const epicId = firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, story.parentEpicCorrelationId, story.parentEpicKey, story.jiraEpicKey);
    const traceIds = textList(story.sourceTraceability, story.sourceReferences, story.traceability, epic.sourceTraceability, epic.sourceReferences)
      .filter(value => /^FRD-[A-Z0-9-]+$/i.test(String(value || '').trim()));
    const coverageId = firstText(traceIds[0], storyId);
    return {
      coverageId,
      moduleRequirement: firstText(story.summary, story.storySummary, story.feature, story.userStory, storyId),
      sourceReference: firstText(traceIds[0], story.sourceTraceability, story.sourceReferences, epic.sourceTraceability, epic.sourceReferences, 'Previous Jira backlog baseline'),
      mappedEpicIds: textList(epicId),
      mappedStoryIds: textList(storyId),
      coverageStatus: 'covered',
      notes: '${marker}'
    };
  });
  if (!coverageLedger.length && previousEpics.length) {
    coverageLedger = previousEpics.map((epic, index) => {
      const epicId = firstText(epic.epicCorrelationId, epic.epicId, epic.jiraEpicKey, epic.epicKey, epic.stableLabel, 'BACKLOG-EPIC-' + (index + 1));
      return {
        coverageId: epicId,
        moduleRequirement: firstText(epic.epicName, epic.summary, epic.name, epicId),
        sourceReference: firstText(epic.sourceTraceability, epic.sourceReferences, 'Previous Jira backlog baseline'),
        mappedEpicIds: textList(epicId),
        mappedStoryIds: [],
        coverageStatus: 'covered',
        notes: '${marker}'
      };
    });
  }
}
`;

    if (!code.includes(anchor)) throw new Error('coverage summary anchor not found');
    code = code.replace(anchor, fallback + anchor);
    new Function(code);
    validateNode.parameters.jsCode = code;

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      now,
      workflowId,
    ]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        JSON.stringify(connections),
        now,
        workflowId,
        row.activeVersionId,
      ]);
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      backupPath,
      node: 'Validate Team Managed Backlog',
      change: 'Added update-only coverageLedger fallback from generated stories or previous Jira backlog baseline.',
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
