const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const workflowId = 'SG7khcKlhHst48WH';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');
const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

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
  if (!node) throw new Error(`Node not found: ${name}`);
  node.parameters = node.parameters || {};
  return node;
}

function patchFinalizeNode(node) {
  let code = node.parameters.jsCode || '';
  if (code.includes('stc-update-gate-usage-summary-v1')) return false;

  const oldSuffix = `const coverage = buildCoverage(sourceStoryItems, plannedBatches, perStoryMetrics, stories, testCases, mappings);
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const first = uniqueItems[0];
const generationMode = String(first.generationMode || '').trim().toLowerCase() === 'update' ? 'update' : (String(first.generationMode || '').trim().toLowerCase() === 'retry' ? 'retry' : 'create');
return [{ json: { documentType: 'story_test_cases', jobId: first.jobId, projectId: first.projectId, projectName: first.projectName, generationMode, updateContext: first.updateContext || null, updateOfJobId: first.updateContext?.previousJobId || null, retryOfJobId: first.retryOfJobId || null, sourceUserStoryJobId: first.storySourceJobId || null, stories, testCases, mappings, categoryDistribution, coverageSummary: coverage.coverageSummary, batchSummary: coverage.batchSummary, coverageLedger: coverage.coverageLedger, qualityGate: coverage.qualityGate, jira: { projectKey: first.jiraProjectKey, created: testCases.filter(item => item.action === 'created').length, updated: testCases.filter(item => item.action === 'updated').length, reused: testCases.filter(item => item.action === 'reused').length }, wordCount, tokensInput, tokensOutput, tokensTotal: tokensInput + tokensOutput, estimatedCostUsd } }];`;

  const newSuffix = `const coverage = buildCoverage(sourceStoryItems, plannedBatches, perStoryMetrics, stories, testCases, mappings);
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const tokensTotal = tokensInput + tokensOutput;
const first = uniqueItems[0];
const generationMode = String(first.generationMode || '').trim().toLowerCase() === 'update' ? 'update' : (String(first.generationMode || '').trim().toLowerCase() === 'retry' ? 'retry' : 'create');
const updateContext = first.updateContext && typeof first.updateContext === 'object' ? first.updateContext : null;
const coverageRows = Array.isArray(coverage.coverageLedger) ? coverage.coverageLedger : [];
const missingRows = coverageRows.filter(row => String(row.coverageStatus || row.status || '').toLowerCase() === 'missing');
const partialRows = coverageRows.filter(row => String(row.coverageStatus || row.status || '').toLowerCase() === 'partial');
const gateStatus = String(coverage.coverageSummary?.gateStatus || coverage.coverageSummary?.status || coverage.qualityGate?.gateStatus || '').toLowerCase();
const terminalStatus = gateStatus === 'failed' ? 'failed' : 'completed';
const repairRows = [...missingRows, ...partialRows];
const repairTargets = repairRows.map(row => ({
  storyKey: row.storyKey,
  storyId: row.storyId || null,
  storySummary: row.storySummary || row.requirement || row.storyKey,
  coverageStatus: row.coverageStatus || row.status,
  plannedTestCases: Number(row.plannedTestCases || 0) || 0,
  generatedTestCases: Number(row.generatedTestCases || 0) || 0,
  missingCategories: Array.isArray(row.missingCategories) ? row.missingCategories : [],
}));
const tokenUsage = {
  source: 'story_testcase_generator',
  input: tokensInput,
  output: tokensOutput,
  total: tokensTotal,
  tokensInput,
  tokensOutput,
  tokensTotal,
  estimatedCostUsd,
  model: first.generationModel || null,
};
const previousTokenUsage = updateContext?.previousTokenUsage || {};
const baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || previousTokenUsage.tokens_total || 0) || 0;
const baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;
const createdTestCases = testCases.filter(item => item.action === 'created');
const updatedTestCases = testCases.filter(item => item.action === 'updated');
const reusedTestCases = testCases.filter(item => item.action === 'reused');
const updateSummary = generationMode === 'update' ? {
  enabled: true,
  version: 'stc-update-gate-usage-summary-v1',
  documentType: 'story_test_cases',
  mode: 'update',
  deltaMode: true,
  updateOfJobId: updateContext?.previousJobId || null,
  sourceStoryCount: stories.length,
  storyScopeCount: coverageRows.length || stories.length,
  coveredStoryCount: Number(coverage.coverageSummary?.coveredCount || coverage.coverageSummary?.covered || 0) || 0,
  partialStoryCount: partialRows.length,
  missingStoryCount: missingRows.length,
  createdTestCaseCount: createdTestCases.length,
  updatedTestCaseCount: updatedTestCases.length,
  reusedTestCaseCount: reusedTestCases.length,
  removedTestCaseCount: 0,
  testCaseCount: testCases.length,
  mappingCount: mappings.length,
  createdTestCases,
  updatedTestCases,
  reusedTestCases,
  preservedTestCases: reusedTestCases,
  removedTestCases: [],
  storyCoverage: coverageRows,
  missingStories: missingRows,
  partialStories: partialRows,
  repairTargets,
  requiresCoverageRepair: repairTargets.length > 0,
  tokenUsage,
  tokensTotal,
  estimatedCostUsd,
  previousTokenUsage,
  tokenSavings: {
    estimatedBaselineTokens: baselineTokens || null,
    estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - tokensTotal) : 0,
    estimatedBaselineCostUsd: baselineCost || null,
    estimatedCostSavedUsd: baselineCost ? Math.max(0, Number((baselineCost - estimatedCostUsd).toFixed(6))) : 0,
    estimatedSavingsPercent: baselineTokens ? Math.max(0, Math.round(((baselineTokens - tokensTotal) / baselineTokens) * 100)) : null,
  },
  gateStatus,
  terminalStatus,
  message: repairTargets.length
    ? 'Story Test Cases update published available Jira test cases, but some in-scope stories still need targeted repair.'
    : 'Story Test Cases update completed with story-level coverage satisfied.'
} : null;
if (updateSummary) coverage.qualityGate.updateSummary = updateSummary;
const error = terminalStatus === 'failed'
  ? 'Story Test Cases update did not satisfy required story coverage. Retry will target missing or partial stories only.'
  : null;
return [{ json: {
  documentType: 'story_test_cases',
  jobId: first.jobId,
  projectId: first.projectId,
  projectName: first.projectName,
  generationMode,
  updateContext,
  updateOfJobId: updateContext?.previousJobId || null,
  retryOfJobId: first.retryOfJobId || null,
  sourceUserStoryJobId: first.storySourceJobId || null,
  stories,
  testCases,
  mappings,
  categoryDistribution,
  coverageSummary: coverage.coverageSummary,
  batchSummary: coverage.batchSummary,
  coverageLedger: coverage.coverageLedger,
  qualityGate: coverage.qualityGate,
  updateSummary,
  tokenUsage,
  tokenSavings: updateSummary?.tokenSavings || null,
  jira: { projectKey: first.jiraProjectKey, created: createdTestCases.length, updated: updatedTestCases.length, reused: reusedTestCases.length },
  wordCount,
  tokensInput,
  tokensOutput,
  tokensTotal,
  estimatedCostUsd,
  terminalStatus,
  error,
  requiresCoverageRepair: repairTargets.length > 0,
  repairTargets,
  patchVersion: 'stc-update-gate-usage-summary-v1'
} }];`;

  if (!code.includes(oldSuffix)) throw new Error('Finalize suffix not found');
  node.parameters.jsCode = code.replace(oldSuffix, newSuffix);
  return true;
}

function patchBuildOutputNode(node) {
  const oldCode = node.parameters.jsCode || '';
  if (oldCode.includes('tokenUsage: result.tokenUsage')) return false;
  node.parameters.jsCode = `const result = $json || {};
const tokenUsage = result.tokenUsage || {
  source: 'story_testcase_generator',
  input: Number(result.tokensInput || 0),
  output: Number(result.tokensOutput || 0),
  total: Number(result.tokensTotal || 0),
  tokensInput: Number(result.tokensInput || 0),
  tokensOutput: Number(result.tokensOutput || 0),
  tokensTotal: Number(result.tokensTotal || 0),
  estimatedCostUsd: Number(result.estimatedCostUsd || 0),
};
const output = {
  documentType: 'story_test_cases',
  destination: { type: 'jira_test_cases', projectId: result.projectId || null },
  generationMode: result.generationMode || null,
  updateContext: result.updateContext || null,
  updateOfJobId: result.updateOfJobId || result.updateContext?.previousJobId || null,
  retryOfJobId: result.retryOfJobId || null,
  sourceUserStoryJobId: result.sourceUserStoryJobId || null,
  stories: Array.isArray(result.stories) ? result.stories : [],
  testCases: Array.isArray(result.testCases) ? result.testCases : [],
  mappings: Array.isArray(result.mappings) ? result.mappings : [],
  categoryDistribution: result.categoryDistribution || {},
  coverageSummary: result.coverageSummary || result.qualityGate?.coverageSummary || null,
  batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,
  coverageLedger: Array.isArray(result.coverageLedger) ? result.coverageLedger : (Array.isArray(result.qualityGate?.coverageLedger) ? result.qualityGate.coverageLedger : []),
  qualityGate: result.qualityGate || null,
  updateSummary: result.updateSummary || result.qualityGate?.updateSummary || null,
  tokenUsage,
  tokenSavings: (result.updateSummary || result.qualityGate?.updateSummary || null)?.tokenSavings || result.tokenSavings || null,
  jira: result.jira || null,
  wordCount: Number(result.wordCount || 0),
  tokensInput: Number(result.tokensInput || tokenUsage.input || 0),
  tokensOutput: Number(result.tokensOutput || tokenUsage.output || 0),
  tokensTotal: Number(result.tokensTotal || tokenUsage.total || 0),
  estimatedCostUsd: Number(result.estimatedCostUsd || tokenUsage.estimatedCostUsd || 0),
  terminalStatus: result.terminalStatus || 'completed',
  error: result.error || null,
  requiresCoverageRepair: Boolean(result.requiresCoverageRepair),
  repairTargets: Array.isArray(result.repairTargets) ? result.repairTargets : [],
  patchVersion: result.patchVersion || 'stc-update-gate-usage-summary-v1',
};

return [{
  json: {
    ...result,
    generatorPersisted: true,
    terminalStatus: output.terminalStatus,
    output,
  },
}];`;
  return true;
}

function patchMetricNode(node) {
  const oldBody = node.parameters.jsonBody || '';
  if (oldBody.includes('terminalStatus === "failed" ? "JOB_FAILED"')) return false;
  node.parameters.jsonBody = '={{ (() => { const result = $("Build Direct Story Test Case Completion Output").item.json; const output = result.output || {}; const terminalStatus = output.terminalStatus || result.terminalStatus || "completed"; const event = terminalStatus === "failed" ? "JOB_FAILED" : "JOB_COMPLETED"; const durationMs = Math.max(0, Date.now() - new Date(result.startedAt || result.createdAt || Date.now()).getTime()); return JSON.stringify({ job_id: result.jobId, project_name: result.projectName, document_type: result.documentType, pipeline: "generation", event, status: terminalStatus === "failed" ? "failed" : "info", project_id: result.projectId, requested_by: result.requestedBy, duration_ms: durationMs, word_count: output.wordCount || 0, tokens_input: output.tokenUsage?.input || output.tokensInput || 0, tokens_output: output.tokenUsage?.output || output.tokensOutput || 0, tokens_total: output.tokenUsage?.total || output.tokensTotal || 0, estimated_cost_usd: output.tokenUsage?.estimatedCostUsd || output.estimatedCostUsd || 0, metadata: { generator_mode: "professional_story_test_cases", generation_mode: output.generationMode || result.generationMode || "create", update_of_job_id: output.updateOfJobId || null, retry_of_job_id: output.retryOfJobId || null, source_user_story_job_id: output.sourceUserStoryJobId, story_count: (output.stories || []).length, testcase_count: (output.testCases || []).length, testcase_created_count: output.jira?.created || 0, testcase_updated_count: output.jira?.updated || 0, testcase_reused_count: output.jira?.reused || 0, mapping_count: (output.mappings || []).length, coverage_status: output.coverageSummary?.gateStatus || output.coverageSummary?.status || null, missing_story_count: output.coverageSummary?.missingCount || output.coverageSummary?.missing || 0, partial_story_count: output.coverageSummary?.partialCount || output.coverageSummary?.partial || 0, requires_coverage_repair: Boolean(output.requiresCoverageRepair), repair_targets: output.repairTargets || [], settings_version: result.settingsVersion, persisted_by: "story_testcase_generator", metric_key: [result.jobId, event, terminalStatus].filter(Boolean).join(":") } }); })() }}';
  return true;
}

function patchMarkNode(node) {
  const oldBody = node.parameters.jsonBody || '';
  if (oldBody.includes('terminalStatus === "failed"')) return false;
  node.parameters.jsonBody = '={{ (() => { const result = $("Build Direct Story Test Case Completion Output").item.json; const output = result.output || {}; const terminalStatus = output.terminalStatus || result.terminalStatus || "completed"; return JSON.stringify({ status: terminalStatus === "failed" ? "failed" : "completed", output, error: terminalStatus === "failed" ? (output.error || "Story Test Cases update coverage gate failed; retry will target missing or partial stories.") : null, updated_at: $now.toISO() }); })() }}';
  return true;
}

(async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    const row = await get(db, 'select id, name, nodes, connections, settings, staticData, pinData, versionId, activeVersionId from workflow_entity where id = ?', [workflowId]);
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_stc_update_gate_usage_summary_v1_${stamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({
      id: row.id,
      name: row.name,
      nodes: JSON.parse(row.nodes),
      connections: JSON.parse(row.connections),
      settings: JSON.parse(row.settings || '{}'),
      staticData: JSON.parse(row.staticData || '{}'),
      pinData: JSON.parse(row.pinData || '{}'),
      versionId: row.versionId,
      activeVersionId: row.activeVersionId,
    }, null, 2));

    const nodes = JSON.parse(row.nodes);
    const changed = [
      patchFinalizeNode(requireNode(nodes, 'Finalize Story Test Case Result')),
      patchBuildOutputNode(requireNode(nodes, 'Build Direct Story Test Case Completion Output')),
      patchMetricNode(requireNode(nodes, 'LOG: Direct Story Test Case Job Completed')),
      patchMarkNode(requireNode(nodes, 'Mark Direct Story Test Case Job Completed')),
    ].some(Boolean);

    if (!changed) {
      console.log('STC workflow already patched');
      return;
    }

    const nodesJson = JSON.stringify(nodes);
    const now = new Date().toISOString().replace('T', ' ').replace('Z', '');
    await run(db, 'update workflow_entity set nodes = ?, updatedAt = ? where id = ?', [nodesJson, now, workflowId]);
    if (row.activeVersionId) {
      await run(db, 'update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?', [nodesJson, now, workflowId, row.activeVersionId]);
    }
    console.log(`Patched STC workflow; backup: ${backupPath}`);
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
