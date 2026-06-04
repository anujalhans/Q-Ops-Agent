# RETRIEVAL Job Queue Creator - SaaS

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | sbUy9luTFnRJ52El |
| Active | False |
| Archived | False |
| Created At | 2026-03-31T11:43:44.909Z |
| Updated At | 2026-05-07T05:15:24.882Z |
| Node Count | 5 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\RETRIEVAL Job Queue Creator - SaaS [sbUy9luTFnRJ52El].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | POST | generate-qa-doc
- Respond to Webhook | n8n-nodes-base.respondToWebhook |  | 
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- POST /webhook/generate-qa-doc

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 2 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs

### Supabase/Data Table Hints

- qa_job_metrics
- qa_jobs

## Connection Graph

- Webhook -> Generate Job ID (source output 0, target input 0)
- Generate Job ID -> Insert JobID into Supabase DB (source output 0, target input 0)
- Insert JobID into Supabase DB -> LOG: Job Queued (source output 0, target input 0)
- LOG: Job Queued -> Respond to Webhook (source output 0, target input 0)

## Nodes

### Generate Job ID

| Field | Value |
| --- | --- |
| Node ID | 4d22a06c-6316-4ee8-bae0-26d56496bbeb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4768, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Generate Job ID (output 0, input 0)

**Outgoing Connections**

- Generate Job ID -> Insert JobID into Supabase DB (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027); // YYMMDD\n\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\n\nconst jobId = `GEN-${datePart}-${randomPart}`;\n\nreturn [{\n  json: {\n    jobId,\n    input: $json.body\n  }\n}];\n\n/*return [{\n  json: {\n    jobId: \"JOB_\" + Date.now(),\n    input: $json.body\n  }\n}];*/"
}
```

### Insert JobID into Supabase DB

| Field | Value |
| --- | --- |
| Node ID | 4c270433-163c-4960-b343-b626f1605156 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -4528, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Generate Job ID -> Insert JobID into Supabase DB (output 0, input 0)

**Outgoing Connections**

- Insert JobID into Supabase DB -> LOG: Job Queued (output 0, input 0)

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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "job_id",
                                                  "value":  "={{ $json.jobId }}"
                                              },
                                              {
                                                  "name":  "status",
                                                  "value":  "pending"
                                              },
                                              {
                                                  "name":  "input",
                                                  "value":  "={{ $json.input }}"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### LOG: Job Queued

| Field | Value |
| --- | --- |
| Node ID | d405bd53-a23b-4a12-95a1-2269188a109e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -4320, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert JobID into Supabase DB -> LOG: Job Queued (output 0, input 0)

**Outgoing Connections**

- LOG: Job Queued -> Respond to Webhook (output 0, input 0)

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
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Prefer\": \"return=minimal\"\n}",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={\n  \"job_id\":       \"{{ $(\u0027Generate Job ID\u0027).item.json.jobId }}\",\n  \"project_name\": \"{{ $(\u0027Generate Job ID\u0027).item.json.input.projectName }}\",\n  \"document_type\":\"{{ $(\u0027Generate Job ID\u0027).item.json.input.documentType }}\",\n  \"pipeline\":     \"generation\",\n  \"event\":        \"JOB_QUEUED\",\n  \"status\":       \"info\",\n  \"metadata\": {\n    \"product_owner\": \"{{ $(\u0027Generate Job ID\u0027).item.json.input.productOwner }}\"\n  }\n}",
    "options":  {

                }
}
```

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | 6e345aa6-d3cc-4c62-9a5e-cf6aa5820dd5 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | -4080, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- LOG: Job Queued -> Respond to Webhook (output 0, input 0)

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
    "responseBody":  "={\n  \"jobId\": \"{{ $(\u0027Generate Job ID\u0027).item.json.jobId }}\",\n  \"status\": \"queued\"\n}",
    "options":  {

                }
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | 1a5e3fca-09c9-4a93-bccc-bdadfbbceaa4 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -5008, 416 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Webhook -> Generate Job ID (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "generate-qa-doc",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```
