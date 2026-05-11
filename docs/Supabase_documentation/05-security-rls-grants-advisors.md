# Security, RLS, Grants, And Advisor Findings

Generated on: 2026-05-08

## Critical Security Posture

Supabase advisor reported four public application tables with RLS disabled:

- `public.qa_jobs`
- `public.doc_ingestion_jobs`
- `public.doc_ingestion_queuecreator_logs`
- `public.qa_job_metrics`

These tables are in the exposed `public` schema. If direct PostgREST access is available with anon/authenticated keys, RLS-disabled tables can be exposed broadly depending on grants. Do not enable RLS blindly in production without adding policies, because writes from n8n/API flows may start returning zero rows or failing.

Recommended production approach:

1. Prefer all operational job writes through backend/n8n service-role workflows.
2. Enable RLS on the four operational tables.
3. Add narrowly scoped policies only for required frontend reads, or keep frontend reads behind auth-aware API workflows.
4. Revoke unnecessary anon/authenticated direct table privileges if using API workflows as the boundary.

Potential baseline SQL, to run only after policy design:

```sql
ALTER TABLE public.qa_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_ingestion_queuecreator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_job_metrics ENABLE ROW LEVEL SECURITY;
```

## RLS Enabled Tables With No Policies

Supabase advisor reported RLS enabled but no policies on:

- `public.qops_audit_events`
- `public.qops_connection_test_results`
- `public.qops_environment_settings`
- `public.qops_integration_settings`
- `public.qops_project_integration_overrides`

This means client-side direct access is denied unless service role is used or policies are added. That can be acceptable if these tables are intentionally backend-managed.

## Existing RLS Policies

### `public.qops_users`

Policy: `qops_users_can_read_self`

- Role: `authenticated`
- Command: `SELECT`
- Predicate: user can read row where `auth_user_id = auth.uid()`.

### `public.qops_projects`

Policy: `qops_projects_can_read_assigned`

- Role: `authenticated`
- Command: `SELECT`
- Predicate: user can read projects assigned through `qops_project_members`.

### `public.qops_project_members`

Policy: `qops_project_members_can_read_own`

- Role: `authenticated`
- Command: `SELECT`
- Predicate: user can read their own project assignment rows.

### `public.qops_user_preferences`

Policy: `qops_preferences_can_read_self`

- Role: `authenticated`
- Command: `SELECT`
- Predicate: user can read own preferences via `qops_users.auth_user_id = auth.uid()`.

Policy: `qops_preferences_can_update_self`

- Role: `authenticated`
- Command: `UPDATE`
- Predicate/check: user can update own preferences via `qops_users.auth_user_id = auth.uid()`.

## Advisor Findings

### Security Errors / Critical Items

| Finding | Object | Production action |
|---|---|---|
| RLS disabled in public | `qa_jobs` | Design/enable RLS policies or move access behind service-role APIs. |
| RLS disabled in public | `doc_ingestion_jobs` | Design/enable RLS policies or move access behind service-role APIs. |
| RLS disabled in public | `doc_ingestion_queuecreator_logs` | Design/enable RLS policies or move access behind service-role APIs. |
| RLS disabled in public | `qa_job_metrics` | Design/enable RLS policies or move access behind service-role APIs. |
| Security definer view | `job_cost_summary` | Recreate as `security_invoker = true` on Postgres 15+, or restrict grants. |
| Security definer view | `job_failure_rate` | Recreate as `security_invoker = true` on Postgres 15+, or restrict grants. |
| Security definer view | `job_observability_dashboard` | Recreate as `security_invoker = true` on Postgres 15+, or restrict grants. |

### Security Warnings / Info

| Finding | Object | Production action |
|---|---|---|
| Function search path mutable | `get_analytics_overview` | Add explicit `SET search_path`. |
| Function search path mutable | `get_analytics_by_document_type` | Add explicit `SET search_path`. |
| Function search path mutable | `get_analytics_failure_rate` | Add explicit `SET search_path`. |
| Function search path mutable | `update_updated_at_column` | Add explicit `SET search_path`. |
| Leaked password protection disabled | Supabase Auth | Enable leaked password protection before production. |

## Performance Advisor Findings

The advisor reported unused indexes. These may be unused only because this environment is young/test-like. Do not remove production-intended indexes until production traffic has been observed.

Unused indexes reported:

- `qops_users_auth_user_id_idx`
- `idx_doc_logs_job_id`
- `qops_project_members_project_idx`
- `qops_environment_settings_active_idx`
- `qops_connection_test_results_env_checked_idx`
- `qops_connection_test_results_integration_idx`
- `qops_user_preferences_user_idx`
- `qops_audit_events_project_idx`
- `qops_audit_events_entity_idx`
- `doc_ingestion_jobs_project_idx`
- `doc_ingestion_jobs_requested_by_idx`
- `qa_jobs_project_idx`
- `qa_jobs_requested_by_idx`
- `qa_job_metrics_project_id_created_at_idx`

## Grants Snapshot

The grants query showed broad table privileges for `anon`, `authenticated`, and `service_role` on many public objects, including operational tables and analytical views. This is especially risky when combined with RLS-disabled operational tables.

Production hardening recommendation:

```sql
-- Example pattern, adapt after validating API usage.
REVOKE ALL ON public.qa_jobs FROM anon, authenticated;
REVOKE ALL ON public.doc_ingestion_jobs FROM anon, authenticated;
REVOKE ALL ON public.doc_ingestion_queuecreator_logs FROM anon, authenticated;
REVOKE ALL ON public.qa_job_metrics FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doc_ingestion_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doc_ingestion_queuecreator_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_job_metrics TO service_role;
```

Important: test all n8n workflows after grant/RLS changes. PostgREST `PATCH` nodes often require both `SELECT` and `UPDATE` policies when RLS is enabled.

