const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try { return JSON.parse(value); }
  catch { return flatted.parse(value); }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(err) {
    err ? reject(err) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => {
    err ? reject(err) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function patchPromptLibrary(code) {
  if (!code.includes('BACKLOG COVERAGE LEDGER REQUIREMENT')) {
    code = code.replace(
      "      '- Keep Jira summaries concise, but make descriptions rich and implementation/test ready.'",
      `      '- Keep Jira summaries concise, but make descriptions rich and implementation/test ready.',
      '',
      'BACKLOG COVERAGE LEDGER REQUIREMENT:',
      '- The JSON must include document.coverageLedger as an array.',
      '- Each coverageLedger item must include coverageId, moduleRequirement, sourceReference, mappedEpicIds, mappedStoryIds, coverageStatus, and notes.',
      '- coverageStatus must be one of: covered, partial, missing, excluded.',
      '- Build ledger rows from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements found in retrieved evidence.',
      '- Do not silently drop source evidence. If an item is intentionally out of scope, mark excluded and explain why.',
      '- If an item is in scope, mappedEpicIds and mappedStoryIds must reference the generated epic/story correlation IDs that cover it.'`
    );

    code = code.replace(
      "      '12. Include document.sourceCoverage and document.retrievalEvidence that cite the retrieved chunks by docType/source/section/chunkId/excerpt.',\n      '13. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',\n      '14. Return only valid JSON matching the output parser schema.'",
      `      '12. Include document.sourceCoverage and document.retrievalEvidence that cite the retrieved chunks by docType/source/section/chunkId/excerpt.',
      '13. Include document.coverageLedger. This is mandatory because the Jira creation quality gate blocks missing or unrecognized coverage before any Jira issues are created.',
      '14. For each coverageLedger row, map in-scope source items to actual generated epic/story correlation IDs. Use excluded only with a clear reason.',
      '15. Keep correlation IDs stable and label-safe for idempotent Jira search/reuse.',
      '16. Return only valid JSON matching the output parser schema.'`
    );
  }

  if (!code.includes('coverageLedgerRequirement:')) {
    code = code.replace(
      "    promptRouting: {\n      route: 'professional_team_managed_backlog',",
      `    coverageLedgerRequirement: {
      enabled: true,
      version: 'backlog-coverage-ledger-v1',
      mode: 'enforced',
      requiredFor: 'user_stories',
      statuses: ['covered', 'partial', 'missing', 'excluded'],
      blockedStatuses: ['missing', 'unknown']
    },
    promptRouting: {
      route: 'professional_team_managed_backlog',`
    );
  }

  return code;
}

function patchValidateBacklog(code) {
  if (code.includes('function normalizeCoverageStatus')) return code;

  code = code.replace(
    `const normalizeArray = value => {
  if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v.trim() : JSON.stringify(v)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};
`,
    `const normalizeArray = value => {
  if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v.trim() : JSON.stringify(v)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

function normalizeCoverageStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('exclude') || raw === 'n/a' || raw === 'not applicable') return 'excluded';
  if (raw.includes('partial') || raw.includes('at risk')) return 'partial';
  if (raw.includes('miss') || raw.includes('gap') || raw.includes('unmapped') || raw.includes('not covered')) return 'missing';
  if (raw.includes('cover') || raw.includes('mapped') || raw.includes('included')) return 'covered';
  return 'unknown';
}

function textList(...values) {
  return [...new Set(values.flatMap(value => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value).split(/[;,]/);
  }).map(value => String(value || '').trim()).filter(Boolean))];
}

function normalizeCoverageLedger(value) {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.values(value)
      : [];

  return rows
    .filter(row => row && typeof row === 'object')
    .map((row, index) => {
      const mappedEpicIds = textList(row.mappedEpicIds, row.epicCorrelationIds, row.epicIds, row.epics, row.epicId, row.epicCorrelationId);
      const mappedStoryIds = textList(row.mappedStoryIds, row.storyCorrelationIds, row.storyIds, row.userStoryIds, row.stories, row.storyId, row.storyCorrelationId);
      return {
        coverageId: firstText(row.coverageId, row.id, row.requirementId, 'BCOV-' + String(index + 1).padStart(3, '0')),
        moduleRequirement: firstText(row.moduleRequirement, row.module, row.requirement, row.capability, row.title, row.name),
        sourceReference: firstText(row.sourceReference, row.source, row.sourceRef, row.sourceRefs, row.evidence),
        mappedEpicIds,
        mappedStoryIds,
        coverageStatus: normalizeCoverageStatus(row.coverageStatus || row.status || row.coverage),
        notes: firstText(row.notes, row.rationale, row.reason, row.exclusionReason)
      };
    })
    .filter(row => row.coverageId || row.moduleRequirement);
}

function summarizeCoverageLedger(coverageLedger) {
  const summary = {
    version: 'backlog-coverage-ledger-v1',
    mode: 'enforced',
    coverageLedgerCount: coverageLedger.length,
    coveredCount: 0,
    partialCount: 0,
    missingCount: 0,
    excludedCount: 0,
    unknownCount: 0,
    uncoveredCount: 0,
    blockingUncoveredCount: 0,
    gateStatus: 'not_reported',
    missingItems: []
  };

  for (const row of coverageLedger) {
    if (row.coverageStatus === 'covered') summary.coveredCount += 1;
    else if (row.coverageStatus === 'partial') summary.partialCount += 1;
    else if (row.coverageStatus === 'missing') summary.missingCount += 1;
    else if (row.coverageStatus === 'excluded') summary.excludedCount += 1;
    else summary.unknownCount += 1;
  }

  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  summary.missingItems = coverageLedger
    .filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus))
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));

  if (!coverageLedger.length) summary.gateStatus = 'failed';
  else if (summary.blockingUncoveredCount > 0) summary.gateStatus = 'failed';
  else if (summary.partialCount > 0) summary.gateStatus = 'warning';
  else summary.gateStatus = 'passed';

  return summary;
}
`
  );

  code = code.replace(
    `generated.document.sourceCoverage = sourceCoverage;
generated.document.retrievalEvidence = retrievalEvidence;
`,
    `generated.document.sourceCoverage = sourceCoverage;
generated.document.retrievalEvidence = retrievalEvidence;

let coverageLedger = normalizeCoverageLedger(generated.document.coverageLedger || generated.coverageLedger || generated.backlogCoverageLedger);
generated.document.coverageLedger = coverageLedger;
let coverageSummary = summarizeCoverageLedger(coverageLedger);
`
  );

  code = code.replace(
    `if (!epics.length) fatalErrors.push('No epics were generated.');

const epicNames = new Set();`,
    `if (!epics.length) fatalErrors.push('No epics were generated.');
if (!coverageLedger.length) {
  fatalErrors.push('Backlog Coverage Gate failed: document.coverageLedger is required before Jira issues can be created.');
}

const epicNames = new Set();`
  );

  code = code.replace(
    `if (!totalStories) fatalErrors.push('No user stories were generated across the backlog.');
if (fatalErrors.length) throw new Error('Backlog quality gate failed: ' + [...new Set(fatalErrors)].join(' | '));
`,
    `const knownEpicIds = new Set(epics.flatMap(epic => [
  epic.epicCorrelationId,
  epic.epicId,
  epic.id,
  epic.key,
  epic.epicName
].map(normalizeKey).filter(Boolean)));
const knownStoryIds = new Set(epics.flatMap(epic => (epic.stories || []).flatMap(story => [
  story.storyCorrelationId,
  story.userStoryId,
  story.storyId,
  story.id,
  story.key,
  story.summary
].map(normalizeKey).filter(Boolean))));

const mappingWarnings = [];
coverageLedger = coverageLedger.map(row => {
  const mappedEpicMatches = row.mappedEpicIds.filter(id => knownEpicIds.has(normalizeKey(id)));
  const mappedStoryMatches = row.mappedStoryIds.filter(id => knownStoryIds.has(normalizeKey(id)));
  const hasMappedOutput = mappedEpicMatches.length > 0 || mappedStoryMatches.length > 0;
  if (row.coverageStatus === 'covered' && !hasMappedOutput) {
    fatalErrors.push('Backlog Coverage Gate failed: covered ledger row ' + row.coverageId + ' has no mapped generated epic/story correlation IDs.');
  }
  if (row.coverageStatus === 'partial' && !hasMappedOutput) {
    mappingWarnings.push(row.coverageId + ' has partial coverage but no mapped generated epic/story correlation IDs.');
  }
  return {
    ...row,
    mappedEpicMatches,
    mappedStoryMatches
  };
});
generated.document.coverageLedger = coverageLedger;
coverageSummary = summarizeCoverageLedger(coverageLedger);
coverageSummary.mappingWarnings = mappingWarnings.slice(0, 25);
coverageSummary.mappingWarningCount = mappingWarnings.length;

if (coverageSummary.blockingUncoveredCount > 0) {
  const examples = coverageSummary.missingItems
    .filter(item => ['missing', 'unknown'].includes(item.coverageStatus))
    .slice(0, 5)
    .map(item => [item.coverageId, item.moduleRequirement, item.coverageStatus].filter(Boolean).join(' - '))
    .join('; ');
  fatalErrors.push('Backlog Coverage Gate failed: ' + coverageSummary.blockingUncoveredCount + ' missing or unrecognized coverage ledger item(s).' + (examples ? ' Examples: ' + examples : ''));
}

if (!totalStories) fatalErrors.push('No user stories were generated across the backlog.');
if (fatalErrors.length) throw new Error('Backlog quality gate failed: ' + [...new Set(fatalErrors)].join(' | '));
`
  );

  code = code.replace(
    `    qualityGate: {
      passed: true,
      status: 'passed',
      jiraProjectType: 'team-managed',
      adaptiveStoryCount: true,
      epicCount: epics.length,
      storyCount: totalStories,
      sourceCoverage,
      retrievalEvidenceCount: retrievalEvidence.length
    }`,
    `    coverageLedger,
    coverageSummary,
    qualityGate: {
      passed: true,
      status: coverageSummary.gateStatus === 'warning' ? 'passed_with_warnings' : 'passed',
      jiraProjectType: 'team-managed',
      adaptiveStoryCount: true,
      epicCount: epics.length,
      storyCount: totalStories,
      sourceCoverage,
      retrievalEvidenceCount: retrievalEvidence.length,
      coverageGate: coverageSummary.gateStatus,
      coverageLedger,
      coverageSummary,
      coverageLedgerCount: coverageSummary.coverageLedgerCount,
      uncoveredCoverageCount: coverageSummary.uncoveredCount,
      blockingUncoveredCoverageCount: coverageSummary.blockingUncoveredCount,
      missingCoverageItems: coverageSummary.missingItems
    }`
  );

  return code;
}

function patchPrepareConfluence(code) {
  if (code.includes('Coverage Gate</h2>')) return code;

  code = code.replace(
    `const title = (root.generated.document?.title || 'Professional QA Backlog') + ' - ' + root.projectName;
const body = '<h1>' + esc(root.generated.document?.title || 'Professional QA Backlog') + '</h1>'`,
    `const title = (root.generated.document?.title || 'Professional QA Backlog') + ' - ' + root.projectName;
const coverageSummary = root.coverageSummary || root.qualityGate?.coverageSummary || {};
const coverageItems = Array.isArray(root.coverageLedger)
  ? root.coverageLedger
  : Array.isArray(root.generated?.document?.coverageLedger)
    ? root.generated.document.coverageLedger
    : [];
const coverageRows = coverageItems.slice(0, 20).map(item =>
  '<tr><td>' + esc(item.coverageId) + '</td><td>' + esc(item.moduleRequirement) + '</td><td>' + esc(item.coverageStatus) + '</td><td>' + esc([...(item.mappedEpicIds || []), ...(item.mappedStoryIds || [])].join(', ')) + '</td><td>' + esc(item.notes) + '</td></tr>'
).join('');
const coverageTable = coverageRows
  ? '<table><tbody><tr><th>Coverage ID</th><th>Module / Requirement</th><th>Status</th><th>Mapped Output</th><th>Notes</th></tr>' + coverageRows + '</tbody></table>'
  : '<p>No coverage ledger rows were available.</p>';
const body = '<h1>' + esc(root.generated.document?.title || 'Professional QA Backlog') + '</h1>'`
  );

  code = code.replace(
    `  + '<h2>Quality Gate</h2><p>Status: <strong>passed</strong> | Adaptive story count: <strong>enabled</strong> | Epics: ' + root.qualityGate.epicCount + ' | Stories: ' + root.qualityGate.storyCount + ' | Jira project type: Team Managed</p>'
  + '<h2>Jira Epics</h2><ul>'`,
    `  + '<h2>Quality Gate</h2><p>Status: <strong>' + esc(root.qualityGate.status || 'passed') + '</strong> | Adaptive story count: <strong>enabled</strong> | Epics: ' + root.qualityGate.epicCount + ' | Stories: ' + root.qualityGate.storyCount + ' | Jira project type: Team Managed</p>'
  + '<h2>Coverage Gate</h2><p>Status: <strong>' + esc(coverageSummary.gateStatus || root.qualityGate.coverageGate || 'not_reported') + '</strong> | Ledger rows: ' + esc(coverageSummary.coverageLedgerCount || 0) + ' | Covered: ' + esc(coverageSummary.coveredCount || 0) + ' | Partial: ' + esc(coverageSummary.partialCount || 0) + ' | Missing: ' + esc(coverageSummary.missingCount || 0) + '</p>' + coverageTable
  + '<h2>Jira Epics</h2><ul>'`
  );

  return code;
}

function patchReturnResult(code) {
  if (code.includes('coverageSummary: root.coverageSummary')) return code;

  return code.replace(
    `generated: root.generated, sourceCoverage: root.qualityGate?.sourceCoverage || [], retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0, retrievalQuality: root.retrievalQuality || null`,
    `generated: root.generated, coverageLedger: root.coverageLedger || root.qualityGate?.coverageLedger || root.generated?.document?.coverageLedger || [], coverageSummary: root.coverageSummary || root.qualityGate?.coverageSummary || null, sourceCoverage: root.qualityGate?.sourceCoverage || [], retrievalEvidenceCount: root.qualityGate?.retrievalEvidenceCount || 0, retrievalQuality: root.retrievalQuality || null`
  );
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_coverage_ledger_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const connections = row.connections ? parseAny(row.connections) : {};

    const prompt = requireNode(nodes, 'Professional Prompt Library');
    const validate = requireNode(nodes, 'Validate Team Managed Backlog');
    const confluence = requireNode(nodes, 'Prepare Confluence Upsert');
    const result = requireNode(nodes, 'Return Team Managed Professional Result');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    validate.parameters.jsCode = patchValidateBacklog(validate.parameters.jsCode);
    confluence.parameters.jsCode = patchPrepareConfluence(confluence.parameters.jsCode);
    result.parameters.jsCode = patchReturnResult(result.parameters.jsCode);

    for (const node of [prompt, validate, confluence, result]) {
      try {
        new Function(node.parameters.jsCode);
      } catch (error) {
        const tmp = path.join(process.cwd(), `tmp_backlog_coverage_${node.name.replace(/[^A-Za-z0-9_-]+/g, '_')}.js`);
        fs.writeFileSync(tmp, node.parameters.jsCode);
        throw new Error(`Code validation failed for ${node.name}: ${error.message}. Wrote ${tmp}`);
      }
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(nodes), JSON.stringify(connections), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({
      patched: workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      added: ['enforced backlog coverage ledger prompt contract', 'pre-Jira coverage quality gate', 'coverage summary in Confluence/result output']
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
