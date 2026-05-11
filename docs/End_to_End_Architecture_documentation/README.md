# End-To-End Architecture Documentation

Generated on 2026-05-08.

This document explains the full Q-Ops Agent architecture from browser interaction through n8n, Supabase, storage, vectorization, LLM generation, and external publishing.

## System Components

| Component | Responsibility |
| --- | --- |
| React UI | Authenticates users, submits jobs, displays status, repositories, analytics, settings. |
| Supabase Auth | Password login, invite links, recovery links, bearer tokens. |
| n8n webhook APIs | Backend facade for UI and queue submission. |
| n8n queue workers | Poll pending jobs and invoke full ingestion/generation engines. |
| Supabase Postgres | Job queues, metrics, users, projects, settings, audit, analytics views. |
| Supabase Storage | Stores uploaded project documents/artifacts. |
| ChromaDB | Stores/query vector embeddings for knowledge retrieval. |
| OpenAI/LLM | Extraction, reasoning, generation, quality gate behavior. |
| Converter service | Converts markdown to DOCX/Confluence formats. |
| Jira | Destination for epics and user stories. |
| Confluence | Destination for QA documents. |

## High-Level Request Flow

```text
Browser UI
  -> Supabase Auth for login/session
  -> n8n webhook APIs with Bearer token
  -> Supabase tables/storage
  -> n8n workers
  -> Chroma/OpenAI/converter/Jira/Confluence
  -> Supabase status/metrics
  -> UI polling/repository/analytics views
```

## Authentication Architecture

1. UI signs in directly with Supabase Auth.
2. Supabase returns access and refresh tokens.
3. UI stores session in browser localStorage.
4. UI calls n8n auth-aware APIs with `Authorization: Bearer`.
5. n8n validates the token and maps Supabase Auth user to `qops_users`.
6. n8n scopes data by role and project membership.

## Ingestion Architecture

Entry point:

```text
POST /webhook/upload-test-artifacts
```

Happy path:

1. UI submits multipart artifact upload.
2. Queue creator workflow validates request and attribution.
3. Files are uploaded/stored.
4. `doc_ingestion_jobs` gets a queued row.
5. `qa_job_metrics` gets `JOB_QUEUED`.
6. Ingestion worker polls pending jobs.
7. Worker marks job processing.
8. Full ingestion/vectorization engine extracts text from artifacts.
9. Chunks are embedded/upserted to ChromaDB.
10. Supabase job row is completed.
11. Metrics capture file count, chunk count, duration, tokens/cost where available.
12. UI polling returns `completed`.

Failure path:

1. Any queue, extraction, vectorization, or storage error should update job status to `failed`.
2. `qa_job_metrics` should receive `JOB_FAILED`.
3. UI status polling shows failure message.
4. Failed artifacts can be reprocessed through `/webhook/artifacts/reprocess`.

## Generation Architecture

Entry point:

```text
POST /webhook/generate-qa-doc
```

Happy path:

1. UI submits project, document type, product owner, environment.
2. Retrieval queue creator writes `qa_jobs` queued row.
3. `qa_job_metrics` gets `JOB_QUEUED`.
4. Retrieval worker polls pending generation jobs.
5. Worker restores job context/runtime config.
6. Full retrieval/generation engine queries ChromaDB.
7. LLM generates target document.
8. Quality gate validates/normalizes output and token/cost usage.
9. Output branches:
   - Jira for epics/user stories.
   - Confluence/DOCX output for documents.
10. Supabase job row is completed.
11. `qa_job_metrics` receives `JOB_COMPLETED` with tokens/cost/duration/word count.
12. UI polling returns `completed`.

Failure path:

1. Generator, quality gate, converter, Jira, or Confluence failure should produce `JOB_FAILED`.
2. Failure message should be preserved in output/error metadata.
3. UI displays failure in status panel and analytics.

## Repository APIs

The UI reads backend state through repository endpoints:

- `/webhook/projects`
- `/webhook/artifacts`
- `/webhook/generated-documents`
- `/webhook/audit-events`

These endpoints should be treated as read models over Supabase tables and storage metadata.

## Analytics Architecture

Primary source:

```text
qa_job_metrics
```

Views/RPCs:

- `job_cost_summary`
- `job_failure_rate`
- `job_observability_dashboard`
- `get_analytics_overview`
- `get_analytics_by_document_type`
- `get_analytics_failure_rate`

UI endpoints:

- `/webhook/analytics-summary`
- `/webhook/infrastructure-load`

## Runtime Configuration Architecture

Supabase tables:

- `qops_environment_settings`
- `qops_integration_settings`
- `qops_project_integration_overrides`
- `qops_connection_test_results`

RPC:

- `qops_resolve_runtime_config`

UI settings write path:

```text
PATCH /webhook/settings
```

Workers should resolve runtime config per environment, project, pipeline, and user attribution before calling integrations.

## Production Boundary Recommendation

Frontend should only talk to:

- Supabase Auth.
- Public n8n/API gateway endpoints.

Frontend should not directly use:

- Supabase service role.
- OpenAI/Jira/Confluence tokens.
- Chroma credentials.
- Internal converter/extractor credentials.

