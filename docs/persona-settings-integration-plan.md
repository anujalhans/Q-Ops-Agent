# Persona-Based Settings And Dynamic Integration Plan

Date: 2026-05-05

## Objective

Redefine Q-Ops Agent around two personas:

- **Admin**: owns workspace configuration, user management, integration setup, secrets governance, connection testing, and operational controls.
- **Registered User**: uses approved projects, uploads artifacts, generates QA deliverables, reviews outputs, and controls only personal preferences.

The immediate goal is to redesign and plan the Settings section so integration parameters are no longer hardcoded in n8n workflows. The frontend should collect and display configuration, the backend should validate and persist it, and n8n workflows should read runtime configuration from the backend or from request payload context.

This is a planning document only. No application code is generated here.

## Current Context

The current app is a React/Vite frontend with static client-side auth:

- Login is `admin/admin`.
- Auth state is stored in `localStorage["qops-agent-auth"]`.
- Settings are stored in `localStorage["qops-agent-settings"]`.
- API base URL is configurable locally through `qops-agent-api-base-url`.
- The Settings page currently has Profile, API And Backend, Integrations, Notifications And Security.
- `Test Connection` currently calls `GET /webhook/health`.
- The updated health workflow now performs live checks for Supabase DB, Supabase Storage, ChromaDB, FastAPI extractor, and the markdown-to-DOCX converter service. Jira, Confluence, and OpenAI are still returned as backend-managed rather than actively tested.

Backend behavior is currently implemented primarily through n8n webhooks and Supabase tables. Existing frontend calls include:

- `POST /webhook/upload-test-artifacts`
- `GET /webhook/job-status?jobId=...`
- `POST /webhook/generate-qa-doc`
- `GET /webhook/job-status-retrieve?jobId=...`
- `GET /webhook/health`
- `GET /webhook/analytics-summary`
- Repository-style endpoints planned for projects, artifacts, generated documents, and audit events.

Hardcoded values currently visible in n8n exports include:

| Area | Current hardcoding observed | Should become dynamic |
|---|---|---|
| Supabase | Project URL `https://ifnznfspkjayhnooncrv.supabase.co`, storage bucket `uploaded-project-docs`, table paths | Supabase project URL, storage bucket, table names only if multi-env needed |
| Chroma | Cloud URL `https://api.trychroma.com`, tenant `My_Tenant`, database `QA-Documents-Chunk`, collection `qa-chunks-batches`, retrieval `topK: 20` | Base URL, tenant, database, collection name, retrieval topK |
| n8n/local services | Document processor `http://127.0.0.1:8000/process-document`, converter `http://127.0.0.1:5050/convert` | Microservice base URLs and endpoint paths |
| Confluence | Space key `TD`, REST URL containing `anujalhans1.atlassian.net`, page title pattern | Site/base URL, space key, parent page, title pattern |
| Jira | Project id `10001`, project key `KAN`, epic type id `10002`, story type id `10006` | Project key/id, issue type ids/names, label prefix/idempotency strategy |
| OpenAI | Models `gpt-4o-mini`, `gpt-4.1-mini`, max tokens `8000` | Admin-selected model profile with backend guardrails |

## Recommended Permission Model

### Admin

Admin should be able to:

- Manage users and assign roles.
- Configure and test all integrations.
- Create, edit, archive, and delete projects.
- Upload and reprocess artifacts for any project.
- Generate documents for any project.
- View all artifacts, generated outputs, analytics, audit logs, and system diagnostics.
- Configure global defaults such as Jira project, Confluence space, Chroma collection, model profile, retention policy, notification defaults, and session timeout.
- Rotate or update integration credentials through backend-managed secure flows.
- Export diagnostics and audit logs.

### Registered User

Registered User should be able to:

- View assigned projects only.
- Create knowledge bases only for projects they own or are assigned to, depending on final policy.
- Upload artifacts to assigned projects.
- Generate QA documents for assigned projects using Admin-approved integration defaults.
- View generated outputs for assigned projects.
- View their own notifications and personal activity.
- Update personal profile details and notification preferences.
- Toggle theme and local UI preferences.
- Run read-only connection checks only where useful, for example viewing service status without seeing secrets or changing configuration.

Registered User should not be able to:

- Edit global API base URL, Jira, Confluence, Supabase, Chroma, n8n, OpenAI, or microservice settings.
- See secret values, tokens, service-role keys, or credentials.
- Change webhook paths or backend runtime config.
- View all-company audit logs unless explicitly granted.
- Delete shared projects, artifacts, or generated documents.
- Change other users' roles.

## Settings Information Architecture

### Admin Settings

Use grouped sections or left-side Settings sub-navigation:

1. **Profile**
   - Name, email, avatar, job title.
   - Role badge: Admin.

2. **Users And Roles**
   - Invite registered users.
   - Assign role: Admin or Registered User.
   - Assign projects.
   - Deactivate users.
   - View last login and status.

3. **Environment**
   - Environment name: local, dev, test, prod.
   - n8n base URL.
   - Webhook path registry.
   - Backend API base URL if a separate backend is introduced.

4. **Integrations**
   - Jira.
   - Confluence.
   - Supabase.
   - Chroma.
   - n8n.
   - Backend microservices.
   - OpenAI/model profile.

5. **Defaults And Routing**
   - Default Jira project.
   - Default Confluence space.
   - Default Chroma collection.
   - Default document publishing destinations by document type.
   - Default product owner fallback.

6. **Notifications**
   - In-app/email notification defaults.
   - Failure alerts.
   - Job completion alerts.

7. **Security And Compliance**
   - Session timeout.
   - Data retention messaging.
   - Audit logging policy.
   - Secret masking policy.

8. **System Status**
   - Health overview.
   - Connection test history.
   - Last successful check per integration.

### Registered User Settings

Registered User Settings should be narrower:

1. **Profile**
   - Name, email, avatar, job title.
   - Role badge: Registered User.

2. **Preferences**
   - Theme.
   - Default landing dashboard view.
   - Date/time display.

3. **Notifications**
   - In-app notifications.
   - Email notifications.
   - Job completion/failure subscriptions for assigned projects.

4. **My Projects**
   - Assigned project list.
   - Default project.
   - Read-only project metadata.

5. **System Status**
   - Read-only health summary.
   - No editable integration parameters.
   - No secrets.

## Integration Configuration Model

Create a backend-owned settings model rather than allowing n8n workflows to depend on frontend localStorage. Recommended logical shape:

| Object | Purpose |
|---|---|
| `environmentSettings` | n8n/API base URL, webhook paths, environment label |
| `integrationSettings` | Non-secret config for Jira, Confluence, Supabase, Chroma, n8n, microservices, OpenAI |
| `integrationSecrets` | Secret references only, stored securely outside frontend |
| `projectIntegrationOverrides` | Optional per-project Jira project/Confluence space/Chroma collection overrides |
| `connectionTestResults` | Last status, latency, checkedAt, checkedBy, error message |

Use a settings table such as `qops_settings` for non-secret JSON configuration and a secure secret mechanism for tokens and service-role credentials. The frontend should never receive raw secrets after save.

Recommended non-secret fields:

| Integration | Admin-editable fields |
|---|---|
| Jira | base URL, project key, project id, epic issue type id/name, story issue type id/name, idempotency label prefix |
| Confluence | base URL, space key, optional parent page id, page title pattern |
| Supabase | project URL, storage bucket, public anon key reference name, table names if needed |
| Chroma | base URL if external, tenant, database, collection name, retrieval topK |
| n8n | base URL, webhook path registry, execution URL template if useful |
| Backend microservices | document processor URL/path, converter URL/path, timeout |
| OpenAI | generation model, vision model, embedding model, max tokens, temperature if exposed |

## Backend API Plan

Introduce a thin backend configuration layer in front of n8n or as n8n-backed webhooks. Prefer a real backend service for secrets and RBAC, but n8n can host the first version if access is protected.

### Auth And User APIs

| Method | Endpoint | Persona | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public/Admin policy | Register user or create invite-based account |
| `POST` | `/api/auth/login` | Public | Login and return session/JWT |
| `POST` | `/api/auth/logout` | Authenticated | End session |
| `GET` | `/api/me` | Authenticated | Current user, role, project assignments, permissions |
| `GET` | `/api/users` | Admin | User list |
| `POST` | `/api/users/invite` | Admin | Invite registered user |
| `PATCH` | `/api/users/{id}` | Admin | Role/project assignment/status |

### Settings APIs

| Method | Endpoint | Persona | Purpose |
|---|---|---|---|
| `GET` | `/api/settings` | Admin | Full non-secret settings |
| `PATCH` | `/api/settings` | Admin | Update global settings |
| `GET` | `/api/settings/me` | Registered User | Personal preferences and read-only allowed status |
| `PATCH` | `/api/settings/me` | Registered User | Update personal preferences |
| `GET` | `/api/integrations` | Admin | Integration config list |
| `PATCH` | `/api/integrations/{key}` | Admin | Update one integration's non-secret config |
| `POST` | `/api/integrations/{key}/secrets` | Admin | Store/rotate secrets; response returns masked status only |
| `POST` | `/api/integrations/{key}/test` | Admin | Test one integration |
| `POST` | `/api/integrations/test-all` | Admin | Test all integrations |
| `GET` | `/api/integrations/status` | Authenticated | Read allowed health summary |

If the project stays webhook-first, mirror these as n8n paths under `/webhook/settings`, `/webhook/integrations/status`, and `/webhook/integrations/{key}/test`, but avoid exposing unauthenticated write endpoints in production.

## Test Connection Plan

The updated `GET /webhook/health` workflow can be used as the first version of the System Status and read-only integration health surface. It now checks Supabase DB, Supabase Storage, ChromaDB, FastAPI extractor, and converter service, and returns `services`, `webhooks`, and `integrations`.

Admin Settings should still evolve beyond one generic health button. Each integrated system needs its own status card and, where feasible, its own `Test Connection` action.

| Integration | Test action | Success evidence |
|---|---|---|
| n8n | Call `/webhook/health` and read returned webhook registry | Status `ok`, webhook registry returned |
| Jira | Query accessible project and issue types | Project key/id resolves, epic/story issue types found |
| Confluence | Query space and optional parent page | Space key resolves, page API reachable |
| Supabase | Use `/webhook/health` initially; later add dedicated table/bucket/RPC checks | DB reachable, storage bucket reachable, required tables available |
| Chroma | Use `/webhook/health` initially; later allow dedicated collection test | Tenant/database/collection reachable |
| Backend microservices | Use `/webhook/health` initially; later allow per-service test | Document extractor and converter respond within timeout |
| OpenAI | Backend-only lightweight model/credential validation | Credential valid, configured models accepted |

Each test result should show:

- Status: `operational`, `degraded`, `not_configured`, `unreachable`, `unauthorized`, `error`.
- Latency.
- Last checked timestamp.
- Checked by.
- Human-readable failure reason.
- Technical details hidden behind an expandable row for Admin.

Registered Users should see only a read-only summary such as "Jira operational" or "Confluence unavailable"; they should not see URLs containing secrets, headers, tokens, or raw stack traces.

## Runtime Configuration Flow

Target data flow:

1. Admin configures integrations in Settings.
2. Frontend sends settings to backend.
3. Backend validates, stores non-secret config, stores secrets securely, and writes audit events.
4. User starts ingestion or generation from the frontend.
5. Frontend sends only project/action input such as `projectName`, `documentType`, files, and optional project override id.
6. Backend or n8n queue creator resolves runtime config for the user's project.
7. Queue record stores a `configSnapshot` or `settingsVersion` with safe, non-secret values needed for repeatability.
8. Worker workflows use the resolved config instead of hardcoded values.
9. Status, output, metrics, and audit logs include the config version and integration outcome.

Recommended request additions for queue creation:

| Existing request | Add |
|---|---|
| Ingestion upload | `projectId`, optional `settingsVersion`, optional `chromaCollectionOverride` if Admin-approved |
| Document generation | `projectId`, `documentType`, `productOwner`, optional `destinationOverride`, optional `settingsVersion` |

Do not send raw secrets from frontend to n8n job execution requests.

## n8n Refactor Plan

### Phase 1: Configuration Readiness

- Add settings storage in Supabase or backend.
- Add `GET settings by environment/project` node or backend call.
- Add `configSnapshot` to `doc_ingestion_jobs.input` and `qa_jobs.input`.
- Treat the updated health workflow as the initial aggregate health endpoint.
- Next, make the health workflow read configured Supabase, Chroma, and microservice values from backend settings instead of hardcoded URLs.
- Add dedicated Jira, Confluence, and OpenAI validation checks, or expose them as separate Admin-only integration test actions.

### Phase 2: Remove Hardcoded Workflow Values

Replace hardcoded values with resolved config:

- Supabase project URLs and storage bucket references.
- Chroma collection name and retrieval `topK`.
- Confluence base URL, space key, parent page, title pattern.
- Jira project key/id and issue type ids.
- Local microservice URLs.
- OpenAI model names and generation settings, if Admin-configurable.

### Phase 3: Project-Level Overrides

- Add project settings for Jira project and Confluence space if different projects publish to different destinations.
- Add validation so a Registered User can select only Admin-approved destinations.
- Store effective config on every job.

### Phase 4: Operational Hardening

- Connection test history.
- Audit events for every settings change and connection test.
- Masked secret display.
- Role-aware Settings rendering.
- Failure-specific UI messages.

## Frontend Plan

### Authentication And Session

- Replace static `admin/admin` with backend login.
- Store session securely according to chosen auth architecture.
- Load `/api/me` on app startup.
- Route guard based on `isAuthenticated`.
- Render menus and Settings sections based on `permissions`.

### Role-Based Settings Rendering

- Introduce a permission model in frontend state, not hardcoded labels.
- Use the same Settings route for both personas but hide or disable sections based on permission.
- Admin sees all configuration tabs.
- Registered User sees only profile, preferences, notifications, assigned projects, and read-only system status.

### Integration Settings UI

- Replace the current simple Integrations panel with integration cards.
- Each integration card should include status, key fields, masked secret state, last tested, and action buttons.
- Admin actions: edit, save, test, rotate secret, view details.
- Registered User actions: view status only.

### Passing Parameters From FE To BE

Frontend should pass:

- User/session identity through auth.
- `projectId` and `projectName`.
- `documentType`.
- Files for ingestion.
- Optional product owner from project/user data.
- Optional Admin-approved project override id.

Backend should enrich the request with:

- Jira project key/id.
- Confluence space/page settings.
- Chroma tenant/database/collection.
- Supabase storage/table config.
- Microservice URLs.
- OpenAI/model profile.

This keeps the frontend expressive without making it responsible for secrets or workflow internals.

## Suggested Implementation Phases

### Phase 0: Decisions

- Decide whether registration is open signup or Admin invite-only. Recommended: Admin invite-only for this enterprise QA tool.
- Decide whether Registered Users can create projects. Recommended: allow only Admins initially; optionally allow project creation with Admin approval later.
- Decide whether settings backend is a real service or n8n/Supabase-only first version.

### Phase 1: Data And Contracts

- Define user, role, project assignment, settings, integration config, secret reference, connection test, and audit schemas.
- Define `/api/me`, settings, integration, and test-connection contracts.
- Extend docs with final API contracts.

### Phase 2: UI Design

- Redesign Settings for persona-aware navigation.
- Create Admin integration cards with per-system test states.
- Create Registered User settings with limited options.
- Create user/role management screens.
- Create read-only status experience.

### Phase 3: Backend And n8n

- Implement settings persistence and status APIs.
- Implement connection test actions.
- Refactor n8n workflows, including the health workflow, to resolve configuration dynamically.
- Add config snapshots to queue records.

### Phase 4: Frontend Implementation

- Replace local-only auth with backend auth.
- Add role-aware routing and Settings rendering.
- Wire Settings saves/tests to backend.
- Update ingestion/generation submit payloads with project id and user context.

### Phase 5: Validation

- Test Admin and Registered User permissions.
- Test every integration card: unconfigured, invalid credentials, unreachable, success.
- Run ingestion and generation with non-default Jira/Confluence/Chroma settings.
- Verify n8n workflows have no environment-specific hardcoded values except safe defaults.
- Verify audit logs for settings changes and connection tests.

## Open Questions

1. Should registration be open self-service, or Admin invite-only? Recommended: Admin invite-only.
2. Should Registered Users be allowed to create new projects, or only work inside assigned projects? Recommended: assigned projects only for the first production version.
3. Will there be one global Jira/Confluence destination, or per-project destinations? Recommended: support global defaults plus per-project overrides.
4. Should OpenAI model selection be Admin-configurable in UI, or kept backend-managed? Recommended: backend-managed first, Admin-visible later.
5. Is there a dedicated backend service planned, or should n8n plus Supabase handle settings initially? Recommended: dedicated backend for auth/secrets/RBAC if production-bound.

## Acceptance Criteria

- Admin and Registered User see different Settings surfaces.
- Registered User cannot edit integration, environment, or security defaults.
- Admin can test Jira, Confluence, Supabase, Chroma, n8n, OpenAI, and microservices individually.
- Test results are persisted and visible with last checked time.
- Integration secrets are never exposed to frontend after save.
- n8n workflows receive runtime settings from backend/config snapshots.
- Jira project, Confluence space, Chroma collection, Supabase bucket, and microservice URLs are no longer hardcoded in workflow logic.
- Every settings change and connection test creates an audit event.
