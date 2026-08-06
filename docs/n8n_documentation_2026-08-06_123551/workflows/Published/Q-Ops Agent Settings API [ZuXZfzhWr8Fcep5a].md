# Q-Ops Agent Settings API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ZuXZfzhWr8Fcep5a |
| Active | True |
| Created At | 2026-05-07T06:13:43.882Z |
| Updated At | 2026-05-20T11:20:45.258Z |
| Node Count | 14 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Settings API [ZuXZfzhWr8Fcep5a].json |

## Description

Draft GET /webhook/settings endpoint backed by qops_environment_settings, qops_integration_settings, and qops_connection_test_results.

## Trigger And Entry Contract

- GET /settings | n8n-nodes-base.webhook | settings
- Respond Settings | n8n-nodes-base.respondToWebhook
- Respond Settings Unauthorized | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/settings

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 8 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /settings -> Prepare Settings Read Auth (source output 0, target input 0)
- Prepare Settings Read Auth -> Settings Read Authorized? (source output 0, target input 0)
- Settings Read Authorized? -> Verify Settings Read Supabase User (source output 0, target input 0)
- Settings Read Authorized? -> Respond Settings Unauthorized (source output 1, target input 0)
- Verify Settings Read Supabase User -> Fetch Current Settings User Profile (source output 0, target input 0)
- Fetch Current Settings User Profile -> Fetch Current Settings Project Memberships (source output 0, target input 0)
- Fetch Current Settings Project Memberships -> Fetch Environment Settings (source output 0, target input 0)
- Fetch Environment Settings -> Fetch Integration Settings (source output 0, target input 0)
- Fetch Integration Settings -> Fetch Latest Connection Results (source output 0, target input 0)
- Fetch Latest Connection Results -> Fetch User Integration Settings (source output 0, target input 0)
- Fetch User Integration Settings -> Fetch Project Integration Overrides (source output 0, target input 0)
- Fetch Project Integration Overrides -> Map Settings Response (source output 0, target input 0)
- Map Settings Response -> Respond Settings (source output 0, target input 0)

## Nodes

### Fetch Current Settings Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 9b846efc-cf9d-4bc6-bc4e-77fa9209299b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Settings User Profile -> Fetch Current Settings Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Current Settings Project Memberships -> Fetch Environment Settings (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ (Array.isArray($json) ? $json[0] : $json).id }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Current Settings User Profile

| Field | Value |
| --- | --- |
| Node ID | 307236c2-c9d1-4807-bf1f-51a02fc3c1da |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Settings Read Supabase User -> Fetch Current Settings User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Current Settings User Profile -> Fetch Current Settings Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Environment Settings

| Field | Value |
| --- | --- |
| Node ID | 6f424c5f-39f3-4cf2-8648-ea5b5bc2b398 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Current Settings Project Memberships -> Fetch Environment Settings (output 0, input 0)

**Outgoing Connections**

- Fetch Environment Settings -> Fetch Integration Settings (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_environment_settings",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "environment_key,display_name,api_base_url,n8n_base_url,webhook_paths,is_active,created_at,updated_at,updated_by"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "environment_key.asc"
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

### Fetch Integration Settings

| Field | Value |
| --- | --- |
| Node ID | 58b17e90-36e6-4028-9a65-bd74f96bb611 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Environment Settings -> Fetch Integration Settings (output 0, input 0)

**Outgoing Connections**

- Fetch Integration Settings -> Fetch Latest Connection Results (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "environment_key,integration_key,display_name,enabled,config,secret_refs,status,last_tested_at,last_tested_by,settings_version,created_at,updated_at,updated_by"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "environment_key.asc,integration_key.asc"
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

### Fetch Latest Connection Results

| Field | Value |
| --- | --- |
| Node ID | 353582f2-7578-4368-9fab-ee17e15e9aae |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Integration Settings -> Fetch Latest Connection Results (output 0, input 0)

**Outgoing Connections**

- Fetch Latest Connection Results -> Fetch User Integration Settings (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "environment_key,integration_key,service_name,status,latency_ms,message,technical_detail,checked_by,checked_at,created_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "checked_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "100"
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

### Fetch Project Integration Overrides

| Field | Value |
| --- | --- |
| Node ID | 8b697220-5ffb-445e-85e4-054eea9a0836 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch User Integration Settings -> Fetch Project Integration Overrides (output 0, input 0)

**Outgoing Connections**

- Fetch Project Integration Overrides -> Map Settings Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_integration_overrides",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "project_id,integration_key,override_config,enabled,secret_refs,status,settings_version,created_at,updated_at,updated_by"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "project_id.asc,integration_key.asc"
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

### Fetch User Integration Settings

| Field | Value |
| --- | --- |
| Node ID | 4da10a32-e123-4fb4-8d16-fa2fb9d289d6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Latest Connection Results -> Fetch User Integration Settings (output 0, input 0)

**Outgoing Connections**

- Fetch User Integration Settings -> Fetch Project Integration Overrides (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_user_integration_settings?user_id=eq.{{ (Array.isArray($(\"Fetch Current Settings User Profile\").first().json) ? $(\"Fetch Current Settings User Profile\").first().json[0] : $(\"Fetch Current Settings User Profile\").first().json).id }}\u0026select=environment_key,user_id,integration_key,display_name,enabled,config,secret_refs,status,settings_version,created_at,updated_at,updated_by\u0026order=environment_key.asc,integration_key.asc",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### GET /settings

| Field | Value |
| --- | --- |
| Node ID | b8028c25-1439-4b34-a108-60f4043144cf |
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

- GET /settings -> Prepare Settings Read Auth (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "settings",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Settings Response

| Field | Value |
| --- | --- |
| Node ID | cc4da577-3d40-47d6-871c-deb0d53fca8f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2464, -80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Project Integration Overrides -> Map Settings Response (output 0, input 0)

**Outgoing Connections**

- Map Settings Response -> Respond Settings (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const envs = $items(\u0027Fetch Environment Settings\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.environment_key);\nconst integrations = $items(\u0027Fetch Integration Settings\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst userIntegrationsRaw = $items(\u0027Fetch User Integration Settings\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst projectOverridesRaw = $items(\u0027Fetch Project Integration Overrides\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst rawResults = $items(\u0027Fetch Latest Connection Results\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst profileRaw = $(\u0027Fetch Current Settings User Profile\u0027).first().json || {};\nconst profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;\nconst memberships = $items(\u0027Fetch Current Settings Project Memberships\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.project_id);\nconst isAdmin = profile?.role === \u0027admin\u0027;\nconst allowedProjectIds = new Set(memberships.map(m =\u003e m.project_id));\nconst latestByKey = {};\nfor (const result of rawResults) {\n  const key = `${result.environment_key}:${result.integration_key}`;\n  if (!latestByKey[key]) latestByKey[key] = result;\n}\nfunction normalizeIntegration(row, scope, extra = {}) {\n  const latest = latestByKey[`${row.environment_key}:${row.integration_key}`] || null;\n  return {\n    ...extra,\n    scope,\n    environmentKey: row.environment_key,\n    integrationKey: row.integration_key,\n    displayName: row.display_name,\n    enabled: Boolean(row.enabled),\n    config: row.config || row.override_config || {},\n    secretRefs: row.secret_refs || {},\n    status: row.status || \u0027not_configured\u0027,\n    lastTestedAt: row.last_tested_at,\n    lastTestedBy: row.last_tested_by,\n    settingsVersion: row.settings_version || 1,\n    updatedAt: row.updated_at,\n    updatedBy: row.updated_by,\n    latestTest: latest ? { status: latest.status, latencyMs: latest.latency_ms, message: latest.message, checkedAt: latest.checked_at, checkedBy: latest.checked_by } : null,\n  };\n}\nconst userIntegrations = userIntegrationsRaw.map(row =\u003e normalizeIntegration(row, \u0027user\u0027, { userId: row.user_id }));\nconst projectOverrides = projectOverridesRaw\n  .filter(row =\u003e isAdmin || allowedProjectIds.has(row.project_id))\n  .map(row =\u003e normalizeIntegration(row, \u0027project\u0027, { projectId: row.project_id }));\nconst byEnvironment = envs.map(env =\u003e {\n  const scoped = integrations.filter(integration =\u003e integration.environment_key === env.environment_key).map(integration =\u003e normalizeIntegration(integration, \u0027workspace\u0027));\n  return {\n    environmentKey: env.environment_key,\n    displayName: env.display_name,\n    apiBaseUrl: env.api_base_url,\n    n8nBaseUrl: env.n8n_base_url,\n    webhookPaths: env.webhook_paths || {},\n    isActive: Boolean(env.is_active),\n    updatedAt: env.updated_at,\n    updatedBy: env.updated_by,\n    integrations: scoped,\n  };\n});\nreturn [{\n  json: {\n    environments: byEnvironment,\n    environmentSettings: envs,\n    integrations,\n    userIntegrations,\n    projectOverrides,\n    currentUser: profile ? { id: profile.id, email: profile.email, name: profile.name, role: profile.role, status: profile.status } : null,\n    projectMemberships: memberships,\n    latestResults: rawResults,\n  }\n}];"
}
```

### Prepare Settings Read Auth

| Field | Value |
| --- | --- |
| Node ID | a3e51ebe-d1d3-433f-9918-ac15151bb955 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /settings -> Prepare Settings Read Auth (output 0, input 0)

**Outgoing Connections**

- Prepare Settings Read Auth -> Settings Read Authorized? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst query = $json.query || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, error: { code: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 } } }];\n}\nreturn [{\n  json: {\n    ok: true,\n    token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027),\n    environmentKey: String(query.environmentKey || \u0027local\u0027),\n    selectedProjectId: query.projectId || null\n  }\n}];"
}
```

### Respond Settings

| Field | Value |
| --- | --- |
| Node ID | 92609ba9-1077-412a-b3d4-aa39deb190c8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2688, -80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Settings Response -> Respond Settings (output 0, input 0)

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

### Respond Settings Unauthorized

| Field | Value |
| --- | --- |
| Node ID | b03de00f-eb04-413c-9ff1-84110d8d30fe |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.1 |
| Position | 672, 160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Settings Read Authorized? -> Respond Settings Unauthorized (output 1, input 0)

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
                    "responseCode":  401,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Headers",
                                                                "value":  "authorization, content-type"
                                                            }
                                                        ]
                                        }
                }
}
```

### Settings Read Authorized?

| Field | Value |
| --- | --- |
| Node ID | 1fcf4075-28d4-48bb-91fa-5ba423983929 |
| Type | n8n-nodes-base.if |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Settings Read Auth -> Settings Read Authorized? (output 0, input 0)

**Outgoing Connections**

- Settings Read Authorized? -> Verify Settings Read Supabase User (output 0, input 0)
- Settings Read Authorized? -> Respond Settings Unauthorized (output 1, input 0)

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
                                       "version":  1
                                   },
                       "conditions":  [
                                          {
                                              "id":  "fe8a56d6-ae74-4e31-8175-8c9920fdf3d9",
                                              "leftValue":  "={{ $json.ok }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Verify Settings Read Supabase User

| Field | Value |
| --- | --- |
| Node ID | d181517b-7d04-42df-bdd4-29aa1208284e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Settings Read Authorized? -> Verify Settings Read Supabase User (output 0, input 0)

**Outgoing Connections**

- Verify Settings Read Supabase User -> Fetch Current Settings User Profile (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "apikey",
                                                    "value":  "sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt"
                                                },
                                                {
                                                    "name":  "Authorization",
                                                    "value":  "={{ \u0027Bearer \u0027 + $json.token }}"
                                                }
                                            ]
                         },
    "options":  {

                }
}
```
