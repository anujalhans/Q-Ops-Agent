import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CircleX,
  Database,
  FileText,
  Gauge,
  GitBranch,
  LineChart,
  Moon,
  Network,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sun,
  UploadCloud,
  Workflow,
  X,
} from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'

type ComparisonValue = 'Yes' | 'No' | 'Limited'
type ComparisonRow = [string, string, string, ComparisonValue, ComparisonValue]

const comparisonRows: ComparisonRow[] = [
  [
    'Context handling',
    'Prompt or session based. Context can drift between requests.',
    'Project-scoped knowledge base with Chroma retrieval and source-aware grounding.',
    'Limited',
    'Yes',
  ],
  [
    'Output creation',
    'Usually produces text that users must adapt manually.',
    'Creates Jira and Confluence-ready outputs with workflow-specific structure.',
    'Limited',
    'Yes',
  ],
  [
    'Coverage validation',
    'Users inspect coverage manually after generation.',
    'Coverage Ledger, quality gates, coverage passed/review states, and actionable gaps.',
    'No',
    'Yes',
  ],
  [
    'Update behavior',
    'Often regenerates from scratch, increasing cost and inconsistency.',
    'Detects existing outputs and guides create/update/retry behavior by document type.',
    'No',
    'Yes',
  ],
  [
    'Traceability path',
    'Traceability is implied or manually assembled.',
    'Requirement to Epics/User Stories to Story Test Cases to RTM workflow.',
    'Limited',
    'Yes',
  ],
  [
    'Failure recovery',
    'Retry behavior is usually manual and disconnected from history.',
    'Retry, recovered, failed usage, child jobs, and audit events are tracked.',
    'No',
    'Yes',
  ],
  [
    'Operational visibility',
    'Token usage, failed spend, active jobs, and readiness are often hidden.',
    'Dashboard, analytics, job panels, audit log, notifications, and cost telemetry.',
    'Limited',
    'Yes',
  ],
  [
    'Governance',
    'Credential, project, and role controls are usually outside the agent.',
    'Project overrides, workspace defaults, RLS-hardened tables, and audit-backed routing.',
    'Limited',
    'Yes',
  ],
]

const condensedRows = comparisonRows.filter(([capability]) =>
  ['Context handling', 'Coverage validation', 'Update behavior', 'Traceability path', 'Failure recovery', 'Operational visibility'].includes(capability),
)

const lifecycleSteps = [
  [UploadCloud, 'Ingest evidence', 'Upload BRD, FRD, HLD, LLD, transcripts, UI files, and supporting docs into one project workspace.'],
  [ScanSearch, 'Extract signals', 'Capture text, visuals, tables, chunks, warnings, tokens, cost, and artifact-level processing details.'],
  [Database, 'Build knowledge', 'Store retrieval-ready, project-scoped chunks so generation uses the right evidence, not a loose prompt.'],
  [FileText, 'Generate outputs', 'Create Test Strategy, Test Plan, Risk Matrix, Epics/User Stories, Story Test Cases, and RTM.'],
  [ShieldCheck, 'Review coverage', 'Validate Coverage Ledger status, freshness, blocked dependencies, and actionable review items.'],
  [RefreshCw, 'Update intelligently', 'Reuse existing Jira/Confluence outputs and update only stale or missing coverage where possible.'],
] as const

const xFactors = [
  ['Coverage Ledger', 'Every major generated output carries explicit coverage status, notes, and source references.'],
  ['Freshness Gate', 'Q-Ops can warn users when an output exists or upstream knowledge has changed before generating again.'],
  ['Retry and Recovery', 'Failed jobs retain usage and can be recovered through child retry jobs without hiding history.'],
  ['Live Delivery Targets', 'Outputs are published to Jira and Confluence, not just returned as chat text.'],
  ['Project Settings Precedence', 'Project overrides, user settings, and workspace defaults are resolved before jobs run.'],
  ['Usage Transparency', 'Tokens, cost, failed spend, active work, and recovered jobs are visible across operations.'],
] as const

const outputMap = [
  ['Test Strategy', 'Confluence', 'Enterprise QA strategy with scope, risk alignment, governance, and coverage ledger.'],
  ['Test Plan', 'Confluence', 'Execution-ready test plan with objectives, entry/exit criteria, schedule, risks, and coverage.'],
  ['Risk Matrix', 'Confluence', 'Readable risk summary/detail tables, heat map, mitigation, detection, and evidence traceability.'],
  ['Epics & User Stories', 'Jira + Confluence summary', 'Batch-aware backlog generation with coverage review and update behavior.'],
  ['Story Test Cases', 'Jira', 'Story-linked test cases with coverage checks and update/retry consistency.'],
  ['RTM', 'Confluence', 'Requirement traceability across source requirements, Jira backlog, and generated test cases.'],
] as const

const roles = [
  [ShieldCheck, 'QA Lead', 'See which outputs passed coverage, which need review, and where testing confidence is blocked.'],
  [GitBranch, 'Product Owner', 'Connect project requirements to Epics, User Stories, acceptance coverage, and downstream tests.'],
  [Gauge, 'Delivery Manager', 'Track readiness, active work, recovered jobs, failed spend, and delivery bottlenecks in one place.'],
  [Workflow, 'Workspace Admin', 'Control project assignments, integration routing, audit events, and secure workflow access.'],
] as const

const architectureLayers = [
  ['Workspace and Security', 'Supabase Auth, project assignment, RLS-hardened transactional tables, audit events, and notifications.'],
  ['Ingestion and Extraction', 'Document processing extracts text, images, tables, chunks, warnings, metrics, and storage references.'],
  ['Retrieval and Evidence', 'Chroma collections store project-scoped chunks so generators cite retrieved evidence with chunk IDs.'],
  ['Workflow Orchestration', 'n8n queues, workers, retries, update decisions, quality gates, and publishing operations.'],
  ['Delivery Systems', 'Jira stores backlog and test cases; Confluence stores generated QA documents and summaries.'],
] as const

const SESSION_KEY = 'qops-agent-supabase-session'

export default function ExploreMorePage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const isAuthenticated = Boolean(localStorage.getItem(SESSION_KEY))
  const ctaLabel = isAuthenticated ? 'Open Dashboard' : 'Login'
  const ctaTarget = isAuthenticated ? '/dashboard' : '/'

  useEffect(() => {
    if (!modalOpen) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <nav className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/95 px-4 text-sm font-medium shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-left sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-base font-bold text-on-primary">Q</div>
              <span className="font-display text-base font-black tracking-tight text-on-surface sm:text-lg">Q-Ops Agent</span>
            </button>
            <div className="hidden items-center gap-6 md:flex">
              <a href="#lifecycle" className="text-on-surface-variant transition-colors hover:text-primary">Lifecycle</a>
              <a href="#x-factor" className="text-on-surface-variant transition-colors hover:text-primary">X-Factor</a>
              <a href="#comparison" className="text-on-surface-variant transition-colors hover:text-primary">Comparison</a>
              <a href="#outputs" className="text-on-surface-variant transition-colors hover:text-primary">Outputs</a>
              <a href="#architecture" className="text-on-surface-variant transition-colors hover:text-primary">Architecture</a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={toggle} className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => navigate(ctaTarget)} className="rounded-lg border border-outline-variant px-4 py-1.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
              {ctaLabel}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.56fr)_minmax(22rem,0.44fr)] lg:gap-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Advanced QA operations intelligence</span>
              <h1 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-on-surface sm:text-5xl">
                From Project Evidence to Governed QA Delivery
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">
                Q-Ops Agent turns BRD, FRD, designs, transcripts, and supporting documents into traceable QA deliverables, Jira backlog, Story Test Cases, and RTM with coverage review, update awareness, retry recovery, and cost visibility.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#lifecycle" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
                  Explore lifecycle <ArrowRight className="h-4 w-4" />
                </a>
                <button onClick={() => navigate(ctaTarget)} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                  {ctaLabel}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">What normal AI agents miss</p>
              <div className="mt-4 space-y-3">
                {[
                  ['State', 'Q-Ops remembers job state, retries, recovered outputs, freshness, and update paths.'],
                  ['Evidence', 'Outputs are grounded in project-scoped chunks and coverage ledgers.'],
                  ['Delivery', 'The system publishes into Jira and Confluence with audit and usage telemetry.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                    <p className="font-bold text-on-surface">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="lifecycle" className="bg-surface-container-lowest py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="Governed output lifecycle"
              title="A stateful workflow from source artifacts to trusted QA outputs"
              intro="Explore is where users should understand the full operating model, including the advanced states that make Q-Ops more than a prompt wrapper."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lifecycleSteps.map(([Icon, title, text], index) => (
                <article key={title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{index + 1}</span>
                    <div>
                      <Icon className="mb-3 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="x-factor" className="bg-surface py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="The Q-Ops X-factor"
              title="Built around quality operations, not one-off generation"
              intro="The differentiator is not only that Q-Ops generates documents. It knows when output is ready, stale, blocked, recovered, or needs review."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {xFactors.map(([title, text]) => (
                <article key={title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <h3 className="mt-4 text-base font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="comparison" className="bg-surface-container py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="Standard AI agents vs Q-Ops Agent"
              title="The difference is workflow control, evidence, and operational memory"
            />
            <ComparisonTable rows={expanded ? comparisonRows : condensedRows} />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => setExpanded((current) => !current)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary">
                {expanded ? 'Show Less' : 'See Full Comparison'} {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button onClick={() => setModalOpen(true)} className="rounded-lg border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                Open Full View
              </button>
            </div>
          </div>
        </section>

        <section id="outputs" className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Real output map"
              title="Q-Ops publishes where delivery teams already work"
              intro="The system is designed for operational adoption: Confluence for shared QA documents, Jira for backlog/test work, and Q-Ops for status, readiness, coverage, and cost visibility."
            />
            <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
              {outputMap.map(([output, destination, value]) => (
                <div key={output} className="grid gap-2 border-b border-outline-variant px-4 py-4 last:border-b-0 hover:bg-primary/5 sm:grid-cols-[13rem_13rem_minmax(0,1fr)]">
                  <p className="font-bold text-on-surface">{output}</p>
                  <p className="text-sm font-bold text-primary">{destination}</p>
                  <p className="text-sm leading-6 text-on-surface-variant">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="Role-based value"
              title="Different users get different decisions from the same operating view"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roles.map(([Icon, role, text]) => (
                <article key={role} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-success/40 hover:shadow-lg hover:shadow-success/10">
                  <Icon className="h-7 w-7 text-success" />
                  <h3 className="mt-4 text-lg font-bold text-on-surface">{role}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="architecture" className="bg-surface-container py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="How the system earns trust"
              title="Architecture explained as product behavior"
              intro="The technical stack matters because each layer protects a user promise: scoped context, reliable orchestration, governed data, and delivery into the tools teams use."
            />
            <div className="grid gap-4 lg:grid-cols-5">
              {architectureLayers.map(([title, text], index) => (
                <article key={title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Layer {index + 1}</span>
                  <h3 className="mt-3 text-base font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-lg bg-[#1b1b24] p-8 text-center text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 sm:p-12 md:p-16">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Move beyond prompt-based QA generation</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Explore the system, then run it against a real project.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">
              Q-Ops is built for teams that need reliable generation, traceable coverage, controlled updates, and operational visibility across the QA delivery lifecycle.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate(ctaTarget)} className="rounded-lg bg-primary px-8 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 sm:px-10">
                {isAuthenticated ? 'Open Dashboard' : 'Login'}
              </button>
              <button onClick={() => navigate('/')} className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 sm:px-10">
                Back to landing
              </button>
            </div>
          </div>
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-sm sm:p-6" onClick={() => setModalOpen(false)}>
          <div className="max-h-dvh w-full max-w-6xl overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Full Q-Ops Comparison</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ComparisonTable rows={comparisonRows} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SectionIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">{title}</h2>
      {intro ? <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant sm:text-base">{intro}</p> : null}
    </div>
  )
}

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Capability</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Standard AI Agent</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Q-Ops Agent</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Standard</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Q-Ops</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rows.map(([capability, standardText, qopsText, standard, qops]) => (
            <tr key={capability} className="transition-colors hover:bg-primary/5">
              <td className="p-4 font-bold text-on-surface">{capability}</td>
              <td className="p-4 leading-6 text-on-surface-variant">{standardText}</td>
              <td className="p-4 leading-6 text-on-surface-variant">{qopsText}</td>
              <td className="p-4"><Value value={standard} /></td>
              <td className="p-4"><Value value={qops} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Value({ value }: { value: ComparisonValue }) {
  const Icon = value === 'Yes' ? CheckCircle2 : value === 'No' ? CircleX : CircleMinus
  const color = value === 'Yes' ? 'text-success' : value === 'No' ? 'text-error' : 'text-warning'
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${color}`}>
      <Icon className="h-4 w-4" /> {value}
    </span>
  )
}
