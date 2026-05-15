# n8n Workflow Plan

## Scope

Create new n8n workflows for Delivery Intelligence. Do not modify the current QA workflows until the new workflows are validated.

Existing QA workflows stay responsible for:

- QA document generation
- Jira epics and stories
- Confluence output
- QA metrics
- Existing ingestion

Delivery Intelligence workflows should be separate and use `DI` or `Delivery Intelligence` naming.

## Workflow Naming

Recommended prefix:

- `DI -`

Examples:

- `DI - Intelligence Queue Creator`
- `DI - Intelligence Worker`
- `DI - Reusable Solution Extractor`
- `DI - Cross Project Search API`

## Core Workflows

### 1. DI - Intelligence Queue Creator

Purpose:

Accept UI requests to create Delivery Intelligence jobs.

Endpoint:

- `POST /webhook/di/jobs`

Responsibilities:

- Verify Supabase bearer token.
- Resolve active `qops_users` profile.
- Validate project access.
- Insert into `di_intelligence_jobs`.
- Log to `qa_job_metrics` or future `di_job_metrics`.
- Return `jobId`.

Supported job types:

- `project_intelligence_extract`
- `solution_extract`
- `technology_extract`
- `relationship_build`
- `recommendation_generate`
- `semantic_reindex`

### 2. DI - Intelligence Worker

Purpose:

Process pending `di_intelligence_jobs`.

Trigger:

- Schedule every 20 to 60 seconds.

Responsibilities:

- Fetch oldest pending job.
- Lock job by moving `pending` to `processing`.
- Route by `job_type`.
- Mark completed or failed.
- Store output and metrics.

### 3. DI - Project Intelligence Extractor

Purpose:

Extract technologies, patterns, reusable opportunities, and learnings from project artifacts.

Inputs:

- Project id
- Project name
- Chroma collection or source references
- Existing QA outputs
- Jira or Confluence references if available

Outputs:

- Project summary
- Technologies
- Potential reusable solutions
- Learnings
- Knowledge relationships
- Recommended next extraction jobs

Writes:

- `di_technologies`
- `di_project_technologies`
- `di_organizational_learnings`
- `di_knowledge_relationships`

### 4. DI - Reusable Solution Extractor

Purpose:

Identify reusable solutions from artifacts, generated documents, Jira issues, and Confluence content.

Outputs:

- Draft reusable solutions
- Related technologies
- Source evidence
- Reuse recommendations

Writes:

- `di_reusable_solutions`
- `di_solution_technologies`
- `di_solution_assets`
- `di_knowledge_relationships`

Quality gate:

- Must include source evidence.
- Must include visibility level.
- Must not publish automatically if client-sensitive data is detected.

### 5. DI - Similarity Detector

Purpose:

Detect similar projects, similar solutions, and duplicate implementation opportunities.

Inputs:

- Current project summary
- Technology list
- Domain tags
- Chroma semantic results
- Existing reusable solutions

Outputs:

- Similar project list
- Similar solution list
- Confidence score
- Explanation

Writes:

- `di_knowledge_relationships`
- `di_recommendations`

### 6. DI - Recommendation Generator

Purpose:

Generate contextual AI recommendations.

Recommendation types:

- `similar_solution_found`
- `reusable_accelerator_available`
- `duplicate_effort_risk`
- `qa_strategy_reuse`
- `technology_pattern_reuse`
- `delivery_risk`
- `onboarding_learning`

Writes:

- `di_recommendations`

### 7. DI - Cross Project Search API

Purpose:

Serve semantic search results to the UI.

Endpoint:

- `GET /webhook/di/search?q=...`

Search categories:

- Projects
- Reusable solutions
- Technologies
- Learnings
- QA outputs
- Generated documents
- Related artifacts

Responsibilities:

- Verify user.
- Apply project visibility rules.
- Query Chroma or Supabase.
- Return governed, summarized results.

### 8. DI - Solution Marketplace API

Purpose:

List and manage reusable solutions.

Endpoints:

- `GET /webhook/di/solutions`
- `GET /webhook/di/solutions/:id`
- `POST /webhook/di/solutions`
- `PATCH /webhook/di/solutions/:id`

Responsibilities:

- Return only visible solutions.
- Allow admin or owner edits.
- Track audit events for publishing and edits.

### 9. DI - Technology Intelligence API

Purpose:

Return technology usage and relationships.

Endpoints:

- `GET /webhook/di/technologies`
- `GET /webhook/di/technologies/:id`

Responsibilities:

- Show technologies by project usage.
- Link technologies to reusable solutions and learnings.

### 10. DI - Recommendation Feedback API

Purpose:

Capture user feedback on recommendations.

Endpoint:

- `PATCH /webhook/di/recommendations/:id`

Actions:

- Mark viewed
- Accept
- Dismiss
- Convert to action

Writes:

- `di_recommendations`
- `qops_audit_events`

## Credential Strategy

Use service-role credentials for backend writes and extraction jobs.

Use user bearer token only for:

- Resolving current user
- Enforcing access decisions
- UI-facing request identity

Never expose service-role keys to the frontend.

## Metrics And Audit

Use `qa_job_metrics` initially for lifecycle telemetry if you want one common analytics stream.

Recommended long-term option:

- Create `di_job_metrics` if Delivery Intelligence metrics become too different from QA metrics.

Audit events should be written for:

- Publishing a reusable solution
- Editing visibility
- Accepting recommendations
- Dismissing recommendations
- Exporting sensitive intelligence
- Changing governance settings

## Rollout Strategy

1. Create workflows inactive.
2. Test each workflow manually with pinned data.
3. Publish only UI-facing read APIs first.
4. Publish queue creator.
5. Publish worker after test data is ready.
6. Run admin and registered-user E2E tests.

