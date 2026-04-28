import { Lock } from 'lucide-react'

const partners = ['TechCorp', 'Innovate', 'DevOps Inc', 'Partner X']

export default function LogoStrip() {
  const repeated = [...partners, ...partners]

  return (
    <section className="border-y border-outline-variant bg-surface-container-low py-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant lg:text-left">
            Our Trusted Partners
          </p>
          <p className="mt-1 text-center text-sm text-on-surface-variant lg:text-left">
            Trusted by QA teams and engineering organizations
          </p>
          <div className="mt-5 overflow-hidden">
            <div className="flex w-max animate-marquee gap-4">
              {repeated.map((partner, index) => (
                <div
                  key={`${partner}-${index}`}
                  className="flex h-12 w-36 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-on-surface-variant"
                >
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary lg:mx-0">
          <Lock className="h-4 w-4" />
          500+ Test Artifacts Generated
        </div>
      </div>
    </section>
  )
}
