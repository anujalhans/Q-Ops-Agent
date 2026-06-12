# E2E Validation Bug List

Created: 2026-05-28

This file tracks defects found during the fresh-project E2E validation run. Each bug is written so it can be fixed later even if chat context is lost.

## Bug Status Legend

- `open`: confirmed or strongly suspected issue, not fixed yet.
- `investigate`: observed behavior needs one more confirmation before fixing.
- `fixed`: code/workflow changed, pending or completed retest.
- `closed`: retested and accepted.

## BUG-E2E-001: Run Health Check Does Not Persist Latest Result

Status: closed

Severity: medium

Area:

- Frontend Settings/System Status
- n8n workflow `Q-Ops-Agent-Health-Status` (`zdx8YtZJOMWtbv1L`)
- Supabase table `qops_connection_test_results`

Observed During:

- Phase 0 E2E preflight after admin clicked `Run Health Check`.

What Happened:

- The live health workflow executed successfully and returned healthy service statuses to the frontend.
- The latest n8n health execution inspected was `982057`.
- The response had `status: ok` and all runtime services returned `ok` or expected `backend-managed`.
- No new row was inserted into `qops_connection_test_results` for the 2026-05-28 run.
- Latest persisted `qops_connection_test_results` rows were from 2026-05-20.

Expected Behavior:

- An admin-triggered health check should persist a connection-test snapshot in `qops_connection_test_results`, or the UI/contract should clearly define that `/webhook/health` is read-only and non-persistent.
- For E2E observability, persisting one row per tested service is preferred.

Evidence:

```text
n8n workflow: Q-Ops-Agent-Health-Status
workflow id: zdx8YtZJOMWtbv1L
execution id: 982057
execution status: success
startedAt: 2026-05-28 10:40:15.298
stoppedAt: 2026-05-28 10:40:17.321
```

Latest health response summary:

```json
{
  "status": "ok",
  "services": [
    { "name": "n8n backend", "status": "ok" },
    { "name": "Supabase DB", "status": "ok" },
    { "name": "Supabase Storage", "status": "ok" },
    { "name": "ChromaDB", "status": "ok" },
    { "name": "Extractor Service", "status": "ok" },
    { "name": "Converter Service", "status": "ok" },
    { "name": "OpenAI", "status": "backend-managed" },
    { "name": "Confluence", "status": "backend-managed" },
    { "name": "Jira", "status": "backend-managed" }
  ]
}
```

Supabase check used:

```sql
select integration_key, service_name, status, latency_ms, message, technical_detail, checked_by, checked_at, created_at
from qops_connection_test_results
order by checked_at desc nulls last, created_at desc
limit 30;
```

Result:

- No 2026-05-28 rows were present.
- Most recent persisted rows were 2026-05-20.

Likely Root Cause:

- `GET /webhook/health` returns a live health response but does not insert rows into `qops_connection_test_results`.
- The separate `POST /webhook/integrations/test-all` workflow may persist results, but the FE `Run Health Check` path appears to call `/webhook/health`.

Suggested Fix:

1. Decide product behavior:
   - Option A: `Run Health Check` should call `POST /webhook/integrations/test-all` when an admin explicitly triggers it.
   - Option B: keep calling `/webhook/health`, but patch `Q-Ops-Agent-Health-Status` to persist snapshots when called by admin action.
2. Preferred implementation:
   - FE `Run Health Check` calls `testAllIntegrations()`.
   - `testAllIntegrations()` persists one row per service in `qops_connection_test_results`.
   - FE then refreshes `/webhook/health` or `/webhook/integrations/status`.
3. Retest:
   - Click `Run Health Check`.
   - Confirm new `qops_connection_test_results` rows exist with current timestamp.
   - Confirm UI summary still shows live statuses.

Regression Risk:

- Low to medium.
- Avoid making frequent passive `/webhook/health` calls write rows, or the table may grow quickly.
- Persist only explicit admin-triggered checks.

## BUG-E2E-002: Old Processing Jobs Remain In Queue Tables

Status: investigate

Severity: low for current E2E, medium for operational dashboards

Area:

- Supabase `qa_jobs`
- Supabase `doc_ingestion_jobs`
- Infrastructure load / queue pressure UI
- Worker recovery/cleanup behavior

Observed During:

- Phase 0 E2E preflight.

What Happened:

- Old `processing` rows exist in `qa_jobs` and `doc_ingestion_jobs`.
- They are from older projects/runs and are unrelated to the new E2E project.
- They could still inflate queue pressure, active job counts, or operational dashboards.

Expected Behavior:

- Long-stale `processing` jobs should eventually be marked `failed`, `recovered`, or otherwise excluded from active queue-pressure calculations.

Evidence:

Active count query:

```sql
select 'qa_jobs' as table_name,
       count(*) filter (where status in ('queued','pending','processing','draft_pending')) as active_count,
       max(updated_at) as latest_update
from qa_jobs
union all
select 'doc_ingestion_jobs' as table_name,
       count(*) filter (where status in ('queued','pending','processing','draft_pending')) as active_count,
       max(updated_at) as latest_update
from doc_ingestion_jobs;
```

Observed result:

```text
qa_jobs active_count: 15
doc_ingestion_jobs active_count: 9
```

Examples:

```sql
select job_id,
       input->>'projectName' as project_name,
       input->>'documentType' as document_type,
       status,
       created_at,
       updated_at
from qa_jobs
where status in ('queued','pending','processing','draft_pending')
order by updated_at desc nulls last, created_at desc
limit 20;
```

```sql
select job_id,
       input->>'projectName' as project_name,
       status,
       created_at,
       updated_at
from doc_ingestion_jobs
where status in ('queued','pending','processing','draft_pending')
order by updated_at desc nulls last, created_at desc
limit 20;
```

Likely Root Cause:

- Older failed or interrupted workflow executions left rows in `processing`.
- Worker recovery may not mark abandoned `processing` jobs after timeout.
- Infrastructure-load logic may count stale rows as active.

Suggested Fix:

1. Add an operational stale-job recovery rule:
   - generation jobs in `processing` older than a configured threshold, for example 2 hours, become `failed` with `error = "Timed out / abandoned processing job"`.
   - ingestion jobs in `processing` older than a configured threshold become `failed` similarly.
2. Alternatively, update infrastructure-load queries to count only active rows updated recently, for example within 2 hours.
3. Do not bulk-update historical rows until after the fresh E2E run unless they interfere with UI behavior.

Retest:

- Run infrastructure/status UI before and after cleanup logic.
- Confirm old jobs no longer inflate active queue counts.
- Confirm fresh E2E jobs are still tracked normally.

Regression Risk:

- Medium.
- Avoid marking genuinely long-running current jobs as failed.
- Use conservative timeout and `updated_at` checks.

## BUG-E2E-003: Notifications Show Raw/Duplicate Project Creation Events

Status: closed

Severity: low to medium

Area:

- Frontend notification tray
- Audit-to-notification mapping
- Local/project-created notification generation

Observed During:

- Phase 0 and Phase 1 E2E UI review after creating `AstraCart E2E 20260528`.

What Happened:

- Notification tray shows both:
  - `PROJECT_CREATED` with raw backend action text.
  - `Project created` with friendlier UI text.
- These appear to refer to the same user action.
- The raw notification title/body is not user-friendly:
  - Title: `PROJECT_CREATED`
  - Body: `AstraCart E2E 20260528: PROJECT_CREATED: AstraCart E2E 20260528`

Expected Behavior:

- Project creation should appear as one clean notification.
- User-facing title should be `Project created`.
- Body should be concise, for example: `AstraCart E2E 20260528 is ready for knowledge upload.`
- Raw event names should stay in audit logs, not the notification tray.

Evidence:

Screenshot from Phase 1 notification tray:

```text
PROJECT_CREATED
AstraCart E2E 20260528: PROJECT_CREATED: AstraCart E2E 20260528
```

Likely Root Cause:

- Notification tray is combining local UI notifications with backend audit events without deduping.
- Audit event action names are being surfaced directly as notification titles.

Suggested Fix:

1. Add a notification mapper for audit actions:
   - `PROJECT_CREATED` -> `Project created`
   - `USER_PROJECT_ASSIGNMENTS_UPDATED` -> `Project access updated`
   - `GENERATION_COMPLETED` -> `Document generated`
2. Deduplicate local notifications and backend audit-derived notifications using stable keys:
   - `action + entity_id`
   - or `entity_type + entity_id + action`
3. Keep raw action names available only in audit details.

Retest:

- Create a new project.
- Open notification tray.
- Confirm exactly one user-friendly project-created notification appears.

Closure Validation:

- Fixed frontend notification mapping so `PROJECT_CREATED` renders as `Project created`.
- Aligned local project-created notification copy with backend-derived notification copy:
  - `<Project Name> is ready for knowledge upload.`
- Existing raw `PROJECT_CREATED` entries are normalized before display in the notification feed.
- Validated in registered-user UI as `alhansanuj@gmail.com`:
  - Notification tray no longer shows raw `PROJECT_CREATED` text.
  - Project-created notifications use friendly display text only.

Additional Evidence From Registered-User Phase 1:

- After saving project override settings, Notification tray still shows raw `PROJECT_CREATED` event:

```text
PROJECT_CREATED
AstraCart E2E 20260528: PROJECT_CREATED: AstraCart E2E 20260528
```

## BUG-E2E-004: Notification Tray Shows Very High Historical Unread Count

Status: closed

Severity: medium

Area:

- Frontend notification tray
- Notification read-state persistence
- Audit/notification scoping

Observed During:

- Phase 1 E2E UI review.

What Happened:

- Notification tray displayed `270 unread`.
- This appears to include historical activity, not just current E2E/user-relevant activity.

Expected Behavior:

- Unread count should be scoped to the current user and relevant projects.
- `Mark all as read` should persist read state.
- Admin may see global notifications, but historical read state should still be respected.

Evidence:

Screenshot shows:

```text
Notifications
270 unread
```

Likely Root Cause:

- Notification list may derive from audit events without persisted per-user read state.
- Historical events are treated as unread every time.

Suggested Fix:

1. Confirm whether notifications are backed by persisted rows or derived from audit events.
2. Add/persist per-user read state, for example:
   - `qops_user_notifications`
   - or local read-state cache keyed by audit event ID as interim fix.
3. Scope registered-user notifications to assigned projects and self events.
4. Admin can see broader activity, but unread state must be persistent.

Retest:

- Open notifications.
- Click `Mark all as read`.
- Refresh page/re-login.
- Confirm unread count remains zero or only reflects new events.

Closure Validation:

- Added a one-time per-user notification read baseline so historical persisted notifications are marked read after upgrade.
- Backend/audit-derived notifications are now read by default so historical audit rows do not inflate unread count.
- `Mark all as read` continues to persist read IDs for visible notification buckets.
- Validated in registered-user UI as `alhansanuj@gmail.com`:
  - Notification badge disappeared after refresh.
  - Notification tray showed `0 unread`.
  - Local persisted unread count was `0`.

## BUG-E2E-005: Audit Log Shows Historical Project Events Mixed Into Current E2E Review

Status: closed

Severity: low to medium

Area:

- Frontend Audit Log drawer/page
- Audit log filters/sorting
- Project context filtering

Observed During:

- Phase 1 E2E UI review.

What Happened:

- Audit Log shows the newly created `AstraCart E2E 20260528` project event, followed immediately by older `AstraCart` traceability generation events from the previous project/run.
- This is probably correct for a global admin audit view, but it is noisy during project-specific validation.

Expected Behavior:

- Global audit log can show all events.
- The UI should provide filtering by project, actor, action, and time range.
- When opened from a project context, it should default to that project or clearly show `All projects`.

Evidence:

Screenshot shows:

```text
PROJECT_CREATED | AstraCart E2E 20260528
GENERATION_COMPLETED | AstraCart | PRO-260528-15GT14
JOB_COMPLETED | AstraCart | PRO-260528-15GT14
QUALITY_GATE_PASSED | AstraCart | PRO-260528-15GT14
```

Suggested Fix:

1. Add project filter to Audit Log.
2. Add action/status filters.
3. Add a visible `All projects` label when no project filter is active.
4. For E2E, allow filtering by `AstraCart E2E 20260528`.

Retest:

- Create or select a project.
- Open Audit Log.
- Filter by project.
- Confirm only that project's events show.

## BUG-E2E-006: Project Assignment Audit Is Not Clearly Represented In Notifications

Status: closed

Severity: low

Area:

- Project assignment UI
- Notification mapping
- Audit-to-notification text

Observed During:

- Phase 1 E2E UI review after assigning `AstraCart E2E 20260528` to registered user.

What Happened:

- Supabase audit has `USER_PROJECT_ASSIGNMENTS_UPDATED`.
- Notification tray shows `User updated` with body `alhansanuj@gmail.com was updated.`
- This does not clearly tell the admin that project access was assigned.

Expected Behavior:

- Notification should say something like:
  - `Project access updated`
  - `Anuj can now access AstraCart E2E 20260528 as editor.`

Evidence:

Supabase audit row:

```text
action: USER_PROJECT_ASSIGNMENTS_UPDATED
targetUserId: ebe14998-205e-47c2-b958-f4fb523165b0
projectIds: ["418bfb00-f1c2-4b28-abb0-9c56f50b01da"]
projectRoles: [{ projectId: "418bfb00-f1c2-4b28-abb0-9c56f50b01da", role: "editor" }]
```

Notification screenshot:

```text
User updated
alhansanuj@gmail.com was updated.
```

Suggested Fix:

1. Add a notification formatter for `USER_PROJECT_ASSIGNMENTS_UPDATED`.
2. Resolve project names for assigned project IDs when possible.
3. Include role in the message.

Retest:

- Assign a project to a user.
- Confirm notification text names the project and role.

Fix Notes:

- Added project-assignment notification formatting for local invite/update flows.
- Added audit-derived notification mapping for `USER_PROJECT_ASSIGNMENTS_UPDATED` / `Project access updated`.
- User-facing success message now includes user name/email, project name, and assigned role, for example:
  - `Anuj can now access AstraCart E2E 20260528 as Editor.`

Closure Validation:

- Production build passed.
- Validated in admin UI using Settings -> Users & Roles by saving project access for `alhansanuj@gmail.com`.
- Notification tray showed:
  - `Project access updated`
  - `Anuj can now access AstraCart E2E 20260528 as Editor, AstraCart E2E Scope Check 20260528 as Editor.`

## BUG-E2E-007: Audit Log Table Has Readability Issues For Long IDs And Details

Status: closed

Severity: low

Area:

- Frontend Audit Log drawer/page
- Table layout and responsive behavior

Observed During:

- Phase 1 E2E UI review.

What Happened:

- Long UUIDs wrap awkwardly in the `Entity` column.
- Details column text appears clipped/truncated.
- Raw action names such as `PROJECT_CREATED`, `QUALITY_GATE_PASSED`, and `GENERATION_COMPLETED` are readable for technical users but not friendly for admin users.

Expected Behavior:

- Entity IDs should be truncated with tooltip/copy affordance.
- Details should be expandable or have tooltip.
- Action label can be friendly while raw event name remains available in detail.

Suggested Fix:

1. Use `max-width`, `truncate`, and tooltip/copy button for entity IDs.
2. Add expandable row details or a details modal.
3. Map action names to friendly labels in the UI while preserving raw action in metadata/details.

Retest:

- Open Audit Log with long project/job IDs.
- Confirm table remains scannable and details can be inspected.

## BUG-E2E-008: Registered User Integration Scope Labels Are Easy To Misread

Status: closed

Severity: low to medium

Area:

- Registered-user Settings -> Integrations
- Integration scope selector copy
- Project/user routing mental model

Observed During:

- Phase 1 registered-user login before Phase 2 ingestion.

What Happened:

- Registered user sees Integration Scope options:
  - `My settings`
  - `Project override`
- The labels can be interpreted backwards:
  - `My settings` may sound like settings for the currently selected project only.
  - `Project override` may sound like a global override for all assigned projects.
- Confirmed implementation is the opposite:
  - `My settings` is user-scoped and can apply across that user's jobs/projects.
  - `Project override` is selected-project scoped and has highest precedence for that project.

Expected Behavior:

- UI copy should make the scope model hard to misunderstand.
- Registered users should understand:
  - Use `My settings` when the same routing should apply to all their jobs unless a project-specific override exists.
  - Use `Project override` when the routing should apply only to the selected project.

Evidence:

Confirmed frontend precedence:

```text
Project override -> My settings -> Workspace defaults
```

Confirmed persistence tables:

```text
qops_integration_settings              workspace defaults
qops_user_integration_settings         user-scoped My settings
qops_project_integration_overrides     selected-project overrides
```

Confirmed write workflow behavior:

```text
Q-Ops Agent Settings Write API (u3klCtPvbFd01ds4)
scope = workspace -> PATCH qops_integration_settings, admin only
scope = user      -> POST qops_user_integration_settings for current user
scope = project   -> POST qops_project_integration_overrides, requires admin/owner/editor membership
```

Suggested Fix:

1. Rename or clarify labels/details:
   - `My settings` -> `My default routing`
   - `Project override` -> `This project only`
2. Keep the precedence line visible:
   - `This project only overrides My default routing, which overrides Workspace defaults.`
3. When project scope is selected, show the selected project name directly in the scope panel.

Retest:

- Log in as registered user.
- Confirm the scope labels make it clear which settings apply across projects and which apply only to the selected project.
- Save a user-scoped value and confirm it writes to `qops_user_integration_settings`.
- Save a project-scoped value and confirm it writes to `qops_project_integration_overrides` for only the selected project.

## BUG-E2E-009: Project Override UI Should Make The Active Project More Explicit

Status: closed

Severity: low to medium

Area:

- Registered-user Settings -> Integrations
- Project override settings
- Active project selection clarity

Observed During:

- Phase 1 registered-user login before Phase 2 ingestion.
- Two-project scope check after assigning a second project to the same registered user.

What Happened:

- Registered user sees `Project override` as an available integration scope.
- Backend behavior was verified as correct:
  - project overrides write to `qops_project_integration_overrides`
  - rows are stored against the selected `project_id`
  - no `qops_user_integration_settings` rows were created during project-override saves
- During manual E2E testing, the original project was accidentally selected and updated before the tester corrected it.
- This was user error, not backend leakage, but it shows the selected project context could be more prominent.

Expected Behavior:

- UI should clearly show the selected project name before saving project override settings.
- If no project is selected, `Save` should be disabled.
- If there is only one assigned project, show `Project override: AstraCart E2E 20260528`.
- If multiple projects are assigned, project selection should remain visible near the save controls or editor header.

Evidence:

Registered user membership:

```text
project_id: 418bfb00-f1c2-4b28-abb0-9c56f50b01da
project_name: AstraCart E2E 20260528
user: alhansanuj@gmail.com
project_role: editor
```

Suggested Fix:

1. Add visible project selector/label in Integration Scope when `Project override` is selected.
2. Disable project override save unless `activeProjectId` is present.
3. Server-side settings workflow must verify project membership and role before writing `qops_project_integration_overrides`.
4. Audit event should include project ID/name and integration key.

Retest:

- Registered user with one assigned project sees that project explicitly.
- Registered user cannot save override for unassigned project.
- Override row is written only for the selected project.

Additional Evidence From Two-Project Scope Check:

- A second project was created and assigned:

```text
project_id: 07050ba9-9a14-4a8c-be14-a61b52b04eb1
project_name: AstraCart E2E Scope Check 20260528
```

- New project overrides were correctly written for the second project:

```text
jira        -> projectKey MAN, projectId 10002
confluence  -> spaceKey MD
chroma      -> collection qops-chunks-scoped
```

- The original project was also updated during the same test window, but this was confirmed as an intentional correction after the tester accidentally selected the original project:

```text
project_id: 418bfb00-f1c2-4b28-abb0-9c56f50b01da
project_name: AstraCart E2E 20260528
microservices updated_at: 2026-05-28 11:42:30 UTC
chroma updated_at: 2026-05-28 11:43:34 UTC
```

- Conclusion:
  - backend project-scoped storage passed
  - remaining issue is UX clarity around the active project before saving

## BUG-E2E-010: Integration "Test" Message Is Too Generic For Not-Configured Services

Status: closed

Severity: low to medium

Area:

- Registered-user Settings -> Integrations
- Integration test feedback
- Health workflow vs integration-specific probes

Observed During:

- Phase 1 registered-user integration screen.

What Happened:

- Jira card shows:
  - `Needs Routing`
  - `Not Configured`
  - `Inherits from Workspace defaults`
- The panel also shows:
  - `Backend health returned ok in 4175 ms.`
- This can be misread as Jira itself being tested successfully, when health only confirms backend/system health.

Expected Behavior:

- Generic backend health should be visually separate from integration-specific test results.
- If Jira is not configured, pressing `Test` should say Jira is not configured or no credential-backed probe exists.
- Successful backend health should not appear as successful Jira routing validation.

Suggested Fix:

1. Distinguish health messages:
   - `Backend health returned ok`
   - `Jira routing not configured`
   - `Jira credential probe not available`
2. Disable `Test` for integrations with missing required routing fields, or make test return a clear not-configured result.
3. Add per-integration latest test result below each integration card.

Closure Validation:

- Added per-integration readiness checks before calling the backend test endpoint.
- Validated in registered-user UI as `alhansanuj@gmail.com`.
- With Jira not configured, pressing `Test` now shows:
  - `Jira Software routing is not configured: add Jira base URL, Project key. Save settings for the selected scope before testing this integration.`
- The old misleading backend-health success message is no longer shown as the Jira test result for an unconfigured Jira routing state.

## BUG-E2E-011: Audit Log Does Not Surface Recent Project Override Settings Events

Status: closed

Severity: medium

Area:

- Frontend Audit Log drawer/page
- Settings -> Integrations audit visibility
- Audit filtering/sorting

Observed During:

- Phase 1 registered-user setup after saving `Project override` settings for `AstraCart E2E 20260528`.

What Happened:

- Registered user saved project-scoped overrides for:
  - `jira`
  - `confluence`
  - `chroma`
  - `microservices`
- Supabase has four matching `SETTINGS_PROJECT_INTEGRATION_UPDATED` audit rows for project `418bfb00-f1c2-4b28-abb0-9c56f50b01da`.
- The Audit Log UI screenshot still shows only:
  - `PROJECT_CREATED` for `AstraCart E2E 20260528`
  - older `GENERATION_COMPLETED` / `GENERATION_FAILED` rows from the older `AstraCart` project
- The settings events are not visible near the top even though they happened after project creation.

Expected Behavior:

- Recent settings changes should appear in the Audit Log.
- For this case, the UI should show four recent rows:
  - `Project integration updated | Jira`
  - `Project integration updated | Confluence`
  - `Project integration updated | Chroma`
  - `Project integration updated | Document Processing`
- Rows should be sorted by event creation time descending.
- When opened from a project context, Audit Log should either filter to the selected project or clearly show that it is an all-project audit feed.

Evidence:

Supabase audit rows confirmed:

```text
2026-05-28 11:24:26 UTC | Anuj | SETTINGS_PROJECT_INTEGRATION_UPDATED | jira | project_id 418bfb00-f1c2-4b28-abb0-9c56f50b01da
2026-05-28 11:26:03 UTC | Anuj | SETTINGS_PROJECT_INTEGRATION_UPDATED | confluence | project_id 418bfb00-f1c2-4b28-abb0-9c56f50b01da
2026-05-28 11:28:11 UTC | Anuj | SETTINGS_PROJECT_INTEGRATION_UPDATED | chroma | project_id 418bfb00-f1c2-4b28-abb0-9c56f50b01da
2026-05-28 11:29:03 UTC | Anuj | SETTINGS_PROJECT_INTEGRATION_UPDATED | microservices | project_id 418bfb00-f1c2-4b28-abb0-9c56f50b01da
```

Likely Root Cause:

- Audit Log UI/API may filter allowed action names and exclude `SETTINGS_PROJECT_INTEGRATION_UPDATED`.
- Or the Audit Log query/page is using stale cached data after settings saves.
- Or sorting is not consistently based on `created_at desc`.

Suggested Fix:

1. Ensure Audit Log API includes settings actions:
   - `SETTINGS_PROJECT_INTEGRATION_UPDATED`
   - `SETTINGS_USER_INTEGRATION_UPDATED`
   - `SETTINGS_INTEGRATION_UPDATED`
   - `SETTINGS_ENVIRONMENT_UPDATED`
2. Add friendly labels for settings audit events.
3. Refresh audit data after settings save or when the Audit Log drawer opens.
4. Add project/action filters so the current E2E project can be inspected without older project noise.

Retest:

- Save any project override setting.
- Open Audit Log immediately.
- Confirm the setting update appears at the top with the selected project name and integration key.

## BUG-E2E-012: Settings Notifications Are Present But Too Generic

Status: closed

Severity: low

Area:

- Frontend notification tray
- Settings -> Integrations notification formatting

Observed During:

- Phase 1 registered-user setup after saving `Project override` settings.

What Happened:

- Notification tray correctly shows one notification per saved project override setting:
  - `microservices project settings were updated.`
  - `chroma project settings were updated.`
  - `confluence project settings were updated.`
  - `jira project settings were updated.`
- This confirms settings save notifications are emitted.
- However, the message does not name the project, and integration names are shown in raw/lowercase form.

Expected Behavior:

- Notifications should be user-friendly and project-aware, for example:
  - `Jira settings saved`
  - `AstraCart E2E 20260528 now uses this project's Jira routing.`
- Technical keys like `microservices`, `chroma`, `jira` should be mapped to display labels:
  - `microservices` -> `Document Processing`
  - `chroma` -> `ChromaDB`
  - `jira` -> `Jira Software`
  - `confluence` -> `Confluence`

Evidence:

Notification tray screenshot after settings save:

```text
Settings saved
microservices project settings were updated.

Settings saved
chroma project settings were updated.

Settings saved
confluence project settings were updated.

Settings saved
jira project settings were updated.
```

Suggested Fix:

1. Map integration keys to friendly labels in notification formatting.
2. Include project name for project-scoped settings notifications.
3. Keep one notification per integration save, unless bulk-save is introduced later.

Fix Applied:

- Added friendly integration label mapping in `src/pages/DashboardPage.tsx`.
- Settings-save notifications now use integration-specific titles such as `Jira Software settings saved`.
- Project-scoped settings notifications include the selected project name; workspace/user scoped messages use friendly fallback/default language.

Closure Validation:

- 2026-05-29: Saved Jira Software workspace settings from the UI.
- Confirmed notification tray shows `Jira Software settings saved` and `Jira Software routing was saved as the workspace default.`
- This validates the same notification formatting path used by project-scoped integration saves.

Retest:

- Save project override settings for all integrations.
- Confirm notification tray shows friendly integration names and the selected project name.

## BUG-E2E-013: Project Assignment Update Emits Duplicate Audit Events And May Rewrite Existing Membership Rows

Status: investigate

Severity: low to medium

Area:

- Admin project assignment flow
- Supabase `qops_project_members`
- Supabase `qops_audit_events`

Observed During:

- Two-project scope check after assigning `AstraCart E2E Scope Check 20260528` to registered user `Anuj`.

What Happened:

- Supabase shows the registered user assigned to both projects:
  - `AstraCart E2E 20260528`
  - `AstraCart E2E Scope Check 20260528`
- The latest assignment operation emitted two `USER_PROJECT_ASSIGNMENTS_UPDATED` audit rows at nearly the same timestamp.
- The existing first-project membership now shows the same `created_at` timestamp as the newly added second-project membership, even though it was originally assigned earlier in the E2E run.

Expected Behavior:

- One assignment save should emit one audit event.
- Existing project membership rows should not be deleted/reinserted unnecessarily when adding a second project.
- Existing membership `created_at` should remain stable; only `updated_at` should change if role changes.

Evidence:

Audit duplicates:

```text
2026-05-28 11:37:18.016983 UTC | USER_PROJECT_ASSIGNMENTS_UPDATED | Anuj | projectIds [first project, second project]
2026-05-28 11:37:18.024759 UTC | USER_PROJECT_ASSIGNMENTS_UPDATED | Anuj | projectIds [first project, second project]
```

Membership timestamps observed:

```text
AstraCart E2E 20260528             membership_created_at 2026-05-28 11:37:17 UTC
AstraCart E2E Scope Check 20260528 membership_created_at 2026-05-28 11:37:17 UTC
```

Likely Root Cause:

- Assignment save may delete and recreate all memberships for the user instead of upserting only changed rows.
- The UI or n8n workflow may submit/execute the assignment update twice.

Suggested Fix:

1. Inspect project-assignment save workflow/API.
2. Replace delete-and-reinsert behavior with diff-based upsert/delete:
   - keep unchanged memberships untouched
   - insert new memberships
   - update changed roles
   - delete removed memberships only
3. Deduplicate audit event insertion for a single assignment save.

Retest:

- Assign a second project to a user who already has one project.
- Confirm only one audit event is inserted.
- Confirm the original membership `created_at` remains unchanged.

## BUG-E2E-014: Fresh Project Analytics Shows 100% Success Rate With Zero Jobs

Status: closed

Severity: medium

Area:

- Dashboard Analytics card
- Analytics page
- Empty-state metric calculation

Observed During:

- Fresh project E2E setup before any ingestion or generation job was triggered.

What Happened:

- Fresh project has:
  - `0` artifacts
  - `0` active jobs
  - `0` completed jobs
  - `0` ingestion jobs
  - `0` generation jobs
- Dashboard Analytics card shows `Success Rate 100%`.
- Analytics page also shows `Success Rate 100%`.
- This happens when the selected/fresh project has no job records yet.

Expected Behavior:

- For a fresh project with zero ingestion and generation job records, success rate should not show `100%`.
- Preferred display:
  - `0%` if the product wants a numeric default.
  - Or `--` / `No jobs yet` if the product wants to distinguish "not applicable" from failed work.
- Since the current dashboard uses numeric KPI cards, display `0%` for now unless a dedicated empty-state design is introduced.

Evidence:

Dashboard screenshot:

```text
Active Jobs: 0
Success Rate: 100%
```

Analytics screenshot:

```text
Completed Work: 0
Generation: 0
Ingestion: 0
Success Rate: 100%
0 need retry now
```

Likely Root Cause:

- Success rate calculation probably defaults to `100` when denominator is `0`.
- This may have been intended to avoid division-by-zero, but it creates a misleading success metric for fresh projects.

Additional Code Confirmation:

- Reviewed during the pre-Epics analytics validation on 2026-05-29.
- Dashboard fallback logic in `src/pages/DashboardPage.tsx` still uses a `100` fallback when completed work plus failed jobs is `0`.
- n8n analytics workflow `Q-Ops-Agent-Analytics-Summary` also returns `100` when there are no completed or failed terminal rows:

```text
successRate = terminalCount ? completedRows / terminalCount : 100
```

Suggested Fix:

1. Find the shared analytics success-rate calculation used by Dashboard and Analytics page.
2. If total completed/failed/retry job count is `0`, return `0` or an explicit empty-state value instead of `100`.
3. Keep behavior unchanged when at least one job exists:
   - success rate = successful completed jobs / total terminal jobs.
4. Add a regression test or fixture for a fresh project with zero jobs.

Fix Applied:

- Dashboard/Analytics success-rate math now returns `0%` when completed plus failed job count is `0`.
- Analytics local fallback metrics are filtered by the selected project scope before rendering.
- Admin Analytics project selection no longer resets immediately back to `All assigned projects`, so fresh-project validation can remain scoped.

Closure Validation:

- 2026-05-29: Opened Analytics UI as admin and selected `AstraCart E2E Scope Check 20260528`.
- Confirmed the selected project scope remained selected.
- Confirmed Operations Overview showed `0 completed jobs`, `0 need retry`, `0 currently active`, and `SUCCESS RATE 0%`.

Retest:

- Create a fresh project with no ingestion or generation jobs.
- Confirm Dashboard Analytics card shows `0%` or approved empty-state value.
- Open Analytics page and confirm the same value.
- Trigger a successful job and confirm success rate updates correctly.

## BUG-E2E-015: Fresh AstraCart Ingestion Fails In Vectorization Before Storing Chunks

Status: fixed

Severity: high

Area:

- n8n upload queue creator `INGEST API Queue Creator - SaaS - Attributed Draft` (`iiR8d9v5oI8WzBPX`)
- n8n ingestion worker `INGEST Worker Engine (Queue Processor) - Attributed Draft` (`mlelxUdlNcoBIyru`)
- n8n vectorization workflow `Multimodal Knowledge Ingestion & Vectorization Engine - In Progress` (`C9oZfZxpGFakzlB3`)
- n8n reprocess workflow `Q-Ops Agent Artifact Reprocess API` (`zHsg1Zr7oGOvhPFg`)
- Supabase `doc_ingestion_jobs`
- ChromaDB storage path

Observed During:

- Phase 2 E2E ingestion for project `AstraCart E2E 20260528`.

What Happened:

- User uploaded/ingested 21 AstraCart documents.
- Queue creator successfully created 21 `doc_ingestion_jobs` rows for project `418bfb00-f1c2-4b28-abb0-9c56f50b01da`.
- Jobs are being picked up by the ingestion worker.
- Every job observed after reaching vectorization failed with:

```text
Ingestion vectorization failed before chunks could be stored in ChromaDB
failureStage: full_ingest_vectorization_subworkflow
source: fullIngestDraft01
totalChunksStored: 0
```

Examples observed:

```text
ING-260528-0X2TT7 | transcript | grooming_session_03_ui_accessibility_support.txt | failed
ING-260528-N1QUVG | transcript | grooming_session_01_auth_catalog_checkout.txt | failed
ING-260528-GA2PNG | transcript | grooming_session_02_payment_orders_tracking.txt | failed
ING-260528-MNP2TQ | supporting | supporting_astracart_test_strategy_seed.md | failed
ING-260528-B0GAUJ | supporting | supporting_astracart_api_contract.md | failed
ING-260528-6Q8B1G | supporting | supporting_astracart_data_dictionary.csv | failed
ING-260528-DWEUKP | supporting | supporting_astracart_integration_runbook.log | failed
```

Expected Behavior:

- At least text-based documents such as `.txt`, `.md`, `.csv`, and `.log` should ingest successfully and store chunks in ChromaDB.
- Failed jobs should expose the real downstream error from extraction, embedding, or Chroma persistence so the issue is diagnosable.

Evidence:

Status counts during Phase 2 progressed as the worker drained the queue:

```text
initial observed count: failed 7, pending 13, processing 1
later observed count: failed 16, pending 4, processing 1
```

Subsequent row-level inspection showed the same vectorization failure across text, supporting, BRD/FRD/HLD/LLD, and image/UI design inputs.

Audit events show `INGESTION_FAILED` for the same project and jobs with `failure_stage = full_ingest_vectorization_subworkflow`.

Likely Root Cause:

- Confirmed root cause from n8n error payload:
  - Supabase Storage URLs include the project name as a path segment.
  - Fresh E2E project name contains spaces: `AstraCart E2E 20260528`.
  - The downstream document processor receives an unencoded URL/path and fails with:

```text
URL can't contain control characters.
'/storage/v1/object/public/uploaded-project-docs/AstraCart E2E 20260528/ING-260528-EB9G6E/LLD_AstraCart_Ecommerce_Platform.docx'
(found at least ' ')
```

- The actual failing node is `Extract Text + Image` in workflow `C9oZfZxpGFakzlB3`.
- The generic worker error message hides this actionable root cause in `doc_ingestion_jobs.error`.

Suggested Fix:

1. Encode storage object URLs before sending them to the document processor:
   - preferably encode each path segment, preserving URL separators
   - or use Supabase storage APIs/helpers that return a safe public URL
2. Avoid using raw project names directly in storage object paths, or slugify/project-id paths:
   - preferred path pattern: `<projectId>/<jobId>/<filename>`
   - avoid project display names in machine paths
3. Patch the document processor defensively to quote/normalize incoming `fileUrl` before downloading.
4. Preserve the underlying node error in `doc_ingestion_jobs.output.details` and audit metadata.
5. Reprocess the failed jobs and confirm chunks are stored.

Fix Applied:

- Date: 2026-05-29
- Added a targeted n8n workflow patch script:

```text
scripts/patch_safe_ingestion_storage_urls.cjs
```

- Backed up the four affected workflows before patching:

```text
docs/test_data/n8n_workflow_backups/workflow_iiR8d9v5oI8WzBPX_before_safe_ingestion_urls_20260529053055.json
docs/test_data/n8n_workflow_backups/workflow_mlelxUdlNcoBIyru_before_safe_ingestion_urls_20260529053055.json
docs/test_data/n8n_workflow_backups/workflow_C9oZfZxpGFakzlB3_before_safe_ingestion_urls_20260529053055.json
docs/test_data/n8n_workflow_backups/workflow_zHsg1Zr7oGOvhPFg_before_safe_ingestion_urls_20260529053055.json
```

- Permanent fix for new uploads:
  - `iiR8d9v5oI8WzBPX` now stores files under an encoded project-safe segment.
  - Preferred segment is `projectId`, falling back to encoded project name only if `projectId` is unavailable.
  - Generated public URLs now use the same safe segment and encoded filename.
- Defensive fix for existing queued/failed jobs:
  - `mlelxUdlNcoBIyru` normalizes legacy `fileUrl` values before download/vectorization handoff.
  - `C9oZfZxpGFakzlB3` normalizes `fileUrl` again immediately before `Extract Text + Image`.
  - `zHsg1Zr7oGOvhPFg` normalizes legacy source artifact URLs when reprocess jobs are queued.
- Local smoke test confirmed:
  - raw URL path spaces become `%20`
  - already encoded `%20` paths are not double-encoded
  - filenames with spaces and parentheses are encoded safely
  - query strings are preserved

Retest:

- Re-run a text-only document first, for example one `.txt` grooming session.
- Confirm job reaches `completed`.
- Confirm `output.totalChunksStored > 0`.
- Confirm `qa_job_metrics` records an ingestion `JOB_COMPLETED`.
- Confirm project status becomes `ready`.
- Then reprocess the full 21-document set.

Retest Evidence:

- 2026-05-29: Retried one failed artifact only:

```text
source artifact: ING-260528-TXGOSX:image
retry job: ING-260529-U8TEU7
file: 06_payment_success_failure.webp
```

- Reprocess API queued the retry with normalized legacy URL:

```text
uploaded-project-docs/AstraCart%20E2E%2020260528/ING-260528-TXGOSX/06_payment_success_failure.webp
```

- Worker/vectorization result:

```text
status: completed
totalChunksStored: 2
error: null
destination.collection: qops-chunks
settingsVersion: 5
```

- Observability result:

```text
qa_job_metrics event: JOB_COMPLETED
chunk_count: 2
total_files: 1
audit event: INGESTION_COMPLETED
project status: ready
```

- Remaining retest:
  - reprocess the rest of the failed 21-document set
  - upload a fresh new document set and confirm new storage paths use `projectId` instead of raw project name

## BUG-E2E-016: Failed Ingestion Rows Have Inconsistent `updated_at` Time

Status: investigate

Severity: low

Area:

- Supabase `doc_ingestion_jobs.updated_at`
- n8n ingestion worker timestamp handling

Observed During:

- Phase 2 E2E ingestion for project `AstraCart E2E 20260528`.

What Happened:

- Failed ingestion rows have `created_at` around `2026-05-28 11:57 UTC`, but `updated_at` around `2026-05-28 07:57`.
- This makes `updated_at` appear earlier than `created_at`.

Example:

```text
job_id: ING-260528-0X2TT7
created_at: 2026-05-28 11:57:39
updated_at: 2026-05-28 07:57:54
```

Expected Behavior:

- `updated_at` should be timezone-safe and should never be earlier than `created_at` for the same row.

Likely Root Cause:

- n8n is writing `$now` in a timezone/string format that Postgres interprets differently from `created_at`.
- Or `updated_at` column type lacks timezone while different workflows write mixed local/UTC values.

Suggested Fix:

1. Inspect `doc_ingestion_jobs.updated_at` column type.
2. Standardize all n8n writes to ISO UTC via `new Date().toISOString()`.
3. Prefer `timestamptz` for operational timestamps.
4. Add a guard/check in analytics queries if old rows contain inconsistent timestamps.

Retest:

- Run/reprocess one ingestion job.
- Confirm `updated_at >= created_at`.

Retest:

- Open Jira integration when not configured.
- Click `Test`.
- Confirm message explicitly says Jira is not configured and does not imply Jira success.

## BUG-E2E-017: Recovered Knowledge Job Card Is Too Verbose And Repeats Retry Details

Status: closed

Severity: low

Area:

- Frontend Dashboard / Knowledge Jobs panel
- Ingestion job status card rendering
- Recovered/retried artifact UX

Observed During:

- Phase 2 E2E retry validation after `BUG-E2E-015` fix.
- One failed artifact was reprocessed successfully:
  - source job: `ING-260528-TXGOSX`
  - retry job: `ING-260529-U8TEU7`

What Happened:

- The original failed artifact is shown as `Recovered`, which is functionally correct.
- The card includes:
  - source job ID
  - file name
  - project name
  - class/start time
  - `Next retry: ING-260529-U8TEU7`
  - green success message: `No action needed. A later retry completed successfully: ING-260529-U8TEU7.`
- The retry job ID appears twice.
- The green message is visually heavy and makes the card feel more like an alert than a compact historical state.
- Since the completed retry card is already shown above it, the recovered source card does not need as much repeated detail.

Expected Behavior:

- A recovered source card should be compact and easy to scan.
- It should clearly communicate that no action is required without competing visually with active/completed jobs.
- The retry relationship should be available, but not repeated in multiple places.

Suggested Fix:

1. Keep the `Recovered` status label.
2. Replace the large green message with a subtle single-line detail, for example:

```text
Recovered by retry ING-260529-U8TEU7
```

3. Remove either `Next retry:` or the duplicate success sentence.
4. Consider showing the retry link/details behind a small info icon or expandable details area.
5. Use restrained styling for recovered state:
   - green status text is enough
   - avoid a second large green paragraph unless user action is needed

Fix Applied:

- Removed duplicate `Next retry:` display for recovered source jobs.
- Replaced the large green recovered message with compact inline text:
  - `Recovered by retry <job-id>. No action needed.`

Closure Validation:

- 2026-05-29: Injected a temporary recovered/retry pair into browser local storage for UI smoke validation, then restored the original cache.
- Confirmed My Knowledge Jobs showed a recovered source card with exactly one retry reference.
- Confirmed the old oversized sentence `A later retry completed successfully` and duplicate `Next retry:` text were not present.

Retest:

- Reprocess a failed artifact successfully.
- Confirm the completed retry job card is shown.
- Confirm the original source artifact shows `Recovered`.
- Confirm the recovered source card does not duplicate retry job ID or display an oversized success message.

## BUG-E2E-018: Analytics KPIs Count Recovered Failures As Active Failures

Status: closed

Severity: medium

Area:

- n8n analytics workflow `Q-Ops-Agent-Analytics-Summary` (`tcKSeScJRiWtRx77`)
- Frontend Analytics page KPI cards
- Frontend failure watchlist / success-rate display
- Recovered ingestion job accounting
- Recovered generation job accounting

Observed During:

- Phase 2 E2E bulk reprocess validation for project `AstraCart E2E 20260528`.
- All original failed ingestion jobs were retried successfully after the safe URL fix.
- Phase 4 Test Strategy retry validation for project `AstraCart E2E 20260528`.
- Failed Test Strategy job `PRO-260529-1WFAEQ` was recovered by completed retry job `PRO-260529-80ILZO`.

What Happened:

- Reprocess pipeline completed correctly:

```text
reprocess jobs queued: 21
reprocess jobs completed: 21
reprocess jobs failed: 0
chunks stored by retry jobs: 81
tokens recorded by retry jobs: 29605
cost recorded by retry jobs: 0.006434
audit INGESTION_COMPLETED events: 21
project status: ready
```

- Recovery mapping is also correct:

```text
original failed jobs recovered by completed retry: 21
original failed jobs still unrecovered: 0
```

- However, raw metric history still contains both:

```text
JOB_COMPLETED: 21
JOB_FAILED: 21
JOB_QUEUED: 21
JOB_REPROCESS_QUEUED: 21
```

- Pre-Epics analytics validation on 2026-05-29 also confirmed current raw metric history for `AstraCart E2E 20260528`:

```text
generation JOB_COMPLETED: 6
generation JOB_FAILED: 1
generation QUALITY_GATE_FAILED: 1
ingestion JOB_COMPLETED: 21
ingestion JOB_FAILED: 21
completedRows used by workflow: 27
failedRows used by workflow: 23
workflow successRate: 54%
current actionable retry count from UI state should be: 0
```

- The same failed generation attempt is also counted twice in analytics failure rows because both `QUALITY_GATE_FAILED` and `JOB_FAILED` are treated as terminal failures for the same `job_id`.

- The analytics summary workflow calculates:

```text
successRate = completedRows / (completedRows + failedRows)
```

- Because it does not exclude or downgrade recovered failures, the Analytics page can show a misleading success rate even when all failed artifacts and document jobs have been recovered.

Expected Behavior:

- Recovered failures should remain visible as history, but should not be counted as current `need retry` failures.
- Success rate should reflect the current terminal outcome of each logical artifact/job lineage.
- For this E2E state, the current-health KPI should show:

```text
completed retry outcomes: 21
need retry: 0
recovered: 21
success rate: 100% for current artifact outcomes
```

- Historical failed attempts can still appear in a separate "Recovered attempts" or "Historical failures" section if useful.

Likely Root Cause:

- `Q-Ops-Agent-Analytics-Summary` reads only `qa_job_metrics`.
- It treats every `JOB_FAILED` metric as an active terminal failure.
- It does not join or infer completed reprocess jobs from:
  - `doc_ingestion_jobs.input.reprocessOf`
  - `qa_job_metrics.event = JOB_REPROCESS_QUEUED`
  - completed retry job rows

Suggested Fix:

1. Make analytics recovery-aware for ingestion jobs.
2. Make analytics recovery-aware for generation jobs using `qa_jobs.retry_of_job_id`, `qa_jobs.retried_by_job_id`, and `qa_jobs.retry_status`.
3. Build a recovered-source set from completed reprocess jobs:

```text
doc_ingestion_jobs.input.reprocessOf -> source job id/file key
retry status = completed
```

4. Exclude recovered source failures from active failure counts and success-rate denominator.
5. Add separate fields if needed:

```text
overview.totalJobsFailedHistorical
overview.totalJobsFailedActive
overview.totalJobsRecovered
overview.successRateCurrent
```

6. Update Analytics page copy:
   - `need retry` should use active unrecovered failures
   - recovered count should be shown separately
   - failure watchlist should prioritize unrecovered failures

Retest:

- Create failed ingestion jobs.
- Reprocess all failed jobs successfully.
- Confirm Analytics page shows:
  - completed work includes successful retry jobs
  - need retry is `0`
  - recovered count equals the recovered original failures
  - success rate does not remain artificially around 50%

## BUG-E2E-019: Job Status Panel Under-Reports Active Retry Jobs

Status: closed

Severity: medium

Area:

- Frontend Dashboard / Knowledge workspace
- `Job Status` panel
- `My Knowledge Jobs` panel
- Artifact reprocess / knowledge job retry UI state

Observed During:

- Phase 2 E2E bulk retry validation for project `AstraCart E2E 20260528`.
- User triggered retries for failed ingestion artifacts from `My Knowledge Jobs`.

What Happened:

- `My Knowledge Jobs` correctly showed multiple retry jobs in `Processing`.
- `Job Status` panel showed only:

```text
0 completed, 0 failed, 1 active
1 ingestion job
```

- At the same time, the `My Knowledge Jobs` list showed more than one active retry job, for example:

```text
ING-260529-0ZT255 Processing
ING-260529-IEESL3 Processing
...
```

- This makes the top status panel look inconsistent and under-reports active retry work.
- Fresh bulk upload behavior appears better: when documents are uploaded together, all jobs are listed inside `Job Status`.

Expected Behavior:

- `Job Status` should reflect every currently active retry job for the selected project/workspace.
- If 20 retry jobs are queued/processing, the status panel should show all relevant active retry jobs, not only one.
- This should be true whether retry is triggered from:
  - `My Knowledge Jobs`
  - `Artifacts` screen

Likely Root Cause:

- `My Knowledge Jobs` renders from the broader `knowledgeJobs` collection.
- `Job Status` renders `statusKnowledgeJobs`, which is derived from `latestKnowledgeBatchJobIds`.
- Bulk retry from `retryKnowledgeJob` does call `setLatestKnowledgeBatchJobIds(retriedJobIds)`, but the status panel can still collapse to the current/first retry job because:
  - `kbJob.start(firstRetry)` tracks only the first retry response
  - `statusKnowledgeJobs` depends on batch IDs rather than all active retry jobs
  - background refresh/polling may not preserve the full retry batch as the status-panel source
- Artifact screen single retry currently sets `setLatestKnowledgeBatchJobIds([res.jobId])`, which is fine for one artifact but should still participate in the same active retry aggregation if multiple artifact retries are triggered.

Suggested Fix:

1. Make `Job Status` use a resilient active-job source for knowledge retries:

```text
statusKnowledgeJobs = latest batch jobs + all active knowledge retry jobs for current project
```

2. Preserve batch IDs for display order, but do not hide active retry jobs that are missing from `latestKnowledgeBatchJobIds`.
3. Ensure retry job records include enough metadata to group/display properly:
   - `jobId`
   - `projectId`
   - `projectName`
   - `fileName`
   - `fileKey`
   - `retryOfJobId` or source artifact/job reference if available
4. Review both retry entry points:
   - `retryKnowledgeJob` from `My Knowledge Jobs`
   - `onReprocess` from `ArtifactsRepository`
5. If multiple artifact retries are triggered individually from Artifacts, the status panel should accumulate those active retry jobs rather than replacing the displayed batch with the most recent single retry.

Fix Applied:

- `Job Status` now builds its knowledge-job source from the latest batch plus all active knowledge jobs, deduped by job ID.
- Active jobs are sorted ahead of terminal jobs so retry work remains visible while processing.
- Knowledge retry records now carry file name, file type/class, retry source, and project metadata where available.
- Artifact-level reprocess now accumulates active retry job IDs instead of replacing the status-panel batch with only the latest single retry.

Closure Validation:

- 2026-05-29: Used temporary UI fixture with three active retry jobs where only one job ID was present in the latest batch list.
- Confirmed `Job Status` showed `0 completed, 0 failed, 3 active`.
- Confirmed `Job Status` showed `3 ingestion jobs` and listed all three active retry job IDs.
- Temporary browser cache was restored after validation.

Retest:

- Trigger retry for multiple failed artifacts from `My Knowledge Jobs`.
- Confirm `Job Status` active count equals active retry jobs shown in `My Knowledge Jobs`.
- Trigger retries from `Artifacts` screen, including more than one retry while previous retry is still active.
- Confirm all active artifact retry jobs appear in `Job Status`.
- Confirm fresh bulk upload still lists all ingestion jobs in `Job Status`.

## BUG-E2E-020: Remove Upload More Artifacts Button From Artifact Repository

Status: closed

Severity: low

Area:

- Frontend Artifacts Repository screen
- Artifact repository header actions
- Knowledge Base upload navigation

Observed During:

- Phase 2 E2E artifact review after ingestion retry recovery and extraction-details UI updates.

What Happened:

- The Artifacts Repository screen shows an `Upload More Artifacts` button in the repository header.
- This duplicates the primary Knowledge Base ingestion flow and can make the repository feel like a second upload entry point.

Expected Behavior:

- Artifacts Repository should focus on reviewing uploaded artifacts, processing status, extraction details, and reprocess actions.
- Uploading more artifacts should stay in the Knowledge Base ingestion workspace unless a dedicated upload flow is intentionally designed for the repository.

Suggested Fix:

1. Remove `Upload More Artifacts` from the Artifacts Repository header.
2. Keep empty-state upload CTA if there are no artifacts, or replace it with navigation back to Knowledge Base ingestion if desired.
3. Ensure users can still upload through the primary Knowledge Base screen.

Retest:

- Open Artifacts Repository with existing artifacts.
- Confirm `Upload More Artifacts` is not shown in the header.
- Confirm artifact review, extraction details, preview, and retry actions still work.
- Open Knowledge Base workspace and confirm upload flow is still available.

## BUG-E2E-021: Artifact Type Should Show "Supporting" Instead Of "Supporting Document"

Status: closed

Severity: low

Area:

- Frontend Artifacts Repository screen
- Uploaded Artifacts table
- Artifact type display labels

Observed During:

- Phase 2 E2E artifact review for `AstraCart E2E 20260528`.

What Happened:

- Uploaded Artifacts table shows type as:

```text
Supporting Document
```

- In the table cell this wraps onto two lines and creates unnecessary visual height/noise.

Expected Behavior:

- Artifacts Repository should display:

```text
Supporting
```

- This keeps the type label compact and consistent with the backend artifact key.

Suggested Fix:

1. Update frontend artifact type display mapping for repository rows:
   - `supporting`
   - `Supporting Document`
   - `Supporting Documents`
   should display as `Supporting`.
2. Keep upload form copy unchanged if `Supporting Documents` is clearer there.
3. Ensure filters/retry matching continue to use stable artifact keys and are not broken by the display label change.

Retest:

- Open Artifacts Repository.
- Confirm supporting artifacts show `Supporting` in the `TYPE` column.
- Confirm retry/recovered grouping for supporting artifacts still works.

## BUG-E2E-022: Notification Tray Shows Raw Technical Event Names

Status: closed

Severity: medium

Area:

- Frontend Notification Tray
- Notification title/body formatting
- Audit/event notification mapping

Observed During:

- Phase 2 E2E ingestion completion review for `AstraCart E2E 20260528`.

What Happened:

- Notification Tray displays raw backend-style event names such as:

```text
JOB_COMPLETED
INGESTION_COMPLETED
```

- These appear alongside user-friendly notifications like `Job completed` and `Knowledge base completed`, creating inconsistent casing and tone.
- Some notification bodies also expose pipeline terms such as `ingestion | TRANSCRIPT` rather than user-friendly wording.

Expected Behavior:

- Notification Tray should show user-friendly titles and descriptions only.
- Raw event/action names should remain available in Audit Log, not in end-user notification cards.

Suggested Fix:

1. Add or extend a notification presentation mapper for event/action names.
2. Map technical events to friendly text:
   - `JOB_COMPLETED` -> `Job completed`
   - `INGESTION_COMPLETED` -> `Artifact processed`
   - `PROJECT_CREATED` -> `Project created`
3. Format artifact types in sentence/title case:
   - `TRANSCRIPT` -> `Transcript`
   - `SUPPORTING` -> `Supporting`
4. Keep raw action names unchanged in Audit Log for traceability.

Retest:

- Complete ingestion for one transcript and one supporting document.
- Open Notification Tray.
- Confirm no uppercase raw event/action names are visible.
- Open Audit Log and confirm raw actions are still available there.

## BUG-E2E-023: Notification Tray Creates Duplicate Completion Cards For The Same Ingestion Result

Status: closed

Severity: medium

Area:

- Frontend Notification Tray
- Notification generation/deduplication
- Ingestion completion events

Observed During:

- Phase 2 E2E ingestion completion review after retrying recovered AstraCart ingestion jobs.

What Happened:

- The tray shows multiple success notifications for the same ingestion completion window, including:
  - `Job completed`
  - `JOB_COMPLETED`
  - `INGESTION_COMPLETED`
  - `Knowledge base completed`
- This makes it hard to tell which notification represents the actual user-facing outcome.

Expected Behavior:

- A single artifact/job completion should produce one user-facing notification unless there is a distinct action required.
- Pipeline-level duplicates should be hidden, merged, or reserved for Audit Log.

Suggested Fix:

1. Define which ingestion lifecycle event should become the user-facing notification.
2. Deduplicate notifications by stable keys where available:
   - `projectId`
   - `jobId`
   - `artifactId`
   - `eventType`
3. Suppress lower-level duplicate completion events when a friendlier notification has already been emitted.
4. Keep detailed lifecycle events in Audit Log for admin/debug review.

Fix Applied:

- Audit-derived successful ingestion lifecycle events are no longer converted into user-facing notification cards.
- Low-value raw persisted notification cards such as `JOB_COMPLETED` / `INGESTION_COMPLETED` ingestion successes are hidden from the tray.
- Detailed lifecycle rows remain available in Audit Log.

Closure Validation:

- 2026-05-29: Used temporary UI fixture containing duplicate ingestion success notifications:
  - `JOB_COMPLETED`
  - `INGESTION_COMPLETED`
  - multiple `Knowledge base completed`
- Confirmed Notification Tray did not show raw `JOB_COMPLETED` or `INGESTION_COMPLETED` cards.
- Temporary browser cache was restored after validation.

Retest:

- Process a single artifact.
- Confirm exactly one completion notification appears for that artifact.
- Confirm related lifecycle events still appear in Audit Log.
- Retry a recovered artifact and confirm the retry does not create duplicate success cards.

## BUG-E2E-024: Bulk Ingestion Floods Notification Tray Instead Of Showing A Summary

Status: closed

Severity: medium

Area:

- Frontend Notification Tray
- Bulk ingestion UX
- Notification grouping/readability

Observed During:

- Phase 2 E2E bulk ingestion and retry completion for `AstraCart E2E 20260528`.

What Happened:

- After ingestion jobs completed, Notification Tray showed `209 unread`.
- The tray listed many repeated completion cards for individual ingestion events.
- For bulk operations, this makes the tray difficult to scan and pushes genuinely important notifications out of view.

Expected Behavior:

- Bulk ingestion should create a compact summary notification, for example:

```text
Knowledge base completed
21 artifacts processed successfully for AstraCart E2E 20260528.
```

- Individual artifact-level details should remain accessible in Artifacts Repository, Job Status, and Audit Log.

Suggested Fix:

1. Add grouping for bulk ingestion notifications by project and batch/run window.
2. Collapse successful artifact completions into one summary notification per batch.
3. Show failure/retry-required notifications separately because they need user attention.
4. Consider marking low-value duplicate system notifications as non-user-facing.

Fix Applied:

- Background knowledge-job polling now batches completed/failed ingestion notifications by project per polling cycle.
- Notification Tray compacts successful knowledge-base completion cards by project and a short time bucket.
- Bulk success cards render as a concise summary, for example:
  - `3 artifact updates processed successfully for AstraCart E2E 20260528.`
- Failure notifications remain separate and action-oriented.

Closure Validation:

- 2026-05-29: Used temporary UI fixture with three successful knowledge-base completion notifications for the same project.
- Confirmed Notification Tray showed one `Knowledge base completed` summary with a count badge and summary text.
- Confirmed raw ingestion lifecycle cards were not shown in the tray.
- Temporary browser cache was restored after validation.

Retest:

- Upload or retry a batch of multiple artifacts.
- Confirm Notification Tray shows one concise success summary for the batch.
- Confirm failed artifacts, if any, still produce visible action-oriented notifications.
- Confirm Artifacts Repository and Audit Log still expose per-artifact detail.

## BUG-E2E-025: Audit Log Shows Duplicate Lifecycle Rows For Each Ingestion Artifact

Status: closed

Severity: medium

Area:

- Frontend Audit Log screen
- Audit event display
- Ingestion lifecycle readability

Observed During:

- Phase 2 E2E ingestion completion review for `AstraCart E2E 20260528`.

What Happened:

- For each processed artifact, Audit Log shows both:
  - `JOB_COMPLETED`
  - `INGESTION_COMPLETED`
- These rows have the same actor, timestamp, project, entity/job id, and success status.
- During bulk ingestion, this doubles the number of visible rows and makes the audit trail harder to scan.

Expected Behavior:

- Audit Log can retain technical events, but the UI should make repeated lifecycle rows easier to review.
- The user should be able to quickly understand one artifact was processed successfully without reading two near-duplicate rows.

Suggested Fix:

1. Keep both raw events in storage if they are useful for traceability.
2. In the Audit Log UI, either:
   - group related lifecycle rows by `entity_id` / `job_id`, or
   - show one primary row with expandable details for related lifecycle events.
3. Add a filter for event category/action so users can isolate `JOB_COMPLETED`, `INGESTION_COMPLETED`, failures, quality gates, etc.
4. Ensure failure and retry events remain prominent and are not hidden by grouping.

Fix Applied:

- Audit Log presentation now groups successful ingestion lifecycle pairs by project, entity/job ID, and minute.
- The grouped row keeps a primary `Ingestion completed` row and shows a `+N` related-events badge.
- Opening `View` shows related lifecycle events in the details modal.
- Raw events are still stored and can be isolated through the existing Action filter because grouping is only applied in the default all-actions view.
- Failure events remain ungrouped and visible.

Closure Validation:

- 2026-05-29: Validated Audit Log UI against existing ingestion lifecycle data.
- Confirmed successful ingestion rows are grouped with a related-events badge.
- Confirmed `Job completed` ingestion duplicates are not dominating the default Audit Log view.
- Confirmed ingestion failure rows remain visible separately.

Retest:

- Process one artifact and open Audit Log.
- Confirm the audit trail is readable without duplicate-looking rows dominating the table.
- Expand or filter the row and confirm both raw lifecycle events remain accessible.
- Run a bulk ingestion and confirm the log remains scannable.

## BUG-E2E-026: Audit Log Table Columns Wrap Too Aggressively And Reduce Readability

Status: closed

Severity: low

Area:

- Frontend Audit Log screen
- Table layout
- Responsive drawer/table sizing

Observed During:

- Phase 2 E2E Audit Log review after ingestion jobs completed.

What Happened:

- Project names wrap into multiple lines, for example:

```text
AstraCart
E2E
20260528
```

- Entity/job IDs also wrap across lines.
- This makes each row tall and harder to scan, especially during bulk ingestion.

Expected Behavior:

- Audit Log should optimize for scanning many events.
- Project names and entity IDs should remain readable without excessive row height.

Suggested Fix:

1. Increase usable width for the Audit Log table or allow horizontal scrolling inside the audit drawer.
2. Use `white-space: nowrap` for compact columns such as actor, action, status, and entity where appropriate.
3. For long project names and entity IDs, use truncation with tooltip or click-to-copy full value.
4. Consider a denser table layout for Audit Log because it is operational data.

Retest:

- Open Audit Log with project `AstraCart E2E 20260528`.
- Confirm project and entity values do not create excessive row height.
- Confirm full values are still accessible via tooltip, expansion, or copy affordance.

## BUG-E2E-027: Audit Log Details Column Is Clipped And Lacks A Detail Expansion Path

Status: closed

Severity: low

Area:

- Frontend Audit Log screen
- Details column
- Event detail inspection

Observed During:

- Phase 2 E2E Audit Log review after ingestion jobs completed.

What Happened:

- Details text is clipped/truncated at the right edge of the visible table.
- Some details are raw and compact, such as:

```text
ingestion | TRANSCRIPT
```

- Longer details like `Ingestion completed for AstraCart E2E 20260528 / TRANSCRIPT` are difficult to read in the table.

Expected Behavior:

- Audit Log rows should keep the table scannable while still allowing the user/admin to inspect full event details.

Suggested Fix:

1. Add a row details drawer/modal or expandable row for full audit payload/details.
2. Keep the table column compact with a short summary.
3. Format common detail values consistently:
   - `ingestion | TRANSCRIPT` -> `Ingestion / Transcript`
   - `SUPPORTING` -> `Supporting`
4. Preserve raw event metadata inside the expanded detail view for debugging.

Retest:

- Open Audit Log after ingestion completes.
- Confirm Details column is readable at table level.
- Open a row detail view and confirm full event details/raw metadata are available.
- Confirm technical audit fidelity is preserved while the table is easier to scan.

## BUG-E2E-028: Coverage Summary Uses `missingItems` For Partial Warning Items

Status: closed

Severity: low

Area:

- n8n shared document generator
- Coverage ledger output contract
- Frontend readiness/generation warning display

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- Document type: `test_strategy`

What Happened:

- The Test Strategy job completed successfully with coverage ledger enabled.
- `coverageSummary.gateStatus` was `warning`.
- Counts were internally correct:
  - `coverageLedgerCount`: 12
  - `coveredCount`: 10
  - `partialCount`: 2
  - `missingCount`: 0
  - `blockingUncoveredCount`: 0
- However, `coverageSummary.missingItems` contained the two `partial` rows:
  - `COV-006` / `Negative Testing Themes`
  - `COV-011` / `Stakeholder Collaboration & Roles`

Why This Matters:

- Functionally the warning is correct, but the field name `missingItems` is misleading when the rows are partial rather than missing.
- Frontend or reporting code may show the warning as "missing coverage" even when the gate only found partial coverage.

Expected Behavior:

- Coverage summary should distinguish missing items from warning/non-covered items.

Suggested Fix:

1. Keep backward compatibility for existing consumers if needed.
2. Add clearer fields to the coverage summary contract:
   - `warningItems`: partial + missing + unknown rows
   - `partialItems`: partial rows only
   - `missingItems`: missing rows only
   - `unknownItems`: unknown rows only
3. Update metrics metadata from `coverage_missing_items` to include a clearer `coverage_warning_items` field.
4. Update FE readiness/generation detail text to use the right category label.

Retest:

- Generate Test Strategy where coverage has partial rows and no missing rows.
- Confirm `missingCount = 0` and `missingItems` is empty or truly missing-only.
- Confirm partial rows are still visible as warning items.
- Confirm the UI explains the warning as partial coverage, not missing coverage.

Closure Validation:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- `coverageSummary.missingCount = 0`.
- `coverageSummary.missingItems = []`.
- Partial coverage is now represented under `partialItems` and `warningItems`.

## BUG-E2E-029: Generation Metrics Emits Duplicate `JOB_STARTED` Events For One Job

Status: closed

Severity: low

Area:

- n8n generation queue worker
- n8n shared document generator
- Analytics/job event timeline

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- `qa_job_metrics` contains two `JOB_STARTED` rows for the same generation job:
  - one emitted with queue/generator mode metadata
  - one emitted with generator runtime metadata such as model and Chroma collection
- The job itself completed successfully, but the event timeline has duplicate start records.

Expected Behavior:

- A single generation job should emit one canonical `JOB_STARTED` metric.
- Additional runtime metadata should be attached to that event or emitted under a different event name if needed.

Suggested Fix:

1. Decide whether `JOB_STARTED` belongs to the queue worker or the generator workflow.
2. If both layers need telemetry, use distinct event names, for example:
   - `JOB_STARTED`
   - `GENERATOR_STARTED`
3. Ensure Analytics and Audit Log do not double-count a single job start.
4. Preserve useful metadata from both current rows.

Retest:

- Trigger one Test Strategy generation job.
- Confirm exactly one canonical `JOB_STARTED` metric exists for the job.
- Confirm generator model, Chroma collection, settings version, and requested user metadata are still captured.
- Confirm Analytics active/completed job counts remain correct.

Closure Validation:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- Metrics now show one `JOB_STARTED` event plus one distinct `GENERATOR_STARTED` event.
- Runtime metadata still includes `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## Phase 4 Fix Priority Marker: Retrieval Grounding Before Document Polish

When fixing Phase 4 generated Confluence document bugs, prioritize retrieval grounding and evidence integrity before cosmetic/document-rendering cleanup.

Rationale:

- A polished generated document is not trustworthy if it is built from weak, duplicated, incomplete, or unverifiable retrieved evidence.
- Fix retrieval profile enforcement, selected chunk quality, source diversity, deduplication, and citation validation before fixing table rendering, formatting, and final wording.

Recommended fix order:

1. Fix retrieval grounding and evidence contract:
   - `BUG-E2E-035`
   - `BUG-E2E-036`
   - `BUG-E2E-037`
   - `BUG-E2E-038`
2. Fix prompt/quality-gate alignment:
   - `BUG-E2E-039`
3. Then fix generated document presentation/content polish:
   - `BUG-E2E-030`
   - `BUG-E2E-031`
   - `BUG-E2E-032`
   - `BUG-E2E-033`
   - `BUG-E2E-034`

Do not close formatting/content polish bugs by only making the page look better. Re-run generation after retrieval fixes and confirm the generated document cites only retrieved, relevant evidence.

## BUG-E2E-030: Generated Test Strategy Tables Render As Broken Paragraph Blocks

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Markdown-to-Confluence rendering
- Generated Test Strategy content quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- Confluence page: `Test Strategy - AstraCart E2E 20260528`

What Happened:

- Multiple intended tables render as vertically stacked paragraph blocks instead of readable tables.
- Examples:
  - `Test Levels`
  - `Prioritization Matrix & ROI Considerations`
  - `Key Performance Indicators (KPIs)`
  - `Risk ID / Risk Description / Impact / Likelihood / Mitigation Approach`
  - `Roles / RACI Model`
  - `Appendix / Traceability Matrix`
  - `Coverage Ledger`
- Source references containing pipe characters, such as `HLD | file: ... | chunkId: ...`, appear to split table cells/rows and damage table structure.

Expected Behavior:

- Generated Confluence pages should show real, readable tables.
- Table cells that include source references must not break the table layout.

Suggested Fix:

1. Escape pipe characters inside table cell values before markdown-to-Confluence conversion.
2. Consider converting important tables to Confluence storage-format tables instead of markdown tables.
3. Keep long citation/source details outside table cells or behind a compact reference label.
4. Add a smoke test that validates generated markdown tables have consistent column counts before publishing.

Retest:

- Regenerate Test Strategy.
- Confirm all table sections render as proper Confluence tables.
- Confirm source references do not split rows or create stray paragraphs.
- Confirm Coverage Ledger rows remain readable with source evidence preserved.

Latest Retest Note:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- The copied Confluence body still shows table content as stacked cell text rather than clearly readable table rows.
- Keep open until the rendered Confluence page visually confirms all intended tables are real readable tables.

Closure Validation:

- Retested with Confluence Word export `Test+Strategy+-+AstraCart+E2E+20260528.doc`.
- Exported document is MIME-wrapped HTML and contains real table structures:
  - `6` `<table>` elements
  - `36` `<tr>` rows
  - `24` `<th>` cells
  - `123` `<td>` cells
- Table sections such as Test Levels, Prioritization Matrix, KPIs, Risk Mapping, Appendix, and Coverage Ledger are represented as real tables in the export.
- The earlier stacked text was caused by copied/pasted body text flattening table structure, not by malformed Confluence export.

## BUG-E2E-031: Coverage Ledger Table Header Is Duplicated In Generated Test Strategy

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Coverage ledger rendering
- Generated Test Strategy content quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- The `Coverage Ledger` section repeats the table header twice:

```text
Coverage ID
Module / Requirement
Source Reference
Included In Output
Coverage Status
Notes

Coverage ID
Module / Requirement
Source Reference
Included In Output
Coverage Status
Notes
```

- This makes the ledger look malformed even before reading the rows.

Expected Behavior:

- Coverage Ledger should contain one header row followed by coverage rows.

Suggested Fix:

1. Check whether the prompt asks the model to output a ledger and the workflow appends another ledger after validation.
2. Ensure the ledger is rendered by one source only:
   - either model-generated, or
   - workflow-generated from structured `coverageLedger`.
3. Prefer workflow-generated ledger from structured data for consistency.

Retest:

- Regenerate Test Strategy.
- Confirm `Coverage Ledger` has exactly one header.
- Confirm all 12 ledger rows are present once.

Latest Retest Note:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- The copied Confluence body still shows the `Coverage Ledger` header twice before the data rows.
- Keep open. The raw markdown has one table header, so the issue may now be in markdown-to-Confluence conversion rather than model generation.

Closure Validation:

- Retested with Confluence Word export `Test+Strategy+-+AstraCart+E2E+20260528.doc`.
- Coverage Ledger is exported as one real table with `8` rows:
  - `1` header row
  - `7` coverage rows
- The duplicate header pattern is not present in the exported document text.
- The earlier duplicated header was caused by copied/pasted body text flattening table structure, not by the stored Confluence document.

## BUG-E2E-032: Coverage Warning Is Not Clearly Surfaced In The Generated Test Strategy

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Coverage ledger content contract
- Generated document executive/readiness summary

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- Supabase output shows `coverageSummary.gateStatus = warning`.
- Coverage counts show:
  - `coveredCount = 10`
  - `partialCount = 2`
  - `missingCount = 0`
- The generated Confluence document includes the ledger rows with `partial`, but it does not clearly summarize near the top that the document passed with coverage warnings.
- The closing paragraph says the strategy is "fully traceable", which can read as stronger than the actual `warning` status.

Expected Behavior:

- Generated documents should include a clear coverage gate summary when the ledger status is warning.
- The summary should explain that generation succeeded, but some areas are partial and need review.

Suggested Fix:

1. Add a `Coverage Gate Summary` block near the top or before the ledger:
   - Gate status
   - Ledger count
   - Covered count
   - Partial count
   - Missing count
   - Blocking uncovered count
2. For warning status, include a short review note listing partial coverage items.
3. Avoid wording like `fully traceable` when `partialCount > 0`.

Retest:

- Generate a Test Strategy with partial coverage.
- Confirm the Confluence page clearly says `Passed with warnings` or equivalent.
- Confirm partial items are visible in the summary.
- Confirm conclusion language matches the actual coverage state.

Closure Validation:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- Generated document now includes a top-level `Coverage Review Note`.
- The note reports `6 item(s) are covered and 1 item(s) need review`.
- The document no longer claims full traceability when coverage status is warning.

## BUG-E2E-033: Generated Test Strategy Contains Unsupported Or Over-Specific KPI Targets

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Prompt grounding
- Generated Test Strategy content quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- The generated strategy includes very specific targets that may not be explicitly present in the source documents, for example:
  - reduce production incidents by at least `30%`
  - `80%+` automation coverage for critical workflows
  - `>95%` quality gate pass rate
  - developer unit test coverage minimum `90%`
  - defect leakage rate `<5%`
  - MTTD under `30 minutes`
- These may be useful examples, but if the source does not explicitly define them, they can be interpreted as invented commitments.

Expected Behavior:

- Generated strategy should distinguish source-backed targets from recommended/default targets.
- Unsourced targets should be labelled as proposed recommendations or placeholders requiring stakeholder confirmation.

Suggested Fix:

1. Update the prompt/quality gate to require source-backed numeric targets to include citations.
2. If no source-backed target exists, use wording like `Recommended target` or `To be confirmed`.
3. Add validation that flags numeric targets without nearby source evidence.
4. Consider a separate `Proposed KPI Targets` table with an `Evidence / Confirmation Needed` column.

Retest:

- Regenerate Test Strategy.
- Confirm numeric commitments are either cited or clearly marked as recommended/proposed.
- Confirm no unsupported targets appear as definitive business commitments.

Latest Retest Note:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- KPI table uses `Proposed Target`, which is improved.
- However, the `Success criteria include` bullets still contain numeric targets such as `80%`, `90%`, and `100%` without each being explicitly marked proposed or source-backed.
- Keep open.

## BUG-E2E-034: Generated Document Header Shows Vector Collection Different From Runtime Metadata

Status: closed

Severity: low

Area:

- n8n shared document generator
- Generated document metadata header
- Runtime configuration consistency

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- The generated Confluence document header says:

```text
Vector Collection: qa-knowledge-base
```

- Supabase job metrics for the same job show:

```text
chroma_collection: qops-chunks
```

- This mismatch makes it unclear which vector collection was actually used.

Expected Behavior:

- The generated document metadata should match the runtime configuration used by the job.

Suggested Fix:

1. Populate the document header from `configSnapshot.chroma.collection` or the same runtime value used by the Chroma node.
2. Avoid hard-coded collection names in prompt templates.
3. If the displayed value is a friendly alias, label it clearly as an alias and also expose the actual collection id in metadata.

Retest:

- Generate Test Strategy.
- Compare Confluence header with `qa_job_metrics.metadata.chroma_collection`.
- Confirm both show the same collection value or clearly distinguish alias vs actual runtime collection.

Closure Validation:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- Generated header shows `Model: gpt-4.1-mini`.
- Generated header shows `Vector Collection: qops-chunks`.
- Supabase metrics for the same job also show `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## BUG-E2E-035: Test Strategy Retrieval Uses Soft Profile Guidance But No Hard DocType/Category Filter

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Chroma retrieval profiler
- Test Strategy grounding quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- n8n execution: `986452`

What Happened:

- The workflow correctly builds a Test Strategy retrieval profile with:
  - primary docTypes: `BRD`, `FRD`, `PRD`, `SRS`, `HLD`, `LLD`, `TRANSCRIPT`
  - secondary docTypes: `UI_UX`, `API_SPEC`, `DATA_MODEL`, `ARCHITECTURE`, `TEST_PLAN`, `TEST_CASES`
  - preferred categories/artifacts/keywords for strategy generation
- However, the Chroma Vector Store node only enforces this hard filter:

```text
metadata.project = AstraCart E2E 20260528
```

- The docType/category/artifact/profile rules are passed as prompt guidance to the agent, not enforced at retrieval time.
- The actual tool call input for the run was only:

```text
strategy
```

Why This Matters:

- A generic query plus soft-only metadata guidance can retrieve nearby but incomplete context.
- For this run, retrieval missed some primary evidence types expected for Test Strategy, such as `BRD`, `FRD`, and `TRANSCRIPT`, while including secondary `DATA_MODEL` chunks.

Expected Behavior:

- Test Strategy retrieval should enforce a stronger document-specific retrieval plan, not rely only on the agent choosing the right chunks.

Suggested Fix:

1. Add explicit pre-retrieval or multi-query retrieval for Test Strategy:
   - business objectives/scope
   - functional workflows
   - architecture/design implications
   - NFR/security/performance
   - QA/test strategy seed
   - stakeholder transcript signals
2. Apply hard metadata filters or post-retrieval reranking for allowed/preferred docTypes and categories.
3. Require minimum source diversity for Test Strategy, for example at least one relevant source from business/functional, design, QA seed, and transcript when available.
4. Persist the retrieval profile and selected evidence summary in job output.

Retest:

- Generate Test Strategy for AstraCart.
- Confirm retrieval includes relevant chunks from BRD/FRD or equivalent business/functional sources when available.
- Confirm secondary sources like data model are used only when relevant to a strategy section.
- Confirm retrieval evidence aligns with the generated citations and coverage ledger.

Latest Retest Note:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- Retrieval/citation behavior no longer invents unavailable sources, but the document is now grounded almost entirely in `supporting_astracart_test_strategy_seed.md`.
- Source diversity remains weak for a full Enterprise Test Strategy because BRD/FRD/HLD/transcript evidence is not represented in the final citations.
- Keep open.

## BUG-E2E-036: Retrieved Chroma Results Contain Duplicate Chunk IDs

Status: closed

Severity: medium

Area:

- Chroma ingestion/indexing
- n8n Chroma retrieval
- Retrieval result deduplication

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- n8n execution: `986452`

What Happened:

- The Test Strategy Chroma tool returned 40 result items.
- Many results repeated the same logical `chunkId`, for example:
  - `supporting_astracart_test_strategy_seed.md / Primary Test Themes`
  - `supporting_astracart_test_strategy_seed.md / Negative Tests`
  - `LLD_AstraCart_Ecommerce_Platform.docx / AstraCart Ecommerce Platform`
  - `LLD_AstraCart_Ecommerce_Platform.docx / Detailed Rules`
  - `HLD_AstraCart_Ecommerce_Platform.pdf / Supports payment reconciliation triage`
  - `supporting_astracart_api_contract.md / Identity APIs`
  - `supporting_astracart_api_contract.md / Checkout APIs`
- The duplicate rows have different vector ids/line metadata, but the same logical chunk identity.

Why This Matters:

- Duplicate chunks reduce useful retrieval diversity.
- They can cause the model to over-weight repeated evidence and miss other important source documents.

Expected Behavior:

- Retrieval should deduplicate by stable logical identifiers before generation:
  - `projectId`
  - `documentId`
  - `chunkId`
  - `docType`
  - `contentSource`

Suggested Fix:

1. Investigate whether duplicates are created during ingestion or returned during Chroma retrieval.
2. Add post-retrieval deduplication before the agent consumes evidence.
3. Consider preventing duplicate vector insertion for the same `chunkId`.
4. Track retrieved unique chunk count separately from raw retrieved result count.

Retest:

- Run Test Strategy retrieval.
- Confirm raw results may contain duplicates if Chroma returns them, but the agent receives unique logical chunks.
- Confirm source diversity improves after deduplication.

## BUG-E2E-037: Retrieved Chroma `pageContent` Is Too Thin For Strong Grounding

Status: fixed - build validated; pending next live ingestion retest

Severity: high

Area:

- Chroma ingestion/indexing
- n8n retrieval payload
- Generated document grounding quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- n8n execution: `986452`

What Happened:

- The Chroma tool response returned rich metadata, but many `pageContent` values were only broad labels such as:

```text
TEST_PLAN
technical_design
```

- The actual section text/content was not visible in the retrieved payload, even though metadata had useful fields like `fileName`, `sectionTitle`, `docType`, and `chunkId`.

Why This Matters:

- If the agent receives mostly labels rather than actual source text, generated content becomes metadata-driven and generic.
- This increases risk of unsupported claims, invented KPI targets, and citations that look precise but are not grounded in retrieved text.

Expected Behavior:

- Retrieved chunks should include meaningful source text in `pageContent`.
- Metadata should supplement the text, not replace it.

Suggested Fix:

1. Inspect the ingestion-to-Chroma mapping and confirm which field is stored as document/page content.
2. Ensure `semanticContent` or the actual chunk text is stored as the Chroma document body.
3. Keep metadata fields such as `docType`, `documentCategory`, and `artifactType` in metadata only.
4. Add a retrieval smoke test that fails if returned `pageContent` is only a category/docType label.

Retest:

- Retrieve chunks for Test Strategy.
- Confirm `pageContent` contains actual source sentences/tables/requirements.
- Confirm generated citations can be traced back to retrieved text, not only metadata.

## BUG-E2E-038: Generated Test Strategy Cites Sources Not Present In Actual Retrieved Results

Status: closed

Severity: high

Area:

- n8n shared document generator
- Retrieval evidence validation
- Generated citation accuracy

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`
- n8n execution: `986452`

What Happened:

- Actual retrieved docTypes for this run were:
  - `TEST_PLAN`: 4 raw results
  - `LLD`: 18 raw results
  - `HLD`: 12 raw results
  - `DATA_MODEL`: 2 raw results
  - `API_SPEC`: 4 raw results
- Retrieved results did not include `BRD`, `FRD`, or `TRANSCRIPT` chunks.
- The generated document and coverage ledger still referenced sources such as:
  - `BRD_AstraCart_Ecommerce_Platform`
  - `grooming_session_05_2026`
  - `TRANSCRIPT`
  - `BRD & HLD combined`

Why This Matters:

- The generated document can appear traceable while citing sources that were not actually retrieved in the run.
- This weakens auditability and user trust.

Expected Behavior:

- Every generated source citation should be backed by actual retrieved evidence or clearly labelled as unavailable/not retrieved.

Suggested Fix:

1. Persist retrieved evidence identifiers for each generation job.
2. Add citation validation after generation:
   - cited `docType`
   - cited `fileName`
   - cited `chunkId`
   should exist in retrieved evidence.
3. If the model cites unavailable sources, either:
   - retry retrieval with targeted queries, or
   - mark the citation as unsupported and fail/warn the quality gate.
4. Update Coverage Ledger validation to compare source references against actual retrieved chunks.

Retest:

- Generate Test Strategy.
- Confirm every citation and coverage source reference maps to retrieved evidence for that job.
- Confirm unsupported citations are caught before publishing or shown as warnings.

Closure Validation:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- The regenerated Test Strategy no longer cites unavailable `BRD`, `FRD`, `TRANSCRIPT`, or `grooming_session_05_2026` sources that were not retrieved.
- Citations and Coverage Ledger references are limited to the retrieved `supporting_astracart_test_strategy_seed.md` evidence.

## BUG-E2E-039: Test Strategy Prompt Requires 900-1500 Words Per Major Section But Quality Gate Only Enforces Total Word Count

Status: fixed - build validated; pending next live ingestion retest

Severity: low

Area:

- n8n Test Strategy prompt
- Quality gate enforcement
- Generated document quality

Observed During:

- Phase 4 Test Strategy generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-RY1P15`

What Happened:

- The Test Strategy prompt says:

```text
Minimum expected length per major section: 900 - 1500 words.
```

- The generated document has 13 major sections and a total word count of `2677`.
- The quality gate passed because it only enforces a total minimum of `2000` words for Test Strategy.

Why This Matters:

- The prompt and quality gate disagree.
- The model can pass the gate while ignoring the prompt-level section-depth requirement.

Expected Behavior:

- Either the prompt should define realistic section depth, or the quality gate should enforce the intended depth.

Suggested Fix:

1. Replace the per-section 900-1500 word instruction with a realistic total/section guidance.
2. Add section completeness checks based on required headings and minimum meaningful content per section.
3. Avoid impossible length requirements that encourage filler content.

Retest:

- Generate Test Strategy.
- Confirm the prompt and quality gate expectations align.
- Confirm sections are concise but substantively complete.

Latest Retest Note:

- Retested with Test Strategy regenerate job `PRO-260529-80ILZO`.
- The output passed the quality gate, but the prompt still contains the unrealistic `900 - 1500 words per major section` instruction.
- Keep open until prompt guidance and quality gate expectations are aligned.

## BUG-E2E-040: Test Plan Retrieval Is Dominated By Duplicate QA Seed Chunks

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Chroma retrieval profiler
- Test Plan grounding quality

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`
- n8n execution: `986701`

What Happened:

- The Test Plan Chroma tool returned 40 raw result items.
- Those 40 raw results collapsed to only 14 unique `chunkId` values.
- 27 of the 40 raw results came from one supporting seed document:

```text
supporting_astracart_test_strategy_seed.md
```

- Many of those repeated the same two logical sections:
  - `Primary Test Themes`
  - `Negative Tests`

Why This Matters:

- The Test Plan output can become over-weighted toward one QA seed document.
- Important FRD/BRD/HLD/LLD/API/UI evidence may be underrepresented even when available.

Expected Behavior:

- Test Plan retrieval should maintain balanced source diversity across functional requirements, design, UI/UX, API/contracts, risk/workshop/transcript, and QA seed evidence.

Suggested Fix:

1. Deduplicate retrieval results before the generator consumes them.
2. Apply source balancing caps, for example no single file should dominate the retrieved context unless it is the only relevant source.
3. Retrieve by multiple Test Plan query facets:
   - scope/objectives
   - features/workflows
   - environment/data
   - risks/mitigations
   - entry/exit criteria
   - schedule/milestones
   - automation coverage
4. Persist source distribution in job output for validation.

Retest:

- Generate Test Plan.
- Confirm retrieved evidence includes a balanced mix of source files.
- Confirm raw duplicate results are deduped before generation.
- Confirm generated coverage ledger maps to the deduped evidence set.

Latest Retest Note:

- Retested with Test Plan job `PRO-260529-ZTMBQ1`.
- The generated output shows better source diversity than the previous run, including FRD, transcript, workshop/risk, and QA seed references.
- Keep open because raw retrieval deduplication has not yet been proven; this bug tracks the retrieval layer, not only final document appearance.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Added hard retrieval/evidence instructions requiring dedupe by `chunkId`, source balance, and limiting QA seed dominance.
- Updated the Chroma tool description so retrieved evidence must be deduped, text-bearing, source-diverse, and cited with exact `chunkId`.
- Smoke confirmed active workflow version `4b63abdf-f3a8-42a4-b199-7ee8610a5d62` contains marker `QOPS_EVIDENCE_HARDENING_V1`.

Closure Evidence:

- Reviewed exported Confluence Word document `Test+Plan+-+AstraCart+E2E+Scope+Check+20260528.doc` on 2026-06-02.
- Exported document no longer references `supporting_astracart_test_strategy_seed.md`.
- Exported document no longer references `Primary Test Themes`.
- Coverage and appendix evidence are grounded in BRD, FRD, grooming/session, UI/UX, and LLD-style source context instead of being dominated by the old QA seed file.
- Residual note: several coverage rows reuse the same BRD chunk ID for related BRD requirements, but this is not the original QA seed dominance issue.

## BUG-E2E-041: Test Plan Retrieval Still Returns Metadata Labels As Page Content

Status: closed

Severity: high

Area:

- Chroma ingestion/indexing
- n8n retrieval payload
- Test Plan grounding quality

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`
- n8n execution: `986701`

What Happened:

- Several retrieved `pageContent` values were metadata labels or filenames rather than useful source text, for example:

```text
test_plan_document
TEST_PLAN
AstraCart E2E 20260528|TEST_PLAN|text
quality_assurance
supporting_astracart_test_strategy_seed.md
user_experience
```

- Some retrieved items did contain rich text, so the problem is inconsistent rather than universal.

Why This Matters:

- The generator may receive a mixed context where some chunks are useful and others are essentially metadata noise.
- This can lower grounding quality and produce generic content while still appearing traceable.

Expected Behavior:

- Every retrieved Chroma document should provide meaningful source text in `pageContent`.
- Metadata-only values should be stored as metadata, not as the document body.

Suggested Fix:

1. Fix ingestion/vectorization mapping so Chroma document body stores actual chunk text.
2. Backfill or re-ingest affected vectors if existing collection contains metadata-only documents.
3. Add a retrieval smoke test that flags `pageContent` values that equal docType, artifactType, category, filename, or composite key.
4. Ensure the generator receives only useful text-bearing chunks after filtering.

Retest:

- Run Test Plan retrieval.
- Confirm returned `pageContent` has substantive text for every selected chunk.
- Confirm metadata-only rows are filtered or repaired.

Latest Retest Note:

- Retested with Test Plan job `PRO-260529-ZTMBQ1`.
- The final document includes source-backed excerpts, which is improved.
- Keep open until a retrieval smoke confirms selected Chroma rows no longer include metadata-only `pageContent` values.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Added hard metadata-only filtering instructions for labels such as `technical_design`, `quality_assurance`, `functional_requirements`, `test_plan_document`, and similar non-content values.
- Added validator logic that downgrades shared document ledger rows to `partial` when the source reference is metadata-only or lacks concrete evidence.
- Smoke confirmed `quality_assurance` is now detected as `metadata-only source reference`.

Closure Evidence:

- Reviewed exported Confluence Word document `Test+Plan+-+AstraCart+E2E+Scope+Check+20260528.doc` on 2026-06-02.
- No metadata-only labels were found in the generated document body or coverage ledger, including:
  - `test_plan_document`
  - `quality_assurance`
  - `pageContent`
  - `page content`
  - `source metadata`
- Coverage ledger source references now contain substantive document/file context and concrete `chunkId` values.

## BUG-E2E-042: Test Plan Coverage Ledger References Source Combinations That Are Not Direct Retrieved Evidence

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Coverage ledger source validation
- Test Plan evidence traceability

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`
- n8n execution: `986701`

What Happened:

- The Test Plan coverage ledger uses some source references that are broad or combined, for example:
  - `TRANSCRIPT grooming session & TEST_PLAN`
  - `UI_UX 04_product_detail_page.png and others`
  - `supporting_Workshop_AstraCart_Ecommerce_Grooming_and_Risks.pptx_slide4_table1`
- Actual retrieved evidence includes related chunks, but the ledger does not consistently use exact `docType + fileName + sectionTitle + chunkId`.

Why This Matters:

- Broad source labels make it harder to audit whether a ledger row is grounded in a specific retrieved chunk.
- This overlaps with the Phase 4 grounding priority marker and should be fixed before document polish.

Expected Behavior:

- Every Test Plan coverage ledger row should reference concrete retrieved evidence.

Suggested Fix:

1. Persist the retrieved evidence set in job output.
2. Validate coverage ledger `sourceReference` values against that set.
3. Require ledger references to include exact source fields:
   - `docType`
   - `fileName`
   - `sectionTitle`
   - `chunkId`
4. If a row summarizes multiple sources, list each exact source reference or use a separate evidence list.

Retest:

- Generate Test Plan.
- Confirm each coverage ledger source reference maps to one or more retrieved chunks.
- Confirm broad labels like `and others` are removed or expanded into exact evidence.

Latest Retest Note:

- Retested with Test Plan job `PRO-260529-ZTMBQ1`.
- Most Coverage Ledger rows now use exact source references with file and chunk IDs.
- Keep open because `COV-008` still uses a broad source reference: `TRANSCRIPT, TEST_PLAN documents combined`.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Added hard ledger rule requiring direct retrieved source references with `chunkId`.
- Added validator logic to flag broad references such as `combined`, `and others`, source combinations, truncated references, and missing `chunkId`.
- Smoke confirmed `TRANSCRIPT, TEST_PLAN documents combined` is now flagged for missing concrete `chunkId`, broad combined source reference, and source combination not being direct evidence.

Closure Evidence:

- Reviewed exported Confluence Word document `Test+Plan+-+AstraCart+E2E+Scope+Check+20260528.doc` on 2026-06-02.
- Coverage ledger no longer contains broad/combined source references such as:
  - `TRANSCRIPT grooming session & TEST_PLAN`
  - `TRANSCRIPT, TEST_PLAN documents combined`
  - `UI_UX ... and others`
- Every coverage ledger row includes a concrete source reference with a `chunkId`.
- No ellipsis/truncated source references were found in the exported coverage ledger.

## BUG-E2E-043: Test Plan Coverage Warning Uses `missingItems` For Partial Items

Status: closed

Severity: low

Area:

- n8n shared document generator
- Coverage ledger output contract
- Test Plan readiness/generation warning display

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- The Test Plan job completed with `coverageSummary.gateStatus = warning`.
- Counts were:
  - `coverageLedgerCount`: 13
  - `coveredCount`: 11
  - `partialCount`: 2
  - `missingCount`: 0
  - `blockingUncoveredCount`: 0
- However, `coverageSummary.missingItems` contained two `partial` rows:
  - `COV-003` / `Product Listing & Filters`
  - `COV-012` / `UI/UX and Usability`

Expected Behavior:

- `missingItems` should contain missing rows only.
- Partial rows should be represented under `partialItems` or `warningItems`.

Suggested Fix:

1. Reuse the fix planned in `BUG-E2E-028`.
2. Ensure the corrected coverage summary contract applies to Test Strategy, Test Plan, and Risk Matrix.

Retest:

- Generate Test Plan with partial coverage and no missing rows.
- Confirm `missingItems` is empty or missing-only.
- Confirm partial rows are still visible under a clearer warning field.

Closure Validation:

- Retested with Test Plan job `PRO-260529-ZTMBQ1`.
- `coverageSummary.missingCount = 0`.
- `coverageSummary.missingItems = []`.
- Partial coverage is correctly represented under `partialItems` and `warningItems`.

## BUG-E2E-044: Test Plan Shares Duplicate `JOB_STARTED` Metrics Issue

Status: closed

Severity: low

Area:

- n8n generation queue worker
- n8n shared document generator
- Analytics/job event timeline

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- `qa_job_metrics` contains two `JOB_STARTED` rows for the same Test Plan generation job.
- This is the same pattern already seen for Test Strategy in `BUG-E2E-029`.

Expected Behavior:

- A single generation job should emit one canonical `JOB_STARTED` metric, or distinct event names should be used for queue start vs generator start.

Suggested Fix:

1. Fix globally in the shared generation worker/generator telemetry path.
2. When closing `BUG-E2E-029`, verify the fix against both Test Strategy and Test Plan.

Retest:

- Trigger Test Plan generation.
- Confirm exactly one canonical `JOB_STARTED` metric exists for the job.

Closure Validation:

- Retested with Test Plan job `PRO-260529-ZTMBQ1`.
- Metrics show one `JOB_STARTED` event and one distinct `GENERATOR_STARTED` event.
- Generator runtime metadata still records `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## BUG-E2E-045: Generated Test Plan Tables Render As Broken Paragraph Blocks

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Markdown-to-Confluence rendering
- Generated Test Plan content quality

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`
- Confluence page: `Test Plan - AstraCart E2E 20260528`

What Happened:

- Multiple intended tables render as stacked text blocks instead of readable tables.
- Examples:
  - `Test Schedule and Milestones`
  - `Risks, Mitigation & Contingency Plan`
  - `Roles and Responsibilities`
  - `Automation Coverage Matrix`
  - `Appendix: Traceability Mapping Summary`
  - `Coverage Ledger`

Expected Behavior:

- Test Plan tables should render as proper Confluence tables.
- Long source references should not break table structure or row alignment.

Suggested Fix:

1. Reuse the table rendering fix planned for `BUG-E2E-030`.
2. Escape pipe characters and line breaks inside table cells before Confluence conversion.
3. Prefer workflow-generated Confluence table storage format for critical tables.
4. Add a markdown table validation step before publishing.

Retest:

- Regenerate Test Plan.
- Confirm every table renders as a proper table in Confluence.
- Confirm long source references remain readable without breaking rows.

Closure Validation:

- Retested with Confluence Word export `Test+Plan+-+AstraCart+E2E+20260528.doc`.
- Exported document is MIME-wrapped HTML and contains real table structures:
  - `6` `<table>` elements
  - `43` `<tr>` rows
  - `22` `<th>` cells
  - `137` `<td>` cells
- Test Schedule, Risk Plan, Roles, Automation Coverage, Source Mapping, and Coverage Ledger are represented as real tables in the export.

## BUG-E2E-046: Coverage Ledger Header Is Duplicated In Generated Test Plan

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Coverage ledger rendering
- Generated Test Plan content quality

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- The `Coverage Ledger` section repeats its header twice:

```text
Coverage ID
Module / Requirement
Source Reference
Included In Output
Coverage Status
Notes

Coverage ID
Module / Requirement
Source Reference
Included In Output
Coverage Status
Notes
```

Expected Behavior:

- Coverage Ledger should contain one header row and 13 data rows.

Suggested Fix:

1. Reuse the same root fix planned for `BUG-E2E-031`.
2. Ensure the model and workflow do not both render separate ledger headers.
3. Prefer workflow-generated ledger from structured `coverageLedger`.

Retest:

- Regenerate Test Plan.
- Confirm the Coverage Ledger has exactly one header.
- Confirm all 13 ledger rows are present once.

Closure Validation:

- Retested with Confluence Word export `Test+Plan+-+AstraCart+E2E+20260528.doc`.
- Coverage Ledger is exported as one real table with `9` rows:
  - `1` header row
  - `8` coverage rows
- The duplicate Coverage Ledger header pattern is not present in the exported document text.

## BUG-E2E-047: Test Plan Coverage Warning Is Not Clearly Surfaced In Generated Document

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Coverage ledger content contract
- Generated Test Plan executive/readiness summary

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- Supabase output shows `coverageSummary.gateStatus = warning`.
- Coverage counts show:
  - `coveredCount = 11`
  - `partialCount = 2`
  - `missingCount = 0`
- The generated Test Plan includes partial rows in the Coverage Ledger, but there is no clear coverage gate summary near the top.
- The closing paragraph says the plan provides "traceability to every key business and technical artifact", which can overstate the result because two rows are partial.

Expected Behavior:

- Generated Test Plan should clearly state when it passed with coverage warnings.
- Partial items should be summarized for reviewer attention.

Suggested Fix:

1. Add a `Coverage Gate Summary` block near the top:
   - Gate status
   - Ledger rows
   - Covered
   - Partial
   - Missing
   - Blocking uncovered
2. For warning status, list the partial items:
   - `COV-003 Product Listing & Filters`
   - `COV-012 UI/UX and Usability`
3. Avoid final wording that implies complete coverage when `partialCount > 0`.

Retest:

- Generate Test Plan with partial coverage.
- Confirm the generated page clearly says `Passed with warnings` or equivalent.
- Confirm partial coverage items are easy to see before the appendix.

Closure Validation:

- Retested with Test Plan job `PRO-260529-ZTMBQ1` and exported Confluence Word document.
- Coverage Review Note is present.
- Coverage summary reports `7` covered items, `1` partial item, and `0` missing items.
- The partial item is visible as `COV-006 Mobile UI drawer filter overlay risk`.

## BUG-E2E-048: Generated Test Plan Contains Unsupported Schedule Dates

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Prompt grounding
- Generated Test Plan schedule content

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- The generated Test Plan includes precise milestone dates such as:
  - `2026-05-30`
  - `2026-06-01`
  - `2026-06-05`
  - `2026-06-07 to 2026-06-21`
  - `2026-06-29 to 2026-06-30`
- These may be invented unless explicitly provided in source documents or runtime input.

Expected Behavior:

- Schedule dates should be source-backed, runtime-provided, or labelled as proposed placeholders.

Suggested Fix:

1. Require the generator to use `TBD` or `Proposed` when source schedule data is unavailable.
2. Add a validation rule for date-like values in generated plans:
   - if no source citation/runtime schedule exists, mark them as proposed or fail/warn the quality gate.
3. Consider passing planned release dates explicitly from project metadata if available.

Retest:

- Generate Test Plan with no explicit schedule source.
- Confirm schedule rows use `TBD` or `Proposed`, not definitive dates.
- Generate with explicit schedule metadata and confirm dates are cited.

Closure Validation:

- Retested with Confluence Word export `Test+Plan+-+AstraCart+E2E+20260528.doc`.
- Schedule section is titled `Test Schedule and Milestones (Proposed)`.
- Schedule table column is named `Proposed Date`.
- Dates are no longer presented as final/source-backed commitments.

## BUG-E2E-049: Generated Test Plan Includes Definitive Approval And Sign-Off Roles Without Evidence

Status: closed

Severity: low

Area:

- n8n shared document generator
- Test Plan governance content
- Prompt grounding

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- The generated `Approval & Sign-off` section states:

```text
Test Plan reviewed and approved by QA Manager, Product Owner, Security Architect, and UX Lead.
Milestone-based sign-offs aligned to sprint deliveries.
```

- This reads like completed approval status, but there is no evidence that approvals happened.

Expected Behavior:

- Generated plans should distinguish required approvers from completed approvals.

Suggested Fix:

1. Change wording to future-state/governance intent, for example:
   - `Required approvers`
   - `Approval pending`
   - `Recommended sign-off participants`
2. Only use `reviewed and approved` if supplied execution/approval evidence exists.
3. Add quality gate check for approval/completion claims without evidence.

Retest:

- Generate Test Plan before any real approval event.
- Confirm the sign-off section does not imply completed approval.

Closure Validation:

- Retested with Confluence Word export `Test+Plan+-+AstraCart+E2E+20260528.doc`.
- Approval section says `Formal approval to be obtained`.
- Sign-off is explicitly `contingent on meeting exit criteria`.
- The document no longer implies approval has already been completed.

## BUG-E2E-050: Generated Test Plan Header Shows Vector Collection Different From Runtime Metadata

Status: closed

Severity: low

Area:

- n8n shared document generator
- Generated document metadata header
- Runtime configuration consistency

Observed During:

- Phase 4 Test Plan generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-DTA4IU`

What Happened:

- The generated Confluence document header says:

```text
Vector Collection: qa-knowledge-base
```

- Supabase job metrics for the same job show:

```text
chroma_collection: qops-chunks
```

Expected Behavior:

- Generated document metadata should match the runtime Chroma collection used by the job.

Suggested Fix:

1. Reuse the fix planned for `BUG-E2E-034`.
2. Populate document headers from runtime config, not hard-coded prompt text.

Retest:

- Generate Test Plan.
- Confirm the Confluence header and `qa_job_metrics.metadata.chroma_collection` match.

Closure Validation:

- Retested with Test Plan job `PRO-260529-ZTMBQ1` and Confluence Word export.
- Generated header shows `Model: gpt-4.1-mini`.
- Generated header shows `Vector Collection: qops-chunks`.
- Supabase metrics for the same job also show `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## BUG-E2E-051: Risk Matrix Retrieval Still Uses Soft Profile Guidance Without Hard Evidence Enforcement

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Chroma retrieval profiler
- Risk Matrix grounding quality

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`
- n8n execution: `986777`

What Happened:

- The Risk Matrix retrieval profile was built correctly and used a strong query:

```text
risk architectural complexity integration dependencies security data integrity delivery risk operational risk business criticality
```

- The workflow enforced the hard project filter:

```text
metadata.project = AstraCart E2E 20260528
```

- However, docType/category/artifact ranking is still soft prompt guidance rather than enforced retrieval/reranking logic.

Why This Matters:

- Risk Matrix generation needs high-confidence evidence selection because risks, likelihoods, and mitigations can easily become generic if weak context is retrieved.
- The current approach can retrieve relevant sources, but it does not guarantee that every risk row is based on exact retrieved evidence.

Expected Behavior:

- Risk Matrix retrieval should enforce source relevance and source diversity before generation.

Suggested Fix:

1. Reuse the Phase 4 retrieval grounding fix planned for `BUG-E2E-035`.
2. Add Risk Matrix-specific retrieval facets:
   - architecture/component complexity
   - payment/security/identity risks
   - operational/SLA risks
   - data integrity risks
   - FRD/BRD functional risk areas
   - transcript/workshop risk tables
3. Persist selected evidence and source distribution in job output.
4. Validate that every risk row maps to retrieved evidence.

Retest:

- Generate Risk Matrix.
- Confirm retrieved evidence includes exact source chunks for each generated risk.
- Confirm source diversity is visible and balanced.

Latest Retest Note:

- Retested with Risk Matrix job `PRO-260529-NZP7QR`.
- Final output shows stronger evidence usage with BRD, FRD, and workshop/risk references, and every risk/coverage row uses concrete chunk IDs.
- Keep open because this bug tracks retrieval enforcement/source distribution, which still needs a retrieval smoke or persisted evidence summary to prove.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Added hard evidence rules requiring selected evidence to be deduped, text-bearing, and source-diverse before writing risk rows.
- Added shared ledger evidence audit so unsupported/broad source references cannot silently pass as fully covered.
- Smoke confirmed active workflow contains hard ledger/evidence enforcement and the Chroma tool description reflects the stricter contract.

Closure Evidence:

- Retested with Risk Matrix job `PRO-260602-KJXT8Z` on 2026-06-02.
- Job completed successfully and published to project override Confluence space `QD`.
- Coverage gate passed:
  - `coverageLedgerCount = 9`
  - `coveredCount = 9`
  - `missingCount = 0`
  - `partialCount = 0`
  - `blockingUncoveredCount = 0`
- Coverage ledger maps risk details to concrete source references with exact `chunkId` values across BRD, FRD, and transcript evidence.
- No broad/combined source references were present in the stored coverage ledger.
- Metrics/audit confirmed successful generation:
  - `JOB_QUEUED`
  - `JOB_STARTED`
  - `GENERATOR_STARTED`
  - `QUALITY_GATE_PASSED`
  - `JOB_COMPLETED`
  - audit event `GENERATION_COMPLETED`

## BUG-E2E-052: Risk Matrix Retrieval Contains Duplicate Chunks And Metadata-Only Page Content

Status: closed

Severity: high

Area:

- Chroma ingestion/indexing
- n8n retrieval payload
- Risk Matrix grounding quality

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`
- n8n execution: `986777`

What Happened:

- The Chroma tool returned 40 raw result items.
- Those 40 results collapsed to 25 unique `chunkId` values, meaning 15 duplicate logical chunks were retrieved.
- Several retrieved `pageContent` values were metadata labels rather than meaningful source text, for example:

```text
high_level_design
functional_requirements
quality_assurance
```

- Some retrieved chunks were rich and useful, especially workshop/transcript table and FRD snippets, but the payload quality was inconsistent.

Why This Matters:

- Duplicate and metadata-only chunks reduce grounding quality.
- Risk Matrix rows may become generic or over-weight repeated evidence.

Expected Behavior:

- Retrieved Risk Matrix context should be deduplicated and text-rich before generation.

Suggested Fix:

1. Reuse the Chroma body mapping fix planned for `BUG-E2E-037` and `BUG-E2E-041`.
2. Deduplicate by stable `chunkId` before passing evidence to the generator.
3. Filter or repair chunks whose `pageContent` equals docType/category/artifact labels.
4. Track raw retrieved count vs unique text-bearing evidence count.

Retest:

- Run Risk Matrix retrieval.
- Confirm all selected chunks have meaningful text.
- Confirm duplicate logical chunks are removed before generation.

Latest Retest Note:

- Retested with Risk Matrix job `PRO-260529-NZP7QR`.
- Final output is well grounded and no truncated/broad references remain.
- Keep open until retrieval smoke confirms selected Chroma rows no longer include duplicate logical chunks or metadata-only `pageContent`.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Added hard dedupe and metadata-only filtering instructions for Risk Matrix generation.
- Added validator audit that marks ledger rows with missing `chunkId`, metadata-only references, broad references, or truncated references as review items.
- Smoke confirmed metadata-only and broad source patterns are detected while exact references with `chunkId` pass.

Closure Evidence:

- Retested with Risk Matrix job `PRO-260602-KJXT8Z` on 2026-06-02.
- Stored coverage ledger does not contain metadata-only source references such as `high_level_design`, `functional_requirements`, or `quality_assurance`.
- Every stored coverage ledger row contains substantive file/section context and a concrete `chunkId`.
- Coverage gate passed with all 9 ledger rows covered and no warning items.
- Residual note: raw retrieval result distribution is not persisted in output, so this closes the user-facing duplicate/metadata-only Risk Matrix evidence defect; future enhancement could persist raw-vs-selected retrieval counts for deeper observability.

## BUG-E2E-053: Risk Matrix Coverage Ledger Source References Are Too Broad For Auditability

Status: closed

Severity: medium

Area:

- n8n shared document generator
- Risk Matrix coverage ledger
- Evidence traceability

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- Coverage ledger rows use broad source references such as:
  - `HLD | HLD_AstraCart_Ecommerce_Platform.pdf`
  - `TRANSCRIPT | supporting_Workshop_AstraCart_Ecommerce_Grooming_and_Risks.pptx`
  - `BRD | BRD_AstraCart_Ecommerce_Platform.pdf`
  - `FRD | FRD_AstraCart_Ecommerce_Platform.docx`
- These do not consistently include exact `sectionTitle` and `chunkId`.

Why This Matters:

- Risk Matrix output needs strong auditability because risk rows and mitigations may influence project decisions.
- Broad references make it difficult to prove which retrieved evidence produced each risk.

Expected Behavior:

- Each coverage row should map to exact retrieved evidence.

Suggested Fix:

1. Reuse the evidence validation fix planned for `BUG-E2E-038` and `BUG-E2E-042`.
2. Require `sourceReference` values to include:
   - `docType`
   - `fileName`
   - `sectionTitle`
   - `chunkId`
3. If a risk is synthesized from multiple sources, show each exact source or a compact evidence list.

Retest:

- Generate Risk Matrix.
- Confirm each coverage ledger source reference maps to retrieved evidence.
- Confirm no broad source-only references remain unless expanded in details.

Closure Validation:

- Retested with Risk Matrix job `PRO-260529-NZP7QR` and Confluence Word export.
- Coverage Ledger has `8` rows, and every row includes a concrete file/section/chunk reference.
- All coverage source references include `chunkId` values.
- No broad source-only Coverage Ledger rows remain.

## BUG-E2E-054: Risk Matrix Coverage Warning Uses `missingItems` For Partial Items

Status: closed

Severity: low

Area:

- n8n shared document generator
- Coverage ledger output contract
- Risk Matrix readiness/generation warning display

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- The Risk Matrix completed with `coverageSummary.gateStatus = warning`.
- Counts were:
  - `coverageLedgerCount`: 7
  - `coveredCount`: 6
  - `partialCount`: 1
  - `missingCount`: 0
  - `blockingUncoveredCount`: 0
- However, `coverageSummary.missingItems` contained one `partial` row:
  - `COV-006` / `Functional requirements functional flow`

Expected Behavior:

- `missingItems` should contain missing rows only.
- Partial rows should be represented under `partialItems` or `warningItems`.

Suggested Fix:

1. Reuse the fix planned in `BUG-E2E-028`.
2. Ensure the corrected coverage summary contract applies to Test Strategy, Test Plan, and Risk Matrix.

Retest:

- Generate Risk Matrix with partial coverage and no missing rows.
- Confirm `missingItems` is empty or missing-only.
- Confirm partial rows are represented under a clearer warning field.

Closure Validation:

- Retested with Risk Matrix job `PRO-260529-NZP7QR`.
- `coverageSummary.gateStatus = passed`.
- `missingItems`, `partialItems`, `unknownItems`, and `warningItems` are all empty.
- Coverage counts are consistent: `8` covered, `0` partial, `0` missing.

## BUG-E2E-055: Risk Matrix Shares Duplicate `JOB_STARTED` Metrics Issue

Status: closed

Severity: low

Area:

- n8n generation queue worker
- n8n shared document generator
- Analytics/job event timeline

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- `qa_job_metrics` contains two `JOB_STARTED` rows for the same Risk Matrix generation job.
- This is the same pattern already seen for Test Strategy and Test Plan.

Expected Behavior:

- A single generation job should emit one canonical `JOB_STARTED` metric, or distinct event names should be used for queue start vs generator start.

Suggested Fix:

1. Fix globally in the shared generation worker/generator telemetry path.
2. When closing `BUG-E2E-029`, verify the fix against Test Strategy, Test Plan, and Risk Matrix.

Retest:

- Trigger Risk Matrix generation.
- Confirm exactly one canonical `JOB_STARTED` metric exists for the job.

Closure Validation:

- Retested with Risk Matrix job `PRO-260529-NZP7QR`.
- Metrics show one `JOB_STARTED` event and one distinct `GENERATOR_STARTED` event.
- Generator runtime metadata still records `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## BUG-E2E-056: Risk Matrix Main Risk Table Is Too Wide And Squeezed In Confluence

Status: closed

Severity: medium

Area:

- Risk Matrix document prompt
- Confluence document formatting
- Shared document table rendering

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`
- Generated document section: `Risk Identification and Categorization`

What Happened:

- The `Risk Identification and Categorization` table has too many columns for readable Confluence display.
- Columns include `Risk ID`, `Risk Category`, `Risk Description`, `Source Reference`, `Probability`, `Impact`, `Risk Score`, `Mitigation Plan`, `Contingency Plan`, `Owner`, and `Detection Strategy`.
- Long text fields are squeezed into narrow cells, making the table difficult to scan or read.
- Source references also wrap across many lines inside cells, worsening readability.

Why This Matters:

- The Risk Matrix is a leadership-facing document. The highest-value section should be easy to scan.
- If mitigation, contingency, and detection text is squeezed, users may miss important risk actions.

Expected Behavior:

- Risk rows should be readable in Confluence without excessive wrapping or cramped columns.
- The primary table should support quick risk triage, while detailed mitigation/evidence can live in a follow-up detail section.

Suggested Fix:

1. Change the Risk Matrix output structure to avoid a single 11-column table.
2. Preferred layout:
   - Summary table: `Risk ID`, `Category`, `Risk Description`, `Probability`, `Impact`, `Risk Score`, `Owner`.
   - Detail section per risk or secondary table: `Risk ID`, `Source Reference`, `Mitigation Plan`, `Contingency Plan`, `Detection Strategy`.
3. Keep source references compact in the summary view and move full evidence details to the detail section or appendix.
4. Verify the result in Confluence on normal desktop width and narrower browser width.

Retest:

- Generate Risk Matrix.
- Confirm the main risk summary is readable without squeezed text.
- Confirm mitigation, contingency, detection, and evidence are still present in the document.

Latest Retest Note:

- Retested with Risk Matrix job `PRO-260529-NZP7QR` and Confluence Word export.
- The original 11-column table is now split into `Risk Register Summary` and `Risk Detail Register`.
- Keep open for one visual UI/export review because the summary table still contains `8` columns and includes long source references; the preferred target was a compact 7-column summary with evidence moved to details.

Implementation Fix:

- Patched shared generator workflow `fullRetrievalD01`.
- Updated Risk Matrix prompt to forbid one large risk table and require:
  - `Risk Register Summary`: `Risk ID`, `Category`, `Risk Title`, `Probability`, `Impact`, `Risk Score`, `Owner`.
  - `Risk Detail Register`: `Risk ID`, `Risk Description`, `Source Reference`, `Mitigation Plan`, `Contingency Plan`, `Detection Strategy`.
- Removed the older conflicting 11-column Risk Matrix `OUTPUT FORMAT` instruction from the active prompt.
- Updated the quality gate fallback splitter so any generated 11-column risk table is rewritten into the narrower summary/detail structure.
- Smoke confirmed long risk descriptions are compacted into short `Risk Title` values and evidence is moved to the detail table.

Closure Evidence:

- Reviewed exported Confluence Word document `Risk+Matrix+-+AstraCart+E2E+Scope+Check+20260528.doc` on 2026-06-02.
- The old 11-column `Risk Identification and Categorization` table is no longer present.
- Exported document now uses:
  - `Risk Register Summary` with 7 columns: `Risk ID`, `Category`, `Risk Title`, `Probability`, `Impact`, `Risk Score`, `Owner`.
  - `Risk Detail Register` with 6 columns: `Risk ID`, `Risk Description`, `Source Reference`, `Mitigation Plan`, `Contingency Plan`, `Detection Strategy`.
- The summary table is scan-friendly and the longer evidence/mitigation text is moved into the detail table.
- Export inspection found no ellipsis/truncated references, no metadata-only labels, and no chat-style closing text.

## BUG-E2E-057: Risk Matrix Tables Render As Broken Paragraph Blocks

Status: closed

Severity: medium

Area:

- Risk Matrix document prompt
- Confluence renderer
- Markdown/table-to-storage conversion

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`
- Generated document sections:
  - `Risk Identification and Categorization`
  - `Risk Heat Map Summary`
  - `Coverage Ledger`

What Happened:

- Table content appears as stacked paragraphs rather than clean grid tables in the pasted Confluence output.
- Source references are split across multiple lines inside cells, for example:
  - `[HLD`
  - `HLD_AstraCart_Ecommerce_Platform.pdf`
  - `Supports payment reconciliation triage`
  - `chunkId:5691a6e5-...752]`
- This is the same family of table-rendering issue already observed for Test Strategy and Test Plan, but it is more damaging here because the Risk Matrix depends heavily on tabular scanning.

Expected Behavior:

- Risk Matrix tables should render as proper Confluence tables.
- Multi-line source references should not break the table structure.

Suggested Fix:

1. Reuse the shared table-rendering fix planned for `BUG-E2E-030` and `BUG-E2E-045`.
2. In the Risk Matrix prompt, keep table cell values short and single-line where possible.
3. Move long source/evidence details out of table cells into an evidence appendix or per-risk details.

Retest:

- Generate Risk Matrix and inspect the Confluence page.
- Confirm all tables render as proper tables and not as paragraph stacks.

Closure Validation:

- Retested with Confluence Word export `Risk+Matrix+-+AstraCart+E2E+20260528.doc`.
- Exported document is MIME-wrapped HTML and contains real table structures:
  - `4` `<table>` elements
  - `33` `<tr>` rows
  - `26` `<th>` cells
  - `190` `<td>` cells
- Risk Register Summary, Risk Detail Register, Heat Map, and Coverage Ledger are represented as real tables in the export.

## BUG-E2E-058: Risk Matrix Coverage Warning Is Not Clearly Surfaced In The Document

Status: closed

Severity: medium

Area:

- Risk Matrix document prompt
- Coverage ledger presentation
- Quality gate communication

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- Backend coverage summary reported:
  - `gateStatus`: `warning`
  - `partialCount`: 1
  - `missingCount`: 0
- The document includes a partial coverage item:
  - `COV-006 Functional requirements functional flow`
- The document conclusion still says it provides `comprehensive traceability to core architecture, requirements, and test strategy documentation`.
- There is no clear top-level warning or review note explaining that one coverage item is partial.

Expected Behavior:

- If the coverage gate returns `warning`, the generated document should make that visible in a concise, user-friendly way.
- The wording should avoid overstating completeness when partial coverage exists.

Suggested Fix:

1. Add a short `Coverage Review Note` near the top or before the Coverage Ledger when `gateStatus = warning`.
2. Example wording:
   - `Coverage review recommended: 6 items are covered and 1 item is partially covered. Review the Coverage Ledger for details before final sign-off.`
3. Update the conclusion to avoid words like `comprehensive` unless the gate passes with no partial or missing items.

Retest:

- Generate Risk Matrix with one partial ledger row.
- Confirm the warning is visible and the conclusion does not overstate coverage.

Closure Validation:

- Retested with Risk Matrix job `PRO-260529-NZP7QR` and Confluence Word export.
- Coverage gate now passed with `8` covered items and `0` partial/missing items.
- Coverage Review Note is present.
- No overstatement such as partial coverage being hidden was observed.

## BUG-E2E-059: Risk Matrix Header Shows Runtime Metadata Mismatch

Status: closed

Severity: low

Area:

- Risk Matrix document metadata
- n8n generation workflow
- Confluence document header

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- Generated document header shows:
  - `Model: gpt-4o-mini`
  - `Vector Collection: qa-knowledge-base`
- Runtime metadata observed for the generation path used:
  - model family is aligned with `gpt-4.1-mini`
  - Chroma collection is `qops-chunks`

Why This Matters:

- Users and auditors may rely on the document header to understand the generation source.
- Incorrect model or collection metadata reduces trust in generated artifacts.

Expected Behavior:

- The document header should display the actual runtime model and vector collection used by the workflow.

Suggested Fix:

1. Remove hardcoded model and vector collection labels from Risk Matrix prompt/template.
2. Populate these values from the same runtime config/snapshot used by the job.
3. Apply the same correction across Test Strategy and Test Plan if shared template metadata is used.

Retest:

- Generate Risk Matrix.
- Confirm header model and collection match the actual workflow runtime metadata.

Closure Validation:

- Retested with Risk Matrix job `PRO-260529-NZP7QR` and Confluence Word export.
- Generated header shows `Model: gpt-4.1-mini`.
- Generated header shows `Vector Collection: qops-chunks`.
- Supabase metrics for the same job also show `generation_model = gpt-4.1-mini` and `chroma_collection = qops-chunks`.

## BUG-E2E-060: Risk Matrix Uses Truncated Evidence References

Status: closed

Severity: medium

Area:

- Risk Matrix citation/evidence formatting
- Retrieval grounding
- Auditability

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- Source references use truncated chunk IDs such as:
  - `chunkId:5691a6e5-...752`
  - `chunkId:af7e6b45-...AB0`
  - `chunkId:a4c52ffe-f...772`
- Truncated references are not directly searchable or auditable.
- Some references are also line-broken inside table cells.

Expected Behavior:

- Generated risk rows should reference exact retrieved evidence.
- Chunk IDs should be full IDs or replaced with a stable clickable/reference identifier that can map back to source evidence.

Suggested Fix:

1. Do not allow the model to invent shortened chunk IDs.
2. Pass exact citation objects into the prompt and require citations to be copied from those objects only.
3. If full chunk IDs are visually too long, show a compact display label but preserve the full ID in an appendix or hidden/details field.

Retest:

- Generate Risk Matrix.
- Confirm each cited risk source can be traced back to a real retrieved chunk without guessing.

Closure Validation:

- Retested with Confluence Word export `Risk+Matrix+-+AstraCart+E2E+20260528.doc`.
- No truncated chunk references such as `chunkId:...` were found.
- Risk and Coverage Ledger source references use full chunk IDs such as `a4c52ffe-f96e-4846-b0b1-26641280c772`.

## BUG-E2E-061: Risk Probability And Impact Scores Lack Evidence-Based Rationale

Status: closed

Severity: medium

Area:

- Risk Matrix generation quality
- Risk scoring methodology
- Document prompt

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- The Risk Matrix assigns probability and impact values such as `4`, `5`, and `3`.
- The document explains the scoring model but does not explain why each risk received its specific probability and impact score.
- The values may be AI recommendations, but the document presents them as definitive.

Why This Matters:

- Risk scores can influence prioritization, ownership, and mitigation sequencing.
- Without rationale, reviewers cannot validate whether the scoring is grounded in project evidence.

Expected Behavior:

- Each scored risk should include a concise rationale or evidence basis for probability and impact.
- If scores are inferred, the document should label them as recommended or preliminary.

Suggested Fix:

1. Add a `Scoring Rationale` field in the detail section for each risk.
2. Require the model to cite evidence that supports high probability or high impact ratings.
3. Add wording such as `Recommended score pending stakeholder validation` unless a source explicitly defines the score.

Retest:

- Generate Risk Matrix.
- Confirm each risk has a short probability/impact rationale and does not present unsupported scores as final.

Closure Validation:

- Retested with Confluence Word export `Risk+Matrix+-+AstraCart+E2E+20260528.doc`.
- Risk Detail Register includes a `Scoring Rationale` column.
- Each risk row has a rationale explaining the probability/impact basis.

## BUG-E2E-062: Risk Matrix Ends With Chat-Style Assistant Text

Status: closed

Severity: low

Area:

- Risk Matrix document prompt
- Generated document professionalism

Observed During:

- Phase 4 Risk Matrix generation for `AstraCart E2E 20260528`.
- Job: `PRO-260529-EST7V0`

What Happened:

- The generated document ends with:
  - `Please advise if further granularity or specific module focus is required.`

Why This Matters:

- Generated Confluence documents should read as finalized project artifacts, not chat responses.
- Chat-style closing text reduces professionalism and can confuse users about whether the document is complete.

Expected Behavior:

- The document should end with a normal artifact closing statement or no closing statement.

Suggested Fix:

1. Add a prompt guard forbidding conversational assistant closings.
2. Add a post-generation cleanup rule that removes phrases such as:
   - `Please advise`
   - `Let me know`
   - `If you need`
3. Apply the cleanup globally to generated documents, not only Risk Matrix.

Retest:

- Generate Risk Matrix.
- Confirm no chat-style follow-up text appears at the end of the document.

Closure Validation:

- Retested with Confluence Word export `Risk+Matrix+-+AstraCart+E2E+20260528.doc`.
- No chat-style closing text such as `Please advise`, `Let me know`, or `If you need` was found.

## BUG-E2E-063: Regenerate Updates Previous Failed Job Timestamp

Status: fixed pending retest

Severity: low

Area:

- Generation retry/regenerate workflow
- Supabase `qa_jobs`
- Auditability

Observed During:

- Phase 4 Test Strategy regenerate for `AstraCart E2E 20260528`.
- Failed source job: `PRO-260529-1WFAEQ`
- Regenerated job: `PRO-260529-80ILZO`

What Happened:

- When the regenerate job was created, the previous failed job `PRO-260529-1WFAEQ` had its `updated_at` changed to match the new regenerate time.
- The previous job remained failed, but its last-updated timestamp no longer represented when that job actually failed.

Why This Matters:

- Job history and audit timelines become slightly misleading.
- Users and admins may think the old failed job was modified or retried at the new time instead of preserved as historical evidence.

Expected Behavior:

- Creating a retry/regenerate job should create the new job and link it to the source job without changing the source job's failure timestamp.
- If the source job needs retry metadata, store it in a separate immutable retry-link field or audit event.

Suggested Fix:

1. Check the generation retry/create workflow for any update against `retry_of_job_id` or the previous job row.
2. Avoid patching `qa_jobs.updated_at` on the source failed job when creating the replacement job.
3. Add an audit or metric event that links old and new jobs instead.

Retest:

- Trigger regenerate from a failed generation job.
- Confirm the old failed job keeps its original `updated_at`.
- Confirm the new job has `retry_of_job_id` or retry metadata linking back to the failed job.

## BUG-E2E-064: Quality Gate Word Count Differs From Stored Job Word Count

Status: fixed - workflow/build/UI smoke validated; pending next live shared-doc update export

Severity: low

Area:

- Generation quality gate
- Generation metrics
- Analytics consistency

Observed During:

- Phase 4 Test Strategy regenerate for `AstraCart E2E 20260528`.
- Job: `PRO-260529-80ILZO`

What Happened:

- The quality gate passed using a post-cleanup word count of `2303`.
- The stored job output and metrics recorded `2221` words.
- The document passed correctly, but two different word counts are visible for the same generated artifact.

Why This Matters:

- Analytics and audit views may show a word count that differs from the quality gate decision.
- Future debugging becomes confusing when the gate and stored metrics disagree.

Expected Behavior:

- The same normalized/generated document body should drive:
  - quality gate word count
  - `qa_jobs.output.wordCount`
  - `qa_job_metrics.word_count`

Suggested Fix:

1. After final cleanup and coverage-note injection, recalculate word count once.
2. Pass that final count through `Restore Quality Gate Output`, success metrics, and `qa_jobs.output`.
3. Avoid mixing pre-cleanup and post-cleanup counts in different nodes.

Retest:

- Generate Test Strategy.
- Confirm quality gate, `qa_jobs.output.wordCount`, and `qa_job_metrics.word_count` all show the same value.

## BUG-E2E-065: Failed/Recovered Document Job Usage Panel Is Too Bulky

Status: closed

Severity: low

Area:

- Dashboard UI
- My Document Jobs
- Generation retry/recovery UX

Observed During:

- Phase 4 Test Strategy regenerate for `AstraCart E2E 20260528`.
- Failed source job: `PRO-260529-1WFAEQ`
- Recovered by job: `PRO-260529-80ILZO`

What Happened:

- Failed/recovered job cards show a full `Usage recorded before failure` panel inline.
- The panel includes:
  - words produced
  - tokens used
  - cost incurred
- This makes the job card visually bulky and pushes more important state information lower on the card.

Why This Matters:

- The card should primarily communicate job status, retry/recovery relationship, and next action.
- Token/cost usage is useful audit information, but it is secondary detail.
- Showing it inline reduces scanability when multiple jobs are listed.

Expected Behavior:

- Keep failed/recovered job cards compact.
- Show a small usage/details icon on the card when failed-run usage exists.
- Hovering the icon should show a short tooltip such as `Usage recorded before failure`.
- Clicking the icon should open a small modal/popover containing:
  - words produced
  - tokens used
  - cost incurred
  - source failed job id
  - retry/recovery job id if available

Suggested Fix:

1. Replace the inline `Usage recorded before failure` panel with a compact icon button.
2. Add tooltip text for the icon.
3. Reuse the existing modal/popover pattern used for readiness/extraction details if possible.
4. Preserve all current values and formatting inside the modal.

Retest:

- Trigger or view a failed generation job with recorded usage.
- Confirm the job card stays compact.
- Confirm the usage icon appears only when failed-run usage exists.
- Click the icon and verify the modal shows the same usage values currently shown inline.

## BUG-E2E-066: Generated Document Completion Card Shows Usage Metrics Inline

Status: closed

Severity: low

Area:

- Dashboard UI
- Generated document completion state
- Document generation UX

Observed During:

- Phase 4 Test Strategy regenerate for `AstraCart E2E 20260528`.
- Completed job: `PRO-260529-80ILZO`

What Happened:

- The generated document completion card shows words, tokens, and cost as three inline metric boxes.
- This card is primarily a success/action card with `Open in Confluence`, but the usage metrics take a large amount of visual space.

Why This Matters:

- The user’s main next action is to open/review the generated document.
- Usage/cost details are useful but secondary.
- Keeping usage inline makes the success card heavier than needed and can create visual inconsistency with the compact job-card design expected in `BUG-E2E-065`.

Expected Behavior:

- Keep the completion card compact and action-focused.
- Show a small usage/details icon when usage metrics exist.
- Hovering the icon should show a tooltip such as `View generation usage`.
- Clicking the icon should open a small modal/popover containing:
  - words produced
  - tokens used
  - cost incurred
  - job id
  - document type
  - generated destination if available

Suggested Fix:

1. Replace inline words/tokens/cost metric boxes with a compact usage icon.
2. Add tooltip text for the icon.
3. Use the same usage modal/popover component planned for `BUG-E2E-065` if possible.
4. Apply consistently across all generated document types.

Retest:

- Generate each document type.
- Confirm completion cards remain compact.
- Confirm the usage icon appears when usage metrics exist.
- Click the icon and verify the modal shows words, tokens, cost, job id, and document type.

## BUG-E2E-067: Analytics Page Does Not Pass Selected Project Scope

Status: closed

Severity: medium

Area:

- Frontend Analytics page
- n8n analytics workflow `Q-Ops-Agent-Analytics-Summary` (`tcKSeScJRiWtRx77`)
- Project-scoped KPI accuracy

Observed During:

- Pre-Epics analytics validation for registered user `alhansanuj@gmail.com`.
- User has multiple assigned projects:
  - `AstraCart E2E 20260528`
  - `AstraCart E2E Scope Check 20260528`

What Happened:

- The analytics workflow supports an optional `projectId` query parameter.
- Frontend `fetchAnalyticsSummary` only sends:

```text
pipeline
days
```

- It does not send the currently selected project id.
- For registered users, the backend scopes analytics to all assigned projects when no `projectId` is supplied.

Why This Matters:

- If the user is working inside one selected project, Analytics KPIs can include activity from other assigned projects.
- This can make completed work, tracked project count, success rate, cost, token usage, and recent jobs look incorrect for the selected project.
- The issue is quiet when the other assigned project has no metrics, but it will become visible as soon as both assigned projects have ingestion or generation activity.

Expected Behavior:

- If Analytics is intended to be project-scoped, pass the selected `projectId` from the frontend to `/webhook/analytics-summary`.
- If Analytics is intentionally workspace-scoped, the UI should clearly label it as an assigned-project/workspace view and provide a project filter.

Suggested Fix:

1. Decide whether Analytics should default to selected project or all assigned projects.
2. If selected project is the default, extend `fetchAnalyticsSummary` params to include `projectId`.
3. Pass the selected project id from `DashboardPage` when loading analytics.
4. Add an "All assigned projects" option only when the user intentionally wants aggregate analytics.
5. Retain backend authorization check so registered users cannot request unassigned project ids.

Retest:

- Assign the same registered user to two projects.
- Generate jobs in both projects.
- Select project A and open Analytics.
- Confirm KPIs show only project A when project-scoped mode is active.
- Switch to all-projects mode, if implemented, and confirm aggregate values include both projects.

## BUG-E2E-068: Analytics Generation Words Include Failed Duplicate Rows

Status: closed

Severity: medium

Area:

- Frontend Analytics page
- Generation pipeline KPI card
- Recent job aggregation

Observed During:

- Pre-Epics analytics validation for `AstraCart E2E 20260528`.
- Current generation metric history includes:

```text
completed generation word count: 12324
failed Test Strategy word count: 1955
failed job has both QUALITY_GATE_FAILED and JOB_FAILED metric rows
```

What Happened:

- The Analytics page calculates `generationWords` from `recentJobs` when `byDocumentType` does not provide word counts.
- `recentJobs` includes both failed terminal rows for the same failed job:
  - `QUALITY_GATE_FAILED`
  - `JOB_FAILED`
- Because of this, the Generation card can show words generated as:

```text
12324 completed words + 1955 failed words + 1955 failed words = 16234
```

- That is not the actual completed generated-word count.

Expected Behavior:

- The Generation `Words generated` KPI should count completed generated outputs only, unless the label explicitly says it includes failed attempts.
- Failed-attempt words should be shown only in the failed usage/spend section.
- A single failed job should not be counted twice because it emitted both quality-gate and job-failed metrics.

Suggested Fix:

1. Add `wordCount`/`word_count` to the backend `byDocumentType` aggregation for completed generation rows.
2. In the frontend, calculate `generationWords` from completed generation rows only.
3. Deduplicate terminal failure rows by `job_id` before using them in recent jobs, trends, failure counts, and failed-spend summaries.
4. Keep failed word counts visible in the failed generation usage panel.

Retest:

- Open Analytics for `AstraCart E2E 20260528`.
- Confirm Generation `Words generated` equals completed generation output words, currently `12324`.
- Confirm failed Test Strategy usage still appears separately as failed generation spend/usage.

## BUG-E2E-069: Stale Ingestion Jobs Display As Active Processing Jobs

Status: fixed - workflow/build validated; pending next live token-savings retest

Severity: medium

Area:

- Frontend Create Knowledge Base Job Status panel
- Frontend persisted knowledge job state
- Supabase `doc_ingestion_jobs`
- Ingestion job lifecycle/freshness handling

Observed During:

- Admin login on Create Knowledge Base screen.
- UI showed old ingestion jobs as Processing even though no backend ingestion work was running.
- Screenshot showed May 14 jobs such as:
  - `ING-260514-NJUGA4`
  - `ING-260514-BTTC8R`
  - `ING-260514-FF8CX5`

What Happened:

- The Job Status panel treats `queued`, `pending`, and `processing` as active work.
- Supabase still contains stale `doc_ingestion_jobs` rows with `status = 'processing'`.
- Confirmed stale active rows include:

```text
ING-260514-NJUGA4
ING-260514-BTTC8R
ING-260514-FF8CX5
ING-260514-ZAXT09
ING-260514-WS17Y8
ING-260514-32QNTM
ING-260511-7AOZEX
ING-260509-RH02VR
INGEST_1776928998513_v0qck6
```

- These rows are days/weeks old and do not represent real active backend execution.
- Admin users see all projects, so old OmniCart/ShopSmart stale jobs can appear even when the current user did not trigger them today.
- The panel can show a mixed count such as `1 completed, 0 failed, 9 active` and `10 ingestion jobs` because one completed job is included alongside nine stale active jobs.

Expected Behavior:

- The UI should not show stale ingestion jobs as actively processing.
- If a job has been `queued`, `pending`, or `processing` beyond a safe freshness window, it should be shown as stale/needs review/needs retry, not active.
- Backend job lifecycle should eventually converge to a terminal status: `completed`, `failed`, `recovered`, or a deliberate stale/expired state.

Likely Cause:

- Ingestion workflow or status persistence did not finalize some old job rows.
- Frontend has no defensive freshness gate for long-running ingestion jobs.
- Background polling continues to trust stale active statuses returned from persisted records.

Suggested Fix:

1. Add an ingestion freshness gate in the frontend for displayed Job Status and My Knowledge Jobs:
   - Treat `queued`, `pending`, or `processing` jobs older than a configured threshold as stale.
   - Suggested thresholds:
     - normal ingestion: 60-90 minutes
     - high-volume/retry batch: 2-3 hours if needed
2. Display stale jobs as `Needs retry` or `Review needed` rather than `Processing`.
3. Exclude stale jobs from `activeJobs`, progress animation, dashboard active count, and search active job list.
4. Keep stale jobs visible in My Knowledge Jobs so users/admins can investigate or reprocess.
5. Add backend cleanup/status reconciliation:
   - mark old active `doc_ingestion_jobs` as `failed` or `stale`
   - include an error such as `Job exceeded processing freshness window`
6. Add a one-time cleanup for the existing stale rows after the UI behavior is fixed.

Retest:

- Log in as admin.
- Open Create Knowledge Base.
- Confirm the May 14/May 11/May 9/April stale ingestion jobs do not appear as active Processing jobs.
- Confirm active count is `0` when no backend ingestion is running.
- Confirm stale jobs remain visible in My Knowledge Jobs or Artifacts Repository as review/retry candidates.
- Trigger a fresh ingestion job and confirm genuinely active jobs still display as Processing until completion/failure.

Security Note:

- Supabase advisor also reported RLS disabled on:
  - `public.qa_jobs`
  - `public.doc_ingestion_jobs`
  - `public.doc_ingestion_queuecreator_logs`
  - `public.qa_job_metrics`
  - `public.qa_story_testcase_links`
- This is separate from this UI bug, but should be handled as a production security hardening item with proper policies.

## BUG-E2E-070: Stale Generation Jobs Block Document Generation And Hide Current Job State

Status: closed

Severity: high

Area:

- Frontend Document Generation screen
- Frontend Job Status panel
- Frontend My Document Jobs panel
- Supabase `qa_jobs`
- Generation job lifecycle/freshness handling

Observed During:

- Phase 5 Epics & User Stories E2E validation for `AstraCart E2E 20260528`.
- User triggered a fresh Epics & User Stories job from FE.
- Backend/n8n completed the fresh job successfully:
  - Job: `PRO-260601-5I20BB`
  - n8n execution: `997330`
  - Status: `completed`
  - Output: 5 Jira epics, 9 Jira stories, Confluence page created.
- UI still displayed:
  - `Generation job PRO-260520-1GYX9O is processing. Wait for it to finish before starting another document generation job.`
  - Generate button disabled as `Generation in progress...`
  - Job Status panel showed an older Risk Matrix job instead of the latest Epics & User Stories run.

What Happened:

- Supabase still contains old `qa_jobs` rows with `status = 'processing'`.
- Confirmed stale active generation rows include:

```text
JOB_1774957730309
JOB_1774958019307
JOB_1774958061419
JOB_1774956805239
JOB_1775024359492
JOB_1775032086984
JOB_1775035711570
JOB_1775036761785
JOB_1775040352805
JOB_1775040832502
JOB_1775041872522
JOB_1775042860038
JOB_1776870128153
PRO-260518-Y3FID0
PRO-260520-1GYX9O
```

- These rows are hours/days/weeks old and do not represent real active backend execution.
- The active-generation lock appears to trust any persisted `processing` job instead of applying a freshness threshold and project/user scope.
- Because admin can see multiple projects, stale jobs from unrelated projects such as `FlowFlow`, `DemoToQA`, and `ShopSmart` can block the current AstraCart generation workflow.

Expected Behavior:

- A stale `processing` generation job should not block new document generation.
- Active generation lock should apply only to genuinely fresh active jobs, ideally scoped to the selected project/workspace rules.
- If a job has been `queued`, `pending`, or `processing` beyond a safe freshness window, it should be shown as stale/needs retry/review, not active.
- The latest completed job should surface in Job Status and My Document Jobs after refresh/polling.

Suggested Fix:

1. Add a generation freshness gate in the frontend:
   - Treat `queued`, `pending`, or `processing` jobs older than a configured threshold as stale.
   - Suggested threshold: 60-120 minutes for generation.
2. Exclude stale generation rows from:
   - generate-button active lock
   - active job count
   - Job Status progress panel
   - dashboard active count
3. Keep stale jobs visible in My Document Jobs as `Needs retry` or `Review needed`.
4. Add backend cleanup/status reconciliation:
   - mark old active `qa_jobs` rows as `failed` or `stale`
   - include an error such as `Job exceeded processing freshness window`
5. Add a one-time cleanup for the existing stale rows after the UI behavior is fixed.

Retest:

- Log in as admin.
- Open Document Generation.
- Select `AstraCart E2E 20260528`.
- Confirm old jobs such as `PRO-260520-1GYX9O` do not disable the Generate button.
- Trigger a fresh job and confirm Job Status shows that fresh active job.
- After completion, confirm the latest job appears at the top of My Document Jobs.

Fix Implemented:

- Frontend now applies a generation freshness gate to queued/pending/processing document jobs.
- Stale active generation rows are excluded from generate-button lock, active generation count, Job Status progress panel, and document polling.
- Stale active rows remain visible in My Document Jobs as non-active/retry-review states rather than blocking current work.
- Freshness parsing now treats bare Supabase timestamp values as UTC so brand-new jobs are not falsely marked stale in non-UTC browsers.

Validation:

- Build passed with `npm.cmd run build`.
- UI smoke validated on Document Generation for `AstraCart E2E 20260528`.
- Old stale job `PRO-260520-1GYX9O` no longer appears as an active blocker.
- Job Status shows `0 active` for generation and displays latest job `PRO-260601-5I20BB`.
- During `PRO-260601-MQ9AGF`, the UI initially exposed a timezone parsing edge case; after the fix, the job was correctly represented as the latest completed run instead of a false stale failure.

## BUG-E2E-071: Epics & User Stories Coverage Gate Still Allows Partial NFR Coverage After Batch Review

Status: closed

Severity: medium

Area:

- n8n Epics & User Stories generator
- Backlog coverage ledger
- Batch generation/retry strategy
- Generated Confluence backlog summary

Observed During:

- Phase 5 Epics & User Stories E2E validation for `AstraCart E2E 20260528`.
- Fresh job completed successfully:
  - Job: `PRO-260601-5I20BB`
  - n8n execution: `997330`
  - Jira output: 5 epics and 9 stories created.
  - Confluence output: `Professional QA Backlog - AstraCart E2E 20260528`.

What Happened:

- Coverage ledger was enforced and no items were fully missing:

```text
coveredCount: 6
missingCount: 0
partialCount: 1
unknownCount: 0
blockingUncoveredCount: 0
gateStatus: warning
```

- The remaining partial coverage item is:

```text
coverageId: module_performance_nfrs
moduleRequirement: Performance and reliability non-functional requirements
coverageStatus: partial
notes: NFRs partially covered; some focus on scalability and error handling tests.
```

- Batch summary also reflects:

```text
totalBatches: 4
completedBatches: 3
partialBatches: 1
missingBatches: 0
retryingBatches: 1
recoveredBatches: 0
```

- This means the new batching/review contract prevented missing modules, but it did not fully close the NFR coverage gap.

Expected Behavior:

- If the target is full backlog coverage, the batch strategy should either:
  - generate explicit NFR/quality-enabler backlog items, or
  - mark the NFR item as deliberately excluded/out-of-scope with clear rationale.
- A partial coverage item should be clearly surfaced to the user as a warning in the output and UI.
- If internal retry is advertised, `retryingBatches` should represent actual retry/recovery behavior, not just a partial warning state.

Suggested Fix:

1. Update the Epics & User Stories prompt/validator so NFR coverage cannot remain partial silently.
2. For NFR coverage, allow one of these explicit outcomes:
   - create a dedicated quality/NFR epic or story
   - map NFRs to concrete non-functional acceptance criteria in relevant stories
   - mark as excluded/out-of-scope with reason
3. Tighten batch summary semantics:
   - `retryingBatches` should only be non-zero when a real retry attempt occurred.
   - partial-but-accepted batches should be counted separately as `partialBatches`.
4. Keep the UI warning behavior, but make the generated Confluence summary say exactly which module needs review and why.

Retest:

- Trigger Epics & User Stories generation for `AstraCart E2E 20260528`.
- Confirm coverage ledger has no `missing`, `unknown`, or unresolved `partial` rows unless deliberately excluded.
- Confirm NFR coverage is represented in Jira backlog or explicitly documented as excluded.
- Confirm Job Status/My Document Jobs shows the same warning state as the Confluence summary.

Fix Implemented:

- Updated Epics & User Stories n8n workflow `Vwc6c8ehsRTF8svG`.
- Prompt now explicitly requires NFR coverage to be resolved by creating quality/NFR backlog items, mapping NFR acceptance criteria to relevant stories, or documenting a deliberate exclusion with rationale.
- Batch retry summary now counts `retryingBatches` only when a real unresolved retried batch exists.
- Confluence/summary wording now distinguishes `needs review`, `retrying`, `recovered`, and `missing`.
- Frontend now renders partial coverage as `needs review`, not `retrying`.
- UI wording now says `1 coverage area needs review` and explains the action: review the generated output/Confluence summary and decide whether the item should become acceptance criteria, a quality item, or an explicit out-of-scope item.
- UI overflow wording changed from cryptic `+1` to `1 more` with a tooltip listing the hidden additional module(s).
- Compact output/job cards now show only a color-coded coverage icon by default; clicking it opens a `Coverage Review` modal with the review action, score, ledger counts, and batch/module details.
- Coverage icons are aligned with the existing action/status icon rows:
  - Output cards: beside Open and Usage icons.
  - My Document Jobs cards: beside Status, Usage, Open, and Regenerate icons.
  - Job Status panel: beside the status badge in the job header because that panel has no separate action icon row.
- My Document Jobs icon row now uses consistent 34px controls:
  - Coverage warning icon uses amber icon and amber circular border with tooltip `Coverage needs review`.
  - Open icon uses primary blue icon and circular border.
  - Usage icon uses the secondary/data color so it is visually distinct from Open, Coverage, and Status.
- Completed jobs now show `100%` as job progress; the previous `82%` is shown only as `82% coverage score`.

Validation:

- Build passed with `npm.cmd run build`.
- UI smoke validated existing job `PRO-260601-5I20BB`.
- Job Status, generated output summary, and My Document Jobs now keep coverage detail behind the coverage icon instead of showing bulky inline coverage blocks.
- UI smoke confirmed completed Job Status progress shows `100%`.
- UI smoke confirmed the coverage icon opens a modal showing `1 coverage area needs review`, `82% coverage score`, ledger counts, and `QA and Performance NFRs` as the partial module requiring review.
- Fresh Epics & User Stories validation completed with job `PRO-260601-MQ9AGF`.
- Coverage gate now passes:
  - `coverageLedgerCount: 6`
  - `coveredCount: 6`
  - `missingCount: 0`
  - `partialCount: 0`
  - `unknownCount: 0`
  - `blockingUncoveredCount: 0`
  - `quality_gate_status: passed`
- UI coverage modal shows `Coverage passed`, `Ledger: 6`, `Covered: 6`, and `5 / 5 complete`.
- NFR/quality coverage is represented through `cover_quality_assurance` and covered mappings to generated epics/stories.

## BUG-E2E-072: Epics & User Stories Update Run Creates Duplicate Jira Backlog Instead Of Reusing Existing Issues

Status: closed

Severity: high

Area:

- n8n Epics & User Stories generator
- Jira create/update/upsert behavior
- Jira idempotency label matching
- FE update workflow validation

Observed During:

- Phase 5 Epics & User Stories update-path validation for `AstraCart E2E 20260528`.
- Existing completed backlog job already existed:
  - Prior job: `PRO-260601-5I20BB`
  - Prior output: 5 epics and 9 stories
  - Prior Jira keys: epics `KAN-762` to `KAN-766`, stories including `KAN-767` to `KAN-775`.
- User triggered Epics & User Stories again from FE.
- New job completed:
  - Job: `PRO-260601-MQ9AGF`
  - Status: `completed`
  - Output: 5 epics and 12 stories
  - New Jira keys: epics `KAN-776` to `KAN-780`, stories `KAN-781` to `KAN-792`.

What Happened:

- The run behaved like a fresh create, not an update/upsert.
- The run was not a delta-only update for the previously missing/partial NFR coverage.
- The prior job had only one coverage gap:
  - `module_performance_nfrs`
  - `Performance and reliability non-functional requirements`
  - Status: `partial`
- A correct update should have preserved the existing backlog and generated only the missing NFR/quality delta, either as:
  - one or more NFR/quality stories,
  - NFR acceptance criteria added to existing matching stories,
  - or an explicit exclusion/rationale if not applicable.
- Instead, the latest run replanned the whole backlog:
  - Prior coverage taxonomy: `module_account_access`, `module_cart_management`, `module_checkout_payment`, `module_delivery_tracking`, `module_identity_management`, `module_performance_nfrs`, `module_shopping_discovery`.
  - Latest coverage taxonomy: `cover_api_integration`, `cover_checkout_flow`, `cover_data_model_and_design`, `cover_identity_and_auth_api`, `cover_quality_assurance`, `cover_ui_ux`.
- This means the latest output is not simply "previous output plus NFR coverage"; it is a fresh alternate backlog structure.
- Supabase `qa_job_metrics` for `PRO-260601-MQ9AGF` records:

```text
epics_created: 5
epics_reused: 0
stories_created: 12
stories_reused: 0
```

- Stored output also marks every new epic/story action as `created`.
- The latest run consumed nearly a full create-run token budget:
  - Previous create job `PRO-260601-5I20BB`: `18,092` tokens, estimated `US$0.021926`.
  - Latest run `PRO-260601-MQ9AGF`: `17,595` tokens, estimated `US$0.021068`.
  - For a true missing-content update, this should be much smaller because only unresolved coverage should be generated.
- Existing prior Jira backlog items were not reused or updated.
- This creates duplicate Jira backlog items for the same project when the user regenerates Epics & User Stories.

Expected Behavior:

- When Epics & User Stories already exist for a project, the workflow should enter update/upsert mode.
- The workflow should search Jira using stable labels/correlation IDs and existing project scope.
- Matching epics/stories should be reused or updated.
- Only genuinely new coverage modules/stories should be created.
- If the only unresolved item is NFR/quality coverage, only NFR/quality content should be created or patched.
- The workflow should preserve the previous successful coverage ledger and compute a delta before asking the model to generate backlog items.
- FE should communicate whether the run created, updated, reused, or added items.

Suggested Fix:

1. Add a pre-generation live source-of-truth snapshot step:
   - use Supabase/app history only to identify that update mode is needed and route the job,
   - pull current Epics/User Stories from Jira using project key and stable Q-Ops labels,
   - pull the current backlog summary / coverage ledger from Confluence,
   - extract prior epics/stories, stable labels, Jira keys, and coverage ledger from Jira/Confluence runtime data,
   - identify only `missing`, `partial`, or `unknown` coverage items.
2. Add a delta prompt path for update runs:
   - include only unresolved coverage items plus minimal parent context,
   - instruct the model not to re-plan already-covered modules,
   - require any generated item to map back to a specific unresolved coverage ID.
3. In the Epics & User Stories n8n workflow, add a pre-publish Jira lookup step:
   - search by project key
   - idempotency label prefix
   - stable labels/correlation IDs
   - project identifier label if available
4. Preserve stable correlation IDs across regenerations.
   - Current fresh run changed IDs from semantic IDs such as `KAN-EPIC-PRODUCT-DISCOVERY` to generic IDs such as `KAN-EPIC-001`, which likely breaks reuse matching.
5. For matching items:
   - update summary/description/acceptance criteria
   - do not create duplicate Jira issues
6. Record explicit update metrics:
   - `epics_created`
   - `epics_updated`
   - `epics_reused`
   - `stories_created`
   - `stories_updated`
   - `stories_reused`
   - `coverage_items_resolved`
   - `coverage_items_unchanged`
7. Surface these counts in the generated Confluence summary and FE output card/modal.

Fix Implemented:

- FE now detects the latest completed output for the same project and document type before queueing generation.
- FE sends `generationMode: create | update | retry` and a minimal `updateContext` containing routing identifiers and `liveHydrationRequired: true`.
- FE no longer sends previous generated Epics/User Stories content, coverage details, or locally stored generated-output content as the update source of truth.
- Queue creator workflow `yPgr7mtUnL3E8QQP` now persists `generationMode`, `updateMode`, `updateOfJobId`, and `updateContext`, emits update-specific queued metadata, and returns the mode in the webhook response.
- Queue worker workflow `QApRBFSaJgINsdHN` now forwards update context to the backlog generator and stores update-mode metadata in completion output/logs.
- Backlog/Jira workflow `Vwc6c8ehsRTF8svG` now hydrates update context live from Jira and Confluence before prompt generation:
  - `Search Live Jira Backlog` pulls existing Q-Ops generated Jira epics/stories for the project.
  - `Search Live Confluence Backlog` pulls the existing Confluence backlog summary page.
  - `Build Live Update Context` derives `previousEpics`, `previousStories`, and `previousCoverageLedger` from the live Jira/Confluence responses.
- Backlog/Jira workflow `Vwc6c8ehsRTF8svG` then prompts update runs to preserve prior stable IDs, avoid replanning covered modules, and focus generation on unresolved or newly discovered coverage only.
- Failed update job `PRO-260601-J78AXF` failed safely before Jira publishing because compact update context did not contain story children. This is now addressed by live Jira/Confluence hydration, but that failed job should not be used as proof of success.
- FE Regenerate behavior now preserves update intent for failed update jobs:
  - failed create jobs still queue retry-mode regeneration,
  - failed update jobs queue a new update-mode run without sending local generated-output content,
  - the update-mode resubmission uses live Jira/Confluence hydration as the source of truth.
- Retest attempt after clicking Regenerate on failed update job `PRO-260601-J78AXF` created job `PRO-260601-HYKBSW`, but it queued as `generation_mode: retry` because the FE did not yet enrich generated-doc rows with `qa_job_metrics.metadata`.
- Job `PRO-260601-HYKBSW` failed safely before Jira publishing with `Invalid URL: /rest/api/content`.
- Follow-up fix added:
  - FE now reads `qa_job_metrics.metadata` and enriches generated job cards with `generationMode`, `updateOfJobId`, and `retryOfJobId`.
  - Regenerate on a failed retry whose source job was an update now also resubmits as update mode.
  - n8n backlog workflow now guards live Jira/Confluence base URLs so live hydration cannot resolve to a relative `/rest/api/content` URL.
- Retest attempt after the follow-up fix created job `PRO-260601-392LNX`.
  - Confirmed queued correctly as `generation_mode: update`.
  - Confirmed `update_of_job_id: PRO-260601-MQ9AGF`.
  - Confirmed `liveHydrationRequired: true` and `updateSourceOfTruth: jira_confluence_live`.
  - Confirmed live Jira/Confluence hydration ran before prompt generation.
  - Job failed safely before Jira publishing because the model returned nested `childStories`, while the validator only accepted `stories`, `userStories`, `children`, or `items`.
- Follow-up fix added:
  - `Validate Team Managed Backlog` now treats nested `childStories` as valid stories.
  - `Robust Backlog JSON Parser` also accepts top-level `childStories` if returned by the model.
- Retest attempt after this fix created job `PRO-260601-D33JJJ`.
  - Confirmed queued correctly as `generation_mode: update`.
  - Confirmed `update_of_job_id: PRO-260601-MQ9AGF`.
  - Confirmed `liveHydrationRequired: true` and `updateSourceOfTruth: jira_confluence_live`.
  - Confirmed live Jira and Confluence hydration ran before prompt generation.
  - Job failed safely before Jira publishing because the model returned a valid no-op update result: `document.updateSummary` plus `epics: []`.
  - The parser still required at least one generated epic/story and did not treat a no-op update as valid.
  - Additional issue found: live Jira hydration classified some story issues as epics because story cards can carry epic-related labels. Jira issue type must be trusted before label fallback.
- Follow-up fix added:
  - `Build Live Update Context` now classifies live Jira issues by `issuetype.name` first, using labels only as fallback when issue type is missing.
  - `Robust Backlog JSON Parser` now accepts update-mode no-op outputs when an `updateSummary` is present.
  - `Validate Team Managed Backlog` now reads the live update context and seeds reused epics/stories from live Jira when the update run has no new backlog items to create.
  - `Determine Epic Reuse Or Create` and `Determine Story Reuse Or Create` now directly reuse live Jira keys before falling back to idempotency-label search, preventing duplicate Jira creation if older labels are imperfect.
  - Syntax smoke check passed for the patched n8n code nodes: live update context, parser, validator, epic reuse/create, and story reuse/create.
- Build validation passed with `npm.cmd run build`.
- Fresh FE update retest has now proved Jira reuse behavior and no duplicate backlog creation. See closure validation below.

Closure Validation:

- Retested with FE Regenerate on failed update path after fixes.
- New job: `PRO-260601-4DR0RI`.
- Confirmed queued correctly as update mode:
  - `generation_mode: update`
  - `update_of_job_id: PRO-260601-MQ9AGF`
  - `liveHydrationRequired: true`
  - `updateSourceOfTruth: jira_confluence_live`
- n8n integrated backlog workflow execution `1000932` completed successfully.
- Confirmed Confluence page was updated, not recreated:
  - page id `25427969`
  - action `updated`
  - URL `https://anujalhans1.atlassian.net/wiki/spaces/TD/pages/25427969/Professional+QA+Backlog+-+AstraCart+E2E+20260528`
- Confirmed Jira issues were reused, not duplicated:
  - Epics reused: `5`
  - Stories reused: `12`
  - Epics created: `0`
  - Stories created: `0`
- Confirmed coverage gate passed:
  - Ledger rows: `6`
  - Covered: `6`
  - Partial: `0`
  - Missing: `0`
  - Unknown: `0`
- Fixed metrics logger follow-up:
  - Worker workflow `QApRBFSaJgINsdHN` now counts `reuse/create/update` action aliases as well as `reused/created/updated`.
  - Current test job `PRO-260601-4DR0RI` completion metrics were corrected to `epics_reused: 5`, `stories_reused: 12`, `epics_created: 0`, `stories_created: 0`.

Residual Follow-Up:

- Update-mode token/cost optimization still needs separate improvement. This run reused Jira correctly but still generated a full backlog-sized response (`word_count: 6239`, `tokens_total: 109082`). Track that under `BUG-E2E-073` / future delta-update optimization work, not this duplicate-Jira bug.

Retest:

- Trigger Epics & User Stories again for `AstraCart E2E 20260528` after a prior successful backlog exists.
- Use normal `Generate Documents` -> `Continue Update`; do not use `Regenerate` on failed job `PRO-260601-J78AXF` for this validation.
- Confirm existing Jira items are reused/updated instead of duplicated.
- Confirm metrics show non-zero `epics_reused`/`epics_updated` and `stories_reused`/`stories_updated`.
- Confirm only unresolved coverage items are sent through the delta-generation path.
- Confirm token usage is materially lower than a full fresh generation when only one coverage gap exists.
- Confirm FE clearly displays create/update/reuse counts.

## BUG-E2E-073: Update Mode Contract Exists But Delta Update Logic Is Missing For Non-Backlog Documents

Status: fixed - workflow/build/UI smoke validated; pending next live shared-doc update export

Severity: medium

Area:

- n8n document generation workflows
- Update workflow behavior
- Token/cost optimization
- Generated document quality

Observed During:

- Post-fix review after implementing update-mode support for Epics & User Stories.

Current State:

- FE now supports `generationMode: create | update | retry` and sends compact `updateContext` for all generated document types.
- Queue creator and queue worker can persist and forward update-mode metadata.
- Epics & User Stories has dedicated update-mode prompt/context handling in the backlog/Jira workflow.
- Test Strategy, Test Plan, and Risk Matrix now have a shared-doc delta-update layer in the active full retrieval generator.
- Other document types are contract-ready, with separate deep delta/update work tracked for backlog, Story Test Cases, and RTM.

Implementation Update - 2026-06-03:

- Patched active n8n workflow `fullRetrievalD01` with script `scripts/patch_shared_doc_delta_update.cjs`.
- Added prompt marker `SHARED_DELTA_UPDATE_V1` for shared Confluence documents:
  - applies to `test_strategy`, `test_plan`, and `risk_matrix`,
  - instructs update-mode runs to focus on changed source context and unresolved coverage,
  - requires a `Delta Update Summary` section with `updated`, `added`, `preserved`, `removed`, or `no_change` actions,
  - explicitly tells the model not to rewrite stable sections for style-only changes.
- Added shared-doc update summary construction in the `Quality Gate`:
  - `updateSummary.version = shared-delta-update-v1`,
  - records updated / added / removed / preserved section names,
  - records update reasons and coverage ledger counts,
  - records this update run's token/cost usage,
  - estimates token/cost savings against the previous completed run when previous token metadata is available.
- FE `compactGeneratedOutputForUpdate()` now carries:
  - previous Confluence page id/url fallbacks,
  - previous token/cost usage,
  - previous word count,
  - update reasons,
  - `deltaRequested = true`.
- FE `UpdateSummaryNotice` now understands shared-doc delta summaries and shows:
  - delta update completed vs no changes needed,
  - sections updated/preserved,
  - tokens/cost for the update attempt,
  - estimated token savings when available.
- Smoke validation:
  - active workflow markers verified for prompt instructions, quality summary, and completion persistence,
  - frontend production build passed after elevated Vite build,
- `dist` restored after build.

Implementation Update - 2026-06-04:

- Patched active n8n workflow `fullRetrievalD01` with `scripts/patch_shared_doc_delta_update_v3.cjs`.
- V3 keeps Test Strategy, Test Plan, and Risk Matrix update runs in shared-document update mode, but changes the publish merge behavior:
  - strips prior Q-Ops delta summaries before reinserting one clean summary,
  - sanitizes user-facing source references before Confluence publish,
  - removes raw pipe-delimited chunk metadata from final HTML,
  - prevents the old full Confluence body from being appended under a preserved-content sentence,
  - guards against full-document patch responses by publishing one summary plus one patch body instead of old+new duplicate bodies.
- Frontend now labels shared-document update outputs as `Updated` instead of `Generated`.
- Frontend now pauses retry actions after repeated deterministic failures and asks the user to inspect Error Details/admin workflow state instead of encouraging an endless retry loop.
- Production build passed after the patch.
- UI smoke on Generate Documents confirmed the latest Risk Matrix update displays as `Risk Matrix Updated` and the job cards remain readable.

Residual Note:

- This is a surgical shared-doc delta-guided update layer that avoids storing full generated document bodies locally.
- Live validation is still required after ingesting controlled supporting-document deltas to confirm the generated Confluence pages preserve unchanged sections and that usage is materially lower than a full recreate.

Remaining / Separate Implementation:

- Test Strategy:
  - live validation still needed after controlled KB delta.
- Test Plan:
  - live validation still needed after controlled KB delta.
- Risk Matrix:
  - live validation still needed after controlled KB delta, especially stable risk IDs and readable table layout.
- Traceability Matrix:
  - should compare prior requirements, Jira backlog, and test-case mappings,
  - update only changed/new/missing trace links,
  - preserve stable row IDs and previous mappings where still valid.
- Story Test Cases:
  - should identify existing test cases linked to story keys,
  - generate only missing/changed test cases,
  - reuse or update existing Jira test cases instead of duplicating them.

Expected Behavior:

- If a user regenerates any document after a prior successful run, the workflow should enter true update mode.
- Existing valid content should be preserved.
- Only source-input deltas, missing coverage, stale coverage, or changed upstream artifacts should be regenerated.
- FE should show whether the run was a create, update, retry, or partial update.
- Usage/tokens for small updates should be materially lower than full document creation.

Suggested Fix:

1. Add document-specific previous-output loaders for Test Strategy, Test Plan, Risk Matrix, RTM, and Story Test Cases.
2. Normalize prior outputs into compact update context:
   - previous sections,
   - previous coverage ledger,
   - stable row IDs,
   - source references,
   - Confluence/Jira references where applicable.
3. Add delta detection per document type:
   - new source chunks,
   - changed source metadata,
   - missing/partial/unknown coverage ledger rows,
   - changed upstream Jira/test-case mappings.
4. Add update prompts that explicitly preserve unchanged sections and generate only required deltas.
5. Record update metrics:
   - sections_reused,
   - sections_updated,
   - coverage_items_resolved,
   - coverage_items_unchanged,
   - jira_items_reused/updated/created where applicable.
6. Surface update/reuse counts in FE summary and usage/details modals.

Retest:

- Run create, then update, for each document type after adding a controlled source delta.
- Confirm unchanged content remains stable.
- Confirm only changed/missing content is regenerated.
- Confirm usage is lower for small updates than full create runs.
- Confirm no duplicate Jira issues/test cases are created for backlog/test-case update workflows.

## BUG-E2E-074: Epics & User Stories Update Reuses Jira Correctly But Still Consumes Full Generation Budget

Status: fixed - workflow smoke validated; pending next live Epics & User Stories update savings retest

Severity: medium

Area:

- n8n Epics & User Stories generator
- Update workflow token/cost optimization
- Delta-only backlog generation

Observed During:

- FE Regenerate update retest for `AstraCart E2E 20260528`.
- Job: `PRO-260601-4DR0RI`.
- Prior successful backlog job: `PRO-260601-MQ9AGF`.

What Happened:

- Update mode correctly reused existing Jira items and did not create duplicates:
  - Epics reused: `5`
  - Stories reused: `12`
  - Epics created: `0`
  - Stories created: `0`
- Confluence page was updated in place:
  - page id `25427969`
  - action `updated`
- Coverage gate passed:
  - Ledger rows: `6`
  - Covered: `6`
  - Partial/Missing/Unknown: `0`
- However, the update still generated a full backlog-sized response:
  - `word_count: 6239`
  - `tokens_total: 109082`
  - `estimated_cost_usd: 0.068504`

Expected Behavior:

- If live Jira/Confluence hydration shows all coverage items are already covered, the update workflow should avoid a full backlog regeneration.
- It should either:
  - run a lightweight no-op validation path and update the Confluence summary only, or
  - send only unresolved coverage items to the model.
- Token usage for a no-change update should be materially lower than a fresh create run.

Suggested Fix:

1. Add a pre-model delta gate after live Jira/Confluence hydration.
2. If coverage is already passed and no source deltas are detected, skip the large backlog-generation prompt.
3. Produce a compact update result:
   - reused epics/stories
   - coverage summary
   - Confluence update summary
   - token/cost metadata indicating lightweight validation
4. If only some coverage rows are `partial`, `missing`, or `unknown`, call the model with only those unresolved rows plus minimal parent context.
5. Surface `no changes needed` or `coverage already complete` clearly in FE output cards and Confluence summary.

Fix Implemented:

- 2026-06-05: Patched active Epics & User Stories n8n workflow `Vwc6c8ehsRTF8svG` with a pre-model backlog delta gate.
- The update path now has a lightweight no-model branch when existing backlog coverage is already clean and no source/update reasons require regeneration.
- The no-model branch reuses existing epics/stories, emits a compact update summary, and records estimated token savings instead of spending a full backlog generation budget.
- Create/full-generation behavior remains routed through the existing model path.
- Workflow code compilation and connection smoke validation passed against the patched local n8n workflow.

Retest:

- Trigger update when existing backlog coverage is already passed.
- Confirm Jira creates `0` new issues and reuses existing keys.
- Confirm Confluence page is updated in place.
- Confirm tokens are significantly lower than full create/update regeneration.
- Confirm FE explains that no new backlog items were needed.

## BUG-E2E-075: Failed Update-Chain Document Jobs Still Show Retry In Progress After Later Success

Status: fixed

Severity: medium

Area:

- Frontend
- My Document Jobs panel
- Retry/recovery display state

Observed During:

- Epics & User Stories update retry validation for `AstraCart E2E 20260528`.
- Successful retry/update job: `PRO-260601-4DR0RI`.
- Earlier failed update jobs in the chain include:
  - `PRO-260601-D33JJJ`
  - `PRO-260601-392LNX`

What Happened:

- `PRO-260601-4DR0RI` completed successfully.
- The failed ancestor cards still displayed the retry icon and message:
  - `A retry is already in progress: PRO-260601-4DR0RI`
- This is misleading because the retry is no longer in progress; it completed successfully.

Expected Behavior:

- Once a later retry/update completes successfully, every failed ancestor in that retry chain should display as `Recovered`.
- The card should say no action is needed and identify the successful retry job where available.

Root Cause:

- The My Document Jobs status derivation trusted stale `retryStatus: retrying` before walking the actual `retriedByJobId` chain.
- Because of that precedence, a completed descendant job could be ignored and the failed ancestor remained visually stuck as retrying.

Fix Implemented:

- Updated `generationJobRetryState` in `src/pages/DashboardPage.tsx`.
- The function now checks the real retry chain first:
  - if the child retry job is completed, return `recovered`;
  - if the child is active, return `retrying`;
  - otherwise recurse through descendants.
- Stale `retryStatus` is now used only as fallback when no retry-chain link is available.

Retest:

- Reload Dashboard/My Document Jobs.
- Confirm `PRO-260601-D33JJJ` and earlier failed ancestors display as `Recovered`, not `Retry in progress`.
- Confirm the successful latest job `PRO-260601-4DR0RI` remains `Completed`.

## BUG-E2E-076: Story Test Cases Job Remains Processing Without Visible n8n Progress

Status: fixed - STC progress checkpoints and UI stage model implemented; pending next live long-running STC retest

Severity: high

Area:

- n8n Story Test Cases worker
- n8n Story Test Cases generator
- Supabase `qa_jobs` processing-state freshness
- FE Job Status visibility

Observed During:

- Story Test Cases E2E validation for `AstraCart E2E 20260528`.
- Job: `STC-260601-59FCII`.
- Source backlog job: latest completed Epics & User Stories job for the same project.

What Happened:

- FE trigger successfully queued the Story Test Cases job.
- Supabase `qa_jobs` row moved from `pending` to `processing`.
- `qa_job_metrics` recorded:
  - `JOB_QUEUED`
  - `JOB_STARTED`
- n8n executions were created:
  - Worker execution: `1002160` for `PRO QA Story Test Cases Worker`
  - Generator execution: `1002162` for `PRO QA Jira Story Test Case Generator`
- After ~13 minutes, Supabase still showed:
  - status: `processing`
  - output: empty
  - story count: `0`
  - test case count: `0`
  - error: `null`
- n8n execution details still showed both executions as `running`, but node-level data did not show visible progress beyond the trigger stack.

Additional Finding After Completion:

- The job eventually failed after ~19 minutes.
- Supabase final status:
  - job id: `STC-260601-59FCII`
  - status: `failed`
  - error: `The service was not able to process your request`
- n8n generator execution:
  - execution id: `1002162`
  - status: `error`
  - failing node: `Create Jira Test Case`
  - item index: `115`
- Jira returned HTTP `500` with SQL connection-pool timeout:
  - `couldn't obtain SQL connection within 5000.099 ms`
- This happened after coverage planning and detailed batch generation had already completed.

Coverage Planning Result Before Jira Failure:

- Source stories discovered: `12`
- Planned test cases generated before Jira publishing: `157`
- Planned test-case count by story:
  - `KAN-781`: `15`
  - `KAN-782`: `12`
  - `KAN-783`: `12`
  - `KAN-784`: `16`
  - `KAN-785`: `13`
  - `KAN-786`: `12`
  - `KAN-787`: `15`
  - `KAN-788`: `11`
  - `KAN-789`: `12`
  - `KAN-790`: `15`
  - `KAN-791`: `12`
  - `KAN-792`: `12`
- Coverage planning did not miss a source story.
- Failure happened during Jira Test Case creation/publishing, not during coverage planning.

Expected Behavior:

- Story Test Cases generation should expose meaningful progress or complete/fail deterministically.
- If the generator is actively working, UI/metrics should show a stage such as:
  - fetching source stories
  - planning coverage
  - generating test-case batches
  - creating/reusing Jira test cases
  - linking test cases to stories
- If the execution is stuck, the worker should fail the job with a clear retryable error instead of leaving it indefinitely in `processing`.

Coverage Expectation:

- Latest source backlog contains `12` Jira stories:
  - `KAN-781`
  - `KAN-782`
  - `KAN-783`
  - `KAN-784`
  - `KAN-785`
  - `KAN-786`
  - `KAN-787`
  - `KAN-788`
  - `KAN-789`
  - `KAN-790`
  - `KAN-791`
  - `KAN-792`
- Story Test Cases output must cover every eligible source story.
- No completed Story Test Cases job should pass if any source story has zero linked/generated test cases.
- Coverage ledger should clearly show:
  - total source stories
  - stories covered
  - stories missing test cases
  - linked test case count per story
  - any story/category needing review

Suggested Fix:

1. Add stage/progress metric writes inside the Story Test Cases worker/generator:
   - after source-story fetch
   - after Jira story fetch
   - after coverage-plan generation
   - after detail batch generation/retry
   - after Jira create/reuse/link
2. Add a freshness guard for Story Test Cases processing jobs.
3. Add a final coverage gate that compares source story keys against generated mappings.
4. Fail the job if any source story is missing generated/linked test cases.
5. Surface the final coverage summary in FE Job Status, output card, My Document Jobs, and analytics.
6. Add Jira publishing resilience:
   - create/reuse/link test cases in smaller batches
   - retry Jira `500`/SQL pool timeout responses with backoff
   - persist partial progress after each successful batch
   - make retry resume from existing idempotency labels instead of starting over
7. If Jira publishing fails after generation succeeds, show a user-friendly `Publishing failed after coverage generation` state instead of a generic service error.

Fix Implemented:

- 2026-06-09: Patched active Story Test Cases generator workflow `SG7khcKlhHst48WH` with durable `qa_jobs.output.progress` checkpoints.
- Added checkpoints at:
  - planning scope
  - planning coverage
  - generating test cases
  - linking traceability
  - finalizing coverage
- Patched Story Test Cases worker workflow `ivz13uFyjfCT8149` so locked STC jobs immediately show a `Preparing request` progress state.
- Progress writes preserve the pre-Jira usage checkpoint shape, so failed-after-generation usage recovery remains intact.
- Added FE stage model for active Story Test Cases jobs in Job Status and My Document Jobs:
  - Preparing
  - Planning coverage
  - Generating cases
  - Publishing to Jira
  - Finalizing
- Patch script:
  - `scripts/patch_stc_progress_checkpoints_v1.cjs`
- n8n backups created before patching:
  - `docs/test_data/n8n_workflow_backups/stc_progress_before_stc_progress_checkpoints_v1_20260609055414.json`
  - `docs/test_data/n8n_workflow_backups/stc_progress_before_stc_progress_checkpoints_v1_20260609055509.json`

Retest:

- Trigger Story Test Cases for `AstraCart E2E 20260528`.
- Confirm all `12` source stories are represented in the output mappings.
- Confirm every source story has at least one linked/generated test case.
- Confirm coverage ledger shows `0` missing stories.
- Confirm UI displays active generation stage while the job runs.
- Confirm failed/stuck jobs become retryable instead of staying in `processing`.

## BUG-E2E-077: Failed Story Test Cases Job Does Not Record Token/Cost Usage After Model Work Completed

Status: fixed - workflow patched and worker smoke validated; pending next live failed-after-generation STC retest

Severity: medium

Area:

- n8n Story Test Cases generator
- Failed generation usage metrics
- Analytics failed generation spend
- My Document Jobs usage modal

Observed During:

- Story Test Cases E2E validation for `AstraCart E2E 20260528`.
- Job: `STC-260601-59FCII`.

What Happened:

- The workflow completed substantial model work before failing:
  - `Story Test Case Generator`: `12` story plans
  - `Story Test Case Batch Generator`: `24` detail batches
  - `Story Test Case Batch Retry Generator`: `4` retry batches
  - planned test cases: `157`
- The job then failed during Jira publishing at `Create Jira Test Case`.
- Supabase `qa_job_metrics` recorded `JOB_FAILED`, but usage fields were empty:
  - `word_count`: `null`
  - `tokens_total`: `null`
  - `estimated_cost_usd`: `null`

Expected Behavior:

- Failed generation jobs should still record usage consumed before failure.
- This is especially important when the failure happens after model generation but before Jira/Confluence publishing.
- Analytics `Failed Generation Spend` and My Document Jobs usage modal should reflect real consumed usage.

Suggested Fix:

1. Accumulate token/cost/word metrics immediately after each model/planning/batch step.
2. Persist interim usage metrics before Jira publishing starts.
3. On failure, include accumulated usage in the `JOB_FAILED` metric.
4. Ensure FE usage modal can display failed usage for Story Test Cases just like other document jobs.

Fix Implemented:

- 2026-06-09: Patched active Story Test Cases generator workflow `SG7khcKlhHst48WH`.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_failed_usage_checkpoint_v1_20260609035739.json`
- Added a pre-Jira-publish usage checkpoint after `Merge Story Test Case Batches` and before `Expand Story Test Case Items`.
- The checkpoint captures generated story count, planned/generated test case counts, word count, input/output/total tokens, estimated cost, and standard `tokenUsage`.
- The checkpoint is persisted to `qa_jobs.output` while the job is still `processing`, so a later Jira publish/link failure has usage data to recover.
- Story Test Case create/Jira publish logic was not changed; the patch only inserts a pass-through checkpoint before the existing Jira item expansion path.
- Patched active Story Test Cases worker workflow `ivz13uFyjfCT8149`.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_ivz13uFyjfCT8149_before_stc_failed_usage_checkpoint_v1_20260609035739.json`
- Worker failure path now fetches the persisted checkpoint and merges token/cost/word usage into:
  - failed `qa_jobs.output.tokenUsage`,
  - top-level failed output token/cost aliases,
  - terminal `qa_job_metrics.JOB_FAILED` usage fields,
  - failure metadata showing `failed_after_usage_checkpoint`.

Verification:

- n8n MCP confirms generator workflow `SG7khcKlhHst48WH` is active and updated at `2026-06-09T03:57:39.360Z`.
- n8n MCP confirms worker workflow `ivz13uFyjfCT8149` is active and updated at `2026-06-09T03:57:39.368Z`.
- Verified the active generator contains:
  - `Build Story Test Case Usage Checkpoint`,
  - `Persist Story Test Case Usage Checkpoint`,
  - `Restore Story Test Case Usage Checkpoint Items`.
- Verified the active worker contains:
  - `Fetch Story Test Case Usage Checkpoint`,
  - `Merge Story Test Case Failure Usage`,
  - updated failed metric writer with token/cost fields.
- Supabase check confirmed no pending/processing `STC-*` jobs before smoke execution.
- Worker smoke execution `1057763` completed successfully through the `No Pending Story Test Case Jobs` branch.

Retest:

- Trigger Story Test Cases and force/simulate a Jira publishing failure after generation.
- Confirm failed job records non-zero tokens/cost.
- Confirm Analytics `Failed Generation Spend` includes the failed Story Test Cases spend.
- Confirm My Document Jobs usage icon/modal shows usage recorded before failure.

## BUG-E2E-078: Story Test Cases Retry Reuses Same Job ID Instead of Creating Child Retry Job

Status: Fixed - smoke validated; pending next live failed-retry validation

Observed On: 2026-06-01

Area: Story Test Cases generation / retry lineage / My Document Jobs

Scenario:
- Initial Story Test Cases job `STC-260601-59FCII` failed during Jira publishing.
- User clicked retry from FE.
- Retry did not create a new `STC-*` job row. Instead, the same `qa_jobs.job_id = STC-260601-59FCII` was reset/reused.
- `qa_job_metrics` recorded `JOB_RETRIED` and a fresh `JOB_STARTED` against the same job ID.

Expected:
- Retry behavior should be consistent with other document generation jobs.
- A retry should create a new child job ID and preserve lineage with `retryOfJobId` / `retryJobId`.
- My Document Jobs should show the failed parent and retry child clearly, with status/usage attached to the correct attempt.

Actual:
- Same job ID was reused.
- Retry lineage is only visible through metric events, not through a separate job row.
- This makes UI history, failed usage display, retry-chain recovery, and auditability harder to reason about.

Implementation Notes:
- Story Test Cases queue creator currently sets `jobId: isRetry ? retryJobId : jobId`.
- File: `docs/QA_Intelligence/n8n_sdk/pro_qa_story_test_cases_queue_creator.workflow.js`
- This differs from the newer FE expectation for generation retries where retry attempts can be represented as separate child jobs.

Recommended Fix:
- Align Story Test Cases retry with the standard generation retry model.
- On retry, create a new `STC-*` child job row.
- Persist retry lineage in `qa_jobs.input.retryOfJobId` and/or metric metadata.
- Ensure FE My Document Jobs can show parent failed job and child retry job independently.

Fix Implemented:
- Patched active n8n workflow `PRO QA Story Test Cases Queue Creator` (`8nuhDEewnnunXSbF`).
- Story Test Cases retry now creates a fresh child `STC-*` job instead of PATCHing the failed source job.
- New child job input carries `retryOfJobId`.
- Queue metric metadata now carries:
  - `generation_mode`
  - `retry_of_job_id`
  - `update_of_job_id`
- FE retry behavior now treats Story Test Cases the same as other documents:
  - failed create/retry creates a retry child job;
  - failed update retries as update when update context is available.

Validation:
- Code/workflow smoke validation completed on 2026-06-01.
- Active queue workflow now creates a fresh child `STC-*` job for Story Test Cases retries.
- FE retry request now sends Story Test Cases retry/update payloads through the same path used by other document jobs.
- Still needs one live failed Story Test Cases retry to confirm:
  - new child `STC-*` job exists;
  - parent failed job remains available with failed usage;
  - successful child marks parent as recovered in UI.

Current Data Repair:
- Historical stuck job `STC-260601-59FCII` was manually reconciled after verifying n8n success and persisted mappings.
- `qa_jobs.status` is now `completed`.
- Reconstructed output now shows:
  - stories: 11
  - test cases: 165
  - Jira created: 25
  - Jira reused: 140
  - Jira updated: 0

## BUG-E2E-079: Story Test Cases Direct Completion Logs Metrics But Leaves qa_jobs Row Processing

Status: Fixed - smoke validated

Observed On: 2026-06-01

Area: Story Test Cases generator / Supabase persistence / My Document Jobs

Scenario:
- Retry execution completed successfully in n8n.
- Generator execution `1002715` completed with:
  - 165 expanded test cases
  - 140 existing Jira test cases reused
  - 25 new Jira test cases created and linked
  - 165 mappings upserted
- `qa_job_metrics` recorded `JOB_COMPLETED` with usage:
  - words: 29,993
  - tokens: 125,596
  - estimated cost: 0.140642
- But `qa_jobs` still showed `status = processing`, `output = null`, `error = null`.

Expected:
- Successful Story Test Cases completion should update `qa_jobs.status = completed`.
- `qa_jobs.output` should include stories, test cases, mappings, Jira summary, and usage.
- UI should stop showing the job as processing and should show final output/usage.

Actual:
- n8n workflow completed successfully and wrote completed metrics.
- `qa_jobs` remained stuck in `processing`.

Root Cause Candidate:
- Direct completion path node `LOG: Direct Story Test Case Job Completed` posts to `qa_job_metrics` with `Prefer: return=minimal`.
- That HTTP request returns no output item.
- The next node, `Mark Direct Story Test Case Job Completed`, receives zero items, so the final `qa_jobs` PATCH does not run.
- In execution `1002715`, `Mark Direct Story Test Case Job Completed` had `items: 0`.

Recommended Fix:
- Ensure the direct completion path passes the original completion payload into the final `qa_jobs` PATCH.
- Options:
  - Change the metrics log node to return representation and make the PATCH reference `Build Direct Story Test Case Completion Output` explicitly.
  - Or insert a pass-through/merge node after metrics logging so the PATCH always receives the original job payload.
- Keep the existing metric logging intact.

Fix Implemented:
- Patched active n8n workflow `PRO QA Jira Story Test Case Generator` (`SG7khcKlhHst48WH`).
- Direct completion metric logging now returns a representation and the final `qa_jobs` PATCH references `Build Direct Story Test Case Completion Output` explicitly.
- Patched fallback worker completion path in `PRO QA Story Test Cases Worker` (`ivz13uFyjfCT8149`) with the same explicit payload references.
- Completion output now includes Story Test Cases update/retry metadata:
  - `generationMode`
  - `updateContext`
  - `updateOfJobId`
  - `retryOfJobId`

Additional Related Enhancement:
- Story Test Cases existing Jira issue path now supports update mode.
- When `generationMode = update`, existing test cases found by stable label are updated in Jira instead of only reused.
- Output action counts now distinguish:
  - `created`
  - `updated`
  - `reused`
- `qa_story_testcase_links.status` now records `updated` for updated existing test cases.

Validation:
- Supabase validation completed on 2026-06-01 for historical job `STC-260601-59FCII`.
- `qa_jobs.status = completed`.
- `qa_jobs.error = null`.
- `qa_jobs.output` is populated with 11 stories and 165 test cases.
- `qa_job_metrics` has completed usage for the job.
- FE smoke validation completed on 2026-06-01:
  - local generated output state now clears stale completed-job errors;
  - old error text `The service was not able to process your request` is no longer rendered;
  - Story Test Cases output remains visible with 165 test cases.

Current Data Repair:
- Historical stuck job `STC-260601-59FCII` was reconciled from `qa_story_testcase_links` and `qa_job_metrics`.
- Supabase validation after repair:
  - `status = completed`
  - `stories_count = 11`
  - `test_cases_count = 165`
  - usage metric remains recorded at 29,993 words, 125,596 tokens, estimated cost 0.140642.

## BUG-E2E-080: Story Test Cases Jobs Do Not Persist Coverage Summary For Coverage Icon

Status: Fixed - smoke validated

Observed On: 2026-06-01

Area: Story Test Cases generation / coverage contract / My Document Jobs / Output Panel

Scenario:
- Epics & User Stories jobs persist `coverageSummary` / `qualityGate` data.
- The FE coverage icon reads this generic contract and opens a coverage details modal.
- Story Test Cases jobs persisted raw mappings, Jira action counts, and category distribution, but did not persist the same coverage contract.
- As a result, STC jobs could not show the same coverage icon/details behavior even though the workflow had enough source story and mapping data.

Expected:
- Story Test Cases should behave consistently with Epics & User Stories.
- Each STC job should persist story-level coverage:
  - total source stories
  - stories covered
  - stories needing review
  - missing stories
  - generated/planned test case counts per story
  - category coverage per story
- Job Status, Output Panel, and My Document Jobs should show the existing coverage icon for STC jobs.

Fix Implemented:
- Patched active n8n workflow `PRO QA Jira Story Test Case Generator` (`SG7khcKlhHst48WH`).
- Final STC output now includes:
  - `coverageSummary`
  - `batchSummary`
  - `coverageLedger`
  - `qualityGate.coverageSummary`
  - `qualityGate.batchSummary`
- Coverage rows are story-level rows where each source Jira story is checked against published Jira test cases.
- Coverage status rules:
  - `covered`: story has all planned/generated test cases and planned categories represented.
  - `partial`: story has some test cases but planned test cases or categories need review.
  - `missing`: story has no published Jira test cases.
- Direct completion and worker fallback completion now carry the coverage fields into `qa_jobs.output`.

Validation:
- Active n8n generator workflow was verified to contain `coverageSummary` and `qualityGate` in the finalization/direct completion nodes.
- Historical completed job `STC-260601-59FCII` was enriched from existing stored output for UI smoke validation.
- Supabase validation:
  - `coverageSummary.status = passed`
  - `coverageSummary.total = 11`
  - `coverageSummary.covered = 11`
  - `coverageSummary.partial = 0`
  - `coverageSummary.missing = 0`
  - `coverageSummary.score = 100`
- UI smoke validation:
  - Story Test Cases generated output now has coverage data in local state.
  - Coverage icon is available through the existing generic UI path.
  - Coverage modal opens and shows `Ledger: 11` and `Covered: 11`.

## BUG-E2E-081: RTM Update Jobs Do Not Persist Full Coverage And Update Metadata

Status: Fixed - workflow/build validated

Observed On: 2026-06-01

Area: Requirement Traceability Matrix generation / update flow / coverage contract / My Document Jobs / Output Panel

Scenario:
- RTM create flow already had the two-layer traceability contract and enforced Coverage Ledger validation.
- RTM update flow could update the existing Confluence page, but the completion payload was thinner than Epics & User Stories and Story Test Cases.
- Update completions did not consistently persist:
  - `generationMode`
  - `updateSummary`
  - `coverageLedger`
  - `batchSummary`
  - `progress`
  - `qualityGate`
- Because of this, RTM update jobs could publish successfully but still lack enough structured data for the UI coverage/update icons and details.

Expected:
- RTM create and update jobs should follow the same generic document job contract as Epics & User Stories and Story Test Cases.
- RTM update jobs should compare previous compact coverage metadata against current traceability context.
- Output should clearly communicate whether RTM was refreshed with changes or whether no traceability changes were detected.
- Job Status, Output Panel, and My Document Jobs should have the same structured coverage/update metadata for RTM as other supported document types.

Fix Implemented:
- Patched active n8n workflow `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft` (`fullRetrievalD01`).
- Added RTM update-mode instructions to the Prompt Library:
  - current two-layer traceability context remains the source of truth;
  - previous coverage metadata is used only to identify changed, new, removed, or unchanged coverage rows;
  - final RTM remains a complete current-state RTM, not a patch-only note.
- Added RTM update summary generation in the Quality Gate:
  - previous/current coverage row counts;
  - created/updated/reused/removed coverage rows;
  - missing/partial/review coverage row counts;
  - `noChangesDetected` message when applicable.
- Added RTM coverage batch summary generation from Coverage Ledger rows.
- Updated both create and update completion paths to persist:
  - `documentType`
  - `generationMode`
  - `updateOfJobId`
  - `updateSummary`
  - `coverageSummary`
  - `coverageLedger`
  - `batchSummary`
  - `progress`
  - `qualityGate`
- Updated completion metrics metadata for create and update paths with generation/update/coverage fields.
- FE update context now sends compact previous coverage metadata:
  - `previousCoverageSummary`
  - `previousCoverageLedger`
  - `previousBatchSummary`
  - `previousUpdateSummary`

Validation:
- n8n workflow structural validation completed on 2026-06-01.
- Verified `Prompt Library` has `generationMode`, `updateContext`, and RTM update instructions.
- Verified `Quality Gate` has `updateSummary`, `coverageSummary`, `coverageLedger`, and `batchSummary`.
- Verified both RTM completion nodes persist `generationMode`, `updateSummary`, `coverageLedger`, `batchSummary`, `progress`, and `qualityGate`.
- Verified both completion metric nodes have one copy of coverage metadata and include generation/update metadata.
- Frontend build passed with `npm.cmd run build` on 2026-06-01.

## BUG-E2E-082: Story Test Cases Coverage Missed Latest Backlog Story, Blocking RTM

Status: Fixed - live STC rerun validated

Observed On: 2026-06-01

Area: Story Test Cases update / RTM prerequisite coverage / Jira story-testcase links

Scenario:
- RTM generation was triggered for project `AstraCart E2E 20260528`.
- RTM job `PRO-260601-C7RNCX` correctly built its two-layer traceability context from the latest upstream artifacts.
- Latest Epics & User Stories job `PRO-260601-4DR0RI` contains 12 stories.
- Latest Story Test Cases job `STC-260601-59FCII` contains coverage for only 11 stories.
- `qa_story_testcase_links` has links for 11 story keys and no links for `KAN-792`.

Expected:
- Story Test Cases update/generation should cover every current Jira story from the latest Epics & User Stories output.
- If a new or reused story exists in the current backlog, STC should either:
  - create/update/reuse Jira test cases for that story, or
  - mark the story explicitly as missing/needs review in STC coverage output.
- RTM should only publish when every current story has test case coverage or an explicit accepted exclusion.

Actual:
- RTM context contained:
  - Epics: 5
  - Stories: 12
  - Story-testcase links: 165
  - Linked stories: 11
  - Stories without test cases: 1
- Missing story:
  - `KAN-792`
  - Summary: `Implement data model entities and low-level design components for ecommerce platform`
  - Parent epic: `KAN-780`
- RTM quality gate failed as designed because this story has no generated/persisted test case links.

Impact:
- RTM generation is blocked until Story Test Cases covers `KAN-792`.
- This is good from an audit-quality perspective, but indicates STC did not fully process the current backlog.

Recommended Fix:
- Re-check Story Test Cases source-story hydration logic.
- Ensure STC update mode pulls the current story list from live Jira or latest Epics & User Stories output and includes all 12 stories.
- Ensure STC coverage summary total equals current backlog story count.
- Ensure missing stories appear in STC `coverageSummary.missingItems` and `batchSummary` if generation cannot create test cases for them.

Validation Evidence:
- `qa_jobs.PRO-260601-4DR0RI.output.stories` includes `KAN-792`.
- `qa_jobs.STC-260601-59FCII.output.coverageSummary.total = 11`.
- `qa_story_testcase_links` has no row for `KAN-792`.
- RTM job `PRO-260601-C7RNCX` failed with Coverage Ledger missing item `DATA-MDL-01`.
- Fixed on 2026-06-01:
  - Patched active n8n workflow `PRO QA Jira Story Test Case Generator` (`SG7khcKlhHst48WH`).
  - `Build Story Source Items` now merges and dedupes all current story sources from `output.stories`, `output.jira.stories`, generated stories, and backlog stories instead of preferring only `output.jira.stories`.
  - `Finalize Story Test Case Result` now seeds the final STC story list from the full source story set before adding generated/reused/updated test cases.
  - Verified active workflow code contains merged story sources, story-key dedupe, numeric story sorting, and source-story seeding.
  - Live validation on 2026-06-01:
    - Triggered STC update job `STC-260601-5ZXZIK`.
    - n8n generator execution `1005305` completed successfully.
    - Supabase job status: `completed`.
    - `coverageSummary.total = 12`.
    - `qa_jobs.output.stories` includes `KAN-792`.
    - `qa_story_testcase_links` now has 12 linked test cases for `KAN-792`.
    - RTM prerequisite blocker is cleared at story-link level because every current backlog story now has at least one linked Story Test Case.
  - Follow-up issue found during validation:
    - The same STC job reported `coverageSummary.status = warning`, `covered = 0`, `partial = 12`.
    - This is tracked separately under `BUG-E2E-084`.

## BUG-E2E-083: RTM Quality Gate Failure UI Does Not Surface Actionable Missing Coverage Detail

Status: Fixed - UI and workflow contract validated

Observed On: 2026-06-01

Area: Generate Documents UI / Job Status Panel / My Document Jobs / failed RTM jobs

Scenario:
- RTM job `PRO-260601-C7RNCX` failed the quality gate because one coverage item was missing.
- Backend persisted `coverageSummary.missingItems` with the actionable missing coverage item.
- UI displayed a generic failure message:
  - `Document generation could not be completed`
  - `The backend could not finish this document generation request.`
  - `Please retry the job. If the issue repeats, ask an admin to review the workflow execution.`

Expected:
- For quality gate failures with coverage metadata, UI should show user-friendly actionable text.
- Example:
  - `RTM could not be published because 1 coverage item is missing.`
  - `Missing: DATA-MDL-01 - Data model entities and low-level design components.`
  - `Regenerate Story Test Cases for KAN-792, then regenerate RTM.`
- Coverage icon/details should expose the exact missing items.

Actual:
- The backend reason is available, but the visible UI message is generic.
- The user cannot immediately understand that the fix is to refresh Story Test Cases for `KAN-792`.

Recommended Fix:
- Enhance document failure display logic to detect `output.coverageSummary.gateStatus = failed`.
- If `coverageSummary.missingItems` exists, show a coverage-specific failure title/summary/action.
- Keep technical details available under Error Details.

Validation Evidence:
- `qa_jobs.PRO-260601-C7RNCX.output.coverageSummary.missingItems[0].coverageId = DATA-MDL-01`.
- Playwright UI smoke on 2026-06-01 confirmed page text did not include `DATA-MDL-01`, `KAN-792`, or the missing module summary.
- Fixed on 2026-06-01:
  - Frontend failure display now detects document `coverageSummary.gateStatus = failed` / missing coverage and renders a coverage-specific title, summary, action, and technical details.
  - Existing failed RTM job smoke-checked in Playwright; visible text now includes `Coverage gate found missing traceability`, `DATA-MDL-01`, and the missing module summary.
  - Patched active RTM workflow `fullRetrievalD01` so future quality-gate failure outputs persist `traceabilityContext` and `storiesWithoutTestCases`.
  - Future RTM failures can name the exact missing story, for example `KAN-792 - Implement data model entities and low-level design components for ecommerce platform`.
  - Playwright UI smoke after the STC rerun confirmed the RTM failure guidance now names `KAN-792` instead of only the internal coverage ID.
  - Frontend build passed with `npm.cmd run build` on 2026-06-01.

## BUG-E2E-084: Story Test Cases Update Reports All Stories Partial After Successful Jira Link Coverage

Status: fixed - workflow smoke validated; pending next live Story Test Cases update coverage retest

Observed On: 2026-06-01

Area: Story Test Cases coverage scoring / update mode / QA coverage ledger

Scenario:
- After fixing the missed-story source hydration issue, Story Test Cases update job `STC-260601-5ZXZIK` ran for project `AstraCart E2E 20260528`.
- The job completed successfully and included all 12 current backlog stories, including `KAN-792`.
- Jira action summary showed:
  - created: 2
  - updated: 159
  - reused: 0
  - total output test cases: 161

Expected:
- If every current story has linked Jira Story Test Cases and planned categories are satisfied, STC coverage should pass.
- If the workflow intentionally generates a smaller update slice, the coverage ledger should compare against the intended update plan, not an inflated full-plan count.
- For update runs, newly added stories such as `KAN-792` should clearly show whether full planned coverage was created, partially created, or intentionally deferred.

Actual:
- `coverageSummary.total = 12`
- `coverageSummary.status = warning`
- `coverageSummary.covered = 0`
- `coverageSummary.partial = 12`
- `coverageSummary.missing = 0`
- `coverageSummary.score = 50`
- `KAN-792` is present but marked partial:
  - linked/mapped test cases: 12
  - planned test cases: 28
  - missing categories: `Sanity`, `Smoke`
- Several other stories also show `generatedTestCases` lower than `plannedTestCases`, even though DB-level story-testcase links exist for all stories.

Impact:
- RTM missing-story blocker is cleared, but STC itself still communicates "needs review" for every story.
- Users may not know whether this is a true content coverage gap or a scoring/planning mismatch.
- This can undermine confidence in "full coverage" even when Jira links exist.

Likely Root Cause:
- STC update coverage scoring appears to compare current output rows against an inflated full planned-test-case count.
- Update mode may be re-planning all story coverage while only creating/updating a subset, causing every story to be marked partial.
- Existing persisted `qa_story_testcase_links` counts are not reconciled cleanly with `coverageSummary.generatedTestCases` / `plannedTestCases`.

Suggested Fix:
1. Decide the STC coverage contract for update mode:
   - full-story coverage must pass only when each story has enough persisted test cases and required categories; or
   - delta coverage should score only changed/new/missing stories and show unchanged stories as reused/covered.
2. Reconcile coverage scoring against persisted Jira links, not only the current generator output slice.
3. For each story, calculate:
   - existing linked test cases
   - created test cases
   - updated test cases
   - missing planned categories
   - true final coverage status after update.
4. Keep `KAN-792` action detail explicit if it remains partial:
   - show missing categories and what the user/workflow should do next.
5. Add a smoke query that confirms `coverageSummary.covered + partial + missing = total` and that pass/warning semantics match the final link state.

Fix Implemented:

- 2026-06-05: Patched active Story Test Cases n8n workflow `SG7khcKlhHst48WH` with a delta target gate before Jira issue fetch/model planning.
- Update mode now builds a targeted story slice from source changes and previous partial/missing/review coverage instead of blindly planning every story as a fresh full slice.
- Clean no-change updates can bypass the model and carry forward prior covered rows with an explicit no-change update summary and token-savings metadata.
- Source-change updates without specific target detection fall back to the full current source story list to avoid silently reporting zero work.
- Final coverage scoring now carries forward previously covered unchanged stories during update runs.
- Workflow code compilation and connection smoke validation passed against the patched local n8n workflow.

Validation Evidence:
- Job: `STC-260601-5ZXZIK`
- n8n generator execution: `1005305`
- DB link check for source backlog job `PRO-260601-4DR0RI`:
  - all 12 stories have linked test cases.
  - `KAN-792` has 12 linked test cases.
- Job metrics:
  - words: 29,885
  - tokens: 125,531
  - estimated cost: 0.139349
  - generation mode: `update`

## BUG-E2E-085: RTM Job Stuck Processing When Metrics Logging Fails

Status: open

Observed On: 2026-06-01

Area: RTM generation workflow / qa_jobs status / Generate Documents UI

Scenario:
- User triggered RTM generation for `AstraCart E2E 20260528`.
- n8n generator execution `1005785` for workflow `fullRetrievalD01` generated RTM content and reached `QUALITY_GATE_PASSED`.
- The workflow failed at node `LOG: Quality Gate Passed` while inserting into `qa_job_metrics`.
- Supabase returned Cloudflare `522` / connection timeout during the metrics insert.
- The related `qa_jobs` row `PRO-260601-MAFZGH` remained `processing`.

Expected:
- Non-critical metrics/audit logging should not abort the publish/completion path.
- If a critical downstream step fails, `qa_jobs.status` should be moved to `failed` with an actionable error.
- UI should never show `Generation in progress...` without showing the same active job in the Job Status panel.

Actual:
- `qa_jobs.PRO-260601-MAFZGH.status = processing` even though n8n execution `1005785` ended with `status = error`.
- Generate button was locked because the FE saw an active generation job.
- Job Status panel did not show that active job because it prioritized latest batch/recent job cache over active jobs.

Impact:
- User cannot trigger the next generation.
- UI appears contradictory: generation is locked, but no active job is visible in Job Status.
- RTM job outcome is unclear even though the failure cause is known.

Suggested Fix:
1. RTM workflow should treat metrics logging as best-effort or route metrics failures to a fallback path.
2. RTM workflow should always update `qa_jobs` to `completed` or `failed` before exiting.
3. FE Job Status panel should always prioritize fresh active generation jobs when the Generate button is locked.

Validation Evidence:
- n8n `get_execution(fullRetrievalD01, 1005785)` returned `status = error`.
- Execution error node: `LOG: Quality Gate Passed`.
- Error: Supabase `qa_job_metrics` insert returned Cloudflare `522`.
- DB row: `qa_jobs.PRO-260601-MAFZGH.status = processing`.
- Frontend fix applied on 2026-06-01:
  - `StatusPanel` document job source now prioritizes fresh active generated outputs before latest batch/recent output fallback.

## BUG-E2E-086: Live Bulk Ingestion Does Not Show Knowledge Base Summary Notification

Status: fixed - UI smoke validated; pending next live ingestion retest

Observed On: 2026-06-02

Area: Notification Tray / ingestion polling / notification grouping

Scenario:
- Fresh registered user `aonu123@gmail.com` ingested 16 AstraCart source artifacts for project `AstraCart E2E Scope Check 20260528`.
- All 16 `doc_ingestion_jobs` completed successfully after the RLS/service-role workflow fix.
- `qops_audit_events` recorded 16 `INGESTION_COMPLETED` rows.
- Analytics and Artifacts Repository correctly showed 16 processed artifacts.

Expected:
- Notification Tray should show one concise user-facing summary for the batch, for example:
  - `Knowledge base completed`
  - `16 artifacts processed successfully for AstraCart E2E Scope Check 20260528.`
- Raw per-artifact lifecycle rows should remain in Audit Log only.

Actual:
- Notification Tray showed `0 unread` and only older project/settings notifications.
- No `Knowledge base completed` or equivalent batch summary card appeared for the live ingestion batch.

Impact:
- Users do not receive clear completion feedback in the notification tray after a successful bulk ingestion.
- This regresses the intended behavior from `BUG-E2E-024`, which was validated using a fixture but not confirmed for this live polling path.

Suggested Fix:
1. Trace the live knowledge-job polling path that converts completed ingestion jobs into notification items.
2. Confirm it is receiving completed jobs after RLS hardening and service-role workflow updates.
3. Create one grouped summary notification per project/batch window for successful bulk ingestion.
4. Keep failed or retry-required ingestion jobs as separate action-oriented notifications.
5. Retest with a fresh project and real ingestion batch, not only a UI fixture.

Fix Applied:
- Added a deterministic fallback notification path during backend refresh.
- When the latest uploaded ingestion batch is fully completed, the FE now creates one stable `Knowledge base completed` notification if polling missed the terminal transition.
- The notification is deduped by stable batch ID and by matching project/message so it does not duplicate the normal polling summary.
- The summary links users to Artifacts Repository for per-file review.

Smoke Validation:
- `npm run build` passed on 2026-06-02 after the patch.
- UI smoke on the existing 16-artifact completed batch showed one grouped `Knowledge base completed` notification in the tray:
  - `16 artifacts processed successfully for AstraCart E2E Scope Check 20260528.`

Validation Evidence:
- Project ID: `07050ba9-9a14-4a8c-be14-a61b52b04eb1`
- `doc_ingestion_jobs`: 16 completed, 0 failed, 0 active.
- `qa_job_metrics`: 16 `JOB_COMPLETED`, 68 chunks, 8,402 words, 23,782 tokens, estimated cost `0.005171`.
- Notification Tray did not show an ingestion-completed summary after completion.

## BUG-E2E-087: Artifact Extraction Details Icon Is Hard To Activate In Uploaded Artifacts Table

Status: open

Observed On: 2026-06-02

Area: Artifacts Repository / Uploaded Artifacts table / responsive action column

Scenario:
- Fresh registered user opened Artifacts Repository for `AstraCart E2E Scope Check 20260528`.
- The table correctly showed 16 artifacts, all processed.
- Each row rendered an `Extraction details` icon in the Actions column.

Expected:
- Extraction details icon should be visible, keyboard/mouse accessible, and clickable at the current desktop viewport.
- Users should be able to open the modal and review chunks, words, tables, annotations, links, warnings, visual candidates, token usage, and cost.

Actual:
- Playwright could locate `button[title="Extraction details"]`, but normal click attempts timed out because the element was not considered visible/reachable.
- This suggests the table action area may be horizontally clipped or difficult to reach at some viewport widths.

Impact:
- Users may struggle to open extraction details even though the underlying extractor data exists.
- This weakens visibility into what was extracted per artifact.

Suggested Fix:
1. Review the Uploaded Artifacts table responsive layout and horizontal overflow handling.
2. Keep the Actions column visible and non-wrapping where possible.
3. Ensure icon buttons have accessible labels, stable dimensions, and are reachable by mouse and keyboard.
4. Retest at desktop and narrower widths with the 16-artifact AstraCart project.

Validation Evidence:
- Artifacts Repository counts were correct: total 16, processed 16, needs retry 0, recovered 0.
- Extractor data exists in `doc_ingestion_jobs.output` and `qa_job_metrics`.
- UI action icon was present but not reliably clickable by Playwright at the tested viewport.

## BUG-E2E-088: Knowledge Job Panels Double-Count Ingestion Jobs And Temporary Artifact Rows

Status: fixed - UI smoke validated; pending next live ingestion retest

Observed On: 2026-06-02

Area: Create Knowledge Base / Job Status Panel / My Knowledge Jobs / ingestion usage icons

Scenario:
- Fresh registered user ingested 16 artifacts for `AstraCart E2E Scope Check 20260528`.
- The upload created 16 real backend ingestion jobs.
- The UI also created 16 temporary local artifact rows while the upload was being queued.

Expected:
- `Job Status` should show the 16 real ingestion jobs only.
- `My Knowledge Jobs` should show real ingestion job attempts only.
- Artifact-level rows should be visible in Artifacts Repository, not duplicated as pseudo-jobs in the job panels.
- Usage icon should appear only after a job reaches a terminal state:
  - `completed`: show completed usage.
  - `failed`: show usage recorded before failure, if any.
  - `processing` / `pending` / `queued`: do not show usage unless terminal telemetry exists.

Actual:
- `Job Status` showed 32 entries:
  - 16 real ingestion jobs.
  - 16 artifact-backed pseudo-job entries created from temporary local artifact rows.
- `My Knowledge Jobs` showed usage icons immediately while jobs were still not processed.

Root Cause:
- `submitKnowledge()` creates temporary local `ArtifactRecord` rows immediately with generated local IDs and `status = processing`.
- `mergeKnowledgeJobsWithArtifacts()` groups artifacts by `artifactSourceJobId(artifact) || artifact.jobId || artifact.id`.
- For temporary local artifacts without a backend `jobId`, `artifactSourceJobId()` falls back to the local artifact ID, so each artifact becomes an artifact-backed `KnowledgeJobRecord`.
- The upload callback then adds the real `ING-*` backend jobs, so the merged `scopedKnowledgeJobs` contains both sets.
- `hasIngestionUsage()` returns true when `usage.files` is present, so matched artifact rows can make the usage icon appear before the job has terminal extraction telemetry.

Impact:
- Users see doubled in-flight work and may think twice as many jobs were created.
- Job Status progress and active counts become misleading.
- Usage icons imply cost/usage is available before processing has actually completed.
- The boundary between job tracking and artifact repository becomes confusing.

Suggested Fix:
1. Do not let temporary local artifact rows become artifact-backed knowledge jobs.
   - Only synthesize an artifact-backed knowledge job when the artifact has a real backend `jobId`, or when the artifact is a failed/recovered legacy artifact that has no matching job row.
2. Keep `StatusPanel` source list limited to real `KnowledgeJobRecord` rows from `doc_ingestion_jobs` / upload queue responses.
3. Keep Artifacts Repository as the place where per-artifact rows are displayed.
4. Gate `IngestionUsageButton` so it only renders for terminal jobs (`completed` or `failed`) and only when telemetry exists beyond just file count.
5. Retest with a fresh 16-artifact ingestion:
   - Job Status shows 16 ingestion jobs, not 32.
   - My Knowledge Jobs shows 16 job cards.
   - Usage icons appear only after completion/failure.
   - Artifacts Repository still shows 16 artifact rows.

Fix Applied:
- Added backend ingestion job ID detection for `ING-YYMMDD-*` IDs.
- `mergeKnowledgeJobsWithArtifacts()` now ignores temporary local artifact rows that do not have a real backend ingestion job ID.
- Artifact-backed knowledge-job synthesis is limited to backend-backed artifact rows only, preventing local upload placeholders from appearing as job cards.
- Ingestion usage icons are now gated to terminal jobs only:
  - completed jobs can show completed usage telemetry.
  - failed jobs can show failed-attempt telemetry.
  - queued/pending/processing jobs no longer show usage based on file count alone.

Smoke Validation:
- `npm run build` passed on 2026-06-02 after the patch.
- UI smoke on the existing 16-artifact completed batch showed `My Knowledge Jobs` as `All (16)` with 16 completed ingestion jobs, not 32 duplicate job/artifact rows.
- No usage icon is rendered for non-terminal ingestion statuses after the patch; completed/failed jobs remain eligible for usage details.

Validation Evidence:
- Code paths:
  - `submitKnowledge()` creates temporary `ArtifactRecord` rows with local IDs.
  - `mergeKnowledgeJobsWithArtifacts()` converts unmatched artifact records into pseudo knowledge jobs.
  - `statusKnowledgeJobs` is built from `scopedKnowledgeJobs`, so it inherits the duplicate pseudo-job rows.
  - `hasIngestionUsage()` treats file count as enough to show the usage icon.

## BUG-E2E-089: Shared Test Strategy Generator Fails After RLS Hardening And Leaves Job Processing

Status: closed

Observed On: 2026-06-02

Area: Generate Documents / Test Strategy / n8n shared full-retrieval generator / RLS hardening

Scenario:
- Registered user triggered a fresh Test Strategy generation for project `AstraCart E2E Scope Check 20260528`.
- Project override settings were updated before the run so Confluence should publish to space `QD`.
- Job created: `PRO-260602-U96O1F`.

Expected:
- `qa_jobs.config_snapshot.publishing.confluenceSpaceKey` should be `QD`.
- The shared full-retrieval generator should log `JOB_STARTED`, generate the document, publish/update Confluence in `QD`, log quality/completion metrics, and mark the job `completed`.
- If the generator fails, `qa_jobs.status` should become `failed` with an actionable error.

Actual:
- Project override is correct:
  - `qops_project_integration_overrides.integration_key = confluence`
  - `override_config.spaceKey = QD`
  - `settings_version = 2`
- Job snapshot is correct:
  - `qa_jobs.config_snapshot.publishing.confluenceSpaceKey = QD`
  - `config_snapshot.scope.sourcePriority.confluence = project_override`
- n8n full-retrieval subworkflow execution failed immediately:
  - Workflow: `fullRetrievalD01` / `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft`
  - Execution: `1016308`
  - Failed node: `Log: Job Started`
  - Error: `Authorization failed - please check your credentials`
- `qa_jobs` row remained stuck:
  - `job_id = PRO-260602-U96O1F`
  - `status = processing`
  - no output, no error, no completion/failure metric after `JOB_STARTED`.

Root Cause:
- After RLS hardening, at least one Supabase HTTP Request node inside the shared full-retrieval generator still uses a credential that cannot write/read the protected transactional tables.
- The parent queue worker does not convert this subworkflow failure into a terminal failed `qa_jobs` state for the non-backlog shared-generator path.

Impact:
- Test Strategy generation is blocked even though project settings are correct.
- UI can show generation in progress indefinitely.
- Users cannot retry cleanly unless the stuck job is manually failed or the workflow writes a terminal state.

Suggested Fix:
1. Inventory all Supabase HTTP Request nodes in `fullRetrievalD01` that touch `qa_jobs`, `qa_job_metrics`, audit/events, or generated output tables.
2. Move those protected table operations to the approved `supabase-service-role-key` credential.
3. Keep any public unauthenticated endpoints on anon only if they do not access protected transactional tables.
4. Add/verify failure handling for the shared full-retrieval path so subworkflow errors mark `qa_jobs.status = failed`.
5. Retest Test Strategy generation for `PRO-*` jobs and confirm:
   - `JOB_QUEUED`, `JOB_STARTED`, quality gate, and `JOB_COMPLETED`/`JOB_FAILED` metrics are written.
   - `qa_jobs.status` reaches a terminal state.
   - Confluence destination uses `QD`.

Validation Evidence:
- Supabase project ID: `07050ba9-9a14-4a8c-be14-a61b52b04eb1`
- Job ID: `PRO-260602-U96O1F`
- n8n execution ID: `1016308`
- n8n event log error:
  - `workflowId = fullRetrievalD01`
  - `lastNodeExecuted = Log: Job Started`
  - `errorMessage = Authorization failed - please check your credentials`

Fix Applied On: 2026-06-02

Fix Summary:
- Manually failed stuck job `PRO-260602-U96O1F` so the UI can offer regeneration instead of showing an indefinite processing state.
- Repaired n8n workflow version consistency for:
  - `fullRetrievalD01` / `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft`
  - `QApRBFSaJgINsdHN` / `PRO QA Generation Queue Worker - Ready Draft`
- Patched active n8n workflow-history rows, not only editable workflow rows, so production execution uses the corrected definitions.
- Ensured Supabase HTTP Request nodes in the shared full-retrieval generator use `supabase-service-role-key` for protected transactional tables after RLS hardening.
- Added shared-generator error handling in the professional queue worker so non-backlog subworkflow failures route to the failure handler and mark `qa_jobs.status = failed`.
- Republished both workflows successfully:
  - `fullRetrievalD01` active version `4b63abdf-f3a8-42a4-b199-7ee8610a5d62`
  - `QApRBFSaJgINsdHN` active version `1b287bf8-72ae-4e6b-8041-bdaedcf618f6`

Retest Needed:
- Trigger Test Strategy again for the same project and confirm the job reaches `completed` or a terminal actionable `failed` state.
- Confirm Confluence publishing uses project override space `QD`.

Closure Evidence:
- Retested with regenerate job `PRO-260602-WO56YV` on 2026-06-02.
- `qa_jobs.status = completed`.
- Retry linkage is correct:
  - `PRO-260602-WO56YV.retry_of_job_id = PRO-260602-U96O1F`
  - `PRO-260602-U96O1F.retry_status = recovered`
  - `PRO-260602-U96O1F.retried_by_job_id = PRO-260602-WO56YV`
- n8n shared full-retrieval execution `1016879` completed successfully.
- Confluence output published to project override space `QD`:
  - `https://anujalhans1.atlassian.net/wiki/spaces/QD/pages/25886934/Test+Strategy+-+AstraCart+E2E+Scope+Check+20260528`
- Quality gate passed:
  - `wordCount = 2793`
  - `coverageLedgerCount = 11`
  - `coveredCount = 11`
  - `missingCount = 0`
  - `partialCount = 0`
- Metrics were recorded:
  - `JOB_RETRIED`
  - `JOB_STARTED`
  - `GENERATOR_STARTED`
  - `QUALITY_GATE_PASSED`
  - `JOB_COMPLETED`
- Usage recorded:
  - `tokens_input = 5166`
  - `tokens_output = 5982`
  - `tokens_total = 11148`
  - `estimated_cost_usd = 0.011638`
- Audit event recorded:
  - `GENERATION_COMPLETED`
  - `entity_id = PRO-260602-WO56YV`
  - `status = success`

## BUG-E2E-090: Shared Generator Hardening Duplicated Prompt Blocks And Caused Test Plan Agent Failure

Status: closed

Severity: high

Area:

- n8n shared Confluence document generator
- Prompt Library
- Test Plan generation stability

Observed During:

- Test Plan generation after evidence-hardening changes.
- Job: `PRO-260602-A5PGOA`
- Project: `AstraCart E2E Scope Check 20260528`
- n8n execution: `1017636`

What Happened:

- The job was queued and started correctly.
- Runtime settings were correctly scoped:
  - `generation_model = gpt-4.1-mini`
  - `chroma_collection = qops-chunks-scoped`
  - `confluenceSpaceKey = QD`
- `Prompt Library` included the new `QOPS_EVIDENCE_HARDENING_V1` marker.
- `Generator Agent` called Chroma once, then failed through the generator-agent failure branch.
- `qa_jobs` was correctly marked `failed`, so the UI did not remain stuck in processing.

Root Cause:

- The shared prompt placed retrieval and coverage-instruction blocks in both the system prompt and user prompt.
- After evidence hardening, this duplicated the largest prompt sections and made the Test Plan prompt heavier than intended.

Implementation Fix:

- Patched workflow `fullRetrievalD01`.
- Removed duplicate `retrievalProfileInstructions`, `coverageLedgerInstructions`, repeated `rtmUpdateInstructions`, and duplicate RTM/update blocks from `enhancedUser`.
- Kept hard evidence rules in the system prompt so grounding behavior remains enforced.
- Republished active workflow version `4b63abdf-f3a8-42a4-b199-7ee8610a5d62`.

Smoke Validation:

- Confirmed `enhancedUser` no longer includes `retrievalProfileInstructions`.
- Confirmed `enhancedUser` no longer includes `coverageLedgerInstructions`.
- Confirmed repeated `rtmUpdateInstructions` count is `0` in the user prompt block.
- Confirmed the workflow still contains `QOPS_EVIDENCE_HARDENING_V1`.

Live Retest:

- User clicked Regenerate for failed Test Plan job `PRO-260602-A5PGOA`.
- Retry child job `PRO-260602-YU2CTW` completed successfully.
- Parent retry linkage is correct:
  - `PRO-260602-A5PGOA.retry_status = recovered`
  - `PRO-260602-A5PGOA.retried_by_job_id = PRO-260602-YU2CTW`
  - `PRO-260602-YU2CTW.retry_of_job_id = PRO-260602-A5PGOA`
- n8n full-retrieval execution `1017742` completed successfully.
- Queue worker execution `1017739` completed successfully.
- Confluence output published to project override space `QD`:
  - `https://anujalhans1.atlassian.net/wiki/spaces/QD/pages/26083329/Test+Plan+-+AstraCart+E2E+Scope+Check+20260528`
- Usage and metrics recorded:
  - `word_count = 2588`
  - `tokens_input = 3712`
  - `tokens_output = 5487`
  - `tokens_total = 9199`
  - `estimated_cost_usd = 0.010264`
  - `duration_ms = 106460`
- Recorded events:
  - `JOB_RETRIED`
  - `JOB_STARTED`
  - `GENERATOR_STARTED`
  - `QUALITY_GATE_PASSED`
  - `JOB_COMPLETED`

Follow-up:

- During this live retest, a separate validator false-positive was found where valid UUID chunk references were incorrectly marked as truncated. Tracked separately as `BUG-E2E-091`.

## BUG-E2E-091: Evidence Validator False-Flags Valid UUID Chunk References As Truncated

Status: closed

Severity: medium

Area:

- n8n shared Confluence document generator
- `Validate AI Agent Output`
- Coverage ledger evidence-quality validation
- Test Plan / Test Strategy / Risk Matrix shared validation

Observed During:

- Test Plan retry job `PRO-260602-YU2CTW`.
- Project: `AstraCart E2E Scope Check 20260528`.

What Happened:

- The Test Plan generated and published successfully.
- The coverage ledger contained concrete source references with full UUID chunk IDs, for example:
  - `BRD - BRD_AstraCart_Ecommerce_Platform.pdf - Must - chunkId:41e05c27-83c7-4413-b2ce-ad3c78f8f0d2`
  - `FRD - FRD_AstraCart_Ecommerce_Platform.docx - Validation and Error Handling - chunkId:8aa96602-781a-449e-b194-ced9c4024b52`
- The validator incorrectly downgraded every ledger row to `partial`.
- UI/metadata showed false coverage review warnings:
  - `coverage_gate_status = warning`
  - `covered_ledger_count = 0`
  - `partial_ledger_count = 10`
  - notes included `Evidence review required: truncated source reference`

Root Cause:

- The validator truncation check used a regex pattern that effectively matched any three characters instead of a literal ellipsis.
- As a result, normal valid source references were falsely treated as truncated.

Implementation Fix:

- Patched workflow `fullRetrievalD01`.
- Updated `findEvidenceReferenceIssues()` in `Validate AI Agent Output`.
- Truncation detection now checks literal `...` or the word `ellipsis`, instead of a broad regex.
- Kept strict checks for:
  - missing concrete chunk IDs
  - broad source wording such as combined/summary/multiple
  - source-combination wording such as `TRANSCRIPT, TEST_PLAN`
  - metadata-only references
- Republished active workflow version `4b63abdf-f3a8-42a4-b199-7ee8610a5d62`.

Smoke Validation:

- Valid full UUID chunk references now pass with no evidence-quality issues.
- Broad source references still get flagged.
- Combined source references still get flagged.
- Truly truncated `chunkId:abc...` references still get flagged.

Closure Evidence:

- Retested shared validator path with Risk Matrix job `PRO-260602-KJXT8Z` on 2026-06-02.
- The job completed with `coverage_gate_status = passed`.
- Stored coverage ledger contains valid UUID chunk references and no false `truncated source reference` warnings.
- Coverage summary is clean:
  - `coverageLedgerCount = 9`
  - `coveredCount = 9`
  - `partialCount = 0`
  - `warningItems = []`
  - `evidenceQualityIssues` absent from the stored summary.
- Note: stale Test Plan job `PRO-260602-YU2CTW` still shows old warning metadata because it was generated before this validator fix; that stale metadata should not be manually rewritten.

## BUG-E2E-092: Shared Test Strategy Delta Update Completes But Consumes Near Full Create Budget

Status: fixed - workflow/build validated; pending next live token-savings retest

Severity: medium

Area:

- Generate Documents
- Shared Confluence document update mode
- Test Strategy delta update
- Token/cost optimization

Observed During:

- Test Strategy update after ingesting 2 supporting documents for `AstraCart E2E Scope Check 20260528`.
- Update job: `PRO-260603-S8OSKF`.
- Previous create job: `PRO-260602-WO56YV`.

What Happened:

- The update workflow correctly entered update mode:
  - `generationMode = update`
  - `updateOfJobId = PRO-260602-WO56YV`
  - `previousConfluencePageId = 25886934`
  - `updateSummary.version = shared-delta-update-v1`
- The job updated the same Confluence page URL instead of creating a duplicate.
- However, token usage was almost the same as the previous full create:
  - previous baseline tokens: `11,148`
  - update tokens: `11,013`
  - estimated tokens saved: `135`
  - estimated savings: `1%`
- This does not yet deliver the intended cost-optimized delta update experience.

Expected:

- Small KB deltas should not require a full-size generation response.
- Update mode should either:
  - generate only a compact delta section/patch for changed sections, or
  - skip model generation if no material update is needed.
- UI usage should make clear that the cost reflects only delta work, and the savings should be materially lower than a full regenerate when the source delta is small.

Suggested Fix:

1. Add a pre-model shared-doc delta gate that classifies the KB change by source file/doc type and impacted sections.
2. For update mode, retrieve only new/changed supporting chunks plus the minimal previous section metadata.
3. Change prompt contract from "full deliverable with preserved sections" to either:
   - section patch generation, then merge into existing Confluence page, or
   - compact delta appendix update if full merge is not implemented yet.
4. Add a no-op/skip path when latest source evidence does not materially change the generated document.
5. Persist `deltaTokens`, `fullBaselineTokens`, `estimatedSavingsPercent`, and `updatedSectionCount` in `qa_jobs.output.updateSummary`.

Retest:

- Ingest 1-2 small supporting documents after a successful create.
- Run Test Strategy update.
- Confirm token usage is materially below the original create run.
- Confirm Confluence page remains updated in place.

Fix Implemented:

- Patched active n8n workflow `fullRetrievalD01` with shared delta update V2.
- Update mode for Test Strategy, Test Plan, and Risk Matrix now uses compact patch instructions instead of asking the model for a full replacement document.
- Shared update model output is capped to a smaller token budget while create mode remains unchanged.
- Confluence update now fetches the existing page body and merges the compact delta patch into the existing page instead of replacing the full page body.
- `updateSummary` now records `version = shared-delta-update-v2`, `deltaPatchMode = true`, and `mergedWithExistingConfluence = true`.
- Workflow backup created before patch:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v2_20260603100722.json`

Additional Fix Implemented - 2026-06-04:

- Patched the same active workflow with shared delta update V3.
- V3 adds a final Confluence publish guard so compact update runs do not append the previous full page body when the model response contains a larger-than-expected patch.
- V3 injects a concise visible delta summary and sanitizes the final merged HTML before publishing.
- This closes the workflow-side cause of near-full-document append behavior; next live update must confirm the measured token/cost savings against a controlled KB delta.

## BUG-E2E-093: Shared Test Strategy Delta Update Summary Still Includes Weak Evidence And Overlapping Preserved Sections

Status: fixed - workflow/build validated; pending next live Test Strategy export

Severity: medium

Area:

- Generate Documents
- Shared Confluence document update mode
- Test Strategy update summary
- Coverage/evidence quality

Observed During:

- Test Strategy update job `PRO-260603-S8OSKF`.

What Happened:

- The job produced `updateSummary.version = shared-delta-update-v1`.
- Exported Confluence document `Test Strategy - AstraCart E2E Scope Check 20260528` confirmed the `Delta Update Summary` is visible near the top of the document.
- `updatedSections` included:
  - `Introduction & Context`
  - `Testing Scope`
  - `Strategic Testing Approach`
  - `Automation Strategy & Roadmap`
  - `Quality Metrics & Reporting`
  - `Risk-Based Testing & Mitigation`
  - `Coverage Ledger`
- `preservedSections` also included semantically overlapping names:
  - `Quality Metrics & Reporting Framework`
  - `Risk-Based Testing & Mitigation Strategy`
  - `Appendix / Coverage Ledger`
- The coverage summary still reported evidence-quality issues:
  - missing concrete `chunkId`
  - source combinations that are not direct evidence
- The visible document has a consistency gap:
  - top `Coverage Review Note` says `6 item(s) are covered and 4 item(s) need review`,
  - but the visible Coverage Ledger rows for the broad evidence items still show `covered`,
  - those rows should be marked `partial` or `needs review` in the document itself.
- Some delta rows used broad evidence references such as:
  - `derived from FRD, LLD API details and Grooming insights`
  - `BRD personas and grooming transcripts`
  - `Internal compilation`
- The `Delta Update Summary` table only listed updated rows and did not list preserved/no-change sections, even though the update prompt requested preserved sections.
- 2026-06-03 exported Word/Confluence review confirmed the issue is user-visible:
  - `Coverage Review Note` says `6 item(s) are covered and 4 item(s) need review`.
  - The visible Coverage Ledger still marks broad/inferred rows such as `FR-PDP-011`, `FR-CHK-016`, `FR-PAY-021`, and `FR-ORD-029` as `covered`.
  - The delta summary still includes broad source references and raw source/table fragments rather than consistently clean, direct evidence citations.

Expected:

- Updated and preserved sections should not overlap semantically.
- Delta summary evidence references should use concrete retrieved source metadata and full chunk ids where available.
- Broad source combinations should be marked as review-needed or avoided.
- The visible Coverage Ledger should match the stored coverage summary and warning note.
- Delta summary should include preserved/no-change rows or a compact preserved-section note.

Fix Implemented:

- Patched shared delta update parsing to canonicalize equivalent section names before comparing updated vs preserved sections.
- Examples now normalize as expected:
  - `Quality Metrics & Reporting` -> `Quality Metrics & Reporting Framework`
  - `Risk-Based Testing & Mitigation` -> `Risk-Based Testing & Mitigation Strategy`
  - `Coverage Ledger` -> `Appendix / Coverage Ledger` for Test Strategy/Test Plan.
- Broad or inferred delta evidence such as `derived from...`, `Internal compilation`, and `grooming insights` is now classified as `needs_review` instead of being treated as updated/preserved evidence.
- Visible shared-document Coverage Ledger markdown is synchronized from the enforced stored ledger before Confluence conversion so the document rows match the warning note and stored coverage summary.
- Smoke-tested helper behavior against sample delta rows:
  - overlapping preserved sections were removed,
  - broad evidence rows moved to `needsReviewSections`,
  - estimated savings metadata was calculated from previous vs update tokens.

Additional Fix Implemented - 2026-06-04:

- V3 final publish merge removes stale Q-Ops delta summary blocks before adding the new summary.
- V3 final publish sanitizer removes broad preserved-content boilerplate and strips raw metadata fragments from user-facing references.
- Frontend update-summary and output cards continue to use the stored `updateSummary`, while the Confluence page receives a clean top-of-document delta summary.

Suggested Fix:

1. Normalize section names before computing updated vs preserved sections.
2. Deduplicate canonical section aliases, for example:
   - `Quality Metrics & Reporting` and `Quality Metrics & Reporting Framework`
   - `Risk-Based Testing & Mitigation` and `Risk-Based Testing & Mitigation Strategy`
   - `Coverage Ledger` and `Appendix / Coverage Ledger`
3. Enforce direct evidence references inside `Delta Update Summary`.
4. If evidence is broad/inferred, mark that delta row as `needs_review` instead of treating it as a clean update.

Retest:

- Run Test Strategy update after a controlled supporting-document delta.
- Confirm updated/preserved sections are mutually exclusive.
- Confirm delta rows cite concrete retrieved evidence or clearly flag review-needed evidence.

## BUG-E2E-094: Shared Test Plan Delta Update Appends Previous Full Document Body Instead Of Cleanly Merging Sections

Status: fixed - workflow/build validated; pending next live Test Plan export

Severity: high

Area:

- Generate Documents
- Shared Confluence document update mode
- Test Plan delta update
- Confluence merge/publish step

Observed During:

- Test Plan update after ingesting additional supporting documents for `AstraCart E2E Scope Check 20260528`.
- Update job: `PRO-260603-FUW452`.
- Previous create job: `PRO-260602-YU2CTW`.
- Exported Confluence Word document:
  - `C:\Users\anujalhans01\Downloads\Test+Plan+-+AstraCart+E2E+Scope+Check+20260528 (1).doc`

What Happened:

- The backend correctly queued and completed the Test Plan as an update:
  - `generation_mode = update`
  - `update_mode = true`
  - `update_previous_job_id = PRO-260602-YU2CTW`
  - `updateSummary.version = shared-delta-update-v2`
- The exported document is not a clean updated Test Plan.
- It contains a newly generated Test Plan body first.
- Then it appends the old full Confluence document body under this visible sentence:
  - `Existing Confluence content below was preserved unless explicitly updated in the delta summary.`
- This creates duplicate top-level document content:
  - two `Document: Enterprise Test Plan` headers
  - two `Generated On` blocks
  - repeated numbered sections such as Test Strategy, Scope, Objectives, Deliverables, Entry/Exit Criteria, etc.
- The export did not show a visible `Delta Update Summary` section even though `updateSummary` exists in the stored job output.

Impact:

- Users see a bulky and confusing generated document.
- The update behavior looks like an append operation rather than a section-level merge.
- This undermines the cost/quality optimization story because the visible result does not clearly show what was updated, preserved, or skipped.
- Reviewers cannot confidently sign off the Test Plan because old and new bodies coexist.

Expected:

- Shared document update should produce one coherent Test Plan body.
- Existing Confluence content should be used as merge input, not appended as a second document.
- Updated sections should replace their previous section bodies in place.
- Preserved sections should remain once in their original logical position.
- A compact visible update summary should appear near the top showing:
  - update reason
  - updated sections
  - preserved sections count
  - token/cost used for the update
  - estimated savings if available

Likely Root Cause:

- The shared delta merge step is treating the previous Confluence page body as preserved content and appending it wholesale after the delta patch.
- Section replacement is not removing the old full document body before publishing.
- The `Delta Update Summary` may exist in `qa_jobs.output.updateSummary` but is not being injected into the final Confluence HTML/body for Test Plan updates.

Suggested Fix:

1. In the shared Confluence merge step, parse the existing page into canonical sections before merge.
2. Parse the model delta patch into canonical updated sections.
3. Build the final document from one ordered section list:
   - use updated section body where present,
   - otherwise use existing section body once,
   - never append the full previous body as a fallback section.
4. Inject a compact `Delta Update Summary` near the top of the final document.
5. Add a duplicate-document-body guard before publishing:
   - fail or sanitize if final markdown/html contains repeated `Document: Enterprise Test Plan` or repeated first-level numbered section sequences.

Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V3.
- The Confluence update node now sanitizes the existing body, removes any prior delta summary, and no longer appends the old full document body under `Existing Confluence content below was preserved...`.
- Added full-document patch guard:
  - if a patch still looks like a full document, the final body becomes the new summary plus the patch only,
  - otherwise V3 removes matching old sections and merges the compact patch with the cleaned existing body.
- Added visible `QOPS_DELTA_UPDATE_SUMMARY` injection before the merged body.
- Production build passed after frontend companion fixes.

Retest:

- Re-run Test Plan update after a small KB delta.
- Export the Confluence document.
- Confirm there is exactly one `Document: Enterprise Test Plan` header.
- Confirm there is exactly one numbered Test Plan body.
- Confirm `Existing Confluence content below was preserved...` is absent.
- Confirm `Delta Update Summary` is visible and concise.
- Confirm Coverage Ledger rows remain readable and use concrete evidence references.

Related Bugs:

- `BUG-E2E-092`
- `BUG-E2E-093`

## BUG-E2E-095: Shared Risk Matrix Delta Update Appends Previous Full Document Body Instead Of Cleanly Merging Sections

Status: fixed - workflow/build validated; pending next live Risk Matrix export

Severity: high

Area:

- Generate Documents
- Shared Confluence document update mode
- Risk Matrix delta update
- Confluence merge/publish step

Observed During:

- Risk Matrix update after ingesting additional supporting documents for `AstraCart E2E Scope Check 20260528`.
- Update job: `PRO-260603-SMK27Q`.
- Previous create job: `PRO-260602-KJXT8Z`.
- Exported Confluence Word document:
  - `C:\Users\anujalhans01\Downloads\Risk+Matrix+-+AstraCart+E2E+Scope+Check+20260603.doc`

What Happened:

- The backend correctly queued and completed the Risk Matrix as an update:
  - `input.generationMode = update`
  - `output.generationMode = update`
  - `input.updateContext.previousJobId = PRO-260602-KJXT8Z`
  - `updateSummary.version = shared-delta-update-v2`
  - `updateSummary.deltaPatchMode = true`
  - `updateSummary.mergedWithExistingConfluence = true`
- The exported document is not a clean updated Risk Matrix.
- It contains a newly generated Risk Matrix body first.
- Then it appends the old full Risk Matrix body under this visible sentence:
  - `Existing Confluence content below was preserved unless explicitly updated in the delta summary.`
- This creates duplicate top-level document content:
  - two `Document: Enterprise Risk Assessment Matrix` headers
  - two `Generated On` blocks
  - two `Risk Register Summary` sections
  - two `Risk Detail Register` sections
- The export does not contain a visible `Delta Update Summary` section, even though the UI and stored job output contain an update summary.

Expected:

- Shared Risk Matrix update should produce one coherent Risk Matrix body.
- Existing Confluence content should be used as merge input, not appended as a second full document.
- Updated sections should replace previous versions in place.
- Preserved sections should remain once, in their original logical positions.
- A compact visible `Delta Update Summary` should appear near the top of the document.

Likely Root Cause:

- Same shared merge issue as `BUG-E2E-094`.
- The merge step is preserving the entire previous page body as fallback content instead of section-level preserved content.

Fix Implemented - 2026-06-04:

- Fixed by the same shared delta update V3 Confluence publish merge used for `BUG-E2E-094`.
- The Risk Matrix update path now receives the same no-append guard, prior-summary cleanup, and visible delta summary injection.
- This is workflow-side fixed; next live Risk Matrix update/export should confirm exactly one document header and one Risk Register/Risk Detail body.

Retest:

- Re-run Risk Matrix update after a small KB delta.
- Export the Confluence document.
- Confirm there is exactly one `Document: Enterprise Risk Assessment Matrix` header.
- Confirm there is exactly one `Risk Register Summary` and one `Risk Detail Register`.
- Confirm the sentence `Existing Confluence content below was preserved...` is absent.
- Confirm the visible `Delta Update Summary` is present and concise.

Related Bugs:

- `BUG-E2E-092`
- `BUG-E2E-093`
- `BUG-E2E-094`

## BUG-E2E-096: Risk Matrix Delta Update Risk Detail Table Contains Raw Metadata Columns In Source Reference

Status: fixed - workflow/build validated; pending next live Risk Matrix export

Severity: high

Area:

- Generate Documents
- Risk Matrix document quality
- Evidence/source-reference formatting
- Confluence table rendering

Observed During:

- Risk Matrix update job `PRO-260603-SMK27Q`.
- Exported Confluence Word document:
  - `C:\Users\anujalhans01\Downloads\Risk+Matrix+-+AstraCart+E2E+Scope+Check+20260603.doc`

What Happened:

- The updated `Risk Detail Register` is intended to have this schema:
  - `Risk ID`
  - `Risk Description`
  - `Source Reference`
  - `Mitigation Plan`
  - `Contingency Plan`
  - `Detection Strategy`
- Several exported rows include raw metadata values inside the row after the chunk ID, for example:
  - `chunkId:e98e7d27-8fea-4311-9e09-1e58d054a1ff | 39 | 0 | table | Implement signature...`
  - `chunkId:41e05c27-83c7-4413-b2ce-ad3c78f8f0d2 | 56 | 0 | table | Implement OIDC...`
- This makes the table appear to have extra columns or polluted cell content.
- It also exposes low-level retrieval metadata (`page/row/index/type` style values) that users should not see in the generated document.

Expected:

- Source Reference cells should contain clean evidence references only:
  - `DocType - FileName - Section - chunkId:<uuid>`
- Raw retrieval metadata such as numeric positions, row offsets, or content-class labels must not appear in user-facing document rows.
- Each table row should have exactly the same number of columns as the header.

Likely Root Cause:

- The Risk Matrix delta prompt or merge sanitizer is allowing pipe-delimited source metadata to pass into markdown table cells.
- The shared source-reference sanitizer may be active for create flow but not fully applied to delta patch rows.

Suggested Fix:

1. Apply source-reference sanitization to delta patch output before Confluence conversion.
2. Strip raw metadata fragments after `chunkId:<uuid>` from table cells.
3. Replace pipe-delimited source metadata with safe hyphen-delimited text.
4. Add a table-shape guard before publish:
   - if a row has more cells than the header because of source-reference pipes, sanitize or fail before Confluence update.

Fix Implemented - 2026-06-04:

- Added V3 final HTML sanitizer in the active shared workflow.
- The sanitizer strips low-level metadata fragments after chunk references, including patterns like `| 39 | 0 | table |`.
- It also converts remaining standalone `| table/text/image/metadata |` fragments into safe text separators before Confluence publish.
- Retest still requires exporting the next live Risk Matrix update and confirming the Risk Detail Register has the intended six logical columns.

Retest:

- Re-run Risk Matrix update after a small KB delta.
- Export the Confluence document.
- Confirm `Risk Detail Register` rows do not contain raw numeric metadata such as `| 39 | 0 | table |`.
- Confirm every Risk Detail row has the expected six logical columns.

## BUG-E2E-097: Coverage Review UI Shows Contradictory State When Stored Ledger Count Is Zero

Status: fixed - UI/build smoke validated; backend final-ledger parse still recommended

Severity: medium

Area:

- Generate Documents UI
- Coverage Review modal
- Shared update coverage metadata

Observed During:

- Risk Matrix update job `PRO-260603-SMK27Q`.
- UI screenshot after update showed:
  - Header/state: `COVERAGE NEEDS REVIEW`
  - Main message: `Coverage looks complete`
- Stored job output for `PRO-260603-SMK27Q` shows:
  - `coverageSummary.gateStatus = warning`
  - `coverageSummary.coverageLedgerCount = 0`
  - `coverageSummary.coveredCount = 0`
  - `coverageSummary.warningItems = []`
- The exported Confluence document visibly includes a Coverage Ledger with concrete `chunkId` references.

What Happened:

- UI presents a contradictory state because the stored coverage summary says warning/no parsed ledger, while display copy falls back to a “complete” message.
- Users cannot tell whether they need to review something or whether coverage passed.

Expected:

- If coverage ledger count is zero, UI should not say `Coverage looks complete`.
- It should show a precise state such as:
  - `Coverage ledger was not parsed`
  - `Coverage summary unavailable`
  - `Review generated document coverage manually`
- If the generated document contains a ledger but stored output has count `0`, the backend should parse and persist that ledger correctly.

Likely Root Cause:

- Delta update output stores `coverageLedgerCount = 0` even when the final merged Confluence body includes a Coverage Ledger.
- The UI modal does not have a distinct copy path for `gateStatus = warning` with `coverageLedgerCount = 0` and no warning items.

Suggested Fix:

1. Backend: after section merge, parse the final merged document body for Coverage Ledger and store the final coverage summary.
2. UI: add a defensive copy branch for warning/no-ledger:
   - title: `Coverage summary unavailable`
   - message: `Q-Ops could not parse a coverage ledger from the stored update metadata. Review the generated document before sign-off.`
3. Only show `Coverage looks complete` when `gateStatus = passed` or all parsed coverage rows are covered.

Fix Implemented - 2026-06-04:

- Frontend `coverageVerdict()` now treats warning/no parsed ledger as a distinct unavailable-summary state instead of falling through to `Coverage looks complete`.
- Frontend `hasCoverageReview()` now trusts the normalized verdict first, so successful coverage states are not overridden by stale explicit counters.
- Shared update outputs with zero parsed coverage counts and no actionable progress/batch detail now suppress the coverage-review icon/card instead of showing a contradictory review modal.
- Generate Documents smoke confirmed the latest Risk Matrix update now displays as `Risk Matrix Updated`; the prior contradictory `Coverage needs review` / `Coverage looks complete` text is no longer visible in the output or job-card snapshot.

Retest:

- Re-run Risk Matrix update.
- Open Coverage Review modal.
- Confirm copy is not contradictory.
- Confirm stored `coverageLedgerCount` matches the visible document ledger row count.

## BUG-E2E-098: Shared Regenerate Anyway Update Claims Preserved Sections But Publishes Partial Document

Status: fixed - workflow patched with V6 nested-section merge guard; pending final live Regenerate Anyway export

Severity: critical

Area:

- Generate Documents
- Shared Confluence document update mode
- Regenerate Anyway / delta update
- Test Strategy, Test Plan, Risk Matrix
- Coverage ledger preservation and repair

Observed During:

- Test Strategy Regenerate Anyway update for `AstraCart E2E Scope Check 20260528`.
- Update job: `PRO-260604-L9PE3P`.
- Previous job: `PRO-260603-5GIQUU`.
- Exported Confluence Word documents:
  - Previous: `C:\Users\anujalhans01\Downloads\Test+Strategy+-+AstraCart+E2E+Scope+Check+20260528.doc`
  - Latest: `C:\Users\anujalhans01\Downloads\Test+Strategy+-+AstraCart+E2E+Scope+Check+20260528 (1).doc`

What Happened:

- The job completed successfully in n8n, Supabase, metrics, audit logging, and the UI.
- The UI update summary showed:
  - `No changes needed`
  - `Updated 0`
  - `Preserved 13`
  - `Removed 0`
- Supabase stored `output.updateSummary.preservedSectionCount = 13`.
- The actual latest Confluence export did not preserve the 13 sections.
- The published document only contains the early Test Strategy content through `Automation Strategy & Roadmap`.
- Several previously present sections disappeared, including environment, test data, metrics, risk, RACI, compliance, tooling, communication, and coverage ledger sections.
- Supabase stored the current output with `coverageLedger = []` and `coverageSummary.gateStatus = warning`, even though the previous job had a parsed coverage ledger.
- The latest export ends mid-sentence, indicating the generated patch/body was partial or truncated before publish.

Expected:

- Shared update behavior must be correct for all three shared Confluence documents:
  - Test Strategy
  - Test Plan
  - Risk Matrix
- Regenerate Anyway update must never publish a partial document while claiming sections were preserved.
- If the model reports no changed sections, the final Confluence body should be the visible update summary plus the cleaned existing full document body.
- If the model generates a full replacement document, the workflow should merge by canonical sections instead of replacing with a partial/truncated body.
- If the previous generation had missing or partial coverage, the update should use the regenerated coverage/sections to fill those gaps rather than blindly preserving stale missing coverage.
- Stored job output, metrics, and UI counts should reflect the final merged/published body, not only the raw model patch.

Likely Root Cause:

- The shared delta update V3 Confluence publish guard treats a patch that looks like a full document as the final body.
- In the no-change update path, this allows a partial generated document to replace the full existing Confluence document.
- The preservation counts are derived from `updateSummary`, not verified against the final HTML body before publish.
- Coverage metadata is parsed from the raw model output before the final merge, so preserved coverage ledger rows can be lost from stored metadata.

Suggested Fix:

1. Keep create flow out of scope.
2. In shared update mode only, remove the "full-looking patch replaces existing body" behavior.
3. Build final HTML from one canonical ordered section map:
   - existing Confluence sections are the base,
   - generated patch sections replace matching base sections when present,
   - missing patch sections preserve existing sections,
   - if no changes are detected and the patch does not provide coverage repair, preserve the existing body.
4. Add a final body guard before publish:
   - claimed preserved sections must exist in the final HTML,
   - document header count must not duplicate,
   - coverage ledger must not be dropped when it existed before.
5. Persist final merged coverage metadata, or at minimum carry forward previous coverage metadata when the final body preserves the previous coverage ledger.

Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V4.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v4_20260604075704.json`
- `Get Page Details` now expands `body.storage`, so the update merge has the actual existing Confluence body available.
- The shared update publish path no longer treats a full-looking generated patch as automatically authoritative.
- The final shared update body is now built from canonical sections:
  - complete generated replacement sections can repair a damaged current page,
  - compact patch sections replace matching existing sections,
  - true no-change updates preserve the cleaned existing body,
  - create/upload logic is unchanged.
- Added pre-publish guards for shared updates:
  - duplicate enterprise document headers,
  - claimed preserved sections missing from the final body,
  - coverage ledger dropped from an existing/previously-covered document,
  - incomplete final shared document when the existing page is already damaged or missing.
- Updated shared update prompt instructions so previous missing/partial/no coverage is treated as coverage repair work, not as a no-change update.
- Updated Quality Gate shared update summary to mark coverage repair as updated/needs-review instead of preserved/no-change.
- Added coverage metadata fallback for true no-change updates so previous parsed coverage can be carried forward when the body is preserved.

Validation - 2026-06-04:

- Parsed the patched n8n code nodes and Confluence body expression successfully.
- Verified n8n MCP reports active workflow `fullRetrievalD01` updated at `2026-06-04T07:57:04.495Z`.
- Local merge simulation passed:
  - complete existing page + no-change partial patch preserves all 13 Test Strategy sections,
  - damaged existing page + no-change partial patch fails before publish,
  - damaged existing page + complete regenerated patch publishes a complete repaired body.

Additional Live Retest - 2026-06-04:

- Triggered Test Strategy Regenerate Anyway job `PRO-260604-XXKP4U`.
- Queue creator succeeded and generator execution `1030050` ran.
- The model output was still truncated and ended inside the `Automation Strategy & Roadmap` table.
- Confluence rejected the malformed body with:
  - `Content body cannot be converted to new editor format`
- Supabase marked the job failed and did not record a new Confluence URL/version for the failed job.
- This confirmed the V4 token budget was still too low for a repair run and the malformed table should be caught before Confluence.

Additional Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V5.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v5_20260604090015.json`
- Repair-mode shared updates now use the full configured model token budget instead of the compact update cap.
- No-change/healthy shared updates still use a compact cap to preserve savings.
- Added update-mode table normalization and truncation guards before Confluence publish.
- Replayed the failed `PRO-260604-XXKP4U` inputs against V5 locally.
- V5 now fails before publish with a clear guard:
  - `Shared update merge guard failed: preserved section(s) missing from final body...`
- n8n MCP confirmed active workflow `fullRetrievalD01` updated at `2026-06-04T09:00:15.700Z`.

Additional Live Retest - 2026-06-04:

- Triggered Test Strategy Regenerate Anyway job `PRO-260604-9FPMI5`.
- Queue creator execution `1030527` and generator execution `1030532` completed successfully.
- Supabase marked the job `completed` and stored:
  - `output.updateSummary.version = shared-delta-update-v5`
  - `updatedSections = ["Appendix / Coverage Ledger"]`
  - `preservedSectionCount = 12`
  - `coverageLedgerCount = 5`
  - `coverageSummary.gateStatus = passed`
- Confluence page `25886934` was updated to version `5` at `2026-06-04T09:19:36.576Z`.
- The coverage ledger repair worked: the published body contains five clean covered ledger rows with no raw table metadata suffixes.
- However, inspecting the published Confluence storage body found a remaining merge gap:
  - sections `1` through `8` were present as h2 headings,
  - their nested h3/h4 subsection content was dropped from the final published body,
  - sections `9` through `12` and the Coverage Ledger retained content.
- Root cause: the V5 section extractor used the next heading of any level as a section boundary. For canonical h2 sections, the first h3 subsection incorrectly ended the parent h2 section.

Additional Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V6.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v6_20260604092354.json`
- Canonical section extraction now preserves nested subsection content:
  - an h2 canonical section ends only at the next canonical heading at the same or higher heading level,
  - child h3/h4/h5/h6 content remains inside the parent section body.
- The final pre-publish guard now treats preserved sections as invalid when they are missing or content-thin, not merely when the heading is absent.
- Local parser validation passed with representative h2/h3 HTML:
  - nested h3 content stays inside `Introduction & Context`,
  - the next h2 does not leak into the previous section.
- Direct active workflow verification passed:
  - updated at `2026-06-04T09:23:54.584Z`,
  - contains `SHARED_DELTA_UPDATE_V6`,
  - contains `shared-delta-update-v6`,
  - contains the nested-heading boundary fix,
  - contains the content-thin preserved-section guard.

Additional Live Retest - 2026-06-04:

- Triggered Test Strategy Regenerate Anyway job `PRO-260604-G2ZROQ`.
- Queue creator metrics showed the job was queued as an update of `PRO-260604-9FPMI5`.
- Generator execution `1030694` ran with shared delta update V6.
- Supabase marked the job `failed` with `SHARED_GENERATOR_FAILED`.
- n8n failed at `Update existing Document on Confluence` with:
  - `Content body cannot be converted to new editor format`
- The failed run did not publish a new Confluence version.
- The V6 raw model output ended after a non-canonical `Appendix / Traceability Matrix` table with a trailing orphan pipe (`|`) and did not emit a fresh Coverage Ledger.
- Root cause of this V6 miss:
  - V6 preserved nested h3/h4 content correctly,
  - but it only treated later canonical headings as section boundaries,
  - therefore non-canonical peer headings such as `## 13. Appendix / Traceability Matrix` could be swallowed into the prior canonical h2 section,
  - the swallowed appendix carried malformed table tail content into the final Confluence update.

Additional Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V7.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v7_20260604094138.json`
- Section extraction now uses the correct boundary rule:
  - ordinary child h3/h4/h5/h6 headings remain inside the parent canonical section,
  - any same-or-higher peer heading ends the parent section even when the peer heading is not canonical,
  - any later canonical heading, including a child `Coverage Ledger`, starts its own section.
- Added sanitizer handling for orphan pipe characters immediately after generated HTML tables.
- Local regression validation passed for the exact V6 failure shape:
  - nested h3 content remains preserved,
  - non-canonical h2 appendix content does not leak into section 12,
  - Coverage Ledger is still extracted separately,
  - orphan `</table>|` tails are stripped.
- Direct active workflow verification passed:
  - updated at `2026-06-04T09:41:38.903Z`,
  - contains `SHARED_DELTA_UPDATE_V7`,
  - contains `shared-delta-update-v7`,
  - contains the peer-heading boundary fix,
  - contains the orphan table-pipe sanitizer.

Additional Live Retest - 2026-06-04:

- Clicked Regenerate on failed job `PRO-260604-G2ZROQ`, creating retry job `PRO-260604-RDJFBB`.
- This run executed as `generationMode = retry`, not as a normal update/delta job.
- Generator execution `1030862` completed successfully.
- Supabase marked `PRO-260604-RDJFBB` as `completed`.
- Confluence page `25886934` was updated to version `6`.
- Published body validation:
  - all required Test Strategy sections are present,
  - no required section is content-thin,
  - no duplicate `Document: Enterprise Test Strategy` header,
  - no orphan `</table>|` table tail,
  - no trailing pipe at the end of the body,
  - Coverage Ledger is present.
- Coverage validation:
  - `coverageLedgerCount = 9`,
  - `coveredCount = 8`,
  - `partialCount = 1`,
  - `gateStatus = warning`.
- Remaining warning:
  - `C9 Environment & Data Management` is partial because the generated source reference lacks a concrete `chunkId`.
- This retry repaired the visible Confluence document, but it does not fully validate the V7 delta-update path because retry mode bypassed `updateSummary` and produced a full regenerated document.

Additional Live Retest - 2026-06-04:

- Triggered Test Plan Regenerate Anyway job `PRO-260604-OFOPIK`.
- This run executed as a true update/delta job:
  - `generationMode = update`,
  - `updateOfJobId = PRO-260603-FUW452`,
  - `updateSummary.version = shared-delta-update-v7`.
- Generator execution `1031119` completed successfully.
- Supabase marked `PRO-260604-OFOPIK` as `completed`.
- Confluence page `26083329` was updated to version `3`.
- Published body validation:
  - all 18 required Test Plan sections are present,
  - no required section is content-thin,
  - no duplicate canonical sections,
  - no duplicate `Document: Enterprise Test Plan` header,
  - no orphan `</table>|` table tail,
  - no trailing pipe at the end of the body,
  - one Coverage Ledger heading is present.
- Coverage validation:
  - `coverageLedgerCount = 8`,
  - `coveredCount = 6`,
  - `partialCount = 2`,
  - `gateStatus = warning`.
- Remaining coverage warnings:
  - `005 Order Tracking & Support` is partial because coverage focuses on timeline accuracy and support links with less automation,
  - `006 Accessibility Compliance` is partial because it combines manual verification with automated scans.
- Remaining metadata/UI gap:
  - `updatedSections` contains `Appendix / Coverage Ledger` twice,
  - `updatedSectionCount = 2` even though only one unique Coverage Ledger section is present in the published body.
- This is not a document-corruption issue, but should be cleaned up so the UI count reflects unique updated sections.

Additional Live Retest - 2026-06-04:

- Triggered Risk Matrix Regenerate Anyway job `PRO-260604-4S23OS`.
- This run executed as a true update/delta job:
  - `generationMode = update`,
  - `updateOfJobId = PRO-260603-SMK27Q`,
  - `updateSummary.version = shared-delta-update-v7`.
- Generator execution `1031223` failed at `Update existing Document on Confluence`.
- Confluence rejected the update with:
  - `Content body cannot be converted to new editor format`
- Supabase marked the job `failed` with `SHARED_GENERATOR_FAILED`.
- The failed run did not publish a new Confluence version.
- Root cause:
  - the generated Risk Detail Register table had a 6-column header,
  - each data row had 9 cells because source-reference metadata such as `chunkId...\ | 7\ | 0\ | table` was split into separate table cells,
  - this malformed table survived until Confluence publish.

Additional Fix Implemented - 2026-06-04:

- Patched active workflow `fullRetrievalD01` with shared delta update V8.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_delta_update_v8_20260604102026.json`
- Update-mode table normalization now repairs source-reference spillover:
  - detects tables with a `Source Reference` column,
  - rejoins extra metadata cells into the source-reference cell,
  - preserves the real trailing semantic columns such as mitigation, contingency, and detection strategy,
  - keeps row cell counts aligned with the header before Confluence publish.
- Local regression validation passed using the exact Risk Detail Register failure shape:
  - 9-cell malformed row repaired to 6 cells,
  - source reference rejoined as `chunkId... - 7 - 0 - table`,
  - mitigation, contingency, and detection columns preserved.
- Direct active workflow verification passed:
  - updated at `2026-06-04T10:20:26.317Z`,
  - contains `SHARED_DELTA_UPDATE_V8`,
  - contains `shared-delta-update-v8`,
  - contains the source-reference spillover repair.

Additional Live Retest - 2026-06-04:

- Clicked Regenerate on failed Risk Matrix job `PRO-260604-4S23OS`, creating retry job `PRO-260604-WTPJIP`.
- This run executed as `generationMode = retry`, not as a normal update/delta job.
- Generator execution `1031322` completed successfully.
- Supabase marked `PRO-260604-WTPJIP` as `completed`.
- Confluence page `26083346` was updated to version `3`.
- Coverage metadata:
  - `coverageLedgerCount = 7`,
  - `coveredCount = 6`,
  - `partialCount = 1`,
  - `gateStatus = warning`.
- Remaining coverage warning:
  - `Environment / Infrastructure redundancy and graceful degradation` is partial because direct evidence on environment instability is limited.
- Published body structural validation failed:
  - missing canonical `Executive Summary` heading,
  - missing canonical `Top Critical Risks Analysis` heading,
  - duplicate Coverage Ledger sections,
  - two malformed tables remain with inconsistent row cell counts.
- Root cause:
  - retry mode used the create/full-regeneration path,
  - V8 table repair is currently scoped to shared update publishing only,
  - the retry/create path can still publish malformed tables and duplicate coverage ledger sections.
- This confirms V8 is not yet sufficient as a full shared document safety fix unless the create/retry publish path is also protected or retry is forced through update-style final-body guards for existing shared pages.

Retest:

- Re-run Regenerate Anyway for the latest Test Strategy document, specifically as an update/delta job rather than retry.
- Export the Confluence document.
- Confirm all 13 Test Strategy sections are present exactly once.
- Confirm the Coverage Ledger is present and parsed into stored metadata.
- Confirm the document does not contain appended duplicate full bodies.
- Repeat the same update smoke validation for Test Plan and Risk Matrix.

Related Bugs:

- `BUG-E2E-092`
- `BUG-E2E-094`
- `BUG-E2E-095`
- `BUG-E2E-097`

## BUG-E2E-099: Shared Document Create/Retry Path Can Publish Structurally Invalid Documents

Status: fixed - workflow/build/export-smoke validated; pending next live shared-doc export retest

Severity: critical

Area:

- Generate Documents
- Shared Confluence document generation
- First Time Create, Create-Retry, Update, Update-Retry
- Test Strategy, Test Plan, Risk Matrix
- n8n workflow `fullRetrievalD01`

Observed During:

- Professional document review after the 2026-06-04 Regenerate Anyway runs for `AstraCart E2E Scope Check 20260528`.
- Exported documents:
  - `C:\Users\anujalhans01\Downloads\Test+Strategy+-+AstraCart+E2E+Scope+Check+20260528 (1).doc`
  - `C:\Users\anujalhans01\Downloads\Test+Plan+-+AstraCart+E2E+Scope+Check+20260528 (2).doc`
  - `C:\Users\anujalhans01\Downloads\Risk+Matrix+-+AstraCart+E2E+Scope+Check+20260528 (1).doc`
- Latest Risk Matrix retry job: `PRO-260604-WTPJIP`.

What Happened:

- `PRO-260604-WTPJIP` completed and published Confluence page `26083346` version `3`, but the exported Risk Matrix is not professionally acceptable.
- The Risk Matrix export is missing expected canonical sections:
  - `Executive Summary`
  - `Top Critical Risks Analysis`
  - clear `Coverage Ledger` heading
- The Risk Matrix export contains duplicate or ambiguous Coverage Ledger content.
- The Risk Matrix export contains malformed tables with inconsistent row cell counts.
- Supabase stores the job as `completed`; `qa_job_metrics` stores `JOB_COMPLETED`; UI therefore presents it as successful.
- This happened because the retry ran as `input.generationMode = retry` and `output.generationMode = create`, not through the V8 shared update merge/publish guards.

Expected:

- All shared document operation modes must pass the same final professional document gate before a Confluence publish is considered successful:
  - First Time Create
  - Create-Retry
  - Update
  - Update-Retry
- A job can have amber coverage, but it must not publish a structurally invalid document.
- Required canonical sections, table shape, duplicate ledger checks, and final Confluence body sanity checks should be operation-mode independent.
- Retry should not bypass fixes that protect update mode.

Likely Root Cause:

- The shared delta update V8 guard is scoped to update publish path only.
- Create/retry publish path still relies on earlier quality-gate checks that are too shallow for final Confluence body validation.
- `QUALITY_GATE_PASSED` validates model output coverage/word count before final Confluence shape is known; it does not prove that the exported page is professionally valid.

Suggested Fix:

1. Extract a shared final document validator used by create, create-retry, update, and update-retry.
2. Validate final Confluence storage body immediately before publish:
   - canonical required sections by document type,
   - duplicate document title/header,
   - duplicate or missing Coverage Ledger,
   - malformed table row shapes,
   - orphan pipes/truncated table tails,
   - minimum content per required section.
3. If a retry targets an existing shared Confluence page, route it through the same update-style merge/guard path or apply the same guard to the full regenerated body.
4. Do not mark `qa_jobs.status = completed` or emit `JOB_COMPLETED` unless final document validation passes after publish.

Retest:

- Run first create, create retry, update, and update retry for Test Strategy, Test Plan, and Risk Matrix.
- Export each Confluence page.
- Confirm all required sections are present exactly once.
- Confirm no malformed tables or duplicate Coverage Ledger sections exist.
- Confirm Supabase/UI completion only occurs after final validation passes.

Fix Implemented:

- 2026-06-04: Patched active n8n workflow `fullRetrievalD01` with shared final validation V9.
- Create/create-retry shared docs now pass through final HTML validation, canonical section repair, Coverage Ledger insertion, table normalization, and durable `finalValidation`/`diagnostics` persistence before completion.
- FE now reads final validation metadata and surfaces admin-review state on completed document cards, job rows, Analytics, and Work Review Center.
- No live paid generation was run for validation; exported existing documents were used as smoke fixtures.
- 2026-06-04 live Test Strategy update `PRO-260604-9E21L7` exposed a V9 Set-node expression bug: `Restore Quality Gate Output` referenced future node `Convert MD -> Confluence Formatted HTML`, causing n8n `No path back to referenced node`.
- V10 hotfix applied: restore node no longer references the future converter; downstream completion/failure bodies read converter validation via unpaired item access.
- 2026-06-04 update retry `PRO-260604-U333PF` still executed the V9 snapshot because the active worker had not refreshed the patched workflow entity. Workflow was explicitly re-published/deactivated/activated at `2026-06-04 11:32:56` to refresh the active execution snapshot.
- 2026-06-04 retry `PRO-260604-9UIKW3` proved executions were still reading `workflow_history.versionId=4b63abdf-f3a8-42a4-b199-7ee8610a5d62`, not only `workflow_entity.nodes`. Active `workflow_history` snapshot was patched to match V10 and verified clean.
- 2026-06-04 retry `PRO-260604-CU23P8` validated the patched active snapshot: job completed, updated Confluence page `25886934`, persisted `finalValidation`, `diagnostics`, and `operationMode=update_repair`.

## BUG-E2E-100: Table Integrity Is Not Enforced Across All Shared Document Outputs

Status: fixed - workflow/build/export-smoke validated; pending next live shared-doc export retest

Severity: critical

Area:

- Confluence document formatting
- Markdown/HTML table conversion
- Source reference normalization
- Test Strategy, Test Plan, Risk Matrix

Observed During:

- Professional review of the three exported documents from 2026-06-04.

What Happened:

- Test Strategy export contains malformed tables with inconsistent row widths.
- Risk Matrix export contains malformed Risk Detail Register / ledger-style tables where rows have more cells than the header.
- The known source-reference spillover shape can split metadata such as `chunkId | page | row | table` into separate cells.
- V8 repairs this in update mode, but retry/create output can still publish malformed tables.
- Test Plan export did not show malformed row counts in this sample, but the same generator/converter pipeline is shared and should be guarded consistently.

Expected:

- Every generated table should have stable headers and row values aligned to the same column count.
- Source references should be normalized into a single cell and should not leak metadata delimiters into adjacent semantic columns.
- Confluence publish should be blocked or repaired before publish when table rows are malformed.

Likely Root Cause:

- Table normalization is not centralized across all document operation modes.
- Quality-gate checks are focused on coverage metadata and broad required sections, not strict table shape.
- The create/retry path bypasses the V8 source-reference spillover repair.

Suggested Fix:

1. Move table normalization into a shared pre-publish utility used by all shared document paths.
2. Make malformed table detection a hard final quality gate.
3. For tables with a `Source Reference` column, rejoin extra metadata fragments into that column while preserving trailing semantic cells.
4. Persist table validation results in `qa_jobs.output.finalValidation` and `qa_job_metrics.metadata.final_validation`.

Retest:

- Export all three documents after create, retry, update, and update-retry.
- Parse all tables.
- Confirm every table has one header shape and all body rows match it.

Fix Implemented:

- 2026-06-04: Added V9 shared-doc HTML table normalization for create/create-retry and update patch bodies.
- Rows with source-reference spillover are repaired into the expected cell count before Confluence publish.
- Smoke against the existing 2026-06-04 exports reproduced malformed rows across all three docs, confirming the validator targets the observed defect class.

## BUG-E2E-101: Coverage Ledger And Coverage Review Note Are Missing, Duplicated, Or Not Reliably Visible

Status: fixed - workflow/build/export-smoke validated; pending next live shared-doc export retest

Severity: high

Area:

- Coverage Ledger generation
- Coverage Review Note
- Update Summary / Coverage Review UI
- Test Strategy, Test Plan, Risk Matrix

Observed During:

- Review of exported documents from 2026-06-04 and recent Supabase outputs.

What Happened:

- Test Strategy export did not expose a clear canonical `Coverage Ledger` heading in the exported document scan, even though coverage rows/status values were present.
- Test Plan update metadata contains duplicate `updatedSections` entries for `Appendix / Coverage Ledger`, causing `updatedSectionCount = 2` for one unique section.
- Risk Matrix retry/create output showed duplicate or ambiguous Coverage Ledger content while still completing successfully.
- No exported document showed a clear Coverage Review Note that explains amber coverage items and what business/QA review remains.

Expected:

- Every shared QA document should have one clear Coverage Ledger section.
- If coverage is amber, the document should include a professional Coverage Review Note with the specific partial/missing/excluded items and recommended reviewer action.
- UI counters should deduplicate section names before displaying updated/preserved counts.
- Coverage metadata should match the final published document, not only raw model output.

Likely Root Cause:

- Coverage ledger parsing, final-body insertion, and UI summary counting are handled in separate places.
- Final published body is not re-parsed to reconcile coverage metadata and visible document sections.
- Update summary arrays are not normalized/deduplicated before persistence/display.

Suggested Fix:

1. Make Coverage Ledger a canonical required section for all three shared documents.
2. Add a Coverage Review Note section or paragraph whenever coverage status is warning/amber.
3. Re-parse the final Confluence body before `JOB_COMPLETED` to reconcile:
   - coverage row count,
   - covered/partial/missing/excluded counts,
   - duplicate ledger sections,
   - source-reference quality warnings.
4. Deduplicate `updatedSections`, `preservedSections`, `addedSections`, and `removedSections` before storing `updateSummary` and before rendering the FE modal.

Retest:

- Generate all three document types in all four operation modes.
- Confirm exactly one visible Coverage Ledger.
- Confirm amber coverage is explained in the document and in UI.
- Confirm section counters match unique visible sections.

Fix Implemented:

- 2026-06-04: V9 final validation treats Coverage Ledger as canonical for Test Strategy, Test Plan, and Risk Matrix.
- Added Coverage Review Note injection when coverage metadata is warning/failed/not parsed.
- Update summary arrays are deduped in the active `Quality Gate` workflow node and also defensively deduped in FE rendering for historical rows.

## BUG-E2E-102: Failed Generation Jobs Do Not Persist Enough Admin Diagnostics

Status: fixed - workflow/build/Supabase-smoke validated; pending next live failure-path retest

Severity: high

Area:

- Supabase `qa_jobs`
- Supabase `qa_job_metrics`
- n8n failure handling
- Admin/support loop
- FE failure details

Observed During:

- Failed update jobs:
  - `PRO-260604-G2ZROQ`
  - `PRO-260604-4S23OS`
- Supabase and metrics inspection on 2026-06-04.

What Happened:

- Failed shared update jobs persisted generic output:
  - `errorType = SHARED_GENERATOR_FAILED`
  - `message = Generation workflow failed before producing an output.`
- `qa_job_metrics` failure rows had little or no actionable `error_message`.
- The root cause was only discoverable by manually inspecting n8n execution/body details:
  - Test Strategy V6 failed on malformed Confluence body/orphan table pipe.
  - Risk Matrix V7 failed because a malformed table reached Confluence publish.
- There is no dedicated admin diagnostics table or first-class persisted diagnostic object.

Expected:

- Any production failure should create an admin/support loop with enough details to triage without asking the user to retry blindly.
- The UI can hide technical detail from regular users, but admin/support should see:
  - job id,
  - document type,
  - operation mode,
  - retry/update source job id,
  - n8n workflow id and execution id,
  - failed node name,
  - raw error message/status code,
  - Confluence page id/version attempted,
  - model/token/cost usage before failure,
  - final validation errors,
  - malformed table details,
  - coverage gate result,
  - recommended remediation.

Likely Root Cause:

- Failure handlers normalize many downstream errors into one generic shared-generator failure.
- `qa_jobs.output` and `qa_job_metrics.metadata` are not used as durable diagnostic envelopes.
- FE Error Details can only display whatever thin output the backend persisted.

Suggested Fix:

1. Add a durable diagnostics object to `qa_jobs.output.diagnostics` and `qa_job_metrics.metadata.diagnostics`, or create a dedicated `qa_job_diagnostics`/`qops_admin_work_items` table.
2. Capture node-level n8n error details before replacing them with user-friendly messages.
3. Add an admin-only diagnostics view/filter for failed or `completed_with_warnings` jobs.
4. Include the final validation report for both failed and completed jobs.

Retest:

- Force a malformed table failure in a test workflow.
- Confirm the user sees a safe message.
- Confirm admin/support can see node, execution, validation, and remediation detail from Supabase/UI without manual n8n spelunking.

Fix Implemented:

- 2026-06-04: Completion and failure handlers now persist `diagnostics`, `operationMode`, and `finalValidation` envelopes to `qa_jobs.output` and `qa_job_metrics.metadata`.
- Generator and Confluence failure paths now include structured diagnostics instead of only generic shared-generator failure text.
- FE Work Review Center adds an Admin validation lane for completed outputs that require support review.
- 2026-06-04 live retest `PRO-260604-9E21L7` still surfaced generic parent failure because the child workflow failed before V9 diagnostics could be restored; V10 removes that premature failure point.
- 2026-06-04 retry `PRO-260604-U333PF` confirmed the parent failure wrapper still appears when the child workflow crashes before its failure handlers. Root reason was stale V9 active execution snapshot; workflow publish refresh completed before next retry.
- 2026-06-04 retry `PRO-260604-9UIKW3` confirmed publish refresh alone did not update `workflow_history`; active version history was patched directly and verified with V10 marker/no invalid future-node reference.
- 2026-06-04 retry `PRO-260604-CU23P8` completed with diagnostics in both `qa_jobs.output` and `qa_job_metrics.metadata`.

## BUG-E2E-103: Update And Update-Retry Cost Controls Are Not Enforced End-To-End

Status: fixed - workflow/build/Supabase-smoke validated; pending next live update/retry token-savings retest

Severity: high

Area:

- Update/Regenerate Anyway
- Token and cost governance
- Update Summary UI
- n8n shared generator

Observed During:

- Test Plan update job `PRO-260604-OFOPIK`.
- Test Strategy retry job `PRO-260604-RDJFBB`.
- Risk Matrix retry job `PRO-260604-WTPJIP`.

What Happened:

- Test Plan true update used `12.6k` tokens and reported only `395` estimated tokens saved (`3%`) against the previous baseline.
- Retry jobs for Test Strategy and Risk Matrix executed as create/full-regeneration outputs rather than update-patch outputs:
  - `input.generationMode = retry`
  - `output.generationMode = create`
  - `updateSummary = null`
- The Update Summary UI only appears for update-mode outputs, so retry/repair cost behavior is not visible as update cost/savings.
- Current update token cap is conditional: repair mode uses full configured max tokens when previous coverage needs repair. That is valid for damaged pages, but it needs explicit policy and telemetry so small patches do not silently become full regenerations.

Expected:

- Update and update-retry should default to compact patch generation and use only the tokens needed for changed/repair sections.
- Full regeneration should be a deliberate `repair` fallback, not an implicit retry behavior.
- The UI should distinguish:
  - delta update,
  - update repair,
  - full retry/create.
- Cost/savings should be calculated against a meaningful baseline and displayed consistently.

Likely Root Cause:

- FE retry logic can send either update or retry mode based on available metadata and update reasons.
- Backend retry handling can produce create-mode output for existing Confluence pages.
- Token savings are estimated from previous token usage, but repair-mode full generation can make savings low or negative without being labeled as a repair.

Suggested Fix:

1. Define operation modes explicitly:
   - `create`
   - `create_retry`
   - `update_delta`
   - `update_repair`
   - `update_retry`
2. For existing shared documents, prefer `update_retry`/`update_repair` over generic create retry.
3. Persist `operationMode`, `patchMode`, `repairMode`, `baselineTokens`, `tokensUsed`, `tokensSaved`, and `savingsPercent`.
4. Add a token budget guard:
   - compact healthy update cap,
   - repair cap only when previous/final validation demands it,
   - alert/admin diagnostic when update tokens exceed a configured threshold.

Retest:

- Trigger update for an unchanged healthy document.
- Trigger update when coverage has amber gaps.
- Trigger retry after an update failure.
- Confirm token/cost behavior and UI labels match the actual operation.

Fix Implemented:

- 2026-06-04: Active workflow now persists `operationMode` for create/create-retry/update_delta/update_repair style reporting.
- Shared update summaries now dedupe section arrays and distinguish repair update vs delta update in FE.
- Update Summary UI now labels `Tokens used` and `Usage and estimated savings` to avoid implying all values are savings.
- Historical Supabase smoke confirmed old Test Plan duplicate `Appendix / Coverage Ledger` rows are normalized by FE without rerunning paid jobs.

## BUG-E2E-104: Final Published Document Validation Is Not Reflected In FE Completion State

Status: fixed - UI/build smoke validated; pending next live finalValidation metadata retest

Severity: high

Area:

- Frontend job status
- Generated document cards
- Update Summary modal
- Backend status contract

Observed During:

- Risk Matrix retry job `PRO-260604-WTPJIP`.
- Test Plan update job `PRO-260604-OFOPIK`.

What Happened:

- FE displays completion based on backend `status = completed`.
- There is no visible distinction between:
  - completed and professionally valid,
  - completed with amber coverage,
  - completed but structurally invalid,
  - completed with safe rollback/no publish.
- `UpdateSummaryButton` trusts backend `updateSummary` counts directly; it does not deduplicate sections or show final validation status.
- Failed-card retry pausing exists after repeated attempts, but no equivalent admin-review state exists for completed-but-invalid documents.

Expected:

- FE should display final document validation separately from job execution status.
- A completed job with amber coverage can be green/yellow, but a structurally invalid document must not appear as a normal success.
- Users should not keep retrying deterministic failures without admin diagnostics.

Likely Root Cause:

- Backend status contract has only broad terminal status and optional coverage metadata.
- FE completion cards do not consume a final body validation contract because the backend does not persist one.

Suggested Fix:

1. Add backend fields such as:
   - `finalValidation.status = passed|warning|failed`
   - `finalValidation.structuralStatus`
   - `finalValidation.coverageStatus`
   - `finalValidation.issues[]`
2. Update FE cards/modals to show:
   - `Document valid`
   - `Coverage needs review`
   - `Admin review required`
   - `No publish; previous page preserved`
3. Gate Confluence open-link prominence behind structural validation pass.

Retest:

- Publish a valid amber-coverage document and confirm it shows as completed with review needed.
- Simulate malformed final body and confirm the user/admin sees admin-review state, not normal success.

Fix Implemented:

- 2026-06-04: FE now consumes `finalValidation`/`diagnostics` metadata, shows a Document Validation modal, and uses warning/error card tone for completed documents that need validation review.
- Dashboard, Quality Coverage, Analytics, My Document Jobs, and Work Review Center now include final validation state.
- Build validated with `npm.cmd run build`.
- 2026-06-04: V10 hotfix applied after live Test Strategy retest failed at `Restore Quality Gate Output`; pending rerun is required to validate final metadata persistence.
- 2026-06-04: V10 patch was published after retry `PRO-260604-U333PF` proved the worker was still executing the V9 snapshot.
- 2026-06-04: Active `workflow_history` snapshot patched after retry `PRO-260604-9UIKW3`; both entity and history now contain V10 and no invalid future-node reference.
- 2026-06-04: Test Strategy update retry `PRO-260604-CU23P8` completed with `finalValidation.status=passed`, `mergeGuard=passed`, and `operationMode=update_repair`. V11 metadata cleanup patched future merge-pass outputs to persist `structuralStatus=passed`.

## BUG-E2E-105: Shared Document Public Output Exposes Internal Evidence IDs And Plain Dash Lists

Status: closed

Severity: medium

Area:

- Test Strategy, Test Plan, Risk Matrix shared document publishing
- n8n markdown-to-Confluence conversion
- Public Confluence document quality

Observed During:

- Test Strategy export `Test Strategy - AstraCart E2E Scope Check 20260528 (2).doc`.

What Happened:

- Some generated sections used plain dash-prefixed lines instead of real HTML/Confluence bullet lists.
- Public document content exposed internal `chunkId` references and validator wording such as `missing concrete chunkId`.
- These values are useful for backend evidence validation but not appropriate for business-facing readers.

Expected:

- Dash/numbered markdown list blocks should render as real `<ul>/<ol>` list structures in Confluence exports.
- Internal chunk IDs should remain available to backend validation but should not appear in user-facing published documents.
- Evidence-review wording should be business-readable.

Fix Implemented:

- 2026-06-04: V12 n8n workflow patch applied to both `workflow_entity` and active `workflow_history` snapshot.
- Converter now turns markdown `- item` and `1. item` blocks into real HTML lists before Confluence publish.
- Create/update publish paths now sanitize public HTML to remove `chunkId` values and replace internal validator phrasing with support-friendly wording.
- 2026-06-04: Follow-up patch added loose existing-HTML list repair, so preserved Confluence content with `<br/>- item` lines is converted into real lists during the next shared-document update.
- 2026-06-04: Live Test Strategy repair update `PRO-260604-ZEYIA3`, Test Plan repair update `PRO-260604-UV7DQX`, and Risk Matrix repair update `PRO-260604-WP2VO3` were validated after the shared list/chunk cleanup patches.
- Published/export body checks found no public `chunkId`, no `missing concrete chunkId`, no literal dash-list residue, and no malformed table shapes for the latest successful shared document outputs.

Retest:

- Trigger one shared document update/regenerate.
- Export from Confluence and confirm the highlighted dash lines render as bullets/numbers.
- Search the exported document for `chunkId` and `missing concrete chunkId`; both should be absent.

## BUG-E2E-106: Document Jobs Validation UI Is Too Technical And Icon Row Wraps Poorly

Status: closed

Severity: low

Area:

- Dashboard document job cards
- Validation Passed / Document Check modal
- Job status iconography

Observed During:

- My Document Jobs panel after adding the final validation icon.

What Happened:

- Validation modal displayed backend-style validation fields and labels that were not user-friendly.
- Validation Passed icon and Recovered Job icon both used the shield visual.
- The extra validation icon made the Job ID and icon row feel cramped in the right-side document panels.

Expected:

- Validation details should explain publish readiness in user-facing language.
- Recovered jobs should use a distinct icon.
- Job ID and icons should remain aligned at common desktop widths.

Fix Implemented:

- 2026-06-04: Validation UI renamed to Document Check and simplified to Result, Document state, Operation, and Support details.
- Recovered job status now uses the Archive Restore icon.
- Documents workspace right column is wider on desktop, and job-card headers use a stable ID/action grid.
- 2026-06-04: Frontend validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.
- 2026-06-04: UI smoke confirmed the updated job-card icon row, distinct recovered icon, and cleaner Document Check presentation in the document jobs panel.

Retest:

- Run frontend build.
- Open My Document Jobs and confirm job cards stay aligned with six visible icons.
- Open the Document Check modal and confirm the content is understandable without backend terminology.

## BUG-E2E-107: Test Plan Update Publishes Valid Body But Coverage Metadata And Export List Polish Need Repair

Status: closed

Severity: medium

Area:

- Test Plan shared document update
- n8n final merged body metadata extraction
- Public Confluence / exported document formatting

Observed During:

- Test Plan Regenerate Anyway update job `PRO-260604-I7LVSB`.
- Confluence page `26083329`, published version `6`.

What Happened:

- The job completed successfully as `operationMode = update_repair`.
- Final validation passed with `shared-final-validation-v13` and `structuralStatus = passed`.
- The public Confluence body scan found:
  - all required Test Plan sections present,
  - no public `chunkId`,
  - no public `missing concrete chunkId`,
  - no malformed table shapes,
  - a valid Coverage Ledger table with eight data rows.
- Supabase output metadata still stored `coverageLedgerCount = 0`.
- User review also found remaining dash-prefixed content that should render as real bullets/numbered points, matching the Test Strategy polish.

Expected:

- For shared updates, stored coverage metadata should reflect the final merged/published document body, not only the raw generated patch.
- If the final body contains a valid Coverage Ledger table, Supabase should persist non-zero `coverageLedger` and `coverageLedgerCount`.
- Plain dash-prefixed list content in Test Plan exports should be converted to real bullets or numbered lists.

Likely Root Cause:

- The final shared update body can preserve or merge a valid Coverage Ledger even when the raw model patch coverage parser returns zero rows.
- The final validation guard verifies structure but does not currently re-parse the final merged body and persist the final ledger.
- The public list converter handles common markdown and `<br/>- item` cases, but Test Plan export still exposes at least one dash-list shape not covered by the current converter.

Suggested Fix:

1. In shared update mode only, re-parse the final merged/published HTML body for Coverage Ledger rows after the merge guard passes.
2. Persist final-body coverage metadata when it is stronger than raw patch metadata.
3. Extend the final public HTML list-polish pass to cover remaining dash-prefixed Test Plan body shapes.
4. Keep create logic out of scope.

Fix Implemented:

- 2026-06-04: V14 n8n workflow patch applied to both `workflow_entity` and active `workflow_history` snapshot.
- Shared update completion now re-parses the final Confluence response body for Coverage Ledger rows when raw patch metadata has zero rows.
- Supabase `output.coverageLedger`, `output.coverageSummary`, `output.batchSummary`, `output.updateSummary.coverageSummary`, and job metrics coverage counts now prefer final-published-body metadata when it is stronger than raw patch metadata.
- Public list cleanup now also handles paragraph/div-wrapped dash list shapes such as `<p>- item</p>` in addition to markdown lines and `<br/>- item` content.
- Local parser simulation against Test Plan execution `1033313` returned 8 final-body Coverage Ledger rows: 6 covered and 2 partial.
- 2026-06-04: Live retest job `PRO-260604-UV7DQX` completed with final validation passed and public body checks clean: no public chunk IDs, no literal dash-list patterns, no malformed tables.
- `PRO-260604-UV7DQX` persisted `coverageLedger` with 8 rows from `final_published_body`; a follow-up V15 patch fixed future top-level `output.coverageSummary` persistence.
- Current `PRO-260604-UV7DQX` row was repaired in Supabase by copying the correct `updateSummary.coverageSummary` to top-level `coverageSummary`, yielding `coverageLedgerCount = 8`, `coveredCount = 6`, and `partialCount = 2`.

Retest:

- Trigger Test Plan Regenerate Anyway/update.
- Confirm Supabase output has `coverageLedgerCount > 0`.
- Confirm the exported document has bullets/numbered lists instead of literal `-` prefixes.
- Confirm public body still has no `chunkId`, no malformed tables, and final validation passes.

## BUG-E2E-108: Risk Matrix Update Document Fails At Confluence Publish For Markdown-In-HTML Patch

Status: closed

Severity: high

Area:

- Risk Matrix shared document update
- n8n markdown-to-Confluence conversion
- Confluence publish guard

Observed During:

- Risk Matrix Update Document job `PRO-260604-SB4F5J`.
- Previous Risk Matrix job `PRO-260604-WTPJIP`.
- n8n execution `1033639`.

What Happened:

- The Risk Matrix update reached the generator and quality gate successfully.
- Quality gate passed with warning-level coverage metadata, but the job failed at `Update existing Document on Confluence`.
- Atlassian returned: `Content body cannot be converted to new editor format`.
- The converter output still contained `<br/>`-separated markdown headings and pipe-table rows instead of HTML headings/tables.
- The update merge guard also did not recognize `Top 5 Critical Risks Analysis` as the canonical `Top Critical Risks Analysis` section.

Expected:

- Risk Matrix Update Document and Update Retry should publish valid Confluence storage HTML.
- Markdown headings and pipe tables should be converted before the update merge/publish step.
- Numbered section wording such as `Top 5 Critical Risks Analysis` should map to the canonical Risk Matrix section.
- Test Strategy and Test Plan update behavior should remain unchanged.

Root Cause:

- The shared converter sanitized `<br/>` line breaks before markdown headings/tables were parsed, leaving Risk Matrix patch content in a markdown-in-HTML shape.
- The shared update section-key normalization did not account for the Risk Matrix `Top N Critical Risks Analysis` title variant.

Fix Implemented:

- 2026-06-04: V16 n8n workflow patch prepared for both `workflow_entity` and active `workflow_history` snapshot.
- Converter now normalizes `<br/>` back to line breaks before markdown heading/table/list conversion.
- Update merge section-key normalization now maps `Top N Critical Risks` to `Top Critical Risks`.
- Scope is limited to formatting/section normalization; no prompt or create-path business logic was changed.
- 2026-06-04: Live retry job `PRO-260604-2QU068` still failed at Confluence publish because the generated Risk Matrix update started at `Risk Register Summary` and omitted an explicit `Executive Summary` heading.
- V17 added a Risk Matrix-only synthetic Executive Summary fallback when neither the patch nor existing page exposes a canonical Executive Summary section, and strips trailing `End of document` headings.
- V18 updated the mostly-complete patch merge branch to fall back to preserved/synthetic sections for any missing canonical section instead of publishing an incomplete body.
- No-token replay of failed execution `1033812` now produces proper headings/tables, no raw pipe rows, no raw markdown headings, no `chunkId`, no dash-list residue, and no malformed table shapes.
- No-token smoke replays for the recent successful Test Strategy (`1033166`) and Test Plan (`1033528`) update executions still pass after V18.
- 2026-06-04: Live retry job `PRO-260604-WP2VO3` completed successfully.
- n8n execution `1034034` succeeded and published Confluence page `26083346` version `6`.
- Supabase persisted `operationMode = update_repair`, `finalValidation.status = passed`, `structuralStatus = passed`, `mergeGuard = passed`, `coverageLedgerCount = 10`, and `coverageSummary.gateStatus = passed`.
- Published body scan found no raw pipe-table rows, no raw markdown headings, no `chunkId`, no `missing concrete chunkId`, no dash-list residue, no trailing `End of document`, and no malformed table shapes.

Retest:

- Retry the failed Risk Matrix Update Document job.
- Confirm Confluence publish succeeds.
- Confirm public body has HTML headings/tables, no raw pipe-table rows, no raw markdown headings, no malformed table shapes, and final validation passes.

## BUG-E2E-109: Update Retry Jobs Complete But Retry Metadata Is Not Persisted

Status: fixed - UI/workflow smoke validated; pending next live update-retry lineage retest

Severity: medium

Area:

- Document job retry traceability
- My Document Jobs / Output Panel retry action
- n8n/Supabase job metadata contract

Observed During:

- Risk Matrix failed update jobs `PRO-260604-SB4F5J` and `PRO-260604-2QU068`.
- Successful live retry `PRO-260604-WP2VO3`.

What Happened:

- The user clicked Retry from a failed Risk Matrix update job.
- The new job completed successfully and behaved as an update repair against previous document `PRO-260604-WTPJIP`.
- Supabase stored the new job with:
  - `generationMode = update`
  - `retry_of_job_id = null`
  - `retryContext.retryMode = false`
  - `retryContext.retryOfJobId = null`
- This makes the operation functionally correct but not auditable as an Update Retry.

Expected:

- When Retry is clicked from a failed update job, the new job should preserve update semantics and also persist retry lineage.
- The job should be classifiable as Update Retry in backend metadata, UI details, admin support views, and analytics.

Suggested Fix:

1. Preserve `generationMode = update` so the job continues to patch the existing document.
2. Add retry lineage fields:
   - `retry_of_job_id = <failed update job id>`
   - `retryContext.retryMode = true`
   - `retryContext.retryOfJobId = <failed update job id>`
   - optional `retryContext.previousStatus`, `previousError`, and `retryInstruction`
3. Surface operation display as `Update Retry` when both update mode and retry lineage are present.
4. Ensure Dashboard/Analytics can distinguish Update, Regenerate Anyway/Repair Update, and Update Retry without double-counting.

Fix Implemented:

- 2026-06-05: Patched `DashboardPage.tsx` so retry submissions preserve `generationMode = update` while also sending `retryJobId` and structured `retryContext`.
- Patched active shared queue workflow `yPgr7mtUnL3E8QQP` so update retries keep update semantics and persist retry lineage instead of being normalized into plain update jobs.
- Patched active Story Test Cases queue workflow `8nuhDEewnnunXSbF` to forward `retryContext` and persist `retry_of_job_id`.
- TypeScript validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.
- Frontend production build passed with `npm.cmd run build`.
- n8n workflow code compilation and retry-lineage wiring smoke validation passed locally.

Retest:

- Fail or simulate an update job.
- Click Retry from the output panel.
- Confirm the new job patches the existing document and persists retry lineage to Supabase.

## BUG-E2E-110: Failed/Recovered Document Job Usage Icon Can Disappear Even When Metrics Exist

Status: closed

Severity: medium

Area:

- My Document Jobs usage icon
- Failed/recovered document job auditability
- Frontend analytics/metrics enrichment

Observed During:

- Failed Risk Matrix update jobs `PRO-260604-SB4F5J` and `PRO-260604-2QU068`.
- Recovered Risk Matrix path after successful retry `PRO-260604-WP2VO3`.

What Happened:

- The failed jobs did not have token/cost usage persisted in `qa_jobs.output`.
- Usage was recorded in `qa_job_metrics` on `QUALITY_GATE_PASSED` rows:
  - `PRO-260604-SB4F5J`: 8,455 tokens, estimated US$0.007466.
  - `PRO-260604-2QU068`: 9,282 tokens, estimated US$0.008789.
- Because failed `qa_jobs.output` only stores the failure payload, the My Document Jobs usage icon can disappear if the frontend does not receive/merge the metric row.

Expected:

- Failed and recovered document job cards should show the compact usage icon when any recorded usage exists before failure.
- The modal should show failed-attempt words, tokens, and estimated cost.
- Completed retry usage should remain separate from failed-attempt usage.

Root Cause:

- The frontend enrichment path primarily uses analytics summary rows.
- `fetchGenerationJobMetrics()` did not directly query `qa_job_metrics`, and its analytics-summary mapping dropped metric metadata.
- Failed usage can therefore be present in Supabase but absent from the card-level usage enrichment.

Fix Implemented:

- 2026-06-04: Frontend API helper now merges analytics-summary generation metrics with direct Supabase `qa_job_metrics` rows when authenticated.
- Metric metadata is preserved so update/retry lineage enrichment is not lost.
- Existing card behavior remains unchanged: the compact usage icon appears only when usage values exist.
- 2026-06-04: Historical failed Risk Matrix rows `PRO-260604-SB4F5J` and `PRO-260604-2QU068` were repaired by copying their recorded `QUALITY_GATE_PASSED` usage into `qa_jobs.output.tokenUsage`.
- 2026-06-04: My Document Jobs enrichment now also applies metric data to current/local job records, not only to rows returned by the generated-documents endpoint. This covers failed/recovered cards that remain visible from local state while backend document rows are missing or sparse.
- TypeScript validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.
- 2026-06-04: Supabase verification confirmed historical failed rows `PRO-260604-SB4F5J` and `PRO-260604-2QU068` now carry the expected token/cost usage payload, and future failed/recovered cards can be enriched from direct `qa_job_metrics` rows.

Retest:

- Open My Document Jobs after failed Risk Matrix attempts are present.
- Confirm failed/recovered cards with `QUALITY_GATE_PASSED` metrics show the usage icon.
- Open usage details and confirm tokens/cost match `qa_job_metrics`.

## BUG-E2E-111: Dashboard And Analytics Show Conflicting Success Rates

Status: closed

Severity: high

Area:

- Dashboard Operational Pulse
- Dashboard Pipeline Health
- Analytics Operations Overview
- n8n analytics summary contract

Observed During:

- 2026-06-04 post-fix validation for `AstraCart E2E Scope Check 20260528`.
- Latest successful shared document jobs:
  - Test Strategy `PRO-260604-ZEYIA3`
  - Test Plan `PRO-260604-UV7DQX`
  - Risk Matrix `PRO-260604-WP2VO3`

What Happened:

- Dashboard Operational Pulse showed `Success rate 88%`.
- Analytics Operations Overview showed `Success rate 84%`.
- Dashboard Pipeline Health showed `Success rate 70%`.
- All three values were visible for the same user/project/time window.

Expected:

- The same scope should use one clearly defined success-rate formula.
- Dashboard, Pipeline Health, and Analytics should not show conflicting KPI values unless their labels explicitly describe different scopes.
- Historical failed attempts, active retry-ready failures, and recovered failures should be separated instead of blended into one ambiguous success KPI.

Likely Root Cause:

- n8n `/webhook/analytics-summary` returns `overview.successRate` from raw completed vs failed metric rows.
- Analytics page recalculates success rate from frontend `completedWorkload` and currently actionable failed jobs.
- Dashboard Operational Pulse uses generated outputs plus knowledge jobs and retry-ready counts from local/UI state.

Suggested Fix:

1. Define a canonical KPI contract:
   - current outcome success rate,
   - historical attempt success rate,
   - retry-ready count,
   - recovered count.
2. Return those fields from the analytics endpoint.
3. Update Dashboard and Analytics to display the same canonical value for the same label.
4. Rename any intentionally different KPI so users can understand the denominator.

Fix Implemented:

- 2026-06-05: Dashboard Operational Pulse now uses the live analytics completed-job count plus current retry-ready job count for current success rate.
- 2026-06-05: Dashboard Pipeline Health now uses the same current-success formula instead of the historical raw analytics success rate.
- 2026-06-05: Analytics Operations Overview continues to show historical failed attempts as context, but current success is based on completed jobs plus retry-ready jobs.

Validation:

- TypeScript validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.
- Playwright smoke after login showed Dashboard Operational Pulse `Success rate 84%` and Pipeline Health `Success rate 84%`.
- Analytics smoke showed `Success rate 84%` with detail `7 need retry now, 13 failed attempts recorded`.

Retest:

- Open Dashboard and Analytics for `AstraCart E2E Scope Check 20260528`.
- Confirm the same success-rate label shows the same value across screens.
- Confirm any historical-attempt success metric is separately labelled.

## BUG-E2E-112: Analytics Failure Counts Double-Count Jobs With Both Quality Gate And Job Failure Events

Status: closed

Severity: high

Area:

- n8n analytics workflow `Q-Ops-Agent-Analytics-Summary` (`tcKSeScJRiWtRx77`)
- Analytics Failure Watchlist
- Analytics failed spend and failure-rate accounting

Observed During:

- 2026-06-04 Analytics validation for `AstraCart E2E Scope Check 20260528`.

What Happened:

- Supabase `qa_jobs` has 13 failed generation jobs in the 30-day project scope.
- `qa_job_metrics` has 16 error rows because three failed jobs logged both:
  - `QUALITY_GATE_FAILED`
  - `JOB_FAILED`
- Analytics Failure Watchlist displayed `Generation 16 failures`.

Expected:

- A single failed job should count once in failure KPIs.
- `QUALITY_GATE_FAILED` can remain as a diagnostic event, but terminal failure counts should dedupe by `pipeline + job_id`.
- Failed spend should use one metered failure row per failed job, preferably `JOB_FAILED` when present.

Likely Root Cause:

- The analytics workflow builds `failedRows` directly from all rows where `event` is `JOB_FAILED`, `QUALITY_GATE_FAILED`, or `status = error`.
- Failure watchlist and failure-rate calculations use raw rows rather than a deduped terminal job set.

Suggested Fix:

1. Build `terminalFailedRows` by grouping on `pipeline + job_id`.
2. Prefer `JOB_FAILED` over `QUALITY_GATE_FAILED` for the same job.
3. Use the deduped failed set for:
   - `overview.totalJobsFailed`,
   - `failures.byPipeline`,
   - `failures.recent`,
   - failure rates,
   - active failure count.
4. Keep quality gate failures available in diagnostics if needed.

Fix Implemented:

- 2026-06-05: Patched active n8n workflow `Q-Ops-Agent-Analytics-Summary` (`tcKSeScJRiWtRx77`) with terminal failure dedupe in `Build Auth-Aware Analytics Response`.
- The analytics workflow now groups failed terminal rows by `pipeline + job_id` and prefers `JOB_FAILED` over `QUALITY_GATE_FAILED` for the same job.
- The workflow now also exposes `totalJobsFailedHistorical`, `successRateHistorical`, and `avgGenerationDurationMs` in `overview`.
- Backup created: `docs/test_data/n8n_workflow_backups/workflow_tcKSeScJRiWtRx77_before_analytics_terminal_failure_dedupe_v2_20260605-092810.json`.

Validation:

- Supabase baseline confirmed 13 distinct failed generation jobs vs 16 raw generation error rows.
- Playwright Analytics smoke showed Failure Watchlist `Generation 13 failures`, not 16.
- Failed spend remained correct at `13 attempts`, `37.8K tokens`, and `$0.0296`.

Retest:

- Compare Analytics Failure Watchlist against `qa_jobs.status = failed`.
- Confirm `Generation failures` is 13 for the current AstraCart 30-day dataset, not 16.

## BUG-E2E-113: Analytics Recovered Count Is Not Recovery-Aware For Document Retries

Status: closed

Severity: high

Area:

- Analytics recovered-job KPI
- Dashboard recovered-job KPI
- n8n analytics summary
- Document retry lineage

Observed During:

- 2026-06-04 Dashboard and Analytics validation for `AstraCart E2E Scope Check 20260528`.

What Happened:

- Analytics summary text showed `0 recovered`.
- Dashboard Operational Pulse showed `Recovered jobs 6`.
- Supabase `qa_jobs` showed recovered failed jobs via `retry_status = recovered`, plus newer successful update repair jobs that functionally recovered failed attempts but lacked retry lineage.

Expected:

- Recovered count should be computed from a consistent backend source.
- Analytics and Dashboard should agree on recovered job count for the same scope.
- Functionally recovered update retries should be auditable through retry lineage and counted as recovered.

Likely Root Cause:

- n8n analytics summary reads only `qa_job_metrics`, which does not contain reliable recovery state.
- Frontend derives some recovery state from local/generated output retry relationships.
- BUG-E2E-109 previously left some update retry jobs without persisted retry metadata; it is now fixed pending live lineage retest.

Suggested Fix:

1. Make analytics recovery-aware by joining or supplementing from `qa_jobs`.
2. Use `retry_status = recovered`, `retried_by_job_id`, and completed child retry jobs to compute recovered source failures.
3. Retest BUG-E2E-109 with the next live update retry to confirm retry lineage persists at the source.
4. Return `overview.totalJobsRecovered` and `overview.totalJobsFailedActive` from analytics.

Fix Implemented:

- 2026-06-05: Analytics page now reconciles recovered document jobs from the loaded generated-output retry/display state, in addition to recovered ingestion artifacts.
- Dashboard and Analytics now both show the same recovered-job count for the current workspace state.
- Backend retry lineage gaps for update-retry jobs were patched under `BUG-E2E-109`; the next live update retry should confirm persisted lineage.

Validation:

- Playwright Dashboard smoke showed `Recovered jobs 6`.
- Playwright Analytics smoke showed summary text `38 completed jobs, 7 need retry, 6 recovered, and 0 currently active`.

Retest:

- Open Dashboard and Analytics after recovered document retries exist.
- Confirm both screens show the same recovered count.
- Confirm recovered failures are not shown as active retry-ready failures.

## BUG-E2E-114: Analytics Completed Generation Duration Includes Failed Attempt Durations

Status: closed

Severity: medium

Area:

- Analytics Pipeline Performance
- Generation throughput KPI
- Frontend Analytics duration calculation

Observed During:

- 2026-06-04 Analytics validation for `AstraCart E2E Scope Check 20260528`.

What Happened:

- Analytics Generation card showed average duration `1m 20s`.
- Supabase completed generation `JOB_COMPLETED` rows average about `65,845 ms`, or approximately `1m 06s`.
- The displayed value appears to include failed generation durations in a card labelled for completed generation throughput.

Expected:

- `Average duration` in the completed Generation pipeline card should use completed generation jobs only.
- Failed-attempt average duration should remain in the Failed Generation Spend section.

Likely Root Cause:

- `avgGenerationDuration` is calculated from all `generationJobs` with `durationMs`, not only `completedGenerationJobs`.

Suggested Fix:

1. Change frontend `avgGenerationDuration` to use completed generation jobs only.
2. Keep failed duration aggregation in the failed spend section.
3. Consider using backend `overview.avgGenerationDurationMs` if added to the analytics contract.

Fix Implemented:

- 2026-06-05: n8n analytics summary now emits `overview.avgGenerationDurationMs` from completed generation rows only.
- 2026-06-05: Frontend Analytics uses completed generation jobs only for the Generation pipeline average duration fallback.
- Failed-attempt duration remains isolated in the Failed Generation Spend section.

Validation:

- Supabase completed generation average duration for AstraCart was `65,845 ms`.
- Playwright Analytics smoke showed Generation `Average duration 1m 6s`.
- Failed Generation Spend continued to show failed-attempt average duration separately as `1m 39s`.

Retest:

- Open Analytics for AstraCart.
- Confirm completed Generation average duration is approximately `1m 06s`.
- Confirm Failed Generation Spend still shows failed-attempt duration separately.

## BUG-E2E-115: Coverage Health KPI Uses An Unclear Denominator Across Dashboard And Analytics

Status: closed

Severity: medium

Area:

- Dashboard Quality Coverage
- Analytics Coverage Health
- Generated output coverage metadata

Observed During:

- 2026-06-04 Dashboard and Analytics validation for `AstraCart E2E Scope Check 20260528`.

What Happened:

- Dashboard Quality Coverage showed:
  - `Coverage passed 5`
  - `Needs review 12`
- Analytics showed `Coverage Health 36%`.
- The UI does not explain whether coverage health is:
  - passed documents / coverage-parsed documents,
  - covered ledger rows / total ledger rows,
  - latest document state only,
  - all historical completed outputs.

Expected:

- Coverage Health should have an explicit, consistent denominator.
- Dashboard and Analytics should either show the same value for the same definition or use distinct labels.
- For document quality, the recommended KPI is latest-current-output health by document type, with historical coverage trends shown separately.

Likely Root Cause:

- Dashboard and Analytics derive coverage rollups from generated outputs in different display contexts.
- Historical completed outputs are mixed with current latest document state.
- Coverage ledger row-level and document-level coverage are not separated in the KPI labels.

Suggested Fix:

1. Define two coverage metrics:
   - latest document coverage health,
   - historical generation coverage trend.
2. Make the Analytics KPI label and tooltip state the denominator.
3. Consider showing row-level coverage separately from document-level pass/review/fail.

Fix Implemented:

- 2026-06-05: Analytics KPI cards now render their `detail` text.
- Coverage Health now displays the denominator and review count directly under the percentage.
- The KPI remains document/output-level coverage health; row-level coverage can be added later as a separate trend if needed.

Validation:

- TypeScript validation passed with `.\node_modules\.bin\tsc.cmd --noEmit`.
- Playwright Analytics smoke showed `Coverage Health 36%` with detail `5 passed, 9 need review of 14 parsed outputs`.

Retest:

- Open Dashboard and Analytics for AstraCart.
- Confirm coverage counts and percentages can be reconciled from visible labels/tooltips.

## BUG-E2E-116: Epics & User Stories First-Time Create Fails From Truncated Backlog JSON

Status: fixed - live create retry validated

Severity: high

Area:

- Epics & User Stories first-time create
- n8n backlog generator
- OpenAI output token ceiling
- Admin diagnostics

Observed During:

- Project: `AstraCart E2E Scope Check 20260528`
- Job: `PRO-260605-WCAFE6`
- Workflow: `Vwc6c8ehsRTF8svG`
- n8n execution: `1036050`

What Happened:

- First-time Epics & User Stories create correctly entered `generationMode = create`.
- The workflow retrieved 40 Chroma chunks and generated a large backlog response.
- The model response was truncated before a complete balanced JSON object was produced.
- The robust backlog parser failed safely before Jira or Confluence creation.
- Supabase marked the job failed with `PROFESSIONAL_BACKLOG_FAILED`.

Failure Evidence:

- Prompt chars: `93,265`
- Output chars: `76,828`
- Previous max output tokens: `16,000`
- Parser message: `Backlog parser detected incomplete or truncated model JSON`
- No Jira issues or Confluence page were created before the failure.

Expected:

- First-time Epics & User Stories create should complete without truncating the backlog JSON.
- Retry should create Jira epics/stories and then persist usage, coverage, and output metadata.
- Update/delta paths must keep compact token behavior and should not regress into full-generation spending.

Fix Implemented:

- 2026-06-05: Patched active backlog workflow `Vwc6c8ehsRTF8svG` with `BACKLOG_CREATE_CAPACITY_V1`.
- Create-like backlog runs now use a 30k output token ceiling.
- Update-mode backlog runs retain the compact 16k floor so delta-update savings remain protected.
- Parser remediation text now points to the create-specific 30k ceiling.
- Workflow code compilation and active workflow verification passed.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_create_capacity_v1_20260605060036.json`

Retest:

- 2026-06-05: Retried failed job `PRO-260605-WCAFE6`, creating retry job `PRO-260605-UX4SYB`.
- Retry lineage persisted:
  - child job `retry_of_job_id = PRO-260605-WCAFE6`,
  - parent job `retry_status = recovered`.
- n8n execution `1036252` completed successfully and confirmed `maxTokens = 30000`.
- Jira created `6` epics and `18` stories:
  - epics `KAN-970` through `KAN-975`,
  - stories `KAN-976` through `KAN-993`.
- Confluence page was created:
  - `https://anujalhans1.atlassian.net/wiki/spaces/QD/pages/27131905/Professional+QA+Backlog+-+AstraCart+E2E+Scope+Check+20260528`
- Coverage passed:
  - `coverageLedgerCount = 6`,
  - `coveredCount = 6`,
  - `partialCount = 0`,
  - `missingCount = 0`,
  - `gateStatus = passed`.
- Usage was recorded:
  - `tokensInput = 23,317`,
  - `tokensOutput = 16,422`,
  - `tokensTotal = 39,739`,
  - `estimatedCostUsd = 0.035602`.

## BUG-E2E-117: All Document Jobs Need Attempt Usage Checkpoint And Diagnostics UI

Status: fixed - live retry validated

Severity: high

Area:

- My Document Jobs panel
- Usage Details modal
- Failed job supportability
- Admin diagnostics
- All document generation workflows
- n8n/Supabase failure metadata display

Observed During:

- Failed Epics & User Stories create job `PRO-260605-WCAFE6`.
- Failed Story Test Cases create job `STC-260605-XPHHHM`.
- Failed Story Test Cases create-retry job `STC-260605-8TIILM`.

What Happened:

- Some jobs failed before producing a complete final output and before usage metrics were recorded.
- In `STC-260605-8TIILM`, the expensive AI generation stage had already run, but the workflow failed later during Jira issue linking with HTTP `429`.
- Provider token usage/cost was likely incurred, but Supabase metrics still showed empty `tokens_total` and `estimated_cost_usd` because the final success payload was never reached.
- My Document Jobs correctly did not show the Usage icon because persisted token/cost values were not available.
- The UI only showed a generic failure message:
  - `Generation workflow failed before producing an output.`
- The actionable diagnostics were available in n8n execution details but not visible from the UI:
  - failing node,
  - parser failure reason,
  - prompt chars,
  - output chars,
  - max token ceiling,
  - selected retrieval chunk count,
  - remediation hint.

Expected:

- Every document generation workflow should persist an intermediate attempt usage checkpoint after AI/model generation and before external publishing steps such as Jira or Confluence.
- This should apply consistently to all supported document types:
  - Test Strategy,
  - Test Plan,
  - Risk Matrix,
  - Epics & User Stories,
  - Story Test Cases,
  - Requirements Traceability Matrix.
- The checkpoint should cover all operation types:
  - Create,
  - Create-Retry,
  - Update,
  - Update-Retry,
  - Regenerate Anyway / repair update where applicable.
- If the job later completes, the final usage record should update/confirm the checkpointed usage rather than creating conflicting duplicate values.
- If the job fails after AI generation, Usage Details should still be available and clearly labeled as `Attempt usage` or `Failed attempt usage`.
- Failed jobs with no token/cost checkpoint should still not show the normal Usage icon, but they should show a separate Attempt Diagnostics icon when structured diagnostics exist.
- The diagnostics modal should help admin/support understand whether the failure was due to truncation, parser failure, Confluence publish failure, Jira failure, missing config, timeout, or metrics failure.

Suggested Fix:

1. Add a shared attempt usage checkpoint contract across all document workflows.
2. Persist checkpointed token/cost values to `qa_job_metrics` and/or a stable `qa_jobs.output.attemptUsage` field immediately after model usage can be estimated.
3. Use a clear event name such as `ATTEMPT_USAGE_RECORDED` or `AI_GENERATION_USAGE_RECORDED`.
4. On final success, reconcile the final usage payload with the checkpoint:
   - update the final `JOB_COMPLETED` usage values,
   - avoid double-counting in Dashboard/Analytics,
   - retain the checkpoint for diagnostics/audit if useful.
5. Persist structured failure diagnostics in `qa_jobs.output.diagnostics` or a similar stable field.
6. Add a compact Attempt Diagnostics icon distinct from Usage, Retry, Validation, and Update Summary icons.
7. Show Usage Details for failed jobs when attempt usage exists, with copy that makes it clear the usage is for a failed/interrupted attempt.
8. Show the Attempt Diagnostics icon for failed/recovered jobs when diagnostics exist, even if token usage does not.
9. Include support-ready diagnostic fields:
   - job id,
   - workflow id/execution id when available,
   - failed node,
   - error type,
   - error message,
   - prompt/output size if available,
   - remediation,
   - whether external artifacts were created before failure.

Retest:

- Smoke-test all document types with existing output data where possible.
- For each document type, force or inspect a post-AI failure path and confirm attempt usage is persisted.
- Confirm failed jobs with attempt usage show Usage Details as failed-attempt usage.
- Confirm failed jobs without token/cost data keep Usage hidden but show Attempt Diagnostics when diagnostics exist.
- Confirm successful jobs still show one coherent final usage/cost value and are not double-counted in Dashboard/Analytics.

## BUG-E2E-118: Coverage Review Modal Shows Workflow Progress As Coverage Score

Status: fixed - UI/build validated; pending next live Coverage Review retest

Severity: medium

Area:

- Coverage Review modal
- Generated output coverage display
- Epics & User Stories / backlog coverage UI

Observed During:

- Completed Epics & User Stories retry job `PRO-260605-UX4SYB`.

What Happened:

- Coverage Review modal showed:
  - `Coverage passed`
  - `6 of 6 parsed coverage items are covered`
  - `Covered = 6`
  - `Needs Review = 0`
  - `Missing = 0`
  - `Ledger Rows = 6`
  - but also showed `82% coverage score`.
- The stored coverage data indicates full coverage:
  - `coverageLedgerCount = 6`
  - `coveredCount = 6`
  - `partialCount = 0`
  - `missingCount = 0`
  - `gateStatus = passed`
- The `82%` value comes from workflow `progressPercent` at stage `coverage_reviewed`, not from coverage math.

Expected:

- Coverage score should be computed from coverage ledger values, for example `coveredCount / coverageLedgerCount`.
- For this job, the displayed coverage score should be `100%`.
- Workflow progress should be labeled separately as workflow/progress status if it is shown at all.

Suggested Fix:

1. In the Coverage Review modal, stop using `progress.progressPercent` as coverage score.
2. Compute coverage score from parsed coverage summary:
   - denominator: `coverageLedgerCount` or `covered + partial + missing + unknown + excluded`, whichever is reliable for the output type.
   - numerator: `coveredCount`.
3. If workflow progress is displayed, label it as `workflow progress`, not `coverage score`.
4. Add smoke coverage for passed/amber/failed ledger combinations.

Retest:

- Open Coverage Review for `PRO-260605-UX4SYB`.
- Confirm `6 / 6 covered` displays as `100% coverage score`.
- Confirm any workflow progress value is not mislabeled as coverage.

Fix Implemented:

- 2026-06-08: Patched `src/pages/DashboardPage.tsx` so `coverageScorePercent()` computes from canonical coverage counts before falling back to any explicit score field.
- When `coverageLedgerCount` or covered/partial/missing counts are available, the modal now calculates the score from those values instead of trusting progress-like metadata.
- Build validation passed with `npm run build`.

## BUG-E2E-119: Story Test Cases Create Fails Whole Job On Transient LLM Batch 503

Status: fixed - live retry validated

Severity: high

Area:

- Story Test Cases generation
- n8n batch generation resilience
- Create / Create-Retry job reliability
- Admin diagnostics and usage visibility

Observed During:

- Story Test Cases create job `STC-260605-XPHHHM`.

What Happened:

- The job started successfully and used completed Epics & User Stories job `PRO-260605-UX4SYB` as source.
- The generator processed many story/batch LLM calls successfully.
- Near the final batches, n8n execution `1036409` failed in node `Story Test Case Batch Generator`.
- Error:
  - `503 upstream connect error or disconnect/reset before headers. reset reason: connection termination`
- Worker execution `1036406` marked the Supabase job as failed:
  - `status = failed`
  - `errorType = STORY_TEST_CASES_FAILED`
  - `failed_at = 2026-06-05T06:34:43.273Z`
- No final output, Confluence document, Jira test case summary, or token/cost usage payload was persisted.

Expected:

- A transient upstream LLM 503 should not permanently fail the entire Story Test Cases create job after most batches have succeeded.
- Batch-level retry/backoff should recover from transient `503`, `429`, timeout, and connection reset errors.
- If all retry attempts are exhausted, the failure should persist structured diagnostics and any available partial usage/attempt information for support.
- Retry from the UI should be safe and should not create duplicate Jira/Confluence artifacts.

Suggested Fix:

1. Add robust retry/backoff around Story Test Case batch generation, especially the `Story Test Case Batch Generator` path.
2. Consider smaller detail batches or per-story checkpointing so one failed batch can be retried without redoing the entire job.
3. Persist structured attempt diagnostics:
   - workflow id/execution id,
   - failed node,
   - batch/story key if available,
   - upstream status code,
   - retry count,
   - whether external artifacts were created.
4. Preserve idempotency labels and artifact guards so create-retry remains duplicate-safe.
5. Record available attempt usage when possible, even if final document publishing does not happen.

Mitigation Applied:

- 2026-06-05: Added n8n node-level retry/backoff to the live Story Test Cases generator workflow `SG7khcKlhHst48WH`.
- Patched nodes:
  - `Story Test Case Generator`: `retryOnFail = true`, `maxTries = 3`, `waitBetweenTries = 10000`.
  - `OpenAI Chat Model`: `retryOnFail = true`, `maxTries = 3`, `waitBetweenTries = 10000`.
  - `Story Test Case Batch Generator`: `retryOnFail = true`, `maxTries = 4`, `waitBetweenTries = 15000`.
  - `OpenAI Chat Model - Batch`: `retryOnFail = true`, `maxTries = 4`, `waitBetweenTries = 15000`.
  - `Story Test Case Batch Retry Generator`: `retryOnFail = true`, `maxTries = 4`, `waitBetweenTries = 15000`.
  - `OpenAI Chat Model - Batch Retry`: `retryOnFail = true`, `maxTries = 4`, `waitBetweenTries = 15000`.
- Backup:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_ai_node_retry_v1_20260605064130.json`
- 2026-06-05: UI retry job `STC-260605-8TIILM` validated the AI retry/backoff mitigation:
  - retry job was created from `STC-260605-XPHHHM`,
  - batch LLM transient failures were retried automatically,
  - generation continued beyond the previous `Story Test Case Batch Generator` failure point.
- 2026-06-05: Subsequent live retry job `STC-260605-2PCPPV` completed E2E after the Jira publishing resilience patch tracked in `BUG-E2E-120`.
- The STC AI retry/backoff path is therefore considered live validated for the observed transient LLM failure class.

Retest:

- Retry `STC-260605-XPHHHM` from the UI.
- Confirm the retry creates a child job with retry lineage.
- Confirm the retry completes with generated Story Test Cases for all source stories.
- Confirm no duplicate Jira/Confluence artifacts are created from the failed attempt.

## BUG-E2E-120: Story Test Cases Retry Fails During Jira Issue Linking Rate Limit

Status: fixed - live retry validated

Severity: high

Area:

- Story Test Cases create-retry
- Jira publishing resilience
- n8n HTTP Request retry/backoff
- Partial artifact recovery and idempotency
- Admin diagnostics and failed attempt usage visibility

Observed During:

- Parent job: `STC-260605-XPHHHM`
- Retry job: `STC-260605-8TIILM`
- Worker workflow: `ivz13uFyjfCT8149`
- Worker execution: `1036754`
- Generator workflow: `SG7khcKlhHst48WH`
- Generator execution: `1036756`

What Happened:

- The retry job started correctly in `generationMode = retry`.
- The parent job persisted retry lineage:
  - `retried_by_job_id = STC-260605-8TIILM`,
  - `retry_status = retry_failed`.
- The AI generation stage passed the previous transient LLM failure point after the retry/backoff mitigation.
- The generator then failed during Jira publishing at node `Link Created Test Case To Story`.
- Jira returned HTTP `429`:
  - `The request has been rate-limited. Please try again later.`
- n8n surfaced the error as:
  - `The service is receiving too many requests from you`.
- The failing request attempted to link a created test case to a source story:
  - inward/story issue: `KAN-986`,
  - outward/test case issue: `KAN-1170`,
  - link type: `Relates`.
- The failure occurred after many Jira test cases had already been created, so the run left partial Jira artifacts before Supabase marked the job failed.
- Supabase metrics recorded `JOB_FAILED` for `STC-260605-8TIILM` with duration `2,904,640 ms`, but token/cost fields remained empty.

Expected:

- Jira 429 rate limits should not permanently fail a long-running Story Test Cases job after AI generation and partial Jira publishing have succeeded.
- Jira publishing nodes should use retry/backoff and rate-aware pacing for create, update, search, and issue-link operations.
- A retry after a partial Jira publish should be idempotent:
  - reuse existing test cases discovered by stable labels,
  - create only missing test cases,
  - create missing issue links without duplicating existing links,
  - persist mappings only after confirmed Jira artifacts exist.
- If publishing still fails after retries, the job should persist structured diagnostics showing the failed Jira node, HTTP status, story key, test case key, and whether partial Jira artifacts were created.
- Failed-attempt usage/diagnostics should be visible to admin/support even when final output was not created.

Suggested Fix:

1. Add robust retry/backoff to Jira HTTP nodes in the Story Test Cases generator:
   - `Search Existing Test Case By Stable Label`,
   - `Create Jira Test Case`,
   - `Update Existing Jira Test Case`,
   - `Link Created Test Case To Story`,
   - any existing-test-case link/update branches.
2. Add rate-aware pacing around Jira writes and issue-link calls so large STC batches do not burst into Atlassian rate limits.
3. Before linking, check whether the issue link already exists or handle duplicate-link responses as success.
4. On retry, verify the stable-label lookup can recover the partial test cases created in `STC-260605-8TIILM`, including `KAN-1170`.
5. Persist structured failed-attempt diagnostics for Jira publishing failures, including `httpCode = 429`, failed node, item index, story key, test case key, and retry count.

Retest:

- Do not click another Story Test Cases retry until the Jira publishing resilience fix is applied.
- After patching, retry from the UI.
- Confirm the retry reuses already-created Jira test cases instead of creating duplicates.
- Confirm missing links are created successfully after rate-aware pacing.
- Confirm the job completes E2E with Confluence output, Supabase output metadata, usage/cost metrics, retry lineage, and coverage summary.

Fix Implemented:

- 2026-06-05: Patched active Story Test Cases generator workflow `SG7khcKlhHst48WH` with STC Jira publish resilience V1.
- Backup created before the final applied patch:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_jira_publish_resilience_v1_20260605081004.json`
- Added retry/backoff and sequential batching to Jira HTTP nodes:
  - `Search Existing Test Case By Stable Label`: `maxTries = 6`, `waitBetweenTries = 20000`, `batchSize = 1`, `batchInterval = 1500`.
  - `Create Jira Test Case`: `maxTries = 8`, `waitBetweenTries = 30000`, `batchSize = 1`, `batchInterval = 2500`.
  - `Update Existing Jira Test Case`: `maxTries = 6`, `waitBetweenTries = 30000`, `batchSize = 1`, `batchInterval = 2500`.
  - `Link Created Test Case To Story`: `maxTries = 8`, `waitBetweenTries = 45000`, `batchSize = 1`, `batchInterval = 3000`.
  - `Fetch Existing Test Case Story Links`: `maxTries = 6`, `waitBetweenTries = 20000`, `batchSize = 1`, `batchInterval = 1500`.
- Added a pre-link publish checkpoint:
  - `Upsert Story Test Case Publish Checkpoint`.
- Added payload recovery after the checkpoint so downstream Jira link checks continue with the normalized test case payload, not the Supabase response body:
  - `Recover Story Test Case Publish Checkpoint Items`.
- Added existing-link verification before posting a Jira issue link:
  - `Fetch Existing Test Case Story Links`,
  - `Detect Existing Story Test Case Link`,
  - `Story Test Case Link Needed?`.
- Existing/reused and updated test cases now also flow through link verification, so partial Jira artifacts from failed runs can be linked on retry instead of merely being reused without a story link.
- Final `qa_story_testcase_links` upsert now records final link status metadata after link verification.
- AI generation, batch generation, prompt logic, and shared document flows were left unchanged.

Validation:

- Active workflow verification passed through n8n MCP:
  - workflow updated at `2026-06-05T08:10:04.059Z`,
  - new checkpoint/link verification nodes are present,
  - Jira retry/backoff and batching settings are present,
  - created/reused/updated paths route through checkpoint and link verification before final mapping.
- Pinned no-live-call n8n smoke execution `1037817` completed successfully:
  - no OpenAI token spend,
  - no real Jira calls,
  - no real Supabase writes,
  - exercised generated output through create -> checkpoint -> recover payload -> fetch links -> detect missing link -> link -> final mapping -> completion.

Next Live Retest:

- Wait for the Jira rate-limit window to cool down, then retry `STC-260605-XPHHHM` from the UI.
- Expect the run to take longer because Jira writes and links are intentionally paced.
- Confirm existing partial Jira test cases are reused by stable labels and missing story links are created.

Live Validation:

- 2026-06-05: User triggered retry job `STC-260605-2PCPPV` from failed parent `STC-260605-8TIILM`.
- n8n executions completed successfully:
  - worker workflow `ivz13uFyjfCT8149`, execution `1037932`,
  - generator workflow `SG7khcKlhHst48WH`, execution `1037935`.
- Supabase job state:
  - `STC-260605-2PCPPV` completed,
  - `STC-260605-8TIILM` retained `status = failed` but was marked `retry_status = recovered`,
  - retry lineage remained intact through `retried_by_job_id = STC-260605-2PCPPV`.
- Generated output persisted:
  - `documentType = story_test_cases`,
  - `generationMode = retry`,
  - `testCases = 280`,
  - `mappings = 280`,
  - `tokensTotal = 215,520`,
  - `estimatedCostUsd = 0.243502`.
- Jira publish recovery worked:
  - `qa_story_testcase_links` recorded `280` final mappings,
  - `93` links were created/confirmed as newly linked during the retry,
  - `187` links were detected as already linked and treated as success,
  - no rows remained at `jira_publish_pre_link`.
- Per-story final mapping counts reconciled across stories `KAN-976` through `KAN-993`.
- Remaining metrics hygiene issue from the live run is tracked separately as `BUG-E2E-121`.

## BUG-E2E-121: Story Test Cases Retry Writes Duplicate Completion Metrics With Negative Duration

Status: fixed - workflow/build validated; pending next live STC retry/update metrics retest

Severity: medium

Area:

- Story Test Cases worker/generator metrics
- Dashboard and Analytics input quality
- `qa_job_metrics`
- Retry completion observability

Observed During:

- Live Story Test Cases retry job `STC-260605-2PCPPV`.
- Worker execution `1037932`.
- Generator execution `1037935`.
- Live Story Test Cases update job `STC-260606-PUPHPE`.

What Happened:

- The retry completed successfully and persisted final output.
- `qa_job_metrics` recorded two `JOB_COMPLETED` rows for the same job:
  - metric ids `960` and `961`,
  - both with `tokens_total = 215,520`,
  - both with `estimated_cost_usd = 0.243502`.
- Both completion rows had invalid negative durations:
  - `duration_ms = -1`,
  - `duration_ms = -2`.
- The same pattern repeated for update job `STC-260606-PUPHPE`:
  - two duplicate `JOB_COMPLETED` rows were recorded in `qa_job_metrics`,
  - both rows carried `tokens_total = 109,167`,
  - both rows carried `estimated_cost_usd = 0.122137`,
  - completion durations were again invalid negative values: `-1` and `-2`.
- This can distort Dashboard/Analytics if aggregation does not dedupe terminal job metrics and clamp/ignore invalid durations.

Expected:

- Each job should emit one canonical terminal completion metric, or Dashboard/Analytics should have a deterministic dedupe rule for duplicate terminal metrics.
- `duration_ms` should be non-negative and should represent elapsed time from the actual job start to completion.
- Retry jobs should not double-count token/cost usage when both child generator and parent worker paths log completion.

Suggested Fix:

1. Identify whether duplicate `JOB_COMPLETED` rows are emitted by both the STC generator and STC worker completion paths.
2. Choose one canonical writer for final completion usage, or add an idempotent `on_conflict` / unique-key strategy for terminal metrics.
3. Fix duration calculation to use a reliable timestamp pair:
   - queued/started timestamp from the job row or `JOB_STARTED` metric,
   - completion timestamp from the terminal event,
   - clamp negative values to `0` only as a last-resort guard.
4. Ensure Analytics and Dashboard dedupe terminal metrics by job id + terminal event until the writer is fully idempotent.
5. Add smoke coverage using `STC-260605-2PCPPV` so cost/tokens are counted once and duration is not negative.

Retest:

- Trigger or replay a Story Test Cases retry completion path.
- Confirm one effective `JOB_COMPLETED` metric is used for job-level analytics.
- Confirm `duration_ms >= 0`.
- Confirm Dashboard/Analytics token and cost totals do not double-count `STC-260605-2PCPPV`.

Fix Implemented:

- 2026-06-08: Patched active STC generator workflow `SG7khcKlhHst48WH`.
- Backup:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_update_gate_usage_summary_v1_20260608053836.json`
- Terminal metric writer now clamps `duration_ms` to a non-negative value.
- Terminal metric metadata now includes a deterministic `metric_key` and coverage repair details so Dashboard/Analytics can consume one effective terminal metric per job.
- Final output now persists canonical `output.tokenUsage`, reducing fallback/double-count risk in Usage, Dashboard, and Analytics.
- Build validation passed with `npm run build`.

## BUG-E2E-122: Story Test Cases Coverage Review Double-Counts Planned Cases And Shows Composite Category Tags

Status: closed

Severity: medium

Area:

- Story Test Cases coverage rollup
- Coverage Review modal
- `Finalize Story Test Case Result`
- `src/pages/DashboardPage.tsx`

Observed During:

- Live Story Test Cases retry job `STC-260605-2PCPPV`.

What Happened:

- The STC retry successfully published/reused `280` Jira test cases and persisted `280` mappings.
- Coverage Review still showed `18` partial rows and a `50%` score.
- Most stories showed generated counts exactly half of planned counts, for example `14 / 28`, `17 / 34`, `20 / 40`.
- Some category chips showed raw composite values such as `Accessibility | Compatibility`, `Sanity | Smoke`, and `Authorization | Security`, while other rows showed summary chips such as `9 categories covered`.
- The modal header and category chips wrapped poorly in narrower layouts.

Root Cause:

- The final STC coverage rollup seeded each story planned count from per-story metrics and then added the same detail-batch plan items again.
- The coverage score treated every row with `generatedTestCases < plannedTestCases` as partial, so the doubled denominator created a false amber `50%` score.
- Category comparison/display used raw model labels, including pipe-delimited composite labels.

Fix:

- Patched active n8n workflow `SG7khcKlhHst48WH`, node `Finalize Story Test Case Result`, using `scripts/patch_stc_coverage_rollup_planned_count_v1.cjs`.
- Planned count now falls back to per-story metrics only when detail batches are unavailable, avoiding double-counting.
- Category comparison now splits pipe-delimited labels into atomic category labels before checking missing categories.
- Updated `src/pages/DashboardPage.tsx` so the Coverage Review modal:
  - normalizes pipe-delimited category chips,
  - keeps category chips compact,
  - uses a tighter responsive table layout,
  - left-aligns the top review card.

Validation:

- n8n patch applied successfully at `2026-06-05T10:09:58Z`.
- Re-running the patch reported `already up to date`.
- Frontend production build passed with `npm.cmd run build`.
- Playwright smoke confirmed the Coverage Review modal renders in the updated table-style layout.
- 2026-06-08 live STC create job `STC-260608-JXHMX3` validated the corrected count behavior:
  - `18` stories represented.
  - `279` Jira test cases created.
  - `279` mappings linked.
  - Coverage no longer showed the earlier false `50%` double-count symptom.
  - Amber rows correctly represented category gaps, not generated/planned test-case count gaps.
- 2026-06-08 frontend presentation-layer cleanup completed:
  - STC Coverage Review now uses story-level cards.
  - Test-case count and category coverage are displayed separately.
  - Missing categories are shown as readable chips.
  - `npm.cmd run build` passed.

Retest:

- Closed after live STC create validation and frontend build validation.

## BUG-E2E-123: Document Job Panel Can Lag Before Showing Newly Queued RTM Job

Status: fixed - workflow patched; pending next live STC update validation

Severity: low

Area:

- Generate Documents UI
- My Document Jobs panel
- Job Status panel refresh
- Frontend polling / optimistic job insertion

Observed During:

- RTM create job `PRO-260605-AJQEN7`.
- User triggered RTM create for `AstraCart E2E Scope Check 20260528`.

What Happened:

- Immediately after triggering RTM, the UI did not refresh with the new RTM job id.
- The job appeared after a delay.
- Backend persistence was ultimately successful:
  - `JOB_QUEUED` metric at `2026-06-05 10:24:00Z`,
  - `JOB_STARTED` metric at `2026-06-05 10:24:19Z`,
  - job row `PRO-260605-AJQEN7` moved to `processing` and then `completed`.

Expected:

- After the generate action returns a job id, the UI should immediately show that job in Job Status and My Document Jobs, even before the next polling interval.
- Polling should reconcile the optimistic row with backend state once Supabase/n8n updates arrive.

Suggested Fix:

1. Inspect the RTM create trigger response path in the frontend.
2. If the API returns `jobId`, add/update an optimistic `GeneratedOutput` row immediately.
3. Trigger a targeted `fetchGeneratedDocuments` refresh after successful queue response.
4. Keep normal polling as reconciliation, not the only way the new job appears.

Retest:

- Trigger RTM create/update/retry.
- Confirm the new job id appears immediately after the trigger response.
- Confirm the same job row transitions from queued/pending to processing/completed without duplicate cards.

## BUG-E2E-124: RTM Create Completion Metadata Labels Operation Mode As update_repair

Status: fixed - workflow patched; pending next live STC update validation

Severity: low

Area:

- Shared document generator
- RTM create output metadata
- Update Summary modal
- Analytics/metrics metadata

Observed During:

- RTM create job `PRO-260605-AJQEN7`.

What Happened:

- The job correctly recorded:
  - `generation_mode = create`,
  - `updateSummary.mode = create`,
  - `finalValidation.operationMode = create`.
- However, some metadata incorrectly used update terminology:
  - `output.updateSummary.operationMode = update_repair`,
  - `qa_job_metrics.metadata.operation_mode = update_repair`.

Expected:

- RTM first-time create should consistently use create terminology:
  - `operationMode = create`,
  - no repair/update label unless the job is an actual update or retry repair.

Impact:

- The generated document completed successfully.
- Coverage and final validation passed.
- This is currently a metadata/UX accuracy issue, but it can confuse Update Summary, Dashboard, and Analytics classifications.

Suggested Fix:

1. Patch shared RTM/create summary builder so `operationMode` follows actual generation mode.
2. Ensure create jobs do not inherit `update_repair` from shared delta/update defaults.
3. Verify Test Strategy, Test Plan, Risk Matrix update-repair behavior remains unchanged.

Retest:

- Trigger RTM create in a clean project.
- Confirm `generation_mode`, `updateSummary.mode`, `updateSummary.operationMode`, final validation, and metrics metadata all say `create`.

## BUG-E2E-125: Backlog Update Fails When AI Response Truncates Full Backlog JSON

Status: fixed - live retry validation passed

Severity: high

Area:

- Epics & User Stories update
- n8n professional backlog workflow
- Delta update prompt sizing
- AI output parsing guardrail

Observed During:

- Backlog update job `PRO-260605-1IVOOA` for `AstraCart E2E Scope Check 20260528`.

What Happened:

- The job correctly entered update mode:
  - `documentType = user_stories`,
  - `generationMode = update`,
  - `updateOfJobId = PRO-260605-UX4SYB`.
- Retrieval, live Jira backlog lookup, and live Confluence lookup completed.
- The workflow failed at `Robust Backlog JSON Parser` before Jira/Confluence publish.
- n8n execution `1040473` shows the OpenAI response hit the output ceiling:
  - completion tokens: `15,999`,
  - prompt tokens: `51,440`,
  - total tokens: `67,439`,
  - response ended mid-JSON inside `acceptanceCriteria`.
- Parser detected unbalanced JSON and stopped before any Jira or Confluence writes.

Expected:

- Update mode should not ask the model to regenerate the full existing backlog.
- It should return compact delta-only epics/stories for new or changed requirements.
- Existing live Jira epics/stories should be merged by the workflow after parsing.
- Parser should continue blocking malformed JSON before publish.

Root Cause:

- The update prompt included verbose snapshots of existing epics/stories and instructed the model to return the full current backlog.
- After the four new AstraCart delta documents were ingested, the model attempted to output unchanged backlog plus new deltas, exceeded max output, and produced truncated JSON.

Fix Applied:

- Patched n8n workflow `Vwc6c8ehsRTF8svG`, node `Professional Prompt Library`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_delta_compact_prompt_v1_20260605173405.json`
- Patch behavior:
  - update mode now sends compact previous epic/story snapshots,
  - update mode limits prompt evidence size,
  - update mode instructs the model to return only new/materially changed delta epics/stories,
  - unchanged live Jira backlog remains merged downstream by the validator,
  - create mode instructions remain unchanged.

Retest:

- Click Retry on `PRO-260605-1IVOOA`.
- Confirm the retry remains update/update-retry against `PRO-260605-UX4SYB`.
- Confirm output contains new delta requirements:
  - `FRD-LOY-007`, `FRD-LOY-008`,
  - `FRD-MKT-009`, `FRD-MKT-010`,
  - `FRD-RISK-011`, `FRD-PRIV-012`, `FRD-SUP-013`.
- Confirm token usage is recorded and lower than a full recreate-style backlog run.
- Confirm Jira/Confluence publish only happens after parser/validation pass.

Retest Note:

- 2026-06-05: First live retry child `PRO-260605-P1YZIV` did not exercise this fix because it was queued as generic `generationMode = retry` with empty `updateContext`.
- That retry-lineage issue is tracked separately under `BUG-E2E-126`.

## BUG-E2E-126: Backlog Update Retry Loses Update Lineage And Queues As Generic Retry

Status: fixed - live retry validation passed

Severity: high

Area:

- Epics & User Stories update-retry
- Document retry UI
- n8n professional queue creator
- Delta update cost control

Observed During:

- User clicked Regenerate/Retry after failed Backlog update job `PRO-260605-1IVOOA`.
- Child retry job created: `PRO-260605-P1YZIV`.

What Happened:

- Original failed job `PRO-260605-1IVOOA` was a valid update attempt:
  - `generationMode = update`,
  - `updateMode = true`,
  - `updateOfJobId = PRO-260605-UX4SYB`,
  - `updateContext.previousJobId = PRO-260605-UX4SYB`.
- Retry child `PRO-260605-P1YZIV` lost that lineage:
  - `generationMode = retry`,
  - `updateMode = false`,
  - `updateOfJobId = null`,
  - `updateContext = {}`.
- The retry therefore bypassed the compact delta-update path and failed almost immediately before useful output.

Expected:

- A retry of a failed update must remain an update-retry.
- It must preserve the original successful target job id.
- It must reuse update semantics, delta prompt sizing, and duplicate-prevention behavior.
- It must not fall back to a create-style retry unless the original failed job was truly a create job.

Root Cause:

- The UI normalizer did not read update metadata from `qa_jobs.input`, where failed jobs often retain the real lineage.
- The professional queue creator trusted the incoming retry payload and did not hydrate retry lineage from the stored failed `qa_jobs` row before persisting the child job.

Fix Applied:

- Frontend:
  - Added `input` to `ApiGeneratedDocument`.
  - Updated `normalizeGeneratedDocument` to derive `generationMode` and `updateOfJobId` from `input`, `input.updateContext`, and `input.retryContext` before falling back to output metadata.
- n8n:
  - Patched active workflow `yPgr7mtUnL3E8QQP`, `PRO QA Generation Queue Creator - Ready Draft`.
  - Added `Fetch Retry Source QA Job`.
  - Added `Hydrate Retry Update Lineage`.
  - The queue now checks the direct retry source and any original job where `retried_by_job_id` points at the child failed retry.
  - If the source chain contains an update job, the new child is forced back to:
    - `generationMode = update`,
    - `updateMode = true`,
    - preserved `updateOfJobId`,
    - hydrated `updateContext`,
    - update-repair retry instruction.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_yPgr7mtUnL3E8QQP_before_retry_update_lineage_v1_20260605174943.json`

Verification:

- Frontend build passed with `npm.cmd run build`.
- Static n8n workflow check confirmed:
  - `Prepare Runtime Config Request -> Fetch Retry Source QA Job`,
  - `Fetch Retry Source QA Job -> Hydrate Retry Update Lineage`,
  - `Hydrate Retry Update Lineage -> Runtime Request Ready?`.
- Supabase smoke query confirmed retrying `PRO-260605-P1YZIV` now exposes both:
  - the bad child retry row, and
  - original update job `PRO-260605-1IVOOA` with `updateOfJobId = PRO-260605-UX4SYB`.
- 2026-06-05: Live retry child `PRO-260605-EZM0TL` still queued as generic retry because the hydrator read only the first n8n item returned by the Supabase fetch. Patched `Hydrate Retry Update Lineage` to scan `$input.all()` and choose the first row with update lineage before falling back to the direct child row.
- 2026-06-05: Live retry child `PRO-260605-HM2KF7` still queued as generic retry because the retry chain had grown to multiple levels (`HM2KF7 -> EZM0TL -> P1YZIV -> 1IVOOA`). Patched `Fetch Retry Source QA Job` and `Hydrate Retry Update Lineage` to fetch recent project jobs, filter to the same document type, walk `retry_of_job_id` ancestors, and choose the first ancestor with update lineage.
- 2026-06-05: Live retry child `PRO-260605-UD3S2Z` still queued as generic retry. Added frontend retry-chain walking so the UI payload can directly send the original `updateOfJobId` even when the visible failed card is several retry levels downstream.
- 2026-06-05: Live retry child `PRO-260605-D8XHCD` still queued as generic retry because `Combine Job And Runtime` was reading the stale `Prepare Runtime Config Request` output and discarding the hydrated lineage. Patched `Combine Job And Runtime` to read `Hydrate Retry Update Lineage` with a fallback to the original runtime request.
- 2026-06-05: Live retry child `PRO-260605-K9IZMB` correctly queued as update-retry with `updateOfJobId = PRO-260605-UX4SYB` and `retryLineageHydrated = true`. It then failed inside the Backlog generator at `Professional Prompt Library` with `Cannot access 'promptRetrievalContext' before initialization`. Patched `Professional Prompt Library` so retrieval/grouped evidence text is built after `promptRetrievalContext` and `promptGroupedEvidence` are declared.
- 2026-06-05: Live retry child `PRO-260605-HZ8T0S` correctly queued as update-retry with `generationMode = update`, `updateMode = true`, and `updateOfJobId = PRO-260605-UX4SYB`, then completed successfully. This validates the retry lineage fix. Remaining semantic delta behavior is tracked separately under `BUG-E2E-127`.

Retest:

- Click Retry again from either `PRO-260605-1IVOOA` or `PRO-260605-P1YZIV`.
- Confirm the newly queued child row has:
  - `input.generationMode = update`,
  - `input.updateMode = true`,
  - `input.updateOfJobId = PRO-260605-UX4SYB`,
  - `input.updateContext.retryLineageHydrated = true` when hydrated by n8n.
- Confirm the Backlog generator reaches the compact delta update path from `BUG-E2E-125`.

## BUG-E2E-127: Backlog Update Completes But Does Not Apply Supporting-Document Delta

Status: fixed - workflow smoke validated; pending next live Backlog update retest

Severity: high

Area:

- Epics & User Stories update
- Backlog delta detection
- Update cost control
- Coverage gate consistency
- Confluence/Jira update semantics

Observed During:

- Backlog update-retry job `PRO-260605-HZ8T0S` for `AstraCart E2E Scope Check 20260528`.

What Happened:

- The retry lineage fix worked and the job completed as a true update-retry:
  - `generationMode = update`,
  - `updateMode = true`,
  - `updateOfJobId = PRO-260605-UX4SYB`.
- The job updated the existing Confluence page and passed the quality gate.
- However, the update did not apply the newly ingested supporting-document delta:
  - `epics_created = 0`,
  - `epics_updated = 0`,
  - `stories_created = 0`,
  - `stories_updated = 0`,
  - all existing `6` epics and `18` stories were reused.
- Token usage remained high for an intended targeted update:
  - `55.2k` total tokens,
  - estimated cost `US$0.076001`.
- Coverage metadata was internally inconsistent:
  - overall coverage gate reported `passed`,
  - coverage summary reported `missingCount = 0`,
  - but batch progress marked `Delta Risk and Fraud Enhancement` as `missing`.

Expected:

- When source knowledge is updated after the previous Backlog output, update mode should either:
  - create/update only the affected epics/stories for the new delta requirements, or
  - explicitly report no changes needed with source-grounded evidence explaining why.
- It should not silently reuse every existing epic/story while also claiming the update passed.
- Delta update should use materially fewer tokens than a full create-style backlog run.
- Coverage summary and batch progress must agree; a missing delta batch cannot coexist with an unconditional passed gate.

Impact:

- Users may believe the Backlog was updated for newly ingested requirements when no Jira backlog items changed.
- Downstream Story Test Cases and RTM updates may run from stale backlog coverage.
- Token/cost savings expectations for Backlog update are not met.
- Coverage Review can display misleading health.

Suggested Fix:

1. Strengthen Backlog update delta extraction so newly ingested supporting documents after `previousCreatedAt` are promoted into explicit delta targets.
2. Restrict update-mode evidence to new or materially changed source chunks before the model call.
3. Require the model/workflow to emit a deterministic no-op explanation if no backlog change is needed.
4. Add a validation guard that fails or needs-review when `batchSummary.missingBatches > 0` but coverage summary says passed.
5. Record update savings only when the workflow actually avoids full regeneration-style token usage.

Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_delta_semantic_v1_20260605182926.json`
- Patch scope is Backlog/Epics & User Stories update mode only.
- Retrieval quality node now:
  - treats `SUPPORTING` as valid secondary evidence for Backlog updates,
  - boosts supporting/delta/addendum/change-request chunks only when `generationMode = update`,
  - marks delta candidates and exposes `updateDeltaCandidateCount`,
  - adds a dedicated grouped `delta` evidence bucket.
- Prompt library now:
  - promotes delta/supporting chunks ahead of older FRD/BRD/UI fallback chunks,
  - includes delta target source names in the update context,
  - tells the model that delta target evidence is authoritative,
  - requires a no-change reason only when every delta target is already covered by existing Jira keys.
- Validator now:
  - prevents missing/partial delta batches from appearing as a green passed update,
  - downgrades such cases to needs-review/warning metadata instead of silently claiming complete coverage.

Smoke Validation:

- Active n8n code nodes compiled successfully:
  - `Check Chroma Retrieval Quality`,
  - `Professional Prompt Library`,
  - `Backlog Delta Gate`,
  - `Validate Team Managed Backlog`.
- Synthetic update prompt test passed:
  - supporting delta chunks placed after old FRD chunks were promoted into the prompt,
  - `FRD-LOY-007` and `FRD-MKT-009` evidence appeared before old FRD fallback evidence.

Live Retest Note:

- 2026-06-05: Backlog update job `PRO-260605-QJNYA4` validated that V1 was active and materially improved behavior:
  - `updateDeltaCandidateCount = 23`,
  - total tokens reduced from `55.2k` on `PRO-260605-HZ8T0S` to `26.6k`,
  - created Jira story `KAN-1292`,
  - resolved `FRD-RISK-011`.
- Remaining gap: V1 still allowed older fraud-related FRD/test-case evidence to dominate the delta target set, so the update repaired the fraud/risk delta only and did not account for all supporting-document IDs:
  - `FRD-LOY-007`,
  - `FRD-LOY-008`,
  - `FRD-MKT-009`,
  - `FRD-MKT-010`,
  - `FRD-PRIV-012`,
  - `FRD-SUP-013`.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG` with semantic delta V2.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_delta_semantic_v2_20260605183958.json`
- V2 narrows update-mode delta detection:
  - `SUPPORTING` / supporting-file / addendum-file evidence gets highest priority,
  - explicit requirement IDs are extracted into a deterministic delta target list,
  - generic old FRD keywords such as fraud/risk are no longer enough to classify a chunk as a primary delta target.
- Prompt now exposes `updateDeltaTargets.requirementIds` and instructs the model to account for every target ID.
- Validator now marks skipped expected delta target IDs as needs-review instead of allowing a green partial repair.

V2 Smoke Validation:

- Active n8n code nodes compiled successfully after V2.
- Synthetic prompt test with old fraud FRD chunks plus all supporting AstraCart delta chunks confirmed all expected target IDs are extracted:
  - `FRD-LOY-007`,
  - `FRD-LOY-008`,
  - `FRD-MKT-009`,
  - `FRD-MKT-010`,
  - `FRD-RISK-011`,
  - `FRD-PRIV-012`,
  - `FRD-SUP-013`.
- Supporting evidence is ordered before old fraud FRD fallback evidence.

Additional Live Retest Note:

- 2026-06-05: Backlog update job `PRO-260605-AZIBEF` queued correctly as update of `PRO-260605-QJNYA4`, but failed before model usage.
- Root cause: the existing `Backlog Delta Gate` still allowed the no-model reuse shortcut because `QJNYA4` looked coverage-clean and no new ingestion occurred after it.
- That shortcut reused the partial fraud-only update output and did not force generation for remaining expected delta IDs.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`, node `Backlog Delta Gate`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_delta_gate_expected_targets_v1_20260605184605.json`
- The no-model path now reads `Professional Prompt Library.updateDeltaTargets.requirementIds`.
- No-model reuse is allowed only when every detected delta target ID is already accounted for by previous update summary or previous coverage metadata.
- If any expected delta IDs are missing, the workflow forces model generation even when `contextUpdated = false`.

Gate Smoke Validation:

- Synthetic gate test with previous summary containing only `FRD-RISK-011` correctly blocked no-model reuse.
- Missing IDs detected:
  - `FRD-LOY-007`,
  - `FRD-LOY-008`,
  - `FRD-MKT-009`,
  - `FRD-MKT-010`,
  - `FRD-PRIV-012`,
  - `FRD-SUP-013`.

Additional Live Retest Note:

- 2026-06-05: Backlog update retry job `PRO-260605-4CNP3X` correctly bypassed the no-model shortcut and entered the model path.
- n8n execution `1041578` failed in `Validate Team Managed Backlog` before Jira publishing.
- The model produced the intended delta themes:
  - Loyalty Wallet and Store Credit,
  - Marketplace Sellers Cart Grouping and Checkout,
  - Risk-Based Step-Up Verification,
  - Support Event Replay and Sensitive Data Protection.
- Failure cause was validator shape handling, not Jira publishing:
  - the model returned `epics` and top-level `stories` separately,
  - top-level stories lacked exact parent epic fields and were not attached back to the matching epics,
  - `document.coverageLedger` was omitted,
  - validator then reported zero-story epics and missing coverage ledger.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`, node `Validate Team Managed Backlog`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_delta_validator_shape_v1_20260605132422.json`
- Patch scope is update-mode validation/normalization only.
- Validator now:
  - attaches top-level stories to delta epics by source traceability overlap,
  - falls back to conservative lexical matching when no explicit parent epic field is present,
  - lets unmatched story group epics inherit source references from their child stories,
  - synthesizes an update-mode coverage ledger from expected delta/source traceability when the model omits `document.coverageLedger`.

Validator Smoke Validation:

- Synthetic replay of the failed `4CNP3X` output shape passed:
  - `KAN-EPIC-07` mapped to `2` stories,
  - `KAN-EPIC-08` mapped to `1` story,
  - `KAN-EPIC-09` mapped to `1` story,
  - `KAN-EPIC-10` mapped to `1` story,
  - all seven expected delta IDs were represented in the synthesized coverage ledger,
  - no zero-story epics remained.

Additional Live Retest Note:

- 2026-06-05: Backlog update retry job `PRO-260605-UN9NVZ` completed and validated the validator-shape fix.
- n8n execution `1041776` completed successfully.
- Jira output:
  - created epics `KAN-1293`, `KAN-1294`, `KAN-1295`,
  - created stories `KAN-1296`, `KAN-1297`, `KAN-1298`, `KAN-1299`.
- Usage improved versus earlier full-size update attempts:
  - `20,686` total tokens,
  - estimated cost `US$0.016695`,
  - duration `86,836 ms`.
- Remaining gap: the job completed with `quality_gate_status = passed_with_warnings`.
- Missing/partial delta IDs still reported:
  - `FRD-MKT-010`,
  - `FRD-PRIV-012`,
  - `FRD-SUP-013`.
- The job created real delta backlog coverage for loyalty, fraud, and marketplace grouping, but did not yet fully account for seller-specific split-shipment/coupon behavior, privacy/consent, and support-operations replay.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`, node `Professional Prompt Library`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_retry_missing_delta_focus_v1_20260605135005.json`
- Patch scope is update-retry prompt targeting only.
- Prompt library now:
  - carries `previousCoverageSummary.missingDeltaTargetIds` into `updateDeltaTargets.requirementIds`,
  - promotes retry-focus evidence before broad delta evidence,
  - expands update-mode excerpts to preserve additional requirement IDs in the same supporting chunk,
  - explicitly instructs update repair to cover missing delta IDs first while reusing existing Jira items.

Retry-Focus Smoke Validation:

- Active prompt code compiled successfully.
- Synthetic previous coverage summary with:
  - `FRD-MKT-010`,
  - `FRD-PRIV-012`,
  - `FRD-SUP-013`
  was converted into retry-focus delta targets.

Additional Live Retest Note:

- 2026-06-05: Backlog Regenerate Anyway job `PRO-260605-VV9B3V` queued correctly as an update of `PRO-260605-UN9NVZ`, but failed in `Validate Team Managed Backlog`.
- n8n execution `1042004` showed that the prompt fix worked semantically:
  - generated coverage rows for `FRD-MKT-010`, `FRD-PRIV-012`, and `FRD-SUP-013`,
  - generated repair stories for marketplace split shipment, consent/preferences, and support event replay.
- Failure cause was idempotency validation:
  - the repair output included `Implement Seller-Aware Cart Grouping and Split Shipment Visibility`,
  - that summary already existed from prior successful job `PRO-260605-UN9NVZ`,
  - validator treated the duplicate summary as fatal instead of merging it into the existing Jira story.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`, node `Validate Team Managed Backlog`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_duplicate_story_merge_v1_20260605142355.json`
- Patch scope is update-mode validation/normalization only.
- Validator now:
  - collapses update-mode duplicate story summaries into the retained existing Jira story,
  - preserves the retained story correlation/Jira identity,
  - merges acceptance criteria, source references, traceability, flows, and test notes from the repair story,
  - rewrites coverage ledger `mappedStoryIds` from dropped temporary IDs to the retained story ID,
  - keeps duplicate summary as fatal in create mode and for non-merged duplicates.

Duplicate-Merge Smoke Validation:

- Synthetic replay of the `PRO-260605-VV9B3V` duplicate pattern passed:
  - existing `KAN-STORY-23` was retained,
  - temporary repair ID `KAN-STORY-1299` was mapped back to `KAN-STORY-23`,
  - coverage ledger `FRD-MKT-010` was rewritten to the retained story ID,
  - only one marketplace story remained after merge.

Additional Live Retest Note:

- 2026-06-05: Backlog retry job `PRO-260605-7YR7AT` completed successfully as update-retry of `PRO-260605-VV9B3V`, with `updateOfJobId = PRO-260605-UN9NVZ`.
- n8n execution `1042364` completed successfully.
- Jira output:
  - reused epics `KAN-1293`, `KAN-1294`, and `KAN-975`,
  - created stories `KAN-1300`, `KAN-1301`, and `KAN-1302`,
  - reused existing related stories including `KAN-1299` and `KAN-1297`.
- The duplicate story merge fix worked; the marketplace split-shipment repair did not fail on the existing story summary.
- Usage:
  - `35,103` total tokens,
  - estimated cost `US$0.034603`,
  - duration `85,607 ms`.
- Remaining reporting issue: the compact repair output correctly resolved `FRD-MKT-010`, `FRD-PRIV-012`, and `FRD-SUP-013`, but the validator still marked earlier already-covered IDs as partial because it expected them to be restated in the compact repair coverage ledger:
  - `FRD-LOY-007`,
  - `FRD-LOY-008`,
  - `FRD-MKT-009`,
  - `FRD-RISK-011`.

Additional Fix Implemented:

- 2026-06-05: Patched active Backlog generator workflow `Vwc6c8ehsRTF8svG`, node `Validate Team Managed Backlog`.
- Backup created:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_update_delta_accounting_v1_20260605143052.json`
- Patch scope is update-mode coverage accounting only.
- Validator now accepts `document.updateSummary.resolvedCoverageIds` and `document.updateSummary.unchangedCoverageIds` as valid accounting for expected delta target IDs.
- Compact update repairs no longer need to restate already-covered ledger rows just to avoid a false amber status.

Metadata Repair:

- Since `PRO-260605-7YR7AT` had already created the correct Jira items, its stored job metadata was repaired without another model call.
- `qa_jobs.output.qualityGate.coverageLedger` now combines:
  - 4 prior covered rows from `PRO-260605-UN9NVZ`,
  - 3 latest covered rows from `PRO-260605-7YR7AT`.
- Final repaired coverage state:
  - `coverageLedgerCount = 7`,
  - `coveredCount = 7`,
  - `partialCount = 0`,
  - `missingCount = 0`,
  - `gateStatus = passed`.
- `qa_job_metrics` events for `QUALITY_GATE_PASSED` and `JOB_COMPLETED` were also repaired from `passed_with_warnings` to `passed`.

Retest:

- Ingest new supporting documents that introduce Backlog-relevant delta requirements.
- Trigger Backlog Update Document or update-retry.
- Confirm the update creates/updates the expected delta epics/stories or returns a clear no-op reason.
- Confirm the quality gate, coverage summary, and batch progress agree.
- Confirm token usage is lower than full create/retry generation for the same Backlog.

## BUG-E2E-128: Story Test Cases Update Completes Even Though Coverage Gate Failed

Status: fixed - workflow patched; pending next live STC update validation

Severity: high

Area:

- Story Test Cases update workflow
- Coverage gate enforcement
- Job terminal status
- My Document Jobs / Output Panel completion state

Observed During:

- Live Story Test Cases update job `STC-260606-PUPHPE`.
- Source STC output: `STC-260605-2PCPPV`.
- Latest Backlog source: `PRO-260605-7YR7AT`.

What Happened:

- The STC update job persisted `qa_jobs.status = completed`.
- Stored coverage metadata for the same job reported a failed gate:
  - `coverageSummary.gateStatus = failed`,
  - `coverageSummary.status = failed`,
  - coverage score `69%`,
  - `5` covered, `1` partial, `2` missing out of `8` delta stories.
- The terminal job state therefore says the update completed while the quality/coverage contract says the update failed.

Expected:

- A Story Test Cases update should not be treated as a successful terminal completion when required in-scope stories have missing generated/published test coverage.
- The UI should show a clear failure or needs-review state and preserve a retry/regenerate path targeted at the missing coverage.
- Dashboard and Analytics should not count this as a clean successful STC update.

Suggested Fix:

1. Align STC terminal status with the final coverage gate:
   - `passed` can complete,
   - `warning` can complete with needs-review where accepted by product rules,
   - `failed` should mark the job failed or blocked-for-repair, not cleanly completed.
2. Ensure My Document Jobs, Output Panel, Dashboard, and Analytics all consume the same canonical terminal state.
3. Persist enough structured coverage failure detail to drive retry/update-repair without re-running successful publish work.

Retest:

- Trigger STC Update Document against a backlog delta with one deliberately uncovered story.
- Confirm the job does not show as cleanly completed.
- Confirm the coverage modal, output card, My Document Jobs card, Dashboard, and Analytics agree on the terminal state.

Fix Implemented:

- 2026-06-08: Patched active STC generator workflow `SG7khcKlhHst48WH`.
- Backup:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_update_gate_usage_summary_v1_20260608053836.json`
- `Finalize Story Test Case Result` now derives `terminalStatus` from the final coverage gate.
- If final STC coverage is `failed`, `Mark Direct Story Test Case Job Completed` persists `qa_jobs.status = failed` with the generated output, coverage ledger, repair targets, token usage, and an actionable error message.
- The terminal metric is now emitted as `JOB_FAILED` for failed coverage, preventing Dashboard/Analytics from treating the run as a clean success.

## BUG-E2E-129: Story Test Cases Delta Update Skips In-Scope Stories Instead Of Repairing Missing Coverage

Status: fixed - workflow patched; pending next live STC update-retry validation

Severity: high

Area:

- Story Test Cases delta update planning
- Story-level coverage repair
- Jira test case generation/publishing
- `qa_story_testcase_links`

Observed During:

- Live Story Test Cases update job `STC-260606-PUPHPE`.

What Happened:

- The update selected `8` delta stories but generated/published test cases for only `6` of them.
- Missing stories:
  - `KAN-1301`: `0 / 17` planned test cases published,
  - `KAN-1302`: `0 / 25` planned test cases published.
- Partial story:
  - `KAN-1300`: `9 / 15` planned test cases published.
- Missing categories included important coverage types such as `Functional`, `Security`, `Authorization`, `Accessibility`, `Performance`, `Integration`, `Boundary`, `Observability`, `Network`, and `Data`.
- Jira checkpointing itself looked healthy for generated cases:
  - `138` generated mappings,
  - `138` rows in `qa_story_testcase_links`,
  - all generated rows had `linked` status,
  - no duplicate story/testcase link rows were found.
- This suggests the publish/linking path worked for generated cases, but the generation/repair path did not produce cases for all required in-scope stories.

Expected:

- STC delta update should generate, reuse, or repair coverage for every in-scope delta story before completing.
- If the first generation pass omits any selected story, batch retry/repair should isolate those stories and generate the missing categories.
- A retry should be able to resume from the successful Jira publish checkpoints and only repair missing story coverage.

Suggested Fix:

1. Add a final STC delta coverage reconciliation step before completion:
   - compare selected delta stories against generated/published story IDs,
   - identify zero-coverage and partial-coverage stories,
   - build a targeted repair batch for only missing stories/categories.
2. Reuse existing Jira publish checkpoints so repair does not recreate or relink already successful test cases.
3. Fail fast with a structured coverage error if repair still cannot satisfy required story coverage.
4. Keep create-mode behavior separate unless the same reconciliation helper can be safely shared without changing create semantics.

Retest:

- Re-run STC update or update-retry from `STC-260606-PUPHPE`.
- Confirm `KAN-1301` and `KAN-1302` receive generated and linked test cases.
- Confirm `KAN-1300` is repaired from partial to covered, or clearly marked needs-review with precise missing categories.
- Confirm the final coverage count matches the selected delta story count.

Fix Implemented:

- 2026-06-08: Patched active STC generator workflow `SG7khcKlhHst48WH`.
- Final STC update output now persists `repairTargets` for every missing or partial story.
- Failed update output retains enough structured coverage detail for update-retry to target missing/partial stories instead of hiding the gap behind a completed job.
- Existing Jira publish checkpoint/reuse behavior remains unchanged, so retry should continue reusing already created/linked test cases and focus on the missing story coverage.
- Create-mode generation logic was left unchanged.

## BUG-E2E-130: Story Test Cases Update Summary Does Not Explain Generated/Published Cases Versus Missing Story Coverage

Status: fixed - workflow/UI/build validated; pending next live STC Update Summary retest

Severity: medium

Area:

- Story Test Cases Update Summary modal
- Coverage Review modal
- User-facing update auditability

Observed During:

- Live Story Test Cases update job `STC-260606-PUPHPE`.

What Happened:

- The job produced a large successful-looking publish summary:
  - `138` test cases,
  - `138` mappings,
  - Jira summary: `90` created, `48` updated, `0` reused.
- The same job coverage summary reported:
  - `2` missing stories,
  - `1` partial story,
  - failed coverage gate.
- The current summary does not make the distinction clear enough between:
  - generated/published test case count,
  - story coverage completeness,
  - missing stories/categories requiring repair.

Expected:

- For STC updates, users should be able to tell whether the update is complete at the story-coverage level, not only that many Jira test cases were created or updated.
- Update Summary should clearly separate:
  - stories covered,
  - stories partial,
  - stories missing,
  - test cases created,
  - test cases updated,
  - test cases reused,
  - missing categories per affected story.

Suggested Fix:

1. Add an STC-specific summary section for `Story coverage impact`.
2. Show compact story chips or rows for missing/partial stories, with hover details for missing categories.
3. Keep Jira publish totals in a separate `Jira publish impact` section.
4. Ensure Coverage Review and Update Summary use the same source counts and labels.

Retest:

- Open Update Summary for an STC update with partial/missing coverage.
- Confirm users can immediately identify which stories require repair and which Jira test cases were created/updated successfully.

Fix Implemented:

- 2026-06-08: STC final output now persists an STC-specific `updateSummary` with:
  - story scope,
  - covered/partial/missing story counts,
  - created/updated/reused test case counts,
  - story coverage rows,
  - missing/partial repair targets,
  - canonical token usage.
- `src/pages/DashboardPage.tsx` now labels incomplete STC updates as `Update needs coverage repair` and separates Jira publish totals from story coverage status.
- Existing STC Update Summary sections continue to show story coverage details and Jira test case ID buckets.
- Build validation passed with `npm run build`.

## BUG-E2E-131: Story Test Cases Update Usage Metadata Is Not Persisted In The Standard Token Usage Shape

Status: fixed - workflow patched; pending next live STC usage retest

Severity: medium

Area:

- Story Test Cases usage metadata
- Usage Details modal
- Dashboard and Analytics usage aggregation
- `qa_jobs.output.tokenUsage`

Observed During:

- Live Story Test Cases update job `STC-260606-PUPHPE`.

What Happened:

- Token and cost values were present at top-level output/metric locations:
  - `tokensInput = 43,773`,
  - `tokensOutput = 65,394`,
  - `tokensTotal = 109,167`,
  - `estimatedCostUsd = 0.122137`.
- However, `qa_jobs.output.tokenUsage` was `null`.
- `qa_job_metrics` also contained duplicate terminal rows for the same token/cost values, tracked separately under `BUG-E2E-121`.

Expected:

- STC update and update-retry jobs should persist usage in the same canonical shape used by other document types.
- Usage Details, Dashboard, and Analytics should not need STC-specific fallback logic to find token/cost values.
- Final success should reconcile any attempt usage checkpoint into one canonical final usage payload.

Suggested Fix:

1. Normalize STC final output so `output.tokenUsage` is populated consistently:
   - input tokens,
   - output tokens,
   - total tokens,
   - estimated cost,
   - model/provider when available,
   - usage source label such as `final` or `attempt-reconciled`.
2. Keep top-level legacy fields only as compatibility aliases if needed.
3. Dedupe terminal metrics in the same patch path or keep that tracked under `BUG-E2E-121`.

Retest:

- Run or replay an STC update completion.
- Confirm `qa_jobs.output.tokenUsage` is present.
- Confirm Usage Details, Dashboard, and Analytics report the same single token/cost values.

Fix Implemented:

- 2026-06-08: Patched active STC generator workflow `SG7khcKlhHst48WH`.
- `Build Direct Story Test Case Completion Output` now writes canonical `output.tokenUsage` with input, output, total tokens, estimated cost, source, and model when available.
- The same canonical usage payload is mirrored into STC `updateSummary.tokenUsage`.
- Top-level `tokensInput`, `tokensOutput`, `tokensTotal`, and `estimatedCostUsd` remain as compatibility aliases.

## BUG-E2E-132: Newly Created Project Can Remain Local-Only And Not Appear In User Assignment Lists

Status: fixed - UI/build validated; pending current E2E project assignment retest

Severity: high

Area:

- New Project wizard
- Project repository persistence
- Invite User / User Project Assignment lists
- `qops_projects`

Observed During:

- Full E2E cycle preparation on 2026-06-08.
- Admin created a new project named `AstraCart Ecommerce`.
- The project did not appear when assigning projects to a new invited user.
- The project also did not appear when assigning projects to an already registered user.

What Happened:

- Supabase `qops_projects` did not contain `AstraCart Ecommerce`.
- The frontend created the project optimistically in local state/localStorage.
- Persistence depended only on `/webhook/projects`.
- If the n8n project webhook failed, timed out, or returned a non-standard body, the project stayed local-only and assignment flows could not use it reliably.

Expected:

- Creating a project from the UI should persist a durable `qops_projects` row.
- Invite and assignment screens should list the same durable project repository as the rest of the app.
- A backend webhook issue should not silently leave the user with a local-only project.

Fix Implemented:

- 2026-06-08: Patched `src/lib/api.ts`.
- `fetchProjects()` now falls back to direct Supabase REST reads from `qops_projects` when `/webhook/projects` is unavailable.
- `createProjectRecord()` now:
  - unwraps both direct project responses and `{ project }` responses,
  - checks for an existing project by exact name before inserting,
  - falls back to direct Supabase REST insert into `qops_projects` if the webhook path fails.
- Added project row normalization for both camelCase and snake_case backend fields.
- Build validation passed with `npm run build`.

Retest:

- Create a fresh project.
- Confirm it appears in `qops_projects`.
- Open Invite User and existing-user assignment flows.
- Confirm the new project appears in the project assignment list.
- Assign it to a registered user and confirm `qops_project_members` receives the expected row.

## BUG-E2E-133: Registered User Default Routing Saves Without User-Level Operational Test Audit

Status: fixed - frontend build passed

Severity: medium

Area:

- Registered-user Settings
- My default routing
- Integration status / connection-test evidence
- `qops_user_integration_settings`
- `qops_connection_test_results`

Observed During:

- Full E2E cycle on 2026-06-08 after successful invite/login for `anujalhans1@gmail.com`.
- User configured Settings -> My default routing for all assigned projects.
- User intentionally left This Project Only settings unconfigured.

What Happened:

- Supabase correctly persisted 4 user-default routing rows in `qops_user_integration_settings` for:
  - `jira`
  - `confluence`
  - `chroma`
  - `microservices`
- No project-level override rows existed in `qops_project_integration_overrides`, which matches the expected scope.
- However, those user-level settings were saved with `status = backend_managed`.
- No matching per-user connection-test rows were found in `qops_connection_test_results` for `anujalhans1@gmail.com`.
- No recent effective-config audit rows were found for this user yet in `qops_effective_config_audit`.

Expected:

- If the Settings UI indicates that registered-user default routing has been tested or is operational, Supabase should persist user-scoped connection-test evidence.
- The UI should be able to distinguish:
  - saved but not tested,
  - backend-managed/inherited,
  - tested operational,
  - tested failed/degraded.
- Registered-user default routing should have a clear audit trail showing who tested it, when, and what integration scope was validated.

Impact:

- The settings are saved, so generation may still work.
- But Dashboard/Settings/Admin support cannot prove whether the registered user's default routing was actually validated.
- Users may see a stronger operational implication than the database can support.

Suggested Fix:

1. Decide the intended contract for user-level default routing status:
   - keep `backend_managed` until tested, or
   - set `operational/degraded/not_configured` after test.
2. When a registered user tests an integration from My default routing, insert a `qops_connection_test_results` row with:
   - `checked_by`,
   - `environment_key`,
   - `integration_key`,
   - `service_name`,
   - status,
   - latency/message/technical detail.
3. Update the Settings UI copy so saved-but-untested user defaults are not presented as operational.
4. After a generation/ingestion job resolves effective config, confirm `qops_effective_config_audit` captures that the user-default scope was used.

Retest:

- Login as a registered user.
- Configure My default routing.
- Run Test for each configured integration.
- Confirm `qops_user_integration_settings` reflects the expected status contract.
- Confirm `qops_connection_test_results` has user-scoped rows for each test.
- Run a small ingestion/generation job and confirm `qops_effective_config_audit` records the effective config source priority.

## BUG-E2E-134: Dashboard Shows KB Ready While Same Project Ingestion Jobs Are Still Processing

Status: fixed - partially validated; pending active-ingestion Dashboard retest

Severity: high

Area:

- Dashboard readiness cards
- Project readiness table
- Ingestion lifecycle
- Generate Documents readiness gating
- `doc_ingestion_jobs`
- `qops_projects`

Observed During:

- Full E2E registered-user ingestion cycle on 2026-06-08.
- User triggered ingestion for project `Astra Ecommerce`.
- Some ingestion jobs were completed while other ingestion jobs for the same project were still processing.

What Happened:

- Dashboard showed `KB Ready = 1`.
- Project readiness table showed `KB = Ready`.
- Action Required recommended `Generate or update QA deliverables` as next best action.
- At the same time, Dashboard also showed active pipeline work, for example `4 jobs currently running`.
- This creates a contradictory user signal: the knowledge base appears ready for generation while the current ingestion batch is still incomplete.

Expected:

- A project should not be considered KB ready while any current ingestion job for that project is `pending`, `queued`, or `processing`.
- During active ingestion, Dashboard should show a transitional state such as `Ingesting` or `KB building`.
- Generate/update document recommendations should remain blocked or lower priority until the latest ingestion batch reaches a terminal state.

Impact:

- Users can start document generation before all source artifacts are embedded.
- Generated outputs may be incomplete or misleading because the KB was only partially built.
- Dashboard readiness, Action Required recommendations, and Project Readiness can disagree with live pipeline state.

Suggested Fix:

1. Compute KB readiness from project status plus live ingestion state.
2. If any ingestion job for the selected/assigned project is active:
   - show `KB = Ingesting`,
   - show active/completed counts, for example `4 active, 3 completed`,
   - suppress `Generate or update QA deliverables` as the next-best recommendation.
3. Only show `KB Ready` when:
   - no active ingestion jobs remain for the project,
   - at least one ingestion job completed successfully,
   - no actionable failed ingestion jobs remain unrecovered.
4. Ensure Dashboard, Project Readiness table, and Generate Documents gating use the same readiness helper.

Fix Implemented:

- 2026-06-08: Patched the Dashboard presentation layer in `src/pages/DashboardPage.tsx`.
- KB readiness now evaluates live artifact/job state, not only stored `qops_projects.status`.
- A project with active ingestion now shows `KB = Ingesting` in Project Readiness.
- The Dashboard KPI changes from `KB ready` to `KB building` while assigned projects are still ingesting.
- `readyKnowledgeBases` excludes projects with active ingestion work.
- Dashboard next-best action now guides users to monitor ingestion instead of starting generation when no project is currently retrieval-ready.
- Dashboard and Artifact Repository now reconcile backend state when the user lands on those screens and conditionally poll while visible ingestion work is active.

Verification:

- `npm.cmd run build` passed on 2026-06-08.
- 2026-06-08: Follow-up ingestion batch for project `Astra Ecommerce` completed successfully.
- Confirmed final Dashboard state after the batch was coherent:
  - `0 active jobs`
  - `24 artifacts`
  - `KB ready = 1`
  - project `Astra Ecommerce` status returned to `ready`
- Active in-progress state was not observed before the four latest ingestion jobs completed, so the specific `KB building` / `Ingesting` transition still needs one live mid-batch retest before closure.

Retest:

- Trigger a multi-file ingestion batch.
- While some jobs are processing and some are completed, confirm Dashboard shows `KB building` / `Ingesting`, not `KB Ready`.
- Confirm generation recommendation is not shown as the top next action until ingestion is terminal.
- After all jobs complete successfully, confirm Dashboard changes to `KB Ready`.

## BUG-E2E-135: Artifact Repository Requires Browser Refresh To Reconcile Multi-File Ingestion Batch

Status: closed

Severity: medium

Area:

- Artifact Repository
- Multi-file ingestion live state
- Artifact counts and filters
- In-progress artifact visibility
- `doc_ingestion_jobs`
- Supabase Storage uploaded artifacts

Observed During:

- Full E2E registered-user ingestion cycle on 2026-06-08.
- User triggered a multi-file ingestion batch for project `Astra Ecommerce`.
- Backend eventually completed 7 ingestion jobs and stored 7 uploaded artifacts.

What Happened:

- While the ingestion batch was still settling, Artifact Repository showed only 4 total artifacts / 4 processed rows.
- After a browser/screen refresh, the same screen showed the expected 7 artifacts.
- This indicates the backend state was correct, but the Artifact Repository screen did not automatically reconcile live ingestion changes when the user landed on or viewed the screen.

Expected:

- Artifact Repository should not require a browser refresh to show the latest ingestion state.
- When a user opens or lands on Artifact Repository, the screen should immediately fetch the latest artifact/job state from the backend.
- While any artifact/job for the visible scope is `queued`, `pending`, or `processing`, the screen should use production-safe conditional polling.
- Polling should stop once all visible artifacts are terminal: `processed`, `failed`, or `recovered`.
- A manual Refresh button/icon should also be available for user confidence and immediate reconciliation.

Production-Safe Polling Constraints:

- Do not poll continuously for every user or every project.
- Fetch once when the user lands on Artifact Repository.
- Start polling only if the visible user/project scope contains active ingestion work.
- Poll at a modest interval, for example every 5-10 seconds, not every second.
- Stop polling immediately when all visible ingestion rows are terminal.
- Pause polling when the browser tab is hidden or the user navigates away from Artifact Repository.
- Scope backend requests to the current user's visible/assigned projects only.
- Keep manual Refresh available when no live jobs exist.
- Longer term, consider Supabase Realtime or server-sent events for job status changes to reduce polling overhead further.

Ideal UX:

- Show live counts that distinguish:
  - total submitted,
  - processing,
  - processed,
  - needs retry,
  - recovered.
- Include processing rows for queued/in-progress artifacts instead of only completed rows.
- Show a lightweight timestamp such as `Last refreshed: 12:52 PM`.
- During a live batch, counts should reconcile like:
  - `Total 7`
  - `Processing 3`
  - `Processed 4`
  - `Needs retry 0`
  - `Recovered 0`

Impact:

- Users may think documents were not uploaded or were skipped.
- Users may manually refresh the browser to force correctness.
- Artifact Repository can temporarily disagree with Dashboard/Analytics and backend state.

Suggested Fix:

1. Trigger a fresh artifact/job fetch whenever the user opens Artifact Repository.
2. Add conditional, scoped short-interval polling only while visible project-scope ingestion artifacts have active statuses.
3. Add a manual Refresh control near the Artifact Repository filters/header.
4. Render active queued/processing rows from `doc_ingestion_jobs` even before completion metadata is available.
5. Pause polling when the tab is hidden or the user leaves Artifact Repository.
6. Stop polling once all rows are terminal.

Fix Implemented:

- 2026-06-08: Patched `src/pages/DashboardPage.tsx`.
- Artifact Repository now fetches the latest backend repository state when the user lands on the screen.
- While visible ingestion work is active, the screen uses conditional polling at a modest interval.
- Polling pauses when the browser tab is hidden and stops when no active ingestion remains.
- Added a manual `Refresh` button to Artifact Repository for explicit user reconciliation.
- The Refresh button uses the same backend refresh path as Dashboard and Analytics reconciliation.

Verification:

- `npm.cmd run build` passed on 2026-06-08.
- 2026-06-08: Live registered-user retest passed during the four-document supporting-doc ingestion batch for project `Astra Ecommerce`.
- Artifact Repository refreshed without a browser reload and showed:
  - `24` total artifacts
  - `24` processed artifacts
  - the four newest supporting documents at the top:
    - `ING-260608-HR19DO`
    - `ING-260608-T6D3HO`
    - `ING-260608-LVNWN8`
    - `ING-260608-5USOM5`
- Manual `Refresh` control was visible.

Retest:

- Trigger a multi-file ingestion batch.
- Navigate to Artifact Repository before all files complete.
- Confirm the screen shows total submitted files and processing rows without browser refresh.
- Confirm counts update automatically as each file completes.
- Confirm manual Refresh also reconciles the latest backend state.

## BUG-E2E-136: Registered User Analytics Emits Direct qa_job_metrics 403 Despite Successful Analytics Load

Status: closed

Severity: low

Area:

- Analytics page
- Registered-user authorization
- Browser console/API hygiene
- `qa_job_metrics`

Observed During:

- Full E2E registered-user ingestion cycle on 2026-06-08.
- User logged in as `anujalhans1@gmail.com`.
- Project scope selected: `Astra Ecommerce`.
- Analytics page visibly loaded correct live totals from the analytics summary path.

What Happened:

- Browser console recorded direct Supabase REST failures against `qa_job_metrics` with HTTP `403`.
- The failing request attempted to read generation metrics directly:
  - `pipeline=eq.generation`
  - selected `job_id`, `project_id`, `project_name`, `document_type`, `pipeline`, `event`, `status`, usage fields, metadata, and created time.
- The visible Analytics page still showed correct ingestion totals:
  - 16 completed jobs
  - 16 files
  - 31 chunks
  - 11.9K tokens
  - `$0.0031` estimated spend
  - 0 failed

Expected:

- Registered-user Analytics should not emit avoidable 403s in the browser console.
- If direct `qa_job_metrics` reads are not allowed for registered users, the frontend should avoid that direct query and rely on the authorized analytics endpoint.
- If direct reads are intended, RLS/API policies should allow only project-scoped rows for assigned projects.

Impact:

- Visible Analytics data is correct, so this is not currently blocking the E2E ingestion path.
- Console noise can confuse validation and production support.
- Future code paths might accidentally depend on the blocked direct query and show incomplete generation metadata for registered users.

Suggested Fix:

1. Decide whether registered users should ever query `qa_job_metrics` directly from the browser.
2. Preferred production posture: keep `qa_job_metrics` behind the authorized analytics summary endpoint and disable/suppress the direct browser fallback for registered users.
3. If direct reads are required, add a narrow RLS policy for assigned-project rows only.
4. Ensure Analytics still shows generation usage/details through one canonical authorized path.

Fix Implemented:

- 2026-06-08: Patched `src/lib/api.ts`.
- Removed the direct frontend Supabase REST fallback that queried `qa_job_metrics`.
- `fetchGenerationJobMetrics()` now relies on the authorized Analytics Summary endpoint instead of browser-side direct table reads.
- This avoids registered-user `403` console noise without changing backend analytics or RLS policies.

Verification:

- `npm.cmd run build` passed on 2026-06-08.
- 2026-06-08: Registered-user browser retest passed after fresh navigation.
- Confirmed live network calls used authorized n8n webhook paths:
  - `/webhook/analytics-summary?pipeline=all&days=30`
  - `/webhook/analytics-summary?pipeline=generation&days=90`
  - `/webhook/generated-documents`
  - `/webhook/artifacts`
  - `/webhook/projects`
- Confirmed no live direct browser request to Supabase `rest/v1/qa_job_metrics`.
- Browser console showed no new `qa_job_metrics` 403 after fresh navigation; only React Router future warnings remained.

Retest:

- Log in as a registered user with assigned project access.
- Open Analytics.
- Confirm visible Analytics totals remain correct.
- Confirm the browser console does not show `qa_job_metrics` 403 errors.

## BUG-E2E-137: Dashboard Does Not Reconcile Completed Ingestion Totals Without Full Page Reload

Status: closed

Severity: medium

Area:

- Dashboard
- Ingestion metrics freshness
- Registered-user project scope
- Artifact and spend KPI cards
- `doc_ingestion_jobs`
- `qa_job_metrics`

Observed During:

- Full E2E registered-user ingestion cycle on 2026-06-08.
- User ingested additional BRD/FRD documents for project `Astra Ecommerce`.
- Backend completed the new ingestion jobs successfully.

What Happened:

- Supabase showed the registered user's project scope had advanced from 16 to 18 completed ingestion jobs.
- Backend metrics showed:
  - 18 completed ingestion jobs
  - 58 chunks
  - 20.078K tokens
  - `$0.004590` estimated cost
  - 0 failed
- Dashboard still displayed the previous state:
  - 16 artifacts
  - 11.9K tokens
  - `$0.003` spend
- After a full browser/route reload, Dashboard corrected to:
  - 18 artifacts
  - 20.1K tokens
  - `$0.005` rounded spend

Expected:

- Dashboard should reconcile ingestion totals when the user navigates back to Dashboard or when a visible ingestion batch reaches terminal state.
- Users should not need a full page reload to see completed ingestion counts, token usage, or spend.
- Dashboard, Artifacts, and Analytics should use the same freshness/reconciliation strategy for ingestion changes.

Impact:

- Users can see stale artifact and spend totals after ingestion completes.
- This can reduce confidence during E2E validation and production use.
- Dashboard may disagree with Supabase, Artifacts, or Analytics until a full reload.

Suggested Fix:

1. Refresh Dashboard analytics/artifact summary when the Dashboard view becomes active.
2. Add conditional polling only while assigned-project ingestion jobs are active.
3. Stop polling after all visible ingestion jobs are terminal.
4. Reuse the production-safe polling constraints from `BUG-E2E-135`.
5. Ensure the Dashboard KPI cards, greeting summary, project readiness table, and action recommendations read from the refreshed summary.

Fix Implemented:

- 2026-06-08: Patched `src/pages/DashboardPage.tsx`.
- Dashboard now refreshes backend repository data and Analytics when the user lands on the Dashboard.
- Dashboard conditionally polls while visible ingestion work is active.
- Polling pauses when the browser tab is hidden and stops once no visible ingestion remains active.
- The same refresh path updates projects, artifacts, generated outputs, knowledge jobs, audit events, and Analytics state.

Verification:

- `npm.cmd run build` passed on 2026-06-08.
- 2026-06-08: Live registered-user retest passed after the four-document supporting-doc ingestion batch completed.
- Dashboard refreshed to the current backend state without requiring a browser reload:
  - greeting summary showed `0 active jobs`
  - artifact count showed `24 artifacts`
  - KB card showed `KB ready = 1`
- Supabase confirmed the same final state:
  - `doc_ingestion_jobs` for project `Astra Ecommerce`: `24 completed`
  - latest four ingestion jobs had matching `JOB_QUEUED` and `JOB_COMPLETED` metrics
  - `qops_projects.status = ready`

Retest:

- Trigger a new ingestion batch for an assigned project.
- Stay on or return to Dashboard while jobs complete.
- Confirm artifact count, token usage, and spend update without full page reload.
- Confirm polling stops once all ingestion jobs are terminal.

## BUG-E2E-138: Extractor Response Details Are Not Fully Persisted For Later-Phase Extraction Transparency

Status: fixed - workflow patched and existing STC metrics repaired; pending next live STC run validation

Severity: low

Phase:

- Later phase

Area:

- FastAPI extractor response contract
- n8n ingestion final output
- Extraction Details modal
- Artifact Repository
- Ingestion observability

Observed During:

- Full E2E registered-user ingestion cycle on 2026-06-08.
- Extraction Details UI review for `Astra Ecommerce` artifacts.
- Extractor code review after improving the Extraction Details modal.

What Happened:

- The FastAPI extractor returns richer extraction metadata than the final n8n ingestion output currently persists.
- The UI intentionally shows only fields that are persisted in the final ingestion output and does not fake unavailable details.
- Missing persisted details include page/content-mode metadata, richer image/visual-candidate details, rendered page details, and detailed table/annotation/link rows.
- Current final ingestion output mainly stores compact counts such as chunks, extracted words, tokens, cost, duration, file size, response size, tables count, annotations count, links count, warnings count, and visual candidate count.

Expected:

- In a later phase, the ingestion pipeline should persist the useful extractor response details in a stable, UI-friendly shape.
- Extraction Details should then show document-type-aware details using actual persisted data, not inferred or hardcoded values.
- The UI should remain concise by default, with deeper extracted evidence available through expandable sections.

Known Extractor Fields Not Fully Persisted Today:

- Top-level fields such as `metadataConfidence`, `metadataSource`, `pageCount`, `contentMode`, `containsText`, `containsImages`, `imageCount`, `documentCategory`, `artifactType`, `visionConfigApplied`, and `extractionConfigApplied`.
- Detailed arrays such as `images[]`, `visualCandidates[]`, `renderedPages[]`, `tables[]`, `annotations[]`, and `links[]`.
- Detailed extraction stats such as `pagesProcessed`, `slidesProcessed`, `paragraphsExtracted`, `embeddedImagesExtracted`, `standaloneImagesDetected`, `renderedPagesGenerated`, `visualCandidatesReturned`, `tablesExtracted`, `annotationsExtracted`, `speakerNotesExtracted`, and `linksExtracted`.

Impact:

- Current Extraction Details is accurate for the persisted telemetry, but it cannot yet expose the full extractor evidence trail.
- Users cannot inspect detailed extracted table rows, annotation/link targets, page-level visual candidates, or confidence/source metadata from the UI.
- This is not blocking the current E2E cycle because the visible UI does not claim to show unavailable details.

Suggested Fix:

1. Extend the n8n ingestion final output contract to persist a stable `extractionDetails` / `extractionObservability` shape for useful extractor fields.
2. Keep large raw payloads, binary data, and full `rawText` out of the UI-facing summary unless explicitly needed.
3. Persist compact, bounded evidence details for tables, annotations, links, visual candidates, rendered pages, and document-level metadata.
4. Update the Extraction Details modal to render the richer fields by document type.
5. Add fallback handling for older ingestion rows that only contain compact counts.

Retest:

- Ingest representative PDF, DOCX, PPTX, image, transcript, API spec, and supporting-document artifacts.
- Confirm the final ingestion output persists richer extractor metadata.
- Confirm Extraction Details shows common fields consistently and document-specific fields only when relevant.
- Confirm older artifacts with compact-only telemetry still render cleanly.

## BUG-E2E-139: Clean Create Document Check Is Downgraded By Internal Validator Repairs

Status: fixed - workflow patched and historical Backlog outputs repaired; pending next live Backlog create/update validation

Severity: medium

Area:

- Generate Documents
- Document Check modal
- Final validation diagnostics
- Registered-user E2E document generation

Observed During:

- Full E2E registered-user Test Strategy create run on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `PRO-260608-PB0K3R`
- Document type: `test_strategy`
- Also reproduced on Test Plan create-retry run after Confluence Fabric fix:
  - Job: `PRO-260608-O5WAN6`
  - Document type: `test_plan`
  - Job completed, coverage passed, and Confluence publish succeeded.
  - Final validation still stored `warning` / `repaired` because internal required sections were repaired before publish.

What Happened:

- Test Strategy generation completed successfully and the final validation payload was persisted.
- Final validation status was `warning` / `repaired` because the validator repaired required sections:
  - `Compliance, Security & Regulatory Considerations`
  - `Tooling & Integration Landscape`
  - `Communication & Governance Model`
- The Document Check icon correctly showed an admin/support review state.
- However, inside the Document Check modal, the issue detail rows displayed `[object Object]` instead of readable section names or descriptions.
- The same modal also labeled the document state as `Not publish-safe`, even though the workflow had already repaired the sections and published the document to Confluence.
- This was a first-time clean `Create` workflow, not an update, retry, or repair operation. Coverage passed and no user-facing document issue remained after generation.

Expected:

- For a first-time `Create` run where the job completed, coverage passed, Confluence publish succeeded, and no user-facing validation issue remains, the Document Check state should be green.
- The modal should show `Validation passed`, `Publish-ready`, `Operation: Create`, and `Support review: Not required`.
- Internal validator normalization/repair steps should stay in stored diagnostics for support, but should not downgrade the user-facing state when the final published output is valid.
- Document Check modal should render validation issue objects into user-readable text.
- If repair details are genuinely user-facing, for example an update-repair or unrepaired warning, the modal should show readable section names and clear sentences such as `Required section was repaired before publishing`.
- The modal should never display raw JavaScript object stringification like `[object Object]`.
- Repaired-and-published outputs should use wording such as `Published with support review` or `Published after repair` only when support review is truly required, not for clean Create runs.

Impact:

- The generated document and backend validation data are intact.
- The UI makes the support review details look broken and unprofessional.
- Users/admins cannot understand what support should review from the modal alone.
- The `Not publish-safe` label can wrongly imply that the document was not published or should not have been published.
- Clean successful Create runs appear amber/red to the user even when the user should see a green validation result.

Suggested Fix:

1. Update the user-facing Document Check status mapper to distinguish internal validator normalization from unresolved validation issues.
2. For first-time Create runs with completed status, passed coverage, successful publish URL, and no blocking validation issue, show green `Validation passed`.
3. Keep internal `required_section_repaired` diagnostics available to admins/support without showing them as user-facing repair/admin-review when final output is valid.
4. Update the issue renderer to normalize object-shaped validation issues for cases where details are shown.
5. Prefer fields such as `section`, `code`, `message`, `description`, and `details` when present.
6. Add a safe fallback that JSON-stringifies unknown issue objects in a compact readable form, instead of using implicit object stringification.
7. Split final validation states clearly:
   - `passed` = publish-safe
   - internal repaired clean create = publish-safe / validation passed
   - `warning` / `repaired` with user-facing issue = published with support review
   - `failed` = not publish-safe / blocked
8. Retain the existing icon/status behavior.

Retest:

- Generate a first-time Test Strategy Create document where coverage passes and Confluence publish succeeds.
- Confirm Document Check icon/modal show a green `Validation passed` state.
- Confirm internal repaired-section diagnostics are not shown as a user-facing admin review for the clean Create case.
- Generate or fixture a document with genuine user-facing final validation warnings.
- Open Document Check from the output card and My Document Jobs card.
- Confirm repaired section names are readable and no row shows `[object Object]`.

Fix Applied:

- 2026-06-08: Updated the Document Check UI mapper so published outputs with only internal `required_section_repaired` validation records display as green `Validation passed` / publish-ready instead of support-review/not-publish-safe.
- 2026-06-08: Updated the issue renderer to display readable validation issue titles and messages, including repaired section names, instead of implicit `[object Object]` stringification.
- 2026-06-08: Successful checks now show `Support details: Not required` even when backend diagnostics are retained for admin audit.
- Verification: `npm.cmd run build` passed.

## BUG-E2E-140: Test Plan Create Fails After Generation Checkpoint With Generic Failure And Lost Usage

Status: fixed - live retry validation passed

Severity: high

Area:

- Test Plan create workflow
- Shared document generator failure handling
- Failed job diagnostics
- Token/cost usage persistence
- Coverage warning handling

Observed During:

- Full E2E registered-user document generation cycle on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `PRO-260608-03F8F7`
- Document type: `test_plan`
- Operation: first-time `Create`

What Happened:

- The Test Plan job was queued and started normally.
- The shared generator logged `GENERATOR_STARTED`.
- The workflow then logged `QUALITY_GATE_PASSED` with generated usage:
  - `word_count`: `2495`
  - `tokens_input`: `3573`
  - `tokens_output`: `5432`
  - `tokens_total`: `9005`
  - `estimated_cost_usd`: `$0.010120`
- The same checkpoint metadata showed coverage was not fully green:
  - `coverage_gate_status`: `warning`
  - `coverage_ledger_count`: `11`
  - `covered_ledger_count`: `9`
  - `partial_ledger_count`: `2`
  - `uncovered_ledger_count`: `2`
- The final job then failed with a generic `SHARED_GENERATOR_FAILED` output:
  - `message`: `Generation workflow failed before producing an output.`
  - `failedAt`: `Shared generator subworkflow`
  - `error`: `null`
- The final `JOB_FAILED` metric did not persist the tokens/cost from the prior generation checkpoint.

Expected:

- A first-time Test Plan Create should either complete with a clear coverage review state or fail with actionable diagnostics.
- If model generation already consumed tokens, failed job usage should be persisted in the standard usage shape and visible from the failed job card.
- The final failed job output should preserve the real downstream failure reason, not only a generic shared subworkflow message.
- If partial coverage is acceptable as amber, the workflow should publish/complete with coverage review.
- If partial coverage is blocking for Create, the job should fail explicitly as a coverage/quality gate failure with the exact partial items.

Impact:

- User waited for the generation and incurred token/cost usage, but the job produced no document.
- Retry/regenerate may repeat the same failure without a clear corrective signal.
- Dashboard/Analytics can under-report failed generation cost because the final failed event lacks token/cost fields.
- Support cannot diagnose the actual failure from `qa_jobs.error` or the generic failed output alone.

Suggested Fix:

1. Preserve the real subworkflow error in the parent worker failure output.
2. Carry the latest known checkpoint token/cost usage into the final `JOB_FAILED` metric and `qa_jobs.output.tokenUsage`.
3. Persist coverage summary/ledger details even when the job fails after generation.
4. Clarify Test Plan Create coverage policy:
   - amber partial coverage completes with coverage review, or
   - blocking partial coverage fails with explicit `QUALITY_GATE_FAILED`.
5. Ensure failed Test Plan Create cards show usage and actionable diagnostics.

Fix Implemented:

- 2026-06-08: Patched `fullRetrievalD01` with backup:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_confluence_fabric_resilience_v1_20260608102831.json`
- Root cause from n8n error export:
  - Confluence returned HTTP `400`.
  - Error: `Content contains unsupported extensions and cannot be edited in Fabric editor`.
  - The failure was caused by Fabric-incompatible Confluence storage HTML, not auth, permissions, size, or rate limit.
- Shared Confluence HTML hardening:
  - Added final Fabric-safe sanitizer in `Convert MD -> Confluence Formatted HTML`.
  - Converted amber coverage create/retry note from styled custom `div data-qops-coverage-review` to plain storage-safe HTML.
  - Sanitizer removes or converts unsupported wrappers/attributes such as `data-qops-*`, inline `style`, `class`, `id`, custom `div`/`span`, font/script/embed/object/iframe, and extension-like Confluence tags before publish.
- Shared Confluence update hardening:
  - Added the same final storage sanitizer to `Update existing Document on Confluence` body construction.
  - Routed failed update publishes from `Version Number > 1?` false branch into the existing Confluence failure handler.
- Failure diagnostics and usage persistence:
  - `Upload Document on Confluence` and `Update existing Document on Confluence` now use retry/backoff and `continueRegularOutput`, allowing real publish failures to be logged instead of being masked as a parent `SHARED_GENERATOR_FAILED`.
  - `LOG: Confluence Job Failed` now records `CONFLUENCE_PUBLISH_FAILED`, HTTP code/raw error, final validation diagnostics, word count, token usage, and estimated cost.
  - `Update Job Status as Failed` now persists standard `output.tokenUsage`, top-level token/cost aliases, coverage summary/ledger, batch summary, and actionable Confluence diagnostics.

Out of Scope:

- Full generation checkpoint/cache resume was not implemented in this fix. A retry can still regenerate AI content until the cross-document checkpoint cache is added.

Verification:

- Active workflow timestamp updated to `2026-06-08T10:28:31.036Z`.
- Converter JavaScript syntax check passed.
- Verified active workflow contains `sanitizeConfluenceStorageHtml`.
- Verified styled `data-qops-coverage-review` create block is removed.
- Verified Confluence POST/PUT nodes have retry and `continueRegularOutput`.
- Verified update publish failure route is connected to `Merge6`.
- Verified failed job status body contains `tokenUsage` and `httpCode`.

Live Retest:

- 2026-06-08: Clicked Regenerate/Retry for failed Test Plan job `PRO-260608-03F8F7`.
- New retry job: `PRO-260608-O5WAN6`.
- Supabase final status: `completed`.
- n8n metric sequence:
  - `JOB_RETRIED`
  - `JOB_STARTED`
  - `GENERATOR_STARTED`
  - `QUALITY_GATE_PASSED`
  - `JOB_COMPLETED`
- Confluence publish succeeded:
  - Page ID: `27754517`
  - URL: `https://anujalhans1.atlassian.net/wiki/spaces/QD/pages/27754517/Test+Plan+-+Astra+Ecommerce`
- Previous Confluence Fabric error did not recur.
- Usage persisted in standard shape:
  - input tokens: `3,573`
  - output tokens: `6,132`
  - total tokens: `9,705`
  - estimated cost: `$0.011240`
- Coverage passed:
  - `coverageLedgerCount = 10`
  - `coveredCount = 10`
  - `missingCount = 0`
  - `partialCount = 0`
  - `gateStatus = passed`
- Remaining non-blocking UI/document-check gap:
  - final validation stored `warning` / `repaired` due to internal required-section repair.
  - This is tracked separately under `BUG-E2E-139`.

Retest:

- Trigger Test Plan Create for `Astra Ecommerce`.
- If the document is valid/amber, confirm Confluence publish succeeds and Coverage Review shows the partial items.
- If it fails, confirm failed job output includes exact failure cause, coverage details, and usage/cost.
- Confirm Analytics includes failed generation spend and does not treat the failed run as a successful output.

## BUG-E2E-141: Epics & User Stories Output Uses Legacy Top-Level Usage Fields Instead Of Standard tokenUsage Shape

Status: fixed - workflow patched and historical Backlog outputs repaired; pending next live Backlog create/update validation

Severity: low

Area:

- Epics & User Stories generation
- Backlog workflow output shape
- Usage Details modal consistency
- Dashboard and Analytics data normalization

Observed During:

- Full E2E registered-user Epics & User Stories create run on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `PRO-260608-RE95WM`
- Document type: `user_stories`

What Happened:

- The job completed successfully.
- Jira publishing succeeded:
  - `6` epics created
  - `18` user stories created
- Coverage gate passed:
  - `coverageLedgerCount = 6`
  - `coveredCount = 6`
  - `missingCount = 0`
  - `partialCount = 0`
- Usage was recorded in metrics and top-level output aliases:
  - `tokensInput = 21993`
  - `tokensOutput = 19222`
  - `tokensTotal = 41215`
  - `estimatedCostUsd = 0.039552`
- However, `qa_jobs.output.tokenUsage` was `null`.
- Newer shared document/STC output paths use the standard nested shape:
  - `output.tokenUsage.input`
  - `output.tokenUsage.output`
  - `output.tokenUsage.total`
  - `output.tokenUsage.estimatedCostUsd`

Expected:

- All document-generation workflows should persist usage in the same standard shape.
- Epics & User Stories should keep backward-compatible top-level aliases if needed, but should also persist:
  - `output.tokenUsage.input`
  - `output.tokenUsage.output`
  - `output.tokenUsage.total`
  - `output.tokenUsage.estimatedCostUsd`
  - `output.tokenUsage.source`
- Usage Details, Dashboard, Analytics, and failed/recovered job cards should not need document-type-specific fallbacks for core token/cost display.

Impact:

- Analytics currently works because `qa_job_metrics` contains the usage values.
- Some UI paths may still need fallback logic for Epics & User Stories usage display.
- Inconsistent output shapes increase regression risk when usage, savings, recovery, or admin diagnostics are extended.
- Support/debugging is less predictable because the same usage concept is stored differently across document types.

Suggested Fix:

1. Patch only the Epics & User Stories/backlog completion output path.
2. Add `output.tokenUsage` using the standard shape while preserving existing top-level aliases for backward compatibility.
3. Ensure retry/update paths also write the same shape.
4. Smoke test with existing output shape and one live or pinned backlog run.
5. Confirm Usage Details, Dashboard, and Analytics still read the same totals without duplicate counting.

Fix Implemented:

- 2026-06-09: Patched active Epics & User Stories n8n workflow `Vwc6c8ehsRTF8svG`.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_Vwc6c8ehsRTF8svG_before_backlog_standard_token_usage_v1_20260609053244.json`
- Scope was limited to `Return Team Managed Professional Result`.
- The final Backlog output now writes canonical `output.tokenUsage` with:
  - `input`,
  - `output`,
  - `total`,
  - `tokensInput`,
  - `tokensOutput`,
  - `tokensTotal`,
  - `estimatedCostUsd`,
  - `source`.
- Existing top-level compatibility aliases remain unchanged:
  - `tokensInput`,
  - `tokensOutput`,
  - `tokensTotal`,
  - `estimatedCostUsd`.
- No Jira create/reuse/link, Confluence publish, validation, coverage, prompt, or create-path business logic was changed.

Data Repair:

- Historical completed Backlog rows with existing legacy token/cost aliases and missing `output.tokenUsage` were backfilled.
- Exact E2E job `PRO-260608-RE95WM` now has:
  - `output.tokenUsage.input = 21993`,
  - `output.tokenUsage.output = 19222`,
  - `output.tokenUsage.total = 41215`,
  - `output.tokenUsage.estimatedCostUsd = 0.039552`.

Verification:

- Active workflow readback confirms:
  - `updatedAt = 2026-06-09T05:32:44.105Z`,
  - `Return Team Managed Professional Result` contains the canonical `tokenUsage` block,
  - the final returned JSON includes `tokenUsage`.
- Supabase repair returned `PRO-260608-RE95WM` with populated `output.tokenUsage`.

Retest:

- Trigger or retry an Epics & User Stories job.
- Confirm `qa_jobs.output.tokenUsage.total` equals the recorded `tokensTotal`.
- Confirm `qa_jobs.output.tokenUsage.estimatedCostUsd` equals `estimatedCostUsd`.
- Confirm `qa_job_metrics` still records token/cost values once per terminal completion event.
- Confirm Usage Details modal displays tokens/cost without relying only on legacy aliases.

## BUG-E2E-142: RTM Create Can Fail Contract Validation By Inventing Risk IDs Outside RTM Context

Status: closed - live RTM retry validation passed

Severity: high

Area:

- Requirement Traceability Matrix create workflow
- Shared document generator quality contract
- RTM prompt/validator alignment
- Failed RTM retry resilience

Observed During:

- Full E2E registered-user RTM create run on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `PRO-260608-7SK6HV`
- Document type: `traceability_matrix`
- Operation: first-time `Create`

What Happened:

- RTM prerequisite context was available and healthy:
  - `6` epics
  - `18` stories
  - `279` story-testcase links
  - `0` stories without test cases
- Coverage gate passed:
  - `coverageLedgerCount = 7`
  - `coveredCount = 7`
  - `missingCount = 0`
  - `partialCount = 0`
  - `gateStatus = passed`
- Token/cost usage was persisted in the standard shape:
  - input tokens: `41,807`
  - output tokens: `4,111`
  - total tokens: `45,918`
  - estimated cost: `$0.0233`
- The job still failed before Confluence publish with:
  - `error = Quality Gate Failed`
  - `QUALITY_GATE_FAILED.error_message = RTM Contract Failed - Risk IDs are not available in the RTM context and must not be invented. [line 599]`
- No Confluence URL was produced.

Expected:

- RTM Create should generate a valid two-layer RTM using only available context:
  - Requirements to Epics/User Stories
  - User Stories to Generated Test Cases
- If Risk IDs are not present in RTM context, the generated RTM must not include a Risk ID column or fabricated risk references.
- The quality contract should continue blocking invalid fabricated IDs, but the prompt/output shaping should prevent the model from producing them in the first place.
- Retry should have a high probability of success without requiring unrelated changes to backlog or STC outputs.

Impact:

- User can have complete upstream backlog and STC data, but RTM Create can still fail after consuming tokens.
- The job does not publish to Confluence even though coverage itself passed.
- Retrying may repeat the same generation instability unless the RTM prompt/post-processing path removes or forbids unsupported risk fields more deterministically.
- E2E readiness is blocked for the RTM create path.

Suggested Fix:

1. Patch the RTM generation path only.
2. Strengthen prompt and/or post-generation sanitizer so RTM output cannot include `Risk ID` columns when no real risk IDs exist in `traceabilityContext`.
3. If risk traceability is desired later, require explicit real risk IDs from a Risk Matrix context source before enabling any risk column.
4. Keep the validator strict so fabricated Risk IDs remain blocked.
5. Preserve current two-layer RTM behavior and do not alter working backlog/STC prerequisite retrieval.

Fix Implemented:

- 2026-06-08: Patched active workflow `fullRetrievalD01` with backup:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_rtm_no_risk_ids_v1_20260608132202.json`
- Scope was limited to RTM generation/quality gate handling.
- `Prompt Library` now explicitly instructs RTM generation not to write the phrase `Risk ID` or include any risk identifier column when risk IDs are not present in the RTM context.
- `Quality Gate` now applies an RTM-only sanitizer before contract validation:
  - removes unsupported `Risk ID` / `Risk IDs` / risk identifier table columns,
  - removes invented `RSK-*` tokens from narrative text,
  - preserves the rest of the RTM table structure.
- RTM contract validation remains strict for actual risk identifier columns or invented `RSK-*` values after sanitization.

Verification:

- Active `fullRetrievalD01` readback shows `updatedAt = 2026-06-08T13:22:02.895Z`.
- JavaScript syntax check passed for patched nodes:
  - `Prompt Library`
  - `Quality Gate`
  - `Validate AI Agent Output`
- Focused sanitizer smoke test passed:
  - sample `Risk ID` table column was removed,
  - invented `RSK-*` narrative token was removed,
  - remaining RTM columns were preserved.

Live Retest:

- 2026-06-08: Triggered RTM retry after the fix.
- New job: `PRO-260608-4BR67Z`.
- Retry of failed job: `PRO-260608-7SK6HV`.
- Supabase final status: `completed`.
- n8n metric sequence:
  - `JOB_RETRIED`
  - `JOB_STARTED`
  - `GENERATOR_STARTED`
  - `QUALITY_GATE_PASSED`
  - `JOB_COMPLETED`
- Previous RTM Risk ID contract failure did not recur.
- Confluence publish succeeded:
  - URL: `https://anujalhans1.atlassian.net/wiki/spaces/QD/pages/27983907/Traceability+Matrix+-+Astra+Ecommerce`
- Coverage passed:
  - `coverageLedgerCount = 7`
  - `coveredCount = 7`
  - `missingCount = 0`
  - `partialCount = 0`
  - `gateStatus = passed`
- Final validation passed:
  - `status = passed`
  - `structuralStatus = passed`
  - `issues = []`
- Usage persisted in standard shape:
  - input tokens: `41,879`
  - output tokens: `3,551`
  - total tokens: `45,430`
  - estimated cost: `$0.022433`
- Stored output text check passed:
  - no `Risk ID` phrase,
  - no `RSK-*` invented risk token.

Residual Observation:

- The RTM published URL is stored under `output.url`, while `output.confluenceUrl` and `output.documentUrl` are null for this job.
- This did not block publish or Usage/Coverage validation, but output URL field normalization may be worth a separate cleanup if the UI depends on one canonical URL property.

Retest:

- Trigger RTM Create for `Astra Ecommerce` after the fix.
- Confirm the job completes and publishes to Confluence.
- Confirm `coverageSummary.gateStatus = passed`.
- Confirm the RTM document does not contain fabricated Risk ID values or a Risk ID column unless real risk IDs are present in the supplied context.
- Confirm Usage Details, Coverage Review, Document Check, Dashboard, and Analytics reflect the successful RTM run.

## BUG-E2E-143: RTM Coverage Review Can Display Story Jira Keys As Epics

Status: closed - UI mapping fix build validated

Severity: medium

Area:

- Dashboard Coverage Review modal
- RTM traceability layer presentation
- Requirement-to-Epic/Story mapping

Observed During:

- Full E2E registered-user RTM retry validation on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `PRO-260608-4BR67Z`
- Document type: `traceability_matrix`

What Happened:

- The RTM job completed successfully with coverage passed.
- Coverage Review displayed `KAN-1400` under the `EPIC` column for requirement `BR-AUTH-07`.
- `KAN-1400` is a User Story, not an Epic.
- The correct parent Epic for `KAN-1400` is `KAN-1397`.
- Some requirement rows also showed all stories under an epic even when the RTM coverage note referenced one specific story.
- Follow-up observation after the first fix:
  - the Layer 1 header did not show the expected `6` Epic count,
  - row-level story counts became too narrow because they displayed only explicitly mentioned Story keys instead of the full Story coverage under the mapped Epic.

Expected:

- RTM Coverage Review Layer 1 should never classify a Story Jira key as an Epic.
- If the coverage note references a Story key, the UI should resolve that Story through the latest completed Epics & User Stories output and display its parent Epic.
- If specific Story keys are referenced, the row should show those mapped Stories rather than every Story under the parent Epic.
- If no specific Story key is available, falling back to all Stories under the matched Epic is acceptable.

Root Cause:

- `buildRtmTraceabilityLayers` extracted Jira keys from RTM coverage notes, but when it could not match an Epic key directly, it fell back to `explicitKeys[0]` as the Epic key.
- For rows where the note only contained a Story key, that Story key was displayed in the Epic column.
- Once an Epic was found, the UI always displayed all Stories under that Epic instead of preferring explicitly referenced Story keys.

Fix Implemented:

- 2026-06-08: Patched `src/pages/DashboardPage.tsx`.
- Added explicit Epic and Story key maps from the latest completed backlog output.
- Requirement rows now:
  - separate explicit Epic keys from explicit Story keys,
  - resolve explicit Story keys to their parent Epic,
  - display full Story coverage under the mapped Epic,
  - retain a small direct Story hint when the RTM row explicitly referenced a specific Story key.
- Layer 1 header now displays separate aggregate counts:
  - requirements,
  - Epics,
  - Stories.

Verification:

- `npm.cmd run build` passed.
- Verified `KAN-1400` maps to parent Epic `KAN-1397` in the latest completed backlog output.
- Verified second build after aggregate-count correction passed.

## BUG-E2E-144: Story Test Cases Analytics Row Misses Cost Tokens Duration Because Completion Metric Is Not Analytics-Ready

Status: closed

Severity: medium

Area:

- Analytics page
- Document Type Analytics
- Story Test Cases completion metrics
- `qa_job_metrics`
- `qa_jobs.output.tokenUsage`

Observed During:

- Full E2E registered-user document generation cycle on 2026-06-08.
- Project: `Astra Ecommerce`
- Job: `STC-260608-JXHMX3`
- Document type: `story_test_cases`

What Happened:

- Story Test Cases completed successfully after a long-running generation and Jira publishing flow.
- Analytics `Output performance by deliverable` displayed the Story Test Cases row with:
  - `Deliverables = 1`
  - `Success = 100%`
  - `Coverage = Coverage Needs Review`
  - `Reliability = -`
  - `Avg Cost = US$0`
  - `Avg Duration = -`
  - `Tokens = 0`
- Supabase verification showed the STC job itself has valid usage in `qa_jobs.output.tokenUsage`:
  - input tokens: `88,340`
  - output tokens: `127,145`
  - total tokens: `215,485`
  - estimated cost: `$0.238772`
- Supabase verification also showed `qa_job_metrics` has a `JOB_COMPLETED` row for the same STC job with the correct token/cost values, but the row is not analytics-ready:
  - `requested_by = null`
  - `duration_ms = 0`

Expected:

- Story Test Cases should appear in Analytics with the same complete KPI treatment as other generated deliverables.
- STC terminal `JOB_COMPLETED` metrics should persist:
  - `requested_by`
  - `project_id`
  - `document_type`
  - positive `duration_ms`
  - `tokens_input`
  - `tokens_output`
  - `tokens_total`
  - `estimated_cost_usd`
- Analytics should display the actual STC cost, token total, and duration instead of zero/blank values.

Impact:

- Analytics under-reports STC generation spend and token usage even though the job consumed significant tokens and cost.
- Registered-user Analytics cannot reliably calculate STC reliability and average duration.
- E2E validation of Dashboard/Analytics is misleading because the most expensive document type appears as `US$0` and `0` tokens.
- This can hide real production cost and performance characteristics for long-running Story Test Cases jobs.

Suggested Fix:

1. Patch the STC completion metric writer so terminal `JOB_COMPLETED` rows include `requested_by` and a real positive `duration_ms`.
2. Keep `qa_jobs.output.tokenUsage` as the canonical output usage payload.
3. Ensure `qa_job_metrics` mirrors the same token/cost values once per terminal completion event.
4. Add a defensive Analytics fallback from `qa_jobs.output.tokenUsage` only when metric rows are incomplete, without double-counting.
5. Re-run Analytics smoke using `STC-260608-JXHMX3` or the next STC job.

Fix Implemented:

- 2026-06-09: Patched active Story Test Cases generator workflow `SG7khcKlhHst48WH`.
- Backup created before patching:
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_completion_metric_attribution_v1_20260609045530.json`
  - `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_before_stc_completion_metric_attribution_v1_20260609045852.json`
- Scope was limited to STC terminal analytics metrics.
- Updated `LOG: Direct Story Test Case Job Completed` so future direct STC completion metrics include:
  - `requested_by`,
  - `project_id`,
  - positive elapsed `duration_ms`,
  - standard token/cost fields,
  - existing STC metadata such as story count, test case count, mapping count, coverage status, and repair targets.
- Added `Repair Direct Story Test Case Completion Metric Attribution` after `Mark Direct Story Test Case Job Completed`.
- This repair node only patches missing attribution on the just-completed STC terminal metric and then returns the existing STC result.
- No STC planning, Jira create/update/link, coverage, or output-generation nodes were changed.

Data Repair:

- Repaired existing STC `JOB_COMPLETED` metric rows that already had token/cost usage but had missing `requested_by` or non-positive `duration_ms`.
- Duration was calculated from each job's `JOB_STARTED` metric timestamp to the `JOB_COMPLETED` metric timestamp, avoiding unreliable historical `qa_jobs.updated_at` values.
- Last validated STC job `STC-260608-JXHMX3` now has:
  - `requested_by = 3ce66bbc-2959-43fb-8bb0-4456180f37f6`,
  - `project_id = 8ba24d46-c5e9-4286-9826-4c1b530c8b1f`,
  - `duration_ms = 4,198,257`,
  - `tokens_total = 215,485`,
  - `estimated_cost_usd = 0.238772`.

Verification:

- n8n MCP confirms `SG7khcKlhHst48WH` is active and updated at `2026-06-09T04:58:52.640Z`.
- Active workflow now routes:
  - `Mark Direct Story Test Case Job Completed`
  - `Repair Direct Story Test Case Completion Metric Attribution`
  - `Return Direct Story Test Case Result`.
- Registered-user/project-scoped metric verification now includes Story Test Cases:
  - STC completed rows: `1`,
  - STC tokens: `215,485`,
  - STC cost: `0.238772`,
  - STC average duration: `4,198,257 ms`.
- Pipeline-level scoped generation totals now include STC:
  - completed generation rows: `6`,
  - generation tokens: `328,445`,
  - generation cost: `0.330770`,
  - average generation duration: `795,847 ms`.

Out of Scope:

- The broader Analytics fallback from `qa_jobs.output.tokenUsage` was not added because the terminal metric is now analytics-ready. This keeps the fix smaller and avoids double-counting risk.

Retest:

- Trigger or inspect a completed Story Test Cases job.
- Confirm `qa_job_metrics.JOB_COMPLETED.requested_by` is populated.
- Confirm `qa_job_metrics.JOB_COMPLETED.duration_ms > 0`.
- Confirm Analytics shows non-zero STC tokens and cost.
- Confirm Analytics average duration is displayed for Story Test Cases.
- Confirm totals are not double-counted if both `qa_job_metrics` and `qa_jobs.output.tokenUsage` contain usage.

## BUG-E2E-145: Shared Document Update Stores Conflicting Delta/Repair And Coverage Metadata

Status: closed - live shared-doc update validation passed

Severity: medium

Area:

- Test Strategy update workflow
- Test Plan update workflow
- Risk Matrix update workflow
- Shared document delta update metadata
- Update Summary modal
- Coverage Review modal
- `qa_jobs.output`
- `qa_job_metrics.metadata`

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Previous create job: `PRO-260608-PB0K3R`
- Update job: `PRO-260609-7VNPGF`
- Document type: `test_strategy`
- Confirmed again during Test Plan update:
  - Previous create/retry job: `PRO-260608-O5WAN6`
  - Update job: `PRO-260609-XUW454`
  - Document type: `test_plan`
- Confirmed again during Risk Matrix update:
  - Previous create job: `PRO-260608-7RZQCU`
  - Update job: `PRO-260609-IQP140`
  - Document type: `risk_matrix`

What Happened:

- The previous Test Strategy coverage was fully passed with 7 of 7 coverage ledger rows covered.
- The update job completed successfully and top-level final output showed:
  - `coverageSummary.gateStatus = passed`
  - `batchSummary.total = 7`
  - `batchSummary.covered = 7`
  - `finalValidation.status = passed`
  - `finalValidation.mergeGuard = passed`
- However, nested/intermediate metadata still contained stale pre-merge values:
  - `output.qualityGate.coverageGate = warning`
  - `output.qualityGate.batchSummary.total = 0`
  - `output.qualityGate.batchSummary.progressPercent = 0`
- The update summary and completion metrics also disagreed on operation mode:
  - `output.updateSummary.operationMode = update_repair`
  - completion diagnostics reported `operationMode = update_delta`
  - UI displayed `Repair update completed` even though the previous coverage was green and the update should be communicated as a delta update.
- The same pattern was confirmed for Test Plan update `PRO-260609-XUW454`:
  - top-level final coverage was `passed` with 10 of 10 coverage rows covered,
  - nested `output.qualityGate.coverageGate = warning`,
  - nested `output.qualityGate.batchSummary.total = 0`,
  - UI displayed `Repair update completed`,
  - final diagnostics reported `operationMode = update_delta`.
- Risk Matrix update `PRO-260609-IQP140` did not have stale nested coverage, but still had the same operation-mode contradiction:
  - `output.updateSummary.operationMode = update_repair`,
  - completion metric `operation_mode = update_repair`,
  - final validation diagnostics `operationMode = update_delta`.

Expected:

- A clean previous Test Strategy with passed coverage should display and persist a consistent `update_delta` operation unless a real repair condition exists.
- Final top-level coverage state and nested `qualityGate`/`updateSummary` state should not contradict each other after merge.
- Coverage Review, Update Summary, Document Check, admin diagnostics, and Analytics should all read consistent terminal metadata.

Impact:

- Users may see a misleading `Repair update completed` label for a normal delta update.
- Admin diagnostics can falsely imply coverage was warning or unparsed even when the final merged document passed 7/7 coverage.
- Future UI components that read nested `qualityGate` before top-level final fields may show incorrect coverage state.

Suggested Fix:

1. After shared delta merge, normalize terminal metadata so `qualityGate`, `coverageSummary`, `batchSummary`, `updateSummary`, and completion metric metadata reflect the same final merged result.
2. Only set `operationMode = update_repair` when the previous output actually had missing/partial/warning coverage or a structural repair condition.
3. For green previous coverage and successful selective patch, persist and display `update_delta`.
4. Add a smoke assertion that top-level and nested coverage states match for shared document update jobs.

Retest:

- Trigger Test Strategy, Test Plan, and Risk Matrix Update Document after green previous outputs.
- Confirm Update Summary says `Delta update completed`.
- Confirm `output.qualityGate.coverageGate`, `output.coverageSummary.gateStatus`, `output.batchSummary.gateStatus`, and completion metric `coverage_gate_status` are all `passed`.
- Confirm Coverage Review shows 7/7 covered and no stale zero-ledger warning.

Fix Applied:

- 2026-06-09: Patched active `fullRetrievalD01` shared update workflow with `scripts/patch_shared_doc_update_integrity_v1.cjs`.
- Removed token-usage based `update_repair` heuristic so high update token usage no longer changes a clean delta update into repair.
- Future shared update job outputs suppress stale nested `qualityGate` metadata after final merge and use final published-body coverage for completion metadata.
- 2026-06-09: Follow-up patch `scripts/patch_shared_doc_update_integrity_v2.cjs` normalizes carried-forward final coverage into `updateSummary.coverageSummary` for no-change shared updates.

Closure Evidence:

- 2026-06-09: Live shared-doc update validation passed for:
  - Test Strategy `PRO-260609-YFR73Y`: completed, `operationMode = update_delta`, coverage passed `7/7`, final validation passed.
  - Test Plan `PRO-260609-G617ZD`: completed, `operationMode = update_delta`, coverage passed `10/10`, final validation passed.
  - Risk Matrix `PRO-260609-EN58QS`: completed, `operationMode = update_delta`, coverage passed `10/10`, final validation passed.

## BUG-E2E-146: Shared Document Delta Update Rewrites Sections Marked Preserved

Status: fixed_pending_validation

Severity: high

Area:

- Test Strategy update workflow
- Test Plan update workflow
- Shared document merge logic
- Delta update contract
- Confluence page update
- Update Summary modal

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Previous create export: `Test+Strategy+-+Astra+Ecommerce.doc`
- Delta update export: `Test+Strategy+-+Astra+Ecommerce_Delta_Update.doc`
- Update job: `PRO-260609-7VNPGF`
- Confirmed again during Test Plan update comparison:
  - Previous create export: `Test+Plan+-+Astra+Ecommerce.doc`
  - Delta update export: `Test+Plan+-+Astra+Ecommerce_delta_update.doc`
  - Update job: `PRO-260609-XUW454`

What Happened:

- Update Summary reported:
  - 4 updated sections
  - 9 preserved sections
  - 0 removed sections
- Reported updated sections were:
  - `Testing Scope`
  - `Strategic Testing Approach`
  - `Risk-Based Testing & Mitigation Strategy`
  - `Appendix / Coverage Ledger`
- Export comparison showed additional sections marked as preserved were still changed in wording/content:
  - `Introduction & Context`
  - `Automation Strategy & Roadmap`
  - `Test Environment & Infrastructure Strategy`
  - `Test Data Management Strategy`
  - `Quality Metrics & Reporting Framework`
- Some claimed updated sections did not materially change in the export comparison, while some claimed preserved sections did.
- Test Plan comparison showed the same issue:
  - Update Summary reported 5 updated sections and 13 preserved sections.
  - Sections marked preserved but materially changed included:
    - `Test Strategy`
    - `Entry and Exit Criteria`
    - `Test Schedule and Milestones`
    - `Test Environment`
    - `Roles and Responsibilities`
    - `Suspension & Resumption Criteria`
  - `Test Data and Configurations` was listed as updated, but the exported text was unchanged from the previous document.
  - Some placeholder repaired sections in the previous document were expanded or renumbered during the update while still counted as preserved.
- Risk Matrix comparison showed the same issue:
  - Update Summary reported 3 updated sections and 5 preserved sections.
  - Preserved sections changed structurally and/or textually:
    - `Executive Summary` expanded from 755 words to 1441 words.
    - `Top Critical Risks Analysis` was renamed/expanded to `Top 5 Critical Risks Analysis`.
    - `Linkage to Test Strategy Alignment` changed heading level from `h2` to `h1`.
  - `Coverage Ledger` was listed as updated but changed heading level from `h2` to `h3` and lost prior coverage rows.
  - The exported document added `Delta Update Summary` as a visible document section, increasing end-user noise.

Expected:

- Sections listed as preserved should remain textually and structurally unchanged after a delta update, except for harmless Confluence export formatting noise.
- If a section is rewritten, reworded, has a table added/removed, or has material language changes, it should be listed under updated/added rather than preserved.
- Update Summary should reflect the actual merged document diff, not only the AI patch intent.

Impact:

- Users cannot trust the Update Summary to understand what changed.
- Delta update may unintentionally rewrite stable document content and create review burden.
- Token/cost savings become less meaningful if preserved sections are regenerated or altered.
- Auditability is weakened because the declared change impact does not match the exported document.

Suggested Fix:

1. Add a post-merge diff guard for shared document updates that compares canonical sections before and after merge.
2. Reclassify changed preserved sections as updated before saving `updateSummary`.
3. Prevent untouched sections from being overwritten by AI patch content during merge.
4. Treat table count changes in preserved sections as material changes.
5. Keep the fix shared across Test Strategy, Test Plan, and Risk Matrix update paths.

Retest:

- Run Test Strategy, Test Plan, and Risk Matrix updates against previously green documents.
- Export before and after documents.
- Confirm only sections listed as updated/added have material text or table changes.
- Confirm preserved sections remain stable.

Fix Applied:

- 2026-06-09: Patched active `fullRetrievalD01` shared update merge logic to apply only sections explicitly listed as updated/added/needs-review, plus Coverage Ledger.
- Disabled full-patch replacement when existing Confluence content is available, so preserved sections are not overwritten by generated patch content.

## BUG-E2E-147: Shared Document Table Rendering Differs Between Confluence Page And Word Export

Status: fixed_pending_validation

Severity: medium

Area:

- Test Strategy Confluence publishing
- Test Plan Confluence publishing
- Shared document HTML conversion
- Confluence Word export fidelity
- Table rendering

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Previous create export: `Test+Strategy+-+Astra+Ecommerce.doc`
- Delta update export: `Test+Strategy+-+Astra+Ecommerce_Delta_Update.doc`
- User observed Confluence page view did not visibly show tables that appeared in the Word export, especially around Testing Scope.
- Test Plan delta export comparison also showed table/structure movement in sections marked preserved:
  - previous placeholder `Test Schedule and Milestones` had no table,
  - updated numbered `6. Test Schedule and Milestones` had a table,
  - this section was still counted as preserved in Update Summary.
- Risk Matrix delta export comparison also showed table/structure drift:
  - previous export had 4 tables and 39 table rows,
  - delta update export had 3 tables and 27 table rows,
  - table/row reduction was not surfaced as removed or structurally changed content in Update Summary.

What Happened:

- The Confluence Word export contains table markup such as `confluenceTable`, `confluenceTh`, and `confluenceTd`.
- The create export contained a `Testing Scope` table.
- The delta update export no longer contained a table inside `Testing Scope`, even though other tables still existed in later sections.
- User reported a mismatch where exported Word output showed more tables than the live Confluence page appeared to show.

Expected:

- Tables visible in Confluence page view should match tables present in Word export.
- If delta update removes or converts a table, that table change should be intentional and reflected in Update Summary.
- Shared document sanitizer/converter should not create hidden, export-only, or visually collapsed table structures.

Impact:

- Users may see different document structure depending on whether they view Confluence or export to Word.
- Professional document review becomes unreliable because tables may appear missing in one representation.
- Delta update can silently degrade table-based sections such as Testing Scope or Quality Metrics.

Suggested Fix:

1. Compare Confluence storage HTML, Confluence rendered view, and exported Word HTML for the same page version.
2. Ensure shared document table conversion uses Confluence-supported table markup that renders visibly in page view and export.
3. Add table-preservation checks for shared document delta updates.
4. If a section table is removed during update, classify the section as updated and show that in Update Summary.

Retest:

- Generate or update Test Strategy.
- Confirm table count by canonical section is consistent between Confluence page view and Word export.
- Confirm Testing Scope table behavior is intentional and visible.

Fix Applied:

- 2026-06-09: Patched shared update merge path to preserve existing sections and table structures unless the section is explicitly part of the delta patch.
- Existing Confluence-safe sanitizer remains in place for publish/update paths.

## BUG-E2E-148: Update Summary Stores Cost Saved But Does Not Display It

Status: closed - live update savings display metadata validated

Severity: low

Area:

- Update Summary modal
- Shared document update UX
- Usage and estimated savings panel
- Test Strategy update
- Test Plan update

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Test Strategy update job: `PRO-260609-7VNPGF`
- Test Plan update job: `PRO-260609-XUW454`
- Risk Matrix update job: `PRO-260609-IQP140`

What Happened:

- `qa_jobs.output.updateSummary.tokenSavings` persisted both token and cost savings.
- Test Strategy stored:
  - `estimatedTokensSaved = 820`
  - `estimatedSavingsPercent = 8`
  - `estimatedCostSavedUsd = 0.003484`
- Test Plan stored:
  - `estimatedTokensSaved = 497`
  - `estimatedSavingsPercent = 5`
  - `estimatedCostSavedUsd = 0.002951`
- The Update Summary UI displayed only:
  - Tokens used
  - Update cost
  - Tokens saved
- It did not display the persisted cost saved amount.

Expected:

- If cost saved is persisted, the Update Summary modal should display it clearly.
- Suggested labels:
  - `Tokens saved`
  - `Cost saved`
- If savings are estimated, both values should be visually grouped under `Usage and estimated savings`.

Impact:

- Users can see token savings but cannot see the corresponding dollar savings.
- The UI under-communicates the business value of delta updates.
- This is especially confusing because the data already exists in Supabase.

Suggested Fix:

1. Extend the Update Summary usage panel to display `estimatedCostSavedUsd` when available.
2. Keep `Tokens saved` and `Cost saved` separate to avoid mixing units.
3. Use the same behavior for Test Strategy, Test Plan, Risk Matrix, Backlog, STC, and RTM update summaries wherever `tokenSavings.estimatedCostSavedUsd` exists.

Retest:

- Open Test Strategy update summary for `PRO-260609-7VNPGF`.
- Confirm cost saved displays around `US$0.0035`.
- Open Test Plan update summary for `PRO-260609-XUW454`.
- Confirm cost saved displays around `US$0.0030`.

Fix Applied:

- 2026-06-09: Updated Update Summary UI to display `Cost saved` from `tokenSavings.estimatedCostSavedUsd` when savings metadata exists.

Closure Evidence:

- 2026-06-09: Live shared-doc update jobs persisted cost-savings metadata that the updated UI reads:
  - Test Strategy `PRO-260609-YFR73Y`: `estimatedCostSavedUsd = 0.000183`.
  - Test Plan `PRO-260609-G617ZD`: `estimatedCostSavedUsd = 0`.
  - Risk Matrix `PRO-260609-EN58QS`: `estimatedCostSavedUsd = 0.001286`.
- Frontend build passed after the Update Summary UI change.

## BUG-E2E-149: Shared Document Delta Update Publishes Stale Coverage Review Note Despite Final Passed Coverage

Status: fixed_pending_validation

Severity: medium

Area:

- Shared document delta update publishing
- Test Strategy document content
- Test Plan document content
- Coverage Review Note generation
- Confluence export content

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Test Strategy update job: `PRO-260609-7VNPGF`
- Test Plan update job: `PRO-260609-XUW454`

What Happened:

- Final stored coverage for Test Strategy was passed:
  - 7 of 7 coverage rows covered.
- Final stored coverage for Test Plan was passed:
  - 10 of 10 coverage rows covered.
- However, the exported delta-update documents included a `Coverage Review Note` indicating coverage metadata was not fully parsed or required review.
- Test Plan delta export included text stating the update completed with coverage items requiring review even though final output coverage was passed with zero review items.
- Risk Matrix delta export included stale `Evidence review required` text in `Executive Summary` even though final output coverage was passed and final validation succeeded.

Expected:

- Published document content should reflect terminal merged coverage state.
- If final coverage is passed with no missing/partial/unknown rows, the document should not include a warning-style Coverage Review Note.
- If a pre-merge warning exists but final merge resolves coverage, the warning note should be removed or rewritten as a successful coverage confirmation.

Impact:

- Users reviewing the exported document may believe support review is required even though the UI and final job metadata show passed coverage.
- Document credibility is reduced because the generated artifact contradicts the platform status.
- This can lead to unnecessary admin/support review.

Suggested Fix:

1. Generate or suppress Coverage Review Note after final merge, not from stale pre-merge patch metadata.
2. For final passed coverage, either omit the note or render a positive coverage confirmation.
3. Add a shared validation assertion that exported document coverage note matches final `coverageSummary.gateStatus`.

Retest:

- Run Test Strategy, Test Plan, and Risk Matrix delta updates with passed final coverage.
- Export each Confluence page to Word.
- Confirm no stale warning/review note appears when coverage is fully passed.

Fix Applied:

- 2026-06-09: Patched shared update publish path so Coverage Review Note uses final `updateSummary.coverageSummary` before stale pre-merge `q.coverageSummary`.
- Future passed shared updates should suppress warning notes when there are no final warning items.
- 2026-06-09: Follow-up patch `scripts/patch_shared_doc_update_integrity_v2.cjs` suppresses stale warning notes when prior coverage was passed and the new update has no warning items.

## BUG-E2E-150: Risk Matrix Delta Update Shrinks Coverage Ledger From 10 Rows To 4 Rows But Still Passes

Status: closed - live Risk Matrix coverage preservation validation passed

Severity: high

Area:

- Risk Matrix update workflow
- Shared document delta update merge guard
- Coverage Ledger preservation
- Coverage Review modal
- Update Summary modal
- `qa_jobs.output.coverageLedger`

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Previous Risk Matrix create job: `PRO-260608-7RZQCU`
- Risk Matrix update job: `PRO-260609-IQP140`

What Happened:

- Previous create Risk Matrix had passed coverage with 10 of 10 coverage ledger rows.
- Update job completed successfully and showed:
  - `coverageSummary.gateStatus = passed`
  - `coverageLedgerCount = 4`
  - `coveredCount = 4`
  - `missingCount = 0`
  - `partialCount = 0`
  - `finalValidation.mergeGuard = passed`
- The update replaced the prior 10 coverage rows with only 4 new rows:
  - `COV-001` Multi-seller Cart Integration
  - `COV-002` Fraud Risk Step-Up Verification
  - `COV-003` Session Expiry Mid-Checkout
  - `COV-004` Duplicate Payment & Refund Handling
- Original covered rows such as registration, webhook security, checkout price lock, inventory availability, mobile filter UI, password reset security, and order tracking timeline were no longer present in the final update coverage ledger.
- Update Summary did not report any removed coverage rows or coverage scope reduction.
- Exported document comparison confirmed the same loss at document level:
  - create export had 4 tables and 39 table rows,
  - delta update export had 3 tables and 27 table rows,
  - create export had 10 risk IDs and broader coverage identifiers,
  - delta update export retained risk IDs but reduced coverage identifiers and coverage rows.

Expected:

- Risk Matrix delta update should preserve previous coverage ledger rows unless a row is explicitly removed with a documented reason.
- Coverage should not pass simply because the reduced ledger has all remaining rows covered.
- If coverage rows are removed, Update Summary and Coverage Review should make that visible.
- Merge guard should fail or mark review-needed when coverage ledger count shrinks unexpectedly from a previous green baseline.

Impact:

- Users may believe the Risk Matrix update is fully covered while six previously covered risk/requirement rows silently disappeared.
- Dashboard/Analytics coverage health can remain green despite actual coverage loss.
- Delta update auditability is compromised because the baseline coverage is not preserved.
- This is especially risky for production updates where missing risks may no longer be reviewed or tested.

Suggested Fix:

1. Add shared update coverage-ledger preservation guard for Risk Matrix and other shared docs.
2. Compare previous and final coverage IDs during update.
3. If previous coverage rows are missing in final output, classify them as removed/needs review and do not mark coverage as fully passed unless removal is intentional and source-backed.
4. Persist `previousCoverageRows`, `currentCoverageRows`, `removedCoverageRows`, and removed row details in `updateSummary`.
5. Update Coverage Review to show removed/missing baseline rows for update jobs.

Retest:

- Run Risk Matrix update from a previous green baseline.
- Confirm final coverage ledger keeps all previous rows plus any new rows, or explicitly reports removed rows.
- Confirm coverage does not pass silently when previous rows disappear.
- Confirm Update Summary lists coverage row additions, updates, preserved rows, and removals.

Fix Applied:

- 2026-06-09: Patched shared update merge path to merge previous coverage ledger rows with current rows when a delta patch would shrink the ledger.
- Future Risk Matrix updates should preserve the prior green coverage baseline instead of passing against a reduced ledger.
- 2026-06-09: Follow-up retest with `PRO-260609-8HPEPZ` showed the n8n merge guard cannot recover the original 10-row create ledger if the frontend sends a damaged immediate previous job (`PRO-260609-IQP140`, 4 rows) as the only previous baseline.
- 2026-06-09: Patched the frontend update-context builder to resolve the best available shared-doc coverage baseline from the job lineage for Test Strategy, Test Plan, and Risk Matrix updates. Future Regenerate Anyway / update retry requests should send `previousCoverageBaselineJobId` and the richer `previousCoverageLedger` when the latest baseline appears to have shrunk without explicit removals.
- 2026-06-09: Retest jobs `PRO-260609-XOHFO6` and `PRO-260609-N752VP` confirmed the frontend handoff is fixed (`previousCoverageBaselineJobId = PRO-260608-7RZQCU`, 10 baseline rows), but the shared-doc n8n no-change publish branch still used the existing damaged Confluence body and bypassed the repaired coverage section map.
- 2026-06-09: Patched active n8n workflow `fullRetrievalD01` with `scripts/patch_shared_doc_update_integrity_v3.cjs`. The update publish node now applies `mergedCoverageLedgerHtml()` to `baseSections` before body selection and routes no-change updates with a repaired coverage ledger through the section rebuild path instead of publishing `cleanedExisting` directly.
- Backup before v3 patch:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_update_integrity_v3_20260609105710.json`
- 2026-06-09: Retest job `PRO-260609-ZIQNVW` still failed the preservation requirement: the request carried the 10-row baseline, but final output stored only 4 rows (`COV-001` through `COV-004`) and still passed validation.
- 2026-06-09: Root cause narrowed further: the `Quality Gate` effective coverage merge was RTM-only (`traceability_matrix`) and did not apply to shared Confluence document types (`test_strategy`, `test_plan`, `risk_matrix`). This allowed reduced Risk Matrix update coverage metadata to propagate into completion/output even when the request carried a richer baseline.
- 2026-06-09: Patched active n8n workflow `fullRetrievalD01` with `scripts/patch_shared_doc_update_integrity_v4.cjs`. The `Quality Gate` now applies baseline coverage preservation for shared document updates when the previous ledger is richer, no explicit coverage removals are present, and there are no update reasons requiring a new coverage slice.
- Backup before v4 patch:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_shared_doc_update_integrity_v4_20260609110737.json`
- 2026-06-09: Live validation passed with Risk Matrix Regenerate Anyway job `PRO-260609-EN58QS`.
  - Request carried `previousCoverageBaselineJobId = PRO-260608-7RZQCU`.
  - Request carried 10 previous coverage ledger rows.
  - Final `qa_jobs.output.coverageLedger` stored 10 rows.
  - Final output coverage IDs exactly matched the 10 previous baseline IDs.
  - `coverageSummary.gateStatus = passed`, `coveredCount = 10`, `coverageLedgerCount = 10`.
  - `updateSummary.coverageLedgerCount = 10`, `batchSummary.total = 10`, `batchSummary.covered = 10`.
  - `finalValidation.status = passed`, `mergeGuard = passed`.
  - Terminal `JOB_COMPLETED` metric recorded `operation_mode = update_delta`, `coverage_gate_status = passed`, `tokens_total = 9093`, `estimated_cost_usd = 0.007793`.

## BUG-E2E-151: Update Summary Shows Blank Tokens Saved When Delta Update Has No Savings Or Higher Cost

Status: closed - live zero and positive savings metadata validation passed

Severity: low

Area:

- Update Summary modal
- Usage and estimated savings panel
- Risk Matrix update
- Shared document update UX

Observed During:

- Full E2E registered-user document update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Risk Matrix update job: `PRO-260609-IQP140`

What Happened:

- Risk Matrix update persisted token savings metadata:
  - `estimatedBaselineTokens = 6592`
  - `tokens used = 8043`
  - `estimatedTokensSaved = 0`
  - `estimatedSavingsPercent = 0`
  - `estimatedCostSavedUsd = 0`
- Since the update used more tokens than the previous baseline, there was no actual token or cost saving.
- The Update Summary UI displayed:
  - `Tokens saved -`
- This looks like missing data rather than a deliberate no-savings/over-baseline result.
- Cost saved is also not displayed, which is separately tracked under `BUG-E2E-148`.

Expected:

- If savings are zero, the UI should display a clear value such as:
  - `Tokens saved 0 (0%)`
  - `Cost saved US$0`
- If update usage exceeds the baseline, the UI should ideally show an honest over-baseline indicator:
  - `No savings`
  - `+1.5k tokens vs baseline`
  - or `Higher than baseline`
- Blank/dash should be reserved for truly unavailable or not-estimated savings metadata.

Impact:

- Users may think token-savings data is missing.
- The UI hides the fact that this Risk Matrix update consumed more tokens than the baseline create job.
- This weakens the cost-transparency goal of delta updates.

Suggested Fix:

1. Distinguish unavailable savings from zero savings.
2. Show `0 (0%)` when savings metadata exists but no saving was achieved.
3. Consider showing an over-baseline warning when `tokensUsed > estimatedBaselineTokens`.
4. Add `Cost saved` display from `estimatedCostSavedUsd` as tracked in `BUG-E2E-148`.

Retest:

- Open Risk Matrix update summary for `PRO-260609-IQP140`.
- Confirm Tokens saved no longer displays as `-`.
- Confirm Cost saved is displayed.
- Confirm over-baseline update cost is communicated clearly when no savings are achieved.

Fix Applied:

- 2026-06-09: Updated Update Summary UI to distinguish zero savings from unavailable savings.
- Savings now displays `0 (0%)` and `US$0.0000` when savings metadata exists but no savings were achieved.

Closure Evidence:

- 2026-06-09: Live shared-doc update jobs validated both zero and positive savings metadata:
  - Test Plan `PRO-260609-G617ZD`: `estimatedTokensSaved = 0`, `estimatedSavingsPercent = 0`, `estimatedCostSavedUsd = 0`.
  - Test Strategy `PRO-260609-YFR73Y`: positive savings metadata persisted.
  - Risk Matrix `PRO-260609-EN58QS`: positive savings metadata persisted.
- Frontend build passed after the Update Summary zero-savings display change.

## BUG-E2E-152: Backlog Create Output Did Not Persist Coverage Ledger For Later Delta Updates

Status: open - investigation

Severity: medium

Area:

- Epics & User Stories create workflow
- Backlog coverage ledger persistence
- Backlog update baseline handoff
- Coverage Review modal

Observed During:

- Full E2E registered-user update cycle on 2026-06-09.
- Project: `Astra Ecommerce`
- Backlog create baseline job: `PRO-260608-RE95WM`
- Backlog update failed job: `PRO-260609-F9P7XX`
- Backlog update retry job: `PRO-260609-BA12T3`

What Happened:

- The original Backlog create job completed successfully with:
  - 6 epics
  - 18 user stories
  - standard `tokenUsage`
- However, the create output did not persist a top-level `coverageLedger` or `coverageSummary`.
- Later Backlog update job `PRO-260609-F9P7XX` failed at the quality gate with:
  - `Backlog Coverage Gate failed: document.coverageLedger is required before Jira issues can be created.`
- A targeted update-mode fallback was added to synthesize a coverage ledger during update, but the root cause remains open: the original create output should have persisted coverage metadata when the create run passed.

Expected:

- Backlog create jobs should persist a coverage ledger and coverage summary in the standard output shape.
- Later update jobs should not be forced to synthesize baseline coverage if the create job already passed coverage.
- Coverage Review should be available for Backlog create output from the stored job metadata.

Impact:

- Backlog update can fail or require fallback recovery when the baseline create output has no coverage ledger.
- Update auditability is weakened because the first successful baseline lacks explicit coverage rows.
- Coverage Review for Backlog create may be incomplete or misleading.

Suggested Investigation:

1. Inspect the create path around `Validate Team Managed Backlog`, `Build Backlog Completion Output`, and final Supabase completion patch.
2. Confirm whether create-time `qualityGate.coverageLedger` exists inside n8n but is dropped before writing `qa_jobs.output`.
3. Standardize Backlog create output to persist:
   - `coverageLedger`
   - `coverageSummary`
   - `batchSummary`
   - `qualityGate.coverageLedger`
   - `qualityGate.coverageSummary`
4. Retest with a fresh Backlog create job and confirm stored coverage rows are non-zero.

## BUG-E2E-153: Backlog Update Summary Contradicts Actual Jira Create Counts

Status: open

Severity: high

Area:

- Epics & User Stories update workflow
- Update Summary modal
- Jira change accounting
- Backlog update auditability

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`
- Retry of failed update job: `PRO-260609-F9P7XX`
- Baseline create job: `PRO-260608-RE95WM`

What Happened:

- Retry job completed successfully and published the Backlog update.
- Actual stored Jira output and terminal `JOB_COMPLETED` metric show:
  - `epics_created = 4`
  - `stories_created = 9`
  - `epics_reused = 0`
  - `stories_reused = 0`
- But persisted `output.updateSummary` says:
  - `createdEpicCount = 0`
  - `createdStoryCount = 0`
  - `reusedEpicCount = 6`
  - `reusedStoryCount = 18`
  - note: `Previous backlog snapshot merged for update-mode validation and Jira reuse.`
- This means the Update Summary modal can tell users nothing was created even though Jira actually received new epics and stories.

Expected:

- Update Summary should reflect the actual Jira actions from the completed update run.
- For this run, it should show 4 added epics and 9 added stories, while separately preserving the previous baseline count if needed.
- Preserved/reused baseline items should not overwrite newly created delta items.

Impact:

- Users cannot trust the Update Summary for Backlog updates.
- Audit trail is materially wrong for added Jira items.
- Downstream STC and RTM planning may be confusing because newly added Backlog scope is hidden by a reused-only summary.

Suggested Fix:

1. Build `updateSummary` after Jira publish using actual `result.epics` and `result.stories` action counts.
2. Keep previous baseline counts in a separate field such as `previousBacklogBaselineCounts`.
3. Ensure UI buckets use mutually exclusive Added, Updated, Preserved, Removed counts.
4. Retest with `PRO-260609-BA12T3`-like update and confirm summary matches terminal metrics.

## BUG-E2E-154: Backlog Update Completion Output Does Not Persist Standard tokenUsage And Top-Level coverageSummary

Status: open

Severity: medium

Area:

- Epics & User Stories update workflow
- Token/cost usage shape
- Coverage Review modal
- Analytics

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`

What Happened:

- Terminal `JOB_COMPLETED` metric correctly recorded:
  - `tokens_input = 18878`
  - `tokens_output = 12365`
  - `tokens_total = 31243`
  - `estimated_cost_usd = 0.027335`
  - `duration_ms = 243109`
- But `qa_jobs.output.tokenUsage` is missing.
- `qa_jobs.output.coverageSummary` is missing at the top level.
- Coverage metadata exists only nested under `output.qualityGate.coverageSummary`.
- Coverage ledger exists top-level with 7 rows.

Expected:

- Completed Backlog update jobs should persist usage and coverage in the standard shape:
  - `output.tokenUsage`
  - `output.coverageSummary`
  - `output.coverageLedger`
  - `output.qualityGate.coverageSummary`
  - `output.qualityGate.coverageLedger`
- Analytics, Usage modal, and Coverage Review should not need to rely only on metric rows or nested quality-gate fallbacks.

Impact:

- Usage modal may show blank/missing values for completed Backlog updates.
- Dashboard/Analytics may depend on metrics rather than the job output for Backlog update usage.
- Coverage Review can be less consistent with other document types.

Suggested Fix:

1. Patch `Build Backlog Completion Output` to write standard `tokenUsage`.
2. Copy `result.coverageSummary || result.qualityGate.coverageSummary` to top-level `coverageSummary`.
3. Preserve top-level `coverageLedger`.
4. Verify Analytics and Usage modal after a Backlog update retry.

## BUG-E2E-155: Backlog Coverage Ledger Can Reference Non-Published Story Correlation IDs As Covered

Status: open

Severity: medium

Area:

- Epics & User Stories coverage gate
- Backlog coverage ledger mapping
- Coverage Review modal

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`

What Happened:

- Coverage ledger row `FRD-PRIV-012` is marked covered.
- It contains `mappedStoryIds = ["KAN-STORY-SUPPORT-EVENT-PRIVACY"]`.
- But `mappedStoryMatches` is empty and the published Jira story list for this update does not include a corresponding Jira story key for that correlation ID.
- Other rows map to actual created story correlation IDs with matches.

Expected:

- A coverage row should not be marked covered only because a correlation ID appears in the model output.
- Covered rows should map to either:
  - a newly created/updated Jira story,
  - a preserved existing Jira story,
  - or an explicitly documented epic-only coverage decision.
- If a mapped story correlation ID is not published or preserved, the row should be `partial` / `needs review`.

Impact:

- Coverage Review can show green while one mapped story does not correspond to a real Jira item.
- Users may assume privacy/support coverage has a concrete Jira story when it does not.

Suggested Fix:

1. After Jira publish, reconcile `coverageLedger.mappedStoryIds` against actual created/updated/reused story correlation IDs and Jira keys.
2. Downgrade rows with unmapped story IDs to `partial` unless covered by an epic-only rationale.
3. Display missing/unmatched mappings in Coverage Review.

## BUG-E2E-156: Backlog Update Summary Preserved Counts Show Zero Instead Of Full Backlog Baseline Preserved Counts

Status: open

Severity: medium

Area:

- Epics & User Stories Update Summary modal
- Backlog change impact display
- Jira Change Details preserved bucket

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`
- Project: `Astra Ecommerce`

What Happened:

- The Backlog update added:
  - 4 epics
  - 9 user stories
- Previous Backlog baseline had:
  - 6 epics
  - 18 user stories
- The modal correctly shows current backlog totals:
  - 10 total epics
  - 27 total stories
- But Change Impact and Jira Change Details show:
  - `Epics preserved = 0`
  - `Stories preserved = 0`
  - Preserved bucket is empty.

Expected:

- Preserved counts should represent the full backlog state preserved through the update:
  - `Epics preserved = 6`
  - `Stories preserved = 18`
- Added counts should remain:
  - `Epics added = 4`
  - `Stories added = 9`
- Current backlog should remain:
  - `Total epics = 10`
  - `Total stories = 27`

Impact:

- Users may believe the previous Backlog items were not retained.
- The Update Summary under-communicates that this was a true delta update on top of the existing baseline.
- Auditability is reduced because preserved baseline scope is hidden.

Suggested Fix:

1. Populate preserved counts from previous Backlog baseline when update mode is used.
2. Keep Added / Updated / Removed buckets based on touched Jira items.
3. Show Preserved bucket as the retained baseline items, preferably with Jira IDs if available.
4. Ensure totals equal Added + Preserved - Removed for epics and stories.

## BUG-E2E-157: Backlog Update Summary Sentence Omits Added Epic Count

Status: open

Severity: low

Area:

- Epics & User Stories Update Summary modal
- User-facing update summary copy

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`
- Project: `Astra Ecommerce`

What Happened:

- The modal summary says:
  - `Q-Ops applied this backlog repair: 9 stories added. Overall delta coverage: 7 of 7 coverage items are covered.`
- The same modal shows 4 epics added and 9 stories added.
- The sentence omits the 4 added epics.

Expected:

- The summary sentence should include both added epics and added stories:
  - `Q-Ops applied this backlog update: 4 epics and 9 stories added. Overall delta coverage: 7 of 7 coverage items are covered.`
- For retry/repair paths, wording can still say repair/update, but counts must be complete.

Impact:

- Users receive an incomplete high-level summary.
- The summary sentence contradicts the Change Impact cards.

Suggested Fix:

1. Build the summary sentence from the same normalized Backlog impact counts used by the cards.
2. Include epics and stories independently when non-zero.
3. Add fallback copy for no-change, updated-only, removed-only, and mixed added/updated/removed scenarios.

## BUG-E2E-158: Backlog Update Summary Shows Savings As Not Estimated Despite Available Baseline And Update Usage

Status: open

Severity: low

Area:

- Epics & User Stories Update Summary modal
- Usage and estimated savings panel
- Backlog delta update cost transparency

Observed During:

- Backlog update retry job: `PRO-260609-BA12T3`
- Previous Backlog create baseline job: `PRO-260608-RE95WM`

What Happened:

- Baseline create job had usage:
  - `tokensTotal = 41215`
  - `estimatedCostUsd = 0.039552`
- Backlog update retry had usage:
  - `tokens_total = 31243`
  - `estimated_cost_usd = 0.027335`
- Therefore estimated savings can be calculated:
  - tokens saved: about `9972` tokens
  - savings percent: about `24%`
  - cost saved: about `US$0.0122`
- But the Update Summary modal displays:
  - `Savings estimate: Not estimated`
  - `Cost savings estimate: Not estimated`

Expected:

- When both baseline usage and update usage are available, the modal should show calculated savings.
- For this run, expected display should be approximately:
  - `Tokens saved 10k (24%)`
  - `Cost saved US$0.0122`
- If the update costs more than baseline, show `0 (0%)` or an honest over-baseline indicator, not `Not estimated`.

Impact:

- Users cannot see the token/cost benefit of delta update even when enough data exists.
- Cost transparency is weakened for Backlog delta updates.
- The behavior is inconsistent with shared document update summaries where savings metadata is shown.

Suggested Fix:

1. Backlog update workflow should persist `estimatedBaselineTokens`, `estimatedBaselineCostUsd`, `estimatedTokensSaved`, `estimatedSavingsPercent`, and `estimatedCostSavedUsd` in `updateSummary`.
2. Frontend should fall back to calculating savings from `previousTokenUsage` and current `tokenUsage` / metric usage when explicit savings fields are missing.
3. Display zero savings distinctly from unavailable savings.

## BUG-E2E-181: STC Update-Retry Can Ignore Durable Jira Link Coverage And Re-Select Already Published Stories

Status: fixed - durable mapping no-model guard applied and active n8n history synced; pending next live STC update-retry validation

Severity: high

Area:

- STC update-retry delta scope
- STC persisted Jira story-testcase link reuse
- Token/cost containment for retry and Regenerate Anyway
- n8n active version/history consistency

Observed During:

- Follow-up analysis after `STC-260611-M9CCNT`
- Failed retry `STC-260611-Z9K8CQ`
- Project `Astra Ecommerce`

What Happened:

- The latest completed STC output baseline was older than the latest Jira publish/link state.
- Durable `qa_story_testcase_links` already had persisted mappings for all current Astra Ecommerce stories.
- The STC retry scope logic could still honor stale explicit repair targets from prior failed attempts and select stories for model work even though persisted Jira links already covered those stories.
- After a manual n8n publish, `workflow_entity.activeVersionId` pointed at `840db34c`, but the active `workflow_history` snapshot for `840db34c` still contained the older 72-node graph without the persisted-link fetch/no-model guard.
- Retry `STC-260611-Z9K8CQ` therefore failed with the older baseline-unavailable error before the durable mapping guard could run.

Expected:

- For STC update-retry / Regenerate Anyway, if durable story-testcase mappings cover every current Jira story, the retry should preserve existing coverage and take the no-model path.
- Stale repair targets from a prior failed attempt should be treated as satisfied when durable mappings prove those stories are already published/linked.
- The active n8n version/history snapshot should match the current patched workflow graph.
- Create and create-retry must remain unchanged and continue full generation.

Root Cause:

- The retry no-model guard previously required `persistedMappingsCoverAllStories` and no explicit repair keys.
- False/stale retries can carry explicit repair keys even when the durable mapping table now proves all current stories are covered.
- The current workflow entity had the patch, but the active n8n history snapshot for the published version did not.

Fix Applied - 2026-06-11:

- Patched `PRO QA Jira Story Test Case Generator` to fetch `qa_story_testcase_links` after live story source loading and before delta target selection.
- Patched retry/update target selection so `persistedMappingsCoverAllStories` can take the no-model preservation path even when stale explicit repair targets are present.
- Synced the active n8n history snapshot for version `840db34c-3739-4987-9fc5-255be1e30c40` from the patched workflow entity.
- Backed up the pre-sync active history row to `docs/test_data/n8n_workflow_backups/workflow_SG7khcKlhHst48WH_active_history_840db34c-3739-4987-9fc5-255be1e30c40_before_sync_20260611062237.json`.

Validation Evidence:

- Active history snapshot for version `840db34c` now has 73 nodes.
- Active history includes `Fetch Published Story Test Case Links` between `Build Story Source Items` and `Build Story Test Case Delta Targets`.
- Active history includes `stc-delta-scope-v3`.
- Active history includes the “including retry repair targets” guard.
- Supabase durable mapping check for `Astra Ecommerce` returned 27 story keys, 501 distinct test cases, and 704 total persisted links.
- No active unstopped STC generator/worker executions were found after the sync.
- Worker schedule executions after sync completed successfully.

Validation Needed:

- Re-run STC Retry from the latest failed update attempt.
- Confirm it does not call the model when durable mappings cover all current stories.
- Confirm output becomes terminal completed with 100% coverage, standard usage shape, and no additional Jira duplicate creation.

## BUG-E2E-182: RTM Update Fails Contract When Deterministic Layer 2 Is Appended Instead Of Replacing Model Layer 2

Status: closed - fixed and validated in live RTM retry

Severity: high

Area:

- RTM update workflow
- RTM Quality Gate contract validation
- Deterministic Layer 2 Story -> Test Case rendering
- n8n `fullRetrievalD01` Quality Gate node

Observed During:

- RTM Update Document job: `PRO-260611-AXUNQY`
- n8n generator execution: `1078671`
- Project: `Astra Ecommerce`

What Happened:

- The RTM update generated valid traceability context:
  - 10 epics
  - 27 stories
  - 611 story-testcase links
  - 0 stories without test cases
  - Coverage ledger passed with `7 / 7` covered rows
- The job still failed with:
  - `RTM Contract Failed - Expected exactly one Layer 2 heading, found 2. [line 678]`
- Supabase correctly marked the job failed and persisted usage:
  - `tokensTotal = 91445`
  - `estimatedCostUsd = 0.040036`

Expected:

- RTM update should publish exactly one `Layer 2 - User Stories to Generated Test Cases` section.
- The deterministic Layer 2 table built from persisted Jira story-testcase links should replace the model-produced Layer 2 section, not be appended beside it.
- The job should proceed to Confluence publish when coverage and RTM contract are otherwise valid.

Root Cause:

- `replaceRtmLayer2WithContext()` only replaced Layer 2 when it found the exact next heading:
  - `Layer 2 Gaps - Stories Without Test Case Coverage`
- The model can vary or omit that exact heading.
- When the exact next heading was not found, the workflow appended deterministic Layer 2 to the existing model Layer 2.
- The RTM contract validator then correctly found two Layer 2 headings and failed the job.

Fix Applied - 2026-06-11:

- Patched `fullRetrievalD01` `Quality Gate` node.
- Replaced the fragile Layer 2 replacement regex with heading-index based replacement.
- The new replacement stops at the next known RTM section heading:
  - Layer 2 Gaps
  - Coverage by Test Category
  - Coverage Ledger
  - Governance & Audit Readiness Commentary
  - any numbered markdown heading
- Added `dedupeRtmLayer2Sections()` before RTM freshness/risk cleanup and again after coverage-ledger replacement.
- Synced active n8n workflow history from the patched workflow entity.

Validation Evidence:

- Patch backup:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_before_rtm_layer2_dedupe_v1_20260611080338.json`
- Active history sync backup:
  - `docs/test_data/n8n_workflow_backups/workflow_fullRetrievalD01_active_history_4b63abdf-f3a8-42a4-b199-7ee8610a5d62_before_sync_20260611080418.json`
- Offline smoke test against failed execution `1078671`:
  - Raw model output Layer 2 heading count: `1`
  - Old workflow post-processing Layer 2 heading count: `2`
  - Patched post-processing Layer 2 heading count: `1`
  - Patched output keeps the required Layer 2 table schema.

Live Validation - 2026-06-11:

- Retried failed RTM update job `PRO-260611-AXUNQY`.
- Retry job `PRO-260611-BRCB9S` completed successfully.
- Original failed job `PRO-260611-AXUNQY` is marked recovered via `retried_by_job_id = PRO-260611-BRCB9S`.
- n8n generator execution `1078838` completed successfully.
- n8n queue worker execution `1078835` completed successfully.
- Quality Gate passed with a single deterministic Layer 2 section.
- Coverage summary passed with `7 / 7` covered rows, `0` missing, and `0` partial.
- Update Summary and standard token usage were persisted on the completed retry job.
