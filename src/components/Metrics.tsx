import React, { useEffect, useState } from 'react'

const statItems = [
  { label: 'Reduction in QA planning time', value: '75%' },
  { label: 'Improvement in test coverage', value: '40%' },
  { label: 'Hours saved per project', value: '50+' },
]

function useCountUp(targetStr: string, duration = 900) {
  const [display, setDisplay] = useState(targetStr)

  useEffect(() => {
    const digits = targetStr.replace(/[^0-9]/g, '')
    if (!digits) return setDisplay(targetStr)

    const target = parseInt(digits, 10)
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = Math.min(now - startTime, duration)
      const progress = elapsed / duration
      const current = Math.round(target * progress)
      const suffix = targetStr.replace(/\d+/g, '')
      setDisplay(`${current}${suffix}`)
      if (elapsed < duration) requestAnimationFrame(step)
      else setDisplay(`${target}${suffix}`)
    }

    requestAnimationFrame(step)
  }, [targetStr, duration])

  return display
}

const Metrics: React.FC = () => {
  return (
    <section className="my-12">
      <div className="mx-auto max-w-7xl rounded-[1.25rem] p-6 md:p-10" style={{ backgroundColor: 'rgba(2,6,10,0.55)' }}>
        <div className="text-left mb-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">Real Impact</h2>
          <p className="text-lg text-slate-300 mb-6">Measured outcomes from using Q-Ops Agent</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {statItems.map((s) => (
            <MetricCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>
    </section>
  )
}

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const display = useCountUp(value)

  return (
    <div className="flex gap-4 items-start rounded-2xl p-6 bg-slate-800/30 backdrop-blur-sm border-2 border-brand/30 shadow-sm hover:shadow-lg transform transition hover:-translate-y-1">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand/10 to-brand/5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand">
            <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div>
        <div className="text-3xl md:text-4xl font-bold text-brand">{display}</div>
        <div className="text-sm text-slate-300">{label}</div>
      </div>
    </div>
  )
}

export default Metrics
