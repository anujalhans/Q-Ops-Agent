# UI Agent Brief: Persona-Based Settings Redesign

Date: 2026-05-05

Source plan: `docs/persona-settings-integration-plan.md`

## Objective

Redesign the Q-Ops Agent Settings experience for two personas:

- **Admin**: full control of users, roles, integrations, environment, system health, and operational settings.
- **Registered User**: limited personal settings, assigned project visibility, notification preferences, and read-only system status.

Design only. Do not implement application code.

## Product Context

Q-Ops Agent converts BRD, FRD, HLD, LLD, transcripts, and UI designs into QA knowledge bases and generated QA deliverables. The backend runs through n8n workflows, Supabase, Chroma, OpenAI, Jira, Confluence, and local backend microservices.

The Settings redesign must help Admins remove hardcoded n8n workflow values such as:

- Jira project key/id and issue type ids.
- Confluence space key and base URL.
- Chroma collection name and retrieval settings.
- Supabase project/storage settings.
- n8n base URL and webhook paths.
- Backend microservice URLs.

## Existing UI Context

Current dashboard sections include:

- Dashboard.
- Artifacts.
- Doc Gen.
- Knowledge Base.
- Analytics.
- Settings.
- Documentation.

Current Settings has four simple panels:

- Profile.
- API And Backend.
- Integrations.
- Notifications And Security.

Current `Test Connection` calls backend health. The updated health workflow now returns live checks for Supabase DB, Supabase Storage, ChromaDB, FastAPI extractor, and the markdown-to-DOCX converter service. Jira, Confluence, and OpenAI are still backend-managed in that response, so the new design still needs per-integration connection testing and clearer status cards.

## Required Settings Navigation

Design a Settings page with a clear internal navigation model. Recommended Admin tabs:

- Profile.
- Users And Roles.
- Environment.
- Integrations.
- Defaults And Routing.
- Notifications.
- Security.
- System Status.
- Audit.

Recommended Registered User tabs:

- Profile.
- Preferences.
- Notifications.
- My Projects.
- System Status.

Use the same dashboard shell, sidebar, header, theme system, and enterprise operational feel already present in the app.

## Admin Settings Requirements

### 1. Admin Profile

Show:

- Avatar.
- Name.
- Email.
- Job title.
- Role badge: `Admin`.
- Last login.

Actions:

- Edit profile.
- Change password only if auth design supports it later.

### 2. Users And Roles

Purpose: Admin manages registered users.

Design:

- User table with name, email, role, assigned projects, status, last active.
- Invite user button.
- Edit role/project assignment drawer.
- Deactivate/reactivate action.

Roles:

- Admin.
- Registered User.

States:

- Empty user list.
- Pending invite.
- Active user.
- Deactivated user.
- Validation error.

### 3. Environment

Purpose: Configure backend and n8n endpoints.

Fields:

- Environment name.
- n8n base URL.
- Backend API base URL, if separate.
- Webhook paths for upload, generation, ingestion status, generation status, health, analytics, projects, artifacts, generated documents, audit events.

Design notes:

- Webhook paths should be editable only by Admin.
- Show a clear warning when changing an endpoint can affect active jobs.
- Include `Test n8n` action.

### 4. Integrations

Create one card or detail row for each integration:

- Jira.
- Confluence.
- Supabase.
- Chroma.
- n8n.
- Backend microservices.
- OpenAI/model profile.

Each integration card should show:

- Status badge: Operational, Degraded, Not configured, Unreachable, Unauthorized, Error.
- Last tested timestamp.
- Latency.
- Primary editable fields.
- Masked credential state, for example `Token saved` or `No credential`.
- Buttons: Edit, Save, Test Connection, View Details.

Do not show raw secret values.

The first design can source aggregate statuses from `/webhook/health`:

- n8n backend.
- Supabase DB.
- Supabase Storage.
- ChromaDB.
- FastAPI Extractor.
- Converter Service.
- Webhook registry.

Design Jira, Confluence, and OpenAI as backend-managed initially, with future-ready dedicated test states.

### 5. Jira Integration Detail

Fields:

- Jira base URL.
- Project key.
- Project id.
- Epic issue type id/name.
- Story issue type id/name.
- Idempotency label prefix.
- Credential status.

Test Connection should verify:

- Base URL reachable.
- Credentials valid.
- Project resolves.
- Epic/story issue types resolve.

Success state:

- `Jira operational. Project KAN and required issue types are available.`

Failure states:

- Unauthorized.
- Project not found.
- Issue type missing.
- Network unreachable.

### 6. Confluence Integration Detail

Fields:

- Confluence base URL.
- Space key.
- Optional parent page id.
- Page title pattern.
- Credential status.

Test Connection should verify:

- Base URL reachable.
- Credentials valid.
- Space key resolves.
- Parent page resolves if configured.

### 7. Supabase Integration Detail

Fields:

- Supabase project URL.
- Storage bucket.
- Table names or required table checklist.
- Credential reference state.

Test Connection should verify:

- Project reachable.
- Required tables available.
- Storage bucket available.
- RPCs available if analytics is enabled.

### 8. Chroma Integration Detail

Fields:

- Chroma base URL, if external.
- Tenant.
- Database.
- Collection name.
- Retrieval topK.

Test Connection should verify:

- Chroma reachable.
- Tenant/database valid.
- Collection exists.

### 9. Backend Microservices Detail

Fields:

- Document processor URL.
- Document processor health path.
- Converter URL.
- Converter health path.
- Timeout.

Test Connection should verify:

- Processor health.
- Converter health.
- Response latency.

The current health workflow already checks `FastAPI Extractor` and `Converter Service`, so show these as concrete service rows rather than generic backend services.

### 10. OpenAI / Model Profile

Fields:

- Generation model.
- Vision model.
- Embedding model.
- Max tokens.
- Credential status.

Design note:

- It is acceptable to show this as backend-managed in the first design, but include a future-ready details view.

### 11. Defaults And Routing

Purpose: Admin controls how generation jobs publish outputs.

Design:

- Default Jira project.
- Default Confluence space.
- Default Chroma collection.
- Destination by document type:
  - Test Strategy -> Confluence.
  - Test Plan -> Confluence.
  - Test Cases -> Confluence.
  - Risk Matrix -> Confluence.
  - Traceability Matrix -> Confluence.
  - Epics & User Stories -> Jira.
- Optional per-project override table.

Include clear copy that Registered Users can use only approved destinations.

### 12. Security

Show:

- Session timeout.
- Secret masking policy.
- Data retention summary.
- Audit logging enabled.

Actions:

- Save security defaults.
- View audit log.

### 13. System Status

Design a status dashboard inside Settings:

- Overall platform status.
- Per-integration status grid sourced initially from `/webhook/health`.
- Last test run.
- Test all button.
- Connection test history.
- Expandable technical details for Admin.

Status labels:

- Operational.
- Degraded.
- Not configured.
- Unreachable.
- Unauthorized.
- Error.

## Registered User Settings Requirements

Registered Users should not see Admin-only configuration.

### 1. User Profile

Show:

- Avatar.
- Name.
- Email.
- Job title.
- Role badge: `Registered User`.
- Assigned projects count.

Actions:

- Edit profile.

### 2. Preferences

Fields:

- Theme preference.
- Default dashboard view.
- Date/time display.

### 3. Notifications

Fields:

- In-app notifications.
- Email notifications.
- Job completed alerts.
- Job failed alerts.
- Assigned project updates.

### 4. My Projects

Show:

- Assigned projects.
- Role within project if available.
- Project status.
- Last activity.

Actions:

- Open project.
- Open generated documents.

No project-level integration editing.

### 5. Read-Only System Status

Show:

- Overall status.
- Integration status summary.
- Last updated.

Do not show:

- Base URLs if considered sensitive.
- Secrets.
- Raw errors.
- Edit or save buttons.

## Role-Based UI Behavior

Design these role differences explicitly:

| Capability | Admin | Registered User |
|---|---|---|
| Edit environment settings | Yes | No |
| Edit integrations | Yes | No |
| Test all connections | Yes | No |
| View read-only status | Yes | Yes |
| Invite users | Yes | No |
| Assign projects | Yes | No |
| Edit personal profile | Yes | Yes |
| Edit notification preferences | Yes | Yes |
| See masked credential state | Yes | No |
| See technical error details | Yes | No |

Use disabled states sparingly. Prefer hiding Admin-only sections from Registered Users unless a read-only summary helps explain platform availability.

## Test Connection UX

Each integration should have its own `Test Connection` action.

Also design a `Test All` action for Admin.

Connection test states:

- Idle: no test run yet.
- Testing: spinner/progress indicator.
- Success: operational with latency.
- Warning: configured but degraded.
- Not configured: missing required fields.
- Unauthorized: credential invalid.
- Error: endpoint failed.

Each result should include:

- Status badge.
- Message.
- Latency.
- Last checked.
- Checked by.
- Details disclosure.

Use concise, actionable failure copy:

- `Jira credentials were rejected. Rotate the token and test again.`
- `Confluence space TD was not found. Check the space key.`
- `Chroma collection qa-chunks-batches is unavailable.`
- `Document processor did not respond within the configured timeout.`

## Layout Guidance

The Settings page is operational software, not a marketing page.

Use:

- Dense but readable panels.
- Tables for users, project overrides, and connection history.
- Cards for integration status.
- Drawers for editing one integration.
- Status badges and concise helper text.
- Clear separation between global defaults and per-project overrides.

Avoid:

- Oversized hero sections.
- Decorative nested cards.
- Showing secrets.
- Hiding critical failures in small helper text.

## Mobile Requirements

Design mobile states:

- Settings sub-navigation collapses to a segmented control or dropdown.
- Integration cards stack vertically.
- User table becomes cards or horizontally scrollable table.
- Edit integration drawer becomes full-screen modal.
- Test result details remain readable without overlap.

## Required Deliverables

Produce UI designs for:

- Admin Settings overview.
- Admin Users And Roles.
- Admin Environment.
- Admin Integrations list.
- Integration detail/edit drawer for Jira.
- Integration detail/edit drawer for Confluence.
- Integration detail/edit drawer for Supabase.
- Integration detail/edit drawer for Chroma.
- Integration detail/edit drawer for n8n and microservices.
- Admin Defaults And Routing.
- Admin System Status with Test All.
- Registered User Settings overview.
- Registered User Profile and Preferences.
- Registered User My Projects.
- Registered User read-only System Status.

For each, include:

- Default state.
- Empty or not configured state.
- Loading/testing state.
- Success state.
- Error state.
- Light theme.
- Dark theme.
- Mobile treatment.

## Acceptance Checklist

- Admin and Registered User Settings are visibly different.
- Registered User cannot access integration editing.
- Every integration has a visible status and per-system Test Connection action.
- Test results show status, latency, last checked, and actionable copy.
- No secret values are shown in the UI.
- Admin can understand which n8n hardcoded values have become configurable.
- Project-level overrides are represented without overwhelming the default flow.
- The design fits the existing Q-Ops Agent dashboard shell and theme.
