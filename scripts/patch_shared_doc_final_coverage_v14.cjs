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

const listFunction = String.raw`function convertLooseHtmlLists(html) {
  const normalized = String(html || '')
    .replace(/<(p|div)[^>]*>\s*((?:[-*]|\d+[.)])\s+[\s\S]*?)<\/\1>/gi, '\n$2\n')
    .replace(/<br\s*\/?>/gi, '\n');
  const lines = normalized.split(/\n/);
  const output = [];
  let listType = null;

  const closeList = () => {
    if (listType) {
      output.push('</' + listType + '>');
      listType = null;
    }
  };

  const appendToPreviousItem = (text) => {
    const lastIndex = output.length - 1;
    if (lastIndex >= 0 && /^<li>[\s\S]*<\/li>$/.test(output[lastIndex])) {
      output[lastIndex] = output[lastIndex].replace(/<\/li>$/, ' ' + text.trim() + '</li>');
      return true;
    }
    return false;
  };

  for (const rawLine of lines) {
    const line = String(rawLine || '');
    const trimmed = line.trim();
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);

    if (unordered || ordered) {
      const nextType = ordered ? 'ol' : 'ul';
      if (listType !== nextType) {
        closeList();
        output.push('<' + nextType + '>');
        listType = nextType;
      }
      output.push('<li>' + (unordered ? unordered[1] : ordered[1]).trim() + '</li>');
      continue;
    }

    if (listType && trimmed && !/^<\/?(?:h[1-6]|table|tbody|tr|td|th|ul|ol|li)\b/i.test(trimmed)) {
      if (appendToPreviousItem(trimmed)) continue;
    }

    closeList();
    if (output.length && trimmed) output.push('<br/>');
    output.push(line);
  }

  closeList();
  return output.join('');
}`;

const finalCoverageExpression = String.raw`(() => {
  const q = $('Restore Quality Gate Output').item.json || {};
  const prompt = $('Prompt Library').item.json || {};
  const restore = $('Restore Job Context').item.json || {};
  const type = String(prompt.documentType || q.documentType || restore.documentType || '').toLowerCase();
  const isSharedUpdate = ['test_strategy', 'test_plan', 'risk_matrix'].includes(type)
    && String(prompt.generationMode || q.generationMode || restore.generationMode || '').toLowerCase() === 'update';
  const rawLedger = Array.isArray(q.coverageLedger) ? q.coverageLedger : [];
  const rawSummary = q.coverageSummary || { version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: [] };

  const stripTags = (html) => String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const normalizeStatus = (value) => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw.includes('exclude') || raw === 'n/a' || raw === 'not applicable') return 'excluded';
    if (raw.includes('partial') || raw.includes('review') || raw.includes('at risk')) return 'partial';
    if (raw.includes('miss') || raw.includes('gap') || raw.includes('unmapped') || raw.includes('not covered')) return 'missing';
    if (raw.includes('cover') || raw.includes('mapped') || raw.includes('included')) return 'covered';
    return 'unknown';
  };

  const cellTexts = (rowHtml) => [...String(rowHtml || '').matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)]
    .map(match => stripTags(match[1]));

  const parseFinalLedger = () => {
    const html = String($('Update existing Document on Confluence').item.json.body?.storage?.value || '');
    if (!html) return [];
    const headings = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
    const coverage = headings
      .map((match, index) => ({ match, index, title: stripTags(match[2]) }))
      .find(item => /coverage\s+ledger/i.test(item.title));
    if (!coverage) return [];
    const start = coverage.match.index + coverage.match[0].length;
    const next = headings.slice(coverage.index + 1).find(match => match.index > start);
    const section = html.slice(start, next ? next.index : html.length);
    const tableMatch = section.match(/<table\b[^>]*>[\s\S]*?<\/table>/i);
    if (!tableMatch) return [];
    const rows = [...tableMatch[0].matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)].map(match => match[0]);
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
      if (!cells.some(Boolean)) return null;
      return {
        coverageId: cells[idIndex] || '',
        moduleRequirement: cells[moduleIndex] || '',
        sourceReference: cells[sourceIndex] || '',
        includedInOutput: cells[includedIndex] || '',
        coverageStatus: normalizeStatus(cells[statusIndex]),
        notes: cells[notesIndex] || ''
      };
    }).filter(row => row && (row.coverageId || row.moduleRequirement)).slice(0, 200);
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
  return {
    ledger,
    summary,
    batchSummary: {
      ...(q.batchSummary || {}),
      version: q.batchSummary?.version || 'coverage-batch-summary-v1',
      documentType: type,
      total: ledger.length,
      covered: summary.coveredCount,
      complete: summary.coveredCount,
      review: summary.partialCount + summary.missingCount + summary.unknownCount,
      partial: summary.partialCount,
      missing: summary.missingCount,
      unknown: summary.unknownCount,
      excluded: summary.excludedCount,
      gateStatus: summary.gateStatus,
      progressPercent: ledger.length ? Math.round((summary.coveredCount / ledger.length) * 100) : 0,
      reviewItems: summary.warningItems || []
    },
    source: finalLedger.length > rawLedger.length ? 'final_published_body' : 'quality_gate'
  };
})()`;

function patchListFunctionInCode(code) {
  const start = code.indexOf('function convertLooseHtmlLists(html)');
  if (start < 0) return { code, patched: false };
  const endMarker = '\n\n  const sanitizeUserFacingHtml =';
  const end = code.indexOf(endMarker, start);
  if (end < 0) return { code, patched: false };
  return { code: code.slice(0, start) + listFunction + code.slice(end), patched: true };
}

function patchCompletionJsonBody(jsonBody) {
  let body = String(jsonBody || '');
  let patches = 0;
  const coverageBlock = finalCoverageExpression;
  if (!body.includes('const finalCoverage = ')) {
    body = body.replace(
      '"settingsVersion": {{ $(\'Restore Job Context\').item.json.settingsVersion || \'null\' }},',
      `"settingsVersion": {{ $('Restore Job Context').item.json.settingsVersion || 'null' }},\n    "coverageMetadataSource": {{ JSON.stringify((() => { const finalCoverage = ${coverageBlock}; return finalCoverage.source; })()) }},`
    );
    patches += 1;
  }
  body = body.replace(
    /"updateSummary": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.updateSummary \|\| null\) \}\},/,
    `"updateSummary": {{ JSON.stringify((() => { const finalCoverage = ${coverageBlock}; const summary = $('Restore Quality Gate Output').item.json.updateSummary || null; if (!summary || finalCoverage.source !== 'final_published_body') return summary; return { ...summary, coverageSummary: finalCoverage.summary, batchSummary: finalCoverage.batchSummary, coverageLedgerCount: finalCoverage.ledger.length, needsReviewSections: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)) : summary.needsReviewSections, needsReviewSectionCount: finalCoverage.summary.gateStatus === 'passed' ? (summary.needsReviewSections || []).filter(section => !/coverage ledger/i.test(section)).length : summary.needsReviewSectionCount }; })()) }},`
  );
  body = body.replace(
    /"coverageSummary": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary \|\| \{ version: 'coverage-ledger-v1', mode: 'dry_run', gateStatus: 'not_reported', coverageLedgerCount: 0, uncoveredCount: 0, missingItems: \[\] \} \) \}\},/,
    `"coverageSummary": {{ JSON.stringify((() => { const finalCoverage = ${coverageBlock}; return finalCoverage.summary; })()) }},`
  );
  body = body.replace(
    /"coverageLedger": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageLedger \|\| \[\]\) \}\},/,
    `"coverageLedger": {{ JSON.stringify((() => { const finalCoverage = ${coverageBlock}; return finalCoverage.ledger; })()) }},`
  );
  body = body.replace(
    /"batchSummary": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.batchSummary \|\| null\) \}\},/,
    `"batchSummary": {{ JSON.stringify((() => { const finalCoverage = ${coverageBlock}; return finalCoverage.ledger.length ? finalCoverage.batchSummary : ($('Restore Quality Gate Output').item.json.batchSummary || null); })()) }},`
  );
  return { body, patches };
}

function patchMetricsJsonBody(jsonBody) {
  let body = String(jsonBody || '');
  let patches = 0;
  if (!body.includes('final_published_body')) {
    body = body.replace(
      /"update_summary": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.updateSummary \|\| null\) \}\},/,
      `"update_summary": {{ JSON.stringify((() => { const finalCoverage = ${finalCoverageExpression}; const summary = $('Restore Quality Gate Output').item.json.updateSummary || null; if (!summary || finalCoverage.source !== 'final_published_body') return summary; return { ...summary, coverageSummary: finalCoverage.summary, batchSummary: finalCoverage.batchSummary, coverageLedgerCount: finalCoverage.ledger.length }; })()) }},`
    );
    patches += 1;
  }
  body = body.replace(
    /"coverage_gate_status": \{\{ JSON\.stringify\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.gateStatus \|\| 'not_reported'\) \}\},/,
    `"coverage_gate_status": {{ JSON.stringify((() => { const finalCoverage = ${finalCoverageExpression}; return finalCoverage.summary.gateStatus || 'not_reported'; })()) }},`
  );
  body = body.replace(
    /"coverage_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.coverageLedgerCount\) \|\| 0 \}\},/,
    `"coverage_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.coverageLedgerCount) || 0; })() }},`
  );
  body = body.replace(
    /"covered_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.coveredCount\) \|\| 0 \}\},/,
    `"covered_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.coveredCount) || 0; })() }},`
  );
  body = body.replace(
    /"partial_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.partialCount\) \|\| 0 \}\},/,
    `"partial_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.partialCount) || 0; })() }},`
  );
  body = body.replace(
    /"missing_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.missingCount\) \|\| 0 \}\},/,
    `"missing_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.missingCount) || 0; })() }},`
  );
  body = body.replace(
    /"excluded_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.excludedCount\) \|\| 0 \}\},/,
    `"excluded_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.excludedCount) || 0; })() }},`
  );
  body = body.replace(
    /"uncovered_ledger_count": \{\{ Number\(\$\(\'Restore Quality Gate Output\'\)\.item\.json\.coverageSummary\?\.uncoveredCount\) \|\| 0 \}\},/,
    `"uncovered_ledger_count": {{ (() => { const finalCoverage = ${finalCoverageExpression}; return Number(finalCoverage.summary.uncoveredCount) || 0; })() }},`
  );
  return { body, patches };
}

function patchNodes(nodes) {
  let patches = 0;
  const updateNode = nodes.find(node => node.name === 'Update existing Document on Confluence');
  const updateParam = updateNode?.parameters?.bodyParameters?.parameters?.find(param => param.name === 'body.storage.value');
  if (updateParam?.value) {
    const result = patchListFunctionInCode(updateParam.value);
    updateParam.value = result.code.replace(/shared-final-validation-v13/g, 'shared-final-validation-v14');
    if (result.patched) patches += 1;
  }

  const converterNode = nodes.find(node => node.name === 'Convert MD -> Confluence Formatted HTML');
  if (converterNode?.parameters?.jsCode) {
    const result = patchListFunctionInCode(converterNode.parameters.jsCode);
    converterNode.parameters.jsCode = result.code.replace(/shared-final-validation-v13/g, 'shared-final-validation-v14');
    if (result.patched) patches += 1;
  }

  const completionNode = nodes.find(node => node.name === 'Mark Job Status as Completed');
  if (completionNode?.parameters?.jsonBody) {
    const result = patchCompletionJsonBody(completionNode.parameters.jsonBody);
    completionNode.parameters.jsonBody = result.body.replace(/shared-final-validation-v13/g, 'shared-final-validation-v14');
    patches += 1 + result.patches;
  }

  const metricsNode = nodes.find(node => node.name === 'LOG: Update Confluence Job Completed');
  if (metricsNode?.parameters?.jsonBody) {
    const result = patchMetricsJsonBody(metricsNode.parameters.jsonBody);
    metricsNode.parameters.jsonBody = result.body.replace(/shared-final-validation-v13/g, 'shared-final-validation-v14');
    patches += 1 + result.patches;
  }

  return patches;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT * FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!entity) throw new Error(`workflow_entity not found: ${workflowId}`);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    if (!history) throw new Error(`workflow_history not found: ${workflowId} / ${versionId}`);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_final_coverage_v14_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);
    if (entityPatches < 4 || historyPatches < 4) {
      throw new Error(`Expected v14 patches in entity/history, got ${entityPatches}/${historyPatches}`);
    }

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?', [
      JSON.stringify(entityNodes),
      new Date().toISOString(),
      workflowId,
    ]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [
      JSON.stringify(historyNodes),
      new Date().toISOString(),
      workflowId,
      versionId,
    ]);

    console.log(JSON.stringify({
      workflowId,
      versionId,
      backupPath,
      entityPatches,
      historyPatches,
      patched: 'shared update completion now persists final-body coverage metadata and broader paragraph dash-list cleanup',
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
