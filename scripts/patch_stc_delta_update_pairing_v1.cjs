const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const label = 'stc_delta_update_pairing_v1';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, (error) => error ? reject(error) : resolve()));
}

function patchPrepareNode(nodes) {
  const node = nodes.find((item) => item.name === 'Prepare Story Test Case Prompt');
  if (!node) throw new Error('Node not found: Prepare Story Test Case Prompt');
  let code = String(node.parameters?.jsCode || '');
  const original = code;

  code = code.replace(
    "const sourceItems = $('Build Story Source Items').all().map(item => item.json || {});",
    "const sourceItems = $('Build Story Test Case Delta Targets').all().map(item => item.json || {});"
  );

  code = code.replace(
    "  const source = sourceItems[index] || sourceItems[0] || {};\n  const issue = item.json || {};",
    [
      "  const issue = item.json || {};",
      "  const issueKey = String(issue.key || issue.fields?.key || issue.issueKey || '').trim().toUpperCase();",
      "  const sourceByKey = new Map(sourceItems.map(source => [String(source.storyKey || source.jiraStoryKey || source.key || '').trim().toUpperCase(), source]));",
      "  const source = (issueKey && sourceByKey.get(issueKey)) || sourceItems[index] || sourceItems[0] || {};",
      "  const sourceKey = String(source.storyKey || source.jiraStoryKey || source.key || '').trim().toUpperCase();",
      "  if (issueKey && sourceKey && issueKey !== sourceKey) {",
      "    throw new Error('Story Test Cases delta pairing mismatch before model work: fetched Jira issue ' + issueKey + ' was paired with selected story ' + sourceKey + '.');",
      "  }",
    ].join('\n')
  );

  code = code.replace(
    "  return { json: { ...source, storySummary, storyDescriptionText: descriptionText, system, user, planningPass: true } };",
    "  return { json: { ...source, jiraFetchedStoryKey: issueKey || source.storyKey || null, storySummary, storyDescriptionText: descriptionText, system, user, planningPass: true } };"
  );

  if (code === original) throw new Error('Prepare node was not patched; workflow may have drifted.');
  if (code.includes("$('Build Story Source Items').all().map(item => item.json || {})")) {
    throw new Error('Prepare node still reads the full source item list.');
  }
  new Function(code);
  node.parameters.jsCode = code;
}

function patchParserNode(nodes) {
  const node = nodes.find((item) => item.name === 'Robust Story Test Case Parser');
  if (!node) throw new Error('Node not found: Robust Story Test Case Parser');
  let code = String(node.parameters?.jsCode || '');
  const original = code;

  code = code.replace(
    "  const categoryDistribution = coveragePlan.reduce((acc, plan) => { const key = plan.coverageCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});\n  return { json: { ...source, parsed: { storyKey: parsed.storyKey || source.storyKey, storySummary: parsed.storySummary || source.storySummary, coveragePlan }, coveragePlan, plannedTestCaseCount: coveragePlan.length, categoryDistribution, storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length), storyTokensInput: Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)), storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)), storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6)) } };",
    [
      "  const categoryDistribution = coveragePlan.reduce((acc, plan) => { const key = plan.coverageCategory || 'Functional'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});",
      "  const sourceStoryKey = normalizeText(source.storyKey || source.jiraStoryKey || source.key, '');",
      "  const modelStoryKey = normalizeText(parsed.storyKey, '');",
      "  const storyKeyMismatch = Boolean(sourceStoryKey && modelStoryKey && sourceStoryKey.toUpperCase() !== modelStoryKey.toUpperCase());",
      "  return { json: { ...source, parsed: { storyKey: sourceStoryKey || modelStoryKey, storySummary: source.storySummary || parsed.storySummary || sourceStoryKey || modelStoryKey, modelStoryKey: modelStoryKey || null, modelStorySummary: normalizeText(parsed.storySummary, '') || null, storyKeyMismatch, coveragePlan }, coveragePlan, plannedTestCaseCount: coveragePlan.length, categoryDistribution, storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + 's+')).length), storyTokensInput: Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)), storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)), storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || '') + (source.user || '')).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6)) } };",
    ].join('\n')
  );

  if (code === original) throw new Error('Parser node was not patched; workflow may have drifted.');
  new Function(code);
  node.parameters.jsCode = code;
}

function patchNodes(nodes) {
  patchPrepareNode(nodes);
  patchParserNode(nodes);
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
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_${label}_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ workflow_entity: row, workflow_history: historyRow }, null, 2));

    const nodes = JSON.parse(row.nodes || '[]');
    patchNodes(nodes);
    const now = new Date().toISOString();
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [JSON.stringify(nodes), now, workflowId]);

    if (historyRow) {
      const historyNodes = JSON.parse(historyRow.nodes || '[]');
      patchNodes(historyNodes);
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [JSON.stringify(historyNodes), now, workflowId, row.activeVersionId]);
    }

    console.log(JSON.stringify({ ok: true, workflowId, label, backupPath, updatedAt: now }, null, 2));
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
