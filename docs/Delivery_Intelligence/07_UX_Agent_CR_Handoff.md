# Delivery Intelligence UX Agent CR Handoff

## Purpose

This document gives a UX agent the product, workflow, API, and non-breaking implementation context needed to extend the existing Q-Ops Agent UI for the newly implemented Delivery Intelligence capability.

The change request is additive. The existing QA document generation, QA Intelligence layer, Jira/Confluence generation, analytics, artifacts, ingestion, and admin/settings flows must remain intact.

## Existing UI Context

The current UI is a React/Vite/TypeScript single page application. It uses:

- Supabase Auth for login/session handling.
- n8n webhooks as the backend API facade.
- `qops-agent-api-base-url` as the local backend base URL setting.
- A single authenticated dashboard shell under `/dashboard`.
- A fixed left sidebar, sticky top header, dense operational dashboard layout, metric cards, tables, drawers, modals, status badges, and Lucide icons.
- Local browser cache as a fallback for projects, artifacts, generated outputs, audit events, notifications, and settings.

Existing dashboard views:

| Current View | Purpose |
| --- | --- |
| `overview` | Workspace summary, active jobs, quick access cards. |
| `knowledge` | Upload BRD, FRD, HLD, LLD, transcript, and UI images for ingestion. |
| `documents` | Generate QA documents, test cases, and epics/user stories. |
| `artifacts` | Review uploaded and processed artifacts. |
| `analytics` | Job, token, cost, failure, and ingestion analytics. |
| `settings` | User/admin settings, Jira, Confluence, integrations, users, system status. |
| `docs` | In-app help/documentation. |

## Non-Breaking Boundary

The Delivery Intelligence UI must not replace or repurpose existing QA flows.

Do not change these existing user paths:

- Knowledge ingestion using `/webhook/upload-test-artifacts`.
- QA document generation using `/webhook/generate-qa-doc`.
- QA polling using `/webhook/job-status` and `/webhook/job-status-retrieve`.
- Existing artifacts, generated documents, analytics, audit, settings, Jira, and Confluence screens.
- Existing route behavior for `/`, `/dashboard`, `/auth/callback`, and `/explore`.
- Existing local storage keys unless a migration is explicitly planned.

Delivery Intelligence should be introduced as a separate additive workspace inside the authenticated dashboard shell.

Recommended feature flag:

```ts
deliveryIntelligenceEnabled
```

If disabled, the current UI should behave exactly as it does today.

## New Capability Summary

Delivery Intelligence extends Q-Ops from QA document generation into an SDLC intelligence layer. It discovers and organizes:

- Reusable engineering and QA solutions.
- Technologies used across projects.
- Project-to-project similarities.
- Organizational learnings.
- AI recommendations for reuse and delivery improvement.
- Relationships between projects, technologies, solutions, learnings, and recommendations.

This is not a replacement for the QA Intelligence layer. It reads from existing project/QA context and writes to new `di_*` tables.

## Implemented Backend Assets

### Supabase Tables

The new Delivery Intelligence implementation uses these isolated tables:

| Table | Purpose |
| --- | --- |
| `di_intelligence_jobs` | Background job queue and status for DI extraction. |
| `di_technologies` | Normalized detected technologies. |
| `di_project_technologies` | Technology usage by project. |
| `di_reusable_solutions` | Draft or reusable solution records. |
| `di_solution_technologies` | Link table between solutions and technologies. |
| `di_solution_assets` | Source/evidence assets attached to reusable solutions. |
| `di_organizational_learnings` | Captured delivery, QA, architecture, and operational learnings. |
| `di_knowledge_relationships` | Relationships between DI entities. |
| `di_recommendations` | AI-generated recommendations and feedback status. |

RLS is enabled for the DI tables. UI-facing workflows validate the Supabase bearer token and apply role/project access checks.

### n8n Workflows

These workflows currently exist. They are inactive at the time of this handoff and must be published before production UI calls use `/webhook/...` URLs.

| Workflow | ID | Current Active State | UI Role |
| --- | --- | --- | --- |
| `DI - Intelligence Queue Creator and Status API` | `8v0RLFdhdelnBeu9` | Inactive | Queue DI jobs and poll status. |
| `DI - Intelligence Worker` | `xmuy0M3IEbkISttj` | Inactive | Scheduled worker that processes pending DI jobs. |
| `DI - Cross Project Search API` | `18yW35k0ANmU3ZY4` | Inactive | Governed search across DI records. |
| `DI - Recommendation Feedback API` | `pbxli3DNK16tIhOe` | Inactive | Captures recommendation feedback/actions. |

## Implemented UI-Facing Endpoints

Use the same API base URL pattern as the current UI:

```ts
webhookUrl('/webhook/di/jobs')
```

All UI calls should include the current Supabase access token:

```text
Authorization: Bearer {accessToken}
```

### Queue Delivery Intelligence Job

```text
POST /webhook/di/jobs
```

Recommended request:

```json
{
  "jobType": "project_intelligence_extract",
  "projectId": "project-id",
  "idempotencyKey": "project-id-project_intelligence_extract-20260511",
  "sourceTypes": ["qa_outputs"],
  "technologies": [],
  "solutions": [],
  "learnings": [],
  "recommendations": []
}
```

Response:

```json
{
  "ok": true,
  "jobId": "DI-260511-di-e2e-20260511-001",
  "status": "pending",
  "jobType": "project_intelligence_extract",
  "projectId": "project-id",
  "existing": false
}
```

UX use:

- Add an "Extract Intelligence" action from the Delivery Intelligence Overview.
- Require a selected project.
- Show idempotency behavior as "Existing extraction found" if `existing` is true.
- Start polling immediately after a successful response.

### Poll Delivery Intelligence Job

```text
GET /webhook/di/jobs?jobId={jobId}
```

Response shape:

```json
{
  "ok": true,
  "jobId": "DI-260511-di-e2e-20260511-001",
  "status": "completed",
  "jobType": "project_intelligence_extract",
  "projectId": "project-id",
  "input": {},
  "output": {},
  "error": null,
  "createdAt": "2026-05-11T10:00:00.000Z",
  "updatedAt": "2026-05-11T10:01:00.000Z"
}
```

Expected statuses:

| Status | UX Treatment |
| --- | --- |
| `pending` | Queued, waiting for worker. |
| `running` | Processing intelligence extraction. |
| `completed` | Show output summary and refresh DI screens. |
| `completed_with_warnings` | Show success state with warning panel. |
| `failed` | Show error details and retry action. |
| `cancelled` | Show neutral stopped state. |

UX should use a DI-specific polling hook or extend the existing polling hook carefully without changing QA ingestion/generation behavior.

### Cross-Project Search

```text
GET /webhook/di/search?q={query}&projectId={projectId}&limit=10
```

Response shape:

```json
{
  "ok": true,
  "query": "Playwright",
  "projectId": "project-id",
  "counts": {
    "solutions": 1,
    "technologies": 1,
    "learnings": 0,
    "recommendations": 1
  },
  "results": [
    {
      "type": "solution",
      "id": "solution-id",
      "title": "Reusable UI Smoke Test Pattern",
      "summary": "Reusable Playwright smoke test approach.",
      "confidence": 0.86,
      "visibility": "organization"
    }
  ]
}
```

UX use:

- Build a Delivery Intelligence search screen.
- Group results by entity type.
- Show counts, confidence, visibility, source project, and evidence when present.
- Include restricted/empty/error states.

### Recommendation Feedback

```text
PATCH /webhook/di/recommendations/feedback
```

Request:

```json
{
  "recommendationId": "recommendation-id",
  "action": "accepted",
  "comment": "Useful for upcoming sprint planning.",
  "feedback": {
    "source": "delivery_intelligence_ui"
  }
}
```

Supported actions:

| Action | UX Meaning |
| --- | --- |
| `viewed` | User opened or inspected the recommendation. |
| `accepted` | User agrees with recommendation. |
| `dismissed` | User rejects recommendation. |
| `converted` | User converted recommendation into a follow-up action. |

UX use:

- Recommendation cards should include actions for view, accept, dismiss, and later convert.
- On success, update card state optimistically and refresh related results.
- Accepted/dismissed actions are audited in `qops_audit_events`.

## Proposed Navigation

Add a new sidebar group below the existing QA operations items:

```text
Delivery Intelligence
  Overview
  Discovery
  Solutions
  Technologies
  Recommendations
  Learnings
  Relationships
```

Recommended route model if the UI moves beyond the current single `DashboardPage` view union:

| Route | Screen |
| --- | --- |
| `/dashboard?view=delivery-overview` or `/delivery-intelligence` | Delivery Intelligence Overview |
| `/dashboard?view=delivery-discovery` or `/delivery-intelligence/search` | Cross-Project Discovery |
| `/dashboard?view=delivery-solutions` or `/delivery-intelligence/solutions` | Solution Marketplace |
| `/dashboard?view=delivery-technologies` or `/delivery-intelligence/technologies` | Technology Intelligence |
| `/dashboard?view=delivery-recommendations` or `/delivery-intelligence/recommendations` | AI Recommendations |
| `/dashboard?view=delivery-learnings` or `/delivery-intelligence/learnings` | Organizational Learnings |
| `/dashboard?view=delivery-relationships` or `/delivery-intelligence/relationships` | Relationship Explorer |

For the least invasive first release, extend the existing `View` union in `DashboardPage` rather than introducing a route restructure.

## MVP Screens

### 1. Delivery Intelligence Overview

Purpose:

Give users a landing page for SDLC intelligence without disrupting the current dashboard overview.

Core elements:

- Project selector using the existing visible-project rules.
- "Extract Intelligence" button.
- Latest DI job status panel.
- Summary cards:
  - Reusable solutions.
  - Technologies detected.
  - Active recommendations.
  - Organizational learnings.
  - Relationships discovered.
- Recent recommendations panel.
- Recent search or discovery panel.

Do not mix these metrics into the existing QA analytics dashboard during MVP.

### 2. Cross-Project Discovery

Purpose:

Allow users to search across reusable solutions, technologies, learnings, and recommendations.

Core elements:

- Search input.
- Project filter.
- Entity type filter.
- Grouped results:
  - Solutions.
  - Technologies.
  - Learnings.
  - Recommendations.
- Result detail drawer.
- Empty state for no matches.
- Restricted state if visibility prevents access.

Use `GET /webhook/di/search` for MVP.

### 3. Solution Marketplace

Purpose:

Expose reusable solutions discovered from project context.

MVP approach:

- Read from DI search results initially.
- Design the table/detail drawer now.
- Add dedicated list/detail APIs later if needed.

Core columns:

- Solution title.
- Summary.
- Source project.
- Visibility.
- Confidence.
- Technologies.
- Status.
- Last updated.

Detail drawer sections:

- Problem solved.
- Implementation approach.
- QA approach.
- Technologies.
- Source evidence.
- Related projects.
- Related learnings.
- Reuse guidance.
- Risks or limitations.

### 4. Technology Intelligence

Purpose:

Show which technologies are being used and where.

MVP approach:

- Design table/detail screens now.
- Populate via DI search results or a future dedicated endpoint.

Core columns:

- Technology.
- Category.
- Project usage count.
- Related solutions.
- Related learnings.
- Confidence.
- Last detected.

### 5. AI Recommendations

Purpose:

Show proactive reuse, delivery, QA, and technology recommendations.

Core elements:

- Recommendation cards.
- Confidence badge.
- Recommendation type.
- Reason/evidence.
- Related project/entity links.
- Actions: viewed, accept, dismiss, convert.
- Feedback comment input for accept/dismiss/convert.

Use `PATCH /webhook/di/recommendations/feedback` for actions.

### 6. Organizational Learnings

Purpose:

Preserve delivery, QA, operational, and architectural lessons across projects.

MVP approach:

- Timeline or table view.
- Filter by category, project, impact, technology.
- Detail drawer with evidence and related solutions.

### 7. Relationship Explorer

Purpose:

Show relationships between projects, technologies, reusable solutions, learnings, and recommendations.

MVP approach:

- Table-first relationship browser.
- Entity detail drawer.
- Related item list.

Do not start with a graph visualization unless the relationship data is rich enough. A graph can be added later.

## Reusable Components

Recommended components:

| Component | Purpose |
| --- | --- |
| `DeliveryIntelligenceNavGroup` | Sidebar grouping for DI screens. |
| `DIJobStatusPanel` | Queued/running/completed/failed DI job status. |
| `DIExtractionButton` | Project-scoped extraction trigger with loading/idempotency states. |
| `DIOverviewMetricCard` | Summary cards for DI counts. |
| `DISearchBox` | Search input with filters. |
| `DISearchResultGroup` | Group results by solution, technology, learning, recommendation. |
| `SolutionDetailDrawer` | Full reusable solution detail. |
| `TechnologyChip` | Technology tags/chips. |
| `VisibilityBadge` | Public, organization, project, restricted, confidential. |
| `ConfidenceBadge` | AI confidence score display. |
| `RecommendationCard` | Recommendation summary and actions. |
| `SourceEvidenceList` | Source/evidence links. |
| `LearningTimeline` | Timeline/list for learnings. |
| `RelationshipList` | Relationship table/list. |

Use existing design tokens, `StatusBadge`, `SideDrawer`, `ModalFrame`, `StatusNotice`, `ToneIcon`, `ToastList`, and Lucide icons where possible.

## Access And Governance Rules

The UI should follow the existing role model:

| User Type | Delivery Intelligence Access |
| --- | --- |
| Admin | Can see all DI records and all projects. |
| Registered user | Can see assigned project intelligence plus organization-visible reusable assets. |

UX requirements:

- Use the same visible-project filtering as the current dashboard.
- Always send the Supabase bearer token.
- Treat frontend checks as presentation only; backend/RLS remains the authorization source.
- Hide admin-only publishing/governance controls in MVP unless the backend endpoint exists.
- Show restricted records clearly when the backend indicates restricted visibility.

## Analytics And Metrics Guidance

Do not modify the existing QA analytics dashboard for MVP.

For Delivery Intelligence, show lightweight DI-specific operational metrics on the DI Overview:

- Last extraction status.
- Number of technologies detected.
- Number of reusable solutions found.
- Number of recommendations created.
- Number of learnings captured.
- Number of relationships discovered.

Future analytics can add:

- Reuse acceptance rate.
- Recommendation conversion rate.
- Most reused technologies.
- Cross-project similarity clusters.
- Delivery risk and duplication trends.

## UI State Requirements

Each DI screen should handle:

- Loading state.
- Empty state.
- Backend unavailable state.
- Unauthorized or restricted state.
- Partial success with warnings.
- Job failed with retry option.
- Polling in progress.
- Stale local cache warning if local caching is introduced.

Recommended empty-state messages:

| Scenario | UX Message Direction |
| --- | --- |
| No DI extraction yet | Invite user to run "Extract Intelligence" for a selected project. |
| No search results | Suggest changing search terms or project filter. |
| No recommendations | Explain that recommendations appear after extraction. |
| Restricted record | Explain that access is limited by project assignment or visibility. |
| Workflow inactive/unavailable | Explain that the Delivery Intelligence backend is not available. |

## UX Acceptance Criteria

MVP is acceptable when:

- Existing QA document generation still works unchanged.
- Existing ingestion, artifacts, analytics, settings, users, and audit screens still load.
- Admin can open Delivery Intelligence screens.
- Registered user can only select assigned projects.
- User can queue a DI extraction job from the UI.
- UI polls `GET /webhook/di/jobs?jobId=...` until terminal status.
- Completed extraction refreshes DI overview/search data.
- Cross-project discovery can search and group results.
- Recommendation cards support viewed, accepted, dismissed, and converted actions.
- Feedback actions write successfully and visibly update the card state.
- DI failures are contained to DI screens and do not break QA flows.

## Implementation Phases

### Phase 1: Additive MVP UI

Use only currently implemented endpoints:

- `POST /webhook/di/jobs`
- `GET /webhook/di/jobs?jobId=...`
- `GET /webhook/di/search`
- `PATCH /webhook/di/recommendations/feedback`

Build:

- Delivery Intelligence sidebar group.
- Overview screen.
- Extract Intelligence action.
- DI job polling/status panel.
- Cross-Project Discovery search.
- Recommendation cards and feedback.

### Phase 2: Dedicated Read APIs

Add or wire future workflows for:

- `GET /webhook/di/solutions`
- `GET /webhook/di/solutions/{id}`
- `GET /webhook/di/technologies`
- `GET /webhook/di/technologies/{id}`
- `GET /webhook/di/learnings`
- `GET /webhook/di/relationships`
- `GET /webhook/di/overview`

Build richer:

- Solution Marketplace.
- Technology Intelligence.
- Organizational Learnings.
- Relationship Explorer.

### Phase 3: Governance And Advanced Intelligence

Add:

- Publish/unpublish reusable solutions.
- Visibility management.
- Recommendation-to-backlog conversion.
- Reuse analytics.
- Relationship graph visualization.
- Admin governance settings.

## Production Notes For UX Agent

- The four DI workflows are currently inactive. Production UI calls require publishing them in n8n.
- If testing unpublished workflows, use n8n test webhook URLs where applicable.
- The current manual E2E validation showed DI records can be created without writing into QA job rows.
- One known n8n MCP limitation: manual execution could not invoke the GET trigger in the multi-trigger queue/status workflow, but the workflow is designed for normal HTTP webhook calls from the UI.
- Keep all service-role credentials server-side in n8n only. Never expose service-role keys in the frontend.

## References

Existing UI docs reviewed:

- `docs/UI_documentation/README.md`
- `docs/UI_documentation/01-application-overview.md`
- `docs/UI_documentation/02-authentication-and-roles.md`
- `docs/UI_documentation/03-api-contracts.md`
- `docs/UI_documentation/04-dashboard-workflows.md`
- `docs/UI_documentation/05-state-storage-and-data-models.md`
- `docs/UI_documentation/06-settings-integrations-and-admin.md`
- `docs/UI_documentation/07-ui-structure-and-design-system.md`
- `docs/UI_documentation/08-production-readiness-notes.md`

Delivery Intelligence planning docs:

- `docs/Delivery_Intelligence/03_n8n_Workflow_Plan.md`
- `docs/Delivery_Intelligence/04_UI_Design_Plan.md`
- `docs/Delivery_Intelligence/05_API_Data_Flow_Plan.md`
- `docs/Delivery_Intelligence/enterprise_delivery_intelligence_platform_intent_for_coding_agent.md`
