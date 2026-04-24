import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Layers,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GitBranch,
  ClipboardList,
  FileText,
  Zap,
  Box,
  Link2,
  Shield,
} from 'lucide-react'

const featureCards = [
  {
    icon: FileText,
    title: 'Test Strategy Generation',
    desc: 'AI drafts high-level strategies that align with requirements and risk coverage.',
  },
  {
    icon: ClipboardList,
    title: 'Test Plan Creation',
    desc: 'Build execution-ready test plans with scope, cycles, and exit criteria.',
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    desc: 'Highlight product, integration, and security risk areas automatically.',
  },
  {
    icon: Layers,
    title: 'Traceability Matrix',
    desc: 'Create RTM artifacts linking requirements to tests and coverage.',
  },
  {
    icon: Sparkles,
    title: 'Test Case Generation',
    desc: 'Generate structured, reusable test cases from project artifacts.',
  },
  {
    icon: GitBranch,
    title: 'Epics & User Stories',
    desc: 'Produce production-ready backlog items with QA context built in.',
  },
]

const comparisonRows = [
  { label: 'Document Understanding', standard: 'Yes', qops: 'Yes' },
  { label: 'Contextual Q&A', standard: 'Yes', qops: 'Yes' },
  { label: 'Multi-Artifact Correlation', standard: 'Limited', qops: 'Yes' },
  { label: 'QA-Specific Intelligence', standard: 'No', qops: 'Yes' },
  { label: 'Structured Output Generation', standard: 'Limited', qops: 'Yes' },
  { label: 'Test Strategy & Planning Depth', standard: 'Limited', qops: 'Yes' },
  { label: 'Risk Identification & Prioritization', standard: 'Limited', qops: 'Yes' },
  { label: 'Traceability (Req → Test → Defect)', standard: 'No', qops: 'Yes' },
  { label: 'Consistency Across Outputs', standard: 'No', qops: 'Yes' },
  { label: 'Reusability of Artifacts', standard: 'No', qops: 'Yes' },
  { label: 'Workflow-Driven Execution', standard: 'No', qops: 'Yes' },
  { label: 'QA Lifecycle Integration', standard: 'Limited', qops: 'Yes' },
  { label: 'Handling Unstructured Inputs', standard: 'Limited', qops: 'Yes' },
  { label: 'JIRA-Ready Output Formatting', standard: 'No', qops: 'Yes' },
  { label: 'Coverage Awareness (Functional/Risk)', standard: 'No', qops: 'Yes' },
  { label: 'Iterative Refinement (Feedback Loops)', standard: 'Limited', qops: 'Yes' },
  { label: 'Scalability Across Projects', standard: 'Limited', qops: 'Yes' },
  { label: 'Production-Ready Deliverables', standard: 'No', qops: 'Yes' },
]

// Primary (condensed) rows to show initially
const primaryRowLabels = [
  'QA-Specific Intelligence',
  'Multi-Artifact Correlation',
  'Structured Output Generation',
  'Workflow-Driven Execution',
  'Traceability (Req → Test → Defect)',
  'Production-Ready Deliverables',
]

const primaryRows = comparisonRows.filter(r => primaryRowLabels.includes(r.label))
const secondaryRows = comparisonRows.filter(r => !primaryRowLabels.includes(r.label))

const advantages = [
  {
    title: 'Built for QA Engineering',
    desc: 'Purpose-built workflows designed around requirements, risk, and test execution.',
    icon: ShieldCheck,
  },
  {
    title: 'Structured, Not Ad-Hoc',
    desc: 'Deliver artifacts with consistent format, traceability, and auditability.',
    icon: ClipboardList,
  },
  {
    title: 'End-to-End Automation',
    desc: 'Move from knowledge ingestion to QA outputs without manual translation.',
    icon: Zap,
  },
  {
    title: 'Context-Aware Intelligence',
    desc: 'AI understands your project artefacts, not just one-off prompts.',
    icon: Database,
  },
  {
    title: 'Scalable & Repeatable',
    desc: 'Use the same workflow across projects and teams with consistent results.',
    icon: Box,
  },
]

const ExploreMorePage = () => {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) setIsModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isModalOpen])

  const rowsToRender = isExpanded ? comparisonRows : primaryRows

  return (
    <main className="min-h-screen bg-surface px-6 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-7xl space-y-16">
        <section className="rounded-[2rem] border border-brand/20 bg-surface2/80 p-10 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-brand">
                AI-Powered QA Platform
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                From Requirements to QA Intelligence
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">
                Q-Ops Agent transforms project artifacts into structured, production-ready QA outputs using AI.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 shadow-lg shadow-brand/20"
            >
              Back to login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        

        <section className="rounded-[2rem] border border-slate-700 bg-surface2/90 p-8 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand">How Q-Ops Agent Works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">End-to-end QA flow with clarity</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Box,
                title: 'Ingest Artifacts',
                desc: 'BRD, FRD, HLD, UI, transcripts are centralized into a single QA knowledge source.',
              },
              {
                icon: Database,
                title: 'Build Knowledge Base',
                desc: 'Vector embeddings and semantic understanding create contextual QA intelligence.',
              },
              {
                icon: ClipboardList,
                title: 'Generate QA Outputs',
                desc: 'Produce strategy, plans, RTM, risk, test cases, and epics in one flow.',
              },
            ].map((step, index) => (
              <div key={index} className="relative overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand/10 text-brand shadow-inner">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-slate-400">{step.desc}</p>
                {index < 2 ? (
                  <div className="pointer-events-none absolute right-6 top-1/2 hidden h-16 w-16 translate-y-[-50%] items-center justify-center text-brand/50 lg:flex">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3 rounded-[2rem] border border-slate-700 bg-surface2/90 p-8 shadow-glow">
            <p className="text-sm uppercase tracking-[0.35em] text-brand">AI-Powered QA Capabilities</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Capabilities built for QA teams</h2>
            <p className="mt-3 max-w-3xl text-slate-400">One platform that unifies knowledge ingestion, QA artifact generation, and traceability into a consistent workflow.</p>
          </div>

          {featureCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-[1.75rem] border border-slate-700 bg-slate-950/50 p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-300 shadow-inner">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-slate-400">{card.desc}</p>
              </div>
            )
          })}
        </section>

        <section className="rounded-[2rem] border border-slate-700 bg-surface2/90 p-8 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand">Q-Ops Agent vs Standard AI Tools</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">The differentiation is clear</h2>
            </div>
          </div>
          <div className="mt-8 overflow-x-auto rounded-[1.75rem] border border-slate-700 bg-slate-950/60">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400">
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4">Standard AI Agents</th>
                  <th className="px-6 py-4">Q-Ops Agent</th>
                </tr>
              </thead>
              <tbody>
                {rowsToRender.map((row, index) => (
                  <tr
                    key={row.label}
                    className={`${index % 2 === 0 ? 'bg-slate-950/80' : 'bg-slate-900/80'} hover:bg-white/5`}
                  >
                    <td className="border-t border-slate-800 px-6 py-5 text-slate-200 font-medium">{row.label}</td>
                    <td className="border-t border-slate-800 px-6 py-5 text-slate-300">
                      <div className="inline-flex items-center gap-2">
                        {row.standard === 'Yes' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            <span className="text-emerald-300">Yes</span>
                          </>
                        ) : row.standard === 'No' ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">No</span>
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400">Limited</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="border-t border-slate-800 px-6 py-5 text-slate-300">
                      <div className="inline-flex items-center gap-2">
                        {row.qops === 'Yes' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            <span className="text-slate-100 font-semibold">Yes</span>
                          </>
                        ) : row.qops === 'No' ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">No</span>
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400">Limited</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center">
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              {isExpanded ? 'Show Less ↑' : 'See Full Comparison ↓'}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 text-sm text-slate-400 hover:text-slate-200"
            >
              Open Full View
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 transition-all duration-300 ease-in-out opacity-100">
              {/* Secondary rows are already included when expanded due to rowsToRender logic; this block provides visual spacing */}
            </div>
          )}

          {isModalOpen ? (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
              <div
                className="max-w-5xl w-full max-h-[80vh] overflow-y-auto bg-slate-900 rounded-2xl p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-white">Full Comparison</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-slate-900">
                      <tr className="bg-slate-900/90 text-slate-400">
                        <th className="px-6 py-4">Capability</th>
                        <th className="px-6 py-4">Standard AI Agents</th>
                        <th className="px-6 py-4">Q-Ops Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, index) => (
                        <tr key={row.label} className={`${index % 2 === 0 ? 'bg-slate-950/80' : 'bg-slate-900/80'} hover:bg-white/5`}>
                          <td className="border-t border-slate-800 px-6 py-5 text-slate-200 font-medium">{row.label}</td>
                          <td className="border-t border-slate-800 px-6 py-5 text-slate-300">
                            <div className="inline-flex items-center gap-2">
                              {row.standard === 'Yes' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                  <span className="text-emerald-300">Yes</span>
                                </>
                              ) : row.standard === 'No' ? (
                                <>
                                  <XCircle className="h-4 w-4 text-red-400" />
                                  <span className="text-red-400">No</span>
                                </>
                              ) : (
                                <span className="text-yellow-400">Limited</span>
                              )}
                            </div>
                          </td>
                          <td className="border-t border-slate-800 px-6 py-5 text-slate-300">
                            <div className="inline-flex items-center gap-2">
                              {row.qops === 'Yes' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                  <span className="text-slate-100 font-semibold">Yes</span>
                                </>
                              ) : row.qops === 'No' ? (
                                <>
                                  <XCircle className="h-4 w-4 text-red-400" />
                                  <span className="text-red-400">No</span>
                                </>
                              ) : (
                                <span className="text-yellow-400">Limited</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-slate-700 bg-surface2/90 p-8 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand">Why Teams Choose Q-Ops Agent</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Built for enterprise QA delivery</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {advantages.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="rounded-[1.75rem] border border-slate-700 bg-slate-950/50 p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand/10 text-brand shadow-inner">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-slate-400">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-700 bg-surface2/90 p-8 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand">Powered by a Scalable AI Architecture</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Q-Ops Agent combines orchestration, intelligence, and storage layers to deliver end-to-end QA automation</h2>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Orchestration Layer */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">Orchestration Layer</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-brand/10 text-brand shadow-inner">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">n8n</div>
                    <div className="text-sm text-slate-400">Manages workflow automation and agent execution</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Knowledge Layer */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">Data & Knowledge Layer</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-300 shadow-inner">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Supabase</div>
                    <div className="text-sm text-slate-400">Stores artifacts, outputs, and system data</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-purple-600/10 text-purple-300 shadow-inner">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Chroma (Vector DB)</div>
                    <div className="text-sm text-slate-400">Handles embeddings and semantic search</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence Layer */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">Intelligence Layer</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition ring-1 ring-brand/10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-700/5 text-emerald-300 shadow-inner">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">OpenAI LLMs</div>
                    <div className="text-sm text-slate-400">Generates QA artifacts: strategies, plans, stories</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-600/5 text-amber-300 shadow-inner">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">OpenAI Embeddings</div>
                    <div className="text-sm text-slate-400">Converts docs into vectors for contextual understanding</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/5 text-sky-300 shadow-inner">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">OpenAI Vision</div>
                    <div className="text-sm text-slate-400">Extracts structured insights from UI and visual inputs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Collaboration Layer */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">Delivery & Collaboration Layer</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-300 shadow-inner">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Jira</div>
                    <div className="text-sm text-slate-400">Creates epics, stories, and tracks QA execution</div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/40 p-5 shadow-lg flex items-center gap-4 hover:scale-[1.02] transition">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-600/10 text-indigo-300 shadow-inner">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Confluence</div>
                    <div className="text-sm text-slate-400">Houses strategies, plans, and QA documentation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-brand/20 bg-gradient-to-r from-slate-950/95 via-surface2/95 to-slate-950/95 p-10 shadow-glow">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand">Move from understanding requirements to executing QA—instantly</p>
              <h2 className="mt-4 text-4xl font-semibold text-white">Turn artifacts into action with confidence</h2>
              <p className="mt-4 max-w-2xl text-slate-300">Explore how Q-Ops Agent delivers a complete QA intelligence workflow, from artifact ingestion through production-ready test delivery.</p>
            </div>
            <div className="flex items-center justify-start gap-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-brand/20 transition hover:bg-brand/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-950/80 px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                Return to login
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ExploreMorePage
