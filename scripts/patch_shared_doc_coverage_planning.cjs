const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'fullRetrievalD01';
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

function replaceBetween(code, startMarker, endMarker, replacement) {
  const start = code.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${startMarker}`);
  const end = code.indexOf(endMarker, start);
  if (end < 0) throw new Error(`End marker not found after ${startMarker}: ${endMarker}`);
  return code.slice(0, start) + replacement + code.slice(end);
}

function patchPromptLibrary(code) {
  const coverageBlock = `function buildSharedCoveragePlanningProfile(type) {
  const profiles = {
    test_strategy: {
      label: 'Test Strategy',
      goal: 'Every major source objective, module, workflow, integration, quality attribute, test level, governance concern, and automation signal should be reflected in the strategy or explicitly excluded.',
      expectedCoverage: ['quality objectives', 'in-scope and out-of-scope modules', 'test levels', 'NFRs', 'automation approach', 'risk-based priorities', 'governance and metrics'],
      inclusionHint: 'Name the strategy section where the item is handled, for example Scope, Test Levels, Automation, Risk, Metrics, or Governance.'
    },
    test_plan: {
      label: 'Test Plan',
      goal: 'Every major source module, workflow, integration, test data need, environment dependency, entry/exit criterion, and execution risk should be represented in the plan or explicitly excluded.',
      expectedCoverage: ['scope items', 'execution workflows', 'integrations', 'environment and data dependencies', 'entry and exit criteria', 'roles and schedule', 'risks and mitigations'],
      inclusionHint: 'Name the plan section where the item is handled, for example Scope, Approach, Environment, Test Data, Schedule, Entry Criteria, Exit Criteria, or Risks.'
    },
    risk_matrix: {
      label: 'Risk Matrix',
      goal: 'Every major source module, workflow, integration, business rule, security/privacy concern, data concern, operational dependency, and NFR should have a risk row or a clear no-material-risk rationale.',
      expectedCoverage: ['functional risks', 'integration risks', 'data risks', 'security and privacy risks', 'NFR risks', 'operational risks', 'mitigation ownership'],
      inclusionHint: 'Name the risk row, risk category, or rationale where the item is handled.'
    }
  };
  return profiles[type] || null;
}

function buildCoverageLedgerInstructions(type, profile, planningProfile) {
  const isTraceability = type === 'traceability_matrix';
  const lines = [
    '==============================',
    'COVERAGE LEDGER REQUIREMENT',
    '==============================',
    '',
    'Create a compact markdown section named exactly: Coverage Ledger.',
    'Use this exact table structure:',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '|---|---|---|---|---|---|',
    '',
    'Coverage Status must be one of: covered, partial, missing, excluded.',
    'Build the ledger from all distinct modules, screens, workflows, integrations, business rules, NFRs, and requirements discovered from retrieved project evidence.',
    'Do not silently drop discovered evidence. If evidence is weak or deliberately out of scope, mark partial or excluded and explain why.',
    'Use Source Reference values such as docType + fileName + sectionTitle/chunkId whenever available.',
    'For the current profile, pay special attention to: ' + profile.sectionKeywords.join(', ') + '.'
  ];

  if (isTraceability) {
    lines.push('Traceability Matrix hard gate: every discovered requirement/module must be represented in the matrix or explicitly excluded with rationale. Do not leave missing rows unless the output truly lacks coverage.');
  } else if (planningProfile) {
    lines.push(
      'Shared document coverage-planning mode: this ledger is a review warning gate, not a hard publish blocker.',
      'Document-specific coverage goal: ' + planningProfile.goal,
      'Expected coverage dimensions: ' + planningProfile.expectedCoverage.join(', ') + '.',
      'Included In Output must identify the concrete section, table, risk row, or rationale where the item was handled. ' + planningProfile.inclusionHint,
      'If an item belongs in this document but is not included, mark missing. If only part of it is handled, mark partial. If it is truly outside the document purpose, mark excluded with rationale.'
    );
  } else {
    lines.push('For this document type, the ledger is currently collected in dry-run mode for analytics and future batching. Still make it accurate.');
  }

  return lines.join('\\n');
}

const sharedCoveragePlanningProfile = buildSharedCoveragePlanningProfile(type);
const coverageLedgerInstructions = buildCoverageLedgerInstructions(type, retrievalProfile, sharedCoveragePlanningProfile);
`;

  code = replaceBetween(
    code,
    'function buildCoverageLedgerInstructions(type, profile)',
    'const twoLayerRtmInstructions',
    coverageBlock
  );

  if (!code.includes('SHARED DOCUMENT COVERAGE PLANNING REMINDER')) {
    code = code.replace(
      "const enhancedUser = [",
      `const sharedCoverageGateReminder = sharedCoveragePlanningProfile
  ? [
      '========================',
      'SHARED DOCUMENT COVERAGE PLANNING REMINDER',
      '========================',
      'This ' + sharedCoveragePlanningProfile.label + ' must include one Coverage Ledger section using the required ledger table.',
      'Use the ledger to prove that major retrieved source signals were covered, partially covered, missing, or intentionally excluded.',
      'Coverage gaps are warning-level for this rollout, but the ledger itself should be accurate and reviewable.'
    ].join('\\n')
  : '';

const enhancedUser = [`
    );
  }

  code = code.replace(
    "  selectedPrompt.user,\n  coverageGateReminder,\n  retryGuidance,",
    "  selectedPrompt.user,\n  coverageGateReminder,\n  sharedCoverageGateReminder,\n  retryGuidance,"
  );

  if (!code.includes('coveragePlanningRequirement:')) {
    code = code.replace(
      "    coverageLedgerRequirement: {\n      enabled: true,\n      version: 'coverage-ledger-v1',\n      mode: type === 'traceability_matrix' ? 'enforced' : 'dry_run',\n      requiredFor: type === 'traceability_matrix',\n      statuses: ['covered', 'partial', 'missing', 'excluded']\n    },",
      `    coverageLedgerRequirement: {
      enabled: true,
      version: 'coverage-ledger-v1',
      mode: type === 'traceability_matrix' ? 'enforced' : 'dry_run',
      requiredFor: type === 'traceability_matrix',
      statuses: ['covered', 'partial', 'missing', 'excluded']
    },
    coveragePlanningRequirement: {
      enabled: Boolean(sharedCoveragePlanningProfile),
      version: 'coverage-planning-v1',
      mode: sharedCoveragePlanningProfile ? 'warning' : 'not_applicable',
      documentTypes: ['test_strategy', 'test_plan', 'risk_matrix'],
      profile: sharedCoveragePlanningProfile
    },`
    );
  }

  return code;
}

function patchQualityGate(code) {
  if (code.includes('function evaluateSharedCoveragePlanning')) {
    return code;
  }

  const planningBlock = `const sharedCoveragePlanningTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);

function evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary) {
  if (!sharedCoveragePlanningTypes.has(documentType)) return null;

  const summary = coverageSummary || {};
  const ledgerCount = coverageLedger.length;
  const partialCount = Number(summary.partialCount) || 0;
  const missingCount = Number(summary.missingCount) || 0;
  const unknownCount = Number(summary.unknownCount) || 0;
  const warningCount = partialCount + missingCount + unknownCount;
  const profile = $('Prompt Library').item.json.coveragePlanningRequirement?.profile || {};

  if (!ledgerCount) {
    summary.gateStatus = 'warning';
    return {
      enabled: true,
      version: 'coverage-planning-v1',
      documentType,
      status: 'warning',
      reason: 'missing_coverage_ledger',
      ledgerCount,
      warningCount: 1,
      message: 'Coverage Ledger was not reported. Review the document for missed source modules or regenerate if audit coverage is required.',
      profileLabel: profile.label || documentType
    };
  }

  const status = warningCount > 0 ? 'warning' : 'passed';
  summary.gateStatus = status === 'warning' ? 'warning' : summary.gateStatus;
  return {
    enabled: true,
    version: 'coverage-planning-v1',
    documentType,
    status,
    reason: status === 'warning' ? 'coverage_gaps_reported' : 'coverage_ledger_clean',
    ledgerCount,
    warningCount,
    partialCount,
    missingCount,
    unknownCount,
    message: status === 'warning'
      ? 'Coverage Ledger reported partial, missing, or unrecognized items. Generation can proceed, but review is recommended.'
      : 'Coverage Ledger reported all included source items as covered or intentionally excluded.',
    profileLabel: profile.label || documentType
  };
}

const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);

`;

  code = code.replace(
    "if (documentType === 'traceability_matrix') {",
    planningBlock + "if (documentType === 'traceability_matrix') {"
  );

  code = code.replace(
    "        coverageGate: coverageSummary.gateStatus,\n        coverageLedgerCount:",
    "        coverageGate: coverageSummary.gateStatus,\n        coveragePlanning: sharedCoveragePlanning,\n        coverageLedgerCount:"
  );

  return code;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_coverage_planning_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const connections = row.connections ? parseAny(row.connections) : {};
    const prompt = requireNode(nodes, 'Prompt Library');
    const quality = requireNode(nodes, 'Quality Gate');

    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    quality.parameters.jsCode = patchQualityGate(quality.parameters.jsCode);

    for (const node of [prompt, quality]) {
      try {
        new Function(node.parameters.jsCode);
      } catch (error) {
        const tmp = path.join(process.cwd(), `tmp_shared_coverage_${node.name.replace(/[^A-Za-z0-9_-]+/g, '_')}.js`);
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
      added: ['document-specific coverage planner for test_strategy, test_plan, risk_matrix', 'warning-grade shared coverage planning metadata']
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
