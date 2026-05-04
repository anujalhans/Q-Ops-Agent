import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleMinus,
  CircleX,
  Moon,
  Network,
  Sun,
  X,
} from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'

type ComparisonRow = [string, 'Yes' | 'No' | 'Limited', 'Yes' | 'No' | 'Limited']

const comparisonRows: ComparisonRow[] = [
  ['Document Understanding', 'Yes', 'Yes'],
  ['Contextual Q&A', 'Yes', 'Yes'],
  ['Multi-Artifact Correlation', 'Limited', 'Yes'],
  ['QA-Specific Intelligence', 'No', 'Yes'],
  ['Structured Output Generation', 'Limited', 'Yes'],
  ['Test Strategy & Planning Depth', 'Limited', 'Yes'],
  ['Risk Identification & Prioritization', 'Limited', 'Yes'],
  ['Traceability (Req -> Test -> Defect)', 'No', 'Yes'],
  ['Consistency Across Outputs', 'No', 'Yes'],
  ['Reusability of Artifacts', 'No', 'Yes'],
  ['Workflow-Driven Execution', 'No', 'Yes'],
  ['QA Lifecycle Integration', 'Limited', 'Yes'],
  ['Handling Unstructured Inputs', 'Limited', 'Yes'],
  ['JIRA-Ready Output Formatting', 'No', 'Yes'],
  ['Coverage Awareness (Functional/Risk)', 'No', 'Yes'],
  ['Iterative Refinement (Feedback Loops)', 'Limited', 'Yes'],
  ['Scalability Across Projects', 'Limited', 'Yes'],
  ['Production-Ready Deliverables', 'No', 'Yes'],
]

const condensedRows = comparisonRows.filter(([capability]) =>
  [
    'QA-Specific Intelligence',
    'Multi-Artifact Correlation',
    'Structured Output Generation',
    'Workflow-Driven Execution',
    'Traceability (Req -> Test -> Defect)',
    'Production-Ready Deliverables',
  ].includes(capability),
)

const AUTH_KEY = 'qops-agent-auth'

export default function ExploreMorePage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true'
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
      <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium shadow-sm sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-base font-bold text-on-primary">Q</div>
            <span className="font-display text-base font-black tracking-tight text-on-surface sm:text-lg">Q-Ops Agent</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <button onClick={() => navigate(ctaTarget)} className="border-b-2 border-primary py-5 font-bold text-primary">{ctaLabel}</button>
            <a href="#flow" className="text-on-surface-variant transition-colors hover:text-primary">Workflow</a>
            <a href="#comparison" className="text-on-surface-variant transition-colors hover:text-primary">Comparison</a>
            <a href="#architecture" className="text-on-surface-variant transition-colors hover:text-primary">Architecture</a>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={toggle} className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button onClick={() => navigate(ctaTarget)} className="rounded-lg border border-outline-variant px-4 py-1.5 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high">
            {ctaLabel}
          </button>
        </div>
      </nav>

      <main>
        <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">AI-Powered QA Platform</span>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-[44px] sm:leading-[52px]">
                From Requirements to <br className="hidden sm:block" />
                <span className="text-primary">QA Intelligence</span>
              </h1>
              <p className="max-w-xl text-base leading-6 text-on-surface-variant">
                Q-Ops Agent transforms project artifacts into structured, production-ready QA outputs using AI.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="#flow" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90">
                  See how it works
                </a>
                <button onClick={() => navigate(ctaTarget)} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
                  {ctaLabel}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lg sm:p-8">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
                {['BRD', 'FRD', 'HLD', 'LLD', 'Transcript', 'UI Designs'].map((item) => (
                  <div key={item} className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-center font-semibold text-primary sm:p-4">{item}</div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-[#1b1b24] p-5 text-white sm:mt-6 sm:p-6">
                <p className="text-xs uppercase tracking-widest text-white/70">QA Intelligence Core</p>
                <p className="mt-2 text-xl font-bold sm:text-2xl">Knowledge, traceability, risk, and delivery in one flow.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="bg-surface-container-lowest py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro eyebrow="How Q-Ops Agent Works" title="End-to-end QA flow with clarity" />
            <div className="grid gap-5 md:grid-cols-3 md:gap-6">
              {[
                ['01', 'Ingest Artifacts', 'BRD, FRD, HLD, UI, transcripts are centralized into a single QA knowledge source.'],
                ['02', 'Build Knowledge Base', 'Vector embeddings and semantic understanding create contextual QA intelligence.'],
                ['03', 'Generate QA Outputs', 'Produce strategy, plans, RTM, risk, test cases, and epics in one flow.'],
              ].map(([num, title, text]) => (
                <div key={num} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center sm:p-8">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-bold text-on-primary">{num}</div>
                  <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-on-surface-variant">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="AI-Powered QA Capabilities"
              title="Capabilities built for QA teams"
              intro="One platform that unifies knowledge ingestion, QA artifact generation, and traceability into a consistent workflow."
            />
            <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {[
                ['Test Strategy Generation', 'AI drafts high-level strategies that align with requirements and risk coverage.'],
                ['Test Plan Creation', 'Build execution-ready test plans with scope, cycles, and exit criteria.'],
                ['Risk Assessment', 'Highlight product, integration, and security risk areas automatically.'],
                ['Traceability Matrix', 'Create RTM artifacts linking requirements to tests and coverage.'],
                ['Test Case Generation', 'Generate structured, reusable test cases from project artifacts.'],
                ['Epics & User Stories', 'Produce production-ready backlog items with QA context built in.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-md sm:p-8">
                  <Network className="mb-4 h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-on-surface-variant">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="comparison" className="bg-surface py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro eyebrow="Q-Ops Agent vs Standard AI Tools" title="The differentiation is clear" />
            <ComparisonTable rows={expanded ? comparisonRows : condensedRows} />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => setExpanded((current) => !current)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary">
                {expanded ? 'Show Less' : 'See Full Comparison'} {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button onClick={() => setModalOpen(true)} className="rounded-lg border border-outline-variant px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high">
                Open Full View
              </button>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro eyebrow="Why Teams Choose Q-Ops Agent" title="Built for enterprise QA delivery" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Built for QA Engineering', 'Purpose-built workflows designed around requirements, risk, and test execution.'],
                ['Structured, Not Ad-Hoc', 'Deliver artifacts with consistent format, traceability, and auditability.'],
                ['End-to-End Automation', 'Move from knowledge ingestion to QA outputs without manual translation.'],
                ['Context-Aware Intelligence', 'AI understands your project artefacts, not just one-off prompts.'],
                ['Scalable & Repeatable', 'Use the same workflow across projects and teams with consistent results.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
                  <h3 className="text-base font-bold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-on-surface-variant">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="architecture" className="bg-surface-container py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionIntro
              eyebrow="Powered by a Scalable AI Architecture"
              title="Q-Ops Agent combines orchestration, intelligence, and storage layers to deliver end-to-end QA automation"
            />
            <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              <ArchitectureGroup title="Orchestration Layer" items={[['n8n', 'Manages workflow automation and agent execution']]} />
              <ArchitectureGroup
                title="Data & Knowledge Layer"
                items={[
                  ['Supabase', 'Stores artifacts, outputs, and system data'],
                  ['Chroma (Vector DB)', 'Handles embeddings and semantic search'],
                ]}
              />
              <ArchitectureGroup
                title="Intelligence Layer"
                items={[
                  ['OpenAI LLMs', 'Generates QA artifacts: strategies, plans, stories'],
                  ['OpenAI Embeddings', 'Converts docs into vectors for contextual understanding'],
                  ['OpenAI Vision', 'Extracts structured insights from UI and visual inputs'],
                ]}
              />
              <ArchitectureGroup
                title="Delivery & Collaboration Layer"
                items={[
                  ['Jira', 'Creates epics, stories, and tracks QA execution'],
                  ['Confluence', 'Houses strategies, plans, and QA documentation'],
                ]}
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary p-8 text-center text-on-primary sm:p-12 md:p-16">
            <p className="text-xs font-bold uppercase tracking-widest text-on-primary/80">Move from understanding requirements to executing QA instantly</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Turn artifacts into action with confidence</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-on-primary/80 sm:text-lg">
              Explore how Q-Ops Agent delivers a complete QA intelligence workflow, from artifact ingestion through production-ready test delivery.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate(ctaTarget)} className="rounded-lg bg-on-primary px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-on-primary/90 sm:px-10">
                {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
              </button>
              <button onClick={() => navigate(ctaTarget)} className="rounded-lg border border-on-primary/30 px-8 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-on-primary/10 sm:px-10">
                {ctaLabel}
              </button>
            </div>
          </div>
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-sm sm:p-6" onClick={() => setModalOpen(false)}>
          <div className="max-h-[86vh] w-full max-w-5xl overflow-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Full Comparison</h2>
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
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-on-surface">{title}</h2>
      {intro ? <p className="mx-auto mt-2 max-w-2xl text-on-surface-variant">{intro}</p> : null}
    </div>
  )
}

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Capability</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Standard AI Agents</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-primary">Q-Ops Agent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rows.map(([capability, standard, qops]) => (
            <tr key={capability}>
              <td className="p-4 font-semibold text-on-surface">{capability}</td>
              <td className="p-4"><Value value={standard} /></td>
              <td className="p-4"><Value value={qops} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Value({ value }: { value: 'Yes' | 'No' | 'Limited' }) {
  const Icon = value === 'Yes' ? CheckCircle2 : value === 'No' ? CircleX : CircleMinus
  const color = value === 'Yes' ? 'text-success' : value === 'No' ? 'text-error' : 'text-warning'
  return (
    <span className={`inline-flex items-center gap-2 font-bold ${color}`}>
      <Icon className="h-4 w-4" /> {value}
    </span>
  )
}

function ArchitectureGroup({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h3 className="mb-4 text-lg font-bold text-on-surface">{title}</h3>
      <div className="space-y-3">
        {items.map(([name, description]) => (
          <div key={name} className="rounded-lg bg-surface-container-low p-4">
            <p className="font-bold text-primary">{name}</p>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
