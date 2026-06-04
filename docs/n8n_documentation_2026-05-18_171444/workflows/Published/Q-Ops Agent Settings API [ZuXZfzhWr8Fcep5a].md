# Q-Ops Agent Settings API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | ZuXZfzhWr8Fcep5a |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T06:13:43.882Z |
| Updated At | 2026-05-07T06:21:25.076Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent Settings API [ZuXZfzhWr8Fcep5a].json |

## Description

Draft GET /webhook/settings endpoint backed by qops_environment_settings, qops_integration_settings, and qops_connection_test_results.

## Trigger And Entry Contract

- GET /settings | n8n-nodes-base.webhook |  | settings
- Respond Settings | n8n-nodes-base.respondToWebhook |  | 
- Respond Settings | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/settings

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

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_environment_settings
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings

### Supabase/Data Table Hints

- qops_connection_test_results
- qops_environment_settings
- qops_integration_settings

## Connection Graph

- GET /settings -> Fetch Environment Settings (source output 0, target input 0)
- Fetch Environment Settings -> Fetch Integration Settings (source output 0, target input 0)
- Fetch Integration Settings -> Fetch Latest Connection Results (source output 0, target input 0)
- Fetch Latest Connection Results -> Map Settings Response (source output 0, target input 0)
- Map Settings Response -> Respond Settings (source output 0, target input 0)

## Nodes

### Fetch Environment Settings

| Field | Value |
| --- | --- |
| Node ID | 6f424c5f-39f3-4cf2-8648-ea5b5bc2b398 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /settings -> Fetch Environment Settings (output 0, input 0)

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
| Position | 448, 0 |
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
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Integration Settings -> Fetch Latest Connection Results (output 0, input 0)

**Outgoing Connections**

- Fetch Latest Connection Results -> Map Settings Response (output 0, input 0)

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

- GET /settings -> Fetch Environment Settings (output 0, input 0)

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
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Latest Connection Results -> Map Settings Response (output 0, input 0)

**Outgoing Connections**

- Map Settings Response -> Respond Settings (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const envs = $items(\u0027Fetch Environment Settings\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.environment_key);\nconst integrations = $items(\u0027Fetch Integration Settings\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst rawResults = $items(\u0027Fetch Latest Connection Results\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst latestByKey = {};\nfor (const result of rawResults) {\n  const key = `${result.environment_key}:${result.integration_key}`;\n  if (!latestByKey[key]) latestByKey[key] = result;\n}\nconst byEnvironment = envs.map(env =\u003e {\n  const scoped = integrations.filter(integration =\u003e integration.environment_key === env.environment_key).map(integration =\u003e {\n    const latest = latestByKey[`${integration.environment_key}:${integration.integration_key}`] || null;\n    return {\n      environmentKey: integration.environment_key,\n      integrationKey: integration.integration_key,\n      displayName: integration.display_name,\n      enabled: Boolean(integration.enabled),\n      config: integration.config || {},\n      secretRefs: integration.secret_refs || {},\n      status: integration.status || \u0027not_configured\u0027,\n      lastTestedAt: integration.last_tested_at,\n      lastTestedBy: integration.last_tested_by,\n      settingsVersion: integration.settings_version || 1,\n      updatedAt: integration.updated_at,\n      latestTest: latest ? { status: latest.status, latencyMs: latest.latency_ms, message: latest.message, checkedAt: latest.checked_at, checkedBy: latest.checked_by } : null,\n    };\n  });\n  return {\n    environmentKey: env.environment_key,\n    displayName: env.display_name,\n    apiBaseUrl: env.api_base_url,\n    n8nBaseUrl: env.n8n_base_url,\n    webhookPaths: env.webhook_paths || {},\n    isActive: Boolean(env.is_active),\n    updatedAt: env.updated_at,\n    updatedBy: env.updated_by,\n    integrations: scoped,\n  };\n});\nreturn [{ json: { environments: byEnvironment, environmentSettings: envs, integrations, latestResults: rawResults } }];"
}
```

### Respond Settings

| Field | Value |
| --- | --- |
| Node ID | 92609ba9-1077-412a-b3d4-aa39deb190c8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 0 |
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
