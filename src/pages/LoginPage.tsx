import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bolt,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  LineChart,
  Moon,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sun,
  UploadCloud,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { requestPasswordReset } from '../lib/auth'

type Props = {
  onSuccess: (email: string, password: string) => Promise<void>
  addToast: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' }) => void
  authReady?: boolean
}

const heroImage =
  '/assets/qops-hero-application-composite.svg'
const artifactImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2qejnk-805HhJUsNJfoJHZHkkodK7x6af0gLxP3ae4ES_7u0-JKECrX8Yc3zn5baHJgsSo72qtOKzL3hHDqq4gSVNURI9bzAOqN5Xn5AEf3EBQlhDFoewNHCyqDB8P20H0HTeUQQYoPcJuN5ylgkuAT-JyTKUywu43_RbcSwApQS5PWjS_dcxrSFpNaH6LW9N3tjh6XjlPeq5Ci79qdYu69MNN7Fr8oZtUgLcsSmCZLWixcsd29q-gdJYnYYK-b0xr4m2FRnIJ8f2'

function LoginModal({
  open,
  onClose,
  onSubmit,
  onForgot,
  onStatus,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (email: string, password: string) => Promise<boolean>
  onForgot: () => void
  onStatus: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [helper, setHelper] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    const ok = await onSubmit(email, password)
    setSubmitting(false)
    if (ok) {
      setEmail('')
      setPassword('')
      setError('')
      setHelper('')
    } else {
      setError('Unable to sign in with those credentials.')
    }
  }

  const fillDemoAccess = () => {
    setEmail('admin@qops.local')
    setPassword('')
    setError('')
    setHelper('Use the Supabase Auth password for this admin account.')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/55 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Welcome back, QA lead.</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-on-surface">Login to Q-Ops Agent</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>
        <form className="space-y-5 px-6 py-6 sm:px-8" onSubmit={submit}>
          <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</label>
              <input
                id="login-email"
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15"
                placeholder="admin@qops.local"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password</label>
              <button type="button" onClick={onForgot} className="text-xs font-semibold text-primary hover:underline">
                Forgot your password?
              </button>
            </div>
            <input
              id="login-password"
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15"
              placeholder="********"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <p className="pt-1 text-xs font-medium text-error">{error}</p> : null}
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-center text-xs">
            <p className="text-on-surface-variant">
              Having trouble?{' '}
              <button type="button" onClick={fillDemoAccess} className="font-semibold text-primary hover:underline">
                Fill admin email
              </button>
            </p>
            {helper ? <p className="mt-1 font-medium text-primary">{helper}</p> : null}
            <button type="button" onClick={onStatus} className="mt-1 inline-flex items-center gap-1.5 text-success hover:underline">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> All systems operational
            </button>
          </div>
          <button disabled={submitting} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-on-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none">
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ForgotModal({
  open,
  onClose,
  onSubmit,
  onBack,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (email: string) => Promise<void>
  onBack: () => void
}) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(email.trim())
      setEmail('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/55 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">No worries!</p>
            <h2 className="mt-1 text-lg font-bold text-on-surface">Reset Your Password</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>
        <div className="px-6 py-6 sm:px-8">
        <p className="mb-6 text-sm leading-5 text-on-surface-variant">Enter your email address and we'll send you instructions to reset your password.</p>
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email Address</label>
            <input
              id="forgot-email"
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15"
              placeholder="your.email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button disabled={submitting} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-on-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none">
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={onBack} className="w-full text-center text-sm text-on-surface-variant hover:text-primary">
            Back to Login
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage({ onSuccess, addToast, authReady = true }: Props) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [showLogin, setShowLogin] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [infoModal, setInfoModal] = useState<'privacy' | 'terms' | 'status' | null>(null)
  const workflow = [
    [UploadCloud, 'Ingest source artifacts', 'Upload project evidence and let Q-Ops extract text, visuals, tables, warnings, and metrics.'],
    [Database, 'Build project knowledge', 'Store project-scoped chunks and retrieval metadata so generated outputs are grounded.'],
    [FileText, 'Generate QA deliverables', 'Create strategies, plans, risk matrices, Jira backlog, story test cases, and RTM outputs.'],
    [ScanSearch, 'Review coverage', 'Resolve coverage warnings, stale updates, retry-ready work, and readiness blockers.'],
  ] as const
  const valueCards = [
    [FileText, 'From artifacts to outputs', 'Generate Confluence-ready QA documents and Jira-ready backlog items from the same source context.'],
    [LineChart, 'Operational intelligence', 'Measure throughput, cost, failures, active work, and recovered jobs across projects.'],
    [Shield, 'Governed by design', 'Keep project access, integration settings, audit trails, and service credentials controlled.'],
    [Workflow, 'Update-aware workflows', 'Detect when a Knowledge Base or upstream Jira output changed and guide users to update only what needs refresh.'],
  ] as const
  const elevatedCard = 'transition-all duration-200 hover:-translate-y-1 hover:border-primary/45 hover:bg-surface-container-lowest hover:shadow-xl hover:shadow-primary/10'
  const metricCard = 'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-container-lowest hover:shadow-lg hover:shadow-primary/10'
  const softCard = 'bg-surface-container-lowest shadow-sm'
  const sectionShell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

  const handleLogin = async (email: string, password: string) => {
    try {
      await onSuccess(email.trim(), password)
      addToast({ title: 'Welcome back', message: 'You have successfully logged in.', type: 'success' })
      setShowLogin(false)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please check your Supabase Auth credentials.'
      addToast({ title: 'Authentication failed', message, type: 'error' })
      return false
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/90 px-4 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-black text-on-primary shadow-sm shadow-primary/25">Q</div>
            <div>
              <span className="block font-display text-base font-black tracking-tight text-on-surface sm:text-lg">Q-Ops Agent</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant sm:block">AI quality operations</span>
            </div>
          </button>
          <nav className="hidden items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-1 text-sm font-semibold text-on-surface-variant lg:flex">
            <a href="#outcomes" className="rounded-md px-3 py-1.5 transition hover:bg-surface-container-lowest hover:text-primary">Outcomes</a>
            <a href="#workflow" className="rounded-md px-3 py-1.5 transition hover:bg-surface-container-lowest hover:text-primary">Workflow</a>
            <a href="#capabilities" className="rounded-md px-3 py-1.5 transition hover:bg-surface-container-lowest hover:text-primary">Capabilities</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={toggle} className="rounded-lg border border-outline-variant bg-surface-container-low p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => setShowLogin(true)} disabled={!authReady} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none">
              {authReady ? 'Login' : 'Checking session'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-outline-variant bg-surface-container-lowest">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_34%),linear-gradient(180deg,color-mix(in_srgb,var(--surface-container-low)_88%,transparent),var(--surface))]" />
          <div className={`${sectionShell} relative grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:py-14`}>
            <div className="max-w-[40rem]">
              <span className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm">
                <Bolt className="h-3.5 w-3.5" /> AI-powered QA operations
              </span>
              <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-tight text-on-surface sm:text-6xl">Q-Ops Agent</h1>
              <p className="mt-5 max-w-xl text-xl font-semibold leading-8 text-on-surface sm:text-2xl">Turn project evidence into governed QA deliverables, Jira backlog, test coverage, and operational insight.</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-on-surface-variant sm:text-base">
                Built for QA leaders, product owners, delivery teams, and workspace admins who need traceable coverage from requirements to tests without losing control of cost, state, or source context.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => setShowLogin(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25">
                  Login to workspace <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm font-bold text-on-surface shadow-sm transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-container-low">
                  Explore More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[1.25rem] border border-primary/10 bg-primary/5 blur-2xl" />
              <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-2xl shadow-primary/10">
                <img src={heroImage} alt="Q-Ops operations dashboard" className="aspect-[16/11] w-full rounded-lg border border-outline-variant bg-surface-container-low object-contain" />
              </div>
            </div>
          </div>
        </section>

        <section id="outcomes" className="border-y border-outline-variant bg-surface py-6">
          <div className={sectionShell}>
            <div className="grid gap-4 text-center sm:grid-cols-3">
              {[
                ['75%', 'less QA planning time'],
                ['40%', 'coverage improvement'],
                ['50+', 'hours saved per project'],
              ].map(([value, label]) => (
                <div key={label} className={`rounded-lg border border-outline-variant bg-surface-container-lowest p-5 ${metricCard}`}>
                  <p className="text-3xl font-black text-on-surface">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-surface-container-low px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operating workflow</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-on-surface">One system from source context to delivery confidence</h2>
              </div>
              <button onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-bold shadow-sm hover:border-primary/45 hover:bg-surface-container">
                Explore platform <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map(([Icon, title, detail], index) => (
                <article key={title} className={`group relative rounded-lg border border-outline-variant ${softCard} p-5 ${elevatedCard}`}>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm shadow-primary/20 transition-transform duration-200 group-hover:scale-105"><Icon className="h-5 w-5" /></span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wide text-primary">Step {index + 1}</p>
                  <h3 className="mt-1 text-lg font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="capabilities" className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
            <div className={`rounded-lg border border-outline-variant ${softCard} p-6 ${elevatedCard}`}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">What teams get</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-on-surface">QA output generation with review, freshness, and cost controls built in.</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Q-Ops helps teams move from project evidence to structured QA artifacts while preserving visibility into quality gates and operational spend.</p>
              <img src={artifactImage} alt="Generated QA document interface" className="mt-6 aspect-video w-full rounded-lg border border-outline-variant object-cover shadow-lg shadow-primary/10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {valueCards.map(([Icon, title, detail]) => (
                <article key={title} className={`group rounded-lg border border-outline-variant ${softCard} p-5 ${elevatedCard}`}>
                  <Icon className="h-10 w-10 rounded-lg bg-primary/10 p-2.5 text-primary transition-transform duration-200 group-hover:scale-105" />
                  <h3 className="mt-4 text-base font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(18rem,0.35fr)]">
              <div className={`rounded-lg border border-outline-variant ${softCard} p-6 ${elevatedCard}`}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Generated outputs</p>
                <h2 className="mt-2 text-2xl font-bold text-on-surface">Built for the artifacts delivery teams actually use</h2>
                <div className="mt-6 overflow-hidden rounded-lg border border-outline-variant">
                  {[
                    ['Confluence', 'Test Strategy, Test Plan, Risk Matrix, RTM'],
                    ['Jira', 'Epics, User Stories, Story Test Cases'],
                    ['Dashboard', 'Readiness, coverage review, stale updates, retries'],
                    ['Analytics', 'Cost, token usage, throughput, failure spend'],
                  ].map(([destination, output]) => (
                    <div key={destination} className="grid gap-2 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 transition-colors hover:bg-primary/5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)]">
                      <p className="font-bold text-on-surface">{destination}</p>
                      <p className="text-sm leading-6 text-on-surface-variant">{output}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-lg border border-outline-variant ${softCard} p-6 ${elevatedCard}`}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-success">For every role</p>
                <div className="mt-5 space-y-3">
                  {[
                    [Users, 'QA and product teams align on coverage.'],
                    [Gauge, 'Delivery leads see reliability and cost.'],
                    [ShieldCheck, 'Admins control access and integrations.'],
                    [CheckCircle2, 'Reviewers know what needs sign-off.'],
                  ].map(([Icon, text]) => {
                    const TypedIcon = Icon as typeof Users
                    return (
                      <div key={text as string} className="flex items-start gap-3 rounded-lg border border-transparent bg-surface-container-low p-3 transition-all duration-200 hover:border-success/30 hover:bg-success/5 hover:shadow-sm">
                        <TypedIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <p className="text-sm leading-6 text-on-surface-variant">{text as string}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-outline-variant bg-surface px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3 text-center md:text-left">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-on-surface-variant" />
              <p className="text-sm italic text-on-surface-variant">"Q-Ops Agent adheres to the highest industry standards for data privacy and security."</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-60 md:gap-8">
              <span>SOC2 Compliant</span>
              <span>GDPR Ready</span>
              <span>HIPAA Eligible</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-[#1b1b24] p-8 text-center text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 sm:p-12 md:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(173,198,255,0.24),transparent_34%)]" />
              <div className="relative z-10 space-y-5">
                <h2 className="font-display text-3xl font-bold tracking-tight">Start with one project. Scale to every QA delivery stream.</h2>
                <p className="mx-auto max-w-2xl text-base leading-7 text-white/70">Login to run Q-Ops against your assigned projects, or explore the platform story before entering the workspace.</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button onClick={() => setShowLogin(true)} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary transition hover:opacity-90 sm:px-8">
                    Login to workspace
                  </button>
                  <button onClick={() => navigate('/explore')} className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20 sm:px-8">
                    Explore Q-Ops Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full flex-col items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-6 text-xs text-on-surface-variant sm:flex-row sm:py-8">
        <div>&copy; 2024 Q-Ops Agent. AI-Powered Enterprise Solutions.</div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <button onClick={() => setInfoModal('privacy')} className="hover:text-on-surface">Privacy Policy</button>
          <button onClick={() => setInfoModal('terms')} className="hover:text-on-surface">Terms of Service</button>
          <button onClick={() => setInfoModal('status')} className="hover:text-on-surface">System Status</button>
        </div>
      </footer>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSubmit={handleLogin}
        onForgot={() => {
          setShowLogin(false)
          setShowForgot(true)
        }}
        onStatus={() => setInfoModal('status')}
      />
      <ForgotModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        onSubmit={async (email) => {
          try {
            await requestPasswordReset(email, `${window.location.origin}/auth/callback`)
            addToast({ title: 'Password reset email sent', message: `Check your email at ${email} for password reset instructions.`, type: 'success' })
            setShowForgot(false)
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to send password reset email.'
            addToast({ title: 'Password reset failed', message, type: 'error' })
          }
        }}
        onBack={() => {
          setShowForgot(false)
          setShowLogin(true)
        }}
      />
      <InfoModal kind={infoModal} onClose={() => setInfoModal(null)} />
    </div>
  )
}

function InfoModal({ kind, onClose }: { kind: 'privacy' | 'terms' | 'status' | null; onClose: () => void }) {
  useEffect(() => {
    if (!kind) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [kind, onClose])

  if (!kind) return null

  const content = {
    privacy: {
      title: 'Privacy Policy',
      rows: [
        ['Uploaded data', 'Project artifacts are sent only to the configured backend for QA processing.'],
        ['Storage and retention', 'This demo UI stores local project metadata in browser storage. Backend retention depends on your n8n/Supabase setup.'],
        ['Model training', 'Production policy language should be reviewed before external release.'],
        ['User controls', 'Users can clear local browser storage or update backend settings in the dashboard.'],
      ],
    },
    terms: {
      title: 'Terms of Service',
      rows: [
        ['Authentication', 'Dashboard access uses Supabase Auth and Q-Ops role records.'],
        ['Backend dependency', 'Knowledge ingestion and document generation require the configured n8n backend.'],
        ['Acceptable use', 'Use the tool for authorized QA planning and project documentation workflows.'],
        ['Review required', 'Legal terms should be reviewed before production or customer use.'],
      ],
    },
    status: {
      title: 'System Status',
      rows: [
        ['Frontend', 'Operational. The React application is loaded.'],
        ['n8n backend', 'Configured by default at http://localhost:5678. Use dashboard Settings to change it.'],
        ['Upload webhook', '/webhook/upload-test-artifacts'],
        ['Document generation webhook', '/webhook/generate-qa-doc'],
      ],
    },
  }[kind]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-inverse-surface/55 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="max-h-dvh w-full max-w-2xl overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">{content.title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {content.rows.map(([title, text]) => (
            <section key={title} className="rounded-lg border border-outline-variant bg-surface-container-low p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-md hover:shadow-primary/10">
              <h3 className="font-semibold text-on-surface">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
