# INGEST Workflow-Status-Check

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | KeTwumg3JT7C46BD |
| Active | True |
| Archived | False |
| Created At | 2026-04-16T12:35:36.421Z |
| Updated At | 2026-05-07T05:16:36.650Z |
| Node Count | 5 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\INGEST Workflow-Status-Check [KeTwumg3JT7C46BD].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook |  | /job-status
- Respond to Webhook | n8n-nodes-base.respondToWebhook |  | 
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/job-status

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.httpRequest | 1 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.set | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key
- httpHeaderAuth: Header Auth account

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs

### Supabase/Data Table Hints

- doc_ingestion_jobs

## Connection Graph

- Webhook -> Edit Fields (source output 0, target input 0)
- Edit Fields -> Check Status (source output 0, target input 0)
- Code in JavaScript -> Respond to Webhook (source output 0, target input 0)
- Check Status -> Code in JavaScript (source output 0, target input 0)

## Nodes

### Check Status

| Field | Value |
| --- | --- |
| Node ID | 3e1adb45-75ff-45e0-8df1-41e45cefe562 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 416, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Edit Fields -> Check Status (output 0, input 0)

**Outgoing Connections**

- Check Status -> Code in JavaScript (output 0, input 0)

**Credential References**

```json
{
    "httpHeaderAuth":  {
                           "id":  "skQ4rOdSijyBM3Yv",
                           "name":  "Header Auth account"
                       },
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
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
                                                   "name":  "job_id",
                                                   "value":  "=eq.{{ $json.jobId }}"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{\n  \"Content-Type\": \"application/json\"\n}",
    "options":  {

                }
}
```

### Code in JavaScript

| Field | Value |
| --- | --- |
| Node ID | 0ba49eb3-85c6-4215-9030-5b013b4f8923 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 624, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Check Status -> Code in JavaScript (output 0, input 0)

**Outgoing Connections**

- Code in JavaScript -> Respond to Webhook (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const inputJobId = $input.first().json.jobId;\n\nif (!$json || !$json.job_id) {\n  return [\n    {\n      json: {\n        jobId: inputJobId,\n        status: \"not_found\"\n      }\n    }\n  ];\n}\n\nreturn [\n  {\n    json: {\n      jobId: $json.job_id,\n      status: $json.status\n    }\n  }\n];"
}
```

### Edit Fields

| Field | Value |
| --- | --- |
| Node ID | 652fae32-7fdf-4882-939b-9d9e7bdd61d5 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | 208, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Webhook -> Edit Fields (output 0, input 0)

**Outgoing Connections**

- Edit Fields -> Check Status (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "assignments":  {
                        "assignments":  [
                                            {
                                                "id":  "d492c575-93f6-4483-bf92-dce1038f21b2",
                                                "name":  "jobId",
                                                "value":  "={{ $json.query.jobId }}",
                                                "type":  "string"
                                            }
                                        ]
                    },
    "options":  {

                }
}
```

### Respond to Webhook

| Field | Value |
| --- | --- |
| Node ID | 0f8e3456-648d-447a-9fbf-17f8296c816a |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 832, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Code in JavaScript -> Respond to Webhook (output 0, input 0)

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
    "responseBody":  "={\n  \"jobId\": \"{{ $json.jobId }}\",\n  \"status\": \"{{ $json.status }}\"\n}",
    "options":  {

                }
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | af164116-dc44-4621-91fb-6591d7d4ff9d |
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

- Webhook -> Edit Fields (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "/job-status",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

