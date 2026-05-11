# Testing Strategy Documentation

Generated on 2026-05-08.

This document defines manual, integration, and future automated tests for Q-Ops Agent.

## Test Layers

| Layer | Purpose |
| --- | --- |
| Unit tests | Pure frontend helpers and small logic. |
| Component tests | Forms, role views, settings panels, status panels. |
| API contract tests | Validate n8n webhook request/response shapes. |
| Workflow tests | Validate n8n queue creators/workers/full engines. |
| Database tests | Validate Supabase schema, RLS, analytics queries. |
| End-to-end tests | Browser-driven full user journeys. |
| Production smoke tests | Minimal validation after deployment/cutover. |

## Frontend Unit Test Candidates

- `mapArtifactToDocumentType`
- `isTemplateError`
- status/failure message extraction in polling
- document label normalization
- project normalization
- artifact normalization
- generated document normalization
- audit event normalization
- registered-user project scoping
- notification scoping
- auth callback hash parsing

## Frontend Manual Regression Checklist

### Login

- Valid admin can sign in.
- Invalid password shows toast.
- Disabled user cannot access dashboard.
- Pending invite user cannot access dashboard until accepted.
- Logout clears session and returns to `/`.

### Invite

- Admin invites registered user.
- Admin assigns project role.
- Invitee opens link.
- Invitee sets password.
- Invitee lands on dashboard.
- Invitee sees only assigned projects.

### Password Reset

- Forgot password sends email.
- Recovery link opens `/auth/callback`.
- Password can be changed.
- Password reset audit endpoint is called.

### Project And Ingestion

- Admin creates project.
- Duplicate project name is blocked.
- Upload BRD/FRD/HLD/LLD/transcript/images.
- UI shows queued/processing/completed state.
- Failed ingestion shows failure message.
- Failed artifact can be reprocessed.

### Document Generation

- Generate each document type:
  - Test Strategy
  - Test Plan
  - Risk Matrix
  - Test Cases
  - Epics & User Stories
  - Traceability Matrix
- Polling reaches completed.
- Output panel shows token/cost/word count when present.
- Failed generation shows backend message.
- User stories/epics branch creates Jira items without mojibake/garbage prefix.

### Analytics

- Analytics loads for `all`.
- Analytics filters by pipeline and days.
- Cost/token totals match `qa_job_metrics`.
- Failures appear after failed job.
- Infrastructure load shows service statuses.

### Settings

- Admin sees all settings sections.
- Registered user sees only user persona sections.
- Jira settings save.
- Confluence settings save.
- Integration test single works.
- Integration test all works.
- Users refresh works.
- User role/status update works.

## API Contract Test Cases

For each endpoint:

1. Missing bearer token returns expected auth response if endpoint is auth-required.
2. Invalid bearer token fails.
3. Valid admin token succeeds.
4. Valid registered-user token is scoped.
5. Invalid payload returns structured error.
6. Happy path returns documented shape.

Critical endpoints:

- `/webhook/me`
- `/webhook/upload-test-artifacts`
- `/webhook/generate-qa-doc`
- `/webhook/job-status`
- `/webhook/job-status-retrieve`
- `/webhook/analytics-summary`
- `/webhook/settings`
- `/webhook/users/invite`
- `/webhook/users/project-assignments`

## n8n Workflow Test Cases

### Queue Creators

- Valid request creates exactly one job.
- Missing project returns validation error.
- Auth attribution is persisted.
- Runtime config version is captured.
- `JOB_QUEUED` metric is inserted.

### Workers

- Pending job is selected.
- Processing state is set.
- Already processing job is not duplicated.
- Completed job is not reprocessed.
- Failed full engine marks job failed.
- Terminal metric row is inserted.

### Full Engines

- Ingestion engine handles each file type.
- Generation engine handles each document type.
- Quality gate returns normalized output.
- Token/cost values pass to all downstream logging.
- Converter timeout is handled as failure.
- Jira/Confluence failures preserve error messages.

## Supabase Test Cases

- Migrations apply cleanly on empty database.
- Required indexes exist.
- Required FKs/check constraints exist.
- RLS policies match production intent.
- Service role can read/write operational tables.
- Authenticated regular user cannot access unrelated project data directly.
- Analytics views/functions return expected numbers.
- `qops_resolve_runtime_config` returns correct merged config.

## End-To-End Happy Paths

### Admin Full Path

1. Admin logs in.
2. Creates project.
3. Uploads artifacts.
4. Ingestion completes.
5. Generates Test Strategy.
6. Generated document appears.
7. Analytics updates token/cost/job count.
8. Audit event appears.

### Registered User Path

1. Admin invites user and assigns project.
2. User accepts invite.
3. User logs in.
4. User sees assigned project only.
5. User generates document for assigned project.
6. User cannot see unrelated project artifacts/outputs.

### Integration Path

1. Admin saves Jira settings.
2. Admin saves Confluence settings.
3. Admin runs integration tests.
4. Results persist in `qops_connection_test_results`.
5. Health/status displays current state.

## Production Smoke Test Suite

Run after every deployment:

1. UI loads.
2. Admin login.
3. `/webhook/health`.
4. `/webhook/me`.
5. `/webhook/settings`.
6. Create small test project.
7. Upload one small document.
8. Confirm ingestion completion.
9. Generate one small document.
10. Confirm generation completion.
11. Confirm `qa_job_metrics` terminal rows.
12. Confirm analytics summary.

## Future Automation Recommendation

- Use Playwright for browser tests.
- Use API test runner for n8n endpoints.
- Use SQL assertions for Supabase analytics.
- Add CI build check: `npm run build`.
- Add seeded test data for local/staging.
- Avoid running expensive OpenAI generation in every CI run; use mocked/pinned n8n test data where possible.

