# Q-Ops Agent User Project Assignments API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | SqF2eOhsuBrtyCtD |
| Active | True |
| Created At | 2026-05-08T05:22:04.205Z |
| Updated At | 2026-05-08T05:26:38.511Z |
| Node Count | 13 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent User Project Assignments API.json |

## Description

PATCH /webhook/users/project-assignments endpoint. Requires an active admin JWT, replaces a registered userâ€™s qops_project_members rows, and writes qops_audit_events.

## Trigger And Entry Contract

- PATCH /users/project-assignments | n8n-nodes-base.webhook | PATCH | users/project-assignments
- Respond Assignment Success | n8n-nodes-base.respondToWebhook
- Reject Assignment Update | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- PATCH /webhook/users/project-assignments

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- PATCH /users/project-assignments -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Current Q-Ops Admin (source output 0, target input 0)
- Fetch Current Q-Ops Admin -> Fetch Target Q-Ops User (source output 0, target input 0)
- Fetch Target Q-Ops User -> Fetch Projects (source output 0, target input 0)
- Fetch Projects -> Prepare Project Assignments (source output 0, target input 0)
- Prepare Project Assignments -> Is Authorized Assignment Update (source output 0, target input 0)
- Is Authorized Assignment Update -> Delete Existing Project Assignments (source output 0, target input 0)
- Is Authorized Assignment Update -> Reject Assignment Update (source output 1, target input 0)
- Delete Existing Project Assignments -> Has Project Assignments (source output 0, target input 0)
- Has Project Assignments -> Insert Project Assignments (source output 0, target input 0)
- Has Project Assignments -> Insert Assignment Audit Event (source output 1, target input 0)
- Insert Project Assignments -> Insert Assignment Audit Event (source output 0, target input 0)
- Insert Assignment Audit Event -> Respond Assignment Success (source output 0, target input 0)

## Nodes

### Delete Existing Project Assignments

| Field | Value |
| --- | --- |
| Node ID | 4d8d9cf2-f022-4aed-8a80-bf93822a8e0a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized Assignment Update -> Delete Existing Project Assignments (output 0, input 0)

**Outgoing Connections**

- Delete Existing Project Assignments -> Has Project Assignments (output 0, input 0)

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
    "method":  "DELETE",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ encodeURIComponent($json.target.id) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "options":  {

                }
}
```

### Fetch Current Q-Ops Admin

| Field | Value |
| --- | --- |
| Node ID | 93d0eb12-19c8-4028-9915-63757886da85 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 176 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops Admin (output 0, input 0)

**Outgoing Connections**

- Fetch Current Q-Ops Admin -> Fetch Target Q-Ops User (output 0, input 0)

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
                                                   "value":  "=({{ $json.id ? \"auth_user_id.eq.\" + $json.id + \",email.eq.\" + $json.email : \"email.eq.__missing__\" }})"
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

### Fetch Projects

| Field | Value |
| --- | --- |
| Node ID | 4ef8bbf1-3859-44b7-84f3-0e17378c166f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 176 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Target Q-Ops User -> Fetch Projects (output 0, input 0)

**Outgoing Connections**

- Fetch Projects -> Prepare Project Assignments (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,name,status"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "name.asc"
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

### Fetch Target Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 3476f7a0-2f8e-477a-9576-e0ff0c03d014 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 176 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Q-Ops Admin -> Fetch Target Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Fetch Target Q-Ops User -> Fetch Projects (output 0, input 0)

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
                                                   "value":  "id,email,name,role,status"
                                               },
                                               {
                                                   "name":  "id",
                                                   "value":  "=eq.{{ encodeURIComponent($(\"PATCH /users/project-assignments\").first().json.body.userId || $(\"PATCH /users/project-assignments\").first().json.body.id || \"\") }}"
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

### Has Project Assignments

| Field | Value |
| --- | --- |
| Node ID | 7928699c-56d7-4209-a899-b5f33b67f2fe |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1792, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Delete Existing Project Assignments -> Has Project Assignments (output 0, input 0)

**Outgoing Connections**

- Has Project Assignments -> Insert Project Assignments (output 0, input 0)
- Has Project Assignments -> Insert Assignment Audit Event (output 1, input 0)

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
                                       "typeValidation":  "loose",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "hasAssignments",
                                              "leftValue":  "={{ $(\"Prepare Project Assignments\").first().json.hasAssignments }}",
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
    "looseTypeValidation":  true,
    "options":  {

                }
}
```

### Insert Assignment Audit Event

| Field | Value |
| --- | --- |
| Node ID | 0b0a880b-497a-41f6-a08a-abefd4db43e1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Has Project Assignments -> Insert Assignment Audit Event (output 1, input 0)
- Insert Project Assignments -> Insert Assignment Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert Assignment Audit Event -> Respond Assignment Success (output 0, input 0)

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
    "jsonBody":  "={{ $(\"Prepare Project Assignments\").first().json.audit }}",
    "options":  {

                }
}
```

### Insert Project Assignments

| Field | Value |
| --- | --- |
| Node ID | 9c44777a-9cd9-40e5-84e6-7c3bc1c2376b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Has Project Assignments -> Insert Project Assignments (output 0, input 0)

**Outgoing Connections**

- Insert Project Assignments -> Insert Assignment Audit Event (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $(\"Prepare Project Assignments\").first().json.assignments }}",
    "options":  {

                }
}
```

### Is Authorized Assignment Update

| Field | Value |
| --- | --- |
| Node ID | 0f1573af-158b-4b6f-b1fa-a3a52cdf8dd9 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 1344, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Project Assignments -> Is Authorized Assignment Update (output 0, input 0)

**Outgoing Connections**

- Is Authorized Assignment Update -> Delete Existing Project Assignments (output 0, input 0)
- Is Authorized Assignment Update -> Reject Assignment Update (output 1, input 0)

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
                                       "typeValidation":  "loose",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "authorized",
                                              "leftValue":  "={{ $json.authorized }}",
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
    "looseTypeValidation":  true,
    "options":  {

                }
}
```

### PATCH /users/project-assignments

| Field | Value |
| --- | --- |
| Node ID | 0e349bfc-16b2-4eae-9298-b166bc596707 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- PATCH /users/project-assignments -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "PATCH",
    "path":  "users/project-assignments",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Project Assignments

| Field | Value |
| --- | --- |
| Node ID | e38e4970-6f5b-4002-8662-e111678c7840 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 176 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Projects -> Prepare Project Assignments (output 0, input 0)

**Outgoing Connections**

- Prepare Project Assignments -> Is Authorized Assignment Update (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst admin = $items(\u0027Fetch Current Q-Ops Admin\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nconst target = $items(\u0027Fetch Target Q-Ops User\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nconst body = $(\u0027PATCH /users/project-assignments\u0027).first().json.body || {};\nconst rawAssignments = Array.isArray(body.projectAssignments) ? body.projectAssignments : Array.isArray(body.projects) ? body.projects : [];\nconst projectMap = new Map($items(\u0027Fetch Projects\u0027).map(i =\u003e i.json).filter(p =\u003e p \u0026\u0026 p.id).map(p =\u003e [String(p.id), p]));\nconst normalized = [];\nconst seen = new Set();\nfor (const item of rawAssignments) {\n  const projectId = String(typeof item === \u0027string\u0027 ? item : item.projectId || item.id || \u0027\u0027).trim();\n  if (!projectId || seen.has(projectId)) continue;\n  seen.add(projectId);\n  const role = [\u0027owner\u0027, \u0027editor\u0027, \u0027viewer\u0027].includes(item.role || item.projectRole) ? (item.role || item.projectRole) : \u0027editor\u0027;\n  normalized.push({ project_id: projectId, user_id: String(body.userId || body.id || \u0027\u0027).trim(), project_role: role, updated_at: new Date().toISOString() });\n}\nconst missingProjects = normalized.map(a =\u003e a.project_id).filter(id =\u003e !projectMap.has(id));\nconst authorized = Boolean(auth.id \u0026\u0026 admin \u0026\u0026 admin.role === \u0027admin\u0027 \u0026\u0026 admin.status === \u0027active\u0027 \u0026\u0026 target \u0026\u0026 target.id \u0026\u0026 target.role !== \u0027admin\u0027 \u0026\u0026 missingProjects.length === 0);\nconst message = !auth.id ? \u0027Missing or invalid Supabase Auth token.\u0027 : !admin ? \u0027Authenticated user is not registered in qops_users.\u0027 : admin.role !== \u0027admin\u0027 ? \u0027Admin role is required.\u0027 : admin.status !== \u0027active\u0027 ? \u0027Admin profile is not active.\u0027 : !target ? \u0027Target user was not found.\u0027 : target.role === \u0027admin\u0027 ? \u0027Admin users do not need project assignments.\u0027 : missingProjects.length ? \u0027One or more selected projects no longer exist.\u0027 : \u0027Authorized.\u0027;\nreturn [{ json: { authorized, message, target, admin, assignments: normalized, hasAssignments: normalized.length \u003e 0, projectNames: normalized.map(a =\u003e projectMap.get(a.project_id)?.name || a.project_id), audit: { actor_user_id: admin?.id || null, actor_name: admin?.name || admin?.email || auth.email || \u0027unknown\u0027, action: \u0027USER_PROJECT_ASSIGNMENTS_UPDATED\u0027, entity_type: \u0027qops_user\u0027, entity_id: target?.id || String(body.userId || body.id || \u0027\u0027), status: authorized ? \u0027success\u0027 : \u0027error\u0027, details: authorized ? \u0027Updated project assignments for \u0027 + (target?.email || target?.id) : message, metadata: { source: \u0027ui\u0027, targetUserId: target?.id || null, projectIds: normalized.map(a =\u003e a.project_id), projectRoles: normalized.map(a =\u003e ({ projectId: a.project_id, role: a.project_role })) } } } }];"
}
```

### Reject Assignment Update

| Field | Value |
| --- | --- |
| Node ID | 060e4f14-7cd7-4fba-a007-52d8172ef697 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 272 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized Assignment Update -> Reject Assignment Update (output 1, input 0)

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
    "responseBody":  "={{ { ok: false, error: \"forbidden\", message: $json.message } }}",
    "options":  {
                    "responseCode":  403,
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

### Respond Assignment Success

| Field | Value |
| --- | --- |
| Node ID | d758f746-cd89-486f-953b-f0f24ba9dc13 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2464, 80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Assignment Audit Event -> Respond Assignment Success (output 0, input 0)

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
    "responseBody":  "={{ { ok: true, userId: $(\"Prepare Project Assignments\").first().json.target.id, projectAssignments: $(\"Prepare Project Assignments\").first().json.assignments.map(a =\u003e ({ projectId: a.project_id, role: a.project_role })), projects: $(\"Prepare Project Assignments\").first().json.projectNames, message: \"Project assignments updated.\" } }}",
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
| Node ID | f92cdf07-8f01-4acd-b225-aaaf70e501fa |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 176 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /users/project-assignments -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops Admin (output 0, input 0)

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
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"{{ $json.headers.authorization || $json.headers.Authorization || \"\" }}\" }",
    "options":  {

                }
}
```

