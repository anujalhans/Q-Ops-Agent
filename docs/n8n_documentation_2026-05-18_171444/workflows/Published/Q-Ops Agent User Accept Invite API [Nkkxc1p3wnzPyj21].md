# Q-Ops Agent User Accept Invite API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | Nkkxc1p3wnzPyj21 |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T08:31:47.502Z |
| Updated At | 2026-05-07T09:34:39.623Z |
| Node Count | 9 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent User Accept Invite API [Nkkxc1p3wnzPyj21].json |

## Description

POST /webhook/users/accept-invite endpoint. Verifies the invite session JWT, activates the matching qops_users profile, and writes a USER_INVITE_ACCEPTED audit event.

## Trigger And Entry Contract

- POST /users/accept-invite | n8n-nodes-base.webhook | POST | users/accept-invite
- Respond Accept Invite Success | n8n-nodes-base.respondToWebhook |  | 
- Respond Accept Invite Success | n8n-nodes-base.respondToWebhook
- Reject Accept Invite | n8n-nodes-base.respondToWebhook |  | 
- Reject Accept Invite | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/users/accept-invite

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

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.\

### Supabase/Data Table Hints

- qops_audit_events
- qops_user
- qops_users

## Connection Graph

- POST /users/accept-invite -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Invited Q-Ops User (source output 0, target input 0)
- Fetch Invited Q-Ops User -> Prepare Accept Invite (source output 0, target input 0)
- Prepare Accept Invite -> Is Valid Invite Acceptance (source output 0, target input 0)
- Is Valid Invite Acceptance -> Activate Q-Ops User (source output 0, target input 0)
- Is Valid Invite Acceptance -> Reject Accept Invite (source output 1, target input 0)
- Activate Q-Ops User -> Insert Invite Accepted Audit Event (source output 0, target input 0)
- Insert Invite Accepted Audit Event -> Respond Accept Invite Success (source output 0, target input 0)

## Nodes

### Activate Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 0871f6ae-b7b2-48a0-aa04-3699c2c5eec7 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Valid Invite Acceptance -> Activate Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Activate Q-Ops User -> Insert Invite Accepted Audit Event (output 0, input 0)

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
    "url":  "={{ \"https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?id=eq.\" + $json.user.id }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.patch }}",
    "options":  {

                }
}
```

### Fetch Invited Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 1ef76612-cc06-48d8-9900-6c2c2dbacb14 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Invited Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Fetch Invited Q-Ops User -> Prepare Accept Invite (output 0, input 0)

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
                                                   "value":  "id,auth_user_id,email,name,title,role,status"
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

### Insert Invite Accepted Audit Event

| Field | Value |
| --- | --- |
| Node ID | 00ac9971-5fb2-4eee-b7a2-be4885e7d488 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Activate Q-Ops User -> Insert Invite Accepted Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert Invite Accepted Audit Event -> Respond Accept Invite Success (output 0, input 0)

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
    "jsonBody":  "={{ $(\"Prepare Accept Invite\").first().json.audit }}",
    "options":  {

                }
}
```

### Is Valid Invite Acceptance

| Field | Value |
| --- | --- |
| Node ID | 129a5a85-7354-40da-97aa-3a7680d5a288 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Accept Invite -> Is Valid Invite Acceptance (output 0, input 0)

**Outgoing Connections**

- Is Valid Invite Acceptance -> Activate Q-Ops User (output 0, input 0)
- Is Valid Invite Acceptance -> Reject Accept Invite (output 1, input 0)

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

### POST /users/accept-invite

| Field | Value |
| --- | --- |
| Node ID | 6f0b181c-0491-496f-abd4-11ac9378052b |
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

- POST /users/accept-invite -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "users/accept-invite",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Accept Invite

| Field | Value |
| --- | --- |
| Node ID | d80ad1ae-229a-4f7b-9d9a-4375384d163a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Invited Q-Ops User -> Prepare Accept Invite (output 0, input 0)

**Outgoing Connections**

- Prepare Accept Invite -> Is Valid Invite Acceptance (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst user = $items(\u0027Fetch Invited Q-Ops User\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nconst authorized = Boolean(auth.id \u0026\u0026 auth.email \u0026\u0026 user \u0026\u0026 user.status !== \u0027disabled\u0027);\nconst message = !auth.id ? \u0027Missing or invalid Supabase Auth token.\u0027 : !user ? \u0027No matching Q-Ops invited user profile exists.\u0027 : user.status === \u0027disabled\u0027 ? \u0027This Q-Ops user profile is disabled.\u0027 : \u0027Authorized.\u0027;\nconst now = new Date().toISOString();\nreturn [{ json: { authorized, message, auth, user, patch: { auth_user_id: auth.id, status: \u0027active\u0027, updated_at: now, last_login_at: now }, audit: { actor_user_id: user?.id || null, actor_name: user?.name || user?.email || auth.email || \u0027unknown\u0027, action: \u0027USER_INVITE_ACCEPTED\u0027, entity_type: \u0027qops_user\u0027, entity_id: user?.id || auth.email || \u0027unknown\u0027, status: authorized ? \u0027success\u0027 : \u0027error\u0027, details: authorized ? `Accepted invite for ${user.email}` : message, metadata: { source: \u0027ui\u0027, email: auth.email || null, authUserId: auth.id || null } } } }];"
}
```

### Reject Accept Invite

| Field | Value |
| --- | --- |
| Node ID | e2ade643-3c8a-4cd6-a464-3eb2c78aeda2 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Is Valid Invite Acceptance -> Reject Accept Invite (output 1, input 0)

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

### Respond Accept Invite Success

| Field | Value |
| --- | --- |
| Node ID | 5abb4b1a-d161-4a2f-a2f5-caf479b716b0 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Invite Accepted Audit Event -> Respond Accept Invite Success (output 0, input 0)

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
    "responseBody":  "={{ { ok: true, user: $(\"Activate Q-Ops User\").first().json, message: \"Invite accepted.\" } }}",
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
| Node ID | 55744c1a-e386-4335-942a-ea61d5be61bd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /users/accept-invite -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Invited Q-Ops User (output 0, input 0)

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
