# PRO QA Generation Queue Creator - Ready Draft

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | yPgr7mtUnL3E8QQP |
| Active | True |
| Created At | 2026-05-11T04:17:16.626Z |
| Updated At | 2026-06-06T09:56:02.759Z |
| Node Count | 32 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\PRO QA Generation Queue Creator - Ready Draft [yPgr7mtUnL3E8QQP].json |

## Description

Professional queue creator for direct UI reuse. Supports retrying failed qa_jobs in place via retryJobId, resolves runtime config, writes queue/retry metrics, and returns UI-compatible jobId/status.

## Trigger And Entry Contract

- POST /generate-qa-doc | n8n-nodes-base.webhook | POST | generate-qa-doc
- Respond Queued | n8n-nodes-base.respondToWebhook
- Respond Professional Retry Unavailable | n8n-nodes-base.respondToWebhook
- Respond Runtime Error | n8n-nodes-base.respondToWebhook
- Respond Invalid Request | n8n-nodes-base.respondToWebhook
- OPTIONS /generate-qa-doc | n8n-nodes-base.webhook | OPTIONS | generate-qa-doc
- Respond CORS Preflight | n8n-nodes-base.respondToWebhook
- Respond RTM Prerequisite Job Failed | n8n-nodes-base.respondToWebhook
- Respond RTM Queue Error | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- OPTIONS /webhook/generate-qa-doc
- POST /webhook/generate-qa-doc

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 5 |
| n8n-nodes-base.httpRequest | 12 |
| n8n-nodes-base.if | 6 |
| n8n-nodes-base.respondToWebhook | 7 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- POST /generate-qa-doc -> Prepare Professional Queue Request (source output 0, target input 0)
- Prepare Professional Queue Request -> Valid Request? (source output 0, target input 0)
- Valid Request? -> Verify Supabase Auth User (source output 0, target input 0)
- Valid Request? -> Respond Invalid Request (source output 1, target input 0)
- Verify Supabase Auth User -> Fetch Active Q-Ops User Profile (source output 0, target input 0)
- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (source output 0, target input 0)
- Prepare Runtime Config Request -> Fetch Retry Source QA Job (source output 0, target input 0)
- Runtime Request Ready? -> Resolve Runtime Config (source output 0, target input 0)
- Runtime Request Ready? -> Respond Runtime Error (source output 1, target input 0)
- Resolve Runtime Config -> Combine Job And Runtime (source output 0, target input 0)
- Combine Job And Runtime -> Traceability Matrix Request? (source output 0, target input 0)
- Persist Professional Job -> Professional Job Persisted? (source output 0, target input 0)
- Professional Job Persisted? -> LOG: Professional Job Queued (source output 0, target input 0)
- Professional Job Persisted? -> Respond Professional Retry Unavailable (source output 1, target input 0)
- LOG: Professional Job Queued -> Respond Queued (source output 0, target input 0)
- OPTIONS /generate-qa-doc -> Respond CORS Preflight (source output 0, target input 0)
- Traceability Matrix Request? -> Persist RTM Preparing Job (source output 0, target input 0)
- Traceability Matrix Request? -> Persist Professional Job (source output 1, target input 0)
- Fetch RTM Prerequisite Jobs -> Fetch RTM Completed Ingestion Jobs (source output 0, target input 0)
- Fetch RTM Story Testcase Links -> Build RTM Traceability Context (source output 0, target input 0)
- Build RTM Traceability Context -> RTM Prerequisites Ready? (source output 0, target input 0)
- RTM Prerequisites Ready? -> Promote RTM Preparing Job to Pending (source output 0, target input 0)
- RTM Prerequisites Ready? -> Mark RTM Preparing Job Failed (source output 1, target input 0)
- Fetch RTM Completed Ingestion Jobs -> Fetch RTM Story Testcase Links (source output 0, target input 0)
- Fetch Retry Source QA Job -> Hydrate Retry Update Lineage (source output 0, target input 0)
- Hydrate Retry Update Lineage -> Runtime Request Ready? (source output 0, target input 0)
- Persist RTM Preparing Job -> RTM Preparing Job Persisted? (source output 0, target input 0)
- RTM Preparing Job Persisted? -> Fetch RTM Prerequisite Jobs (source output 0, target input 0)
- RTM Preparing Job Persisted? -> Respond RTM Queue Error (source output 1, target input 0)
- Promote RTM Preparing Job to Pending -> Professional Job Persisted? (source output 0, target input 0)
- Mark RTM Preparing Job Failed -> Respond RTM Prerequisite Job Failed (source output 0, target input 0)

## Nodes

### Build RTM Traceability Context

| Field | Value |
| --- | --- |
| Node ID | rtm-build-traceability-context |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch RTM Story Testcase Links -> Build RTM Traceability Context (output 0, input 0)

**Outgoing Connections**

- Build RTM Traceability Context -> RTM Prerequisites Ready? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = $(\u0027Combine Job And Runtime\u0027).item.json;\n\nfunction collect(name) {\n  return $items(name)\n    .map(item =\u003e item.json)\n    .flatMap(value =\u003e Array.isArray(value) ? value : [value])\n    .filter(Boolean);\n}\n\nfunction asObject(value) {\n  if (!value) return {};\n  if (typeof value === \u0027object\u0027) return value;\n  try { return JSON.parse(value); } catch { return {}; }\n}\n\nfunction documentTypeOf(row) {\n  const input = asObject(row.input);\n  const output = asObject(row.output);\n  return String(\n    input.documentType ||\n    output.documentType ||\n    output.body?.documentType ||\n    output.input?.documentType ||\n    \u0027\u0027\n  ).trim().toLowerCase();\n}\n\nfunction hasBacklogShape(row) {\n  const output = asObject(row.output);\n  return Array.isArray(output.jira?.epics) ||\n    Array.isArray(output.epics) ||\n    Array.isArray(output.jira?.stories);\n}\n\nfunction hasMappings(row) {\n  const output = asObject(row.output);\n  return Array.isArray(output.mappings) || Array.isArray(output.stories);\n}\n\nfunction firstArray(...values) {\n  return values.find(value =\u003e Array.isArray(value)) || [];\n}\n\nfunction normalizeCategories(metadata) {\n  const value = asObject(metadata);\n  const raw = value.categories || value.testCategories || value.testTypes || value.type || value.category || [];\n  const list = Array.isArray(raw) ? raw : String(raw || \u0027\u0027).split(\u0027,\u0027);\n  return [...new Set(list.map(item =\u003e String(item || \u0027\u0027).trim()).filter(Boolean))];\n}\n\nfunction parseTime(value) {\n  if (!value) return null;\n  const timestamp = Date.parse(value);\n  return Number.isFinite(timestamp) ? timestamp : null;\n}\n\nfunction isoTime(value) {\n  const timestamp = parseTime(value);\n  return timestamp ? new Date(timestamp).toISOString() : null;\n}\n\nfunction eventTime(row) {\n  return parseTime(row?.created_at) || parseTime(row?.updated_at) || null;\n}\n\nfunction compactJob(row) {\n  if (!row) return null;\n  return {\n    jobId: row.job_id || null,\n    createdAt: isoTime(row.created_at),\n    updatedAt: isoTime(row.updated_at),\n    status: row.status || null\n  };\n}\n\nfunction buildFreshness(latestIngestion, backlogJob, testCaseJob) {\n  const latestIngestionAt = eventTime(latestIngestion);\n  const backlogAt = eventTime(backlogJob);\n  const testCaseAt = eventTime(testCaseJob);\n  const warnings = [];\n\n  if (!backlogJob || !testCaseJob) {\n    return {\n      status: \u0027blocked\u0027,\n      checkedAt: new Date().toISOString(),\n      latestCompletedIngestion: compactJob(latestIngestion),\n      backlogJob: compactJob(backlogJob),\n      storyTestCaseJob: compactJob(testCaseJob),\n      warnings: [{\n        code: \u0027RTM_PREREQUISITES_MISSING\u0027,\n        message: \u0027RTM freshness could not be fully evaluated because required upstream artifacts are missing.\u0027,\n        recommendedAction: \u0027Generate Epics \u0026 User Stories and Story Test Cases before generating RTM.\u0027\n      }]\n    };\n  }\n\n  if (latestIngestionAt \u0026\u0026 backlogAt \u0026\u0026 latestIngestionAt \u003e backlogAt) {\n    warnings.push({\n      code: \u0027SOURCE_NEWER_THAN_BACKLOG\u0027,\n      message: \u0027Completed source ingestion is newer than the Epics \u0026 User Stories job used for this RTM.\u0027,\n      recommendedAction: \u0027Regenerate Epics \u0026 User Stories, then regenerate Story Test Cases and RTM for fully fresh traceability.\u0027\n    });\n  }\n  if (latestIngestionAt \u0026\u0026 testCaseAt \u0026\u0026 latestIngestionAt \u003e testCaseAt) {\n    warnings.push({\n      code: \u0027SOURCE_NEWER_THAN_TEST_CASES\u0027,\n      message: \u0027Completed source ingestion is newer than the Story Test Cases job used for this RTM.\u0027,\n      recommendedAction: \u0027Regenerate Story Test Cases after refreshing backlog coverage.\u0027\n    });\n  }\n  if (backlogAt \u0026\u0026 testCaseAt \u0026\u0026 backlogAt \u003e testCaseAt) {\n    warnings.push({\n      code: \u0027BACKLOG_NEWER_THAN_TEST_CASES\u0027,\n      message: \u0027Epics \u0026 User Stories are newer than the Story Test Cases job used for this RTM.\u0027,\n      recommendedAction: \u0027Regenerate Story Test Cases so test coverage reflects the latest stories.\u0027\n    });\n  }\n\n  return {\n    status: warnings.length ? \u0027warning\u0027 : \u0027ready\u0027,\n    checkedAt: new Date().toISOString(),\n    latestCompletedIngestion: compactJob(latestIngestion),\n    backlogJob: compactJob(backlogJob),\n    storyTestCaseJob: compactJob(testCaseJob),\n    warnings\n  };\n}\n\nfunction compactEpic(epic) {\n  return {\n    epicKey: epic.jiraEpicKey || epic.epicKey || epic.key || null,\n    epicId: epic.jiraEpicId || epic.epicId || epic.id || null,\n    epicName: epic.epicName || epic.name || epic.summary || null,\n    epicCorrelationId: epic.epicCorrelationId || epic.correlationId || null\n  };\n}\n\nfunction compactStory(story) {\n  return {\n    storyKey: story.storyKey || story.jiraStoryKey || story.key || null,\n    storyId: story.storyId || story.jiraStoryId || story.id || null,\n    storySummary: story.summary || story.storySummary || story.name || null,\n    parentEpicKey: story.parentEpicKey || story.epicKey || story.parent?.key || null,\n    storyCorrelationId: story.storyCorrelationId || story.correlationId || null,\n    storyUrl: story.storySelf || story.link || story.url || null\n  };\n}\n\nconst projectId = job.projectId || job.input?.projectId || null;\nconst projectName = job.projectName || job.input?.projectName || null;\nconst prerequisiteJobs = collect(\u0027Fetch RTM Prerequisite Jobs\u0027);\nconst completedIngestions = collect(\u0027Fetch RTM Completed Ingestion Jobs\u0027);\nconst allLinks = collect(\u0027Fetch RTM Story Testcase Links\u0027);\n\nconst backlogJobs = prerequisiteJobs.filter(row =\u003e {\n  const docType = documentTypeOf(row);\n  return docType === \u0027user_stories\u0027 || (!docType \u0026\u0026 hasBacklogShape(row));\n});\n\nconst testCaseJobs = prerequisiteJobs.filter(row =\u003e {\n  const docType = documentTypeOf(row);\n  return docType === \u0027story_test_cases\u0027 || docType === \u0027test_cases\u0027 || hasMappings(row);\n});\n\nconst backlogJob = backlogJobs[0] || null;\nconst testCaseJob = testCaseJobs[0] || null;\nconst latestCompletedIngestion = completedIngestions[0] || null;\nconst freshness = buildFreshness(latestCompletedIngestion, backlogJob, testCaseJob);\nconst backlogOutput = asObject(backlogJob?.output);\nconst epics = firstArray(backlogOutput.jira?.epics, backlogOutput.epics).map(compactEpic).filter(epic =\u003e epic.epicKey || epic.epicName);\nconst stories = firstArray(backlogOutput.jira?.stories, backlogOutput.stories).map(compactStory).filter(story =\u003e story.storyKey || story.storySummary);\n\nconst eligibleLinks = allLinks.filter(link =\u003e {\n  if (!link.story_jira_key || !link.testcase_jira_key) return false;\n  const status = String(link.status || \u0027\u0027).toLowerCase();\n  return ![\u0027failed\u0027, \u0027deleted\u0027, \u0027superseded\u0027].includes(status);\n});\n\nlet activeLinks = eligibleLinks.filter(link =\u003e\n  (testCaseJob?.job_id \u0026\u0026 link.job_id === testCaseJob.job_id) ||\n  (backlogJob?.job_id \u0026\u0026 link.source_user_story_job_id === backlogJob.job_id)\n);\nif (!activeLinks.length) activeLinks = eligibleLinks;\n\nconst compactLinks = activeLinks.map(link =\u003e ({\n  sourceTestCaseJobId: link.job_id || null,\n  sourceUserStoryJobId: link.source_user_story_job_id || null,\n  storyKey: link.story_jira_key || null,\n  storyId: link.story_jira_id || null,\n  storyCorrelationId: link.story_correlation_id || null,\n  storySummary: link.story_summary || null,\n  testcaseKey: link.testcase_jira_key || null,\n  testcaseId: link.testcase_jira_id || null,\n  testcaseSummary: link.testcase_summary || null,\n  stableLabel: link.stable_label || null,\n  linkType: link.link_type || null,\n  status: link.status || null,\n  categories: normalizeCategories(link.metadata)\n}));\n\nconst dedupedLinks = [];\nconst seenLinks = new Set();\nfor (const link of compactLinks) {\n  const key = [\n    link.sourceTestCaseJobId || \u0027\u0027,\n    link.sourceUserStoryJobId || \u0027\u0027,\n    link.storyKey || \u0027\u0027,\n    link.testcaseKey || \u0027\u0027,\n    link.stableLabel || \u0027\u0027\n  ].join(\u0027|\u0027);\n  if (seenLinks.has(key)) continue;\n  seenLinks.add(key);\n  dedupedLinks.push(link);\n}\n\nconst linkedStoryKeys = new Set(dedupedLinks.map(link =\u003e link.storyKey).filter(Boolean));\nconst storiesWithoutTestCases = stories.filter(story =\u003e story.storyKey \u0026\u0026 !linkedStoryKeys.has(story.storyKey));\n\nconst missing = [];\nif (!projectId) missing.push(\u0027project_id\u0027);\nif (!backlogJob) missing.push(\u0027completed Epics \u0026 User Stories job\u0027);\nif (!stories.length) missing.push(\u0027generated user stories\u0027);\nif (!testCaseJob) missing.push(\u0027completed Story Test Cases job\u0027);\nif (!dedupedLinks.length) missing.push(\u0027story-to-test-case mappings in qa_story_testcase_links\u0027);\n\nconst ok = missing.length === 0;\nconst traceabilityContext = {\n  version: \u0027two_layer_rtm_v1\u0027,\n  projectId,\n  projectName,\n  backlogJobId: backlogJob?.job_id || null,\n  storyTestCaseJobId: testCaseJob?.job_id || null,\n  generatedAt: new Date().toISOString(),\n  freshness,\n  counts: {\n    epics: epics.length,\n    stories: stories.length,\n    storyTestCaseLinks: dedupedLinks.length,\n    linkedStories: linkedStoryKeys.size,\n    storiesWithoutTestCases: storiesWithoutTestCases.length\n  },\n  epics,\n  stories,\n  storyTestCaseLinks: dedupedLinks,\n  storiesWithoutTestCases\n};\n\nif (!ok) {\n  return [{\n    json: {\n      ...job,\n      ok: false,\n      statusCode: 409,\n      errorCode: \u0027RTM_PREREQUISITES_MISSING\u0027,\n      message: \u0027Requirement Traceability Matrix needs completed Epics \u0026 User Stories and Story Test Cases for this project before it can be generated. Missing: \u0027 + missing.join(\u0027, \u0027),\n      rtmPrerequisitesOk: false,\n      rtmMissingPrerequisites: missing,\n      rtmFreshness: freshness\n    }\n  }];\n}\n\nreturn [{\n  json: {\n    ...job,\n    rtmPrerequisitesOk: true,\n    rtmFreshness: freshness,\n    input: {\n      ...job.input,\n      traceabilityMode: \u0027two_layer_rtm\u0027,\n      traceabilityContext\n    }\n  }\n}];"
}
```

### Combine Job And Runtime

| Field | Value |
| --- | --- |
| Node ID | 94b58282-0f7a-40b2-987a-7b4c6abaae6f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1776, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Resolve Runtime Config -> Combine Job And Runtime (output 0, input 0)

**Outgoing Connections**

- Combine Job And Runtime -> Traceability Matrix Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const runtimeRaw = $input.first().json || {};\nconst runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;\nconst hydratedJob = $(\u0027Hydrate Retry Update Lineage\u0027).item?.json;\nconst fallbackJob = $(\u0027Prepare Runtime Config Request\u0027).item.json;\nconst job = hydratedJob \u0026\u0026 hydratedJob.ok !== false ? hydratedJob : fallbackJob;\nconst settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? 1;\nconst configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? runtime ?? {};\nreturn [{ json: { ...job, settingsVersion, configSnapshot } }];"
}
```

### Fetch Active Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 9d04a3c8-aa9d-4023-bcf6-0acb4cdc3631 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Active Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Retry Source QA Job

| Field | Value |
| --- | --- |
| Node ID | retry-lineage-fetch-source-job-v1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1312, 448 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Runtime Config Request -> Fetch Retry Source QA Job (output 0, input 0)

**Outgoing Connections**

- Fetch Retry Source QA Job -> Hydrate Retry Update Lineage (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ encodeURIComponent($json.projectId || $json.input?.projectId || \u0027__none__\u0027) }}\u0026select=job_id,status,input,output,retry_of_job_id,retried_by_job_id,retry_attempt,project_id,created_at,updated_at\u0026order=created_at.desc\u0026limit=50",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch RTM Completed Ingestion Jobs

| Field | Value |
| --- | --- |
| Node ID | rtm-fetch-completed-ingestion-jobs |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, -192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Fetch RTM Prerequisite Jobs -> Fetch RTM Completed Ingestion Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch RTM Completed Ingestion Jobs -> Fetch RTM Story Testcase Links (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?project_id=eq.{{ encodeURIComponent($(\u0027Combine Job And Runtime\u0027).item.json.projectId || \u0027\u0027) }}\u0026status=eq.completed\u0026order=created_at.desc\u0026limit=25\u0026select=job_id,status,created_at,updated_at,project_id,input,output",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch RTM Prerequisite Jobs

| Field | Value |
| --- | --- |
| Node ID | rtm-fetch-prereq-jobs |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 64 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- RTM Preparing Job Persisted? -> Fetch RTM Prerequisite Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch RTM Prerequisite Jobs -> Fetch RTM Completed Ingestion Jobs (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ encodeURIComponent($(\u0027Combine Job And Runtime\u0027).item.json.projectId || \u0027\u0027) }}\u0026status=eq.completed\u0026order=created_at.desc\u0026limit=50\u0026select=job_id,status,input,output,created_at,updated_at,project_id,requested_by",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch RTM Story Testcase Links

| Field | Value |
| --- | --- |
| Node ID | rtm-fetch-story-testcase-links |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Fetch RTM Completed Ingestion Jobs -> Fetch RTM Story Testcase Links (output 0, input 0)

**Outgoing Connections**

- Fetch RTM Story Testcase Links -> Build RTM Traceability Context (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_story_testcase_links?project_id=eq.{{ encodeURIComponent($(\u0027Combine Job And Runtime\u0027).item.json.projectId || \u0027\u0027) }}\u0026order=created_at.desc\u0026limit=1000\u0026select=job_id,source_user_story_job_id,story_jira_key,story_jira_id,story_correlation_id,story_summary,testcase_jira_key,testcase_jira_id,testcase_summary,stable_label,link_type,status,metadata,created_at,updated_at,project_id,project_name",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Hydrate Retry Update Lineage

| Field | Value |
| --- | --- |
| Node ID | retry-lineage-hydrate-update-v1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Retry Source QA Job -> Hydrate Retry Update Lineage (output 0, input 0)

**Outgoing Connections**

- Hydrate Retry Update Lineage -> Runtime Request Ready? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = $(\u0027Prepare Runtime Config Request\u0027).item.json || {};\n\nfunction asObject(value) {\n  if (!value) return {};\n  if (typeof value === \u0027object\u0027) return value;\n  try { return JSON.parse(value); } catch { return {}; }\n}\n\nfunction clean(value) {\n  return String(value || \u0027\u0027).trim();\n}\n\nconst sourceRows = $input.all()\n  .flatMap(item =\u003e Array.isArray(item.json) ? item.json : [item.json])\n  .filter(row =\u003e row \u0026\u0026 row.job_id)\n  .filter(row =\u003e {\n    const rowInput = asObject(row.input);\n    const rowOutput = asObject(row.output);\n    const rowDocumentType = clean(rowInput.documentType || rowOutput.documentType || rowOutput.body?.documentType).toLowerCase();\n    const jobDocumentType = clean(job.input?.documentType || job.documentType).toLowerCase();\n    return !jobDocumentType || !rowDocumentType || rowDocumentType === jobDocumentType;\n  });\n\nfunction rowDetails(row) {\n  const sourceInput = asObject(row?.input);\n  const sourceOutput = asObject(row?.output);\n  const sourceRetryContext = asObject(sourceInput.retryContext);\n  const sourceUpdateContext = asObject(sourceInput.updateContext);\n  const sourceUpdateOfJobId = clean(\n    sourceInput.updateOfJobId ||\n    sourceUpdateContext.previousJobId ||\n    sourceUpdateContext.previous_job_id ||\n    sourceRetryContext.updateOfJobId ||\n    sourceOutput.updateOfJobId ||\n    sourceOutput.updateContext?.previousJobId ||\n    sourceOutput.metadata?.update_of_job_id\n  );\n  const sourceGenerationMode = clean(sourceInput.generationMode || sourceRetryContext.generationMode || sourceOutput.generationMode || sourceOutput.metadata?.generation_mode).toLowerCase();\n  const sourceWasUpdate = (\n    sourceGenerationMode === \u0027update\u0027 ||\n    sourceInput.updateMode === true ||\n    sourceUpdateContext.updateMode === true ||\n    Boolean(sourceUpdateOfJobId)\n  );\n  return { row, sourceInput, sourceOutput, sourceRetryContext, sourceUpdateContext, sourceUpdateOfJobId, sourceGenerationMode, sourceWasUpdate };\n}\n\nconst byJobId = new Map(sourceRows.map(row =\u003e [row.job_id, row]));\nconst chainRows = [];\nconst seenChain = new Set();\nlet cursor = clean(job.retryOfJobId || job.input?.retryOfJobId || job.input?.retryContext?.retryOfJobId);\nwhile (cursor \u0026\u0026 !seenChain.has(cursor)) {\n  seenChain.add(cursor);\n  const row = byJobId.get(cursor);\n  if (!row) break;\n  chainRows.push(row);\n  cursor = clean(row.retry_of_job_id || asObject(row.input).retryOfJobId || asObject(row.input).retryContext?.retryOfJobId);\n}\nconst candidateRows = [...chainRows, ...sourceRows];\nconst source = candidateRows.map(rowDetails).find(item =\u003e item.sourceWasUpdate) || rowDetails(chainRows[0] || sourceRows[0] || {});\nconst { row: sourceRow, sourceInput, sourceOutput, sourceUpdateContext, sourceUpdateOfJobId, sourceWasUpdate } = source;\n\nif (!job.retryMode || !sourceWasUpdate) {\n  return [{ json: job }];\n}\n\nconst retryOfJobId = clean(job.retryOfJobId || job.input?.retryOfJobId || job.input?.retryContext?.retryOfJobId || sourceRow.job_id);\nconst updateOfJobId = sourceUpdateOfJobId || clean(job.updateOfJobId || job.input?.updateOfJobId || job.input?.updateContext?.previousJobId);\nconst existingUpdateContext = asObject(job.input?.updateContext);\nconst mergedUpdateContext = {\n  ...sourceUpdateContext,\n  ...existingUpdateContext,\n  previousJobId: updateOfJobId || sourceUpdateContext.previousJobId || null,\n  updateMode: true,\n  deltaRequested: existingUpdateContext.deltaRequested ?? sourceUpdateContext.deltaRequested ?? true,\n  preserveExistingBacklog: existingUpdateContext.preserveExistingBacklog ?? sourceUpdateContext.preserveExistingBacklog ?? true,\n  retryOfJobId,\n  retrySourceJobId: sourceRow.job_id || retryOfJobId,\n  retryLineageHydrated: true\n};\nconst retryInstruction = job.retryInstruction || job.input?.retryInstruction || \u0027Retry the failed update as an update repair. Preserve update semantics, patch the existing target output, and do not create duplicate Jira or Confluence artifacts.\u0027;\nconst retryContext = {\n  ...(job.input?.retryContext || {}),\n  retryOfJobId,\n  retryMode: true,\n  generationMode: \u0027update\u0027,\n  updateOfJobId: updateOfJobId || null,\n  previousStatus: sourceRow.status || job.input?.retryContext?.previousStatus || null,\n  previousError: sourceOutput.message || sourceOutput.error || job.input?.retryContext?.previousError || null,\n  retryInstruction\n};\n\nreturn [{\n  json: {\n    ...job,\n    generationMode: \u0027update\u0027,\n    updateMode: true,\n    updateOfJobId: updateOfJobId || null,\n    retryInstruction,\n    input: {\n      ...job.input,\n      generationMode: \u0027update\u0027,\n      updateMode: true,\n      updateOfJobId: updateOfJobId || null,\n      updateContext: mergedUpdateContext,\n      retryContext,\n      retryInstruction\n    }\n  }\n}];"
}
```

### LOG: Professional Job Queued

| Field | Value |
| --- | --- |
| Node ID | 8d7fa422-a003-4c5e-9c9c-9e1e8844673e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3808, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Job Persisted? -> LOG: Professional Job Queued (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Job Queued -> Respond Queued (output 0, input 0)

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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $(\"Combine Job And Runtime\").item.json.jobId, project_name: $(\"Combine Job And Runtime\").item.json.input.projectName, document_type: $(\"Combine Job And Runtime\").item.json.input.documentType, pipeline: \"generation\", event: $(\"Combine Job And Runtime\").item.json.retryMode ? \"JOB_RETRIED\" : ($(\"Combine Job And Runtime\").item.json.generationMode === \"update\" ? \"JOB_UPDATE_QUEUED\" : \"JOB_QUEUED\"), status: \"info\", project_id: $(\"Combine Job And Runtime\").item.json.projectId, requested_by: $(\"Combine Job And Runtime\").item.json.requestedBy, metadata: { generator_mode: \"professional\", retry: Boolean($(\"Combine Job And Runtime\").item.json.retryMode), generation_mode: $(\"Combine Job And Runtime\").item.json.generationMode || $(\"Combine Job And Runtime\").item.json.input?.generationMode || \"create\", update: $(\"Combine Job And Runtime\").item.json.generationMode === \"update\", update_of_job_id: $(\"Combine Job And Runtime\").item.json.updateOfJobId || $(\"Combine Job And Runtime\").item.json.input?.updateOfJobId || $(\"Combine Job And Runtime\").item.json.input?.updateContext?.previousJobId || null, retry_of_job_id: $(\"Combine Job And Runtime\").item.json.retryOfJobId || null, retry_instruction: $(\"Combine Job And Runtime\").item.json.retryInstruction || null, product_owner: $(\"Combine Job And Runtime\").item.json.input.productOwner, settings_version: $(\"Combine Job And Runtime\").item.json.settingsVersion, environment: $(\"Combine Job And Runtime\").item.json.environment, config_source_priority: $(\"Combine Job And Runtime\").item.json.configSnapshot?.scope?.sourcePriority || $(\"Combine Job And Runtime\").item.json.configSnapshot?.sourcePriority || {} } }) }}",
    "options":  {

                }
}
```

### Mark RTM Preparing Job Failed

| Field | Value |
| --- | --- |
| Node ID | rtm-mark-preparing-job-failed-v1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3360, 304 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- RTM Prerequisites Ready? -> Mark RTM Preparing Job Failed (output 1, input 0)

**Outgoing Connections**

- Mark RTM Preparing Job Failed -> Respond RTM Prerequisite Job Failed (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.preparing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"failed\", error: $json.message || \"RTM prerequisites were not ready.\", output: { status: \"failed\", errorType: $json.errorCode || \"RTM_PREREQUISITES_MISSING\", message: $json.message || \"RTM prerequisites were not ready.\", rtmMissingPrerequisites: $json.rtmMissingPrerequisites || [], rtmFreshness: $json.rtmFreshness || null }, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### OPTIONS /generate-qa-doc

| Field | Value |
| --- | --- |
| Node ID | 8f33aa57-5313-4181-88b1-716f31167b96 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OPTIONS /generate-qa-doc -> Respond CORS Preflight (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "OPTIONS",
    "path":  "generate-qa-doc",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Persist Professional Job

| Field | Value |
| --- | --- |
| Node ID | 3a274e85-b04a-4eb1-80ca-062ee17f1362 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3360, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Traceability Matrix Request? -> Persist Professional Job (output 1, input 0)

**Outgoing Connections**

- Persist Professional Job -> Professional Job Persisted? (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, status: \"pending\", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, retry_of_job_id: $json.retryOfJobId || null }) }}",
    "options":  {

                }
}
```

### Persist RTM Preparing Job

| Field | Value |
| --- | --- |
| Node ID | rtm-persist-preparing-job-v1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2224, -224 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Traceability Matrix Request? -> Persist RTM Preparing Job (output 0, input 0)

**Outgoing Connections**

- Persist RTM Preparing Job -> RTM Preparing Job Persisted? (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, status: \"preparing\", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, retry_of_job_id: $json.retryOfJobId || null }) }}",
    "options":  {

                }
}
```

### POST /generate-qa-doc

| Field | Value |
| --- | --- |
| Node ID | 8f2d2edb-ee04-4439-9b81-8adb8613735e |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- POST /generate-qa-doc -> Prepare Professional Queue Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-qa-doc",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Professional Queue Request

| Field | Value |
| --- | --- |
| Node ID | 57829829-6b5d-422c-8975-86fa4ca48b87 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /generate-qa-doc -> Prepare Professional Queue Request (output 0, input 0)

**Outgoing Connections**

- Prepare Professional Queue Request -> Valid Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2, 10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `PRO-${datePart}-${randomPart}`;\nconst headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst input = $json.body || {};\nconst retryOfJobId = String(input.retryJobId || input.retryOfJobId || \u0027\u0027).trim();\nconst isRetry = Boolean(retryOfJobId);\nconst requestedGenerationMode = String(input.generationMode || input.mode || \u0027\u0027).trim().toLowerCase();\nconst updateContext = input.updateContext \u0026\u0026 typeof input.updateContext === \u0027object\u0027 ? input.updateContext : {};\nconst updateOfJobId = String(input.updateOfJobId || updateContext.previousJobId || updateContext.previous_job_id || \u0027\u0027).trim();\nconst isUpdate = requestedGenerationMode === \u0027update\u0027 || Boolean(updateOfJobId);\nconst generationMode = isUpdate ? \u0027update\u0027 : (isRetry ? \u0027retry\u0027 : \u0027create\u0027);\nconst documentTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027, \u0027test_cases\u0027, \u0027user_stories\u0027, \u0027traceability_matrix\u0027]);\nconst documentType = String(input.documentType || \u0027\u0027).trim().toLowerCase();\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 } }];\n}\nif (!String(input.projectName || \u0027\u0027).trim() || !documentTypes.has(documentType)) {\n  return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_REQUEST\u0027, message: \u0027projectName and supported documentType are required\u0027 } }];\n}\n\nconst defaultRetryInstruction = isRetry\n  ? [\n      generationMode === \u0027update\u0027\n        ? \u0027This request is an update retry for a failed update attempt.\u0027\n        : \u0027This request is a regeneration retry for a failed generation attempt.\u0027,\n      \u0027Previous failed job id: \u0027 + retryOfJobId + \u0027.\u0027,\n      \u0027Preserve the same document type and project scope.\u0027,\n      generationMode === \u0027update\u0027\n        ? \u0027Preserve update semantics, patch the previous successful target output, and do not create duplicate Jira or Confluence artifacts.\u0027\n        : \u0027If the previous attempt failed a quality gate, expand the output with grounded project evidence, include all required sections, and meet the configured minimum word count.\u0027,\n      \u0027Do not fabricate requirements; cite retrieved source metadata where available.\u0027\n    ].join(\u0027 \u0027)\n  : \u0027\u0027;\n\nconst retryContext = {\n  ...(input.retryContext || {}),\n  retryOfJobId: isRetry ? retryOfJobId : null,\n  retryMode: isRetry,\n  generationMode,\n  updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,\n  retryInstruction: input.retryInstruction || defaultRetryInstruction\n};\n\nconst normalizedUpdateContext = isUpdate ? {\n  ...updateContext,\n  previousJobId: updateOfJobId || updateContext.previousJobId || null,\n  updateMode: true,\n  deltaRequested: updateContext.deltaRequested !== false,\n  preserveExistingBacklog: updateContext.preserveExistingBacklog !== false,\n  retryOfJobId: isRetry ? retryOfJobId : (updateContext.retryOfJobId || null)\n} : {};\n\nreturn [{\n  json: {\n    ok: true,\n    jobId,\n    retryMode: isRetry,\n    generationMode,\n    updateMode: isUpdate,\n    updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,\n    retryOfJobId: isRetry ? retryOfJobId : null,\n    retryInstruction: retryContext.retryInstruction,\n    input: {\n      ...input,\n      retryJobId: undefined,\n      jobId: undefined,\n      retryOfJobId: isRetry ? retryOfJobId : null,\n      retryContext,\n      retryInstruction: retryContext.retryInstruction,\n      generationMode,\n      updateMode: isUpdate,\n      updateOfJobId: isUpdate ? (updateOfJobId || updateContext.previousJobId || null) : null,\n      updateContext: normalizedUpdateContext,\n      documentType,\n      generatorMode: \u0027professional\u0027\n    },\n    token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027),\n    projectId: input.projectId || null,\n    environment: input.environment || \u0027local\u0027\n  }\n}];"
}
```

### Prepare Runtime Config Request

| Field | Value |
| --- | --- |
| Node ID | f6b32777-fcd3-4485-9033-d76a23f7e410 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (output 0, input 0)

**Outgoing Connections**

- Prepare Runtime Config Request -> Fetch Retry Source QA Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const profile = Array.isArray($json) ? $json[0] : $json;\nconst job = $(\u0027Prepare Professional Queue Request\u0027).item.json;\nif (!profile?.id || profile.status !== \u0027active\u0027) {\n  return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\n}\nreturn [{\n  json: {\n    ...job,\n    requestedBy: profile.id,\n    qopsUser: profile,\n    runtimeRequest: {\n      p_environment_key: job.environment || \u0027local\u0027,\n      p_project_id: job.projectId || null,\n      p_pipeline: \u0027generation\u0027,\n      p_requested_by: profile.id\n    }\n  }\n}];"
}
```

### Professional Job Persisted?

| Field | Value |
| --- | --- |
| Node ID | 1091dfc9-d765-4bdf-9285-ee464b883764 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 3584, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Professional Job -> Professional Job Persisted? (output 0, input 0)
- Promote RTM Preparing Job to Pending -> Professional Job Persisted? (output 0, input 0)

**Outgoing Connections**

- Professional Job Persisted? -> LOG: Professional Job Queued (output 0, input 0)
- Professional Job Persisted? -> Respond Professional Retry Unavailable (output 1, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Promote RTM Preparing Job to Pending

| Field | Value |
| --- | --- |
| Node ID | rtm-promote-preparing-job-v1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3360, -128 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- RTM Prerequisites Ready? -> Promote RTM Preparing Job to Pending (output 0, input 0)

**Outgoing Connections**

- Promote RTM Preparing Job to Pending -> Professional Job Persisted? (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.preparing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"pending\", input: $json.input, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Resolve Runtime Config

| Field | Value |
| --- | --- |
| Node ID | 978b1a6e-8f07-4610-a68e-779e7d0bfa12 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1552, 32 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Runtime Request Ready? -> Resolve Runtime Config (output 0, input 0)

**Outgoing Connections**

- Resolve Runtime Config -> Combine Job And Runtime (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.runtimeRequest) }}",
    "options":  {

                }
}
```

### Respond CORS Preflight

| Field | Value |
| --- | --- |
| Node ID | 9fd5263c-72e1-4078-b60a-e7643bab62ac |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /generate-qa-doc -> Respond CORS Preflight (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: true }) }}",
    "options":  {
                    "responseCode":  204,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Methods",
                                                                "value":  "POST, OPTIONS"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Headers",
                                                                "value":  "authorization, content-type"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Max-Age",
                                                                "value":  "86400"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond Invalid Request

| Field | Value |
| --- | --- |
| Node ID | 0ad1b15a-42cd-456d-9744-f02178f3c615 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Request? -> Respond Invalid Request (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: $json.errorCode || \"INVALID_REQUEST\", message: $json.message || \"Invalid request\" } }) }}",
    "options":  {
                    "responseCode":  "={{ $json.statusCode || 400 }}",
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond Professional Retry Unavailable

| Field | Value |
| --- | --- |
| Node ID | 4e3e4317-c307-4354-99f1-423733a12fd9 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 3808, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Job Persisted? -> Respond Professional Retry Unavailable (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: \"RETRY_UNAVAILABLE\", message: \"The failed QA generation job could not be retried. It may already be running, completed, or owned by another user.\" } }) }}",
    "options":  {
                    "responseCode":  409,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond Queued

| Field | Value |
| --- | --- |
| Node ID | 4f4d84e4-b54f-45ae-8eab-8719c1fadae7 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 4032, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Job Queued -> Respond Queued (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ jobId: $(\"Combine Job And Runtime\").item.json.jobId, status: \"queued\", generatorMode: \"professional\", retried: Boolean($(\"Combine Job And Runtime\").item.json.retryMode), retryOfJobId: $(\"Combine Job And Runtime\").item.json.retryOfJobId || null, generationMode: $(\"Combine Job And Runtime\").item.json.generationMode || $(\"Combine Job And Runtime\").item.json.input?.generationMode || \"create\", updateOfJobId: $(\"Combine Job And Runtime\").item.json.updateOfJobId || $(\"Combine Job And Runtime\").item.json.input?.updateOfJobId || $(\"Combine Job And Runtime\").item.json.input?.updateContext?.previousJobId || null }) }}",
    "options":  {
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond RTM Prerequisite Job Failed

| Field | Value |
| --- | --- |
| Node ID | rtm-respond-preparing-job-failed-v1 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 3584, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Mark RTM Preparing Job Failed -> Respond RTM Prerequisite Job Failed (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: false, jobId: $(\"Build RTM Traceability Context\").item.json.jobId, status: \"failed\", error: { code: $(\"Build RTM Traceability Context\").item.json.errorCode || \"RTM_PREREQUISITES_MISSING\", message: $(\"Build RTM Traceability Context\").item.json.message || \"RTM prerequisites were not ready.\" } }) }}",
    "options":  {
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond RTM Queue Error

| Field | Value |
| --- | --- |
| Node ID | rtm-respond-queue-error-v1 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, -320 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- RTM Preparing Job Persisted? -> Respond RTM Queue Error (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: \"RTM_QUEUE_PERSIST_FAILED\", message: \"The RTM job could not be recorded before prerequisite hydration.\" } }) }}",
    "options":  {
                    "responseCode":  503,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### Respond Runtime Error

| Field | Value |
| --- | --- |
| Node ID | b875370b-447d-447b-b5d0-339c3f6faac0 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1584, 448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Runtime Request Ready? -> Respond Runtime Error (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "respondWith":  "json",
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: $json.errorCode || \"PROFILE_NOT_ACTIVE\", message: $json.message || \"Unable to resolve runtime context\" } }) }}",
    "options":  {
                    "responseCode":  "={{ $json.statusCode || 403 }}",
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            }
                                                        ]
                                        }
                }
}
```

### RTM Preparing Job Persisted?

| Field | Value |
| --- | --- |
| Node ID | rtm-preparing-job-persisted-if-v1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 2464, 240 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist RTM Preparing Job -> RTM Preparing Job Persisted? (output 0, input 0)

**Outgoing Connections**

- RTM Preparing Job Persisted? -> Fetch RTM Prerequisite Jobs (output 0, input 0)
- RTM Preparing Job Persisted? -> Respond RTM Queue Error (output 1, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### RTM Prerequisites Ready?

| Field | Value |
| --- | --- |
| Node ID | rtm-prerequisites-ready-if |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 3136, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build RTM Traceability Context -> RTM Prerequisites Ready? (output 0, input 0)

**Outgoing Connections**

- RTM Prerequisites Ready? -> Promote RTM Preparing Job to Pending (output 0, input 0)
- RTM Prerequisites Ready? -> Mark RTM Preparing Job Failed (output 1, input 0)

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
                                              "leftValue":  "={{ $json.rtmPrerequisitesOk }}",
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

### Runtime Request Ready?

| Field | Value |
| --- | --- |
| Node ID | d8a71207-fa7a-41fd-bf78-c6310ca5a5a1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1344, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Hydrate Retry Update Lineage -> Runtime Request Ready? (output 0, input 0)

**Outgoing Connections**

- Runtime Request Ready? -> Resolve Runtime Config (output 0, input 0)
- Runtime Request Ready? -> Respond Runtime Error (output 1, input 0)

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
                                              "leftValue":  "={{ $json.ok }}",
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

### Traceability Matrix Request?

| Field | Value |
| --- | --- |
| Node ID | rtm-two-layer-request-if |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1984, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Job And Runtime -> Traceability Matrix Request? (output 0, input 0)

**Outgoing Connections**

- Traceability Matrix Request? -> Persist RTM Preparing Job (output 0, input 0)
- Traceability Matrix Request? -> Persist Professional Job (output 1, input 0)

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
                                              "leftValue":  "={{ $json.input?.documentType || $json.documentType }}",
                                              "rightValue":  "traceability_matrix",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ]
                   },
    "options":  {

                }
}
```

### Valid Request?

| Field | Value |
| --- | --- |
| Node ID | 829abd05-be3a-49e7-9876-a3ab68404e04 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Professional Queue Request -> Valid Request? (output 0, input 0)

**Outgoing Connections**

- Valid Request? -> Verify Supabase Auth User (output 0, input 0)
- Valid Request? -> Respond Invalid Request (output 1, input 0)

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
                                              "leftValue":  "={{ $json.ok }}",
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

### Verify Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | bd14e390-5012-43e8-b238-85be1198a581 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Request? -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Active Q-Ops User Profile (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"Bearer {{ $json.token }}\" }",
    "options":  {

                }
}
```
