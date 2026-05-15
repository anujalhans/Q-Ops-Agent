import type { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

type HeaderProps = {
  rightSlot?: ReactNode
  showAiBadge?: boolean
  showTagline?: boolean
}

export default function Header({ rightSlot, showAiBadge = true, showTagline = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-low/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary text-lg font-bold text-on-primary">
            Q
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-lg font-semibold text-on-surface">Q-Ops Agent</h1>
              {showAiBadge ? (
                <span className="inline-flex items-center rounded-sm border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  AI-Powered
                </span>
              ) : null}
            </div>
            {showTagline ? (
              <p className="truncate text-xs text-on-surface-variant">A Purpose-Built AI System for QA Engineering</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {rightSlot}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
