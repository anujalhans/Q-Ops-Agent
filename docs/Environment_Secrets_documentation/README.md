# Environment And Secrets Documentation

Generated on 2026-05-08.

This documentation lists environment values, credential references, secret categories, and rotation/ownership notes required to run Q-Ops Agent. It intentionally does not store secret values.

## Purpose

Use this folder when:

- Creating a new local, staging, or production environment.
- Rebuilding n8n credentials.
- Rotating API keys or tokens.
- Debugging missing runtime configuration.
- Handing context to a future engineer or AI agent.

## Environment Inventory

| Area | Current Source | Production Recommendation |
| --- | --- | --- |
| UI base URL for n8n | Browser `localStorage` key `qops-agent-api-base-url`, default `http://localhost:5678` | Configure through build-time env or runtime config endpoint. |
| Supabase URL | Hardcoded in `src/lib/auth.ts` | Move to `VITE_SUPABASE_URL`. |
| Supabase publishable key | Hardcoded in `src/lib/auth.ts` | Move to `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| Supabase service role key | n8n credential / backend-only | Never expose to UI. Store only in n8n credentials or secret manager. |
| n8n webhook base | UI setting and Supabase `qops_environment_settings` | Use public production n8n/API gateway URL. |
| n8n credentials | n8n instance | Recreate credential names and scopes from workflow docs. |
| ChromaDB config | n8n runtime settings / integration settings | Store collection/base URL in DB; secrets in n8n credential or secret manager. |
| OpenAI config | n8n credential/runtime config | Store API key in n8n credential/secret manager. |
| Jira config | UI settings plus n8n credential | Store routing config in Supabase; token in n8n credential. |
| Confluence config | UI settings plus n8n credential | Store routing config in Supabase; token in n8n credential. |
| Converter/microservice URL | n8n workflow parameters/runtime settings | Externalize per environment. |

## UI Environment Variables To Introduce

Current implementation hardcodes Supabase details in `src/lib/auth.ts`. For production, introduce:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_QOPS_DEFAULT_API_BASE_URL=
```

Optional:

```text
VITE_QOPS_ENVIRONMENT_KEY=production
VITE_QOPS_APP_NAME=Q-Ops Agent
```

## Supabase Required Configuration

| Item | Required | Notes |
| --- | --- | --- |
| Project URL | Yes | Used by UI and n8n. |
| Publishable key | Yes | Used by UI for Supabase Auth REST calls. |
| Service role key | Yes | Used only by n8n backend workflows for Supabase table writes/reads. |
| Auth redirect URL | Yes | Must include `{frontend_origin}/auth/callback`. |
| Storage bucket | Yes | `uploaded-project-docs`. Current bucket is public. Decide if production should remain public. |
| Database migrations | Yes | See `docs/Supabase_documentation`. |
| Runtime settings rows | Yes | Seed `qops_environment_settings`, `qops_integration_settings`, and overrides if needed. |

## n8n Credential Categories

Credential values are not exported in workflow JSON. Recreate credentials by category:

| Credential Category | Used For | Storage |
| --- | --- | --- |
| Supabase service role | REST writes/reads to Supabase tables and storage | n8n credential, never UI. |
| Supabase publishable/JWT validation | Verifying bearer tokens in auth-aware workflows | n8n credential/env. |
| OpenAI | Generation, extraction, embeddings, QA outputs | n8n credential. |
| Jira | Creating/updating epics and user stories | n8n credential. |
| Confluence | Publishing generated docs/pages | n8n credential. |
| ChromaDB | Vector upsert/query | n8n credential or runtime URL plus secret. |
| Converter service | Markdown/DOCX/Confluence conversion | Runtime URL; auth if added. |
| Extractor service | Document parsing/extraction | Runtime URL; auth if added. |

## Secret Handling Rules

- Do not commit secret values to Git.
- Do not place service-role keys in frontend code.
- Do not place OpenAI/Jira/Confluence tokens in Supabase public tables.
- Store secret references in Supabase if needed, not secret values.
- Use n8n credential names consistently across workflow imports.
- Rotate keys after test/prototype exposure before production.

## Rotation Checklist

1. Rotate secret at provider.
2. Update n8n credential.
3. Update Supabase/runtime secret reference if the reference name changed.
4. Run `/webhook/integrations/test-all`.
5. Run ingestion smoke test.
6. Run generation smoke test.
7. Confirm `qa_job_metrics` records success/failure correctly.
8. Record rotation timestamp and owner outside this repository.

## Related Documentation

- `docs/UI_documentation`
- `docs/n8n_documentation_2026-05-08`
- `docs/Supabase_documentation`

