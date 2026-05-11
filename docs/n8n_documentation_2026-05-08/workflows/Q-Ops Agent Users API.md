# Q-Ops Agent Users API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | vhxA44slh746G1ja |
| Active | True |
| Created At | 2026-05-07T07:17:10.780Z |
| Updated At | 2026-05-07T07:34:43.820Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Users API.json |

## Description

GET /webhook/users endpoint. Verifies Supabase Auth JWTs with the Supabase publishable key, requires active qops_users admin role, and returns sanitized user and project-role data.

## Trigger And Entry Contract

- GET /users | n8n-nodes-base.webhook | GET | users
- Respond Users | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET /webhook/users

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /users -> Verify Supabase Auth User (source output 0, target input 0)
- Verify Supabase Auth User -> Fetch Current Q-Ops User (source output 0, target input 0)
- Fetch Current Q-Ops User -> Fetch Users (source output 0, target input 0)
- Fetch Users -> Fetch Project Memberships (source output 0, target input 0)
- Fetch Project Memberships -> Map Users Response (source output 0, target input 0)
- Map Users Response -> Respond Users (source output 0, target input 0)

## Nodes

### Fetch Current Q-Ops User

| Field | Value |
| --- | --- |
| Node ID | 669a68a0-f1da-4753-b47d-ec56ff891f21 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops User (output 0, input 0)

**Outgoing Connections**

- Fetch Current Q-Ops User -> Fetch Users (output 0, input 0)

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

### Fetch Project Memberships

| Field | Value |
| --- | --- |
| Node ID | c400c168-0223-4e99-be1b-a346a9f3dc25 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Users -> Fetch Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Project Memberships -> Map Users Response (output 0, input 0)

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
                                                   "value":  "user_id,project_id,project_role"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.asc"
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

### Fetch Users

| Field | Value |
| --- | --- |
| Node ID | 05392653-78b1-41d7-b2ad-0beda648053a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Q-Ops User -> Fetch Users (output 0, input 0)

**Outgoing Connections**

- Fetch Users -> Fetch Project Memberships (output 0, input 0)

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
                                                   "name":  "order",
                                                   "value":  "created_at.asc"
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

### GET /users

| Field | Value |
| --- | --- |
| Node ID | 5c1d38d2-8481-470c-8401-d7c4d3eff6c3 |
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

- GET /users -> Verify Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "GET",
    "path":  "users",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Users Response

| Field | Value |
| --- | --- |
| Node ID | 87c6231c-f9ab-494c-a2cd-a1a42508f1f0 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Project Memberships -> Map Users Response (output 0, input 0)

**Outgoing Connections**

- Map Users Response -> Respond Users (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const auth = $(\u0027Verify Supabase Auth User\u0027).first().json || {};\nconst current = $items(\u0027Fetch Current Q-Ops User\u0027).map(i =\u003e i.json).find(r =\u003e r \u0026\u0026 r.id);\nif (!auth.id) return [{ json: { ok: false, error: \u0027unauthorized\u0027, users: [] } }];\nif (!current || current.status !== \u0027active\u0027) return [{ json: { ok: false, error: \u0027profile_not_active\u0027, users: [] } }];\nif (current.role !== \u0027admin\u0027) return [{ json: { ok: false, error: \u0027forbidden\u0027, users: [] } }];\nconst memberships = $items(\u0027Fetch Project Memberships\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.user_id);\nconst users = $items(\u0027Fetch Users\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.id).map(user =\u003e {\n  const scoped = memberships.filter(member =\u003e member.user_id === user.id);\n  return {\n    id: user.id,\n    authUserId: user.auth_user_id,\n    email: user.email,\n    name: user.name || user.email,\n    title: user.title,\n    avatarUrl: user.avatar_url,\n    role: user.role,\n    status: user.status,\n    lastLoginAt: user.last_login_at,\n    createdAt: user.created_at,\n    updatedAt: user.updated_at,\n    projects: user.role === \u0027admin\u0027 ? [\u0027All projects\u0027] : scoped.map(member =\u003e member.project_id),\n    projectRoles: scoped.map(member =\u003e ({ projectId: member.project_id, role: member.project_role }))\n  };\n});\nreturn [{ json: { users } }];"
}
```

### Respond Users

| Field | Value |
| --- | --- |
| Node ID | 4f78047a-b1df-499b-9427-92c0945418fc |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Users Response -> Respond Users (output 0, input 0)

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
| Node ID | ef225de3-ceec-4338-89f0-31175c7ab255 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /users -> Verify Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Supabase Auth User -> Fetch Current Q-Ops User (output 0, input 0)

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
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"{{ $json.headers.authorization || $json.headers.Authorization || \"\" }}\" }",
    "options":  {

                }
}
```

