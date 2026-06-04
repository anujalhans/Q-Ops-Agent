# Q-Ops Agent Artifact Reprocess API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | zHsg1Zr7oGOvhPFg |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T05:54:43.132Z |
| Updated At | 2026-05-14T06:41:49.226Z |
| Node Count | 12 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent Artifact Reprocess API [zHsg1Zr7oGOvhPFg].json |

## Description

Auth-aware POST /webhook/artifacts/reprocess endpoint. Body uses artifactId formatted as jobId:fileKey; only failed artifacts can be reprocessed, registered users must have assigned project access, and queued metrics preserve attribution.

## Trigger And Entry Contract

- POST /artifacts/reprocess | n8n-nodes-base.webhook | POST | artifacts/reprocess
- Respond Reprocess Queued | n8n-nodes-base.respondToWebhook |  | 
- Respond Reprocess Queued | n8n-nodes-base.respondToWebhook
- Respond Reprocess Rejected | n8n-nodes-base.respondToWebhook |  | 
- Respond Reprocess Rejected | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/artifacts/reprocess

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 6 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users

### Supabase/Data Table Hints

- doc_ingestion_jobs
- qa_job_metrics
- qops_project_members
- qops_projects
- qops_users

## Connection Graph

- POST /artifacts/reprocess -> Prepare Reprocess Request (source output 0, target input 0)
- Prepare Reprocess Request -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (source output 0, target input 0)
- Fetch Current User Project Memberships -> Fetch Reprocess Source Job (source output 0, target input 0)
- Fetch Reprocess Source Job -> Prepare Reprocess Insert (source output 0, target input 0)
- Prepare Reprocess Insert -> Can Queue Reprocess? (source output 0, target input 0)
- Can Queue Reprocess? -> Insert Reprocess Ingestion Job (source output 0, target input 0)
- Can Queue Reprocess? -> Respond Reprocess Rejected (source output 1, target input 0)
- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (source output 0, target input 0)
- Insert Reprocess Metric -> Respond Reprocess Queued (source output 0, target input 0)

## Nodes

### Can Queue Reprocess?

| Field | Value |
| --- | --- |
| Node ID | 0512b948-5c7b-4bf2-b537-b284c5c3cbf1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1568, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Reprocess Insert -> Can Queue Reprocess? (output 0, input 0)

**Outgoing Connections**

- Can Queue Reprocess? -> Insert Reprocess Ingestion Job (output 0, input 0)
- Can Queue Reprocess? -> Respond Reprocess Rejected (output 1, input 0)

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
                                       "version":  2
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

### Fetch Current User Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 3bd4aed0-365f-4b6a-8b1d-940eeac8f32e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Current User Project Memberships -> Fetch Reprocess Source Job (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "project_id,project_role,qops_projects(name)"
                                               },
                                               {
                                                   "name":  "user_id",
                                                   "value":  "=eq.{{ $(\"Fetch Q-Ops User Profile\").first().json.id || \"00000000-0000-0000-0000-000000000000\" }}"
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

### Fetch Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 633a7a4b-54f7-4b2a-aeaa-7ae7a62ad45f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,auth_user_id,email,name,role,status"
                                               },
                                               {
                                                   "name":  "or",
                                                   "value":  "=(auth_user_id.eq.{{ $(\"Verify Supabase Auth User\").item.json.id }},email.eq.{{ encodeURIComponent($(\"Verify Supabase Auth User\").item.json.email || \"\") }})"
                                               },
                                               {
                                                   "name":  "status",
                                                   "value":  "eq.active"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
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

### Fetch Reprocess Source Job

| Field | Value |
| --- | --- |
| Node ID | 2c0173cc-94d2-41e5-884a-1d7f5d778e3b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current User Project Memberships -> Fetch Reprocess Source Job (output 0, input 0)

**Outgoing Connections**

- Fetch Reprocess Source Job -> Prepare Reprocess Insert (output 0, input 0)

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
                                                   "name":  "job_id",
                                                   "value":  "=eq.{{ $(\"Prepare Reprocess Request\").item.json.jobId }}"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,project_id,requested_by,settings_version,config_snapshot"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
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

### Insert Reprocess Ingestion Job

| Field | Value |
| --- | --- |
| Node ID | 088257ae-665c-4d07-b510-43965478e266 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Can Queue Reprocess? -> Insert Reprocess Ingestion Job (output 0, input 0)

**Outgoing Connections**

- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (output 0, input 0)

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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.payload }}",
    "options":  {

                }
}
```

### Insert Reprocess Metric

| Field | Value |
| --- | --- |
| Node ID | f47ef671-797e-4c58-8b20-4559cb22d0ef |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (output 0, input 0)

**Outgoing Connections**

- Insert Reprocess Metric -> Respond Reprocess Queued (output 0, input 0)

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
    "jsonBody":  "={{ $(\"Prepare Reprocess Insert\").item.json.metric }}",
    "options":  {

                }
}
```

### POST /artifacts/reprocess

| Field | Value |
| --- | --- |
| Node ID | d3ad5c77-6204-4f6e-89f3-065265835f79 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- POST /artifacts/reprocess -> Prepare Reprocess Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "artifacts/reprocess",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Reprocess Insert

| Field | Value |
| --- | --- |
| Node ID | b1808383-29ca-4b92-bf09-786ede80c8af |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Reprocess Source Job -> Prepare Reprocess Insert (output 0, input 0)

**Outgoing Connections**

- Prepare Reprocess Insert -> Can Queue Reprocess? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027Prepare Reprocess Request\u0027).first().json || {};\nconst authUser = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst profile = $(\u0027Fetch Q-Ops User Profile\u0027).first().json || {};\nconst memberships = $items(\u0027Fetch Current User Project Memberships\u0027).map(i =\u003e i.json).filter(m =\u003e m \u0026\u0026 m.project_id);\nconst source = $(\u0027Fetch Reprocess Source Job\u0027).first().json || {};\nfunction fail(code, message, statusCode = 400) { return [{ json: { ok: false, error: code, message, statusCode } }]; }\nif (!request.accessToken || !authUser.id || !profile.id || profile.status !== \u0027active\u0027) return fail(\u0027unauthorized\u0027, \u0027Missing or invalid Supabase Auth token.\u0027, 401);\nif (!request.jobId || !request.fileKey) return fail(\u0027bad_request\u0027, \u0027artifactId must be formatted as jobId:fileKey.\u0027, 400);\nif (!source.job_id) return fail(\u0027not_found\u0027, \u0027Source artifact was not found.\u0027, 404);\nif (source.status !== \u0027failed\u0027) return fail(\u0027not_reprocessable\u0027, \u0027Only failed artifacts can be reprocessed.\u0027, 409);\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst allowedProjectIds = new Set(memberships.map(m =\u003e String(m.project_id)));\nconst sourceProjectId = source.project_id ? String(source.project_id) : \u0027\u0027;\nconst sourceRequestedBy = source.requested_by ? String(source.requested_by) : \u0027\u0027;\nconst hasProjectAccess = Boolean(sourceProjectId \u0026\u0026 allowedProjectIds.has(sourceProjectId));\nif (!isAdmin \u0026\u0026 !hasProjectAccess) return fail(\u0027forbidden\u0027, \u0027You do not have access to reprocess this artifact.\u0027, 403);\nconst input = source.input || {};\nconst files = input.files || {};\nconst url = files[request.fileKey];\nif (!url) return fail(\u0027not_found\u0027, \u0027Source artifact file was not found on the source job.\u0027, 404);\nconst now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `ING-${datePart}-${randomPart}`;\nconst requestedBy = sourceRequestedBy || profile.id;\nconst settingsVersion = source.settings_version || null;\nconst projectName = input.projectName || \u0027Unknown project\u0027;\nconst payload = { job_id: jobId, status: \u0027pending\u0027, input: { projectName, files: { [request.fileKey]: url }, reprocessOf: request.artifactId, reprocessRequestedBy: profile.id }, project_id: source.project_id || null, requested_by: requestedBy, settings_version: settingsVersion, config_snapshot: source.config_snapshot || null };\nconst metric = { job_id: jobId, project_id: source.project_id || null, requested_by: requestedBy, project_name: projectName, pipeline: \u0027ingestion\u0027, event: \u0027JOB_REPROCESS_QUEUED\u0027, status: \u0027info\u0027, total_files: 1, metadata: { reprocessOf: request.artifactId, sourceJobId: source.job_id, fileKey: request.fileKey, requestedBy: profile.id, projectId: source.project_id || null, settingsVersion } };\nreturn [{ json: { ok: true, jobId, payload, metric } }];"
}
```

### Prepare Reprocess Request

| Field | Value |
| --- | --- |
| Node ID | f795d7c3-b6ae-47a7-a5ef-3e788b262e19 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /artifacts/reprocess -> Prepare Reprocess Request (output 0, input 0)

**Outgoing Connections**

- Prepare Reprocess Request -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const body = $json.body || {};\nconst headers = $json.headers || {};\nconst artifactId = String(body.artifactId || body.id || \u0027\u0027).trim();\nconst parts = artifactId.split(\u0027:\u0027);\nconst jobId = parts.shift() || \u0027\u0027;\nconst fileKey = parts.join(\u0027:\u0027);\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst accessToken = String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027).trim();\nreturn [{ json: { artifactId, jobId, fileKey, accessToken } }];"
}
```

### Respond Reprocess Queued

| Field | Value |
| --- | --- |
| Node ID | 96118847-1847-4b1a-9e3d-b9b984f4b82a |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Reprocess Metric -> Respond Reprocess Queued (output 0, input 0)

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
    "responseBody":  "={{ { jobId: $(\"Prepare Reprocess Insert\").item.json.jobId, status: \"queued\" } }}",
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

### Respond Reprocess Rejected

| Field | Value |
| --- | --- |
| Node ID | 3142ba4c-b4d7-4e19-a71d-0072203ef15e |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1792, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Can Queue Reprocess? -> Respond Reprocess Rejected (output 1, input 0)

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

### Verify Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 63a771f3-5ba6-4ee3-bc9c-e5daf6cb3a4f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Reprocess Request -> Verify Supabase Auth User (output 0, input 0)

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
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"Bearer {{ $json.accessToken }}\", \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```
