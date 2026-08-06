# PRO QA Story Test Cases Worker

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ivz13uFyjfCT8149 |
| Active | True |
| Created At | 2026-05-12T14:17:35.958Z |
| Updated At | 2026-06-11T07:10:21.672Z |
| Node Count | 27 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\PRO QA Story Test Cases Worker [ivz13uFyjfCT8149].json |

## Description

Polls queued Story Test Case generation jobs, executes the Jira Story Test Case generator subworkflow, and updates job status and metrics.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  rule={     "interval":  [                      {                          "field":  "seconds",                          "secondsInterval":  20                      }                  ] }

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 11 |
| n8n-nodes-base.executeWorkflow | 1 |
| n8n-nodes-base.httpRequest | 11 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.scheduleTrigger | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- Schedule Trigger -> Get Pending Story Test Case Jobs (source output 0, target input 0)
- Get Pending Story Test Case Jobs -> Pending Story Test Case Job Exists? (source output 0, target input 0)
- Pending Story Test Case Job Exists? -> Lock Story Test Case Job (source output 0, target input 0)
- Pending Story Test Case Job Exists? -> Get Stale Story Test Case Processing Jobs (source output 1, target input 0)
- Lock Story Test Case Job -> Story Test Case Lock Acquired? (source output 0, target input 0)
- Story Test Case Lock Acquired? -> Prepare Story Test Case Generator Input (source output 0, target input 0)
- Story Test Case Lock Acquired? -> Lock Not Acquired (source output 1, target input 0)
- Prepare Story Test Case Generator Input -> LOG: Story Test Case Job Started (source output 0, target input 0)
- LOG: Story Test Case Job Started -> Restore Story Test Case Input After Start Log (source output 0, target input 0)
- Restore Story Test Case Input After Start Log -> Call Story Test Case Generator (source output 0, target input 0)
- Call Story Test Case Generator -> Build Story Test Case Completion Output (source output 0, target input 0)
- Call Story Test Case Generator -> Build Story Test Case Failure Output (source output 1, target input 0)
- Build Story Test Case Completion Output -> LOG: Story Test Case Job Completed (source output 0, target input 0)
- LOG: Story Test Case Job Completed -> Restore Story Test Case Completion (source output 0, target input 0)
- Restore Story Test Case Completion -> Mark Story Test Case Job Completed (source output 0, target input 0)
- Build Story Test Case Failure Output -> Fetch Story Test Case Usage Checkpoint (source output 0, target input 0)
- LOG: Story Test Case Job Failed -> Restore Story Test Case Failure (source output 0, target input 0)
- Restore Story Test Case Failure -> Mark Story Test Case Job Failed (source output 0, target input 0)
- Fetch Story Test Case Usage Checkpoint -> Merge Story Test Case Failure Usage (source output 0, target input 0)
- Merge Story Test Case Failure Usage -> LOG: Story Test Case Job Failed (source output 0, target input 0)
- Get Stale Story Test Case Processing Jobs -> Stale Story Test Case Job Exists? (source output 0, target input 0)
- Stale Story Test Case Job Exists? -> Build Stale Story Test Case Failure Output (source output 0, target input 0)
- Stale Story Test Case Job Exists? -> No Pending Story Test Case Jobs (source output 1, target input 0)
- Build Stale Story Test Case Failure Output -> Mark Stale Story Test Case Job Failed (source output 0, target input 0)
- LOG: Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (source output 0, target input 0)
- Restore Stale Story Test Case Failure -> LOG: Stale Story Test Case Job Failed (source output 0, target input 0)
- Mark Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (source output 0, target input 0)

## Nodes

### Build Stale Story Test Case Failure Output

| Field | Value |
| --- | --- |
| Node ID | f30b6ee1-67e4-4b2e-9f2f-4e243447d077 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Stale Story Test Case Job Exists? -> Build Stale Story Test Case Failure Output (output 0, input 0)

**Outgoing Connections**

- Build Stale Story Test Case Failure Output -> Mark Stale Story Test Case Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const row = Array.isArray($json) ? ($json[0] || {}) : ($json || {});\nconst input = row.input || {};\nconst persisted = row.output || {};\nconst progress = persisted.progress || persisted.progressOutput?.progress || persisted.usageCheckpoint?.progress || {};\nconst usage = persisted.tokenUsage || persisted.usageCheckpoint?.tokenUsage || {};\n\nfunction num(...values) {\n  for (const value of values) {\n    const number = Number(value);\n    if (Number.isFinite(number) \u0026\u0026 number \u003e 0) return number;\n  }\n  return 0;\n}\n\nconst tokensInput = num(usage.input, usage.tokensInput, persisted.tokensInput);\nconst tokensOutput = num(usage.output, usage.tokensOutput, persisted.tokensOutput);\nconst tokensTotal = num(usage.total, usage.tokensTotal, persisted.tokensTotal, tokensInput + tokensOutput);\nconst estimatedCostUsd = num(usage.estimatedCostUsd, usage.estimated_cost_usd, persisted.estimatedCostUsd);\nconst stageLabel = progress.stageLabel || progress.stage || persisted.usageCheckpoint?.stage || \u0027last recorded STC checkpoint\u0027;\nconst errorMessage = \u0027Story Test Cases workflow stopped before writing final status. Last checkpoint: \u0027 + stageLabel + \u0027. Retry will use repair/update scope and must not regenerate unrelated successful stories.\u0027;\nconst tokenUsage = tokensTotal ? {\n  source: usage.source || \u0027story_testcase_reconciled_checkpoint\u0027,\n  stage: usage.stage || persisted.usageCheckpoint?.stage || progress.stage || null,\n  model: usage.model || input.model || null,\n  input: tokensInput,\n  output: tokensOutput,\n  total: tokensTotal,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n} : null;\n\nreturn [{\n  json: {\n    jobId: row.job_id,\n    projectId: row.project_id || input.projectId || null,\n    projectName: input.projectName || input.project_name || \u0027Unknown project\u0027,\n    documentType: \u0027story_test_cases\u0027,\n    requestedBy: row.requested_by || input.requestedBy || null,\n    settingsVersion: row.settings_version || input.settingsVersion || null,\n    createdAt: row.created_at,\n    startedAt: row.created_at,\n    updatedAt: row.updated_at,\n    retryOfJobId: row.retry_of_job_id || input.retryJobId || input.retryOfJobId || null,\n    retryAttempt: row.retry_attempt || input.retryAttempt || null,\n    errorMessage,\n    wordCount: num(persisted.wordCount, persisted.usageCheckpoint?.wordCount),\n    tokensInput,\n    tokensOutput,\n    tokensTotal,\n    estimatedCostUsd,\n    tokenUsage,\n    failedAfterUsageCheckpoint: Boolean(tokensTotal),\n    output: {\n      ...persisted,\n      error: true,\n      errorType: \u0027STORY_TEST_CASES_WORKFLOW_CRASHED\u0027,\n      message: errorMessage,\n      failed_at: new Date().toISOString(),\n      terminalStatus: \u0027failed\u0027,\n      progress,\n      wordCount: num(persisted.wordCount, persisted.usageCheckpoint?.wordCount),\n      tokensInput,\n      tokensOutput,\n      tokensTotal,\n      estimatedCostUsd,\n      tokenUsage,\n      failedUsageAvailable: Boolean(tokensTotal),\n      failedAfterUsageCheckpoint: Boolean(tokensTotal),\n      retryGuidance: \u0027Retry after the workflow fix is applied. The retry should reuse explicit repair targets/update context and avoid full regeneration.\u0027,\n      details: {\n        source: \u0027STC stale processing reconciliation\u0027,\n        failedAtNode: \u0027Finalize Story Test Case Result or downstream final status update\u0027,\n        lastCheckpoint: stageLabel,\n        n8nExecutionStatus: \u0027crashed_or_interrupted\u0027,\n        progress,\n        selectedStoryCount: progress.details?.selectedStoryCount || progress.details?.storyCount || null,\n        generatedTestCaseCount: progress.details?.generatedTestCaseCount || null,\n        publishedTestCaseCount: progress.details?.publishedTestCaseCount || null,\n      },\n    },\n  },\n}];"
}
```

### Build Story Test Case Completion Output

| Field | Value |
| --- | --- |
| Node ID | 2364cf10-dc2c-488c-8b20-398a963cf919 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Story Test Case Generator -> Build Story Test Case Completion Output (output 0, input 0)

**Outgoing Connections**

- Build Story Test Case Completion Output -> LOG: Story Test Case Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const result = $json || {};\nif (result.generatorPersisted || result.outputPersisted) {\n  return [];\n}\nconst input = $(\u0027Prepare Story Test Case Generator Input\u0027).first().json;\nreturn [{\n  json: {\n    ...input,\n    output: {\n      documentType: \u0027story_test_cases\u0027,\n      destination: { type: \u0027jira_test_cases\u0027, projectId: input.projectId || null },\n      generationMode: result.generationMode || input.generationMode || null,\n      updateContext: result.updateContext || input.updateContext || null,\n      updateOfJobId: result.updateOfJobId || result.updateContext?.previousJobId || input.updateContext?.previousJobId || null,\n      retryOfJobId: result.retryOfJobId || input.retryOfJobId || null,\n      sourceUserStoryJobId: result.sourceUserStoryJobId || null,\n      stories: Array.isArray(result.stories) ? result.stories : [],\n      testCases: Array.isArray(result.testCases) ? result.testCases : [],\n      mappings: Array.isArray(result.mappings) ? result.mappings : [],\n      categoryDistribution: result.categoryDistribution || {},\n      coverageSummary: result.coverageSummary || result.qualityGate?.coverageSummary || null,\n      batchSummary: result.batchSummary || result.qualityGate?.batchSummary || null,\n      coverageLedger: Array.isArray(result.coverageLedger) ? result.coverageLedger : (Array.isArray(result.qualityGate?.coverageLedger) ? result.qualityGate.coverageLedger : []),\n      qualityGate: result.qualityGate || null,\n      jira: result.jira || null,\n      wordCount: result.wordCount || 0,\n      tokensInput: result.tokensInput || 0,\n      tokensOutput: result.tokensOutput || 0,\n      tokensTotal: result.tokensTotal || 0,\n      estimatedCostUsd: result.estimatedCostUsd || 0\n    }\n  }\n}];"
}
```

### Build Story Test Case Failure Output

| Field | Value |
| --- | --- |
| Node ID | e35405d9-bfcd-4148-9f42-2d94836f4ae1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Story Test Case Generator -> Build Story Test Case Failure Output (output 1, input 0)

**Outgoing Connections**

- Build Story Test Case Failure Output -> Fetch Story Test Case Usage Checkpoint (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const input = $(\u0027Prepare Story Test Case Generator Input\u0027).first().json;\nconst rawError = $json.error || $json;\n\nfunction clean(value) {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (typeof value === \u0027string\u0027) return value.trim();\n  try { return JSON.stringify(value); } catch { return String(value); }\n}\n\nfunction collectMessages(value, depth = 0, seen = new Set()) {\n  if (value === null || value === undefined || depth \u003e 8) return [];\n  if (typeof value === \u0027string\u0027) return value.trim() ? [value.trim()] : [];\n  if (typeof value !== \u0027object\u0027) return [];\n  if (seen.has(value)) return [];\n  seen.add(value);\n  const priorityKeys = [\u0027message\u0027, \u0027errorMessage\u0027, \u0027errorDescription\u0027, \u0027description\u0027, \u0027stack\u0027];\n  const messages = [];\n  for (const key of priorityKeys) {\n    if (value[key]) messages.push(clean(value[key]));\n  }\n  for (const nested of Object.values(value)) {\n    messages.push(...collectMessages(nested, depth + 1, seen));\n  }\n  return messages.filter(Boolean);\n}\n\nconst allMessages = [...new Set(collectMessages(rawError))];\nconst message = allMessages.find(text =\u003e !/workflow failed|execution failed/i.test(text)) || allMessages[0] || \u0027Story Test Case generator failed\u0027;\n\nreturn [{\n  json: {\n    ...input,\n    errorMessage: message,\n    output: {\n      error: true,\n      errorType: \u0027STORY_TEST_CASES_FAILED\u0027,\n      message,\n      failed_at: new Date().toISOString(),\n      details: {\n        source: rawError.node?.name || rawError.error?.node?.name || rawError.nodeName || \u0027Call Story Test Case Generator\u0027,\n        description: allMessages.slice(0, 5).join(\u0027 | \u0027),\n        itemIndex: rawError.itemIndex ?? rawError.error?.itemIndex ?? null\n      }\n    }\n  }\n}];"
}
```

### Call Story Test Case Generator

| Field | Value |
| --- | --- |
| Node ID | 0ce35092-656f-46d3-afa3-4dcb931d9bb2 |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 1792, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Input After Start Log -> Call Story Test Case Generator (output 0, input 0)

**Outgoing Connections**

- Call Story Test Case Generator -> Build Story Test Case Completion Output (output 0, input 0)
- Call Story Test Case Generator -> Build Story Test Case Failure Output (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "SG7khcKlhHst48WH",
                       "mode":  "id",
                       "cachedResultName":  "PRO QA Jira Story Test Case Generator"
                   },
    "workflowInputs":  {
                           "mappingMode":  "defineBelow",
                           "value":  {

                                     },
                           "matchingColumns":  [

                                               ],
                           "schema":  [

                                      ],
                           "attemptToConvertTypes":  false,
                           "convertFieldsToString":  true
                       },
    "options":  {
                    "waitForSubWorkflow":  true
                }
}
```

### Fetch Story Test Case Usage Checkpoint

| Field | Value |
| --- | --- |
| Node ID | 371d5c5c-2c04-4270-a6e9-697dd0461acd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Failure Output -> Fetch Story Test Case Usage Checkpoint (output 0, input 0)

**Outgoing Connections**

- Fetch Story Test Case Usage Checkpoint -> Merge Story Test Case Failure Usage (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026select=output",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Get Pending Story Test Case Jobs

| Field | Value |
| --- | --- |
| Node ID | a7714f97-d34f-4602-8e82-525eefa62395 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 288 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending Story Test Case Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending Story Test Case Jobs -> Pending Story Test Case Job Exists? (output 0, input 0)

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
                                                   "value":  "eq.pending"
                                               },
                                               {
                                                   "name":  "input-\u003e\u003egeneratorMode",
                                                   "value":  "eq.professional_story_test_cases"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.asc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at"
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

### Get Stale Story Test Case Processing Jobs

| Field | Value |
| --- | --- |
| Node ID | 14eeca51-4fe2-4385-98c9-e496416e3e89 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.2 |
| Position | 672, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending Story Test Case Job Exists? -> Get Stale Story Test Case Processing Jobs (output 1, input 0)

**Outgoing Connections**

- Get Stale Story Test Case Processing Jobs -> Stale Story Test Case Job Exists? (output 0, input 0)

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
                                                   "value":  "eq.processing"
                                               },
                                               {
                                                   "name":  "input-\u003e\u003egeneratorMode",
                                                   "value":  "eq.professional_story_test_cases"
                                               },
                                               {
                                                   "name":  "created_at",
                                                   "value":  "={{ \"lt.\" + new Date(Date.now() - 120 * 60 * 1000).toISOString() }}"
                                               },
                                               {
                                                   "name":  "updated_at",
                                                   "value":  "={{ \"lt.\" + new Date(Date.now() - 120 * 60 * 1000).toISOString() }}"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "updated_at.asc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,output,error,project_id,requested_by,settings_version,config_snapshot,created_at,updated_at,retry_of_job_id,retry_attempt"
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

### Lock Not Acquired

| Field | Value |
| --- | --- |
| Node ID | 59e57a06-d67c-4abf-a1dd-2ec9dd4551f5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Lock Acquired? -> Lock Not Acquired (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: { ok: true, skipped: true } }];"
}
```

### Lock Story Test Case Job

| Field | Value |
| --- | --- |
| Node ID | 32443704-2818-4f61-8f6a-c99523d928c9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending Story Test Case Job Exists? -> Lock Story Test Case Job (output 0, input 0)

**Outgoing Connections**

- Lock Story Test Case Job -> Story Test Case Lock Acquired? (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.pending",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \u0027processing\u0027, output: { documentType: \u0027story_test_cases\u0027, progress: { version: \u0027stc-progress-v1\u0027, stage: \u0027preparing\u0027, stageLabel: \u0027Preparing request\u0027, group: \u0027preparing\u0027, progressPercent: 8, summary: \u0027Q-Ops picked up the Story Test Cases job and is preparing the source story context.\u0027, updatedAt: $now.toISO(), details: { itemCount: 1 } } }, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### LOG: Stale Story Test Case Job Failed

| Field | Value |
| --- | --- |
| Node ID | 45788818-0a27-4f72-bbe1-2f0e675b523a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Stale Story Test Case Failure -> LOG: Stale Story Test Case Job Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_FAILED\", status: \"error\", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.wordCount || $json.output?.wordCount || 0, tokens_input: $json.tokensInput || $json.output?.tokensInput || 0, tokens_output: $json.tokensOutput || $json.output?.tokensOutput || 0, tokens_total: $json.tokensTotal || $json.output?.tokensTotal || 0, estimated_cost_usd: $json.estimatedCostUsd || $json.output?.estimatedCostUsd || 0, metadata: { generator_mode: \"professional_story_test_cases\", error_type: \"STORY_TEST_CASES_FAILED\", settings_version: $json.settingsVersion, failed_after_usage_checkpoint: Boolean($json.failedAfterUsageCheckpoint || $json.output?.failedAfterUsageCheckpoint), token_usage: $json.tokenUsage || $json.output?.tokenUsage || null, usage_checkpoint_stage: $json.output?.usageCheckpoint?.stage || null } }) }}",
    "options":  {

                }
}
```

### LOG: Story Test Case Job Completed

| Field | Value |
| --- | --- |
| Node ID | 191f8897-5659-4471-89e1-5be5402168a9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Completion Output -> LOG: Story Test Case Job Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Story Test Case Job Completed -> Restore Story Test Case Completion (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $(\"Build Story Test Case Completion Output\").item.json.jobId, project_name: $(\"Build Story Test Case Completion Output\").item.json.projectName, document_type: $(\"Build Story Test Case Completion Output\").item.json.documentType, pipeline: \"generation\", event: \"JOB_COMPLETED\", status: \"info\", project_id: $(\"Build Story Test Case Completion Output\").item.json.projectId, requested_by: $(\"Build Story Test Case Completion Output\").item.json.requestedBy, duration_ms: Date.now() - new Date($(\"Build Story Test Case Completion Output\").item.json.startedAt || $(\"Build Story Test Case Completion Output\").item.json.createdAt || Date.now()).getTime(), word_count: $(\"Build Story Test Case Completion Output\").item.json.output.wordCount || 0, tokens_input: $(\"Build Story Test Case Completion Output\").item.json.output.tokensInput || 0, tokens_output: $(\"Build Story Test Case Completion Output\").item.json.output.tokensOutput || 0, tokens_total: $(\"Build Story Test Case Completion Output\").item.json.output.tokensTotal || 0, estimated_cost_usd: $(\"Build Story Test Case Completion Output\").item.json.output.estimatedCostUsd || 0, metadata: { generator_mode: \"professional_story_test_cases\", generation_mode: $(\"Build Story Test Case Completion Output\").item.json.output.generationMode || $(\"Build Story Test Case Completion Output\").item.json.generationMode || \"create\", update_of_job_id: $(\"Build Story Test Case Completion Output\").item.json.output.updateOfJobId || null, retry_of_job_id: $(\"Build Story Test Case Completion Output\").item.json.output.retryOfJobId || null, source_user_story_job_id: $(\"Build Story Test Case Completion Output\").item.json.output.sourceUserStoryJobId, story_count: ($(\"Build Story Test Case Completion Output\").item.json.output.stories || []).length, testcase_count: ($(\"Build Story Test Case Completion Output\").item.json.output.testCases || []).length, testcase_created_count: $(\"Build Story Test Case Completion Output\").item.json.output.jira?.created || 0, testcase_updated_count: $(\"Build Story Test Case Completion Output\").item.json.output.jira?.updated || 0, testcase_reused_count: $(\"Build Story Test Case Completion Output\").item.json.output.jira?.reused || 0, mapping_count: ($(\"Build Story Test Case Completion Output\").item.json.output.mappings || []).length, settings_version: $(\"Build Story Test Case Completion Output\").item.json.settingsVersion } }) }}",
    "options":  {

                }
}
```

### LOG: Story Test Case Job Failed

| Field | Value |
| --- | --- |
| Node ID | d6d9e3c8-6fc9-40c6-8b5a-57d113cec8f9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2688, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge Story Test Case Failure Usage -> LOG: Story Test Case Job Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Story Test Case Job Failed -> Restore Story Test Case Failure (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_FAILED\", status: \"error\", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.wordCount || $json.output?.wordCount || 0, tokens_input: $json.tokensInput || $json.output?.tokensInput || 0, tokens_output: $json.tokensOutput || $json.output?.tokensOutput || 0, tokens_total: $json.tokensTotal || $json.output?.tokensTotal || 0, estimated_cost_usd: $json.estimatedCostUsd || $json.output?.estimatedCostUsd || 0, metadata: { generator_mode: \"professional_story_test_cases\", error_type: \"STORY_TEST_CASES_FAILED\", settings_version: $json.settingsVersion, failed_after_usage_checkpoint: Boolean($json.failedAfterUsageCheckpoint || $json.output?.failedAfterUsageCheckpoint), token_usage: $json.tokenUsage || $json.output?.tokenUsage || null, usage_checkpoint_stage: $json.output?.usageCheckpoint?.stage || null } }) }}",
    "options":  {

                }
}
```

### LOG: Story Test Case Job Started

| Field | Value |
| --- | --- |
| Node ID | 1262e036-8990-42bd-807c-ed61ede3d84c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Generator Input -> LOG: Story Test Case Job Started (output 0, input 0)

**Outgoing Connections**

- LOG: Story Test Case Job Started -> Restore Story Test Case Input After Start Log (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_STARTED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, metadata: { generator_mode: \"professional_story_test_cases\", settings_version: $json.settingsVersion, environment: $json.environment || $json.configSnapshot?.environment?.key || \"local\" } }) }}",
    "options":  {

                }
}
```

### Mark Stale Story Test Case Job Failed

| Field | Value |
| --- | --- |
| Node ID | 52b1b27b-bc65-47e8-a48d-0e5553199ba4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Stale Story Test Case Failure Output -> Mark Stale Story Test Case Job Failed (output 0, input 0)

**Outgoing Connections**

- Mark Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"failed\", output: $json.output, error: $json.errorMessage, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Mark Story Test Case Job Completed

| Field | Value |
| --- | --- |
| Node ID | bfef9641-d934-4e9d-9423-0347e9b8f0a6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Completion -> Mark Story Test Case Job Completed (output 0, input 0)

**Outgoing Connections**

- None

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $(\"Build Story Test Case Completion Output\").item.json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"completed\", output: $(\"Build Story Test Case Completion Output\").item.json.output, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Mark Story Test Case Job Failed

| Field | Value |
| --- | --- |
| Node ID | b8f6a7fd-afa4-4f3b-af42-47f52af11606 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3136, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Story Test Case Failure -> Mark Story Test Case Job Failed (output 0, input 0)

**Outgoing Connections**

- None

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"failed\", output: $json.output, error: $json.errorMessage, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Merge Story Test Case Failure Usage

| Field | Value |
| --- | --- |
| Node ID | 5e07b455-79a6-4505-86b3-9713a545edb1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2464, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Story Test Case Usage Checkpoint -> Merge Story Test Case Failure Usage (output 0, input 0)

**Outgoing Connections**

- Merge Story Test Case Failure Usage -> LOG: Story Test Case Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const failure = $(\u0027Build Story Test Case Failure Output\u0027).first().json || {};\nconst row = Array.isArray($json) ? ($json[0] || {}) : ($json || {});\nconst persisted = row.output || {};\nconst persistedUsage = persisted.tokenUsage || persisted.usageCheckpoint?.tokenUsage || {};\n\nfunction numberFrom(...values) {\n  for (const value of values) {\n    const number = Number(value);\n    if (Number.isFinite(number) \u0026\u0026 number \u003e 0) return number;\n  }\n  return 0;\n}\n\nconst tokensInput = numberFrom(persisted.tokensInput, persistedUsage.tokensInput, persistedUsage.input);\nconst tokensOutput = numberFrom(persisted.tokensOutput, persistedUsage.tokensOutput, persistedUsage.output);\nconst tokensTotal = numberFrom(persisted.tokensTotal, persistedUsage.tokensTotal, persistedUsage.total, tokensInput + tokensOutput);\nconst estimatedCostUsd = numberFrom(persisted.estimatedCostUsd, persistedUsage.estimatedCostUsd, persistedUsage.estimated_cost_usd);\nconst wordCount = numberFrom(persisted.wordCount, persisted.usageCheckpoint?.wordCount);\nconst tokenUsage = tokensTotal ? {\n  source: persistedUsage.source || \u0027story_testcase_generation_checkpoint\u0027,\n  stage: persistedUsage.stage || persisted.usageCheckpoint?.stage || \u0027pre_jira_publish\u0027,\n  model: persistedUsage.model || failure.generationModel || null,\n  input: tokensInput,\n  output: tokensOutput,\n  total: tokensTotal,\n  tokensInput,\n  tokensOutput,\n  tokensTotal,\n  estimatedCostUsd,\n} : null;\n\nreturn [{\n  json: {\n    ...failure,\n    wordCount,\n    tokensInput,\n    tokensOutput,\n    tokensTotal,\n    estimatedCostUsd,\n    tokenUsage,\n    output: {\n      ...(failure.output || {}),\n      wordCount,\n      tokensInput,\n      tokensOutput,\n      tokensTotal,\n      estimatedCostUsd,\n      tokenUsage,\n      usageCheckpoint: persisted.usageCheckpoint || null,\n      failedUsageAvailable: Boolean(tokensTotal),\n      failedAfterUsageCheckpoint: Boolean(tokensTotal),\n    },\n  },\n}];"
}
```

### No Pending Story Test Case Jobs

| Field | Value |
| --- | --- |
| Node ID | 5a426ef0-a948-4316-944c-5ecd14177eb5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Stale Story Test Case Job Exists? -> No Pending Story Test Case Jobs (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: { ok: true, skipped: true } }];"
}
```

### Pending Story Test Case Job Exists?

| Field | Value |
| --- | --- |
| Node ID | dd7eab1e-012e-4ccd-a7ae-c27a5324a48a |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 448, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending Story Test Case Jobs -> Pending Story Test Case Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending Story Test Case Job Exists? -> Lock Story Test Case Job (output 0, input 0)
- Pending Story Test Case Job Exists? -> Get Stale Story Test Case Processing Jobs (output 1, input 0)

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

### Prepare Story Test Case Generator Input

| Field | Value |
| --- | --- |
| Node ID | 8b8c4a80-c991-4197-804d-e84b83fa1bb7 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Lock Acquired? -> Prepare Story Test Case Generator Input (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Generator Input -> LOG: Story Test Case Job Started (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = Array.isArray($json) ? $json[0] : $json;\nconst input = job.input || {};\nreturn [{\n  json: {\n    jobId: job.job_id,\n    originalJobStatus: job.status,\n    projectId: job.project_id || null,\n    requestedBy: job.requested_by || null,\n    settingsVersion: job.settings_version || null,\n    configSnapshot: job.config_snapshot || {},\n    createdAt: job.created_at || new Date().toISOString(),\n    startedAt: new Date().toISOString(),\n    ...input\n  }\n}];"
}
```

### Restore Stale Story Test Case Failure

| Field | Value |
| --- | --- |
| Node ID | d9bcae0c-c6e0-4385-84d4-73fc34f09d11 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (output 0, input 0)
- Mark Stale Story Test Case Job Failed -> Restore Stale Story Test Case Failure (output 0, input 0)

**Outgoing Connections**

- Restore Stale Story Test Case Failure -> LOG: Stale Story Test Case Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\"Build Stale Story Test Case Failure Output\").first().json }];"
}
```

### Restore Story Test Case Completion

| Field | Value |
| --- | --- |
| Node ID | 97dbec37-616b-4719-96ee-851b5c14ab3b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Story Test Case Job Completed -> Restore Story Test Case Completion (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Completion -> Mark Story Test Case Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\"Build Story Test Case Completion Output\").first().json }];"
}
```

### Restore Story Test Case Failure

| Field | Value |
| --- | --- |
| Node ID | 2d1a514f-e6cc-42d9-ba12-3c6b684a9c06 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2912, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Story Test Case Job Failed -> Restore Story Test Case Failure (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Failure -> Mark Story Test Case Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\"Merge Story Test Case Failure Usage\").first().json }];"
}
```

### Restore Story Test Case Input After Start Log

| Field | Value |
| --- | --- |
| Node ID | d03c0f56-1524-42ba-96cd-3e1061f0fcad |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Story Test Case Job Started -> Restore Story Test Case Input After Start Log (output 0, input 0)

**Outgoing Connections**

- Restore Story Test Case Input After Start Log -> Call Story Test Case Generator (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\"Prepare Story Test Case Generator Input\").first().json }];"
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | 753859c4-5808-401f-a4d4-219f62afedc2 |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | 0, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending Story Test Case Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "rule":  {
                 "interval":  [
                                  {
                                      "field":  "seconds",
                                      "secondsInterval":  20
                                  }
                              ]
             }
}
```

### Stale Story Test Case Job Exists?

| Field | Value |
| --- | --- |
| Node ID | 19bb2736-2230-4db4-9162-cce4b2998632 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 896, 400 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Stale Story Test Case Processing Jobs -> Stale Story Test Case Job Exists? (output 0, input 0)

**Outgoing Connections**

- Stale Story Test Case Job Exists? -> Build Stale Story Test Case Failure Output (output 0, input 0)
- Stale Story Test Case Job Exists? -> No Pending Story Test Case Jobs (output 1, input 0)

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

### Story Test Case Lock Acquired?

| Field | Value |
| --- | --- |
| Node ID | 4b26c331-e02d-4be3-a901-fe02847f9c45 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 896, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock Story Test Case Job -> Story Test Case Lock Acquired? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Lock Acquired? -> Prepare Story Test Case Generator Input (output 0, input 0)
- Story Test Case Lock Acquired? -> Lock Not Acquired (output 1, input 0)

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
