# Backend Integration Steps For UI-Backed Repositories

Date: 2026-05-04

This document lists the n8n/Supabase endpoints needed to complement the UI integration now implemented in the frontend. The UI already calls these endpoints defensively: if an endpoint is not available, it falls back to local browser state. Once the workflows exist, the UI will automatically hydrate projects, artifacts, generated documents, audit events, analytics, and health status from backend data.

## 1. Import Health Workflow

Import this workflow into n8n:

```text
n8n_workflows/Q-Ops-Agent-Health-Status.json
```

Expected endpoint:

```text
GET /webhook/health
```

Expected response:

```json
{
  "status": "ok",
  "generatedAt": "ISO timestamp",
  "services": [
    {
      "name": "n8n backend",
      "status": "ok",
      "detail": "Health workflow executed successfully."
    }
  ],
  "webhooks": {},
  "integrations": {}
}
```

## 2. Implement Project Repository

Recommended Supabase table:

```text
qops_projects
```

Suggested columns:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid/text | Primary key |
| `name` | text | Unique project name |
| `description` | text | Optional |
| `owner` | text | Product owner or user |
| `module` | text | Optional |
| `release` | text | Optional |
| `tags` | jsonb | String array |
| `status` | text | `draft`, `ingesting`, `ready`, `generating`, `blocked` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Endpoints:

```text
GET /webhook/projects
POST /webhook/projects
```

`GET /webhook/projects` response:

```json
[
  {
    "id": "project-id",
    "name": "Payments modernization",
    "description": "string",
    "owner": "Admin User",
    "module": "Checkout",
    "release": "R2.4",
    "tags": ["payments"],
    "status": "ready",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
]
```

`POST /webhook/projects` request/response should use the same camelCase shape.

Implementation notes:

- Upsert by case-insensitive `name`.
- Mark project `ingesting` when an ingestion job is queued.
- Mark project `ready` when the latest ingestion job completes.

## 3. Implement Artifact Repository

The UI expects artifacts from Supabase Storage and/or `doc_ingestion_jobs`.

Endpoint:

```text
GET /webhook/artifacts
```

Response:

```json
[
  {
    "id": "artifact-id",
    "projectName": "Payments modernization",
    "type": "BRD",
    "fileName": "BRD.pdf",
    "size": 123456,
    "uploadedAt": "ISO timestamp",
    "status": "processed",
    "url": "https://...",
    "jobId": "ING-..."
  }
]
```

Recommended source:

- Read `doc_ingestion_jobs.input.files`.
- Expand the `files` object into one row per file.
- Join or infer status from `doc_ingestion_jobs.status`.
- Include storage public URL as `url`.

Optional endpoint for the visible Reprocess button:

```text
POST /webhook/artifacts/{artifactId}/reprocess
```

Response:

```json
{
  "jobId": "ING-YYMMDD-RANDOM",
  "status": "queued"
}
```

Implementation note:

- The current UI calls this endpoint but does nothing disruptive if it is not available.
- Reprocess can either requeue the original file URL through `doc_ingestion_jobs`, or create a lightweight workflow that copies the original file map into a new ingestion job.

## 4. Implement Generated Documents Repository

Endpoint:

```text
GET /webhook/generated-documents
```

Response:

```json
[
  {
    "id": "GEN-...",
    "jobId": "GEN-...",
    "projectName": "Payments modernization",
    "artifactLabel": "Test Strategy",
    "documentType": "test_strategy",
    "createdAt": "ISO timestamp",
    "status": "completed",
    "url": "https://confluence-page-url",
    "output": {
      "confluencePageId": "123",
      "url": "https://..."
    }
  }
]
```

Recommended source:

- Query `qa_jobs`.
- Select `job_id`, `status`, `input`, `output`, `created_at`, `updated_at`.
- Map `input.projectName` to `projectName`.
- Map `input.documentType` to `documentType`.
- For Confluence jobs, expose `output.url`.
- For Jira jobs, include `output.stories` and `output.epics`.

## 5. Implement Audit Events From Metrics

Endpoint:

```text
GET /webhook/audit-events
```

Recommended source:

```text
qa_job_metrics
```

Response:

```json
[
  {
    "id": "metric-id",
    "actor": "n8n",
    "action": "JOB_COMPLETED",
    "project": "Payments modernization",
    "entity": "GEN-...",
    "status": "info",
    "timestamp": "ISO timestamp",
    "details": "generation | test_strategy | completed",
    "event": "JOB_COMPLETED",
    "pipeline": "generation",
    "jobId": "GEN-..."
  }
]
```

Mapping guidance:

- `JOB_FAILED` and `QUALITY_GATE_FAILED` should map to `status: "error"`.
- `JOB_COMPLETED` and `QUALITY_GATE_PASSED` can map to `status: "success"` or `info`.
- `JOB_QUEUED` and `JOB_STARTED` can map to `status: "info"`.

The UI derives notification items from important audit events such as completed jobs, failed jobs, and quality gate events.

## 6. Analytics Summary

Already implemented in the uploaded workflow:

```text
GET /webhook/analytics-summary?pipeline={all|generation|ingestion}&days={7|30|90}
```

The UI now consumes:

- `overview.totalJobsCompleted`
- `overview.totalDocumentsGenerated`
- `overview.totalJobsFailed`
- `overview.successRate`
- `overview.totalCostUsd`
- `overview.totalTokensConsumed`
- `overview.totalChunksIngested`
- `byDocumentType`
- `failureRate`
- `recentJobs`
- `meta`

If the analytics workflow path differs, either align the n8n webhook path to `analytics-summary` or update `src/lib/api.ts`.

## 7. Recommended Implementation Order

1. Import and activate `Q-Ops-Agent-Health-Status.json`.
2. Implement `GET /webhook/analytics-summary` if not already active.
3. Implement `GET /webhook/audit-events` from `qa_job_metrics`.
4. Implement `GET /webhook/generated-documents` from `qa_jobs`.
5. Implement `GET /webhook/artifacts` from `doc_ingestion_jobs.input.files`.
6. Implement `GET /webhook/projects` and `POST /webhook/projects`.
7. Optionally implement `POST /webhook/artifacts/{artifactId}/reprocess`.

Once these are active, reload the dashboard and use Settings -> Test Connection, Analytics -> Refresh, and the Artifacts/Doc Gen pages to verify live hydration.
