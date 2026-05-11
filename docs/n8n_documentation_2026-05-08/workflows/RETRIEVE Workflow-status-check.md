# RETRIEVE Workflow-status-check

Generated from the active/published workflow JSON backup on 2026-05-08.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | b63H3FLO9nFujtQp |
| Active | True |
| Created At | 2026-04-17T10:32:08.107Z |
| Updated At | 2026-05-07T05:15:46.550Z |
| Node Count | 5 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-08\Published\RETRIEVE Workflow-status-check.json |

## Description

No workflow description is set in n8n.

## Trigger And Entry Contract

- Webhook | n8n-nodes-base.webhook | /job-status-retrieve
- Respond to Webhook | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/job-status-retrieve

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

## Connection Graph

- Webhook -> Edit Fields (source output 0, target input 0)
- Edit Fields -> Check Status (source output 0, target input 0)
- Check Status -> Code in JavaScript (source output 0, target input 0)
- Code in JavaScript -> Respond to Webhook (source output 0, target input 0)

## Nodes

### Check Status

| Field | Value |
| --- | --- |
| Node ID | b4eb7550-dfba-44ad-adb9-86a63b199913 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 32, 112 |
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
    "httpCustomAuth":  {
                           "id":  "W6PsBv4SlXFSR6Kk",
                           "name":  "supabase-anon-key"
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
                                                   "name":  "job_id",
                                                   "value":  "=eq.{{ $json.jobId }}"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,output"
                                               }
                                           ]
                        },
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\" \n}",
    "options":  {

                }
}
```

### Code in JavaScript

| Field | Value |
| --- | --- |
| Node ID | cac52f7c-5046-494c-afd6-49fd33c0d555 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 240, 112 |
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
    "jsCode":  "const inputJobId = $input.first().json.jobId;\n\n// Handle both array and object responses\nlet record = Array.isArray($json) ? $json[0] : $json;\n\nif (!record || !record.job_id) {\n  return [\n    {\n      json: {\n        jobId: inputJobId,\n        status: \"not_found\",\n        output: null\n      }\n    }\n  ];\n}\n\n// ðŸ”¥ Ensure output is ALWAYS either null OR object (never string)\nlet output = record.output ?? null;\n\n// Optional safety (only if your DB might accidentally store stringified JSON)\nif (typeof output === \"string\") {\n  try {\n    output = JSON.parse(output);\n  } catch (e) {\n    output = null;\n  }\n}\n\nreturn [\n  {\n    json: {\n      jobId: record.job_id,\n      status: record.status,\n      output: output\n    }\n  }\n];"
}
```

### Edit Fields

| Field | Value |
| --- | --- |
| Node ID | 3f5b568b-10f4-4546-a3c7-ae5a7ca41723 |
| Type | n8n-nodes-base.set |
| Type Version | 3.4 |
| Position | -176, 112 |
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
| Node ID | 5abd57a5-86ba-49a3-b83c-f3c243e55742 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 448, 112 |
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
    "responseBody":  "={{ {\n  jobId: $json.jobId,\n  status: $json.status,\n  output: $json.output\n} }}",
    "options":  {

                }
}
```

### Webhook

| Field | Value |
| --- | --- |
| Node ID | 4d657a03-26be-4bf7-9489-8a0a7e861f18 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | -384, 112 |
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
    "path":  "/job-status-retrieve",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

