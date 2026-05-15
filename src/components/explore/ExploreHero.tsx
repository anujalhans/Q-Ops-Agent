import { ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCJgqz7n6ReQ0dotFa42SupWsDiODejHfrkaW70TNf8MBMYgXoMV3jX7KTsO2oAK6AfWL2BJ3H2-yPKSbwenBPo5VJrrMxor0LcQFxrDVsf04STeOB4NTuVgEoYCMxO1HQQn0_o91SDDba4twaVVL0EWqnWCr816EOFKSIcW9Q0nbJWYkumfWsbQTCVWNKSothDmziTCKhZlduQ_fMayYgi5tTwR0iAIk7zfPUlnn41r2TR-ONZrRnHEQ_YCbTke0QrgujTsrFMpvwa'

export default function ExploreHero() {
  const navigate = useNavigate()

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> AI-Powered QA Platform
          </span>
          <h2 className="font-display text-4xl font-bold leading-tight text-on-surface sm:text-5xl">
            From Requirements to QA Intelligence
          </h2>
          <p className="max-w-xl text-lg text-on-surface-variant">
            Q-Ops Agent transforms project artifacts into structured, production-ready QA outputs using AI.
          </p>
          <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/')}>
            Back to login
          </Button>
        </div>
        <div className="hidden lg:block">
          <img
            src={heroImage}
            alt="Dashboard visualization"
            className="aspect-video w-full rounded-lg border border-outline-variant object-cover shadow-ambient"
          />
        </div>
      </div>
    </section>
  )
}
