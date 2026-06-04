# DI - Recommendation Feedback API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | pbxli3DNK16tIhOe |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T10:42:41.059Z |
| Updated At | 2026-05-11T10:45:07.729Z |
| Node Count | 16 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\DI - Recommendation Feedback API [pbxli3DNK16tIhOe].json |

## Description

Authenticated PATCH /webhook/di/recommendations/feedback endpoint to update DI recommendation feedback/status and audit the action.

## Trigger And Entry Contract

- PATCH /di/recommendations/feedback | n8n-nodes-base.webhook | PATCH | di/recommendations/feedback
- Respond DI Feedback | n8n-nodes-base.respondToWebhook |  | 
- Respond DI Feedback | n8n-nodes-base.respondToWebhook
- OPTIONS /di/recommendations/feedback | n8n-nodes-base.webhook | OPTIONS | di/recommendations/feedback
- Respond DI Feedback CORS | n8n-nodes-base.respondToWebhook |  | 
- Respond DI Feedback CORS | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- PATCH /webhook/di/recommendations/feedback
- OPTIONS /webhook/di/recommendations/feedback

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 6 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.stickyNote | 1 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{

### Supabase/Data Table Hints

- di_recommendation
- di_recommendations
- qops_audit_events
- qops_project_members
- qops_users

## Connection Graph

- PATCH /di/recommendations/feedback -> Prepare DI Feedback Request (source output 0, target input 0)
- Prepare DI Feedback Request -> Valid DI Feedback Request? (source output 0, target input 0)
- Valid DI Feedback Request? -> Verify Feedback Supabase Auth User (source output 0, target input 0)
- Valid DI Feedback Request? -> Respond DI Feedback (source output 1, target input 0)
- Verify Feedback Supabase Auth User -> Fetch Feedback Q-Ops User Profile (source output 0, target input 0)
- Fetch Feedback Q-Ops User Profile -> Fetch DI Recommendation For Feedback (source output 0, target input 0)
- Fetch DI Recommendation For Feedback -> Fetch Feedback Project Memberships (source output 0, target input 0)
- Fetch Feedback Project Memberships -> Authorize DI Feedback (source output 0, target input 0)
- Authorize DI Feedback -> DI Feedback Authorized? (source output 0, target input 0)
- DI Feedback Authorized? -> Update DI Recommendation Feedback (source output 0, target input 0)
- DI Feedback Authorized? -> Respond DI Feedback (source output 1, target input 0)
- Update DI Recommendation Feedback -> Insert DI Feedback Audit Event (source output 0, target input 0)
- Insert DI Feedback Audit Event -> Map DI Feedback Success (source output 0, target input 0)
- Map DI Feedback Success -> Respond DI Feedback (source output 0, target input 0)
- OPTIONS /di/recommendations/feedback -> Respond DI Feedback CORS (source output 0, target input 0)

## Nodes

### Authorize DI Feedback

| Field | Value |
| --- | --- |
| Node ID | 904d3d08-0a2d-4c04-a186-affd2c18b5af |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Feedback Project Memberships -> Authorize DI Feedback (output 0, input 0)

**Outgoing Connections**

- Authorize DI Feedback -> DI Feedback Authorized? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Feedback Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Feedback Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nconst rawRec = $(\u0027Fetch DI Recommendation For Feedback\u0027).first().json;\nconst rec = Array.isArray(rawRec) ? rawRec[0] : rawRec;\nconst req = $(\u0027Prepare DI Feedback Request\u0027).first().json;\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nif (!rec?.id) return [{ json: { ok: false, statusCode: 404, errorCode: \u0027RECOMMENDATION_NOT_FOUND\u0027, message: \u0027Recommendation not found\u0027 } }];\nconst memberships = $items(\u0027Fetch Feedback Project Memberships\u0027).map(i =\u003e i.json.project_id).filter(Boolean);\nconst canUpdate = profile.role === \u0027admin\u0027 || rec.assigned_to === profile.id || !rec.project_id || memberships.includes(rec.project_id);\nif (!canUpdate) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027RECOMMENDATION_ACCESS_DENIED\u0027, message: \u0027User cannot update this recommendation\u0027 } }];\nconst previousFeedback = rec.feedback \u0026\u0026 typeof rec.feedback === \u0027object\u0027 ? rec.feedback : {};\nconst patch = { status: req.action, feedback: { ...previousFeedback, lastAction: req.action, comment: req.comment, updatedBy: profile.email, updatedByUserId: profile.id, updatedAt: new Date().toISOString(), details: req.feedback }, updated_at: new Date().toISOString() };\nconst audit = { action: `DI_RECOMMENDATION_${req.action.toUpperCase()}`, entity_type: \u0027di_recommendation\u0027, entity_id: rec.id, project_id: rec.project_id, actor_user_id: profile.id, actor_name: profile.email, status: \u0027success\u0027, details: `${req.action}: ${rec.title}`, metadata: { recommendation_id: rec.id, previous_status: rec.status, new_status: req.action, comment: req.comment } };\nreturn [{ json: { ok: true, recommendationId: rec.id, patch, audit } }];"
}
```

### DI Feedback Authorized?

| Field | Value |
| --- | --- |
| Node ID | 4dc58498-188f-4ead-bba6-d86fdac61ff9 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1792, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Authorize DI Feedback -> DI Feedback Authorized? (output 0, input 0)

**Outgoing Connections**

- DI Feedback Authorized? -> Update DI Recommendation Feedback (output 0, input 0)
- DI Feedback Authorized? -> Respond DI Feedback (output 1, input 0)

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

### Fetch DI Recommendation For Feedback

| Field | Value |
| --- | --- |
| Node ID | 1134b112-122f-4692-bbd6-ab9ae05d9b82 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Feedback Q-Ops User Profile -> Fetch DI Recommendation For Feedback (output 0, input 0)

**Outgoing Connections**

- Fetch DI Recommendation For Feedback -> Fetch Feedback Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?id=eq.{{ encodeURIComponent($(\"Prepare DI Feedback Request\").item.json.recommendationId) }}\u0026select=id,project_id,title,status,assigned_to,feedback\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Feedback Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 6cccee4e-86f2-445d-b0c4-a010002a9da8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Recommendation For Feedback -> Fetch Feedback Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Feedback Project Memberships -> Authorize DI Feedback (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($(\"Fetch Feedback Q-Ops User Profile\").item.json) ? ($(\"Fetch Feedback Q-Ops User Profile\").item.json[0]?.id || \"00000000-0000-0000-0000-000000000000\") : ($(\"Fetch Feedback Q-Ops User Profile\").item.json.id || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Feedback Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 8cdb3f2c-d2fd-46d3-8202-97c00668dbc1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Feedback Supabase Auth User -> Fetch Feedback Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Feedback Q-Ops User Profile -> Fetch DI Recommendation For Feedback (output 0, input 0)

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

### Insert DI Feedback Audit Event

| Field | Value |
| --- | --- |
| Node ID | 6b10756e-f7e5-4f9b-af8c-4402246f1c90 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Update DI Recommendation Feedback -> Insert DI Feedback Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert DI Feedback Audit Event -> Map DI Feedback Success (output 0, input 0)

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
    "jsonBody":  "={{ JSON.stringify($(\"Authorize DI Feedback\").item.json.audit) }}",
    "options":  {

                }
}
```

### Map DI Feedback Success

| Field | Value |
| --- | --- |
| Node ID | f4d0aa75-437b-4d8a-8ae5-47ea95ac0223 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert DI Feedback Audit Event -> Map DI Feedback Success (output 0, input 0)

**Outgoing Connections**

- Map DI Feedback Success -> Respond DI Feedback (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const updated = $(\u0027Update DI Recommendation Feedback\u0027).first().json || {};\nreturn [{ json: { ok: true, recommendationId: updated.id || $(\u0027Authorize DI Feedback\u0027).first().json.recommendationId, status: updated.status || $(\u0027Authorize DI Feedback\u0027).first().json.patch.status } }];"
}
```

### OPTIONS /di/recommendations/feedback

| Field | Value |
| --- | --- |
| Node ID | f18396dc-f27d-41c9-9529-20696c0f4a05 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 368 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- OPTIONS /di/recommendations/feedback -> Respond DI Feedback CORS (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "OPTIONS",
    "path":  "di/recommendations/feedback",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### PATCH /di/recommendations/feedback

| Field | Value |
| --- | --- |
| Node ID | 63c968e1-53bc-4a65-8113-8db5d317022f |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- PATCH /di/recommendations/feedback -> Prepare DI Feedback Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "PATCH",
    "path":  "di/recommendations/feedback",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare DI Feedback Request

| Field | Value |
| --- | --- |
| Node ID | dde06493-953f-4816-aa18-85d9f53093b2 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /di/recommendations/feedback -> Prepare DI Feedback Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Feedback Request -> Valid DI Feedback Request? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst body = $json.body || {};\nconst actionMap = { viewed: \u0027viewed\u0027, accept: \u0027accepted\u0027, accepted: \u0027accepted\u0027, dismiss: \u0027dismissed\u0027, dismissed: \u0027dismissed\u0027, convert: \u0027converted\u0027, converted: \u0027converted\u0027 };\nconst recommendationId = body.recommendationId || body.recommendation_id || body.id;\nconst action = actionMap[String(body.action || \u0027\u0027).toLowerCase()];\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer token\u0027 } }];\nif (!recommendationId || !action) return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_FEEDBACK\u0027, message: \u0027recommendationId and valid action are required\u0027 } }];\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), recommendationId, action, comment: body.comment || body.reason || \u0027\u0027, feedback: body.feedback || {} } }];"
}
```

### Respond DI Feedback

| Field | Value |
| --- | --- |
| Node ID | 71323a77-79fb-4e7c-a3dd-f0ffd355775f |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Feedback Request? -> Respond DI Feedback (output 1, input 0)
- DI Feedback Authorized? -> Respond DI Feedback (output 1, input 0)
- Map DI Feedback Success -> Respond DI Feedback (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_FEEDBACK_ERROR\", message: $json.message || \"Unable to update recommendation feedback\" } }) }}",
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

### Respond DI Feedback CORS

| Field | Value |
| --- | --- |
| Node ID | cac77122-a54f-44f7-a6e4-ec4478153c73 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 368 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /di/recommendations/feedback -> Respond DI Feedback CORS (output 0, input 0)

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

### Sticky Note 4c0fce28

| Field | Value |
| --- | --- |
| Node ID | 6236c48f-de7f-4767-b231-5888401717f8 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1344, 432 |
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
    "content":  "## Delivery Intelligence Recommendation Feedback API\nPATCH /webhook/di/recommendations/feedback records viewed/accepted/dismissed/converted actions on di_recommendations and writes qops_audit_events. Isolated from QA generation.",
    "height":  180,
    "width":  2000,
    "color":  6
}
```

### Update DI Recommendation Feedback

| Field | Value |
| --- | --- |
| Node ID | 148f6590-d67e-471b-a6e5-ecb669937443 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- DI Feedback Authorized? -> Update DI Recommendation Feedback (output 0, input 0)

**Outgoing Connections**

- Update DI Recommendation Feedback -> Insert DI Feedback Audit Event (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?id=eq.{{ encodeURIComponent($json.recommendationId) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify($json.patch) }}",
    "options":  {

                }
}
```

### Valid DI Feedback Request?

| Field | Value |
| --- | --- |
| Node ID | 44d7c8aa-fcb9-41c1-abaf-47e638bb2aff |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 144 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Feedback Request -> Valid DI Feedback Request? (output 0, input 0)

**Outgoing Connections**

- Valid DI Feedback Request? -> Verify Feedback Supabase Auth User (output 0, input 0)
- Valid DI Feedback Request? -> Respond DI Feedback (output 1, input 0)

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

### Verify Feedback Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | de9b7f55-90aa-4436-859e-831ce12aefdf |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Valid DI Feedback Request? -> Verify Feedback Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Feedback Supabase Auth User -> Fetch Feedback Q-Ops User Profile (output 0, input 0)

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
