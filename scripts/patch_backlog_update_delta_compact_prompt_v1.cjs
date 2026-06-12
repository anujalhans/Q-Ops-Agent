const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function patchPromptLibrary(code) {
  let patched = code;

  const marker = "const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];\nconst previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];";
  const replacement = `const previousEpics = Array.isArray(updateContext.previousEpics) ? updateContext.previousEpics : [];
  const previousStories = Array.isArray(updateContext.previousStories) ? updateContext.previousStories : [];
  const compactText = (value, max = 180) => String(value || '').replace(/\\s+/g, ' ').trim().slice(0, max);
  const compactPreviousEpics = previousEpics.map((epic, index) => ({
    key: epic.jiraEpicKey || epic.epicKey || epic.key || null,
    epicCorrelationId: epic.epicCorrelationId || epic.epicId || epic.jiraEpicKey || ('PREV-EPIC-' + (index + 1)),
    epicName: compactText(epic.epicName || epic.summary || epic.name, 120),
    action: 'reuse'
  })).slice(0, 50);
  const compactPreviousStories = previousStories.map((story, index) => ({
    key: story.jiraStoryKey || story.storyKey || story.key || null,
    storyCorrelationId: story.storyCorrelationId || story.userStoryId || story.storyId || story.jiraStoryKey || story.storyKey || ('PREV-STORY-' + (index + 1)),
    parentEpicKey: story.parentEpicKey || story.parentEpicCorrelationId || story.epicCorrelationId || null,
    summary: compactText(story.summary || story.title, 140),
    action: 'reuse'
  })).slice(0, 120);
  const compactCoverageLedger = previousCoverageLedger.map((row, index) => ({
    coverageId: row.coverageId || row.id || ('PREV-COV-' + (index + 1)),
    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),
    coverageStatus: row.coverageStatus || row.status || 'covered'
  })).slice(0, 60);
  const compactUnresolvedCoverage = unresolvedCoverage.map((row, index) => ({
    coverageId: row.coverageId || row.id || ('UNRESOLVED-' + (index + 1)),
    moduleRequirement: compactText(row.moduleRequirement || row.requirement || row.module, 140),
    coverageStatus: row.coverageStatus || row.status || 'review',
    notes: compactText(row.notes || row.reason, 160)
  })).slice(0, 30);
  const deltaChunkLimit = updateMode ? 12 : retrievalContext.length;
  const deltaExcerptLimit = updateMode ? 1000 : 2500;
  const deltaGroupedLimit = updateMode ? 4 : 8;
  const promptRetrievalContext = retrievalContext.slice(0, deltaChunkLimit).map(chunk => ({
    ...chunk,
    excerpt: compactText(chunk.excerpt, deltaExcerptLimit)
  }));
  const promptGroupedEvidence = Object.fromEntries(Object.entries(groupedEvidence)
    .filter(([_, chunks]) => Array.isArray(chunks) && chunks.length)
    .map(([group, chunks]) => [group, chunks.slice(0, deltaGroupedLimit).map(chunk => ({
      ...chunk,
      excerpt: compactText(chunk.excerpt, updateMode ? 450 : 500)
    }))]));`;
  if (!patched.includes(marker)) {
    throw new Error('Prompt library previous snapshot marker not found');
  }
  patched = patched.replace(marker, replacement);

  patched = patched.replace(
    "const retrievalEvidenceText = retrievalContext.map(formatChunk).join('\\n\\n');",
    "const retrievalEvidenceText = (typeof promptRetrievalContext !== 'undefined' ? promptRetrievalContext : retrievalContext).map(formatChunk).join('\\n\\n');",
  );
  patched = patched.replace(
    "const groupedEvidenceText = Object.entries(groupedEvidence)",
    "const groupedEvidenceText = Object.entries(typeof promptGroupedEvidence !== 'undefined' ? promptGroupedEvidence : groupedEvidence)",
  );
  patched = patched.replace(
    ".slice(0, 500)",
    ".slice(0, updateMode ? 450 : 500)",
  );
  patched = patched.replace(
    "JSON.stringify(previousEpics.slice(0, 30))",
    "JSON.stringify(compactPreviousEpics)",
  );
  patched = patched.replace(
    "JSON.stringify(previousStories.slice(0, 80))",
    "JSON.stringify(compactPreviousStories)",
  );
  patched = patched.replace(
    "JSON.stringify(previousCoverageLedger.slice(0, 40))",
    "JSON.stringify(compactCoverageLedger)",
  );
  patched = patched.replace(
    "JSON.stringify(unresolvedCoverage.slice(0, 20))",
    "JSON.stringify(compactUnresolvedCoverage)",
  );
  patched = patched.replace(
    "Update mode is active. Preserve previous correlation IDs and stable labels, reuse unchanged backlog items, and create/update only content needed for unresolved or newly discovered coverage.",
    "Update mode is active. Return only new or materially changed delta epics/stories plus coverage ledger rows for new evidence; do not rewrite unchanged backlog items. Previous live Jira items are merged back by the workflow after parsing.",
  );
  patched = patched.replace(
    "- Multiple epics, each representing one cohesive business capability.",
    "- In create mode: multiple epics, each representing one cohesive business capability. In update mode: only delta epics/stories needed for new or materially changed evidence.",
  );
  patched = patched.replace(
    "- Every epic must contain at least one child story, but the number of stories is adaptive.",
    "- Every returned epic must contain at least one child story, but the number of stories is adaptive.",
  );
  patched = patched.replace(
    "- Build ledger rows from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements found in retrieved evidence.",
    "- In create mode, build ledger rows from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements found in retrieved evidence. In update mode, build ledger rows only for new/changed evidence and unresolved coverage focus.",
  );
  patched = patched.replace(
    "- Plan generation in logical module batches before writing Jira backlog items.",
    "- In create mode, plan generation in logical module batches before writing Jira backlog items. In update mode, plan only the delta modules.",
  );
  patched = patched.replace(
    "'18. In update mode, do not re-plan already-covered modules. Reuse unchanged epics/stories with concise unchanged descriptions, and generate detailed content only for unresolved coverage, new evidence, or missing NFR/quality coverage.',\n      '19. In update mode, the final JSON must still contain the full current backlog: reused existing items plus new/updated delta items. This preserves downstream RTM and Story Test Case context.',\n      '20. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, and unchangedCoverageIds.',\n      '21. Return only valid JSON matching the output parser schema.'",
    "'18. In update mode, do not re-plan or rewrite already-covered modules. Return only new/updated delta epics and stories for new evidence or unresolved coverage.',\n      '19. In update mode, the workflow will merge previous live Jira epics/stories after parsing. Do not include unchanged full descriptions in your JSON response.',\n      '20. In update mode, include document.updateSummary with previousJobId, reusedEpicCount, reusedStoryCount, createdEpicCount, createdStoryCount, updatedEpicCount, updatedStoryCount, resolvedCoverageIds, unchangedCoverageIds, and deltaRequirementIds.',\n      '21. In update mode, keep output compact enough to fit comfortably below the model max tokens. Prefer complete valid JSON over verbose descriptions.',\n      '22. Return only valid JSON matching the output parser schema.'",
  );

  if (!patched.includes('deltaRequirementIds')) {
    throw new Error('Patch verification failed: deltaRequirementIds instruction missing');
  }
  return patched;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, nodes, connections from workflow_history where versionId = ?', [row.activeVersionId])
      : null;
    const stamp = nowStamp();
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_update_delta_compact_prompt_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const promptNode = nodes.find((node) => node.name === 'Professional Prompt Library');
    if (!promptNode?.parameters?.jsCode) throw new Error('Professional Prompt Library node not found');

    const originalCode = promptNode.parameters.jsCode;
    if (originalCode.includes('deltaRequirementIds')) {
      console.log(JSON.stringify({ patched: false, reason: 'already up to date', backupPath }, null, 2));
      return;
    }
    promptNode.parameters.jsCode = patchPromptLibrary(originalCode);

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      now,
      workflowId,
    ]);
    if (historyRow) {
      const historyNodes = JSON.parse(historyRow.nodes);
      const historyPromptNode = historyNodes.find((node) => node.name === 'Professional Prompt Library');
      if (historyPromptNode?.parameters?.jsCode) {
        historyPromptNode.parameters.jsCode = patchPromptLibrary(historyPromptNode.parameters.jsCode);
        await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where versionId = ?', [
          JSON.stringify(historyNodes),
          now,
          historyRow.versionId,
        ]);
      }
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      node: 'Professional Prompt Library',
      backupPath,
      updatedAt: now,
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
