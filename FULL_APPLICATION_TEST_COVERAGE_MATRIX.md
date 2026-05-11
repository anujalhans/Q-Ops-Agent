# Q-Ops Agent Full Application Test Coverage Matrix

Generated on 2026-05-09.

This document expands the test scope beyond the mocked Playwright smoke suite. It covers frontend, backend n8n APIs, n8n queue/worker workflows, Supabase Auth/DB/RLS, storage, Chroma, OpenAI, converter service, Jira, Confluence, FAT, SIT, UAT, regression, and production smoke.

## 1. Scope Baseline

Authoritative scope sources:

| Source | Usage |
| --- | --- |
| `docs/UI_documentation` | Current frontend behavior, Supabase Auth, roles, dashboard, settings, admin, polling |
| `docs/API_Contract_documentation/README.md` | UI-facing n8n API contract |
| `docs/End_to_End_Architecture_documentation/README.md` | Full browser-to-n8n-to-Supabase-to-AI architecture |
| `docs/Operational_Runbook/README.md` | Failure modes and operational checks |
| `docs/Deployment_Production_Cutover_Guide/README.md` | Production smoke and cutover coverage |
| `docs/Supabase_documentation` | Schema, RLS, grants, views, functions, advisors |
| `docs/n8n_documentation_2026-05-08` | Workflow-level behavior and dependencies |

Note: `FUNCTIONALITY.md` is stale in auth details. It describes older static auth, while the current app uses Supabase Auth and `qops-agent-supabase-session`.

## 2. Test Types

| Test Type | Objective | Environment | Automation |
| --- | --- | --- | --- |
| Unit | Validate pure functions, mapping, normalization, polling helpers | Local | Future Vitest |
| Component | Validate forms, modals, panels, role-specific rendering | Local | Future component tests |
| E2E Mocked | Validate FE workflows against deterministic mocked Supabase/n8n | Local/CI | Playwright implemented |
| API Contract | Validate every webhook method, auth, payload, status, error shape | Local n8n/Staging | Playwright API/Newman planned |
| SIT | Validate integrated FE + Supabase + n8n + workers + storage + external stubs | Staging | Semi-automated |
| FAT | Business flow acceptance across ingestion, generation, settings, analytics | Staging/UAT | Manual plus evidence |
| Security/RBAC | Validate auth, role scoping, RLS/grants, missing/invalid token behavior | Staging | API + SQL checks |
| Performance | Validate large artifact handling, polling behavior, dashboard rendering, queue latency | Staging | k6/Playwright planned |
| Production Smoke | Minimal safe validation after deployment | Production | Manual/automated smoke |

## 3. Frontend Feature Coverage

| Feature | Positive Coverage | Negative Coverage | Current Automation |
| --- | --- | --- | --- |
| Landing page | Hero, CTAs, login modal, forgot password | Missing images should not break layout | Partial |
| Explore page | Navigation, comparison, modal, architecture sections | Auth CTA legacy key bug documented | Partial |
| Login | Valid Supabase login, active Q-Ops user profile | Invalid password, disabled/pending profile, `/me` unavailable | Automated |
| Session restore | Valid stored token, refresh near expiry, dashboard access | Expired refresh, inactive profile clears session | Partial/planned |
| Logout | Supabase logout call and local session clear | Logout API failure should still clear local session | Automated positive |
| Auth callback invite | Consume invite hash, accept invite, set password | Missing hash, unsupported type, profile not activated, password mismatch | Planned live |
| Auth callback recovery | Consume recovery hash, set password, audit reset | Audit endpoint unavailable, password mismatch, stale link | Planned live |
| Dashboard overview | Backend hydration, local fallback, metrics | Repository endpoint unavailable, partial data unavailable | Automated positive |
| Project creation | Admin creates project and backend persists | Duplicate name, backend create unavailable | Planned |
| Knowledge ingestion | File selection, upload request, job completion | Invalid response, failed status, not_found retries, template error | Partial automated |
| Document generation | All document type mappings, completed URL output | Missing artifact, failed polling, invalid response, template error | Automated partial |
| Artifacts repository | List artifacts, preview URL, failed artifact reprocess | Reprocess only failed artifacts, reprocess API failure | Planned |
| Analytics | Summary, filters, costs, failures, ingestion stats | Analytics unavailable fallback | Planned |
| Audit | Audit modal displays backend/local events | Scoped registered-user audit | Planned |
| Notifications | Drawer, mark all read, action routing | Registered-user notification scoping | Planned |
| Search | Ctrl/Cmd+K palette and result navigation | Empty search state | Planned |
| Settings admin | Integrations, users, defaults, security, system status | Settings API unavailable, save/test failures | Partial automated |
| Settings registered user | Profile, notifications, projects, read-only status | Admin tabs hidden | Automated partial |
| Theme | Toggle persists and renders | Bad stored theme fallback | Planned |
| Responsive | Public pages and desktop dashboard | Mobile dashboard sidebar bug | Automated evidence |
| Accessibility | Keyboard modals, radio selection, roles | Auth field labels not associated | Documented bug |

## 4. API Contract Coverage

Each endpoint must be tested for:

- Missing bearer token where auth is required.
- Invalid bearer token.
- Valid admin token.
- Valid registered-user token with project scoping.
- Unsupported method.
- Malformed payload.
- Valid payload.
- Backend unavailable/timeout.
- Stable error object with machine-readable code and message.

| Endpoint | Positive Cases | Negative Cases |
| --- | --- | --- |
| `POST /webhook/upload-test-artifacts` | Admin/registered upload with files, attribution, projectId, environment | Missing bearer, invalid token, missing project, unsupported file, no files if backend disallows, storage failure |
| `GET /webhook/job-status` | queued, pending, processing, completed, failed | missing jobId, unknown jobId, template variable status, malformed JSON |
| `POST /webhook/generate-qa-doc` | All six document types, project attribution, runtime config | Missing bearer, invalid project, unsupported document type, empty productOwner, Chroma empty |
| `GET /webhook/job-status-retrieve` | completed URL output, completed Jira epics/stories, failed generator/quality/converter/Jira/Confluence | missing jobId, unknown job, malformed output |
| `GET /webhook/me` | Admin profile, registered profile with projects | Missing/invalid bearer, pending_invite, disabled, no qops_users mapping |
| `GET /webhook/users` | Admin can list users and assignments | Registered user denied/scoped, missing bearer |
| `POST /webhook/users/invite` | Invite admin, invite registered user | Duplicate email, invalid email, missing redirect, non-admin, Supabase invite failure |
| `PATCH /webhook/users/update` | Edit name/title/role/status | Non-admin, invalid status, target user missing |
| `PATCH /webhook/users/project-assignments` | Replace assignments with owner/editor/viewer | Invalid project, invalid role, target admin assignment, assignment failure after invite |
| `POST /webhook/users/accept-invite` | Pending invite becomes active | Already active, missing qops user, stale Supabase link |
| `POST /webhook/users/password-reset-audit` | Audit reset completion | Missing token, disabled user, audit insert failure |
| `GET/POST /webhook/projects` | List scoped projects, create/upsert project | Duplicate, invalid payload, registered-user create denied |
| `GET /webhook/artifacts` | List artifacts with status/url/jobId | Registered-user scoping, unauthenticated access decision |
| `POST /webhook/artifacts/reprocess` | Failed artifact requeued | Non-failed artifact, missing artifact, unauthorized project |
| `GET /webhook/generated-documents` | List outputs with URL/Jira output | Registered-user scoping, malformed output |
| `GET /webhook/audit-events` | Admin workspace audit, registered scoped audit | Missing token, invalid token, query failure |
| `GET /webhook/analytics-summary` | Pipeline/days filters, cost/token/failure metrics | Invalid days, invalid pipeline, no metrics, unauthorized |
| `GET /webhook/infrastructure-load` | Queue/workflow/service/usage data | No metrics, service failure, unauthorized |
| `GET /webhook/health` | Service registry and dependency statuses | Downstream health failure, timeout |
| `GET/PATCH /webhook/settings` | Read active env, save Jira/Confluence | Non-admin write, invalid integration, secrets exposure, audit failure |
| `POST /webhook/integrations/test` | Test Jira/Confluence/Chroma/OpenAI | Missing config, bad credentials, service timeout |
| `POST /webhook/integrations/test-all` | All tests persist latest result | Partial failure still reports per-service status |

## 5. n8n Workflow SIT Coverage

| Workflow Area | SIT Positive Cases | SIT Negative/Recovery Cases | Evidence |
| --- | --- | --- | --- |
| Ingest queue creator | Auth validates, files upload to storage, job row queued, metrics queued | Missing bearer, bad file, storage failure, runtime config missing | n8n execution ID, Supabase rows |
| Ingest worker | Oldest pending job locked once, status processing, full engine invoked | Already-processing job skipped, worker inactive, lock/update failure | n8n execution ID |
| Ingestion full engine | Text/image extraction, chunking, embedding, Chroma upsert, completed metrics | extractor down, OpenAI failure, Chroma failure, malformed document | Job row, metrics, Chroma count |
| Retrieval queue creator | Auth validates, `qa_jobs` row queued, document type persisted, metrics queued | Unsupported doc type, missing project, missing config | Job row, metrics |
| Retrieval worker | Oldest pending job locked, context restored, full engine invoked | duplicate processing, stale job, runtime config failure | n8n execution ID |
| Retrieval full engine | Chroma retrieval, LLM generation, quality gate, Confluence/Jira output, metrics | no chunks, quality gate fail, converter timeout, Jira failure, Confluence failure | Output URL/Jira keys, metrics |
| Health APIs | Each dependency reports status | Dependency down produces degraded/error status | `/webhook/health` response |
| Settings APIs | Read/write settings and audit | Invalid integration, non-admin write denied | Settings rows, audit rows |
| User APIs | Invite/update/assign/accept flows | Non-admin denied, duplicate invite, assignment failure | User/project rows, audit rows |

## 6. Supabase Security And Data Coverage

| Area | Test Cases |
| --- | --- |
| Auth | Login, refresh, logout, invite link, recovery link, redirect URL allowlist |
| Users | `qops_users` mapping, active/pending/disabled behavior, unique email |
| Projects | Admin all projects, registered assigned projects only |
| RLS | Verify advisor items; enable/test policies before production |
| Grants | Revoke unnecessary anon/authenticated access to operational public tables |
| Job queues | `qa_jobs`, `doc_ingestion_jobs`, terminal state consistency, no duplicate processing |
| Metrics | `qa_job_metrics` lifecycle rows: queued, started, quality, completed, failed |
| Audit | `qops_audit_events` for invite, assignment, settings, project, reset |
| Settings | Environment and integration settings, latest connection test results |
| Storage | Bucket access, upload path, file URLs, large/invalid file behavior |
| Analytics views/RPCs | Cost summary, failure rate, observability dashboard, search path hardening |

## 7. FAT Coverage

FAT validates business functionality from the user's perspective.

| FAT ID | Scenario | Acceptance Criteria |
| --- | --- | --- |
| FAT-001 | Admin login and dashboard access | Active admin reaches dashboard and sees all modules |
| FAT-002 | Disabled user access | Disabled user cannot access dashboard |
| FAT-003 | Invite registered user | Admin invites user, assigns project, user accepts invite |
| FAT-004 | Registered-user scoping | Registered user sees only assigned projects/artifacts/outputs/audit |
| FAT-005 | Create project | Admin creates project and it persists in backend |
| FAT-006 | Knowledge ingestion | Upload BRD/FRD/HLD/LLD/transcript/images, job completes, chunks stored |
| FAT-007 | Ingestion failure visibility | Failed ingestion shows clear UI error and metrics/audit |
| FAT-008 | Generate Test Strategy | Strategy published to Confluence/DOCX and UI shows link |
| FAT-009 | Generate Test Plan | Plan published and metrics include duration/tokens/cost |
| FAT-010 | Generate Risk Matrix | Risk matrix output passes quality gate |
| FAT-011 | Generate Test Cases | Test cases output is structured and accessible |
| FAT-012 | Generate Epics/User Stories | Jira epics/stories created or updated with stable keys |
| FAT-013 | Generate Traceability Matrix | RTM output links requirements to tests |
| FAT-014 | Artifact reprocess | Failed artifact reprocess creates new job and completes |
| FAT-015 | Analytics | Cost/token/jobs/failures align with metrics rows |
| FAT-016 | Settings | Jira/Confluence settings save and are used by generation |
| FAT-017 | Integration tests | Single and all-services tests persist results |
| FAT-018 | Audit | Security/admin/job actions appear in scoped audit |
| FAT-019 | Notifications | Job success/failure notifications appear and can be marked read |
| FAT-020 | Production smoke | Safe smoke project can ingest and generate after deploy |

## 8. SIT Coverage

SIT validates component integration across systems.

| SIT ID | Integration | Scenario |
| --- | --- | --- |
| SIT-001 | UI -> Supabase Auth -> n8n `/me` | Login resolves active Q-Ops profile |
| SIT-002 | UI -> n8n -> Supabase Storage | Upload files and verify stored object paths |
| SIT-003 | n8n -> Supabase DB | Queue creator writes job, metrics, logs |
| SIT-004 | n8n worker -> full ingestion engine | Pending ingestion job completes |
| SIT-005 | Full ingestion -> Chroma | Chunks are embedded/upserted into expected collection |
| SIT-006 | UI polling -> Supabase status workflow | UI receives terminal ingestion state |
| SIT-007 | UI -> generation queue -> retrieval worker | Generation job moves pending to completed |
| SIT-008 | Retrieval -> OpenAI -> quality gate | Output meets required shape and token/cost captured |
| SIT-009 | Retrieval -> Confluence/converter | Document output link renders in UI |
| SIT-010 | Retrieval -> Jira | Epics/stories output renders in UI |
| SIT-011 | Settings -> runtime config RPC | Saved integration config is resolved by workers |
| SIT-012 | Analytics -> metrics | Dashboard numbers match `qa_job_metrics` queries |
| SIT-013 | RBAC -> repository APIs | Registered-user data is scoped at backend layer |
| SIT-014 | Health -> dependency checks | Health surfaces degraded/error dependency states |
| SIT-015 | Recovery flows | Password reset and invite acceptance write expected audits |

## 9. Negative And Edge Coverage

| Category | Tests |
| --- | --- |
| Auth | invalid password, expired token, failed refresh, disabled user, pending invite, missing `/me`, malformed Supabase response |
| Authorization | registered user creates project, registered user updates settings, user reads unrelated project, missing bearer, invalid bearer |
| Upload | no project, invalid file, huge file, storage denied, no jobId, template status, not_found retries, failed extraction |
| Generation | no project, no artifact, unsupported document type, empty Chroma, LLM failure, quality gate fail, converter timeout, Jira/Confluence auth fail |
| Polling | array response, object response, network timeout, 3 retry cap, terminal status stops polling |
| Settings | settings API down, invalid URL, bad credentials, partial test-all failure, secrets never displayed |
| Analytics | empty metrics, invalid filters, failed jobs counted correctly, old jobs excluded by date |
| UI | modal Escape/backdrop/close, keyboard artifact selection, responsive behavior, toast auto-dismiss |
| Security | XSS-sensitive localStorage token risk, RLS disabled operational tables, security-definer views, mutable function search path |

## 10. Production Readiness Gate

Production-ready requires:

| Gate | Required State |
| --- | --- |
| Build | `npm run build` passes |
| Mocked E2E | Desktop and supported mobile Playwright suites pass |
| FAT | All P0/P1 FAT scenarios pass or have signed waiver |
| SIT | End-to-end ingestion and generation pass in staging |
| Security | RLS/grants advisor critical findings remediated or accepted with compensating control |
| Data | No test/customer data leakage; all test data synthetic |
| Observability | n8n execution IDs, Supabase rows, metrics, and audit evidence captured |
| Performance | Queue latency and document generation duration within agreed thresholds |
| Rollback | Rollback plan tested or dry-run reviewed |

## 11. Current Execution Status

| Suite | Status |
| --- | --- |
| Desktop mocked Playwright | Passing: 16/16 |
| Full mobile dashboard Playwright | Failing due known responsive sidebar issue |
| Live SIT/FAT | Not executed in this session; requires active staging credentials/services |

