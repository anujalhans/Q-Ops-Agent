# Q-Ops Agent Artifacts API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | YFsr2hRD7BZlPCEK |
| Active | True |
| Created At | 2026-05-07T05:53:42.864Z |
| Updated At | 2026-05-29T06:47:28.581Z |
| Node Count | 4 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Artifacts API [YFsr2hRD7BZlPCEK].json |

## Description

Draft additive UI API for GET /webhook/artifacts backed by doc_ingestion_jobs. Assign supabase-service-role-key before activation.

## Trigger And Entry Contract

- GET /artifacts | n8n-nodes-base.webhook | artifacts
- Respond Artifacts | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/artifacts

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /artifacts -> Fetch Ingestion Jobs (source output 0, target input 0)
- Fetch Ingestion Jobs -> Map Artifacts Response (source output 0, target input 0)
- Map Artifacts Response -> Respond Artifacts (source output 0, target input 0)

## Nodes

### Fetch Ingestion Jobs

| Field | Value |
| --- | --- |
| Node ID | 8ccdbdb3-c970-4567-9611-e872061f5c3e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /artifacts -> Fetch Ingestion Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch Ingestion Jobs -> Map Artifacts Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,output,created_at,updated_at,error"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "200"
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

### GET /artifacts

| Field | Value |
| --- | --- |
| Node ID | af529232-24b1-4e87-8f8b-8c94b0ba7091 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- GET /artifacts -> Fetch Ingestion Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "artifacts",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Artifacts Response

| Field | Value |
| --- | --- |
| Node ID | 3acae756-92d2-4dbe-8b59-a969fd4f4240 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Ingestion Jobs -> Map Artifacts Response (output 0, input 0)

**Outgoing Connections**

- Map Artifacts Response -> Respond Artifacts (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "function numberFromUnknown(value) {\n  const numeric = Number(value);\n  return Number.isFinite(numeric) ? numeric : 0;\n}\n\nfunction extractionDetails(output) {\n  const observability = output?.extractionObservability || output?.extraction_observability || {};\n  const tokenUsage = output?.tokenUsage || output?.token_usage || {};\n  const files = Array.isArray(observability.files) ? observability.files : [];\n  const file = files[0] || {};\n  const warnings = Array.isArray(observability.warnings)\n    ? observability.warnings\n    : Array.isArray(output?.warnings)\n      ? output.warnings\n      : [];\n  const cleanWarnings = warnings.map(warning =\u003e String(warning || \u0027\u0027).trim()).filter(Boolean);\n  const warningCount = Number(observability.warningCount ?? observability.warning_count ?? output?.warningCount ?? cleanWarnings.length) || cleanWarnings.length;\n  const metrics = {\n    fileName: file.fileName || file.file_name || output?.fileName || \u0027\u0027,\n    docType: file.docType || file.doc_type || output?.docType || \u0027\u0027,\n    fileType: file.fileType || file.file_type || output?.fileType || \u0027\u0027,\n    chunks: numberFromUnknown(output?.totalChunksStored ?? output?.total_chunks_stored ?? output?.chunkCount ?? output?.chunk_count),\n    words: numberFromUnknown(tokenUsage.embeddedWordCount ?? tokenUsage.embedded_word_count ?? output?.wordCount ?? output?.word_count),\n    tokens: numberFromUnknown(tokenUsage.tokensTotal ?? tokenUsage.tokens_total ?? output?.tokensTotal ?? output?.tokens_total),\n    costUsd: numberFromUnknown(tokenUsage.estimatedCostUsd ?? tokenUsage.estimated_cost_usd ?? output?.estimatedCostUsd ?? output?.estimated_cost_usd),\n    durationMs: numberFromUnknown(file.durationMs ?? file.duration_ms ?? observability.durationMs ?? observability.duration_ms),\n    fileSizeBytes: numberFromUnknown(file.fileSizeBytes ?? file.file_size_bytes ?? observability.fileSizeBytes ?? observability.file_size_bytes),\n    responseBytesEstimated: numberFromUnknown(file.responseBytesEstimated ?? file.response_bytes_estimated ?? observability.responseBytesEstimated ?? observability.response_bytes_estimated),\n    tables: numberFromUnknown(file.tableCount ?? file.table_count ?? observability.tableCount ?? observability.table_count),\n    annotations: numberFromUnknown(file.annotationCount ?? file.annotation_count ?? observability.annotationCount ?? observability.annotation_count),\n    links: numberFromUnknown(file.linkCount ?? file.link_count ?? observability.linkCount ?? observability.link_count),\n    visualCandidates: numberFromUnknown(file.visualCandidatesDetected ?? file.visual_candidates_detected ?? observability.visualCandidatesDetected ?? observability.visual_candidates_detected),\n    warnings: warningCount,\n  };\n  return {\n    extractionMetrics: Object.values(metrics).some(value =\u003e Boolean(value)) ? metrics : null,\n    extractionWarnings: cleanWarnings,\n    extractionWarningCount: warningCount,\n    extractionObservability: Object.keys(observability).length ? observability : null,\n  };\n}\n\nconst artifacts = [];\nconst statusMap = { completed: \u0027processed\u0027, failed: \u0027failed\u0027, pending: \u0027processing\u0027, processing: \u0027processing\u0027 };\nfor (const item of $input.all()) {\n  const job = item.json;\n  if (!job || !job.job_id) continue;\n  const input = job.input || {};\n  const files = input.files || {};\n  const details = extractionDetails(job.output || {});\n  for (const [type, url] of Object.entries(files)) {\n    const rawName = String(url).split(\u0027/\u0027).pop() || type;\n    artifacts.push({\n      id: `${job.job_id}:${type}`,\n      projectName: input.projectName || \u0027Unknown project\u0027,\n      type,\n      fileName: decodeURIComponent(rawName),\n      uploadedAt: job.created_at,\n      status: statusMap[job.status] || \u0027processing\u0027,\n      url,\n      jobId: job.job_id,\n      output: job.output || null,\n      extractionMetrics: details.extractionMetrics,\n      extractionWarnings: details.extractionWarnings,\n      extractionWarningCount: details.extractionWarningCount,\n      extractionObservability: details.extractionObservability,\n    });\n  }\n}\nreturn [{ json: { artifacts } }];"
}
```

### Respond Artifacts

| Field | Value |
| --- | --- |
| Node ID | 83c06237-a348-4faa-93be-77b86fda6aaa |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Artifacts Response -> Respond Artifacts (output 0, input 0)

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
    "responseBody":  "={{ $json }}",
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
