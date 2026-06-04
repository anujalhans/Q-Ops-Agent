# Q-Ops Agent User Password Reset Audit API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | NpD8cnqPE7qAWEpL |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T11:31:37.186Z |
| Updated At | 2026-05-07T11:34:33.536Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent User Password Reset Audit API [NpD8cnqPE7qAWEpL].json |

## Description

POST /webhook/users/password-reset-audit verifies the Supabase bearer token, resolves the active Q-Ops profile, and writes PASSWORD_RESET_COMPLETED to qops_audit_events.

## Trigger And Entry Contract

- POST /users/password-reset-audit | n8n-nodes-base.webhook | POST | users/password-reset-audit
- Respond Password Reset Audit | n8n-nodes-base.respondToWebhook |  | 
- Respond Password Reset Audit | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/users/password-reset-audit

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 3 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{

### Supabase/Data Table Hints

- qops_audit_events
- qops_users

## Connection Graph

- POST /users/password-reset-audit -> Prepare Audit Context (source output 0, target input 0)
- Prepare Audit Context -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User (source output 0, target input 0)
- Fetch Q-Ops User -> Prepare Password Reset Audit Event (source output 0, target input 0)
- Prepare Password Reset Audit Event -> Insert Password Reset Audit Event (source output 0, target input 0)
- Insert Password Reset Audit Event -> Respond Password Reset Audit (source output 0, target input 0)

## Nodes

### Fetch Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | ee0de144-e05f-4020-9741-13fc37f32b0c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Fetch Q-Ops User -> Prepare Password Reset Audit Event (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}\u0026select=id,email,name,role,status",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Insert Password Reset Audit Event

| Field | Value |
| --- | --- |
| Node ID | 212243df-fb47-42ee-9b83-d6fd82a8ff04 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Password Reset Audit Event -> Insert Password Reset Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert Password Reset Audit Event -> Respond Password Reset Audit (output 0, input 0)

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
    "jsonBody":  "={{ $json.audit }}",
    "options":  {

                }
}
```

### POST /users/password-reset-audit

| Field | Value |
| --- | --- |
| Node ID | 50314ec3-2473-4be0-8ee0-d3b4253839b8 |
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

- POST /users/password-reset-audit -> Prepare Audit Context (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "users/password-reset-audit",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Audit Context

| Field | Value |
| --- | --- |
| Node ID | 675e6258-19b2-4fab-b04a-61f78ea134c1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /users/password-reset-audit -> Prepare Audit Context (output 0, input 0)

**Outgoing Connections**

- Prepare Audit Context -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst body = $json.body || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  throw new Error(\u0027Missing bearer token\u0027);\n}\nreturn [{ json: { token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), resetAt: body.resetAt || new Date().toISOString() } }];"
}
```

### Prepare Password Reset Audit Event

| Field | Value |
| --- | --- |
| Node ID | 2f9f5ba0-fb4b-423b-b17e-3a9cb84a7866 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User -> Prepare Password Reset Audit Event (output 0, input 0)

**Outgoing Connections**

- Prepare Password Reset Audit Event -> Insert Password Reset Audit Event (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const authUser = $(\u0027Verify Supabase Auth User\u0027).first().json;\nconst context = $(\u0027Prepare Audit Context\u0027).first().json;\nconst profile = $input.first().json || {};\nif (!profile.id || profile.status !== \u0027active\u0027) {\n  throw new Error(\u0027Active Q-Ops user profile not found\u0027);\n}\nreturn [{ json: {\n  audit: {\n    actor_user_id: profile.id,\n    actor_name: profile.name || profile.email || authUser.email || \u0027Q-Ops user\u0027,\n    action: \u0027PASSWORD_RESET_COMPLETED\u0027,\n    entity_type: \u0027user\u0027,\n    entity_id: profile.id,\n    status: \u0027success\u0027,\n    details: \u0027User completed password reset from Q-Ops Agent UI\u0027,\n    metadata: { source: \u0027ui\u0027, authUserId: authUser.id, email: profile.email || authUser.email || null, role: profile.role || null, resetAt: context.resetAt }\n  },\n  response: { ok: true, userId: profile.id }\n} }];"
}
```

### Respond Password Reset Audit

| Field | Value |
| --- | --- |
| Node ID | b76c2fd3-a18c-4c7a-b202-0a02b1ff9d85 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Password Reset Audit Event -> Respond Password Reset Audit (output 0, input 0)

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
    "responseBody":  "={{ $(\"Prepare Password Reset Audit Event\").first().json.response }}",
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
| Node ID | 6abab1fa-770c-4d92-853e-a604ff9297ce |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Audit Context -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User (output 0, input 0)

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
