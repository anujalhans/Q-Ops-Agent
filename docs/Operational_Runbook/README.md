# Operational Runbook

Generated on 2026-05-08.

Use this runbook when Q-Ops Agent jobs, authentication, analytics, or integrations fail.

## Fast Triage Checklist

1. Confirm UI is pointed to the expected n8n base URL.
2. Open `/webhook/health`.
3. Check `/webhook/infrastructure-load`.
4. Identify job id from UI, Supabase, or n8n execution.
5. Check relevant Supabase table:
   - generation: `qa_jobs`
   - ingestion: `doc_ingestion_jobs`
   - metrics: `qa_job_metrics`
   - ingestion logs: `doc_ingestion_queuecreator_logs`
6. Check n8n execution for queue creator, worker, and full engine.
7. Confirm `JOB_FAILED` or `JOB_COMPLETED` metric exists.
8. If stuck, mark old jobs failed for analytics consistency.

## Common Symptoms

### User Cannot Log In

Check:

- Supabase Auth user exists.
- `qops_users.auth_user_id` maps to Supabase Auth user.
- `qops_users.status = active`.
- `/webhook/me` returns the user with role and project assignments.
- Browser localStorage has a fresh `qops-agent-supabase-session`.

Actions:

- Ask user to sign out and sign in again.
- Refresh token by re-login if session expired.
- Check n8n workflow `Q-Ops Agent Auth Me API`.

### Invite Link Fails

Check:

- Supabase Auth redirect URL includes `/auth/callback`.
- Invite workflow wrote/upserted `qops_users`.
- Invitee profile status is `pending_invite` before acceptance.
- `/webhook/users/accept-invite` can activate the profile.

Actions:

- Re-send invite if Supabase link expired.
- Verify user email matches `qops_users.email`.

### Knowledge Ingestion Stuck

Check:

- `doc_ingestion_jobs.status`.
- `doc_ingestion_jobs.started_at`, `completed_at`, `error_message`.
- `doc_ingestion_queuecreator_logs` for request/queue details.
- `qa_job_metrics` has `JOB_QUEUED` and possibly `JOB_STARTED`.
- n8n worker `INGEST Worker Engine (Queue Processor) - Attributed Draft`.
- full engine `Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft`.

Actions:

- If job is old and not processing, mark failed.
- If worker is inactive, publish/activate correct worker.
- If extraction/vectorization failed, inspect full engine node output.

### Document Generation Stuck

Check:

- `qa_jobs.status`.
- `qa_jobs.document_type`.
- `qa_jobs.project_name`.
- `qa_jobs.error_message`.
- `qa_job_metrics` lifecycle events.
- worker `RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft`.
- full engine `RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft`.

Actions:

- Confirm Chroma collection has data for project.
- Confirm quality gate output includes tokens/cost.
- Confirm downstream format/publish nodes are not timing out.

### User Stories/Epics Fail

Check:

- document type is `user_stories`.
- Jira settings are present in `/webhook/settings`.
- Jira credential exists in n8n.
- Quality gate output includes `stories` and `epics` arrays.
- Jira branch metrics include token/cost attribution.

Actions:

- Inspect `qa_jobs.output`.
- Inspect `qa_job_metrics.metadata`.
- Confirm no invalid JSON body expressions in n8n HTTP nodes.

### Analytics Missing Token Or Cost

Check:

- `qa_job_metrics.tokens_input`
- `qa_job_metrics.tokens_output`
- `qa_job_metrics.tokens_total`
- `qa_job_metrics.estimated_cost_usd`
- quality gate node in full retrieval workflow.
- downstream nodes receive restored quality gate output.

Actions:

- Re-run generation with known small input.
- Confirm `JOB_COMPLETED` metric row includes cost/tokens.
- Check `/webhook/analytics-summary`.

### Confluence/DOCX Conversion Times Out

Symptom:

```text
timeout of 300000ms exceeded
ECONNABORTED
```

Check:

- converter service is running.
- service URL in n8n workflow/runtime config.
- payload size.
- markdown content length.
- converter logs.

Actions:

- Test converter `/health`.
- Reduce payload or split output.
- Increase timeout only after service health is confirmed.

### API Returns Invalid JSON

Symptom:

```text
The value in the "JSON Body" field is not valid JSON
```

Check:

- n8n HTTP Request JSON body expressions.
- Missing values that render as blank after a colon.
- Arrays like `$json.stories` or `$json.epics` that may be undefined.

Actions:

- Use `JSON.stringify` or construct JSON in Code node.
- Default missing arrays to `[]`.
- Avoid templated JSON when object body mode is available.

## Supabase Tables By Incident Type

| Incident | Tables |
| --- | --- |
| Login/auth | `qops_users`, `qops_project_members`, Supabase Auth users |
| Project visibility | `qops_projects`, `qops_project_members` |
| Ingestion queue | `doc_ingestion_jobs`, `doc_ingestion_queuecreator_logs` |
| Generation queue | `qa_jobs` |
| Metrics/analytics | `qa_job_metrics` |
| Settings | `qops_environment_settings`, `qops_integration_settings`, `qops_project_integration_overrides` |
| Audit | `qops_audit_events`, `qa_job_metrics` |
| Integration health | `qops_connection_test_results` |

## Safe Recovery Actions

- Re-run failed job from UI if supported.
- Reprocess failed artifact.
- Mark old stuck jobs as failed for analytics.
- Re-run integration tests.
- Refresh settings from UI.
- Re-import workflow JSON only after backing up current workflow.

## Dangerous Actions

Do not do these without explicit backup/approval:

- Delete Supabase rows for active jobs.
- Disable production workflows during active processing.
- Rotate service-role keys without updating all n8n credentials.
- Publish draft workflows over production without cutover plan.
- Clear storage bucket contents.

