const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const flatted = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try {
    return JSON.parse(value);
  } catch {
    return flatted.parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => {
    error ? reject(error) : resolve(row);
  }));
}

function requireNode(nodes, name) {
  const found = nodes.find((node) => node.name === name);
  if (!found) throw new Error(`Node not found: ${name}`);
  return found;
}

function patchPromptLibrary(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  const anchor = `'Risk IDs are not available in the current RTM context. Do not include a Risk ID column. If risk linkage is needed, write "Risk linkage not generated in this run" in narrative text only.',`;
  const inserted = [
    anchor,
    `    'Do not write the phrase "Risk ID" anywhere in the final RTM output. Use "risk linkage" only for any short explanatory note.',`,
    `    'If a draft contains any Risk ID or risk identifier column, remove that column before final answer and keep the RTM limited to the two supported traceability layers.',`,
  ].join('\n');

  if (!code.includes('Do not write the phrase "Risk ID" anywhere in the final RTM output.')) {
    if (!code.includes(anchor)) throw new Error('Prompt Library RTM Risk ID anchor not found');
    code = code.replace(anchor, inserted);
    patches += 1;
  }

  node.parameters.jsCode = code;
  return patches;
}

function patchQualityGate(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  if (!code.includes('function stripUnsupportedRtmRiskFields(text)')) {
    const anchor = `function replaceRtmLayer2WithContext(text) {
  if (documentType !== 'traceability_matrix') return text;
  const deterministicTable = buildDeterministicLayer2Table();
  if (!deterministicTable) return text;
  const pattern = /^\\s*(?:#{1,6}\\s*)?(?:4\\.\\s*)?Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^\\s*(?:#{1,6}\\s*)?(?:5\\.\\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;
  if (pattern.test(text)) {
    return String(text).replace(pattern, deterministicTable + '\\n\\n');
  }
  return String(text) + '\\n\\n' + deterministicTable;
}
`;
    const helper = `${anchor}
function stripUnsupportedRtmRiskFields(text) {
  if (documentType !== 'traceability_matrix') return text;

  const splitTableLine = (line) => String(line || '')
    .trim()
    .replace(/^\\|/, '')
    .replace(/\\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
  const isTableLine = (line) => /^\\s*\\|.*\\|\\s*$/.test(String(line || ''));
  const isRiskIdHeader = (cell) => /^risk\\s*(?:id|ids|identifier|identifiers)$/i.test(String(cell || '').trim());
  const renderTableLine = (cells) => '| ' + cells.map((cell) => String(cell || '').trim() || '-').join(' | ') + ' |';

  const lines = String(text || '').split(/\\r?\\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!isTableLine(line)) {
      output.push(String(line || '')
        .replace(/\\bRisk\\s+IDs?\\b/gi, 'risk linkage')
        .replace(/\\bRSK-[A-Za-z0-9-]+\\b/g, 'risk linkage not generated'));
      continue;
    }

    const group = [];
    while (index < lines.length && isTableLine(lines[index])) {
      group.push(lines[index]);
      index += 1;
    }
    index -= 1;

    const headerCells = splitTableLine(group[0]);
    const removeIndexes = headerCells
      .map((cell, cellIndex) => (isRiskIdHeader(cell) ? cellIndex : -1))
      .filter((cellIndex) => cellIndex >= 0);

    if (!removeIndexes.length) {
      output.push(...group.map((row) => row
        .replace(/\\bRisk\\s+IDs?\\b/gi, 'risk linkage')
        .replace(/\\bRSK-[A-Za-z0-9-]+\\b/g, 'risk linkage not generated')));
      continue;
    }

    for (const row of group) {
      const cells = splitTableLine(row).filter((_, cellIndex) => !removeIndexes.includes(cellIndex));
      output.push(renderTableLine(cells));
    }
  }

  return output.join('\\n');
}
`;
    if (!code.includes(anchor)) throw new Error('Quality Gate replaceRtmLayer2WithContext anchor not found');
    code = code.replace(anchor, helper);
    patches += 1;
  }

  if (!code.includes('rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);')) {
    const anchor = `rawMarkdown = injectRtmFreshnessNotice(rawMarkdown);`;
    if (!code.includes(anchor)) throw new Error('Quality Gate RTM normalization call anchor not found');
    code = code.replace(anchor, `${anchor}
rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);`);
    patches += 1;
  }

  if (!code.includes('rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);\n  wordCount = rawMarkdown.trim()')) {
    const anchor = `if (rtmCoverageMerge.applied || rtmStoryGapCoverageRows(traceabilityContextForGate).length) {
  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));
  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;
}`;
    const replacement = `if (rtmCoverageMerge.applied || rtmStoryGapCoverageRows(traceabilityContextForGate).length) {
  Object.assign(coverageSummary, summarizeCoverageRows(effectiveCoverageLedger, coverageSummary));
  rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);
  wordCount = rawMarkdown.trim() ? rawMarkdown.trim().split(/\\s+/).length : 0;
}`;
    if (!code.includes(anchor)) throw new Error('Quality Gate RTM coverage replacement anchor not found');
    code = code.replace(anchor, replacement);
    patches += 1;
  }

  const oldValidator = `if (/\\bRisk ID\\b/i.test(text) || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Risk IDs are not available in the RTM context and must not be invented.');
  }`;
  const newValidator = `const hasRiskIdColumn = markdownTableGroups(text).some(rows => tableCells(rows[0]).some(cell => /^risk\\s*(?:id|ids|identifier|identifiers)$/i.test(cell)));
  if (hasRiskIdColumn || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Risk identifiers are not available in the RTM context and must not be invented.');
  }`;
  if (code.includes(oldValidator)) {
    code = code.replace(oldValidator, newValidator);
    patches += 1;
  }

  if (patches < 3) throw new Error(`Quality Gate patch incomplete: ${patches}`);
  node.parameters.jsCode = code;
  return patches;
}

function patchWorkflow(nodes) {
  const promptPatches = patchPromptLibrary(requireNode(nodes, 'Prompt Library'));
  const qualityGatePatches = patchQualityGate(requireNode(nodes, 'Quality Gate'));
  return { promptPatches, qualityGatePatches };
}

async function main() {
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'SELECT * FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!entity) throw new Error(`workflow_entity not found: ${workflowId}`);
    const versionId = entity.activeVersionId || entity.versionId;
    const history = await get(db, 'SELECT * FROM workflow_history WHERE workflowId = ? AND versionId = ?', [workflowId, versionId]);
    if (!history) throw new Error(`workflow_history not found: ${workflowId} / ${versionId}`);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_rtm_no_risk_ids_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: entity, workflow_history: history }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchWorkflow(entityNodes);
    const historyPatches = patchWorkflow(historyNodes);
    const updatedAt = new Date().toISOString();

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?', [
      JSON.stringify(entityNodes),
      updatedAt,
      workflowId,
    ]);
    await run(db, 'UPDATE workflow_history SET nodes = ?, updatedAt = ? WHERE workflowId = ? AND versionId = ?', [
      JSON.stringify(historyNodes),
      updatedAt,
      workflowId,
      versionId,
    ]);

    console.log(JSON.stringify({
      workflowId,
      versionId,
      backupPath,
      entityPatches,
      historyPatches,
      patched: [
        'RTM prompt now forbids Risk ID phrase/columns in final output',
        'RTM-only sanitizer removes unsupported Risk ID columns and invented RSK tokens before contract validation',
        'RTM validator now blocks actual Risk ID columns and RSK tokens without failing safe narrative wording',
      ],
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
