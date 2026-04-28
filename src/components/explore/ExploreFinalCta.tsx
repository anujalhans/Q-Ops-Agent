import Button from '../common/Button'

type Props = {
  onPrimary: () => void
}

export default function ExploreFinalCta({ onPrimary }: Props) {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-primary p-8 text-on-primary md:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Move from understanding requirements to executing QA&mdash;instantly
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Turn artifacts into action with confidence</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 opacity-90">
            Explore how Q-Ops Agent delivers a complete QA intelligence workflow, from artifact ingestion through production-ready test delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-surface-container-lowest text-primary hover:bg-surface-container-high" onClick={onPrimary}>
              Get Started
            </Button>
            <Button variant="secondary" className="border-on-primary/40 text-on-primary hover:bg-on-primary/10" onClick={onPrimary}>
              Return to login
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
