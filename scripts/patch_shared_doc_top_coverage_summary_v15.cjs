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

function patchNodes(nodes) {
  const completionNode = nodes.find(node => node.name === 'Mark Job Status as Completed');
  if (!completionNode?.parameters?.jsonBody) throw new Error('Mark Job Status as Completed jsonBody not found');
  let body = String(completionNode.parameters.jsonBody);
  const before = `"coverageSummary": {{ JSON.stringify($('Restore Quality Gate Output').item.json.coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] }) }},`;
  const after = `"coverageSummary": {{ JSON.stringify((() => { const finalCoverage = (() => {
  const q = $('Restore Quality Gate Output').item.json || {};
  const prompt = $('Prompt Library').item.json || {};
  const restore = $('Restore Job Context').item.json || {};
  const type = String(prompt.documentType || q.documentType || restore.documentType || '').toLowerCase();
  const isSharedUpdate = ['test_strategy', 'test_plan', 'risk_matrix'].includes(type)
    && String(prompt.generationMode || q.generationMode || restore.generationMode || '').toLowerCase() === 'update';
  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];
  const rawSummary = q.coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };
  const stripTags = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&ndash;/gi, '-').replace(/&mdash;/gi, '-').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\\s+/g, ' ').trim();
  const normalizeStatus = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw.includes('exclude')) return 'excluded';
    if (raw.includes('partial') || raw.includes('review')) return 'partial';
    if (raw.includes('miss') || raw.includes('gap')) return 'missing';
    if (raw.includes('cover') || raw.includes('mapped') || raw.includes('included')) return 'covered';
    return 'unknown';
  };
  const cellTexts = (rowHtml) => [...String(rowHtml || '').matchAll(/<t[hd]\\b[^>]*>([\\s\\S]*?)<\\/t[hd]>/gi)].map(match => stripTags(match[1]));
  const parseFinalLedger = () => {
    const html = String($('Update existing Document on Confluence').item.json.body?.storage?.value || '');
    const headings = [...html.matchAll(/<h([1-6])[^>]*>([\\s\\S]*?)<\\/h\\1>/gi)];
    const coverage = headings.map((match, index) => ({ match, index, title: stripTags(match[2]) })).find(item => /coverage\\s+ledger/i.test(item.title));
    if (!coverage) return [];
    const start = coverage.match.index + coverage.match[0].length;
    const next = headings.slice(coverage.index + 1).find(match => match.index > start);
    const section = html.slice(start, next ? next.index : html.length);
    const tableMatch = section.match(/<table\\b[^>]*>[\\s\\S]*?<\\/table>/i);
    if (!tableMatch) return [];
    const rows = [...tableMatch[0].matchAll(/<tr\\b[^>]*>[\\s\\S]*?<\\/tr>/gi)].map(match => match[0]);
    if (rows.length < 2) return [];
    const headers = cellTexts(rows[0]).map(header => header.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    const indexFor = (patterns, fallback) => {
      const index = headers.findIndex(header => patterns.some(pattern => pattern.test(header)));
      return index >= 0 ? index : fallback;
    };
    const idIndex = indexFor([/^coverage id$/, /^id$/], 0);
    const moduleIndex = indexFor([/module/, /requirement/], 1);
    const sourceIndex = indexFor([/source/], 2);
    const includedIndex = indexFor([/included/, /output/], 3);
    const statusIndex = indexFor([/status/], 4);
    const notesIndex = indexFor([/note/, /rationale/], 5);
    return rows.slice(1).map(row => {
      const cells = cellTexts(row);
      return {
        coverageId: cells[idIndex] || '',
        moduleRequirement: cells[moduleIndex] || '',
        sourceReference: cells[sourceIndex] || '',
        includedInOutput: cells[includedIndex] || '',
        coverageStatus: normalizeStatus(cells[statusIndex]),
        notes: cells[notesIndex] || ''
      };
    }).filter(row => row.coverageId || row.moduleRequirement).slice(0, 200);
  };
  const finalLedger = isSharedUpdate && rawLedger.length === 0 ? parseFinalLedger() : [];
  const ledger = finalLedger.length > rawLedger.length ? finalLedger : rawLedger;
  const summary = { ...rawSummary, version: rawSummary.version || 'coverage-ledger-v1', mode: rawSummary.mode || 'dry_run', coverageLedgerCount: ledger.length };
  summary.coveredCount = ledger.filter(row => row.coverageStatus === 'covered').length;
  summary.partialCount = ledger.filter(row => row.coverageStatus === 'partial').length;
  summary.missingCount = ledger.filter(row => row.coverageStatus === 'missing').length;
  summary.excludedCount = ledger.filter(row => row.coverageStatus === 'excluded').length;
  summary.unknownCount = ledger.filter(row => !['covered', 'partial', 'missing', 'excluded'].includes(row.coverageStatus)).length;
  summary.blockingUncoveredCount = summary.missingCount + summary.unknownCount;
  summary.uncoveredCount = summary.partialCount + summary.missingCount + summary.unknownCount;
  summary.gateStatus = !ledger.length ? (rawSummary.gateStatus || 'not_reported') : (summary.blockingUncoveredCount > 0 ? 'warning' : summary.partialCount > 0 ? 'warning' : 'passed');
  summary.missingItems = ledger.filter(row => row.coverageStatus === 'missing').slice(0, 25).map(row => ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));
  summary.partialItems = ledger.filter(row => row.coverageStatus === 'partial').slice(0, 25).map(row => ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));
  summary.unknownItems = ledger.filter(row => !['covered', 'partial', 'missing', 'excluded'].includes(row.coverageStatus)).slice(0, 25).map(row => ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));
  summary.warningItems = ledger.filter(row => ['partial', 'missing', 'unknown'].includes(row.coverageStatus)).slice(0, 25).map(row => ({ coverageId: row.coverageId, moduleRequirement: row.moduleRequirement, coverageStatus: row.coverageStatus, notes: row.notes }));
  return { summary };
})(); return finalCoverage.summary; })()) }},`;

  if (body.includes(before)) {
    body = body.replace(before, after);
  } else if (!body.includes("return finalCoverage.summary; })())")) {
    throw new Error('Top-level coverageSummary pattern not found and v15 marker absent');
  }
  body = body.replace(/shared-final-validation-v14/g, 'shared-final-validation-v15');
  completionNode.parameters.jsonBody = body;
  return 1;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT * FROM workflow_entity WHERE id = ?', [workflowId]);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_top_coverage_summary_v15_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?', [JSON.stringify(entityNodes), new Date().toISOString(), workflowId]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [JSON.stringify(historyNodes), new Date().toISOString(), workflowId, versionId]);

    console.log(JSON.stringify({ workflowId, versionId, backupPath, entityPatches, historyPatches, patched: 'top-level coverageSummary now uses final published body parser' }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
