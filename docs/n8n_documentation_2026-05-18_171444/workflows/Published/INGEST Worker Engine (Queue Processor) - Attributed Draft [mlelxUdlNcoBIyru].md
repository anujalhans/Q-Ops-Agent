# INGEST Worker Engine (Queue Processor) - Attributed Draft

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | mlelxUdlNcoBIyru |
| Active | True |
| Archived | False |
| Created At | 2026-04-14T09:41:25.246Z |
| Updated At | 2026-05-14T11:33:42.000Z |
| Node Count | 16 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\INGEST Worker Engine (Queue Processor) - Attributed Draft [mlelxUdlNcoBIyru].json |

## Description

Production-shaped inactive attributed ingestion worker draft. Uses schedule polling and pending/processing lifecycle, selects attribution/runtime columns, preserves queue logs, and calls the full vectorization clone draft. Production workflow remains untouched.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 5 |
| n8n-nodes-base.executeWorkflow | 1 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.scheduleTrigger | 1 |
| n8n-nodes-base.stopAndError | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key
- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?status=eq.pending&order=created_at.asc&limit=1&select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{

### Supabase/Data Table Hints

- doc_ingestion_jobs
- doc_ingestion_queuecreator_logs

## Connection Graph

- Schedule Trigger -> Get Pending Jobs (source output 0, target input 0)
- Lock Pending Job picked for processing -> Status = Processing Updated? (source output 0, target input 0)
- Status = Processing Updated? -> Prepare Job Input (source output 0, target input 0)
- Prepare Job Input -> LOG (source output 0, target input 0)
- Prepare Job Input -> Merge (source output 0, target input 0)
- Get Pending Jobs -> Pending Job Exists? (source output 0, target input 0)
- Pending Job Exists? -> Lock Pending Job picked for processing (source output 0, target input 0)
- Convert Files Object Ã¢â€ â€™ Array -> Download Files (Convert URL Ã¢â€ â€™ Binary) (source output 0, target input 0)
- Download Files (Convert URL Ã¢â€ â€™ Binary) -> Convert ALL binaries inside ONE item (source output 0, target input 0)
- Convert ALL binaries inside ONE item -> Call Full Vectorization Clone Draft (source output 0, target input 0)
- LOG -> Store LOGS in Supabase (source output 0, target input 0)
- Merge -> Convert Files Object Ã¢â€ â€™ Array (source output 0, target input 0)
- Store LOGS in Supabase -> Merge (source output 0, target input 1)
- Call Full Vectorization Clone Draft -> Handle Vectorization Subworkflow Error (source output 1, target input 0)
- Handle Vectorization Subworkflow Error -> Mark Ingestion Job Failed (source output 0, target input 0)
- Mark Ingestion Job Failed -> Stop Worker After Ingestion Failure (source output 0, target input 0)

## Nodes

### Call Full Vectorization Clone Draft

| Field | Value |
| --- | --- |
| Node ID | f0c5be32-7206-4f31-9b92-c128cbf81848 |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | 1024, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Convert ALL binaries inside ONE item -> Call Full Vectorization Clone Draft (output 0, input 0)

**Outgoing Connections**

- Call Full Vectorization Clone Draft -> Handle Vectorization Subworkflow Error (output 1, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "C9oZfZxpGFakzlB3",
                       "mode":  "list",
                       "cachedResultUrl":  "/workflow/C9oZfZxpGFakzlB3",
                       "cachedResultName":  "Multimodal Knowledge Ingestion \u0026 Vectorization Engine - In Progress"
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

### Convert ALL binaries inside ONE item

| Field | Value |
| --- | --- |
| Node ID | 39ea961d-3f2c-48ea-a7ab-78949dd4f6a0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 800, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Download Files (Convert URL Ã¢â€ â€™ Binary) -> Convert ALL binaries inside ONE item (output 0, input 0)

**Outgoing Connections**

- Convert ALL binaries inside ONE item -> Call Full Vectorization Clone Draft (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const allItems = $input.all();\n\nlet combinedBinary = {};\nlet combinedJson = [];\n\nallItems.forEach((item, index) =\u003e {\n  combinedJson.push(item.json);\n  if (item.binary \u0026\u0026 item.binary.data) {\n    combinedBinary[\u0027data\u0027 + index] = item.binary.data;\n  }\n});\n\nconst first = allItems[0]?.json || {};\n\nreturn [\n  {\n    json: {\n      files: combinedJson,\n      jobId: first.jobId,\n      projectName: first.projectName,\n      status: first.status,\n      projectId: first.projectId || null,\n      requestedBy: first.requestedBy || null,\n      settingsVersion: first.settingsVersion || null,\n      configSnapshot: first.configSnapshot || {},\n      processingStartedAt: first.processingStartedAt || null\n    },\n    binary: combinedBinary\n  }\n];"
}
```

### Convert Files Object Ã¢â€ â€™ Array

| Field | Value |
| --- | --- |
| Node ID | 99a8844b-3ecf-4552-9961-afdaf097ddc0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 384, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Convert Files Object Ã¢â€ â€™ Array (output 0, input 0)

**Outgoing Connections**

- Convert Files Object Ã¢â€ â€™ Array -> Download Files (Convert URL Ã¢â€ â€™ Binary) (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const files = $json.files || {};\n\nreturn Object.entries(files).map(([key, url]) =\u003e {\n  return {\n    json: {\n      fileKey: key,\n      fileUrl: url,\n      projectName: $json.projectName,\n      status: $json.status,\n      jobId: $json.jobId,\n      projectId: $json.projectId || null,\n      requestedBy: $json.requestedBy || null,\n      settingsVersion: $json.settingsVersion || null,\n      configSnapshot: $json.configSnapshot || {},\n      processingStartedAt: $json.processingStartedAt || null\n    }\n  };\n});"
}
```

### Download Files (Convert URL Ã¢â€ â€™ Binary)

| Field | Value |
| --- | --- |
| Node ID | 3f2c02ba-81ca-42da-83cc-fb5a1aa5f900 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 592, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Convert Files Object Ã¢â€ â€™ Array -> Download Files (Convert URL Ã¢â€ â€™ Binary) (output 0, input 0)

**Outgoing Connections**

- Download Files (Convert URL Ã¢â€ â€™ Binary) -> Convert ALL binaries inside ONE item (output 0, input 0)

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
    "url":  "={{ $json.fileUrl }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"x-upsert\": \"true\", \n  \"Content-Type\": \"application/octet-stream\"  \n}",
    "options":  {
                    "response":  {
                                     "response":  {
                                                      "responseFormat":  "file"
                                                  }
                                 }
                }
}
```

### Get Pending Jobs

| Field | Value |
| --- | --- |
| Node ID | 0fd20ca7-7789-4110-b209-281d1b14a2f5 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -1648, -128 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending Jobs -> Pending Job Exists? (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?status=eq.pending\u0026order=created_at.asc\u0026limit=1\u0026select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Content-Type\": \"application/json\"\n}",
    "options":  {

                }
}
```

### Handle Vectorization Subworkflow Error

| Field | Value |
| --- | --- |
| Node ID | handle-vectorization-subworkflow-error |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1248, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Call Full Vectorization Clone Draft -> Handle Vectorization Subworkflow Error (output 1, input 0)

**Outgoing Connections**

- Handle Vectorization Subworkflow Error -> Mark Ingestion Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $(\u0027Convert ALL binaries inside ONE item\u0027).first().json || {};\n\nfunction clean(value, fallback = \u0027\u0027) {\n  if (value === null || value === undefined) return fallback;\n  if (typeof value === \u0027string\u0027) return value.trim() || fallback;\n  try {\n    return JSON.stringify(value);\n  } catch {\n    return String(value);\n  }\n}\n\nfunction pickMessage(json) {\n  return clean(\n    json.error?.message ||\n    json.errorMessage ||\n    json.message ||\n    json.description ||\n    \u0027Ingestion vectorization failed before chunks could be stored in ChromaDB\u0027\n  );\n}\n\nreturn $input.all().map((item) =\u003e {\n  const json = item.json || {};\n  const message = pickMessage(json);\n  return {\n    json: {\n      jobId: clean(source.jobId || json.jobId),\n      projectName: clean(source.projectName || json.projectName),\n      projectId: clean(source.projectId || json.projectId),\n      requestedBy: clean(source.requestedBy || json.requestedBy),\n      settingsVersion: source.settingsVersion ?? json.settingsVersion ?? null,\n      failureStage: \u0027full_ingest_vectorization_subworkflow\u0027,\n      source: \u0027fullIngestDraft01\u0027,\n      message,\n      errorDetails: json.errorDetails || json.error || null,\n      timestamp: new Date().toISOString()\n    }\n  };\n});"
}
```

### Lock Pending Job picked for processing

| Field | Value |
| --- | --- |
| Node ID | 3ceda994-bd77-4200-b894-223a4000dde8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -1120, -144 |
| Disabled |  |
| Always Output Data | False |
| Retry On Fail | False |
| Continue On Fail |  |

**Incoming Connections**

- Pending Job Exists? -> Lock Pending Job picked for processing (output 0, input 0)

**Outgoing Connections**

- Lock Pending Job picked for processing -> Status = Processing Updated? (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.pending",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "status",
                                                  "value":  "processing"
                                              },
                                              {
                                                  "name":  "updated_at",
                                                  "value":  "={{ new Date().toISOString() }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### LOG

| Field | Value |
| --- | --- |
| Node ID | ebd672f4-30b6-416c-8c9e-aa204691eb13 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -336, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Job Input -> LOG (output 0, input 0)

**Outgoing Connections**

- LOG -> Store LOGS in Supabase (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const data = $json;\n\n// Ã¢Å“â€¦ Extract keys from files object\nconst fileKeys = Object.keys(data.files || {});\nconst totalFiles = fileKeys.length;\n\nconsole.log(\"Ã°Å¸Å¡â‚¬ PROCESSING STARTED:\", {\n  jobId: data.jobId,\n  projectName: data.projectName,\n  totalFiles,\n  fileKeys\n});\n\nreturn [\n  {\n    json: {\n      jobId: data.jobId,\n      projectName: data.projectName,\n      totalFiles,\n      fileKeys,\n      logType: \"PROCESSING_STARTED\"\n    }\n  }\n];"
}
```

### Mark Ingestion Job Failed

| Field | Value |
| --- | --- |
| Node ID | mark-ingestion-job-failed |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1488, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Handle Vectorization Subworkflow Error -> Mark Ingestion Job Failed (output 0, input 0)

**Outgoing Connections**

- Mark Ingestion Job Failed -> Stop Worker After Ingestion Failure (output 0, input 0)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs?job_id=eq.{{ encodeURIComponent($json.jobId || \u0027\u0027) }}\u0026status=eq.processing",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"status\": \"failed\",\n  \"error\": {{ JSON.stringify($json.message || \"Ingestion failed before chunks could be stored in ChromaDB\") }},\n  \"output\": {\n    \"error\": true,\n    \"message\": {{ JSON.stringify($json.message || \"Ingestion failed before chunks could be stored in ChromaDB\") }},\n    \"source\": {{ JSON.stringify($json.source || \"fullIngestDraft01\") }},\n    \"failureStage\": {{ JSON.stringify($json.failureStage || \"full_ingest_vectorization_subworkflow\") }},\n    \"timestamp\": {{ JSON.stringify($json.timestamp || new Date().toISOString()) }},\n    \"projectName\": {{ JSON.stringify($json.projectName || null) }},\n    \"projectId\": {{ JSON.stringify($json.projectId || null) }},\n    \"requestedBy\": {{ JSON.stringify($json.requestedBy || null) }},\n    \"settingsVersion\": {{ $json.settingsVersion === undefined || $json.settingsVersion === null ? \u0027null\u0027 : Number($json.settingsVersion) }},\n    \"details\": {{ JSON.stringify($json.errorDetails || null) }}\n  },\n  \"updated_at\": \"{{$now}}\"\n}",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | 0d80e71e-991a-4c88-8dce-2b89b8be9c43 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 128, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Job Input -> Merge (output 0, input 0)
- Store LOGS in Supabase -> Merge (output 0, input 1)

**Outgoing Connections**

- Merge -> Convert Files Object Ã¢â€ â€™ Array (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "mode":  "chooseBranch"
}
```

### Pending Job Exists?

| Field | Value |
| --- | --- |
| Node ID | 519015c1-00e9-4084-92fe-c21eea8b42bf |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -1376, -128 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending Jobs -> Pending Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending Job Exists? -> Lock Pending Job picked for processing (output 0, input 0)

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
                                              "id":  "c0314ece-605e-45a9-acb9-860fc2d11e56",
                                              "leftValue":  "={{Object.keys($json).length}}",
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

### Prepare Job Input

| Field | Value |
| --- | --- |
| Node ID | 3fc647d5-62c2-4155-84e7-fab5fb253adc |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -544, -160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Status = Processing Updated? -> Prepare Job Input (output 0, input 0)

**Outgoing Connections**

- Prepare Job Input -> LOG (output 0, input 0)
- Prepare Job Input -> Merge (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = Array.isArray($json) ? $json[0] : $json;\nconst input = job.input || {};\n\nreturn [{\n  json: {\n    jobId: job.job_id,\n    projectName: input.projectName,\n    status: job.status,\n    files: input.files || {},\n    projectId: job.project_id || null,\n    requestedBy: job.requested_by || null,\n    settingsVersion: job.settings_version || null,\n    configSnapshot: job.config_snapshot || {},\n    processingStartedAt: job.updated_at || new Date().toISOString()\n  }\n}];"
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | d37d2d2a-88f1-4abb-bda8-8272151477e3 |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | -1888, -128 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending Jobs (output 0, input 0)

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

### Status = Processing Updated?

| Field | Value |
| --- | --- |
| Node ID | 9ead1d9a-79a3-4ca9-bf74-c0c86610f7a2 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -880, -144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock Pending Job picked for processing -> Status = Processing Updated? (output 0, input 0)

**Outgoing Connections**

- Status = Processing Updated? -> Prepare Job Input (output 0, input 0)

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
                                       "typeValidation":  "loose",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "c2905e12-f1ce-4d8b-84c5-8dd919a56d90",
                                              "leftValue":  "={{ Object.keys($json).length}}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "looseTypeValidation":  true,
    "options":  {

                }
}
```

### Stop Worker After Ingestion Failure

| Field | Value |
| --- | --- |
| Node ID | stop-worker-after-ingestion-failure |
| Type | n8n-nodes-base.stopAndError |
| Type Version | 1 |
| Position | 1728, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Mark Ingestion Job Failed -> Stop Worker After Ingestion Failure (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "errorMessage":  "={{ $json.error || $json.message || \"Ingestion failed before chunks could be stored in ChromaDB\" }}"
}
```

### Store LOGS in Supabase

| Field | Value |
| --- | --- |
| Node ID | 37a773e6-8be3-4102-9415-9e0657ea727a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -96, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- LOG -> Store LOGS in Supabase (output 0, input 0)

**Outgoing Connections**

- Store LOGS in Supabase -> Merge (output 0, input 1)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs?job_id=eq.{{ $json.jobId }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=minimal\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "total_files",
                                                  "value":  "={{ $json.totalFiles }}"
                                              },
                                              {
                                                  "name":  "file_keys",
                                                  "value":  "={{ $json.fileKeys }}"
                                              },
                                              {
                                                  "name":  "log_type",
                                                  "value":  "={{ $json.logType }}"
                                              }
                                          ]
                       },
    "options":  {
                    "batching":  {
                                     "batch":  {
                                                   "batchSize":  1
                                               }
                                 }
                }
}
```
