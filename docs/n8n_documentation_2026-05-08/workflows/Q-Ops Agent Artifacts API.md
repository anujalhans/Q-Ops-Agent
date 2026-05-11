# Q-Ops Agent Artifacts API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | YFsr2hRD7BZlPCEK |
| Active | True |
| Created At | 2026-05-07T05:53:42.864Z |
| Updated At | 2026-05-07T05:53:42.864Z |
| Node Count | 4 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Artifacts API.json |

## Description

Draft additive UI API for GET /webhook/artifacts backed by doc_ingestion_jobs. Assign supabase-service-role-key before activation.

## Trigger And Entry Contract

- GET /artifacts | n8n-nodes-base.webhook | artifacts
- Respond Artifacts | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/artifacts

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- GET /artifacts -> Fetch Ingestion Jobs (source output 0, target input 0)
- Fetch Ingestion Jobs -> Map Artifacts Response (source output 0, target input 0)
- Map Artifacts Response -> Respond Artifacts (source output 0, target input 0)

## Nodes

### Fetch Ingestion Jobs

| Field | Value |
| --- | --- |
| Node ID | 8ccdbdb3-c970-4567-9611-e872061f5c3e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /artifacts -> Fetch Ingestion Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch Ingestion Jobs -> Map Artifacts Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,created_at,updated_at,error"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "200"
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

### GET /artifacts

| Field | Value |
| --- | --- |
| Node ID | af529232-24b1-4e87-8f8b-8c94b0ba7091 |
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

- GET /artifacts -> Fetch Ingestion Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "artifacts",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Artifacts Response

| Field | Value |
| --- | --- |
| Node ID | 3acae756-92d2-4dbe-8b59-a969fd4f4240 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Ingestion Jobs -> Map Artifacts Response (output 0, input 0)

**Outgoing Connections**

- Map Artifacts Response -> Respond Artifacts (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const artifacts = []; const statusMap = { completed: \u0027processed\u0027, failed: \u0027failed\u0027, pending: \u0027processing\u0027, processing: \u0027processing\u0027 }; for (const item of $input.all()) { const job = item.json; if (!job || !job.job_id) continue; const input = job.input || {}; const files = input.files || {}; for (const [type, url] of Object.entries(files)) { const rawName = String(url).split(\u0027/\u0027).pop() || type; artifacts.push({ id: `${job.job_id}:${type}`, projectName: input.projectName || \u0027Unknown project\u0027, type, fileName: decodeURIComponent(rawName), uploadedAt: job.created_at, status: statusMap[job.status] || \u0027processing\u0027, url, jobId: job.job_id }); } } return [{ json: { artifacts } }];"
}
```

### Respond Artifacts

| Field | Value |
| --- | --- |
| Node ID | 83c06237-a348-4faa-93be-77b86fda6aaa |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Artifacts Response -> Respond Artifacts (output 0, input 0)

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

