# Table Contracts

Generated on: 2026-05-08

This file records column-level contracts for the public application tables. Storage-managed tables are summarized in [06-storage-migrations-environment.md](06-storage-migrations-environment.md).

## `public.qa_jobs`

Generation job lifecycle table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `job_id` | `text` | No | none | Primary key. Expected format currently `GEN-YYMMDD-XXXXXX`. |
| `status` | `text` | Yes | none | Job state: observed `pending`, `processing`, `completed`, `failed`. No DB check constraint currently enforces values. |
| `input` | `jsonb` | Yes | none | Original generation request. Expected keys include `projectName`, `documentType`, `productOwner`, `projectId`, `environment`. |
| `output` | `jsonb` | Yes | none | Completion/failure payload. Confluence and Jira shapes differ. |
| `error` | `text` | Yes | none | Human-readable failure summary. |
| `created_at` | `timestamp without time zone` | Yes | `now()` | Insert timestamp. |
| `updated_at` | `timestamp without time zone` | Yes | `now()` | Last status/output update. No trigger currently listed for this table. |
| `project_id` | `text` | Yes | none | Attribution to `qops_projects.id`; currently not FK constrained. |
| `requested_by` | `uuid` | Yes | none | Attribution to `qops_users.id`; currently not FK constrained. |
| `settings_version` | `integer` | Yes | none | Runtime settings version snapshot. |
| `config_snapshot` | `jsonb` | Yes | none | Runtime configuration captured at queue time. |

Expected `output` shapes:

```json
{
  "settingsVersion": 1,
  "destination": { "type": "confluence", "projectId": "..." },
  "confluencePageId": "...",
  "url": "...",
  "wordCount": 2507,
  "tokenUsage": {
    "source": "estimated",
    "input": 1197,
    "output": 4994,
    "total": 6191,
    "estimatedCostUsd": 0.008469
  }
}
```

```json
{
  "settingsVersion": 1,
  "destination": { "type": "jira", "projectId": "..." },
  "stories": [{ "storyID": "...", "storyKey": "...", "storyLink": "..." }],
  "epics": [{ "epicID": "...", "epicKey": "...", "epicLink": "..." }],
  "wordCount": 2029,
  "tokenUsage": {
    "source": "estimated",
    "input": 1000,
    "output": 4000,
    "total": 5000,
    "estimatedCostUsd": 0.007
  }
}
```

## `public.doc_ingestion_jobs`

Ingestion job lifecycle table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `bigint` | No | `nextval('doc_ingestion_jobs_id_seq')` | Primary key. |
| `job_id` | `text` | Yes | none | External ingestion job id. Expected format currently `ING-YYMMDD-XXXXXX`. |
| `status` | `text` | Yes | none | Job state: observed `pending`, `processing`, `completed`, `failed`. No DB check constraint currently enforces values. |
| `input` | `jsonb` | Yes | none | Upload/request metadata including project/file details. |
| `error` | `text` | Yes | none | Failure summary. |
| `created_at` | `timestamp without time zone` | Yes | `now()` | Insert timestamp. |
| `updated_at` | `timestamp without time zone` | Yes | `now()` | Last update timestamp. No trigger currently listed for this table. |
| `output` | `jsonb` | Yes | none | Completion details such as `totalChunksStored`, file keys, token usage. |
| `project_id` | `text` | Yes | none | Attribution to `qops_projects.id`; currently not FK constrained. |
| `requested_by` | `uuid` | Yes | none | Attribution to `qops_users.id`; currently not FK constrained. |
| `settings_version` | `integer` | Yes | none | Runtime settings version snapshot. |
| `config_snapshot` | `jsonb` | Yes | none | Runtime configuration captured at queue time. |

## `public.doc_ingestion_queuecreator_logs`

Upload queue creator log table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `job_id` | `text` | Yes | none | Unique external ingestion job id. |
| `project_name` | `text` | Yes | none | Project name at upload time. |
| `log_type` | `text` | Yes | none | Event marker such as `INGESTION_COMPLETED`. No DB check constraint currently enforces values. |
| `total_files` | `integer` | Yes | none | Number of uploaded files. |
| `file_keys` | `jsonb` | Yes | none | Storage object keys array/map. |
| `created_at` | `timestamp without time zone` | Yes | `now()` | Insert timestamp. |
| `updated_at` | `timestamp without time zone` | Yes | `now()` | Maintained by trigger `set_updated_at`. |

## `public.qa_job_metrics`

Cross-pipeline metrics and observability table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `bigint` | No | `nextval('qa_job_metrics_id_seq')` | Primary key. |
| `job_id` | `text` | No | none | Job id from generation or ingestion. |
| `project_name` | `text` | Yes | none | Project display name. |
| `document_type` | `text` | Yes | none | Generation document type, or ingestion artifact category when applicable. |
| `pipeline` | `text` | Yes | none | Expected `generation` or `ingestion`. No DB check constraint currently enforces values. |
| `event` | `text` | Yes | none | Expected event values include `JOB_QUEUED`, `JOB_STARTED`, `QUALITY_GATE_PASSED`, `QUALITY_GATE_FAILED`, `JOB_COMPLETED`, `JOB_FAILED`. |
| `status` | `text` | Yes | none | Expected `info` or `error`. No DB check constraint currently enforces values. |
| `duration_ms` | `bigint` | Yes | none | Duration in milliseconds, usually set on terminal events. |
| `word_count` | `integer` | Yes | none | Generated document word count. |
| `chunk_count` | `integer` | Yes | none | Ingestion chunk count. |
| `total_files` | `integer` | Yes | none | Ingestion uploaded file count. |
| `error_message` | `text` | Yes | none | Terminal error summary. |
| `metadata` | `jsonb` | Yes | none | Rich event metadata: settings, environment, token usage, file keys, URLs. |
| `created_at` | `timestamptz` | Yes | `now()` | Metric timestamp. |
| `tokens_input` | `integer` | Yes | none | Input tokens. |
| `tokens_output` | `integer` | Yes | none | Output tokens. |
| `tokens_total` | `integer` | Yes | none | Total tokens. |
| `estimated_cost_usd` | `numeric` | Yes | none | Estimated USD cost. |
| `requested_by` | `uuid` | Yes | none | FK to `qops_users.id`, `ON DELETE SET NULL`. |
| `project_id` | `text` | Yes | none | Project attribution. Currently not FK constrained. |

## `public.qops_projects`

Project / knowledge-base registry.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `text` | No | `(gen_random_uuid())::text` | Primary key. |
| `name` | `text` | No | none | Unique case-insensitive name via `lower(name)` unique index. |
| `description` | `text` | Yes | none | Project description. |
| `owner` | `text` | Yes | none | Owner display text. |
| `module` | `text` | Yes | none | Project module. |
| `release` | `text` | Yes | none | Release identifier. |
| `tags` | `jsonb` | No | `[]` | Array-style tags. |
| `status` | `text` | No | `draft` | Check: `draft`, `ingesting`, `ready`, `generating`, `blocked`. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger `qops_projects_set_updated_at`. |

## `public.qops_users`

Q-Ops app user profile table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `auth_user_id` | `uuid` | Yes | none | Supabase Auth user id. Indexed. |
| `email` | `text` | No | none | Unique and case-insensitive unique via `lower(email)`. |
| `name` | `text` | No | none | Display name. |
| `title` | `text` | Yes | none | Optional job title. |
| `avatar_url` | `text` | Yes | none | Optional avatar URL. |
| `role` | `text` | No | `registered_user` | Check: `admin`, `registered_user`. |
| `status` | `text` | No | `pending_invite` | Check: `active`, `pending_invite`, `disabled`. |
| `last_login_at` | `timestamptz` | Yes | none | Last login timestamp. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger `qops_users_set_updated_at`. |

## `public.qops_project_members`

Project assignment table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `project_id` | `text` | No | none | FK to `qops_projects.id`, cascade delete. |
| `user_id` | `uuid` | No | none | FK to `qops_users.id`, cascade delete. |
| `project_role` | `text` | No | `viewer` | Check: `owner`, `editor`, `viewer`. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger. |

Unique contract: `(project_id, user_id)`.

## `public.qops_environment_settings`

Environment-level routing/config.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `environment_key` | `text` | No | none | Unique. Check: `local`, `dev`, `test`, `prod`. |
| `display_name` | `text` | No | none | UI label. |
| `api_base_url` | `text` | Yes | none | Frontend/API base URL. |
| `n8n_base_url` | `text` | Yes | none | n8n base URL. |
| `webhook_paths` | `jsonb` | No | `{}` | Named webhook path registry. |
| `is_active` | `boolean` | No | `false` | Active environment marker. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger. |
| `updated_by` | `uuid` | Yes | none | Actor id for settings writes. |

## `public.qops_integration_settings`

Environment integration settings.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `environment_key` | `text` | No | none | FK to `qops_environment_settings.environment_key`, cascade delete. |
| `integration_key` | `text` | No | none | Check: `jira`, `confluence`, `supabase`, `chroma`, `n8n`, `microservices`, `openai`. |
| `display_name` | `text` | No | none | UI display label. |
| `enabled` | `boolean` | No | `true` | Enables integration in runtime resolution. |
| `config` | `jsonb` | No | `{}` | Non-secret configuration. |
| `secret_refs` | `jsonb` | No | `{}` | Secret reference names only; no raw secrets. |
| `status` | `text` | No | `not_configured` | Check: `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error`, `backend_managed`. |
| `last_tested_at` | `timestamptz` | Yes | none | Last probe timestamp. |
| `last_tested_by` | `uuid` | Yes | none | Actor id. |
| `settings_version` | `integer` | No | `1` | Incremented on changes. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger. |
| `updated_by` | `uuid` | Yes | none | Actor id for settings writes. |

Unique contract: `(environment_key, integration_key)`.

## `public.qops_project_integration_overrides`

Per-project integration overrides.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `project_id` | `text` | No | none | FK to `qops_projects.id`, cascade delete. |
| `integration_key` | `text` | No | none | Same allowed values as `qops_integration_settings.integration_key`. |
| `override_config` | `jsonb` | No | `{}` | Non-secret project override config. |
| `enabled` | `boolean` | No | `true` | Enables override. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger. |
| `updated_by` | `uuid` | Yes | none | Actor id. |

Unique contract: `(project_id, integration_key)`.

## `public.qops_connection_test_results`

Connection/integration test result history.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `environment_key` | `text` | No | none | Environment tested. |
| `integration_key` | `text` | No | none | Integration key. |
| `service_name` | `text` | No | none | Human-friendly service name. |
| `status` | `text` | No | none | Check: `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error`. |
| `latency_ms` | `integer` | Yes | none | Probe latency. |
| `message` | `text` | Yes | none | User-facing result summary. |
| `technical_detail` | `jsonb` | Yes | none | Structured diagnostic detail. |
| `checked_by` | `uuid` | Yes | none | Actor id. |
| `checked_at` | `timestamptz` | No | `now()` | Probe timestamp. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |

## `public.qops_user_preferences`

Per-user UI preference table.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | No | none | FK to `qops_users.id`, cascade delete. Unique. |
| `theme` | `text` | No | `system` | Check: `light`, `dark`, `system`. |
| `default_dashboard_view` | `text` | Yes | none | Optional UI setting. |
| `in_app_notifications` | `boolean` | No | `true` | Notification preference. |
| `email_notifications` | `boolean` | No | `false` | Notification preference. |
| `job_completion_alerts` | `boolean` | No | `true` | Notification preference. |
| `job_failure_alerts` | `boolean` | No | `true` | Notification preference. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |
| `updated_at` | `timestamptz` | No | `now()` | Maintained by trigger. |

## `public.qops_audit_events`

Audit trail.

| Column | Type | Nullable | Default | Contract |
|---|---|---|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key. |
| `actor_user_id` | `uuid` | Yes | none | Actor Q-Ops user id. |
| `actor_name` | `text` | Yes | none | Actor display name. |
| `action` | `text` | No | none | Audit action, e.g. settings/user/project events. |
| `entity_type` | `text` | No | none | Entity category. |
| `entity_id` | `text` | Yes | none | Entity id. |
| `project_id` | `text` | Yes | none | Project context. |
| `status` | `text` | No | `info` | Check: `info`, `success`, `warning`, `error`. |
| `details` | `text` | Yes | none | Human-readable description. |
| `metadata` | `jsonb` | No | `{}` | Structured event metadata. |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp. |

