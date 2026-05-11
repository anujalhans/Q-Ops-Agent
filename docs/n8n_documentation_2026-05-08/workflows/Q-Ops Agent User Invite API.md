# Q-Ops Agent User Invite API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | W8b32kGweBlEXN6r |
| Active | True |
| Created At | 2026-05-07T07:47:41.380Z |
| Updated At | 2026-05-07T09:45:13.228Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent User Invite API.json |

## Description

POST /webhook/users/invite endpoint. Requires active admin JWT, invites a Supabase Auth user with UI callback redirect query, upserts qops_users, and writes qops_audit_events.

## Trigger And Entry Contract

- POST /users/invite | n8n-nodes-base.webhook | POST | users/invite
- Respond Invite Success | n8n-nodes-base.respondToWebhook
- Reject Invite Request | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/users/invite

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- POST /users/invite -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Current Q-Ops User (source output 0, target input 0)
- Fetch Current Q-Ops User -> Prepare Invite Request (source output 0, target input 0)
- Prepare Invite Request -> Is Authorized Admin Invite (source output 0, target input 0)
- Is Authorized Admin Invite -> Invite Supabase Auth User (source output 0, target input 0)
- Is Authorized Admin Invite -> Reject Invite Request (source output 1, target input 0)
- Invite Supabase Auth User -> Build Q-Ops User Upsert (source output 0, target input 0)
- Build Q-Ops User Upsert -> Upsert Q-Ops User (source output 0, target input 0)
- Upsert Q-Ops User -> Insert User Invite Audit Event (source output 0, target input 0)
- Insert User Invite Audit Event -> Respond Invite Success (source output 0, target input 0)

## Nodes

### Build Q-Ops User Upsert

| Field | Value |
| --- | --- |
| Node ID | e83740db-cadb-4f49-811f-64d588b09163 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Invite Supabase Auth User -> Build Q-Ops User Upsert (output 0, input 0)

**Outgoing Connections**

- Build Q-Ops User Upsert -> Upsert Q-Ops User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const prepared = $(\u0027Prepare Invite Request\u0027).first().json;\nconst invited = $(\u0027Invite Supabase Auth User\u0027).first().json || {};\nconst payload = { ...prepared.qopsUser, auth_user_id: invited.id || null };\nreturn [{ json: { payload, audit: { ...prepared.audit, entity_id: invited.id || prepared.qopsUser.email, metadata: { ...prepared.audit.metadata, authUserId: invited.id || null } }, response: { ok: true, invited: { ...payload, id: invited.id || null } } } }];"
}
```

### Fetch Current Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | ebe4f857-7f24-404c-a194-c470dc9d68c2 |
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

- Fetch Current Q-Ops User -> Prepare Invite Request (output 0, input 0)

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

### Insert User Invite Audit Event

| Field | Value |
| --- | --- |
| Node ID | 734d5e18-db3f-4b9d-a08d-b4b71237dc12 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upsert Q-Ops User -> Insert User Invite Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert User Invite Audit Event -> Respond Invite Success (output 0, input 0)

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
    "jsonBody":  "={{ $(\"Build Q-Ops User Upsert\").first().json.audit }}",
    "options":  {

                }
}
```

### Invite Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 8dfd7eee-4f29-45d7-a586-57ac4286dd7d |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized Admin Invite -> Invite Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Invite Supabase Auth User -> Build Q-Ops User Upsert (output 0, input 0)

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
    "url":  "={{ \"https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/invite?redirect_to=\" + encodeURIComponent($json.invite.redirect_to) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ { email: $json.invite.email, data: $json.invite.data } }}",
    "options":  {

                }
}
```

### Is Authorized Admin Invite

| Field | Value |
| --- | --- |
| Node ID | a3d97d8b-a45a-4866-bf89-c43986d32659 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Invite Request -> Is Authorized Admin Invite (output 0, input 0)

**Outgoing Connections**

- Is Authorized Admin Invite -> Invite Supabase Auth User (output 0, input 0)
- Is Authorized Admin Invite -> Reject Invite Request (output 1, input 0)

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

### POST /users/invite

| Field | Value |
| --- | --- |
| Node ID | c07379c7-d090-462b-8243-a9148cde428c |
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

- POST /users/invite -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "users/invite",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Invite Request

| Field | Value |
| --- | --- |
| Node ID | 690f8a06-bec6-42cf-91f8-aa56b27afeeb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Q-Ops User -> Prepare Invite Request (output 0, input 0)

**Outgoing Connections**

- Prepare Invite Request -> Is Authorized Admin Invite (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst admin = $items(\u0027Fetch Current Q-Ops User\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nconst body = $(\u0027POST /users/invite\u0027).first().json.body || {};\nconst email = String(body.email || \u0027\u0027).trim().toLowerCase();\nconst role = body.role === \u0027admin\u0027 ? \u0027admin\u0027 : \u0027registered_user\u0027;\nconst status = \u0027pending_invite\u0027;\nconst name = String(body.name || email.split(\u0027@\u0027)[0] || \u0027Invited User\u0027).trim();\nconst title = String(body.title || \u0027\u0027).trim() || null;\nconst redirectTo = String(body.redirectTo || body.redirect_to || \u0027http://127.0.0.1:5175/auth/callback\u0027).trim();\nconst authorized = Boolean(auth.id \u0026\u0026 admin \u0026\u0026 admin.role === \u0027admin\u0027 \u0026\u0026 admin.status === \u0027active\u0027 \u0026\u0026 email);\nconst message = !auth.id ? \u0027Missing or invalid Supabase Auth token.\u0027 : !admin ? \u0027Authenticated user is not registered in qops_users.\u0027 : admin.role !== \u0027admin\u0027 ? \u0027Admin role is required.\u0027 : admin.status !== \u0027active\u0027 ? \u0027Admin profile is not active.\u0027 : !email ? \u0027Email is required.\u0027 : \u0027Authorized.\u0027;\nreturn [{ json: { authorized, message, auth, admin, invite: { email, redirect_to: redirectTo, data: { full_name: name, qops_role: role } }, qopsUser: { email, name, title, role, status, updated_at: new Date().toISOString() }, audit: { actor_user_id: admin?.id || null, actor_name: admin?.name || admin?.email || auth.email || \u0027unknown\u0027, action: \u0027USER_INVITED\u0027, entity_type: \u0027qops_user\u0027, entity_id: email, status: authorized ? \u0027success\u0027 : \u0027error\u0027, details: authorized ? `Invited ${email} as ${role}` : message, metadata: { source: \u0027ui\u0027, email, role, redirectTo } } } }];"
}
```

### Reject Invite Request

| Field | Value |
| --- | --- |
| Node ID | c29eafca-b467-4415-bb6d-c353ef841fc6 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Authorized Admin Invite -> Reject Invite Request (output 1, input 0)

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

### Respond Invite Success

| Field | Value |
| --- | --- |
| Node ID | e7dd96a8-49ed-42ae-9c8e-aaa8da8beb74 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert User Invite Audit Event -> Respond Invite Success (output 0, input 0)

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
    "responseBody":  "={{ { ok: true, user: $(\"Upsert Q-Ops User\").first().json, message: \"User invitation created.\" } }}",
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

### Upsert Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 25aa6de8-ba57-46b9-b154-569a8dfe715f |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Q-Ops User Upsert -> Upsert Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Upsert Q-Ops User -> Insert User Invite Audit Event (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?on_conflict=email",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"resolution=merge-duplicates,return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.payload }}",
    "options":  {

                }
}
```

### Verify Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | d87fd99c-7f2c-4b8c-9339-c836b368b383 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /users/invite -> Verify Supabase Auth User (output 0, input 0)

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

