# DI - Solution Review API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 9baEqUVgSSFzZFbc |
| Active | True |
| Created At | 2026-05-12T10:04:40.839Z |
| Updated At | 2026-05-12T10:36:36.137Z |
| Node Count | 15 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\DI - Solution Review API [9baEqUVgSSFzZFbc].json |

## Description

Authenticated PATCH /webhook/di/solutions/review endpoint to submit, review, publish, or archive Delivery Intelligence solution candidates with audit logging.

## Trigger And Entry Contract

- PATCH /di/solutions/review | n8n-nodes-base.webhook | PATCH | di/solutions/review
- Respond DI Solution Review | n8n-nodes-base.respondToWebhook
- OPTIONS /di/solutions/review | n8n-nodes-base.webhook | ={{ "OPTIONS" }} | di/solutions/review
- Respond DI Solution Review CORS | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- ={{ "OPTIONS" }} /webhook/di/solutions/review
- PATCH /webhook/di/solutions/review

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- PATCH /di/solutions/review -> Prepare DI Solution Review Request (source output 0, target input 0)
- Prepare DI Solution Review Request -> Verify Review Supabase Auth User (source output 0, target input 0)
- Verify Review Supabase Auth User -> Fetch Review Q-Ops User Profile (source output 0, target input 0)
- Fetch Review Q-Ops User Profile -> Fetch DI Solution For Review (source output 0, target input 0)
- Fetch DI Solution For Review -> Fetch Review Project Memberships (source output 0, target input 0)
- Fetch Review Project Memberships -> Authorize DI Solution Review (source output 0, target input 0)
- Authorize DI Solution Review -> DI Solution Review Authorized? (source output 0, target input 0)
- DI Solution Review Authorized? -> Insert DI Solution Review (source output 0, target input 0)
- DI Solution Review Authorized? -> Respond DI Solution Review (source output 1, target input 0)
- Insert DI Solution Review -> Update DI Solution Status (source output 0, target input 0)
- Update DI Solution Status -> Insert DI Solution Review Audit (source output 0, target input 0)
- Insert DI Solution Review Audit -> Map DI Solution Review Success (source output 0, target input 0)
- Map DI Solution Review Success -> Respond DI Solution Review (source output 0, target input 0)
- OPTIONS /di/solutions/review -> Respond DI Solution Review CORS (source output 0, target input 0)

## Nodes

### Authorize DI Solution Review

| Field | Value |
| --- | --- |
| Node ID | 446574ed-bf87-4978-9a89-782b9335893a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Review Project Memberships -> Authorize DI Solution Review (output 0, input 0)

**Outgoing Connections**

- Authorize DI Solution Review -> DI Solution Review Authorized? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const req = $(\u0027Prepare DI Solution Review Request\u0027).first().json;\nif (!req.ok) return [{ json: req }];\nconst auth = $(\u0027Verify Review Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Review Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nconst rawSolution = $(\u0027Fetch DI Solution For Review\u0027).first().json;\nconst solution = Array.isArray(rawSolution) ? rawSolution[0] : rawSolution;\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nif (!solution?.id) return [{ json: { ok: false, statusCode: 404, errorCode: \u0027SOLUTION_NOT_FOUND\u0027, message: \u0027Reusable solution not found\u0027 } }];\nconst memberships = $items(\u0027Fetch Review Project Memberships\u0027).map((item) =\u003e item.json);\nconst memberRole = memberships.find((row) =\u003e row.project_id === solution.source_project_id)?.project_role || null;\nconst canReview = profile.role === \u0027admin\u0027 || memberRole === \u0027owner\u0027 || memberRole === \u0027editor\u0027;\nif (!canReview) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027SOLUTION_REVIEW_ACCESS_DENIED\u0027, message: \u0027User cannot review or publish this solution\u0027 } }];\nconst reviewPayload = {\n  solution_id: solution.id,\n  project_id: solution.source_project_id,\n  reviewer_user_id: profile.id,\n  decision: req.decision,\n  review_notes: req.reviewNotes || null,\n  governance_tags: req.governanceTags || [],\n  visibility_override: req.visibilityOverride || null,\n  published_title: req.publishedTitle || null,\n  published_summary: req.publishedSummary || null,\n};\nconst solutionPatch = {\n  status: req.decision === \u0027submitted\u0027 ? \u0027review\u0027 : req.decision,\n  updated_at: new Date().toISOString(),\n};\nif (req.visibilityOverride) solutionPatch.visibility_level = req.visibilityOverride;\nif (req.publishedTitle) solutionPatch.title = req.publishedTitle;\nif (req.publishedSummary) solutionPatch.summary = req.publishedSummary;\nconst audit = {\n  action: \u0027DI_SOLUTION_REVIEW_\u0027 + req.decision.toUpperCase(),\n  entity_type: \u0027di_solution\u0027,\n  entity_id: solution.id,\n  project_id: solution.source_project_id,\n  actor_user_id: profile.id,\n  actor_name: profile.email,\n  status: \u0027success\u0027,\n  details: req.decision + \u0027: \u0027 + solution.title,\n  metadata: {\n    solution_id: solution.id,\n    previous_status: solution.status,\n    new_status: solutionPatch.status,\n    visibility_override: req.visibilityOverride || null,\n  },\n};\nreturn [{ json: { ok: true, solutionId: solution.id, reviewPayload, solutionPatch, audit, decision: req.decision } }];"
}
```

### DI Solution Review Authorized?

| Field | Value |
| --- | --- |
| Node ID | 1c3b9e5d-169d-4426-926e-ae99b8d50803 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1568, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Authorize DI Solution Review -> DI Solution Review Authorized? (output 0, input 0)

**Outgoing Connections**

- DI Solution Review Authorized? -> Insert DI Solution Review (output 0, input 0)
- DI Solution Review Authorized? -> Respond DI Solution Review (output 1, input 0)

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

### Fetch DI Solution For Review

| Field | Value |
| --- | --- |
| Node ID | 12e2c7e0-1bab-4373-a016-876019789d0b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Review Q-Ops User Profile -> Fetch DI Solution For Review (output 0, input 0)

**Outgoing Connections**

- Fetch DI Solution For Review -> Fetch Review Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ encodeURIComponent($(\"Prepare DI Solution Review Request\").item.json.solutionId || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=id,title,status,summary,visibility_level,source_project_id\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Review Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 8175bfb5-c602-4d8e-92e2-fbd0d68546b3 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Solution For Review -> Fetch Review Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Review Project Memberships -> Authorize DI Solution Review (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($(\"Fetch Review Q-Ops User Profile\").item.json) ? ($(\"Fetch Review Q-Ops User Profile\").item.json[0]?.id || \"00000000-0000-0000-0000-000000000000\") : ($(\"Fetch Review Q-Ops User Profile\").item.json.id || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Review Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | a8f8dd15-e29a-4ecd-83fa-7e61e30f9622 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Review Supabase Auth User -> Fetch Review Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Review Q-Ops User Profile -> Fetch DI Solution For Review (output 0, input 0)

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

### Insert DI Solution Review

| Field | Value |
| --- | --- |
| Node ID | 6c7b4d16-ff2b-4d14-b758-116177d2f14c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- DI Solution Review Authorized? -> Insert DI Solution Review (output 0, input 0)

**Outgoing Connections**

- Insert DI Solution Review -> Update DI Solution Status (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.reviewPayload) }}",
    "options":  {

                }
}
```

### Insert DI Solution Review Audit

| Field | Value |
| --- | --- |
| Node ID | 54b2bafe-b462-4200-a048-099572ed9bcf |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update DI Solution Status -> Insert DI Solution Review Audit (output 0, input 0)

**Outgoing Connections**

- Insert DI Solution Review Audit -> Map DI Solution Review Success (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($(\"Authorize DI Solution Review\").item.json.audit || {}) }}",
    "options":  {

                }
}
```

### Map DI Solution Review Success

| Field | Value |
| --- | --- |
| Node ID | 36ae9d71-b34d-4919-8507-eadd57fb56ed |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert DI Solution Review Audit -> Map DI Solution Review Success (output 0, input 0)

**Outgoing Connections**

- Map DI Solution Review Success -> Respond DI Solution Review (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const review = $(\u0027Insert DI Solution Review\u0027).first().json || {};\nconst updated = $(\u0027Update DI Solution Status\u0027).first().json || {};\nconst auth = $(\u0027Authorize DI Solution Review\u0027).first().json || {};\nreturn [{ json: { ok: true, solutionId: auth.solutionId, reviewId: review.id || null, status: updated.status || auth.decision, decision: auth.decision } }];"
}
```

### OPTIONS /di/solutions/review

| Field | Value |
| --- | --- |
| Node ID | 9c2d23a9-43e0-4768-a472-9d8ac1b33db5 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OPTIONS /di/solutions/review -> Respond DI Solution Review CORS (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "={{ \"OPTIONS\" }}",
    "path":  "di/solutions/review",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### PATCH /di/solutions/review

| Field | Value |
| --- | --- |
| Node ID | 64ac900d-9c98-4e12-a606-f10b339061dc |
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

- PATCH /di/solutions/review -> Prepare DI Solution Review Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "PATCH",
    "path":  "di/solutions/review",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare DI Solution Review Request

| Field | Value |
| --- | --- |
| Node ID | d2a84f50-c6ec-4bd3-9abb-95cbf1ca2158 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /di/solutions/review -> Prepare DI Solution Review Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Solution Review Request -> Verify Review Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst body = $json.body || {};\nconst decisionMap = { submitted: \u0027submitted\u0027, review: \u0027review\u0027, reviewed: \u0027review\u0027, publish: \u0027published\u0027, published: \u0027published\u0027, archive: \u0027archived\u0027, archived: \u0027archived\u0027 };\nconst solutionId = body.solutionId || body.solution_id || body.id;\nconst decision = decisionMap[String(body.decision || body.action || \u0027\u0027).toLowerCase()];\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027, token: \u0027\u0027, solutionId: solutionId || \u0027\u0027, decision: decision || \u0027\u0027, projectId: body.projectId || body.project_id || null } }];\n}\nif (!solutionId || !decision) {\n  return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_REVIEW_REQUEST\u0027, message: \u0027solutionId and decision are required\u0027, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), solutionId: solutionId || \u0027\u0027, decision: decision || \u0027\u0027, projectId: body.projectId || body.project_id || null } }];\n}\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), solutionId, decision, projectId: body.projectId || body.project_id || null, reviewNotes: body.reviewNotes || body.review_notes || \u0027\u0027, governanceTags: Array.isArray(body.governanceTags) ? body.governanceTags : [], visibilityOverride: body.visibilityOverride || body.visibility_override || \u0027\u0027, publishedTitle: body.publishedTitle || body.published_title || \u0027\u0027, publishedSummary: body.publishedSummary || body.published_summary || \u0027\u0027 } }];"
}
```

### Respond DI Solution Review

| Field | Value |
| --- | --- |
| Node ID | f5e09166-9e63-4e93-90a8-87c37bc5c1f0 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- DI Solution Review Authorized? -> Respond DI Solution Review (output 1, input 0)
- Map DI Solution Review Success -> Respond DI Solution Review (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_SOLUTION_REVIEW_ERROR\", message: $json.message || \"Unable to review Delivery Intelligence solution\" } }) }}",
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

### Respond DI Solution Review CORS

| Field | Value |
| --- | --- |
| Node ID | 17a4d35a-571e-45df-801f-08b23fa69c1f |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 304 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /di/solutions/review -> Respond DI Solution Review CORS (output 0, input 0)

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
                                                                "value":  "PATCH, OPTIONS"
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

### Update DI Solution Status

| Field | Value |
| --- | --- |
| Node ID | cbeea9e4-0cd6-4e56-bb7a-eef4ca15d34f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert DI Solution Review -> Update DI Solution Status (output 0, input 0)

**Outgoing Connections**

- Update DI Solution Status -> Insert DI Solution Review Audit (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?id=eq.{{ encodeURIComponent($(\"Authorize DI Solution Review\").item.json.solutionId || \"00000000-0000-0000-0000-000000000000\") }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($(\"Authorize DI Solution Review\").item.json.solutionPatch || {}) }}",
    "options":  {

                }
}
```

### Verify Review Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 62da8e79-c0bb-46b7-b892-2fdf3c75328a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Solution Review Request -> Verify Review Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Review Supabase Auth User -> Fetch Review Q-Ops User Profile (output 0, input 0)

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
