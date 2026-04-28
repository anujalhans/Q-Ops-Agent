import { useState } from 'react'
import type { DragEvent, FormEvent, KeyboardEvent, ReactNode } from 'react'
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  History,
  LayoutDashboard,
  Lightbulb,
  Moon,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sun,
  UploadCloud,
} from 'lucide-react'
import { generateDocument, uploadKnowledgeBase } from '../lib/api'
import type { DocumentArtifactKey, JobStatus } from '../lib/api'
import { useJobPolling } from '../hooks/useJobPolling'
import { useTheme } from '../theme/ThemeProvider'

type ToastType = 'success' | 'error' | 'info'

type Props = {
  onLogout: () => void
  addToast: (t: { title: string; message: string; type: ToastType }) => void
}

type Tab = 'knowledge' | 'documents'

const avatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2_5igboenzua4QV1n09BOuadd_z0UdTMejCLRP4RaWaJAcsU3phXele5Z6cEIpTb759xzIOfJS1B6c__x-ds5VU_VlCjVPXURHxNng1nBt6OxZIDFK5yy-Sz_TRNumvNxk5ljvRZVxGaYqCQ3wV93F3gHw25NnWsMsYgR4ErCs6Vnt5fd8j6vJO9oZCRJO_ni7MWeUcIxTjqbmOGno8tdkuNjAyBAkMcOJmk2zaufBFdiYHT-DzHMCTVT_v_zeRch41YQiFpeYXe4'

const artifactOptions: Array<{ key: DocumentArtifactKey; label: string; description: string }> = [
  { key: 'strategy', label: 'Test Strategy', description: 'Generate Test Strategy from your knowledge base.' },
  { key: 'plan', label: 'Test Plan', description: 'Generate Test Plan from your knowledge base.' },
  { key: 'risk', label: 'Risk Matrix', description: 'Generate Risk Matrix from your knowledge base.' },
  { key: 'testCases', label: 'Test Cases', description: 'Generate Test Cases from your knowledge base.' },
  { key: 'epicsAndStories', label: 'Epics & User Stories', description: 'Generate Epics & User Stories from your knowledge base.' },
  { key: 'traceability_matrix', label: 'Traceability Matrix', description: 'Generate Traceability Matrix from your knowledge base.' },
]

function NavItem({ active, icon: Icon, label, onClick }: { active?: boolean; icon: typeof LayoutDashboard; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded px-6 py-3 text-left transition-transform duration-150 active:scale-[0.98] ${
        active ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-base tracking-wide">{label}</span>
    </button>
  )
}

export default function DashboardPage({ onLogout, addToast }: Props) {
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState<Tab>('knowledge')
  const [projectName, setProjectName] = useState('')
  const [brd, setBrd] = useState<File | null>(null)
  const [frd, setFrd] = useState<File | null>(null)
  const [hld, setHld] = useState<File | null>(null)
  const [lld, setLld] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [kbSubmitting, setKbSubmitting] = useState(false)
  const [kbError, setKbError] = useState('')

  const [generationProject, setGenerationProject] = useState('')
  const [artifact, setArtifact] = useState<DocumentArtifactKey | ''>('')
  const [docSubmitting, setDocSubmitting] = useState(false)
  const [docError, setDocError] = useState('')

  const kbJob = useJobPolling('kb', addToast)
  const docJob = useJobPolling('doc', addToast)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const submitKnowledge = async (event: FormEvent) => {
    event.preventDefault()
    setKbSubmitting(true)
    setKbError('')
    try {
      const res = await uploadKnowledgeBase({ projectName, brd, frd, hld, lld, transcript, images })
      kbJob.start(res)
      addToast({ title: 'Ingestion started', message: 'Knowledge base ingestion queued.', type: 'info' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setKbError(message)
      addToast({ title: 'Upload failed', message, type: 'error' })
    } finally {
      setKbSubmitting(false)
    }
  }

  const resetKnowledge = () => {
    setProjectName('')
    setBrd(null)
    setFrd(null)
    setHld(null)
    setLld(null)
    setTranscript(null)
    setImages([])
    setKbError('')
    kbJob.reset()
    addToast({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
  }

  const submitDocument = async (event: FormEvent) => {
    event.preventDefault()
    if (!generationProject.trim() || !artifact) {
      setDocError('Please select project and artifact type')
      return
    }
    setDocSubmitting(true)
    setDocError('')
    try {
      const res = await generateDocument({ projectName: generationProject, artifact })
      docJob.start(res)
      addToast({ title: 'Generation started', message: 'Document generation queued.', type: 'info' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setDocError(message)
      addToast({ title: 'Generation failed', message, type: 'error' })
    } finally {
      setDocSubmitting(false)
    }
  }

  const resetDocument = () => {
    setGenerationProject('')
    setArtifact('')
    setDocError('')
    docJob.reset()
    addToast({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] text-[#1b1b24]">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-80 flex-col border-r border-slate-200 bg-slate-50/80 backdrop-blur-xl">
        <div className="flex h-28 items-center gap-4 px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4f46e5] text-white shadow-sm">
            <Network className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none text-slate-900">Q-Ops Agent</h1>
            <p className="text-xs font-medium text-slate-500">A Purpose-Built AI System for QA Engineering</p>
          </div>
        </div>
        <nav className="flex-1 space-y-4 px-5">
          <NavItem active icon={LayoutDashboard} label="Dashboard" onClick={() => setTab('knowledge')} />
          <NavItem icon={Archive} label="Artifacts" />
          <NavItem icon={FileText} label="Doc Gen" onClick={() => setTab('documents')} />
          <NavItem icon={BookOpen} label="Knowledge Base" onClick={() => setTab('knowledge')} />
          <NavItem icon={BarChart3} label="Analytics" />
        </nav>
        <div className="mt-auto space-y-4 border-t border-slate-200 px-5 py-8">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={BookOpen} label="Documentation" />
        </div>
      </aside>

      <main className="ml-80 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-10 shadow-sm">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input className="w-[400px] rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]/10" placeholder="Search operations..." />
          </div>
          <div className="flex items-center gap-5">
            <button onClick={toggle} className="rounded-full p-2 text-slate-600 transition-all hover:bg-slate-50" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button className="relative rounded-full p-2 text-slate-600 transition-all hover:bg-slate-50" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#ba1a1a]" />
            </button>
            <button className="rounded-full p-2 text-slate-600 transition-all hover:bg-slate-50" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">System Architect</p>
              </div>
              <img src={avatar} alt="User profile" className="h-10 w-10 rounded-full border-2 border-slate-100 object-cover" />
              <button onClick={onLogout} className="rounded-lg border border-[#c7c4d8] px-3 py-2 text-sm font-semibold hover:bg-[#f5f2ff]">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-10">
          <div className="mx-auto w-full max-w-[1200px] space-y-10">
            <section className="flex items-end justify-between">
              <div>
                <h2 className="text-[44px] font-bold leading-[52px] tracking-tight">{greeting}, Admin</h2>
                <p className="mt-2 text-base text-[#464555]">
                  Workspace initialized. You have <span className="font-bold text-[#3525cd]">3 active processing jobs</span> and 12 unread artifacts.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-[#c7c4d8] px-4 py-2 text-sm font-semibold hover:bg-[#f0ecf9]">
                  <History className="h-4 w-4" /> View Audit Log
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-[#3525cd] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                  <Plus className="h-4 w-4" /> New Project
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-[30px] lg:grid-cols-[790px_380px]">
              <div className="space-y-[30px]">
                <div className="overflow-hidden rounded-xl border border-[#c7c4d8] bg-white">
                  <div className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-[#c7c4d8] bg-[#f5f2ff]">
                    <button aria-pressed={tab === 'knowledge'} onClick={() => setTab('knowledge')} className={`px-6 py-4 text-base ${tab === 'knowledge' ? 'border-b-2 border-[#3525cd] font-bold text-[#3525cd]' : 'font-medium text-[#464555]'}`}>1. Knowledge Base</button>
                    <button aria-pressed={tab === 'documents'} onClick={() => setTab('documents')} className={`px-6 py-4 text-base ${tab === 'documents' ? 'border-b-2 border-[#3525cd] font-bold text-[#3525cd]' : 'font-medium text-[#464555]'}`}>2. Generate Documents</button>
                    <span className="px-6 text-xs font-semibold uppercase tracking-wider text-[#777587]">Workspace</span>
                  </div>
                  {tab === 'knowledge' ? (
                    <KnowledgeForm
                      projectName={projectName}
                      setProjectName={setProjectName}
                      brd={brd}
                      setBrd={setBrd}
                      frd={frd}
                      setFrd={setFrd}
                      hld={hld}
                      setHld={setHld}
                      lld={lld}
                      setLld={setLld}
                      transcript={transcript}
                      setTranscript={setTranscript}
                      images={images}
                      setImages={setImages}
                      error={kbError || kbJob.state.error}
                      submitting={kbSubmitting}
                      onSubmit={submitKnowledge}
                      onReset={resetKnowledge}
                    />
                  ) : (
                    <DocumentForm
                      projectName={generationProject}
                      setProjectName={setGenerationProject}
                      artifact={artifact}
                      setArtifact={setArtifact}
                      error={docError || docJob.state.error}
                      submitting={docSubmitting}
                      onSubmit={submitDocument}
                      onReset={resetDocument}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-[30px]">
                <StatusPanel kind={tab} state={tab === 'knowledge' ? kbJob.state : docJob.state} />
                {tab === 'documents' ? <OutputPanel output={docJob.state.output} status={docJob.state.status} /> : null}
                <QuickTips tab={tab} />
                <div className="rounded-xl border border-[#c7c4d8] bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12">
                      <svg className="h-full w-full -rotate-90">
                        <circle className="text-slate-100" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4" />
                        <circle className="text-indigo-600" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset="35" strokeWidth="4" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">72%</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Compute Load</p>
                      <p className="text-xs text-slate-500">Optimum Performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function KnowledgeForm(props: {
  projectName: string
  setProjectName: (value: string) => void
  brd: File | null
  setBrd: (file: File | null) => void
  frd: File | null
  setFrd: (file: File | null) => void
  hld: File | null
  setHld: (file: File | null) => void
  lld: File | null
  setLld: (file: File | null) => void
  transcript: File | null
  setTranscript: (file: File | null) => void
  images: File[]
  setImages: (files: File[]) => void
  error: string
  submitting: boolean
  onSubmit: (event: FormEvent) => void
  onReset: () => void
}) {
  return (
    <form className="space-y-8 p-8" onSubmit={props.onSubmit}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Knowledge Ingestion</h3>
        <p className="text-sm leading-6 text-[#464555]">Upload your project artifacts to build a knowledgebase.</p>
      </div>
      <LabeledInput label="Project name" helper="Give a clear, descriptive project name for traceability.">
        <input value={props.projectName} onChange={(e) => props.setProjectName(e.target.value)} placeholder="Enter knowledge project name" className="w-full rounded-lg border border-[#c7c4d8] px-4 py-3 text-sm outline-none focus:border-[#3525cd]" />
      </LabeledInput>
      <FieldGroup title="Business Documents">
        <FileDrop label="BRD document" accept=".pdf,.doc,.docx" file={props.brd} onFiles={(files) => props.setBrd(files[0] ?? null)} />
        <FileDrop label="FRD document" accept=".pdf,.doc,.docx" file={props.frd} onFiles={(files) => props.setFrd(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Technical Documents">
        <FileDrop label="HLD document" accept=".pdf,.doc,.docx" file={props.hld} onFiles={(files) => props.setHld(files[0] ?? null)} />
        <FileDrop label="LLD document" accept=".pdf,.doc,.docx" file={props.lld} onFiles={(files) => props.setLld(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Supporting Assets">
        <FileDrop label="Transcript file" accept=".txt" file={props.transcript} onFiles={(files) => props.setTranscript(files[0] ?? null)} />
        <FileDrop label="UI designs" accept=".jpg,.png" files={props.images} multiple helper="Upload one or more design images for your UI assets." onFiles={props.setImages} />
      </FieldGroup>
      {props.error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{props.error}</p> : null}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-[#c7c4d8] px-6 py-3 text-sm font-bold hover:bg-[#f5f2ff]">Reset</button>
        <button disabled={props.submitting} className="rounded-lg bg-[#3525cd] px-6 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          {props.submitting ? 'Creating knowledge base...' : 'Create Knowledge Base'}
        </button>
      </div>
    </form>
  )
}

function DocumentForm(props: {
  projectName: string
  setProjectName: (value: string) => void
  artifact: DocumentArtifactKey | ''
  setArtifact: (value: DocumentArtifactKey) => void
  error: string
  submitting: boolean
  onSubmit: (event: FormEvent) => void
  onReset: () => void
}) {
  return (
    <form className="space-y-8 p-8" onSubmit={props.onSubmit}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Generate Documents</h3>
        <p className="text-sm leading-6 text-[#464555]">Choose outputs and generate QA deliverables from your knowledge base.</p>
      </div>
      <LabeledInput label="Project name">
        <input value={props.projectName} onChange={(e) => props.setProjectName(e.target.value)} placeholder="Enter existing knowledge project name" className="w-full rounded-lg border border-[#c7c4d8] px-4 py-3 text-sm outline-none focus:border-[#3525cd]" />
      </LabeledInput>
      <div>
        <p className="mb-3 text-sm font-bold text-slate-800">Select artifacts</p>
        <div className="grid grid-cols-2 gap-4">
          {artifactOptions.map((item) => {
            const selected = props.artifact === item.key
            const select = () => props.setArtifact(item.key)
            const onKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                select()
              }
            }
            return (
              <label key={item.key} tabIndex={0} onKeyDown={onKeyDown} className={`cursor-pointer rounded-xl border p-5 text-left outline-none ${selected ? 'border-[#3525cd] bg-indigo-50 ring-2 ring-[#3525cd]/10' : 'border-[#c7c4d8] bg-white hover:border-[#3525cd]'}`}>
                <input className="sr-only" type="radio" name="artifact" checked={selected} onChange={select} />
                <span className="font-bold text-slate-900">{item.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
              </label>
            )
          })}
        </div>
      </div>
      {props.error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{props.error}</p> : null}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-[#c7c4d8] px-6 py-3 text-sm font-bold hover:bg-[#f5f2ff]">Reset</button>
        <button disabled={props.submitting} className="rounded-lg bg-[#3525cd] px-6 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          {props.submitting ? 'Generating documents...' : 'Generate Documents'}
        </button>
      </div>
    </form>
  )
}

function LabeledInput({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {children}
      {helper ? <span className="block text-xs text-slate-500">{helper}</span> : null}
    </label>
  )
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#464555]">{title}</h4>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </section>
  )
}

function FileDrop({ label, accept, file, files, multiple, helper, onFiles }: { label: string; accept: string; file?: File | null; files?: File[]; multiple?: boolean; helper?: string; onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false)
  const selectedText = multiple ? (files?.length ? `${files.length} files selected` : 'No file selected') : file?.name ?? 'No file selected'
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    onFiles(Array.from(event.dataTransfer.files))
  }
  return (
    <label
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border border-dashed p-5 transition-colors ${dragging ? 'border-[#3525cd] bg-indigo-50' : 'border-[#c7c4d8] bg-white hover:border-[#3525cd]'}`}
    >
      <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => onFiles(Array.from(event.target.files ?? []))} />
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-slate-900">{label}</span>
        <UploadCloud className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-xs font-medium text-[#3525cd]">{selectedText}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </label>
  )
}

function StatusPanel({ kind, state }: { kind: Tab; state: { status: JobStatus; jobId: string | null; error: string } }) {
  if (state.status === 'idle') {
    return (
      <section className="overflow-hidden rounded-xl border border-[#c7c4d8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#c7c4d8] bg-[#f5f2ff] p-5">
          <h3 className="text-xl font-semibold">Job Status</h3>
          <RefreshCw className="h-4 w-4" />
        </div>
        <div className="p-6 text-sm text-[#464555]">No active {kind === 'knowledge' ? 'knowledge base' : 'document generation'} job.</div>
      </section>
    )
  }

  const pct = state.status === 'completed' ? 100 : state.status === 'processing' ? 50 : 25
  const message =
    kind === 'knowledge'
      ? statusMessage(state.status, 'Queued for ingestion. Polling starts in 30 seconds.', 'Processing continues. Polling every 45 seconds until completion.', 'Knowledge base created successfully.', 'Knowledge base creation failed.')
      : statusMessage(state.status, 'Generation queued. Polling starts in 30 seconds.', 'Generating document. Polling every 45 seconds until completion.', 'Document generated successfully.', 'Document generation failed.')
  return (
    <section className="overflow-hidden rounded-xl border border-[#c7c4d8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#c7c4d8] bg-[#f5f2ff] p-5">
        <h3 className="text-xl font-semibold">Job Status</h3>
        <RefreshCw className="h-4 w-4" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold capitalize text-slate-800">{state.status.replace('_', ' ')}</p>
          <p className="text-xs font-semibold text-[#3525cd]">{pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${state.status === 'failed' ? 'bg-red-500' : state.status === 'completed' ? 'bg-emerald-500' : 'bg-[#3525cd]'} ${state.status === 'processing' ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="break-all text-xs text-slate-500">Job ID: {state.jobId}</p>
        <p className="text-sm text-[#464555]">{message}</p>
        {state.error ? <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">{state.error}</p> : null}
      </div>
    </section>
  )
}

function statusMessage(status: JobStatus, queued: string, processing: string, completed: string, failed: string) {
  if (status === 'queued') return queued
  if (status === 'processing') return processing
  if (status === 'completed') return completed
  if (status === 'failed') return failed
  return 'Waiting for the backend to return a matching job.'
}

function OutputPanel({ status, output }: { status: JobStatus; output: any }) {
  if (status !== 'completed' || !output) return null
  if (output.epics && output.stories) {
    return (
      <section className="rounded-xl border border-[#c7c4d8] bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Generated Jira Output</h3>
        <OutputList title="Epics" items={output.epics} keyName="epicID" labelName="epicKey" linkName="epicLink" />
        <OutputList title="User Stories" items={output.stories} keyName="storyID" labelName="storyKey" linkName="storyLink" />
      </section>
    )
  }
  if (output.url) {
    return (
      <section className="rounded-xl border border-[#c7c4d8] bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold">Document Link</h3>
        <a className="font-bold text-[#3525cd] underline" href={output.url} target="_blank" rel="noopener noreferrer">Open Document</a>
      </section>
    )
  }
  return null
}

function OutputList({ title, items, keyName, labelName, linkName }: { title: string; items: any[]; keyName: string; labelName: string; linkName: string }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#464555]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a key={item[keyName]} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#3525cd]" href={item[linkName]} target="_blank" rel="noopener noreferrer">
            {item[labelName]}
          </a>
        ))}
      </div>
    </div>
  )
}

function QuickTips({ tab }: { tab: Tab }) {
  const tips =
    tab === 'knowledge'
      ? ['Use clear knowledge project names for traceable AI assets.', 'Upload required source documents to build the knowledge base.', 'Verify the API at localhost:5678 if requests fail.']
      : ['Select a document type to generate QA artifacts.', 'Reference an existing knowledge base project.', 'Generated documents will appear as Jira or Confluence links.']
  return (
    <section className="relative overflow-hidden rounded-xl bg-indigo-900 p-6 text-white shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-indigo-300" />
        <h3 className="text-sm font-bold tracking-wide">QUICK TIPS</h3>
      </div>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={tip} className="border-l-2 border-indigo-400 py-1 pl-4">
            <p className="text-xs font-semibold uppercase text-indigo-200">Tip #{index + 1}</p>
            <p className="mt-1 text-sm text-indigo-50">{tip}</p>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full rounded-lg border border-white/20 bg-white/10 py-2 text-xs font-bold text-white transition-all hover:bg-white/20">View Help Center</button>
    </section>
  )
}
