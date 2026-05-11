import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bolt,
  BookOpen,
  FileText,
  LineChart,
  Moon,
  Shield,
  ShieldCheck,
  Sun,
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
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHo1jYgjhGlEuj_dPP3or7_ewNDREHmwb3Xce0eKj8AExnPYUT68ZcqvWrBtrU38gPmwiLBpxdbDz0TL1kfdhgfNWEdJxAri6Na-5hUffU9O2jqpLtIEyarQDK7ZlY4u1jSkCeSL5DvkPPRw7ZiLqYwVnpTeUdJlJg_72b5chjNvpaWVFq4G7bu1sh-98Lv_zOCpL3b8iAvH-4CeuEEvPmmjHLwKnXuQpwPUurF7Ad7cuwBselHkJCQgGKiSFCP2nl1CaWgFFtSAsK'
const artifactImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2qejnk-805HhJUsNJfoJHZHkkodK7x6af0gLxP3ae4ES_7u0-JKECrX8Yc3zn5baHJgsSo72qtOKzL3hHDqq4gSVNURI9bzAOqN5Xn5AEf3EBQlhDFoewNHCyqDB8P20H0HTeUQQYoPcJuN5ylgkuAT-JyTKUywu43_RbcSwApQS5PWjS_dcxrSFpNaH6LW9N3tjh6XjlPeq5Ci79qdYu69MNN7Fr8oZtUgLcsSmCZLWixcsd29q-gdJYnYYK-b0xr4m2FRnIJ8f2'

const logos = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAVj38RrivA7HxkNW_EmQGERLpCaHA4nwMGeW_aK8q3VYZ6shTe2d3Ny9bRnzM-7vgkDvl13uTaTXnRts-9rF_WRJKXbWl52OGo27R6G8C5H_ZE3nFYzhptsGHeZsZOv8GR56C_haCcjvwHacTRTW4aejJQmaEKkjPRh_KRNTmqfsrBECDTuMnXP1-vOWmqtAZf11lm-n0P269HN3JF0oC67VDPSDgSAuXPy8OVQ0KeSmyIQVkj8b4XQhAb0RPTMnLadW5rvzy8IPqG',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5n3-9ag9Cxm5L1HyaaTnEQWplwz4V1CkqF9HARw1GXk5ky0bhGISB-W9FoxIeGNxd8rXFGQ9fBWatTVz3EBdEeu2BsHVzYrPgDGAKZql7Od6wAE1pLVJ2lvkk1cjuwwurgskfxYsSGgO8cktWs5ht2i3w24fgPBVMotVtMEayJ8a1xqBeccqm4Q_NPYO5yNqTkwK6I6xYUtK3tHAoCL7hik-gKG3tTtX5-TK3vqLJy6tYdebeBky3zhEb0UGA-QCZfVvz_hGhsT_2',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNaDzpxsoTmbzKu_Rwsrhw_AnI_gAPNuO3MDgxrjEh-2_aOjsgQeT70Xr-gcbIl6Y_g_Fb2O2QMSDlAE7dGkUGGEdYIbhgtjCjVU9y-mGgRUCGbybvPSA6Ia0bjpGbHw1gOxrJH6nlmKQFEzFQv7lakN-jOzVfZPabQShWRUEnkoGWuUcI_SbstbgzyCqMMopHdPJ3pZAbh7rswWGZXr26GbiIQWZpFUNacNXv_Sp0BOT-_nzvZkTMxG7voAnNZjNvWGKCd_vDGCgu',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcak8DEMLkYLxwPEwZNz3AGlA7r7FBqlIrbbHweV27cYolDP-GToqSyGRLNfUGeIel92j_aj8i-QYuZBFIDrNylVdrjQOrBZoTuLDV5jTkWm6Gik2IgwMHTQH2FIe0f3uAHcBiOKp6i_5bk-KPl7cExzvWl_jgvfAL31ZcLqcemOI0vaFJEaWXovYiUYCEzUwVLdTmaGSwgcZ-Xx_6Z03OylFllRFOFWa9n2fWZi7H9rJaYCEL0VxR9DkMfRUl6AVjCwYjsRxL6lKt',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBe2wkVeGqCM_R229Axt1z7SDLBER4qvGHy_OHcvXk_zrKMRieYEAVcY4211OwuPBK4GWEB9bgFpfKSAVpK5xLbgO6UlUn5HFuxiC3ZuVcYgDqe4vL6yd849oUIGbYYqhoAP3E4mVGLTX3SPb4OG_UeLXMlvWl9xy7REp5AiOXYArDKH5ZIDrMpyHDfKYfH3tWcZD9HAobRuNAecR-s4FgER9bduwAXlN26KiJAOEFepVyYMYooWH_1Pw0yFK-zdvqoARRRf6lzHAyp',
]

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-variant">Welcome back, QA lead.</p>
            <h2 className="text-2xl font-semibold tracking-tight text-on-surface">Login to Q-Ops Agent</h2>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant transition-colors hover:text-on-surface" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</label>
              <input
                id="login-email"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="********"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error ? <p className="pt-1 text-xs font-medium text-error">{error}</p> : null}
          </div>
          <div className="text-center text-xs">
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
          <button disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface-variant">No worries!</p>
            <h2 className="text-lg font-semibold text-on-surface">Reset Your Password</h2>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-6 text-sm leading-5 text-on-surface-variant">Enter your email address and we'll send you instructions to reset your password.</p>
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-1">
            <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email Address</label>
            <input
              id="forgot-email"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="your.email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={onBack} className="w-full text-center text-sm text-on-surface-variant hover:text-primary">
            Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage({ onSuccess, addToast, authReady = true }: Props) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [showLogin, setShowLogin] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [infoModal, setInfoModal] = useState<'docs' | 'privacy' | 'terms' | 'status' | null>(null)

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
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-base font-bold text-on-primary">Q</div>
          <span className="font-display text-base font-black tracking-tight text-on-surface sm:text-lg">Q-Ops Agent</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={toggle} className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button onClick={() => setShowLogin(true)} disabled={!authReady} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {authReady ? 'Login' : 'Checking session'}
          </button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-surface-container-lowest px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Bolt className="h-3.5 w-3.5" /> AI-Powered
              </span>
              <h1 className="font-display text-4xl font-black leading-tight tracking-tight text-on-surface sm:text-5xl lg:text-[56px] lg:leading-[64px]">
                Build QA That Starts <br className="hidden sm:block" />
                <span className="text-primary">Before Code Exists</span>.
              </h1>
              <p className="max-w-xl text-base leading-6 text-on-surface-variant">
                Transform requirements, designs, and conversations into a complete QA foundation instantly.
              </p>
              <p className="max-w-xl text-lg font-bold text-on-surface">Q-Ops Agent doesn't assist QA. It builds it.</p>
              <p className="max-w-xl text-sm text-on-surface-variant">From scattered artifacts to structured QA ready in minutes.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => navigate('/explore')} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-all hover:shadow-lg sm:px-8">
                  Explore More
                </button>
                <button onClick={() => setShowLogin(true)} className="rounded-xl border border-outline px-6 py-3 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high sm:px-8">
                  Login to Dashboard
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <img src={heroImage} alt="Modern enterprise dashboard interface" className="relative z-10 aspect-video w-full rounded-xl border border-outline-variant object-cover shadow-2xl" />
            </div>
          </div>
        </section>

        <section className="border-y border-outline-variant bg-surface-container-lowest py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-60">
              Trusted by innovative engineering teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 grayscale sm:gap-12">
              {logos.map((src) => (
                <img key={src} src={src} alt="Corporate partner logo" className="h-6 object-contain sm:h-8" />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center sm:mb-12">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-on-surface">Core Capabilities</h2>
              <p className="mt-2 text-base text-on-surface-variant">Purpose-built features that integrate into QA workflows and accelerate delivery.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3 md:gap-6">
              <div className="rounded-xl border border-primary bg-surface-container-lowest p-8 md:col-span-2 md:p-10">
                <div className="flex h-full flex-col justify-between gap-6">
                  <div>
                    <FileText className="mb-5 h-12 w-12 rounded-lg bg-primary/10 p-3 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold text-on-surface">AI Test Strategy & Planning</h3>
                    <p className="mb-5 text-sm leading-5 text-on-surface-variant">
                      Generate detailed test strategies and plans using semantic analysis of requirements.
                    </p>
                  </div>
                  <img src={artifactImage} alt="Document generation interface" className="h-40 w-full rounded-lg border border-outline-variant object-cover shadow-sm sm:h-48" />
                </div>
              </div>
              <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center md:p-10">
                <LineChart className="mx-auto mb-5 h-12 w-12 rounded-lg bg-primary/10 p-3 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-on-surface">Automated Risk Analysis</h3>
                <p className="text-sm leading-5 text-on-surface-variant">Identify and prioritize risks automatically across all project artifacts.</p>
                <div className="mt-auto pt-6">
                  <div className="flex h-28 items-end justify-between rounded border border-dashed border-outline-variant bg-surface-container-low px-4 pb-2 sm:h-32 sm:px-6 sm:pb-3">
                    <div className="h-[40%] w-3 rounded-t-sm bg-primary sm:w-4" />
                    <div className="h-[60%] w-3 rounded-t-sm bg-primary sm:w-4" />
                    <div className="h-[50%] w-3 rounded-t-sm bg-primary sm:w-4" />
                    <div className="h-[85%] w-3 rounded-t-sm bg-primary sm:w-4" />
                  </div>
                </div>
              </div>
              {[
                [BookOpen, 'Intelligent Knowledge Base', 'Build searchable knowledge bases with vector embeddings for contextual QA insights.'],
                [Workflow, 'JIRA-Ready Artifacts', 'Create production-ready epics, user stories, and test cases ready for development.'],
                [Shield, 'Enterprise Security', 'Your data is protected with enterprise-grade privacy controls.'],
              ].map(([Icon, title, text]) => {
                const TypedIcon = Icon as typeof BookOpen
                return (
                  <div key={title as string} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 md:p-10">
                    <TypedIcon className="mb-5 h-12 w-12 rounded-lg bg-primary/10 p-3 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold text-on-surface">{title as string}</h3>
                    <p className="text-sm leading-5 text-on-surface-variant">{text as string}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-12 text-on-primary sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 text-center md:grid-cols-3 md:gap-12">
            {[
              ['75%', 'Reduction in QA planning time'],
              ['40%', 'Improvement in test coverage'],
              ['50+', 'Hours saved per project'],
            ].map(([value, label]) => (
              <div key={label} className="space-y-2">
                <div className="font-display text-5xl font-black leading-none tracking-tight sm:text-[64px]">{value}</div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-primary/80">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-outline-variant bg-surface-container-low px-4 py-6 sm:px-6 sm:py-8">
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
            <div className="relative overflow-hidden rounded-xl bg-[#1b1b24] p-8 text-center text-white sm:p-12 md:p-16">
              <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
              <div className="relative z-10 space-y-5">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Start shipping reliable tests faster</h2>
                <p className="mx-auto max-w-xl text-base text-white/70">Join teams that reduced manual QA effort and improved confidence.</p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button onClick={() => navigate('/explore')} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-transform hover:scale-105 sm:px-8">
                    Explore Q-Ops Agent
                  </button>
                  <button onClick={() => setInfoModal('docs')} className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 sm:px-8">
                    Documentation
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
          <button onClick={() => setInfoModal('docs')} className="hover:text-on-surface">Documentation</button>
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

function InfoModal({ kind, onClose }: { kind: 'docs' | 'privacy' | 'terms' | 'status' | null; onClose: () => void }) {
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
    docs: {
      title: 'Documentation',
      rows: [
        ['Create a project', 'Open the dashboard, use New Project, then upload BRD, FRD, HLD, LLD, transcripts, and UI designs.'],
        ['Build a knowledge base', 'Artifacts are submitted to the n8n upload webhook and tracked as a long-running job.'],
        ['Generate QA outputs', 'Choose test strategy, test plan, risk matrix, test cases, traceability matrix, or Jira-ready epics and stories.'],
        ['Troubleshoot backend', 'Confirm the local n8n backend is running at http://localhost:5678 and the webhooks are active.'],
      ],
    },
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">{content.title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {content.rows.map(([title, text]) => (
            <section key={title} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <h3 className="font-semibold text-on-surface">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{text}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
