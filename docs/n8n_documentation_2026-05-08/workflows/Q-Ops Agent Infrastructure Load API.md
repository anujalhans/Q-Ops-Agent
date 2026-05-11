# Q-Ops Agent Infrastructure Load API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | NgKN1jdavJfmJG9h |
| Active | True |
| Created At | 2026-05-08T07:06:29.801Z |
| Updated At | 2026-05-08T07:10:04.605Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Infrastructure Load API.json |

## Description

Auth-aware GET /webhook/infrastructure-load endpoint. Combines scoped queue backlog, recent workflow metrics, service health snapshots, and daily token/cost usage for the Dashboard Compute Load widget.

## Trigger And Entry Contract

- GET /infrastructure-load | n8n-nodes-base.webhook | infrastructure-load
- Respond Infrastructure Load | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/infrastructure-load

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /infrastructure-load -> Prepare Infrastructure Request (source output 0, target input 0)
- Prepare Infrastructure Request -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (source output 0, target input 0)
- Fetch Current User Project Memberships -> Fetch Generation Jobs (source output 0, target input 0)
- Fetch Generation Jobs -> Fetch Ingestion Jobs (source output 0, target input 0)
- Fetch Ingestion Jobs -> Fetch Recent Metrics (source output 0, target input 0)
- Fetch Recent Metrics -> Fetch Connection Results (source output 0, target input 0)
- Fetch Connection Results -> Build Infrastructure Load Response (source output 0, target input 0)
- Build Infrastructure Load Response -> Respond Infrastructure Load (source output 0, target input 0)

## Nodes

### Build Infrastructure Load Response

| Field | Value |
| --- | --- |
| Node ID | 820c4a4f-1181-4e59-bdd8-08fd9eeec965 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Connection Results -> Build Infrastructure Load Response (output 0, input 0)

**Outgoing Connections**

- Build Infrastructure Load Response -> Respond Infrastructure Load (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const authUser = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst profile = $(\u0027Fetch Q-Ops User Profile\u0027).first().json || {};\nconst memberships = $items(\u0027Fetch Current User Project Memberships\u0027).map(i =\u003e i.json).filter(m =\u003e m \u0026\u0026 m.project_id);\n\nif (!authUser.id || !profile.id || profile.status !== \u0027active\u0027) {\n  return [{ json: { ok: false, error: \u0027unauthorized\u0027, message: \u0027Missing or invalid Supabase Auth token.\u0027 } }];\n}\n\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst allowedProjectIds = new Set(memberships.map(m =\u003e String(m.project_id)));\nconst now = Date.now();\nconst dayAgo = now - 24 * 60 * 60 * 1000;\nconst todayStart = new Date();\ntodayStart.setHours(0, 0, 0, 0);\nconst todayStartMs = todayStart.getTime();\n\nfunction inScope(row) {\n  if (isAdmin) return true;\n  const requestedBy = row.requested_by ? String(row.requested_by) : \u0027\u0027;\n  const projectId = row.project_id ? String(row.project_id) : \u0027\u0027;\n  return requestedBy === String(profile.id) \u0026\u0026 (!projectId || allowedProjectIds.has(projectId));\n}\nfunction ts(row) { return new Date(row.created_at || row.updated_at || row.checked_at || 0).getTime(); }\nfunction statusOf(row) { return String(row.status || \u0027\u0027).toLowerCase(); }\nfunction isActive(status) { return [\u0027queued\u0027, \u0027pending\u0027, \u0027processing\u0027, \u0027not_found\u0027].includes(status); }\nfunction isFailed(status) { return [\u0027failed\u0027, \u0027error\u0027].includes(status); }\nfunction avg(values) { return values.length ? Math.round(values.reduce((a, b) =\u003e a + b, 0) / values.length) : 0; }\n\nconst generationJobs = $items(\u0027Fetch Generation Jobs\u0027).map(i =\u003e i.json).filter(j =\u003e j \u0026\u0026 j.job_id \u0026\u0026 inScope(j)).map(j =\u003e ({ ...j, pipeline: \u0027generation\u0027 }));\nconst ingestionJobs = $items(\u0027Fetch Ingestion Jobs\u0027).map(i =\u003e i.json).filter(j =\u003e j \u0026\u0026 j.job_id \u0026\u0026 inScope(j)).map(j =\u003e ({ ...j, pipeline: \u0027ingestion\u0027 }));\nconst allJobs = generationJobs.concat(ingestionJobs);\nconst activeJobs = allJobs.filter(j =\u003e isActive(statusOf(j)));\nconst pendingJobs = allJobs.filter(j =\u003e [\u0027queued\u0027, \u0027pending\u0027, \u0027not_found\u0027].includes(statusOf(j)));\nconst processingJobs = allJobs.filter(j =\u003e statusOf(j) === \u0027processing\u0027);\nconst failedJobsLast24h = allJobs.filter(j =\u003e isFailed(statusOf(j)) \u0026\u0026 ts(j) \u003e= dayAgo);\nconst oldestPending = pendingJobs.map(ts).filter(Boolean).sort((a, b) =\u003e a - b)[0] || 0;\n\nconst metrics = $items(\u0027Fetch Recent Metrics\u0027).map(i =\u003e i.json).filter(m =\u003e m \u0026\u0026 m.id \u0026\u0026 inScope(m));\nconst recentMetrics24h = metrics.filter(m =\u003e ts(m) \u003e= dayAgo);\nconst usageToday = metrics.filter(m =\u003e ts(m) \u003e= todayStartMs);\nconst failedMetrics24h = metrics.filter(m =\u003e isFailed(statusOf(m)) \u0026\u0026 ts(m) \u003e= dayAgo);\nconst durationValues = recentMetrics24h.map(m =\u003e Number(m.duration_ms || 0)).filter(Boolean);\nconst activeExecutionJobIds = new Set(activeJobs.map(j =\u003e j.job_id));\n\nconst latestServices = new Map();\nfor (const item of $items(\u0027Fetch Connection Results\u0027).map(i =\u003e i.json).filter(Boolean)) {\n  const key = item.integration_key || item.service_name;\n  if (!key || latestServices.has(key)) continue;\n  const rawStatus = String(item.status || \u0027not_configured\u0027);\n  const normalized = [\u0027operational\u0027, \u0027ok\u0027, \u0027configured\u0027].includes(rawStatus) ? \u0027ok\u0027 : rawStatus === \u0027degraded\u0027 ? \u0027degraded\u0027 : [\u0027unreachable\u0027, \u0027unauthorized\u0027, \u0027error\u0027].includes(rawStatus) ? \u0027error\u0027 : \u0027not_configured\u0027;\n  latestServices.set(key, {\n    name: item.service_name || item.integration_key || key,\n    key,\n    status: normalized,\n    latencyMs: Number(item.latency_ms || 0),\n    message: item.message || \u0027\u0027,\n    checkedAt: item.checked_at || null\n  });\n}\nconst services = Array.from(latestServices.values());\nconst unhealthyServices = services.filter(s =\u003e [\u0027degraded\u0027, \u0027error\u0027, \u0027unreachable\u0027, \u0027unauthorized\u0027].includes(s.status)).length;\n\nconst pendingCount = pendingJobs.length;\nconst processingCount = processingJobs.length;\nconst failedCount = failedJobsLast24h.length + failedMetrics24h.length;\nconst oldestPendingAgeSeconds = oldestPending ? Math.max(0, Math.round((now - oldestPending) / 1000)) : 0;\nconst avgLatency = avg(services.map(s =\u003e s.latencyMs).filter(Boolean));\nconst loadScore = Math.min(100, Math.round(\n  pendingCount * 12 +\n  processingCount * 18 +\n  Math.min(30, oldestPendingAgeSeconds / 20) +\n  failedCount * 10 +\n  unhealthyServices * 15 +\n  Math.min(15, avgLatency / 120)\n));\nconst status = loadScore \u003e= 75 || unhealthyServices \u003e= 2 ? \u0027error\u0027 : loadScore \u003e= 45 || unhealthyServices === 1 || failedCount \u003e 0 ? \u0027degraded\u0027 : \u0027ok\u0027;\nconst jobsCompletedToday = usageToday.filter(m =\u003e String(m.event || \u0027\u0027).includes(\u0027COMPLETED\u0027) || statusOf(m) === \u0027completed\u0027).length;\n\nreturn [{ json: {\n  status,\n  score: loadScore,\n  generatedAt: new Date().toISOString(),\n  scope: isAdmin ? \u0027workspace\u0027 : \u0027self\u0027,\n  queues: {\n    pending: pendingCount,\n    processing: processingCount,\n    active: activeJobs.length,\n    failedLast24h: failedJobsLast24h.length,\n    oldestPendingAgeSeconds,\n    generation: { pending: generationJobs.filter(j =\u003e [\u0027queued\u0027, \u0027pending\u0027, \u0027not_found\u0027].includes(statusOf(j))).length, processing: generationJobs.filter(j =\u003e statusOf(j) === \u0027processing\u0027).length },\n    ingestion: { pending: ingestionJobs.filter(j =\u003e [\u0027queued\u0027, \u0027pending\u0027, \u0027not_found\u0027].includes(statusOf(j))).length, processing: ingestionJobs.filter(j =\u003e statusOf(j) === \u0027processing\u0027).length }\n  },\n  workflows: {\n    activeExecutions: activeExecutionJobIds.size,\n    failedLast24h: failedMetrics24h.length,\n    avgDurationMs: avg(durationValues),\n    recentMetricEvents: recentMetrics24h.length\n  },\n  services,\n  usage: {\n    tokensToday: usageToday.reduce((sum, m) =\u003e sum + Number(m.tokens_total || 0), 0),\n    costTodayUsd: Number(usageToday.reduce((sum, m) =\u003e sum + Number(m.estimated_cost_usd || 0), 0).toFixed(6)),\n    jobsCompletedToday\n  },\n  meta: { userRole: profile.role, projectIds: isAdmin ? [] : Array.from(allowedProjectIds) }\n} }];"
}
```

### Fetch Connection Results

| Field | Value |
| --- | --- |
| Node ID | 4fc6018d-fd6a-4699-bcd7-a07152036484 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Recent Metrics -> Fetch Connection Results (output 0, input 0)

**Outgoing Connections**

- Fetch Connection Results -> Build Infrastructure Load Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "environment_key,integration_key,service_name,status,latency_ms,message,checked_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "checked_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "100"
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

### Fetch Current User Project Memberships

| Field | Value |
| --- | --- |
| Node ID | c5f1cef2-464b-48cb-acf9-a933f212dbaa |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Current User Project Memberships -> Fetch Generation Jobs (output 0, input 0)

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

### Fetch Generation Jobs

| Field | Value |
| --- | --- |
| Node ID | d934f349-5bc4-4633-914c-64702663352a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current User Project Memberships -> Fetch Generation Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch Generation Jobs -> Fetch Ingestion Jobs (output 0, input 0)

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
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,project_id,requested_by,created_at,updated_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "500"
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

### Fetch Ingestion Jobs

| Field | Value |
| --- | --- |
| Node ID | ec979881-b540-479a-961a-a8f3d94a42b1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Generation Jobs -> Fetch Ingestion Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch Ingestion Jobs -> Fetch Recent Metrics (output 0, input 0)

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
                                                   "value":  "job_id,status,input,project_id,requested_by,created_at,updated_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "500"
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
| Node ID | ccc6f7b2-a2d2-48ea-8ab7-73af4be77e68 |
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

### Fetch Recent Metrics

| Field | Value |
| --- | --- |
| Node ID | 4c0b7e77-251f-44cb-8abb-0c5750881c12 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Ingestion Jobs -> Fetch Recent Metrics (output 0, input 0)

**Outgoing Connections**

- Fetch Recent Metrics -> Fetch Connection Results (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,job_id,project_id,requested_by,project_name,pipeline,event,status,duration_ms,tokens_total,estimated_cost_usd,error_message,created_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "500"
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

### GET /infrastructure-load

| Field | Value |
| --- | --- |
| Node ID | 78f84eed-7948-414c-a8fa-4e2731493af9 |
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

- GET /infrastructure-load -> Prepare Infrastructure Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "infrastructure-load",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Infrastructure Request

| Field | Value |
| --- | --- |
| Node ID | 1e92a304-dfac-4c98-a1d9-d50c928e990e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /infrastructure-load -> Prepare Infrastructure Request (output 0, input 0)

**Outgoing Connections**

- Prepare Infrastructure Request -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst accessToken = String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027).trim();\nreturn [{ json: { accessToken } }];"
}
```

### Respond Infrastructure Load

| Field | Value |
| --- | --- |
| Node ID | cbda647c-b2e8-4327-aedc-fc7dda87234f |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Infrastructure Load Response -> Respond Infrastructure Load (output 0, input 0)

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
| Node ID | 0f4f3b58-3f82-4adb-b6ac-8cd0dd580bff |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Infrastructure Request -> Verify Supabase Auth User (output 0, input 0)

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

