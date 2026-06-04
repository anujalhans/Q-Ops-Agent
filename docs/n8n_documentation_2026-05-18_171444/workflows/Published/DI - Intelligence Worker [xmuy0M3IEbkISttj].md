# DI - Intelligence Worker

Generated from the latest n8n workflow JSON backup on 2026-05-18 17:14:44 IST.

## Workflow Metadata

| Field | Value |
| --- | --- |
| Workflow ID | xmuy0M3IEbkISttj |
| Active | True |
| Archived | False |
| Created At | 2026-05-11T10:40:20.869Z |
| Updated At | 2026-05-11T10:46:04.094Z |
| Node Count | 14 |
| JSON Source | C:\Users\anujalhans01\Q-Ops_Agent\docs\n8n_workflows_2026-05-18_171444\Published\DI - Intelligence Worker [xmuy0M3IEbkISttj].json |

## Description

Scheduled Delivery Intelligence worker that locks pending di_intelligence_jobs, derives DI records from submitted payload plus read-only project/QA context, persists to di_* tables, and updates job status.

## Trigger And Entry Contract

- Schedule Trigger | n8n-nodes-base.scheduleTrigger |  | 

Known webhook route hints:

- None detected.

## Node Type Inventory

| Node Type | Count |
| --- | ---: |
| n8n-nodes-base.code | 3 |
| n8n-nodes-base.httpRequest | 7 |
| n8n-nodes-base.if | 2 |
| n8n-nodes-base.scheduleTrigger | 1 |
| n8n-nodes-base.stickyNote | 1 |

## Credentials Referenced

- httpCustomAuth: supabase-service-role-key

## External Dependencies Detected

### URL Hints

- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{
- https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/di_persist_extraction

### Supabase/Data Table Hints

- di_intelligence_jobs
- di_persist_extraction
- di_worker
- qa_approach
- qa_job
- qa_jobs
- qops_projects
- rpc

## Connection Graph

- Schedule Trigger -> Get Pending DI Jobs (source output 0, target input 0)
- Get Pending DI Jobs -> Pending DI Job Exists? (source output 0, target input 0)
- Pending DI Job Exists? -> Lock DI Job (source output 0, target input 0)
- Pending DI Job Exists? -> Sticky Note 0c4e72a9 (source output 1, target input 0)
- Lock DI Job -> DI Lock Acquired? (source output 0, target input 0)
- DI Lock Acquired? -> Fetch DI Project Context (source output 0, target input 0)
- DI Lock Acquired? -> Sticky Note 0c4e72a9 (source output 1, target input 0)
- Fetch DI Project Context -> Fetch Read Only QA Context (source output 0, target input 0)
- Fetch Read Only QA Context -> Build DI Extraction Payload (source output 0, target input 0)
- Build DI Extraction Payload -> Persist DI Extraction (source output 0, target input 0)
- Persist DI Extraction -> Build DI Completion Output (source output 0, target input 0)
- Persist DI Extraction -> Build DI Failure Output (source output 1, target input 0)
- Build DI Completion Output -> Mark DI Job Completed (source output 0, target input 0)
- Build DI Failure Output -> Mark DI Job Failed (source output 0, target input 0)

## Nodes

### Build DI Completion Output

| Field | Value |
| --- | --- |
| Node ID | 92a42b93-dfd2-4dfe-8c64-fe0abc4dcf25 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist DI Extraction -> Build DI Completion Output (output 0, input 0)

**Outgoing Connections**

- Build DI Completion Output -> Mark DI Job Completed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const built = $(\u0027Build DI Extraction Payload\u0027).first().json;\nconst persisted = $json || {};\nconst counts = persisted.counts || {};\nconst warning = built.warning || (Object.values(counts).reduce((sum, v) =\u003e sum + Number(v || 0), 0) === 0 ? \u0027No DI records were persisted.\u0027 : null);\nreturn [{ json: { jobId: built.jobId, status: warning ? \u0027completed_with_warnings\u0027 : \u0027completed\u0027, output: { ok: true, jobType: built.jobType, projectId: built.projectId, extractionSummary: built.extractionSummary, persistResult: persisted, warning, completedAt: new Date().toISOString() } } }];"
}
```

### Build DI Extraction Payload

| Field | Value |
| --- | --- |
| Node ID | 05f8c1c5-d2a3-4241-a9d5-d3d9ebb94541 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 1568, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch Read Only QA Context -> Build DI Extraction Payload (output 0, input 0)

**Outgoing Connections**

- Build DI Extraction Payload -> Persist DI Extraction (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const job = $(\u0027Lock DI Job\u0027).first().json || {};\nconst rawProject = $(\u0027Fetch DI Project Context\u0027).first().json;\nconst project = Array.isArray(rawProject) ? rawProject[0] : rawProject;\nconst qaJobs = $items(\u0027Fetch Read Only QA Context\u0027).map(i =\u003e i.json).filter(j =\u003e j \u0026\u0026 j.job_id);\nconst input = job.input || {};\nconst submitted = input.extraction || input.intelligence || input.payload || {};\nconst contextText = [project?.name, project?.description, JSON.stringify(project?.tags || []), JSON.stringify(input), ...qaJobs.map(j =\u003e JSON.stringify({ input: j.input, output: j.output }).slice(0, 4000))].join(\u0027\\n\u0027);\nconst techCatalog = [[\u0027React\u0027,\u0027frontend\u0027], [\u0027Next.js\u0027,\u0027frontend\u0027], [\u0027Angular\u0027,\u0027frontend\u0027], [\u0027Vue\u0027,\u0027frontend\u0027], [\u0027TypeScript\u0027,\u0027language\u0027], [\u0027JavaScript\u0027,\u0027language\u0027], [\u0027Java\u0027,\u0027language\u0027], [\u0027Spring Boot\u0027,\u0027backend\u0027], [\u0027Node.js\u0027,\u0027backend\u0027], [\u0027Express\u0027,\u0027backend\u0027], [\u0027Python\u0027,\u0027language\u0027], [\u0027FastAPI\u0027,\u0027backend\u0027], [\u0027PostgreSQL\u0027,\u0027database\u0027], [\u0027Supabase\u0027,\u0027database\u0027], [\u0027MongoDB\u0027,\u0027database\u0027], [\u0027Redis\u0027,\u0027cache\u0027], [\u0027Kafka\u0027,\u0027messaging\u0027], [\u0027RabbitMQ\u0027,\u0027messaging\u0027], [\u0027Docker\u0027,\u0027devops\u0027], [\u0027Kubernetes\u0027,\u0027devops\u0027], [\u0027Jenkins\u0027,\u0027devops\u0027], [\u0027GitHub Actions\u0027,\u0027devops\u0027], [\u0027Jira\u0027,\u0027delivery\u0027], [\u0027Confluence\u0027,\u0027knowledge\u0027], [\u0027ChromaDB\u0027,\u0027vector\u0027], [\u0027OpenAI\u0027,\u0027ai\u0027], [\u0027Azure OpenAI\u0027,\u0027ai\u0027], [\u0027Playwright\u0027,\u0027qa\u0027], [\u0027Selenium\u0027,\u0027qa\u0027], [\u0027Cypress\u0027,\u0027qa\u0027], [\u0027REST API\u0027,\u0027integration\u0027], [\u0027GraphQL\u0027,\u0027integration\u0027]];\nconst explicitTechs = Array.isArray(submitted.technologies) ? submitted.technologies : Array.isArray(input.technologies) ? input.technologies : [];\nconst foundTechs = techCatalog.filter(([name]) =\u003e new RegExp(\u0027\\\\b\u0027 + name.replace(/[.*+?^${}()|[\\]\\\\]/g, \u0027\\\\$\u0026\u0027) + \u0027\\\\b\u0027, \u0027i\u0027).test(contextText)).map(([name, category]) =\u003e ({ name, category, confidenceScore: 0.72, sourceType: \u0027context_scan\u0027, sourceRef: job.job_id }));\nconst techMap = new Map();\nfor (const t of [...foundTechs, ...explicitTechs]) { const name = String(t.name || t.technology || t).trim(); if (!name) continue; const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, \u0027-\u0027).replace(/^-+|-+$/g, \u0027\u0027); techMap.set(normalized, { name, normalizedName: normalized, category: t.category || \u0027detected\u0027, description: t.description || null, vendor: t.vendor || null, version: t.version || null, tags: Array.isArray(t.tags) ? t.tags : [], confidenceScore: Number(t.confidenceScore || t.confidence_score || 0.7), sourceType: t.sourceType || \u0027di_worker\u0027, sourceRef: t.sourceRef || job.job_id }); }\nconst technologies = [...techMap.values()];\nconst explicitSolutions = Array.isArray(submitted.solutions) ? submitted.solutions : Array.isArray(input.solutions) ? input.solutions : [];\nconst solutions = explicitSolutions.map((s, index) =\u003e ({ title: s.title || `${project?.name || job.project_id} reusable delivery pattern ${index + 1}`, slug: s.slug, summary: s.summary || s.description || \u0027Reusable delivery intelligence candidate extracted from project artifacts.\u0027, problemStatement: s.problemStatement || s.problem_statement || null, implementationApproach: s.implementationApproach || s.implementation_approach || null, qaApproach: s.qaApproach || s.qa_approach || null, riskFactors: Array.isArray(s.riskFactors) ? s.riskFactors : [], productionLearnings: Array.isArray(s.productionLearnings) ? s.productionLearnings : [], implementationComplexity: s.implementationComplexity || s.complexity || \u0027medium\u0027, applicabilityTags: Array.isArray(s.applicabilityTags) ? s.applicabilityTags : (project?.tags || []), visibilityLevel: s.visibilityLevel || \u0027project\u0027, ownerTeam: s.ownerTeam || project?.owner || null, aiSummary: s.aiSummary || s.summary || null, status: s.status || \u0027draft\u0027, technologies: Array.isArray(s.technologies) ? s.technologies : technologies.slice(0, 5).map(t =\u003e t.name), assets: Array.isArray(s.assets) ? s.assets : [{ assetType: \u0027project_context\u0027, title: project?.name || job.project_id, description: \u0027Source project context used during DI extraction\u0027, visibilityLevel: s.visibilityLevel || \u0027project\u0027 }] }));\nif (solutions.length === 0 \u0026\u0026 [\u0027solution_extract\u0027,\u0027project_intelligence_extract\u0027].includes(job.job_type) \u0026\u0026 qaJobs.length \u003e 0) solutions.push({ title: `${project?.name || job.project_id} QA delivery intelligence pattern`, summary: \u0027Draft reusable solution candidate based on completed QA generation outputs and project context.\u0027, problemStatement: \u0027Project delivery and QA knowledge may be reusable across similar initiatives.\u0027, implementationApproach: \u0027Review generated QA assets, project metadata, and extracted technologies before publishing.\u0027, qaApproach: \u0027Reuse proven QA planning, risk, traceability, and test design outputs where applicable.\u0027, riskFactors: [\u0027Requires human review before organization-wide reuse\u0027], productionLearnings: [], implementationComplexity: \u0027medium\u0027, applicabilityTags: project?.tags || [], visibilityLevel: \u0027project\u0027, status: \u0027draft\u0027, technologies: technologies.slice(0, 5).map(t =\u003e t.name), assets: qaJobs.slice(0, 3).map(j =\u003e ({ assetType: \u0027qa_job\u0027, title: `QA output ${j.job_id}`, description: \u0027Existing QA generation output used as reusable evidence\u0027, visibilityLevel: \u0027project\u0027 })) });\nconst explicitLearnings = Array.isArray(submitted.learnings) ? submitted.learnings : Array.isArray(input.learnings) ? input.learnings : [];\nconst learnings = explicitLearnings.map(l =\u003e ({ title: l.title || \u0027Delivery learning\u0027, category: l.category || \u0027delivery\u0027, learningSummary: l.learningSummary || l.summary || l.description || \u0027\u0027, impactLevel: l.impactLevel || \u0027medium\u0027, reusableRecommendation: l.reusableRecommendation || l.recommendation || \u0027\u0027, visibilityLevel: l.visibilityLevel || \u0027project\u0027, sourceRef: l.sourceRef || job.job_id }));\nif (learnings.length === 0 \u0026\u0026 technologies.length \u003e 0) learnings.push({ title: `${project?.name || job.project_id} technology footprint captured`, category: \u0027technology\u0027, learningSummary: `Detected ${technologies.length} technologies for reuse and discovery.`, impactLevel: \u0027medium\u0027, reusableRecommendation: \u0027Review technology patterns for cross-project standardization opportunities.\u0027, visibilityLevel: \u0027project\u0027, sourceRef: job.job_id });\nconst relationships = [];\nfor (const t of technologies) relationships.push({ sourceEntityType: \u0027project\u0027, sourceEntityId: job.project_id, targetEntityType: \u0027technology\u0027, targetEntityId: t.normalizedName, relationshipType: \u0027uses_technology\u0027, confidenceScore: t.confidenceScore || 0.7, evidence: [{ source: \u0027di_worker\u0027, jobId: job.job_id }], visibilityLevel: \u0027project\u0027 });\nfor (const s of solutions) relationships.push({ sourceEntityType: \u0027project\u0027, sourceEntityId: job.project_id, targetEntityType: \u0027reusable_solution\u0027, targetEntityId: s.slug || s.title, relationshipType: \u0027has_reusable_candidate\u0027, confidenceScore: 0.72, evidence: [{ source: \u0027di_worker\u0027, jobId: job.job_id }], visibilityLevel: s.visibilityLevel || \u0027project\u0027 });\nconst explicitRecommendations = Array.isArray(submitted.recommendations) ? submitted.recommendations : Array.isArray(input.recommendations) ? input.recommendations : [];\nconst recommendations = explicitRecommendations.map(r =\u003e ({ recommendationType: r.recommendationType || r.type || \u0027delivery_intelligence\u0027, title: r.title || \u0027Delivery intelligence recommendation\u0027, summary: r.summary || \u0027\u0027, rationale: r.rationale || \u0027\u0027, relatedEntityType: r.relatedEntityType || null, relatedEntityId: r.relatedEntityId || null, confidenceScore: r.confidenceScore || 0.7, status: \u0027new\u0027 }));\nif (recommendations.length === 0 \u0026\u0026 solutions.length \u003e 0) recommendations.push({ recommendationType: \u0027reusable_accelerator_available\u0027, title: \u0027Review reusable solution candidate\u0027, summary: `${solutions.length} reusable solution candidate(s) were extracted for this project.`, rationale: \u0027Draft candidates should be reviewed, sanitized, and published if suitable for reuse.\u0027, relatedEntityType: \u0027project\u0027, relatedEntityId: job.project_id, confidenceScore: 0.74, status: \u0027new\u0027 });\nconst payload = { jobId: job.job_id, jobType: job.job_type, projectId: job.project_id, requestedBy: job.requested_by, technologies, solutions, learnings, relationships, recommendations };\nconst totalRecords = technologies.length + solutions.length + learnings.length + relationships.length + recommendations.length;\nreturn [{ json: { jobId: job.job_id, projectId: job.project_id, requestedBy: job.requested_by, jobType: job.job_type, startedAt: job.output?.startedAt || new Date().toISOString(), payload, extractionSummary: { technologies: technologies.length, solutions: solutions.length, learnings: learnings.length, relationships: relationships.length, recommendations: recommendations.length, totalRecords, qaContextJobs: qaJobs.length, projectName: project?.name || null }, warning: totalRecords === 0 ? \u0027No Delivery Intelligence records were extracted from this job input/context.\u0027 : null } }];"
}
```

### Build DI Failure Output

| Field | Value |
| --- | --- |
| Node ID | 6b2a7c24-f9a5-4ddc-985b-40c625036071 |
| Type | n8n-nodes-base.code |
| Type Version | 2 |
| Position | 2016, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Persist DI Extraction -> Build DI Failure Output (output 1, input 0)

**Outgoing Connections**

- Build DI Failure Output -> Mark DI Job Failed (output 0, input 0)

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "jsCode":  "const built = $(\u0027Build DI Extraction Payload\u0027).first().json;\nconst message = $json.error?.message || $json.message || \u0027Delivery Intelligence persistence failed\u0027;\nreturn [{ json: { jobId: built.jobId, output: { ok: false, jobType: built.jobType, projectId: built.projectId, extractionSummary: built.extractionSummary, error: message, failedAt: new Date().toISOString() }, error: message } }];"
}
```

### DI Lock Acquired?

| Field | Value |
| --- | --- |
| Node ID | 23a901c0-597d-43f2-99fd-b35db32fa503 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 896, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Lock DI Job -> DI Lock Acquired? (output 0, input 0)

**Outgoing Connections**

- DI Lock Acquired? -> Fetch DI Project Context (output 0, input 0)
- DI Lock Acquired? -> Sticky Note 0c4e72a9 (output 1, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
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

### Fetch DI Project Context

| Field | Value |
| --- | --- |
| Node ID | 532ec4a2-79f7-4815-8725-3e58834c39c6 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1120, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- DI Lock Acquired? -> Fetch DI Project Context (output 0, input 0)

**Outgoing Connections**

- Fetch DI Project Context -> Fetch Read Only QA Context (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qops_projects?id=eq.{{ encodeURIComponent($json.project_id || \"__none__\") }}\u0026select=id,name,description,owner,module,release,tags,status\u0026limit=1",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Fetch Read Only QA Context

| Field | Value |
| --- | --- |
| Node ID | d3c41d1b-e75c-4a46-a4fe-566a7f8d0692 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1344, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Fetch DI Project Context -> Fetch Read Only QA Context (output 0, input 0)

**Outgoing Connections**

- Fetch Read Only QA Context -> Build DI Extraction Payload (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/qa_jobs?project_id=eq.{{ encodeURIComponent($(\"Lock DI Job\").item.json.project_id || \"__none__\") }}\u0026status=eq.completed\u0026select=job_id,input,output,created_at\u0026order=created_at.desc\u0026limit=10",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "options":  {

                }
}
```

### Get Pending DI Jobs

| Field | Value |
| --- | --- |
| Node ID | 5f28de72-1075-407f-b943-4bb4e239360d |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 224, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Schedule Trigger -> Get Pending DI Jobs (output 0, input 0)

**Outgoing Connections**

- Get Pending DI Jobs -> Pending DI Job Exists? (output 0, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendQuery":  true,
    "queryParameters":  {
                            "parameters":  [
                                               {
                                                   "name":  "status",
                                                   "value":  "eq.pending"
                                               },
                                               {
                                                   "name":  "order",
                                                   "value":  "created_at.asc"
                                               },
                                               {
                                                   "name":  "limit",
                                                   "value":  "1"
                                               },
                                               {
                                                   "name":  "select",
                                                   "value":  "job_id,status,job_type,project_id,requested_by,input,output,created_at"
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

### Lock DI Job

| Field | Value |
| --- | --- |
| Node ID | 63872c41-1d55-4901-8cad-e3964a0ab1dd |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 672, 96 |
| Disabled |  |
| Always Output Data | True |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending DI Job Exists? -> Lock DI Job (output 0, input 0)

**Outgoing Connections**

- Lock DI Job -> DI Lock Acquired? (output 0, input 0)

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ encodeURIComponent($json.job_id) }}\u0026status=eq.pending",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"running\", output: { ...($json.output || {}), startedAt: $now.toISO(), worker: \"DI - Intelligence Worker\" }, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Mark DI Job Completed

| Field | Value |
| --- | --- |
| Node ID | 4795c4d7-1dc4-4588-9646-04c176aff391 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 0 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build DI Completion Output -> Mark DI Job Completed (output 0, input 0)

**Outgoing Connections**

- None

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ encodeURIComponent($json.jobId) }}\u0026status=eq.running",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: $json.status, output: $json.output, error: null, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Mark DI Job Failed

| Field | Value |
| --- | --- |
| Node ID | 3968cbbc-debf-4e35-b050-d9abd7d1f317 |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 2240, 192 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build DI Failure Output -> Mark DI Job Failed (output 0, input 0)

**Outgoing Connections**

- None

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
    "url":  "=https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/di_intelligence_jobs?job_id=eq.{{ encodeURIComponent($json.jobId) }}\u0026status=eq.running",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\", \"Prefer\": \"return=representation\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ status: \"failed\", output: $json.output, error: $json.error, updated_at: $now.toISO() }) }}",
    "options":  {

                }
}
```

### Pending DI Job Exists?

| Field | Value |
| --- | --- |
| Node ID | 14dd6bac-2424-43dc-bb69-e7a577896f60 |
| Type | n8n-nodes-base.if |
| Type Version | 2.3 |
| Position | 448, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Get Pending DI Jobs -> Pending DI Job Exists? (output 0, input 0)

**Outgoing Connections**

- Pending DI Job Exists? -> Lock DI Job (output 0, input 0)
- Pending DI Job Exists? -> Sticky Note 0c4e72a9 (output 1, input 0)

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
                                              "leftValue":  "={{ Object.keys($json).length }}",
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

### Persist DI Extraction

| Field | Value |
| --- | --- |
| Node ID | bd91b003-e88e-40a0-8a0a-c48e457747de |
| Type | n8n-nodes-base.httpRequest |
| Type Version | 4.4 |
| Position | 1792, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Build DI Extraction Payload -> Persist DI Extraction (output 0, input 0)

**Outgoing Connections**

- Persist DI Extraction -> Build DI Completion Output (output 0, input 0)
- Persist DI Extraction -> Build DI Failure Output (output 1, input 0)

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
    "url":  "https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/di_persist_extraction",
    "authentication":  "genericCredentialType",
    "genericAuthType":  "httpCustomAuth",
    "sendHeaders":  true,
    "specifyHeaders":  "json",
    "jsonHeaders":  "{ \"Content-Type\": \"application/json\" }",
    "sendBody":  true,
    "specifyBody":  "json",
    "jsonBody":  "={{ JSON.stringify({ p_payload: $json.payload }) }}",
    "options":  {

                }
}
```

### Schedule Trigger

| Field | Value |
| --- | --- |
| Node ID | 815f96e8-3f3d-4a35-954c-fbf47b03a73f |
| Type | n8n-nodes-base.scheduleTrigger |
| Type Version | 1.3 |
| Position | 0, 96 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- None

**Outgoing Connections**

- Schedule Trigger -> Get Pending DI Jobs (output 0, input 0)

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
                                      "field":  "seconds"
                                  }
                              ]
             }
}
```

### Sticky Note 0c4e72a9

| Field | Value |
| --- | --- |
| Node ID | 6ec949cb-15be-4c82-a52b-56ac441d41c8 |
| Type | n8n-nodes-base.stickyNote |
| Type Version | 1 |
| Position | 1120, 256 |
| Disabled |  |
| Always Output Data |  |
| Retry On Fail |  |
| Continue On Fail |  |

**Incoming Connections**

- Pending DI Job Exists? -> Sticky Note 0c4e72a9 (output 1, input 0)
- DI Lock Acquired? -> Sticky Note 0c4e72a9 (output 1, input 0)

**Outgoing Connections**

- None

**Credential References**

```json
None
```

**Full Parameter Snapshot**

```json
{
    "content":  "## Delivery Intelligence Worker\nPolls di_intelligence_jobs only. It never reads or writes qa_jobs except read-only context lookup, and never modifies QA workflows. Persists extracted DI records through public.di_persist_extraction using the Supabase service-role credential.",
    "height":  220,
    "width":  2600,
    "color":  5
}
```
