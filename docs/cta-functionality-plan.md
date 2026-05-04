# Q-Ops Agent CTA Functionality Plan

Date: 2026-04-30

## Purpose

This plan documents the clickable UI elements in Q-Ops Agent that currently have no meaningful behavior, placeholder behavior, hardcoded data, or only partial behavior. It proposes practical features and click behaviors that match the objective of the project: helping QA teams turn requirements, designs, transcripts, and technical documents into reusable QA intelligence, knowledge bases, and production-ready deliverables.

The current end-to-end core flows are working:

- Login and logout with static `admin/admin` credentials.
- Theme toggle with local storage persistence.
- Explore page navigation and comparison table modal.
- Knowledge Base artifact upload to the n8n webhook.
- Document generation request to the n8n webhook.
- Job polling, status panels, generated document links, and Jira output rendering.
- Reset buttons for both dashboard forms.

The missing work is mostly in the operational shell around those flows: search, notifications, auditability, project setup, artifact management, analytics, settings, help, documentation, status, and legal pages.

## Files Reviewed

Primary source files:

- `src/App.tsx`
- `src/main.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/ExploreMorePage.tsx`
- `src/lib/api.ts`
- `src/hooks/useJobPolling.ts`
- `src/theme/ThemeProvider.tsx`
- `src/theme/tokens.css`
- `src/index.css`
- `tailwind.config.js`

Supporting component files were also reviewed under:

- `src/components/common`
- `src/components/login`
- `src/components/dashboard`
- `src/components/explore`

Project documentation reviewed:

- `README.md`
- `FUNCTIONALITY.md`
- `docs/superpowers/plans/2026-04-24-stitch-redesign-implementation.md`
- `docs/superpowers/specs/2026-04-24-stitch-redesign-implementation-design.md`

## CTA Inventory

| CTA or UI Element | Location | Current Behavior | Recommended Behavior | Priority |
|---|---|---|---|---|
| Search operations input | Dashboard header | Text can be typed, but nothing searches | Global command/search palette for projects, artifacts, jobs, generated docs, help articles | P0 |
| Notifications bell | Dashboard header | Icon and unread dot only | Notification center with job updates, failures, unread counts, mark read, deep links | P0 |
| Help icon | Dashboard header | No action | Contextual help drawer for current tab, backend troubleshooting, support/contact | P1 |
| Dashboard side nav: Artifacts | Dashboard sidebar | Button exists, no handler | Artifact repository page/list with upload history, file metadata, previews, downloads, reprocess actions | P0 |
| Dashboard side nav: Analytics | Dashboard sidebar | Button exists, no handler | QA operations analytics dashboard: coverage, risks, generation volume, job performance | P1 |
| Dashboard side nav: Settings | Dashboard sidebar | Button exists, no handler | Settings area for API base URL, integrations, user profile, notification preferences | P0 |
| Dashboard side nav: Documentation | Dashboard sidebar | Button exists, no handler | In-app documentation page or external docs route | P1 |
| View Audit Log | Dashboard hero actions | Button exists, no handler | Audit log modal/page with timeline of uploads, generation runs, resets, logins, output links | P0 |
| New Project | Dashboard hero actions | Button exists, no handler | Project creation wizard that guides the user into knowledge-base upload | P0 |
| Hardcoded active jobs/artifacts text | Dashboard hero | Shows static "3 active processing jobs" and "12 unread artifacts" | Dynamic summary based on real job/artifact state | P1 |
| Compute Load card | Dashboard right rail | Static visual only | System health and queue diagnostics panel | P2 |
| View Help Center | Dashboard quick tips | Button exists, no handler | Opens help center drawer or route filtered by current tab | P1 |
| Login modal "Try demo access" | Login modal | Informational text only | Clickable autofill or one-click demo sign-in using `admin/admin` | P1 |
| Login modal "All systems operational" | Login modal | Static status text only | Opens system status modal with frontend/backend/webhook checks | P2 |
| Documentation link | Landing final CTA/footer | `href="#docs"` but no `#docs` section exists | Route to `/docs` or open documentation modal | P1 |
| Privacy Policy | Landing footer | `href="#"` placeholder | Privacy policy modal/page | P2 |
| Terms of Service | Landing footer | `href="#"` placeholder | Terms of service modal/page | P2 |
| System Status | Landing footer | `href="#"` placeholder | Status page/modal with API health checks | P1 |
| Notifications bell | Explore header | Icon only | Either remove on public page or open product updates/status notifications | P2 |
| Login button on Explore page | Explore header | Navigates to `/`; if already authenticated, redirect works through app route | Improve label/behavior: "Open Dashboard" for authenticated users, "Login" otherwise | P2 |

## Recommended Product Model

Before implementing the CTAs, define a small product model that all features can use.

### Project

A project is the central workspace unit. It should represent one application, feature, release, or QA initiative.

Suggested fields:

- `id`
- `name`
- `description`
- `owner`
- `createdAt`
- `updatedAt`
- `status`: `draft`, `ingesting`, `ready`, `generating`, `blocked`, `archived`
- `knowledgeBaseStatus`
- `artifactCount`
- `generatedDocumentCount`
- `lastActivityAt`

### Artifact

An artifact is any uploaded source file used to build the knowledge base.

Suggested fields:

- `id`
- `projectId`
- `type`: `BRD`, `FRD`, `HLD`, `LLD`, `Transcript`, `UI Design`
- `fileName`
- `fileSize`
- `mimeType`
- `uploadedAt`
- `uploadedBy`
- `processingStatus`
- `sourceUrl` or `downloadUrl`
- `extractedSummary`
- `errorMessage`

### Job

A job is a long-running backend operation.

Suggested fields:

- `id`
- `projectId`
- `type`: `knowledge_base_ingestion`, `document_generation`
- `documentType`
- `status`
- `createdAt`
- `startedAt`
- `completedAt`
- `createdBy`
- `outputUrl`
- `errorMessage`

### Notification

A notification tells the user what changed.

Suggested fields:

- `id`
- `type`: `success`, `error`, `warning`, `info`
- `title`
- `message`
- `createdAt`
- `readAt`
- `projectId`
- `jobId`
- `actionLabel`
- `actionTarget`

### Audit Event

An audit event gives traceability.

Suggested fields:

- `id`
- `actor`
- `action`
- `entityType`
- `entityId`
- `projectId`
- `timestamp`
- `details`
- `ipAddress`

## Feature Plan

## 1. New Project Wizard

Triggered by:

- Dashboard button: `New Project`

Why this matters:

The dashboard currently asks users to type a project name inside the Knowledge Base form, but it does not help them understand what a project means or what to do next. A wizard creates a clear starting point.

Recommended click behavior:

1. User clicks `New Project`.
2. Open a modal or full-screen drawer titled `Create New Project`.
3. Step 1: collect project name, description, owner/product owner, application/module, and optional release name.
4. Step 2: ask what artifacts are available: business docs, technical docs, transcript, UI designs.
5. Step 3: show a recommended upload checklist.
6. User clicks `Create Project`.
7. Create the project record.
8. Automatically switch the dashboard to the Knowledge Base tab.
9. Pre-fill the Knowledge Base project name.
10. Show a success toast: `Project created` / `Upload artifacts to build QA intelligence.`

Suggested states:

- Empty state: no projects yet.
- Draft state: project exists but no artifacts uploaded.
- Ready for ingestion: enough artifacts selected or uploaded.
- Error state: duplicate project name or backend unavailable.

Frontend-only first version:

- Store projects in local state or `localStorage`.
- Pre-fill the existing Knowledge Base form.
- No backend changes required for the first version.

Backend-integrated version:

- `POST /webhook/projects`
- `GET /webhook/projects`
- `GET /webhook/projects/:id`

## 2. Global Search And Command Palette

Triggered by:

- Dashboard input: `Search operations...`

Why this matters:

Q-Ops Agent will accumulate projects, artifacts, jobs, generated documents, Jira links, and Confluence links. Search lets users find the right QA output quickly.

Recommended click behavior:

1. User clicks the search input or presses `Ctrl+K`.
2. Open a command palette overlay.
3. Focus the search field automatically.
4. Search across projects, artifacts, generated documents, jobs, and help articles.
5. Show grouped results:
   - Projects
   - Artifacts
   - Jobs
   - Generated Outputs
   - Help
6. User selects a result with mouse, Enter, or arrow keys.
7. Navigate to the relevant view or open a preview drawer.

Example searches:

- `risk matrix`
- `payment project`
- `failed jobs`
- `BRD`
- `traceability`

Suggested result behavior:

- Project result: open project detail page.
- Artifact result: open artifact preview drawer.
- Job result: open job details modal with status and logs.
- Generated document result: open Confluence/Jira link if available.
- Help result: open the matching help article.

Empty state:

- `No matching operations found. Try searching by project, artifact, or output type.`

Backend-integrated version:

- `GET /webhook/search?q=<query>`

Frontend-only first version:

- Search currently loaded projects, current job IDs, generated outputs, and static help articles.

## 3. Notifications Center

Triggered by:

- Dashboard notification bell.
- Explore page notification bell, if kept.

Why this matters:

Long-running jobs are central to this product. Users need a place to see queued, processing, completed, and failed jobs without relying only on temporary toasts.

Recommended click behavior:

1. User clicks the bell.
2. Open a dropdown or side panel titled `Notifications`.
3. Show unread count.
4. List notifications in reverse chronological order.
5. Each item can include title, message, time, status icon, and action link.
6. User can click `Mark all as read`.
7. User can click a notification to deep-link to the related job, project, or generated output.

Notification examples:

- `Knowledge base completed` -> opens project status.
- `Document generation failed` -> opens job detail with error.
- `Risk Matrix ready` -> opens document link.
- `Backend not reachable` -> opens status/help panel.

Recommended behavior with existing toasts:

- Keep toasts for immediate feedback.
- Also persist important events in notification history.
- Toasts should be temporary; notifications should remain until read.

Backend-integrated version:

- `GET /webhook/notifications`
- `PATCH /webhook/notifications/:id/read`
- `POST /webhook/notifications/mark-all-read`

Frontend-only first version:

- Convert existing `addToast` calls into both toast and in-memory notification events.

## 4. Audit Log

Triggered by:

- Dashboard button: `View Audit Log`

Why this matters:

QA deliverables often need traceability. An audit log lets teams answer who uploaded artifacts, who generated outputs, when a job ran, and what the result was.

Recommended click behavior:

1. User clicks `View Audit Log`.
2. Open an `Audit Log` modal or page.
3. Show a timeline/table of events.
4. Provide filters for project, action type, actor, date range, and status.
5. Each event can expand to show details.
6. Export to CSV can be added later.

Events to track:

- Login success/failure.
- Logout.
- Project created.
- Artifact selected/uploaded.
- Knowledge base ingestion submitted.
- Knowledge base job completed/failed.
- Document generation submitted.
- Document generation completed/failed.
- Output link opened.
- Form reset.
- Settings changed.

Audit row fields:

- Time
- Actor
- Action
- Project
- Entity
- Status
- Details

Frontend-only first version:

- Create an `auditEvents` state store.
- Push events from existing handlers.
- Render a modal from current session history.

Backend-integrated version:

- `GET /webhook/audit-events`
- `POST /webhook/audit-events`

## 5. Artifacts Repository

Triggered by:

- Dashboard sidebar: `Artifacts`
- Search result clicks for artifacts.

Why this matters:

Users should be able to review which source documents were uploaded, whether they processed successfully, and whether a project has enough context for good QA output.

Recommended click behavior:

1. User clicks `Artifacts`.
2. Show an Artifacts page inside the dashboard shell.
3. Display a project selector at the top.
4. Show artifact cards or a table grouped by artifact type.
5. For each artifact, show file name, type, upload date, processing status, and source project.
6. Allow preview/download if a file URL exists.
7. Allow replacing or re-uploading an artifact.
8. Allow reprocess for failed artifacts.

Recommended page sections:

- Summary cards: total artifacts, processed, failed, missing recommended files.
- Filters: project, artifact type, status.
- Artifact list/table.
- Empty state: `No artifacts uploaded yet. Start by creating a knowledge base.`

Potential CTAs inside this feature:

- `Upload More Artifacts`
- `Preview`
- `Download`
- `Replace`
- `Reprocess`
- `Open Knowledge Base`

Backend-integrated version:

- `GET /webhook/artifacts`
- `GET /webhook/artifacts/:id`
- `POST /webhook/artifacts/:id/reprocess`
- `DELETE /webhook/artifacts/:id`

Frontend-only first version:

- After file selection, create local artifact records.
- Use browser file metadata only.
- No preview for server files until backend returns URLs.

## 6. Knowledge Base Management

Triggered by:

- Dashboard sidebar: `Knowledge Base`
- Existing tab: `1. Knowledge Base`

Current behavior:

- The sidebar item switches to the Knowledge Base upload form.
- There is no separate list of existing knowledge bases.

Recommended behavior:

Keep the current upload form, but add a management view around it.

User behavior:

1. User clicks `Knowledge Base`.
2. Show two sub-tabs:
   - `Create / Update`
   - `Existing Knowledge Bases`
3. `Create / Update` keeps the current upload form.
4. `Existing Knowledge Bases` shows known projects and statuses.
5. Each knowledge base can be opened, renamed, archived, refreshed, or used to generate documents.

Knowledge base detail view:

- Project overview.
- Artifact coverage.
- Last ingestion job status.
- Generated documents.
- Recommended next action.

Potential CTAs:

- `Use for Document Generation`
- `Refresh Knowledge Base`
- `Archive`
- `View Artifacts`
- `View Audit`

Backend-integrated version:

- `GET /webhook/knowledge-bases`
- `GET /webhook/knowledge-bases/:projectName`
- `POST /webhook/knowledge-bases/:projectName/archive`

## 7. Document Generation Hub

Triggered by:

- Dashboard sidebar: `Doc Gen`
- Existing tab: `2. Generate Documents`

Current behavior:

- The sidebar item switches to the existing Generate Documents form.

Recommended enhancement:

Keep the working form, but add a generated output history.

User behavior:

1. User clicks `Doc Gen`.
2. Show the existing generation form.
3. Add a `Recent Generated Outputs` panel below or beside it.
4. Show generated artifacts by project and document type.
5. Allow users to reopen document links.
6. Allow rerun with the same project/document type.

Potential CTAs:

- `Open Document`
- `Open Jira Epic`
- `Open Story`
- `Regenerate`
- `Copy Link`
- `View Run Details`

Backend-integrated version:

- `GET /webhook/generated-documents`
- `POST /webhook/generate-qa-doc` already exists.

## 8. Analytics Dashboard

Triggered by:

- Dashboard sidebar: `Analytics`

Why this matters:

The product promises reductions in planning time, improved coverage, and operational efficiency. Analytics makes those outcomes visible.

Recommended click behavior:

1. User clicks `Analytics`.
2. Show QA operations metrics across projects.
3. Include filters for project and date range.
4. Show trend charts and summary cards.

Recommended metrics:

- Knowledge bases created.
- Documents generated by type.
- Average generation time.
- Job success rate.
- Failed jobs by reason.
- Artifact coverage by project.
- Test case count generated.
- Risk items generated.
- Requirement coverage percentage, if backend can provide it.
- Jira epics/stories created.

Recommended panels:

- `Throughput`
- `Coverage`
- `Risk`
- `Reliability`
- `Time Saved`

Frontend-only first version:

- Use current session data and static sample metrics.
- Clearly label sample data as demo until backend integration exists.

Backend-integrated version:

- `GET /webhook/analytics/summary`
- `GET /webhook/analytics/jobs`
- `GET /webhook/analytics/coverage`

## 9. Settings

Triggered by:

- Dashboard sidebar: `Settings`
- Profile/avatar area, if made clickable later.

Why this matters:

The current API URLs are hardcoded in `src/lib/api.ts`. A settings area would let users configure the environment without code changes.

Recommended click behavior:

1. User clicks `Settings`.
2. Show settings page with grouped sections.
3. Save changes locally first.
4. Later, sync settings to backend/user profile.

Recommended sections:

- Profile: name, role, email.
- API: n8n base URL, webhook paths, test connection.
- Integrations: Jira base URL, Confluence space, Supabase status, Chroma status.
- Notifications: email/in-app preferences.
- Security: session timeout, data retention messaging.
- Theme: light/dark/system preference.

High-value setting:

- `API Base URL`: replace the current hardcoded `http://localhost:5678`.

Recommended `Test Connection` behavior:

1. User clicks `Test Connection`.
2. Call a health endpoint.
3. Show pass/fail status for backend, upload webhook, generation webhook, and polling endpoints.

Backend-integrated version:

- `GET /webhook/health`
- `GET /webhook/integrations/status`
- `GET /webhook/settings`
- `PATCH /webhook/settings`

## 10. Documentation And Help Center

Triggered by:

- Landing page `Documentation`
- Footer `Documentation`
- Dashboard sidebar `Documentation`
- Dashboard `Help` icon
- Dashboard `View Help Center`

Why this matters:

The user may not know what BRD, FRD, HLD, LLD, RTM, risk matrix, or knowledge base means. The product should teach the workflow at the moment of need.

Recommended behavior:

Create a `/docs` route or in-app documentation modal.

Recommended sections:

- What is Q-Ops Agent?
- How to create a project.
- What files should I upload?
- What each artifact type means.
- How Knowledge Base creation works.
- How document generation works.
- What to do when a job fails.
- Backend setup for `localhost:5678`.
- Jira and Confluence output behavior.
- FAQ.

Contextual Help behavior:

- If opened from Knowledge Base tab, show upload guidance first.
- If opened from Generate Documents tab, show artifact/document type guidance first.
- If opened from Settings, show API and integration help.

Recommended `View Help Center` behavior:

1. Open a help drawer.
2. Pre-filter articles based on active tab.
3. Include search inside help.
4. Include `Contact Support` or `Copy Diagnostics` later.

Frontend-only first version:

- Static docs content in React or Markdown.

## 11. System Status

Triggered by:

- Landing footer `System Status`
- Login modal `All systems operational`
- Settings `Test Connection`

Why this matters:

The app depends on a local n8n backend. Users need a clear way to know whether failures are caused by the frontend, backend, webhook configuration, or network.

Recommended click behavior:

1. User clicks `System Status`.
2. Open status modal or route.
3. Run checks.
4. Show status for each service.

Recommended status checks:

- Frontend loaded.
- n8n base URL reachable.
- Upload webhook reachable.
- Generate document webhook reachable.
- Job status webhook reachable.
- Job retrieve webhook reachable.
- Jira integration status, if available.
- Confluence integration status, if available.

Status states:

- Operational
- Degraded
- Unreachable
- Not configured

Recommended copy:

- If backend is unavailable: `The frontend is running, but the n8n backend could not be reached at http://localhost:5678.`
- If webhook returns template variables: `The webhook is reachable but not fully configured.`

Backend-integrated version:

- `GET /webhook/health`
- `GET /webhook/integrations/status`

Frontend-only first version:

- Attempt lightweight fetches and handle CORS/network failures.

## 12. Legal And Trust Pages

Triggered by:

- Landing footer `Privacy Policy`
- Landing footer `Terms of Service`
- Security/trust messaging across landing page.

Why this matters:

The product contains enterprise security claims, such as data not being used for model training. Those claims should be backed by accessible policy pages.

Recommended click behavior:

1. User clicks `Privacy Policy` or `Terms of Service`.
2. Navigate to `/privacy` or `/terms`, or open a modal.
3. Show concise policy content.

Recommended Privacy Policy sections:

- Data uploaded.
- How artifacts are processed.
- Storage and retention.
- Model training statement.
- Third-party processors.
- User controls.
- Contact information.

Recommended Terms sections:

- Product use.
- Demo credentials limitation.
- Backend dependency.
- Acceptable use.
- Limitation of liability.

Frontend-only first version:

- Static pages with placeholder legal copy marked for review.

## 13. Demo Access CTA

Triggered by:

- Login modal text: `Having trouble? Try demo access`

Current behavior:

- Static text only.

Recommended click behavior:

Option A: Autofill

1. User clicks `Try demo access`.
2. Fill username `admin` and password `admin`.
3. Show helper text: `Demo credentials filled. Click Login to continue.`

Option B: One-click demo login

1. User clicks `Try demo access`.
2. Log them in directly with demo credentials.
3. Show success toast.
4. Navigate to dashboard.

Recommendation:

Use Option A. It keeps the login action explicit and teaches users the credentials.

## 14. Dynamic Dashboard Summary

Triggered by:

- Dashboard hero summary text.

Current behavior:

- Static text says there are 3 active processing jobs and 12 unread artifacts.

Recommended behavior:

Replace static numbers with live state.

Suggested summary:

- `0 active jobs` if no polling jobs are active.
- `1 active job` if either KB or document job is queued/processing.
- `2 active jobs` if both are queued/processing.
- Artifact count from selected files or backend artifact list.
- Failed jobs count if available.

Click behavior:

- Clicking active jobs opens the notification center or job status area.
- Clicking unread artifacts opens the Artifacts page.

Frontend-only first version:

- Derive counts from `kbJob.state`, `docJob.state`, and current selected files.

## 15. Compute Load And System Diagnostics

Triggered by:

- Dashboard `Compute Load` card.

Current behavior:

- Static 72% indicator.

Recommended click behavior:

1. User clicks the card.
2. Open `System Diagnostics` modal.
3. Show queue length, average generation time, active jobs, backend status, and integration status.

Recommended metrics:

- Current queue load.
- Active jobs.
- Average job duration.
- Last webhook response time.
- Failed requests in current session.
- Backend health.

Frontend-only first version:

- Derive from current session and show backend health checks.

Backend-integrated version:

- `GET /webhook/system/diagnostics`

## 16. Explore Page Notifications

Triggered by:

- Explore header notification bell.

Current behavior:

- Icon only.

Recommended options:

Option A: Remove it from public Explore page.

- Best if notifications are only useful after login.
- Reduces user confusion.

Option B: Repurpose it as product updates/status.

- Click opens product updates, release notes, and status.

Recommendation:

Use Option A unless the product has public announcements. Public pages should focus on exploration and conversion.

## 17. Auth-Aware Explore CTA Behavior

Triggered by:

- Explore page `Login`
- Explore page `Back to login`
- Explore page `Get Started`
- Explore page `Return to login`

Current behavior:

- These navigate to `/`.
- If authenticated, `/` redirects to `/dashboard`, so the flow technically works.

Recommended improvement:

- If user is authenticated, label primary CTAs as `Open Dashboard`.
- If user is unauthenticated, label them as `Login`.
- Preserve existing route behavior.

User behavior:

1. Authenticated user on `/explore` clicks CTA.
2. Navigate directly to `/dashboard`.
3. Unauthenticated user clicks CTA.
4. Navigate to `/` and optionally open login modal.

Implementation note:

- `ExploreMorePage` currently does not receive auth state. This can be passed from `App.tsx` or derived from `localStorage['qops-agent-auth']`.

## Suggested Implementation Phases

## Phase 1: Make All Visible CTAs Do Something Useful

Goal: remove dead clicks and placeholder links.

Tasks:

- Add modal/drawer state primitives for dashboard overlays.
- Implement `New Project` wizard with local state.
- Implement `View Audit Log` modal with session events.
- Implement notification center using existing toast events.
- Implement Help Center drawer with static articles.
- Implement System Status modal with frontend/backend checks.
- Replace footer `href="#"` placeholders with modals or routes.
- Make `Try demo access` autofill credentials.

Recommended verification:

- Click every dashboard header/sidebar/hero CTA.
- Click every landing footer CTA.
- Confirm no click appears inert.

## Phase 2: Add Real Dashboard Sections

Goal: convert sidebar items into actual workspace areas.

Tasks:

- Replace `tab` with a broader dashboard view state:
  - `dashboard`
  - `knowledge`
  - `documents`
  - `artifacts`
  - `analytics`
  - `settings`
  - `docs`
- Build Artifacts page.
- Build Analytics page with session/demo metrics.
- Build Settings page with API base URL and integration status.
- Build Docs page or route.
- Update active sidebar state correctly.

Recommended verification:

- Sidebar active state matches the selected section.
- Existing Knowledge Base and Generate Documents flows still work.
- No polling behavior is broken when switching sections.

## Phase 3: Persist Operational Data

Goal: preserve useful history beyond the current screen.

Tasks:

- Store projects, artifacts, notifications, and audit events in `localStorage` first.
- Add a small client-side store module.
- Persist generated output links.
- Persist read/unread notification state.
- Persist API base URL setting.

Recommended verification:

- Refresh the app and confirm created project, notifications, and audit entries remain.
- Logout/login and confirm appropriate persistence behavior.

## Phase 4: Backend Integration

Goal: move from frontend-only behavior to real system behavior.

Suggested endpoints:

- `GET /webhook/health`
- `GET /webhook/search?q=...`
- `GET /webhook/projects`
- `POST /webhook/projects`
- `GET /webhook/artifacts`
- `GET /webhook/generated-documents`
- `GET /webhook/audit-events`
- `POST /webhook/audit-events`
- `GET /webhook/notifications`
- `PATCH /webhook/notifications/:id/read`
- `GET /webhook/analytics/summary`
- `GET /webhook/integrations/status`
- `GET /webhook/settings`
- `PATCH /webhook/settings`

Recommended verification:

- Backend unavailable states are friendly and specific.
- CORS/network failures show status/help guidance.
- Existing upload/generation endpoints remain unchanged.

## Phase 5: Polish And Accessibility

Goal: make new features feel production-ready.

Tasks:

- Add keyboard support for command palette and modals.
- Add Escape-to-close for all overlays.
- Add focus management for overlays.
- Add empty, loading, success, and error states.
- Add responsive layouts for all new sections.
- Add ARIA labels for icon-only CTAs.
- Add tests or manual smoke scripts if a test framework is introduced.

## Suggested Data Flow

For the first implementation, use this simple flow:

1. Existing submit handlers create jobs.
2. Job polling updates job state.
3. Job state changes create notifications.
4. Important user actions create audit events.
5. Dashboard counters derive from jobs, artifacts, and notifications.
6. Search reads from projects, artifacts, jobs, outputs, and help docs.

This keeps the new CTA behavior connected to what the app already does.

## Acceptance Checklist

Use this checklist when the implementation is complete:

- Every visible button or link has a clear click behavior.
- Placeholder links no longer use `href="#"`.
- `Documentation` opens useful help content.
- `Privacy Policy`, `Terms of Service`, and `System Status` open appropriate pages or modals.
- `New Project` creates or drafts a project and guides the user to artifact upload.
- `View Audit Log` shows user and system actions.
- `Notifications` shows persistent events beyond temporary toasts.
- `Search operations` opens a usable search or command palette.
- `Artifacts`, `Analytics`, `Settings`, and `Documentation` sidebar items render real dashboard sections.
- Hardcoded dashboard counts are replaced or clearly marked as demo.
- `View Help Center` opens contextual help.
- `Try demo access` has an actual action.
- Existing login, upload, generation, polling, reset, comparison modal, and theme behavior still work.

## Highest-Value First Build

If you want the shortest useful implementation path, build these first:

1. `New Project` wizard.
2. `Notifications` center tied to existing toasts/job status.
3. `View Audit Log` session timeline.
4. `Artifacts` sidebar page.
5. `Settings` page with API base URL and `Test Connection`.
6. `Documentation/Help Center` static route or drawer.
7. Footer legal/status modals.

These features will make the UI feel intentional without changing the already-working backend contract.
