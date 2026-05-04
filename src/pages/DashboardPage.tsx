import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent, KeyboardEvent, ReactNode, SetStateAction } from 'react'
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  Gauge,
  HelpCircle,
  History,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Moon,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UploadCloud,
  X,
} from 'lucide-react'
import { API_BASE_URL_KEY, DEFAULT_API_BASE_URL, generateDocument, getApiBaseUrl, uploadKnowledgeBase } from '../lib/api'
import type { DocumentArtifactKey, JobStatus } from '../lib/api'
import { useJobPolling } from '../hooks/useJobPolling'
import { useTheme } from '../theme/ThemeProvider'

type ToastType = 'success' | 'error' | 'info'
type View = 'overview' | 'knowledge' | 'documents' | 'artifacts' | 'analytics' | 'settings' | 'docs'
type WorkspaceTab = 'knowledge' | 'documents'
type Overlay = 'search' | 'notifications' | 'help' | 'audit' | 'project' | 'status' | 'diagnostics' | null
type StatusTone = 'success' | 'error' | 'info' | 'warning'

type Props = {
  onLogout: () => void
  addToast: (t: { title: string; message: string; type: ToastType }) => void
}

type Project = {
  id: string
  name: string
  description: string
  owner: string
  module: string
  release: string
  tags: string[]
  status: 'draft' | 'ingesting' | 'ready' | 'generating' | 'blocked'
  createdAt: string
  updatedAt: string
}

type ArtifactRecord = {
  id: string
  projectName: string
  type: string
  fileName: string
  size: number
  uploadedAt: string
  status: 'processing' | 'processed' | 'failed'
}

type NotificationEvent = {
  id: string
  title: string
  message: string
  type: StatusTone
  createdAt: string
  read: boolean
  actionLabel?: string
  actionView?: View
}

type AuditEvent = {
  id: string
  actor: string
  action: string
  project: string
  entity: string
  status: StatusTone
  timestamp: string
  details: string
}

type GeneratedOutput = {
  id: string
  projectName: string
  artifactLabel: string
  createdAt: string
  status: 'queued' | 'completed'
  url?: string
}

type SettingsState = {
  name: string
  role: string
  email: string
  apiBaseUrl: string
  jiraUrl: string
  confluenceSpace: string
  inAppNotifications: boolean
  emailNotifications: boolean
  sessionTimeout: string
}

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

const defaultSettings: SettingsState = {
  name: 'Admin User',
  role: 'System Architect',
  email: 'admin@qops.local',
  apiBaseUrl: DEFAULT_API_BASE_URL,
  jiraUrl: '',
  confluenceSpace: '',
  inAppNotifications: true,
  emailNotifications: false,
  sessionTimeout: '60',
}

const helpArticles = [
  { title: 'Create a project', group: 'Projects', body: 'Start with a project name, owner, module, and release. The wizard then guides you into artifact upload.' },
  { title: 'Required artifacts', group: 'Knowledge Base', body: 'BRD and FRD define business scope. HLD and LLD add technical coverage. Transcripts and UI designs improve edge-case discovery.' },
  { title: 'Knowledge base ingestion', group: 'Knowledge Base', body: 'Uploaded artifacts are sent to the n8n upload webhook and tracked as a long-running job.' },
  { title: 'Generate QA outputs', group: 'Document Generation', body: 'Choose an existing knowledge project and output type such as risk matrix, test cases, RTM, or Jira-ready epics.' },
  { title: 'Backend troubleshooting', group: 'Settings', body: 'Confirm the n8n base URL, upload webhook, generation webhook, and polling endpoints in Settings or System Status.' },
]

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function NavItem({ active, icon: Icon, label, onClick }: { active?: boolean; icon: typeof LayoutDashboard; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-lg px-6 py-3 text-left transition-transform duration-150 active:scale-[0.98] ${
        active ? 'bg-primary/10 font-semibold text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-semibold tracking-wide">{label}</span>
    </button>
  )
}

export default function DashboardPage({ onLogout, addToast }: Props) {
  const { theme, toggle } = useTheme()
  const [view, setView] = useState<View>('overview')
  const [tab, setTab] = useState<WorkspaceTab>('knowledge')
  const [overlay, setOverlay] = useState<Overlay>(null)
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
  const [settings, setSettings] = usePersistentState<SettingsState>('qops-agent-settings', { ...defaultSettings, apiBaseUrl: getApiBaseUrl() })
  const [projects, setProjects] = usePersistentState<Project[]>('qops-agent-projects', [])
  const [artifactRecords, setArtifactRecords] = usePersistentState<ArtifactRecord[]>('qops-agent-artifacts', [])
  const [notifications, setNotifications] = usePersistentState<NotificationEvent[]>('qops-agent-notifications', [
    {
      id: 'welcome-notification',
      title: 'Workspace ready',
      message: 'Create a project or upload artifacts to build QA intelligence.',
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false,
      actionLabel: 'Create project',
      actionView: 'knowledge',
    },
  ])
  const [auditEvents, setAuditEvents] = usePersistentState<AuditEvent[]>('qops-agent-audit-events', [])
  const [generatedOutputs, setGeneratedOutputs] = usePersistentState<GeneratedOutput[]>('qops-agent-generated-outputs', [])
  const [connectionResult, setConnectionResult] = useState<{ status: StatusTone; message: string } | null>(null)

  const logEvent = useCallback(
    (event: Omit<AuditEvent, 'id' | 'actor' | 'timestamp'>) => {
      setAuditEvents((current) => [
        {
          ...event,
          id: uid('audit'),
          actor: settings.name || 'Admin User',
          timestamp: new Date().toISOString(),
        },
        ...current,
      ])
    },
    [setAuditEvents, settings.name],
  )

  const notify = useCallback(
    (toast: { title: string; message: string; type: ToastType }, actionView?: View) => {
      addToast(toast)
      if (settings.inAppNotifications) {
        setNotifications((current) => [
          {
            id: uid('notification'),
            title: toast.title,
            message: toast.message,
            type: toast.type,
            createdAt: new Date().toISOString(),
            read: false,
            actionLabel: actionView ? 'Open' : undefined,
            actionView,
          },
          ...current,
        ])
      }
    },
    [addToast, setNotifications, settings.inAppNotifications],
  )

  const kbJob = useJobPolling('kb', notify)
  const docJob = useJobPolling('doc', notify)

  useEffect(() => {
    localStorage.setItem(API_BASE_URL_KEY, settings.apiBaseUrl.trim() || DEFAULT_API_BASE_URL)
  }, [settings.apiBaseUrl])

  useEffect(() => {
    if (kbJob.state.status === 'completed' && projectName.trim()) {
      const now = new Date().toISOString()
      setProjects((current) =>
        upsertProject(current, {
          name: projectName.trim(),
          status: 'ready',
          updatedAt: now,
        }),
      )
      setArtifactRecords((current) => current.map((item) => (item.projectName === projectName.trim() && item.status === 'processing' ? { ...item, status: 'processed' } : item)))
    }
  }, [kbJob.state.status, projectName, setArtifactRecords, setProjects])

  useEffect(() => {
    if (docJob.state.status !== 'completed' || !generationProject.trim() || !artifact) return
    const option = artifactOptions.find((item) => item.key === artifact)
    const output = docJob.state.output
    const url = output?.url || output?.documentUrl || output?.link
    setGeneratedOutputs((current) => [
      {
        id: uid('output'),
        projectName: generationProject.trim(),
        artifactLabel: option?.label ?? artifact,
        createdAt: new Date().toISOString(),
        status: 'completed',
        url,
      },
      ...current,
    ])
  }, [artifact, docJob.state.output, docJob.state.status, generationProject, setGeneratedOutputs])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOverlay('search')
      }
      if (event.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const activeJobs = [kbJob.state.status, docJob.state.status].filter((status) => status === 'queued' || status === 'processing' || status === 'not_found').length
  const failedJobs = [kbJob.state.status, docJob.state.status].filter((status) => status === 'failed').length
  const unreadCount = notifications.filter((item) => !item.read).length
  const selectedFiles = [brd, frd, hld, lld, transcript].filter(Boolean).length + images.length
  const readyKnowledgeBases = projects.filter((project) => project.status === 'ready').length

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const openWorkspace = (nextTab: WorkspaceTab) => {
    setView(nextTab === 'knowledge' ? 'knowledge' : 'documents')
    setTab(nextTab)
  }

  const submitKnowledge = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) {
      setKbError('Project name is required.')
      return
    }
    setKbSubmitting(true)
    setKbError('')
    try {
      const now = new Date().toISOString()
      const files: Array<[string, File]> = []
      if (brd) files.push(['BRD', brd])
      if (frd) files.push(['FRD', frd])
      if (hld) files.push(['HLD', hld])
      if (lld) files.push(['LLD', lld])
      if (transcript) files.push(['Transcript', transcript])
      images.forEach((file) => files.push(['UI Design', file]))

      setProjects((current) =>
        upsertProject(current, {
          name: projectName.trim(),
          status: 'ingesting',
          updatedAt: now,
        }),
      )
      setArtifactRecords((current) => [
        ...files.map(([type, file]) => ({
          id: uid('artifact'),
          projectName: projectName.trim(),
          type,
          fileName: file.name,
          size: file.size,
          uploadedAt: now,
          status: 'processing' as const,
        })),
        ...current,
      ])
      const res = await uploadKnowledgeBase({ projectName, brd, frd, hld, lld, transcript, images })
      kbJob.start(res)
      notify({ title: 'Ingestion started', message: 'Knowledge base ingestion queued.', type: 'info' }, 'knowledge')
      logEvent({ action: 'Knowledge base ingestion submitted', project: projectName.trim(), entity: res.jobId, status: 'info', details: `${files.length} artifacts submitted to n8n.` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setKbError(message)
      notify({ title: 'Upload failed', message, type: 'error' }, 'settings')
      logEvent({ action: 'Knowledge base ingestion failed', project: projectName.trim(), entity: 'Upload webhook', status: 'error', details: message })
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
    notify({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
    logEvent({ action: 'Knowledge base form reset', project: 'Current workspace', entity: 'Knowledge form', status: 'info', details: 'Selected artifacts and job state cleared.' })
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
      const option = artifactOptions.find((item) => item.key === artifact)
      setGeneratedOutputs((current) => [
        {
          id: uid('output'),
          projectName: generationProject.trim(),
          artifactLabel: option?.label ?? artifact,
          createdAt: new Date().toISOString(),
          status: 'queued',
        },
        ...current,
      ])
      notify({ title: 'Generation started', message: 'Document generation queued.', type: 'info' }, 'documents')
      logEvent({ action: 'Document generation submitted', project: generationProject.trim(), entity: option?.label ?? artifact, status: 'info', details: `Job ID ${res.jobId}` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setDocError(message)
      notify({ title: 'Generation failed', message, type: 'error' }, 'settings')
      logEvent({ action: 'Document generation failed', project: generationProject.trim(), entity: artifact || 'Document request', status: 'error', details: message })
    } finally {
      setDocSubmitting(false)
    }
  }

  const resetDocument = () => {
    setGenerationProject('')
    setArtifact('')
    setDocError('')
    docJob.reset()
    notify({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
    logEvent({ action: 'Document generation form reset', project: 'Current workspace', entity: 'Document form', status: 'info', details: 'Document inputs and job state cleared.' })
  }

  const createProject = (project: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const nextProject: Project = { ...project, id: uid('project'), status: 'draft', createdAt: now, updatedAt: now }
    setProjects((current) => [nextProject, ...current.filter((item) => item.name.toLowerCase() !== project.name.toLowerCase())])
    setProjectName(project.name)
    setGenerationProject(project.name)
    setView('knowledge')
    setTab('knowledge')
    setOverlay(null)
    notify({ title: 'Project created', message: 'Upload artifacts to build QA intelligence.', type: 'success' }, 'knowledge')
    logEvent({ action: 'Project created', project: project.name, entity: project.module || 'Project', status: 'success', details: project.description || 'Draft project created locally.' })
  }

  const testConnection = async () => {
    setConnectionResult({ status: 'info', message: 'Checking backend reachability...' })
    try {
      const started = performance.now()
      await fetch(`${settings.apiBaseUrl.replace(/\/$/, '')}/webhook/health`, { method: 'GET' })
      setConnectionResult({ status: 'success', message: `Backend responded in ${Math.round(performance.now() - started)} ms.` })
    } catch {
      setConnectionResult({ status: 'error', message: `The frontend is running, but the backend could not be reached at ${settings.apiBaseUrl}.` })
    }
  }

  const pageTitle = view === 'overview' ? `${greeting}, Admin` : viewLabels[view]

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-80 flex-col border-r border-outline-variant bg-surface-container-lowest/90 backdrop-blur-xl">
        <div className="flex h-28 items-center gap-4 px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
            <Network className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none text-on-surface">Q-Ops Agent</h1>
            <p className="text-xs font-medium text-on-surface-variant">A Purpose-Built AI System for QA Engineering</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-5">
          <NavItem active={view === 'overview'} icon={LayoutDashboard} label="Dashboard" onClick={() => setView('overview')} />
          <NavItem active={view === 'artifacts'} icon={Archive} label="Artifacts" onClick={() => setView('artifacts')} />
          <NavItem active={view === 'documents'} icon={FileText} label="Doc Gen" onClick={() => openWorkspace('documents')} />
          <NavItem active={view === 'knowledge'} icon={BookOpen} label="Knowledge Base" onClick={() => openWorkspace('knowledge')} />
          <NavItem active={view === 'analytics'} icon={BarChart3} label="Analytics" onClick={() => setView('analytics')} />
        </nav>
        <div className="mt-auto space-y-2 border-t border-outline-variant px-5 py-8">
          <NavItem active={view === 'settings'} icon={Settings} label="Settings" onClick={() => setView('settings')} />
          <NavItem active={view === 'docs'} icon={BookOpen} label="Documentation" onClick={() => setView('docs')} />
        </div>
      </aside>

      <main className="ml-80 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-10 shadow-sm">
          <button onClick={() => setOverlay('search')} className="relative flex w-[400px] items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-left text-sm text-on-surface-variant outline-none transition-colors hover:border-primary">
            <Search className="mr-3 h-4 w-4" />
            <span>Search operations...</span>
            <kbd className="ml-auto rounded border border-outline-variant px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">Ctrl K</kbd>
          </button>
          <div className="flex items-center gap-5">
            <button onClick={toggle} className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => setOverlay('notifications')} className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-error px-1 text-center text-[10px] font-bold text-on-error">{unreadCount}</span> : null}
            </button>
            <button onClick={() => setOverlay('help')} className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-outline-variant" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">{settings.name || 'Admin User'}</p>
                <p className="text-xs text-on-surface-variant">{settings.role || 'System Architect'}</p>
              </div>
              <img src={avatar} alt="User profile" className="h-10 w-10 rounded-full border-2 border-outline-variant object-cover" />
              <button onClick={onLogout} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold hover:bg-surface-container">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-10">
          <div className="mx-auto w-full max-w-[1200px] space-y-8">
            <section className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-[42px] font-bold leading-[50px] tracking-tight text-on-surface">{pageTitle}</h2>
                <p className="mt-2 text-base text-on-surface-variant">
                  {view === 'overview'
                    ? `Workspace initialized with ${activeJobs} active ${activeJobs === 1 ? 'job' : 'jobs'}, ${artifactRecords.length + selectedFiles} artifacts, and ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}.`
                    : sectionDescriptions[view]}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setOverlay('audit')} className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
                  <History className="h-4 w-4" /> View Audit Log
                </button>
                <button onClick={() => setOverlay('project')} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                  <Plus className="h-4 w-4" /> New Project
                </button>
              </div>
            </section>

            {view === 'overview' ? (
              <Overview
                activeJobs={activeJobs}
                failedJobs={failedJobs}
                artifactCount={artifactRecords.length + selectedFiles}
                outputs={generatedOutputs.length}
                readyKnowledgeBases={readyKnowledgeBases}
                onOpenNotifications={() => setOverlay('notifications')}
                onOpenArtifacts={() => setView('artifacts')}
                onOpenDocuments={() => openWorkspace('documents')}
              />
            ) : null}

            {view === 'overview' || view === 'knowledge' || view === 'documents' ? (
              <div className="grid grid-cols-1 items-start gap-[30px] lg:grid-cols-[790px_380px]">
                <div className="space-y-[30px]">
                  <WorkspaceCard
                    tab={tab}
                    setTab={(next) => {
                      setTab(next)
                      setView(next === 'knowledge' ? 'knowledge' : 'documents')
                    }}
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
                    kbError={kbError || kbJob.state.error}
                    kbSubmitting={kbSubmitting}
                    onKnowledgeSubmit={submitKnowledge}
                    onKnowledgeReset={resetKnowledge}
                    generationProject={generationProject}
                    setGenerationProject={setGenerationProject}
                    artifact={artifact}
                    setArtifact={setArtifact}
                    docError={docError || docJob.state.error}
                    docSubmitting={docSubmitting}
                    onDocumentSubmit={submitDocument}
                    onDocumentReset={resetDocument}
                    projects={projects}
                    outputs={generatedOutputs}
                  />
                </div>
                <div className="space-y-[30px]">
                  <StatusPanel kind={tab} state={tab === 'knowledge' ? kbJob.state : docJob.state} />
                  {tab === 'documents' ? <OutputPanel output={docJob.state.output} status={docJob.state.status} /> : null}
                  <QuickTips tab={tab} onHelp={() => setOverlay('help')} />
                  <ComputeLoadCard activeJobs={activeJobs} failedJobs={failedJobs} onClick={() => setOverlay('diagnostics')} />
                </div>
              </div>
            ) : null}

            {view === 'artifacts' ? <ArtifactsRepository records={artifactRecords} projects={projects} onUpload={() => openWorkspace('knowledge')} onAudit={() => setOverlay('audit')} /> : null}
            {view === 'analytics' ? <AnalyticsPage projects={projects} artifacts={artifactRecords} outputs={generatedOutputs} activeJobs={activeJobs} failedJobs={failedJobs} /> : null}
            {view === 'settings' ? <SettingsPage settings={settings} setSettings={setSettings} connectionResult={connectionResult} onTestConnection={testConnection} onStatus={() => setOverlay('status')} /> : null}
            {view === 'docs' ? <DocumentationPage onHelp={() => setOverlay('help')} onKnowledge={() => openWorkspace('knowledge')} onStatus={() => setOverlay('status')} /> : null}
          </div>
        </div>
      </main>

      {overlay === 'search' ? <SearchPalette projects={projects} artifacts={artifactRecords} outputs={generatedOutputs} jobs={[kbJob.state, docJob.state]} onClose={() => setOverlay(null)} setView={setView} onHelp={() => setOverlay('help')} /> : null}
      {overlay === 'notifications' ? <NotificationDrawer notifications={notifications} setNotifications={setNotifications} onClose={() => setOverlay(null)} setView={setView} /> : null}
      {overlay === 'help' ? <HelpDrawer activeView={view} onClose={() => setOverlay(null)} onDocs={() => { setView('docs'); setOverlay(null) }} /> : null}
      {overlay === 'audit' ? <AuditLogModal events={auditEvents} onClose={() => setOverlay(null)} /> : null}
      {overlay === 'project' ? <NewProjectWizard existingNames={projects.map((project) => project.name)} onClose={() => setOverlay(null)} onCreate={createProject} /> : null}
      {overlay === 'status' ? <StatusModal apiBaseUrl={settings.apiBaseUrl} onClose={() => setOverlay(null)} /> : null}
      {overlay === 'diagnostics' ? <DiagnosticsModal activeJobs={activeJobs} failedJobs={failedJobs} artifacts={artifactRecords.length} apiBaseUrl={settings.apiBaseUrl} onClose={() => setOverlay(null)} /> : null}
    </div>
  )
}

const viewLabels: Record<View, string> = {
  overview: 'Dashboard',
  knowledge: 'Knowledge Base',
  documents: 'Document Generation',
  artifacts: 'Artifacts Repository',
  analytics: 'Analytics',
  settings: 'Settings',
  docs: 'Documentation',
}

const sectionDescriptions: Record<View, string> = {
  overview: '',
  knowledge: 'Create, update, and review knowledge bases for QA intelligence.',
  documents: 'Generate QA deliverables and review recent generated outputs.',
  artifacts: 'Review uploaded source files, processing status, and recommended coverage.',
  analytics: 'Monitor demo QA operations metrics until backend analytics are connected.',
  settings: 'Configure profile, n8n endpoints, integrations, notifications, and security defaults.',
  docs: 'Learn the Q-Ops workflow, artifact types, backend setup, and troubleshooting steps.',
}

function upsertProject(projects: Project[], patch: Pick<Project, 'name' | 'status' | 'updatedAt'>) {
  const existing = projects.find((item) => item.name.toLowerCase() === patch.name.toLowerCase())
  if (existing) {
    return projects.map((item) => (item.id === existing.id ? { ...item, ...patch } : item))
  }
  return [
    {
      id: uid('project'),
      name: patch.name,
      description: '',
      owner: 'Admin User',
      module: '',
      release: '',
      tags: [],
      status: patch.status,
      createdAt: patch.updatedAt,
      updatedAt: patch.updatedAt,
    },
    ...projects,
  ]
}

function Overview(props: { activeJobs: number; failedJobs: number; artifactCount: number; outputs: number; readyKnowledgeBases: number; onOpenNotifications: () => void; onOpenArtifacts: () => void; onOpenDocuments: () => void }) {
  const cards = [
    { label: 'Active jobs', value: props.activeJobs, detail: props.failedJobs ? `${props.failedJobs} failed job needs review` : 'Queue is clear', icon: Clock, onClick: props.onOpenNotifications },
    { label: 'Artifacts', value: props.artifactCount, detail: 'Uploaded or selected in this workspace', icon: Archive, onClick: props.onOpenArtifacts },
    { label: 'Generated outputs', value: props.outputs, detail: 'Recent document and Jira results', icon: FileText, onClick: props.onOpenDocuments },
    { label: 'Knowledge bases ready', value: props.readyKnowledgeBases, detail: 'Ready for document generation', icon: Database, onClick: props.onOpenArtifacts },
  ]
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <button key={card.label} onClick={card.onClick} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left shadow-sm transition hover:border-primary">
            <div className="mb-4 flex items-center justify-between">
              <Icon className="h-5 w-5 text-primary" />
              <span className="rounded-full bg-surface-container px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">Live</span>
            </div>
            <p className="text-3xl font-bold text-on-surface">{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">{card.label}</p>
            <p className="mt-2 text-xs leading-5 text-on-surface-variant">{card.detail}</p>
          </button>
        )
      })}
    </section>
  )
}

function WorkspaceCard(props: {
  tab: WorkspaceTab
  setTab: (tab: WorkspaceTab) => void
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
  kbError: string
  kbSubmitting: boolean
  onKnowledgeSubmit: (event: FormEvent) => void
  onKnowledgeReset: () => void
  generationProject: string
  setGenerationProject: (value: string) => void
  artifact: DocumentArtifactKey | ''
  setArtifact: (value: DocumentArtifactKey) => void
  docError: string
  docSubmitting: boolean
  onDocumentSubmit: (event: FormEvent) => void
  onDocumentReset: () => void
  projects: Project[]
  outputs: GeneratedOutput[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-outline-variant bg-surface-container-low">
        <button aria-pressed={props.tab === 'knowledge'} onClick={() => props.setTab('knowledge')} className={`px-6 py-4 text-base ${props.tab === 'knowledge' ? 'border-b-2 border-primary font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>1. Knowledge Base</button>
        <button aria-pressed={props.tab === 'documents'} onClick={() => props.setTab('documents')} className={`px-6 py-4 text-base ${props.tab === 'documents' ? 'border-b-2 border-primary font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>2. Generate Documents</button>
        <span className="px-6 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Workspace</span>
      </div>
      {props.tab === 'knowledge' ? (
        <div>
          <KnowledgeBaseSummary projects={props.projects} />
          <KnowledgeForm
            projectName={props.projectName}
            setProjectName={props.setProjectName}
            brd={props.brd}
            setBrd={props.setBrd}
            frd={props.frd}
            setFrd={props.setFrd}
            hld={props.hld}
            setHld={props.setHld}
            lld={props.lld}
            setLld={props.setLld}
            transcript={props.transcript}
            setTranscript={props.setTranscript}
            images={props.images}
            setImages={props.setImages}
            error={props.kbError}
            submitting={props.kbSubmitting}
            onSubmit={props.onKnowledgeSubmit}
            onReset={props.onKnowledgeReset}
          />
        </div>
      ) : (
        <div>
          <DocumentForm
            projectName={props.generationProject}
            setProjectName={props.setGenerationProject}
            artifact={props.artifact}
            setArtifact={props.setArtifact}
            error={props.docError}
            submitting={props.docSubmitting}
            onSubmit={props.onDocumentSubmit}
            onReset={props.onDocumentReset}
            projects={props.projects}
          />
          <RecentOutputs outputs={props.outputs} />
        </div>
      )}
    </div>
  )
}

function KnowledgeBaseSummary({ projects }: { projects: Project[] }) {
  return (
    <section className="border-b border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-on-surface">Existing Knowledge Bases</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Draft and ready projects appear here after project creation or ingestion.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{projects.length} projects</span>
      </div>
      {projects.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <div key={project.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-on-surface">{project.name}</p>
                <StatusBadge status={project.status === 'blocked' ? 'error' : project.status === 'ready' ? 'success' : 'info'} label={project.status} />
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{project.module || 'No module set'} {project.release ? `| ${project.release}` : ''}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No knowledge bases yet. Create a project, then upload artifacts to start ingestion.</p>
      )}
    </section>
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
        <p className="text-sm leading-6 text-on-surface-variant">Upload your project artifacts to build a knowledge base.</p>
      </div>
      <LabeledInput label="Project name" helper="Give a clear, descriptive project name for traceability.">
        <input value={props.projectName} onChange={(e) => props.setProjectName(e.target.value)} placeholder="Enter knowledge project name" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary" />
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
      {props.error ? <p className="rounded-lg border border-error/30 bg-error-container p-3 text-sm font-medium text-on-error-container">{props.error}</p> : null}
      <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-bold hover:bg-surface-container">Reset</button>
        <button disabled={props.submitting} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
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
  projects: Project[]
}) {
  return (
    <form className="space-y-8 p-8" onSubmit={props.onSubmit}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Generate Documents</h3>
        <p className="text-sm leading-6 text-on-surface-variant">Choose outputs and generate QA deliverables from your knowledge base.</p>
      </div>
      <LabeledInput label="Project name">
        <input list="known-projects" value={props.projectName} onChange={(e) => props.setProjectName(e.target.value)} placeholder="Enter existing knowledge project name" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary" />
        <datalist id="known-projects">
          {props.projects.map((project) => <option key={project.id} value={project.name} />)}
        </datalist>
      </LabeledInput>
      <div>
        <p className="mb-3 text-sm font-bold text-on-surface">Select artifacts</p>
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
              <label key={item.key} tabIndex={0} onKeyDown={onKeyDown} className={`cursor-pointer rounded-xl border p-5 text-left outline-none ${selected ? 'border-primary bg-primary/10 ring-2 ring-primary/10' : 'border-outline-variant bg-surface-container-lowest hover:border-primary'}`}>
                <input className="sr-only" type="radio" name="artifact" checked={selected} onChange={select} />
                <span className="font-bold text-on-surface">{item.label}</span>
                <span className="mt-1 block text-xs text-on-surface-variant">{item.description}</span>
              </label>
            )
          })}
        </div>
      </div>
      {props.error ? <p className="rounded-lg border border-error/30 bg-error-container p-3 text-sm font-medium text-on-error-container">{props.error}</p> : null}
      <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-bold hover:bg-surface-container">Reset</button>
        <button disabled={props.submitting} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          {props.submitting ? 'Generating documents...' : 'Generate Documents'}
        </button>
      </div>
    </form>
  )
}

function RecentOutputs({ outputs }: { outputs: GeneratedOutput[] }) {
  return (
    <section className="border-t border-outline-variant p-6">
      <h3 className="text-lg font-semibold text-on-surface">Recent Generated Outputs</h3>
      {outputs.length ? (
        <div className="mt-4 space-y-3">
          {outputs.slice(0, 5).map((output) => (
            <div key={output.id} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <div>
                <p className="font-bold text-on-surface">{output.artifactLabel}</p>
                <p className="text-xs text-on-surface-variant">{output.projectName} | {formatTime(output.createdAt)}</p>
              </div>
              {output.url ? <a href={output.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary">Open <ExternalLink className="h-4 w-4" /></a> : <StatusBadge status={output.status === 'completed' ? 'success' : 'info'} label={output.status} />}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No generated outputs yet. Run document generation to build this history.</p>
      )}
    </section>
  )
}

function LabeledInput({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-on-surface">{label}</span>
      {children}
      {helper ? <span className="block text-xs text-on-surface-variant">{helper}</span> : null}
    </label>
  )
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</h4>
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
      className={`cursor-pointer rounded-xl border border-dashed p-5 transition-colors ${dragging ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-lowest hover:border-primary'}`}
    >
      <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => onFiles(Array.from(event.target.files ?? []))} />
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-on-surface">{label}</span>
        <UploadCloud className="h-5 w-5 text-on-surface-variant" />
      </div>
      <p className="text-xs font-medium text-primary">{selectedText}</p>
      {helper ? <p className="mt-2 text-xs text-on-surface-variant">{helper}</p> : null}
    </label>
  )
}

function StatusPanel({ kind, state }: { kind: WorkspaceTab; state: { status: JobStatus; jobId: string | null; error: string } }) {
  if (state.status === 'idle') {
    return (
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-5">
          <h3 className="text-xl font-semibold">Job Status</h3>
          <RefreshCw className="h-4 w-4" />
        </div>
        <div className="p-6 text-sm text-on-surface-variant">No active {kind === 'knowledge' ? 'knowledge base' : 'document generation'} job.</div>
      </section>
    )
  }

  const pct = state.status === 'completed' ? 100 : state.status === 'processing' ? 50 : 25
  const message =
    kind === 'knowledge'
      ? statusMessage(state.status, 'Queued for ingestion. Polling starts shortly.', 'Processing continues. Polling until completion.', 'Knowledge base created successfully.', 'Knowledge base creation failed.')
      : statusMessage(state.status, 'Generation queued. Polling starts shortly.', 'Generating document. Polling until completion.', 'Document generated successfully.', 'Document generation failed.')
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-5">
        <h3 className="text-xl font-semibold">Job Status</h3>
        <RefreshCw className="h-4 w-4" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold capitalize text-on-surface">{state.status.replace('_', ' ')}</p>
          <p className="text-xs font-semibold text-primary">{pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
          <div className={`h-full rounded-full ${state.status === 'failed' ? 'bg-error' : state.status === 'completed' ? 'bg-success' : 'bg-primary'} ${state.status === 'processing' ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="break-all text-xs text-on-surface-variant">Job ID: {state.jobId}</p>
        <p className="text-sm text-on-surface-variant">{message}</p>
        {state.error ? <p className="rounded-lg bg-error-container p-3 text-xs font-medium text-on-error-container">{state.error}</p> : null}
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
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-4 text-lg font-semibold">Generated Jira Output</h3>
        <OutputList title="Epics" items={output.epics} keyName="epicID" labelName="epicKey" linkName="epicLink" />
        <OutputList title="User Stories" items={output.stories} keyName="storyID" labelName="storyKey" linkName="storyLink" />
      </section>
    )
  }
  if (output.url) {
    return (
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="mb-2 text-lg font-semibold">Document Link</h3>
        <a className="font-bold text-primary underline" href={output.url} target="_blank" rel="noopener noreferrer">Open Document</a>
      </section>
    )
  }
  return null
}

function OutputList({ title, items, keyName, labelName, linkName }: { title: string; items: any[]; keyName: string; labelName: string; linkName: string }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a key={item[keyName]} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary" href={item[linkName]} target="_blank" rel="noopener noreferrer">
            {item[labelName]}
          </a>
        ))}
      </div>
    </div>
  )
}

function QuickTips({ tab, onHelp }: { tab: WorkspaceTab; onHelp: () => void }) {
  const tips =
    tab === 'knowledge'
      ? ['Use clear knowledge project names for traceable AI assets.', 'Upload source documents to build the knowledge base.', 'Verify the API at localhost:5678 if requests fail.']
      : ['Select a document type to generate QA artifacts.', 'Reference an existing knowledge base project.', 'Generated documents will appear as Jira or Confluence links.']
  return (
    <section className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5" />
        <h3 className="text-sm font-bold tracking-wide">QUICK TIPS</h3>
      </div>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={tip} className="border-l-2 border-on-primary/30 py-1 pl-4">
            <p className="text-xs font-semibold uppercase text-on-primary/70">Tip #{index + 1}</p>
            <p className="mt-1 text-sm text-on-primary">{tip}</p>
          </div>
        ))}
      </div>
      <button onClick={onHelp} className="mt-6 w-full rounded-lg border border-on-primary/20 bg-on-primary/10 py-2 text-xs font-bold text-on-primary transition-all hover:bg-on-primary/20">View Help Center</button>
    </section>
  )
}

function ComputeLoadCard({ activeJobs, failedJobs, onClick }: { activeJobs: number; failedJobs: number; onClick: () => void }) {
  const load = Math.min(95, 18 + activeJobs * 28 + failedJobs * 12)
  return (
    <button onClick={onClick} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-left transition hover:border-primary">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12">
          <svg className="h-full w-full -rotate-90">
            <circle className="text-surface-container" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4" />
            <circle className="text-primary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset={125 - (load / 100) * 125} strokeWidth="4" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">{load}%</span>
        </div>
        <div>
          <p className="font-bold text-on-surface">Compute Load</p>
          <p className="text-xs text-on-surface-variant">{activeJobs ? `${activeJobs} active job${activeJobs === 1 ? '' : 's'}` : 'Optimum Performance'}</p>
        </div>
      </div>
    </button>
  )
}

function ArtifactsRepository({ records, projects, onUpload, onAudit }: { records: ArtifactRecord[]; projects: Project[]; onUpload: () => void; onAudit: () => void }) {
  const processed = records.filter((item) => item.status === 'processed').length
  const failed = records.filter((item) => item.status === 'failed').length
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total artifacts" value={records.length} />
        <MetricCard label="Processed" value={processed} />
        <MetricCard label="Failed" value={failed} />
        <MetricCard label="Missing recommended" value={Math.max(0, projects.length * 4 - records.length)} />
      </div>
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-outline-variant p-5">
          <div>
            <h3 className="text-lg font-semibold">Artifact Inventory</h3>
            <p className="text-sm text-on-surface-variant">Grouped source files with metadata and local processing status.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onUpload} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Upload More Artifacts</button>
            <button onClick={onAudit} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">View Audit</button>
          </div>
        </div>
        {records.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="p-4">File</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Uploaded</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="p-4 font-semibold text-on-surface">{record.fileName}</td>
                    <td className="p-4 text-on-surface-variant">{record.type}</td>
                    <td className="p-4 text-on-surface-variant">{record.projectName}</td>
                    <td className="p-4 text-on-surface-variant">{fileSize(record.size)}</td>
                    <td className="p-4 text-on-surface-variant">{formatTime(record.uploadedAt)}</td>
                    <td className="p-4"><StatusBadge status={record.status === 'failed' ? 'error' : record.status === 'processed' ? 'success' : 'info'} label={record.status} /></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="rounded border border-outline-variant px-3 py-1 text-xs font-bold hover:bg-surface-container">Preview</button>
                        <button className="rounded border border-outline-variant px-3 py-1 text-xs font-bold hover:bg-surface-container">Reprocess</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Archive} title="No artifacts uploaded yet" text="Start by creating a project or opening Knowledge Base ingestion." action="Open Knowledge Base" onAction={onUpload} />
        )}
      </div>
    </section>
  )
}

function AnalyticsPage({ projects, artifacts, outputs, activeJobs, failedJobs }: { projects: Project[]; artifacts: ArtifactRecord[]; outputs: GeneratedOutput[]; activeJobs: number; failedJobs: number }) {
  const successRate = failedJobs ? 72 : outputs.length || projects.length ? 96 : 0
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div>
          <h3 className="text-lg font-semibold">QA Operations Analytics</h3>
          <p className="text-sm text-on-surface-variant">Demo metrics blend session data with sample baselines until backend analytics are connected.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">All projects</button>
          <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Last 30 days</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Knowledge bases" value={projects.length} />
        <MetricCard label="Documents generated" value={outputs.length} />
        <MetricCard label="Success rate" value={`${successRate}%`} />
        <MetricCard label="Artifact coverage" value={projects.length ? `${Math.min(100, Math.round((artifacts.length / (projects.length * 5)) * 100))}%` : '0%'} />
        <MetricCard label="Active jobs" value={activeJobs} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Throughput" bars={[60, 42, 78, 55, 88, 70]} labels={['KB', 'Plan', 'Risk', 'RTM', 'Cases', 'Stories']} />
        <ChartPanel title="Reliability" bars={[successRate, 84, 90, failedJobs ? 52 : 93]} labels={['Jobs', 'Webhooks', 'Jira', 'Confluence']} />
      </div>
    </section>
  )
}

function SettingsPage({ settings, setSettings, connectionResult, onTestConnection, onStatus }: { settings: SettingsState; setSettings: (value: SetStateAction<SettingsState>) => void; connectionResult: { status: StatusTone; message: string } | null; onTestConnection: () => void; onStatus: () => void }) {
  const update = (patch: Partial<SettingsState>) => setSettings((current) => ({ ...current, ...patch }))
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <SettingsPanel title="Profile">
        <SettingsInput label="Name" value={settings.name} onChange={(value) => update({ name: value })} />
        <SettingsInput label="Role" value={settings.role} onChange={(value) => update({ role: value })} />
        <SettingsInput label="Email" value={settings.email} onChange={(value) => update({ email: value })} />
      </SettingsPanel>
      <SettingsPanel title="API And Backend">
        <SettingsInput label="n8n API base URL" value={settings.apiBaseUrl} onChange={(value) => update({ apiBaseUrl: value })} />
        <div className="rounded-lg bg-surface-container-low p-4 text-xs text-on-surface-variant">
          Upload: /webhook/upload-test-artifacts<br />
          Generate: /webhook/generate-qa-doc<br />
          Polling: /webhook/job-status and /webhook/job-status-retrieve
        </div>
        <div className="flex gap-3">
          <button onClick={onTestConnection} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Test Connection</button>
          <button onClick={onStatus} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Open Status</button>
        </div>
        {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
      </SettingsPanel>
      <SettingsPanel title="Integrations">
        <SettingsInput label="Jira base URL" value={settings.jiraUrl} onChange={(value) => update({ jiraUrl: value })} placeholder="https://company.atlassian.net" />
        <SettingsInput label="Confluence space" value={settings.confluenceSpace} onChange={(value) => update({ confluenceSpace: value })} placeholder="QA" />
        <div className="grid gap-3 sm:grid-cols-2">
          <IntegrationChip label="Supabase" status="Not configured" />
          <IntegrationChip label="Chroma" status="Not configured" />
          <IntegrationChip label="OpenAI" status="Backend managed" />
          <IntegrationChip label="Jira" status={settings.jiraUrl ? 'Configured' : 'Not configured'} />
        </div>
      </SettingsPanel>
      <SettingsPanel title="Notifications And Security">
        <ToggleRow label="In-app notifications" checked={settings.inAppNotifications} onChange={(checked) => update({ inAppNotifications: checked })} />
        <ToggleRow label="Email notifications" checked={settings.emailNotifications} onChange={(checked) => update({ emailNotifications: checked })} />
        <SettingsInput label="Session timeout (minutes)" value={settings.sessionTimeout} onChange={(value) => update({ sessionTimeout: value })} />
        <p className="rounded-lg bg-surface-container-low p-4 text-xs leading-5 text-on-surface-variant">Uploaded artifacts are processed through the configured backend. Legal and retention copy should be reviewed before production rollout.</p>
      </SettingsPanel>
    </section>
  )
}

function DocumentationPage({ onHelp, onKnowledge, onStatus }: { onHelp: () => void; onKnowledge: () => void; onStatus: () => void }) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 className="text-xl font-semibold">Q-Ops Agent Documentation</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">Q-Ops Agent converts requirements, technical documents, transcripts, and UI designs into reusable QA intelligence and production-ready QA outputs.</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onKnowledge} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Create Knowledge Base</button>
          <button onClick={onHelp} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Open Help Drawer</button>
          <button onClick={onStatus} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">System Status</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {helpArticles.map((article) => (
          <article key={article.title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{article.group}</p>
            <h4 className="mt-2 text-lg font-semibold">{article.title}</h4>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{article.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SearchPalette({ projects, artifacts, outputs, jobs, onClose, setView, onHelp }: { projects: Project[]; artifacts: ArtifactRecord[]; outputs: GeneratedOutput[]; jobs: Array<{ status: JobStatus; jobId: string | null }>; onClose: () => void; setView: (view: View) => void; onHelp: () => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const q = query.toLowerCase()
    return [
      ...projects.map((item) => ({ group: 'Projects', title: item.name, meta: item.status, view: 'knowledge' as View })),
      ...artifacts.map((item) => ({ group: 'Artifacts', title: item.fileName, meta: item.projectName, view: 'artifacts' as View })),
      ...jobs.filter((job) => job.jobId).map((job) => ({ group: 'Jobs', title: job.jobId || '', meta: job.status, view: 'overview' as View })),
      ...outputs.map((item) => ({ group: 'Generated Outputs', title: item.artifactLabel, meta: item.projectName, view: 'documents' as View })),
      ...helpArticles.map((item) => ({ group: 'Help', title: item.title, meta: item.group, view: 'docs' as View })),
    ].filter((item) => !q || `${item.group} ${item.title} ${item.meta}`.toLowerCase().includes(q))
  }, [artifacts, jobs, outputs, projects, query])

  const openResult = (view: View, group: string) => {
    onClose()
    if (group === 'Help') onHelp()
    else setView(view)
  }

  return (
    <ModalFrame title="Search Operations" onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, artifacts, jobs, outputs, and help..." className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-12 py-3 text-sm outline-none focus:border-primary" />
      </div>
      <div className="mt-5 max-h-[55vh] overflow-auto">
        {results.length ? (
          <div className="space-y-2">
            {results.map((item) => (
              <button key={`${item.group}-${item.title}-${item.meta}`} onClick={() => openResult(item.view, item.group)} className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left hover:border-primary">
                <div>
                  <p className="font-bold text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant">{item.group} | {item.meta}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileSearch} title="No matching operations found" text="Try searching by project, artifact, output type, or backend help topic." />
        )}
      </div>
    </ModalFrame>
  )
}

function NotificationDrawer({ notifications, setNotifications, onClose, setView }: { notifications: NotificationEvent[]; setNotifications: (value: SetStateAction<NotificationEvent[]>) => void; onClose: () => void; setView: (view: View) => void }) {
  const unread = notifications.filter((item) => !item.read).length
  const markAll = () => setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  const openItem = (item: NotificationEvent) => {
    setNotifications((current) => current.map((notification) => (notification.id === item.id ? { ...notification, read: true } : notification)))
    if (item.actionView) setView(item.actionView)
    onClose()
  }
  return (
    <SideDrawer title="Notifications" onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{unread} unread</p>
        <button onClick={markAll} className="text-sm font-bold text-primary">Mark all as read</button>
      </div>
      <div className="space-y-3">
        {notifications.length ? notifications.map((item) => (
          <button key={item.id} onClick={() => openItem(item)} className={`w-full rounded-lg border p-4 text-left ${item.read ? 'border-outline-variant bg-surface-container-lowest' : 'border-primary bg-primary/10'}`}>
            <div className="flex items-start gap-3">
              <ToneIcon status={item.type} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-on-surface">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-on-surface-variant">{item.message}</p>
                <p className="mt-2 text-xs text-on-surface-variant">{formatTime(item.createdAt)}</p>
              </div>
            </div>
          </button>
        )) : <EmptyState icon={Bell} title="No notifications" text="Important job updates and backend issues will appear here." />}
      </div>
    </SideDrawer>
  )
}

function HelpDrawer({ activeView, onClose, onDocs }: { activeView: View; onClose: () => void; onDocs: () => void }) {
  const featured = activeView === 'settings' ? helpArticles.filter((item) => item.group === 'Settings') : activeView === 'documents' ? helpArticles.filter((item) => item.group === 'Document Generation') : helpArticles
  return (
    <SideDrawer title="Help Center" onClose={onClose}>
      <p className="mb-4 text-sm leading-6 text-on-surface-variant">Contextual help for {viewLabels[activeView].toLowerCase()}.</p>
      <div className="space-y-3">
        {featured.map((article) => (
          <article key={article.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{article.group}</p>
            <h4 className="mt-2 font-bold text-on-surface">{article.title}</h4>
            <p className="mt-2 text-sm leading-5 text-on-surface-variant">{article.body}</p>
          </article>
        ))}
      </div>
      <button onClick={onDocs} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-on-primary">Open Documentation</button>
    </SideDrawer>
  )
}

function AuditLogModal({ events, onClose }: { events: AuditEvent[]; onClose: () => void }) {
  return (
    <ModalFrame title="Audit Log" onClose={onClose} maxWidth="max-w-5xl">
      {events.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Project</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="p-4 text-on-surface-variant">{formatTime(event.timestamp)}</td>
                  <td className="p-4 font-semibold">{event.actor}</td>
                  <td className="p-4">{event.action}</td>
                  <td className="p-4 text-on-surface-variant">{event.project}</td>
                  <td className="p-4 text-on-surface-variant">{event.entity}</td>
                  <td className="p-4"><StatusBadge status={event.status} label={event.status} /></td>
                  <td className="p-4 text-on-surface-variant">{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={History} title="No audit events yet" text="Project creation, uploads, generation requests, resets, and settings changes will appear here." />
      )}
    </ModalFrame>
  )
}

function NewProjectWizard({ existingNames, onClose, onCreate }: { existingNames: string[]; onClose: () => void; onCreate: (project: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('Admin User')
  const [module, setModule] = useState('')
  const [release, setRelease] = useState('')
  const [tags, setTags] = useState('')
  const [selected, setSelected] = useState<string[]>(['BRD', 'FRD'])
  const [error, setError] = useState('')
  const duplicate = existingNames.some((item) => item.toLowerCase() === name.trim().toLowerCase())

  const next = () => {
    if (step === 1 && (!name.trim() || duplicate)) {
      setError(duplicate ? 'A project with this name already exists.' : 'Project name is required.')
      return
    }
    setError('')
    setStep((current) => Math.min(3, current + 1))
  }

  const create = () => {
    if (!name.trim() || duplicate) {
      setError(duplicate ? 'A project with this name already exists.' : 'Project name is required.')
      return
    }
    onCreate({
      name: name.trim(),
      description,
      owner,
      module,
      release,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    })
  }

  return (
    <ModalFrame title="Create New Project" onClose={onClose} maxWidth="max-w-3xl">
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`rounded-lg border p-3 text-center text-sm font-bold ${step === item ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>Step {item}</div>
        ))}
      </div>
      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsInput label="Project name" value={name} onChange={setName} placeholder="Payments modernization" />
          <SettingsInput label="Owner" value={owner} onChange={setOwner} />
          <SettingsInput label="Application/module" value={module} onChange={setModule} placeholder="Checkout" />
          <SettingsInput label="Release/sprint" value={release} onChange={setRelease} placeholder="Release 2.4" />
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-bold text-on-surface">Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>
          <SettingsInput label="Tags" value={tags} onChange={setTags} placeholder="payments, regression, web" />
        </div>
      ) : null}
      {step === 2 ? (
        <div>
          <h3 className="font-bold text-on-surface">Available artifact types</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {['BRD', 'FRD', 'HLD', 'LLD', 'Transcript', 'UI Designs'].map((item) => (
              <label key={item} className={`rounded-lg border p-4 ${selected.includes(item) ? 'border-primary bg-primary/10' : 'border-outline-variant'}`}>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selected.includes(item)}
                  onChange={() => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}
                />
                <span className="font-semibold">{item}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="space-y-4">
          <h3 className="font-bold text-on-surface">Recommended upload checklist</h3>
          {selected.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <ListChecks className="h-5 w-5 text-primary" />
              <span className="font-semibold">{item}</span>
              <span className="ml-auto text-xs text-on-surface-variant">Upload after creation</span>
            </div>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-4 rounded-lg bg-error-container p-3 text-sm font-semibold text-on-error-container">{error}</p> : null}
      <div className="mt-6 flex justify-between border-t border-outline-variant pt-4">
        <button onClick={() => (step === 1 ? onClose() : setStep((current) => current - 1))} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">{step === 1 ? 'Cancel' : 'Back'}</button>
        {step < 3 ? <button onClick={next} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Continue</button> : <button onClick={create} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Create Project</button>}
      </div>
    </ModalFrame>
  )
}

function StatusModal({ apiBaseUrl, onClose }: { apiBaseUrl: string; onClose: () => void }) {
  const services = [
    ['Frontend loaded', 'Operational', 'success' as StatusTone],
    ['n8n backend', apiBaseUrl ? 'Configured' : 'Not configured', apiBaseUrl ? 'info' : 'warning' as StatusTone],
    ['Upload webhook', '/webhook/upload-test-artifacts', 'info' as StatusTone],
    ['Generate document webhook', '/webhook/generate-qa-doc', 'info' as StatusTone],
    ['Job status webhook', '/webhook/job-status', 'info' as StatusTone],
    ['Jira integration', 'Backend managed', 'warning' as StatusTone],
    ['Confluence integration', 'Backend managed', 'warning' as StatusTone],
  ]
  return (
    <ModalFrame title="System Status" onClose={onClose} maxWidth="max-w-2xl">
      <p className="mb-5 text-sm text-on-surface-variant">Configured backend: {apiBaseUrl}</p>
      <div className="space-y-3">
        {services.map(([name, detail, status]) => (
          <div key={name} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div>
              <p className="font-bold">{name}</p>
              <p className="text-xs text-on-surface-variant">{detail}</p>
            </div>
            <StatusBadge status={status as StatusTone} label={status === 'success' ? 'Operational' : status === 'warning' ? 'Not configured' : 'Configured'} />
          </div>
        ))}
      </div>
    </ModalFrame>
  )
}

function DiagnosticsModal({ activeJobs, failedJobs, artifacts, apiBaseUrl, onClose }: { activeJobs: number; failedJobs: number; artifacts: number; apiBaseUrl: string; onClose: () => void }) {
  return (
    <ModalFrame title="System Diagnostics" onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Queue load" value={`${Math.min(95, 18 + activeJobs * 28 + failedJobs * 12)}%`} />
        <MetricCard label="Active jobs" value={activeJobs} />
        <MetricCard label="Failed jobs" value={failedJobs} />
        <MetricCard label="Tracked artifacts" value={artifacts} />
      </div>
      <p className="mt-5 rounded-lg bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">Diagnostics use current session state and configured backend URL: {apiBaseUrl}. Connect backend diagnostics endpoints later for live queue length and response-time metrics.</p>
    </ModalFrame>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-bold text-on-surface">{value}</p>
    </div>
  )
}

function ChartPanel({ title, bars, labels }: { title: string; bars: number[]; labels: string[] }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-5 flex h-44 items-end gap-3">
        {bars.map((bar, index) => (
          <div key={labels[index]} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-primary" style={{ height: `${bar}%` }} />
            <span className="text-xs font-semibold text-on-surface-variant">{labels[index]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function SettingsPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function SettingsInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-on-surface">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary" />
    </label>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
      <span className="font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-primary" />
    </label>
  )
}

function IntegrationChip({ label, status }: { label: string; status: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="font-bold">{label}</p>
      <p className="text-xs text-on-surface-variant">{status}</p>
    </div>
  )
}

function StatusNotice({ status, message }: { status: StatusTone; message: string }) {
  return (
    <div className={`rounded-lg p-4 text-sm font-semibold ${status === 'error' ? 'bg-error-container text-on-error-container' : status === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
      {message}
    </div>
  )
}

function StatusBadge({ status, label }: { status: StatusTone | string; label: string }) {
  const cls =
    status === 'success' ? 'bg-success/10 text-success' :
    status === 'error' ? 'bg-error-container text-on-error-container' :
    status === 'warning' ? 'bg-warning/10 text-warning' :
    'bg-primary/10 text-primary'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${cls}`}>{label}</span>
}

function ToneIcon({ status }: { status: StatusTone }) {
  if (status === 'success') return <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
  if (status === 'error') return <AlertTriangle className="mt-0.5 h-5 w-5 text-error" />
  if (status === 'warning') return <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
  return <Bell className="mt-0.5 h-5 w-5 text-primary" />
}

function EmptyState({ icon: Icon, title, text, action, onAction }: { icon: typeof Archive; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <Icon className="mb-4 h-10 w-10 text-primary" />
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-on-surface-variant">{text}</p>
      {action && onAction ? <button onClick={onAction} className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">{action}</button> : null}
    </div>
  )
}

function ModalFrame({ title, children, onClose, maxWidth = 'max-w-xl' }: { title: string; children: ReactNode; onClose: () => void; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`max-h-[88vh] w-full ${maxWidth} overflow-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl`} onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SideDrawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/45 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-md overflow-auto border-l border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
