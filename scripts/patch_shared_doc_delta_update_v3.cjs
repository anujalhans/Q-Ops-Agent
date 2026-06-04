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

const mergeExistingConfluenceExpressionV3 = `={{ (() => {
  const prompt = $('Prompt Library').item.json || {};
  const q = $('Restore Quality Gate Output').item.json || {};
  const type = String(prompt.documentType || q.documentType || '').toLowerCase();
  const updateSummary = q.updateSummary || q.qualityGate?.updateSummary || {};
  const isSharedUpdate = ['test_strategy', 'test_plan', 'risk_matrix'].includes(type)
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

  const sanitizeUserFacingHtml = (html) => String(html || '')
    .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\\.?/gi, '')
    .replace(/(chunkIds?\\s*:\\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, '$1')
    .replace(/(chunkIds?\\s*:\\s*[A-Za-z0-9_.:-]{12,})(?:\\s*\\|\\s*\\d+\\s*){1,4}\\|\\s*(?:table|text|image|metadata)\\s*\\|?/gi, '$1')
    .replace(/\\s*\\|\\s*(?:table|text|image|metadata)\\s*\\|\\s*/gi, ' - ');

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
      'Appendix / Coverage Ledger',
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
      'Appendix / Coverage Ledger',
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
    .replace(/^\\s*\\d+[.)-]?\\s*/, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const hPattern = (name) => {
    const key = sectionKey(name);
    const parts = key.split(/\\s+/).filter(Boolean).map(part => part.replace(/[.*+?^$()|[\\]\\\\]/g, '\\\\$&'));
    return parts.length ? parts.join('(?:\\\\s|&nbsp;|<[^>]+>)*') : '';
  };

  const removeHeadingSection = (html, sectionName) => {
    const pattern = hPattern(sectionName);
    if (!pattern) return html;
    const re = new RegExp('<h([1-6])[^>]*>\\\\s*(?:\\\\d+[.)]?\\\\s*)?(?:Appendix\\\\s*\\\\/\\\\s*)?' + pattern + '\\\\s*<\\\\/h\\\\1>[\\\\s\\\\S]*?(?=<h[1-6][^>]*>|$)', 'ig');
    return html.replace(re, '');
  };

  const extractHeadingSections = (html) => {
    const sections = new Map();
    const re = /<h([1-6])[^>]*>([\\s\\S]*?)<\\/h\\1>/ig;
    const matches = [];
    let match;
    while ((match = re.exec(html)) !== null) {
      const title = String(match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
      matches.push({ index: match.index, end: re.lastIndex, title });
    }
    for (let i = 0; i < matches.length; i += 1) {
      const current = matches[i];
      const next = matches[i + 1];
      const key = sectionKey(current.title);
      const known = (canonicalSections[type] || []).find(section => sectionKey(section) === key);
      if (!known) continue;
      sections.set(sectionKey(known), html.slice(current.index, next ? next.index : html.length));
    }
    return sections;
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
      : 'Knowledge Base was updated after this output was generated.';
    const focus = [...(updateSummary.updatedSections || []), ...(updateSummary.addedSections || [])].filter(Boolean);
    return [
      '<!-- QOPS_DELTA_UPDATE_SUMMARY_START -->',
      '<div data-qops-delta-summary="true" style="border:1px solid #c8c1ea;border-radius:12px;padding:16px;margin:0 0 18px 0;background:#fbf9ff;">',
      '<h2>' + escapeHtml(title) + '</h2>',
      '<p>Q-Ops updated this existing document selectively using the latest source context and preserved stable sections.</p>',
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
      listItems(focus, updateSummary.noChangesDetected ? 'No sections required changes.' : 'No updated section list was recorded.'),
      '</div>',
      '<!-- QOPS_DELTA_UPDATE_SUMMARY_END -->'
    ].join('');
  };

  if (!isSharedUpdate) return sanitizeUserFacingHtml(rawPatch);
  const start = '<!-- QOPS_DELTA_UPDATE_SUMMARY_START -->';
  const end = '<!-- QOPS_DELTA_UPDATE_SUMMARY_END -->';
  const escapedStart = start.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  const escapedEnd = end.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  const cleanedExisting = sanitizeUserFacingHtml(existingRaw)
    .replace(new RegExp(escapedStart + '[\\\\s\\\\S]*?' + escapedEnd + '\\\\s*(?:<hr\\\\s*/?>)?', 'ig'), '')
    .replace(/<p>\\s*<em>\\s*Existing Confluence content below[\\s\\S]*?<\\/em>\\s*<\\/p>/ig, '');
  const patch = sanitizeUserFacingHtml(rawPatch)
    .replace(new RegExp(escapedStart + '[\\\\s\\\\S]*?' + escapedEnd, 'ig'), '');

  const fullDocumentMarkers = {
    test_strategy: /Document:\\s*Enterprise\\s+Test\\s+Strategy/i,
    test_plan: /Document:\\s*Enterprise\\s+Test\\s+Plan/i,
    risk_matrix: /Document:\\s*Enterprise\\s+Risk\\s+(?:Assessment\\s+)?Matrix/i
  };
  const summaryHtml = buildSummaryHtml();
  const looksLikeFullDocument = Boolean(fullDocumentMarkers[type]?.test(patch))
    || ((patch.match(/<h[1-6][^>]*>/gi) || []).length >= 6 && /Generated On|Vector Collection|Coverage Ledger/i.test(patch));

  if (!cleanedExisting || looksLikeFullDocument) {
    return summaryHtml + '<hr/>' + patch;
  }

  let mergedExisting = cleanedExisting;
  const patchSections = extractHeadingSections(patch);
  for (const [key, sectionHtml] of patchSections.entries()) {
    const sectionName = (canonicalSections[type] || []).find(section => sectionKey(section) === key);
    if (!sectionName) continue;
    mergedExisting = removeHeadingSection(mergedExisting, sectionName);
  }

  const patchWithoutSummary = patch
    .replace(/<h[1-6][^>]*>\\s*Delta Update Summary\\s*<\\/h[1-6]>[\\s\\S]*?(?=<h[1-6][^>]*>|$)/i, '')
    .trim();
  return summaryHtml + (patchWithoutSummary ? '<hr/>' + patchWithoutSummary : '') + '<hr/>' + mergedExisting;
})() }}`;

function patchNodes(nodes) {
  const updatePage = requireNode(nodes, 'Update existing Document on Confluence');
  const bodyParams = updatePage.parameters.bodyParameters?.parameters || [];
  const htmlParam = bodyParams.find(param => param.name === 'body.storage.value');
  if (!htmlParam) throw new Error('body.storage.value parameter not found in update node.');
  htmlParam.value = mergeExistingConfluenceExpressionV3;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_delta_update_v3_${stamp}.json`);
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
        'shared delta update V3 Confluence merge expression',
        'no full previous document append sentence',
        'full-document patch guard',
        'section-level old-section removal for compact patch updates',
        'final HTML source-reference metadata sanitizer',
        'visible delta summary injection for shared doc updates'
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
