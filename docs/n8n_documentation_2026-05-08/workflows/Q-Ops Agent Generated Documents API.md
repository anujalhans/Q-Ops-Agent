# Q-Ops Agent Generated Documents API

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | mucEtw68lUvv9T6f |
| Active | True |
| Created At | 2026-05-07T05:53:59.139Z |
| Updated At | 2026-05-07T05:53:59.139Z |
| Node Count | 4 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\Q-Ops Agent Generated Documents API.json |

## Description

Draft additive UI API for GET /webhook/generated-documents backed by qa_jobs. Assign supabase-service-role-key before activation.

## Trigger And Entry Contract

- GET /generated-documents | n8n-nodes-base.webhook | generated-documents
- Respond Generated Documents | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/generated-documents

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

- GET /generated-documents -> Fetch QA Jobs (source output 0, target input 0)
- Fetch QA Jobs -> Map Generated Documents Response (source output 0, target input 0)
- Map Generated Documents Response -> Respond Generated Documents (source output 0, target input 0)

## Nodes

### Fetch QA Jobs

| Field | Value |
| --- | --- |
| Node ID | 0a523a6a-7af8-47b2-8eba-1e68c53dfa87 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /generated-documents -> Fetch QA Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch QA Jobs -> Map Generated Documents Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,input,output,created_at,updated_at"
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

### GET /generated-documents

| Field | Value |
| --- | --- |
| Node ID | 96dca69d-0929-4f08-971b-ec4a71ddde0b |
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

- GET /generated-documents -> Fetch QA Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "generated-documents",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map Generated Documents Response

| Field | Value |
| --- | --- |
| Node ID | a65c6839-5bcb-4ec0-9994-5e40acb76017 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch QA Jobs -> Map Generated Documents Response (output 0, input 0)

**Outgoing Connections**

- Map Generated Documents Response -> Respond Generated Documents (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const documents = $input.all().map(i =\u003e i.json).filter(j =\u003e j \u0026\u0026 j.job_id).map(j =\u003e ({ id: j.job_id, jobId: j.job_id, projectName: j.input?.projectName || \u0027Unknown project\u0027, documentType: j.input?.documentType || \u0027\u0027, artifactLabel: j.input?.documentType || \u0027\u0027, createdAt: j.created_at, status: j.status, url: j.output?.url || j.output?.confluenceUrl || \u0027\u0027, output: j.output || null })); return [{ json: { documents } }];"
}
```

### Respond Generated Documents

| Field | Value |
| --- | --- |
| Node ID | cab88013-37ef-4aed-9bce-6bacaa535ad8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Generated Documents Response -> Respond Generated Documents (output 0, input 0)

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

