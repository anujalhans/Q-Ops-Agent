import type { FC } from 'react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  message: string
  type: ToastType
}

type ToastListProps = {
  toasts: Toast[]
}

const palette: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 border-emerald-400 text-emerald-200',
  error: 'bg-rose-500/10 border-rose-400 text-rose-200',
  info: 'bg-sky-500/10 border-sky-400 text-sky-200',
}

const ToastList: FC<ToastListProps> = ({ toasts }) => {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-2xl border p-4 shadow-glow ${palette[toast.type]}`}>
          <p className="font-semibold">{toast.title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-200">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}

export default ToastList
