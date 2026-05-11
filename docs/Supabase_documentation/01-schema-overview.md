# Schema Overview

Generated on: 2026-05-08

## Project

- Supabase URL: `https://ifnznfspkjayhnooncrv.supabase.co`
- PostgREST type generation version observed: `14.4`
- Edge Functions: none deployed
- Realtime publication `supabase_realtime`: no public/storage tables listed

## Public Schema Tables

| Table | Approx rows | RLS | Purpose |
|---|---:|---|---|
| `qa_jobs` | 51 | Disabled | Generation job lifecycle: queued/processing/completed/failed plus request/output payloads. |
| `doc_ingestion_jobs` | 35 | Disabled | Ingestion job lifecycle, file input metadata, output chunk/token metadata. |
| `doc_ingestion_queuecreator_logs` | 14 | Disabled | Queue creator log for ingestion upload jobs; one row per `job_id`. |
| `qa_job_metrics` | 54 | Disabled | Cross-pipeline telemetry: queued/started/quality/completed/failed, duration, tokens, cost, metadata. |
| `qops_projects` | 2 | Enabled | Knowledge-base/project records shown in the UI. |
| `qops_users` | 3 | Enabled | Q-Ops app user profiles mapped to Supabase Auth users. |
| `qops_project_members` | 1 | Enabled | Project assignments and project-level roles. |
| `qops_environment_settings` | 4 | Enabled | Environment routing/config records: local/dev/test/prod. |
| `qops_integration_settings` | 7 | Enabled | Integration config/status by environment: Jira, Confluence, Supabase, Chroma, n8n, microservices, OpenAI. |
| `qops_project_integration_overrides` | 0 | Enabled | Optional per-project integration overrides. |
| `qops_connection_test_results` | 21 | Enabled | Historical integration health/test snapshots. |
| `qops_user_preferences` | 1 | Enabled | Per-user UI preferences and notification switches. |
| `qops_audit_events` | 18 | Enabled | Admin/user/audit event trail. |

## Public Views

| View | Purpose |
|---|---|
| `job_cost_summary` | Aggregates token and cost data by pipeline and document type using `QUALITY_GATE_PASSED` metrics. |
| `job_failure_rate` | Aggregates completed, failed, queued, and failure rate by pipeline/document type. |
| `job_observability_dashboard` | Hourly observability rollup by pipeline, document type, and event. |

## Storage Schema Tables

The `storage` schema is Supabase-managed. It is documented for environment recreation awareness, but it should generally be managed by Supabase Storage APIs rather than direct DDL.

| Table | Approx rows | RLS | Purpose |
|---|---:|---|---|
| `storage.buckets` | 1 | Enabled | Bucket registry. |
| `storage.objects` | 266 | Enabled | Stored object metadata. |
| `storage.migrations` | 61 | Enabled | Supabase Storage internal migrations. |
| `storage.s3_multipart_uploads` | 0 | Enabled | Multipart upload tracking. |
| `storage.s3_multipart_uploads_parts` | 0 | Enabled | Multipart upload parts tracking. |
| `storage.buckets_analytics` | 0 | Enabled | Storage analytics buckets. |
| `storage.buckets_vectors` | 0 | Enabled | Storage vector bucket metadata. |
| `storage.vector_indexes` | 0 | Enabled | Storage vector index metadata. |

## Main Domain Relationships

- `qops_projects.id` is referenced by:
  - `qops_project_members.project_id`
  - `qops_project_integration_overrides.project_id`
- `qops_users.id` is referenced by:
  - `qops_project_members.user_id`
  - `qops_user_preferences.user_id`
  - `qa_job_metrics.requested_by`
- `qops_environment_settings.environment_key` is referenced by:
  - `qops_integration_settings.environment_key`
- `qa_jobs.project_id`, `doc_ingestion_jobs.project_id`, and `qa_job_metrics.project_id` are text columns used for attribution. They are indexed but not currently foreign-key constrained to `qops_projects.id`.
- `qa_jobs.requested_by` and `doc_ingestion_jobs.requested_by` are UUID attribution columns but are not currently foreign-key constrained.

## Pipeline Lifecycle Contracts

Generation pipeline:

1. Queue creator inserts `qa_jobs` with `status = pending`.
2. Worker locks/updates job to `processing`.
3. Worker emits `qa_job_metrics` events:
   - `JOB_QUEUED`
   - `JOB_STARTED`
   - `QUALITY_GATE_PASSED` or `QUALITY_GATE_FAILED`
   - `JOB_COMPLETED` or `JOB_FAILED`
4. Worker patches `qa_jobs.status` to `completed` or `failed`.
5. Completed generation outputs store either:
   - Confluence destination metadata: `url`, `confluencePageId`, `wordCount`, `tokenUsage`
   - Jira destination metadata: `stories`, `epics`, `wordCount`, `tokenUsage`

Ingestion pipeline:

1. Upload queue creator inserts `doc_ingestion_jobs` with `status = pending`.
2. Queue creator writes/updates `doc_ingestion_queuecreator_logs`.
3. Worker locks/updates job to `processing`.
4. Worker stores files in Supabase Storage and chunks in Chroma.
5. Worker emits `qa_job_metrics` events for ingestion.
6. Worker patches `doc_ingestion_jobs.status` to `completed` or `failed`.
7. Completed ingestion output stores chunk counts, file keys, destination metadata, and token usage.

