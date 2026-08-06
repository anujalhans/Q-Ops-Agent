# DI - Cross Project Search API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 18yW35k0ANmU3ZY4 |
| Active | True |
| Created At | 2026-05-11T10:41:34.141Z |
| Updated At | 2026-05-11T10:45:31.768Z |
| Node Count | 13 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\DI - Cross Project Search API [18yW35k0ANmU3ZY4].json |

## Description

Authenticated GET /webhook/di/search endpoint for governed Delivery Intelligence discovery across reusable solutions, technologies, learnings, and recommendations.

## Trigger And Entry Contract

- GET /di/search | n8n-nodes-base.webhook | di/search
- Respond DI Search | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/di/search

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.stickyNote | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /di/search -> Prepare DI Search Request (source output 0, target input 0)
- Prepare DI Search Request -> Valid DI Search Request? (source output 0, target input 0)
- Valid DI Search Request? -> Verify Search Supabase Auth User (source output 0, target input 0)
- Valid DI Search Request? -> Respond DI Search (source output 1, target input 0)
- Verify Search Supabase Auth User -> Fetch Search Q-Ops User Profile (source output 0, target input 0)
- Fetch Search Q-Ops User Profile -> Fetch Search Project Memberships (source output 0, target input 0)
- Fetch Search Project Memberships -> Fetch DI Solutions For Search (source output 0, target input 0)
- Fetch DI Solutions For Search -> Fetch DI Technologies For Search (source output 0, target input 0)
- Fetch DI Technologies For Search -> Fetch DI Learnings For Search (source output 0, target input 0)
- Fetch DI Learnings For Search -> Fetch DI Recommendations For Search (source output 0, target input 0)
- Fetch DI Recommendations For Search -> Map DI Search Response (source output 0, target input 0)
- Map DI Search Response -> Respond DI Search (source output 0, target input 0)

## Nodes

### Fetch DI Learnings For Search

| Field | Value |
| --- | --- |
| Node ID | 04eb9478-1453-4adc-9dc6-aa026f08d795 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Technologies For Search -> Fetch DI Learnings For Search (output 0, input 0)

**Outgoing Connections**

- Fetch DI Learnings For Search -> Fetch DI Recommendations For Search (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,created_at\u0026order=created_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Recommendations For Search

| Field | Value |
| --- | --- |
| Node ID | f664617b-63de-4ae5-aaa4-362b4e8f96fd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Learnings For Search -> Fetch DI Recommendations For Search (output 0, input 0)

**Outgoing Connections**

- Fetch DI Recommendations For Search -> Map DI Search Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,created_at\u0026order=created_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Solutions For Search

| Field | Value |
| --- | --- |
| Node ID | fe901ea5-1a5a-4707-a274-cb1aa86ef9df |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Search Project Memberships -> Fetch DI Solutions For Search (output 0, input 0)

**Outgoing Connections**

- Fetch DI Solutions For Search -> Fetch DI Technologies For Search (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,applicability_tags,visibility_level,source_project_id,status,updated_at\u0026order=updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Technologies For Search

| Field | Value |
| --- | --- |
| Node ID | 7c8aca0b-d6b2-44a0-9b47-3a06c95b2fb3 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Solutions For Search -> Fetch DI Technologies For Search (output 0, input 0)

**Outgoing Connections**

- Fetch DI Technologies For Search -> Fetch DI Learnings For Search (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_technologies?select=id,name,normalized_name,category,description,vendor,tags,updated_at\u0026order=updated_at.desc\u0026limit=300",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Search Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 69713e4a-d748-4fa2-bfb5-90c8f1f47bb0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Search Q-Ops User Profile -> Fetch Search Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Search Project Memberships -> Fetch DI Solutions For Search (output 0, input 0)

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

### Fetch Search Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 4c3b4eeb-39d8-4128-877b-36f9a9309f06 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Search Supabase Auth User -> Fetch Search Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Search Q-Ops User Profile -> Fetch Search Project Memberships (output 0, input 0)

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

### GET /di/search

| Field | Value |
| --- | --- |
| Node ID | f1ba2d48-db46-43a4-a1df-9572b18a338f |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- GET /di/search -> Prepare DI Search Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "di/search",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map DI Search Response

| Field | Value |
| --- | --- |
| Node ID | 03c1cf6f-59c9-4fcd-9191-a84cc5e13bf6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Recommendations For Search -> Map DI Search Response (output 0, input 0)

**Outgoing Connections**

- Map DI Search Response -> Respond DI Search (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Search Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Search Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nconst req = $(\u0027Prepare DI Search Request\u0027).first().json;\nconst q = String(req.q || \u0027\u0027).toLowerCase();\nconst limit = req.limit || 25;\nconst memberships = $items(\u0027Fetch Search Project Memberships\u0027).map(i =\u003e i.json.project_id).filter(Boolean);\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst canProject = id =\u003e isAdmin || !id || memberships.includes(id);\nconst visible = r =\u003e isAdmin || [\u0027organization\u0027,\u0027ai_sanitized_only\u0027].includes(r.visibility_level) || canProject(r.source_project_id || r.project_id);\nconst matches = (r, fields) =\u003e !q || fields.some(f =\u003e String(r[f] || \u0027\u0027).toLowerCase().includes(q)) || JSON.stringify(r).toLowerCase().includes(q);\nconst solutions = $items(\u0027Fetch DI Solutions For Search\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id \u0026\u0026 visible(r) \u0026\u0026 matches(r, [\u0027title\u0027,\u0027summary\u0027,\u0027problem_statement\u0027,\u0027implementation_approach\u0027,\u0027qa_approach\u0027])).slice(0, limit).map(r =\u003e ({ type: \u0027solution\u0027, id: r.id, title: r.title, summary: r.summary, projectId: r.source_project_id, visibilityLevel: r.visibility_level, status: r.status, updatedAt: r.updated_at }));\nconst technologies = $items(\u0027Fetch DI Technologies For Search\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id \u0026\u0026 matches(r, [\u0027name\u0027,\u0027normalized_name\u0027,\u0027category\u0027,\u0027description\u0027,\u0027vendor\u0027])).slice(0, limit).map(r =\u003e ({ type: \u0027technology\u0027, id: r.id, title: r.name, summary: r.description || r.category, category: r.category, updatedAt: r.updated_at }));\nconst learnings = $items(\u0027Fetch DI Learnings For Search\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id \u0026\u0026 visible(r) \u0026\u0026 matches(r, [\u0027title\u0027,\u0027category\u0027,\u0027learning_summary\u0027,\u0027reusable_recommendation\u0027])).slice(0, limit).map(r =\u003e ({ type: \u0027learning\u0027, id: r.id, title: r.title, summary: r.learning_summary, projectId: r.source_project_id, impactLevel: r.impact_level, createdAt: r.created_at }));\nconst recommendations = $items(\u0027Fetch DI Recommendations For Search\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id \u0026\u0026 canProject(r.project_id) \u0026\u0026 matches(r, [\u0027title\u0027,\u0027summary\u0027,\u0027rationale\u0027,\u0027recommendation_type\u0027])).slice(0, limit).map(r =\u003e ({ type: \u0027recommendation\u0027, id: r.id, title: r.title, summary: r.summary, projectId: r.project_id, status: r.status, confidenceScore: r.confidence_score, createdAt: r.created_at }));\nconst results = [...solutions, ...technologies, ...learnings, ...recommendations].slice(0, limit * 4);\nreturn [{ json: { ok: true, query: req.q, projectId: req.projectId, counts: { solutions: solutions.length, technologies: technologies.length, learnings: learnings.length, recommendations: recommendations.length, total: results.length }, results } }];"
}
```

### Prepare DI Search Request

| Field | Value |
| --- | --- |
| Node ID | 115ce361-b9fb-4d85-b31f-a9c4b46d2679 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /di/search -> Prepare DI Search Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Search Request -> Valid DI Search Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst query = $json.query || {};\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 } }];\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), q: String(query.q || \u0027\u0027).trim(), projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 25), 100) } }];"
}
```

### Respond DI Search

| Field | Value |
| --- | --- |
| Node ID | 9b3744c2-7262-4d3d-a63f-1b82072bf796 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2464, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Search Request? -> Respond DI Search (output 1, input 0)
- Map DI Search Response -> Respond DI Search (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_SEARCH_ERROR\", message: $json.message || \"Unable to search Delivery Intelligence\" } }) }}",
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

### Sticky Note 31360674

| Field | Value |
| --- | --- |
| Node ID | 7ffe8014-8822-408d-b8c8-d9d65e00ad9f |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1232, 144 |
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
    "content":  "## Delivery Intelligence Search API\nGET /webhook/di/search?q=... returns governed Delivery Intelligence search results from di_* tables. It verifies Supabase Auth and applies admin/project/visibility filtering in the workflow before returning data.",
    "height":  180,
    "width":  2100,
    "color":  3
}
```

### Valid DI Search Request?

| Field | Value |
| --- | --- |
| Node ID | b69148ac-0d19-454c-be0c-9ca01f5f7255 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Search Request -> Valid DI Search Request? (output 0, input 0)

**Outgoing Connections**

- Valid DI Search Request? -> Verify Search Supabase Auth User (output 0, input 0)
- Valid DI Search Request? -> Respond DI Search (output 1, input 0)

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

### Verify Search Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 87cc4aa1-a151-4e7c-beb4-a7ac8ddf3db0 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Search Request? -> Verify Search Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Search Supabase Auth User -> Fetch Search Q-Ops User Profile (output 0, input 0)

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
