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

const mergeExistingConfluenceExpressionV8 = String.raw`={{ (() => {
  const prompt = $('Prompt Library').item.json || {};
  const q = $('Restore Quality Gate Output').item.json || {};
  const type = String(prompt.documentType || q.documentType || '').toLowerCase();
  const updateSummary = q.updateSummary || q.qualityGate?.updateSummary || {};
  const sharedTypes = ['test_strategy', 'test_plan', 'risk_matrix'];
  const isSharedUpdate = sharedTypes.includes(type)
    && String(prompt.generationMode || q.generationMode || updateSummary.mode || '').toLowerCase() === 'update'
    && (updateSummary.deltaPatchMode || updateSummary.deltaMode);
  const rawPatch = String($json.html || '');
  const existingRaw = String($json.body?.storage?.value || '');

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

  const sanitizeUserFacingHtml = (html) => String(html || '')
    .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\.?/gi, '')
    .replace(/(chunkIds?\s*:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '$1')
    .replace(/(chunkIds?\s*:\s*[A-Za-z0-9_.:-]{12,})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '$1')
    .replace(/\s*\|\s*(?:table|text|image|metadata)\s*\|\s*/gi, ' - ')
    .replace(/(<\/table>)\s*\|+\s*(?=<h[1-6]\b|$)/gi, '$1');

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

  const sectionKey = (value) => String(value || '')
    .replace(/^\s*\d+[.)-]?\s*/, '')
    .replace(/^appendix\s*\/\s*/i, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const canonicalForKey = (key) => (canonicalSections[type] || []).find(section => sectionKey(section) === key) || null;
  const hasCoverageLedgerText = (html) => /coverage\s+ledger/i.test(stripTags(html));

  const stripPriorSummary = (html) => {
    const start = '<!-- QOPS_DELTA_UPDATE_SUMMARY_START -->';
    const end = '<!-- QOPS_DELTA_UPDATE_SUMMARY_END -->';
    const escapedStart = start.replace(/[-/\^$*+?.()|[\]{}]/g, '\\$&');
    const escapedEnd = end.replace(/[-/\^$*+?.()|[\]{}]/g, '\\$&');
    return String(html || '')
      .replace(new RegExp(escapedStart + '[\\s\\S]*?' + escapedEnd + '\\s*(?:<hr\\s*/?>)?', 'ig'), '')
      .replace(/<div[^>]+data-qops-delta-summary=["']true["'][\s\S]*?<\/div>\s*(?:<hr\s*\/?>)?/ig, '')
      .replace(/<h[1-6][^>]*>\s*(?:No document changes needed|Delta Update Summary)\s*<\/h[1-6]>[\s\S]*?(?=<h[1-6][^>]*>|$)/ig, '')
      .replace(/<p>\s*<em>\s*Existing Confluence content below[\s\S]*?<\/em>\s*<\/p>/ig, '');
  };

  const extractHeadingSections = (html) => {
    const source = String(html || '');
    const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/ig;
    const matches = [];
    let match;
    while ((match = re.exec(source)) !== null) {
      const title = stripTags(match[2]);
      matches.push({ level: Number(match[1]), index: match.index, end: re.lastIndex, title });
    }
    const sections = new Map();
    for (let i = 0; i < matches.length; i += 1) {
      const current = matches[i];
      const key = sectionKey(current.title);
      const known = canonicalForKey(key);
      if (!known) continue;
      const next = matches.slice(i + 1).find(candidate => {
        if (canonicalForKey(sectionKey(candidate.title))) return true;
        return candidate.level <= current.level;
      });
      sections.set(sectionKey(known), {
        name: known,
        html: source.slice(current.index, next ? next.index : source.length)
      });
    }
    const firstKnown = matches.find(item => canonicalForKey(sectionKey(item.title)));
    return {
      preamble: firstKnown ? source.slice(0, firstKnown.index).trim() : '',
      sections
    };
  };

  const removePatchAdministrativeSections = (html) => String(html || '')
    .replace(/<h[1-6][^>]*>\s*Delta Update Summary\s*<\/h[1-6]>[\s\S]*?(?=<h[1-6][^>]*>|$)/ig, '')
    .replace(/<h[1-6][^>]*>\s*(?:Updated or Added Sections|Preserved Sections|Coverage Ledger Delta)\s*<\/h[1-6]>[\s\S]*?(?=<h[1-6][^>]*>|$)/ig, '')
    .trim();

  const sectionWordCount = (sectionHtml) => stripTags(sectionHtml).split(/\s+/).filter(Boolean).length;
  const compactEnough = (sectionHtml) => sectionWordCount(sectionHtml) >= 12;

  const normalizeCellText = (html) => stripTags(html)
    .replace(/\\+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const makeTd = (value) => '<td>' + escapeHtml(String(value || '').trim() || 'Not provided') + '</td>';

  const normalizeTablesForConfluence = (html) => String(html || '').replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    const headerMatch = table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i);
    if (!headerMatch) return table;
    const headerCells = [...headerMatch[0].matchAll(/<t[hd]\b[^>]*>[\s\S]*?<\/t[hd]>/gi)].map(match => match[0]);
    const headerLabels = headerCells.map(normalizeCellText);
    const headerCount = headerCells.length;
    if (!headerCount) return table;
    return table.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
      const isHeader = /<th\b/i.test(row);
      if (isHeader) return row;
      const cells = [...row.matchAll(/<td\b[^>]*>[\s\S]*?<\/td>/gi)].map(match => match[0]);
      if (!cells.length) return row;
      if (cells.length === headerCount) return row;
      const sourceIndex = headerLabels.findIndex(label => /source\s+reference/i.test(label));
      if (sourceIndex >= 0 && cells.length > headerCount) {
        const semanticTailCount = Math.max(0, headerCount - sourceIndex - 1);
        const prefix = cells.slice(0, sourceIndex);
        const suffix = semanticTailCount ? cells.slice(-semanticTailCount) : [];
        const sourceCells = cells.slice(sourceIndex, cells.length - semanticTailCount);
        const joinedSource = sourceCells.map(normalizeCellText).filter(Boolean).join(' - ');
        const repaired = [...prefix, makeTd(joinedSource), ...suffix];
        if (repaired.length === headerCount) return '<tr>' + repaired.join('') + '</tr>';
      }
      const fixed = cells.slice(0, headerCount);
      while (fixed.length < headerCount) fixed.push('<td>Not provided</td>');
      return '<tr>' + fixed.join('') + '</tr>';
    });
  });

  const tableShapeIssues = (html) => {
    const issues = [];
    String(html || '').replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
      const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(match => match[0]);
      const header = rows.find(row => /<th\b/i.test(row)) || rows[0];
      const expected = (header.match(/<th\b[^>]*>/gi) || []).length || (header.match(/<td\b[^>]*>/gi) || []).length;
      if (!expected) return table;
      rows.forEach((row, index) => {
        if (index === 0 && row === header) return;
        const count = (row.match(/<td\b[^>]*>/gi) || []).length || (row.match(/<th\b[^>]*>/gi) || []).length;
        if (count && count !== expected) issues.push({ expected, count, index });
      });
      return table;
    });
    return issues;
  };

  const looksTruncated = (html) => {
    const text = stripTags(html);
    if (/[|,;:]$/.test(text)) return true;
    if (/<table[\s\S]*<tr[^>]*>\s*<td>[^<]{1,80}<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>\s*$/i.test(html)) return true;
    return false;
  };

  const pill = (label, value) => '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border:1px solid #c8c1ea;border-radius:999px;background:#f4f0ff;font-size:12px;"><strong>' + escapeHtml(label) + ':</strong> ' + escapeHtml(value) + '</span>';
  const listItems = (items, emptyText) => {
    const values = Array.isArray(items) ? items.map(item => String(item || '').trim()).filter(Boolean) : [];
    if (!values.length) return '<p>' + escapeHtml(emptyText) + '</p>';
    return '<ul>' + values.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
  };
  const buildSummaryHtml = () => {
    const title = updateSummary.noChangesDetected ? 'No document changes needed' : 'Delta Update Summary';
    const updated = Number(updateSummary.updatedSectionCount || 0) + Number(updateSummary.addedSectionCount || 0);
    const preserved = Number(updateSummary.preservedSectionCount || 0);
    const removed = Number(updateSummary.removedSectionCount || 0);
    const tokens = Number(updateSummary.tokenUsage?.total || updateSummary.tokensTotal || 0);
    const cost = Number(updateSummary.tokenUsage?.estimatedCostUsd || updateSummary.estimatedCostUsd || 0);
    const saved = Number(updateSummary.tokenSavings?.estimatedTokensSaved || updateSummary.estimatedTokensSaved || 0);
    const reason = Array.isArray(updateSummary.updateReasons) && updateSummary.updateReasons.length
      ? updateSummary.updateReasons.join('; ')
      : 'No source-context changes were detected; Regenerate Anyway refreshed the document safely.';
    const focus = [...(updateSummary.updatedSections || []), ...(updateSummary.addedSections || []), ...(updateSummary.needsReviewSections || [])].filter(Boolean);
    return [
      '<!-- QOPS_DELTA_UPDATE_SUMMARY_START -->',
      '<div data-qops-delta-summary="true" style="border:1px solid #c8c1ea;border-radius:12px;padding:16px;margin:0 0 18px 0;background:#fbf9ff;">',
      '<h2>' + escapeHtml(title) + '</h2>',
      '<p>Q-Ops refreshed this existing document selectively using the latest source context and preserved stable sections.</p>',
      '<p>' + [
        pill('Updated', updated),
        pill('Preserved', preserved),
        pill('Removed', removed),
        tokens ? pill('Update tokens', tokens.toLocaleString()) : '',
        cost ? pill('Update cost', 'US$' + cost.toFixed(4)) : '',
        saved ? pill('Tokens saved', saved.toLocaleString()) : ''
      ].filter(Boolean).join('') + '</p>',
      '<p><strong>Why this update ran:</strong> ' + escapeHtml(reason) + '</p>',
      '<p><strong>Updated focus:</strong></p>',
      listItems(focus, updateSummary.noChangesDetected ? 'No sections required changes.' : 'Changed or review-needed sections are listed above.'),
      '</div>',
      '<!-- QOPS_DELTA_UPDATE_SUMMARY_END -->'
    ].join('');
  };

  if (!isSharedUpdate) return sanitizeUserFacingHtml(rawPatch);

  const cleanedExisting = stripPriorSummary(sanitizeUserFacingHtml(existingRaw)).trim();
  const cleanedPatch = removePatchAdministrativeSections(stripPriorSummary(sanitizeUserFacingHtml(rawPatch))).trim();
  const existingParts = extractHeadingSections(cleanedExisting);
  const patchParts = extractHeadingSections(cleanedPatch);
  const existingSectionCount = existingParts.sections.size;
  const patchSectionCount = patchParts.sections.size;
  const required = canonicalSections[type] || [];
  const patchHasMostRequiredSections = required.length > 0 && patchSectionCount >= Math.max(4, Math.ceil(required.length * 0.65));
  const noChanges = Boolean(updateSummary.noChangesDetected);

  const baseSections = new Map(existingParts.sections);
  for (const [key, patchSection] of patchParts.sections.entries()) {
    if (compactEnough(patchSection.html) || key === sectionKey('Coverage Ledger')) {
      baseSections.set(key, patchSection);
    }
  }

  let body;
  if (patchHasMostRequiredSections && patchSectionCount >= existingSectionCount) {
    body = (patchParts.preamble || existingParts.preamble || '') + required
      .map(section => patchParts.sections.get(sectionKey(section))?.html || '')
      .filter(Boolean)
      .join('');
  } else if (noChanges && cleanedExisting) {
    body = cleanedExisting;
  } else if (baseSections.size) {
    const preamble = existingParts.preamble || patchParts.preamble || '';
    body = preamble + required
      .map(section => baseSections.get(sectionKey(section))?.html || '')
      .filter(Boolean)
      .join('');
    const extraPatchSections = [...patchParts.sections.entries()]
      .filter(([key]) => !required.some(section => sectionKey(section) === key))
      .map(([, section]) => section.html)
      .join('');
    body += extraPatchSections;
  } else if (cleanedExisting) {
    body = cleanedExisting;
  } else {
    body = cleanedPatch;
  }

  body = normalizeTablesForConfluence(sanitizeUserFacingHtml(body || '').trim());
  let finalHtml = buildSummaryHtml() + '<hr/>' + body;
  const finalText = stripTags(finalHtml);
  const documentHeaderPatterns = {
    test_strategy: /Document:\s*Enterprise\s+Test\s+Strategy/gi,
    test_plan: /Document:\s*Enterprise\s+Test\s+Plan/gi,
    risk_matrix: /Document:\s*Enterprise\s+Risk\s+(?:Assessment\s+)?Matrix/gi
  };
  const headerCount = (finalText.match(documentHeaderPatterns[type] || /a^/g) || []).length;
  if (headerCount > 1) {
    throw new Error('Shared update merge guard failed: duplicate document headers detected before Confluence publish.');
  }

  const malformedTables = tableShapeIssues(finalHtml);
  if (malformedTables.length) {
    throw new Error('Shared update merge guard failed: malformed table shape detected before Confluence publish.');
  }

  const finalParts = extractHeadingSections(finalHtml);
  const claimedPreserved = Array.isArray(updateSummary.preservedSections) ? updateSummary.preservedSections : [];
  const missingClaimed = claimedPreserved
    .map(section => canonicalForKey(sectionKey(section)) || section)
    .filter(section => sectionKey(section) !== sectionKey('Coverage Ledger'))
    .filter(section => {
      const sectionHtml = finalParts.sections.get(sectionKey(section))?.html || '';
      return !sectionHtml || sectionWordCount(sectionHtml) < 12;
    });
  if (missingClaimed.length) {
    throw new Error('Shared update merge guard failed: preserved section(s) missing or content-thin in final body: ' + missingClaimed.join(', '));
  }

  const hadCoverageBefore = hasCoverageLedgerText(cleanedExisting) || (Array.isArray(q.updateContext?.previousCoverageLedger) && q.updateContext.previousCoverageLedger.length > 0);
  if (hadCoverageBefore && !hasCoverageLedgerText(finalHtml)) {
    throw new Error('Shared update merge guard failed: Coverage Ledger would be dropped by the update.');
  }

  const mustBeComplete = !cleanedExisting || existingSectionCount < Math.max(3, Math.ceil(required.length * 0.5)) || patchHasMostRequiredSections;
  if (mustBeComplete) {
    const missingRequired = required
      .filter(section => sectionKey(section) !== sectionKey('Coverage Ledger'))
      .filter(section => {
        const sectionHtml = finalParts.sections.get(sectionKey(section))?.html || '';
        return !sectionHtml || sectionWordCount(sectionHtml) < 12;
      });
    if (missingRequired.length) {
      throw new Error('Shared update merge guard failed: final document is incomplete for ' + type + '. Missing: ' + missingRequired.join(', '));
    }
  }

  if (looksTruncated(finalHtml)) {
    throw new Error('Shared update merge guard failed: generated update appears truncated before Confluence publish.');
  }

  return finalHtml;
})() }}`;

function patchPromptLibrary(node) {
  let code = node.parameters.jsCode;
  code = code.replace('SHARED_DELTA_UPDATE_V2', 'SHARED_DELTA_UPDATE_V8');
  code = code.replace('SHARED_DELTA_UPDATE_V4', 'SHARED_DELTA_UPDATE_V8');
  code = code.replace('SHARED_DELTA_UPDATE_V5', 'SHARED_DELTA_UPDATE_V8');
  code = code.replace('SHARED_DELTA_UPDATE_V6', 'SHARED_DELTA_UPDATE_V8');
  code = code.replace('SHARED_DELTA_UPDATE_V7', 'SHARED_DELTA_UPDATE_V8');
  code = code.replace(
    "'This is a cost-optimized update patch for an existing shared QA deliverable.',\n    'Output a compact patch, not a full replacement document. The workflow will merge this patch with the existing Confluence page.',",
    "'This is a cost-optimized update patch for an existing shared QA deliverable.',\n    'Output updated sections only when the existing Confluence page is complete. If the prior page or prior coverage metadata is incomplete, missing, partial, or warning, output the full affected canonical sections needed to repair the final document.',\n    'The workflow merges this update with the existing Confluence page and refuses to publish if preserved sections or coverage are dropped.',"
  );
  code = code.replace(
    "'If no material source or coverage change exists, return only Delta Update Summary and state that no content changes were needed.',",
    "'If no material source or coverage change exists and prior coverage was already complete, return only Delta Update Summary and state that no content changes were needed.',\n    'If previousCoverageSummary reports missing, partial, unknown, warning, failed, not_reported, or previousCoverageRows is 0, treat Coverage Ledger and related sections as updated or needs_review. Do not return a no-change update until the current output repairs or explicitly explains the coverage gap.',"
  );
  node.parameters.jsCode = code;
}

function patchQualityGate(node) {
  let code = node.parameters.jsCode;
  code = code.replace("version: 'shared-delta-update-v2',", "version: 'shared-delta-update-v4',");
  code = code.replace("version: 'shared-delta-update-v4',", "version: 'shared-delta-update-v5',");
  code = code.replace("version: 'shared-delta-update-v5',", "version: 'shared-delta-update-v6',");
  code = code.replace("version: 'shared-delta-update-v6',", "version: 'shared-delta-update-v7',");
  code = code.replace("version: 'shared-delta-update-v7',", "version: 'shared-delta-update-v8',");
  code = code.replace(
    "const noChangesDetected = updateReasons.length === 0 && updatedSections.length === 0 && addedSections.length === 0 && removedSections.length === 0 && needsReviewSections.length === 0;",
    `const previousCoverageSummary = updateContext?.previousCoverageSummary || {};
  const previousCoverageRows = Array.isArray(updateContext?.previousCoverageLedger) ? updateContext.previousCoverageLedger.length : Number(previousCoverageSummary.coverageLedgerCount || 0) || 0;
  const previousCoverageStatus = String(previousCoverageSummary.gateStatus || previousCoverageSummary.status || '').toLowerCase();
  const previousCoverageNeedsRepair = previousCoverageRows === 0
    || ['warning', 'failed', 'not_reported'].includes(previousCoverageStatus)
    || (Number(previousCoverageSummary.missingCount) || 0) > 0
    || (Number(previousCoverageSummary.partialCount) || 0) > 0
    || (Number(previousCoverageSummary.unknownCount) || 0) > 0;
  if (previousCoverageNeedsRepair && !updatedSections.some(section => sectionKey(section) === sectionKey('Coverage Ledger'))) {
    const coverageSection = documentType === 'risk_matrix' ? 'Coverage Ledger' : 'Appendix / Coverage Ledger';
    if ((Array.isArray(coverageLedger) ? coverageLedger.length : 0) > 0) updatedSections.push(coverageSection);
    else needsReviewSections.push(coverageSection);
  }
  const noChangesDetected = updateReasons.length === 0
    && updatedSections.length === 0
    && addedSections.length === 0
    && removedSections.length === 0
    && needsReviewSections.length === 0
    && !previousCoverageNeedsRepair;`
  );
  code = code.replace(
    "message: noChangesDetected\n      ? 'No source-context changes were detected for this shared document update.'\n      : 'Shared document update generated a compact patch and preserved unchanged sections.'",
    "message: noChangesDetected\n      ? 'No source-context changes were detected for this shared document update.'\n      : previousCoverageNeedsRepair\n        ? 'Shared document update refreshed coverage-related sections because previous coverage needed repair or review.'\n        : 'Shared document update generated a compact patch and preserved unchanged sections.'"
  );
  if (!code.includes('coverageRepairKeys')) {
    code = code.replace(
      "    if ((Array.isArray(coverageLedger) ? coverageLedger.length : 0) > 0) updatedSections.push(coverageSection);\n    else needsReviewSections.push(coverageSection);\n  }\n  const noChangesDetected = updateReasons.length === 0",
      "    if ((Array.isArray(coverageLedger) ? coverageLedger.length : 0) > 0) updatedSections.push(coverageSection);\n    else needsReviewSections.push(coverageSection);\n  }\n  if (previousCoverageNeedsRepair) {\n    const coverageRepairKeys = new Set([...updatedSections, ...addedSections, ...removedSections, ...needsReviewSections].map(sectionKey));\n    preservedSections = preservedSections.filter(section => !coverageRepairKeys.has(sectionKey(section)));\n  }\n  const noChangesDetected = updateReasons.length === 0"
    );
  }
  node.parameters.jsCode = code;
}

function patchRestoreQualityGateOutput(node) {
  const assignments = node.parameters.assignments.assignments;
  const coverageSummary = assignments.find(item => item.name === 'coverageSummary');
  const coverageLedger = assignments.find(item => item.name === 'coverageLedger');
  if (!coverageSummary || !coverageLedger) throw new Error('Coverage assignments not found.');
  coverageLedger.value = "={{ (($('Quality Gate').item.json.coverageLedger || []).length ? $('Quality Gate').item.json.coverageLedger : (($('Quality Gate').item.json.updateSummary?.noChangesDetected && ($('Quality Gate').item.json.updateContext?.previousCoverageLedger || []).length) ? $('Quality Gate').item.json.updateContext.previousCoverageLedger : [])) }}";
  coverageSummary.value = "={{ (($('Quality Gate').item.json.coverageLedger || []).length ? $('Quality Gate').item.json.coverageSummary : (($('Quality Gate').item.json.updateSummary?.noChangesDetected && ($('Quality Gate').item.json.updateContext?.previousCoverageLedger || []).length) ? { ...($('Quality Gate').item.json.updateContext.previousCoverageSummary || {}), version: ($('Quality Gate').item.json.updateContext.previousCoverageSummary?.version || 'coverage-ledger-v1'), carriedForwardFromPreviousUpdate: true, coverageLedgerCount: ($('Quality Gate').item.json.updateContext.previousCoverageLedger || []).length } : $('Quality Gate').item.json.coverageSummary)) }}";
}

function patchUpdatePage(node) {
  const bodyParams = node.parameters.bodyParameters?.parameters || [];
  const htmlParam = bodyParams.find(param => param.name === 'body.storage.value');
  if (!htmlParam) throw new Error('body.storage.value parameter not found in update node.');
  htmlParam.value = mergeExistingConfluenceExpressionV8;
}

function patchOpenAiModel(node) {
  node.parameters.options.maxTokens = "={{ (() => { const p = $('Prompt Library').item.json || {}; const base = Number(p.configSnapshot?.models?.maxTokens || 8000) || 8000; const type = String(p.documentType || '').toLowerCase(); const isSharedUpdate = ['test_strategy','test_plan','risk_matrix'].includes(type) && String(p.generationMode || '').toLowerCase() === 'update'; if (!isSharedUpdate) return base; const summary = p.updateContext?.previousCoverageSummary || {}; const rows = Array.isArray(p.updateContext?.previousCoverageLedger) ? p.updateContext.previousCoverageLedger.length : Number(summary.coverageLedgerCount || 0) || 0; const status = String(summary.gateStatus || summary.status || '').toLowerCase(); const needsRepair = rows === 0 || ['warning','failed','not_reported'].includes(status) || (Number(summary.missingCount)||0) > 0 || (Number(summary.partialCount)||0) > 0 || (Number(summary.unknownCount)||0) > 0; return needsRepair ? base : Math.min(base, 3000); })() }}";
}

function patchGetPageDetails(node) {
  const url = node.parameters.url || '';
  if (!String(url).includes('expand=version,body.storage')) {
    node.parameters.url = "={{ String((($json.configSnapshot || $('Prompt Library').item.json.configSnapshot || {}).publishing || {}).confluenceBaseUrl || 'https://anujalhans1.atlassian.net/wiki').replace(/\\/$/, '') + '/rest/api/content/' + $json.pageId + '?expand=version,body.storage' }}";
  }
}

function patchNodes(nodes) {
  patchOpenAiModel(requireNode(nodes, 'OpenAI Chat Model'));
  patchPromptLibrary(requireNode(nodes, 'Prompt Library'));
  patchQualityGate(requireNode(nodes, 'Quality Gate'));
  patchRestoreQualityGateOutput(requireNode(nodes, 'Restore Quality Gate Output'));
  patchGetPageDetails(requireNode(nodes, 'Get Page Details'));
  patchUpdatePage(requireNode(nodes, 'Update existing Document on Confluence'));
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_delta_update_v8_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    patchNodes(nodes);

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(nodes),
      now,
      workflowId
    ]);

    if (historyRow) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(nodes),
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
        'shared delta update V8 prompt instructions',
        'repair-mode shared updates use full configured model token budget',
        'coverage-repair-aware update summary',
        'effective carried-forward coverage metadata for true no-change updates',
        'Confluence page fetch now expands body.storage',
        'section-aware final body merge for shared update only, preserving nested subsection content while respecting peer-heading boundaries',
        'update-mode table normalization, source-reference spillover repair, and truncated-table guard',
        'pre-publish guards for duplicate headers, missing or content-thin preserved sections, incomplete documents, truncated output, malformed tables, orphan table pipes, and dropped coverage'
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
