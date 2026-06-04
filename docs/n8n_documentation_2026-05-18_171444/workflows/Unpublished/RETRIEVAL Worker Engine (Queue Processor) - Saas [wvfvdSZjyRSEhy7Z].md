# RETRIEVAL Worker Engine (Queue Processor) - Saas

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | wvfvdSZjyRSEhy7Z |
| Active | False |
| Archived | False |
| Created At | 2026-04-01T04:04:46.967Z |
| Updated At | 2026-05-07T05:15:42.073Z |
| Node Count | 7 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\RETRIEVAL Worker Engine (Queue Processor) - Saas [wvfvdSZjyRSEhy7Z].json |

## Description

No workflow description configured.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 1 |
| n8n-nodes-base.executeWorkflow | 1 |
| n8n-nodes-base.httpRequest | 2 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.scheduleTrigger | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-anon-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?status=eq.pending&order=created_at.asc&limit=1

### Supabase/Data Table Hints

- qa_jobs

## Connection Graph

- Schedule Trigger -> Get Pending Jobs (source output 0, target input 0)
- Lock Pending Job picked for processing -> Status = Processing Updated? (source output 0, target input 0)
- Status = Processing Updated? -> Prepare Job Input (source output 0, target input 0)
- Get Pending Jobs -> Pending Job Exists? (source output 0, target input 0)
- Pending Job Exists? -> Lock Pending Job picked for processing (source output 0, target input 0)
- Prepare Job Input -> Call 'Document Generator AI Agent - SaaS' (source output 0, target input 0)

## Nodes

### Call 'Document Generator AI Agent - SaaS'

| Field | Value |
| --- | --- |
| Node ID | 0ea14537-91b3-4c47-8af2-0fae9a24e762 |
| Type | n8n-nodes-base.executeWorkflow |
| Type Version | 1.3 |
| Position | -4560, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Job Input -> Call 'Document Generator AI Agent - SaaS' (output 0, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "workflowId":  {
                       "__rl":  true,
                       "value":  "0G3qlenjAeBnHDTr",
                       "mode":  "list",
                       "cachedResultUrl":  "/workflow/0G3qlenjAeBnHDTr",
                       "cachedResultName":  "Document Generator AI Agent - SaaS"
                   },
    "workflowInputs":  {
                           "mappingMode":  "defineBelow",
                           "value":  {

                                     },
                           "matchingColumns":  [

                                               ],
                           "schema":  [

                                      ],
                           "attemptToConvertTypes":  false,
                           "convertFieldsToString":  true
                       },
    "options":  {
                    "waitForSubWorkflow":  true
                }
}
```

### Get Pending Jobs

| Field | Value |
| --- | --- |
| Node ID | b18174ce-0b8c-4fdf-bf49-a480259aa1a2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -5888, 624 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending Jobs -> Pending Job Exists? (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?status=eq.pending\u0026order=created_at.asc\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\" \n}",
    "options":  {

                }
}
```

### Lock Pending Job picked for processing

| Field | Value |
| --- | --- |
| Node ID | 19fc22c7-5c83-4286-a7d6-90a08071cbe6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | -5360, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending Job Exists? -> Lock Pending Job picked for processing (output 0, input 0)

**Outgoing Connections**

- Lock Pending Job picked for processing -> Status = Processing Updated? (output 0, input 0)

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
    "method":  "PATCH",
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?job_id=eq.{{ $json.job_id }}\u0026status=eq.pending ",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \n  \"Content-Type\": \"application/json\",\n  \"Prefer\": \"return=representation\" \n}",
    "sendBody":  true,
    "bodyParameters":  {
                           "parameters":  [
                                              {
                                                  "name":  "status",
                                                  "value":  "processing"
                                              }
                                          ]
                       },
    "options":  {

                }
}
```

### Pending Job Exists?

| Field | Value |
| --- | --- |
| Node ID | a22efbb7-9c7e-4daa-bb7b-8025b4427dec |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -5616, 624 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending Jobs -> Pending Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending Job Exists? -> Lock Pending Job picked for processing (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "strict",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "c0314ece-605e-45a9-acb9-860fc2d11e56",
                                              "leftValue":  "={{Object.keys($json).length}}",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Prepare Job Input

| Field | Value |
| --- | --- |
| Node ID | e2e12048-be03-44c3-a274-986c3b9c516e |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | -4784, 592 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Status = Processing Updated? -> Prepare Job Input (output 0, input 0)

**Outgoing Connections**

- Prepare Job Input -> Call 'Document Generator AI Agent - SaaS' (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = Array.isArray($json) ? $json[0] : $json;\n\nreturn [{\n  json: {\n    jobId: job.job_id,\n    originalJobStatus: job.status,\n    ...job.input\n  }\n}];"
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | 22283ab9-7ca1-4fee-9226-f1106a64be3d |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | -6128, 624 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending Jobs (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "rule":  {
                 "interval":  [
                                  {
                                      "field":  "seconds",
                                      "secondsInterval":  20
                                  }
                              ]
             }
}
```

### Status = Processing Updated?

| Field | Value |
| --- | --- |
| Node ID | e60938f7-5241-41ec-99c4-b61b8c09fa35 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | -5120, 608 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock Pending Job picked for processing -> Status = Processing Updated? (output 0, input 0)

**Outgoing Connections**

- Status = Processing Updated? -> Prepare Job Input (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "conditions":  {
                       "options":  {
                                       "caseSensitive":  true,
                                       "leftValue":  "",
                                       "typeValidation":  "loose",
                                       "version":  3
                                   },
                       "conditions":  [
                                          {
                                              "id":  "c2905e12-f1ce-4d8b-84c5-8dd919a56d90",
                                              "leftValue":  "={{ Object.keys($json).length}} ",
                                              "rightValue":  0,
                                              "operator":  {
                                                               "type":  "number",
                                                               "operation":  "gt"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "looseTypeValidation":  true,
    "options":  {

                }
}
```
