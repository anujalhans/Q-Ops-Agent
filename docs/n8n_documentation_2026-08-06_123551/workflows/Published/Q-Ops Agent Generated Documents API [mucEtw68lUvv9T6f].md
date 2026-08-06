# Q-Ops Agent Generated Documents API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | mucEtw68lUvv9T6f |
| Active | True |
| Created At | 2026-05-07T05:53:59.139Z |
| Updated At | 2026-06-10T02:51:03.458Z |
| Node Count | 4 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Generated Documents API [mucEtw68lUvv9T6f].json |

## Description

Returns generated-document jobs with input lineage, retry/update metadata, and output details for UI retry and modal workflows.

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
| Node ID | c33e5fc7-05c0-44fe-9ebc-e3cc671f8203 |
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
                                                   "value":  "job_id,status,input,output,error,created_at,updated_at,project_id,requested_by,settings_version,retry_of_job_id,retried_by_job_id,retry_status,retry_attempt"
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
| Node ID | 07cd4b8a-2d84-4f2c-9244-9094ce11b5e8 |
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
| Node ID | 9924c2ab-c716-4e5b-9398-6bf1436f6832 |
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
    "jsCode":  "const documents = $input.all()\n  .map(i =\u003e i.json)\n  .filter(j =\u003e j \u0026\u0026 j.job_id)\n  .map(j =\u003e {\n    const input = j.input \u0026\u0026 typeof j.input === \u0027object\u0027 ? j.input : {};\n    const retryContext = input.retryContext \u0026\u0026 typeof input.retryContext === \u0027object\u0027 ? input.retryContext : {};\n    const updateContext = input.updateContext \u0026\u0026 typeof input.updateContext === \u0027object\u0027 ? input.updateContext : {};\n    const output = j.output \u0026\u0026 typeof j.output === \u0027object\u0027 ? j.output : null;\n    const outputUpdateContext = output?.updateContext \u0026\u0026 typeof output.updateContext === \u0027object\u0027 ? output.updateContext : {};\n    const outputRetryContext = output?.retryContext \u0026\u0026 typeof output.retryContext === \u0027object\u0027 ? output.retryContext : {};\n    const generationMode = input.generationMode || retryContext.generationMode || output?.generationMode || output?.metadata?.generation_mode || null;\n    const updateOfJobId = input.updateOfJobId || input.update_of_job_id || updateContext.previousJobId || updateContext.previous_job_id || retryContext.updateOfJobId || retryContext.update_of_job_id || output?.updateOfJobId || outputUpdateContext.previousJobId || output?.metadata?.update_of_job_id || null;\n    const retryOfJobId = j.retry_of_job_id || input.retryOfJobId || input.retry_of_job_id || input.retryJobId || retryContext.retryOfJobId || retryContext.retry_of_job_id || output?.retryOfJobId || outputRetryContext.retryOfJobId || output?.metadata?.retry_of_job_id || null;\n    return {\n      id: j.job_id,\n      jobId: j.job_id,\n      projectId: j.project_id || output?.destination?.projectId || null,\n      projectName: input.projectName || output?.projectName || \u0027Unknown project\u0027,\n      documentType: input.documentType || output?.documentType || \u0027\u0027,\n      artifactLabel: input.documentType || output?.artifactLabel || \u0027\u0027,\n      createdAt: j.created_at,\n      updatedAt: j.updated_at,\n      status: j.status,\n      url: output?.url || output?.confluenceUrl || \u0027\u0027,\n      input,\n      output,\n      error: j.error || null,\n      requestedBy: j.requested_by || null,\n      settingsVersion: j.settings_version || null,\n      retryOfJobId,\n      retriedByJobId: j.retried_by_job_id || null,\n      retryStatus: j.retry_status || null,\n      retryAttempt: Number(j.retry_attempt) || 0,\n      generationMode,\n      updateOfJobId\n    };\n  });\nreturn [{ json: { documents } }];"
}
```

### Respond Generated Documents

| Field | Value |
| --- | --- |
| Node ID | 08fd9d39-e799-404a-aced-5e46a9f7dd66 |
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
