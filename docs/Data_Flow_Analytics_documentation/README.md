# Data Flow And Analytics Documentation

Generated on 2026-05-08.

This document explains how Q-Ops Agent data moves through the system and how analytics should be calculated.

## Core Tables

| Table | Purpose |
| --- | --- |
| `qa_jobs` | Generation job queue/status/output. |
| `doc_ingestion_jobs` | Ingestion job queue/status/output. |
| `doc_ingestion_queuecreator_logs` | Ingestion queue creator observability/logging. |
| `qa_job_metrics` | Cross-pipeline telemetry, token usage, cost, lifecycle events. |
| `qops_projects` | Projects visible in UI. |
| `qops_users` | Q-Ops user profile and role mapping to Supabase Auth. |
| `qops_project_members` | Registered user project membership. |
| `qops_audit_events` | UI/admin/settings/user audit events. |
| `qops_environment_settings` | Environment runtime settings. |
| `qops_integration_settings` | Jira/Confluence/Chroma/n8n/etc settings. |
| `qops_connection_test_results` | Integration health snapshots. |

## Ingestion Data Flow

```text
UI upload
  -> /webhook/upload-test-artifacts
  -> doc_ingestion_jobs
  -> doc_ingestion_queuecreator_logs
  -> qa_job_metrics JOB_QUEUED
  -> ingestion worker
  -> extractor/vectorizer
  -> ChromaDB
  -> doc_ingestion_jobs completed/failed
  -> qa_job_metrics JOB_COMPLETED/JOB_FAILED
  -> UI polling/repository/analytics
```

Expected ingestion metrics:

- `pipeline = ingestion`
- `event`
- `status`
- `job_id`
- `project_id`
- `requested_by`
- `duration_ms`
- `chunk_count`
- `total_files`
- token/cost fields if LLM/embedding usage is available

## Generation Data Flow

```text
UI generate
  -> /webhook/generate-qa-doc
  -> qa_jobs
  -> qa_job_metrics JOB_QUEUED
  -> generation worker
  -> Chroma retrieval
  -> LLM generation
  -> quality gate
  -> Jira/Confluence/converter branch
  -> qa_jobs completed/failed
  -> qa_job_metrics JOB_COMPLETED/JOB_FAILED
  -> UI polling/repository/analytics
```

Expected generation metrics:

- `pipeline = generation`
- `document_type`
- `project_name`
- `project_id`
- `requested_by`
- `duration_ms`
- `word_count`
- `tokens_input`
- `tokens_output`
- `tokens_total`
- `estimated_cost_usd`
- metadata:
  - model
  - environment
  - settings version
  - output type
  - stories/epics created for Jira branch

## Recommended Lifecycle Events

| Event | Pipeline | Meaning |
| --- | --- | --- |
| `JOB_QUEUED` | both | Queue creator accepted work. |
| `JOB_STARTED` | both | Worker picked up job. |
| `EXTRACTION_STARTED` | ingestion | Artifact extraction started. |
| `VECTOR_UPSERT_COMPLETED` | ingestion | Chunks embedded/upserted. |
| `GENERATION_STARTED` | generation | LLM/retrieval started. |
| `QUALITY_GATE_PASSED` | generation | Output validated and token/cost totals calculated. |
| `PUBLISH_STARTED` | generation | Jira/Confluence/output publish started. |
| `JOB_COMPLETED` | both | Terminal success. |
| `JOB_FAILED` | both | Terminal failure. |

## Analytics Calculations

Total completed jobs:

```sql
select count(*)
from qa_job_metrics
where event = 'JOB_COMPLETED';
```

Total cost:

```sql
select coalesce(sum(estimated_cost_usd), 0)
from qa_job_metrics
where event = 'JOB_COMPLETED';
```

Total tokens:

```sql
select coalesce(sum(tokens_total), 0)
from qa_job_metrics
where event = 'JOB_COMPLETED';
```

Failure count:

```sql
select count(*)
from qa_job_metrics
where event = 'JOB_FAILED';
```

Success rate:

```text
completed / (completed + failed) * 100
```

Average cost per document:

```text
total generation cost / completed generation documents
```

## UI Analytics Contract

`/webhook/analytics-summary` should return:

- overview totals
- by-document-type rows
- failure rate by pipeline
- recent jobs
- ingestion summary
- recent failures
- cost by pipeline
- cost by project
- metadata with generation timestamp and filter range

## Data Quality Checks

Run after every major workflow change:

```sql
select event, pipeline, count(*)
from qa_job_metrics
group by event, pipeline
order by pipeline, event;
```

```sql
select *
from qa_job_metrics
where event = 'JOB_COMPLETED'
  and pipeline = 'generation'
  and (tokens_total is null or estimated_cost_usd is null);
```

```sql
select *
from qa_jobs
where status in ('queued', 'pending', 'processing')
  and created_at < now() - interval '2 hours';
```

```sql
select *
from doc_ingestion_jobs
where status in ('queued', 'pending', 'processing')
  and created_at < now() - interval '2 hours';
```

## Known Analytics Risks

- Jobs can complete without token/cost if quality gate output is not passed downstream.
- Stuck jobs distort success rate unless marked failed.
- UI local cache can show outputs before backend repository endpoints refresh.
- Project name matching is fragile; project id attribution is preferred.
- RLS/security posture must be fixed before exposing analytics directly.

