# Q-Ops Agent Audit Events API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | lyyrP14iTYacuEFv |
| Active | True |
| Created At | 2026-05-07T05:54:19.525Z |
| Updated At | 2026-05-20T08:07:19.549Z |
| Node Count | 9 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Audit Events API [lyyrP14iTYacuEFv].json |

## Description

Auth-aware audit API for GET /webhook/audit-events. Verifies Supabase bearer tokens; admins receive workspace audit events and registered users receive only their own assigned-project/user events.

## Trigger And Entry Contract

- GET /audit-events | n8n-nodes-base.webhook | audit-events
- Respond Audit Events | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/audit-events

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /audit-events -> Prepare Audit Request (source output 0, target input 0)
- Prepare Audit Request -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (source output 0, target input 0)
- Fetch Current User Project Memberships -> Fetch Q-Ops Audit Events (source output 0, target input 0)
- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (source output 0, target input 0)
- Fetch QA Job Metrics For Audit -> Map Audit Events Response (source output 0, target input 0)
- Map Audit Events Response -> Respond Audit Events (source output 0, target input 0)

## Nodes

### Fetch Current User Project Memberships

| Field | Value |
| --- | --- |
| Node ID | d5c81480-b90f-4f71-b0c1-9279f37acf93 |
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

- Fetch Current User Project Memberships -> Fetch Q-Ops Audit Events (output 0, input 0)

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
                                                   "value":  "project_id,role:project_role,qops_projects(name)"
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

### Fetch QA Job Metrics For Audit

| Field | Value |
| --- | --- |
| Node ID | cd68e0e8-e1cb-4611-a731-1bace23644e4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (output 0, input 0)

**Outgoing Connections**

- Fetch QA Job Metrics For Audit -> Map Audit Events Response (output 0, input 0)

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
                                                   "value":  "id,job_id,project_id,requested_by,project_name,document_type,pipeline,event,status,error_message,created_at"
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

### Fetch Q-Ops Audit Events

| Field | Value |
| --- | --- |
| Node ID | 61789f4b-7799-4954-87d9-bc8b71fb3cc6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current User Project Memberships -> Fetch Q-Ops Audit Events (output 0, input 0)

**Outgoing Connections**

- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,actor_name,action,entity_type,entity_id,project_id,status,details,metadata,created_at"
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

### Fetch Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | ffba812d-d670-48c4-bb9f-a2aceffd52fa |
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

### GET /audit-events

| Field | Value |
| --- | --- |
| Node ID | e8e0dff3-53ab-4b6e-b70c-4c5c38e90720 |
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

- GET /audit-events -> Prepare Audit Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "audit-events",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Audit Events Response

| Field | Value |
| --- | --- |
| Node ID | ac7ef8f8-f085-4b5a-acc7-3de01b77974d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch QA Job Metrics For Audit -> Map Audit Events Response (output 0, input 0)

**Outgoing Connections**

- Map Audit Events Response -> Respond Audit Events (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const authUser = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst profile = $(\u0027Fetch Q-Ops User Profile\u0027).first().json || {};\nconst memberships = $items(\u0027Fetch Current User Project Memberships\u0027).map(i =\u003e i.json).filter(m =\u003e m \u0026\u0026 m.project_id);\n\nif (!authUser.id || !profile.id || profile.status !== \u0027active\u0027) {\n  return [{ json: { ok: false, error: \u0027unauthorized\u0027, message: \u0027Missing or invalid Supabase Auth token.\u0027 } }];\n}\n\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst allowedProjectIds = new Set(memberships.map(m =\u003e String(m.project_id)));\nconst allowedProjectNames = new Set(memberships.map(m =\u003e m.qops_projects?.name).filter(Boolean).map(String));\nconst projectNameById = new Map(memberships.map(m =\u003e [String(m.project_id), m.qops_projects?.name || String(m.project_id)]));\nconst currentUserId = String(profile.id);\nconst actorKeys = new Set([profile.email, profile.name, authUser.email].filter(Boolean).map(v =\u003e String(v).toLowerCase()));\n\nfunction isOwnAuditEvent(e) {\n  if (isAdmin) return true;\n  const meta = e.metadata || {};\n  const projectId = e.project_id ? String(e.project_id) : \u0027\u0027;\n  const projectName = meta.projectName || meta.project_name || \u0027\u0027;\n  const actor = String(e.actor_name || \u0027\u0027).toLowerCase();\n  const requestedBy = meta.requested_by || meta.requestedBy || meta.userId || meta.qopsUserId;\n  return Boolean(\n    (projectId \u0026\u0026 allowedProjectIds.has(projectId)) ||\n    (projectName \u0026\u0026 allowedProjectNames.has(String(projectName))) ||\n    (requestedBy \u0026\u0026 String(requestedBy) === currentUserId) ||\n    (actor \u0026\u0026 actorKeys.has(actor))\n  );\n}\n\nfunction isOwnMetric(m) {\n  if (isAdmin) return true;\n  const requestedByMatches = m.requested_by \u0026\u0026 String(m.requested_by) === currentUserId;\n  const projectId = m.project_id ? String(m.project_id) : \u0027\u0027;\n  const projectName = m.project_name || \u0027\u0027;\n  const assignedProjectMatches = !projectId || allowedProjectIds.has(projectId) || allowedProjectNames.has(String(projectName));\n  return Boolean(requestedByMatches \u0026\u0026 assignedProjectMatches);\n}\n\nconst explicitEvents = $items(\u0027Fetch Q-Ops Audit Events\u0027)\n  .map(i =\u003e i.json)\n  .filter(e =\u003e e \u0026\u0026 e.id \u0026\u0026 isOwnAuditEvent(e))\n  .map(e =\u003e ({\n    id: e.id,\n    actor: e.actor_name || \u0027n8n\u0027,\n    action: e.action,\n    project: e.metadata?.projectName || e.metadata?.project_name || (e.project_id ? projectNameById.get(String(e.project_id)) || e.project_id : \u0027\u0027),\n    entity: e.entity_id || e.entity_type || \u0027\u0027,\n    status: e.status || \u0027info\u0027,\n    timestamp: e.created_at,\n    details: e.details || \u0027\u0027,\n    event: e.action\n  }));\n\nconst metricEvents = $items(\u0027Fetch QA Job Metrics For Audit\u0027)\n  .map(i =\u003e i.json)\n  .filter(m =\u003e m \u0026\u0026 m.id \u0026\u0026 isOwnMetric(m))\n  .map(m =\u003e {\n    const metadata = m.metadata || {};\n    const extraction = metadata.extraction_observability || metadata.extractionObservability || {};\n    const warningCount = Number(metadata.warning_count ?? extraction.warningCount ?? 0) || 0;\n    const tableCount = Number(metadata.table_count ?? extraction.tableCount ?? 0) || 0;\n    const annotationCount = Number(metadata.annotation_count ?? extraction.annotationCount ?? 0) || 0;\n    const linkCount = Number(metadata.link_count ?? extraction.linkCount ?? 0) || 0;\n    const visualCandidates = Number(metadata.visual_candidates_detected ?? extraction.visualCandidatesDetected ?? 0) || 0;\n    const extractionDetails = m.pipeline === \u0027ingestion\u0027\n      ? [\n          warningCount ? `${warningCount} extractor warning${warningCount === 1 ? \u0027\u0027 : \u0027s\u0027}` : null,\n          tableCount ? `${tableCount} table${tableCount === 1 ? \u0027\u0027 : \u0027s\u0027}` : null,\n          annotationCount ? `${annotationCount} annotation${annotationCount === 1 ? \u0027\u0027 : \u0027s\u0027}` : null,\n          linkCount ? `${linkCount} link${linkCount === 1 ? \u0027\u0027 : \u0027s\u0027}` : null,\n          visualCandidates ? `${visualCandidates} render candidate${visualCandidates === 1 ? \u0027\u0027 : \u0027s\u0027}` : null,\n        ].filter(Boolean).join(\u0027 | \u0027)\n      : \u0027\u0027;\n    return {\n      id: `metric-${m.id}`,\n      actor: \u0027n8n\u0027,\n      action: m.event || \u0027JOB_EVENT\u0027,\n      project: m.project_name || (m.project_id ? projectNameById.get(String(m.project_id)) || m.project_id : \u0027\u0027),\n      entity: m.job_id || \u0027\u0027,\n      status: m.status === \u0027error\u0027 || m.status === \u0027failed\u0027 ? \u0027error\u0027 : m.event === \u0027JOB_COMPLETED\u0027 ? \u0027success\u0027 : \u0027info\u0027,\n      timestamp: m.created_at,\n      details: [m.pipeline, m.document_type, extractionDetails, m.error_message].filter(Boolean).join(\u0027 | \u0027),\n      event: m.event,\n      pipeline: m.pipeline,\n      jobId: m.job_id\n    };\n  });\n\nconst events = explicitEvents.concat(metricEvents).sort((a, b) =\u003e new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 150);\nreturn [{ json: { events, meta: { scope: isAdmin ? \u0027workspace\u0027 : \u0027self\u0027, userId: profile.id, projectIds: isAdmin ? [] : Array.from(allowedProjectIds), generatedAt: new Date().toISOString() } } }];"
}
```

### Prepare Audit Request

| Field | Value |
| --- | --- |
| Node ID | 893155ee-ac71-49db-b439-5bb97290c3e0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /audit-events -> Prepare Audit Request (output 0, input 0)

**Outgoing Connections**

- Prepare Audit Request -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst accessToken = String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027).trim();\nreturn [{ json: { accessToken, hasBearer: Boolean(accessToken) } }];"
}
```

### Respond Audit Events

| Field | Value |
| --- | --- |
| Node ID | c4d50530-82f0-4ebb-a17e-7cf995d09ade |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Audit Events Response -> Respond Audit Events (output 0, input 0)

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
| Node ID | 6f413709-b149-4675-918d-1b52a63c3625 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Audit Request -> Verify Supabase Auth User (output 0, input 0)

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
