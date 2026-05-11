# Authentication And Roles

## Supabase Auth Configuration

Defined in `src/lib/auth.ts`:

| Constant | Current Value |
| --- | --- |
| `SUPABASE_URL` | `https://ifnznfspkjayhnooncrv.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Hardcoded `sb_publishable_...` key |
| `SESSION_KEY` | `qops-agent-supabase-session` |

The publishable key is safe to expose by design, but production should still move project URL/key into environment variables for environment portability.

## Stored Session Shape

```ts
type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email?: string
  }
}
```

The full session is stored in `localStorage`. This means browser XSS protection matters because the bearer token is script-readable.

## Login Flow

1. User opens `/`.
2. `App` checks `qops-agent-supabase-session` and attempts `getUsableSession()`.
3. Login modal calls `signInWithPassword(email, password)`.
4. `signInWithPassword` calls Supabase:

```text
POST {SUPABASE_URL}/auth/v1/token?grant_type=password
```

5. The returned Supabase session is stored.
6. UI calls authenticated `/webhook/me`.
7. The Q-Ops profile must exist and have `status === "active"`.
8. If valid, `currentUser` is set and the user is routed to `/dashboard`.
9. If invalid, local session is cleared and login fails.

## Session Restore Flow

At app load, `App` runs:

1. `getUsableSession()`
2. If token expires within 60 seconds, `refreshStoredSession()`.
3. If refresh succeeds, call `/webhook/me`.
4. If the returned Q-Ops user is active, allow dashboard.
5. If user is missing, inactive, disabled, or API fails, clear session.

## Logout Flow

`signOut()`:

1. Reads access token from local storage.
2. Calls Supabase:

```text
POST {SUPABASE_URL}/auth/v1/logout
```

3. Clears:

- `qops-agent-supabase-session`
- legacy `qops-agent-auth`

4. App redirects to `/`.

## Password Reset Flow

From `LoginPage`:

1. User opens Forgot Password.
2. UI calls:

```text
POST {SUPABASE_URL}/auth/v1/recover?redirect_to={origin}/auth/callback
```

3. Supabase sends a recovery link.
4. `/auth/callback` consumes the URL hash.
5. User sets a new password.
6. UI calls:

```text
PUT {SUPABASE_URL}/auth/v1/user
```

7. UI fetches `/webhook/me`.
8. UI calls `/webhook/users/password-reset-audit` to persist an audit event.
9. User is routed to `/dashboard`.

## Invite Flow

Admin invite from Settings:

1. Admin fills email, name, title, role, and optional project assignments.
2. UI calls authenticated:

```text
POST /webhook/users/invite
```

3. The payload includes `redirectTo: {window.location.origin}/auth/callback`.
4. If invited role is `registered_user`, UI then calls:

```text
PATCH /webhook/users/project-assignments
```

5. Invitee clicks Supabase invite link.
6. `/auth/callback` sees callback type `invite`.
7. UI stores Supabase session, then calls:

```text
POST /webhook/users/accept-invite
```

8. Invitee sets password.
9. UI fetches `/webhook/me`, sets current user, and routes to dashboard.

## Roles

The frontend recognizes two Q-Ops roles:

| Role | Meaning |
| --- | --- |
| `admin` | Full workspace view, project creation, all projects, users/roles, integration settings, writable admin controls. |
| `registered_user` | Scoped project view, assigned projects only, read-only/limited settings, can upload/generate only for visible projects. |

User status:

| Status | Behavior |
| --- | --- |
| `active` | Allowed to use dashboard. |
| `pending_invite` | Not accepted as an active session by `App`. |
| `disabled` | Not accepted as an active session by `App`. |

Project assignment roles:

| Assignment Role | Frontend Meaning |
| --- | --- |
| `owner` | Stored/displayed in assignment UI. No separate permission branching currently. |
| `editor` | Default assignment role for selected projects. |
| `viewer` | Stored/displayed in assignment UI. No separate permission branching currently. |

## Role-Based UI Behavior

Admin:

- Can see all projects, artifacts, outputs, audit events, notifications.
- Can create a new project.
- Can open Admin and Registered User personas in Settings.
- Can refresh users.
- Can invite users.
- Can edit users.
- Can assign projects to registered users.
- Can edit Jira/Confluence settings.
- Can test integrations.

Registered user:

- Visible projects are filtered by `currentUser.projects` or `currentUser.projectRoles`.
- Artifact, output, audit, and notification lists are scoped by visible project names or own actor identity.
- Cannot open New Project from the main header.
- Settings forced to `user` persona.
- Sees profile, notifications, assigned projects, and read-only system status.

## Important Auth Gaps

- Tokens are stored in `localStorage`, not HttpOnly cookies.
- Supabase URL and publishable key are hardcoded.
- Frontend role checks improve UX but must not be treated as authorization. n8n/Supabase must enforce access.
- Some API functions are unauthenticated in `api.ts` even if production should likely require auth.
- `ExploreMorePage` still checks legacy `qops-agent-auth`; actual auth now uses `qops-agent-supabase-session`.

