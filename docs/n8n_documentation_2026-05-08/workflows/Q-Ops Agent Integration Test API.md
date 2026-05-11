# Q-Ops Agent Integration Test API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 3zXdQS9hABDTXuea |
| Active | True |
| Created At | 2026-05-07T06:15:44.415Z |
| Updated At | 2026-05-07T06:49:56.886Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Integration Test API.json |

## Description

POST /webhook/integrations/test endpoint with live probe support for one integration. Use body.integrationKey while local n8n route params remain unreliable.

## Trigger And Entry Contract

- POST /integrations/test | n8n-nodes-base.webhook | POST | integrations/test
- Respond Integration Test | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/integrations/test

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

- POST /integrations/test -> Fetch Integration For Test (source output 0, target input 0)
- Fetch Integration For Test -> Fetch Live Health Snapshot (source output 0, target input 0)
- Fetch Live Health Snapshot -> Prepare Live Integration Test Result (source output 0, target input 0)
- Prepare Live Integration Test Result -> Insert Connection Test Result (source output 0, target input 0)
- Insert Connection Test Result -> Patch Integration Test Metadata (source output 0, target input 0)
- Patch Integration Test Metadata -> Respond Integration Test (source output 0, target input 0)

## Nodes

### Fetch Integration For Test

| Field | Value |
| --- | --- |
| Node ID | 990c313a-d39b-42fd-9785-7ebfc9194057 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /integrations/test -> Fetch Integration For Test (output 0, input 0)

**Outgoing Connections**

- Fetch Integration For Test -> Fetch Live Health Snapshot (output 0, input 0)

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
                                                   "value":  "environment_key,integration_key,display_name,enabled,status,config,last_tested_at,last_tested_by,settings_version"
                                               },
                                               {
                                                   "name":  "environment_key",
                                                   "value":  "={{ \"eq.\" + ($(\"POST /integrations/test\").item.json.body?.environmentKey || \"local\") }}"
                                               },
                                               {
                                                   "name":  "integration_key",
                                                   "value":  "={{ \"eq.\" + ($(\"POST /integrations/test\").item.json.body?.integrationKey || \"\") }}"
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

### Fetch Live Health Snapshot

| Field | Value |
| --- | --- |
| Node ID | 78b2ddd7-ed1a-4138-ae2a-dfe2e5098353 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Integration For Test -> Fetch Live Health Snapshot (output 0, input 0)

**Outgoing Connections**

- Fetch Live Health Snapshot -> Prepare Live Integration Test Result (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://localhost:5678/webhook/health",
    "options":  {
                    "timeout":  30000
                }
}
```

### Insert Connection Test Result

| Field | Value |
| --- | --- |
| Node ID | a53abfe1-7416-44b5-b10e-3252fb77451c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Live Integration Test Result -> Insert Connection Test Result (output 0, input 0)

**Outgoing Connections**

- Insert Connection Test Result -> Patch Integration Test Metadata (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_connection_test_results",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.result }}",
    "options":  {

                }
}
```

### Patch Integration Test Metadata

| Field | Value |
| --- | --- |
| Node ID | 4516f0b9-3d52-4d8c-93da-75514e186e47 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Connection Test Result -> Patch Integration Test Metadata (output 0, input 0)

**Outgoing Connections**

- Patch Integration Test Metadata -> Respond Integration Test (output 0, input 0)

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
    "url":  "={{ \"https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_integration_settings?environment_key=eq.\" + encodeURIComponent($(\"Prepare Live Integration Test Result\").item.json.environmentKey) + \"\u0026integration_key=eq.\" + encodeURIComponent($(\"Prepare Live Integration Test Result\").item.json.integrationKey) }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $(\"Prepare Live Integration Test Result\").item.json.integrationPatch }}",
    "options":  {

                }
}
```

### POST /integrations/test

| Field | Value |
| --- | --- |
| Node ID | ef60b3e5-b4a3-487d-953a-7e2480e8f6d6 |
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

- POST /integrations/test -> Fetch Integration For Test (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "integrations/test",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Live Integration Test Result

| Field | Value |
| --- | --- |
| Node ID | 4eb80396-3949-4357-877c-b8ba990ff0da |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Live Health Snapshot -> Prepare Live Integration Test Result (output 0, input 0)

**Outgoing Connections**

- Prepare Live Integration Test Result -> Insert Connection Test Result (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027POST /integrations/test\u0027).item.json || {};\nconst body = request.body || {};\nconst integrationKey = String(body.integrationKey || \u0027\u0027).trim();\nconst envKey = String(body.environmentKey || \u0027local\u0027);\nconst uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\nconst checkedByRaw = body.checkedBy || body.checkedByUserId || null;\nconst checkedBy = checkedByRaw \u0026\u0026 uuidPattern.test(String(checkedByRaw)) ? String(checkedByRaw) : null;\nconst checkedByName = body.checkedByName || body.actorName || checkedByRaw || \u0027n8n\u0027;\nconst row = $items(\u0027Fetch Integration For Test\u0027).map(i =\u003e i.json).find(i =\u003e i \u0026\u0026 i.integration_key) || null;\nconst health = $(\u0027Fetch Live Health Snapshot\u0027).item.json || {};\nconst services = Array.isArray(health.services) ? health.services : [];\nconst now = new Date().toISOString();\nfunction service(name) { return services.find(s =\u003e String(s.name || \u0027\u0027).toLowerCase() === name.toLowerCase()) || null; }\nfunction probeFor(key, displayName) {\n  if (!row) return { status: \u0027not_configured\u0027, message: `No ${key} settings found for ${envKey}`, detail: { probe: \u0027missing-settings\u0027 } };\n  if (!row.enabled) return { status: \u0027not_configured\u0027, message: `${displayName || key} is disabled`, detail: { probe: \u0027disabled\u0027 } };\n  if (key === \u0027supabase\u0027) { const db = service(\u0027Supabase DB\u0027); const storage = service(\u0027Supabase Storage\u0027); const bad = [db, storage].find(s =\u003e s \u0026\u0026 ![\u0027ok\u0027, \u0027operational\u0027].includes(s.status)); return { status: bad ? \u0027degraded\u0027 : \u0027operational\u0027, message: [db?.detail, storage?.detail].filter(Boolean).join(\u0027 | \u0027) || \u0027Supabase DB and Storage reachable\u0027, detail: { db, storage, probe: \u0027health-workflow\u0027 } }; }\n  if (key === \u0027chroma\u0027) { const s = service(\u0027ChromaDB\u0027); return { status: s?.status === \u0027ok\u0027 ? \u0027operational\u0027 : (s?.status || \u0027unreachable\u0027), message: s?.detail || \u0027Chroma health result unavailable\u0027, detail: { service: s, probe: \u0027health-workflow\u0027 } }; }\n  if (key === \u0027microservices\u0027) { const extractor = service(\u0027FastAPI Extractor\u0027); const converter = service(\u0027Converter Service\u0027); const bad = [extractor, converter].find(s =\u003e s \u0026\u0026 ![\u0027ok\u0027, \u0027operational\u0027].includes(s.status)); return { status: bad ? \u0027degraded\u0027 : \u0027operational\u0027, message: [extractor?.detail, converter?.detail].filter(Boolean).join(\u0027 | \u0027) || \u0027Microservice health endpoints reachable\u0027, detail: { extractor, converter, probe: \u0027health-workflow\u0027 } }; }\n  if (key === \u0027n8n\u0027) return { status: health.status === \u0027ok\u0027 ? \u0027operational\u0027 : (health.status || \u0027unreachable\u0027), message: `n8n health workflow returned ${health.status || \u0027unknown\u0027}`, detail: { healthStatus: health.status, generatedAt: health.generatedAt, probe: \u0027health-workflow\u0027 } };\n  if (key === \u0027jira\u0027) return { status: \u0027not_configured\u0027, message: \u0027Jira has no read-only live probe in this workflow yet; credential-backed project GET is the next step\u0027, detail: { probe: \u0027pending-credential-backed-node\u0027 } };\n  if (key === \u0027confluence\u0027) return { status: \u0027not_configured\u0027, message: \u0027Confluence has no read-only live probe in this workflow yet; credential-backed space GET is the next step\u0027, detail: { probe: \u0027pending-credential-backed-node\u0027 } };\n  if (key === \u0027openai\u0027) return { status: \u0027not_configured\u0027, message: \u0027OpenAI live validation is intentionally skipped to avoid cost; add a low-cost credential validation if required\u0027, detail: { probe: \u0027cost-guarded\u0027 } };\n  return { status: \u0027not_configured\u0027, message: `${displayName || key} has no live probe configured`, detail: { probe: \u0027not-configured\u0027 } };\n}\nconst p = probeFor(integrationKey, row?.display_name);\nconst integrationStatus = [\u0027operational\u0027, \u0027degraded\u0027, \u0027unreachable\u0027, \u0027unauthorized\u0027, \u0027error\u0027, \u0027not_configured\u0027].includes(p.status) ? p.status : \u0027error\u0027;\nconst result = { environment_key: envKey, integration_key: integrationKey, service_name: row?.display_name || integrationKey, status: integrationStatus, latency_ms: null, message: p.message, technical_detail: { ...p.detail, source: \u0027live-probe-api\u0027, checkedByName }, checked_by: checkedBy, checked_at: now };\nconst integrationPatch = { status: integrationStatus, last_tested_at: now, last_tested_by: checkedBy, updated_at: now };\nreturn [{ json: { ok: true, environmentKey: envKey, integrationKey, status: integrationStatus, message: p.message, checkedAt: now, checkedBy, checkedByName, result, integrationPatch } }];"
}
```

### Respond Integration Test

| Field | Value |
| --- | --- |
| Node ID | 70a368a2-b4c6-44a1-9e70-c7587068df61 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Patch Integration Test Metadata -> Respond Integration Test (output 0, input 0)

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
    "responseBody":  "={{ $(\"Prepare Live Integration Test Result\").item.json }}",
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

