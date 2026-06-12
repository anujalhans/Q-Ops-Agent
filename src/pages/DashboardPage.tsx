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
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
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
import type { LucideIcon } from 'lucide-react'
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
  fetchGenerationJobMetrics,
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
import type { AnalyticsSummary, ApiArtifact, ApiAuditEvent, ApiGeneratedDocument, ApiJobMetric, ApiProject, ApiUser, CurrentUser, DocumentArtifactKey, HealthStatus, InfrastructureLoad, IntegrationSetting, IntegrationSettingsScope, InviteUserPayload, JobStatus, ProjectAssignmentPayload, SettingsResponse, StatusTone, UpdateUserPayload } from '../lib/api'
import { useJobPolling } from '../hooks/useJobPolling'
import { useTheme } from '../theme/ThemeProvider'
import DeliveryIntelligencePage from './DeliveryIntelligencePage'
import type { DeliveryIntelligenceView } from './DeliveryIntelligencePage'

type ToastType = 'success' | 'error' | 'info'
type View = 'overview' | 'knowledge' | 'documents' | 'artifacts' | 'analytics' | 'settings' | 'docs' | 'faqs' | DeliveryIntelligenceView
type WorkspaceTab = 'knowledge' | 'documents'
type Overlay = 'search' | 'notifications' | 'help' | 'audit' | 'project' | 'status' | 'diagnostics' | 'attention' | null
type WorkReviewFocus = 'all' | 'retry' | 'coverage' | 'updates' | 'readiness' | 'admin'

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
  extractionMetrics?: ExtractionMetrics
  extractionWarnings?: string[]
  extractionWarningCount?: number
}

type ExtractionMetrics = {
  fileName?: string
  docType?: string
  fileType?: string
  chunks?: number
  words?: number
  tokens?: number
  costUsd?: number
  durationMs?: number
  fileSizeBytes?: number
  responseBytesEstimated?: number
  tables?: number
  annotations?: number
  links?: number
  visualCandidates?: number
  warnings?: number
}

type ArtifactRetryState = 'none' | 'actionable' | 'retrying' | 'recovered' | 'superseded'
type RetryDisplayStatus = 'completed' | 'needs_retry' | 'recovered' | 'retrying' | 'processing'
type ArtifactDisplayStatus = 'processed' | 'needs_retry' | 'recovered' | 'retrying' | 'processing'
type AnalyticsJobDisplayStatus = 'completed' | 'needs_retry' | 'recovered' | 'retrying' | 'processing'
type DeliverableReadinessStatus = 'idle' | 'ready' | 'warning' | 'blocked'

type DeliverableReadinessState = {
  status: DeliverableReadinessStatus
  badgeLabel: string
  badgeTone: StatusTone
  title: string
  message: string
  action: string
  details: string[]
}

type DocumentUpdateDueItem = {
  id: string
  projectName: string
  artifact: DocumentArtifactKey
  artifactLabel: string
  jobId: string
  generatedAt: string
  reasons: string[]
}

type DocumentUpdateConfirmation = {
  projectName: string
  artifact: DocumentArtifactKey
  artifactLabel: string
  previousJobId: string | null
  previousCreatedAt?: string
  knowledgeUpdated: boolean
  contextUpdated: boolean
  updateReasons: string[]
}

type IntegrationTestReadiness = {
  label: string
  configured: boolean
  missing?: string[]
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
  input?: any
  output?: any
  error?: string | null
  retriedAt?: string
  retriedByJobId?: string
  retryOfJobId?: string | null
  retryStatus?: string | null
  retryAttempt?: number
  generationMode?: 'create' | 'update' | 'retry'
  updateOfJobId?: string | null
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
  extractionWarnings?: string[]
  extractionWarningCount?: number
  extractionObservability?: Record<string, any>
  extractionMetrics?: ExtractionMetrics
  retriedAt?: string
  retriedByJobIds?: string[]
  retryOfJobId?: string | null
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
  { key: 'traceability_matrix', label: 'Requirement Traceability Matrix', description: 'Trace requirements to generated Epics, User Stories, and Story Test Cases.' },
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

function compactGeneratedOutputForCache(item: any) {
  const output = item?.output && typeof item.output === 'object' ? item.output : null
  if (!output) return item
  const documentType = normalizedDocumentType(item.documentType || output.documentType || output.document_type)
  if (documentType !== 'story_test_cases') return item

  const compactCoverageSummary = output.coverageSummary
    ? {
        status: output.coverageSummary.status,
        gateStatus: output.coverageSummary.gateStatus,
        total: output.coverageSummary.total,
        coverageLedgerCount: output.coverageSummary.coverageLedgerCount,
        covered: output.coverageSummary.covered,
        coveredCount: output.coverageSummary.coveredCount,
        partial: output.coverageSummary.partial,
        partialCount: output.coverageSummary.partialCount,
        missing: output.coverageSummary.missing,
        missingCount: output.coverageSummary.missingCount,
        score: output.coverageSummary.score,
      }
    : null
  const compactUpdateSummary = output.updateSummary
    ? {
        enabled: output.updateSummary.enabled,
        version: output.updateSummary.version,
        mode: output.updateSummary.mode,
        gateStatus: output.updateSummary.gateStatus,
        terminalStatus: output.updateSummary.terminalStatus,
        sourceStoryCount: output.updateSummary.sourceStoryCount,
        storyScopeCount: output.updateSummary.storyScopeCount,
        coveredStoryCount: output.updateSummary.coveredStoryCount,
        partialStoryCount: output.updateSummary.partialStoryCount,
        missingStoryCount: output.updateSummary.missingStoryCount,
        createdTestCaseCount: output.updateSummary.createdTestCaseCount,
        updatedTestCaseCount: output.updateSummary.updatedTestCaseCount,
        reusedTestCaseCount: output.updateSummary.reusedTestCaseCount,
        testCaseCount: output.updateSummary.testCaseCount,
        mappingCount: output.updateSummary.mappingCount,
        tokenSavings: output.updateSummary.tokenSavings,
        message: output.updateSummary.message,
      }
    : null
  const compactCoverageLedger = Array.isArray(output.coverageLedger)
    ? output.coverageLedger.map((row: any) => ({
        storyKey: row?.storyKey || row?.jiraStoryKey || row?.module || '',
        jiraStoryKey: row?.jiraStoryKey || row?.storyKey || '',
        storySummary: row?.storySummary || row?.requirement || row?.moduleRequirement || row?.title || '',
        requirement: row?.requirement || row?.moduleRequirement || row?.storySummary || '',
        coverageStatus: row?.coverageStatus || row?.status || 'covered',
        status: row?.status || row?.coverageStatus || 'covered',
        generatedTestCases: row?.generatedTestCases,
        plannedTestCases: row?.plannedTestCases,
        mappingCount: row?.mappingCount,
        linkedTestCases: row?.linkedTestCases,
        testcaseKeys: Array.isArray(row?.testcaseKeys) ? row.testcaseKeys : [],
        missingCategories: Array.isArray(row?.missingCategories) ? row.missingCategories : [],
        coveredCategories: Array.isArray(row?.coveredCategories) ? row.coveredCategories : [],
        categoriesCovered: Array.isArray(row?.categoriesCovered) ? row.categoriesCovered : [],
        notes: row?.notes || '',
        source: row?.source || '',
        sourceReference: row?.sourceReference || '',
      }))
    : []

  return {
    ...item,
    output: {
      documentType: output.documentType || 'story_test_cases',
      destination: output.destination,
      generationMode: output.generationMode,
      updateOfJobId: output.updateOfJobId,
      retryOfJobId: output.retryOfJobId,
      sourceUserStoryJobId: output.sourceUserStoryJobId,
      progress: output.progress,
      coverageSummary: compactCoverageSummary,
      coverageLedger: compactCoverageLedger,
      batchSummary: output.batchSummary
        ? {
            totalBatches: output.batchSummary.totalBatches,
            completedBatches: output.batchSummary.completedBatches,
            partialBatches: output.batchSummary.partialBatches,
            missingBatches: output.batchSummary.missingBatches,
          }
        : null,
      updateSummary: compactUpdateSummary,
      tokenUsage: output.tokenUsage,
      tokenSavings: output.tokenSavings,
      jira: output.jira,
      wordCount: output.wordCount,
      tokensInput: output.tokensInput,
      tokensOutput: output.tokensOutput,
      tokensTotal: output.tokensTotal,
      estimatedCostUsd: output.estimatedCostUsd,
      terminalStatus: output.terminalStatus,
      error: output.error,
      requiresCoverageRepair: output.requiresCoverageRepair,
      repairTargets: Array.isArray(output.repairTargets) ? output.repairTargets.slice(0, 12) : [],
      publishGaps: Array.isArray(output.publishGaps) ? output.publishGaps.slice(0, 12) : [],
      patchVersion: output.patchVersion,
      cacheCompacted: true,
    },
  }
}

function compactPersistentValueForStorage<T>(key: string, value: T): T {
  if (key !== 'qops-agent-generated-outputs' || !Array.isArray(value)) return value
  return value.map(compactGeneratedOutputForCache) as T
}

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
    try {
      localStorage.setItem(key, JSON.stringify(compactPersistentValueForStorage(key, value)))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          localStorage.removeItem(key)
        } catch {
          // Browser cache is best-effort; Supabase remains the source of truth.
        }
      }
    }
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

function formatUsageCurrency(value?: number, maximumFractionDigits = 4) {
  const numeric = Number(value) || 0
  if (numeric > 0 && numeric < 0.0001) {
    return formatCurrency(numeric, 6)
  }
  return formatCurrency(numeric, maximumFractionDigits)
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
    traceability_matrix: 'Requirement Traceability Matrix',
  }
  if (backendLabels[value]) return backendLabels[value]
  const known = artifactOptions.find((item) => item.key === value || item.key === value.replace(/^test_/, '') || item.label.toLowerCase() === value.toLowerCase())
  if (known) return known.label
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizedDocumentType(value?: string) {
  return String(value || '').trim().toLowerCase()
}

function isSharedConfluenceDocumentType(value?: string) {
  return ['test_strategy', 'test_plan', 'risk_matrix'].includes(normalizedDocumentType(value))
}

function isCoverageMapDocumentType(value?: string) {
  return [...['test_strategy', 'test_plan', 'risk_matrix'], 'user_stories'].includes(normalizedDocumentType(value))
}

function sharedCoveragePresentationLabels(value?: string) {
  const type = normalizedDocumentType(value)
  if (type === 'test_strategy') {
    return {
      mapTitle: 'Strategy coverage map',
      itemLabel: 'Strategy coverage item',
      sectionLabel: 'Covered in strategy section',
      rationaleLabel: 'Strategic rationale',
    }
  }
  if (type === 'test_plan') {
    return {
      mapTitle: 'Test plan coverage map',
      itemLabel: 'Plan coverage item',
      sectionLabel: 'Covered in test plan section',
      rationaleLabel: 'Execution rationale',
    }
  }
  if (type === 'risk_matrix') {
    return {
      mapTitle: 'Risk coverage map',
      itemLabel: 'Risk coverage item',
      sectionLabel: 'Covered in risk matrix section',
      rationaleLabel: 'Risk rationale',
    }
  }
  if (type === 'user_stories') {
    return {
      mapTitle: 'Backlog coverage map',
      itemLabel: 'Backlog coverage item',
      sectionLabel: 'Mapped Jira epics and stories',
      rationaleLabel: 'Coverage rationale',
    }
  }
  return {
    mapTitle: 'Coverage map',
    itemLabel: 'Coverage item',
    sectionLabel: 'Covered in document section',
    rationaleLabel: 'Coverage rationale',
  }
}

function coveredDocumentSections(value?: string) {
  const cleaned = String(value || '')
    .replace(/^included(?:\s+in|:)?\s*/i, '')
    .replace(/^covered(?:\s+in|:)?\s*/i, '')
    .trim()
  if (/^(yes|no|true|false)$/i.test(cleaned)) return []
  if (!cleaned) return []
  const seen = new Set<string>()
  return cleaned
    .split(/\s*(?:,|;|\|)\s*/)
    .map((part) => part.trim().replace(/\s{2,}/g, ' '))
    .filter((part) => {
      const key = part.toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function coverageDocumentTargets(row: Record<string, any>, documentType?: string) {
  const directSections = coveredDocumentSections(row.includedInOutput || row.included || '')
  if (directSections.length) return directSections

  const type = normalizedDocumentType(documentType)
  if (type === 'user_stories') {
    const jiraMappings = [
      ...(Array.isArray(row.mappedEpicIds) ? row.mappedEpicIds : []),
      ...(Array.isArray(row.mappedEpicMatches) ? row.mappedEpicMatches : []),
      ...(Array.isArray(row.mappedStoryIds) ? row.mappedStoryIds : []),
      ...(Array.isArray(row.mappedStoryMatches) ? row.mappedStoryMatches : []),
    ]
    const normalized = jiraMappings
      .map((value) => String(value || '').trim())
      .filter(Boolean)
    if (normalized.length) return [...new Set(normalized)].slice(0, 8)
  }

  const notes = String(row.notes || '').trim()
  if (type === 'risk_matrix') {
    const riskIds = Array.from(new Set(notes.match(/\bR\d{3,}\b/gi) || []))
    if (riskIds.length) return riskIds.map((riskId) => `Risk ${riskId.toUpperCase()}`)
    const coveredIn = notes.match(/covered\s+in\s+([^.;]+)/i)?.[1]?.trim()
    if (coveredIn) return coveredDocumentSections(coveredIn).map((item) => /^R\d{3,}$/i.test(item) ? `Risk ${item.toUpperCase()}` : item)
  }

  return []
}

function normalizeCoverageMappingKey(value?: string) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function buildBacklogJiraKeyLookup(output?: any) {
  const lookup = new Map<string, string>()
  const add = (candidate: unknown, jiraKey: unknown) => {
    const normalized = normalizeCoverageMappingKey(String(candidate || ''))
    const key = String(jiraKey || '').trim()
    if (normalized && key) lookup.set(normalized, key)
  }
  const epics = Array.isArray(output?.epics) ? output.epics : []
  const stories = Array.isArray(output?.stories) ? output.stories : []
  epics.forEach((epic: any) => {
    const jiraKey = epic?.jiraEpicKey || epic?.epicKey || epic?.key
    add(jiraKey, jiraKey)
    add(epic?.epicCorrelationId, jiraKey)
    add(epic?.epicId, jiraKey)
    add(epic?.stableLabel, jiraKey)
    add(epic?.epicName, jiraKey)
  })
  stories.forEach((story: any) => {
    const jiraKey = story?.jiraStoryKey || story?.storyKey || story?.key
    add(jiraKey, jiraKey)
    add(story?.storyCorrelationId, jiraKey)
    add(story?.userStoryId, jiraKey)
    add(story?.storyId, jiraKey)
    add(story?.stableLabel, jiraKey)
    add(story?.summary, jiraKey)
  })
  return lookup
}

function resolveBacklogCoverageTargets(row: Record<string, any>, lookup: Map<string, string>) {
  const rawMappings = [
    ...(Array.isArray(row.mappedEpicIds) ? row.mappedEpicIds : []),
    ...(Array.isArray(row.mappedEpicMatches) ? row.mappedEpicMatches : []),
    ...(Array.isArray(row.mappedStoryIds) ? row.mappedStoryIds : []),
    ...(Array.isArray(row.mappedStoryMatches) ? row.mappedStoryMatches : []),
  ]
  const resolved = rawMappings
    .map((value) => {
      const raw = String(value || '').trim()
      return lookup.get(normalizeCoverageMappingKey(raw)) || raw
    })
    .filter(Boolean)
  return [...new Set(resolved)].slice(0, 10)
}

function coverageEvidenceSummary(value?: string) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const withoutTechnicalIds = raw
    .replace(/\bchunkId\s*:\s*[a-f0-9-]{12,}\b/gi, '')
    .replace(/\b[a-f0-9]{8}-[a-f0-9-]{20,}\b/gi, '')
    .replace(/\|\s*\d+\s*\|\s*\d+\s*\|\s*text\b/gi, '')
    .replace(/\s*\|\s*/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+-\s+$/g, '')
    .trim()
  const readable = readableCoverageSourceReference(withoutTechnicalIds)
  return readable || withoutTechnicalIds
}

function outputUrl(value: any) {
  const confluenceLink = value?.confluence?._links?.base && value?.confluence?._links?.webui
    ? `${value.confluence._links.base}${value.confluence._links.webui}`
    : undefined
  return [
    value?.url,
    value?.documentUrl,
    value?.document_url,
    value?.pageUrl,
    value?.page_url,
    value?.confluenceUrl,
    value?.confluence_url,
    value?.confluencePageUrl,
    value?.confluence_page_url,
    value?.link,
    value?.confluence?.url,
    value?.confluence?.pageUrl,
    value?.confluence?.page_url,
    value?.confluence?.webUrl,
    value?.confluence?.web_url,
    value?.confluence?.webui,
    confluenceLink,
    value?.confluence?._links?.webui,
    value?.destination?.url,
    value?.destination?.confluenceUrl,
    value?.destination?.confluence_url,
    value?.destination?.pageUrl,
    value?.destination?.page_url,
    value?.destination?.confluence?.url,
    value?.document?.url,
    value?.document?.pageUrl,
    value?.document?.confluenceUrl,
  ].map((candidate) => typeof candidate === 'string' ? candidate.trim() : '').find(Boolean)
}

function mergeGeneratedOutputContext(primary?: any, supplemental?: any) {
  if (!primary || typeof primary !== 'object') return supplemental
  if (!supplemental || typeof supplemental !== 'object') return primary
  return {
    ...supplemental,
    ...primary,
    traceabilityContext: primary.traceabilityContext || supplemental.traceabilityContext,
    storiesWithoutTestCases: primary.storiesWithoutTestCases || supplemental.storiesWithoutTestCases,
  }
}

type JobProgress = {
  stage?: string
  stageLabel?: string
  group?: string
  summary?: string
  progressPercent?: number
  updatedAt?: string
  details?: Record<string, any>
  currentBatch?: string
  totalBatches?: number
  completedBatches?: number
  retryingBatches?: number
  batches?: Array<Record<string, any>>
}

type JobCoverageSummary = {
  status?: string
  gateStatus?: string
  total?: number
  coverageLedgerCount?: number
  covered?: number
  coveredCount?: number
  partial?: number
  partialCount?: number
  missing?: number
  missingCount?: number
  recovered?: number
  recoveredCount?: number
  excluded?: number
  excludedCount?: number
  missingItems?: Array<Record<string, any>>
  recoveredItems?: Array<Record<string, any>>
}

function firstObject(...values: any[]) {
  return values.find((value) => value && typeof value === 'object' && !Array.isArray(value)) || null
}

function progressTimestamp(value?: any) {
  const raw = value?.updatedAt || value?.updated_at || value?.capturedAt || value?.captured_at || value?.timestamp
  const time = raw ? new Date(raw).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function progressPercentValue(value?: any) {
  const number = Number(value?.progressPercent ?? value?.progress_percent ?? value?.percent ?? value?.percentage)
  return Number.isFinite(number) ? number : 0
}

function jobProgressFrom(value?: any): JobProgress | null {
  const candidates = [
    value?.progress,
    value?.jobProgress,
    value?.job_progress,
    value?.progressOutput?.progress,
    value?.progress_output?.progress,
    value?.usageCheckpoint?.progress,
    value?.usage_checkpoint?.progress,
    value?.output?.progress,
    value?.output?.jobProgress,
    value?.output?.job_progress,
    value?.output?.progressOutput?.progress,
    value?.output?.progress_output?.progress,
    value?.output?.usageCheckpoint?.progress,
    value?.output?.usage_checkpoint?.progress,
    value?.qualityGate?.progress,
  ].filter((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate))
  const progress = candidates.reduce((best, candidate) => {
    if (!best) return candidate
    const bestTime = progressTimestamp(best)
    const candidateTime = progressTimestamp(candidate)
    const bestPercent = progressPercentValue(best)
    const candidatePercent = progressPercentValue(candidate)
    if (candidateTime && candidateTime > bestTime) return candidate
    if (candidateTime === bestTime && candidatePercent > bestPercent) return candidate
    if (!candidateTime && !bestTime && Number(candidate?.progressPercent || 0) > Number(best?.progressPercent || 0)) return candidate
    return best
  }, null as any)
  return progress as JobProgress | null
}

function batchSummaryFrom(value?: any) {
  const batchSummary = firstObject(
    value?.batchSummary,
    value?.batch_summary,
    value?.updateSummary?.batchSummary,
    value?.update_summary?.batch_summary,
    value?.progress?.batchSummary,
    value?.progress?.batch_summary,
    value?.qualityGate?.batchSummary,
    value?.qualityGate?.updateSummary?.batchSummary,
    value?.output?.batchSummary,
    value?.output?.batch_summary,
    value?.output?.updateSummary?.batchSummary,
    value?.output?.update_summary?.batch_summary,
    value?.output?.qualityGate?.batchSummary,
    value?.output?.qualityGate?.updateSummary?.batchSummary,
  )
  const batchPlan = firstObject(value?.batchPlan, value?.batch_plan, value?.output?.batchPlan, value?.output?.batch_plan)
  const batches = Array.isArray(batchSummary?.batches)
    ? batchSummary.batches
    : Array.isArray(batchPlan?.modules)
      ? batchPlan.modules
      : Array.isArray(value?.progress?.batches)
        ? value.progress.batches
        : []
  return { ...(batchSummary || {}), batches }
}

function coverageLedgerFrom(value?: any) {
  const candidates = [
    value?.coverageLedger,
    value?.coverage_ledger,
    value?.qualityGate?.coverageLedger,
    value?.qualityGate?.coverage_ledger,
    value?.output?.coverageLedger,
    value?.output?.coverage_ledger,
    value?.output?.qualityGate?.coverageLedger,
    value?.output?.qualityGate?.coverage_ledger,
  ]
  return candidates.find((candidate) => Array.isArray(candidate)) || []
}

function coverageSummaryFrom(value?: any): JobCoverageSummary | null {
  const coverage = firstObject(
    value?.coverageSummary,
    value?.coverage_summary,
    value?.qualityGate?.coverageSummary,
    value?.qualityGate?.coverage_summary,
    value?.output?.coverageSummary,
    value?.output?.coverage_summary,
    value?.output?.qualityGate?.coverageSummary,
  )
  return coverage as JobCoverageSummary | null
}

function readableCoverageSourceReference(value?: string) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const parts = raw.split('|').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const meaningfulParts = parts.filter((part) => {
      if (/^blob$/i.test(part)) return false
      if (/^text$/i.test(part)) return false
      if (/^\d+$/.test(part)) return false
      if (/^[a-f0-9]{8}-[a-f0-9-]{20,}$/i.test(part)) return false
      return true
    })
    const docType = meaningfulParts.find((part) => /^[A-Z][A-Z0-9_ -]{2,}$/.test(part)) || meaningfulParts[0]
    const section = meaningfulParts.find((part) => /^section\b/i.test(part) || /criteria|guidance|requirements?/i.test(part))
    const label = [docType, section && section !== docType ? section : ''].filter(Boolean).join(' - ')
    if (label) return label
  }
  return raw
    .replace(/\b[a-f0-9]{8}-[a-f0-9-]{20,}(?:\|\d+)*\|?text?\b/gi, '')
    .replace(/\s*\|\s*/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function buildRtmTraceabilityLayers(output?: any, jobRecord?: GeneratedOutput | null, relatedOutputs: GeneratedOutput[] = []) {
  const documentType = String(output?.documentType || jobRecord?.documentType || '').toLowerCase()
  if (documentType !== 'traceability_matrix') {
    return { requirementRows: [], storyRows: [], epicCount: 0, storyCount: 0 }
  }
  const projectName = String(jobRecord?.projectName || output?.projectName || output?.destination?.projectName || '').trim().toLowerCase()
  if (!projectName) return { requirementRows: [], storyRows: [], epicCount: 0, storyCount: 0 }

  const projectOutputs = relatedOutputs.filter((item) => item.projectName.trim().toLowerCase() === projectName && item.status === 'completed')
  const backlog = latestCompletedOutputForArtifact(jobRecord?.projectName || output?.projectName || '', 'epicsAndStories', projectOutputs)
  const storyTestCases = latestCompletedOutputForArtifact(jobRecord?.projectName || output?.projectName || '', 'testCases', projectOutputs)
  const backlogOutput = backlog?.output || {}
  const stcOutput = storyTestCases?.output || {}
  const epics = Array.isArray(backlogOutput.epics) ? backlogOutput.epics : []
  const stories = Array.isArray(backlogOutput.stories) ? backlogOutput.stories : []
  const testCases = Array.isArray(stcOutput.testCases) ? stcOutput.testCases : []
  const stcLedger = coverageLedgerFrom(stcOutput)
  const coverageLedger = coverageLedgerFrom(output)

  const epicKeyFrom = (epic: any) => String(epic?.jiraEpicKey || epic?.epicKey || epic?.key || '').trim()
  const storyKeyFrom = (story: any) => String(story?.storyKey || story?.jiraStoryKey || story?.key || '').trim()
  const storyParentEpicKeyFrom = (story: any) => String(story?.parentEpicKey || story?.epicKey || story?.jiraEpicKey || '').trim()
  const epicByKey = new Map<string, any>()
  epics.forEach((epic: any) => {
    const key = epicKeyFrom(epic)
    if (key) epicByKey.set(key, epic)
  })
  const storyByKey = new Map<string, any>()
  stories.forEach((story: any) => {
    const key = storyKeyFrom(story)
    if (key) storyByKey.set(key, story)
  })

  const storiesByEpic = new Map<string, any[]>()
  stories.forEach((story: any) => {
    const key = storyParentEpicKeyFrom(story)
    if (!key) return
    const current = storiesByEpic.get(key) || []
    current.push(story)
    storiesByEpic.set(key, current)
  })

  const testCasesByStory = new Map<string, any[]>()
  testCases.forEach((testCase: any) => {
    const key = String(testCase.storyKey || '').trim()
    if (!key) return
    const current = testCasesByStory.get(key) || []
    current.push(testCase)
    testCasesByStory.set(key, current)
  })

  const ledgerByStory = new Map<string, any>()
  stcLedger.forEach((row: any) => {
    const key = String(row.storyKey || row.module || '').trim()
    if (key) ledgerByStory.set(key, row)
  })

  const requirementRows = coverageLedger.map((row: any, index: number) => {
    const title = String(row.moduleRequirement || row.requirement || row.module || row.coverageId || `Requirement ${index + 1}`).trim()
    const explicitKeys = extractJiraKeys(`${row.notes || ''} ${row.includedInOutput || ''}`)
    const explicitEpicKeys = explicitKeys.filter((key) => epicByKey.has(key))
    const explicitStoryKeys = explicitKeys.filter((key) => storyByKey.has(key))
    const explicitlyMatchedStories = explicitStoryKeys
      .map((key) => storyByKey.get(key))
      .filter(Boolean)
    const normalizedTitle = normalizeTraceText(title)
    const explicitParentEpicKey = explicitlyMatchedStories
      .map((story: any) => storyParentEpicKeyFrom(story))
      .find((key) => epicByKey.has(key))
    const matchedEpic = (explicitEpicKeys[0] ? epicByKey.get(explicitEpicKeys[0]) : null)
      || (explicitParentEpicKey ? epicByKey.get(explicitParentEpicKey) : null)
      || epics.find((epic: any) => {
        const epicName = normalizeTraceText(epic.epicName || epic.name || epic.summary)
        return epicName && (normalizedTitle.includes(epicName) || epicName.includes(normalizedTitle))
      })
      || null
    const epicKey = String(matchedEpic ? epicKeyFrom(matchedEpic) : '').trim()
    const epicStories = epicKey ? (storiesByEpic.get(epicKey) || []) : []
    const matchedStories = epicStories.length ? epicStories : explicitlyMatchedStories
    const explicitStoryKeySet = new Set(explicitStoryKeys)
    return {
      id: String(row.coverageId || `RTM-${index + 1}`).trim(),
      title,
      status: String(row.coverageStatus || row.status || 'covered').trim().toLowerCase(),
      epicKey,
      epicName: String(matchedEpic?.epicName || matchedEpic?.name || '').trim(),
      storyCount: matchedStories.length,
      storyKeys: matchedStories.map((story: any) => String(story.storyKey || '').trim()).filter(Boolean),
      explicitStoryKeys: matchedStories
        .map((story: any) => storyKeyFrom(story))
        .filter((key) => explicitStoryKeySet.has(key)),
      sourceReference: String(row.sourceReference || '').trim(),
      notes: String(row.notes || '').trim(),
    }
  })

  const storyRows = stories.map((story: any) => {
    const storyKey = storyKeyFrom(story)
    const linkedTestCases = testCasesByStory.get(storyKey) || []
    const ledger = ledgerByStory.get(storyKey)
    const categories = normalizeCategoryLabels(linkedTestCases.map((testCase: any) => testCase.coverageCategory || testCase.testCategory))
    const testCaseKeys = linkedTestCases
      .map((testCase: any) => String(testCase.testcaseKey || testCase.testCaseKey || testCase.key || '').trim())
      .filter(Boolean)
    return {
      storyKey,
      storySummary: String(story.summary || story.storySummary || '').trim(),
      epicKey: storyParentEpicKeyFrom(story),
      testCaseCount: linkedTestCases.length || Number(ledger?.generatedTestCases || ledger?.mappingCount || 0) || 0,
      testCaseKeys,
      categories: categories.slice(0, 6),
      status: String(ledger?.coverageStatus || ledger?.status || (linkedTestCases.length ? 'covered' : 'missing')).toLowerCase(),
    }
  }).filter((row: any) => row.storyKey)

  return {
    requirementRows,
    storyRows,
    epicCount: epics.length,
    storyCount: stories.length || storyRows.length,
  }
}

function coverageStatusLabel(coverage?: JobCoverageSummary | null) {
  const status = String(coverage?.status || coverage?.gateStatus || '').trim().toLowerCase()
  if (!status) return ''
  if (status === 'passed') return 'Coverage passed'
  if (status === 'warning' || status === 'passed_with_warnings') return 'Coverage needs review'
  if (status === 'retrying') return 'Filling missing coverage'
  if (status === 'failed') return 'Coverage incomplete'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function coverageCounts(coverage?: JobCoverageSummary | null) {
  const total = Number(coverage?.total ?? coverage?.coverageLedgerCount ?? 0) || 0
  const covered = Number(coverage?.covered ?? coverage?.coveredCount ?? 0) || 0
  const partial = Number(coverage?.partial ?? coverage?.partialCount ?? 0) || 0
  const missing = Number(coverage?.missing ?? coverage?.missingCount ?? 0) || 0
  const recovered = Number(coverage?.recovered ?? coverage?.recoveredCount ?? 0) || 0
  const excluded = Number(coverage?.excluded ?? coverage?.excludedCount ?? 0) || 0
  return { total, covered, partial, missing, recovered, excluded }
}

function coverageScorePercent(coverage?: JobCoverageSummary | null) {
  if (!coverage) return null
  const dynamicCoverage = coverage as Record<string, any>
  const counts = coverageCounts(coverage)
  const denominator = counts.total || counts.covered + counts.partial + counts.missing + counts.recovered + counts.excluded
  if (denominator) {
    const numerator = counts.covered + counts.recovered + counts.excluded + counts.partial * 0.5
    return clampPercent((numerator / denominator) * 100)
  }
  const explicit = Number(dynamicCoverage.score ?? dynamicCoverage.coverageScore ?? dynamicCoverage.coverage_score)
  if (Number.isFinite(explicit)) return clampPercent(explicit)
  return null
}

function coverageVerdict(coverage?: JobCoverageSummary | null) {
  const counts = coverageCounts(coverage)
  const rawStatus = String(coverage?.gateStatus || coverage?.status || '').trim().toLowerCase()
  const parsedCount = counts.total || counts.covered || counts.partial || counts.missing || counts.recovered || counts.excluded
  const completedCount = counts.covered + counts.recovered + counts.excluded

  if (!coverage) {
    return {
      tone: 'success' as StatusTone,
      label: 'Coverage not recorded',
      title: 'Coverage details unavailable',
      summary: 'No coverage review metadata was recorded for this output.',
      parsed: false,
      needsReview: false,
    }
  }

  if (counts.missing || rawStatus === 'failed') {
    return {
      tone: 'error' as StatusTone,
      label: 'Coverage incomplete',
      title: `${counts.missing || 'Some'} coverage item${counts.missing === 1 ? '' : 's'} missing`,
      summary: 'Q-Ops found coverage gaps that should be resolved before sign-off.',
      parsed: true,
      needsReview: true,
    }
  }

  if (counts.partial) {
    return {
      tone: 'warning' as StatusTone,
      label: 'Coverage needs review',
      title: `${counts.partial} coverage item${counts.partial === 1 ? '' : 's'} need review`,
      summary: 'Q-Ops completed generation, but at least one coverage row needs human review before sign-off.',
      parsed: true,
      needsReview: true,
    }
  }

  if (counts.total && completedCount >= counts.total) {
    return {
      tone: 'success' as StatusTone,
      label: 'Coverage passed',
      title: 'Coverage looks complete',
      summary: `${completedCount} of ${counts.total} parsed coverage item${counts.total === 1 ? '' : 's'} are covered.`,
      parsed: true,
      needsReview: false,
    }
  }

  if (rawStatus.includes('warning') && !parsedCount) {
    return {
      tone: 'warning' as StatusTone,
      label: 'Coverage summary unavailable',
      title: 'Coverage metadata was not parsed',
      summary: 'Q-Ops could not parse coverage ledger metadata for this update. Review the generated document before sign-off.',
      parsed: false,
      needsReview: true,
    }
  }

  if (rawStatus === 'passed') {
    return {
      tone: 'success' as StatusTone,
      label: 'Coverage passed',
      title: 'Coverage passed',
      summary: counts.covered ? `${counts.covered} coverage item${counts.covered === 1 ? '' : 's'} are covered.` : 'Q-Ops marked this output coverage as passed.',
      parsed: Boolean(parsedCount),
      needsReview: false,
    }
  }

  return {
    tone: 'success' as StatusTone,
    label: coverageStatusLabel(coverage) || 'Coverage recorded',
    title: coverageStatusLabel(coverage) || 'Coverage recorded',
    summary: parsedCount ? 'Coverage metadata was recorded for this output.' : 'No actionable coverage issue was recorded.',
    parsed: Boolean(parsedCount),
    needsReview: false,
  }
}

function coverageToneFromOutput(output?: any): StatusTone {
  const coverage = coverageSummaryFrom(output)
  return coverageVerdict(coverage).tone
}

function uniqueNonEmptyList(values: unknown) {
  if (!Array.isArray(values)) return []
  const seen = new Set<string>()
  return values
    .map((value) => String(value || '').trim())
    .filter((value) => {
      const key = value.toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function normalizeCategoryLabels(values: unknown) {
  const rawValues = Array.isArray(values) ? values : values ? [values] : []
  const seen = new Set<string>()
  return rawValues
    .flatMap((value) => String(value || '').split(/\s*\|\s*/))
    .map((value) => value.trim())
    .filter((value) => {
      const key = value.toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function normalizeTraceText(value?: string | null) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function extractJiraKeys(value?: string | null) {
  return Array.from(new Set(String(value || '').match(/\b[A-Z][A-Z0-9]+-\d+\b/g) || []))
}

function finalValidationFrom(value?: any) {
  return firstObject(
    value?.finalValidation,
    value?.final_validation,
    value?.metadata?.finalValidation,
    value?.metadata?.final_validation,
    value?.diagnostics?.finalValidation,
    value?.diagnostics?.final_validation,
    value?.output?.finalValidation,
    value?.output?.final_validation,
    value?.output?.metadata?.final_validation,
  )
}

function validationIssueCode(issue: any) {
  return String(issue?.code || issue?.type || issue?.issueCode || issue?.issue_code || '').trim().toLowerCase()
}

function isInternalSectionRepairIssue(issue: any) {
  const code = validationIssueCode(issue)
  return [
    'required_section_repaired',
    'section_repaired',
    'required_section_added',
    'required_section_normalized',
  ].includes(code)
}

function hasPublishedDocumentDestination(value?: any) {
  if (outputUrl(value)) return true
  return Boolean(
    value?.confluencePageId
    || value?.confluence_page_id
    || value?.pageId
    || value?.page_id
    || value?.confluence?.pageId
    || value?.confluence?.page_id
    || value?.confluence?.id
    || value?.destination?.confluencePageId
    || value?.destination?.confluence_page_id
    || value?.document?.confluencePageId
  )
}

function validationIssueTitle(issue: any, index: number) {
  const raw = String(issue?.code || issue?.type || issue?.issueCode || issue?.issue_code || `Issue ${index + 1}`).trim()
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function validationIssueMessage(issue: any) {
  if (!issue || typeof issue !== 'object') return String(issue || 'Review generated document structure.').trim()
  const section = String(issue.section || issue.sectionName || issue.section_name || issue.title || '').trim()
  const message = String(issue.message || issue.detail || issue.description || issue.summary || '').trim()
  if (isInternalSectionRepairIssue(issue) && section) {
    return `${section} was repaired before publishing.`
  }
  if (message && message !== '[object Object]') return message
  const details = firstObject(issue.details, issue.metadata, issue.context)
  const detailMessage = String(details?.message || details?.detail || details?.description || '').trim()
  if (detailMessage && detailMessage !== '[object Object]') return detailMessage
  if (section) return section
  try {
    const compact = JSON.stringify(issue)
    return compact && compact !== '{}' ? compact : 'Review generated document structure.'
  } catch {
    return 'Review generated document structure.'
  }
}

function finalValidationVerdict(value?: any) {
  const validation = finalValidationFrom(value)
  if (!validation) return null
  const status = String(validation.status || validation.finalStatus || '').trim().toLowerCase()
  const structuralStatus = String(validation.structuralStatus || validation.structureStatus || '').trim().toLowerCase()
  const issues = Array.isArray(validation.issues) ? validation.issues : []
  const blockingIssues = issues.filter((issue: any) => !isInternalSectionRepairIssue(issue))
  const issueCount = issues.length
  const blockingIssueCount = blockingIssues.length
  const internalRepairOnly = issueCount > 0 && blockingIssueCount === 0
  const published = hasPublishedDocumentDestination(value)

  if (
    published
    && internalRepairOnly
    && status !== 'failed'
    && structuralStatus !== 'failed'
  ) {
    return {
      validation,
      displayIssues: [],
      tone: 'success' as StatusTone,
      label: 'Validation passed',
      title: 'Document is publish-ready',
      summary: 'Q-Ops confirmed the final Confluence content is publish-safe and structurally complete.',
      needsReview: false,
    }
  }

  if (status === 'failed' || structuralStatus === 'failed' || blockingIssueCount) {
    return {
      validation,
      displayIssues: blockingIssues.length ? blockingIssues : issues,
      tone: 'error' as StatusTone,
      label: 'Admin review',
      title: 'Document check needs support review',
      summary: blockingIssueCount
        ? `${blockingIssueCount} publish-safety issue${blockingIssueCount === 1 ? '' : 's'} were recorded for support review.`
        : 'Q-Ops could not confirm the final document structure after generation.',
      needsReview: true,
    }
  }

  if (status === 'warning' || structuralStatus === 'repaired' || structuralStatus === 'warning') {
    return {
      validation,
      displayIssues: blockingIssues,
      tone: 'warning' as StatusTone,
      label: 'Review advised',
      title: internalRepairOnly ? 'Document completed with internal repairs' : 'Document completed with review notes',
      summary: internalRepairOnly
        ? 'Q-Ops completed the document after repairing required sections. Review the final document when convenient.'
        : 'Q-Ops completed the document and recorded a warning note. Review it before final sign-off.',
      needsReview: !internalRepairOnly,
    }
  }

  return {
    validation,
    displayIssues: [],
    tone: 'success' as StatusTone,
    label: status === 'passed' || structuralStatus === 'passed' ? 'Validation passed' : 'Document check recorded',
    title: 'Document is publish-ready',
    summary: 'Q-Ops confirmed the final Confluence content is publish-safe and structurally complete.',
    needsReview: false,
  }
}

function hasDocumentValidationReview(output?: any) {
  return Boolean(finalValidationVerdict(output)?.needsReview)
}

function documentOutputTone(output?: any): StatusTone {
  const validation = finalValidationVerdict(output)
  if (validation?.tone === 'error') return 'error'
  if (validation?.tone === 'warning') return 'warning'
  return coverageToneFromOutput(output)
}

function generationModeFrom(output?: any, jobRecord?: Pick<GeneratedOutput, 'generationMode' | 'updateOfJobId'> | null) {
  const raw = String(jobRecord?.generationMode || output?.generationMode || output?.metadata?.generation_mode || '').trim().toLowerCase()
  if (raw === 'update' || jobRecord?.updateOfJobId || output?.updateOfJobId || output?.updateContext?.previousJobId) return 'update'
  if (String(output?.confluence?.action || '').trim().toLowerCase() === 'updated') return 'update'
  if (raw === 'retry') return 'retry'
  if (raw === 'create') return 'create'
  return ''
}

function itemActionSummary(items: any[] = []) {
  return items.reduce((summary, item) => {
    const action = String(item?.action || item?.operation || item?.status || '').trim().toLowerCase()
    if (['create', 'created', 'added', 'new'].includes(action)) summary.created += 1
    else if (['update', 'updated', 'patched', 'modified'].includes(action)) summary.updated += 1
    else if (['reuse', 'reused', 'existing', 'unchanged', 'no_change', 'skipped'].includes(action)) summary.reused += 1
    else if (['remove', 'removed', 'delete', 'deleted', 'obsolete', 'deprecated'].includes(action)) summary.removed += 1
    return summary
  }, { created: 0, updated: 0, reused: 0, removed: 0 })
}

function compactList(values: unknown, limit = 4) {
  if (!Array.isArray(values)) return ''
  const normalized = values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
  if (!normalized.length) return ''
  const visible = normalized.slice(0, limit).join(', ')
  const remaining = normalized.length - limit
  return remaining > 0 ? `${visible}, +${remaining} more` : visible
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function jiraActionFrom(item: any): 'added' | 'updated' | 'reused' | 'removed' | 'unknown' {
  const action = String(item?.action || item?.operation || item?.status || item?.changeType || '').trim().toLowerCase()
  if (['create', 'created', 'added', 'new'].includes(action)) return 'added'
  if (['update', 'updated', 'patched', 'modified'].includes(action)) return 'updated'
  if (['reuse', 'reused', 'existing', 'unchanged', 'no_change', 'skipped'].includes(action)) return 'reused'
  if (['remove', 'removed', 'delete', 'deleted', 'obsolete', 'deprecated'].includes(action)) return 'removed'
  return 'unknown'
}

function jiraIssueKeyFrom(item: any, kind: 'epic' | 'story') {
  const candidates = kind === 'epic'
    ? [item?.jiraEpicKey, item?.epicKey, item?.key, item?.issueKey, item?.jiraKey, item?.jiraIssueKey]
    : [item?.storyKey, item?.jiraStoryKey, item?.key, item?.issueKey, item?.jiraKey, item?.jiraIssueKey]
  const match = candidates.map((value) => String(value || '').trim()).find((value) => /^[A-Z][A-Z0-9]+-\d+$/.test(value))
  return match || String(candidates.find(Boolean) || '').trim()
}

function jiraIssueSummaryFrom(item: any, kind: 'epic' | 'story') {
  const value = kind === 'epic'
    ? item?.epicName || item?.name || item?.summary || item?.title
    : item?.summary || item?.storySummary || item?.name || item?.title
  return String(value || '').trim()
}

function jiraChangeItem(item: any, kind: 'epic' | 'story') {
  const key = jiraIssueKeyFrom(item, kind)
  const summary = jiraIssueSummaryFrom(item, kind)
  if (!key && !summary) return null
  return {
    kind,
    key: key || summary,
    summary,
    action: jiraActionFrom(item),
  }
}

function dedupeJiraChangeItems(items: Array<ReturnType<typeof jiraChangeItem>>) {
  const seen = new Set<string>()
  return items.filter((item): item is NonNullable<typeof item> => {
    if (!item) return false
    const key = `${item.kind}:${item.key}:${item.action}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function backlogJiraChangeGroups(output?: any, rawUpdateSummary?: any) {
  const epicSources = [
    ...asArray(output?.epics),
    ...asArray(output?.jira?.epics),
    ...asArray(rawUpdateSummary?.epics),
    ...asArray(rawUpdateSummary?.jira?.epics),
    ...asArray(rawUpdateSummary?.addedEpics).map((item) => ({ ...item, action: item?.action || 'added' })),
    ...asArray(rawUpdateSummary?.updatedEpics).map((item) => ({ ...item, action: item?.action || 'updated' })),
    ...asArray(rawUpdateSummary?.preservedEpics).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.reusedEpics).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.removedEpics).map((item) => ({ ...item, action: item?.action || 'removed' })),
  ]
  const storySources = [
    ...asArray(output?.stories),
    ...asArray(output?.jira?.stories),
    ...asArray(rawUpdateSummary?.stories),
    ...asArray(rawUpdateSummary?.jira?.stories),
    ...asArray(rawUpdateSummary?.addedStories).map((item) => ({ ...item, action: item?.action || 'added' })),
    ...asArray(rawUpdateSummary?.updatedStories).map((item) => ({ ...item, action: item?.action || 'updated' })),
    ...asArray(rawUpdateSummary?.preservedStories).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.reusedStories).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.removedStories).map((item) => ({ ...item, action: item?.action || 'removed' })),
  ]
  const items = [
    ...epicSources.map((item) => jiraChangeItem(item, 'epic')),
    ...storySources.map((item) => jiraChangeItem(item, 'story')),
  ]
  const normalized = dedupeJiraChangeItems(items)
  return {
    added: normalized.filter((item) => item.action === 'added'),
    updated: normalized.filter((item) => item.action === 'updated'),
    removed: normalized.filter((item) => item.action === 'removed'),
    reused: normalized.filter((item) => item.action === 'reused'),
  }
}

function isBacklogDocumentType(value?: string | null) {
  return ['user_stories', 'epics_and_user_stories', 'epics_user_stories'].includes(String(value || '').trim().toLowerCase())
}

function isStoryTestCasesDocumentType(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  return ['story_test_cases', 'test_cases', 'testcases'].includes(normalized)
}

function isRtmDocumentType(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  return ['traceability_matrix', 'requirement_traceability_matrix', 'rtm'].includes(normalized)
}

function rtmTraceabilityRowLabel(value: unknown) {
  if (typeof value === 'string') return value.trim()
  const row = value as Record<string, any>
  return String(row?.coverageId || row?.coverage_id || row?.id || row?.moduleRequirement || row?.requirement || row?.module || '').trim()
}

function rtmTraceabilityRowSummary(row: any) {
  return String(row?.moduleRequirement || row?.module_requirement || row?.requirement || row?.module || row?.notes || row?.note || '').trim()
}

function rtmTraceabilityItem(value: unknown, lookup: Map<string, any>) {
  const key = rtmTraceabilityRowLabel(value)
  if (!key) return null
  const row = lookup.get(key.toLowerCase())
  const jiraKeys = extractJiraKeys([
    rtmTraceabilityRowSummary(row),
    row?.notes,
    row?.includedInOutput,
    row?.sourceReference,
  ].filter(Boolean).join(' '))
  return {
    key,
    displayKey: jiraKeys.length ? jiraKeys.join(', ') : 'No Jira mapping',
    jiraKeys,
    summary: rtmTraceabilityRowSummary(row) || (typeof value === 'object' ? rtmTraceabilityRowSummary(value) : ''),
    status: String(row?.coverageStatus || row?.status || '').trim().toLowerCase(),
    notes: String(row?.notes || row?.note || '').trim(),
  }
}

function dedupeRtmTraceabilityItems(items: Array<ReturnType<typeof rtmTraceabilityItem>>) {
  const seen = new Set<string>()
  return items.filter((item): item is NonNullable<typeof item> => {
    if (!item) return false
    const key = item.key.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function rtmTraceabilityChangeGroups(output?: any, rawUpdateSummary?: any) {
  const lookup = new Map<string, any>()
  const lookupRows = [
    ...coverageLedgerFrom(output),
    ...asArray(rawUpdateSummary?.batchSummary?.reviewItems),
    ...asArray(output?.coverageSummary?.missingItems),
    ...asArray(output?.coverageSummary?.partialItems),
    ...asArray(output?.coverageSummary?.warningItems),
  ]
  lookupRows.forEach((row: any) => {
    const key = rtmTraceabilityRowLabel(row).toLowerCase()
    if (key && !lookup.has(key)) lookup.set(key, row)
  })

  const added = dedupeRtmTraceabilityItems(asArray(rawUpdateSummary?.addedRows).map((item) => rtmTraceabilityItem(item, lookup)))
  const removed = dedupeRtmTraceabilityItems(asArray(rawUpdateSummary?.removedRows).map((item) => rtmTraceabilityItem(item, lookup)))
  const addedKeys = new Set(added.map((item) => item.key.toLowerCase()))
  const removedKeys = new Set(removed.map((item) => item.key.toLowerCase()))
  const updated = dedupeRtmTraceabilityItems(asArray(rawUpdateSummary?.updatedRows).map((item) => rtmTraceabilityItem(item, lookup)))
    .filter((item) => !addedKeys.has(item.key.toLowerCase()) && !removedKeys.has(item.key.toLowerCase()))
  const changedKeys = new Set([...added, ...updated, ...removed].map((item) => item.key.toLowerCase()))
  const preserved = dedupeRtmTraceabilityItems(asArray(rawUpdateSummary?.preservedRows).map((item) => rtmTraceabilityItem(item, lookup)))
    .filter((item) => !changedKeys.has(item.key.toLowerCase()))

  return { added, updated, preserved, removed }
}

function rtmCoverageImpact(output?: any, rawUpdateSummary?: any) {
  const coverage = coverageSummaryFrom(output)
  const counts = coverageCounts(coverage)
  const batch = rawUpdateSummary?.batchSummary || batchSummaryFrom(output)
  return {
    total: counts.total || Number(rawUpdateSummary?.currentCoverageRows || batch?.total || 0) || 0,
    covered: counts.covered || Number(batch?.covered || batch?.complete || 0) || 0,
    partial: counts.partial || Number(rawUpdateSummary?.partialCoverageRows || batch?.partial || 0) || 0,
    missing: counts.missing || Number(rawUpdateSummary?.missingCoverageRows || batch?.missing || 0) || 0,
    review: Number(rawUpdateSummary?.reviewCoverageRows || batch?.review || 0) || (counts.partial + counts.missing),
    previousRows: Number(rawUpdateSummary?.previousCoverageRows || 0) || 0,
    currentRows: Number(rawUpdateSummary?.currentCoverageRows || counts.total || batch?.total || 0) || 0,
    reviewItems: asArray(rawUpdateSummary?.batchSummary?.reviewItems).length
      ? asArray(rawUpdateSummary?.batchSummary?.reviewItems)
      : [
          ...asArray((coverage as Record<string, any> | null)?.missingItems),
          ...asArray((coverage as Record<string, any> | null)?.partialItems),
        ],
  }
}

function stcTestCaseKeyFrom(item: any) {
  const candidates = [
    item?.testcaseKey,
    item?.testCaseKey,
    item?.jiraTestCaseKey,
    item?.key,
    item?.issueKey,
    item?.jiraKey,
    item?.jiraIssueKey,
  ].map((value) => String(value || '').trim())
  const match = candidates.find((value) => /^[A-Z][A-Z0-9]+-\d+$/.test(value))
  return match || candidates.find(Boolean) || ''
}

function stcStoryKeyFrom(item: any) {
  const candidates = [
    item?.storyKey,
    item?.jiraStoryKey,
    item?.parentStoryKey,
    item?.sourceStoryKey,
  ].map((value) => String(value || '').trim())
  const match = candidates.find((value) => /^[A-Z][A-Z0-9]+-\d+$/.test(value))
  return match || candidates.find(Boolean) || ''
}

function stcTestCaseSummaryFrom(item: any) {
  return String(item?.testcaseSummary || item?.testCaseSummary || item?.summary || item?.name || item?.title || '').trim()
}

function stcStorySummaryFrom(item: any) {
  return String(item?.storySummary || item?.parentStorySummary || item?.sourceStorySummary || '').trim()
}

function stcChangeItem(item: any) {
  const key = stcTestCaseKeyFrom(item)
  const summary = stcTestCaseSummaryFrom(item)
  if (!key && !summary) return null
  return {
    key: key || summary,
    summary,
    storyKey: stcStoryKeyFrom(item),
    storySummary: stcStorySummaryFrom(item),
    action: jiraActionFrom(item),
  }
}

function dedupeStcChangeItems(items: Array<ReturnType<typeof stcChangeItem>>) {
  const seen = new Set<string>()
  return items.filter((item): item is NonNullable<typeof item> => {
    if (!item) return false
    const key = `${item.key}:${item.storyKey || ''}:${item.action}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function stcTestCaseChangeGroups(output?: any, rawUpdateSummary?: any) {
  const persistedCoverageItems = asArray(output?.coverageLedger)
    .flatMap((row: any) => asArray(row?.testcaseKeys).map((key) => ({
      key,
      summary: 'Persisted Jira test case coverage reused for this story.',
      storyKey: row?.storyKey || row?.jiraStoryKey || row?.module || '',
      storySummary: row?.storySummary || row?.requirement || row?.moduleRequirement || '',
      action: 'reused',
    })))
  const sources = [
    ...asArray(output?.testCases),
    ...asArray(output?.jira?.testCases),
    ...asArray(rawUpdateSummary?.testCases),
    ...asArray(rawUpdateSummary?.jira?.testCases),
    ...asArray(rawUpdateSummary?.addedTestCases).map((item) => ({ ...item, action: item?.action || 'added' })),
    ...asArray(rawUpdateSummary?.createdTestCases).map((item) => ({ ...item, action: item?.action || 'added' })),
    ...asArray(rawUpdateSummary?.updatedTestCases).map((item) => ({ ...item, action: item?.action || 'updated' })),
    ...asArray(rawUpdateSummary?.preservedTestCases).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.reusedTestCases).map((item) => ({ ...item, action: item?.action || 'reused' })),
    ...asArray(rawUpdateSummary?.removedTestCases).map((item) => ({ ...item, action: item?.action || 'removed' })),
    ...(Number(rawUpdateSummary?.noModelRequired) || Number(rawUpdateSummary?.reusedTestCaseCount || 0) ? persistedCoverageItems : []),
  ]
  const normalized = dedupeStcChangeItems(sources.map(stcChangeItem))
  return {
    added: normalized.filter((item) => item.action === 'added'),
    updated: normalized.filter((item) => item.action === 'updated'),
    removed: normalized.filter((item) => item.action === 'removed'),
    reused: normalized.filter((item) => item.action === 'reused'),
  }
}

function stcCoverageRows(output?: any) {
  const coverage = coverageSummaryFrom(output)
  const coverageRecord = coverage as Record<string, any> | null
  const statusRows = [
    ...asArray(coverageRecord?.missingItems).map((row) => ({ ...row, coverageStatus: row?.coverageStatus || row?.status || 'missing' })),
    ...asArray(coverageRecord?.partialItems).map((row) => ({ ...row, coverageStatus: row?.coverageStatus || row?.status || 'partial' })),
    ...asArray(coverageRecord?.coveredItems).map((row) => ({ ...row, coverageStatus: row?.coverageStatus || row?.status || 'covered' })),
  ]
  const sourceRows = statusRows.length
    ? statusRows
    : [
        ...asArray(output?.coverageLedger),
        ...asArray(output?.qualityGate?.coverageLedger),
        ...asArray(output?.batchSummary?.batches),
        ...asArray(output?.progress?.batchSummary?.batches),
      ]
  const testCasesByStory = new Map<string, any[]>()
  asArray(output?.testCases).forEach((testCase: any) => {
    const storyKey = stcStoryKeyFrom(testCase)
    if (!storyKey) return
    testCasesByStory.set(storyKey, [...(testCasesByStory.get(storyKey) || []), testCase])
  })
  const seen = new Set<string>()
  return sourceRows.map((row: any, index: number) => {
    const storyKey = String(row?.storyKey || row?.jiraStoryKey || row?.module || row?.batchId || row?.coverageId || row?.id || '').trim()
    const title = String(row?.storySummary || row?.moduleRequirement || row?.requirement || row?.name || row?.title || storyKey || `Story ${index + 1}`).trim()
    const status = String(row?.coverageStatus || row?.status || '').trim().toLowerCase() || 'covered'
    const linkedTestCases = storyKey ? (testCasesByStory.get(storyKey) || []) : []
    const ledgerTestCaseKeys = asArray(row?.testcaseKeys).map((key) => String(key || '').trim()).filter(Boolean)
    const generated = Number(row?.generatedTestCases ?? row?.mappingCount ?? row?.linkedTestCases ?? ledgerTestCaseKeys.length ?? linkedTestCases.length ?? 0) || 0
    const planned = Number(row?.plannedTestCases ?? row?.expectedTestCases ?? 0) || 0
    const dedupeKey = `${storyKey || title}:${status}`.toLowerCase()
    if (seen.has(dedupeKey)) return null
    seen.add(dedupeKey)
    return {
      storyKey,
      title,
      status,
      generated,
      planned,
      missingCategories: normalizeCategoryLabels(row?.missingCategories).slice(0, 8),
      coveredCategories: normalizeCategoryLabels(
        row?.categoriesCovered
        || row?.coveredCategories
        || row?.categories
        || linkedTestCases.map((testCase: any) => testCase.coverageCategory || testCase.testCategory || testCase.testType),
      ).slice(0, 10),
      testCaseKeys: ledgerTestCaseKeys.length ? ledgerTestCaseKeys : linkedTestCases.map(stcTestCaseKeyFrom).filter(Boolean),
    }
  }).filter(Boolean) as Array<{
    storyKey: string
    title: string
    status: string
    generated: number
    planned: number
    missingCategories: string[]
    coveredCategories: string[]
    testCaseKeys: string[]
  }>
}

function stcCoverageImpact(output?: any) {
  const coverage = coverageSummaryFrom(output)
  const counts = coverageCounts(coverage)
  const rows = stcCoverageRows(output)
  const coveredRows = rows.filter((row) => row.status.includes('cover') && !row.status.includes('partial')).length
  const partialRows = rows.filter((row) => row.status.includes('partial') || row.status.includes('review')).length
  const missingRows = rows.filter((row) => row.status.includes('missing') || row.status.includes('fail')).length
  const total = counts.total || rows.length || asArray(output?.stories).length
  return {
    total,
    covered: counts.covered || coveredRows,
    partial: counts.partial || partialRows,
    missing: counts.missing || missingRows,
    rows,
  }
}

function backlogCurrentTotals(output?: any, jobRecord?: GeneratedOutput | null, relatedOutputs: GeneratedOutput[] = []) {
  const projectName = String(jobRecord?.projectName || output?.projectName || output?.destination?.projectName || '').trim().toLowerCase()
  if (!projectName) return null
  const currentJobId = String(jobRecord?.jobId || jobRecord?.id || output?.jobId || output?.id || '').trim()
  const candidates = relatedOutputs
    .filter((record) => {
      const recordProject = String(record.projectName || record.output?.projectName || record.output?.destination?.projectName || '').trim().toLowerCase()
      const recordType = record.documentType || record.output?.documentType || record.artifactLabel
      return record.status === 'completed' && recordProject === projectName && isBacklogDocumentType(recordType)
    })
    .map((record) => ({ jobId: record.jobId || record.id, createdAt: record.createdAt, output: record.output }))

  if (output && currentJobId && !candidates.some((candidate) => candidate.jobId === currentJobId)) {
    candidates.push({ jobId: currentJobId, createdAt: jobRecord?.createdAt || new Date().toISOString(), output })
  }

  const epics = new Map<string, { removed: boolean }>()
  const stories = new Map<string, { removed: boolean }>()
  candidates
    .sort((left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime())
    .forEach((candidate) => {
      const groups = backlogJiraChangeGroups(candidate.output)
      const allItems = [...groups.added, ...groups.updated, ...groups.reused, ...groups.removed]
      allItems.forEach((item) => {
        const target = item.kind === 'epic' ? epics : stories
        target.set(item.key, { removed: item.action === 'removed' })
      })
    })

  return {
    epics: Array.from(epics.values()).filter((item) => !item.removed).length,
    stories: Array.from(stories.values()).filter((item) => !item.removed).length,
  }
}

function outputUpdateSummary(output?: any, jobRecord?: Pick<GeneratedOutput, 'generationMode' | 'updateOfJobId' | 'documentType' | 'artifactLabel'> | null) {
  if (!output || generationModeFrom(output, jobRecord) !== 'update') return null
  const outputDocumentType = String(
    output.documentType
    || output.artifactLabel
    || jobRecord?.documentType
    || jobRecord?.artifactLabel
    || '',
  ).trim().toLowerCase()
  const rawUpdateSummary = output.updateSummary || output.qualityGate?.updateSummary || output.progress?.updateSummary || null
  if (rawUpdateSummary && ['test_strategy', 'test_plan', 'risk_matrix'].includes(String(rawUpdateSummary.documentType || output.documentType || '').trim().toLowerCase())) {
    const updatedSections = uniqueNonEmptyList(rawUpdateSummary.updatedSections)
    const preservedSections = uniqueNonEmptyList(rawUpdateSummary.preservedSections)
    const addedSections = uniqueNonEmptyList(rawUpdateSummary.addedSections)
    const removedSections = uniqueNonEmptyList(rawUpdateSummary.removedSections)
    const updatedCount = updatedSections.length
    const preservedCount = preservedSections.length
    const addedCount = addedSections.length
    const removedCount = removedSections.length
    const tokensUsed = Number(rawUpdateSummary.tokenUsage?.total ?? rawUpdateSummary.tokensTotal ?? output.tokenUsage?.total ?? output.tokensTotal ?? 0) || 0
    const costUsed = Number(rawUpdateSummary.tokenUsage?.estimatedCostUsd ?? rawUpdateSummary.estimatedCostUsd ?? output.tokenUsage?.estimatedCostUsd ?? output.estimatedCostUsd ?? 0) || 0
    const estimatedTokensSaved = Number(rawUpdateSummary.tokenSavings?.estimatedTokensSaved ?? rawUpdateSummary.estimatedTokensSaved ?? 0) || 0
    const estimatedCostSavedUsd = Number(rawUpdateSummary.tokenSavings?.estimatedCostSavedUsd ?? rawUpdateSummary.estimatedCostSavedUsd ?? 0) || 0
    const estimatedSavingsPercent = Number(rawUpdateSummary.tokenSavings?.estimatedSavingsPercent ?? rawUpdateSummary.estimatedSavingsPercent)
    const operationMode = String(rawUpdateSummary.operationMode || output.operationMode || output.metadata?.operation_mode || '').trim().toLowerCase()
    const sectionText = [
      updatedCount ? `${updatedCount} section${updatedCount === 1 ? '' : 's'} updated` : '',
      addedCount ? `${addedCount} added` : '',
      removedCount ? `${removedCount} removed` : '',
      preservedCount ? `${preservedCount} preserved` : '',
    ].filter(Boolean).join(', ')
    const examples = compactList(updatedSections.length ? updatedSections : addedSections)
    const updateReasons = [
      ...(Array.isArray(rawUpdateSummary.updateReasons) ? rawUpdateSummary.updateReasons : []),
      ...(Array.isArray(output.updateContext?.updateReasons) ? output.updateContext.updateReasons : []),
    ].map((reason) => String(reason || '').trim()).filter(Boolean)
    const summaryDetails = {
      updatedSections,
      preservedSections,
      addedSections,
      removedSections,
      updatedCount,
      preservedCount,
      addedCount,
      removedCount,
      tokensUsed,
      costUsed,
      estimatedTokensSaved,
      estimatedCostSavedUsd,
      estimatedSavingsPercent: Number.isFinite(estimatedSavingsPercent) ? estimatedSavingsPercent : undefined,
      operationMode,
      updateReasons,
      savingsUnavailableLabel: rawUpdateSummary.tokenSavings ? undefined : 'Not estimated',
    }
    const tokenText = [
      tokensUsed ? `${formatCompactNumber(tokensUsed)} tokens used for this update` : '',
      costUsed ? `${formatCurrency(costUsed)} estimated cost` : '',
      estimatedTokensSaved ? `${formatCompactNumber(estimatedTokensSaved)} estimated tokens saved${Number.isFinite(estimatedSavingsPercent) ? ` (${Math.max(0, Math.round(estimatedSavingsPercent))}%)` : ''}` : '',
    ].filter(Boolean).join(' • ')

    if (rawUpdateSummary.noChangesDetected) {
      return {
        title: 'No changes needed',
        message: 'Q-Ops reviewed the latest project context and did not find source changes requiring document updates.',
        detail: tokenText,
        tone: 'success' as StatusTone,
        ...summaryDetails,
      }
    }

    return {
      title: operationMode === 'update_repair' ? 'Repair update completed' : rawUpdateSummary.deltaMode ? 'Delta update completed' : 'Update completed',
      message: sectionText
        ? `Q-Ops updated the existing document selectively: ${sectionText}.${examples ? ` Updated focus: ${examples}.` : ''}`
        : 'Q-Ops reviewed the existing document against the latest project context and refreshed the relevant content.',
      detail: tokenText,
      tone: 'success' as StatusTone,
      ...summaryDetails,
    }
  }
  const epics = itemActionSummary(output.epics || output.jira?.epics || [])
  const stories = itemActionSummary(output.stories || output.jira?.stories || [])
  const testCases = itemActionSummary(output.testCases || output.jira?.testCases || [])
  const created = epics.created + stories.created + testCases.created
  const updated = epics.updated + stories.updated + testCases.updated
  const reused = epics.reused + stories.reused + testCases.reused
  const removed = epics.removed + stories.removed + testCases.removed
  const coverage = coverageSummaryFrom(output)
  const counts = coverageCounts(coverage)
  const coverageText = counts.total
    ? counts.missing || counts.partial
      ? `${counts.covered} of ${counts.total} coverage items are covered; ${counts.partial + counts.missing} need review.`
      : `${counts.covered || counts.total} of ${counts.total} coverage items are covered.`
    : ''
  const isBacklogUpdate = isBacklogDocumentType(outputDocumentType)
  const isStoryTestCasesUpdate = isStoryTestCasesDocumentType(outputDocumentType)
  const isRtmUpdate = isRtmDocumentType(outputDocumentType || rawUpdateSummary?.documentType)
  const jiraChangeGroups = isBacklogUpdate ? backlogJiraChangeGroups(output, rawUpdateSummary) : undefined
  const stcChangeGroups = isStoryTestCasesUpdate ? stcTestCaseChangeGroups(output, rawUpdateSummary) : undefined
  const stcCoverage = isStoryTestCasesUpdate ? stcCoverageImpact(output) : undefined
  const rtmChangeGroups = isRtmUpdate && rawUpdateSummary ? rtmTraceabilityChangeGroups(output, rawUpdateSummary) : undefined
  const rtmCoverage = isRtmUpdate && rawUpdateSummary ? rtmCoverageImpact(output, rawUpdateSummary) : undefined
  const effectiveCreated = isStoryTestCasesUpdate && stcChangeGroups ? stcChangeGroups.added.length : created
  const effectiveUpdated = isStoryTestCasesUpdate && stcChangeGroups ? stcChangeGroups.updated.length : updated
  const effectiveReused = isStoryTestCasesUpdate && stcChangeGroups
    ? Math.max(stcChangeGroups.reused.length, Number(rawUpdateSummary?.reusedTestCaseCount || output?.jira?.reused || 0) || 0)
    : reused
  const effectiveRemoved = isStoryTestCasesUpdate && stcChangeGroups ? stcChangeGroups.removed.length : removed

  if (isRtmUpdate && rawUpdateSummary) {
    const added = rtmChangeGroups?.added.length || Number(rawUpdateSummary.createdCoverageRows || 0) || 0
    const updatedRows = rtmChangeGroups?.updated.length || Number(rawUpdateSummary.updatedCoverageRows || 0) || 0
    const preserved = rtmChangeGroups?.preserved.length || Number(rawUpdateSummary.reusedCoverageRows || 0) || 0
    const removedRows = rtmChangeGroups?.removed.length || Number(rawUpdateSummary.removedCoverageRows || 0) || 0
    const tokensUsed = Number(rawUpdateSummary.tokenUsage?.total ?? rawUpdateSummary.tokensTotal ?? output.tokenUsage?.total ?? output.tokensTotal ?? 0) || 0
    const costUsed = Number(rawUpdateSummary.tokenUsage?.estimatedCostUsd ?? rawUpdateSummary.estimatedCostUsd ?? output.tokenUsage?.estimatedCostUsd ?? output.estimatedCostUsd ?? 0) || 0
    const estimatedTokensSaved = Number(rawUpdateSummary.tokenSavings?.estimatedTokensSaved ?? rawUpdateSummary.estimatedTokensSaved ?? 0) || 0
    const estimatedCostSavedUsd = Number(rawUpdateSummary.tokenSavings?.estimatedCostSavedUsd ?? rawUpdateSummary.estimatedCostSavedUsd ?? 0) || 0
    const estimatedSavingsPercent = Number(rawUpdateSummary.tokenSavings?.estimatedSavingsPercent ?? rawUpdateSummary.estimatedSavingsPercent)
    const operationMode = String(rawUpdateSummary.operationMode || output.operationMode || output.metadata?.operation_mode || '').trim().toLowerCase()
    const coverageReviewText = rtmCoverage?.review
      ? `${rtmCoverage.covered} of ${rtmCoverage.total || rtmCoverage.currentRows} traceability rows are covered; ${rtmCoverage.review} need review.`
      : rtmCoverage?.total
        ? `${rtmCoverage.covered || rtmCoverage.total} of ${rtmCoverage.total} traceability rows are covered.`
        : coverageText
    const changeText = [
      added ? `${added} added` : '',
      updatedRows ? `${updatedRows} updated` : '',
      preserved ? `${preserved} preserved` : '',
      removedRows ? `${removedRows} removed` : '',
    ].filter(Boolean).join(', ')

    return {
      title: (rtmCoverage?.missing || rtmCoverage?.partial) ? 'Update completed with review' : 'Update completed',
      message: changeText
        ? `Q-Ops refreshed the RTM traceability baseline: ${changeText}.${coverageReviewText ? ` Coverage: ${coverageReviewText}` : ''}`
        : `Q-Ops refreshed the RTM traceability baseline.${coverageReviewText ? ` Coverage: ${coverageReviewText}` : ''}`,
      detail: coverageReviewText,
      tone: (rtmCoverage?.missing || rtmCoverage?.partial ? 'warning' : 'success') as StatusTone,
      updatedCount: updatedRows,
      preservedCount: preserved,
      addedCount: added,
      removedCount: removedRows,
      updatedSections: [],
      preservedSections: [],
      addedSections: [],
      removedSections: [],
      rtmChangeGroups,
      rtmCoverage,
      tokensUsed,
      costUsed,
      estimatedTokensSaved,
      estimatedCostSavedUsd,
      estimatedSavingsPercent: Number.isFinite(estimatedSavingsPercent) ? estimatedSavingsPercent : undefined,
      operationMode,
      updateReasons: [],
      impactPrimaryLabel: 'Added/updated',
      impactPreservedLabel: 'Preserved',
      savingsUnavailableLabel: rawUpdateSummary.tokenSavings ? undefined : 'Not estimated',
    }
  }

  const backlogEpicAdded = jiraChangeGroups?.added.filter((item) => item.kind === 'epic').length || epics.created
  const backlogStoryAdded = jiraChangeGroups?.added.filter((item) => item.kind === 'story').length || stories.created
  const backlogEpicUpdated = jiraChangeGroups?.updated.filter((item) => item.kind === 'epic').length || epics.updated
  const backlogStoryUpdated = jiraChangeGroups?.updated.filter((item) => item.kind === 'story').length || stories.updated
  const backlogEpicPreserved = jiraChangeGroups?.reused.filter((item) => item.kind === 'epic').length || epics.reused
  const backlogStoryPreserved = jiraChangeGroups?.reused.filter((item) => item.kind === 'story').length || stories.reused
  const backlogEpicRemoved = jiraChangeGroups?.removed.filter((item) => item.kind === 'epic').length || epics.removed
  const backlogStoryRemoved = jiraChangeGroups?.removed.filter((item) => item.kind === 'story').length || stories.removed
  const backlogChangeParts = [
    backlogEpicAdded ? `${backlogEpicAdded} epic${backlogEpicAdded === 1 ? '' : 's'} added` : '',
    backlogStoryAdded ? `${backlogStoryAdded} stor${backlogStoryAdded === 1 ? 'y' : 'ies'} added` : '',
    backlogEpicUpdated ? `${backlogEpicUpdated} epic${backlogEpicUpdated === 1 ? '' : 's'} updated` : '',
    backlogStoryUpdated ? `${backlogStoryUpdated} stor${backlogStoryUpdated === 1 ? 'y' : 'ies'} updated` : '',
    backlogEpicRemoved ? `${backlogEpicRemoved} epic${backlogEpicRemoved === 1 ? '' : 's'} removed` : '',
    backlogStoryRemoved ? `${backlogStoryRemoved} stor${backlogStoryRemoved === 1 ? 'y' : 'ies'} removed` : '',
  ].filter(Boolean)
  const backlogPreservedLabel = [
    backlogEpicPreserved ? `${backlogEpicPreserved} epic${backlogEpicPreserved === 1 ? '' : 's'} preserved` : '',
    backlogStoryPreserved ? `${backlogStoryPreserved} stor${backlogStoryPreserved === 1 ? 'y' : 'ies'} preserved` : '',
  ].filter(Boolean).join(', ')
  const backlogChanges = backlogChangeParts.length
    ? backlogChangeParts.join(' and ')
    : backlogPreservedLabel
      ? `no new Jira items added; ${backlogPreservedLabel}`
      : ''
  const updateTokenSavings = rawUpdateSummary?.tokenSavings || output?.tokenSavings || null
  const updateSavingsHasBaseline = Boolean(
    Number(updateTokenSavings?.estimatedBaselineTokens ?? rawUpdateSummary?.estimatedBaselineTokens ?? output?.estimatedBaselineTokens ?? 0)
    || Number(updateTokenSavings?.estimatedBaselineCostUsd ?? rawUpdateSummary?.estimatedBaselineCostUsd ?? output?.estimatedBaselineCostUsd ?? 0)
  )
  const updateEstimatedTokensSaved = Number(updateTokenSavings?.estimatedTokensSaved ?? rawUpdateSummary?.estimatedTokensSaved ?? output?.estimatedTokensSaved ?? 0) || 0
  const updateEstimatedCostSavedUsd = Number(updateTokenSavings?.estimatedCostSavedUsd ?? rawUpdateSummary?.estimatedCostSavedUsd ?? output?.estimatedCostSavedUsd ?? 0) || 0
  const updateEstimatedSavingsPercent = Number(updateTokenSavings?.estimatedSavingsPercent ?? rawUpdateSummary?.estimatedSavingsPercent ?? output?.estimatedSavingsPercent)

  if (effectiveCreated || effectiveUpdated || effectiveRemoved) {
    const changes = [
      effectiveCreated ? `${effectiveCreated} added` : '',
      effectiveUpdated ? `${effectiveUpdated} updated` : '',
      effectiveRemoved ? `${effectiveRemoved} removed` : '',
      effectiveReused ? `${effectiveReused} reused` : '',
    ].filter(Boolean).join(', ')
    const stcCoverageLine = stcCoverage
      ? `${stcCoverage.covered} of ${stcCoverage.total} impacted stories covered${stcCoverage.partial ? `; ${stcCoverage.partial} need review` : ''}${stcCoverage.missing ? `; ${stcCoverage.missing} missing` : ''}.`
      : coverageText
    const stcPublishLine = isStoryTestCasesUpdate
      ? [
          effectiveCreated ? `${effectiveCreated} test cases added` : '',
          effectiveUpdated ? `${effectiveUpdated} updated` : '',
          effectiveReused ? `${effectiveReused} preserved` : '',
          effectiveRemoved ? `${effectiveRemoved} removed` : '',
        ].filter(Boolean).join(', ')
      : ''
    return {
      title: isStoryTestCasesUpdate && (counts.missing || counts.partial) ? 'Update needs coverage repair' : 'Update completed',
      message: isBacklogUpdate
        ? `Q-Ops applied this backlog repair: ${backlogChanges || changes}.${coverageText ? ` Overall delta coverage: ${coverageText}` : ''}`
        : isStoryTestCasesUpdate
          ? `Q-Ops applied this Story Test Cases update: ${stcPublishLine || changes}.${stcCoverageLine ? ` Story coverage: ${stcCoverageLine}` : ''}`
        : `Q-Ops reviewed the existing output and applied changes: ${changes}.`,
      detail: isStoryTestCasesUpdate ? stcCoverageLine : coverageText,
      tone: (counts.missing || counts.partial ? 'warning' : 'success') as StatusTone,
      updatedCount: effectiveUpdated,
      preservedCount: effectiveReused,
      addedCount: effectiveCreated,
      removedCount: effectiveRemoved,
      updatedSections: [],
      preservedSections: [],
      addedSections: [],
      removedSections: [],
      jiraChangeGroups,
      stcChangeGroups,
      stcCoverage,
      tokensUsed: Number(output?.tokenUsage?.total ?? output?.tokensTotal ?? 0) || 0,
      costUsed: Number(output?.tokenUsage?.estimatedCostUsd ?? output?.estimatedCostUsd ?? 0) || 0,
      estimatedTokensSaved: updateEstimatedTokensSaved,
      estimatedCostSavedUsd: updateEstimatedCostSavedUsd,
      estimatedSavingsPercent: Number.isFinite(updateEstimatedSavingsPercent) ? updateEstimatedSavingsPercent : undefined,
      updateReasons: [],
      impactPrimaryLabel: isBacklogUpdate ? (updated ? 'Added/updated' : 'Added') : isStoryTestCasesUpdate ? 'Added/updated' : undefined,
      impactPreservedLabel: isBacklogUpdate ? 'Preserved' : isStoryTestCasesUpdate ? 'Preserved' : undefined,
      savingsUnavailableLabel: (isBacklogUpdate || isStoryTestCasesUpdate) && !updateSavingsHasBaseline ? 'Not estimated' : undefined,
    }
  }

  if (effectiveReused || String(output?.confluence?.action || '').toLowerCase() === 'updated') {
    const stcCoveredStories = stcCoverage?.covered || counts.covered || Number(rawUpdateSummary?.reusedStoryCount || 0) || 0
    const stcNoModelMessage = isStoryTestCasesUpdate
      ? `Existing Jira Story Test Cases already cover ${stcCoveredStories} stor${stcCoveredStories === 1 ? 'y' : 'ies'}, so Q-Ops reused ${effectiveReused} test case${effectiveReused === 1 ? '' : 's'} without invoking the Story Test Case model.`
      : ''
    return {
      title: isStoryTestCasesUpdate ? 'Update completed' : 'No changes needed',
      message: stcNoModelMessage || (effectiveReused
        ? `Q-Ops reviewed live Jira and Confluence. Existing items already cover the latest project context, so ${effectiveReused} item${effectiveReused === 1 ? ' was' : 's were'} reused.`
        : 'Q-Ops reviewed the existing output against the latest project context. No content changes were needed.'
      ),
      detail: coverageText,
      tone: (counts.missing || counts.partial ? 'warning' : 'success') as StatusTone,
      updatedCount: 0,
      preservedCount: effectiveReused,
      addedCount: 0,
      removedCount: 0,
      updatedSections: [],
      preservedSections: [],
      addedSections: [],
      removedSections: [],
      jiraChangeGroups,
      stcChangeGroups,
      stcCoverage,
      tokensUsed: Number(output?.tokenUsage?.total ?? output?.tokensTotal ?? 0) || 0,
      costUsed: Number(output?.tokenUsage?.estimatedCostUsd ?? output?.estimatedCostUsd ?? 0) || 0,
      estimatedTokensSaved: updateEstimatedTokensSaved,
      estimatedCostSavedUsd: updateEstimatedCostSavedUsd,
      estimatedSavingsPercent: Number.isFinite(updateEstimatedSavingsPercent) ? updateEstimatedSavingsPercent : undefined,
      updateReasons: [],
      impactPrimaryLabel: isBacklogUpdate ? 'Added' : isStoryTestCasesUpdate ? 'Added/updated' : undefined,
      impactPreservedLabel: isBacklogUpdate ? 'Preserved' : isStoryTestCasesUpdate ? 'Preserved' : undefined,
      savingsUnavailableLabel: (isBacklogUpdate || isStoryTestCasesUpdate) && !updateSavingsHasBaseline ? 'Not estimated' : undefined,
    }
  }

  return {
    title: 'Update completed',
    message: 'Q-Ops reviewed the existing output against the latest project context.',
    detail: coverageText,
    tone: (counts.missing || counts.partial ? 'warning' : 'success') as StatusTone,
    updatedCount: 0,
    preservedCount: 0,
    addedCount: 0,
    removedCount: 0,
    updatedSections: [],
    preservedSections: [],
    addedSections: [],
    removedSections: [],
    jiraChangeGroups,
    stcChangeGroups,
    stcCoverage,
    tokensUsed: Number(output?.tokenUsage?.total ?? output?.tokensTotal ?? 0) || 0,
    costUsed: Number(output?.tokenUsage?.estimatedCostUsd ?? output?.estimatedCostUsd ?? 0) || 0,
    estimatedTokensSaved: 0,
    estimatedSavingsPercent: undefined,
    updateReasons: [],
    impactPrimaryLabel: isBacklogUpdate ? 'Added' : isStoryTestCasesUpdate ? 'Added/updated' : undefined,
    impactPreservedLabel: isBacklogUpdate ? 'Reused' : isStoryTestCasesUpdate ? 'Preserved' : undefined,
    savingsUnavailableLabel: isBacklogUpdate || isStoryTestCasesUpdate ? 'Not estimated' : undefined,
  }
}

function progressPercentFrom(status?: string, createdAt?: string, progress?: JobProgress | null, nowMs = Date.now()) {
  if (status === 'completed' || status === 'failed') return 100
  const explicit = Number(progress?.progressPercent)
  if (Number.isFinite(explicit) && explicit >= 0) return Math.min(100, Math.round(explicit))
  return activeJobProgress(status, createdAt, nowMs)
}

function progressStageLabel(progress?: JobProgress | null) {
  const label = String(progress?.stageLabel || progress?.stage || '').trim()
  if (!label) return ''
  return label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeGeneratedOutputStatus(value?: string): GeneratedOutput['status'] {
  if (value === 'queued' || value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed' || value === 'not_found') return value
  if (value === 'preparing' || value === 'hydrating') return 'pending'
  return 'completed'
}

function isActiveDocumentStatus(status?: string) {
  return status === 'queued' || status === 'pending' || status === 'processing'
}

const GENERATION_ACTIVE_FRESHNESS_MS = 2 * 60 * 60 * 1000

function isStaleActiveStatus(status?: string, createdAt?: string, nowMs = Date.now(), freshnessMs = GENERATION_ACTIVE_FRESHNESS_MS) {
  if (!isActiveDocumentStatus(status)) return false
  const timestamp = safeTimestamp(createdAt)
  if (!timestamp) return false
  return nowMs - timestamp > freshnessMs
}

function isFreshActiveGeneratedOutput(output: GeneratedOutput, nowMs = Date.now()) {
  return isActiveDocumentStatus(output.status) && !isStaleActiveStatus(output.status, output.createdAt, nowMs)
}

function generationStaleMessage(output: GeneratedOutput) {
  const jobId = output.jobId || output.id
  return `Generation job ${jobId} exceeded the active processing freshness window and no longer appears to be running. Review or regenerate this job if the output was not created.`
}

function generatedOutputForDisplay(output: GeneratedOutput, nowMs = Date.now()): GeneratedOutput {
  if (output.status === 'completed' && output.error) {
    return {
      ...output,
      error: null,
    }
  }
  if (!isStaleActiveStatus(output.status, output.createdAt, nowMs)) return output
  return {
    ...output,
    status: 'failed',
    error: output.error || generationStaleMessage(output),
    output: {
      ...(output.output && typeof output.output === 'object' ? output.output : {}),
      message: output.output?.message || generationStaleMessage(output),
      staleActiveJob: true,
      staleStatus: output.status,
    },
  }
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

function hasCompletedStoryTestCases(projectName: string, outputs: GeneratedOutput[]) {
  const normalizedProject = projectName.trim().toLowerCase()
  if (!normalizedProject) return false
  return outputs.some((output) => {
    if (output.projectName.trim().toLowerCase() !== normalizedProject) return false
    if (output.status !== 'completed') return false
    const artifactKey = resolveArtifactKey(output)
    const documentType = String(output.documentType || output.output?.documentType || '').trim().toLowerCase()
    return artifactKey === 'testCases' || documentType === 'story_test_cases' || documentType === 'test_cases'
  })
}

function hasCompletedTraceabilityPrerequisites(projectName: string, outputs: GeneratedOutput[]) {
  return hasCompletedStoryBacklog(projectName, outputs) && hasCompletedStoryTestCases(projectName, outputs)
}

function latestCompletedGeneratedOutput(
  projectName: string,
  outputs: GeneratedOutput[],
  predicate: (output: GeneratedOutput) => boolean
) {
  const normalizedProject = projectName.trim().toLowerCase()
  if (!normalizedProject) return null
  return outputs
    .filter((output) => output.projectName.trim().toLowerCase() === normalizedProject && output.status === 'completed' && predicate(output))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] || null
}

function latestCompletedOutputForArtifact(projectName: string, artifact: DocumentArtifactKey, outputs: GeneratedOutput[]) {
  const documentType = mapArtifactToDocumentType(artifact)
  return latestCompletedGeneratedOutput(projectName, outputs, (output) => {
    const artifactKey = resolveArtifactKey(output)
    const outputDocumentType = String(output.documentType || output.output?.documentType || '').trim().toLowerCase()
    return artifactKey === artifact || outputDocumentType === documentType
  })
}

function coverageRowKey(row: any) {
  const coverageId = String(row?.coverageId || row?.coverage_id || row?.id || '').trim().toLowerCase()
  if (coverageId) return coverageId
  return [
    row?.moduleRequirement || row?.module_requirement || row?.requirement || row?.module || '',
    row?.sourceReference || row?.source_reference || row?.source || '',
  ]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
    .join('::')
}

function coverageStatusRank(row: any) {
  const status = String(row?.coverageStatus || row?.coverage_status || row?.status || '').trim().toLowerCase()
  if (['covered', 'passed', 'complete', 'included'].includes(status)) return 3
  if (['partial', 'warning', 'needs review'].includes(status)) return 2
  if (['missing', 'unknown', 'not covered', 'failed'].includes(status)) return 1
  return 0
}

function shouldPreserveRtmBaselineCoverage(previousRow: any, currentRow: any) {
  const previousRank = coverageStatusRank(previousRow)
  const currentRank = coverageStatusRank(currentRow)
  if (previousRank < 3 || currentRank >= previousRank) return false
  const currentText = [
    currentRow?.includedInOutput || currentRow?.included_in_output || currentRow?.included || '',
    currentRow?.notes || currentRow?.note || currentRow?.rationale || '',
    currentRow?.sourceReference || currentRow?.source_reference || currentRow?.source || '',
  ].join(' ').toLowerCase()
  const explicitlyRemoved = /\b(explicitly\s+)?(removed|deleted|superseded)\b/.test(currentText)
  if (explicitlyRemoved) return false
  return currentRank <= 1
}

function mergeCoverageLedgers(...ledgers: unknown[]) {
  const merged = new Map<string, any>()
  ledgers.forEach((ledger) => {
    if (!Array.isArray(ledger)) return
    ledger.forEach((row) => {
      const key = coverageRowKey(row) || JSON.stringify(row || {})
      if (key) merged.set(key, row)
    })
  })
  return Array.from(merged.values())
}

function mergeRtmCoverageLedgersPreservingBaseline(baselineLedger: unknown, currentLedger: unknown) {
  const merged = new Map<string, any>()
  if (Array.isArray(baselineLedger)) {
    baselineLedger.forEach((row) => {
      const key = coverageRowKey(row) || JSON.stringify(row || {})
      if (key) merged.set(key, row)
    })
  }
  if (Array.isArray(currentLedger)) {
    currentLedger.forEach((row) => {
      const key = coverageRowKey(row) || JSON.stringify(row || {})
      if (!key) return
      const previousRow = merged.get(key)
      if (previousRow && shouldPreserveRtmBaselineCoverage(previousRow, row)) return
      merged.set(key, row)
    })
  }
  return Array.from(merged.values())
}

function rtmLineageBaselineOutput(output: GeneratedOutput, outputs: GeneratedOutput[] = []) {
  const raw = output.output || {}
  const documentType = String(output.documentType || raw.documentType || '').trim().toLowerCase()
  if (documentType !== 'traceability_matrix') return null

  const lineageJobIds = [
    raw.updateSummary?.updateOfJobId,
    raw.qualityGate?.updateSummary?.updateOfJobId,
    raw.updateOfJobId,
    output.updateOfJobId,
    raw.updateContext?.previousJobId,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  const currentLedger = Array.isArray(raw.coverageLedger) ? raw.coverageLedger : []
  const currentRows = currentLedger.length
  const coverageSummary = raw.coverageSummary || raw.qualityGate?.coverageSummary || {}
  const previousRowsClaimed = Number(raw.updateSummary?.previousCoverageRows || raw.qualityGate?.updateSummary?.previousCoverageRows || 0) || 0
  const removedRowsClaimed = Number(raw.updateSummary?.removedCoverageRows || raw.qualityGate?.updateSummary?.removedCoverageRows || 0) || 0
  const missingRowsClaimed = Number(coverageSummary.missingCount || raw.updateSummary?.missingCoverageRows || raw.qualityGate?.updateSummary?.missingCoverageRows || 0) || 0
  const looksDeltaOnly = previousRowsClaimed > currentRows || removedRowsClaimed > 0
  const looksCoverageRegressed = previousRowsClaimed > 0 && missingRowsClaimed > 0 && currentRows >= previousRowsClaimed
  if (!looksDeltaOnly && !looksCoverageRegressed) return null

  return outputs.find((candidate) => {
    const candidateId = candidate.jobId || candidate.id
    return lineageJobIds.includes(String(candidateId || ''))
      && String(candidate.status || '').toLowerCase() === 'completed'
      && String(candidate.documentType || candidate.output?.documentType || '').trim().toLowerCase() === 'traceability_matrix'
  }) || null
}

function generatedOutputKey(output?: GeneratedOutput | null) {
  return String(output?.jobId || output?.id || '').trim()
}

function coverageLedgerForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return Array.isArray(raw.coverageLedger) ? raw.coverageLedger : []
}

function coverageSummaryForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return raw.coverageSummary || raw.qualityGate?.coverageSummary || null
}

function batchSummaryForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return raw.batchSummary || raw.progress?.batchSummary || raw.qualityGate?.batchSummary || null
}

function updateSummaryForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return raw.updateSummary || raw.qualityGate?.updateSummary || null
}

function updateLineageJobIds(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return [
    output?.updateOfJobId,
    raw.updateOfJobId,
    raw.updateSummary?.updateOfJobId,
    raw.qualityGate?.updateSummary?.updateOfJobId,
    raw.updateContext?.previousJobId,
    raw.previousUpdateSummary?.updateOfJobId,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function outputRemovedCoverageRows(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return Number(
    raw.updateSummary?.removedCoverageRows
      ?? raw.qualityGate?.updateSummary?.removedCoverageRows
      ?? raw.updateSummary?.coverageRemoved
      ?? 0
  ) || 0
}

function sharedCoverageBaselineOutput(output: GeneratedOutput, outputs: GeneratedOutput[] = []) {
  const documentType = normalizedDocumentType(output.documentType || output.output?.documentType)
  if (!isSharedConfluenceDocumentType(documentType)) return null

  const currentLedgerRows = coverageLedgerForOutput(output).length
  const explicitRemovalRows = outputRemovedCoverageRows(output)
  if (explicitRemovalRows > 0) return null

  const projectKey = output.projectName.trim().toLowerCase()
  const currentCreatedAt = safeTimestamp(output.createdAt) || Date.now()
  const byJobId = new Map<string, GeneratedOutput>()
  outputs.forEach((candidate) => {
    const key = generatedOutputKey(candidate)
    if (key) byJobId.set(key, candidate)
  })

  const lineageCandidates: GeneratedOutput[] = []
  const visited = new Set<string>()
  const visitLineage = (candidate?: GeneratedOutput | null, depth = 0) => {
    const key = generatedOutputKey(candidate)
    if (!candidate || !key || visited.has(key) || depth > 6) return
    visited.add(key)
    lineageCandidates.push(candidate)
    updateLineageJobIds(candidate).forEach((lineageJobId) => visitLineage(byJobId.get(lineageJobId), depth + 1))
  }
  visitLineage(output)

  const sameDocumentCandidates = outputs.filter((candidate) => {
    if (candidate.status !== 'completed') return false
    if (candidate.projectName.trim().toLowerCase() !== projectKey) return false
    if (normalizedDocumentType(candidate.documentType || candidate.output?.documentType) !== documentType) return false
    return safeTimestamp(candidate.createdAt) <= currentCreatedAt
  })

  const uniqueCandidates = new Map<string, GeneratedOutput>()
  ;[...lineageCandidates, ...sameDocumentCandidates].forEach((candidate) => {
    const key = generatedOutputKey(candidate)
    if (key && coverageLedgerForOutput(candidate).length > 0) uniqueCandidates.set(key, candidate)
  })

  const bestCandidate = Array.from(uniqueCandidates.values())
    .sort((left, right) => {
      const rightRows = coverageLedgerForOutput(right).length
      const leftRows = coverageLedgerForOutput(left).length
      if (rightRows !== leftRows) return rightRows - leftRows
      return safeTimestamp(right.createdAt) - safeTimestamp(left.createdAt)
    })[0] || null

  if (!bestCandidate || coverageLedgerForOutput(bestCandidate).length <= currentLedgerRows) return null
  return bestCandidate
}

function backlogEpicsForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return [
    ...asArray(raw.epics),
    ...asArray(raw.jira?.epics),
    ...asArray(raw.backlog?.epics),
  ]
}

function backlogStoriesForOutput(output?: GeneratedOutput | null) {
  const raw = output?.output || {}
  return [
    ...asArray(raw.stories),
    ...asArray(raw.jira?.stories),
    ...asArray(raw.backlog?.stories),
  ]
}

function compactBacklogEpicForUpdate(epic: any) {
  const key = jiraIssueKeyFrom(epic, 'epic')
  const summary = jiraIssueSummaryFrom(epic, 'epic')
  if (!key && !summary) return null
  return {
    jiraEpicKey: key || null,
    epicKey: key || null,
    jiraEpicId: epic?.jiraEpicId || epic?.epicJiraId || epic?.jiraIssueId || epic?.issueId || epic?.id || null,
    jiraEpicSelf: epic?.jiraEpicSelf || epic?.self || null,
    epicCorrelationId: epic?.epicCorrelationId || epic?.epicId || epic?.stableLabel || key || null,
    epicName: summary,
    stableLabel: epic?.stableLabel || null,
    action: 'reuse',
  }
}

function compactBacklogStoryForUpdate(story: any) {
  const key = jiraIssueKeyFrom(story, 'story')
  const summary = jiraIssueSummaryFrom(story, 'story')
  if (!key && !summary) return null
  return {
    jiraStoryKey: key || null,
    storyKey: key || null,
    jiraStoryId: story?.jiraStoryId || story?.storyJiraId || story?.jiraIssueId || story?.issueId || story?.id || null,
    storySelf: story?.storySelf || story?.jiraStorySelf || story?.self || null,
    storyCorrelationId: story?.storyCorrelationId || story?.userStoryId || story?.storyId || story?.stableLabel || key || null,
    parentEpicKey: story?.parentEpicKey || story?.parentEpicJiraKey || story?.jiraEpicKey || story?.epicKey || null,
    parentEpicCorrelationId: story?.parentEpicCorrelationId || story?.epicCorrelationId || null,
    summary,
    stableLabel: story?.stableLabel || null,
    action: 'reuse',
  }
}

function compactBacklogItemsForUpdate(output?: GeneratedOutput | null) {
  const dedupe = <T extends { jiraEpicKey?: string | null; jiraStoryKey?: string | null; epicCorrelationId?: string | null; storyCorrelationId?: string | null }>(items: Array<T | null>, keyFields: Array<keyof T>) => {
    const seen = new Set<string>()
    return items.filter((item): item is T => {
      if (!item) return false
      const key = keyFields.map((field) => String(item[field] || '').trim().toLowerCase()).find(Boolean)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  const epics = dedupe(backlogEpicsForOutput(output).map(compactBacklogEpicForUpdate), ['jiraEpicKey', 'epicCorrelationId'])
  const stories = dedupe(backlogStoriesForOutput(output).map(compactBacklogStoryForUpdate), ['jiraStoryKey', 'storyCorrelationId'])
  return { epics, stories }
}

function backlogLineageBaselineOutput(output: GeneratedOutput, outputs: GeneratedOutput[] = []) {
  const documentType = normalizedDocumentType(output.documentType || output.output?.documentType)
  if (!isBacklogDocumentType(documentType)) return null

  const current = compactBacklogItemsForUpdate(output)
  const projectKey = output.projectName.trim().toLowerCase()
  const currentCreatedAt = safeTimestamp(output.createdAt) || Date.now()
  const byJobId = new Map<string, GeneratedOutput>()
  outputs.forEach((candidate) => {
    const key = generatedOutputKey(candidate)
    if (key) byJobId.set(key, candidate)
  })

  const lineageCandidates: GeneratedOutput[] = []
  const visited = new Set<string>()
  const visitLineage = (candidate?: GeneratedOutput | null, depth = 0) => {
    const key = generatedOutputKey(candidate)
    if (!candidate || !key || visited.has(key) || depth > 6) return
    visited.add(key)
    lineageCandidates.push(candidate)
    updateLineageJobIds(candidate).forEach((lineageJobId) => visitLineage(byJobId.get(lineageJobId), depth + 1))
  }
  visitLineage(output)

  const sameDocumentCandidates = outputs.filter((candidate) => {
    if (candidate.status !== 'completed') return false
    if (candidate.projectName.trim().toLowerCase() !== projectKey) return false
    if (!isBacklogDocumentType(candidate.documentType || candidate.output?.documentType)) return false
    return safeTimestamp(candidate.createdAt) <= currentCreatedAt
  })

  const uniqueCandidates = new Map<string, GeneratedOutput>()
  ;[...lineageCandidates, ...sameDocumentCandidates].forEach((candidate) => {
    const key = generatedOutputKey(candidate)
    const items = compactBacklogItemsForUpdate(candidate)
    if (key && (items.epics.length || items.stories.length)) uniqueCandidates.set(key, candidate)
  })

  const bestCandidate = Array.from(uniqueCandidates.values())
    .sort((left, right) => {
      const leftItems = compactBacklogItemsForUpdate(left)
      const rightItems = compactBacklogItemsForUpdate(right)
      if (rightItems.stories.length !== leftItems.stories.length) return rightItems.stories.length - leftItems.stories.length
      if (rightItems.epics.length !== leftItems.epics.length) return rightItems.epics.length - leftItems.epics.length
      return safeTimestamp(right.createdAt) - safeTimestamp(left.createdAt)
    })[0] || null

  if (!bestCandidate) return null
  const best = compactBacklogItemsForUpdate(bestCandidate)
  if (best.stories.length < current.stories.length || best.epics.length < current.epics.length) return null
  return bestCandidate
}

function normalizeJiraStoryKey(value: any) {
  const text = String(value || '').trim().toUpperCase()
  return /^KAN-\d+$/.test(text) ? text : ''
}

function collectStoryTestCaseKeysForUpdate(raw: any, ledger: any[] = []) {
  const keys = new Set<string>()
  const add = (value: any) => {
    const key = normalizeJiraStoryKey(value)
    if (key) keys.add(key)
  }
  const visit = (value: any, depth = 0) => {
    if (!value || depth > 5) return
    if (Array.isArray(value)) {
      value.slice(0, 2000).forEach((item) => visit(item, depth + 1))
      return
    }
    if (typeof value !== 'object') return
    add(value.storyKey)
    add(value.jiraStoryKey)
    add(value.sourceStoryKey)
    add(value.issueKey)
    add(value.key)
    Object.entries(value).forEach(([field, nested]) => {
      if (/testcase|test_case/i.test(field)) return
      if (/story|coverage|mapping|ledger|batch|repair|publish/i.test(field)) visit(nested, depth + 1)
    })
  }
  visit(ledger)
  visit(raw.coverageLedger)
  visit(raw.coverageSummary)
  visit(raw.batchSummary)
  visit(raw.updateSummary)
  visit(raw.storyCoverage)
  visit(raw.mappings)
  visit(raw.repairTargets)
  visit(raw.publishGaps)
  return Array.from(keys)
}

function collectStoryTestCaseRepairTargetsForRetry(job: GeneratedOutput) {
  const output = job.output || {}
  const sources = [
    output.repairTargets,
    output.publishGaps,
    output.updateSummary?.repairTargets,
    output.updateSummary?.publishGaps,
    output.coverageSummary?.partialItems,
    output.coverageSummary?.missingItems,
    output.coverageSummary?.warningItems,
    output.qualityGate?.coverageSummary?.partialItems,
    output.qualityGate?.coverageSummary?.missingItems,
    output.progress?.details?.repairTargets,
  ].filter(Array.isArray) as any[][]
  const byKey = new Map<string, any>()
  sources.flat().forEach((item) => {
    const key = normalizeJiraStoryKey(item?.storyKey || item?.jiraStoryKey || item?.sourceStoryKey || item?.issueKey || item?.key)
    if (!key) return
    byKey.set(key, {
      storyKey: key,
      storySummary: item.storySummary || item.summary || item.title || item.requirement || item.moduleRequirement || key,
      coverageStatus: item.coverageStatus || item.status || (item.missingPublishedCases ? 'publish_gap' : 'partial'),
      missingCategories: normalizeCategoryLabels(item.missingCategories || item.gapCategories || item.categoriesMissing),
      plannedTestCaseCount: Number(item.plannedTestCaseCount || item.planned || item.modelGeneratedTestCases || 0) || undefined,
      generatedTestCaseCount: Number(item.generatedTestCaseCount || item.generated || item.publishedMappings || 0) || undefined,
      publishGap: item.publishGap || (item.missingPublishedCases ? item : null),
    })
  })
  return Array.from(byKey.values())
}

function compactGeneratedOutputForUpdate(output: GeneratedOutput | null, updateReasons: string[] = [], outputs: GeneratedOutput[] = []) {
  if (!output) return null
  const raw = output.output || {}
  const confluence = raw.confluence || {}
  const tokenUsage = raw.tokenUsage || raw.token_usage || {}
  const documentType = normalizedDocumentType(output.documentType || raw.documentType)
  const baselineOutput = rtmLineageBaselineOutput(output, outputs) || sharedCoverageBaselineOutput(output, outputs)
  const backlogBaselineOutput = backlogLineageBaselineOutput(output, outputs)
  const backlogBaselineItems = backlogBaselineOutput ? compactBacklogItemsForUpdate(backlogBaselineOutput) : compactBacklogItemsForUpdate(output)
  const baselineRaw = baselineOutput?.output || {}
  const previousCoverageLedger = baselineOutput
    ? (documentType === 'traceability_matrix'
      ? mergeRtmCoverageLedgersPreservingBaseline(baselineRaw.coverageLedger, raw.coverageLedger)
      : baselineRaw.coverageLedger)
    : coverageLedgerForOutput(output)
  const previousCoverageSummary = baselineOutput
    ? {
      ...(coverageSummaryForOutput(baselineOutput) || coverageSummaryForOutput(output) || {}),
      coverageLedgerCount: previousCoverageLedger.length,
    }
    : coverageSummaryForOutput(output)
  const previousStoryKeys = documentType === 'story_test_cases'
    ? collectStoryTestCaseKeysForUpdate(raw, previousCoverageLedger)
    : undefined

  return {
    previousJobId: output.jobId || output.id,
    previousRtmBaselineJobId: documentType === 'traceability_matrix' ? baselineOutput?.jobId || baselineOutput?.id || null : null,
    previousCoverageBaselineJobId: baselineOutput?.jobId || baselineOutput?.id || null,
    previousCoverageBaselineRows: baselineOutput ? coverageLedgerForOutput(baselineOutput).length : previousCoverageLedger.length,
    previousBacklogBaselineJobId: isBacklogDocumentType(documentType) ? backlogBaselineOutput?.jobId || backlogBaselineOutput?.id || output.jobId || output.id : null,
    previousBacklogBaselineCounts: isBacklogDocumentType(documentType) ? {
      epics: backlogBaselineItems.epics.length,
      stories: backlogBaselineItems.stories.length,
    } : undefined,
    previousEpics: isBacklogDocumentType(documentType) ? backlogBaselineItems.epics : undefined,
    previousStories: isBacklogDocumentType(documentType) ? backlogBaselineItems.stories : undefined,
    previousDocumentType: output.documentType || raw.documentType || null,
    previousArtifactLabel: output.artifactLabel,
    previousCreatedAt: output.createdAt,
    previousConfluencePageId: confluence.pageId || confluence.id || raw.confluencePageId || raw.confluence_page_id || raw.pageId || raw.page_id || null,
    previousConfluenceUrl: output.url || raw.url || raw.documentUrl || confluence.url || null,
    previousCoverageSummary,
    previousCoverageLedger,
    previousStoryKeys,
    previousBatchSummary: baselineOutput ? batchSummaryForOutput(baselineOutput) || batchSummaryForOutput(output) : batchSummaryForOutput(output),
    previousUpdateSummary: updateSummaryForOutput(output),
    previousTokenUsage: {
      source: tokenUsage.source || 'estimated',
      input: Number(tokenUsage.input ?? tokenUsage.tokensInput ?? raw.tokensInput ?? raw.tokens_input ?? 0) || 0,
      output: Number(tokenUsage.output ?? tokenUsage.tokensOutput ?? raw.tokensOutput ?? raw.tokens_output ?? 0) || 0,
      total: Number(tokenUsage.total ?? tokenUsage.tokensTotal ?? raw.tokensTotal ?? raw.tokens_total ?? 0) || 0,
      estimatedCostUsd: Number(tokenUsage.estimatedCostUsd ?? tokenUsage.estimated_cost_usd ?? raw.estimatedCostUsd ?? raw.estimated_cost_usd ?? 0) || 0,
    },
    previousWordCount: Number(raw.wordCount ?? raw.word_count ?? 0) || 0,
    updateReasons,
    contextUpdated: updateReasons.length > 0,
    deltaRequested: true,
    liveHydrationRequired: true,
    updateSourceOfTruth: 'jira_confluence_live',
  }
}

function latestCompletedKnowledgeJob(projectName: string, jobs: KnowledgeJobRecord[]) {
  const normalizedProject = projectName.trim().toLowerCase()
  if (!normalizedProject) return null
  return jobs
    .filter((job) => job.projectName.trim().toLowerCase() === normalizedProject && job.status === 'completed')
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] || null
}

function latestKnowledgeUpdateTimestamp(projectName: string, jobs: KnowledgeJobRecord[], artifacts: ArtifactRecord[]) {
  const normalizedProject = projectName.trim().toLowerCase()
  if (!normalizedProject) return 0
  const completedJobTimes = jobs
    .filter((job) => job.projectName.trim().toLowerCase() === normalizedProject && job.status === 'completed')
    .map((job) => safeTimestamp(job.createdAt))
  const processedArtifactTimes = artifacts
    .filter((record) => record.projectName.trim().toLowerCase() === normalizedProject && record.status === 'processed')
    .map((record) => safeTimestamp(record.uploadedAt))
  return Math.max(0, ...completedJobTimes, ...processedArtifactTimes)
}

function buildDocumentUpdateDueItems(projects: Project[], artifacts: ArtifactRecord[], outputs: GeneratedOutput[], jobs: KnowledgeJobRecord[]): DocumentUpdateDueItem[] {
  const items: DocumentUpdateDueItem[] = []
  projects.forEach((project) => {
    artifactOptions.forEach((option) => {
      const output = latestCompletedOutputForArtifact(project.name, option.key, outputs)
      if (!output) return
      const reasons = documentUpdateReasons(project.name, option.key, output, artifacts, outputs, jobs)

      if (!reasons.length) return
      items.push({
        id: `${project.id}-${option.key}-${output.jobId || output.id}`,
        projectName: project.name,
        artifact: option.key,
        artifactLabel: option.label,
        jobId: output.jobId || output.id,
        generatedAt: output.createdAt,
        reasons,
      })
    })
  })
  return items.sort((left, right) => safeTimestamp(right.generatedAt) - safeTimestamp(left.generatedAt))
}

function documentUpdateReasons(
  projectName: string,
  artifact: DocumentArtifactKey,
  output: GeneratedOutput | null | undefined,
  artifacts: ArtifactRecord[],
  outputs: GeneratedOutput[],
  jobs: KnowledgeJobRecord[],
) {
  const outputTime = safeTimestamp(output?.createdAt)
  if (!outputTime) return []

  const reasons: string[] = []
  const latestKnowledgeTime = latestKnowledgeUpdateTimestamp(projectName, jobs, artifacts)
  const backlog = latestCompletedOutputForArtifact(projectName, 'epicsAndStories', outputs)
  const storyTestCases = latestCompletedOutputForArtifact(projectName, 'testCases', outputs)
  const backlogTime = safeTimestamp(backlog?.createdAt)
  const storyTestCaseTime = safeTimestamp(storyTestCases?.createdAt)

  if (latestKnowledgeTime && latestKnowledgeTime > outputTime) {
    reasons.push('Knowledge Base was updated after this output was generated.')
  }
  if ((artifact === 'testCases' || artifact === 'traceability_matrix') && backlogTime && backlogTime > outputTime) {
    reasons.push('Epics & User Stories changed after this output was generated.')
  }
  if (artifact === 'traceability_matrix' && storyTestCaseTime && storyTestCaseTime > outputTime) {
    reasons.push('Story Test Cases changed after the RTM was generated.')
  }

  return reasons
}

function safeTimestamp(value?: string | null) {
  if (!value) return 0
  const trimmed = value.trim()
  const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)
    ? `${trimmed.replace(' ', 'T')}Z`
    : trimmed
  const timestamp = new Date(normalized).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function hasKnowledgeWarnings(job: KnowledgeJobRecord | null) {
  if (!job) return false
  return Boolean((job.extractionWarningCount || 0) > 0 || job.extractionWarnings?.length)
}

function buildDeliverableReadinessState(
  artifact: DocumentArtifactKey,
  projectName: string,
  outputs: GeneratedOutput[],
  knowledgeJobs: KnowledgeJobRecord[],
  project?: Project | null
): DeliverableReadinessState {
  const option = artifactOptions.find((item) => item.key === artifact)
  const label = option?.label || 'Selected deliverable'
  const hasSharedCoveragePlanning = artifact === 'strategy' || artifact === 'plan' || artifact === 'risk'
  const hasBacklogCoverageGate = artifact === 'epicsAndStories'
  if (!projectName.trim()) {
    return {
      status: 'idle',
      badgeLabel: 'Select project',
      badgeTone: 'info',
      title: `Select a project to check ${label} readiness`,
      message: 'Q-Ops will check whether the selected project has the context and upstream outputs needed for this deliverable.',
      action: 'Choose a project from the list.',
      details: [],
    }
  }

  const latestKnowledge = latestCompletedKnowledgeJob(projectName, knowledgeJobs)
  const knowledgeReady = Boolean(latestKnowledge || project?.status === 'ready')
  const backlog = latestCompletedGeneratedOutput(projectName, outputs, (output) => {
    const artifactKey = resolveArtifactKey(output)
    const documentType = String(output.documentType || output.output?.documentType || '').trim().toLowerCase()
    return artifactKey === 'epicsAndStories' || documentType === 'user_stories'
  })
  const storyTestCases = latestCompletedGeneratedOutput(projectName, outputs, (output) => {
    const artifactKey = resolveArtifactKey(output)
    const documentType = String(output.documentType || output.output?.documentType || '').trim().toLowerCase()
    return artifactKey === 'testCases' || documentType === 'story_test_cases' || documentType === 'test_cases'
  })

  if (!knowledgeReady) {
    return {
      status: 'blocked',
      badgeLabel: 'Needs setup',
      badgeTone: 'error',
      title: `${label} is not ready yet`,
      message: 'This project does not have a completed knowledge base available in the workspace yet. Generation needs retrieval-ready project context.',
      action: 'Create or complete the knowledge base first, then return to document generation.',
      details: ['Completed knowledge base is missing.'],
    }
  }

  if (artifact === 'testCases' && !backlog) {
    return {
      status: 'blocked',
      badgeLabel: 'Needs setup',
      badgeTone: 'error',
      title: 'Story Test Cases are not ready yet',
      message: 'Story Test Cases need generated Epics & User Stories so Q-Ops can create and link test cases to real story keys.',
      action: 'Generate Epics & User Stories first, then generate Story Test Cases.',
      details: ['Epics & User Stories are missing.'],
    }
  }

  if (artifact === 'traceability_matrix') {
    const missing = [
      !backlog ? 'Epics & User Stories' : '',
      !storyTestCases ? 'Story Test Cases' : '',
    ].filter(Boolean)

    if (missing.length) {
      return {
        status: 'blocked',
        badgeLabel: 'Needs setup',
        badgeTone: 'error',
        title: 'Traceability Matrix is not ready yet',
        message: `This project is missing ${missing.join(' and ')}. RTM needs both so it can map requirements to backlog items and generated test cases.`,
        action: 'Generate the missing upstream output first, then return to Traceability Matrix.',
        details: missing,
      }
    }
  }

  const knowledgeTime = safeTimestamp(latestKnowledge?.createdAt)
  const backlogTime = safeTimestamp(backlog?.createdAt)
  const storyTestCaseTime = safeTimestamp(storyTestCases?.createdAt)
  const warnings: string[] = []

  if (hasKnowledgeWarnings(latestKnowledge)) {
    warnings.push('The latest knowledge ingestion completed with extraction warnings.')
  }
  if ((artifact === 'testCases' || artifact === 'traceability_matrix') && knowledgeTime && backlogTime && knowledgeTime > backlogTime) {
    warnings.push('Knowledge base was updated after Epics & User Stories were generated.')
  }
  if (artifact === 'traceability_matrix' && knowledgeTime && storyTestCaseTime && knowledgeTime > storyTestCaseTime) {
    warnings.push('Knowledge base was updated after Story Test Cases were generated.')
  }
  if (artifact === 'traceability_matrix' && backlogTime && storyTestCaseTime && backlogTime > storyTestCaseTime) {
    warnings.push('Epics & User Stories are newer than Story Test Cases.')
  }

  if (warnings.length) {
    return {
      status: 'warning',
      badgeLabel: 'Review recommended',
      badgeTone: 'warning',
      title: `${label} can be generated, but review is recommended`,
      message: hasBacklogCoverageGate
        ? 'Q-Ops will run the backlog coverage gate before creating Jira issues, but source extraction warnings may reduce confidence in the generated scope.'
        : hasSharedCoveragePlanning
        ? 'Q-Ops will allow generation and run coverage-planning checks, but source extraction warnings may reduce confidence in the final ledger.'
        : 'Q-Ops will allow generation, but the output may be less complete or may reflect older upstream mappings.',
      action: artifact === 'testCases'
        ? 'For best results, regenerate Epics & User Stories if the knowledge base changed.'
        : artifact === 'traceability_matrix'
          ? 'For the cleanest audit trail, regenerate the stale upstream output before generating RTM.'
          : hasBacklogCoverageGate
            ? 'Review the backlog coverage summary after generation and refresh the knowledge base if source warnings look material.'
          : hasSharedCoveragePlanning
            ? 'Review the Coverage Ledger in the generated document and refresh the knowledge base if source warnings look material.'
            : 'Review the generated output carefully and refresh the knowledge base if needed.',
      details: warnings,
    }
  }

  return {
    status: 'ready',
    badgeLabel: 'Ready',
    badgeTone: 'success',
    title: `${label} is ready`,
    message: artifact === 'traceability_matrix'
      ? 'Epics & User Stories and Story Test Cases are available for this project. Q-Ops will still recheck freshness when the job is queued.'
      : hasBacklogCoverageGate
        ? 'The selected project has retrieval-ready context. Q-Ops will run a backlog coverage gate before creating Jira issues.'
      : hasSharedCoveragePlanning
        ? 'The selected project has retrieval-ready context. Q-Ops will also include a coverage ledger to show which source signals were used.'
      : 'The selected project has retrieval-ready context for this deliverable.',
    action: `You can generate ${label} now.`,
    details: artifact === 'traceability_matrix'
      ? ['Knowledge base, backlog, and story test-case coverage are in the expected order.']
      : hasBacklogCoverageGate
        ? ['Knowledge base is available for retrieval.', 'Backlog coverage gate is enabled before Jira issue creation.']
      : hasSharedCoveragePlanning
        ? ['Knowledge base is available for retrieval.', 'Coverage planning is enabled for this deliverable.']
      : ['Knowledge base is available for retrieval.'],
  }
}

function mergeGeneratedOutputs(current: GeneratedOutput[], incoming: GeneratedOutput[]) {
  const incomingKeys = new Set(incoming.map((item) => item.jobId || item.id))
  const mergedIncoming = incoming.map((item) => {
    const existing = current.find((candidate) => (candidate.jobId || candidate.id) === (item.jobId || item.id))
    const nextStatus = normalizeGeneratedOutputStatus(item.status)
    if (!existing) return {
      ...item,
      error: nextStatus === 'completed' ? null : item.error,
    }
    return {
      ...existing,
      ...item,
      artifactKey: item.artifactKey || existing.artifactKey,
      documentType: item.documentType || existing.documentType,
      projectId: item.projectId || existing.projectId,
      output: item.output ?? existing.output,
      url: item.url || existing.url,
      error: nextStatus === 'completed' ? null : (Object.prototype.hasOwnProperty.call(item, 'error') ? item.error : existing.error),
      retriedAt: item.retriedAt || existing.retriedAt,
      retriedByJobId: item.retriedByJobId || existing.retriedByJobId,
      retryOfJobId: item.retryOfJobId || existing.retryOfJobId,
      retryStatus: item.retryStatus || existing.retryStatus,
      retryAttempt: item.retryAttempt ?? existing.retryAttempt,
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
    const nextStatus = normalizeGeneratedOutputStatus(patch.status || item.status)
    const hasPatchError = Object.prototype.hasOwnProperty.call(patch, 'error')
    return {
      ...item,
      ...patch,
      output: Object.prototype.hasOwnProperty.call(patch, 'output') ? patch.output : item.output,
      url: patch.url || item.url,
      artifactKey: patch.artifactKey || item.artifactKey,
      documentType: patch.documentType || item.documentType,
      projectId: patch.projectId || item.projectId,
      retryOfJobId: patch.retryOfJobId ?? item.retryOfJobId,
      retriedByJobId: patch.retriedByJobId ?? item.retriedByJobId,
      retryStatus: patch.retryStatus ?? item.retryStatus,
      retryAttempt: patch.retryAttempt ?? item.retryAttempt,
      error: nextStatus === 'completed' ? null : (hasPatchError ? patch.error : item.error),
    }
  })
  return found ? next : current
}

function normalizeKnowledgeJobStatus(value?: string): Exclude<JobStatus, 'idle'> {
  if (value === 'queued' || value === 'pending' || value === 'processing' || value === 'completed' || value === 'failed' || value === 'not_found') return value
  if (value === 'preparing' || value === 'hydrating') return 'pending'
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

function numberFromUnknown(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function extractionObservabilityFromOutput(output: any) {
  const observability = output?.extractionObservability || output?.extraction_observability || {}
  const tokenUsage = output?.tokenUsage || output?.token_usage || {}
  const files = Array.isArray(observability.files) ? observability.files : []
  const file = files[0] || {}
  const warnings = Array.isArray(observability.warnings)
    ? observability.warnings
    : Array.isArray(output?.warnings)
      ? output.warnings
      : []
  const cleanWarnings = warnings.map((warning: unknown) => String(warning || '').trim()).filter(Boolean)
  const warningCount = Number(observability.warningCount ?? observability.warning_count ?? output?.warningCount ?? cleanWarnings.length) || cleanWarnings.length
  const extractionMetrics: ExtractionMetrics = {
    fileName: file.fileName || file.file_name || output?.fileName,
    docType: file.docType || file.doc_type || output?.docType,
    fileType: file.fileType || file.file_type || output?.fileType,
    chunks: numberFromUnknown(output?.totalChunksStored ?? output?.total_chunks_stored ?? output?.chunkCount ?? output?.chunk_count),
    words: numberFromUnknown(tokenUsage.embeddedWordCount ?? tokenUsage.embedded_word_count ?? output?.wordCount ?? output?.word_count),
    tokens: numberFromUnknown(tokenUsage.tokensTotal ?? tokenUsage.tokens_total ?? output?.tokensTotal ?? output?.tokens_total),
    costUsd: numberFromUnknown(tokenUsage.estimatedCostUsd ?? tokenUsage.estimated_cost_usd ?? output?.estimatedCostUsd ?? output?.estimated_cost_usd),
    durationMs: numberFromUnknown(file.durationMs ?? file.duration_ms ?? observability.durationMs ?? observability.duration_ms),
    fileSizeBytes: numberFromUnknown(file.fileSizeBytes ?? file.file_size_bytes ?? observability.fileSizeBytes ?? observability.file_size_bytes),
    responseBytesEstimated: numberFromUnknown(file.responseBytesEstimated ?? file.response_bytes_estimated ?? observability.responseBytesEstimated ?? observability.response_bytes_estimated),
    tables: numberFromUnknown(file.tableCount ?? file.table_count ?? observability.tableCount ?? observability.table_count),
    annotations: numberFromUnknown(file.annotationCount ?? file.annotation_count ?? observability.annotationCount ?? observability.annotation_count),
    links: numberFromUnknown(file.linkCount ?? file.link_count ?? observability.linkCount ?? observability.link_count),
    visualCandidates: numberFromUnknown(file.visualCandidatesDetected ?? file.visual_candidates_detected ?? observability.visualCandidatesDetected ?? observability.visual_candidates_detected),
    warnings: warningCount,
  }
  return {
    extractionWarnings: cleanWarnings,
    extractionWarningCount: warningCount,
    extractionObservability: Object.keys(observability).length ? observability : undefined,
    extractionMetrics: Object.values(extractionMetrics).some((value) => Boolean(value)) ? extractionMetrics : undefined,
  }
}

function ExtractionWarningsInline({ warnings = [], count = 0 }: { warnings?: string[]; count?: number }) {
  const total = Number(count) || warnings.length
  if (!total) return null
  return (
    <details className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
      <summary className="cursor-pointer font-bold">
        {total} extractor warning{total === 1 ? '' : 's'}
      </summary>
      {warnings.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 leading-5">
          {warnings.slice(0, 5).map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
          {warnings.length > 5 ? <li>{warnings.length - 5} more warning{warnings.length - 5 === 1 ? '' : 's'} available in audit metadata.</li> : null}
        </ul>
      ) : (
        <p className="mt-2 leading-5">The extractor reported warnings for this run. Check audit details for full diagnostics.</p>
      )}
    </details>
  )
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
  const extractionPatch = extractionObservabilityFromOutput(item.output || item)
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
    extractionMetrics: item.extractionMetrics || extractionPatch.extractionMetrics,
    extractionWarnings: extractionPatch.extractionWarnings,
    extractionWarningCount: extractionPatch.extractionWarningCount,
  }
}

function knowledgeStatusFromArtifactStatus(status?: ArtifactRecord['status']): Exclude<JobStatus, 'idle'> {
  if (status === 'processed') return 'completed'
  if (status === 'failed') return 'failed'
  return 'processing'
}

function knowledgeStatusFromArtifactGroup(records: ArtifactRecord[]): Exclude<JobStatus, 'idle'> {
  if (records.some((record) => record.status === 'processing')) return 'processing'
  if (records.some((record) => record.status === 'failed')) return 'failed'
  return 'completed'
}

function isBackendIngestionJobId(value?: string | null) {
  return /^ING-\d{6}-[A-Z0-9]+$/i.test(String(value || '').trim())
}

function artifactBackendJobId(record: Pick<ArtifactRecord, 'id' | 'jobId'>) {
  if (isBackendIngestionJobId(record.jobId)) return record.jobId || ''
  const idPrefix = String(record.id || '').split(':')[0]
  return isBackendIngestionJobId(idPrefix) ? idPrefix : ''
}

function artifactBackedKnowledgeJob(records: ArtifactRecord[]): KnowledgeJobRecord | null {
  if (!records.length) return null
  const sorted = [...records].sort((left, right) => artifactAttemptTime(right) - artifactAttemptTime(left))
  const latest = sorted[0]
  const jobId = artifactBackendJobId(latest)
  if (!jobId) return null
  const metrics = aggregateExtractionMetrics(records) || latest.extractionMetrics
  const warnings = records.flatMap((record) => record.extractionWarnings || [])
  const warningCount = records.reduce((sum, record) => sum + Number(record.extractionWarningCount || record.extractionMetrics?.warnings || 0), 0)
  return {
    id: jobId,
    jobId,
    projectName: latest.projectName,
    fileName: records.length === 1 ? latest.fileName : `${records.length} artifacts`,
    fileKey: records.length === 1 ? latest.type : 'Knowledge batch',
    processingClass: records.length === 1 ? latest.type : 'Knowledge batch',
    createdAt: latest.uploadedAt,
    status: knowledgeStatusFromArtifactGroup(records),
    extractionMetrics: metrics,
    extractionWarnings: warnings,
    extractionWarningCount: warningCount,
  }
}

function mergeKnowledgeJobsWithArtifacts(jobs: KnowledgeJobRecord[], artifacts: ArtifactRecord[]) {
  const byJobId = new Map<string, KnowledgeJobRecord>()
  jobs.forEach((job) => {
    const key = job.jobId || job.id
    if (key) byJobId.set(key, job)
  })

  const artifactsByJobId = new Map<string, ArtifactRecord[]>()
  artifacts.forEach((artifact) => {
    const key = artifactBackendJobId(artifact)
    if (!key) return
    artifactsByJobId.set(key, [...(artifactsByJobId.get(key) || []), artifact])
  })

  artifactsByJobId.forEach((records, key) => {
    const artifactJob = artifactBackedKnowledgeJob(records)
    if (!artifactJob) return
    const existing = byJobId.get(key)
    if (!existing) {
      byJobId.set(key, artifactJob)
      return
    }
    byJobId.set(key, {
      ...artifactJob,
      ...existing,
      fileName: existing.fileName || artifactJob.fileName,
      fileKey: existing.fileKey || artifactJob.fileKey,
      processingClass: existing.processingClass || artifactJob.processingClass,
      createdAt: existing.createdAt || artifactJob.createdAt,
      extractionMetrics: existing.extractionMetrics || artifactJob.extractionMetrics,
      extractionWarnings: existing.extractionWarnings?.length ? existing.extractionWarnings : artifactJob.extractionWarnings,
      extractionWarningCount: existing.extractionWarningCount || artifactJob.extractionWarningCount,
    })
  })

  return Array.from(byJobId.values())
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
}

function retryKeyPart(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function artifactRetryKey(record: Pick<ArtifactRecord, 'projectName' | 'fileName' | 'type'>) {
  return [
    retryKeyPart(record.projectName),
    retryKeyPart(record.fileName),
    retryKeyPart(record.type),
  ].join('|')
}

function artifactSourceJobId(record: Pick<ArtifactRecord, 'id' | 'jobId'>) {
  return record.jobId || String(record.id || '').split(':')[0] || ''
}

function artifactAttemptTime(record: Pick<ArtifactRecord, 'uploadedAt' | 'jobId' | 'id'>) {
  const timestamp = new Date(record.uploadedAt || '').getTime()
  if (Number.isFinite(timestamp)) return timestamp
  const jobDate = String(record.jobId || record.id || '').match(/ING-(\d{6})-/)?.[1]
  if (!jobDate) return 0
  const day = Number(jobDate.slice(0, 2))
  const month = Number(jobDate.slice(2, 4)) - 1
  const year = 2000 + Number(jobDate.slice(4, 6))
  return new Date(year, month, day).getTime()
}

function buildArtifactLatestAttemptMap(records: ArtifactRecord[]) {
  const latest = new Map<string, ArtifactRecord>()
  records.forEach((record) => {
    const key = artifactRetryKey(record)
    if (!key.replace(/\|/g, '')) return
    const existing = latest.get(key)
    if (!existing || artifactAttemptTime(record) >= artifactAttemptTime(existing)) {
      latest.set(key, record)
    }
  })
  return latest
}

function artifactRetryState(record: ArtifactRecord, latestAttempts: Map<string, ArtifactRecord>): ArtifactRetryState {
  if (record.status !== 'failed') return 'none'
  const latest = latestAttempts.get(artifactRetryKey(record))
  if (!latest || (latest.id === record.id && latest.jobId === record.jobId)) return 'actionable'
  if (latest.status === 'processed') return 'recovered'
  if (latest.status === 'processing') return 'retrying'
  return 'superseded'
}

function artifactDisplayStatus(record: ArtifactRecord, latestAttempts: Map<string, ArtifactRecord>): ArtifactDisplayStatus {
  const retryState = artifactRetryState(record, latestAttempts)
  if (retryState === 'recovered' || retryState === 'superseded') return 'recovered'
  if (retryState === 'retrying') return 'retrying'
  if (record.status === 'failed') return 'needs_retry'
  return record.status === 'processed' ? 'processed' : 'processing'
}

function artifactRetrySummary(records: ArtifactRecord[]) {
  const latestAttempts = buildArtifactLatestAttemptMap(records)
  return records.reduce(
    (summary, record) => {
      const displayStatus = artifactDisplayStatus(record, latestAttempts)
      const retryState = artifactRetryState(record, latestAttempts)
      if (displayStatus === 'processed') summary.processed += 1
      if (displayStatus === 'needs_retry') summary.needsRetry += 1
      if (displayStatus === 'recovered') summary.recovered += 1
      if (displayStatus === 'processing') summary.processing += 1
      if (displayStatus === 'retrying') summary.retrying += 1
      if (retryState === 'actionable') summary.reprocessCandidates += 1
      return summary
    },
    { processed: 0, needsRetry: 0, recovered: 0, processing: 0, retrying: 0, reprocessCandidates: 0 },
  )
}

function retryStateLabel(state: ArtifactRetryState) {
  if (state === 'recovered') return 'Recovered'
  if (state === 'retrying') return 'Retry in progress'
  if (state === 'superseded') return 'Moved to newer retry'
  return ''
}

function retryStateTone(state: ArtifactRetryState): StatusTone {
  if (state === 'recovered') return 'success'
  if (state === 'retrying') return 'info'
  return 'warning'
}

function matchKnowledgeJobArtifacts(job: KnowledgeJobRecord, records: ArtifactRecord[]) {
  const exact = job.jobId ? records.filter((record) => record.jobId === job.jobId) : []
  if (exact.length) return exact

  const projectName = retryKeyPart(job.projectName)
  const fileName = retryKeyPart(job.fileName)
  const fileKey = retryKeyPart(job.fileKey)

  if (fileName || fileKey) {
    const matching = records.filter((record) => {
      if (retryKeyPart(record.projectName) !== projectName) return false
      if (fileName && retryKeyPart(record.fileName) !== fileName) return false
      if (fileKey && retryKeyPart(record.type) !== fileKey) return false
      return true
    })
    if (matching.length) return matching
  }

  return records.filter((record) => retryKeyPart(record.projectName) === projectName && record.status === 'failed')
}

function knowledgeJobRetryState(job: KnowledgeJobRecord, records: ArtifactRecord[], jobs: KnowledgeJobRecord[], latestAttempts: Map<string, ArtifactRecord>, visited = new Set<string>()): ArtifactRetryState {
  if (job.status !== 'failed') return 'none'
  const jobKey = job.jobId || job.id
  if (visited.has(jobKey)) return 'superseded'
  visited.add(jobKey)

  const retryIds = job.retriedByJobIds || []
  if (retryIds.length) {
    const retryJobs = jobs.filter((candidate) => retryIds.includes(candidate.jobId || candidate.id))
    const retryStates = retryJobs.map((candidate) => knowledgeJobRetryState(candidate, records, jobs, latestAttempts, new Set(visited)))
    if (retryJobs.some((candidate) => candidate.status === 'completed') || retryStates.includes('recovered')) return 'recovered'
    if (
      retryJobs.some((candidate) => candidate.status === 'queued' || candidate.status === 'pending' || candidate.status === 'processing') ||
      retryStates.includes('retrying')
    ) return 'retrying'
    return 'superseded'
  }

  const relatedArtifacts = matchKnowledgeJobArtifacts(job, records)
  if (!relatedArtifacts.length) return 'actionable'
  const states = relatedArtifacts.map((record) => artifactRetryState(record, latestAttempts))
  if (states.includes('actionable')) return 'actionable'
  if (states.includes('retrying')) return 'retrying'
  if (states.includes('recovered')) return 'recovered'
  return 'superseded'
}

function findRecoveredRetryJobId(job: KnowledgeJobRecord, jobs: KnowledgeJobRecord[], visited = new Set<string>()): string | null {
  const key = job.jobId || job.id
  if (visited.has(key)) return null
  visited.add(key)

  for (const retryId of job.retriedByJobIds || []) {
    const retryJob = jobs.find((candidate) => (candidate.jobId || candidate.id) === retryId)
    if (!retryJob) continue
    if (retryJob.status === 'completed') return retryJob.jobId || retryJob.id
    const descendant = findRecoveredRetryJobId(retryJob, jobs, visited)
    if (descendant) return descendant
  }

  return null
}

function latestRetryJobId(job: KnowledgeJobRecord, jobs: KnowledgeJobRecord[], visited = new Set<string>()): string | null {
  const key = job.jobId || job.id
  if (visited.has(key)) return null
  visited.add(key)

  const retryIds = job.retriedByJobIds || []
  for (let index = retryIds.length - 1; index >= 0; index -= 1) {
    const retryId = retryIds[index]
    const retryJob = jobs.find((candidate) => (candidate.jobId || candidate.id) === retryId)
    const descendant = retryJob ? latestRetryJobId(retryJob, jobs, visited) : null
    return descendant || retryId
  }

  return null
}

function generationJobRetryState(job: GeneratedOutput, jobs: GeneratedOutput[], visited = new Set<string>()): ArtifactRetryState {
  if (job.status !== 'failed') return 'none'
  const key = job.jobId || job.id
  if (visited.has(key)) return 'superseded'
  visited.add(key)

  if (job.retriedByJobId) {
    const retryJob = jobs.find((candidate) => (candidate.jobId || candidate.id) === job.retriedByJobId)
    if (!retryJob) return 'superseded'
    if (retryJob.status === 'completed') return 'recovered'
    if (isActiveDocumentStatus(retryJob.status)) return 'retrying'
    const retryState = generationJobRetryState(retryJob, jobs, new Set(visited))
    if (retryState === 'recovered' || retryState === 'retrying') return retryState
    return 'superseded'
  }

  if (job.retryStatus === 'recovered') return 'recovered'
  if (job.retryStatus === 'retrying') return 'retrying'

  return 'actionable'
}

function generationDisplayStatus(job: GeneratedOutput, jobs: GeneratedOutput[]): RetryDisplayStatus {
  const retryState = generationJobRetryState(job, jobs)
  if (retryState === 'recovered' || retryState === 'superseded') return 'recovered'
  if (retryState === 'retrying') return 'retrying'
  if (job.status === 'failed') return 'needs_retry'
  if (job.status === 'completed') return 'completed'
  return 'processing'
}

function findRecoveredGenerationRetryJobId(job: GeneratedOutput, jobs: GeneratedOutput[], visited = new Set<string>()): string | null {
  const key = job.jobId || job.id
  if (visited.has(key)) return null
  visited.add(key)

  if (!job.retriedByJobId) return null
  const retryJob = jobs.find((candidate) => (candidate.jobId || candidate.id) === job.retriedByJobId)
  if (!retryJob) return null
  if (retryJob.status === 'completed') return retryJob.jobId || retryJob.id
  return findRecoveredGenerationRetryJobId(retryJob, jobs, visited)
}

function latestGenerationRetryJobId(job: GeneratedOutput, jobs: GeneratedOutput[], visited = new Set<string>()): string | null {
  const key = job.jobId || job.id
  if (visited.has(key)) return null
  visited.add(key)
  if (!job.retriedByJobId) return null
  const retryJob = jobs.find((candidate) => (candidate.jobId || candidate.id) === job.retriedByJobId)
  const descendant = retryJob ? latestGenerationRetryJobId(retryJob, jobs, visited) : null
  return descendant || job.retriedByJobId
}

function metricUsageValue(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function metricHasGenerationUsage(metric?: ApiJobMetric | null) {
  if (!metric) return false
  return Boolean(metricUsageValue(metric.wordCount) || metricUsageValue(metric.tokensTotal) || metricUsageValue(metric.estimatedCostUsd))
}

function buildGenerationMetricMap(metrics: ApiJobMetric[] = []) {
  const byJobId = new Map<string, ApiJobMetric>()
  metrics.forEach((metric) => {
    const jobId = String(metric.jobId || '').trim()
    if (!jobId || !metricHasGenerationUsage(metric)) return
    const existing = byJobId.get(jobId)
    if (!existing) {
      byJobId.set(jobId, metric)
      return
    }
    const existingScore = metricUsageValue(existing.wordCount) + metricUsageValue(existing.tokensTotal) + metricUsageValue(existing.estimatedCostUsd)
    const nextScore = metricUsageValue(metric.wordCount) + metricUsageValue(metric.tokensTotal) + metricUsageValue(metric.estimatedCostUsd)
    if (nextScore > existingScore) byJobId.set(jobId, metric)
  })
  return byJobId
}

function buildGenerationMetadataMap(metrics: ApiJobMetric[] = []) {
  const byJobId = new Map<string, { generationMode?: GeneratedOutput['generationMode']; updateOfJobId?: string | null; retryOfJobId?: string | null }>()
  metrics.forEach((metric) => {
    const jobId = String(metric.jobId || '').trim()
    if (!jobId) return
    const metadata = metric.metadata || {}
    const current = byJobId.get(jobId) || {}
    const rawMode = String(metadata.generation_mode || '').trim().toLowerCase()
    const event = String(metric.event || '').trim().toUpperCase()
    const generationMode = metadata.update === true || event === 'JOB_UPDATE_QUEUED'
      ? 'update'
      : rawMode === 'update' || rawMode === 'retry' || rawMode === 'create'
        ? rawMode as GeneratedOutput['generationMode']
        : current.generationMode
    byJobId.set(jobId, {
      generationMode,
      updateOfJobId: current.updateOfJobId || metadata.update_of_job_id || null,
      retryOfJobId: current.retryOfJobId || metadata.retry_of_job_id || null,
    })
  })
  return byJobId
}

function enrichGeneratedOutputWithMetric(output: GeneratedOutput, metric?: ApiJobMetric | null): GeneratedOutput {
  if (!metricHasGenerationUsage(metric)) return output
  const existingOutput = output.output || {}
  const existingTokenUsage = existingOutput.tokenUsage || existingOutput.token_usage || {}
  const tokensTotal = metricUsageValue(metric?.tokensTotal)
  const estimatedCostUsd = metricUsageValue(metric?.estimatedCostUsd)
  const wordCount = metricUsageValue(metric?.wordCount)
  return {
    ...output,
    output: {
      ...existingOutput,
      wordCount: existingOutput.wordCount ?? existingOutput.word_count ?? (wordCount || undefined),
      tokensTotal: existingOutput.tokensTotal ?? existingOutput.tokens_total ?? (tokensTotal || undefined),
      estimatedCostUsd: existingOutput.estimatedCostUsd ?? existingOutput.estimated_cost_usd ?? (estimatedCostUsd || undefined),
      tokenUsage: {
        ...existingTokenUsage,
        total: existingTokenUsage.total ?? existingTokenUsage.tokensTotal ?? existingTokenUsage.tokens_total ?? (tokensTotal || undefined),
        estimatedCostUsd: existingTokenUsage.estimatedCostUsd ?? existingTokenUsage.estimated_cost_usd ?? (estimatedCostUsd || undefined),
        source: existingTokenUsage.source || 'recorded_metric',
      },
    },
  }
}

function enrichGeneratedOutputWithMetadata(
  output: GeneratedOutput,
  metadata?: { generationMode?: GeneratedOutput['generationMode']; updateOfJobId?: string | null; retryOfJobId?: string | null } | null
): GeneratedOutput {
  if (!metadata) return output
  return {
    ...output,
    generationMode: output.generationMode || metadata.generationMode,
    updateOfJobId: output.updateOfJobId || metadata.updateOfJobId || null,
    retryOfJobId: output.retryOfJobId || metadata.retryOfJobId || undefined,
  }
}

function normalizeGeneratedDocument(item: ApiGeneratedDocument): GeneratedOutput {
  const artifactKey = mapDocumentTypeToArtifact(item.documentType || item.artifactLabel)
  const status = normalizeGeneratedOutputStatus(item.status)
  const input = item.input || {}
  const inputUpdateContext = input.updateContext || {}
  const inputRetryContext = input.retryContext || {}
  const generationMode = (
    item.generationMode
    || input.generationMode
    || inputRetryContext.generationMode
    || item.output?.generationMode
    || item.output?.metadata?.generation_mode
  ) as GeneratedOutput['generationMode']
  const updateOfJobId = item.updateOfJobId
    || input.updateOfJobId
    || inputUpdateContext.previousJobId
    || inputUpdateContext.previous_job_id
    || inputRetryContext.updateOfJobId
    || item.output?.updateOfJobId
    || item.output?.updateContext?.previousJobId
    || item.output?.metadata?.update_of_job_id
    || null
  return {
    id: item.id || item.jobId || uid('output'),
    jobId: item.jobId,
    projectId: item.projectId || item.output?.destination?.projectId,
    projectName: item.projectName || 'Unknown project',
    artifactKey: artifactKey || undefined,
    artifactLabel: item.artifactLabel || documentTypeLabel(item.documentType),
    documentType: item.documentType,
    createdAt: item.createdAt || new Date().toISOString(),
    status,
    url: item.url || outputUrl(item.output),
    input,
    output: item.output,
    error: status === 'completed' ? null : item.error,
    retryOfJobId: item.retryOfJobId || undefined,
    retriedByJobId: item.retriedByJobId || undefined,
    retryStatus: item.retryStatus || undefined,
    retryAttempt: item.retryAttempt,
    generationMode,
    updateOfJobId,
  }
}

function formatArtifactType(value?: string): string {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return 'Artifact'
  if (normalized === 'brd' || normalized === 'frd' || normalized === 'hld' || normalized === 'lld') return normalized.toUpperCase()
  if (normalized === 'image' || normalized.startsWith('image')) return 'UI Design'
  if (normalized === 'transcript' || normalized.startsWith('transcript')) return 'Transcript'
  if (normalized === 'supporting' || normalized.startsWith('supporting')) return 'Supporting'
  return String(value)
}

function humanizeAuditAction(action?: string) {
  const normalized = String(action || '').trim()
  const upper = normalized.toUpperCase()
  const labels: Record<string, string> = {
    PROJECT_CREATED: 'Project created',
    USER_UPDATED: 'User updated',
    USER_PROJECT_ASSIGNMENTS_UPDATED: 'Project access updated',
    SETTINGS_PROJECT_INTEGRATION_UPDATED: 'Project settings updated',
    JOB_COMPLETED: 'Job completed',
    JOB_FAILED: 'Job failed',
    JOB_STARTED: 'Job started',
    GENERATION_COMPLETED: 'Generation completed',
    GENERATION_FAILED: 'Generation failed',
    INGESTION_COMPLETED: 'Ingestion completed',
    QUALITY_GATE_PASSED: 'Quality gate passed',
    QUALITY_GATE_FAILED: 'Quality gate failed',
  }
  return labels[upper] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function friendlyNotificationText(event: AuditEvent) {
  const action = String(event.action || '').toUpperCase().replace(/\s+/g, '_')
  const details = String(event.details || '')
  const entity = event.entity && event.entity !== 'Workflow' ? event.entity : ''
  const project = event.project && event.project !== 'Backend' ? event.project : ''
  if (action === 'PROJECT_CREATED') {
    return { title: 'Project created', message: project ? `${project} is ready for knowledge upload.` : 'A project is ready for knowledge upload.' }
  }
  if (action === 'USER_UPDATED') {
    return { title: 'User access updated', message: details || 'User profile or project access was updated.' }
  }
  if (action === 'USER_PROJECT_ASSIGNMENTS_UPDATED' || action === 'PROJECT_ACCESS_UPDATED') {
    return { title: 'Project access updated', message: details || 'Project access was updated for a user.' }
  }
  if (action === 'SETTINGS_PROJECT_INTEGRATION_UPDATED') {
    return { title: 'Project settings saved', message: project ? `Integration settings were updated for ${project}.` : 'Project integration settings were updated.' }
  }
  if (action === 'INGESTION_COMPLETED') {
    return { title: 'Knowledge base updated', message: project ? `${project} has processed artifact updates.` : 'Knowledge base processing completed.' }
  }
  if (action === 'GENERATION_COMPLETED') {
    return { title: 'Document generated', message: project ? `${project} document generation completed.` : 'Document generation completed.' }
  }
  if (action === 'JOB_COMPLETED') {
    const pipeline = details.split('|')[0]?.trim()
    return { title: 'Job completed', message: [project, pipeline, entity].filter(Boolean).join(' | ') || 'A backend job completed.' }
  }
  if (event.status === 'error' || action.includes('FAILED')) {
    return { title: 'Job needs attention', message: [project, details || entity].filter(Boolean).join(': ') || 'A backend job failed.' }
  }
  return { title: humanizeAuditAction(event.action), message: [project, details || entity].filter(Boolean).join(': ') || 'Workspace activity was recorded.' }
}

function isIngestionLifecycleSuccess(event: Pick<AuditEvent, 'action' | 'details' | 'status'>) {
  const action = String(event.action || '').toUpperCase().replace(/\s+/g, '_')
  const details = String(event.details || '').toLowerCase()
  const success = event.status === 'success' || event.status === 'info'
  if (!success) return false
  if (action === 'INGESTION_COMPLETED') return true
  if (action === 'JOB_COMPLETED' && details.includes('ingestion')) return true
  return false
}

function isRoutineNotificationTitle(title?: string) {
  const normalized = String(title || '').toUpperCase().replace(/\s+/g, '_')
  return new Set([
    'JOB_STARTED',
    'GENERATOR_STARTED',
    'JOB_QUEUED',
    'JOB_RETRIED',
    'QUALITY_GATE_PASSED',
  ]).has(normalized)
}

function isBackendNotificationId(id?: string) {
  return String(id || '').startsWith('backend-')
}

function normalizeNotificationForFeed(notification: NotificationEvent): NotificationEvent {
  const titleKey = String(notification.title || '').toUpperCase().replace(/\s+/g, '_')
  if (titleKey !== 'PROJECT_CREATED' && !String(notification.message || '').includes(': PROJECT_CREATED:')) {
    return isBackendNotificationId(notification.id) ? { ...notification, read: true } : notification
  }
  const projectFromMessage = String(notification.message || '').split(':')[0]?.trim()
  const project = notification.project || (projectFromMessage && projectFromMessage !== 'PROJECT_CREATED' ? projectFromMessage : '')
  return {
    ...notification,
    title: 'Project created',
    message: project ? `${project} is ready for knowledge upload.` : 'A project is ready for knowledge upload.',
    project: project || notification.project,
    read: isBackendNotificationId(notification.id) ? true : notification.read,
  }
}

function normalizeAuditEvent(item: ApiAuditEvent): AuditEvent {
  return {
    id: item.id || item.jobId || uid('audit'),
    actor: item.actor || 'n8n',
    action: humanizeAuditAction(item.action || item.event || 'Backend event'),
    project: item.project || 'Backend',
    entity: item.entity || item.jobId || item.pipeline || 'Workflow',
    status: item.status || (String(item.event || '').includes('FAILED') ? 'error' : 'info'),
    timestamp: item.timestamp || new Date().toISOString(),
    details: item.details || [item.pipeline, item.event].filter(Boolean).join(' | ') || 'Backend metric event.',
  }
}

function notificationFromAudit(event: AuditEvent): NotificationEvent | null {
  const action = String(event.action || '').toUpperCase().replace(/\s+/g, '_')
  if (isRoutineNotificationTitle(action)) return null
  if (isIngestionLifecycleSuccess(event)) return null
  const friendly = friendlyNotificationText(event)
  return {
    id: `backend-${event.id}`,
    title: friendly.title,
    message: friendly.message,
    type: event.status,
    createdAt: event.timestamp,
    read: true,
    project: event.project,
    actionLabel: 'Open',
    actionView: event.status === 'error' ? 'analytics' : 'documents',
  }
}

function mergeNotificationFeed(notifications: NotificationEvent[], auditEvents: AuditEvent[], readIds: string[]) {
  const read = new Set(readIds)
  const byId = new Map<string, NotificationEvent>()
  notifications.forEach((notification) => {
    const normalized = normalizeNotificationForFeed(notification)
    byId.set(normalized.id, normalized)
  })
  auditEvents.forEach((event) => {
    const notification = notificationFromAudit(event)
    if (!notification) return
    const existing = byId.get(notification.id)
    byId.set(notification.id, {
      ...notification,
      ...existing,
      read: isBackendNotificationId(notification.id) ? true : (existing?.read ?? (read.has(notification.id) || notification.read)),
    })
  })
  return Array.from(byId.values()).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

function stableNotificationHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36)
}

function knowledgeBatchNotificationId(project: string, jobIds: string[]) {
  const projectPart = project.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
  const jobsPart = jobIds.slice().sort().join('|')
  return `knowledge-batch-completed-${projectPart}-${stableNotificationHash(jobsPart)}`
}

function normalizeScopeText(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

function auditActionKey(value?: string | null) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '_')
}

function textMentionsAny(text: string, values: Set<string>) {
  const normalized = normalizeScopeText(text)
  if (!normalized) return false
  return Array.from(values).some((value) => value && normalized.includes(value))
}

function auditEventSearchText(event: Pick<AuditEvent, 'project' | 'entity' | 'details'>) {
  return [event.project, event.entity, event.details].filter(Boolean).join(' | ')
}

function auditEventReferencesProjects(event: AuditEvent, projectNames: Set<string>) {
  const project = normalizeScopeText(event.project)
  return (project && projectNames.has(project)) || textMentionsAny(auditEventSearchText(event), projectNames)
}

function isProjectAssignmentAuditEvent(event: AuditEvent) {
  return new Set(['USER_PROJECT_ASSIGNMENTS_UPDATED', 'PROJECT_ACCESS_UPDATED']).has(auditActionKey(event.action))
}

function auditEventTargetsUser(event: AuditEvent, userIdentities: Set<string>) {
  const text = [event.actor, event.entity, event.details].filter(Boolean).join(' | ')
  return textMentionsAny(text, userIdentities)
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

function matchesProjectScope(item: { projectId?: string; projectName: string }, projectScope: string, projects: Project[]) {
  if (!projectScope || projectScope === 'all') return true
  const selectedProject = projects.find((project) => project.id === projectScope)
  if (!selectedProject) return false
  return item.projectId === selectedProject.id || item.projectName.trim().toLowerCase() === selectedProject.name.trim().toLowerCase()
}

function formatAssignmentRole(role?: string) {
  const normalized = String(role || '').trim()
  if (!normalized) return 'member'
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatProjectAssignmentSummary(assignments: ProjectAssignmentPayload[] | undefined, projects: Project[]) {
  if (!assignments?.length) return ''
  const nameById = new Map(projects.map((project) => [project.id, project.name]))
  return assignments.map((assignment) => {
    const projectName = nameById.get(assignment.projectId) || assignment.projectId
    return `${projectName} as ${formatAssignmentRole(assignment.role)}`
  }).join(', ')
}

function integrationDisplayName(integrationKey: string) {
  const labels: Record<string, string> = {
    jira: 'Jira Software',
    confluence: 'Confluence',
    chroma: 'ChromaDB',
    microservices: 'Document Processing',
  }
  return labels[integrationKey] || integrationKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function integrationSaveNotificationCopy(integrationKey: string, scope: IntegrationSettingsScope, projectName?: string) {
  const displayName = integrationDisplayName(integrationKey)
  if (scope === 'project') {
    const target = projectName || 'the selected project'
    return {
      title: `${displayName} settings saved`,
      message: `${target} now uses this project's ${displayName} routing.`,
      project: projectName,
    }
  }
  if (scope === 'user') {
    return {
      title: `${displayName} settings saved`,
      message: `${displayName} routing was saved as your personal fallback for assigned projects.`,
    }
  }
  return {
    title: `${displayName} settings saved`,
    message: `${displayName} routing was saved as the workspace default.`,
  }
}

function getActiveEnvironment(settingsData: SettingsResponse | null) {
  return settingsData?.environments?.find((environment) => environment.isActive) || settingsData?.environments?.[0] || null
}

function getIntegration(settingsData: SettingsResponse | null, integrationKey: string) {
  return getActiveEnvironment(settingsData)?.integrations?.find((integration) => integration.integrationKey === integrationKey) || null
}

function getScopedIntegration(settingsData: SettingsResponse | null, integrationKey: string, scope: IntegrationSettingsScope, userId?: string, projectId?: string) {
  if (scope === 'user') {
    return settingsData?.userIntegrations?.find((integration) => integration.integrationKey === integrationKey && (!userId || integration.userId === userId || (integration as any).user_id === userId)) || null
  }
  if (scope === 'project') {
    return settingsData?.projectOverrides?.find((integration) => integration.integrationKey === integrationKey && (!projectId || integration.projectId === projectId || (integration as any).project_id === projectId)) || null
  }
  return getIntegration(settingsData, integrationKey)
}

function getEffectiveIntegration(settingsData: SettingsResponse | null, integrationKey: string, scope: IntegrationSettingsScope, userId?: string, projectId?: string) {
  const workspace = getIntegration(settingsData, integrationKey)
  const user = getScopedIntegration(settingsData, integrationKey, 'user', userId)
  if (scope === 'project') {
    return getScopedIntegration(settingsData, integrationKey, 'project', userId, projectId) || user || workspace
  }
  if (scope === 'user') return user || workspace
  return workspace
}

function getScopeSourceLabel(scope: IntegrationSettingsScope, scopedIntegration: IntegrationSetting | null, effectiveIntegration: IntegrationSetting | null) {
  if (scopedIntegration) {
    if (scope === 'workspace') return 'Saved in Workspace defaults'
    if (scope === 'user') return 'Saved in My Settings'
    return 'Saved in Project Override'
  }
  if (!effectiveIntegration) return 'No saved value in this scope'
  if (effectiveIntegration.scope === 'user') return 'Inherits from My Settings'
  if (effectiveIntegration.scope === 'project') return 'Inherits from Project Override'
  return 'Inherits from Workspace defaults'
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
  const [workReviewFocus, setWorkReviewFocus] = useState<WorkReviewFocus>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [brd, setBrd] = useState<File | null>(null)
  const [frd, setFrd] = useState<File | null>(null)
  const [hld, setHld] = useState<File | null>(null)
  const [lld, setLld] = useState<File | null>(null)
  const [transcripts, setTranscripts] = useState<File[]>([])
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([])
  const [images, setImages] = useState<File[]>([])
  const [kbSubmitting, setKbSubmitting] = useState(false)
  const [kbError, setKbError] = useState('')
  const [generationProject, setGenerationProject] = useState('')
  const [artifact, setArtifact] = useState<DocumentArtifactKey | ''>('')
  const [docSubmitting, setDocSubmitting] = useState(false)
  const [docError, setDocError] = useState('')
  const [pendingDocumentUpdateConfirmation, setPendingDocumentUpdateConfirmation] = useState<DocumentUpdateConfirmation | null>(null)
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
  const allProjectNames = useMemo(() => new Set(projects.map((project) => project.name.trim().toLowerCase()).filter(Boolean)), [projects])
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
  const scopedStoredKnowledgeJobs = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return knowledgeJobs
    return knowledgeJobs.filter((job) => visibleProjectNames.has(job.projectName.trim().toLowerCase()))
  }, [currentUser?.role, knowledgeJobs, visibleProjectNames])
  const scopedKnowledgeJobs = useMemo(
    () => mergeKnowledgeJobsWithArtifacts(scopedStoredKnowledgeJobs, scopedArtifactRecords),
    [scopedArtifactRecords, scopedStoredKnowledgeJobs],
  )
  const deliverableReadinessByArtifact = useMemo(() => {
    const selectedProject = findProjectByName(visibleProjects, generationProject)
    return artifactOptions.reduce((acc, option) => {
      acc[option.key] = buildDeliverableReadinessState(option.key, generationProject, scopedGeneratedOutputs, scopedKnowledgeJobs, selectedProject)
      return acc
    }, {} as Record<DocumentArtifactKey, DeliverableReadinessState>)
  }, [generationProject, scopedGeneratedOutputs, scopedKnowledgeJobs, visibleProjects])
  const scopedAuditEvents = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return auditEvents
    const userIdentities = new Set([currentUser?.name, currentUser?.email, settings.name].filter(Boolean).map((value) => String(value).trim().toLowerCase()))
    return auditEvents.filter((event) => {
      if (auditEventReferencesProjects(event, visibleProjectNames)) return true
      if (!isProjectAssignmentAuditEvent(event) || !auditEventTargetsUser(event, userIdentities)) return false
      return !auditEventReferencesProjects(event, allProjectNames)
    })
  }, [allProjectNames, auditEvents, currentUser?.email, currentUser?.name, currentUser?.role, settings.name, visibleProjectNames])
  const scopedNotifications = useMemo(() => {
    if (currentUser?.role !== 'registered_user') return notifications
    return notifications.filter((notification) => {
      if (isRoutineNotificationTitle(notification.title)) return false
      if (notification.id === 'welcome-notification') return true
      const asAuditEvent: AuditEvent = {
        id: notification.id,
        actor: notification.audienceUserId || '',
        action: notification.title,
        project: notification.project || '',
        entity: notification.actionLabel || '',
        status: notification.type,
        timestamp: notification.createdAt,
        details: notification.message,
      }
      if (auditEventReferencesProjects(asAuditEvent, visibleProjectNames)) return true
      if (notification.audienceUserId && notification.audienceUserId !== currentUser.id) return false
      if (notification.audienceUserId === currentUser.id && isProjectAssignmentAuditEvent(asAuditEvent)) {
        return !auditEventReferencesProjects(asAuditEvent, allProjectNames)
      }
      const project = (notification.project || notification.message.split(':')[0] || '').trim().toLowerCase()
      return Boolean(project) && visibleProjectNames.has(project)
    })
  }, [allProjectNames, currentUser?.id, currentUser?.role, notifications, visibleProjectNames])
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
  useEffect(() => {
    if (!currentUser?.id) return
    const migrationKey = `qops-agent-notification-read-baseline-v2-${currentUser.id}`
    if (localStorage.getItem(migrationKey)) return
    const existingIds = notifications.map((notification) => notification.id).filter(Boolean)
    if (existingIds.length) {
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
      setReadNotificationIds((current) => Array.from(new Set([...current, ...existingIds])))
    }
    localStorage.setItem(migrationKey, '1')
  }, [currentUser?.id, notifications, setNotifications, setReadNotificationIds])
  const [connectionResult, setConnectionResult] = useState<{ status: StatusTone; message: string } | null>(null)
  const [healthChecking, setHealthChecking] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [analyticsPipeline, setAnalyticsPipeline] = useState('all')
  const [analyticsDays, setAnalyticsDays] = useState(30)
  const [analyticsProjectScope, setAnalyticsProjectScope] = useState('')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [infrastructureLoad, setInfrastructureLoad] = useState<InfrastructureLoad | null>(null)
  const [backendDataNotice, setBackendDataNotice] = useState('')
  const [backendRefreshing, setBackendRefreshing] = useState(false)
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
    if (!currentUser?.id) return
    void refreshSettings()
  }, [currentUser?.id, refreshSettings])

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
    (toast: { title: string; message: string; type: ToastType; project?: string }, actionView?: View) => {
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
            project: toast.project,
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
      const assignmentSummary = formatProjectAssignmentSummary(payload.projectAssignments, visibleProjects)
      notify({
        title: assignmentSummary ? 'Project access updated' : 'Invite created',
        message: assignmentSummary
          ? `${payload.name || payload.email} can now access ${assignmentSummary}.`
          : `${payload.email} was invited.`,
        type: 'success',
      }, 'settings')
      await refreshUsers()
      return true
    },
    [notify, refreshUsers, visibleProjects],
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
      const assignmentCount = payload.projectAssignments?.length || updated.projects?.length || 0
      const assignmentSummary = formatProjectAssignmentSummary(payload.projectAssignments, visibleProjects)
      notify({
        title: assignmentCount ? 'Project access updated' : 'User updated',
        message: assignmentCount
          ? `${updated.name || updated.email || 'User'} can now access ${assignmentSummary || `${assignmentCount} project${assignmentCount === 1 ? '' : 's'}`}.`
          : `${updated.email || 'User'} was updated.`,
        type: 'success',
      }, 'settings')
      await refreshUsers()
      return true
    },
    [notify, refreshUsers, visibleProjects],
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
      && isFreshActiveGeneratedOutput(item)
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

  const analyticsProjectId = useMemo(() => {
    if (analyticsProjectScope && analyticsProjectScope !== 'all') return analyticsProjectScope
    const selectedGenerationProject = generationProject.trim() ? findProjectByName(visibleProjects, generationProject) : null
    const selectedKnowledgeProject = projectName.trim() ? findProjectByName(visibleProjects, projectName) : null
    return selectedGenerationProject?.id || selectedKnowledgeProject?.id || undefined
  }, [analyticsProjectScope, generationProject, projectName, visibleProjects])

  useEffect(() => {
    if (currentUser?.role !== 'registered_user') return
    if (!visibleProjects.length) return
    setAnalyticsProjectScope((current) => {
      if (current === 'all') return current
      if (current && visibleProjects.some((project) => project.id === current)) return current
      return visibleProjects[0].id
    })
  }, [analyticsProjectScope, currentUser?.role, visibleProjects])

  const refreshBackendData = useCallback(async () => {
    if (backendRefreshInFlightRef.current) return
    backendRefreshInFlightRef.current = true
    setBackendRefreshing(true)
    const healthAdvertisesRepositories = hasRepositoryWebhooks(healthStatus)
    try {
      if (!healthAdvertisesRepositories) {
        setBackendDataNotice('Checking repository endpoints directly while the health workflow registry is pending.')
      }

      const [projectData, artifactData, outputData, metricData, auditData] = await Promise.all([
        fetchProjects(),
        fetchArtifacts(),
        fetchGeneratedDocuments(),
        fetchGenerationJobMetrics(),
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
        const artifactsByBackendJobId = new Map<string, ArtifactRecord>()
        scopedArtifacts.forEach((artifact) => {
          const backendJobId = artifactBackendJobId(artifact)
          if (backendJobId) artifactsByBackendJobId.set(backendJobId, artifact)
        })
        const notifyCompletedBatch = (project: string, batchJobIds: string[], completedBatchArtifacts: ArtifactRecord[]) => {
          if (!project || !batchJobIds.length || !completedBatchArtifacts.length) return
          const message = batchJobIds.length > 1
            ? `${batchJobIds.length} artifacts processed successfully for ${project}.`
            : `${project} processed 1 artifact successfully.`
          const notificationId = knowledgeBatchNotificationId(project, batchJobIds)
          const latestCreatedAt = completedBatchArtifacts
            .map((artifact) => new Date(artifact.uploadedAt || 0).getTime())
            .filter(Number.isFinite)
            .sort((left, right) => right - left)[0]
          setNotifications((current) => {
            const alreadyExists = current.some((notification) => (
              notification.id === notificationId
              || (notification.title === 'Knowledge base completed' && notification.project === project && notification.message === message)
            ))
            if (alreadyExists) return current
            return [
              {
                id: notificationId,
                title: 'Knowledge base completed',
                message,
                type: 'success',
                createdAt: latestCreatedAt ? new Date(latestCreatedAt).toISOString() : new Date().toISOString(),
                read: false,
                project,
                audienceUserId: currentUser?.id,
                actionLabel: 'Open',
                actionView: 'artifacts',
              },
              ...current,
            ]
          })
        }
        const latestBatchJobIds = Array.from(new Set(latestKnowledgeBatchJobIds.filter(isBackendIngestionJobId)))
        if (latestBatchJobIds.length) {
          const completedBatchArtifacts = latestBatchJobIds
            .map((jobId) => artifactsByBackendJobId.get(jobId))
            .filter((artifact): artifact is ArtifactRecord => Boolean(artifact && artifact.status === 'processed'))
          if (completedBatchArtifacts.length === latestBatchJobIds.length) {
            const project = completedBatchArtifacts[0]?.projectName || projectName.trim() || 'selected project'
            notifyCompletedBatch(project, latestBatchJobIds, completedBatchArtifacts)
          }
        } else {
          const recentWindowMs = 24 * 60 * 60 * 1000
          const recentCompletedByProject = new Map<string, ArtifactRecord[]>()
          scopedArtifacts.forEach((artifact) => {
            if (artifact.status !== 'processed' || !artifactBackendJobId(artifact)) return
            const uploadedAt = new Date(artifact.uploadedAt || 0).getTime()
            if (!Number.isFinite(uploadedAt) || Date.now() - uploadedAt > recentWindowMs) return
            recentCompletedByProject.set(artifact.projectName, [...(recentCompletedByProject.get(artifact.projectName) || []), artifact])
          })
          recentCompletedByProject.forEach((records, project) => {
            const jobIds = Array.from(new Set(records.map(artifactBackendJobId).filter(isBackendIngestionJobId)))
            notifyCompletedBatch(project, jobIds, records)
          })
        }
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
        const metricsByJobId = buildGenerationMetricMap(scopeRepositoryItems((metricData || []).map((metric) => ({
          ...metric,
          projectName: metric.projectName || '',
          projectId: metric.projectId || undefined,
        }))))
        const metadataByJobId = buildGenerationMetadataMap(scopeRepositoryItems((metricData || []).map((metric) => ({
          ...metric,
          projectName: metric.projectName || '',
          projectId: metric.projectId || undefined,
        }))))
        const enrichGeneratedOutput = (output: GeneratedOutput) => enrichGeneratedOutputWithMetric(
          enrichGeneratedOutputWithMetadata(output, metadataByJobId.get(output.jobId || output.id)),
          metricsByJobId.get(output.jobId || output.id),
        )
        const scopedOutputs = scopeRepositoryItems(outputData.map(normalizeGeneratedDocument))
          .map(enrichGeneratedOutput)
        setGeneratedOutputs((current) => mergeGeneratedOutputs(scopeRepositoryItems(current).map(enrichGeneratedOutput), scopedOutputs))
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
      setBackendRefreshing(false)
      backendRefreshInFlightRef.current = false
    }
  }, [currentUser?.id, currentUser?.projectRoles, currentUser?.projects, currentUser?.role, healthStatus, latestKnowledgeBatchJobIds, projectName, setArtifactRecords, setAuditEvents, setGeneratedOutputs, setNotifications, setProjects])

  const refreshAnalytics = useCallback(async () => {
    if (analyticsRefreshInFlightRef.current) return
    analyticsRefreshInFlightRef.current = true
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const data = await fetchAnalyticsSummary({ pipeline: analyticsPipeline, days: analyticsDays, projectId: analyticsProjectId })
      if (data) {
        setAnalytics(data)
      } else {
        setAnalyticsError('Backend analytics endpoint is not available yet. Showing local workspace metrics.')
      }
    } finally {
      setAnalyticsLoading(false)
      analyticsRefreshInFlightRef.current = false
    }
  }, [analyticsDays, analyticsPipeline, analyticsProjectId])

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
    const extractionPatch = extractionObservabilityFromOutput(kbJob.state.output)
    setKnowledgeJobs((current) => updateKnowledgeJobRecord(current, jobId, {
      status: nextStatus,
      error: kbJob.state.error || undefined,
      ...extractionPatch,
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
      setArtifactRecords((current) => current.map((item) => {
        const matchesJob = item.jobId === jobId || Boolean(matchingJob?.fileName && item.fileName === matchingJob.fileName)
        const matchesFallback = !matchingJob?.fileName && item.projectName === jobProjectName && item.status === 'processing'
        if (!matchesJob && !matchesFallback) return item
        return {
          ...item,
          status: 'processed',
          extractionMetrics: extractionPatch.extractionMetrics,
          extractionWarnings: extractionPatch.extractionWarnings,
          extractionWarningCount: extractionPatch.extractionWarningCount,
        }
      }))
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
    const markJobStatusUnavailable = (job: GeneratedOutput, message: string) => {
      setGeneratedOutputs((current) => updateGeneratedOutputRecord(current, job.jobId as string, {
        status: job.status === 'queued' || job.status === 'not_found' ? 'pending' : job.status,
        error: message,
        output: { ...(job.output || {}), message },
      }))
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
              markJobStatusUnavailable(job, `Unable to retrieve status for job ${job.jobId}. Continuing to poll because the backend job may still be running.`)
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
              markJobStatusUnavailable(job, `Job ${job.jobId} is not visible yet. Continuing to poll.`)
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
    }, 10000)

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
      const completedByProject = new Map<string, number>()
      const failedByProject = new Map<string, number>()
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

          const extractionPatch = extractionObservabilityFromOutput(data.output ?? data)
          setKnowledgeJobs((current) => updateKnowledgeJobRecord(current, job.jobId as string, {
            status: nextStatus,
            error: nextError,
            ...extractionPatch,
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
              setArtifactRecords((current) => current.map((item) => {
                const matchesJob = item.jobId === job.jobId || Boolean(job.fileName && item.fileName === job.fileName)
                const matchesFallback = !job.fileName && item.projectName === job.projectName && item.status === 'processing'
                if (!matchesJob && !matchesFallback) return item
                return {
                  ...item,
                  status: 'processed',
                  extractionMetrics: extractionPatch.extractionMetrics,
                  extractionWarnings: extractionPatch.extractionWarnings,
                  extractionWarningCount: extractionPatch.extractionWarningCount,
                }
              }))
              completedByProject.set(job.projectName, (completedByProject.get(job.projectName) || 0) + 1)
              logEvent({ action: 'Background knowledge base completed', project: job.projectName, entity: job.jobId || 'Knowledge base', status: 'success', details: `Job ID ${job.jobId}` })
            } else {
              failedByProject.set(job.projectName, (failedByProject.get(job.projectName) || 0) + 1)
              logEvent({ action: 'Background knowledge base failed', project: job.projectName, entity: job.jobId || 'Knowledge base', status: 'error', details: `Job ID ${job.jobId}` })
            }
          }
        }

        completedByProject.forEach((count, project) => {
          notify({
            title: 'Knowledge base completed',
            message: count > 1
              ? `${count} artifacts processed successfully for ${project}.`
              : `${project} processed 1 artifact successfully.`,
            type: 'success',
            project,
          }, 'knowledge')
        })
        failedByProject.forEach((count, project) => {
          notify({
            title: 'Knowledge base failed',
            message: count > 1
              ? `${count} artifacts need attention for ${project}.`
              : `${project} has 1 artifact that needs attention before generation can continue.`,
            type: 'error',
            project,
          }, 'knowledge')
        })

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
    const byKey = new Map<string, KnowledgeJobRecord>()
    scopedKnowledgeJobs.forEach((job) => {
      const key = job.jobId || job.id
      if (!key) return
      if ((job.jobId && latestKnowledgeBatchIdSet.has(job.jobId)) || isActiveDocumentStatus(job.status)) {
        byKey.set(key, job)
      }
    })
    const matching = Array.from(byKey.values())
      .sort((left, right) => {
        const leftIndex = latestKnowledgeBatchJobIds.indexOf(left.jobId || '')
        const rightIndex = latestKnowledgeBatchJobIds.indexOf(right.jobId || '')
        if (isActiveDocumentStatus(left.status) && !isActiveDocumentStatus(right.status)) return -1
        if (!isActiveDocumentStatus(left.status) && isActiveDocumentStatus(right.status)) return 1
        if (leftIndex === -1 && rightIndex === -1) return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
      })
    return matching
  }, [latestKnowledgeBatchIdSet, latestKnowledgeBatchJobIds, scopedKnowledgeJobs])
  const displayGeneratedOutputs = useMemo(
    () => scopedGeneratedOutputs.map((output) => generatedOutputForDisplay(output)),
    [scopedGeneratedOutputs],
  )
  const activeDocumentJobs = displayGeneratedOutputs.filter((output) => isFreshActiveGeneratedOutput(output))
  const activeGenerationJob = activeDocumentJobs
    .slice()
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())[0] || null
  const recentDocumentJobs = displayGeneratedOutputs
    .filter((output) => output.status === 'failed' || isActiveDocumentStatus(output.status) || output.status === 'completed')
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
  const statusDocumentJobs = useMemo(() => {
    const activeJobs = displayGeneratedOutputs
      .filter((output) => isFreshActiveGeneratedOutput(output))
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    if (activeJobs.length) return activeJobs
    const jobId = docJob.state.jobId
    const latestJobs = latestDocumentBatchIdSet.size
      ? scopedGeneratedOutputs
        .filter((output) => output.jobId && latestDocumentBatchIdSet.has(output.jobId))
        .map((output) => generatedOutputForDisplay(output))
        .sort((left, right) => {
          const leftIndex = latestDocumentBatchJobIds.indexOf(left.jobId || '')
          const rightIndex = latestDocumentBatchJobIds.indexOf(right.jobId || '')
          return leftIndex - rightIndex
        })
      : []
    if (latestJobs.length) return latestJobs
    if (!jobId || docJob.state.status === 'idle') return recentDocumentJobs.slice(0, 1)
    const existing = displayGeneratedOutputs.find((item) => item.jobId === jobId || item.id === jobId)
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
  }, [artifact, displayGeneratedOutputs, docJob.state.jobId, docJob.state.output, docJob.state.status, generationProject, latestDocumentBatchIdSet, latestDocumentBatchJobIds, recentDocumentJobs, scopedGeneratedOutputs])
  const latestDocumentJob = statusDocumentJobs[0] || null
  const outputPanelStatus = docJob.state.status !== 'idle'
    ? docJob.state.status
    : latestDocumentJob?.status || 'idle'
  const outputPanelJobId = docJob.state.jobId || latestDocumentJob?.jobId || latestDocumentJob?.id || null
  const outputPanelRecord = displayGeneratedOutputs.find((item) => item.jobId === outputPanelJobId || item.id === outputPanelJobId) || latestDocumentJob
  const outputPanelOutput = docJob.state.status !== 'idle'
    ? mergeGeneratedOutputContext(docJob.state.output, outputPanelRecord?.output)
    : outputPanelRecord?.output
  const activeJobs = activeDocumentJobs.length + activeKnowledgeJobs.length
  const scopedLatestArtifactAttempts = buildArtifactLatestAttemptMap(scopedArtifactRecords)
  const actionableKnowledgeFailures = scopedKnowledgeJobs.filter((job) => (
    knowledgeJobRetryState(job, scopedArtifactRecords, scopedKnowledgeJobs, scopedLatestArtifactAttempts) === 'actionable'
  )).length
  const actionableGenerationFailures = displayGeneratedOutputs.filter((output) => (
    generationJobRetryState(output, displayGeneratedOutputs) === 'actionable'
  )).length
  const failedJobs = actionableGenerationFailures + actionableKnowledgeFailures
  const analyticsScopedArtifactRecords = useMemo(
    () => scopedArtifactRecords.filter((record) => matchesProjectScope(record, analyticsProjectScope || 'all', visibleProjects)),
    [analyticsProjectScope, scopedArtifactRecords, visibleProjects],
  )
  const analyticsScopedGeneratedOutputs = useMemo(
    () => scopedGeneratedOutputs
      .filter((output) => matchesProjectScope(output, analyticsProjectScope || 'all', visibleProjects))
      .map((output) => generatedOutputForDisplay(output)),
    [analyticsProjectScope, scopedGeneratedOutputs, visibleProjects],
  )
  const analyticsScopedKnowledgeJobs = useMemo(
    () => scopedKnowledgeJobs.filter((job) => matchesProjectScope(job, analyticsProjectScope || 'all', visibleProjects)),
    [analyticsProjectScope, scopedKnowledgeJobs, visibleProjects],
  )
  const analyticsScopedActiveJobs = analyticsScopedGeneratedOutputs.filter((output) => isFreshActiveGeneratedOutput(output)).length
    + analyticsScopedKnowledgeJobs.filter((job) => isActiveDocumentStatus(job.status)).length
  const analyticsScopedLatestArtifactAttempts = buildArtifactLatestAttemptMap(analyticsScopedArtifactRecords)
  const analyticsScopedFailedJobs = analyticsScopedGeneratedOutputs.filter((output) => (
    generationJobRetryState(output, analyticsScopedGeneratedOutputs) === 'actionable'
  )).length + analyticsScopedKnowledgeJobs.filter((job) => (
    knowledgeJobRetryState(job, analyticsScopedArtifactRecords, analyticsScopedKnowledgeJobs, analyticsScopedLatestArtifactAttempts) === 'actionable'
  )).length
  const unreadCount = notificationFeed.filter((item) => !item.read).length
  const selectedFiles = [brd, frd, hld, lld].filter(Boolean).length + transcripts.length + supportingDocuments.length + images.length
  const projectKnowledgeCells = visibleProjects.map((project) => projectKnowledgeReadinessCell(project, scopedArtifactRecords, scopedKnowledgeJobs))
  const readyKnowledgeBases = projectKnowledgeCells.filter((cell) => cell.label === 'Ready').length
  const activeKnowledgeProjects = projectKnowledgeCells.filter((cell) => cell.label === 'Ingesting').length
  const hasVisibleActiveIngestion = activeKnowledgeProjects > 0
    || activeKnowledgeJobs.length > 0
    || scopedArtifactRecords.some((record) => record.status === 'processing')

  useEffect(() => {
    if (!currentUser?.id) return
    if (view !== 'overview' && view !== 'artifacts') return
    void refreshBackendData()
    if (view === 'overview') void refreshAnalytics()
  }, [currentUser?.id, refreshAnalytics, refreshBackendData, view])

  useEffect(() => {
    if (!currentUser?.id) return
    if (view !== 'overview' && view !== 'artifacts') return
    if (!hasVisibleActiveIngestion) return

    const refreshVisibleIngestionState = () => {
      if (document.visibilityState === 'hidden') return
      void refreshBackendData()
      if (view === 'overview') void refreshAnalytics()
    }

    refreshVisibleIngestionState()
    const interval = window.setInterval(refreshVisibleIngestionState, 10000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshVisibleIngestionState()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser?.id, hasVisibleActiveIngestion, refreshAnalytics, refreshBackendData, view])

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()
  const loggedInDisplayName = currentUser?.name || settings.name || currentUser?.email?.split('@')[0] || 'there'
  const loggedInFirstName = loggedInDisplayName.trim().split(/\s+/)[0] || loggedInDisplayName

  const openWorkspace = (nextTab: WorkspaceTab, options: { projectName?: string; artifact?: DocumentArtifactKey } = {}) => {
    if (options.projectName) {
      if (nextTab === 'knowledge') setProjectName(options.projectName)
      if (nextTab === 'documents') setGenerationProject(options.projectName)
    }
    if (nextTab === 'documents' && options.artifact) setArtifact(options.artifact)
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
      supportingDocuments.forEach((file) => files.push(['Supporting Document', file]))
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
      const res = await uploadKnowledgeBase({ projectId: selectedProject?.id, projectName, brd, frd, hld, lld, transcripts, supportingDocuments, images }, (job) => {
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
    setSupportingDocuments([])
    setImages([])
    setKbError('')
    kbJob.reset()
    notify({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
    logEvent({ action: 'Knowledge base form reset', project: 'Current workspace', entity: 'Knowledge form', status: 'info', details: 'Selected artifacts and job state cleared.' })
  }

  const startDocumentGeneration = async (confirmedUpdate = false) => {
    if (!generationProject.trim() || !artifact) {
      setDocError('Please select project and artifact type')
      return
    }
    if (activeGenerationJob) {
      setDocError(`Generation job ${activeGenerationJob.jobId || activeGenerationJob.id} is still ${activeGenerationJob.status}. Wait for it to finish before starting another document generation job.`)
      return
    }
    const deliverableReadiness = artifact ? deliverableReadinessByArtifact[artifact] : null
    if (deliverableReadiness?.status === 'blocked') {
      setDocError(`${deliverableReadiness.title}. ${deliverableReadiness.action}`)
      return
    }
    const selectedProject = findProjectByName(visibleProjects, generationProject)
    const option = artifactOptions.find((item) => item.key === artifact)
    const previousOutput = latestCompletedOutputForArtifact(generationProject, artifact, scopedGeneratedOutputs)
    const updateReasons = previousOutput
      ? documentUpdateReasons(generationProject, artifact, previousOutput, scopedArtifactRecords, scopedGeneratedOutputs, scopedKnowledgeJobs)
      : []
    const knowledgeUpdated = updateReasons.some((reason) => reason.toLowerCase().includes('knowledge base'))
    const contextUpdated = updateReasons.length > 0
    if (previousOutput && !confirmedUpdate) {
      setDocError('')
      setPendingDocumentUpdateConfirmation({
        projectName: generationProject.trim(),
        artifact,
        artifactLabel: option?.label ?? artifact,
        previousJobId: previousOutput.jobId || previousOutput.id || null,
        previousCreatedAt: previousOutput.createdAt,
        knowledgeUpdated,
        contextUpdated,
        updateReasons,
      })
      return
    }

    setPendingDocumentUpdateConfirmation(null)
    setDocSubmitting(true)
    setDocError('')
    try {
      const owner = selectedProject?.owner || settings.name || 'PO'
      const generationMode = previousOutput ? 'update' : 'create'
      const updateContext = compactGeneratedOutputForUpdate(previousOutput, updateReasons, scopedGeneratedOutputs)
      const request: Parameters<typeof generateDocument>[0] = {
        projectId: selectedProject?.id,
        projectName: generationProject,
        artifact,
        productOwner: owner,
        generationMode,
        updateContext: updateContext || undefined,
      }
      const res = artifact === 'testCases'
        ? await generateStoryTestCases(request)
        : await generateDocument(request)
      docJob.start(res)
      setLatestDocumentBatchJobIds([res.jobId])
      refreshInfrastructureLoadIfVisible()
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
          generationMode,
          updateOfJobId: updateContext?.previousJobId || null,
        },
        ...current.filter((item) => item.jobId !== res.jobId && item.id !== res.jobId),
      ])
      notify({ title: generationMode === 'update' ? 'Update started' : 'Generation started', message: generationMode === 'update' ? 'Document update queued.' : 'Document generation queued.', type: 'info' }, 'documents')
      if (deliverableReadiness?.status === 'warning') {
        notify({ title: 'Generation queued with readiness warning', message: deliverableReadiness.action, type: 'info' }, 'documents')
      }
      logEvent({ action: generationMode === 'update' ? 'Document update submitted' : 'Document generation submitted', project: generationProject.trim(), entity: option?.label ?? artifact, status: 'info', details: `Job ID ${res.jobId}${updateContext?.previousJobId ? ` updates ${updateContext.previousJobId}` : ''}` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setDocError(message)
      notify({ title: 'Generation failed', message, type: 'error' }, 'settings')
      logEvent({ action: 'Document generation failed', project: generationProject.trim(), entity: artifact || 'Document request', status: 'error', details: message })
    } finally {
      setDocSubmitting(false)
    }
  }

  const submitDocument = async (event: FormEvent) => {
    event.preventDefault()
    await startDocumentGeneration(false)
  }

  const resetDocument = () => {
    setGenerationProject('')
    setArtifact('')
    setDocError('')
    setPendingDocumentUpdateConfirmation(null)
    docJob.reset()
    notify({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
    logEvent({ action: 'Document generation form reset', project: 'Current workspace', entity: 'Document form', status: 'info', details: 'Document inputs and job state cleared.' })
  }

  const retryDocumentJob = useCallback(async (job: GeneratedOutput) => {
    if (activeGenerationJob) {
      notify({ title: 'Generation already running', message: `Job ${activeGenerationJob.jobId || activeGenerationJob.id} is still ${activeGenerationJob.status}. Wait for it to finish before starting another generation job.`, type: 'info' }, 'documents')
      return
    }
    const artifactKey = resolveArtifactKey(job)
    if (!artifactKey) {
      notify({ title: 'Retry unavailable', message: 'This failed job does not have enough metadata to retry automatically.', type: 'error' }, 'documents')
      return
    }

    try {
      const selectedProject = findProjectByName(visibleProjects, job.projectName)
      const owner = selectedProject?.owner || settings.name || 'PO'
      const retryLineageById = new Map(
        scopedGeneratedOutputs
          .flatMap((output) => [output.jobId, output.id].filter(Boolean).map((id) => [id, output] as const))
      )
      const jobInput = (candidate: GeneratedOutput | null | undefined) => (
        candidate?.input && typeof candidate.input === 'object' ? candidate.input : {}
      )
      const jobInputUpdateContext = (candidate: GeneratedOutput | null | undefined) => {
        const input = jobInput(candidate)
        return input.updateContext && typeof input.updateContext === 'object' ? input.updateContext : {}
      }
      const jobInputRetryContext = (candidate: GeneratedOutput | null | undefined) => {
        const input = jobInput(candidate)
        return input.retryContext && typeof input.retryContext === 'object' ? input.retryContext : {}
      }
      const retryOfJobIdFromCandidate = (candidate: GeneratedOutput | null | undefined): string | null => {
        if (!candidate) return null
        const input = jobInput(candidate)
        const retryContext = jobInputRetryContext(candidate)
        return candidate.retryOfJobId
          || input.retryOfJobId
          || input.retry_of_job_id
          || input.retryJobId
          || retryContext.retryOfJobId
          || retryContext.retry_of_job_id
          || candidate.output?.retryOfJobId
          || candidate.output?.retryContext?.retryOfJobId
          || candidate.output?.metadata?.retry_of_job_id
          || null
      }
      const updateOfJobIdFromLineage = (candidate: GeneratedOutput | null | undefined, visited = new Set<string>()): string | null => {
        if (!candidate) return null
        const candidateId = candidate.jobId || candidate.id
        if (visited.has(candidateId)) return null
        visited.add(candidateId)
        const input = jobInput(candidate)
        const inputUpdateContext = jobInputUpdateContext(candidate)
        const inputRetryContext = jobInputRetryContext(candidate)
        const directUpdateOfJobId = candidate.updateOfJobId
          || input.updateOfJobId
          || input.update_of_job_id
          || inputUpdateContext.previousJobId
          || inputUpdateContext.previous_job_id
          || inputRetryContext.updateOfJobId
          || inputRetryContext.update_of_job_id
          || candidate.output?.updateOfJobId
          || candidate.output?.updateContext?.previousJobId
          || candidate.output?.metadata?.update_of_job_id
          || null
        if (directUpdateOfJobId) return directUpdateOfJobId
        const retryOfJobId = retryOfJobIdFromCandidate(candidate)
        return retryOfJobId ? updateOfJobIdFromLineage(retryLineageById.get(retryOfJobId), visited) : null
      }
      const generationModeFromLineage = (candidate: GeneratedOutput | null | undefined, visited = new Set<string>()): GeneratedOutput['generationMode'] | null => {
        if (!candidate) return null
        const candidateId = candidate.jobId || candidate.id
        if (visited.has(candidateId)) return null
        visited.add(candidateId)
        const input = jobInput(candidate)
        const inputUpdateContext = jobInputUpdateContext(candidate)
        const inputRetryContext = jobInputRetryContext(candidate)
        if (
          candidate.generationMode === 'update'
          || String(input.generationMode || '').toLowerCase() === 'update'
          || String(inputRetryContext.generationMode || '').toLowerCase() === 'update'
          || Boolean(input.updateOfJobId || input.update_of_job_id || inputUpdateContext.previousJobId || inputUpdateContext.previous_job_id || inputRetryContext.updateOfJobId || inputRetryContext.update_of_job_id)
          || candidate.output?.generationMode === 'update'
          || candidate.output?.metadata?.generation_mode === 'update'
          || Boolean(candidate.output?.updateOfJobId || candidate.output?.updateContext?.previousJobId || candidate.output?.metadata?.update_of_job_id)
        ) return 'update'
        const retryOfJobId = retryOfJobIdFromCandidate(candidate)
        return retryOfJobId ? generationModeFromLineage(retryLineageById.get(retryOfJobId), visited) : null
      }
      const sourceRetryOfJobId = retryOfJobIdFromCandidate(job)
      const sourceFailedJob = sourceRetryOfJobId
        ? scopedGeneratedOutputs.find((output) => output.jobId === sourceRetryOfJobId || output.id === sourceRetryOfJobId) || null
        : null
      const failedUpdateOfJobId = updateOfJobIdFromLineage(job)
      const sourceUpdateOfJobId = updateOfJobIdFromLineage(sourceFailedJob)
      const updateOfJobId = failedUpdateOfJobId || sourceUpdateOfJobId
      const latestCompletedForArtifact = latestCompletedOutputForArtifact(job.projectName, artifactKey, scopedGeneratedOutputs)
      const latestCompletedUpdateReasons = latestCompletedForArtifact
        ? documentUpdateReasons(job.projectName, artifactKey, latestCompletedForArtifact, scopedArtifactRecords, scopedGeneratedOutputs, scopedKnowledgeJobs)
        : []
      const isSharedConfluenceArtifact = ['strategy', 'plan', 'risk'].includes(artifactKey)
      const shouldRetryAsUpdate = (
        job.generationMode === 'update'
        || generationModeFromLineage(job) === 'update'
        || Boolean(failedUpdateOfJobId)
        || generationModeFromLineage(sourceFailedJob) === 'update'
        || Boolean(sourceUpdateOfJobId)
        || (isSharedConfluenceArtifact && Boolean(latestCompletedForArtifact) && latestCompletedUpdateReasons.length > 0)
      )
      const previousOutput = shouldRetryAsUpdate
        ? (
          latestCompletedForArtifact
          || (updateOfJobId
            ? scopedGeneratedOutputs.find((output) => output.status === 'completed' && (output.jobId === updateOfJobId || output.id === updateOfJobId)) || null
            : null)
        )
        : null
      const retryUpdateReasons = previousOutput
        ? (previousOutput === latestCompletedForArtifact ? latestCompletedUpdateReasons : documentUpdateReasons(job.projectName, artifactKey, previousOutput, scopedArtifactRecords, scopedGeneratedOutputs, scopedKnowledgeJobs))
        : []
      const updateContext = shouldRetryAsUpdate
        ? (
          compactGeneratedOutputForUpdate(previousOutput, retryUpdateReasons, scopedGeneratedOutputs)
          || {
            previousJobId: updateOfJobId,
            previousDocumentType: mapArtifactToDocumentType(artifactKey),
            previousArtifactLabel: job.artifactLabel,
            previousConfluencePageId: null,
            previousConfluenceUrl: null,
            updateReasons: retryUpdateReasons,
            contextUpdated: retryUpdateReasons.length > 0,
            deltaRequested: true,
            liveHydrationRequired: true,
            updateSourceOfTruth: 'jira_confluence_live',
          }
        )
        : null
      const storyTestCaseRetryTargets = artifactKey === 'testCases' && shouldRetryAsUpdate
        ? collectStoryTestCaseRepairTargetsForRetry(job)
        : []
      if (updateContext && storyTestCaseRetryTargets.length) {
        Object.assign(updateContext, {
          retryRepairTargets: storyTestCaseRetryTargets,
          retryRepairTargetCount: storyTestCaseRetryTargets.length,
          retryRepairSourceJobId: job.jobId || job.id,
          forceRepairOnly: true,
          preventFullRegeneration: true,
        })
      }
      const request: Parameters<typeof generateDocument>[0] = {
        projectId: job.projectId || selectedProject?.id,
        projectName: job.projectName,
        artifact: artifactKey,
        productOwner: owner,
        generationMode: shouldRetryAsUpdate ? 'update' : undefined,
        updateContext: updateContext || undefined,
        retryJobId: job.jobId || job.id,
      }
      request.retryInstruction = shouldRetryAsUpdate
        ? 'Retry the failed update as an update repair. Preserve update semantics, patch the existing target output, and persist retry lineage for audit.'
        : generationRetryInstruction(job)
      request.retryContext = {
        retryOfJobId: job.jobId || job.id,
        retryMode: true,
        previousStatus: job.status,
        previousError: job.error || job.output?.message || job.output?.error || null,
        qualityGate: job.output?.qualityGate || null,
        generationMode: shouldRetryAsUpdate ? 'update' : 'retry',
        updateOfJobId: shouldRetryAsUpdate ? updateContext?.previousJobId || updateOfJobId || null : null,
        repairTargets: storyTestCaseRetryTargets,
        forceRepairOnly: storyTestCaseRetryTargets.length > 0,
        preventFullRegeneration: artifactKey === 'testCases' && shouldRetryAsUpdate,
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
      const now = new Date().toISOString()
      setGeneratedOutputs((current) => {
        const retryRecord: GeneratedOutput = {
          id: res.jobId,
          jobId: res.jobId,
          projectId: job.projectId || selectedProject?.id,
          projectName: job.projectName,
          artifactKey,
          artifactLabel: option?.label ?? job.artifactLabel,
          documentType: mapArtifactToDocumentType(artifactKey),
          createdAt: now,
          status: normalizeGeneratedOutputStatus(res.status || 'queued'),
          output: null,
          retryOfJobId: job.jobId || job.id,
          retryAttempt: (Number(job.retryAttempt) || 0) + 1,
          generationMode: shouldRetryAsUpdate ? 'update' : 'retry',
          updateOfJobId: shouldRetryAsUpdate ? updateContext?.previousJobId || updateOfJobId || null : null,
        }
        return [
          retryRecord,
          ...current
            .filter((item) => item.jobId !== res.jobId && item.id !== res.jobId)
            .map((item) => (
              item.jobId === (job.jobId || job.id) || item.id === (job.jobId || job.id)
                ? { ...item, retriedAt: now, retriedByJobId: res.jobId, retryStatus: 'retrying' }
                : item
            )),
        ]
      })

      notify({
        title: shouldRetryAsUpdate ? 'Update queued' : 'Retry queued',
        message: shouldRetryAsUpdate
          ? `${job.artifactLabel} update was queued using live Jira/Confluence state.`
          : `${job.artifactLabel} was queued as a new retry attempt for ${job.projectName}.`,
        type: 'info',
      }, 'documents')
      logEvent({
        action: shouldRetryAsUpdate ? 'Document update resubmitted' : 'Document generation retried',
        project: job.projectName,
        entity: job.artifactLabel,
        status: 'info',
        details: shouldRetryAsUpdate
          ? `Update job ${res.jobId} created after failed job ${job.jobId || job.id}; source of truth is live Jira/Confluence.`
          : `Retry job ${res.jobId} created for ${job.jobId || job.id}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to retry this job.'
      notify({ title: 'Retry failed', message, type: 'error' }, 'documents')
      logEvent({ action: 'Document retry failed', project: job.projectName, entity: job.artifactLabel, status: 'error', details: message })
    }
  }, [activeGenerationJob, docJob, logEvent, notify, refreshInfrastructureLoadIfVisible, scopedGeneratedOutputs, setLatestDocumentBatchJobIds, settings.name, visibleProjects])

  const retryKnowledgeJob = useCallback(async (job: KnowledgeJobRecord) => {
    const latestAttempts = buildArtifactLatestAttemptMap(scopedArtifactRecords)
    const failedArtifacts = matchKnowledgeJobArtifacts(job, scopedArtifactRecords).filter((record) => (
      record.status === 'failed' && artifactRetryState(record, latestAttempts) === 'actionable'
    ))

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
      const artifactByRetryJobId = new Map(successfulRetries.map((retry) => [
        retry.response!.jobId,
        failedArtifacts.find((artifact) => artifact.id === retry.artifactId),
      ]))
      return [
        ...successfulRetries.map((retry) => {
          const retryJobId = retry.response!.jobId
          const artifact = artifactByRetryJobId.get(retryJobId)
          return {
          id: retryJobId,
          jobId: retryJobId,
          projectId: job.projectId,
          projectName: artifact?.projectName || job.projectName,
          fileName: artifact?.fileName || job.fileName,
          fileKey: artifact?.type || job.fileKey,
          processingClass: artifact?.type || job.processingClass,
          createdAt: new Date().toISOString(),
          status: normalizeKnowledgeJobStatus(retry.response!.status || 'queued'),
          retryOfJobId: job.jobId || job.id,
        }}),
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

  const reprocessArtifactRecord = useCallback(async (id: string) => {
    const res = await reprocessArtifact(id)
    if (!res) return
    const artifactRecord = scopedArtifactRecords.find((item) => item.id === id)
    kbJob.start(res)
    setLatestKnowledgeBatchJobIds((current) => Array.from(new Set([res.jobId, ...current.filter((jobId) => scopedKnowledgeJobs.some((job) => (job.jobId || job.id) === jobId && isActiveDocumentStatus(job.status)))])))
    setKnowledgeJobs((current) => [
      {
        id: res.jobId,
        jobId: res.jobId,
        projectId: undefined,
        projectName: artifactRecord?.projectName || 'Knowledge Base',
        fileName: artifactRecord?.fileName,
        fileKey: artifactRecord?.type,
        processingClass: artifactRecord?.type,
        createdAt: new Date().toISOString(),
        status: normalizeKnowledgeJobStatus(res.status || 'queued'),
        retryOfJobId: artifactRecord?.jobId || artifactRecord?.id,
      },
      ...updateKnowledgeJobRecord(current, artifactRecord?.jobId || artifactRecord?.id || '', {
        retriedAt: new Date().toISOString(),
        retriedByJobIds: [res.jobId],
      }).filter((item) => item.jobId !== res.jobId && item.id !== res.jobId),
    ])
    setArtifactRecords((current) => current.map((record) => (
      record.id === id ? { ...record, status: 'processing' } : record
    )))
    void refreshBackendData()
    refreshInfrastructureLoadIfVisible()
    notify({ title: 'Reprocess queued', message: 'Artifact reprocessing started.', type: 'info' }, 'knowledge')
  }, [kbJob, notify, refreshBackendData, refreshInfrastructureLoadIfVisible, scopedArtifactRecords, scopedKnowledgeJobs, setArtifactRecords, setKnowledgeJobs, setLatestKnowledgeBatchJobIds])

  const createProject = (project: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const nextProject: Project = { ...project, id: uid('project'), status: 'draft', createdAt: now, updatedAt: now }
    setProjects((current) => [nextProject, ...current.filter((item) => item.name.toLowerCase() !== project.name.toLowerCase())])
    setProjectName(project.name)
    setGenerationProject(project.name)
    setView('knowledge')
    setTab('knowledge')
    setOverlay(null)
    notify({ title: 'Project created', message: `${project.name} is ready for knowledge upload.`, type: 'success', project: project.name }, 'knowledge')
    logEvent({ action: 'Project created', project: project.name, entity: project.module || 'Project', status: 'success', details: project.description || 'Draft project created locally.' })
    void createProjectRecord(nextProject).then((saved) => {
      if (saved) {
        setProjects((current) => [normalizeProject(saved), ...current.filter((item) => item.name.toLowerCase() !== saved.name.toLowerCase())])
        void refreshBackendData()
      }
    })
  }

  const testConnection = async () => {
    setHealthChecking(true)
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
    } finally {
      setHealthChecking(false)
    }
  }

  const saveIntegrationSettings = async (integrationKey: string, config: Record<string, any>, enabled = true, options: { scope?: IntegrationSettingsScope; projectId?: string } = {}) => {
    const scope = options.scope || (currentUser?.role === 'admin' ? 'workspace' : 'user')
    const saved = await patchSettings({
      environmentKey: 'local',
      integrationKey,
      scope,
      projectId: options.projectId,
      integration: { integrationKey, scope, projectId: options.projectId, enabled, config, status: 'backend_managed' },
      actorUserId: currentUser?.id,
      actorName: currentUser?.name || settings.name,
    })
    if (!saved) {
      notify({ title: 'Settings save failed', message: `Unable to save ${integrationDisplayName(integrationKey)} settings.`, type: 'error' }, 'settings')
      return false
    }
    const projectName = scope === 'project' ? visibleProjects.find((project) => project.id === options.projectId)?.name : undefined
    const notificationCopy = integrationSaveNotificationCopy(integrationKey, scope, projectName)
    notify({ ...notificationCopy, type: 'success' }, 'settings')
    await refreshSettings()
    return true
  }

  const runIntegrationTest = async (integrationKey: string, readiness?: IntegrationTestReadiness) => {
    const displayName = readiness?.label || (integrationKey === 'all' ? 'all integrations' : integrationKey.replace(/_/g, ' '))
    if (readiness && !readiness.configured) {
      const missing = readiness.missing?.filter(Boolean) || []
      setConnectionResult({
        status: 'warning',
        message: `${displayName} routing is not configured${missing.length ? `: add ${missing.join(', ')}` : ''}. Save settings for the selected scope before testing this integration.`,
      })
      return false
    }
    setConnectionResult({ status: 'info', message: `Testing ${displayName} connection...` })
    const result = integrationKey === 'all' ? await testAllIntegrations() : await testIntegration(integrationKey)
    if (!result) {
      setConnectionResult({ status: 'error', message: `Q-Ops could not verify ${displayName}. Confirm routing is saved for the selected scope and that a credential-backed probe is available.` })
      return false
    }
    const resultStatus = String(result.status || result.overallStatus || '').toLowerCase()
    const tone: StatusTone = ['ok', 'success', 'operational', 'configured'].includes(resultStatus) ? 'success' : ['not_configured', 'missing', 'degraded'].includes(resultStatus) ? 'warning' : resultStatus === 'error' ? 'error' : 'success'
    const detail = result.message || result.detail || resultStatus
    setConnectionResult({
      status: tone,
      message: tone === 'success'
        ? `${displayName} routing looks ready. Credential-backed probes remain backend-managed.`
        : `${displayName} needs attention${detail ? `: ${detail}` : '.'}`,
    })
    await refreshSettings()
    return tone !== 'error'
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
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
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
                projects={visibleProjects}
                artifacts={scopedArtifactRecords}
                generatedOutputs={displayGeneratedOutputs}
                activeJobs={activeJobs}
                failedJobs={failedJobs}
                artifactCount={scopedArtifactRecords.length + selectedFiles}
                outputs={scopedGeneratedOutputs.length}
                readyKnowledgeBases={readyKnowledgeBases}
                activeKnowledgeProjects={activeKnowledgeProjects}
                recentDocumentJobs={recentDocumentJobs}
                recentKnowledgeJobs={recentKnowledgeJobs}
                analytics={analytics}
                notifications={notificationFeed}
                auditEvents={scopedAuditEvents}
                unreadCount={unreadCount}
                currentUserRole={currentUser?.role}
                infrastructureLoad={infrastructureLoad}
                onOpenNotifications={() => setOverlay('notifications')}
                onOpenArtifacts={() => setView('artifacts')}
                onOpenAttention={(focus = 'all') => {
                  setWorkReviewFocus(focus)
                  setOverlay('attention')
                }}
                onOpenDocuments={(projectName, artifact) => openWorkspace('documents', { projectName, artifact })}
                onOpenKnowledge={(projectName) => openWorkspace('knowledge', { projectName })}
                onOpenAnalytics={() => setView('analytics')}
                onOpenDiagnostics={() => setOverlay('diagnostics')}
              />
            ) : null}

            {view === 'knowledge' || view === 'documents' ? (
              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(24rem,0.9fr)] 2xl:grid-cols-[minmax(0,1.55fr)_minmax(27rem,0.95fr)]">
                <div className="space-y-6">
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
                    supportingDocuments={supportingDocuments}
                    setSupportingDocuments={setSupportingDocuments}
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
                    activeGenerationJob={activeGenerationJob}
                    onDocumentSubmit={submitDocument}
                    onDocumentReset={resetDocument}
                    projects={visibleProjects}
                    outputs={scopedGeneratedOutputs}
                    storyTestCasesReady={hasCompletedStoryBacklog(generationProject, scopedGeneratedOutputs)}
                    traceabilityReady={hasCompletedTraceabilityPrerequisites(generationProject, scopedGeneratedOutputs)}
                    readinessByArtifact={deliverableReadinessByArtifact}
                  />
                </div>
                <div className="space-y-6">
                  <StatusPanel kind={tab} state={tab === 'knowledge' ? kbJob.state : docJob.state} jobs={tab === 'knowledge' ? statusKnowledgeJobs : statusDocumentJobs} />
                  {tab === 'knowledge' ? (
                    <KnowledgeJobsPanel jobs={recentKnowledgeJobs} artifacts={scopedArtifactRecords} analyticsJobs={analytics?.recentJobs ?? []} onRetry={retryKnowledgeJob} />
                  ) : null}
                  {tab === 'documents' ? (
                    <>
                      <OutputPanel
                        output={outputPanelOutput}
                        status={outputPanelStatus}
                        jobId={outputPanelJobId}
                        jobRecord={outputPanelRecord}
                        relatedOutputs={displayGeneratedOutputs}
                        onRetry={retryDocumentJob}
                      />
                      <DocumentJobsPanel jobs={recentDocumentJobs} allJobs={displayGeneratedOutputs} analyticsJobs={analytics?.recentJobs ?? []} onRetry={retryDocumentJob} />
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {view === 'artifacts' ? (
              <ArtifactsRepository
                records={scopedArtifactRecords}
                jobs={scopedKnowledgeJobs}
                refreshing={backendRefreshing}
                onRefresh={() => {
                  void refreshBackendData()
                  void refreshAnalytics()
                }}
                onUpload={() => openWorkspace('knowledge')}
                onReprocess={(id) => void reprocessArtifactRecord(id)}
              />
            ) : null}
            {view === 'analytics' ? <AnalyticsPage analytics={analytics} loading={analyticsLoading} error={analyticsError} pipeline={analyticsPipeline} days={analyticsDays} projectScope={analyticsProjectScope || 'all'} setPipeline={setAnalyticsPipeline} setDays={setAnalyticsDays} setProjectScope={setAnalyticsProjectScope} onRefresh={refreshAnalytics} projects={visibleProjects} artifacts={analyticsScopedArtifactRecords} outputs={analyticsScopedGeneratedOutputs} activeJobs={analyticsScopedActiveJobs} failedJobs={analyticsScopedFailedJobs} /> : null}
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
                healthChecking={healthChecking}
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
      {overlay === 'attention' ? (
        <AttentionCenterModal
          projects={visibleProjects}
          artifacts={scopedArtifactRecords}
          documentJobs={recentDocumentJobs}
          knowledgeJobs={recentKnowledgeJobs}
          focus={workReviewFocus}
          onClose={() => setOverlay(null)}
          onOpenDocuments={(projectName, artifact) => {
            setOverlay(null)
            openWorkspace('documents', { projectName, artifact })
          }}
          onOpenKnowledge={(projectName) => {
            setOverlay(null)
            openWorkspace('knowledge', { projectName })
          }}
          onRetryDocument={(job) => {
            setOverlay(null)
            void retryDocumentJob(job)
          }}
          onRetryKnowledge={(job) => {
            setOverlay(null)
            void retryKnowledgeJob(job)
          }}
          onReprocessArtifact={(artifactId) => {
            setOverlay(null)
            void reprocessArtifactRecord(artifactId)
          }}
        />
      ) : null}
      {pendingDocumentUpdateConfirmation ? (
        <DocumentUpdateConfirmationModal
          confirmation={pendingDocumentUpdateConfirmation}
          submitting={docSubmitting}
          onCancel={() => setPendingDocumentUpdateConfirmation(null)}
          onContinue={() => void startDocumentGeneration(true)}
        />
      ) : null}
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
  projects: Project[]
  artifacts: ArtifactRecord[]
  generatedOutputs: GeneratedOutput[]
  activeJobs: number
  failedJobs: number
  artifactCount: number
  outputs: number
  readyKnowledgeBases: number
  activeKnowledgeProjects: number
  recentDocumentJobs: GeneratedOutput[]
  recentKnowledgeJobs: KnowledgeJobRecord[]
  analytics: AnalyticsSummary | null
  notifications: NotificationEvent[]
  auditEvents: AuditEvent[]
  unreadCount: number
  currentUserRole?: CurrentUser['role']
  infrastructureLoad: InfrastructureLoad | null
  onOpenNotifications: () => void
  onOpenArtifacts: () => void
  onOpenAttention: (focus?: WorkReviewFocus) => void
  onOpenDocuments: (projectName?: string, artifact?: DocumentArtifactKey) => void
  onOpenKnowledge: (projectName?: string) => void
  onOpenAnalytics: () => void
  onOpenDiagnostics: () => void
}) {
  const completedKnowledgeJobs = props.recentKnowledgeJobs.filter((job) => job.status === 'completed').length
  const completedWork = props.analytics?.overview?.totalJobsCompleted ?? (props.outputs + completedKnowledgeJobs)
  const totalTerminal = completedWork + props.failedJobs
  const successRate = totalTerminal ? Math.round((completedWork / totalTerminal) * 100) : 0
  const coverageWarnings = props.generatedOutputs.filter((output) => hasCoverageReview(output.output)).length
  const validationWarnings = props.generatedOutputs.filter((output) => output.status === 'completed' && hasDocumentValidationReview(output.output)).length
  const recoveredIngestion = props.recentKnowledgeJobs.filter((job) => knowledgeJobRetryState(job, props.artifacts, props.recentKnowledgeJobs, buildArtifactLatestAttemptMap(props.artifacts)) === 'recovered').length
  const recoveredDocuments = props.generatedOutputs.filter((job) => generationDisplayStatus(job, props.generatedOutputs) === 'recovered').length
  const recoveredJobs = recoveredIngestion + recoveredDocuments
  const updateDueItems = buildDocumentUpdateDueItems(props.projects, props.artifacts, props.generatedOutputs, props.recentKnowledgeJobs)
  const projectRows = buildProjectReadinessRows(props.projects, props.artifacts, props.generatedOutputs, props.recentKnowledgeJobs)
  const readinessBlockers = projectRows.filter(isProjectReadinessBlocked)
  const totalCost = props.analytics?.overview?.totalCostUsd ?? 0
  const totalTokens = props.analytics?.overview?.totalTokensConsumed ?? 0
  const topActions = buildDashboardActions(props)
  const recentActivity = buildDashboardActivity(props.recentDocumentJobs, props.recentKnowledgeJobs, props.auditEvents)

  const kpis = [
    {
      label: 'Needs attention',
      value: props.failedJobs + updateDueItems.length + coverageWarnings + validationWarnings + readinessBlockers.length,
      detail: props.failedJobs ? `${props.failedJobs} retry-ready` : validationWarnings ? `${validationWarnings} admin review${validationWarnings === 1 ? '' : 's'}` : updateDueItems.length ? `${updateDueItems.length} updates due` : coverageWarnings ? `${coverageWarnings} coverage reviews` : readinessBlockers.length ? `${readinessBlockers.length} readiness blocker${readinessBlockers.length === 1 ? '' : 's'}` : 'No blocking action',
      tone: props.failedJobs || validationWarnings || coverageWarnings || updateDueItems.length || readinessBlockers.length ? 'warning' : 'success',
      icon: AlertTriangle,
      onClick: props.failedJobs || validationWarnings || coverageWarnings || updateDueItems.length || readinessBlockers.length ? () => props.onOpenAttention('all') : props.onOpenAnalytics,
    },
    {
      label: props.activeKnowledgeProjects ? 'KB building' : 'KB ready',
      value: props.activeKnowledgeProjects || props.readyKnowledgeBases,
      detail: props.activeKnowledgeProjects
        ? `${props.readyKnowledgeBases} ready, ${props.activeKnowledgeProjects} ingesting`
        : `${props.projects.length} assigned ${props.projects.length === 1 ? 'project' : 'projects'}`,
      tone: props.activeKnowledgeProjects ? 'info' : props.readyKnowledgeBases ? 'success' : 'warning',
      icon: Database,
      onClick: () => props.onOpenKnowledge(),
    },
    {
      label: 'Outputs',
      value: props.outputs,
      detail: `${props.activeJobs} active now`,
      tone: props.activeJobs ? 'info' : 'neutral',
      icon: FileText,
      onClick: () => props.onOpenDocuments(),
    },
    {
      label: 'Spend',
      value: formatCurrency(totalCost, 3),
      detail: `${formatCompactNumber(totalTokens)} tokens`,
      tone: 'neutral',
      icon: BarChart3,
      onClick: props.onOpenAnalytics,
    },
  ] as const

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live workspace
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">
                {props.analytics?.meta?.generatedAt ? `Analytics refreshed ${formatTime(props.analytics.meta.generatedAt)}` : 'Using workspace activity'}
              </span>
            </div>
            <h3 className="mt-4 max-w-4xl text-2xl font-bold leading-tight text-on-surface sm:text-3xl">
              QA operations cockpit for readiness, coverage, reliability, and cost.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Project readiness, live pipeline health, generated output quality, and spend are aligned into one operational view.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => props.onOpenKnowledge()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm hover:opacity-90">
                <UploadCloud className="h-4 w-4" /> Ingest
              </button>
              <button onClick={() => props.onOpenDocuments()} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
                <FileText className="h-4 w-4" /> Generate
              </button>
              <button onClick={props.onOpenAnalytics} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
                <BarChart3 className="h-4 w-4" /> Analytics
              </button>
            </div>
          </div>
          <div className="border-t border-outline-variant bg-surface-container-low p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operational pulse</p>
            <div className="mt-4 grid gap-3">
              <DashboardPulseRow label="Success rate" value={`${successRate}%`} tone={successRate >= 90 ? 'success' : successRate ? 'warning' : 'info'} />
              <DashboardPulseRow label="Active work" value={`${props.activeJobs}`} tone={props.activeJobs ? 'info' : 'success'} />
              <DashboardPulseRow label="Recovered jobs" value={`${recoveredJobs}`} tone={recoveredJobs ? 'success' : 'neutral'} />
              <DashboardPulseRow label="Unread alerts" value={`${props.unreadCount}`} tone={props.unreadCount ? 'warning' : 'success'} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <DashboardKpiButton key={item.label} {...item} />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.38fr)]">
        <div className="space-y-6">
          <DashboardActionQueue actions={topActions} />
          <ProjectReadinessBoard rows={projectRows} onOpenKnowledge={props.onOpenKnowledge} onOpenDocuments={props.onOpenDocuments} />
          <DashboardActivityFeed activity={recentActivity} onOpenAnalytics={props.onOpenAnalytics} />
        </div>

        <div className="space-y-6">
          <QualityCoverageCard generatedOutputs={props.generatedOutputs} projects={props.projects} onOpenDocuments={props.onOpenDocuments} onOpenAttention={props.onOpenAttention} />
          <PipelineHealthCard analytics={props.analytics} activeJobs={props.activeJobs} failedJobs={props.failedJobs} onOpenAnalytics={props.onOpenAnalytics} />
          <ReadinessGapsCard
            rows={projectRows}
            activeJobs={props.activeJobs}
            failedJobs={props.failedJobs}
            onOpenDocuments={props.onOpenDocuments}
            onOpenKnowledge={props.onOpenKnowledge}
            onOpenAnalytics={props.onOpenAnalytics}
            onOpenAttention={props.onOpenAttention}
          />
        </div>
      </div>
    </div>
  )
}

type DashboardKpiTone = StatusTone | 'neutral'

function DashboardKpiButton({
  label,
  value,
  detail,
  tone,
  icon: Icon,
  onClick,
}: {
  label: string
  value: string | number
  detail: string
  tone: DashboardKpiTone
  icon: typeof LayoutDashboard
  onClick: () => void
}) {
  const classes = dashboardToneClasses(tone)
  return (
    <button onClick={onClick} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${classes.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${classes.badge}`}>{label}</span>
      </div>
      <p className="mt-4 text-2xl font-bold leading-tight text-on-surface sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-on-surface-variant">{detail}</p>
    </button>
  )
}

function DashboardPulseRow({ label, value, tone }: { label: string; value: string; tone: DashboardKpiTone }) {
  const classes = dashboardToneClasses(tone)
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
      <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm font-bold ${classes.badge}`}>{value}</span>
    </div>
  )
}

function DashboardActionQueue({ actions }: { actions: DashboardActionItem[] }) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Action required</p>
          <h3 className="mt-1 text-xl font-semibold text-on-surface">What needs attention now</h3>
        </div>
        <span className="rounded-full border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant">{actions.length} recommendations</span>
      </div>
      <div className="divide-y divide-outline-variant">
        {actions.map((action) => {
          const Icon = action.icon
          const classes = dashboardToneClasses(action.tone)
          return (
            <button key={action.title} onClick={action.onAction} className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-surface-container-low">
              <span className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${classes.icon}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-on-surface">{action.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${classes.badge}`}>{action.priority}</span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-on-surface-variant">{action.detail}</span>
              </span>
              <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-primary" />
            </button>
          )
        })}
      </div>
    </section>
  )
}

type DashboardActionItem = {
  title: string
  detail: string
  priority: string
  tone: DashboardKpiTone
  icon: typeof LayoutDashboard
  onAction: () => void
}

function buildDashboardActions(props: {
  readyKnowledgeBases: number
  activeKnowledgeProjects: number
  activeJobs: number
  failedJobs: number
  unreadCount: number
  generatedOutputs: GeneratedOutput[]
  projects: Project[]
  artifacts: ArtifactRecord[]
  recentKnowledgeJobs: KnowledgeJobRecord[]
  onOpenKnowledge: (projectName?: string) => void
  onOpenDocuments: (projectName?: string, artifact?: DocumentArtifactKey) => void
  onOpenArtifacts: () => void
  onOpenAttention: (focus?: WorkReviewFocus) => void
  onOpenAnalytics: () => void
  onOpenNotifications: () => void
}): DashboardActionItem[] {
  const coverageWarnings = props.generatedOutputs.filter((output) => hasCoverageReview(output.output)).length
  const validationWarnings = props.generatedOutputs.filter((output) => output.status === 'completed' && hasDocumentValidationReview(output.output)).length
  const updateDueItems = buildDocumentUpdateDueItems(props.projects, props.artifacts, props.generatedOutputs, props.recentKnowledgeJobs)
  const actions: DashboardActionItem[] = []
  if (props.failedJobs) {
    actions.push({
      title: 'Review retry-ready jobs',
      detail: `${props.failedJobs} job${props.failedJobs === 1 ? '' : 's'} can be retried or reprocessed. Clear these before the next full E2E pass.`,
      priority: 'High',
      tone: 'warning',
      icon: RefreshCw,
      onAction: () => props.onOpenAttention('retry'),
    })
  }
  if (updateDueItems.length) {
    actions.push({
      title: 'Review updates due',
      detail: `${updateDueItems.length} generated output${updateDueItems.length === 1 ? '' : 's'} may be stale because source knowledge or upstream Jira outputs changed.`,
      priority: 'Update',
      tone: 'warning',
      icon: RefreshCw,
      onAction: () => props.onOpenAttention('updates'),
    })
  }
  if (validationWarnings) {
    actions.push({
      title: 'Review document validation issues',
      detail: `${validationWarnings} completed output${validationWarnings === 1 ? '' : 's'} need admin/support review before sign-off.`,
      priority: 'Admin',
      tone: 'warning',
      icon: ShieldCheck,
      onAction: () => props.onOpenAttention('admin'),
    })
  }
  if (coverageWarnings) {
    actions.push({
      title: 'Review coverage warnings',
      detail: `${coverageWarnings} generated output${coverageWarnings === 1 ? '' : 's'} completed with coverage review guidance.`,
      priority: 'Review',
      tone: 'warning',
      icon: ScanSearch,
      onAction: () => props.onOpenAttention('coverage'),
    })
  }
  if (!props.readyKnowledgeBases && props.activeKnowledgeProjects) {
    actions.push({
      title: 'Monitor knowledge ingestion',
      detail: `${props.activeKnowledgeProjects} project${props.activeKnowledgeProjects === 1 ? ' is' : 's are'} still building the knowledge base. Generate deliverables after ingestion finishes.`,
      priority: 'Live',
      tone: 'info',
      icon: Gauge,
      onAction: props.onOpenAnalytics,
    })
  } else if (!props.readyKnowledgeBases) {
    actions.push({
      title: 'Create the first retrieval-ready knowledge base',
      detail: 'Ingest project artifacts so generation has grounded source context and readiness gates can unlock.',
      priority: 'Start here',
      tone: 'info',
      icon: UploadCloud,
      onAction: () => props.onOpenKnowledge(),
    })
  } else {
    actions.push({
      title: 'Generate or update QA deliverables',
      detail: `${props.readyKnowledgeBases} project${props.readyKnowledgeBases === 1 ? '' : 's'} are ready for document generation and update workflows.`,
      priority: 'Next best',
      tone: 'success',
      icon: FileText,
      onAction: () => props.onOpenDocuments(),
    })
  }
  if (props.activeJobs) {
    actions.push({
      title: 'Monitor active pipeline work',
      detail: `${props.activeJobs} job${props.activeJobs === 1 ? '' : 's'} currently running. Watch throughput, retry status, and spend from Analytics.`,
      priority: 'Live',
      tone: 'info',
      icon: Gauge,
      onAction: props.onOpenAnalytics,
    })
  }
  if (props.unreadCount) {
    actions.push({
      title: 'Clear unread operational notifications',
      detail: `${props.unreadCount} notification${props.unreadCount === 1 ? '' : 's'} are waiting in the tray.`,
      priority: 'Inbox',
      tone: 'neutral',
      icon: Bell,
      onAction: props.onOpenNotifications,
    })
  }
  return actions.slice(0, 4)
}

type ProjectReadinessRow = {
  project: Project
  artifactCount: number
  activeKnowledgeWork: number
  sharedDocs: number
  kbCell: ProjectReadinessCell
  strategy: ProjectReadinessCell
  plan: ProjectReadinessCell
  risk: ProjectReadinessCell
  epicsStories: ProjectReadinessCell
  storyTestCases: ProjectReadinessCell
  rtm: ProjectReadinessCell
  backlogReady: boolean
  testCasesReady: boolean
  rtmReady: boolean
  coverageWarnings: number
  lastActivity: string
  nextAction: string
  nextActionView: 'knowledge' | 'documents'
  nextArtifact?: DocumentArtifactKey
}

type ProjectReadinessCell = {
  label: string
  tone: DashboardKpiTone
}

function isProjectReadinessBlocked(row: ProjectReadinessRow) {
  return (
    row.kbCell.label !== 'Ready' ||
    !row.backlogReady ||
    !row.testCasesReady ||
    !row.rtmReady ||
    row.sharedDocs < 3
  )
}

function projectHasActiveKnowledgeWork(projectName: string, artifacts: ArtifactRecord[], jobs: KnowledgeJobRecord[]) {
  const name = projectName.trim().toLowerCase()
  return artifacts.some((artifact) => artifact.projectName.trim().toLowerCase() === name && artifact.status === 'processing')
    || jobs.some((job) => job.projectName.trim().toLowerCase() === name && isActiveDocumentStatus(job.status))
}

function projectKnowledgeReadinessCell(project: Project, artifacts: ArtifactRecord[], jobs: KnowledgeJobRecord[]): ProjectReadinessCell {
  const active = projectHasActiveKnowledgeWork(project.name, artifacts, jobs)
  if (active) return { label: 'Ingesting', tone: 'info' }
  const hasProcessedArtifact = artifacts.some((artifact) => (
    artifact.projectName.trim().toLowerCase() === project.name.trim().toLowerCase()
    && artifact.status === 'processed'
  ))
  if (project.status === 'ready' && hasProcessedArtifact) return { label: 'Ready', tone: 'success' }
  if (hasProcessedArtifact) return { label: 'Ready', tone: 'success' }
  if (artifacts.some((artifact) => artifact.projectName.trim().toLowerCase() === project.name.trim().toLowerCase())) {
    return { label: 'Building', tone: 'info' }
  }
  return { label: 'Draft', tone: 'warning' }
}

function outputReadinessCell(output: GeneratedOutput | null): ProjectReadinessCell {
  if (!output) return { label: 'Missing', tone: 'warning' }
  if (hasCoverageReview(output.output)) return { label: 'Review', tone: 'warning' }
  return { label: 'Ready', tone: 'success' }
}

function sharedOutputReadinessCell(output: GeneratedOutput | null, latestKnowledgeTime: number): ProjectReadinessCell {
  const base = outputReadinessCell(output)
  if (!output) return base
  if (base.label === 'Review') return base
  const outputTime = safeTimestamp(output.createdAt)
  if (latestKnowledgeTime && outputTime && latestKnowledgeTime > outputTime) {
    return { label: 'Needs Update', tone: 'warning' }
  }
  return base
}

function buildProjectReadinessRows(projects: Project[], artifacts: ArtifactRecord[], outputs: GeneratedOutput[], jobs: KnowledgeJobRecord[]): ProjectReadinessRow[] {
  return projects.map((project) => {
    const name = project.name.trim().toLowerCase()
    const projectArtifacts = artifacts.filter((artifact) => artifact.projectName.trim().toLowerCase() === name)
    const projectOutputs = outputs.filter((output) => output.projectName.trim().toLowerCase() === name)
    const projectJobs = jobs.filter((job) => job.projectName.trim().toLowerCase() === name)
    const activeKnowledgeWork = projectArtifacts.filter((artifact) => artifact.status === 'processing').length
      + projectJobs.filter((job) => isActiveDocumentStatus(job.status)).length
    const kbCell = projectKnowledgeReadinessCell(project, artifacts, jobs)
    const strategyOutput = latestCompletedOutputForArtifact(project.name, 'strategy', outputs)
    const planOutput = latestCompletedOutputForArtifact(project.name, 'plan', outputs)
    const riskOutput = latestCompletedOutputForArtifact(project.name, 'risk', outputs)
    const backlogOutput = latestCompletedOutputForArtifact(project.name, 'epicsAndStories', outputs)
    const testCasesOutput = latestCompletedOutputForArtifact(project.name, 'testCases', outputs)
    const rtmOutput = latestCompletedOutputForArtifact(project.name, 'traceability_matrix', outputs)
    const latestKnowledgeTime = latestKnowledgeUpdateTimestamp(project.name, jobs, artifacts)
    const strategy = sharedOutputReadinessCell(strategyOutput, latestKnowledgeTime)
    const plan = sharedOutputReadinessCell(planOutput, latestKnowledgeTime)
    const risk = sharedOutputReadinessCell(riskOutput, latestKnowledgeTime)
    const epicsStories = outputReadinessCell(backlogOutput)
    const storyTestCases = testCasesOutput
      ? outputReadinessCell(testCasesOutput)
      : backlogOutput
        ? { label: 'Missing', tone: 'warning' as DashboardKpiTone }
        : { label: 'Blocked', tone: 'warning' as DashboardKpiTone }
    const rtm = rtmOutput
      ? outputReadinessCell(rtmOutput)
      : backlogOutput && testCasesOutput
        ? { label: 'Missing', tone: 'warning' as DashboardKpiTone }
        : { label: 'Blocked', tone: 'warning' as DashboardKpiTone }
    const sharedDocs = [strategyOutput, planOutput, riskOutput].filter(Boolean).length
    const backlogReady = Boolean(backlogOutput)
    const testCasesReady = Boolean(testCasesOutput)
    const rtmReady = Boolean(rtmOutput)
    const coverageWarnings = projectOutputs.filter((output) => hasCoverageReview(output.output)).length
    const timestamps = [
      project.updatedAt,
      ...projectArtifacts.map((artifact) => artifact.uploadedAt),
      ...projectOutputs.map((output) => output.createdAt),
      ...projectJobs.map((job) => job.createdAt),
    ].map(safeTimestamp)
    const lastActivityTime = Math.max(0, ...timestamps)
    let nextAction = 'Generate shared documents'
    let nextActionView: 'knowledge' | 'documents' = 'documents'
    let nextArtifact: DocumentArtifactKey | undefined = ([
      ['strategy', strategyOutput],
      ['plan', planOutput],
      ['risk', riskOutput],
    ] as Array<[DocumentArtifactKey, GeneratedOutput | null]>).find(([, output]) => !output)?.[0]
    const sharedUpdateArtifact = ([
      ['strategy', strategy],
      ['plan', plan],
      ['risk', risk],
    ] as Array<[DocumentArtifactKey, ProjectReadinessCell]>).find(([, cell]) => cell.label === 'Needs Update')?.[0]
    if (kbCell.label === 'Ingesting') {
      nextAction = 'Monitor ingestion'
      nextActionView = 'knowledge'
      nextArtifact = undefined
    } else if (kbCell.label !== 'Ready') {
      nextAction = 'Ingest source artifacts'
      nextActionView = 'knowledge'
      nextArtifact = undefined
    } else if (sharedUpdateArtifact) {
      nextAction = 'Update documents'
      nextArtifact = sharedUpdateArtifact
    } else if (!backlogReady) {
      nextAction = 'Generate Epics & Stories'
      nextArtifact = 'epicsAndStories'
    } else if (!testCasesReady) {
      nextAction = 'Generate Story Test Cases'
      nextArtifact = 'testCases'
    } else if (!rtmReady) {
      nextAction = 'Generate RTM'
      nextArtifact = 'traceability_matrix'
    } else if (coverageWarnings) {
      nextAction = 'Review coverage warnings'
      nextArtifact = resolveArtifactKey(projectOutputs.find((output) => hasCoverageReview(output.output)) || projectOutputs[0]) || undefined
    } else {
      nextAction = 'Monitor quality and spend'
      nextArtifact = undefined
    }
    return {
      project,
      artifactCount: projectArtifacts.length,
      activeKnowledgeWork,
      kbCell,
      sharedDocs,
      strategy,
      plan,
      risk,
      epicsStories,
      storyTestCases,
      rtm,
      backlogReady,
      testCasesReady,
      rtmReady,
      coverageWarnings,
      lastActivity: lastActivityTime ? new Date(lastActivityTime).toISOString() : project.updatedAt,
      nextAction,
      nextActionView,
      nextArtifact,
    }
  }).sort((left, right) => safeTimestamp(right.lastActivity) - safeTimestamp(left.lastActivity))
}

function ProjectReadinessBoard({ rows, onOpenKnowledge, onOpenDocuments }: { rows: ProjectReadinessRow[]; onOpenKnowledge: (projectName?: string) => void; onOpenDocuments: (projectName?: string, artifact?: DocumentArtifactKey) => void }) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Project readiness</p>
          <h3 className="mt-1 text-xl font-semibold text-on-surface">Lifecycle state by project</h3>
        </div>
        <span className="rounded-full border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant">{rows.length} projects</span>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-[58rem] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-3 py-3 text-center">KB</th>
                <th className="px-3 py-3 text-center">Strategy</th>
                <th className="px-3 py-3 text-center">Plan</th>
                <th className="px-3 py-3 text-center">Risk</th>
                <th className="px-3 py-3 text-center">Epics/Stories</th>
                <th className="px-3 py-3 text-center">STC</th>
                <th className="px-3 py-3 text-center">RTM</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.slice(0, 6).map((row) => (
                <tr key={row.project.id} className="align-top hover:bg-surface-container-low">
                  <td className="px-5 py-4">
                    <p className="break-words font-semibold text-on-surface">{row.project.name}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{formatTime(row.lastActivity)}</p>
                  </td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.kbCell.label} tone={row.kbCell.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.strategy.label} tone={row.strategy.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.plan.label} tone={row.plan.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.risk.label} tone={row.risk.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.epicsStories.label} tone={row.epicsStories.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.storyTestCases.label} tone={row.storyTestCases.tone} /></td>
                  <td className="px-3 py-4 text-center"><ReadinessPill label={row.rtm.label} tone={row.rtm.tone} /></td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => row.nextActionView === 'knowledge' ? onOpenKnowledge(row.project.name) : onOpenDocuments(row.project.name, row.nextArtifact)}
                      className="inline-flex max-w-full items-center justify-end gap-1 text-right text-xs font-bold leading-5 text-primary hover:underline"
                    >
                      {dashboardProjectActionLabel(row.nextAction)} <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-5 text-sm text-on-surface-variant">No assigned projects yet. Create or assign a project to start building QA intelligence.</p>
      )}
    </section>
  )
}

function ReadinessPill({ label, tone }: { label: string; tone: DashboardKpiTone }) {
  const classes = dashboardToneClasses(tone)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes.badge}`}>{label}</span>
}

function dashboardProjectActionLabel(action: string) {
  if (action === 'Review coverage warnings') return 'Review'
  if (action === 'Ingest source artifacts') return 'Ingest'
  if (action === 'Monitor ingestion') return 'Monitor'
  return action
}

function QualityCoverageCard({
  generatedOutputs,
  projects,
  onOpenDocuments,
  onOpenAttention,
}: {
  generatedOutputs: GeneratedOutput[]
  projects: Project[]
  onOpenDocuments: () => void
  onOpenAttention: (focus?: WorkReviewFocus) => void
}) {
  const completed = generatedOutputs.filter((output) => output.status === 'completed')
  const warning = completed.filter((output) => hasCoverageReview(output.output)).length
  const validationWarning = completed.filter((output) => hasDocumentValidationReview(output.output)).length
  const passed = Math.max(0, completed.length - warning - validationWarning)
  const rtmCount = projects.filter((project) => latestCompletedOutputForArtifact(project.name, 'traceability_matrix', generatedOutputs)).length
  const buttonLabel = validationWarning ? 'Review validation' : warning ? 'Review coverage' : 'View deliverables'
  const handleAction = () => {
    if (validationWarning) {
      onOpenAttention('admin')
      return
    }
    if (warning) {
      onOpenAttention('coverage')
      return
    }
    onOpenDocuments()
  }
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Quality coverage</p>
          <h3 className="mt-1 text-lg font-semibold text-on-surface">Output confidence</h3>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <ScanSearch className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5 space-y-3">
        <DashboardProgressRow label="Coverage passed" value={passed} total={Math.max(completed.length, 1)} tone="success" />
        <DashboardProgressRow label="Needs review" value={warning} total={Math.max(completed.length, 1)} tone={warning ? 'warning' : 'success'} />
        <DashboardProgressRow label="Admin validation" value={validationWarning} total={Math.max(completed.length, 1)} tone={validationWarning ? 'warning' : 'success'} />
        <DashboardProgressRow label="RTM ready projects" value={rtmCount} total={Math.max(projects.length, 1)} tone={rtmCount ? 'success' : 'info'} />
      </div>
      <button onClick={handleAction} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
        {buttonLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  )
}

function PipelineHealthCard({ analytics, activeJobs, failedJobs, onOpenAnalytics }: { analytics: AnalyticsSummary | null; activeJobs: number; failedJobs: number; onOpenAnalytics: () => void }) {
  const overview = analytics?.overview
  const completed = overview?.totalJobsCompleted ?? 0
  const successRate = completed + failedJobs ? Math.round((completed / (completed + failedJobs)) * 100) : 0
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Pipeline health</p>
          <h3 className="mt-1 text-lg font-semibold text-on-surface">Reliability and throughput</h3>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
          <Gauge className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        <DashboardMetricLine label="Completed work" value={formatCompactNumber(completed)} />
        <DashboardMetricLine label="Success rate" value={`${successRate}%`} />
        <DashboardMetricLine label="Active jobs" value={String(activeJobs)} />
        <DashboardMetricLine label="Estimated cost" value={formatCurrency(overview?.totalCostUsd ?? 0, 3)} />
      </div>
      <button onClick={onOpenAnalytics} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
        Open Analytics <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  )
}

type ReadinessGap = {
  title: string
  detail: string
  value: string
  tone: DashboardKpiTone
  icon: typeof LayoutDashboard
  actionLabel: string
  onAction: () => void
}

function ReadinessGapsCard({
  rows,
  activeJobs,
  failedJobs,
  onOpenDocuments,
  onOpenKnowledge,
  onOpenAnalytics,
  onOpenAttention,
}: {
  rows: ProjectReadinessRow[]
  activeJobs: number
  failedJobs: number
  onOpenDocuments: (projectName?: string, artifact?: DocumentArtifactKey) => void
  onOpenKnowledge: (projectName?: string) => void
  onOpenAnalytics: () => void
  onOpenAttention: (focus?: WorkReviewFocus) => void
}) {
  const missingKnowledge = rows.filter((row) => row.project.status !== 'ready').length
  const sharedDocGaps = rows.filter((row) => row.project.status === 'ready' && row.sharedDocs < 3).length
  const backlogGaps = rows.filter((row) => row.project.status === 'ready' && !row.backlogReady).length
  const testCaseGaps = rows.filter((row) => row.backlogReady && !row.testCasesReady).length
  const rtmGaps = rows.filter((row) => row.backlogReady && row.testCasesReady && !row.rtmReady).length
  const coverageWarnings = rows.reduce((total, row) => total + row.coverageWarnings, 0)
  const missingKnowledgeRow = rows.find((row) => row.project.status !== 'ready')
  const sharedDocGapRow = rows.find((row) => row.project.status === 'ready' && row.sharedDocs < 3)
  const backlogGapRow = rows.find((row) => row.project.status === 'ready' && !row.backlogReady)
  const testCaseGapRow = rows.find((row) => row.backlogReady && !row.testCasesReady)
  const rtmGapRow = rows.find((row) => row.backlogReady && row.testCasesReady && !row.rtmReady)
  const gaps: ReadinessGap[] = [
    missingKnowledge
      ? {
          title: 'Knowledge base missing',
          detail: `${missingKnowledge} project${missingKnowledge === 1 ? '' : 's'} need retrieval-ready context.`,
          value: String(missingKnowledge),
          tone: 'warning',
          icon: UploadCloud,
          actionLabel: 'Prepare KB',
          onAction: () => onOpenKnowledge(missingKnowledgeRow?.project.name),
        }
      : null,
    sharedDocGaps
      ? {
          title: 'Shared docs incomplete',
          detail: `${sharedDocGaps} ready project${sharedDocGaps === 1 ? '' : 's'} still need strategy, plan, or risk outputs.`,
          value: String(sharedDocGaps),
          tone: 'info',
          icon: FileText,
          actionLabel: 'Generate docs',
          onAction: () => onOpenDocuments(sharedDocGapRow?.project.name, sharedDocGapRow?.nextArtifact),
        }
      : null,
    backlogGaps
      ? {
          title: 'Backlog not generated',
          detail: `${backlogGaps} project${backlogGaps === 1 ? '' : 's'} need Epics & User Stories before downstream QA outputs.`,
          value: String(backlogGaps),
          tone: 'warning',
          icon: Network,
          actionLabel: 'Generate backlog',
          onAction: () => onOpenDocuments(backlogGapRow?.project.name, 'epicsAndStories'),
        }
      : null,
    testCaseGaps
      ? {
          title: 'Story test cases blocked',
          detail: `${testCaseGaps} project${testCaseGaps === 1 ? '' : 's'} have backlog ready but missing linked test cases.`,
          value: String(testCaseGaps),
          tone: 'warning',
          icon: ListChecks,
          actionLabel: 'Create tests',
          onAction: () => onOpenDocuments(testCaseGapRow?.project.name, 'testCases'),
        }
      : null,
    rtmGaps
      ? {
          title: 'RTM not complete',
          detail: `${rtmGaps} project${rtmGaps === 1 ? '' : 's'} can now generate traceability.`,
          value: String(rtmGaps),
          tone: 'info',
          icon: ScanSearch,
          actionLabel: 'Generate RTM',
          onAction: () => onOpenDocuments(rtmGapRow?.project.name, 'traceability_matrix'),
        }
      : null,
    coverageWarnings
      ? {
          title: 'Coverage review pending',
          detail: `${coverageWarnings} generated output${coverageWarnings === 1 ? '' : 's'} need review before sign-off.`,
          value: String(coverageWarnings),
          tone: 'warning',
          icon: AlertTriangle,
          actionLabel: 'Review',
          onAction: () => onOpenAttention('coverage'),
        }
      : null,
    failedJobs
      ? {
          title: 'Retry-ready jobs',
          detail: `${failedJobs} job${failedJobs === 1 ? '' : 's'} should be retried or inspected.`,
          value: String(failedJobs),
          tone: 'error',
          icon: RefreshCw,
          actionLabel: 'Open jobs',
          onAction: () => onOpenAttention('retry'),
        }
      : null,
    activeJobs
      ? {
          title: 'Pipeline in progress',
          detail: `${activeJobs} job${activeJobs === 1 ? '' : 's'} are currently running.`,
          value: String(activeJobs),
          tone: 'info',
          icon: Clock,
          actionLabel: 'Track work',
          onAction: onOpenAnalytics,
        }
      : null,
  ].filter(Boolean) as ReadinessGap[]

  const visibleGaps = gaps.slice(0, 4)
  const totalGaps = gaps.reduce((total, gap) => total + Number(gap.value || 0), 0)

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Readiness gaps</p>
          <h3 className="mt-1 text-lg font-semibold text-on-surface">What could block the next output</h3>
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${totalGaps ? 'border-warning/50 bg-warning/10 text-warning' : 'border-success/40 bg-success/10 text-success'}`}>
          {totalGaps ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </span>
      </div>
      {visibleGaps.length ? (
        <div className="mt-5 divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {visibleGaps.map((gap) => {
            const classes = dashboardToneClasses(gap.tone)
            const Icon = gap.icon
            return (
              <button key={gap.title} onClick={gap.onAction} className="flex w-full items-start gap-3 p-3 text-left transition hover:bg-surface-container-low">
                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${classes.icon}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-on-surface">{gap.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${classes.badge}`}>{gap.value}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{gap.detail}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    {gap.actionLabel} <ArrowRight className="h-3 w-3" />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-success/30 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-on-surface">No blockers detected</p>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">Projects, coverage, and recent pipeline state are clear for the current workspace view.</p>
            </div>
          </div>
        </div>
      )}
      {gaps.length > visibleGaps.length ? (
        <button onClick={() => onOpenAttention('all')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">
          Review all gaps <ArrowRight className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  )
}

function DashboardActivityFeed({ activity, onOpenAnalytics }: { activity: DashboardActivityItem[]; onOpenAnalytics: () => void }) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recent activity</p>
          <h3 className="mt-1 text-xl font-semibold text-on-surface">Latest operational signals</h3>
        </div>
        <button onClick={onOpenAnalytics} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
          View trends <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {activity.length ? (
        <div className="divide-y divide-outline-variant">
          {activity.slice(0, 6).map((item) => {
            const classes = dashboardToneClasses(item.tone)
            const Icon = item.icon
            return (
              <div key={`${item.id}-${item.timestamp}`} className="flex items-start gap-4 p-5">
                <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${classes.icon}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-on-surface">{item.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${classes.badge}`}>{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.detail}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">{formatTime(item.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="p-5 text-sm text-on-surface-variant">No operational activity yet.</p>
      )}
    </section>
  )
}

type DashboardActivityItem = {
  id: string
  title: string
  detail: string
  status: string
  tone: DashboardKpiTone
  timestamp: string
  icon: typeof LayoutDashboard
}

function buildDashboardActivity(documentJobs: GeneratedOutput[], knowledgeJobs: KnowledgeJobRecord[], auditEvents: AuditEvent[]): DashboardActivityItem[] {
  const documentActivity = documentJobs.slice(0, 8).map((job): DashboardActivityItem => ({
    id: job.jobId || job.id,
    title: job.artifactLabel || 'Generated document',
    detail: job.projectName,
    status: job.status.replace(/_/g, ' '),
    tone: analyticsJobStatusTone(job.status),
    timestamp: job.createdAt,
    icon: FileText,
  }))
  const knowledgeActivity = knowledgeJobs.slice(0, 8).map((job): DashboardActivityItem => ({
    id: job.jobId || job.id,
    title: job.fileName || 'Knowledge ingestion',
    detail: job.projectName,
    status: job.status.replace(/_/g, ' '),
    tone: analyticsJobStatusTone(job.status),
    timestamp: job.createdAt,
    icon: Database,
  }))
  const auditActivity = auditEvents.slice(0, 6).map((event): DashboardActivityItem => ({
    id: event.id,
    title: event.action.replace(/_/g, ' '),
    detail: event.project || event.details,
    status: event.status,
    tone: event.status,
    timestamp: event.timestamp,
    icon: History,
  }))
  return [...documentActivity, ...knowledgeActivity, ...auditActivity]
    .sort((left, right) => safeTimestamp(right.timestamp) - safeTimestamp(left.timestamp))
}

function DashboardProgressRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: DashboardKpiTone }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0
  const classes = dashboardToneClasses(tone)
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-on-surface-variant">{label}</span>
        <span className="font-bold text-on-surface">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${classes.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function DashboardMetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
      <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
      <span className="text-sm font-bold text-on-surface">{value}</span>
    </div>
  )
}

function hasCoverageReview(output: any) {
  const coverage = coverageSummaryFrom(output)
  if (!coverage) return false
  const verdict = coverageVerdict(coverage)
  if (verdict.needsReview) return true
  if (verdict.tone === 'success') return false
  const explicitReview = Number(
    output?.coverageSummary?.needsReview
    || output?.qualityGate?.coverageSummary?.needsReview
    || output?.progress?.coverageSummary?.needsReview
    || 0,
  )
  return explicitReview > 0
}

function dashboardToneClasses(tone: DashboardKpiTone) {
  if (tone === 'success') {
    return {
      surface: 'border-success/30 bg-success/5',
      icon: 'border-success/40 bg-success/10 text-success',
      badge: 'bg-success/10 text-success',
      bar: 'bg-success',
    }
  }
  if (tone === 'warning') {
    return {
      surface: 'border-warning/40 bg-warning/5',
      icon: 'border-warning/50 bg-warning/10 text-warning',
      badge: 'bg-warning/10 text-warning',
      bar: 'bg-warning',
    }
  }
  if (tone === 'error') {
    return {
      surface: 'border-error/40 bg-error/5',
      icon: 'border-error/50 bg-error/10 text-error',
      badge: 'bg-error/10 text-error',
      bar: 'bg-error',
    }
  }
  if (tone === 'info') {
    return {
      surface: 'border-primary/30 bg-primary/5',
      icon: 'border-primary/40 bg-primary/10 text-primary',
      badge: 'bg-primary/10 text-primary',
      bar: 'bg-primary',
    }
  }
  return {
    surface: 'border-outline-variant bg-surface-container-lowest',
    icon: 'border-secondary/30 bg-secondary/10 text-secondary',
    badge: 'bg-surface-container text-on-surface-variant',
    bar: 'bg-secondary',
  }
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
      onAction: readyKnowledgeBases ? () => onOpenDocuments() : () => onOpenKnowledge(),
    },
    {
      title: failedJobs ? 'Review items needing retry' : 'Repository looks healthy',
      detail: failedJobs ? `${failedJobs} item${failedJobs === 1 ? '' : 's'} should be reviewed or retried.` : 'No jobs are waiting for retry right now.',
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
  supportingDocuments: File[]
  setSupportingDocuments: (files: File[]) => void
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
  activeGenerationJob: GeneratedOutput | null
  onDocumentSubmit: (event: FormEvent) => void
  onDocumentReset: () => void
  projects: Project[]
  outputs: GeneratedOutput[]
  storyTestCasesReady: boolean
  traceabilityReady: boolean
  readinessByArtifact: Record<DocumentArtifactKey, DeliverableReadinessState>
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
            supportingDocuments={props.supportingDocuments}
            setSupportingDocuments={props.setSupportingDocuments}
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
            activeGenerationJob={props.activeGenerationJob}
            onSubmit={props.onDocumentSubmit}
            onReset={props.onDocumentReset}
            projects={props.projects}
            storyTestCasesReady={props.storyTestCasesReady}
            traceabilityReady={props.traceabilityReady}
            readinessByArtifact={props.readinessByArtifact}
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
  supportingDocuments: File[]
  setSupportingDocuments: (files: File[]) => void
  images: File[]
  setImages: (files: File[]) => void
  error: string
  submitting: boolean
  onSubmit: (event: FormEvent) => void
  onReset: () => void
}) {
  const selectedFileCount = [props.brd, props.frd, props.hld, props.lld].filter(Boolean).length + props.transcripts.length + props.supportingDocuments.length + props.images.length
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
        <FileDrop label="BRD document" accept=".pdf,.docx" file={props.brd} helper="Business requirements document" onFiles={(files) => props.setBrd(files[0] ?? null)} />
        <FileDrop label="FRD document" accept=".pdf,.docx" file={props.frd} helper="Functional requirements document" onFiles={(files) => props.setFrd(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Technical documents" description="Add architecture and design-level documentation to improve traceability and solution depth.">
        <FileDrop label="HLD document" accept=".pdf,.docx" file={props.hld} helper="High-level design" onFiles={(files) => props.setHld(files[0] ?? null)} />
        <FileDrop label="LLD document" accept=".pdf,.docx" file={props.lld} helper="Low-level design" onFiles={(files) => props.setLld(files[0] ?? null)} />
      </FieldGroup>
      <FieldGroup title="Supporting assets" description="Supplement text documents with transcripts and UI designs so retrieval can use both textual and visual context.">
        <FileDrop
          label="Transcript files"
          accept=".txt,.md,.log"
          files={props.transcripts}
          multiple
          helper="Upload one or more meeting notes or transcript files."
          onFiles={(files) => props.setTranscripts(appendUniqueFiles(props.transcripts, files))}
        />
        <FileDrop
          label="Other supporting documents"
          accept=".pdf,.docx,.pptx,.txt,.md,.csv,.log"
          files={props.supportingDocuments}
          multiple
          helper="Upload supplementary specs, decks, notes, API references, or project context files."
          onFiles={(files) => props.setSupportingDocuments(appendUniqueFiles(props.supportingDocuments, files))}
        />
        <FileDrop label="UI designs" accept=".jpg,.jpeg,.png,.webp,.svg" files={props.images} multiple helper="Upload one or more design images, screenshots, or annotated mockups." onFiles={(files) => props.setImages(appendUniqueFiles(props.images, files))} />
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
  activeGenerationJob: GeneratedOutput | null
  onSubmit: (event: FormEvent) => void
  onReset: () => void
  projects: Project[]
  storyTestCasesReady: boolean
  traceabilityReady: boolean
  readinessByArtifact: Record<DocumentArtifactKey, DeliverableReadinessState>
}) {
  const [readinessModalState, setReadinessModalState] = useState<DeliverableReadinessState | null>(null)
  const generationLocked = props.submitting || Boolean(props.activeGenerationJob)
  const activeJobLabel = props.activeGenerationJob?.jobId || props.activeGenerationJob?.id

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
            const readiness = props.readinessByArtifact[item.key]
            const ReadinessIcon = readiness.status === 'ready' ? CheckCircle2 : readiness.status === 'warning' ? AlertTriangle : Clock
            const readinessTooltip = readiness.status === 'ready'
              ? `${item.label} is ready.`
              : readiness.status === 'warning'
                ? `${item.label} can be generated, but review is recommended.`
                : readiness.status === 'idle'
                  ? 'Select a project to check readiness.'
                  : readiness.action
            const readinessIconClass = readiness.status === 'ready'
              ? 'border-success/35 bg-success/10 text-success hover:border-success'
              : readiness.status === 'warning'
                ? 'border-warning/35 bg-warning/10 text-warning hover:border-warning'
                : readiness.status === 'blocked'
                  ? 'border-error/35 bg-error/10 text-error hover:border-error'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary'
            const isDisabled = readiness.status === 'blocked'
            const lockedReason = readiness.action
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
                  <div className="flex shrink-0 items-center gap-2">
                    {selected ? <StatusBadge status="info" label="Selected" /> : null}
                    <button
                      type="button"
                      title={readinessTooltip}
                      aria-label={`Open ${item.label} readiness details. ${readinessTooltip}`}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setReadinessModalState(readiness)
                      }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${readinessIconClass}`}
                    >
                      <ReadinessIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      </div>
      {readinessModalState ? <DeliverableReadinessModal state={readinessModalState} onClose={() => setReadinessModalState(null)} /> : null}
      {props.error ? <FriendlyInlineNotice title="Document generation could not be started" message={props.error} /> : null}
      {props.activeGenerationJob ? (
        <p className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm font-medium text-on-surface">
          Generation job {activeJobLabel} is {props.activeGenerationJob.status}. Wait for it to finish before starting another document generation job.
        </p>
      ) : null}
      <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
        <button type="button" onClick={props.onReset} className="rounded-lg border border-outline-variant px-6 py-3 text-sm font-bold hover:bg-surface-container">Reset</button>
        <button disabled={generationLocked || !props.projectName.trim() || !props.projects.length} className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          {props.submitting || props.activeGenerationJob ? 'Generation in progress...' : 'Generate Documents'}
        </button>
      </div>
    </form>
  )
}

function DocumentUpdateConfirmationModal({
  confirmation,
  submitting,
  onCancel,
  onContinue,
}: {
  confirmation: DocumentUpdateConfirmation
  submitting: boolean
  onCancel: () => void
  onContinue: () => void
}) {
  const isJiraOutput = confirmation.artifact === 'epicsAndStories' || confirmation.artifact === 'testCases'
  const title = confirmation.contextUpdated
    ? confirmation.knowledgeUpdated ? 'Knowledge base updated' : 'Context updated'
    : 'No source changes detected'
  const message = confirmation.contextUpdated
    ? `Q-Ops detected source or upstream context changes after ${confirmation.artifactLabel} was last generated. Updating is recommended so this output uses the latest available context.`
    : `${confirmation.artifactLabel} is already up to date with the current Knowledge Base and upstream context. Regenerating may produce little or no change and will consume additional tokens and cost.`
  const actionText = confirmation.contextUpdated ? 'Update Document' : 'Regenerate Anyway'

  return (
    <ModalFrame title={title} onClose={onCancel} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-surface-container-lowest text-primary">
            <HelpCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-on-surface">{confirmation.artifactLabel}</p>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{message}</p>
          </div>
        </div>
        <dl className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Project</dt>
            <dd className="mt-1 break-words font-semibold text-on-surface [overflow-wrap:anywhere]">{confirmation.projectName}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Existing job</dt>
            <dd className="mt-1 break-all font-mono text-xs text-on-surface">{confirmation.previousJobId || '-'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Last generated</dt>
            <dd className="mt-1 font-semibold text-on-surface">{confirmation.previousCreatedAt ? formatTime(confirmation.previousCreatedAt) : '-'}</dd>
          </div>
        </dl>
        {confirmation.contextUpdated && isJiraOutput ? (
          <p className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm leading-6 text-on-surface-variant">
            {confirmation.updateReasons.length ? `${confirmation.updateReasons.join(' ')} ` : ''}
            Q-Ops will try to reuse or update existing Jira items and add only missing coverage where needed.
          </p>
        ) : !confirmation.contextUpdated ? (
          <p className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm leading-6 text-on-surface-variant">
            Recommended action: cancel this run unless you intentionally want to refresh wording, recover from an external edit, or validate a template/model change.
          </p>
        ) : (
          <p className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm leading-6 text-on-surface-variant">
            {confirmation.updateReasons.length ? `${confirmation.updateReasons.join(' ')} ` : ''}
            Q-Ops will update the existing output instead of creating a duplicate.
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-outline-variant px-5 py-3 text-sm font-bold hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={onContinue} disabled={submitting} className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Starting update...' : actionText}
          </button>
        </div>
      </div>
    </ModalFrame>
  )
}

function DeliverableReadinessModal({ state, onClose }: { state: DeliverableReadinessState; onClose: () => void }) {
  const Icon = state.status === 'ready' ? CheckCircle2 : state.status === 'warning' ? AlertTriangle : Clock
  const toneClass = state.status === 'ready'
    ? 'border-success/30 bg-success-container/40'
    : state.status === 'warning'
      ? 'border-warning/30 bg-warning-container/50'
      : 'border-error/25 bg-error-container/50'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="traceability-readiness-title">
      <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${toneClass}`}>
              <Icon className="h-5 w-5 text-on-surface" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Deliverable readiness</p>
              <h4 id="traceability-readiness-title" className="mt-1 text-lg font-semibold text-on-surface">{state.title}</h4>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container" aria-label="Close readiness details">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">
          <StatusBadge status={state.badgeTone} label={state.badgeLabel} />
          <p className="mt-4 text-sm leading-6 text-on-surface-variant">{state.message}</p>
        </div>
        {state.details.length ? (
          <ul className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            {state.details.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm font-semibold text-on-surface">{state.action}</p>
      </div>
    </div>
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

function formatAcceptedTypes(accept: string) {
  return accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()
}

function isAcceptedUploadFile(file: File, accept: string) {
  const allowed = accept.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  if (!allowed.length) return true
  const name = file.name.toLowerCase()
  return allowed.some((item) => {
    if (item.startsWith('.')) return name.endsWith(item)
    return file.type.toLowerCase() === item
  })
}

function appendUniqueFiles(current: File[], next: File[]) {
  const merged = [...current, ...next]
  return merged.filter((file, index) =>
    merged.findIndex((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index,
  )
}

function FileDrop({ label, accept, file, files, multiple, helper, onFiles }: { label: string; accept: string; file?: File | null; files?: File[]; multiple?: boolean; helper?: string; onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false)
  const [fileTypeError, setFileTypeError] = useState('')
  const selectedText = multiple ? (files?.length ? `${files.length} files selected` : 'No file selected') : file?.name ?? 'No file selected'
  const handleFiles = (nextFiles: File[]) => {
    const accepted = nextFiles.filter((nextFile) => isAcceptedUploadFile(nextFile, accept))
    const rejected = nextFiles.length - accepted.length
    setFileTypeError(rejected ? `${rejected} file${rejected === 1 ? '' : 's'} rejected. Accepted types: ${formatAcceptedTypes(accept)}.` : '')
    onFiles(accepted)
  }
  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    handleFiles(Array.from(event.dataTransfer.files))
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
      <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => handleFiles(Array.from(event.target.files ?? []))} />
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-on-surface">{label}</span>
        <UploadCloud className="h-5 w-5 text-on-surface-variant" />
      </div>
      <p className="text-xs font-medium text-primary">{selectedText}</p>
      <p className="mt-2 text-xs font-medium text-on-surface-variant">Accepted file types: {formatAcceptedTypes(accept)}</p>
      {helper ? <p className="mt-2 text-xs text-on-surface-variant">{helper}</p> : null}
      {fileTypeError ? <p className="mt-2 text-xs font-medium text-error">{fileTypeError}</p> : null}
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
  actionableDetails?: Array<{ label: string; value: string }>
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

function coverageFailureItemLabel(item: Record<string, any> | undefined) {
  if (!item) return ''
  return [
    item.coverageId || item.storyKey || item.module || item.moduleRequirement || item.requirement,
    item.moduleRequirement || item.requirement || item.storySummary || item.summary || item.notes,
  ].map(cleanFailureText).filter(Boolean).join(' - ')
}

function coverageFailureTechnicalDetail(baseDetail: string, coverage: JobCoverageSummary, missingItems: Array<Record<string, any>>) {
  const counts = coverageCounts(coverage)
  const missingDetails = missingItems
    .slice(0, 5)
    .map((item) => coverageFailureItemLabel(item))
    .filter(Boolean)
  const coverageDetail = [
    `Coverage gate: ${coverage.gateStatus || coverage.status || 'failed'}`,
    `Ledger: ${counts.total}`,
    `Covered: ${counts.covered}`,
    `Needs review: ${counts.partial}`,
    `Missing: ${counts.missing}`,
    missingDetails.length ? `Missing items: ${missingDetails.join(' | ')}` : '',
  ].filter(Boolean).join(' | ')
  return [baseDetail, coverageDetail].filter(Boolean).join(' | ')
}

function storyTestCaseFailureItems(output: any, coverage?: JobCoverageSummary | null) {
  const coverageAny = coverage as any
  const candidates = [
    coverageAny?.partialItems,
    coverageAny?.warningItems,
    coverageAny?.missingItems,
    output?.coverageSummary?.partialItems,
    output?.coverageSummary?.warningItems,
    output?.coverageSummary?.missingItems,
    output?.qualityGate?.coverageSummary?.partialItems,
    output?.qualityGate?.coverageSummary?.warningItems,
    output?.qualityGate?.coverageSummary?.missingItems,
    output?.partialStories,
    output?.missingStories,
    output?.repairTargets,
    output?.updateSummary?.repairTargets,
  ].filter(Array.isArray) as Array<Array<Record<string, any>>>
  const seen = new Set<string>()
  return candidates
    .flat()
    .map((item) => item || {})
    .filter((item) => {
      const key = String(item.storyKey || item.jiraStoryKey || item.key || item.issueKey || item.id || '').trim()
      const title = String(item.storySummary || item.summary || item.title || item.moduleRequirement || '').trim()
      const dedupe = `${key}-${title}`.toLowerCase()
      if (!dedupe || seen.has(dedupe)) return false
      seen.add(dedupe)
      return Boolean(key || title)
    })
}

function storyTestCaseFailureDetailRows(items: Array<Record<string, any>>, counts: ReturnType<typeof coverageCounts>) {
  const targetCount = counts.partial + counts.missing || items.length
  const storyRows = items.slice(0, 5).map((item) => {
    const key = cleanFailureText(item.storyKey || item.jiraStoryKey || item.key || item.issueKey)
    const title = cleanFailureText(item.storySummary || item.summary || item.title || item.moduleRequirement)
    const categories = normalizeCategoryLabels(item.missingCategories || item.gapCategories || item.categoriesMissing)
    return [
      [key, title].filter(Boolean).join(' - '),
      categories.length ? `Missing categories: ${categories.slice(0, 8).join(', ')}` : '',
    ].filter(Boolean).join(' | ')
  }).filter(Boolean)

  return [
    targetCount ? { label: 'Repair target', value: `${targetCount} ${targetCount === 1 ? 'story needs' : 'stories need'} missing or partial coverage repair` } : null,
    storyRows.length ? { label: 'Stories to review', value: storyRows.join('\n') } : null,
    { label: 'Recommended action', value: 'Retry this STC update after the workflow fix is applied. Retry should reuse the selected delta scope and target missing or partial stories only.' },
  ].filter(Boolean) as Array<{ label: string; value: string }>
}

function traceabilityMissingStoriesFromOutput(output: any): Array<Record<string, any>> {
  const candidates = [
    output?.storiesWithoutTestCases,
    output?.traceabilityContext?.storiesWithoutTestCases,
    output?.input?.traceabilityContext?.storiesWithoutTestCases,
    output?.qualityGate?.traceabilityContext?.storiesWithoutTestCases,
  ]
  const found = candidates.find(Array.isArray)
  return Array.isArray(found) ? found : []
}

function getFailureDisplay(kind: WorkspaceTab, state: { error?: string; output?: any; jobId?: string | null }): FailureDisplay {
  const output = state.output || {}
  const errorType = output.errorType || output.error?.errorType || ''
  const documentType = String(output.documentType || output.document_type || output.input?.documentType || '').toLowerCase()
  const documentLabel = documentTypeLabel(documentType)
  const messages = [
    state.error,
    ...collectFailureMessages(output),
  ].map(cleanFailureText).filter(Boolean)
  const combined = messages.join(' | ')
  const technicalDetail = combined || 'No detailed backend error was returned.'
  const isParserFailure = /Backlog parser|model JSON|parse model JSON|incomplete|truncated|Expected .*JSON/i.test(combined)
  const isBacklogFailure = errorType === 'PROFESSIONAL_BACKLOG_FAILED' || /professional backlog/i.test(combined)
  const isKnowledge = kind === 'knowledge'
  const coverage = coverageSummaryFrom(output)
  const coverageCountValue = coverageCounts(coverage)
  const coverageAny = coverage as (JobCoverageSummary & { warningItems?: Array<Record<string, any>> }) | null
  const missingCoverageItems: Array<Record<string, any>> = Array.isArray(coverageAny?.missingItems)
    ? coverageAny.missingItems
    : Array.isArray(coverageAny?.warningItems)
      ? coverageAny.warningItems
      : []
  const isRtmCoverageGateFailure = kind === 'documents'
    && documentType === 'traceability_matrix'
    && Boolean(coverage)
    && (
      String(coverage?.gateStatus || coverage?.status || '').toLowerCase() === 'failed'
      || coverageCountValue.missing > 0
      || /quality gate failed|coverage gate/i.test(combined)
    )

  const isDocumentQualityGateFailure = kind === 'documents'
    && /quality gate failed|coverage gate/i.test(combined)
  const isStoryTestCasesCoverageFailure = kind === 'documents'
    && documentType === 'story_test_cases'
    && (
      Boolean(coverage)
      || /story test cases update did not satisfy|required story coverage|story coverage|coverage gate/i.test(combined)
    )
    && (
      coverageCountValue.partial > 0
      || coverageCountValue.missing > 0
      || /missing|partial|repair target|required story coverage/i.test(combined)
    )
  const isStoryTestCasesCrashFailure = kind === 'documents'
    && documentType === 'story_test_cases'
    && (
      errorType === 'STORY_TEST_CASES_WORKFLOW_CRASHED'
      || /workflow stopped|task runner|offer expired|unable to retrieve status|finaliz|crash|interrupted/i.test(combined)
    )

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

  if (isRtmCoverageGateFailure && coverage) {
    const firstMissing = missingCoverageItems[0]
    const firstMissingLabel = coverageFailureItemLabel(firstMissing)
    const missingStories = traceabilityMissingStoriesFromOutput(output)
    const missingStoryLabels = missingStories
      .map((story) => [story.storyKey || story.key, story.storySummary || story.summary].map(cleanFailureText).filter(Boolean).join(' - '))
      .filter(Boolean)
    const storyKey = cleanFailureText(firstMissing?.storyKey || firstMissing?.jiraKey || firstMissing?.key)
    const missingText = coverageCountValue.missing === 1
      ? '1 coverage item is missing'
      : `${coverageCountValue.missing || missingCoverageItems.length} coverage items are missing`
    const actionTarget = missingStoryLabels[0] || storyKey || 'the missing Jira story'
    return {
      title: 'Coverage gate found missing traceability',
      summary: missingStoryLabels.length
        ? `Q-Ops stopped before publishing because ${missingStoryLabels.length} story ${missingStoryLabels.length === 1 ? 'has' : 'have'} no Story Test Case coverage: ${missingStoryLabels.slice(0, 3).join(', ')}.`
        : firstMissingLabel
        ? `Q-Ops stopped before publishing because ${missingText}: ${firstMissingLabel}.`
        : `Q-Ops stopped before publishing because ${missingText}.`,
      action: `Refresh the upstream Story Test Cases coverage for ${actionTarget}, then regenerate the RTM.`,
      code: 'Coverage gate failed',
      technicalDetail: coverageFailureTechnicalDetail(technicalDetail, coverage, missingCoverageItems),
      failedAt: output.failed_at,
    }
  }

  if (isStoryTestCasesCoverageFailure) {
    const stcFailureItems = storyTestCaseFailureItems(output, coverage)
    const firstTarget = stcFailureItems[0]
    const firstLabel = coverageFailureItemLabel(firstTarget)
    const targetCount = coverageCountValue.partial + coverageCountValue.missing || stcFailureItems.length
    return {
      title: 'Story Test Cases coverage needs repair',
      summary: firstLabel
        ? `Q-Ops stopped because ${targetCount || 1} ${targetCount === 1 ? 'story still needs' : 'stories still need'} missing or partial test-case coverage. First target: ${firstLabel}.`
        : 'Q-Ops stopped because the Story Test Cases update did not satisfy required story coverage.',
      action: 'Retry after the workflow fix is applied. The retry should target only the failed, missing, or partial stories and should not regenerate unrelated successful stories.',
      code: 'STC coverage gate failed',
      technicalDetail: coverage
        ? coverageFailureTechnicalDetail(technicalDetail, coverage, stcFailureItems)
        : technicalDetail,
      actionableDetails: storyTestCaseFailureDetailRows(stcFailureItems, coverageCountValue),
      failedAt: output.failed_at,
    }
  }

  if (isStoryTestCasesCrashFailure) {
    const progress = jobProgressFrom(output)
    const details = progress?.details || output.details || {}
    const stage = progressStageLabel(progress) || cleanFailureText(details.stageLabel || details.stage || output.details?.lastCheckpoint) || 'the last recorded checkpoint'
    const usage = output.tokenUsage || output.usageCheckpoint?.tokenUsage || {}
    const totalTokens = Number(usage.total || usage.tokensTotal || output.tokensTotal || 0) || 0
    const cost = Number(usage.estimatedCostUsd || output.estimatedCostUsd || 0) || 0
    const targetCount = Number(details.selectedStoryCount || details.storyCount || output.retryRepairTargetCount || 0) || 0
    return {
      title: 'Story Test Cases run stopped before final status',
      summary: `Q-Ops recorded progress through ${stage}, but the workflow did not write a terminal success or failure before n8n stopped.`,
      action: 'Retry after the workflow fix is applied. The retry should reuse the failed update repair scope and must not regenerate unrelated successful stories.',
      code: 'STC finalization interrupted',
      technicalDetail,
      actionableDetails: [
        { label: 'Last checkpoint', value: stage },
        targetCount ? { label: 'Retry scope', value: `${targetCount} selected ${targetCount === 1 ? 'story' : 'stories'} from the failed update context` } : null,
        totalTokens ? { label: 'Usage preserved', value: `${formatCompactNumber(totalTokens)} tokens${cost ? `, ${formatUsageCurrency(cost)} estimated cost` : ''}` } : null,
        { label: 'Recommended action', value: 'Use Retry only after the STC workflow/admin fix is in place; the backend will reject unsafe full update regeneration.' },
      ].filter(Boolean) as Array<{ label: string; value: string }>,
      failedAt: output.failed_at,
    }
  }

  if (isDocumentQualityGateFailure) {
    const qualityGate = output?.qualityGate || {}
    const wordCount = Number(qualityGate.wordCount || output?.wordCount || output?.word_count || 0)
    const minWordCount = Number(qualityGate.minWordCount || 0)
    const countSummary = minWordCount
      ? `The generated ${documentLabel.toLowerCase()} produced ${wordCount || 0} words against a minimum of ${minWordCount}.`
      : `The generated ${documentLabel.toLowerCase()} did not satisfy the configured quality gate.`
    return {
      title: 'Quality gate failed',
      summary: `Q-Ops stopped before publishing because ${countSummary}`,
      action: 'Regenerate the document after reviewing the failure details. If this repeats, ask an admin to review the document-specific quality gate.',
      code: 'Quality gate failed',
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
        {failure.actionableDetails?.length ? (
          <div className="mt-3 rounded-lg bg-surface-container-lowest p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Actionable context</p>
            <div className="mt-2 space-y-2">
              {failure.actionableDetails.map((detail) => (
                <div key={detail.label} className="rounded-md bg-surface-container-low px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{detail.label}</p>
                  <p className="mt-1 whitespace-pre-line break-words text-xs leading-5 text-on-surface">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
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

function activeJobProgress(status?: string, createdAt?: string, nowMs = Date.now()) {
  if (status === 'completed' || status === 'failed') return 100
  if (status === 'queued' || status === 'pending' || status === 'not_found') return 12
  if (status !== 'processing') return 0

  const startedMs = createdAt ? new Date(createdAt).getTime() : 0
  const elapsedMinutes = startedMs && !Number.isNaN(startedMs)
    ? Math.max(0, (nowMs - startedMs) / 60000)
    : 0

  if (elapsedMinutes < 1) return 18
  if (elapsedMinutes < 3) return 28
  if (elapsedMinutes < 6) return 42
  if (elapsedMinutes < 10) return 56
  if (elapsedMinutes < 15) return 68
  if (elapsedMinutes < 25) return 80
  return 88
}

function estimatedBatchProgress(jobs: Array<KnowledgeJobRecord | GeneratedOutput>, nowMs: number) {
  if (!jobs.length) return 0
  const total = jobs.reduce((sum, job) => {
    const output = 'output' in job ? job.output : undefined
    return sum + progressPercentFrom(job.status, job.createdAt, jobProgressFrom(output), nowMs)
  }, 0)
  return Math.min(100, Math.max(0, Math.round(total / jobs.length)))
}

function isStoryTestCaseJob(job?: KnowledgeJobRecord | GeneratedOutput | null) {
  if (!job || !('documentType' in job || 'artifactLabel' in job || 'output' in job)) return false
  const documentType = 'documentType' in job ? String(job.documentType || '') : ''
  const artifactLabel = 'artifactLabel' in job ? String(job.artifactLabel || '') : ''
  const outputType = 'output' in job ? String(job.output?.documentType || '') : ''
  return [documentType, artifactLabel, outputType].some((value) => value.toLowerCase() === 'story_test_cases')
}

function longRunningGenerationMessage(job?: KnowledgeJobRecord | GeneratedOutput | null, nowMs = Date.now()) {
  const startedMs = job?.createdAt ? new Date(job.createdAt).getTime() : 0
  const elapsedMinutes = startedMs && !Number.isNaN(startedMs)
    ? Math.floor(Math.max(0, (nowMs - startedMs) / 60000))
    : 0
  const storyCase = isStoryTestCaseJob(job)

  if (storyCase) {
    return elapsedMinutes >= 15
      ? 'This is a high-coverage Story Test Cases run. It can take longer because Q-Ops plans coverage, generates batches, retries weak batches, and creates or reuses Jira test cases.'
      : 'Story Test Cases generation may take longer than standard documents because Q-Ops is preparing broad category coverage and Jira-ready test cases.'
  }

  if (elapsedMinutes >= 10) {
    return 'This generation is still running. Larger outputs can take longer while Q-Ops retrieves context, prepares content, and publishes results.'
  }

  return 'The progress is estimated from elapsed time while the backend completes the job.'
}

const STORY_TEST_CASE_PROGRESS_STAGES = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'planning', label: 'Planning coverage' },
  { key: 'generating', label: 'Generating cases' },
  { key: 'publishing', label: 'Publishing to Jira' },
  { key: 'finalizing', label: 'Finalizing' },
] as const

function storyTestCaseProgressGroup(progress?: JobProgress | null) {
  const raw = String(progress?.group || progress?.stage || '').trim().toLowerCase()
  if (raw.includes('final')) return 'finalizing'
  if (raw.includes('publish') || raw.includes('link') || raw.includes('jira')) return 'publishing'
  if (raw.includes('generat') || raw.includes('batch')) return 'generating'
  if (raw.includes('plan') || raw.includes('scope') || raw.includes('cover')) return 'planning'
  return 'preparing'
}

function storyTestCaseProgressIndex(progress?: JobProgress | null, status?: string) {
  if (status === 'completed') return STORY_TEST_CASE_PROGRESS_STAGES.length
  const group = storyTestCaseProgressGroup(progress)
  const index = STORY_TEST_CASE_PROGRESS_STAGES.findIndex((stage) => stage.key === group)
  return index >= 0 ? index : 0
}

function positiveProgressMetric(value: any) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function storyTestCaseProgressCheckpoint(output?: any) {
  return firstObject(
    output?.usageCheckpoint,
    output?.usage_checkpoint,
    output?.progressOutput?.usageCheckpoint,
    output?.progress_output?.usage_checkpoint,
    output?.output?.usageCheckpoint,
    output?.output?.usage_checkpoint,
    output?.output?.progressOutput?.usageCheckpoint,
    output?.output?.progress_output?.usage_checkpoint,
  )
}

function StoryTestCaseProgressModel({ progress, status, output }: { progress?: JobProgress | null; status: string; output?: any }) {
  const activeIndex = storyTestCaseProgressIndex(progress, status)
  const pct = progressPercentFrom(status, undefined, progress)
  const details = progress?.details || {}
  const checkpoint = storyTestCaseProgressCheckpoint(output) || {}
  const checkpointStories = Array.isArray(checkpoint.stories) ? checkpoint.stories : []
  const checkpointStoryCount = positiveProgressMetric(checkpoint.storyCount || checkpointStories.length)
  const checkpointPlanned = positiveProgressMetric(checkpoint.plannedTestCaseCount)
  const checkpointGenerated = positiveProgressMetric(checkpoint.generatedTestCaseCount)
  const createdCount = positiveProgressMetric(details.createdTestCaseCount)
  const updatedCount = positiveProgressMetric(details.updatedTestCaseCount)
  const reusedCount = positiveProgressMetric(details.reusedTestCaseCount)
  const publishedCount = positiveProgressMetric(details.publishedTestCaseCount)
    || createdCount + updatedCount + reusedCount
  const casesGenerated = Math.max(
    positiveProgressMetric(details.generatedTestCaseCount),
    checkpointGenerated,
    positiveProgressMetric(details.itemCount),
  )
  const casesPlanned = Math.max(
    positiveProgressMetric(details.plannedTestCaseCount),
    checkpointPlanned,
    casesGenerated,
  )
  const metrics = [
    { label: 'Stories selected', value: Math.max(positiveProgressMetric(details.selectedStoryCount || details.storyCount), checkpointStoryCount) },
    { label: 'Cases planned', value: casesPlanned },
    { label: 'Cases generated', value: casesGenerated },
    { label: 'Cases published', value: publishedCount },
    { label: 'Cases linked', value: positiveProgressMetric(details.linkedTestCaseCount) },
  ].filter((metric) => metric.value > 0)
  const updatedAt = progress?.updatedAt ? formatTime(progress.updatedAt) : ''

  return (
    <div className="mt-3 rounded-lg border border-primary/20 bg-surface-container-lowest p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Story Test Cases progress</p>
          <p className="mt-1 text-sm font-semibold text-on-surface">{progressStageLabel(progress) || STORY_TEST_CASE_PROGRESS_STAGES[Math.min(activeIndex, STORY_TEST_CASE_PROGRESS_STAGES.length - 1)]?.label || 'Preparing'}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{Math.round(clampPercent(pct))}%</span>
      </div>
      {progress?.summary ? <p className="mt-2 text-xs leading-5 text-on-surface-variant">{progress.summary}</p> : null}
      <div className="mt-3 grid gap-2">
        {STORY_TEST_CASE_PROGRESS_STAGES.map((stage, index) => {
          const isDone = status === 'completed' || index < activeIndex
          const isActive = status !== 'completed' && index === activeIndex
          const isFailed = status === 'failed' && isActive
          const dotClass = isFailed
            ? 'border-error bg-error text-on-error'
            : isDone
              ? 'border-success bg-success text-on-success'
              : isActive
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant bg-surface-container text-on-surface-variant'
          return (
            <div key={stage.key} className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-2 text-xs">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${dotClass}`}>
                {isFailed ? <AlertTriangle className="h-3 w-3" /> : isDone ? <CheckCircle2 className="h-3 w-3" /> : isActive ? <Clock className="h-3 w-3" /> : null}
              </span>
              <span className={`${isActive ? 'font-bold text-on-surface' : isDone ? 'font-semibold text-success' : 'text-on-surface-variant'}`}>{stage.label}</span>
            </div>
          )
        })}
      </div>
      {metrics.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {metrics.map((metric) => (
            <span key={metric.label} className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
              {metric.label}: {formatCompactNumber(metric.value)}
            </span>
          ))}
        </div>
      ) : null}
      {updatedAt ? <p className="mt-2 text-[11px] text-on-surface-variant">Last checkpoint: {updatedAt}</p> : null}
    </div>
  )
}

function StatusPanel({ kind, state, jobs = [] }: { kind: WorkspaceTab; state: { status: JobStatus; jobId: string | null; error: string; output?: any }; jobs?: Array<KnowledgeJobRecord | GeneratedOutput> }) {
  const hasActiveWork = isActiveDocumentStatus(state.status) || jobs.some((job) => isActiveDocumentStatus(job.status))
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (!hasActiveWork) return undefined
    const interval = window.setInterval(() => setNowMs(Date.now()), 15000)
    return () => window.clearInterval(interval)
  }, [hasActiveWork])

  const batchJobs = jobs
  if (batchJobs.length) {
    const activeCount = batchJobs.filter((job) => isActiveDocumentStatus(job.status)).length
    const completedCount = batchJobs.filter((job) => job.status === 'completed').length
    const failedCount = batchJobs.filter((job) => job.status === 'failed').length
    const totalCount = batchJobs.length
    const pct = estimatedBatchProgress(batchJobs, nowMs)
    const jobKindLabel = kind === 'knowledge' ? 'ingestion' : 'generation'
    const activeJob = batchJobs.find((job) => isActiveDocumentStatus(job.status)) || null
    const patienceMessage = activeCount && kind === 'documents'
      ? longRunningGenerationMessage(activeJob, nowMs)
      : null
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
            <p className="text-xs font-semibold text-primary">{activeCount ? `~${pct}%` : `${pct}%`}</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className={`h-full rounded-full ${failedCount ? 'bg-warning' : completedCount === totalCount ? 'bg-success' : 'bg-primary'} ${activeCount ? 'animate-pulse' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          {patienceMessage ? (
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-on-surface-variant">
              <span className="font-semibold text-on-surface">Please keep this tab open while Q-Ops works. </span>
              {patienceMessage}
            </div>
          ) : null}
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {batchJobs.map((job) => {
              const tone: StatusTone = job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'info'
              const jobLabel = job.jobId || job.id
              const fileLabel = kind === 'knowledge'
                ? ('fileName' in job ? job.fileName : '') || ('fileKey' in job ? job.fileKey : '') || 'Knowledge artifact'
                : ''
              const jobTypeLabel = kind === 'knowledge'
                ? `${('processingClass' in job ? job.processingClass : '') || formatArtifactType('fileKey' in job ? job.fileKey : undefined)} ingestion`
                : documentTypeLabel(('documentType' in job ? job.documentType : undefined) || ('artifactLabel' in job ? job.artifactLabel : undefined))
              const jobProgress = jobProgressFrom('output' in job ? job.output : undefined)
              const showStoryTestCaseProgress = kind === 'documents' && isStoryTestCaseJob(job) && isActiveDocumentStatus(job.status)
              const extractionWarnings = 'extractionWarnings' in job ? job.extractionWarnings : []
              const extractionWarningCount = 'extractionWarningCount' in job ? job.extractionWarningCount : 0
              return (
                <div key={job.jobId || job.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-mono text-sm font-bold text-on-surface" title={jobLabel}>{jobLabel}</p>
                    </div>
                    <StatusBadge status={tone} label={job.status.replace('_', ' ')} />
                  </div>
                  <JobCardDetailRows
                    className="mt-3"
                    items={kind === 'knowledge'
                      ? [
                          { label: 'File', value: fileLabel },
                          { label: 'Type', value: jobTypeLabel },
                          { label: 'Project', value: job.projectName },
                          { label: 'Started at', value: formatTime(job.createdAt) },
                          extractionWarningCount ? { label: 'Warnings', value: extractionWarningCount } : { label: 'Warnings', value: undefined },
                        ]
                      : [
                          { label: 'Type', value: jobTypeLabel },
                          { label: 'Project', value: job.projectName || 'Selected project' },
                          { label: 'Started at', value: formatTime(job.createdAt) },
                        ]}
                  />
                  {showStoryTestCaseProgress ? <StoryTestCaseProgressModel progress={jobProgress} status={job.status} output={'output' in job ? job.output : undefined} /> : null}
                  <ExtractionWarningsInline warnings={extractionWarnings} count={extractionWarningCount} />
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

  const stateProgress = jobProgressFrom(state.output)
  const pct = state.status === 'completed' || state.status === 'failed'
    ? 100
    : progressPercentFrom(state.status, undefined, stateProgress)
  const display = getJobDisplay(kind, state)
  const StatusIcon = statusDisplayIcon(display.tone, state.status)
  const patienceMessage = state.status === 'processing' && kind === 'documents'
    ? 'Large or high-coverage generations can take 15 minutes or longer. Q-Ops will continue polling and will show Jira or Confluence results when the backend finishes.'
    : null
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
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
        {patienceMessage ? (
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm leading-6 text-on-surface-variant">
            <span className="font-semibold text-on-surface">Still working. </span>
            {patienceMessage}
          </div>
        ) : null}
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

function JobCardDetailRows({ items, className = '' }: { items: Array<{ label: string; value?: ReactNode; mono?: boolean }>; className?: string }) {
  const visibleItems = items.filter((item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== '')
  if (!visibleItems.length) return null
  return (
    <dl className={`grid gap-1.5 text-xs text-on-surface-variant ${className}`}>
      {visibleItems.map((item) => (
        <div key={item.label} className="grid grid-cols-[5.5rem_auto_minmax(0,1fr)] items-start gap-1.5">
          <dt className="font-bold text-on-surface-variant">{item.label}</dt>
          <dd aria-hidden="true" className="text-on-surface-variant">-</dd>
          <dd className={`min-w-0 break-words text-on-surface ${item.mono ? 'font-mono text-[11px]' : ''}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function JobCardInlineStatus({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'error' ? 'text-error' :
    tone === 'warning' ? 'text-warning' :
    'text-primary'

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-medium ${toneClass}`}>
      {children}
    </span>
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

function CoverageSummaryStrip({ coverage, compact = false }: { coverage?: JobCoverageSummary | null; compact?: boolean }) {
  if (!coverage) return null
  const counts = coverageCounts(coverage)
  const verdict = coverageVerdict(coverage)
  const hasCounts = Boolean(counts.total || counts.covered || counts.partial || counts.missing || counts.recovered || counts.excluded)
  if (!hasCounts && !verdict.needsReview) return null
  const statusLabel = verdict.label
  const tone = verdict.tone
  const metricClass = compact ? 'text-[11px]' : 'text-xs'
  const metrics = [
    counts.total ? { label: 'Ledger', value: counts.total } : null,
    counts.covered ? { label: 'Covered', value: counts.covered } : null,
    counts.partial ? { label: 'Needs review', value: counts.partial } : null,
    counts.missing ? { label: 'Missing', value: counts.missing } : null,
    counts.recovered ? { label: 'Recovered', value: counts.recovered } : null,
  ].filter(Boolean) as Array<{ label: string; value: number }>

  return (
    <div className={`rounded-lg border p-3 ${statusDisplayClasses(tone)}`}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide">{statusLabel}</span>
          {metrics.map((metric) => (
            <span key={metric.label} className={`rounded-full bg-surface-container-lowest/70 px-2 py-0.5 font-bold ${metricClass}`}>
              {metric.label}: {metric.value}
            </span>
          ))}
        </div>
        {!metrics.length ? <p className="text-xs leading-5 opacity-85">{verdict.summary}</p> : null}
      </div>
    </div>
  )
}

function updateSectionLabel(section: any, fallback: string) {
  if (typeof section === 'string') return section
  return String(section?.section || section?.title || section?.name || section?.module || section?.id || fallback)
}

function UpdateSummarySectionList({ title, items, tone = 'info' }: { title: string; items?: any[]; tone?: StatusTone }) {
  const normalized = Array.isArray(items)
    ? items.map((item, index) => updateSectionLabel(item, `Item ${index + 1}`)).filter(Boolean)
    : []
  if (!normalized.length) return null
  const markerClass =
    tone === 'success' ? 'bg-success' :
    tone === 'warning' ? 'bg-warning' :
    tone === 'error' ? 'bg-error' :
    'bg-primary'
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</p>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">{normalized.length}</span>
      </div>
      <div className="max-h-44 space-y-1 overflow-y-auto p-3">
        {normalized.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-on-surface hover:bg-surface-container-low">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`} />
            <span className="min-w-0 break-words leading-5">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function JiraChangeItemsList({ items, emptyText }: { items: Array<{ kind: 'epic' | 'story'; key: string; summary?: string }>; emptyText: string }) {
  if (!items.length) {
    return <p className="rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={`${item.kind}-${item.key}`}
          title={item.summary || item.key}
          className="inline-flex max-w-full items-center rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-mono text-xs font-bold text-on-surface"
        >
          <span className="truncate">{item.key}</span>
        </span>
      ))}
    </div>
  )
}

function JiraChangeBucket({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<{ kind: 'epic' | 'story'; key: string; summary?: string }>
  tone: StatusTone
}) {
  const epics = items.filter((item) => item.kind === 'epic')
  const stories = items.filter((item) => item.kind === 'story')
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'error' ? 'text-error' :
    'text-primary'

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</p>
        <span className={`rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold ${toneClass}`}>{items.length}</span>
      </div>
      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Epics</p>
          <JiraChangeItemsList items={epics} emptyText={`No epics ${title.toLowerCase()}.`} />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">User stories</p>
          <JiraChangeItemsList items={stories} emptyText={`No user stories ${title.toLowerCase()}.`} />
        </div>
      </div>
    </section>
  )
}

function BacklogJiraChangeSummary({ groups }: { groups?: ReturnType<typeof backlogJiraChangeGroups> }) {
  if (!groups) return null
  const hasRelevantChanges = groups.added.length || groups.updated.length || groups.removed.length || groups.reused.length
  if (!hasRelevantChanges) return null

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Jira change details</p>
        <p className="mt-1 text-sm text-on-surface-variant">Exact Jira IDs affected by this Epics & User Stories update.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <JiraChangeBucket title="Added" items={groups.added} tone="success" />
        <JiraChangeBucket title="Updated" items={groups.updated} tone="info" />
        <JiraChangeBucket title="Preserved" items={groups.reused} tone="info" />
        <JiraChangeBucket title="Removed" items={groups.removed} tone="warning" />
      </div>
    </section>
  )
}

function UpdateSummaryStat({ label, value, hint, tone = 'info' }: { label: string; value: string; hint?: string; tone?: StatusTone }) {
  const cls =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'error' ? 'text-error' :
    'text-primary'
  return (
    <div className="min-w-0 rounded-lg bg-surface-container-low px-3 py-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className={`mt-1 break-words text-lg font-bold leading-tight ${cls}`}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">{hint}</p> : null}
    </div>
  )
}

function BacklogChangeImpactSummary({
  groups,
  totals,
  updateModeLabel,
}: {
  groups: ReturnType<typeof backlogJiraChangeGroups>
  totals?: ReturnType<typeof backlogCurrentTotals>
  updateModeLabel: string
}) {
  const epicAdded = groups.added.filter((item) => item.kind === 'epic').length
  const storyAdded = groups.added.filter((item) => item.kind === 'story').length
  const epicPreserved = groups.reused.filter((item) => item.kind === 'epic').length
  const storyPreserved = groups.reused.filter((item) => item.kind === 'story').length
  const epicRemoved = groups.removed.filter((item) => item.kind === 'epic').length
  const storyRemoved = groups.removed.filter((item) => item.kind === 'story').length

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Change impact</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{updateModeLabel}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <UpdateSummaryStat label="Epics added" value={formatCompactNumber(epicAdded)} tone="success" />
        <UpdateSummaryStat label="Stories added" value={formatCompactNumber(storyAdded)} tone="success" />
        <UpdateSummaryStat label="Epics preserved" value={formatCompactNumber(epicPreserved)} tone="info" />
        <UpdateSummaryStat label="Stories preserved" value={formatCompactNumber(storyPreserved)} tone="info" />
        <UpdateSummaryStat label="Epics removed" value={formatCompactNumber(epicRemoved)} tone={epicRemoved ? 'warning' : 'info'} />
        <UpdateSummaryStat label="Stories removed" value={formatCompactNumber(storyRemoved)} tone={storyRemoved ? 'warning' : 'info'} />
      </div>
      {totals ? (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/8 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Current backlog</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">After successful updates</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <UpdateSummaryStat label="Total epics" value={formatCompactNumber(totals.epics)} tone="info" />
            <UpdateSummaryStat label="Total stories" value={formatCompactNumber(totals.stories)} tone="info" />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function STCTestCaseItemsList({
  items,
  emptyText,
}: {
  items: Array<{ key: string; summary?: string; storyKey?: string; storySummary?: string }>
  emptyText: string
}) {
  if (!items.length) {
    return <p className="rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">{emptyText}</p>
  }
  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
      {items.map((item) => {
        const tooltip = [
          item.summary || item.key,
          item.storyKey ? `Story: ${item.storyKey}${item.storySummary ? ` - ${item.storySummary}` : ''}` : '',
        ].filter(Boolean).join('\n')
        return (
          <span
            key={`${item.key}-${item.storyKey || 'story'}`}
            title={tooltip}
            className="inline-flex max-w-full items-center rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-mono text-xs font-bold text-on-surface"
          >
            <span className="truncate">{item.key}</span>
          </span>
        )
      })}
    </div>
  )
}

function STCTestCaseChangeBucket({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<{ key: string; summary?: string; storyKey?: string; storySummary?: string }>
  tone: StatusTone
}) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'error' ? 'text-error' :
    'text-primary'

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</p>
        <span className={`rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold ${toneClass}`}>{items.length}</span>
      </div>
      <STCTestCaseItemsList items={items} emptyText={`No test cases ${title.toLowerCase()}.`} />
    </section>
  )
}

function STCChangeImpactSummary({
  groups,
  coverage,
  updateModeLabel,
  preservedCount,
}: {
  groups: ReturnType<typeof stcTestCaseChangeGroups>
  coverage?: ReturnType<typeof stcCoverageImpact>
  updateModeLabel: string
  preservedCount?: number
}) {
  const preservedValue = Math.max(groups.reused.length, Number(preservedCount || 0) || 0)
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Change impact</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{updateModeLabel}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <UpdateSummaryStat label="Test cases added" value={formatCompactNumber(groups.added.length)} tone="success" />
        <UpdateSummaryStat label="Test cases updated" value={formatCompactNumber(groups.updated.length)} tone="info" />
        <UpdateSummaryStat label="Test cases preserved" value={formatCompactNumber(preservedValue)} tone="info" />
        <UpdateSummaryStat label="Test cases removed" value={formatCompactNumber(groups.removed.length)} tone={groups.removed.length ? 'warning' : 'info'} />
      </div>
      {coverage ? (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/8 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Story coverage</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">After update</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <UpdateSummaryStat label="Story scope" value={formatCompactNumber(coverage.total)} tone="info" />
            <UpdateSummaryStat label="Stories covered" value={formatCompactNumber(coverage.covered)} tone="success" />
            <UpdateSummaryStat label="Needs review" value={formatCompactNumber(coverage.partial)} tone={coverage.partial ? 'warning' : 'info'} />
            <UpdateSummaryStat label="Missing" value={formatCompactNumber(coverage.missing)} tone={coverage.missing ? 'error' : 'info'} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function STCStoryCoverageDetails({ coverage }: { coverage?: ReturnType<typeof stcCoverageImpact> }) {
  if (!coverage?.rows.length) return null
  const visibleRows = [...coverage.rows].sort((left, right) => {
    const rank = (row: typeof left) => {
      if (row.status.includes('missing') || row.status.includes('fail')) return 0
      if (row.status.includes('partial') || row.status.includes('review')) return 1
      return 2
    }
    return rank(left) - rank(right)
  })

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Story coverage details</p>
          <p className="mt-1 text-xs text-on-surface-variant">Generated versus planned test case coverage for all impacted stories. Missing and review rows appear first.</p>
        </div>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">{visibleRows.length}</span>
      </div>
      <div className="max-h-72 divide-y divide-outline-variant overflow-y-auto">
        {visibleRows.map((row, index) => {
          const isMissing = row.status.includes('missing') || row.status.includes('fail')
          const isPartial = row.status.includes('partial') || row.status.includes('review')
          const toneClass = isMissing
            ? 'bg-error/10 text-error'
            : isPartial
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success'
          return (
            <div key={`${row.storyKey || row.title}-${index}`} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_96px_96px]">
              <div className="min-w-0">
                <p className="break-words font-semibold leading-5 text-on-surface">
                  {row.storyKey ? `${row.storyKey} - ` : ''}{row.title}
                </p>
                {row.missingCategories.length ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Missing categories</span>
                    {row.missingCategories.map((category) => (
                      <span key={category} className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}
                {!row.missingCategories.length && row.coveredCategories.length ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Covered categories</span>
                    {row.coveredCategories.map((category) => (
                      <span key={category} className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold capitalize ${toneClass}`}>
                  {row.status || 'covered'}
                </span>
              </div>
              <div className="text-left md:text-right">
                <p className="font-bold text-on-surface">{row.generated}{row.planned ? ` / ${row.planned}` : ''}</p>
                <p className="text-[11px] text-on-surface-variant">generated{row.planned ? ' / planned' : ''}</p>
                {row.testCaseKeys.length ? (
                  <p className="mt-1 truncate font-mono text-[11px] text-on-surface-variant" title={row.testCaseKeys.join(', ')}>
                    {row.testCaseKeys.slice(0, 3).join(', ')}{row.testCaseKeys.length > 3 ? ` +${row.testCaseKeys.length - 3}` : ''}
                  </p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function STCTestCaseChangeSummary({ groups }: { groups?: ReturnType<typeof stcTestCaseChangeGroups> }) {
  if (!groups) return null
  const hasRelevantChanges = groups.added.length || groups.updated.length || groups.removed.length || groups.reused.length
  if (!hasRelevantChanges) return null

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Story test case details</p>
        <p className="mt-1 text-sm text-on-surface-variant">Exact Jira Test Case IDs affected by this Story Test Cases update. Hover an ID to see the summary and parent story.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <STCTestCaseChangeBucket title="Added" items={groups.added} tone="success" />
        <STCTestCaseChangeBucket title="Updated" items={groups.updated} tone="info" />
        <STCTestCaseChangeBucket title="Preserved" items={groups.reused} tone="info" />
        <STCTestCaseChangeBucket title="Removed" items={groups.removed} tone="warning" />
      </div>
    </section>
  )
}

function RTMChangeImpactSummary({
  groups,
  coverage,
  updateModeLabel,
}: {
  groups: ReturnType<typeof rtmTraceabilityChangeGroups>
  coverage?: ReturnType<typeof rtmCoverageImpact>
  updateModeLabel: string
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Change impact</p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{updateModeLabel}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <UpdateSummaryStat label="Rows added" value={formatCompactNumber(groups.added.length)} tone="success" />
        <UpdateSummaryStat label="Rows updated" value={formatCompactNumber(groups.updated.length)} tone="info" />
        <UpdateSummaryStat label="Rows preserved" value={formatCompactNumber(groups.preserved.length)} tone="info" />
        <UpdateSummaryStat label="Rows removed" value={formatCompactNumber(groups.removed.length)} tone={groups.removed.length ? 'warning' : 'info'} />
      </div>
      {coverage ? (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/8 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Traceability coverage</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">After update</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <UpdateSummaryStat label="Current rows" value={formatCompactNumber(coverage.currentRows || coverage.total)} tone="info" />
            <UpdateSummaryStat label="Covered" value={formatCompactNumber(coverage.covered)} tone="success" />
            <UpdateSummaryStat label="Needs review" value={formatCompactNumber(coverage.partial)} tone={coverage.partial ? 'warning' : 'info'} />
            <UpdateSummaryStat label="Missing" value={formatCompactNumber(coverage.missing)} tone={coverage.missing ? 'error' : 'info'} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function RTMTraceabilityItemsList({
  items,
  emptyText,
}: {
  items: Array<{ key: string; displayKey?: string; jiraKeys?: string[]; summary?: string; status?: string; notes?: string }>
  emptyText: string
}) {
  if (!items.length) {
    return <p className="rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">{emptyText}</p>
  }
  return (
    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
      {items.map((item) => {
        const tooltip = [
          `Coverage row: ${item.key}`,
          item.jiraKeys?.length ? `Jira: ${item.jiraKeys.join(', ')}` : 'Jira: No mapping found',
          item.summary || item.key,
          item.status ? `Status: ${item.status}` : '',
          item.notes,
        ].filter(Boolean).join('\n')
        return (
          <span
            key={item.key}
            title={tooltip}
            className="inline-flex max-w-full items-center rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-mono text-xs font-bold text-on-surface"
          >
            <span className="truncate">{item.displayKey || item.key}</span>
          </span>
        )
      })}
    </div>
  )
}

function RTMTraceabilityChangeBucket({
  title,
  items,
  tone,
}: {
  title: string
  items: Array<{ key: string; displayKey?: string; jiraKeys?: string[]; summary?: string; status?: string; notes?: string }>
  tone: StatusTone
}) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'error' ? 'text-error' :
    'text-primary'

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</p>
        <span className={`rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold ${toneClass}`}>{items.length}</span>
      </div>
      <RTMTraceabilityItemsList items={items} emptyText={`No RTM rows ${title.toLowerCase()}.`} />
    </section>
  )
}

function RTMTraceabilityChangeSummary({ groups }: { groups?: ReturnType<typeof rtmTraceabilityChangeGroups> }) {
  if (!groups) return null
  const hasRelevantChanges = groups.added.length || groups.updated.length || groups.removed.length || groups.preserved.length
  if (!hasRelevantChanges) return null

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">RTM Jira details</p>
        <p className="mt-1 text-sm text-on-surface-variant">Jira IDs affected by this RTM update. Hover an ID to see the internal coverage row, requirement, status, and notes.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RTMTraceabilityChangeBucket title="Added" items={groups.added} tone="success" />
        <RTMTraceabilityChangeBucket title="Updated" items={groups.updated} tone="info" />
        <RTMTraceabilityChangeBucket title="Preserved" items={groups.preserved} tone="info" />
        <RTMTraceabilityChangeBucket title="Removed" items={groups.removed} tone="warning" />
      </div>
    </section>
  )
}

function UpdateSummaryDetailRow({ label, value, tag }: { label: string; value: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
        {tag ? <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{tag}</p> : null}
      </div>
      <p className="shrink-0 font-mono text-sm font-bold text-on-surface">{value}</p>
    </div>
  )
}

function UpdateSummaryStatusIcon({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  const fileClass = size === 'md' ? 'h-5 w-5' : size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const checkClass = size === 'md' ? 'h-3.5 w-3.5' : size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <span className="relative inline-flex items-center justify-center">
      <FileText className={fileClass} />
      <CheckCircle2 className={`absolute -bottom-1 -right-1 rounded-full bg-surface-container-low p-[1px] ${checkClass}`} />
    </span>
  )
}

function updateSummaryButtonClasses(tone: StatusTone) {
  if (tone === 'success') return 'border-success bg-success/10 text-success hover:bg-success/20'
  if (tone === 'warning') return 'border-warning bg-warning/10 text-warning hover:bg-warning/20'
  if (tone === 'error') return 'border-error bg-error/10 text-error hover:bg-error/20'
  return 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
}

function UpdateSummaryButton({ output, jobRecord, relatedOutputs = [], compact = false }: { output?: any; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[]; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const summary = outputUpdateSummary(output, jobRecord)
  if (!summary) return null
  const buttonSize = compact ? compactDocumentIconButtonClasses : 'h-9 w-9'
  const documentType = documentTypeLabel(jobRecord?.documentType || output?.documentType || jobRecord?.artifactLabel || output?.artifactLabel)
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || '-'
  const jobId = jobRecord?.jobId || jobRecord?.id || output?.jobId || output?.id || '-'
  const savingsPercent = Number(summary.estimatedSavingsPercent)
  const savingsLabel = summary.estimatedTokensSaved
    ? `${formatCompactNumber(summary.estimatedTokensSaved)}${Number.isFinite(savingsPercent) ? ` (${Math.max(0, Math.round(savingsPercent))}%)` : ''}`
    : summary.savingsUnavailableLabel || `0${Number.isFinite(savingsPercent) ? ` (${Math.max(0, Math.round(savingsPercent))}%)` : ''}`
  const costSavingsLabel = summary.savingsUnavailableLabel
    ? summary.savingsUnavailableLabel
    : formatCurrency(summary.estimatedCostSavedUsd || 0, 4)
  const operationMode = 'operationMode' in summary ? summary.operationMode : ''
  const updateModeLabel = operationMode === 'update_repair' ? 'Repair update' : 'Delta update'
  const impactPrimaryLabel = summary.impactPrimaryLabel || 'Updated'
  const impactPreservedLabel = summary.impactPreservedLabel || 'Preserved'
  const jiraChangeGroups = 'jiraChangeGroups' in summary ? summary.jiraChangeGroups : undefined
  const stcChangeGroups = 'stcChangeGroups' in summary ? summary.stcChangeGroups : undefined
  const stcCoverage = 'stcCoverage' in summary ? summary.stcCoverage : undefined
  const rtmChangeGroups = 'rtmChangeGroups' in summary ? summary.rtmChangeGroups : undefined
  const rtmCoverage = 'rtmCoverage' in summary ? summary.rtmCoverage : undefined
  const currentBacklogTotals = jiraChangeGroups ? backlogCurrentTotals(output, jobRecord, relatedOutputs) : null
  const wideSummaryModal = Boolean(stcChangeGroups || rtmChangeGroups)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Update summary"
        aria-label="Update summary"
        className={`inline-flex ${buttonSize} items-center justify-center rounded-full border shadow-sm ${updateSummaryButtonClasses(summary.tone)} ${iconButtonPressClasses}`}
      >
        <UpdateSummaryStatusIcon size={compact ? 'xs' : 'sm'} />
      </button>
      {open ? (
        <ModalFrame title="Update Summary" onClose={() => setOpen(false)} maxWidth={wideSummaryModal ? 'max-w-4xl' : 'max-w-3xl'}>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 border-b border-outline-variant pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{documentType}</p>
                <h3 className="mt-1 text-xl font-semibold leading-tight text-on-surface">{projectName}</h3>
                <p className="mt-1 break-all font-mono text-xs text-on-surface-variant">{jobId}</p>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${summary.tone === 'success' ? 'border-success/30 bg-success/10 text-success' : statusDisplayClasses(summary.tone)}`}>
                <UpdateSummaryStatusIcon size="xs" />
                {summary.title}
              </span>
            </div>

            <div className={`rounded-xl border p-4 ${statusDisplayClasses(summary.tone)}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/80">
                  <UpdateSummaryStatusIcon size="sm" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface">Selective document update completed</p>
                  <p className="mt-1 text-sm leading-6">{summary.message}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              {jiraChangeGroups ? (
                <BacklogChangeImpactSummary groups={jiraChangeGroups} totals={currentBacklogTotals} updateModeLabel={updateModeLabel} />
              ) : stcChangeGroups ? (
                <STCChangeImpactSummary groups={stcChangeGroups} coverage={stcCoverage} updateModeLabel={updateModeLabel} preservedCount={summary.preservedCount} />
              ) : rtmChangeGroups ? (
                <RTMChangeImpactSummary groups={rtmChangeGroups} coverage={rtmCoverage} updateModeLabel={updateModeLabel} />
              ) : (
                <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Change impact</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{updateModeLabel}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <UpdateSummaryStat label={impactPrimaryLabel} value={formatCompactNumber(Number(summary.updatedCount || 0) + Number(summary.addedCount || 0))} tone="success" />
                    <UpdateSummaryStat label={impactPreservedLabel} value={formatCompactNumber(summary.preservedCount || 0)} tone="info" />
                    <UpdateSummaryStat label="Removed" value={formatCompactNumber(summary.removedCount || 0)} tone={summary.removedCount ? 'warning' : 'info'} />
                  </div>
                </section>
              )}

              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Usage and estimated savings</p>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Estimated</span>
                </div>
                <div className="space-y-2">
                  <UpdateSummaryDetailRow label="Tokens used" value={formatCompactNumber(summary.tokensUsed || 0)} tag={updateModeLabel} />
                  <UpdateSummaryDetailRow label="Update cost" value={formatCurrency(summary.costUsed || 0, 4)} />
                  <UpdateSummaryDetailRow label={summary.savingsUnavailableLabel ? 'Savings estimate' : 'Tokens saved'} value={savingsLabel} />
                  <UpdateSummaryDetailRow label={summary.savingsUnavailableLabel ? 'Cost savings estimate' : 'Cost saved'} value={costSavingsLabel} />
                </div>
              </section>
            </div>

            <BacklogJiraChangeSummary groups={jiraChangeGroups} />
            <STCStoryCoverageDetails coverage={stcCoverage} />
            <STCTestCaseChangeSummary groups={stcChangeGroups} />
            <RTMTraceabilityChangeSummary groups={rtmChangeGroups} />

            {summary.updateReasons?.length ? (
              <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HelpCircle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Why this update ran</p>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">{summary.updateReasons.join(' ')}</p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-2">
              <UpdateSummarySectionList title="Updated or added" items={[...(summary.updatedSections || []), ...(summary.addedSections || [])]} tone="success" />
              <UpdateSummarySectionList title="Preserved" items={summary.preservedSections} tone="info" />
            </div>
            <UpdateSummarySectionList title="Removed" items={summary.removedSections} tone="warning" />

          </div>
        </ModalFrame>
      ) : null}
    </>
  )
}

function FinalValidationButton({ output, compact = false }: { output?: any; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const verdict = finalValidationVerdict(output)
  if (!verdict) return null
  const buttonSize = compact ? compactDocumentIconButtonClasses : 'h-9 w-9'
  const iconSize = compact ? compactDocumentIconClasses : 'h-4 w-4'
  const iconClasses = verdict.tone === 'error'
    ? 'border-error bg-error/10 text-error hover:bg-error/20'
    : verdict.tone === 'warning'
      ? 'border-warning bg-warning/10 text-warning hover:bg-warning/20'
      : 'border-success bg-success/10 text-success hover:bg-success/20'
  const issues = Array.isArray((verdict as any).displayIssues)
    ? (verdict as any).displayIssues
    : Array.isArray(verdict.validation?.issues)
      ? verdict.validation.issues
      : []
  const diagnostics = firstObject(output?.diagnostics, output?.metadata?.diagnostics, output?.output?.diagnostics)
  const resultLabel = verdict.tone === 'error'
    ? 'Support review needed'
    : verdict.tone === 'warning'
      ? 'Review advised'
      : 'Passed'
  const structureLabel = verdict.tone === 'error'
    ? 'Not publish-safe'
    : verdict.tone === 'warning'
      ? 'Published with notes'
      : 'Publish-safe'
  const operationLabel = String(verdict.validation?.operationMode || generationModeFrom(output) || output?.operationMode || 'generation')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={verdict.label}
        aria-label={`${verdict.label}. Click for document check details.`}
        className={`inline-flex ${buttonSize} items-center justify-center rounded-full border shadow-sm ${iconClasses} ${iconButtonPressClasses}`}
      >
        <ShieldCheck className={iconSize} />
      </button>
      {open ? (
        <ModalFrame title="Document Check" onClose={() => setOpen(false)} maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${statusDisplayClasses(verdict.tone)}`}>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/80">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest">{verdict.label}</p>
                  <h3 className="mt-1 text-xl font-semibold leading-7">{verdict.title}</h3>
                  <p className="mt-2 text-sm leading-6 opacity-85">{verdict.summary}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <UpdateSummaryDetailRow label="Result" value={resultLabel} />
              <UpdateSummaryDetailRow label="Document state" value={structureLabel} />
              <UpdateSummaryDetailRow label="Operation" value={operationLabel} />
              <UpdateSummaryDetailRow label="Support details" value={verdict.needsReview ? (diagnostics ? 'Saved for admin' : 'Review needed') : 'Not required'} />
            </div>
            {issues.length ? (
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
                <div className="border-b border-outline-variant px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">What support should review</p>
                </div>
                <div className="max-h-52 space-y-2 overflow-y-auto p-3">
                  {issues.map((issue: any, index: number) => (
                    <div key={`${issue?.code || 'issue'}-${index}`} className="rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface">
                      <p className="font-semibold">{validationIssueTitle(issue, index)}</p>
                      <p className="mt-1 leading-5 text-on-surface-variant">{validationIssueMessage(issue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {diagnostics ? (
              <p className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs leading-5 text-on-surface-variant">
                Technical diagnostics are stored with this job, so support can investigate without asking the user to rerun immediately.
              </p>
            ) : null}
          </div>
        </ModalFrame>
      ) : null}
    </>
  )
}

function CoverageMetricTile({ label, value, tone }: { label: string; value: number; tone: StatusTone }) {
  const valueClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'error' ? 'text-error' :
    'text-primary'
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-2xl font-bold leading-tight ${valueClass}`}>{formatCompactNumber(value || 0)}</p>
    </div>
  )
}

function JobProgressSummary({ output, jobRecord = null, relatedOutputs = [], compact = false, iconOnly = false }: { output?: any; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[]; compact?: boolean; iconOnly?: boolean }) {
  const [showCoverageDetails, setShowCoverageDetails] = useState(false)
  const progress = jobProgressFrom(output)
  const coverage = coverageSummaryFrom(output)
  const batchSummary = batchSummaryFrom(output)
  const batches = Array.isArray(batchSummary.batches) ? batchSummary.batches : []
  const coverageLedger = coverageLedgerFrom(output)
  const rtmLayers = buildRtmTraceabilityLayers(output, jobRecord, relatedOutputs)
  const documentType = normalizedDocumentType(output?.documentType || output?.document_type || jobRecord?.documentType)
  const isMappedDocumentCoverage = isCoverageMapDocumentType(documentType)
  const isStoryTestCasesCoverage = isStoryTestCasesDocumentType(documentType)
  const sharedCoverageLabels = sharedCoveragePresentationLabels(documentType)
  const hasProgress = Boolean(progress?.stage || progress?.stageLabel || progress?.summary || Number(progress?.progressPercent))
  const hasBatches = batches.length > 0 || Number(batchSummary.totalBatches || batchSummary.total || 0) > 0
  const hasCoverageLedger = coverageLedger.length > 0
  if (!hasProgress && !coverage && !hasBatches && !hasCoverageLedger) return null
  const pct = Number(progress?.progressPercent)
  const stageLabel = progressStageLabel(progress)
  const visibleBatches = batches.slice(0, compact ? 3 : 6)
  const hiddenBatches = batches.slice(visibleBatches.length)
  const hiddenBatchLabels = hiddenBatches
    .map((batch: Record<string, any>, index: number) => String(batch.module || batch.name || batch.batchId || batch.id || `Batch ${visibleBatches.length + index + 1}`).trim())
    .filter(Boolean)
    .join(', ')
  const batchTotal = Number(batchSummary.totalBatches || batchSummary.total || batches.length || coverageLedger.length || 0)
  const completedBatches = Number(batchSummary.completedBatches || batchSummary.complete || batchSummary.covered || 0)
  const partialBatches = Number(batchSummary.partialBatches || batchSummary.partial || batches.filter((batch: Record<string, any>) => String(batch.status || batch.coverageStatus || '').toLowerCase().includes('partial')).length || 0)
  const missingBatches = Number(batchSummary.missingBatches || batchSummary.missing || batches.filter((batch: Record<string, any>) => {
    const status = String(batch.status || batch.coverageStatus || '').toLowerCase()
    return status.includes('missing') || status.includes('unknown') || status.includes('fail')
  }).length || 0)
  const retryingBatches = batches.filter((batch: Record<string, any>) => {
    const status = String(batch.status || batch.coverageStatus || '').toLowerCase()
    return Boolean(batch.retried) && !batch.recovered && (status.includes('missing') || status.includes('partial') || status.includes('unknown'))
  }).length || 0
  const recoveredBatches = Number(batchSummary.recoveredBatches || batches.filter((batch: Record<string, any>) => batch.recovered).length || 0)
  const coverageCountsValue = coverageCounts(coverage)
  const coverageVerdictValue = coverageVerdict(coverage)
  const isUpdateOutput = generationModeFrom(output) === 'update'
  const suppressUnparsedUpdateCoverage = Boolean(
    isUpdateOutput
    && coverage
    && !coverageCountsValue.total
    && !coverageCountsValue.covered
    && !coverageCountsValue.partial
    && !coverageCountsValue.missing
    && !coverageCountsValue.recovered
    && !coverageCountsValue.excluded
  )
  if (suppressUnparsedUpdateCoverage && !hasProgress && !hasBatches) return null
  const reviewCount = partialBatches || coverageCountsValue.partial
  const missingCount = missingBatches || coverageCountsValue.missing
  const batchLabel = (batch: Record<string, any>, index: number) => String(batch.module || batch.name || batch.batchId || batch.id || `Batch ${index + 1}`).trim()
  const reviewBatchLabels = batches
    .filter((batch: Record<string, any>) => String(batch.status || batch.coverageStatus || '').toLowerCase().includes('partial'))
    .map(batchLabel)
    .filter(Boolean)
  const reviewTargetText = reviewBatchLabels.length
    ? reviewBatchLabels.join(', ')
    : 'the highlighted coverage area'
  const reviewAreaLabel = `${reviewCount} coverage area${reviewCount === 1 ? '' : 's'}`
  const missingAreaLabel = `${missingCount} coverage area${missingCount === 1 ? '' : 's'}`
  const reviewActionText = reviewCount
    ? isStoryTestCasesCoverage
      ? `${reviewAreaLabel} ${reviewCount === 1 ? 'needs' : 'need'} review because one or more planned coverage categories are not represented in the generated Jira test cases. Test-case counts can be complete while category coverage still needs review.`
      : `${reviewAreaLabel} ${reviewCount === 1 ? 'needs' : 'need'} review. Check the generated/planned counts and missing categories below, then decide whether each gap needs more coverage or can be marked out of scope.`
    : ''
  const coverageDetailRows = (() => {
    const backlogJiraKeyLookup = buildBacklogJiraKeyLookup(output)
    const dynamicCoverage = coverage as Record<string, any> | null
    const fromCoverage = [
      ...(Array.isArray(dynamicCoverage?.missingItems) ? dynamicCoverage!.missingItems : []),
      ...(Array.isArray(dynamicCoverage?.partialItems) ? dynamicCoverage!.partialItems : []),
      ...(Array.isArray(dynamicCoverage?.coveredItems) ? dynamicCoverage!.coveredItems : []),
    ]
    const sourceRows = fromCoverage.length ? fromCoverage : (coverageLedger.length ? coverageLedger : batches)
    const seen = new Set<string>()
    return sourceRows
      .map((row: Record<string, any>, index: number) => {
        const key = String(row.storyKey || row.module || row.batchId || row.coverageId || row.id || '').trim()
        const title = String(row.storySummary || row.moduleRequirement || row.requirement || row.module || row.name || key || `Coverage row ${index + 1}`).trim()
        const status = String(row.coverageStatus || row.status || '').trim().toLowerCase() || 'covered'
        const generated = Number(row.generatedTestCases ?? row.mappingCount ?? row.linkedTestCases ?? 0) || 0
        const planned = Number(row.plannedTestCases ?? row.expectedTestCases ?? 0) || 0
        const missingCategories = normalizeCategoryLabels(row.missingCategories)
        const coveredCategories = normalizeCategoryLabels(row.categoriesCovered || row.coveredCategories)
        const plannedCategories = normalizeCategoryLabels(row.plannedCategories || row.expectedCategories || (coveredCategories.length ? coveredCategories : row.categoriesCovered))
        const categoryCount = coveredCategories.length || plannedCategories.length
        const caseComplete = Boolean(planned && generated >= planned)
        const categoryComplete = !missingCategories.length
        const dedupeKey = `${key || title}-${status}`
        if (seen.has(dedupeKey)) return null
        seen.add(dedupeKey)
        return {
          key,
          title,
          status,
          generated,
          planned,
          missingCategories,
          coveredCategories,
          plannedCategories,
          categoryCount,
          caseComplete,
          categoryComplete,
          coveredSections: documentType === 'user_stories'
            ? resolveBacklogCoverageTargets(row, backlogJiraKeyLookup)
            : coverageDocumentTargets(row, documentType),
          notes: String(row.notes || '').trim(),
          sourceReference: readableCoverageSourceReference(row.sourceReference || row.source),
          evidenceSummary: coverageEvidenceSummary(row.sourceReference || row.source),
          sourceReferenceRaw: String(row.sourceReference || row.source || '').trim(),
          includedInOutput: String(row.includedInOutput || row.included || '').trim(),
          link: String(row.storyLink || row.url || '').trim(),
        }
      })
      .filter(Boolean)
  })()
  const hasRtmTraceabilityLayers = Boolean(rtmLayers.requirementRows.length || rtmLayers.storyRows.length)
  const showCoverageDetailBlock = !hasRtmTraceabilityLayers && (hasBatches || coverageDetailRows.length)
  const showCoverageTestsColumn = coverageDetailRows.some((row: any) => Number(row.generated) || Number(row.planned))
  const coverageDetailGridClass = showCoverageTestsColumn
    ? 'grid grid-cols-[minmax(0,1fr)_76px_96px] gap-3 sm:grid-cols-[minmax(0,1fr)_88px_112px]'
    : 'grid grid-cols-[minmax(0,1fr)_88px] gap-3 sm:grid-cols-[minmax(0,1fr)_112px]'
  const coverageDetailHeaderLabel = showCoverageTestsColumn ? 'Story / coverage row' : 'Coverage row'

  if (compact || iconOnly) {
    const effectiveCoverage = suppressUnparsedUpdateCoverage ? null : coverage
    const effectiveCoverageVerdict = effectiveCoverage ? coverageVerdictValue : null
    const effectiveMissingCount = effectiveCoverage ? coverageCountsValue.missing : missingCount
    const effectiveReviewCount = effectiveCoverage ? coverageCountsValue.partial : reviewCount
    const coverageScoreValue = coverageScorePercent(effectiveCoverage)
    const scoreLabel = Number.isFinite(coverageScoreValue) ? `${Math.round(coverageScoreValue!)}% coverage score` : ''
    const summaryLabel = effectiveCoverage
      ? effectiveCoverageVerdict!.title
      : effectiveMissingCount
        ? `${missingAreaLabel} missing`
        : effectiveReviewCount
          ? `${reviewAreaLabel} ${reviewCount === 1 ? 'needs' : 'need'} review`
          : recoveredBatches
            ? `${recoveredBatches} coverage area${recoveredBatches === 1 ? '' : 's'} recovered`
            : stageLabel || 'Generation progress recorded'
    const summaryTone: StatusTone = effectiveCoverage ? effectiveCoverageVerdict!.tone : effectiveMissingCount ? 'error' : effectiveReviewCount ? 'warning' : 'success'
    if (effectiveCoverage || hasBatches || hasCoverageLedger) {
      const CoverageIcon = summaryTone === 'success' || isStoryTestCasesCoverage ? ListChecks : AlertTriangle
      const iconClasses = summaryTone === 'error'
        ? 'border-error bg-error/10 text-error hover:bg-error/20'
        : summaryTone === 'warning'
          ? 'border-warning bg-warning/10 text-warning hover:bg-warning/20'
          : 'border-success bg-success/10 text-success hover:bg-success/20'
      const tooltip = effectiveCoverage
        ? effectiveCoverageVerdict!.label
        : effectiveMissingCount
          ? 'Coverage incomplete'
          : effectiveReviewCount
            ? 'Coverage needs review'
            : 'Coverage passed'

      return (
        <>
          <div className={iconOnly ? "flex items-center" : "mt-3 flex items-center gap-2"}>
            <button
              type="button"
              onClick={() => setShowCoverageDetails(true)}
              title={tooltip}
              aria-label={`${tooltip}. Click for details.`}
              className={`inline-flex ${compactDocumentIconButtonClasses} items-center justify-center rounded-full border shadow-sm ${iconClasses} ${iconButtonPressClasses}`}
            >
              <CoverageIcon className={compactDocumentIconClasses} />
            </button>
          </div>
          {showCoverageDetails ? (
            <ModalFrame title="Coverage Review" onClose={() => setShowCoverageDetails(false)} maxWidth="max-w-2xl">
              <div className="space-y-5">
                <div className={`rounded-xl border p-4 text-left ${statusDisplayClasses(summaryTone)}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/80">
                        <CoverageIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest">{effectiveCoverageVerdict?.label || stageLabel || 'Coverage review'}</p>
                        <h3 className="mt-1 text-xl font-semibold leading-7">{summaryLabel}</h3>
                        <p className="mt-2 text-sm leading-6 opacity-85">
                          {reviewActionText || effectiveCoverageVerdict?.summary}
                        </p>
                        {coverageDetailRows.length && (effectiveReviewCount || effectiveMissingCount) ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-surface-container-lowest/70 px-2 py-0.5 text-xs font-semibold">
                              {coverageDetailRows.length} reviewed rows
                            </span>
                            {coverageDetailRows.some((row: any) => row.planned) ? (
                              <span className="rounded-full bg-surface-container-lowest/70 px-2 py-0.5 text-xs font-semibold">
                                Generated vs planned shown below
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      {scoreLabel ? (
                        <span className="rounded-full bg-surface-container-lowest/70 px-2 py-0.5 text-xs font-bold" title="This is the coverage review score, not job progress.">
                          {scoreLabel}
                        </span>
                      ) : null}
                      {coverageCountsValue.total ? (
                        <span className="rounded-full bg-surface-container-lowest/70 px-2 py-0.5 text-xs font-bold">
                          Ledger: {coverageCountsValue.total}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <CoverageMetricTile label="Covered" value={coverageCountsValue.covered + coverageCountsValue.recovered} tone="success" />
                  <CoverageMetricTile label="Needs review" value={coverageCountsValue.partial || reviewCount} tone="warning" />
                  <CoverageMetricTile label="Missing" value={coverageCountsValue.missing || missingCount} tone="error" />
                  <CoverageMetricTile label="Ledger rows" value={coverageCountsValue.total} tone={coverageCountsValue.total ? 'info' : 'warning'} />
                </div>
                {!coverageCountsValue.total && coverage ? (
                  <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm leading-6 text-warning">
                    Coverage metadata did not include parsed ledger rows. Review the generated document before sign-off, and regenerate after the merge/parser fix if needed.
                  </div>
                ) : null}
                {rtmLayers.requirementRows.length || rtmLayers.storyRows.length ? (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-on-surface">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">RTM traceability layers</span>
                      {rtmLayers.requirementRows.length ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {rtmLayers.requirementRows.length} requirements
                        </span>
                      ) : null}
                      {rtmLayers.epicCount ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {rtmLayers.epicCount} epics
                        </span>
                      ) : null}
                      {rtmLayers.storyCount ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                          {rtmLayers.storyCount} stories
                        </span>
                      ) : null}
                    </div>
                    {rtmLayers.requirementRows.length ? (
                      <div className="mt-3 rounded-lg border border-outline-variant">
                        <div className="grid grid-cols-[minmax(0,1fr)_92px_88px] gap-3 border-b border-outline-variant bg-surface-container-low px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                          <span>Layer 1: Requirement to epic / stories</span>
                          <span>Epic</span>
                          <span className="text-right">Stories</span>
                        </div>
                        <div className="max-h-56 divide-y divide-outline-variant overflow-y-auto">
                          {rtmLayers.requirementRows.map((row: any, index: number) => (
                            <div key={`${row.id}-${index}`} className="grid grid-cols-[minmax(0,1fr)_92px_88px] gap-3 px-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                              <div className="min-w-0">
                                <p className="break-words font-semibold leading-5 text-on-surface">{row.id} - {row.title}</p>
                                {row.notes ? <p className="mt-1 break-words text-xs leading-5 text-on-surface-variant">{row.notes}</p> : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-mono text-xs font-bold text-primary" title={row.epicName || row.epicKey || 'Not mapped'}>
                                  {row.epicKey || '-'}
                                </p>
                                {row.epicName ? <p className="mt-1 truncate text-[11px] text-on-surface-variant">{row.epicName}</p> : null}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-on-surface">{row.storyCount}</p>
                                {row.storyKeys.length ? (
                                  <p className="mt-1 break-words text-[11px] leading-4 text-on-surface-variant">{row.storyKeys.slice(0, 4).join(', ')}{row.storyKeys.length > 4 ? '...' : ''}</p>
                                ) : null}
                                {row.explicitStoryKeys?.length ? (
                                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-primary" title="Story key directly referenced by this requirement row">
                                    Direct: {row.explicitStoryKeys.join(', ')}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {rtmLayers.storyRows.length ? (
                      <div className="mt-3 rounded-lg border border-outline-variant">
                        <div className="grid grid-cols-[minmax(0,1fr)_92px_88px] gap-3 border-b border-outline-variant bg-surface-container-low px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                          <span>Layer 2: User story to generated test cases</span>
                          <span>Status</span>
                          <span className="text-right">Test cases</span>
                        </div>
                        <div className="max-h-72 divide-y divide-outline-variant overflow-y-auto">
                          {rtmLayers.storyRows.map((row: any, index: number) => {
                            const status = String(row.status || '').toLowerCase()
                            const tone = status.includes('missing') || status.includes('fail')
                              ? 'text-error bg-error/10'
                              : status.includes('partial') || status.includes('review')
                                ? 'text-warning bg-warning/10'
                                : 'text-success bg-success/10'
                            const visibleTestCaseKeys = row.testCaseKeys.slice(0, 3)
                            const hiddenTestCaseCount = Math.max(0, row.testCaseKeys.length - visibleTestCaseKeys.length)
                            return (
                              <div key={`${row.storyKey}-${index}`} className="grid grid-cols-[minmax(0,1fr)_92px_88px] gap-3 px-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px]">
                                <div className="min-w-0">
                                  <p className="break-words font-semibold leading-5 text-on-surface">{row.storyKey} - {row.storySummary}</p>
                                  {row.categories.length ? (
                                    <p className="mt-1 break-words text-xs leading-5 text-on-surface-variant">
                                      Categories: {row.categories.join(', ')}
                                    </p>
                                  ) : null}
                                </div>
                                <div>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold capitalize ${tone}`}>
                                    {status || 'covered'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-on-surface">{formatCompactNumber(row.testCaseCount)}</p>
                                  {row.testCaseKeys.length ? (
                                    <div className="mt-1 flex flex-wrap justify-end gap-1" title={row.testCaseKeys.join(', ')}>
                                      {visibleTestCaseKeys.map((key: string) => (
                                        <span key={key} className="rounded-full bg-surface-container-high px-1.5 py-0.5 font-mono text-[10px] font-semibold text-on-surface-variant">
                                          {key}
                                        </span>
                                      ))}
                                      {hiddenTestCaseCount ? (
                                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                          +{hiddenTestCaseCount} more
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : row.epicKey ? <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{row.epicKey}</p> : null}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {showCoverageDetailBlock ? (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-on-surface">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                        {isMappedDocumentCoverage ? sharedCoverageLabels.mapTitle : isStoryTestCasesCoverage ? 'Story test coverage map' : hasBatches ? 'Batch coverage' : 'Coverage ledger'}
                      </span>
                      {completedBatches || batchTotal ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          {completedBatches} / {batchTotal} complete
                        </span>
                      ) : null}
                      {reviewCount ? (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">
                          {reviewAreaLabel} {reviewCount === 1 ? 'needs' : 'need'} review
                        </span>
                      ) : null}
                      {missingCount ? (
                        <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-bold text-error">
                          {missingAreaLabel} missing
                        </span>
                      ) : null}
                      {retryingBatches ? (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">
                          {retryingBatches} retrying
                        </span>
                      ) : null}
                      {recoveredBatches ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                          {recoveredBatches} recovered
                        </span>
                      ) : null}
                    </div>
                    {coverageDetailRows.length && isMappedDocumentCoverage ? (
                      <div className="mt-3 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                        {coverageDetailRows.map((row: any, index: number) => {
                          const status = String(row.status || '').toLowerCase()
                          const tone = status.includes('missing') || status.includes('fail')
                            ? 'border-error/30 bg-error/5 text-error'
                            : status.includes('partial') || status.includes('review') || status.includes('retry')
                              ? 'border-warning/30 bg-warning/5 text-warning'
                              : 'border-success/30 bg-success/5 text-success'
                          const sectionChips = row.coveredSections.length ? row.coveredSections : []
                          return (
                            <article key={`${row.key || row.title}-${index}`} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{sharedCoverageLabels.itemLabel}</p>
                                  <h4 className="mt-1 break-words text-base font-semibold leading-6 text-on-surface">
                                    {row.key && !row.title.startsWith(row.key) ? `${row.key} - ${row.title}` : row.title}
                                  </h4>
                                </div>
                                <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>
                                  {status || 'covered'}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{sharedCoverageLabels.sectionLabel}</p>
                                  {sectionChips.length ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {sectionChips.map((section: string) => (
                                        <span key={section} className={`rounded-full border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-on-surface ${documentType === 'user_stories' ? 'font-mono' : ''}`}>
                                          {section}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="mt-2 text-sm leading-5 text-on-surface-variant">
                                      {documentType === 'user_stories' ? 'Jira mapping was not recorded for this coverage row.' : 'Document section was not recorded for this coverage row.'}
                                    </p>
                                  )}
                                </div>
                                <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{sharedCoverageLabels.rationaleLabel}</p>
                                  <p className="mt-2 break-words text-sm leading-6 text-on-surface">
                                    {row.notes || (status.includes('missing') ? 'Q-Ops could not confirm this item in the generated document.' : 'Q-Ops marked this item covered in the generated document.')}
                                  </p>
                                </div>
                              </div>

                              {row.missingCategories.length ? (
                                <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs leading-5 text-warning">
                                  <span className="font-bold">Missing categories:</span> {row.missingCategories.join(', ')}
                                </div>
                              ) : null}

                              {row.evidenceSummary || row.sourceReferenceRaw ? (
                                <details className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2">
                                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-on-surface-variant">Evidence source</summary>
                                  <p className="mt-2 break-words text-xs leading-5 text-on-surface-variant">
                                    {row.evidenceSummary || 'Source evidence is stored with this coverage row.'}
                                  </p>
                                  {row.sourceReferenceRaw && row.sourceReferenceRaw !== row.evidenceSummary ? (
                                    <p className="mt-2 break-words font-mono text-[11px] leading-5 text-on-surface-variant/80">
                                      {row.sourceReferenceRaw}
                                    </p>
                                  ) : null}
                                </details>
                              ) : null}
                            </article>
                          )
                        })}
                      </div>
                    ) : null}
                    {coverageDetailRows.length && isStoryTestCasesCoverage ? (
                      <div className="mt-3 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
                        {coverageDetailRows.map((row: any, index: number) => {
                          const status = String(row.status || '').toLowerCase()
                          const isProblem = status.includes('missing') || status.includes('fail')
                          const needsReview = status.includes('partial') || status.includes('review') || status.includes('retry')
                          const tone = isProblem
                            ? 'border-error/30 bg-error/5 text-error'
                            : needsReview
                              ? 'border-warning/30 bg-warning/5 text-warning'
                              : 'border-success/30 bg-success/5 text-success'
                          const caseTone = row.caseComplete ? 'text-success bg-success/10' : 'text-warning bg-warning/10'
                          const plannedCategoryCount = row.plannedCategories.length || row.categoryCount || 0
                          const coveredCategoryCount = row.coveredCategories.length || Math.max(0, plannedCategoryCount - row.missingCategories.length)
                          const hasCategoryData = Boolean(plannedCategoryCount || coveredCategoryCount || row.missingCategories.length)
                          const categoryTone = !hasCategoryData
                            ? 'text-on-surface-variant bg-surface-container'
                            : row.categoryComplete ? 'text-success bg-success/10' : 'text-warning bg-warning/10'
                          return (
                            <article key={`${row.key || row.title}-${index}`} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Jira story coverage</p>
                                  <h4 className="mt-1 break-words text-base font-semibold leading-6 text-on-surface">
                                    {row.key && !row.title.startsWith(row.key) ? `${row.key} - ${row.title}` : row.title}
                                  </h4>
                                  {row.link ? (
                                    <a href={row.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                                      Open Jira story <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : null}
                                </div>
                                <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${tone}`}>
                                  {needsReview ? 'Category review' : status || 'covered'}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Test cases</p>
                                      <p className="mt-1 text-xl font-bold text-on-surface">
                                        {formatCompactNumber(row.generated)} / {formatCompactNumber(row.planned || row.generated)}
                                      </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${caseTone}`}>
                                      {row.caseComplete ? 'Cases complete' : 'Cases short'}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                                    Jira test cases generated and linked for this story.
                                  </p>
                                </div>

                                <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Coverage categories</p>
                                      <p className={`${hasCategoryData ? 'text-xl' : 'text-base'} mt-1 font-bold text-on-surface`}>
                                        {hasCategoryData
                                          ? `${formatCompactNumber(coveredCategoryCount)} / ${formatCompactNumber(plannedCategoryCount || coveredCategoryCount)}`
                                          : 'Not rechecked'}
                                      </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${categoryTone}`}>
                                      {!hasCategoryData ? 'Reused mapping' : row.categoryComplete ? 'Categories complete' : 'Review categories'}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                                    {hasCategoryData
                                      ? 'Amber means planned category coverage is missing, even when all planned test-case count was generated.'
                                      : 'This retry reused persisted Jira story-to-test-case mappings, so category taxonomy was not recalculated.'}
                                  </p>
                                </div>
                              </div>

                              {row.missingCategories.length ? (
                                <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-3">
                                  <p className="text-[11px] font-bold uppercase tracking-wide text-warning">Missing categories</p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {row.missingCategories.map((category: string) => (
                                      <span key={category} className="rounded-full border border-warning/30 bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-warning">
                                        {category}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {row.coveredCategories.length ? (
                                <details className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2">
                                  <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-on-surface-variant">Covered categories</summary>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {row.coveredCategories.map((category: string) => (
                                      <span key={category} className="rounded-full border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-semibold text-on-surface">
                                        {category}
                                      </span>
                                    ))}
                                  </div>
                                </details>
                              ) : null}

                              {row.notes || row.sourceReference ? (
                                <div className="mt-3 grid gap-2 text-xs leading-5 text-on-surface-variant sm:grid-cols-2">
                                  {row.sourceReference ? (
                                    <p className="break-words"><span className="font-semibold text-on-surface">Source:</span> {row.sourceReference}</p>
                                  ) : null}
                                  {row.notes ? (
                                    <p className="break-words"><span className="font-semibold text-on-surface">Notes:</span> {row.notes}</p>
                                  ) : null}
                                </div>
                              ) : null}
                            </article>
                          )
                        })}
                      </div>
                    ) : null}
                    {coverageDetailRows.length && !isMappedDocumentCoverage && !isStoryTestCasesCoverage ? (
                      <div className="mt-3 max-h-[24rem] overflow-y-auto rounded-lg border border-outline-variant">
                        <div className={`${coverageDetailGridClass} border-b border-outline-variant bg-surface-container-low px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-on-surface-variant`}>
                          <span>{coverageDetailHeaderLabel}</span>
                          <span>Status</span>
                          {showCoverageTestsColumn ? <span className="text-right">Tests</span> : null}
                        </div>
                        <div className="divide-y divide-outline-variant">
                          {coverageDetailRows.map((row: any, index: number) => {
                            const status = String(row.status || '').toLowerCase()
                            const tone = status.includes('missing') || status.includes('fail')
                              ? 'text-error bg-error/10'
                              : status.includes('partial') || status.includes('review') || status.includes('retry')
                                ? 'text-warning bg-warning/10'
                                : 'text-success bg-success/10'
                            const testLabel = row.planned
                              ? `${formatCompactNumber(row.generated)} / ${formatCompactNumber(row.planned)}`
                              : row.generated
                                ? formatCompactNumber(row.generated)
                                : '-'
                            return (
                              <div key={`${row.key || row.title}-${index}`} className={`${coverageDetailGridClass} px-3 py-3 text-left text-sm`}>
                                <div className="min-w-0">
                                  <p className="break-words font-semibold leading-5 text-on-surface">
                                    {row.key && !row.title.startsWith(row.key) ? `${row.key} - ${row.title}` : row.title}
                                  </p>
                                  {row.missingCategories.length ? (
                                    <p className="mt-1 text-xs leading-5 text-warning">
                                      <span className="font-bold">Missing categories:</span>{' '}
                                      <span>{row.missingCategories.join(', ')}</span>
                                    </p>
                                  ) : row.categoryCount ? (
                                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                                      {row.categoryCount} categories covered
                                    </p>
                                  ) : null}
                                  {row.sourceReference ? (
                                    <p className="mt-1 break-words text-xs leading-5 text-on-surface-variant" title={row.sourceReferenceRaw || row.sourceReference}>
                                      <span className="font-semibold">Source:</span> {row.sourceReference}
                                    </p>
                                  ) : null}
                                  {row.notes ? (
                                    <p className="mt-1 break-words text-xs leading-5 text-on-surface-variant">
                                      <span className="font-semibold">Notes:</span> {row.notes}
                                    </p>
                                  ) : null}
                                </div>
                                <div>
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold capitalize ${tone}`}>
                                    {status || 'covered'}
                                  </span>
                                  {row.includedInOutput ? (
                                    <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">
                                    Included: {row.includedInOutput}
                                  </p>
                                ) : null}
                              </div>
                                {showCoverageTestsColumn ? (
                                  <div className="text-right">
                                  <p className="font-bold text-on-surface">{testLabel}</p>
                                  {row.planned ? <p className="mt-0.5 text-[11px] text-on-surface-variant">generated / planned</p> : null}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </ModalFrame>
          ) : null}
        </>
      )
    }
  }

  return (
    <div className={`mt-3 space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {hasProgress ? (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-on-surface">{stageLabel || 'Generation progress'}</p>
            {Number.isFinite(pct) ? <span className="text-xs font-bold text-primary">{Math.round(clampPercent(pct))}%</span> : null}
          </div>
          {progress?.summary ? <p className="mt-1 leading-5 text-on-surface-variant">{progress.summary}</p> : null}
          {Number.isFinite(pct) ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-primary" style={{ width: `${clampPercent(pct)}%` }} />
            </div>
          ) : null}
        </div>
      ) : null}
      <CoverageSummaryStrip coverage={coverage} compact={compact} />
      {hasBatches ? (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Batch coverage</span>
            {completedBatches || batchTotal ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {completedBatches} / {batchTotal} complete
              </span>
            ) : null}
            {partialBatches ? (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-bold text-warning">
                {partialBatches} coverage area{partialBatches === 1 ? '' : 's'} needs review
              </span>
            ) : null}
            {missingBatches ? (
              <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-bold text-error">
                {missingBatches} missing
              </span>
            ) : null}
            {retryingBatches ? (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-bold text-warning">
                {retryingBatches} retrying
              </span>
            ) : null}
            {recoveredBatches ? (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                {recoveredBatches} recovered
              </span>
            ) : null}
          </div>
          {visibleBatches.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {visibleBatches.map((batch: Record<string, any>, index: number) => {
                const label = batchLabel(batch, index)
                const status = String(batch.status || batch.coverageStatus || '').trim().toLowerCase()
                const tone = status.includes('missing') || status.includes('fail')
                  ? 'bg-error/10 text-error'
                  : status.includes('partial') || status.includes('retry')
                    ? 'bg-warning/10 text-warning'
                    : 'bg-success/10 text-success'
                return (
                  <span key={`${label}-${index}`} className={`max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`} title={label}>
                    {label}
                  </span>
                )
              })}
              {hiddenBatches.length ? (
                <span
                  className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-bold text-on-surface-variant"
                  title={hiddenBatchLabels ? `Additional modules: ${hiddenBatchLabels}` : `${hiddenBatches.length} additional module${hiddenBatches.length === 1 ? '' : 's'}`}
                >
                  {hiddenBatches.length} more
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function OutputPanel({ status, output, jobId, jobRecord, relatedOutputs = [], onRetry }: { status: JobStatus; output: any; jobId?: string | null; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[]; onRetry?: (job: GeneratedOutput) => void }) {
  if (status === 'failed' && output) {
    const failure = getFailureDisplay('documents', { output, jobId })
    const isBacklogValidationFailure = failure.code === 'EPICS & STORIES GENERATION FAILED'
    const isStoryTestCaseFailure = String(output?.documentType || output?.document_type || jobRecord?.documentType || '').toLowerCase() === 'story_test_cases'
    const retryState = jobRecord ? generationJobRetryState(jobRecord, [jobRecord]) : 'actionable'
    const retryAttempt = Number(jobRecord?.retryAttempt || output?.retryAttempt || output?.metadata?.retry_attempt || 0) || 0
    const repeatedFailure = retryAttempt >= 2
    const canShowRetry = !isBacklogValidationFailure && retryState === 'actionable'
    return (
      <section className="rounded-xl border border-error/20 bg-surface-container-lowest p-6 shadow-sm">
        <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-error">{failure.code}</p>
            {isBacklogValidationFailure ? null : <h3 className="mt-1 text-lg font-semibold text-on-surface">{failure.title}</h3>}
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{failure.summary}</p>
            <p className="mt-3 rounded-lg bg-surface-container-low p-3 text-sm leading-6 text-on-surface">{failure.action}</p>
            {repeatedFailure ? (
              <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm leading-6 text-warning">
                {isStoryTestCaseFailure
                  ? 'This STC update has failed after multiple attempts. Retry only after the workflow/admin fix is applied; the retry should target the missing or partial stories from this failed attempt.'
                  : 'This job has already failed after multiple attempts. Regenerate is still available because an admin or workflow fix may have changed the outcome; review Error Details before retrying if no fix was applied.'}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <GenerationUsageButton output={output} jobRecord={jobRecord} label="Usage recorded before failure" compact />
              {canShowRetry && jobRecord && onRetry ? (
                <button
                  type="button"
                  onClick={() => void onRetry(jobRecord)}
                  title="Regenerate"
                  aria-label="Regenerate"
                  className={`inline-flex ${compactDocumentIconButtonClasses} items-center justify-center rounded-full border border-error bg-error/10 text-error shadow-sm hover:bg-error/20 ${iconButtonPressClasses}`}
                >
                  <RefreshCw className={compactDocumentIconClasses} />
                </button>
              ) : null}
            </div>
            <TechnicalDetailsPanel failure={failure} jobId={jobId} />
        </div>
      </section>
    )
  }
  if (status !== 'completed' || !output) return null
  if (output.stories && output.testCases) {
    return <GeneratedStoryTestCasesSuccessCard output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} />
  }
  if (output.epics && output.stories) {
    return <GeneratedJiraSuccessCard output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} />
  }
  const url = outputUrl(output)
  if (url) return <GeneratedDocumentSuccessCard output={output} url={url} jobRecord={jobRecord} relatedOutputs={relatedOutputs} />
  return null
}

function generatedDocumentTitle(documentType?: string, artifactLabel?: string, mode?: string) {
  const label = documentTypeLabel(documentType || artifactLabel)
  return `${label} ${mode === 'update' ? 'Updated' : 'Generated'}`
}

function generatedDocumentActionLabel(url: string) {
  const normalized = url.toLowerCase()
  if (normalized.includes('atlassian.net/wiki') || normalized.includes('confluence')) return 'Open in Confluence'
  if (normalized.includes('atlassian.net/browse') || normalized.includes('jira')) return 'Open in Jira'
  return 'Open Document'
}

const iconButtonPressClasses = 'transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-md active:translate-y-0 active:scale-95 active:shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60'
const compactDocumentIconButtonClasses = 'h-[30px] w-[30px]'
const compactDocumentIconClasses = 'h-3 w-3'

function GeneratedDocumentSuccessCard({ output, url, jobRecord, relatedOutputs = [] }: { output: any; url: string; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[] }) {
  const documentType = jobRecord?.documentType || output?.documentType
  const artifactLabel = jobRecord?.artifactLabel || output?.artifactLabel
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Generated output'
  const coverageTone = documentOutputTone(output)
  const mode = generationModeFrom(output, jobRecord)
  const SuccessIcon = coverageTone === 'error' || coverageTone === 'warning' ? AlertTriangle : CheckCircle2
  const iconClass = coverageTone === 'error' ? 'bg-error/10 text-error' : coverageTone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
  return (
    <section className={`relative rounded-xl border bg-surface-container-lowest p-5 shadow-sm ${coverageTone === 'error' ? 'border-error/20' : coverageTone === 'warning' ? 'border-warning/20' : 'border-success/20'}`}>
      <span className={`absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <SuccessIcon className="h-10 w-10" />
      </span>
      <div className="flex flex-wrap items-center justify-center gap-5 text-center">
        <div className="flex min-w-0 flex-col items-center">
          <div className="px-16">
            <div>
              <h3 className="text-lg font-semibold text-on-surface">{generatedDocumentTitle(documentType, artifactLabel, mode)}</h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <GeneratedOutputLinkIcon url={url} label={generatedDocumentActionLabel(url)} compact />
            <GenerationUsageButton output={output} jobRecord={jobRecord} label="View generation usage" compact />
            <UpdateSummaryButton output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact />
            <FinalValidationButton output={output} compact />
            <JobProgressSummary output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact iconOnly />
          </div>
        </div>
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

function GeneratedJiraSuccessCard({ output, jobRecord, relatedOutputs = [] }: { output: any; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[] }) {
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Jira backlog'
  const epics = jiraIssueItems(output.epics || [], 'epicID', 'epicKey', 'epicLink')
  const stories = jiraIssueItems(output.stories || [], 'storyID', 'storyKey', 'storyLink')
  const confluenceUrl = jobRecord?.url || outputUrl(output)
  const coverageTone = documentOutputTone(output)
  const SuccessIcon = coverageTone === 'error' || coverageTone === 'warning' ? AlertTriangle : CheckCircle2
  const iconClass = coverageTone === 'error' ? 'bg-error/10 text-error' : coverageTone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
  return (
    <section className={`relative rounded-xl border bg-surface-container-lowest p-5 shadow-sm ${coverageTone === 'error' ? 'border-error/20' : coverageTone === 'warning' ? 'border-warning/20' : 'border-success/20'}`}>
      <span className={`absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <SuccessIcon className="h-10 w-10" />
      </span>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="px-16">
          <h3 className="text-lg font-semibold text-on-surface">Epics & User Stories Generated</h3>
          <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed in Jira</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {confluenceUrl ? <GeneratedOutputLinkIcon url={confluenceUrl} label="Open in Confluence" compact /> : null}
          <GenerationUsageButton output={output} jobRecord={jobRecord} label="View generation usage" compact />
          <UpdateSummaryButton output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact />
          <FinalValidationButton output={output} compact />
          <JobProgressSummary output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact iconOnly />
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <JiraIssueGroup title="Epics" items={epics} />
          <JiraIssueGroup title="User Stories" items={stories} />
        </div>
      </div>
    </section>
  )
}

function GeneratedOutputLinkIcon({ url, label, compact = false }: { url: string; label: string; compact?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className={`inline-flex ${compact ? compactDocumentIconButtonClasses : 'h-9 w-9'} items-center justify-center rounded-full border border-primary bg-primary/10 text-primary shadow-sm hover:bg-primary/20 ${iconButtonPressClasses}`}
    >
      <ExternalLink className={compact ? compactDocumentIconClasses : 'h-4 w-4'} />
    </a>
  )
}

function GeneratedStoryTestCasesSuccessCard({ output, jobRecord, relatedOutputs = [] }: { output: any; jobRecord?: GeneratedOutput | null; relatedOutputs?: GeneratedOutput[] }) {
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || 'Jira test cases'
  const sourceStories = jiraIssueItems(output.stories || [], 'storyId', 'storyKey', 'storyLink')
  const testCases = jiraIssueItems(output.testCases || [], 'testcaseId', 'testcaseKey', 'testcaseLink')
  const coverageTone = documentOutputTone(output)
  const SuccessIcon = coverageTone === 'error' || coverageTone === 'warning' ? AlertTriangle : CheckCircle2
  const iconClass = coverageTone === 'error' ? 'bg-error/10 text-error' : coverageTone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
  return (
    <section className={`relative rounded-xl border bg-surface-container-lowest p-5 shadow-sm ${coverageTone === 'error' ? 'border-error/20' : coverageTone === 'warning' ? 'border-warning/20' : 'border-success/20'}`}>
      <span className={`absolute left-4 top-4 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <SuccessIcon className="h-10 w-10" />
      </span>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="px-16">
          <h3 className="text-lg font-semibold text-on-surface">Story Test Cases Generated</h3>
          <p className="mt-0.5 text-sm text-on-surface-variant">{projectName} | Completed in Jira</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <GenerationUsageButton output={output} jobRecord={jobRecord} label="View generation usage" compact />
          <UpdateSummaryButton output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact />
          <FinalValidationButton output={output} compact />
          <JobProgressSummary output={output} jobRecord={jobRecord} relatedOutputs={relatedOutputs} compact iconOnly />
        </div>
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

type GenerationUsageAnalyticsJob = AnalyticsSummary['recentJobs'][number]

function generationUsageValues(output: any, analyticsJob?: GenerationUsageAnalyticsJob | null) {
  const usage = output?.tokenUsage || output?.token_usage || {}
  return {
    tokens: Number(usage.total ?? usage.tokensTotal ?? usage.tokens_total ?? output?.tokensTotal ?? output?.tokens_total ?? analyticsJob?.tokensTotal ?? 0),
    cost: Number(usage.estimatedCostUsd ?? usage.estimated_cost_usd ?? output?.estimatedCostUsd ?? output?.estimated_cost_usd ?? analyticsJob?.estimatedCostUsd ?? 0),
    wordCount: Number(output?.wordCount ?? output?.word_count ?? output?.words ?? analyticsJob?.wordCount ?? 0),
  }
}

function hasGenerationUsage(output: any, analyticsJob?: GenerationUsageAnalyticsJob | null) {
  const { tokens, cost, wordCount } = generationUsageValues(output, analyticsJob)
  return Boolean(tokens || cost || wordCount)
}

function GenerationUsageButton({ output, jobRecord, analyticsJob, label = 'View usage details', compact = false }: { output: any; jobRecord?: GeneratedOutput | null; analyticsJob?: GenerationUsageAnalyticsJob | null; label?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const { tokens, cost, wordCount } = generationUsageValues(output, analyticsJob)
  if (!tokens && !cost && !wordCount) return null
  const documentType = documentTypeLabel(jobRecord?.documentType || output?.documentType || jobRecord?.artifactLabel || output?.artifactLabel)
  const jobId = jobRecord?.jobId || jobRecord?.id || output?.jobId || output?.id || '-'
  const projectName = jobRecord?.projectName || output?.projectName || output?.destination?.projectName || '-'
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className={`inline-flex ${compact ? compactDocumentIconButtonClasses : 'h-9 w-9'} items-center justify-center rounded-full border border-secondary bg-secondary/10 text-secondary shadow-sm hover:bg-secondary/20 ${iconButtonPressClasses}`}
      >
        <BarChart3 className={compact ? compactDocumentIconClasses : 'h-4 w-4'} />
      </button>
      {open ? (
        <ModalFrame title="Usage Details" onClose={() => setOpen(false)} maxWidth="max-w-lg">
          <div className="space-y-5">
            <UsageModalHeader
              eyebrow={documentType}
              title={projectName}
              subtitle="Generation usage recorded for this output."
              jobId={jobId}
              icon={FileText}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <UsageMetricCard label="Words" value={formatCompactNumber(wordCount)} icon={FileText} />
              <UsageMetricCard label="Tokens" value={formatCompactNumber(tokens)} tag="Estimated" icon={Cpu} />
              <UsageMetricCard label="Cost" value={formatCurrency(cost, 4)} tag="Estimated" mono icon={BarChart3} />
            </div>
            <UsageEstimateNote>
              Usage is estimated from recorded generation output and token metadata. Final provider billing may differ.
            </UsageEstimateNote>
          </div>
        </ModalFrame>
      ) : null}
    </>
  )
}

function UsageModalHeader({ eyebrow, title, subtitle, jobId, icon: Icon }: { eyebrow: string; title: string; subtitle: string; jobId: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-bold leading-6 text-on-surface">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-on-surface-variant">{subtitle}</p>
          <span className="mt-3 inline-flex max-w-full items-center rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 font-mono text-[11px] font-semibold text-on-surface-variant">
            <span className="truncate">{jobId}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function UsageMetricCard({ label, value, tag, mono = false, className = '', icon: Icon = BarChart3 }: { label: string; value: string; tag?: string; mono?: boolean; className?: string; icon?: LucideIcon }) {
  return (
    <div className={`min-w-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm ${className}`}>
      <div className="flex min-h-8 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
          {tag ? <span className="mt-1 inline-flex rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-normal text-primary">{tag}</span> : null}
        </div>
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={`mt-3 max-w-full break-all text-2xl font-bold leading-tight text-on-surface ${mono ? 'font-mono text-lg sm:text-xl' : ''}`}>{value}</p>
    </div>
  )
}

function UsageDetailList({ title, rows }: { title: string; rows: Array<{ label: string; value: ReactNode; help?: ReactNode }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</p>
      </div>
      <dl className="divide-y divide-outline-variant">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-2.5 text-sm">
            <dt className="min-w-0 text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                {row.label}
                {row.help}
              </span>
            </dt>
            <dd className="min-w-0 break-words text-right font-semibold text-on-surface">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function UsageEstimateNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs leading-5 text-on-surface-variant">
      {children}
    </div>
  )
}

type IngestionUsageAnalyticsJob = AnalyticsSummary['recentJobs'][number]

function aggregateExtractionMetrics(records: ArtifactRecord[]) {
  const recordsWithMetrics = records.filter((record) => record.extractionMetrics)
  if (!recordsWithMetrics.length) return null
  return recordsWithMetrics.reduce<ExtractionMetrics>((summary, record) => {
    const metrics = record.extractionMetrics || {}
    return {
      fileName: summary.fileName || metrics.fileName || record.fileName,
      docType: summary.docType || metrics.docType || record.type,
      fileType: summary.fileType || metrics.fileType,
      chunks: Number(summary.chunks || 0) + Number(metrics.chunks || 0),
      words: Number(summary.words || 0) + Number(metrics.words || 0),
      tokens: Number(summary.tokens || 0) + Number(metrics.tokens || 0),
      costUsd: Number(summary.costUsd || 0) + Number(metrics.costUsd || 0),
      durationMs: Number(summary.durationMs || 0) + Number(metrics.durationMs || 0),
      fileSizeBytes: Number(summary.fileSizeBytes || 0) + Number(metrics.fileSizeBytes || record.size || 0),
      responseBytesEstimated: Number(summary.responseBytesEstimated || 0) + Number(metrics.responseBytesEstimated || 0),
      tables: Number(summary.tables || 0) + Number(metrics.tables || 0),
      annotations: Number(summary.annotations || 0) + Number(metrics.annotations || 0),
      links: Number(summary.links || 0) + Number(metrics.links || 0),
      visualCandidates: Number(summary.visualCandidates || 0) + Number(metrics.visualCandidates || 0),
      warnings: Number(summary.warnings || 0) + Number(metrics.warnings || record.extractionWarningCount || 0),
    }
  }, {})
}

function ingestionUsageValues(job: KnowledgeJobRecord, analyticsJob?: IngestionUsageAnalyticsJob | null, artifactRecords: ArtifactRecord[] = []) {
  const artifactMetrics = aggregateExtractionMetrics(artifactRecords) || {}
  const metrics = job.extractionMetrics || {}
  const warningCount = Number(job.extractionWarningCount ?? metrics.warnings ?? artifactMetrics.warnings ?? 0) || 0
  return {
    files: Number(analyticsJob?.totalFiles || artifactRecords.length || 0),
    chunks: Number(metrics.chunks || artifactMetrics.chunks || analyticsJob?.chunkCount || 0),
    words: Number(metrics.words || artifactMetrics.words || analyticsJob?.wordCount || 0),
    tokens: Number(metrics.tokens || artifactMetrics.tokens || analyticsJob?.tokensTotal || 0),
    cost: Number(metrics.costUsd || artifactMetrics.costUsd || analyticsJob?.estimatedCostUsd || 0),
    durationMs: Number(metrics.durationMs || artifactMetrics.durationMs || analyticsJob?.durationMs || 0),
    fileSizeBytes: Number(metrics.fileSizeBytes || artifactMetrics.fileSizeBytes || 0),
    responseBytesEstimated: Number(metrics.responseBytesEstimated || artifactMetrics.responseBytesEstimated || 0),
    warnings: warningCount,
    docType: metrics.docType || artifactMetrics.docType || job.processingClass || '-',
    fileType: metrics.fileType || artifactMetrics.fileType || '-',
  }
}

function hasIngestionUsage(job: KnowledgeJobRecord, analyticsJob?: IngestionUsageAnalyticsJob | null, artifactRecords: ArtifactRecord[] = []) {
  if (job.status !== 'completed' && job.status !== 'failed') return false
  const usage = ingestionUsageValues(job, analyticsJob, artifactRecords)
  return Boolean(
    usage.chunks ||
    usage.words ||
    usage.tokens ||
    usage.cost ||
    usage.durationMs ||
    usage.fileSizeBytes ||
    usage.responseBytesEstimated ||
    usage.warnings
  )
}

function IngestionUsageButton({ job, analyticsJob, artifactRecords = [], label = 'View ingestion usage' }: { job: KnowledgeJobRecord; analyticsJob?: IngestionUsageAnalyticsJob | null; artifactRecords?: ArtifactRecord[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const usage = ingestionUsageValues(job, analyticsJob, artifactRecords)
  if (!hasIngestionUsage(job, analyticsJob, artifactRecords)) return null
  const jobId = job.jobId || job.id || '-'
  const fileName = job.fileName || job.fileKey || 'Knowledge base ingestion'
  const detailRows = [
    { label: 'Files processed', value: usage.files ? formatCompactNumber(usage.files) : '-' },
    { label: 'Document type', value: usage.docType },
    { label: 'File type', value: usage.fileType },
    { label: 'Extractor time', value: usage.durationMs ? formatDuration(usage.durationMs) : '-' },
    { label: 'File size', value: usage.fileSizeBytes ? fileSize(usage.fileSizeBytes) : '-' },
    { label: 'Response size', value: usage.responseBytesEstimated ? fileSize(usage.responseBytesEstimated) : '-' },
    { label: 'Warnings', value: formatCompactNumber(usage.warnings) },
  ]
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm hover:border-primary hover:text-primary ${iconButtonPressClasses}`}
      >
        <BarChart3 className="h-4 w-4" />
      </button>
      {open ? (
        <ModalFrame title="Ingestion Usage" onClose={() => setOpen(false)} maxWidth="max-w-lg">
          <div className="space-y-5">
            <UsageModalHeader
              eyebrow="Knowledge ingestion"
              title={fileName}
              subtitle={job.projectName}
              jobId={jobId}
              icon={Database}
            />
            <div className="grid gap-3 sm:grid-cols-4">
              <UsageMetricCard label="Chunks" value={formatCompactNumber(usage.chunks)} icon={Database} />
              <UsageMetricCard label="Words" value={formatCompactNumber(usage.words)} icon={FileText} />
              <UsageMetricCard label="Tokens" value={formatCompactNumber(usage.tokens)} tag="Estimated" icon={Cpu} />
              <UsageMetricCard label="Cost" value={formatUsageCurrency(usage.cost, 4)} tag="Estimated" mono icon={BarChart3} />
            </div>
            <UsageDetailList title="Processing Details" rows={detailRows} />
            <UsageEstimateNote>
              Usage is estimated from ingestion telemetry and extraction metadata. Final provider billing may differ.
            </UsageEstimateNote>
          </div>
        </ModalFrame>
      ) : null}
    </>
  )
}

function analyticsJobForKnowledgeJob(job: KnowledgeJobRecord, analyticsJobs: IngestionUsageAnalyticsJob[]) {
  const jobId = job.jobId || job.id
  if (!jobId) return null
  return analyticsJobs.find((candidate) => (
    String(candidate.pipeline || '').toLowerCase() === 'ingestion'
    && String(candidate.jobId || '') === String(jobId)
  )) || null
}

function usageArtifactRecordsForKnowledgeJob(job: KnowledgeJobRecord, artifacts: ArtifactRecord[]) {
  const jobId = job.jobId || job.id
  const exactArtifacts = jobId ? artifacts.filter((record) => record.jobId === jobId || artifactSourceJobId(record) === jobId) : []
  if (exactArtifacts.length || job.status === 'failed') return exactArtifacts
  return matchKnowledgeJobArtifacts(job, artifacts)
}

function isQualityGateFailure(output: any) {
  const text = [
    output?.qualityGate?.failureType,
    output?.qualityGate?.message,
    output?.message,
    output?.error,
  ].filter(Boolean).join(' ').toLowerCase()
  return text.includes('quality gate')
}

function generationRetryInstruction(job: GeneratedOutput) {
  const qualityGate = job.output?.qualityGate || {}
  const wordCount = Number(qualityGate.wordCount || job.output?.wordCount || 0)
  const minWordCount = Number(qualityGate.minWordCount || 0)
  const qualityPhrase = minWordCount
    ? `The previous attempt produced ${wordCount || 0} words against a minimum of ${minWordCount}.`
    : 'The previous attempt did not satisfy the quality gate.'
  return [
    `Regenerate ${documentTypeLabel(job.documentType || job.artifactLabel)} for ${job.projectName}.`,
    isQualityGateFailure(job.output) ? qualityPhrase : 'The previous generation attempt failed.',
    'Produce a fuller, source-grounded document with all required sections, traceability references, and enough implementation detail to pass validation.',
    'Do not reuse the failed output verbatim; expand it using retrieved project evidence.'
  ].join(' ')
}

function analyticsJobForGeneratedOutput(job: GeneratedOutput, analyticsJobs: GenerationUsageAnalyticsJob[]) {
  const jobId = job.jobId || job.id
  if (!jobId) return null
  return analyticsJobs.find((candidate) => candidate.jobId === jobId) || null
}

function DocumentJobsPanel({ jobs, allJobs = jobs, analyticsJobs, onRetry }: { jobs: GeneratedOutput[]; allJobs?: GeneratedOutput[]; analyticsJobs: GenerationUsageAnalyticsJob[]; onRetry: (job: GeneratedOutput) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | RetryDisplayStatus>('all')
  if (!jobs.length) return null
  const visibleJobs = statusFilter === 'all' ? jobs : jobs.filter((job) => generationDisplayStatus(job, jobs) === statusFilter)
  const filterOptionsRaw: Array<{ key: 'all' | RetryDisplayStatus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'completed', label: 'Completed', count: jobs.filter((job) => generationDisplayStatus(job, jobs) === 'completed').length },
    { key: 'needs_retry', label: 'Needs retry', count: jobs.filter((job) => generationDisplayStatus(job, jobs) === 'needs_retry').length },
    { key: 'recovered', label: 'Recovered', count: jobs.filter((job) => generationDisplayStatus(job, jobs) === 'recovered').length },
    { key: 'retrying', label: 'Retrying', count: jobs.filter((job) => generationDisplayStatus(job, jobs) === 'retrying').length },
    { key: 'processing', label: 'Processing', count: jobs.filter((job) => generationDisplayStatus(job, jobs) === 'processing').length },
  ]
  const filterOptions = filterOptionsRaw.filter((filter) => filter.key === 'all' || filter.key === 'completed' || filter.key === 'needs_retry' || filter.key === 'recovered' || filter.count > 0)

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">My Document Jobs</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Track multiple generation requests and retry failed runs.</p>
          </div>
          <StatusFilterSelect
            label="Status"
            value={statusFilter}
            options={filterOptions}
            onChange={setStatusFilter}
            ariaLabel="Filter document jobs by status"
            className="sm:justify-self-end"
          />
        </div>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-4">
        {visibleJobs.length ? visibleJobs.map((job) => {
          const retryState = generationJobRetryState(job, jobs)
          const retryAttempt = Number(job.retryAttempt || job.output?.retryAttempt || job.output?.metadata?.retry_attempt || 0) || 0
          const repeatedFailure = job.status === 'failed' && retryAttempt >= 2
          const canRetry = retryState === 'actionable' && Boolean(resolveArtifactKey(job))
          const displayStatus = generationDisplayStatus(job, jobs)
          const badgeTone: StatusTone = displayStatus === 'completed'
            ? 'success'
            : displayStatus === 'recovered'
              ? 'success'
              : displayStatus === 'needs_retry'
                ? 'error'
                : 'info'
          const jobLabel = job.jobId || job.id
          const recoveredByJobId = retryState === 'recovered' ? findRecoveredGenerationRetryJobId(job, jobs) : null
          const latestRetryId = latestGenerationRetryJobId(job, jobs)
          const jobUrl = job.url || outputUrl(job.output)
          const analyticsJob = analyticsJobForGeneratedOutput(job, analyticsJobs)
          const jobTypeLabel = documentTypeLabel(job.documentType || job.artifactLabel)
          const jobProgress = jobProgressFrom(job.output)
          const isStoryTestCaseDocumentJob = isStoryTestCaseJob(job)
          const showStoryTestCaseProgress = isStoryTestCaseDocumentJob && isActiveDocumentStatus(job.status)
          const suppressFinalValidationIcon = isStoryTestCaseDocumentJob && job.status === 'failed'
          const retryDetail =
            retryState === 'recovered' ? {
              label: 'Retry result',
              value: (
                <JobCardInlineStatus tone="success">
                  <span>No action needed.</span>
                  <span>Recovered by</span>
                  <span className="font-mono text-[11px]">{recoveredByJobId || 'later retry'}</span>
                </JobCardInlineStatus>
              ),
            } :
            retryState === 'retrying' ? {
              label: 'Retry status',
              value: (
                <JobCardInlineStatus tone="info">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>In progress</span>
                  {latestRetryId ? <span className="font-mono text-[11px]">{latestRetryId}</span> : null}
                </JobCardInlineStatus>
              ),
            } :
            retryState === 'superseded' ? {
              label: 'Retry status',
              value: (
                <JobCardInlineStatus tone="info">
                  <span>Moved to newer retry</span>
                  {latestRetryId ? <span className="font-mono text-[11px]">{latestRetryId}</span> : null}
                </JobCardInlineStatus>
              ),
            } :
            repeatedFailure ? {
              label: 'Retry status',
              value: (
                <JobCardInlineStatus tone="warning">
                  <span>{isStoryTestCaseDocumentJob ? 'STC update retry failed. Review actionable Error Details before retrying after the fix.' : 'Multiple attempts failed. Review Error Details before retrying.'}</span>
                </JobCardInlineStatus>
              ),
            } :
            null
          const failureMessage = String(job.error || job.output?.message || '').trim()
          const failureDetail = !retryDetail && failureMessage ? {
            label: 'Failure',
            value: (
              <JobCardInlineStatus tone="error">
                <span>{failureMessage}</span>
              </JobCardInlineStatus>
            ),
          } : null
          const statusLabel =
            displayStatus === 'completed' ? 'Completed' :
            displayStatus === 'needs_retry' ? 'Needs retry' :
            displayStatus === 'retrying' ? 'Retry in progress' :
            displayStatus === 'recovered' ? 'Recovered' :
            displayStatus === 'processing' ? 'Processing' :
            displayStatus
          return (
            <div key={job.jobId || job.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(7.5rem,1fr)_auto] sm:items-start">
                <div className="flex min-h-[30px] min-w-0 items-center">
                  <p className="truncate font-mono text-xs font-bold text-on-surface" title={jobLabel}>{jobLabel}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <DocumentJobStatusIcon status={displayStatus} tone={badgeTone} label={statusLabel} />
                  <JobProgressSummary output={job.output} jobRecord={job} relatedOutputs={allJobs} compact iconOnly />
                  <UpdateSummaryButton output={job.output} jobRecord={job} relatedOutputs={allJobs} compact />
                  {suppressFinalValidationIcon ? null : <FinalValidationButton output={job.output} compact />}
                  {hasGenerationUsage(job.output, analyticsJob) ? <GenerationUsageButton output={job.output} jobRecord={job} analyticsJob={analyticsJob} label={job.status === 'failed' ? 'Usage recorded before failure' : 'View generation usage'} compact /> : null}
                  {jobUrl ? (
                    <a
                      href={jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Confluence"
                      aria-label="Open in Confluence"
                      className={`inline-flex ${compactDocumentIconButtonClasses} items-center justify-center rounded-full border border-primary bg-primary/10 text-primary shadow-sm hover:bg-primary/20 ${iconButtonPressClasses}`}
                    >
                      <ExternalLink className={compactDocumentIconClasses} />
                    </a>
                  ) : null}
                  {canRetry ? (
                    <button
                      type="button"
                      onClick={() => void onRetry(job)}
                      title="Regenerate"
                      aria-label="Regenerate"
                      className={`inline-flex ${compactDocumentIconButtonClasses} items-center justify-center rounded-full border border-error bg-error/10 text-error shadow-sm hover:bg-error/20 ${iconButtonPressClasses}`}
                    >
                      <RefreshCw className={compactDocumentIconClasses} />
                    </button>
                  ) : null}
                </div>
              </div>
              <JobCardDetailRows
                className="mt-3"
                items={[
                  { label: 'Type', value: jobTypeLabel },
                  { label: 'Project', value: job.projectName },
                  { label: 'Started at', value: formatTime(job.createdAt) },
                  { label: 'Retried by', value: job.retriedByJobId, mono: true },
                  { label: 'Retry of', value: job.retryOfJobId, mono: true },
                  retryDetail,
                  failureDetail,
                ].filter(Boolean) as Array<{ label: string; value?: ReactNode; mono?: boolean }>}
              />
              {showStoryTestCaseProgress ? <StoryTestCaseProgressModel progress={jobProgress} status={job.status} output={job.output} /> : null}
            </div>
          )
        }) : (
          <p className="rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No {statusFilter} document jobs to show.</p>
        )}
      </div>
    </section>
  )
}

function DocumentJobStatusIcon({ status, tone, label }: { status: RetryDisplayStatus; tone: StatusTone; label: string }) {
  const Icon =
    status === 'completed' ? CheckCircle2 :
    status === 'needs_retry' ? AlertTriangle :
    status === 'retrying' ? RefreshCw :
    status === 'processing' ? Clock :
    Clock
  const cls =
    tone === 'success' ? 'border-success bg-success/10 text-success' :
    tone === 'error' ? 'border-error bg-error/10 text-error' :
    tone === 'warning' ? 'border-warning bg-warning/10 text-warning' :
    'border-primary bg-primary/10 text-primary'
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`relative inline-flex ${compactDocumentIconButtonClasses} items-center justify-center rounded-full border ${cls}`}
    >
      {status === 'recovered' ? (
        <>
          <Settings className="h-3.5 w-3.5" />
          <RefreshCw className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-surface-container-low p-[1px]" />
        </>
      ) : (
        <Icon className={compactDocumentIconClasses} />
      )}
    </span>
  )
}

function KnowledgeJobsPanel({ jobs, artifacts, analyticsJobs, onRetry }: { jobs: KnowledgeJobRecord[]; artifacts: ArtifactRecord[]; analyticsJobs: IngestionUsageAnalyticsJob[]; onRetry: (job: KnowledgeJobRecord) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | RetryDisplayStatus>('all')
  if (!jobs.length) return null
  const latestAttempts = buildArtifactLatestAttemptMap(artifacts)
  const displayStatusForJob = (job: KnowledgeJobRecord): RetryDisplayStatus => {
    const retryState = knowledgeJobRetryState(job, artifacts, jobs, latestAttempts)
    if (retryState === 'recovered' || retryState === 'superseded') return 'recovered'
    if (retryState === 'retrying') return 'retrying'
    if (job.status === 'failed') return 'needs_retry'
    if (job.status === 'completed') return 'completed'
    return 'processing'
  }
  const visibleJobs = statusFilter === 'all' ? jobs : jobs.filter((job) => displayStatusForJob(job) === statusFilter)
  const completedCount = jobs.filter((job) => displayStatusForJob(job) === 'completed').length
  const needsRetryCount = jobs.filter((job) => displayStatusForJob(job) === 'needs_retry').length
  const recoveredCount = jobs.filter((job) => displayStatusForJob(job) === 'recovered').length
  const retryingCount = jobs.filter((job) => displayStatusForJob(job) === 'retrying').length
  const processingCount = jobs.filter((job) => displayStatusForJob(job) === 'processing').length
  const filterOptionsRaw: Array<{ key: 'all' | RetryDisplayStatus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'needs_retry', label: 'Needs retry', count: needsRetryCount },
    { key: 'recovered', label: 'Recovered', count: recoveredCount },
    { key: 'retrying', label: 'Retrying', count: retryingCount },
    { key: 'processing', label: 'Processing', count: processingCount },
  ]
  const filterOptions = filterOptionsRaw.filter((filter) => (
    (filter.key !== 'retrying' && filter.key !== 'processing') || filter.count > 0
  ))

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">My Knowledge Jobs</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Track multiple ingestion runs and retry failed artifact batches.</p>
          </div>
          <StatusFilterSelect
            label="Status"
            value={statusFilter}
            options={filterOptions}
            onChange={setStatusFilter}
            ariaLabel="Filter knowledge jobs by status"
            className="sm:justify-self-end"
          />
        </div>
      </div>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-4">
        {visibleJobs.length ? visibleJobs.map((job) => {
          const retryState = knowledgeJobRetryState(job, artifacts, jobs, latestAttempts)
          const canRetry = retryState === 'actionable'
          const displayStatus = displayStatusForJob(job)
          const badgeTone: StatusTone = displayStatus === 'recovered' || displayStatus === 'completed' ? 'success' : displayStatus === 'needs_retry' ? 'error' : 'info'
          const recoveredByJobId = retryState === 'recovered' ? findRecoveredRetryJobId(job, jobs) : null
          const latestRetryId = latestRetryJobId(job, jobs)
          const relatedArtifacts = usageArtifactRecordsForKnowledgeJob(job, artifacts)
          const analyticsJob = analyticsJobForKnowledgeJob(job, analyticsJobs)
          const statusLabel =
            displayStatus === 'completed' ? 'Completed' :
            displayStatus === 'needs_retry' ? 'Needs retry' :
            displayStatus === 'retrying' ? 'Retry in progress' :
            displayStatus === 'recovered' ? 'Recovered' :
            displayStatus === 'processing' ? 'Processing' :
            displayStatus
          return (
            <div key={job.jobId || job.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm font-bold text-on-surface">{job.jobId || job.id}</p>
                  <p className="mt-1 truncate text-sm text-on-surface-variant" title={job.fileName || job.fileKey || 'Knowledge base ingestion'}>{job.fileName || job.fileKey || 'Knowledge base ingestion'}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{job.projectName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <DocumentJobStatusIcon status={displayStatus} tone={badgeTone} label={statusLabel} />
                  {hasIngestionUsage(job, analyticsJob, relatedArtifacts) ? <IngestionUsageButton job={job} analyticsJob={analyticsJob} artifactRecords={relatedArtifacts} label={job.status === 'failed' ? 'Usage recorded before failure' : 'View ingestion usage'} /> : null}
                  {canRetry ? (
                    <button
                      type="button"
                      onClick={() => void onRetry(job)}
                      title="Reprocess"
                      aria-label="Reprocess"
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-error bg-error/10 text-error shadow-sm hover:bg-error/20 ${iconButtonPressClasses}`}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-on-surface-variant">
                {job.processingClass ? <span>Class: {job.processingClass}</span> : null}
                <span>Started: {formatTime(job.createdAt)}</span>
                {job.extractionWarningCount ? <span className="font-bold text-warning">Warnings: {job.extractionWarningCount}</span> : null}
                {job.retriedByJobIds?.length && retryState !== 'recovered' ? <span>Next retry: {job.retriedByJobIds.join(', ')}</span> : null}
              </div>
              <ExtractionWarningsInline warnings={job.extractionWarnings} count={job.extractionWarningCount} />
              {retryState === 'recovered' ? (
                <p className="mt-3 text-sm font-medium text-success">
                  {recoveredByJobId ? `Recovered by retry ${recoveredByJobId}.` : 'Recovered by a later successful retry.'} No action needed.
                </p>
              ) : retryState === 'retrying' ? (
                <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  A retry is already in progress{latestRetryId ? `: ${latestRetryId}` : ''}.
                </p>
              ) : retryState === 'superseded' ? (
                <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                  This failed attempt was moved to a newer retry{latestRetryId ? `: ${latestRetryId}` : ''}. Check the latest attempt for the current status.
                </p>
              ) : job.error ? <p className="mt-3 text-sm text-on-surface-variant">{job.error}</p> : null}
            </div>
          )
        }) : (
          <p className="rounded-lg border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">No {statusFilter} knowledge jobs to show.</p>
        )}
      </div>
    </section>
  )
}

function StatusFilterSelect({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: {
  label: string
  value: 'all' | RetryDisplayStatus
  options: Array<{ key: 'all' | RetryDisplayStatus; label: string; count: number }>
  onChange: (value: 'all' | RetryDisplayStatus) => void
  ariaLabel: string
  className?: string
}) {
  return (
    <label className={`w-full min-w-[11rem] space-y-1.5 ${className}`}>
      <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as 'all' | RetryDisplayStatus)}
        className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-on-surface outline-none focus:border-primary"
        aria-label={ariaLabel}
      >
        {options.map((filter) => (
          <option key={filter.key} value={filter.key}>{filter.label} ({filter.count})</option>
        ))}
      </select>
    </label>
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

function extractionMetricsForArtifact(record: ArtifactRecord, jobs: KnowledgeJobRecord[], latestAttempts: Map<string, ArtifactRecord>) {
  const latest = latestAttempts.get(artifactRetryKey(record))
  const candidateRecords = [record, latest].filter(Boolean) as ArtifactRecord[]
  const candidateJobIds = new Set(candidateRecords.flatMap((item) => [item.jobId, item.id, artifactSourceJobId(item)]).filter(Boolean))
  const matchingJobs = jobs
    .filter((job) => {
      if (job.jobId && candidateJobIds.has(job.jobId)) return true
      if (candidateJobIds.has(job.id)) return true
      return job.projectName.trim().toLowerCase() === record.projectName.trim().toLowerCase()
        && String(job.fileName || '').trim().toLowerCase() === record.fileName.trim().toLowerCase()
    })
    .sort((left, right) => {
      const leftTerminal = left.status === 'completed' ? 1 : 0
      const rightTerminal = right.status === 'completed' ? 1 : 0
      if (leftTerminal !== rightTerminal) return rightTerminal - leftTerminal
      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    })
  const job = matchingJobs[0] || null
  return job?.extractionMetrics ? { job, metrics: job.extractionMetrics } : { job, metrics: record.extractionMetrics || null }
}

function ArtifactActionButtons({
  record,
  canReprocess,
  retryLabel,
  onDetails,
  onReprocess,
  nowrap = false,
}: {
  record: ArtifactRecord
  canReprocess: boolean
  retryLabel: string
  onDetails: () => void
  onReprocess: () => void
  nowrap?: boolean
}) {
  return (
    <div className={`flex justify-end gap-2 ${nowrap ? 'flex-nowrap' : 'flex-wrap'}`}>
      <button
        type="button"
        onClick={onDetails}
        title="Extraction details"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      >
        <FileSearch className="h-4 w-4" />
      </button>
      {record.url ? (
        <a href={record.url} target="_blank" rel="noopener noreferrer" title="Preview artifact" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
          <Eye className="h-4 w-4" />
        </a>
      ) : (
        <button title="Preview unavailable" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant opacity-50" disabled>
          <Eye className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onReprocess}
        disabled={!canReprocess}
        title={canReprocess ? 'Retry processing for this failed artifact' : retryLabel || 'Only the latest failed attempt can be retried'}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  )
}

function ArtifactsRepository({
  records,
  jobs,
  refreshing,
  onRefresh,
  onUpload,
  onReprocess,
}: {
  records: ArtifactRecord[]
  jobs: KnowledgeJobRecord[]
  refreshing: boolean
  onRefresh: () => void
  onUpload: () => void
  onReprocess: (artifactId: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | ArtifactDisplayStatus>('all')
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const latestAttempts = buildArtifactLatestAttemptMap(records)
  const summary = artifactRetrySummary(records)
  const visibleRecords = statusFilter === 'all' ? records : records.filter((record) => artifactDisplayStatus(record, latestAttempts) === statusFilter)
  const selectedArtifact = selectedArtifactId ? records.find((record) => record.id === selectedArtifactId) || null : null
  const selectedExtraction = selectedArtifact ? extractionMetricsForArtifact(selectedArtifact, jobs, latestAttempts) : { job: null, metrics: null }
  const filterOptionsRaw: Array<{ key: 'all' | ArtifactDisplayStatus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: records.length },
    { key: 'processed', label: 'Processed', count: summary.processed },
    { key: 'needs_retry', label: 'Needs retry', count: summary.needsRetry },
    { key: 'recovered', label: 'Recovered', count: summary.recovered },
    { key: 'processing', label: 'Processing', count: summary.processing },
    { key: 'retrying', label: 'Retrying', count: summary.retrying },
  ]
  const filterOptions = filterOptionsRaw.filter((filter) => (filter.key !== 'processing' && filter.key !== 'retrying') || filter.count > 0)
  return (
    <section className="flex min-h-0 flex-col gap-4">
      <section className="shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Artifact repository</p>
            <h3 className="mt-1 text-xl font-semibold text-on-surface">Manage Uploaded Artifacts</h3>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-on-surface-variant">
              Review uploaded files, monitor processing status, and retry failed artifacts.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total artifacts" value={records.length} tag="My projects" />
        <MetricCard label="Total processed" value={summary.processed} tone="success" />
        <MetricCard label="Needs retry" value={summary.needsRetry} tone="error" />
        <MetricCard label="Total recovered" value={summary.recovered} tone="success" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant p-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">Uploaded Artifacts</h3>
          </div>
          <div className="flex w-full min-w-0 items-center justify-start sm:w-auto sm:justify-end">
            <div className="flex w-full max-w-full flex-wrap gap-1 rounded-md border border-outline-variant bg-surface-container-lowest p-0.5 shadow-sm sm:w-auto">
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
          <>
          <div className="max-h-[calc(100dvh-24rem)] space-y-3 overflow-y-auto p-3 md:hidden">
            {visibleRecords.map((record) => {
              const retryState = artifactRetryState(record, latestAttempts)
              const canReprocess = retryState === 'actionable'
              const retryLabel = retryStateLabel(retryState)
              const displayStatus = artifactDisplayStatus(record, latestAttempts)
              const displayTone: StatusTone = displayStatus === 'recovered' || displayStatus === 'processed' ? 'success' : displayStatus === 'needs_retry' ? 'error' : 'info'
              const displayLabel =
                displayStatus === 'needs_retry' ? 'Needs retry' :
                displayStatus === 'retrying' ? 'Retry in progress' :
                displayStatus
              return (
                <article key={record.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-on-surface [overflow-wrap:anywhere]" title={record.fileName}>{record.fileName}</p>
                      <p className="mt-1 break-all text-xs text-on-surface-variant">Artifact ID: {record.id}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={displayTone} label={displayLabel} uppercase />
                    </div>
                  </div>
                  <dl className="mt-3 grid gap-2 text-xs text-on-surface-variant sm:grid-cols-2">
                    <div>
                      <dt className="font-bold uppercase tracking-wide">Type</dt>
                      <dd className="mt-0.5 text-on-surface">{record.type}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide">Uploaded</dt>
                      <dd className="mt-0.5 text-on-surface">{formatTime(record.uploadedAt)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-bold uppercase tracking-wide">Project</dt>
                      <dd className="mt-0.5 break-words text-on-surface [overflow-wrap:anywhere]">{record.projectName}</dd>
                    </div>
                  </dl>
                  {retryLabel && retryState !== 'recovered' ? <div className="mt-3"><StatusBadge status={retryStateTone(retryState)} label={retryLabel} /></div> : null}
                  <div className="mt-3 flex justify-end">
                    <ArtifactActionButtons
                      record={record}
                      canReprocess={canReprocess}
                      retryLabel={retryLabel}
                      onDetails={() => setSelectedArtifactId(record.id)}
                      onReprocess={() => onReprocess(record.id)}
                    />
                  </div>
                </article>
              )
            })}
            {!visibleRecords.length ? <p className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">No artifacts match the selected status.</p> : null}
          </div>
          <div className="hidden max-h-[calc(100dvh-24rem)] min-h-0 flex-1 overflow-auto md:block">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[10%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
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
                  const retryState = artifactRetryState(record, latestAttempts)
                  const canReprocess = retryState === 'actionable'
                  const retryLabel = retryStateLabel(retryState)
                  const displayStatus = artifactDisplayStatus(record, latestAttempts)
                  const displayTone: StatusTone = displayStatus === 'recovered' || displayStatus === 'processed' ? 'success' : displayStatus === 'needs_retry' ? 'error' : 'info'
                  const displayLabel =
                    displayStatus === 'needs_retry' ? 'Needs retry' :
                    displayStatus === 'retrying' ? 'Retry in progress' :
                    displayStatus
                  return (
                    <tr key={record.id} className="align-top">
                      <td className="p-4 text-left">
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-on-surface [overflow-wrap:anywhere]" title={record.fileName}>{record.fileName}</p>
                          <p className="mt-1 break-all text-xs text-on-surface-variant">Artifact ID: {record.id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-left text-on-surface-variant">{record.type}</td>
                      <td className="p-4 text-left text-on-surface-variant">{record.projectName}</td>
                      <td className="whitespace-nowrap p-4 text-left text-on-surface-variant">{formatTime(record.uploadedAt)}</td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <StatusBadge status={displayTone} label={displayLabel} uppercase />
                          {retryLabel && retryState !== 'recovered' ? <StatusBadge status={retryStateTone(retryState)} label={retryLabel} /> : null}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <ArtifactActionButtons
                          record={record}
                          canReprocess={canReprocess}
                          retryLabel={retryLabel}
                          onDetails={() => setSelectedArtifactId(record.id)}
                          onReprocess={() => onReprocess(record.id)}
                          nowrap
                        />
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
          </>
        ) : (
        <EmptyState icon={Archive} title="No artifacts uploaded yet" text="Start by creating a project or opening Knowledge Base ingestion." action="Create Knowledge Base" onAction={onUpload} />
        )}
      </div>
      {selectedArtifact ? (
        <ExtractionDetailsDrawer
          record={selectedArtifact}
          job={selectedExtraction.job}
          metrics={selectedExtraction.metrics}
          retryState={artifactRetryState(selectedArtifact, latestAttempts)}
          onClose={() => setSelectedArtifactId(null)}
        />
      ) : null}
    </section>
  )
}

function analyticsTerminalRank(job: AnalyticsSummary['recentJobs'][number]) {
  const event = String(job.event || '').toUpperCase()
  const status = String(job.status || '').toLowerCase()
  if (event === 'JOB_COMPLETED' || event === 'JOB_COMPLETED_WITH_WARNINGS' || status === 'completed' || status === 'success' || status === 'info') return 5
  if (event === 'JOB_FAILED' || status === 'failed' || status === 'error') return 4
  if (event === 'QUALITY_GATE_FAILED') return 3
  return 1
}

function dedupeAnalyticsJobs(jobs: AnalyticsSummary['recentJobs']) {
  const byJob = new Map<string, AnalyticsSummary['recentJobs'][number]>()
  jobs.forEach((job) => {
    const key = `${job.pipeline || 'generation'}|${job.jobId || job.createdAt || `${job.event || 'event'}-${job.status || 'status'}`}`
    const existing = byJob.get(key)
    const rank = analyticsTerminalRank(job)
    const existingRank = existing ? analyticsTerminalRank(existing) : -1
    const isNewer = String(job.createdAt || '') > String(existing?.createdAt || '')
    if (!existing || rank > existingRank || (rank === existingRank && isNewer)) {
      byJob.set(key, job)
    }
  })
  return Array.from(byJob.values()).sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
}

function completedAnalyticsJob(job: AnalyticsSummary['recentJobs'][number]) {
  const status = String(job.status || '').toLowerCase()
  const event = String(job.event || '').toUpperCase()
  return event === 'JOB_COMPLETED' || event === 'JOB_COMPLETED_WITH_WARNINGS' || status === 'completed' || status === 'success' || status === 'info'
}

function ExtractionDetailsDrawer({
  record,
  job,
  metrics,
  retryState,
  onClose,
}: {
  record: ArtifactRecord
  job: KnowledgeJobRecord | null
  metrics: ExtractionMetrics | null
  retryState: ArtifactRetryState
  onClose: () => void
}) {
  const detailJobId = job?.jobId || artifactSourceJobId(record)
  const [loadedPatch, setLoadedPatch] = useState<ReturnType<typeof extractionObservabilityFromOutput> | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const displayMetrics = loadedPatch?.extractionMetrics || metrics
  const displayWarnings = loadedPatch?.extractionWarnings || job?.extractionWarnings || record.extractionWarnings || []
  const displayWarningCount = loadedPatch?.extractionWarningCount ?? job?.extractionWarningCount ?? record.extractionWarningCount ?? displayMetrics?.warnings ?? 0

  useEffect(() => {
    let cancelled = false
    const needsTelemetry = !displayMetrics || (
      !displayMetrics.chunks &&
      !displayMetrics.words &&
      !displayMetrics.tokens &&
      !displayMetrics.tables &&
      !displayMetrics.annotations &&
      !displayMetrics.links
    )
    if (!detailJobId || loadedPatch || !needsTelemetry) return undefined
    setLoadingDetails(true)
    fetchKbStatus(detailJobId)
      .then((data) => {
        if (cancelled || !data) return
        setLoadedPatch(extractionObservabilityFromOutput(data.output ?? data))
      })
      .catch(() => {
        if (!cancelled) setLoadedPatch(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false)
      })
    return () => {
      cancelled = true
    }
  }, [detailJobId, displayMetrics, loadedPatch])

  const statusLabel = retryState === 'recovered'
    ? 'Recovered'
    : record.status === 'processed'
      ? 'Completed'
      : record.status === 'failed'
        ? 'Needs retry'
        : 'Processing'
  const statusTone: StatusTone = retryState === 'recovered' || record.status === 'processed' ? 'success' : record.status === 'failed' ? 'error' : 'info'
  const fileType = displayMetrics?.fileType || record.fileName.split('.').pop() || '-'
  const docType = displayMetrics?.docType || record.type || '-'
  const fileSizeLabel = displayMetrics?.fileSizeBytes ? fileSize(displayMetrics.fileSizeBytes) : fileSize(record.size || 0)
  const durationLabel = displayMetrics?.durationMs ? formatDuration(displayMetrics.durationMs) : '-'
  const responseSizeLabel = displayMetrics?.responseBytesEstimated ? fileSize(displayMetrics.responseBytesEstimated) : '-'
  const visualCandidateLabel = displayMetrics ? formatCompactNumber(displayMetrics.visualCandidates) : '-'
  const normalizedDocType = String(docType || '').toLowerCase()
  const normalizedFileType = String(fileType || '').toLowerCase()
  const artifactType = String(record.type || '').toLowerCase()
  const isImageArtifact = artifactType.includes('ui') || artifactType.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'image'].includes(normalizedFileType)
  const isTextArtifact = ['txt', 'md', 'markdown', 'csv', 'log', 'text'].includes(normalizedFileType) || ['supporting', 'transcript', 'api_spec'].some((type) => normalizedDocType.includes(type))
  const isStructuredDocument = !isImageArtifact && !isTextArtifact
  const tableCount = Number(displayMetrics?.tables || 0)
  const annotationCount = Number(displayMetrics?.annotations || 0)
  const linkCount = Number(displayMetrics?.links || 0)
  const visualCandidateCount = Number(displayMetrics?.visualCandidates || 0)
  const structuredContentCount = tableCount + annotationCount + linkCount
  const headlineMetrics = [
    { label: 'Chunks', value: displayMetrics ? formatCompactNumber(displayMetrics.chunks) : '-', detail: 'stored', icon: Database },
    { label: 'Words', value: displayMetrics ? formatCompactNumber(displayMetrics.words) : '-', detail: 'extracted', icon: FileText },
    { label: 'Tokens', value: displayMetrics ? formatCompactNumber(displayMetrics.tokens) : '-', detail: 'estimated', icon: Cpu },
    { label: 'Cost', value: displayMetrics ? formatUsageCurrency(displayMetrics.costUsd, 4) : '-', detail: 'estimated', icon: BarChart3, mono: true },
  ]
  const profileRows = isImageArtifact
    ? [
        { label: 'Artifact family', value: 'Visual/UI evidence' },
        { label: 'Vision candidate', value: visualCandidateCount ? 'Detected' : 'Not detected' },
        { label: 'Text extracted', value: Number(displayMetrics?.words || 0) ? 'Yes' : 'No' },
        { label: 'Structured content', value: structuredContentCount ? 'Detected' : 'Not expected' },
      ]
    : isTextArtifact
      ? [
          { label: 'Artifact family', value: 'Text/supporting evidence' },
          { label: 'Text extracted', value: Number(displayMetrics?.words || 0) ? 'Yes' : 'No' },
          { label: 'Structured content', value: structuredContentCount ? 'Detected' : 'None detected' },
          { label: 'Visual processing', value: visualCandidateCount ? 'Candidate detected' : 'Not applicable' },
        ]
      : [
          { label: 'Artifact family', value: 'Project document' },
          { label: 'Text extracted', value: Number(displayMetrics?.words || 0) ? 'Yes' : 'No' },
          { label: 'Structured content', value: structuredContentCount ? 'Detected' : 'None detected' },
          { label: 'Visual processing', value: visualCandidateCount ? 'Candidate detected' : 'No candidates' },
        ]
  const visibleContentSignals = [
    { label: 'Tables', value: tableCount, icon: FileSearch },
    { label: 'Annotations', value: annotationCount, icon: FileText },
    { label: 'Links', value: linkCount, icon: Network },
    { label: 'Visual candidates', value: visualCandidateCount, icon: ScanSearch },
    { label: 'Warnings', value: Number(displayWarningCount || 0), icon: AlertTriangle, tone: 'warning' },
  ].filter((signal) => signal.value > 0 || (isStructuredDocument && signal.label !== 'Warnings'))
  const zeroContentLabels = [
    !tableCount ? 'tables' : '',
    !annotationCount ? 'annotations' : '',
    !linkCount ? 'links' : '',
    !visualCandidateCount && !isTextArtifact ? 'visual candidates' : '',
    !displayWarningCount ? 'warnings' : '',
  ].filter(Boolean)
  const auditRows = [
    { label: 'Artifact ID', value: record.id },
    { label: 'Source job ID', value: artifactSourceJobId(record) || '-' },
    { label: 'Uploaded', value: formatTime(record.uploadedAt) },
    { label: 'Original file name', value: displayMetrics?.fileName || record.fileName },
  ]
  const visualCandidatesHelp = (
    <span className="group relative inline-flex" aria-label="Visual candidates info">
      <HelpCircle className="h-3.5 w-3.5 text-on-surface-variant" />
      <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 hidden w-64 max-w-[calc(100vw-3rem)] whitespace-normal rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-left text-xs font-medium normal-case leading-5 tracking-normal text-on-surface shadow-lg group-hover:block">
        Visual candidates are images discovered inside compound files like PDF, DOCX, and PPTX for vision review. A value of 0 on image files does not mean image extraction was skipped.
      </span>
    </span>
  )
  return (
    <ModalFrame title="Extraction Details" onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="bg-surface-container-low p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                statusTone === 'success' ? 'border-success/25 bg-success/10 text-success' :
                statusTone === 'error' ? 'border-error/25 bg-error/10 text-error' :
                'border-primary/25 bg-primary/10 text-primary'
              }`}>
                {statusTone === 'success' ? <CheckCircle2 className="h-5 w-5" /> : statusTone === 'error' ? <AlertTriangle className="h-5 w-5" /> : <FileSearch className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Extraction details</p>
                <h3 className="mt-1 break-words text-lg font-bold leading-6 text-on-surface">{record.fileName}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{record.projectName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge status={statusTone} label={statusLabel} uppercase />
                  <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{docType}</span>
                  <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{fileType}</span>
                  <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-semibold text-on-surface-variant">Size {fileSizeLabel}</span>
                  <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-semibold text-on-surface-variant">Uploaded {formatTime(record.uploadedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-4">
            {headlineMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{metric.label}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase text-primary">{metric.detail}</p>
                  </div>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant">
                    <metric.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className={`mt-3 text-2xl font-bold leading-none text-on-surface ${metric.mono ? 'font-mono text-lg' : ''}`}>{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
        {loadingDetails ? (
          <StatusNotice status="info" message="Loading extraction telemetry from the completed ingestion job." />
        ) : null}
        {!displayMetrics && !loadingDetails ? (
          <StatusNotice status="warning" message="Extraction counts are not available for this artifact yet. They will appear after the ingestion job returns observability metadata." />
        ) : null}
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Extraction Profile</h4>
              <p className="mt-1 text-sm text-on-surface-variant">
                {isImageArtifact
                  ? 'Visual extraction summary for an uploaded UI or image artifact.'
                  : isTextArtifact
                    ? 'Text-first extraction summary for supporting files and transcripts.'
                    : 'Document extraction summary for source requirements and design files.'}
              </p>
            </div>
            <span className="rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
              {docType} / {fileType}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {profileRows.map((row) => (
              <div key={row.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{row.label}</p>
                <p className="mt-2 text-sm font-bold leading-5 text-on-surface">{row.value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Extracted Content</h4>
              <p className="mt-1 text-sm text-on-surface-variant">
                {structuredContentCount || visualCandidateCount || displayWarningCount
                  ? 'Only detected content signals are emphasized. Warnings are always shown when present.'
                  : 'No tables, annotations, links, warnings, or visual candidates were detected for this artifact.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-semibold text-on-surface-variant">
              <Clock className="h-3.5 w-3.5" />
              {durationLabel}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {visibleContentSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <div className="flex min-h-8 items-start justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{signal.label}</p>
                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    signal.tone === 'warning' ? 'bg-warning/10 text-warning' :
                    signal.tone === 'success' ? 'bg-success/10 text-success' :
                    'bg-surface-container-lowest text-on-surface-variant'
                  }`}>
                    <signal.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold leading-none text-on-surface">{formatCompactNumber(signal.value)}</p>
              </div>
            ))}
          </div>
          {zeroContentLabels.length && (structuredContentCount || visualCandidateCount || displayWarningCount) ? (
            <p className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs leading-5 text-on-surface-variant">
              Not detected: {zeroContentLabels.join(', ')}.
            </p>
          ) : null}
        </section>
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Processing and Cost</h4>
              <p className="mt-1 text-sm text-on-surface-variant">Runtime, response size, and visual candidate telemetry for this extraction run.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Extractor time</p>
            <p className="mt-2 text-xl font-bold text-on-surface">{durationLabel}</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Response size</p>
            <p className="mt-2 text-xl font-bold text-on-surface">{responseSizeLabel}</p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Visual candidates {visualCandidatesHelp}
            </p>
            <p className="mt-2 text-xl font-bold text-on-surface">{visualCandidateLabel}</p>
          </div>
          </div>
        </section>
        {displayWarnings.length || displayWarningCount ? (
          <section className="rounded-xl border border-warning/30 bg-warning/10 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-warning">Warnings</h4>
            <ExtractionWarningsInline warnings={displayWarnings} count={displayWarningCount} />
          </section>
        ) : null}
        <details className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Audit identifiers
          </summary>
          <div className="border-t border-outline-variant px-4 py-3">
            <UsageDetailList title="Source Details" rows={auditRows} />
          </div>
        </details>
        <UsageEstimateNote>
          Extraction details are sourced from ingestion telemetry and artifact metadata. Counts may update when completed job observability is refreshed.
        </UsageEstimateNote>
      </div>
    </ModalFrame>
  )
}

function AnalyticsPage({
  analytics,
  loading,
  error,
  pipeline,
  days,
  projectScope,
  setPipeline,
  setDays,
  setProjectScope,
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
  projectScope: string
  setPipeline: (value: string) => void
  setDays: (value: number) => void
  setProjectScope: (value: string) => void
  onRefresh: () => void
  projects: Project[]
  artifacts: ArtifactRecord[]
  outputs: GeneratedOutput[]
  activeJobs: number
  failedJobs: number
}) {
  const [usageCalculation, setUsageCalculation] = useState<AnalyticsUsageCalculation | null>(null)
  const overview = analytics?.overview
  const byDocType = analytics?.byDocumentType ?? []
  const recentJobs = dedupeAnalyticsJobs(analytics?.recentJobs ?? [])
  const ingestion = analytics?.ingestion
  const failuresByPipeline = (analytics?.overview?.totalJobsFailedHistorical ?? analytics?.overview?.totalJobsFailed ?? failedJobs) ? analytics?.failures?.byPipeline ?? [] : []
  const costByPipeline = analytics?.costs?.byPipeline ?? []
  const costByProject = analytics?.costs?.byProject ?? []
  const filesByKnowledgeBase = ingestion?.filesByKnowledgeBase ?? []
  const generationJobs = recentJobs.filter((job) => String(job.pipeline || 'generation') !== 'ingestion')
  const ingestionJobs = recentJobs.filter((job) => String(job.pipeline || '') === 'ingestion')
  const generationCompleted = overview?.totalDocumentsGenerated ?? outputs.length
  const ingestionCompleted = ingestion?.jobsCompleted ?? overview?.totalIngestionJobsCompleted ?? 0
  const completedWorkload = Math.max(overview?.totalJobsCompleted ?? 0, generationCompleted + ingestionCompleted, outputs.length)
  const artifactSummary = artifactRetrySummary(artifacts)
  const recoveredDocuments = outputs.filter((job) => generationDisplayStatus(job, outputs) === 'recovered').length
  const recoveredJobs = Number(overview?.totalJobsRecovered) || artifactSummary.recovered + recoveredDocuments
  const historicalFailures = Number(overview?.totalJobsFailedHistorical ?? overview?.totalJobsFailed ?? 0) || failedJobs
  const totalFailures = failedJobs
  const successRate = completedWorkload + totalFailures ? clampPercent(Math.round((completedWorkload / (completedWorkload + totalFailures)) * 100)) : 0
  const totalTokens = overview?.totalTokensConsumed ?? 0
  const totalCost = overview?.totalCostUsd ?? 0
  const generationCostBucket = costByPipeline.find((item) => String(item.pipeline || '').toLowerCase() === 'generation')
  const ingestionCostBucket = costByPipeline.find((item) => String(item.pipeline || '').toLowerCase() === 'ingestion')
  const completedIngestionJobs = ingestionJobs.filter((job) => {
    const status = String(job.status || '').toLowerCase()
    return status === 'completed' || status === 'success' || status === 'info'
  })
  const ingestionTokens = Number(ingestion?.tokensTotal) || completedIngestionJobs.reduce((sum, job) => sum + Number(job.tokensTotal || 0), 0) || Number(ingestionCostBucket?.tokensTotal) || 0
  const ingestionCost = Number(ingestion?.estimatedCostUsd) || completedIngestionJobs.reduce((sum, job) => sum + Number(job.estimatedCostUsd || 0), 0) || Number(ingestionCostBucket?.estimatedCostUsd) || 0
  const completedGenerationTokensFromDocTypes = byDocType.reduce((sum, item) => sum + Number(item.tokensTotal || item.tokens_total || 0), 0)
  const completedGenerationCostFromDocTypes = byDocType.reduce((sum, item) => sum + Number(item.estimatedCostUsd || item.estimated_cost_usd || 0), 0)
  const completedGenerationJobs = generationJobs.filter(completedAnalyticsJob)
  const generationTokens = completedGenerationTokensFromDocTypes || completedGenerationJobs.reduce((sum, job) => sum + Number(job.tokensTotal || 0), 0)
  const generationCost = completedGenerationCostFromDocTypes || completedGenerationJobs.reduce((sum, job) => sum + Number(job.estimatedCostUsd || 0), 0)
  const failedGenerationSpend = analytics?.failedSpend?.generation
  const failedGenerationJobs = generationJobs.filter((job) => {
    const status = String(job.status || '').toLowerCase()
    return status === 'failed' || status === 'error' || job.event === 'JOB_FAILED' || job.event === 'QUALITY_GATE_FAILED'
  })
  const failedGenerationAttempts = Number(failedGenerationSpend?.attempts) || failedGenerationJobs.length
  const failedGenerationWords = Number(failedGenerationSpend?.wordCount) || failedGenerationJobs.reduce((sum, job) => sum + Number(job.wordCount || 0), 0)
  const failedGenerationTokens = Number(failedGenerationSpend?.tokensTotal) || failedGenerationJobs.reduce((sum, job) => sum + Number(job.tokensTotal || 0), 0)
  const failedGenerationCost = Number(failedGenerationSpend?.estimatedCostUsd) || failedGenerationJobs.reduce((sum, job) => sum + Number(job.estimatedCostUsd || 0), 0)
  const failedGenerationDurationSamples = failedGenerationJobs
    .map((job) => Number(job.durationMs || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
  const failedGenerationAvgDuration = Number(failedGenerationSpend?.avgDurationMs) || (
    failedGenerationDurationSamples.length
      ? failedGenerationDurationSamples.reduce((sum, value) => sum + value, 0) / failedGenerationDurationSamples.length
      : 0
  )
  const failedIngestionSpend = analytics?.failedSpend?.ingestion
  const failedIngestionJobs = ingestionJobs.filter((job) => {
    const status = String(job.status || '').toLowerCase()
    return status === 'failed' || status === 'error' || job.event === 'JOB_FAILED'
  })
  const failedIngestionAttempts = Number(failedIngestionSpend?.attempts) || failedIngestionJobs.length
  const failedIngestionFiles = Number(failedIngestionSpend?.filesAttempted) || failedIngestionJobs.reduce((sum, job) => sum + Number(job.totalFiles || 0), 0)
  const failedIngestionChunks = Number(failedIngestionSpend?.chunksCreated) || failedIngestionJobs.reduce((sum, job) => sum + Number(job.chunkCount || 0), 0)
  const failedIngestionWords = Number(failedIngestionSpend?.wordCount) || failedIngestionJobs.reduce((sum, job) => sum + Number(job.wordCount || 0), 0)
  const failedIngestionTokens = Number(failedIngestionSpend?.tokensTotal) || failedIngestionJobs.reduce((sum, job) => sum + Number(job.tokensTotal || 0), 0)
  const failedIngestionCost = Number(failedIngestionSpend?.estimatedCostUsd) || failedIngestionJobs.reduce((sum, job) => sum + Number(job.estimatedCostUsd || 0), 0)
  const failedIngestionDurationSamples = failedIngestionJobs
    .map((job) => Number(job.durationMs || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
  const failedIngestionAvgDuration = Number(failedIngestionSpend?.avgDurationMs) || (
    failedIngestionDurationSamples.length
      ? failedIngestionDurationSamples.reduce((sum, value) => sum + value, 0) / failedIngestionDurationSamples.length
      : 0
  )
  const generatedWordsFromDocTypes = byDocType.reduce((sum, item) => sum + Number(item.wordCount || item.word_count || item.totalWords || item.total_words || item.words || 0), 0)
  const generatedWordsFromRecentJobs = completedGenerationJobs.reduce((sum, job) => sum + Number(job.wordCount || 0), 0)
  const generatedWordsFromOutputs = outputs.reduce((sum, output) => sum + Number(output.output?.wordCount || output.output?.word_count || output.output?.words || 0), 0)
  const generationWords = generatedWordsFromDocTypes || generatedWordsFromRecentJobs || generatedWordsFromOutputs
  const generationJobsCompleted = Number(generationCostBucket?.jobs) || generationJobs.filter((job) => String(job.status || '').toLowerCase() === 'completed').length || generationCompleted
  const generationDurationSamples = completedGenerationJobs
    .map((job) => Number(job.durationMs || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
  const avgGenerationDuration = Number(overview?.avgGenerationDurationMs) || (generationDurationSamples.length
    ? generationDurationSamples.reduce((sum, value) => sum + value, 0) / generationDurationSamples.length
    : 0)
  const avgCostPerDocument = overview?.avgCostPerDocument ?? (generationCompleted ? totalCost / generationCompleted : 0)
  const chunksIngested = ingestion?.totalChunksIngested ?? overview?.totalChunksIngested ?? 0
  const wordsProcessed = ingestion?.totalWordsProcessed ?? overview?.totalWordsProcessed ?? 0
  const filesProcessed = ingestion?.totalFilesProcessed ?? overview?.totalFilesProcessed ?? 0
  const avgIngestionDuration = ingestion?.avgProcessingDurationMs ?? overview?.avgIngestionDurationMs ?? overview?.avgDurationMs ?? 0
  const generationShare = completedWorkload ? clampPercent((generationCompleted / completedWorkload) * 100) : 0
  const ingestionShare = completedWorkload ? clampPercent((ingestionCompleted / completedWorkload) * 100) : 0
  const activityTrend = buildAnalyticsTrend(recentJobs, artifacts)
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
  const updateSummaries = outputs
    .map((output) => outputUpdateSummary(output.output, output))
    .filter((summary): summary is NonNullable<ReturnType<typeof outputUpdateSummary>> => Boolean(summary))
  const tokensSaved = updateSummaries.reduce((sum, summary) => sum + Number(summary.estimatedTokensSaved || 0), 0)
  const estimatedCostSaved = tokensSaved && totalTokens ? tokensSaved * (totalCost / totalTokens) : 0
  const coverageRollup = outputs.reduce((summary, output) => {
    const coverage = coverageSummaryFrom(output.output)
    const verdict = coverageVerdict(coverage)
    if (!coverage || !verdict.parsed) return summary
    summary.total += 1
    if (verdict.tone === 'success') summary.passed += 1
    else if (verdict.tone === 'error') summary.failed += 1
    else summary.review += 1
    return summary
  }, { total: 0, passed: 0, review: 0, failed: 0 })
  const coverageHealth = coverageRollup.total ? Math.round((coverageRollup.passed / coverageRollup.total) * 100) : 0
  const validationRollup = outputs.reduce((summary, output) => {
    const verdict = finalValidationVerdict(output.output)
    if (!verdict) return summary
    summary.total += 1
    if (verdict.tone === 'success') summary.passed += 1
    else if (verdict.tone === 'error') summary.failed += 1
    else summary.review += 1
    return summary
  }, { total: 0, passed: 0, review: 0, failed: 0 })
  const validationHealth = validationRollup.total ? Math.round((validationRollup.passed / validationRollup.total) * 100) : 0
  const projectAnalyticsRows = buildProjectAnalyticsRows({
    projects,
    recentJobs,
    costByProject,
    filesByKnowledgeBase,
    outputs,
  })
  const documentTypeRows = buildDocumentTypeAnalyticsRows({
    byDocType,
    generationJobs,
    outputs,
  })
  const totalTokenInfo = tokenCalculationInfo('Workspace total', totalTokens, [
    { label: 'Completed generation', value: formatCompactNumber(generationTokens), detail: 'Summed from completed document-generation jobs.' },
    { label: 'Completed ingestion', value: formatCompactNumber(ingestionTokens), detail: 'Embedding plus vision/extraction tokens for completed ingestion jobs.' },
    { label: 'Failed generation attempts', value: formatCompactNumber(failedGenerationTokens), detail: 'Usage recorded before failed generation attempts stopped.' },
    { label: 'Failed ingestion attempts', value: formatCompactNumber(failedIngestionTokens), detail: 'Usage recorded before failed ingestion attempts stopped.' },
  ], 'Workspace token usage is summed from analytics job metrics for the selected date range and project scope.')
  const totalCostInfo = costCalculationInfo('Workspace total', totalCost, [
    { label: 'Completed generation', value: formatCurrency(generationCost, 4), detail: 'Estimated cost for completed document-generation jobs.' },
    { label: 'Completed ingestion', value: formatCurrency(ingestionCost, 4), detail: 'Estimated embedding plus vision/extraction cost for completed ingestion jobs.' },
    { label: 'Failed generation attempts', value: formatCurrency(failedGenerationCost, 4), detail: 'Estimated cost recorded before failed generation attempts stopped.' },
    { label: 'Failed ingestion attempts', value: formatCurrency(failedIngestionCost, 4), detail: 'Estimated cost recorded before failed ingestion attempts stopped.' },
  ], 'Workspace cost is summed from analytics job metrics for the selected date range and project scope.')
  const generationTokenInfo = tokenCalculationInfo('Generation', generationTokens, [
    { label: 'Completed generation tokens', value: formatCompactNumber(generationTokens), detail: `${formatCompactNumber(generationJobsCompleted)} completed generation job${generationJobsCompleted === 1 ? '' : 's'}.` },
  ], 'Generation tokens are summed from completed document-generation jobs. Provider usage is used when available; otherwise Q-Ops uses estimated usage from generated output.')
  const generationCostInfo = costCalculationInfo('Generation', generationCost, [
    { label: 'Completed generation cost', value: formatCurrency(generationCost, 4), detail: `${formatCompactNumber(generationJobsCompleted)} completed generation job${generationJobsCompleted === 1 ? '' : 's'}.` },
  ], 'Generation cost is estimated from recorded token usage for completed document-generation jobs.')
  const ingestionTokenInfo = tokenCalculationInfo('Ingestion', ingestionTokens, [
    { label: 'Completed ingestion tokens', value: formatCompactNumber(ingestionTokens), detail: `${formatCompactNumber(ingestionCompleted)} completed ingestion job${ingestionCompleted === 1 ? '' : 's'}.` },
  ], 'Ingestion token usage is calculated as embedding tokens plus vision/extraction tokens. The detailed per-job split is stored in job metric metadata; Analytics displays the summed pipeline total.')
  const ingestionCostInfo = costCalculationInfo('Ingestion', ingestionCost, [
    { label: 'Completed ingestion cost', value: formatCurrency(ingestionCost, 4), detail: `${formatCompactNumber(ingestionCompleted)} completed ingestion job${ingestionCompleted === 1 ? '' : 's'}.` },
  ], 'Ingestion cost is calculated as embedding cost plus vision/extraction cost. The detailed per-job split is stored in job metric metadata; Analytics displays the summed pipeline total.')
  const failedGenerationTokenInfo = tokenCalculationInfo('Failed generation spend', failedGenerationTokens, [
    { label: 'Failed generation tokens', value: formatCompactNumber(failedGenerationTokens), detail: `${formatCompactNumber(failedGenerationAttempts)} failed attempt${failedGenerationAttempts === 1 ? '' : 's'}.` },
  ], 'Failed generation usage is retained so retry cost and wasted spend remain visible.')
  const failedGenerationCostInfo = costCalculationInfo('Failed generation spend', failedGenerationCost, [
    { label: 'Failed generation cost', value: formatCurrency(failedGenerationCost, 4), detail: `${formatCompactNumber(failedGenerationAttempts)} failed attempt${failedGenerationAttempts === 1 ? '' : 's'}.` },
  ], 'Failed generation cost is recorded before the job stopped, even if a later retry recovered the output.')
  const failedIngestionTokenInfo = tokenCalculationInfo('Failed ingestion spend', failedIngestionTokens, [
    { label: 'Failed ingestion tokens', value: formatCompactNumber(failedIngestionTokens), detail: `${formatCompactNumber(failedIngestionAttempts)} failed attempt${failedIngestionAttempts === 1 ? '' : 's'}.` },
  ], 'Failed ingestion usage is retained so reprocess cost and wasted spend remain visible.')
  const failedIngestionCostInfo = costCalculationInfo('Failed ingestion spend', failedIngestionCost, [
    { label: 'Failed ingestion cost', value: formatCurrency(failedIngestionCost, 4), detail: `${formatCompactNumber(failedIngestionAttempts)} failed attempt${failedIngestionAttempts === 1 ? '' : 's'}.` },
  ], 'Failed ingestion cost is recorded before the job stopped, even if a later reprocess recovered the artifact.')
  const analyticsTone: StatusTone = successRate >= 95 ? 'success' : successRate >= 80 ? 'info' : totalFailures ? 'warning' : 'error'
  const analyticsSummary = analytics
    ? `Showing ${pipeline === 'all' ? 'all pipelines' : pipeline} activity for the last ${days} days. ${completedWorkload} completed jobs, ${totalFailures} need retry, ${recoveredJobs} recovered, and ${activeJobs} currently active.`
    : `Using local workspace activity until the analytics endpoint is available. ${projects.length} projects, ${artifacts.length} artifacts, ${artifactSummary.recovered} recovered, and ${outputs.length} generated outputs are visible in the workspace.`
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div>
          <h3 className="text-lg font-semibold">QA Operations Analytics</h3>
          <p className="text-sm text-on-surface-variant">{analytics ? `Live n8n analytics generated ${formatTime(String(analytics.meta?.generatedAt || ''))}.` : 'Local metrics are shown until /webhook/analytics-summary is available.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={projectScope || 'all'} onChange={(event) => setProjectScope(event.target.value)} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-bold" aria-label="Analytics project scope">
            <option value="all">All assigned projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
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
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operations overview</p>
              <h4 className="mt-2 text-2xl font-semibold text-on-surface">Measurement view for cost, usage, quality, and throughput</h4>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">{analyticsSummary}</p>
            </div>
            <StatusBadge status={analyticsTone} label={analytics ? 'Live analytics' : 'Local fallback'} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <AnalyticsKpiCard
              icon={CheckCircle2}
              title="Completed jobs"
              value={formatCompactNumber(completedWorkload)}
              detail={`Generation ${formatCompactNumber(generationCompleted)} • Ingestion ${formatCompactNumber(ingestionCompleted)}`}
              tone="success"
            />
            <AnalyticsKpiCard
              icon={Gauge}
              title="Success rate"
              value={`${successRate}%`}
              detail={`${formatCompactNumber(totalFailures)} need retry now${historicalFailures > totalFailures ? `, ${formatCompactNumber(historicalFailures)} failed attempts recorded` : ''}`}
              tone={successRate >= 95 ? 'success' : successRate >= 80 ? 'info' : 'warning'}
            />
            <AnalyticsKpiCard
              icon={ShieldCheck}
              title="Coverage health"
              value={coverageRollup.total ? `${coverageHealth}%` : '-'}
              detail={coverageRollup.total ? `${coverageRollup.passed} passed, ${coverageRollup.review + coverageRollup.failed} need review of ${coverageRollup.total} parsed outputs` : 'Awaiting coverage metadata'}
              tone={coverageRollup.total ? (coverageHealth >= 90 ? 'success' : coverageHealth >= 70 ? 'warning' : 'error') : 'info'}
            />
            <AnalyticsKpiCard
              icon={FileSearch}
              title="Doc validation"
              value={validationRollup.total ? `${validationHealth}%` : '-'}
              detail={validationRollup.total ? `${validationRollup.review + validationRollup.failed} need review` : 'Awaiting V9 validation metadata'}
              tone={validationRollup.total ? (validationRollup.failed ? 'error' : validationRollup.review ? 'warning' : 'success') : 'info'}
            />
            <AnalyticsKpiCard
              icon={BarChart3}
              title="Est. spend"
              value={formatCurrency(totalCost, 4)}
              detail={`Avg ${formatCurrency(avgCostPerDocument, 4)} per generated document`}
              tone="info"
              estimated
              usageInfo={totalCostInfo}
              onUsageInfo={setUsageCalculation}
            />
            <AnalyticsKpiCard
              icon={Sparkles}
              title="Cost saved"
              value={estimatedCostSaved ? formatCurrency(estimatedCostSaved, 4) : formatCurrency(0, 4)}
              tone={estimatedCostSaved ? 'success' : 'info'}
            />
          </div>
        </section>
      <AnalyticsProjectPerformanceTable rows={projectAnalyticsRows} emptyText="No project-level analytics are available yet." />
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsPipelinePerformancePanel
          generation={{
            jobs: generationJobsCompleted,
            producedLabel: 'Documents',
            producedValue: generationCompleted,
            wordsLabel: 'Words generated',
            words: generationWords,
            tokens: generationTokens,
            tokenInfo: generationTokenInfo,
            cost: generationCost,
            costInfo: generationCostInfo,
            avgDuration: avgGenerationDuration,
          }}
          ingestion={{
            jobs: ingestionCompleted,
            producedLabel: 'Files',
            producedValue: filesProcessed,
            wordsLabel: 'Words processed',
            words: wordsProcessed,
            chunks: chunksIngested,
            tokens: ingestionTokens,
            tokenInfo: ingestionTokenInfo,
            cost: ingestionCost,
            costInfo: ingestionCostInfo,
            avgDuration: avgIngestionDuration,
          }}
          onUsageInfo={setUsageCalculation}
        />
        <AnalyticsCostFailurePanel
          completedGenerationCost={generationCost}
          completedIngestionCost={ingestionCost}
          failedGeneration={{
            attempts: failedGenerationAttempts,
            wordsOrFilesLabel: 'Words produced',
            wordsOrFilesValue: failedGenerationWords,
            tokens: failedGenerationTokens,
            tokenInfo: failedGenerationTokenInfo,
            cost: failedGenerationCost,
            costInfo: failedGenerationCostInfo,
            avgDuration: failedGenerationAvgDuration,
          }}
          failedIngestion={{
            attempts: failedIngestionAttempts,
            wordsOrFilesLabel: 'Files attempted',
            wordsOrFilesValue: failedIngestionFiles,
            tokens: failedIngestionTokens,
            tokenInfo: failedIngestionTokenInfo,
            cost: failedIngestionCost,
            costInfo: failedIngestionCostInfo,
            avgDuration: failedIngestionAvgDuration,
            secondaryLabel: 'Chunks created',
            secondaryValue: failedIngestionChunks,
          }}
          onUsageInfo={setUsageCalculation}
        />
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
      <AnalyticsDocumentTypeTable rows={documentTypeRows} emptyText="No document-type analytics are available yet." />
      {usageCalculation ? (
        <AnalyticsUsageCalculationModal calculation={usageCalculation} onClose={() => setUsageCalculation(null)} />
      ) : null}
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
  needsRetry: number
  recovered: number
}

type AnalyticsUsageCalculation = {
  title: string
  scope: string
  kind: 'tokens' | 'cost'
  totalLabel: string
  formula: string
  rows: Array<{ label: string; value: string; detail?: string }>
  note: string
}

type AnalyticsProjectPerformanceRow = {
  projectName: string
  jobs: number
  outputs: number
  files: number
  chunks: number
  tokens: number
  cost: number
  failed: number
}

type AnalyticsDocumentTypeRow = {
  documentType: string
  jobs: number
  successRate: number | null
  reliabilityRate: number | null
  recoveredAttempts: number
  failedAttempts: number
  coverageLabel: string
  coverageTone: StatusTone
  avgCost: number
  avgDurationMs: number
  tokens: number
}

function analyticsProjectKey(value?: string | null) {
  return String(value || 'Unknown project').trim().toLowerCase()
}

function ensureProjectRow(map: Map<string, AnalyticsProjectPerformanceRow>, projectName?: string | null) {
  const label = String(projectName || 'Unknown project').trim() || 'Unknown project'
  const key = analyticsProjectKey(label)
  let row = map.get(key)
  if (!row) {
    row = { projectName: label, jobs: 0, outputs: 0, files: 0, chunks: 0, tokens: 0, cost: 0, failed: 0 }
    map.set(key, row)
  }
  return row
}

function buildProjectAnalyticsRows({
  projects,
  recentJobs,
  costByProject,
  filesByKnowledgeBase,
  outputs,
}: {
  projects: Project[]
  recentJobs: AnalyticsSummary['recentJobs']
  costByProject: Array<Record<string, any>>
  filesByKnowledgeBase: Array<Record<string, any>>
  outputs: GeneratedOutput[]
}) {
  const rows = new Map<string, AnalyticsProjectPerformanceRow>()
  projects.forEach((project) => ensureProjectRow(rows, project.name))
  costByProject.forEach((bucket) => {
    const row = ensureProjectRow(rows, bucket.projectName)
    row.jobs += Number(bucket.jobs || 0)
    row.tokens += Number(bucket.tokensTotal || 0)
    row.cost += Number(bucket.estimatedCostUsd || 0)
  })
  filesByKnowledgeBase.forEach((item) => {
    const row = ensureProjectRow(rows, item.projectName)
    row.jobs = Math.max(row.jobs, Number(item.jobs || 0))
    row.files += Number(item.filesProcessed || 0)
    row.chunks += Number(item.chunksIngested || 0)
  })
  outputs.forEach((output) => {
    const row = ensureProjectRow(rows, output.projectName)
    if (String(output.status || '').toLowerCase() === 'completed') row.outputs += 1
  })
  recentJobs.forEach((job) => {
    const row = ensureProjectRow(rows, job.projectName)
    row.jobs += row.jobs ? 0 : 1
    const status = String(job.status || '').toLowerCase()
    if (status === 'failed' || status === 'error' || job.event === 'JOB_FAILED' || job.event === 'QUALITY_GATE_FAILED') row.failed += 1
  })
  return Array.from(rows.values())
    .filter((row) => row.jobs || row.outputs || row.files || row.chunks || row.tokens || row.cost || row.failed)
    .sort((a, b) => (b.cost - a.cost) || (b.tokens - a.tokens) || a.projectName.localeCompare(b.projectName))
}

function buildDocumentTypeAnalyticsRows({
  byDocType,
  generationJobs,
  outputs,
}: {
  byDocType: Array<Record<string, any>>
  generationJobs: AnalyticsSummary['recentJobs']
  outputs: GeneratedOutput[]
}) {
  const rows = new Map<string, AnalyticsDocumentTypeRow & { failed: number; completed: number; durationTotal: number; durationSamples: number }>()
  const ensureRow = (label: string) => {
    const normalized = documentTypeLabel(label || 'Generated Output')
    const key = normalized.toLowerCase()
    let row = rows.get(key)
    if (!row) {
      row = {
        documentType: normalized,
        jobs: 0,
        successRate: null,
        reliabilityRate: null,
        recoveredAttempts: 0,
        failedAttempts: 0,
        coverageLabel: 'Not recorded',
        coverageTone: 'info',
        avgCost: 0,
        avgDurationMs: 0,
        tokens: 0,
        failed: 0,
        completed: 0,
        durationTotal: 0,
        durationSamples: 0,
      }
      rows.set(key, row)
    }
    return row
  }
  byDocType.forEach((item) => {
    const row = ensureRow(String(item.documentType || item.document_type || item.type || 'Generated Output'))
    const jobs = Number(item.count || item.total || item.jobs || 0)
    row.jobs = Math.max(row.jobs, jobs)
    row.completed = Math.max(row.completed, jobs)
    row.tokens += Number(item.tokensTotal || item.tokens_total || 0)
    const cost = Number(item.estimatedCostUsd || item.estimated_cost_usd || 0)
    row.avgCost = jobs ? cost / jobs : Math.max(row.avgCost, cost)
  })
  generationJobs.forEach((job) => {
    const row = ensureRow(String(job.documentType || 'Generated Output'))
    row.jobs += row.jobs ? 0 : 1
    row.tokens += row.tokens ? 0 : Number(job.tokensTotal || 0)
    const status = String(job.status || '').toLowerCase()
    if (status === 'completed' || status === 'success') row.completed += 1
    if (status === 'failed' || status === 'error' || job.event === 'JOB_FAILED' || job.event === 'QUALITY_GATE_FAILED') row.failed += 1
    const duration = Number(job.durationMs || 0)
    if (duration > 0) {
      row.durationTotal += duration
      row.durationSamples += 1
    }
  })
  outputs.forEach((output) => {
    const row = ensureRow(String(output.documentType || output.output?.documentType || 'Generated Output'))
    const coverage = coverageSummaryFrom(output.output)
    const verdict = coverageVerdict(coverage)
    if (coverage && verdict.parsed) {
      row.coverageLabel = verdict.label
      row.coverageTone = verdict.tone
    }
  })
  const finalStats = new Map<string, { completed: number; openFailed: number; recovered: number }>()
  outputs.forEach((output) => {
    const row = ensureRow(String(output.documentType || output.output?.documentType || 'Generated Output'))
    const key = row.documentType.toLowerCase()
    const stats = finalStats.get(key) || { completed: 0, openFailed: 0, recovered: 0 }
    const displayStatus = generationDisplayStatus(output, outputs)
    if (displayStatus === 'completed') stats.completed += 1
    else if (displayStatus === 'needs_retry') stats.openFailed += 1
    else if (displayStatus === 'recovered') stats.recovered += 1
    finalStats.set(key, stats)
  })
  return Array.from(rows.values())
    .map((row) => {
      const stats = finalStats.get(row.documentType.toLowerCase())
      const finalCompleted = stats ? stats.completed : row.completed
      const openFailed = stats ? stats.openFailed : row.failed
      const finalObserved = finalCompleted + openFailed
      const attemptObserved = row.completed + row.failed
      const recoveredAttempts = stats?.recovered || 0
      const deliverables = finalObserved || row.jobs
      return {
        ...row,
        jobs: deliverables,
        successRate: finalObserved ? Math.round((finalCompleted / finalObserved) * 100) : null,
        reliabilityRate: attemptObserved ? Math.round((row.completed / attemptObserved) * 100) : null,
        recoveredAttempts,
        failedAttempts: row.failed,
        avgDurationMs: row.durationSamples ? row.durationTotal / row.durationSamples : 0,
      }
    })
    .filter((row) => row.jobs || row.tokens || row.avgCost)
    .sort((a, b) => b.jobs - a.jobs || a.documentType.localeCompare(b.documentType))
}

function compactUsageRows(rows: AnalyticsUsageCalculation['rows']) {
  return rows.filter((row) => {
    const numeric = Number(String(row.value).replace(/[^0-9.-]/g, ''))
    return row.value && (!Number.isFinite(numeric) || numeric !== 0)
  })
}

function tokenCalculationInfo(scope: string, total: number, rows: AnalyticsUsageCalculation['rows'], note?: string): AnalyticsUsageCalculation {
  return {
    title: 'Token Calculation',
    scope,
    kind: 'tokens',
    totalLabel: formatCompactNumber(total),
    formula: scope.toLowerCase().includes('ingestion')
      ? 'Total tokens = embedding tokens + vision/extraction tokens.'
      : 'Total tokens = input tokens + output tokens recorded for the selected jobs.',
    rows: compactUsageRows(rows),
    note: note || 'Token values are estimated when provider usage is not available. Final provider billing may differ.',
  }
}

function costCalculationInfo(scope: string, total: number, rows: AnalyticsUsageCalculation['rows'], note?: string): AnalyticsUsageCalculation {
  return {
    title: 'Cost Calculation',
    scope,
    kind: 'cost',
    totalLabel: formatCurrency(total, 4),
    formula: scope.toLowerCase().includes('ingestion')
      ? 'Total cost = embedding cost + vision/extraction cost.'
      : 'Total cost = summed estimated model usage cost for the selected jobs.',
    rows: compactUsageRows(rows),
    note: note || 'Costs are estimated from recorded usage telemetry. Final provider billing may differ slightly.',
  }
}

function AnalyticsProjectPerformanceTable({ rows, emptyText }: { rows: AnalyticsProjectPerformanceRow[]; emptyText: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Project analytics</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="text-xl font-semibold text-on-surface">Cost, usage, ingestion, and output volume by project</h4>
            <p className="mt-1 text-sm text-on-surface-variant">Compare where work, tokens, chunks, generated outputs, and spend are concentrated.</p>
          </div>
          <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface-variant">
            {formatCompactNumber(rows.length)} project{rows.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      {rows.length ? (
        <div className="max-h-[19.5rem] overflow-auto">
          <table className="w-full min-w-[56rem] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-4 py-3 text-right">Jobs</th>
                <th className="px-4 py-3 text-right">Outputs</th>
                <th className="px-4 py-3 text-right">Files</th>
                <th className="px-4 py-3 text-right">Chunks</th>
                <th className="px-4 py-3 text-right">Tokens</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-5 py-3 text-right">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((row) => (
                <tr key={row.projectName} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-5 py-4 font-semibold text-on-surface"><span className="block truncate">{row.projectName}</span></td>
                  <td className="px-4 py-4 text-right font-bold">{formatCompactNumber(row.jobs)}</td>
                  <td className="px-4 py-4 text-right font-bold text-primary">{formatCompactNumber(row.outputs)}</td>
                  <td className="px-4 py-4 text-right font-bold">{formatCompactNumber(row.files)}</td>
                  <td className="px-4 py-4 text-right font-bold text-success">{formatCompactNumber(row.chunks)}</td>
                  <td className="px-4 py-4 text-right font-bold">{formatCompactNumber(row.tokens)}</td>
                  <td className="px-4 py-4 text-right font-bold">{formatCurrency(row.cost, 4)}</td>
                  <td className={`px-5 py-4 text-right font-bold ${row.failed ? 'text-warning' : 'text-success'}`}>{formatCompactNumber(row.failed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="m-5 rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function AnalyticsDocumentTypeTable({ rows, emptyText }: { rows: AnalyticsDocumentTypeRow[]; emptyText: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Document type analytics</p>
        <h4 className="mt-1 text-xl font-semibold text-on-surface">Output performance by deliverable</h4>
        <p className="mt-1 text-sm text-on-surface-variant">Compare final deliverable success, attempt reliability, coverage, cost, duration, and tokens by generated output type.</p>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[21%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Output type</th>
                <th className="px-4 py-3 text-right">Deliverables</th>
                <th className="px-4 py-3 text-right">Success</th>
                <th className="px-4 py-3 text-right">Reliability</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3 text-right">Avg cost</th>
                <th className="px-4 py-3 text-right">Avg duration</th>
                <th className="px-5 py-3 text-right">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((row) => (
                <tr key={row.documentType} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-5 py-4 font-semibold text-on-surface"><span className="block truncate">{row.documentType}</span></td>
                  <td className="px-4 py-4 text-right font-bold">{formatCompactNumber(row.jobs)}</td>
                  <td className={`px-4 py-4 text-right font-bold ${row.successRate === null ? '' : row.successRate >= 100 ? 'text-success' : row.successRate ? 'text-warning' : 'text-error'}`}>
                    {row.successRate === null ? '-' : `${row.successRate}%`}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <span className={`font-bold ${row.reliabilityRate === null ? '' : row.reliabilityRate >= 100 ? 'text-success' : row.reliabilityRate ? 'text-warning' : 'text-error'}`}>
                        {row.reliabilityRate === null ? '-' : `${row.reliabilityRate}%`}
                      </span>
                      {row.recoveredAttempts ? (
                        <span className="group relative inline-flex" title={`${formatCompactNumber(row.recoveredAttempts)} recovered job${row.recoveredAttempts === 1 ? '' : 's'}`}>
                          <HelpCircle className="h-3.5 w-3.5 text-on-surface-variant" />
                          <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded-md border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs font-semibold text-on-surface shadow-lg group-hover:block">
                            {formatCompactNumber(row.recoveredAttempts)} recovered job{row.recoveredAttempts === 1 ? '' : 's'}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={row.coverageTone} label={row.coverageLabel} /></td>
                  <td className="px-4 py-4 text-right font-bold">{formatCurrency(row.avgCost, 4)}</td>
                  <td className="px-4 py-4 text-right font-bold">{row.avgDurationMs ? formatDuration(row.avgDurationMs) : '-'}</td>
                  <td className="px-5 py-4 text-right font-bold">{formatCompactNumber(row.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="m-5 rounded-xl border border-dashed border-outline-variant p-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function buildAnalyticsTrend(jobs: AnalyticsSummary['recentJobs'], artifacts: ArtifactRecord[]): AnalyticsTrendBar[] {
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
    const pipeline = String(job.pipeline || 'generation').toLowerCase()
    const status = pipeline === 'ingestion'
      ? analyticsIngestionJobStatus(job, artifacts)
      : (() => {
          const rawStatus = String(job.status === 'info' ? 'completed' : job.status || 'completed').toLowerCase()
          if (rawStatus === 'failed' || rawStatus === 'error') return 'needs_retry'
          if (rawStatus === 'queued' || rawStatus === 'pending' || rawStatus === 'processing' || rawStatus === 'running') return 'processing'
          return 'completed'
        })()
    const current = buckets.get(key) || { key, label, year: date.getFullYear(), value: 0, generation: 0, ingestion: 0, needsRetry: 0, recovered: 0 }
    current.value += 1
    if (status === 'needs_retry') current.needsRetry += 1
    else if (status === 'recovered') current.recovered += 1
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
  if (status === 'completed' || status === 'success' || status === 'recovered') return 'success'
  if (status === 'failed' || status === 'error' || status === 'needs_retry') return 'error'
  if (status === 'processing' || status === 'running' || status === 'pending' || status === 'queued' || status === 'retrying') return 'warning'
  return 'info'
}

function analyticsJobStatusLabel(status: AnalyticsJobDisplayStatus | string) {
  if (status === 'needs_retry') return 'Needs retry'
  if (status === 'retrying') return 'Retry in progress'
  if (status === 'recovered') return 'Recovered'
  return String(status || 'completed').replace(/_/g, ' ')
}

function analyticsIngestionJobStatus(job: AnalyticsSummary['recentJobs'][number], artifacts: ArtifactRecord[]): AnalyticsJobDisplayStatus {
  const rawStatus = String(job.status === 'info' ? 'completed' : job.status || 'completed').toLowerCase()
  const relatedArtifacts = artifacts.filter((artifact) => artifact.jobId === job.jobId || artifact.id === job.jobId || artifact.id.startsWith(`${job.jobId}:`))
  if (relatedArtifacts.length) {
    const latestAttempts = buildArtifactLatestAttemptMap(artifacts)
    const statuses = relatedArtifacts.map((artifact) => artifactDisplayStatus(artifact, latestAttempts))
    if (statuses.includes('recovered')) return 'recovered'
    if (statuses.includes('retrying')) return 'retrying'
    if (statuses.includes('needs_retry')) return 'needs_retry'
    if (statuses.includes('processing')) return 'processing'
    return 'completed'
  }
  if (rawStatus === 'completed' || rawStatus === 'success') return 'completed'
  if (rawStatus === 'failed' || rawStatus === 'error') return 'needs_retry'
  if (rawStatus === 'queued' || rawStatus === 'pending' || rawStatus === 'processing' || rawStatus === 'running') return 'processing'
  return 'completed'
}

function AnalyticsKpiCard({
  icon: Icon,
  title,
  value,
  detail,
  tone,
  estimated = false,
  usageInfo,
  onUsageInfo,
}: {
  icon: typeof CheckCircle2
  title: string
  value: string
  detail?: string
  tone: StatusTone
  estimated?: boolean
  usageInfo?: AnalyticsUsageCalculation
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <div className="flex min-h-28 flex-col items-center justify-center text-center">
        <div className={`mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${analyticsToneClasses(tone)}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{title}</p>
        {estimated && usageInfo && onUsageInfo ? (
          <span className="mt-1 inline-flex items-center justify-center">
            <AnalyticsUsageInfoButton label={`View estimated ${title} calculation`} onClick={() => onUsageInfo(usageInfo)} />
          </span>
        ) : null}
        <p className="mt-3 break-words text-center text-3xl font-semibold leading-tight text-on-surface">{value}</p>
        {detail ? <p className="mt-2 text-xs leading-5 text-on-surface-variant">{detail}</p> : null}
      </div>
    </div>
  )
}

type AnalyticsPipelineSummary = {
  jobs: number
  producedLabel: string
  producedValue: number
  wordsLabel: string
  words: number
  chunks?: number
  tokens: number
  tokenInfo: AnalyticsUsageCalculation
  cost: number
  costInfo: AnalyticsUsageCalculation
  avgDuration: number
}

type AnalyticsFailedPipelineSummary = {
  attempts: number
  wordsOrFilesLabel: string
  wordsOrFilesValue: number
  tokens: number
  tokenInfo: AnalyticsUsageCalculation
  cost: number
  costInfo: AnalyticsUsageCalculation
  avgDuration: number
  secondaryLabel?: string
  secondaryValue?: number
}

function formatAnalyticsPercent(value: number) {
  return `${Math.round(clampPercent(value))}%`
}

function AnalyticsPipelinePerformancePanel({
  generation,
  ingestion,
  onUsageInfo,
}: {
  generation: AnalyticsPipelineSummary
  ingestion: AnalyticsPipelineSummary
  onUsageInfo: (value: AnalyticsUsageCalculation) => void
}) {
  const completedTotal = generation.jobs + ingestion.jobs
  const generationShare = completedTotal ? (generation.jobs / completedTotal) * 100 : 0
  const ingestionShare = completedTotal ? (ingestion.jobs / completedTotal) * 100 : 0
  const usageRows = [
    { label: 'Generation workload', value: generation.jobs, total: completedTotal, valueLabel: `Generation ${formatAnalyticsPercent(generationShare)}`, tone: 'info' as StatusTone },
    { label: 'Ingestion workload', value: ingestion.jobs, total: completedTotal, valueLabel: `Ingestion ${formatAnalyticsPercent(ingestionShare)}`, tone: 'success' as StatusTone },
  ]
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Pipeline performance</p>
            <h5 className="mt-1 text-lg font-bold text-on-surface">Throughput, usage, and speed</h5>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">A compact view of completed generation and ingestion work without per-metric cards.</p>
          </div>
          <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface-variant">
            {formatCompactNumber(completedTotal)} completed
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <AnalyticsSummaryStat label="Jobs completed" value={formatCompactNumber(completedTotal)} />
          <AnalyticsSummaryStat label="Documents" value={formatCompactNumber(generation.producedValue)} tone="info" />
          <AnalyticsSummaryStat label="Files ingested" value={formatCompactNumber(ingestion.producedValue)} tone="success" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <AnalyticsPipelineColumn icon={Database} title="Ingestion" tone="success" summary={ingestion} onUsageInfo={onUsageInfo} />
          <AnalyticsPipelineColumn icon={FileText} title="Generation" tone="info" summary={generation} onUsageInfo={onUsageInfo} />
        </div>

        <div className="grid flex-1 content-end gap-x-6 gap-y-3 lg:grid-cols-2">
          {usageRows.map((row) => (
            <AnalyticsWorkloadShareRow
              key={row.label}
              label={row.label}
              value={row.value}
              total={row.total}
              valueLabel={row.valueLabel}
              tone={row.tone}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function AnalyticsPipelineColumn({
  icon: Icon,
  title,
  tone,
  summary,
  onUsageInfo,
  className = '',
}: {
  icon: LucideIcon
  title: string
  tone: StatusTone
  summary: AnalyticsPipelineSummary
  onUsageInfo: (value: AnalyticsUsageCalculation) => void
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-outline-variant bg-surface-container-low p-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-on-surface">{title}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{summary.producedLabel} and usage recorded from completed jobs.</p>
        </div>
        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${analyticsToneClasses(tone)}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
        <AnalyticsMiniMetric label="Jobs completed" value={formatCompactNumber(summary.jobs)} />
        <AnalyticsMiniMetric label={summary.producedLabel} value={formatCompactNumber(summary.producedValue)} />
        <AnalyticsMiniMetric label={summary.wordsLabel} value={formatCompactNumber(summary.words)} />
        {typeof summary.chunks === 'number' ? <AnalyticsMiniMetric label="Chunks ingested" value={formatCompactNumber(summary.chunks)} /> : null}
        <AnalyticsMiniMetric label="Tokens" value={formatCompactNumber(summary.tokens)} estimated usageInfo={summary.tokenInfo} onUsageInfo={onUsageInfo} />
        <AnalyticsMiniMetric label="Cost" value={formatCurrency(summary.cost, 4)} estimated usageInfo={summary.costInfo} onUsageInfo={onUsageInfo} />
        <AnalyticsMiniMetric label="Avg duration" value={formatDuration(summary.avgDuration)} />
      </dl>
    </div>
  )
}

function AnalyticsWorkloadShareRow({
  label,
  value,
  total,
  valueLabel,
  tone,
}: {
  label: string
  value: number
  total: number
  valueLabel: string
  tone: StatusTone
}) {
  const percent = total ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-on-surface">{label}</span>
        <span className={`shrink-0 text-right text-xs font-bold ${tone === 'success' ? 'text-success' : 'text-primary'}`}>{valueLabel}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${analyticsBarClasses(tone)}`} style={{ width: `${clampPercent(percent)}%` }} />
      </div>
    </div>
  )
}

function AnalyticsMetricRow({
  label,
  value,
  estimated = false,
  usageInfo,
  onUsageInfo,
}: {
  label: string
  value: string
  estimated?: boolean
  usageInfo?: AnalyticsUsageCalculation
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  return (
    <div className="min-w-0 border-t border-outline-variant pt-3">
      <dt className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
        <span className="truncate">{label}</span>
        {usageInfo && onUsageInfo ? <AnalyticsUsageInfoButton label={`View ${estimated ? 'estimated ' : ''}${label} calculation`} onClick={() => onUsageInfo(usageInfo)} /> : null}
      </dt>
      <dd className="mt-1 break-words text-base font-bold text-on-surface">{value}</dd>
    </div>
  )
}

function AnalyticsCostFailurePanel({
  completedGenerationCost,
  completedIngestionCost,
  failedGeneration,
  failedIngestion,
  onUsageInfo,
}: {
  completedGenerationCost: number
  completedIngestionCost: number
  failedGeneration: AnalyticsFailedPipelineSummary
  failedIngestion: AnalyticsFailedPipelineSummary
  onUsageInfo: (value: AnalyticsUsageCalculation) => void
}) {
  const failedCost = failedGeneration.cost + failedIngestion.cost
  const totalRecordedCost = completedGenerationCost + completedIngestionCost + failedCost
  const failedShare = totalRecordedCost ? (failedCost / totalRecordedCost) * 100 : 0
  const costRows = [
    { label: 'Completed generation', value: completedGenerationCost, tone: 'info' as StatusTone },
    { label: 'Completed ingestion', value: completedIngestionCost, tone: 'success' as StatusTone },
    { label: 'Failed generation', value: failedGeneration.cost, tone: 'warning' as StatusTone },
    { label: 'Failed ingestion', value: failedIngestion.cost, tone: 'warning' as StatusTone },
  ]
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-low px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-warning">Cost & failed spend</p>
            <h5 className="mt-1 text-lg font-bold text-on-surface">Where usage was spent</h5>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">Completed pipeline cost and failed-attempt spend in one compact view.</p>
          </div>
          <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
            Failed cost share {formatAnalyticsPercent(failedShare)}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <AnalyticsSummaryStat label="Total recorded cost" value={formatCurrency(totalRecordedCost, 4)} />
          <AnalyticsSummaryStat label="Failed spend" value={formatCurrency(failedCost, 4)} tone="warning" />
          <AnalyticsSummaryStat label="Failed attempts" value={formatCompactNumber(failedGeneration.attempts + failedIngestion.attempts)} tone={failedGeneration.attempts + failedIngestion.attempts ? 'warning' : 'success'} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <AnalyticsFailedSpendRow title="Ingestion failures" summary={failedIngestion} onUsageInfo={onUsageInfo} />
          <AnalyticsFailedSpendRow title="Generation failures" summary={failedGeneration} onUsageInfo={onUsageInfo} />
        </div>

        <div className="grid flex-1 content-end gap-x-6 gap-y-3 lg:grid-cols-2">
          {costRows.map((row) => (
            <AnalyticsCostSplitRow key={row.label} label={row.label} value={row.value} total={totalRecordedCost} tone={row.tone} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AnalyticsSummaryStat({ label, value, tone = 'info' }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="flex min-h-28 flex-col justify-between rounded-lg bg-surface-container-low p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className={`mt-3 break-words text-xl font-bold ${tone === 'warning' ? 'text-warning' : tone === 'success' ? 'text-success' : 'text-on-surface'}`}>{value}</p>
    </div>
  )
}

function AnalyticsCostSplitRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: StatusTone }) {
  const percent = total ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-on-surface">{label}</span>
        <span className="shrink-0 text-right font-bold text-on-surface">{formatCurrency(value, 4)}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container">
        <div className={`h-full rounded-full ${analyticsBarClasses(tone)}`} style={{ width: `${clampPercent(percent)}%` }} />
      </div>
    </div>
  )
}

function AnalyticsFailedSpendRow({ title, summary, onUsageInfo }: { title: string; summary: AnalyticsFailedPipelineSummary; onUsageInfo: (value: AnalyticsUsageCalculation) => void }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-on-surface">{title}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{formatCompactNumber(summary.attempts)} attempts</p>
        </div>
        <AlertTriangle className="h-4 w-4 text-warning" />
      </div>
      <dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
        <AnalyticsMiniMetric label={summary.wordsOrFilesLabel} value={formatCompactNumber(summary.wordsOrFilesValue)} />
        {summary.secondaryLabel ? <AnalyticsMiniMetric label={summary.secondaryLabel} value={formatCompactNumber(summary.secondaryValue || 0)} /> : null}
        <AnalyticsMiniMetric label="Tokens" value={formatCompactNumber(summary.tokens)} estimated usageInfo={summary.tokenInfo} onUsageInfo={onUsageInfo} />
        <AnalyticsMiniMetric label="Cost" value={formatCurrency(summary.cost, 4)} estimated usageInfo={summary.costInfo} onUsageInfo={onUsageInfo} />
        <AnalyticsMiniMetric label="Avg duration" value={formatDuration(summary.avgDuration)} />
      </dl>
    </div>
  )
}

function AnalyticsMiniMetric({
  label,
  value,
  estimated = false,
  usageInfo,
  onUsageInfo,
}: {
  label: string
  value: string
  estimated?: boolean
  usageInfo?: AnalyticsUsageCalculation
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
        {usageInfo && onUsageInfo ? <AnalyticsUsageInfoButton label={`View ${estimated ? 'estimated ' : ''}${label} calculation`} onClick={() => onUsageInfo(usageInfo)} /> : null}
      </dt>
      <dd className="mt-0.5 font-bold text-on-surface">{value}</dd>
    </div>
  )
}

function AnalyticsPipelineCard({
  icon: Icon,
  title,
  subtitle,
  tone,
  metrics,
  onUsageInfo,
}: {
  icon: typeof CheckCircle2
  title: string
  subtitle: string
  tone: StatusTone
  metrics: Array<{ label: string; value: string; estimated?: boolean; usageInfo?: AnalyticsUsageCalculation }>
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  const primaryMetrics = metrics.slice(0, 2)
  const supportingMetrics = metrics.slice(2)
  const statusLabel = tone === 'warning' ? 'Watch' : tone === 'success' ? 'Healthy' : tone === 'error' ? 'Issue' : 'Tracked'
  const accentBorder =
    tone === 'success' ? 'border-l-success' :
    tone === 'warning' ? 'border-l-warning' :
    tone === 'error' ? 'border-l-error' :
    'border-l-primary'
  return (
    <section className={`relative overflow-hidden rounded-xl border border-l-4 border-outline-variant ${accentBorder} bg-surface-container-lowest shadow-sm`}>
      <div className="border-b border-outline-variant bg-surface-container-low px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-2 ${analyticsToneClasses(tone)}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-base font-bold text-on-surface">{title}</h5>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${analyticsToneClasses(tone)}`}>{statusLabel}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-on-surface-variant">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {primaryMetrics.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {primaryMetrics.map((metric) => (
              <AnalyticsPipelineMetricTile
                key={`${title}-${metric.label}`}
                title={title}
                metric={metric}
                tone={tone}
                featured
                onUsageInfo={onUsageInfo}
              />
            ))}
          </div>
        ) : null}
        {supportingMetrics.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {supportingMetrics.map((metric) => (
              <AnalyticsPipelineMetricTile
                key={`${title}-${metric.label}`}
                title={title}
                metric={metric}
                tone={tone}
                onUsageInfo={onUsageInfo}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function analyticsMetricIcon(label: string): LucideIcon {
  const normalized = label.toLowerCase()
  if (normalized.includes('cost')) return BarChart3
  if (normalized.includes('token')) return Cpu
  if (normalized.includes('duration')) return Clock
  if (normalized.includes('chunk')) return Database
  if (normalized.includes('file')) return Archive
  if (normalized.includes('document')) return FileText
  if (normalized.includes('word')) return FileText
  if (normalized.includes('failed')) return AlertTriangle
  if (normalized.includes('job')) return CheckCircle2
  return Gauge
}

function AnalyticsPipelineMetricTile({
  title,
  metric,
  tone,
  featured = false,
  onUsageInfo,
}: {
  title: string
  metric: { label: string; value: string; estimated?: boolean; usageInfo?: AnalyticsUsageCalculation }
  tone: StatusTone
  featured?: boolean
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  const MetricIcon = analyticsMetricIcon(metric.label)
  return (
    <div className={`rounded-lg border border-outline-variant bg-surface-container-lowest ${featured ? 'p-4' : 'p-3'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{metric.label}</span>
            {metric.usageInfo && onUsageInfo ? (
              <AnalyticsUsageInfoButton label={`View ${metric.estimated ? 'estimated ' : ''}${title} ${metric.label} calculation`} onClick={() => onUsageInfo(metric.usageInfo as AnalyticsUsageCalculation)} />
            ) : null}
          </div>
          <p className={`${featured ? 'mt-3 text-3xl' : 'mt-2 text-xl'} break-words font-bold leading-tight text-on-surface`}>{metric.value}</p>
        </div>
        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${analyticsToneClasses(tone)}`}>
          <MetricIcon className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

function AnalyticsUsageInfoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary hover:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <HelpCircle className="h-3 w-3" aria-hidden="true" />
    </button>
  )
}

function AnalyticsUsageCalculationModal({
  calculation,
  onClose,
}: {
  calculation: AnalyticsUsageCalculation
  onClose: () => void
}) {
  const Icon = calculation.kind === 'tokens' ? Sparkles : BarChart3
  const rows = calculation.rows.length
    ? calculation.rows
    : [{ label: 'Recorded total', value: calculation.totalLabel, detail: 'No lower-level split is available from the current analytics response.' }]
  return (
    <ModalFrame title={calculation.title} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{calculation.scope}</p>
              <p className="mt-1 break-words text-2xl font-bold text-on-surface [overflow-wrap:anywhere]">{calculation.totalLabel}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{calculation.formula}</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          {rows.map((row) => (
            <div key={`${calculation.scope}-${row.label}`} className="border-b border-outline-variant bg-surface-container-lowest p-4 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface">{row.label}</p>
                  {row.detail ? <p className="mt-1 text-xs leading-5 text-on-surface-variant">{row.detail}</p> : null}
                </div>
                <p className="shrink-0 text-right font-mono text-sm font-bold text-on-surface">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-warning/25 bg-warning/10 p-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm leading-6 text-on-surface-variant">{calculation.note}</p>
          </div>
        </div>
      </div>
    </ModalFrame>
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
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-error" />Needs retry</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" />Recovered</span>
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
                  const needsRetryHeight = bar.value ? (bar.needsRetry / bar.value) * 100 : 0
                  const recoveredHeight = bar.value ? (bar.recovered / bar.value) * 100 : 0
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
                        title={`${bar.value} jobs: ${bar.generation} generation, ${bar.ingestion} ingestion${bar.needsRetry ? `, ${bar.needsRetry} need retry` : ''}${bar.recovered ? `, ${bar.recovered} recovered` : ''}`}
                      >
                        {generationHeight ? <div className="bg-primary" style={{ height: `${generationHeight}%` }} /> : null}
                        {ingestionHeight ? <div className="bg-success" style={{ height: `${ingestionHeight}%` }} /> : null}
                        {needsRetryHeight ? <div className="bg-error" style={{ height: `${needsRetryHeight}%` }} /> : null}
                        {recoveredHeight ? <div className="bg-warning" style={{ height: `${recoveredHeight}%` }} /> : null}
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
  artifacts,
  outputs,
  pipeline,
  emptyText,
  onUsageInfo,
}: {
  title: string
  subtitle: string
  jobs: AnalyticsSummary['recentJobs']
  projects: Project[]
  artifacts: ArtifactRecord[]
  outputs: GeneratedOutput[]
  pipeline: 'generation' | 'ingestion'
  emptyText: string
  onUsageInfo: (value: AnalyticsUsageCalculation) => void
}) {
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AnalyticsJobDisplayStatus>('all')
  const statusForJob = (job: AnalyticsSummary['recentJobs'][number]): AnalyticsJobDisplayStatus => {
    if (pipeline === 'ingestion') return analyticsIngestionJobStatus(job, artifacts)
    const output = outputs.find((item) => (item.jobId || item.id) === job.jobId)
    if (output) return generationDisplayStatus(output, outputs)
    const rawStatus = String(job.status === 'info' ? 'completed' : job.status || 'completed').toLowerCase()
    if (rawStatus === 'completed' || rawStatus === 'success') return 'completed'
    if (rawStatus === 'failed' || rawStatus === 'error') return 'needs_retry'
    if (rawStatus === 'queued' || rawStatus === 'pending' || rawStatus === 'processing' || rawStatus === 'running') return 'processing'
    return 'completed'
  }
  const projectOptions = useMemo(() => {
    const assignedProjectNames = projects.map((project) => project.name).filter(Boolean)
    const jobProjectNames = jobs.map((job) => job.projectName || 'Unknown project')
    const names = assignedProjectNames.length ? assignedProjectNames : jobProjectNames
    return Array.from(new Set(names)).sort((left, right) => left.localeCompare(right))
  }, [jobs, projects])
  const projectFilteredJobs = projectFilter === 'all'
    ? jobs
    : jobs.filter((job) => (job.projectName || 'Unknown project') === projectFilter)
  const filteredJobs = statusFilter === 'all'
    ? projectFilteredJobs
    : projectFilteredJobs.filter((job) => statusForJob(job) === statusFilter)
  const statusFilterOptionsRaw: Array<{ key: 'all' | AnalyticsJobDisplayStatus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: projectFilteredJobs.length },
    { key: 'completed', label: 'Completed', count: projectFilteredJobs.filter((job) => statusForJob(job) === 'completed').length },
    { key: 'needs_retry', label: 'Needs retry', count: projectFilteredJobs.filter((job) => statusForJob(job) === 'needs_retry').length },
    { key: 'recovered', label: 'Recovered', count: projectFilteredJobs.filter((job) => statusForJob(job) === 'recovered').length },
    { key: 'retrying', label: 'Retrying', count: projectFilteredJobs.filter((job) => statusForJob(job) === 'retrying').length },
    { key: 'processing', label: 'Processing', count: projectFilteredJobs.filter((job) => statusForJob(job) === 'processing').length },
  ]
  const statusFilterOptions = statusFilterOptionsRaw.filter((filter) => (
    filter.key === 'all' ||
    filter.key === 'completed' ||
    filter.key === 'needs_retry' ||
    filter.key === 'recovered' ||
    filter.count > 0
  ))

  useEffect(() => {
    if (projectFilter !== 'all' && !projectOptions.includes(projectFilter)) {
      setProjectFilter('all')
    }
  }, [projectFilter, projectOptions])

  useEffect(() => {
    if (statusFilter !== 'all' && !statusFilterOptions.some((filter) => filter.key === statusFilter)) {
      setStatusFilter('all')
    }
  }, [statusFilter, statusFilterOptions])

  return (
    <section className="flex min-h-96 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant p-5">
        <div className="space-y-4">
          <div className="min-w-0 max-w-3xl">
            <h4 className="text-xl font-semibold text-on-surface">{title}</h4>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">{subtitle}</p>
          </div>
          <AnalyticsJobsToolbar
            title={title}
            statusFilter={statusFilter}
            statusFilterOptions={statusFilterOptions}
            onStatusChange={setStatusFilter}
            projectFilter={projectFilter}
            projectOptions={projectOptions}
            onProjectChange={setProjectFilter}
          />
        </div>
      </div>
      {filteredJobs.length ? (
        <div className="max-h-[42rem] flex-1 overflow-y-auto">
          <div className="divide-y divide-outline-variant">
          {filteredJobs.map((job) => {
            const status = statusForJob(job)
            const tone = analyticsJobStatusTone(status)
            const jobScope = `${job.projectName || 'Unknown project'} · ${job.jobId}`
            const jobTokenInfo = tokenCalculationInfo(
              pipeline === 'ingestion' ? `Ingestion job · ${jobScope}` : `Generation job · ${jobScope}`,
              Number(job.tokensTotal || 0),
              [{ label: 'Recorded job tokens', value: formatCompactNumber(job.tokensTotal), detail: pipeline === 'ingestion' ? 'Embedding plus vision/extraction tokens for this ingestion job.' : 'Input plus output tokens recorded for this generation job.' }],
              pipeline === 'ingestion'
                ? 'Ingestion job tokens are calculated as embedding tokens plus vision/extraction tokens. Detailed split is stored in job metric metadata when available.'
                : 'Generation job tokens use provider usage when available; otherwise Q-Ops estimates usage from generated output.'
            )
            const jobCostInfo = costCalculationInfo(
              pipeline === 'ingestion' ? `Ingestion job · ${jobScope}` : `Generation job · ${jobScope}`,
              Number(job.estimatedCostUsd || 0),
              [{ label: 'Recorded job cost', value: formatCurrency(job.estimatedCostUsd, 4), detail: pipeline === 'ingestion' ? 'Embedding plus vision/extraction cost for this ingestion job.' : 'Estimated model usage cost recorded for this generation job.' }],
              pipeline === 'ingestion'
                ? 'Ingestion job cost is calculated as embedding cost plus vision/extraction cost. Final provider billing may differ.'
                : 'Generation job cost is estimated from recorded token usage. Final provider billing may differ.'
            )
            return (
              <div key={job.jobId} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-mono text-sm font-semibold text-on-surface">{job.jobId}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{job.projectName || 'Unknown project'}</p>
                    {pipeline === 'generation' ? <p className="mt-1 text-xs text-on-surface-variant">{documentTypeLabel(job.documentType)}</p> : null}
                  </div>
                  <StatusBadge status={tone} label={analyticsJobStatusLabel(status)} />
                </div>
                <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${pipeline === 'generation' ? 'xl:grid-cols-5' : 'xl:grid-cols-6'}`}>
                  {pipeline === 'generation' ? (
                    <>
                      <AnalyticsJobStat label="Words generated" value={formatCompactNumber(job.wordCount)} />
                      <AnalyticsJobStat label="Documents generated" value={String(status === 'completed' ? 1 : 0)} />
                      <AnalyticsJobStat label="Tokens used" value={formatCompactNumber(job.tokensTotal)} usageInfo={jobTokenInfo} onUsageInfo={onUsageInfo} />
                      <AnalyticsJobStat label="Cost" value={formatCurrency(job.estimatedCostUsd, 4)} estimated usageInfo={jobCostInfo} onUsageInfo={onUsageInfo} />
                      <AnalyticsJobStat label="Duration" value={formatDuration(job.durationMs)} />
                    </>
                  ) : (
                    <>
                      <AnalyticsJobStat label="Words" value={formatCompactNumber(job.wordCount)} />
                      <AnalyticsJobStat label="Files" value={formatCompactNumber(job.totalFiles)} />
                      <AnalyticsJobStat label="Chunks" value={formatCompactNumber(job.chunkCount)} />
                      <AnalyticsJobStat label="Tokens" value={formatCompactNumber(job.tokensTotal)} estimated usageInfo={jobTokenInfo} onUsageInfo={onUsageInfo} />
                      <AnalyticsJobStat label="Cost" value={formatCurrency(job.estimatedCostUsd, 4)} estimated usageInfo={jobCostInfo} onUsageInfo={onUsageInfo} />
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

function AnalyticsJobStat({
  label,
  value,
  mono = false,
  estimated = false,
  usageInfo,
  onUsageInfo,
}: {
  label: string
  value: string
  mono?: boolean
  estimated?: boolean
  usageInfo?: AnalyticsUsageCalculation
  onUsageInfo?: (value: AnalyticsUsageCalculation) => void
}) {
  return (
    <div className="relative min-w-0 rounded-lg bg-surface-container-low p-3 text-center">
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        <span>{label}</span>
        {usageInfo && onUsageInfo ? (
          <AnalyticsUsageInfoButton label={`View ${estimated ? 'estimated ' : ''}${label} calculation`} onClick={() => onUsageInfo(usageInfo)} />
        ) : null}
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
      <h3 className="text-base font-semibold text-on-surface">Cost By Pipeline</h3>
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
      <h3 className="text-base font-semibold text-on-surface">Cost by Project</h3>
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
}: {
  title: string
  columns: string[]
  rows: Array<Array<string | number>>
  emptyText: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-fixed text-left text-sm">
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
type AdminSettingsSection = 'profile' | 'users' | 'environment' | 'integrations' | 'security' | 'status'
type UserSettingsSection = 'profile' | 'notifications' | 'projects' | 'integrations' | 'status'
type IntegrationEditorSection = 'jira' | 'confluence' | 'chroma' | 'microservices'

type SettingsSectionMeta<T extends string> = {
  key: T
  label: string
  description: string
  icon: typeof LayoutDashboard
}

const adminSettingsTabs: Array<SettingsSectionMeta<AdminSettingsSection>> = [
  { key: 'profile', label: 'Profile', description: 'Your admin identity and capability summary.', icon: ShieldCheck },
  { key: 'users', label: 'Users & Roles', description: 'Invite users, edit roles, and assign project access.', icon: Network },
  { key: 'environment', label: 'Environment', description: 'Local API endpoint and workflow route visibility.', icon: Settings },
  { key: 'integrations', label: 'Integrations', description: 'Workspace, personal, and project scoped destinations.', icon: SlidersHorizontal },
  { key: 'security', label: 'Security', description: 'Notifications, sessions, and workspace safety controls.', icon: ShieldCheck },
  { key: 'status', label: 'System Status', description: 'Health checks for n8n, storage, database, and services.', icon: Gauge },
]

const userSettingsTabs: Array<SettingsSectionMeta<UserSettingsSection>> = [
  { key: 'profile', label: 'Profile', description: 'Your account details and access summary.', icon: ShieldCheck },
  { key: 'notifications', label: 'Notifications', description: 'How job completion and failure alerts reach you.', icon: Bell },
  { key: 'projects', label: 'My Projects', description: 'Projects assigned to your account.', icon: Network },
  { key: 'integrations', label: 'Integrations', description: 'Your personal routing overrides for assigned work.', icon: SlidersHorizontal },
  { key: 'status', label: 'System Status', description: 'Read-only service health and connection state.', icon: Gauge },
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
  { name: 'Extractor Service', status: 'not_configured', detail: 'Run health check to validate document extraction service.' },
  { name: 'Converter Service', status: 'not_configured', detail: 'Run health check to validate document conversion service.' },
]

const modelProviderOptions = [
  {
    key: 'openai',
    label: 'OpenAI',
    status: 'active',
    detail: 'Currently wired in backend workflows.',
  },
  {
    key: 'gemini',
    label: 'Gemini',
    status: 'inactive',
    detail: 'Provider slot reserved for later rollout.',
  },
  {
    key: 'anthropic',
    label: 'Anthropic',
    status: 'inactive',
    detail: 'Provider slot reserved for later rollout.',
  },
]

const openAiModelMappings = [
  {
    capability: 'Vision Extraction Model',
    model: 'gpt-4o-mini',
    detail: 'Used for image and visual-context reasoning during ingestion.',
  },
  {
    capability: 'Embeddings Model',
    model: 'text-embedding-3-small',
    detail: 'Used for vectorization and retrieval grounding.',
  },
  {
    capability: 'LLM Generation Model',
    model: 'gpt-4.1-mini',
    detail: 'Used for QA documents, Jira backlog, and test-case generation.',
  },
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

function serviceDisplayName(name?: string) {
  return String(name || '').trim() === 'FastAPI Extractor' ? 'Extractor Service' : String(name || 'Service')
}

function isPlatformHealthService(service: { name?: string }) {
  const name = String(service.name || '').trim().toLowerCase()
  return !['jira', 'confluence', 'openai'].includes(name)
}

function systemHealthSummaryMessage(result: { status: StatusTone; message: string } | null, healthyCount: number, warningCount: number, errorCount: number, totalServices: number) {
  if (!result) return null
  if (result.status === 'info') return 'Checking platform services now. This may take a few seconds.'
  if (result.status === 'success') return `Health check complete. All ${healthyCount} platform services are reachable.`
  if (result.status === 'warning') return `Health check complete. ${warningCount} service${warningCount === 1 ? '' : 's'} need attention.`
  if (result.status === 'error') return totalServices
    ? `Health check found ${errorCount || 'one or more'} service${errorCount === 1 ? '' : 's'} that cannot be reached.`
    : 'Health check could not reach the backend services.'
  return result.message
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
  healthChecking,
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
  onSaveIntegration: (integrationKey: string, config: Record<string, any>, enabled?: boolean, options?: { scope?: IntegrationSettingsScope; projectId?: string }) => Promise<boolean>
  onTestIntegration: (integrationKey: string, readiness?: IntegrationTestReadiness) => Promise<boolean>
  onInviteUser: (payload: InviteUserPayload) => Promise<boolean>
  onUpdateUser: (payload: UpdateUserPayload) => Promise<boolean>
  onTestConnection: () => void
  healthChecking: boolean
  onStatus: () => void
}) {
  const update = (patch: Partial<SettingsState>) => setSettings((current) => ({ ...current, ...patch }))
  const [persona, setPersona] = useState<SettingsPersona>('admin')
  const [adminSection, setAdminSection] = useState<AdminSettingsSection>('integrations')
  const [userSection, setUserSection] = useState<UserSettingsSection>('profile')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [integrationScope, setIntegrationScope] = useState<IntegrationSettingsScope>('workspace')
  const [integrationProjectId, setIntegrationProjectId] = useState('')
  const [activeIntegrationSection, setActiveIntegrationSection] = useState<IntegrationEditorSection>('jira')
  const isAdmin = currentUser?.role === 'admin'
  const effectivePersona: SettingsPersona = isAdmin ? persona : 'user'
  const sectionTabs = effectivePersona === 'admin' ? adminSettingsTabs : userSettingsTabs
  const services = (healthStatus?.services?.length ? healthStatus.services : fallbackIntegrationServices).filter(isPlatformHealthService)
  const activeSection = effectivePersona === 'admin' ? adminSection : userSection
  const visibleUsers = users.length ? users : currentUser ? [{
    ...currentUser,
    projects: currentUser.role === 'admin' ? ['All projects'] : ['Assigned projects'],
  } as ApiUser] : []
  const adminUsers = visibleUsers.filter((user) => user.role === 'admin')
  const pendingUsers = visibleUsers.filter((user) => user.status === 'pending_invite')
  const scopeOptions: Array<{ key: IntegrationSettingsScope; label: string; detail: string }> = [
    ...(isAdmin ? [{ key: 'workspace' as const, label: 'Workspace defaults', detail: 'Fallback used when no user or project setting exists.' }] : []),
    { key: 'user', label: 'My default routing', detail: 'Personal fallback used across your assigned projects when a project override is not configured.' },
    { key: 'project', label: 'This project only', detail: 'Highest-priority routing for only the project selected below.' },
  ]
  const activeProjectId = integrationScope === 'project' ? integrationProjectId || projects[0]?.id || '' : undefined
  const jiraIntegration = getScopedIntegration(backendSettings, 'jira', integrationScope, currentUser?.id, activeProjectId)
  const confluenceIntegration = getScopedIntegration(backendSettings, 'confluence', integrationScope, currentUser?.id, activeProjectId)
  const chromaIntegration = getScopedIntegration(backendSettings, 'chroma', integrationScope, currentUser?.id, activeProjectId)
  const microservicesIntegration = getScopedIntegration(backendSettings, 'microservices', integrationScope, currentUser?.id, activeProjectId)
  const effectiveJiraIntegration = getEffectiveIntegration(backendSettings, 'jira', integrationScope, currentUser?.id, activeProjectId)
  const effectiveConfluenceIntegration = getEffectiveIntegration(backendSettings, 'confluence', integrationScope, currentUser?.id, activeProjectId)
  const effectiveChromaIntegration = getEffectiveIntegration(backendSettings, 'chroma', integrationScope, currentUser?.id, activeProjectId)
  const effectiveMicroservicesIntegration = getEffectiveIntegration(backendSettings, 'microservices', integrationScope, currentUser?.id, activeProjectId)
  const jiraScopeLabel = getScopeSourceLabel(integrationScope, jiraIntegration, effectiveJiraIntegration)
  const confluenceScopeLabel = getScopeSourceLabel(integrationScope, confluenceIntegration, effectiveConfluenceIntegration)
  const chromaScopeLabel = getScopeSourceLabel(integrationScope, chromaIntegration, effectiveChromaIntegration)
  const microservicesScopeLabel = getScopeSourceLabel(integrationScope, microservicesIntegration, effectiveMicroservicesIntegration)
  const [jiraDraft, setJiraDraft] = useState({ baseUrl: '', projectKey: '', projectId: '', idempotencyLabelPrefix: 'qops' })
  const [confluenceDraft, setConfluenceDraft] = useState({ baseUrl: '', spaceKey: '', parentPageId: '', pageTitlePattern: '{documentTitle} - {projectName}' })
  const [chromaDraft, setChromaDraft] = useState({ baseUrl: 'https://api.trychroma.com', tenant: '', database: '', collection: '', topK: '20' })
  const [microservicesDraft, setMicroservicesDraft] = useState({
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
    extractTables: true,
    extractAnnotations: true,
    extractLinks: true,
    detectRenderedPages: false,
    renderPages: false,
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
    setIntegrationScope('user')
  }, [isAdmin])

  useEffect(() => {
    if (integrationScope !== 'project') return
    if (integrationProjectId && projects.some((project) => project.id === integrationProjectId)) return
    setIntegrationProjectId(projects[0]?.id || '')
  }, [integrationProjectId, integrationScope, projects])

  useEffect(() => {
    if (effectivePersona === 'user' && integrationScope === 'workspace') setIntegrationScope('user')
  }, [effectivePersona, integrationScope])

  useEffect(() => {
    const config = jiraIntegration?.config || {}
    setJiraDraft({
      baseUrl: String(config.baseUrl || ''),
      projectKey: String(config.projectKey || ''),
      projectId: String(config.projectId || ''),
      idempotencyLabelPrefix: String(config.idempotencyLabelPrefix || 'qops'),
    })
  }, [activeProjectId, integrationScope, jiraIntegration])

  useEffect(() => {
    const config = confluenceIntegration?.config || {}
    setConfluenceDraft({
      baseUrl: String(config.baseUrl || ''),
      spaceKey: String(config.spaceKey || ''),
      parentPageId: String(config.parentPageId || ''),
      pageTitlePattern: String(config.pageTitlePattern || '{documentTitle} - {projectName}'),
    })
  }, [activeProjectId, confluenceIntegration, integrationScope])

  useEffect(() => {
    const config = chromaIntegration?.config || {}
    setChromaDraft({
      baseUrl: 'https://api.trychroma.com',
      tenant: String(config.tenant || ''),
      database: String(config.database || ''),
      collection: String(config.collection || ''),
      topK: String(config.topK || 20),
    })
  }, [activeProjectId, chromaIntegration, integrationScope])

  useEffect(() => {
    const config = microservicesIntegration?.config || {}
    const vision = config.vision || {}
    const extraction = config.extraction || {}
    const processorBaseUrl = String(config.documentProcessorV2BaseUrl || 'http://127.0.0.1:8001')
    const processorPath = String(config.documentProcessorV2Path || '/process-document-v2')
    const processorHealthPath = String(config.documentProcessorV2HealthPath || '/health')
    setMicroservicesDraft({
      documentProcessorV2BaseUrl: processorBaseUrl,
      documentProcessorV2Path: processorPath,
      documentProcessorV2HealthPath: processorHealthPath,
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
      extractTables: typeof extraction.extractTables === 'boolean' ? extraction.extractTables : true,
      extractAnnotations: typeof extraction.extractAnnotations === 'boolean' ? extraction.extractAnnotations : true,
      extractLinks: typeof extraction.extractLinks === 'boolean' ? extraction.extractLinks : true,
      detectRenderedPages: typeof extraction.detectRenderedPages === 'boolean' ? extraction.detectRenderedPages : false,
      renderPages: typeof extraction.renderPages === 'boolean' ? extraction.renderPages : false,
    })
  }, [activeProjectId, integrationScope, microservicesIntegration])

  const integrationSaveOptions = { scope: integrationScope, projectId: integrationScope === 'project' ? activeProjectId : undefined }
  const canSaveScopedIntegration = integrationScope !== 'project' || Boolean(activeProjectId)
  const integrationSections: Array<{
    key: IntegrationEditorSection
    label: string
    description: string
    icon: typeof LayoutDashboard
    status: StatusTone
    statusLabel: string
    source: string
  }> = [
    {
      key: 'jira',
      label: 'Jira Software',
      description: 'Epics and user stories destination.',
      icon: ListChecks,
      status: jiraDraft.baseUrl && jiraDraft.projectKey ? 'success' : 'warning',
      statusLabel: jiraDraft.baseUrl && jiraDraft.projectKey ? 'Configured' : 'Needs routing',
      source: jiraScopeLabel,
    },
    {
      key: 'confluence',
      label: 'Confluence',
      description: 'Generated QA document publishing.',
      icon: BookOpen,
      status: confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'success' : 'warning',
      statusLabel: confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'Configured' : 'Needs destination',
      source: confluenceScopeLabel,
    },
    {
      key: 'chroma',
      label: 'ChromaDB',
      description: 'Vector retrieval collection routing.',
      icon: Database,
      status: chromaDraft.tenant && chromaDraft.database && chromaDraft.collection ? 'success' : 'warning',
      statusLabel: chromaDraft.tenant && chromaDraft.database && chromaDraft.collection ? 'Configured' : 'Needs collection',
      source: chromaScopeLabel,
    },
    {
      key: 'microservices',
      label: 'Document Processing',
      description: 'Extractor, converter, and visual settings.',
      icon: ScanSearch,
      status: microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'success' : 'warning',
      statusLabel: microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'Configured' : 'Needs endpoint',
      source: microservicesScopeLabel,
    },
  ]

  const saveJira = async () => {
    if (!canSaveScopedIntegration) return false
    setSavingIntegration('jira')
    const currentConfig = jiraIntegration?.config || {}
    const ok = await onSaveIntegration('jira', {
      ...currentConfig,
      baseUrl: jiraDraft.baseUrl.trim(),
      projectKey: jiraDraft.projectKey.trim(),
      projectId: jiraDraft.projectId.trim(),
      idempotencyLabelPrefix: jiraDraft.idempotencyLabelPrefix.trim() || 'qops',
    }, jiraIntegration?.enabled ?? true, integrationSaveOptions)
    setSavingIntegration(null)
    return ok
  }

  const saveConfluence = async () => {
    if (!canSaveScopedIntegration) return false
    setSavingIntegration('confluence')
    const currentConfig = confluenceIntegration?.config || {}
    const ok = await onSaveIntegration('confluence', {
      ...currentConfig,
      baseUrl: confluenceDraft.baseUrl.trim(),
      spaceKey: confluenceDraft.spaceKey.trim(),
      parentPageId: confluenceDraft.parentPageId.trim() || null,
      pageTitlePattern: confluenceDraft.pageTitlePattern.trim() || '{documentTitle} - {projectName}',
    }, confluenceIntegration?.enabled ?? true, integrationSaveOptions)
    setSavingIntegration(null)
    return ok
  }

  const saveChroma = async () => {
    if (!canSaveScopedIntegration) return false
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
    }, chromaIntegration?.enabled ?? true, integrationSaveOptions)
    setSavingIntegration(null)
    return ok
  }

  const saveMicroservices = async () => {
    if (!canSaveScopedIntegration) return false
    setSavingIntegration('microservices')
    const {
      documentProcessorBaseUrl: _legacyProcessorBaseUrl,
      documentProcessorPath: _legacyProcessorPath,
      documentProcessorHealthPath: _legacyProcessorHealthPath,
      ...currentConfig
    } = microservicesIntegration?.config || {}
    const currentVision = currentConfig.vision || {}
    const currentExtraction = currentConfig.extraction || {}
    const clamp = (value: string, fallback: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, Number(value) || fallback))
    const processorBaseUrl = microservicesDraft.documentProcessorV2BaseUrl.trim() || 'http://127.0.0.1:8001'
    const processorPath = microservicesDraft.documentProcessorV2Path.trim() || '/process-document-v2'
    const processorHealthPath = microservicesDraft.documentProcessorV2HealthPath.trim() || '/health'
    const ok = await onSaveIntegration('microservices', {
      ...currentConfig,
      documentProcessorV2BaseUrl: processorBaseUrl,
      documentProcessorV2Path: processorPath,
      documentProcessorV2HealthPath: processorHealthPath,
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
      extraction: {
        ...currentExtraction,
        extractTables: microservicesDraft.extractTables,
        extractAnnotations: microservicesDraft.extractAnnotations,
        extractLinks: microservicesDraft.extractLinks,
        detectRenderedPages: microservicesDraft.detectRenderedPages,
        renderPages: microservicesDraft.renderPages,
      },
    }, microservicesIntegration?.enabled ?? true, integrationSaveOptions)
    setSavingIntegration(null)
    return ok
  }

  const readinessForIntegration = (integrationKey: IntegrationEditorSection): IntegrationTestReadiness => {
    if (integrationKey === 'jira') {
      return {
        label: 'Jira Software',
        configured: Boolean(jiraDraft.baseUrl.trim() && jiraDraft.projectKey.trim()),
        missing: [
          !jiraDraft.baseUrl.trim() ? 'Jira base URL' : '',
          !jiraDraft.projectKey.trim() ? 'Project key' : '',
        ].filter(Boolean),
      }
    }
    if (integrationKey === 'confluence') {
      return {
        label: 'Confluence',
        configured: Boolean(confluenceDraft.baseUrl.trim() && confluenceDraft.spaceKey.trim()),
        missing: [
          !confluenceDraft.baseUrl.trim() ? 'Confluence base URL' : '',
          !confluenceDraft.spaceKey.trim() ? 'Space key' : '',
        ].filter(Boolean),
      }
    }
    if (integrationKey === 'chroma') {
      return {
        label: 'ChromaDB',
        configured: Boolean(chromaDraft.tenant.trim() && chromaDraft.database.trim() && chromaDraft.collection.trim()),
        missing: [
          !chromaDraft.tenant.trim() ? 'Tenant ID' : '',
          !chromaDraft.database.trim() ? 'Database name' : '',
          !chromaDraft.collection.trim() ? 'Collection name' : '',
        ].filter(Boolean),
      }
    }
    return {
      label: 'Document Processing',
      configured: Boolean(microservicesDraft.documentProcessorV2BaseUrl.trim() && microservicesDraft.documentProcessorV2Path.trim()),
      missing: [
        !microservicesDraft.documentProcessorV2BaseUrl.trim() ? 'processor base URL' : '',
        !microservicesDraft.documentProcessorV2Path.trim() ? 'processor path' : '',
      ].filter(Boolean),
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Settings workspace</p>
            <h3 className="mt-2 text-2xl font-bold text-on-surface">Configure Q-Ops</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Admins manage workspace defaults and access. Registered users can keep personal integration routing while project overrides stay tied to assigned projects.
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
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sectionTabs.map((tab) => {
            const isActive = activeSection === tab.key
            return (
              <SettingsNavCard
                key={tab.key}
                onClick={() => (effectivePersona === 'admin' ? setAdminSection(tab.key as AdminSettingsSection) : setUserSection(tab.key as UserSettingsSection))}
                active={isActive}
                icon={tab.icon}
                label={tab.label}
                description={tab.description}
              />
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

      {((effectivePersona === 'admin' && adminSection === 'integrations') || (effectivePersona === 'user' && userSection === 'integrations')) ? (
        <div className="space-y-6">
          {settingsNotice ? <StatusNotice status="warning" message={settingsNotice} /> : null}
          <SettingsPanel title="Integration Scope">
            <div className="grid gap-3 lg:grid-cols-3">
              {scopeOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setIntegrationScope(option.key)}
                  className={`rounded-lg border p-4 text-left transition-colors ${integrationScope === option.key ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'}`}
                >
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{option.detail}</span>
                </button>
              ))}
            </div>
            {integrationScope === 'project' ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-on-surface">Project receiving this override</span>
                  <select
                    value={activeProjectId || ''}
                    onChange={(event) => setIntegrationProjectId(event.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>) : <option value="">No assigned projects</option>}
                  </select>
                </label>
                <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                  Saving now updates only {projectNameById.get(activeProjectId || '') || 'the selected project'}. Other assigned projects keep their own overrides or your personal fallback settings.
                </p>
              </div>
            ) : null}
            <p className="text-xs leading-5 text-on-surface-variant">Effective runtime precedence is project override, then user setting, then workspace default. Jobs store a non-secret snapshot at queue time.</p>
          </SettingsPanel>
          <div className="grid gap-3 lg:grid-cols-4">
            {integrationSections.map((item) => (
              <IntegrationEditorCard
                key={item.key}
                active={activeIntegrationSection === item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                status={item.status}
                statusLabel={item.statusLabel}
                source={item.source}
                onClick={() => setActiveIntegrationSection(item.key)}
              />
            ))}
          </div>
          {activeIntegrationSection === 'jira' ? (
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
                  <p className="mt-2 text-xs font-semibold text-on-surface-variant">{jiraScopeLabel}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => void onRefreshSettings()} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">{settingsLoading ? 'Refreshing...' : 'Refresh'}</button>
                  <button onClick={() => void onTestIntegration('jira', readinessForIntegration('jira'))} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                  <button disabled={!canSaveScopedIntegration} onClick={() => void saveJira()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">{savingIntegration === 'jira' ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
              {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsInput label="Jira base URL" value={jiraDraft.baseUrl} onChange={(value) => { setJiraDraft((current) => ({ ...current, baseUrl: value })); update({ jiraUrl: value }) }} placeholder="https://company.atlassian.net" />
                <SettingsInput label="Project key" value={jiraDraft.projectKey} onChange={(value) => setJiraDraft((current) => ({ ...current, projectKey: value }))} placeholder="KAN" />
                <SettingsInput label="Project id" value={jiraDraft.projectId} onChange={(value) => setJiraDraft((current) => ({ ...current, projectId: value }))} placeholder="10001" />
                <SettingsInput label="Idempotency label prefix" value={jiraDraft.idempotencyLabelPrefix} onChange={(value) => setJiraDraft((current) => ({ ...current, idempotencyLabelPrefix: value }))} placeholder="qops" />
              </div>
              <p className="text-xs leading-5 text-on-surface-variant">Issue type mapping stays backend-managed in n8n/Jira credentials. The UI saves safe routing values only.</p>
            </SettingsPanel>
          ) : null}
          {activeIntegrationSection === 'confluence' ? (
          <SettingsPanel title="Confluence">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-bold">Confluence Publishing</p>
                <p className="mt-1 text-sm text-on-surface-variant">Default destination for generated QA documents.</p>
                <div className="mt-2"><StatusBadge status={confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'success' : 'warning'} label={confluenceDraft.baseUrl && confluenceDraft.spaceKey ? 'Configured' : 'Not configured'} /></div>
                <p className="mt-2 text-xs font-semibold text-on-surface-variant">{confluenceScopeLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('confluence', readinessForIntegration('confluence'))} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button disabled={!canSaveScopedIntegration} onClick={() => void saveConfluence()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">{savingIntegration === 'confluence' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsInput label="Confluence base URL" value={confluenceDraft.baseUrl} onChange={(value) => setConfluenceDraft((current) => ({ ...current, baseUrl: value }))} placeholder="https://company.atlassian.net/wiki" />
              <SettingsInput label="Space key" value={confluenceDraft.spaceKey} onChange={(value) => { setConfluenceDraft((current) => ({ ...current, spaceKey: value })); update({ confluenceSpace: value }) }} placeholder="TD" />
              <SettingsInput label="Parent page id" value={confluenceDraft.parentPageId} onChange={(value) => setConfluenceDraft((current) => ({ ...current, parentPageId: value }))} placeholder="Optional" />
              <SettingsInput label="Page title pattern" value={confluenceDraft.pageTitlePattern} onChange={(value) => setConfluenceDraft((current) => ({ ...current, pageTitlePattern: value }))} placeholder="{documentTitle} - {projectName}" />
            </div>
          </SettingsPanel>
          ) : null}
          {activeIntegrationSection === 'chroma' ? (
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
                <p className="mt-2 text-xs font-semibold text-on-surface-variant">{chromaScopeLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('chroma', readinessForIntegration('chroma'))} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button disabled={!canSaveScopedIntegration} onClick={() => void saveChroma()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">{savingIntegration === 'chroma' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsInput label="Base URL" value={chromaDraft.baseUrl} onChange={() => undefined} disabled />
              <SettingsInput label="Tenant ID" value={chromaDraft.tenant} onChange={(value) => setChromaDraft((current) => ({ ...current, tenant: value }))} placeholder="My_Tenant" />
              <SettingsInput label="Database Name" value={chromaDraft.database} onChange={(value) => setChromaDraft((current) => ({ ...current, database: value }))} placeholder="QA-Documents-Chunk" />
              <SettingsInput label="Collection Name" value={chromaDraft.collection} onChange={(value) => setChromaDraft((current) => ({ ...current, collection: value }))} placeholder="qa-chunks-batches" />
              <SettingsInput label="Top K" value={chromaDraft.topK} onChange={(value) => setChromaDraft((current) => ({ ...current, topK: value.replace(/[^0-9]/g, '') }))} placeholder="20" />
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">The API key remains in n8n credentials. The UI saves only non-secret routing values used by health, ingestion, and retrieval runtime config.</p>
          </SettingsPanel>
          ) : null}
          {activeIntegrationSection === 'microservices' ? (
          <SettingsPanel title="Document Processing">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-lg bg-primary p-3 text-on-primary"><ScanSearch className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">Document extractor and vision routing</p>
                    <p className="text-xs text-on-surface-variant">Uses the active v2 processor while letting us tune visual throughput safely.</p>
                  </div>
                </div>
                <StatusBadge
                  status={microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'success' : 'warning'}
                  label={microservicesDraft.documentProcessorV2BaseUrl && microservicesDraft.documentProcessorV2Path ? 'Configured' : 'Needs processor endpoint'}
                />
                <p className="mt-2 text-xs font-semibold text-on-surface-variant">{microservicesScopeLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => void onTestIntegration('microservices', readinessForIntegration('microservices'))} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container">Test</button>
                <button disabled={!canSaveScopedIntegration} onClick={() => void saveMicroservices()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60">{savingIntegration === 'microservices' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            {connectionResult ? <StatusNotice status={connectionResult.status} message={connectionResult.message} /> : null}
            <div className="grid gap-4 lg:grid-cols-2">
              <SettingsInput label="Processor base URL" value={microservicesDraft.documentProcessorV2BaseUrl} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2BaseUrl: value }))} placeholder="http://127.0.0.1:8001" />
              <SettingsInput label="Processor path" value={microservicesDraft.documentProcessorV2Path} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2Path: value }))} placeholder="/process-document-v2" />
              <SettingsInput label="Health path" value={microservicesDraft.documentProcessorV2HealthPath} onChange={(value) => setMicroservicesDraft((current) => ({ ...current, documentProcessorV2HealthPath: value }))} placeholder="/health" />
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
            <div className="grid gap-3 lg:grid-cols-2">
              <ToggleRow label="Extract tables" checked={microservicesDraft.extractTables} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, extractTables: checked }))} />
              <ToggleRow label="Extract comments and annotations" checked={microservicesDraft.extractAnnotations} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, extractAnnotations: checked }))} />
              <ToggleRow label="Extract document links" checked={microservicesDraft.extractLinks} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, extractLinks: checked }))} />
              <ToggleRow label="Detect diagram-heavy pages" checked={microservicesDraft.detectRenderedPages} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, detectRenderedPages: checked }))} />
              <ToggleRow label="Render selected pages for vision" checked={microservicesDraft.renderPages} onChange={(checked) => setMicroservicesDraft((current) => ({ ...current, renderPages: checked }))} />
            </div>
            <p className="text-xs leading-5 text-on-surface-variant">The ingestion workflow reads this processor endpoint with the visual extraction and safety settings above.</p>
          </SettingsPanel>
          ) : null}
        </div>
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
        <SystemStatusSettings services={services} healthStatus={healthStatus} connectionResult={connectionResult} onTestConnection={onTestConnection} healthChecking={healthChecking} />
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
        <SystemStatusSettings services={services} healthStatus={healthStatus} connectionResult={connectionResult} onTestConnection={onTestConnection} healthChecking={healthChecking} readonly />
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

function SystemStatusSettings({ services, healthStatus, connectionResult, onTestConnection, healthChecking, readonly = false }: { services: Array<{ name: string; status?: string; detail?: string }>; healthStatus: HealthStatus | null; connectionResult: { status: StatusTone; message: string } | null; onTestConnection: () => void; healthChecking: boolean; readonly?: boolean }) {
  const healthTone = normalizeHealthTone(healthStatus?.status)
  const [selectedModelProvider, setSelectedModelProvider] = useState('openai')
  const healthyCount = services.filter((service) => normalizeHealthTone(service.status) === 'success').length
  const warningCount = services.filter((service) => normalizeHealthTone(service.status) === 'warning').length
  const errorCount = services.filter((service) => normalizeHealthTone(service.status) === 'error').length
  const healthMessage = systemHealthSummaryMessage(connectionResult, healthyCount, warningCount, errorCount, services.length)
  const selectedProvider = modelProviderOptions.find((provider) => provider.key === selectedModelProvider) || modelProviderOptions[0]
  return (
    <section className="space-y-6">
      <SettingsPanel title={readonly ? 'Read-Only System Status' : 'System Status'}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-3xl font-bold">{healthStatus ? serviceLabel(healthStatus.status) : 'Not tested'}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{healthStatus?.generatedAt ? `Last updated ${formatTime(healthStatus.generatedAt)}` : 'Run the health workflow to load live service status.'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onTestConnection}
              disabled={healthChecking}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {healthChecking ? 'Checking...' : 'Run Health Check'}
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <IntegrationChip label="Healthy services" status={`${healthyCount} of ${services.length}`} />
          <IntegrationChip label="Warnings" status={`${warningCount}`} />
          <IntegrationChip label="Errors" status={`${errorCount}`} />
        </div>
        {healthMessage ? <StatusNotice status={connectionResult?.status || healthTone} message={healthMessage} /> : null}
      </SettingsPanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div key={service.name} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{serviceDisplayName(service.name)}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{readonly ? 'Read-only platform status' : 'Admin health detail'}</p>
              </div>
              <StatusBadge status={normalizeHealthTone(service.status)} label={serviceLabel(service.status)} />
            </div>
            <p className="mt-4 text-sm leading-5 text-on-surface-variant">{readonly && normalizeHealthTone(service.status) !== 'success' ? 'Service status is managed by the platform admin.' : service.detail || 'No detail returned.'}</p>
          </div>
        ))}
      </div>
      <section className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Model providers</p>
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
          <div className="grid gap-3 lg:h-full lg:grid-rows-3">
            {modelProviderOptions.map((provider) => {
              const active = selectedModelProvider === provider.key
              const enabled = provider.status === 'active'
              return (
                <button
                  key={provider.key}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setSelectedModelProvider(provider.key)}
                  className={`flex min-h-24 w-full rounded-lg border bg-surface-container-lowest p-4 text-left transition-colors lg:min-h-0 ${
                    active
                      ? 'border-primary shadow-sm'
                      : enabled
                        ? 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
                        : 'cursor-not-allowed border-outline-variant opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{provider.label}</p>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{provider.detail}</p>
                    </div>
                    <StatusBadge status={enabled ? 'success' : 'warning'} label={enabled ? 'Active' : 'Inactive'} />
                  </div>
                </button>
              )
            })}
          </div>
          <div className="min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex flex-col gap-3 border-b border-outline-variant pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-xl font-bold text-on-surface">{selectedProvider.label}</h4>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">{selectedProvider.detail}</p>
              </div>
              <StatusBadge status={selectedProvider.status === 'active' ? 'success' : 'warning'} label={selectedProvider.status === 'active' ? 'Active' : 'Inactive'} />
            </div>
            {selectedModelProvider === 'openai' ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-outline-variant">
                <div className="hidden grid-cols-[minmax(10rem,0.9fr)_minmax(11rem,1fr)_minmax(0,1.4fr)] gap-4 bg-surface-container-low px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant md:grid">
                  <span>Capability</span>
                  <span>Backend model</span>
                  <span>Used for</span>
                </div>
                {openAiModelMappings.map((item) => (
                  <div key={item.capability} className="grid gap-2 border-t border-outline-variant px-4 py-4 first:border-t-0 md:grid-cols-[minmax(10rem,0.9fr)_minmax(11rem,1fr)_minmax(0,1.4fr)] md:gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant md:hidden">Capability</p>
                      <p className="font-semibold text-on-surface">{item.capability}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant md:hidden">Backend model</p>
                      <code className="rounded-md bg-primary/10 px-2 py-1 text-sm font-bold text-primary">{item.model}</code>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant md:hidden">Used for</p>
                      <p className="text-sm leading-6 text-on-surface-variant">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StatusNotice status="warning" message="This provider is visible for planning only. Model mapping will appear after backend routing is implemented." />
            )}
          </div>
        </div>
      </section>
    </section>
  )
}

function AnalyticsJobsToolbar({
  title,
  statusFilter,
  statusFilterOptions,
  onStatusChange,
  projectFilter,
  projectOptions,
  onProjectChange,
}: {
  title: string
  statusFilter: 'all' | AnalyticsJobDisplayStatus
  statusFilterOptions: Array<{ key: 'all' | AnalyticsJobDisplayStatus; label: string; count: number }>
  onStatusChange: (value: 'all' | AnalyticsJobDisplayStatus) => void
  projectFilter: string
  projectOptions: string[]
  onProjectChange: (value: string) => void
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="min-w-0 space-y-1.5">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as 'all' | AnalyticsJobDisplayStatus)}
            className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-on-surface outline-none focus:border-primary"
            aria-label={`Filter ${title} by status`}
          >
            {statusFilterOptions.map((filter) => (
              <option key={`${title}-${filter.key}`} value={filter.key}>{filter.label} ({filter.count})</option>
            ))}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Project</span>
          <select
            value={projectFilter}
            onChange={(event) => onProjectChange(event.target.value)}
            className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold text-on-surface outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Filter ${title} by project`}
            disabled={!projectOptions.length}
          >
            <option value="all">All projects</option>
            {projectOptions.map((project) => (
              <option key={`${title}-${project}`} value={project}>{project}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
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
  const [activeRole, setActiveRole] = useState('qa')
  const [activeGuide, setActiveGuide] = useState('operate')
  const roleGuides = [
    {
      id: 'qa',
      title: 'QA Lead',
      icon: ListChecks,
      intent: 'Own coverage, quality gates, generated outputs, and release confidence.',
      sections: ['Review Dashboard readiness every morning.', 'Create or refresh Knowledge Base when source inputs change.', 'Generate Strategy, Plan, Risk, Backlog, STC, and RTM in sequence.', 'Use Work Review Center for coverage warnings, stale outputs, and retries.'],
      metrics: ['Coverage reviews', 'RTM readiness', 'Failed generation jobs', 'Output freshness'],
    },
    {
      id: 'po',
      title: 'Product Owner',
      icon: Brain,
      intent: 'Validate business coverage, backlog completeness, and requirement traceability.',
      sections: ['Confirm BRD, FRD, grooming notes, and designs are uploaded.', 'Review Epics & User Stories before downstream test generation.', 'Use RTM to confirm requirements are mapped to stories and tests.', 'Treat coverage warnings as sign-off checkpoints.'],
      metrics: ['Generated stories', 'Requirements covered', 'Review items', 'Confluence outputs'],
    },
    {
      id: 'admin',
      title: 'Workspace Admin',
      icon: Settings,
      intent: 'Manage users, projects, integrations, credentials, and operational health.',
      sections: ['Assign users to projects and configure project overrides.', 'Run health checks before full E2E validation.', 'Keep service credentials in backend stores only.', 'Use Audit Log and Analytics to investigate workflow behavior.'],
      metrics: ['Service health', 'Audit events', 'Integration scope', 'Retry-ready jobs'],
    },
    {
      id: 'ops',
      title: 'Delivery Ops',
      icon: Gauge,
      intent: 'Track throughput, cost, job reliability, and work needing intervention.',
      sections: ['Use Dashboard to identify blockers and active work.', 'Use Analytics for spend, throughput, and failure trends.', 'Use Artifacts Repository to inspect extraction details.', 'Use Job panels to understand retry and recovery chains.'],
      metrics: ['Success rate', 'Token usage', 'Estimated cost', 'Average duration'],
    },
  ]
  const selectedRole = roleGuides.find((role) => role.id === activeRole) || roleGuides[0]
  const SelectedRoleIcon = selectedRole.icon
  const lifecycle = [
    { label: 'Project', detail: 'Create or assign a project.', icon: LayoutDashboard },
    { label: 'Ingest', detail: 'Upload project source artifacts.', icon: UploadCloud },
    { label: 'Extract', detail: 'Capture text, visuals, tables, links, and metrics.', icon: FileSearch },
    { label: 'Retrieve', detail: 'Store chunks and metadata for grounded generation.', icon: Database },
    { label: 'Generate', detail: 'Create Confluence and Jira outputs.', icon: FileText },
    { label: 'Review', detail: 'Resolve coverage, freshness, and retry items.', icon: ScanSearch },
    { label: 'Measure', detail: 'Track cost, throughput, and reliability.', icon: BarChart3 },
  ]
  const guides = [
    { id: 'operate', label: 'Operate' },
    { id: 'outputs', label: 'Outputs' },
    { id: 'states', label: 'States' },
    { id: 'systems', label: 'Systems' },
  ]
  const moduleCards = [
    { icon: LayoutDashboard, title: 'Dashboard', detail: 'Daily cockpit for readiness, attention items, coverage confidence, pipeline health, and spend.', bestFor: 'Start here after login.' },
    { icon: UploadCloud, title: 'Create Knowledge Base', detail: 'Upload source files and trigger ingestion jobs that extract and embed project context.', bestFor: 'Use when project inputs are new or changed.' },
    { icon: FileText, title: 'Generate Documents', detail: 'Generate or update QA deliverables and Jira issues with readiness gates.', bestFor: 'Use after KB is ready.' },
    { icon: Archive, title: 'Artifacts Repository', detail: 'Inspect uploaded files, extraction details, warnings, retry state, and processing metrics.', bestFor: 'Use when source quality is questioned.' },
    { icon: BarChart3, title: 'Analytics', detail: 'Review throughput, success rate, estimated usage, failure spend, and pipeline trends.', bestFor: 'Use for operational review.' },
    { icon: Settings, title: 'Settings', detail: 'Configure integrations, project overrides, user assignment, health checks, and audit access.', bestFor: 'Use for workspace administration.' },
  ]
  const deliverables = [
    ['Test Strategy', 'Confluence', 'Defines enterprise QA approach, automation direction, scope, quality gates, and governance.', 'KB ready'],
    ['Test Plan', 'Confluence', 'Defines execution plan, schedule, roles, test data, environments, criteria, and reporting.', 'KB ready'],
    ['Risk Matrix', 'Confluence', 'Ranks delivery, technical, security, operational, and business risks with mitigation.', 'KB ready'],
    ['Epics & User Stories', 'Jira + Confluence summary', 'Creates Jira backlog and tracks coverage against source requirements.', 'KB ready + backlog gate'],
    ['Story Test Cases', 'Jira', 'Creates and updates Jira test cases linked to real story keys.', 'Epics & User Stories ready'],
    ['Requirement Traceability Matrix', 'Confluence', 'Maps requirements to epics, stories, and generated test cases.', 'Epics/Stories + STC ready'],
  ]
  const stateRows = [
    ['Ready', 'The prerequisite data exists and the action can be started.', 'Generate or review output.'],
    ['Needs Setup', 'A required upstream output or integration is missing.', 'Create the missing project context or deliverable.'],
    ['Coverage needs review', 'Generation completed but at least one coverage item needs human review.', 'Open Work Review Center and inspect the item.'],
    ['Updates due', 'Knowledge Base, Epics/Stories, or Story Test Cases changed after a generated output.', 'Run update for the affected deliverable.'],
    ['Processing', 'A job is queued or running.', 'Wait, then check Job Status or Analytics.'],
    ['Needs Retry', 'A job failed and can be retried or reprocessed.', 'Use Work Review Center or the job panel retry action.'],
    ['Recovered', 'A later retry succeeded, but the older failed attempt remains visible for audit.', 'No action unless usage or error history needs review.'],
  ]
  const architectureNodes = [
    ['Frontend', 'Role-aware UI, dashboard, forms, review center, analytics, docs, and settings.'],
    ['n8n APIs', 'Authenticated webhooks for ingestion, generation, status, analytics, audit, and settings.'],
    ['Supabase', 'Auth, projects, artifacts, job records, metrics, audit events, and storage.'],
    ['Extractor Service', 'Extracts text, images, tables, links, warnings, and processing metrics.'],
    ['ChromaDB', 'Stores project-scoped chunks and retrieval metadata for grounded outputs.'],
    ['LLM Layer', 'Generates deliverables and structured summaries using retrieved source context.'],
    ['Jira / Confluence', 'External destinations for backlog, test cases, RTM, and QA documents.'],
  ]
  const runbookItems = [
    ['A job failed', 'Open Work Review Center, read the backend message, confirm the root cause, then retry or reprocess.'],
    ['A document looks stale', 'Check Updates due. If KB or upstream Jira output changed, run the update flow rather than create from scratch.'],
    ['A coverage warning appears', 'Open Coverage Review and decide whether the item is in scope, out of scope, or needs upstream refresh.'],
    ['No chunks or weak grounding', 'Check artifact extraction details, project collection, retrieval context, and ingestion completion.'],
    ['Unexpected cost growth', 'Use Analytics to compare failed spend, generated words, token estimates, and repeated retries.'],
    ['Integration issue', 'Run Settings health checks, verify project override routing, then inspect Audit Log.'],
  ]

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Product documentation</p>
            <h3 className="mt-2 max-w-4xl text-2xl font-bold leading-tight text-on-surface sm:text-3xl">Q-Ops Agent operating guide</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-on-surface-variant">
              Use this guide to understand who should use each screen, how project artifacts become QA outputs, which states require action, and how to investigate quality, cost, and reliability.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onKnowledge} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary"><UploadCloud className="h-4 w-4" /> Start ingestion</button>
              <button onClick={onStatus} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container"><Gauge className="h-4 w-4" /> System status</button>
              <button onClick={onHelp} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold hover:bg-surface-container"><HelpCircle className="h-4 w-4" /> Context help</button>
            </div>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Documentation promise</p>
            <div className="mt-3 grid gap-2">
              {['Role specific', 'Workflow oriented', 'Actionable states', 'Operationally grounded'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-md bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-on-surface">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Role guide</p>
            <h4 className="mt-1 text-xl font-semibold text-on-surface">Show me what matters for my role</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleGuides.map((role) => (
              <button key={role.id} onClick={() => setActiveRole(role.id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${activeRole === role.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                {role.title}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.65fr)_minmax(18rem,0.35fr)]">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <SelectedRoleIcon className="h-5 w-5" />
              </span>
              <div>
                <h5 className="text-lg font-bold text-on-surface">{selectedRole.title}</h5>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">{selectedRole.intent}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {selectedRole.sections.map((item) => (
                <div key={item} className="rounded-md bg-surface-container-lowest p-3 text-sm leading-6 text-on-surface-variant">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Watch these signals</p>
            <div className="mt-3 space-y-2">
              {selectedRole.metrics.map((metric) => (
                <div key={metric} className="flex items-center justify-between rounded-md bg-surface-container-lowest px-3 py-2 text-sm">
                  <span className="font-semibold text-on-surface">{metric}</span>
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Lifecycle map</p>
        <h4 className="mt-1 text-xl font-semibold text-on-surface">How work moves through Q-Ops</h4>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {lifecycle.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.label} className="relative rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary"><Icon className="h-4 w-4" /></span>
                <p className="mt-3 text-sm font-bold text-on-surface">{index + 1}. {step.label}</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">{step.detail}</p>
                {index < lifecycle.length - 1 ? <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-surface-container-lowest px-1 text-primary xl:block">-&gt;</span> : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {guides.map((guide) => (
            <button key={guide.id} onClick={() => setActiveGuide(guide.id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${activeGuide === guide.id ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
              {guide.label}
            </button>
          ))}
        </div>

        {activeGuide === 'operate' ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex items-start gap-3">
                    <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span>
                    <div>
                      <h5 className="font-bold text-on-surface">{item.title}</h5>
                      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.detail}</p>
                      <p className="mt-3 rounded-md bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-primary">{item.bestFor}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}

        {activeGuide === 'outputs' ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-outline-variant">
            <table className="min-w-[48rem] w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">Deliverable</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Prerequisite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {deliverables.map(([name, destination, purpose, prerequisite]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 font-bold text-on-surface">{name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{destination}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{purpose}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{prerequisite}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeGuide === 'states' ? (
          <div className="mt-5 grid gap-3">
            {stateRows.map(([state, meaning, action]) => (
              <div key={state} className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4 md:grid-cols-[12rem_minmax(0,1fr)_minmax(12rem,0.45fr)]">
                <p className="font-bold text-on-surface">{state}</p>
                <p className="text-sm leading-6 text-on-surface-variant">{meaning}</p>
                <p className="text-sm font-semibold leading-6 text-primary">{action}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeGuide === 'systems' ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
            <div className="space-y-3">
              {architectureNodes.map(([name, detail], index) => (
                <div key={name} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">{index + 1}</span>
                    {index < architectureNodes.length - 1 ? <span className="h-full min-h-5 w-px bg-outline-variant" /> : null}
                  </div>
                  <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                    <p className="text-sm font-bold text-on-surface">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h5 className="mt-3 font-bold text-on-surface">Credential rule</h5>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Jira, Confluence, Supabase service role, model provider, and n8n credentials must stay in secure backend credential stores. They should never appear in frontend state, local storage, generated documents, or exported workflow notes.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-warning">Operational runbook</p>
          <h4 className="mt-1 text-xl font-semibold text-on-surface">When something needs attention</h4>
          <div className="mt-5 divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant">
            {runbookItems.map(([title, detail]) => (
              <details key={title} className="group bg-surface-container-lowest open:bg-surface-container-low">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-bold text-on-surface hover:bg-surface-container-low">
                  <span>{title}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-6 text-on-surface-variant">{detail}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Governance checklist</p>
          <h4 className="mt-1 text-xl font-semibold text-on-surface">Before a full E2E pass</h4>
          <div className="mt-5 grid gap-3">
            {[
              ['1', 'Project has correct assigned users and integration routing.'],
              ['2', 'Knowledge Base completed without unresolved extraction concerns.'],
              ['3', 'Epics & User Stories are reviewed before STC and RTM generation.'],
              ['4', 'Work Review Center has no retry-ready or stale update items.'],
              ['5', 'Analytics spend and failure panels look explainable.'],
            ].map(([step, text]) => (
              <div key={step} className="flex gap-3 rounded-lg bg-surface-container-low p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">{step}</span>
                <p className="text-sm leading-6 text-on-surface-variant">{text}</p>
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

function notificationBucketKey(item: NotificationEvent) {
  const time = new Date(item.createdAt || '')
  const minute = Number.isNaN(time.getTime()) ? '' : time.toISOString().slice(0, 16)
  if (isKnowledgeCompletionNotification(item)) {
    const bucketMs = Number.isNaN(time.getTime()) ? 0 : Math.floor(time.getTime() / (10 * 60 * 1000))
    return [item.project || notificationProjectFromMessage(item), 'knowledge-completed', bucketMs].join('|')
  }
  return [item.project || '', item.title, item.message.replace(/\b(ING|PRO)-\d+-[A-Z0-9]+\b/g, '<job>'), minute].join('|')
}

function notificationProjectFromMessage(item: NotificationEvent) {
  const message = String(item.message || '')
  const processedFor = message.match(/for\s+(.+?)\.$/i)?.[1]
  if (processedFor) return processedFor.trim()
  const beforeProcessed = message.match(/^(.+?)\s+processed\s+\d+\s+artifact/i)?.[1]
  if (beforeProcessed) return beforeProcessed.trim()
  const beforeReady = message.match(/^(.+?)\s+is\s+ready/i)?.[1]
  return beforeReady?.trim() || ''
}

function isKnowledgeCompletionNotification(item: NotificationEvent) {
  const title = String(item.title || '').toLowerCase()
  if (item.type !== 'success') return false
  return title === 'knowledge base completed' || title === 'knowledge base updated'
}

function shouldHideNotificationFromTray(item: NotificationEvent) {
  const title = String(item.title || '').toUpperCase().replace(/\s+/g, '_')
  const message = String(item.message || '').toLowerCase()
  if ((title === 'JOB_COMPLETED' || title === 'JOB_COMPLETED') && message.includes('ingestion')) return true
  if (title === 'INGESTION_COMPLETED') return true
  if (title === 'JOB_COMPLETED' && message.includes('transcript')) return true
  return false
}

function compactNotifications(notifications: NotificationEvent[]) {
  const buckets = new Map<string, NotificationEvent & { count?: number }>()
  notifications.forEach((item) => {
    if (shouldHideNotificationFromTray(item)) return
    const key = notificationBucketKey(item)
    const existing = buckets.get(key)
    if (!existing) {
      buckets.set(key, { ...item, count: 1 })
      return
    }
    existing.count = (existing.count || 1) + 1
    existing.read = existing.read && item.read
    if (String(item.createdAt || '') > String(existing.createdAt || '')) existing.createdAt = item.createdAt
  })
  return Array.from(buckets.values())
    .map((item) => {
      if (!isKnowledgeCompletionNotification(item) || !item.count || item.count <= 1) return item
      const project = item.project || notificationProjectFromMessage(item) || 'the selected project'
      return {
        ...item,
        title: 'Knowledge base completed',
        message: `${item.count} artifact updates processed successfully for ${project}.`,
      }
    })
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
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
  const displayNotifications = useMemo(() => compactNotifications(notifications), [notifications])
  const unread = displayNotifications.filter((item) => !item.read).length
  const visibleIds = useMemo(() => new Set(displayNotifications.flatMap((item) => notifications.filter((raw) => notificationBucketKey(raw) === notificationBucketKey(item)).map((raw) => raw.id))), [displayNotifications, notifications])
  const markAll = () => {
    setNotifications((current) => current.map((item) => (visibleIds.has(item.id) ? { ...item, read: true } : item)))
    setReadNotificationIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }
  const openItem = (item: NotificationEvent) => {
    const bucket = notificationBucketKey(item)
    const bucketIds = notifications.filter((notification) => notificationBucketKey(notification) === bucket).map((notification) => notification.id)
    setNotifications((current) => current.map((notification) => (bucketIds.includes(notification.id) ? { ...notification, read: true } : notification)))
    setReadNotificationIds((current) => Array.from(new Set([...current, ...bucketIds])))
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
        {displayNotifications.length ? displayNotifications.map((item) => (
          <button key={item.id} onClick={() => openItem(item)} className={`w-full rounded-lg border p-4 text-left ${item.read ? 'border-outline-variant bg-surface-container-lowest' : 'border-primary bg-primary/10'}`}>
            <div className="flex items-start gap-3">
              <ToneIcon status={item.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-on-surface">{item.title}</p>
                  {item.count && item.count > 1 ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{item.count}</span> : null}
                </div>
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

type AttentionCenterItem = {
  id: string
  title: string
  detail: string
  tone: DashboardKpiTone
  icon: typeof LayoutDashboard
  actionLabel: string
  onAction: () => void
}

type AttentionCenterSection = {
  key: WorkReviewFocus
  title: string
  description: string
  count: number
  items: AttentionCenterItem[]
}

function AttentionCenterModal({
  projects,
  artifacts,
  documentJobs,
  knowledgeJobs,
  focus,
  onClose,
  onOpenDocuments,
  onOpenKnowledge,
  onRetryDocument,
  onRetryKnowledge,
  onReprocessArtifact,
}: {
  projects: Project[]
  artifacts: ArtifactRecord[]
  documentJobs: GeneratedOutput[]
  knowledgeJobs: KnowledgeJobRecord[]
  focus: WorkReviewFocus
  onClose: () => void
  onOpenDocuments: (projectName?: string, artifact?: DocumentArtifactKey) => void
  onOpenKnowledge: (projectName?: string) => void
  onRetryDocument: (job: GeneratedOutput) => void
  onRetryKnowledge: (job: KnowledgeJobRecord) => void
  onReprocessArtifact: (artifactId: string) => void
}) {
  const [activeFocus, setActiveFocus] = useState<WorkReviewFocus>(focus)
  const latestAttempts = buildArtifactLatestAttemptMap(artifacts)
  const retryArtifacts = artifacts.filter((artifact) => artifactRetryState(artifact, latestAttempts) === 'actionable')
  const retryKnowledgeJobs = knowledgeJobs.filter((job) => knowledgeJobRetryState(job, artifacts, knowledgeJobs, latestAttempts) === 'actionable')
  const retryDocumentJobs = documentJobs.filter((job) => generationJobRetryState(job, documentJobs) === 'actionable')
  const coverageOutputs = documentJobs.filter((job) => job.status === 'completed' && hasCoverageReview(job.output))
  const validationOutputs = documentJobs.filter((job) => job.status === 'completed' && hasDocumentValidationReview(job.output))
  const updateDueItems = buildDocumentUpdateDueItems(projects, artifacts, documentJobs, knowledgeJobs)
  const readinessRows = buildProjectReadinessRows(projects, artifacts, documentJobs, knowledgeJobs)
  const readinessBlockers = readinessRows.filter(isProjectReadinessBlocked)

  const allSections: AttentionCenterSection[] = [
    {
      key: 'retry' as WorkReviewFocus,
      title: 'Retry-ready work',
      description: 'Failed or stalled work that can be retried directly from here.',
      count: retryArtifacts.length + retryKnowledgeJobs.length + retryDocumentJobs.length,
      items: [
        ...retryArtifacts.map((artifact): AttentionCenterItem => ({
          id: `artifact-${artifact.id}`,
          title: artifact.fileName,
          detail: `${artifact.projectName} ingestion needs reprocess.`,
          tone: 'error',
          icon: RefreshCw,
          actionLabel: 'Reprocess',
          onAction: () => onReprocessArtifact(artifact.id),
        })),
        ...retryKnowledgeJobs.map((job): AttentionCenterItem => ({
          id: `kb-${job.jobId || job.id}`,
          title: job.fileName || job.jobId || 'Knowledge ingestion',
          detail: `${job.projectName} knowledge job is ready to reprocess.`,
          tone: 'error',
          icon: Database,
          actionLabel: 'Reprocess',
          onAction: () => onRetryKnowledge(job),
        })),
        ...retryDocumentJobs.map((job): AttentionCenterItem => ({
          id: `doc-${job.jobId || job.id}`,
          title: job.artifactLabel || documentTypeLabel(job.documentType),
          detail: `${job.projectName} generation job is ready to regenerate.`,
          tone: 'error',
          icon: FileText,
          actionLabel: 'Regenerate',
          onAction: () => onRetryDocument(job),
        })),
      ],
    },
    {
      key: 'updates' as WorkReviewFocus,
      title: 'Updates due',
      description: 'Generated outputs that may be stale because Knowledge Base or upstream Jira outputs changed.',
      count: updateDueItems.length,
      items: updateDueItems.map((item): AttentionCenterItem => ({
        id: `update-${item.id}`,
        title: item.artifactLabel,
        detail: `${item.projectName}: ${item.reasons.join(' ')}`,
        tone: 'warning',
        icon: RefreshCw,
        actionLabel: 'Update',
        onAction: () => onOpenDocuments(item.projectName, item.artifact),
      })),
    },
    {
      key: 'coverage' as WorkReviewFocus,
      title: 'Coverage reviews',
      description: 'Generated outputs that passed with review guidance before final sign-off.',
      count: coverageOutputs.length,
      items: coverageOutputs.map((job): AttentionCenterItem => ({
        id: `coverage-${job.jobId || job.id}`,
        title: job.artifactLabel || documentTypeLabel(job.documentType),
        detail: `${job.projectName} completed with coverage review guidance.`,
        tone: 'warning',
        icon: ScanSearch,
        actionLabel: 'Review',
        onAction: () => onOpenDocuments(job.projectName, resolveArtifactKey(job) || undefined),
      })),
    },
    {
      key: 'admin' as WorkReviewFocus,
      title: 'Admin document validation',
      description: 'Completed document jobs with structural validation or diagnostics requiring support review.',
      count: validationOutputs.length,
      items: validationOutputs.map((job): AttentionCenterItem => {
        const verdict = finalValidationVerdict(job.output)
        return {
          id: `validation-${job.jobId || job.id}`,
          title: job.artifactLabel || documentTypeLabel(job.documentType),
          detail: `${job.projectName}: ${verdict?.summary || 'Document validation metadata requires admin review.'}`,
          tone: verdict?.tone || 'warning',
          icon: ShieldCheck,
          actionLabel: 'Review',
          onAction: () => onOpenDocuments(job.projectName, resolveArtifactKey(job) || undefined),
        }
      }),
    },
    {
      key: 'readiness' as WorkReviewFocus,
      title: 'Readiness blockers',
      description: 'Projects that are missing source context or upstream deliverables.',
      count: readinessBlockers.length,
      items: readinessBlockers.map((row): AttentionCenterItem => ({
        id: `readiness-${row.project.id}`,
        title: row.project.name,
        detail: row.nextAction === 'Ingest source artifacts'
          ? 'Project needs retrieval-ready source context.'
          : `${dashboardProjectActionLabel(row.nextAction)} is the next step for this project.`,
        tone: row.project.status === 'ready' ? 'warning' : 'info',
        icon: row.nextActionView === 'knowledge' ? UploadCloud : FileText,
        actionLabel: dashboardProjectActionLabel(row.nextAction),
        onAction: () => row.nextActionView === 'knowledge'
          ? onOpenKnowledge(row.project.name)
            : onOpenDocuments(row.project.name, row.nextArtifact),
      })),
    },
  ].filter((section) => section.count > 0)

  const sections = activeFocus === 'all'
    ? allSections
    : allSections.filter((section) => section.key === activeFocus)
  const total = sections.reduce((sum, section) => sum + section.count, 0)
  const totalAll = allSections.reduce((sum, section) => sum + section.count, 0)
  const focusOptions: Array<{ key: WorkReviewFocus; label: string; count: number }> = [
    { key: 'all', label: 'All', count: totalAll },
    { key: 'retry', label: 'Retry', count: retryArtifacts.length + retryKnowledgeJobs.length + retryDocumentJobs.length },
    { key: 'updates', label: 'Updates', count: updateDueItems.length },
    { key: 'coverage', label: 'Coverage', count: coverageOutputs.length },
    { key: 'admin', label: 'Admin', count: validationOutputs.length },
    { key: 'readiness', label: 'Readiness', count: readinessBlockers.length },
  ]

  return (
    <ModalFrame title="Work Review Center" onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-5">
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warning/50 bg-warning/10 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="font-semibold text-on-surface">{totalAll ? `${totalAll} work item${totalAll === 1 ? '' : 's'} need review` : 'No review work detected'}</p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">Review retry-ready jobs, stale outputs, coverage warnings, document validation issues, and readiness blockers in one place. Actions taken here update the same job and project state used across the dashboard.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {focusOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveFocus(option.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                activeFocus === option.key
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {option.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeFocus === option.key ? 'bg-on-primary/15 text-on-primary' : 'bg-primary/10 text-primary'}`}>{option.count}</span>
            </button>
          ))}
        </div>

        {sections.length ? (
          <div className="space-y-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest">
                <div className="flex items-start justify-between gap-3 border-b border-outline-variant px-4 py-3">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{section.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">{section.description}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{section.count}</span>
                </div>
                <div className="max-h-[24rem] divide-y divide-outline-variant overflow-y-auto">
                  {section.items.slice(0, 25).map((item) => {
                    const classes = dashboardToneClasses(item.tone)
                    const Icon = item.icon
                    return (
                      <button key={item.id} onClick={item.onAction} className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-surface-container-low">
                        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${classes.icon}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-semibold text-on-surface">{item.title}</span>
                          <span className="mt-1 block text-sm leading-5 text-on-surface-variant">{item.detail}</span>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                            {item.actionLabel} <ArrowRight className="h-3 w-3" />
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState icon={CheckCircle2} title="No review items" text="There are no retry-ready jobs, stale outputs, coverage reviews, document validation issues, or readiness blockers for this focus." />
        )}
      </div>
    </ModalFrame>
  )
}

type DisplayAuditEvent = AuditEvent & { relatedEvents?: AuditEvent[] }

function auditLifecycleGroupKey(event: AuditEvent) {
  if (!isIngestionLifecycleSuccess(event)) return ''
  const time = new Date(event.timestamp || '')
  const minute = Number.isNaN(time.getTime()) ? '' : time.toISOString().slice(0, 16)
  return [event.project, event.entity, minute].join('|')
}

function compactAuditEvents(events: AuditEvent[]) {
  const groups = new Map<string, AuditEvent[]>()
  const passthrough: DisplayAuditEvent[] = []
  events.forEach((event) => {
    const key = auditLifecycleGroupKey(event)
    if (!key) {
      passthrough.push(event)
      return
    }
    groups.set(key, [...(groups.get(key) || []), event])
  })

  const compacted = Array.from(groups.values()).map((group): DisplayAuditEvent => {
    const primary = group.find((event) => String(event.action || '').toUpperCase().replace(/\s+/g, '_') === 'INGESTION_COMPLETED') || group[0]
    return {
      ...primary,
      id: `audit-group-${group.map((event) => event.id).sort().join('-')}`,
      action: 'Ingestion completed',
      details: group.length > 1
        ? `${primary.details || 'Artifact processed.'} (${group.length - 1} related lifecycle event${group.length === 2 ? '' : 's'} grouped.)`
        : primary.details,
      relatedEvents: group.filter((event) => event.id !== primary.id),
    }
  })

  return [...passthrough, ...compacted].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
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
  const [projectFilter, setProjectFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<DisplayAuditEvent | null>(null)
  const projects = useMemo(() => Array.from(new Set(events.map((event) => event.project).filter(Boolean))).sort(), [events])
  const actions = useMemo(() => Array.from(new Set(events.map((event) => event.action).filter(Boolean))).sort(), [events])
  const filteredEvents = events.filter((event) => (
    (projectFilter === 'all' || event.project === projectFilter)
    && (actionFilter === 'all' || event.action === actionFilter)
  ))
  const visibleEvents: DisplayAuditEvent[] = actionFilter === 'all' ? compactAuditEvents(filteredEvents) : filteredEvents.map((event) => ({ ...event }))
  return (
    <ModalFrame title="Audit Log" onClose={onClose} maxWidth="max-w-5xl">
      {events.length ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="w-full space-y-1 sm:w-auto">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Project</span>
              <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold sm:w-auto">
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
            </label>
            <label className="w-full space-y-1 sm:w-auto">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Action</span>
              <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-xs font-bold sm:w-auto">
                <option value="all">All actions</option>
                {actions.map((action) => <option key={action} value={action}>{action}</option>)}
              </select>
            </label>
          </div>
          <div className="space-y-3 md:hidden">
            {visibleEvents.map((event) => (
              <article key={event.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{formatTime(event.timestamp)}</p>
                    <p className="mt-1 break-words font-semibold text-on-surface [overflow-wrap:anywhere]">{event.action}</p>
                  </div>
                  <StatusBadge status={event.status} label={event.status} />
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-on-surface-variant">
                  <div>
                    <dt className="font-bold uppercase tracking-wide">Actor</dt>
                    <dd className="mt-0.5 text-on-surface">{event.actor}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide">Project</dt>
                    <dd className="mt-0.5 break-words text-on-surface [overflow-wrap:anywhere]">{event.project || '-'}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide">Entity</dt>
                    <dd className="mt-0.5 break-all font-mono text-on-surface">{event.entity || '-'}</dd>
                  </div>
                </dl>
                <p className="mt-3 line-clamp-3 text-sm leading-5 text-on-surface-variant">
                  {event.details}
                  {event.relatedEvents?.length ? <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">+{event.relatedEvents.length}</span> : null}
                </p>
                <button type="button" onClick={() => setSelectedEvent(event)} className="mt-3 rounded-md border border-outline-variant px-3 py-2 text-xs font-bold hover:bg-surface-container">View details</button>
              </article>
            ))}
            {!visibleEvents.length ? <p className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">No audit events match the selected filters.</p> : null}
          </div>
          <div className="hidden overflow-x-auto rounded-lg border border-outline-variant md:block">
          <table className="w-full table-auto text-left text-sm">
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
              {visibleEvents.map((event) => (
                <tr key={event.id}>
                  <td className="p-3 text-on-surface-variant">{formatTime(event.timestamp)}</td>
                  <td className="p-3 font-semibold">{event.actor}</td>
                  <td className="p-3">{event.action}</td>
                  <td className="p-3 text-on-surface-variant">{event.project}</td>
                  <td className="break-all p-3 font-mono text-xs text-on-surface-variant">{event.entity}</td>
                  <td className="p-3"><StatusBadge status={event.status} label={event.status} /></td>
                  <td className="p-3 text-on-surface-variant">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 min-w-0">
                        {event.details}
                        {event.relatedEvents?.length ? <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">+{event.relatedEvents.length}</span> : null}
                      </span>
                      <button type="button" onClick={() => setSelectedEvent(event)} className="shrink-0 rounded-md border border-outline-variant px-2 py-1 text-xs font-bold hover:bg-surface-container">View</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleEvents.length ? (
                <tr><td colSpan={7} className="p-6 text-center text-sm text-on-surface-variant">No audit events match the selected filters.</td></tr>
              ) : null}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <EmptyState icon={History} title="No audit events yet" text="Project creation, uploads, generation requests, resets, and settings changes will appear here." />
      )}
      {selectedEvent ? (
        <ModalFrame title="Audit Details" onClose={() => setSelectedEvent(null)} maxWidth="max-w-lg">
          <div className="space-y-3 text-sm">
            {[
              ['Time', formatTime(selectedEvent.timestamp)],
              ['Actor', selectedEvent.actor],
              ['Action', selectedEvent.action],
              ['Project', selectedEvent.project],
              ['Entity', selectedEvent.entity],
              ['Status', selectedEvent.status],
              ['Details', selectedEvent.details],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
                <p className="mt-1 break-words text-on-surface [overflow-wrap:anywhere]">{value}</p>
              </div>
            ))}
            {selectedEvent.relatedEvents?.length ? (
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Related lifecycle events</p>
                <div className="mt-2 space-y-2">
                  {selectedEvent.relatedEvents.map((event) => (
                    <div key={event.id} className="rounded-md bg-surface-container-lowest p-2">
                      <p className="font-semibold text-on-surface">{event.action}</p>
                      <p className="mt-1 break-words text-xs text-on-surface-variant [overflow-wrap:anywhere]">{event.details || event.entity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </ModalFrame>
      ) : null}
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
            {['BRD', 'FRD', 'HLD', 'LLD', 'Transcript', 'Supporting Documents', 'UI Designs'].map((item) => (
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
    <section className={`space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 ${className}`}>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      {children}
    </section>
  )
}

function SettingsNavCard({
  active,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof LayoutDashboard
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-surface-container'
      }`}
    >
      <span className={`mt-0.5 rounded-md p-2 ${active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{label}</span>
        <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{description}</span>
      </span>
    </button>
  )
}

function IntegrationEditorCard({
  active,
  icon: Icon,
  label,
  description,
  status,
  statusLabel,
  source,
  onClick,
}: {
  active: boolean
  icon: typeof LayoutDashboard
  label: string
  description: string
  status: StatusTone
  statusLabel: string
  source: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-colors ${
        active
          ? 'border-primary bg-primary/10'
          : 'border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-surface-container'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-md p-2 ${active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
          <Icon className="h-4 w-4" />
        </span>
        <StatusBadge status={status} label={statusLabel} />
      </div>
      <p className={`mt-3 text-sm font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
      <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
      <p className="mt-3 truncate text-xs font-semibold text-on-surface-variant">{source}</p>
    </button>
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
  const cls =
    status === 'error' ? 'bg-error-container text-on-error-container' :
    status === 'success' ? 'bg-success/10 text-success' :
    status === 'warning' ? 'border border-warning/30 bg-warning/10 text-warning' :
    'bg-primary/10 text-primary'
  return (
    <div className={`rounded-lg p-4 text-sm font-semibold ${cls}`}>
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
