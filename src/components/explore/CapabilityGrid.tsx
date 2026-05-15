import { useState } from 'react'
import { AlertCircle, CheckCircle2, Code2, FileText, ListChecks, Shield, Sparkles, XCircle, Zap } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Modal from '../common/Modal'

const features = [
  { Icon: FileText, title: 'Test Strategy Generation', description: 'AI drafts high-level strategies that align with requirements and risk coverage.' },
  { Icon: ListChecks, title: 'Test Plan Creation', description: 'Build execution-ready test plans with scope, cycles, and exit criteria.' },
  { Icon: Shield, title: 'Risk Assessment', description: 'Highlight product, integration, and security risk areas automatically.' },
  { Icon: Zap, title: 'Traceability Matrix', description: 'Create RTM artifacts linking requirements to tests and coverage.' },
  { Icon: Code2, title: 'Test Case Generation', description: 'Generate structured, reusable test cases from project artifacts.' },
  { Icon: Sparkles, title: 'Epics & User Stories', description: 'Produce production-ready backlog items with QA context built in.' },
]

const rows = [
  ['Document Understanding', 'Yes', 'Yes'],
  ['Contextual Q&A', 'Yes', 'Yes'],
  ['Multi-Artifact Correlation', 'Limited', 'Yes'],
  ['QA-Specific Intelligence', 'No', 'Yes'],
  ['Structured Output Generation', 'Limited', 'Yes'],
  ['Test Strategy & Planning Depth', 'Limited', 'Yes'],
  ['Risk Identification & Prioritization', 'Limited', 'Yes'],
  ['Traceability (Req to Test to Defect)', 'No', 'Yes'],
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
] as const

const condensedLabels = new Set([
  'QA-Specific Intelligence',
  'Multi-Artifact Correlation',
  'Structured Output Generation',
  'Workflow-Driven Execution',
  'Traceability (Req to Test to Defect)',
  'Production-Ready Deliverables',
])

const advantages = [
  ['Built for QA Engineering', 'Purpose-built workflows designed around requirements, risk, and test execution.'],
  ['Structured, Not Ad-Hoc', 'Deliver artifacts with consistent format, traceability, and auditability.'],
  ['End-to-End Automation', 'Move from knowledge ingestion to QA outputs without manual translation.'],
  ['Context-Aware Intelligence', 'AI understands your project artifacts, not just one-off prompts.'],
  ['Scalable & Repeatable', 'Use the same workflow across projects and teams with consistent results.'],
]

function Cell({ value }: { value: string }) {
  if (value === 'Yes') {
    return (
      <span className="inline-flex items-center gap-1.5 text-success">
        <CheckCircle2 className="h-4 w-4" /> Yes
      </span>
    )
  }
  if (value === 'Limited') {
    return (
      <span className="inline-flex items-center gap-1.5 text-warning">
        <AlertCircle className="h-4 w-4" /> Limited
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-error">
      <XCircle className="h-4 w-4" /> No
    </span>
  )
}

function ComparisonTable({ full }: { full: boolean }) {
  const visibleRows = full ? rows : rows.filter(([label]) => condensedLabels.has(label))

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant">
      <table className="w-full min-w-full text-left text-sm">
        <thead className="bg-surface-container-high text-xs uppercase tracking-wider text-on-surface-variant">
          <tr>
            <th className="p-4">Capability</th>
            <th className="p-4">Standard AI Agents</th>
            <th className="p-4 text-primary">Q-Ops Agent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
          {visibleRows.map(([capability, standard, qops]) => (
            <tr key={capability}>
              <td className="p-4 font-medium text-on-surface">{capability}</td>
              <td className="p-4 text-on-surface-variant">
                <Cell value={standard} />
              </td>
              <td className="p-4 font-semibold text-on-surface">
                <Cell value={qops} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CapabilityGrid() {
  const [expanded, setExpanded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">AI-Powered QA Capabilities</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-on-surface">Capabilities built for QA teams</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            One platform that unifies knowledge ingestion, QA artifact generation, and traceability into a consistent workflow.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description }) => (
              <Card key={title}>
                <Icon className="mb-4 h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-on-surface">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Q-Ops Agent vs Standard AI Tools</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-on-surface">The differentiation is clear</h2>
          <div className="mt-8">
            <ComparisonTable full={expanded} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setExpanded((current) => !current)}>
              {expanded ? 'Show Less' : 'See Full Comparison'}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(true)}>
              Open Full View
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why Teams Choose Q-Ops Agent</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-on-surface">Built for enterprise QA delivery</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {advantages.map(([title, description]) => (
              <Card key={title}>
                <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Full Comparison" maxWidth="max-w-5xl">
        <div className="max-h-dvh overflow-auto pr-1">
          <ComparisonTable full />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  )
}
