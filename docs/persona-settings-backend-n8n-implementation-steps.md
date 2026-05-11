# Persona Settings Backend, Supabase, API, And n8n Implementation Steps

Date: 2026-05-05

Related docs:

- `docs/persona-settings-integration-plan.md`
- `docs/ui-agent-persona-settings-design-brief.md`
- `docs/n8n-workflow-functionality-map.md`
- `docs/backend-integration-implementation-steps.md`

## Objective

Implement the backend, Supabase, API, integration, and n8n changes required to support:

- Admin and Registered User personas.
- Admin-managed integration settings.
- Registered User limited settings.
- Dynamic integration parameters instead of hardcoded n8n values.
- Per-service connection status and test results.
- Runtime configuration passing into ingestion and document generation workflows.

This document is an implementation runbook. It does not require frontend code changes by itself, but the implemented contracts should match the persona Settings UI already designed in the dashboard.

## Guiding Principles

- The frontend must not store or send raw integration secrets after setup.
- n8n workflows should not contain environment-specific hardcoded values for Jira, Confluence, Supabase, Chroma, or local microservices.
- Admin can edit global configuration. Registered User can only manage personal preferences and view read-only allowed status.
- Every settings change and connection test should create an audit event.
- Every async job should store a safe `configSnapshot` or `settingsVersion` so outputs are traceable.

## Phase 1: Decide Runtime Architecture

### Step 1. Choose backend ownership model

Recommended production model:

- Use a real backend service for auth, RBAC, settings, secrets, and API contracts.
- Keep n8n focused on orchestration and long-running workflow execution.

Acceptable interim model:

- Use Supabase for tables.
- Use n8n webhooks as temporary API endpoints.
- Store only non-secret settings in Supabase.
- Keep secrets in n8n credentials or a secure secret manager.

### Step 2. Decide registration policy

Recommended:

- Admin invite-only registration.
- First Admin is bootstrapped manually.
- Registered Users can access only assigned projects.

### Step 3. Define environments

Create environment records for:

- local
- dev
- test
- prod, if applicable

Each environment should have its own n8n base URL, API base URL, settings version, and integration config.

## Phase 2: Supabase Schema

Create or update these tables. Column types are suggestions and can be adjusted to your existing Supabase conventions.

### Step 4. Create user profile table

Table: `qops_users`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `auth_user_id` | uuid/text | Link to auth provider user |
| `email` | text | Unique |
| `name` | text | Display name |
| `title` | text | Optional job title |
| `avatar_url` | text | Optional |
| `role` | text | `admin` or `registered_user` |
| `status` | text | `active`, `pending_invite`, `disabled` |
| `last_login_at` | timestamptz | Optional |
| `created_at` | timestamptz | Default now |
| `updated_at` | timestamptz | Default now |

Constraints:

- `role IN ('admin', 'registered_user')`
- `status IN ('active', 'pending_invite', 'disabled')`
- Unique index on `lower(email)`.

### Step 5. Create project assignment table

Table: `qops_project_members`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid/text | References `qops_projects.id` |
| `user_id` | uuid | References `qops_users.id` |
| `project_role` | text | `owner`, `editor`, `viewer` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Recommended permissions:

- Admin can access all projects.
- Registered User can access only assigned projects.
- `owner` and `editor` can upload/generate.
- `viewer` can view outputs only.

### Step 6. Create environment settings table

Table: `qops_environment_settings`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `environment_key` | text | `local`, `dev`, `test`, `prod` |
| `display_name` | text | |
| `api_base_url` | text | Optional backend API base URL |
| `n8n_base_url` | text | Base URL such as `http://localhost:5678` |
| `webhook_paths` | jsonb | Upload, generate, status, analytics, health paths |
| `is_active` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `updated_by` | uuid/text | Admin user |

Recommended `webhook_paths` shape:

```json
{
  "uploadArtifacts": "/webhook/upload-test-artifacts",
  "ingestionStatus": "/webhook/job-status",
  "generateDocument": "/webhook/generate-qa-doc",
  "generationStatus": "/webhook/job-status-retrieve",
  "health": "/webhook/health",
  "analyticsSummary": "/webhook/analytics-summary",
  "projects": "/webhook/projects",
  "artifacts": "/webhook/artifacts",
  "generatedDocuments": "/webhook/generated-documents",
  "auditEvents": "/webhook/audit-events"
}
```

### Step 7. Create integration settings table

Table: `qops_integration_settings`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `environment_key` | text | |
| `integration_key` | text | `jira`, `confluence`, `supabase`, `chroma`, `n8n`, `microservices`, `openai` |
| `display_name` | text | |
| `enabled` | boolean | |
| `config` | jsonb | Non-secret configuration only |
| `secret_refs` | jsonb | Secret names/references only |
| `status` | text | Last known status |
| `last_tested_at` | timestamptz | |
| `last_tested_by` | uuid/text | |
| `settings_version` | integer | Increment on edit |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `updated_by` | uuid/text | |

Do not store raw passwords, API tokens, service-role keys, or OpenAI keys in `config`.

### Step 8. Seed integration config records

Seed one row per integration.

Jira `config`:

```json
{
  "baseUrl": "https://your-domain.atlassian.net",
  "projectKey": "KAN",
  "projectId": "10001",
  "epicIssueTypeId": "10002",
  "storyIssueTypeId": "10006",
  "idempotencyLabelPrefix": "qops"
}
```

Confluence `config`:

```json
{
  "baseUrl": "https://your-domain.atlassian.net/wiki",
  "spaceKey": "TD",
  "parentPageId": null,
  "pageTitlePattern": "{documentTitle} - {projectName}"
}
```

Supabase `config`:

```json
{
  "projectUrl": "https://ifnznfspkjayhnooncrv.supabase.co",
  "storageBucket": "uploaded-project-docs",
  "tables": {
    "ingestionJobs": "doc_ingestion_jobs",
    "generationJobs": "qa_jobs",
    "metrics": "qa_job_metrics"
  }
}
```

Chroma `config`:

```json
{
  "baseUrl": "https://api.trychroma.com",
  "tenant": "My_Tenant",
  "database": "QA-Documents-Chunk",
  "collection": "qa-chunks-batches",
  "topK": 20
}
```

Microservices `config`:

```json
{
  "documentProcessorBaseUrl": "http://127.0.0.1:8000",
  "documentProcessorPath": "/process-document",
  "documentProcessorHealthPath": "/health",
  "converterBaseUrl": "http://127.0.0.1:5050",
  "converterPath": "/convert",
  "converterHealthPath": "/health",
  "timeoutMs": 30000
}
```

OpenAI `config`:

```json
{
  "generationModel": "gpt-4.1-mini",
  "visionModel": "gpt-4o-mini",
  "embeddingModel": "text-embedding-3-small",
  "maxTokens": 8000
}
```

### Step 9. Create project override table

Table: `qops_project_integration_overrides`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `project_id` | uuid/text | References project |
| `integration_key` | text | Jira, Confluence, Chroma, etc. |
| `override_config` | jsonb | Non-secret overrides only |
| `enabled` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `updated_by` | uuid/text | |

Example:

```json
{
  "integration_key": "confluence",
  "override_config": {
    "spaceKey": "PAY",
    "parentPageId": "123456"
  }
}
```

### Step 10. Create connection test history table

Table: `qops_connection_test_results`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `environment_key` | text | |
| `integration_key` | text | |
| `service_name` | text | Example `Supabase DB`, `ChromaDB` |
| `status` | text | `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error` |
| `latency_ms` | integer | Nullable |
| `message` | text | User-safe |
| `technical_detail` | text/jsonb | Admin-only |
| `checked_by` | uuid/text | |
| `checked_at` | timestamptz | |
| `created_at` | timestamptz | |

### Step 11. Create preferences table

Table: `qops_user_preferences`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `qops_users.id` |
| `theme` | text | `light`, `dark`, `system` |
| `default_dashboard_view` | text | Optional |
| `in_app_notifications` | boolean | |
| `email_notifications` | boolean | |
| `job_completion_alerts` | boolean | |
| `job_failure_alerts` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Step 12. Extend existing job tables

Update `doc_ingestion_jobs`:

- Add `project_id` text/uuid nullable.
- Add `requested_by` text/uuid nullable.
- Add `settings_version` integer nullable.
- Add `config_snapshot` jsonb nullable.

Update `qa_jobs`:

- Add `project_id` text/uuid nullable.
- Add `requested_by` text/uuid nullable.
- Add `settings_version` integer nullable.
- Add `config_snapshot` jsonb nullable.

Keep existing `input` and `output` fields to avoid breaking current workflows.

### Step 13. Extend audit source

If using `qa_job_metrics` for audit, add settings events there or create `qops_audit_events`.

Recommended table: `qops_audit_events`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `actor_user_id` | uuid/text | |
| `actor_name` | text | |
| `action` | text | `SETTINGS_UPDATED`, `CONNECTION_TESTED`, `USER_INVITED` |
| `entity_type` | text | `integration`, `user`, `project`, `job` |
| `entity_id` | text | |
| `project_id` | text/uuid | Nullable |
| `status` | text | `info`, `success`, `warning`, `error` |
| `details` | text | User-safe |
| `metadata` | jsonb | |
| `created_at` | timestamptz | |

## Phase 3: Auth And RBAC Contracts

### Step 14. Implement auth source

Recommended options:

- Supabase Auth.
- A dedicated backend auth service.

Minimum required claims:

```json
{
  "userId": "uuid",
  "email": "admin@qops.local",
  "role": "admin",
  "projectIds": ["project-id"]
}
```

### Step 15. Implement permission checks

Admin permissions:

- Can read/write all settings.
- Can test all integrations.
- Can manage users.
- Can access all projects.

Registered User permissions:

- Can read own profile and preferences.
- Can update own preferences.
- Can read assigned projects.
- Can upload/generate only for assigned projects where project role allows it.
- Can view read-only integration status.

### Step 16. Add row-level security policies if using Supabase directly

Recommended:

- `qops_users`: user can read self; Admin can read/write all.
- `qops_user_preferences`: user can read/write self; Admin can read all.
- `qops_project_members`: user can read own assignments; Admin can manage all.
- `qops_integration_settings`: Admin write; Registered User no direct read unless sanitized view.
- `qops_connection_test_results`: Admin detailed read; Registered User read sanitized status.

## Phase 4: API Contracts

Use `/api` if a backend service exists. If n8n is the temporary API host, mirror these under `/webhook`.

### Step 17. Current user endpoint

Endpoint:

```text
GET /api/me
```

Response:

```json
{
  "id": "user-id",
  "name": "Admin User",
  "email": "admin@qops.local",
  "role": "admin",
  "permissions": [
    "settings:write",
    "integrations:test",
    "users:manage",
    "projects:all"
  ],
  "projectIds": []
}
```

### Step 18. User management endpoints

```text
GET /api/users
POST /api/users/invite
PATCH /api/users/{userId}
```

`POST /api/users/invite` request:

```json
{
  "email": "user@company.com",
  "name": "User Name",
  "role": "registered_user",
  "projectIds": ["project-id"]
}
```

### Step 19. Settings endpoints

Admin full settings:

```text
GET /api/settings?environment=local
PATCH /api/settings?environment=local
```

Registered User settings:

```text
GET /api/settings/me
PATCH /api/settings/me
```

### Step 20. Integration endpoints

```text
GET /api/integrations?environment=local
GET /api/integrations/status?environment=local
PATCH /api/integrations/{integrationKey}
POST /api/integrations/{integrationKey}/secrets
POST /api/integrations/{integrationKey}/test
POST /api/integrations/test-all
GET /api/integrations/test-results?environment=local
```

`GET /api/integrations/status` should return a sanitized response for all authenticated users:

```json
{
  "status": "degraded",
  "generatedAt": "2026-05-05T10:00:00.000Z",
  "services": [
    {
      "name": "Supabase DB",
      "integrationKey": "supabase",
      "status": "operational",
      "detail": "Reachable",
      "lastTestedAt": "2026-05-05T10:00:00.000Z"
    }
  ]
}
```

Admin detail can include technical detail and URLs. Registered User response should hide sensitive details.

### Step 21. Update existing repository endpoints

Ensure these endpoints respect role/project scope:

```text
GET /webhook/projects
POST /webhook/projects
GET /webhook/artifacts
GET /webhook/generated-documents
GET /webhook/audit-events
```

Admin sees all records. Registered User sees assigned project records only.

## Phase 5: Configuration Resolver

### Step 22. Create a config resolver service or workflow

Purpose:

- Given environment, project, user, and pipeline type, return effective runtime configuration.

Endpoint:

```text
POST /api/runtime-config/resolve
```

Request:

```json
{
  "environment": "local",
  "projectId": "project-id",
  "projectName": "Payments modernization",
  "pipeline": "ingestion",
  "documentType": null,
  "requestedBy": "user-id"
}
```

Response:

```json
{
  "settingsVersion": 12,
  "configSnapshot": {
    "environment": {
      "n8nBaseUrl": "http://localhost:5678"
    },
    "supabase": {
      "projectUrl": "https://ifnznfspkjayhnooncrv.supabase.co",
      "storageBucket": "uploaded-project-docs",
      "tables": {
        "ingestionJobs": "doc_ingestion_jobs",
        "generationJobs": "qa_jobs",
        "metrics": "qa_job_metrics"
      }
    },
    "chroma": {
      "baseUrl": "https://api.trychroma.com",
      "tenant": "My_Tenant",
      "database": "QA-Documents-Chunk",
      "collection": "qa-chunks-batches",
      "topK": 20
    },
    "microservices": {
      "documentProcessorUrl": "http://127.0.0.1:8000/process-document",
      "converterUrl": "http://127.0.0.1:5050/convert"
    },
    "publishing": {
      "jiraProjectKey": "KAN",
      "jiraProjectId": "10001",
      "jiraEpicIssueTypeId": "10002",
      "jiraStoryIssueTypeId": "10006",
      "confluenceBaseUrl": "https://your-domain.atlassian.net/wiki",
      "confluenceSpaceKey": "TD",
      "confluencePageTitlePattern": "{documentTitle} - {projectName}"
    },
    "models": {
      "generationModel": "gpt-4.1-mini",
      "visionModel": "gpt-4o-mini",
      "embeddingModel": "text-embedding-3-small",
      "maxTokens": 8000
    }
  }
}
```

Do not include raw secrets in `configSnapshot`.

### Step 23. Apply project overrides in resolver

Merge order:

1. Global environment settings.
2. Global integration settings.
3. Project integration overrides.
4. Request-scoped safe values.

Store final safe config in `configSnapshot`.

## Phase 6: n8n Health Workflow Changes

Existing workflow:

```text
n8n_Workflows/Q-Ops-Agent-Health-Status.json
GET /webhook/health
```

### Step 24. Keep current live checks

Current health checks already cover:

- Supabase DB.
- Supabase Storage.
- ChromaDB.
- FastAPI Extractor.
- Converter Service.
- n8n backend.
- Backend-managed OpenAI/Jira/Confluence labels.

Keep this behavior as the first aggregate status endpoint.

### Step 25. Replace hardcoded health URLs with settings lookup

Before running checks, add a node:

```text
Load Runtime Settings
```

It should read `qops_environment_settings` and `qops_integration_settings` or call `/api/runtime-config/resolve`.

Replace hardcoded:

- Supabase URL.
- Supabase storage bucket.
- Chroma base URL, tenant, database, collection.
- FastAPI base URL.
- Converter base URL.

### Step 26. Add optional Jira health check

Add nodes:

1. Load Jira config.
2. Query Jira project:

```text
GET {jira.baseUrl}/rest/api/3/project/{projectKey}
```

3. Query issue types or project metadata.
4. Map result to `operational`, `unauthorized`, `not_configured`, or `error`.

### Step 27. Add optional Confluence health check

Add nodes:

1. Load Confluence config.
2. Query Confluence space:

```text
GET {confluence.baseUrl}/rest/api/space/{spaceKey}
```

3. If parent page configured, query page by id.
4. Map result to status.

### Step 28. Add optional OpenAI validation

Recommended:

- Do not call costly model operations from a frequent health check.
- Use a backend-only credential validation or lightweight models endpoint if available.
- Otherwise show `backend-managed`.

### Step 29. Persist health check result

After building the health response, insert one row per service into `qops_connection_test_results`.

If the health endpoint is called often, either:

- Persist only Admin-triggered tests.
- Or throttle inserts.

## Phase 7: n8n Ingestion Workflow Changes

Existing workflows:

- `INGEST API Queue Creator - SaaS.json`
- `INGEST Worker Engine (Queue Processor).json`
- `Multimodal Knowledge Ingestion & Vectorization Engine.json`
- `INGEST Workflow-Status-Check.json`

### Step 30. Modify ingestion queue creator request handling

Current request:

```text
POST /webhook/upload-test-artifacts
multipart/form-data: projectName + files
```

Recommended extended fields:

| Field | Required | Notes |
|---|---:|---|
| `projectName` | Yes | Existing |
| `projectId` | Recommended | Needed for RBAC and overrides |
| `requestedBy` | Recommended | User id from backend/session |
| `environment` | Optional | Defaults to active environment |

### Step 31. Resolve runtime config in ingestion queue creator

Add node after job id generation:

```text
Resolve Runtime Config
```

Options:

- Call `/api/runtime-config/resolve`.
- Or query Supabase settings tables directly from n8n.

### Step 32. Store config snapshot in `doc_ingestion_jobs`

Update insert body to include:

```json
{
  "job_id": "ING-...",
  "status": "pending",
  "project_id": "project-id",
  "requested_by": "user-id",
  "settings_version": 12,
  "input": {
    "projectName": "Payments modernization",
    "files": {}
  },
  "config_snapshot": {}
}
```

### Step 33. Replace hardcoded Supabase storage bucket

Current hardcoded bucket:

```text
uploaded-project-docs
```

Replace with:

```text
configSnapshot.supabase.storageBucket
```

### Step 34. Replace hardcoded Supabase public URL construction

Current public URL construction contains a hardcoded Supabase project URL.

Replace with:

```text
configSnapshot.supabase.projectUrl + "/storage/v1/object/public/" + bucket + "/" + path
```

### Step 35. Pass config to ingestion worker

When worker reads `doc_ingestion_jobs`, select:

- `job_id`
- `status`
- `input`
- `project_id`
- `requested_by`
- `settings_version`
- `config_snapshot`

Pass `config_snapshot` to the vectorization engine.

### Step 36. Replace document processor URL

Current hardcoded URL:

```text
http://127.0.0.1:8000/process-document
```

Replace with:

```text
configSnapshot.microservices.documentProcessorUrl
```

### Step 37. Replace Chroma collection

Current hardcoded collection:

```text
qa-chunks-batches
```

Replace with:

```text
configSnapshot.chroma.collection
```

If n8n Chroma nodes cannot accept dynamic collection values cleanly, create separate workflow variables or use HTTP calls to Chroma API.

### Step 38. Store config metadata in chunk metadata

Add safe metadata fields:

- `settingsVersion`
- `chromaCollection`
- `environment`
- `projectId`

Do not store secrets in chunk metadata.

## Phase 8: n8n Generation Workflow Changes

Existing workflows:

- `RETRIEVAL Job Queue Creator - SaaS.json`
- `RETRIEVAL Worker Engine (Queue Processor) - Saas.json`
- `RETRIEVAL Document Generator AI Agent - SaaS.json`
- `RETRIEVE Workflow-status-check.json`

### Step 39. Modify generation queue creator request

Current request:

```json
{
  "projectName": "Project",
  "documentType": "test_strategy",
  "productOwner": "PO"
}
```

Recommended extended request:

```json
{
  "projectId": "project-id",
  "projectName": "Project",
  "documentType": "test_strategy",
  "productOwner": "PO",
  "requestedBy": "user-id",
  "environment": "local"
}
```

### Step 40. Resolve runtime config in generation queue creator

Add node:

```text
Resolve Runtime Config
```

Store `settingsVersion` and `configSnapshot` in `qa_jobs`.

### Step 41. Pass config to generation worker and document generator

When worker reads `qa_jobs`, select:

- `job_id`
- `status`
- `input`
- `project_id`
- `requested_by`
- `settings_version`
- `config_snapshot`

Pass config to the document generator agent workflow.

### Step 42. Replace Chroma retrieval settings

Current hardcoded:

- Collection `qa-chunks-batches`.
- `topK: 20`.

Replace with:

- `configSnapshot.chroma.collection`.
- `configSnapshot.chroma.topK`.

### Step 43. Replace model settings

Current hardcoded:

- `gpt-4.1-mini`.
- max tokens `8000`.

Replace with:

- `configSnapshot.models.generationModel`.
- `configSnapshot.models.maxTokens`.

Keep backend guardrails so only approved models can be selected.

### Step 44. Replace converter URL

Current hardcoded:

```text
http://127.0.0.1:5050/convert
```

Replace with:

```text
configSnapshot.microservices.converterUrl
```

### Step 45. Replace Confluence space and base URL

Current hardcoded:

- Space key `TD`.
- Atlassian wiki URL.

Replace with:

- `configSnapshot.publishing.confluenceBaseUrl`.
- `configSnapshot.publishing.confluenceSpaceKey`.
- `configSnapshot.publishing.confluencePageTitlePattern`.

Page lookup URL should be built from config:

```text
{confluenceBaseUrl}/rest/api/content?spaceKey={spaceKey}&title={encodedTitle}
```

### Step 46. Replace Jira project and issue type ids

Current hardcoded:

- Project key `KAN`.
- Project id `10001`.
- Epic issue type id `10002`.
- Story issue type id `10006`.

Replace with:

- `configSnapshot.publishing.jiraProjectKey`.
- `configSnapshot.publishing.jiraProjectId`.
- `configSnapshot.publishing.jiraEpicIssueTypeId`.
- `configSnapshot.publishing.jiraStoryIssueTypeId`.

Update JQL construction:

```text
project = {jiraProjectKey} AND issuetype = Epic ...
```

### Step 47. Update generation output metadata

When updating `qa_jobs.output`, include safe metadata:

```json
{
  "url": "https://...",
  "confluencePageId": "123",
  "settingsVersion": 12,
  "destination": {
    "type": "confluence",
    "spaceKey": "TD"
  }
}
```

For Jira:

```json
{
  "epics": [],
  "stories": [],
  "settingsVersion": 12,
  "destination": {
    "type": "jira",
    "projectKey": "KAN"
  }
}
```

## Phase 9: Settings And Integration Workflows

If using n8n as the temporary API host, create these new workflows.

### Step 48. New workflow: Settings Get

File name suggestion:

```text
Q-Ops-Agent-Settings-Get.json
```

Endpoint:

```text
GET /webhook/settings
```

Behavior:

1. Validate request identity/role if auth is available.
2. If Admin, return full non-secret settings.
3. If Registered User, return personal settings plus read-only status.
4. Never return raw secrets.

### Step 49. New workflow: Settings Patch

File name suggestion:

```text
Q-Ops-Agent-Settings-Patch.json
```

Endpoint:

```text
PATCH /webhook/settings
```

Behavior:

1. Require Admin.
2. Validate payload.
3. Update `qops_environment_settings` and/or `qops_integration_settings`.
4. Increment `settings_version`.
5. Insert audit event.
6. Return updated non-secret settings.

### Step 50. New workflow: Integration Test

File name suggestion:

```text
Q-Ops-Agent-Integration-Test.json
```

Endpoint:

```text
POST /webhook/integrations/{integrationKey}/test
```

Behavior:

1. Require Admin.
2. Load integration config and credential reference.
3. Run only the selected integration check.
4. Save result to `qops_connection_test_results`.
5. Update `qops_integration_settings.status`.
6. Insert audit event.
7. Return status result.

### Step 51. New workflow: Integration Test All

File name suggestion:

```text
Q-Ops-Agent-Integration-Test-All.json
```

Endpoint:

```text
POST /webhook/integrations/test-all
```

Behavior:

1. Require Admin.
2. Run all enabled checks.
3. Save each result.
4. Return aggregate result matching `/webhook/health` style.

This may reuse the health workflow logic.

### Step 52. New workflow: Users And Roles

Only needed if no backend service exists.

File name suggestions:

```text
Q-Ops-Agent-Users-List.json
Q-Ops-Agent-User-Invite.json
Q-Ops-Agent-User-Update.json
```

Endpoints:

```text
GET /webhook/users
POST /webhook/users/invite
PATCH /webhook/users/{userId}
```

Behavior:

- Require Admin.
- Read/write `qops_users`.
- Read/write `qops_project_members`.
- Insert audit events.

## Phase 10: Frontend Contract Alignment

The current UI is frontend-only for persona switching. Later implementation should wire it to real APIs.

### Step 53. Replace local persona switch with current user role

Use:

```text
GET /api/me
```

Admin sees Admin Settings. Registered User sees limited Settings.

### Step 54. Wire Admin integration cards

Use:

```text
GET /api/integrations
POST /api/integrations/{integrationKey}/test
POST /api/integrations/test-all
PATCH /api/integrations/{integrationKey}
```

### Step 55. Wire Registered User status

Use:

```text
GET /api/integrations/status
```

Sanitize details for Registered User.

### Step 56. Wire users and roles

Use:

```text
GET /api/users
POST /api/users/invite
PATCH /api/users/{userId}
```

### Step 57. Wire user projects

Use:

```text
GET /api/me
GET /api/projects?scope=mine
```

Or reuse `/webhook/projects` with role-aware filtering.

## Phase 11: Migration Order

Recommended implementation order:

1. Create Supabase tables for users, preferences, settings, connection tests, audit events, and project members.
2. Seed Admin user and baseline integration settings.
3. Implement or create `/api/me`.
4. Implement settings read endpoint.
5. Implement integration status endpoint using existing health workflow response.
6. Modify health workflow to read settings dynamically.
7. Implement connection test result persistence.
8. Implement Admin-only integration test endpoints.
9. Extend ingestion queue creator to store `projectId`, `requestedBy`, `settingsVersion`, and `configSnapshot`.
10. Refactor ingestion worker/vectorization workflow to consume config snapshot.
11. Extend generation queue creator to store `projectId`, `requestedBy`, `settingsVersion`, and `configSnapshot`.
12. Refactor generation worker/agent workflow to consume config snapshot.
13. Implement users/invite/project assignment APIs.
14. Add role-aware filtering to repository endpoints.
15. Wire frontend UI to real APIs.
16. Remove or deprecate localStorage-only settings for production.

## Phase 12: Validation Checklist

### Admin validation

- Admin can view all Settings tabs.
- Admin can update non-secret settings.
- Admin can save secret references or rotate credentials through secure endpoint.
- Admin can test all services.
- Admin can test one integration.
- Admin can invite a registered user.
- Admin can assign projects.
- Admin can view audit events for settings changes and connection tests.

### Registered User validation

- Registered User cannot access Admin Settings.
- Registered User can edit only personal profile/preferences.
- Registered User can view assigned projects.
- Registered User sees read-only system status.
- Registered User cannot see secrets or raw technical errors.
- Registered User cannot generate/upload for unassigned projects.

### n8n validation

- Health workflow uses dynamic Supabase/Chroma/microservice config.
- Ingestion workflow no longer hardcodes Supabase bucket/project URL.
- Vectorization workflow no longer hardcodes document processor URL or Chroma collection.
- Generation workflow no longer hardcodes Chroma collection/topK.
- Generation workflow no longer hardcodes Confluence base URL/space key.
- Generation workflow no longer hardcodes Jira project key/id or issue type ids.
- Job records contain `settingsVersion` and safe `configSnapshot`.

### Supabase validation

- Required tables exist.
- RLS policies or backend checks enforce Admin vs Registered User access.
- Connection test history is persisted.
- Audit events are persisted.
- Existing workflows still read/write `doc_ingestion_jobs`, `qa_jobs`, and `qa_job_metrics`.

### API validation

- All write endpoints require Admin where appropriate.
- Registered User responses are scoped and sanitized.
- Secret values are never returned.
- Error responses are user-safe but traceable through logs.

## Phase 13: Rollback Plan

If dynamic settings rollout fails:

1. Keep existing hardcoded n8n workflows exported as backup.
2. Disable dynamic resolver nodes.
3. Route workflows back to known static values.
4. Keep new tables in place but mark settings version inactive.
5. Re-run `/webhook/health`.
6. Confirm ingestion and generation still work with original contracts.

## Final Deliverables

Expected final artifacts:

- Supabase migration SQL for new/updated tables.
- Seed data for Admin, environment, and integrations.
- Auth/RBAC implementation or n8n-auth equivalent.
- Settings APIs.
- Integration status/test APIs.
- Updated health workflow.
- Updated ingestion workflows.
- Updated generation workflows.
- User management workflows or backend endpoints.
- Updated repository endpoints with role filtering.
- Audit and connection test persistence.
- Frontend wiring to replace local UI-only persona state.

