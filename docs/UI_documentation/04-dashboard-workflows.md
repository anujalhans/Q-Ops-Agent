# Dashboard Workflows

## Overview Load Sequence

After authentication:

1. `DashboardPage` initializes local persistent state.
2. It runs `refreshAnalytics()`.
3. It runs `refreshInfrastructureLoad()`.
4. If no health status exists, it runs `testConnection()`.
5. When health status exists, it runs `refreshBackendData()`.

Backend data hydration fetches projects, artifacts, generated documents, and audit events in parallel. If any endpoint returns data, the corresponding local cache is replaced with normalized backend data.

## Project Creation

Admin-only primary UI path:

1. User opens `NewProjectWizard`.
2. Enters project name, owner, module, release, description, and tags.
3. Wizard collects intended artifact types.
4. UI creates a local draft project immediately.
5. UI selects that project for knowledge ingestion and generation.
6. UI logs a local audit event.
7. UI calls `createProjectRecord(nextProject)`.
8. If backend returns a saved project, UI normalizes and replaces the local draft.
9. Backend data is refreshed.

Important behavior:

- Duplicate project names are blocked in the wizard.
- The local project id is generated as `project-{timestamp}-{random}` until backend replaces it.

## Knowledge Base Ingestion

User flow:

1. Select or enter project name.
2. Upload zero or more of BRD, FRD, HLD, LLD, transcript, and UI design images.
3. Submit.

Frontend behavior:

1. Validates project name.
2. Creates/updates project with status `ingesting`.
3. Adds local artifact records with status `processing`.
4. Finds selected project by visible project name.
5. Calls `uploadKnowledgeBase`.
6. Starts `useJobPolling('kb')`.
7. Refreshes infrastructure load.
8. Adds toast and notification.
9. Adds local audit event.

Completion behavior:

- When polling returns `completed`, the project status becomes `ready`.
- Processing artifacts for that project become `processed`.
- Backend repositories, analytics, and infrastructure load are refreshed.

Failure behavior:

- Upload exceptions are shown in form error.
- Toast/notification uses `Upload failed`.
- Local audit event captures the error.

## Document Generation

User flow:

1. Select an existing visible project.
2. Select output type:
   - Test Strategy
   - Test Plan
   - Risk Matrix
   - Test Cases
   - Epics & User Stories
   - Traceability Matrix
3. Submit.

Frontend behavior:

1. Validates project and artifact type.
2. Finds selected project by visible project name.
3. Uses selected project owner or settings name as `productOwner`.
4. Calls `generateDocument`.
5. Starts `useJobPolling('doc')`.
6. Adds a local generated output in `queued` state.
7. Adds toast/notification.
8. Adds local audit event.

Completion behavior:

- On `completed`, UI stores/updates a generated output with:
  - `jobId`
  - project name
  - label
  - output URL if present at `output.url`, `output.documentUrl`, or `output.link`
  - raw `output`
- Backend repositories, analytics, and infrastructure load are refreshed.

Failure behavior:

- Polling extracts backend failure messages.
- Error appears in status panel.
- Toast/notification uses `Document generation failed`.

## Job Polling

Implemented in `src/hooks/useJobPolling.ts`.

Start behavior:

- Sets state to response status or `queued`.
- Polls immediately.
- Starts an interval after:
  - 5 seconds for knowledge ingestion.
  - 30 seconds for document generation.
- Default interval is 30 seconds.
- When status becomes `processing`, interval is changed to 45 seconds.

Terminal statuses:

| Status | Behavior |
| --- | --- |
| `completed` | Set output, success toast, stop polling. |
| `failed` | Set output/error, error toast, stop polling. |
| `not_found` | Retry up to 3 times, then fail. |

Network/status fetch errors:

- Retry counter increments.
- After 3 fetch errors, job is marked failed.

## Artifacts Repository

`ArtifactsRepository` shows uploaded artifacts with counts for processed/failed items.

Reprocess behavior:

1. Only failed artifacts show reprocess action.
2. UI calls `reprocessArtifact(artifactId)`.
3. If backend returns `jobId`, UI starts KB polling.
4. Backend data refreshes.
5. Notification says reprocess queued.

The `artifactId` contract is backend-defined, but prior backend documentation indicates `jobId:fileKey` for reprocess.

## Analytics

`AnalyticsPage` prefers live backend analytics from `/webhook/analytics-summary`.

Controls:

- Pipeline: `all`, generation, ingestion depending UI values.
- Days: numeric lookback.

Fallback:

- If backend analytics are unavailable, UI shows local workspace metrics and a warning.

Displayed analytics include:

- Success rate.
- Completed jobs.
- Generated documents.
- Ingestion jobs.
- Failures.
- Token/cost totals.
- Recent jobs.
- Failure by pipeline.
- Cost by pipeline/project.
- Files/chunks by knowledge base.

## Infrastructure Load

`PlatformLoadCard` and `DiagnosticsModal` use `/webhook/infrastructure-load` when available.

Fallback score:

```ts
Math.min(95, 18 + activeJobs * 28 + failedJobs * 12)
```

Displayed:

- Load score.
- Queue counts.
- Workflow failures.
- Average duration.
- Service health.
- Tokens/cost/jobs completed today.

## Audit And Notifications

Local audit events are created for:

- Project created.
- Knowledge ingestion submitted/failed.
- Knowledge form reset.
- Document generation submitted/failed.
- Document form reset.

Backend audit events from `/webhook/audit-events` replace the local audit list when available.

Notifications are created from:

- Direct UI `notify()` calls.
- Backend audit events if the event is important:
  - status is `error`, or
  - action/details include completed, failed, or quality.

Registered users see scoped notifications only.

## Search Palette

Opened with `Ctrl+K` or `Cmd+K`.

Searches:

- Projects.
- Artifacts.
- Generated outputs.
- Active jobs.
- Help.

Selecting a result navigates to the matching dashboard view.

