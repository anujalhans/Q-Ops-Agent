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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_delta_validator_shape_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const validateNode = requireNode(nodes, 'Validate Team Managed Backlog');
    let code = validateNode.parameters.jsCode;

    const helperAnchor = `const storyEpicKeys = story => [
  story.epicCorrelationId,
  story.epicId,
  story.parentEpicId,
  story.parentEpicCorrelationId,
  story.epicName,
  story.epic,
  story.feature,
  story.module,
  story.domain
].map(normalizeKey).filter(Boolean);
`;
    const helperPatch = `${helperAnchor}
const traceabilityTokens = value => textList(
  value?.sourceTraceability,
  value?.sourceReferences,
  value?.traceability,
  value?.requirementIds,
  value?.requirements,
  value?.coverageIds
).map(normalizeKey).filter(Boolean);

const hasTraceabilityOverlap = (story, epic) => {
  const storyTokens = new Set(traceabilityTokens(story));
  if (!storyTokens.size) return false;
  return traceabilityTokens(epic).some(token => storyTokens.has(token));
};

const textMatchScore = (story, epic) => {
  const storyText = normalizeKey(firstText(story.feature, story.summary, story.userStory, story.module, story.domain));
  const epicText = normalizeKey(firstText(epic.epicName, epic.epicSummary, epic.feature, epic.summary));
  if (!storyText || !epicText) return 0;
  if (storyText === epicText) return 4;
  if (storyText.includes(epicText) || epicText.includes(storyText)) return 3;
  const storyWords = new Set(storyText.match(/[a-z0-9]{4,}/g) || []);
  const epicWords = new Set(epicText.match(/[a-z0-9]{4,}/g) || []);
  let overlap = 0;
  for (const word of storyWords) if (epicWords.has(word)) overlap += 1;
  return overlap;
};
`;
    if (!code.includes('const traceabilityTokens = value => textList(')) {
      if (!code.includes(helperAnchor)) throw new Error('storyEpicKeys helper anchor not found');
      code = code.replace(helperAnchor, helperPatch);
    }

    const targetAnchor = `  if (!targetEpic && epics.length === 1) targetEpic = epics[0];
`;
    const targetPatch = `  if (!targetEpic) {
    targetEpic = epics.find(epic => hasTraceabilityOverlap(rawStory, epic));
  }

  if (!targetEpic) {
    const scored = epics
      .map(epic => ({ epic, score: textMatchScore(rawStory, epic) }))
      .filter(item => item.score >= 2)
      .sort((a, b) => b.score - a.score);
    if (scored.length) targetEpic = scored[0].epic;
  }

  if (!targetEpic && epics.length === 1) targetEpic = epics[0];
`;
    if (!code.includes('targetEpic = epics.find(epic => hasTraceabilityOverlap(rawStory, epic));')) {
      if (!code.includes(targetAnchor)) throw new Error('target epic fallback anchor not found');
      code = code.replace(targetAnchor, targetPatch);
    }

    const groupEpicAnchor = `  const epic = normalizeEpic({
    epicName: group.name,
    epicSummary: 'Generated from top-level user stories returned by the backlog model.',
    businessOutcome: 'Create a Jira-ready backlog from retrieved project evidence.'
  }, epics.length);
  epic.stories = group.stories.map((story, storyIndex) => normalizeStory(story, epic, storyIndex));
  epics.push(epic);
}
`;
    const groupEpicPatch = `  const groupSourceReferences = textList(...group.stories.map(story => textList(story.sourceReferences, story.sourceTraceability, story.traceability)));
  const epic = normalizeEpic({
    epicName: group.name,
    epicSummary: 'Generated from top-level user stories returned by the backlog model.',
    businessOutcome: 'Create a Jira-ready backlog from retrieved project evidence.',
    sourceReferences: groupSourceReferences,
    sourceTraceability: groupSourceReferences
  }, epics.length);
  epic.stories = group.stories.map((story, storyIndex) => normalizeStory(story, epic, storyIndex));
  epics.push(epic);
}
`;
    if (!code.includes('const groupSourceReferences = textList(...group.stories.map')) {
      if (!code.includes(groupEpicAnchor)) throw new Error('unmatched story group anchor not found');
      code = code.replace(groupEpicAnchor, groupEpicPatch);
    }

    const coverageAnchor = `let coverageLedger = normalizeCoverageLedger(generated.document.coverageLedger || generated.coverageLedger || generated.backlogCoverageLedger);
generated.document.coverageLedger = coverageLedger;
let coverageSummary = summarizeCoverageLedger(coverageLedger);
`;
    const coveragePatch = `let coverageLedger = normalizeCoverageLedger(generated.document.coverageLedger || generated.coverageLedger || generated.backlogCoverageLedger);
if (context.updateMode && !coverageLedger.length) {
  const expectedIds = textList(
    context.updateDeltaTargets?.requirementIds,
    context.request?.updateDeltaTargets?.requirementIds,
    context.updateContext?.updateDeltaTargets?.requirementIds,
    context.updateContext?.expectedDeltaRequirementIds
  );
  const allGeneratedStories = epics.flatMap(epic => (Array.isArray(epic.stories) ? epic.stories : []).map(story => ({ epic, story })));
  const requirementIds = [...new Set([
    ...expectedIds,
    ...epics.flatMap(epic => textList(epic.sourceTraceability, epic.sourceReferences)),
    ...allGeneratedStories.flatMap(({ story }) => textList(story.sourceTraceability, story.sourceReferences))
  ].filter(value => /^FRD-[A-Z0-9-]+$/i.test(String(value || '').trim())))];
  coverageLedger = requirementIds.map((requirementId, index) => {
    const normalizedRequirement = normalizeKey(requirementId);
    const mappedEpics = epics
      .filter(epic => traceabilityTokens(epic).includes(normalizedRequirement))
      .map(epic => firstText(epic.epicCorrelationId, epic.epicId))
      .filter(Boolean);
    const mappedStories = allGeneratedStories
      .filter(({ story }) => traceabilityTokens(story).includes(normalizedRequirement))
      .map(({ story }) => firstText(story.storyCorrelationId, story.userStoryId))
      .filter(Boolean);
    return {
      coverageId: requirementId,
      moduleRequirement: requirementId,
      sourceReference: requirementId,
      mappedEpicIds: [...new Set(mappedEpics)],
      mappedStoryIds: [...new Set(mappedStories)],
      coverageStatus: mappedEpics.length || mappedStories.length ? 'covered' : 'partial',
      notes: mappedEpics.length || mappedStories.length
        ? 'Delta requirement mapped from update-mode source traceability.'
        : 'Delta requirement was expected but not mapped by the model output.'
    };
  });
}
generated.document.coverageLedger = coverageLedger;
let coverageSummary = summarizeCoverageLedger(coverageLedger);
`;
    if (!code.includes('Delta requirement mapped from update-mode source traceability.')) {
      if (!code.includes(coverageAnchor)) throw new Error('coverage ledger anchor not found');
      code = code.replace(coverageAnchor, coveragePatch);
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
        'Update-mode top-level stories can now attach to epics by source traceability overlap',
        'Top-level stories can fall back to conservative lexical matching when no explicit parent field is present',
        'Unmatched story group epics inherit source references from their child stories',
        'Update-mode output can synthesize a coverage ledger from delta requirement traceability when the model omits document.coverageLedger'
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
