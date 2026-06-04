const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'fullRetrievalD01';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function parseAny(value) {
  try {
    return JSON.parse(value);
  } catch {
    return require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted').parse(value);
  }
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function requireNode(nodes, name) {
  const node = nodes.find(item => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function replaceBetween(code, startMarker, endMarker, replacement) {
  const start = code.indexOf(startMarker);
  if (start < 0) throw new Error(`Start marker not found: ${startMarker}`);
  const end = code.indexOf(endMarker, start);
  if (end < 0) throw new Error(`End marker not found: ${endMarker}`);
  return code.slice(0, start) + replacement + code.slice(end);
}

function replaceEntryAfter(code, anchor, entryMarker, endMarker, replacement) {
  const anchorIndex = code.indexOf(anchor);
  if (anchorIndex < 0) throw new Error(`Anchor not found: ${anchor}`);
  const start = code.indexOf(entryMarker, anchorIndex);
  if (start < 0) throw new Error(`Entry marker not found after ${anchor}: ${entryMarker}`);
  const end = code.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Entry end marker not found: ${endMarker}`);
  return code.slice(0, start) + replacement + code.slice(end);
}

function patchPromptLibrary(code) {
  if (!code.includes('const configSnapshot = $json.configSnapshot || {};')) {
    code = code.replace(
      'const traceabilityContext = $json.traceabilityContext || {};',
      `const traceabilityContext = $json.traceabilityContext || {};
const configSnapshot = $json.configSnapshot || {};
const runtimeGenerationModel = configSnapshot.models?.generationModel || configSnapshot.models?.generation_model || 'runtime-configured';
const runtimeChromaCollection = configSnapshot.chroma?.collection || configSnapshot.vectorStore?.collection || 'runtime-configured';`
    );
  }

  const twoLayerFunction = `function buildTwoLayerRtmInstructions(type, context) {
  if (type !== 'traceability_matrix' || !context || context.version !== 'two_layer_rtm_v1') return '';
  const compact = {
    version: context.version,
    projectId: context.projectId,
    projectName: context.projectName,
    backlogJobId: context.backlogJobId,
    storyTestCaseJobId: context.storyTestCaseJobId,
    counts: context.counts,
    epics: context.epics || [],
    stories: context.stories || [],
    storyTestCaseLinks: context.storyTestCaseLinks || [],
    storiesWithoutTestCases: context.storiesWithoutTestCases || []
  };
  return [
    '==============================',
    'TWO-LAYER REQUIREMENT TRACEABILITY INPUT',
    '==============================',
    '',
    'Generate a true Requirement Traceability Matrix with exactly two traceability layers.',
    '',
    'Use only actual Jira epic keys, story keys, and test case keys supplied in this context.',
    'Do not invent Risk IDs, Test Case IDs, Epic IDs, Story IDs, automation statuses, Jira links, requirement counts, model names, or vector collection names.',
    'Risk IDs are not available in the current RTM context. Do not include a Risk ID column. If risk linkage is needed, write "Risk linkage not generated in this run" in narrative text only.',
    'Automation execution status is not available in the current RTM context. Do not include an Automation Status column or automation percentage. A short narrative note saying automation status was not available is allowed.',
    '',
    'Markdown table safety rules:',
    '- Never put the pipe character | inside any table cell.',
    '- Source references inside tables must use this format: DocType - FileName - Section - chunkId:abc123.',
    '- If source metadata has a composite chunkId such as uuid|page|index|source, keep only the uuid or rewrite it with hyphens. Never copy the pipe-delimited form into a table.',
    '- Do not use bracketed source references like [FRD | file | section | chunkId] inside tables.',
    '- Every row in a table must have exactly the same number of columns as its header.',
    '- Do not use range shorthand such as KAN-560..KAN-570. List actual keys from the supplied context.',
    '',
    'Required output sections, exactly once and in this order:',
    '1. Executive Coverage Summary',
    '2. Layer 1 - Requirements to Epics/User Stories',
    '3. Layer 1 Gaps - Requirements Without Backlog Coverage',
    '4. Layer 2 - User Stories to Generated Test Cases',
    '5. Layer 2 Gaps - Stories Without Test Case Coverage',
    '6. Coverage by Test Category',
    '7. Coverage Ledger',
    '8. Governance & Audit Readiness Commentary',
    '',
    'Section 2 must contain exactly this table schema:',
    '| Req ID | Requirement Description | Source Reference | Design Component | Jira Epic Key | Jira Story Key | Backlog Coverage Status | Traceability Notes |',
    '',
    'Section 4 must contain exactly this table schema:',
    '| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |',
    '',
    'Section 6 must contain exactly this table schema:',
    '| Test Category | Coverage Scope | Evidence Basis | Notes |',
    '',
    'Section 7 must contain exactly this table schema:',
    '| Coverage ID | Module / Requirement | Source Reference | Included In Output | Coverage Status | Notes |',
    '',
    'Do not include a legacy "Main Requirement Traceability Matrix Table" section.',
    'Do not repeat Coverage Ledger.',
    'Executive summary counts must match the actual supplied context and generated ledger. If there are 13 ledger items, do not say 38 requirements.',
    'Do not claim requirements are implemented, tested, validated, verified, passed, executed, or production-ready unless that status is present in supplied execution evidence.',
    'Layer 1 Traceability Notes must describe traceability state only, for example: "Mapped to backlog and generated test-case coverage; implementation and execution status not assessed."',
    'Coverage by Test Category must not use a misleading "Number of Test Cases" column unless numeric category counts are available from supplied metadata. Use Coverage Scope and Evidence Basis instead.',
    '',
    'Two-layer traceability context JSON:',
    JSON.stringify(compact)
  ].join('\\n');
}

`;

  code = replaceBetween(code, 'function buildTwoLayerRtmInstructions', '\nconst canonical = values', twoLayerFunction);

  const traceabilityProfile = `  traceability_matrix: {
    label: 'Requirement Traceability Matrix',
    intent: 'Prioritize requirement IDs, business and functional requirements, acceptance criteria, design components, test coverage, risk mapping, and automation coverage evidence.',
    primaryDocTypes: ['BRD', 'FRD', 'PRD', 'SRS'],
    secondaryDocTypes: ['TEST_CASES', 'TEST_PLAN', 'UI_UX', 'API_SPEC', 'HLD', 'LLD', 'TRANSCRIPT'],
    preferredCategories: ['business_requirements', 'functional_requirements', 'quality_assurance', 'user_experience', 'technical_design'],
    preferredArtifacts: ['business_requirements_document', 'functional_requirements_document', 'software_requirements_specification', 'test_cases', 'test_plan'],
    sectionKeywords: ['requirement', 'req', 'acceptance', 'traceability', 'business rule', 'coverage', 'test case', 'test scenario', 'design component']
  },`;

  code = replaceEntryAfter(code, 'const retrievalProfiles = {', '  traceability_matrix: {', '\n  user_stories:', traceabilityProfile);

  const traceabilityPrompt = `  traceability_matrix: {
    title: "Requirement Traceability Matrix",
    system: [
      'Before the document, include:',
      '',
      '---',
      'Document: Enterprise Requirement Traceability Matrix',
      'Generated On: {{ $now }}',
      'Model: ' + runtimeGenerationModel,
      'Vector Collection: ' + runtimeChromaCollection,
      '---',
      '',
      'You are a QA Governance Specialist responsible for audit-grade, two-layer requirement traceability.',
      '',
      'You must produce concise, factual traceability using only retrieved requirement evidence and the supplied Jira/test-case context.',
      'Do not fabricate risk IDs, automation status, model metadata, vector collection names, Jira keys, or test case keys.',
      'If a linkage is unavailable, mark it as Not linked or Not available rather than inventing it.'
    ].join('\\n'),
    user: [
      'Generate the Requirement Traceability Matrix using the two-layer RTM context and retrieved project evidence.',
      '',
      'Hard requirements:',
      '1. Produce exactly the eight required sections from the TWO-LAYER REQUIREMENT TRACEABILITY INPUT block.',
      '2. Layer 1 maps source requirements to actual Jira Epic and Story keys.',
      '3. Layer 2 maps every generated Story key to its actual generated Test Case keys.',
      '4. Use all supplied Story keys and all supplied Test Case keys. Do not summarize test case keys as ranges.',
      '5. Do not include Risk ID or Automation Status columns. A narrative "not available" note is acceptable; do not claim automated/manual/percentage coverage.',
      '6. Do not include any table cell containing the pipe character | except as markdown column separators.',
      '7. Source references in tables must use hyphen separators, for example: FRD - FRD_AstraCart_Ecommerce_Platform.docx - Validation and Error Handling - chunkId:a5396b3a.',
      '7a. If retrieved chunk metadata contains a pipe-delimited composite key like uuid|page|index|source, use only uuid or rewrite it as uuid-page-index-source.',
      '8. Include exactly one Coverage Ledger section.',
      '9. Do not include a legacy Main Requirement Traceability Matrix Table.',
      '10. Counts in the Executive Coverage Summary, Coverage Summary Metrics, and Coverage Ledger must agree with each other.',
      '11. Do not write "fully implemented", "tested", "validated", "verified", "passed", or similar delivery/execution claims. This RTM only proves traceability coverage unless execution evidence is supplied.',
      '12. In Layer 1, use Traceability Notes to explain mapping evidence, not delivery status. Preferred wording: "Mapped to backlog and generated test-case coverage; implementation and execution status not assessed."',
      '13. In Coverage by Test Category, use the column "Coverage Scope" unless you can populate a numeric count from supplied category metadata.',
      '',
      'When unsure, prefer transparent Not available / Not linked wording over invented values.'
    ].join('\\n')
  }`;

  code = replaceEntryAfter(code, 'const promptLibrary = {', '  traceability_matrix: {', '\n};', traceabilityPrompt);

  const coverageGateReminder = `const coverageGateReminder = type === 'traceability_matrix'
  ? [
      '========================',
      'TRACEABILITY MATRIX QUALITY GATE REMINDER',
      '========================',
      'The final RTM must satisfy the RTM output contract exactly.',
      'Required sections must appear once: Executive Coverage Summary, Layer 1, Layer 1 Gaps, Layer 2, Layer 2 Gaps, Coverage by Test Category, Coverage Ledger, Governance & Audit Readiness Commentary.',
      'Do not include Risk ID or Automation Status columns. A narrative "not available" note is acceptable; do not claim automated/manual/percentage coverage.',
      'Do not include a legacy Main Requirement Traceability Matrix Table.',
      'Do not repeat Coverage Ledger.',
      'Do not use pipe characters inside table cell values.',
      'If source chunk metadata contains pipe-delimited composite keys, rewrite them with hyphens before placing them in a table.',
      'Do not use test key ranges. List actual generated test case keys from the supplied context.',
      'All table rows must align with their header column counts.',
      'Do not claim fully implemented, tested, validated, verified, passed, executed, or production-ready status unless supplied execution evidence exists.',
      'Layer 1 table must use Traceability Notes, not implementation/testing notes.',
      'Coverage by Test Category must use Coverage Scope and Evidence Basis rather than a non-numeric Number of Test Cases column.'
    ].join('\\n')
  : '';

`;

  code = replaceBetween(code, 'const coverageGateReminder = type ===', '\nconst enhancedUser = [', coverageGateReminder);

  code = code.replace(
    `'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Where possible, cite source metadata in the format [docType | source file | sectionTitle | chunkId].'`,
    `type === 'traceability_matrix'
    ? 'Additional RTM Confluence requirement: keep tables column-safe. Use source metadata in table cells as DocType - source file - sectionTitle - chunkId. Never use [docType | source file | sectionTitle | chunkId] inside RTM tables.'
    : 'Additional Confluence generation requirement: organize the final document so that traceability is visible and useful. Where possible, cite source metadata in the format [docType | source file | sectionTitle | chunkId].'`
  );

  return code;
}

function patchQualityGate(code) {
  code = code.replace('const rawMarkdown = data.rawMarkdown || "";', 'let rawMarkdown = data.rawMarkdown || "";');
  code = code.replace('rawMarkdown: data.rawMarkdown,', 'rawMarkdown,');
  code = code.replace('charCount: data.charCount,', 'charCount: rawMarkdown.length,');

  const deterministicLayer2 = `
function rtmTableCell(value) {
  const normalized = String(value === undefined || value === null ? 'Not available' : value)
    .replace(/\\|/g, '-')
    .replace(/[\\r\\n]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim();
  return normalized || 'Not available';
}

function buildDeterministicLayer2Table() {
  if (documentType !== 'traceability_matrix') return '';
  const context = $('Prompt Library').item.json.traceabilityContext || {};
  const stories = Array.isArray(context.stories) ? context.stories : [];
  const links = Array.isArray(context.storyTestCaseLinks) ? context.storyTestCaseLinks : [];
  if (!stories.length || !links.length) return '';

  const linksByStory = new Map();
  for (const link of links) {
    const storyKey = rtmTableCell(link.storyKey);
    if (!storyKey || storyKey === 'Not available') continue;
    if (!linksByStory.has(storyKey)) linksByStory.set(storyKey, []);
    linksByStory.get(storyKey).push(link);
  }

  const rows = stories.map(story => {
    const storyKey = rtmTableCell(story.storyKey);
    const storyLinks = linksByStory.get(storyKey) || [];
    const testCaseKeys = [...new Set(storyLinks.map(link => rtmTableCell(link.testcaseKey)).filter(key => key && key !== 'Not available'))];
    const categories = [...new Set(storyLinks.flatMap(link => Array.isArray(link.categories) ? link.categories : []).map(rtmTableCell).filter(value => value && value !== 'Not available'))];
    const coverage = testCaseKeys.length ? 'Covered' : 'Missing';
    const notes = testCaseKeys.length
      ? 'Trace established from persisted story-testcase links in ' + rtmTableCell(context.storyTestCaseJobId || 'traceability context')
      : 'No generated test case links found in traceability context';
    return '| ' + [
      storyKey,
      rtmTableCell(story.storySummary || story.summary),
      rtmTableCell(testCaseKeys.join(', ')),
      String(testCaseKeys.length),
      rtmTableCell(categories.length ? categories.join(', ') : 'Not available from link metadata'),
      coverage,
      notes
    ].join(' | ') + ' |';
  });

  return [
    '## 4. Layer 2 - User Stories to Generated Test Cases',
    '',
    'This table is generated from persisted story-testcase links to keep RTM coverage complete and audit-safe.',
    '',
    '| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows
  ].join('\\n');
}

function replaceRtmLayer2WithContext(text) {
  if (documentType !== 'traceability_matrix') return text;
  const deterministicTable = buildDeterministicLayer2Table();
  if (!deterministicTable) return text;
  const pattern = /^\\s*(?:#{1,6}\\s*)?(?:4\\.\\s*)?Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^\\s*(?:#{1,6}\\s*)?(?:5\\.\\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;
  if (pattern.test(text)) {
    return String(text).replace(pattern, deterministicTable + '\\n\\n');
  }
  return String(text) + '\\n\\n' + deterministicTable;
}

function dedupeCommaSeparatedJiraKeys(value) {
  const parts = String(value || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length < 2 || !parts.every(part => /^[A-Z][A-Z0-9]+-\\d+$/.test(part))) {
    return value;
  }
  return [...new Set(parts)].join(', ');
}

function normalizeRtmGeneratedText(text) {
  if (documentType !== 'traceability_matrix') return text;
  const normalized = String(text || '')
    .split(/\\r?\\n/)
    .map(line => {
      if (!/^\\s*\\|.*\\|\\s*$/.test(line)) {
        return line.replace(/\\bState Pers\\./g, 'State Persistence');
      }
      const leading = line.match(/^\\s*/)[0];
      const trailing = line.match(/\\s*$/)[0];
      const cells = line
        .trim()
        .replace(/^\\|/, '')
        .replace(/\\|$/, '')
        .split('|')
        .map(cell => cell.trim());
      const normalizedCells = cells.map(cell => {
        const expanded = cell.replace(/\\bState Pers\\./g, 'State Persistence');
        return dedupeCommaSeparatedJiraKeys(expanded);
      });
      return leading + '| ' + normalizedCells.join(' | ') + ' |' + trailing;
    })
    .join('\\n');
  return normalized.replace(
    /Key Metrics:\\s*\\n- Epics:\\s*([^\\n]+)\\n- User Stories:\\s*([^\\n]+)\\n- Test Cases linked to Stories:\\s*([^\\n]+)\\n- User Stories without Test Cases:\\s*([^\\n]+)/,
    [
      'Key Metrics:',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      '| Epics | $1 |',
      '| User Stories | $2 |',
      '| Test Cases linked to Stories | $3 |',
      '| User Stories without Test Cases | $4 |'
    ].join('\\n')
  );
}
`;

  if (!code.includes('function sanitizeRtmMarkdownTables')) {
    const sanitizer = `
function sanitizeRtmMarkdownTables(text) {
  if (documentType !== 'traceability_matrix') return text;
  return String(text || '')
    .split(/\\r?\\n/)
    .map(line => {
      if (!/^\\s*\\|.*\\|\\s*$/.test(line)) return line;
      return line
        .replace(/chunkId:([^|\\s]+)\\|(\\d+)\\|(\\d+)\\|([A-Za-z0-9_-]+)/g, 'chunkId:$1-$2-$3-$4')
        .replace(/\\[([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\s*\\|\\s*([^\\]\\n|]+)\\]/g, '$1 - $2 - $3 - $4');
    })
    .join('\\n');
}

rawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);
rawMarkdown = normalizeRtmGeneratedText(rawMarkdown);
rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);

`;
    code = code.replace('\nconst MIN_WORD_COUNTS = {', sanitizer.replace('\nrawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\n', '\n' + deterministicLayer2 + '\nrawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\n') + 'const MIN_WORD_COUNTS = {');
  } else if (!code.includes('function replaceRtmLayer2WithContext')) {
    code = code.replace(
      'rawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\n\n',
      deterministicLayer2 + '\nrawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);\n\n'
    );
  } else if (!code.includes('rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);')) {
    code = code.replace(
      'rawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);',
      'rawMarkdown = sanitizeRtmMarkdownTables(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);'
    );
  }
  if (!code.includes('function dedupeCommaSeparatedJiraKeys')) {
    code = code.replace(
      '\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);',
      `
function dedupeCommaSeparatedJiraKeys(value) {
  const parts = String(value || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.length < 2 || !parts.every(part => /^[A-Z][A-Z0-9]+-\\d+$/.test(part))) {
    return value;
  }
  return [...new Set(parts)].join(', ');
}

function normalizeRtmGeneratedText(text) {
  if (documentType !== 'traceability_matrix') return text;
  const normalized = String(text || '')
    .split(/\\r?\\n/)
    .map(line => {
      if (!/^\\s*\\|.*\\|\\s*$/.test(line)) {
        return line.replace(/\\bState Pers\\./g, 'State Persistence');
      }
      const leading = line.match(/^\\s*/)[0];
      const trailing = line.match(/\\s*$/)[0];
      const cells = line
        .trim()
        .replace(/^\\|/, '')
        .replace(/\\|$/, '')
        .split('|')
        .map(cell => cell.trim());
      const normalizedCells = cells.map(cell => {
        const expanded = cell.replace(/\\bState Pers\\./g, 'State Persistence');
        return dedupeCommaSeparatedJiraKeys(expanded);
      });
      return leading + '| ' + normalizedCells.join(' | ') + ' |' + trailing;
    })
    .join('\\n');
  return normalized.replace(
    /Key Metrics:\\s*\\n- Epics:\\s*([^\\n]+)\\n- User Stories:\\s*([^\\n]+)\\n- Test Cases linked to Stories:\\s*([^\\n]+)\\n- User Stories without Test Cases:\\s*([^\\n]+)/,
    [
      'Key Metrics:',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      '| Epics | $1 |',
      '| User Stories | $2 |',
      '| Test Cases linked to Stories | $3 |',
      '| User Stories without Test Cases | $4 |'
    ].join('\\n')
  );
}

rawMarkdown = normalizeRtmGeneratedText(rawMarkdown);
rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);`
    );
  } else if (!code.includes('rawMarkdown = normalizeRtmGeneratedText(rawMarkdown);')) {
    code = code.replace(
      'rawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);',
      'rawMarkdown = normalizeRtmGeneratedText(rawMarkdown);\nrawMarkdown = replaceRtmLayer2WithContext(rawMarkdown);'
    );
  }
  code = code
    .replace(/\/\\\\bState Pers\\\\\\.\\\\b\/g/g, '/\\\\bState Pers\\\\./g')
    .replace(/\/\\bState Pers\\.\\b\/g/g, '/\\bState Pers\\./g');
  code = code.replace(
    `const pattern = /^#{1,6}\\s*4\\.\\s*Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^#{1,6}\\s*5\\.\\s*Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;`,
    `const pattern = /^\\s*(?:#{1,6}\\s*)?(?:4\\.\\s*)?Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^\\s*(?:#{1,6}\\s*)?(?:5\\.\\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;`
  );
  code = code.replace(
    `const pattern = /^#{1,6}\\s*(?:4\\.\\s*)?Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^#{1,6}\\s*(?:5\\.\\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;`,
    `const pattern = /^\\s*(?:#{1,6}\\s*)?(?:4\\.\\s*)?Layer 2 - User Stories to Generated Test Cases\\s*$[\\s\\S]*?(?=^\\s*(?:#{1,6}\\s*)?(?:5\\.\\s*)?Layer 2 Gaps - Stories Without Test Case Coverage\\s*$)/mi;`
  );
  code = code.replace(
    `? testCaseKeys.length + ' linked test cases from ' + rtmTableCell(context.storyTestCaseJobId || 'traceability context')`,
    `? 'Trace established from persisted story-testcase links in ' + rtmTableCell(context.storyTestCaseJobId || 'traceability context')`
  );
  code = code.replace(
    `      rtmTableCell(testCaseKeys.join(', ')),
      rtmTableCell(categories.length ? categories.join(', ') : 'Not available from link metadata'),
      coverage,
      notes`,
    `      rtmTableCell(testCaseKeys.join(', ')),
      String(testCaseKeys.length),
      rtmTableCell(categories.length ? categories.join(', ') : 'Not available from link metadata'),
      coverage,
      notes`
  );
  code = code.replace(
    `'| Story Key | Story Summary | Test Case Keys | Test Categories | Test Coverage Status | Notes |',`,
    `'| Story Key | Story Summary | Test Case Keys | Unique Test Case Count | Test Categories | Test Coverage Status | Traceability Notes |',`
  );
  code = code.replace(
    `'| --- | --- | --- | --- | --- | --- |',`,
    `'| --- | --- | --- | --- | --- | --- | --- |',`
  );
  if (!code.includes("const layer2HeadingCount = headingCount(text, 'Layer 2 - User Stories to Generated Test Cases');")) {
    code = code.replace(
      `  const coverageLedgerHeadingCount = headingCount(text, 'Coverage Ledger');
  if (coverageLedgerHeadingCount !== 1) {
    throw new Error('RTM Contract Failed - Expected exactly one Coverage Ledger heading, found ' + coverageLedgerHeadingCount + '.');
  }
`,
      `  const coverageLedgerHeadingCount = headingCount(text, 'Coverage Ledger');
  if (coverageLedgerHeadingCount !== 1) {
    throw new Error('RTM Contract Failed - Expected exactly one Coverage Ledger heading, found ' + coverageLedgerHeadingCount + '.');
  }
  const layer2HeadingCount = headingCount(text, 'Layer 2 - User Stories to Generated Test Cases');
  if (layer2HeadingCount !== 1) {
    throw new Error('RTM Contract Failed - Expected exactly one Layer 2 heading, found ' + layer2HeadingCount + '.');
  }
`
    );
  }

  if (code.includes('function validateRtmOutputContract')) {
    if (!code.includes('RTM Contract Failed - Delivery/execution status claims are not supported')) {
      code = code.replace(
        `  if (/\\bRisk ID\\b/i.test(text) || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Risk IDs are not available in the RTM context and must not be invented.');
  }
`,
        `  if (/\\bRisk ID\\b/i.test(text) || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Risk IDs are not available in the RTM context and must not be invented.');
  }
  if (/\\bfully\\s+(?:implemented|tested|validated|verified)|\\bimplemented\\s+and\\s+tested\\b|\\btests?\\s+passed\\b|\\bproduction[-\\s]?ready\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Delivery/execution status claims are not supported by the current RTM evidence.');
  }
  if (/\\|\\s*Number of Test Cases\\s*\\|/i.test(text)) {
    throw new Error('RTM Contract Failed - Coverage by Test Category must not use Number of Test Cases unless numeric counts are available. Use Coverage Scope and Evidence Basis.');
  }
`
      );
    }
    code = code.replace(
      `  if (Number(counts.storiesWithoutTestCases || 0) === 0 && /stories? without test cases?:?\\s*(?!0|none|no\\b)/i.test(text)) {
    throw new Error('RTM Contract Failed - Output suggests missing story test coverage even though context has zero missing stories.');
  }`,
      `  const misleadingMissingStoryLine = String(text || '').split(/\\r?\\n/).some(line => {
    const trimmed = line.trim();
    if (/^#{1,6}\\s*/.test(trimmed)) return false;
    if (!/stories? without test case/i.test(trimmed)) return false;
    return !/(^|[:\\-\\s])(?:0|none|no)\\b/i.test(trimmed);
  });
  if (Number(counts.storiesWithoutTestCases || 0) === 0 && misleadingMissingStoryLine) {
    throw new Error('RTM Contract Failed - Output suggests missing story test coverage even though context has zero missing stories.');
  }`
    );
    code = code.replace(
      `  if (/\\bAutomation Status\\b/i.test(text) || /approx(?:imate|\\.)?\\s*\\d+%\\s*automation/i.test(text)) {
    throw new Error('RTM Contract Failed - Automation status/percentage is not available in the RTM context.');
  }`,
      `  const hasAutomationColumn = markdownTableGroups(text).some(rows => tableCells(rows[0]).some(cell => /^automation status$/i.test(cell)));
  const hasAutomationPercentage = /approx(?:imate|\\.)?\\s*\\d+%\\s*automation|\\b\\d+%\\s*automation/i.test(text);
  const hasInventedAutomationCell = markdownTableGroups(text).some(rows => rows.slice(2).some(row => tableCells(row).some(cell => /^(automated|partially automated|manual|not automated)$/i.test(cell))));
  if (hasAutomationColumn || hasAutomationPercentage || hasInventedAutomationCell) {
    throw new Error('RTM Contract Failed - Automation columns, percentages, or invented automation statuses are not available in the RTM context.');
      }`
    );
    code = code.replace(
      `validateNamedTable(text, 'Layer 2 - User Stories to Generated Test Cases', ['Story Key', 'Story Summary', 'Test Case Keys', 'Test Categories', 'Test Coverage Status']);`,
      `validateNamedTable(text, 'Layer 2 - User Stories to Generated Test Cases', ['Story Key', 'Story Summary', 'Test Case Keys', 'Unique Test Case Count', 'Test Categories', 'Test Coverage Status']);`
    );
    if (!code.includes("validateNamedTable(text, 'Coverage by Test Category'")) {
      code = code.replace(
        `  validateNamedTable(text, 'Coverage Ledger', ['Coverage ID', 'Module / Requirement', 'Source Reference', 'Included In Output', 'Coverage Status', 'Notes']);`,
        `  validateNamedTable(text, 'Coverage by Test Category', ['Test Category', 'Coverage Scope', 'Evidence Basis', 'Notes']);
  validateNamedTable(text, 'Coverage Ledger', ['Coverage ID', 'Module / Requirement', 'Source Reference', 'Included In Output', 'Coverage Status', 'Notes']);`
      );
    }
    return code;
  }

  const validationBlock = `
function markdownTableGroups(text) {
  const lines = String(text || '').split(/\\r?\\n/);
  const groups = [];
  let current = [];
  for (const line of lines) {
    if (/^\\s*\\|.*\\|\\s*$/.test(line)) {
      current.push(line);
    } else if (current.length) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);
  return groups;
}

function tableCells(line) {
  return String(line || '')
    .trim()
    .replace(/^\\|/, '')
    .replace(/\\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isSeparatorLine(line) {
  return tableCells(line).every(cell => /^:?-{3,}:?$/.test(cell));
}

function headingCount(text, title) {
  const escapedTitle = title.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
  const pattern = new RegExp('^#{1,6}\\\\s*(?:\\\\d+\\\\.\\\\s*)?' + escapedTitle + '\\\\s*$', 'gmi');
  return (String(text || '').match(pattern) || []).length;
}

function validateNamedTable(text, tableName, requiredHeaders) {
  const groups = markdownTableGroups(text);
  const normalizedRequired = requiredHeaders.map(header => header.toLowerCase());
  const group = groups.find(rows => {
    const header = tableCells(rows[0]).map(cell => cell.toLowerCase());
    return normalizedRequired.every(required => header.includes(required));
  });
  if (!group) {
    throw new Error('RTM Contract Failed - Missing required table: ' + tableName);
  }
  const expectedCount = tableCells(group[0]).length;
  for (const row of group) {
    if (isSeparatorLine(row)) continue;
    const count = tableCells(row).length;
    if (count !== expectedCount) {
      throw new Error('RTM Contract Failed - Table "' + tableName + '" has a row with ' + count + ' columns; expected ' + expectedCount + '. Avoid pipe characters inside cell values.');
    }
  }
}

function validateRtmOutputContract(rawMarkdown, coverageSummary) {
  const text = String(rawMarkdown || '');
  const prompt = $('Prompt Library').item.json || {};
  const context = prompt.traceabilityContext || {};
  const counts = context.counts || {};
  const lower = text.toLowerCase();

  if (/Main Requirement Traceability Matrix Table/i.test(text)) {
    throw new Error('RTM Contract Failed - Legacy "Main Requirement Traceability Matrix Table" section is not allowed.');
  }
  if (/Model:\\s*gpt-4o-mini/i.test(text) || /Vector Collection:\\s*qa-knowledge-base/i.test(text)) {
    throw new Error('RTM Contract Failed - Hardcoded model/vector metadata found. Use runtime metadata only.');
  }
  if (/\\bRisk ID\\b/i.test(text) || /\\bRSK-[A-Za-z0-9-]+\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Risk IDs are not available in the RTM context and must not be invented.');
  }
  if (/\\bfully\\s+(?:implemented|tested|validated|verified)|\\bimplemented\\s+and\\s+tested\\b|\\btests?\\s+passed\\b|\\bproduction[-\\s]?ready\\b/i.test(text)) {
    throw new Error('RTM Contract Failed - Delivery/execution status claims are not supported by the current RTM evidence.');
  }
  if (/\\|\\s*Number of Test Cases\\s*\\|/i.test(text)) {
    throw new Error('RTM Contract Failed - Coverage by Test Category must not use Number of Test Cases unless numeric counts are available. Use Coverage Scope and Evidence Basis.');
  }
  const hasAutomationColumn = markdownTableGroups(text).some(rows => tableCells(rows[0]).some(cell => /^automation status$/i.test(cell)));
  const hasAutomationPercentage = /approx(?:imate|\\.)?\\s*\\d+%\\s*automation|\\b\\d+%\\s*automation/i.test(text);
  const hasInventedAutomationCell = markdownTableGroups(text).some(rows => rows.slice(2).some(row => tableCells(row).some(cell => /^(automated|partially automated|manual|not automated)$/i.test(cell))));
  if (hasAutomationColumn || hasAutomationPercentage || hasInventedAutomationCell) {
    throw new Error('RTM Contract Failed - Automation columns, percentages, or invented automation statuses are not available in the RTM context.');
  }
  if (/[A-Z][A-Z0-9]+-\\d+\\s*\\.\\.\\s*[A-Z][A-Z0-9]+-\\d+/.test(text)) {
    throw new Error('RTM Contract Failed - Test case range shorthand is not allowed. List actual test case keys.');
  }

  const coverageLedgerHeadingCount = headingCount(text, 'Coverage Ledger');
  if (coverageLedgerHeadingCount !== 1) {
    throw new Error('RTM Contract Failed - Expected exactly one Coverage Ledger heading, found ' + coverageLedgerHeadingCount + '.');
  }
  const layer2HeadingCount = headingCount(text, 'Layer 2 - User Stories to Generated Test Cases');
  if (layer2HeadingCount !== 1) {
    throw new Error('RTM Contract Failed - Expected exactly one Layer 2 heading, found ' + layer2HeadingCount + '.');
  }

  validateNamedTable(text, 'Layer 1 - Requirements to Epics/User Stories', ['Req ID', 'Requirement Description', 'Source Reference', 'Jira Epic Key', 'Jira Story Key', 'Backlog Coverage Status']);
  validateNamedTable(text, 'Layer 2 - User Stories to Generated Test Cases', ['Story Key', 'Story Summary', 'Test Case Keys', 'Unique Test Case Count', 'Test Categories', 'Test Coverage Status']);
  validateNamedTable(text, 'Coverage by Test Category', ['Test Category', 'Coverage Scope', 'Evidence Basis', 'Notes']);
  validateNamedTable(text, 'Coverage Ledger', ['Coverage ID', 'Module / Requirement', 'Source Reference', 'Included In Output', 'Coverage Status', 'Notes']);

  const expectedStoryKeys = [...new Set((context.stories || []).map(story => story.storyKey).filter(Boolean))];
  const missingStories = expectedStoryKeys.filter(key => !text.includes(key));
  if (missingStories.length) {
    throw new Error('RTM Contract Failed - Missing story key(s) from output: ' + missingStories.slice(0, 10).join(', '));
  }

  const expectedTestCaseKeys = [...new Set((context.storyTestCaseLinks || []).map(link => link.testcaseKey).filter(Boolean))];
  const missingTestCases = expectedTestCaseKeys.filter(key => !text.includes(key));
  if (missingTestCases.length) {
    throw new Error('RTM Contract Failed - Missing generated test case key(s) from output: ' + missingTestCases.slice(0, 15).join(', ') + (missingTestCases.length > 15 ? '...' : ''));
  }

  const ledgerCount = Number(coverageSummary.coverageLedgerCount) || 0;
  const declaredPatterns = [
    /Defines\\s+(\\d+)\\s+key requirements/i,
    /Total Requirements Analyzed:\\s*(\\d+)/i,
    /Total Requirements Identified:\\s*(\\d+)/i
  ];
  for (const pattern of declaredPatterns) {
    const match = text.match(pattern);
    if (match && ledgerCount && Number(match[1]) !== ledgerCount) {
      throw new Error('RTM Contract Failed - Requirement count mismatch. Declared ' + match[1] + ' but coverage ledger has ' + ledgerCount + '.');
    }
  }

  if (!lower.includes('layer 1 - requirements to epics/user stories') || !lower.includes('layer 2 - user stories to generated test cases')) {
    throw new Error('RTM Contract Failed - Required Layer 1 and Layer 2 section titles were not found.');
  }

  const misleadingMissingStoryLine = String(text || '').split(/\\r?\\n/).some(line => {
    const trimmed = line.trim();
    if (/^#{1,6}\\s*/.test(trimmed)) return false;
    if (!/stories? without test case/i.test(trimmed)) return false;
    return !/(^|[:\\-\\s])(?:0|none|no)\\b/i.test(trimmed);
  });
  if (Number(counts.storiesWithoutTestCases || 0) === 0 && misleadingMissingStoryLine) {
    throw new Error('RTM Contract Failed - Output suggests missing story test coverage even though context has zero missing stories.');
  }
}
`;

  code = code.replace(
    "if (documentType === 'traceability_matrix') {",
    () => validationBlock + "\nif (documentType === 'traceability_matrix') {\n  validateRtmOutputContract(rawMarkdown, coverageSummary);\n"
  );

  return code;
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_rtm_output_contract_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = parseAny(row.nodes);
    const prompt = requireNode(nodes, 'Prompt Library');
    const qualityGate = requireNode(nodes, 'Quality Gate');
    prompt.parameters.jsCode = patchPromptLibrary(prompt.parameters.jsCode);
    qualityGate.parameters.jsCode = patchQualityGate(qualityGate.parameters.jsCode);

    try {
      new Function(prompt.parameters.jsCode);
    } catch (error) {
      fs.writeFileSync(path.join(process.cwd(), 'tmp_rtm_prompt_debug.js'), prompt.parameters.jsCode);
      throw error;
    }
    try {
      new Function(qualityGate.parameters.jsCode);
    } catch (error) {
      fs.writeFileSync(path.join(process.cwd(), 'tmp_rtm_quality_gate_debug.js'), qualityGate.parameters.jsCode);
      throw error;
    }

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
      patchedNodes: ['Prompt Library', 'Quality Gate']
    }, null, 2));
  } finally {
    db.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
