# DI - Insights API

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | eFtemLZ4s5NRjF1d |
| Active | True |
| Archived | False |
| Created At | 2026-05-12T10:01:46.301Z |
| Updated At | 2026-05-12T10:37:28.273Z |
| Node Count | 17 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\DI - Insights API [eFtemLZ4s5NRjF1d].json |

## Description

Authenticated GET /webhook/di/insights endpoint for internal-first Delivery Intelligence profiles, onboarding guides, similarity matches, governance, and DI job metrics.

## Trigger And Entry Contract

- GET /di/insights | n8n-nodes-base.webhook |  | di/insights
- Respond DI Insights | n8n-nodes-base.respondToWebhook |  | 
- Respond DI Insights | n8n-nodes-base.respondToWebhook
- OPTIONS /di/insights | n8n-nodes-base.webhook | ={{ "OPTIONS" }} | di/insights
- Respond DI Insights CORS | n8n-nodes-base.respondToWebhook |  | 
- Respond DI Insights CORS | n8n-nodes-base.respondToWebhook

Known webhook route hints:

- GET/POST /webhook/di/insights
- ={{ "OPTIONS" }} /webhook/di/insights

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 2 |
| n8n-nodes-base.httpRequest | 11 |
| n8n-nodes-base.respondToWebhook | 2 |
| n8n-nodes-base.webhook | 2 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/user
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_job_metrics?select=*&order=updated_at.desc&limit=200
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_onboarding_guides?select=*&order=updated_at.desc&limit=100
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_profiles?select=*&order=updated_at.desc&limit=100
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,title,summary,recommendation_type,status,confidence_score,updated_at&order=updated_at.desc&limit=200
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,summary,implementation_complexity,visibility_level,status,source_project_id,updated_at&order=updated_at.desc&limit=200
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_similarity_matches?select=*&order=confidence_score.desc,updated_at.desc&limit=200
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews?select=*&order=updated_at.desc&limit=300
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,description,owner,module,release,status,tags,updated_at&limit=500
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_users?auth_user_id=eq.{{

### Supabase/Data Table Hints

- di_job_metrics
- di_onboarding_guides
- di_project_profiles
- di_recommendations
- di_reusable_solutions
- di_similarity_matches
- di_solution_reviews
- qops_project_members
- qops_projects
- qops_users

## Connection Graph

- GET /di/insights -> Prepare DI Insights Request (source output 0, target input 0)
- Prepare DI Insights Request -> Verify Insights Supabase Auth User (source output 0, target input 0)
- Verify Insights Supabase Auth User -> Fetch Insights Q-Ops User Profile (source output 0, target input 0)
- Fetch Insights Q-Ops User Profile -> Fetch Insights Project Memberships (source output 0, target input 0)
- Fetch Insights Project Memberships -> Fetch Insights Projects (source output 0, target input 0)
- Fetch Insights Projects -> Fetch DI Project Profiles (source output 0, target input 0)
- Fetch DI Project Profiles -> Fetch DI Onboarding Guides (source output 0, target input 0)
- Fetch DI Onboarding Guides -> Fetch DI Similarity Matches (source output 0, target input 0)
- Fetch DI Similarity Matches -> Fetch DI Job Metrics (source output 0, target input 0)
- Fetch DI Job Metrics -> Fetch DI Solutions For Governance (source output 0, target input 0)
- Fetch DI Solutions For Governance -> Fetch DI Solution Reviews (source output 0, target input 0)
- Fetch DI Solution Reviews -> Fetch DI Recommendations Snapshot (source output 0, target input 0)
- Fetch DI Recommendations Snapshot -> Map DI Insights Response (source output 0, target input 0)
- Map DI Insights Response -> Respond DI Insights (source output 0, target input 0)
- OPTIONS /di/insights -> Respond DI Insights CORS (source output 0, target input 0)

## Nodes

### Fetch DI Job Metrics

| Field | Value |
| --- | --- |
| Node ID | 1b2035d1-8b1d-421a-8ddd-8c1ce6b6ab0c |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Similarity Matches -> Fetch DI Job Metrics (output 0, input 0)

**Outgoing Connections**

- Fetch DI Job Metrics -> Fetch DI Solutions For Governance (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_job_metrics?select=*\u0026order=updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Onboarding Guides

| Field | Value |
| --- | --- |
| Node ID | f7bb153c-2163-469b-b8fd-999d2e787b59 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1568, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Project Profiles -> Fetch DI Onboarding Guides (output 0, input 0)

**Outgoing Connections**

- Fetch DI Onboarding Guides -> Fetch DI Similarity Matches (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_onboarding_guides?select=*\u0026order=updated_at.desc\u0026limit=100",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Project Profiles

| Field | Value |
| --- | --- |
| Node ID | 5b8c4edd-ed72-4b00-95f6-7e0d40a05ec7 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Insights Projects -> Fetch DI Project Profiles (output 0, input 0)

**Outgoing Connections**

- Fetch DI Project Profiles -> Fetch DI Onboarding Guides (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_project_profiles?select=*\u0026order=updated_at.desc\u0026limit=100",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Recommendations Snapshot

| Field | Value |
| --- | --- |
| Node ID | 1d1162bc-fc6a-492e-b966-38a7a93560c8 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2688, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Solution Reviews -> Fetch DI Recommendations Snapshot (output 0, input 0)

**Outgoing Connections**

- Fetch DI Recommendations Snapshot -> Map DI Insights Response (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_recommendations?select=id,project_id,title,summary,recommendation_type,status,confidence_score,updated_at\u0026order=updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Similarity Matches

| Field | Value |
| --- | --- |
| Node ID | 46650378-b39f-470f-81d8-6c16b25140e6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Onboarding Guides -> Fetch DI Similarity Matches (output 0, input 0)

**Outgoing Connections**

- Fetch DI Similarity Matches -> Fetch DI Job Metrics (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_similarity_matches?select=*\u0026order=confidence_score.desc,updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Solution Reviews

| Field | Value |
| --- | --- |
| Node ID | f4c4dfd8-ef11-4727-998a-3414c86eaa6e |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2464, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Solutions For Governance -> Fetch DI Solution Reviews (output 0, input 0)

**Outgoing Connections**

- Fetch DI Solution Reviews -> Fetch DI Recommendations Snapshot (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_solution_reviews?select=*\u0026order=updated_at.desc\u0026limit=300",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch DI Solutions For Governance

| Field | Value |
| --- | --- |
| Node ID | 1ac4f88a-3317-4fba-b661-c186b90c54dc |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Job Metrics -> Fetch DI Solutions For Governance (output 0, input 0)

**Outgoing Connections**

- Fetch DI Solutions For Governance -> Fetch DI Solution Reviews (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_reusable_solutions?select=id,title,summary,implementation_complexity,visibility_level,status,source_project_id,updated_at\u0026order=updated_at.desc\u0026limit=200",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Insights Project Memberships

| Field | Value |
| --- | --- |
| Node ID | babf8f89-9651-489b-8de6-e70c197941dd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 896, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Insights Q-Ops User Profile -> Fetch Insights Project Memberships (output 0, input 0)

**Outgoing Connections**

- Fetch Insights Project Memberships -> Fetch Insights Projects (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_project_members?user_id=eq.{{ Array.isArray($(\"Fetch Insights Q-Ops User Profile\").item.json) ? ($(\"Fetch Insights Q-Ops User Profile\").item.json[0]?.id || \"00000000-0000-0000-0000-000000000000\") : ($(\"Fetch Insights Q-Ops User Profile\").item.json.id || \"00000000-0000-0000-0000-000000000000\") }}\u0026select=project_id,project_role",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Insights Projects

| Field | Value |
| --- | --- |
| Node ID | 6170e014-7d7e-41e9-aedf-aa3bfea7b332 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Insights Project Memberships -> Fetch Insights Projects (output 0, input 0)

**Outgoing Connections**

- Fetch Insights Projects -> Fetch DI Project Profiles (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?select=id,name,description,owner,module,release,status,tags,updated_at\u0026limit=500",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Insights Q-Ops User Profile

| Field | Value |
| --- | --- |
| Node ID | 6bf382e6-86fb-405b-b35a-29d0835675f2 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Verify Insights Supabase Auth User -> Fetch Insights Q-Ops User Profile (output 0, input 0)

**Outgoing Connections**

- Fetch Insights Q-Ops User Profile -> Fetch Insights Project Memberships (output 0, input 0)

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

### GET /di/insights

| Field | Value |
| --- | --- |
| Node ID | b5a1033b-6910-4e65-adaf-15639cb4b325 |
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

- GET /di/insights -> Prepare DI Insights Request (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "path":  "di/insights",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Map DI Insights Response

| Field | Value |
| --- | --- |
| Node ID | fed2381d-b326-4a32-b692-d94eede3a4b7 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2912, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Recommendations Snapshot -> Map DI Insights Response (output 0, input 0)

**Outgoing Connections**

- Map DI Insights Response -> Respond DI Insights (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const req = $(\u0027Prepare DI Insights Request\u0027).first().json;\nconst auth = $(\u0027Verify Insights Supabase Auth User\u0027).first().json || {};\nconst rawProfile = $(\u0027Fetch Insights Q-Ops User Profile\u0027).first().json;\nconst profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;\nif (!auth.id) return [{ json: { ok: false, statusCode: req.statusCode || 401, errorCode: req.errorCode || \u0027UNAUTHORIZED\u0027, message: req.message || \u0027Invalid Supabase Auth token\u0027 } }];\nif (!profile?.id || profile.status !== \u0027active\u0027) return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROFILE_NOT_ACTIVE\u0027, message: \u0027Active Q-Ops user profile not found\u0027 } }];\nconst rows = (name) =\u003e $items(name).map((item) =\u003e item.json).filter((row) =\u003e row \u0026\u0026 Object.keys(row).length);\nconst memberships = rows(\u0027Fetch Insights Project Memberships\u0027);\nconst memberProjectIds = memberships.map((row) =\u003e row.project_id).filter(Boolean);\nconst isAdmin = profile.role === \u0027admin\u0027;\nconst canProject = (id) =\u003e isAdmin || !id || memberProjectIds.includes(id);\nconst projects = rows(\u0027Fetch Insights Projects\u0027).filter((project) =\u003e canProject(project.id));\nconst requestedProjectId = req.projectId || projects[0]?.id || null;\nif (requestedProjectId \u0026\u0026 !canProject(requestedProjectId)) {\n  return [{ json: { ok: false, statusCode: 403, errorCode: \u0027PROJECT_ACCESS_DENIED\u0027, message: \u0027User cannot access this Delivery Intelligence project\u0027 } }];\n}\nconst projectMap = Object.fromEntries(projects.map((project) =\u003e [project.id, project]));\nconst profileRows = rows(\u0027Fetch DI Project Profiles\u0027).filter((row) =\u003e !requestedProjectId || row.project_id === requestedProjectId);\nconst onboardingRows = rows(\u0027Fetch DI Onboarding Guides\u0027).filter((row) =\u003e !requestedProjectId || row.project_id === requestedProjectId);\nconst similarityRows = rows(\u0027Fetch DI Similarity Matches\u0027).filter((row) =\u003e !requestedProjectId || row.project_id === requestedProjectId || row.related_project_id === requestedProjectId);\nconst metricRows = rows(\u0027Fetch DI Job Metrics\u0027).filter((row) =\u003e !requestedProjectId || row.project_id === requestedProjectId).slice(0, req.limit);\nconst solutionRows = rows(\u0027Fetch DI Solutions For Governance\u0027).filter((row) =\u003e canProject(row.source_project_id) \u0026\u0026 (!requestedProjectId || row.source_project_id === requestedProjectId));\nconst reviewRows = rows(\u0027Fetch DI Solution Reviews\u0027);\nconst recommendationRows = rows(\u0027Fetch DI Recommendations Snapshot\u0027).filter((row) =\u003e canProject(row.project_id) \u0026\u0026 (!requestedProjectId || row.project_id === requestedProjectId));\nconst reviewsBySolution = reviewRows.reduce((acc, row) =\u003e {\n  (acc[row.solution_id] ||= []).push(row);\n  return acc;\n}, {});\nconst normalizedSolutions = solutionRows.map((solution) =\u003e {\n  const latestReview = (reviewsBySolution[solution.id] || [])[0] || null;\n  return {\n    id: solution.id,\n    title: solution.title,\n    summary: solution.summary || \u0027Reusable solution candidate synthesized from internal DI signals.\u0027,\n    status: solution.status,\n    visibility: solution.visibility_level,\n    implementationComplexity: solution.implementation_complexity,\n    sourceProjectId: solution.source_project_id,\n    latestReview,\n    reviewCount: (reviewsBySolution[solution.id] || []).length,\n    updatedAt: solution.updated_at,\n  };\n});\nconst normalizedSimilarities = similarityRows.map((match) =\u003e ({\n  id: match.id,\n  projectId: match.project_id,\n  relatedProjectId: match.related_project_id,\n  relatedProjectName: projectMap[match.related_project_id]?.name || match.related_project_id,\n  confidenceScore: match.confidence_score,\n  rationale: match.rationale,\n  overlappingTechnologies: match.overlapping_technologies || [],\n  overlappingSolutions: match.overlapping_solutions || [],\n  overlappingLearningCategories: match.overlapping_learning_categories || [],\n  evidence: match.evidence || [],\n  status: match.status,\n  updatedAt: match.updated_at,\n})).sort((a, b) =\u003e Number(b.confidenceScore || 0) - Number(a.confidenceScore || 0));\nconst normalizedMetrics = metricRows.map((metric) =\u003e ({\n  id: metric.id,\n  jobId: metric.job_id,\n  jobType: metric.job_type,\n  status: metric.status,\n  durationMs: metric.duration_ms,\n  counts: metric.counts || {},\n  warnings: metric.warnings || [],\n  updatedAt: metric.updated_at,\n}));\nconst activeProfile = profileRows[0] || null;\nconst activeGuide = onboardingRows[0] || null;\nconst governanceSummary = {\n  totalSolutions: normalizedSolutions.length,\n  drafts: normalizedSolutions.filter((solution) =\u003e solution.status === \u0027draft\u0027).length,\n  inReview: normalizedSolutions.filter((solution) =\u003e solution.status === \u0027review\u0027).length,\n  published: normalizedSolutions.filter((solution) =\u003e solution.status === \u0027published\u0027).length,\n  reviewedSolutions: normalizedSolutions.filter((solution) =\u003e solution.reviewCount \u003e 0).length,\n};\nconst payload = {\n  projectId: requestedProjectId,\n  generatedAt: new Date().toISOString(),\n  profile: activeProfile,\n  onboardingGuide: activeGuide,\n  similarityMatches: normalizedSimilarities.slice(0, req.limit),\n  jobMetrics: normalizedMetrics,\n  governance: {\n    summary: governanceSummary,\n    solutions: normalizedSolutions.slice(0, req.limit),\n  },\n  recommendations: recommendationRows.slice(0, req.limit),\n  accessibleProjects: projects.map((project) =\u003e ({\n    id: project.id,\n    name: project.name,\n    owner: project.owner,\n    status: project.status,\n    module: project.module,\n    release: project.release,\n  })),\n};\nreturn [{ json: { ok: true, ...payload } }];"
}
```

### OPTIONS /di/insights

| Field | Value |
| --- | --- |
| Node ID | 9e54de1b-8215-447c-8004-1efaecacd5f6 |
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

- OPTIONS /di/insights -> Respond DI Insights CORS (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "httpMethod":  "={{ \"OPTIONS\" }}",
    "path":  "di/insights",
    "responseMode":  "responseNode",
    "options":  {

                }
}
```

### Prepare DI Insights Request

| Field | Value |
| --- | --- |
| Node ID | d4063d42-95e0-4bb2-b272-50e2efe407fd |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 224, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- GET /di/insights -> Prepare DI Insights Request (output 0, input 0)

**Outgoing Connections**

- Prepare DI Insights Request -> Verify Insights Supabase Auth User (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const headers = $json.headers || {};\nconst authHeader = headers.authorization || headers.Authorization || \u0027\u0027;\nconst query = $json.query || {};\nif (!String(authHeader).toLowerCase().startsWith(\u0027bearer \u0027)) {\n  return [{ json: { ok: false, statusCode: 401, errorCode: \u0027UNAUTHORIZED\u0027, message: \u0027Missing bearer token\u0027, token: \u0027\u0027, projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 25), 100) } }];\n}\nreturn [{ json: { ok: true, token: String(authHeader).replace(/^Bearer\\s+/i, \u0027\u0027), projectId: query.projectId || query.project_id || null, limit: Math.min(Number(query.limit || 25), 100) } }];"
}
```

### Respond DI Insights

| Field | Value |
| --- | --- |
| Node ID | a1dac279-6aa5-4918-a4cd-b0488f553df8 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 3136, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Map DI Insights Response -> Respond DI Insights (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify($json.ok ? $json : { ok: false, error: { code: $json.errorCode || \"DI_INSIGHTS_ERROR\", message: $json.message || \"Unable to load Delivery Intelligence insights\" } }) }}",
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

### Respond DI Insights CORS

| Field | Value |
| --- | --- |
| Node ID | 64aa0faa-deb9-4755-a30f-9c9ea0c9f4f0 |
| Type | n8n-nodes-base.respondToWebhook |
| Type Version | 1.5 |
| Position | 224, 224 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- OPTIONS /di/insights -> Respond DI Insights CORS (output 0, input 0)

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
    "responseBody":  "={{ JSON.stringify({ ok: true }) }}",
    "options":  {
                    "responseCode":  204,
                    "responseHeaders":  {
                                            "entries":  [
                                                            {
                                                                "name":  "Access-Control-Allow-Origin",
                                                                "value":  "*"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Methods",
                                                                "value":  "GET, OPTIONS"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Allow-Headers",
                                                                "value":  "authorization, content-type"
                                                            },
                                                            {
                                                                "name":  "Access-Control-Max-Age",
                                                                "value":  "86400"
                                                            }
                                                        ]
                                        }
                }
}
```

### Verify Insights Supabase Auth User

| Field | Value |
| --- | --- |
| Node ID | 0d96ddbd-b648-4d41-85d9-32ac6195d21b |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 448, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Prepare DI Insights Request -> Verify Insights Supabase Auth User (output 0, input 0)

**Outgoing Connections**

- Verify Insights Supabase Auth User -> Fetch Insights Q-Ops User Profile (output 0, input 0)

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
