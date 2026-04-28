import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helper?: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
}

export default function Input({
  label,
  helper,
  error,
  icon,
  trailing,
  className = '',
  id,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-center gap-2 rounded-md border bg-surface-container-lowest px-3 py-2 transition focus-within:shadow-focus-ring ${
          error ? 'border-error' : 'border-outline-variant focus-within:border-primary'
        }`}
      >
        {icon ? <span className="flex-shrink-0 text-on-surface-variant">{icon}</span> : null}
        <input
          {...rest}
          id={inputId}
          className={`flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant outline-none ${className}`}
        />
        {trailing}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-error">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-on-surface-variant">{helper}</p>
      ) : null}
    </div>
  )
}
