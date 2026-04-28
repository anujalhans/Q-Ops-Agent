import { ArrowRight } from 'lucide-react'
import Button from '../common/Button'

type Props = {
  onPrimary: () => void
}

export default function FinalCta({ onPrimary }: Props) {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 md:p-10">
          <h2 className="font-display text-3xl font-semibold text-on-surface">Start shipping reliable tests faster</h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Join teams that reduced manual QA effort and improved confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onPrimary}>
              Explore Q-Ops Agent
            </Button>
            <a
              href="#docs"
              className="inline-flex items-center justify-center rounded-md border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Documentation
            </a>
          </div>
          <div className="mt-8 rounded-md border border-outline-variant bg-surface-container-low p-4 text-center">
            <p className="text-sm font-semibold text-on-surface">Enterprise-grade security</p>
            <p className="mt-1 text-xs text-on-surface-variant">Your data is never used for model training.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
