# DI - Catalog Read API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | nzc2q8WqmTd6RGCw |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T11:58:58.395Z |
| Updated At | 2026-05-11T12:01:45.128Z |
| Node Count | 18 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\DI - Catalog Read API [nzc2q8WqmTd6RGCw].json |

## Description

Authenticated GET /webhook/di/catalog endpoint that reads all DI tables, joins solution assets/technologies/project usage/relationships, and returns UI-ready governed catalog data.

## Trigger And Entry Contract

- GET /di/catalog | n8n-nodes-base.webhook |  | di/catalog
- Respond DI Catalog | n8n-nodes-base.respondToWebhook |  | 
- Respond DI Catalog | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/di/catalog

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 13 |
| n8n-nodes-base.respondToWebhook | 1 |
| n8n-nodes-base.stickyNote | 1 |
| n8n-nodes-base.webhook | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?select=job_id,status,job_type,project_id,input,output,error,created_at,updated_at&order=updated_at.desc&limit=200
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_knowledge_relationships?select=id,source_entity_type,source_entity_id,target_entity_type,target_entity_id,relationship_type,confidence_score,evidence,created_by_ai,visibility_level,created_at&order=created_at.desc&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,source_ref,created_by_ai,created_at,updated_at&order=updated_at.desc&limit=300
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_technologies?select=id,project_id,technology_id,version,confidence_score,source_type,source_ref,created_at&order=created_at.desc&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,assigned_to,feedback,created_at,updated_at&order=updated_at.desc&limit=300
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,risk_factors,production_learnings,implementation_complexity,applicability_tags,visibility_level,owner_team,source_project_id,ai_summary,status,created_at,updated_at&order=updated_at.desc&limit=300
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_assets?select=id,solution_id,asset_type,title,url,storage_path,description,visibility_level,created_at&order=created_at.desc&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_technologies?select=id,solution_id,technology_id,created_at&order=created_at.desc&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_technologies?select=id,name,normalized_name,category,description,vendor,tags,created_at,updated_at&order=updated_at.desc&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,owner,status,updated_at&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{

### Supabase/Data Table Hints

- di_intelligence_jobs
- di_knowledge_relationships
- di_organizational_learnings
- di_project_technologies
- di_recommendations
- di_reusable_solutions
- di_solution_assets
- di_solution_technologies
- di_technologies
- qa_approach
- qops_project_members
- qops_projects
- qops_users

## Connection Graph

- GET /di/catalog -> Prepare DI Catalog Request (source output 0, target input 0)
- Prepare DI Catalog Request -> Verify Catalog Supabase Auth User (source output 0, target input 0)
- Verify Catalog Supabase Auth User -> Fetch Catalog Q-Ops User Profile (source output 0, target input 0)
- Fetch Catalog Q-Ops User Profile -> Fetch Catalog Project Memberships (source output 0, target input 0)
- Fetch Catalog Project Memberships -> Fetch DI Catalog Projects (source output 0, target input 0)
- Fetch DI Catalog Projects -> Fetch DI Catalog Jobs (source output 0, target input 0)
- Fetch DI Catalog Jobs -> Fetch DI Catalog Solutions (source output 0, target input 0)
- Fetch DI Catalog Solutions -> Fetch DI Catalog Technologies (source output 0, target input 0)
- Fetch DI Catalog Technologies -> Fetch DI Catalog Project Technologies (source output 0, target input 0)
- Fetch DI Catalog Project Technologies -> Fetch DI Catalog Solution Technologies (source output 0, target input 0)
- Fetch DI Catalog Solution Technologies -> Fetch DI Catalog Solution Assets (source output 0, target input 0)
- Fetch DI Catalog Solution Assets -> Fetch DI Catalog Learnings (source output 0, target input 0)
- Fetch DI Catalog Learnings -> Fetch DI Catalog Relationships (source output 0, target input 0)
- Fetch DI Catalog Relationships -> Fetch DI Catalog Recommendations (source output 0, target input 0)
- Fetch DI Catalog Recommendations -> Map DI Catalog Response (source output 0, target input 0)
- Map DI Catalog Response -> Respond DI Catalog (source output 0, target input 0)

## Nodes

### Fetch Catalog Project Memberships

| Field | Value |
| --- | --- |
| Node ID | 2d6a283c-113c-4682-9405-7dd99232b221 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Catalog Q-Ops User Profile -> Fetch Catalog Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Catalog Project Memberships -> Fetch DI Catalog Projects (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($json) ? ($json[0]?.id || \"00000000-0000-0000-0000-000000000000\") : ($json.id || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Catalog Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 6910b687-bbf5-4531-a654-ccafccd2fabc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Catalog Supabase Auth User -> Fetch Catalog Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Catalog Q-Ops User Profile -> Fetch Catalog Project Memberships (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{ $json.id || \"00000000-0000-0000-0000-000000000000\" }}\u0026status=eq.active\u0026select=id,email,name,role,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Jobs

| Field | Value |
| --- | --- |
| Node ID | fe4a19c8-8bb9-4fe7-bc93-b51b5ca8c947 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Projects -> Fetch DI Catalog Jobs (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Jobs -> Fetch DI Catalog Solutions (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?select=job_id,status,job_type,project_id,input,output,error,created_at,updated_at\u0026order=updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Learnings

| Field | Value |
| --- | --- |
| Node ID | 8f883b06-94d4-44d4-8405-cea154dbdcb1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Solution Assets -> Fetch DI Catalog Learnings (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Learnings -> Fetch DI Catalog Relationships (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,source_ref,created_by_ai,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Project Technologies

| Field | Value |
| --- | --- |
| Node ID | 878bcc81-0a96-4a4f-917a-37de471b6a33 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Technologies -> Fetch DI Catalog Project Technologies (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Project Technologies -> Fetch DI Catalog Solution Technologies (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_technologies?select=id,project_id,technology_id,version,confidence_score,source_type,source_ref,created_at\u0026order=created_at.desc\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Projects

| Field | Value |
| --- | --- |
| Node ID | d13d415d-5949-4096-a3e4-49afa2d08e26 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Catalog Project Memberships -> Fetch DI Catalog Projects (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Projects -> Fetch DI Catalog Jobs (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,owner,status,updated_at\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Recommendations

| Field | Value |
| --- | --- |
| Node ID | 6a958046-fb6e-47c6-9599-5d8a291eaa4a |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 3136, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Relationships -> Fetch DI Catalog Recommendations (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Recommendations -> Map DI Catalog Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,assigned_to,feedback,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Relationships

| Field | Value |
| --- | --- |
| Node ID | e924a26f-86c4-40fd-9076-ffee4fb1307e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Learnings -> Fetch DI Catalog Relationships (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Relationships -> Fetch DI Catalog Recommendations (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_knowledge_relationships?select=id,source_entity_type,source_entity_id,target_entity_type,target_entity_id,relationship_type,confidence_score,evidence,created_by_ai,visibility_level,created_at\u0026order=created_at.desc\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Solution Assets

| Field | Value |
| --- | --- |
| Node ID | 5e638188-8b41-469f-b44f-2aabbef244fc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Solution Technologies -> Fetch DI Catalog Solution Assets (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Solution Assets -> Fetch DI Catalog Learnings (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_assets?select=id,solution_id,asset_type,title,url,storage_path,description,visibility_level,created_at\u0026order=created_at.desc\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Solution Technologies

| Field | Value |
| --- | --- |
| Node ID | 66e2a640-c7a7-4560-b1d1-4631d52569e1 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Project Technologies -> Fetch DI Catalog Solution Technologies (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Solution Technologies -> Fetch DI Catalog Solution Assets (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_technologies?select=id,solution_id,technology_id,created_at\u0026order=created_at.desc\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Solutions

| Field | Value |
| --- | --- |
| Node ID | befc22a4-91c1-4ced-8f3c-fc1031e28a1e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Jobs -> Fetch DI Catalog Solutions (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Solutions -> Fetch DI Catalog Technologies (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,risk_factors,production_learnings,implementation_complexity,applicability_tags,visibility_level,owner_team,source_project_id,ai_summary,status,created_at,updated_at\u0026order=updated_at.desc\u0026limit=300",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Catalog Technologies

| Field | Value |
| --- | --- |
| Node ID | 6001394d-3e1f-4259-9c6d-2be7c7edd560 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Solutions -> Fetch DI Catalog Technologies (output 0, input 0)

**Outgoing Connections**

- Fetch DI Catalog Technologies -> Fetch DI Catalog Project Technologies (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_technologies?select=id,name,normalized_name,category,description,vendor,tags,created_at,updated_at\u0026order=updated_at.desc\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### GET /di/catalog

| Field | Value |
| --- | --- |
| Node ID | 483bb6af-cd2e-438c-a009-b3271aa145b1 |
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

- GET /di/catalog -> Prepare DI Catalog Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "di/catalog",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map DI Catalog Response

| Field | Value |
| --- | --- |
| Node ID | 616f12e8-16b9-4f30-8759-1bc3df04189f |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 3360, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Catalog Recommendations -> Map DI Catalog Response (output 0, input 0)

**Outgoing Connections**

- Map DI Catalog Response -> Respond DI Catalog (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const req = $(\u0027Prepare DI Catalog Request\u0027).first().json;\nconst auth = $(\u0027Verify Catalog Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Catalog Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nif (!auth.id) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nconst rows = name =\u003e $items(name).map(i =\u003e i.json).filter(r =\u003e r \u0026\u0026 Object.keys(r).length);\nconst memberships = rows(\u0027Fetch Catalog Project Memberships\u0027);\nconst memberIds = memberships.map(r =\u003e r.project_id).filter(Boolean);\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst projectId = req.projectId || null;\nconst canProject = id =\u003e isAdmin || !id || memberIds.includes(id);\nconst visibilityOk = r =\u003e isAdmin || [\u0027organization\u0027,\u0027ai_sanitized_only\u0027].includes(r.visibility_level) || canProject(r.project_id || r.source_project_id);\nconst matchesProject = r =\u003e !projectId || [r.project_id, r.source_project_id, r.source_entity_id, r.target_entity_id].includes(projectId);\nconst projects = rows(\u0027Fetch DI Catalog Projects\u0027).filter(p =\u003e canProject(p.id));\nconst projectMap = Object.fromEntries(projects.map(p =\u003e [p.id, p]));\nconst rawJobs = rows(\u0027Fetch DI Catalog Jobs\u0027).filter(r =\u003e canProject(r.project_id) \u0026\u0026 matchesProject(r)).slice(0, req.limit);\nconst rawSolutions = rows(\u0027Fetch DI Catalog Solutions\u0027).filter(r =\u003e visibilityOk(r) \u0026\u0026 matchesProject(r)).slice(0, req.limit);\nconst rawTechnologies = rows(\u0027Fetch DI Catalog Technologies\u0027);\nconst rawProjectTech = rows(\u0027Fetch DI Catalog Project Technologies\u0027).filter(r =\u003e canProject(r.project_id) \u0026\u0026 (!projectId || r.project_id === projectId));\nconst rawSolutionTech = rows(\u0027Fetch DI Catalog Solution Technologies\u0027);\nconst rawAssets = rows(\u0027Fetch DI Catalog Solution Assets\u0027).filter(r =\u003e visibilityOk(r));\nconst rawLearnings = rows(\u0027Fetch DI Catalog Learnings\u0027).filter(r =\u003e visibilityOk(r) \u0026\u0026 matchesProject(r)).slice(0, req.limit);\nconst rawRelationships = rows(\u0027Fetch DI Catalog Relationships\u0027).filter(r =\u003e visibilityOk(r) \u0026\u0026 matchesProject(r)).slice(0, req.limit);\nconst rawRecommendations = rows(\u0027Fetch DI Catalog Recommendations\u0027).filter(r =\u003e canProject(r.project_id) \u0026\u0026 matchesProject(r)).slice(0, req.limit);\nconst techById = Object.fromEntries(rawTechnologies.map(t =\u003e [t.id, t]));\nconst solutionById = Object.fromEntries(rawSolutions.map(s =\u003e [s.id, s]));\nconst learningById = Object.fromEntries(rawLearnings.map(l =\u003e [l.id, l]));\nconst recommendationById = Object.fromEntries(rawRecommendations.map(r =\u003e [r.id, r]));\nconst solutionIds = new Set(rawSolutions.map(s =\u003e s.id));\nconst visibleTechIds = new Set(rawProjectTech.map(pt =\u003e pt.technology_id));\nrawSolutionTech.filter(st =\u003e solutionIds.has(st.solution_id)).forEach(st =\u003e visibleTechIds.add(st.technology_id));\nconst technologies = rawTechnologies.filter(t =\u003e !projectId || visibleTechIds.has(t.id)).map(t =\u003e { const usage = rawProjectTech.filter(pt =\u003e pt.technology_id === t.id); const solutionLinks = rawSolutionTech.filter(st =\u003e st.technology_id === t.id \u0026\u0026 solutionById[st.solution_id]); return { type: \u0027technology\u0027, id: t.id, title: t.name, name: t.name, normalizedName: t.normalized_name, summary: t.description || t.category || \u0027Technology detected by Delivery Intelligence.\u0027, category: t.category, vendor: t.vendor, tags: t.tags || [], usageCount: usage.length, projects: usage.map(pt =\u003e ({ projectId: pt.project_id, projectName: projectMap[pt.project_id]?.name || pt.project_id, confidenceScore: pt.confidence_score, sourceType: pt.source_type, sourceRef: pt.source_ref })), relatedSolutions: solutionLinks.map(st =\u003e ({ solutionId: st.solution_id, title: solutionById[st.solution_id]?.title })), updatedAt: t.updated_at, raw: t }; }).slice(0, req.limit);\nconst assetsBySolution = rawAssets.reduce((acc, asset) =\u003e { (acc[asset.solution_id] ||= []).push(asset); return acc; }, {});\nconst techBySolution = rawSolutionTech.reduce((acc, link) =\u003e { if (techById[link.technology_id]) (acc[link.solution_id] ||= []).push({ id: link.technology_id, name: techById[link.technology_id].name, category: techById[link.technology_id].category }); return acc; }, {});\nconst solutions = rawSolutions.map(s =\u003e ({ type: \u0027solution\u0027, id: s.id, title: s.title, slug: s.slug, summary: s.summary || s.ai_summary || s.problem_statement, problemStatement: s.problem_statement, implementationApproach: s.implementation_approach, qaApproach: s.qa_approach, riskFactors: s.risk_factors || [], productionLearnings: s.production_learnings || [], implementationComplexity: s.implementation_complexity, applicabilityTags: s.applicability_tags || [], visibility: s.visibility_level, status: s.status, sourceProjectId: s.source_project_id, projectId: s.source_project_id, projectName: projectMap[s.source_project_id]?.name || s.source_project_id, technologies: techBySolution[s.id] || [], assets: assetsBySolution[s.id] || [], updatedAt: s.updated_at, raw: s }));\nconst learnings = rawLearnings.map(l =\u003e ({ type: \u0027learning\u0027, id: l.id, title: l.title, summary: l.learning_summary, category: l.category, impactLevel: l.impact_level, reusableRecommendation: l.reusable_recommendation, visibility: l.visibility_level, projectId: l.source_project_id, sourceProjectId: l.source_project_id, projectName: projectMap[l.source_project_id]?.name || l.source_project_id, sourceRef: l.source_ref, createdByAi: l.created_by_ai, createdAt: l.created_at, updatedAt: l.updated_at, raw: l }));\nfunction resolveTitle(type, id) { if (!id) return null; if (type === \u0027project\u0027) return projectMap[id]?.name || id; if (type === \u0027technology\u0027) return techById[id]?.name || id; if (type === \u0027reusable_solution\u0027 || type === \u0027solution\u0027) return solutionById[id]?.title || id; if (type === \u0027learning\u0027) return learningById[id]?.title || id; if (type === \u0027recommendation\u0027) return recommendationById[id]?.title || id; return projectMap[id]?.name || techById[id]?.name || solutionById[id]?.title || learningById[id]?.title || recommendationById[id]?.title || id; }\nconst recommendations = rawRecommendations.map(r =\u003e ({ type: \u0027recommendation\u0027, id: r.id, title: r.title, summary: r.summary, rationale: r.rationale, recommendationType: r.recommendation_type, status: r.status, confidenceScore: r.confidence_score, projectId: r.project_id, projectName: projectMap[r.project_id]?.name || r.project_id, relatedEntityType: r.related_entity_type, relatedEntityId: r.related_entity_id, relatedTitle: resolveTitle(r.related_entity_type, r.related_entity_id), feedback: r.feedback || {}, createdAt: r.created_at, updatedAt: r.updated_at, raw: r }));\nconst relationships = rawRelationships.map(r =\u003e ({ type: \u0027relationship\u0027, id: r.id, title: `${r.source_entity_type} ${r.relationship_type} ${r.target_entity_type}`, summary: `${resolveTitle(r.source_entity_type, r.source_entity_id)} -\u003e ${resolveTitle(r.target_entity_type, r.target_entity_id)}`, sourceEntityType: r.source_entity_type, sourceEntityId: r.source_entity_id, sourceTitle: resolveTitle(r.source_entity_type, r.source_entity_id), targetEntityType: r.target_entity_type, targetEntityId: r.target_entity_id, targetTitle: resolveTitle(r.target_entity_type, r.target_entity_id), relationshipType: r.relationship_type, confidenceScore: r.confidence_score, evidence: r.evidence || [], visibility: r.visibility_level, createdAt: r.created_at, raw: r }));\nconst jobs = rawJobs.map(j =\u003e ({ type: \u0027job\u0027, id: j.job_id, jobId: j.job_id, title: j.job_id, status: j.status, jobType: j.job_type, projectId: j.project_id, projectName: projectMap[j.project_id]?.name || j.project_id, input: j.input || {}, output: j.output || {}, error: j.error, createdAt: j.created_at, updatedAt: j.updated_at, counts: j.output?.persistResult?.counts || j.output?.extractionSummary || {} }));\nconst overview = { projects: projects.length, jobs: jobs.length, solutions: solutions.length, technologies: technologies.length, projectTechnologies: rawProjectTech.length, solutionTechnologies: rawSolutionTech.filter(st =\u003e solutionIds.has(st.solution_id)).length, solutionAssets: rawAssets.filter(a =\u003e solutionIds.has(a.solution_id)).length, learnings: learnings.length, relationships: relationships.length, recommendations: recommendations.length, latestJob: jobs[0] || null };\nconst payload = { overview, jobs, solutions, technologies, learnings, relationships, recommendations };\nconst entity = req.entity;\nconst items = entity === \u0027all\u0027 ? [...solutions, ...technologies, ...learnings, ...recommendations, ...relationships, ...jobs] : entity === \u0027overview\u0027 ? [] : payload[entity] || [];\nreturn [{ json: { ok: true, entity, projectId, generatedAt: new Date().toISOString(), counts: overview, items, data: payload } }];"
}
```

### Prepare DI Catalog Request

| Field | Value |
| --- | --- |
| Node ID | 819e7319-34a7-4d94-bb36-d052986e75a1 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /di/catalog -> Prepare DI Catalog Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Catalog Request -> Verify Catalog Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst query = $json.query || {};\nconst entity = String(query.entity || \u0027overview\u0027).trim().toLowerCase();\nconst allowed = new Set([\u0027overview\u0027,\u0027all\u0027,\u0027jobs\u0027,\u0027solutions\u0027,\u0027technologies\u0027,\u0027learnings\u0027,\u0027recommendations\u0027,\u0027relationships\u0027]);\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer token\u0027 } }];\nif (!allowed.has(entity)) return [{ json: { ok: false, statusCode: 400, errorCode: \u0027INVALID_ENTITY\u0027, message: \u0027Unsupported Delivery Intelligence entity\u0027 } }];\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), entity, projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 100), 300) } }];"
}
```

### Respond DI Catalog

| Field | Value |
| --- | --- |
| Node ID | 52cecc35-d9d6-4808-9daa-aecdea0d1376 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 3584, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map DI Catalog Response -> Respond DI Catalog (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_CATALOG_ERROR\", message: $json.message || \"Unable to load Delivery Intelligence catalog\" } }) }}",
    "options":  {
                    "responseCode":  "={{ $json.statusCode || 200 }}",
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

### Sticky Note be5abd38

| Field | Value |
| --- | --- |
| Node ID | 9d36c722-60d2-491b-900e-ce8d5160cc9a |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1792, 64 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "## Delivery Intelligence Catalog Read API\nGET /webhook/di/catalog?entity=overview|solutions|technologies|learnings|recommendations|relationships|jobs reads the full DI table set and returns UI-ready, governed records. It is additive and does not modify QA workflows.",
    "height":  200,
    "width":  3900,
    "color":  3
}
```

### Verify Catalog Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 601bb80a-d6ef-4bfb-b80e-2df60f015716 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Catalog Request -> Verify Catalog Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Catalog Supabase Auth User -> Fetch Catalog Q-Ops User Profile (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "={ \"apikey\": \"sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt\", \"Authorization\": \"Bearer {{ $json.token }}\" }",
    "options":  {

                }
}
```
