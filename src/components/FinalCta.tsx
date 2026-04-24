import React from 'react'

type Props = {
  onPrimary?: () => void
}

const FinalCta: React.FC<Props> = ({ onPrimary }) => {
  return (
    <section className="py-12">
      <section
        className="mx-auto max-w-7xl rounded-[2rem] p-8 md:p-10 shadow-glow relative overflow-hidden"
        style={{ backgroundColor: 'rgba(2,6,10,0.55)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 to-slate-800/20 pointer-events-none" />
        <div className="relative">
          <div className="text-left">
            <h3 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">Start shipping reliable tests faster</h3>
            <p className="text-lg text-slate-300 mb-6">Join teams that reduced manual QA effort and improved confidence.</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-start gap-4">
            <button
              onClick={onPrimary}
              className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-brand to-indigo-500 px-6 py-3 text-sm md:text-base font-semibold text-black shadow-lg transform transition hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Explore Q-Ops Agent</span>
            </button>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-brand/30 px-5 py-3 text-sm md:text-base text-slate-300 hover:bg-surface/5"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>
    </section>
  )
}

export default FinalCta
