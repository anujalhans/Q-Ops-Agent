import React from 'react'
import HeroIllustration from './HeroIllustration'

type HeroProps = {
  onExplore: () => void
}

const Hero = ({ onExplore }: HeroProps) => {
  return (
    <section
      className="rounded-[2rem] p-12 shadow-glow relative overflow-hidden bg-surface3"
      style={{
        backgroundImage: `linear-gradient(rgba(2,6,10,0.6), rgba(2,6,10,0.6)), url('/assets/hero-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-2 items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-brand/10 text-brand border border-brand/20">AI-Powered</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">Build QA That Starts Before Code Exists</h1>
          <p className="text-lg text-slate-300 mb-6">Transform requirements, designs, and conversations into a complete QA foundation—instantly.</p>
          <p className="text-base text-brand font-semibold mb-6">Q-Ops Agent doesn’t assist QA. It builds it.</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition transform hover:scale-[1.02] hover:shadow-lg"
            >
              Explore More
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-400">From scattered artifacts to structured QA—ready in minutes.</p>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

export default Hero
