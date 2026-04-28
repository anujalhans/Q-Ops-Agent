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

export default function FileDropField({ label, accept, multiple = false, value, onChange, helper, icon }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const inputId = useId()
  const [drag, setDrag] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const arr = Array.from(files)
      if (multiple) onChange(arr)
      else onChange(arr[0] ?? null)
    },
    [multiple, onChange],
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
        <span className="text-on-surface-variant/70">Supported: {accept.replace(/\./g, '').replace(/,/g, ', ')}</span>
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
      {helper ? <p className="text-xs text-on-surface-variant">{helper}</p> : null}
    </div>
  )
}
