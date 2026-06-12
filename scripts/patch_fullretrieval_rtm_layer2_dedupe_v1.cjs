const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const label = 'rtm_layer2_dedupe_v1';
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) {
    error ? reject(error) : resolve(this);
  }));
}

function requireNode(nodes, name) {
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Required node not found: ${name}`);
  return node;
}

function patchQualityGate(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  const oldReplaceFunction = String.raw`function replaceRtmLayer2WithContext(text) {
  if (documentType !== 'traceability_matrix') return text;
  const deterministicTable = buildDeterministicLayer2Table();
  if (!deterministicTable) return text;
  const pattern = /^\s*(?:#{1,6}\s*)?(?:4\.\s*)?Layer 2 - User Stories to Generated Test Cases\s*$[\s\S]*?(?=^\s*(?:#{1,6}\s*)?(?:5\.\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\s*$)/mi;
  if (pattern.test(text)) {
    return String(text).replace(pattern, deterministicTable + '\n\n');
  }
  return String(text) + '\n\n' + deterministicTable;
}`;

  const newReplaceFunction = String.raw`function rtmHeadingRegex(title, numberPrefix = '') {
  const escapedTitle = String(title || '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const escapedPrefix = numberPrefix ? String(numberPrefix).replace('.', '\\.') + '\\s*' : '';
  return new RegExp('^\\s*(?:#{1,6}\\s*)?(?:' + escapedPrefix + ')?' + escapedTitle + '\\s*$', 'i');
}

function findRtmHeadingIndex(lines, title, numberPrefix = '') {
  const pattern = rtmHeadingRegex(title, numberPrefix);
  return lines.findIndex(line => pattern.test(String(line || '').trim()));
}

function replaceRtmLayer2WithContext(text) {
  if (documentType !== 'traceability_matrix') return text;
  const deterministicTable = buildDeterministicLayer2Table();
  if (!deterministicTable) return text;
  const lines = String(text || '').split(/\r?\n/);
  const start = findRtmHeadingIndex(lines, 'Layer 2 - User Stories to Generated Test Cases', '4.');
  if (start < 0) return String(text || '').trim() + '\n\n' + deterministicTable;

  const nextSectionPatterns = [
    rtmHeadingRegex('Layer 2 Gaps - Stories Without Test Case Coverage', '5.'),
    rtmHeadingRegex('Coverage by Test Category', '6.'),
    rtmHeadingRegex('Coverage Ledger', '7.'),
    rtmHeadingRegex('Governance & Audit Readiness Commentary', '8.'),
    /^\s*#{1,6}\s+\d+\.\s+/i,
  ];
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const candidate = String(lines[index] || '').trim();
    if (nextSectionPatterns.some(pattern => pattern.test(candidate))) {
      end = index;
      break;
    }
  }
  return [
    ...lines.slice(0, start),
    deterministicTable,
    '',
    ...lines.slice(end),
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}`;

  if (!code.includes('function rtmHeadingRegex(title, numberPrefix')) {
    if (!code.includes(oldReplaceFunction)) throw new Error('replaceRtmLayer2WithContext anchor not found');
    code = code.replace(oldReplaceFunction, () => newReplaceFunction);
    patches += 1;
  }

  const helperAnchor = `function stripUnsupportedRtmRiskFields(text) {`;
  const dedupeHelper = String.raw`
function dedupeRtmLayer2Sections(text) {
  if (documentType !== 'traceability_matrix') return text;
  const deterministicTable = buildDeterministicLayer2Table();
  if (!deterministicTable) return text;
  return replaceRtmLayer2WithContext(text);
}

`;
  if (!code.includes('function dedupeRtmLayer2Sections(text)')) {
    if (!code.includes(helperAnchor)) throw new Error('stripUnsupportedRtmRiskFields anchor not found');
    code = code.replace(helperAnchor, dedupeHelper + helperAnchor);
    patches += 1;
  }

  const firstCallAnchor = `rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);
rawMarkdown = injectRtmFreshnessNotice(rawMarkdown);`;
  const firstCallReplacement = `rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);
rawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);
rawMarkdown = injectRtmFreshnessNotice(rawMarkdown);`;
  if (!code.includes('rawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);\nrawMarkdown = injectRtmFreshnessNotice(rawMarkdown);')) {
    if (!code.includes(firstCallAnchor)) throw new Error('RTM Layer 2 first call anchor not found');
    code = code.replace(firstCallAnchor, firstCallReplacement);
    patches += 1;
  }

  const secondCallAnchor = `rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);`;
  const secondCallReplacement = `rawMarkdown = replaceRtmCoverageLedgerMarkdown(rawMarkdown, effectiveCoverageLedger);
  rawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);
  rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);`;
  if (!code.includes('rawMarkdown = dedupeRtmLayer2Sections(rawMarkdown);\n  rawMarkdown = stripUnsupportedRtmRiskFields(rawMarkdown);')) {
    if (!code.includes(secondCallAnchor)) throw new Error('RTM post coverage replacement anchor not found');
    code = code.replace(secondCallAnchor, secondCallReplacement);
    patches += 1;
  }

  if (patches < 3) throw new Error(`Quality Gate patch incomplete: ${patches}`);
  try {
    new Function(code);
  } catch (error) {
    const debugPath = path.join(process.cwd(), 'tmp_rtm_layer2_quality_gate_debug.js');
    fs.writeFileSync(debugPath, code);
    error.message += ` (patched code written to ${debugPath})`;
    throw error;
  }
  node.parameters.jsCode = code;
  return patches;
}

async function main() {
  fs.mkdirSync(backupDir, { recursive: true });
  const db = new sqlite3.Database(dbPath);
  try {
    const entity = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!entity) throw new Error(`Workflow not found: ${workflowId}`);
    const history = entity.activeVersionId
      ? await get(db, 'select versionId, workflowId, nodes, connections from workflow_history where workflowId = ? and versionId = ?', [workflowId, entity.activeVersionId])
      : null;

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: entity, workflow_history: history }, null, 2));

    const entityNodes = JSON.parse(entity.nodes);
    const historyNodes = history ? JSON.parse(history.nodes) : null;
    const entityPatches = patchQualityGate(requireNode(entityNodes, 'Quality Gate'));
    const historyPatches = historyNodes ? patchQualityGate(requireNode(historyNodes, 'Quality Gate')) : 0;
    const now = new Date().toISOString();

    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [
      JSON.stringify(entityNodes),
      now,
      workflowId,
    ]);
    if (history && historyNodes) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [
        JSON.stringify(historyNodes),
        now,
        workflowId,
        entity.activeVersionId,
      ]);
    }

    console.log(JSON.stringify({
      ok: true,
      workflowId,
      workflowName: entity.name,
      activeVersionId: entity.activeVersionId,
      backupPath,
      entityPatches,
      historyPatches,
      patched: [
        'RTM Layer 2 replacement now tolerates heading variations after Layer 2',
        'RTM final markdown runs Layer 2 de-duplication before contract validation',
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
