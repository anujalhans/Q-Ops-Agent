# Q-Ops-Agent-Analytics-Summary

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | tcKSeScJRiWtRx77 |
| Active | True |
| Created At | 2026-05-02T08:28:12.629Z |
| Updated At | 2026-05-08T06:35:34.741Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops-Agent-Analytics-Summary.json |

## Description

Auth-aware analytics summary with explicit 401 for missing bearer tokens; verifies Supabase sessions, resolves qops_users, and scopes registered users to their own metrics.

## Trigger And Entry Contract

- GET /analytics-summary | n8n-nodes-base.webhook | analytics-summary
- Respond Analytics Summary | n8n-nodes-base.respondToWebhook
- Respond Unauthorized | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/analytics-summary

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /analytics-summary -> Prepare Analytics Context (source output 0, target input 0)
- Prepare Analytics Context -> Has Bearer Token? (source output 0, target input 0)
- Has Bearer Token? -> Verify Supabase Auth User (source output 0, target input 0)
- Has Bearer Token? -> Respond Unauthorized (source output 1, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (source output 0, target input 0)
- Build Scoped Metrics Query -> Fetch Scoped Metrics (source output 0, target input 0)
- Fetch Scoped Metrics -> Build Auth-Aware Analytics Response (source output 0, target input 0)
- Build Auth-Aware Analytics Response -> Respond Analytics Summary (source output 0, target input 0)
- Fetch Current User Project Memberships -> Build Scoped Metrics Query (source output 0, target input 0)

## Nodes

### Build Auth-Aware Analytics Response

| Field | Value |
| --- | --- |
| Node ID | ee075940-28bb-41d8-bb70-b71e3d421260 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Scoped Metrics -> Build Auth-Aware Analytics Response (output 0, input 0)

**Outgoing Connections**

- Build Auth-Aware Analytics Response -> Respond Analytics Summary (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const queryContext = $(\u0027Build Scoped Metrics Query\u0027).first().json;\nconst context = queryContext.context;\nconst profile = queryContext.profile;\nconst rows = $input.all().map(item =\u003e item.json).filter(row =\u003e row \u0026\u0026 row.job_id);\n\nconst completedRows = rows.filter(row =\u003e row.event === \u0027JOB_COMPLETED\u0027);\nconst failedRows = rows.filter(row =\u003e\n  row.event === \u0027JOB_FAILED\u0027 ||\n  row.event === \u0027QUALITY_GATE_FAILED\u0027 ||\n  row.status === \u0027error\u0027\n);\nconst generationCompleted = completedRows.filter(row =\u003e row.pipeline === \u0027generation\u0027);\nconst ingestionCompleted = completedRows.filter(row =\u003e row.pipeline === \u0027ingestion\u0027);\nconst terminalCount = completedRows.length + failedRows.length;\nconst successRate = terminalCount ? Math.round((completedRows.length / terminalCount) * 100) : 100;\n\nfunction sumNumber(items, field) {\n  return items.reduce((total, row) =\u003e total + (Number(row[field]) || 0), 0);\n}\n\nfunction avgNumber(items, field) {\n  const values = items.map(row =\u003e Number(row[field]) || 0).filter(value =\u003e value \u003e 0);\n  return values.length ? Math.round(values.reduce((total, value) =\u003e total + value, 0) / values.length) : 0;\n}\n\nfunction roundMoney(value) {\n  return Number((Number(value) || 0).toFixed(6));\n}\n\nfunction metadataFileCount(row) {\n  const fileKeys = row.metadata?.file_keys;\n  if (Array.isArray(fileKeys)) return fileKeys.length;\n  if (typeof fileKeys === \u0027string\u0027 \u0026\u0026 fileKeys.trim()) {\n    return fileKeys.split(\u0027,\u0027).map(item =\u003e item.trim()).filter(Boolean).length;\n  }\n  return Number(row.total_files) || 0;\n}\n\nconst byTypeMap = new Map();\nfor (const row of generationCompleted) {\n  const key = row.document_type || \u0027unknown\u0027;\n  const current = byTypeMap.get(key) || {\n    documentType: key,\n    count: 0,\n    tokensTotal: 0,\n    estimatedCostUsd: 0\n  };\n  current.count += 1;\n  current.tokensTotal += Number(row.tokens_total) || 0;\n  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;\n  byTypeMap.set(key, current);\n}\n\nfunction failureRateFor(pipeline) {\n  const completed = completedRows.filter(row =\u003e row.pipeline === pipeline).length;\n  const failed = failedRows.filter(row =\u003e row.pipeline === pipeline).length;\n  const total = completed + failed;\n  return total ? Math.round((failed / total) * 100) : 0;\n}\n\nconst recentJobs = completedRows.slice(0, 10).map(row =\u003e ({\n  jobId: row.job_id,\n  projectName: row.project_name,\n  documentType: row.document_type,\n  pipeline: row.pipeline,\n  status: row.status,\n  durationMs: row.duration_ms,\n  wordCount: row.word_count,\n  chunkCount: row.chunk_count,\n  totalFiles: row.total_files,\n  tokensTotal: row.tokens_total || 0,\n  estimatedCostUsd: Number(row.estimated_cost_usd) || 0,\n  createdAt: row.created_at,\n  requestedBy: row.requested_by || null,\n  projectId: row.project_id || null\n}));\n\nconst recentFailures = failedRows.slice(0, 10).map(row =\u003e ({\n  jobId: row.job_id,\n  projectName: row.project_name,\n  documentType: row.document_type,\n  pipeline: row.pipeline || \u0027unknown\u0027,\n  event: row.event,\n  status: row.status,\n  errorMessage: row.error_message || row.metadata?.message || row.metadata?.error || null,\n  createdAt: row.created_at,\n  requestedBy: row.requested_by || null,\n  projectId: row.project_id || null\n}));\n\nconst recentFailuresByPipelineMap = new Map();\nfor (const row of failedRows) {\n  const key = row.pipeline || \u0027unknown\u0027;\n  const current = recentFailuresByPipelineMap.get(key) || {\n    pipeline: key,\n    count: 0,\n    latestFailureAt: row.created_at || null,\n    latestJobId: row.job_id || null,\n    latestErrorMessage: row.error_message || row.metadata?.message || row.metadata?.error || null\n  };\n  current.count += 1;\n  if (!current.latestFailureAt || String(row.created_at || \u0027\u0027) \u003e String(current.latestFailureAt)) {\n    current.latestFailureAt = row.created_at || null;\n    current.latestJobId = row.job_id || null;\n    current.latestErrorMessage = row.error_message || row.metadata?.message || row.metadata?.error || null;\n  }\n  recentFailuresByPipelineMap.set(key, current);\n}\n\nconst costByPipelineMap = new Map();\nfor (const row of rows) {\n  const key = row.pipeline || \u0027unknown\u0027;\n  const current = costByPipelineMap.get(key) || {\n    pipeline: key,\n    jobs: 0,\n    tokensTotal: 0,\n    estimatedCostUsd: 0,\n    avgCostUsd: 0\n  };\n  current.jobs += row.event === \u0027JOB_COMPLETED\u0027 ? 1 : 0;\n  current.tokensTotal += Number(row.tokens_total) || 0;\n  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;\n  costByPipelineMap.set(key, current);\n}\nconst costByPipeline = Array.from(costByPipelineMap.values()).map(item =\u003e ({\n  ...item,\n  estimatedCostUsd: roundMoney(item.estimatedCostUsd),\n  avgCostUsd: item.jobs ? roundMoney(item.estimatedCostUsd / item.jobs) : 0\n}));\n\nconst costByProjectMap = new Map();\nfor (const row of rows) {\n  const key = row.project_id || row.project_name || \u0027unknown\u0027;\n  const current = costByProjectMap.get(key) || {\n    projectId: row.project_id || null,\n    projectName: row.project_name || \u0027Unknown project\u0027,\n    jobs: 0,\n    tokensTotal: 0,\n    estimatedCostUsd: 0,\n    avgCostUsd: 0\n  };\n  current.jobs += row.event === \u0027JOB_COMPLETED\u0027 ? 1 : 0;\n  current.tokensTotal += Number(row.tokens_total) || 0;\n  current.estimatedCostUsd += Number(row.estimated_cost_usd) || 0;\n  costByProjectMap.set(key, current);\n}\nconst costByProject = Array.from(costByProjectMap.values())\n  .map(item =\u003e ({\n    ...item,\n    estimatedCostUsd: roundMoney(item.estimatedCostUsd),\n    avgCostUsd: item.jobs ? roundMoney(item.estimatedCostUsd / item.jobs) : 0\n  }))\n  .sort((a, b) =\u003e b.estimatedCostUsd - a.estimatedCostUsd)\n  .slice(0, 10);\n\nconst filesByKnowledgeBaseMap = new Map();\nfor (const row of ingestionCompleted) {\n  const key = row.project_id || row.project_name || row.job_id;\n  const current = filesByKnowledgeBaseMap.get(key) || {\n    projectId: row.project_id || null,\n    projectName: row.project_name || \u0027Unknown knowledge base\u0027,\n    jobs: 0,\n    filesProcessed: 0,\n    chunksIngested: 0,\n    latestJobId: row.job_id || null,\n    latestCompletedAt: row.created_at || null\n  };\n  current.jobs += 1;\n  current.filesProcessed += metadataFileCount(row);\n  current.chunksIngested += Number(row.chunk_count) || 0;\n  if (!current.latestCompletedAt || String(row.created_at || \u0027\u0027) \u003e String(current.latestCompletedAt)) {\n    current.latestCompletedAt = row.created_at || null;\n    current.latestJobId = row.job_id || null;\n  }\n  filesByKnowledgeBaseMap.set(key, current);\n}\nconst filesByKnowledgeBase = Array.from(filesByKnowledgeBaseMap.values())\n  .sort((a, b) =\u003e b.filesProcessed - a.filesProcessed)\n  .slice(0, 10);\n\nreturn [{\n  json: {\n    overview: {\n      totalJobsCompleted: completedRows.length,\n      totalDocumentsGenerated: generationCompleted.length,\n      totalIngestionJobsCompleted: ingestionCompleted.length,\n      totalJobsFailed: failedRows.length,\n      successRate,\n      totalCostUsd: roundMoney(sumNumber(rows, \u0027estimated_cost_usd\u0027)),\n      avgCostPerDocument: generationCompleted.length ? roundMoney(sumNumber(generationCompleted, \u0027estimated_cost_usd\u0027) / generationCompleted.length) : 0,\n      totalTokensConsumed: sumNumber(rows, \u0027tokens_total\u0027),\n      totalChunksIngested: sumNumber(rows, \u0027chunk_count\u0027),\n      avgDurationMs: avgNumber(rows, \u0027duration_ms\u0027),\n      avgIngestionDurationMs: avgNumber(ingestionCompleted, \u0027duration_ms\u0027),\n      totalFilesProcessed: ingestionCompleted.reduce((total, row) =\u003e total + metadataFileCount(row), 0)\n    },\n    byDocumentType: Array.from(byTypeMap.values()).map(item =\u003e ({\n      ...item,\n      estimatedCostUsd: roundMoney(item.estimatedCostUsd)\n    })),\n    failureRate: {\n      generation: failureRateFor(\u0027generation\u0027),\n      ingestion: failureRateFor(\u0027ingestion\u0027)\n    },\n    recentJobs,\n    ingestion: {\n      jobsCompleted: ingestionCompleted.length,\n      totalChunksIngested: sumNumber(ingestionCompleted, \u0027chunk_count\u0027),\n      avgProcessingDurationMs: avgNumber(ingestionCompleted, \u0027duration_ms\u0027),\n      totalFilesProcessed: ingestionCompleted.reduce((total, row) =\u003e total + metadataFileCount(row), 0),\n      filesByKnowledgeBase\n    },\n    failures: {\n      recent: recentFailures,\n      byPipeline: Array.from(recentFailuresByPipelineMap.values())\n    },\n    costs: {\n      byPipeline: costByPipeline,\n      byProject: costByProject\n    },\n    meta: {\n      generatedAt: new Date().toISOString(),\n      dateFrom: context.dateFrom,\n      pipeline: context.pipeline,\n      daysRequested: context.days,\n      scope: queryContext.scope,\n      userRole: profile.role,\n      userId: profile.id,\n      projectId: context.projectIdFilter || null, assignedProjectIds: queryContext.assignedProjectIds || []\n    }\n  }\n}];"
}
```

### Build Scoped Metrics Query

| Field | Value |
| --- | --- |
| Node ID | 5cdf2aa6-8f0e-4e9d-83e9-751450d69bee |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current User Project Memberships -> Build Scoped Metrics Query (output 0, input 0)

**Outgoing Connections**

- Build Scoped Metrics Query -> Fetch Scoped Metrics (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const context = $(\u0027Prepare Analytics Context\u0027).first().json;\nconst authUser = $(\u0027Verify Supabase Auth User\u0027).first().json;\nconst profile = $(\u0027Fetch Q-Ops User Profile\u0027).first().json || {};\nconst memberships = $input.all()\n  .map(item =\u003e item.json)\n  .filter(row =\u003e row \u0026\u0026 row.project_id)\n  .map(row =\u003e ({ projectId: row.project_id, role: row.project_role || \u0027viewer\u0027 }));\n\nif (!profile.id || profile.status !== \u0027active\u0027) throw new Error(\u0027Active Q-Ops user profile not found\u0027);\n\nconst pairs = [];\nfunction add(name, value) {\n  pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);\n}\n\nadd(\u0027select\u0027, \u0027job_id,project_name,document_type,pipeline,event,status,duration_ms,word_count,chunk_count,total_files,tokens_input,tokens_output,tokens_total,estimated_cost_usd,error_message,metadata,created_at,requested_by,project_id\u0027);\nadd(\u0027created_at\u0027, `gte.${context.dateFrom}`);\nadd(\u0027order\u0027, \u0027created_at.desc\u0027);\nadd(\u0027limit\u0027, \u00271000\u0027);\n\nif (context.pipeline !== \u0027all\u0027) add(\u0027pipeline\u0027, `eq.${context.pipeline}`);\n\nlet scope = \u0027workspace\u0027;\nlet requestedByFilter = \u0027\u0027;\nlet assignedProjectIds = [];\n\nif (profile.role === \u0027registered_user\u0027) {\n  requestedByFilter = profile.id;\n  assignedProjectIds = memberships.map(item =\u003e item.projectId);\n  scope = \u0027self_assigned_projects\u0027;\n} else if (profile.role === \u0027admin\u0027 \u0026\u0026 context.userIdFilter) {\n  requestedByFilter = context.userIdFilter;\n  scope = \u0027admin_user_filter\u0027;\n}\n\nif (requestedByFilter) add(\u0027requested_by\u0027, `eq.${requestedByFilter}`);\n\nif (context.projectIdFilter) {\n  if (profile.role === \u0027registered_user\u0027 \u0026\u0026 !assignedProjectIds.includes(context.projectIdFilter)) {\n    add(\u0027project_id\u0027, \u0027eq.__no_assigned_project__\u0027);\n  } else {\n    add(\u0027project_id\u0027, `eq.${context.projectIdFilter}`);\n  }\n} else if (profile.role === \u0027registered_user\u0027) {\n  if (assignedProjectIds.length) {\n    add(\u0027project_id\u0027, `in.(${assignedProjectIds.map(encodeURIComponent).join(\u0027,\u0027)})`);\n  } else {\n    add(\u0027project_id\u0027, \u0027eq.__no_assigned_project__\u0027);\n  }\n}\n\nreturn [{\n  json: {\n    url: `https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics?${pairs.join(\u0027\u0026\u0027)}`,\n    context,\n    authUser,\n    profile,\n    scope,\n    assignedProjectIds,\n    memberships\n  }\n}];"
}
```

### Fetch Current User Project Memberships

| Field | Value |
| --- | --- |
| Node ID | analytics-current-user-project-memberships |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Current User Project Memberships -> Build Scoped Metrics Query (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ $json.id || \"00000000-0000-0000-0000-000000000000\" }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
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
| Node ID | 10998353-7f61-4737-a767-3525007f5587 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
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

### Fetch Scoped Metrics

| Field | Value |
| --- | --- |
| Node ID | fc27b5f5-3f1f-4810-8f29-05a52cc5a23e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Scoped Metrics Query -> Fetch Scoped Metrics (output 0, input 0)

**Outgoing Connections**

- Fetch Scoped Metrics -> Build Auth-Aware Analytics Response (output 0, input 0)

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
    "url":  "={{ $json.url }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### GET /analytics-summary

| Field | Value |
| --- | --- |
| Node ID | 659ae909-01c3-434a-9ded-a7c3fe52aca0 |
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

- GET /analytics-summary -> Prepare Analytics Context (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "analytics-summary",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Has Bearer Token?

| Field | Value |
| --- | --- |
| Node ID | a88ff80a-dd9e-44bc-a64e-10598fa54921 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Analytics Context -> Has Bearer Token? (output 0, input 0)

**Outgoing Connections**

- Has Bearer Token? -> Verify Supabase Auth User (output 0, input 0)
- Has Bearer Token? -> Respond Unauthorized (output 1, input 0)

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
                                              "leftValue":  "={{ $json.isAuthorized }}",
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

### Prepare Analytics Context

| Field | Value |
| --- | --- |
| Node ID | 59de52b7-a4ca-460b-b2e4-7c46ba9dc4c6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /analytics-summary -> Prepare Analytics Context (output 0, input 0)

**Outgoing Connections**

- Prepare Analytics Context -> Has Bearer Token? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst query = $json.query || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst hasBearerToken = String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027);\nconst allowedPipelines = new Set([\u0027all\u0027, \u0027generation\u0027, \u0027ingestion\u0027]);\nconst pipeline = allowedPipelines.has(String(query.pipeline || \u0027all\u0027)) ? String(query.pipeline || \u0027all\u0027) : \u0027all\u0027;\nconst daysRaw = Number.parseInt(String(query.days || \u002730\u0027), 10);\nconst days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 365) : 30;\nconst dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();\nreturn [{ json: { isAuthorized: hasBearerToken, token: hasBearerToken ? String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027) : \u0027\u0027, pipeline, days, dateFrom, userIdFilter: query.userId || \u0027\u0027, projectIdFilter: query.projectId || \u0027\u0027 } }];"
}
```

### Respond Analytics Summary

| Field | Value |
| --- | --- |
| Node ID | 9a70f4b7-568c-47d9-b707-882c9ade57b5 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Auth-Aware Analytics Response -> Respond Analytics Summary (output 0, input 0)

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

### Respond Unauthorized

| Field | Value |
| --- | --- |
| Node ID | aa12f31b-b4a3-44b1-b389-f47ae5e6258d |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Has Bearer Token? -> Respond Unauthorized (output 1, input 0)

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
    "responseBody":  "{\"ok\":false,\"error\":\"unauthorized\",\"message\":\"Missing bearer token\"}",
    "options":  {
                    "responseCode":  401,
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
| Node ID | 8ab4e827-ec31-4247-b6cd-9c7b523a59de |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Has Bearer Token? -> Verify Supabase Auth User (output 0, input 0)

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

