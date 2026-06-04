# INGEST API Queue Creator - SaaS

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | pjz9L77szB9DDsN1 |
| Active | False |
| Archived | False |
| Created At | 2026-04-14T07:44:15.022Z |
| Updated At | 2026-05-07T05:15:28.892Z |
| Node Count | 12 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\INGEST API Queue Creator - SaaS [pjz9L77szB9DDsN1].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Respond to Webhook | n8n-nodes-base.respondToWebhook |  | 
- Respond to Webhook | n8n-nodes-base.respondToWebhook
- Upload Test Documents | n8n-nodes-base.webhook | POST | /upload-test-artifacts

Known webhook route hints:

- POST /webhook/upload-test-artifacts

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 5 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key
- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/${projectName}/${jobId}/${encodedFileName}`;\n\n
- https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/uploaded-project-docs/{{

### Supabase/Data Table Hints

- doc_ingestion_jobs
- doc_ingestion_queuecreator_logs
- qa_job_metrics

## Connection Graph

- Generate Job ID -> Split Binary Files for Supabase Upload (source output 0, target input 0)
- Insert JobID into Supabase DB -> LOG: Job Queued (source output 0, target input 0)
- Upload Test Documents -> Generate Job ID (source output 0, target input 0)
- Split Binary Files for Supabase Upload -> Merge (source output 0, target input 0)
- Split Binary Files for Supabase Upload -> Aggregate Job Data (source output 0, target input 0)
- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (source output 0, target input 0)
- Upload Files to Supabase Storage -> Merge (source output 0, target input 1)
- Build File URL Map -> Insert JobID into Supabase DB (source output 0, target input 0)
- Merge -> Build File URL Map (source output 0, target input 0)
- LOG -> Store LOGS in Supabase (source output 0, target input 0)
- Aggregate Job Data -> LOG (source output 0, target input 0)
- LOG: Job Queued -> Respond to Webhook (source output 0, target input 0)

## Nodes

### Aggregate Job Data

| Field | Value |
| --- | --- |
| Node ID | f5aaf388-3641-4ac9-beb9-9c9d1c670948 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 288, 240 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split Binary Files for Supabase Upload -> Aggregate Job Data (output 0, input 0)

**Outgoing Connections**

- Aggregate Job Data -> LOG (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\n\nif (!items.length) return [];\n\nconst first = items[0];\n\nreturn [\n  {\n    json: {\n      jobId: first.json.jobId,\n      projectName: first.json.projectName,\n      totalFiles: items.length,\n      fileKeys: items.map(i =\u003e i.json.fileKey)\n    }\n  }\n];"
}
```

### Build File URL Map

| Field | Value |
| --- | --- |
| Node ID | 454b53b8-4eec-4603-885f-54e95dfbcb63 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1056, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Merge -> Build File URL Map (output 0, input 0)

**Outgoing Connections**

- Build File URL Map -> Insert JobID into Supabase DB (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const items = $input.all();\nif (items.length === 0) {\n  throw new Error(\"No files uploaded successfully\");\n}\n\nconst fileMap = {};\nconst first = items[0];\n\nfor (const item of items) {\n  const { fileKey, fileName, projectName, jobId } = item.json;\n\n  const encodedFileName = encodeURIComponent(fileName);\n\n  const publicUrl = `https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/${projectName}/${jobId}/${encodedFileName}`;\n\n  fileMap[fileKey] = publicUrl;\n}\n\nreturn [{\n  json: {\n    jobId: first.json.jobId,\n    projectName: first.json.projectName,\n    files: fileMap\n  }\n}];"
}
```

### Generate Job ID

| Field | Value |
| --- | --- |
| Node ID | 220d83f4-4d4b-46c9-acfe-69b37ff3ff17 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -192, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upload Test Documents -> Generate Job ID (output 0, input 0)

**Outgoing Connections**

- Generate Job ID -> Split Binary Files for Supabase Upload (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027); // YYMMDD\n\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\n\nconst jobId = `ING-${datePart}-${randomPart}`;\n\nreturn [{\n  json: {\n    jobId,\n    projectName: $json.body?.projectName || \"unknown\"\n  },\n  binary: $binary\n}];"
}
```

### Insert JobID into Supabase DB

| Field | Value |
| --- | --- |
| Node ID | 51fb33ac-a288-4bd8-8881-10c06e2bdc74 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1264, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build File URL Map -> Insert JobID into Supabase DB (output 0, input 0)

**Outgoing Connections**

- Insert JobID into Supabase DB -> LOG: Job Queued (output 0, input 0)

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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Content-Type\": \"application/json\"\n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "job_id",
                                                  "value":  "={{ $json.jobId }}"
                                              },
                                              {
                                                  "name":  "status",
                                                  "value":  "pending"
                                              },
                                              {
                                                  "name":  "input",
                                                  "value":  "={{ { projectName: $json.projectName, files: $json.files } }}"
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
| Node ID | 76dcedb6-6f44-44a5-9004-3d8382caccd0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 496, 240 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Aggregate Job Data -> LOG (output 0, input 0)

**Outgoing Connections**

- LOG -> Store LOGS in Supabase (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const data = $json;\n\nconsole.log(\"ðŸš€ JOB CREATED:\", data);\n\nreturn [\n  {\n    json: {\n      ...data,\n      logType: \"JOB_CREATED\",\n      timestamp: new Date().toISOString()\n    }\n  }\n];"
}
```

### LOG: Job Queued

| Field | Value |
| --- | --- |
| Node ID | 951d65d7-0f8b-49b3-8395-ac9e97783707 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1472, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert JobID into Supabase DB -> LOG: Job Queued (output 0, input 0)

**Outgoing Connections**

- LOG: Job Queued -> Respond to Webhook (output 0, input 0)

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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Prefer\": \"return=minimal\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":       \"{{ $(\u0027Generate Job ID\u0027).item.json.jobId }}\",\n  \"project_name\": \"{{ $(\u0027Generate Job ID\u0027).item.json.projectName }}\",\n  \"pipeline\":     \"ingestion\",\n  \"event\":        \"JOB_QUEUED\",\n  \"status\":       \"info\",\n  \"total_files\":  \"{{ Object.keys($(\u0027Generate Job ID\u0027).item.json.files || {}).length }}\",\n  \"metadata\": {\n    \"file_keys\": \"{{ Object.keys($(\u0027Generate Job ID\u0027).item.json.files || {}) }}\"\n  }\n}",
    "options":  {

                }
}
```

### Merge

| Field | Value |
| --- | --- |
| Node ID | c1c5cc07-1fe8-450c-a44d-165ca3d5d1e5 |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 800, -224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Split Binary Files for Supabase Upload -> Merge (output 0, input 0)
- Upload Files to Supabase Storage -> Merge (output 0, input 1)

**Outgoing Connections**

- Merge -> Build File URL Map (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "mode":  "combine",
    "combineBy":  "combineByPosition",
    "options":  {

                }
}
```

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | 2aa4a855-387f-4d81-b65f-6d561c535e0e |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1648, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Job Queued -> Respond to Webhook (output 0, input 0)

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
    "responseBody":  "={\n  \"jobId\": \"{{ $(\u0027Generate Job ID\u0027).item.json.jobId }}\",\n  \"status\": \"queued\"\n}",
    "options":  {

                }
}
```

### Split Binary Files for Supabase Upload

| Field | Value |
| --- | --- |
| Node ID | 8e40f479-05f6-47f9-8044-79a7bd720200 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 16, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Job ID -> Split Binary Files for Supabase Upload (output 0, input 0)

**Outgoing Connections**

- Split Binary Files for Supabase Upload -> Merge (output 0, input 0)
- Split Binary Files for Supabase Upload -> Aggregate Job Data (output 0, input 0)
- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const binaries = $binary || {};\nconst output = [];\n\nfor (const key of Object.keys(binaries)) {\n  output.push({\n    json: {\n      jobId: $json.jobId,\n      projectName: $json.projectName,\n      fileKey: key,\n      fileName: binaries[key].fileName\n    },\n    binary: {\n      file: binaries[key]\n    }\n  });\n}\n\nreturn output;"
}
```

### Store LOGS in Supabase

| Field | Value |
| --- | --- |
| Node ID | e99bf64c-437d-4436-aa51-c996f2b16e13 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 736, 240 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- LOG -> Store LOGS in Supabase (output 0, input 0)

**Outgoing Connections**

- None

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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_queuecreator_logs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=minimal\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "job_id",
                                                  "value":  "={{ $json.jobId }}"
                                              },
                                              {
                                                  "name":  "project_name",
                                                  "value":  "={{ $json.projectName }}"
                                              },
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
                                              },
                                              {
                                                  "name":  "created_at",
                                                  "value":  "={{ $json.timestamp }}"
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

### Upload Files to Supabase Storage

| Field | Value |
| --- | --- |
| Node ID | f7066913-18c9-4a9b-8de2-18f08b236509 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 576, 16 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (output 0, input 0)

**Outgoing Connections**

- Upload Files to Supabase Storage -> Merge (output 0, input 1)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/uploaded-project-docs/{{ $json.projectName }}/{{ $json.jobId }}/{{ encodeURIComponent($json.fileName) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"x-upsert\": \"true\", \n  \"Content-Type\": \"application/octet-stream\"  \n}",
    "sendBody":  true,
    "contentType":  "multipart-form-data",
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "parameterType":  "formBinaryData",
                                                  "name":  "file",
                                                  "inputDataFieldName":  "file"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Upload Test Documents

| Field | Value |
| --- | --- |
| Node ID | b54d7626-73d3-4ac5-b9d8-2d43cdcf55fd |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -432, 16 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Upload Test Documents -> Generate Job ID (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "/upload-test-artifacts",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

