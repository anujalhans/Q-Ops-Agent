# PRO QA Jira Story Test Case Generator

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SG7khcKlhHst48WH |
| Active | True |
| Created At | 2026-05-12T14:13:40.565Z |
| Updated At | 2026-06-29T09:43:45.567Z |
| Node Count | 73 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\PRO QA Jira Story Test Case Generator [SG7khcKlhHst48WH].json |

## Description

Generates expanded enterprise-grade Jira Test Case coverage from existing generated Jira user stories, links cases back to stories, and persists traceability.

## Trigger And Entry Contract

- When Executed by Another Workflow | n8n-nodes-base.executeWorkflowTrigger

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| @n8n/n8n-nodes-langchain.agent | 3 |
| @n8n/n8n-nodes-langchain.lmChatOpenAi | 3 |
| n8n-nodes-base.code | 40 |
| n8n-nodes-base.executeWorkflowTrigger | 1 |
| n8n-nodes-base.httpRequest | 20 |
| n8n-nodes-base.if | 6 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key
- jiraSoftwareCloudApi: Jira SW Cloud account
- openAiApi: OpenAi Paid Account (Aonu)

## Connection Graph

- When Executed by Another Workflow -> Normalize Story Test Case Request (source output 0, target input 0)
- Normalize Story Test Case Request -> Fetch Completed User Story Jobs (source output 0, target input 0)
- Fetch Completed User Story Jobs -> Build Story Source Items (source output 0, target input 0)
- Build Story Source Items -> Fetch Published Story Test Case Links (source output 0, target input 0)
- Fetch Jira Story Issue -> Prepare Story Test Case Prompt (source output 0, target input 0)
- Prepare Story Test Case Prompt -> Story Test Case Generator (source output 0, target input 0)
- Story Test Case Generator -> Robust Story Test Case Parser (source output 0, target input 0)
- Robust Story Test Case Parser -> Build Story Test Case Progress - Planning Coverage (source output 0, target input 0)
- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (source output 0, target input 0)
- Search Existing Test Case By Stable Label -> Attach Story Test Case Search Source (source output 0, target input 0)
- Test Case Needs Create? -> Prepare Story Test Case Create Request (source output 0, target input 0)
- Test Case Needs Create? -> Normalize Existing Story Test Case (source output 1, target input 0)
- Create Jira Test Case -> Normalize Created Story Test Case (source output 0, target input 0)
- Link Created Test Case To Story -> Normalize Linked Story Test Case (source output 0, target input 0)
- Normalize Created Story Test Case -> Upsert Story Test Case Publish Checkpoint (source output 0, target input 0)
- Upsert Story Test Case Mapping -> Build Story Test Case Progress - Finalizing Coverage (source output 0, target input 0)
- Normalize Existing Story Test Case -> Existing Test Case Needs Update? (source output 0, target input 0)
- Build Story Test Case Detail Batches -> Story Test Case Batch Generator (source output 0, target input 0)
- Story Test Case Batch Generator -> Robust Story Test Case Batch Parser (source output 0, target input 0)
- Robust Story Test Case Batch Parser -> Story Test Case Batch Needs Retry? (source output 0, target input 0)
- Story Test Case Batch Needs Retry? -> Prepare Story Test Case Batch Retry Prompt (source output 0, target input 0)
- Story Test Case Batch Needs Retry? -> Merge Story Test Case Batches (source output 1, target input 0)
- Prepare Story Test Case Batch Retry Prompt -> Story Test Case Batch Retry Generator (source output 0, target input 0)
- Story Test Case Batch Retry Generator -> Robust Story Test Case Batch Retry Parser (source output 0, target input 0)
- Robust Story Test Case Batch Retry Parser -> Merge Story Test Case Batches (source output 0, target input 0)
- Merge Story Test Case Batches -> Build Story Test Case Progress - Generating Test Cases (source output 0, target input 0)
- Finalize Story Test Case Result -> Build Direct Story Test Case Completion Output (source output 0, target input 0)
- Build Direct Story Test Case Completion Output -> Story Test Case Completion Metrics Allowed? (source output 0, target input 0)
- LOG: Direct Story Test Case Job Completed -> Mark Direct Story Test Case Job Completed (source output 0, target input 0)
- Mark Direct Story Test Case Job Completed -> Repair Direct Story Test Case Completion Metric Attribution (source output 0, target input 0)
- Existing Test Case Needs Update? -> Prepare Existing Story Test Case Update Request (source output 0, target input 0)
- Existing Test Case Needs Update? -> Upsert Story Test Case Publish Checkpoint (source output 1, target input 0)
- Update Existing Jira Test Case -> Normalize Updated Existing Story Test Case (source output 0, target input 0)
- Normalize Updated Existing Story Test Case -> Upsert Story Test Case Publish Checkpoint (source output 0, target input 0)
- Build Story Test Case Delta Targets -> Build Story Test Case Progress - Planning Scope (source output 0, target input 0)
- Story Test Case Delta Has No Work? -> Build Story Test Case No-Change Result (source output 0, target input 0)
- Story Test Case Delta Has No Work? -> Fetch Jira Story Issue (source output 1, target input 0)
- Build Story Test Case No-Change Result -> Build Direct Story Test Case Completion Output (source output 0, target input 0)
- Upsert Story Test Case Publish Checkpoint -> Recover Story Test Case Publish Checkpoint Items (source output 0, target input 0)
- Fetch Existing Test Case Story Links -> Detect Existing Story Test Case Link (source output 0, target input 0)
- Detect Existing Story Test Case Link -> Story Test Case Link Needed? (source output 0, target input 0)
- Story Test Case Link Needed? -> Link Created Test Case To Story (source output 0, target input 0)
- Story Test Case Link Needed? -> Mark Story Test Case Link Existing (source output 1, target input 0)
- Normalize Linked Story Test Case -> Upsert Story Test Case Mapping (source output 0, target input 0)
- Mark Story Test Case Link Existing -> Upsert Story Test Case Mapping (source output 0, target input 0)
- Recover Story Test Case Publish Checkpoint Items -> Build Story Test Case Progress - Linking Traceability (source output 0, target input 0)
- Build Story Test Case Usage Checkpoint -> Persist Story Test Case Usage Checkpoint (source output 0, target input 0)
- Persist Story Test Case Usage Checkpoint -> Restore Story Test Case Usage Checkpoint Items (source output 0, target input 0)
- Restore Story Test Case Usage Checkpoint Items -> Expand Story Test Case Items (source output 0, target input 0)
- Repair Direct Story Test Case Completion Metric Attribution -> Return Direct Story Test Case Result (source output 0, target input 0)
- Build Story Test Case Progress - Planning Scope -> Persist Story Test Case Progress - Planning Scope (source output 0, target input 0)
- Persist Story Test Case Progress - Planning Scope -> Restore Story Test Case Progress - Planning Scope (source output 0, target input 0)
- Restore Story Test Case Progress - Planning Scope -> Story Test Case Delta Has No Work? (source output 0, target input 0)
- Build Story Test Case Progress - Planning Coverage -> Persist Story Test Case Progress - Planning Coverage (source output 0, target input 0)
- Persist Story Test Case Progress - Planning Coverage -> Restore Story Test Case Progress - Planning Coverage (source output 0, target input 0)
- Restore Story Test Case Progress - Planning Coverage -> Build Story Test Case Detail Batches (source output 0, target input 0)
- Build Story Test Case Progress - Generating Test Cases -> Persist Story Test Case Progress - Generating Test Cases (source output 0, target input 0)
- Persist Story Test Case Progress - Generating Test Cases -> Restore Story Test Case Progress - Generating Test Cases (source output 0, target input 0)
- Restore Story Test Case Progress - Generating Test Cases -> Build Story Test Case Usage Checkpoint (source output 0, target input 0)
- Build Story Test Case Progress - Linking Traceability -> Persist Story Test Case Progress - Linking Traceability (source output 0, target input 0)
- Persist Story Test Case Progress - Linking Traceability -> Restore Story Test Case Progress - Linking Traceability (source output 0, target input 0)
- Restore Story Test Case Progress - Linking Traceability -> Prepare Story Test Case Link Check Request (source output 0, target input 0)
- Build Story Test Case Progress - Finalizing Coverage -> Persist Story Test Case Progress - Finalizing Coverage (source output 0, target input 0)
- Persist Story Test Case Progress - Finalizing Coverage -> Restore Story Test Case Progress - Finalizing Coverage (source output 0, target input 0)
- Restore Story Test Case Progress - Finalizing Coverage -> Finalize Story Test Case Result (source output 0, target input 0)
- Prepare Story Test Case Create Request -> Create Jira Test Case (source output 0, target input 0)
- Story Test Case Completion Metrics Allowed? -> LOG: Direct Story Test Case Job Completed (source output 0, target input 0)
- Story Test Case Completion Metrics Allowed? -> Mark Direct Story Test Case Job Completed (source output 1, target input 0)
- Attach Story Test Case Search Source -> Test Case Needs Create? (source output 0, target input 0)
- Prepare Existing Story Test Case Update Request -> Build Story Test Case Progress - Updating Existing Jira (source output 0, target input 0)
- Prepare Story Test Case Link Check Request -> Fetch Existing Test Case Story Links (source output 0, target input 0)
- Build Story Test Case Progress - Updating Existing Jira -> Persist Story Test Case Progress - Updating Existing Jira (source output 0, target input 0)
- Persist Story Test Case Progress - Updating Existing Jira -> Restore Story Test Case Progress - Updating Existing Jira (source output 0, target input 0)
- Restore Story Test Case Progress - Updating Existing Jira -> Update Existing Jira Test Case (source output 0, target input 0)
- Fetch Published Story Test Case Links -> Build Story Test Case Delta Targets (source output 0, target input 0)

## Nodes

### Attach Story Test Case Search Source

| Field | Value |
| --- | --- |
| Node ID | 79c0f6c7-5cbb-4296-a82f-dd05a31fbc7d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 7552, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Search Existing Test Case By Stable Label -> Attach Story Test Case Search Source (output 0, input 0)

**Outgoing Connections**

- Attach Story Test Case Search Source -> Test Case Needs Create? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const expandedItems = $(\u0027Expand Story Test Case Items\u0027).all().map((item) =\u003e item.json || {});\nconst searchItems = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn searchItems.map((item, index) =\u003e {\n  const search = item.json || {};\n  const source = expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {};\n  if (!source.storyKey || !source.stableLabel) {\n    throw new Error(\u0027Unable to attach Story Test Case search result to source item at index \u0027 + index + \u0027.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      searchResult: search,\n      issues: Array.isArray(search.issues) ? search.issues : [],\n      publishStage: \u0027existing_search_checked\u0027,\n    },\n  };\n});"
}
```

### Build Direct Story Test Case Completion Output

| Field | Value |
| --- | --- |
| Node ID | bae6ffa2-1038-44d6-8725-cc1440ea0e67 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 13376, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Finalize Story Test Case Result -> Build Direct Story Test Case Completion Output (output 0, input 0)
- Build Story Test Case No-Change Result -> Build Direct Story Test Case Completion Output (output 0, input 0)

**Outgoing Connections**

- Build Direct Story Test Case Completion Output -> Story Test Case Completion Metrics Allowed? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const result = $json || {};\nconst tokenUsage = result.tokenUsage || {\n  source: \u0027story_testcase_generator\u0027,\n  input: Number(result.tokensInput || 0),\n  output: Number(result.tokensOutput || 0),\n  total: Number(result.tokensTotal || 0),\n  tokensInput: Number(result.tokensInput || 0),\n  tokensOutput: Number(result.tokensOutput || 0),\n  tokensTotal: Number(result.tokensTotal || 0),\n  estimatedCostUsd: Number(result.estimatedCostUsd || 0),\n};\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  destination: { type: \u0027jira_test_cases\u0027, projectId: result.projectId || null },\n  generationMode: result.generationMode || null,\n  updateContext: result.updateContext || null,\n  updateOfJobId: result.updateOfJobId || result.updateContext?.previousJobId || null,\n  retryOfJobId: result.retryOfJobId || null,\n  sourceUserStoryJobId: result.sourceUserStoryJobId || null,\n  stories: Array.isArray(result.stories) ? result.stories : [],\n  testCases: Array.isArray(result.testCases) ? result.testCases : [],\n  mappings: Array.isArray(result.mappings) ? result.mappings : [],\n  categoryDistribution: result.categoryDistribution || {},\n  coverageSummary: result.coverageSummary || result.qualityGate?.coverageSummary || null,\n  batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,\n  coverageLedger: Array.isArray(result.coverageLedger) ? result.coverageLedger : (Array.isArray(result.qualityGate?.coverageLedger) ? result.qualityGate.coverageLedger : []),\n  qualityGate: result.qualityGate || null,\n  updateSummary: result.updateSummary || result.qualityGate?.updateSummary || null,\n  tokenUsage,\n  tokenSavings: (result.updateSummary || result.qualityGate?.updateSummary || null)?.tokenSavings || result.tokenSavings || null,\n  jira: result.jira || null,\n  wordCount: Number(result.wordCount || 0),\n  tokensInput: Number(result.tokensInput || tokenUsage.input || 0),\n  tokensOutput: Number(result.tokensOutput || tokenUsage.output || 0),\n  tokensTotal: Number(result.tokensTotal || tokenUsage.total || 0),\n  estimatedCostUsd: Number(result.estimatedCostUsd || tokenUsage.estimatedCostUsd || 0),\n  terminalStatus: result.terminalStatus || \u0027completed\u0027,\n  error: result.error || null,\n  requiresCoverageRepair: Boolean(result.requiresCoverageRepair),\n  repairTargets: Array.isArray(result.repairTargets) ? result.repairTargets : [],\n  patchVersion: result.patchVersion || \u0027stc-update-gate-usage-summary-v1\u0027,\n};\n\nreturn [{\n  json: {\n    ...result,\n    generatorPersisted: true,\n    terminalStatus: output.terminalStatus,\n    output,\n  },\n}];"
}
```

### Build Story Source Items

| Field | Value |
| --- | --- |
| Node ID | 3958ece9-c966-444a-844d-6cf592c6e593 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Completed User Story Jobs -> Build Story Source Items (output 0, input 0)

**Outgoing Connections**

- Build Story Source Items -> Fetch Published Story Test Case Links (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027Normalize Story Test Case Request\u0027).first().json;\nconst rows = $input.all().map(item =\u003e item.json || {});\nconst normalizedProjectName = String(request.projectName || \u0027\u0027).trim().toLowerCase();\nconst matchingJob = rows.find((row) =\u003e {\n  const rowProjectId = String(row.project_id || \u0027\u0027).trim();\n  const rowProjectName = String(row.input?.projectName || row.input?.project_name || \u0027\u0027).trim().toLowerCase();\n  if (request.projectId \u0026\u0026 rowProjectId) return rowProjectId === String(request.projectId);\n  return rowProjectName === normalizedProjectName;\n});\nif (!matchingJob) throw new Error(\u0027No completed Epics \u0026 User Stories generation job was found for project=\u0027 + request.projectName + \u0027. Generate Epics \u0026 User Stories first, then retry Story Test Cases.\u0027);\n\nfunction asArray(value) {\n  return Array.isArray(value) ? value : [];\n}\n\nfunction storyKeyOf(story) {\n  return String(story?.storyKey || story?.key || story?.issueKey || story?.jiraKey || \u0027\u0027).trim();\n}\n\nfunction normalizeStory(story, sourceName) {\n  const storyKey = storyKeyOf(story);\n  if (!storyKey) return null;\n  return {\n    storyKey,\n    storyId: story.storyId || story.id || story.issueId || \u0027\u0027,\n    storySummary: story.summary || story.storySummary || story.title || \u0027\u0027,\n    storyCorrelationId: story.storyCorrelationId || story.userStoryId || story.correlationId || \u0027\u0027,\n    storyStableLabel: story.stableLabel || \u0027\u0027,\n    storySelf: story.storySelf || story.self || \u0027\u0027,\n    storySource: sourceName,\n  };\n}\n\nconst storySources = [\n  ...asArray(matchingJob.output?.stories).map(story =\u003e normalizeStory(story, \u0027output.stories\u0027)),\n  ...asArray(matchingJob.output?.jira?.stories).map(story =\u003e normalizeStory(story, \u0027output.jira.stories\u0027)),\n  ...asArray(matchingJob.output?.generated?.stories).map(story =\u003e normalizeStory(story, \u0027output.generated.stories\u0027)),\n  ...asArray(matchingJob.output?.generated?.jira?.stories).map(story =\u003e normalizeStory(story, \u0027output.generated.jira.stories\u0027)),\n  ...asArray(matchingJob.output?.backlog?.stories).map(story =\u003e normalizeStory(story, \u0027output.backlog.stories\u0027)),\n].filter(Boolean);\n\nconst byStoryKey = new Map();\nfor (const story of storySources) {\n  const existing = byStoryKey.get(story.storyKey) || {};\n  byStoryKey.set(story.storyKey, {\n    ...existing,\n    ...story,\n    storyId: existing.storyId || story.storyId,\n    storySummary: existing.storySummary || story.storySummary,\n    storyCorrelationId: existing.storyCorrelationId || story.storyCorrelationId,\n    storyStableLabel: existing.storyStableLabel || story.storyStableLabel,\n    storySelf: existing.storySelf || story.storySelf,\n    storySource: [existing.storySource, story.storySource].filter(Boolean).join(\u0027, \u0027),\n  });\n}\n\nconst storySourceJobId = matchingJob.job_id || null;\nconst stories = Array.from(byStoryKey.values()).sort((left, right) =\u003e left.storyKey.localeCompare(right.storyKey, undefined, { numeric: true }));\nif (!stories.length) throw new Error(\u0027The latest Epics \u0026 User Stories job for project=\u0027 + request.projectName + \u0027 does not contain Jira story references. Story Test Cases cannot be created until user stories exist in Jira.\u0027);\n\nreturn stories.map((story, index) =\u003e ({\n  json: {\n    ...request,\n    storySourceJobId,\n    storySourceCount: stories.length,\n    storyIndex: index + 1,\n    totalStories: stories.length,\n    storyKey: story.storyKey,\n    storyId: story.storyId,\n    storySummary: story.storySummary,\n    storyCorrelationId: story.storyCorrelationId,\n    storyStableLabel: story.storyStableLabel,\n    storySelf: story.storySelf,\n    storySource: story.storySource,\n    storyLink: story.storyKey ? request.jiraBaseUrl + \u0027/browse/\u0027 + story.storyKey : null,\n  }\n}));"
}
```

### Build Story Test Case Delta Targets

| Field | Value |
| --- | --- |
| Node ID | 985996c0-e5b3-41a0-b3db-73c4047b2e39 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Published Story Test Case Links -> Build Story Test Case Delta Targets (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Delta Targets -> Build Story Test Case Progress - Planning Scope (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027Normalize Story Test Case Request\u0027).first().json;\nlet storyItems;\ntry {\n  storyItems = $(\u0027Build Story Source Items\u0027).all();\n} catch {\n  storyItems = $input.all();\n}\nconst allStories = storyItems.map(item =\u003e item.json || {});\nconst persistedLinks = $input.all()\n  .map(item =\u003e item.json || {})\n  .filter(row =\u003e row.story_jira_key || row.storyKey || row.testcase_jira_key || row.testcaseKey);\nconst updateContext = request.updateContext \u0026\u0026 typeof request.updateContext === \u0027object\u0027 ? request.updateContext : {};\nconst retryContext = request.retryContext \u0026\u0026 typeof request.retryContext === \u0027object\u0027 ? request.retryContext : {};\nconst generationMode = String(request.generationMode || \u0027\u0027).toLowerCase();\nconst isUpdate = generationMode === \u0027update\u0027;\nconst isRetry = Boolean(\n  request.retryJobId\n  || request.retryOfJobId\n  || retryContext.retryOfJobId\n  || updateContext.retryRepairSourceJobId\n);\nconst previousLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\nconst previousSummary = updateContext.previousCoverageSummary || {};\nconst updateReasons = Array.isArray(updateContext.updateReasons) ? updateContext.updateReasons.filter(Boolean) : [];\nconst status = String(previousSummary.gateStatus || previousSummary.status || \u0027\u0027).toLowerCase();\n\nfunction keyOf(value) {\n  const key = String(value || \u0027\u0027).trim().toUpperCase();\n  return /^KAN-\\d+$/.test(key) ? key : \u0027\u0027;\n}\n\nfunction addKey(target, value) {\n  const key = keyOf(value);\n  if (key) target.add(key);\n}\n\nfunction collectKeys(value, target, depth = 0) {\n  if (!value || depth \u003e 6) return;\n  if (Array.isArray(value)) {\n    value.forEach(item =\u003e collectKeys(item, target, depth + 1));\n    return;\n  }\n  if (typeof value !== \u0027object\u0027) return;\n  addKey(target, value.storyKey);\n  addKey(target, value.jiraStoryKey);\n  addKey(target, value.sourceStoryKey);\n  addKey(target, value.issueKey);\n  addKey(target, value.key);\n  Object.entries(value).forEach(([field, nested]) =\u003e {\n    if (/testcase|test_case/i.test(field)) return;\n    if (/story|coverage|ledger|repair|publish|batch|mapping/i.test(field)) collectKeys(nested, target, depth + 1);\n  });\n}\n\nfunction rowsFrom(...values) {\n  return values.flatMap(value =\u003e Array.isArray(value) ? value : []);\n}\n\nconst allStoryKeySet = new Set();\nallStories.forEach(story =\u003e addKey(allStoryKeySet, story.storyKey || story.jiraStoryKey || story.key || story.issueKey));\n\nconst persistedLinksByStory = new Map();\npersistedLinks.forEach(link =\u003e {\n  const key = keyOf(link.story_jira_key || link.storyKey || link.jiraStoryKey || link.sourceStoryKey);\n  const testKey = String(link.testcase_jira_key || link.testcaseKey || link.testCaseKey || \u0027\u0027).trim();\n  if (!key || !testKey) return;\n  if (!persistedLinksByStory.has(key)) persistedLinksByStory.set(key, []);\n  persistedLinksByStory.get(key).push(link);\n});\n\nfunction durableLedgerFromPersistedLinks() {\n  return allStories.map((story, index) =\u003e {\n    const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);\n    const links = persistedLinksByStory.get(key) || [];\n    const testCaseKeys = [...new Set(links.map(link =\u003e String(link.testcase_jira_key || link.testcaseKey || link.testCaseKey || \u0027\u0027).trim()).filter(Boolean))];\n    return {\n      coverageId: \u0027STC-COV-\u0027 + String(index + 1).padStart(3, \u00270\u0027),\n      storyKey: key || story.storyKey,\n      storyId: story.storyId || story.issueId || null,\n      storySummary: story.storySummary || story.summary || key || \u0027Jira story\u0027,\n      storyCorrelationId: story.storyCorrelationId || null,\n      requirement: story.storySummary || story.summary || key || \u0027Jira story\u0027,\n      sourceReference: key ? \u0027Jira Story \u0027 + key : \u0027Jira Story\u0027,\n      includedInOutput: testCaseKeys.length + \u0027 persisted Jira test cases\u0027,\n      generatedTestCases: testCaseKeys.length,\n      plannedTestCases: testCaseKeys.length,\n      mappingCount: testCaseKeys.length,\n      testcaseKeys: testCaseKeys,\n      coverageStatus: testCaseKeys.length ? \u0027covered\u0027 : \u0027missing\u0027,\n      status: testCaseKeys.length ? \u0027covered\u0027 : \u0027missing\u0027,\n      categoriesCovered: [],\n      missingCategories: [],\n      plannedCategories: [],\n      notes: testCaseKeys.length\n        ? \u0027Coverage reused from persisted Jira story-to-test-case mappings.\u0027\n        : \u0027No persisted Jira story-to-test-case mappings found.\u0027,\n      action: \u0027reused\u0027,\n      reusedFromPersistedMappings: true,\n    };\n  });\n}\n\nconst baselineKeys = new Set();\ncollectKeys(previousLedger, baselineKeys);\ncollectKeys(updateContext.previousStoryKeys, baselineKeys);\ncollectKeys(updateContext.previousBatchSummary, baselineKeys);\ncollectKeys(updateContext.previousUpdateSummary, baselineKeys);\ncollectKeys(updateContext.previousStories, baselineKeys);\n\nconst explicitRepairRows = rowsFrom(\n  updateContext.retryRepairTargets,\n  updateContext.repairTargets,\n  updateContext.publishGaps,\n  updateContext.previousUpdateSummary?.repairTargets,\n  updateContext.previousUpdateSummary?.publishGaps,\n  retryContext.repairTargets,\n  retryContext.publishGaps,\n);\nconst explicitRepairKeys = new Set();\ncollectKeys(explicitRepairRows, explicitRepairKeys);\n\nconst changedKeys = new Set();\nrowsFrom(updateContext.changedStories, updateContext.updatedStories, updateContext.deltaStories).forEach(row =\u003e collectKeys(row, changedKeys));\nupdateReasons.forEach(reason =\u003e {\n  String(reason || \u0027\u0027).match(/KAN-\\d+/gi)?.forEach(key =\u003e addKey(changedKeys, key));\n});\n\nconst rowByStory = new Map();\npreviousLedger.forEach(row =\u003e {\n  const key = keyOf(row.storyKey || row.sourceStoryKey || row.jiraStoryKey || row.issueKey || row.key);\n  if (key) rowByStory.set(key, row);\n});\n\nfunction rowNeedsRepair(row) {\n  if (!row) return false;\n  const rowStatus = String(row.coverageStatus || row.status || row.gateStatus || \u0027\u0027).toLowerCase();\n  return /partial|missing|unknown|review|gap|failed|warning|publish/i.test(rowStatus)\n    || Number(row.missingPublishedCases || 0) \u003e 0\n    || (Array.isArray(row.missingCategories) \u0026\u0026 row.missingCategories.length \u003e 0)\n    || Boolean(row.publishGap);\n}\n\nconst needsRepairKeys = new Set();\npreviousLedger.forEach(row =\u003e {\n  if (rowNeedsRepair(row)) addKey(needsRepairKeys, row.storyKey || row.sourceStoryKey || row.jiraStoryKey || row.issueKey || row.key);\n});\n\nconst newStoryKeys = new Set();\nif (baselineKeys.size) {\n  allStories.forEach(story =\u003e {\n    const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);\n    if (key \u0026\u0026 !baselineKeys.has(key)) newStoryKeys.add(key);\n  });\n}\n\nconst sourceChanged = Boolean(updateContext.contextUpdated) || updateReasons.length \u003e 0 || changedKeys.size \u003e 0;\nconst isClean = previousLedger.length \u003e 0\n  \u0026\u0026 ![\u0027warning\u0027, \u0027failed\u0027, \u0027not_reported\u0027].includes(status)\n  \u0026\u0026 (Number(previousSummary.missingCount) || 0) === 0\n  \u0026\u0026 (Number(previousSummary.partialCount) || 0) === 0\n  \u0026\u0026 (Number(previousSummary.unknownCount) || 0) === 0\n  \u0026\u0026 needsRepairKeys.size === 0;\n\nif (!isUpdate) {\n  return allStories.map(story =\u003e ({ json: { ...story, noWork: false, deltaDecision: { version: \u0027stc-delta-scope-v2\u0027, noModelRequired: false, reason: \u0027Create mode generates full Story Test Case coverage.\u0027, selectedStoryCount: allStories.length, sourceStoryCount: allStories.length } } }));\n}\n\nconst persistedMappingsCoverAllStories = allStoryKeySet.size \u003e 0\n  \u0026\u0026 persistedLinksByStory.size \u003e 0\n  \u0026\u0026 Array.from(allStoryKeySet).every(key =\u003e (persistedLinksByStory.get(key) || []).length \u003e 0);\nif (isRetry \u0026\u0026 isUpdate \u0026\u0026 persistedMappingsCoverAllStories) {\n  const durableLedger = durableLedgerFromPersistedLinks();\n  const totalMappings = durableLedger.reduce((sum, row) =\u003e sum + (Number(row.mappingCount) || 0), 0);\n  const durableUpdateContext = {\n    ...updateContext,\n    previousCoverageLedger: durableLedger,\n    previousCoverageSummary: {\n      ...(previousSummary || {}),\n      status: \u0027passed\u0027,\n      gateStatus: \u0027passed\u0027,\n      total: durableLedger.length,\n      coverageLedgerCount: durableLedger.length,\n      covered: durableLedger.length,\n      coveredCount: durableLedger.length,\n      partial: 0,\n      partialCount: 0,\n      missing: 0,\n      missingCount: 0,\n      unknownCount: 0,\n      score: 100,\n      message: \u0027Persisted Jira story-to-test-case mappings already cover all current stories.\u0027,\n    },\n    previousBatchSummary: {\n      ...(updateContext.previousBatchSummary || {}),\n      totalBatches: durableLedger.length,\n      completedBatches: durableLedger.length,\n      partialBatches: 0,\n      missingBatches: 0,\n      reusedFromPersistedMappings: true,\n    },\n    persistedMappingBaseline: {\n      source: \u0027qa_story_testcase_links\u0027,\n      storyCount: durableLedger.length,\n      mappingCount: totalMappings,\n      sourceJobIds: [...new Set(persistedLinks.map(link =\u003e String(link.job_id || link.jobId || \u0027\u0027).trim()).filter(Boolean))],\n    },\n  };\n  return [{\n    json: {\n      ...request,\n      updateContext: durableUpdateContext,\n      noWork: true,\n      allStories,\n      storySourceJobId: allStories[0]?.storySourceJobId || null,\n      storySourceCount: allStories.length,\n      persistedLinkCount: totalMappings,\n      deltaDecision: {\n        version: \u0027stc-delta-scope-v3\u0027,\n        noModelRequired: true,\n        reason: explicitRepairKeys.size\n          ? \u0027Persisted Jira story-to-test-case mappings already cover all current stories, including retry repair targets; retry can preserve existing coverage without model generation.\u0027\n          : \u0027Persisted Jira story-to-test-case mappings already cover all current stories; retry can preserve existing coverage without model generation.\u0027,\n        previousCoverageRows: durableLedger.length,\n        sourceStoryCount: allStories.length,\n        persistedLinkCount: totalMappings,\n        explicitRepairTargetCount: explicitRepairKeys.size,\n        persistedMappingBaseline: true,\n      },\n    },\n  }];\n}\n\nif (isClean \u0026\u0026 !sourceChanged \u0026\u0026 !newStoryKeys.size \u0026\u0026 !explicitRepairKeys.size) {\n  return [{ json: { ...request, noWork: true, allStories, storySourceJobId: allStories[0]?.storySourceJobId || null, storySourceCount: allStories.length, deltaDecision: { version: \u0027stc-delta-scope-v2\u0027, noModelRequired: true, reason: \u0027Previous Story Test Case coverage is clean and no source deltas were reported.\u0027, previousCoverageRows: previousLedger.length, sourceStoryCount: allStories.length } } }];\n}\n\nconst selectedKeys = new Set();\nexplicitRepairKeys.forEach(key =\u003e selectedKeys.add(key));\nneedsRepairKeys.forEach(key =\u003e selectedKeys.add(key));\nnewStoryKeys.forEach(key =\u003e selectedKeys.add(key));\nchangedKeys.forEach(key =\u003e selectedKeys.add(key));\n\nif (!selectedKeys.size \u0026\u0026 !baselineKeys.size \u0026\u0026 !previousLedger.length) {\n  throw new Error(\u0027STC delta scope unavailable: previous story coverage baseline was not available, so Q-Ops refused to run a full update regeneration. Retry after the prior STC output or repair targets are available.\u0027);\n}\n\nif (!selectedKeys.size) {\n  return [{ json: { ...request, noWork: true, allStories, storySourceJobId: allStories[0]?.storySourceJobId || null, storySourceCount: allStories.length, deltaDecision: { version: \u0027stc-delta-scope-v2\u0027, noModelRequired: true, reason: \u0027No missing, partial, new, or changed stories were detected for this STC update.\u0027, previousCoverageRows: previousLedger.length, sourceStoryCount: allStories.length } } }];\n}\n\nconst selected = allStories.filter(story =\u003e selectedKeys.has(keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey)));\n\nif (!selected.length) {\n  throw new Error(\u0027STC delta scope unavailable: selected repair story IDs were not found in live Jira source stories. Target stories: \u0027 + Array.from(selectedKeys).join(\u0027, \u0027));\n}\n\nif (isRetry \u0026\u0026 selected.length === allStories.length \u0026\u0026 allStories.length \u003e 6 \u0026\u0026 !explicitRepairKeys.size) {\n  throw new Error(\u0027STC retry scope unsafe: retry would regenerate all \u0027 + allStories.length + \u0027 stories because no explicit repair targets were available. Q-Ops stopped before model work to avoid unnecessary token/cost spend.\u0027);\n}\n\nreturn selected.map(story =\u003e {\n  const key = keyOf(story.storyKey || story.jiraStoryKey || story.key || story.issueKey);\n  const repairRow = rowByStory.get(key) || explicitRepairRows.find(row =\u003e keyOf(row.storyKey || row.jiraStoryKey || row.sourceStoryKey || row.issueKey || row.key) === key) || null;\n  return { json: { ...story, noWork: false, deltaDecision: { version: \u0027stc-delta-scope-v2\u0027, noModelRequired: false, reason: newStoryKeys.has(key) ? \u0027New Jira story detected after backlog update.\u0027 : rowNeedsRepair(repairRow) ? \u0027Story has missing, partial, or publish-gap coverage.\u0027 : changedKeys.has(key) ? \u0027Story matched source update context.\u0027 : \u0027Story selected by explicit retry repair target.\u0027, selectedStoryCount: selected.length, sourceStoryCount: allStories.length, baselineStoryCount: baselineKeys.size, retryRepairTargetCount: explicitRepairKeys.size, updateReasons } } };\n});"
}
```

### Build Story Test Case Detail Batches

| Field | Value |
| --- | --- |
| Node ID | 72b97599-e405-4d8b-a67d-b0ed413eab01 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3712, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Planning Coverage -> Build Story Test Case Detail Batches (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Detail Batches -> Story Test Case Batch Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const plannerItems = $input.all().map(item =\u003e item.json || {});\nconst NL = String.fromCharCode(10);\nconst batchSize = 8;\nfunction buildSystemMessage() {\n  return [\n    \u0027You are a Senior QA Test Architect expanding an approved coverage plan into Jira-ready test cases.\u0027,\n    \u0027Return one valid JSON object only. No markdown. No prose outside JSON.\u0027,\n    \u0027Generate details only for the exact testCaseId values supplied in this batch.\u0027,\n    \u0027Do not add new IDs. Do not omit requested IDs.\u0027,\n    \u0027Preserve each supplied coverageCategory, testLevel, testCategory, priority, riskLevel, testType, requirementReference, and automationFeasibility unless the story details clearly require a safer correction.\u0027,\n    \u0027Use this exact schema:\u0027,\n    \u0027{\u0027,\n    \u0027  \"storyKey\": \"KAN-123\",\u0027,\n    \u0027  \"batchIndex\": 1,\u0027,\n    \u0027  \"testCases\": [\u0027,\n    \u0027    {\u0027,\n    \u0027      \"testCaseId\": \"TC-001\",\u0027,\n    \u0027      \"summary\": \"Short Jira-ready test case title\",\u0027,\n    \u0027      \"objective\": \"Why this test exists\",\u0027,\n    \u0027      \"coverageCategory\": \"Positive\",\u0027,\n    \u0027      \"requirementReference\": \"Acceptance criterion or story detail covered\",\u0027,\n    \u0027      \"testLevel\": \"UI\",\u0027,\n    \u0027      \"testCategory\": \"Positive\",\u0027,\n    \u0027      \"preconditions\": [\"...\"],\u0027,\n    \u0027      \"testSteps\": [\"Step 1\", \"Step 2\", \"Step 3\"],\u0027,\n    \u0027      \"testData\": [\"...\"],\u0027,\n    \u0027      \"expectedResult\": \"Observable outcome\",\u0027,\n    \u0027      \"priority\": \"High\",\u0027,\n    \u0027      \"riskLevel\": \"High\",\u0027,\n    \u0027      \"testType\": \"functional\",\u0027,\n    \u0027      \"automationFeasibility\": \"High\",\u0027,\n    \u0027      \"acceptanceCriteriaCovered\": [\"...\"],\u0027,\n    \u0027      \"notes\": [\"...\"]\u0027,\n    \u0027    }\u0027,\n    \u0027  ]\u0027,\n    \u0027}\u0027,\n    \u0027Every test case must have at least 3 concrete testSteps and a non-empty expectedResult.\u0027,\n    \u0027Prefer complete valid JSON over verbosity. Keep each field concise but execution-ready.\u0027\n  ].join(NL);\n}\nfunction planLine(plan) {\n  return [plan.testCaseId, plan.coverageCategory, plan.testLevel, plan.priority, plan.riskLevel, plan.summary, \u0027Requirement: \u0027 + plan.requirementReference, \u0027Intent: \u0027 + plan.coverageIntent].join(\u0027 | \u0027);\n}\n\nreturn plannerItems.flatMap((source) =\u003e {\n  const plan = Array.isArray(source.coveragePlan) ? source.coveragePlan : [];\n  const batches = [];\n  for (let start = 0; start \u003c plan.length; start += batchSize) {\n    const planItems = plan.slice(start, start + batchSize);\n    const batchIndex = Math.floor(start / batchSize) + 1;\n    const batchCount = Math.ceil(plan.length / batchSize);\n    const system = buildSystemMessage();\n    const user = [\n      \u0027Project: \u0027 + source.projectName,\n      \u0027Story Key: \u0027 + source.storyKey,\n      \u0027Story Summary: \u0027 + source.storySummary,\n      \u0027Story Correlation ID: \u0027 + (source.storyCorrelationId || \u0027N/A\u0027),\n      \u0027Batch: \u0027 + batchIndex + \u0027 of \u0027 + batchCount,\n      \u0027\u0027,\n      \u0027Story Description:\u0027,\n      source.storyDescriptionText || \u0027No Jira description was available.\u0027,\n      \u0027\u0027,\n      \u0027Approved coverage plan slice. Expand these exact IDs only:\u0027,\n      ...planItems.map(planLine)\n    ].join(NL);\n    batches.push({ json: { ...source, batchIndex, batchCount, batchStart: start + 1, batchEnd: start + planItems.length, batchSize: planItems.length, planItems, system, user, detailBatch: true } });\n  }\n  return batches;\n});"
}
```

### Build Story Test Case No-Change Result

| Field | Value |
| --- | --- |
| Node ID | deeec54c-3fc2-4c7d-9db7-e829d815364f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 13152, -336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Delta Has No Work? -> Build Story Test Case No-Change Result (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case No-Change Result -> Build Direct Story Test Case Completion Output (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const item = $json || {};\nconst updateContext = item.updateContext \u0026\u0026 typeof item.updateContext === \u0027object\u0027 ? item.updateContext : {};\nconst previousLedger = Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [];\nconst previousSummary = updateContext.previousCoverageSummary || {};\nconst previousBatch = updateContext.previousBatchSummary || {};\nconst previousTokenUsage = updateContext.previousTokenUsage || {};\nconst baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || 0) || 0;\nconst baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;\nconst stories = Array.isArray(item.allStories) ? item.allStories : [];\nconst coverageLedger = previousLedger.map((row, index) =\u003e ({\n  ...row,\n  coverageId: row.coverageId || \u0027STC-COV-\u0027 + String(index + 1).padStart(3, \u00270\u0027),\n  coverageStatus: row.coverageStatus || row.status || \u0027covered\u0027,\n  status: row.status || row.coverageStatus || \u0027covered\u0027,\n  action: row.action || \u0027reused\u0027\n}));\nconst covered = coverageLedger.filter(row =\u003e String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase() === \u0027covered\u0027).length;\nconst partial = coverageLedger.filter(row =\u003e /partial|review/i.test(String(row.coverageStatus || row.status || \u0027\u0027))).length;\nconst missing = coverageLedger.filter(row =\u003e /missing|unknown|gap/i.test(String(row.coverageStatus || row.status || \u0027\u0027))).length;\nconst coverageSummary = {\n  ...previousSummary,\n  status: missing ? \u0027failed\u0027 : partial ? \u0027warning\u0027 : \u0027passed\u0027,\n  gateStatus: missing ? \u0027failed\u0027 : partial ? \u0027warning\u0027 : \u0027passed\u0027,\n  total: coverageLedger.length || stories.length,\n  coverageLedgerCount: coverageLedger.length || stories.length,\n  covered,\n  coveredCount: covered,\n  partial,\n  partialCount: partial,\n  missing,\n  missingCount: missing,\n  score: coverageLedger.length ? Math.round(((covered + partial * 0.5) / coverageLedger.length) * 100) : 100,\n  message: \u0027Existing Jira Story Test Case coverage was reused; no model generation was required.\u0027\n};\nconst batchSummary = {\n  ...previousBatch,\n  totalBatches: Number(previousBatch.totalBatches || 0),\n  completedBatches: Number(previousBatch.completedBatches || 0),\n  partialBatches: partial,\n  missingBatches: missing,\n  reusedFromPreviousUpdate: true\n};\nconst updateSummary = {\n  enabled: true,\n  version: \u0027stc-delta-update-v1\u0027,\n  documentType: \u0027story_test_cases\u0027,\n  mode: \u0027update\u0027,\n  deltaMode: true,\n  noChangesDetected: true,\n  noModelRequired: true,\n  updateOfJobId: updateContext.previousJobId || null,\n  sourceStoryCount: stories.length,\n  reusedStoryCount: stories.length,\n  createdTestCaseCount: 0,\n  updatedTestCaseCount: 0,\n  reusedTestCaseCount: coverageLedger.reduce((sum, row) =\u003e sum + (Number(row.generatedTestCases || row.linkedTestCases || row.testCaseCount || 0) || 0), 0),\n  tokenUsage: { source: \u0027no_model_delta_gate\u0027, input: 0, output: 0, total: 0, estimatedCostUsd: 0 },\n  previousTokenUsage,\n  tokenSavings: {\n    estimatedBaselineTokens: baselineTokens || null,\n    estimatedTokensSaved: baselineTokens,\n    estimatedBaselineCostUsd: baselineCost || null,\n    estimatedCostSavedUsd: baselineCost,\n    estimatedSavingsPercent: baselineTokens ? 100 : null\n  },\n  message: \u0027Existing Jira Story Test Cases already cover the current stories. Q-Ops reused the previous coverage without invoking the Story Test Case model.\u0027\n};\nreturn [{ json: {\n  documentType: \u0027story_test_cases\u0027,\n  jobId: item.jobId,\n  projectId: item.projectId,\n  projectName: item.projectName,\n  generationMode: \u0027update\u0027,\n  updateContext,\n  updateOfJobId: updateContext.previousJobId || null,\n  retryOfJobId: item.retryOfJobId || null,\n  sourceUserStoryJobId: item.storySourceJobId || null,\n  stories,\n  testCases: [],\n  mappings: [],\n  categoryDistribution: {},\n  coverageSummary,\n  batchSummary,\n  coverageLedger,\n  qualityGate: { passed: !missing, status: coverageSummary.gateStatus, coverageSummary, coverageLedger, batchSummary, updateSummary },\n  jira: { projectKey: item.jiraProjectKey, created: 0, updated: 0, reused: updateSummary.reusedTestCaseCount },\n  updateSummary,\n  wordCount: 0,\n  tokensInput: 0,\n  tokensOutput: 0,\n  tokensTotal: 0,\n  estimatedCostUsd: 0\n} }];"
}
```

### Build Story Test Case Progress - Finalizing Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-code-finalizing_coverage |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 12480, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upsert Story Test Case Mapping -> Build Story Test Case Progress - Finalizing Coverage (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Finalizing Coverage -> Persist Story Test Case Progress - Finalizing Coverage (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction countByStatus(pattern) {\n  const regex = new RegExp(pattern, \u0027i\u0027);\n  return rows.filter(row =\u003e regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || \u0027\u0027))).length;\n}\n\nfunction plannedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);\n    if (direct) return sum + direct;\n    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(planned, cases, generated, 0);\n  }, 0);\n}\n\nfunction generatedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);\n    if (direct) return sum + direct;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(cases, generated, 0);\n  }, 0);\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testCaseKey || row.jiraKey || row.issueKey || row.key));\nconst plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();\nconst generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \"finalizing_coverage\",\n    stageLabel: \"Finalizing Coverage\",\n    group: \"finalizing\",\n    progressPercent: 92,\n    summary: \"Q-Ops is saving traceability mappings and calculating final coverage.\",\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      plannedTestCaseCount,\n      generatedTestCaseCount,\n      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),\n      linkedTestCaseCount: countByStatus(\u0027linked|existing\u0027),\n      createdTestCaseCount: countByStatus(\u0027created|create\u0027),\n      reusedTestCaseCount: countByStatus(\u0027reused|existing\u0027),\n      updatedTestCaseCount: countByStatus(\u0027updated|update\u0027),\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Progress - Generating Test Cases

| Field | Value |
| --- | --- |
| Node ID | stc-progress-code-generating_test_cases |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5760, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Story Test Case Batches -> Build Story Test Case Progress - Generating Test Cases (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Generating Test Cases -> Persist Story Test Case Progress - Generating Test Cases (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction countByStatus(pattern) {\n  const regex = new RegExp(pattern, \u0027i\u0027);\n  return rows.filter(row =\u003e regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || \u0027\u0027))).length;\n}\n\nfunction plannedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);\n    if (direct) return sum + direct;\n    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(planned, cases, generated, 0);\n  }, 0);\n}\n\nfunction generatedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);\n    if (direct) return sum + direct;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(cases, generated, 0);\n  }, 0);\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testCaseKey || row.jiraKey || row.issueKey || row.key));\nconst plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();\nconst generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \"generating_test_cases\",\n    stageLabel: \"Generating Test Cases\",\n    group: \"generating\",\n    progressPercent: 56,\n    summary: \"Q-Ops generated batched Jira-ready test cases and is preparing the publish checkpoint.\",\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      plannedTestCaseCount,\n      generatedTestCaseCount,\n      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),\n      linkedTestCaseCount: countByStatus(\u0027linked|existing\u0027),\n      createdTestCaseCount: countByStatus(\u0027created|create\u0027),\n      reusedTestCaseCount: countByStatus(\u0027reused|existing\u0027),\n      updatedTestCaseCount: countByStatus(\u0027updated|update\u0027),\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Progress - Linking Traceability

| Field | Value |
| --- | --- |
| Node ID | stc-progress-code-linking_traceability |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 10240, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Recover Story Test Case Publish Checkpoint Items -> Build Story Test Case Progress - Linking Traceability (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Linking Traceability -> Persist Story Test Case Progress - Linking Traceability (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction countByStatus(pattern) {\n  const regex = new RegExp(pattern, \u0027i\u0027);\n  return rows.filter(row =\u003e regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || \u0027\u0027))).length;\n}\n\nfunction plannedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);\n    if (direct) return sum + direct;\n    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(planned, cases, generated, 0);\n  }, 0);\n}\n\nfunction generatedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);\n    if (direct) return sum + direct;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(cases, generated, 0);\n  }, 0);\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testCaseKey || row.jiraKey || row.issueKey || row.key));\nconst plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();\nconst generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \"linking_traceability\",\n    stageLabel: \"Linking Traceability\",\n    group: \"publishing\",\n    progressPercent: 78,\n    summary: \"Q-Ops is verifying story links and reusing existing links where possible.\",\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      plannedTestCaseCount,\n      generatedTestCaseCount,\n      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),\n      linkedTestCaseCount: countByStatus(\u0027linked|existing\u0027),\n      createdTestCaseCount: countByStatus(\u0027created|create\u0027),\n      reusedTestCaseCount: countByStatus(\u0027reused|existing\u0027),\n      updatedTestCaseCount: countByStatus(\u0027updated|update\u0027),\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Progress - Planning Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-code-planning_coverage |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3040, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Robust Story Test Case Parser -> Build Story Test Case Progress - Planning Coverage (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Planning Coverage -> Persist Story Test Case Progress - Planning Coverage (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction countByStatus(pattern) {\n  const regex = new RegExp(pattern, \u0027i\u0027);\n  return rows.filter(row =\u003e regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || \u0027\u0027))).length;\n}\n\nfunction plannedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);\n    if (direct) return sum + direct;\n    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(planned, cases, generated, 0);\n  }, 0);\n}\n\nfunction generatedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);\n    if (direct) return sum + direct;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(cases, generated, 0);\n  }, 0);\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testCaseKey || row.jiraKey || row.issueKey || row.key));\nconst plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();\nconst generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \"planning_coverage\",\n    stageLabel: \"Planning Coverage\",\n    group: \"planning\",\n    progressPercent: 34,\n    summary: \"Q-Ops prepared story-level coverage plans and category targets.\",\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      plannedTestCaseCount,\n      generatedTestCaseCount,\n      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),\n      linkedTestCaseCount: countByStatus(\u0027linked|existing\u0027),\n      createdTestCaseCount: countByStatus(\u0027created|create\u0027),\n      reusedTestCaseCount: countByStatus(\u0027reused|existing\u0027),\n      updatedTestCaseCount: countByStatus(\u0027updated|update\u0027),\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Progress - Planning Scope

| Field | Value |
| --- | --- |
| Node ID | stc-progress-code-planning_scope |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Delta Targets -> Build Story Test Case Progress - Planning Scope (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Planning Scope -> Persist Story Test Case Progress - Planning Scope (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction countByStatus(pattern) {\n  const regex = new RegExp(pattern, \u0027i\u0027);\n  return rows.filter(row =\u003e regex.test(String(row.action || row.publishAction || row.linkStatus || row.status || \u0027\u0027))).length;\n}\n\nfunction plannedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.plannedTestCases || row.expectedTestCases);\n    if (direct) return sum + direct;\n    const planned = Array.isArray(row.plannedTestCases) ? row.plannedTestCases.length : 0;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(planned, cases, generated, 0);\n  }, 0);\n}\n\nfunction generatedCount() {\n  return rows.reduce((sum, row) =\u003e {\n    const direct = compactNumber(row.generatedTestCaseCount || row.generatedTestCasesCount || row.testcaseCount || row.testCaseCount);\n    if (direct) return sum + direct;\n    const cases = Array.isArray(row.testCases) ? row.testCases.length : 0;\n    const generated = Array.isArray(row.generatedTestCases) ? row.generatedTestCases.length : 0;\n    return sum + Math.max(cases, generated, 0);\n  }, 0);\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testCaseKey || row.jiraKey || row.issueKey || row.key));\nconst plannedTestCaseCount = compactNumber(first.plannedTestCaseCount || first.usageCheckpoint?.plannedTestCaseCount) || plannedCount();\nconst generatedTestCaseCount = compactNumber(first.generatedTestCaseCount || first.testcaseCount || first.usageCheckpoint?.generatedTestCaseCount) || generatedCount();\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \"planning_scope\",\n    stageLabel: \"Planning Scope\",\n    group: \"preparing\",\n    progressPercent: 18,\n    summary: \"Q-Ops loaded Jira stories and is deciding which stories need Story Test Case coverage.\",\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      plannedTestCaseCount,\n      generatedTestCaseCount,\n      publishedTestCaseCount: testCaseKeys.length || compactNumber(first.publishedTestCaseCount),\n      linkedTestCaseCount: countByStatus(\u0027linked|existing\u0027),\n      createdTestCaseCount: countByStatus(\u0027created|create\u0027),\n      reusedTestCaseCount: countByStatus(\u0027reused|existing\u0027),\n      updatedTestCaseCount: countByStatus(\u0027updated|update\u0027),\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Progress - Updating Existing Jira

| Field | Value |
| --- | --- |
| Node ID | 56a5cf8e-4119-4f39-bb7d-14936fdaca57 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 7920, -16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Existing Story Test Case Update Request -> Build Story Test Case Progress - Updating Existing Jira (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Progress - Updating Existing Jira -> Persist Story Test Case Progress - Updating Existing Jira (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $input.all();\nconst rows = sourceItems.map(item =\u003e item.json || {});\nconst first = rows[0] || {};\n\nfunction compactNumber(value) {\n  const number = Number(value);\n  return Number.isFinite(number) \u0026\u0026 number \u003e 0 ? number : 0;\n}\n\nfunction uniqueValues(values) {\n  return [...new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nconst storyKeys = uniqueValues(rows.map(row =\u003e row.storyKey || row.issueKey || row.jiraStoryKey || row.key));\nconst testCaseKeys = uniqueValues(rows.map(row =\u003e row.testcaseKey || row.testCaseKey || row.jiraKey || row.key));\nconst output = {\n  documentType: \u0027story_test_cases\u0027,\n  generationMode: first.generationMode || first.mode || first.input?.generationMode || null,\n  retryOfJobId: first.retryOfJobId || first.retry_of_job_id || null,\n  updateOfJobId: first.updateOfJobId || first.updateContext?.previousJobId || null,\n  progress: {\n    version: \u0027stc-progress-v1\u0027,\n    stage: \u0027updating_existing_jira_test_cases\u0027,\n    stageLabel: \u0027Updating Existing Jira Test Cases\u0027,\n    group: \u0027publishing\u0027,\n    progressPercent: 72,\n    summary: \u0027Q-Ops found existing Jira test cases and is updating only the changed reusable issues before link verification.\u0027,\n    updatedAt: new Date().toISOString(),\n    details: {\n      sourceStoryCount: compactNumber(first.sourceStoryCount || first.totalStories || first.allStoryCount) || storyKeys.length || rows.length,\n      selectedStoryCount: compactNumber(first.selectedStoryCount || first.deltaStoryCount) || storyKeys.length || rows.length,\n      storyCount: storyKeys.length || compactNumber(first.storyCount),\n      existingUpdateTotal: rows.length,\n      updatedTestCaseCount: rows.length,\n      testCaseCount: testCaseKeys.length || rows.length,\n      itemCount: rows.length,\n    },\n  },\n};\n\nif (first.usageCheckpoint) output.usageCheckpoint = first.usageCheckpoint;\nif (first.tokenUsage) output.tokenUsage = first.tokenUsage;\nif (first.tokensInput !== undefined) output.tokensInput = first.tokensInput;\nif (first.tokensOutput !== undefined) output.tokensOutput = first.tokensOutput;\nif (first.tokensTotal !== undefined) output.tokensTotal = first.tokensTotal;\nif (first.estimatedCostUsd !== undefined) output.estimatedCostUsd = first.estimatedCostUsd;\nif (first.wordCount !== undefined) output.wordCount = first.wordCount;\nif (first.usageCheckpoint || first.tokenUsage || first.tokensTotal) output.failedUsageAvailable = true;\n\nreturn sourceItems.map(item =\u003e ({\n  ...item,\n  json: {\n    ...(item.json || {}),\n    progress: output.progress,\n    progressOutput: output,\n  },\n}));"
}
```

### Build Story Test Case Usage Checkpoint

| Field | Value |
| --- | --- |
| Node ID | 84b19983-2919-40fd-89d9-9c2a1a9d2a6a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 6432, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Generating Test Cases -> Build Story Test Case Usage Checkpoint (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Usage Checkpoint -> Persist Story Test Case Usage Checkpoint (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all().map(item =\u003e item.json || {});\nif (!items.length) return [];\n\nconst first = items[0] || {};\nconst stories = items.map(item =\u003e ({\n  storyKey: item.storyKey,\n  storyId: item.storyId || null,\n  storySummary: item.storySummary || item.storyKey,\n  plannedTestCaseCount: Number(item.plannedTestCaseCount || item.testCaseCount || 0) || 0,\n  generatedTestCaseCount: Array.isArray(item.parsed?.testCases) ? item.parsed.testCases.length : Number(item.testCaseCount || 0) || 0,\n  categoryDistribution: item.categoryDistribution || {},\n})).filter(item =\u003e item.storyKey);\n\nconst wordCount = items.reduce((sum, item) =\u003e sum + Number(item.storyWordCount || 0), 0);\nconst tokensInput = items.reduce((sum, item) =\u003e sum + Number(item.storyTokensInput || 0), 0);\nconst tokensOutput = items.reduce((sum, item) =\u003e sum + Number(item.storyTokensOutput || 0), 0);\nconst estimatedCostUsd = Number(items.reduce((sum, item) =\u003e sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));\nconst tokensTotal = tokensInput + tokensOutput;\nconst tokenUsage = {\n  source: \u0027story_testcase_generation_checkpoint\u0027,\n  stage: \u0027pre_jira_publish\u0027,\n  model: first.generationModel || null,\n  input: tokensInput,\n  output: tokensOutput,\n  total: tokensTotal,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n};\nconst usageCheckpoint = {\n  version: \u0027stc-failed-usage-checkpoint-v1\u0027,\n  stage: \u0027pre_jira_publish\u0027,\n  capturedAt: new Date().toISOString(),\n  storyCount: stories.length,\n  plannedTestCaseCount: stories.reduce((sum, story) =\u003e sum + story.plannedTestCaseCount, 0),\n  generatedTestCaseCount: stories.reduce((sum, story) =\u003e sum + story.generatedTestCaseCount, 0),\n  wordCount,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n  tokenUsage,\n  stories,\n};\n\n\n\nconst progress = {\n  version: \u0027stc-progress-v1\u0027,\n  stage: \u0027publishing_to_jira\u0027,\n  stageLabel: \u0027Publishing to Jira\u0027,\n  group: \u0027publishing\u0027,\n  progressPercent: 66,\n  summary: \u0027Generated test cases are checkpointed. Q-Ops is creating, reusing, or updating Jira test cases.\u0027,\n  updatedAt: new Date().toISOString(),\n  details: {\n    sourceStoryCount: Number(first.sourceStoryCount || first.totalStories || first.allStoryCount || 0) || stories.length || items.length,\n    selectedStoryCount: Number(first.selectedStoryCount || first.deltaStoryCount || first.storyCount || 0) || stories.length || items.length,\n    plannedTestCaseCount: Number(first.plannedTestCaseCount || first.expectedTestCaseCount || usageCheckpoint.plannedTestCaseCount || 0) || 0,\n    generatedTestCaseCount: Number(first.generatedTestCaseCount || first.testcaseCount || first.testCaseCount || usageCheckpoint.generatedTestCaseCount || 0) || 0,\n    itemCount: usageCheckpoint.generatedTestCaseCount || items.reduce((sum, item) =\u003e sum + (Array.isArray(item.testCases) ? item.testCases.length : 0), 0),\n  },\n};\n\nreturn items.map(item =\u003e ({ json: { ...item, usageCheckpoint, tokenUsage, progress, progressOutput: { documentType: \u0027story_test_cases\u0027, destination: { type: \u0027jira_test_cases\u0027, projectId: item.projectId || first.projectId || null }, checkpoint: \u0027story_testcase_generation_complete_pre_publish\u0027, progress, usageCheckpoint, tokenUsage, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd, generationMode: item.generationMode || first.generationMode || null, updateOfJobId: item.updateContext?.previousJobId || first.updateContext?.previousJobId || null, retryOfJobId: item.retryOfJobId || first.retryOfJobId || null, sourceUserStoryJobId: item.storySourceJobId || first.storySourceJobId || null, failedUsageAvailable: true }, wordCount, tokensInput, tokensOutput, tokensTotal, estimatedCostUsd } }));"
}
```

### Create Jira Test Case

| Field | Value |
| --- | --- |
| Node ID | 0069985d-3a8f-42d6-bb70-c4a307359371 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 9344, -140 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Create Request -> Create Jira Test Case (output 0, input 0)

**Outgoing Connections**

- Create Jira Test Case -> Normalize Created Story Test Case (output 0, input 0)

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
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/issue\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.createIssueBody) }}",
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  2500
                                               }
                                 }
                }
}
```

### Detect Existing Story Test Case Link

| Field | Value |
| --- | --- |
| Node ID | d1cb9768-3c6d-455f-9fa6-e36543eba52d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 11360, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Existing Test Case Story Links -> Detect Existing Story Test Case Link (output 0, input 0)

**Outgoing Connections**

- Detect Existing Story Test Case Link -> Story Test Case Link Needed? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $(\u0027Prepare Story Test Case Link Check Request\u0027).all().map((item) =\u003e item.json || {});\nconst issueItems = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nfunction linkedToStory(issue, storyKey) {\n  const target = String(storyKey || \u0027\u0027).trim();\n  if (!target) return false;\n  const links = Array.isArray(issue?.fields?.issuelinks) ? issue.fields.issuelinks : [];\n  return links.some((link) =\u003e {\n    const inward = String(link.inwardIssue?.key || \u0027\u0027).trim();\n    const outward = String(link.outwardIssue?.key || \u0027\u0027).trim();\n    return inward === target || outward === target;\n  });\n}\n\nreturn issueItems.map((item, index) =\u003e {\n  const issue = item.json || {};\n  const source = sourceItems[pairedIndex(item, index)] || sourceItems[index] || sourceItems[0] || {};\n  if (!source.storyKey || !source.testcaseKey) {\n    throw new Error(\u0027Story Test Case link-check response could not be paired to its source story/test case.\u0027);\n  }\n  const alreadyLinked = linkedToStory(issue, source.storyKey);\n  return {\n    json: {\n      ...source,\n      linkChecked: true,\n      linkNeeded: !alreadyLinked,\n      linkStatus: alreadyLinked ? \u0027already_linked\u0027 : \u0027needs_link\u0027\n    }\n  };\n});"
}
```

### Existing Test Case Needs Update?

| Field | Value |
| --- | --- |
| Node ID | d882db6b-9e45-45c5-8d19-e282e719b4ad |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 8224, 132 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Existing Story Test Case -> Existing Test Case Needs Update? (output 0, input 0)

**Outgoing Connections**

- Existing Test Case Needs Update? -> Prepare Existing Story Test Case Update Request (output 0, input 0)
- Existing Test Case Needs Update? -> Upsert Story Test Case Publish Checkpoint (output 1, input 0)

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
                                              "leftValue":  "={{ $json.action === \"updated\" }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   },
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
| Position | 7104, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Usage Checkpoint Items -> Expand Story Test Case Items (output 0, input 0)

**Outgoing Connections**

- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sources = $input.all().map((item) =\u003e item.json || {});\nconst normalizeArray = value =\u003e Array.isArray(value) ? value.map(v =\u003e String(v || \u0027\u0027).trim()).filter(Boolean) : (String(value || \u0027\u0027).trim() ? [String(value).trim()] : []);\nconst slugify = value =\u003e String(value || \u0027\u0027).toLowerCase().replace(/[^a-z0-9]+/g, \u0027-\u0027).replace(/^-+|-+$/g, \u0027\u0027).slice(0, 50);\nconst unique = values =\u003e Array.from(new Set(values.filter(Boolean)));\nfunction adfParagraph(text, strongLabel) { const content = []; if (strongLabel) content.push({ type: \u0027text\u0027, text: strongLabel + \u0027: \u0027, marks: [{ type: \u0027strong\u0027 }] }); if (text) content.push({ type: \u0027text\u0027, text: String(text).slice(0, 12000) }); return { type: \u0027paragraph\u0027, content }; }\nfunction adfHeading(text, level = 3) { return { type: \u0027heading\u0027, attrs: { level }, content: [{ type: \u0027text\u0027, text: String(text).slice(0, 250) }] }; }\nfunction adfBulletList(items) { const normalized = normalizeArray(items); if (!normalized.length) return null; return { type: \u0027bulletList\u0027, content: normalized.map(item =\u003e ({ type: \u0027listItem\u0027, content: [{ type: \u0027paragraph\u0027, content: [{ type: \u0027text\u0027, text: item.slice(0, 800) }] }] })) }; }\n\nreturn sources.flatMap((source) =\u003e {\n  const parsed = source.parsed || {};\n  const storySummary = parsed.storySummary || source.storySummary || source.storyKey;\n  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];\n  return testCases.map((testCase, index) =\u003e {\n    const generatedTestCaseId = String(testCase.testCaseId || (\u0027TC-\u0027 + String(index + 1).padStart(3, \u00270\u0027))).trim();\n    const slotId = generatedTestCaseId.toLowerCase().replace(/[^a-z0-9]+/g, \u0027-\u0027).replace(/^-+|-+$/g, \u0027\u0027) || (\u0027tc-\u0027 + String(index + 1).padStart(3, \u00270\u0027));\n    const summary = String(testCase.summary || (\u0027Test \u0027 + generatedTestCaseId + \u0027 for \u0027 + storySummary)).trim();\n    const coverageCategory = String(testCase.coverageCategory || testCase.testCategory || \u0027Functional\u0027).trim();\n    const storyIdentity = source.storyCorrelationId || source.storyKey;\n    const canonicalStableLabel = [source.idempotencyLabelPrefix || \u0027qops\u0027, \u0027tc\u0027, slugify(storyIdentity), slotId].filter(Boolean).join(\u0027-\u0027).slice(0, 120);\n    const legacyStableLabel = [source.idempotencyLabelPrefix || \u0027qops\u0027, \u0027tc\u0027, slugify(storyIdentity), slugify(generatedTestCaseId), slugify(summary)].filter(Boolean).join(\u0027-\u0027).slice(0, 120);\n    const stableLabel = canonicalStableLabel;\n    const allStableLabels = unique([stableLabel, legacyStableLabel]);\n    const preconditions = normalizeArray(testCase.preconditions);\n    const testSteps = normalizeArray(testCase.testSteps);\n    const testData = normalizeArray(testCase.testData);\n    const acceptanceCriteriaCovered = normalizeArray(testCase.acceptanceCriteriaCovered);\n    const notes = normalizeArray(testCase.notes);\n    const requirementReference = String(testCase.requirementReference || (source.storyKey + \u0027 story details\u0027)).trim();\n    const testLevel = String(testCase.testLevel || \u0027UI\u0027).trim();\n    const testCategory = String(testCase.testCategory || coverageCategory || \u0027Functional\u0027).trim();\n    const riskLevel = String(testCase.riskLevel || \u0027Medium\u0027).trim();\n    const automationFeasibility = String(testCase.automationFeasibility || \u0027Medium\u0027).trim();\n    const jiraDescription = { type: \u0027doc\u0027, version: 1, content: [adfHeading(\u0027Source Story\u0027, 3), adfParagraph(source.storyKey + \u0027 - \u0027 + storySummary), adfParagraph(testCase.objective || \u0027\u0027, \u0027Objective\u0027), adfParagraph(coverageCategory, \u0027Coverage Category\u0027), adfParagraph(requirementReference, \u0027Requirement Reference\u0027), adfParagraph(testLevel, \u0027Test Level\u0027), adfParagraph(testCategory, \u0027Test Category\u0027), adfParagraph(riskLevel, \u0027Risk Level\u0027), adfParagraph(automationFeasibility, \u0027Automation Feasibility\u0027), preconditions.length ? adfHeading(\u0027Preconditions\u0027, 3) : null, preconditions.length ? adfBulletList(preconditions) : null, testSteps.length ? adfHeading(\u0027Test Steps\u0027, 3) : null, testSteps.length ? adfBulletList(testSteps.map((step, stepIndex) =\u003e (stepIndex + 1) + \u0027. \u0027 + step)) : null, testData.length ? adfHeading(\u0027Test Data\u0027, 3) : null, testData.length ? adfBulletList(testData) : null, adfHeading(\u0027Expected Result\u0027, 3), adfParagraph(testCase.expectedResult || \u0027Expected result not provided by generator.\u0027), acceptanceCriteriaCovered.length ? adfHeading(\u0027Acceptance Criteria Covered\u0027, 3) : null, acceptanceCriteriaCovered.length ? adfBulletList(acceptanceCriteriaCovered) : null, notes.length ? adfHeading(\u0027Notes\u0027, 3) : null, notes.length ? adfBulletList(notes) : null, adfHeading(\u0027Traceability\u0027, 3), adfParagraph(source.storyKey + \u0027 | \u0027 + (source.storyCorrelationId || \u0027N/A\u0027) + \u0027 | Source Job \u0027 + (source.storySourceJobId || \u0027N/A\u0027))].filter(Boolean) };\n    const labels = unique([stableLabel, legacyStableLabel, \u0027qops-story-test-cases\u0027, (\u0027story-\u0027 + slugify(source.storyKey)).slice(0, 80), (\u0027category-\u0027 + slugify(coverageCategory)).slice(0, 80), (\u0027level-\u0027 + slugify(testLevel)).slice(0, 80)]);\n    return { json: { ...source, testCaseIndex: index + 1, generatedTestCaseId, testCaseId: generatedTestCaseId, testCaseSummary: summary, coverageCategory, priority: String(testCase.priority || \u0027Medium\u0027), testType: String(testCase.testType || \u0027functional\u0027), requirementReference, testLevel, testCategory, riskLevel, automationFeasibility, objective: String(testCase.objective || \u0027\u0027).trim(), preconditions, testSteps, testData, expectedResult: String(testCase.expectedResult || \u0027\u0027).trim(), acceptanceCriteriaCovered, notes, stableLabel, canonicalStableLabel, legacyStableLabel, allStableLabels, jiraDescription, createIssueBody: { fields: { project: { key: source.jiraProjectKey }, issuetype: { name: source.testCaseIssueTypeName || \u0027Test Case\u0027 }, summary, description: jiraDescription, labels } }, linkIssueBody: { type: { name: \u0027Relates\u0027 }, inwardIssue: { key: source.storyKey }, outwardIssue: { key: \u0027__REPLACE_TEST_CASE_KEY__\u0027 }, comment: { body: { type: \u0027doc\u0027, version: 1, content: [{ type: \u0027paragraph\u0027, content: [{ type: \u0027text\u0027, text: \u0027Linked by Q-Ops Story Test Cases generation.\u0027 }] }] } } } } };\n  });\n});"
}
```

### Fetch Completed User Story Jobs

| Field | Value |
| --- | --- |
| Node ID | 7903c2e8-99d5-4061-8d6c-443e21aca1eb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, -88 |
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

### Fetch Existing Test Case Story Links

| Field | Value |
| --- | --- |
| Node ID | d509ab06-f730-49fa-a380-74bd9b138ae8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 11136, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Link Check Request -> Fetch Existing Test Case Story Links (output 0, input 0)

**Outgoing Connections**

- Fetch Existing Test Case Story Links -> Detect Existing Story Test Case Link (output 0, input 0)

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
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/issue/\" + encodeURIComponent($json.testcaseKey) + \"?fields=issuelinks\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  1500
                                               }
                                 }
                }
}
```

### Fetch Jira Story Issue

| Field | Value |
| --- | --- |
| Node ID | b24c8627-ee3b-444b-9ff6-96811cafacf9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Delta Has No Work? -> Fetch Jira Story Issue (output 1, input 0)

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

### Fetch Published Story Test Case Links

| Field | Value |
| --- | --- |
| Node ID | 4583a637-39f9-4206-b1dd-4ff35e7cce55 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 800, -88 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Source Items -> Fetch Published Story Test Case Links (output 0, input 0)

**Outgoing Connections**

- Fetch Published Story Test Case Links -> Build Story Test Case Delta Targets (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "project_id",
                                                   "value":  "={{ \"eq.\" + encodeURIComponent($json.projectId || \"\") }}"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "2000"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,project_id,project_name,story_jira_key,story_jira_id,story_correlation_id,story_summary,testcase_jira_key,testcase_jira_id,testcase_summary,stable_label,status,metadata,created_at,updated_at"
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

### Finalize Story Test Case Result

| Field | Value |
| --- | --- |
| Node ID | 673cd158-3b9a-48c4-8c31-1c258e9bd521 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 13152, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Finalizing Coverage -> Finalize Story Test Case Result (output 0, input 0)

**Outgoing Connections**

- Finalize Story Test Case Result -> Build Direct Story Test Case Completion Output (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function safeAll(nodeName) { try { return $(nodeName).all().map((item) =\u003e item.json || {}); } catch (error) { if (String(error?.message || error).includes(\"hasn\u0027t been executed\")) return []; throw error; } }\nconst createdItems = safeAll(\u0027Normalize Created Story Test Case\u0027);\nconst reusedItems = safeAll(\u0027Normalize Existing Story Test Case\u0027).filter(item =\u003e item.action !== \u0027updated\u0027);\nconst updatedItems = safeAll(\u0027Normalize Updated Existing Story Test Case\u0027);\nconst allItems = [...createdItems, ...reusedItems, ...updatedItems];\nconst expandedItems = safeAll(\u0027Expand Story Test Case Items\u0027);\nif (expandedItems.length \u0026\u0026 allItems.length \u003c expandedItems.length) return [];\nif (!allItems.length) throw new Error(\u0027Story Test Case generator did not produce any reusable, updated, or created Jira Test Cases.\u0027);\nconst uniqueItems = [];\nconst seen = new Set();\nfor (const item of allItems) {\n  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join(\u0027|\u0027);\n  if (!key || seen.has(key)) continue;\n  seen.add(key);\n  uniqueItems.push(item);\n}\nconst perStoryMetrics = safeAll(\u0027Merge Story Test Case Batches\u0027);\nconst sourceStoryItems = safeAll(\u0027Build Story Source Items\u0027);\nconst plannedBatches = safeAll(\u0027Build Story Test Case Detail Batches\u0027);\nconst storyMap = new Map();\nsourceStoryItems.forEach((story) =\u003e { if (story.storyKey \u0026\u0026 !storyMap.has(story.storyKey)) storyMap.set(story.storyKey, { storyKey: story.storyKey, storyId: story.storyId, summary: story.storySummary || story.summary, storyCorrelationId: story.storyCorrelationId, storyLink: story.storyLink }); });\nuniqueItems.forEach((item) =\u003e {\n  if (!item.storyKey) return;\n  const existing = storyMap.get(item.storyKey) || {};\n  storyMap.set(item.storyKey, { storyKey: item.storyKey, storyId: existing.storyId || item.storyId, summary: existing.summary || item.storySummary, storyCorrelationId: existing.storyCorrelationId || item.storyCorrelationId, storyLink: existing.storyLink || item.storyLink });\n});\nconst stories = Array.from(storyMap.values()).sort((left, right) =\u003e String(left.storyKey || \u0027\u0027).localeCompare(String(right.storyKey || \u0027\u0027), undefined, { numeric: true }));\nconst testCases = uniqueItems.map((item) =\u003e ({ action: item.action, testcaseKey: item.testcaseKey, testcaseId: item.testcaseId, testcaseSummary: item.testCaseSummary, testcaseLink: item.testcaseLink, storyKey: item.storyKey, storySummary: item.storySummary, stableLabel: item.stableLabel, legacyStableLabel: item.legacyStableLabel || null, coverageCategory: item.coverageCategory || null, priority: item.priority, riskLevel: item.riskLevel, testType: item.testType, testLevel: item.testLevel, testCategory: item.testCategory, automationFeasibility: item.automationFeasibility, requirementReference: item.requirementReference }));\nconst mappings = uniqueItems.map((item) =\u003e ({ storyKey: item.storyKey, storySummary: item.storySummary, testcaseKey: item.testcaseKey, testcaseSummary: item.testCaseSummary, action: item.action, coverageCategory: item.coverageCategory || null }));\nconst categoryDistribution = testCases.reduce((acc, item) =\u003e { const key = item.coverageCategory || item.testCategory || \u0027Functional\u0027; acc[key] = (acc[key] || 0) + 1; return acc; }, {});\nfunction uniqueText(values) { return Array.from(new Set(values.map(value =\u003e String(value || \u0027\u0027).trim()).filter(Boolean))); }\nfunction uniqueCategoryList(values) {\n  const seen = new Set();\n  return values\n    .flatMap(value =\u003e String(value || \u0027\u0027).split(/\\s*\\|\\s*/))\n    .map(value =\u003e value.trim())\n    .filter(value =\u003e {\n      const key = value.toLowerCase();\n      if (!key || seen.has(key)) return false;\n      seen.add(key);\n      return true;\n    });\n}\nfunction storyLabel(story) { return [story.storyKey, story.summary || story.storySummary].filter(Boolean).join(\u0027 - \u0027); }\nfunction buildCoverage(sourceStories, plannedBatches, metricStories, stories, testCases, mappings) {\n  const firstMetric = metricStories[0] || sourceStories[0] || {};\n  const updateContext = firstMetric.updateContext \u0026\u0026 typeof firstMetric.updateContext === \u0027object\u0027 ? firstMetric.updateContext : {};\n  const generationMode = String(firstMetric.generationMode || \u0027\u0027).toLowerCase();\n  const previousLedgerByStory = new Map((Array.isArray(updateContext.previousCoverageLedger) ? updateContext.previousCoverageLedger : [])\n    .map(row =\u003e [String(row.storyKey || row.sourceStoryKey || \u0027\u0027).trim(), row])\n    .filter(([key]) =\u003e key));\n  const byStory = new Map();\n  function ensureStory(key, seed = {}) {\n    const storyKey = String(key || seed.storyKey || \u0027\u0027).trim();\n    if (!storyKey) return null;\n    if (!byStory.has(storyKey)) {\n      byStory.set(storyKey, {\n        storyKey,\n        storyId: seed.storyId || null,\n        summary: seed.summary || seed.storySummary || \u0027\u0027,\n        storyCorrelationId: seed.storyCorrelationId || null,\n        storyLink: seed.storyLink || null,\n        planned: 0,\n        plannedCategories: new Set(),\n        testCases: [],\n        mappings: [],\n      });\n    }\n    const current = byStory.get(storyKey);\n    current.storyId = current.storyId || seed.storyId || null;\n    current.summary = current.summary || seed.summary || seed.storySummary || \u0027\u0027;\n    current.storyCorrelationId = current.storyCorrelationId || seed.storyCorrelationId || null;\n    current.storyLink = current.storyLink || seed.storyLink || null;\n    return current;\n  }\n\n  sourceStories.forEach(story =\u003e ensureStory(story.storyKey, story));\n  metricStories.forEach(story =\u003e {\n    const current = ensureStory(story.storyKey, story);\n    if (current) {\n      const generatedByModel = Number(story.testCaseCount || story.generatedTestCaseCount || story.generatedTestCases || 0) || 0;\n      current.modelGenerated = Math.max(Number(current.modelGenerated || 0) || 0, generatedByModel);\n      if (!plannedBatches.length \u0026\u0026 generatedByModel \u003e current.planned) current.planned = generatedByModel;\n    }\n    Object.keys(story.categoryDistribution || {}).forEach(category =\u003e current?.plannedCategories.add(category));\n  });\n  stories.forEach(story =\u003e ensureStory(story.storyKey, story));\n  plannedBatches.forEach(batch =\u003e {\n    const current = ensureStory(batch.storyKey, batch);\n    if (!current) return;\n    const planItems = Array.isArray(batch.planItems) ? batch.planItems : [];\n    current.planned += planItems.length;\n    planItems.forEach(plan =\u003e current.plannedCategories.add(String(plan.coverageCategory || plan.testCategory || \u0027Functional\u0027).trim() || \u0027Functional\u0027));\n  });\n  testCases.forEach(testCase =\u003e {\n    const current = ensureStory(testCase.storyKey, testCase);\n    if (!current) return;\n    current.testCases.push(testCase);\n  });\n  mappings.forEach(mapping =\u003e {\n    const current = ensureStory(mapping.storyKey, mapping);\n    if (!current) return;\n    current.mappings.push(mapping);\n  });\n\n  const coverageLedger = Array.from(byStory.values()).sort((left, right) =\u003e left.storyKey.localeCompare(right.storyKey)).map((story, index) =\u003e {\n    const generated = story.testCases.length;\n    const previousRow = previousLedgerByStory.get(story.storyKey);\n    const previousGenerated = Number(previousRow?.generatedTestCases || previousRow?.linkedTestCases || previousRow?.testCaseCount || 0) || 0;\n    const planned = story.planned || generated || previousGenerated;\n    const generatedCategories = uniqueCategoryList(story.testCases.map(item =\u003e item.coverageCategory || item.testCategory));\n    const plannedCategories = uniqueCategoryList(Array.from(story.plannedCategories));\n    const previousStatus = String(previousRow?.coverageStatus || previousRow?.status || \u0027\u0027).toLowerCase();\n    const previousWasCovered = generationMode === \u0027update\u0027 \u0026\u0026 previousRow \u0026\u0026 previousStatus === \u0027covered\u0027 \u0026\u0026 !generated;\n    const missingCategories = previousWasCovered ? [] : plannedCategories.filter(category =\u003e !generatedCategories.includes(category));\n    const actions = story.testCases.reduce((acc, item) =\u003e {\n      const action = String(item.action || \u0027\u0027).trim().toLowerCase();\n      if (action === \u0027created\u0027) acc.created += 1;\n      else if (action === \u0027updated\u0027) acc.updated += 1;\n      else if (action === \u0027reused\u0027) acc.reused += 1;\n      return acc;\n    }, { created: 0, updated: 0, reused: 0 });\n    const coverageStatus = previousWasCovered\n      ? \u0027covered\u0027\n      : !generated\n        ? \u0027missing\u0027\n        : (planned \u0026\u0026 generated \u003c planned) || missingCategories.length\n          ? \u0027partial\u0027\n          : \u0027covered\u0027;\n    const notes = coverageStatus === \u0027missing\u0027\n      ? \u0027No Jira test cases were published for this story.\u0027\n      : coverageStatus === \u0027partial\u0027\n        ? \u0027Some planned test cases or categories need review.\u0027\n        : \u0027Story has published Jira test-case coverage.\u0027;\n    return {\n      coverageId: \u0027STC-COV-\u0027 + String(index + 1).padStart(3, \u00270\u0027),\n      storyKey: story.storyKey,\n      storyId: story.storyId,\n      storySummary: story.summary,\n      storyCorrelationId: story.storyCorrelationId,\n      storyLink: story.storyLink,\n      module: story.storyKey,\n      requirement: story.summary || story.storyKey,\n      sourceReference: \u0027Jira Story \u0027 + story.storyKey,\n      includedInOutput: generated + \u0027 Jira test case\u0027 + (generated === 1 ? \u0027\u0027 : \u0027s\u0027),\n      coverageStatus,\n      status: coverageStatus,\n      plannedTestCases: planned,\n      generatedTestCases: generated || previousGenerated,\n      modelGeneratedTestCases: Number(story.modelGenerated || 0) || 0,\n      publishGap: Boolean((Number(story.modelGenerated || 0) || 0) \u0026\u0026 generated \u003c (Number(story.modelGenerated || 0) || 0)),\n      reusedFromPreviousCoverage: Boolean(previousWasCovered),\n      mappingCount: story.mappings.length,\n      categoriesCovered: generatedCategories,\n      plannedCategories,\n      missingCategories,\n      actions,\n      notes,\n    };\n  });\n  const coveredItems = coverageLedger.filter(item =\u003e item.coverageStatus === \u0027covered\u0027);\n  const partialItems = coverageLedger.filter(item =\u003e item.coverageStatus === \u0027partial\u0027);\n  const missingItems = coverageLedger.filter(item =\u003e item.coverageStatus === \u0027missing\u0027);\n  const total = coverageLedger.length;\n  const gateStatus = missingItems.length ? \u0027failed\u0027 : (partialItems.length ? \u0027warning\u0027 : \u0027passed\u0027);\n  const score = total ? Math.round(((coveredItems.length + partialItems.length * 0.5) / total) * 100) : 0;\n  const summaryText = missingItems.length\n    ? missingItems.length + \u0027 source stor\u0027 + (missingItems.length === 1 ? \u0027y is\u0027 : \u0027ies are\u0027) + \u0027 missing Jira test-case coverage.\u0027\n    : partialItems.length\n      ? partialItems.length + \u0027 source stor\u0027 + (partialItems.length === 1 ? \u0027y needs\u0027 : \u0027ies need\u0027) + \u0027 coverage review.\u0027\n      : \u0027All source stories have Jira test-case coverage.\u0027;\n  const coverageSummary = {\n    status: gateStatus,\n    gateStatus,\n    total,\n    coverageLedgerCount: total,\n    covered: coveredItems.length,\n    coveredCount: coveredItems.length,\n    partial: partialItems.length,\n    partialCount: partialItems.length,\n    missing: missingItems.length,\n    missingCount: missingItems.length,\n    recovered: 0,\n    recoveredCount: 0,\n    score,\n    coveredItems,\n    partialItems,\n    warningItems: partialItems,\n    missingItems,\n    storyCoverage: coverageLedger,\n  };\n  const batchSummary = {\n    totalBatches: total,\n    completedBatches: coveredItems.length,\n    partialBatches: partialItems.length,\n    missingBatches: missingItems.length,\n    recoveredBatches: 0,\n    batches: coverageLedger.map(item =\u003e ({\n      batchId: item.coverageId,\n      module: storyLabel(item),\n      name: storyLabel(item),\n      status: item.coverageStatus,\n      coverageStatus: item.coverageStatus,\n      plannedTestCases: item.plannedTestCases,\n      generatedTestCases: item.generatedTestCases,\n      categoriesCovered: item.categoriesCovered,\n      missingCategories: item.missingCategories,\n    })),\n  };\n  const qualityGate = {\n    status: gateStatus,\n    gateStatus,\n    coverageSummary,\n    batchSummary,\n    coverageLedger,\n    progress: {\n      stage: \u0027story_test_case_coverage\u0027,\n      stageLabel: \u0027Story test-case coverage\u0027,\n      summary: summaryText,\n      progressPercent: score,\n      totalBatches: total,\n      completedBatches: coveredItems.length,\n      retryingBatches: 0,\n      batches: batchSummary.batches,\n    },\n  };\n  return { coverageSummary, batchSummary, coverageLedger, qualityGate };\n}\nconst coverage = buildCoverage(sourceStoryItems, plannedBatches, perStoryMetrics, stories, testCases, mappings);\nconst wordCount = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyWordCount || 0), 0);\nconst tokensInput = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyTokensInput || 0), 0);\nconst tokensOutput = perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyTokensOutput || 0), 0);\nconst estimatedCostUsd = Number(perStoryMetrics.reduce((sum, item) =\u003e sum + Number(item.storyEstimatedCostUsd || 0), 0).toFixed(6));\nconst tokensTotal = tokensInput + tokensOutput;\nconst first = uniqueItems[0];\nconst generationMode = String(first.generationMode || \u0027\u0027).trim().toLowerCase() === \u0027update\u0027 ? \u0027update\u0027 : (String(first.generationMode || \u0027\u0027).trim().toLowerCase() === \u0027retry\u0027 ? \u0027retry\u0027 : \u0027create\u0027);\nconst updateContext = first.updateContext \u0026\u0026 typeof first.updateContext === \u0027object\u0027 ? first.updateContext : null;\nconst coverageRows = Array.isArray(coverage.coverageLedger) ? coverage.coverageLedger : [];\nconst missingRows = coverageRows.filter(row =\u003e String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase() === \u0027missing\u0027);\nconst partialRows = coverageRows.filter(row =\u003e String(row.coverageStatus || row.status || \u0027\u0027).toLowerCase() === \u0027partial\u0027);\nconst gateStatus = String(coverage.coverageSummary?.gateStatus || coverage.coverageSummary?.status || coverage.qualityGate?.gateStatus || \u0027\u0027).toLowerCase();\nconst terminalStatus = gateStatus === \u0027failed\u0027 ? \u0027failed\u0027 : \u0027completed\u0027;\nconst repairRows = [...missingRows, ...partialRows];\nconst publishGaps = coverageRows\n  .filter(row =\u003e Number(row.modelGeneratedTestCases || 0) \u003e Number(row.mappingCount || 0))\n  .map(row =\u003e ({\n    storyKey: row.storyKey,\n    storyId: row.storyId || null,\n    storySummary: row.storySummary || row.requirement || row.storyKey,\n    modelGeneratedTestCases: Number(row.modelGeneratedTestCases || 0) || 0,\n    publishedMappings: Number(row.mappingCount || 0) || 0,\n    missingPublishedCases: Math.max(0, Number(row.modelGeneratedTestCases || 0) - Number(row.mappingCount || 0)),\n  }));\nconst publishGapByStory = new Map(publishGaps.map(row =\u003e [row.storyKey, row]));\nconst repairTargets = repairRows.map(row =\u003e ({\n  storyKey: row.storyKey,\n  storyId: row.storyId || null,\n  storySummary: row.storySummary || row.requirement || row.storyKey,\n  coverageStatus: row.coverageStatus || row.status,\n  plannedTestCases: Number(row.plannedTestCases || 0) || 0,\n  generatedTestCases: Number(row.generatedTestCases || 0) || 0,\n  missingCategories: Array.isArray(row.missingCategories) ? row.missingCategories : [],\n  publishGap: publishGapByStory.get(row.storyKey) || null,\n}));\nconst tokenUsage = {\n  source: \u0027story_testcase_generator\u0027,\n  input: tokensInput,\n  output: tokensOutput,\n  total: tokensTotal,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n  model: first.generationModel || null,\n};\nconst previousTokenUsage = updateContext?.previousTokenUsage || {};\nconst baselineTokens = Number(previousTokenUsage.total || previousTokenUsage.tokensTotal || previousTokenUsage.tokens_total || 0) || 0;\nconst baselineCost = Number(previousTokenUsage.estimatedCostUsd || previousTokenUsage.estimated_cost_usd || 0) || 0;\nconst createdTestCases = testCases.filter(item =\u003e item.action === \u0027created\u0027);\nconst updatedTestCases = testCases.filter(item =\u003e item.action === \u0027updated\u0027);\nconst reusedTestCases = testCases.filter(item =\u003e item.action === \u0027reused\u0027);\nconst updateSummary = generationMode === \u0027update\u0027 ? {\n  enabled: true,\n  version: \u0027stc-update-gate-usage-summary-v1\u0027,\n  documentType: \u0027story_test_cases\u0027,\n  mode: \u0027update\u0027,\n  deltaMode: true,\n  updateOfJobId: updateContext?.previousJobId || null,\n  sourceStoryCount: stories.length,\n  storyScopeCount: coverageRows.length || stories.length,\n  coveredStoryCount: Number(coverage.coverageSummary?.coveredCount || coverage.coverageSummary?.covered || 0) || 0,\n  partialStoryCount: partialRows.length,\n  missingStoryCount: missingRows.length,\n  createdTestCaseCount: createdTestCases.length,\n  updatedTestCaseCount: updatedTestCases.length,\n  reusedTestCaseCount: reusedTestCases.length,\n  removedTestCaseCount: 0,\n  testCaseCount: testCases.length,\n  mappingCount: mappings.length,\n  createdTestCases,\n  updatedTestCases,\n  reusedTestCases,\n  preservedTestCases: reusedTestCases,\n  removedTestCases: [],\n  storyCoverage: coverageRows,\n  missingStories: missingRows,\n  partialStories: partialRows,\n  repairTargets,\n  requiresCoverageRepair: repairTargets.length \u003e 0,\n  publishGaps,\n  tokenUsage,\n  tokensTotal,\n  estimatedCostUsd,\n  previousTokenUsage,\n  tokenSavings: {\n    estimatedBaselineTokens: baselineTokens || null,\n    estimatedTokensSaved: baselineTokens ? Math.max(0, baselineTokens - tokensTotal) : 0,\n    estimatedBaselineCostUsd: baselineCost || null,\n    estimatedCostSavedUsd: baselineCost ? Math.max(0, Number((baselineCost - estimatedCostUsd).toFixed(6))) : 0,\n    estimatedSavingsPercent: baselineTokens ? Math.max(0, Math.round(((baselineTokens - tokensTotal) / baselineTokens) * 100)) : null,\n  },\n  gateStatus,\n  terminalStatus,\n  message: repairTargets.length\n    ? \u0027Story Test Cases update published available Jira test cases, but some in-scope stories still need targeted repair.\u0027\n    : \u0027Story Test Cases update completed with story-level coverage satisfied.\u0027\n} : null;\nif (updateSummary) coverage.qualityGate.updateSummary = updateSummary;\nconst error = terminalStatus === \u0027failed\u0027\n  ? (publishGaps.length\n    ? \u0027Story Test Cases publish checkpoint incomplete for \u0027 + publishGaps.map(row =\u003e row.storyKey).join(\u0027, \u0027) + \u0027. Retry will target missing or partial stories only.\u0027\n    : \u0027Story Test Cases update did not satisfy required story coverage. Retry will target missing or partial stories only.\u0027)\n  : null;\nreturn [{ json: {\n  documentType: \u0027story_test_cases\u0027,\n  jobId: first.jobId,\n  projectId: first.projectId,\n  projectName: first.projectName,\n  generationMode,\n  updateContext,\n  updateOfJobId: updateContext?.previousJobId || null,\n  retryOfJobId: first.retryOfJobId || null,\n  sourceUserStoryJobId: first.storySourceJobId || null,\n  stories,\n  testCases,\n  mappings,\n  categoryDistribution,\n  coverageSummary: coverage.coverageSummary,\n  batchSummary: coverage.batchSummary,\n  coverageLedger: coverage.coverageLedger,\n  qualityGate: coverage.qualityGate,\n  updateSummary,\n  tokenUsage,\n  tokenSavings: updateSummary?.tokenSavings || null,\n  jira: { projectKey: first.jiraProjectKey, created: createdTestCases.length, updated: updatedTestCases.length, reused: reusedTestCases.length },\n  wordCount,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n  terminalStatus,\n  error,\n  requiresCoverageRepair: repairTargets.length \u003e 0,\n  repairTargets,\n  publishGaps,\n  patchVersion: \u0027stc-retry-publish-metrics-progress-v1\u0027\n} }];"
}
```

### Link Created Test Case To Story

| Field | Value |
| --- | --- |
| Node ID | 3326dda4-6bab-4117-b819-8b5b104697f8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 11808, -140 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Link Needed? -> Link Created Test Case To Story (output 0, input 0)

**Outgoing Connections**

- Link Created Test Case To Story -> Normalize Linked Story Test Case (output 0, input 0)

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
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/issueLink\" }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ type: { name: \"Relates\" }, inwardIssue: { key: $json.storyKey }, outwardIssue: { key: $json.testcaseKey }, comment: { body: { type: \"doc\", version: 1, content: [{ type: \"paragraph\", content: [{ type: \"text\", text: \"Linked by Q-Ops Story Test Cases generation.\" }] }] } } }) }}",
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  3000
                                               }
                                 }
                }
}
```

### LOG: Direct Story Test Case Job Completed

| Field | Value |
| --- | --- |
| Node ID | 9935b493-9d00-4477-84ae-a4214ab4ee73 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 13824, -232 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Completion Metrics Allowed? -> LOG: Direct Story Test Case Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Direct Story Test Case Job Completed -> Mark Direct Story Test Case Job Completed (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: \"story_test_cases\", pipeline: \"generation\", event: \"JOB_COMPLETED\", status: \"info\", project_id: $json.projectId || null, requested_by: $json.requestedBy || null, duration_ms: Math.max(0, Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime()), word_count: $json.wordCount || $json.output?.wordCount || 0, tokens_input: $json.tokensInput || $json.output?.tokensInput || $json.output?.tokenUsage?.input || $json.output?.tokenUsage?.tokensInput || 0, tokens_output: $json.tokensOutput || $json.output?.tokensOutput || $json.output?.tokenUsage?.output || $json.output?.tokenUsage?.tokensOutput || 0, tokens_total: $json.tokensTotal || $json.output?.tokensTotal || $json.output?.tokenUsage?.total || $json.output?.tokenUsage?.tokensTotal || 0, estimated_cost_usd: $json.estimatedCostUsd || $json.output?.estimatedCostUsd || $json.output?.tokenUsage?.estimatedCostUsd || 0, metadata: { metric_key: String($json.jobId || \"\") + \":JOB_COMPLETED:completed\", persisted_by: \"story_testcase_generator\", generator_mode: \"professional_story_test_cases\", generation_mode: $json.generationMode || $json.output?.generationMode || \"create\", update_of_job_id: $json.updateOfJobId || $json.output?.updateOfJobId || null, retry_of_job_id: $json.retryOfJobId || $json.output?.retryOfJobId || null, source_user_story_job_id: $json.sourceUserStoryJobId || $json.output?.sourceUserStoryJobId || null, story_count: Array.isArray($json.stories) ? $json.stories.length : (Array.isArray($json.output?.stories) ? $json.output.stories.length : 0), testcase_count: Array.isArray($json.testCases) ? $json.testCases.length : (Array.isArray($json.output?.testCases) ? $json.output.testCases.length : 0), mapping_count: Array.isArray($json.mappings) ? $json.mappings.length : (Array.isArray($json.output?.mappings) ? $json.output.mappings.length : 0), testcase_created_count: $json.jira?.created || $json.output?.jira?.created || 0, testcase_updated_count: $json.jira?.updated || $json.output?.jira?.updated || 0, testcase_reused_count: $json.jira?.reused || $json.output?.jira?.reused || 0, coverage_status: $json.coverageSummary?.gateStatus || $json.output?.coverageSummary?.gateStatus || $json.qualityGate?.coverageSummary?.gateStatus || $json.output?.qualityGate?.coverageSummary?.gateStatus || null, missing_story_count: $json.coverageSummary?.missingCount || $json.output?.coverageSummary?.missingCount || 0, partial_story_count: $json.coverageSummary?.partialCount || $json.output?.coverageSummary?.partialCount || 0, requires_coverage_repair: Boolean(($json.coverageSummary?.partialCount || $json.output?.coverageSummary?.partialCount || 0) || ($json.coverageSummary?.missingCount || $json.output?.coverageSummary?.missingCount || 0)), repair_targets: ($json.coverageLedger || $json.output?.coverageLedger || []).filter(row =\u003e /partial|missing|review/i.test(String(row.coverageStatus || row.status || \"\"))).map(row =\u003e ({ storyKey: row.storyKey || row.sourceStoryKey || row.requirementId || null, storyId: row.storyId || null, storySummary: row.storySummary || row.summary || row.title || null, coverageStatus: row.coverageStatus || row.status || null, plannedTestCases: row.plannedTestCases || row.plannedTestCaseCount || null, generatedTestCases: row.generatedTestCases || row.generatedTestCaseCount || null, missingCategories: row.missingCategories || [] })) } }) }}",
    "options":  {

                }
}
```

### Mark Direct Story Test Case Job Completed

| Field | Value |
| --- | --- |
| Node ID | 2cb9319e-f7c4-4a6f-a551-324ef03cb34f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 14048, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Direct Story Test Case Job Completed -> Mark Direct Story Test Case Job Completed (output 0, input 0)
- Story Test Case Completion Metrics Allowed? -> Mark Direct Story Test Case Job Completed (output 1, input 0)

**Outgoing Connections**

- Mark Direct Story Test Case Job Completed -> Repair Direct Story Test Case Completion Metric Attribution (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\"Build Direct Story Test Case Completion Output\").item.json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ (() =\u003e { const result = $(\"Build Direct Story Test Case Completion Output\").item.json; const output = result.output || {}; const terminalStatus = output.terminalStatus || result.terminalStatus || \"completed\"; return JSON.stringify({ status: terminalStatus === \"failed\" ? \"failed\" : \"completed\", output, error: terminalStatus === \"failed\" ? (output.error || \"Story Test Cases update coverage gate failed; retry will target missing or partial stories.\") : null, updated_at: $now.toISO() }); })() }}",
    "options":  {

                }
}
```

### Mark Story Test Case Link Existing

| Field | Value |
| --- | --- |
| Node ID | 089ae66f-878f-44ba-aa76-2e24dd326a87 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 12032, 132 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Link Needed? -> Mark Story Test Case Link Existing (output 1, input 0)

**Outgoing Connections**

- Mark Story Test Case Link Existing -> Upsert Story Test Case Mapping (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map((item) =\u003e ({\n  json: {\n    ...(item.json || {}),\n    linkChecked: true,\n    linkCreated: false,\n    linkNeeded: false,\n    linkStatus: \u0027already_linked\u0027\n  }\n}));"
}
```

### Merge Story Test Case Batches

| Field | Value |
| --- | --- |
| Node ID | 5ff9b6b8-8a3d-4118-a2ef-0a944dbfc438 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5536, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Batch Needs Retry? -> Merge Story Test Case Batches (output 1, input 0)
- Robust Story Test Case Batch Retry Parser -> Merge Story Test Case Batches (output 0, input 0)

**Outgoing Connections**

- Merge Story Test Case Batches -> Build Story Test Case Progress - Generating Test Cases (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function safeAll(nodeName) { try { return $(nodeName).all().map((item) =\u003e item.json || {}); } catch (error) { if (String(error?.message || error).includes(\"hasn\u0027t been executed\")) return []; throw error; } }\nconst currentInput = $input.all().map(item =\u003e item.json || {});\nconst plannedStories = safeAll(\u0027Robust Story Test Case Parser\u0027);\nconst allBatches = safeAll(\u0027Build Story Test Case Detail Batches\u0027);\nconst initialParsed = safeAll(\u0027Robust Story Test Case Batch Parser\u0027);\nconst retryParsed = safeAll(\u0027Robust Story Test Case Batch Retry Parser\u0027);\nconst failedInitialBatches = initialParsed.filter(item =\u003e item.batchParseFailed);\nconst currentHasRetryResult = currentInput.some(item =\u003e item.batchRetrySucceeded);\nif (failedInitialBatches.length \u0026\u0026 !currentHasRetryResult) return [];\n\nconst byBatchKey = new Map();\nfor (const batch of allBatches) {\n  if (!batch.storyKey || !batch.batchIndex) continue;\n  byBatchKey.set(batch.storyKey + \u0027|\u0027 + batch.batchIndex, { source: batch, testCasesById: new Map(), metrics: [] });\n}\nfor (const item of [...initialParsed, ...retryParsed]) {\n  if (!item.storyKey || !item.batchIndex || !item.parsedBatch) continue;\n  const key = item.storyKey + \u0027|\u0027 + item.batchIndex;\n  const bucket = byBatchKey.get(key) || { source: item, testCasesById: new Map(), metrics: [] };\n  for (const test of item.parsedBatch.testCases || []) {\n    if (test.testCaseId) bucket.testCasesById.set(String(test.testCaseId).toUpperCase(), test);\n  }\n  bucket.metrics.push(item);\n  byBatchKey.set(key, bucket);\n}\nconst incomplete = [];\nfor (const [key, bucket] of byBatchKey.entries()) {\n  const expected = (bucket.source.planItems || []).map(plan =\u003e String(plan.testCaseId).toUpperCase());\n  const missing = expected.filter(id =\u003e !bucket.testCasesById.has(id));\n  if (missing.length) incomplete.push(key + \u0027: \u0027 + missing.join(\u0027, \u0027));\n}\nif (incomplete.length) throw new Error(\u0027Merged Story Test Case batches are incomplete after retry. \u0027 + incomplete.join(\u0027 | \u0027));\nreturn plannedStories.map((story) =\u003e {\n  const storyBuckets = Array.from(byBatchKey.values()).filter(bucket =\u003e bucket.source.storyKey === story.storyKey).sort((a, b) =\u003e Number(a.source.batchIndex || 0) - Number(b.source.batchIndex || 0));\n  const testCases = storyBuckets.flatMap(bucket =\u003e Array.from(bucket.testCasesById.values()).sort((a, b) =\u003e String(a.testCaseId).localeCompare(String(b.testCaseId))));\n  const seen = new Set();\n  const uniqueTestCases = testCases.filter(test =\u003e { const key = String(test.testCaseId || \u0027\u0027).trim().toUpperCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; });\n  const categoryDistribution = uniqueTestCases.reduce((acc, test) =\u003e { const key = test.coverageCategory || test.testCategory || \u0027Functional\u0027; acc[key] = (acc[key] || 0) + 1; return acc; }, {});\n  const allMetrics = storyBuckets.flatMap(bucket =\u003e bucket.metrics);\n  const batchTokensInput = allMetrics.reduce((sum, item) =\u003e sum + Number(item.batchTokensInput || 0), 0);\n  const batchTokensOutput = allMetrics.reduce((sum, item) =\u003e sum + Number(item.batchTokensOutput || 0), 0);\n  const batchCost = allMetrics.reduce((sum, item) =\u003e sum + Number(item.batchEstimatedCostUsd || 0), 0);\n  const batchWordCount = allMetrics.reduce((sum, item) =\u003e sum + Number(item.batchWordCount || 0), 0);\n  return { json: { ...story, parsed: { storyKey: story.storyKey, storySummary: story.storySummary, testCases: uniqueTestCases }, testCaseCount: uniqueTestCases.length, categoryDistribution, storyWordCount: Number(story.storyWordCount || 0) + batchWordCount, storyTokensInput: Number(story.storyTokensInput || 0) + batchTokensInput, storyTokensOutput: Number(story.storyTokensOutput || 0) + batchTokensOutput, storyEstimatedCostUsd: Number((Number(story.storyEstimatedCostUsd || 0) + batchCost).toFixed(6)) } };\n});"
}
```

### Normalize Created Story Test Case

| Field | Value |
| --- | --- |
| Node ID | fc6e7df1-41fc-4761-bfbe-40ac26c0640d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 9568, -140 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Create Jira Test Case -> Normalize Created Story Test Case (output 0, input 0)

**Outgoing Connections**

- Normalize Created Story Test Case -> Upsert Story Test Case Publish Checkpoint (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const createSources = $(\u0027Prepare Story Test Case Create Request\u0027).all().map((item) =\u003e item.json || {});\nconst createdItems = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn createdItems.map((item, index) =\u003e {\n  const created = item.json || {};\n  const source = createSources[pairedIndex(item, index)] || createSources[index] || createSources[0] || {};\n  if (!source.storyKey || !created.key) {\n    throw new Error(\u0027Created Jira Test Case response could not be paired to its source story/test case.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      action: \u0027created\u0027,\n      testcaseKey: created.key,\n      testcaseId: created.id,\n      testcaseSelf: created.self,\n      testcaseLink: source.jiraBaseUrl + \u0027/browse/\u0027 + created.key,\n      linkStatus: \u0027not_checked\u0027,\n      linkChecked: false,\n      linkCreated: false,\n    },\n  };\n});"
}
```

### Normalize Existing Story Test Case

| Field | Value |
| --- | --- |
| Node ID | f58b8235-2c84-4521-b28b-efc93ae9ea9a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 8000, 132 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Test Case Needs Create? -> Normalize Existing Story Test Case (output 1, input 0)

**Outgoing Connections**

- Normalize Existing Story Test Case -> Existing Test Case Needs Update? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map((item) =\u003e {\n  const source = item.json || {};\n  const search = source.searchResult || source;\n  const existing = Array.isArray(search.issues) ? search.issues[0] : null;\n  if (!source.storyKey || !source.stableLabel) {\n    throw new Error(\u0027Existing Jira Test Case result is missing source story context.\u0027);\n  }\n  if (!existing?.key) throw new Error(\u0027Expected an existing Jira Test Case issue for stable label \u0027 + source.stableLabel + \u0027 but none was returned.\u0027);\n  const generationMode = String(source.generationMode || \u0027\u0027).trim().toLowerCase();\n  const shouldUpdate = generationMode === \u0027update\u0027;\n  const updateFields = {\n    summary: source.createIssueBody?.fields?.summary || source.testCaseSummary,\n    description: source.createIssueBody?.fields?.description || source.jiraDescription,\n    labels: source.createIssueBody?.fields?.labels || [source.stableLabel, \u0027qops-story-test-cases\u0027]\n  };\n  return {\n    json: {\n      ...source,\n      action: shouldUpdate ? \u0027updated\u0027 : \u0027reused\u0027,\n      testcaseKey: existing.key,\n      testcaseId: existing.id || null,\n      testcaseSelf: existing.self || null,\n      testcaseLink: source.jiraBaseUrl + \u0027/browse/\u0027 + existing.key,\n      updateIssueBody: { fields: updateFields },\n      linkStatus: \u0027not_checked\u0027,\n      linkChecked: false,\n      linkCreated: false\n    }\n  };\n});"
}
```

### Normalize Linked Story Test Case

| Field | Value |
| --- | --- |
| Node ID | 4f2dd514-f2e6-4989-b753-02c49f327831 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 12032, -140 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Link Created Test Case To Story -> Normalize Linked Story Test Case (output 0, input 0)

**Outgoing Connections**

- Normalize Linked Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const linkCandidates = $(\u0027Story Test Case Link Needed?\u0027).all().map((item) =\u003e item.json || {}).filter((item) =\u003e item.linkNeeded);\nconst responses = $input.all();\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\nreturn responses.map((item, index) =\u003e {\n  const source = linkCandidates[pairedIndex(item, index)] || linkCandidates[index] || linkCandidates[0] || {};\n  return {\n    json: {\n      ...source,\n      linkChecked: true,\n      linkCreated: true,\n      linkNeeded: false,\n      linkStatus: \u0027linked\u0027\n    }\n  };\n});"
}
```

### Normalize Story Test Case Request

| Field | Value |
| --- | --- |
| Node ID | f453a7fa-e99f-4597-8afd-e33fc0793f54 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, -88 |
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
    "jsCode":  "const input = $json || {};\nconst config = input.configSnapshot || input.config_snapshot || {};\nconst publishing = config.publishing || {};\nconst jira = config.jira || {\n  baseUrl: publishing.jiraBaseUrl,\n  projectKey: publishing.jiraProjectKey,\n  testCaseIssueTypeName: publishing.jiraTestCaseIssueTypeName,\n  idempotencyLabelPrefix: publishing.jiraIdempotencyLabelPrefix\n};\nconst models = config.models || {};\nconst cleanBase = (value, fallback) =\u003e {\n  const s = String(value || fallback || \u0027\u0027);\n  return s.endsWith(\u0027/\u0027) ? s.slice(0, -1) : s;\n};\nconst generationMode = String(input.generationMode || input.generation_mode || \u0027\u0027).trim().toLowerCase() === \u0027update\u0027\n  ? \u0027update\u0027\n  : (String(input.generationMode || \u0027\u0027).trim().toLowerCase() === \u0027retry\u0027 ? \u0027retry\u0027 : \u0027create\u0027);\nreturn [{\n  json: {\n    jobId: input.jobId || input.job_id || (\u0027STC-\u0027 + Date.now()),\n    projectId: input.projectId || input.project_id || null,\n    projectName: input.projectName || input.project_name || \u0027Unknown Project\u0027,\n    requestedBy: input.requestedBy || input.requested_by || null,\n    settingsVersion: input.settingsVersion || input.settings_version || null,\n    startedAt: input.startedAt || input.createdAt || new Date().toISOString(),\n    jiraBaseUrl: cleanBase(input.jiraBaseUrl || jira.baseUrl, \u0027https://anujalhans1.atlassian.net\u0027),\n    jiraProjectKey: input.jiraProjectKey || jira.projectKey || \u0027KAN\u0027,\n    testCaseIssueTypeName: input.testCaseIssueTypeName || jira.testCaseIssueTypeName || jira.testCaseIssueType || \u0027Test Case\u0027,\n    generationModel: input.generationModel || models.generationModel || \u0027gpt-4.1-mini\u0027,\n    maxTokens: Math.max(6000, Number(input.maxTokens || models.maxTokens || 12000) || 12000),\n    idempotencyLabelPrefix: input.idempotencyLabelPrefix || jira.idempotencyLabelPrefix || \u0027qops\u0027,\n    productOwner: input.productOwner || input.product_owner || \u0027Product Owner\u0027,\n    generationMode,\n    updateContext: input.updateContext || input.update_context || null,\n    retryOfJobId: input.retryOfJobId || input.retry_of_job_id || null,\n    configSnapshot: config\n  }\n}];"
}
```

### Normalize Updated Existing Story Test Case

| Field | Value |
| --- | --- |
| Node ID | 52f35f50-7c51-4751-ba5a-561485884a59 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 9568, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update Existing Jira Test Case -> Normalize Updated Existing Story Test Case (output 0, input 0)

**Outgoing Connections**

- Normalize Updated Existing Story Test Case -> Upsert Story Test Case Publish Checkpoint (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const updateSources = $(\u0027Prepare Existing Story Test Case Update Request\u0027).all().map((item) =\u003e item.json || {});\nconst responses = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn responses.map((item, index) =\u003e {\n  const source = updateSources[pairedIndex(item, index)] || updateSources[index] || updateSources[0] || {};\n  if (!source.storyKey || !source.testcaseKey) {\n    throw new Error(\u0027Updated Jira Test Case response could not be paired to its source story/test case.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      linkStatus: \u0027not_checked\u0027,\n      linkChecked: false,\n      linkCreated: false\n    }\n  };\n});"
}
```

### OpenAI Chat Model

| Field | Value |
| --- | --- |
| Node ID | 829e34a3-2de5-4811-ab33-f867446700a2 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 2536, 260 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

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

### OpenAI Chat Model - Batch

| Field | Value |
| --- | --- |
| Node ID | 2bbddba7-43af-4a74-a490-ef44dbb1437d |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 4008, 260 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

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

### OpenAI Chat Model - Batch Retry

| Field | Value |
| --- | --- |
| Node ID | 77536173-c6d6-4ef0-8075-8f8771985b65 |
| Type | @n8n/n8n-nodes-langchain.lmChatOpenAi |
| Type Version | 1.3 |
| Position | 5032, 136 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

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

### Persist Story Test Case Progress - Finalizing Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-persist-finalizing_coverage |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 12704, 60 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Finalizing Coverage -> Persist Story Test Case Progress - Finalizing Coverage (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Finalizing Coverage -> Restore Story Test Case Progress - Finalizing Coverage (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Progress - Generating Test Cases

| Field | Value |
| --- | --- |
| Node ID | stc-progress-persist-generating_test_cases |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 5984, 36 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Generating Test Cases -> Persist Story Test Case Progress - Generating Test Cases (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Generating Test Cases -> Restore Story Test Case Progress - Generating Test Cases (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Progress - Linking Traceability

| Field | Value |
| --- | --- |
| Node ID | stc-progress-persist-linking_traceability |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 10464, 60 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Linking Traceability -> Persist Story Test Case Progress - Linking Traceability (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Linking Traceability -> Restore Story Test Case Progress - Linking Traceability (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Progress - Planning Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-persist-planning_coverage |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 3264, 36 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Planning Coverage -> Persist Story Test Case Progress - Planning Coverage (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Planning Coverage -> Restore Story Test Case Progress - Planning Coverage (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Progress - Planning Scope

| Field | Value |
| --- | --- |
| Node ID | stc-progress-persist-planning_scope |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 1344, -88 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Planning Scope -> Persist Story Test Case Progress - Planning Scope (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Planning Scope -> Restore Story Test Case Progress - Planning Scope (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Progress - Updating Existing Jira

| Field | Value |
| --- | --- |
| Node ID | 1c74de66-2d2f-4798-9007-5ce977f537d2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 8144, -16 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Progress - Updating Existing Jira -> Persist Story Test Case Progress - Updating Existing Jira (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Progress - Updating Existing Jira -> Restore Story Test Case Progress - Updating Existing Jira (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "={{ \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\u0027 + encodeURIComponent($json.jobId || $json.job_id || $json.requestId || $json.id) + \u0027\u0026status=eq.processing\u0027 }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Persist Story Test Case Usage Checkpoint

| Field | Value |
| --- | --- |
| Node ID | 493cd2c8-f39d-428d-b2ce-859cb6f57fda |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 6656, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Usage Checkpoint -> Persist Story Test Case Usage Checkpoint (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Usage Checkpoint -> Restore Story Test Case Usage Checkpoint Items (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ output: $json.progressOutput || { documentType: \u0027story_test_cases\u0027, checkpoint: \u0027story_testcase_generation_complete_pre_publish\u0027, usageCheckpoint: $json.usageCheckpoint, tokenUsage: $json.tokenUsage, tokensInput: $json.tokensInput, tokensOutput: $json.tokensOutput, tokensTotal: $json.tokensTotal, estimatedCostUsd: $json.estimatedCostUsd, wordCount: $json.wordCount, failedUsageAvailable: true }, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Prepare Existing Story Test Case Update Request

| Field | Value |
| --- | --- |
| Node ID | 7966e123-2623-4986-8253-c045f656e3ba |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 8448, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Existing Test Case Needs Update? -> Prepare Existing Story Test Case Update Request (output 0, input 0)

**Outgoing Connections**

- Prepare Existing Story Test Case Update Request -> Build Story Test Case Progress - Updating Existing Jira (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map((item, index) =\u003e {\n  const source = item.json || {};\n  if (!source.storyKey || !source.testcaseKey || !source.updateIssueBody) {\n    throw new Error(\u0027Unable to prepare existing Story Test Case update request at index \u0027 + index + \u0027.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      publishStage: \u0027update_request_prepared\u0027,\n    },\n  };\n});"
}
```

### Prepare Story Test Case Batch Retry Prompt

| Field | Value |
| --- | --- |
| Node ID | ea42c177-f221-4b39-a21e-15dddf84a542 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4736, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Batch Needs Retry? -> Prepare Story Test Case Batch Retry Prompt (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Batch Retry Prompt -> Story Test Case Batch Retry Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const NL = String.fromCharCode(10);\nfunction planLine(plan) {\n  return [plan.testCaseId, plan.coverageCategory, plan.testLevel, plan.priority, plan.riskLevel, plan.summary, \u0027Requirement: \u0027 + plan.requirementReference, \u0027Intent: \u0027 + plan.coverageIntent].join(\u0027 | \u0027);\n}\nreturn $input.all().map(item =\u003e {\n  const source = item.json || {};\n  const missingIds = Array.isArray(source.missingTestCaseIds) \u0026\u0026 source.missingTestCaseIds.length\n    ? source.missingTestCaseIds.map(id =\u003e String(id).toUpperCase())\n    : (source.planItems || []).map(plan =\u003e String(plan.testCaseId).toUpperCase());\n  const retryPlanItems = (source.planItems || []).filter(plan =\u003e missingIds.includes(String(plan.testCaseId).toUpperCase()));\n  const system = [\n    \u0027You are repairing only the missing Jira test cases from a failed batch response.\u0027,\n    \u0027Return one valid, complete JSON object only. No markdown. No prose outside JSON.\u0027,\n    \u0027The previous response failed validation: \u0027 + (source.batchParseError || \u0027unknown parse error\u0027),\n    \u0027Generate details only for the exact missing testCaseId values supplied in this retry request.\u0027,\n    \u0027Do not add new IDs. Do not omit requested IDs.\u0027,\n    \u0027Keep each item concise so JSON completes successfully.\u0027,\n    \u0027Every test case must have at least 3 concrete testSteps and a non-empty expectedResult.\u0027\n  ].join(NL);\n  const user = [\n    \u0027Project: \u0027 + source.projectName,\n    \u0027Story Key: \u0027 + source.storyKey,\n    \u0027Story Summary: \u0027 + source.storySummary,\n    \u0027Retry Batch: \u0027 + source.batchIndex + \u0027 of \u0027 + source.batchCount,\n    \u0027Missing IDs only: \u0027 + retryPlanItems.map(plan =\u003e plan.testCaseId).join(\u0027, \u0027),\n    \u0027\u0027,\n    \u0027Story Description:\u0027,\n    source.storyDescriptionText || \u0027No Jira description was available.\u0027,\n    \u0027\u0027,\n    \u0027Return valid JSON using schema { \"storyKey\": \"...\", \"batchIndex\": number, \"testCases\": [...] } for these exact missing plan items only:\u0027,\n    ...retryPlanItems.map(planLine)\n  ].join(NL);\n  return { json: { ...source, planItems: retryPlanItems, missingTestCaseIds: retryPlanItems.map(plan =\u003e plan.testCaseId), system, user, batchRetryAttempt: 1 } };\n});"
}
```

### Prepare Story Test Case Create Request

| Field | Value |
| --- | --- |
| Node ID | 26ec209e-4e99-4b77-82ea-fbd1022de2bb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 9120, -140 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Test Case Needs Create? -> Prepare Story Test Case Create Request (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Create Request -> Create Jira Test Case (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const expandedItems = $(\u0027Expand Story Test Case Items\u0027).all().map((item) =\u003e item.json || {});\nconst branchItems = $input.all();\n\nfunction pairedIndex(item, fallback) {\n  const paired = Array.isArray(item.pairedItem) ? item.pairedItem[0] : item.pairedItem;\n  return Number.isInteger(paired?.item) ? paired.item : fallback;\n}\n\nreturn branchItems.map((item, index) =\u003e {\n  const candidate = item.json || {};\n  const source = candidate.createIssueBody\n    ? candidate\n    : (expandedItems[pairedIndex(item, index)] || expandedItems[index] || expandedItems[0] || {});\n  if (!source.storyKey || !source.createIssueBody) {\n    throw new Error(\u0027Unable to prepare Jira Test Case create request because source item context was not preserved.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      searchResult: candidate.searchResult || candidate,\n      publishStage: \u0027create_request_prepared\u0027,\n    },\n  };\n});"
}
```

### Prepare Story Test Case Link Check Request

| Field | Value |
| --- | --- |
| Node ID | 4d097409-69e3-4f56-8659-e508668d1a62 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 10912, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Linking Traceability -> Prepare Story Test Case Link Check Request (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Link Check Request -> Fetch Existing Test Case Story Links (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $input.all().map((item, index) =\u003e {\n  const source = item.json || {};\n  if (!source.storyKey || !source.testcaseKey) {\n    throw new Error(\u0027Unable to prepare Story Test Case link check request at index \u0027 + index + \u0027.\u0027);\n  }\n  return {\n    json: {\n      ...source,\n      publishStage: \u0027link_check_prepared\u0027,\n    },\n  };\n});"
}
```

### Prepare Story Test Case Prompt

| Field | Value |
| --- | --- |
| Node ID | d961c0c2-d8fa-4af9-815c-f2cd88747832 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 36 |
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
    "jsCode":  "const sourceItems = $(\u0027Build Story Test Case Delta Targets\u0027).all().map(item =\u003e item.json || {});\nconst issueItems = $input.all();\nconst NL = String.fromCharCode(10);\nfunction flattenAdf(node) {\n  if (!node) return \u0027\u0027;\n  if (Array.isArray(node)) return node.map(flattenAdf).filter(Boolean).join(NL);\n  if (typeof node === \u0027string\u0027) return node;\n  if (node.type === \u0027text\u0027) return node.text || \u0027\u0027;\n  const content = Array.isArray(node.content) ? node.content.map(flattenAdf).filter(Boolean).join(node.type === \u0027paragraph\u0027 ? \u0027\u0027 : NL) : \u0027\u0027;\n  if (node.type === \u0027paragraph\u0027) return content.trim();\n  if (node.type === \u0027bulletList\u0027 || node.type === \u0027orderedList\u0027) return content.trim();\n  if (node.type === \u0027listItem\u0027) return \u0027- \u0027 + content.trim();\n  if (node.type === \u0027heading\u0027) return content.trim();\n  return content.trim();\n}\nfunction buildSystemMessage() {\n  return [\n    \u0027You are a Senior QA Test Architect designing complete risk-based test coverage from Jira user stories.\u0027,\n    \u0027First create a compact coverage plan only. Do not generate detailed steps in this pass.\u0027,\n    \u0027Return one valid JSON object only. No markdown. No prose outside JSON.\u0027,\n    \u0027The plan must maximize meaningful coverage without filler or duplicates.\u0027,\n    \u0027Use distinct categories so test cases remain traceable from a coverage perspective.\u0027,\n    \u0027Supported coverageCategory values include Positive, Negative, Functional, Smoke, Sanity, Regression, Security, Performance, Network, Accessibility, Boundary, Integration, Data, Resilience, Error Handling, Authorization, Authentication, Usability, Compatibility, Observability.\u0027,\n    \u0027Use this exact schema:\u0027,\n    \u0027{\u0027,\n    \u0027  \"storyKey\": \"KAN-123\",\u0027,\n    \u0027  \"storySummary\": \"Story title\",\u0027,\n    \u0027  \"coveragePlan\": [\u0027,\n    \u0027    {\u0027,\n    \u0027      \"testCaseId\": \"TC-001\",\u0027,\n    \u0027      \"summary\": \"Short Jira-ready test case title\",\u0027,\n    \u0027      \"coverageCategory\": \"Positive\",\u0027,\n    \u0027      \"testLevel\": \"UI | API | SIT | FAT | Regression | Security | Performance | Network | Data | Accessibility\",\u0027,\n    \u0027      \"testCategory\": \"Positive | Negative | Boundary | Edge | Alternate | Exception | Integration | Validation | Resilience\",\u0027,\n    \u0027      \"testType\": \"functional\",\u0027,\n    \u0027      \"priority\": \"High\",\u0027,\n    \u0027      \"riskLevel\": \"High\",\u0027,\n    \u0027      \"automationFeasibility\": \"High\",\u0027,\n    \u0027      \"requirementReference\": \"Acceptance criterion or story detail covered\",\u0027,\n    \u0027      \"coverageIntent\": \"What unique behavior or risk this case covers\"\u0027,\n    \u0027    }\u0027,\n    \u0027  ]\u0027,\n    \u0027}\u0027,\n    \u0027Generate the complete set of useful test cases for this story.\u0027,\n    \u0027Do not cap the plan at an arbitrary small number.\u0027,\n    \u0027For simple stories include all essential positive, negative, validation, boundary, smoke, sanity, and regression coverage.\u0027,\n    \u0027For complex, payment, auth, integration, data-heavy, network-sensitive, or security-sensitive stories include deeper category coverage.\u0027,\n    \u0027Avoid duplicate test intentions. Each planned item must cover a distinct behavior, role, data state, integration, failure mode, or quality risk.\u0027,\n    \u0027Use stable sequential testCaseId values from TC-001 onward.\u0027\n  ].join(NL);\n}\n\nreturn issueItems.map((item, index) =\u003e {\n  const issue = item.json || {};\n  const issueKey = String(issue.key || issue.fields?.key || issue.issueKey || \u0027\u0027).trim().toUpperCase();\n  const sourceByKey = new Map(sourceItems.map(source =\u003e [String(source.storyKey || source.jiraStoryKey || source.key || \u0027\u0027).trim().toUpperCase(), source]));\n  const source = (issueKey \u0026\u0026 sourceByKey.get(issueKey)) || sourceItems[index] || sourceItems[0] || {};\n  const sourceKey = String(source.storyKey || source.jiraStoryKey || source.key || \u0027\u0027).trim().toUpperCase();\n  if (issueKey \u0026\u0026 sourceKey \u0026\u0026 issueKey !== sourceKey) {\n    throw new Error(\u0027Story Test Cases delta pairing mismatch before model work: fetched Jira issue \u0027 + issueKey + \u0027 was paired with selected story \u0027 + sourceKey + \u0027.\u0027);\n  }\n  const descriptionText = flattenAdf(issue.fields?.description || \u0027\u0027).replace(new RegExp(NL + \u0027{3,}\u0027, \u0027g\u0027), NL + NL).trim();\n  const storySummary = issue.fields?.summary || source.storySummary || source.storyKey;\n  const system = buildSystemMessage();\n  const user = [\u0027Project: \u0027 + source.projectName, \u0027Story Key: \u0027 + source.storyKey, \u0027Story Summary: \u0027 + storySummary, \u0027Story Correlation ID: \u0027 + (source.storyCorrelationId || \u0027N/A\u0027), \u0027\u0027, \u0027Story Description:\u0027, descriptionText || \u0027No Jira description was available. Use the story summary and source context only.\u0027, \u0027\u0027, \u0027Create a complete compact test-case coverage plan for this story.\u0027].join(NL);\n  return { json: { ...source, jiraFetchedStoryKey: issueKey || source.storyKey || null, storySummary, storyDescriptionText: descriptionText, system, user, planningPass: true } };\n});"
}
```

### Recover Story Test Case Publish Checkpoint Items

| Field | Value |
| --- | --- |
| Node ID | 9687f392-7178-4fc4-b321-a0b995bfb561 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 10016, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upsert Story Test Case Publish Checkpoint -> Recover Story Test Case Publish Checkpoint Items (output 0, input 0)

**Outgoing Connections**

- Recover Story Test Case Publish Checkpoint Items -> Build Story Test Case Progress - Linking Traceability (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function safeAll(nodeName) {\n  try { return $(nodeName).all().map((item) =\u003e item.json || {}); }\n  catch (error) {\n    if (String(error?.message || error).includes(\"hasn\u0027t been executed\")) return [];\n    throw error;\n  }\n}\n\nconst createdItems = safeAll(\u0027Normalize Created Story Test Case\u0027);\nconst reusedItems = safeAll(\u0027Normalize Existing Story Test Case\u0027).filter(item =\u003e item.action !== \u0027updated\u0027);\nconst updatedItems = safeAll(\u0027Normalize Updated Existing Story Test Case\u0027);\nconst allItems = [...createdItems, ...reusedItems, ...updatedItems];\nconst uniqueItems = [];\nconst seen = new Set();\nfor (const item of allItems) {\n  const key = [item.storyKey, item.testcaseKey || item.stableLabel].filter(Boolean).join(\u0027|\u0027);\n  if (!key || seen.has(key)) continue;\n  seen.add(key);\n  uniqueItems.push(item);\n}\nreturn uniqueItems.map(item =\u003e ({ json: item }));"
}
```

### Repair Direct Story Test Case Completion Metric Attribution

| Field | Value |
| --- | --- |
| Node ID | a606a4cc-2373-4c09-8086-bf767f1163dc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 14272, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Mark Direct Story Test Case Job Completed -> Repair Direct Story Test Case Completion Metric Attribution (output 0, input 0)

**Outgoing Connections**

- Repair Direct Story Test Case Completion Metric Attribution -> Return Direct Story Test Case Result (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?job_id=eq.{{ $json.jobId || $json.job_id }}\u0026event=eq.JOB_COMPLETED\u0026pipeline=eq.generation\u0026document_type=eq.story_test_cases\u0026requested_by=is.null",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ requested_by: $json.requestedBy || $json.requested_by || null, project_id: $json.projectId || $json.project_id || null }) }}",
    "options":  {

                }
}
```

### Restore Story Test Case Progress - Finalizing Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-restore-finalizing_coverage |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 12928, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Finalizing Coverage -> Restore Story Test Case Progress - Finalizing Coverage (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Finalizing Coverage -> Finalize Story Test Case Result (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Progress - Finalizing Coverage\u0027).all();"
}
```

### Restore Story Test Case Progress - Generating Test Cases

| Field | Value |
| --- | --- |
| Node ID | stc-progress-restore-generating_test_cases |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 6208, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Generating Test Cases -> Restore Story Test Case Progress - Generating Test Cases (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Generating Test Cases -> Build Story Test Case Usage Checkpoint (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Progress - Generating Test Cases\u0027).all();"
}
```

### Restore Story Test Case Progress - Linking Traceability

| Field | Value |
| --- | --- |
| Node ID | stc-progress-restore-linking_traceability |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 10688, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Linking Traceability -> Restore Story Test Case Progress - Linking Traceability (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Linking Traceability -> Prepare Story Test Case Link Check Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Progress - Linking Traceability\u0027).all();"
}
```

### Restore Story Test Case Progress - Planning Coverage

| Field | Value |
| --- | --- |
| Node ID | stc-progress-restore-planning_coverage |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3488, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Planning Coverage -> Restore Story Test Case Progress - Planning Coverage (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Planning Coverage -> Build Story Test Case Detail Batches (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Progress - Planning Coverage\u0027).all();"
}
```

### Restore Story Test Case Progress - Planning Scope

| Field | Value |
| --- | --- |
| Node ID | stc-progress-restore-planning_scope |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Planning Scope -> Restore Story Test Case Progress - Planning Scope (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Planning Scope -> Story Test Case Delta Has No Work? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Progress - Planning Scope\u0027).all();"
}
```

### Restore Story Test Case Progress - Updating Existing Jira

| Field | Value |
| --- | --- |
| Node ID | f467cf5d-e890-46c2-9fcb-8cf4d4361501 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 8368, -16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Progress - Updating Existing Jira -> Restore Story Test Case Progress - Updating Existing Jira (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Progress - Updating Existing Jira -> Update Existing Jira Test Case (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\"Build Story Test Case Progress - Updating Existing Jira\").all();"
}
```

### Restore Story Test Case Usage Checkpoint Items

| Field | Value |
| --- | --- |
| Node ID | 8c520bd3-7d66-4023-9201-c0026e955178 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 6880, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Usage Checkpoint -> Restore Story Test Case Usage Checkpoint Items (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Usage Checkpoint Items -> Expand Story Test Case Items (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return $(\u0027Build Story Test Case Usage Checkpoint\u0027).all().map(item =\u003e ({ json: item.json || {} }));"
}
```

### Return Direct Story Test Case Result

| Field | Value |
| --- | --- |
| Node ID | 9b019eaa-7da1-4666-aecd-7f793883e3d7 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 14496, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Repair Direct Story Test Case Completion Metric Attribution -> Return Direct Story Test Case Result (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const persisted = $(\u0027Build Direct Story Test Case Completion Output\u0027).first().json;\nconst original = {\n  documentType: persisted.documentType,\n  jobId: persisted.jobId,\n  projectId: persisted.projectId,\n  projectName: persisted.projectName,\n  generationMode: persisted.output?.generationMode || persisted.generationMode || null,\n  updateContext: persisted.output?.updateContext || persisted.updateContext || null,\n  updateOfJobId: persisted.output?.updateOfJobId || persisted.updateOfJobId || null,\n  retryOfJobId: persisted.output?.retryOfJobId || persisted.retryOfJobId || null,\n  sourceUserStoryJobId: persisted.output?.sourceUserStoryJobId || persisted.sourceUserStoryJobId || null,\n  stories: persisted.output?.stories || persisted.stories || [],\n  testCases: persisted.output?.testCases || persisted.testCases || [],\n  mappings: persisted.output?.mappings || persisted.mappings || [],\n  categoryDistribution: persisted.output?.categoryDistribution || persisted.categoryDistribution || {},\n  coverageSummary: persisted.output?.coverageSummary || persisted.coverageSummary || null,\n  batchSummary: persisted.output?.batchSummary || persisted.batchSummary || null,\n  coverageLedger: persisted.output?.coverageLedger || persisted.coverageLedger || [],\n  qualityGate: persisted.output?.qualityGate || persisted.qualityGate || null,\n  jira: persisted.output?.jira || persisted.jira || null,\n  wordCount: persisted.output?.wordCount || persisted.wordCount || 0,\n  tokensInput: persisted.output?.tokensInput || persisted.tokensInput || 0,\n  tokensOutput: persisted.output?.tokensOutput || persisted.tokensOutput || 0,\n  tokensTotal: persisted.output?.tokensTotal || persisted.tokensTotal || 0,\n  estimatedCostUsd: persisted.output?.estimatedCostUsd || persisted.estimatedCostUsd || 0,\n  generatorPersisted: true,\n};\nreturn [{ json: original }];"
}
```

### Robust Story Test Case Batch Parser

| Field | Value |
| --- | --- |
| Node ID | f7509897-59df-45ca-a3a0-53b984eff6a1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 4288, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Batch Generator -> Robust Story Test Case Batch Parser (output 0, input 0)

**Outgoing Connections**

- Robust Story Test Case Batch Parser -> Story Test Case Batch Needs Retry? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $(\u0027Build Story Test Case Detail Batches\u0027).all().map(item =\u003e item.json || {});\nconst responseItems = $input.all();\nconst NL = String.fromCharCode(10);\nconst BACKSLASH = String.fromCharCode(92);\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n  }\n  return String(value || \u0027\u0027).trim();\n};\nfunction extractBalancedJsonObject(source, text) {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) throw new Error(\u0027No JSON object in batch response for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex);\n  let depth = 0, inString = false, escaped = false;\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n    if (inString) {\n      if (escaped) escaped = false;\n      else if (char === BACKSLASH) escaped = true;\n      else if (char === \u0027\"\u0027) inString = false;\n      continue;\n    }\n    if (char === \u0027\"\u0027) inString = true;\n    else if (char === \u0027{\u0027) depth += 1;\n    else if (char === \u0027}\u0027) { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }\n  }\n  throw new Error(\u0027Incomplete JSON in batch response for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex + \u0027. Output chars=\u0027 + text.length);\n}\nfunction normalizeCases(source, parsed) {\n  const expectedIds = source.planItems.map(plan =\u003e plan.testCaseId);\n  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];\n  const planById = new Map(source.planItems.map(plan =\u003e [plan.testCaseId.toUpperCase(), plan]));\n  const normalized = [];\n  const invalidIds = [];\n  for (const test of testCases) {\n    const id = String(test.testCaseId || \u0027\u0027).trim().toUpperCase();\n    if (!planById.has(id)) continue;\n    const plan = planById.get(id) || {};\n    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step =\u003e String(step || \u0027\u0027).trim()).filter(Boolean) : [];\n    if (steps.length \u003c 3 || !String(test.expectedResult || \u0027\u0027).trim()) {\n      invalidIds.push(id);\n      continue;\n    }\n    normalized.push({ ...plan, ...test, testCaseId: id, summary: String(test.summary || test.title || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || \u0027Functional\u0027).trim(), testLevel: String(test.testLevel || plan.testLevel || \u0027UI\u0027).trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || \u0027Functional\u0027).trim(), testType: String(test.testType || plan.testType || \u0027functional\u0027).trim(), priority: String(test.priority || plan.priority || \u0027Medium\u0027).trim(), riskLevel: String(test.riskLevel || plan.riskLevel || \u0027Medium\u0027).trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || \u0027Medium\u0027).trim(), requirementReference: String(test.requirementReference || test.requirement || plan.requirementReference || source.storyKey + \u0027 story details\u0027).trim(), objective: String(test.objective || test.intent || plan.coverageIntent || \u0027\u0027).trim(), testSteps: steps });\n  }\n  const returnedIds = new Set(normalized.map(test =\u003e test.testCaseId.toUpperCase()));\n  const missing = expectedIds.filter(id =\u003e !returnedIds.has(id.toUpperCase()));\n  return { normalized, missing: Array.from(new Set([...missing, ...invalidIds])) };\n}\nfunction parseBatch(source, item) {\n  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;\n  let text = stringifyRaw(raw);\n  if (!text) throw new Error(\u0027Empty batch response for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex);\n  const fence = String.fromCharCode(96, 96, 96);\n  const fenceStart = text.indexOf(fence);\n  const fenceEnd = text.lastIndexOf(fence);\n  if (fenceStart \u003e= 0 \u0026\u0026 fenceEnd \u003e fenceStart) {\n    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);\n    if (firstLineEnd \u003e= 0 \u0026\u0026 fenceEnd \u003e firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();\n  }\n  const candidate = extractBalancedJsonObject(source, text);\n  const parsed = JSON.parse(candidate);\n  const { normalized, missing } = normalizeCases(source, parsed);\n  return { parsed: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, missing, rawJson: candidate, tokenOutput: Math.max(1, Math.ceil(candidate.length / 4)), wordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + \u0027s+\u0027)).length) };\n}\nreturn responseItems.map((item, index) =\u003e {\n  const source = sourceItems[index] || sourceItems[0] || {};\n  try {\n    const result = parseBatch(source, item);\n    const tokensInput = Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4));\n    const tokensOutput = result.tokenOutput;\n    const failed = result.missing.length \u003e 0;\n    return { json: { ...source, parsedBatch: result.parsed, missingTestCaseIds: result.missing, batchWordCount: result.wordCount, batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: failed, batchParseError: failed ? (\u0027Batch response missing or invalid requested IDs for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex + \u0027: \u0027 + result.missing.join(\u0027, \u0027)) : null } };\n  } catch (error) {\n    return { json: { ...source, parsedBatch: { storyKey: source.storyKey, batchIndex: source.batchIndex, testCases: [] }, missingTestCaseIds: source.planItems.map(plan =\u003e plan.testCaseId), batchParseFailed: true, batchParseError: error.message || String(error) } };\n  }\n});"
}
```

### Robust Story Test Case Batch Retry Parser

| Field | Value |
| --- | --- |
| Node ID | 17ea3d82-4418-4b6d-87e4-7fc4b402a3c3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 5312, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Batch Retry Generator -> Robust Story Test Case Batch Retry Parser (output 0, input 0)

**Outgoing Connections**

- Robust Story Test Case Batch Retry Parser -> Merge Story Test Case Batches (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $(\u0027Prepare Story Test Case Batch Retry Prompt\u0027).all().map(item =\u003e item.json || {});\nconst responseItems = $input.all();\nconst NL = String.fromCharCode(10);\nconst BACKSLASH = String.fromCharCode(92);\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n  }\n  return String(value || \u0027\u0027).trim();\n};\nfunction extractBalancedJsonObject(source, text) {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) throw new Error(\u0027Retry response has no JSON object for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex);\n  let depth = 0, inString = false, escaped = false;\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n    if (inString) {\n      if (escaped) escaped = false;\n      else if (char === BACKSLASH) escaped = true;\n      else if (char === \u0027\"\u0027) inString = false;\n      continue;\n    }\n    if (char === \u0027\"\u0027) inString = true;\n    else if (char === \u0027{\u0027) depth += 1;\n    else if (char === \u0027}\u0027) { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }\n  }\n  throw new Error(\u0027Retry response still returned incomplete JSON for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex + \u0027. Output chars=\u0027 + text.length);\n}\nfunction normalizeCases(source, parsed) {\n  const expectedIds = source.planItems.map(plan =\u003e plan.testCaseId);\n  const testCases = Array.isArray(parsed.testCases) ? parsed.testCases : [];\n  const planById = new Map(source.planItems.map(plan =\u003e [plan.testCaseId.toUpperCase(), plan]));\n  const normalized = [];\n  const invalidIds = [];\n  for (const test of testCases) {\n    const id = String(test.testCaseId || \u0027\u0027).trim().toUpperCase();\n    if (!planById.has(id)) continue;\n    const plan = planById.get(id) || {};\n    const steps = Array.isArray(test.testSteps) ? test.testSteps.map(step =\u003e String(step || \u0027\u0027).trim()).filter(Boolean) : [];\n    if (steps.length \u003c 3 || !String(test.expectedResult || \u0027\u0027).trim()) { invalidIds.push(id); continue; }\n    normalized.push({ ...plan, ...test, testCaseId: id, summary: String(test.summary || test.title || plan.summary || id).trim(), coverageCategory: String(test.coverageCategory || plan.coverageCategory || \u0027Functional\u0027).trim(), testLevel: String(test.testLevel || plan.testLevel || \u0027UI\u0027).trim(), testCategory: String(test.testCategory || plan.testCategory || test.coverageCategory || plan.coverageCategory || \u0027Functional\u0027).trim(), testType: String(test.testType || plan.testType || \u0027functional\u0027).trim(), priority: String(test.priority || plan.priority || \u0027Medium\u0027).trim(), riskLevel: String(test.riskLevel || plan.riskLevel || \u0027Medium\u0027).trim(), automationFeasibility: String(test.automationFeasibility || plan.automationFeasibility || \u0027Medium\u0027).trim(), requirementReference: String(test.requirementReference || test.requirement || plan.requirementReference || source.storyKey + \u0027 story details\u0027).trim(), objective: String(test.objective || test.intent || plan.coverageIntent || \u0027\u0027).trim(), testSteps: steps });\n  }\n  const returnedIds = new Set(normalized.map(test =\u003e test.testCaseId.toUpperCase()));\n  const missing = expectedIds.filter(id =\u003e !returnedIds.has(id.toUpperCase()));\n  return { normalized, missing: Array.from(new Set([...missing, ...invalidIds])) };\n}\nreturn responseItems.map((item, index) =\u003e {\n  const source = sourceItems[index] || sourceItems[0] || {};\n  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;\n  let text = stringifyRaw(raw);\n  if (!text) throw new Error(\u0027Retry response was empty for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex);\n  const fence = String.fromCharCode(96, 96, 96);\n  const fenceStart = text.indexOf(fence);\n  const fenceEnd = text.lastIndexOf(fence);\n  if (fenceStart \u003e= 0 \u0026\u0026 fenceEnd \u003e fenceStart) {\n    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);\n    if (firstLineEnd \u003e= 0 \u0026\u0026 fenceEnd \u003e firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();\n  }\n  const candidate = extractBalancedJsonObject(source, text);\n  let parsed;\n  try { parsed = JSON.parse(candidate); } catch (error) { throw new Error(\u0027Retry JSON parse failed for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex + \u0027: \u0027 + error.message); }\n  const { normalized, missing } = normalizeCases(source, parsed);\n  if (missing.length) throw new Error(\u0027Retry response missing or invalid requested IDs for \u0027 + source.storyKey + \u0027 batch \u0027 + source.batchIndex + \u0027: \u0027 + missing.join(\u0027, \u0027));\n  const tokensInput = Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4));\n  const tokensOutput = Math.max(1, Math.ceil(candidate.length / 4));\n  return { json: { ...source, parsedBatch: { storyKey: parsed.storyKey || source.storyKey, batchIndex: source.batchIndex, testCases: normalized }, batchWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + \u0027s+\u0027)).length), batchTokensInput: tokensInput, batchTokensOutput: tokensOutput, batchEstimatedCostUsd: Number((((tokensInput * 0.40) + (tokensOutput * 1.60)) / 1000000).toFixed(6)), batchParseFailed: false, batchRetrySucceeded: true } };\n});"
}
```

### Robust Story Test Case Parser

| Field | Value |
| --- | --- |
| Node ID | 52a332b9-10b1-402a-909a-424b49e4bfeb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2816, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Generator -> Robust Story Test Case Parser (output 0, input 0)

**Outgoing Connections**

- Robust Story Test Case Parser -> Build Story Test Case Progress - Planning Coverage (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const sourceItems = $(\u0027Prepare Story Test Case Prompt\u0027).all().map(item =\u003e item.json || {});\nconst responseItems = $input.all();\nconst NL = String.fromCharCode(10);\nconst BACKSLASH = String.fromCharCode(92);\nconst stringifyRaw = value =\u003e {\n  if (value \u0026\u0026 typeof value === \u0027object\u0027) {\n    if (typeof value.output === \u0027string\u0027) return value.output;\n    if (typeof value.text === \u0027string\u0027) return value.text;\n    if (typeof value.response === \u0027string\u0027) return value.response;\n  }\n  return String(value || \u0027\u0027).trim();\n};\nconst extractBalancedJsonObject = (source, text) =\u003e {\n  const firstBrace = text.indexOf(\u0027{\u0027);\n  if (firstBrace \u003c 0) throw new Error(\u0027Coverage planner returned no JSON object for story \u0027 + source.storyKey + \u0027. Raw preview: \u0027 + text.slice(0, 500));\n  let depth = 0, inString = false, escaped = false;\n  for (let i = firstBrace; i \u003c text.length; i++) {\n    const char = text[i];\n    if (inString) {\n      if (escaped) escaped = false;\n      else if (char === BACKSLASH) escaped = true;\n      else if (char === \u0027\"\u0027) inString = false;\n      continue;\n    }\n    if (char === \u0027\"\u0027) inString = true;\n    else if (char === \u0027{\u0027) depth += 1;\n    else if (char === \u0027}\u0027) { depth -= 1; if (depth === 0) return text.slice(firstBrace, i + 1); }\n  }\n  throw new Error(\u0027Coverage planner returned incomplete JSON for story \u0027 + source.storyKey + \u0027. Output chars=\u0027 + text.length);\n};\nconst normalizeId = (value, index) =\u003e {\n  const raw = String(value || \u0027\u0027).trim().toUpperCase();\n  const match = raw.match(/TC[-_\\s]?(\\d+)/);\n  return \u0027TC-\u0027 + String(match ? Number(match[1]) : index + 1).padStart(3, \u00270\u0027);\n};\nconst normalizeText = (value, fallback) =\u003e String(value || fallback || \u0027\u0027).trim();\n\nreturn responseItems.map((item, index) =\u003e {\n  const source = sourceItems[index] || sourceItems[0] || {};\n  const raw = item.json?.output ?? item.json?.text ?? item.json?.response ?? item.json ?? item;\n  let text = stringifyRaw(raw);\n  if (!text) throw new Error(\u0027Coverage planner returned an empty response for story \u0027 + source.storyKey + \u0027.\u0027);\n  const fence = String.fromCharCode(96, 96, 96);\n  const fenceStart = text.indexOf(fence);\n  const fenceEnd = text.lastIndexOf(fence);\n  if (fenceStart \u003e= 0 \u0026\u0026 fenceEnd \u003e fenceStart) {\n    const firstLineEnd = text.indexOf(NL, fenceStart + fence.length);\n    if (firstLineEnd \u003e= 0 \u0026\u0026 fenceEnd \u003e firstLineEnd) text = text.slice(firstLineEnd + 1, fenceEnd).trim();\n  }\n  const candidate = extractBalancedJsonObject(source, text);\n  let parsed;\n  try { parsed = JSON.parse(candidate); } catch (error) { throw new Error(\u0027Coverage planner JSON parse failed for story \u0027 + source.storyKey + \u0027: \u0027 + error.message + \u0027. Raw preview: \u0027 + candidate.slice(0, 800)); }\n  const planRaw = Array.isArray(parsed.coveragePlan) ? parsed.coveragePlan : (Array.isArray(parsed.testCases) ? parsed.testCases : []);\n  if (!planRaw.length) throw new Error(\u0027Coverage planner returned no coveragePlan items for story \u0027 + source.storyKey + \u0027.\u0027);\n  const seen = new Set();\n  const coveragePlan = planRaw.map((entry, planIndex) =\u003e {\n    let testCaseId = normalizeId(entry.testCaseId, planIndex);\n    while (seen.has(testCaseId)) testCaseId = \u0027TC-\u0027 + String(seen.size + 1).padStart(3, \u00270\u0027);\n    seen.add(testCaseId);\n    return {\n      testCaseId,\n      summary: normalizeText(entry.summary, testCaseId + \u0027 for \u0027 + source.storySummary),\n      coverageCategory: normalizeText(entry.coverageCategory || entry.category, \u0027Functional\u0027),\n      testLevel: normalizeText(entry.testLevel, \u0027UI\u0027),\n      testCategory: normalizeText(entry.testCategory, entry.coverageCategory || \u0027Functional\u0027),\n      testType: normalizeText(entry.testType, \u0027functional\u0027),\n      priority: normalizeText(entry.priority, \u0027Medium\u0027),\n      riskLevel: normalizeText(entry.riskLevel, \u0027Medium\u0027),\n      automationFeasibility: normalizeText(entry.automationFeasibility, \u0027Medium\u0027),\n      requirementReference: normalizeText(entry.requirementReference, source.storyKey + \u0027 story details\u0027),\n      coverageIntent: normalizeText(entry.coverageIntent || entry.objective, entry.summary)\n    };\n  });\n  const categoryDistribution = coveragePlan.reduce((acc, plan) =\u003e { const key = plan.coverageCategory || \u0027Functional\u0027; acc[key] = (acc[key] || 0) + 1; return acc; }, {});\n  const sourceStoryKey = normalizeText(source.storyKey || source.jiraStoryKey || source.key, \u0027\u0027);\n  const modelStoryKey = normalizeText(parsed.storyKey, \u0027\u0027);\n  const storyKeyMismatch = Boolean(sourceStoryKey \u0026\u0026 modelStoryKey \u0026\u0026 sourceStoryKey.toUpperCase() !== modelStoryKey.toUpperCase());\n  return { json: { ...source, parsed: { storyKey: sourceStoryKey || modelStoryKey, storySummary: source.storySummary || parsed.storySummary || sourceStoryKey || modelStoryKey, modelStoryKey: modelStoryKey || null, modelStorySummary: normalizeText(parsed.storySummary, \u0027\u0027) || null, storyKeyMismatch, coveragePlan }, coveragePlan, plannedTestCaseCount: coveragePlan.length, categoryDistribution, storyWordCount: Math.max(1, candidate.trim().split(new RegExp(BACKSLASH + \u0027s+\u0027)).length), storyTokensInput: Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4)), storyTokensOutput: Math.max(1, Math.ceil(candidate.length / 4)), storyEstimatedCostUsd: Number((((Math.max(1, Math.ceil(((source.system || \u0027\u0027) + (source.user || \u0027\u0027)).length / 4)) * 0.40) + (Math.max(1, Math.ceil(candidate.length / 4)) * 1.60)) / 1000000).toFixed(6)) } };\n});"
}
```

### Search Existing Test Case By Stable Label

| Field | Value |
| --- | --- |
| Node ID | 2445849c-c4e0-4b29-ad99-6268ec697259 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 7328, 36 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Expand Story Test Case Items -> Search Existing Test Case By Stable Label (output 0, input 0)

**Outgoing Connections**

- Search Existing Test Case By Stable Label -> Attach Story Test Case Search Source (output 0, input 0)

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
                                                   "value":  "={{ (() =\u003e {\n  const escapeJqlString = (value) =\u003e String(value || \u0027\u0027).replace(/\\\\/g, \u0027\\\\\\\\\u0027).replace(/\"/g, \u0027\\\\\"\u0027);\n  const labels = Array.from(new Set([$json.stableLabel, $json.legacyStableLabel].filter(Boolean)));\n  const labelClause = labels.length === 1\n    ? \u0027labels = \"\u0027 + escapeJqlString(labels[0]) + \u0027\"\u0027\n    : \u0027labels in (\u0027 + labels.map(label =\u003e \u0027\"\u0027 + escapeJqlString(label) + \u0027\"\u0027).join(\u0027,\u0027) + \u0027)\u0027;\n  return \u0027project = \u0027 + $json.jiraProjectKey + \u0027 AND issuetype = \"\u0027 + ($json.testCaseIssueTypeName || \u0027Test Case\u0027) + \u0027\" AND \u0027 + labelClause + \u0027 ORDER BY created DESC\u0027;\n})() }}"
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
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  1500
                                               }
                                 }
                }
}
```

### Story Test Case Batch Generator

| Field | Value |
| --- | --- |
| Node ID | 63eb2462-79d2-45b2-8948-42be03fb9510 |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 3936, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Detail Batches -> Story Test Case Batch Generator (output 0, input 0)

**Outgoing Connections**

- Story Test Case Batch Generator -> Robust Story Test Case Batch Parser (output 0, input 0)

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

### Story Test Case Batch Needs Retry?

| Field | Value |
| --- | --- |
| Node ID | 6cf50361-27cd-4527-84dd-8a754db21e1e |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 4512, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Robust Story Test Case Batch Parser -> Story Test Case Batch Needs Retry? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Batch Needs Retry? -> Prepare Story Test Case Batch Retry Prompt (output 0, input 0)
- Story Test Case Batch Needs Retry? -> Merge Story Test Case Batches (output 1, input 0)

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
                                              "leftValue":  "={{ $json.batchParseFailed === true }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Story Test Case Batch Retry Generator

| Field | Value |
| --- | --- |
| Node ID | 7a9d0b36-f1f4-4247-921b-18ed3ad2c57d |
| Type | @n8n/n8n-nodes-langchain.agent |
| Type Version | 3.1 |
| Position | 4960, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Batch Retry Prompt -> Story Test Case Batch Retry Generator (output 0, input 0)

**Outgoing Connections**

- Story Test Case Batch Retry Generator -> Robust Story Test Case Batch Retry Parser (output 0, input 0)

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

### Story Test Case Completion Metrics Allowed?

| Field | Value |
| --- | --- |
| Node ID | 2cde3fcc-4b3c-4345-a1cc-a503a9f835c2 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 13600, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Direct Story Test Case Completion Output -> Story Test Case Completion Metrics Allowed? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Completion Metrics Allowed? -> LOG: Direct Story Test Case Job Completed (output 0, input 0)
- Story Test Case Completion Metrics Allowed? -> Mark Direct Story Test Case Job Completed (output 1, input 0)

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
                                              "leftValue":  "={{ String($json.terminalStatus || $json.output?.terminalStatus || \"completed\").toLowerCase() === \"completed\" }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Story Test Case Delta Has No Work?

| Field | Value |
| --- | --- |
| Node ID | 080df68e-fe85-4e49-8196-d101867b5300 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1792, -88 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Planning Scope -> Story Test Case Delta Has No Work? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Delta Has No Work? -> Build Story Test Case No-Change Result (output 0, input 0)
- Story Test Case Delta Has No Work? -> Fetch Jira Story Issue (output 1, input 0)

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
                                              "leftValue":  "={{ Boolean($json.noWork) }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
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
| Position | 2464, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Prompt -> Story Test Case Generator (output 0, input 0)

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

### Story Test Case Link Needed?

| Field | Value |
| --- | --- |
| Node ID | c31bd561-d309-4a0a-ae12-35327cc168de |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 11584, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Detect Existing Story Test Case Link -> Story Test Case Link Needed? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Link Needed? -> Link Created Test Case To Story (output 0, input 0)
- Story Test Case Link Needed? -> Mark Story Test Case Link Existing (output 1, input 0)

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
                                              "leftValue":  "={{ Boolean($json.linkNeeded) }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Test Case Needs Create?

| Field | Value |
| --- | --- |
| Node ID | 4f5844c8-6a19-4b5d-b568-f6bc9dedf800 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 7776, 36 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Attach Story Test Case Search Source -> Test Case Needs Create? (output 0, input 0)

**Outgoing Connections**

- Test Case Needs Create? -> Prepare Story Test Case Create Request (output 0, input 0)
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
                   },
    "options":  {

                }
}
```

### Update Existing Jira Test Case

| Field | Value |
| --- | --- |
| Node ID | c25dc0e0-ea93-4c37-a26a-626f8880ab5f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 9344, 60 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Progress - Updating Existing Jira -> Update Existing Jira Test Case (output 0, input 0)

**Outgoing Connections**

- Update Existing Jira Test Case -> Normalize Updated Existing Story Test Case (output 0, input 0)

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
    "method":  "PUT",
    "url":  "={{ $json.jiraBaseUrl + \"/rest/api/3/issue/\" + $json.testcaseKey }}",
    "authentication":  "predefinedCredentialType",
    "nodeCredentialType":  "jiraSoftwareCloudApi",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.updateIssueBody) }}",
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  2500
                                               }
                                 }
                }
}
```

### Upsert Story Test Case Mapping

| Field | Value |
| --- | --- |
| Node ID | 7919f86a-755a-4d4a-91c1-cd245bc9b2d1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 12256, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Linked Story Test Case -> Upsert Story Test Case Mapping (output 0, input 0)
- Mark Story Test Case Link Existing -> Upsert Story Test Case Mapping (output 0, input 0)

**Outgoing Connections**

- Upsert Story Test Case Mapping -> Build Story Test Case Progress - Finalizing Coverage (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: \"Relates\", status: $json.linkStatus === \"linked\" || $json.linkStatus === \"already_linked\" ? \"linked\" : ($json.action === \"updated\" ? \"updated\" : ($json.action === \"created\" ? \"created\" : \"reused\")), metadata: { action: $json.action, checkpoint: \"jira_publish_final\", link_status: $json.linkStatus || \"unknown\", link_checked: Boolean($json.linkChecked), link_created: Boolean($json.linkCreated), link_already_existed: $json.linkStatus === \"already_linked\", canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}",
    "options":  {

                }
}
```

### Upsert Story Test Case Publish Checkpoint

| Field | Value |
| --- | --- |
| Node ID | 17ab7fc7-83ff-41b0-a69c-cc44a7a3d9f6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 9792, 60 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Normalize Created Story Test Case -> Upsert Story Test Case Publish Checkpoint (output 0, input 0)
- Existing Test Case Needs Update? -> Upsert Story Test Case Publish Checkpoint (output 1, input 0)
- Normalize Updated Existing Story Test Case -> Upsert Story Test Case Publish Checkpoint (output 0, input 0)

**Outgoing Connections**

- Upsert Story Test Case Publish Checkpoint -> Recover Story Test Case Publish Checkpoint Items (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"resolution=merge-duplicates,return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_id: $json.projectId, project_name: $json.projectName, requested_by: $json.requestedBy, source_user_story_job_id: $json.storySourceJobId, story_jira_key: $json.storyKey, story_jira_id: $json.storyId, story_correlation_id: $json.storyCorrelationId || null, story_summary: $json.storySummary, testcase_jira_key: $json.testcaseKey, testcase_jira_id: $json.testcaseId, testcase_summary: $json.testCaseSummary, stable_label: $json.stableLabel, link_type: \"Relates\", status: ($json.action || \"unknown\") + \"_publish_checkpoint\", metadata: { action: $json.action, checkpoint: \"jira_publish_pre_link\", link_status: $json.linkStatus || \"not_checked\", canonical_stable_label: $json.canonicalStableLabel || $json.stableLabel, legacy_stable_label: $json.legacyStableLabel || null, all_stable_labels: $json.allStableLabels || [$json.stableLabel].filter(Boolean), priority: $json.priority, risk_level: $json.riskLevel, test_type: $json.testType, test_level: $json.testLevel, test_category: $json.testCategory, automation_feasibility: $json.automationFeasibility, requirement_reference: $json.requirementReference, story_link: $json.storyLink, testcase_link: $json.testcaseLink, test_data: $json.testData || [], acceptance_criteria_covered: $json.acceptanceCriteriaCovered || [], notes: $json.notes || [] } }) }}",
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1,
                                                   "batchInterval":  500
                                               }
                                 }
                }
}
```

### When Executed by Another Workflow

| Field | Value |
| --- | --- |
| Node ID | 4e15c0a4-c08a-4ab2-916c-6e626ee2413e |
| Type | n8n-nodes-base.executeWorkflowTrigger |
| Type Version | 1.1 |
| Position | 0, -88 |
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
