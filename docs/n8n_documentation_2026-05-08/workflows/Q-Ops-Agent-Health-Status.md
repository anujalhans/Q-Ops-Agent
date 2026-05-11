# Q-Ops-Agent-Health-Status

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | zdx8YtZJOMWtbv1L |
| Active | True |
| Created At | 2026-05-04T10:19:08.462Z |
| Updated At | 2026-05-07T06:17:14.536Z |
| Node Count | 9 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops-Agent-Health-Status.json |

## Description

Health/status endpoint with repository and settings webhook registry entries advertised for the Q-Ops Agent UI.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | health
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/health

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.merge | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key
- httpCustomAuth: supabase-service-role-key
- httpHeaderAuth: chromadb-cloud-key

## Connection Graph

- Webhook -> Check: Supabase DB (source output 0, target input 0)
- Webhook -> Check: Supabase Storage (source output 0, target input 0)
- Webhook -> Check: ChromaDB (source output 0, target input 0)
- Webhook -> Check: FastAPI Image Extractor (source output 0, target input 0)
- Webhook -> Check: MD->DOCX Converter Service (source output 0, target input 0)
- Check: Supabase DB -> Wait for All Checks (source output 0, target input 0)
- Wait for All Checks -> Build Health Response (source output 0, target input 0)
- Check: Supabase Storage -> Wait for All Checks (source output 0, target input 1)
- Check: ChromaDB -> Wait for All Checks (source output 0, target input 2)
- Check: FastAPI Image Extractor -> Wait for All Checks (source output 0, target input 3)
- Check: MD->DOCX Converter Service -> Wait for All Checks (source output 0, target input 4)
- Build Health Response -> Respond to Webhook (source output 0, target input 0)

## Nodes

### Build Health Response

| Field | Value |
| --- | --- |
| Node ID | 122b4b93-859e-469b-9b38-310c25b507b1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 384 |
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
    "jsCode":  "const now = new Date().toISOString();\nfunction checkResult(nodeName, options = {}) {\n  const successDetailBuilder = options.successDetailBuilder;\n  const defaultOkDetail = options.defaultOkDetail || null;\n  const downMessage = options.downMessage;\n  try {\n    const items = $items(nodeName);\n    if (!items || items.length === 0) return { status: \u0027unreachable\u0027, detail: \u0027No response received\u0027 };\n    const json = items[0].json || {};\n    if (json.error || json.statusCode \u003e= 400 || (typeof json.message === \u0027string\u0027 \u0026\u0026 json.message.toLowerCase().includes(\u0027error\u0027))) {\n      return { status: downMessage ? \u0027down\u0027 : \u0027error\u0027, detail: json.message || json.error?.message || JSON.stringify(json.error) || downMessage || \u0027Unknown error\u0027 };\n    }\n    if (successDetailBuilder) return { status: \u0027ok\u0027, detail: successDetailBuilder(json) };\n    return { status: \u0027ok\u0027, detail: defaultOkDetail };\n  } catch (e) {\n    return { status: downMessage ? \u0027down\u0027 : \u0027unreachable\u0027, detail: e.message };\n  }\n}\nconst supabaseDb = checkResult(\u0027Check: Supabase DB\u0027, { successDetailBuilder: (json) =\u003e { const record = Array.isArray(json) ? json[0] : json; return record?.created_at ? `Last event: ${record.event} at ${record.created_at}` : \u0027Reachable, no records yet\u0027; } });\nconst supabaseStorage = checkResult(\u0027Check: Supabase Storage\u0027, { successDetailBuilder: (json) =\u003e `Bucket \"${json?.name || \u0027uploaded-project-docs\u0027}\" reachable` });\nconst chromaDb = checkResult(\u0027Check: ChromaDB\u0027, { successDetailBuilder: (json) =\u003e { const vectorCount = json?.count_documents ?? \u0027unknown\u0027; const collectionName = json?.name || \u0027qa-chunks-batches\u0027; const database = json?.database || \u0027QA-Documents-Chunk\u0027; return `Collection \"${collectionName}\" in database \"${database}\" reachable. Vectors: ${vectorCount}`; } });\nconst fastapiStatus = checkResult(\u0027Check: FastAPI Image Extractor\u0027, { downMessage: \u0027FastAPI extractor unreachable at :8000. Run: pm2 start doc-extractor\u0027, successDetailBuilder: (json) =\u003e json?.status || \u0027Reachable at http://127.0.0.1:8000\u0027 });\nconst converterStatus = checkResult(\u0027Check: MD-\u003eDOCX Converter Service\u0027, { downMessage: \u0027Converter service unreachable at :5050. Run: pm2 start format-converter\u0027, successDetailBuilder: (json) =\u003e json?.status || \u0027Reachable at http://127.0.0.1:5050\u0027 });\nconst allServices = [supabaseDb, supabaseStorage, chromaDb, fastapiStatus, converterStatus];\nlet overallStatus = \u0027ok\u0027;\nif (allServices.some(s =\u003e s.status === \u0027down\u0027 || s.status === \u0027unreachable\u0027)) overallStatus = \u0027degraded\u0027;\nif (allServices.some(s =\u003e s.status === \u0027error\u0027)) overallStatus = \u0027error\u0027;\nconst webhooks = {\n  upload: \u0027/webhook/upload-test-artifacts\u0027,\n  ingestionStatus: \u0027/webhook/job-status?jobId=...\u0027,\n  generate: \u0027/webhook/generate-qa-doc\u0027,\n  generationStatus: \u0027/webhook/job-status-retrieve?jobId=...\u0027,\n  analytics: \u0027/webhook/analytics-summary?pipeline=all\u0026days=30\u0027,\n  health: \u0027/webhook/health\u0027,\n  projects: \u0027/webhook/projects\u0027,\n  artifacts: \u0027/webhook/artifacts\u0027,\n  generatedDocuments: \u0027/webhook/generated-documents\u0027,\n  auditEvents: \u0027/webhook/audit-events\u0027,\n  settings: \u0027/webhook/settings\u0027,\n  integrationsStatus: \u0027/webhook/integrations/status\u0027,\n  integrationTest: \u0027/webhook/integrations/{integrationKey}/test\u0027,\n  integrationsTestAll: \u0027/webhook/integrations/test-all\u0027\n};\nreturn [{ json: { status: overallStatus, generatedAt: now, environment: \u0027n8n\u0027, services: [ { name: \u0027n8n backend\u0027, status: \u0027ok\u0027, detail: \u0027Health workflow executed successfully\u0027 }, { name: \u0027Supabase DB\u0027, status: supabaseDb.status, detail: supabaseDb.detail }, { name: \u0027Supabase Storage\u0027, status: supabaseStorage.status, detail: supabaseStorage.detail }, { name: \u0027ChromaDB\u0027, status: chromaDb.status, detail: chromaDb.detail }, { name: \u0027FastAPI Extractor\u0027, status: fastapiStatus.status, detail: fastapiStatus.detail }, { name: \u0027Converter Service\u0027, status: converterStatus.status, detail: converterStatus.detail }, { name: \u0027OpenAI\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used by vision extraction, embeddings, and generation; not pinged to avoid costs\u0027 }, { name: \u0027Confluence\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used inside generation workflow for document pages\u0027 }, { name: \u0027Jira\u0027, status: \u0027backend-managed\u0027, detail: \u0027Used inside generation workflow for user stories\u0027 } ], webhooks, integrations: { supabaseDb: supabaseDb.status, supabaseStorage: supabaseStorage.status, chromaDb: chromaDb.status, fastapiExtractor: fastapiStatus.status, converterService: converterStatus.status, openai: \u0027backend-managed\u0027, jira: \u0027backend-managed\u0027, confluence: \u0027backend-managed\u0027 } } }];"
}
```

### Check: ChromaDB

| Field | Value |
| --- | --- |
| Node ID | e7ca8866-f8bc-425e-a709-e3e46c6bebb8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 384 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: ChromaDB (output 0, input 0)

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
    "url":  "https://api.trychroma.com/api/v2/tenants/14e8907a-74b1-4590-b394-2b32e9e0b03f/databases/QA-Documents-Chunk/collections/qa-chunks-batches",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpHeaderAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Check: FastAPI Image Extractor

| Field | Value |
| --- | --- |
| Node ID | a6f95819-1ab6-41eb-803e-2b066b02b3b1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 576 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail | True |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Check: FastAPI Image Extractor (output 0, input 0)

**Outgoing Connections**

- Check: FastAPI Image Extractor -> Wait for All Checks (output 0, input 3)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "http://127.0.0.1:8000/health",
    "options":  {

                }
}
```

### Check: MD->DOCX Converter Service

| Field | Value |
| --- | --- |
| Node ID | e19d4645-2f8a-472a-81a0-0f64f95ceebe |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 768 |
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
| Node ID | 130f3556-3786-46d5-8910-420d87018b8c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
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
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
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
| Node ID | f0daae44-1018-4224-bf58-c81bb903a91e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 192 |
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

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | 6bd7f317-8c6d-4a0e-a23e-1af90b92c27d |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.1 |
| Position | 896, 384 |
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
| Node ID | 0d500825-754d-4246-8905-b21f5f002deb |
| Type | n8n-nodes-base.merge |
| Type Version | 3.2 |
| Position | 448, 336 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check: Supabase DB -> Wait for All Checks (output 0, input 0)
- Check: Supabase Storage -> Wait for All Checks (output 0, input 1)
- Check: ChromaDB -> Wait for All Checks (output 0, input 2)
- Check: FastAPI Image Extractor -> Wait for All Checks (output 0, input 3)
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
| Node ID | 26ab2f5a-e65c-46ba-a0f7-cf5c1db78960 |
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
- Webhook -> Check: ChromaDB (output 0, input 0)
- Webhook -> Check: FastAPI Image Extractor (output 0, input 0)
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

