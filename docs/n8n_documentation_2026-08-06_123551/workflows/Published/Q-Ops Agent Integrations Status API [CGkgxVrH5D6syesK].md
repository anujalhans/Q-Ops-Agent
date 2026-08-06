# Q-Ops Agent Integrations Status API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | CGkgxVrH5D6syesK |
| Active | True |
| Created At | 2026-05-07T06:14:59.660Z |
| Updated At | 2026-05-07T06:20:57.471Z |
| Node Count | 5 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Integrations Status API [CGkgxVrH5D6syesK].json |

## Description

Draft GET /webhook/integrations/status endpoint backed by qops_integration_settings and latest qops_connection_test_results.

## Trigger And Entry Contract

- GET /integrations/status | n8n-nodes-base.webhook | integrations/status
- Respond Integrations Status | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/integrations/status

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 2 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /integrations/status -> Fetch Integrations (source output 0, target input 0)
- Fetch Integrations -> Fetch Recent Test Results (source output 0, target input 0)
- Fetch Recent Test Results -> Map Integrations Status (source output 0, target input 0)
- Map Integrations Status -> Respond Integrations Status (source output 0, target input 0)

## Nodes

### Fetch Integrations

| Field | Value |
| --- | --- |
| Node ID | 8e9098d7-4685-4ced-a0dd-63e99dbcb1c9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /integrations/status -> Fetch Integrations (output 0, input 0)

**Outgoing Connections**

- Fetch Integrations -> Fetch Recent Test Results (output 0, input 0)

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
                                                   "value":  "environment_key,integration_key,display_name,enabled,status,last_tested_at,last_tested_by,settings_version,updated_at"
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

### Fetch Recent Test Results

| Field | Value |
| --- | --- |
| Node ID | d0930f0b-d9fd-4c0f-8e8f-ba21dc055e72 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Integrations -> Fetch Recent Test Results (output 0, input 0)

**Outgoing Connections**

- Fetch Recent Test Results -> Map Integrations Status (output 0, input 0)

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
                                                   "value":  "environment_key,integration_key,service_name,status,latency_ms,message,checked_by,checked_at"
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

### GET /integrations/status

| Field | Value |
| --- | --- |
| Node ID | d193f9c4-8532-41e5-a65f-a37dc09891f2 |
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

- GET /integrations/status -> Fetch Integrations (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "integrations/status",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Integrations Status

| Field | Value |
| --- | --- |
| Node ID | 6eb83888-e198-4b4a-bb50-6c3f26dadc56 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Recent Test Results -> Map Integrations Status (output 0, input 0)

**Outgoing Connections**

- Map Integrations Status -> Respond Integrations Status (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const integrations = $items(\u0027Fetch Integrations\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst results = $items(\u0027Fetch Recent Test Results\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.integration_key);\nconst latestByKey = {};\nfor (const result of results) {\n  const key = `${result.environment_key}:${result.integration_key}`;\n  if (!latestByKey[key]) latestByKey[key] = result;\n}\nconst statuses = integrations.map(integration =\u003e {\n  const latest = latestByKey[`${integration.environment_key}:${integration.integration_key}`] || null;\n  return {\n    environmentKey: integration.environment_key,\n    integrationKey: integration.integration_key,\n    displayName: integration.display_name,\n    enabled: Boolean(integration.enabled),\n    status: latest?.status || integration.status || \u0027not_configured\u0027,\n    configuredStatus: integration.status || \u0027not_configured\u0027,\n    lastTestedAt: latest?.checked_at || integration.last_tested_at,\n    lastTestedBy: latest?.checked_by || integration.last_tested_by,\n    latencyMs: latest?.latency_ms ?? null,\n    message: latest?.message || null,\n    settingsVersion: integration.settings_version || 1,\n    updatedAt: integration.updated_at,\n  };\n});\nreturn [{ json: { integrations: statuses, generatedAt: new Date().toISOString() } }];"
}
```

### Respond Integrations Status

| Field | Value |
| --- | --- |
| Node ID | 6cbe91c8-eddf-46fb-98ad-74850e1cb144 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Integrations Status -> Respond Integrations Status (output 0, input 0)

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
