# State, Storage, And Data Models

## Browser Storage Keys

| Key | Owner | Purpose |
| --- | --- | --- |
| `qops-agent-supabase-session` | `src/lib/auth.ts` | Supabase access/refresh token session. |
| `qops-agent-auth` | legacy cleanup only | Removed during logout/session clear. Still read by `ExploreMorePage`, but no longer written by current auth flow. |
| `qops-agent-api-base-url` | `src/lib/api.ts`, Dashboard settings | n8n backend base URL override. |
| `qops-agent-settings` | Dashboard | Local user/settings display state. |
| `qops-agent-projects` | Dashboard | Local cached projects. |
| `qops-agent-artifacts` | Dashboard | Local cached artifacts. |
| `qops-agent-notifications` | Dashboard | Local notification list. |
| `qops-agent-audit-events` | Dashboard | Local audit list. |
| `qops-agent-generated-outputs` | Dashboard | Local generated document list. |
| `qops-theme` | ThemeProvider | `light` or `dark`. |

## Persistent State Pattern

`usePersistentState(key, initialValue)`:

- Reads JSON from localStorage.
- Falls back to initial value on missing/invalid JSON.
- Writes every state change back to localStorage.

`usePersistentArrayState` additionally guarantees an array result.

## Backend Hydration Pattern

The UI starts with local cached state, then calls backend repository endpoints. If an endpoint returns data:

- Projects replace local projects.
- Artifacts replace local artifacts.
- Generated documents replace local generated outputs.
- Audit events replace local audit events.

This allows the UI to keep working while backend endpoints are unavailable but can also create confusion if old local cache remains. Production should expose clear cache reset/sign-out behavior.

## UI Project Model

```ts
type Project = {
  id: string
  name: string
  description: string
  owner: string
  module: string
  release: string
  tags: string[]
  status: 'draft' | 'ingesting' | 'ready' | 'generating' | 'blocked'
  createdAt: string
  updatedAt: string
}
```

Backend `ApiProject` is normalized with defaults:

- missing `id` becomes local generated id.
- missing owner becomes `Admin User`.
- missing status becomes `ready`.
- missing dates become current timestamp.

## Artifact Model

```ts
type ArtifactRecord = {
  id: string
  projectName: string
  type: string
  fileName: string
  size: number
  uploadedAt: string
  status: 'processing' | 'processed' | 'failed'
  url?: string
  jobId?: string
}
```

Backend artifacts are normalized with:

- missing id from `id || jobId || local id`.
- missing status defaults to `processed`.
- missing size defaults to `0`.

## Generated Output Model

```ts
type GeneratedOutput = {
  id: string
  jobId?: string
  projectName: string
  artifactLabel: string
  createdAt: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  output?: any
}
```

Document labels are resolved from backend `documentType` where possible.

## Audit Event Model

```ts
type AuditEvent = {
  id: string
  actor: string
  action: string
  project: string
  entity: string
  status: 'success' | 'error' | 'info' | 'warning'
  timestamp: string
  details: string
}
```

Backend `ApiAuditEvent` can come from metric/audit tables and is normalized into this display model.

## Notification Model

```ts
type NotificationEvent = {
  id: string
  title: string
  message: string
  type: StatusTone
  createdAt: string
  read: boolean
  project?: string
  audienceUserId?: string
  actionLabel?: string
  actionView?: View
}
```

Notifications are user-scoped for registered users by `audienceUserId` or visible project name.

## Settings State

```ts
type SettingsState = {
  name: string
  role: string
  email: string
  apiBaseUrl: string
  jiraUrl: string
  confluenceSpace: string
  inAppNotifications: boolean
  emailNotifications: boolean
  sessionTimeout: string
}
```

This is mostly UI display/config state. Real backend runtime settings are loaded from `/webhook/settings`.

## Data Scoping For Registered Users

Visible projects:

- If role is not `registered_user`, all projects are visible.
- If role is `registered_user`, project ids come from:
  - `currentUser.projects`, or
  - `currentUser.projectRoles[].projectId`.

Visible artifacts/outputs:

- Filtered by project names visible to the user.

Visible audit:

- Events whose project is visible, or whose actor matches current user's name/email/settings name.

Visible notifications:

- Welcome notification.
- Notification with `audienceUserId === currentUser.id`.
- Notification whose project/message prefix matches a visible project.

