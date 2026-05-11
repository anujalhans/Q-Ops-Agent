# API Contract Documentation

Generated on 2026-05-08.

This folder is the UI-facing API reference for Q-Ops Agent. The source of truth is the current frontend API client in `src/lib/api.ts` plus active n8n workflow documentation in `docs/n8n_documentation_2026-05-08`.

## Base URL

Default:

```text
http://localhost:5678
```

Browser override:

```text
localStorage["qops-agent-api-base-url"]
```

## Authentication

Auth-aware endpoints expect:

```text
Authorization: Bearer {Supabase access token}
```

The UI obtains this token from Supabase Auth and stores it in `qops-agent-supabase-session`.

## Endpoint Summary

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/webhook/upload-test-artifacts` | POST multipart | Yes | Queue knowledge ingestion. |
| `/webhook/job-status` | GET | Currently no UI auth | Poll ingestion job. |
| `/webhook/generate-qa-doc` | POST JSON | Yes | Queue document generation. |
| `/webhook/job-status-retrieve` | GET | Currently no UI auth | Poll generation job. |
| `/webhook/me` | GET | Yes | Resolve active current user. |
| `/webhook/users` | GET | Yes | Admin user list. |
| `/webhook/users/invite` | POST JSON | Yes | Invite a user. |
| `/webhook/users/update` | PATCH JSON | Yes | Update user profile/role/status. |
| `/webhook/users/project-assignments` | PATCH JSON | Yes | Replace project assignments. |
| `/webhook/users/accept-invite` | POST JSON | Yes | Activate invited profile. |
| `/webhook/users/password-reset-audit` | POST JSON | Yes | Audit password reset completion. |
| `/webhook/projects` | GET/POST | Yes | List/create projects. |
| `/webhook/artifacts` | GET | Currently no UI auth | List artifacts. |
| `/webhook/artifacts/reprocess` | POST JSON | Yes | Reprocess failed artifact. |
| `/webhook/generated-documents` | GET | Currently no UI auth | List generated documents. |
| `/webhook/audit-events` | GET | Yes | List audit/metric events. |
| `/webhook/analytics-summary` | GET | Yes | Analytics summary. |
| `/webhook/infrastructure-load` | GET | Yes | Dashboard load/health telemetry. |
| `/webhook/health` | GET | Currently no UI auth | Service health registry. |
| `/webhook/settings` | GET/PATCH | Yes | Runtime settings. |
| `/webhook/integrations/test` | POST JSON | Yes | Test one integration. |
| `/webhook/integrations/test-all` | POST JSON | Yes | Test all integrations. |

## Common Response Rules

Current UI accepts direct JSON objects and sometimes arrays.

Recommended production standard:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

For compatibility with current UI, queue endpoints must return:

```json
{
  "jobId": "job-id",
  "status": "queued"
}
```

Status endpoints must return:

```json
{
  "status": "queued|pending|processing|completed|failed|not_found",
  "output": {},
  "error": null
}
```

## Upload Knowledge Base

```text
POST /webhook/upload-test-artifacts
Content-Type: multipart/form-data
Authorization: Bearer ...
```

Fields:

| Field | Required | Notes |
| --- | --- | --- |
| `projectName` | Yes | Project display name. |
| `projectId` | No | Stable Supabase project id when known. |
| `environment` | Yes | UI currently sends `local`. |
| `brd` | No | BRD file. |
| `frd` | No | FRD file. |
| `hld` | No | HLD file. |
| `lld` | No | LLD file. |
| `transcript` | No | Transcript file. |
| `image` | No | Repeated for UI/design image files. |

## Generate QA Document

```text
POST /webhook/generate-qa-doc
Content-Type: application/json
Authorization: Bearer ...
```

Body:

```json
{
  "projectId": "optional-project-id",
  "projectName": "Payments modernization",
  "documentType": "test_strategy",
  "productOwner": "PO",
  "environment": "local"
}
```

Document types:

- `test_strategy`
- `test_plan`
- `risk_matrix`
- `test_cases`
- `user_stories`
- `traceability_matrix`

## User Management

Invite:

```text
POST /webhook/users/invite
```

Body:

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "title": "QA Engineer",
  "role": "registered_user",
  "redirectTo": "https://app.example.com/auth/callback"
}
```

Project assignments:

```text
PATCH /webhook/users/project-assignments
```

Body:

```json
{
  "userId": "uuid",
  "projectAssignments": [
    {
      "projectId": "project-id",
      "role": "editor"
    }
  ]
}
```

Update user:

```text
PATCH /webhook/users/update
```

Body:

```json
{
  "userId": "uuid",
  "name": "User Name",
  "title": "QA Engineer",
  "role": "registered_user",
  "status": "active"
}
```

## Settings

Read:

```text
GET /webhook/settings
```

Write:

```text
PATCH /webhook/settings
```

Example:

```json
{
  "environmentKey": "local",
  "integrationKey": "jira",
  "integration": {
    "integrationKey": "jira",
    "enabled": true,
    "config": {
      "baseUrl": "https://company.atlassian.net",
      "projectKey": "KAN",
      "projectId": "10001",
      "idempotencyLabelPrefix": "qops"
    },
    "status": "backend_managed"
  },
  "actorUserId": "uuid",
  "actorName": "Admin User"
}
```

## Error Handling Expectations

Every endpoint should return:

- stable HTTP status code.
- stable machine-readable error code.
- human-readable message.
- job id if the error is job-specific.
- project id/name if the error is project-specific.

Recommended shape:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid bearer token",
    "details": {}
  }
}
```

