const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const retrievalWorkflowId = 'fullRetrievalD01';
const ingestionWorkflowId = 'C9oZfZxpGFakzlB3';

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

function assert(condition, message) {
  if (!condition) throw new Error(`Smoke assertion failed: ${message}`);
}

function replaceOnce(code, search, replacement) {
  if (!code.includes(search)) throw new Error(`Patch marker not found: ${search.slice(0, 120)}`);
  return code.replace(search, replacement);
}

function replaceBlock(code, startMarker, endMarker, replacement) {
  const start = code.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${startMarker}`);
  const end = code.indexOf(endMarker, start);
  if (end < 0) throw new Error(`End marker not found after ${startMarker}: ${endMarker}`);
  return code.slice(0, start) + replacement + code.slice(end);
}

function backupRow(row, historyRow, suffix) {
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const backupPath = path.join(backupDir, `workflow_${row.id}_before_${suffix}_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));
  return backupPath;
}

function patchPromptLibrary(code) {
  code = code
    .replaceAll('Vector Collection: qa-knowledge-base', 'Model: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}')
    .replaceAll('Model: gpt-4o-mini\nModel: ${runtimeGenerationModel}', 'Model: ${runtimeGenerationModel}')
    .replaceAll('Model: gpt-4o-mini\nVector Collection: qa-knowledge-base', 'Model: ${runtimeGenerationModel}\nVector Collection: ${runtimeChromaCollection}');

  const retrievalFnStart = 'function buildRetrievalProfileInstructions(profile, type, projectName, compositeKeys) {';
  const retrievalFnEnd = 'const contentSources = resolveContentSources(type);';
  const retrievalFn = `function buildRetrievalProfileInstructions(profile, type, projectName, compositeKeys) {
  const allDocTypes = canonical(profile.primaryDocTypes.concat(profile.secondaryDocTypes));
  const queryFacets = canonical([
    profile.intent,
    profile.primaryDocTypes.join(' '),
    profile.preferredCategories.join(' '),
    profile.preferredArtifacts.join(' '),
    profile.sectionKeywords.join(' ')
  ]);
  const lines = [
    '==============================',
    'METADATA RETRIEVAL PROFILE',
    '==============================',
    '',
    'Use Chroma retrieval with metadata.project as the hard project boundary.',
    'Project hard filter: project = ' + projectName,
    'Requested document type: ' + type,
    'Profile: ' + profile.label,
    'Profile intent: ' + profile.intent,
    '',
    'Retrieval execution rules:',
    '1. Query the Chroma tool using multiple targeted facets, not one broad query. Use these facets: ' + queryFacets.join(' | ') + '.',
    '2. Prefer primary docTypes first, then secondary docTypes. Primary docTypes: ' + profile.primaryDocTypes.join(', ') + '.',
    '3. Deduplicate retrieved evidence by chunkId first, then by fileName + sectionTitle + contentSource.',
    '4. Maintain source diversity where available. Use evidence from requirements, design, transcripts/workshops, QA seed, API/UI/data sources as relevant to this document type.',
    '5. Treat label-only pageContent such as technical_design, quality_assurance, or functional_requirements as weak metadata-only evidence. Do not quote it as source text.',
    '6. Every citation, source reference, and Coverage Ledger source must be copied from retrieved metadata. Do not cite files, sections, or chunkIds that were not retrieved.',
    '7. If a required evidence class is not retrieved, mark the related item partial or missing instead of inventing a source.',
    '',
    'When using the Chroma Vector Store tool, prefer chunks with these metadata values:',
    '- Primary docTypes: ' + profile.primaryDocTypes.join(', '),
    '- Secondary docTypes: ' + profile.secondaryDocTypes.join(', '),
    '- Preferred documentCategory values: ' + profile.preferredCategories.join(', '),
    '- Preferred artifactType values: ' + profile.preferredArtifacts.join(', '),
    '- Preferred contentSource values: text, image',
    '- Preferred section/content keywords: ' + profile.sectionKeywords.join(', '),
    '',
    'Source reference rules:',
    '- Use exact source metadata in this compact format: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.',
    '- Never use pipe characters in source references inside tables.',
    '- Never shorten chunk IDs with ellipses. Use the full chunkId when it is available.',
    '- Never use bracketed source references like [BRD | file | section | chunkId] in tables.',
    '',
    'Useful compositeKey candidates for this project/profile:',
    compositeKeys.slice(0, 30).join(', ') || 'None'
  ];

  return lines.join('\\n');
}

`;
  if (!code.includes('Treat label-only pageContent')) {
    code = replaceBlock(code, retrievalFnStart, retrievalFnEnd, retrievalFn);
  }
  code = code.replace(
    "'1. Query the Chroma tool using multiple targeted facets, not one broad query. Use these facets: ' + queryFacets.join(' | ') + '.',",
    "'1. Use at most 2 Chroma retrieval calls. Start with the profile intent and primary document types; if evidence is weak, use one narrower follow-up with section keywords. Do not keep retrying retrieval. Suggested facets: ' + queryFacets.join(' / ') + '.',"
  );
  code = code.replace(
    "'7. If a required evidence class is not retrieved, mark the related item partial or missing instead of inventing a source.',",
    "'7. If a required evidence class is not retrieved after the capped retrieval calls, mark the related item partial or missing instead of inventing a source.',"
  );

  code = code.replace(
    "'Use Source Reference values such as docType + fileName + sectionTitle/chunkId whenever available.',",
    [
      "'Use Source Reference values in this format: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.',",
      "'Do not use pipe characters, bracketed pipe references, or shortened chunk IDs in Coverage Ledger source references.',",
      "'Do not repeat the Coverage Ledger table header. Emit one header row and then data rows only.',"
    ].join('\n    ')
  );

  const sharedReminder = `const sharedCoverageGateReminder = sharedCoveragePlanningProfile
  ? [
      '========================',
      'SHARED DOCUMENT COVERAGE PLANNING REMINDER',
      '========================',
      'This ' + sharedCoveragePlanningProfile.label + ' must include one Coverage Ledger section using the required ledger table.',
      'Use the ledger to prove that major retrieved source signals were covered, partially covered, missing, or intentionally excluded.',
      'If any ledger item is partial, missing, or unknown, add a short Coverage Review Note near the top of the document.',
      'Coverage gaps are warning-level for this rollout, but the ledger itself should be accurate and reviewable.'
    ].join('\\n')
  : '';

const sharedDocumentFormatReminder = ['test_strategy', 'test_plan', 'risk_matrix'].includes(type)
  ? [
      '========================',
      'SHARED CONFLUENCE DOCUMENT SAFETY RULES',
      '========================',
      'Use markdown tables only when the table has 7 or fewer columns. For wider data, split into a summary table plus detail sections.',
      'Do not place long source references, mitigation text, contingency text, or detection text inside a crowded table.',
      'Never put pipe characters inside table cells. Convert source references to: DocType - FileName - SectionTitle - chunkId:FULL_CHUNK_ID.',
      'Do not truncate chunk IDs with ellipses. Use the full chunkId if available, or write chunkId not available.',
      'Do not invent specific dates, KPI targets, approval/sign-off status, implementation status, execution status, or risk scores. If inferred, label them Proposed or Recommended pending stakeholder validation.',
      'Do not include conversational assistant closings such as Please advise, Let me know, or If you need.',
      type === 'risk_matrix'
        ? 'Risk Matrix layout: do not create one large risk table. Use Risk Register Summary with columns Risk ID, Category, Risk Description, Probability, Impact, Risk Score, Owner. Then add Risk Detail Register with Risk ID, Source Reference, Mitigation Plan, Contingency Plan, Detection Strategy, Scoring Rationale.'
        : '',
      type === 'test_plan'
        ? 'Test Plan schedule dates must be marked Proposed unless dates are present in retrieved evidence. Approval/sign-off must be phrased as planned or required, not completed.'
        : '',
      type === 'test_strategy'
        ? 'Test Strategy KPI targets must be marked Proposed unless the targets are present in retrieved evidence.'
        : ''
    ].filter(Boolean).join('\\n')
  : '';`;

  if (!code.includes('SHARED CONFLUENCE DOCUMENT SAFETY RULES')) {
    code = code.replace(
      /const sharedCoverageGateReminder = sharedCoveragePlanningProfile[\s\S]*?\n  : '';/,
      sharedReminder
    );
    code = code.replace(
      '  sharedCoverageGateReminder,\n  retryGuidance,',
      '  sharedCoverageGateReminder,\n  sharedDocumentFormatReminder,\n  retryGuidance,'
    );
  }

  code = code.replace(
    /type === 'traceability_matrix'\s*\? 'Additional RTM Confluence requirement:[\s\S]*?: 'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful\. Where possible, cite source metadata in the format \[docType \| source file \| sectionTitle \| chunkId\]\.'/,
    `type === 'traceability_matrix'
    ? 'Additional RTM Confluence requirement: keep tables column-safe. Use source metadata in table cells as DocType - source file - sectionTitle - chunkId. Never use [docType | source file | sectionTitle | chunkId] inside RTM tables.'
    : 'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Cite source metadata in the table-safe format DocType - source file - sectionTitle - chunkId:FULL_CHUNK_ID.'`
  );

  return code;
}

function patchValidateCode(code) {
  if (!code.includes('partialItems: []')) {
    code = code.replace(
      "    gateStatus: 'not_reported',\n    missingItems: []",
      "    gateStatus: 'not_reported',\n    missingItems: [],\n    partialItems: [],\n    unknownItems: [],\n    warningItems: []"
    );
    code = code.replace(
      /summary\.missingItems = coverageLedger[\s\S]*?\n  if \(!coverageLedger\.length\) \{/,
      `summary.missingItems = coverageLedger
    .filter(row => row.coverageStatus === 'missing')
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));
  summary.partialItems = coverageLedger
    .filter(row => row.coverageStatus === 'partial')
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));
  summary.unknownItems = coverageLedger
    .filter(row => row.coverageStatus === 'unknown')
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));
  summary.warningItems = coverageLedger
    .filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus))
    .slice(0, 25)
    .map(row => ({
      coverageId: row.coverageId,
      moduleRequirement: row.moduleRequirement,
      coverageStatus: row.coverageStatus,
      notes: row.notes
    }));

  if (!coverageLedger.length) {`
    );
  }

  return code;
}

function sharedCleanupBlock() {
  return `function tableSafeCell(value) {
  const normalized = String(value ?? 'Not available')
    .replace(/\\[[^\\]\\n]*\\|[^\\]\\n]*\\]/g, match => match.slice(1, -1).replace(/\\|/g, ' - '))
    .replace(/\\|/g, '-')
    .replace(/[\\r\\n]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
  return normalized || 'Not available';
}

function splitMarkdownTableLine(line) {
  return String(line || '').trim().replace(/^\\|/, '').replace(/\\|$/, '').split('|').map(cell => cell.trim());
}

function isMarkdownTableLine(line) {
  return /^\\s*\\|.*\\|\\s*$/.test(String(line || ''));
}

function isMarkdownSeparatorLine(line) {
  return splitMarkdownTableLine(line).every(cell => /^:?-{3,}:?$/.test(cell));
}

function normalizeTableRows(text) {
  return String(text || '').split(/\\r?\\n/).map(line => {
    if (!isMarkdownTableLine(line)) return line;
    const cells = splitMarkdownTableLine(line).map(tableSafeCell);
    return '| ' + cells.join(' | ') + ' |';
  }).join('\\n');
}

function removeDuplicateCoverageLedgerHeader(text) {
  const lines = String(text || '').split(/\\r?\\n/);
  const result = [];
  let inCoverage = false;
  let seenHeader = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (/^\\s*#{0,6}\\s*coverage ledger\\s*:?\\s*$/i.test(line) || /^\\s*#{1,6}\\s+.*coverage\\s+ledger/i.test(line)) {
      inCoverage = true;
      seenHeader = false;
      result.push(line);
      continue;
    }
    if (inCoverage && /^\\s*#{1,6}\\s+/.test(line) && !/coverage\\s+ledger/i.test(line)) {
      inCoverage = false;
    }
    if (inCoverage && isMarkdownTableLine(line)) {
      const joined = splitMarkdownTableLine(line).join(' ').toLowerCase();
      const isCoverageHeader = joined.includes('coverage id') && joined.includes('module') && joined.includes('status');
      if (isCoverageHeader) {
        if (seenHeader) {
          if (isMarkdownSeparatorLine(lines[i + 1] || '')) i += 1;
          continue;
        }
        seenHeader = true;
      }
    }
    result.push(line);
  }
  return result.join('\\n');
}

function stripAssistantClosings(text) {
  return String(text || '')
    .replace(/^\\s*(Please advise|Let me know|If you need|If you would like)[^\\n]*(?:\\n|$)/gim, '')
    .trim();
}

function normalizeRuntimeHeader(text) {
  const model = $('Restore Job Context').item.json.configSnapshot?.models?.generationModel || 'gpt-4.1-mini';
  const collection = $('Restore Job Context').item.json.configSnapshot?.chroma?.collection || 'qa-chunks-batches';
  return String(text || '')
    .replace(/Model:\\s*gpt-4o-mini/g, 'Model: ' + model)
    .replace(/Vector Collection:\\s*qa-knowledge-base/g, 'Vector Collection: ' + collection);
}

function injectSharedCoverageNotice(text, coverageSummary) {
  if (!['test_strategy', 'test_plan', 'risk_matrix'].includes(documentType)) return text;
  const summary = coverageSummary || {};
  if (summary.gateStatus !== 'warning' || /Coverage Review Note/i.test(text)) return text;
  const warningCount = Number(summary.partialCount || 0) + Number(summary.missingCount || 0) + Number(summary.unknownCount || 0);
  const notice = [
    '### Coverage Review Note',
    '',
    'Coverage review recommended: ' + (Number(summary.coveredCount) || 0) + ' item(s) are covered and ' + warningCount + ' item(s) need review. Review the Coverage Ledger before final sign-off.',
    ''
  ].join('\\n');
  const firstHeading = String(text || '').match(/^#{1,2}\\s+.+$/m);
  if (firstHeading) {
    const index = firstHeading.index + firstHeading[0].length;
    return text.slice(0, index) + '\\n\\n' + notice + text.slice(index).replace(/^\\n+/, '\\n');
  }
  return notice + String(text || '');
}

function splitRiskMatrixWideTable(text) {
  if (documentType !== 'risk_matrix') return text;
  const lines = String(text || '').split(/\\r?\\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isMarkdownTableLine(line)) {
      out.push(line);
      continue;
    }
    const header = splitMarkdownTableLine(line);
    const normalizedHeader = header.map(cell => cell.toLowerCase());
    const isRiskWideTable = ['risk id', 'risk category', 'risk description', 'source reference', 'probability', 'impact', 'risk score', 'mitigation plan', 'contingency plan', 'owner', 'detection strategy']
      .every(required => normalizedHeader.includes(required));
    if (!isRiskWideTable) {
      out.push(line);
      continue;
    }

    const group = [line];
    let j = i + 1;
    while (j < lines.length && isMarkdownTableLine(lines[j])) {
      group.push(lines[j]);
      j += 1;
    }
    i = j - 1;

    const indexes = Object.fromEntries(normalizedHeader.map((name, index) => [name, index]));
    const dataRows = group.slice(1).filter(row => !isMarkdownSeparatorLine(row)).map(splitMarkdownTableLine);
    out.push('### Risk Register Summary', '');
    out.push('| Risk ID | Category | Risk Description | Probability | Impact | Risk Score | Owner |');
    out.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const row of dataRows) {
      out.push('| ' + [
        row[indexes['risk id']],
        row[indexes['risk category']],
        row[indexes['risk description']],
        row[indexes.probability],
        row[indexes.impact],
        row[indexes['risk score']],
        row[indexes.owner]
      ].map(tableSafeCell).join(' | ') + ' |');
    }
    out.push('', '### Risk Detail Register', '');
    out.push('| Risk ID | Source Reference | Mitigation Plan | Contingency Plan | Detection Strategy | Scoring Rationale |');
    out.push('| --- | --- | --- | --- | --- | --- |');
    for (const row of dataRows) {
      out.push('| ' + [
        row[indexes['risk id']],
        row[indexes['source reference']],
        row[indexes['mitigation plan']],
        row[indexes['contingency plan']],
        row[indexes['detection strategy']],
        'Recommended score based on retrieved impact and likelihood evidence; validate with stakeholders before sign-off.'
      ].map(tableSafeCell).join(' | ') + ' |');
    }
  }
  return out.join('\\n');
}

function applySharedDocumentCleanup(text, coverageSummary) {
  let cleaned = String(text || '');
  cleaned = normalizeRuntimeHeader(cleaned);
  cleaned = stripAssistantClosings(cleaned);
  cleaned = normalizeTableRows(cleaned);
  cleaned = splitRiskMatrixWideTable(cleaned);
  cleaned = removeDuplicateCoverageLedgerHeader(cleaned);
  cleaned = injectSharedCoverageNotice(cleaned, coverageSummary);
  return cleaned.trim();
}

`;
}

function patchQualityGate(code) {
  if (!code.includes('function applySharedDocumentCleanup')) {
    code = code.replace('const MIN_WORD_COUNTS = {', sharedCleanupBlock() + '\nrawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary);\n\nconst MIN_WORD_COUNTS = {');
  }
  code = code.replace('const wordCount = data.wordCount || 0;', 'let wordCount = data.wordCount || 0;');
  code = code.replace(
    'rawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary);\n\nconst MIN_WORD_COUNTS = {',
    "rawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary);\nwordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;\n\nconst MIN_WORD_COUNTS = {"
  );
  code = code.replaceAll('coverageSummary.warningItems || coverageSummary.warningItems || coverageSummary.missingItems || []', 'coverageSummary.warningItems || coverageSummary.missingItems || []');
  code = code.replaceAll('missingItems: []', 'missingItems: [], partialItems: [], unknownItems: [], warningItems: []');
  code = code.replaceAll('coverageSummary.missingItems || []', 'coverageSummary.warningItems || coverageSummary.missingItems || []');
  code = code.replaceAll('missingCoverageItems: coverageSummary.missingItems || []', 'missingCoverageItems: coverageSummary.warningItems || coverageSummary.missingItems || []');
  code = code.replaceAll('coverageSummary.warningItems || coverageSummary.warningItems || coverageSummary.missingItems || []', 'coverageSummary.warningItems || coverageSummary.missingItems || []');
  return code;
}

function patchStartedMetric(node) {
  const body = node.parameters.jsonBody;
  if (body.includes('"event": "JOB_STARTED"')) {
    node.parameters.jsonBody = body.replace('"event": "JOB_STARTED"', '"event": "GENERATOR_STARTED"');
  }
}

function patchAgentControls(node) {
  node.parameters.options = node.parameters.options || {};
  node.parameters.options.maxIterations = 4;
}

function patchChromaRetrieval(node) {
  node.parameters.topK = '={{ Math.min(Number($(\'' + 'Prompt Library' + '\').item.json.configSnapshot?.chroma?.topK || 20), 12) }}';
}

function patchDataLoader(node) {
  node.parameters.dataType = 'json';
  node.parameters.jsonMode = 'expressionData';
  node.parameters.jsonData = '={{ $json.pageContent }}';
  node.parameters.textSplittingMode = 'custom';
  node.parameters.options = node.parameters.options || {};
  node.parameters.options.pointers = '';
}

function patchRetrievalWorkflow(nodes) {
  requireNode(nodes, 'Prompt Library').parameters.jsCode = patchPromptLibrary(requireNode(nodes, 'Prompt Library').parameters.jsCode);
  requireNode(nodes, 'Validate AI Agent Output').parameters.jsCode = patchValidateCode(requireNode(nodes, 'Validate AI Agent Output').parameters.jsCode);
  requireNode(nodes, 'Quality Gate').parameters.jsCode = patchQualityGate(requireNode(nodes, 'Quality Gate').parameters.jsCode);
  patchAgentControls(requireNode(nodes, 'Generator Agent'));
  patchChromaRetrieval(requireNode(nodes, 'Chroma Vector Store'));
  patchStartedMetric(requireNode(nodes, 'Log: Job Started'));

  for (const name of ['Prompt Library', 'Validate AI Agent Output', 'Quality Gate']) {
    try {
      new Function(requireNode(nodes, name).parameters.jsCode);
    } catch (error) {
      throw new Error(`Patched ${name} code is invalid: ${error.message}`);
    }
  }
}

function patchIngestionWorkflow(nodes) {
  patchDataLoader(requireNode(nodes, 'Default Data Loader'));
}

async function patchWorkflow(db, workflowId, suffix, patcher) {
  const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const historyRow = row.activeVersionId
    ? await get(db, 'select versionId, workflowId, nodes, connections, updatedAt from workflow_history where workflowId = ? and versionId = ?', [workflowId, row.activeVersionId])
    : null;

  const backupPath = backupRow(row, historyRow, suffix);
  const nodes = parseAny(row.nodes);
  const connections = row.connections ? parseAny(row.connections) : {};
  patcher(nodes, connections);

  const now = new Date().toISOString();
  await run(db, 'update workflow_entity set nodes = ?, connections = ?, updatedAt = ? where id = ?', [
    JSON.stringify(nodes),
    JSON.stringify(connections),
    now,
    workflowId
  ]);
  if (historyRow) {
    await run(db, 'update workflow_history set nodes = ?, connections = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
      JSON.stringify(nodes),
      JSON.stringify(connections),
      now,
      workflowId,
      row.activeVersionId
    ]);
  }
  return { workflowId, workflowName: row.name, activeVersionId: row.activeVersionId, backupPath };
}

function runLocalSmoke() {
  const riskOutput = [
    '# AstraCart Enterprise Risk Assessment Matrix',
    '',
    '| Risk ID | Risk Category | Risk Description | Source Reference | Probability | Impact | Risk Score | Mitigation Plan | Contingency Plan | Owner | Detection Strategy |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    '| R001 | Technical | Payment callback complexity | [HLD | HLD_AstraCart_Ecommerce_Platform.pdf | Supports payment reconciliation triage | chunkId:5691a6e5-...752] | 4 | 5 | 20 | Implement idempotency keys and signatures | Manual reconciliation | Payments Team | Trace ID cross-checks |',
    '',
    '## Coverage Ledger',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '| COV-001 | Payment reconciliation | HLD | Risk Register | covered | Covered |',
    '',
    'Please advise if further granularity or specific module focus is required.'
  ].join('\n');

  function localTableSafeCell(value) {
    return String(value ?? 'Not available')
      .replace(/\[[^\]\n]*\|[^\]\n]*\]/g, match => match.slice(1, -1).replace(/\|/g, ' - '))
      .replace(/\|/g, '-')
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Not available';
  }
  const safe = localTableSafeCell('[HLD | file | section | chunkId:abc]');
  assert(safe === 'HLD - file - section - chunkId:abc', 'table-safe citation conversion');
  assert(!/Please advise/i.test(riskOutput.replace(/^\s*Please advise[^\n]*(?:\n|$)/gim, '')), 'chat closing strip');
}

async function main() {
  runLocalSmoke();
  const db = new sqlite3.Database(dbPath);
  try {
    const retrieval = await patchWorkflow(db, retrievalWorkflowId, 'phase4_shared_doc_quality', patchRetrievalWorkflow);
    const ingestion = await patchWorkflow(db, ingestionWorkflowId, 'phase4_chroma_pagecontent_mapping', patchIngestionWorkflow);
    console.log(JSON.stringify({
      smoke: 'passed',
      patched: [retrieval, ingestion],
      changes: [
        'runtime model/vector headers',
        'stronger retrieval and citation guardrails',
        'coverage partial/missing/unknown item split',
        'shared coverage warning note cleanup',
        'risk matrix wide-table split guard',
        'assistant-closing cleanup',
        'generator start metric renamed to GENERATOR_STARTED',
        'future Chroma inserts use pageContent as document body'
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
