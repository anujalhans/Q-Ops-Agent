# PRO QA Jira Story Test Case Generator

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SG7khcKlhHst48WH |
| Active | True |
| Archived | False |
| Created At | 2026-05-12T14:13:40.565Z |
| Updated At | 2026-05-15T06:07:38.000Z |
| Node Count | 18 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Jira Story Test Case Generator [SG7khcKlhHst48WH].json |

## Description

Generates expanded enterprise-grade Jira Test Case coverage from existing generated Jira user stories, links cases back to stories, and persists traceability.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 1 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 1 |
| n8n-nodes-base.code | 8 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 6 |
| n8n-nodes-base.if | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key
- jiraSoftwareCloudApi: Jira SW Cloud account
- openAiApi: OpenAi Paid Account (Aonu)

## External Dependencies Detected

### URL Hints

- https://anujalhans1.atlassian.net
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key

### Supabase/Data Table Hints

- qa_jobs
- qa_story_testcase_links

## Connection Graph

- When Executed by Another Workflow -> Normalize Story Test Case Request (source output 0, target input 0)
- Normalize Story Test Case Request -> Fetch Completed User Story Jobs (source output 0, target input 0)
- Fetch Completed User Story Jobs -> Build Story Source Items (source output 0, target input 0)
- Build Story Source Items -> Fetch Jira Story Issue (source output 0, target input 0)
- Fetch Jira Story Issue -> Prepare Story Test Case Prompt (source output 0, target input 0)
- Prepare Story Test Case Prompt -> Story Test Case Generator (source output 0, target input 0)
- Story Test Case Generator -> Robust Story Test Case Parser (source output 0, target input 0)
- OpenAI Chat Model -> Story Test Case Generator (source output 0, target input 0)
- Robust Story Test Case Parser -> Expand Story Test Case Items (source output 0, target input 0)
- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (source output 0, target input 0)
- Search Existing Test Case By Stable Label -> Test Case Needs Create? (source output 0, target input 0)
- Test Case Needs Create? -> Create Jira Test Case (source output 0, target input 0)
- Test Case Needs Create? -> Normalize Existing Story Test Case (source output 1, target input 0)
- Create Jira Test Case -> Link Created Test Case To Story (source output 0, target input 0)
- Link Created Test Case To Story -> Normalize Created Story Test Case (source output 0, target input 0)
- Normalize Created Story Test Case -> Upsert Story Test Case Mapping (source output 0, target input 0)
- Upsert Story Test Case Mapping -> Finalize Story Test Case Result (source output 0, target input 0)
- Normalize Existing Story Test Case -> Upsert Story Test Case Mapping (source output 0, target input 0)

## Nodes

### Build Story Source Items

| Field | Value |
| --- | --- |
| Node ID | 3958ece9-c966-444a-844d-6cf592c6e593 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Completed User Story Jobs -> Build Story Source Items (output 0, input 0)

**Outgoing Connections**

- Build Story Source Items -> Fetch Jira Story Issue (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027Normalize Story Test Case Request\u0027).first().json;\nconst rows = $input.all().map(item =\u003e item.json || {});\nconst normalizedProjectName = String(request.projectName || \u0027\u0027).trim().toLowerCase();\nconst matchingJob = rows.find((row) =\u003e {\n  const rowProjectId = String(row.project_id || \u0027\u0027).trim();\n  const rowProjectName = String(row.input?.projectName || row.input?.project_name || \u0027\u0027).trim().toLowerCase();\n  if (request.projectId \u0026\u0026 rowProjectId) return rowProjectId === String(request.projectId);\n  return rowProjectName === normalizedProjectName;\n});\nif (!matchingJob) throw new Error(\u0027No completed Epics \u0026 User Stories generation job was found for project=\u0027 + request.projectName + \u0027. Generate Epics \u0026 User Stories first, then retry Story Test Cases.\u0027);\nconst storySourceJobId = matchingJob.job_id || null;\nconst stories = matchingJob.output?.jira?.stories || matchingJob.output?.stories || [];\nif (!Array.isArray(stories) || !stories.length) throw new Error(\u0027The latest Epics \u0026 User Stories job for project=\u0027 + request.projectName + \u0027 does not contain Jira story references. Story Test Cases cannot be created until user stories exist in Jira.\u0027);\nreturn stories.map((story, index) =\u003e ({ json: { ...request, storySourceJobId, storyIndex: index + 1, totalStories: stories.length, storyKey: story.storyKey || story.key || \u0027\u0027, storyId: story.storyId || story.id || \u0027\u0027, storySummary: story.summary || \u0027\u0027, storyCorrelationId: story.storyCorrelationId || story.userStoryId || \u0027\u0027, storyStableLabel: story.stableLabel || \u0027\u0027, storySelf: story.storySelf || story.self || \u0027\u0027, storyLink: story.storyKey ? request.jiraBaseUrl + \u0027/browse/\u0027 + story.storyKey : null } }));"
}
```

### Create Jira Test Case

| Field | Value |
| --- | --- |
| Node ID | 0069985d-3a8f-42d6-bb70-c4a307359371 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2592, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Test Case Needs Create? -> Create Jira Test Case (output 0, input 0)

**Outgoing Connections**

- Create Jira Test Case -> Link Created Test Case To Story (output 0, input 0)

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "={{ $(\"Expand Story Test Case Items\").item.json.jiraBaseUrl + \"/rest/api/3/issue\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($(\"Expand Story Test Case Items\").item.json.createIssueBody) }}",
    "options":  {

                }
}
```

### Expand Story Test Case Items

| Field | Value |
| --- | --- |
| Node ID | 14a62f22-0f63-486d-8661-9cbd9b718fd1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1920, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Robust Story Test Case Parser -> Expand Story Test Case Items (output 0, input 0)

**Outgoing Connections**

- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $json;\nconst parsed = source.parsed || {};\nconst normalizeArray = value =\u003e Array.isArray(value) ? value.map(v =\u003e String(v || \u0027\u0027).trim()).filter(Boolean) : (String(value || \u0027\u0027).trim() ? [String(value).trim()] : []);\nconst slugify = value =\u003e String(value || \u0027\u0027).toLowerCase().replace(/[^a-z0-9]+/g, \u0027-\u0027).replace(/^-+|-+$/g, \u0027\u0027).slice(0, 50);\nfunction adfParagraph(text, strongLabel) { const content = []; if (strongLabel) content.push({ type: \u0027text\u0027, text: strongLabel + \u0027: \u0027, marks: [{ type: \u0027strong\u0027 }] }); if (text) content.push({ type: \u0027text\u0027, text: String(text).slice(0, 12000) }); return { type: \u0027paragraph\u0027, content }; }\nfunction adfHeading(text, level = 3) { return { type: \u0027heading\u0027, attrs: { level }, content: [{ type: \u0027text\u0027, text: String(text).slice(0, 250) }] }; }\nfunction adfBulletList(items) { const normalized = normalizeArray(items); if (!normalized.length) return null; return { type: \u0027bulletList\u0027, content: normalized.map(item =\u003e ({ type: \u0027listItem\u0027, content: [{ type: \u0027paragraph\u0027, content: [{ type: \u0027text\u0027, text: item.slice(0, 800) }] }] })) }; }\nconst storySummary = parsed.storySummary || source.storySummary || source.storyKey;\nconst testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];\nreturn testCases.map((testCase, index) =\u003e {\n  const testCaseId = String(testCase.testCaseId || (\u0027TC-\u0027 + String(index + 1).padStart(3, \u00270\u0027))).trim();\n  const summary = String(testCase.summary || (\u0027Test \u0027 + testCaseId + \u0027 for \u0027 + storySummary)).trim();\n  const stableLabel = [source.idempotencyLabelPrefix || \u0027qops\u0027, \u0027tc\u0027, slugify(source.storyCorrelationId || source.storyKey), slugify(testCaseId), slugify(summary)].filter(Boolean).join(\u0027-\u0027).slice(0, 120);\n  const preconditions = normalizeArray(testCase.preconditions);\n  const testSteps = normalizeArray(testCase.testSteps);\n  const testData = normalizeArray(testCase.testData);\n  const acceptanceCriteriaCovered = normalizeArray(testCase.acceptanceCriteriaCovered);\n  const notes = normalizeArray(testCase.notes);\n  const requirementReference = String(testCase.requirementReference || (source.storyKey + \u0027 story details\u0027)).trim();\n  const testLevel = String(testCase.testLevel || \u0027UI\u0027).trim();\n  const testCategory = String(testCase.testCategory || \u0027Functional\u0027).trim();\n  const riskLevel = String(testCase.riskLevel || \u0027Medium\u0027).trim();\n  const automationFeasibility = String(testCase.automationFeasibility || \u0027Medium\u0027).trim();\n  const jiraDescription = { type: \u0027doc\u0027, version: 1, content: [adfHeading(\u0027Source Story\u0027, 3), adfParagraph(source.storyKey + \u0027 - \u0027 + storySummary), adfParagraph(testCase.objective || \u0027\u0027, \u0027Objective\u0027), adfParagraph(requirementReference, \u0027Requirement Reference\u0027), adfParagraph(testLevel, \u0027Test Level\u0027), adfParagraph(testCategory, \u0027Test Category\u0027), adfParagraph(riskLevel, \u0027Risk Level\u0027), adfParagraph(automationFeasibility, \u0027Automation Feasibility\u0027), preconditions.length ? adfHeading(\u0027Preconditions\u0027, 3) : null, preconditions.length ? adfBulletList(preconditions) : null, testSteps.length ? adfHeading(\u0027Test Steps\u0027, 3) : null, testSteps.length ? adfBulletList(testSteps.map((step, stepIndex) =\u003e (stepIndex + 1) + \u0027. \u0027 + step)) : null, testData.length ? adfHeading(\u0027Test Data\u0027, 3) : null, testData.length ? adfBulletList(testData) : null, adfHeading(\u0027Expected Result\u0027, 3), adfParagraph(testCase.expectedResult || \u0027Expected result not provided by generator.\u0027), acceptanceCriteriaCovered.length ? adfHeading(\u0027Acceptance Criteria Covered\u0027, 3) : null, acceptanceCriteriaCovered.length ? adfBulletList(acceptanceCriteriaCovered) : null, notes.length ? adfHeading(\u0027Notes\u0027, 3) : null, notes.length ? adfBulletList(notes) : null, adfHeading(\u0027Traceability\u0027, 3), adfParagraph(source.storyKey + \u0027 | \u0027 + (source.storyCorrelationId || \u0027N/A\u0027) + \u0027 | Source Job \u0027 + (source.storySourceJobId || \u0027N/A\u0027))].filter(Boolean) };\n  return { json: { ...source, testCaseIndex: index + 1, testCaseId, testCaseSummary: summary, priority: String(testCase.priority || \u0027Medium\u0027), testType: String(testCase.testType || \u0027functional\u0027), requirementReference, testLevel, testCategory, riskLevel, automationFeasibility, objective: String(testCase.objective || \u0027\u0027).trim(), preconditions, testSteps, testData, expectedResult: String(testCase.expectedResult || \u0027\u0027).trim(), acceptanceCriteriaCovered, notes, stableLabel, jiraDescription, createIssueBody: { fields: { project: { key: source.jiraProjectKey }, issuetype: { name: source.testCaseIssueTypeName || \u0027Test Case\u0027 }, summary, description: jiraDescription, labels: [stableLabel, \u0027qops-story-test-cases\u0027, (\u0027story-\u0027 + slugify(source.storyKey)).slice(0, 80)] } }, linkIssueBody: { type: { name: \u0027Relates\u0027 }, inwardIssue: { key: source.storyKey }, outwardIssue: { key: \u0027__REPLACE_TEST_CASE_KEY__\u0027 }, comment: { body: { type: \u0027doc\u0027, version: 1, content: [{ type: \u0027paragraph\u0027, content: [{ type: \u0027text\u0027, text: \u0027Linked by Q-Ops Story Test Cases generation.\u0027 }] }] } } } } };\n});"
}
```

### Fetch Completed User Story Jobs

| Field | Value |
| --- | --- |
| Node ID | 7903c2e8-99d5-4061-8d6c-443e21aca1eb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Story Test Case Request -> Fetch Completed User Story Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch Completed User Story Jobs -> Build Story Source Items (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "status",
                                                   "value":  "eq.completed"
                                               },
                                               {
                                                   "name":  "input-\u003e\u003edocumentType",
                                                   "value":  "eq.user_stories"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "25"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,project_id,requested_by,created_at,input,output"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Jira Story Issue

| Field | Value |
| --- | --- |
| Node ID | b24c8627-ee3b-444b-9ff6-96811cafacf9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Source Items -> Fetch Jira Story Issue (output 0, input 0)

**Outgoing Connections**

- Fetch Jira Story Issue -> Prepare Story Test Case Prompt (output 0, input 0)

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/issue/\" + encodeURIComponent($json.storyKey) + \"?fields=summary,description,labels\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "options":  {

                }
}
```

### Finalize Story Test Case Result

| Field | Value |
| --- | --- |
| Node ID | 673cd158-3b9a-48c4-8c31-1c258e9bd521 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3488, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upsert Story Test Case Mapping -> Finalize Story Test Case Result (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function safeAll(nodeName) { try { return $(nodeName).all().map((item) =\u003e item.json || {}); } catch (error) { if (String(error?.message || error).includes(\"hasn\u0027t been executed\")) return []; throw error; } }\nconst createdItems = safeAll(\u0027Normalize Created Story Test Case\u0027);\nconst reusedItems = safeAll(\u0027Normalize Existing Story Test Case\u0027);\nconst allItems = [...createdItems, ...reusedItems];\nif (!allItems.length) throw new Error(\u0027Story Test Case generator did not produce any reusable or created Jira Test Cases.\u0027);\nconst perStoryMetrics = $(\u0027Robust Story Test Case Parser\u0027).all().map(item =\u003e item.json || {});\nconst storyMap = new Map();\nallItems.forEach((item) =\u003e { if (!storyMap.has(item.storyKey)) storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: item.storyId, summary: item.storySummary, storyCorrelationId: item.storyCorrelationId, storyLink: item.storyLink }); });\nconst stories = Array.from(storyMap.values());\nconst testCases = allItems.map((item) =\u003e ({ action: item.action, testcaseKey: item.testcaseKey, testcaseId: item.testcaseId, testcaseSummary: item.testCaseSummary, testcaseLink: item.testcaseLink, storyKey: item.storyKey, storySummary: item.storySummary, stableLabel: item.stableLabel, priority: item.priority, riskLevel: item.riskLevel, testType: item.testType, testLevel: item.testLevel, testCategory: item.testCategory, automationFeasibility: item.automationFeasibility, requirementReference: item.requirementReference }));\nconst mappings = allItems.map((item) =\u003e ({ storyKey: item.storyKey, storySummary: item.storySummary, testcaseKey: item.testcaseKey, testcaseSummary: item.testCaseSummary, action: item.action }));\nconst wordCount = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyWordCount || 0), 0);\nconst tokensInput = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyTokensInput || 0), 0);\nconst tokensOutput = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyTokensOutput || 0), 0);\nconst estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));\nconst first = allItems[0];\nreturn [{ json: { documentType: \u0027story_test_cases\u0027, jobId: first.jobId, projectId: first.projectId, projectName: first.projectName, sourceUserStoryJobId: first.storySourceJobId || null, stories, testCases, mappings, jira: { projectKey: first.jiraProjectKey, created: testCases.filter(item =\u003e item.action === \u0027created\u0027).length, reused: testCases.filter(item =\u003e item.action === \u0027reused\u0027).length }, wordCount, tokensInput, tokensOutput, tokensTotal: tokensInput + tokensOutput, estimatedCostUsd } }];"
}
```

### Link Created Test Case To Story

| Field | Value |
| --- | --- |
| Node ID | 3326dda4-6bab-4117-b819-8b5b104697f8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2816, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Jira Test Case -> Link Created Test Case To Story (output 0, input 0)

**Outgoing Connections**

- Link Created Test Case To Story -> Normalize Created Story Test Case (output 0, input 0)

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "={{ $(\"Expand Story Test Case Items\").item.json.jiraBaseUrl + \"/rest/api/3/issueLink\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ type: { name: \"Relates\" }, inwardIssue: { key: $(\"Expand Story Test Case Items\").item.json.storyKey }, outwardIssue: { key: $json.key }, comment: { body: { type: \"doc\", version: 1, content: [{ type: \"paragraph\", content: [{ type: \"text\", text: \"Linked by Q-Ops Story Test Cases generation.\" }] }] } } }) }}",
    "options":  {

                }
}
```

### Normalize Created Story Test Case

| Field | Value |
| --- | --- |
| Node ID | fc6e7df1-41fc-4761-bfbe-40ac26c0640d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3040, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Link Created Test Case To Story -> Normalize Created Story Test Case (output 0, input 0)

**Outgoing Connections**

- Normalize Created Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const expandedItems = $(\u0027Expand Story Test Case Items\u0027).all().map((item) =\u003e item.json || {});\nconst createdItems = $(\u0027Create Jira Test Case\u0027).all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn createdItems.map((item, index) =\u003e {\n  const created = item.json || {};\n  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};\n  return {\n    json: {\n      ...source,\n      action: \u0027created\u0027,\n      testcaseKey: created.key,\n      testcaseId: created.id,\n      testcaseSelf: created.self,\n      testcaseLink: source.jiraBaseUrl + \u0027/browse/\u0027 + created.key\n    }\n  };\n});"
}
```

### Normalize Existing Story Test Case

| Field | Value |
| --- | --- |
| Node ID | f58b8235-2c84-4521-b28b-efc93ae9ea9a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3040, 208 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Test Case Needs Create? -> Normalize Existing Story Test Case (output 1, input 0)

**Outgoing Connections**

- Normalize Existing Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const expandedItems = $(\u0027Expand Story Test Case Items\u0027).all().map((item) =\u003e item.json || {});\nconst searchItems = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn searchItems.map((item, index) =\u003e {\n  const search = item.json || {};\n  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};\n  const existing = Array.isArray(search.issues) ? search.issues[0] : null;\n  if (!existing?.key) throw new Error(\u0027Expected an existing Jira Test Case issue for stable label \u0027 + source.stableLabel + \u0027 but none was returned.\u0027);\n  return {\n    json: {\n      ...source,\n      action: \u0027reused\u0027,\n      testcaseKey: existing.key,\n      testcaseId: existing.id || null,\n      testcaseSelf: existing.self || null,\n      testcaseLink: source.jiraBaseUrl + \u0027/browse/\u0027 + existing.key\n    }\n  };\n});"
}
```

### Normalize Story Test Case Request

| Field | Value |
| --- | --- |
| Node ID | f453a7fa-e99f-4597-8afd-e33fc0793f54 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- When Executed by Another Workflow -> Normalize Story Test Case Request (output 0, input 0)

**Outgoing Connections**

- Normalize Story Test Case Request -> Fetch Completed User Story Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const input = $json || {};\nconst config = input.configSnapshot || input.config_snapshot || {};\nconst jira = config.jira || {};\nconst models = config.models || {};\nconst cleanBase = (value, fallback) =\u003e {\n  const s = String(value || fallback || \u0027\u0027);\n  return s.endsWith(\u0027/\u0027) ? s.slice(0, -1) : s;\n};\nreturn [{\n  json: {\n    jobId: input.jobId || input.job_id || (\u0027STC-\u0027 + Date.now()),\n    projectId: input.projectId || input.project_id || null,\n    projectName: input.projectName || input.project_name || \u0027Unknown Project\u0027,\n    requestedBy: input.requestedBy || input.requested_by || null,\n    settingsVersion: input.settingsVersion || input.settings_version || null,\n    startedAt: input.startedAt || input.createdAt || new Date().toISOString(),\n    jiraBaseUrl: cleanBase(input.jiraBaseUrl || jira.baseUrl, \u0027https://anujalhans1.atlassian.net\u0027),\n    jiraProjectKey: input.jiraProjectKey || jira.projectKey || \u0027KAN\u0027,\n    testCaseIssueTypeName: input.testCaseIssueTypeName || jira.testCaseIssueTypeName || jira.testCaseIssueType || \u0027Test Case\u0027,\n    generationModel: input.generationModel || models.generationModel || \u0027gpt-4.1-mini\u0027,\n    maxTokens: Math.max(6000, Number(input.maxTokens || models.maxTokens || 12000) || 12000),\n    idempotencyLabelPrefix: input.idempotencyLabelPrefix || jira.idempotencyLabelPrefix || \u0027qops\u0027,\n    productOwner: input.productOwner || input.product_owner || \u0027Product Owner\u0027,\n    configSnapshot: config\n  }\n}];"
}
```

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | 829e34a3-2de5-4811-ab33-f867446700a2 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 1424, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OpenAI Chat Model -> Story Test Case Generator (output 0, input 0)

**Credential References**

```json
{
    "openAiApi":  {
                      "id":  "rdVg2Kks1mUCJf4R",
                      "name":  "OpenAi Paid Account (Aonu)"
                  }
}
```

**Full Parameter Snapshot**

```json
{
    "model":  {
                  "__rl":  true,
                  "value":  "gpt-4.1-mini",
                  "mode":  "id",
                  "cachedResultName":  "gpt-4.1-mini"
              },
    "builtInTools":  {

                     },
    "options":  {
                    "maxTokens":  12000
                }
}
```

### Prepare Story Test Case Prompt

| Field | Value |
| --- | --- |
| Node ID | d961c0c2-d8fa-4af9-815c-f2cd88747832 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Jira Story Issue -> Prepare Story Test Case Prompt (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Prompt -> Story Test Case Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $(\u0027Build Story Source Items\u0027).item.json;\nconst issue = $json || {};\nconst NL = String.fromCharCode(10);\nfunction flattenAdf(node) {\n  if (!node) return \u0027\u0027;\n  if (Array.isArray(node)) return node.map(flattenAdf).filter(Boolean).join(NL);\n  if (typeof node === \u0027string\u0027) return node;\n  if (node.type === \u0027text\u0027) return node.text || \u0027\u0027;\n  const content = Array.isArray(node.content) ? node.content.map(flattenAdf).filter(Boolean).join(node.type === \u0027paragraph\u0027 ? \u0027\u0027 : NL) : \u0027\u0027;\n  if (node.type === \u0027paragraph\u0027) return content.trim();\n  if (node.type === \u0027bulletList\u0027 || node.type === \u0027orderedList\u0027) return content.trim();\n  if (node.type === \u0027listItem\u0027) return \u0027- \u0027 + content.trim();\n  if (node.type === \u0027heading\u0027) return content.trim();\n  return content.trim();\n}\nconst descriptionText = flattenAdf(issue.fields?.description || \u0027\u0027).replace(new RegExp(NL + \u0027{3,}\u0027, \u0027g\u0027), NL + NL).trim();\nconst storySummary = issue.fields?.summary || source.storySummary || source.storyKey;\nconst system = [\n  \u0027You are a Senior QA Test Architect with 15+ years of experience designing enterprise-scale, risk-driven, automation-ready Jira Test Case issues from existing Jira user stories.\u0027,\n  \u0027You specialize in requirement decomposition, boundary and edge case design, negative testing, failure modeling, UI/API/integration validation, and automation feasibility optimization.\u0027,\n  \u0027Return one JSON object only. No markdown. No prose outside JSON.\u0027,\n  \u0027Avoid generic test cases. Every case must be specific to the story, realistic, execution-ready, and traceable to the available Jira story details.\u0027,\n  \u0027Use this exact schema:\u0027,\n  \u0027{\u0027,\n  \u0027  \"storyKey\": \"KAN-123\",\u0027,\n  \u0027  \"storySummary\": \"Story title\",\u0027,\n  \u0027  \"testCases\": [\u0027,\n  \u0027    {\u0027,\n  \u0027      \"testCaseId\": \"TC-001\",\u0027,\n  \u0027      \"summary\": \"Short Jira-ready test case title\",\u0027,\n  \u0027      \"objective\": \"Why this test exists\",\u0027,\n  \u0027      \"requirementReference\": \"Story KAN-123 acceptance criterion or story detail covered\",\u0027,\n  \u0027      \"testLevel\": \"UI | API | SIT | FAT | Regression | Security | Performance | Network | Data | Accessibility\",\u0027,\n  \u0027      \"testCategory\": \"Positive | Negative | Boundary | Edge | Alternate | Exception | Integration | Validation | Resilience\",\u0027,\n  \u0027      \"preconditions\": [\"...\"],\u0027,\n  \u0027      \"testSteps\": [\"...\"],\u0027,\n  \u0027      \"testData\": [\"...\"],\u0027,\n  \u0027      \"expectedResult\": \"Observable outcome\",\u0027,\n  \u0027      \"priority\": \"High\",\u0027,\n  \u0027      \"riskLevel\": \"High\",\u0027,\n  \u0027      \"testType\": \"functional\",\u0027,\n  \u0027      \"automationFeasibility\": \"High\",\u0027,\n  \u0027      \"acceptanceCriteriaCovered\": [\"...\"],\u0027,\n  \u0027      \"notes\": [\"...\"]\u0027,\n  \u0027    }\u0027,\n  \u0027  ]\u0027,\n  \u0027}\u0027,\n  \u0027Generate maximum useful coverage for this story. Do not cap output at 7 test cases.\u0027,\n  \u0027For simple or low-risk stories, generate at least 8 to 12 distinct test cases.\u0027,\n  \u0027For medium-complexity stories, generate at least 15 to 25 distinct test cases.\u0027,\n  \u0027For complex, integration-heavy, data-heavy, payment, authentication, authorization, or high-risk stories, generate 25 to 40 distinct test cases when the story details support it.\u0027,\n  \u0027Cover UI, FAT, SIT, regression, API/service, data validation, positive, negative, boundary, edge, alternate, exception, integration, security, performance, network/resilience, and accessibility scenarios wherever applicable.\u0027,\n  \u0027Do not invent unsupported systems or requirements. If a coverage type is not applicable, omit it rather than creating filler.\u0027,\n  \u0027Prioritize breadth first, then depth: cover distinct behaviors, validations, integrations, roles, permissions, data states, and failure modes before adding variants.\u0027,\n  \u0027Keep titles concise and professional for Jira.\u0027,\n  \u0027Every test case must have at least 3 clear steps, concrete test data where applicable, a concrete expected result, priority, risk level, and automation feasibility.\u0027,\n  \u0027Use stable, sequential testCaseId values from TC-001 onward.\u0027\n].join(NL);\nconst user = [\u0027Project: \u0027 + source.projectName, \u0027Story Key: \u0027 + source.storyKey, \u0027Story Summary: \u0027 + storySummary, \u0027Story Correlation ID: \u0027 + (source.storyCorrelationId || \u0027N/A\u0027), \u0027\u0027, \u0027Story Description:\u0027, descriptionText || \u0027No Jira description was available. Use the story summary and source context only.\u0027, \u0027\u0027, \u0027Generate exhaustive, enterprise-grade, execution-ready Jira Test Case issues for this story.\u0027].join(NL);\nreturn [{ json: { ...source, storySummary, storyDescriptionText: descriptionText, system, user } }];"
}
```

### Robust Story Test Case Parser

| Field | Value |
| --- | --- |
| Node ID | 52a332b9-10b1-402a-909a-424b49e4bfeb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1696, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Generator -> Robust Story Test Case Parser (output 0, input 0)

**Outgoing Connections**

- Robust Story Test Case Parser -> Expand Story Test Case Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $(\u0027Prepare Story Test Case Prompt\u0027).item.json;\nconst raw = $json.output ?? $json.text ?? $json.response ?? $json;\nconst NL = String.fromCharCode(10);\nconst BACKSLASH = String.fromCharCode(92);\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n  }\n  return String(value || \u0027\u0027).trim();\n};\nconst count = (text, pattern) =\u003e (text.match(pattern) || []).length;\nconst truncationMessage = text =\u003e \u0027Story Test Case parser detected incomplete or truncated model JSON for story \u0027 + source.storyKey + \u0027. Output chars=\u0027 + text.length + \u0027, maxTokens=\u0027 + source.maxTokens + \u0027. Please rerun or reduce prompt size.\u0027;\nconst extractBalancedJsonObject = text =\u003e {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) throw new Error(\u0027Story Test Case parser received a response without a JSON object. Raw preview: \u0027 + text.slice(0, 500));\n  let depth = 0;\n  let inString = false;\n  let escaped = false;\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n    if (inString) {\n      if (escaped) escaped = false;\n      else if (char === BACKSLASH) escaped = true;\n      else if (char === \u0027\"\u0027) inString = false;\n      continue;\n    }\n    if (char === \u0027\"\u0027) inString = true;\n    else if (char === \u0027{\u0027) depth += 1;\n    else if (char === \u0027}\u0027) { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }\n  }\n  throw new Error(truncationMessage(text) + \u0027 JSON balance: {\u0027 + count(text, /{/g) + \u0027/\u0027 + count(text, /}/g) + \u0027}\u0027);\n};\nlet text = stringifyRaw(raw);\nif (!text) throw new Error(\u0027Story Test Case parser received an empty model response.\u0027);\nconst fence = String.fromCharCode(96, 96, 96);\nconst fenceStart = text.indexOf(fence);\nconst fenceEnd = text.lastIndexOf(fence);\nif (fenceStart \u003e= 0 \u0026\u0026 fenceEnd \u003e fenceStart) {\n  const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);\n  if (firstLineEnd \u003e= 0 \u0026\u0026 fenceEnd \u003e firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();\n}\nconst candidate = extractBalancedJsonObject(text);\nlet parsed;\ntry { parsed = JSON.parse(candidate); } catch (error) { throw new Error(\u0027Story Test Case parser failed to parse model JSON: \u0027 + error.message + \u0027. Raw preview: \u0027 + candidate.slice(0, 800)); }\nif (!Array.isArray(parsed.testCases) || !parsed.testCases.length) throw new Error(\u0027Story Test Case generator returned no testCases for story \u0027 + source.storyKey + \u0027.\u0027);\nreturn [{ json: { ...source, parsed, storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + \u0027s+\u0027)).length), storyTokensInput: Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4)), storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)), storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6)) } }];"
}
```

### Search Existing Test Case By Stable Label

| Field | Value |
| --- | --- |
| Node ID | 2445849c-c4e0-4b29-ad99-6268ec697259 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2144, 112 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (output 0, input 0)

**Outgoing Connections**

- Search Existing Test Case By Stable Label -> Test Case Needs Create? (output 0, input 0)

**Credential References**

```json
{
    "jiraSoftwareCloudApi":  {
                                 "id":  "F5nyQnchcdE8LxV1",
                                 "name":  "Jira SW Cloud account"
                             }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/search/jql\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "jql",
                                                   "value":  "={{ \"project = \" + $json.jiraProjectKey + \" AND issuetype = \\\"\" + ($json.testCaseIssueTypeName || \"Test Case\") + \"\\\" AND labels = \\\"\" + $json.stableLabel + \"\\\" ORDER BY created DESC\" }}"
                                               },
                                               {
                                                   "name":  "fields",
                                                   "value":  "summary"
                                               },
                                               {
                                                   "name":  "maxResults",
                                                   "value":  "1"
                                               }
                                           ]
                        },
    "options":  {

                }
}
```

### Story Test Case Generator

| Field | Value |
| --- | --- |
| Node ID | d6c134e5-c24c-4c02-ad2f-eb4be173d356 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 1344, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Prompt -> Story Test Case Generator (output 0, input 0)
- OpenAI Chat Model -> Story Test Case Generator (output 0, input 0)

**Outgoing Connections**

- Story Test Case Generator -> Robust Story Test Case Parser (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "promptType":  "define",
    "text":  "={{ $json.user }}",
    "options":  {
                    "systemMessage":  "={{ $json.system }}"
                }
}
```

### Test Case Needs Create?

| Field | Value |
| --- | --- |
| Node ID | 4f5844c8-6a19-4b5d-b568-f6bc9dedf800 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 2368, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Existing Test Case By Stable Label -> Test Case Needs Create? (output 0, input 0)

**Outgoing Connections**

- Test Case Needs Create? -> Create Jira Test Case (output 0, input 0)
- Test Case Needs Create? -> Normalize Existing Story Test Case (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "combinator":  "and",
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "strict",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "leftValue":  "={{ (($json.issues || []).length) === 0 }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   }
}
```

### Upsert Story Test Case Mapping

| Field | Value |
| --- | --- |
| Node ID | 7919f86a-755a-4d4a-91c1-cd245bc9b2d1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3264, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Created Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)
- Normalize Existing Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)

**Outgoing Connections**

- Upsert Story Test Case Mapping -> Finalize Story Test Case Result (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?on_conflict=story_jira_key,testcase_jira_key",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"resolution=merge-duplicates,return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: \"Relates\", status: $json.action === \"created\" ? \"linked\" : \"reused\", metadata: { action: $json.action, priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}",
    "options":  {

                }
}
```

### When Executed by Another Workflow

| Field | Value |
| --- | --- |
| Node ID | 4e15c0a4-c08a-4ab2-916c-6e626ee2413e |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | 0, 112 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- When Executed by Another Workflow -> Normalize Story Test Case Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "inputSource":  "passthrough"
}
```
