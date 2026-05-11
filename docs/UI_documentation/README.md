# Q-Ops Agent UI Documentation

Generated on 2026-05-08 from the current React/Vite implementation in `src/`.

This folder documents the frontend as it exists now: routing, Supabase authentication, role handling, n8n backend API calls, dashboard workflows, local browser state, settings, integrations, and implementation caveats. It is intended for future context setting, production hardening, onboarding, and environment recreation.

## Documentation Map

- `01-application-overview.md`: app purpose, runtime stack, route map, source map.
- `02-authentication-and-roles.md`: Supabase Auth, session lifecycle, invite/recovery callbacks, admin vs registered user behavior.
- `03-api-contracts.md`: all frontend-to-backend calls in `src/lib/api.ts`, payloads, responses, auth requirements, timeouts.
- `04-dashboard-workflows.md`: knowledge ingestion, document generation, analytics, artifacts, audit, notifications, polling.
- `05-state-storage-and-data-models.md`: localStorage keys, normalized UI models, fallback behavior.
- `06-settings-integrations-and-admin.md`: settings center, user management, Jira/Confluence/runtime settings, integration tests.
- `07-ui-structure-and-design-system.md`: pages, components, theme tokens, styling conventions.
- `08-production-readiness-notes.md`: risks, gaps, and hardening checklist before production.

## Current Implementation Summary

The UI is a single page React application built with Vite, TypeScript, Tailwind CSS, React Router, and Lucide icons. It authenticates directly against Supabase Auth using a publishable key, then calls n8n webhook APIs as the backend layer. The backend APIs are configured by `qops-agent-api-base-url`, defaulting to `http://localhost:5678`.

The primary authenticated screen is `DashboardPage`, which provides project creation, knowledge-base ingestion, QA document generation, artifact review, analytics, audit, notifications, settings, user administration, integration configuration, and system status.

The UI has browser-local fallback state for projects, artifacts, notifications, generated outputs, audit events, settings, and theme. Backend repository endpoints hydrate/replace this local state when available.

## Key Source Files

| Area | Source |
| --- | --- |
| App routing and session restore | `src/App.tsx` |
| Supabase Auth client helpers | `src/lib/auth.ts` |
| n8n/backend API client and types | `src/lib/api.ts` |
| Main authenticated product shell | `src/pages/DashboardPage.tsx` |
| Login/marketing page | `src/pages/LoginPage.tsx` |
| Invite/password reset callback | `src/pages/AuthCallbackPage.tsx` |
| Polling long-running jobs | `src/hooks/useJobPolling.ts` |
| Theme persistence/provider | `src/theme/ThemeProvider.tsx` |
| Theme tokens | `src/theme/tokens.css` |

## Important Current Caveats

- `README.md` at repo root is stale in places: it still mentions static `admin/admin` auth and an old upload endpoint. The current implementation uses Supabase Auth and the API contracts documented here.
- Supabase URL and publishable key are hardcoded in `src/lib/auth.ts`.
- Auth tokens are stored in `localStorage` under `qops-agent-supabase-session`.
- Several repository endpoints are treated as optional by the UI. If unavailable, local browser cache is used.
- Some API calls are unauthenticated in the frontend even though their backend workflows may be auth-aware later, especially artifact and generated-document list calls.

