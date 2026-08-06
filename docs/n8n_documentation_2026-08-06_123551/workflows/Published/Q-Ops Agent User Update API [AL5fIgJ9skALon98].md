# Q-Ops Agent User Update API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | AL5fIgJ9skALon98 |
| Active | True |
| Created At | 2026-05-07T07:48:13.305Z |
| Updated At | 2026-05-07T07:51:50.627Z |
| Node Count | 9 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent User Update API [AL5fIgJ9skALon98].json |

## Description

Draft PATCH /webhook/users/update endpoint. Requires active admin JWT, updates qops_users role/status/profile fields, and writes qops_audit_events.

## Trigger And Entry Contract

- PATCH /users/update | n8n-nodes-base.webhook | PATCH | users/update
- Respond User Update Success | n8n-nodes-base.respondToWebhook
- Reject User Update Request | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- PATCH /webhook/users/update

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- PATCH /users/update -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Current Q-Ops User (source output 0, target input 0)
- Fetch Current Q-Ops User -> Prepare User Update Request (source output 0, target input 0)
- Prepare User Update Request -> Is Authorized User Update (source output 0, target input 0)
- Is Authorized User Update -> Patch Q-Ops User (source output 0, target input 0)
- Is Authorized User Update -> Reject User Update Request (source output 1, target input 0)
- Patch Q-Ops User -> Insert User Update Audit Event (source output 0, target input 0)
- Insert User Update Audit Event -> Respond User Update Success (source output 0, target input 0)

## Nodes

### Fetch Current Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 0cb84f87-33a2-4660-bc28-9c59e6477667 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Fetch Current Q-Ops User -> Prepare User Update Request (output 0, input 0)

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

### Insert User Update Audit Event

| Field | Value |
| --- | --- |
| Node ID | 83263ae8-ea23-48cc-a13a-cb07883c54c5 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Patch Q-Ops User -> Insert User Update Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert User Update Audit Event -> Respond User Update Success (output 0, input 0)

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
    "jsonBody":  "={{ $(\"Prepare User Update Request\").first().json.audit }}",
    "options":  {

                }
}
```

### Is Authorized User Update

| Field | Value |
| --- | --- |
| Node ID | 50d85aad-2d02-4f68-9fb2-8deaf91a9a11 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare User Update Request -> Is Authorized User Update (output 0, input 0)

**Outgoing Connections**

- Is Authorized User Update -> Patch Q-Ops User (output 0, input 0)
- Is Authorized User Update -> Reject User Update Request (output 1, input 0)

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

### PATCH /users/update

| Field | Value |
| --- | --- |
| Node ID | f7e4262a-3765-41c7-9758-b4c3fb1df403 |
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

- PATCH /users/update -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "PATCH",
    "path":  "users/update",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Patch Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 2c035e11-3b2a-4a4c-852e-db50adc0d110 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized User Update -> Patch Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Patch Q-Ops User -> Insert User Update Audit Event (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.{{ encodeURIComponent($json.userId) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.payload }}",
    "options":  {

                }
}
```

### Prepare User Update Request

| Field | Value |
| --- | --- |
| Node ID | 5bc06c0a-03ac-4bdb-a84e-37fc0f06d996 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Q-Ops User -> Prepare User Update Request (output 0, input 0)

**Outgoing Connections**

- Prepare User Update Request -> Is Authorized User Update (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst admin = $items(\u0027Fetch Current Q-Ops User\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nconst body = $(\u0027PATCH /users/update\u0027).first().json.body || {};\nconst userId = String(body.userId || body.id || \u0027\u0027).trim();\nconst payload = { updated_at: new Date().toISOString() };\nif (body.name !== undefined) payload.name = String(body.name || \u0027\u0027).trim();\nif (body.title !== undefined) payload.title = String(body.title || \u0027\u0027).trim() || null;\nif (body.role !== undefined) payload.role = body.role === \u0027admin\u0027 ? \u0027admin\u0027 : \u0027registered_user\u0027;\nif (body.status !== undefined) payload.status = [\u0027active\u0027, \u0027pending_invite\u0027, \u0027disabled\u0027].includes(body.status) ? body.status : \u0027active\u0027;\nconst changedKeys = Object.keys(payload).filter(k =\u003e k !== \u0027updated_at\u0027);\nconst authorized = Boolean(auth.id \u0026\u0026 admin \u0026\u0026 admin.role === \u0027admin\u0027 \u0026\u0026 admin.status === \u0027active\u0027 \u0026\u0026 userId \u0026\u0026 changedKeys.length);\nconst message = !auth.id ? \u0027Missing or invalid Supabase Auth token.\u0027 : !admin ? \u0027Authenticated user is not registered in qops_users.\u0027 : admin.role !== \u0027admin\u0027 ? \u0027Admin role is required.\u0027 : admin.status !== \u0027active\u0027 ? \u0027Admin profile is not active.\u0027 : !userId ? \u0027userId is required.\u0027 : !changedKeys.length ? \u0027No supported user fields were provided.\u0027 : \u0027Authorized.\u0027;\nreturn [{ json: { authorized, message, userId, payload, audit: { actor_user_id: admin?.id || null, actor_name: admin?.name || admin?.email || auth.email || \u0027unknown\u0027, action: \u0027USER_UPDATED\u0027, entity_type: \u0027qops_user\u0027, entity_id: userId, status: authorized ? \u0027success\u0027 : \u0027error\u0027, details: authorized ? `Updated user ${userId}` : message, metadata: { source: \u0027ui\u0027, userId, changedKeys } } } }];"
}
```

### Reject User Update Request

| Field | Value |
| --- | --- |
| Node ID | 74e4e216-71f4-4447-a835-12e36c20322c |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized User Update -> Reject User Update Request (output 1, input 0)

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

### Respond User Update Success

| Field | Value |
| --- | --- |
| Node ID | ab7dd038-af15-4045-80ee-4e1f6fcd5c79 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert User Update Audit Event -> Respond User Update Success (output 0, input 0)

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
    "responseBody":  "={{ { ok: true, user: $(\"Patch Q-Ops User\").first().json, message: \"User updated.\" } }}",
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
| Node ID | fd2b0bfd-5812-46b8-bb02-d11ffa4055c4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /users/update -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops User (output 0, input 0)

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
