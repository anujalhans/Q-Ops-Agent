# Q-Ops Agent Test Cases

Generated on 2026-05-09.

| ID | Priority | Area | Scenario | Preconditions | Steps | Expected Result | Automation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-001 | P0 | Public UI | Landing page loads | App running | Open `/` | Hero, Login, Explore More, core capabilities visible | Automated |
| TC-002 | P1 | Public UI | Explore page navigation | App running | Click Explore More, return to login | `/explore` loads and can return to `/` | Automated |
| TC-003 | P0 | Auth | Login modal opens | App running | Click Login | Email/password fields and forgot password action visible | Automated |
| TC-004 | P0 | Auth | Valid admin login | Mock or real Supabase active admin | Submit valid credentials | User lands on `/dashboard` | Planned live |
| TC-005 | P0 | Auth | Invalid login rejected | Supabase rejects credentials | Submit invalid password | Error toast appears, user remains unauthenticated | Planned |
| TC-006 | P0 | Auth | Disabled user rejected | Disabled Q-Ops user exists | Login as disabled user | Session cleared and dashboard blocked | Planned live |
| TC-007 | P1 | Auth | Password reset request | Email exists | Open forgot password, submit email | Supabase recovery endpoint called and success toast shown | Automated |
| TC-008 | P0 | Auth Callback | Recovery callback sets password | Valid recovery link | Open callback hash, enter new password | Password updated, audit request sent, dashboard opens | Planned live |
| TC-009 | P0 | Auth Callback | Invite callback accepts user | Pending invite link | Open invite hash, set password | User accepted and dashboard opens | Planned live |
| TC-010 | P0 | Routing | Unauthenticated dashboard redirect | No session | Open `/dashboard` | User redirects to `/` | Planned |
| TC-011 | P0 | Dashboard | Admin dashboard smoke | Admin session | Open `/dashboard` | Dashboard modules and backend repository data visible | Automated |
| TC-012 | P0 | RBAC | Registered user project scope | Registered user assigned to one project | Open dashboard | Assigned project visible, unrelated project hidden | Automated |
| TC-013 | P0 | RBAC | Registered user cannot create project | Registered user session | Open dashboard | New Project action hidden | Automated |
| TC-014 | P0 | RBAC | Registered user settings restricted | Registered user session | Open Settings | Admin-only Users/Integrations controls hidden | Automated |
| TC-015 | P0 | Projects | Admin creates project | Admin session | Click New Project, complete wizard | Project appears, knowledge tab selected | Planned |
| TC-016 | P1 | Projects | Duplicate project name handled | Existing project | Create same name | Existing project updated or duplicate blocked per product rule | Planned |
| TC-017 | P0 | Knowledge | Ingestion upload submits selected files | Admin session, project exists | Select project, upload BRD/transcript, submit | Upload webhook receives multipart payload and job status completes | Automated |
| TC-018 | P0 | Knowledge | Submit disabled without project | Admin session | Open Knowledge tab without selecting project | Create Knowledge Base disabled | Automated by behavior |
| TC-019 | P1 | Knowledge | Upload failure shown | Upload webhook returns bad response | Submit upload | Error message and notification appear | Planned |
| TC-020 | P1 | Knowledge | Failed artifact reprocess | Failed artifact exists | Open Artifacts, click Reprocess | Reprocess webhook called and job status starts | Planned |
| TC-021 | P0 | Document Generation | Test Strategy generation | Project ready | Select project and Test Strategy, submit | Request maps artifact to `test_strategy`; document link appears | Automated |
| TC-022 | P0 | Document Generation | All document types map correctly | Project ready | Generate each artifact type | Backend receives expected documentType | Planned |
| TC-023 | P1 | Document Generation | Missing artifact validation | Project selected, no artifact | Submit form | Validation error appears | Planned |
| TC-024 | P1 | Document Generation | Failed generation details | Job status returns failed output | Submit generation | Failure panel shows error type and message | Planned |
| TC-025 | P1 | Document Generation | Jira epics/stories output | User stories generation completes | Submit Epics & User Stories | Epics/stories panel renders clean keys and links | Planned live |
| TC-026 | P1 | Analytics | Analytics summary loads | Analytics endpoint available | Open Analytics | Totals, recent jobs, costs, failures render | Planned |
| TC-027 | P2 | Analytics | Filters refresh data | Analytics page open | Change pipeline/days, click refresh | Query contains selected filters and data updates | Planned |
| TC-028 | P1 | Settings | Jira settings save | Admin session | Edit Jira fields and Save | PATCH `/webhook/settings` called and success toast shown | Automated |
| TC-029 | P1 | Settings | Confluence settings save | Admin session | Edit Confluence fields and Save | PATCH `/webhook/settings` called and success toast shown | Planned |
| TC-030 | P1 | Settings | Test all services | Admin session | Click Test All Services | Integration test endpoint called and health status shown | Planned |
| TC-031 | P0 | Users | Admin invites registered user | Admin session, project exists | Open Settings > Users, invite user | Invite and assignment endpoints succeed | Planned live |
| TC-032 | P0 | Users | Admin edits user project assignments | Admin session, user exists | Edit user, change role/project | User and assignment endpoints succeed | Planned live |
| TC-033 | P1 | Audit | Audit log opens | Audit events exist | Click View Audit Log | Events render with actor/action/status | Planned |
| TC-034 | P1 | Notifications | Mark notifications read | Unread notification exists | Open notifications, mark all read | Badge clears | Planned |
| TC-035 | P1 | Search | Keyboard shortcut opens search | Dashboard open | Press Ctrl+K | Search palette opens | Planned |
| TC-036 | P2 | Theme | Theme toggles persist | App loaded | Click theme toggle, reload | Theme remains selected | Planned |
| TC-037 | P0 | API Contract | Missing bearer token rejected | Auth-required endpoint | Call `/webhook/me` without token | 401/403 structured error | Planned API |
| TC-038 | P0 | API Contract | Registered-user API scoping | Registered-user token | Call projects/artifacts/audit endpoints | Only assigned/self records returned | Planned API |
| TC-039 | P0 | n8n Workflow | Ingestion queue creates attributed job | Valid upload | Execute queue creator | Job includes project_id, requested_by, config snapshot | Planned workflow |
| TC-040 | P0 | n8n Workflow | Retrieval queue creates attributed job | Valid generation | Execute queue creator | Job includes document type, attribution, runtime config | Planned workflow |
| TC-041 | P0 | n8n Workflow | Worker terminal states | Queued job exists | Execute worker success/failure | Job and metrics terminal state written once | Planned workflow |
| TC-042 | P1 | Performance | Dashboard initial render | Mocked backend | Open dashboard | Main content visible within agreed budget | Planned |
| TC-043 | P1 | Accessibility | Keyboard form operation | App loaded | Navigate critical controls by keyboard | Focus order and submit behavior work | Planned |
| TC-044 | P1 | Responsive | Mobile smoke | Mobile viewport | Open landing and dashboard | No blocking overflow; main actions reachable | Automated project |
| TC-045 | P0 | Production Smoke | Full happy path | Production smoke account | Login, create project, upload small doc, generate strategy | Job completes and audit/analytics update | Manual/live |
| TC-046 | P0 | Auth | Supabase login success | Active admin exists | Login with valid Supabase credentials | Session stored, `/webhook/me` called, dashboard opens | Automated |
| TC-047 | P0 | Auth | Supabase login failure | Supabase rejects password | Login with invalid credentials | Error toast and inline auth error appear | Automated |
| TC-048 | P0 | Auth | Disabled profile rejected | Supabase succeeds, Q-Ops profile disabled | Login as disabled user | Session cleared and user remains on landing page | Automated |
| TC-049 | P0 | Auth | Logout clears all auth keys | Authenticated session | Click Logout | Supabase logout called, session and legacy key cleared | Automated |
| TC-050 | P0 | Document Generation | Artifact mapping: Test Plan | Project exists | Generate Test Plan | Backend receives `test_plan` | Automated |
| TC-051 | P0 | Document Generation | Artifact mapping: Risk Matrix | Project exists | Generate Risk Matrix | Backend receives `risk_matrix` | Automated |
| TC-052 | P0 | Document Generation | Artifact mapping: Test Cases | Project exists | Generate Test Cases | Backend receives `test_cases` | Automated |
| TC-053 | P0 | Document Generation | Artifact mapping: Epics & Stories | Project exists | Generate Epics & User Stories | Backend receives `user_stories` | Automated |
| TC-054 | P0 | Document Generation | Artifact mapping: Traceability Matrix | Project exists | Generate Traceability Matrix | Backend receives `traceability_matrix` | Automated |
| TC-055 | P1 | Knowledge | Invalid upload queue response | Upload endpoint omits jobId | Submit knowledge form | UI shows `Invalid response from backend` and upload failed toast | Automated |
| TC-056 | P1 | Document Generation | Backend failure output | Status endpoint returns failed with output message | Generate document | Failure detail panel shows error type and message | Automated |
| TC-057 | P0 | Auth Callback | Unsupported callback type | Callback hash has unsupported type | Open `/auth/callback` | Error message and Back to Login appear | Planned |
| TC-058 | P0 | Auth Callback | Invite link missing tokens | Invite callback lacks access/refresh token | Open `/auth/callback` | Session cleared and fresh-link error shown | Planned |
| TC-059 | P0 | Auth Callback | Password mismatch | Valid callback consumed | Enter different passwords | Submit disabled or mismatch error shown | Planned |
| TC-060 | P0 | API Contract | `/webhook/me` active admin | Valid admin bearer | Call endpoint | Active admin profile returned | Planned API |
| TC-061 | P0 | API Contract | `/webhook/me` disabled user | Valid disabled bearer | Call endpoint | Disabled status returned and UI blocks access | Planned API |
| TC-062 | P0 | API Contract | `/webhook/users` non-admin | Registered bearer | Call endpoint | Denied or scoped response per backend contract | Planned API |
| TC-063 | P0 | API Contract | Upload missing bearer | No bearer | Call upload endpoint | 401/403 structured auth error | Planned API |
| TC-064 | P0 | API Contract | Generate missing bearer | No bearer | Call generation endpoint | 401/403 structured auth error | Planned API |
| TC-065 | P1 | API Contract | Status object response | Queued job | Poll status | UI accepts object response | Planned |
| TC-066 | P1 | API Contract | Status array response | Queued job | Poll status | UI accepts first array element | Planned |
| TC-067 | P1 | API Contract | Template status error | Status contains `{{` | Poll status | UI marks backend format error and stops polling | Planned |
| TC-068 | P1 | API Contract | Job not found retry | Status returns `not_found` | Poll 3 times | UI marks failed after retry cap | Planned |
| TC-069 | P0 | n8n Ingestion | Queue creator attribution | Valid upload | Execute workflow | `doc_ingestion_jobs` row has project/user/settings/config | Planned SIT |
| TC-070 | P0 | n8n Ingestion | Worker locking | Pending ingestion jobs | Execute worker twice | Only one job locked/processed | Planned SIT |
| TC-071 | P0 | n8n Ingestion | Extraction failure | Extractor down | Execute full engine | Job failed, metric failed, UI shows message | Planned SIT |
| TC-072 | P0 | n8n Ingestion | Chroma failure | Chroma unavailable | Execute full engine | Job failed and failure preserved | Planned SIT |
| TC-073 | P0 | n8n Generation | Queue creator attribution | Valid generation request | Execute workflow | `qa_jobs` row has document type and user/project attribution | Planned SIT |
| TC-074 | P0 | n8n Generation | Empty knowledge base | Project has no chunks | Generate document | Controlled failure with clear message | Planned SIT |
| TC-075 | P0 | n8n Generation | Quality gate failure | LLM output too short/missing sections | Execute full engine | Job failed with quality error and metric | Planned SIT |
| TC-076 | P0 | n8n Generation | Converter timeout | Converter service times out | Generate Confluence document | Job failed, timeout visible in UI/runbook | Planned SIT |
| TC-077 | P0 | n8n Generation | Jira auth failure | Bad Jira credential | Generate epics/stories | Job failed with Jira message and no duplicate partial issues | Planned SIT |
| TC-078 | P0 | n8n Generation | Confluence auth failure | Bad Confluence credential | Generate document | Job failed with Confluence message | Planned SIT |
| TC-079 | P0 | Supabase | RLS operational table hardening | Production-like DB | Run advisor/RLS tests | No broad anon/auth access to operational data | Planned Security |
| TC-080 | P0 | Supabase | Registered user direct access | Registered auth token | Query assigned/unassigned projects | Assigned only; unrelated project denied | Planned Security |
| TC-081 | P1 | Supabase | Analytics RPC correctness | Seed metrics | Run analytics RPCs | UI totals match SQL expected values | Planned SIT |
| TC-082 | P1 | Supabase | Audit insert coverage | Invite/settings/job actions | Check `qops_audit_events` | Audit rows exist with actor/action/project | Planned SIT |
| TC-083 | P1 | Storage | Upload path and public/private behavior | Upload artifacts | Inspect storage bucket | Files stored under expected project/job path | Planned SIT |
| TC-084 | P1 | Chroma | Collection and metadata | Ingestion completed | Query Chroma | Expected chunks and metadata present | Planned SIT |
| TC-085 | P1 | Settings | Runtime config used by workers | Save Jira/Confluence settings | Generate document | Worker uses saved settings version/config snapshot | Planned SIT |
| TC-086 | P1 | Health | Dependency degraded | Simulate downstream failure | Call `/webhook/health` | Health returns degraded/error with service details | Planned SIT |
| TC-087 | P1 | Analytics | Pipeline filter | Seed generation and ingestion metrics | Filter analytics by pipeline | Counts/costs reflect selected pipeline only | Planned SIT |
| TC-088 | P1 | Performance | Upload large document set | Staging data pack | Upload mixed artifacts | Request and worker duration within threshold | Planned Performance |
| TC-089 | P1 | Performance | Concurrent generation queue | Multiple queued jobs | Start worker | Jobs process without duplicate locking | Planned Performance |
| TC-090 | P1 | Accessibility | Auth fields label association | Login modal open | Query fields by label/screen reader | Email/password accessible names present | Planned; bug open |
| TC-091 | P1 | Accessibility | Modals close by Escape | Modal open | Press Escape | Modal closes and focus remains sane | Planned |
| TC-092 | P1 | Accessibility | Artifact keyboard selection | Doc form open | Focus card, press Space/Enter | Artifact selected | Planned |
| TC-093 | P0 | FAT | Admin full happy path | Staging ready | Login, create project, ingest, generate, verify analytics/audit | End-to-end business flow accepted | Planned FAT |
| TC-094 | P0 | FAT | Registered user happy path | Invited user assigned project | Accept invite, login, generate assigned project doc | Scoped user can complete allowed work | Planned FAT |
| TC-095 | P0 | FAT | Registered user denied unrelated project | Registered user assigned one project | Attempt to access unrelated records | UI/API prevent access | Planned FAT |
| TC-096 | P0 | FAT | Jira delivery acceptance | Jira configured | Generate Epics & User Stories | Jira issues are usable and linked in UI | Planned FAT |
| TC-097 | P0 | FAT | Confluence delivery acceptance | Confluence configured | Generate Test Strategy | Page/DOCX output is usable and linked | Planned FAT |
| TC-098 | P0 | Production Smoke | Auth and health smoke | Production deployed | Admin login, `/me`, `/health`, `/settings` | All basic checks pass | Planned Smoke |
| TC-099 | P0 | Production Smoke | Safe ingestion smoke | Production smoke project | Upload small non-sensitive BRD | Job completes, metrics/audit update | Planned Smoke |
| TC-100 | P0 | Production Smoke | Safe generation smoke | Ingested smoke project | Generate Test Strategy | Output link appears, metrics update | Planned Smoke |
