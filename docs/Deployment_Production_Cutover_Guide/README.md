# Deployment And Production Cutover Guide

Generated on 2026-05-08.

This guide is for recreating Q-Ops Agent in a production environment.

## Pre-Cutover Inputs

Required documentation:

- `docs/Supabase_documentation`
- `docs/n8n_workflows_2026-05-08`
- `docs/n8n_documentation_2026-05-08`
- `docs/UI_documentation`
- `docs/Environment_Secrets_documentation`

Required decisions:

- Production Supabase project.
- Production n8n instance/base URL.
- Production frontend origin.
- Whether Supabase storage bucket remains public.
- Credential owner for OpenAI/Jira/Confluence/Chroma.
- Which workflows are production-active vs draft-active.

## Phase 1: Supabase Production Setup

1. Create production Supabase project.
2. Apply migrations in order:
   - `20260507045008 persona_settings_backend_support`
   - `20260507045201 restrict_runtime_config_rpc_to_service_role`
   - `20260507075620 add_unique_qops_users_email`
   - `20260507153328 add_qa_job_metrics_attribution_columns`
3. Verify tables, views, functions, indexes, constraints, triggers.
4. Create/configure storage bucket `uploaded-project-docs`.
5. Configure Auth redirect URLs:
   - `https://{frontend}/auth/callback`
6. Seed runtime settings:
   - environments
   - integrations
   - project overrides if needed
7. Create admin `qops_users` record mapped to Supabase Auth user.
8. Review RLS/security advisor findings before opening to users.

## Phase 2: n8n Production Setup

1. Install/start production n8n.
2. Configure environment variables and encryption key.
3. Recreate credentials:
   - Supabase service role
   - Supabase Auth/JWT validation
   - OpenAI
   - Jira
   - Confluence
   - ChromaDB
   - converter/extractor auth if applicable
4. Import workflow JSON from:

```text
docs/n8n_workflows_2026-05-08/Published
```

5. Verify credential references for every imported workflow.
6. Publish/activate intended workflows.
7. Confirm webhook URLs.
8. Run `/webhook/health`.

## Phase 3: Frontend Production Setup

1. Move Supabase config to environment variables.
2. Set production n8n/API base URL.
3. Build:

```bash
npm run build
```

4. Deploy `dist`.
5. Confirm browser can reach:
   - Supabase Auth.
   - n8n/API gateway.
6. Confirm CORS allows production origin.

## Phase 4: Smoke Tests

### Auth

1. Admin login succeeds.
2. `/webhook/me` returns active admin.
3. Invite registered user.
4. Accept invite.
5. Registered user sees only assigned project.
6. Disabled user cannot access dashboard.

### Ingestion

1. Create project.
2. Upload small BRD/FRD.
3. Confirm `doc_ingestion_jobs` queued.
4. Confirm worker processes.
5. Confirm Chroma receives chunks.
6. Confirm UI status completed.
7. Confirm `qa_job_metrics` has queued/started/completed.

### Generation

1. Generate Test Strategy.
2. Confirm `qa_jobs` queued.
3. Confirm worker processes.
4. Confirm quality gate returns word count/tokens/cost.
5. Confirm Confluence/DOCX output.
6. Confirm UI generated document appears.

### Jira Branch

1. Generate Epics & User Stories.
2. Confirm Jira issues created/updated.
3. Confirm no mojibake/garbage heading prefix.
4. Confirm token/cost recorded.

### Observability

1. `/webhook/analytics-summary` returns real data.
2. `/webhook/infrastructure-load` returns score and services.
3. `/webhook/audit-events` returns scoped events.
4. Settings integration tests persist results.

## Rollback Plan

If production cutover fails:

1. Stop new UI traffic or route users back to old environment.
2. Disable production queue creator webhooks if duplicate job creation is happening.
3. Leave workers running only if they are finishing already-queued jobs safely.
4. Export current n8n workflows.
5. Restore prior workflow versions from backup.
6. Mark incomplete test jobs failed if needed.
7. Document failed step and root cause.

## Post-Cutover Checklist

- Back up final production workflow JSON.
- Back up Supabase schema.
- Run Supabase security/performance advisors.
- Confirm all required workflows active.
- Confirm no draft workflow accidentally owns production webhook route.
- Confirm analytics after first real ingestion/generation.
- Confirm logs and alerts.

