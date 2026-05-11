# Production Rebuild Checklist

Generated on: 2026-05-08

Use this checklist when creating the production Supabase environment from this development project.

## 1. Project And Environment

- Create production Supabase project.
- Record production project URL and publishable key.
- Do not expose service-role key to frontend code.
- Configure frontend environment variables with production URL and publishable key only.
- Configure n8n credentials with the production service-role key.

## 2. Extensions

Ensure installed extensions required by the current schema exist:

- `pgcrypto`
- `uuid-ossp`
- `pg_stat_statements`
- `supabase_vault`
- `plpgsql`

Do not install available-but-unused extensions unless production features require them.

## 3. Migrations

Apply migrations in order:

1. `20260507045008_persona_settings_backend_support`
2. `20260507045201_restrict_runtime_config_rpc_to_service_role`
3. `20260507075620_add_unique_qops_users_email`
4. `20260507153328_add_qa_job_metrics_attribution_columns`

After migration:

```sql
select * from supabase_migrations.schema_migrations order by version;
```

Then compare against [06-storage-migrations-environment.md](06-storage-migrations-environment.md).

## 4. Seed Required Configuration

Seed or manually create:

- `qops_environment_settings`
- `qops_integration_settings`
- `qops_projects`
- `qops_users`
- `qops_project_members`
- `qops_user_preferences` as needed

Do not seed secrets into `qops_integration_settings.config`.

Use:

- `config` for non-secret routing/config.
- `secret_refs` for credential names/references only.
- n8n credentials or Supabase secrets for actual secrets.

## 5. Storage

Create bucket:

- `uploaded-project-docs`

Current dev bucket is public. For production, decide:

- Public bucket: easiest for current document URLs but exposes uploaded documents by URL.
- Private bucket: safer; requires signed URL or service-role retrieval changes.

Match or intentionally change:

- File size limit: currently inherited/global, `52428800` bytes.
- Allowed MIME types: currently unrestricted.
- Image transformation: enabled.
- S3 protocol: enabled.

## 6. RLS And Grants

Design before enabling.

Critical tables currently RLS-disabled:

- `qa_jobs`
- `doc_ingestion_jobs`
- `doc_ingestion_queuecreator_logs`
- `qa_job_metrics`

Recommended production direction:

- Keep operational writes service-role-only through n8n/API workflows.
- Add read policies only where direct frontend reads are required.
- Prefer auth-aware API workflows for dashboard/audit/artifact/generated document reads.
- Revoke broad anon/authenticated grants from operational tables after confirming workflows do not depend on client-side direct access.

RLS-enabled tables with existing client read/update policies:

- `qops_users`
- `qops_projects`
- `qops_project_members`
- `qops_user_preferences`

RLS-enabled tables with no policies:

- `qops_audit_events`
- `qops_connection_test_results`
- `qops_environment_settings`
- `qops_integration_settings`
- `qops_project_integration_overrides`

## 7. Views And Functions

Before production:

- Recreate analytical views with `security_invoker = true` if using Postgres 15+.
- Add explicit search paths to:
  - `get_analytics_overview`
  - `get_analytics_by_document_type`
  - `get_analytics_failure_rate`
  - `update_updated_at_column`
- Keep `qops_resolve_runtime_config` as `SECURITY DEFINER` with fixed search path and restricted execution.

## 8. Data Contract Checks

Generation jobs:

- `qa_jobs.job_id` should be unique and formatted as `GEN-YYMMDD-XXXXXX`.
- `qa_jobs.status` should be one of `pending`, `processing`, `completed`, `failed`.
- Completed Confluence jobs should include `output.url`, `output.confluencePageId`, `output.wordCount`, `output.tokenUsage`.
- Completed Jira jobs should include `output.stories`, `output.epics`, `output.wordCount`, `output.tokenUsage`.
- Terminal jobs should have a `JOB_COMPLETED` or `JOB_FAILED` row in `qa_job_metrics`.

Ingestion jobs:

- `doc_ingestion_jobs.job_id` should be formatted as `ING-YYMMDD-XXXXXX`.
- Completed jobs should include `output.totalChunksStored` and `output.tokenUsage`.
- Queue logs should have one row per `job_id` in `doc_ingestion_queuecreator_logs`.

Metrics:

- `qa_job_metrics.pipeline` should be `generation` or `ingestion`.
- `qa_job_metrics.event` should use the known lifecycle events.
- Token/cost fields should be numeric when present.
- `project_id`, `requested_by`, and `settings_version` should be populated for registered-user workflows.

## 9. Verification SQL

After first production smoke:

```sql
select status, count(*)
from public.qa_jobs
group by status
order by status;

select status, count(*)
from public.doc_ingestion_jobs
group by status
order by status;

select pipeline, event, count(*)
from public.qa_job_metrics
group by pipeline, event
order by pipeline, event;

select *
from public.get_analytics_overview(now() - interval '30 days', 'all');
```

Check for stuck jobs:

```sql
select job_id, status, created_at, updated_at
from public.qa_jobs
where status = 'processing'
order by created_at;

select job_id, status, created_at, updated_at
from public.doc_ingestion_jobs
where status = 'processing'
order by created_at;
```

Check attribution:

```sql
select pipeline, event, count(*) as rows_missing_attribution
from public.qa_job_metrics
where created_at >= now() - interval '1 day'
  and (project_id is null or requested_by is null)
group by pipeline, event
order by rows_missing_attribution desc;
```

## 10. Known Gaps To Resolve Before Production

- RLS-disabled operational tables.
- Broad grants to `anon`/`authenticated` on public objects.
- Security-definer analytical views.
- Mutable function search paths on analytics functions and `update_updated_at_column`.
- Public Storage bucket for uploaded project documents.
- No DB check constraints on job `status`, `pipeline`, or `event` values.
- Attribution columns on `qa_jobs` and `doc_ingestion_jobs` are not FK constrained.
- Historical dev/test rows should not be migrated to production unless explicitly needed.

