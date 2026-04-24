import type { DragEvent } from 'react'
import { useCallback, useRef, useState } from 'react'

type FileDropFieldProps = {
  label: string
  accept: string
  multiple?: boolean
  value: File | File[] | null
  onChange: (files: File | File[] | null) => void
  helper?: string
  icon?: string
}

function getFileName(value: File | File[] | null) {
  if (!value) return 'No file selected'
  if (Array.isArray(value)) return `${value.length} file${value.length === 1 ? '' : 's'} selected`
  return value.name
}

const FileDropField = ({ label, accept, multiple = false, value, onChange, helper, icon }: FileDropFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const fileArray = Array.from(files)
      if (multiple) {
        onChange(fileArray)
      } else {
        onChange(fileArray[0] ?? null)
      }
    },
    [multiple, onChange],
  )

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200 flex items-center gap-2">
        {icon && <span>{icon}</span>} {label}
      </label>
      <label
        htmlFor={label}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`group flex min-h-[108px] flex-col justify-center rounded-3xl border border-border bg-surface3 px-4 py-5 text-sm transition ${
          dragActive ? 'border-brand bg-surface2' : 'hover:border-slate-400'
        }`}
      >
        <span className="mb-2 text-slate-300">Drag & drop or click to upload</span>
        <span className="text-xs text-slate-500">Supported: {accept.replace(/\./g, '').replace(/,/g, ', ')}</span>
        <span className="mt-4 rounded-full bg-surface2 px-3 py-1 text-xs text-slate-300 shadow-sm">
          {getFileName(value)}
        </span>
        <input
          ref={inputRef}
          id={label}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

export default FileDropField
