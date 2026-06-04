# PRO QA Story Test Cases Worker

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ivz13uFyjfCT8149 |
| Active | True |
| Archived | False |
| Created At | 2026-05-12T14:17:35.958Z |
| Updated At | 2026-05-12T17:13:43.449Z |
| Node Count | 19 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Story Test Cases Worker [ivz13uFyjfCT8149].json |

## Description

Polls queued Story Test Case generation jobs, executes the Jira Story Test Case generator subworkflow, and updates job status and metrics.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 8 |
| n8n-nodes-base.executeWorkflow | 1 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.scheduleTrigger | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{

### Supabase/Data Table Hints

- qa_job_metrics
- qa_jobs

## Connection Graph

- Schedule Trigger -> Get Pending Story Test Case Jobs (source output 0, target input 0)
- Get Pending Story Test Case Jobs -> Pending Story Test Case Job Exists? (source output 0, target input 0)
- Pending Story Test Case Job Exists? -> Lock Story Test Case Job (source output 0, target input 0)
- Pending Story Test Case Job Exists? -> No Pending Story Test Case Jobs (source output 1, target input 0)
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
- Build Story Test Case Failure Output -> LOG: Story Test Case Job Failed (source output 0, target input 0)
- LOG: Story Test Case Job Failed -> Restore Story Test Case Failure (source output 0, target input 0)
- Restore Story Test Case Failure -> Mark Story Test Case Job Failed (source output 0, target input 0)

## Nodes

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
    "jsCode":  "const result = $json || {};\nconst input = $(\u0027Prepare Story Test Case Generator Input\u0027).first().json;\nreturn [{\n  json: {\n    ...input,\n    output: {\n      documentType: \u0027story_test_cases\u0027,\n      destination: { type: \u0027jira_test_cases\u0027, projectId: input.projectId || null },\n      sourceUserStoryJobId: result.sourceUserStoryJobId || null,\n      stories: Array.isArray(result.stories) ? result.stories : [],\n      testCases: Array.isArray(result.testCases) ? result.testCases : [],\n      mappings: Array.isArray(result.mappings) ? result.mappings : [],\n      jira: result.jira || null,\n      wordCount: result.wordCount || 0,\n      tokensInput: result.tokensInput || 0,\n      tokensOutput: result.tokensOutput || 0,\n      tokensTotal: result.tokensTotal || 0,\n      estimatedCostUsd: result.estimatedCostUsd || 0\n    }\n  }\n}];"
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

- Build Story Test Case Failure Output -> LOG: Story Test Case Job Failed (output 0, input 0)

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
    "jsonBody":  "{ \"status\": \"processing\" }",
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
    "jsonHeaders":  "{ \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_COMPLETED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.output.wordCount || 0, tokens_input: $json.output.tokensInput || 0, tokens_output: $json.output.tokensOutput || 0, tokens_total: $json.output.tokensTotal || 0, estimated_cost_usd: $json.output.estimatedCostUsd || 0, metadata: { generator_mode: \"professional_story_test_cases\", source_user_story_job_id: $json.output.sourceUserStoryJobId, story_count: ($json.output.stories || []).length, testcase_count: ($json.output.testCases || []).length, mapping_count: ($json.output.mappings || []).length, settings_version: $json.settingsVersion } }) }}",
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
| Position | 2240, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Story Test Case Failure Output -> LOG: Story Test Case Job Failed (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_FAILED\", status: \"error\", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), metadata: { generator_mode: \"professional_story_test_cases\", error_type: \"STORY_TEST_CASES_FAILED\", settings_version: $json.settingsVersion } }) }}",
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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.jobId }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"completed\", output: $json.output, updated_at: $now.toISO() }) }}",
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
| Position | 2688, 192 |
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

- Pending Story Test Case Job Exists? -> No Pending Story Test Case Jobs (output 1, input 0)

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
- Pending Story Test Case Job Exists? -> No Pending Story Test Case Jobs (output 1, input 0)

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
| Position | 2464, 192 |
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
    "jsCode":  "return [{ json: $(\"Build Story Test Case Failure Output\").first().json }];"
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
