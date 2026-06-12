const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const { parse: parseFlatted } = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const executionId = process.argv[2] || '1078671';
const db = new sqlite3.Database('C:/Users/anujalhans01/.n8n/database.sqlite', sqlite3.OPEN_READONLY);

function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function parseData(value) {
  try {
    return parseFlatted(value);
  } catch {
    return JSON.parse(value);
  }
}

function headingCount(text, title) {
  const escapedTitle = title.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp('^#{1,6}\\s*(?:\\d+\\.\\s*)?' + escapedTitle + '\\s*$', 'gmi');
  return (String(text || '').match(pattern) || []).length;
}

function buildDeterministicLayer2Table() {
  return [
    '## 4. Layer 2 - User Stories to Generated Test Cases',
    '',
    'Deterministic smoke table.',
    '',
    '| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    '| KAN-SMOKE | Smoke story | KAN-TC-SMOKE | 1 | Smoke | Covered | Smoke validation |',
  ].join('\n');
}

function oldReplaceRtmLayer2WithContext(text) {
  const deterministicTable = buildDeterministicLayer2Table();
  const pattern = /^\s*(?:#{1,6}\s*)?(?:4\.\s*)?Layer 2 - User Stories to Generated Test Cases\s*$[\s\S]*?(?=^\s*(?:#{1,6}\s*)?(?:5\.\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\s*$)/mi;
  if (pattern.test(text)) {
    return String(text).replace(pattern, deterministicTable + '\n\n');
  }
  return String(text) + '\n\n' + deterministicTable;
}

function rtmHeadingRegex(title, numberPrefix = '') {
  const escapedTitle = String(title || '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const escapedPrefix = numberPrefix ? String(numberPrefix).replace('.', '\\.') + '\\s*' : '';
  return new RegExp('^\\s*(?:#{1,6}\\s*)?(?:' + escapedPrefix + ')?' + escapedTitle + '\\s*$', 'i');
}

function findRtmHeadingIndex(lines, title, numberPrefix = '') {
  const pattern = rtmHeadingRegex(title, numberPrefix);
  return lines.findIndex(line => pattern.test(String(line || '').trim()));
}

function patchedReplaceRtmLayer2WithContext(text) {
  const deterministicTable = buildDeterministicLayer2Table();
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
}

(async () => {
  try {
    const row = await get('select data from execution_data where executionId = ?', [executionId]);
    if (!row) throw new Error(`No execution_data found for ${executionId}`);
    const data = parseData(row.data);
    const item = data?.resultData?.runData?.['Validate AI Agent Output']?.[0]?.data?.main?.[0]?.[0]?.json;
    const rawMarkdown = item?.rawMarkdown || '';
    if (!rawMarkdown) throw new Error('Validate AI Agent Output rawMarkdown not found');

    const oldText = oldReplaceRtmLayer2WithContext(rawMarkdown);
    const patchedText = patchedReplaceRtmLayer2WithContext(rawMarkdown);
    console.log(JSON.stringify({
      executionId,
      rawLayer2HeadingCount: headingCount(rawMarkdown, 'Layer 2 - User Stories to Generated Test Cases'),
      oldLayer2HeadingCount: headingCount(oldText, 'Layer 2 - User Stories to Generated Test Cases'),
      patchedLayer2HeadingCount: headingCount(patchedText, 'Layer 2 - User Stories to Generated Test Cases'),
      patchedHasLayer2Table: /\|\s*Story Key\s*\|\s*Story Summary\s*\|\s*Test Case Keys\s*\|/i.test(patchedText),
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
