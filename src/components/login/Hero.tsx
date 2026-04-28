import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '../common/Button'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAHo1jYgjhGlEuj_dPP3or7_ewNDREHmwb3Xce0eKj8AExnPYUT68ZcqvWrBtrU38gPmwiLBpxdbDz0TL1kfdhgfNWEdJxAri6Na-5hUffU9O2jqpLtIEyarQDK7ZlY4u1jSkCeSL5DvkPPRw7ZiLqYwVnpTeUdJlJg_72b5chjNvpaWVFq4G7bu1sh-98Lv_zOCpL3b8iAvH-4CeuEEvPmmjHLwKnXuQpwPUurF7Ad7cuwBselHkJCQgGKiSFCP2nl1CaWgFFtSAsK'

type Props = {
  onExplore: () => void
}

export default function Hero({ onExplore }: Props) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" /> AI-Powered
        </span>
        <h2 className="font-display text-4xl font-bold leading-tight text-on-surface sm:text-5xl">
          Build QA That Starts Before Code Exists
        </h2>
        <p className="max-w-xl text-lg text-on-surface-variant">
          Transform requirements, designs, and conversations into a complete QA foundation&mdash;instantly.
        </p>
        <p className="text-base font-medium text-on-surface">Q-Ops Agent does not assist QA. It builds it.</p>
        <p className="text-sm text-on-surface-variant">
          From scattered artifacts to structured QA&mdash;ready in minutes.
        </p>
        <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onExplore}>
          Explore More
        </Button>
      </div>
      <div className="hidden lg:block">
        <img
          src={heroImage}
          alt="AI-driven QA intelligence"
          className="h-auto w-full rounded-lg border border-outline-variant object-cover shadow-ambient"
        />
      </div>
    </section>
  )
}
