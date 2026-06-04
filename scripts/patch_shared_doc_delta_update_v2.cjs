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

function findFunctionEnd(code, startIndex) {
  const braceStart = code.indexOf('{', startIndex);
  if (braceStart < 0) throw new Error('Function opening brace not found.');
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = braceStart; index < code.length; index += 1) {
    const char = code[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  throw new Error('Function closing brace not found.');
}

function replaceFunction(code, functionName, replacement) {
  const marker = `function ${functionName}`;
  const start = code.indexOf(marker);
  if (start < 0) throw new Error(`Function not found: ${functionName}`);
  const end = findFunctionEnd(code, start);
  return code.slice(0, start) + replacement.trim() + code.slice(end);
}

function replaceBlock(code, startMarker, endMarker, replacement) {
  const start = code.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${startMarker}`);
  const end = code.indexOf(endMarker, start);
  if (end < 0) throw new Error(`End marker not found: ${endMarker}`);
  return code.slice(0, start) + replacement.trim() + '\n\n' + code.slice(end);
}

function replaceOnce(code, search, replacement) {
  if (!code.includes(search)) throw new Error(`Search text not found: ${search.slice(0, 160)}`);
  return code.replace(search, replacement);
}

const sharedDeltaPromptV2 = `
function buildSharedDeltaUpdateInstructions(type, generationMode, updateContext, profile) {
  const sharedTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);
  if (!sharedTypes.has(type) || generationMode !== 'update') return '';
  const updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons : [];
  const previousCoverageLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];
  const previousUpdateSummary = updateContext.previousUpdateSummary || {};
  const previousTokenUsage = updateContext.previousTokenUsage || {};
  const sectionHints = {
    test_strategy: ['Introduction & Context', 'Testing Scope', 'Strategic Testing Approach', 'Automation Strategy & Roadmap', 'Quality Metrics & Reporting Framework', 'Risk-Based Testing & Mitigation Strategy', 'Appendix / Coverage Ledger'],
    test_plan: ['Scope', 'Test Objectives', 'Entry and Exit Criteria', 'Risks, Mitigation & Contingency Plan', 'Test Environment', 'Test Data and Configurations', 'Automation Coverage Matrix', 'Appendix / Coverage Ledger'],
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
    'SHARED_DELTA_UPDATE_V2',
    '==============================',
    '',
    'This is a cost-optimized update patch for an existing shared QA deliverable.',
    'Output a compact patch, not a full replacement document. The workflow will merge this patch with the existing Confluence page.',
    'Target 700-1400 words. Do not restate stable sections. Only describe sections that changed, were added, were removed, or need review.',
    'If no material source or coverage change exists, return only Delta Update Summary and state that no content changes were needed.',
    '',
    'Required patch sections:',
    '1. Delta Update Summary',
    '2. Updated or Added Sections',
    '3. Preserved Sections',
    '4. Coverage Ledger Delta',
    '',
    'Delta Update Summary must contain a markdown table with exactly these columns:',
    '| Section | Action | Reason | Evidence Reference | Review Status |',
    'Use Action values only from: updated, added, removed, preserved, no_change, needs_review.',
    'Normalize section names to the likely impacted section names from the context. Do not use short aliases if a canonical section name exists.',
    '',
    'Evidence rules:',
    '- Every updated, added, or removed row must cite a direct retrieved evidence reference with a concrete chunkId.',
    '- Do not use broad references such as derived from FRD/LLD, grooming insights, internal compilation, multiple documents, or personas and transcripts.',
    '- If direct evidence is unavailable, set Action to needs_review, Review Status to Needs review, and explain the missing evidence plainly.',
    '- Coverage Ledger Delta rows with broad or inferred evidence must be marked partial or needs_review, not covered.',
    '',
    'Preservation rules:',
    '- Preserved Sections should be a compact list or compact table. Do not rewrite preserved content.',
    '- Do not list a section as preserved if the same canonical section is updated, added, removed, or needs_review.',
    '',
    'Shared document update context JSON:',
    JSON.stringify(compactContext)
  ].join('\\n');
}`;

const sharedDeltaQualityHelpersV2 = `
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

function sectionKey(value) {
  return String(value || '')
    .replace(/^\\s*\\d+[.)-]?\\s*/, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canonicalSharedSectionName(documentType, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const key = sectionKey(raw);
  const aliases = {
    test_strategy: {
      'quality metrics reporting': 'Quality Metrics & Reporting Framework',
      'quality metrics and reporting': 'Quality Metrics & Reporting Framework',
      'quality metrics reporting framework': 'Quality Metrics & Reporting Framework',
      'quality metrics and reporting framework': 'Quality Metrics & Reporting Framework',
      'risk based testing mitigation': 'Risk-Based Testing & Mitigation Strategy',
      'risk based testing and mitigation': 'Risk-Based Testing & Mitigation Strategy',
      'risk based testing mitigation strategy': 'Risk-Based Testing & Mitigation Strategy',
      'risk based testing and mitigation strategy': 'Risk-Based Testing & Mitigation Strategy',
      'coverage ledger': 'Appendix / Coverage Ledger',
      'appendix coverage ledger': 'Appendix / Coverage Ledger',
      'appendix traceability matrix': 'Appendix / Coverage Ledger',
      'automation strategy roadmap': 'Automation Strategy & Roadmap',
      'strategic testing approach': 'Strategic Testing Approach',
      'testing scope': 'Testing Scope'
    },
    test_plan: {
      'coverage ledger': 'Appendix / Coverage Ledger',
      'appendix coverage ledger': 'Appendix / Coverage Ledger',
      'risks mitigation contingency plan': 'Risks, Mitigation & Contingency Plan',
      'test data configurations': 'Test Data and Configurations',
      'entry exit criteria': 'Entry and Exit Criteria'
    },
    risk_matrix: {
      'coverage ledger': 'Coverage Ledger',
      'risk identification and categorization': 'Risk Detail Register',
      'main risk identification table': 'Risk Detail Register',
      'top 5 critical risks analysis': 'Top Critical Risks Analysis'
    }
  };
  if (aliases[documentType]?.[key]) return aliases[documentType][key];
  const canonical = sharedDocumentSections(documentType).find(section => sectionKey(section) === key);
  return canonical || raw;
}

function normalizeDeltaAction(value) {
  const action = String(value || '').trim().toLowerCase().replace(/\\s+/g, '_');
  if (['updated', 'update', 'modified', 'changed', 'refreshed'].includes(action)) return 'updated';
  if (['added', 'add', 'new', 'created'].includes(action)) return 'added';
  if (['removed', 'remove', 'deleted'].includes(action)) return 'removed';
  if (['preserved', 'preserve', 'unchanged', 'reused', 'retained'].includes(action)) return 'preserved';
  if (['no_change', 'none', 'no_changes'].includes(action)) return 'no_change';
  if (['needs_review', 'review', 'needs-review', 'partial', 'weak_evidence'].includes(action)) return 'needs_review';
  return action || 'updated';
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(value => String(value || '').trim())
    .filter(Boolean))];
}

function hasConcreteChunkReference(value) {
  return /chunkIds?\\s*[:=]\\s*[A-Za-z0-9][A-Za-z0-9_.:-]{7,}/i.test(String(value || ''));
}

function findDeltaEvidenceIssues(value) {
  const text = String(value || '').trim();
  const issues = [];
  if (!hasConcreteChunkReference(text)) issues.push('missing concrete chunkId');
  if (/\\b(derived|internal compilation|compiled|combined|multiple documents|various|grooming insights|personas and transcripts|frd,\\s*lld|brd personas|source combinations?)\\b/i.test(text)) {
    issues.push('broad or inferred evidence');
  }
  if (/\\.\\.\\./.test(text)) issues.push('truncated evidence');
  return issues;
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
    const cells = trimmed.slice(1, -1).split('|').map(cell => cell.trim());
    if (cells.length < 2) continue;
    rows.push({
      section: cells[0] || '',
      action: normalizeDeltaAction(cells[1]),
      reason: cells[2] || '',
      evidenceReference: cells.slice(3, -1).join(' | ') || cells[3] || '',
      reviewStatus: cells.length > 4 ? cells[cells.length - 1] : ''
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
    if (reasons.includes('knowledge base')) sections.push('Scope', 'Test Objectives', 'Risks, Mitigation & Contingency Plan', 'Test Data and Configurations', 'Appendix / Coverage Ledger');
    if (reviewCount) sections.push('Appendix / Coverage Ledger');
  } else if (documentType === 'test_strategy') {
    if (reasons.includes('knowledge base')) sections.push('Testing Scope', 'Strategic Testing Approach', 'Risk-Based Testing & Mitigation Strategy', 'Appendix / Coverage Ledger');
    if (reviewCount) sections.push('Appendix / Coverage Ledger');
  }
  return uniqueStrings(sections);
}

function buildSharedDocumentDeltaUpdateSummary(documentType, generationMode, updateContext, markdown, coverageLedger, coverageSummary, batchSummary, data) {
  const sharedTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);
  if (!sharedTypes.has(documentType) || generationMode !== 'update') return null;
  const rawRows = parseDeltaUpdateSummaryRows(markdown);
  const canonicalSections = sharedDocumentSections(documentType);
  const updateReasons = Array.isArray(updateContext?.updateReasons) ? updateContext.updateReasons : [];
  const rows = rawRows.map(row => {
    const evidenceIssues = findDeltaEvidenceIssues(row.evidenceReference);
    const hasBroadEvidence = evidenceIssues.some(issue => issue !== 'missing concrete chunkId');
    const action = (hasBroadEvidence || (evidenceIssues.length && ['updated', 'added', 'removed'].includes(row.action))) ? 'needs_review' : row.action;
    return {
      ...row,
      section: canonicalSharedSectionName(documentType, row.section),
      action,
      evidenceIssues,
      reviewStatus: evidenceIssues.length ? 'Needs review' : (row.reviewStatus || 'Direct evidence')
    };
  });
  let updatedSections = uniqueStrings(rows.filter(row => row.action === 'updated').map(row => row.section));
  let addedSections = uniqueStrings(rows.filter(row => row.action === 'added').map(row => row.section));
  let removedSections = uniqueStrings(rows.filter(row => row.action === 'removed').map(row => row.section));
  let needsReviewSections = uniqueStrings(rows.filter(row => row.action === 'needs_review').map(row => row.section));
  let preservedSections = uniqueStrings(rows.filter(row => ['preserved', 'no_change'].includes(row.action)).map(row => row.section));
  if (!updatedSections.length && !addedSections.length && !removedSections.length && !needsReviewSections.length) {
    updatedSections = inferSharedUpdatedSections(documentType, updateReasons, coverageSummary);
  }
  const changedKeys = new Set([...updatedSections, ...addedSections, ...removedSections, ...needsReviewSections].map(sectionKey));
  preservedSections = preservedSections.filter(section => !changedKeys.has(sectionKey(section)));
  if (!preservedSections.length) {
    preservedSections = canonicalSections.filter(section => !changedKeys.has(sectionKey(section)));
  }
  const previousTokenUsage = updateContext?.previousTokenUsage || {};
  const previousTokensTotal = Number(previousTokenUsage.total ?? previousTokenUsage.tokensTotal ?? updateContext?.previousTokensTotal ?? 0) || 0;
  const currentTokensTotal = Number(data.tokensTotal) || ((Number(data.tokensInput) || 0) + (Number(data.tokensOutput) || 0));
  const previousCostUsd = Number(previousTokenUsage.estimatedCostUsd ?? previousTokenUsage.estimated_cost_usd ?? 0) || 0;
  const currentCostUsd = Number(data.estimatedCostUsd) || 0;
  const estimatedTokensSaved = previousTokensTotal ? Math.max(0, previousTokensTotal - currentTokensTotal) : 0;
  const estimatedCostSavedUsd = previousCostUsd ? Math.max(0, previousCostUsd - currentCostUsd) : 0;
  const estimatedSavingsPercent = previousTokensTotal ? Math.round((estimatedTokensSaved / previousTokensTotal) * 100) : null;
  const noChangesDetected = updateReasons.length === 0 && updatedSections.length === 0 && addedSections.length === 0 && removedSections.length === 0 && needsReviewSections.length === 0;
  const evidenceQualityIssues = rows
    .filter(row => row.evidenceIssues?.length)
    .map(row => ({
      section: row.section,
      evidenceReference: row.evidenceReference,
      issues: row.evidenceIssues
    }));

  return {
    enabled: true,
    deltaMode: true,
    deltaPatchMode: true,
    mergedWithExistingConfluence: true,
    version: 'shared-delta-update-v2',
    documentType,
    mode: generationMode,
    sourceOfTruth: updateContext?.updateSourceOfTruth || 'current_retrieval_and_previous_confluence_page',
    updateOfJobId: updateContext?.previousJobId || null,
    previousConfluencePageId: updateContext?.previousConfluencePageId || null,
    updateReasons,
    noChangesDetected,
    changedEvidenceCount: rows.filter(row => ['updated', 'added', 'removed', 'needs_review'].includes(row.action)).length,
    needsReviewSections,
    updatedSections,
    addedSections,
    removedSections,
    preservedSections: noChangesDetected ? canonicalSections : preservedSections,
    updatedSectionCount: updatedSections.length,
    addedSectionCount: addedSections.length,
    removedSectionCount: removedSections.length,
    needsReviewSectionCount: needsReviewSections.length,
    preservedSectionCount: (noChangesDetected ? canonicalSections : preservedSections).length,
    deltaRows: rows,
    evidenceQualityIssues,
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
      : 'Shared document update generated a compact patch and preserved unchanged sections.'
  };
}
`;

const coverageLedgerCleanupHelpers = `
function sharedCoverageTableCell(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/\\|/g, '-')
    .replace(/[\\r\\n]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim() || 'Not available';
}

function sanitizedCoverageLedgerMarkdown(coverageLedger) {
  const rows = Array.isArray(coverageLedger) ? coverageLedger : [];
  if (!rows.length) return '';
  return [
    '### Coverage Ledger',
    '',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows.map(row => '| ' + [
      row.coverageId,
      row.moduleRequirement,
      row.sourceReference,
      row.includedInOutput,
      row.coverageStatus,
      row.notes
    ].map(sharedCoverageTableCell).join(' | ') + ' |')
  ].join('\\n');
}

function replaceSharedCoverageLedgerMarkdown(text, coverageLedger) {
  const sharedTypes = new Set(['test_strategy', 'test_plan', 'risk_matrix']);
  if (!sharedTypes.has(documentType) || !Array.isArray(coverageLedger) || !coverageLedger.length) return text;
  const replacement = sanitizedCoverageLedgerMarkdown(coverageLedger);
  const lines = String(text || '').split(/\\r?\\n/);
  const start = lines.findIndex(line => /^\\s*#{0,6}\\s*(?:Appendix\\s*\\/\\s*)?Coverage\\s+Ledger\\s*:?\\s*$/i.test(line.trim()));
  if (start < 0) return text + '\\n\\n' + replacement;
  let end = start + 1;
  while (end < lines.length && !/^\\s*#{1,6}\\s+/.test(lines[end].trim())) end += 1;
  return [...lines.slice(0, start), replacement, ...lines.slice(end)].join('\\n');
}
`;

const mergeExistingConfluenceExpression = `={{ (() => {
  const prompt = $('Prompt Library').item.json || {};
  const q = $('Restore Quality Gate Output').item.json || {};
  const type = String(prompt.documentType || '').toLowerCase();
  const isSharedUpdate = ['test_strategy', 'test_plan', 'risk_matrix'].includes(type)
    && String(prompt.generationMode || q.generationMode || '').toLowerCase() === 'update'
    && q.updateSummary?.deltaPatchMode;
  const patch = String($json.html || '');
  if (!isSharedUpdate) return patch;
  const existing = String($json.body?.storage?.value || '');
  if (!existing) return patch;
  const start = '<!-- QOPS_DELTA_UPDATE_SUMMARY_START -->';
  const end = '<!-- QOPS_DELTA_UPDATE_SUMMARY_END -->';
  const escapedStart = start.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  const escapedEnd = end.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  let cleanedExisting = existing.replace(new RegExp(escapedStart + '[\\\\s\\\\S]*?' + escapedEnd + '\\\\s*(?:<hr\\\\s*/?>)?', 'i'), '');
  if (/Coverage Ledger/i.test(patch)) {
    cleanedExisting = cleanedExisting.replace(/<h[1-6][^>]*>\\s*(?:\\d+\\.\\s*)?(?:Appendix\\s*\\/\\s*)?Coverage Ledger\\s*<\\/h[1-6]><br\\/>[\\s\\S]*?(?=<h[1-6][^>]*>|$)/i, '');
  }
  return start + patch + '<br/><p><em>Existing Confluence content below was preserved unless explicitly updated in the delta summary.</em></p>' + end + '<hr/>' + cleanedExisting;
})() }}`;

function patchPromptLibrary(code) {
  code = replaceFunction(code, 'buildSharedDeltaUpdateInstructions', sharedDeltaPromptV2);
  code = code.replace("version: sharedDeltaUpdateInstructions ? 'shared-delta-v1' : null", "version: sharedDeltaUpdateInstructions ? 'shared-delta-v2' : null");
  return code;
}

function patchQualityGate(code) {
  code = replaceBlock(
    code,
    'function sharedDocumentSections(documentType)',
    'function buildRtmUpdateSummary(documentType, generationMode, updateContext, coverageLedger, coverageSummary, batchSummary)',
    sharedDeltaQualityHelpersV2
  );

  if (!code.includes('function sharedCoverageTableCell(value)')) {
    code = code.replace('function applySharedDocumentCleanup(text, coverageSummary) {', coverageLedgerCleanupHelpers + '\n\nfunction applySharedDocumentCleanup(text, coverageSummary, coverageLedger) {');
  } else {
    code = code.replace('function applySharedDocumentCleanup(text, coverageSummary) {', 'function applySharedDocumentCleanup(text, coverageSummary, coverageLedger) {');
  }

  if (!code.includes('replaceSharedCoverageLedgerMarkdown(cleaned, coverageLedger)')) {
    code = replaceOnce(
      code,
      '  cleaned = removeDuplicateCoverageLedgerHeader(cleaned);\n  cleaned = injectSharedCoverageNotice(cleaned, coverageSummary);',
      '  cleaned = removeDuplicateCoverageLedgerHeader(cleaned);\n  cleaned = replaceSharedCoverageLedgerMarkdown(cleaned, coverageLedger);\n  cleaned = injectSharedCoverageNotice(cleaned, coverageSummary);'
    );
  }

  code = code.replace('rawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary);', 'rawMarkdown = applySharedDocumentCleanup(rawMarkdown, coverageSummary, coverageLedger);');
  code = code.replace(
    'const minWords = MIN_WORD_COUNTS[documentType] || 500;',
    "const minWords = (generationMode === 'update' && ['test_strategy', 'test_plan', 'risk_matrix'].includes(documentType)) ? 300 : (MIN_WORD_COUNTS[documentType] || 500);"
  );
  return code;
}

function patchNodes(nodes) {
  const prompt = requireNode(nodes, 'Prompt Library');
  const qualityGate = requireNode(nodes, 'Quality Gate');
  const openAi = requireNode(nodes, 'OpenAI Chat Model');
  const getPageDetails = requireNode(nodes, 'Get Page Details');
  const updatePage = requireNode(nodes, 'Update existing Document on Confluence');

  prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
  qualityGate.parameters.jsCode = patchQualityGate(qualityGate.parameters.jsCode);

  openAi.parameters.options = openAi.parameters.options || {};
  openAi.parameters.options.maxTokens = "={{ (() => { const p = $('Prompt Library').item.json || {}; const base = Number(p.configSnapshot?.models?.maxTokens || 8000) || 8000; const type = String(p.documentType || '').toLowerCase(); const isSharedUpdate = ['test_strategy','test_plan','risk_matrix'].includes(type) && String(p.generationMode || '').toLowerCase() === 'update'; return isSharedUpdate ? Math.min(base, 2400) : base; })() }}";

  getPageDetails.parameters.url = "={{ String((($json.configSnapshot || $('Prompt Library').item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || 'https://anujalhans1.atlassian.net/wiki').replace(/\\/$/, '') + '/rest/api/content/' + $json.pageId + '?expand=version,body.storage' }}";

  const bodyParams = updatePage.parameters.bodyParameters?.parameters || [];
  const htmlParam = bodyParams.find(param => param.name === 'body.storage.value');
  if (!htmlParam) throw new Error('body.storage.value parameter not found in update node.');
  htmlParam.value = mergeExistingConfluenceExpression;

  new Function(prompt.parameters.jsCode);
  new Function(qualityGate.parameters.jsCode);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_delta_update_v2_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    patchNodes(nodes);

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
        'SHARED_DELTA_UPDATE_V2 compact patch prompt',
        'shared update max token cap',
        'existing Confluence body fetch',
        'Confluence patch merge instead of full body replacement',
        'canonical section alias handling',
        'delta evidence quality classification',
        'visible shared coverage ledger synchronization',
        'lower quality-gate word minimum for shared update patches'
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
