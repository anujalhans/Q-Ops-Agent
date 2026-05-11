# Production Readiness Notes

## Configuration Hardening

- Move Supabase URL and publishable key from `src/lib/auth.ts` to environment variables.
- Define environment-specific n8n base URLs outside localStorage defaults.
- Decide whether UI should use local n8n directly or a production API gateway.
- Remove stale root `README.md` references to static auth and old endpoints.

## Auth And Security

- Consider replacing localStorage token storage with a safer auth architecture if the app becomes internet-facing.
- Treat frontend role checks as presentation only; enforce all authorization in n8n/Supabase.
- Ensure every auth-aware n8n endpoint validates the Supabase bearer token.
- Align unauthenticated frontend calls with production policy:
  - `/webhook/artifacts`
  - `/webhook/generated-documents`
  - `/webhook/health`
  - job status endpoints
- Implement real session timeout if the `sessionTimeout` setting remains visible.
- Confirm password reset and invite redirects are allow-listed in Supabase Auth settings.

## Data Consistency

- The UI mixes local optimistic state with backend source-of-truth state. Production should define when local cache is allowed.
- Add a clear "clear local cache" admin/support action.
- Avoid relying on project names for authorization/scoping; use stable project ids everywhere.
- Ensure backend repository APIs return consistent ids, timestamps, statuses, and project names.
- Ensure generated document output URLs are consistently returned as one field, ideally `url`.

## API Contract Hardening

- Standardize all API responses:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

or keep the current direct objects but document each endpoint exactly.

- Return structured errors from n8n so UI can display meaningful messages.
- Ensure all long-running queue endpoints return:

```json
{
  "jobId": "...",
  "status": "queued"
}
```

- Ensure status endpoints always return:

```json
{
  "status": "queued|pending|processing|completed|failed|not_found",
  "output": {},
  "error": null
}
```

## Role And Permission Gaps

Current frontend assignment roles `owner`, `editor`, and `viewer` are displayed but not deeply enforced in UI branching. Production should define:

- Can viewer upload artifacts?
- Can viewer generate documents?
- Can editor reprocess artifacts?
- Can owner manage project members?
- Can registered users see audit events for assigned projects?

Then enforce those rules in both UI and backend.

## Observability

The UI expects:

- `/webhook/analytics-summary`
- `/webhook/infrastructure-load`
- `/webhook/audit-events`
- `/webhook/health`

Production should ensure these endpoints are always auth-aware and return consistent metadata:

- `generatedAt`
- `scope`
- `environment`
- `projectId` where relevant
- token/cost fields
- failure messages

## UX Improvements

- Add loading skeletons for first dashboard hydration.
- Add explicit offline/backend unavailable banner.
- Make local-cache fallback visible and controllable.
- Add empty states that distinguish "no data" from "API unavailable".
- Add focus trap and focus restore for modals/drawers.
- Add mobile-responsive dashboard sidebar behavior; current dashboard is desktop-first.

## Testing Recommendations

Unit tests:

- `mapArtifactToDocumentType`
- `documentTypeLabel`
- status/failure message extraction
- auth callback hash parsing
- role/project scoping helpers

Integration tests:

- login success/failure
- session restore
- invite callback
- password reset callback
- knowledge upload happy path
- document generation happy path
- polling terminal statuses
- admin invite/update/project assignments

End-to-end tests:

- Admin creates project, uploads artifacts, generates document.
- Registered user only sees assigned project data.
- Disabled user cannot access dashboard.
- Backend unavailable fallback behavior.
- Settings save and integration test flows.

## Deployment Checklist

- Run `npm run build`.
- Confirm production env config for Supabase URL/key.
- Confirm n8n public webhook base URL.
- Confirm Supabase Auth redirect URLs include production `/auth/callback`.
- Confirm all n8n API workflows are active/published.
- Confirm CORS on n8n/Supabase paths.
- Confirm RLS and service-role usage on backend side.
- Confirm browser local storage migration/clear strategy.
- Confirm root README is updated to match Supabase Auth implementation.

