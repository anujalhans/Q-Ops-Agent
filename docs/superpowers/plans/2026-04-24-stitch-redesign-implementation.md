# Q-Ops Agent — Stitch Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned Q-Ops Agent screens (3 pages × light/dark themes) from `stitch_file_reader_utility/`, preserving every behavior in `FUNCTIONALITY.md`.

**Architecture:** CSS-variable-driven theming exposed as Tailwind tokens (no `dark:` variant). React context (`ThemeProvider`) toggles `data-theme` on `<html>` and persists choice in `localStorage['qops-theme']`. Pages are decomposed into small focused components under `src/components/{common,login,dashboard,explore}/`. Material Symbols in the source HTML are mapped to lucide-react. All Stitch CDN image URLs are kept as-is.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind 3, react-router-dom 6, lucide-react.

**Verification approach:** This codebase has no test framework configured. Each task verifies via:
1. `npx tsc --noEmit` — TypeScript compile must succeed.
2. `npm run build` — full production build at phase boundaries.
3. Manual browser smoke test (`npm run dev` → visit page → toggle theme → exercise interactions) at end of each page task.

The "Run test" steps below are TypeScript checks unless otherwise stated.

**Source-of-truth references:**
- Behavior spec: `FUNCTIONALITY.md` (all 617 lines normative)
- Light design tokens: `stitch_file_reader_utility/enterprise_ai_design_system/DESIGN.md`
- Dark design tokens: `stitch_file_reader_utility/dark_enterprise_ai/DESIGN.md`
- Light HTMLs: `stitch_file_reader_utility/{landing_page_login_light,dashboard_workspace_light,explore_q_ops_agent_light}/code.html`
- Dark HTMLs: `stitch_file_reader_utility/{landing_page_login_dark,dashboard_workspace_dark,explore_q_ops_agent_dark}/code.html`

---

## Phase 1 — Foundation

### Task 1: Theme Tokens CSS

**Files:**
- Create: `src/theme/tokens.css`

- [ ] **Step 1: Create the tokens file**

Create `src/theme/tokens.css` containing the full token sets from both DESIGN.md files, scoped by `[data-theme]`:

```css
/* Light theme — from enterprise_ai_design_system/DESIGN.md */
:root,
[data-theme='light'] {
  --surface: #fcf8ff;
  --surface-dim: #dcd8e5;
  --surface-bright: #fcf8ff;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f5f2ff;
  --surface-container: #f0ecf9;
  --surface-container-high: #eae6f4;
  --surface-container-highest: #e4e1ee;
  --on-surface: #1b1b24;
  --on-surface-variant: #464555;
  --inverse-surface: #302f39;
  --inverse-on-surface: #f3effc;
  --outline: #777587;
  --outline-variant: #c7c4d8;
  --surface-tint: #4d44e3;
  --primary: #3525cd;
  --on-primary: #ffffff;
  --primary-container: #4f46e5;
  --on-primary-container: #dad7ff;
  --inverse-primary: #c3c0ff;
  --secondary: #515f74;
  --on-secondary: #ffffff;
  --secondary-container: #d5e3fc;
  --on-secondary-container: #57657a;
  --tertiary: #7e3000;
  --on-tertiary: #ffffff;
  --tertiary-container: #a44100;
  --on-tertiary-container: #ffd2be;
  --error: #ba1a1a;
  --on-error: #ffffff;
  --error-container: #ffdad6;
  --on-error-container: #93000a;
  --background: #fcf8ff;
  --on-background: #1b1b24;
  --surface-variant: #e4e1ee;

  /* Status accents (per DESIGN.md "Active/Success" guidance) */
  --success: #10b981;
  --on-success: #ffffff;
  --warning: #f59e0b;
}

/* Dark theme — from dark_enterprise_ai/DESIGN.md */
[data-theme='dark'] {
  --surface: #0b1326;
  --surface-dim: #0b1326;
  --surface-bright: #31394d;
  --surface-container-lowest: #060e20;
  --surface-container-low: #131b2e;
  --surface-container: #171f33;
  --surface-container-high: #222a3d;
  --surface-container-highest: #2d3449;
  --on-surface: #dae2fd;
  --on-surface-variant: #c2c6d6;
  --inverse-surface: #dae2fd;
  --inverse-on-surface: #283044;
  --outline: #8c909f;
  --outline-variant: #424754;
  --surface-tint: #adc6ff;
  --primary: #adc6ff;
  --on-primary: #002e6a;
  --primary-container: #4d8eff;
  --on-primary-container: #00285d;
  --inverse-primary: #005ac2;
  --secondary: #ddb7ff;
  --on-secondary: #490080;
  --secondary-container: #6f00be;
  --on-secondary-container: #d6a9ff;
  --tertiary: #4edea3;
  --on-tertiary: #003824;
  --tertiary-container: #00a572;
  --on-tertiary-container: #00311f;
  --error: #ffb4ab;
  --on-error: #690005;
  --error-container: #93000a;
  --on-error-container: #ffdad6;
  --background: #0b1326;
  --on-background: #dae2fd;
  --surface-variant: #2d3449;

  --success: #4edea3;
  --on-success: #003824;
  --warning: #ffb86b;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/theme/tokens.css
git commit -m "feat(theme): add light + dark CSS variable token sheets"
```

---

### Task 2: ThemeProvider context

**Files:**
- Create: `src/theme/ThemeProvider.tsx`

- [ ] **Step 1: Create the provider**

```tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'qops-theme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (next: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggle: () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/theme/ThemeProvider.tsx
git commit -m "feat(theme): add ThemeProvider context with localStorage persistence"
```

---

### Task 3: Tailwind config rewrite

**Files:**
- Modify: `tailwind.config.js` (full replacement)
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Replace tailwind.config.js**

```js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-dim': 'var(--surface-dim)',
        'surface-bright': 'var(--surface-bright)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'surface-tint': 'var(--surface-tint)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'primary-container': 'var(--primary-container)',
        'on-primary-container': 'var(--on-primary-container)',
        'inverse-primary': 'var(--inverse-primary)',
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-secondary-container)',
        tertiary: 'var(--tertiary)',
        'on-tertiary': 'var(--on-tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        error: 'var(--error)',
        'on-error': 'var(--on-error)',
        'error-container': 'var(--error-container)',
        'on-error-container': 'var(--on-error-container)',
        background: 'var(--background)',
        'on-background': 'var(--on-background)',
        'surface-variant': 'var(--surface-variant)',
        success: 'var(--success)',
        'on-success': 'var(--on-success)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
        display: ["'Space Grotesk'", 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      boxShadow: {
        ambient: '0 4px 12px rgba(0, 0, 0, 0.05)',
        'focus-ring': '0 0 0 3px color-mix(in srgb, var(--primary) 25%, transparent)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Replace src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './theme/tokens.css';

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--surface);
  color: var(--on-surface);
}

* {
  box-sizing: border-box;
}

::selection {
  background: color-mix(in srgb, var(--primary) 25%, transparent);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.animation-delay-200 { animation-delay: 0.2s; }
.animation-delay-400 { animation-delay: 0.4s; }
.animation-delay-600 { animation-delay: 0.6s; }
```

- [ ] **Step 3: Update index.html to load Inter + Space Grotesk and clear stale body classes**

Replace `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Q-Ops Agent</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="bg-surface text-on-surface">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: TypeScript + build check**

Run: `npx tsc --noEmit`
Expected: PASS (existing pages still compile — they reference old `bg-brand` etc. via Tailwind, but those classes no longer exist as defined colors; Tailwind silently drops unknown classes at build, but TS doesn't type-check class strings, so this passes)

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js src/index.css index.html
git commit -m "feat(theme): rewire Tailwind to CSS variable tokens; load Inter + Space Grotesk"
```

---

### Task 4: Wire ThemeProvider into main.tsx

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 2: Update src/App.tsx — change root wrapper to use new tokens**

Find:
```tsx
<div className="min-h-screen bg-surface text-white">
```
Replace with:
```tsx
<div className="min-h-screen bg-surface text-on-surface">
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/App.tsx
git commit -m "feat(theme): mount ThemeProvider; switch root container to token colors"
```

---

### Task 5: Common primitive — Button

**Files:**
- Create: `src/components/common/Button.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors focus:outline-none focus-visible:shadow-focus-ring disabled:opacity-60 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  secondary:
    'bg-transparent text-on-surface border border-outline-variant hover:bg-surface-container-high',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container-high',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/Button.tsx
git commit -m "feat(common): add Button primitive with primary/secondary/ghost variants"
```

---

### Task 6: Common primitive — Input

**Files:**
- Create: `src/components/common/Input.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helper?: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
}

export default function Input({
  label,
  helper,
  error,
  icon,
  trailing,
  className = '',
  id,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-center gap-2 rounded-md border bg-surface-container-lowest px-3 py-2 transition focus-within:shadow-focus-ring ${
          error ? 'border-error' : 'border-outline-variant focus-within:border-primary'
        }`}
      >
        {icon ? <span className="text-on-surface-variant flex-shrink-0">{icon}</span> : null}
        <input
          {...rest}
          id={inputId}
          className={`flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant outline-none ${className}`}
        />
        {trailing}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-on-surface-variant">{helper}</p>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/Input.tsx
git commit -m "feat(common): add Input primitive with label/helper/error/icon support"
```

---

### Task 7: Common primitive — Card

**Files:**
- Create: `src/components/common/Card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padded?: boolean
}

export default function Card({ children, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg ${
        padded ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/Card.tsx
git commit -m "feat(common): add Card primitive"
```

---

### Task 8: Common primitive — Modal

**Files:**
- Create: `src/components/common/Modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-surface-container-lowest border border-outline-variant rounded-lg shadow-ambient p-6 outline-none`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {title ? <h2 className="text-xl font-semibold text-on-surface mb-4 pr-8">{title}</h2> : null}
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/Modal.tsx
git commit -m "feat(common): add Modal with backdrop click + Escape close + scroll lock"
```

---

### Task 9: Common primitive — ThemeToggle

**Files:**
- Create: `src/components/common/ThemeToggle.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const Icon = theme === 'light' ? Moon : Sun
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors focus:outline-none focus-visible:shadow-focus-ring"
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/ThemeToggle.tsx
git commit -m "feat(common): add ThemeToggle button"
```

---

### Task 10: Common primitive — Toast / ToastList

**Files:**
- Create: `src/components/common/ToastList.tsx`
- (Old `src/components/ToastList.tsx` will be deleted in Phase 3)

- [ ] **Step 1: Create the new ToastList using tokens**

```tsx
import type { FC } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  title: string
  message: string
  type: ToastType
}

type ToastListProps = {
  toasts: Toast[]
}

const palette: Record<ToastType, { ring: string; icon: FC<{ className?: string }>; iconClass: string }> = {
  success: { ring: 'border-success/40 bg-success/10', icon: CheckCircle2, iconClass: 'text-success' },
  error:   { ring: 'border-error/40 bg-error/10',     icon: AlertCircle,  iconClass: 'text-error' },
  info:    { ring: 'border-primary/40 bg-primary/10', icon: Info,         iconClass: 'text-primary' },
}

const ToastList: FC<ToastListProps> = ({ toasts }) => {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[340px] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => {
        const p = palette[toast.type]
        const Icon = p.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`flex gap-3 rounded-md border p-3 shadow-ambient bg-surface-container-lowest ${p.ring}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${p.iconClass}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">{toast.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{toast.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ToastList
```

- [ ] **Step 2: Update App.tsx to import the new ToastList**

In `src/App.tsx`, change:
```tsx
import ToastList from './components/ToastList'
```
to:
```tsx
import ToastList from './components/common/ToastList'
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/ToastList.tsx src/App.tsx
git commit -m "feat(common): replace ToastList with token-driven version using lucide icons"
```

---

### Task 11: Common primitive — Header (shared brand block)

**Files:**
- Create: `src/components/common/Header.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

type HeaderProps = {
  rightSlot?: ReactNode
  showAiBadge?: boolean
  showTagline?: boolean
}

export default function Header({ rightSlot, showAiBadge = true, showTagline = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-low/90 backdrop-blur border-b border-outline-variant">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-primary text-on-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
            Q
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-lg font-semibold text-on-surface truncate">Q-Ops Agent</h1>
              {showAiBadge ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  AI-Powered
                </span>
              ) : null}
            </div>
            {showTagline ? (
              <p className="text-xs text-on-surface-variant truncate">
                A Purpose-Built AI System for QA Engineering
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightSlot}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/common/Header.tsx
git commit -m "feat(common): add shared Header with brand block + theme toggle slot"
```

---

### Task 12: Extract API + polling logic into src/lib/api.ts

**Files:**
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create the module**

```ts
const KB_UPLOAD_URL = 'http://localhost:5678/webhook/upload-test-artifacts'
const KB_STATUS_URL = 'http://localhost:5678/webhook/job-status'
const DOC_GENERATE_URL = 'http://localhost:5678/webhook/generate-qa-doc'
const DOC_STATUS_URL = 'http://localhost:5678/webhook/job-status-retrieve'

export type JobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'not_found'

export type UploadResponse = { jobId: string; status?: string }

export type StatusResponse = {
  status: JobStatus | string
  output?: any
  [key: string]: any
}

export type KnowledgeBasePayload = {
  projectName: string
  brd: File | null
  frd: File | null
  hld: File | null
  lld: File | null
  transcript: File | null
  images: File[]
}

export async function uploadKnowledgeBase(payload: KnowledgeBasePayload): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('projectName', payload.projectName)
  if (payload.brd) fd.append('brd', payload.brd)
  if (payload.frd) fd.append('frd', payload.frd)
  if (payload.hld) fd.append('hld', payload.hld)
  if (payload.lld) fd.append('lld', payload.lld)
  if (payload.transcript) fd.append('transcript', payload.transcript)
  payload.images.forEach((img) => fd.append('image', img))

  const res = await fetch(KB_UPLOAD_URL, { method: 'POST', body: fd })
  const data = await res.json()
  if (!data?.jobId) throw new Error('Invalid response from backend')
  return data
}

export async function fetchKbStatus(jobId: string): Promise<StatusResponse | null> {
  const res = await fetch(`${KB_STATUS_URL}?jobId=${encodeURIComponent(jobId)}`)
  if (!res.ok) throw new Error('Failed to fetch job status')
  const raw = await res.json()
  const data = Array.isArray(raw) ? raw[0] : raw
  return data ?? null
}

export type DocumentArtifactKey =
  | 'strategy'
  | 'plan'
  | 'risk'
  | 'testCases'
  | 'epicsAndStories'
  | 'traceability_matrix'

export function mapArtifactToDocumentType(artifact: DocumentArtifactKey): string {
  switch (artifact) {
    case 'strategy': return 'test_strategy'
    case 'plan': return 'test_plan'
    case 'risk': return 'risk_matrix'
    case 'testCases': return 'test_cases'
    case 'epicsAndStories': return 'user_stories'
    case 'traceability_matrix': return 'traceability_matrix'
    default: return artifact
  }
}

export type GenerateDocPayload = {
  projectName: string
  artifact: DocumentArtifactKey
}

export async function generateDocument(payload: GenerateDocPayload): Promise<UploadResponse> {
  const res = await fetch(DOC_GENERATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: payload.projectName,
      documentType: mapArtifactToDocumentType(payload.artifact),
      productOwner: 'PO',
    }),
  })
  const data = await res.json()
  if (!data?.jobId) throw new Error('Invalid response from backend')
  return data
}

export async function fetchDocStatus(jobId: string): Promise<StatusResponse | null> {
  const res = await fetch(`${DOC_STATUS_URL}?jobId=${encodeURIComponent(jobId)}`)
  if (!res.ok) throw new Error('Failed to fetch doc job status')
  const raw = await res.json()
  const data = Array.isArray(raw) ? raw[0] : raw
  return data ?? null
}

export function isTemplateError(status: unknown): boolean {
  return typeof status === 'string' && status.includes('{{')
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/lib/api.ts
git commit -m "feat(api): extract webhook calls + status polling helpers into src/lib/api.ts"
```

---

### Task 13: Phase 1 build + smoke

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: PASS, no TypeScript or Vite errors. (Warnings about old `bg-brand` / `bg-surface2` classes are acceptable — those files are still in use until Phase 2, and Tailwind silently drops unknown classes.)

- [ ] **Step 2: Dev server smoke test**

Run: `npm run dev`. Open `http://localhost:5173/`. The existing dark login page should still render with broken styling (token swap left old hex classes orphaned). Confirm:
- Page loads without white screen
- No console errors aside from missing class warnings
- Stop the dev server

- [ ] **Step 3: Commit anything pending**

If `npm run build` produced lock file or generated changes, commit them. Otherwise no commit needed.

---

## Phase 2 — Pages

### Task 14: Login page — sub-components

**Files:**
- Create: `src/components/login/LandingHeader.tsx`
- Create: `src/components/login/Hero.tsx`
- Create: `src/components/login/LogoStrip.tsx`
- Create: `src/components/login/Capabilities.tsx`
- Create: `src/components/login/Metrics.tsx`
- Create: `src/components/login/Transformation.tsx`
- Create: `src/components/login/FinalCta.tsx`

**Source HTML reference:**
- Light: `stitch_file_reader_utility/landing_page_login_light/code.html`
- Dark: `stitch_file_reader_utility/landing_page_login_dark/code.html`

**Implementation rule for each sub-component:**
1. Open the source HTML at the path above.
2. Identify the matching section (Hero is the top section after the header; LogoStrip is the trusted-by row; Capabilities is the feature grid; Metrics is the stats band; Transformation is the before/after block; FinalCta is the closing call-to-action).
3. Translate the HTML to JSX:
   - Replace every `<span class="material-symbols-outlined">name</span>` with the lucide-react equivalent. Use the mapping table below.
   - Convert `class=` → `className=`, swap inline `style="..."` to `style={{ ... }}` JSX object form.
   - Keep all `lh3.googleusercontent.com/aida-public/...` image `src` URLs verbatim.
   - Replace any hardcoded color hex (e.g. `bg-[#fcf8ff]`, `text-slate-900`) with the corresponding token class (`bg-surface`, `text-on-surface`, etc.). The light HTML's `#fcf8ff` → `--surface`. The light HTML's `#3525cd` → `--primary`. The dark HTML's `#0b1326` → `--surface`. The dark HTML's `#adc6ff` → `--primary`. Both versions resolve via the same token class because the CSS variable changes per theme.
   - For shared sections that appear in both light and dark HTMLs with structurally identical markup, write ONE component using token classes — it auto-themes.
4. Each component takes only the props it actually needs (e.g. `<Hero onExplore={...} />`).

**Material Symbols → lucide-react mapping (use throughout the project):**

| Material Symbol | Lucide |
|---|---|
| `auto_awesome` | `Sparkles` |
| `bolt` | `Zap` |
| `check`, `check_circle` | `Check`, `CheckCircle2` |
| `close` | `X` |
| `dark_mode` | `Moon` |
| `light_mode` | `Sun` |
| `description`, `article` | `FileText` |
| `cloud_upload` | `UploadCloud` |
| `download` | `Download` |
| `arrow_forward` | `ArrowRight` |
| `arrow_back` | `ArrowLeft` |
| `chevron_right` | `ChevronRight` |
| `chevron_down` | `ChevronDown` |
| `menu` | `Menu` |
| `settings` | `Settings` |
| `logout` | `LogOut` |
| `login` | `LogIn` |
| `lock`, `lock_outline` | `Lock` |
| `mail`, `mail_outline` | `Mail` |
| `person`, `account_circle` | `User`, `UserCircle2` |
| `visibility` / `visibility_off` | `Eye` / `EyeOff` |
| `dashboard` | `LayoutDashboard` |
| `psychology`, `smart_toy` | `Brain`, `Bot` |
| `analytics`, `bar_chart` | `BarChart3` |
| `target`, `track_changes` | `Target` |
| `database` / `dataset` | `Database` |
| `folder`, `folder_open` | `Folder`, `FolderOpen` |
| `image` | `Image` |
| `mic` | `Mic` |
| `error`, `warning` | `AlertCircle`, `AlertTriangle` |
| `info` | `Info` |
| `search` | `Search` |
| `play_arrow` | `Play` |
| `refresh` | `RefreshCw` |
| `more_vert` | `MoreVertical` |
| `link` | `Link` |
| `shield` | `Shield` |
| `verified` | `BadgeCheck` |

If a Material Symbol is not in this table, choose the closest visual match from `lucide-react` and add it to a comment block at the top of the file that uses it.

- [ ] **Step 1: Create LandingHeader.tsx**

This is the page's top bar. It uses the shared Header primitive with a Login button as the right slot.

```tsx
import Button from '../common/Button'
import Header from '../common/Header'

type Props = {
  onLogin: () => void
}

export default function LandingHeader({ onLogin }: Props) {
  return (
    <Header
      rightSlot={
        <Button variant="primary" size="md" onClick={onLogin}>
          Login
        </Button>
      }
    />
  )
}
```

- [ ] **Step 2: Create Hero.tsx**

Open the source HTMLs and translate the hero block.

Skeleton (fill in headline/subhead text exactly as in the design HTML; replace the placeholder image src with the actual Stitch CDN URL from the source):

```tsx
import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '../common/Button'

type Props = {
  onExplore: () => void
}

export default function Hero({ onExplore }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          <Sparkles className="w-3 h-3" /> AI-Powered
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-on-surface leading-tight">
          {/* COPY FROM SOURCE HTML — top headline */}
          Build QA That Starts Before Code Exists
        </h2>
        <p className="text-lg text-on-surface-variant max-w-xl">
          {/* COPY FROM SOURCE HTML — subhead */}
          Transform requirements, designs, and conversations into a complete QA foundation—instantly.
        </p>
        <p className="text-base text-on-surface font-medium">
          Q-Ops Agent doesn't assist QA. It builds it.
        </p>
        <p className="text-sm text-on-surface-variant">
          From scattered artifacts to structured QA—ready in minutes.
        </p>
        <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={onExplore}>
          Explore More
        </Button>
      </div>
      <div className="hidden lg:block">
        <img
          src="/* PASTE STITCH CDN URL FROM SOURCE HTML */"
          alt="AI-driven QA intelligence"
          className="w-full h-auto rounded-lg border border-outline-variant"
        />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create LogoStrip.tsx, Capabilities.tsx, Metrics.tsx, Transformation.tsx, FinalCta.tsx**

For each, follow the same pattern: read the matching section in `landing_page_login_light/code.html` (line numbers shown by `grep -n "section" stitch_file_reader_utility/landing_page_login_light/code.html` if needed), translate to JSX, replace Material Symbols with lucide icons per the mapping table, replace hex/slate classes with token classes, keep CDN image URLs verbatim.

`FinalCta.tsx` takes:
```tsx
type Props = { onPrimary: () => void }   // navigates to /explore
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/login/
git commit -m "feat(login): add landing page sub-components from new design"
```

---

### Task 15: Login page — modal components

**Files:**
- Create: `src/components/login/LoginModal.tsx`
- Create: `src/components/login/ForgotPasswordModal.tsx`

- [ ] **Step 1: Create LoginModal.tsx**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, User } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (username: string, password: string) => boolean
  onForgotPassword: () => void
}

export default function LoginModal({ open, onClose, onSubmit, onForgotPassword }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = onSubmit(username, password)
    if (ok) {
      setError('')
      setUsername('')
      setPassword('')
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Login to Q-Ops Agent">
      <p className="text-sm text-on-surface-variant mb-6">Welcome back, QA lead.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          icon={<User className="w-4 h-4" />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          icon={<Lock className="w-4 h-4" />}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          error={error || undefined}
          required
        />
        <Button type="submit" variant="primary" fullWidth>
          Login
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: Create ForgotPasswordModal.tsx**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (email: string) => void
  onBackToLogin: () => void
}

export default function ForgotPasswordModal({ open, onClose, onSubmit, onBackToLogin }: Props) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email.trim())
      setEmail('')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reset Your Password">
      <p className="text-sm text-on-surface-variant mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          icon={<Mail className="w-4 h-4" />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />
        <Button type="submit" variant="primary" fullWidth>
          Send Reset Link
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-primary hover:underline"
        >
          Back to Login
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/login/LoginModal.tsx src/components/login/ForgotPasswordModal.tsx
git commit -m "feat(login): add LoginModal + ForgotPasswordModal using common primitives"
```

---

### Task 16: Login page — assemble

**Files:**
- Modify: `src/pages/LoginPage.tsx` (full replacement)

- [ ] **Step 1: Replace LoginPage.tsx**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LandingHeader from '../components/login/LandingHeader'
import Hero from '../components/login/Hero'
import LogoStrip from '../components/login/LogoStrip'
import Capabilities from '../components/login/Capabilities'
import Metrics from '../components/login/Metrics'
import Transformation from '../components/login/Transformation'
import FinalCta from '../components/login/FinalCta'
import LoginModal from '../components/login/LoginModal'
import ForgotPasswordModal from '../components/login/ForgotPasswordModal'

type Props = {
  onSuccess: () => void
  addToast: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' }) => void
}

export default function LoginPage({ onSuccess, addToast }: Props) {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleLoginSubmit = (username: string, password: string): boolean => {
    if (username.trim() === 'admin' && password === 'admin') {
      onSuccess()
      addToast({ title: 'Welcome back', message: 'You have successfully logged in.', type: 'success' })
      setShowLogin(false)
      return true
    }
    addToast({ title: 'Authentication failed', message: 'Please use admin/admin to continue.', type: 'error' })
    return false
  }

  const handleForgotSubmit = (email: string) => {
    addToast({
      title: 'Password reset email sent',
      message: `Check your email at ${email} for password reset instructions.`,
      type: 'success',
    })
    setShowForgot(false)
  }

  const goToExplore = () => navigate('/explore')

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <LandingHeader onLogin={() => setShowLogin(true)} />
      <main>
        <Hero onExplore={goToExplore} />
        <LogoStrip />
        <Capabilities />
        <Metrics />
        <Transformation />
        <FinalCta onPrimary={goToExplore} />
      </main>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSubmit={handleLoginSubmit}
        onForgotPassword={() => {
          setShowLogin(false)
          setShowForgot(true)
        }}
      />
      <ForgotPasswordModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        onSubmit={handleForgotSubmit}
        onBackToLogin={() => {
          setShowForgot(false)
          setShowLogin(true)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npx tsc --noEmit` → PASS
Run: `npm run build` → PASS

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat(login): rewrite LoginPage on top of new sub-components + modals"
```

- [ ] **Step 3: Browser smoke test**

Run: `npm run dev`. Visit `http://localhost:5173/` and verify against `FUNCTIONALITY.md` §3, §5:
- Page renders in **light** theme by default.
- Click ThemeToggle (moon icon top-right of header) → switches to dark; refresh page → still dark; toggle again → light persists.
- Click **Login** in header → modal opens.
- Press Escape → modal closes. Reopen, click backdrop → closes. Reopen, click × → closes.
- Submit `admin`/`admin` → success toast appears bottom-right, redirects to `/dashboard`.
- Logout from dashboard, return to `/`, submit wrong creds → error toast, inline error text.
- Click **Forgot your password?** → forgot modal opens, login modal closes.
- Submit any email → success toast, modal closes.
- Forgot modal → click **Back to Login** → re-opens login modal.
- Click **Explore More** in hero → navigates to `/explore` (will 404-render until Task 21; that's OK at this point — note and continue).

Stop dev server. If any check fails, fix inline before commit.

---

### Task 17: Dashboard page — sub-components (forms)

**Files:**
- Create: `src/components/dashboard/DashboardHeader.tsx`
- Create: `src/components/dashboard/Sidebar.tsx`
- Create: `src/components/dashboard/FileDropField.tsx`

- [ ] **Step 1: Create DashboardHeader.tsx**

```tsx
import { LogOut } from 'lucide-react'
import Button from '../common/Button'
import Header from '../common/Header'

type Props = {
  onLogout: () => void
}

export default function DashboardHeader({ onLogout }: Props) {
  return (
    <Header
      rightSlot={
        <Button variant="secondary" size="md" leftIcon={<LogOut className="w-4 h-4" />} onClick={onLogout}>
          Logout
        </Button>
      }
    />
  )
}
```

- [ ] **Step 2: Create Sidebar.tsx**

A vertical tab switcher for Knowledge Base / Generate Documents. Match the layout from `dashboard_workspace_light/code.html` (sidebar nav).

```tsx
import { Database, FileText } from 'lucide-react'

export type DashboardTab = 'knowledge' | 'documents'

type Props = {
  active: DashboardTab
  onChange: (tab: DashboardTab) => void
}

const items: Array<{ key: DashboardTab; label: string; Icon: typeof Database }> = [
  { key: 'knowledge', label: 'Knowledge Base', Icon: Database },
  { key: 'documents', label: 'Generate Documents', Icon: FileText },
]

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="bg-surface-container-low border border-outline-variant rounded-lg p-2 space-y-1">
      {items.map(({ key, label, Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Create FileDropField.tsx**

Token-driven port of the existing logic. Replace the emoji `icon` prop with a lucide ReactNode prop.

```tsx
import type { DragEvent, ReactNode } from 'react'
import { useCallback, useId, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

type Value = File | File[] | null

type Props = {
  label: string
  accept: string
  multiple?: boolean
  value: Value
  onChange: (files: Value) => void
  helper?: string
  icon?: ReactNode
}

function summarise(value: Value): string {
  if (!value) return 'No file selected'
  if (Array.isArray(value)) return `${value.length} file${value.length === 1 ? '' : 's'} selected`
  return value.name
}

export default function FileDropField({
  label,
  accept,
  multiple = false,
  value,
  onChange,
  helper,
  icon,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()
  const [drag, setDrag] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const arr = Array.from(files)
      if (multiple) onChange(arr)
      else onChange(arr[0] ?? null)
    },
    [multiple, onChange],
  )

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDrag(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
        {icon ?? <UploadCloud className="w-4 h-4 text-on-surface-variant" />}
        <span>{label}</span>
      </div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`flex flex-col gap-1 cursor-pointer rounded-md border-2 border-dashed px-3 py-4 text-xs transition-colors ${
          drag
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
        }`}
      >
        <span className="text-on-surface-variant">Drag & drop or click to upload</span>
        <span className="text-on-surface-variant/70">
          Supported: {accept.replace(/\./g, '').replace(/,/g, ', ')}
        </span>
        <span className="mt-2 inline-block self-start rounded-sm bg-surface-container-high px-2 py-0.5 text-on-surface">
          {summarise(value)}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {helper ? <p className="text-xs text-on-surface-variant">{helper}</p> : null}
    </div>
  )
}
```

- [ ] **Step 4: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/dashboard/
git commit -m "feat(dashboard): add header, sidebar, FileDropField primitives for new design"
```

---

### Task 18: Dashboard page — KnowledgeBaseForm + GenerateDocsForm

**Files:**
- Create: `src/components/dashboard/KnowledgeBaseForm.tsx`
- Create: `src/components/dashboard/GenerateDocsForm.tsx`

- [ ] **Step 1: Create KnowledgeBaseForm.tsx**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, Image as ImageIcon, Mic, Rocket, RefreshCw, Folder } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import FileDropField from './FileDropField'
import { uploadKnowledgeBase } from '../../lib/api'
import type { KnowledgeBasePayload, UploadResponse } from '../../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void

type Props = {
  onJobStarted: (response: UploadResponse) => void
  addToast: AddToast
}

export default function KnowledgeBaseForm({ onJobStarted, addToast }: Props) {
  const [projectName, setProjectName] = useState('')
  const [brd, setBrd] = useState<File | null>(null)
  const [frd, setFrd] = useState<File | null>(null)
  const [hld, setHld] = useState<File | null>(null)
  const [lld, setLld] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload: KnowledgeBasePayload = {
        projectName,
        brd, frd, hld, lld, transcript, images,
      }
      const res = await uploadKnowledgeBase(payload)
      onJobStarted(res)
      addToast({ title: 'Ingestion started', message: 'Knowledge base ingestion queued.', type: 'info' })
    } catch (err: any) {
      const msg = err?.message ?? 'Something went wrong'
      setError(msg)
      addToast({ title: 'Upload failed', message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProjectName(''); setBrd(null); setFrd(null); setHld(null); setLld(null)
    setTranscript(null); setImages([])
    addToast({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
  }

  const setFile = (setter: (f: File | null) => void) => (v: File | File[] | null) => {
    setter(Array.isArray(v) ? v[0] ?? null : v)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter knowledge project name"
        helper="Give a clear, descriptive project name for traceability."
        required
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-on-surface mb-3">Business Documents</p>
          <div className="space-y-3">
            <FileDropField label="BRD" accept=".pdf,.doc,.docx" value={brd} onChange={setFile(setBrd)} icon={<FileText className="w-4 h-4 text-on-surface-variant" />} />
            <FileDropField label="FRD" accept=".pdf,.doc,.docx" value={frd} onChange={setFile(setFrd)} icon={<FileText className="w-4 h-4 text-on-surface-variant" />} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-on-surface mb-3">Technical Documents</p>
          <div className="space-y-3">
            <FileDropField label="HLD" accept=".pdf,.doc,.docx" value={hld} onChange={setFile(setHld)} icon={<Folder className="w-4 h-4 text-on-surface-variant" />} />
            <FileDropField label="LLD" accept=".pdf,.doc,.docx" value={lld} onChange={setFile(setLld)} icon={<Folder className="w-4 h-4 text-on-surface-variant" />} />
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-on-surface mb-3">Supporting Assets</p>
          <div className="space-y-3">
            <FileDropField label="Transcript" accept=".txt" value={transcript} onChange={setFile(setTranscript)} icon={<Mic className="w-4 h-4 text-on-surface-variant" />} />
            <FileDropField
              label="UI designs"
              accept=".jpg,.png"
              multiple
              value={images}
              onChange={(v) => setImages(Array.isArray(v) ? v : v ? [v] : [])}
              helper="Upload one or more design images for your UI assets."
              icon={<ImageIcon className="w-4 h-4 text-on-surface-variant" />}
            />
          </div>
        </Card>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={loading} leftIcon={<Rocket className="w-4 h-4" />}>
          {loading ? 'Creating knowledge base...' : 'Create Knowledge Base'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Reset
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create GenerateDocsForm.tsx**

```tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, Rocket, RefreshCw } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import { generateDocument } from '../../lib/api'
import type { DocumentArtifactKey, UploadResponse } from '../../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void

type Props = {
  onJobStarted: (response: UploadResponse) => void
  addToast: AddToast
}

const ARTIFACTS: Array<{ key: DocumentArtifactKey; label: string; description: string }> = [
  { key: 'strategy',             label: 'Test Strategy',         description: 'Generate Test Strategy from your knowledge base.' },
  { key: 'plan',                 label: 'Test Plan',             description: 'Generate Test Plan from your knowledge base.' },
  { key: 'risk',                 label: 'Risk Matrix',           description: 'Generate Risk Matrix from your knowledge base.' },
  { key: 'testCases',            label: 'Test Cases',            description: 'Generate Test Cases from your knowledge base.' },
  { key: 'epicsAndStories',      label: 'Epics & User Stories',  description: 'Generate epics and user stories from your knowledge base.' },
  { key: 'traceability_matrix',  label: 'Traceability Matrix',   description: 'Generate Traceability Matrix from your knowledge base.' },
]

export default function GenerateDocsForm({ onJobStarted, addToast }: Props) {
  const [project, setProject] = useState('')
  const [artifact, setArtifact] = useState<DocumentArtifactKey | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!project || !artifact) {
      setError('Please select project and artifact type')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await generateDocument({ projectName: project, artifact })
      onJobStarted(res)
      addToast({ title: 'Generation started', message: 'Document generation queued.', type: 'info' })
    } catch (err: any) {
      const msg = err?.message ?? 'Something went wrong'
      setError(msg)
      addToast({ title: 'Generation failed', message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProject(''); setArtifact(''); setError('')
    addToast({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Project name"
        value={project}
        onChange={(e) => setProject(e.target.value)}
        placeholder="Enter existing knowledge project name"
        required
      />

      <Card>
        <p className="text-sm font-semibold text-on-surface mb-1">Select artifacts</p>
        <p className="text-xs text-on-surface-variant mb-4">What would you like to generate?</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {ARTIFACTS.map((a) => {
            const selected = artifact === a.key
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setArtifact(a.key)}
                aria-pressed={selected}
                className={`text-left p-3 rounded-md border transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-on-surface">{a.label}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{a.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={loading} leftIcon={<Rocket className="w-4 h-4" />}>
          {loading ? 'Generating documents...' : 'Generate Documents'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Reset
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/components/dashboard/KnowledgeBaseForm.tsx src/components/dashboard/GenerateDocsForm.tsx
git commit -m "feat(dashboard): add KnowledgeBaseForm + GenerateDocsForm using extracted api.ts"
```

---

### Task 19: Dashboard page — JobStatusCard + polling hooks

**Files:**
- Create: `src/components/dashboard/JobStatusCard.tsx`
- Create: `src/hooks/useJobPolling.ts`

- [ ] **Step 1: Create useJobPolling.ts**

This consolidates the polling state machine that exists twice in the legacy DashboardPage (KB and Doc paths). Polling rules per FUNCTIONALITY.md and the legacy code:
- Initial poll happens immediately after `start()`.
- After initial poll, switch to 30s interval.
- When status becomes `processing`, switch interval to 45s.
- `not_found` → increment retry; after 3 retries, set status `failed`.
- Errors → increment retry; after 3 retries, set status `failed`.
- Stop polling on `completed`, `failed`, or template-error.

```ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchKbStatus, fetchDocStatus, isTemplateError } from '../lib/api'
import type { JobStatus, StatusResponse, UploadResponse } from '../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void

type Kind = 'kb' | 'doc'

type Labels = {
  processingTitle: string
  processingMessage: string
  completedTitle: string
  completedMessage: string
  failedTitle: string
  failedMessage: string
  notFoundTitle: string
  notFoundMessage: string
  backendErrorTitle: string
  backendErrorMessage: string
}

const LABELS: Record<Kind, Labels> = {
  kb: {
    processingTitle: 'Processing started',
    processingMessage: 'Your knowledge base is being created.',
    completedTitle: 'Job completed',
    completedMessage: 'Knowledge base creation completed successfully.',
    failedTitle: 'Job failed',
    failedMessage: 'Knowledge base creation failed.',
    notFoundTitle: 'Job not found',
    notFoundMessage: 'Unable to track job after multiple retries.',
    backendErrorTitle: 'Backend error',
    backendErrorMessage: 'Webhook is not properly configured.',
  },
  doc: {
    processingTitle: 'Generation in progress',
    processingMessage: 'Your document is being generated.',
    completedTitle: 'Document generation completed',
    completedMessage: 'Your QA document is ready.',
    failedTitle: 'Document generation failed',
    failedMessage: 'Unable to generate document.',
    notFoundTitle: 'Job not found',
    notFoundMessage: 'Unable to track document generation after retries.',
    backendErrorTitle: 'Backend error',
    backendErrorMessage: 'Webhook is not properly configured.',
  },
}

export type JobState = {
  status: JobStatus
  jobId: string | null
  output: any
  error: string
}

export function useJobPolling(kind: Kind, addToast: AddToast) {
  const [state, setState] = useState<JobState>({ status: 'idle', jobId: null, output: null, error: '' })
  const intervalRef = useRef<number | null>(null)
  const initialDelayRef = useRef<number | null>(null)
  const retriesRef = useRef(0)
  const seenProcessingToastRef = useRef(false)

  const labels = LABELS[kind]
  const fetcher = kind === 'kb' ? fetchKbStatus : fetchDocStatus

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (initialDelayRef.current) { clearTimeout(initialDelayRef.current); initialDelayRef.current = null }
  }, [])

  const handleResult = useCallback((data: StatusResponse | null, jobId: string) => {
    if (!data) return
    if (isTemplateError(data.status)) {
      setState((s) => ({ ...s, status: 'failed', error: 'Backend response format error: Template variables not substituted.' }))
      addToast({ title: labels.backendErrorTitle, message: labels.backendErrorMessage, type: 'error' })
      stop()
      return
    }
    const status = data.status as JobStatus
    if (status === 'completed') {
      setState((s) => ({ ...s, status: 'completed', output: data.output ?? data }))
      addToast({ title: labels.completedTitle, message: labels.completedMessage, type: 'success' })
      stop()
    } else if (status === 'failed') {
      setState((s) => ({ ...s, status: 'failed', error: kind === 'kb' ? 'Job failed. Please try again.' : 'Document generation failed. Please try again.' }))
      addToast({ title: labels.failedTitle, message: labels.failedMessage, type: 'error' })
      stop()
    } else if (status === 'processing') {
      setState((s) => ({ ...s, status: 'processing' }))
      if (!seenProcessingToastRef.current) {
        seenProcessingToastRef.current = true
        addToast({ title: labels.processingTitle, message: labels.processingMessage, type: 'info' })
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(() => { void poll(jobId) }, 45000)
    } else if (status === 'not_found') {
      retriesRef.current += 1
      if (retriesRef.current >= 3) {
        setState((s) => ({ ...s, status: 'failed', error: kind === 'kb' ? 'Job not found after retries.' : 'Document job not found after retries.' }))
        addToast({ title: labels.notFoundTitle, message: labels.notFoundMessage, type: 'error' })
        stop()
      }
    } else {
      setState((s) => ({ ...s, status }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast, kind, stop])

  const poll = useCallback(async (jobId: string) => {
    try {
      const data = await fetcher(jobId)
      handleResult(data, jobId)
    } catch {
      retriesRef.current += 1
      if (retriesRef.current >= 3) {
        setState((s) => ({ ...s, status: 'failed', error: kind === 'kb' ? 'Failed to check job status.' : 'Failed to check document generation status.' }))
        stop()
      }
    }
  }, [fetcher, handleResult, kind, stop])

  const start = useCallback((response: UploadResponse) => {
    stop()
    retriesRef.current = 0
    seenProcessingToastRef.current = false
    setState({ status: (response.status as JobStatus) ?? 'queued', jobId: response.jobId, output: null, error: '' })
    void poll(response.jobId)
    const delay = kind === 'kb' ? 5000 : 30000
    initialDelayRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => { void poll(response.jobId) }, 30000)
    }, delay)
  }, [kind, poll, stop])

  const reset = useCallback(() => {
    stop()
    retriesRef.current = 0
    seenProcessingToastRef.current = false
    setState({ status: 'idle', jobId: null, output: null, error: '' })
  }, [stop])

  useEffect(() => () => stop(), [stop])

  return { state, start, reset }
}
```

- [ ] **Step 2: Create JobStatusCard.tsx**

```tsx
import { CheckCircle2, AlertCircle, Loader2, Clock, ExternalLink } from 'lucide-react'
import Card from '../common/Card'
import type { JobState } from '../../hooks/useJobPolling'

type Props = {
  kind: 'kb' | 'doc'
  state: JobState
}

const labels: Record<string, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  not_found: 'Not found',
  idle: 'Idle',
}

function progressWidth(status: JobState['status']) {
  if (status === 'completed') return 'w-full'
  if (status === 'processing') return 'w-1/2 animate-pulse'
  if (status === 'queued') return 'w-1/4'
  return 'w-0'
}

function statusIcon(status: JobState['status']) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-success" />
  if (status === 'failed') return <AlertCircle className="w-4 h-4 text-error" />
  if (status === 'processing') return <Loader2 className="w-4 h-4 text-primary animate-spin" />
  return <Clock className="w-4 h-4 text-on-surface-variant" />
}

export default function JobStatusCard({ kind, state }: Props) {
  if (state.status === 'idle') {
    return (
      <Card>
        <p className="text-sm font-semibold text-on-surface mb-1">Job Status</p>
        <p className="text-xs text-on-surface-variant">No job is running yet.</p>
      </Card>
    )
  }

  const messages = {
    kb: {
      queued: 'Queued for ingestion. Polling starts in 30 seconds.',
      processing: 'Processing continues. Polling every 45 seconds until completion.',
      completed: 'Knowledge base created successfully.',
      failed: 'Knowledge base creation failed.',
    },
    doc: {
      queued: 'Generation queued. Polling starts in 30 seconds.',
      processing: 'Generating document. Polling every 45 seconds until completion.',
      completed: 'Document generated successfully.',
      failed: 'Document generation failed.',
    },
  }[kind] as Record<string, string>

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-on-surface">Job Status</p>
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-on-surface-variant">
          {statusIcon(state.status)}
          {labels[state.status] ?? state.status}
        </div>
      </div>
      {state.jobId ? <p className="text-xs text-on-surface-variant mb-2">Job ID: <span className="font-mono">{state.jobId}</span></p> : null}
      <div className="h-1.5 w-full bg-surface-container-high rounded-sm overflow-hidden">
        <div className={`h-full bg-primary ${progressWidth(state.status)}`} />
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">{messages[state.status] ?? ''}</p>

      {state.status === 'completed' && state.output ? (
        <div className="mt-4 border-t border-outline-variant pt-4">
          {state.output.epics && state.output.stories ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-on-surface mb-2">Epics</p>
                <ul className="space-y-1">
                  {state.output.epics.map((epic: any) => (
                    <li key={epic.epicID}>
                      <a href={epic.epicLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <ExternalLink className="w-3 h-3" /> {epic.epicKey}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface mb-2">User Stories</p>
                <ul className="space-y-1">
                  {state.output.stories.map((story: any) => (
                    <li key={story.storyID}>
                      <a href={story.storyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <ExternalLink className="w-3 h-3" /> {story.storyKey}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : state.output.url ? (
            <div>
              <p className="text-sm font-semibold text-on-surface mb-2">Document Link</p>
              <a href={state.output.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="w-4 h-4" /> Open Document
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-xs text-error">{state.error}</p> : null}
    </Card>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npx tsc --noEmit` → PASS

```bash
git add src/hooks/useJobPolling.ts src/components/dashboard/JobStatusCard.tsx
git commit -m "feat(dashboard): add useJobPolling hook + JobStatusCard"
```

---

### Task 20: Dashboard page — assemble

**Files:**
- Modify: `src/pages/DashboardPage.tsx` (full replacement)

- [ ] **Step 1: Replace DashboardPage.tsx**

```tsx
import { useMemo, useState } from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import Sidebar from '../components/dashboard/Sidebar'
import type { DashboardTab } from '../components/dashboard/Sidebar'
import KnowledgeBaseForm from '../components/dashboard/KnowledgeBaseForm'
import GenerateDocsForm from '../components/dashboard/GenerateDocsForm'
import JobStatusCard from '../components/dashboard/JobStatusCard'
import { useJobPolling } from '../hooks/useJobPolling'

type ToastType = 'success' | 'error' | 'info'

type Props = {
  onLogout: () => void
  addToast: (t: { title: string; message: string; type: ToastType }) => void
}

export default function DashboardPage({ onLogout, addToast }: Props) {
  const [tab, setTab] = useState<DashboardTab>('knowledge')
  const kb = useJobPolling('kb', addToast)
  const doc = useJobPolling('doc', addToast)

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <DashboardHeader onLogout={onLogout} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">{greeting}</p>
          <h2 className="font-display text-2xl font-semibold text-on-surface">Workspace</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr_320px]">
          <Sidebar active={tab} onChange={setTab} />

          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
            <h3 className="font-display text-lg font-semibold text-on-surface mb-1">
              {tab === 'knowledge' ? 'Build a Knowledge Base' : 'Generate QA Deliverables'}
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              {tab === 'knowledge'
                ? 'Upload your project artifacts to build a knowledge base.'
                : 'Choose outputs and generate QA deliverables from your knowledge base.'}
            </p>
            {tab === 'knowledge' ? (
              <KnowledgeBaseForm onJobStarted={kb.start} addToast={addToast} />
            ) : (
              <GenerateDocsForm onJobStarted={doc.start} addToast={addToast} />
            )}
          </section>

          <aside className="space-y-4">
            <JobStatusCard kind={tab === 'knowledge' ? 'kb' : 'doc'} state={tab === 'knowledge' ? kb.state : doc.state} />
          </aside>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify + build**

Run: `npx tsc --noEmit` → PASS
Run: `npm run build` → PASS

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat(dashboard): rewrite DashboardPage on top of new sub-components"
```

- [ ] **Step 3: Browser smoke test**

Run: `npm run dev`. Login as admin/admin. On `/dashboard` verify against FUNCTIONALITY.md §6:
- Header brand block + Logout + ThemeToggle visible.
- Sidebar shows Knowledge Base + Generate Documents tabs; switching highlights the active tab.
- KB tab: project name + 6 file drop fields grouped into 3 cards. Drag-and-drop changes the file label.
- Click **Create Knowledge Base** with no backend running → error toast (`Upload failed`).
- (If backend is reachable) status card transitions queued → processing → completed.
- **Reset** clears all fields and shows info toast.
- Switch to Documents tab. Pick any artifact (card highlights with primary border). Submit with empty project → inline error.
- Theme toggle works on this page; choice persists after refresh.
- Logout returns to `/`.

Stop dev server. Fix any failures inline before commit.

---

### Task 21: Explore page — sub-components + assemble

**Files:**
- Create: `src/components/explore/ExploreHeader.tsx`
- Create: `src/components/explore/ExploreHero.tsx`
- Create: `src/components/explore/CapabilityGrid.tsx`
- Create: `src/components/explore/ArchitectureDiagram.tsx`
- Create: `src/components/explore/WorkflowSteps.tsx`
- Create: `src/components/explore/ExploreFinalCta.tsx`
- Modify: `src/pages/ExploreMorePage.tsx` (full replacement)

**Source HTML reference:**
- Light: `stitch_file_reader_utility/explore_q_ops_agent_light/code.html`
- Dark: `stitch_file_reader_utility/explore_q_ops_agent_dark/code.html`

- [ ] **Step 1: Create ExploreHeader.tsx**

```tsx
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import Header from '../common/Header'

export default function ExploreHeader() {
  const navigate = useNavigate()
  return (
    <Header
      rightSlot={
        <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/')}>
          Back to login
        </Button>
      }
    />
  )
}
```

- [ ] **Step 2: Create the remaining 5 components**

Apply the same translation rule from Task 14 (Material Symbols → lucide per the mapping table; hex colors → token classes; CDN URLs verbatim). Each component is purely presentational except `ExploreFinalCta.tsx`:

```tsx
type Props = { onPrimary: () => void }   // → navigates to /
```

- [ ] **Step 3: Replace ExploreMorePage.tsx**

```tsx
import { useNavigate } from 'react-router-dom'
import ExploreHeader from '../components/explore/ExploreHeader'
import ExploreHero from '../components/explore/ExploreHero'
import CapabilityGrid from '../components/explore/CapabilityGrid'
import ArchitectureDiagram from '../components/explore/ArchitectureDiagram'
import WorkflowSteps from '../components/explore/WorkflowSteps'
import ExploreFinalCta from '../components/explore/ExploreFinalCta'

export default function ExploreMorePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <ExploreHeader />
      <main>
        <ExploreHero />
        <CapabilityGrid />
        <ArchitectureDiagram />
        <WorkflowSteps />
        <ExploreFinalCta onPrimary={() => navigate('/')} />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify + build**

Run: `npx tsc --noEmit` → PASS
Run: `npm run build` → PASS

```bash
git add src/components/explore/ src/pages/ExploreMorePage.tsx
git commit -m "feat(explore): rewrite Explore page from new design"
```

- [ ] **Step 5: Browser smoke test**

Run: `npm run dev`. Visit `http://localhost:5173/explore` directly:
- Page renders.
- Theme toggle works; choice persists.
- Click "Back to login" → navigates to `/`.
- From the login page, click "Explore More" hero CTA → returns here.
- Per FUNCTIONALITY.md §7: Get Started / Return to login → both go to `/`.

Stop dev server.

---

## Phase 3 — Cleanup

### Task 22: Delete superseded components

**Files:**
- Delete: `src/components/CapabilityCards.tsx`
- Delete: `src/components/FileDropField.tsx`
- Delete: `src/components/FinalCta.tsx`
- Delete: `src/components/Hero.tsx`
- Delete: `src/components/HeroIllustration.tsx`
- Delete: `src/components/Metrics.tsx`
- Delete: `src/components/ToastList.tsx`
- Delete: `src/components/Transformation.tsx`

- [ ] **Step 1: Confirm none of these are still imported**

Run: `npx tsc --noEmit`
Expected: PASS (the new pages reference `src/components/{login,dashboard,explore,common}/` only)

If TypeScript reports any of the doomed files as still imported, find the importer with Grep and switch it to the new equivalent before deleting.

- [ ] **Step 2: Delete the files**

Use the Bash tool:
```bash
rm src/components/CapabilityCards.tsx \
   src/components/FileDropField.tsx \
   src/components/FinalCta.tsx \
   src/components/Hero.tsx \
   src/components/HeroIllustration.tsx \
   src/components/Metrics.tsx \
   src/components/ToastList.tsx \
   src/components/Transformation.tsx
```

- [ ] **Step 3: Final compile + build**

Run: `npx tsc --noEmit` → PASS
Run: `npm run build` → PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove superseded legacy components"
```

---

### Task 23: Final cross-page smoke test

- [ ] **Step 1: Run dev server**

Run: `npm run dev`

- [ ] **Step 2: Walk every flow in both themes**

Open `http://localhost:5173/` and walk through, twice — once in light, once in dark (toggle once at the start of each pass):

1. Landing/Login (`/`):
   - Hero, Capabilities, Metrics, Transformation, LogoStrip, FinalCta sections all render.
   - Login button → modal → admin/admin → dashboard, success toast.
   - Wrong creds → inline error + error toast.
   - Forgot password flow → success toast → re-opens login on Back to Login.
2. Dashboard (`/dashboard`):
   - KB tab: enter project, attach files, submit; without backend → error toast. Reset → info toast.
   - Documents tab: select an artifact card; submit empty project → inline error. Submit valid → info toast (or error toast if backend unreachable).
3. Explore (`/explore`):
   - All sections render; CTA returns to `/`.
4. Logout → back to `/`.
5. Refresh in each location — theme persists; auth persists (so /dashboard reachable after refresh).
6. Bottom-right toasts auto-dismiss after ~4 seconds.

- [ ] **Step 3: If anything fails**

Fix inline. Re-run `npx tsc --noEmit` and `npm run build`. Commit each fix as its own commit.

- [ ] **Step 4: Final commit (if anything was fixed in step 3)**

```bash
git add -A
git commit -m "fix: smoke test follow-ups"
```

---

## Self-Review Notes

**Spec coverage check:**
- Theme tokens (light + dark per DESIGN.md): Tasks 1–4
- Both-themes-with-toggle decision: Task 2 (provider) + Task 9 (toggle) + Task 11 (header slot)
- Default light: Task 2 (`readInitialTheme` defaults to `'light'`)
- File decomposition into `{common,login,dashboard,explore}/`: Tasks 5–11, 14–21
- Stitch CDN URLs kept: Task 14 step 3 instruction
- Material Symbols → lucide mapping: Task 14 mapping table (used by Tasks 14, 15, 17–21)
- CSS variables + Tailwind tokens: Task 3
- All FUNCTIONALITY.md auth/routing/toast/KB/doc behaviors: preserved by Tasks 12 (api), 16 (login), 19 (polling hook), 20 (dashboard assembly)
- Browser smoke at end of each page: Tasks 16, 20, 21, 23

**Placeholder scan:** Each page sub-component task references the source HTML by exact path and gives the translation rule + icon mapping table. Hero/LogoStrip/Capabilities/Metrics/Transformation/FinalCta and the Explore equivalents have skeleton + rule rather than full code because they are 1:1 HTML→JSX translations of files already in the repo — re-pasting their full markup would be redundant transcription, not engineering decision-making, and the engineer working the task is reading the canonical HTML directly.

**Type consistency:** `JobStatus`, `UploadResponse`, `StatusResponse`, `KnowledgeBasePayload`, `DocumentArtifactKey`, `JobState`, `DashboardTab`, `Toast`, `ToastType` — all defined once and referenced consistently across tasks.
