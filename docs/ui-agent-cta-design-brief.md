# UI Agent Brief: Q-Ops Agent CTA Functionality Design

Date: 2026-04-30

Source plan: `docs/cta-functionality-plan.md`

## Objective

Update the existing Q-Ops Agent UI designs so every visible CTA has a clear, useful, product-aligned behavior. The current app already works end to end for login, knowledge-base upload, document generation, job polling, theme switching, and the Explore comparison modal. The missing design work is for the surrounding operational UI: search, notifications, project creation, audit log, artifacts, analytics, settings, documentation, help, status, and legal pages.

Design the missing flows as if Q-Ops Agent is a serious enterprise QA operations platform that helps QA teams convert BRD, FRD, HLD, LLD, transcripts, and UI designs into reusable QA intelligence and production-ready QA outputs.

## Product Context

Q-Ops Agent users should be able to:

- Create or select a QA project.
- Upload project artifacts to build a Knowledge Base.
- Generate QA deliverables such as test strategy, test plan, risk matrix, test cases, traceability matrix, epics, and user stories.
- Track long-running backend jobs.
- Review generated outputs and Jira/Confluence links.
- Understand system health, job failures, and backend configuration issues.
- Audit who did what and when.
- Find previous artifacts, jobs, and generated outputs.

## Existing Screens

The app currently has three main routes:

- `/`: Landing/login page.
- `/dashboard`: Authenticated workspace.
- `/explore`: Public explainer/marketing page.

Keep the existing visual direction and layout foundation, but expand the UI states and missing screens/drawers/modals as described below.

## Existing Working CTAs To Preserve

Do not redesign these into different product behaviors unless needed for consistency:

- Landing `Login`: opens login modal.
- Login modal `Login`: validates static `admin/admin` credentials.
- Forgot password flow: shows reset form and success toast.
- Landing `Explore More`: navigates to Explore page.
- Landing `Explore Q-Ops Agent`: navigates to Explore page.
- Explore comparison `See Full Comparison`: expands/collapses table.
- Explore comparison `Open Full View`: opens comparison modal.
- Explore final CTAs: navigate toward login/start.
- Dashboard `Create Knowledge Base`: submits artifact upload.
- Dashboard `Generate Documents`: submits document generation request.
- Dashboard form `Reset`: clears the relevant form.
- Dashboard `Logout`: logs out.
- Theme toggle: switches light/dark theme.

## Missing Or Placeholder CTAs That Need Design

Prioritize these CTAs because they are currently visible but incomplete:

| CTA | Current Issue | UI Agent Should Design |
|---|---|---|
| `Search operations...` | User can type but nothing happens | Global search / command palette |
| Notification bell | Icon only / unread dot only | Notification center |
| Help icon | No action | Contextual help drawer |
| Sidebar `Artifacts` | No action | Artifacts repository view |
| Sidebar `Analytics` | No action | Analytics dashboard view |
| Sidebar `Settings` | No action | Settings view |
| Sidebar `Documentation` | No action | Documentation/help view |
| `View Audit Log` | No action | Audit log modal or page |
| `New Project` | No action | New project wizard |
| Hardcoded job/artifact counts | Static fake numbers | Dynamic dashboard summary design |
| Compute Load card | Static fake card | System diagnostics panel |
| `View Help Center` | No action | Help center drawer/page |
| `Try demo access` | Static text | Demo credential autofill CTA |
| `All systems operational` | Static text | System status modal |
| Landing `Documentation` | Links to missing `#docs` | Documentation page/modal |
| Footer `Privacy Policy` | Placeholder link | Privacy page/modal |
| Footer `Terms of Service` | Placeholder link | Terms page/modal |
| Footer `System Status` | Placeholder link | Status page/modal |
| Explore notification bell | Icon only | Remove or redesign as public updates/status |

## Design Priorities

## P0: Must Design First

These remove the biggest dead-click issues and complete the dashboard shell:

- New Project wizard.
- Notification center.
- Audit Log.
- Artifacts repository.
- Settings page with API/system configuration.
- Global search / command palette.

## P1: Important Next

These make the product easier to understand and operate:

- Help Center.
- Documentation page/drawer.
- System Status modal/page.
- Analytics dashboard.
- Dynamic dashboard summary.
- Demo access CTA behavior.

## P2: Nice To Have

These improve trust and polish:

- Privacy Policy page/modal.
- Terms of Service page/modal.
- Compute Load diagnostics expansion.
- Auth-aware Explore CTAs.
- Public Explore notification behavior or removal.

## Required UI Designs

## 1. New Project Wizard

Entry point:

- Dashboard top action: `New Project`.

Recommended pattern:

- Modal, drawer, or focused wizard overlay.
- Should feel like the first step in a QA workflow, not a generic form.

Screens/states to design:

- Step 1: Project basics.
- Step 2: Available artifact types.
- Step 3: Recommended upload checklist / confirmation.
- Success state.
- Validation errors.

Fields:

- Project name.
- Description.
- Owner or product owner.
- Application/module.
- Release/sprint name.
- Optional tags.

Behavior:

- On create, user should land in the Knowledge Base upload flow with the project name pre-filled.
- Show a success message: `Project created. Upload artifacts to build QA intelligence.`

## 2. Global Search / Command Palette

Entry point:

- Dashboard header search input.
- Optional keyboard shortcut display: `Ctrl K`.

Recommended pattern:

- Centered command palette overlay or large dropdown below search.

Search result groups:

- Projects.
- Artifacts.
- Jobs.
- Generated Outputs.
- Help.

States to design:

- Initial empty state with suggested searches.
- Typing/loading state.
- Results state.
- No results state.
- Keyboard-selected result state.

Example result actions:

- Open project.
- Preview artifact.
- Open job details.
- Open generated document.
- Open help article.

## 3. Notification Center

Entry point:

- Dashboard notification bell.

Recommended pattern:

- Right-side drawer or compact popover.

Content:

- Unread count.
- Reverse chronological notification list.
- Status icons for success/error/info/warning.
- Timestamps.
- Related project/job/document context.
- Action links.

Actions:

- Mark all as read.
- Mark single notification as read.
- Open related job/project/output.

Notification examples:

- Knowledge base completed.
- Document generation failed.
- Risk Matrix ready.
- Backend not reachable.
- New generated Jira stories available.

States:

- Empty state.
- Unread state.
- All read state.
- Error-heavy state.

## 4. Audit Log

Entry point:

- Dashboard action: `View Audit Log`.

Recommended pattern:

- Full page or large modal with table/timeline.

Content:

- Time.
- Actor.
- Action.
- Project.
- Entity.
- Status.
- Details.

Filters:

- Project.
- Action type.
- Actor.
- Date range.
- Status.

Events to represent:

- Login/logout.
- Project created.
- Artifact uploaded.
- Knowledge Base ingestion submitted/completed/failed.
- Document generation submitted/completed/failed.
- Output opened.
- Form reset.
- Settings changed.

States:

- Empty audit log.
- Dense event list.
- Expanded event detail.
- Filtered/no matching results.

## 5. Artifacts Repository

Entry point:

- Dashboard sidebar: `Artifacts`.

Recommended pattern:

- Main dashboard section replacing the central workspace content.

Content:

- Project selector.
- Summary cards: total artifacts, processed, failed, missing recommended files.
- Artifact list/table grouped by type.
- File metadata: name, type, size, upload time, status, project.

Actions:

- Upload more artifacts.
- Preview.
- Download.
- Replace.
- Reprocess failed artifact.
- Open related Knowledge Base.

States:

- No artifacts uploaded yet.
- Artifacts processing.
- Processed artifacts.
- Failed artifacts.
- Missing recommended artifact warning.

## 6. Knowledge Base Management

Entry points:

- Dashboard sidebar: `Knowledge Base`.
- Existing tab: `1. Knowledge Base`.

Design enhancement:

- Keep current upload form.
- Add an `Existing Knowledge Bases` or project list area.

Recommended subviews:

- Create / Update Knowledge Base.
- Existing Knowledge Bases.
- Knowledge Base Detail.

Knowledge Base Detail content:

- Project overview.
- Artifact coverage.
- Last ingestion status.
- Generated documents.
- Recommended next action.

Actions:

- Use for Document Generation.
- Refresh Knowledge Base.
- View Artifacts.
- View Audit.
- Archive.

## 7. Document Generation Hub

Entry points:

- Dashboard sidebar: `Doc Gen`.
- Existing tab: `2. Generate Documents`.

Design enhancement:

- Keep current generation form.
- Add generated output history.

Content:

- Project name input/selector.
- Artifact type cards.
- Job status.
- Recent generated outputs.

Actions:

- Open Document.
- Open Jira Epic.
- Open Story.
- Copy Link.
- Regenerate.
- View Run Details.

States:

- No generated outputs.
- Generation queued.
- Generation processing.
- Generation complete with links.
- Generation failed.

## 8. Analytics Dashboard

Entry point:

- Dashboard sidebar: `Analytics`.

Recommended pattern:

- Dashboard metrics page with filters and charts.

Filters:

- Project.
- Date range.
- Output type.

Recommended metrics:

- Knowledge Bases created.
- Documents generated by type.
- Average generation time.
- Job success rate.
- Failed jobs by reason.
- Artifact coverage.
- Test cases generated.
- Risk items generated.
- Jira epics/stories created.
- Estimated time saved.

Recommended panels:

- Throughput.
- Coverage.
- Risk.
- Reliability.
- Time Saved.

States:

- Demo/sample data state.
- Empty analytics state.
- Loading state.
- Error state.

## 9. Settings

Entry point:

- Dashboard sidebar: `Settings`.

Recommended pattern:

- Settings page with grouped panels.

Sections:

- Profile: name, role, email.
- API: n8n base URL, webhook paths, test connection.
- Integrations: Jira, Confluence, Supabase, Chroma, OpenAI.
- Notifications: in-app/email preferences.
- Security: session timeout, data retention messaging.
- Theme: light/dark/system preference.

Important CTA:

- `Test Connection`

Test Connection result states:

- Backend reachable.
- Backend unreachable.
- Upload webhook unavailable.
- Generation webhook unavailable.
- Integration not configured.

## 10. Documentation And Help Center

Entry points:

- Landing `Documentation`.
- Footer `Documentation`.
- Dashboard sidebar `Documentation`.
- Dashboard help icon.
- Dashboard `View Help Center`.

Recommended pattern:

- `/docs` page, dashboard drawer, or help modal.

Documentation topics:

- What is Q-Ops Agent?
- How to create a project.
- What files should I upload?
- What BRD, FRD, HLD, LLD, transcript, and UI design mean.
- How Knowledge Base creation works.
- How document generation works.
- What each generated output type means.
- What to do when a job fails.
- Backend setup for `localhost:5678`.
- Jira/Confluence output behavior.
- FAQ.

Contextual behavior:

- From Knowledge Base tab: show upload guidance first.
- From Generate Documents tab: show output generation guidance first.
- From Settings: show backend/integration help first.

## 11. System Status

Entry points:

- Landing footer `System Status`.
- Login modal `All systems operational`.
- Settings `Test Connection`.
- Optional Compute Load card.

Recommended pattern:

- Status modal or status page.

Service checks to represent:

- Frontend loaded.
- n8n backend reachable.
- Upload webhook.
- Generate document webhook.
- Job status webhook.
- Job retrieve webhook.
- Jira integration.
- Confluence integration.

Status labels:

- Operational.
- Degraded.
- Unreachable.
- Not configured.

Design states:

- All operational.
- Backend unreachable.
- Webhook misconfigured.
- Partial integration outage.

## 12. Legal And Trust Pages

Entry points:

- Footer `Privacy Policy`.
- Footer `Terms of Service`.
- Landing security/trust content may link here.

Recommended pattern:

- Simple static page or modal.

Privacy content sections:

- Uploaded data.
- How artifacts are processed.
- Storage and retention.
- Model training statement.
- Third-party processors.
- User controls.

Terms content sections:

- Product use.
- Demo credential limitation.
- Backend dependency.
- Acceptable use.
- Liability/usage disclaimers.

## 13. Demo Access CTA

Entry point:

- Login modal text: `Having trouble? Try demo access`.

Recommended design:

- Make `Try demo access` a clear text button.

Preferred behavior:

- Click autofills username `admin` and password `admin`.
- Show helper text: `Demo credentials filled. Click Login to continue.`

Avoid:

- Making demo access feel like a separate auth system.

## 14. Dynamic Dashboard Summary

Current UI:

- Static text: `3 active processing jobs` and `12 unread artifacts`.

Recommended design:

- Replace with dynamic KPI chips/cards.

Suggested metrics:

- Active jobs.
- Failed jobs.
- Available artifacts.
- Generated outputs.
- Knowledge bases ready.

Click behavior:

- Active jobs opens notification/job panel.
- Artifacts opens Artifacts repository.
- Generated outputs opens Document Generation history.

## 15. Compute Load / Diagnostics

Entry point:

- Dashboard right rail `Compute Load` card.

Recommended behavior:

- Click opens System Diagnostics.

Diagnostics content:

- Queue load.
- Active jobs.
- Average job duration.
- Last backend response time.
- Failed requests.
- Integration health.

Design note:

- If real metrics are not available, design a graceful `Diagnostics unavailable` or `Demo metrics` state.

## 16. Explore Page CTA Cleanup

Current issue:

- Explore page has a notification icon, but it is a public marketing/explainer page.

Recommended design:

- Prefer removing the notification icon from the public Explore page.
- If kept, repurpose it as `Product updates` or `System status`.

Auth-aware CTA improvement:

- If the user is logged in, Explore CTAs should say `Open Dashboard`.
- If logged out, CTAs should say `Login` or `Get Started`.

## Navigation Model Recommendation

The dashboard should support more views than the current two tabs.

Recommended dashboard view list:

- Dashboard / Overview.
- Knowledge Base.
- Generate Documents.
- Artifacts.
- Analytics.
- Settings.
- Documentation.

The existing Knowledge Base and Generate Documents tabs can stay inside the main workspace, but sidebar items should visibly switch the full dashboard section and update active state.

## Overlay Patterns To Use

Use consistent overlay patterns:

- Command palette: centered overlay.
- Notifications: right drawer or popover.
- Help Center: right drawer.
- Audit Log: large modal or full page.
- New Project: wizard modal/drawer.
- System Status: modal or page.
- Legal pages: simple page/modal.

All overlays should support:

- Escape to close.
- Backdrop click where appropriate.
- Clear close button.
- Focus state.
- Loading, empty, success, and error states where relevant.

## Visual Design Guidance

Keep the UI enterprise-focused:

- Dense but readable layouts.
- Clear hierarchy.
- Avoid marketing-style cards inside the dashboard workspace.
- Use tables for operational data like audit logs and artifacts.
- Use drawers/modals for contextual actions.
- Use chips/status badges for job and artifact states.
- Keep primary CTAs visually distinct.
- Use restrained colors for status: success, warning, error, info.
- Ensure light and dark theme support.

## Deliverables Expected From UI Agent

Produce updated UI designs for:

- Dashboard Overview with dynamic summary.
- New Project wizard.
- Search/command palette.
- Notification center.
- Audit Log view/modal.
- Artifacts repository.
- Knowledge Base management enhancements.
- Document Generation history enhancements.
- Analytics dashboard.
- Settings page.
- Documentation/help center.
- System Status modal/page.
- Privacy Policy and Terms UI.
- Login modal demo access enhancement.
- Explore page CTA cleanup.

For each deliverable, include:

- Default state.
- Empty state.
- Loading state where applicable.
- Error state where applicable.
- Success/completed state where applicable.
- Mobile/responsive treatment.
- Light and dark theme treatment.

## Acceptance Checklist For UI Designs

- Every visible CTA has an intentional destination or overlay.
- No placeholder `#` link remains unresolved in the design.
- Dashboard sidebar items all map to real views.
- Search has a real search experience, not just an input.
- Notifications persist important job events beyond temporary toasts.
- New Project gives users a clear starting workflow.
- Audit Log supports traceability.
- Artifacts view explains what was uploaded and what processed.
- Settings exposes API/backend health concepts.
- Documentation and Help explain QA terms and workflows.
- Status UI helps diagnose backend/n8n failures.
- Landing footer links open useful trust/status/legal surfaces.
- Designs preserve existing upload and document generation flows.
- Designs work in both light and dark themes.

## Highest-Value UI Sequence

If time is limited, design in this order:

1. New Project wizard.
2. Notification center.
3. Search/command palette.
4. Audit Log.
5. Artifacts repository.
6. Settings with Test Connection.
7. Documentation/Help Center.
8. System Status.
9. Analytics.
10. Legal pages and Explore cleanup.

