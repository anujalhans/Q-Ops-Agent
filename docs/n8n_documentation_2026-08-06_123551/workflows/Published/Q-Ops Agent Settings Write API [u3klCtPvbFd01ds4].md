# Q-Ops Agent Settings Write API

Generated from the published workflow JSON backup on 2026-08-06 12:35:51 +05:30.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | u3klCtPvbFd01ds4 |
| Active | True |
| Created At | 2026-05-07T06:14:39.634Z |
| Updated At | 2026-05-20T11:19:15.500Z |
| Node Count | 12 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-08-06_123551\Published\Q-Ops Agent Settings Write API [u3klCtPvbFd01ds4].json |

## Description

PATCH /webhook/settings endpoint for environment or integration settings updates with qops_audit_events logging. updated_by is only sent when a UUID actor is provided.

## Trigger And Entry Contract

- PATCH /settings | n8n-nodes-base.webhook | PATCH | settings
- Respond Settings Write | n8n-nodes-base.respondToWebhook
- Respond Settings Write Unauthorized | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- PATCH /webhook/settings

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 5 |
| n8n-nodes-base.if | 1 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## Connection Graph

- PATCH /settings -> Prepare Settings Write Auth (source output 0, target input 0)
- Prepare Settings Write Auth -> Settings Write Authorized? (source output 0, target input 0)
- Settings Write Authorized? -> Verify Settings Write Supabase User (source output 0, target input 0)
- Settings Write Authorized? -> Respond Settings Write Unauthorized (source output 1, target input 0)
- Verify Settings Write Supabase User -> Fetch Settings Write User Profile (source output 0, target input 0)
- Fetch Settings Write User Profile -> Fetch Settings Write Project Memberships (source output 0, target input 0)
- Fetch Settings Write Project Memberships -> Prepare Settings Patch (source output 0, target input 0)
- Prepare Settings Patch -> Patch Settings Row (source output 0, target input 0)
- Patch Settings Row -> Map Settings Write Response (source output 0, target input 0)
- Map Settings Write Response -> Insert Settings Audit Event (source output 0, target input 0)
- Insert Settings Audit Event -> Respond Settings Write (source output 0, target input 0)

## Nodes

### Fetch Settings Write Project Memberships

| Field | Value |
| --- | --- |
| Node ID | f037a068-46fc-4004-aedd-cb147eb1758a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Settings Write User Profile -> Fetch Settings Write Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Settings Write Project Memberships -> Prepare Settings Patch (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ (Array.isArray($json) ? $json[0] : $json).id }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Settings Write User Profile

| Field | Value |
| --- | --- |
| Node ID | 6368373e-5db3-45f4-a3d3-caebfebb9c61 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Settings Write Supabase User -> Fetch Settings Write User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Settings Write User Profile -> Fetch Settings Write Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Insert Settings Audit Event

| Field | Value |
| --- | --- |
| Node ID | fc14774a-15f0-4e60-9ffc-b0171390f5b2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, -80 |
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
| Position | 1792, -80 |
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

- PATCH /settings -> Prepare Settings Write Auth (output 0, input 0)

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
| Position | 1568, -80 |
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
    "method":  "={{ $json.method }}",
    "url":  "={{ $json.url }}",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"resolution=merge-duplicates,return=representation\" }",
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
| Position | 1344, -80 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Settings Write Project Memberships -> Prepare Settings Patch (output 0, input 0)

**Outgoing Connections**

- Prepare Settings Patch -> Patch Settings Row (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const restBase = \u0027https://ifnznfspkjayhnooncrv.supabase.co/rest/v1\u0027;\nconst body = $(\u0027Prepare Settings Write Auth\u0027).first().json.body || {};\nconst profileRaw = $(\u0027Fetch Settings Write User Profile\u0027).first().json || {};\nconst profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;\nconst memberships = $items(\u0027Fetch Settings Write Project Memberships\u0027).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 r.project_id);\nif (!profile?.id || profile.status !== \u0027active\u0027) {\n  throw new Error(\u0027Active Q-Ops user profile not found\u0027);\n}\nconst envKey = String(body.environmentKey || body.environment?.environmentKey || \u0027local\u0027);\nconst requestedScope = String(body.scope || body.settingsScope || body.integration?.scope || \u0027workspace\u0027).toLowerCase();\nconst scope = requestedScope === \u0027admin\u0027 || requestedScope === \u0027workspace_default\u0027 ? \u0027workspace\u0027 : requestedScope;\nconst projectId = String(body.projectId || body.integration?.projectId || \u0027\u0027).trim();\nconst integrationBody = body.integration || {};\nconst integrationKey = String(body.integrationKey || integrationBody.integrationKey || \u0027\u0027).trim();\nconst now = new Date().toISOString();\nconst actor = profile.name || profile.email || body.actorName || \u0027n8n\u0027;\nconst changedBy = profile.id;\nconst canWriteProject = profile.role === \u0027admin\u0027 || memberships.some(m =\u003e m.project_id === projectId \u0026\u0026 [\u0027owner\u0027, \u0027editor\u0027].includes(String(m.project_role || \u0027\u0027).toLowerCase()));\nfunction cleanConfig(value) {\n  if (!value || typeof value !== \u0027object\u0027 || Array.isArray(value)) return {};\n  const blocked = /(secret|token|password|api[_-]?key|authorization|service[_-]?role|bearer)/i;\n  const out = {};\n  for (const [key, inner] of Object.entries(value)) {\n    if (blocked.test(key)) continue;\n    if (inner \u0026\u0026 typeof inner === \u0027object\u0027 \u0026\u0026 !Array.isArray(inner)) out[key] = cleanConfig(inner);\n    else out[key] = inner;\n  }\n  return out;\n}\nfunction changedKeys(payload) {\n  return Object.keys(payload).filter(k =\u003e ![\u0027updated_at\u0027, \u0027updated_by\u0027].includes(k));\n}\nif (integrationKey) {\n  const enabled = typeof body.enabled === \u0027boolean\u0027 ? body.enabled : typeof integrationBody.enabled === \u0027boolean\u0027 ? integrationBody.enabled : true;\n  const config = cleanConfig((body.config \u0026\u0026 typeof body.config === \u0027object\u0027) ? body.config : (integrationBody.config \u0026\u0026 typeof integrationBody.config === \u0027object\u0027) ? integrationBody.config : {});\n  const secretRefs = (body.secretRefs \u0026\u0026 typeof body.secretRefs === \u0027object\u0027) ? body.secretRefs : (integrationBody.secretRefs \u0026\u0026 typeof integrationBody.secretRefs === \u0027object\u0027) ? integrationBody.secretRefs : {};\n  const status = String(body.status || integrationBody.status || \u0027backend_managed\u0027);\n  if (scope === \u0027workspace\u0027) {\n    if (profile.role !== \u0027admin\u0027) throw new Error(\u0027Only admins can update workspace default integration settings\u0027);\n    const payload = { updated_at: now, updated_by: changedBy, enabled, config, secret_refs: secretRefs, status };\n    return [{ json: { method: \u0027PATCH\u0027, target: \u0027integration\u0027, scope, url: `${restBase}/qops_integration_settings?environment_key=eq.${encodeURIComponent(envKey)}\u0026integration_key=eq.${encodeURIComponent(integrationKey)}`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: \u0027SETTINGS_INTEGRATION_UPDATED\u0027, entity_type: \u0027integration_settings\u0027, entity_id: integrationKey, status: \u0027success\u0027, details: `Updated workspace ${integrationKey} settings for ${envKey}`, metadata: { source: \u0027ui\u0027, scope, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];\n  }\n  if (scope === \u0027user\u0027) {\n    const payload = { environment_key: envKey, user_id: profile.id, integration_key: integrationKey, display_name: integrationBody.displayName || body.displayName || integrationKey, updated_at: now, updated_by: changedBy, enabled, config, secret_refs: secretRefs, status };\n    return [{ json: { method: \u0027POST\u0027, target: \u0027integration\u0027, scope, url: `${restBase}/qops_user_integration_settings?on_conflict=environment_key,user_id,integration_key`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: \u0027SETTINGS_USER_INTEGRATION_UPDATED\u0027, entity_type: \u0027user_integration_settings\u0027, entity_id: integrationKey, status: \u0027success\u0027, details: `Updated user ${integrationKey} settings for ${envKey}`, metadata: { source: \u0027ui\u0027, scope, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];\n  }\n  if (scope === \u0027project\u0027) {\n    if (!projectId) throw new Error(\u0027projectId is required for project-scoped integration settings\u0027);\n    if (!canWriteProject) throw new Error(\u0027Only admins, project owners, or project editors can update project integration overrides\u0027);\n    const payload = { project_id: projectId, integration_key: integrationKey, override_config: config, updated_at: now, updated_by: changedBy, enabled, secret_refs: secretRefs, status };\n    return [{ json: { method: \u0027POST\u0027, target: \u0027integration\u0027, scope, projectId, url: `${restBase}/qops_project_integration_overrides?on_conflict=project_id,integration_key`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: \u0027SETTINGS_PROJECT_INTEGRATION_UPDATED\u0027, entity_type: \u0027project_integration_overrides\u0027, entity_id: integrationKey, project_id: projectId, status: \u0027success\u0027, details: `Updated project ${integrationKey} override`, metadata: { source: \u0027ui\u0027, scope, projectId, environmentKey: envKey, integrationKey, changedKeys: changedKeys(payload) } } } }];\n  }\n  throw new Error(`Unsupported settings scope: ${scope}`);\n}\nif (profile.role !== \u0027admin\u0027) throw new Error(\u0027Only admins can update environment settings\u0027);\nconst environment = body.environment || body;\nconst payload = { updated_at: now, updated_by: changedBy };\nif (environment.displayName !== undefined) payload.display_name = environment.displayName;\nif (environment.apiBaseUrl !== undefined) payload.api_base_url = environment.apiBaseUrl;\nif (environment.n8nBaseUrl !== undefined) payload.n8n_base_url = environment.n8nBaseUrl;\nif (environment.webhookPaths !== undefined) payload.webhook_paths = environment.webhookPaths;\nif (environment.isActive !== undefined) payload.is_active = Boolean(environment.isActive);\nif (Object.keys(payload).length \u003c= 2) throw new Error(\u0027No supported environment settings fields were provided\u0027);\nreturn [{ json: { method: \u0027PATCH\u0027, target: \u0027environment\u0027, scope: \u0027workspace\u0027, url: `${restBase}/qops_environment_settings?environment_key=eq.${encodeURIComponent(envKey)}`, payload, audit: { actor_user_id: changedBy, actor_name: actor, action: \u0027SETTINGS_ENVIRONMENT_UPDATED\u0027, entity_type: \u0027environment_settings\u0027, entity_id: envKey, status: \u0027success\u0027, details: `Updated environment settings for ${envKey}`, metadata: { source: \u0027ui\u0027, scope: \u0027workspace\u0027, environmentKey: envKey, changedKeys: changedKeys(payload) } } } }];"
}
```

### Prepare Settings Write Auth

| Field | Value |
| --- | --- |
| Node ID | 9979d617-47ba-4d22-9de0-afa6ff329519 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- PATCH /settings -> Prepare Settings Write Auth (output 0, input 0)

**Outgoing Connections**

- Prepare Settings Write Auth -> Settings Write Authorized? (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, error: { code: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer [REDACTED]\u0027 }, body: $json.body || {} } }];\n}\nreturn [{\n  json: {\n    ok: true,\n    token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027),\n    body: $json.body || {}\n  }\n}];"
}
```

### Respond Settings Write

| Field | Value |
| --- | --- |
| Node ID | 20d117db-bbe7-45bb-9a56-78e5ced7d3c8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 2240, -80 |
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

### Respond Settings Write Unauthorized

| Field | Value |
| --- | --- |
| Node ID | 829400f1-6231-4d07-b3a6-5ee1c9d093f7 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.1 |
| Position | 672, 160 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Settings Write Authorized? -> Respond Settings Write Unauthorized (output 1, input 0)

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
                    "responseCode":  401,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Headers",
                                                                "value":  "authorization, content-type"
                                                            }
                                                        ]
                                        }
                }
}
```

### Settings Write Authorized?

| Field | Value |
| --- | --- |
| Node ID | c57fcdaf-a7c7-49c1-a812-34e989dcadd6 |
| Type | n8n-nodes-base.if |
| Type Version | 2 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare Settings Write Auth -> Settings Write Authorized? (output 0, input 0)

**Outgoing Connections**

- Settings Write Authorized? -> Verify Settings Write Supabase User (output 0, input 0)
- Settings Write Authorized? -> Respond Settings Write Unauthorized (output 1, input 0)

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
                                       "version":  1
                                   },
                       "conditions":  [
                                          {
                                              "id":  "0d1d0f5c-5353-418d-9382-7ded3d215576",
                                              "leftValue":  "={{ $json.ok }}",
                                              "rightValue":  true,
                                              "operator":  {
                                                               "type":  "boolean",
                                                               "operation":  "equals"
                                                           }
                                          }
                                      ],
                       "combinator":  "and"
                   },
    "options":  {

                }
}
```

### Verify Settings Write Supabase User

| Field | Value |
| --- | --- |
| Node ID | df28873b-628d-42c3-b2bb-882fcbb1f7a9 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, -80 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Settings Write Authorized? -> Verify Settings Write Supabase User (output 0, input 0)

**Outgoing Connections**

- Verify Settings Write Supabase User -> Fetch Settings Write User Profile (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user",
    "sendHeaders":  true,
    "headerParameters":  {
                             "parameters":  [
                                                {
                                                    "name":  "apikey",
                                                    "value":  "sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt"
                                                },
                                                {
                                                    "name":  "Authorization",
                                                    "value":  "={{ \u0027Bearer \u0027 + $json.token }}"
                                                }
                                            ]
                         },
    "options":  {

                }
}
```
