import { Database, FileText } from 'lucide-react'

export type DashboardTab = 'knowledge' | 'documents'

type Props = {
  active: DashboardTab
  onChange: (tab: DashboardTab) => void
}

const items: Array<{ key: DashboardTab; label: string; Icon: typeof Database }> = [
  { key: 'knowledge', label: '1. Knowledge Base', Icon: Database },
  { key: 'documents', label: '2. Generate Documents', Icon: FileText },
]

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="space-y-1 rounded-lg border border-outline-variant bg-surface-container-low p-2">
      {items.map(({ key, label, Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
