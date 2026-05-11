# INGEST API Queue Creator - SaaS - Attributed Draft

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | iiR8d9v5oI8WzBPX |
| Active | True |
| Created At | 2026-05-07T15:58:56.088Z |
| Updated At | 2026-05-08T04:17:21.857Z |
| Node Count | 16 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\INGEST API Queue Creator - SaaS - Attributed Draft.json |

## Description

Production-shaped inactive attributed draft of the upload queue creator. Uses the production webhook path, preserves queuecreator logs, and writes attribution/runtime config, but remains unpublished/inactive until cutover.

## Trigger And Entry Contract

- Upload Test Documents | n8n-nodes-base.webhook | POST | /upload-test-artifacts
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/upload-test-artifacts

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 7 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key
- httpCustomAuth: supabase-service-role-key

## Connection Graph

- Generate Job ID -> Split Binary Files for Supabase Upload (source output 0, target input 0)
- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (source output 0, target input 0)
- Split Binary Files for Supabase Upload -> Aggregate Job Data (source output 0, target input 0)
- Upload Files to Supabase Storage -> Build File URL Map (source output 0, target input 0)
- Build File URL Map -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Prepare Runtime Request (source output 0, target input 0)
- Prepare Runtime Request -> Resolve Runtime Config (source output 0, target input 0)
- Resolve Runtime Config -> Combine Job And Runtime (source output 0, target input 0)
- Combine Job And Runtime -> Insert JobID into Supabase DB (source output 0, target input 0)
- Insert JobID into Supabase DB -> LOG: Job Queued (source output 0, target input 0)
- LOG: Job Queued -> Respond to Webhook (source output 0, target input 0)
- LOG -> Store LOGS in Supabase (source output 0, target input 0)
- Aggregate Job Data -> LOG (source output 0, target input 0)
- Upload Test Documents -> Generate Job ID (source output 0, target input 0)

## Nodes

### Aggregate Job Data

| Field | Value |
| --- | --- |
| Node ID | 5d2eeee1-5391-408a-a785-14513043d0ad |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 688, 288 |
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
| Node ID | 6b70e033-edcb-4467-9aff-e62a27fd806f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upload Files to Supabase Storage -> Build File URL Map (output 0, input 0)

**Outgoing Connections**

- Build File URL Map -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const splitItems = $(\u0027Split Binary Files for Supabase Upload\u0027).all();\nif (splitItems.length === 0) throw new Error(\u0027No files uploaded successfully\u0027);\nconst first = splitItems[0].json;\nconst fileMap = {};\nfor (const item of splitItems) {\n  const { fileKey, fileName, projectName, jobId } = item.json;\n  const encodedFileName = encodeURIComponent(fileName);\n  fileMap[fileKey] = `https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/object/public/uploaded-project-docs/${projectName}/${jobId}/${encodedFileName}`;\n}\nreturn [{ json: { jobId: first.jobId, projectName: first.projectName, projectId: first.projectId || null, environment: first.environment || \u0027local\u0027, token: first.token, files: fileMap } }];"
}
```

### Combine Job And Runtime

| Field | Value |
| --- | --- |
| Node ID | f0f99914-67a1-473d-a8cc-179d824bf5a5 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Resolve Runtime Config -> Combine Job And Runtime (output 0, input 0)

**Outgoing Connections**

- Combine Job And Runtime -> Insert JobID into Supabase DB (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const runtimeRaw = $input.first().json || {};\nconst runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;\nconst job = $(\u0027Prepare Runtime Request\u0027).first().json;\nconst settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? null;\nconst configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? {};\nreturn [{ json: { ...job, settingsVersion, configSnapshot } }];"
}
```

### Fetch Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 4e5dab67-de5c-4456-8840-08e3e754616b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Q-Ops User Profile -> Prepare Runtime Request (output 0, input 0)

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

### Generate Job ID

| Field | Value |
| --- | --- |
| Node ID | 40c9aaea-e69e-4335-8a99-f6b757aaba7f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
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
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `ING-${datePart}-${randomPart}`;\nconst headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) throw new Error(\u0027Missing bearer token\u0027);\nconst body = $json.body || {};\nreturn [{ json: { jobId, projectName: body.projectName || \u0027unknown\u0027, projectId: body.projectId || null, environment: body.environment || \u0027local\u0027, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027) }, binary: $binary }];"
}
```

### Insert JobID into Supabase DB

| Field | Value |
| --- | --- |
| Node ID | 1520c3a8-ffcb-4ac7-b8b1-98b0afcc92b2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Job And Runtime -> Insert JobID into Supabase DB (output 0, input 0)

**Outgoing Connections**

- Insert JobID into Supabase DB -> LOG: Job Queued (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
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
                                              },
                                              {
                                                  "name":  "project_id",
                                                  "value":  "={{ $json.projectId }}"
                                              },
                                              {
                                                  "name":  "requested_by",
                                                  "value":  "={{ $json.requestedBy }}"
                                              },
                                              {
                                                  "name":  "settings_version",
                                                  "value":  "={{ $json.settingsVersion }}"
                                              },
                                              {
                                                  "name":  "config_snapshot",
                                                  "value":  "={{ $json.configSnapshot }}"
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
| Node ID | 70159b69-10a3-434a-99f5-46ac6754b001 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 288 |
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
    "jsCode":  "const data = $json;\n\nconsole.log(\"Ã°Å¸Å¡â‚¬ JOB CREATED:\", data);\n\nreturn [\n  {\n    json: {\n      ...data,\n      logType: \"JOB_CREATED\",\n      timestamp: new Date().toISOString()\n    }\n  }\n];"
}
```

### LOG: Job Queued

| Field | Value |
| --- | --- |
| Node ID | bde0b669-4698-482f-9d7b-70d60641a87f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
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
    "jsonBody":  "={{ { \"job_id\": $(\"Combine Job And Runtime\").first().json.jobId, \"project_name\": $(\"Combine Job And Runtime\").first().json.projectName, \"pipeline\": \"ingestion\", \"event\": \"JOB_QUEUED\", \"status\": \"info\", \"total_files\": Object.keys($(\"Combine Job And Runtime\").first().json.files || {}).length, \"project_id\": $(\"Combine Job And Runtime\").first().json.projectId, \"requested_by\": $(\"Combine Job And Runtime\").first().json.requestedBy, \"metadata\": { \"file_keys\": Object.keys($(\"Combine Job And Runtime\").first().json.files || {}), \"settings_version\": $(\"Combine Job And Runtime\").first().json.settingsVersion, \"project_id\": $(\"Combine Job And Runtime\").first().json.projectId, \"requested_by\": $(\"Combine Job And Runtime\").first().json.requestedBy, \"environment\": $(\"Combine Job And Runtime\").first().json.environment } } }}",
    "options":  {

                }
}
```

### Prepare Runtime Request

| Field | Value |
| --- | --- |
| Node ID | 7adea8b9-cf16-4777-88f4-08741c8b0052 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User Profile -> Prepare Runtime Request (output 0, input 0)

**Outgoing Connections**

- Prepare Runtime Request -> Resolve Runtime Config (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const profile = $input.first().json || {};\nif (!profile.id || profile.status !== \u0027active\u0027) throw new Error(\u0027Active Q-Ops user profile not found\u0027);\nconst job = $(\u0027Build File URL Map\u0027).first().json;\nreturn [{ json: { ...job, requestedBy: profile.id, qopsUser: profile, runtimeRequest: { p_environment_key: job.environment || \u0027local\u0027, p_project_id: job.projectId || null, p_pipeline: \u0027ingestion\u0027, p_requested_by: profile.id } } }];"
}
```

### Resolve Runtime Config

| Field | Value |
| --- | --- |
| Node ID | a0c00a05-7a0d-49c1-b31d-4d0a9aaba399 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Runtime Request -> Resolve Runtime Config (output 0, input 0)

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
    "jsonBody":  "={{ $json.runtimeRequest }}",
    "options":  {

                }
}
```

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | baac1bed-0b07-4203-84c4-91863f7113c1 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, 0 |
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
| Node ID | 15070ed0-f3ca-4a23-945b-07b42d57cc32 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Job ID -> Split Binary Files for Supabase Upload (output 0, input 0)

**Outgoing Connections**

- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (output 0, input 0)
- Split Binary Files for Supabase Upload -> Aggregate Job Data (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const binaries = $binary || {};\nconst output = [];\nfor (const key of Object.keys(binaries)) {\n  output.push({ json: { jobId: $json.jobId, projectName: $json.projectName, projectId: $json.projectId || null, environment: $json.environment || \u0027local\u0027, token: $json.token, fileKey: key, fileName: binaries[key].fileName }, binary: { file: binaries[key] } });\n}\nreturn output;"
}
```

### Store LOGS in Supabase

| Field | Value |
| --- | --- |
| Node ID | 468846a2-4996-4281-96af-33f6da376f00 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1136, 288 |
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
| Node ID | adfd19e1-36b2-4e81-9565-f88205d508cd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Split Binary Files for Supabase Upload -> Upload Files to Supabase Storage (output 0, input 0)

**Outgoing Connections**

- Upload Files to Supabase Storage -> Build File URL Map (output 0, input 0)

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
    "jsonHeaders":  "{ \"x-upsert\": \"true\", \"Content-Type\": \"application/octet-stream\" }",
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
| Node ID | b187cee8-6eec-4799-baa4-1020f927155d |
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

### Verify Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 8d05fe47-3938-4c54-8fba-7bd8ec14c7ad |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build File URL Map -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User Profile (output 0, input 0)

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

