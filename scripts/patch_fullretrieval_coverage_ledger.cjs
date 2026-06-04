const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) {
    throw new Error(`Node not found: ${name}`);
  }
  return node;
}

function addSetAssignment(node, assignment) {
  const assignments = node.parameters?.assignments?.assignments;
  if (!Array.isArray(assignments)) {
    throw new Error(`Set node assignments not found: ${node.name}`);
  }
  const existing = assignments.find(item => item.name === assignment.name);
  if (existing) {
    existing.value = assignment.value;
    existing.type = assignment.type;
    return;
  }
  assignments.push(assignment);
}

function insertJsonMetadataFields(jsonBody, anchor, fields) {
  if (jsonBody.includes(fields[0].trim())) {
    return jsonBody;
  }
  if (!jsonBody.includes(anchor)) {
    throw new Error(`JSON body anchor not found: ${anchor}`);
  }
  return jsonBody.replace(anchor, `${anchor},\n${fields.join(',\n')}`);
}

function patchPromptLibrary(code) {
  if (!code.includes('COVERAGE LEDGER REQUIREMENT')) {
    const marker = 'const selectedPrompt = promptLibrary[type] || promptLibrary.test_plan;';
    const coverageBlock = `
function buildCoverageLedgerInstructions(type, profile) {
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
    'For the current profile, pay special attention to: ' + profile.sectionKeywords.join(', ') + '.',
    isTraceability
      ? 'Traceability Matrix hard gate: every discovered requirement/module must be represented in the matrix or explicitly excluded with rationale. Do not leave missing rows unless the output truly lacks coverage.'
      : 'For this document type, the ledger is currently collected in dry-run mode for analytics and future batching. Still make it accurate.'
  ];
  return lines.join('\\n');
}

const coverageLedgerInstructions = buildCoverageLedgerInstructions(type, retrievalProfile);
`;
    code = code.replace(marker, `${coverageBlock}\n${marker}`);
  }

  code = code.replace(
    `const enhancedSystem = [
  selectedPrompt.system,
  retrievalProfileInstructions
].filter(Boolean).join('\\n\\n');`,
    `const enhancedSystem = [
  selectedPrompt.system,
  retrievalProfileInstructions,
  coverageLedgerInstructions
].filter(Boolean).join('\\n\\n');`
  );

  code = code.replace(
    `const enhancedUser = [
  retrievalProfileInstructions,
  selectedPrompt.user,
  retryGuidance,`,
    `const enhancedUser = [
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  selectedPrompt.user,
  coverageGateReminder,
  retryGuidance,`
  );

  code = code.replace(
    `const enhancedUser = [
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  selectedPrompt.user,
  retryGuidance,`,
    `const enhancedUser = [
  retrievalProfileInstructions,
  coverageLedgerInstructions,
  selectedPrompt.user,
  coverageGateReminder,
  retryGuidance,`
  );

  if (!code.includes('TRACEABILITY MATRIX QUALITY GATE REMINDER')) {
    code = code.replace(
      `const enhancedUser = [`,
      `const coverageGateReminder = type === 'traceability_matrix'
  ? [
      '========================',
      'TRACEABILITY MATRIX QUALITY GATE REMINDER',
      '========================',
      'The final Traceability Matrix must satisfy the existing quality gate.',
      'Do not return a compact table-only answer.',
      'Include enough detail to exceed 800 words across the matrix, coverage summary, unmapped analysis, automation coverage insights, governance commentary, source references, and Coverage Ledger.',
      'The final answer must include both:',
      '1. The main Requirement Traceability Matrix table.',
      '2. A separate section named exactly "Coverage Ledger" using the required Coverage Ledger table columns.'
    ].join('\\n')
  : '';

const enhancedUser = [`
    );
  }

  if (!code.includes('coverageLedgerRequirement:')) {
    code = code.replace(
      `retrievalProfileInstructions,
    projectId: $json.projectId || null,`,
      `retrievalProfileInstructions,
    coverageLedgerRequirement: {
      enabled: true,
      version: 'coverage-ledger-v1',
      mode: type === 'traceability_matrix' ? 'enforced' : 'dry_run',
      requiredFor: type === 'traceability_matrix',
      statuses: ['covered', 'partial', 'missing', 'excluded']
    },
    projectId: $json.projectId || null,`
    );
  }

  return code;
}

function buildValidateCode() {
  return `// Detect AI output safely across all n8n versions

let text = "";
let tokensInput = 0;
let tokensOutput = 0;

if ($json.output_text) {
  text = $json.output_text;
} else if (typeof $json.output === "string") {
  text = $json.output;
} else if ($json.output?.[0]?.content?.[0]?.text) {
  text = $json.output[0].content[0].text;
} else if ($json.message?.content) {
  text = $json.message.content;
}

tokensInput = $json.usage?.prompt_tokens ||
  $json.usage?.input_tokens ||
  $json.llmUsage?.promptTokens ||
  $json.tokenUsage?.promptTokens ||
  0;

tokensOutput = $json.usage?.completion_tokens ||
  $json.usage?.output_tokens ||
  $json.llmUsage?.completionTokens ||
  $json.tokenUsage?.completionTokens ||
  0;

if (!text || text.trim().length < 50) {
  throw new Error("AI returned unexpected structure: " + JSON.stringify($json));
}

function splitMarkdownRow(line) {
  return String(line || '')
    .trim()
    .replace(/^\\|/, '')
    .replace(/\\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function normalizeStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw.includes('exclude') || raw === 'n/a' || raw === 'not applicable') return 'excluded';
  if (raw.includes('partial') || raw.includes('at risk')) return 'partial';
  if (raw.includes('miss') || raw.includes('gap') || raw.includes('unmapped') || raw.includes('not covered')) return 'missing';
  if (raw.includes('cover') || raw.includes('mapped') || raw.includes('included')) return 'covered';
  return 'unknown';
}

function getColumnIndex(headers, patterns, fallback) {
  const index = headers.findIndex(header => patterns.some(pattern => pattern.test(header)));
  return index >= 0 ? index : fallback;
}

function extractCoverageLedger(markdown) {
  const rows = [];
  const lines = String(markdown || '').split(/\\r?\\n/);
  let inCoverageSection = false;
  let headers = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (/^#{1,6}\\s+.*coverage\\s+ledger/.test(lower) || /^coverage\\s+ledger\\s*:?$/i.test(trimmed)) {
      inCoverageSection = true;
      headers = null;
      continue;
    }

    if (inCoverageSection && /^#{1,6}\\s+/.test(trimmed) && !/coverage\\s+ledger/i.test(trimmed)) {
      if (headers) break;
      inCoverageSection = false;
    }

    if (inCoverageSection && headers && rows.length > 0 && (!trimmed.includes('|') || /^-{3,}$/.test(trimmed))) {
      break;
    }

    if (!trimmed.includes('|')) {
      continue;
    }

    const cells = splitMarkdownRow(trimmed);
    if (cells.length < 4 || isSeparatorRow(cells)) {
      continue;
    }

    const normalizedCells = cells.map(cell => cell.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    const joined = normalizedCells.join(' ');
    const looksLikeCoverageHeader =
      joined.includes('coverage') &&
      (joined.includes('module') || joined.includes('requirement')) &&
      joined.includes('status');

    if (looksLikeCoverageHeader) {
      if (!inCoverageSection && !(normalizedCells[0] || '').includes('coverage id')) {
        continue;
      }
      headers = normalizedCells;
      inCoverageSection = true;
      continue;
    }

    if (!inCoverageSection || !headers) {
      continue;
    }

    let entry;

    if (headers.length <= 6 && cells.length > headers.length) {
      // Source references often contain pipe-delimited metadata, for example
      // "BRD | file.pdf | chunkId". Keep the first two and last three
      // semantic columns stable, then join the middle back into Source Reference.
      entry = {
        coverageId: cells[0] || '',
        moduleRequirement: cells[1] || '',
        sourceReference: cells.slice(2, -3).join(' | '),
        includedInOutput: cells[cells.length - 3] || '',
        coverageStatus: normalizeStatus(cells[cells.length - 2]),
        notes: cells[cells.length - 1] || ''
      };
    } else {
      const idIndex = getColumnIndex(headers, [/^coverage id$/, /^id$/, /req id/], 0);
      const moduleIndex = getColumnIndex(headers, [/module/, /requirement/], 1);
      const sourceIndex = getColumnIndex(headers, [/source/], 2);
      const includedIndex = getColumnIndex(headers, [/included/, /output/], 3);
      const statusIndex = getColumnIndex(headers, [/status/], 4);
      const notesIndex = getColumnIndex(headers, [/note/, /rationale/], 5);

      entry = {
        coverageId: cells[idIndex] || '',
        moduleRequirement: cells[moduleIndex] || '',
        sourceReference: cells[sourceIndex] || '',
        includedInOutput: cells[includedIndex] || '',
        coverageStatus: normalizeStatus(cells[statusIndex]),
        notes: cells[notesIndex] || ''
      };
    }

    if (entry.moduleRequirement || entry.coverageId) {
      rows.push(entry);
    }
  }

  return rows.slice(0, 200);
}

function extractTraceabilityMatrixLedger(markdown) {
  const rows = [];
  const lines = String(markdown || '').split(/\\r?\\n/);
  let headers = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes('|')) {
      if (headers && rows.length > 0) break;
      continue;
    }

    const cells = splitMarkdownRow(trimmed);
    if (cells.length < 4 || isSeparatorRow(cells)) {
      continue;
    }

    const normalizedCells = cells.map(cell => cell.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    const joined = normalizedCells.join(' ');
    const looksLikeRtmHeader =
      (joined.includes('req id') || joined.includes('requirement id')) &&
      joined.includes('requirement') &&
      joined.includes('coverage status');

    if (looksLikeRtmHeader) {
      headers = normalizedCells;
      continue;
    }

    if (!headers) {
      continue;
    }

    const reqIndex = getColumnIndex(headers, [/req id/, /requirement id/, /^id$/], 0);
    const requirementIndex = getColumnIndex(headers, [/requirement description/, /^requirement$/], 1);
    const sourceIndex = getColumnIndex(headers, [/source/], 2);
    const designIndex = getColumnIndex(headers, [/design/, /component/], 3);
    const testIndex = getColumnIndex(headers, [/test case/], 4);

    const coverageStatus = normalizeStatus(cells[cells.length - 1]);

    rows.push({
      coverageId: cells[reqIndex] || '',
      moduleRequirement: cells[requirementIndex] || '',
      sourceReference: cells[sourceIndex] || '',
      includedInOutput: cells[testIndex] || '',
      coverageStatus,
      notes: cells[designIndex] || ''
    });
  }

  return rows
    .filter(row => row.coverageId || row.moduleRequirement)
    .slice(0, 200);
}

function buildCoverageSummary(coverageLedger, documentType) {
  const summary = {
    version: 'coverage-ledger-v1',
    mode: documentType === 'traceability_matrix' ? 'enforced' : 'dry_run',
    coverageLedgerCount: coverageLedger.length,
    coveredCount: 0,
    partialCount: 0,
    missingCount: 0,
    excludedCount: 0,
    unknownCount: 0,
    blockingUncoveredCount: 0,
    uncoveredCount: 0,
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

  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.missingItems = coverageLedger
    .filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus))
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));

  if (!coverageLedger.length) {
    summary.gateStatus = documentType === 'traceability_matrix' ? 'failed' : 'not_reported';
  } else if (summary.blockingUncoveredCount > 0) {
    summary.gateStatus = documentType === 'traceability_matrix' ? 'failed' : 'warning';
  } else if (summary.partialCount > 0) {
    summary.gateStatus = 'warning';
  } else {
    summary.gateStatus = 'passed';
  }

  return summary;
}

const wordCount = text.trim().split(/\\s+/).length;
const charCount = text.trim().length;
const jobId = $('Prompt Library').item.json.jobId;
const documentType = $('Prompt Library').item.json.documentType;
const systemPrompt = $('Prompt Library').item.json.system || "";
const userPrompt = $('Prompt Library').item.json.user || "";
const usageSource = tokensInput || tokensOutput ? "provider_usage" : "estimated";

if (!tokensOutput) {
  tokensOutput = Math.max(1, Math.ceil(charCount / 4));
}

if (!tokensInput) {
  tokensInput = Math.max(1, Math.ceil((systemPrompt.length + userPrompt.length) / 4));
}

let coverageLedger = extractCoverageLedger(text);
if (!coverageLedger.length && documentType === 'traceability_matrix') {
  coverageLedger = extractTraceabilityMatrixLedger(text);
}
const coverageSummary = buildCoverageSummary(coverageLedger, documentType);

const INPUT_COST_PER_TOKEN = 0.40 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 1.60 / 1_000_000;
const estimatedCostUsd = (tokensInput * INPUT_COST_PER_TOKEN) + (tokensOutput * OUTPUT_COST_PER_TOKEN);

return [
  {
    json: {
      rawMarkdown: text,
      wordCount,
      charCount,
      jobId,
      tokensInput,
      tokensOutput,
      tokensTotal: tokensInput + tokensOutput,
      estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),
      tokenUsage: {
        source: usageSource,
        input: tokensInput,
        output: tokensOutput,
        total: tokensInput + tokensOutput,
        estimatedCostUsd: parseFloat(estimatedCostUsd.toFixed(6)),
      },
      coverageLedger,
      coverageSummary,
    }
  }
];`;
}

function buildQualityGateCode() {
  return `const data = $json;
const documentType = $('Prompt Library').item.json.documentType;
const projectName = $('Prompt Library').item.json.projectName;
const jobId = data.jobId; 

const rawMarkdown = data.rawMarkdown || "";
const wordCount = data.wordCount || 0;
const coverageLedger = Array.isArray(data.coverageLedger) ? data.coverageLedger : [];
const coverageSummary = data.coverageSummary || {
  version: 'coverage-ledger-v1',
  mode: documentType === 'traceability_matrix' ? 'enforced' : 'dry_run',
  coverageLedgerCount: 0,
  coveredCount: 0,
  partialCount: 0,
  missingCount: 0,
  excludedCount: 0,
  unknownCount: 0,
  blockingUncoveredCount: 0,
  uncoveredCount: 0,
  gateStatus: documentType === 'traceability_matrix' ? 'failed' : 'not_reported',
  missingItems: []
};

const MIN_WORD_COUNTS = {
  test_strategy:       2000,
  test_plan:           1500,
  test_cases:          1000,
  user_stories:        500,
  risk_matrix:         800,
  traceability_matrix: 800
};

const minWords = MIN_WORD_COUNTS[documentType] || 500;

if (wordCount < minWords) {
  throw new Error(
    \`Quality Gate Failed - Word count too low for \${documentType}. \` +
    \`Got \${wordCount} words, minimum is \${minWords}.\`
  );
}

const REQUIRED_SECTIONS = {
  test_strategy: [
    "Introduction",
    "Scope",
    "Automation",
    "Risk",
    "Metrics"
  ],
  test_plan: [
    "Scope",
    "Objectives",
    "Entry",
    "Exit",
    "Risk"
  ],
  test_cases: [
    "Test Case",
    "Precondition",
    "Expected"
  ],
  user_stories: [
    "epicId",
    "userStoryId",
    "acceptanceCriteria"
  ],
  risk_matrix: [
    "Risk",
    "Probability",
    "Impact",
    "Mitigation"
  ],
  traceability_matrix: [
    "Req ID",
    "Test Case",
    "Coverage"
  ]
};

const requiredSections = REQUIRED_SECTIONS[documentType] || [];
const missingSections = requiredSections.filter(
  section => !rawMarkdown.toLowerCase().includes(section.toLowerCase())
);

if (missingSections.length > 0) {
  throw new Error(
    \`Quality Gate Failed - Missing required sections for \${documentType}: \` +
    missingSections.join(", ")
  );
}

const TRACEABILITY_MARKERS = [
  "brd", "frd", "hld", "lld",
  "as mentioned in", "according to",
  "transcript", "requirement"
];

if (documentType !== "user_stories") {
  const hasTraceability = TRACEABILITY_MARKERS.some(
    marker => rawMarkdown.toLowerCase().includes(marker)
  );

  if (!hasTraceability) {
    throw new Error(
      \`Quality Gate Failed - Output contains no source document references \` +
      \`(BRD, FRD, HLD, LLD etc.) for \${documentType}. \` +
      \`Output may be hallucinated.\`
    );
  }
}

if (documentType === 'traceability_matrix') {
  if (!coverageLedger.length) {
    throw new Error(
      'Coverage Gate Failed - Traceability Matrix is missing Coverage Ledger. ' +
      'Regenerate with the exact Coverage Ledger table so requirement coverage can be audited.'
    );
  }

  const blockingUncoveredCount = Number(coverageSummary.blockingUncoveredCount) || ((Number(coverageSummary.missingCount) || 0) + (Number(coverageSummary.unknownCount) || 0));
  if (blockingUncoveredCount > 0) {
    const missingItems = Array.isArray(coverageSummary.missingItems)
      ? coverageSummary.missingItems
      : [];
    const examples = missingItems
      .filter(item => ['missing', 'unknown'].includes(item.coverageStatus))
      .slice(0, 5)
      .map(item => [item.coverageId, item.moduleRequirement, item.coverageStatus].filter(Boolean).join(' - '))
      .join('; ');

    throw new Error(
      \`Coverage Gate Failed - Traceability Matrix has \${blockingUncoveredCount} missing or unrecognized ledger item(s).\` +
      (examples ? \` Examples: \${examples}\` : '')
    );
  }
}

console.log(\`Quality Gate Passed - \${documentType} | Words: \${wordCount} | Coverage: \${coverageSummary.gateStatus} | Project: \${projectName}\`);

return [
  {
    json: {
      rawMarkdown: data.rawMarkdown,
      wordCount: data.wordCount,
      charCount: data.charCount,
      jobId,
      tokensInput: Number(data.tokensInput) || 0,
      tokensOutput: Number(data.tokensOutput) || 0,
      tokensTotal: Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0)),
      estimatedCostUsd: Number(data.estimatedCostUsd) || 0,
      tokenUsage: data.tokenUsage || {
        source: 'estimated',
        input: Number(data.tokensInput) || 0,
        output: Number(data.tokensOutput) || 0,
        total: Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0)),
        estimatedCostUsd: Number(data.estimatedCostUsd) || 0,
      },
      coverageLedger,
      coverageSummary,
      qualityGate: {
        passed: true,
        documentType,
        wordCount,
        minWordCount: minWords,
        checkedSections: requiredSections,
        missingSections: [],
        traceabilityFound: true,
        coverageGate: coverageSummary.gateStatus,
        coverageLedgerCount: Number(coverageSummary.coverageLedgerCount) || 0,
        uncoveredCoverageCount: Number(coverageSummary.uncoveredCount) || 0,
        blockingUncoveredCoverageCount: Number(coverageSummary.blockingUncoveredCount) || 0,
        missingCoverageItems: coverageSummary.missingItems || []
      }
    }
  }
];`;
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });

  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_coverage_ledger_${timestamp}.json`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
      : null;
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);

    const promptLibrary = requireNode(nodes, 'Prompt Library');
    promptLibrary.parameters.jsCode = patchPromptLibrary(promptLibrary.parameters.jsCode);

    requireNode(nodes, 'Validate AI Agent Output').parameters.jsCode = buildValidateCode();
    requireNode(nodes, 'Quality Gate').parameters.jsCode = buildQualityGateCode();

    const restoreQualityGate = requireNode(nodes, 'Restore Quality Gate Output');
    addSetAssignment(restoreQualityGate, {
      id: 'coverage-summary-output',
      name: 'coverageSummary',
      value: "={{ $('Quality Gate').item.json.coverageSummary }}",
      type: 'object'
    });
    addSetAssignment(restoreQualityGate, {
      id: 'coverage-ledger-output',
      name: 'coverageLedger',
      value: "={{ $('Quality Gate').item.json.coverageLedger }}",
      type: 'array'
    });

    const passedMetric = requireNode(nodes, 'LOG: Quality Gate Passed');
    passedMetric.parameters.jsonBody = insertJsonMetadataFields(
      passedMetric.parameters.jsonBody,
      `    "checked_sections": "{{ $json.qualityGate.checkedSections }}"`,
      [
        `    "coverage_mode": {{ JSON.stringify($json.coverageSummary?.mode || 'dry_run') }}`,
        `    "coverage_gate_status": {{ JSON.stringify($json.coverageSummary?.gateStatus || 'not_reported') }}`,
        `    "coverage_ledger_count": {{ Number($json.coverageSummary?.coverageLedgerCount) || 0 }}`,
        `    "covered_ledger_count": {{ Number($json.coverageSummary?.coveredCount) || 0 }}`,
        `    "partial_ledger_count": {{ Number($json.coverageSummary?.partialCount) || 0 }}`,
        `    "missing_ledger_count": {{ Number($json.coverageSummary?.missingCount) || 0 }}`,
        `    "excluded_ledger_count": {{ Number($json.coverageSummary?.excludedCount) || 0 }}`,
        `    "unknown_ledger_count": {{ Number($json.coverageSummary?.unknownCount) || 0 }}`,
        `    "blocking_uncovered_ledger_count": {{ Number($json.coverageSummary?.blockingUncoveredCount) || 0 }}`,
        `    "uncovered_ledger_count": {{ Number($json.coverageSummary?.uncoveredCount) || 0 }}`,
        `    "coverage_missing_items": {{ JSON.stringify($json.coverageSummary?.missingItems || []) }}`
      ]
    );

    const failedMetric = requireNode(nodes, 'LOG: Quality Gate Failed');
    failedMetric.parameters.jsonBody = failedMetric.parameters.jsonBody.replaceAll(
      `JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed')`,
      `JSON.stringify(typeof $json.error === 'string' ? $json.error : ($json.message || $json.error?.message || 'Quality Gate Failed'))`
    );
    failedMetric.parameters.jsonBody = insertJsonMetadataFields(
      failedMetric.parameters.jsonBody,
      `    "retry_of_job_id": {{ $('Restore Job Context').item.json.retryOfJobId ? JSON.stringify($('Restore Job Context').item.json.retryOfJobId) : 'null' }}`,
      [
        `    "coverage_mode": {{ JSON.stringify((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.mode || 'dry_run') }}`,
        `    "coverage_gate_status": {{ JSON.stringify((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.gateStatus || 'not_reported') }}`,
        `    "coverage_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.coverageLedgerCount || 0) || 0 }}`,
        `    "covered_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.coveredCount || 0) || 0 }}`,
        `    "partial_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.partialCount || 0) || 0 }}`,
        `    "missing_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.missingCount || 0) || 0 }}`,
        `    "excluded_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.excludedCount || 0) || 0 }}`,
        `    "unknown_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.unknownCount || 0) || 0 }}`,
        `    "blocking_uncovered_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.blockingUncoveredCount || 0) || 0 }}`,
        `    "uncovered_ledger_count": {{ Number((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary?.uncoveredCount || 0) || 0 }}`,
        `    "coverage_missing_items": {{ JSON.stringify(((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary || {}).missingItems || []) }}`
      ]
    );

    const failedJob = requireNode(nodes, 'Update Job Status as Failed1');
    failedJob.parameters.jsonBody = failedJob.parameters.jsonBody.replaceAll(
      `JSON.stringify($json.message || $json.error?.message || 'Quality Gate Failed')`,
      `JSON.stringify(typeof $json.error === 'string' ? $json.error : ($json.message || $json.error?.message || 'Quality Gate Failed'))`
    );
    failedJob.parameters.jsonBody = insertJsonMetadataFields(
      failedJob.parameters.jsonBody,
      `    "retryOfJobId": {{ $('Restore Job Context').item.json.retryOfJobId ? JSON.stringify($('Restore Job Context').item.json.retryOfJobId) : 'null' }}`,
      [
        `    "coverageSummary": {{ JSON.stringify(((($items('Validate AI Agent Output')[0] || {}).json || {}).coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] })) }}`
      ]
    );

    const completedJob = requireNode(nodes, 'Update Job Status as Completed');
    completedJob.parameters.jsonBody = insertJsonMetadataFields(
      completedJob.parameters.jsonBody,
      `    "wordCount": {{ Number($('Restore Quality Gate Output').item.json.wordCount) || 0 }}`,
      [
        `    "coverageSummary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] }) }}`
      ]
    );

    const completedMetric = requireNode(nodes, 'LOG: Confluence Job Completed');
    completedMetric.parameters.jsonBody = insertJsonMetadataFields(
      completedMetric.parameters.jsonBody,
      `    "output_type": "confluence"`,
      [
        `    "coverage_mode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.mode || 'dry_run') }}`,
        `    "coverage_gate_status": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.gateStatus || 'not_reported') }}`,
        `    "coverage_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.coverageLedgerCount) || 0 }}`,
        `    "covered_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.coveredCount) || 0 }}`,
        `    "partial_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.partialCount) || 0 }}`,
        `    "missing_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.missingCount) || 0 }}`,
        `    "excluded_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.excludedCount) || 0 }}`,
        `    "unknown_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.unknownCount) || 0 }}`,
        `    "blocking_uncovered_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.blockingUncoveredCount) || 0 }}`,
        `    "uncovered_ledger_count": {{ Number($('Restore Quality Gate Output').item.json.coverageSummary?.uncoveredCount) || 0 }}`,
        `    "coverage_missing_items": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary?.missingItems || []) }}`
      ]
    );

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
      patchedNodes: [
        'Prompt Library',
        'Validate AI Agent Output',
        'Quality Gate',
        'Restore Quality Gate Output',
        'LOG: Quality Gate Passed',
        'LOG: Quality Gate Failed',
        'Update Job Status as Failed1',
        'Update Job Status as Completed',
        'LOG: Confluence Job Completed'
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
