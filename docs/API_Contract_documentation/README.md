# API Contract Documentation

Updated on 2026-05-15.

This document is the current UI-facing API contract for the Q-Ops Agent QA Intelligence implementation. It is based on the active frontend API client in `src/lib/api.ts`, the current n8n workflows, and the Supabase-backed data model used by the implemented end-to-end flow.

Delivery Intelligence APIs are intentionally excluded from this contract for now.

## Base URL

Default n8n base URL:

```text
http://localhost:5678
```

Browser override:

```text
localStorage["qops-agent-api-base-url"]
```

Frontend helper:

```ts
getApiBaseUrl()
```

## Authentication

Most business endpoints expect a Supabase access token:

```text
Authorization: Bearer {supabase_access_token}
```

The UI obtains this token from Supabase Auth and stores the session under:

```text
qops-agent-supabase-session
```

The frontend should refresh or validate the Supabase session before sending sensitive requests. In particular, upload/generation requests must send only a valid JWT access token with three JWT segments.

## Role And Project Scope

Current roles:

- `admin`
- `registered_user`

Expected scoping:

- Admin can see and manage all projects/users/settings.
- Registered users should see only assigned project data.
- Analytics and audit APIs should scope by assigned projects and/or `requested_by` as implemented in the backend workflow.

## Endpoint Summary

| Endpoint | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/webhook/me` | GET | Yes | Resolve active Q-Ops user profile from Supabase session. |
| `/webhook/users` | GET | Yes | Admin user list. |
| `/webhook/users/invite` | POST JSON | Yes | Invite user and create pending profile. |
| `/webhook/users/update` | PATCH JSON | Yes | Update user profile, role, or status. |
| `/webhook/users/project-assignments` | PATCH JSON | Yes | Replace assigned projects for a user. |
| `/webhook/users/accept-invite` | POST JSON | Yes | Activate invited profile after Supabase invite callback. |
| `/webhook/users/password-reset-audit` | POST JSON | Yes | Audit password reset completion. |
| `/webhook/projects` | GET | Yes | List visible projects. |
| `/webhook/projects` | POST JSON | Yes | Create project. |
| `/webhook/upload-test-artifacts` | POST multipart | Yes | Queue one knowledge-base ingestion job for one uploaded file. |
| `/webhook/job-status` | GET | No current UI auth | Poll ingestion job status by job id. |
| `/webhook/generate-qa-doc` | POST JSON | Yes | Queue document generation job for Confluence/Jira outputs except story test cases. |
| `/webhook/generate-story-test-cases` | POST JSON | Yes | Queue Jira story test case generation from existing epics/stories. |
| `/webhook/job-status-retrieve` | GET | No current UI auth | Poll generation job status by job id. |
| `/webhook/artifacts` | GET | No current UI auth | List uploaded artifacts and latest processing outcome. |
| `/webhook/artifacts/reprocess` | POST JSON | Yes | Reprocess failed artifact. |
| `/webhook/generated-documents` | GET | No current UI auth | List generated document/Jira outputs. |
| `/webhook/audit-events` | GET | Yes | List audit/metric events. |
| `/webhook/analytics-summary` | GET | Yes | Analytics summary for generation and ingestion. |
| `/webhook/infrastructure-load` | GET | Yes | Queue, workflow, service, and daily usage telemetry. |
| `/webhook/health` | GET | No current UI auth | Service health registry. |
| `/webhook/settings` | GET | Yes | Read runtime environment/integration settings. |
| `/webhook/settings` | PATCH JSON | Yes | Update non-secret runtime settings. |
| `/webhook/integrations/test` | POST JSON | Yes | Test one integration by key. |
| `/webhook/integrations/test-all` | POST JSON | Yes | Test all configured integrations. |

## Common Response Rules

The current UI accepts both direct JSON objects and arrays where older n8n workflows return arrays.

Recommended production shape:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Queue endpoints must return at least:

```json
{
  "jobId": "ING-260515-ABC123",
  "status": "queued"
}
```

Status endpoints must return:

```json
{
  "jobId": "ING-260515-ABC123",
  "status": "queued|pending|processing|completed|failed|not_found",
  "output": {},
  "error": null
}
```

Errors should use a stable shape:

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

## Current User

```text
GET /webhook/me
Authorization: Bearer ...
```

Response:

```json
{
  "id": "qops-user-id",
  "authUserId": "supabase-auth-user-id",
  "email": "user@example.com",
  "name": "User Name",
  "title": "QA Engineer",
  "role": "admin",
  "status": "active",
  "permissions": [],
  "projects": ["project-id"],
  "projectRoles": [
    {
      "projectId": "project-id",
      "projectName": "OmniCart",
      "role": "editor"
    }
  ]
}
```

## User Management

### List Users

```text
GET /webhook/users
Authorization: Bearer ...
```

Accepted response shapes:

```json
[
  {
    "id": "qops-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "registered_user",
    "status": "active",
    "projects": ["project-id"],
    "projectRoles": []
  }
]
```

or:

```json
{
  "users": []
}
```

### Invite User

```text
POST /webhook/users/invite
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "title": "QA Engineer",
  "role": "registered_user",
  "redirectTo": "http://localhost:5173/auth/callback"
}
```

Response:

```json
{
  "user": {
    "id": "qops-user-id",
    "email": "user@example.com",
    "status": "pending_invite"
  }
}
```

### Update User

```text
PATCH /webhook/users/update
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "userId": "qops-user-id",
  "name": "User Name",
  "title": "Senior QA Engineer",
  "role": "registered_user",
  "status": "active"
}
```

### Replace Project Assignments

```text
PATCH /webhook/users/project-assignments
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "userId": "qops-user-id",
  "projectAssignments": [
    {
      "projectId": "project-id",
      "role": "editor"
    }
  ]
}
```

Assignment roles:

- `owner`
- `editor`
- `viewer`

### Accept Invite

```text
POST /webhook/users/accept-invite
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "acceptedAt": "2026-05-15T10:00:00.000Z"
}
```

### Password Reset Audit

```text
POST /webhook/users/password-reset-audit
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "resetAt": "2026-05-15T10:00:00.000Z"
}
```

Expected response:

```json
{
  "ok": true
}
```

## Projects

### List Projects

```text
GET /webhook/projects
Authorization: Bearer ...
```

Accepted response:

```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "OmniCart",
      "description": "Commerce modernization",
      "owner": "QA Team",
      "module": "Checkout",
      "release": "R1",
      "tags": ["payments"],
      "status": "ready",
      "createdAt": "2026-05-15T10:00:00.000Z",
      "updatedAt": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

The UI also accepts a direct array.

Project statuses:

- `draft`
- `ingesting`
- `ready`
- `generating`
- `blocked`

### Create Project

```text
POST /webhook/projects
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "name": "OmniCart",
  "description": "Commerce modernization",
  "owner": "QA Team",
  "module": "Checkout",
  "release": "R1",
  "tags": ["payments"],
  "status": "draft"
}
```

## Knowledge Base Ingestion

### Queue Ingestion

```text
POST /webhook/upload-test-artifacts
Content-Type: multipart/form-data
Authorization: Bearer ...
```

Important current behavior:

- The UI sends one request per file.
- Files are sorted by processing class before upload:
  - text files first
  - mixed documents second
  - standalone images last
- Job Status updates incrementally as each job is queued.
- Polling happens per job id.
- The latest submitted batch remains visible in Job Status until a fresh batch is triggered.

Form fields:

| Field | Required | Notes |
| --- | --- | --- |
| `projectName` | Yes | Project display name. |
| `projectId` | No | Supabase project id when known. |
| `environment` | Yes | UI currently sends `local`. |
| `processingClass` | Yes | `text`, `mixed`, or `image`. |
| `fileKey` | Yes | Logical artifact key. |
| `brd` | Conditional | BRD file when `fileKey = brd`. |
| `frd` | Conditional | FRD file when `fileKey = frd`. |
| `hld` | Conditional | HLD file when `fileKey = hld`. |
| `lld` | Conditional | LLD file when `fileKey = lld`. |
| `transcript` | Conditional | Transcript file when `fileKey = transcript`. Can be repeated across requests. |
| `image` | Conditional | UI/UX image file when `fileKey = image`. Can be repeated across requests. |

Processing class mapping:

| File type | Processing class |
| --- | --- |
| `.txt`, `.md`, `.csv`, `.log` | `text` |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` | `image` |
| `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx` | `mixed` |

Response:

```json
{
  "jobId": "ING-260515-ABC123",
  "status": "queued"
}
```

The frontend normalizes the response into:

```json
{
  "jobId": "ING-260515-ABC123",
  "status": "queued",
  "fileKey": "brd",
  "fileName": "BRD_OmniCart.pdf",
  "processingClass": "mixed"
}
```

### Poll Ingestion Status

```text
GET /webhook/job-status?jobId=ING-260515-ABC123
```

Accepted response:

```json
{
  "jobId": "ING-260515-ABC123",
  "status": "pending|processing|completed|failed|not_found",
  "output": {
    "destination": {
      "type": "chroma",
      "collection": "qops-chunks"
    },
    "totalChunksStored": 12,
    "tokenUsage": {
      "tokensInput": 1200,
      "tokensOutput": 0,
      "tokensTotal": 1200,
      "estimatedCostUsd": 0.000024
    }
  },
  "error": null
}
```

### Extractor Service Contract

n8n ingestion worker calls:

```text
POST http://127.0.0.1:8001/process-document-v2
Content-Type: multipart/form-data
```

Fields sent by n8n:

| Field | Required | Notes |
| --- | --- | --- |
| `fileUrl` | Yes in current flow | Public/signed file URL in Supabase Storage. |
| `projectName` | Yes | Project name. |
| `status` | Yes | Job status from queue row. |
| `jobId` | Yes | Ingestion job id. |
| `projectId` | No | Project id. |
| `requestedBy` | No | Q-Ops user id. |
| `settingsVersion` | No | Runtime settings version. |
| `maxImagesPerJob` | No | Vision cap. |
| `visionBatchSize` | No | Vision batch size. |
| `maxRenderedPagesPerDocument` | No | Currently supported by contract; rendered pages are compatibility-disabled in active extractor. |
| `maxEmbeddedImagesPerDocument` | No | Embedded image cap. |
| `maxStandaloneImagesPerDocument` | No | Standalone image cap. |
| `visionRenderDpi` | No | Render DPI for future rendered-page mode. |
| `deferOverflowVisuals` | No | Whether overflow visuals are deferred. |

Extractor response:

```json
{
  "projectName": "OmniCart",
  "status": "processing",
  "jobId": "ING-260515-ABC123",
  "projectId": "project-id",
  "requestedBy": "qops-user-id",
  "settingsVersion": "1",
  "fileName": "BRD_OmniCart.pdf",
  "fileType": "pdf",
  "docType": "BRD",
  "pageCount": 10,
  "contentMode": "hybrid",
  "containsText": true,
  "containsImages": true,
  "rawText": "Extracted text...",
  "imageCount": 2,
  "images": [
    {
      "fileName": "BRD_OmniCart.pdf_page0_0.png",
      "imageId": "BRD_OmniCart.pdf_page0_img0",
      "base64": "...",
      "docType": "BRD-IMAGE",
      "imageSource": "embedded-image",
      "pageNumber": 1,
      "visualReason": ["embedded_image"],
      "mimeType": "image/png"
    }
  ],
  "tables": [],
  "renderedPages": [],
  "annotations": [],
  "links": [],
  "warnings": [],
  "extractionStats": {
    "compatibilityMode": true
  },
  "visionConfigApplied": {},
  "documentId": "uuid"
}
```

Current extractor note:

- Active extractor is intentionally compatibility-focused: text + embedded images.
- Tables, annotations, links, and rendered pages are part of the response contract but currently empty until Phase 2 advanced extraction is implemented.

## Document Generation

### Queue QA Document Generation

```text
POST /webhook/generate-qa-doc
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "projectId": "project-id",
  "projectName": "OmniCart",
  "documentType": "test_strategy",
  "productOwner": "PO",
  "environment": "local",
  "retryJobId": null
}
```

Supported `documentType` values for this endpoint:

- `test_strategy`
- `test_plan`
- `risk_matrix`
- `traceability_matrix`
- `user_stories`

Notes:

- `user_stories` generates Jira Epics & User Stories.
- Team-managed Jira project behavior is currently supported.
- Company-managed Jira project support is planned for Phase 2.
- Retry may include `retryJobId`.

Response:

```json
{
  "jobId": "PRO-260515-ABC123",
  "status": "queued"
}
```

### Queue Story Test Case Generation

```text
POST /webhook/generate-story-test-cases
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "projectId": "project-id",
  "projectName": "OmniCart",
  "documentType": "story_test_cases",
  "productOwner": "PO",
  "environment": "local",
  "retryJobId": null
}
```

Response:

```json
{
  "jobId": "STC-260515-ABC123",
  "status": "queued"
}
```

Story Test Cases are locked in the UI until Epics & User Stories exist for the selected project.

### Poll Generation Status

```text
GET /webhook/job-status-retrieve?jobId=PRO-260515-ABC123
```

Accepted response:

```json
{
  "jobId": "PRO-260515-ABC123",
  "status": "pending|processing|completed|failed|not_found",
  "documentType": "test_strategy",
  "projectName": "OmniCart",
  "url": "https://confluence.example/wiki/...",
  "output": {
    "documentType": "test_strategy",
    "url": "https://confluence.example/wiki/...",
    "wordCount": 2564,
    "tokensInput": 4000,
    "tokensOutput": 4121,
    "tokensTotal": 8121,
    "estimatedCostUsd": 0.0096
  },
  "error": null
}
```

If this endpoint returns `not_found`, the UI falls back to `/webhook/generated-documents` and searches by job id.

### Confluence Output Shape

Expected completed output for document generation:

```json
{
  "documentType": "test_strategy",
  "projectId": "project-id",
  "projectName": "OmniCart",
  "url": "https://confluence.example/wiki/spaces/QA/pages/123",
  "wordCount": 2564,
  "tokensInput": 4000,
  "tokensOutput": 4121,
  "tokensTotal": 8121,
  "estimatedCostUsd": 0.0096,
  "destination": {
    "type": "confluence",
    "spaceKey": "QA"
  }
}
```

### Jira Epics & User Stories Output Shape

Expected completed output:

```json
{
  "documentType": "user_stories",
  "projectId": "project-id",
  "projectName": "OmniCart",
  "epics": [
    {
      "epicKey": "KAN-468",
      "epicId": "10001",
      "summary": "Checkout and Payment Orchestration",
      "epicCorrelationId": "KAN-EPIC-001",
      "epicLink": "https://company.atlassian.net/browse/KAN-468"
    }
  ],
  "stories": [
    {
      "storyKey": "KAN-469",
      "storyId": "10002",
      "summary": "Customer completes checkout with saved payment method",
      "storyCorrelationId": "KAN-US-001",
      "storyLink": "https://company.atlassian.net/browse/KAN-469",
      "parentEpicKey": "KAN-468"
    }
  ],
  "jira": {
    "projectKey": "KAN",
    "created": 2,
    "reused": 0
  },
  "wordCount": 1339,
  "tokensInput": 6000,
  "tokensOutput": 5729,
  "tokensTotal": 11729,
  "estimatedCostUsd": 0.0093
}
```

### Jira Story Test Cases Output Shape

Expected completed output:

```json
{
  "documentType": "story_test_cases",
  "projectId": "project-id",
  "projectName": "OmniCart",
  "sourceUserStoryJobId": "PRO-260515-ABC123",
  "stories": [
    {
      "storyKey": "KAN-469",
      "summary": "Customer completes checkout with saved payment method",
      "storyLink": "https://company.atlassian.net/browse/KAN-469",
      "storyCorrelationId": "KAN-US-001"
    }
  ],
  "testCases": [
    {
      "action": "created",
      "testcaseKey": "KAN-474",
      "testcaseId": "10003",
      "testcaseSummary": "Successful checkout with saved payment method",
      "testcaseLink": "https://company.atlassian.net/browse/KAN-474",
      "storyKey": "KAN-469",
      "storySummary": "Customer completes checkout with saved payment method",
      "stableLabel": "qops-tc-kan-us-001-tc-001-successful-checkout",
      "priority": "High",
      "testType": "functional",
      "testLevel": "UI",
      "testCategory": "Positive",
      "riskLevel": "High",
      "automationFeasibility": "High"
    }
  ],
  "mappings": [
    {
      "storyKey": "KAN-469",
      "testcaseKey": "KAN-474",
      "action": "created"
    }
  ],
  "jira": {
    "projectKey": "KAN",
    "created": 14,
    "reused": 0
  },
  "wordCount": 2299,
  "tokensInput": 2380,
  "tokensOutput": 5290,
  "tokensTotal": 7670,
  "estimatedCostUsd": 0.009416
}
```

## Artifacts

### List Artifacts

```text
GET /webhook/artifacts
```

Accepted response:

```json
{
  "artifacts": [
    {
      "id": "ING-260515-ABC123:brd",
      "projectName": "OmniCart",
      "type": "BRD",
      "fileName": "BRD_OmniCart.pdf",
      "size": 123456,
      "uploadedAt": "2026-05-15T10:00:00.000Z",
      "status": "processed",
      "url": "https://supabase.storage/...",
      "jobId": "ING-260515-ABC123"
    }
  ]
}
```

Artifact statuses:

- `processing`
- `processed`
- `failed`

### Reprocess Artifact

```text
POST /webhook/artifacts/reprocess
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "artifactId": "ING-260515-ABC123:brd"
}
```

Response:

```json
{
  "jobId": "ING-260515-XYZ789",
  "status": "queued"
}
```

## Generated Documents Repository

```text
GET /webhook/generated-documents
```

Accepted response:

```json
{
  "documents": [
    {
      "id": "PRO-260515-ABC123",
      "jobId": "PRO-260515-ABC123",
      "projectName": "OmniCart",
      "artifactLabel": "Test Strategy",
      "documentType": "test_strategy",
      "createdAt": "2026-05-15T10:00:00.000Z",
      "status": "completed",
      "url": "https://confluence.example/wiki/...",
      "output": {}
    }
  ]
}
```

The UI also accepts a direct array.

Document statuses:

- `queued`
- `pending`
- `processing`
- `completed`
- `failed`

## Audit Events

```text
GET /webhook/audit-events
Authorization: Bearer ...
```

Accepted response:

```json
{
  "events": [
    {
      "id": "metric-id",
      "actor": "User Name",
      "action": "JOB_COMPLETED",
      "project": "OmniCart",
      "entity": "PRO-260515-ABC123",
      "status": "success",
      "timestamp": "2026-05-15T10:00:00.000Z",
      "details": "Generation completed",
      "event": "JOB_COMPLETED",
      "pipeline": "generation",
      "jobId": "PRO-260515-ABC123"
    }
  ]
}
```

## Analytics Summary

```text
GET /webhook/analytics-summary?pipeline=all&days=30
Authorization: Bearer ...
```

Query params:

| Param | Default | Notes |
| --- | --- | --- |
| `pipeline` | `all` | `all`, `generation`, or `ingestion`. |
| `days` | `30` | Lookback window. |

Response:

```json
{
  "overview": {
    "totalJobsCompleted": 30,
    "totalDocumentsGenerated": 4,
    "totalIngestionJobsCompleted": 26,
    "totalJobsFailed": 0,
    "successRate": 100,
    "totalCostUsd": 0.06,
    "avgCostPerDocument": 0.01,
    "totalTokensConsumed": 39000,
    "totalChunksIngested": 81,
    "totalWordsProcessed": 10200,
    "avgDurationMs": 62000,
    "avgIngestionDurationMs": 1338000,
    "totalFilesProcessed": 26
  },
  "byDocumentType": [],
  "failureRate": {
    "generation": 0,
    "ingestion": 0
  },
  "recentJobs": [
    {
      "jobId": "PRO-260515-ABC123",
      "projectName": "OmniCart",
      "documentType": "test_strategy",
      "pipeline": "generation",
      "status": "completed",
      "durationMs": 60214,
      "wordCount": 2564,
      "chunkCount": 0,
      "totalFiles": 1,
      "tokensTotal": 8121,
      "estimatedCostUsd": 0.0096,
      "createdAt": "2026-05-15T10:00:00.000Z"
    }
  ],
  "ingestion": {
    "jobsCompleted": 26,
    "totalChunksIngested": 81,
    "totalWordsProcessed": 10200,
    "avgProcessingDurationMs": 1338000,
    "totalFilesProcessed": 26,
    "filesByKnowledgeBase": []
  },
  "failures": {
    "recent": [],
    "byPipeline": []
  },
  "costs": {
    "byPipeline": [],
    "byProject": []
  },
  "meta": {
    "generatedAt": "2026-05-15T10:00:00.000Z",
    "dateFrom": "2026-04-15T10:00:00.000Z",
    "pipeline": "all",
    "daysRequested": 30
  }
}
```

Cost and token notes:

- Ingestion token/cost values are estimated from embeddings and vision usage where available.
- Generation token/cost values are based on workflow-recorded usage and/or model estimates depending on provider response.
- UI should mark estimated values where applicable.

## Infrastructure Load

```text
GET /webhook/infrastructure-load
Authorization: Bearer ...
```

Response:

```json
{
  "status": "ok",
  "score": 18,
  "generatedAt": "2026-05-15T10:00:00.000Z",
  "scope": "workspace",
  "queues": {
    "pending": 0,
    "processing": 0,
    "active": 0,
    "failedLast24h": 0,
    "oldestPendingAgeSeconds": 0,
    "generation": {
      "pending": 0,
      "processing": 0
    },
    "ingestion": {
      "pending": 0,
      "processing": 0
    }
  },
  "workflows": {
    "activeExecutions": 0,
    "failedLast24h": 0,
    "avgDurationMs": 0,
    "recentMetricEvents": 0
  },
  "services": [
    {
      "name": "Supabase DB",
      "key": "supabase",
      "status": "ok",
      "latencyMs": 100,
      "message": "Reachable",
      "checkedAt": "2026-05-15T10:00:00.000Z"
    }
  ],
  "usage": {
    "tokensToday": 0,
    "costTodayUsd": 0,
    "jobsCompletedToday": 0
  }
}
```

The frontend ignores responses without a numeric `score`.

## Health

```text
GET /webhook/health
```

Response:

```json
{
  "status": "ok",
  "generatedAt": "2026-05-15T10:00:00.000Z",
  "services": [
    {
      "name": "n8n backend",
      "status": "ok",
      "detail": "Health workflow executed successfully"
    },
    {
      "name": "FastAPI Extractor",
      "status": "ok",
      "detail": "up and running"
    }
  ],
  "webhooks": {},
  "integrations": {}
}
```

## Settings

### Read Settings

```text
GET /webhook/settings
Authorization: Bearer ...
```

Response:

```json
{
  "environments": [
    {
      "environmentKey": "local",
      "displayName": "Local",
      "apiBaseUrl": "http://localhost:5678",
      "n8nBaseUrl": "http://localhost:5678",
      "webhookPaths": {},
      "isActive": true,
      "updatedAt": "2026-05-15T10:00:00.000Z",
      "integrations": [
        {
          "environmentKey": "local",
          "integrationKey": "jira",
          "displayName": "Jira",
          "enabled": true,
          "config": {
            "baseUrl": "https://company.atlassian.net",
            "projectKey": "KAN",
            "projectId": "10001",
            "idempotencyLabelPrefix": "qops"
          },
          "secretRefs": {},
          "status": "backend_managed",
          "settingsVersion": 1,
          "updatedAt": "2026-05-15T10:00:00.000Z",
          "latestTest": null
        }
      ]
    }
  ],
  "environmentSettings": [],
  "integrations": [],
  "latestResults": []
}
```

### Patch Settings

```text
PATCH /webhook/settings
Content-Type: application/json
Authorization: Bearer ...
```

Generic request:

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
  "actorUserId": "qops-user-id",
  "actorName": "Admin User"
}
```

Microservice/extractor config example:

```json
{
  "environmentKey": "local",
  "integrationKey": "microservices",
  "integration": {
    "integrationKey": "microservices",
    "enabled": true,
    "config": {
      "documentProcessorBaseUrl": "http://127.0.0.1:8000",
      "documentProcessorPath": "/process-document",
      "documentProcessorV2BaseUrl": "http://127.0.0.1:8001",
      "documentProcessorV2Path": "/process-document-v2",
      "documentProcessorV2HealthPath": "/health",
      "timeoutMs": 300000,
      "vision": {
        "maxImagesPerJob": 80,
        "batchSize": 5,
        "maxRenderedPagesPerDocument": 12,
        "maxEmbeddedImagesPerDocument": 20,
        "maxStandaloneImagesPerDocument": 10,
        "renderDpi": 144,
        "deferOverflowVisuals": true
      }
    }
  }
}
```

Security rule:

- API tokens, service-role keys, Jira secrets, Confluence secrets, OpenAI keys, and Chroma keys must not be stored in public frontend settings.
- Secrets should remain in n8n credentials or server-side secret storage.

## Integration Tests

### Test One Integration

```text
POST /webhook/integrations/test
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "integrationKey": "jira",
  "environmentKey": "local"
}
```

Response:

```json
{
  "ok": true,
  "environmentKey": "local",
  "integrationKey": "jira",
  "status": "operational|degraded|unreachable|unauthorized|error|not_configured",
  "message": "Integration test result",
  "checkedAt": "2026-05-15T10:00:00.000Z"
}
```

### Test All Integrations

```text
POST /webhook/integrations/test-all
Content-Type: application/json
Authorization: Bearer ...
```

Request:

```json
{
  "environmentKey": "local"
}
```

## Backend Data Sources

Primary Supabase tables used by the implemented QA Intelligence flow:

- `qops_users`
- `qops_projects`
- `qops_project_members`
- `qa_jobs`
- `doc_ingestion_jobs`
- `doc_ingestion_queuecreator_logs`
- `qa_job_metrics`
- `qops_environment_settings`
- `qops_integration_settings`
- `qops_connection_test_results`

## Important Current Implementation Notes

### Knowledge Base Batch Behavior

The UI does not submit all files as one multipart job anymore. It submits each selected artifact as a separate ingestion job so the worker can process queued jobs safely and users can see per-file status.

### Job Status Panel Behavior

- Create Knowledge Base Job Status shows only the latest submitted batch.
- It continues to show that batch until a fresh batch is triggered.
- My Knowledge Jobs shows full history.
- Generate Documents Job Status persists the latest submitted generation batch/job until a fresh generation is triggered.

### Token And Cost Semantics

- Ingestion tokens/cost are estimated unless provider usage is available.
- Generation workflow token/cost values may combine actual model usage and estimates depending on node/provider response.
- UI should label estimated values clearly.

### Jira Project Type

Current implemented Jira creation is Team-managed oriented. Company-managed Jira support is planned in Phase 2 and will require:

- Jira project capability resolver.
- Epic Link custom field discovery.
- Epic Name custom field discovery where required.
- Separate n8n branch for company-managed payload building.

### Advanced Extractor Status

Current extractor contract includes fields for tables, annotations, links, and rendered pages, but active extractor behavior is currently compatibility mode:

- text
- embedded images
- no rendered pages
- no table/annotation/link semantic enrichment yet

Advanced extractor reintroduction is planned in Phase 2.

## Error Handling Expectations

Every endpoint should return:

- stable HTTP status code
- stable machine-readable error code
- human-readable message
- job id when job-specific
- project id/name when project-specific
- technical details only where safe

Recommended failure response:

```json
{
  "ok": false,
  "error": {
    "code": "JOB_FAILED",
    "message": "Generation failed during Jira creation.",
    "details": {
      "jobId": "PRO-260515-ABC123",
      "node": "Create Jira Story"
    }
  }
}
```

For failed job status responses:

```json
{
  "jobId": "PRO-260515-ABC123",
  "status": "failed",
  "error": "Human-readable failure reason",
  "output": {
    "error": true,
    "message": "Human-readable failure reason",
    "source": "Call Professional Backlog Generator",
    "failed_at": "2026-05-15T10:00:00.000Z"
  }
}
```
