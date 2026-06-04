# PRO QA Story Test Cases Queue Creator

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 8nuhDEewnnunXSbF |
| Active | True |
| Archived | False |
| Created At | 2026-05-12T14:20:15.325Z |
| Updated At | 2026-05-13T04:01:31.931Z |
| Node Count | 18 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Story Test Cases Queue Creator [8nuhDEewnnunXSbF].json |

## Description

Queues Story Test Case generation jobs. Supports retrying failed qa_jobs in place via retryJobId, resolves runtime config, writes queue/retry metrics, and returns UI-compatible jobId/status.

## Trigger And Entry Contract

- POST /generate-story-test-cases | n8n-nodes-base.webhook | POST | generate-story-test-cases
- Respond Queued | n8n-nodes-base.respondToWebhook |  | 
- Respond Queued | n8n-nodes-base.respondToWebhook
- Respond Story Test Case Retry Unavailable | n8n-nodes-base.respondToWebhook |  | 
- Respond Story Test Case Retry Unavailable | n8n-nodes-base.respondToWebhook
- Respond Story Test Case Runtime Error | n8n-nodes-base.respondToWebhook |  | 
- Respond Story Test Case Runtime Error | n8n-nodes-base.respondToWebhook
- Respond Invalid Story Test Case Request | n8n-nodes-base.respondToWebhook |  | 
- Respond Invalid Story Test Case Request | n8n-nodes-base.respondToWebhook
- OPTIONS /generate-story-test-cases | n8n-nodes-base.webhook | OPTIONS | generate-story-test-cases
- Respond Story Test Cases CORS | n8n-nodes-base.respondToWebhook |  | 
- Respond Story Test Cases CORS | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/generate-story-test-cases
- OPTIONS /webhook/generate-story-test-cases

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.if | 3 |
| n8n-nodes-base.respondToWebhook | 5 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs\
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config

### Supabase/Data Table Hints

- qa_job_metrics
- qa_jobs
- qops_resolve_runtime_config
- qops_users
- rpc

## Connection Graph

- POST /generate-story-test-cases -> Prepare Story Test Case Queue Request (source output 0, target input 0)
- Prepare Story Test Case Queue Request -> Valid Story Test Case Request? (source output 0, target input 0)
- Valid Story Test Case Request? -> Verify Supabase Auth User (source output 0, target input 0)
- Valid Story Test Case Request? -> Respond Invalid Story Test Case Request (source output 1, target input 0)
- Verify Supabase Auth User -> Fetch Active Q-Ops User Profile (source output 0, target input 0)
- Fetch Active Q-Ops User Profile -> Prepare Story Test Case Runtime Request (source output 0, target input 0)
- Prepare Story Test Case Runtime Request -> Story Test Case Runtime Ready? (source output 0, target input 0)
- Story Test Case Runtime Ready? -> Resolve Runtime Config (source output 0, target input 0)
- Story Test Case Runtime Ready? -> Respond Story Test Case Runtime Error (source output 1, target input 0)
- Resolve Runtime Config -> Combine Story Test Case Job And Runtime (source output 0, target input 0)
- Combine Story Test Case Job And Runtime -> Persist Story Test Case Job (source output 0, target input 0)
- Persist Story Test Case Job -> Story Test Case Job Persisted? (source output 0, target input 0)
- Story Test Case Job Persisted? -> LOG: Story Test Case Job Queued (source output 0, target input 0)
- Story Test Case Job Persisted? -> Respond Story Test Case Retry Unavailable (source output 1, target input 0)
- LOG: Story Test Case Job Queued -> Respond Queued (source output 0, target input 0)
- OPTIONS /generate-story-test-cases -> Respond Story Test Cases CORS (source output 0, target input 0)

## Nodes

### Combine Story Test Case Job And Runtime

| Field | Value |
| --- | --- |
| Node ID | 396582bb-619a-48a6-bf52-d17da7d59411 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1792, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Resolve Runtime Config -> Combine Story Test Case Job And Runtime (output 0, input 0)

**Outgoing Connections**

- Combine Story Test Case Job And Runtime -> Persist Story Test Case Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const runtimeRaw = $input.first().json || {};\nconst runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;\nconst job = $(\u0027Prepare Story Test Case Runtime Request\u0027).item.json;\nconst settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? 1;\nconst configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? runtime ?? {};\nreturn [{ json: { ...job, settingsVersion, configSnapshot } }];"
}
```

### Fetch Active Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 585d3ba5-3ec5-4749-a975-e341ca0e7065 |
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

- Fetch Active Q-Ops User Profile -> Prepare Story Test Case Runtime Request (output 0, input 0)

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

### LOG: Story Test Case Job Queued

| Field | Value |
| --- | --- |
| Node ID | 4c841099-c81b-496f-a01a-f7c4e5839cef |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Job Persisted? -> LOG: Story Test Case Job Queued (output 0, input 0)

**Outgoing Connections**

- LOG: Story Test Case Job Queued -> Respond Queued (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $(\"Combine Story Test Case Job And Runtime\").item.json.jobId, project_name: $(\"Combine Story Test Case Job And Runtime\").item.json.input.projectName, document_type: $(\"Combine Story Test Case Job And Runtime\").item.json.input.documentType, pipeline: \"generation\", event: $(\"Combine Story Test Case Job And Runtime\").item.json.retryMode ? \"JOB_RETRIED\" : \"JOB_QUEUED\", status: \"info\", project_id: $(\"Combine Story Test Case Job And Runtime\").item.json.projectId, requested_by: $(\"Combine Story Test Case Job And Runtime\").item.json.requestedBy, metadata: { generator_mode: \"professional_story_test_cases\", retry: Boolean($(\"Combine Story Test Case Job And Runtime\").item.json.retryMode), product_owner: $(\"Combine Story Test Case Job And Runtime\").item.json.input.productOwner, settings_version: $(\"Combine Story Test Case Job And Runtime\").item.json.settingsVersion, environment: $(\"Combine Story Test Case Job And Runtime\").item.json.environment } }) }}",
    "options":  {

                }
}
```

### OPTIONS /generate-story-test-cases

| Field | Value |
| --- | --- |
| Node ID | f4241c03-5675-447a-9430-63b1cc575ff2 |
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

- OPTIONS /generate-story-test-cases -> Respond Story Test Cases CORS (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "OPTIONS",
    "path":  "generate-story-test-cases",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Persist Story Test Case Job

| Field | Value |
| --- | --- |
| Node ID | 71e6e5e1-ce72-40f4-a33c-fb8538bf8661 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Story Test Case Job And Runtime -> Persist Story Test Case Job (output 0, input 0)

**Outgoing Connections**

- Persist Story Test Case Job -> Story Test Case Job Persisted? (output 0, input 0)

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
    "method":  "={{ $json.retryMode ? \"PATCH\" : \"POST\" }}",
    "url":  "={{ $json.retryMode ? \"https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.\" + encodeURIComponent($json.jobId) + \"\u0026status=eq.failed\u0026requested_by=eq.\" + encodeURIComponent($json.requestedBy) : \"https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs\" }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.retryMode ? { status: \"pending\", input: $json.input, output: null, error: null, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot, updated_at: $now.toISO() } : { job_id: $json.jobId, status: \"pending\", input: $json.input, project_id: $json.projectId, requested_by: $json.requestedBy, settings_version: $json.settingsVersion, config_snapshot: $json.configSnapshot }) }}",
    "options":  {

                }
}
```

### POST /generate-story-test-cases

| Field | Value |
| --- | --- |
| Node ID | 14f7425c-a002-4d72-adb0-59e1d9c7b30a |
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

- POST /generate-story-test-cases -> Prepare Story Test Case Queue Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-story-test-cases",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Story Test Case Queue Request

| Field | Value |
| --- | --- |
| Node ID | c224f53e-a012-4fb7-a554-606d0b0fab4b |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /generate-story-test-cases -> Prepare Story Test Case Queue Request (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Queue Request -> Valid Story Test Case Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2, 10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `STC-${datePart}-${randomPart}`;\nconst headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst input = $json.body || {};\nconst retryJobId = String(input.retryJobId || input.jobId || \u0027\u0027).trim();\nconst isRetry = Boolean(retryJobId);\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer token\u0027 } }];\n}\nif (!String(input.projectName || \u0027\u0027).trim()) {\n  return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_REQUEST\u0027, message: \u0027projectName is required\u0027 } }];\n}\nconst documentType = String(input.documentType || \u0027\u0027).trim().toLowerCase();\nif (documentType !== \u0027story_test_cases\u0027) {\n  return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_REQUEST\u0027, message: \u0027documentType must be story_test_cases\u0027 } }];\n}\nreturn [{\n  json: {\n    ok: true,\n    jobId: isRetry ? retryJobId : jobId,\n    retryMode: isRetry,\n    input: { ...input, retryJobId: undefined, jobId: undefined, generatorMode: \u0027professional_story_test_cases\u0027 },\n    token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027),\n    projectId: input.projectId || null,\n    environment: input.environment || \u0027local\u0027\n  }\n}];"
}
```

### Prepare Story Test Case Runtime Request

| Field | Value |
| --- | --- |
| Node ID | 88d7c883-9709-4ba3-ad5c-8df37c3b5f67 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Active Q-Ops User Profile -> Prepare Story Test Case Runtime Request (output 0, input 0)

**Outgoing Connections**

- Prepare Story Test Case Runtime Request -> Story Test Case Runtime Ready? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const profile = Array.isArray($json) ? $json[0] : $json;\nconst job = $(\u0027Prepare Story Test Case Queue Request\u0027).item.json;\nif (!profile?.id || profile.status !== \u0027active\u0027) {\n  return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\n}\nreturn [{\n  json: {\n    ...job,\n    requestedBy: profile.id,\n    qopsUser: profile,\n    runtimeRequest: {\n      p_environment_key: job.environment || \u0027local\u0027,\n      p_project_id: job.projectId || null,\n      p_pipeline: \u0027generation\u0027,\n      p_requested_by: profile.id\n    }\n  }\n}];"
}
```

### Resolve Runtime Config

| Field | Value |
| --- | --- |
| Node ID | 661c4f0a-308f-4665-aee8-af6e2e2b5aa8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Runtime Ready? -> Resolve Runtime Config (output 0, input 0)

**Outgoing Connections**

- Resolve Runtime Config -> Combine Story Test Case Job And Runtime (output 0, input 0)

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

### Respond Invalid Story Test Case Request

| Field | Value |
| --- | --- |
| Node ID | 68d06214-e2de-4f7c-98bd-00935ad27b2c |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Story Test Case Request? -> Respond Invalid Story Test Case Request (output 1, input 0)

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

### Respond Queued

| Field | Value |
| --- | --- |
| Node ID | 1e699789-9600-4c29-8748-249330d429c5 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Story Test Case Job Queued -> Respond Queued (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify({ jobId: $(\"Combine Story Test Case Job And Runtime\").item.json.jobId, status: \"queued\", generatorMode: \"professional_story_test_cases\", retried: Boolean($(\"Combine Story Test Case Job And Runtime\").item.json.retryMode) }) }}",
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

### Respond Story Test Case Retry Unavailable

| Field | Value |
| --- | --- |
| Node ID | e7d6dc40-a1a1-4538-89a3-87973d7fa42f |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2464, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Job Persisted? -> Respond Story Test Case Retry Unavailable (output 1, input 0)

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
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: \"RETRY_UNAVAILABLE\", message: \"The failed Story Test Case job could not be retried. It may already be running, completed, or owned by another user.\" } }) }}",
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

### Respond Story Test Case Runtime Error

| Field | Value |
| --- | --- |
| Node ID | 77378a22-fd1f-4276-ab5d-80866c07d1b6 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Story Test Case Runtime Ready? -> Respond Story Test Case Runtime Error (output 1, input 0)

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

### Respond Story Test Cases CORS

| Field | Value |
| --- | --- |
| Node ID | ca20894e-3864-49e1-bd68-e63a2de8755f |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /generate-story-test-cases -> Respond Story Test Cases CORS (output 0, input 0)

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

### Story Test Case Job Persisted?

| Field | Value |
| --- | --- |
| Node ID | b246c40b-d962-4ca1-907c-727be72fd1e0 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 2240, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Story Test Case Job -> Story Test Case Job Persisted? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Job Persisted? -> LOG: Story Test Case Job Queued (output 0, input 0)
- Story Test Case Job Persisted? -> Respond Story Test Case Retry Unavailable (output 1, input 0)

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

### Story Test Case Runtime Ready?

| Field | Value |
| --- | --- |
| Node ID | 10c16a6d-ea83-40e5-ac6b-f1adafba6e95 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 1344, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Runtime Request -> Story Test Case Runtime Ready? (output 0, input 0)

**Outgoing Connections**

- Story Test Case Runtime Ready? -> Resolve Runtime Config (output 0, input 0)
- Story Test Case Runtime Ready? -> Respond Story Test Case Runtime Error (output 1, input 0)

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

### Valid Story Test Case Request?

| Field | Value |
| --- | --- |
| Node ID | c2285f1c-35b0-4e04-8069-a2dbfc2d0936 |
| Type | n8n-nodes-base.if |
| Type Version | 2.2 |
| Position | 448, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Story Test Case Queue Request -> Valid Story Test Case Request? (output 0, input 0)

**Outgoing Connections**

- Valid Story Test Case Request? -> Verify Supabase Auth User (output 0, input 0)
- Valid Story Test Case Request? -> Respond Invalid Story Test Case Request (output 1, input 0)

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
| Node ID | 376497ac-a8ab-4d89-a414-1f11354773c8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Story Test Case Request? -> Verify Supabase Auth User (output 0, input 0)

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
