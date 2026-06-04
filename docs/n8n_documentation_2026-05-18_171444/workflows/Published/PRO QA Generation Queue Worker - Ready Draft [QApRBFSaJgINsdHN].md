# PRO QA Generation Queue Worker - Ready Draft

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | QApRBFSaJgINsdHN |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T04:00:34.834Z |
| Updated At | 2026-05-12T05:26:47.000Z |
| Node Count | 22 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Generation Queue Worker - Ready Draft [QApRBFSaJgINsdHN].json |

## Description

Professional worker with lock-success guard, started/quality/completed/failed metrics, failed status handling for professional backlog jobs, and reuse of fullRetrievalD01 for other document types.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 7 |
| n8n-nodes-base.executeWorkflow | 2 |
| n8n-nodes-base.httpRequest | 8 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.scheduleTrigger | 1 |
| n8n-nodes-base.stickyNote | 1 |

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

- Schedule Trigger -> Get Pending Professional Jobs (source output 0, target input 0)
- Get Pending Professional Jobs -> Pending Professional Job Exists? (source output 0, target input 0)
- Pending Professional Job Exists? -> Lock Professional Job (source output 0, target input 0)
- Lock Professional Job -> Professional Lock Acquired? (source output 0, target input 0)
- Professional Lock Acquired? -> Prepare Generator Input (source output 0, target input 0)
- Prepare Generator Input -> LOG: Professional Job Started (source output 0, target input 0)
- LOG: Professional Job Started -> Restore Generator Input After Start Log (source output 0, target input 0)
- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (source output 0, target input 0)
- Use Professional Backlog Generator? -> Call Professional Backlog Generator (source output 0, target input 0)
- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (source output 1, target input 0)
- Call Professional Backlog Generator -> Build Backlog Completion Output (source output 0, target input 0)
- Call Professional Backlog Generator -> Build Professional Failure Output (source output 1, target input 0)
- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (source output 0, target input 0)
- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (source output 0, target input 0)
- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (source output 0, target input 0)
- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (source output 0, target input 0)
- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (source output 0, target input 0)
- Build Professional Failure Output -> LOG: Professional Backlog Failed (source output 0, target input 0)
- LOG: Professional Backlog Failed -> Restore Failure Output (source output 0, target input 0)
- Restore Failure Output -> Mark Professional Backlog Job Failed (source output 0, target input 0)

## Nodes

### Build Backlog Completion Output

| Field | Value |
| --- | --- |
| Node ID | 79210578-235e-4ae2-b514-4c8b3376f7e2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Professional Backlog Generator -> Build Backlog Completion Output (output 0, input 0)

**Outgoing Connections**

- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst result = $json || {};\nconst input = $(\u0027Prepare Generator Input\u0027).first().json;\nconst confluenceUrl = result.confluence?.url || result.confluenceUrl || result.url || null;\nreturn [{ json: { ...input, result, output: { settingsVersion: input.settingsVersion || null, destination: { type: \u0027jira_confluence\u0027, projectId: input.projectId || null }, url: confluenceUrl, documentUrl: confluenceUrl, confluence: result.confluence || null, epics: result.epics || [], stories: result.stories || [], professionalGenerator: true, qualityGate: result.qualityGate || null, jira: result.jira || null, wordCount: result.wordCount || 0, tokensInput: result.tokensInput || 0, tokensOutput: result.tokensOutput || 0, tokensTotal: result.tokensTotal || 0, estimatedCostUsd: result.estimatedCostUsd || 0, promptLibraryVersion: result.promptLibraryVersion || null, sourceCoverage: result.sourceCoverage || [], retrievalEvidenceCount: result.retrievalEvidenceCount || 0, retrievalQuality: result.retrievalQuality || null } } }];"
}
```

### Build Professional Failure Output

| Field | Value |
| --- | --- |
| Node ID | a1c08079-2b77-447d-ad17-3bd4c2c6f5c4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Professional Backlog Generator -> Build Professional Failure Output (output 1, input 0)

**Outgoing Connections**

- Build Professional Failure Output -> LOG: Professional Backlog Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst input = $(\u0027Prepare Generator Input\u0027).first().json;\nconst rawError = $json.error || $json;\n\nfunction clean(value) {\n  if (value === null || value === undefined) return \u0027\u0027;\n  if (typeof value === \u0027string\u0027) return value.trim();\n  try { return JSON.stringify(value); } catch { return String(value); }\n}\n\nfunction collectMessages(value, depth = 0, seen = new Set()) {\n  if (value === null || value === undefined || depth \u003e 8) return [];\n  if (typeof value === \u0027string\u0027) return value.trim() ? [value.trim()] : [];\n  if (typeof value !== \u0027object\u0027) return [];\n  if (seen.has(value)) return [];\n  seen.add(value);\n\n  const priorityKeys = [\u0027message\u0027, \u0027errorMessage\u0027, \u0027errorDescription\u0027, \u0027description\u0027, \u0027stack\u0027];\n  const messages = [];\n  for (const key of priorityKeys) {\n    if (value[key]) messages.push(clean(value[key]));\n  }\n  for (const nested of Object.values(value)) {\n    messages.push(...collectMessages(nested, depth + 1, seen));\n  }\n  return messages.filter(Boolean);\n}\n\nconst allMessages = [...new Set(collectMessages(rawError))];\nconst message =\n  allMessages.find(text =\u003e /Backlog parser|quality gate|Chroma retrieval|Jira and Confluence|model JSON/i.test(text)) ||\n  allMessages.find(text =\u003e !/workflow failed|execution failed|professional backlog generator failed/i.test(text)) ||\n  allMessages[0] ||\n  \u0027Professional backlog generator failed\u0027;\n\nreturn [{\n  json: {\n    ...input,\n    errorMessage: message,\n    output: {\n      error: true,\n      errorType: \u0027PROFESSIONAL_BACKLOG_FAILED\u0027,\n      message,\n      failed_at: new Date().toISOString(),\n      details: {\n        source: rawError.node?.name || rawError.error?.node?.name || rawError.nodeName || \u0027Call Professional Backlog Generator\u0027,\n        description: allMessages.slice(0, 5).join(\u0027 | \u0027),\n        itemIndex: rawError.itemIndex ?? rawError.error?.itemIndex ?? null\n      }\n    }\n  }\n}];\n"
}
```

### Call Existing Full Retrieval Generator

| Field | Value |
| --- | --- |
| Node ID | 130defc2-e84a-4d93-82d6-a116d88ad7de |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 2016, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "fullRetrievalD01",
                       "mode":  "id",
                       "cachedResultName":  "RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft"
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

### Call Professional Backlog Generator

| Field | Value |
| --- | --- |
| Node ID | c2f4234b-3b00-41c7-bfd4-9aac855c3da1 |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 2016, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Use Professional Backlog Generator? -> Call Professional Backlog Generator (output 0, input 0)

**Outgoing Connections**

- Call Professional Backlog Generator -> Build Backlog Completion Output (output 0, input 0)
- Call Professional Backlog Generator -> Build Professional Failure Output (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "Vwc6c8ehsRTF8svG",
                       "mode":  "id",
                       "cachedResultName":  "PRO QA Backlog, Jira \u0026 Confluence Generator - Team Managed Ready"
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

### Get Pending Professional Jobs

| Field | Value |
| --- | --- |
| Node ID | bf919723-8ceb-4457-b3a7-81d5850c7a88 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending Professional Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending Professional Jobs -> Pending Professional Job Exists? (output 0, input 0)

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
                                                   "value":  "eq.professional"
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

### Lock Professional Job

| Field | Value |
| --- | --- |
| Node ID | 0e8071e7-5e6d-4b33-88e6-fa07f5071fc0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending Professional Job Exists? -> Lock Professional Job (output 0, input 0)

**Outgoing Connections**

- Lock Professional Job -> Professional Lock Acquired? (output 0, input 0)

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

### LOG: Professional Backlog Completed

| Field | Value |
| --- | --- |
| Node ID | 53bcf716-bbdf-4ab3-b7e6-40aa03a12c4a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_COMPLETED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), word_count: $json.output.wordCount || 0, tokens_input: $json.output.tokensInput || 0, tokens_output: $json.output.tokensOutput || 0, tokens_total: $json.output.tokensTotal || 0, estimated_cost_usd: $json.output.estimatedCostUsd || 0, metadata: { generator_mode: \"professional\", output_type: \"jira_confluence\", epics_created: ($json.output.epics || []).filter(e =\u003e e.action === \"created\").length, epics_reused: ($json.output.epics || []).filter(e =\u003e e.action === \"reused\").length, stories_created: ($json.output.stories || []).filter(s =\u003e s.action === \"created\").length, stories_reused: ($json.output.stories || []).filter(s =\u003e s.action === \"reused\").length, confluence_url: $json.output.url, settings_version: $json.settingsVersion, retrieval_quality: $json.output.retrievalQuality, retrieval_evidence_count: $json.output.retrievalEvidenceCount, source_coverage_count: ($json.output.sourceCoverage || []).length, prompt_library_version: $json.output.promptLibraryVersion, quality_gate_status: $json.output.qualityGate?.status || \"passed\" } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Backlog Failed

| Field | Value |
| --- | --- |
| Node ID | 571f4150-d8eb-40c6-bde4-d1b54da1249e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Professional Failure Output -> LOG: Professional Backlog Failed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Backlog Failed -> Restore Failure Output (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_FAILED\", status: \"error\", project_id: $json.projectId, requested_by: $json.requestedBy, error_message: $json.errorMessage, duration_ms: Date.now() - new Date($json.startedAt || $json.createdAt || Date.now()).getTime(), metadata: { generator_mode: \"professional\", error_type: \"PROFESSIONAL_BACKLOG_FAILED\", settings_version: $json.settingsVersion } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Job Started

| Field | Value |
| --- | --- |
| Node ID | d52cf9f6-b8a0-4d5d-9cce-7a46a3421afd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Generator Input -> LOG: Professional Job Started (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Job Started -> Restore Generator Input After Start Log (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"JOB_STARTED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, metadata: { generator_mode: \"professional\", settings_version: $json.settingsVersion, environment: $json.environment || $json.configSnapshot?.environment?.key || \"local\" } }) }}",
    "options":  {

                }
}
```

### LOG: Professional Quality Gate Passed

| Field | Value |
| --- | --- |
| Node ID | 86877b0d-3edd-4493-8e7e-273be283f766 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Backlog Completion Output -> LOG: Professional Quality Gate Passed (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $json.jobId, project_name: $json.projectName, document_type: $json.documentType, pipeline: \"generation\", event: \"QUALITY_GATE_PASSED\", status: \"info\", project_id: $json.projectId, requested_by: $json.requestedBy, word_count: $json.output.wordCount || 0, metadata: { generator_mode: \"professional\", epics: ($json.output.epics || []).length, stories: ($json.output.stories || []).length, quality_gate: $json.output.qualityGate, retrieval_quality: $json.output.retrievalQuality, retrieval_evidence_count: $json.output.retrievalEvidenceCount, source_coverage_count: ($json.output.sourceCoverage || []).length, prompt_library_version: $json.output.promptLibraryVersion } }) }}",
    "options":  {

                }
}
```

### Mark Professional Backlog Job Completed

| Field | Value |
| --- | --- |
| Node ID | d58a30ac-6ef6-4d14-9c1c-987a1df5e1fb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3360, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (output 0, input 0)

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

### Mark Professional Backlog Job Failed

| Field | Value |
| --- | --- |
| Node ID | e87b63d1-f1a1-4722-a939-4a6dea1e9677 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2912, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Failure Output -> Mark Professional Backlog Job Failed (output 0, input 0)

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

### Pending Professional Job Exists?

| Field | Value |
| --- | --- |
| Node ID | cd0cdc5c-9859-4316-9264-611a30777512 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending Professional Jobs -> Pending Professional Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending Professional Job Exists? -> Lock Professional Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
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
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Prepare Generator Input

| Field | Value |
| --- | --- |
| Node ID | 52bb97d6-b5ae-479b-b3a6-81b6ba1a9744 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Lock Acquired? -> Prepare Generator Input (output 0, input 0)

**Outgoing Connections**

- Prepare Generator Input -> LOG: Professional Job Started (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "\nconst job = Array.isArray($json) ? $json[0] : $json;\nconst input = job.input || {};\nreturn [{ json: {\n  jobId: job.job_id,\n  originalJobStatus: job.status,\n  projectId: job.project_id || null,\n  requestedBy: job.requested_by || null,\n  settingsVersion: job.settings_version || null,\n  configSnapshot: job.config_snapshot || {},\n  createdAt: job.created_at || new Date().toISOString(),\n  startedAt: new Date().toISOString(),\n  ...input\n}}];"
}
```

### Professional Lock Acquired?

| Field | Value |
| --- | --- |
| Node ID | d4bb380c-7a36-4d10-b014-dd6d9723b1e1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock Professional Job -> Professional Lock Acquired? (output 0, input 0)

**Outgoing Connections**

- Professional Lock Acquired? -> Prepare Generator Input (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
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
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Restore Backlog Completion Output

| Field | Value |
| --- | --- |
| Node ID | 3b8ff390-2da8-4cfa-bd61-ba706fb3a272 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Quality Gate Passed -> Restore Backlog Completion Output (output 0, input 0)

**Outgoing Connections**

- Restore Backlog Completion Output -> LOG: Professional Backlog Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Build Backlog Completion Output\u0027).first().json }];"
}
```

### Restore Completion Before Status Update

| Field | Value |
| --- | --- |
| Node ID | c0d605b8-796c-4ff6-905e-014e906164b5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3136, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Backlog Completed -> Restore Completion Before Status Update (output 0, input 0)

**Outgoing Connections**

- Restore Completion Before Status Update -> Mark Professional Backlog Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Build Backlog Completion Output\u0027).first().json }];"
}
```

### Restore Failure Output

| Field | Value |
| --- | --- |
| Node ID | b9173136-34c4-40a2-a407-737630d99427 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2688, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Backlog Failed -> Restore Failure Output (output 0, input 0)

**Outgoing Connections**

- Restore Failure Output -> Mark Professional Backlog Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Build Professional Failure Output\u0027).first().json }];"
}
```

### Restore Generator Input After Start Log

| Field | Value |
| --- | --- |
| Node ID | 62a94f43-d7a9-4569-ab92-ef8f6ef6efa8 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Job Started -> Restore Generator Input After Start Log (output 0, input 0)

**Outgoing Connections**

- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "return [{ json: $(\u0027Prepare Generator Input\u0027).first().json }];"
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | 536de7f1-b78e-4d84-904a-29c00871ab37 |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | 0, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending Professional Jobs (output 0, input 0)

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

### Sticky Note 13931090

| Field | Value |
| --- | --- |
| Node ID | e26977fb-1423-49ee-998e-1773c67319ee |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1680, 352 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "## Professional Generation Worker\nProcesses only generatorMode=professional jobs. Adds lock-success guard, JOB_STARTED, QUALITY_GATE_PASSED, JOB_COMPLETED, JOB_FAILED and failed job status handling for the professional backlog path. Non-user-story document types still reuse fullRetrievalD01.",
    "height":  300,
    "width":  3000,
    "color":  5
}
```

### Use Professional Backlog Generator?

| Field | Value |
| --- | --- |
| Node ID | 32513307-ae4d-43f6-b952-e932215d4d21 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1792, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Restore Generator Input After Start Log -> Use Professional Backlog Generator? (output 0, input 0)

**Outgoing Connections**

- Use Professional Backlog Generator? -> Call Professional Backlog Generator (output 0, input 0)
- Use Professional Backlog Generator? -> Call Existing Full Retrieval Generator (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "strict",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "leftValue":  "={{ $json.documentType }}",
                                              "rightValue":  "user_stories",
                                              "operator":  {
                                                               "type":  "string",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```
