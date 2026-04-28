import type { FC } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  title: string
  message: string
  type: ToastType
}

type ToastListProps = {
  toasts: Toast[]
}

const palette: Record<ToastType, { ring: string; icon: FC<{ className?: string }>; iconClass: string }> = {
  success: { ring: 'border-success/40 bg-success/10', icon: CheckCircle2, iconClass: 'text-success' },
  error: { ring: 'border-error/40 bg-error/10', icon: AlertCircle, iconClass: 'text-error' },
  info: { ring: 'border-primary/40 bg-primary/10', icon: Info, iconClass: 'text-primary' },
}

const ToastList: FC<ToastListProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(340px,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => {
        const p = palette[toast.type]
        const Icon = p.icon
        return (
          <div
            key={toast.id}
            role="status"
            className={`flex gap-3 rounded-md border bg-surface-container-lowest p-3 shadow-ambient ${p.ring}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${p.iconClass}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">{toast.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{toast.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ToastList
