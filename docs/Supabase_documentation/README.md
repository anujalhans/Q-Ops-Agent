# Supabase Documentation

Generated on: 2026-05-08  
Source: Supabase MCP metadata inspection against `https://ifnznfspkjayhnooncrv.supabase.co`

This folder documents the current Supabase database and storage shape for future production environment creation. It intentionally documents schema, contracts, indexes, views, functions, security posture, storage configuration, and migration inventory, but does not include secret values or application data rows.

## Contents

- [01-schema-overview.md](01-schema-overview.md): schemas, tables, row counts, relationships, and table purposes.
- [02-table-contracts.md](02-table-contracts.md): column-level contracts for application tables.
- [03-indexes-constraints-triggers.md](03-indexes-constraints-triggers.md): primary keys, unique keys, foreign keys, checks, indexes, sequences, and triggers.
- [04-views-functions-rpc.md](04-views-functions-rpc.md): analytical views and RPC/function contracts.
- [05-security-rls-grants-advisors.md](05-security-rls-grants-advisors.md): RLS, policies, grants, and security/performance advisor findings.
- [06-storage-migrations-environment.md](06-storage-migrations-environment.md): storage bucket/config, extensions, migrations, Edge Functions, and realtime publication.
- [07-production-rebuild-checklist.md](07-production-rebuild-checklist.md): production rollout checklist and known risk areas.
- [metadata-introspection-queries.sql](metadata-introspection-queries.sql): SQL queries used to regenerate this documentation.

## High-Level Inventory

Application schemas inspected:

- `public`
- `storage`
- `private` for one trigger helper function

Primary application tables:

- `qa_jobs`
- `doc_ingestion_jobs`
- `doc_ingestion_queuecreator_logs`
- `qa_job_metrics`
- `qops_projects`
- `qops_users`
- `qops_project_members`
- `qops_environment_settings`
- `qops_integration_settings`
- `qops_project_integration_overrides`
- `qops_connection_test_results`
- `qops_user_preferences`
- `qops_audit_events`

Application views:

- `job_cost_summary`
- `job_failure_rate`
- `job_observability_dashboard`

Application RPC/functions:

- `get_analytics_overview`
- `get_analytics_by_document_type`
- `get_analytics_failure_rate`
- `qops_resolve_runtime_config`
- `update_updated_at_column`
- `private.qops_set_updated_at`

Storage:

- Bucket: `uploaded-project-docs`
- Public: `true`
- Storage file size limit: `52428800` bytes
- Image transformation: enabled
- S3 protocol: enabled

## Critical Production Notes

- Four public application tables currently have RLS disabled: `qa_jobs`, `doc_ingestion_jobs`, `doc_ingestion_queuecreator_logs`, and `qa_job_metrics`.
- Several RLS-enabled tables have no policies; this is safe only if access is intentionally service-role-only through n8n/backend APIs.
- Three analytical views are flagged as security-definer views by the Supabase advisor: `job_cost_summary`, `job_failure_rate`, and `job_observability_dashboard`.
- The production environment should not rely on client-side direct access to operational job tables. Prefer authenticated API workflows backed by service-role credentials.
- Runtime settings are resolved by `qops_resolve_runtime_config`; production parity requires seeding `qops_environment_settings`, `qops_integration_settings`, and any project overrides.

