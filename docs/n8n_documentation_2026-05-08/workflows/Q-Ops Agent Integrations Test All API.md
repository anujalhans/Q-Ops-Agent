# Q-Ops Agent Integrations Test All API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 0cyKIIbCq17bD0yK |
| Active | True |
| Created At | 2026-05-07T06:16:13.941Z |
| Updated At | 2026-05-07T06:49:23.956Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Integrations Test All API.json |

## Description

POST /webhook/integrations/test-all endpoint with live probes via health workflow for Supabase, Chroma, n8n, and microservices, plus persisted connection-test snapshots.

## Trigger And Entry Contract

- POST /integrations/test-all | n8n-nodes-base.webhook | POST | integrations/test-all
- Respond Integrations Test All | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/integrations/test-all

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 3 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- POST /integrations/test-all -> Fetch Integrations For Test All (source output 0, target input 0)
- Fetch Integrations For Test All -> Fetch Live Health Snapshot (source output 0, target input 0)
- Fetch Live Health Snapshot -> Prepare Live Integration Test Results (source output 0, target input 0)
- Prepare Live Integration Test Results -> Insert All Connection Test Results (source output 0, target input 0)
- Insert All Connection Test Results -> Summarize Test All Results (source output 0, target input 0)
- Summarize Test All Results -> Respond Integrations Test All (source output 0, target input 0)

## Nodes

### Fetch Integrations For Test All

| Field | Value |
| --- | --- |
| Node ID | d1b11ea4-5309-4d3a-92a3-c8476d48f706 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /integrations/test-all -> Fetch Integrations For Test All (output 0, input 0)

**Outgoing Connections**

- Fetch Integrations For Test All -> Fetch Live Health Snapshot (output 0, input 0)

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
                                                   "value":  "environment_key,integration_key,display_name,enabled,status,config,last_tested_at,last_tested_by"
                                               },
                                               {
                                                   "name":  "environment_key",
                                                   "value":  "={{ \"eq.\" + ($(\"POST /integrations/test-all\").item.json.body?.environmentKey || \"local\") }}"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "integration_key.asc"
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
| Node ID | c607da6b-e4d9-451e-a792-f66a0b82abf9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Integrations For Test All -> Fetch Live Health Snapshot (output 0, input 0)

**Outgoing Connections**

- Fetch Live Health Snapshot -> Prepare Live Integration Test Results (output 0, input 0)

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

### Insert All Connection Test Results

| Field | Value |
| --- | --- |
| Node ID | 52c5ece5-000d-4bf0-9ae4-53afaf6ef481 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Live Integration Test Results -> Insert All Connection Test Results (output 0, input 0)

**Outgoing Connections**

- Insert All Connection Test Results -> Summarize Test All Results (output 0, input 0)

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

### POST /integrations/test-all

| Field | Value |
| --- | --- |
| Node ID | dca03576-3f5c-4a21-9a7e-ef3439357461 |
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

- POST /integrations/test-all -> Fetch Integrations For Test All (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "integrations/test-all",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Live Integration Test Results

| Field | Value |
| --- | --- |
| Node ID | 57adea9e-681c-4aaf-836b-c06123ebf999 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Live Health Snapshot -> Prepare Live Integration Test Results (output 0, input 0)

**Outgoing Connections**

- Prepare Live Integration Test Results -> Insert All Connection Test Results (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const request = $(\u0027POST /integrations/test-all\u0027).item.json || {};\nconst body = request.body || {};\nconst envKey = String(body.environmentKey || \u0027local\u0027);\nconst uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\nconst checkedByRaw = body.checkedBy || body.checkedByUserId || null;\nconst checkedBy = checkedByRaw \u0026\u0026 uuidPattern.test(String(checkedByRaw)) ? String(checkedByRaw) : null;\nconst checkedByName = body.checkedByName || body.actorName || checkedByRaw || \u0027n8n\u0027;\nconst now = new Date().toISOString();\nconst rows = $items(\u0027Fetch Integrations For Test All\u0027).map(i =\u003e i.json).filter(i =\u003e i \u0026\u0026 i.integration_key);\nconst health = $(\u0027Fetch Live Health Snapshot\u0027).item.json || {};\nconst services = Array.isArray(health.services) ? health.services : [];\nfunction service(name) { return services.find(s =\u003e String(s.name || \u0027\u0027).toLowerCase() === name.toLowerCase()) || null; }\nfunction fromHealth(integrationKey, displayName) {\n  if (integrationKey === \u0027supabase\u0027) { const db = service(\u0027Supabase DB\u0027); const storage = service(\u0027Supabase Storage\u0027); const bad = [db, storage].find(s =\u003e s \u0026\u0026 ![\u0027ok\u0027, \u0027operational\u0027].includes(s.status)); return { status: bad ? \u0027degraded\u0027 : \u0027operational\u0027, message: [db?.detail, storage?.detail].filter(Boolean).join(\u0027 | \u0027) || \u0027Supabase DB and Storage reachable\u0027, detail: { db, storage, probe: \u0027health-workflow\u0027 } }; }\n  if (integrationKey === \u0027chroma\u0027) { const s = service(\u0027ChromaDB\u0027); return { status: s?.status === \u0027ok\u0027 ? \u0027operational\u0027 : (s?.status || \u0027unreachable\u0027), message: s?.detail || \u0027Chroma health result unavailable\u0027, detail: { service: s, probe: \u0027health-workflow\u0027 } }; }\n  if (integrationKey === \u0027microservices\u0027) { const extractor = service(\u0027FastAPI Extractor\u0027); const converter = service(\u0027Converter Service\u0027); const bad = [extractor, converter].find(s =\u003e s \u0026\u0026 ![\u0027ok\u0027, \u0027operational\u0027].includes(s.status)); return { status: bad ? \u0027degraded\u0027 : \u0027operational\u0027, message: [extractor?.detail, converter?.detail].filter(Boolean).join(\u0027 | \u0027) || \u0027Microservice health endpoints reachable\u0027, detail: { extractor, converter, probe: \u0027health-workflow\u0027 } }; }\n  if (integrationKey === \u0027n8n\u0027) return { status: health.status === \u0027ok\u0027 ? \u0027operational\u0027 : (health.status || \u0027unreachable\u0027), message: `n8n health workflow returned ${health.status || \u0027unknown\u0027}`, detail: { healthStatus: health.status, generatedAt: health.generatedAt, probe: \u0027health-workflow\u0027 } };\n  if (integrationKey === \u0027jira\u0027) return { status: \u0027not_configured\u0027, message: \u0027Jira has no read-only live probe in this workflow yet; credential-backed project GET is the next step\u0027, detail: { probe: \u0027pending-credential-backed-node\u0027 } };\n  if (integrationKey === \u0027confluence\u0027) return { status: \u0027not_configured\u0027, message: \u0027Confluence has no read-only live probe in this workflow yet; credential-backed space GET is the next step\u0027, detail: { probe: \u0027pending-credential-backed-node\u0027 } };\n  if (integrationKey === \u0027openai\u0027) return { status: \u0027not_configured\u0027, message: \u0027OpenAI live validation is intentionally skipped to avoid cost; add a low-cost credential validation if required\u0027, detail: { probe: \u0027cost-guarded\u0027 } };\n  return { status: \u0027not_configured\u0027, message: `${displayName || integrationKey} has no live probe configured`, detail: { probe: \u0027not-configured\u0027 } };\n}\nreturn rows.map(row =\u003e {\n  let probe = row.enabled ? fromHealth(row.integration_key, row.display_name) : { status: \u0027not_configured\u0027, message: `${row.display_name || row.integration_key} is disabled`, detail: { probe: \u0027disabled\u0027 } };\n  const result = { environment_key: row.environment_key || envKey, integration_key: row.integration_key, service_name: row.display_name || row.integration_key, status: probe.status, latency_ms: null, message: probe.message, technical_detail: { ...probe.detail, source: \u0027live-probe-api\u0027, checkedByName }, checked_by: checkedBy, checked_at: now };\n  return { json: { environmentKey: row.environment_key || envKey, integrationKey: row.integration_key, status: probe.status, message: probe.message, checkedAt: now, checkedBy, checkedByName, result } };\n});"
}
```

### Respond Integrations Test All

| Field | Value |
| --- | --- |
| Node ID | 9c5f505a-a410-40a4-a5f5-02b311f93f06 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Summarize Test All Results -> Respond Integrations Test All (output 0, input 0)

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

### Summarize Test All Results

| Field | Value |
| --- | --- |
| Node ID | 63b8972a-898d-46d1-a0fb-3e3555231733 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert All Connection Test Results -> Summarize Test All Results (output 0, input 0)

**Outgoing Connections**

- Summarize Test All Results -> Respond Integrations Test All (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const results = $items(\u0027Prepare Live Integration Test Results\u0027).map(i =\u003e ({ environmentKey: i.json.environmentKey, integrationKey: i.json.integrationKey, status: i.json.status, message: i.json.message, checkedAt: i.json.checkedAt }));\nconst counts = results.reduce((acc, item) =\u003e { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {});\nreturn [{ json: { ok: true, generatedAt: new Date().toISOString(), counts, integrations: results } }];"
}
```

