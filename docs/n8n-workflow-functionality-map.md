# Q-Ops Agent n8n Workflow Functionality Map

Date: 2026-05-04

Source folder: `n8n_workflows`

## Purpose

This document summarizes the backend behavior implemented in the exported n8n workflows so the UI can be aligned with the actual backend capabilities. It is written for UI implementation and UI-agent handoff: what actions exist, what inputs they expect, how jobs progress, what output shapes the UI should render, and which operational surfaces are already backed by workflow data.

## Workflow Inventory

| Workflow file | Functional area | Role |
|---|---|---|
| `INGEST API Queue Creator - SaaS.json` | Knowledge-base ingestion | Accepts project artifacts, uploads binaries to Supabase Storage, creates an ingestion job, logs queued metrics |
| `INGEST Worker Engine (Queue Processor).json` | Knowledge-base ingestion | Polls pending ingestion jobs, locks one job, downloads uploaded files, calls the vectorization engine |
| `Multimodal Knowledge Ingestion & Vectorization Engine.json` | Knowledge-base ingestion | Extracts document text and images, runs vision extraction, chunks content, stores embeddings in Chroma, updates ingestion status |
| `INGEST Workflow-Status-Check.json` | Knowledge-base ingestion | Exposes ingestion job status lookup |
| `RETRIEVAL Job Queue Creator - SaaS.json` | QA document generation | Accepts generation requests, creates a generation job, logs queued metrics |
| `RETRIEVAL Worker Engine (Queue Processor) - Saas.json` | QA document generation | Polls pending generation jobs, locks one job, calls the document generator agent |
| `RETRIEVAL Document Generator AI Agent - SaaS.json` | QA document generation | Retrieves vector knowledge, generates QA deliverables, quality-checks output, publishes to Confluence or Jira, updates job status |
| `RETRIEVE Workflow-status-check.json` | QA document generation | Exposes generation job status and output lookup |
| `Q-Ops-Agent-Analytics-Summary.json` | Analytics | Exposes dashboard analytics from logged job metrics |

## System Model

The workflows implement two main async pipelines:

1. Knowledge-base ingestion:
   User uploads project artifacts. n8n stores the files, queues an ingestion job, processes files in the background, vectorizes content into Chroma, and marks the job completed or failed.

2. QA artifact generation:
   User requests a QA deliverable for a project. n8n queues a generation job, retrieves relevant knowledge from Chroma, generates output with an OpenAI agent, applies quality gates, and publishes either a Confluence page or Jira epics/stories.

Both pipelines use Supabase job tables and polling-based status checks. The UI should not block on the initial submit response. It should submit, store the returned `jobId`, poll the corresponding status endpoint, then render completion output or failure state.

## Backend Contracts For UI

### 1. Upload Project Artifacts

Workflow: `INGEST API Queue Creator - SaaS.json`

Endpoint path:

```text
POST /upload-test-artifacts
```

Expected request:

| Field | Source | Notes |
|---|---|---|
| `projectName` | Request body | Required for storage path, vector metadata, and future generation filtering |
| Binary files | Multipart binary data | Any uploaded binary keys are iterated and uploaded |

Implemented behavior:

- Generates ingestion job id with format `ING-YYMMDD-RANDOM`.
- Uploads each file to Supabase Storage bucket `uploaded-project-docs`.
- Storage path format is `{projectName}/{jobId}/{encodedFileName}`.
- Builds a map of uploaded file keys to public file URLs.
- Inserts a row into Supabase table `doc_ingestion_jobs`.
- Sets initial status to `pending`.
- Stores job input as:

```json
{
  "projectName": "string",
  "files": {
    "binaryFieldName": "publicFileUrl"
  }
}
```

Response:

```json
{
  "jobId": "ING-YYMMDD-RANDOM",
  "status": "queued"
}
```

Metrics/logs written:

- `doc_ingestion_queuecreator_logs`
- `qa_job_metrics` with `pipeline: "ingestion"`, `event: "JOB_QUEUED"`, `status: "info"`, `total_files`, and file key metadata

UI implications:

- Create a knowledge-base upload form with `projectName` and multi-file picker.
- After submit, show queued state using the returned `jobId`.
- Preserve uploaded file names in UI state for user feedback.
- Poll ingestion status using `/job-status?jobId={jobId}`.

### 2. Check Ingestion Status

Workflow: `INGEST Workflow-Status-Check.json`

Endpoint path:

```text
GET /job-status?jobId={jobId}
```

Behavior:

- Reads `jobId` from query string.
- Queries Supabase table `doc_ingestion_jobs`.
- Selects `job_id,status`.

Response:

```json
{
  "jobId": "ING-YYMMDD-RANDOM",
  "status": "pending | processing | completed | failed | not_found"
}
```

UI implications:

- Poll until terminal status is `completed`, `failed`, or `not_found`.
- Display `pending` as queued and `processing` as vectorization in progress.
- Display `completed` as knowledge base ready for document generation.
- Display `failed` with a retry/re-upload CTA.
- Display `not_found` as invalid or expired job id.

### 3. Generate QA Document Or Jira Stories

Workflow: `RETRIEVAL Job Queue Creator - SaaS.json`

Endpoint path:

```text
POST /generate-qa-doc
```

Expected request body:

| Field | Required | Notes |
|---|---:|---|
| `projectName` | Yes | Used to retrieve project-specific vector knowledge |
| `documentType` | Yes | Determines prompt, source filters, quality gate, and output destination |
| `productOwner` | Recommended | Stored in queue metrics metadata |

Supported `documentType` values:

| Document type | Generated output | Final destination |
|---|---|---|
| `test_strategy` | Enterprise Test Strategy | Confluence |
| `test_plan` | Enterprise Test Plan | Confluence |
| `test_cases` | Enterprise Test Cases | Confluence |
| `risk_matrix` | Risk Assessment Matrix | Confluence |
| `traceability_matrix` | Requirement Traceability Matrix | Confluence |
| `user_stories` | Epics and user stories in strict JSON | Jira |

Implemented behavior:

- Generates generation job id with format `GEN-YYMMDD-RANDOM`.
- Inserts a row into Supabase table `qa_jobs`.
- Sets initial status to `pending`.
- Stores the full request body in `input`.

Response:

```json
{
  "jobId": "GEN-YYMMDD-RANDOM",
  "status": "queued"
}
```

Metrics written:

- `qa_job_metrics` with `pipeline: "generation"`, `event: "JOB_QUEUED"`, `status: "info"`, project name, document type, and product owner metadata

UI implications:

- Generation form should require project name and document type.
- Include product owner if the UI has project metadata or a user/profile concept.
- Show generated `jobId` and begin polling `/job-status-retrieve`.
- For `user_stories`, prepare UI to render Jira epics/stories, not a Confluence link.

### 4. Check Generation Status And Output

Workflow: `RETRIEVE Workflow-status-check.json`

Endpoint path:

```text
GET /job-status-retrieve?jobId={jobId}
```

Behavior:

- Reads `jobId` from query string.
- Queries Supabase table `qa_jobs`.
- Selects `job_id,status,output`.
- Normalizes `output` to an object or `null`.

Response:

```json
{
  "jobId": "GEN-YYMMDD-RANDOM",
  "status": "pending | processing | completed | failed | not_found",
  "output": null
}
```

Possible completed output for Confluence-backed document types:

```json
{
  "jobId": "GEN-YYMMDD-RANDOM",
  "status": "completed",
  "output": {
    "confluencePageId": "string",
    "url": "https://..."
  }
}
```

Possible completed output for `user_stories`:

```json
{
  "jobId": "GEN-YYMMDD-RANDOM",
  "status": "completed",
  "output": {
    "stories": [
      {
        "storyID": "string",
        "storyKey": "string",
        "storyLink": "string"
      }
    ],
    "epics": [
      {
        "epicID": "string",
        "epicKey": "string",
        "epicLink": "string"
      }
    ]
  }
}
```

Possible failed outputs:

```json
{
  "error": true,
  "message": "Quality Gate Failed - see n8n execution log for details"
}
```

```json
{
  "error": true,
  "errorType": "GENERATOR_AGENT_FAILED",
  "message": "string",
  "failed_at": "ISO timestamp"
}
```

UI implications:

- Poll until terminal status is `completed`, `failed`, or `not_found`.
- For completed Confluence jobs, show page link and page id.
- For completed Jira jobs, show created/existing epics and stories in a table with Jira keys and links.
- For failed jobs, branch error display by `output.errorType` when available.
- If `output` is null while status is pending/processing, keep showing progress.

### 5. Analytics Summary

Workflow: `Q-Ops-Agent-Analytics-Summary.json`

Endpoint path:

```text
GET /analytics-summary?pipeline={all|generation|ingestion}&days={number}
```

Default query behavior:

| Parameter | Default | Notes |
|---|---:|---|
| `pipeline` | `all` | Passed to overview and document type RPCs |
| `days` | `30` | Used to calculate `dateFrom` |

Data sources:

- Supabase RPC `get_analytics_overview`
- Supabase RPC `get_analytics_by_document_type`
- Supabase RPC `get_analytics_failure_rate`
- Supabase table `qa_job_metrics` for recent completed jobs

Response shape:

```json
{
  "overview": {
    "totalJobsCompleted": 0,
    "totalDocumentsGenerated": 0,
    "totalIngestionJobsCompleted": 0,
    "totalJobsFailed": 0,
    "successRate": 100,
    "totalCostUsd": 0,
    "avgCostPerDocument": 0,
    "totalTokensConsumed": 0,
    "totalChunksIngested": 0,
    "avgDurationMs": 0
  },
  "byDocumentType": [],
  "failureRate": {
    "generation": 0,
    "ingestion": 0
  },
  "recentJobs": [
    {
      "jobId": "string",
      "projectName": "string",
      "documentType": "string",
      "pipeline": "generation | ingestion",
      "status": "info | error",
      "durationMs": 0,
      "wordCount": 0,
      "tokensTotal": 0,
      "estimatedCostUsd": 0,
      "createdAt": "ISO timestamp"
    }
  ],
  "meta": {
    "generatedAt": "ISO timestamp",
    "dateFrom": "ISO timestamp",
    "pipeline": "all",
    "daysRequested": "30"
  }
}
```

Failure response:

```json
{
  "error": true,
  "message": "Analytics query failed",
  "details": "string"
}
```

UI implications:

- Build analytics dashboard from this endpoint instead of static cards.
- Provide filters for pipeline and date range.
- Use overview cards for completed jobs, generated documents, ingestion jobs, failures, success rate, cost, tokens, chunks, and duration.
- Use `byDocumentType` for charts/tables by deliverable type.
- Use `failureRate` for operational reliability widgets.
- Use `recentJobs` for an activity table with links to job detail/output.

## Queue And Worker Behavior

Both ingestion and generation workers:

- Run every 20 seconds.
- Query oldest pending job first using `status=eq.pending&order=created_at.asc&limit=1`.
- Attempt to lock the job by patching status from `pending` to `processing`.
- Continue only if the lock update returned a non-empty response.

UI implications:

- Initial submit can legitimately stay in `pending` for up to one worker cycle or longer if queue is busy.
- Show queue-friendly language such as "Queued", "Picked up", and "Processing".
- Avoid assuming immediate generation.
- Consider showing elapsed time and a non-blocking "You can leave this screen" message.

## Knowledge-Base Ingestion Details

### File Storage And Queue Creation

The upload workflow handles arbitrary binary fields. It splits each binary, uploads it to Supabase Storage, builds a file URL map, then stores the map in `doc_ingestion_jobs.input.files`.

UI features supported:

- Multi-file project artifact upload
- Job-level upload tracking
- File count and file key tracking
- Upload failure handling when no file uploads succeed

### Document Processing And Vectorization

Workflow: `Multimodal Knowledge Ingestion & Vectorization Engine.json`

Implemented processing:

- Receives binaries from the ingestion worker through an execute-workflow trigger.
- Calls local service `POST http://127.0.0.1:8000/process-document` with multipart file, `projectName`, `status`, and `jobId`.
- Extracts raw text and image payloads from documents.
- Splits images for vision processing.
- Applies a maximum vision image limit of 30 images per document.
- Uses OpenAI vision model `gpt-4o-mini` to extract:
  - Visible text
  - UI elements such as buttons, fields, and labels
  - Diagram components, services, integrations, and data flow
  - Testing insights
- Rebuilds each document with image-derived insights.
- Builds semantic content from document text plus image insights.
- Cleans markdown headers, separators, emoji ranges, bullets, excess line breaks, and extra spaces.
- Chunks semantic content using logical sections.
- Stores chunks in Chroma collection `qa-chunks-batches`.
- Uses OpenAI embeddings through the n8n LangChain embeddings node.

Chunking behavior:

| Setting | Value |
|---|---:|
| Logical chunk size | 10,000 characters |
| Overlap | 2,000 characters |
| Minimum chunk size | 200 characters |
| Storage batch size | 50 chunks |
| Token splitter size | 20,000 |

Chunk metadata stored:

| Metadata field | Meaning |
|---|---|
| `project` | Project name |
| `jobId` | Ingestion job id |
| `status` | Processing status at time of chunking |
| `fileName` / `filename` | Source file name |
| `fileType` | Source file type |
| `documentId` | Source document id when available |
| `docType` | Document category such as BRD, FRD, HLD, LLD, UI/UX, TRANSCRIPT |
| `pageCount` | Page count when available |
| `contentMode` | Text-only, image-only, or hybrid style indicator |
| `containsImages` | Whether source had images |
| `containsText` | Whether source had text |
| `sectionTitle` | Logical section title |
| `sectionIndex` | Logical section number |
| `structuralType` | Currently `logical_section` |
| `chunkIndex` | Chunk index within section |
| `imageId` | Related image id if chunk came from image context |
| `contentSource` | `text` or `image` |
| `compositeKey` | `{project}|{docType}|{contentSource}` |

Completion behavior:

- Updates `doc_ingestion_jobs` from `processing` to `completed`.
- Stores output:

```json
{
  "totalChunksStored": 0
}
```

- Logs `JOB_COMPLETED` to `qa_job_metrics` with `pipeline: "ingestion"`, chunk count, total files, and file keys.

Error behavior:

- Vision errors are normalized with job id, project name, image id, image file, parent file, and timestamp.
- Data loader errors are normalized with source, message, stack, project, filename, doc type, section title, chunk index, content preview, and timestamp.
- Failed ingestion patches `doc_ingestion_jobs` to `failed`.

UI implications:

- The UI can message ingestion as "Extracting text", "Analyzing images", "Vectorizing knowledge", and "Storing chunks", although the status endpoint currently exposes only coarse statuses.
- An artifact repository can show project, files, file count, chunk count, and last ingestion job status if it reads Supabase or an added API exposes those fields.
- For large image-heavy docs, communicate that only the first 30 images are processed for vision insights.

## QA Document Generation Details

Workflow: `RETRIEVAL Document Generator AI Agent - SaaS.json`

### Retrieval And Prompting

Implemented behavior:

- Uses OpenAI chat model `gpt-4.1-mini` with max tokens `8000`.
- Uses Chroma collection `qa-chunks-batches` as a retrieval tool with `topK: 20`.
- Builds document-specific prompts from `documentType`.
- Builds source filters and composite keys per document type.

Document source filters:

| Document type | Source document categories used in prompt context |
|---|---|
| `test_strategy` | BRD, FRD, HLD, LLD, TRANSCRIPT |
| `test_plan` | FRD, LLD, HLD, TRANSCRIPT |
| `test_cases` | FRD, LLD, UI/UX, TRANSCRIPT |
| `user_stories` | BRD, FRD, HLD, LLD, UI/UX, TRANSCRIPT |
| `risk_matrix` | HLD, LLD, FRD |
| `traceability_matrix` | BRD, FRD, LLD |

Content sources:

```json
["text", "image"]
```

UI implications:

- Document type selector should describe what source artifacts are useful for each output.
- If user tries generation before ingestion, UI should warn that a project knowledge base should exist first.
- For image-driven UI/UX artifacts, generation can use image-derived insights from ingestion.

### Quality Gate

Every generated output goes through validation before publishing.

Minimum word counts:

| Document type | Minimum words |
|---|---:|
| `test_strategy` | 2000 |
| `test_plan` | 1500 |
| `test_cases` | 1000 |
| `user_stories` | 500 |
| `risk_matrix` | 800 |
| `traceability_matrix` | 800 |

Required content checks:

| Document type | Required markers |
|---|---|
| `test_strategy` | Introduction, Scope, Automation, Risk, Metrics |
| `test_plan` | Scope, Objectives, Entry, Exit, Risk |
| `test_cases` | Test Case, Precondition, Expected |
| `user_stories` | epicId, userStoryId, acceptanceCriteria |
| `risk_matrix` | Risk, Probability, Impact, Mitigation |
| `traceability_matrix` | Req ID, Test Case, Coverage |

Traceability gate:

- All document types except `user_stories` must include source references such as BRD, FRD, HLD, LLD, transcript, "as mentioned in", "according to", or requirement.

Metrics captured:

- Word count
- Character count
- Input tokens
- Output tokens
- Total tokens
- Estimated cost in USD
- Quality gate passed or failed

UI implications:

- Show quality gate pass/fail in job detail.
- On failure, display "Quality gate failed" separately from platform/integration errors.
- For analytics, show word count, token usage, and estimated cost when available.

### Confluence Publishing

Applies to:

- `test_strategy`
- `test_plan`
- `test_cases`
- `risk_matrix`
- `traceability_matrix`

Implemented behavior:

- Cleans generated markdown.
- Converts markdown to both DOCX/Confluence format using local service `POST http://127.0.0.1:5050/convert`.
- Converts markdown to Confluence storage HTML inside n8n.
- Checks if a Confluence page already exists.
- Creates a new Confluence page or updates the existing page.
- Uses Confluence space key `TD`.
- Page title format: `{Title Cased Document Type} - {projectName}`.
- On success, updates `qa_jobs.output` with Confluence page id and URL.

UI implications:

- Render an "Open in Confluence" CTA on completed document jobs.
- Show whether the result created or updated a page if this is added to output or inferred from metrics.
- Use document type and project name as the display title.
- Consider a document history screen keyed by `projectName` and `documentType`.

### Jira Epic And Story Creation

Applies to:

- `user_stories`

Implemented behavior:

- The AI output must be strict JSON with:
  - `epics`
  - `userStories`
- Parses JSON and removes `--- USER_STORY_BREAK ---` delimiters if present.
- Filters invalid user story items.
- Searches Jira for existing epics by epic summary.
- Splits epics into existing and missing.
- Creates missing epics.
- Generates an idempotency label per user story from epic name and story content.
- Searches Jira stories by idempotency label.
- Creates only missing stories.
- Aggregates created/existing story and epic keys for final output.

Expected AI story fields:

| Epic field | User story field |
|---|---|
| `epicId` | `userStoryId` |
| `epicName` | `epicId` |
| `epicDescription` | `feature` |
| `businessObjective` | `userStory` |
| `successMetrics` | `userStoryDescription` |
| `sourceTraceability` | `businessContext` |
|  | `primaryFlow` |
|  | `alternateFlows` |
|  | `exceptionHandling` |
|  | `acceptanceCriteria` |
|  | `uiUxRequirements` |
|  | `fieldValidationRules` |
|  | `dataIntegrationRequirements` |
|  | `performanceNFRs` |
|  | `testScenarios` |
|  | `dependencies` |
|  | `assumptions` |
|  | `sourceTraceability` |
|  | `automationFeasibility` |

Jira configuration visible in workflow:

- Jira project node uses project id `10001`, cached name `Augmenting AI in STLC`.
- Epic issue type id `10002`.
- Story issue type id `10006`.
- JQL searches reference project key `KAN`.

UI implications:

- For `user_stories`, do not show a Confluence output state.
- Render Jira result tables:
  - Epics: key, id, link
  - Stories: key, id, link
- Include messaging for idempotent behavior: reruns should avoid duplicate stories when labels match.
- If no stories are returned, show a parsing/creation failure state.
- Consider allowing users to preview generated epics/stories before Jira creation in a future workflow revision. Current backend creates Jira issues automatically after generation.

## Operational Logs And Metrics

Main table used for cross-pipeline analytics:

```text
qa_job_metrics
```

Events logged:

| Event | Pipeline | Meaning |
|---|---|---|
| `JOB_QUEUED` | ingestion | Artifact upload job queued |
| `JOB_COMPLETED` | ingestion | Vectorization completed |
| `JOB_QUEUED` | generation | QA generation job queued |
| `JOB_STARTED` | generation | Document generator agent started |
| `QUALITY_GATE_PASSED` | generation | Generated output passed validation |
| `QUALITY_GATE_FAILED` | generation | Generated output failed validation |
| `JOB_COMPLETED` | generation | Confluence or Jira job completed |
| `JOB_FAILED` | generation | Confluence, quality gate, or generator failure |

Metric fields used across workflows:

- `job_id`
- `project_name`
- `document_type`
- `pipeline`
- `event`
- `status`
- `duration_ms`
- `word_count`
- `tokens_input`
- `tokens_output`
- `tokens_total`
- `estimated_cost_usd`
- `chunk_count`
- `total_files`
- `error_message`
- `metadata`

UI implications:

- Audit log can be backed by `qa_job_metrics`.
- Notifications can be created from terminal events and error events.
- Recent activity can show both ingestion and generation events.
- Cost and token dashboards are already supported for generation quality pass events.

## Suggested UI Feature Backlog Based On Implemented Workflows

### P0: Core Backend-Aligned UI

| UI feature | Backend support | Required UI behavior |
|---|---|---|
| Knowledge-base upload | `/upload-test-artifacts` | Multipart upload, queued response, status polling, success/failure state |
| Ingestion job status | `/job-status` | Poll by job id, render pending/processing/completed/failed/not_found |
| Document generation | `/generate-qa-doc` | Submit project name, document type, optional product owner, poll status |
| Generation job result rendering | `/job-status-retrieve` | Render Confluence links or Jira epics/stories based on output shape |
| Analytics dashboard | `/analytics-summary` | Replace static metrics with overview, failure rate, recent jobs, and document-type breakdown |

### P1: Operational Product UI

| UI feature | Backend support | Required UI behavior |
|---|---|---|
| Job history | `qa_job_metrics`, `qa_jobs`, `doc_ingestion_jobs` | Show jobs by project, pipeline, status, date, and output link |
| Audit log | `qa_job_metrics` | Timeline of queued, started, quality gate, completed, and failed events |
| Notification center | `qa_job_metrics` and polling | Alert on completed/failed jobs and quality gate failures |
| Artifact repository | `doc_ingestion_jobs.input.files`, storage URLs, ingestion output | List uploaded artifacts by project and ingestion run |
| Project workspace | `projectName` used across all workflows | Project selector/recent projects derived from jobs and metrics |

### P2: Workflow-Aware Enhancements

| UI feature | Backend support | Required UI behavior |
|---|---|---|
| Quality gate detail | `qa_job_metrics`, failed output | Show failed sections, word-count thresholds, traceability warnings if exposed |
| Cost dashboard | `estimated_cost_usd`, token fields | Show cost per job, average cost, token trends |
| Chroma ingestion health | `totalChunksStored`, `chunk_count` | Show chunk counts and ingestion completion summaries |
| Confluence document history | `qa_jobs.output.url`, metrics metadata | List generated page URLs by project and document type |
| Jira creation summary | `qa_jobs.output.stories`, `qa_jobs.output.epics` | Show created/existing Jira keys and open links |

## UI State Machine Recommendations

Use one shared async job component pattern for ingestion and generation.

| Backend status | UI label | Recommended UI action |
|---|---|---|
| Initial submit in progress | Submitting | Disable submit button, keep form visible |
| `queued` submit response | Queued | Store job id, start polling |
| `pending` | Waiting in queue | Show queued state and elapsed time |
| `processing` | Processing | Show pipeline-specific progress copy |
| `completed` with Confluence output | Completed | Show "Open in Confluence" and page id |
| `completed` with Jira output | Completed | Show epics and stories table |
| `completed` ingestion | Knowledge base ready | Enable document generation for that project |
| `failed` | Failed | Show error output if available and retry CTA |
| `not_found` | Not found | Ask user to verify job id or retry |

## Integration Notes And Caveats

- The status endpoints expose coarse job status only. Fine-grained progress labels such as "vision extraction" and "vectorizing" are inferred from workflow design, not currently returned by the status APIs.
- Ingestion completion status currently returns only status via `/job-status`; chunk count is stored in job output and metrics but not selected by the status-check workflow.
- Generation status returns `output`, so the UI can render Confluence or Jira results directly.
- The document generator builds composite keys by document type and source, but the visible Chroma tool parameter filters only by `projectName`. Treat document-type filtering as prompt guidance unless backend filtering is expanded.
- Jira node configuration and JQL use different visible project identifiers: Jira node project id `10001` cached as `Augmenting AI in STLC`, while JQL searches use project key `KAN`. Verify this in the n8n/Jira environment before exposing project selection in UI.
- Current generation workflow publishes outputs automatically. There is no backend review/approval step before Confluence/Jira creation.

## Recommended UI Agent Prompt

Use this prompt to instruct a UI implementation agent:

```text
Update the Q-Ops Agent UI to match the backend n8n workflows documented in docs/n8n-workflow-functionality-map.md.

Implement or refine these backend-aligned behaviors:
1. Knowledge-base upload: POST multipart data to /upload-test-artifacts with projectName and files. Store returned jobId and poll /job-status?jobId=...
2. Ingestion status UI: render pending, processing, completed, failed, and not_found states. On completed, mark the project knowledge base as ready.
3. QA document generation: POST to /generate-qa-doc with projectName, documentType, and productOwner where available. Supported document types are test_strategy, test_plan, test_cases, user_stories, risk_matrix, and traceability_matrix.
4. Generation status UI: poll /job-status-retrieve?jobId=... and render output by shape. For Confluence output, show confluencePageId and url. For user_stories output, show Jira epics and stories tables.
5. Analytics: use /analytics-summary with pipeline and days filters. Render overview metrics, document-type breakdown, failure rate, recent jobs, cost, token usage, chunk count, and average duration.
6. Audit/activity surfaces: model them around qa_job_metrics events: JOB_QUEUED, JOB_STARTED, QUALITY_GATE_PASSED, QUALITY_GATE_FAILED, JOB_COMPLETED, and JOB_FAILED.
7. Error handling: distinguish quality gate failures, generator agent failures, not_found jobs, and generic failed statuses.

Keep the UI asynchronous and queue-aware. Do not assume immediate completion after submit.
```
