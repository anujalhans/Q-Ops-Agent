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

const sharedHtmlConverterV9 = String.raw`const q = $('Restore Quality Gate Output').item.json || {};
const prompt = $('Prompt Library').item.json || {};
const restore = $('Restore Job Context').item.json || {};

let md = String($json.cleanedMarkdown || $json.rawMarkdown || '');

const normalizeDocumentType = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const documentType = normalizeDocumentType(prompt.documentType || q.documentType || $json.documentType);
const sharedTypes = ['test_strategy', 'test_plan', 'risk_matrix'];
const isShared = sharedTypes.includes(documentType);
const requestedMode = String(prompt.generationMode || q.generationMode || restore.generationMode || restore.input?.generationMode || '').trim().toLowerCase();
const retryOfJobId = prompt.retryOfJobId || restore.retryOfJobId || restore.input?.retryOfJobId || restore.input?.retryJobId || '';
const isUpdate = requestedMode === 'update';
const operationMode = isUpdate
  ? (retryOfJobId ? 'update_retry' : (prompt.updateContext?.previousCoverageSummary?.gateStatus === 'warning' ? 'update_repair' : 'update_delta'))
  : (retryOfJobId || requestedMode === 'retry' ? 'create_retry' : 'create');

const escapeHtml = (value) => String(value === undefined || value === null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const stripTags = (html) => String(html || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim();

const sectionKey = (value) => String(value || '')
  .replace(/^\s*\d+[.)-]?\s*/, '')
  .replace(/^appendix\s*\/\s*/i, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const canonicalSections = {
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
    'Coverage Ledger'
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
    'Coverage Ledger'
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

const sanitizeSourceMetadata = (value) => String(value || '')
  .replace(/(chunkIds?\s*:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '$1')
  .replace(/(chunkIds?\s*:\s*[A-Za-z0-9_.:-]{12,})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '$1')
  .replace(/\s*\|\s*(?:table|text|image|metadata)\s*\|\s*/gi, ' - ');

function splitMarkdownRow(line) {
  return sanitizeSourceMetadata(line)
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isSeparatorRow(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(String(line || ''));
}

function normalizeCells(cells, headers) {
  const headerCount = headers.length;
  if (!headerCount) return cells;
  if (cells.length === headerCount) return cells;
  const headerLabels = headers.map(header => String(header || '').toLowerCase());
  const sourceIndex = headerLabels.findIndex(label => /source\s+reference|source\s+document|source/.test(label));
  if (sourceIndex >= 0 && cells.length > headerCount) {
    const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);
    const prefix = cells.slice(0, sourceIndex);
    const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];
    const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);
    const repaired = [...prefix, sourceCells.filter(Boolean).join(' - '), ...suffix];
    if (repaired.length === headerCount) return repaired;
  }
  if (cells.length > headerCount) {
    return [...cells.slice(0, headerCount - 1), cells.slice(headerCount - 1).filter(Boolean).join(' - ')];
  }
  const padded = cells.slice(0, headerCount);
  while (padded.length < headerCount) padded.push('Not provided');
  return padded;
}

function convertMarkdownTables(source) {
  const lines = String(source || '').split(/\r?\n/);
  const output = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const next = lines[i + 1] || '';
    if (line.includes('|') && isSeparatorRow(next)) {
      const tableLines = [line, next];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && !/^#{1,6}\s+/.test(lines[i].trim())) {
        tableLines.push(lines[i]);
        i += 1;
      }
      i -= 1;
      const headers = splitMarkdownRow(tableLines[0]).filter(Boolean);
      const rows = tableLines
        .slice(2)
        .map(row => normalizeCells(splitMarkdownRow(row), headers))
        .filter(cells => cells.some(cell => String(cell || '').trim()));
      const table = [
        '<table><tbody><tr>',
        headers.map(header => '<th>' + escapeHtml(header) + '</th>').join(''),
        '</tr>',
        rows.map(cells => '<tr>' + cells.map(cell => '<td>' + escapeHtml(cell || 'Not provided') + '</td>').join('') + '</tr>').join(''),
        '</tbody></table>'
      ].join('');
      output.push(table);
    } else {
      output.push(line);
    }
  }
  return output.join('\n');
}

function markdownToHtml(source) {
  let html = sanitizeSourceMetadata(String(source || ''))
    .replace(/\x60\x60\x60markdown/gi, '')
    .replace(/\x60\x60\x60/g, '')
    .replace(/^[-_]{3,}$/gm, '');
  html = convertMarkdownTables(html);
  html = html
    .replace(/^### (.*$)/gim, '<h3>$1</h3><br/>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2><br/>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1><br/>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(/(<br\/>\s*){2,}/g, '<br/>')
    .replace(/(<\/table>)\s*\|+\s*(?=<h[1-6]\b|$)/gi, '$1');
  return html;
}

function normalizeCellText(html) {
  return stripTags(html).replace(/\\+/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeTablesForConfluence(html) {
  return String(html || '').replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(match => match[0]);
    if (!rows.length) return table;
    const header = rows.find(row => /<th\b/i.test(row)) || rows[0];
    const headerCells = [...header.matchAll(/<t[hd]\b[^>]*>[\s\S]*?<\/t[hd]>/gi)].map(match => match[0]);
    const headerLabels = headerCells.map(normalizeCellText);
    const headerCount = headerCells.length;
    if (!headerCount) return table;
    return table.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
      if (row === header || /<th\b/i.test(row)) return row;
      const cells = [...row.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)].map(match => match[0]);
      if (!cells.length || cells.length === headerCount) return row;
      const sourceIndex = headerLabels.findIndex(label => /source\s+reference|source\s+document|source/i.test(label));
      if (sourceIndex >= 0 && cells.length > headerCount) {
        const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);
        const prefix = cells.slice(0, sourceIndex);
        const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];
        const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);
        const sourceValue = sourceCells.map(normalizeCellText).filter(Boolean).join(' - ');
        const repaired = [...prefix, '<td>' + escapeHtml(sourceValue || 'Not provided') + '</td>', ...suffix];
        if (repaired.length === headerCount) return '<tr>' + repaired.join('') + '</tr>';
      }
      const values = cells.map(normalizeCellText);
      const fixed = normalizeCells(values, headerLabels).map(cell => '<td>' + escapeHtml(cell || 'Not provided') + '</td>');
      return '<tr>' + fixed.join('') + '</tr>';
    });
  });
}

function tableShapeIssues(html) {
  const issues = [];
  String(html || '').replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table, offset) => {
    const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(match => match[0]);
    const header = rows.find(row => /<th\b/i.test(row)) || rows[0];
    const expected = (header.match(/<th\b[^>]*>/gi) || []).length || (header.match(/<td\b[^>]*>/gi) || []).length;
    if (!expected) return table;
    rows.forEach((row, index) => {
      if (row === header) return;
      const count = (row.match(/<td\b[^>]*>/gi) || []).length || (row.match(/<th\b[^>]*>/gi) || []).length;
      if (count && count !== expected) issues.push({ tableOffset: offset, rowIndex: index, expected, actual: count });
    });
    return table;
  });
  return issues;
}

function extractHeadingSections(html) {
  const source = String(html || '');
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/ig;
  const matches = [];
  let match;
  while ((match = re.exec(source)) !== null) {
    matches.push({ level: Number(match[1]), index: match.index, end: re.lastIndex, title: stripTags(match[2]) });
  }
  const required = canonicalSections[documentType] || [];
  const canonicalForKey = (key) => required.find(section => sectionKey(section) === key) || null;
  const sections = new Map();
  const duplicates = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const known = canonicalForKey(sectionKey(current.title));
    if (!known) continue;
    const key = sectionKey(known);
    const next = matches.slice(i + 1).find(candidate => {
      if (canonicalForKey(sectionKey(candidate.title))) return true;
      return candidate.level <= current.level;
    });
    if (sections.has(key)) duplicates.push(known);
    else sections.set(key, { name: known, html: source.slice(current.index, next ? next.index : source.length) });
  }
  const firstKnown = matches.find(item => canonicalForKey(sectionKey(item.title)));
  return { preamble: firstKnown ? source.slice(0, firstKnown.index).trim() : source.trim(), sections, duplicates };
}

function sectionWordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function coverageSummary() {
  return q.coverageSummary || $json.coverageSummary || { gateStatus: 'not_reported', coverageLedgerCount: 0 };
}

function coverageLedger() {
  return Array.isArray(q.coverageLedger) ? q.coverageLedger : Array.isArray($json.coverageLedger) ? $json.coverageLedger : [];
}

function buildCoverageLedgerHtml() {
  const rows = coverageLedger();
  if (!rows.length) return '';
  const body = rows.map(row => '<tr>' + [
    row.coverageId || '',
    row.moduleRequirement || '',
    sanitizeSourceMetadata(row.sourceReference || ''),
    row.includedInOutput || '',
    row.coverageStatus || 'unknown',
    row.notes || ''
  ].map(value => '<td>' + escapeHtml(value || 'Not provided') + '</td>').join('') + '</tr>').join('');
  return '<h2>Coverage Ledger</h2><br/><table><tbody><tr><th>Coverage ID</th><th>Module / Requirement</th><th>Source Reference</th><th>Included In Output</th><th>Coverage Status</th><th>Notes</th></tr>' + body + '</tbody></table>';
}

function buildCoverageReviewNote() {
  const summary = coverageSummary();
  const status = String(summary.gateStatus || summary.status || '').toLowerCase();
  const warningItems = Array.isArray(summary.warningItems) ? summary.warningItems : [
    ...(Array.isArray(summary.partialItems) ? summary.partialItems : []),
    ...(Array.isArray(summary.missingItems) ? summary.missingItems : []),
    ...(Array.isArray(summary.unknownItems) ? summary.unknownItems : [])
  ];
  if (!['warning', 'failed', 'not_reported'].includes(status) && !warningItems.length) return '';
  const rows = warningItems.slice(0, 8).map(item => '<li>' + escapeHtml([
    item.coverageId,
    item.moduleRequirement,
    item.coverageStatus,
    item.notes
  ].filter(Boolean).join(' - ')) + '</li>').join('');
  return [
    '<div data-qops-coverage-review="true" style="border:1px solid #e0b94f;border-radius:10px;padding:12px;margin:12px 0;background:#fff8e1;">',
    '<h2>Coverage Review Note</h2>',
    '<p>Q-Ops completed the document with coverage items that require QA or business review before final sign-off.</p>',
    rows ? '<ul>' + rows + '</ul>' : '<p>Coverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.</p>',
    '</div>'
  ].join('');
}

function buildEvidenceGapSection(section) {
  return '<h2>' + escapeHtml(section) + '</h2><br/><p>Evidence review required: Q-Ops preserved the required document structure, but the generated output did not contain enough validated source-backed content for this section. Review source coverage before final sign-off.</p>';
}

function finalizeSharedCreateOrRetry(html) {
  const issues = [];
  let normalized = normalizeTablesForConfluence(String(html || '').trim());
  const before = extractHeadingSections(normalized);
  const required = canonicalSections[documentType] || [];
  const ledgerHtml = buildCoverageLedgerHtml();
  const finalSections = new Map(before.sections);

  if (ledgerHtml) finalSections.set(sectionKey('Coverage Ledger'), { name: 'Coverage Ledger', html: ledgerHtml });
  before.duplicates.forEach(section => issues.push({ code: 'duplicate_section_removed', section }));

  for (const section of required) {
    const key = sectionKey(section);
    const existing = finalSections.get(key);
    if (!existing || sectionWordCount(existing.html) < (key === sectionKey('Coverage Ledger') ? 2 : 12)) {
      issues.push({ code: 'required_section_repaired', section });
      finalSections.set(key, {
        name: section,
        html: key === sectionKey('Coverage Ledger') && ledgerHtml ? ledgerHtml : buildEvidenceGapSection(section)
      });
    }
  }

  const preamble = before.preamble || '';
  const coverageNote = buildCoverageReviewNote();
  normalized = [
    preamble,
    coverageNote,
    ...required.map(section => finalSections.get(sectionKey(section))?.html || '').filter(Boolean)
  ].filter(Boolean).join('');
  normalized = normalizeTablesForConfluence(normalized).replace(/(<\/table>)\s*\|+\s*(?=<h[1-6]\b|$)/gi, '$1');
  const malformedTables = tableShapeIssues(normalized);
  if (malformedTables.length) {
    throw new Error('Shared final validation failed: malformed table shape after repair. ' + JSON.stringify(malformedTables.slice(0, 5)));
  }
  const after = extractHeadingSections(normalized);
  const missing = required.filter(section => !after.sections.has(sectionKey(section)));
  if (missing.length) {
    throw new Error('Shared final validation failed: required section(s) still missing after repair: ' + missing.join(', '));
  }
  return { html: normalized, issues };
}

let html = markdownToHtml(md);
let finalValidation = {
  version: 'shared-final-validation-v9',
  status: 'passed',
  structuralStatus: 'passed',
  operationMode,
  documentType,
  issues: [],
  checkedAt: new Date().toISOString()
};

if (isShared && !isUpdate) {
  const finalized = finalizeSharedCreateOrRetry(html);
  html = finalized.html;
  finalValidation.issues = finalized.issues;
  if (finalized.issues.length) {
    finalValidation.status = 'warning';
    finalValidation.structuralStatus = 'repaired';
  }
} else if (isShared && isUpdate) {
  html = normalizeTablesForConfluence(html).replace(/(<\/table>)\s*\|+\s*(?=<h[1-6]\b|$)/gi, '$1');
  const malformedTables = tableShapeIssues(html);
  if (malformedTables.length) {
    throw new Error('Shared update patch validation failed: malformed table shape before merge. ' + JSON.stringify(malformedTables.slice(0, 5)));
  }
  finalValidation.status = 'pending_merge';
  finalValidation.structuralStatus = 'pending_merge';
}

return [{
  json: {
    ...$json,
    html,
    finalValidation,
    diagnostics: {
      validatorVersion: 'shared-final-validation-v9',
      operationMode,
      documentType,
      finalValidation
    }
  }
}];`;

function patchConvertNode(node) {
  node.parameters.jsCode = sharedHtmlConverterV9;
}

function patchQualityGate(node) {
  let code = node.parameters.jsCode;
  code = code.replace(/shared-delta-update-v8/g, 'shared-delta-update-v9');
  code = code.replace(/SHARED_DELTA_UPDATE_V8/g, 'SHARED_DELTA_UPDATE_V9');
  if (!code.includes('function uniqueSectionList(')) {
    code = code.replace(
      'const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);',
      `function uniqueSectionList(values) {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter(value => {
      const key = sectionKey(value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeUpdateSummary(summary) {
  if (!summary || typeof summary !== 'object') return summary;
  const normalized = { ...summary, version: String(summary.version || '').replace(/v8$/i, 'v9') || 'shared-delta-update-v9' };
  normalized.updatedSections = uniqueSectionList(normalized.updatedSections);
  normalized.addedSections = uniqueSectionList(normalized.addedSections);
  normalized.removedSections = uniqueSectionList(normalized.removedSections);
  normalized.needsReviewSections = uniqueSectionList(normalized.needsReviewSections);
  const changedKeys = new Set([
    ...normalized.updatedSections,
    ...normalized.addedSections,
    ...normalized.removedSections,
    ...normalized.needsReviewSections
  ].map(sectionKey));
  normalized.preservedSections = uniqueSectionList(normalized.preservedSections)
    .filter(section => !changedKeys.has(sectionKey(section)));
  normalized.updatedSectionCount = normalized.updatedSections.length;
  normalized.addedSectionCount = normalized.addedSections.length;
  normalized.removedSectionCount = normalized.removedSections.length;
  normalized.needsReviewSectionCount = normalized.needsReviewSections.length;
  normalized.preservedSectionCount = normalized.preservedSections.length;
  const tokenUsage = normalized.tokenUsage || {};
  const total = Number(tokenUsage.total || normalized.tokensTotal || 0) || 0;
  const baseline = Number(normalized.tokenSavings?.estimatedBaselineTokens || normalized.previousTokenUsage?.total || 0) || 0;
  normalized.operationMode = normalized.operationMode || (normalized.deltaPatchMode ? 'update_delta' : 'update_repair');
  if (baseline && total && total >= baseline * 0.75) normalized.operationMode = 'update_repair';
  return normalized;
}

const sharedCoveragePlanning = evaluateSharedCoveragePlanning(documentType, coverageLedger, coverageSummary);`
    );
  }
  code = code.replace(
    'const updateSummary = sharedDeltaUpdateSummary || rtmUpdateSummary;',
    'const updateSummary = normalizeUpdateSummary(sharedDeltaUpdateSummary || rtmUpdateSummary);'
  );
  node.parameters.jsCode = code;
}

function patchUpdatePageExpression(node) {
  const params = node.parameters.bodyParameters?.parameters || [];
  const htmlParam = params.find(param => param.name === 'body.storage.value');
  if (!htmlParam) throw new Error('Update body.storage.value parameter not found.');
  let value = String(htmlParam.value || '');
  value = value.replace(/shared-delta-update-v8/g, 'shared-delta-update-v9');
  value = value.replace(/SHARED_DELTA_UPDATE_V8/g, 'SHARED_DELTA_UPDATE_V9');
  if (!value.includes('data-qops-coverage-review')) {
    value = value.replace(
      "const buildSummaryHtml = () => {",
      `const buildCoverageReviewHtml = () => {
    const summary = q.coverageSummary || updateSummary.coverageSummary || {};
    const status = String(summary.gateStatus || summary.status || '').toLowerCase();
    const warningItems = Array.isArray(summary.warningItems) ? summary.warningItems : [
      ...(Array.isArray(summary.partialItems) ? summary.partialItems : []),
      ...(Array.isArray(summary.missingItems) ? summary.missingItems : []),
      ...(Array.isArray(summary.unknownItems) ? summary.unknownItems : [])
    ];
    if (!['warning', 'failed', 'not_reported'].includes(status) && !warningItems.length) return '';
    const rows = warningItems.slice(0, 8).map(item => '<li>' + escapeHtml([
      item.coverageId,
      item.moduleRequirement,
      item.coverageStatus,
      item.notes
    ].filter(Boolean).join(' - ')) + '</li>').join('');
    return [
      '<div data-qops-coverage-review="true" style="border:1px solid #e0b94f;border-radius:10px;padding:12px;margin:12px 0;background:#fff8e1;">',
      '<h2>Coverage Review Note</h2>',
      '<p>Q-Ops completed the update with coverage items that require QA or business review before final sign-off.</p>',
      rows ? '<ul>' + rows + '</ul>' : '<p>Coverage metadata was not fully parsed. Review the Coverage Ledger before sign-off.</p>',
      '</div>'
    ].join('');
  };

  const buildSummaryHtml = () => {`
    );
    value = value.replace(
      "let finalHtml = buildSummaryHtml() + '<hr/>' + body;",
      "let finalHtml = buildSummaryHtml() + buildCoverageReviewHtml() + '<hr/>' + body;"
    );
  }
  htmlParam.value = value;
}

function addAssignment(node, name, value, type = 'object') {
  const assignments = node.parameters.assignments?.assignments;
  if (!Array.isArray(assignments)) throw new Error(`No assignments on ${node.name}`);
  const existing = assignments.find(item => item.name === name);
  if (existing) {
    existing.value = value;
    existing.type = type;
    return;
  }
  assignments.push({ id: `shared-v9-${name}`, name, value, type });
}

function patchRestoreQualityGateOutput(node) {
  addAssignment(node, 'finalValidation', "={{ $('Convert MD -> Confluence Formatted HTML').item.json.finalValidation || { version: 'shared-final-validation-v9', status: 'passed', structuralStatus: 'passed' } }}");
  addAssignment(node, 'diagnostics', "={{ $('Convert MD -> Confluence Formatted HTML').item.json.diagnostics || {} }}");
}

function insertOutputFields(jsonBody) {
  if (jsonBody.includes('"finalValidation"')) return jsonBody;
  return jsonBody.replace(
    '    "qualityGate": {{ JSON.stringify($(\'Restore Quality Gate Output\').item.json.qualityGate || null) }},',
    `    "qualityGate": {{ JSON.stringify($('Restore Quality Gate Output').item.json.qualityGate || null) }},
    "finalValidation": {{ JSON.stringify((() => { const fv = $('Restore Quality Gate Output').item.json.finalValidation || null; return fv?.status === 'pending_merge' ? { ...fv, status: 'passed', structuralStatus: fv.structuralStatus || 'passed', mergeGuard: 'passed' } : (fv || { version: 'shared-final-validation-v9', status: 'passed', structuralStatus: 'passed' }); })()) }},
    "operationMode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary?.operationMode || $('Restore Quality Gate Output').item.json.finalValidation?.operationMode || ($('Restore Job Context').item.json.generationMode === 'update' ? 'update_delta' : (($('Restore Job Context').item.json.retryOfJobId || $('Restore Job Context').item.json.input?.retryJobId) ? 'create_retry' : 'create'))) }},
    "diagnostics": {{ JSON.stringify({ ...($('Restore Quality Gate Output').item.json.diagnostics || {}), finalValidation: (() => { const fv = $('Restore Quality Gate Output').item.json.finalValidation || null; return fv?.status === 'pending_merge' ? { ...fv, status: 'passed', structuralStatus: fv.structuralStatus || 'passed', mergeGuard: 'passed' } : fv; })() }) }},`
  );
}

function insertMetricMetadataFields(jsonBody) {
  if (jsonBody.includes('"final_validation"')) return jsonBody;
  return jsonBody.replace(
    '    "confluence_page_id":',
    `    "final_validation": {{ JSON.stringify((() => { const fv = $('Restore Quality Gate Output').item.json.finalValidation || null; return fv?.status === 'pending_merge' ? { ...fv, status: 'passed', structuralStatus: fv.structuralStatus || 'passed', mergeGuard: 'passed' } : (fv || { version: 'shared-final-validation-v9', status: 'passed', structuralStatus: 'passed' }); })()) }},
    "diagnostics": {{ JSON.stringify($('Restore Quality Gate Output').item.json.diagnostics || {}) }},
    "operation_mode": {{ JSON.stringify($('Restore Quality Gate Output').item.json.updateSummary?.operationMode || $('Restore Quality Gate Output').item.json.finalValidation?.operationMode || ($('Restore Job Context').item.json.generationMode === 'update' ? 'update_delta' : (($('Restore Job Context').item.json.retryOfJobId || $('Restore Job Context').item.json.input?.retryJobId) ? 'create_retry' : 'create'))) }},
    "confluence_page_id":`
  );
}

function patchCompletionNodes(nodes) {
  for (const name of ['Update Job Status as Completed', 'Mark Job Status as Completed']) {
    const node = requireNode(nodes, name);
    node.parameters.jsonBody = insertOutputFields(String(node.parameters.jsonBody || ''));
  }
  for (const name of ['LOG: Confluence Job Completed', 'LOG: Update Confluence Job Completed']) {
    const node = requireNode(nodes, name);
    node.parameters.jsonBody = insertMetricMetadataFields(String(node.parameters.jsonBody || ''));
  }
}

function patchFailureNodes(nodes) {
  const generatorHandler = requireNode(nodes, 'Handle: Generator Agent Failed');
  if (!String(generatorHandler.parameters.jsCode).includes('diagnostics')) {
    generatorHandler.parameters.jsCode = generatorHandler.parameters.jsCode.replace(
      'timestamp: new Date().toISOString()',
      `timestamp: new Date().toISOString(),
      diagnostics: {
        version: 'shared-final-validation-v9',
        jobId,
        documentType,
        projectName,
        failedNode: 'Generator Agent',
        errorType: 'GENERATOR_AGENT_FAILED',
        errorMessage,
        errorDescription,
        operationMode: $('Restore Job Context').item.json.generationMode || 'create'
      }`
    );
  }

  const generatorMetric = requireNode(nodes, 'LOG: Generator Agent Failed');
  if (!String(generatorMetric.parameters.jsonBody).includes('"diagnostics"')) {
    generatorMetric.parameters.jsonBody = String(generatorMetric.parameters.jsonBody).replace(
      '    "failed_at":         "{{ $json.timestamp }}"',
      `    "failed_at":         "{{ $json.timestamp }}",
    "diagnostics": {{ JSON.stringify($json.diagnostics || {}) }}`
    );
  }

  const generatorStatus = requireNode(nodes, 'Update Job Status: Generator Agent Failed');
  if (!String(generatorStatus.parameters.jsonBody).includes('"diagnostics"')) {
    generatorStatus.parameters.jsonBody = String(generatorStatus.parameters.jsonBody).replace(
      '    "failed_at": "{{ $(\'Handle: Generator Agent Failed\').item.json.timestamp }}"',
      `    "failed_at": "{{ $('Handle: Generator Agent Failed').item.json.timestamp }}",
    "diagnostics": {{ JSON.stringify($('Handle: Generator Agent Failed').item.json.diagnostics || {}) }}`
    );
  }

  const confluenceMetric = requireNode(nodes, 'LOG: Confluence Job Failed');
  if (!String(confluenceMetric.parameters.jsonBody).includes('"diagnostics"')) {
    confluenceMetric.parameters.jsonBody = String(confluenceMetric.parameters.jsonBody).replace(
      '    "failed_at": "{{ $now }}"',
      `    "failed_at": "{{ $now }}",
    "diagnostics": {{ JSON.stringify({ version: 'shared-final-validation-v9', failedNode: 'Confluence publish', errorMessage: $json.errorMessage || $json.message || 'Unknown error', operationMode: $('Restore Job Context').item.json.generationMode || 'create', finalValidation: $('Restore Quality Gate Output').item.json.finalValidation || null }) }}`
    );
  }

  const confluenceStatus = requireNode(nodes, 'Update Job Status as Failed');
  if (!String(confluenceStatus.parameters.jsonBody).includes('"diagnostics"')) {
    confluenceStatus.parameters.jsonBody = `={
  "status": "failed",
  "job_id": "{{ $json.job_id || $node['Execute Workflow'].json.job_id }}",
  "error": "{{ $json.errorMessage || $json.message || 'Unknown error occurred' }}",
  "output": {
    "error": true,
    "errorType": "CONFLUENCE_PUBLISH_FAILED",
    "message": "{{ $json.errorMessage || $json.message || 'Unknown error occurred' }}",
    "failed_at": "{{ new Date().toISOString() }}",
    "confluencePageId": null,
    "url": null,
    "documentType": {{ $('Restore Job Context').item.json.documentType ? JSON.stringify($('Restore Job Context').item.json.documentType) : 'null' }},
    "operationMode": {{ JSON.stringify($('Restore Job Context').item.json.generationMode || 'create') }},
    "finalValidation": {{ JSON.stringify($('Restore Quality Gate Output').item.json.finalValidation || null) }},
    "diagnostics": {{ JSON.stringify({ version: 'shared-final-validation-v9', failedNode: 'Confluence publish', errorMessage: $json.errorMessage || $json.message || 'Unknown error occurred', finalValidation: $('Restore Quality Gate Output').item.json.finalValidation || null }) }}
  },
  "updated_at": "{{ new Date().toISOString() }}"
}`;
  }
}

function patchNodes(nodes) {
  patchConvertNode(requireNode(nodes, 'Convert MD -> Confluence Formatted HTML'));
  patchQualityGate(requireNode(nodes, 'Quality Gate'));
  patchUpdatePageExpression(requireNode(nodes, 'Update existing Document on Confluence'));
  patchRestoreQualityGateOutput(requireNode(nodes, 'Restore Quality Gate Output'));
  patchCompletionNodes(nodes);
  patchFailureNodes(nodes);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_final_validation_v9_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    patchNodes(nodes);

    const serializedNodes = JSON.stringify(nodes);
    for (const marker of ['shared-final-validation-v9', 'shared-delta-update-v9', 'finalValidation', 'diagnostics']) {
      if (!serializedNodes.includes(marker)) throw new Error(`Patch verification marker missing: ${marker}`);
    }

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [serializedNodes, now, workflowId]);
    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        serializedNodes,
        now,
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
        'shared final HTML validation V9 for create/create-retry',
        'shared update patch table validation and V9 final metadata',
        'coverage review note injection for create/retry/update',
        'deduped update summary section arrays and counts',
        'finalValidation/operationMode/diagnostics persisted to qa_jobs output and qa_job_metrics metadata',
        'richer generator and Confluence failure diagnostics'
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
