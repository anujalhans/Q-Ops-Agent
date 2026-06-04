# Q-Ops Agent Repository API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | 8isqdCjPaPqE02eG |
| Active | False |
| Archived | True |
| Created At | 2026-05-07T05:49:11.828Z |
| Updated At | 2026-05-07T05:55:15.000Z |
| Node Count | 31 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Q-Ops Agent Repository API [8isqdCjPaPqE02eG].json |

## Description

Additive UI repository API for Q-Ops projects, artifacts, generated documents, audit events, and artifact reprocess endpoints backed by Supabase.

## Trigger And Entry Contract

- GET /projects | n8n-nodes-base.webhook |  | projects
- Respond Projects | n8n-nodes-base.respondToWebhook |  | 
- Respond Projects | n8n-nodes-base.respondToWebhook
- POST /projects | n8n-nodes-base.webhook | POST | projects
- Respond Project Write | n8n-nodes-base.respondToWebhook |  | 
- Respond Project Write | n8n-nodes-base.respondToWebhook
- GET /artifacts | n8n-nodes-base.webhook |  | artifacts
- Respond Artifacts | n8n-nodes-base.respondToWebhook |  | 
- Respond Artifacts | n8n-nodes-base.respondToWebhook
- GET /generated-documents | n8n-nodes-base.webhook |  | generated-documents
- Respond Generated Documents | n8n-nodes-base.respondToWebhook |  | 
- Respond Generated Documents | n8n-nodes-base.respondToWebhook
- GET /audit-events | n8n-nodes-base.webhook |  | audit-events
- Respond Audit Events | n8n-nodes-base.respondToWebhook |  | 
- Respond Audit Events | n8n-nodes-base.respondToWebhook
- POST /artifacts/:artifactId/reprocess | n8n-nodes-base.webhook | POST | artifacts/:artifactId/reprocess
- Respond Reprocess | n8n-nodes-base.respondToWebhook |  | 
- Respond Reprocess | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/projects
- POST /webhook/projects
- GET/POST /webhook/artifacts
- GET/POST /webhook/generated-documents
- GET/POST /webhook/audit-events
- POST /webhook/artifacts/:artifactId/reprocess

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 8 |
| n8n-nodes-base.httpRequest | 11 |
| n8n-nodes-base.respondToWebhook | 6 |
| n8n-nodes-base.webhook | 6 |

## Credentials Referenced

- None

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_job_metrics
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects

### Supabase/Data Table Hints

- doc_ingestion_jobs
- qa_job_metrics
- qa_jobs
- qops_audit_events
- qops_projects

## Connection Graph

- GET /projects -> Fetch Projects (source output 0, target input 0)
- Fetch Projects -> Map Projects Response (source output 0, target input 0)
- Map Projects Response -> Respond Projects (source output 0, target input 0)
- POST /projects -> Fetch Projects For Upsert (source output 0, target input 0)
- Fetch Projects For Upsert -> Prepare Project Upsert (source output 0, target input 0)
- Prepare Project Upsert -> Upsert Project (source output 0, target input 0)
- Upsert Project -> Map Project Write Response (source output 0, target input 0)
- Map Project Write Response -> Insert Project Audit Event (source output 0, target input 0)
- Insert Project Audit Event -> Respond Project Write (source output 0, target input 0)
- GET /artifacts -> Fetch Ingestion Jobs (source output 0, target input 0)
- Fetch Ingestion Jobs -> Map Artifacts Response (source output 0, target input 0)
- Map Artifacts Response -> Respond Artifacts (source output 0, target input 0)
- GET /generated-documents -> Fetch QA Jobs (source output 0, target input 0)
- Fetch QA Jobs -> Map Generated Documents Response (source output 0, target input 0)
- Map Generated Documents Response -> Respond Generated Documents (source output 0, target input 0)
- GET /audit-events -> Fetch Q-Ops Audit Events (source output 0, target input 0)
- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (source output 0, target input 0)
- Fetch QA Job Metrics For Audit -> Map Audit Events Response (source output 0, target input 0)
- Map Audit Events Response -> Respond Audit Events (source output 0, target input 0)
- POST /artifacts/:artifactId/reprocess -> Prepare Reprocess Lookup (source output 0, target input 0)
- Prepare Reprocess Lookup -> Fetch Reprocess Source Job (source output 0, target input 0)
- Fetch Reprocess Source Job -> Prepare Reprocess Insert (source output 0, target input 0)
- Prepare Reprocess Insert -> Insert Reprocess Ingestion Job (source output 0, target input 0)
- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (source output 0, target input 0)
- Insert Reprocess Metric -> Respond Reprocess (source output 0, target input 0)

## Nodes

### Fetch Ingestion Jobs

| Field | Value |
| --- | --- |
| Node ID | 958ba90f-6e50-4f1c-a759-ff9bd9aa0f88 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 448 |
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
None
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

### Fetch Projects

| Field | Value |
| --- | --- |
| Node ID | def63445-9949-4ff4-88e6-2e37fc59f1d4 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /projects -> Fetch Projects (output 0, input 0)

**Outgoing Connections**

- Fetch Projects -> Map Projects Response (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,name,description,owner,module,release,tags,status,created_at,updated_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "updated_at.desc"
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

### Fetch Projects For Upsert

| Field | Value |
| --- | --- |
| Node ID | 6bde42e2-4fdc-45ed-859d-ecf3790da9c6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 224 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /projects -> Fetch Projects For Upsert (output 0, input 0)

**Outgoing Connections**

- Fetch Projects For Upsert -> Prepare Project Upsert (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,name"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1000"
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

### Fetch QA Job Metrics For Audit

| Field | Value |
| --- | --- |
| Node ID | a3f83f87-3482-469c-81a3-b71284e219fd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 896 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (output 0, input 0)

**Outgoing Connections**

- Fetch QA Job Metrics For Audit -> Map Audit Events Response (output 0, input 0)

**Credential References**

```json
None
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
                                                   "name":  "select",
                                                   "value":  "id,job_id,project_name,document_type,pipeline,event,status,error_message,created_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "100"
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

### Fetch QA Jobs

| Field | Value |
| --- | --- |
| Node ID | 0728dedb-bf54-44e4-8c73-7066d9ee4dcf |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 672 |
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
None
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

### Fetch Q-Ops Audit Events

| Field | Value |
| --- | --- |
| Node ID | 96e2f02b-eaba-4bbe-a616-f27ed8531a90 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 896 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /audit-events -> Fetch Q-Ops Audit Events (output 0, input 0)

**Outgoing Connections**

- Fetch Q-Ops Audit Events -> Fetch QA Job Metrics For Audit (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "select",
                                                   "value":  "id,actor_name,action,entity_type,entity_id,project_id,status,details,metadata,created_at"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.desc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "100"
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

### Fetch Reprocess Source Job

| Field | Value |
| --- | --- |
| Node ID | 224437fb-5787-4a51-bbe3-244e12fd6de7 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Reprocess Lookup -> Fetch Reprocess Source Job (output 0, input 0)

**Outgoing Connections**

- Fetch Reprocess Source Job -> Prepare Reprocess Insert (output 0, input 0)

**Credential References**

```json
None
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
                                                   "name":  "select",
                                                   "value":  "job_id,input,project_id,requested_by,settings_version,config_snapshot"
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

### GET /artifacts

| Field | Value |
| --- | --- |
| Node ID | bbb90996-1c03-4ebd-9078-a37fba1eac94 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 448 |
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

### GET /audit-events

| Field | Value |
| --- | --- |
| Node ID | 05517406-c79b-48df-92fd-330a52a091dc |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 896 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- GET /audit-events -> Fetch Q-Ops Audit Events (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "audit-events",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### GET /generated-documents

| Field | Value |
| --- | --- |
| Node ID | 3f049192-7ed3-4f78-86a4-38719cb08240 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 672 |
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

### GET /projects

| Field | Value |
| --- | --- |
| Node ID | 021aa421-2120-4f4c-93e3-87d81ba1952d |
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

- GET /projects -> Fetch Projects (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "projects",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Insert Project Audit Event

| Field | Value |
| --- | --- |
| Node ID | 6ea1501d-b7b4-4d61-8646-4b97ade0af32 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Project Write Response -> Insert Project Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert Project Audit Event -> Respond Project Write (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.audit }}",
    "options":  {

                }
}
```

### Insert Reprocess Ingestion Job

| Field | Value |
| --- | --- |
| Node ID | fca9ff64-c442-4363-a551-dce6d2976a3a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Reprocess Insert -> Insert Reprocess Ingestion Job (output 0, input 0)

**Outgoing Connections**

- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "POST",
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/doc_ingestion_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.payload }}",
    "options":  {

                }
}
```

### Insert Reprocess Metric

| Field | Value |
| --- | --- |
| Node ID | 629a2595-53f9-441b-8b57-9d237c90326e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Reprocess Ingestion Job -> Insert Reprocess Metric (output 0, input 0)

**Outgoing Connections**

- Insert Reprocess Metric -> Respond Reprocess (output 0, input 0)

**Credential References**

```json
None
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
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=minimal\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $(\"Prepare Reprocess Insert\").item.json.metric }}",
    "options":  {

                }
}
```

### Map Artifacts Response

| Field | Value |
| --- | --- |
| Node ID | 2031429b-9211-4a7d-8a22-ec8898c1c40f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 448 |
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
    "jsCode":  "const artifacts = [];\nconst statusMap = { completed: \u0027processed\u0027, failed: \u0027failed\u0027, pending: \u0027processing\u0027, processing: \u0027processing\u0027 };\nfor (const item of $input.all()) {\n  const job = item.json;\n  if (!job || !job.job_id) continue;\n  const input = job.input || {};\n  const files = input.files || {};\n  for (const [type, url] of Object.entries(files)) {\n    const rawName = String(url).split(\u0027/\u0027).pop() || type;\n    artifacts.push({\n      id: `${job.job_id}:${type}`,\n      projectName: input.projectName || \u0027Unknown project\u0027,\n      type,\n      fileName: decodeURIComponent(rawName),\n      uploadedAt: job.created_at,\n      status: statusMap[job.status] || \u0027processing\u0027,\n      url,\n      jobId: job.job_id\n    });\n  }\n}\nreturn [{ json: { artifacts } }];"
}
```

### Map Audit Events Response

| Field | Value |
| --- | --- |
| Node ID | 0657ba78-adba-4095-bd47-aab6feb562ca |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 896 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch QA Job Metrics For Audit -> Map Audit Events Response (output 0, input 0)

**Outgoing Connections**

- Map Audit Events Response -> Respond Audit Events (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const explicitEvents = $items(\u0027Fetch Q-Ops Audit Events\u0027).map(i =\u003e i.json).filter(e =\u003e e \u0026\u0026 e.id).map(e =\u003e ({\n  id: e.id,\n  actor: e.actor_name || \u0027n8n\u0027,\n  action: e.action,\n  project: e.metadata?.projectName || e.project_id || \u0027\u0027,\n  entity: e.entity_id || e.entity_type || \u0027\u0027,\n  status: e.status || \u0027info\u0027,\n  timestamp: e.created_at,\n  details: e.details || \u0027\u0027,\n  event: e.action\n}));\nconst metricEvents = $items(\u0027Fetch QA Job Metrics For Audit\u0027).map(i =\u003e i.json).filter(m =\u003e m \u0026\u0026 m.id).map(m =\u003e ({\n  id: `metric-${m.id}`,\n  actor: \u0027n8n\u0027,\n  action: m.event || \u0027JOB_EVENT\u0027,\n  project: m.project_name || \u0027\u0027,\n  entity: m.job_id || \u0027\u0027,\n  status: m.status === \u0027error\u0027 ? \u0027error\u0027 : m.event === \u0027JOB_COMPLETED\u0027 ? \u0027success\u0027 : \u0027info\u0027,\n  timestamp: m.created_at,\n  details: [m.pipeline, m.document_type, m.error_message].filter(Boolean).join(\u0027 | \u0027),\n  event: m.event,\n  pipeline: m.pipeline,\n  jobId: m.job_id\n}));\nconst events = explicitEvents.concat(metricEvents).sort((a, b) =\u003e new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 150);\nreturn [{ json: { events } }];"
}
```

### Map Generated Documents Response

| Field | Value |
| --- | --- |
| Node ID | ef1e52f1-e8b7-4fdc-8fe3-8a517a03fa87 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 672 |
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
    "jsCode":  "const documents = $input.all().map(i =\u003e i.json).filter(j =\u003e j \u0026\u0026 j.job_id).map(j =\u003e ({\n  id: j.job_id,\n  jobId: j.job_id,\n  projectName: j.input?.projectName || \u0027Unknown project\u0027,\n  documentType: j.input?.documentType || \u0027\u0027,\n  artifactLabel: j.input?.documentType || \u0027\u0027,\n  createdAt: j.created_at,\n  status: j.status,\n  url: j.output?.url || j.output?.confluenceUrl || \u0027\u0027,\n  output: j.output || null\n}));\nreturn [{ json: { documents } }];"
}
```

### Map Project Write Response

| Field | Value |
| --- | --- |
| Node ID | 7a395a24-55a7-44d8-a78c-0d2c8f72b4d6 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 896, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Upsert Project -> Map Project Write Response (output 0, input 0)

**Outgoing Connections**

- Map Project Write Response -> Insert Project Audit Event (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const p = $input.first().json;\nconst action = $(\u0027Prepare Project Upsert\u0027).item.json.auditAction;\nreturn [{ json: {\n  id: p.id,\n  name: p.name,\n  description: p.description || \u0027\u0027,\n  owner: p.owner || \u0027Admin User\u0027,\n  module: p.module || \u0027\u0027,\n  release: p.release || \u0027\u0027,\n  tags: Array.isArray(p.tags) ? p.tags : [],\n  status: p.status || \u0027draft\u0027,\n  createdAt: p.created_at,\n  updatedAt: p.updated_at,\n  audit: { action, entity_type: \u0027project\u0027, entity_id: p.id, project_id: p.id, actor_name: \u0027n8n\u0027, status: \u0027success\u0027, details: `${action}: ${p.name}`, metadata: { source: \u0027ui\u0027 } }\n} }];"
}
```

### Map Projects Response

| Field | Value |
| --- | --- |
| Node ID | 87a7674b-90ac-4b04-b39b-c1d1edc03ffa |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Projects -> Map Projects Response (output 0, input 0)

**Outgoing Connections**

- Map Projects Response -> Respond Projects (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const projects = $input.all().map(i =\u003e i.json).filter(p =\u003e p \u0026\u0026 p.id).map(p =\u003e ({\n  id: p.id,\n  name: p.name,\n  description: p.description || \u0027\u0027,\n  owner: p.owner || \u0027Admin User\u0027,\n  module: p.module || \u0027\u0027,\n  release: p.release || \u0027\u0027,\n  tags: Array.isArray(p.tags) ? p.tags : [],\n  status: p.status || \u0027draft\u0027,\n  createdAt: p.created_at,\n  updatedAt: p.updated_at\n}));\nreturn [{ json: { projects } }];"
}
```

### POST /artifacts/:artifactId/reprocess

| Field | Value |
| --- | --- |
| Node ID | 70a6a756-40a9-4bf9-857a-25d6ee110e89 |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- POST /artifacts/:artifactId/reprocess -> Prepare Reprocess Lookup (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "artifacts/:artifactId/reprocess",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### POST /projects

| Field | Value |
| --- | --- |
| Node ID | 69a13a91-7107-41a7-9969-59d25798d42b |
| Type | n8n-nodes-base.webhook |
| Type Version | 2.1 |
| Position | 0, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- POST /projects -> Fetch Projects For Upsert (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "POST",
    "path":  "projects",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare Project Upsert

| Field | Value |
| --- | --- |
| Node ID | 426b0e91-00cc-45f3-9af8-98bf809bc019 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 448, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Projects For Upsert -> Prepare Project Upsert (output 0, input 0)

**Outgoing Connections**

- Prepare Project Upsert -> Upsert Project (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const body = $(\u0027POST /projects\u0027).item.json.body || {};\nconst name = String(body.name || \u0027\u0027).trim();\nif (!name) throw new Error(\u0027Project name is required\u0027);\nconst existing = $input.all().map(i =\u003e i.json).find(p =\u003e p \u0026\u0026 p.id \u0026\u0026 String(p.name || \u0027\u0027).toLowerCase() === name.toLowerCase());\nconst payload = {\n  name,\n  description: body.description || \u0027\u0027,\n  owner: body.owner || \u0027Admin User\u0027,\n  module: body.module || \u0027\u0027,\n  release: body.release || \u0027\u0027,\n  tags: Array.isArray(body.tags) ? body.tags : [],\n  status: body.status || \u0027draft\u0027,\n  updated_at: new Date().toISOString()\n};\nif (!existing) payload.created_at = new Date().toISOString();\nreturn [{ json: {\n  method: existing ? \u0027PATCH\u0027 : \u0027POST\u0027,\n  url: existing ? `${supabaseUrl}/qops_projects?id=eq.${encodeURIComponent(existing.id)}` : `${supabaseUrl}/qops_projects`,\n  payload,\n  auditAction: existing ? \u0027PROJECT_UPDATED\u0027 : \u0027PROJECT_CREATED\u0027\n} }];"
}
```

### Prepare Reprocess Insert

| Field | Value |
| --- | --- |
| Node ID | 0e63a407-f8c7-44f2-8ab8-bb29d07e14cb |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Reprocess Source Job -> Prepare Reprocess Insert (output 0, input 0)

**Outgoing Connections**

- Prepare Reprocess Insert -> Insert Reprocess Ingestion Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const source = $input.first().json;\nconst lookup = $(\u0027Prepare Reprocess Lookup\u0027).item.json;\nconst input = source.input || {};\nconst files = input.files || {};\nconst url = files[lookup.fileKey];\nif (!source.job_id || !url) throw new Error(\u0027Source artifact was not found\u0027);\nconst now = new Date();\nconst datePart = now.toISOString().slice(2,10).replace(/-/g, \u0027\u0027);\nconst randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();\nconst jobId = `ING-${datePart}-${randomPart}`;\nreturn [{ json: {\n  jobId,\n  payload: {\n    job_id: jobId,\n    status: \u0027pending\u0027,\n    input: { projectName: input.projectName || \u0027Unknown project\u0027, files: { [lookup.fileKey]: url }, reprocessOf: lookup.artifactId },\n    project_id: source.project_id || null,\n    requested_by: source.requested_by || null,\n    settings_version: source.settings_version || null,\n    config_snapshot: source.config_snapshot || null\n  },\n  metric: { job_id: jobId, project_name: input.projectName || \u0027Unknown project\u0027, pipeline: \u0027ingestion\u0027, event: \u0027JOB_REPROCESS_QUEUED\u0027, status: \u0027info\u0027, total_files: 1, metadata: { reprocessOf: lookup.artifactId, fileKey: lookup.fileKey } }\n} }];"
}
```

### Prepare Reprocess Lookup

| Field | Value |
| --- | --- |
| Node ID | ad69b4d4-a61c-4405-bee8-b432f891f1dc |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- POST /artifacts/:artifactId/reprocess -> Prepare Reprocess Lookup (output 0, input 0)

**Outgoing Connections**

- Prepare Reprocess Lookup -> Fetch Reprocess Source Job (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const artifactId = $json.params?.artifactId || \u0027\u0027;\nconst [jobId, fileKey] = artifactId.split(\u0027:\u0027);\nif (!jobId || !fileKey) throw new Error(\u0027Artifact id must be formatted as jobId:fileKey\u0027);\nreturn [{ json: { artifactId, jobId, fileKey } }];"
}
```

### Respond Artifacts

| Field | Value |
| --- | --- |
| Node ID | 0676ddc1-aefd-4b6a-84d8-7ebbfc1f2aaf |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 448 |
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

### Respond Audit Events

| Field | Value |
| --- | --- |
| Node ID | 420d574e-3e7a-4cd6-9394-9765869d8c56 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 896, 896 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Audit Events Response -> Respond Audit Events (output 0, input 0)

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

### Respond Generated Documents

| Field | Value |
| --- | --- |
| Node ID | 83046c71-7e6c-4b0c-b71d-0ab91631b03c |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 672 |
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

### Respond Project Write

| Field | Value |
| --- | --- |
| Node ID | b7ca3409-e328-4d9f-9c4a-e0d98b6f9896 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Project Audit Event -> Respond Project Write (output 0, input 0)

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
    "responseBody":  "={{ $(\"Map Project Write Response\").item.json }}",
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

### Respond Projects

| Field | Value |
| --- | --- |
| Node ID | 1653e7c9-a9b1-48ef-8d79-16dcd2ab5197 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Projects Response -> Respond Projects (output 0, input 0)

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

### Respond Reprocess

| Field | Value |
| --- | --- |
| Node ID | 5dc79c90-06cd-4110-91e4-8ca1df9eb420 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1344, 1120 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Reprocess Metric -> Respond Reprocess (output 0, input 0)

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
    "responseBody":  "={{ { jobId: $(\"Prepare Reprocess Insert\").item.json.jobId, status: \"queued\" } }}",
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

### Upsert Project

| Field | Value |
| --- | --- |
| Node ID | 377e65c6-01d4-44a9-8f9a-1842f5a431ed |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Project Upsert -> Upsert Project (output 0, input 0)

**Outgoing Connections**

- Upsert Project -> Map Project Write Response (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "method":  "={{ $json.method }}",
    "url":  "={{ $json.url }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ $json.payload }}",
    "options":  {

                }
}
```
