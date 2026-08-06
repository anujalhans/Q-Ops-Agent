# Q-Ops-Agent-Health-Status

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | zdx8YtZJOMWtbv1L |
| Active | True |
| Created At | 2026-05-04T10:19:08.462Z |
| Updated At | 2026-06-02T08:56:19.955Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops-Agent-Health-Status [zdx8YtZJOMWtbv1L].json |

## Description

Health/status endpoint with dynamic ChromaDB settings from qops_integration_settings plus repository and settings webhook registry entries for the Q-Ops Agent UI.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | health
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/health

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 6 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key
- httpHeaderAuth: chromadb-cloud-key

## Connection Graph

- Webhook -> Check: Supabase DB (source output 0, target input 0)
- Webhook -> Check: Supabase Storage (source output 0, target input 0)
- Webhook -> Fetch Chroma Settings (source output 0, target input 0)
- Webhook -> Check: Extractor Service (source output 0, target input 0)
- Webhook -> Check: MD->DOCX Converter Service (source output 0, target input 0)
- Check: Supabase DB -> Wait for All Checks (source output 0, target input 0)
- Wait for All Checks -> Build Health Response (source output 0, target input 0)
- Check: Supabase Storage -> Wait for All Checks (source output 0, target input 1)
- Fetch Chroma Settings -> Build Chroma Health URL (source output 0, target input 0)
- Build Chroma Health URL -> Check: ChromaDB (source output 0, target input 0)
- Check: ChromaDB -> Wait for All Checks (source output 0, target input 2)
- Check: Extractor Service -> Wait for All Checks (source output 0, target input 3)
- Check: MD->DOCX Converter Service -> Wait for All Checks (source output 0, target input 4)
- Build Health Response -> Respond to Webhook (source output 0, target input 0)

## Nodes

### Build Chroma Health URL

| Field | Value |
| --- | --- |
| Node ID | e25bb775-a598-4698-b9f2-bdb6bd01c9bf |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Chroma Settings -> Build Chroma Health URL (output 0, input 0)

**Outgoing Connections**

- Build Chroma Health URL -> Check: ChromaDB (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const row = Array.isArray($json) ? $json[0] : $json;\nconst cfg = row?.config || {};\nconst baseUrl = String(cfg.baseUrl || \u0027https://api.trychroma.com\u0027).replace(/\\/+$/, \u0027\u0027);\nconst tenant = String(cfg.tenant || \u0027My_Tenant\u0027).trim();\nconst database = String(cfg.database || \u0027QA-Documents-Chunk\u0027).trim();\nconst collection = String(cfg.collection || \u0027qa-chunks-batches\u0027).trim();\nconst topK = Math.max(1, Math.min(100, Number(cfg.topK) || 20));\nconst missing = [];\nif (!tenant) missing.push(\u0027tenant\u0027);\nif (!database) missing.push(\u0027database\u0027);\nif (!collection) missing.push(\u0027collection\u0027);\nconst url = `${baseUrl}/api/v2/tenants/${encodeURIComponent(tenant || \u0027missing\u0027)}/databases/${encodeURIComponent(database || \u0027missing\u0027)}/collections/${encodeURIComponent(collection || \u0027missing\u0027)}`;\nreturn [{ json: { url, config: { baseUrl, tenant, database, collection, topK }, settingsVersion: row?.settings_version || null, missing, enabled: row?.enabled !== false } }];"
}
```

### Build Health Response

| Field | Value |
| --- | --- |
| Node ID | ea6fa83d-f1de-43de-becf-6c3045e155e1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1120, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Wait for All Checks -> Build Health Response (output 0, input 0)

**Outgoing Connections**

- Build Health Response -> Respond to Webhook (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date().toISOString();\nfunction checkResult(nodeName, options = {}) {\n  const successDetailBuilder = options.successDetailBuilder;\n  const defaultOkDetail = options.defaultOkDetail || null;\n  const downMessage = options.downMessage;\n  try {\n    const items = $items(nodeName);\n    if (!items || items.length === 0) return { status: \u0027unreachable\u0027, detail: \u0027No response received\u0027 };\n    const json = items[0].json || {};\n    if (json.error || json.statusCode \u003e= 400 || (typeof json.message === \u0027string\u0027 \u0026\u0026 json.message.toLowerCase().includes(\u0027error\u0027))) {\n      return { status: downMessage ? \u0027down\u0027 : \u0027error\u0027, detail: json.message || json.error?.message || JSON.stringify(json.error) || downMessage || \u0027Unknown error\u0027 };\n    }\n    if (successDetailBuilder) return { status: \u0027ok\u0027, detail: successDetailBuilder(json) };\n    return { status: \u0027ok\u0027, detail: defaultOkDetail };\n  } catch (e) {\n    return { status: downMessage ? \u0027down\u0027 : \u0027unreachable\u0027, detail: e.message };\n  }\n}\nconst supabaseDb = checkResult(\u0027Check: Supabase DB\u0027, { successDetailBuilder: (json) =\u003e { const record = Array.isArray(json) ? json[0] : json; return record?.created_at ? `Last event: ${record.event} at ${record.created_at}` : \u0027Reachable, no records yet\u0027; } });\nconst supabaseStorage = checkResult(\u0027Check: Supabase Storage\u0027, { successDetailBuilder: (json) =\u003e `Bucket \"${json?.name || \u0027uploaded-project-docs\u0027}\" reachable` });\nconst chromaConfig = $(\u0027Build Chroma Health URL\u0027).first().json || {};\nconst chromaDb = chromaConfig.enabled === false || (Array.isArray(chromaConfig.missing) \u0026\u0026 chromaConfig.missing.length)\n  ? { status: \u0027not_configured\u0027, detail: `ChromaDB settings incomplete: ${(chromaConfig.missing || []).join(\u0027, \u0027)}` }\n  : checkResult(\u0027Check: ChromaDB\u0027, { successDetailBuilder: (json) =\u003e { const vectorCount = json?.count_documents ?? \u0027unknown\u0027; const collectionName = json?.name || chromaConfig.config?.collection || \u0027qa-chunks-batches\u0027; const database = json?.database || chromaConfig.config?.database || \u0027QA-Documents-Chunk\u0027; const topK = chromaConfig.config?.topK || 20; return `Collection \"${collectionName}\" in database \"${database}\" reachable. Vectors: ${vectorCount}. topK: ${topK}`; } });\nconst fastapiStatus = checkResult(\u0027Check: Extractor Service\u0027, { downMessage: \u0027Extractor service unreachable at :8001. Start the extractor service on http://127.0.0.1:8001\u0027, successDetailBuilder: (json) =\u003e json?.status || \u0027Reachable at http://127.0.0.1:8001\u0027 });\nconst converterStatus = checkResult(\u0027Check: MD-\u003eDOCX Converter Service\u0027, { downMessage: \u0027Converter service unreachable at :5050. Run: pm2 start format-converter\u0027, successDetailBuilder: (json) =\u003e json?.status || \u0027Reachable at http://127.0.0.1:5050\u0027 });\nconst allServices = [supabaseDb, supabaseStorage, chromaDb, fastapiStatus, converterStatus];\nlet overallStatus = \u0027ok\u0027;\nif (allServices.some(s =\u003e [\u0027down\u0027,\u0027unreachable\u0027,\u0027not_configured\u0027].includes(s.status))) overallStatus = \u0027degraded\u0027;\nif (allServices.some(s =\u003e s.status === \u0027error\u0027)) overallStatus = \u0027error\u0027;\nconst webhooks = { upload: \u0027/webhook/upload-test-artifacts\u0027, ingestionStatus: \u0027/webhook/job-status?jobId=...\u0027, generate: \u0027/webhook/generate-qa-doc\u0027, generationStatus: \u0027/webhook/job-status-retrieve?jobId=...\u0027, analytics: \u0027/webhook/analytics-summary?pipeline=all\u0026days=30\u0027, health: \u0027/webhook/health\u0027, projects: \u0027/webhook/projects\u0027, artifacts: \u0027/webhook/artifacts\u0027, generatedDocuments: \u0027/webhook/generated-documents\u0027, auditEvents: \u0027/webhook/audit-events\u0027, settings: \u0027/webhook/settings\u0027, integrationsStatus: \u0027/webhook/integrations/status\u0027, integrationTest: \u0027/webhook/integrations/{integrationKey}/test\u0027, integrationsTestAll: \u0027/webhook/integrations/test-all\u0027 };\nreturn [{ json: { status: overallStatus, generatedAt: now, environment: \u0027n8n\u0027, services: [ { name: \u0027n8n backend\u0027, status: \u0027ok\u0027, detail: \u0027Health workflow executed successfully\u0027 }, { name: \u0027Supabase DB\u0027, status: supabaseDb.status, detail: supabaseDb.detail }, { name: \u0027Supabase Storage\u0027, status: supabaseStorage.status, detail: supabaseStorage.detail }, { name: \u0027ChromaDB\u0027, status: chromaDb.status, detail: chromaDb.detail, config: chromaConfig.config || null }, { name: \u0027Extractor Service\u0027, status: fastapiStatus.status, detail: fastapiStatus.detail }, { name: \u0027Converter Service\u0027, status: converterStatus.status, detail: converterStatus.detail }, { name: \u0027OpenAI\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used by vision extraction, embeddings, and generation; not pinged to avoid costs\u0027 }, { name: \u0027Confluence\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used inside generation workflow for document pages\u0027 }, { name: \u0027Jira\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used inside generation workflow for user stories\u0027 } ], webhooks, integrations: { supabaseDb: supabaseDb.status, supabaseStorage: supabaseStorage.status, chromaDb: chromaDb.status, extractorService: fastapiStatus.status, converterService: converterStatus.status, openai: \u0027backend-managed\u0027, jira: \u0027backend-managed\u0027, confluence: \u0027backend-managed\u0027 } } }];"
}
```

### Check: ChromaDB

| Field | Value |
| --- | --- |
| Node ID | 2c2fe7d7-9672-4d6d-a76d-fc7d9988f3e6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Chroma Health URL -> Check: ChromaDB (output 0, input 0)

**Outgoing Connections**

- Check: ChromaDB -> Wait for All Checks (output 0, input 2)

**Credential References**

```json
{
    "httpCustomAuth":  {
                           "id":  "DpZbhUxkEbKeXIiJ",
                           "name":  "supabase-service-role-key"
                       },
    "httpHeaderAuth":  {
                           "id":  "VEfALxz8xI4oVcRR",
                           "name":  "chromadb-cloud-key"
                       }
}
```

**Full Parameter Snapshot**

```json
{
    "url":  "={{ $json.url }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Check: Extractor Service

| Field | Value |
| --- | --- |
| Node ID | aeda8705-6439-48af-9a17-787f66ef6d97 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: Extractor Service (output 0, input 0)

**Outgoing Connections**

- Check: Extractor Service -> Wait for All Checks (output 0, input 3)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://127.0.0.1:8001/health",
    "options":  {

                }
}
```

### Check: MD->DOCX Converter Service

| Field | Value |
| --- | --- |
| Node ID | 2ab38c4d-9b27-406c-be6e-7c17ba9dd476 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 768 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: MD->DOCX Converter Service (output 0, input 0)

**Outgoing Connections**

- Check: MD->DOCX Converter Service -> Wait for All Checks (output 0, input 4)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://127.0.0.1:5050/health",
    "options":  {

                }
}
```

### Check: Supabase DB

| Field | Value |
| --- | --- |
| Node ID | ba07272f-74f7-4cbb-acf5-39582469494c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: Supabase DB (output 0, input 0)

**Outgoing Connections**

- Check: Supabase DB -> Wait for All Checks (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "id,created_at,event,pipeline"
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

### Check: Supabase Storage

| Field | Value |
| --- | --- |
| Node ID | 0490076d-f6e4-4319-9997-f76a5ce1a1fb |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: Supabase Storage (output 0, input 0)

**Outgoing Connections**

- Check: Supabase Storage -> Wait for All Checks (output 0, input 1)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/storage/v1/bucket/uploaded-project-docs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Chroma Settings

| Field | Value |
| --- | --- |
| Node ID | 26f188c8-85b3-4381-9636-420c5e632eb1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 384 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Fetch Chroma Settings (output 0, input 0)

**Outgoing Connections**

- Fetch Chroma Settings -> Build Chroma Health URL (output 0, input 0)

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
                                                   "value":  "environment_key,integration_key,display_name,enabled,status,config,settings_version"
                                               },
                                               {
                                                   "name":  "environment_key",
                                                   "value":  "eq.local"
                                               },
                                               {
                                                   "name":  "integration_key",
                                                   "value":  "eq.chroma"
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

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | 6b943e84-e110-4328-8325-5cf2600a9416 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build Health Response -> Respond to Webhook (output 0, input 0)

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
                    "responseCode":  200
                }
}
```

### Wait for All Checks

| Field | Value |
| --- | --- |
| Node ID | d82a803c-68d7-4ed2-ae11-cd43f29729fd |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 896, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check: Supabase DB -> Wait for All Checks (output 0, input 0)
- Check: Supabase Storage -> Wait for All Checks (output 0, input 1)
- Check: ChromaDB -> Wait for All Checks (output 0, input 2)
- Check: Extractor Service -> Wait for All Checks (output 0, input 3)
- Check: MD->DOCX Converter Service -> Wait for All Checks (output 0, input 4)

**Outgoing Connections**

- Wait for All Checks -> Build Health Response (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "mode":  "combine",
    "combineBy":  "combineByPosition",
    "numberInputs":  5,
    "options":  {
                    "includeUnpaired":  true
                }
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | 61a4da1f-0de3-4a66-ad09-e4463f8ca7ed |
| Type | n8n-nodes-base.webhook |
| Type Version | 2 |
| Position | 0, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook -> Check: Supabase DB (output 0, input 0)
- Webhook -> Check: Supabase Storage (output 0, input 0)
- Webhook -> Fetch Chroma Settings (output 0, input 0)
- Webhook -> Check: Extractor Service (output 0, input 0)
- Webhook -> Check: MD->DOCX Converter Service (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "health",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```
