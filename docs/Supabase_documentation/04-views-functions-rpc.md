# Views, Functions, And RPC Contracts

Generated on: 2026-05-08

## Views

### `public.job_cost_summary`

Purpose: aggregate cost/token metrics by pipeline and document type.

Important behavior:

- Uses `qa_job_metrics`.
- Filters to `event = 'QUALITY_GATE_PASSED'`.
- Groups by `pipeline`, `document_type`.
- Computes total jobs, token totals, cost totals, average cost, average word count, first/last job timestamps.

Definition:

```sql
SELECT
  pipeline,
  document_type,
  count(*) AS total_jobs,
  sum(tokens_input) AS total_input_tokens,
  sum(tokens_output) AS total_output_tokens,
  sum(tokens_total) AS total_tokens,
  round(sum(estimated_cost_usd), 4) AS total_cost_usd,
  round(avg(estimated_cost_usd), 4) AS avg_cost_per_job_usd,
  round(avg(word_count), 0) AS avg_word_count,
  min(created_at) AS first_job_at,
  max(created_at) AS last_job_at
FROM qa_job_metrics
WHERE event = 'QUALITY_GATE_PASSED'
GROUP BY pipeline, document_type
ORDER BY round(sum(estimated_cost_usd), 4) DESC;
```

### `public.job_failure_rate`

Purpose: aggregate terminal success/failure rates by pipeline and document type.

Definition:

```sql
SELECT
  pipeline,
  document_type,
  count(*) FILTER (WHERE event = 'JOB_COMPLETED') AS completed,
  count(*) FILTER (WHERE event = 'JOB_FAILED') AS failed,
  count(*) FILTER (WHERE event = 'JOB_QUEUED') AS queued,
  round(
    (
      count(*) FILTER (WHERE event = 'JOB_FAILED')
    )::numeric
    / NULLIF(count(*) FILTER (WHERE event = ANY (ARRAY['JOB_COMPLETED', 'JOB_FAILED'])), 0)
    * 100,
    2
  ) AS failure_rate_pct
FROM qa_job_metrics
GROUP BY pipeline, document_type;
```

### `public.job_observability_dashboard`

Purpose: hourly metric rollups for observability dashboards.

Definition:

```sql
SELECT
  date_trunc('hour', created_at) AS hour,
  pipeline,
  document_type,
  event,
  count(*) AS event_count,
  avg(duration_ms) AS avg_duration_ms,
  avg(word_count) AS avg_word_count,
  avg(chunk_count) AS avg_chunk_count,
  sum(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS error_count
FROM qa_job_metrics
GROUP BY date_trunc('hour', created_at), pipeline, document_type, event
ORDER BY date_trunc('hour', created_at) DESC;
```

## Public RPC / Functions

### `public.get_analytics_overview(p_date_from timestamptz default now() - interval '30 days', p_pipeline text default null)`

Returns: `jsonb`

Purpose: dashboard overview metrics.

Returned JSON keys:

- `totalJobsCompleted`
- `totalDocumentsGenerated`
- `totalIngestionJobsCompleted`
- `totalJobsFailed`
- `successRate`
- `totalCostUsd`
- `avgCostPerDocument`
- `totalTokensConsumed`
- `totalChunksIngested`
- `avgDurationMs`

Security:

- `SECURITY DEFINER`: false
- Advisor warning: mutable search path. Production should set a fixed search path.

### `public.get_analytics_by_document_type(p_date_from timestamptz default now() - interval '30 days', p_pipeline text default null)`

Returns: `jsonb`

Purpose: analytics grouped by document type and pipeline.

Returned object keys per group:

- `documentType`
- `pipeline`
- `count`
- `avgWordCount`
- `totalCostUsd`
- `avgCostUsd`
- `totalTokens`
- `avgTokens`
- `avgDurationMs`
- `successCount`
- `failureCount`

Security:

- `SECURITY DEFINER`: false
- Advisor warning: mutable search path. Production should set a fixed search path.

### `public.get_analytics_failure_rate(p_date_from timestamptz default now() - interval '30 days')`

Returns: `jsonb`

Purpose: failure rate percentage by pipeline.

Security:

- `SECURITY DEFINER`: false
- Advisor warning: mutable search path. Production should set a fixed search path.

### `public.qops_resolve_runtime_config(p_environment_key text default 'local', p_project_id text default null, p_pipeline text default null, p_requested_by uuid default null)`

Returns: `jsonb`

Purpose: central runtime settings resolver for n8n queue creators/workers.

Security:

- `SECURITY DEFINER`: true
- Search path is explicitly set to `public, pg_temp`.
- Previous migration says this RPC was restricted to service role.

Resolution flow:

1. Select requested environment from `qops_environment_settings`.
2. Fall back to active environment if requested key is absent.
3. Load enabled integration configs for the environment from `qops_integration_settings`.
4. Load enabled project overrides from `qops_project_integration_overrides`.
5. Merge environment integration config with project override config.
6. Return:
   - `settingsVersion`
   - `configSnapshot.environment`
   - `configSnapshot.supabase`
   - `configSnapshot.chroma`
   - `configSnapshot.microservices`
   - `configSnapshot.publishing`
   - `configSnapshot.models`
   - `configSnapshot.request`

Expected returned shape:

```json
{
  "settingsVersion": 1,
  "configSnapshot": {
    "environment": {
      "key": "local",
      "displayName": "...",
      "apiBaseUrl": "...",
      "n8nBaseUrl": "...",
      "webhookPaths": {}
    },
    "supabase": {},
    "chroma": {},
    "microservices": {
      "documentProcessorUrl": "...",
      "documentProcessorHealthUrl": "...",
      "converterUrl": "...",
      "converterHealthUrl": "...",
      "timeoutMs": 30000
    },
    "publishing": {
      "jiraBaseUrl": "...",
      "jiraProjectKey": "...",
      "jiraProjectId": "...",
      "jiraEpicIssueTypeId": "...",
      "jiraStoryIssueTypeId": "...",
      "jiraIdempotencyLabelPrefix": "...",
      "confluenceBaseUrl": "...",
      "confluenceSpaceKey": "...",
      "confluenceParentPageId": "...",
      "confluencePageTitlePattern": "..."
    },
    "models": {},
    "request": {
      "projectId": "...",
      "pipeline": "generation",
      "requestedBy": "..."
    }
  }
}
```

### `public.update_updated_at_column()`

Returns: trigger

Purpose: updates `NEW.updated_at = NOW()`.

Used by:

- `doc_ingestion_queuecreator_logs.set_updated_at`

Security note:

- Advisor warning: mutable search path. Production should set a fixed search path.

### `private.qops_set_updated_at()`

Returns: trigger

Purpose: updates `new.updated_at = now()`.

Security:

- Function lives in `private`.
- Search path is explicitly set to empty string.

Used by:

- `qops_environment_settings`
- `qops_integration_settings`
- `qops_project_integration_overrides`
- `qops_project_members`
- `qops_projects`
- `qops_user_preferences`
- `qops_users`

## Supabase-Managed Storage Functions

The `storage` schema contains Supabase-managed helper functions, including:

- `storage.allow_any_operation`
- `storage.allow_only_operation`
- `storage.can_insert_object`
- `storage.enforce_bucket_name_length`
- `storage.extension`
- `storage.filename`
- `storage.foldername`
- `storage.get_common_prefix`
- `storage.get_size_by_bucket`
- `storage.list_multipart_uploads_with_delimiter`
- `storage.list_objects_with_delimiter`
- `storage.operation`
- `storage.protect_delete`
- `storage.search`
- `storage.search_by_timestamp`
- `storage.search_v2`
- `storage.update_updated_at_column`

These should not be reimplemented manually in production. They come from Supabase Storage.

