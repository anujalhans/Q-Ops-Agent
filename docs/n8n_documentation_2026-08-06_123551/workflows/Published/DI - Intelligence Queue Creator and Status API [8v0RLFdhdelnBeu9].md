# DI - Intelligence Queue Creator and Status API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 8v0RLFdhdelnBeu9 |
| Active | True |
| Created At | 2026-05-11T10:36:52.263Z |
| Updated At | 2026-05-11T10:46:34.433Z |
| Node Count | 26 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\DI - Intelligence Queue Creator and Status API [8v0RLFdhdelnBeu9].json |

## Description

Delivery Intelligence UI API for POST /webhook/di/jobs queue creation and GET /webhook/di/jobs polling, isolated to di_intelligence_jobs and existing auth/project membership tables.

## Trigger And Entry Contract

- POST /di/jobs | n8n-nodes-base.webhook | POST | di/jobs
- Respond DI Job Queued | n8n-nodes-base.respondToWebhook
- Respond DI Queue Error | n8n-nodes-base.respondToWebhook
- OPTIONS /di/jobs | n8n-nodes-base.webhook | OPTIONS | di/jobs
- Respond DI Jobs CORS | n8n-nodes-base.respondToWebhook
- GET /di/jobs | n8n-nodes-base.webhook | di/jobs
- Respond DI Job Status | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/di/jobs
- OPTIONS /webhook/di/jobs
- POST /webhook/di/jobs

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 6 |
| n8n-nodes-base.httpRequest | 8 |
| n8n-nodes-base.if | 4 |
| n8n-nodes-base.respondToWebhook | 4 |
| n8n-nodes-base.stickyNote | 1 |
| n8n-nodes-base.webhook | 3 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- POST /di/jobs -> Prepare DI Queue Request (source output 0, target input 0)
- Prepare DI Queue Request -> Valid DI Queue Request? (source output 0, target input 0)
- Valid DI Queue Request? -> Verify Queue Supabase Auth User (source output 0, target input 0)
- Valid DI Queue Request? -> Respond DI Queue Error (source output 1, target input 0)
- Verify Queue Supabase Auth User -> Fetch Queue Q-Ops User Profile (source output 0, target input 0)
- Fetch Queue Q-Ops User Profile -> Fetch Queue Project Memberships (source output 0, target input 0)
- Fetch Queue Project Memberships -> Authorize And Build DI Job (source output 0, target input 0)
- Authorize And Build DI Job -> DI Queue Authorized? (source output 0, target input 0)
- DI Queue Authorized? -> Fetch Existing DI Job (source output 0, target input 0)
- DI Queue Authorized? -> Respond DI Queue Error (source output 1, target input 0)
- Fetch Existing DI Job -> Decide Existing DI Job (source output 0, target input 0)
- Decide Existing DI Job -> Existing DI Job Found? (source output 0, target input 0)
- Existing DI Job Found? -> Respond DI Job Queued (source output 0, target input 0)
- Existing DI Job Found? -> Insert DI Intelligence Job (source output 1, target input 0)
- Insert DI Intelligence Job -> Map Inserted DI Job Response (source output 0, target input 0)
- Map Inserted DI Job Response -> Respond DI Job Queued (source output 0, target input 0)
- OPTIONS /di/jobs -> Respond DI Jobs CORS (source output 0, target input 0)
- GET /di/jobs -> Prepare DI Status Request (source output 0, target input 0)
- Prepare DI Status Request -> Valid DI Status Request? (source output 0, target input 0)
- Valid DI Status Request? -> Verify Status Supabase Auth User (source output 0, target input 0)
- Valid DI Status Request? -> Respond DI Job Status (source output 1, target input 0)
- Verify Status Supabase Auth User -> Fetch Status Q-Ops User Profile (source output 0, target input 0)
- Fetch Status Q-Ops User Profile -> Fetch DI Job Status (source output 0, target input 0)
- Fetch DI Job Status -> Map DI Status Response (source output 0, target input 0)
- Map DI Status Response -> Respond DI Job Status (source output 0, target input 0)

## Nodes

### Authorize And Build DI Job

| Field | Value |
| --- | --- |
| Node ID | 4fa065ee-d661-4d7a-9f3c-ed895b86e3d4 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Queue Project Memberships -> Authorize And Build DI Job (output 0, input 0)

**Outgoing Connections**

- Authorize And Build DI Job -> DI Queue Authorized? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const req = $(\u0027Prepare DI Queue Request\u0027).first().json;\nconst auth = $(\u0027Verify Queue Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Queue Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nconst memberships = $items(\u0027Fetch Queue Project Memberships\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.project_id);\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst hasProject = !req.projectId || memberships.some(m =\u003e m.project_id === req.projectId);\nif (!isAdmin \u0026\u0026 req.jobType === \u0027semantic_reindex\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027ADMIN_REQUIRED\u0027, message: \u0027semantic_reindex requires admin role\u0027 } }];\nif (!isAdmin \u0026\u0026 !hasProject) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROJECT_ACCESS_DENIED\u0027, message: \u0027User is not assigned to this project\u0027 } }];\nconst payload = { job_id: req.jobId, status: \u0027pending\u0027, job_type: req.jobType, project_id: req.projectId, requested_by: profile.id, input: req.input, output: { queuedAt: new Date().toISOString(), queuedBy: profile.email, source: \u0027di-ui\u0027 } };\nreturn [{ json: { ok: true, jobId: req.jobId, jobType: req.jobType, projectId: req.projectId, requestedBy: profile.id, payload } }];"
}
```

### Decide Existing DI Job

| Field | Value |
| --- | --- |
| Node ID | 75cb767e-749d-48eb-bb3d-37c4a601f374 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Existing DI Job -> Decide Existing DI Job (output 0, input 0)

**Outgoing Connections**

- Decide Existing DI Job -> Existing DI Job Found? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const existing = $input.all().map(i =\u003e i.json).find(j =\u003e j \u0026\u0026 j.job_id);\nconst prepared = $(\u0027Authorize And Build DI Job\u0027).first().json;\nif (existing) return [{ json: { exists: true, response: { ok: true, jobId: existing.job_id, status: existing.status, jobType: existing.job_type, projectId: existing.project_id, existing: true, output: existing.output || null, error: existing.error || null } } }];\nreturn [{ json: { exists: false, payload: prepared.payload, response: { ok: true, jobId: prepared.jobId, status: \u0027queued\u0027, jobType: prepared.jobType, projectId: prepared.projectId, existing: false } } }];"
}
```

### DI Queue Authorized?

| Field | Value |
| --- | --- |
| Node ID | 7a7e0d87-10b9-4bc2-824e-793d1eda944a |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1568, 48 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Authorize And Build DI Job -> DI Queue Authorized? (output 0, input 0)

**Outgoing Connections**

- DI Queue Authorized? -> Fetch Existing DI Job (output 0, input 0)
- DI Queue Authorized? -> Respond DI Queue Error (output 1, input 0)

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
                                              "leftValue":  "={{ $json.ok }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Existing DI Job Found?

| Field | Value |
| --- | --- |
| Node ID | 7ba985d1-4dca-4c50-bda0-8ceb35a50d7b |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Decide Existing DI Job -> Existing DI Job Found? (output 0, input 0)

**Outgoing Connections**

- Existing DI Job Found? -> Respond DI Job Queued (output 0, input 0)
- Existing DI Job Found? -> Insert DI Intelligence Job (output 1, input 0)

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
                                              "leftValue":  "={{ $json.exists }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Fetch DI Job Status

| Field | Value |
| --- | --- |
| Node ID | b437ae01-e158-4e41-915d-1282155047ab |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 672 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Status Q-Ops User Profile -> Fetch DI Job Status (output 0, input 0)

**Outgoing Connections**

- Fetch DI Job Status -> Map DI Status Response (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ encodeURIComponent($(\"Prepare DI Status Request\").item.json.jobId) }}\u0026select=job_id,status,job_type,project_id,requested_by,input,output,error,created_at,updated_at\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Existing DI Job

| Field | Value |
| --- | --- |
| Node ID | 0823f236-3c50-43d1-b6ef-8efa9c496d79 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- DI Queue Authorized? -> Fetch Existing DI Job (output 0, input 0)

**Outgoing Connections**

- Fetch Existing DI Job -> Decide Existing DI Job (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ encodeURIComponent($json.jobId) }}\u0026select=job_id,status,job_type,project_id,created_at,updated_at,error,output\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Queue Project Memberships

| Field | Value |
| --- | --- |
| Node ID | cb3bc19c-214b-45be-9544-cba6f83e3f04 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 48 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Queue Q-Ops User Profile -> Fetch Queue Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Queue Project Memberships -> Authorize And Build DI Job (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($json) ? ($json[0]?.id || \"00000000-0000-0000-0000-000000000000\") : ($json.id || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Queue Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 9611ffec-b322-453c-8aeb-75f50f968bfc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 48 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Queue Supabase Auth User -> Fetch Queue Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Queue Q-Ops User Profile -> Fetch Queue Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id || \"00000000-0000-0000-0000-000000000000\" }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Status Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 6dcc6113-b84d-4a97-b73b-e4f7dd8da543 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 672 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Status Supabase Auth User -> Fetch Status Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Status Q-Ops User Profile -> Fetch DI Job Status (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id || \"00000000-0000-0000-0000-000000000000\" }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### GET /di/jobs

| Field | Value |
| --- | --- |
| Node ID | 158c1ec9-5a25-4793-802d-60eda4e6c97b |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- GET /di/jobs -> Prepare DI Status Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "di/jobs",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Insert DI Intelligence Job

| Field | Value |
| --- | --- |
| Node ID | 4cf06a8b-5511-43a9-88ef-efda6278c03b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Existing DI Job Found? -> Insert DI Intelligence Job (output 1, input 0)

**Outgoing Connections**

- Insert DI Intelligence Job -> Map Inserted DI Job Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.payload) }}",
    "options":  {

                }
}
```

### Map DI Status Response

| Field | Value |
| --- | --- |
| Node ID | f19a0ae2-178e-4f80-b41f-fac905df11a3 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 672 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Job Status -> Map DI Status Response (output 0, input 0)

**Outgoing Connections**

- Map DI Status Response -> Respond DI Job Status (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Status Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Status Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nconst rawJob = $(\u0027Fetch DI Job Status\u0027).first().json;\nconst job = Array.isArray(rawJob) ? rawJob[0] : rawJob;\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nif (!job?.job_id) return [{ json: { ok: false, statusCode: 404, errorCode: \u0027JOB_NOT_FOUND\u0027, message: \u0027Delivery Intelligence job was not found\u0027 } }];\nconst canSee = profile.role === \u0027admin\u0027 || job.requested_by === profile.id;\nif (!canSee) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027JOB_ACCESS_DENIED\u0027, message: \u0027User cannot access this Delivery Intelligence job\u0027 } }];\nreturn [{ json: { ok: true, jobId: job.job_id, status: job.status, jobType: job.job_type, projectId: job.project_id, input: job.input || {}, output: job.output || {}, error: job.error || null, createdAt: job.created_at, updatedAt: job.updated_at } }];"
}
```

### Map Inserted DI Job Response

| Field | Value |
| --- | --- |
| Node ID | b9773012-70e4-464f-9dc1-c0db04533b30 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2688, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert DI Intelligence Job -> Map Inserted DI Job Response (output 0, input 0)

**Outgoing Connections**

- Map Inserted DI Job Response -> Respond DI Job Queued (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const inserted = $input.first().json || {};\nconst planned = $(\u0027Decide Existing DI Job\u0027).first().json.response;\nreturn [{ json: { ...planned, jobId: inserted.job_id || planned.jobId, status: inserted.status || planned.status } }];"
}
```

### OPTIONS /di/jobs

| Field | Value |
| --- | --- |
| Node ID | 60ec1384-3ee8-45b6-91d3-1dde1c0fff8d |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OPTIONS /di/jobs -> Respond DI Jobs CORS (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "OPTIONS",
    "path":  "di/jobs",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### POST /di/jobs

| Field | Value |
| --- | --- |
| Node ID | 6751acf5-7256-4868-8ecf-9155493160c9 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 128 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- POST /di/jobs -> Prepare DI Queue Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "di/jobs",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare DI Queue Request

| Field | Value |
| --- | --- |
| Node ID | 1a117fcf-3b96-4a6e-8b5a-d1ca017011fa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 128 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /di/jobs -> Prepare DI Queue Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Queue Request -> Valid DI Queue Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst body = $json.body || {};\nconst allowed = new Set([\u0027project_intelligence_extract\u0027,\u0027solution_extract\u0027,\u0027technology_extract\u0027,\u0027relationship_build\u0027,\u0027recommendation_generate\u0027,\u0027semantic_reindex\u0027]);\nconst jobType = String(body.jobType || body.job_type || \u0027\u0027).trim();\nconst projectId = body.projectId || body.project_id || null;\nconst keySource = body.idempotencyKey || body.idempotency_key || `${jobType}:${projectId || \u0027workspace\u0027}:${JSON.stringify(body.input || body.payload || {})}`;\nconst safeKey = String(keySource).toLowerCase().replace(/[^a-z0-9]+/g, \u0027-\u0027).replace(/^-+|-+$/g, \u0027\u0027).slice(0, 80) || Math.random().toString(36).slice(2, 10);\nconst datePart = new Date().toISOString().slice(2,10).replace(/-/g, \u0027\u0027);\nconst jobId = body.jobId || body.job_id || `DI-${datePart}-${safeKey}`;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 } }];\nif (!allowed.has(jobType)) return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_JOB_TYPE\u0027, message: \u0027Unsupported Delivery Intelligence job type\u0027 } }];\nif (!projectId \u0026\u0026 jobType !== \u0027semantic_reindex\u0027) return [{ json: { ok: false, statusCode: 400, errorCode: \u0027PROJECT_REQUIRED\u0027, message: \u0027projectId is required for this job type\u0027 } }];\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), jobId, jobType, projectId, input: { ...(body.input || body.payload || body), jobType, projectId, idempotencyKey: keySource, source: \u0027di-ui\u0027 } } }];"
}
```

### Prepare DI Status Request

| Field | Value |
| --- | --- |
| Node ID | c4e8a3bf-3c16-4a60-8856-a522369904ab |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /di/jobs -> Prepare DI Status Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Status Request -> Valid DI Status Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst query = $json.query || {};\nconst jobId = query.jobId || query.job_id || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 } }];\nif (!jobId) return [{ json: { ok: false, statusCode: 400, errorCode: \u0027JOB_ID_REQUIRED\u0027, message: \u0027jobId query parameter is required\u0027 } }];\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), jobId } }];"
}
```

### Respond DI Job Queued

| Field | Value |
| --- | --- |
| Node ID | 7d13329b-b6c0-447e-9448-4768fe88ec62 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Existing DI Job Found? -> Respond DI Job Queued (output 0, input 0)
- Map Inserted DI Job Response -> Respond DI Job Queued (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.response || $json) }}",
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

### Respond DI Job Status

| Field | Value |
| --- | --- |
| Node ID | de3ad72e-01e6-4e89-ad8c-1c620fc2009d |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Status Request? -> Respond DI Job Status (output 1, input 0)
- Map DI Status Response -> Respond DI Job Status (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_STATUS_ERROR\", message: $json.message || \"Unable to fetch job status\" } }) }}",
    "options":  {
                    "responseCode":  "={{ $json.statusCode || 200 }}",
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

### Respond DI Jobs CORS

| Field | Value |
| --- | --- |
| Node ID | 18962b5f-d82e-4fe4-bdab-22860dfe2aa6 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 448 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /di/jobs -> Respond DI Jobs CORS (output 0, input 0)

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
                                                                "value":  "GET, POST, OPTIONS"
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

### Respond DI Queue Error

| Field | Value |
| --- | --- |
| Node ID | 507c5184-847b-4d1b-9394-cd101e6c4c75 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1792, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Queue Request? -> Respond DI Queue Error (output 1, input 0)
- DI Queue Authorized? -> Respond DI Queue Error (output 1, input 0)

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
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: $json.errorCode || \"DI_QUEUE_ERROR\", message: $json.message || \"Unable to queue Delivery Intelligence job\" } }) }}",
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

### Sticky Note 81492c41

| Field | Value |
| --- | --- |
| Node ID | 66a50620-99f3-42b6-b686-eaf9ebd1a629 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1456, 800 |
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
    "content":  "## Delivery Intelligence Queue and Status API\nPOST /webhook/di/jobs queues Delivery Intelligence jobs into di_intelligence_jobs. GET /webhook/di/jobs?jobId=... returns polling status. This workflow is separate from QA generation and only writes DI tables.",
    "height":  180,
    "width":  2200,
    "color":  4
}
```

### Valid DI Queue Request?

| Field | Value |
| --- | --- |
| Node ID | 2ac94fd3-ec89-4b7c-99dd-5c1e9b195f6b |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 128 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Queue Request -> Valid DI Queue Request? (output 0, input 0)

**Outgoing Connections**

- Valid DI Queue Request? -> Verify Queue Supabase Auth User (output 0, input 0)
- Valid DI Queue Request? -> Respond DI Queue Error (output 1, input 0)

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
                                              "leftValue":  "={{ $json.ok }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Valid DI Status Request?

| Field | Value |
| --- | --- |
| Node ID | 6a0df0c4-b218-4dc5-9a89-9385a45d2147 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 736 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Status Request -> Valid DI Status Request? (output 0, input 0)

**Outgoing Connections**

- Valid DI Status Request? -> Verify Status Supabase Auth User (output 0, input 0)
- Valid DI Status Request? -> Respond DI Job Status (output 1, input 0)

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
                                              "leftValue":  "={{ $json.ok }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "true",
                                                               "singleValue":  true
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Verify Queue Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | a94c0af1-07df-4717-a7e4-ca7462bfaedf |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 48 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Queue Request? -> Verify Queue Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Queue Supabase Auth User -> Fetch Queue Q-Ops User Profile (output 0, input 0)

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

### Verify Status Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 8010c19a-5664-4ec5-8579-7d262477cece |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 672 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Status Request? -> Verify Status Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Status Supabase Auth User -> Fetch Status Q-Ops User Profile (output 0, input 0)

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
