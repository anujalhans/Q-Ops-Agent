import { useEffect, useState } from 'react'
import Card from '../common/Card'

const statItems = [
  { label: 'Reduction in QA planning time', value: '75%' },
  { label: 'Improvement in test coverage', value: '40%' },
  { label: 'Hours saved per project', value: '50+' },
]

function useCountUp(targetStr: string, duration = 900) {
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const digits = targetStr.replace(/[^0-9]/g, '')
    if (!digits) {
      setDisplay(targetStr)
      return
    }

    const target = Number.parseInt(digits, 10)
    const start = performance.now()
    let frame = 0

    function step(now: number) {
      const elapsed = Math.min(now - start, duration)
      const current = Math.round(target * (elapsed / duration))
      const suffix = targetStr.replace(/\d+/g, '')
      setDisplay(`${current}${suffix}`)
      if (elapsed < duration) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [targetStr, duration])

  return display
}

function MetricCard({ value, label }: { value: string; label: string }) {
  const display = useCountUp(value)

  return (
    <Card>
      <div className="font-display text-4xl font-bold text-primary">{display}</div>
      <div className="mt-2 text-sm text-on-surface-variant">{label}</div>
    </Card>
  )
}

export default function Metrics() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-on-surface">Real Impact</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Measured outcomes from using Q-Ops Agent</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {statItems.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
