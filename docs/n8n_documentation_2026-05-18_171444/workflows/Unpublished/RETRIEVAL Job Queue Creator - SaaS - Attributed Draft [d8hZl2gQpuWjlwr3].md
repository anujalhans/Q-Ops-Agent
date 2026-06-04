# RETRIEVAL Job Queue Creator - SaaS - Attributed Draft

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | d8hZl2gQpuWjlwr3 |
| Active | False |
| Archived | False |
| Created At | 2026-05-07T15:58:33.915Z |
| Updated At | 2026-05-07T16:01:49.223Z |
| Node Count | 10 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\RETRIEVAL Job Queue Creator - SaaS - Attributed Draft [d8hZl2gQpuWjlwr3].json |

## Description

Production-shaped inactive attributed draft of the generation queue creator. Uses the production webhook path and writes attribution/runtime config, but remains unpublished/inactive until cutover.

## Trigger And Entry Contract

- POST /generate-qa-doc | n8n-nodes-base.webhook | POST | generate-qa-doc
- Respond to Webhook | n8n-nodes-base.respondToWebhook |  | 
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/generate-qa-doc

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config

### Supabase/Data Table Hints

- qa_job_metrics
- qa_jobs
- qops_resolve_runtime_config
- qops_users
- rpc

## Connection Graph

- Generate Job ID -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Prepare Runtime Request (source output 0, target input 0)
- Prepare Runtime Request -> Resolve Runtime Config (source output 0, target input 0)
- Resolve Runtime Config -> Combine Job And Runtime (source output 0, target input 0)
- Combine Job And Runtime -> Insert JobID into Supabase DB (source output 0, target input 0)
- Insert JobID into Supabase DB -> LOG: Job Queued (source output 0, target input 0)
- LOG: Job Queued -> Respond to Webhook (source output 0, target input 0)
- POST /generate-qa-doc -> Generate Job ID (source output 0, target input 0)

## Nodes

### Combine Job And Runtime

| Field | Value |
| --- | --- |
| Node ID | b0b76018-3dc6-4120-a8b2-c6184b3aa279 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 0 |
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
| Node ID | 6bf09e4e-8a47-4449-97d5-442492dd36d6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
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
| Node ID | 0395c206-9650-4572-95b6-815189d42535 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /generate-qa-doc -> Generate Job ID (output 0, input 0)

**Outgoing Connections**

- Generate Job ID -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `GEN-${datePart}-${randomPart}`;\nconst headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) throw new Error(\u0027Missing bearer token\u0027);\nconst input = $json.body || {};\nreturn [{ json: { jobId, input, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), projectId: input.projectId || null, environment: input.environment || \u0027local\u0027 } }];"
}
```

### Insert JobID into Supabase DB

| Field | Value |
| --- | --- |
| Node ID | d9a5184d-18d4-4409-8288-2d199e453479 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
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
                                                  "value":  "={{ $json.input }}"
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

### LOG: Job Queued

| Field | Value |
| --- | --- |
| Node ID | df133d70-eff3-4daa-893f-f0837b0b61fd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
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
    "jsonBody":  "={{ { \"job_id\": $(\"Combine Job And Runtime\").first().json.jobId, \"project_name\": $(\"Combine Job And Runtime\").first().json.input.projectName, \"document_type\": $(\"Combine Job And Runtime\").first().json.input.documentType, \"pipeline\": \"generation\", \"event\": \"JOB_QUEUED\", \"status\": \"info\", \"project_id\": $(\"Combine Job And Runtime\").first().json.projectId, \"requested_by\": $(\"Combine Job And Runtime\").first().json.requestedBy, \"metadata\": { \"product_owner\": $(\"Combine Job And Runtime\").first().json.input.productOwner, \"settings_version\": $(\"Combine Job And Runtime\").first().json.settingsVersion, \"project_id\": $(\"Combine Job And Runtime\").first().json.projectId, \"requested_by\": $(\"Combine Job And Runtime\").first().json.requestedBy, \"environment\": $(\"Combine Job And Runtime\").first().json.environment } } }}",
    "options":  {

                }
}
```

### POST /generate-qa-doc

| Field | Value |
| --- | --- |
| Node ID | 8391c561-df57-4cba-8d7a-4ca3120020a5 |
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

- POST /generate-qa-doc -> Generate Job ID (output 0, input 0)

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

### Prepare Runtime Request

| Field | Value |
| --- | --- |
| Node ID | 1bbc686a-5d05-4dc9-9968-a6b944c3c643 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 0 |
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
    "jsCode":  "const profile = $input.first().json || {};\nif (!profile.id || profile.status !== \u0027active\u0027) throw new Error(\u0027Active Q-Ops user profile not found\u0027);\nconst job = $(\u0027Generate Job ID\u0027).first().json;\nreturn [{ json: { ...job, requestedBy: profile.id, qopsUser: profile, runtimeRequest: { p_environment_key: job.environment || \u0027local\u0027, p_project_id: job.projectId || null, p_pipeline: \u0027generation\u0027, p_requested_by: profile.id } } }];"
}
```

### Resolve Runtime Config

| Field | Value |
| --- | --- |
| Node ID | 6a92e076-96ac-4cae-896a-fd9d2719011c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
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
| Node ID | 486c210c-8d2e-4866-aeb8-a9b27cafd956 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2016, 0 |
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

### Verify Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 3b04b8ba-3ffb-4c86-932b-481360bcfe75 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Job ID -> Verify Supabase Auth User (output 0, input 0)

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
