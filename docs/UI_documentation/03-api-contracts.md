# API Contracts

All backend API helpers are in `src/lib/api.ts`.

## Base URL

```ts
export const API_BASE_URL_KEY = 'qops-agent-api-base-url'
export const DEFAULT_API_BASE_URL = 'http://localhost:5678'
```

`getApiBaseUrl()` returns the localStorage override or default. `webhookUrl(path)` appends the path directly to the base URL.

## Auth Header Behavior

`withAuth(init)` reads the Supabase access token from `qops-agent-supabase-session` and adds:

```text
Authorization: Bearer {accessToken}
```

`fetchOptional` supports an `authenticated` boolean. When true, it applies `withAuth`.

## Optional Fetch Behavior

`fetchOptional<T>(path, init, timeoutMs, authenticated)`:

- Adds `AbortController`.
- Defaults timeout to 2500 ms unless caller overrides.
- Returns `null` for non-2xx responses.
- Returns `null` for thrown errors/timeouts.
- Parses JSON on success.

This design keeps the UI operational with local fallback state when backend repository endpoints are unavailable.

## Endpoint Table

| Helper | Method | Path | Auth Header | Timeout | Purpose |
| --- | --- | --- | --- | ---: | --- |
| `uploadKnowledgeBase` | POST multipart | `/webhook/upload-test-artifacts` | Yes | native fetch | Queue ingestion job. |
| `fetchKbStatus` | GET | `/webhook/job-status?jobId=` | No | native fetch | Poll ingestion job. |
| `generateDocument` | POST JSON | `/webhook/generate-qa-doc` | Yes | native fetch | Queue document generation. |
| `fetchDocStatus` | GET | `/webhook/job-status-retrieve?jobId=` | No | native fetch | Poll generation job. |
| `fetchAnalyticsSummary` | GET | `/webhook/analytics-summary?pipeline=&days=` | Yes | 10000 | Load analytics. |
| `fetchHealthStatus` | GET | `/webhook/health` | No | 10000 | Health/status. |
| `fetchInfrastructureLoad` | GET | `/webhook/infrastructure-load` | Yes | 10000 | Dashboard compute/load telemetry. |
| `fetchCurrentUser` | GET | `/webhook/me` | Yes | 10000 | Resolve active Q-Ops profile. |
| `fetchUsers` | GET | `/webhook/users` | Yes | 10000 | Admin user list. |
| `inviteUser` | POST JSON | `/webhook/users/invite` | Yes | 15000 | Admin invite flow. |
| `updateUser` | PATCH JSON | `/webhook/users/update` | Yes | 10000 | Admin user profile/role/status update. |
| `updateUserProjectAssignments` | PATCH JSON | `/webhook/users/project-assignments` | Yes | 10000 | Replace registered user's project assignments. |
| `acceptUserInvite` | POST JSON | `/webhook/users/accept-invite` | Yes | 10000 | Activate invited profile. |
| `auditPasswordReset` | POST JSON | `/webhook/users/password-reset-audit` | Yes | 10000 | Write password reset audit event. |
| `fetchProjects` | GET | `/webhook/projects` | Yes | 10000 | Load projects. |
| `createProjectRecord` | POST JSON | `/webhook/projects` | Yes | 10000 | Persist project. |
| `fetchArtifacts` | GET | `/webhook/artifacts` | No | 2500 | Load artifact repository. |
| `fetchGeneratedDocuments` | GET | `/webhook/generated-documents` | No | 2500 | Load generated documents. |
| `fetchAuditEvents` | GET | `/webhook/audit-events` | Yes | 10000 | Load audit/metric events. |
| `reprocessArtifact` | POST JSON | `/webhook/artifacts/reprocess` | Yes | 10000 | Requeue failed artifact. |
| `fetchSettings` | GET | `/webhook/settings` | Yes | 10000 | Load environment/integration settings. |
| `patchSettings` | PATCH JSON | `/webhook/settings` | Yes | 10000 | Update settings/integration config. |
| `testIntegration` | POST JSON | `/webhook/integrations/test` | Yes | 15000 | Test one integration. |
| `testAllIntegrations` | POST JSON | `/webhook/integrations/test-all` | Yes | 20000 | Test all integrations. |

## Knowledge Base Upload

Request:

```ts
type KnowledgeBasePayload = {
  projectId?: string
  projectName: string
  brd: File | null
  frd: File | null
  hld: File | null
  lld: File | null
  transcript: File | null
  images: File[]
}
```

Form fields:

| Field | Source |
| --- | --- |
| `projectName` | `payload.projectName` |
| `projectId` | optional selected project id |
| `environment` | hardcoded `local` |
| `brd` | BRD file |
| `frd` | FRD file |
| `hld` | HLD file |
| `lld` | LLD file |
| `transcript` | transcript file |
| `image` | repeated for UI design image files |

Expected response:

```ts
type UploadResponse = {
  jobId: string
  status?: string
}
```

If `jobId` is missing, the UI throws `Invalid response from backend`.

## Document Generation

Frontend artifact keys map to backend document types:

| UI Key | Backend `documentType` |
| --- | --- |
| `strategy` | `test_strategy` |
| `plan` | `test_plan` |
| `risk` | `risk_matrix` |
| `testCases` | `test_cases` |
| `epicsAndStories` | `user_stories` |
| `traceability_matrix` | `traceability_matrix` |

Request body:

```json
{
  "projectId": "optional",
  "projectName": "Project",
  "documentType": "test_strategy",
  "productOwner": "PO",
  "environment": "local"
}
```

Expected response is `UploadResponse` with `jobId`.

## Job Status Contract

```ts
type JobStatus =
  | 'idle'
  | 'queued'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'not_found'

type StatusResponse = {
  status: JobStatus | string
  output?: any
  [key: string]: any
}
```

Both status fetchers accept array or object responses. If the backend returns an array, the UI uses the first element.

Failure message extraction checks:

- `output.errorType === "GENERATOR_AGENT_FAILED"`
- `output.message`
- `data.error.message`
- string `data.error`

Template-substitution failures are detected when `status` contains `{{`.

## Current User Contract

```ts
type CurrentUser = {
  id: string
  authUserId?: string
  email: string
  name: string
  title?: string
  avatarUrl?: string
  role: 'admin' | 'registered_user'
  status: 'active' | 'pending_invite' | 'disabled'
  lastLoginAt?: string
  permissions?: string[]
  projects?: string[]
  projectRoles?: Array<{ projectId: string; projectName?: string; role: string }>
}
```

The app requires `status === "active"` for session acceptance.

## Settings Contract

```ts
type EnvironmentSetting = {
  environmentKey: string
  displayName?: string
  apiBaseUrl?: string
  n8nBaseUrl?: string
  webhookPaths?: Record<string, string>
  isActive: boolean
  updatedAt?: string
  integrations: IntegrationSetting[]
}
```

The UI reads the active environment and uses `n8nBaseUrl || apiBaseUrl` to update its displayed API base URL.

## Analytics Contract

The UI expects:

- `overview` metrics: completed jobs, documents, ingestion jobs, failures, success rate, cost, tokens, chunks, durations.
- `byDocumentType` array.
- `failureRate` by generation/ingestion.
- `recentJobs`.
- optional `ingestion`.
- optional `failures`.
- optional `costs`.
- `meta.generatedAt`, `meta.dateFrom`, `meta.pipeline`, `meta.daysRequested`.

## Infrastructure Load Contract

The load widget expects:

- `status`
- `score`
- queue counts
- workflow counts
- service statuses
- daily usage: tokens, cost, jobs completed

