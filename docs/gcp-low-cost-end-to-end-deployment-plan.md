# Q-Ops Agent Low-Cost GCP Deployment Plan

Created: 2026-08-05

## Goal

Deploy the complete Q-Ops Agent system on Google Cloud Platform while keeping the existing managed cloud databases outside GCP:

- Supabase Cloud remains the system of record for Auth, app tables, audit data, metrics, jobs, settings, and storage.
- Chroma Cloud remains the vector database for embeddings and retrieval.
- GCP hosts only the application runtime: frontend, n8n, extractor service, document parser/converter service, and optional reverse proxy/security components.

The deployment must work end to end the way the local system works today, but with production URLs, secrets, HTTPS, persistence, backups, and minimal server cost.

## Source Context From This Repository

Current implementation references:

- Frontend: React/Vite app in `src`, built with `npm run build`.
- Frontend API base URL: `src/lib/api.ts`
  - `API_BASE_URL_KEY = qops-agent-api-base-url`
  - `DEFAULT_API_BASE_URL = http://localhost:5678`
- Supabase Auth config: `src/lib/auth.ts`
  - Current Supabase URL and publishable key are hardcoded.
  - Production recommendation already documented in `docs/Environment_Secrets_documentation/README.md`: move to `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- n8n workflows: `docs/n8n_workflows_2026-05-08/Published`
- n8n workflow docs: `docs/n8n_documentation_2026-05-08`
- API contract docs: `docs/API_Contract_documentation/README.md`
- Production cutover guide: `docs/Deployment_Production_Cutover_Guide/README.md`
- Operational runbook: `docs/Operational_Runbook/README.md`
- Extractor v2 service: `extract_images_v2`
  - Main endpoint: `POST /process-document-v2`
  - Current local expectation in docs: `http://127.0.0.1:8001/process-document-v2`
- Markdown/DOCX/Confluence converter: `services/md_docx_converter`
  - Health: `GET /health`
  - Readiness: `GET /ready`
  - Convert: `POST /convert`
  - Current local port: `5050`

## Recommended Low-Cost Target Architecture

Use this architecture for the first GCP deployment:

```text
User Browser
  |
  v
Cloud Run or Firebase Hosting
Q-Ops React Frontend
  |
  | HTTPS requests to production API base URL
  v
Compute Engine VM
self-hosted n8n on Docker Compose
  |
  | calls HTTPS/internal service URLs
  v
Cloud Run Services
Extractor v2 / Parser / Converter
  |
  | public TLS APIs using provider credentials
  v
Supabase Cloud
Chroma Cloud
OpenAI / Jira / Confluence
```

## Why This Architecture

This is the best cost-conscious fit for the current system:

- n8n stays self-hosted, so there is no n8n Cloud subscription.
- n8n runs on one small VM, which is closest to the current local setup.
- Stateless processors run on Cloud Run and can scale to zero when idle.
- Supabase and Chroma stay managed outside GCP, so there is no database migration or duplicate cloud database cost.
- Cloud Run reduces idle cost for extractor/parser/converter services.
- The GCP free trial credit can be preserved longer by avoiding always-on databases such as Cloud SQL unless needed later.

## Cost Strategy

Google Cloud is pay-as-you-go. A billing account/payment method is required, but there is no fixed "subscription plan" for this setup.

Official cost references:

- Google Cloud Free Program: https://docs.cloud.google.com/free/docs/free-cloud-features
- Google Cloud Free Trial FAQ: https://cloud.google.com/signup-faqs
- Cloud Run pricing: https://cloud.google.com/run/pricing
- Cloud Run overview and scale-to-zero behavior: https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run

Cost-saving choices for this project:

| Area | Low-cost choice | Notes |
| --- | --- | --- |
| n8n | Small Compute Engine VM | One always-on cost. Avoid n8n Cloud subscription. |
| n8n database | Start with persistent VM disk or local Postgres on same VM | Avoid Cloud SQL at first. Move to Cloud SQL later only if production reliability requires it. |
| Extractor service | Cloud Run, min instances 0 | Cold starts are acceptable initially. |
| Converter service | Cloud Run, min instances 0 | Use small CPU/memory unless DOCX conversion needs more. |
| Frontend | Firebase Hosting or Cloud Run | Firebase/static hosting is usually cheapest; Cloud Run is simpler if runtime config is needed. |
| Supabase | Keep existing cloud project | No GCP database cost. |
| Chroma | Keep existing cloud vector DB | No GCP vector DB cost. |
| Secrets | Secret Manager or n8n credentials | Small cost, worth using for security. |
| Region | Choose one region for GCP services | Avoid unnecessary cross-region traffic. |
| Budget | Add budget alerts on day 1 | Critical while using the $300 trial credit. |

Expected cost posture:

- Frontend: very low.
- Cloud Run processors: very low at low traffic when min instances are 0.
- n8n VM: main recurring GCP cost.
- External costs remain outside GCP: Supabase plan, Chroma plan, OpenAI/API usage, Jira/Confluence usage.

## Recommended GCP Services

| Component | GCP Service | Required? | Reason |
| --- | --- | --- | --- |
| Frontend | Firebase Hosting or Cloud Run | Yes | Host React/Vite production build. |
| n8n | Compute Engine VM | Yes | Self-hosted n8n with persistent data. |
| Extractor v2 | Cloud Run | Yes | Stateless HTTP service for document extraction. |
| Converter | Cloud Run | Yes if DOCX/conversion is used | Stateless HTTP service for markdown/DOCX/Confluence conversion. |
| Container registry | Artifact Registry | Yes | Store service images. |
| Secrets | Secret Manager | Strongly recommended | Store runtime secrets safely. |
| Logs/metrics | Cloud Logging/Monitoring | Yes | Operational visibility. |
| Domain/SSL | Cloud DNS + HTTPS proxy or VM reverse proxy | Recommended | Stable production URLs. |
| Cloud SQL | Not initially | Optional later for n8n database hardening. |
| Load Balancer | Not initially | Optional later for enterprise edge/routing. |
| VPC connector/NAT | Not initially | Only needed if private networking/static egress is required. |

## Production URL Plan

Use clear public URLs:

```text
Frontend:
https://qops.example.com

n8n:
https://n8n.qops.example.com

Extractor:
https://qops-extractor-<hash>-<region>.a.run.app

Converter:
https://qops-converter-<hash>-<region>.a.run.app
```

Optional later:

```text
https://api.qops.example.com
https://extractor.qops.example.com
https://converter.qops.example.com
```

## Deployment Phases

## Phase 0 - Decisions And Inventory

1. Decide GCP project name.

   Example:

   ```text
   qops-agent-prod
   ```

2. Decide GCP region.

   Recommended options:

   ```text
   asia-south1  # Mumbai, better for India users
   asia-south2  # Delhi
   us-central1  # often cheapest/reference region, higher latency from India
   ```

   Recommendation: use `asia-south1` if real users are primarily in India. Use `us-central1` only if lowest possible trial cost is more important than latency.

3. Decide production domains.

   Minimum required:

   ```text
   qops.example.com
   n8n.qops.example.com
   ```

4. Confirm external managed services:

   ```text
   Supabase URL
   Supabase publishable key
   Supabase service role key
   Supabase Auth redirect URL ownership
   Supabase Storage bucket: uploaded-project-docs
   Chroma Cloud URL
   Chroma tenant/database/collection details if applicable
   Chroma API key
   OpenAI API key
   Jira base URL/email/token/project key
   Confluence base URL/email/token/space key
   ```

5. Export current local n8n workflows before any migration.

   Store backup outside the VM as well as in this repo's backup/documentation folder.

6. Export or document current n8n credentials names.

   Do not export secret values into Git.

## Phase 1 - Create GCP Foundation

1. Create or select GCP project.

2. Link billing account.

3. Create a budget alert immediately.

   Suggested budget:

   ```text
   Budget amount: 25 USD for first smoke-test phase
   Alerts: 25%, 50%, 75%, 90%, 100%
   ```

   After production usage starts:

   ```text
   Budget amount: 50-100 USD/month depending on expected workload
   ```

4. Enable required APIs:

   ```text
   Compute Engine API
   Cloud Run Admin API
   Artifact Registry API
   Secret Manager API
   Cloud Build API
   Cloud Logging API
   Cloud Monitoring API
   Firebase Hosting API, only if frontend uses Firebase Hosting
   ```

5. Create service accounts:

   ```text
   qops-cloud-run-runtime
   qops-cloud-run-deployer
   qops-n8n-vm
   ```

6. Grant minimal roles:

   ```text
   qops-cloud-run-runtime:
   - Secret Manager Secret Accessor, only for required secrets
   - Logs Writer

   qops-cloud-run-deployer:
   - Cloud Run Admin
   - Artifact Registry Writer
   - Service Account User

   qops-n8n-vm:
   - Secret Manager Secret Accessor, only if VM reads secrets from GCP
   - Logs Writer
   ```

## Phase 2 - Prepare Secrets

Store backend-only secrets in Secret Manager or in n8n credentials.

Do not expose these in frontend:

```text
SUPABASE_SERVICE_ROLE_KEY
CHROMA_API_KEY
OPENAI_API_KEY
JIRA_API_TOKEN
CONFLUENCE_API_TOKEN
N8N_ENCRYPTION_KEY
N8N_BASIC_AUTH_PASSWORD
```

Frontend-safe values:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_QOPS_DEFAULT_API_BASE_URL
VITE_QOPS_ENVIRONMENT_KEY
```

Recommended Secret Manager secret names:

```text
qops-supabase-service-role-key
qops-chroma-api-key
qops-openai-api-key
qops-jira-api-token
qops-confluence-api-token
qops-n8n-encryption-key
qops-n8n-basic-auth-password
qops-n8n-postgres-password
```

Security rule:

The Supabase service role key must only exist in n8n/backend runtime. It must never be present in React/Vite code, browser localStorage, static JS bundles, or public settings tables.

## Phase 3 - Prepare The Frontend For Production

Current local behavior:

```text
DEFAULT_API_BASE_URL = http://localhost:5678
SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are hardcoded in src/lib/auth.ts
```

Required production configuration change before deployment:

```text
VITE_SUPABASE_URL=https://ifnznfspkjayhnooncrv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VITE_QOPS_DEFAULT_API_BASE_URL=https://n8n.qops.example.com
VITE_QOPS_ENVIRONMENT_KEY=production
```

Expected code/config adjustment:

- Read Supabase URL and publishable key from Vite env variables.
- Read default API base URL from Vite env variable.
- Keep the browser localStorage override for debugging if desired.
- Ensure the production app defaults to the GCP n8n URL, not `http://localhost:5678`.

Build command:

```bash
npm install
npm run build
```

Deployment choices:

### Option A - Firebase Hosting

Use if the frontend is static and does not require runtime server behavior.

Pros:

- Very low cost.
- CDN-backed.
- Simple for static `dist`.

Cons:

- Build-time environment variables are baked into JS.
- Runtime config changes require rebuild unless a config JSON pattern is added.

### Option B - Cloud Run Static Container

Use if you want consistent GCP deployment for all components.

Pros:

- One deployment model for FE and services.
- Easy containerized promotion across environments.

Cons:

- Slightly more setup than Firebase Hosting.
- Still build-time env unless runtime config endpoint is added.

Recommendation:

Use Firebase Hosting for lowest cost if static hosting is enough. Use Cloud Run if you prefer one consistent deployment pattern.

## Phase 4 - Deploy Extractor v2 To Cloud Run

Service source:

```text
extract_images_v2
```

Required endpoint:

```text
POST /process-document-v2
```

Runtime requirements:

- Python dependencies from the service.
- Enough memory for PDF/DOCX/PPTX processing.
- LibreOffice if DOCX/PPTX page rendering is required.
- Request size must support expected uploads.
- Timeout must support document extraction duration.

Low-cost settings:

```text
min instances: 0
max instances: 1 or 2 initially
CPU: start small, increase only if extraction fails or times out
Memory: start conservative, increase for large documents
Concurrency: low, because document parsing can be CPU/memory heavy
Authentication: prefer service-to-service auth if only n8n calls it
```

Deployment steps:

1. Add a Dockerfile for `extract_images_v2`.
2. Build image.
3. Push to Artifact Registry.
4. Deploy to Cloud Run.
5. Test health/readiness if exposed.
6. Test `POST /process-document-v2` with a small PDF/DOCX.
7. Update n8n workflow/runtime settings from local URL:

   ```text
   http://127.0.0.1:8001/process-document-v2
   ```

   to production URL:

   ```text
   https://qops-extractor-<hash>-<region>.a.run.app/process-document-v2
   ```

## Phase 5 - Deploy Converter Service To Cloud Run

Service source:

```text
services/md_docx_converter
```

Required endpoints:

```text
GET /health
GET /ready
POST /convert
```

Current local port:

```text
5050
```

Low-cost settings:

```text
min instances: 0
max instances: 1 or 2 initially
CPU: start small
Memory: increase only if conversion fails on large documents
Concurrency: moderate if conversions are light; low if large DOCX generation is heavy
```

Deployment steps:

1. Add a Dockerfile for `services/md_docx_converter`.
2. Include the required logo asset:

   ```text
   services/md_docx_converter/assets/royal_enfield_logo.png
   ```

3. Build image.
4. Push to Artifact Registry.
5. Deploy to Cloud Run.
6. Verify:

   ```text
   GET /health
   GET /ready
   POST /convert
   ```

7. Update n8n workflow/runtime settings from:

   ```text
   http://127.0.0.1:5050/convert
   ```

   to:

   ```text
   https://qops-converter-<hash>-<region>.a.run.app/convert
   ```

## Phase 6 - Deploy Self-Hosted n8n On Compute Engine

Use a VM first because this is closest to the current local setup and avoids a paid n8n Cloud subscription.

Official n8n Docker/self-hosting reference:

- https://docs.n8n.io/hosting/installation/docker/
- https://github.com/n8n-io/n8n-hosting/tree/main/docker-compose/withPostgres

### VM Sizing

Start small:

```text
Machine type: e2-small or e2-medium
Disk: 20-50 GB persistent disk
OS: Ubuntu LTS
Region: same region as Cloud Run services where practical
```

Cost-sensitive path:

- Use the smallest VM that reliably runs n8n and workflows.
- Avoid Cloud SQL initially.
- Stop the VM when not actively testing, if acceptable.
- Use one VM for n8n + local Postgres to avoid managed database cost.

Production-stability path:

- Use Cloud SQL Postgres for n8n database.
- Keep n8n on VM or Cloud Run.
- This costs more but improves backup/recovery and durability.

Recommendation for first deployment:

Run n8n and its Postgres database through Docker Compose on the same VM with persistent disk backups.

### Required n8n Environment Variables

Set these for production:

```text
N8N_HOST=n8n.qops.example.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.qops.example.com/
N8N_ENCRYPTION_KEY=<stable-secret>
N8N_USER_MANAGEMENT_DISABLED=false
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=<admin-user>
N8N_BASIC_AUTH_PASSWORD=<strong-password>
GENERIC_TIMEZONE=Asia/Kolkata
TZ=Asia/Kolkata
```

If using Postgres for n8n:

```text
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=<strong-password>
```

Do not change `N8N_ENCRYPTION_KEY` after credentials are created. If it changes, existing credentials may become unusable.

### Reverse Proxy And HTTPS

Use one of these:

Option A, lowest cost:

```text
Nginx on the same VM
Let's Encrypt certificate
DNS A record pointing n8n.qops.example.com to VM static IP
```

Option B, more managed but more cost:

```text
Google Cloud Load Balancer
Managed SSL certificate
Backend points to n8n VM
```

Recommendation:

Start with Nginx + Let's Encrypt on the VM.

### VM Firewall

Expose only:

```text
80/tcp
443/tcp
22/tcp restricted to your IP
```

Do not expose raw n8n port `5678` publicly.

n8n should be reachable publicly only through:

```text
https://n8n.qops.example.com
```

### n8n Persistence

Persist:

```text
/home/node/.n8n
Postgres data volume
Docker Compose file
.env file, outside Git
```

Back up:

```text
n8n workflows
n8n credentials through encrypted persistence
Postgres volume or database dump
N8N_ENCRYPTION_KEY stored securely outside the VM
```

## Phase 7 - Import And Configure n8n Workflows

Import the intended production workflows from:

```text
docs/n8n_workflows_2026-05-08/Published
```

Core workflows:

```text
INGEST API Queue Creator - SaaS - Attributed Draft
INGEST Worker Engine (Queue Processor) - Attributed Draft
INGEST Workflow-Status-Check
Multimodal Knowledge Ingestion & Vectorization Engine - Full Clone Draft
RETRIEVAL Job Queue Creator - SaaS - Attributed Draft
RETRIEVAL Worker Engine (Queue Processor) - Saas - Attributed Draft
RETRIEVAL Document Generator AI Agent - SaaS - Full Clone Draft
RETRIEVE Workflow-status-check
Q-Ops-Agent-Analytics-Summary
Q-Ops-Agent-Health-Status
Q-Ops Agent Auth Me API
Q-Ops Agent Projects API - Wired
Q-Ops Agent Artifacts API
Q-Ops Agent Artifact Reprocess API
Q-Ops Agent Generated Documents API
Q-Ops Agent Audit Events API
Q-Ops Agent Infrastructure Load API
Q-Ops Agent Settings API
Q-Ops Agent Settings Write API
Q-Ops Agent Integration Test API
Q-Ops Agent Integrations Test All API
Q-Ops Agent Users API
Q-Ops Agent User Invite API
Q-Ops Agent User Update API
Q-Ops Agent User Project Assignments API
Q-Ops Agent User Accept Invite API
Q-Ops Agent User Password Reset Audit API
```

If Delivery Intelligence remains disabled/coming soon in the UI, do not activate DI workflows unless needed.

After import:

1. Recreate credentials manually in n8n.
2. Match credential names used by workflow nodes.
3. Update every local service URL:

   ```text
   http://127.0.0.1:8001/process-document-v2
   http://127.0.0.1:5050/convert
   http://localhost:5678
   ```

   to production URLs.

4. Confirm webhook URLs show the production host.
5. Activate queue creator, worker, status, settings, analytics, user/admin, and health workflows.
6. Keep draft/unpublished workflows inactive.
7. Export a production backup after activation.

## Phase 8 - Configure Supabase For Production Frontend And n8n

Supabase remains outside GCP.

Required checks:

1. Auth redirect URLs must include:

   ```text
   https://qops.example.com/auth/callback
   ```

2. Site URL should point to:

   ```text
   https://qops.example.com
   ```

3. Confirm `qops_users` has the production admin user mapped to Supabase Auth user id.

4. Confirm project scoping tables are correct:

   ```text
   qops_users
   qops_projects
   qops_project_members
   qops_audit_events
   ```

5. Confirm job/metrics tables are present:

   ```text
   doc_ingestion_jobs
   doc_ingestion_queuecreator_logs
   qa_jobs
   qa_job_metrics
   ```

6. Confirm settings tables contain production environment values:

   ```text
   qops_environment_settings
   qops_integration_settings
   qops_project_integration_overrides
   qops_connection_test_results
   ```

7. Confirm storage bucket:

   ```text
   uploaded-project-docs
   ```

8. Review RLS policies before production users log in.

9. Ensure service-role key is only in n8n/backend credentials, not frontend.

## Phase 9 - Configure Chroma Cloud Connectivity

Chroma remains outside GCP.

Required values:

```text
CHROMA_BASE_URL
CHROMA_API_KEY
CHROMA_TENANT, if applicable
CHROMA_DATABASE, if applicable
CHROMA_COLLECTION=qa-chunks-batches
```

Configuration steps:

1. Store the API key in n8n credentials or Secret Manager.
2. Update n8n vectorization workflow to use the Chroma Cloud endpoint.
3. Update retrieval workflow to use the same Chroma collection.
4. Run a connectivity test from n8n.
5. Run one small ingestion job and confirm chunks arrive in Chroma.
6. Run one small generation job and confirm retrieval uses the newly ingested chunks.

Do not call Chroma directly from the frontend unless there is a very specific reason. Chroma API keys and retrieval behavior should stay backend-side through n8n.

## Phase 10 - Configure n8n Credentials

Recreate the following n8n credentials:

```text
Supabase service role / REST credential
Supabase Auth/JWT verification credential or env config
OpenAI credential
Jira credential
Confluence credential
Chroma credential
Extractor service auth, if service auth is enabled
Converter service auth, if service auth is enabled
```

Credential safety rules:

- Use n8n credentials for provider tokens.
- Use Secret Manager only if the VM/services load secrets from GCP.
- Do not commit `.env` files.
- Do not place tokens in Supabase public tables.
- Do not place backend tokens in frontend Vite variables.

## Phase 11 - Configure Runtime Settings In Q-Ops

Update production runtime/environment settings so UI and n8n agree on URLs.

Target environment row:

```json
{
  "environmentKey": "production",
  "displayName": "Production",
  "apiBaseUrl": "https://n8n.qops.example.com",
  "n8nBaseUrl": "https://n8n.qops.example.com",
  "isActive": true
}
```

Integration settings should point to:

```text
Extractor service URL:
https://qops-extractor-<hash>-<region>.a.run.app

Document processor v2 path:
/process-document-v2

Converter service URL:
https://qops-converter-<hash>-<region>.a.run.app

Converter path:
/convert

Chroma collection:
qa-chunks-batches

Supabase environment:
production Supabase project URL
```

If the UI still sends `environment: local` in some requests, keep the backend tolerant during first deployment, but plan to introduce `VITE_QOPS_ENVIRONMENT_KEY=production` and pass that value consistently.

## Phase 12 - CORS And Browser Access

Configure CORS so the frontend can call n8n:

Allowed origin:

```text
https://qops.example.com
```

Allowed methods:

```text
GET
POST
PATCH
OPTIONS
```

Allowed headers:

```text
Authorization
Content-Type
apikey
```

Do not allow broad origins such as `*` for authenticated production APIs.

Supabase browser access:

- Frontend may call Supabase Auth and public REST endpoints using the publishable key.
- RLS must enforce project/user scoping.
- Service role access must remain backend-only.

## Phase 13 - Frontend Deployment

1. Set production env values.

   ```text
   VITE_SUPABASE_URL=https://ifnznfspkjayhnooncrv.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   VITE_QOPS_DEFAULT_API_BASE_URL=https://n8n.qops.example.com
   VITE_QOPS_ENVIRONMENT_KEY=production
   ```

2. Build.

   ```bash
   npm install
   npm run build
   ```

3. Deploy `dist`.

4. Open production frontend.

5. Confirm localStorage does not still point to:

   ```text
   http://localhost:5678
   ```

6. If needed, clear browser localStorage key:

   ```text
   qops-agent-api-base-url
   ```

7. Login with production Supabase user.

8. Confirm `/webhook/me` returns the expected active profile.

## Phase 14 - End-To-End Smoke Test

Run these tests in order.

### 1. System Health

```text
GET https://n8n.qops.example.com/webhook/health
GET https://n8n.qops.example.com/webhook/infrastructure-load
GET https://qops-converter-<hash>-<region>.a.run.app/health
GET https://qops-converter-<hash>-<region>.a.run.app/ready
```

Expected:

- n8n reachable over HTTPS.
- Converter healthy.
- Extractor callable by n8n.
- Supabase and Chroma status configured.

### 2. Auth

1. Open `https://qops.example.com`.
2. Login as admin.
3. Confirm dashboard loads.
4. Confirm `/webhook/me` returns admin role.
5. Invite or validate a registered user.
6. Confirm registered user sees only assigned project data.

### 3. Knowledge Base Ingestion

1. Create/select a test project.
2. Upload a small BRD/FRD.
3. Confirm response:

   ```json
   {
     "jobId": "ING-...",
     "status": "queued"
   }
   ```

4. Confirm job appears in Supabase `doc_ingestion_jobs`.
5. Confirm worker picks up pending job.
6. Confirm extractor service is called.
7. Confirm Chroma receives chunks.
8. Confirm job reaches `completed`.
9. Confirm `qa_job_metrics` has queued/completed rows.

### 4. Document Generation

1. Generate Test Strategy.
2. Confirm response:

   ```json
   {
     "jobId": "PRO-... or GEN-...",
     "status": "queued"
   }
   ```

3. Confirm job appears in Supabase `qa_jobs`.
4. Confirm retrieval workflow queries Chroma.
5. Confirm OpenAI generation completes.
6. Confirm quality gate passes.
7. Confirm Confluence/DOCX output depending on document type.
8. Confirm `/webhook/generated-documents` shows the job.

### 5. Jira Branch

1. Generate Epics and User Stories.
2. Confirm Jira credential works.
3. Confirm epics/stories are created or reused idempotently.
4. Confirm output contains Jira keys/links.
5. Confirm no duplicate Jira issues on retry.

### 6. Analytics And Audit

1. Open Analytics.
2. Confirm jobs, cost, token usage, failures, and recent jobs render.
3. Open Audit Log.
4. Confirm admin sees workspace scope.
5. Confirm registered user sees only assigned project/self scope.
6. Confirm notifications are scoped to current user's assigned projects.

## Phase 15 - Backups

Minimum backup plan:

```text
n8n workflow export: after every production workflow change
n8n VM disk snapshot: daily or before risky changes
n8n Postgres dump: daily if using Postgres container
Supabase schema backup: before migrations
Supabase table/storage backup: according to Supabase plan
N8N_ENCRYPTION_KEY: store securely outside VM
```

Do not rely on the VM alone. If the VM is lost and the encryption key is missing, n8n credentials may not be recoverable.

## Phase 16 - Monitoring And Alerts

GCP alerts:

```text
VM CPU high
VM disk usage high
VM uptime check failed
Cloud Run service errors
Cloud Run latency high
Cloud Run memory limit errors
Budget threshold alerts
```

n8n checks:

```text
Failed workflow executions
Queue worker inactive
Long-running execution stuck
Webhook unavailable
Credential failure
```

Application checks:

```text
/webhook/health
/webhook/infrastructure-load
/webhook/analytics-summary
Extractor health
Converter health
Supabase Auth login
Chroma query/upsert
```

## Phase 17 - Low-Cost Operating Rules

Use these rules while the $300 credit is active:

1. Keep Cloud Run `min instances = 0`.
2. Keep Cloud Run `max instances` low initially.
3. Start n8n VM small.
4. Avoid Cloud SQL unless needed.
5. Avoid GKE for this stage.
6. Avoid a public Load Balancer unless needed.
7. Use Nginx + Let's Encrypt on the n8n VM for HTTPS.
8. Keep all services in one region where practical.
9. Set budget alerts before deploying.
10. Stop non-production test services when not used.
11. Review Cloud Billing weekly.
12. Watch OpenAI/token spend separately; GCP budget will not cover OpenAI billing.

## Phase 18 - Production Hardening Later

After the system is stable, consider these upgrades:

```text
Move n8n database to Cloud SQL Postgres
Use n8n queue mode with Redis/worker separation
Put all public endpoints behind API Gateway or Load Balancer
Use Cloud Armor for edge protection
Use private service-to-service auth for Cloud Run processors
Add CI/CD through GitHub Actions or Cloud Build
Add structured uptime checks
Add automated workflow export backups
Add staging and production environments
Externalize frontend runtime config fully
```

These should not be first-phase changes if the priority is preserving the $300 credit and getting the current local system working end to end.

## Final Recommended Deployment Order

1. Create GCP project, billing, budget alerts, and region.
2. Prepare domains: `qops.example.com` and `n8n.qops.example.com`.
3. Deploy n8n on a small Compute Engine VM using Docker Compose.
4. Configure n8n HTTPS, persistence, backups, and production `WEBHOOK_URL`.
5. Deploy extractor v2 to Cloud Run.
6. Deploy converter service to Cloud Run.
7. Recreate n8n credentials for Supabase, Chroma, OpenAI, Jira, and Confluence.
8. Import and activate production n8n workflows.
9. Update n8n workflows/settings from local URLs to GCP production URLs.
10. Configure Supabase Auth redirect URLs for the frontend domain.
11. Configure Supabase runtime settings for production n8n/API base URL.
12. Prepare frontend production env variables.
13. Build and deploy frontend.
14. Clear any browser localStorage API override pointing to localhost.
15. Run health checks.
16. Run auth smoke tests.
17. Run ingestion smoke test.
18. Run generation smoke test.
19. Run Jira/Confluence branch tests.
20. Validate analytics, audit logs, notifications, and project scoping.
21. Create final workflow and VM backups.

## Open Items Before Actual Deployment

These need confirmation before executing the deployment:

```text
Final production domain names
Preferred GCP region
Whether frontend should use Firebase Hosting or Cloud Run
Whether n8n should use SQLite/local Postgres on VM for first deployment
Expected max upload file size
Expected max document processing duration
Whether extractor/converter should be public HTTPS or protected for n8n-only calls
Whether Delivery Intelligence workflows remain inactive
Current Chroma Cloud connection format and collection name
Current n8n credential names
Current production Supabase RLS status
```

## Recommended First-Pass Choices

Use these unless a requirement says otherwise:

```text
Region: asia-south1
Frontend: Firebase Hosting
n8n: Compute Engine VM + Docker Compose + local Postgres
Extractor: Cloud Run, min instances 0
Converter: Cloud Run, min instances 0
Database/Auth/Storage: existing Supabase Cloud
Vector DB: existing Chroma Cloud
HTTPS for n8n: Nginx + Let's Encrypt on VM
Secrets: n8n credentials + Secret Manager for non-n8n service secrets
Budget alert: 25 USD during first deployment, then 50-100 USD monthly
```

