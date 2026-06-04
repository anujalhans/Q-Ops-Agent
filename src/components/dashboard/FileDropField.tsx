import { useCallback, useId, useRef, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'

type Value = File | File[] | null

type Props = {
  label: string
  accept: string
  multiple?: boolean
  value: Value
  onChange: (files: Value) => void
  helper?: string
  icon?: ReactNode
}

function summarise(value: Value): string {
  if (!value) return 'No file selected'
  if (Array.isArray(value)) return `${value.length} file${value.length === 1 ? '' : 's'} selected`
  return value.name
}

function formatAcceptedTypes(accept: string): string {
  return accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()
}

function isAcceptedFile(file: File, accept: string): boolean {
  const allowed = accept.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  if (!allowed.length) return true
  const name = file.name.toLowerCase()
  return allowed.some((item) => {
    if (item.startsWith('.')) return name.endsWith(item)
    return file.type.toLowerCase() === item
  })
}

export default function FileDropField({ label, accept, multiple = false, value, onChange, helper, icon }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const arr = Array.from(files)
      const accepted = arr.filter((file) => isAcceptedFile(file, accept))
      const rejected = arr.length - accepted.length
      setError(rejected ? `${rejected} file${rejected === 1 ? '' : 's'} rejected. Accepted types: ${formatAcceptedTypes(accept)}.` : '')
      if (multiple) onChange(accepted)
      else onChange(accepted[0] ?? null)
    },
    [accept, multiple, onChange],
  )

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDrag(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
        {icon ?? <UploadCloud className="h-4 w-4 text-on-surface-variant" />}
        <span>{label}</span>
      </div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col gap-1 rounded-md border-2 border-dashed px-3 py-4 text-xs transition-colors ${
          drag ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
        }`}
      >
        <span className="text-on-surface-variant">Drag & drop or click to upload</span>
        <span className="text-on-surface-variant/70">Accepted file types: {formatAcceptedTypes(accept)}</span>
        <span className="mt-2 inline-block self-start rounded-sm bg-surface-container-high px-2 py-0.5 text-on-surface">
          {summarise(value)}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      {helper ? <p className="text-xs text-on-surface-variant">{helper}</p> : null}
    </div>
  )
}
