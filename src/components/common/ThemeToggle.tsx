import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const Icon = theme === 'light' ? Moon : Sun
  const label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-outline-variant text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus-visible:shadow-focus-ring"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
