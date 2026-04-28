import { ArrowRight, FileText, Sparkles } from 'lucide-react'

export default function Transformation() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-on-surface">Before Q-Ops Agent</h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Requirements, diagrams, transcripts, and design files sit in separate tools while QA teams manually connect
            the dots.
          </p>
        </div>
        <div className="hidden items-center text-primary lg:flex">
          <ArrowRight className="h-8 w-8" />
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-on-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-on-surface">After Q-Ops Agent</h2>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            The same artifacts become searchable context, risk insight, and QA deliverables ready for execution.
          </p>
        </div>
      </div>
    </section>
  )
}
