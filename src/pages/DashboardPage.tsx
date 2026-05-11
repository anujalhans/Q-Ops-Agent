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
import {
  API_BASE_URL_KEY,
  DEFAULT_API_BASE_URL,
  createProjectRecord,
  fetchAnalyticsSummary,
  fetchArtifacts,
  fetchAuditEvents,
  fetchGeneratedDocuments,
  fetchHealthStatus,
  fetchInfrastructureLoad,
  fetchProjects,
  fetchSettings,
  fetchUsers,
  generateDocument,
  getApiBaseUrl,
  inviteUser,
  patchSettings,
  reprocessArtifact,
  testAllIntegrations,
  testIntegration,
  updateUser,
  updateUserProjectAssignments,
  uploadKnowledgeBase,
} from '../lib/api'
import type { AnalyticsSummary, ApiArtifact, ApiAuditEvent, ApiGeneratedDocument, ApiProject, ApiUser, CurrentUser, DocumentArtifactKey, HealthStatus, InfrastructureLoad, IntegrationSetting, InviteUserPayload, JobStatus, ProjectAssignmentPayload, SettingsResponse, StatusTone, UpdateUserPayload } from '../lib/api'
import { useJobPolling } from '../hooks/useJobPolling'
import { useTheme } from '../theme/ThemeProvider'

type ToastType = 'success' | 'error' | 'info'
type View = 'overview' | 'knowledge' | 'documents' | 'artifacts' | 'analytics' | 'settings' | 'docs'
type WorkspaceTab = 'knowledge' | 'documents'
type Overlay = 'search' | 'notifications' | 'help' | 'audit' | 'project' | 'status' | 'diagnostics' | null

type Props = {
  onLogout: () => void
  addToast: (t: { title: string; message: string; type: ToastType }) => void
  currentUser: CurrentUser | null
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
  url?: string
  jobId?: string
}

type NotificationEvent = {
  id: string
  title: string
  message: string
  type: StatusTone
  createdAt: string
  read: boolean
  project?: string
  audienceUserId?: string
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
  jobId?: string
  projectName: string
  artifactLabel: string
  createdAt: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  output?: any
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
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function formatDuration(value?: number) {
  const ms = Number(value) || 0
  if (!ms) return '0s'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function usePersistentArrayState<T>(key: string, initialValue: T[]) {
  const [value, setValue] = usePersistentState<T[]>(key, initialValue)
  return [Array.isArray(value) ? value : initialValue, setValue] as const
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function documentTypeLabel(value?: string) {
  if (!value) return 'Generated Output'
  const backendLabels: Record<string, string> = {
    test_strategy: 'Test Strategy',
    test_plan: 'Test Plan',
    test_cases: 'Test Cases',
    user_stories: 'Epics & User Stories',
    risk_matrix: 'Risk Matrix',
    traceability_matrix: 'Traceability Matrix',
  }
  if (backendLabels[value]) return backendLabels[value]
  const known = artifactOptions.find((item) => item.key === value || item.key === value.replace(/^test_/, '') || item.label.toLowerCase() === value.toLowerCase())
  if (known) return known.label
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeProject(item: ApiProject): Project {
  const now = new Date().toISOString()
  const name = item.name || 'Untitled project'
  return {
    id: item.id || uid('project'),
    name,
    description: item.description || '',
    owner: item.owner || 'Admin User',
    module: item.module || '',
    release: item.release || '',
    tags: item.tags || [],
    status: item.status || 'ready',
    createdAt: item.createdAt || item.updatedAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  }
}

function normalizeArtifact(item: ApiArtifact): ArtifactRecord {
  return {
    id: item.id || item.jobId || uid('artifact'),
    projectName: item.projectName || 'Unknown project',
    type: item.type || 'Artifact',
    fileName: item.fileName || 'Unnamed artifact',
    size: item.size || 0,
    uploadedAt: item.uploadedAt || new Date().toISOString(),
    status: item.status || 'processed',
    url: item.url,
    jobId: item.jobId,
  }
}

function normalizeGeneratedDocument(item: ApiGeneratedDocument): GeneratedOutput {
  return {
    id: item.id || item.jobId || uid('output'),
    jobId: item.jobId,
    projectName: item.projectName || 'Unknown project',
    artifactLabel: item.artifactLabel || documentTypeLabel(item.documentType),
    createdAt: item.createdAt || new Date().toISOString(),
    status: item.status || 'completed',
    url: item.url || item.output?.url,
    output: item.output,
  }
}

function normalizeAuditEvent(item: ApiAuditEvent): AuditEvent {
  return {
    id: item.id || item.jobId || uid('audit'),
    actor: item.actor || 'n8n',
    action: item.action || item.event || 'Backend event',
    project: item.project || 'Backend',
    entity: item.entity || item.jobId || item.pipeline || 'Workflow',
    status: item.status || (String(item.event || '').includes('FAILED') ? 'error' : 'info'),
    timestamp: item.timestamp || new Date().toISOString(),
    details: item.details || [item.pipeline, item.event].filter(Boolean).join(' | ') || 'Backend metric event.',
  }
}

function notificationFromAudit(event: AuditEvent): NotificationEvent | null {
  const important = event.status === 'error' || /completed|failed|quality/i.test(`${event.action} ${event.details}`)
  if (!important) return null
  return {
    id: `backend-${event.id}`,
    title: event.status === 'error' ? 'Backend job needs attention' : event.action,
    message: `${event.project}: ${event.details}`,
    type: event.status,
    createdAt: event.timestamp,
    read: false,
    project: event.project,
    actionLabel: 'Open',
    actionView: event.status === 'error' ? 'analytics' : 'documents',
  }
}

function hasRepositoryWebhooks(healthStatus: HealthStatus | null) {
  const webhooks = healthStatus?.webhooks
  if (!webhooks) return false
  return ['projects', 'artifacts', 'generatedDocuments', 'auditEvents'].some((key) => Boolean(webhooks[key]))
}

function findProjectByName(projects: Project[], name: string) {
  const normalized = name.trim().toLowerCase()
  return projects.find((project) => project.name.trim().toLowerCase() === normalized)
}

function getActiveEnvironment(settingsData: SettingsResponse | null) {
  return settingsData?.environments?.find((environment) => environment.isActive) || settingsData?.environments?.[0] || null
}

function getIntegration(settingsData: SettingsResponse | null, integrationKey: string) {
  return getActiveEnvironment(settingsData)?.integrations?.find((integration) => integration.integrationKey === integrationKey) || null
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

export default function DashboardPage({ onLogout, addToast, currentUser }: Props) {
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
  const [settings, setSettings] = usePersistentState<SettingsState>('qops-agent-settings', {
    ...defaultSettings,
    name: currentUser?.name || defaultSettings.name,
    role: currentUser?.role === 'admin' ? 'Admin' : 'Registered User',
    email: currentUser?.email || defaultSettings.email,
    apiBaseUrl: getApiBaseUrl(),
  })
  const [projects, setProjects] = usePersistentArrayState<Project>('qops-agent-projects', [])
  const visibleProjects = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return projects
    const assignedIds = new Set((currentUser.projects || currentUser.projectRoles?.map((assignment) => assignment.projectId) || []).filter((id) => id && id !== 'All projects'))
    return projects.filter((project) => assignedIds.has(project.id))
  }, [currentUser?.projectRoles, currentUser?.projects, currentUser?.role, projects])
  const [artifactRecords, setArtifactRecords] = usePersistentArrayState<ArtifactRecord>('qops-agent-artifacts', [])
  const visibleProjectNames = useMemo(() => {
    const names = new Set(visibleProjects.map((project) => project.name.trim().toLowerCase()))
    currentUser?.projectRoles?.forEach((assignment) => {
      if (assignment.projectName) names.add(assignment.projectName.trim().toLowerCase())
    })
    return names
  }, [currentUser?.projectRoles, visibleProjects])
  const scopedArtifactRecords = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return artifactRecords
    return artifactRecords.filter((record) => visibleProjectNames.has(record.projectName.trim().toLowerCase()))
  }, [artifactRecords, currentUser?.role, visibleProjectNames])
  const [notifications, setNotifications] = usePersistentArrayState<NotificationEvent>('qops-agent-notifications', [
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
  const [auditEvents, setAuditEvents] = usePersistentArrayState<AuditEvent>('qops-agent-audit-events', [])
  const [generatedOutputs, setGeneratedOutputs] = usePersistentArrayState<GeneratedOutput>('qops-agent-generated-outputs', [])
  const scopedGeneratedOutputs = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return generatedOutputs
    return generatedOutputs.filter((output) => visibleProjectNames.has(output.projectName.trim().toLowerCase()))
  }, [currentUser?.role, generatedOutputs, visibleProjectNames])
  const scopedAuditEvents = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return auditEvents
    const actorNames = new Set([currentUser?.name, currentUser?.email, settings.name].filter(Boolean).map((value) => String(value).trim().toLowerCase()))
    return auditEvents.filter((event) => {
      const project = event.project.trim().toLowerCase()
      const actor = event.actor.trim().toLowerCase()
      return visibleProjectNames.has(project) || actorNames.has(actor)
    })
  }, [auditEvents, currentUser?.email, currentUser?.name, currentUser?.role, settings.name, visibleProjectNames])
  const scopedNotifications = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return notifications
    return notifications.filter((notification) => {
      if (notification.id === 'welcome-notification') return true
      if (notification.audienceUserId && notification.audienceUserId === currentUser.id) return true
      const project = (notification.project || notification.message.split(':')[0] || '').trim().toLowerCase()
      return Boolean(project) && visibleProjectNames.has(project)
    })
  }, [currentUser?.id, currentUser?.role, notifications, visibleProjectNames])
  const [connectionResult, setConnectionResult] = useState<{ status: StatusTone; message: string } | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [analyticsPipeline, setAnalyticsPipeline] = useState('all')
  const [analyticsDays, setAnalyticsDays] = useState(30)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [infrastructureLoad, setInfrastructureLoad] = useState<InfrastructureLoad | null>(null)
  const [backendDataNotice, setBackendDataNotice] = useState('')
  const [users, setUsers] = useState<ApiUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersNotice, setUsersNotice] = useState('')
  const [backendSettings, setBackendSettings] = useState<SettingsResponse | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsNotice, setSettingsNotice] = useState('')

  useEffect(() => {
    if (!currentUser) return
    setSettings((current) => ({
      ...current,
      name: currentUser.name || current.name,
      role: currentUser.role === 'admin' ? 'Admin' : 'Registered User',
      email: currentUser.email || current.email,
    }))
  }, [currentUser, setSettings])

  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    let cancelled = false
    async function loadUsers() {
      setUsersLoading(true)
      const data = await fetchUsers()
      if (cancelled) return
      setUsersLoading(false)
      if (data) {
        setUsers(data)
        setUsersNotice('')
      } else {
        setUsersNotice('Users API is unavailable or your account does not have Admin access.')
      }
    }
    loadUsers()
    return () => {
      cancelled = true
    }
  }, [currentUser?.role])

  const refreshUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersNotice('')
    const data = await fetchUsers()
    setUsersLoading(false)
    if (data) {
      setUsers(data)
      return true
    }
    setUsersNotice('Users API is unavailable or your account does not have Admin access.')
    return false
  }, [])

  const refreshSettings = useCallback(async () => {
    setSettingsLoading(true)
    const data = await fetchSettings()
    setSettingsLoading(false)
    if (!data) {
      setSettingsNotice('Settings API is unavailable. Local display values are still shown.')
      return false
    }
    setBackendSettings(data)
    const activeEnvironment = getActiveEnvironment(data)
    const jira = getIntegration(data, 'jira')
    const confluence = getIntegration(data, 'confluence')
    setSettings((current) => ({
      ...current,
      apiBaseUrl: activeEnvironment?.n8nBaseUrl || activeEnvironment?.apiBaseUrl || current.apiBaseUrl,
      jiraUrl: String(jira?.config?.baseUrl || current.jiraUrl || ''),
      confluenceSpace: String(confluence?.config?.spaceKey || current.confluenceSpace || ''),
    }))
    setSettingsNotice('')
    return true
  }, [setSettings])

  useEffect(() => {
    if (currentUser?.role !== 'admin') return
    void refreshSettings()
  }, [currentUser?.role, refreshSettings])

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
            audienceUserId: currentUser?.id,
            actionLabel: actionView ? 'Open' : undefined,
            actionView,
          },
          ...current,
        ])
      }
    },
    [addToast, currentUser?.id, setNotifications, settings.inAppNotifications],
  )

  const handleInviteUser = useCallback(
    async (payload: InviteUserPayload) => {
      const invited = await inviteUser(payload)
      if (!invited) {
        notify({ title: 'Invite failed', message: 'The invite workflow could not create the user.', type: 'error' }, 'settings')
        return false
      }
      if (payload.role === 'registered_user' && payload.projectAssignments) {
        const assignments = await updateUserProjectAssignments({ userId: invited.id, projectAssignments: payload.projectAssignments })
        if (!assignments?.ok) {
          notify({ title: 'Project assignment failed', message: `${payload.email} was invited, but project access could not be saved.`, type: 'error' }, 'settings')
          await refreshUsers()
          return false
        }
      }
      notify({ title: 'Invite created', message: `${payload.email} was invited.`, type: 'success' }, 'settings')
      await refreshUsers()
      return true
    },
    [notify, refreshUsers],
  )

  const handleUpdateUser = useCallback(
    async (payload: UpdateUserPayload) => {
      const updated = await updateUser(payload)
      if (!updated) {
        notify({ title: 'User update failed', message: 'The update workflow could not save the user changes.', type: 'error' }, 'settings')
        return false
      }
      if (payload.role === 'registered_user' && payload.projectAssignments) {
        const assignments = await updateUserProjectAssignments({ userId: payload.userId, projectAssignments: payload.projectAssignments })
        if (!assignments?.ok) {
          notify({ title: 'Project assignment failed', message: `${updated.email || 'User'} was updated, but project access could not be saved.`, type: 'error' }, 'settings')
          await refreshUsers()
          return false
        }
      }
      notify({ title: 'User updated', message: `${updated.email || 'User'} was updated.`, type: 'success' }, 'settings')
      await refreshUsers()
      return true
    },
    [notify, refreshUsers],
  )

  const kbJob = useJobPolling('kb', notify)
  const docJob = useJobPolling('doc', notify)

  useEffect(() => {
    localStorage.setItem(API_BASE_URL_KEY, settings.apiBaseUrl.trim() || DEFAULT_API_BASE_URL)
  }, [settings.apiBaseUrl])

  useEffect(() => {
    if (currentUser?.role !== 'registered_user') return
    if (projectName && !findProjectByName(visibleProjects, projectName)) setProjectName('')
    if (generationProject && !findProjectByName(visibleProjects, generationProject)) setGenerationProject('')
  }, [currentUser?.role, generationProject, projectName, visibleProjects])

  const refreshBackendData = useCallback(async () => {
    const healthAdvertisesRepositories = hasRepositoryWebhooks(healthStatus)
    if (!healthAdvertisesRepositories) {
      setBackendDataNotice('Checking repository endpoints directly while the health workflow registry is pending.')
    }

    const [projectData, artifactData, outputData, auditData] = await Promise.all([
      fetchProjects(),
      fetchArtifacts(),
      fetchGeneratedDocuments(),
      fetchAuditEvents(),
    ])

    let connected = false
    if (projectData) {
      connected = true
      setProjects(projectData.map(normalizeProject))
    }
    if (artifactData) {
      connected = true
      setArtifactRecords(artifactData.map(normalizeArtifact))
    }
    if (outputData) {
      connected = true
      setGeneratedOutputs(outputData.map(normalizeGeneratedDocument))
    }
    if (auditData) {
      connected = true
      const normalized = auditData.map(normalizeAuditEvent)
      setAuditEvents(normalized)
      const backendNotifications = normalized.map(notificationFromAudit).filter((item): item is NotificationEvent => Boolean(item))
      if (backendNotifications.length) {
        setNotifications((current) => {
          const existing = new Set(current.map((item) => item.id))
          return [...backendNotifications.filter((item) => !existing.has(item.id)), ...current]
        })
      }
    }
    setBackendDataNotice(
      connected
        ? healthAdvertisesRepositories
          ? 'Backend repositories connected.'
          : 'Backend repositories connected directly.'
        : 'Using local workspace cache until repository endpoints are available.',
    )
  }, [healthStatus, setArtifactRecords, setAuditEvents, setGeneratedOutputs, setNotifications, setProjects])

  const refreshAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    setAnalyticsError('')
    const data = await fetchAnalyticsSummary({ pipeline: analyticsPipeline, days: analyticsDays })
    if (data) {
      setAnalytics(data)
    } else {
      setAnalyticsError('Backend analytics endpoint is not available yet. Showing local workspace metrics.')
    }
    setAnalyticsLoading(false)
  }, [analyticsDays, analyticsPipeline])

  const refreshInfrastructureLoad = useCallback(async () => {
    const data = await fetchInfrastructureLoad()
    if (data) setInfrastructureLoad(data)
  }, [])

  useEffect(() => {
    void refreshAnalytics()
  }, [refreshAnalytics])

  useEffect(() => {
    void refreshInfrastructureLoad()
  }, [refreshInfrastructureLoad])

  useEffect(() => {
    if (healthStatus) return
    void testConnection()
  }, [healthStatus])

  useEffect(() => {
    if (!healthStatus) return
    void refreshBackendData()
  }, [healthStatus, refreshBackendData])

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
      void refreshBackendData()
      void refreshAnalytics()
      void refreshInfrastructureLoad()
    }
  }, [kbJob.state.status, projectName, refreshAnalytics, refreshBackendData, refreshInfrastructureLoad, setArtifactRecords, setProjects])

  useEffect(() => {
    if (docJob.state.status !== 'completed' || !generationProject.trim() || !artifact) return
    const option = artifactOptions.find((item) => item.key === artifact)
    const output = docJob.state.output
    const url = output?.url || output?.documentUrl || output?.link
    const jobId = docJob.state.jobId || undefined
    setGeneratedOutputs((current) => [
      {
        id: jobId || uid('output'),
        jobId,
        projectName: generationProject.trim(),
        artifactLabel: option?.label ?? artifact,
        createdAt: new Date().toISOString(),
        status: 'completed',
        url,
        output,
      },
      ...current.filter((item) => item.jobId !== jobId && item.id !== jobId),
    ])
    void refreshBackendData()
    void refreshAnalytics()
    void refreshInfrastructureLoad()
  }, [artifact, docJob.state.jobId, docJob.state.output, docJob.state.status, generationProject, refreshAnalytics, refreshBackendData, refreshInfrastructureLoad, setGeneratedOutputs])

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

  const activeJobs = [kbJob.state.status, docJob.state.status].filter((status) => status === 'queued' || status === 'pending' || status === 'processing' || status === 'not_found').length
  const failedJobs = [kbJob.state.status, docJob.state.status].filter((status) => status === 'failed').length
  const unreadCount = scopedNotifications.filter((item) => !item.read).length
  const selectedFiles = [brd, frd, hld, lld, transcript].filter(Boolean).length + images.length
  const readyKnowledgeBases = visibleProjects.filter((project) => project.status === 'ready').length

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()
  const loggedInDisplayName = currentUser?.name || settings.name || currentUser?.email?.split('@')[0] || 'there'
  const loggedInFirstName = loggedInDisplayName.trim().split(/\s+/)[0] || loggedInDisplayName

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
      const selectedProject = findProjectByName(visibleProjects, projectName)
      const res = await uploadKnowledgeBase({ projectId: selectedProject?.id, projectName, brd, frd, hld, lld, transcript, images })
      kbJob.start(res)
      void refreshInfrastructureLoad()
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
      const selectedProject = findProjectByName(visibleProjects, generationProject)
      const owner = selectedProject?.owner || settings.name || 'PO'
      const res = await generateDocument({ projectId: selectedProject?.id, projectName: generationProject, artifact, productOwner: owner })
      docJob.start(res)
      void refreshInfrastructureLoad()
      const option = artifactOptions.find((item) => item.key === artifact)
      setGeneratedOutputs((current) => [
        {
          id: res.jobId,
          jobId: res.jobId,
          projectName: generationProject.trim(),
          artifactLabel: option?.label ?? artifact,
          createdAt: new Date().toISOString(),
          status: (res.status as GeneratedOutput['status']) || 'queued',
        },
        ...current.filter((item) => item.jobId !== res.jobId && item.id !== res.jobId),
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
    void createProjectRecord(nextProject).then((saved) => {
      if (saved) {
        setProjects((current) => [normalizeProject(saved), ...current.filter((item) => item.name.toLowerCase() !== saved.name.toLowerCase())])
        void refreshBackendData()
      }
    })
  }

  const testConnection = async () => {
    setConnectionResult({ status: 'info', message: 'Checking backend reachability...' })
    try {
      const started = performance.now()
      const health = await fetchHealthStatus()
      if (!health) throw new Error('Health endpoint unavailable')
      setHealthStatus(health)
      void refreshInfrastructureLoad()
      const tone = health.status === 'ok' ? 'success' : health.status === 'error' ? 'error' : 'warning'
      setConnectionResult({ status: tone, message: `Backend health returned ${health.status} in ${Math.round(performance.now() - started)} ms.` })
    } catch {
      setConnectionResult({ status: 'error', message: `The frontend is running, but the backend could not be reached at ${settings.apiBaseUrl}.` })
    }
  }

  const saveIntegrationSettings = async (integrationKey: string, config: Record<string, any>, enabled = true) => {
    const saved = await patchSettings({
      environmentKey: 'local',
      integrationKey,
      integration: { integrationKey, enabled, config, status: 'backend_managed' },
      actorUserId: currentUser?.id,
      actorName: currentUser?.name || settings.name,
    })
    if (!saved) {
      notify({ title: 'Settings save failed', message: `Unable to save ${integrationKey} settings.`, type: 'error' }, 'settings')
      return false
    }
    notify({ title: 'Settings saved', message: `${integrationKey} settings were updated.`, type: 'success' }, 'settings')
    await refreshSettings()
    return true
  }

  const runIntegrationTest = async (integrationKey: string) => {
    setConnectionResult({ status: 'info', message: `Testing ${integrationKey}...` })
    const result = integrationKey === 'all' ? await testAllIntegrations() : await testIntegration(integrationKey)
    if (!result) {
      setConnectionResult({ status: 'error', message: `The ${integrationKey} integration test did not return a usable response.` })
      return false
    }
    setConnectionResult({ status: 'success', message: `${integrationKey === 'all' ? 'Integration tests' : `${integrationKey} test`} completed.` })
    await refreshSettings()
    return true
  }

  const pageTitle = view === 'overview' ? `${greeting}, ${loggedInFirstName}` : viewLabels[view]

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
                    ? `Workspace initialized with ${activeJobs} active ${activeJobs === 1 ? 'job' : 'jobs'}, ${scopedArtifactRecords.length + selectedFiles} artifacts, and ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}. ${backendDataNotice}`
                    : sectionDescriptions[view]}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setOverlay('audit')} className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
                  <History className="h-4 w-4" /> View Audit Log
                </button>
                {currentUser?.role === 'admin' ? (
                  <button onClick={() => setOverlay('project')} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                    <Plus className="h-4 w-4" /> New Project
                  </button>
                ) : null}
              </div>
            </section>

            {view === 'overview' ? (
              <Overview
                activeJobs={activeJobs}
                failedJobs={failedJobs}
                artifactCount={scopedArtifactRecords.length + selectedFiles}
                outputs={scopedGeneratedOutputs.length}
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
                    projects={visibleProjects}
                    outputs={scopedGeneratedOutputs}
                  />
                </div>
                <div className="space-y-[30px]">
                  <StatusPanel kind={tab} state={tab === 'knowledge' ? kbJob.state : docJob.state} />
                  {tab === 'documents' ? <OutputPanel output={docJob.state.output} status={docJob.state.status} /> : null}
                  <QuickTips tab={tab} onHelp={() => setOverlay('help')} />
                  <PlatformLoadCard infrastructureLoad={infrastructureLoad} activeJobs={activeJobs} failedJobs={failedJobs} onClick={() => setOverlay('diagnostics')} />
                </div>
              </div>
            ) : null}

            {view === 'artifacts' ? <ArtifactsRepository records={scopedArtifactRecords} projects={visibleProjects} onUpload={() => openWorkspace('knowledge')} onAudit={() => setOverlay('audit')} onReprocess={(id) => void reprocessArtifact(id).then((res) => { if (res) { kbJob.start(res); void refreshBackendData(); notify({ title: 'Reprocess queued', message: 'Artifact reprocessing started.', type: 'info' }, 'knowledge') } })} /> : null}
            {view === 'analytics' ? <AnalyticsPage analytics={analytics} loading={analyticsLoading} error={analyticsError} pipeline={analyticsPipeline} days={analyticsDays} setPipeline={setAnalyticsPipeline} setDays={setAnalyticsDays} onRefresh={refreshAnalytics} projects={visibleProjects} artifacts={scopedArtifactRecords} outputs={scopedGeneratedOutputs} activeJobs={activeJobs} failedJobs={failedJobs} /> : null}
            {view === 'settings' ? (
              <SettingsPage
                settings={settings}
                setSettings={setSettings}
                connectionResult={connectionResult}
                healthStatus={healthStatus}
                projects={currentUser?.role === 'admin' ? projects : visibleProjects}
                users={users}
                usersLoading={usersLoading}
                usersNotice={usersNotice}
                backendSettings={backendSettings}
                settingsLoading={settingsLoading}
                settingsNotice={settingsNotice}
                currentUser={currentUser}
                onRefreshUsers={refreshUsers}
                onRefreshSettings={refreshSettings}
                onSaveIntegration={saveIntegrationSettings}
                onTestIntegration={runIntegrationTest}
                onInviteUser={handleInviteUser}
                onUpdateUser={handleUpdateUser}
                onTestConnection={testConnection}
                onStatus={() => setOverlay('status')}
              />
            ) : null}
            {view === 'docs' ? <DocumentationPage onHelp={() => setOverlay('help')} onKnowledge={() => openWorkspace('knowledge')} onStatus={() => setOverlay('status')} /> : null}
          </div>
        </div>
      </main>

      {overlay === 'search' ? <SearchPalette projects={visibleProjects} artifacts={scopedArtifactRecords} outputs={scopedGeneratedOutputs} jobs={[kbJob.state, docJob.state]} onClose={() => setOverlay(null)} setView={setView} onHelp={() => setOverlay('help')} /> : null}
      {overlay === 'notifications' ? <NotificationDrawer notifications={scopedNotifications} setNotifications={setNotifications} onClose={() => setOverlay(null)} setView={setView} /> : null}
      {overlay === 'help' ? <HelpDrawer activeView={view} onClose={() => setOverlay(null)} onDocs={() => { setView('docs'); setOverlay(null) }} /> : null}
      {overlay === 'audit' ? <AuditLogModal events={scopedAuditEvents} onClose={() => setOverlay(null)} /> : null}
      {overlay === 'project' ? <NewProjectWizard existingNames={projects.map((project) => project.name)} onClose={() => setOverlay(null)} onCreate={createProject} /> : null}
      {overlay === 'status' ? <StatusModal apiBaseUrl={settings.apiBaseUrl} health={healthStatus} onRefresh={testConnection} onClose={() => setOverlay(null)} /> : null}
      {overlay === 'diagnostics' ? <DiagnosticsModal infrastructureLoad={infrastructureLoad} activeJobs={activeJobs} failedJobs={failedJobs} artifacts={scopedArtifactRecords.length} apiBaseUrl={settings.apiBaseUrl} onClose={() => setOverlay(null)} /> : null}
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
  analytics: 'Monitor QA operations metrics from n8n analytics, with local fallback while endpoints come online.',
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
            projects={props.projects}
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

function ProjectSelect({
  value,
  onChange,
  projects,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  projects: Project[]
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || !projects.length}
      className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="">{projects.length ? 'Select a project' : 'No assigned projects available'}</option>
      {projects.map((project) => (
        <option key={project.id} value={project.name}>
          {project.name}
        </option>
      ))}
    </select>
  )
}

function KnowledgeForm(props: {
  projectName: string
  setProjectName: (value: string) => void
  projects: Project[]
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
        <ProjectSelect value={props.projectName} onChange={props.setProjectName} projects={props.projects} disabled={props.submitting} />
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
        <button disabled={props.submitting || !props.projectName.trim() || !props.projects.length} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
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
        <ProjectSelect value={props.projectName} onChange={props.setProjectName} projects={props.projects} disabled={props.submitting} />
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
        <button disabled={props.submitting || !props.projectName.trim() || !props.projects.length} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
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

  const pct = state.status === 'completed' ? 100 : state.status === 'processing' ? 50 : state.status === 'pending' || state.status === 'queued' ? 25 : 15
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
  if (status === 'pending') return 'Waiting in the backend queue. The worker will pick this up shortly.'
  if (status === 'processing') return processing
  if (status === 'completed') return completed
  if (status === 'failed') return failed
  return 'Waiting for the backend to return a matching job.'
}

function OutputPanel({ status, output }: { status: JobStatus; output: any }) {
  if (status === 'failed' && output) {
    const errorType = output.errorType || output.error?.errorType || 'GENERATION_FAILED'
    const message = output.message || output.error?.message || 'The backend marked this job as failed.'
    return (
      <section className="rounded-xl border border-error/30 bg-error-container p-6 text-on-error-container">
        <h3 className="mb-2 text-lg font-semibold">Generation Failure Detail</h3>
        <p className="text-sm font-bold">{errorType}</p>
        <p className="mt-2 text-sm leading-6">{message}</p>
        {output.failed_at ? <p className="mt-2 text-xs">Failed at: {output.failed_at}</p> : null}
      </section>
    )
  }
  if (status !== 'completed' || !output) return null
  if (output.epics && output.stories) {
    return (
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">Generated Jira Output</h3>
          <GenerationUsage output={output} />
        </div>
        <OutputList title="Epics" items={output.epics} keyName="epicID" labelName="epicKey" linkName="epicLink" />
        <OutputList title="User Stories" items={output.stories} keyName="storyID" labelName="storyKey" linkName="storyLink" />
      </section>
    )
  }
  if (output.url) {
    return (
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Document Link</h3>
            <a className="font-bold text-primary underline" href={output.url} target="_blank" rel="noopener noreferrer">Open Document</a>
          </div>
          <GenerationUsage output={output} />
        </div>
      </section>
    )
  }
  return null
}

function GenerationUsage({ output }: { output: any }) {
  const usage = output?.tokenUsage || {}
  const tokens = Number(usage.total || output?.tokensTotal || 0)
  const cost = Number(usage.estimatedCostUsd || output?.estimatedCostUsd || 0)
  const wordCount = Number(output?.wordCount || 0)
  if (!tokens && !cost && !wordCount) return null
  return (
    <div className="grid min-w-[220px] grid-cols-3 gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-center">
      <div>
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Words</p>
        <p className="mt-1 text-sm font-bold">{wordCount.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tokens</p>
        <p className="mt-1 text-sm font-bold">{tokens.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-on-surface-variant">Cost</p>
        <p className="mt-1 text-sm font-bold">${cost.toFixed(4)}</p>
      </div>
    </div>
  )
}

function OutputList({ title, items, keyName, labelName, linkName }: { title: string; items: any[]; keyName: string; labelName: string; linkName: string }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const id = item[keyName] || item.id || item.jiraEpicId || item.jiraStoryId || item.epicCorrelationId || item.storyCorrelationId || index
          const label = item[labelName] || item.key || item.jiraEpicKey || item.jiraStoryKey || item.parentEpicKey || 'Created'
          const link = item[linkName] || item.link || item.url || item.jiraEpicSelf || item.jiraStorySelf
          const className = 'rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'
          return link ? (
            <a key={id} className={className} href={link} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ) : (
            <span key={id} className={className}>
              {label}
            </span>
          )
        })}
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

function PlatformLoadCard({ infrastructureLoad, activeJobs, failedJobs, onClick }: { infrastructureLoad: InfrastructureLoad | null; activeJobs: number; failedJobs: number; onClick: () => void }) {
  const load = infrastructureLoad?.score ?? Math.min(95, 18 + activeJobs * 28 + failedJobs * 12)
  const queue = infrastructureLoad?.queues
  const workflows = infrastructureLoad?.workflows
  const usage = infrastructureLoad?.usage
  const unhealthyServices = infrastructureLoad?.services.filter((service) => ['degraded', 'error', 'unreachable', 'unauthorized'].includes(String(service.status))).length ?? 0
  const ringColor = infrastructureLoad?.status === 'error' ? 'text-error' : infrastructureLoad?.status === 'degraded' ? 'text-warning' : 'text-primary'
  const subtitle = infrastructureLoad
    ? `${queue?.active ?? 0} active, ${queue?.pending ?? 0} pending`
    : activeJobs
      ? `${activeJobs} active job${activeJobs === 1 ? '' : 's'}`
      : 'Local session fallback'
  return (
    <button onClick={onClick} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-left transition hover:border-primary">
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12">
          <svg className="h-full w-full -rotate-90">
            <circle className="text-surface-container" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4" />
            <circle className={ringColor} cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset={125 - (load / 100) * 125} strokeWidth="4" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-on-surface">{load}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-on-surface">Platform Load</p>
              <p className="text-xs text-on-surface-variant">{subtitle}</p>
            </div>
            {infrastructureLoad ? <StatusBadge status={infrastructureLoad.status === 'ok' ? 'success' : infrastructureLoad.status === 'error' ? 'error' : 'warning'} label={infrastructureLoad.scope === 'self' ? 'My Projects' : 'Workspace'} /> : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
            <span>Processing: <strong className="text-on-surface">{queue?.processing ?? activeJobs}</strong></span>
            <span>Failures 24h: <strong className="text-on-surface">{(queue?.failedLast24h ?? failedJobs) + (workflows?.failedLast24h ?? 0)}</strong></span>
            <span>Avg duration: <strong className="text-on-surface">{formatDuration(workflows?.avgDurationMs ?? 0)}</strong></span>
            <span>Services: <strong className="text-on-surface">{unhealthyServices ? `${unhealthyServices} degraded` : infrastructureLoad ? 'healthy' : 'pending'}</strong></span>
            <span>Tokens today: <strong className="text-on-surface">{usage?.tokensToday ?? 0}</strong></span>
            <span>Cost today: <strong className="text-on-surface">${(usage?.costTodayUsd ?? 0).toFixed(2)}</strong></span>
          </div>
          {queue?.oldestPendingAgeSeconds ? <p className="mt-3 text-xs text-on-surface-variant">Oldest pending: {formatDuration(queue.oldestPendingAgeSeconds * 1000)}</p> : null}
        </div>
      </div>
    </button>
  )
}

function ArtifactsRepository({ records, projects, onUpload, onAudit, onReprocess }: { records: ArtifactRecord[]; projects: Project[]; onUpload: () => void; onAudit: () => void; onReprocess: (artifactId: string) => void }) {
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
                {records.map((record) => {
                  const canReprocess = record.status === 'failed'
                  return (
                    <tr key={record.id}>
                      <td className="p-4 font-semibold text-on-surface">{record.fileName}</td>
                      <td className="p-4 text-on-surface-variant">{record.type}</td>
                      <td className="p-4 text-on-surface-variant">{record.projectName}</td>
                      <td className="p-4 text-on-surface-variant">{fileSize(record.size)}</td>
                      <td className="p-4 text-on-surface-variant">{formatTime(record.uploadedAt)}</td>
                      <td className="p-4"><StatusBadge status={record.status === 'failed' ? 'error' : record.status === 'processed' ? 'success' : 'info'} label={record.status} /></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {record.url ? <a href={record.url} target="_blank" rel="noopener noreferrer" className="rounded border border-outline-variant px-3 py-1 text-xs font-bold hover:bg-surface-container">Preview</a> : <button className="rounded border border-outline-variant px-3 py-1 text-xs font-bold opacity-60" disabled>Preview</button>}
                          <button
                            onClick={() => onReprocess(record.id)}
                            disabled={!canReprocess}
                            title={canReprocess ? 'Reprocess failed artifact' : 'Only failed artifacts can be reprocessed'}
                            className="rounded border border-outline-variant px-3 py-1 text-xs font-bold hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            Reprocess
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

function AnalyticsPage({
  analytics,
  loading,
  error,
  pipeline,
  days,
  setPipeline,
  setDays,
  onRefresh,
  projects,
  artifacts,
  outputs,
  activeJobs,
  failedJobs,
}: {
  analytics: AnalyticsSummary | null
  loading: boolean
  error: string
  pipeline: string
  days: number
  setPipeline: (value: string) => void
  setDays: (value: number) => void
  onRefresh: () => void
  projects: Project[]
  artifacts: ArtifactRecord[]
  outputs: GeneratedOutput[]
  activeJobs: number
  failedJobs: number
}) {
  const successRate = analytics?.overview.successRate ?? (failedJobs ? 72 : outputs.length || projects.length ? 96 : 0)
  const byDocType = analytics?.byDocumentType ?? []
  const recentJobs = analytics?.recentJobs ?? []
  const ingestion = analytics?.ingestion
  const failuresByPipeline = analytics?.failures?.byPipeline ?? []
  const costByPipeline = analytics?.costs?.byPipeline ?? []
  const costByProject = analytics?.costs?.byProject ?? []
  const filesByKnowledgeBase = ingestion?.filesByKnowledgeBase ?? []
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div>
          <h3 className="text-lg font-semibold">QA Operations Analytics</h3>
          <p className="text-sm text-on-surface-variant">{analytics ? `Live n8n analytics generated ${formatTime(String(analytics.meta?.generatedAt || ''))}.` : 'Local metrics are shown until /webhook/analytics-summary is available.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={pipeline} onChange={(event) => setPipeline(event.target.value)} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-bold">
            <option value="all">All pipelines</option>
            <option value="generation">Generation</option>
            <option value="ingestion">Ingestion</option>
          </select>
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-bold">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={onRefresh} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>
      {error ? <StatusNotice status="warning" message={error} /> : null}
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Jobs completed" value={analytics?.overview.totalJobsCompleted ?? outputs.length} />
        <MetricCard label="Documents generated" value={analytics?.overview.totalDocumentsGenerated ?? outputs.length} />
        <MetricCard label="Success rate" value={`${successRate}%`} />
        <MetricCard label="Tokens" value={analytics?.overview.totalTokensConsumed ?? 0} />
        <MetricCard label="Cost" value={`$${(analytics?.overview.totalCostUsd ?? 0).toFixed(2)}`} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Ingestion completed" value={ingestion?.jobsCompleted ?? analytics?.overview.totalIngestionJobsCompleted ?? 0} />
        <MetricCard label="Chunks ingested" value={ingestion?.totalChunksIngested ?? analytics?.overview.totalChunksIngested ?? 0} />
        <MetricCard label="Avg processing" value={formatDuration(ingestion?.avgProcessingDurationMs ?? analytics?.overview.avgIngestionDurationMs ?? analytics?.overview.avgDurationMs)} />
        <MetricCard label="Files processed" value={ingestion?.totalFilesProcessed ?? analytics?.overview.totalFilesProcessed ?? 0} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Throughput" bars={byDocType.length ? byDocType.slice(0, 6).map((item) => Math.min(100, Number(item.count || item.total || item.jobs || 0) * 10)) : [60, 42, 78, 55, 88, 70]} labels={byDocType.length ? byDocType.slice(0, 6).map((item) => documentTypeLabel(String(item.documentType || item.document_type || item.type || 'Doc'))) : ['KB', 'Plan', 'Risk', 'RTM', 'Cases', 'Stories']} />
        <ChartPanel title="Reliability" bars={[successRate, 100 - (analytics?.failureRate.generation ?? failedJobs), 100 - (analytics?.failureRate.ingestion ?? 0), activeJobs ? 70 : 95]} labels={['Jobs', 'Generation', 'Ingestion', 'Queue']} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <AnalyticsMiniTable
          title="Recent Failures By Pipeline"
          emptyText="No failed backend jobs in this range."
          columns={['Pipeline', 'Failures', 'Latest']}
          rows={failuresByPipeline.map((item) => [
            item.pipeline || 'unknown',
            item.count,
            item.latestFailureAt ? formatTime(item.latestFailureAt) : '-',
          ])}
        />
        <AnalyticsMiniTable
          title="Cost By Pipeline"
          emptyText="No token cost has been recorded yet."
          columns={['Pipeline', 'Jobs', 'Cost']}
          rows={costByPipeline.map((item) => [
            item.pipeline || 'unknown',
            item.jobs,
            `$${item.estimatedCostUsd.toFixed(4)}`,
          ])}
        />
        <AnalyticsMiniTable
          title="Files Per Knowledge Base"
          emptyText="No completed ingestion jobs in this range."
          columns={['Knowledge Base', 'Files', 'Chunks']}
          rows={filesByKnowledgeBase.map((item) => [
            item.projectName,
            item.filesProcessed,
            item.chunksIngested,
          ])}
        />
      </div>
      <AnalyticsMiniTable
        title="Cost By Project"
        emptyText="No project-level cost has been recorded yet."
        columns={['Project', 'Jobs', 'Tokens', 'Cost']}
        rows={costByProject.map((item) => [
          item.projectName || item.projectId || 'Unknown project',
          item.jobs,
          item.tokensTotal,
          `$${item.estimatedCostUsd.toFixed(4)}`,
        ])}
      />
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="border-b border-outline-variant p-5">
          <h3 className="text-lg font-semibold">Recent Backend Jobs</h3>
        </div>
        {recentJobs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="p-4">Job</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Pipeline</th>
                  <th className="p-4">Chunks</th>
                  <th className="p-4">Files</th>
                  <th className="p-4">Tokens</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentJobs.map((job) => (
                  <tr key={job.jobId}>
                    <td className="p-4 font-semibold">{job.jobId}</td>
                    <td className="p-4 text-on-surface-variant">{job.projectName || '-'}</td>
                    <td className="p-4 text-on-surface-variant">{documentTypeLabel(job.documentType)}</td>
                    <td className="p-4 text-on-surface-variant">{job.pipeline || '-'}</td>
                    <td className="p-4 text-on-surface-variant">{job.chunkCount || 0}</td>
                    <td className="p-4 text-on-surface-variant">{job.totalFiles || 0}</td>
                    <td className="p-4 text-on-surface-variant">{job.tokensTotal || 0}</td>
                    <td className="p-4 text-on-surface-variant">${(job.estimatedCostUsd || 0).toFixed(4)}</td>
                    <td className="p-4 text-on-surface-variant">{job.createdAt ? formatTime(job.createdAt) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-on-surface-variant">No backend analytics jobs returned yet. Local fallback: {projects.length} projects, {artifacts.length} artifacts, {outputs.length} outputs.</p>
        )}
      </div>
    </section>
  )
}

function AnalyticsMiniTable({
  title,
  columns,
  rows,
  emptyText,
}: {
  title: string
  columns: string[]
  rows: Array<Array<string | number>>
  emptyText: string
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant p-4">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="p-3">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${title}-${index}-${cellIndex}`} className={cellIndex === 0 ? 'p-3 font-semibold' : 'p-3 text-on-surface-variant'}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </div>
  )
}

type SettingsPersona = 'admin' | 'user'
type AdminSettingsSection = 'profile' | 'users' | 'environment' | 'integrations' | 'defaults' | 'security' | 'status'
type UserSettingsSection = 'profile' | 'notifications' | 'projects' | 'status'

const adminSettingsTabs: Array<{ key: AdminSettingsSection; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'users', label: 'Users & Roles' },
  { key: 'environment', label: 'Environment' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'defaults', label: 'Defaults' },
  { key: 'security', label: 'Security' },
  { key: 'status', label: 'System Status' },
]

const userSettingsTabs: Array<{ key: UserSettingsSection; label: string }> = [
  { key: 'profile', label: 'Profile' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'projects', label: 'My Projects' },
  { key: 'status', label: 'System Status' },
]

const sampleUsers = [
  { name: 'Admin User', email: 'admin@qops.local', role: 'Admin', projects: ['All projects'], lastActive: 'Now active', status: 'success' as StatusTone },
  { name: 'Marcus Chen', email: 'm.chen@enterprise.com', role: 'Registered User', projects: ['Payments modernization'], lastActive: '2 hours ago', status: 'info' as StatusTone },
  { name: 'Sarah Hughes', email: 's.hughes@enterprise.com', role: 'Registered User', projects: ['Checkout R2.4', 'Mobile QA'], lastActive: 'Yesterday', status: 'info' as StatusTone },
  { name: 'David Miller', email: 'd.miller@external.com', role: 'Pending Invite', projects: ['Awaiting acceptance'], lastActive: 'Never logged in', status: 'warning' as StatusTone },
]

const fallbackIntegrationServices = [
  { name: 'n8n backend', status: 'ok', detail: 'Configured backend health endpoint.' },
  { name: 'Supabase DB', status: 'not_configured', detail: 'Run health check to validate database access.' },
  { name: 'Supabase Storage', status: 'not_configured', detail: 'Run health check to validate storage bucket access.' },
  { name: 'ChromaDB', status: 'not_configured', detail: 'Run health check to validate vector collection access.' },
  { name: 'FastAPI Extractor', status: 'not_configured', detail: 'Run health check to validate document extraction service.' },
  { name: 'Converter Service', status: 'not_configured', detail: 'Run health check to validate document conversion service.' },
  { name: 'Jira', status: 'backend-managed', detail: 'Dedicated Jira validation is planned for Admin settings.' },
  { name: 'Confluence', status: 'backend-managed', detail: 'Dedicated Confluence validation is planned for Admin settings.' },
  { name: 'OpenAI', status: 'backend-managed', detail: 'Backend-managed; not pinged from the UI.' },
]

function normalizeHealthTone(status?: string): StatusTone {
  const value = String(status || '').toLowerCase()
  if (value === 'ok' || value === 'operational' || value === 'configured') return 'success'
  if (value === 'degraded' || value === 'not_configured' || value === 'backend-managed' || value === 'down') return 'warning'
  if (value === 'error' || value === 'unreachable' || value === 'unauthorized') return 'error'
  return 'info'
}

function serviceLabel(status?: string) {
  const value = String(status || 'unknown').replace(/_/g, ' ')
  if (value === 'ok') return 'Operational'
  if (value === 'backend-managed') return 'Backend managed'
  return value.replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatActivity(value?: string) {
  if (!value) return 'Never logged in'
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return value
  return timestamp.toLocaleString()
}

function SettingsPage({
  settings,
  setSettings,
  connectionResult,
  healthStatus,
  projects,
  users,
  usersLoading,
  usersNotice,
  backendSettings,
  settingsLoading,
  settingsNotice,
  currentUser,
  onRefreshUsers,
  onRefreshSettings,
  onSaveIntegration,
  onTestIntegration,
  onInviteUser,
  onUpdateUser,
  onTestConnection,
  onStatus,
}: {
  settings: SettingsState
  setSettings: (value: SetStateAction<SettingsState>) => void
  connectionResult: { status: StatusTone; message: string } | null
  healthStatus: HealthStatus | null
  projects: Project[]
  users: ApiUser[]
  usersLoading: boolean
  usersNotice: string
  backendSettings: SettingsResponse | null
  settingsLoading: boolean
  settingsNotice: string
  currentUser: CurrentUser | null
  onRefreshUsers: () => Promise<boolean>
  onRefreshSettings: () => Promise<boolean>
  onSaveIntegration: (integrationKey: string, config: Record<string, any>, enabled?: boolean) => Promise<boolean>
  onTestIntegration: (integrationKey: string) => Promise<boolean>
  onInviteUser: (payload: InviteUserPayload) => Promise<boolean>
  onUpdateUser: (payload: UpdateUserPayload) => Promise<boolean>
  onTestConnection: () => void
  onStatus: () => void
}) {
  const update = (patch: Partial<SettingsState>) => setSettings((current) => ({ ...current, ...patch }))
  const [persona, setPersona] = useState<SettingsPersona>('admin')
  const [adminSection, setAdminSection] = useState<AdminSettingsSection>('integrations')
  const [userSection, setUserSection] = useState<UserSettingsSection>('profile')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const isAdmin = currentUser?.role === 'admin'
  const effectivePersona: SettingsPersona = isAdmin ? persona : 'user'
  const services = healthStatus?.services?.length ? healthStatus.services : fallbackIntegrationServices
  const healthTone = normalizeHealthTone(healthStatus?.status)
  const activeSection = effectivePersona === 'admin' ? adminSection : userSection
  const visibleUsers = users.length ? users : currentUser ? [{
    ...currentUser,
    projects: currentUser.role === 'admin' ? ['All projects'] : ['Assigned projects'],
  } as ApiUser] : []
  const adminUsers = visibleUsers.filter((user) => user.role === 'admin')
  const pendingUsers = visibleUsers.filter((user) => user.status === 'pending_invite')
  const jiraIntegration = getIntegration(backendSettings, 'jira')
  const confluenceIntegration = getIntegration(backendSettings, 'confluence')
  const chromaIntegration = getIntegration(backendSettings, 'chroma')
  const [jiraDraft, setJiraDraft] = useState({ baseUrl: '', projectKey: '', projectId: '', idempotencyLabelPrefix: 'qops' })
  const [confluenceDraft, setConfluenceDraft] = useState({ baseUrl: '', spaceKey: '', parentPageId: '', pageTitlePattern: '{documentTitle} - {projectName}' })
  const [savingIntegration, setSavingIntegration] = useState<string | null>(null)
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects])
  const projectLabelsForUser = useCallback(
    (user: ApiUser) => {
      if (user.role === 'admin') return ['All projects']
      const roles: Array<{ projectId: string; projectName?: string; role: string }> = user.projectRoles?.length
        ? user.projectRoles
        : user.projects?.map((projectId) => ({ projectId, role: '' })) || []
      if (!roles.length) return ['No projects assigned']
      return roles.map((assignment) => {
        const label = assignment.projectName || projectNameById.get(assignment.projectId) || assignment.projectId
        return assignment.role ? `${label} (${assignment.role})` : label
      })
    },
    [projectNameById],
  )

  useEffect(() => {
    if (isAdmin) return
    setPersona('user')
    setUserSection('profile')
    setInviteOpen(false)
    setEditingUser(null)
  }, [isAdmin])

  useEffect(() => {
    const config = jiraIntegration?.config || {}
    setJiraDraft({
      baseUrl: String(config.baseUrl || ''),
      projectKey: String(config.projectKey || ''),
      projectId: String(config.projectId || ''),
      idempotencyLabelPrefix: String(config.idempotencyLabelPrefix || 'qops'),
    })
  }, [jiraIntegration?.updatedAt, jiraIntegration?.settingsVersion])

  useEffect(() => {
    const config = confluenceIntegration?.config || {}
    setConfluenceDraft({
      baseUrl: String(config.baseUrl || ''),
      spaceKey: String(config.spaceKey || ''),
      parentPageId: String(config.parentPageId || ''),
      pageTitlePattern: String(config.pageTitlePattern || '{documentTitle} - {projectName}'),
    })
  }, [confluenceIntegration?.updatedAt, confluenceIntegration?.settingsVersion])

  const saveJira = async () => {
    setSavingIntegration('jira')
    const currentConfig = jiraIntegration?.config || {}
    const ok = await onSaveIntegration('jira', {
      ...currentConfig,
      baseUrl: jiraDraft.baseUrl.trim(),
      projectKey: jiraDraft.projectKey.trim(),
      projectId: jiraDraft.projectId.trim(),
      idempotencyLabelPrefix: jiraDraft.idempotencyLabelPrefix.trim() || 'qops',
    }, jiraIntegration?.enabled ?? true)
    setSavingIntegration(null)
    return ok
  }

  const saveConfluence = async () => {
    setSavingIntegration('confluence')
    const currentConfig = confluenceIntegration?.config || {}
    const ok = await onSaveIntegration('confluence', {
      ...currentConfig,
      baseUrl: confluenceDraft.baseUrl.trim(),
      spaceKey: confluenceDraft.spaceKey.trim(),
      parentPageId: confluenceDraft.parentPageId.trim() || null,
      pageTitlePattern: confluenceDraft.pageTitlePattern.trim() || '{documentTitle} - {projectName}',
    }, confluenceIntegration?.enabled ?? true)
    setSavingIntegration(null)
    return ok
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Persona-aware configuration</p>
            <h3 className="mt-2 text-2xl font-bold text-on-surface">Settings Control Center</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Admins manage runtime integrations and access. Registered users keep a focused view for profile, notifications, assigned projects, and read-only platform health.
            </p>
          </div>
          <div className="flex rounded-lg border border-outline-variant bg-surface-container-low p-1">
            {(isAdmin ? (['admin', 'user'] as SettingsPersona[]) : (['user'] as SettingsPersona[])).map((item) => (
              <button
                key={item}
                onClick={() => setPersona(item)}
                className={`rounded-md px-4 py-2 text-sm font-bold ${persona === item ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {item === 'admin' ? 'Admin' : 'Registered User'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-outline-variant pt-4">
          {(effectivePersona === 'admin' ? adminSettingsTabs : userSettingsTabs).map((tab) => {
            const isActive = activeSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => (effectivePersona === 'admin' ? setAdminSection(tab.key as AdminSettingsSection) : setUserSection(tab.key as UserSettingsSection))}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {effectivePersona === 'admin' && adminSection === 'profile' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <SettingsPanel title="Admin Profile">
            <div className="flex items-center gap-4">
              <img src={avatar} alt="Admin profile" className="h-20 w-20 rounded-xl border border-outline-variant object-cover" />
              <div>
                <p className="text-lg font-bold">{settings.name || 'Admin User'}</p>
                <p className="text-sm text-on-surface-variant">{settings.email || 'admin@qops.local'}</p>
                <StatusBadge status="success" label="Admin" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsInput label="Name" value={settings.name} onChange={(value) => update({ name: value })} />
              <SettingsInput label="Role" value={settings.role} onChange={(value) => update({ role: value })} />
              <SettingsInput label="Email" value={settings.email} onChange={(value) => update({ email: value })} />
            </div>
          </SettingsPanel>
          <SettingsPanel title="Admin Capabilities">
            <div className="grid gap-3 sm:grid-cols-2">
              {['Manage users and roles', 'Edit all integrations', 'Test system connections', 'View audit and diagnostics'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </SettingsPanel>
        </div>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'users' ? (
        <SettingsPanel title="Users And Roles">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-4">
              <MetricCard label="Total users" value={visibleUsers.length} />
              <MetricCard label="Admins" value={adminUsers.length} />
              <MetricCard label="Registered" value={visibleUsers.filter((user) => user.role === 'registered_user').length} />
              <MetricCard label="Pending" value={pendingUsers.length} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={onRefreshUsers} className="rounded-lg border border-outline-variant px-4 py-3 text-sm font-bold hover:bg-surface-container">
                {usersLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={() => setInviteOpen(true)} className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-on-primary">Invite User</button>
            </div>
          </div>
          {usersNotice ? <StatusNotice status="warning" message={usersNotice} /> : null}
          <p className="text-sm leading-6 text-on-surface-variant">
            User records are read from auth-aware n8n endpoints. Invites and role edits require an active Admin session and service-role credentials inside n8n.
          </p>
          {inviteOpen ? (
            <InviteUserForm
              projects={projects}
              onCancel={() => setInviteOpen(false)}
              onSubmit={async (payload) => {
                const ok = await onInviteUser(payload)
                if (ok) setInviteOpen(false)
              }}
            />
          ) : null}
          {editingUser ? (
            <EditUserForm
              user={editingUser}
              projects={projects}
              onCancel={() => setEditingUser(null)}
              onSubmit={async (payload) => {
                const ok = await onUpdateUser(payload)
                if (ok) setEditingUser(null)
              }}
            />
          ) : null}
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Projects</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {visibleUsers.map((user) => {
                  const roleLabel = user.role === 'admin' ? 'Admin' : 'Registered User'
                  const statusTone: StatusTone = user.status === 'active' ? 'success' : user.status === 'pending_invite' ? 'warning' : 'error'
                  const projectLabels = projectLabelsForUser(user)
                  return (
                  <tr key={user.email} className="hover:bg-surface-container-low">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={statusTone} label={roleLabel} /></td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {projectLabels.map((project) => <span key={project} className="rounded bg-surface-container px-2 py-1 text-xs font-semibold text-on-surface-variant">{project}</span>)}
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">{formatActivity(user.lastLoginAt)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => setEditingUser(user)} className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold hover:bg-surface-container">Edit</button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SettingsPanel>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'environment' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsPanel title="Environment">
            <SettingsInput label="Environment name" value="Local development" onChange={() => undefined} />
            <SettingsInput label="n8n API base URL" value={settings.apiBaseUrl} onChange={(value) => update({ apiBaseUrl: value })} />
            <div className="rounded-lg bg-surface-container-low p-4 text-xs leading-5 text-on-surface-variant">
              Upload: /webhook/upload-test-artifacts<br />
              Generate: /webhook/generate-qa-doc<br />
              Polling: /webhook/job-status and /webhook/job-status-retrieve<br />
              Health: /webhook/health
            </div>
          </SettingsPanel>
          <SettingsPanel title="Connection Actions">
            <p className="text-sm leading-6 text-on-surface-variant">This UI uses the n8n health workflow at `/webhook/health` for aggregate checks. Dedicated integration-specific tests can be wired later without changing the workspace flow.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onTestConnection} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Test All Services</button>
              <button onClick={onStatus} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Open Status Modal</button>
            </div>
            {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
          </SettingsPanel>
        </div>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'integrations' ? (
        <div className="space-y-6">
          {settingsNotice ? <StatusNotice status="warning" message={settingsNotice} /> : null}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <SettingsPanel title="Jira Software">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-lg bg-primary p-3 text-on-primary"><ListChecks className="h-5 w-5" /></div>
                    <div>
                      <p className="font-bold">Jira Software</p>
                      <p className="text-xs text-on-surface-variant">Epics and user stories destination.</p>
                    </div>
                  </div>
                  <StatusBadge status={jiraDraft.baseUrl && jiraDraft.projectKey ? 'success' : 'warning'} label={jiraDraft.baseUrl && jiraDraft.projectKey ? 'Configured' : 'Not configured'} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => void onRefreshSettings()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">{settingsLoading ? 'Refreshing...' : 'Refresh'}</button>
                  <button onClick={() => void onTestIntegration('jira')} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                  <button onClick={() => void saveJira()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">{savingIntegration === 'jira' ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsInput label="Jira base URL" value={jiraDraft.baseUrl} onChange={(value) => { setJiraDraft((current) => ({ ...current, baseUrl: value })); update({ jiraUrl: value }) }} placeholder="https://company.atlassian.net" />
                <SettingsInput label="Project key" value={jiraDraft.projectKey} onChange={(value) => setJiraDraft((current) => ({ ...current, projectKey: value }))} placeholder="KAN" />
                <SettingsInput label="Project id" value={jiraDraft.projectId} onChange={(value) => setJiraDraft((current) => ({ ...current, projectId: value }))} placeholder="10001" />
                <SettingsInput label="Idempotency label prefix" value={jiraDraft.idempotencyLabelPrefix} onChange={(value) => setJiraDraft((current) => ({ ...current, idempotencyLabelPrefix: value }))} placeholder="qops" />
              </div>
              <p className="text-xs leading-5 text-on-surface-variant">Issue type mapping stays backend-managed in n8n/Jira credentials. The UI saves safe routing values only.</p>
            </SettingsPanel>
            <SettingsPanel title="Health Overview">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold">{healthStatus ? serviceLabel(healthStatus.status) : 'Pending'}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">{healthStatus?.generatedAt ? `Last checked ${formatTime(healthStatus.generatedAt)}` : 'Run a health check to populate live service status.'}</p>
                </div>
                <StatusBadge status={healthTone} label={healthStatus ? serviceLabel(healthStatus.status) : 'Not tested'} />
              </div>
              {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
            </SettingsPanel>
          </div>
          <SettingsPanel title="Confluence">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-bold">Confluence Publishing</p>
                <p className="mt-1 text-sm text-on-surface-variant">Default destination for generated QA documents.</p>
                <div className="mt-2"><StatusBadge status={confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'success' : 'warning'} label={confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'Configured' : 'Not configured'} /></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('confluence')} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button onClick={() => void saveConfluence()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">{savingIntegration === 'confluence' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsInput label="Confluence base URL" value={confluenceDraft.baseUrl} onChange={(value) => setConfluenceDraft((current) => ({ ...current, baseUrl: value }))} placeholder="https://company.atlassian.net/wiki" />
              <SettingsInput label="Space key" value={confluenceDraft.spaceKey} onChange={(value) => { setConfluenceDraft((current) => ({ ...current, spaceKey: value })); update({ confluenceSpace: value }) }} placeholder="TD" />
              <SettingsInput label="Parent page id" value={confluenceDraft.parentPageId} onChange={(value) => setConfluenceDraft((current) => ({ ...current, parentPageId: value }))} placeholder="Optional" />
              <SettingsInput label="Page title pattern" value={confluenceDraft.pageTitlePattern} onChange={(value) => setConfluenceDraft((current) => ({ ...current, pageTitlePattern: value }))} placeholder="{documentTitle} - {projectName}" />
            </div>
          </SettingsPanel>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <IntegrationStatusCard key={service.name} name={service.name} status={service.status} detail={service.detail} onTest={onTestConnection} />
            ))}
          </div>
        </div>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'defaults' ? (
        <SettingsPanel title="Defaults And Routing">
          <div className="grid gap-4 lg:grid-cols-3">
            <SettingsInput label="Default Jira project" value={jiraDraft.projectKey || 'KAN'} onChange={(value) => setJiraDraft((current) => ({ ...current, projectKey: value }))} />
            <SettingsInput label="Default Confluence space" value={confluenceDraft.spaceKey || settings.confluenceSpace} onChange={(value) => { setConfluenceDraft((current) => ({ ...current, spaceKey: value })); update({ confluenceSpace: value }) }} placeholder="TD" />
            <SettingsInput label="Default Chroma collection" value={String(chromaIntegration?.config?.collection || 'qa-chunks-batches')} onChange={() => undefined} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void saveJira()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Save Jira Default</button>
            <button onClick={() => void saveConfluence()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Save Confluence Default</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant">
                <tr><th className="p-4">Document type</th><th className="p-4">Destination</th><th className="p-4">Default route</th></tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {['Test Strategy', 'Test Plan', 'Test Cases', 'Risk Matrix', 'Traceability Matrix'].map((item) => <tr key={item}><td className="p-4 font-semibold">{item}</td><td className="p-4 text-on-surface-variant">Confluence</td><td className="p-4">Space {confluenceDraft.spaceKey || settings.confluenceSpace || 'TD'}</td></tr>)}
                <tr><td className="p-4 font-semibold">Epics & User Stories</td><td className="p-4 text-on-surface-variant">Jira</td><td className="p-4">Project {jiraDraft.projectKey || 'KAN'}</td></tr>
              </tbody>
            </table>
          </div>
        </SettingsPanel>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'security' ? (
        <SettingsPanel title="Notifications And Security">
          <ToggleRow label="In-app notifications" checked={settings.inAppNotifications} onChange={(checked) => update({ inAppNotifications: checked })} />
          <ToggleRow label="Email notifications" checked={settings.emailNotifications} onChange={(checked) => update({ emailNotifications: checked })} />
          <SettingsInput label="Session timeout (minutes)" value={settings.sessionTimeout} onChange={(value) => update({ sessionTimeout: value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            {['Secrets are masked in UI', 'Settings changes are audited', 'Users get least-privilege access'].map((item) => (
              <div key={item} className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm font-semibold">{item}</div>
            ))}
          </div>
        </SettingsPanel>
      ) : null}

      {effectivePersona === 'admin' && adminSection === 'status' ? (
        <SystemStatusSettings services={services} healthStatus={healthStatus} connectionResult={connectionResult} onTestConnection={onTestConnection} />
      ) : null}

      {effectivePersona === 'user' && userSection === 'profile' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsPanel title="Registered User Profile">
            <div className="flex items-center gap-4">
              <img src={avatar} alt="Registered user profile" className="h-20 w-20 rounded-xl border border-outline-variant object-cover" />
              <div>
                <p className="text-lg font-bold">{settings.name || 'Registered User'}</p>
                <p className="text-sm text-on-surface-variant">{settings.email || 'user@qops.local'}</p>
                <StatusBadge status="info" label="Registered User" />
              </div>
            </div>
            <SettingsInput label="Name" value={settings.name} onChange={(value) => update({ name: value })} />
            <SettingsInput label="Email" value={settings.email} onChange={(value) => update({ email: value })} />
          </SettingsPanel>
          <SettingsPanel title="Preferences">
            <IntegrationChip label="Default dashboard view" status="Dashboard overview" />
            <IntegrationChip label="Theme" status="Uses the app theme toggle" />
            <IntegrationChip label="Access level" status="Assigned projects and approved destinations only" />
          </SettingsPanel>
        </div>
      ) : null}

      {effectivePersona === 'user' && userSection === 'notifications' ? (
        <SettingsPanel title="My Notifications">
          <ToggleRow label="In-app notifications" checked={settings.inAppNotifications} onChange={(checked) => update({ inAppNotifications: checked })} />
          <ToggleRow label="Email notifications" checked={settings.emailNotifications} onChange={(checked) => update({ emailNotifications: checked })} />
          <ToggleRow label="Job completion alerts" checked={true} onChange={() => undefined} />
          <ToggleRow label="Job failure alerts" checked={true} onChange={() => undefined} />
        </SettingsPanel>
      ) : null}

      {effectivePersona === 'user' && userSection === 'projects' ? (
        <SettingsPanel title="My Projects">
          {projects.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{project.name}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{project.description || `${project.module || 'Project'} ${project.release || ''}`}</p>
                  </div>
                  <StatusBadge status={project.status === 'ready' ? 'success' : 'info'} label={project.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-surface-container px-2 py-1 text-xs font-semibold text-on-surface-variant">Upload artifacts</span>
                  <span className="rounded bg-surface-container px-2 py-1 text-xs font-semibold text-on-surface-variant">Generate documents</span>
                  <span className="rounded bg-surface-container px-2 py-1 text-xs font-semibold text-on-surface-variant">View outputs</span>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <StatusNotice status="warning" message="No projects are assigned to this user yet. Ask an admin to assign project access from Users And Roles." />
          )}
        </SettingsPanel>
      ) : null}

      {effectivePersona === 'user' && userSection === 'status' ? (
        <SystemStatusSettings services={services} healthStatus={healthStatus} connectionResult={connectionResult} onTestConnection={onTestConnection} readonly />
      ) : null}
    </section>
  )
}

function ProjectAssignmentPicker({
  projects,
  assignments,
  onChange,
  disabled = false,
}: {
  projects: Project[]
  assignments: ProjectAssignmentPayload[]
  onChange: (assignments: ProjectAssignmentPayload[]) => void
  disabled?: boolean
}) {
  const selectedByProject = new Map(assignments.map((assignment) => [assignment.projectId, assignment]))
  const updateAssignment = (projectId: string, checked: boolean) => {
    if (checked) {
      onChange([...assignments, { projectId, role: 'editor' }])
      return
    }
    onChange(assignments.filter((assignment) => assignment.projectId !== projectId))
  }
  const updateRole = (projectId: string, role: ProjectAssignmentPayload['role']) => {
    onChange(assignments.map((assignment) => assignment.projectId === projectId ? { ...assignment, role } : assignment))
  }

  return (
    <div className="md:col-span-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Assigned Projects</span>
        <span className="text-xs font-semibold text-on-surface-variant">{assignments.length} selected</span>
      </div>
      <div className="grid gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
        {projects.length ? projects.map((project) => {
          const selected = selectedByProject.get(project.id)
          return (
            <div key={project.id} className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(selected)}
                  disabled={disabled}
                  onChange={(event) => updateAssignment(project.id, event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-on-surface">{project.name}</span>
                  <span className="block truncate text-xs text-on-surface-variant">{project.module || project.id}</span>
                </span>
              </label>
              <select
                value={selected?.role || 'editor'}
                disabled={disabled || !selected}
                onChange={(event) => updateRole(project.id, event.target.value as ProjectAssignmentPayload['role'])}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60 sm:w-32"
              >
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          )
        }) : (
          <p className="rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">Create a project first, then assign it to registered users.</p>
        )}
      </div>
    </div>
  )
}

function InviteUserForm({ projects, onCancel, onSubmit }: { projects: Project[]; onCancel: () => void; onSubmit: (payload: InviteUserPayload) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<InviteUserPayload['role']>('registered_user')
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignmentPayload[]>([])
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ email: email.trim(), name: name.trim(), title: title.trim(), role, projectAssignments: role === 'registered_user' ? projectAssignments : [] })
    setSubmitting(false)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsInput label="Email" value={email} onChange={setEmail} placeholder="teammate@example.com" />
        <SettingsInput label="Name" value={name} onChange={setName} placeholder="Teammate Name" />
        <SettingsInput label="Title" value={title} onChange={setTitle} placeholder="QA Engineer" />
        <label className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as InviteUserPayload['role'])} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="registered_user">Registered User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {role === 'registered_user' ? (
          <ProjectAssignmentPicker projects={projects} assignments={projectAssignments} onChange={setProjectAssignments} disabled={submitting} />
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Cancel</button>
        <button disabled={submitting || !email.trim() || !name.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Inviting...' : 'Send Invite'}
        </button>
      </div>
    </form>
  )
}

function EditUserForm({ user, projects, onCancel, onSubmit }: { user: ApiUser; projects: Project[]; onCancel: () => void; onSubmit: (payload: UpdateUserPayload) => Promise<void> }) {
  const [name, setName] = useState(user.name || '')
  const [title, setTitle] = useState(user.title || '')
  const [role, setRole] = useState<UpdateUserPayload['role']>(user.role)
  const [status, setStatus] = useState<UpdateUserPayload['status']>(user.status)
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignmentPayload[]>(() => {
    if (user.projectRoles?.length) {
      return user.projectRoles
        .filter((assignment) => assignment.projectId)
        .map((assignment) => ({
          projectId: assignment.projectId,
          role: ['owner', 'editor', 'viewer'].includes(assignment.role) ? assignment.role as ProjectAssignmentPayload['role'] : 'editor',
        }))
    }
    return (user.projects || [])
      .filter((projectId) => projects.some((project) => project.id === projectId))
      .map((projectId) => ({ projectId, role: 'editor' as const }))
  })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ userId: user.id, name: name.trim(), title: title.trim(), role, status, projectAssignments: role === 'registered_user' ? projectAssignments : [] })
    setSubmitting(false)
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-4">
        <p className="text-sm font-bold text-on-surface">{user.email}</p>
        <p className="text-xs text-on-surface-variant">Edit profile, role, and access status.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsInput label="Name" value={name} onChange={setName} />
        <SettingsInput label="Title" value={title} onChange={setTitle} />
        <label className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as UpdateUserPayload['role'])} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="registered_user">Registered User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as UpdateUserPayload['status'])} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="active">Active</option>
            <option value="pending_invite">Pending Invite</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        {role === 'registered_user' ? (
          <ProjectAssignmentPicker projects={projects} assignments={projectAssignments} onChange={setProjectAssignments} disabled={submitting} />
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Cancel</button>
        <button disabled={submitting || !name.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function IntegrationStatusCard({ name, status, detail, onTest }: { name: string; status?: string; detail?: string; onTest: () => void }) {
  const tone = normalizeHealthTone(status)
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 transition-shadow hover:shadow-ambient">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3 text-primary"><Network className="h-5 w-5" /></div>
          <div>
            <p className="font-bold">{name}</p>
            <p className="text-xs text-on-surface-variant">Last test: {status ? 'health workflow' : 'not tested'}</p>
          </div>
        </div>
        <StatusBadge status={tone} label={serviceLabel(status)} />
      </div>
      <p className="mt-4 min-h-10 text-sm leading-5 text-on-surface-variant">{detail || 'No details returned yet.'}</p>
      <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3">
        <span className="text-xs font-semibold text-on-surface-variant">Credential: masked/backend-managed</span>
        <button onClick={onTest} className="text-sm font-bold text-primary hover:underline">Test</button>
      </div>
    </div>
  )
}

function SystemStatusSettings({ services, healthStatus, connectionResult, onTestConnection, readonly = false }: { services: Array<{ name: string; status?: string; detail?: string }>; healthStatus: HealthStatus | null; connectionResult: { status: StatusTone; message: string } | null; onTestConnection: () => void; readonly?: boolean }) {
  const healthTone = normalizeHealthTone(healthStatus?.status)
  return (
    <section className="space-y-6">
      <SettingsPanel title={readonly ? 'Read-Only System Status' : 'System Status'}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-3xl font-bold">{healthStatus ? serviceLabel(healthStatus.status) : 'Not tested'}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{healthStatus?.generatedAt ? `Last updated ${formatTime(healthStatus.generatedAt)}` : 'Run the health workflow to load live service status.'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={healthTone} label={healthStatus ? serviceLabel(healthStatus.status) : 'Pending'} />
            {!readonly ? <button onClick={onTestConnection} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Test All Services</button> : null}
          </div>
        </div>
        {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
      </SettingsPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div key={service.name} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{service.name}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{readonly ? 'Read-only platform status' : 'Admin health detail'}</p>
              </div>
              <StatusBadge status={normalizeHealthTone(service.status)} label={serviceLabel(service.status)} />
            </div>
            <p className="mt-4 text-sm leading-5 text-on-surface-variant">{readonly && normalizeHealthTone(service.status) !== 'success' ? 'Service status is managed by the platform admin.' : service.detail || 'No detail returned.'}</p>
          </div>
        ))}
      </div>
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
  const visibleIds = useMemo(() => new Set(notifications.map((item) => item.id)), [notifications])
  const markAll = () => setNotifications((current) => current.map((item) => (visibleIds.has(item.id) ? { ...item, read: true } : item)))
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

function StatusModal({ apiBaseUrl, health, onRefresh, onClose }: { apiBaseUrl: string; health: HealthStatus | null; onRefresh: () => void; onClose: () => void }) {
  const services = health?.services?.length ? health.services.map((service) => [
    service.name,
    service.detail || service.status,
    service.status === 'ok' ? 'success' : service.status === 'error' ? 'error' : service.status === 'degraded' ? 'warning' : 'info',
  ] as const) : [
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
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">Configured backend: {apiBaseUrl}</p>
        <button onClick={onRefresh} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Run Health Check</button>
      </div>
      {health ? <StatusNotice status={health.status === 'ok' ? 'success' : health.status === 'error' ? 'error' : 'warning'} message={`Health endpoint returned ${health.status}.`} /> : null}
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

function DiagnosticsModal({ infrastructureLoad, activeJobs, failedJobs, artifacts, apiBaseUrl, onClose }: { infrastructureLoad: InfrastructureLoad | null; activeJobs: number; failedJobs: number; artifacts: number; apiBaseUrl: string; onClose: () => void }) {
  const queueLoad = infrastructureLoad?.score ?? Math.min(95, 18 + activeJobs * 28 + failedJobs * 12)
  const active = infrastructureLoad?.queues.active ?? activeJobs
  const failures = (infrastructureLoad?.queues.failedLast24h ?? failedJobs) + (infrastructureLoad?.workflows.failedLast24h ?? 0)
  return (
    <ModalFrame title="System Diagnostics" onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Platform load" value={`${queueLoad}%`} />
        <MetricCard label="Active jobs" value={active} />
        <MetricCard label="Failures 24h" value={failures} />
        <MetricCard label="Tracked artifacts" value={artifacts} />
        <MetricCard label="Avg duration" value={formatDuration(infrastructureLoad?.workflows.avgDurationMs ?? 0)} />
        <MetricCard label="Cost today" value={`$${(infrastructureLoad?.usage.costTodayUsd ?? 0).toFixed(2)}`} />
      </div>
      <p className="mt-5 rounded-lg bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">
        {infrastructureLoad
          ? `Live infrastructure telemetry generated ${formatTime(infrastructureLoad.generatedAt || '')} for ${infrastructureLoad.scope === 'self' ? 'your assigned projects' : 'the workspace'}. Backend URL: ${apiBaseUrl}.`
          : `Diagnostics are using current session fallback until /webhook/infrastructure-load is published. Backend URL: ${apiBaseUrl}.`}
      </p>
      {infrastructureLoad?.services.length ? (
        <div className="mt-4 space-y-2">
          {infrastructureLoad.services.slice(0, 5).map((service) => (
            <div key={service.key || service.name} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <span className="text-sm font-semibold text-on-surface">{service.name}</span>
              <span className="text-xs text-on-surface-variant">{service.latencyMs ? `${service.latencyMs} ms` : service.status}</span>
            </div>
          ))}
        </div>
      ) : null}
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
