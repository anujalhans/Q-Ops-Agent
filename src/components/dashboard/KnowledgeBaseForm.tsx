import { useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, Folder, Image as ImageIcon, Mic, Paperclip, RefreshCw, Rocket } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import FileDropField from './FileDropField'
import { uploadKnowledgeBase } from '../../lib/api'
import type { KnowledgeBasePayload, UploadResponse } from '../../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void

type Props = {
  onJobStarted: (response: UploadResponse) => void
  addToast: AddToast
}

export default function KnowledgeBaseForm({ onJobStarted, addToast }: Props) {
  const [projectName, setProjectName] = useState('')
  const [brd, setBrd] = useState<File | null>(null)
  const [frd, setFrd] = useState<File | null>(null)
  const [hld, setHld] = useState<File | null>(null)
  const [lld, setLld] = useState<File | null>(null)
  const [transcripts, setTranscripts] = useState<File[]>([])
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([])
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload: KnowledgeBasePayload = { projectName, brd, frd, hld, lld, transcripts, supportingDocuments, images }
      const res = await uploadKnowledgeBase(payload)
      onJobStarted(res)
      addToast({ title: 'Ingestion started', message: 'Knowledge base ingestion queued.', type: 'info' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      addToast({ title: 'Upload failed', message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProjectName('')
    setBrd(null)
    setFrd(null)
    setHld(null)
    setLld(null)
    setTranscripts([])
    setSupportingDocuments([])
    setImages([])
    setError('')
    addToast({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
  }

  const setFile = (setter: (f: File | null) => void) => (v: File | File[] | null) => {
    setter(Array.isArray(v) ? v[0] ?? null : v)
  }

  const appendUniqueFiles = (current: File[], next: File[]) => {
    const merged = [...current, ...next]
    return merged.filter((file, index) =>
      merged.findIndex((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index,
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter knowledge project name"
        helper="Give a clear, descriptive project name for traceability."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="mb-3 text-sm font-semibold text-on-surface">Business Documents</p>
          <div className="space-y-3">
            <FileDropField label="BRD document" accept=".pdf,.docx" value={brd} onChange={setFile(setBrd)} icon={<FileText className="h-4 w-4 text-on-surface-variant" />} />
            <FileDropField label="FRD document" accept=".pdf,.docx" value={frd} onChange={setFile(setFrd)} icon={<FileText className="h-4 w-4 text-on-surface-variant" />} />
          </div>
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-on-surface">Technical Documents</p>
          <div className="space-y-3">
            <FileDropField label="HLD document" accept=".pdf,.docx" value={hld} onChange={setFile(setHld)} icon={<Folder className="h-4 w-4 text-on-surface-variant" />} />
            <FileDropField label="LLD document" accept=".pdf,.docx" value={lld} onChange={setFile(setLld)} icon={<Folder className="h-4 w-4 text-on-surface-variant" />} />
          </div>
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-on-surface">Supporting Assets</p>
          <div className="space-y-3">
            <FileDropField
              label="Transcript files"
              accept=".txt,.md,.log"
              multiple
              value={transcripts}
              onChange={(v) => setTranscripts((current) => appendUniqueFiles(current, Array.isArray(v) ? v : v ? [v] : []))}
              helper="Upload one or more meeting notes or transcript files."
              icon={<Mic className="h-4 w-4 text-on-surface-variant" />}
            />
            <FileDropField
              label="Other supporting documents"
              accept=".pdf,.docx,.pptx,.txt,.md,.csv,.log"
              multiple
              value={supportingDocuments}
              onChange={(v) => setSupportingDocuments((current) => appendUniqueFiles(current, Array.isArray(v) ? v : v ? [v] : []))}
              helper="Upload supplementary specs, decks, notes, API references, or project context files."
              icon={<Paperclip className="h-4 w-4 text-on-surface-variant" />}
            />
            <FileDropField
              label="UI designs"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              multiple
              value={images}
              onChange={(v) => setImages((current) => appendUniqueFiles(current, Array.isArray(v) ? v : v ? [v] : []))}
              helper="Upload one or more design images for your UI assets."
              icon={<ImageIcon className="h-4 w-4 text-on-surface-variant" />}
            />
          </div>
        </Card>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={loading} leftIcon={<Rocket className="h-4 w-4" />}>
          {loading ? 'Creating knowledge base...' : 'Create Knowledge Base'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Reset
        </Button>
      </div>
    </form>
  )
}
