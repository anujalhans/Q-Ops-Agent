# Testing And Cutover Plan

## Testing Goals

Validate that Delivery Intelligence works without breaking the existing Q-Ops QA platform.

Must preserve:

- Existing login
- Existing project visibility
- Existing QA document generation
- Existing Jira and Confluence workflows
- Existing analytics
- Existing polling and metrics

## Test Environments

Recommended:

1. Local development
2. n8n draft workflows
3. Supabase development branch or isolated test project
4. Controlled production rollout

## Test Data

Use a small set of known projects:

- One admin-owned project
- One registered-user assigned project
- One restricted project
- One project with enough artifacts for reusable solution extraction

Seed examples:

- Technologies: Spring Boot, Kafka, Redis, Playwright, Jira, Confluence
- Reusable solutions: retry pattern, automation framework, idempotency strategy
- Learnings: payment gateway timeout handling, duplicate callback prevention

## Supabase Validation

Before UI connection:

- Tables exist.
- RLS enabled.
- Admin can read/write.
- Registered user can read assigned project records.
- Registered user cannot read restricted records.
- Service-role n8n writes work.
- Indexes exist for queue, project, requested_by, and created_at queries.

Run advisors after schema changes:

- Security advisor
- Performance advisor

## n8n Validation

For each workflow:

1. Validate workflow structure.
2. Test with pinned data.
3. Test manually through MCP.
4. Test via webhook.
5. Confirm Supabase writes.
6. Confirm RLS behavior.
7. Confirm failure path updates job status.

Workflow smoke tests:

- Queue job
- Worker lock
- Successful extraction
- AI parser failure
- No source evidence
- Restricted project access denied
- Registered-user project scoping

## UI Validation

Admin tests:

- Login as admin.
- Open Delivery Intelligence Overview.
- View all projects.
- Create extraction job.
- View marketplace records.
- View recommendations.
- Edit solution visibility.

Registered-user tests:

- Login as registered user.
- See only assigned project intelligence plus organization-visible assets.
- Search cross-project knowledge.
- Confirm restricted records are masked or hidden.
- Accept/dismiss recommendation.

Regression tests:

- Generate Test Plan.
- Generate Epics and User Stories.
- Confirm job polling.
- Confirm analytics still update.
- Confirm current QA documents remain visible.

## Rollout Strategy

Step 1:

- Add docs and final plan.

Step 2:

- Create Supabase tables in development.

Step 3:

- Build draft n8n workflows inactive.

Step 4:

- Build UI screens behind feature flag.

Step 5:

- Run admin E2E test.

Step 6:

- Run registered-user E2E test.

Step 7:

- Publish read-only UI features.

Step 8:

- Publish write/extraction features.

## Feature Flag Recommendation

Add a setting:

- `delivery_intelligence_enabled`

Keep the new UI hidden until:

- Tables are ready.
- Workflows are published.
- RLS is verified.
- Admin and registered-user tests pass.

## Production Readiness Checklist

- Supabase schema reviewed.
- RLS policies reviewed.
- Performance indexes added.
- n8n workflows tested.
- UI permissions tested.
- Service-role credentials only used in backend workflows.
- No service-role key exposed to UI.
- Chroma metadata includes visibility fields.
- Audit events recorded for sensitive actions.
- Recommendations include source evidence.
- Existing Q-Ops flows retested.

## Rollback Plan

If issues occur:

- Disable `delivery_intelligence_enabled`.
- Unpublish DI queue creator and worker.
- Keep read-only tables intact for investigation.
- Do not remove current QA workflows.
- Do not modify `fullRetrievalD01`.

