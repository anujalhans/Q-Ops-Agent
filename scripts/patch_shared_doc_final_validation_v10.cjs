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
  const node = nodes.find((item) => item.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  return node;
}

function setAssignment(node, name, value, type = 'object') {
  const assignments = node.parameters.assignments?.assignments;
  if (!Array.isArray(assignments)) throw new Error(`No assignments on ${node.name}`);
  const assignment = assignments.find((item) => item.name === name);
  if (!assignment) {
    assignments.push({ id: `shared-v10-${name}`, name, value, type });
    return;
  }
  assignment.value = value;
  assignment.type = type;
}

function patchRestoreQualityGateOutput(nodes) {
  const node = requireNode(nodes, 'Restore Quality Gate Output');
  setAssignment(
    node,
    'finalValidation',
    "={{ { version: 'shared-final-validation-v10', status: 'pending_publish', structuralStatus: 'pending', reason: 'Final HTML validation runs after markdown-to-html conversion.' } }}",
  );
  setAssignment(node, 'diagnostics', "={{ { validatorVersion: 'shared-final-validation-v10', stage: 'quality_gate_restored' } }}");
}

function patchCompletionBody(jsonBody) {
  let body = String(jsonBody || '');
  body = body.replace(/shared-final-validation-v9/g, 'shared-final-validation-v10');
  body = body.replace(
    /\$\(\'Restore Quality Gate Output\'\)\.item\.json\.finalValidation/g,
    "($items('Convert MD -> Confluence Formatted HTML', 0, 0)[0]?.json?.finalValidation || $('Restore Quality Gate Output').item.json.finalValidation)",
  );
  body = body.replace(
    /\$\(\'Restore Quality Gate Output\'\)\.item\.json\.diagnostics/g,
    "($items('Convert MD -> Confluence Formatted HTML', 0, 0)[0]?.json?.diagnostics || $('Restore Quality Gate Output').item.json.diagnostics)",
  );
  return body;
}

function patchWorkflow(nodes) {
  patchRestoreQualityGateOutput(nodes);
  for (const name of [
    'Update Job Status as Completed',
    'Mark Job Status as Completed',
    'LOG: Confluence Job Completed',
    'LOG: Update Confluence Job Completed',
    'Update Job Status as Failed',
    'LOG: Confluence Job Failed',
  ]) {
    const node = requireNode(nodes, name);
    node.parameters.jsonBody = patchCompletionBody(node.parameters.jsonBody);
  }
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'SELECT id, name, nodes FROM workflow_entity WHERE id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    const nodes = parseAny(row.nodes);

    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_shared_doc_final_validation_v10_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ ...row, nodes }, null, 2));

    patchWorkflow(nodes);

    const serialized = JSON.stringify(nodes);
    if (!serialized.includes('shared-final-validation-v10')) throw new Error('V10 marker missing after patch');
    if (serialized.includes("$('Convert MD -> Confluence Formatted HTML').item.json.finalValidation")) {
      throw new Error('Paired future-node finalValidation reference still present');
    }

    await run(db, 'UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?', [
      JSON.stringify(nodes),
      new Date().toISOString(),
      workflowId,
    ]);

    console.log(JSON.stringify({
      workflowId,
      workflowName: row.name,
      backupPath,
      patched: [
        'Restore Quality Gate Output no longer references future converter node',
        'completion/failure bodies read converter validation through unpaired item access',
        'V10 marker applied',
      ],
    }, null, 2));
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
