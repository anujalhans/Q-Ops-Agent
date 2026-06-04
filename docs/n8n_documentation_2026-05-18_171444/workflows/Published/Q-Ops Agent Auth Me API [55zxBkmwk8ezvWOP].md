# Q-Ops Agent Auth Me API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 55zxBkmwk8ezvWOP |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T07:16:43.522Z |
| Updated At | 2026-05-08T05:41:43.010Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent Auth Me API [55zxBkmwk8ezvWOP].json |

## Description

GET /webhook/me endpoint. Verifies Supabase Auth JWTs, maps the session to qops_users, and returns current role plus assigned project memberships for registered users.

## Trigger And Entry Contract

- GET /me | n8n-nodes-base.webhook | GET | me
- Respond Current User | n8n-nodes-base.respondToWebhook |  | 
- Respond Current User | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET /webhook/me

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 3 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users

### Supabase/Data Table Hints

- qops_project_members
- qops_users

## Connection Graph

- GET /me -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Q-Ops User Profile (source output 0, target input 0)
- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (source output 0, target input 0)
- Fetch Current User Project Memberships -> Map Current User Response (source output 0, target input 0)
- Map Current User Response -> Respond Current User (source output 0, target input 0)

## Nodes

### Fetch Current User Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 911a52de-3804-48a9-8b52-cab2f19bb204 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops User Profile -> Fetch Current User Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Current User Project Memberships -> Map Current User Response (output 0, input 0)

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
    "method":  "GET",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "project_id,project_role"
                                               },
                                               {
                                                   "name":  "user_id",
                                                   "value":  "=eq.{{ encodeURIComponent($json.id || \"00000000-0000-0000-0000-000000000000\") }}"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "updated_at.desc"
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
| Node ID | 3a407d3c-6bca-495e-8d66-bcae706177ee |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
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
    "method":  "GET",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,auth_user_id,email,name,title,avatar_url,role,status,last_login_at,created_at,updated_at"
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

### GET /me

| Field | Value |
| --- | --- |
| Node ID | 97efeafc-b505-4ed8-8a44-03ff4ad7d717 |
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

- GET /me -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "GET",
    "path":  "me",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Current User Response

| Field | Value |
| --- | --- |
| Node ID | 75757d7a-6907-43d3-9f87-a221c3af857d |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current User Project Memberships -> Map Current User Response (output 0, input 0)

**Outgoing Connections**

- Map Current User Response -> Respond Current User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst profiles = $items(\u0027Fetch Q-Ops User Profile\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id);\nconst profile = profiles[0];\nif (!auth.id) return [{ json: { ok: false, error: \u0027unauthorized\u0027, message: \u0027Missing or invalid Supabase Auth token.\u0027 } }];\nif (!profile) return [{ json: { ok: false, error: \u0027profile_not_found\u0027, message: \u0027Authenticated user is not registered in qops_users.\u0027 } }];\nconst memberships = $items(\u0027Fetch Current User Project Memberships\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.project_id);\nconst projectRoles = profile.role === \u0027admin\u0027 ? [] : memberships.map(r =\u003e ({ projectId: r.project_id, role: r.project_role || \u0027viewer\u0027 }));\nconst projects = profile.role === \u0027admin\u0027 ? [\u0027All projects\u0027] : projectRoles.map(r =\u003e r.projectId);\nconst permissions = profile.role === \u0027admin\u0027 ? [\u0027users:read\u0027, \u0027users:invite\u0027, \u0027users:update\u0027, \u0027settings:write\u0027, \u0027projects:read\u0027, \u0027projects:write\u0027] : [\u0027settings:read\u0027, \u0027projects:read\u0027];\nreturn [{ json: { id: profile.id, authUserId: profile.auth_user_id || auth.id, email: profile.email || auth.email, name: profile.name || auth.email, title: profile.title, avatarUrl: profile.avatar_url, role: profile.role, status: profile.status, lastLoginAt: profile.last_login_at, permissions, projects, projectRoles } }];"
}
```

### Respond Current User

| Field | Value |
| --- | --- |
| Node ID | be9e54cd-f599-4149-875f-2201b9f208ce |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Current User Response -> Respond Current User (output 0, input 0)

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
| Node ID | 561d2eaa-5a10-4420-b5ea-572446e28c03 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /me -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Q-Ops User Profile (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "GET",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"{{ $json.headers.authorization || $json.headers.Authorization || $json.headers.Authorization || \"\" }}\" }",
    "options":  {

                }
}
```
