# Settings, Integrations, And Admin

## Settings Personas

`SettingsPage` supports two personas:

| Persona | Availability | Sections |
| --- | --- | --- |
| Admin | Only `currentUser.role === "admin"` | Profile, Users & Roles, Environment, Integrations, Defaults, Security, System Status |
| Registered User | All users; forced for registered users | Profile, Notifications, My Projects, System Status |

Admin users can toggle between Admin and Registered User views. Registered users are forced back to `user` persona.

## Admin Profile

Local-only display/edit state:

- name
- role label
- email

This updates `qops-agent-settings` only. It does not currently patch the backend Q-Ops user profile.

## Users And Roles

Data source:

```text
GET /webhook/users
```

If unavailable, the UI displays the current user only.

Admin actions:

| Action | Endpoint | Notes |
| --- | --- | --- |
| Invite user | `POST /webhook/users/invite` | Sends email/name/title/role and redirect callback. |
| Assign projects | `PATCH /webhook/users/project-assignments` | Called after invite or update for registered users. |
| Edit user | `PATCH /webhook/users/update` | Updates profile, role, status. |
| Refresh users | `GET /webhook/users` | Reloads admin user table. |

Project assignment picker:

- lists known projects.
- lets admin choose `owner`, `editor`, or `viewer`.
- default selected role is `editor`.

Important behavior:

- Admin role gets no project assignment picker.
- Registered users can have multiple project assignments.
- Assignment failure after invite/update is surfaced as a separate error toast.

## Environment Settings

Admin environment section stores:

- environment name display: `Local development`
- n8n API base URL

When `settings.apiBaseUrl` changes, Dashboard writes it to:

```text
qops-agent-api-base-url
```

Default route hints displayed:

- Upload: `/webhook/upload-test-artifacts`
- Generate: `/webhook/generate-qa-doc`
- Polling: `/webhook/job-status` and `/webhook/job-status-retrieve`
- Health: `/webhook/health`

## Backend Settings Hydration

`refreshSettings()` calls:

```text
GET /webhook/settings
```

It then:

- stores `backendSettings`.
- finds active environment.
- finds Jira and Confluence integrations.
- updates local `apiBaseUrl` from active `n8nBaseUrl || apiBaseUrl`.
- updates local Jira URL and Confluence space if present.

## Jira Settings

UI fields:

- Jira base URL
- Project key
- Project id
- Idempotency label prefix

Save calls:

```text
PATCH /webhook/settings
```

Payload shape:

```json
{
  "environmentKey": "local",
  "integrationKey": "jira",
  "integration": {
    "integrationKey": "jira",
    "enabled": true,
    "config": {
      "baseUrl": "...",
      "projectKey": "...",
      "projectId": "...",
      "idempotencyLabelPrefix": "qops"
    },
    "status": "backend_managed"
  },
  "actorUserId": "current user id",
  "actorName": "current user name"
}
```

The UI explicitly states issue type mapping remains backend-managed in n8n/Jira credentials.

## Confluence Settings

UI fields:

- Confluence base URL
- Space key
- Parent page id
- Page title pattern

Default page title pattern:

```text
{documentTitle} - {projectName}
```

Save uses the same `/webhook/settings` patch pattern with `integrationKey: "confluence"`.

## Defaults And Routing

Displayed default route logic:

| Document Type | Destination |
| --- | --- |
| Test Strategy | Confluence |
| Test Plan | Confluence |
| Test Cases | Confluence |
| Risk Matrix | Confluence |
| Traceability Matrix | Confluence |
| Epics & User Stories | Jira |

Default Chroma collection is displayed from:

```ts
chromaIntegration?.config?.collection || 'qa-chunks-batches'
```

## Integration Tests

Single integration:

```text
POST /webhook/integrations/test
```

Payload:

```json
{
  "integrationKey": "jira",
  "environmentKey": "local"
}
```

All integrations:

```text
POST /webhook/integrations/test-all
```

Payload:

```json
{
  "environmentKey": "local"
}
```

System health:

```text
GET /webhook/health
```

The UI expects health services such as n8n backend, Supabase DB, Supabase Storage, ChromaDB, FastAPI Extractor, Converter Service, Jira, Confluence, and OpenAI.

## Security Settings

Admin security page controls local settings:

- in-app notifications
- email notifications
- session timeout display value

It displays static assurances:

- Secrets are masked in UI.
- Settings changes are audited.
- Users get least-privilege access.

Production note: session timeout is stored in local settings but not currently enforced by frontend session logic beyond Supabase token expiry/refresh.

