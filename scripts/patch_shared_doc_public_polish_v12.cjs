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

const looseHtmlListConverter = String.raw`function convertLooseHtmlLists(html) {
  const lines = String(html || '').replace(/<br\s*\/?>/gi, '\n').split(/\n/);
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

const publicSanitizer = looseHtmlListConverter + String.raw`

const sanitizeSourceMetadata = (value) => convertLooseHtmlLists(String(value || '')
  .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\.?/gi, '')
  .replace(/Evidence review required:\s*missing concrete chunkId/gi, 'Evidence review required: supporting source detail needs reviewer confirmation')
  .replace(/missing concrete chunkId/gi, 'supporting evidence needs reviewer confirmation')
  .replace(/(chunkIds?\s*:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '')
  .replace(/(chunkIds?\s*:\s*[A-Za-z0-9_.:-]{12,})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '')
  .replace(/\s*\|\s*(?:table|text|image|metadata)\s*\|\s*/gi, ' - ')
  .replace(/\s*(?:[-–—]\s*)?chunkIds?\s*:\s*[A-Za-z0-9_.:-]{8,}(?:\s*[-–—,;])?/gi, ' ')
  .replace(/\s*\(\s*\)/g, '')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/\s+([,.;:])/g, '$1')
  .trim());`;

const listConverter = `function convertMarkdownLists(source) {
  const lines = String(source || '').split(/\\r?\\n/);
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
    if (lastIndex >= 0 && /^<li>[\\s\\S]*<\\/li>$/.test(output[lastIndex])) {
      output[lastIndex] = output[lastIndex].replace(/<\\/li>$/, ' ' + text.trim() + '</li>');
      return true;
    }
    return false;
  };

  for (const rawLine of lines) {
    const line = String(rawLine || '');
    const trimmed = line.trim();
    const unordered = line.match(/^\\s*[-*]\\s+(.+)$/);
    const ordered = line.match(/^\\s*\\d+[.)]\\s+(.+)$/);

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

    if (listType && trimmed && !/^<\\/?(?:h[1-6]|table|tbody|tr|td|th|ul|ol|li)\\b/i.test(trimmed) && !/^#{1,6}\\s+/.test(trimmed)) {
      if (appendToPreviousItem(trimmed)) continue;
    }

    closeList();
    output.push(line);
  }

  closeList();
  return output.join('\\n');
}`;

function patchConverterNode(node) {
  let code = String(node.parameters.jsCode || '');
  let patches = 0;

  const sanitizerStart = code.includes('function convertLooseHtmlLists(html)')
    ? code.indexOf('function convertLooseHtmlLists(html)')
    : code.indexOf('const sanitizeSourceMetadata = (value) =>');
  const sanitizerEndMarker = '\n\nfunction splitMarkdownRow';
  const sanitizerEnd = sanitizerStart >= 0 ? code.indexOf(sanitizerEndMarker, sanitizerStart) : -1;
  if (sanitizerStart >= 0 && sanitizerEnd > sanitizerStart) {
    code = code.slice(0, sanitizerStart) + publicSanitizer + code.slice(sanitizerEnd);
    patches += 1;
  }

  if (!code.includes('function convertMarkdownLists(source)')) {
    code = code.replace('\nfunction markdownToHtml(source) {', '\n' + listConverter + '\n\nfunction markdownToHtml(source) {');
    patches += 1;
  }

  if (code.includes('html = convertMarkdownTables(html);\n  html = html')) {
    code = code.replace('html = convertMarkdownTables(html);\n  html = html', 'html = convertMarkdownTables(html);\n  html = convertMarkdownLists(html);\n  html = html');
    patches += 1;
  }

  if (code.includes("html = markdownToHtml(md);")) {
    code = code.replace("html = markdownToHtml(md);", "html = sanitizeSourceMetadata(markdownToHtml(md));");
    patches += 1;
  }

  code = code.replace(/shared-final-validation-v12/g, 'shared-final-validation-v13');
  code = code.replace(/shared-final-validation-v11/g, 'shared-final-validation-v13');
  code = code.replace(/shared-final-validation-v10/g, 'shared-final-validation-v13');
  code = code.replace(/shared-final-validation-v9/g, 'shared-final-validation-v13');

  node.parameters.jsCode = code;
  return patches;
}

function patchUpdateNode(node) {
  let value = String(node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value')?.value || '');
  let patches = 0;
  const target = node.parameters.bodyParameters?.parameters?.find((param) => param.name === 'body.storage.value');
  if (!target) return 0;

  const sanitizerStart = value.indexOf('const sanitizeUserFacingHtml = (html) =>');
  const sanitizerEndMarker = '\n\n  const canonicalSections =';
  const sanitizerEnd = sanitizerStart >= 0 ? value.indexOf(sanitizerEndMarker, sanitizerStart) : -1;
  const after = looseHtmlListConverter + String.raw`

  const sanitizeUserFacingHtml = (html) => convertLooseHtmlLists(String(html || '')
    .replace(/Existing Confluence content below was preserved unless explicitly updated in the delta summary\.?/gi, '')
    .replace(/Evidence review required:\s*missing concrete chunkId/gi, 'Evidence review required: supporting source detail needs reviewer confirmation')
    .replace(/missing concrete chunkId/gi, 'supporting evidence needs reviewer confirmation')
    .replace(/(chunkIds?\s*:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '')
    .replace(/(chunkIds?\s*:\s*[A-Za-z0-9_.:-]{12,})(?:\s*\|\s*\d+\s*){1,4}\|\s*(?:table|text|image|metadata)\s*\|?/gi, '')
    .replace(/\s*\|\s*(?:table|text|image|metadata)\s*\|\s*/gi, ' - ')
    .replace(/\s*(?:[-–—]\s*)?chunkIds?\s*:\s*[A-Za-z0-9_.:-]{8,}(?:\s*[-–—,;])?/gi, ' ')
    .replace(/\s*\(\s*\)/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/(<\/table>)\s*\|+\s*(?=<h[1-6]\b|$)/gi, '$1')
    .trim());`;

  if (sanitizerStart >= 0 && sanitizerEnd > sanitizerStart) {
    value = value.slice(0, sanitizerStart) + after + value.slice(sanitizerEnd);
    patches += 1;
  }

  if (value.includes('return finalHtml;')) {
    value = value.replace('return finalHtml;', 'return sanitizeUserFacingHtml(finalHtml);');
    patches += 1;
  }

  value = value.replace(/shared-final-validation-v12/g, 'shared-final-validation-v13');
  value = value.replace(/shared-final-validation-v11/g, 'shared-final-validation-v13');
  value = value.replace(/shared-final-validation-v10/g, 'shared-final-validation-v13');
  value = value.replace(/shared-final-validation-v9/g, 'shared-final-validation-v13');
  target.value = value;
  return patches;
}

function patchNodes(nodes) {
  const converter = nodes.find((node) => node.name === 'Convert MD -> Confluence Formatted HTML');
  const updater = nodes.find((node) => node.name === 'Update existing Document on Confluence');
  if (!converter) throw new Error('Converter node not found');
  if (!updater) throw new Error('Update node not found');
  return {
    converterPatches: patchConverterNode(converter),
    updatePatches: patchUpdateNode(updater),
  };
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_public_polish_v12_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      entity: { ...entity, nodes: parseAny(entity.nodes), connections: parseAny(entity.connections || '{}') },
      history: { ...history, nodes: parseAny(history.nodes), connections: parseAny(history.connections || '{}') },
    }, null, 2));

    const entityNodes = parseAny(entity.nodes);
    const historyNodes = parseAny(history.nodes);
    const entityPatches = patchNodes(entityNodes);
    const historyPatches = patchNodes(historyNodes);

    if (entityPatches.converterPatches < 1 || historyPatches.converterPatches < 1) {
      throw new Error(`Converter patch incomplete: ${JSON.stringify({ entityPatches, historyPatches })}`);
    }
    if (entityPatches.updatePatches < 1 || historyPatches.updatePatches < 1) {
      throw new Error(`Update patch incomplete: ${JSON.stringify({ entityPatches, historyPatches })}`);
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
      patched: 'shared document public HTML now converts markdown lists and strips internal chunk IDs before Confluence publish',
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
