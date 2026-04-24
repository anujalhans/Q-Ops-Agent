# Q-Ops Agent — Stitch Redesign Implementation

**Date:** 2026-04-24
**Status:** Approved (brainstorming phase)

## Goal

Implement the redesigned screens in `stitch_file_reader_utility/` (3 pages × light/dark = 6 HTMLs) inside the existing React + Vite + TS + Tailwind app, preserving every behavior in `FUNCTIONALITY.md`.

## Decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Theme handling | Both light + dark with user-facing toggle, persisted in localStorage |
| 2 | Default theme on first visit | Light |
| 3 | File strategy | Rewrite the 3 pages, decompose into many small components under `src/components/{login,dashboard,explore,common}/` |
| 4 | Image handling | Keep Stitch CDN URLs as-is |
| 5 | Icon library | lucide-react only (map every Material Symbol to its closest lucide equivalent) |
| 6 | Tailwind theming | CSS variables (one set per theme) exposed as Tailwind colors |

## Architecture

### Theme Infrastructure

**`src/theme/tokens.css`** — defines two scopes covering the full token set from `enterprise_ai_design_system/DESIGN.md` (light) and `dark_enterprise_ai/DESIGN.md` (dark):

```css
:root, [data-theme="light"] {
  --surface: #fcf8ff;
  --primary: #3525cd;
  /* ...all ~50 tokens, kebab-case names matching DESIGN.md... */
}

[data-theme="dark"] {
  --surface: #0b1326;
  --primary: #adc6ff;
  /* ... */
}
```

**`tailwind.config.js`** — replace existing `colors` block with token references (`surface: 'var(--surface)'`, `primary: 'var(--primary)'`, …). Add `fontFamily.sans = Inter`, `fontFamily.display = "Space Grotesk"`. `darkMode` left off — we drive theme via `data-theme` and CSS vars, not the `dark:` variant.

**`src/theme/ThemeProvider.tsx`** — React context. State `theme: 'light' | 'dark'`. On mount, read `localStorage['qops-theme']` (default `'light'`); write `data-theme` attribute on `document.documentElement`. Expose `useTheme() → { theme, setTheme, toggle }`. Persist on change.

**`src/index.css`** — keep `@tailwind` directives + base `body` font + selection color; drop dark-only `color-scheme: dark` and the dark hex background.

### Shared Primitives (`src/components/common/`)

| Component | Responsibility |
|---|---|
| `Button.tsx` | Variants `primary`/`secondary`/`ghost`, sizes `sm`/`md`. 6px radius. |
| `Modal.tsx` | Backdrop click + Escape close, focus trap, theme-appropriate elevation. Used by Login + Forgot Password. |
| `Input.tsx` | 1px border, focus → `--primary` border + subtle outer glow. Optional `label`, `error`, `icon`. |
| `Card.tsx` | Surface container, 1px `--outline-variant` border, 6px radius. |
| `Header.tsx` | Brand block (Q mark + name + AI-Powered tag + tagline) + right-side action slot + ThemeToggle. |
| `ThemeToggle.tsx` | Lucide `Sun`/`Moon` icon button. |
| `Toast.tsx` + `ToastList.tsx` | Replaces existing; bottom-right stack, 4.2s auto-dismiss, types `success`/`error`/`info`. |

### Page Decomposition

**`src/pages/LoginPage.tsx`** + `src/components/login/`
- `Hero.tsx`, `LogoStrip.tsx`, `Capabilities.tsx`, `Metrics.tsx`, `Transformation.tsx`, `FinalCta.tsx`
- `LoginModal.tsx` — username/password form, admin/admin validation
- `ForgotPasswordModal.tsx` — email-only form, success toast

**`src/pages/DashboardPage.tsx`** + `src/components/dashboard/`
- `DashboardHeader.tsx`, `Sidebar.tsx`
- `KnowledgeBaseForm.tsx`, `GenerateDocsForm.tsx`
- `JobStatusCard.tsx`, `RecentActivity.tsx`
- `FileDropField.tsx` (restyled port of existing component)

**`src/pages/ExploreMorePage.tsx`** + `src/components/explore/`
- `ExploreHeader.tsx`, `ExploreHero.tsx`, `CapabilityGrid.tsx`, `ArchitectureDiagram.tsx`, `WorkflowSteps.tsx`, `ExploreFinalCta.tsx`

### State & Behavior Preservation (per FUNCTIONALITY.md)

- **Auth**: `localStorage['qops-agent-auth']`, admin/admin, login/logout/forgot flows unchanged.
- **Routing**: `/`, `/dashboard`, `/explore` with the same redirect rules in `App.tsx`.
- **Toasts**: same trigger points, same 4.2s timeout, types `success`/`error`/`info`.
- **Knowledge Base + Doc Generation**: existing webhook URLs, polling intervals, status mapping (`queued`/`processing`/`completed`/`failed`) preserved. Extracted from `DashboardPage.tsx` into a new `src/lib/api.ts` module (relocation only — zero behavior change).

## Build Order

**Phase 1 — Foundation**
1. `src/theme/tokens.css` + `src/theme/ThemeProvider.tsx`
2. `tailwind.config.js` rewrite + `src/index.css` cleanup
3. `src/main.tsx` wraps `<App>` with `<ThemeProvider>`
4. `src/components/common/` primitives
5. `src/lib/api.ts` extracted from existing DashboardPage

**Phase 2 — Pages** (browser-verify each in both themes before moving on)
6. LoginPage (Login + Forgot Password modals, toggle)
7. DashboardPage (KB + Doc Gen forms, polling, toggle)
8. ExploreMorePage (toggle)

**Phase 3 — Cleanup**
9. Delete superseded `src/components/{CapabilityCards,FileDropField,FinalCta,Hero,HeroIllustration,Metrics,ToastList,Transformation}.tsx`.
10. `npm run build` + `npm run dev` smoke test of all 3 pages × 2 themes.

## Out of Scope

- Wiring Forgot Password to a real email service (UI-only, per FUNCTIONALITY.md §3).
- Backend changes — all webhook URLs & response shapes assumed unchanged.
- New functional features beyond what FUNCTIONALITY.md describes.
