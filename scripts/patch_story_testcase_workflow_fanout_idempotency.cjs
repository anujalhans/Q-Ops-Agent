const fs = require('fs');
const path = require('path');
const sqlite3 = require('C:/Users/anujalhans01/AppData/Roaming/npm/node_modules/n8n/node_modules/sqlite3');

const workflowId = 'SG7khcKlhHst48WH';
const dbPath = 'C:/Users/anujalhans01/.n8n/database.sqlite';
const backupDir = path.join(process.cwd(), 'docs', 'test_data', 'n8n_workflow_backups');

const expandCode = String.raw`const sources = $input.all().map((item) => item.json || {});
const normalizeArray = value => Array.isArray(value) ? value.map(v => String(v || '').trim()).filter(Boolean) : (String(value || '').trim() ? [String(value).trim()] : []);
const slugify = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
const unique = values => Array.from(new Set(values.filter(Boolean)));
function adfParagraph(text, strongLabel) { const content = []; if (strongLabel) content.push({ type: 'text', text: strongLabel + ': ', marks: [{ type: 'strong' }] }); if (text) content.push({ type: 'text', text: String(text).slice(0, 12000) }); return { type: 'paragraph', content }; }
function adfHeading(text, level = 3) { return { type: 'heading', attrs: { level }, content: [{ type: 'text', text: String(text).slice(0, 250) }] }; }
function adfBulletList(items) { const normalized = normalizeArray(items); if (!normalized.length) return null; return { type: 'bulletList', content: normalized.map(item => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: item.slice(0, 800) }] }] })) }; }

return sources.flatMap((source) => {
  const parsed = source.parsed || {};
  const storySummary = parsed.storySummary || source.storySummary || source.storyKey;
  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];

  return testCases.map((testCase, index) => {
    const generatedTestCaseId = String(testCase.testCaseId || ('TC-' + String(index + 1).padStart(3, '0'))).trim();
    const slotId = 'tc-' + String(index + 1).padStart(3, '0');
    const summary = String(testCase.summary || ('Test ' + generatedTestCaseId + ' for ' + storySummary)).trim();
    const storyIdentity = source.storyCorrelationId || source.storyKey;
    const canonicalStableLabel = [source.idempotencyLabelPrefix || 'qops', 'tc', slugify(storyIdentity), slotId].filter(Boolean).join('-').slice(0, 120);
    const legacyStableLabel = [source.idempotencyLabelPrefix || 'qops', 'tc', slugify(storyIdentity), slugify(generatedTestCaseId), slugify(summary)].filter(Boolean).join('-').slice(0, 120);
    const stableLabel = canonicalStableLabel;
    const allStableLabels = unique([stableLabel, legacyStableLabel]);
    const preconditions = normalizeArray(testCase.preconditions);
    const testSteps = normalizeArray(testCase.testSteps);
    const testData = normalizeArray(testCase.testData);
    const acceptanceCriteriaCovered = normalizeArray(testCase.acceptanceCriteriaCovered);
    const notes = normalizeArray(testCase.notes);
    const requirementReference = String(testCase.requirementReference || (source.storyKey + ' story details')).trim();
    const testLevel = String(testCase.testLevel || 'UI').trim();
    const testCategory = String(testCase.testCategory || 'Functional').trim();
    const riskLevel = String(testCase.riskLevel || 'Medium').trim();
    const automationFeasibility = String(testCase.automationFeasibility || 'Medium').trim();
    const jiraDescription = { type: 'doc', version: 1, content: [adfHeading('Source Story', 3), adfParagraph(source.storyKey + ' - ' + storySummary), adfParagraph(testCase.objective || '', 'Objective'), adfParagraph(requirementReference, 'Requirement Reference'), adfParagraph(testLevel, 'Test Level'), adfParagraph(testCategory, 'Test Category'), adfParagraph(riskLevel, 'Risk Level'), adfParagraph(automationFeasibility, 'Automation Feasibility'), preconditions.length ? adfHeading('Preconditions', 3) : null, preconditions.length ? adfBulletList(preconditions) : null, testSteps.length ? adfHeading('Test Steps', 3) : null, testSteps.length ? adfBulletList(testSteps.map((step, stepIndex) => (stepIndex + 1) + '. ' + step)) : null, testData.length ? adfHeading('Test Data', 3) : null, testData.length ? adfBulletList(testData) : null, adfHeading('Expected Result', 3), adfParagraph(testCase.expectedResult || 'Expected result not provided by generator.'), acceptanceCriteriaCovered.length ? adfHeading('Acceptance Criteria Covered', 3) : null, acceptanceCriteriaCovered.length ? adfBulletList(acceptanceCriteriaCovered) : null, notes.length ? adfHeading('Notes', 3) : null, notes.length ? adfBulletList(notes) : null, adfHeading('Traceability', 3), adfParagraph(source.storyKey + ' | ' + (source.storyCorrelationId || 'N/A') + ' | Source Job ' + (source.storySourceJobId || 'N/A'))].filter(Boolean) };
    const labels = unique([stableLabel, legacyStableLabel, 'qops-story-test-cases', ('story-' + slugify(source.storyKey)).slice(0, 80)]);

    return { json: { ...source, testCaseIndex: index + 1, generatedTestCaseId, testCaseId: generatedTestCaseId, testCaseSummary: summary, priority: String(testCase.priority || 'Medium'), testType: String(testCase.testType || 'functional'), requirementReference, testLevel, testCategory, riskLevel, automationFeasibility, objective: String(testCase.objective || '').trim(), preconditions, testSteps, testData, expectedResult: String(testCase.expectedResult || '').trim(), acceptanceCriteriaCovered, notes, stableLabel, canonicalStableLabel, legacyStableLabel, allStableLabels, jiraDescription, createIssueBody: { fields: { project: { key: source.jiraProjectKey }, issuetype: { name: source.testCaseIssueTypeName || 'Test Case' }, summary, description: jiraDescription, labels } }, linkIssueBody: { type: { name: 'Relates' }, inwardIssue: { key: source.storyKey }, outwardIssue: { key: '__REPLACE_TEST_CASE_KEY__' }, comment: { body: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Linked by Q-Ops Story Test Cases generation.' }] }] } } } } };
  });
});`;

const searchJqlExpression = String.raw`={{ (() => {
  const escapeJqlString = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const labels = Array.from(new Set([$json.stableLabel, $json.legacyStableLabel].filter(Boolean)));
  const labelClause = labels.length === 1
    ? 'labels = "' + escapeJqlString(labels[0]) + '"'
    : 'labels in (' + labels.map(label => '"' + escapeJqlString(label) + '"').join(',') + ')';
  return 'project = ' + $json.jiraProjectKey + ' AND issuetype = "' + ($json.testCaseIssueTypeName || 'Test Case') + '" AND ' + labelClause + ' ORDER BY created DESC';
})() }}`;

const finalizeCode = String.raw`function safeAll(nodeName) { try { return $(nodeName).all().map((item) => item.json || {}); } catch (error) { if (String(error?.message || error).includes("hasn't been executed")) return []; throw error; } }
const createdItems = safeAll('Normalize Created Story Test Case');
const reusedItems = safeAll('Normalize Existing Story Test Case');
const allItems = [...createdItems, ...reusedItems];
const expandedItems = safeAll('Expand Story Test Case Items');
if (expandedItems.length && allItems.length < expandedItems.length) return [];
if (!allItems.length) throw new Error('Story Test Case generator did not produce any reusable or created Jira Test Cases.');

const uniqueItems = [];
const seen = new Set();
for (const item of allItems) {
  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join('|');
  if (!key || seen.has(key)) continue;
  seen.add(key);
  uniqueItems.push(item);
}

const perStoryMetrics = $('Robust Story Test Case Parser').all().map(item => item.json || {});
const storyMap = new Map();
uniqueItems.forEach((item) => { if (!storyMap.has(item.storyKey)) storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: item.storyId, summary: item.storySummary, storyCorrelationId: item.storyCorrelationId, storyLink: item.storyLink }); });
const stories = Array.from(storyMap.values());
const testCases = uniqueItems.map((item) => ({ action: item.action, testcaseKey: item.testcaseKey, testcaseId: item.testcaseId, testcaseSummary: item.testCaseSummary, testcaseLink: item.testcaseLink, storyKey: item.storyKey, storySummary: item.storySummary, stableLabel: item.stableLabel, legacyStableLabel: item.legacyStableLabel || null, priority: item.priority, riskLevel: item.riskLevel, testType: item.testType, testLevel: item.testLevel, testCategory: item.testCategory, automationFeasibility: item.automationFeasibility, requirementReference: item.requirementReference }));
const mappings = uniqueItems.map((item) => ({ storyKey: item.storyKey, storySummary: item.storySummary, testcaseKey: item.testcaseKey, testcaseSummary: item.testCaseSummary, action: item.action }));
const wordCount = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyWordCount || 0), 0);
const tokensInput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensInput || 0), 0);
const tokensOutput = perStoryMetrics.reduce((sum, item) => sum + Number(item.storyTokensOutput || 0), 0);
const estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) => sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));
const first = uniqueItems[0];
return [{ json: { documentType: 'story_test_cases', jobId: first.jobId, projectId: first.projectId, projectName: first.projectName, sourceUserStoryJobId: first.storySourceJobId || null, stories, testCases, mappings, jira: { projectKey: first.jiraProjectKey, created: testCases.filter(item => item.action === 'created').length, reused: testCases.filter(item => item.action === 'reused').length }, wordCount, tokensInput, tokensOutput, tokensTotal: tokensInput + tokensOutput, estimatedCostUsd } }];`;

function patchNodes(nodes) {
  const required = [
    'Expand Story Test Case Items',
    'Search Existing Test Case By Stable Label',
    'Finalize Story Test Case Result',
    'Upsert Story Test Case Mapping',
  ];
  for (const name of required) {
    if (!nodes.find((node) => node.name === name)) throw new Error(`Missing node: ${name}`);
  }

  nodes.find((node) => node.name === 'Expand Story Test Case Items').parameters.jsCode = expandCode;

  const searchNode = nodes.find((node) => node.name === 'Search Existing Test Case By Stable Label');
  const jqlParam = searchNode.parameters.queryParameters.parameters.find((param) => param.name === 'jql');
  if (!jqlParam) throw new Error('Missing JQL query parameter on search node');
  jqlParam.value = searchJqlExpression;

  nodes.find((node) => node.name === 'Finalize Story Test Case Result').parameters.jsCode = finalizeCode;

  const upsertNode = nodes.find((node) => node.name === 'Upsert Story Test Case Mapping');
  upsertNode.parameters.jsonBody = String.raw`={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: "Relates", status: $json.action === "created" ? "linked" : "reused", metadata: { action: $json.action, canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}`;

  return nodes;
}

fs.mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('select * from workflow_entity where id = ?', [workflowId], (err, row) => {
    if (err) throw err;
    if (!row) throw new Error(`Workflow not found: ${workflowId}`);

    const backupPath = path.join(backupDir, `workflow_${workflowId}_before_story_testcase_expand_idempotency_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(row, null, 2));

    const nodes = patchNodes(JSON.parse(row.nodes));
    const patchedNodes = JSON.stringify(nodes);

    db.run(
      "update workflow_entity set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where id = ?",
      [patchedNodes, workflowId],
      function updateWorkflowEntity(updateErr) {
        if (updateErr) throw updateErr;
        db.get(
          'select versionId from workflow_history where workflowId = ? order by createdAt desc limit 1',
          [workflowId],
          (historyErr, historyRow) => {
            if (historyErr) throw historyErr;
            if (!historyRow) {
              console.log(JSON.stringify({ backupPath, workflowUpdated: this.changes, historyUpdated: 0 }, null, 2));
              db.close();
              return;
            }
            db.run(
              "update workflow_history set nodes = ?, updatedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') where workflowId = ? and versionId = ?",
              [patchedNodes, workflowId, historyRow.versionId],
              function updateWorkflowHistory(historyUpdateErr) {
                if (historyUpdateErr) throw historyUpdateErr;
                console.log(JSON.stringify({ backupPath, workflowUpdated: 1, historyUpdated: this.changes, versionId: historyRow.versionId }, null, 2));
                db.close();
              },
            );
          },
        );
      },
    );
  });
});
