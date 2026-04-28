import { LogOut } from 'lucide-react'
import Button from '../common/Button'
import Header from '../common/Header'

type Props = {
  greeting: string
  onLogout: () => void
}

export default function DashboardHeader({ greeting, onLogout }: Props) {
  return (
    <Header
      rightSlot={
        <>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-on-surface">{greeting}</p>
            <p className="text-[11px] text-on-surface-variant">Admin</p>
          </div>
          <Button variant="secondary" size="md" leftIcon={<LogOut className="h-4 w-4" />} onClick={onLogout}>
            Logout
          </Button>
        </>
      }
    />
  )
}
