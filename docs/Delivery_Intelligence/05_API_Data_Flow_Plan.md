# API And Data Flow Plan

## Data Flow Overview

Delivery Intelligence should use a similar long-running job model to the current QA generation pipeline.

High-level flow:

1. UI submits Delivery Intelligence job.
2. n8n verifies Supabase user.
3. n8n inserts `di_intelligence_jobs`.
4. Worker picks up pending job.
5. Worker retrieves source context from Supabase, Chroma, Jira, Confluence, or documents.
6. AI extraction creates technologies, solutions, learnings, relationships, and recommendations.
7. UI polls job status or refreshes Delivery Intelligence screens.

## Proposed UI-Facing API Endpoints

### Jobs

`POST /webhook/di/jobs`

Creates a Delivery Intelligence background job.

Request:

```json
{
  "jobType": "project_intelligence_extract",
  "projectId": "project-id",
  "projectName": "Project Name",
  "sourceTypes": ["qa_outputs", "artifacts", "confluence", "jira"]
}
```

Response:

```json
{
  "jobId": "DI-260511-ABC123",
  "status": "queued"
}
```

`GET /webhook/di/jobs/status?jobId=...`

Returns status and output summary.

### Search

`GET /webhook/di/search?q=retry handling&category=all`

Returns governed cross-project search results.

Response shape:

```json
{
  "query": "retry handling",
  "summary": "Several reusable retry patterns were found.",
  "results": [
    {
      "type": "solution",
      "id": "solution-id",
      "title": "External API Retry Pattern",
      "summary": "Reusable retry and idempotency pattern.",
      "confidence": 0.91,
      "visibility": "organization",
      "evidence": []
    }
  ]
}
```

### Solutions

`GET /webhook/di/solutions`

Query params:

- `q`
- `technology`
- `tag`
- `visibility`
- `status`

`GET /webhook/di/solutions/:id`

Returns full solution details.

`POST /webhook/di/solutions`

Creates a manual reusable solution draft.

`PATCH /webhook/di/solutions/:id`

Updates status, visibility, owner, or content.

### Technologies

`GET /webhook/di/technologies`

Returns technologies with usage counts.

`GET /webhook/di/technologies/:id`

Returns projects, solutions, and learnings related to a technology.

### Learnings

`GET /webhook/di/learnings`

Returns organizational learnings.

`GET /webhook/di/learnings/:id`

Returns learning detail with source evidence.

### Recommendations

`GET /webhook/di/recommendations?projectId=...`

Returns active recommendations.

`PATCH /webhook/di/recommendations/:id`

Updates recommendation status or feedback.

## Access Control

Every endpoint should:

- Require bearer token.
- Resolve `qops_users`.
- Check user role.
- Check `qops_project_members` for project-scoped data.
- Apply visibility-level filtering.

Admin:

- Can see all records.

Registered user:

- Can see assigned project records.
- Can see organization-visible reusable solutions.
- Cannot see confidential or client-restricted records unless assigned.

## Integration With Existing Data

The Delivery Intelligence layer should read from current tables:

- `qops_projects`
- `qa_jobs`
- `qa_job_metrics`
- `qops_audit_events`
- `doc_ingestion_jobs`

It should not write into existing QA output structures except for optional metrics or audit logs.

## Chroma Strategy

Option 1:

- Reuse existing Chroma collection and metadata.

Option 2:

- Create a Delivery Intelligence collection.

Recommendation:

Start by reusing existing project chunks for MVP. Add a separate DI collection only when source types grow beyond QA artifacts.

Required metadata:

- `project`
- `projectId`
- `sourceType`
- `visibilityLevel`
- `artifactType`
- `entityType`

## Metrics Strategy

MVP:

- Use `qa_job_metrics` with `pipeline = 'delivery_intelligence'`.

Long term:

- Create `di_job_metrics` if analytics diverge significantly.

Events:

- `DI_JOB_QUEUED`
- `DI_JOB_STARTED`
- `DI_EXTRACTION_COMPLETED`
- `DI_RECOMMENDATIONS_CREATED`
- `DI_JOB_COMPLETED`
- `DI_JOB_FAILED`

