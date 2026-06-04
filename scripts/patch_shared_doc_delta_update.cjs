const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try { return JSON.parse(value); } catch { return flatted.parse(value); }
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

function insertAfter(code, marker, addition) {
  const index = code.indexOf(marker);
  if (index < 0) throw new Error(`Marker not found: ${marker.slice(0, 120)}`);
  return code.slice(0, index + marker.length) + addition + code.slice(index + marker.length);
}

function replaceOnce(code, search, replacement) {
  if (!code.includes(search)) throw new Error(`Search text not found: ${search.slice(0, 120)}`);
  return code.replace(search, replacement);
}

const sharedDeltaPromptHelper = `

function buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, profile) {
  const sharedTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);
  if (!sharedTypes.has(type) || generationMode !== 'update') return '';
  const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons : [];
  const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
  const previousUpdateSummary = updateContext.previousUpdateSummary || {};
  const previousTokenUsage = updateContext.previousTokenUsage || {};
  const sectionHints = {
    test_strategy: ['Introduction & Context', 'Testing Scope', 'Strategic Testing Approach', 'Automation Strategy & Roadmap', 'Quality Metrics & Reporting', 'Risk-Based Testing & Mitigation Strategy', 'Coverage Ledger'],
    test_plan: ['Scope', 'Test Objectives', 'Entry and Exit Criteria', 'Risks, Mitigation & Contingency Plan', 'Test Environment', 'Test Data and Configurations', 'Automation Coverage Matrix', 'Coverage Ledger'],
    risk_matrix: ['Executive Summary', 'Risk Register Summary', 'Risk Detail Register', 'Risk Heat Map Summary', 'Top Critical Risks Analysis', 'Linkage to Test Strategy Alignment', 'Coverage Ledger']
  };
  const compactContext = {
    previousJobId: updateContext.previousJobId || null,
    previousDocumentType: updateContext.previousDocumentType || null,
    previousConfluencePageId: updateContext.previousConfluencePageId || null,
    previousConfluenceUrl: updateContext.previousConfluenceUrl || null,
    previousCreatedAt: updateContext.previousCreatedAt || null,
    updateReasons,
    contextUpdated: Boolean(updateContext.contextUpdated),
    previousCoverageRows: previousCoverageLedger.length,
    previousCoverageSummary: updateContext.previousCoverageSummary || {},
    previousUpdateSummary,
    previousTokenUsage,
    likelyImpactedSections: sectionHints[type] || [],
    retrievalProfile: profile?.label || type
  };

  return [
    '==============================',
    'SHARED_DELTA_UPDATE_V1',
    '==============================',
    '',
    'This is an update of an existing shared QA deliverable, not a fresh create.',
    'Optimize for quality and cost: focus new reasoning on changed source context, unresolved coverage rows, and the likely impacted sections.',
    'Preserve unchanged sections semantically. Do not rewrite stable sections for style-only changes.',
    'If no source or coverage change is detected, state clearly that no content changes were needed.',
    'Add a short section near the top named exactly "Delta Update Summary".',
    'In Delta Update Summary, include a markdown table with columns: Section, Action, Reason, Evidence Reference.',
    'Use Action values only from: updated, added, preserved, removed, no_change.',
    'List all sections that were preserved so the user can see that unchanged content was intentionally retained.',
    'If the document must remain a full Confluence-ready deliverable, keep unchanged content stable and only alter sections supported by current retrieved evidence.',
    'Do not invent changed evidence. If evidence is not retrieved, mark the item partial or needs review.',
    '',
    'Shared document update context JSON:',
    JSON.stringify(compactContext)
  ].join('\\n');
}`;

function patchPromptLibrary(code) {
  if (!code.includes('function buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, profile)')) {
    code = insertAfter(code, 'function buildRtmUpdateInstructions(type, generationMode, updateContext, context) {', '__TEMP__');
    code = code.replace('__TEMP__', '');
    const insertAt = code.indexOf('function buildRetrievalProfileInstructions(profile, type, projectName, compositeKeys) {');
    if (insertAt < 0) throw new Error('Could not locate retrieval profile function for shared delta helper insertion.');
    code = code.slice(0, insertAt) + sharedDeltaPromptHelper + '\n\n' + code.slice(insertAt);
  }

  if (!code.includes('const sharedDeltaUpdateInstructions = buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, retrievalProfile);')) {
    code = insertAfter(
      code,
      "const rtmUpdateInstructions = buildRtmUpdateInstructions(type, generationMode, updateContext, traceabilityContext);\n",
      "const sharedDeltaUpdateInstructions = buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, retrievalProfile);\n"
    );
  }

  code = code.replace(
    "  rtmUpdateInstructions\n].filter(Boolean).join('\\n\\n');",
    "  rtmUpdateInstructions,\n  sharedDeltaUpdateInstructions\n].filter(Boolean).join('\\n\\n');"
  );

  if (!code.includes('  sharedDeltaUpdateInstructions,\n  coverageGateReminder,')) {
    code = replaceOnce(
      code,
      "  selectedPrompt.user,\n  coverageGateReminder,",
      "  selectedPrompt.user,\n  sharedDeltaUpdateInstructions,\n  coverageGateReminder,"
    );
  }

  if (!code.includes("version: sharedDeltaUpdateInstructions ? 'shared-delta-v1' : null")) {
    code = replaceOnce(
      code,
      "    coverageLedgerRequirement: {",
      "    sharedDeltaUpdate: {\n      enabled: Boolean(sharedDeltaUpdateInstructions),\n      version: sharedDeltaUpdateInstructions ? 'shared-delta-v1' : null,\n      updateReasons: Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons : [],\n      previousJobId: updateContext.previousJobId || null,\n      previousConfluencePageId: updateContext.previousConfluencePageId || null,\n      previousTokenUsage: updateContext.previousTokenUsage || null\n    },\n    coverageLedgerRequirement: {"
    );
  }

  return code;
}

const sharedDeltaQualityHelpers = `

function sharedDocumentSections(documentType) {
  const sections = {
    test_strategy: [
      'Introduction & Context',
      'Testing Scope',
      'Strategic Testing Approach',
      'Automation Strategy & Roadmap',
      'Test Environment & Infrastructure Strategy',
      'Test Data Management Strategy',
      'Quality Metrics & Reporting Framework',
      'Risk-Based Testing & Mitigation Strategy',
      'Roles, Collaboration & RACI Model',
      'Compliance, Security & Regulatory Considerations',
      'Tooling & Integration Landscape',
      'Communication & Governance Model',
      'Appendix / Coverage Ledger'
    ],
    test_plan: [
      'Test Strategy',
      'Scope',
      'Test Objectives',
      'Test Deliverables',
      'Entry and Exit Criteria',
      'Test Schedule and Milestones',
      'Risks, Mitigation & Contingency Plan',
      'Test Environment',
      'Tools and Resources',
      'Roles and Responsibilities',
      'Test Data and Configurations',
      'Reporting and Communication Plan',
      'Suspension & Resumption Criteria',
      'Assumptions & Dependencies',
      'Automation Coverage Matrix',
      'Test Coverage Metrics',
      'Approval & Sign-off',
      'Appendix / Coverage Ledger'
    ],
    risk_matrix: [
      'Executive Summary',
      'Risk Register Summary',
      'Risk Detail Register',
      'Risk Heat Map Summary',
      'Top Critical Risks Analysis',
      'Risk Prioritization Strategy Explanation',
      'Linkage to Test Strategy Alignment',
      'Coverage Ledger'
    ]
  };
  return sections[documentType] || [];
}

function normalizeDeltaAction(value) {
  const action = String(value || '').trim().toLowerCase().replace(/\\s+/g, '_');
  if (['updated', 'update', 'modified', 'changed', 'refreshed'].includes(action)) return 'updated';
  if (['added', 'add', 'new', 'created'].includes(action)) return 'added';
  if (['removed', 'remove', 'deleted'].includes(action)) return 'removed';
  if (['preserved', 'preserve', 'unchanged', 'reused', 'retained'].includes(action)) return 'preserved';
  if (['no_change', 'none', 'no_changes'].includes(action)) return 'no_change';
  return action || 'updated';
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(value => String(value || '').trim())
    .filter(Boolean))];
}

function parseDeltaUpdateSummaryRows(markdown) {
  const text = String(markdown || '');
  const marker = text.search(/^\\s*#{0,6}\\s*Delta Update Summary\\s*$/im);
  if (marker < 0) return [];
  const section = text.slice(marker).split(/\\n\\s*#{1,6}\\s+(?!Delta Update Summary)/i)[0] || '';
  const rows = [];
  for (const line of section.split(/\\r?\\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    if (/^\\|\\s*-+\\s*\\|/.test(trimmed) || /section\\s*\\|\\s*action/i.test(trimmed)) continue;
    const cells = trimmed.slice(1, -1).split('|').map(cell => cell.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    rows.push({
      section: cells[0],
      action: normalizeDeltaAction(cells[1]),
      reason: cells[2] || '',
      evidenceReference: cells[3] || ''
    });
  }
  return rows;
}

function inferSharedUpdatedSections(documentType, updateReasons, coverageSummary) {
  const reasons = (Array.isArray(updateReasons) ? updateReasons : []).join(' ').toLowerCase();
  const reviewCount = (Number(coverageSummary.partialCount) || 0) + (Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0);
  const sections = [];
  if (documentType === 'risk_matrix') {
    if (reasons || reviewCount) sections.push('Risk Register Summary', 'Risk Detail Register', 'Coverage Ledger');
  } else if (documentType === 'test_plan') {
    if (reasons.includes('knowledge base')) sections.push('Scope', 'Test Objectives', 'Risks, Mitigation & Contingency Plan', 'Test Data and Configurations', 'Coverage Ledger');
    if (reviewCount) sections.push('Coverage Ledger');
  } else if (documentType === 'test_strategy') {
    if (reasons.includes('knowledge base')) sections.push('Testing Scope', 'Strategic Testing Approach', 'Risk-Based Testing & Mitigation Strategy', 'Coverage Ledger');
    if (reviewCount) sections.push('Coverage Ledger');
  }
  return uniqueStrings(sections);
}

function buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, markdown, coverageLedger, coverageSummary, batchSummary, data) {
  const sharedTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);
  if (!sharedTypes.has(documentType) || generationMode !== 'update') return null;
  const rows = parseDeltaUpdateSummaryRows(markdown);
  const canonicalSections = sharedDocumentSections(documentType);
  const updateReasons = Array.isArray(updateContext?.updateReasons) ? updateContext.updateReasons : [];
  let updatedSections = uniqueStrings(rows.filter(row => ['updated'].includes(row.action)).map(row => row.section));
  let addedSections = uniqueStrings(rows.filter(row => row.action === 'added').map(row => row.section));
  let removedSections = uniqueStrings(rows.filter(row => row.action === 'removed').map(row => row.section));
  let preservedSections = uniqueStrings(rows.filter(row => ['preserved', 'no_change'].includes(row.action)).map(row => row.section));
  if (!updatedSections.length && !addedSections.length && !removedSections.length) {
    updatedSections = inferSharedUpdatedSections(documentType, updateReasons, coverageSummary);
  }
  if (!preservedSections.length) {
    const changed = new Set([...updatedSections, ...addedSections, ...removedSections].map(value => value.toLowerCase()));
    preservedSections = canonicalSections.filter(section => !changed.has(section.toLowerCase()));
  }
  const previousTokenUsage = updateContext?.previousTokenUsage || {};
  const previousTokensTotal = Number(previousTokenUsage.total ?? previousTokenUsage.tokensTotal ?? updateContext?.previousTokensTotal ?? 0) || 0;
  const currentTokensTotal = Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0));
  const previousCostUsd = Number(previousTokenUsage.estimatedCostUsd ?? previousTokenUsage.estimated_cost_usd ?? 0) || 0;
  const currentCostUsd = Number(data.estimatedCostUsd) || 0;
  const estimatedTokensSaved = previousTokensTotal ? Math.max(0, previousTokensTotal - currentTokensTotal) : 0;
  const estimatedCostSavedUsd = previousCostUsd ? Math.max(0, previousCostUsd - currentCostUsd) : 0;
  const estimatedSavingsPercent = previousTokensTotal ? Math.round((estimatedTokensSaved / previousTokensTotal) * 100) : null;
  const noChangesDetected = updateReasons.length === 0 && updatedSections.length === 0 && addedSections.length === 0 && removedSections.length === 0;

  return {
    enabled: true,
    deltaMode: true,
    version: 'shared-delta-update-v1',
    documentType,
    mode: generationMode,
    sourceOfTruth: updateContext?.updateSourceOfTruth || 'current_retrieval_and_previous_output_metadata',
    updateOfJobId: updateContext?.previousJobId || null,
    previousConfluencePageId: updateContext?.previousConfluencePageId || null,
    updateReasons,
    noChangesDetected,
    changedEvidenceCount: rows.filter(row => ['updated', 'added', 'removed'].includes(row.action)).length,
    updatedSections,
    addedSections,
    removedSections,
    preservedSections: noChangesDetected ? canonicalSections : preservedSections,
    updatedSectionCount: updatedSections.length,
    addedSectionCount: addedSections.length,
    removedSectionCount: removedSections.length,
    preservedSectionCount: (noChangesDetected ? canonicalSections : preservedSections).length,
    deltaRows: rows,
    coverageSummary,
    coverageLedgerCount: Array.isArray(coverageLedger) ? coverageLedger.length : 0,
    batchSummary,
    tokenUsage: {
      source: data.tokenUsage?.source || 'estimated',
      input: Number(data.tokensInput) || 0,
      output: Number(data.tokensOutput) || 0,
      total: currentTokensTotal,
      estimatedCostUsd: currentCostUsd
    },
    previousTokenUsage,
    tokenSavings: {
      estimatedBaselineTokens: previousTokensTotal || null,
      estimatedTokensSaved,
      estimatedBaselineCostUsd: previousCostUsd || null,
      estimatedCostSavedUsd,
      estimatedSavingsPercent
    },
    message: noChangesDetected
      ? 'No source-context changes were detected for this shared document update.'
      : 'Shared document update focused on changed evidence and preserved unchanged sections.'
  };
}
`;

function patchQualityGate(code) {
  if (!code.includes('function buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, markdown, coverageLedger, coverageSummary, batchSummary, data)')) {
    code = insertAfter(code, "const sharedCoveragePlanningTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);", sharedDeltaQualityHelpers);
  }

  if (!code.includes('const rtmUpdateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, coverageBatchSummary);')) {
    code = replaceOnce(
      code,
      'const updateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, coverageBatchSummary);',
      "const rtmUpdateSummary = buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, coverageBatchSummary);\nconst sharedDeltaUpdateSummary = buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, rawMarkdown, coverageLedger, coverageSummary, coverageBatchSummary, data);\nconst updateSummary = sharedDeltaUpdateSummary || rtmUpdateSummary;"
    );
  }

  return code;
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_delta_update_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const prompt = requireNode(nodes, 'Prompt Library');
    const qualityGate = requireNode(nodes, 'Quality Gate');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    qualityGate.parameters.jsCode = patchQualityGate(qualityGate.parameters.jsCode);

    new Function(prompt.parameters.jsCode);
    new Function(qualityGate.parameters.jsCode);

    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      new Date().toISOString(),
      workflowId
    ]);

    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
        new Date().toISOString(),
        workflowId,
        row.activeVersionId
      ]);
    }

    console.log(JSON.stringify({
      workflowId,
      workflowName: row.name,
      activeVersionId: row.activeVersionId,
      backupPath,
      patched: [
        'shared document delta update prompt instructions',
        'shared document delta update quality summary',
        'shared document update token savings metadata'
      ]
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
