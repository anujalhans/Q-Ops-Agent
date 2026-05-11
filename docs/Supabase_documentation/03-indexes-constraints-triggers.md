# Indexes, Constraints, Sequences, And Triggers

Generated on: 2026-05-08

## Primary Keys

| Table | Primary key |
|---|---|
| `public.qa_jobs` | `job_id` |
| `public.doc_ingestion_jobs` | `id` |
| `public.doc_ingestion_queuecreator_logs` | `id` |
| `public.qa_job_metrics` | `id` |
| `public.qops_projects` | `id` |
| `public.qops_users` | `id` |
| `public.qops_project_members` | `id` |
| `public.qops_environment_settings` | `id` |
| `public.qops_integration_settings` | `id` |
| `public.qops_project_integration_overrides` | `id` |
| `public.qops_connection_test_results` | `id` |
| `public.qops_user_preferences` | `id` |
| `public.qops_audit_events` | `id` |
| `storage.buckets` | `id` |
| `storage.objects` | `id` |
| `storage.migrations` | `id` |

## Unique Constraints And Unique Indexes

| Object | Definition |
|---|---|
| `doc_ingestion_queuecreator_logs.unique_job_id` | `UNIQUE (job_id)` |
| `qops_environment_settings_key_unique` | `UNIQUE (environment_key)` |
| `qops_integration_settings_unique` | `UNIQUE (environment_key, integration_key)` |
| `qops_project_integration_overrides_unique` | `UNIQUE (project_id, integration_key)` |
| `qops_project_members_unique` | `UNIQUE (project_id, user_id)` |
| `qops_projects_lower_name_uidx` | `UNIQUE (lower(name))` |
| `qops_user_preferences_user_unique` | `UNIQUE (user_id)` |
| `qops_users_email_key` | `UNIQUE (email)` |
| `qops_users_lower_email_uidx` | `UNIQUE (lower(email))` |
| `storage.buckets.bname` | `UNIQUE (name)` |
| `storage.objects.bucketid_objname` | `UNIQUE (bucket_id, name)` |
| `storage.vector_indexes_name_bucket_id_idx` | `UNIQUE (name, bucket_id)` |

## Foreign Keys

| Constraint | Source | Target | Delete behavior |
|---|---|---|---|
| `qa_job_metrics_requested_by_fkey` | `qa_job_metrics.requested_by` | `qops_users.id` | `ON DELETE SET NULL` |
| `qops_integration_settings_environment_key_fkey` | `qops_integration_settings.environment_key` | `qops_environment_settings.environment_key` | `ON DELETE CASCADE` |
| `qops_project_integration_overrides_project_id_fkey` | `qops_project_integration_overrides.project_id` | `qops_projects.id` | `ON DELETE CASCADE` |
| `qops_project_members_project_id_fkey` | `qops_project_members.project_id` | `qops_projects.id` | `ON DELETE CASCADE` |
| `qops_project_members_user_id_fkey` | `qops_project_members.user_id` | `qops_users.id` | `ON DELETE CASCADE` |
| `qops_user_preferences_user_id_fkey` | `qops_user_preferences.user_id` | `qops_users.id` | `ON DELETE CASCADE` |
| `storage.objects_bucketId_fkey` | `storage.objects.bucket_id` | `storage.buckets.id` | default |
| `storage.s3_multipart_uploads_bucket_id_fkey` | `storage.s3_multipart_uploads.bucket_id` | `storage.buckets.id` | default |
| `storage.s3_multipart_uploads_parts_bucket_id_fkey` | `storage.s3_multipart_uploads_parts.bucket_id` | `storage.buckets.id` | default |
| `storage.s3_multipart_uploads_parts_upload_id_fkey` | `storage.s3_multipart_uploads_parts.upload_id` | `storage.s3_multipart_uploads.id` | `ON DELETE CASCADE` |
| `storage.vector_indexes_bucket_id_fkey` | `storage.vector_indexes.bucket_id` | `storage.buckets_vectors.id` | default |

## Check Constraints

| Table | Constraint | Allowed values |
|---|---|---|
| `qops_projects` | `qops_projects_status_check` | `draft`, `ingesting`, `ready`, `generating`, `blocked` |
| `qops_users` | `qops_users_role_check` | `admin`, `registered_user` |
| `qops_users` | `qops_users_status_check` | `active`, `pending_invite`, `disabled` |
| `qops_project_members` | `qops_project_members_role_check` | `owner`, `editor`, `viewer` |
| `qops_environment_settings` | `qops_environment_key_check` | `local`, `dev`, `test`, `prod` |
| `qops_integration_settings` | `qops_integration_key_check` | `jira`, `confluence`, `supabase`, `chroma`, `n8n`, `microservices`, `openai` |
| `qops_integration_settings` | `qops_integration_status_check` | `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error`, `backend_managed` |
| `qops_project_integration_overrides` | `qops_project_integration_key_check` | `jira`, `confluence`, `supabase`, `chroma`, `n8n`, `microservices`, `openai` |
| `qops_connection_test_results` | `qops_connection_test_status_check` | `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error` |
| `qops_user_preferences` | `qops_user_preferences_theme_check` | `light`, `dark`, `system` |
| `qops_audit_events` | `qops_audit_events_status_check` | `info`, `success`, `warning`, `error` |

## Non-Unique Application Indexes

| Table | Index | Columns / definition |
|---|---|---|
| `qa_jobs` | `idx_status` | `(status)` |
| `qa_jobs` | `idx_created_at` | `(created_at)` |
| `qa_jobs` | `qa_jobs_project_idx` | `(project_id)` |
| `qa_jobs` | `qa_jobs_requested_by_idx` | `(requested_by)` |
| `doc_ingestion_jobs` | `doc_ingestion_jobs_project_idx` | `(project_id)` |
| `doc_ingestion_jobs` | `doc_ingestion_jobs_requested_by_idx` | `(requested_by)` |
| `doc_ingestion_queuecreator_logs` | `idx_doc_logs_job_id` | `(job_id)` |
| `qa_job_metrics` | `idx_qa_job_metrics_job_id` | `(job_id)` |
| `qa_job_metrics` | `idx_qa_job_metrics_event` | `(event)` |
| `qa_job_metrics` | `idx_qa_job_metrics_pipeline` | `(pipeline)` |
| `qa_job_metrics` | `idx_qa_job_metrics_created_at` | `(created_at)` |
| `qa_job_metrics` | `qa_job_metrics_project_id_created_at_idx` | `(project_id, created_at DESC)` |
| `qa_job_metrics` | `qa_job_metrics_requested_by_created_at_idx` | `(requested_by, created_at DESC)` |
| `qops_users` | `qops_users_auth_user_id_idx` | `(auth_user_id)` |
| `qops_project_members` | `qops_project_members_project_idx` | `(project_id)` |
| `qops_project_members` | `qops_project_members_user_idx` | `(user_id)` |
| `qops_environment_settings` | `qops_environment_settings_active_idx` | `(is_active)` |
| `qops_integration_settings` | `qops_integration_settings_env_idx` | `(environment_key)` |
| `qops_connection_test_results` | `qops_connection_test_results_env_checked_idx` | `(environment_key, checked_at DESC)` |
| `qops_connection_test_results` | `qops_connection_test_results_integration_idx` | `(integration_key, checked_at DESC)` |
| `qops_audit_events` | `qops_audit_events_created_idx` | `(created_at DESC)` |
| `qops_audit_events` | `qops_audit_events_entity_idx` | `(entity_type, entity_id)` |
| `qops_audit_events` | `qops_audit_events_project_idx` | `(project_id, created_at DESC)` |
| `qops_user_preferences` | `qops_user_preferences_user_idx` | `(user_id)` |

## Sequences

| Sequence | Type | Start | Min | Max | Increment | Used by |
|---|---|---:|---:|---:|---:|---|
| `public.doc_ingestion_jobs_id_seq` | `bigint` | 1 | 1 | 9223372036854775807 | 1 | `doc_ingestion_jobs.id` |
| `public.qa_job_metrics_id_seq` | `bigint` | 1 | 1 | 9223372036854775807 | 1 | `qa_job_metrics.id` |

## Triggers

| Table | Trigger | Timing | Event | Function |
|---|---|---|---|---|
| `doc_ingestion_queuecreator_logs` | `set_updated_at` | `BEFORE ROW` | `UPDATE` | `public.update_updated_at_column()` |
| `qops_environment_settings` | `qops_environment_settings_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_integration_settings` | `qops_integration_settings_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_project_integration_overrides` | `qops_project_integration_overrides_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_project_members` | `qops_project_members_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_projects` | `qops_projects_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_user_preferences` | `qops_user_preferences_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |
| `qops_users` | `qops_users_set_updated_at` | `BEFORE ROW` | `UPDATE` | `private.qops_set_updated_at()` |

Storage-managed triggers:

- `storage.buckets.enforce_bucket_name_length_trigger` on insert/update.
- `storage.buckets.protect_buckets_delete` before delete.
- `storage.objects.protect_objects_delete` before delete.
- `storage.objects.update_objects_updated_at` before update.

