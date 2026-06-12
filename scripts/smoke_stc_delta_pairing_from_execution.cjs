const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');
const { parse: parseFlatted } = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/flatted');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const executionId = process.argv[2] || '1068279';

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function parseData(value) {
  try {
    return parseFlatted(value);
  } catch {
    return JSON.parse(value);
  }
}

function nodeItems(data, nodeName) {
  const runs = data?.resultData?.runData?.[nodeName] || [];
  const run = runs[runs.length - 1] || {};
  return (run.data?.main?.[0] || []).map((item) => item?.json || item || {});
}

function keyOf(value) {
  return String(value?.storyKey || value?.jiraStoryKey || value?.key || value?.issueKey || value?.fields?.key || '').trim().toUpperCase();
}

async function main() {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  try {
    const row = await get(db, 'select data from execution_data where executionId = ?', [executionId]);
    if (!row) throw new Error(`No execution_data found for ${executionId}`);
    const data = parseData(row.data);
    const selected = nodeItems(data, 'Build Story Test Case Delta Targets');
    const fetched = nodeItems(data, 'Fetch Jira Story Issue');
    if (!selected.length) throw new Error('No selected delta target items found.');
    if (!fetched.length) throw new Error('No fetched Jira issue items found.');

    const sourceByKey = new Map(selected.map((source) => [keyOf(source), source]));
    const paired = fetched.map((issue, index) => {
      const issueKey = keyOf(issue);
      const source = (issueKey && sourceByKey.get(issueKey)) || selected[index] || selected[0] || {};
      const sourceKey = keyOf(source);
      if (issueKey && sourceKey && issueKey !== sourceKey) {
        throw new Error(`Pairing mismatch: fetched ${issueKey} paired with selected ${sourceKey}`);
      }
      return sourceKey || issueKey;
    });
    const selectedKeys = selected.map(keyOf);
    const missing = selectedKeys.filter((key) => key && !paired.includes(key));

    console.log(JSON.stringify({
      ok: missing.length === 0 && paired.length === selectedKeys.length,
      executionId,
      selectedCount: selectedKeys.length,
      fetchedCount: fetched.length,
      selectedKeys,
      pairedKeys: paired,
      missing,
    }, null, 2));

    if (missing.length || paired.length !== selectedKeys.length) {
      process.exitCode = 1;
    }
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
