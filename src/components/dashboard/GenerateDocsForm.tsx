import { useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, RefreshCw, Rocket } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import { generateDocument } from '../../lib/api'
import type { DocumentArtifactKey, UploadResponse } from '../../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void

type Props = {
  onJobStarted: (response: UploadResponse) => void
  addToast: AddToast
}

const ARTIFACTS: Array<{ key: DocumentArtifactKey; label: string; description: string }> = [
  { key: 'strategy', label: 'Test Strategy', description: 'Generate Test Strategy from your knowledge base.' },
  { key: 'plan', label: 'Test Plan', description: 'Generate Test Plan from your knowledge base.' },
  { key: 'risk', label: 'Risk Matrix', description: 'Generate Risk Matrix from your knowledge base.' },
  { key: 'testCases', label: 'Test Cases', description: 'Generate Test Cases from your knowledge base.' },
  { key: 'epicsAndStories', label: 'Epics & User Stories', description: 'Generate epics and user stories from your knowledge base.' },
  { key: 'traceability_matrix', label: 'Traceability Matrix', description: 'Generate Traceability Matrix from your knowledge base.' },
]

export default function GenerateDocsForm({ onJobStarted, addToast }: Props) {
  const [project, setProject] = useState('')
  const [artifact, setArtifact] = useState<DocumentArtifactKey | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!project || !artifact) {
      setError('Please select project and artifact type')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await generateDocument({ projectName: project, artifact })
      onJobStarted(res)
      addToast({ title: 'Generation started', message: 'Document generation queued.', type: 'info' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      addToast({ title: 'Generation failed', message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProject('')
    setArtifact('')
    setError('')
    addToast({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Project name"
        value={project}
        onChange={(e) => setProject(e.target.value)}
        placeholder="Enter existing knowledge project name"
      />

      <Card>
        <p className="mb-1 text-sm font-semibold text-on-surface">Select artifacts</p>
        <p className="mb-4 text-xs text-on-surface-variant">What would you like to generate?</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {ARTIFACTS.map((a) => {
            const selected = artifact === a.key
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setArtifact(a.key)}
                aria-pressed={selected}
                className={`rounded-md border p-3 text-left transition-colors ${
                  selected ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-on-surface">{a.label}</div>
                    <div className="mt-0.5 text-xs text-on-surface-variant">{a.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={loading} leftIcon={<Rocket className="h-4 w-4" />}>
          {loading ? 'Generating documents...' : 'Generate Documents'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Reset
        </Button>
      </div>
    </form>
  )
}
