# UI Structure And Design System

## Source Structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | App routing, auth restore, global toasts. |
| `src/main.tsx` | React bootstrap. |
| `src/lib/auth.ts` | Supabase Auth REST helpers. |
| `src/lib/api.ts` | n8n webhook client, API types, payload mapping. |
| `src/hooks/useJobPolling.ts` | Long-running job polling for ingestion/generation. |
| `src/pages/LoginPage.tsx` | Landing page, login modal, forgot password modal. |
| `src/pages/AuthCallbackPage.tsx` | Invite/recovery callback and password setup. |
| `src/pages/DashboardPage.tsx` | Main authenticated app shell and most product UI. |
| `src/pages/ExploreMorePage.tsx` | Public marketing/exploration page. |
| `src/components/common` | Reusable UI primitives. |
| `src/components/dashboard` | Older/smaller dashboard form components; main dashboard currently has inline versions too. |
| `src/components/login` | Split login landing components, partly superseded by `LoginPage`. |
| `src/components/explore` | Split explore page components. |
| `src/theme` | Theme provider and token CSS. |

## Theme System

`ThemeProvider`:

- Theme values: `light`, `dark`.
- Storage key: `qops-theme`.
- Applies `data-theme` attribute to `document.documentElement`.

Theme tokens live in `src/theme/tokens.css`.

Important CSS custom properties:

- `--surface`
- `--surface-container-lowest`
- `--surface-container-low`
- `--surface-container`
- `--surface-container-high`
- `--on-surface`
- `--on-surface-variant`
- `--outline`
- `--outline-variant`
- `--primary`
- `--on-primary`
- `--error`
- `--success`
- `--warning`

Tailwind config maps these variables into utility classes.

## Layout

Authenticated dashboard:

- Fixed left sidebar, width `w-80`.
- Main content offset by `ml-80`.
- Sticky top header, height `h-20`.
- Content constrained to `max-w-[1200px]`.

Dashboard navigation:

- Dashboard
- Artifacts
- Doc Gen
- Knowledge Base
- Analytics
- Settings
- Documentation

## Modal And Drawer Pattern

Dashboard uses local modal/drawer components:

- `ModalFrame`
- `SideDrawer`

Common components also include reusable:

- `Modal`
- `ToastList`
- `Button`
- `Input`
- `Card`
- `ThemeToggle`

## Status And Feedback Components

Feedback patterns:

- Toasts live globally in `App`.
- Dashboard notifications are persisted in local storage.
- `StatusNotice` shows inline warning/success/error/info.
- `StatusBadge` maps status to token colors.
- `ToneIcon` maps status to Lucide icons.
- `StatusPanel` shows job progress.
- `OutputPanel` shows generated output or backend failure details.

## File Upload UX

`FileDrop` in `DashboardPage` supports:

- drag/drop
- single/multiple files
- selected file summary
- accepted MIME/extensions from props

Knowledge upload fields:

- BRD
- FRD
- HLD
- LLD
- transcript
- UI design images

Older reusable `FileDropField` exists in `src/components/dashboard/FileDropField.tsx`.

## Login Page UI

`LoginPage` includes:

- landing header
- hero section
- product capability cards
- metrics
- trust/security section
- login modal
- forgot password modal
- informational modals for docs/privacy/terms/status

The login modal calls the Supabase password flow via `App`.

## Explore Page

`ExploreMorePage` is public and marketing-oriented. It includes comparison and architecture sections. It currently checks legacy `qops-agent-auth` to decide CTA label/target; current auth uses `qops-agent-supabase-session`.

## Accessibility Notes

Good current practices:

- Buttons have visible labels or `aria-label` for icon-only actions.
- Modals close on Escape in several places.
- Modal backdrops close on click.
- Form inputs have labels.

Production improvements:

- Focus trapping for all modals/drawers.
- Restore focus after modal close.
- Ensure keyboard navigation through dashboard cards and file upload zones.
- Use semantic landmarks consistently in dashboard.

