# Q-Ops Agent Test Strategy And Test Plan

Generated on 2026-05-09.

## 1. Executive Summary

Q-Ops Agent is a React/Vite TypeScript SPA backed by Supabase Auth, n8n webhook APIs, Supabase operational data, and AI-powered document generation workflows. The test approach uses Playwright for browser automation, mocked n8n/Supabase contracts for deterministic CI checks, and separate live smoke/regression suites for staging and production.

This plan now treats the whole application as in scope: frontend routes and UI states, Supabase Auth/session behavior, role-based access, every n8n API contract, queue creators, workers, full ingestion/retrieval engines, Supabase schema/RLS/metrics/audit, storage, Chroma, OpenAI, converter, Jira, Confluence, FAT, SIT, UAT, regression, and production smoke. See `FULL_APPLICATION_TEST_COVERAGE_MATRIX.md` for the full traceability matrix.

Primary quality goals:

| Goal | Target |
| --- | --- |
| Critical user journeys | 100% automated E2E smoke coverage |
| Auth and authorization paths | Admin and registered-user role coverage |
| Backend contract coverage | All documented n8n webhooks covered by mock and live API scenarios |
| Cross-browser confidence | Chromium in CI, plus WebKit/Firefox before releases if browser support is required |
| Responsive confidence | Desktop and mobile Playwright projects |
| Release gate | Build passes, Playwright smoke passes, no open Critical/High bugs |

## 2. Application Under Test

| Area | Scope |
| --- | --- |
| Public UI | Landing page, explore page, documentation/privacy/status modals |
| Authentication | Supabase password login, recovery, invite/recovery callback, logout, session restore/refresh |
| Dashboard | Overview, artifacts, document generation, knowledge base ingestion, analytics, settings, documentation |
| Admin flows | Project creation, user invite/edit, integration settings, health checks |
| Registered-user flows | Assigned project visibility, restricted settings, document generation within scope |
| n8n workflows | Upload queue creator, generation queue creator, worker polling, health, analytics, settings, users |
| Data and audit | Local cache fallback, backend repository hydration, audit/notification rendering |

## 3. Test Levels

| Level | Purpose | Tooling | Run Frequency |
| --- | --- | --- | --- |
| Static checks | TypeScript/build correctness | `npm run build` | Every PR |
| Unit tests | Pure helpers such as artifact mapping and status normalization | Future Vitest | Every PR |
| Component tests | Forms, panels, role-aware settings | Future Playwright CT or Testing Library | Every PR |
| E2E mocked tests | Deterministic user journeys without live external services | Playwright | Every PR |
| API contract tests | n8n webhook request/response shapes | Playwright APIRequest or Postman/Newman | Nightly and release |
| Workflow integration tests | n8n workflow behavior with test credentials and seeded data | n8n test executions | Release candidate |
| Production smoke tests | Minimal health and happy path after deploy | Playwright + live test account | Every deployment |

## 4. Environments

| Environment | Purpose | Data Policy |
| --- | --- | --- |
| Local mocked | Fast deterministic UI regression | Mocked Supabase/n8n responses only |
| Local integrated | Developer validation against local n8n | Synthetic documents, no customer data |
| Staging | Full integrated regression | Seeded Supabase users/projects and test-only credentials |
| Production | Smoke only | Dedicated smoke project and non-sensitive test files |

## 5. Test Data

Use synthetic projects such as `Payments Modernization` and `Claims Portal`. Test artifacts should include small dummy PDF/DOC/TXT/PNG files with no sensitive data. Live AI generation tests should use tiny fixture documents and should be rate-limited to smoke and release candidate runs.

Required test accounts:

| Account | Role | Purpose |
| --- | --- | --- |
| `admin@qops.test` | Admin | Project, user, settings, integration coverage |
| `analyst@qops.test` | Registered user | Project scoping and restricted settings |
| `disabled@qops.test` | Disabled user | Negative access test |
| `invitee@qops.test` | Pending invite | Invite acceptance flow |

## 6. Playwright Automation Scope

Current scripts added:

| Script | Purpose |
| --- | --- |
| `npm run test:e2e` | Runs Playwright desktop and mobile projects |
| `npm run test:e2e:headed` | Runs Playwright visibly for debugging |
| `npm run test:e2e:report` | Opens the HTML report |

Automated coverage implemented:

| Suite | Coverage |
| --- | --- |
| `tests/e2e/public.spec.ts` | Landing page, login modal, explore route, password reset request |
| `tests/e2e/dashboard.spec.ts` | Admin dashboard smoke, knowledge upload, document generation, settings save, registered-user scope |
| `tests/e2e/auth.spec.ts` | Supabase login success/failure, disabled profile rejection, logout/session clearing |
| `tests/e2e/dashboard-negative.spec.ts` | All document-type mappings, validation, invalid backend response, failed generation detail |
| `tests/e2e/fixtures/qops-fixtures.ts` | Mock Supabase Auth and n8n webhook contracts |

Current mocked desktop execution status:

| Suite | Result |
| --- | --- |
| Chromium mocked E2E | 16/16 passing |
| Full configured desktop + mobile | Known fail until mobile dashboard sidebar is fixed |

## 6A. FAT Plan

FAT validates business functionality with product owners and QA leads in a staging/UAT environment.

| FAT Phase | Coverage |
| --- | --- |
| FAT-Auth | Admin login, registered-user login, disabled user rejection, invite acceptance, password reset |
| FAT-Projects | Admin creates project, duplicate handling, registered-user project scoping |
| FAT-Ingestion | Upload all artifact types, worker completion, failure visibility, reprocess failed artifact |
| FAT-Generation | Generate Test Strategy, Test Plan, Risk Matrix, Test Cases, Epics/User Stories, RTM |
| FAT-Delivery | Confluence document links and Jira epics/stories are correct and usable |
| FAT-Operations | Analytics, audit, notifications, settings, integration tests, health/status |

FAT exit criteria: all P0/P1 FAT scenarios pass, or failures have signed business acceptance and documented rollback/mitigation.

## 6B. SIT Plan

SIT validates integration across React UI, Supabase Auth, n8n APIs, n8n workers, Supabase DB/storage, Chroma, OpenAI, converter, Jira, and Confluence.

| SIT Phase | Coverage |
| --- | --- |
| SIT-Auth | Supabase token validation and `/webhook/me` Q-Ops profile mapping |
| SIT-Queue | Upload/generation queue creators write jobs, metrics, logs, attribution |
| SIT-Workers | Workers lock oldest pending job once and transition terminal states |
| SIT-Ingestion | Extract, chunk, embed, store, complete metrics |
| SIT-Generation | Retrieve, generate, quality gate, publish to Jira/Confluence, complete metrics |
| SIT-Settings | Saved runtime settings resolve inside workers |
| SIT-Observability | Health, infrastructure load, analytics, audit, and runbook checks |

SIT evidence must include UI screenshots/traces, n8n execution IDs, Supabase row IDs, generated output links, and relevant logs.

## 7. Release Entry Criteria

| Criterion | Required State |
| --- | --- |
| Requirements | User stories and API contracts reviewed |
| Test data | Seed data available in staging |
| Credentials | Test-only Supabase/n8n/Jira/Confluence credentials configured |
| Observability | n8n executions, Supabase logs, and app console available |
| Automation | Playwright smoke suite passing locally |

## 8. Release Exit Criteria

| Criterion | Required State |
| --- | --- |
| Build | `npm run build` passes |
| E2E mocked | `npm run test:e2e` passes |
| Staging smoke | Admin login, ingestion, generation, analytics, and settings checks pass |
| Defects | No Critical/High open defects; Medium defects accepted by owner |
| Evidence | Playwright report, screenshots/traces for failures, and bug report archived |

## 9. Risk-Based Priorities

| Priority | Risk Area | Reason |
| --- | --- | --- |
| P0 | Authentication and role scoping | Protects dashboard and project data |
| P0 | n8n queue creators and worker status | Main product workflow depends on these |
| P1 | Document generation output integrity | Prevents malformed QA artifacts and Jira payloads |
| P1 | Settings/integration persistence | Bad config blocks Confluence/Jira/OpenAI flows |
| P2 | Analytics and audit | Important for operations and governance |
| P2 | Public marketing/explore pages | Lower business risk but affects first impression |

## 10. Execution Plan

| Phase | Scope | Owner | Evidence |
| --- | --- | --- | --- |
| Phase 1 | Static build and mocked Playwright smoke | QA Automation | Console output, HTML report |
| Phase 2 | Full mocked regression matrix | QA Automation | Playwright traces/screenshots |
| Phase 3 | Staging API and workflow integration | QA + Backend/n8n owner | API logs, n8n execution IDs |
| Phase 4 | Production smoke after release | Release owner | Smoke checklist, audit rows |
| Phase 5 | Defect triage and regression closure | Engineering + QA | Bug report and retest status |

## 11. CI Recommendation

Add these gates:

```bash
npm ci
npm run build
npm run test:e2e -- --project=chromium
```

Run mobile and optional browser matrix nightly:

```bash
npm run test:e2e -- --project=mobile-chrome
```

## 12. Live Test Safeguards

- Never use production customer documents in automated tests.
- Keep AI-generation live tests small and tagged for release/smoke only.
- Use dedicated test projects and clean them up after execution.
- Validate n8n webhook auth with missing, invalid, admin, and registered-user bearer tokens.
- Capture n8n execution IDs and Supabase audit rows for traceability.
