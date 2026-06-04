# Q-Ops Agent Settings Write API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | u3klCtPvbFd01ds4 |
| Active | True |
| Archived | False |
| Created At | 2026-05-07T06:14:39.634Z |
| Updated At | 2026-05-07T11:22:13.761Z |
| Node Count | 6 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\Q-Ops Agent Settings Write API [u3klCtPvbFd01ds4].json |

## Description

PATCH /webhook/settings endpoint for environment or integration settings updates with qops_audit_events logging. updated_by is only sent when a UUID actor is provided.

## Trigger And Entry Contract

- PATCH /settings | n8n-nodes-base.webhook | PATCH | settings
- Respond Settings Write | n8n-nodes-base.respondToWebhook |  | 
- Respond Settings Write | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- PATCH /webhook/settings

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 2 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_audit_events

### Supabase/Data Table Hints

- qops_audit_events
- qops_environment_settings
- qops_integration_settings

## Connection Graph

- PATCH /settings -> Prepare Settings Patch (source output 0, target input 0)
- Prepare Settings Patch -> Patch Settings Row (source output 0, target input 0)
- Patch Settings Row -> Map Settings Write Response (source output 0, target input 0)
- Map Settings Write Response -> Insert Settings Audit Event (source output 0, target input 0)
- Insert Settings Audit Event -> Respond Settings Write (source output 0, target input 0)

## Nodes

### Insert Settings Audit Event

| Field | Value |
| --- | --- |
| Node ID | fc14774a-15f0-4e60-9ffc-b0171390f5b2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map Settings Write Response -> Insert Settings Audit Event (output 0, input 0)

**Outgoing Connections**

- Insert Settings Audit Event -> Respond Settings Write (output 0, input 0)

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

### Map Settings Write Response

| Field | Value |
| --- | --- |
| Node ID | 81956196-2916-4d5c-964f-10305a74392a |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Patch Settings Row -> Map Settings Write Response (output 0, input 0)

**Outgoing Connections**

- Map Settings Write Response -> Insert Settings Audit Event (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const prepared = $(\u0027Prepare Settings Patch\u0027).first().json;\nconst updated = $input.first().json || {};\nreturn [{ json: { ok: true, target: prepared.target, updated, audit: prepared.audit } }];"
}
```

### PATCH /settings

| Field | Value |
| --- | --- |
| Node ID | 270622f7-f8b9-495a-a31d-e3b7d1fed3a3 |
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

- PATCH /settings -> Prepare Settings Patch (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "PATCH",
    "path":  "settings",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Patch Settings Row

| Field | Value |
| --- | --- |
| Node ID | 207bdfbb-5be2-459c-af33-cfddc96f4ed8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Settings Patch -> Patch Settings Row (output 0, input 0)

**Outgoing Connections**

- Patch Settings Row -> Map Settings Write Response (output 0, input 0)

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
    "method":  "PATCH",
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

### Prepare Settings Patch

| Field | Value |
| --- | --- |
| Node ID | 74deced9-ce3f-4629-a6e8-d625351380ec |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /settings -> Prepare Settings Patch (output 0, input 0)

**Outgoing Connections**

- Prepare Settings Patch -> Patch Settings Row (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const restBase = \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027;\nconst body = $json.body || {};\nconst envKey = String(body.environmentKey || body.environment?.environmentKey || \u0027local\u0027);\nconst integrationBody = body.integration || {};\nconst integrationKey = String(body.integrationKey || integrationBody.integrationKey || \u0027\u0027).trim();\nconst now = new Date().toISOString();\nconst actor = body.updatedBy || body.actorName || \u0027n8n\u0027;\nconst uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\nfunction withActor(payload) {\n  if (uuidPattern.test(String(body.updatedBy || \u0027\u0027))) payload.updated_by = body.updatedBy;\n  if (uuidPattern.test(String(body.actorUserId || \u0027\u0027))) payload.updated_by = body.actorUserId;\n  return payload;\n}\nif (integrationKey) {\n  const payload = withActor({ updated_at: now });\n  if (typeof body.enabled === \u0027boolean\u0027) payload.enabled = body.enabled;\n  if (typeof integrationBody.enabled === \u0027boolean\u0027) payload.enabled = integrationBody.enabled;\n  if (body.config \u0026\u0026 typeof body.config === \u0027object\u0027) payload.config = body.config;\n  if (integrationBody.config \u0026\u0026 typeof integrationBody.config === \u0027object\u0027) payload.config = integrationBody.config;\n  if (body.secretRefs \u0026\u0026 typeof body.secretRefs === \u0027object\u0027) payload.secret_refs = body.secretRefs;\n  if (integrationBody.secretRefs \u0026\u0026 typeof integrationBody.secretRefs === \u0027object\u0027) payload.secret_refs = integrationBody.secretRefs;\n  if (body.status) payload.status = body.status;\n  if (integrationBody.status) payload.status = integrationBody.status;\n  if (Object.keys(payload).length \u003c= 1) throw new Error(\u0027No supported integration settings fields were provided\u0027);\n  return [{ json: { target: \u0027integration\u0027, url: `${restBase}/qops_integration_settings?environment_key=eq.${encodeURIComponent(envKey)}\u0026integration_key=eq.${encodeURIComponent(integrationKey)}`, payload, audit: { actor_name: actor, action: \u0027SETTINGS_INTEGRATION_UPDATED\u0027, entity_type: \u0027integration_settings\u0027, entity_id: integrationKey, status: \u0027success\u0027, details: `Updated ${integrationKey} settings for ${envKey}`, metadata: { source: \u0027ui\u0027, environmentKey: envKey, integrationKey, changedKeys: Object.keys(payload) } } } }];\n}\nconst environment = body.environment || body;\nconst payload = withActor({ updated_at: now });\nif (environment.displayName !== undefined) payload.display_name = environment.displayName;\nif (environment.apiBaseUrl !== undefined) payload.api_base_url = environment.apiBaseUrl;\nif (environment.n8nBaseUrl !== undefined) payload.n8n_base_url = environment.n8nBaseUrl;\nif (environment.webhookPaths !== undefined) payload.webhook_paths = environment.webhookPaths;\nif (environment.isActive !== undefined) payload.is_active = Boolean(environment.isActive);\nif (Object.keys(payload).length \u003c= 1) throw new Error(\u0027No supported environment settings fields were provided\u0027);\nreturn [{ json: { target: \u0027environment\u0027, url: `${restBase}/qops_environment_settings?environment_key=eq.${encodeURIComponent(envKey)}`, payload, audit: { actor_name: actor, action: \u0027SETTINGS_ENVIRONMENT_UPDATED\u0027, entity_type: \u0027environment_settings\u0027, entity_id: envKey, status: \u0027success\u0027, details: `Updated environment settings for ${envKey}`, metadata: { source: \u0027ui\u0027, environmentKey: envKey, changedKeys: Object.keys(payload) } } } }];"
}
```

### Respond Settings Write

| Field | Value |
| --- | --- |
| Node ID | 20d117db-bbe7-45bb-9a56-78e5ced7d3c8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Insert Settings Audit Event -> Respond Settings Write (output 0, input 0)

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
    "responseBody":  "={{ $(\"Map Settings Write Response\").first().json }}",
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
