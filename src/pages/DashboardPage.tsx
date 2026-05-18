import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, FormEvent, KeyboardEvent, ReactNode, SetStateAction } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  ChevronDown,
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
  Menu,
  Moon,
  Network,
  Plus,
  RefreshCw,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
  fetchDocStatus,
  fetchKbStatus,
  fetchGeneratedDocuments,
  fetchHealthStatus,
  fetchInfrastructureLoad,
  fetchProjects,
  fetchSettings,
  fetchUsers,
  generateDocument,
  generateStoryTestCases,
  getApiBaseUrl,
  inviteUser,
  mapArtifactToDocumentType,
  mapDocumentTypeToArtifact,
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
import DeliveryIntelligencePage from './DeliveryIntelligencePage'
import type { DeliveryIntelligenceView } from './DeliveryIntelligencePage'

type ToastType = 'success' | 'error' | 'info'
type View = 'overview' | 'knowledge' | 'documents' | 'artifacts' | 'analytics' | 'settings' | 'docs' | 'faqs' | DeliveryIntelligenceView
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
  projectId?: string
  projectName: string
  artifactKey?: DocumentArtifactKey
  artifactLabel: string
  documentType?: string
  createdAt: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'not_found'
  url?: string
  output?: any
  retriedAt?: string
  retriedByJobId?: string
}

type KnowledgeJobRecord = {
  id: string
  jobId?: string
  projectId?: string
  projectName: string
  fileName?: string
  fileKey?: string
  processingClass?: string
  createdAt: string
  status: Exclude<JobStatus, 'idle'>
  error?: string
  retriedAt?: string
  retriedByJobIds?: string[]
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
  { key: 'testCases', label: 'Story Test Cases', description: 'Generate Jira Test Case issues from existing Epics & User Stories for this project.' },
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

function formatCompactNumber(value?: number) {
  const numeric = Number(value) || 0
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: numeric >= 1000 ? 1 : 0 }).format(numeric)
}

function formatCurrency(value?: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(Number(value) || 0)
}

const ESTIMATED_METRIC_TOOLTIP = 'Estimated from extracted text length and available model usage. Final provider billing may differ.'

function clampPercent(value?: number) {
  const numeric = Number(value) || 0
  return Math.max(0, Math.min(100, numeric))
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
    test_cases: 'Story Test Cases',
    story_test_cases: 'Story Test Cases',
    user_stories: 'Epics & User Stories',
    risk_matrix: 'Risk Matrix',
    traceability_matrix: 'Traceability Matrix',
  }
  if (backendLabels[value]) return backendLabels[value]
  const known = artifactOptions.find((item) => item.key === value || item.key === value.replace(/^test_/, '') || item.label.toLowerCase() === value.toLowerCase())
  if (known) return known.label
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function outputUrl(value: any) {
  return value?.url || value?.documentUrl || value?.link || undefined
}

function normalizeGeneratedOutputStatus(value?: string): GeneratedOutput['status'] {
  if (value === 'queued' || value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed' || value === 'not_found') return value
  return 'completed'
}

function isActiveDocumentStatus(status?: string) {
  return status === 'queued' || status === 'pending' || status === 'processing'
}

function isLegacyLocalJobId(jobId?: string | null) {
  return typeof jobId === 'string' && jobId.startsWith('JOB_')
}

function resolveArtifactKey(output: Pick<GeneratedOutput, 'artifactKey' | 'documentType' | 'artifactLabel' | 'output'>) {
  return output.artifactKey
    || mapDocumentTypeToArtifact(output.documentType)
    || mapDocumentTypeToArtifact(output.output?.documentType)
    || mapDocumentTypeToArtifact(output.artifactLabel)
}

function hasCompletedStoryBacklog(projectName: string, outputs: GeneratedOutput[]) {
  const normalizedProject = projectName.trim().toLowerCase()
  if (!normalizedProject) return false
  return outputs.some((output) => {
    if (output.projectName.trim().toLowerCase() !== normalizedProject) return false
    if (output.status !== 'completed') return false
    const artifactKey = resolveArtifactKey(output)
    const documentType = String(output.documentType || output.output?.documentType || '').trim().toLowerCase()
    return artifactKey === 'epicsAndStories' || documentType === 'user_stories'
  })
}

function mergeGeneratedOutputs(current: GeneratedOutput[], incoming: GeneratedOutput[]) {
  const incomingKeys = new Set(incoming.map((item) => item.jobId || item.id))
  const mergedIncoming = incoming.map((item) => {
    const existing = current.find((candidate) => (candidate.jobId || candidate.id) === (item.jobId || item.id))
    if (!existing) return item
    return {
      ...existing,
      ...item,
      artifactKey: item.artifactKey || existing.artifactKey,
      documentType: item.documentType || existing.documentType,
      projectId: item.projectId || existing.projectId,
      output: item.output ?? existing.output,
      url: item.url || existing.url,
      retriedAt: existing.retriedAt,
      retriedByJobId: existing.retriedByJobId,
    }
  })

  return [
    ...mergedIncoming,
    ...current.filter((item) => !incomingKeys.has(item.jobId || item.id)),
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

function updateGeneratedOutputRecord(current: GeneratedOutput[], jobId: string, patch: Partial<GeneratedOutput>) {
  let found = false
  const next = current.map((item) => {
    if (item.jobId !== jobId && item.id !== jobId) return item
    found = true
    return {
      ...item,
      ...patch,
      output: Object.prototype.hasOwnProperty.call(patch, 'output') ? patch.output : item.output,
      url: patch.url || item.url,
      artifactKey: patch.artifactKey || item.artifactKey,
      documentType: patch.documentType || item.documentType,
      projectId: patch.projectId || item.projectId,
    }
  })
  return found ? next : current
}

function normalizeKnowledgeJobStatus(value?: string): Exclude<JobStatus, 'idle'> {
  if (value === 'queued' || value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed' || value === 'not_found') return value
  return 'queued'
}

function updateKnowledgeJobRecord(current: KnowledgeJobRecord[], jobId: string, patch: Partial<KnowledgeJobRecord>) {
  let found = false
  const next = current.map((item) => {
    if (item.jobId !== jobId && item.id !== jobId) return item
    found = true
    return { ...item, ...patch }
  })
  return found ? next : current
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
    type: formatArtifactType(item.type),
    fileName: item.fileName || 'Unnamed artifact',
    size: item.size || 0,
    uploadedAt: item.uploadedAt || new Date().toISOString(),
    status: item.status || 'processed',
    url: item.url,
    jobId: item.jobId,
  }
}

function knowledgeStatusFromArtifactStatus(status?: ArtifactRecord['status']): Exclude<JobStatus, 'idle'> {
  if (status === 'processed') return 'completed'
  if (status === 'failed') return 'failed'
  return 'processing'
}

function normalizeGeneratedDocument(item: ApiGeneratedDocument): GeneratedOutput {
  const artifactKey = mapDocumentTypeToArtifact(item.documentType || item.artifactLabel)
  return {
    id: item.id || item.jobId || uid('output'),
    jobId: item.jobId,
    projectId: item.output?.destination?.projectId,
    projectName: item.projectName || 'Unknown project',
    artifactKey: artifactKey || undefined,
    artifactLabel: item.artifactLabel || documentTypeLabel(item.documentType),
    documentType: item.documentType,
    createdAt: item.createdAt || new Date().toISOString(),
    status: normalizeGeneratedOutputStatus(item.status),
    url: item.url || outputUrl(item.output),
    output: item.output,
  }
}

function formatArtifactType(value?: string): string {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'Artifact'
  if (normalized === 'brd' || normalized === 'frd' || normalized === 'hld' || normalized === 'lld') return normalized.toUpperCase()
  if (normalized === 'image' || normalized.startsWith('image')) return 'UI Design'
  if (normalized === 'transcript' || normalized.startsWith('transcript')) return 'Transcript'
  return String(value)
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
  const eventText = `${event.action} ${event.details}`
  return {
    id: `backend-${event.id}`,
    title: event.status === 'error' ? 'Backend job needs attention' : /retried|retry/i.test(eventText) ? 'Backend job retry queued' : event.action,
    message: `${event.project}: ${event.details}`,
    type: event.status,
    createdAt: event.timestamp,
    read: false,
    project: event.project,
    actionLabel: 'Open',
    actionView: event.status === 'error' ? 'analytics' : 'documents',
  }
}

function mergeNotificationFeed(notifications: NotificationEvent[], auditEvents: AuditEvent[], readIds: string[]) {
  const read = new Set(readIds)
  const byId = new Map<string, NotificationEvent>()
  notifications.forEach((notification) => {
    byId.set(notification.id, notification)
  })
  auditEvents.forEach((event) => {
    const notification = notificationFromAudit(event)
    if (!notification) return
    const existing = byId.get(notification.id)
    byId.set(notification.id, {
      ...notification,
      ...existing,
      read: existing?.read ?? read.has(notification.id),
    })
  })
  return Array.from(byId.values()).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
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

function isDeliveryIntelligenceView(view: View): view is DeliveryIntelligenceView {
  return view.startsWith('di-')
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [brd, setBrd] = useState<File | null>(null)
  const [frd, setFrd] = useState<File | null>(null)
  const [hld, setHld] = useState<File | null>(null)
  const [lld, setLld] = useState<File | null>(null)
  const [transcripts, setTranscripts] = useState<File[]>([])
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
  const visibleProjectIds = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return new Set<string>()
    return new Set((currentUser.projects || currentUser.projectRoles?.map((assignment) => assignment.projectId) || []).filter((id) => id && id !== 'All projects'))
  }, [currentUser?.projectRoles, currentUser?.projects, currentUser?.role])
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
  const [readNotificationIds, setReadNotificationIds] = usePersistentArrayState<string>('qops-agent-read-notification-ids', [])
  const [auditEvents, setAuditEvents] = usePersistentArrayState<AuditEvent>('qops-agent-audit-events', [])
  const [generatedOutputs, setGeneratedOutputs] = usePersistentArrayState<GeneratedOutput>('qops-agent-generated-outputs', [])
  const [knowledgeJobs, setKnowledgeJobs] = usePersistentArrayState<KnowledgeJobRecord>('qops-agent-knowledge-jobs', [])
  const [latestKnowledgeBatchJobIds, setLatestKnowledgeBatchJobIds] = usePersistentArrayState<string>('qops-agent-latest-knowledge-batch-job-ids', [])
  const [latestDocumentBatchJobIds, setLatestDocumentBatchJobIds] = usePersistentArrayState<string>('qops-agent-latest-document-batch-job-ids', [])
  const scopedGeneratedOutputs = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return generatedOutputs
    return generatedOutputs.filter((output) => visibleProjectNames.has(output.projectName.trim().toLowerCase()))
  }, [currentUser?.role, generatedOutputs, visibleProjectNames])
  const scopedKnowledgeJobs = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return knowledgeJobs
    return knowledgeJobs.filter((job) => visibleProjectNames.has(job.projectName.trim().toLowerCase()))
  }, [currentUser?.role, knowledgeJobs, visibleProjectNames])
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
  const scopeToVisibleProjects = useCallback(
    <T extends { projectName: string; projectId?: string }>(items: T[]) => {
      if (currentUser?.role !== 'registered_user') return items
      return items.filter((item) =>
        (item.projectId && visibleProjectIds.has(item.projectId))
        || visibleProjectNames.has(item.projectName.trim().toLowerCase()),
      )
    },
    [currentUser?.role, visibleProjectIds, visibleProjectNames],
  )
  useEffect(() => {
    if (currentUser?.role !== 'registered_user' || (!visibleProjectIds.size && !visibleProjectNames.size)) return
    setArtifactRecords((current) => scopeToVisibleProjects(current))
    setGeneratedOutputs((current) => scopeToVisibleProjects(current))
  }, [currentUser?.role, scopeToVisibleProjects, setArtifactRecords, setGeneratedOutputs, visibleProjectIds.size, visibleProjectNames.size])
  const notificationFeed = useMemo(
    () => mergeNotificationFeed(scopedNotifications, scopedAuditEvents, readNotificationIds),
    [readNotificationIds, scopedAuditEvents, scopedNotifications],
  )
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
  const terminalAuditRef = useRef<Set<string>>(new Set())
  const terminalRefreshRef = useRef<Set<string>>(new Set())
  const documentBackgroundRetryRef = useRef<Record<string, number>>({})
  const knowledgeBackgroundRetryRef = useRef<Record<string, number>>({})
  const documentBackgroundPollInFlightRef = useRef(false)
  const knowledgeBackgroundPollInFlightRef = useRef(false)
  const backendRefreshInFlightRef = useRef(false)
  const analyticsRefreshInFlightRef = useRef(false)
  const infrastructureRefreshInFlightRef = useRef(false)
  const generatedOutputsRef = useRef(generatedOutputs)
  const knowledgeJobsRef = useRef(knowledgeJobs)

  useEffect(() => {
    generatedOutputsRef.current = generatedOutputs
  }, [generatedOutputs])

  useEffect(() => {
    knowledgeJobsRef.current = knowledgeJobs
  }, [knowledgeJobs])

  const backgroundDocumentPollKey = useMemo(() => generatedOutputs
    .filter((item) => item.jobId
      && !isLegacyLocalJobId(item.jobId || item.id)
      && isActiveDocumentStatus(item.status)
      && item.jobId !== docJob.state.jobId)
    .map((item) => item.jobId)
    .sort()
    .join('|'), [docJob.state.jobId, generatedOutputs])

  const backgroundKnowledgePollKey = useMemo(() => knowledgeJobs
    .filter((item) => item.jobId
      && !isLegacyLocalJobId(item.jobId || item.id)
      && isActiveDocumentStatus(item.status)
      && item.jobId !== kbJob.state.jobId)
    .map((item) => item.jobId)
    .sort()
    .join('|'), [kbJob.state.jobId, knowledgeJobs])

  useEffect(() => {
    localStorage.setItem(API_BASE_URL_KEY, settings.apiBaseUrl.trim() || DEFAULT_API_BASE_URL)
  }, [settings.apiBaseUrl])

  useLayoutEffect(() => {
    setGeneratedOutputs((current) => {
      let changed = false
      const next = current.map((item) => {
        if (!isLegacyLocalJobId(item.jobId || item.id) || !isActiveDocumentStatus(item.status)) return item
        changed = true
        return {
          ...item,
          status: 'failed' as const,
          output: item.output ?? { message: 'Stale local-only job reference was cleared after reload.' },
        }
      })
      return changed ? next : current
    })
    setKnowledgeJobs((current) => {
      let changed = false
      const next = current.map((item) => {
        if (!isLegacyLocalJobId(item.jobId || item.id) || !isActiveDocumentStatus(item.status)) return item
        changed = true
        return {
          ...item,
          status: 'failed' as const,
          error: item.error || 'Stale local-only job reference was cleared after reload.',
        }
      })
      return changed ? next : current
    })
  }, [setGeneratedOutputs, setKnowledgeJobs])

  useEffect(() => {
    if (currentUser?.role !== 'registered_user') return
    if (projectName && !findProjectByName(visibleProjects, projectName)) setProjectName('')
    if (generationProject && !findProjectByName(visibleProjects, generationProject)) setGenerationProject('')
  }, [currentUser?.role, generationProject, projectName, visibleProjects])

  useEffect(() => {
    if (artifact !== 'testCases') return
    if (hasCompletedStoryBacklog(generationProject, scopedGeneratedOutputs)) return
    setArtifact('')
  }, [artifact, generationProject, scopedGeneratedOutputs])

  const refreshBackendData = useCallback(async () => {
    if (backendRefreshInFlightRef.current) return
    backendRefreshInFlightRef.current = true
    const healthAdvertisesRepositories = hasRepositoryWebhooks(healthStatus)
    try {
      if (!healthAdvertisesRepositories) {
        setBackendDataNotice('Checking repository endpoints directly while the health workflow registry is pending.')
      }

      const [projectData, artifactData, outputData, auditData] = await Promise.all([
        fetchProjects(),
        fetchArtifacts(),
        fetchGeneratedDocuments(),
        fetchAuditEvents(),
      ])

      const normalizedProjects = projectData?.map(normalizeProject) || null
      const assignedProjectIds = new Set((currentUser?.projects || currentUser?.projectRoles?.map((assignment) => assignment.projectId) || []).filter((id) => id && id !== 'All projects'))
      const assignedProjectNames = new Set((currentUser?.projectRoles || []).map((assignment) => assignment.projectName?.trim().toLowerCase()).filter(Boolean) as string[])
      normalizedProjects?.forEach((project) => {
        if (assignedProjectIds.has(project.id)) assignedProjectNames.add(project.name.trim().toLowerCase())
      })
      const scopeRepositoryItems = <T extends { projectName: string; projectId?: string }>(items: T[]) => {
        if (currentUser?.role !== 'registered_user') return items
        return items.filter((item) =>
          (item.projectId && assignedProjectIds.has(item.projectId))
          || assignedProjectNames.has(item.projectName.trim().toLowerCase()),
        )
      }

      let connected = false
      if (normalizedProjects) {
        connected = true
        setProjects(normalizedProjects)
      }
      if (artifactData) {
        connected = true
        const scopedArtifacts = scopeRepositoryItems(artifactData.map(normalizeArtifact))
        setArtifactRecords(scopedArtifacts)
        setKnowledgeJobs((current) => {
          let changed = false
          const artifactsByJobId = new Map(scopedArtifacts.filter((artifact) => artifact.jobId).map((artifact) => [artifact.jobId as string, artifact]))
          const next = current.map((job) => {
            if (!job.jobId) return job
            const artifact = artifactsByJobId.get(job.jobId)
            if (!artifact) return job
            const status = knowledgeStatusFromArtifactStatus(artifact.status)
            if (isActiveDocumentStatus(job.status) && status === 'failed') return job
            const patch: Partial<KnowledgeJobRecord> = {
              status,
              fileName: job.fileName || artifact.fileName,
              fileKey: job.fileKey || artifact.type,
              error: status === 'failed' ? job.error : undefined,
            }
            const updated = { ...job, ...patch }
            if (JSON.stringify(updated) !== JSON.stringify(job)) changed = true
            return updated
          })
          return changed ? next : current
        })
      }
      if (outputData) {
        connected = true
        const scopedOutputs = scopeRepositoryItems(outputData.map(normalizeGeneratedDocument))
        setGeneratedOutputs((current) => mergeGeneratedOutputs(scopeRepositoryItems(current), scopedOutputs))
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
    } finally {
      backendRefreshInFlightRef.current = false
    }
  }, [currentUser?.projectRoles, currentUser?.projects, currentUser?.role, healthStatus, setArtifactRecords, setAuditEvents, setGeneratedOutputs, setNotifications, setProjects])

  const refreshAnalytics = useCallback(async () => {
    if (analyticsRefreshInFlightRef.current) return
    analyticsRefreshInFlightRef.current = true
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const data = await fetchAnalyticsSummary({ pipeline: analyticsPipeline, days: analyticsDays })
      if (data) {
        setAnalytics(data)
      } else {
        setAnalyticsError('Backend analytics endpoint is not available yet. Showing local workspace metrics.')
      }
    } finally {
      setAnalyticsLoading(false)
      analyticsRefreshInFlightRef.current = false
    }
  }, [analyticsDays, analyticsPipeline])

  const refreshInfrastructureLoad = useCallback(async () => {
    if (infrastructureRefreshInFlightRef.current) return
    infrastructureRefreshInFlightRef.current = true
    try {
      const data = await fetchInfrastructureLoad()
      if (data) setInfrastructureLoad(data)
    } finally {
      infrastructureRefreshInFlightRef.current = false
    }
  }, [])

  const refreshInfrastructureLoadIfVisible = useCallback(() => {
    if (view === 'overview' || overlay === 'diagnostics') void refreshInfrastructureLoad()
  }, [overlay, refreshInfrastructureLoad, view])

  useEffect(() => {
    void refreshAnalytics()
  }, [refreshAnalytics])

  useEffect(() => {
    refreshInfrastructureLoadIfVisible()
  }, [refreshInfrastructureLoadIfVisible])

  useEffect(() => {
    if (healthStatus) return
    void testConnection()
  }, [healthStatus])

  useEffect(() => {
    if (!healthStatus) return
    void refreshBackendData()
  }, [healthStatus, refreshBackendData])

  useEffect(() => {
    const jobId = kbJob.state.jobId
    if (!jobId || kbJob.state.status === 'idle') return

    const nextStatus = normalizeKnowledgeJobStatus(kbJob.state.status)
    setKnowledgeJobs((current) => updateKnowledgeJobRecord(current, jobId, {
      status: nextStatus,
      error: kbJob.state.error || undefined,
    }))

    const matchingJob = knowledgeJobs.find((item) => item.jobId === jobId)
    const jobProjectName = matchingJob?.projectName || projectName.trim()

    const refreshKey = `kb:${jobId}:${nextStatus}`
    const shouldRunTerminalRefresh = (nextStatus === 'completed' || nextStatus === 'failed')
      && !terminalRefreshRef.current.has(refreshKey)

    if (nextStatus === 'completed' && jobProjectName && shouldRunTerminalRefresh) {
      const now = new Date().toISOString()
      setProjects((current) =>
        upsertProject(current, {
          name: jobProjectName,
          status: 'ready',
          updatedAt: now,
        }),
      )
      setArtifactRecords((current) => current.map((item) => (item.projectName === jobProjectName && item.status === 'processing' ? { ...item, status: 'processed' } : item)))
      void refreshBackendData()
      void refreshAnalytics()
      refreshInfrastructureLoadIfVisible()
    }

    if (nextStatus === 'failed' && shouldRunTerminalRefresh) {
      void refreshBackendData()
      void refreshAnalytics()
      refreshInfrastructureLoadIfVisible()
    }

    if (shouldRunTerminalRefresh) terminalRefreshRef.current.add(refreshKey)

    if (nextStatus === 'completed' || nextStatus === 'failed') {
      const auditKey = `kb:${jobId}:${nextStatus}`
      if (!terminalAuditRef.current.has(auditKey)) {
        terminalAuditRef.current.add(auditKey)
        logEvent({
          action: nextStatus === 'completed' ? 'Knowledge base job completed' : 'Knowledge base job failed',
          project: jobProjectName || 'Knowledge Base',
          entity: jobId,
          status: nextStatus === 'completed' ? 'success' : 'error',
          details: nextStatus === 'completed' ? `Job ID ${jobId}` : kbJob.state.error || `Job ID ${jobId}`,
        })
      }
    }
  }, [kbJob.state.error, kbJob.state.jobId, kbJob.state.status, knowledgeJobs, logEvent, projectName, refreshAnalytics, refreshBackendData, refreshInfrastructureLoadIfVisible, setArtifactRecords, setKnowledgeJobs, setProjects])

  useEffect(() => {
    const jobId = docJob.state.jobId
    if (!jobId || docJob.state.status === 'idle') return
    const nextStatus = normalizeGeneratedOutputStatus(docJob.state.status)
    const matchingOutput = generatedOutputs.find((item) => item.jobId === jobId || item.id === jobId)
    setGeneratedOutputs((current) => updateGeneratedOutputRecord(current, jobId, {
      status: nextStatus,
      output: docJob.state.output ?? undefined,
      url: outputUrl(docJob.state.output),
    }))
    if (nextStatus === 'completed' || nextStatus === 'failed') {
      const refreshKey = `doc:${jobId}:${nextStatus}`
      if (!terminalRefreshRef.current.has(refreshKey)) {
        terminalRefreshRef.current.add(refreshKey)
        void refreshBackendData()
        void refreshAnalytics()
        refreshInfrastructureLoadIfVisible()
      }

      const auditKey = `doc:${jobId}:${nextStatus}`
      if (!terminalAuditRef.current.has(auditKey)) {
        terminalAuditRef.current.add(auditKey)
        logEvent({
          action: nextStatus === 'completed' ? 'Document generation completed' : 'Document generation failed',
          project: matchingOutput?.projectName || generationProject.trim() || 'Document Generation',
          entity: matchingOutput?.artifactLabel || matchingOutput?.documentType || artifact || jobId,
          status: nextStatus === 'completed' ? 'success' : 'error',
          details: nextStatus === 'completed' ? `Job ID ${jobId}` : docJob.state.error || `Job ID ${jobId}`,
        })
      }
    }
  }, [artifact, docJob.state.error, docJob.state.jobId, docJob.state.output, docJob.state.status, generatedOutputs, generationProject, logEvent, refreshAnalytics, refreshBackendData, refreshInfrastructureLoadIfVisible, setGeneratedOutputs])

  useEffect(() => {
    const jobsToPoll = generatedOutputsRef.current.filter((item) => item.jobId
      && !isLegacyLocalJobId(item.jobId || item.id)
      && isActiveDocumentStatus(item.status)
      && item.jobId !== docJob.state.jobId)
    if (!jobsToPoll.length) return

    let cancelled = false
    const markJobFailed = (job: GeneratedOutput, message: string) => {
      delete documentBackgroundRetryRef.current[job.jobId || job.id]
      setGeneratedOutputs((current) => updateGeneratedOutputRecord(current, job.jobId as string, {
        status: 'failed',
        output: { ...(job.output || {}), message },
      }))
      notify({ title: 'Document generation failed', message: `${job.artifactLabel} could not be tracked for ${job.projectName}.`, type: 'error' }, 'documents')
      logEvent({ action: 'Background document generation failed', project: job.projectName, entity: job.artifactLabel, status: 'error', details: message })
    }

    const pollTrackedJobs = async () => {
      if (documentBackgroundPollInFlightRef.current) return
      documentBackgroundPollInFlightRef.current = true
      let shouldRefresh = false
      try {
        const currentJobsToPoll = generatedOutputsRef.current.filter((item) => item.jobId
          && !isLegacyLocalJobId(item.jobId || item.id)
          && isActiveDocumentStatus(item.status)
          && item.jobId !== docJob.state.jobId)
        for (const job of currentJobsToPoll) {
          if (cancelled) break
          if (!job.jobId) continue
          const data = await fetchDocStatus(job.jobId).catch(() => null)
          if (cancelled) continue
          if (!data) {
            const nextRetry = (documentBackgroundRetryRef.current[job.jobId] || 0) + 1
            documentBackgroundRetryRef.current[job.jobId] = nextRetry
            if (nextRetry >= 3) {
              shouldRefresh = true
              markJobFailed(job, `Unable to retrieve status for job ${job.jobId} after multiple retries.`)
            }
            continue
          }
          delete documentBackgroundRetryRef.current[job.jobId]
          const nextStatus = normalizeGeneratedOutputStatus(data.status)
          const nextOutput = data.output ?? data
          const nextUrl = outputUrl(nextOutput) || job.url

          if (nextStatus === 'not_found') {
            const nextRetry = (documentBackgroundRetryRef.current[job.jobId] || 0) + 1
            documentBackgroundRetryRef.current[job.jobId] = nextRetry
            if (nextRetry >= 3) {
              shouldRefresh = true
              markJobFailed(job, `Job ${job.jobId} could not be found after multiple retries.`)
            }
            continue
          }

          const changedToTerminal = job.status !== nextStatus && (nextStatus === 'completed' || nextStatus === 'failed')

          setGeneratedOutputs((current) => updateGeneratedOutputRecord(current, job.jobId as string, {
            status: nextStatus,
            output: nextOutput,
            url: nextUrl,
          }))

          if (changedToTerminal) {
            shouldRefresh = true
            if (nextStatus === 'completed') {
              notify({ title: 'Document generation completed', message: `${job.artifactLabel} is ready for ${job.projectName}.`, type: 'success' }, 'documents')
              logEvent({ action: 'Background document generation completed', project: job.projectName, entity: job.artifactLabel, status: 'success', details: `Job ID ${job.jobId}` })
            } else {
              notify({ title: 'Document generation failed', message: `${job.artifactLabel} could not be completed for ${job.projectName}.`, type: 'error' }, 'documents')
              logEvent({ action: 'Background document generation failed', project: job.projectName, entity: job.artifactLabel, status: 'error', details: `Job ID ${job.jobId}` })
            }
          }
        }

        if (shouldRefresh) {
          void refreshBackendData()
          void refreshAnalytics()
          refreshInfrastructureLoadIfVisible()
        }
      } finally {
        documentBackgroundPollInFlightRef.current = false
      }
    }

    void pollTrackedJobs()
    const interval = window.setInterval(() => {
      void pollTrackedJobs()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [backgroundDocumentPollKey, docJob.state.jobId, logEvent, notify, refreshAnalytics, refreshBackendData, refreshInfrastructureLoadIfVisible, setGeneratedOutputs])

  useEffect(() => {
    const jobsToPoll = knowledgeJobsRef.current.filter((item) => item.jobId
      && !isLegacyLocalJobId(item.jobId || item.id)
      && isActiveDocumentStatus(item.status)
      && item.jobId !== kbJob.state.jobId)
    if (!jobsToPoll.length) return

    let cancelled = false
    const markJobStatusUnavailable = (job: KnowledgeJobRecord, message: string) => {
      setKnowledgeJobs((current) => updateKnowledgeJobRecord(current, job.jobId as string, {
        status: job.status === 'queued' ? 'pending' : job.status,
        error: message,
      }))
    }

    const pollTrackedJobs = async () => {
      if (knowledgeBackgroundPollInFlightRef.current) return
      knowledgeBackgroundPollInFlightRef.current = true
      let shouldRefresh = false
      try {
        const currentJobsToPoll = knowledgeJobsRef.current.filter((item) => item.jobId
          && !isLegacyLocalJobId(item.jobId || item.id)
          && isActiveDocumentStatus(item.status)
          && item.jobId !== kbJob.state.jobId)
        for (const job of currentJobsToPoll) {
          if (cancelled) break
          if (!job.jobId) continue
          const data = await fetchKbStatus(job.jobId).catch(() => null)
          if (cancelled) continue
          if (!data) {
            const nextRetry = (knowledgeBackgroundRetryRef.current[job.jobId] || 0) + 1
            knowledgeBackgroundRetryRef.current[job.jobId] = nextRetry
            if (nextRetry >= 3) {
              markJobStatusUnavailable(job, `Unable to retrieve status for job ${job.jobId}. Continuing to poll.`)
            }
            continue
          }
          delete knowledgeBackgroundRetryRef.current[job.jobId]
          const nextStatus = normalizeKnowledgeJobStatus(data.status)

          if (nextStatus === 'not_found') {
            const nextRetry = (knowledgeBackgroundRetryRef.current[job.jobId] || 0) + 1
            knowledgeBackgroundRetryRef.current[job.jobId] = nextRetry
            if (nextRetry >= 3) {
              markJobStatusUnavailable(job, `Job ${job.jobId} is not visible yet. Continuing to poll.`)
            }
            continue
          }

          const nextError = nextStatus === 'failed'
            ? (typeof data.error === 'string' ? data.error : data.output?.message || data.output?.error || '')
            : undefined
          const changedToTerminal = job.status !== nextStatus && (nextStatus === 'completed' || nextStatus === 'failed')

          setKnowledgeJobs((current) => updateKnowledgeJobRecord(current, job.jobId as string, {
            status: nextStatus,
            error: nextError,
          }))

          if (changedToTerminal) {
            shouldRefresh = true
            if (nextStatus === 'completed') {
              const now = new Date().toISOString()
              setProjects((current) =>
                upsertProject(current, {
                  name: job.projectName,
                  status: 'ready',
                  updatedAt: now,
                }),
              )
              setArtifactRecords((current) => current.map((item) => (item.projectName === job.projectName && item.status === 'processing' ? { ...item, status: 'processed' } : item)))
              notify({ title: 'Knowledge base completed', message: `${job.projectName} is ready for document generation.`, type: 'success' }, 'knowledge')
              logEvent({ action: 'Background knowledge base completed', project: job.projectName, entity: job.jobId || 'Knowledge base', status: 'success', details: `Job ID ${job.jobId}` })
            } else {
              notify({ title: 'Knowledge base failed', message: `${job.projectName} needs attention before generation can continue.`, type: 'error' }, 'knowledge')
              logEvent({ action: 'Background knowledge base failed', project: job.projectName, entity: job.jobId || 'Knowledge base', status: 'error', details: `Job ID ${job.jobId}` })
            }
          }
        }

        if (shouldRefresh) {
          void refreshBackendData()
          void refreshAnalytics()
          refreshInfrastructureLoadIfVisible()
        }
      } finally {
        knowledgeBackgroundPollInFlightRef.current = false
      }
    }

    void pollTrackedJobs()
    const interval = window.setInterval(() => {
      void pollTrackedJobs()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [backgroundKnowledgePollKey, kbJob.state.jobId, logEvent, notify, refreshAnalytics, refreshBackendData, refreshInfrastructureLoadIfVisible, setArtifactRecords, setKnowledgeJobs, setProjects])

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

  const activeKnowledgeJobs = scopedKnowledgeJobs.filter((job) => isActiveDocumentStatus(job.status))
  const recentKnowledgeJobs = scopedKnowledgeJobs
    .filter((job) => job.status === 'failed' || isActiveDocumentStatus(job.status) || job.status === 'completed')
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
  const latestKnowledgeBatchIdSet = useMemo(() => new Set(latestKnowledgeBatchJobIds), [latestKnowledgeBatchJobIds])
  const latestDocumentBatchIdSet = useMemo(() => new Set(latestDocumentBatchJobIds), [latestDocumentBatchJobIds])
  const statusKnowledgeJobs = useMemo(() => {
    if (!latestKnowledgeBatchIdSet.size) return []
    return scopedKnowledgeJobs
      .filter((job) => job.jobId && latestKnowledgeBatchIdSet.has(job.jobId))
      .sort((left, right) => {
        const leftIndex = latestKnowledgeBatchJobIds.indexOf(left.jobId || '')
        const rightIndex = latestKnowledgeBatchJobIds.indexOf(right.jobId || '')
        return leftIndex - rightIndex
      })
  }, [latestKnowledgeBatchIdSet, latestKnowledgeBatchJobIds, scopedKnowledgeJobs])
  const activeDocumentJobs = scopedGeneratedOutputs.filter((output) => isActiveDocumentStatus(output.status))
  const recentDocumentJobs = scopedGeneratedOutputs
    .filter((output) => output.status === 'failed' || isActiveDocumentStatus(output.status) || output.status === 'completed')
    .slice(0, 20)
  const statusDocumentJobs = useMemo(() => {
    const jobId = docJob.state.jobId
    const latestJobs = latestDocumentBatchIdSet.size
      ? scopedGeneratedOutputs
        .filter((output) => output.jobId && latestDocumentBatchIdSet.has(output.jobId))
        .sort((left, right) => {
          const leftIndex = latestDocumentBatchJobIds.indexOf(left.jobId || '')
          const rightIndex = latestDocumentBatchJobIds.indexOf(right.jobId || '')
          return leftIndex - rightIndex
        })
      : []
    if (latestJobs.length) return latestJobs
    if (!jobId || docJob.state.status === 'idle') return recentDocumentJobs.slice(0, 1)
    const existing = scopedGeneratedOutputs.find((item) => item.jobId === jobId || item.id === jobId)
    if (existing) return [existing]
    return [{
      id: jobId,
      jobId,
      projectName: generationProject.trim() || 'Document Generation',
      artifactLabel: artifact ? documentTypeLabel(mapArtifactToDocumentType(artifact)) : 'Generated document',
      documentType: artifact ? mapArtifactToDocumentType(artifact) : undefined,
      createdAt: new Date().toISOString(),
      status: normalizeGeneratedOutputStatus(docJob.state.status),
      output: docJob.state.output,
    }]
  }, [artifact, docJob.state.jobId, docJob.state.output, docJob.state.status, generationProject, latestDocumentBatchIdSet, latestDocumentBatchJobIds, recentDocumentJobs, scopedGeneratedOutputs])
  const latestDocumentJob = statusDocumentJobs[0] || null
  const outputPanelStatus = docJob.state.status !== 'idle'
    ? docJob.state.status
    : latestDocumentJob?.status || 'idle'
  const outputPanelJobId = docJob.state.jobId || latestDocumentJob?.jobId || latestDocumentJob?.id || null
  const outputPanelRecord = scopedGeneratedOutputs.find((item) => item.jobId === outputPanelJobId || item.id === outputPanelJobId) || latestDocumentJob
  const outputPanelOutput = docJob.state.status !== 'idle'
    ? docJob.state.output
    : outputPanelRecord?.output
  const activeJobs = activeDocumentJobs.length + activeKnowledgeJobs.length
  const failedJobs = scopedGeneratedOutputs.filter((output) => output.status === 'failed').length + scopedKnowledgeJobs.filter((job) => job.status === 'failed').length
  const unreadCount = notificationFeed.filter((item) => !item.read).length
  const selectedFiles = [brd, frd, hld, lld].filter(Boolean).length + transcripts.length + images.length
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
    setSidebarOpen(false)
  }

  const navigateTo = (nextView: View) => {
    setView(nextView)
    setSidebarOpen(false)
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
      transcripts.forEach((file) => files.push(['Transcript', file]))
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
      const queuedJobIds: string[] = []
      const res = await uploadKnowledgeBase({ projectId: selectedProject?.id, projectName, brd, frd, hld, lld, transcripts, images }, (job) => {
        const jobId = job.jobId
        if (!jobId) return
        queuedJobIds.push(jobId)
        setLatestKnowledgeBatchJobIds([...queuedJobIds])
        setKnowledgeJobs((current) => [
          {
            id: jobId,
            jobId,
            projectId: selectedProject?.id,
            projectName: projectName.trim(),
            fileName: job.fileName,
            fileKey: job.fileKey,
            processingClass: job.processingClass,
            createdAt: new Date().toISOString(),
            status: normalizeKnowledgeJobStatus(job.status || 'queued'),
          },
          ...current.filter((item) => item.jobId !== jobId && item.id !== jobId),
        ])
      })
      kbJob.start(res)
      const queuedJobs = res.jobs?.length
        ? res.jobs
        : [{ jobId: res.jobId, status: res.status }]
      setLatestKnowledgeBatchJobIds(queuedJobs.map((job) => job.jobId))
      setKnowledgeJobs((current) => [
        ...queuedJobs.map((job) => {
          const existing = current.find((item) => item.jobId === job.jobId || item.id === job.jobId)
          return {
            id: job.jobId,
            jobId: job.jobId,
            projectId: selectedProject?.id,
            projectName: projectName.trim(),
            fileName: job.fileName || existing?.fileName,
            fileKey: job.fileKey || existing?.fileKey,
            processingClass: job.processingClass || existing?.processingClass,
            createdAt: existing?.createdAt || new Date().toISOString(),
            status: existing?.status || normalizeKnowledgeJobStatus(job.status || 'queued'),
            error: existing?.error,
          }
        }),
        ...current.filter((item) => !queuedJobs.some((job) => item.jobId === job.jobId || item.id === job.jobId)),
      ])
      refreshInfrastructureLoadIfVisible()
      const queuedCount = res.queuedCount || queuedJobs.length
      notify({ title: 'Ingestion started', message: `${queuedCount} knowledge base job${queuedCount === 1 ? '' : 's'} queued.`, type: 'info' }, 'knowledge')
      logEvent({ action: 'Knowledge base ingestion submitted', project: projectName.trim(), entity: res.jobId, status: 'info', details: `${files.length} artifacts submitted as ${queuedCount} queued job${queuedCount === 1 ? '' : 's'}.` })
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
    setTranscripts([])
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
    if (artifact === 'testCases' && !hasCompletedStoryBacklog(generationProject, scopedGeneratedOutputs)) {
      setDocError('Generate Epics & User Stories for this project before requesting Story Test Cases.')
      return
    }
    setDocSubmitting(true)
    setDocError('')
    try {
      const selectedProject = findProjectByName(visibleProjects, generationProject)
      const owner = selectedProject?.owner || settings.name || 'PO'
      const request = { projectId: selectedProject?.id, projectName: generationProject, artifact, productOwner: owner }
      const res = artifact === 'testCases'
        ? await generateStoryTestCases(request)
        : await generateDocument(request)
      docJob.start(res)
      setLatestDocumentBatchJobIds([res.jobId])
      refreshInfrastructureLoadIfVisible()
      const option = artifactOptions.find((item) => item.key === artifact)
      setGeneratedOutputs((current) => [
        {
          id: res.jobId,
          jobId: res.jobId,
          projectId: selectedProject?.id,
          projectName: generationProject.trim(),
          artifactKey: artifact,
          artifactLabel: option?.label ?? artifact,
          documentType: mapArtifactToDocumentType(artifact),
          createdAt: new Date().toISOString(),
          status: normalizeGeneratedOutputStatus(res.status || 'queued'),
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

  const retryDocumentJob = useCallback(async (job: GeneratedOutput) => {
    const artifactKey = resolveArtifactKey(job)
    if (!artifactKey) {
      notify({ title: 'Retry unavailable', message: 'This failed job does not have enough metadata to retry automatically.', type: 'error' }, 'documents')
      return
    }

    try {
      const selectedProject = findProjectByName(visibleProjects, job.projectName)
      const owner = selectedProject?.owner || settings.name || 'PO'
      const request = {
        projectId: job.projectId || selectedProject?.id,
        projectName: job.projectName,
        artifact: artifactKey,
        productOwner: owner,
        retryJobId: job.jobId || job.id,
      }
      const res = artifactKey === 'testCases'
        ? await generateStoryTestCases(request)
        : await generateDocument(request)

      docJob.start(res)
      setLatestDocumentBatchJobIds([res.jobId])
      setGenerationProject(job.projectName)
      setArtifact(artifactKey)
      setDocError('')
      refreshInfrastructureLoadIfVisible()

      const option = artifactOptions.find((item) => item.key === artifactKey)
      setGeneratedOutputs((current) =>
        updateGeneratedOutputRecord(current, job.jobId || job.id, {
          id: res.jobId,
          jobId: res.jobId,
          projectId: job.projectId || selectedProject?.id,
          projectName: job.projectName,
          artifactKey,
          artifactLabel: option?.label ?? job.artifactLabel,
          documentType: mapArtifactToDocumentType(artifactKey),
          status: normalizeGeneratedOutputStatus(res.status || 'queued'),
          output: null,
          retriedAt: new Date().toISOString(),
          retriedByJobId: undefined,
        }),
      )

      notify({ title: 'Retry queued', message: `${job.artifactLabel} was queued again for ${job.projectName}.`, type: 'info' }, 'documents')
      logEvent({ action: 'Document generation retried', project: job.projectName, entity: job.artifactLabel, status: 'info', details: `Job ${res.jobId} reset to pending` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to retry this job.'
      notify({ title: 'Retry failed', message, type: 'error' }, 'documents')
      logEvent({ action: 'Document retry failed', project: job.projectName, entity: job.artifactLabel, status: 'error', details: message })
    }
  }, [docJob, logEvent, notify, refreshInfrastructureLoadIfVisible, setLatestDocumentBatchJobIds, settings.name, visibleProjects])

  const retryKnowledgeJob = useCallback(async (job: KnowledgeJobRecord) => {
    const failedArtifacts = scopedArtifactRecords.filter((record) => {
      if (record.status !== 'failed') return false
      if (job.jobId && record.jobId) return record.jobId === job.jobId
      return record.projectName.trim().toLowerCase() === job.projectName.trim().toLowerCase()
    })

    if (!failedArtifacts.length) {
      notify({ title: 'Retry unavailable', message: 'No failed artifacts were found for this knowledge base job.', type: 'error' }, 'knowledge')
      return
    }

    const retryResponses: Array<{ artifactId: string; response: Awaited<ReturnType<typeof reprocessArtifact>> }> = []
    for (const artifact of failedArtifacts) {
      const response = await reprocessArtifact(artifact.id)
      retryResponses.push({ artifactId: artifact.id, response })
    }

    const successfulRetries = retryResponses.filter((item) => item.response?.jobId)
    if (!successfulRetries.length) {
      notify({ title: 'Retry failed', message: 'Q-Ops could not queue a reprocess request for the failed artifacts.', type: 'error' }, 'knowledge')
      return
    }

    const firstRetry = successfulRetries[0].response!
    kbJob.start(firstRetry)
    setProjectName(job.projectName)
    const retriedJobIds = successfulRetries.map((item) => item.response!.jobId)
    setLatestKnowledgeBatchJobIds(retriedJobIds)

    setKnowledgeJobs((current) => {
      return [
        ...retriedJobIds.map((retryJobId) => ({
          id: retryJobId,
          jobId: retryJobId,
          projectId: job.projectId,
          projectName: job.projectName,
          createdAt: new Date().toISOString(),
          status: normalizeKnowledgeJobStatus(firstRetry.status || 'queued'),
        })),
        ...updateKnowledgeJobRecord(current, job.jobId || job.id, {
          retriedAt: new Date().toISOString(),
          retriedByJobIds: retriedJobIds,
        }).filter((item) => !retriedJobIds.includes(item.jobId || item.id)),
      ]
    })

    setArtifactRecords((current) => current.map((record) => (
      successfulRetries.some((retry) => retry.artifactId === record.id)
        ? { ...record, status: 'processing' }
        : record
    )))

    void refreshBackendData()
    refreshInfrastructureLoadIfVisible()
    notify({ title: 'Retry queued', message: `${successfulRetries.length} artifact${successfulRetries.length === 1 ? '' : 's'} queued again for ${job.projectName}.`, type: 'info' }, 'knowledge')
    logEvent({ action: 'Knowledge base job retried', project: job.projectName, entity: job.jobId || 'Knowledge base', status: 'info', details: `Retry jobs: ${successfulRetries.map((item) => item.response!.jobId).join(', ')}` })
  }, [kbJob, logEvent, notify, refreshBackendData, refreshInfrastructureLoadIfVisible, scopedArtifactRecords, setArtifactRecords, setKnowledgeJobs, setLatestKnowledgeBatchJobIds])

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
      refreshInfrastructureLoadIfVisible()
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
      {sidebarOpen ? <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`fixed left-0 top-0 z-50 flex max-h-dvh min-h-dvh w-80 max-w-full flex-col border-r border-outline-variant bg-surface-container-lowest/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex min-h-28 shrink-0 items-center gap-4 px-5 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
            <Network className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-none text-on-surface">Q-Ops Agent</h1>
            <p className="text-xs font-medium text-on-surface-variant">A Purpose-Built AI System for QA Engineering</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container lg:hidden" aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <nav className="space-y-5">
            <section className="space-y-2">
              <div className="sticky top-0 z-10 -mx-5 border-b border-outline-variant/60 bg-surface-container-lowest/95 px-11 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant backdrop-blur-xl">
                QA Intelligence
              </div>
              <div className="space-y-2">
                <NavItem active={view === 'overview'} icon={LayoutDashboard} label="Dashboard" onClick={() => navigateTo('overview')} />
                <NavItem active={view === 'artifacts'} icon={Archive} label="Artifacts" onClick={() => navigateTo('artifacts')} />
                <NavItem active={view === 'knowledge'} icon={BookOpen} label="Create Knowledge Base" onClick={() => openWorkspace('knowledge')} />
                <NavItem active={view === 'documents'} icon={FileText} label="Generate Documents" onClick={() => openWorkspace('documents')} />
                <NavItem active={view === 'analytics'} icon={BarChart3} label="Analytics" onClick={() => navigateTo('analytics')} />
              </div>
            </section>
            <section className="space-y-2">
              <div className="sticky top-11 z-10 -mx-5 border-b border-outline-variant/60 bg-surface-container-lowest/95 px-11 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant backdrop-blur-xl">
                Delivery Intelligence
              </div>
              <div className="space-y-2">
                <NavItem active={view === 'di-overview'} icon={Brain} label="DI Overview" onClick={() => navigateTo('di-overview')} />
                <NavItem active={view === 'di-profile'} icon={Brain} label="Project Profile" onClick={() => navigateTo('di-profile')} />
                <NavItem active={view === 'di-onboarding'} icon={BookOpen} label="Onboarding" onClick={() => navigateTo('di-onboarding')} />
                <NavItem active={view === 'di-discovery'} icon={Search} label="Discovery" onClick={() => navigateTo('di-discovery')} />
                <NavItem active={view === 'di-solutions'} icon={Database} label="Solutions" onClick={() => navigateTo('di-solutions')} />
                <NavItem active={view === 'di-governance'} icon={ShieldCheck} label="Governance" onClick={() => navigateTo('di-governance')} />
                <NavItem active={view === 'di-similarity'} icon={Network} label="Similarity" onClick={() => navigateTo('di-similarity')} />
                <NavItem active={view === 'di-technologies'} icon={Network} label="Technologies" onClick={() => navigateTo('di-technologies')} />
                <NavItem active={view === 'di-recommendations'} icon={Sparkles} label="Recommendations" onClick={() => navigateTo('di-recommendations')} />
                <NavItem active={view === 'di-learnings'} icon={Lightbulb} label="Learnings" onClick={() => navigateTo('di-learnings')} />
                <NavItem active={view === 'di-relationships'} icon={SlidersHorizontal} label="Relationships" onClick={() => navigateTo('di-relationships')} />
              </div>
            </section>
          </nav>
        </div>
        <div className="mt-auto shrink-0 space-y-2 border-t border-outline-variant bg-surface-container-lowest/95 px-5 py-6 backdrop-blur-xl">
          <NavItem active={view === 'settings'} icon={Settings} label="Settings" onClick={() => navigateTo('settings')} />
          <NavItem active={view === 'docs'} icon={BookOpen} label="Documentation" onClick={() => navigateTo('docs')} />
          <NavItem active={view === 'faqs'} icon={HelpCircle} label="FAQs" onClick={() => navigateTo('faqs')} />
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col lg:ml-80">
        <header className="sticky top-0 z-40 flex min-h-16 w-full flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 shadow-sm sm:px-6 lg:min-h-20 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => setOverlay('search')} className="relative flex min-w-0 flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-left text-sm text-on-surface-variant outline-none transition-colors hover:border-primary sm:max-w-md">
            <Search className="mr-3 h-4 w-4" />
            <span>Search operations...</span>
            <kbd className="ml-auto hidden rounded border border-outline-variant px-2 py-0.5 text-xs font-bold text-on-surface-variant sm:inline">Ctrl K</kbd>
          </button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 lg:flex-none lg:gap-5">
            <button onClick={toggle} className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => setOverlay('notifications')} className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-error px-1 text-center text-xs font-bold text-on-error">{unreadCount}</span> : null}
            </button>
            <button onClick={() => setOverlay('help')} className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="hidden h-8 w-px bg-outline-variant sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-on-surface">{settings.name || 'Admin User'}</p>
                <p className="text-xs text-on-surface-variant">{settings.role || 'System Architect'}</p>
              </div>
              <img src={avatar} alt="User profile" className="h-10 w-10 rounded-full border-2 border-outline-variant object-cover" />
              <button onClick={onLogout} className="hidden rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold hover:bg-surface-container sm:inline-flex">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto w-full max-w-7xl space-y-8">
            <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl lg:text-5xl">{pageTitle}</h2>
                <p className="mt-2 text-base text-on-surface-variant">
                  {view === 'overview'
                    ? `Workspace initialized with ${activeJobs} active ${activeJobs === 1 ? 'job' : 'jobs'}, ${scopedArtifactRecords.length + selectedFiles} artifacts, and ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}. ${backendDataNotice}`
                    : sectionDescriptions[view]}
                </p>
              </div>
              {view !== 'docs' && view !== 'faqs' ? (
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setOverlay('audit')} className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
                    <History className="h-4 w-4" /> View Audit Log
                  </button>
                  {currentUser?.role === 'admin' ? (
                    <button onClick={() => setOverlay('project')} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                      <Plus className="h-4 w-4" /> New Project
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>

            {view === 'overview' ? (
              <Overview
                activeJobs={activeJobs}
                failedJobs={failedJobs}
                artifactCount={scopedArtifactRecords.length + selectedFiles}
                outputs={scopedGeneratedOutputs.length}
                readyKnowledgeBases={readyKnowledgeBases}
                recentDocumentJobs={recentDocumentJobs}
                recentKnowledgeJobs={recentKnowledgeJobs}
                currentUserRole={currentUser?.role}
                infrastructureLoad={infrastructureLoad}
                onOpenNotifications={() => setOverlay('notifications')}
                onOpenArtifacts={() => setView('artifacts')}
                onOpenDocuments={() => openWorkspace('documents')}
                onOpenKnowledge={() => openWorkspace('knowledge')}
                onOpenAnalytics={() => setView('analytics')}
                onOpenDiagnostics={() => setOverlay('diagnostics')}
              />
            ) : null}

            {view === 'knowledge' || view === 'documents' ? (
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
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
                    transcripts={transcripts}
                    setTranscripts={setTranscripts}
                    images={images}
                    setImages={setImages}
                    kbError={kbError}
                    kbSubmitting={kbSubmitting}
                    onKnowledgeSubmit={submitKnowledge}
                    onKnowledgeReset={resetKnowledge}
                    generationProject={generationProject}
                    setGenerationProject={setGenerationProject}
                    artifact={artifact}
                    setArtifact={setArtifact}
                    docError={docError}
                    docSubmitting={docSubmitting}
                    onDocumentSubmit={submitDocument}
                    onDocumentReset={resetDocument}
                    projects={visibleProjects}
                    outputs={scopedGeneratedOutputs}
                    storyTestCasesReady={hasCompletedStoryBacklog(generationProject, scopedGeneratedOutputs)}
                  />
                </div>
                <div className="space-y-6">
                  <StatusPanel kind={tab} state={tab === 'knowledge' ? kbJob.state : docJob.state} jobs={tab === 'knowledge' ? statusKnowledgeJobs : statusDocumentJobs} />
                  {tab === 'knowledge' ? (
                    <KnowledgeJobsPanel jobs={recentKnowledgeJobs} onRetry={retryKnowledgeJob} />
                  ) : null}
                  {tab === 'documents' ? (
                    <>
                      <OutputPanel
                        output={outputPanelOutput}
                        status={outputPanelStatus}
                        jobId={outputPanelJobId}
                        jobRecord={outputPanelRecord}
                        onRetry={retryDocumentJob}
                      />
                      <DocumentJobsPanel jobs={recentDocumentJobs} onRetry={retryDocumentJob} />
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {view === 'artifacts' ? <ArtifactsRepository records={scopedArtifactRecords} onUpload={() => openWorkspace('knowledge')} onReprocess={(id) => void reprocessArtifact(id).then((res) => {
              if (res) {
                const artifactRecord = scopedArtifactRecords.find((item) => item.id === id)
                kbJob.start(res)
                setLatestKnowledgeBatchJobIds([res.jobId])
                setKnowledgeJobs((current) => [
                  {
                    id: res.jobId,
                    jobId: res.jobId,
                    projectName: artifactRecord?.projectName || 'Knowledge Base',
                    createdAt: new Date().toISOString(),
                    status: normalizeKnowledgeJobStatus(res.status || 'queued'),
                  },
                  ...current.filter((item) => item.jobId !== res.jobId && item.id !== res.jobId),
                ])
                void refreshBackendData()
                notify({ title: 'Reprocess queued', message: 'Artifact reprocessing started.', type: 'info' }, 'knowledge')
              }
            })} /> : null}
            {view === 'analytics' ? <AnalyticsPage analytics={analytics} loading={analyticsLoading} error={analyticsError} pipeline={analyticsPipeline} days={analyticsDays} setPipeline={setAnalyticsPipeline} setDays={setAnalyticsDays} onRefresh={refreshAnalytics} projects={visibleProjects} artifacts={scopedArtifactRecords} outputs={scopedGeneratedOutputs} activeJobs={activeJobs} failedJobs={failedJobs} /> : null}
            {isDeliveryIntelligenceView(view) ? (
              <DeliveryIntelligencePage
                activeView={view}
                projects={visibleProjects}
                currentUser={currentUser}
                addToast={addToast}
                onNavigate={(nextView) => setView(nextView)}
              />
            ) : null}
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
            {view === 'faqs' ? <FaqPage /> : null}
          </div>
        </div>
      </main>

      {overlay === 'search' ? <SearchPalette projects={visibleProjects} artifacts={scopedArtifactRecords} outputs={scopedGeneratedOutputs} jobs={[...activeKnowledgeJobs.map((job) => ({ status: job.status as JobStatus, jobId: job.jobId || null })), ...activeDocumentJobs.map((job) => ({ status: job.status as JobStatus, jobId: job.jobId || null }))]} onClose={() => setOverlay(null)} setView={setView} onHelp={() => setOverlay('help')} /> : null}
      {overlay === 'notifications' ? <NotificationDrawer notifications={notificationFeed} setNotifications={setNotifications} setReadNotificationIds={setReadNotificationIds} onClose={() => setOverlay(null)} setView={setView} /> : null}
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
  faqs: 'FAQs',
  'di-overview': 'Delivery Intelligence',
  'di-profile': 'Project Profile',
  'di-onboarding': 'Onboarding Guide',
  'di-discovery': 'Cross-Project Discovery',
  'di-solutions': 'Solution Marketplace',
  'di-governance': 'Solution Governance',
  'di-similarity': 'Similarity Explorer',
  'di-technologies': 'Technology Intelligence',
  'di-recommendations': 'AI Recommendations',
  'di-learnings': 'Organizational Learnings',
  'di-relationships': 'Relationship Explorer',
}

const sectionDescriptions: Record<View, string> = {
  overview: '',
  knowledge: 'Create, update, and review knowledge bases for QA intelligence.',
  documents: 'Generate QA deliverables and review recent generated outputs.',
  artifacts: 'Review uploaded files, track processing outcomes, and retry failed artifacts.',
  analytics: 'Monitor QA operations metrics from n8n analytics, with local fallback while endpoints come online.',
  settings: 'Configure profile, n8n endpoints, integrations, notifications, and security defaults.',
  docs: 'Learn the Q-Ops workflow, artifact types, backend setup, and troubleshooting steps.',
  faqs: 'Review client and investor-ready answers around AI security, cost, data storage, IP protection, usage, and scalability.',
  'di-overview': 'Run project-scoped Delivery Intelligence extraction and review reusable SDLC insights.',
  'di-profile': 'Read the synthesized project profile built from internal delivery and QA signals.',
  'di-onboarding': 'Use the generated onboarding guide to accelerate internal project ramp-up.',
  'di-discovery': 'Search governed reusable solutions, technologies, recommendations, and learnings.',
  'di-solutions': 'Review reusable engineering and QA solution candidates from Delivery Intelligence.',
  'di-governance': 'Promote reusable solution candidates through review, publish, and archive actions.',
  'di-similarity': 'Compare the selected project against similar internal delivery profiles.',
  'di-technologies': 'Explore technologies detected across assigned project intelligence.',
  'di-recommendations': 'Review and action AI recommendations with audited feedback.',
  'di-learnings': 'Preserve delivery, QA, operational, and architecture learnings.',
  'di-relationships': 'Browse relationships between Delivery Intelligence entities.',
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

function Overview(props: {
  activeJobs: number
  failedJobs: number
  artifactCount: number
  outputs: number
  readyKnowledgeBases: number
  recentDocumentJobs: GeneratedOutput[]
  recentKnowledgeJobs: KnowledgeJobRecord[]
  currentUserRole?: CurrentUser['role']
  infrastructureLoad: InfrastructureLoad | null
  onOpenNotifications: () => void
  onOpenArtifacts: () => void
  onOpenDocuments: () => void
  onOpenKnowledge: () => void
  onOpenAnalytics: () => void
  onOpenDiagnostics: () => void
}) {
  const completedKnowledgeJobs = props.recentKnowledgeJobs.filter((job) => job.status === 'completed').length
  const completedWork = props.outputs + completedKnowledgeJobs
  const successRate = completedWork + props.failedJobs ? Math.round((completedWork / (completedWork + props.failedJobs)) * 100) : 100
  const cards = [
    { label: 'Active jobs', value: props.activeJobs, detail: props.failedJobs ? `${props.failedJobs} need review` : 'Queue is clear', detailTone: props.failedJobs ? 'warning' : 'success', icon: Clock, onClick: props.onOpenNotifications },
    { label: 'Artifacts', value: props.artifactCount, detail: 'Available in workspace', detailTone: 'neutral', icon: Archive, onClick: props.onOpenArtifacts },
    { label: 'Generated outputs', value: props.outputs, detail: 'Documents and Jira results', detailTone: 'neutral', icon: FileText, onClick: props.onOpenDocuments },
    { label: 'Knowledge bases ready', value: props.readyKnowledgeBases, detail: 'Ready for generation', detailTone: 'success', icon: Database, onClick: props.onOpenArtifacts },
  ]
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const detailClass = card.detailTone === 'warning'
            ? 'border-warning/30 bg-warning/10 text-warning'
            : card.detailTone === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-outline-variant bg-surface-container text-on-surface-variant'
          return (
            <button key={card.label} onClick={card.onClick} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left shadow-sm transition hover:border-primary">
              <div className="mb-4 flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-xs font-bold uppercase text-success">Live</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{card.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{card.label}</p>
              <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${detailClass}`}>{card.detail}</span>
            </button>
          )
        })}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Workspace launchpad</p>
              <h3 className="mt-2 text-2xl font-semibold text-on-surface">Use Dashboard to monitor, then jump into the right workflow</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                Ingestion and document generation now live in their dedicated screens. This dashboard is focused on status, recent activity, and the fastest next action.
              </p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              <OverviewActionCard
                icon={UploadCloud}
                eyebrow="Ingestion"
                title="Knowledge Base"
                description="Upload BRD, FRD, HLD, LLD, transcripts, and images to build retrieval-ready project context."
                primaryMetric={{ label: 'Ready projects', value: String(props.readyKnowledgeBases) }}
                secondaryMetric={{ label: 'Files processed', value: String(props.artifactCount) }}
                actionLabel="Create Knowledge Base"
                onAction={props.onOpenKnowledge}
              />
              <OverviewActionCard
                icon={FileText}
                eyebrow="Generation"
                title="Generate Documents"
                description="Create test strategy, test plan, risk matrix, test cases, traceability, and Jira backlog outputs."
                primaryMetric={{ label: 'Documents generated', value: String(props.outputs) }}
                secondaryMetric={{ label: 'Generation jobs', value: String(props.recentDocumentJobs.length) }}
                actionLabel="Generate Documents"
                onAction={props.onOpenDocuments}
              />
              <OverviewActionCard
                icon={Archive}
                eyebrow="Repository"
                title="Artifacts"
                description="Review uploads, reprocess failed files, and verify project coverage without reopening ingestion forms."
                primaryMetric={{ label: 'Total artifacts', value: String(props.artifactCount) }}
                secondaryMetric={{ label: 'Needs review', value: String(props.failedJobs) }}
                actionLabel="Open Artifacts"
                onAction={props.onOpenArtifacts}
              />
              <OverviewActionCard
                icon={BarChart3}
                eyebrow="Insights"
                title="Analytics"
                description="See trends, costs, throughput, ingestion volumes, and job health in one reporting view."
                primaryMetric={{ label: 'Active jobs', value: String(props.activeJobs) }}
                secondaryMetric={{ label: 'Success rate', value: `${successRate}%` }}
                actionLabel="Open Analytics"
                onAction={props.onOpenAnalytics}
              />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <OverviewJobsCard
              title="Recent generation activity"
              subtitle="The latest document-generation requests, retries, and completions."
              jobs={props.recentDocumentJobs.slice(0, 4).map((job) => ({
                id: job.jobId || job.id,
                name: job.artifactLabel,
                context: job.projectName,
                status: job.status,
                timestamp: job.createdAt,
              }))}
              emptyText="No document-generation activity yet."
              actionLabel="Generate Documents"
              onAction={props.onOpenDocuments}
            />
            <OverviewJobsCard
              title="Recent ingestion activity"
              subtitle="The latest knowledge-base requests and project readiness progress."
              jobs={props.recentKnowledgeJobs.slice(0, 4).map((job) => ({
                id: job.jobId || job.id,
                name: 'Knowledge base ingestion',
                context: job.projectName,
                status: job.status,
                timestamp: job.createdAt,
              }))}
              emptyText="No knowledge-base ingestion activity yet."
              actionLabel="Create Knowledge Base"
              onAction={props.onOpenKnowledge}
            />
          </div>
        </div>

        <div className="space-y-6">
          <PlatformLoadCard infrastructureLoad={props.infrastructureLoad} activeJobs={props.activeJobs} failedJobs={props.failedJobs} userRole={props.currentUserRole} onClick={props.onOpenDiagnostics} />
          <OverviewNextActions
            readyKnowledgeBases={props.readyKnowledgeBases}
            activeJobs={props.activeJobs}
            failedJobs={props.failedJobs}
            onOpenKnowledge={props.onOpenKnowledge}
            onOpenDocuments={props.onOpenDocuments}
            onOpenArtifacts={props.onOpenArtifacts}
            onOpenAnalytics={props.onOpenAnalytics}
          />
        </div>
      </div>
    </div>
  )
}

function OverviewActionCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  primaryMetric,
  secondaryMetric,
  actionLabel,
  onAction,
}: {
  icon: typeof UploadCloud
  eyebrow: string
  title: string
  description: string
  primaryMetric: { label: string; value: string }
  secondaryMetric: { label: string; value: string }
  actionLabel: string
  onAction: () => void
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">{title}</h4>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-container-lowest p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{primaryMetric.label}</p>
          <p className="mt-2 text-xl font-semibold text-on-surface">{primaryMetric.value}</p>
        </div>
        <div className="rounded-lg bg-surface-container-lowest p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{secondaryMetric.label}</p>
          <p className="mt-2 text-xl font-semibold text-on-surface">{secondaryMetric.value}</p>
        </div>
      </div>
      <button onClick={onAction} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
        <ArrowRight className="h-4 w-4" /> {actionLabel}
      </button>
    </section>
  )
}

function OverviewJobsCard({
  title,
  subtitle,
  jobs,
  emptyText,
  actionLabel,
  onAction,
}: {
  title: string
  subtitle: string
  jobs: Array<{ id: string; name: string; context: string; status: string; timestamp: string }>
  emptyText: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant p-5">
        <h4 className="text-lg font-semibold text-on-surface">{title}</h4>
        <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {jobs.length ? (
        <div className="divide-y divide-outline-variant">
          {jobs.map((job) => (
            <div key={job.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface">{job.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{job.context}</p>
                </div>
                <StatusBadge status={analyticsJobStatusTone(job.status)} label={job.status.replace(/_/g, ' ')} />
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">Job ID: {job.id}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{formatTime(job.timestamp)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-5 text-sm text-on-surface-variant">{emptyText}</p>
      )}
      <div className="border-t border-outline-variant p-5">
        <button onClick={onAction} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
          {actionLabel}
        </button>
      </div>
    </section>
  )
}

function OverviewNextActions({
  readyKnowledgeBases,
  activeJobs,
  failedJobs,
  onOpenKnowledge,
  onOpenDocuments,
  onOpenArtifacts,
  onOpenAnalytics,
}: {
  readyKnowledgeBases: number
  activeJobs: number
  failedJobs: number
  onOpenKnowledge: () => void
  onOpenDocuments: () => void
  onOpenArtifacts: () => void
  onOpenAnalytics: () => void
}) {
  const actions = [
    {
      title: readyKnowledgeBases ? 'Generate QA deliverables' : 'Build a knowledge base first',
      detail: readyKnowledgeBases ? `${readyKnowledgeBases} project${readyKnowledgeBases === 1 ? '' : 's'} are ready for document generation.` : 'No retrieval-ready project exists yet. Start with ingestion so document generation has source context.',
      actionLabel: readyKnowledgeBases ? 'Generate Documents' : 'Create Knowledge Base',
      onAction: readyKnowledgeBases ? onOpenDocuments : onOpenKnowledge,
    },
    {
      title: failedJobs ? 'Review failed work' : 'Repository looks healthy',
      detail: failedJobs ? `${failedJobs} failed job${failedJobs === 1 ? '' : 's'} should be reviewed or retried.` : 'No failed jobs are waiting for attention right now.',
      actionLabel: failedJobs ? 'Open Artifacts' : 'Open Analytics',
      onAction: failedJobs ? onOpenArtifacts : onOpenAnalytics,
    },
    {
      title: activeJobs ? 'Monitor in-flight jobs' : 'No active jobs running',
      detail: activeJobs ? `${activeJobs} job${activeJobs === 1 ? '' : 's'} currently in progress. Keep an eye on trends and status.` : 'Use analytics to review historical throughput, costs, and reliability.',
      actionLabel: 'Open Analytics',
      onAction: onOpenAnalytics,
    },
  ]

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant p-5">
        <h4 className="text-lg font-semibold text-on-surface">Recommended next actions</h4>
        <p className="mt-1 text-sm text-on-surface-variant">A cleaner dashboard means the next step should always be obvious.</p>
      </div>
      <div className="space-y-4 p-5">
        {actions.map((action) => (
          <div key={action.title} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <p className="font-semibold text-on-surface">{action.title}</p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{action.detail}</p>
            <button onClick={action.onAction} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold hover:bg-surface-container-lowest">
              {action.actionLabel}
            </button>
          </div>
        ))}
      </div>
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
  transcripts: File[]
  setTranscripts: (files: File[]) => void
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
  storyTestCasesReady: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">QA Intelligence workspace</p>
            <h3 className="mt-2 text-2xl font-semibold text-on-surface">{props.tab === 'knowledge' ? 'Knowledge Base' : 'Document Generation'}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
              {props.tab === 'knowledge'
                ? 'Collect project artifacts, organize them into a retrieval-ready knowledge base, and monitor ingestion confidence from one place.'
                : 'Select a retrieval-ready project, choose the deliverable, and create polished QA outputs with clear visibility into recent results.'}
            </p>
          </div>
          <StatusBadge status="info" label={props.tab === 'knowledge' ? 'Ingestion workflow' : 'Generation workflow'} />
        </div>
      </div>
      <div className="grid grid-cols-1 items-center border-b border-outline-variant bg-surface-container-low sm:grid-cols-3">
        <button aria-pressed={props.tab === 'knowledge'} onClick={() => props.setTab('knowledge')} className={`px-6 py-4 text-base transition ${props.tab === 'knowledge' ? 'border-b-2 border-primary font-bold text-primary' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}>1. Knowledge Base</button>
        <button aria-pressed={props.tab === 'documents'} onClick={() => props.setTab('documents')} className={`px-6 py-4 text-base transition ${props.tab === 'documents' ? 'border-b-2 border-primary font-bold text-primary' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}>2. Generate Documents</button>
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
            transcripts={props.transcripts}
            setTranscripts={props.setTranscripts}
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
            storyTestCasesReady={props.storyTestCasesReady}
          />
        </div>
      )}
    </div>
  )
}

function KnowledgeBaseSummary({ projects }: { projects: Project[] }) {
  const ready = projects.filter((project) => project.status === 'ready').length
  const draft = projects.filter((project) => project.status === 'draft' || project.status === 'ingesting').length
  const blocked = projects.filter((project) => project.status === 'blocked').length
  return (
    <section className="border-b border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-on-surface">Existing knowledge bases</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Use assigned projects below to see which ones are already retrieval-ready and which ones still need source artifacts.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{projects.length} assigned projects</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoMetricCard label="Ready for generation" value={String(ready)} detail="Projects with retrieval-ready context" />
        <InfoMetricCard label="Draft or ingesting" value={String(draft)} detail="Projects still being prepared" />
        <InfoMetricCard label="Needs attention" value={String(blocked)} detail="Projects blocked or requiring review" />
      </div>
      {projects.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.slice(0, 4).map((project) => (
            <div key={project.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-on-surface">{project.name}</p>
                <StatusBadge status={project.status === 'blocked' ? 'error' : project.status === 'ready' ? 'success' : 'info'} label={project.status} />
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">{project.module || 'No module set'} {project.release ? `| ${project.release}` : ''}</p>
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
  transcripts: File[]
  setTranscripts: (files: File[]) => void
  images: File[]
  setImages: (files: File[]) => void
  error: string
  submitting: boolean
  onSubmit: (event: FormEvent) => void
  onReset: () => void
}) {
  const selectedFileCount = [props.brd, props.frd, props.hld, props.lld].filter(Boolean).length + props.transcripts.length + props.images.length
  return (
    <form className="space-y-8 p-8" onSubmit={props.onSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <ScreenIntroCard
          eyebrow="Ingestion flow"
          title="Prepare project context for retrieval"
          description="Choose a project, attach the source artifacts that matter most, and Q-Ops will build a knowledge base that later powers document generation."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoMetricCard label="Assigned projects" value={String(props.projects.length)} detail="Available for ingestion" />
          <InfoMetricCard label="Selected files" value={String(selectedFileCount)} detail="Current upload set" />
        </div>
      </div>
      <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <LabeledInput label="Project name" helper="Select the project that should own these uploaded artifacts.">
          <ProjectSelect value={props.projectName} onChange={props.setProjectName} projects={props.projects} disabled={props.submitting} />
        </LabeledInput>
      </section>
      <FieldGroup title="Business documents" description="Start with the primary requirements artifacts that explain business intent and scope.">
        <FileDrop label="BRD document" accept=".pdf,.doc,.docx" file={props.brd} helper="Business requirements document" onFiles={(files) => props.setBrd(files[0] ?? null)} />
        <FileDrop label="FRD document" accept=".pdf,.doc,.docx" file={props.frd} helper="Functional requirements document" onFiles={(files) => props.setFrd(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Technical documents" description="Add architecture and design-level documentation to improve traceability and solution depth.">
        <FileDrop label="HLD document" accept=".pdf,.doc,.docx" file={props.hld} helper="High-level design" onFiles={(files) => props.setHld(files[0] ?? null)} />
        <FileDrop label="LLD document" accept=".pdf,.doc,.docx" file={props.lld} helper="Low-level design" onFiles={(files) => props.setLld(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Supporting assets" description="Supplement text documents with transcripts and UI designs so retrieval can use both textual and visual context.">
        <FileDrop
          label="Transcript files"
          accept=".txt"
          files={props.transcripts}
          multiple
          helper="Upload one or more meeting notes or transcript files."
          onFiles={props.setTranscripts}
        />
        <FileDrop label="UI designs" accept=".jpg,.png" files={props.images} multiple helper="Upload one or more design images, screenshots, or annotated mockups." onFiles={props.setImages} />
      </FieldGroup>
      {props.error ? <FriendlyInlineNotice title="Knowledge base request could not be started" message={props.error} /> : null}
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
  storyTestCasesReady: boolean
}) {
  return (
    <form className="space-y-8 p-8" onSubmit={props.onSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <ScreenIntroCard
          eyebrow="Generation flow"
          title="Create QA deliverables from a retrieval-ready project"
          description="Pick the project, choose the artifact type, and Q-Ops will generate the deliverable using the underlying knowledge base and workflow routing."
        />
        <div className="grid gap-3">
          <InfoMetricCard label="Available projects" value={String(props.projects.length)} detail="Ready or assigned projects" />
        </div>
      </div>
      <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <LabeledInput label="Project name" helper="Choose the project whose knowledge base should be used for retrieval.">
          <ProjectSelect value={props.projectName} onChange={props.setProjectName} projects={props.projects} disabled={props.submitting} />
        </LabeledInput>
      </section>
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <div className="mb-4">
          <p className="text-sm font-bold text-on-surface">Select deliverable</p>
          <p className="mt-1 text-sm text-on-surface-variant">Choose the artifact Q-Ops should create from the selected project context.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {artifactOptions.map((item) => {
            const selected = props.artifact === item.key
            const isDisabled = item.key === 'testCases' && !props.storyTestCasesReady
            const lockedReason = 'Generate Epics & User Stories first for this project before creating Story Test Cases.'
            const select = () => {
              if (isDisabled) return
              props.setArtifact(item.key)
            }
            const onKeyDown = (event: KeyboardEvent<HTMLLabelElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                select()
              }
            }
            return (
              <label
                key={item.key}
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={onKeyDown}
                title={isDisabled ? lockedReason : undefined}
                aria-label={isDisabled ? `${item.label}. Locked. ${lockedReason}` : item.label}
                className={`rounded-xl border p-5 text-left outline-none transition ${isDisabled ? 'cursor-not-allowed border-outline-variant bg-surface-container opacity-60' : selected ? 'cursor-pointer border-primary bg-primary/10 ring-2 ring-primary/10' : 'cursor-pointer border-outline-variant bg-surface-container-lowest hover:border-primary'}`}
              >
                <input className="sr-only" type="radio" name="artifact" checked={selected} onChange={select} disabled={isDisabled} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-on-surface">{item.label}</span>
                    <span className="mt-1 block text-xs text-on-surface-variant">{item.description}</span>
                  </div>
                  {selected ? <StatusBadge status="info" label="Selected" /> : isDisabled ? <StatusBadge status="warning" label="Locked" /> : null}
                </div>
              </label>
            )
          })}
        </div>
      </div>
      {props.error ? <FriendlyInlineNotice title="Document generation could not be started" message={props.error} /> : null}
      <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-bold hover:bg-surface-container">Reset</button>
        <button disabled={props.submitting || !props.projectName.trim() || !props.projects.length} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          {props.submitting ? 'Generating documents...' : 'Generate Documents'}
        </button>
      </div>
    </form>
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

function FieldGroup({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</h4>
      {description ? <p className="mt-2 text-sm text-on-surface-variant">{description}</p> : null}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
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
      <p className="mt-3 text-xs text-on-surface-variant">Drag and drop here or click to browse.</p>
    </label>
  )
}

function ScreenIntroCard({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h4 className="mt-2 text-xl font-semibold text-on-surface">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{description}</p>
    </section>
  )
}

function InfoMetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-on-surface">{value}</p>
      <p className="mt-2 text-xs text-on-surface-variant">{detail}</p>
    </div>
  )
}

function FriendlyInlineNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-error/20 bg-error-container/60 p-4 text-on-error-container">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  )
}

type FailureDisplay = {
  title: string
  summary: string
  action: string
  code: string
  technicalDetail: string
  failedAt?: string
}

type JobDisplay = FailureDisplay & {
  tone: StatusTone
}

function cleanFailureText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function collectFailureMessages(value: unknown, depth = 0, seen = new Set<unknown>()): string[] {
  if (value === null || value === undefined || depth > 5) return []
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (typeof value !== 'object') return []
  if (seen.has(value)) return []
  seen.add(value)

  const record = value as Record<string, unknown>
  const messages = ['message', 'error', 'errorMessage', 'errorDescription', 'description']
    .map((key) => cleanFailureText(record[key]))
    .filter(Boolean)

  Object.values(record).forEach((nested) => {
    messages.push(...collectFailureMessages(nested, depth + 1, seen))
  })

  return [...new Set(messages)].filter((message) => message && message !== '[object Object]')
}

function friendlyFailureCode(code?: string) {
  const normalized = String(code || '').trim()
  if (!normalized) return 'Generation validation'
  if (normalized === 'PROFESSIONAL_BACKLOG_FAILED') return 'EPICS & STORIES GENERATION FAILED'
  if (normalized === 'GENERATOR_AGENT_FAILED') return 'AI generation service'
  if (normalized === 'GENERATION_FAILED') return 'Document generation'
  return normalized.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function getFailureDisplay(kind: WorkspaceTab, state: { error?: string; output?: any; jobId?: string | null }): FailureDisplay {
  const output = state.output || {}
  const errorType = output.errorType || output.error?.errorType || ''
  const messages = [
    state.error,
    ...collectFailureMessages(output),
  ].map(cleanFailureText).filter(Boolean)
  const combined = messages.join(' | ')
  const technicalDetail = combined || 'No detailed backend error was returned.'
  const isParserFailure = /Backlog parser|model JSON|parse model JSON|incomplete|truncated|Expected .*JSON/i.test(combined)
  const isBacklogFailure = errorType === 'PROFESSIONAL_BACKLOG_FAILED' || /professional backlog/i.test(combined)
  const isKnowledge = kind === 'knowledge'

  if (isKnowledge) {
    return {
      title: 'Knowledge base creation could not be completed',
      summary: 'The ingestion job stopped before the knowledge base was fully updated.',
      action: 'Please review the uploaded files and retry. If this repeats, ask an admin to check the ingestion workflow logs.',
      code: friendlyFailureCode(errorType || 'INGESTION_FAILED'),
      technicalDetail,
      failedAt: output.failed_at,
    }
  }

  if (isParserFailure) {
    return {
      title: 'Generation stopped before publishing',
      summary: 'The AI response could not be safely converted into Jira-ready epics and stories. The job was stopped before publishing incomplete work.',
      action: 'Please retry generation. If it happens again, reduce retrieval volume or ask an admin to review the workflow prompt and token settings.',
      code: friendlyFailureCode(errorType || 'GENERATION_VALIDATION_FAILED'),
      technicalDetail,
      failedAt: output.failed_at,
    }
  }

  if (isBacklogFailure) {
    return {
      title: 'Backlog generation could not be completed',
      summary: 'The system could not finish preparing the Jira backlog for this run. The job has been marked failed so it can be retried safely.',
      action: 'Please retry generation after the source knowledge base issue is corrected. If the issue repeats, open Error Details and share them with an admin.',
      code: friendlyFailureCode(errorType),
      technicalDetail,
      failedAt: output.failed_at,
    }
  }

  return {
    title: 'Document generation could not be completed',
    summary: 'The backend could not finish this document generation request.',
    action: 'Please retry the job. If the issue repeats, ask an admin to review the workflow execution.',
    code: friendlyFailureCode(errorType || 'GENERATION_FAILED'),
    technicalDetail,
    failedAt: output.failed_at,
  }
}

function getJobDisplay(kind: WorkspaceTab, state: { status: JobStatus; error?: string; output?: any; jobId?: string | null }): JobDisplay {
  if (state.status === 'failed') {
    return {
      ...getFailureDisplay(kind, state),
      tone: 'error',
    }
  }

  const isKnowledge = kind === 'knowledge'

  if (state.status === 'queued' || state.status === 'pending' || state.status === 'not_found') {
    return {
      title: isKnowledge ? 'Knowledge base request is queued' : 'Generation request is queued',
      summary: isKnowledge
        ? 'Your artifacts have been submitted and are waiting for the ingestion worker to pick them up.'
        : 'Your document request has been submitted and is waiting for the generation worker to pick it up.',
      action: 'You can keep working in Q-Ops while this runs. The status card will refresh automatically.',
      code: state.status === 'not_found' ? 'Waiting for backend tracking' : 'Waiting in queue',
      technicalDetail: '',
      tone: 'info',
    }
  }

  if (state.status === 'processing') {
    return {
      title: isKnowledge ? 'Knowledge base creation is in progress' : 'Document generation is in progress',
      summary: isKnowledge
        ? 'Q-Ops is extracting content, preparing chunks, and updating the vector knowledge base for this project.'
        : 'Q-Ops is retrieving project context and preparing the requested QA deliverable.',
      action: isKnowledge
        ? 'Please wait for completion before generating documents from this project.'
        : 'Please wait for completion. Jira or Confluence links will appear here when the job finishes.',
      code: 'Processing',
      technicalDetail: '',
      tone: 'info',
    }
  }

  if (state.status === 'completed') {
    return {
      title: isKnowledge ? 'Knowledge base is ready' : 'Generation completed successfully',
      summary: isKnowledge
        ? 'The project artifacts were processed successfully and are available for retrieval.'
        : 'The requested QA output has been generated successfully.',
      action: isKnowledge
        ? 'You can now move to Generate Documents and create QA deliverables from this project.'
        : 'Review the generated output below and open the Jira or Confluence link if available.',
      code: 'Completed',
      technicalDetail: '',
      tone: 'success',
    }
  }

  return {
    title: isKnowledge ? 'Knowledge base job is being tracked' : 'Document job is being tracked',
    summary: 'Q-Ops is waiting for the backend to return the latest job state.',
    action: 'The status will refresh automatically.',
    code: 'Tracking',
    technicalDetail: '',
    tone: 'info',
  }
}

function splitTechnicalDetail(detail: string) {
  return [...new Set(String(detail || '')
    .split(/\s+\|\s+/)
    .map((part) => part.trim())
    .filter(Boolean))]
}

function TechnicalDetailsPanel({ failure, jobId }: { failure: FailureDisplay; jobId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const messages = splitTechnicalDetail(failure.technicalDetail)
  const primaryMessage = messages[0] || 'No detailed backend error was returned.'
  const additionalMessages = messages.slice(1, 5)

  return (
    <details className="mt-4 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low" onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-error">
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-error" />
          Error Details
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-error/20 bg-error-container/40 text-error hover:bg-error-container/70" aria-label={isOpen ? 'Collapse error details' : 'Expand error details'} title={isOpen ? 'Collapse' : 'Expand'}>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </summary>
      <div className="border-t border-outline-variant p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-lowest p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Job ID</p>
            <p className="mt-1 break-all font-mono text-xs font-semibold text-on-surface">{jobId || 'Not available'}</p>
          </div>
          <div className="rounded-lg bg-surface-container-lowest p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Failed at</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">{failure.failedAt ? formatTime(failure.failedAt) : 'Not available'}</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-surface-container-lowest p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Backend message</p>
          <p className="mt-2 break-words text-sm leading-6 text-on-surface">{primaryMessage}</p>
          {additionalMessages.length ? (
            <ul className="mt-3 space-y-2 border-t border-outline-variant pt-3 text-xs leading-5 text-on-surface-variant">
              {additionalMessages.map((message) => <li key={message} className="break-words">{message}</li>)}
            </ul>
          ) : null}
        </div>
      </div>
    </details>
  )
}

function statusDisplayClasses(tone: StatusTone) {
  if (tone === 'success') return 'border-success/20 bg-success-container/60 text-on-success-container'
  if (tone === 'error') return 'border-error/20 bg-error-container/60 text-on-error-container'
  if (tone === 'warning') return 'border-warning/20 bg-warning-container/60 text-on-warning-container'
  return 'border-primary/20 bg-primary/10 text-on-surface'
}

function statusDisplayIcon(tone: StatusTone, status: JobStatus) {
  if (tone === 'success') return CheckCircle2
  if (tone === 'error') return AlertTriangle
  if (status === 'processing') return RefreshCw
  return Clock
}

function StatusPanel({ kind, state, jobs = [] }: { kind: WorkspaceTab; state: { status: JobStatus; jobId: string | null; error: string; output?: any }; jobs?: Array<KnowledgeJobRecord | GeneratedOutput> }) {
  const batchJobs = jobs
  if (batchJobs.length) {
    const activeCount = batchJobs.filter((job) => isActiveDocumentStatus(job.status)).length
    const completedCount = batchJobs.filter((job) => job.status === 'completed').length
    const failedCount = batchJobs.filter((job) => job.status === 'failed').length
    const totalCount = batchJobs.length
    const pct = totalCount ? Math.round(((completedCount + failedCount) / totalCount) * 100) : 0
    const jobKindLabel = kind === 'knowledge' ? 'ingestion' : 'generation'
    return (
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-5">
          <div>
            <h3 className="text-xl font-semibold">Job Status</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{completedCount} completed, {failedCount} failed, {activeCount} active</p>
          </div>
          <RefreshCw className={activeCount ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-on-surface">{totalCount} {jobKindLabel} job{totalCount === 1 ? '' : 's'}</p>
            <p className="text-xs font-semibold text-primary">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className={`h-full rounded-full ${failedCount ? 'bg-warning' : completedCount === totalCount ? 'bg-success' : 'bg-primary'} ${activeCount ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {batchJobs.map((job) => {
              const tone: StatusTone = job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info'
              const jobLabel = job.jobId || job.id
              const fileLabel = kind === 'knowledge'
                ? ('fileName' in job ? job.fileName : '') || ('fileKey' in job ? job.fileKey : '') || 'Knowledge artifact'
                : ('artifactLabel' in job ? job.artifactLabel : '') || documentTypeLabel('documentType' in job ? job.documentType : undefined)
              const detailLabel = kind === 'knowledge'
                ? `${('processingClass' in job ? job.processingClass : '') || formatArtifactType('fileKey' in job ? job.fileKey : undefined)} ingestion`
                : `${job.projectName || 'Selected project'} generation`
              return (
                <div key={job.jobId || job.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-sm font-bold text-on-surface" title={jobLabel}>{jobLabel}</p>
                      <p className="mt-1 truncate text-xs text-on-surface-variant" title={fileLabel}>{fileLabel}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{detailLabel}</p>
                    </div>
                    <StatusBadge status={tone} label={job.status.replace('_', ' ')} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                    <span>Started: {formatTime(job.createdAt)}</span>
                  </div>
                  {'error' in job && job.error ? <p className="mt-2 text-xs leading-5 text-error">{job.error}</p> : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

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
  const display = getJobDisplay(kind, state)
  const StatusIcon = statusDisplayIcon(display.tone, state.status)
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
        <p className="text-sm text-on-surface-variant">{display.summary}</p>
        <div className={`rounded-lg border p-4 ${statusDisplayClasses(display.tone)}`}>
          <div className="flex gap-3">
            <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${state.status === 'processing' ? 'animate-spin' : ''}`} />
            <div className="space-y-2">
              <p className="text-sm font-bold">{display.title}</p>
              <p className="text-xs leading-5">{display.action}</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">{display.code}</p>
            </div>
          </div>
        </div>
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

function OutputPanel({ status, output, jobId, jobRecord, onRetry }: { status: JobStatus; output: any; jobId?: string | null; jobRecord?: GeneratedOutput | null; onRetry?: (job: GeneratedOutput) => void }) {
  if (status === 'failed' && output) {
    const failure = getFailureDisplay('documents', { output, jobId })
    const isBacklogValidationFailure = failure.code === 'EPICS & STORIES GENERATION FAILED'
    const canShowRetry = !isBacklogValidationFailure
    return (
      <section className="rounded-xl border border-error/20 bg-surface-container-lowest p-6 shadow-sm">
        <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-error">{failure.code}</p>
            {isBacklogValidationFailure ? null : <h3 className="mt-1 text-lg font-semibold text-on-surface">{failure.title}</h3>}
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{failure.summary}</p>
            <p className="mt-3 rounded-lg bg-surface-container-low p-3 text-sm leading-6 text-on-surface">{failure.action}</p>
            {canShowRetry && jobRecord && onRetry ? (
              <div className="mt-4">
                <button
                  onClick={() => void onRetry(jobRecord)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" /> Retry Job
                </button>
              </div>
            ) : null}
            <TechnicalDetailsPanel failure={failure} jobId={jobId} />
        </div>
      </section>
    )
  }
  if (status !== 'completed' || !output) return null
  if (output.stories && output.testCases) {
    return <GeneratedStoryTestCasesSuccessCard output={output} jobRecord={jobRecord} />
  }
  if (output.epics && output.stories) {
    return <GeneratedJiraSuccessCard output={output} jobRecord={jobRecord} />
  }
  const url = outputUrl(output)
  if (url) return <GeneratedDocumentSuccessCard output={output} url={url} jobRecord={jobRecord} />
  return null
}

function generatedDocumentTitle(documentType?: string, artifactLabel?: string) {
  const label = documentTypeLabel(documentType || artifactLabel)
  return `${label} Generated`
}

function generatedDocumentActionLabel(url: string) {
  const normalized = url.toLowerCase()
  if (normalized.includes('atlassian.net/wiki') || normalized.includes('confluence')) return 'Open in Confluence'
  if (normalized.includes('atlassian.net/browse') || normalized.includes('jira')) return 'Open in Jira'
  return 'Open Document'
}

function GeneratedDocumentSuccessCard({ output, url, jobRecord }: { output: any; url: string; jobRecord?: GeneratedOutput | null }) {
  const documentType = jobRecord?.documentType || output?.documentType
  const artifactLabel = jobRecord?.artifactLabel || output?.artifactLabel
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Generated output'
  return (
    <section className="relative rounded-xl border border-success/20 bg-surface-container-lowest p-5 shadow-sm">
      <span className="absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <div className="flex flex-wrap items-center justify-center gap-5 text-center">
        <div className="flex min-w-0 flex-col items-center">
          <div className="px-16">
            <div>
              <h3 className="text-lg font-semibold text-on-surface">{generatedDocumentTitle(documentType, artifactLabel)}</h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed</p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            {generatedDocumentActionLabel(url)}
          </a>
        </div>
        <GeneratedDocumentMetrics output={output} />
      </div>
    </section>
  )
}

function jiraIssueItems(items: any[], keyName: string, labelName: string, linkName: string) {
  return items.map((item, index) => ({
    id: item[keyName] || item.id || item.jiraEpicId || item.jiraStoryId || item.epicCorrelationId || item.storyCorrelationId || index,
    label: item[labelName] || item.key || item.jiraEpicKey || item.jiraStoryKey || item.parentEpicKey || 'Created',
    link: item[linkName] || item.link || item.url || item.jiraEpicSelf || item.jiraStorySelf,
  }))
}

function GeneratedJiraSuccessCard({ output, jobRecord }: { output: any; jobRecord?: GeneratedOutput | null }) {
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Jira backlog'
  const epics = jiraIssueItems(output.epics || [], 'epicID', 'epicKey', 'epicLink')
  const stories = jiraIssueItems(output.stories || [], 'storyID', 'storyKey', 'storyLink')
  return (
    <section className="relative rounded-xl border border-success/20 bg-surface-container-lowest p-5 shadow-sm">
      <span className="absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="px-16">
          <h3 className="text-lg font-semibold text-on-surface">Epics & User Stories Generated</h3>
          <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed in Jira</p>
        </div>
        <GeneratedDocumentMetrics output={output} />
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <JiraIssueGroup title="Epics" items={epics} />
          <JiraIssueGroup title="User Stories" items={stories} />
        </div>
      </div>
    </section>
  )
}

function GeneratedStoryTestCasesSuccessCard({ output, jobRecord }: { output: any; jobRecord?: GeneratedOutput | null }) {
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Jira test cases'
  const sourceStories = jiraIssueItems(output.stories || [], 'storyId', 'storyKey', 'storyLink')
  const testCases = jiraIssueItems(output.testCases || [], 'testcaseId', 'testcaseKey', 'testcaseLink')
  return (
    <section className="relative rounded-xl border border-success/20 bg-surface-container-lowest p-5 shadow-sm">
      <span className="absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="h-10 w-10" />
      </span>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="px-16">
          <h3 className="text-lg font-semibold text-on-surface">Story Test Cases Generated</h3>
          <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed in Jira</p>
        </div>
        <GeneratedDocumentMetrics output={output} />
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <JiraIssueGroup title="Source Stories" items={sourceStories} />
          <JiraIssueGroup title="Test Cases" items={testCases} />
        </div>
      </div>
    </section>
  )
}

function JiraIssueGroup({ title, items }: { title: string; items: Array<{ id: string | number; label: string; link?: string }> }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-left">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{title}</p>
        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">{items.length}</span>
      </div>
      <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const className = 'flex w-full items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-sm font-bold text-primary transition hover:bg-primary/10'
          return item.link ? (
            <a key={item.id} className={className} href={item.link} target="_blank" rel="noopener noreferrer">
              <span className="truncate">{item.label}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span key={item.id} className={className}>
              <span className="truncate">{item.label}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function generationUsageValues(output: any) {
  const usage = output?.tokenUsage || {}
  return {
    tokens: Number(usage.total || output?.tokensTotal || 0),
    cost: Number(usage.estimatedCostUsd || output?.estimatedCostUsd || 0),
    wordCount: Number(output?.wordCount || 0),
  }
}

function GeneratedDocumentMetrics({ output }: { output: any }) {
  const { tokens, cost, wordCount } = generationUsageValues(output)
  if (!tokens && !cost && !wordCount) return null
  const metrics = [
    { label: 'Words', value: wordCount.toLocaleString() },
    { label: 'Tokens', value: tokens.toLocaleString() },
    { label: 'Cost', value: `$${cost.toFixed(4)}`, estimated: true, tooltip: 'Estimated from recorded generation token usage and configured model pricing. Final provider billing may differ.' },
  ]
  return (
    <div className="mx-auto grid w-full max-w-md gap-2 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="relative rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-center">
          {metric.estimated ? (
            <span
              title={metric.tooltip || ESTIMATED_METRIC_TOOLTIP}
              aria-label={metric.tooltip || ESTIMATED_METRIC_TOOLTIP}
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warning"
            />
          ) : null}
          <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{metric.label}</p>
          <p className="mt-1 break-words text-sm font-bold leading-tight text-on-surface [overflow-wrap:anywhere]">{metric.value}</p>
        </div>
      ))}
    </div>
  )
}

function DocumentJobsPanel({ jobs, onRetry }: { jobs: GeneratedOutput[]; onRetry: (job: GeneratedOutput) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all')
  if (!jobs.length) return null
  const visibleJobs = statusFilter === 'all' ? jobs : jobs.filter((job) => job.status === statusFilter)
  const filterOptions: Array<{ key: 'all' | 'completed' | 'failed'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'completed', label: 'Completed', count: jobs.filter((job) => job.status === 'completed').length },
    { key: 'failed', label: 'Failed', count: jobs.filter((job) => job.status === 'failed').length },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">My Document Jobs</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Track multiple generation requests and retry failed runs.</p>
          </div>
          <div className="flex rounded-md border border-outline-variant bg-surface-container-lowest p-0.5 shadow-sm">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={`flex items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-bold transition ${
                  statusFilter === filter.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`rounded-full px-1.5 py-px text-[10px] ${statusFilter === filter.key ? 'bg-on-primary/15' : 'bg-surface-container text-on-surface-variant'}`}>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-4">
        {visibleJobs.length ? visibleJobs.map((job) => {
          const canRetry = job.status === 'failed' && Boolean(resolveArtifactKey(job))
          const badgeTone: StatusTone = job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info'
          const jobLabel = job.jobId || job.id
          return (
            <div key={job.jobId || job.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-bold text-on-surface">{jobLabel}</p>
                  <p className="mt-1 truncate text-sm text-on-surface-variant" title={job.artifactLabel}>{job.artifactLabel}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{job.projectName}</p>
                </div>
                <StatusBadge status={badgeTone} label={job.status.replace('_', ' ')} />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                {job.documentType ? <span>Type: {documentTypeLabel(job.documentType)}</span> : null}
                <span>Started: {formatTime(job.createdAt)}</span>
                {job.retriedByJobId ? <span>Retried by: {job.retriedByJobId}</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold hover:bg-surface-container">
                    <ExternalLink className="h-4 w-4" /> Open
                  </a>
                ) : null}
                {canRetry ? (
                  <button onClick={() => void onRetry(job)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                    <RefreshCw className="h-4 w-4" /> Retry
                  </button>
                ) : null}
              </div>
            </div>
          )
        }) : (
          <p className="rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No {statusFilter} document jobs to show.</p>
        )}
      </div>
    </section>
  )
}

function KnowledgeJobsPanel({ jobs, onRetry }: { jobs: KnowledgeJobRecord[]; onRetry: (job: KnowledgeJobRecord) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all')
  if (!jobs.length) return null
  const visibleJobs = statusFilter === 'all' ? jobs : jobs.filter((job) => job.status === statusFilter)
  const filterOptions: Array<{ key: 'all' | 'completed' | 'failed'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'completed', label: 'Completed', count: jobs.filter((job) => job.status === 'completed').length },
    { key: 'failed', label: 'Failed', count: jobs.filter((job) => job.status === 'failed').length },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">My Knowledge Jobs</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Track multiple ingestion runs and retry failed artifact batches.</p>
          </div>
          <div className="flex rounded-md border border-outline-variant bg-surface-container-lowest p-0.5 shadow-sm">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={`flex items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-bold transition ${
                  statusFilter === filter.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`rounded-full px-1.5 py-px text-[10px] ${statusFilter === filter.key ? 'bg-on-primary/15' : 'bg-surface-container text-on-surface-variant'}`}>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-4">
        {visibleJobs.length ? visibleJobs.map((job) => {
          const canRetry = job.status === 'failed'
          const badgeTone: StatusTone = job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info'
          return (
            <div key={job.jobId || job.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-bold text-on-surface">{job.jobId || job.id}</p>
                  <p className="mt-1 truncate text-sm text-on-surface-variant" title={job.fileName || job.fileKey || 'Knowledge base ingestion'}>{job.fileName || job.fileKey || 'Knowledge base ingestion'}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{job.projectName}</p>
                </div>
                <StatusBadge status={badgeTone} label={job.status.replace('_', ' ')} />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                {job.processingClass ? <span>Class: {job.processingClass}</span> : null}
                <span>Started: {formatTime(job.createdAt)}</span>
                {job.retriedByJobIds?.length ? <span>Retried by: {job.retriedByJobIds.join(', ')}</span> : null}
              </div>
              {job.error ? <p className="mt-3 text-sm text-on-surface-variant">{job.error}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {canRetry ? (
                  <button onClick={() => void onRetry(job)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                    <RefreshCw className="h-4 w-4" /> Retry Failed Artifacts
                  </button>
                ) : null}
              </div>
            </div>
          )
        }) : (
          <p className="rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No {statusFilter} knowledge jobs to show.</p>
        )}
      </div>
    </section>
  )
}

function GenerationUsage({ output }: { output: any }) {
  const { tokens, cost, wordCount } = generationUsageValues(output)
  if (!tokens && !cost && !wordCount) return null
  return (
    <div className="grid min-w-0 grid-cols-3 gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-center">
      <div>
        <p className="text-xs font-bold uppercase text-on-surface-variant">Words</p>
        <p className="mt-1 text-sm font-bold">{wordCount.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-on-surface-variant">Tokens</p>
        <p className="mt-1 text-sm font-bold">{tokens.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-on-surface-variant">Cost</p>
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

function PlatformLoadCard({
  infrastructureLoad,
  activeJobs,
  failedJobs,
  userRole,
  onClick,
}: {
  infrastructureLoad: InfrastructureLoad | null
  activeJobs: number
  failedJobs: number
  userRole?: CurrentUser['role']
  onClick: () => void
}) {
  const queue = infrastructureLoad?.queues
  const workflows = infrastructureLoad?.workflows
  const usage = infrastructureLoad?.usage
  const isAdmin = userRole === 'admin'
  const pending = queue?.pending ?? 0
  const processing = queue?.processing ?? activeJobs
  const active = queue?.active ?? activeJobs
  const failures = (queue?.failedLast24h ?? failedJobs) + (workflows?.failedLast24h ?? 0)
  const unhealthyServices = infrastructureLoad?.services.filter((service) => ['degraded', 'error', 'unreachable', 'unauthorized'].includes(String(service.status))).length ?? 0
  const statusTone: StatusTone =
    unhealthyServices || infrastructureLoad?.status === 'error'
      ? 'error'
      : failures
        ? 'warning'
        : active || pending
          ? 'info'
          : 'success'
  const title = isAdmin ? 'Operations Snapshot' : 'Project Activity'
  const scopeLabel = infrastructureLoad?.scope === 'self' || !isAdmin ? 'My Projects' : 'Workspace'
  const statusLabel =
    statusTone === 'error'
      ? 'Service attention'
      : statusTone === 'warning'
        ? 'Review needed'
        : active || pending
          ? 'In progress'
          : 'Clear'
  const Icon = statusTone === 'success' ? CheckCircle2 : statusTone === 'error' ? AlertTriangle : active || pending ? Clock : Gauge
  const summary = (() => {
    if (statusTone === 'error') return `${unhealthyServices || 1} service check needs attention. Open diagnostics for details.`
    if (failures) return `${failures} failed job${failures === 1 ? '' : 's'} in the last 24 hours. Review before retrying.`
    if (active || pending) return `${active} running and ${pending} waiting. Q-Ops will update this screen automatically.`
    return isAdmin ? 'No queue pressure or recent failures detected.' : 'No active jobs for your assigned projects right now.'
  })()
  const serviceLabel = unhealthyServices ? `${unhealthyServices} degraded` : infrastructureLoad ? 'Healthy' : 'Not checked'
  const jobsCompletedToday = usage?.jobsCompletedToday ?? 0

  const adminMetrics = [
    { label: 'Running', value: String(processing) },
    { label: 'Waiting', value: String(pending) },
    { label: 'Failures 24h', value: String(failures), attention: failures > 0 },
    { label: 'Avg duration', value: formatDuration(workflows?.avgDurationMs ?? 0) },
    { label: 'Tokens today', value: String(usage?.tokensToday ?? 0) },
    { label: 'Cost today', value: `$${(usage?.costTodayUsd ?? 0).toFixed(2)}` },
  ]

  const userMetrics = [
    { label: 'Running', value: String(active) },
    { label: 'Waiting', value: String(pending) },
    { label: 'Recent failures', value: String(failures), attention: failures > 0 },
    { label: 'Completed today', value: String(jobsCompletedToday) },
  ]
  const metrics = isAdmin ? adminMetrics : userMetrics

  return (
    <button onClick={onClick} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-left transition hover:border-primary hover:shadow-sm">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg border p-3 ${statusDisplayClasses(statusTone)}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-on-surface">{title}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{statusLabel}</p>
              </div>
              <StatusBadge status={statusTone} label={scopeLabel} />
            </div>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <p className="font-semibold text-on-surface-variant">{metric.label}</p>
              <p className={`mt-1 text-sm font-bold ${metric.attention ? 'text-error' : 'text-on-surface'}`}>{metric.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-outline-variant pt-4 text-xs text-on-surface-variant">
          <span>Services: <strong className="text-on-surface">{serviceLabel}</strong></span>
          <span className="font-bold text-primary">Open diagnostics</span>
        </div>
        {queue?.oldestPendingAgeSeconds ? <p className="text-xs text-on-surface-variant">Oldest waiting job: {formatDuration(queue.oldestPendingAgeSeconds * 1000)}</p> : null}
      </div>
    </button>
  )
}

function ArtifactsRepository({ records, onUpload, onReprocess }: { records: ArtifactRecord[]; onUpload: () => void; onReprocess: (artifactId: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | ArtifactRecord['status']>('all')
  const processed = records.filter((item) => item.status === 'processed').length
  const failed = records.filter((item) => item.status === 'failed').length
  const processing = records.filter((item) => item.status === 'processing').length
  const visibleRecords = statusFilter === 'all' ? records : records.filter((record) => record.status === statusFilter)
  const filterOptions: Array<{ key: 'all' | ArtifactRecord['status']; label: string; count: number }> = [
    { key: 'all', label: 'All', count: records.length },
    { key: 'processed', label: 'Processed', count: processed },
    { key: 'failed', label: 'Failed', count: failed },
    { key: 'processing', label: 'Processing', count: processing },
  ]
  return (
    <section className="flex h-[calc(100vh-18rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Artifact repository</p>
            <h3 className="mt-1 text-xl font-semibold text-on-surface">Manage Uploaded Artifacts</h3>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-on-surface-variant">
              Review uploaded files, monitor processing status, and retry failed artifacts.
            </p>
          </div>
          <div className="flex shrink-0">
            <button onClick={onUpload} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm hover:opacity-90">Upload More Artifacts</button>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total artifacts" value={records.length} tag="My projects" />
        <MetricCard label="Total processed" value={processed} tone="success" />
        <MetricCard label="Total failed" value={failed} tone="error" />
        <MetricCard label="Reprocess candidates" value={failed} tone="warning" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">Uploaded Artifacts</h3>
          </div>
          <div className="flex shrink-0 items-center justify-end">
            <div className="flex rounded-md border border-outline-variant bg-surface-container-lowest p-0.5 shadow-sm">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStatusFilter(filter.key)}
                  className={`flex items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-bold transition ${
                    statusFilter === filter.key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`rounded-full px-1.5 py-px text-[10px] ${statusFilter === filter.key ? 'bg-on-primary/15' : 'bg-surface-container text-on-surface-variant'}`}>{filter.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {records.length ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-low text-xs uppercase text-on-surface-variant shadow-sm">
                <tr>
                  <th className="p-4 text-left">File</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Project</th>
                  <th className="p-4 text-left">Uploaded</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {visibleRecords.map((record) => {
                  const canReprocess = record.status === 'failed'
                  return (
                    <tr key={record.id} className="align-top">
                      <td className="p-4 text-left">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-on-surface" title={record.fileName}>{record.fileName}</p>
                          <p className="mt-1 break-all text-xs text-on-surface-variant">Artifact ID: {record.id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-left text-on-surface-variant">{record.type}</td>
                      <td className="p-4 text-left text-on-surface-variant">{record.projectName}</td>
                      <td className="whitespace-nowrap p-4 text-left text-on-surface-variant">{formatTime(record.uploadedAt)}</td>
                      <td className="p-4 text-center"><StatusBadge status={record.status === 'failed' ? 'error' : record.status === 'processed' ? 'success' : 'info'} label={record.status} uppercase /></td>
                      <td className="p-4 text-right">
                        <div className="grid grid-cols-2 gap-2">
                          {record.url ? <a href={record.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center justify-center rounded-lg border border-outline-variant px-2 text-xs font-bold hover:bg-surface-container">Preview</a> : <button className="inline-flex h-8 items-center justify-center rounded-lg border border-outline-variant px-2 text-xs font-bold opacity-60" disabled>Preview</button>}
                          <button
                            onClick={() => onReprocess(record.id)}
                            disabled={!canReprocess}
                            title={canReprocess ? 'Retry processing for this failed artifact' : 'Only failed artifacts can be retried'}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-outline-variant px-2 text-xs font-bold hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!visibleRecords.length ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-sm text-on-surface-variant">No artifacts match the selected status.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
        <EmptyState icon={Archive} title="No artifacts uploaded yet" text="Start by creating a project or opening Knowledge Base ingestion." action="Create Knowledge Base" onAction={onUpload} />
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
  const overview = analytics?.overview
  const successRate = clampPercent(overview?.successRate ?? (failedJobs ? 72 : outputs.length || projects.length ? 96 : 0))
  const byDocType = analytics?.byDocumentType ?? []
  const recentJobs = analytics?.recentJobs ?? []
  const ingestion = analytics?.ingestion
  const failuresByPipeline = analytics?.failures?.byPipeline ?? []
  const costByPipeline = analytics?.costs?.byPipeline ?? []
  const costByProject = analytics?.costs?.byProject ?? []
  const filesByKnowledgeBase = ingestion?.filesByKnowledgeBase ?? []
  const generationJobs = recentJobs.filter((job) => String(job.pipeline || 'generation') !== 'ingestion')
  const ingestionJobs = recentJobs.filter((job) => String(job.pipeline || '') === 'ingestion')
  const generationCompleted = overview?.totalDocumentsGenerated ?? outputs.length
  const ingestionCompleted = ingestion?.jobsCompleted ?? overview?.totalIngestionJobsCompleted ?? 0
  const completedWorkload = Math.max(overview?.totalJobsCompleted ?? 0, generationCompleted + ingestionCompleted, outputs.length)
  const totalFailures = overview?.totalJobsFailed ?? failedJobs
  const totalTokens = overview?.totalTokensConsumed ?? 0
  const totalCost = overview?.totalCostUsd ?? 0
  const generationCostBucket = costByPipeline.find((item) => String(item.pipeline || '').toLowerCase() === 'generation')
  const ingestionCostBucket = costByPipeline.find((item) => String(item.pipeline || '').toLowerCase() === 'ingestion')
  const ingestionTokens = Number(ingestionCostBucket?.tokensTotal) || 0
  const ingestionCost = Number(ingestionCostBucket?.estimatedCostUsd) || 0
  const generationTokens = Number(generationCostBucket?.tokensTotal) || (ingestionTokens ? Math.max(totalTokens - ingestionTokens, 0) : totalTokens)
  const generationCost = Number(generationCostBucket?.estimatedCostUsd) || (ingestionCost ? Math.max(totalCost - ingestionCost, 0) : totalCost)
  const generatedWordsFromDocTypes = byDocType.reduce((sum, item) => sum + Number(item.wordCount || item.word_count || item.totalWords || item.total_words || item.words || 0), 0)
  const generatedWordsFromRecentJobs = generationJobs.reduce((sum, job) => sum + Number(job.wordCount || 0), 0)
  const generatedWordsFromOutputs = outputs.reduce((sum, output) => sum + Number(output.output?.wordCount || output.output?.word_count || output.output?.words || 0), 0)
  const generationWords = generatedWordsFromDocTypes || generatedWordsFromRecentJobs || generatedWordsFromOutputs
  const generationJobsCompleted = Number(generationCostBucket?.jobs) || generationJobs.filter((job) => String(job.status || '').toLowerCase() === 'completed').length || generationCompleted
  const generationDurationSamples = generationJobs
    .map((job) => Number(job.durationMs || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
  const avgGenerationDuration = generationDurationSamples.length
    ? generationDurationSamples.reduce((sum, value) => sum + value, 0) / generationDurationSamples.length
    : overview?.avgDurationMs ?? 0
  const avgCostPerDocument = overview?.avgCostPerDocument ?? (generationCompleted ? totalCost / generationCompleted : 0)
  const chunksIngested = ingestion?.totalChunksIngested ?? overview?.totalChunksIngested ?? 0
  const wordsProcessed = ingestion?.totalWordsProcessed ?? overview?.totalWordsProcessed ?? 0
  const filesProcessed = ingestion?.totalFilesProcessed ?? overview?.totalFilesProcessed ?? 0
  const avgIngestionDuration = ingestion?.avgProcessingDurationMs ?? overview?.avgIngestionDurationMs ?? overview?.avgDurationMs ?? 0
  const generationShare = completedWorkload ? clampPercent((generationCompleted / completedWorkload) * 100) : 0
  const ingestionShare = completedWorkload ? clampPercent((ingestionCompleted / completedWorkload) * 100) : 0
  const activityTrend = buildAnalyticsTrend(recentJobs)
  const deliverableMix = byDocType
    .map((item) => {
      const jobCount = Number(item.count || item.total || item.jobs || 0)
      return {
        label: documentTypeLabel(String(item.documentType || item.document_type || item.type || 'Generated Output')),
        value: jobCount,
        valueLabel: `${formatCompactNumber(jobCount)} job${jobCount === 1 ? '' : 's'}`,
        hint: `${formatCompactNumber(Number(item.tokensTotal || item.tokens_total || 0))} tokens`,
      }
    })
    .filter((item) => item.value > 0)
    .slice(0, 6)
  const knowledgeBaseVolume = filesByKnowledgeBase
    .map((item) => ({
      label: item.projectName,
      value: Number(item.chunksIngested || 0),
      valueLabel: `${formatCompactNumber(Number(item.chunksIngested || 0))} chunks`,
      hint: `${formatCompactNumber(item.filesProcessed)} file${item.filesProcessed === 1 ? '' : 's'} processed`,
    }))
    .filter((item) => item.value > 0 || item.hint)
    .slice(0, 6)
  const analyticsTone: StatusTone = successRate >= 95 ? 'success' : successRate >= 80 ? 'info' : totalFailures ? 'warning' : 'error'
  const analyticsSummary = analytics
    ? `Showing ${pipeline === 'all' ? 'all pipelines' : pipeline} activity for the last ${days} days. ${completedWorkload} completed jobs, ${totalFailures} failed jobs, and ${activeJobs} currently active.`
    : `Using local workspace activity until the analytics endpoint is available. ${projects.length} projects, ${artifacts.length} artifacts, and ${outputs.length} generated outputs are visible in the workspace.`
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
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operations overview</p>
              <h4 className="mt-2 text-2xl font-semibold text-on-surface">Clear visibility across ingestion and generation</h4>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">{analyticsSummary}</p>
            </div>
            <StatusBadge status={analyticsTone} label={analytics ? 'Live analytics' : 'Local fallback'} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsKpiCard
              icon={CheckCircle2}
              title="Completed work"
              value={formatCompactNumber(completedWorkload)}
              detail={`Generation ${formatCompactNumber(generationCompleted)} • Ingestion ${formatCompactNumber(ingestionCompleted)}`}
              tone="success"
            />
            <AnalyticsKpiCard
              icon={Gauge}
              title="Success rate"
              value={`${successRate}%`}
              detail={`${formatCompactNumber(totalFailures)} failed jobs in this window`}
              tone={successRate >= 95 ? 'success' : successRate >= 80 ? 'info' : 'warning'}
            />
            <AnalyticsKpiCard
              icon={Sparkles}
              title="Token usage"
              value={formatCompactNumber(totalTokens)}
              detail={`${formatCompactNumber(costByProject.length || projects.length)} tracked projects`}
              tone="info"
              estimated
            />
            <AnalyticsKpiCard
              icon={BarChart3}
              title="Recorded cost"
              value={formatCurrency(totalCost)}
              detail={`Avg ${formatCurrency(avgCostPerDocument, 2)} per generated document`}
              tone="info"
              estimated
            />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <AnalyticsPipelineCard
              icon={FileText}
              title="Generation"
              subtitle="QA documents, Jira backlog generation, token spend, and recent delivery volume."
              tone="info"
              metrics={[
                { label: 'Words generated', value: formatCompactNumber(generationWords) },
                { label: 'Documents generated', value: formatCompactNumber(generationCompleted) },
                { label: 'Tokens used', value: formatCompactNumber(generationTokens) },
                { label: 'Cost', value: formatCurrency(generationCost, 4), estimated: true },
                { label: 'Duration', value: formatDuration(avgGenerationDuration) },
              ]}
            />
            <AnalyticsPipelineCard
              icon={Database}
              title="Ingestion"
              subtitle="Files processed, chunks created, and how quickly projects become ready for generation."
              tone="success"
              metrics={[
                { label: 'Jobs completed', value: formatCompactNumber(ingestionCompleted) },
                { label: 'Files processed', value: formatCompactNumber(filesProcessed) },
                { label: 'Chunks ingested', value: formatCompactNumber(chunksIngested) },
                { label: 'Words processed', value: formatCompactNumber(wordsProcessed) },
                { label: 'Tokens', value: formatCompactNumber(ingestionTokens), estimated: true },
                { label: 'Cost', value: formatCurrency(ingestionCost, 4), estimated: true },
                { label: 'Average duration', value: formatDuration(avgIngestionDuration) },
              ]}
            />
          </div>
        </section>
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Workspace pulse</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">How the platform is behaving right now</h4>
          <div className="mt-6 space-y-4">
            <AnalyticsProgressRow label="Overall success" value={`${successRate}%`} progress={successRate} tone={successRate >= 95 ? 'success' : successRate >= 80 ? 'info' : 'warning'} />
            <AnalyticsProgressRow label="Generation share" value={`${generationShare}%`} progress={generationShare} tone="info" />
            <AnalyticsProgressRow label="Ingestion share" value={`${ingestionShare}%`} progress={ingestionShare} tone="success" />
            <AnalyticsProgressRow label="Active jobs" value={String(activeJobs)} progress={Math.min(100, activeJobs * 12)} tone={activeJobs ? 'warning' : 'success'} />
          </div>
          <div className="mt-6 border-t border-outline-variant pt-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Attention needed</p>
                <p className="mt-2 text-2xl font-semibold text-on-surface">{formatCompactNumber(totalFailures)}</p>
                <p className="mt-1 text-sm text-on-surface-variant">Failed jobs waiting for review or retry.</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Project coverage</p>
                <p className="mt-2 text-2xl font-semibold text-on-surface">{formatCompactNumber(costByProject.length || projects.length)}</p>
                <p className="mt-1 text-sm text-on-surface-variant">Projects represented in analytics or workspace activity.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsTrendPanel
          title="Recent job activity"
          subtitle="A quick view of when backend activity happened most recently."
          bars={activityTrend}
          emptyText="No recent backend jobs returned yet for trend visualisation."
        />
        <AnalyticsBarList
          title="Generation Demand"
          subtitle="Most requested deliverables by job count and token usage."
          items={deliverableMix}
          emptyText="No document-generation analytics are available yet."
          tone="info"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsBarList
          title="Knowledge Base Volume"
          subtitle="Projects ranked by ingested chunk volume and processed files."
          items={knowledgeBaseVolume}
          emptyText="No completed ingestion analytics are available yet."
          tone="success"
        />
        <div className="grid gap-6">
          <AnalyticsCostSplitPanel rows={costByPipeline} emptyText="No token cost has been recorded yet." />
          <AnalyticsFailureWatchlist rows={failuresByPipeline} emptyText="No failed backend jobs in this range." />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsRecentJobsPanel
          title="Generation jobs"
          subtitle="Recent document-generation activity with documents, words, tokens, cost, and duration."
          jobs={generationJobs}
          projects={projects}
          pipeline="generation"
          emptyText={analytics ? 'No recent generation jobs were returned for this filter.' : 'Generation jobs will appear here once the analytics endpoint returns recent job data.'}
        />
        <AnalyticsRecentJobsPanel
          title="Ingestion jobs"
          subtitle="Recent knowledge-base processing activity with file and chunk counts."
          jobs={ingestionJobs}
          projects={projects}
          pipeline="ingestion"
          emptyText={analytics ? 'No recent ingestion jobs were returned for this filter.' : 'Ingestion jobs will appear here once the analytics endpoint returns recent job data.'}
        />
      </div>
      <AnalyticsProjectCostPanel rows={costByProject} emptyText="No project-level cost has been recorded yet." />
    </section>
  )
}

type AnalyticsTrendBar = {
  key: string
  label: string
  year: number
  value: number
  generation: number
  ingestion: number
  failed: number
}

function buildAnalyticsTrend(jobs: AnalyticsSummary['recentJobs']): AnalyticsTrendBar[] {
  const buckets = new Map<string, AnalyticsTrendBar>()
  jobs.forEach((job) => {
    if (!job.createdAt) return
    const date = new Date(job.createdAt)
    if (Number.isNaN(date.getTime())) return
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    const label = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
    const current = buckets.get(key) || { key, label, year: date.getFullYear(), value: 0, generation: 0, ingestion: 0, failed: 0 }
    const status = String(job.status || '').toLowerCase()
    const pipeline = String(job.pipeline || 'generation').toLowerCase()
    current.value += 1
    if (status === 'failed' || status === 'error') current.failed += 1
    else if (pipeline === 'ingestion') current.ingestion += 1
    else current.generation += 1
    buckets.set(key, current)
  })
  const ordered = Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([, value]) => value)
  const labelCounts = ordered.reduce<Map<string, number>>((counts, bar) => {
    counts.set(bar.label, (counts.get(bar.label) || 0) + 1)
    return counts
  }, new Map())
  return ordered.map((bar) => ({
    ...bar,
    label: (labelCounts.get(bar.label) || 0) > 1 ? `${bar.label} ${bar.year}` : bar.label,
  }))
}

function niceChartStep(value: number) {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(value, 1)))
  const normalized = value / magnitude
  if (normalized <= 1) return magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

function analyticsToneClasses(tone: StatusTone) {
  if (tone === 'success') return 'bg-success/10 text-success'
  if (tone === 'warning') return 'bg-warning/10 text-warning'
  if (tone === 'error') return 'bg-error-container text-on-error-container'
  return 'bg-primary/10 text-primary'
}

function analyticsBarClasses(tone: StatusTone) {
  if (tone === 'success') return 'bg-success'
  if (tone === 'warning') return 'bg-warning'
  if (tone === 'error') return 'bg-error'
  return 'bg-primary'
}

function analyticsJobStatusTone(status?: string): StatusTone {
  if (status === 'completed' || status === 'success') return 'success'
  if (status === 'failed' || status === 'error') return 'error'
  if (status === 'processing' || status === 'running' || status === 'pending' || status === 'queued') return 'warning'
  return 'info'
}

function EstimatedMetricTag() {
  return (
    <span
      title={ESTIMATED_METRIC_TOOLTIP}
      aria-label={ESTIMATED_METRIC_TOOLTIP}
      className="inline-flex shrink-0 rounded-full border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-warning"
    >
      Estimated
    </span>
  )
}

function CompactEstimatedMetricMarker() {
  return (
    <span
      title={ESTIMATED_METRIC_TOOLTIP}
      aria-label={ESTIMATED_METRIC_TOOLTIP}
      className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-warning/30 bg-warning/10 text-warning"
    >
      <HelpCircle className="h-2.5 w-2.5" aria-hidden="true" />
    </span>
  )
}

function AnalyticsKpiCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
  estimated = false,
}: {
  icon: typeof CheckCircle2
  title: string
  value: string
  detail: string
  tone: StatusTone
  estimated?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <div className="pr-10">
        <div className="min-h-10">
          <p className="max-w-28 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">{title}</p>
          {estimated ? (
            <span className="mt-1 inline-flex">
              <EstimatedMetricTag />
            </span>
          ) : null}
          <p className="mt-3 text-3xl font-semibold text-on-surface">{value}</p>
        </div>
      </div>
      <div className={`absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${analyticsToneClasses(tone)}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{detail}</p>
    </div>
  )
}

function AnalyticsPipelineCard({
  icon: Icon,
  title,
  subtitle,
  tone,
  metrics,
}: {
  icon: typeof CheckCircle2
  title: string
  subtitle: string
  tone: StatusTone
  metrics: Array<{ label: string; value: string; estimated?: boolean }>
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-3 ${analyticsToneClasses(tone)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h5 className="text-lg font-semibold text-on-surface">{title}</h5>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={`${title}-${metric.label}`} className="rounded-lg bg-surface-container-lowest p-4 text-center">
            <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              <span>{metric.label}</span>
              {metric.estimated ? <EstimatedMetricTag /> : null}
            </p>
            <p className="mt-2 text-xl font-semibold text-on-surface">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function AnalyticsProgressRow({
  label,
  value,
  progress,
  tone,
}: {
  label: string
  value: string
  progress: number
  tone: StatusTone
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-on-surface">{label}</span>
        <span className="font-semibold text-on-surface-variant">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${analyticsBarClasses(tone)}`} style={{ width: `${clampPercent(progress)}%` }} />
      </div>
    </div>
  )
}

function AnalyticsTrendPanel({
  title,
  subtitle,
  bars,
  emptyText,
}: {
  title: string
  subtitle: string
  bars: AnalyticsTrendBar[]
  emptyText: string
}) {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1)
  const tickCount = 4
  const paddedMaxValue = maxValue + Math.max(2, Math.ceil(maxValue * 0.1))
  const tickMax = Math.max(tickCount, niceChartStep(paddedMaxValue / tickCount) * tickCount)
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => Math.round((tickMax / tickCount) * (tickCount - index)))
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xl font-semibold text-on-surface">{title}</h4>
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Generation</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" />Ingestion</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-error" />Failed</span>
        </div>
      </div>
      {bars.length ? (
        <div className="mt-6 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
          <div className="flex h-56 flex-col justify-between py-1 text-right text-[11px] font-semibold text-on-surface-variant">
            {ticks.map((tick, index) => <span key={`${tick}-${index}`}>{tick}</span>)}
          </div>
          <div>
            <div className="relative h-56 border-b border-l border-outline-variant pl-3">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {ticks.map((tick, index) => (
                  <span key={`grid-${tick}-${index}`} className="block border-t border-outline-variant/60" />
                ))}
              </div>
              <div className="relative z-10 flex h-full items-end gap-3">
                {bars.map((bar) => {
                  const height = Math.max(8, (bar.value / tickMax) * 100)
                  const generationHeight = bar.value ? (bar.generation / bar.value) * 100 : 0
                  const ingestionHeight = bar.value ? (bar.ingestion / bar.value) * 100 : 0
                  const failedHeight = bar.value ? (bar.failed / bar.value) * 100 : 0
                  return (
                    <div key={bar.key} className="relative h-full min-w-0 flex-1">
                      <p
                        className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-on-surface shadow-sm"
                        style={{ bottom: `calc(${height}% + 0.35rem)` }}
                      >
                        {bar.value}
                      </p>
                      <div
                        className="absolute bottom-0 left-1/2 flex w-full max-w-[4rem] -translate-x-1/2 flex-col-reverse overflow-hidden rounded-t-lg bg-surface-container shadow-sm"
                        style={{ height: `${height}%` }}
                        title={`${bar.value} jobs: ${bar.generation} generation, ${bar.ingestion} ingestion${bar.failed ? `, ${bar.failed} failed` : ''}`}
                      >
                        {generationHeight ? <div className="bg-primary" style={{ height: `${generationHeight}%` }} /> : null}
                        {ingestionHeight ? <div className="bg-success" style={{ height: `${ingestionHeight}%` }} /> : null}
                        {failedHeight ? <div className="bg-error" style={{ height: `${failedHeight}%` }} /> : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-3 flex gap-3 pl-3">
              {bars.map((bar) => (
                <p key={`label-${bar.key}`} className="min-w-0 flex-1 text-center text-xs font-semibold text-on-surface-variant">{bar.label}</p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function AnalyticsBarList({
  title,
  subtitle,
  items,
  emptyText,
  tone,
}: {
  title: string
  subtitle: string
  items: Array<{ label: string; value: number; valueLabel?: string; hint?: string }>
  emptyText: string
  tone: StatusTone
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <h4 className="text-xl font-semibold text-on-surface">{title}</h4>
      <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      {items.length ? (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={`${title}-${item.label}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">{item.label}</p>
                  {item.hint ? (
                    <span className="mt-1 inline-flex rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                      {item.hint}
                    </span>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold text-on-surface">{item.valueLabel || formatCompactNumber(item.value)}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <div className={`h-full rounded-full ${analyticsBarClasses(tone)}`} style={{ width: `${Math.max(6, (item.value / maxValue) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function AnalyticsRecentJobsPanel({
  title,
  subtitle,
  jobs,
  projects,
  pipeline,
  emptyText,
}: {
  title: string
  subtitle: string
  jobs: AnalyticsSummary['recentJobs']
  projects: Project[]
  pipeline: 'generation' | 'ingestion'
  emptyText: string
}) {
  const [projectFilter, setProjectFilter] = useState('all')
  const projectOptions = useMemo(() => {
    const assignedProjectNames = projects.map((project) => project.name).filter(Boolean)
    const jobProjectNames = jobs.map((job) => job.projectName || 'Unknown project')
    const names = assignedProjectNames.length ? assignedProjectNames : jobProjectNames
    return Array.from(new Set(names)).sort((left, right) => left.localeCompare(right))
  }, [jobs, projects])
  const filteredJobs = projectFilter === 'all'
    ? jobs
    : jobs.filter((job) => (job.projectName || 'Unknown project') === projectFilter)

  useEffect(() => {
    if (projectFilter !== 'all' && !projectOptions.includes(projectFilter)) {
      setProjectFilter('all')
    }
  }, [projectFilter, projectOptions])

  return (
    <section className="flex min-h-96 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-start">
          <div className="min-w-0">
            <h4 className="text-xl font-semibold text-on-surface">{title}</h4>
            <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
          </div>
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-on-surface outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60 sm:justify-self-end"
            aria-label={`Filter ${title} by project`}
            disabled={!projectOptions.length}
          >
            <option value="all">All projects</option>
            {projectOptions.map((project) => (
              <option key={`${title}-${project}`} value={project}>{project}</option>
            ))}
          </select>
        </div>
      </div>
      {filteredJobs.length ? (
        <div className="max-h-[42rem] flex-1 overflow-y-auto">
          <div className="divide-y divide-outline-variant">
          {filteredJobs.map((job) => {
            const status = job.status === 'info' ? 'completed' : job.status || 'completed'
            const tone = analyticsJobStatusTone(status)
            return (
              <div key={job.jobId} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-semibold text-on-surface">{job.jobId}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{job.projectName || 'Unknown project'}</p>
                    {pipeline === 'generation' ? <p className="mt-1 text-xs text-on-surface-variant">{documentTypeLabel(job.documentType)}</p> : null}
                  </div>
                  <StatusBadge status={tone} label={status.replace(/_/g, ' ')} />
                </div>
                <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${pipeline === 'generation' ? 'xl:grid-cols-5' : 'xl:grid-cols-6'}`}>
                  {pipeline === 'generation' ? (
                    <>
                      <AnalyticsJobStat label="Words generated" value={formatCompactNumber(job.wordCount)} />
                      <AnalyticsJobStat label="Documents generated" value={String(status === 'completed' ? 1 : 0)} />
                      <AnalyticsJobStat label="Tokens used" value={formatCompactNumber(job.tokensTotal)} />
                      <AnalyticsJobStat label="Cost" value={formatCurrency(job.estimatedCostUsd, 4)} estimated />
                      <AnalyticsJobStat label="Duration" value={formatDuration(job.durationMs)} />
                    </>
                  ) : (
                    <>
                      <AnalyticsJobStat label="Words" value={formatCompactNumber(job.wordCount)} />
                      <AnalyticsJobStat label="Files" value={formatCompactNumber(job.totalFiles)} />
                      <AnalyticsJobStat label="Chunks" value={formatCompactNumber(job.chunkCount)} />
                      <AnalyticsJobStat label="Tokens" value={formatCompactNumber(job.tokensTotal)} estimated />
                      <AnalyticsJobStat label="Cost" value={formatCurrency(job.estimatedCostUsd, 4)} estimated />
                      <AnalyticsJobStat label="Duration" value={formatDuration(job.durationMs)} />
                    </>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center">
          <p className="p-5 text-sm text-on-surface-variant">{jobs.length ? 'No jobs match the selected project.' : emptyText}</p>
        </div>
      )}
    </section>
  )
}

function AnalyticsJobStat({ label, value, mono = false, estimated = false }: { label: string; value: string; mono?: boolean; estimated?: boolean }) {
  return (
    <div className="relative min-w-0 rounded-lg bg-surface-container-low p-3 text-center">
      {estimated ? <CompactEstimatedMetricMarker /> : null}
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        <span>{label}</span>
      </p>
      <p className={`mt-2 max-w-full break-words text-sm font-semibold leading-tight text-on-surface [overflow-wrap:anywhere] ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function pipelineDisplayName(pipeline?: string) {
  const value = String(pipeline || 'unknown').trim()
  if (!value) return 'Unknown'
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/[_-]/g, ' ')
}

function AnalyticsCostSplitPanel({
  rows,
  emptyText,
}: {
  rows: Array<{ pipeline?: string; jobs: number; estimatedCostUsd: number }>
  emptyText: string
}) {
  const totalCost = rows.reduce((sum, row) => sum + Number(row.estimatedCostUsd || 0), 0)
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-on-surface">Cost By Pipeline</h3>
        <EstimatedMetricTag />
      </div>
      {rows.length ? (
        <div className="mt-4 space-y-3">
          {rows.map((row) => {
            const share = totalCost ? clampPercent((Number(row.estimatedCostUsd || 0) / totalCost) * 100) : 0
            const shareLabel = share.toFixed(2)
            return (
              <div key={`cost-${row.pipeline || 'unknown'}`} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{pipelineDisplayName(row.pipeline)}</p>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">{formatCompactNumber(row.jobs)} job{row.jobs === 1 ? '' : 's'}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-on-surface">{formatCurrency(row.estimatedCostUsd, 4)}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className={`h-full rounded-full ${String(row.pipeline || '').toLowerCase() === 'ingestion' ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.max(6, share)}%` }} />
                </div>
                <p className="mt-1 text-right text-[11px] font-semibold text-on-surface-variant">{shareLabel}% of recorded cost</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </div>
  )
}

function AnalyticsFailureWatchlist({
  rows,
  emptyText,
}: {
  rows: Array<{ pipeline: string; count: number; latestFailureAt?: string | null }>
  emptyText: string
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <h3 className="text-base font-semibold text-on-surface">Failure Watchlist</h3>
      {rows.length ? (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={`failure-${row.pipeline}`} className="rounded-lg border border-error/25 bg-error/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{pipelineDisplayName(row.pipeline)}</p>
                  <p className="mt-1 text-xs font-medium text-error">{formatCompactNumber(row.count)} failure{row.count === 1 ? '' : 's'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-container px-2 py-1 text-[11px] font-semibold text-on-surface-variant">
                  Latest {row.latestFailureAt ? formatTime(row.latestFailureAt) : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-success/25 bg-success/10 p-4">
          <p className="text-sm font-semibold text-success">No failed jobs in this range</p>
          <p className="mt-1 text-xs text-on-surface-variant">{emptyText}</p>
        </div>
      )}
    </div>
  )
}

function AnalyticsProjectCostPanel({
  rows,
  emptyText,
}: {
  rows: Array<{ projectId?: string | null; projectName?: string; jobs: number; tokensTotal: number; estimatedCostUsd: number }>
  emptyText: string
}) {
  const totalCost = rows.reduce((sum, row) => sum + Number(row.estimatedCostUsd || 0), 0)
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-on-surface">Cost by Project</h3>
        <EstimatedMetricTag />
      </div>
      {rows.length ? (
        <div className="mt-5 space-y-4">
          {rows.map((row) => {
            const projectLabel = row.projectName || row.projectId || 'Unknown project'
            const share = totalCost ? clampPercent((Number(row.estimatedCostUsd || 0) / totalCost) * 100) : 0
            return (
              <div key={`project-cost-${row.projectId || projectLabel}`} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">{projectLabel}</p>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">
                      {formatCompactNumber(row.jobs)} job{row.jobs === 1 ? '' : 's'} · {formatCompactNumber(row.tokensTotal)} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-on-surface">{formatCurrency(row.estimatedCostUsd, 4)}</p>
                    <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">{share.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(6, share)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function AnalyticsMiniTable({
  title,
  columns,
  rows,
  emptyText,
  estimated = false,
}: {
  title: string
  columns: string[]
  rows: Array<Array<string | number>>
  emptyText: string
  estimated?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
          <span>{title}</span>
          {estimated ? <EstimatedMetricTag /> : null}
        </h3>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-left text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                {columns.map((column, columnIndex) => (
                  <th key={column} className={`px-4 py-3 ${columnIndex === 0 ? '' : 'text-right'}`}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/70">
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="transition-colors hover:bg-surface-container-low">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${title}-${index}-${cellIndex}`}
                      className={`px-4 py-3 ${cellIndex === 0 ? 'font-semibold text-on-surface' : 'text-right font-medium text-on-surface-variant'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="m-4 rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">{emptyText}</p>
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
  const microservicesIntegration = getIntegration(backendSettings, 'microservices')
  const [jiraDraft, setJiraDraft] = useState({ baseUrl: '', projectKey: '', projectId: '', idempotencyLabelPrefix: 'qops' })
  const [confluenceDraft, setConfluenceDraft] = useState({ baseUrl: '', spaceKey: '', parentPageId: '', pageTitlePattern: '{documentTitle} - {projectName}' })
  const [chromaDraft, setChromaDraft] = useState({ baseUrl: 'https://api.trychroma.com', tenant: '', database: '', collection: '', topK: '20' })
  const [microservicesDraft, setMicroservicesDraft] = useState({
    documentProcessorBaseUrl: 'http://127.0.0.1:8000',
    documentProcessorPath: '/process-document',
    documentProcessorHealthPath: '/health',
    documentProcessorV2BaseUrl: 'http://127.0.0.1:8001',
    documentProcessorV2Path: '/process-document-v2',
    documentProcessorV2HealthPath: '/health',
    converterBaseUrl: 'http://127.0.0.1:5050',
    converterPath: '/convert',
    converterHealthPath: '/health',
    timeoutMs: '30000',
    maxVisionImagesPerJob: '80',
    visionBatchSize: '5',
    maxRenderedPagesPerDocument: '12',
    maxEmbeddedImagesPerDocument: '20',
    maxStandaloneImagesPerDocument: '10',
    visionRenderDpi: '144',
    deferOverflowVisuals: true,
  })
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

  useEffect(() => {
    const config = chromaIntegration?.config || {}
    setChromaDraft({
      baseUrl: 'https://api.trychroma.com',
      tenant: String(config.tenant || ''),
      database: String(config.database || ''),
      collection: String(config.collection || ''),
      topK: String(config.topK || 20),
    })
  }, [chromaIntegration?.updatedAt, chromaIntegration?.settingsVersion])

  useEffect(() => {
    const config = microservicesIntegration?.config || {}
    const vision = config.vision || {}
    setMicroservicesDraft({
      documentProcessorBaseUrl: String(config.documentProcessorBaseUrl || 'http://127.0.0.1:8000'),
      documentProcessorPath: String(config.documentProcessorPath || '/process-document'),
      documentProcessorHealthPath: String(config.documentProcessorHealthPath || '/health'),
      documentProcessorV2BaseUrl: String(config.documentProcessorV2BaseUrl || 'http://127.0.0.1:8001'),
      documentProcessorV2Path: String(config.documentProcessorV2Path || '/process-document-v2'),
      documentProcessorV2HealthPath: String(config.documentProcessorV2HealthPath || '/health'),
      converterBaseUrl: String(config.converterBaseUrl || 'http://127.0.0.1:5050'),
      converterPath: String(config.converterPath || '/convert'),
      converterHealthPath: String(config.converterHealthPath || '/health'),
      timeoutMs: String(config.timeoutMs || 30000),
      maxVisionImagesPerJob: String(vision.maxImagesPerJob || 80),
      visionBatchSize: String(vision.batchSize || 5),
      maxRenderedPagesPerDocument: String(vision.maxRenderedPagesPerDocument || 12),
      maxEmbeddedImagesPerDocument: String(vision.maxEmbeddedImagesPerDocument || 20),
      maxStandaloneImagesPerDocument: String(vision.maxStandaloneImagesPerDocument || 10),
      visionRenderDpi: String(vision.renderDpi || 144),
      deferOverflowVisuals: typeof vision.deferOverflowVisuals === 'boolean' ? vision.deferOverflowVisuals : true,
    })
  }, [microservicesIntegration?.updatedAt, microservicesIntegration?.settingsVersion])

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

  const saveChroma = async () => {
    setSavingIntegration('chroma')
    const currentConfig = chromaIntegration?.config || {}
    const topK = Math.max(1, Math.min(100, Number(chromaDraft.topK) || 20))
    const ok = await onSaveIntegration('chroma', {
      ...currentConfig,
      baseUrl: 'https://api.trychroma.com',
      tenant: chromaDraft.tenant.trim(),
      database: chromaDraft.database.trim(),
      collection: chromaDraft.collection.trim(),
      topK,
    }, chromaIntegration?.enabled ?? true)
    setSavingIntegration(null)
    return ok
  }

  const saveMicroservices = async () => {
    setSavingIntegration('microservices')
    const currentConfig = microservicesIntegration?.config || {}
    const currentVision = currentConfig.vision || {}
    const clamp = (value: string, fallback: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, Number(value) || fallback))
    const ok = await onSaveIntegration('microservices', {
      ...currentConfig,
      documentProcessorBaseUrl: microservicesDraft.documentProcessorBaseUrl.trim() || 'http://127.0.0.1:8000',
      documentProcessorPath: microservicesDraft.documentProcessorPath.trim() || '/process-document',
      documentProcessorHealthPath: microservicesDraft.documentProcessorHealthPath.trim() || '/health',
      documentProcessorV2BaseUrl: microservicesDraft.documentProcessorV2BaseUrl.trim() || 'http://127.0.0.1:8001',
      documentProcessorV2Path: microservicesDraft.documentProcessorV2Path.trim() || '/process-document-v2',
      documentProcessorV2HealthPath: microservicesDraft.documentProcessorV2HealthPath.trim() || '/health',
      converterBaseUrl: microservicesDraft.converterBaseUrl.trim() || 'http://127.0.0.1:5050',
      converterPath: microservicesDraft.converterPath.trim() || '/convert',
      converterHealthPath: microservicesDraft.converterHealthPath.trim() || '/health',
      timeoutMs: clamp(microservicesDraft.timeoutMs, 30000, 1000, 300000),
      vision: {
        ...currentVision,
        maxImagesPerJob: clamp(microservicesDraft.maxVisionImagesPerJob, 80, 1, 500),
        batchSize: clamp(microservicesDraft.visionBatchSize, 5, 1, 50),
        maxRenderedPagesPerDocument: clamp(microservicesDraft.maxRenderedPagesPerDocument, 12, 1, 200),
        maxEmbeddedImagesPerDocument: clamp(microservicesDraft.maxEmbeddedImagesPerDocument, 20, 1, 200),
        maxStandaloneImagesPerDocument: clamp(microservicesDraft.maxStandaloneImagesPerDocument, 10, 1, 100),
        renderDpi: clamp(microservicesDraft.visionRenderDpi, 144, 72, 600),
        deferOverflowVisuals: microservicesDraft.deferOverflowVisuals,
      },
    }, microservicesIntegration?.enabled ?? true)
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
        <div className="grid gap-6 lg:grid-cols-2">
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
            <table className="w-full min-w-full text-left text-sm">
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
          <div className="grid gap-6 lg:grid-cols-3">
            <SettingsPanel title="Jira Software" className="lg:col-span-2">
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
          <SettingsPanel title="ChromaDB">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg bg-primary p-3 text-on-primary"><Database className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">ChromaDB</p>
                    <p className="text-xs text-on-surface-variant">Vector database used for QA document retrieval.</p>
                  </div>
                </div>
                <StatusBadge status={chromaDraft.tenant && chromaDraft.database && chromaDraft.collection ? 'success' : 'warning'} label={chromaDraft.tenant && chromaDraft.database && chromaDraft.collection ? 'Configured' : 'Not configured'} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('chroma')} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button onClick={() => void saveChroma()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">{savingIntegration === 'chroma' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsInput label="Base URL" value={chromaDraft.baseUrl} onChange={() => undefined} disabled />
              <SettingsInput label="Tenant ID" value={chromaDraft.tenant} onChange={(value) => setChromaDraft((current) => ({ ...current, tenant: value }))} placeholder="My_Tenant" />
              <SettingsInput label="Database Name" value={chromaDraft.database} onChange={(value) => setChromaDraft((current) => ({ ...current, database: value }))} placeholder="QA-Documents-Chunk" />
              <SettingsInput label="Collection Name" value={chromaDraft.collection} onChange={(value) => setChromaDraft((current) => ({ ...current, collection: value }))} placeholder="qa-chunks-batches" />
              <SettingsInput label="Top K" value={chromaDraft.topK} onChange={(value) => setChromaDraft((current) => ({ ...current, topK: value.replace(/[^0-9]/g, '') }))} placeholder="20" />
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">The API key remains in n8n credentials. The UI saves only non-secret routing values used by health, ingestion, and retrieval runtime config.</p>
          </SettingsPanel>
          <SettingsPanel title="Document Processing">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg bg-primary p-3 text-on-primary"><ScanSearch className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">Draft extractor and vision routing</p>
                    <p className="text-xs text-on-surface-variant">Keeps the v2 ingestion path isolated while letting us tune visual throughput safely.</p>
                  </div>
                </div>
                <StatusBadge
                  status={microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'success' : 'warning'}
                  label={microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'Configured' : 'Needs draft endpoint'}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('microservices')} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button onClick={() => void saveMicroservices()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">{savingIntegration === 'microservices' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <SettingsInput label="Current processor base URL" value={microservicesDraft.documentProcessorBaseUrl} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorBaseUrl: value }))} placeholder="http://127.0.0.1:8000" />
              <SettingsInput label="Current processor path" value={microservicesDraft.documentProcessorPath} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorPath: value }))} placeholder="/process-document" />
              <SettingsInput label="Draft v2 processor base URL" value={microservicesDraft.documentProcessorV2BaseUrl} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2BaseUrl: value }))} placeholder="http://127.0.0.1:8001" />
              <SettingsInput label="Draft v2 processor path" value={microservicesDraft.documentProcessorV2Path} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2Path: value }))} placeholder="/process-document-v2" />
              <SettingsInput label="Draft v2 health path" value={microservicesDraft.documentProcessorV2HealthPath} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2HealthPath: value }))} placeholder="/health" />
              <SettingsInput label="Request timeout (ms)" value={microservicesDraft.timeoutMs} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, timeoutMs: value.replace(/[^0-9]/g, '') }))} placeholder="30000" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <SettingsInput label="Max vision images per job" value={microservicesDraft.maxVisionImagesPerJob} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, maxVisionImagesPerJob: value.replace(/[^0-9]/g, '') }))} placeholder="80" />
              <SettingsInput label="Vision batch size" value={microservicesDraft.visionBatchSize} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, visionBatchSize: value.replace(/[^0-9]/g, '') }))} placeholder="5" />
              <SettingsInput label="Render DPI" value={microservicesDraft.visionRenderDpi} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, visionRenderDpi: value.replace(/[^0-9]/g, '') }))} placeholder="144" />
              <SettingsInput label="Max rendered pages per document" value={microservicesDraft.maxRenderedPagesPerDocument} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, maxRenderedPagesPerDocument: value.replace(/[^0-9]/g, '') }))} placeholder="12" />
              <SettingsInput label="Max embedded images per document" value={microservicesDraft.maxEmbeddedImagesPerDocument} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, maxEmbeddedImagesPerDocument: value.replace(/[^0-9]/g, '') }))} placeholder="20" />
              <SettingsInput label="Max standalone images per document" value={microservicesDraft.maxStandaloneImagesPerDocument} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, maxStandaloneImagesPerDocument: value.replace(/[^0-9]/g, '') }))} placeholder="10" />
            </div>
            <ToggleRow label="Defer overflow visuals instead of dropping context silently" checked={microservicesDraft.deferOverflowVisuals} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, deferOverflowVisuals: checked }))} />
            <p className="text-xs leading-5 text-on-surface-variant">Only the draft ingestion workflow will read the v2 processor URL and these vision settings. Existing workflows can keep using the current processor endpoint.</p>
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
            <SettingsInput label="Default Chroma collection" value={chromaDraft.collection || 'qa-chunks-batches'} onChange={(value) => setChromaDraft((current) => ({ ...current, collection: value }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void saveJira()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Save Jira Default</button>
            <button onClick={() => void saveConfluence()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Save Confluence Default</button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full min-w-full text-left text-sm">
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

const investorFaqs: Array<{ category: string; question: string; answer: string }> = [
  {
    category: 'Business Value',
    question: 'What problem does Q-Ops Agent solve?',
    answer: 'Q-Ops Agent helps teams convert project artifacts such as BRDs, FRDs, HLDs, LLDs, transcripts, and UI designs into reusable QA knowledge and structured QA outputs. It reduces repetitive documentation effort and helps teams move from project context to test strategy, test plans, risk matrices, traceability, epics, user stories, and test cases faster.',
  },
  {
    category: 'Business Value',
    question: 'Who is the application designed for?',
    answer: 'It is designed for QA teams, delivery managers, product owners, business analysts, engineering teams, and enterprises that need consistent QA planning, faster test documentation, and better visibility into project readiness.',
  },
  {
    category: 'Business Value',
    question: 'Does the application replace QA teams?',
    answer: 'No. It supports QA teams by preparing structured first drafts, highlighting gaps, improving traceability, and reducing manual preparation time. Human review and approval remain important before outputs are used for delivery.',
  },
  {
    category: 'Business Value',
    question: 'How is this different from using a general AI chat tool?',
    answer: 'The platform is workflow-driven, project-aware, integrated with Jira and Confluence, auditable, repeatable, and grounded in uploaded project artifacts. It is built around QA operations rather than one-off prompting.',
  },
  {
    category: 'AI Usage',
    question: 'How does the application use AI?',
    answer: 'AI is used to extract context from artifacts, build searchable knowledge, reason over project-specific information, and generate structured QA and delivery outputs. Retrieval and quality checks help keep outputs tied to uploaded project context.',
  },
  {
    category: 'AI Usage',
    question: 'Which AI models does the application use?',
    answer: 'The model layer is configurable. Different models can be used for document generation, embeddings, and vision processing depending on the desired balance of quality, speed, cost, and enterprise policy.',
  },
  {
    category: 'AI Usage',
    question: 'Can the model provider be changed later?',
    answer: 'Yes, the architecture can support configurable model providers and model versions. Provider changes should be tested carefully because token accounting, output quality, latency, and supported features may vary.',
  },
  {
    category: 'AI Usage',
    question: 'How does the system reduce hallucinated outputs?',
    answer: 'It uses project-specific retrieval, structured prompts, quality gates, required-section checks, traceability checks, source grounding, audit logs, and human review. These controls reduce risk, but generated outputs should still be reviewed before final use.',
  },
  {
    category: 'Security',
    question: 'How is access controlled?',
    answer: 'Access is intended to be project-scoped. Admins manage users, projects, settings, and integrations, while registered users work only within assigned projects and see only the related artifacts, jobs, analytics, and outputs.',
  },
  {
    category: 'Security',
    question: 'What security controls are important for this application?',
    answer: 'Important controls include authentication, role-based access, project-level authorization, secure webhooks, audit logging, encrypted storage, secret management, restricted service-role usage, and least-privilege access to external systems.',
  },
  {
    category: 'Security',
    question: 'How are API keys and third-party credentials protected?',
    answer: 'Secrets such as Jira, Confluence, Supabase, model provider, and n8n credentials should be stored in secure environment variables or credential stores. They should never be committed to source code, logs, exported workflow files, or documentation.',
  },
  {
    category: 'Security',
    question: 'Is customer data used to train public AI models?',
    answer: 'The application should be configured so customer data is not used to train public foundation models. This depends on the selected provider, enterprise plan, and data-processing terms.',
  },
  {
    category: 'Data Storage',
    question: 'Where is uploaded data stored?',
    answer: 'Uploaded files, job metadata, generated outputs, audit records, and analytics are stored in configured backend systems such as the application database, object storage, and vector database. The exact location depends on deployment configuration.',
  },
  {
    category: 'Data Storage',
    question: 'What goes into the vector database?',
    answer: 'The vector database stores searchable chunks and metadata needed for retrieval, such as project, document type, source file, chunk ID, job ID, and processing context. This allows generation workflows to retrieve relevant project knowledge.',
  },
  {
    category: 'Data Storage',
    question: 'Are original documents stored separately from embeddings?',
    answer: 'Typically yes. Original files are stored in object storage, while extracted text, metadata, chunks, and embeddings are stored separately for retrieval and analytics.',
  },
  {
    category: 'Data Storage',
    question: 'Can data be deleted later?',
    answer: 'A production-grade deployment should support project-level deletion, artifact deletion, vector cleanup, generated-output cleanup, and retention policies for audit data.',
  },
  {
    category: 'IP Protection',
    question: 'How is intellectual property protected?',
    answer: 'Project documents and generated outputs remain tied to the customer workspace and assigned projects. Access controls, audit trails, secure storage, and project-scoped retrieval help protect project IP.',
  },
  {
    category: 'IP Protection',
    question: 'Can one project accidentally use another project’s context?',
    answer: 'The retrieval layer should filter by project metadata and active knowledge-base version. This prevents generation workflows from mixing unrelated project context and protects tenant or project boundaries.',
  },
  {
    category: 'Cost And Tokens',
    question: 'How does the application control AI cost?',
    answer: 'It tracks token usage, estimated cost, job metrics, model usage, and pipeline-level spend. Teams can monitor cost by project, pipeline, document type, and recent job activity.',
  },
  {
    category: 'Cost And Tokens',
    question: 'Are token and cost values exact?',
    answer: 'Not always. Ingestion tokens and cost are usually estimated. Generation usage may use provider-reported token data when available, but cost should still be treated as estimated unless reconciled with final provider billing.',
  },
  {
    category: 'Cost And Tokens',
    question: 'Why are token and cost estimates useful?',
    answer: 'They help teams forecast spend, compare project usage, identify expensive workflows, and optimize prompts, document size, chunking, retrieval, and model selection.',
  },
  {
    category: 'Cost And Tokens',
    question: 'Can the application prevent runaway AI usage?',
    answer: 'Yes. Recommended controls include file limits, job queueing, retry limits, max-token settings, usage dashboards, budget alerts, and per-project cost monitoring.',
  },
  {
    category: 'Caching',
    question: 'Can repeated AI requests be cached?',
    answer: 'Yes. A job can be a cache candidate when the project context, source artifacts, prompt version, model, settings, document type, and retrieval configuration have not changed.',
  },
  {
    category: 'Caching',
    question: 'Will caching affect output quality?',
    answer: 'Caching can preserve quality for repeated requests, but it should not be used when source documents, prompts, models, or business rules have changed. Cache validation rules are essential.',
  },
  {
    category: 'Workflow Reliability',
    question: 'What happens if a job fails?',
    answer: 'Failed jobs are tracked with status, error details, metrics, and retry options where appropriate. This allows users to review the cause and safely retry ingestion or generation when needed.',
  },
  {
    category: 'Workflow Reliability',
    question: 'Why does the platform use queued workflows?',
    answer: 'Queueing keeps large ingestion and generation workloads controlled, prevents overload, supports retry behavior, and allows multiple jobs to be processed safely.',
  },
  {
    category: 'Workflow Reliability',
    question: 'Can users monitor long-running jobs?',
    answer: 'Yes. Job status panels show submitted, pending, processing, completed, and failed states so users can track progress without guessing what is happening in the backend.',
  },
  {
    category: 'Integrations',
    question: 'Can the platform integrate with Jira and Confluence?',
    answer: 'Yes. The application can generate Jira epics, user stories, and test cases, and can publish QA documents such as test strategies and test plans to Confluence.',
  },
  {
    category: 'Integrations',
    question: 'Does it support both Team-managed and Company-managed Jira projects?',
    answer: 'This is an important scalability requirement. The creation workflow should detect the Jira project type and route epic, story, and linking logic accordingly because Team-managed and Company-managed projects differ.',
  },
  {
    category: 'Governance',
    question: 'Does the platform keep an audit trail?',
    answer: 'Yes. Important actions such as login, project creation, artifact upload, knowledge-base creation, document generation, retries, settings changes, and integration checks should be audit logged.',
  },
  {
    category: 'Governance',
    question: 'How does the application support enterprise governance?',
    answer: 'It supports repeatable workflows, role-based access, traceability, status tracking, usage metrics, audit events, and configurable integrations. These controls make AI-assisted QA easier to govern.',
  },
  {
    category: 'Deployment',
    question: 'Can this be deployed inside an enterprise environment?',
    answer: 'Yes, with the right architecture. Enterprises may require private networking, dedicated databases, private storage, SSO, audit exports, data-retention controls, and approved model providers.',
  },
  {
    category: 'Deployment',
    question: 'What are the biggest risks in this kind of AI application?',
    answer: 'The major risks are data leakage, weak access control, hallucinated outputs, uncontrolled token spend, poor prompt/version governance, weak auditability, and stale or mixed retrieval context.',
  },
  {
    category: 'Deployment',
    question: 'How are those risks mitigated?',
    answer: 'Through secure authentication, project-level access, secret management, controlled workflows, traceability checks, cost tracking, audit logs, human review, and versioned prompts/settings.',
  },
  {
    category: 'Investor Perspective',
    question: 'Why is this valuable to leadership and investors?',
    answer: 'It shows measurable productivity gains, reduced QA cycle time, better coverage, repeatable delivery governance, cost visibility, and scalable AI-assisted documentation across projects.',
  },
  {
    category: 'Investor Perspective',
    question: 'What is the long-term value of the platform?',
    answer: 'It can become a QA intelligence layer across projects, helping organizations reuse knowledge, standardize QA outputs, improve governance, and reduce repeated manual effort across delivery teams.',
  },
]

function FaqPage() {
  const groupedFaqs = investorFaqs.reduce<Record<string, typeof investorFaqs>>((groups, item) => {
    groups[item.category] = groups[item.category] || []
    groups[item.category].push(item)
    return groups
  }, {})

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Client and investor readiness</p>
        <h3 className="mt-2 text-2xl font-semibold text-on-surface">Frequently Asked Questions</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
          Clear answers for security, cost, data storage, IP protection, AI usage, integrations, governance, and enterprise scalability.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Topics</p>
          <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <a key={category} href={`#faq-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary lg:rounded-lg">
                {category} ({items.length})
              </a>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          {Object.entries(groupedFaqs).map(([category, items]) => (
            <section key={category} id={`faq-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-on-surface">{category}</h4>
              <div className="mt-4 divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant">
                {items.map((item, index) => (
                  <details key={item.question} className="group bg-surface-container-lowest open:bg-surface-container-low">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low">
                      <span>{index + 1}. {item.question}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4 text-sm leading-6 text-on-surface-variant">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

function DocumentationPage({ onHelp, onKnowledge, onStatus }: { onHelp: () => void; onKnowledge: () => void; onStatus: () => void }) {
  const productOutcomes = [
    { label: 'Ingest', value: 'BRD, FRD, HLD, LLD, transcripts, and UI designs' },
    { label: 'Understand', value: 'Text, images, chunks, embeddings, and project metadata' },
    { label: 'Generate', value: 'Strategies, plans, risks, traceability, Jira backlog, and test cases' },
    { label: 'Govern', value: 'Status, audit logs, analytics, cost visibility, and retries' },
  ]
  const e2eSteps = ['Upload artifacts', 'Create jobs', 'Extract context', 'Chunk and embed', 'Store knowledge', 'Generate outputs', 'Publish results', 'Track analytics']
  const architectureNodes = [
    { title: 'Frontend', detail: 'Role-aware workspace, job panels, analytics, documentation, and settings.' },
    { title: 'n8n Workflows', detail: 'Upload, worker, generation, status, analytics, and integration orchestration.' },
    { title: 'Supabase', detail: 'Auth, projects, artifacts, job metrics, audit records, and storage.' },
    { title: 'Extractor Service', detail: 'Document text and image extraction through /process-document-v2.' },
    { title: 'ChromaDB', detail: 'Project-scoped chunks, embeddings, and retrieval metadata.' },
    { title: 'LLM Layer', detail: 'Generation, embeddings, and vision usage where configured.' },
    { title: 'Jira / Confluence', detail: 'Backlog issues and documentation publishing destinations.' },
  ]
  const moduleCards = [
    { icon: LayoutDashboard, title: 'Dashboard', detail: 'Monitor active work, jump to key workflows, and review operational status.' },
    { icon: UploadCloud, title: 'Create Knowledge Base', detail: 'Upload artifacts and create per-file ingestion jobs with visible progress.' },
    { icon: FileText, title: 'Generate Documents', detail: 'Create QA deliverables from retrieval-ready project context.' },
    { icon: Archive, title: 'Artifacts', detail: 'Review source files, processing outcomes, and reprocess candidates.' },
    { icon: BarChart3, title: 'Analytics', detail: 'Track jobs, success rate, estimated cost, token usage, and failures.' },
    { icon: Settings, title: 'Settings', detail: 'Manage users, integrations, defaults, health checks, and runtime routing.' },
  ]
  const deliverables = [
    ['Test Strategy', 'Confluence-ready strategic QA coverage and approach.'],
    ['Test Plan', 'Execution-focused scope, entry, exit, schedule, and risk detail.'],
    ['Risk Matrix', 'Risk identification, impact, probability, and mitigation planning.'],
    ['Traceability Matrix', 'Requirement-to-test coverage mapping.'],
    ['Epics & User Stories', 'Jira-ready backlog creation from project context.'],
    ['Story Test Cases', 'Jira test cases linked back to generated stories.'],
  ]
  const runbookItems = [
    ['Job failed', 'Open Error Details, inspect the backend message, then retry only when the cause is clear.'],
    ['No chunks returned', 'Check Chroma metadata, project name, collection, and ingestion completion for the selected project.'],
    ['Supabase auth issue', 'Refresh the session, verify JWT shape, and avoid sending malformed local-storage tokens.'],
    ['n8n timeout or memory issue', 'Check extractor runtime, file size, image volume, workflow timeout, and worker logs.'],
    ['Jira creation failed', 'Validate project type, issue type mapping, parent linking, and credential scope.'],
    ['Cost looks high', 'Review token-heavy jobs, prompt size, retrieved chunks, document size, and cache candidates.'],
  ]
  const roadmap = [
    'Reintroduce advanced extractor features with bounded memory and page/image limits.',
    'Add cache eligibility checks for repeated generation requests.',
    'Support Jira Team-managed and Company-managed project routing.',
    'Introduce knowledge-base versioning for cleaner retrieval isolation.',
    'Move toward billing-grade provider usage capture for every model call.',
  ]

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Product guide</p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight text-on-surface">Q-Ops Agent turns project artifacts into governed QA intelligence.</h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-on-surface-variant">
              This page explains how the application ingests source documents, builds project knowledge, generates QA deliverables, publishes to delivery tools, and tracks operational analytics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onKnowledge} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Create Knowledge Base</button>
              <button onClick={onStatus} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">System Status</button>
              <button onClick={onHelp} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Open Help Drawer</button>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">Operating model</p>
            <div className="mt-4 space-y-3">
              {productOutcomes.map((item) => (
                <div key={item.label} className="rounded-lg bg-surface-container-lowest p-3">
                  <p className="text-sm font-bold text-primary">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">End-to-end flow</p>
            <h4 className="mt-2 text-xl font-semibold text-on-surface">From source files to QA outputs</h4>
          </div>
          <StatusBadge status="info" label="Workflow guided" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {e2eSteps.map((step, index) => (
            <div key={step} className="relative rounded-xl border border-outline-variant bg-surface-container-low p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{index + 1}</div>
              <p className="mt-3 text-sm font-semibold text-on-surface">{step}</p>
              {index < e2eSteps.length - 1 ? <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-primary xl:block">-&gt;</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Application modules</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">What each screen is for</h4>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {moduleCards.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
                    <div>
                      <h5 className="font-semibold text-on-surface">{item.title}</h5>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.detail}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Integration architecture</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">How the platform pieces connect</h4>
          <div className="mt-5 space-y-3">
            {architectureNodes.map((node, index) => (
              <div key={node.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">{index + 1}</div>
                  {index < architectureNodes.length - 1 ? <div className="h-full min-h-6 w-px bg-outline-variant" /> : null}
                </div>
                <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <p className="text-sm font-semibold text-on-surface">{node.title}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{node.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-success">Ingestion pipeline</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">Create Knowledge Base</h4>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Ingestion creates jobs, extracts text and image context, chunks source content, writes vectors, and updates project readiness.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {['Per-file job creation', 'Text and embedded image extraction', 'Vision enrichment when images exist', 'Chunking and ChromaDB storage', 'Job status polling and retry', 'Estimated token and cost analytics'].map((item) => (
              <div key={item} className="rounded-lg bg-surface-container-low p-3 text-sm font-semibold text-on-surface">{item}</div>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs leading-5 text-warning">
            Token and cost values in ingestion are estimates because embeddings and vision usage may not always expose provider billing data.
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Generation pipeline</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">Generate Documents</h4>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Generation retrieves project knowledge, prompts the configured model, validates output quality, and publishes documents or Jira issues.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {deliverables.map(([title, detail]) => (
              <div key={title} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <p className="text-sm font-semibold text-on-surface">{title}</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">{detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs leading-5 text-primary">
            Generation token usage uses provider data when available and falls back to estimates when workflow nodes do not expose usage.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Security, governance, and cost</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-surface-container-low p-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h5 className="mt-3 font-semibold text-on-surface">Access And IP Protection</h5>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Users work within assigned projects. Secrets belong in backend credentials or environment variables, not source code or documentation.</p>
          </article>
          <article className="rounded-xl bg-surface-container-low p-4">
            <History className="h-6 w-6 text-primary" />
            <h5 className="mt-3 font-semibold text-on-surface">Auditability</h5>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Uploads, generation requests, retries, settings changes, and backend events are tracked for operational transparency.</p>
          </article>
          <article className="rounded-xl bg-surface-container-low p-4">
            <Gauge className="h-6 w-6 text-primary" />
            <h5 className="mt-3 font-semibold text-on-surface">Cost Visibility</h5>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Analytics show cost by pipeline, project, job type, and recent activity so teams can understand and optimize AI usage.</p>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-warning">Operational runbook</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">Common situations to investigate</h4>
          <div className="mt-5 divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant">
            {runbookItems.map(([title, detail]) => (
              <details key={title} className="group bg-surface-container-lowest open:bg-surface-container-low">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-on-surface hover:bg-surface-container-low">
                  <span>{title}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-6 text-on-surface-variant">{detail}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Phase 2 roadmap</p>
          <h4 className="mt-2 text-xl font-semibold text-on-surface">Planned scalability upgrades</h4>
          <div className="mt-5 space-y-3">
            {roadmap.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-lg bg-surface-container-low p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">{index + 1}</span>
                <p className="text-sm leading-6 text-on-surface-variant">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
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
      { group: 'Resources', title: 'FAQs', meta: 'Security, cost, storage, IP, usage, and investor questions', view: 'faqs' as View },
      { group: 'Delivery Intelligence', title: 'Delivery Intelligence Overview', meta: 'Extract reusable SDLC intelligence', view: 'di-overview' as View },
      { group: 'Delivery Intelligence', title: 'Project Profile', meta: 'Read synthesized internal project signals', view: 'di-profile' as View },
      { group: 'Delivery Intelligence', title: 'Onboarding Guide', meta: 'Open the generated team ramp-up guide', view: 'di-onboarding' as View },
      { group: 'Delivery Intelligence', title: 'Cross-Project Discovery', meta: 'Search solutions, technologies, and learnings', view: 'di-discovery' as View },
      { group: 'Delivery Intelligence', title: 'Solution Marketplace', meta: 'Reusable solution candidates', view: 'di-solutions' as View },
      { group: 'Delivery Intelligence', title: 'Solution Governance', meta: 'Review and publish reusable solutions', view: 'di-governance' as View },
      { group: 'Delivery Intelligence', title: 'Similarity Explorer', meta: 'Compare projects based on internal signals', view: 'di-similarity' as View },
      { group: 'Delivery Intelligence', title: 'AI Recommendations', meta: 'Accept or dismiss reuse recommendations', view: 'di-recommendations' as View },
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
      <div className="mt-5 max-h-dvh overflow-auto">
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

function NotificationDrawer({
  notifications,
  setNotifications,
  setReadNotificationIds,
  onClose,
  setView,
}: {
  notifications: NotificationEvent[]
  setNotifications: (value: SetStateAction<NotificationEvent[]>) => void
  setReadNotificationIds: (value: SetStateAction<string[]>) => void
  onClose: () => void
  setView: (view: View) => void
}) {
  const unread = notifications.filter((item) => !item.read).length
  const visibleIds = useMemo(() => new Set(notifications.map((item) => item.id)), [notifications])
  const markAll = () => {
    setNotifications((current) => current.map((item) => (visibleIds.has(item.id) ? { ...item, read: true } : item)))
    setReadNotificationIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }
  const openItem = (item: NotificationEvent) => {
    setNotifications((current) => current.map((notification) => (notification.id === item.id ? { ...notification, read: true } : notification)))
    setReadNotificationIds((current) => (current.includes(item.id) ? current : [...current, item.id]))
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
          <table className="w-full min-w-full text-left text-sm">
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

function MetricCard({ label, value, tag, tone }: { label: string; value: string | number; tag?: string; tone?: StatusTone }) {
  const labelToneClass = tone === 'success'
    ? 'text-success'
    : tone === 'error'
      ? 'text-error'
      : tone === 'warning'
        ? 'text-warning'
        : 'text-on-surface-variant'
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className={`text-xs font-bold uppercase tracking-widest ${labelToneClass}`}>{label}</p>
        {tag ? <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-normal text-primary">{tag}</span> : null}
      </div>
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

function SettingsPanel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function SettingsInput({ label, value, onChange, placeholder, disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-on-surface">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant"
      />
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

function StatusBadge({ status, label, uppercase = false }: { status: StatusTone | string; label: string; uppercase?: boolean }) {
  const cls =
    status === 'success' ? 'bg-success/10 text-success' :
    status === 'error' ? 'bg-error/10 text-error' :
    status === 'warning' ? 'bg-warning/10 text-warning' :
    'bg-primary/10 text-primary'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${uppercase ? 'uppercase tracking-wide' : 'capitalize'} ${cls}`}>{label}</span>
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
      <div className={`max-h-dvh w-full ${maxWidth} overflow-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl`} onClick={(event) => event.stopPropagation()}>
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
