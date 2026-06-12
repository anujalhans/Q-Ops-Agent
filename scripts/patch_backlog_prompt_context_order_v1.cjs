const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'Vwc6c8ehsRTF8svG';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

function nowStamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

const earlyBlock = `const retrievalEvidenceText = (typeof promptRetrievalContext !== 'undefined' ? promptRetrievalContext : retrievalContext).map(formatChunk).join('\\\\n\\\\n');
const groupedEvidenceText = Object.entries(typeof promptGroupedEvidence !== 'undefined' ? promptGroupedEvidence : groupedEvidence)
  .filter(([_, chunks]) => Array.isArray(chunks) && chunks.length)
  .map(([group, chunks]) => {
    const body = chunks.map((chunk, index) => {
      return '- ' + [
        chunk.docType || 'UNKNOWN',
        chunk.source || 'Unknown source',
        chunk.section || 'No section',
        'score=' + (chunk.profileScore ?? 'n/a'),
        String(chunk.excerpt || '').slice(0, updateMode ? 450 : 500)
      ].join(' | ');
    }).join('\\\\n');
    return group.toUpperCase() + ' EVIDENCE\\\\n' + body;
  })
  .join('\\\\n\\\\n');

`;

const fixedBlock = `
const retrievalEvidenceText = promptRetrievalContext.map(formatChunk).join('\\\\n\\\\n');
const groupedEvidenceText = Object.entries(promptGroupedEvidence)
  .filter(([_, chunks]) => Array.isArray(chunks) && chunks.length)
  .map(([group, chunks]) => {
    const body = chunks.map((chunk, index) => {
      return '- ' + [
        chunk.docType || 'UNKNOWN',
        chunk.source || 'Unknown source',
        chunk.section || 'No section',
        'score=' + (chunk.profileScore ?? 'n/a'),
        String(chunk.excerpt || '').slice(0, updateMode ? 450 : 500)
      ].join(' | ');
    }).join('\\\\n');
    return group.toUpperCase() + ' EVIDENCE\\\\n' + body;
  })
  .join('\\\\n\\\\n');
`;

function patchCode(code) {
  let patched = code;
  const earlyStart = patched.indexOf('const retrievalEvidenceText =');
  const earlyEnd = patched.indexOf('const profileSummary =');
  if (earlyStart !== -1 && earlyEnd !== -1 && earlyStart < earlyEnd) {
    patched = patched.slice(0, earlyStart) + patched.slice(earlyEnd);
  }
  if (!patched.includes('const promptGroupedEvidence = Object.fromEntries')) {
    throw new Error('promptGroupedEvidence declaration not found');
  }
  if (!patched.includes(fixedBlock.trim())) {
    const insertAfter = 'const updateContextSummary =';
    const insertIndex = patched.indexOf(insertAfter);
    if (insertIndex === -1) throw new Error('updateContextSummary marker not found');
    patched = patched.slice(0, insertIndex) + fixedBlock + patched.slice(insertIndex);
  }
  const evidenceIndex = patched.indexOf('const retrievalEvidenceText =');
  const declarationIndex = patched.indexOf('const promptRetrievalContext =');
  if (evidenceIndex < declarationIndex) {
    throw new Error('Patch failed: retrievalEvidenceText still appears before promptRetrievalContext');
  }
  return patched;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const row = await get(db, 'select id, name, nodes, connections, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const historyRow = row.activeVersionId
      ? await get(db, 'select versionId, nodes, connections from workflow_history where versionId = ?', [row.activeVersionId])
      : null;
    const stamp = nowStamp();
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_backlog_prompt_context_order_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const promptNode = nodes.find((node) => node.name === 'Professional Prompt Library');
    if (!promptNode?.parameters?.jsCode) throw new Error('Professional Prompt Library node not found');
    promptNode.parameters.jsCode = patchCode(promptNode.parameters.jsCode);

    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), now, workflowId]);

    if (historyRow) {
      const historyNodes = JSON.parse(historyRow.nodes);
      const historyPromptNode = historyNodes.find((node) => node.name === 'Professional Prompt Library');
      if (historyPromptNode?.parameters?.jsCode) {
        historyPromptNode.parameters.jsCode = patchCode(historyPromptNode.parameters.jsCode);
        await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where versionId = ?', [JSON.stringify(historyNodes), now, historyRow.versionId]);
      }
    }

    console.log(JSON.stringify({
      patched: true,
      workflowId,
      node: 'Professional Prompt Library',
      backupPath,
      updatedAt: now,
    }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();
