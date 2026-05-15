import { ArrowRight, Brain, FileText, UploadCloud } from 'lucide-react'
import Card from '../common/Card'

const steps = [
  {
    Icon: UploadCloud,
    title: 'Ingest Artifacts',
    description: 'BRD, FRD, HLD, UI, transcripts are centralized into a single QA knowledge source.',
  },
  {
    Icon: Brain,
    title: 'Build Knowledge Base',
    description: 'Vector embeddings and semantic understanding create contextual QA intelligence.',
  },
  {
    Icon: FileText,
    title: 'Generate QA Outputs',
    description: 'Produce strategy, plans, RTM, risk, test cases, and epics in one flow.',
  },
]

export default function WorkflowSteps() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">How Q-Ops Agent Works</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-on-surface">End-to-end QA flow with clarity</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-5 lg:items-center">
          {steps.map(({ Icon, title, description }, index) => (
            <div key={title} className="contents">
              <Card className="h-full text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-on-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Step {index + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-on-surface">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
              </Card>
              {index < steps.length - 1 ? <ArrowRight className="hidden h-6 w-6 text-primary lg:block" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
