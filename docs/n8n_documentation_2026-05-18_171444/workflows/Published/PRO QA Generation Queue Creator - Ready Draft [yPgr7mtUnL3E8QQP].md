# PRO QA Generation Queue Creator - Ready Draft

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | yPgr7mtUnL3E8QQP |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T04:17:16.626Z |
| Updated At | 2026-05-13T04:01:19.748Z |
| Node Count | 18 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\PRO QA Generation Queue Creator - Ready Draft [yPgr7mtUnL3E8QQP].json |

## Description

Professional queue creator for direct UI reuse. Supports retrying failed qa_jobs in place via retryJobId, resolves runtime config, writes queue/retry metrics, and returns UI-compatible jobId/status.

## Trigger And Entry Contract

- POST /generate-qa-doc | n8n-nodes-base.webhook | POST | generate-qa-doc
- Respond Queued | n8n-nodes-base.respondToWebhook |  | 
- Respond Queued | n8n-nodes-base.respondToWebhook
- Respond Professional Retry Unavailable | n8n-nodes-base.respondToWebhook |  | 
- Respond Professional Retry Unavailable | n8n-nodes-base.respondToWebhook
- Respond Runtime Error | n8n-nodes-base.respondToWebhook |  | 
- Respond Runtime Error | n8n-nodes-base.respondToWebhook
- Respond Invalid Request | n8n-nodes-base.respondToWebhook |  | 
- Respond Invalid Request | n8n-nodes-base.respondToWebhook
- OPTIONS /generate-qa-doc | n8n-nodes-base.webhook | OPTIONS | generate-qa-doc
- Respond CORS Preflight | n8n-nodes-base.respondToWebhook |  | 
- Respond CORS Preflight | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/generate-qa-doc
- OPTIONS /webhook/generate-qa-doc

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

- POST /generate-qa-doc -> Prepare Professional Queue Request (source output 0, target input 0)
- Prepare Professional Queue Request -> Valid Request? (source output 0, target input 0)
- Valid Request? -> Verify Supabase Auth User (source output 0, target input 0)
- Valid Request? -> Respond Invalid Request (source output 1, target input 0)
- Verify Supabase Auth User -> Fetch Active Q-Ops User Profile (source output 0, target input 0)
- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (source output 0, target input 0)
- Prepare Runtime Config Request -> Runtime Request Ready? (source output 0, target input 0)
- Runtime Request Ready? -> Resolve Runtime Config (source output 0, target input 0)
- Runtime Request Ready? -> Respond Runtime Error (source output 1, target input 0)
- Resolve Runtime Config -> Combine Job And Runtime (source output 0, target input 0)
- Combine Job And Runtime -> Persist Professional Job (source output 0, target input 0)
- Persist Professional Job -> Professional Job Persisted? (source output 0, target input 0)
- Professional Job Persisted? -> LOG: Professional Job Queued (source output 0, target input 0)
- Professional Job Persisted? -> Respond Professional Retry Unavailable (source output 1, target input 0)
- LOG: Professional Job Queued -> Respond Queued (source output 0, target input 0)
- OPTIONS /generate-qa-doc -> Respond CORS Preflight (source output 0, target input 0)

## Nodes

### Combine Job And Runtime

| Field | Value |
| --- | --- |
| Node ID | 94b58282-0f7a-40b2-987a-7b4c6abaae6f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1792, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Resolve Runtime Config -> Combine Job And Runtime (output 0, input 0)

**Outgoing Connections**

- Combine Job And Runtime -> Persist Professional Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const runtimeRaw = $input.first().json || {};\nconst runtime = Array.isArray(runtimeRaw) ? runtimeRaw[0] : runtimeRaw;\nconst job = $(\u0027Prepare Runtime Config Request\u0027).item.json;\nconst settingsVersion = runtime.settingsVersion ?? runtime.settings_version ?? 1;\nconst configSnapshot = runtime.configSnapshot ?? runtime.config_snapshot ?? runtime ?? {};\nreturn [{ json: { ...job, settingsVersion, configSnapshot } }];"
}
```

### Fetch Active Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 9d04a3c8-aa9d-4023-bcf6-0acb4cdc3631 |
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

- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (output 0, input 0)

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

### LOG: Professional Job Queued

| Field | Value |
| --- | --- |
| Node ID | 8d7fa422-a003-4c5e-9c9c-9e1e8844673e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Job Persisted? -> LOG: Professional Job Queued (output 0, input 0)

**Outgoing Connections**

- LOG: Professional Job Queued -> Respond Queued (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify({ job_id: $(\"Combine Job And Runtime\").item.json.jobId, project_name: $(\"Combine Job And Runtime\").item.json.input.projectName, document_type: $(\"Combine Job And Runtime\").item.json.input.documentType, pipeline: \"generation\", event: $(\"Combine Job And Runtime\").item.json.retryMode ? \"JOB_RETRIED\" : \"JOB_QUEUED\", status: \"info\", project_id: $(\"Combine Job And Runtime\").item.json.projectId, requested_by: $(\"Combine Job And Runtime\").item.json.requestedBy, metadata: { generator_mode: \"professional\", retry: Boolean($(\"Combine Job And Runtime\").item.json.retryMode), product_owner: $(\"Combine Job And Runtime\").item.json.input.productOwner, settings_version: $(\"Combine Job And Runtime\").item.json.settingsVersion, environment: $(\"Combine Job And Runtime\").item.json.environment } }) }}",
    "options":  {

                }
}
```

### OPTIONS /generate-qa-doc

| Field | Value |
| --- | --- |
| Node ID | 8f33aa57-5313-4181-88b1-716f31167b96 |
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

- OPTIONS /generate-qa-doc -> Respond CORS Preflight (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "OPTIONS",
    "path":  "generate-qa-doc",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Persist Professional Job

| Field | Value |
| --- | --- |
| Node ID | 3a274e85-b04a-4eb1-80ca-062ee17f1362 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Combine Job And Runtime -> Persist Professional Job (output 0, input 0)

**Outgoing Connections**

- Persist Professional Job -> Professional Job Persisted? (output 0, input 0)

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

### POST /generate-qa-doc

| Field | Value |
| --- | --- |
| Node ID | 8f2d2edb-ee04-4439-9b81-8adb8613735e |
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

- POST /generate-qa-doc -> Prepare Professional Queue Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-qa-doc",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Professional Queue Request

| Field | Value |
| --- | --- |
| Node ID | 57829829-6b5d-422c-8975-86fa4ca48b87 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /generate-qa-doc -> Prepare Professional Queue Request (output 0, input 0)

**Outgoing Connections**

- Prepare Professional Queue Request -> Valid Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2, 10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `PRO-${datePart}-${randomPart}`;\nconst headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst input = $json.body || {};\nconst retryJobId = String(input.retryJobId || input.jobId || \u0027\u0027).trim();\nconst isRetry = Boolean(retryJobId);\nconst documentTypes = new Set([\u0027test_strategy\u0027, \u0027test_plan\u0027, \u0027risk_matrix\u0027, \u0027test_cases\u0027, \u0027user_stories\u0027, \u0027traceability_matrix\u0027]);\nconst documentType = String(input.documentType || \u0027\u0027).trim().toLowerCase();\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer token\u0027 } }];\n}\nif (!String(input.projectName || \u0027\u0027).trim() || !documentTypes.has(documentType)) {\n  return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_REQUEST\u0027, message: \u0027projectName and supported documentType are required\u0027 } }];\n}\nreturn [{\n  json: {\n    ok: true,\n    jobId: isRetry ? retryJobId : jobId,\n    retryMode: isRetry,\n    input: { ...input, retryJobId: undefined, jobId: undefined, documentType, generatorMode: \u0027professional\u0027 },\n    token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027),\n    projectId: input.projectId || null,\n    environment: input.environment || \u0027local\u0027\n  }\n}];"
}
```

### Prepare Runtime Config Request

| Field | Value |
| --- | --- |
| Node ID | f6b32777-fcd3-4485-9033-d76a23f7e410 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Active Q-Ops User Profile -> Prepare Runtime Config Request (output 0, input 0)

**Outgoing Connections**

- Prepare Runtime Config Request -> Runtime Request Ready? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const profile = Array.isArray($json) ? $json[0] : $json;\nconst job = $(\u0027Prepare Professional Queue Request\u0027).item.json;\nif (!profile?.id || profile.status !== \u0027active\u0027) {\n  return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\n}\nreturn [{\n  json: {\n    ...job,\n    requestedBy: profile.id,\n    qopsUser: profile,\n    runtimeRequest: {\n      p_environment_key: job.environment || \u0027local\u0027,\n      p_project_id: job.projectId || null,\n      p_pipeline: \u0027generation\u0027,\n      p_requested_by: profile.id\n    }\n  }\n}];"
}
```

### Professional Job Persisted?

| Field | Value |
| --- | --- |
| Node ID | 1091dfc9-d765-4bdf-9285-ee464b883764 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 2240, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist Professional Job -> Professional Job Persisted? (output 0, input 0)

**Outgoing Connections**

- Professional Job Persisted? -> LOG: Professional Job Queued (output 0, input 0)
- Professional Job Persisted? -> Respond Professional Retry Unavailable (output 1, input 0)

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

### Resolve Runtime Config

| Field | Value |
| --- | --- |
| Node ID | 978b1a6e-8f07-4610-a68e-779e7d0bfa12 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Runtime Request Ready? -> Resolve Runtime Config (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify($json.runtimeRequest) }}",
    "options":  {

                }
}
```

### Respond CORS Preflight

| Field | Value |
| --- | --- |
| Node ID | 9fd5263c-72e1-4078-b60a-e7643bab62ac |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /generate-qa-doc -> Respond CORS Preflight (output 0, input 0)

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

### Respond Invalid Request

| Field | Value |
| --- | --- |
| Node ID | 0ad1b15a-42cd-456d-9744-f02178f3c615 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Request? -> Respond Invalid Request (output 1, input 0)

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

### Respond Professional Retry Unavailable

| Field | Value |
| --- | --- |
| Node ID | 4e3e4317-c307-4354-99f1-423733a12fd9 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2464, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Professional Job Persisted? -> Respond Professional Retry Unavailable (output 1, input 0)

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
    "responseBody":  "={{ JSON.stringify({ ok: false, error: { code: \"RETRY_UNAVAILABLE\", message: \"The failed QA generation job could not be retried. It may already be running, completed, or owned by another user.\" } }) }}",
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

### Respond Queued

| Field | Value |
| --- | --- |
| Node ID | 4f4d84e4-b54f-45ae-8eab-8719c1fadae7 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Professional Job Queued -> Respond Queued (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify({ jobId: $(\"Combine Job And Runtime\").item.json.jobId, status: \"queued\", generatorMode: \"professional\", retried: Boolean($(\"Combine Job And Runtime\").item.json.retryMode) }) }}",
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

### Respond Runtime Error

| Field | Value |
| --- | --- |
| Node ID | b875370b-447d-447b-b5d0-339c3f6faac0 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Runtime Request Ready? -> Respond Runtime Error (output 1, input 0)

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

### Runtime Request Ready?

| Field | Value |
| --- | --- |
| Node ID | d8a71207-fa7a-41fd-bf78-c6310ca5a5a1 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1344, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Runtime Config Request -> Runtime Request Ready? (output 0, input 0)

**Outgoing Connections**

- Runtime Request Ready? -> Resolve Runtime Config (output 0, input 0)
- Runtime Request Ready? -> Respond Runtime Error (output 1, input 0)

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

### Valid Request?

| Field | Value |
| --- | --- |
| Node ID | 829abd05-be3a-49e7-9876-a3ab68404e04 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 288 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Professional Queue Request -> Valid Request? (output 0, input 0)

**Outgoing Connections**

- Valid Request? -> Verify Supabase Auth User (output 0, input 0)
- Valid Request? -> Respond Invalid Request (output 1, input 0)

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
| Node ID | bd14e390-5012-43e8-b238-85be1198a581 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid Request? -> Verify Supabase Auth User (output 0, input 0)

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
