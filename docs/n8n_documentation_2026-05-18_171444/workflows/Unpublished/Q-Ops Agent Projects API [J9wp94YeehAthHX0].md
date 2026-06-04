# Q-Ops Agent Projects API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | J9wp94YeehAthHX0 |
| Active | False |
| Archived | True |
| Created At | 2026-05-07T05:50:46.665Z |
| Updated At | 2026-05-07T05:55:11.000Z |
| Node Count | 11 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Unpublished\Q-Ops Agent Projects API [J9wp94YeehAthHX0].json |

## Description

Additive UI API for GET/POST /webhook/projects backed by qops_projects and qops_audit_events.

## Trigger And Entry Contract

- GET /projects | n8n-nodes-base.webhook |  | projects
- Respond Projects | n8n-nodes-base.respondToWebhook |  | 
- Respond Projects | n8n-nodes-base.respondToWebhook
- POST /projects | n8n-nodes-base.webhook | POST | projects
- Respond Project Write | n8n-nodes-base.respondToWebhook |  | 
- Respond Project Write | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/projects
- POST /webhook/projects

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 4 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- None

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects

### Supabase/Data Table Hints

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

## Nodes

### Fetch Projects

| Field | Value |
| --- | --- |
| Node ID | a9ef6c2e-dada-45f2-8c77-b6d2988d0e30 |
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
| Node ID | b4000501-b33d-4c7f-9a97-9ca35e727c50 |
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

### GET /projects

| Field | Value |
| --- | --- |
| Node ID | 4b24deab-bf07-4c50-881c-1e6bce90d6e2 |
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
| Node ID | e39efa3b-eaa8-4848-85f7-f7e1755294ab |
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

### Map Project Write Response

| Field | Value |
| --- | --- |
| Node ID | 4567c84f-678e-40b8-8017-5ecc7a76a427 |
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
    "jsCode":  "const p = $input.first().json; const action = $(\u0027Prepare Project Upsert\u0027).item.json.auditAction; return [{ json: { id: p.id, name: p.name, description: p.description || \u0027\u0027, owner: p.owner || \u0027Admin User\u0027, module: p.module || \u0027\u0027, release: p.release || \u0027\u0027, tags: Array.isArray(p.tags) ? p.tags : [], status: p.status || \u0027draft\u0027, createdAt: p.created_at, updatedAt: p.updated_at, audit: { action, entity_type: \u0027project\u0027, entity_id: p.id, project_id: p.id, actor_name: \u0027n8n\u0027, status: \u0027success\u0027, details: `${action}: ${p.name}`, metadata: { source: \u0027ui\u0027, projectName: p.name } } } }];"
}
```

### Map Projects Response

| Field | Value |
| --- | --- |
| Node ID | f5f8bf83-1b80-4e3c-84a8-5e0d2c03398a |
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
    "jsCode":  "const projects = $input.all().map(i =\u003e i.json).filter(p =\u003e p \u0026\u0026 p.id).map(p =\u003e ({ id: p.id, name: p.name, description: p.description || \u0027\u0027, owner: p.owner || \u0027Admin User\u0027, module: p.module || \u0027\u0027, release: p.release || \u0027\u0027, tags: Array.isArray(p.tags) ? p.tags : [], status: p.status || \u0027draft\u0027, createdAt: p.created_at, updatedAt: p.updated_at })); return [{ json: { projects } }];"
}
```

### POST /projects

| Field | Value |
| --- | --- |
| Node ID | 21eedaeb-f9bb-41c5-a1a2-4d840b2aff57 |
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
| Node ID | 0ee53d88-a281-4eff-8c4e-96b0eebe2bbc |
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
    "jsCode":  "const restBase = \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027; const body = $(\u0027POST /projects\u0027).item.json.body || {}; const name = String(body.name || \u0027\u0027).trim(); if (!name) throw new Error(\u0027Project name is required\u0027); const existing = $input.all().map(i =\u003e i.json).find(p =\u003e p \u0026\u0026 p.id \u0026\u0026 String(p.name || \u0027\u0027).toLowerCase() === name.toLowerCase()); const payload = { name, description: body.description || \u0027\u0027, owner: body.owner || \u0027Admin User\u0027, module: body.module || \u0027\u0027, release: body.release || \u0027\u0027, tags: Array.isArray(body.tags) ? body.tags : [], status: body.status || \u0027draft\u0027, updated_at: new Date().toISOString() }; if (!existing) payload.created_at = new Date().toISOString(); return [{ json: { method: existing ? \u0027PATCH\u0027 : \u0027POST\u0027, url: existing ? `${restBase}/qops_projects?id=eq.${encodeURIComponent(existing.id)}` : `${restBase}/qops_projects`, payload, auditAction: existing ? \u0027PROJECT_UPDATED\u0027 : \u0027PROJECT_CREATED\u0027 } }];"
}
```

### Respond Project Write

| Field | Value |
| --- | --- |
| Node ID | 71307415-8703-43a2-87ed-d7cec3f2bd01 |
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
| Node ID | f383fc85-4412-4c2f-bd35-f7a15fdde628 |
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

### Upsert Project

| Field | Value |
| --- | --- |
| Node ID | e3866c57-7e8e-47e4-bd28-dd855b546a6d |
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
