# Application Overview

## Runtime Stack

| Layer | Implementation |
| --- | --- |
| Build tool | Vite |
| UI runtime | React 18 |
| Language | TypeScript |
| Routing | `react-router-dom` |
| Styling | Tailwind CSS plus CSS custom properties |
| Icons | `lucide-react` |
| Backend | n8n webhooks |
| Auth provider | Supabase Auth REST endpoints |
| Persistence | Browser `localStorage`, hydrated by backend repository APIs when available |

## App Bootstrap

`src/main.tsx` renders:

- `React.StrictMode`
- `ThemeProvider`
- `BrowserRouter`
- `App`

The app requires an element with `id="root"` from `index.html`.

## Route Map

| Route | Component | Access | Behavior |
| --- | --- | --- | --- |
| `/` | `LoginPage` or redirect | Public | Shows landing/login page when unauthenticated. Redirects to `/dashboard` when authenticated. If Supabase invite/recovery hash is present, redirects to `/auth/callback`. |
| `/dashboard` | `DashboardPage` | Authenticated only | Main product shell. Redirects to `/` when no valid active Q-Ops user exists. |
| `/auth/callback` | `AuthCallbackPage` | Supabase callback | Consumes invite/recovery hash, stores session, optionally accepts invite, lets user set password, then redirects to dashboard. |
| `/explore` | `ExploreMorePage` | Public | Product exploration/marketing page. |
| `*` | redirect | Mixed | Redirects to `/dashboard` if authenticated, otherwise `/`. |

## Main Application Responsibilities

`src/App.tsx` owns:

- Session restore through `getUsableSession()`.
- Q-Ops profile validation through `/webhook/me`.
- `isAuthenticated` state.
- `currentUser` state.
- Login success orchestration.
- Logout.
- Toast state and toast expiry.
- Route guarding.

## Dashboard Views

`DashboardPage` uses the `View` union:

| View | Purpose |
| --- | --- |
| `overview` | Workspace summary, active jobs, quick access cards. |
| `knowledge` | Upload source artifacts and start ingestion. |
| `documents` | Generate QA outputs from an existing knowledge base. |
| `artifacts` | Review uploaded/processed artifacts and reprocess failed artifacts. |
| `analytics` | View job, token, cost, failure, and ingestion analytics. |
| `settings` | Persona-aware settings, admin operations, integration config, system status. |
| `docs` | In-app lightweight documentation/help page. |

## Overlay Model

The dashboard uses an `Overlay` union:

| Overlay | Purpose |
| --- | --- |
| `search` | Command/search palette, opened with `Ctrl+K` or `Cmd+K`. |
| `notifications` | Notification drawer. |
| `help` | Help drawer. |
| `audit` | Audit log modal. |
| `project` | New project wizard. Admin only from primary UI. |
| `status` | System status modal. |
| `diagnostics` | Infrastructure load diagnostics modal. |

## Backend Architecture From UI Perspective

The UI treats n8n as the backend facade. Supabase Auth is called directly only for authentication/session operations. Application data is retrieved or mutated through n8n webhooks, which in turn read/write Supabase and call downstream services.

Primary backend groups:

- Auth-aware user APIs: `/webhook/me`, `/webhook/users`, `/webhook/users/invite`, `/webhook/users/update`, `/webhook/users/project-assignments`.
- Queue and worker APIs: `/webhook/upload-test-artifacts`, `/webhook/generate-qa-doc`, `/webhook/job-status`, `/webhook/job-status-retrieve`.
- Repository APIs: `/webhook/projects`, `/webhook/artifacts`, `/webhook/generated-documents`, `/webhook/audit-events`.
- Operations APIs: `/webhook/analytics-summary`, `/webhook/infrastructure-load`, `/webhook/health`.
- Settings/integration APIs: `/webhook/settings`, `/webhook/integrations/test`, `/webhook/integrations/test-all`.

