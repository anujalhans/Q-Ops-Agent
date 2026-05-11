# n8n Compatibility Steps For Persona Settings And Runtime Config

Date: 2026-05-07

This guide describes the n8n changes needed after the Supabase schema update for persona-aware settings, integration status, project scope, and safe runtime configuration snapshots.

The current working UI and workflows should keep their existing endpoint paths and response shapes. Make the changes below additively.

## Implementation Status - 2026-05-07

### Completed in this pass

- Created and published new n8n workflow `Q-Ops Agent Projects API - Wired` (`hWo8zurIZ3KkPKxg`) for:
  - `GET /webhook/projects`
  - `POST /webhook/projects`
- Created and published new n8n workflow `Q-Ops Agent Artifacts API` (`YFsr2hRD7BZlPCEK`) for:
  - `GET /webhook/artifacts`
- Created and published new n8n workflow `Q-Ops Agent Generated Documents API` (`mucEtw68lUvv9T6f`) for:
  - `GET /webhook/generated-documents`
- Created and published new n8n workflow `Q-Ops Agent Audit Events API` (`lyyrP14iTYacuEFv`) for:
  - `GET /webhook/audit-events`
- Created and published new n8n workflow `Q-Ops Agent Artifact Reprocess API` (`zHsg1Zr7oGOvhPFg`) for:
  - `POST /webhook/artifacts/:artifactId/reprocess`
- Updated the UI backend refresh behavior so the dashboard attempts repository endpoints directly even before the existing health workflow advertises them in `health.webhooks`.
- Verified read-only production endpoints:
  - `GET /webhook/projects` returned a valid empty repository response.
  - `GET /webhook/artifacts` returned 248 artifact records.
  - `GET /webhook/generated-documents` returned 43 document records.
  - `GET /webhook/audit-events` returned 15 audit/event records.
- Archived earlier duplicate draft workflows created during MCP credential probing:
  - `Q-Ops Agent Repository API` (`8isqdCjPaPqE02eG`)
  - `Q-Ops Agent Projects API` (`J9wp94YeehAthHX0`)
- Created new draft persona Settings workflows:
  - `Q-Ops Agent Settings API` (`ZuXZfzhWr8Fcep5a`) for `GET /webhook/settings`
  - `Q-Ops Agent Settings Write API` (`u3klCtPvbFd01ds4`) for `PATCH /webhook/settings`
  - `Q-Ops Agent Integrations Status API` (`CGkgxVrH5D6syesK`) for `GET /webhook/integrations/status`
  - `Q-Ops Agent Integration Test API` (`3zXdQS9hABDTXuea`) for `POST /webhook/integrations/:integrationKey/test`
  - `Q-Ops Agent Integrations Test All API` (`0cyKIIbCq17bD0yK`) for `POST /webhook/integrations/test-all`
- Updated the existing `Q-Ops-Agent-Health-Status` workflow draft (`zdx8YtZJOMWtbv1L`) so the draft `webhooks` catalogue includes:
  - `projects`
  - `artifacts`
  - `generatedDocuments`
  - `auditEvents`
  - `settings`
  - `integrationsStatus`
  - `integrationTest`
  - `integrationsTestAll`
- Published and smoke-tested:
  - `GET /webhook/settings` returned 4 environments and 7 integrations.
  - `GET /webhook/integrations/status` returned 7 integration status records.
  - `GET /webhook/health` returned `status=ok` and advertised `projects`, `settings`, and `integrationTest`.
- Replaced first-pass integration test inference with live probe-backed workflow drafts:
  - `Q-Ops Agent Integrations Test All API` now calls the live health workflow and maps real Supabase, Chroma, n8n, FastAPI extractor, and converter service statuses.
  - `Q-Ops Agent Integration Test API` now uses `POST /webhook/integrations/test` with `body.integrationKey` because local n8n production webhooks did not match `:integrationKey` route params reliably.
  - Jira, Confluence, and OpenAI remain explicit `not_configured` probe results until dedicated credential-backed read-only validation nodes are added.
- Wired the UI login prerequisite from static local `admin/admin` auth to Supabase Auth email/password sessions:
  - Added browser-side Supabase Auth REST login, refresh, and logout using the publishable key only.
  - Added bearer-token forwarding from `src/lib/api.ts` to auth-aware n8n webhooks.
  - Updated the dashboard to hydrate the signed-in user's name/email/role from the auth-aware profile endpoint.
- Created new draft auth/RBAC n8n workflows:
  - `Q-Ops Agent Auth Me API` (`55zxBkmwk8ezvWOP`) for `GET /webhook/me`
  - `Q-Ops Agent Users API` (`vhxA44slh746G1ja`) for `GET /webhook/users`
- Auth verification nodes use the Supabase publishable key as the Supabase Auth `apikey` header and forward the incoming user bearer token as the `Authorization` header used for session verification. This is intentionally not the service-role key.
- Wired the Settings Users & Roles UI to `GET /webhook/users` with admin-only backend authorization.
- Bootstrapped and verified the first Supabase Auth admin login from the UI.
- Created new draft guarded user write workflows:
  - `Q-Ops Agent User Invite API` (`W8b32kGweBlEXN6r`) for `POST /webhook/users/invite`
  - `Q-Ops Agent User Update API` (`AL5fIgJ9skALon98`) for `PATCH /webhook/users/update`
- Wired the Settings Users & Roles UI actions:
  - Invite User form calls `POST /webhook/users/invite`
  - Edit User form calls `PATCH /webhook/users/update`
  - Both actions refresh `GET /webhook/users` after a successful write.
- Published the new user write workflows after assigning `supabase-service-role-key` to their service-role HTTP Request nodes.
- Added the required `qops_users.email` unique constraint (`qops_users_email_key`) so the invite workflow's `ON CONFLICT (email)` upsert can run successfully.
- Added the UI invite-accept journey:
  - New `/auth/callback` route consumes Supabase invite sessions from the URL hash.
  - The root route now detects Supabase invite session hashes and forwards them to `/auth/callback` if Supabase lands on the Site URL root.
  - The callback immediately calls `POST /webhook/users/accept-invite` so the Q-Ops profile moves from `pending_invite` to `active`.
  - New set-password screen updates the invited user's Supabase Auth password with the publishable-key user session.
- Created new draft n8n workflow `Q-Ops Agent User Accept Invite API` (`Nkkxc1p3wnzPyj21`) for `POST /webhook/users/accept-invite`.
- Updated the `Q-Ops Agent User Invite API` draft so invite requests pass a UI callback redirect URL to Supabase Auth on the invite endpoint query string.
- Hardened the callback path after UI testing showed Supabase could still land on the Site URL root:
  - The app now detects invite session hashes at `/` and forwards them to `/auth/callback`.
  - The latest `Q-Ops Agent User Invite API` draft was republished so the active workflow uses the `redirect_to` query-string invite call.
- Fixed the Settings Control Center role gap:
  - `qops_users.role` was correct for invited users, but the Settings UI persona selector defaulted to `admin` locally.
  - Registered users are now forced into the registered-user Settings view; admin-only Users & Roles, integrations, environment, defaults, and security sections stay admin-only in the UI.
- Verified from the UI that an invited registered user can accept the invite, set a password, activate the Q-Ops profile, and see the registered-user Settings view instead of the admin Settings Control Center.
- Implemented the forgot-password journey:
  - The login Forgot Password modal now calls Supabase Auth `POST /auth/v1/recover` with the current UI `/auth/callback` redirect URL.
  - `/auth/callback` now supports both Supabase `type=invite` and `type=recovery` callback hashes.
  - Recovery callbacks show the same secure set-password screen without re-running invite acceptance.
  - Callback session consumption is guarded without cancelling the in-flight verifier, so React development double-invocation does not clear the stored recovery session or leave the page spinning after the URL hash is consumed.
  - Password updates still happen in Supabase Auth only; no password is stored in `qops_users`.
- Created new draft n8n workflow `Q-Ops Agent User Password Reset Audit API` (`NpD8cnqPE7qAWEpL`) for:
  - `POST /webhook/users/password-reset-audit`
  - Verifies the Supabase bearer token, resolves the active Q-Ops profile, and writes `PASSWORD_RESET_COMPLETED` into `qops_audit_events`.
- Wired the UI to call `POST /webhook/users/password-reset-audit` after Supabase confirms a recovery password update.
- Published and backend-smoke-tested `Q-Ops Agent User Password Reset Audit API`:
  - Authenticated webhook call returned `ok: true`.
  - `qops_audit_events` contains `PASSWORD_RESET_COMPLETED` for the verified Q-Ops user profile.
- Verified the real Forgot Password UI journey for the registered user:
  - Reset email was sent and consumed successfully.
  - New password login works.
  - `qops_audit_events` contains `PASSWORD_RESET_COMPLETED` for `alhansanuj@gmail.com`.
- Ran backend smoke tests:
  - `PATCH /webhook/settings` updated `qops_environment_settings` for `environment_key = "local"` and wrote `SETTINGS_ENVIRONMENT_UPDATED` in `qops_audit_events`; the smoke-test display name was restored to `Local`.
  - `POST /webhook/projects` created smoke project `Codex Smoke Project 20260507-163940`.
  - Anonymous `GET /webhook/users` returned an unauthorized response.
  - Anonymous `PATCH /webhook/users/update` returned HTTP 403.
  - Admin-authenticated `GET /webhook/users` returned 3 users.
  - Admin-authenticated `PATCH /webhook/users/update` updated `alhansanuj@gmail.com` and wrote `USER_UPDATED`.
  - Registered-user-authenticated `GET /webhook/me` returned active `registered_user` with `settings:read` and `projects:read`.
  - Registered-user-authenticated `GET /webhook/users` returned `ok=false`, `error=forbidden`.
  - Registered-user-authenticated `PATCH /webhook/users/update` returned HTTP 403 and did not update the profile.
  - Published `POST /webhook/artifacts/reprocess` queued `ING-260507-6J6YV2` for `ING-260501-JTI1JX:brd` and wrote `JOB_REPROCESS_QUEUED`.
- Found and patched the artifact reprocess route gap:
  - n8n registered `artifacts/:artifactId/reprocess` as a literal path, so UI-style dynamic URLs returned 404.
  - The UI now calls stable `POST /webhook/artifacts/reprocess` with `body.artifactId`.
  - The `Q-Ops Agent Artifact Reprocess API` draft now uses the same stable path and body contract.
- Hardened the artifact reprocess path end to end:
  - The UI now sends the logged-in Supabase bearer token when calling `POST /webhook/artifacts/reprocess`.
  - The UI ignores reprocess responses that do not include a `jobId`.
  - The Artifacts screen enables the Reprocess button only for failed artifacts.
  - The `Q-Ops Agent Artifact Reprocess API` draft now verifies the Supabase bearer token, resolves the active `qops_users` profile, loads project memberships, and enforces failed-only reprocess.
  - Registered users can reprocess only failed artifacts whose `project_id` is assigned to them; admins can reprocess failed artifacts across the workspace.
  - Reprocess-created `doc_ingestion_jobs` rows preserve `project_id`, `requested_by`, `settings_version`, and `config_snapshot`.
  - Reprocess `qa_job_metrics` `JOB_REPROCESS_QUEUED` rows now write top-level `project_id`, `requested_by`, and `settings_version` for analytics/audit scoping.
  - Before publishing the updated reprocess workflow, assign `supabase-service-role-key` to `Fetch Q-Ops User Profile`, `Fetch Current User Project Memberships`, `Fetch Reprocess Source Job`, `Insert Reprocess Ingestion Job`, and `Insert Reprocess Metric`.
- Created new draft workflow `Q-Ops Agent Infrastructure Load API` (`NgKN1jdavJfmJG9h`) for:
  - `GET /webhook/infrastructure-load`
  - Verifies the Supabase bearer token and resolves the caller from `qops_users`.
  - Admin users receive workspace-wide infrastructure load.
  - Registered users receive load scoped to their assigned projects and attributed jobs/metrics.
  - Combines queue backlog from `qa_jobs` and `doc_ingestion_jobs`, workflow pressure from `qa_job_metrics`, service status/latency from `qops_connection_test_results`, and today's tokens/cost/jobs.
  - Returns `status`, `score`, `queues`, `workflows`, `services`, `usage`, and `scope`.
  - Before publishing, assign `supabase-service-role-key` to `Fetch Q-Ops User Profile`, `Fetch Current User Project Memberships`, `Fetch Generation Jobs`, `Fetch Ingestion Jobs`, `Fetch Recent Metrics`, and `Fetch Connection Results`.
- Wired the Dashboard Platform Load card and Diagnostics modal to `GET /webhook/infrastructure-load` with local session fallback until the workflow is published.
- Found and patched the settings write UUID gap:
  - `updated_by` is a UUID column, so text actors such as `codex-smoke-test` cannot be written there.
  - `Q-Ops Agent Settings Write API` now writes `updated_by` only when a UUID actor is supplied and keeps human-readable labels in `qops_audit_events.actor_name`.
  - The fixed workflow is published as active version `0aed7a24-5a00-46d1-9409-1c8290f27336`.
- Completed Phase 1 of user-scoped analytics migration:
  - Added nullable `qa_job_metrics.requested_by uuid`.
  - Added nullable `qa_job_metrics.project_id text`.
  - Added `qa_job_metrics_requested_by_fkey` with `on delete set null`.
  - Added indexes `qa_job_metrics_requested_by_created_at_idx` and `qa_job_metrics_project_id_created_at_idx` for upcoming user/project analytics filtering.
  - Existing ingestion/generation workflows remain compatible because the new columns are nullable and no active workflow contract was changed.
- Implemented Phase 2 and Phase 3 drafts for user-scoped analytics:
  - The UI now sends the logged-in Supabase bearer token when calling `GET /webhook/analytics-summary`.
  - The `Q-Ops-Agent-Analytics-Summary` draft now verifies the Supabase bearer token, resolves the active `qops_users` profile, and builds analytics from `qa_job_metrics`.
  - Registered users are scoped to `qa_job_metrics.requested_by = current qops_users.id`.
  - Admins keep workspace-wide analytics by default, with optional `userId` and `projectId` query filters supported in the draft.
  - After first publish smoke testing, patched the n8n Code node query builder to avoid `URLSearchParams`, which is not available in this n8n Code sandbox.
  - After smoke testing showed anonymous calls returned an empty `200`, patched the draft with an explicit missing-bearer-token unauthorized response path.
  - Published and smoke-tested the auth-aware analytics workflow:
    - Anonymous `GET /webhook/analytics-summary` returns HTTP 401 with `error = "unauthorized"`.
    - Admin-authenticated analytics returns `meta.scope = "workspace"` and current workspace metrics.
    - Registered-user-authenticated analytics returns `meta.scope = "self"` and only rows matching that user's `qa_job_metrics.requested_by`.
    - Registered users currently see zero historical analytics because older metric rows do not yet have `requested_by`; this is expected until the queue creator workflows start writing attribution.
- Created draft-only attributed queue creator clones without editing the active production queue creator workflows:
  - `INGEST API Queue Creator - SaaS - Attributed Draft` (`iiR8d9v5oI8WzBPX`) with draft/test path `POST /webhook-test/upload-test-artifacts-attributed-draft`.
  - `RETRIEVAL Job Queue Creator - SaaS - Attributed Draft` (`d8hZl2gQpuWjlwr3`) with draft/test path `POST /webhook-test/generate-qa-doc-attributed-draft`.
  - The original active workflows remain untouched:
    - `INGEST API Queue Creator - SaaS` (`pjz9L77szB9DDsN1`) is still active on its existing upload path.
    - `RETRIEVAL Job Queue Creator - SaaS` (`sbUy9luTFnRJ52El`) is still active on `POST /webhook/generate-qa-doc`.
  - The draft clones require a Supabase bearer token, verify the Supabase Auth user, resolve the active `qops_users` profile, call `qops_resolve_runtime_config`, and write `project_id`, `requested_by`, `settings_version`, and `config_snapshot`.
  - The draft clones preserve the existing response shapes:
    - Upload returns `{ "jobId": "ING-...", "status": "queued" }`.
    - Generation returns `{ "jobId": "GEN-...", "status": "queued" }`.
  - The draft clones preserve the existing `input` shapes:
    - Upload keeps `input.projectName` and `input.files`.
    - Generation keeps the full original request body in `qa_jobs.input`.
  - The draft clone endpoints were temporarily activated for isolated smoke testing on their separate `*-attributed-draft` paths, then deactivated again.
  - Draft smoke tests passed:
    - Generation draft returned `{ "jobId": "GEN-260507-ERUGRZ", "status": "queued" }`.
    - Upload draft returned `{ "jobId": "ING-260507-X9TRBC", "status": "queued" }`.
    - `qa_jobs` and `doc_ingestion_jobs` rows were written with `requested_by`, `settings_version = 1`, and non-null `config_snapshot`.
  - `qa_job_metrics` `JOB_QUEUED` rows were written with `requested_by` and attribution metadata.
  - The two smoke jobs were immediately moved to `failed` after verification so the existing workers would not continue processing them.
  - Smoke testing confirmed the existing generation worker still writes later worker-side metrics, such as `JOB_STARTED`, without attribution. Worker attribution remains a required follow-up before replacing production queue creators.
- Created draft-only attributed worker workflow clones without editing the active production worker workflows:
  - `RETRIEVAL Document Generator AI Agent - SaaS - Attributed Draft` (`Nt316KsNOfbUutyc`) is an attribution-focused harness that writes attributed generation `JOB_STARTED` metrics from preserved job context; it is not a full clone of the production generator.
  - `RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft` (`ew9RdPEvMAq5P6t3`) processes only `qa_jobs.status = "draft_pending"` jobs on `POST /webhook/generation-worker-attributed-draft`.
  - `Multimodal Knowledge Ingestion & Vectorization Engine - Attributed Draft` (`4HS0hptQYfJsdUIx`) is an attribution-focused harness that writes attributed ingestion `JOB_COMPLETED` metrics from preserved job context; it is not a full clone of the production vectorization engine.
  - `INGEST Worker Engine (Queue Processor) - Attributed Draft` (`mlelxUdlNcoBIyru`) processes only `doc_ingestion_jobs.status = "draft_pending"` jobs on `POST /webhook/ingestion-worker-attributed-draft`.
  - The original active production workers remain untouched:
    - `RETRIEVAL Worker Engine (Queue Processor) - Saas` (`wvfvdSZjyRSEhy7Z`) is still active.
    - `INGEST Worker Engine (Queue Processor)` (`iKOec9hKQmR2KgHs`) is still active.
  - The attributed worker drafts were smoke-tested in manual mode using seeded `draft_pending` rows and stayed inactive after the test.
  - Draft worker smoke tests passed:
    - Generation draft worker processed `GEN-DRAFT-260507-PHASE6` to `draft_completed`.
    - Ingestion draft worker processed `ING-DRAFT-260507-PHASE6` to `draft_completed`.
    - Generation worker-side `JOB_STARTED` metric was written with non-null `requested_by`, `project_id`, `settings_version`, and attribution metadata.
    - Ingestion worker-side `JOB_COMPLETED` metric was written with non-null `requested_by`, `project_id`, `settings_version`, and attribution metadata.
    - The two fixed Phase 6 smoke rows and their metric rows were removed after verification so registered-user analytics are not polluted by draft smoke data.
- Created true full inactive clones of the two large downstream worker subworkflows after review showed the earlier drafts were attribution harnesses, not full clones:
  - `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft` (`fullRetrievalD01`) is a full inactive clone of `RETRIEVAL Document Generator AI Agent - SaaS` (`0G3qlenjAeBnHDTr`).
  - `Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft` (`fullIngestDraft01`) is a full inactive clone of `Multimodal Knowledge Ingestion & Vectorization Engine` (`n0fvS28StF5iMZvG`).
  - Both full clones were imported from the published production workflow exports with new workflow IDs and `active = false`.
  - The original production subworkflows remain active and untouched.
- Applied worker-side attribution/runtime-config changes to the true full clone drafts only:
  - `fullRetrievalD01` now carries `projectId`, `requestedBy`, `settingsVersion`, `configSnapshot`, and `environmentKey` from the execute-workflow input into the generation context.
  - `fullRetrievalD01` now uses runtime-configured generation model, max tokens, Chroma collection/topK, and converter URL where supported by the existing node shapes.
  - `fullRetrievalD01` now writes worker-side `qa_job_metrics` rows with `project_id`, `requested_by`, `settings_version`, environment, configured model, and Chroma collection metadata.
  - `fullIngestDraft01` now uses the runtime-configured document processor URL and Chroma collection where supported by the existing node shapes.
  - `fullIngestDraft01` now carries attribution into chunk metadata, Data Loader metadata, completed job output, and `qa_job_metrics` `JOB_COMPLETED`.
  - Both full clone drafts remain inactive after the update; production subworkflows remain untouched.
- Rewired the draft worker wrappers to call the true full clone drafts instead of the earlier lightweight attribution harnesses:
  - `RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft` (`ew9RdPEvMAq5P6t3`) now calls `fullRetrievalD01`.
  - `INGEST Worker Engine (Queue Processor) - Attributed Draft` (`mlelxUdlNcoBIyru`) now calls `fullIngestDraft01`.
  - Both draft worker wrappers remain inactive; production workers remain untouched.
- Ran controlled pinned smoke tests for the rewired draft worker wrappers:
  - Generation wrapper pinned smoke execution `40320` passed.
  - Ingestion wrapper pinned smoke execution `40321` passed.
  - The Execute Workflow nodes were pinned to avoid live OpenAI, Chroma, converter, Atlassian, and Supabase writes from the full clone drafts during this smoke pass.
  - Verified no `GEN-DRAFT-PIN-FULLCLONE`, `ING-DRAFT-PIN-FULLCLONE`, or related `qa_job_metrics` rows were written to Supabase.

### Activation status

The existing n8n credential `supabase-service-role-key` has been assigned to the HTTP Request nodes and the five repository workflows are published.

The new persona Settings read/status workflows are active and smoke-tested. The health workflow update is active and `GET /webhook/health` now advertises the repository and settings webhook paths.

The two integration test workflows have corrected drafts after smoke testing exposed two issues:

- `checked_by` and `last_tested_by` must be UUIDs or `null`; text labels such as `n8n` or `codex-smoke-test` fail Supabase inserts.
- The single integration test trigger must not store the path with a leading slash; the leading slash registered as a doubled production path.

After republishing the previous corrected drafts:

- `POST /webhook/integrations/test-all` passed smoke testing and returned 7 integration records: 1 `operational`, 6 `not_configured`.
- `POST /webhook/integrations/supabase/test` is still not registered in this n8n instance even though the workflow advertises `/webhook/integrations/:integrationKey/test`. The updated draft switches the single-test API to `POST /webhook/integrations/test` with `body.integrationKey`.

The latest live-probe workflows have been published and smoke-tested:

- `POST /webhook/integrations/test-all` returned 7 integrations: 4 `operational`, 3 `not_configured`.
- `POST /webhook/integrations/test` with `body.integrationKey = "supabase"` returned `operational`.
- Operational live probes: Supabase, ChromaDB, Local Microservices, n8n.
- Explicitly not configured yet: Jira, Confluence, OpenAI.

Keep older duplicate drafts archived or inactive to avoid webhook path conflicts.

The auth/RBAC read workflows are published and the UI login path has been verified. The user write workflows were published after assigning `supabase-service-role-key` to their service-role HTTP Request nodes.

The invite-accept journey is active and verified from the UI:

- `Q-Ops Agent User Invite API` (`W8b32kGweBlEXN6r`) is published with the callback redirect fix.
- `Q-Ops Agent User Accept Invite API` (`Nkkxc1p3wnzPyj21`) is published.
- Supabase Auth URL configuration allows the current local UI callback URL.
- Invite accept, password setup, profile activation, and registered-user Settings view were verified.

The forgot-password UI journey is implemented and builds successfully. The password reset audit workflow is published and backend-smoke-tested:

- `Q-Ops Agent User Password Reset Audit API` (`NpD8cnqPE7qAWEpL`) is active.
- `Verify Supabase Auth User` intentionally uses the Supabase publishable key as `apikey` and forwards the incoming user bearer token as `Authorization`.
- Backend smoke confirmed `PASSWORD_RESET_COMPLETED` is written to `qops_audit_events`.
- Real reset-email click-through has been verified from the UI for the registered user.

Current auth bootstrap state:

- Supabase Auth has a real admin user for `admin@qops.local`.
- The UI login flow works with Supabase Auth.
- `GET /webhook/me` and `GET /webhook/users` are the active auth/RBAC read contracts.

Current analytics scoping state:

- `fetchAnalyticsSummary` now sends the logged-in Supabase bearer token.
- `Q-Ops-Agent-Analytics-Summary` verifies the bearer token, resolves the active `qops_users` row, and builds the `qa_job_metrics` query from caller role.
- Registered users are scoped to their own `qa_job_metrics.requested_by` records.
- Admins remain workspace-wide by default and can later use optional `userId` and `projectId` filters.
- The published workflow has the n8n Code sandbox fix for query-string building and an explicit unauthorized path for missing bearer tokens.
- Final smoke test passed: anonymous returns 401, admin returns workspace metrics, and registered user returns self-scoped metrics.
- The analytics response has been extended for both admin and registered-user scopes with:
  - `ingestion.jobsCompleted`
  - `ingestion.totalChunksIngested`
  - `ingestion.avgProcessingDurationMs`
  - `ingestion.totalFilesProcessed`
  - `ingestion.filesByKnowledgeBase`
  - `failures.byPipeline`
  - `failures.recent`
  - `costs.byPipeline`
  - `costs.byProject`
- The Analytics UI now renders the new ingestion summary cards plus compact tables for recent failures by pipeline, cost by pipeline, cost by project, and files processed per knowledge base.
- Registered-user analytics now also checks `qops_project_members` before querying `qa_job_metrics`.
  - Registered users are scoped to `requested_by = current qops_users.id` and `project_id in assigned project ids`.
  - If a registered user has no assigned projects, the metrics query intentionally returns no rows.
  - Admin analytics remains workspace-wide by default and therefore still lists all projects in `costs.byProject`.
  - Verified for `alhansanuj@gmail.com`: project-scoped analytics includes only assigned project `UISmoleTest` and excludes older unassigned/null-project smoke metrics.
- Registered-user dashboard overview cards now use assigned-project scoped data:
  - `Artifacts` counts only artifacts whose `projectName` matches an assigned visible project.
  - `Generated outputs` counts only outputs for assigned visible projects.
  - `Knowledge bases ready` counts only assigned visible projects with `status=ready`.
  - Search, diagnostics artifact count, artifact repository, analytics local fallback props, and recent output panels now receive the same scoped arrays for registered users.

Current UI/runtime configuration state:

- The frontend upload and generation submitters now send the logged-in Supabase bearer token to the attributed queue creator webhooks.
- The frontend now passes `projectId` alongside the existing `projectName` for ingestion and generation when the selected project exists in the UI project list.
- The Admin Settings Control Center now reads safe environment/integration config from `GET /webhook/settings`.
- The Admin Settings Control Center now saves non-secret Jira and Confluence routing config through `PATCH /webhook/settings`.
- Jira UI-backed fields are `baseUrl`, `projectKey`, `projectId`, and `idempotencyLabelPrefix`.
- Confluence UI-backed fields are `baseUrl`, `spaceKey`, `parentPageId`, and `pageTitlePattern`.
- Raw integration credentials remain in n8n credentials and are not collected by the frontend.
- Jira epic/story issue type IDs remain backend-managed. Jira will generate created issue keys/ids at runtime, but issue type IDs themselves are Jira schema/config values if a Jira node requires them.
- The Admin Users And Roles UI now supports project membership assignment for registered users during invite and edit.
- Project assignment saves use the dedicated `PATCH /webhook/users/project-assignments` workflow and write `qops_project_members` without changing the existing invite/update contracts.
- `GET /webhook/me` has been updated in draft to return `projects` and `projectRoles` from `qops_project_members`; assign `supabase-service-role-key` to the new membership HTTP Request node and publish it before registered-user project filtering is fully active.
- Registered-user project surfaces now use the current user's assigned project IDs only. `My Projects`, project search, artifact/analytics project props, and generation project datalist no longer show every workspace project for registered users.
- The registered-user `My Projects` screen now shows an empty-assignment notice instead of the previous sample project fallback.
- Knowledge ingestion and document generation project fields are now dropdowns, not free-text inputs. Admins select from all visible projects; registered users select only from assigned projects.

Current attributed queue creator draft state:

- Draft clones exist for upload and generation queue creation; the active production workflows have not been edited.
- The draft clones have now been converted to production-shaped inactive drafts with the production webhook paths:
  - `RETRIEVAL Job Queue Creator - SaaS - Attributed Draft` (`d8hZl2gQpuWjlwr3`) uses `POST /webhook/generate-qa-doc`.
  - `INGEST API Queue Creator - SaaS - Attributed Draft` (`iiR8d9v5oI8WzBPX`) uses the same upload path shape as the current production upload workflow.
- `supabase-service-role-key` has been assigned to the required service-role HTTP nodes in both draft clones.
- `Verify Supabase Auth User` intentionally uses the publishable key header and the incoming bearer token; it does not need the service-role credential.
- Draft smoke testing verified rows in `doc_ingestion_jobs`, `qa_jobs`, and `qa_job_metrics`.
- The ingestion attributed queue creator draft now also preserves the original queue-creator log side branch and writes `doc_ingestion_queuecreator_logs` through `Aggregate Job Data` -> `LOG` -> `Store LOGS in Supabase`.
- As of the current cutover test, the original production queue creators have been unpublished manually and the production-shaped attributed queue creator drafts have been published manually.
- Next validation is UI-driven ingestion/generation using the attributed queue creators and worker/full-clone path.

Current attributed worker draft state:

- Draft clones exist for the generation worker, generation agent, ingestion worker, and ingestion vectorization engine; the active production workflows have not been edited.
- The draft worker workflows have now been converted from draft-safe webhook wrappers to production-shaped inactive scheduled workers.
- The production-shaped worker drafts use the real `pending -> processing` lifecycle and select `project_id`, `requested_by`, `settings_version`, and `config_snapshot` from job rows.
- The worker drafts no longer use `draft_pending`, `draft_processing`, or `draft_completed`.
- The draft subworkflows preserve `requested_by`, `project_id`, `settings_version`, and `config_snapshot` into worker-side metric writes.
- `supabase-service-role-key` has been assigned to the required service-role HTTP Request nodes in the four attributed worker drafts.
- `fullIngestDraft01` was patched on 2026-05-08 after a registered-user smoke run failed at `Build Semantic Content` due to paired-item access against `When Executed by Another Workflow`. Runtime-config lookups now use first-item workflow trigger access instead of paired-item access, and `Build Semantic Content` has an error output to mark the ingestion job as failed rather than leaving it in `processing`.
- The failed smoke job `ING-260508-9NLIFO` was manually marked `failed` in `doc_ingestion_jobs` with diagnostic output so the UI no longer polls it as `processing`.
- A later registered-user UI ingestion smoke completed successfully for job `ING-260508-NAPAY5` on project `UISmoleTest`.
  - `doc_ingestion_jobs` contains `project_id`, `requested_by`, `settings_version`, original `input.files`, and completed `output.totalChunksStored = 1507`.
  - `qa_job_metrics` contains attributed `JOB_QUEUED` and `JOB_COMPLETED` rows with `project_id`, `requested_by`, `settings_version`, pipeline `ingestion`, and Chroma collection metadata.
  - `doc_ingestion_queuecreator_logs` contains the queue-creator log row for the job.
  - The existing `qops_projects` row was still `draft` after completion, which caused the UI `Existing Knowledge Bases` card to keep showing `Draft`.
  - `qops_projects.status` for `UISmoleTest` was manually corrected to `ready`, and `fullIngestDraft01` now patches the project to `ready` after `Update Job Status as Completed` and before the completion metric/log path.
- Ingestion completion logging was tightened after the same smoke run:
  - Existing `doc_ingestion_queuecreator_logs.log_type` for `ING-260508-NAPAY5` was corrected from `PROCESSING_STARTED` to `INGESTION_COMPLETED`.
  - `fullIngestDraft01` now updates `doc_ingestion_queuecreator_logs.log_type` to `INGESTION_COMPLETED` on future successful ingestion completions.
  - The project-ready patch now runs as a side branch from `Update Job Status as Completed`, so the completion metric/log path still receives the completed `doc_ingestion_jobs` row.
- Ingestion token and cost accounting has been added to `fullIngestDraft01` for future jobs:
  - Vision extraction captures OpenAI usage when n8n exposes it and estimates output tokens from image descriptions when usage is not exposed.
  - Embedding tokens are estimated from the text sent to the vector store using `embeddedCharacterCount / 4`.
  - Costs are written using current OpenAI standard pricing assumptions for `gpt-4o-mini` vision text tokens and `text-embedding-3-small` embeddings, with the full accounting stored in `doc_ingestion_jobs.output.tokenUsage` and `qa_job_metrics.metadata.token_usage`.
  - `qa_job_metrics` completion rows now populate `tokens_input`, `tokens_output`, `tokens_total`, `estimated_cost_usd`, `duration_ms`, `chunk_count`, and JSON-array `metadata.file_keys` for ingestion jobs.
- Generation completion logging has been tightened in `fullRetrievalD01`:
  - `LOG: Confluence Job Completed`, `LOG: Update Confluence Job Completed`, and `LOG: JIRA Job Completed` now write `word_count`, `tokens_input`, `tokens_output`, `tokens_total`, `estimated_cost_usd`, and `metadata.token_usage` on `JOB_COMPLETED` rows.
  - The pricing calculation itself remains the existing `gpt-4.1-mini` assumption and can be made model-aware later if runtime settings switch generation models.
  - `Log: Job Started` was patched after a UI smoke failure because it referenced downstream `Restore Job Context` data before that node had run. It now writes `JOB_STARTED` from its direct incoming execute-workflow payload, preserving attribution/runtime metadata.
  - The failed UI smoke job `GEN-260508-TG9PZJ` was marked `failed` with an attributed `JOB_FAILED` metric so the UI no longer remains in `processing`.
  - `Update Job Status as Completed`, `Mark Job Status as Completed`, and `Update Job Status as Completed1` were patched after `GEN-260508-TDBZ4L` published successfully to Confluence but left `qa_jobs.status=processing`. The status patch nodes now use stable upstream job ids instead of the previous HTTP metric POST output, which can be empty with `Prefer: return=minimal`.
  - The successful UI smoke job `GEN-260508-TDBZ4L` was corrected to `qa_jobs.status=completed` with Confluence `output.url`, `output.confluencePageId`, `output.settingsVersion`, and destination metadata.
  - Generation token/cost accounting now falls back to estimated usage when n8n does not expose provider token usage from the agent node. Future generation completions write `tokenUsage` into `qa_jobs.output` as well as `qa_job_metrics`.
  - `Quality Gate` must pass through `tokensInput`, `tokensOutput`, `tokensTotal`, `estimatedCostUsd`, and `tokenUsage` from `Validate AI Agent Output`; otherwise downstream Confluence/Jira completion branches fall back to zero even when the generator estimated usage correctly.
  - `GEN-260508-TDBZ4L` was backfilled with estimated token/cost values in `qa_job_metrics` and `qa_jobs.output.tokenUsage` so current analytics and the document result panel can display non-zero usage.
  - The document output panel now displays generated word count, token total, and estimated cost when the job-status response includes those fields.
  - The Jira/user-stories completion branch must carry job/context/token fields into `Code in JavaScript1` and have `LOG: JIRA Job Completed` plus `Update Job Status as Completed1` read those values from `$json`. Do not use `$('...').item` lookups after `Code in JavaScript`, `Merge9`, or `Code in JavaScript1`; n8n 2.19 can lose paired-item lineage there and fail with "Missing pairedItem data".
  - `LOG: JIRA Job Completed` must not feed `Update Job Status as Completed1`; both nodes should run directly from `Code in JavaScript1`. The metric insert uses `Prefer: return=minimal`, so chaining the status patch after it can make `$json.stories` / `$json.epics` unavailable and produce invalid JSON such as `"stories": ,`. Use `JSON.stringify($json.stories || [])` and `JSON.stringify($json.epics || [])` in the status patch body.
- Residual ingestion hardening items from the successful smoke:
  - Backfill token/cost values for old ingestion jobs only if historical accuracy is required; the new accounting applies to future completions.
  - Review n8n timestamp expressions on older ingestion completions if historical `updated_at` ordering matters; the new completion patch uses `new Date().toISOString()`.
- Isolated smoke tests passed using `draft_pending` jobs:
  - `GEN-DRAFT-260507-PHASE6` completed through the generation worker draft and wrote attributed `JOB_STARTED`.
  - `ING-DRAFT-260507-PHASE6` completed through the ingestion worker draft and wrote attributed `JOB_COMPLETED`.
- The fixed Phase 6 smoke rows and metrics were cleaned up after verification.
- The attributed worker drafts remain inactive after smoke testing.
- The earlier `RETRIEVAL Document Generator AI Agent - SaaS - Attributed Draft` and `Multimodal Knowledge Ingestion & Vectorization Engine - Attributed Draft` remain lightweight attribution harnesses only.
- True full inactive clones now exist for the two large downstream subworkflows:
  - `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft` (`fullRetrievalD01`)
  - `Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft` (`fullIngestDraft01`)
- The full clones now have the first real attribution/runtime-config updates and remain inactive.
- The production-shaped worker drafts now call the full clone drafts.
- As of the current cutover test, the original production workers have been unpublished manually and the production-shaped attributed workers plus full clone drafts have been published manually.
- The earlier pinned wrapper smoke tests passed before the production-shape conversion. The next validation should be an integrated UI smoke with acceptable external side effects.

### Node-by-node replacement review

This section records the production-to-draft/full-clone differences that matter for deciding whether to replace the current production workflows. The production workflows listed as originals are still active and were not edited by this pass.

#### `RETRIEVAL Job Queue Creator - SaaS` -> `RETRIEVAL Job Queue Creator - SaaS - Attributed Draft`

Original workflow: `RETRIEVAL Job Queue Creator - SaaS` (`sbUy9luTFnRJ52El`), active. Draft workflow: `RETRIEVAL Job Queue Creator - SaaS - Attributed Draft` (`d8hZl2gQpuWjlwr3`), inactive.

| Original node | Draft node | Difference made | Replacement impact |
|---|---|---|---|
| `Webhook` | `POST /generate-qa-doc` | Draft now uses the production webhook path `generate-qa-doc` while remaining inactive. | Ready for cutover without UI changes. Do not publish while the original production workflow is still active on the same path. |
| `Generate Job ID` | `Generate Job ID` | Keeps the `GEN-YYMMDD-XXXXXX` id format and stores the full request body in `input`; additionally requires a Supabase bearer token, extracts `projectId`, and defaults `environment` to `local`. | `qa_jobs.input` remains compatible. Anonymous generation calls would be rejected after replacement. |
| None | `Verify Supabase Auth User` | New Supabase Auth `/auth/v1/user` verification using publishable key plus incoming bearer token. | Establishes the real logged-in user without exposing the service-role key. |
| None | `Fetch Q-Ops User Profile` | Resolves the verified auth user to an active `qops_users` row. | Provides the internal `requested_by` id used by analytics. |
| None | `Prepare Runtime Request` | Builds `qops_resolve_runtime_config` input with environment, project id, pipeline `generation`, and Q-Ops user id. | Enables runtime snapshots and user/project attribution. |
| None | `Resolve Runtime Config` | Calls Supabase RPC `qops_resolve_runtime_config`. | Captures safe runtime settings for the job. |
| None | `Combine Job And Runtime` | Normalizes `settingsVersion` and `configSnapshot` from the RPC response. | Keeps insert/metric nodes simple and consistent. |
| `Insert JobID into Supabase DB` | `Insert JobID into Supabase DB` | Still inserts `job_id`, `status=pending`, and original `input`; additionally writes `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. | Existing polling remains compatible; new nullable fields power scoped analytics. |
| `LOG: Job Queued` | `LOG: Job Queued` | Still writes `JOB_QUEUED`; additionally writes top-level `project_id`/`requested_by` and metadata `settings_version`, `project_id`, `requested_by`, and `environment`. | Registered-user analytics can include queued generation jobs. |
| `Respond to Webhook` | `Respond to Webhook` | Response remains `{ "jobId": "GEN-...", "status": "queued" }`. | UI response contract is preserved. |

#### `INGEST API Queue Creator - SaaS` -> `INGEST API Queue Creator - SaaS - Attributed Draft`

Original workflow: `INGEST API Queue Creator - SaaS` (`pjz9L77szB9DDsN1`), active. Draft workflow: `INGEST API Queue Creator - SaaS - Attributed Draft` (`iiR8d9v5oI8WzBPX`), inactive.

| Original node | Draft node | Difference made | Replacement impact |
|---|---|---|---|
| `Upload Test Documents` | `Upload Test Documents` | Draft now uses the same upload webhook path shape as the current production upload workflow while remaining inactive. | Ready for cutover without UI changes. Do not publish while the original production workflow is still active on the same path. |
| `Generate Job ID` | `Generate Job ID` | Keeps the `ING-YYMMDD-XXXXXX` id format and `projectName`; additionally requires bearer auth, extracts `projectId`, defaults `environment`, and carries the token forward. | Job id and response behavior remain compatible; upload becomes auth-aware after replacement. |
| `Split Binary Files for Supabase Upload` | `Split Binary Files for Supabase Upload` | Still emits one item per binary file; additionally carries `projectId`, `environment`, and bearer token. | File splitting is preserved while attribution survives the split. |
| `Upload Files to Supabase Storage` | `Upload Files to Supabase Storage` | Still uploads to `uploaded-project-docs` with the same object layout. | No storage-path behavior change in the draft. |
| `Merge` + `Build File URL Map` | `Build File URL Map` | Draft simplifies the merge path and builds the same public file URL map; additionally preserves `projectId`, `environment`, and token. | `input.files` shape is preserved. |
| None | `Verify Supabase Auth User` | Verifies the incoming Supabase bearer token. | Prevents unattributed anonymous ingestion jobs after replacement. |
| None | `Fetch Q-Ops User Profile` | Resolves the active `qops_users` row. | Provides internal `requested_by` for job rows and metrics. |
| None | `Prepare Runtime Request` | Builds the ingestion runtime-config request. | Enables settings snapshot for ingestion jobs. |
| None | `Resolve Runtime Config` | Calls `qops_resolve_runtime_config`. | Captures safe runtime config for the downstream ingestion worker. |
| None | `Combine Job And Runtime` | Attaches `settingsVersion` and `configSnapshot` to the job payload. | Makes job insert and metrics insert attribution-aware. |
| `Insert JobID into Supabase DB` | `Insert JobID into Supabase DB` | Still inserts `job_id`, `status=pending`, and `input.projectName/input.files`; additionally writes `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. | Existing ingestion polling remains compatible. |
| `LOG: Job Queued` | `LOG: Job Queued` | Still writes ingestion `JOB_QUEUED`; additionally writes top-level `project_id`/`requested_by` and metadata `settings_version`, `project_id`, `requested_by`, and `environment`. | Registered-user analytics can include queued ingestion jobs. |
| `Aggregate Job Data`, `LOG`, `Store LOGS in Supabase` | `Aggregate Job Data`, `LOG`, `Store LOGS in Supabase` | The original queue-creator log side branch has been restored in the attributed draft and writes `doc_ingestion_queuecreator_logs` with `job_id`, `project_name`, `total_files`, `file_keys`, `log_type`, and `created_at`. | The operational queue-creator log contract is preserved. |
| `Respond to Webhook` | `Respond to Webhook` | Response remains `{ "jobId": "ING-...", "status": "queued" }`. | UI response contract is preserved. |

#### `RETRIEVAL Worker Engine (Queue Processor) - Saas` -> production-shaped attributed draft

Original workflow: `RETRIEVAL Worker Engine (Queue Processor) - Saas` (`wvfvdSZjyRSEhy7Z`), active. Production-shaped draft: `RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft` (`ew9RdPEvMAq5P6t3`), inactive.

| Original behavior/node area | Draft node | Difference made | Replacement impact |
|---|---|---|---|
| Production worker trigger | `Schedule Trigger` | Draft now uses the same 20-second scheduled worker shape as production. | Ready for production-style worker validation; remains inactive until cutover. |
| Pending job lookup | `Get Pending Jobs` | Queries oldest `qa_jobs.status = pending` and now selects `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. | Preserves production polling behavior and adds attribution/runtime columns. |
| Pending guard | `Pending Job Exists?` | Same IF guard shape as production. | Avoids processing when no pending row exists. |
| Locking | `Lock Pending Job picked for processing` | Keeps guarded `pending -> processing` patch. | Production lifecycle is preserved. |
| Lock success guard | `Status = Processing Updated?` | Same IF guard shape as production. | Prevents duplicate processing if another worker already locked the row. |
| Job normalization | `Prepare Job Input` | Builds the execute-workflow payload from `qa_jobs.input` plus `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. | Full generator clone receives both legacy job fields and attribution/runtime context. |
| Subworkflow call | `Call Full Generator Clone Draft` | Calls `fullRetrievalD01` and waits for completion. | Wired to the true full clone, not the earlier lightweight harness. |
| Completion update | None in worker draft | Same production pattern: the downstream generator subworkflow owns completed/failed job status updates. | Production status ownership is preserved. |

#### `INGEST Worker Engine (Queue Processor)` -> production-shaped attributed draft

Original workflow: `INGEST Worker Engine (Queue Processor)` (`iKOec9hKQmR2KgHs`), active. Production-shaped draft: `INGEST Worker Engine (Queue Processor) - Attributed Draft` (`mlelxUdlNcoBIyru`), inactive.

| Original behavior/node area | Draft node | Difference made | Replacement impact |
|---|---|---|---|
| Production worker trigger | `Schedule Trigger` | Draft now uses the same 20-second scheduled worker shape as production. | Ready for production-style worker validation; remains inactive until cutover. |
| Pending job lookup | `Get Pending Jobs` | Queries oldest `doc_ingestion_jobs.status = pending` and now selects `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. | Preserves production polling behavior and adds attribution/runtime columns. |
| Pending guard | `Pending Job Exists?` | Same IF guard shape as production. | Avoids processing when no pending row exists. |
| Locking | `Lock Pending Job picked for processing` | Keeps guarded `pending -> processing` patch. | Production lifecycle is preserved. |
| Lock success guard | `Status = Processing Updated?` | Same IF guard shape as production. | Prevents duplicate processing if another worker already locked the row. |
| Job normalization | `Prepare Job Input` | Rebuilds vectorization payload from `input.projectName`, `input.files`, and attribution/runtime columns. | Preserves the full ingestion clone's required input contract. |
| Processing log | `LOG` -> `Store LOGS in Supabase` | Preserves the production `PROCESSING_STARTED` update into `doc_ingestion_queuecreator_logs`. | Queuecreator log contract is preserved during worker processing. |
| File fan-out | `Convert Files Object -> Array` | Preserves URL-to-file item expansion and now carries attribution/runtime fields on every file item. | File download behavior remains compatible while attribution survives fan-out. |
| Binary recombine | `Convert ALL binaries inside ONE item` | Preserves one combined binary item for the vectorization subworkflow and now carries attribution/runtime fields. | Full vectorization clone receives files plus attribution/runtime context. |
| Subworkflow call | `Call Full Vectorization Clone Draft` | Calls `fullIngestDraft01` and waits for completion. | Wired to the true full vectorization clone, not the earlier lightweight harness. |
| Completion update | None in worker draft | Same production pattern: the downstream vectorization subworkflow owns completed/failed job status updates. | Production status ownership is preserved. |

#### `RETRIEVAL Document Generator AI Agent - SaaS` -> full clone draft

Original workflow: `RETRIEVAL Document Generator AI Agent - SaaS` (`0G3qlenjAeBnHDTr`), active. Full clone draft: `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft` (`fullRetrievalD01`), inactive.

| Original node | Full clone draft node | Difference made | Replacement impact |
|---|---|---|---|
| `When Executed by Another Workflow` | Same | Trigger shape is unchanged. | Existing execute-workflow invocation remains compatible if old fields are passed; attribution fields are optional. |
| `Restore Job Context` | Same | Keeps existing job fields; additionally normalizes `projectId`, `requestedBy`, `settingsVersion`, `configSnapshot`, and `environmentKey` from camelCase or snake_case input. | Central attribution handoff. Backward compatible because missing fields fall back to `null` or defaults. |
| `Prompt Library` | Same | Existing prompt logic is preserved; output now carries attribution/runtime fields forward. | Prompt contract remains unchanged. |
| `OpenAI Chat Model` | Same | Model changes from hardcoded `gpt-4.1-mini` to `configSnapshot.models.generationModel || 'gpt-4.1-mini'`; max tokens from hardcoded `8000` to `configSnapshot.models.maxTokens || 8000`. | Defaults remain the same; runtime config can override model/token ceiling. |
| `Chroma Vector Store` | Same | Collection changes from hardcoded `qa-chunks-batches` to `configSnapshot.chroma.collection || 'qa-chunks-batches'`; `topK` from hardcoded `20` to `configSnapshot.chroma.topK || 20`. | Defaults remain the same; runtime config can change collection/topK. |
| `Convert md -> DOCX & Confluence Format` | Same/disconnected for Confluence path | Converter URL is runtime-configurable from `configSnapshot.microservices.converterUrl` where supported. Keep this node off the Confluence critical path unless DOCX output is explicitly required; route Confluence jobs directly into `Convert MD -> Confluence Formatted HTML`. | A slow or stopped converter service no longer blocks Confluence page publishing. |
| `Validate AI Agent Output` | Same | No intentional behavioral change. | Token/cost/word extraction remains production-equivalent. |
| `Quality Gate` | Same | No intentional behavioral change. | Quality checks remain production-equivalent. |
| `Log: Job Started` | Same | Adds top-level `project_id` and `requested_by`; metadata includes `settings_version`, `environment`, configured model, Chroma collection, and attribution fields. | Fixes the unattributed worker-side `JOB_STARTED` gap. |
| `LOG: Quality Gate Passed` | Same | Adds attribution/runtime metadata while preserving word/token/cost fields. | User-scoped analytics can include quality pass metrics. |
| `LOG: Quality Gate Failed` | Same | Adds attribution/runtime metadata while preserving error and word-count data. | User-scoped analytics can include quality failures. |
| `LOG: Confluence Job Completed` | Same | Adds attribution/runtime metadata and now writes `word_count`, `tokens_input`, `tokens_output`, `tokens_total`, `estimated_cost_usd`, and `metadata.token_usage` while preserving page id/url and duration data. | Completion metrics become user/project attributable and feed generation token/cost analytics. |
| `LOG: Update Confluence Job Completed` | Same | Adds the same attribution/runtime/token/cost metadata for update-completed path. | Updated-page completions become user/project attributable and feed generation token/cost analytics. |
| `LOG: JIRA Job Completed` | Same | Adds attribution/runtime metadata and now writes `word_count`, `tokens_input`, `tokens_output`, `tokens_total`, `estimated_cost_usd`, and `metadata.token_usage` while preserving story/epic counts. | Jira generation completions become user/project attributable and feed generation token/cost analytics. |
| `LOG: Confluence Job Failed` | Same | Adds attribution/runtime metadata while preserving error and duration data. | Failed Confluence jobs become user/project attributable. |
| `Handle: Generator Agent Failed` | Same | Existing error-shaping logic is preserved. | No functional contract change. |
| `LOG: Generator Agent Failed` | Same | Adds attribution/runtime metadata while preserving generator-agent error fields. | Agent failures become user/project attributable. |
| `Update Job Status: Generator Agent Failed` | Same | No attribution write added here; still patches `qa_jobs.status=failed` and output error info. | Job status behavior remains compatible. |
| Completion status patch nodes | Same | Existing completion patch behavior is preserved, with completed output enriched where supported with `settingsVersion` and destination data. | Core `output.url`, `output.epics`, and `output.stories` shapes stay available; extra metadata is additive. |
| Atlassian/Jira publishing/search/create/update nodes | Same | No broad publishing behavior replacement was made in this pass. | Existing publishing behavior is intentionally preserved; runtime publishing URL/project replacement remains a later careful review item. |

#### `Multimodal Knowledge Ingestion & Vectorization Engine` -> full clone draft

Original workflow: `Multimodal Knowledge Ingestion & Vectorization Engine` (`n0fvS28StF5iMZvG`), active. Full clone draft: `Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft` (`fullIngestDraft01`), inactive.

| Original node | Full clone draft node | Difference made | Replacement impact |
|---|---|---|---|
| `When Executed by Another Workflow` | Same | Trigger shape is unchanged. | Existing execute-workflow invocation remains compatible. |
| `Rename Binary File Keys` | Same | No intentional behavioral change. | File binary normalization remains unchanged. |
| `Extract Text + Image` | Same | URL changes from hardcoded `http://127.0.0.1:8000/process-document` to runtime `documentProcessorUrl` with the same default fallback; form body additionally sends `projectId`, `requestedBy`, and `settingsVersion`. | Defaults keep current local processor behavior; runtime config can override the processor. |
| `Split images for Vision Extraction` | Same | No intentional behavioral change. | Vision image splitting remains unchanged. |
| `Prepare Vision Payload` | Same | No intentional behavioral change. | Vision request payload remains unchanged. |
| `Vision Extraction` | Same | No intentional model/config change. | Vision behavior remains production-equivalent. |
| `Extract Vision Response` | Same | No intentional behavioral change. | Vision response mapping remains unchanged. |
| `Rebuild Document With Vision Extracted Text` | Same | No intentional behavioral change. | Rebuild logic remains unchanged. |
| `Build Semantic Content` | Same | Preserves semantic content output and adds `projectId`, `requestedBy`, `settingsVersion`, `configSnapshot`, and `environmentKey`. | Attribution/runtime context begins flowing without changing semantic content text. |
| `Clean Emojis, # etc` | Same | No intentional behavioral change. | Text cleanup remains unchanged. |
| `Chunking Raw Data` | Same | Existing chunking behavior is preserved; chunk metadata additionally includes `projectId`, `requestedBy`, `settingsVersion`, `environment`, and `chromaCollection`. | Chroma metadata becomes attribution-aware while existing metadata remains. |
| `Default Data Loader` | Same | Metadata values now include `projectId`, `requestedBy`, `settingsVersion`, `environment`, and `chromaCollection`. | Vector documents can carry attribution metadata. |
| `Chroma Vector Store` | Same | Collection changes from hardcoded `qa-chunks-batches` to runtime configured collection with the same default fallback. | Defaults remain compatible; runtime config can change vector destination. |
| `Update Job Status as Completed` | Same | Keeps `status=completed` and `output.totalChunksStored`; additionally adds `settingsVersion` and destination `{ type: "chroma", collection }`. | Existing UI polling remains compatible; metadata is additive. |
| `Extract Vision Response` | Same | Extracts image descriptions as before; additionally captures OpenAI vision token usage where available and estimates output tokens from image text when usage is unavailable. | Enables ingestion cost analytics without changing document extraction output. |
| `Rebuild Document With Vision Extracted Text` | Same | Rebuilds image descriptions as before; additionally aggregates vision token/cost fields per source document. | Preserves semantic rebuild behavior while carrying token accounting forward. |
| `Build Semantic Content` | Same | Preserves semantic content output and now carries vision token/cost fields. | Keeps RAG content unchanged while enabling downstream accounting. |
| `Count Stored Chunks` | Same | Still counts stored chunks; additionally estimates embedding tokens from chunk text length, calculates embedding cost, combines it with vision usage, and emits `tokenUsage`. | Feeds ingestion token/cost analytics using existing `qa_job_metrics` columns. |
| `Update Job Status as Completed` | Same | Keeps `status=completed` and `output.totalChunksStored`; additionally writes `output.tokenUsage`, `settingsVersion`, and destination metadata. | Existing UI polling remains compatible; token/cost details are additive. |
| None | `Update Project Status as Ready` | New side-branch patch that sets the matching `qops_projects.status` to `ready` after successful ingestion. It no longer sits between job completion and metric logging. | Fixes the UI card status contract for `Existing Knowledge Bases` while preserving the completed job row for logs/metrics. Assign `supabase-service-role-key` to this new HTTP Request node after import if n8n does not preserve credentials. |
| `LOG` | Same | Completion log shaping now carries attribution/runtime fields plus `durationMs`, token totals, cost, and full `tokenUsage`. | Prepares final metric insert to write attribution and ingestion cost analytics. |
| `LOG: Job Completed` | Same | Adds top-level `project_id`/`requested_by`; writes `duration_ms`, `tokens_input`, `tokens_output`, `tokens_total`, `estimated_cost_usd`, `chunk_count`, and metadata with `settings_version`, `project_id`, `requested_by`, `environment`, `chroma_collection`, `file_keys`, and `token_usage`. | Fixes worker-side ingestion completion attribution and enables registered-user token/cost analytics. |
| `Store LOGS in Supabase` | Same | Still patches `doc_ingestion_queuecreator_logs`; now sets `log_type=INGESTION_COMPLETED` and `updated_at` on successful worker completion. | Queuecreator log state now reflects completion instead of remaining at `PROCESSING_STARTED`. |
| `Handle Vision Errors`, `Update Job Status as Failed`, `Handle Data Loader Errors` | Same | No broad attribution-specific failure-path rewrite in this pass. | Failure handling remains close to production; a later hardening pass can add attribution to every failure path if needed. |

#### Earlier lightweight attribution harnesses

The earlier workflows below were useful for proving attribution writes but are not replacement candidates for the production downstream workers:

- `RETRIEVAL Document Generator AI Agent - SaaS - Attributed Draft` (`Nt316KsNOfbUutyc`)
- `Multimodal Knowledge Ingestion & Vectorization Engine - Attributed Draft` (`4HS0hptQYfJsdUIx`)

They are superseded by the true full clone drafts `fullRetrievalD01` and `fullIngestDraft01`. Keep them inactive or archive them later after the full clone smoke path is accepted.

### Remaining after this pass

- Existing auth/RBAC, invite, forgot-password, settings write, repository read/write, artifact reprocess, and registered-user restriction smoke tests are complete.
- Add dedicated credential-backed read-only probes later:
  - Jira project GET using `Jira SW Cloud account`
  - Confluence space GET using `Confluence`
  - OpenAI low-cost credential/model validation, if acceptable from a cost perspective
- Update production ingestion/generation workflows later to resolve runtime config and write `project_id`, `requested_by`, `settings_version`, and `config_snapshot`. This was intentionally not changed in this pass.
- Add user-scoped analytics with a staged, non-breaking migration:
  - Phase 1: Add nullable attribution columns to `qa_job_metrics` such as `requested_by uuid` and `project_id text`; keep existing workflows compatible. Completed on 2026-05-07.
  - Phase 2: Make `GET /webhook/analytics-summary` auth-aware by verifying the Supabase bearer token and resolving the caller from `qops_users`. Completed and smoke-tested on 2026-05-07.
  - Phase 3: For registered users, filter analytics and recent backend jobs to the caller's own `requested_by` jobs. For admins, keep global analytics by default and optionally add user/project filters later. Completed and smoke-tested on 2026-05-07.
  - Phase 4: Clone the active upload and generation queue creator workflows as drafts before modifying them; do not edit the active production workflows directly. Draft clones created on 2026-05-07; active production workflows remain untouched.
  - Phase 5: Update only the cloned queue creator drafts first so new jobs and metric rows write `requested_by`, `project_id`, `settings_version`, and `config_snapshot` while preserving the existing `input` and response shapes. Implemented and smoke-tested in draft clones on 2026-05-07.
  - Phase 6: Update cloned worker drafts next so worker-side metrics also preserve attribution before replacing any production queue creator. Lightweight attribution harnesses were created and isolated smoke-tested on 2026-05-07; true full inactive clones of the generator and vectorization subworkflows were then created on 2026-05-07. Production workers remain untouched.
  - Phase 7: True full worker/subworkflow clones now have attribution/runtime-config updates, and the draft worker wrappers now call those full clones. Pinned wrapper smoke tests passed on 2026-05-07 without live external side effects. Remaining work is a carefully scoped live draft smoke and then a queue-creator plus worker-clone smoke before publishing production workflows one at a time.
- Project assignment editing has been implemented in the Users And Roles UI and the new `Q-Ops Agent User Project Assignments API` workflow (`SqF2eOhsuBrtyCtD`). Before testing from UI, assign `supabase-service-role-key` to its HTTP Request nodes and publish the workflow.
- Consider adding a custom SMTP provider later to avoid Supabase built-in SMTP limits during repeated invite/password-reset testing.
- Replace estimated generation token/cost accounting with actual provider-reported OpenAI usage later. The current generation workflow estimates usage when the n8n LangChain Agent node does not expose token usage in its output; billing-grade analytics should capture actual usage from a direct OpenAI response or a reliable n8n usage/callback output.
- Add knowledge-base/chunk versioning before relying heavily on repeated ingestion plus generation updates. Each ingestion run should stamp Chroma chunks with an active `knowledge_base_version` or `ingestion_job_id`, and generation retrieval should filter to the selected active version so old chunks do not inflate token usage or compete with newly ingested context. Keep older versions available for rollback/archive, but exclude them from default generation retrieval.
- Supabase still reports RLS disabled on legacy tables: `qa_jobs`, `doc_ingestion_jobs`, `doc_ingestion_queuecreator_logs`, and `qa_job_metrics`. This is separate from users/RBAC, but remains a security item to handle carefully later with proper policies.
- Supabase performance advisor still reports the new `qa_job_metrics` attribution indexes as unused. This is expected until new ingestion/generation jobs start writing `requested_by` and `project_id`, and enough user/project-scoped analytics queries run against those attributed rows.
- Audit logs and notification display are now user-specific in the UI:
  - Admin users continue to see workspace-wide audit events and notifications.
  - Registered users see audit events tied to their assigned projects or their own actor identity only.
  - Registered users see notifications tied to their assigned projects, their own local user actions, and the welcome notification only.
  - Mark-all-read in the notification drawer now only marks the currently visible scoped notifications.
- Updated the `Q-Ops Agent Audit Events API` draft (`lyyrP14iTYacuEFv`) so `GET /webhook/audit-events` verifies the Supabase bearer token, resolves the caller from `qops_users`, loads project memberships, and returns admin workspace scope or registered-user self/project scope. Before publishing the updated draft, assign `supabase-service-role-key` to its service-role HTTP Request nodes: `Fetch Q-Ops User Profile`, `Fetch Current User Project Memberships`, `Fetch Q-Ops Audit Events`, and `Fetch QA Job Metrics For Audit`.

## Current UI To Backend Map

| UI operation | Frontend function | n8n webhook/workflow | Supabase writes | Supabase reads | Current contract |
|---|---|---|---|---|---|
| Upload knowledge base artifacts | `uploadKnowledgeBase` in `src/lib/api.ts` | `POST /webhook/upload-test-artifacts` in `INGEST API Queue Creator - SaaS.json` | `doc_ingestion_jobs`, `doc_ingestion_queuecreator_logs`, `qa_job_metrics` | Supabase Auth `/user`, `qops_users`, runtime config RPC in attributed queue creator | Authenticated multipart with `projectId`, `projectName`, `environment`, `brd`, `frd`, `hld`, `lld`, `transcript`, repeated `image`; returns `{ "jobId": "...", "status": "queued" }` |
| Poll ingestion job | `fetchKbStatus` | `GET /webhook/job-status?jobId=...` in `INGEST Workflow-Status-Check.json` | None | `doc_ingestion_jobs` | Returns `{ "jobId": "...", "status": "pending|processing|completed|failed|not_found" }` |
| Process ingestion queue | n8n schedule | `INGEST Worker Engine (Queue Processor).json` and `Multimodal Knowledge Ingestion & Vectorization Engine.json` | `doc_ingestion_jobs`, `doc_ingestion_queuecreator_logs`, `qa_job_metrics`, Chroma collection | `doc_ingestion_jobs`, Supabase Storage object URLs | Reads oldest `pending`, locks to `processing`, downloads files, stores chunks, marks completed/failed |
| Generate QA document | `generateDocument` | `POST /webhook/generate-qa-doc` in `RETRIEVAL Job Queue Creator - SaaS.json` | `qa_jobs`, `qa_job_metrics` | Supabase Auth `/user`, `qops_users`, runtime config RPC in attributed queue creator | Authenticated JSON with `projectId`, `projectName`, `documentType`, `productOwner`, `environment`; returns `{ "jobId": "...", "status": "queued" }` |
| Poll generation job | `fetchDocStatus` | `GET /webhook/job-status-retrieve?jobId=...` in `RETRIEVE Workflow-status-check.json` | None | `qa_jobs` | Returns `{ "jobId": "...", "status": "...", "output": null|object }` |
| Generate/publish output | n8n schedule | `RETRIEVAL Worker Engine (Queue Processor) - Saas.json` and `RETRIEVAL Document Generator AI Agent - SaaS.json` | `qa_jobs`, `qa_job_metrics`, Confluence or Jira | `qa_jobs`, Chroma collection | Reads oldest `pending`, locks to `processing`, generates, quality-checks, publishes, marks completed/failed |
| Test backend connection / system status | `fetchHealthStatus` | `GET /webhook/health` in `Q-Ops-Agent-Health-Status.json` | None today; should write `qops_connection_test_results` for admin-triggered tests | `qa_job_metrics`, Supabase Storage, Chroma, microservices | Returns aggregate `status`, `services`, `webhooks`, `integrations` |
| Infrastructure load | `fetchInfrastructureLoad` | Draft auth-aware `GET /webhook/infrastructure-load` in `Q-Ops Agent Infrastructure Load API` | None | Supabase Auth `/user`, `qops_users`, `qops_project_members`, `qa_jobs`, `doc_ingestion_jobs`, `qa_job_metrics`, `qops_connection_test_results` | Admins receive workspace telemetry; registered users receive assigned-project/self telemetry; UI uses local session fallback if unavailable |
| Analytics | `fetchAnalyticsSummary` | `GET /webhook/analytics-summary` in `Q-Ops-Agent-Analytics-Summary.json` | None | RPCs over `qa_job_metrics` | Returns `overview`, `byDocumentType`, `failureRate`, `recentJobs`, `meta` |
| Project repository | `fetchProjects`, `createProjectRecord` | Draft `GET/POST /webhook/projects` in `Q-Ops Agent Projects API - Wired` | `qops_projects`, `qops_audit_events` | `qops_projects` | UI now attempts endpoint directly; falls back to localStorage if unavailable |
| Artifact repository | `fetchArtifacts`, `reprocessArtifact` | Published `GET /webhook/artifacts` in `Q-Ops Agent Artifacts API`; auth-aware draft `POST /webhook/artifacts/reprocess` in `Q-Ops Agent Artifact Reprocess API` | Reprocess writes attributed `doc_ingestion_jobs` and `qa_job_metrics` | Supabase Auth `/user`, `qops_users`, `qops_project_members`, `doc_ingestion_jobs.input.files` | Reprocess uses `body.artifactId`; UI sends bearer auth, allows failed artifacts only, and ignores responses without `jobId` |
| Generated document repository | `fetchGeneratedDocuments` | Draft `GET /webhook/generated-documents` in `Q-Ops Agent Generated Documents API` | None | `qa_jobs` | UI expects camelCase document records |
| Audit log | `fetchAuditEvents` | Draft auth-aware `GET /webhook/audit-events` in `Q-Ops Agent Audit Events API` | Project workflow writes `qops_audit_events`; job workflows already write `qa_job_metrics` | Supabase Auth `/user`, `qops_users`, `qops_project_members`, `qops_audit_events`, and `qa_job_metrics` | UI sends the bearer token; admins receive workspace audit events, registered users receive assigned-project/self audit events only; UI expects actor/action/project/entity/status/timestamp/details |
| Auth login | `signInWithPassword` in `src/lib/auth.ts` | Supabase Auth REST `POST /auth/v1/token?grant_type=password` | Supabase Auth session only | Supabase Auth | Browser uses only the Supabase publishable key; service role is never exposed |
| Invite accept / set password | `/auth/callback`, `storeSessionFromInviteCallback`, `acceptUserInvite`, `updateCurrentUserPassword` | Draft `POST /webhook/users/accept-invite` in `Q-Ops Agent User Accept Invite API` | Supabase Auth password update, `qops_users`, `qops_audit_events` | Supabase Auth `/user`, `qops_users` | Consumes Supabase invite session from URL hash, activates pending Q-Ops profile, then sets password |
| Forgot password / reset password | `requestPasswordReset`, `/auth/callback`, `updateCurrentUserPassword`, `auditPasswordReset` | Supabase Auth REST `POST /auth/v1/recover`; draft `POST /webhook/users/password-reset-audit` in `Q-Ops Agent User Password Reset Audit API` | Supabase Auth password update, optional `qops_audit_events` audit row | Supabase Auth `/user`, `qops_users` | Recovery callback uses `type=recovery`, sets the new password, then writes `PASSWORD_RESET_COMPLETED` after workflow publish |
| Current user profile | `fetchCurrentUser` in `src/lib/api.ts` | Draft `GET /webhook/me` in `Q-Ops Agent Auth Me API` | None | Supabase Auth `/user`, `qops_users`, `qops_project_members` | Verifies bearer token and returns active Q-Ops role profile plus assigned project IDs/roles for registered users |
| Users and roles read | `fetchUsers` in `src/lib/api.ts` | Draft `GET /webhook/users` in `Q-Ops Agent Users API` | None | Supabase Auth `/user`, `qops_users`, `qops_project_members` | Requires active admin in `qops_users`; returns sanitized users for Settings UI |
| User invite | `inviteUser` in `src/lib/api.ts` | Draft `POST /webhook/users/invite` in `Q-Ops Agent User Invite API` | Supabase Auth invite, `qops_users`, `qops_audit_events` | Supabase Auth `/user`, `qops_users` current admin profile | Requires active admin JWT; creates pending invite profile and audit event |
| User role/status update | `updateUser` in `src/lib/api.ts` | Draft `PATCH /webhook/users/update` in `Q-Ops Agent User Update API` | `qops_users`, `qops_audit_events` | Supabase Auth `/user`, `qops_users` current admin profile | Requires active admin JWT; updates allowed profile, role, and status fields |
| User project assignments | `updateUserProjectAssignments` in `src/lib/api.ts` and Admin Users And Roles UI | Draft `PATCH /webhook/users/project-assignments` in `Q-Ops Agent User Project Assignments API` | `qops_project_members`, `qops_audit_events` | Supabase Auth `/user`, `qops_users`, `qops_projects` | Requires active admin JWT; replaces a registered user's assigned projects with `projectId` plus `owner|editor|viewer` role rows |
| Settings read | `fetchSettings` in `src/lib/api.ts` and Admin Settings UI | Published `GET /webhook/settings` in `Q-Ops Agent Settings API` | None | `qops_environment_settings`, `qops_integration_settings`, `qops_connection_test_results` | Returns sanitized environment, integration, and latest connection-test data |
| Settings update | `patchSettings` in `src/lib/api.ts` and Admin Settings UI | Published `PATCH /webhook/settings` in `Q-Ops Agent Settings Write API` | `qops_environment_settings` or `qops_integration_settings`, `qops_audit_events` | `qops_integration_settings` for version increment | Updates allowed non-secret fields only; UI currently saves safe Jira/Confluence routing config and never sends raw secrets |
| Integration status | Not wired yet | Draft `GET /webhook/integrations/status` in `Q-Ops Agent Integrations Status API` | None | `qops_integration_settings`, `qops_connection_test_results` | Returns flattened integration status records |
| Integration test | `testIntegration` in `src/lib/api.ts` and Admin Settings UI | Published `POST /webhook/integrations/test` in `Q-Ops Agent Integration Test API` | `qops_connection_test_results`, `qops_integration_settings` test metadata | `qops_integration_settings`, health workflow snapshot | Body uses `integrationKey`; live probes are active for Supabase, ChromaDB, n8n, and local microservices |
| Integration test all | `testAllIntegrations` in `src/lib/api.ts` and Admin Settings UI | Published `POST /webhook/integrations/test-all` in `Q-Ops Agent Integrations Test All API` | `qops_connection_test_results` | `qops_integration_settings`, health workflow snapshot | Live probes are active for Supabase, ChromaDB, n8n, and local microservices; Jira/Confluence/OpenAI remain explicit `not_configured` until dedicated credential probes are added |

## New Supabase Objects Available

Use these tables for the persona Settings UI and runtime config:

- `qops_users`
- `qops_project_members`
- `qops_projects`
- `qops_environment_settings`
- `qops_integration_settings`
- `qops_project_integration_overrides`
- `qops_connection_test_results`
- `qops_user_preferences`
- `qops_audit_events`

Existing job tables now also have:

- `doc_ingestion_jobs.project_id`
- `doc_ingestion_jobs.requested_by`
- `doc_ingestion_jobs.settings_version`
- `doc_ingestion_jobs.config_snapshot`
- `qa_jobs.project_id`
- `qa_jobs.requested_by`
- `qa_jobs.settings_version`
- `qa_jobs.config_snapshot`

Runtime config RPC:

```text
POST {supabaseProjectUrl}/rest/v1/rpc/qops_resolve_runtime_config
```

Request body:

```json
{
  "p_environment_key": "local",
  "p_project_id": "optional-project-id",
  "p_pipeline": "ingestion",
  "p_requested_by": null
}
```

Response shape:

```json
{
  "settingsVersion": 1,
  "configSnapshot": {
    "environment": {},
    "supabase": {},
    "chroma": {},
    "microservices": {},
    "publishing": {},
    "models": {},
    "request": {}
  }
}
```

This snapshot contains only safe non-secret values. Continue using n8n credentials for Jira, Confluence, Supabase service role, Chroma, and OpenAI secrets.

## Required n8n Credential Rule

For server-side n8n calls to the new `qops_*` tables, use the Supabase service-role credential from n8n. Do not expose the service-role key to the frontend.

The new `qops_*` tables have RLS enabled. Direct anon-key table reads/writes are intentionally not the contract. The existing legacy job tables were not changed to avoid breaking current workflows.

## Shared Node Pattern: Resolve Runtime Config

Add this node to the queue creator workflows and, optionally, health/settings workflows.

1. Add an HTTP Request node named `Resolve Runtime Config`.
2. Method: `POST`.
3. URL:

```text
https://ifnznfspkjayhnooncrv.supabase.co/rest/v1/rpc/qops_resolve_runtime_config
```

4. Headers:

```text
apikey: {{$credentials.supabaseServiceRoleKey}}
Authorization: Bearer {{$credentials.supabaseServiceRoleKey}}
Content-Type: application/json
```

5. JSON body for ingestion:

```json
{
  "p_environment_key": "={{ $json.environment || 'local' }}",
  "p_project_id": "={{ $json.projectId || null }}",
  "p_pipeline": "ingestion",
  "p_requested_by": "={{ $json.requestedBy || null }}"
}
```

6. JSON body for generation:

```json
{
  "p_environment_key": "={{ $json.input.environment || 'local' }}",
  "p_project_id": "={{ $json.input.projectId || null }}",
  "p_pipeline": "generation",
  "p_requested_by": "={{ $json.input.requestedBy || null }}"
}
```

7. In downstream nodes, refer to:

```text
{{ $('Resolve Runtime Config').item.json.settingsVersion }}
{{ $('Resolve Runtime Config').item.json.configSnapshot }}
```

## Workflow Changes

### 1. `INGEST API Queue Creator - SaaS.json`

Keep webhook path:

```text
POST /webhook/upload-test-artifacts
```

Keep current required fields:

- `projectName`
- uploaded files

Add optional fields:

- `projectId`
- `requestedBy`
- `environment`

Step changes:

1. After the current request parsing/job id node, preserve `projectId`, `requestedBy`, and `environment` from the webhook body. Default `environment` to `local`.
2. Add `Resolve Runtime Config`.
3. Replace the hardcoded storage bucket `uploaded-project-docs` with:

```text
{{ $('Resolve Runtime Config').item.json.configSnapshot.supabase.storageBucket }}
```

4. Replace hardcoded public URL construction with:

```javascript
const cfg = $('Resolve Runtime Config').item.json.configSnapshot;
const bucket = cfg.supabase.storageBucket;
const projectUrl = cfg.supabase.projectUrl;
const publicUrl = `${projectUrl}/storage/v1/object/public/${bucket}/${projectName}/${jobId}/${encodedFileName}`;
```

5. Insert into `doc_ingestion_jobs` with the current fields plus:

```json
{
  "project_id": "={{ $('Generate Job ID').item.json.projectId || null }}",
  "requested_by": "={{ $('Generate Job ID').item.json.requestedBy || null }}",
  "settings_version": "={{ $('Resolve Runtime Config').item.json.settingsVersion }}",
  "config_snapshot": "={{ $('Resolve Runtime Config').item.json.configSnapshot }}"
}
```

6. Keep `input.projectName` and `input.files` exactly as they exist today.
7. In `qa_job_metrics.metadata`, add `settings_version`, `project_id`, and `environment`.

### 2. `INGEST Worker Engine (Queue Processor).json`

Step changes:

1. Update the pending job query to select the new columns. With REST, include:

```text
select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at
```

2. When locking the job, keep the same `status=eq.pending` guard.
3. When expanding files, pass these fields through each item:

```javascript
configSnapshot: $json.config_snapshot,
settingsVersion: $json.settings_version,
projectId: $json.project_id,
requestedBy: $json.requested_by
```

4. Pass `configSnapshot` to the vectorization engine execute-workflow node.

### 3. `Multimodal Knowledge Ingestion & Vectorization Engine.json`

Step changes:

1. Replace document processor URL:

```text
http://127.0.0.1:8000/process-document
```

with:

```text
{{ $json.configSnapshot.microservices.documentProcessorUrl }}
```

2. Replace Chroma collection `qa-chunks-batches` with:

```text
{{ $json.configSnapshot.chroma.collection }}
```

3. If the Chroma node does not accept expressions for collection, switch that node to an HTTP Request against the configured Chroma API, or use an n8n variable hydrated from `configSnapshot` before the Chroma node runs.
4. Add safe metadata to each chunk:

```json
{
  "settingsVersion": "={{ $json.settingsVersion }}",
  "chromaCollection": "={{ $json.configSnapshot.chroma.collection }}",
  "environment": "={{ $json.configSnapshot.environment.key }}",
  "projectId": "={{ $json.projectId }}"
}
```

5. When marking `doc_ingestion_jobs` completed/failed, keep the existing `output.totalChunksStored` shape.

### 4. `RETRIEVAL Job Queue Creator - SaaS.json`

Keep webhook path:

```text
POST /webhook/generate-qa-doc
```

Keep current fields:

- `projectName`
- `documentType`
- `productOwner`

Add optional fields:

- `projectId`
- `requestedBy`
- `environment`

Step changes:

1. Preserve the full current request body in `input`, including new optional fields.
2. Add `Resolve Runtime Config` after job id generation.
3. Insert into `qa_jobs` with the current fields plus:

```json
{
  "project_id": "={{ $('Generate Job ID').item.json.input.projectId || null }}",
  "requested_by": "={{ $('Generate Job ID').item.json.input.requestedBy || null }}",
  "settings_version": "={{ $('Resolve Runtime Config').item.json.settingsVersion }}",
  "config_snapshot": "={{ $('Resolve Runtime Config').item.json.configSnapshot }}"
}
```

4. Keep the response as:

```json
{
  "jobId": "GEN-...",
  "status": "queued"
}
```

5. In `qa_job_metrics.metadata`, add `settings_version`, `project_id`, `requested_by`, and `environment`.

### 5. `RETRIEVAL Worker Engine (Queue Processor) - Saas.json`

Step changes:

1. Update the pending job query to include:

```text
select=job_id,status,input,project_id,requested_by,settings_version,config_snapshot,created_at
```

2. Keep the lock patch guarded by `status=eq.pending`.
3. Pass these fields to `RETRIEVAL Document Generator AI Agent - SaaS.json`:

```json
{
  "job_id": "={{ $json.job_id }}",
  "status": "={{ $json.status }}",
  "input": "={{ $json.input }}",
  "project_id": "={{ $json.project_id }}",
  "requested_by": "={{ $json.requested_by }}",
  "settings_version": "={{ $json.settings_version }}",
  "config_snapshot": "={{ $json.config_snapshot }}"
}
```

### 6. `RETRIEVAL Document Generator AI Agent - SaaS.json`

Step changes:

1. In the first normalization/preserve-context node, flatten:

```javascript
const configSnapshot = $json.config_snapshot || {};
const settingsVersion = $json.settings_version || null;
```

2. Replace Chroma settings:

```text
collection: {{ $json.configSnapshot.chroma.collection }}
topK: {{ $json.configSnapshot.chroma.topK || 20 }}
```

3. Replace model settings:

```text
model: {{ $json.configSnapshot.models.generationModel || 'gpt-4.1-mini' }}
maxTokens: {{ $json.configSnapshot.models.maxTokens || 8000 }}
```

4. Replace converter URL:

```text
{{ $json.configSnapshot.microservices.converterUrl }}
```

5. Replace Confluence URLs:

```text
{{ $json.configSnapshot.publishing.confluenceBaseUrl }}/rest/api/content
```

6. Replace Confluence space key:

```text
{{ $json.configSnapshot.publishing.confluenceSpaceKey }}
```

7. Build page title from pattern:

```javascript
const pattern = configSnapshot.publishing.confluencePageTitlePattern || '{documentTitle} - {projectName}';
const title = pattern
  .replace('{documentTitle}', documentTitle)
  .replace('{projectName}', projectName);
```

8. Replace Jira base URL:

```text
{{ $json.configSnapshot.publishing.jiraBaseUrl }}
```

9. Replace Jira project and issue type ids:

```text
project id: {{ $json.configSnapshot.publishing.jiraProjectId }}
epic issue type id: {{ $json.configSnapshot.publishing.jiraEpicIssueTypeId }}
story issue type id: {{ $json.configSnapshot.publishing.jiraStoryIssueTypeId }}
project key in JQL: {{ $json.configSnapshot.publishing.jiraProjectKey }}
```

10. Update final `qa_jobs.output` for Confluence jobs to include:

```json
{
  "confluencePageId": "...",
  "url": "...",
  "settingsVersion": "={{ $json.settingsVersion }}",
  "destination": {
    "type": "confluence",
    "spaceKey": "={{ $json.configSnapshot.publishing.confluenceSpaceKey }}"
  }
}
```

11. Update final `qa_jobs.output` for Jira jobs to include:

```json
{
  "stories": [],
  "epics": [],
  "settingsVersion": "={{ $json.settingsVersion }}",
  "destination": {
    "type": "jira",
    "projectKey": "={{ $json.configSnapshot.publishing.jiraProjectKey }}"
  }
}
```

12. In `qa_job_metrics.metadata`, add `settings_version`, `project_id`, destination, configured model, Chroma collection, and `requested_by`.

### 7. `Q-Ops-Agent-Health-Status.json`

Step changes:

1. Add `Resolve Runtime Config` at the beginning. Use `p_pipeline: "health"`.
2. Replace hardcoded health endpoints:

```text
Supabase DB URL: configSnapshot.supabase.projectUrl
Supabase bucket: configSnapshot.supabase.storageBucket
Chroma URL: configSnapshot.chroma.baseUrl + /api/v2/tenants/{tenant}/databases/{database}/collections/{collection}
FastAPI health URL: configSnapshot.microservices.documentProcessorHealthUrl
Converter health URL: configSnapshot.microservices.converterHealthUrl
```

3. Add optional Jira project check:

```text
GET {configSnapshot.publishing.jiraBaseUrl}/rest/api/3/project/{configSnapshot.publishing.jiraProjectKey}
```

4. Add optional Confluence space check:

```text
GET {configSnapshot.publishing.confluenceBaseUrl}/rest/api/space/{configSnapshot.publishing.confluenceSpaceKey}
```

5. Keep OpenAI as `backend-managed` unless you add an admin-only credential validation workflow.
6. For Admin-triggered health/test runs, insert one row per service into `qops_connection_test_results`.
7. Return the same UI-compatible response shape: `status`, `generatedAt`, `services`, `webhooks`, `integrations`.

### 8. Repository Workflows

Create or update these workflows so the current dashboard can hydrate from Supabase.

#### `GET /webhook/projects`

Read `qops_projects` and return:

```json
[
  {
    "id": "project-id",
    "name": "Project",
    "description": "",
    "owner": "Admin User",
    "module": "",
    "release": "",
    "tags": [],
    "status": "ready",
    "createdAt": "ISO",
    "updatedAt": "ISO"
  }
]
```

#### `POST /webhook/projects`

Upsert into `qops_projects` by case-insensitive `name`. Insert `qops_audit_events` with `action: "PROJECT_CREATED"` or `PROJECT_UPDATED`.

#### `GET /webhook/artifacts`

Read `doc_ingestion_jobs`, expand `input.files`, and return one record per file. Map status:

```text
completed -> processed
failed -> failed
pending/processing -> processing
```

#### `GET /webhook/generated-documents`

Read `qa_jobs` and map:

```text
input.projectName -> projectName
input.documentType -> documentType
output.url -> url
job_id -> id and jobId
```

#### `GET /webhook/audit-events`

Return a union of:

- `qops_audit_events` for settings/users/projects/integration tests.
- `qa_job_metrics` for ingestion and generation job events.

Map to the existing UI shape:

```json
{
  "id": "event-id",
  "actor": "n8n",
  "action": "JOB_COMPLETED",
  "project": "Project",
  "entity": "GEN-...",
  "status": "success",
  "timestamp": "ISO",
  "details": "generation | test_strategy | completed"
}
```

## New Persona Settings Workflows

If n8n remains the temporary API host, create these workflows.

### `GET /webhook/settings`

1. Require Admin when auth is available.
2. Read `qops_environment_settings`.
3. Read `qops_integration_settings`.
4. Return non-secret settings only: include `config`, never raw credentials.
5. Include latest `qops_connection_test_results` per integration.

### `PATCH /webhook/settings`

1. Require Admin.
2. Validate environment and integration keys.
3. Update only allowed non-secret fields.
4. Increment `qops_integration_settings.settings_version`.
5. Insert `qops_audit_events` with `SETTINGS_UPDATED`.
6. Return updated non-secret settings.

### `GET /webhook/integrations/status`

1. Read latest connection result per integration.
2. Return sanitized status for all authenticated users.
3. Hide `technical_detail` for Registered User.

### `POST /webhook/integrations/{integrationKey}/test`

1. Require Admin.
2. Load integration config and use n8n credentials for secrets.
3. Run the service-specific check.
4. Insert `qops_connection_test_results`.
5. Update `qops_integration_settings.status`, `last_tested_at`, and `last_tested_by`.
6. Insert `qops_audit_events` with `CONNECTION_TESTED`.

### `POST /webhook/integrations/test-all`

1. Require Admin.
2. Run all enabled integration checks.
3. Persist each result.
4. Return aggregate status in the same style as `/webhook/health`.

### Users And Roles

Auth/RBAC read endpoints are published and wired:

```text
GET /webhook/me
GET /webhook/users
```

The mutation endpoints are published and wired in the UI. The invite-accept endpoint is drafted and wired in the UI:

```text
POST /webhook/users/invite
PATCH /webhook/users/update
PATCH /webhook/users/project-assignments
POST /webhook/users/accept-invite
```

Use `qops_users`, `qops_project_members`, `qops_audit_events`, and Supabase Auth admin invite. Project assignment editing is now handled by a dedicated workflow so invite/update payloads remain compatible.

## Compatibility Rules

1. Do not remove or rename existing webhook paths.
2. Do not remove `input` or `output` from `doc_ingestion_jobs` or `qa_jobs`.
3. Keep `projectName` in request/input for current UI compatibility even after adding `projectId`.
4. Keep polling statuses exactly as `pending`, `processing`, `completed`, `failed`, and `not_found`.
5. Store only safe non-secret values in `config_snapshot`.
6. Keep all raw API tokens in n8n credentials or a proper secret manager.
7. Use service-role credentials from n8n for `qops_*` table access.
8. Keep the current exported workflows as rollback backups before editing nodes.

## Validation Checklist

1. Existing upload still returns `{ "jobId": "...", "status": "queued" }`.
2. Existing ingestion polling still works for old and new jobs.
3. New ingestion jobs contain `settings_version` and `config_snapshot`.
4. Existing document generation still returns `{ "jobId": "...", "status": "queued" }`.
5. New generation jobs contain `settings_version` and `config_snapshot`.
6. Generated Confluence output still exposes `output.url`.
7. Jira output still exposes `output.epics` and `output.stories`.
8. `/webhook/health` still returns `services`, `webhooks`, and `integrations`.
9. Admin-triggered tests write `qops_connection_test_results`.
10. Settings changes write `qops_audit_events`.
