const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function backup(row) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(
    path.join(backupDir, `workflow_${row.id}_before_stc_coverage_rollup_planned_count_v1_${timestamp}.json`),
    JSON.stringify(row, null, 2)
  );
}

function patchFinalizeCode(code) {
  let next = code;

  const uniqueTextNeedle =
    "function uniqueText(values) { return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean))); }";
  const uniqueTextReplacement =
    "function uniqueText(values) { return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean))); }\n" +
    "function uniqueCategoryList(values) {\n" +
    "  const seen = new Set();\n" +
    "  return values\n" +
    "    .flatMap(value => String(value || '').split(/\\s*\\|\\s*/))\n" +
    "    .map(value => value.trim())\n" +
    "    .filter(value => {\n" +
    "      const key = value.toLowerCase();\n" +
    "      if (!key || seen.has(key)) return false;\n" +
    "      seen.add(key);\n" +
    "      return true;\n" +
    "    });\n" +
    "}";

  if (!next.includes('function uniqueCategoryList(values)')) {
    if (!next.includes(uniqueTextNeedle)) throw new Error('Could not find uniqueText helper in Finalize Story Test Case Result.');
    next = next.replace(uniqueTextNeedle, uniqueTextReplacement);
  }

  const metricPlannedNeedle =
    "if (current && Number(story.testCaseCount || 0) > current.planned) current.planned = Number(story.testCaseCount || 0);";
  const metricPlannedReplacement =
    "if (current && !plannedBatches.length && Number(story.testCaseCount || 0) > current.planned) current.planned = Number(story.testCaseCount || 0);";
  if (next.includes(metricPlannedNeedle)) {
    next = next.replace(metricPlannedNeedle, metricPlannedReplacement);
  } else if (!next.includes('!plannedBatches.length && Number(story.testCaseCount || 0) > current.planned')) {
    throw new Error('Could not find metric planned-count assignment in Finalize Story Test Case Result.');
  }

  next = next.replace(
    "const generatedCategories = uniqueText(story.testCases.map(item => item.coverageCategory || item.testCategory));",
    "const generatedCategories = uniqueCategoryList(story.testCases.map(item => item.coverageCategory || item.testCategory));"
  );
  next = next.replace(
    "const plannedCategories = uniqueText(Array.from(story.plannedCategories));",
    "const plannedCategories = uniqueCategoryList(Array.from(story.plannedCategories));"
  );

  return next;
}

function saveWorkflow(db, id, nodes, connections, callback) {
  db.run(
    "update workflow_entity set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
    [JSON.stringify(nodes), JSON.stringify(connections), id],
    (err) => {
      if (err) throw err;
      db.get('select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1', [id], (historyErr, historyRow) => {
        if (historyErr) throw historyErr;
        if (!historyRow) return callback();
        db.run(
          "update workflow_history set nodes = ?, connections = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
          [JSON.stringify(nodes), JSON.stringify(connections), id, historyRow.versionId],
          (updateHistoryErr) => {
            if (updateHistoryErr) throw updateHistoryErr;
            callback();
          }
        );
      });
    }
  );
}

const db = new sqlite3.Database(dbPath);
db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
  if (err) throw err;
  if (!row) throw new Error(`Workflow not found: ${workflowId}`);
  const nodes = JSON.parse(row.nodes);
  const connections = JSON.parse(row.connections);
  const finalize = nodes.find((node) => node.name === 'Finalize Story Test Case Result');
  if (!finalize) throw new Error('Missing node: Finalize Story Test Case Result');
  const before = finalize.parameters.jsCode;
  const after = patchFinalizeCode(before);
  if (after === before) {
    console.log(JSON.stringify({ patched: false, workflowId, reason: 'already up to date' }, null, 2));
    db.close();
    return;
  }
  backup(row);
  finalize.parameters.jsCode = after;
  saveWorkflow(db, workflowId, nodes, connections, () => {
    console.log(JSON.stringify({ patched: true, workflowId, node: finalize.name, timestamp }, null, 2));
    db.close();
  });
});
