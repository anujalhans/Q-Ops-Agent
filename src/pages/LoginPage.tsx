import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Brain, BarChart, Target } from 'lucide-react'
import Hero from '../components/Hero'
import Transformation from '../components/Transformation'
import CapabilityCards from '../components/CapabilityCards'
import Metrics from '../components/Metrics'
import FinalCta from '../components/FinalCta'

type LoginPageProps = {
  onSuccess: () => void
  addToast: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' }) => void
}

const LoginPage = ({ onSuccess, addToast }: LoginPageProps) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (username.trim() === 'admin' && password === 'admin') {
      onSuccess()
      addToast({ title: 'Welcome back', message: 'You have successfully logged in.', type: 'success' })
      setError('')
      setShowLoginModal(false)
      return
    }

    setError('Invalid username or password.')
    addToast({ title: 'Authentication failed', message: 'Please use admin/admin to continue.', type: 'error' })
  }

  const handleForgotPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (forgotEmail.trim()) {
      addToast({ title: 'Password reset email sent', message: `Check your email at ${forgotEmail} for password reset instructions.`, type: 'success' })
      setForgotEmail('')
      setShowForgotPassword(false)
    }
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showLoginModal) setShowLoginModal(false)
        if (showForgotPassword) setShowForgotPassword(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [showLoginModal, showForgotPassword])

  return (
    <main className="min-h-screen bg-surface px-6 py-10 sm:px-10">
      {/* HEADER SEPARATOR */}
      <div className="mx-auto max-w-7xl mb-12">
        <div className="flex items-center justify-between rounded-[2rem] border border-slate-700 bg-black p-8 shadow-glow">
          {/* LEFT: Brand Name */}
          <div className="flex items-center gap-4 text-brand">
            <div className="rounded-3xl bg-brand/20 p-3 text-3xl font-bold shadow-lg">Q</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">Q-Ops Agent</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-brand/10 text-brand border border-brand/20">
                  AI-Powered
                </span>
              </div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">A Purpose-Built AI System for QA Engineering</p>
            </div>
          </div>

          {/* RIGHT: Login Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center justify-center px-6 py-2 bg-brand text-slate-950 font-semibold rounded-lg hover:bg-brand/90 transition-colors whitespace-nowrap"
          >
            Login
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - FULL WIDTH */}
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2rem] bg-gradient-to-br from-surface2 to-surface p-12 shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-800/20"></div>
          <div className="relative">
            <div className="mb-12">
              <Hero onExplore={() => navigate('/explore')} />
            </div>

            {/* NEW: Capabilities container placed below the Hero (visual match to Hero) */}
            <div className="mb-12">
              <section
                className="rounded-[2rem] p-10 md:p-12 shadow-glow relative overflow-hidden"
                style={{ backgroundColor: 'rgba(2,6,10,0.55)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-slate-800/20 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto">
                  <div className="text-left mb-6">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">Core Capabilities</h2>
                    <p className="text-lg text-slate-300 mb-6 max-w-2xl">Purpose-built features that integrate into QA workflows and accelerate delivery.</p>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                    {[
                      { icon: Brain, title: 'AI Test Strategy & Planning', desc: 'Generate detailed test strategies and plans using semantic analysis of requirements' },
                      { icon: FileText, title: 'Intelligent Knowledge Base', desc: 'Build searchable knowledge bases with vector embeddings for contextual QA insights' },
                      { icon: BarChart, title: 'Automated Risk Analysis', desc: 'Identify and prioritize risks automatically across all project artifacts' },
                      { icon: Target, title: 'JIRA-Ready Artifacts', desc: 'Create production-ready epics, user stories, and test cases ready for development' },
                    ].map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <div key={index} className="flex gap-4 items-start rounded-2xl p-6 bg-slate-800/30 backdrop-blur-sm border-2 border-brand/30 shadow-sm hover:shadow-lg transform transition hover:-translate-y-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-brand" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold text-white">{item.title}</h3>
                            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            </div>

            <Transformation />

            <CapabilityCards />
            <Metrics />
            <FinalCta onPrimary={() => navigate('/explore')} />

            {/* Core Capabilities moved above, container removed from here */}

            {/* Removed: Value proposition, How It Works, See AI in Action, and Proof/Impact as requested */}

            {/* OUR TRUSTED PARTNERS */}
            <div className="mb-12">
              <section className="rounded-[2rem] p-8 md:p-10 shadow-glow relative overflow-hidden" style={{ backgroundColor: 'rgba(2,6,10,0.55)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-slate-800/20 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto">
                  <div className="text-left mb-6">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">Our Trusted Partners</h2>
                    <p className="text-lg text-slate-300 mb-6">Trusted by QA teams and engineering organizations</p>
                  </div>

                  <style>{`
                    @keyframes qops-marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
                    .qops-marquee-track { display: flex; gap: 2.5rem; align-items: center; }
                    .qops-marquee { overflow: hidden; }
                    .qops-marquee-inner { display:flex; gap:2.5rem; animation: qops-marquee 20s linear infinite; }
                  `}</style>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 qops-marquee">
                      <div className="qops-marquee-inner">
                        <div className="qops-marquee-track">
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-lg">TechCorp</div>
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center text-white font-bold shadow-lg">Innovate</div>
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold shadow-lg">DevOps Inc</div>
                          <div className="w-32 h-10 rounded bg-slate-700/60 flex items-center justify-center text-white font-medium shadow">Partner X</div>
                          {/* duplicate for seamless loop */}
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-lg">TechCorp</div>
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center text-white font-bold shadow-lg">Innovate</div>
                          <div className="w-32 h-10 rounded bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold shadow-lg">DevOps Inc</div>
                          <div className="w-32 h-10 rounded bg-slate-700/60 flex items-center justify-center text-white font-medium shadow">Partner X</div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-brand/10 text-brand border border-brand/20">500+ Test Artifacts Generated</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* SECURITY & DATA PRIVACY NOTE (centered container) */}
            <div className="mb-12">
              <section
                className="mx-auto max-w-7xl rounded-[2rem] p-8 md:p-10 shadow-glow relative overflow-hidden"
                style={{ backgroundColor: 'rgba(2,6,10,0.55)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-slate-800/20 pointer-events-none" />
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface3/40 text-white text-lg mx-auto mb-4">🔒</div>
                  <div className="text-2xl font-semibold text-white">Enterprise-grade security</div>
                  <div className="text-sm text-slate-300 mt-1">Your data is never used for model training.</div>
                </div>
              </section>
            </div>

            {/* FORGOT PASSWORD LINK (removed) */}
          </div>
        </section>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />

          <div className="relative max-w-md w-full bg-surface2 rounded-[2rem] shadow-2xl border border-border animate-in fade-in-0 zoom-in-95 duration-300 p-8">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 hover:bg-surface3 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-brand/10 p-2 text-brand text-xl">🔐</div>
                <p className="text-sm text-slate-400">Welcome back, QA lead.</p>
              </div>
              <h2 className="text-2xl font-semibold text-white">Login to Q-Ops Agent</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 flex items-center gap-2">
                  <span>👤</span> Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-3xl border border-border bg-surface3 px-4 py-3 text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 flex items-center gap-2">
                  <span>🔒</span> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-3xl border border-border bg-surface3 px-4 py-3 text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {error ? <p className="text-sm text-rose-400 flex items-center gap-2"><span>⚠️</span> {error}</p> : null}

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500">Having trouble? Try demo access</p>
                <p className="text-xs text-green-400">All systems operational</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setShowForgotPassword(true)
                }}
                className="text-sm text-brand hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForgotPassword(false)}
          />

          <div className="relative max-w-md w-full bg-surface2 rounded-[2rem] shadow-2xl border border-border animate-in fade-in-0 zoom-in-95 duration-300 p-8">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 hover:bg-surface3 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-brand/10 p-2 text-brand text-xl">🔑</div>
                <p className="text-sm text-slate-400">No worries!</p>
              </div>
              <h2 className="text-2xl font-semibold text-white">Reset Your Password</h2>
              <p className="text-sm text-slate-400 mt-2">Enter your email address and we'll send you instructions to reset your password.</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200 flex items-center gap-2">
                  <span>📧</span> Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-3xl border border-border bg-surface3 px-4 py-3 text-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 hover:shadow-lg"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setShowLoginModal(true)
                }}
                className="text-sm text-brand hover:underline transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default LoginPage
