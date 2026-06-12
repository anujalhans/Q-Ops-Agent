import { getAccessToken, getUsableSession, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './auth'

export const API_BASE_URL_KEY = 'qops-agent-api-base-url'
export const DEFAULT_API_BASE_URL = 'http://localhost:5678'

export function getApiBaseUrl() {
  return localStorage.getItem(API_BASE_URL_KEY) || DEFAULT_API_BASE_URL
}

function webhookUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

async function fetchOptional<T>(path: string, init?: RequestInit, timeoutMs = 2500, authenticated = false): Promise<T | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const request = { ...init, signal: controller.signal }
    const authenticatedRequest = authenticated ? await withFreshAuth(request) : request
    const res = await fetch(webhookUrl(path), authenticatedRequest)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

function withAuth(init: RequestInit = {}): RequestInit {
  const token = getAccessToken()
  if (!token) return init

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

function isJwtToken(token: string | null | undefined) {
  return typeof token === 'string' && token.split('.').length === 3
}

async function withFreshAuth(init: RequestInit = {}): Promise<RequestInit> {
  const session = await getUsableSession()
  const token = session?.accessToken || null
  if (!isJwtToken(token)) throw new Error('Your login session is invalid. Please sign in again.')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

type ApiJsonResult = {
  data: any
  rawText: string
}

async function readApiJson(res: Response): Promise<ApiJsonResult> {
  const rawText = await res.text().catch(() => '')
  if (!rawText) return { data: null, rawText: '' }
  try {
    return { data: JSON.parse(rawText), rawText }
  } catch {
    return { data: null, rawText }
  }
}

function apiErrorMessage(data: any, res: Response, fallback: string) {
  const error = data?.error
  const candidates = [
    typeof error === 'string' ? error : error?.message,
    data?.message,
    data?.error_description,
    data?.msg,
  ]
  const message = candidates.map((value) => String(value || '').trim()).find(Boolean)
  if (message) return message
  return `${fallback} Backend returned HTTP ${res.status}.`
}

export type JobStatus = 'idle' | 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'not_found'

export type UploadResponse = {
  jobId: string
  status?: string
  jobIds?: string[]
  jobs?: Array<{ jobId: string; status?: string; fileKey?: string; fileName?: string; processingClass?: ProcessingClass }>
  queuedCount?: number
}

type KnowledgeBaseQueuedJob = NonNullable<UploadResponse['jobs']>[number]

export type StatusResponse = {
  status: JobStatus | string
  output?: any
  [key: string]: any
}

export type DeliveryIntelligenceJobStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'cancelled'
  | string

export type DeliveryIntelligenceJobResponse = {
  ok?: boolean
  jobId?: string
  job_id?: string
  status: DeliveryIntelligenceJobStatus
  jobType?: string
  job_type?: string
  projectId?: string
  project_id?: string
  existing?: boolean
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string | null
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  [key: string]: any
}

export type DeliveryIntelligenceSearchResult = {
  type: string
  id: string
  title?: string
  name?: string
  summary?: string
  description?: string
  rationale?: string
  status?: string
  visibility?: string
  visibilityLevel?: string
  visibility_level?: string
  confidence?: number
  confidenceScore?: number
  confidence_score?: number
  projectId?: string
  project_id?: string
  projectName?: string
  project_name?: string
  sourceProject?: string
  source_project?: string
  category?: string
  recommendationType?: string
  recommendation_type?: string
  relatedEntityType?: string
  related_entity_type?: string
  relatedEntityId?: string
  related_entity_id?: string
  technologies?: string[]
  tags?: string[]
  evidence?: any[]
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  [key: string]: any
}

export type DeliveryIntelligenceSearchResponse = {
  ok?: boolean
  query?: string
  projectId?: string
  project_id?: string
  counts?: Record<string, number>
  results?: DeliveryIntelligenceSearchResult[]
  data?: DeliveryIntelligenceSearchResult[] | { results?: DeliveryIntelligenceSearchResult[] }
  summary?: string
  error?: string | null
  [key: string]: any
}

export type DeliveryIntelligenceCatalogEntity =
  | 'overview'
  | 'all'
  | 'jobs'
  | 'solutions'
  | 'technologies'
  | 'learnings'
  | 'recommendations'
  | 'relationships'

export type DeliveryIntelligenceCatalogResponse = {
  ok?: boolean
  entity?: DeliveryIntelligenceCatalogEntity | string
  projectId?: string | null
  generatedAt?: string
  counts?: Record<string, any>
  items?: any[]
  data?: {
    overview?: Record<string, any>
    jobs?: any[]
    solutions?: any[]
    technologies?: any[]
    learnings?: any[]
    recommendations?: any[]
    relationships?: any[]
    [key: string]: any
  }
  error?: string | { code?: string; message?: string } | null
  [key: string]: any
}

export type DeliveryIntelligenceProfile = {
  id?: string
  projectId: string
  projectName: string
  projectStatus?: string
  executiveSummary?: string
  deliverySummary?: string
  technologySummary?: string
  reuseSummary?: string
  recommendationSummary?: string
  signals?: Record<string, any>
  technologies?: any[]
  solutionHighlights?: any[]
  learningHighlights?: any[]
  recommendationHighlights?: any[]
  qaArtifacts?: any[]
  sourceCounts?: Record<string, any>
  lastIntelligenceJobId?: string | null
  updatedAt?: string
}

export type DeliveryIntelligenceOnboardingGuide = {
  id?: string
  projectId: string
  title: string
  audience?: string
  overview?: string
  firstSteps?: string[]
  keyAssets?: any[]
  keyTechnologies?: any[]
  solutionShortlist?: any[]
  recommendationShortlist?: any[]
  deliveryContext?: Record<string, any>
  sourceJobId?: string | null
  updatedAt?: string
}

export type DeliveryIntelligenceSimilarityMatch = {
  id?: string
  projectId: string
  relatedProjectId: string
  relatedProjectName?: string
  confidenceScore?: number | null
  rationale?: string
  overlappingTechnologies?: any[]
  overlappingSolutions?: any[]
  overlappingLearningCategories?: any[]
  evidence?: any[]
  status?: string
  updatedAt?: string
}

export type DeliveryIntelligenceGovernanceSolution = {
  id: string
  title: string
  summary?: string
  status?: string
  visibility?: string
  implementationComplexity?: string
  sourceProjectId?: string
  latestReview?: Record<string, any> | null
  reviewCount?: number
  updatedAt?: string
}

export type DeliveryIntelligenceInsightsResponse = {
  ok?: boolean
  projectId?: string | null
  generatedAt?: string
  profile?: DeliveryIntelligenceProfile | null
  onboardingGuide?: DeliveryIntelligenceOnboardingGuide | null
  similarityMatches?: DeliveryIntelligenceSimilarityMatch[]
  jobs?: DeliveryIntelligenceJobResponse[]
  jobMetrics?: Record<string, any>[]
  governance?: {
    summary?: Record<string, number>
    solutions?: DeliveryIntelligenceGovernanceSolution[]
  }
  recommendations?: Record<string, any>[]
  accessibleProjects?: Array<{
    id: string
    name: string
    owner?: string
    status?: string
    module?: string
    release?: string
  }>
  error?: string | { code?: string; message?: string } | null
  [key: string]: any
}

export type DeliveryIntelligenceJobPayload = {
  jobType: string
  projectId: string
  idempotencyKey?: string
  sourceTypes?: string[]
  technologies?: any[]
  solutions?: any[]
  learnings?: any[]
  recommendations?: any[]
  [key: string]: any
}

export type DeliveryRecommendationFeedbackAction = 'viewed' | 'accepted' | 'dismissed' | 'converted'

export type DeliveryIntelligenceSolutionReviewPayload = {
  solutionId: string
  decision: 'submitted' | 'review' | 'published' | 'archived'
  projectId?: string
  reviewNotes?: string
  governanceTags?: string[]
  visibilityOverride?: string
  publishedTitle?: string
  publishedSummary?: string
}

export type StatusTone = 'success' | 'error' | 'info' | 'warning'

export type ApiProject = {
  id?: string
  name: string
  description?: string
  owner?: string
  module?: string
  release?: string
  tags?: string[]
  status?: 'draft' | 'ingesting' | 'ready' | 'generating' | 'blocked'
  createdAt?: string
  updatedAt?: string
}

function normalizeApiProject(row: Record<string, any>): ApiProject {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    owner: row.owner ?? undefined,
    module: row.module ?? undefined,
    release: row.release ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  }
}

export type ApiArtifact = {
  id?: string
  projectName: string
  type: string
  fileName: string
  size?: number
  uploadedAt?: string
  status?: 'processing' | 'processed' | 'failed'
  url?: string
  jobId?: string
  output?: any
  extractionMetrics?: Record<string, any>
  extractionObservability?: Record<string, any>
}

export type ApiGeneratedDocument = {
  id?: string
  jobId?: string
  projectId?: string | null
  projectName: string
  artifactLabel?: string
  documentType?: string
  createdAt?: string
  updatedAt?: string
  status?: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  input?: any
  output?: any
  error?: string | null
  requestedBy?: string | null
  settingsVersion?: number | string | null
  retryOfJobId?: string | null
  retriedByJobId?: string | null
  retryStatus?: string | null
  retryAttempt?: number
  generationMode?: 'create' | 'update' | 'retry' | string | null
  updateOfJobId?: string | null
}

export type ApiJobMetric = {
  jobId?: string | null
  projectId?: string | null
  projectName?: string | null
  documentType?: string | null
  pipeline?: string | null
  event?: string | null
  status?: string | null
  wordCount?: number | null
  tokensTotal?: number | null
  estimatedCostUsd?: number | string | null
  durationMs?: number | null
  metadata?: Record<string, any> | null
  createdAt?: string | null
}

export type ApiAuditEvent = {
  id?: string
  actor?: string
  action: string
  project?: string
  entity?: string
  status?: StatusTone
  timestamp?: string
  details?: string
  event?: string
  pipeline?: string
  jobId?: string
}

export type CurrentUser = {
  id: string
  authUserId?: string
  email: string
  name: string
  title?: string
  avatarUrl?: string
  role: 'admin' | 'registered_user'
  status: 'active' | 'pending_invite' | 'disabled'
  lastLoginAt?: string
  permissions?: string[]
  projects?: string[]
  projectRoles?: Array<{ projectId: string; projectName?: string; role: string }>
}

export type ApiUser = CurrentUser & {
  projects: string[]
  projectRoles?: Array<{ projectId: string; projectName?: string; role: string }>
  createdAt?: string
  updatedAt?: string
}

export type ProjectAssignmentPayload = {
  projectId: string
  role: 'owner' | 'editor' | 'viewer'
}

export type InviteUserPayload = {
  email: string
  name: string
  title?: string
  role: 'admin' | 'registered_user'
  projectAssignments?: ProjectAssignmentPayload[]
}

export type UpdateUserPayload = {
  userId: string
  name?: string
  title?: string
  role?: 'admin' | 'registered_user'
  status?: 'active' | 'pending_invite' | 'disabled'
  projectAssignments?: ProjectAssignmentPayload[]
}

export type AnalyticsRecentJob = {
  jobId: string
  projectName?: string
  documentType?: string
  pipeline?: 'generation' | 'ingestion' | string
  status?: string
  event?: string
  durationMs?: number
  wordCount?: number
  chunkCount?: number
  totalFiles?: number
  tokensTotal?: number
  estimatedCostUsd?: number
  errorMessage?: string | null
  retryOfJobId?: string | null
  retryAttempt?: number
  metadata?: Record<string, any> | null
  createdAt?: string
}

export type AnalyticsFailure = {
  jobId?: string
  projectName?: string
  documentType?: string
  pipeline?: string
  event?: string
  status?: string
  errorMessage?: string | null
  createdAt?: string
}

export type AnalyticsPipelineFailure = {
  pipeline: string
  count: number
  latestFailureAt?: string | null
  latestJobId?: string | null
  latestErrorMessage?: string | null
}

export type AnalyticsCostBucket = {
  pipeline?: string
  projectId?: string | null
  projectName?: string
  jobs: number
  tokensTotal: number
  estimatedCostUsd: number
  avgCostUsd: number
}

export type AnalyticsKnowledgeBaseFiles = {
  projectId?: string | null
  projectName: string
  jobs: number
  filesProcessed: number
  chunksIngested: number
  latestJobId?: string | null
  latestCompletedAt?: string | null
}

export type AnalyticsSummary = {
  overview: {
    totalJobsCompleted: number
    totalDocumentsGenerated: number
    totalIngestionJobsCompleted: number
    totalJobsFailed: number
    totalJobsFailedHistorical?: number
    totalJobsFailedActive?: number
    totalJobsRecovered?: number
    successRate: number
    successRateCurrent?: number
    successRateHistorical?: number
    totalCostUsd: number
    avgCostPerDocument: number
    totalTokensConsumed: number
    totalChunksIngested: number
    totalWordsProcessed?: number
    avgDurationMs: number
    avgGenerationDurationMs?: number
    avgIngestionDurationMs?: number
    totalFilesProcessed?: number
  }
  byDocumentType: Array<Record<string, any>>
  failureRate: {
    generation: number
    ingestion: number
  }
  recentJobs: AnalyticsRecentJob[]
  ingestion?: {
    jobsCompleted: number
    totalChunksIngested: number
    totalWordsProcessed?: number
    avgProcessingDurationMs: number
    totalFilesProcessed: number
    tokensTotal?: number
    estimatedCostUsd?: number
    filesByKnowledgeBase: AnalyticsKnowledgeBaseFiles[]
  }
  failures?: {
    recent: AnalyticsFailure[]
    byPipeline: AnalyticsPipelineFailure[]
  }
  costs?: {
    byPipeline: AnalyticsCostBucket[]
    byProject: AnalyticsCostBucket[]
  }
  failedSpend?: {
    generation?: {
      attempts: number
      wordCount?: number
      tokensTotal: number
      estimatedCostUsd: number
      avgDurationMs?: number
    }
    ingestion?: {
      attempts: number
      filesAttempted?: number
      chunksCreated?: number
      wordCount?: number
      tokensTotal: number
      estimatedCostUsd: number
      avgDurationMs?: number
    }
  }
  meta: {
    generatedAt: string
    dateFrom: string
    pipeline: string
    daysRequested: string | number
  }
}

export type HealthStatus = {
  status: 'ok' | 'degraded' | 'error' | string
  generatedAt?: string
  services?: Array<{
    name: string
    status: 'ok' | 'configured' | 'degraded' | 'error' | string
    detail?: string
  }>
  webhooks?: Record<string, string>
  integrations?: Record<string, string>
  [key: string]: any
}

export type InfrastructureLoad = {
  status: 'ok' | 'degraded' | 'error' | string
  score: number
  generatedAt?: string
  scope?: 'workspace' | 'self' | string
  queues: {
    pending: number
    processing: number
    active: number
    failedLast24h: number
    oldestPendingAgeSeconds: number
    generation?: {
      pending: number
      processing: number
    }
    ingestion?: {
      pending: number
      processing: number
    }
  }
  workflows: {
    activeExecutions: number
    failedLast24h: number
    avgDurationMs: number
    recentMetricEvents?: number
  }
  services: Array<{
    name: string
    key?: string
    status: 'ok' | 'degraded' | 'error' | 'not_configured' | string
    latencyMs?: number
    message?: string
    checkedAt?: string | null
  }>
  usage: {
    tokensToday: number
    costTodayUsd: number
    jobsCompletedToday: number
  }
  meta?: Record<string, any>
}

export type KnowledgeBasePayload = {
  projectId?: string
  projectName: string
  brd: File | null
  frd: File | null
  hld: File | null
  lld: File | null
  transcripts: File[]
  images: File[]
  supportingDocuments?: File[]
}

export type ProcessingClass = 'text' | 'mixed' | 'image'

type KnowledgeBaseUploadItem = {
  key: string
  file: File
  processingClass: ProcessingClass
}

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : ''
}

function classifyKnowledgeBaseFile(file: File, fallback: ProcessingClass): ProcessingClass {
  const extension = getFileExtension(file.name)
  if (['txt', 'md', 'csv', 'log'].includes(extension)) return 'text'
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension)) return 'image'
  if (['pdf', 'docx', 'pptx'].includes(extension)) return 'mixed'
  return fallback
}

const knowledgeBaseAllowedExtensions: Record<string, string[]> = {
  brd: ['pdf', 'docx'],
  frd: ['pdf', 'docx'],
  hld: ['pdf', 'docx'],
  lld: ['pdf', 'docx'],
  transcript: ['txt', 'md', 'log'],
  supporting: ['pdf', 'docx', 'pptx', 'txt', 'md', 'csv', 'log'],
  image: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
}

const knowledgeBaseFileLabels: Record<string, string> = {
  brd: 'BRD document',
  frd: 'FRD document',
  hld: 'HLD document',
  lld: 'LLD document',
  transcript: 'Transcript files',
  supporting: 'Other supporting documents',
  image: 'UI designs',
}

function validateKnowledgeBaseFileType(item: KnowledgeBaseUploadItem) {
  const extension = getFileExtension(item.file.name)
  const allowed = knowledgeBaseAllowedExtensions[item.key] || []
  if (allowed.length && !allowed.includes(extension)) {
    throw new Error(`${knowledgeBaseFileLabels[item.key] || item.key} accepts ${allowed.map((value) => `.${value}`).join(', ')} files only.`)
  }
}

function knowledgeBaseUploadItems(payload: KnowledgeBasePayload): KnowledgeBaseUploadItem[] {
  const items: KnowledgeBaseUploadItem[] = []
  if (payload.brd) items.push({ key: 'brd', file: payload.brd, processingClass: classifyKnowledgeBaseFile(payload.brd, 'mixed') })
  if (payload.frd) items.push({ key: 'frd', file: payload.frd, processingClass: classifyKnowledgeBaseFile(payload.frd, 'mixed') })
  if (payload.hld) items.push({ key: 'hld', file: payload.hld, processingClass: classifyKnowledgeBaseFile(payload.hld, 'mixed') })
  if (payload.lld) items.push({ key: 'lld', file: payload.lld, processingClass: classifyKnowledgeBaseFile(payload.lld, 'mixed') })
  payload.transcripts.forEach((file) => items.push({ key: 'transcript', file, processingClass: classifyKnowledgeBaseFile(file, 'text') }))
  ;(payload.supportingDocuments || []).forEach((file) => items.push({ key: 'supporting', file, processingClass: classifyKnowledgeBaseFile(file, 'mixed') }))
  payload.images.forEach((file) => items.push({ key: 'image', file, processingClass: classifyKnowledgeBaseFile(file, 'image') }))
  return items.sort((a, b) => {
    const weight: Record<ProcessingClass, number> = { text: 0, mixed: 1, image: 2 }
    return weight[a.processingClass] - weight[b.processingClass]
  })
}

async function uploadKnowledgeBaseItem(payload: KnowledgeBasePayload, item: KnowledgeBaseUploadItem): Promise<UploadResponse> {
  validateKnowledgeBaseFileType(item)
  const fd = new FormData()
  const uploadFileName =
    item.key === 'supporting' && !item.file.name.toLowerCase().startsWith('supporting')
      ? `supporting_${item.file.name}`
      : item.file.name

  fd.append('projectName', payload.projectName)
  if (payload.projectId) fd.append('projectId', payload.projectId)
  fd.append('environment', 'local')
  fd.append('processingClass', item.processingClass)
  fd.append('fileKey', item.key)
  fd.append(item.key, item.file, uploadFileName)

  const res = await fetch(webhookUrl('/webhook/upload-test-artifacts'), await withFreshAuth({ method: 'POST', body: fd }))
  const data = await res.json()
  if (!data?.jobId) throw new Error('Invalid response from backend')
  return {
    ...data,
    fileKey: item.key,
    fileName: item.file.name,
    processingClass: item.processingClass,
  }
}

export async function uploadKnowledgeBase(payload: KnowledgeBasePayload, onJobQueued?: (job: KnowledgeBaseQueuedJob) => void): Promise<UploadResponse> {
  const items = knowledgeBaseUploadItems(payload)
  if (!items.length) throw new Error('Select at least one knowledge base file.')

  const jobs: NonNullable<UploadResponse['jobs']> = []
  for (const item of items) {
    const response = await uploadKnowledgeBaseItem(payload, item)
    const queuedJob = {
      jobId: response.jobId,
      status: response.status,
      fileKey: item.key,
      fileName: item.file.name,
      processingClass: item.processingClass,
    }
    jobs.push(queuedJob)
    onJobQueued?.(queuedJob)
  }

  const first = jobs[0]
  return {
    jobId: first.jobId,
    status: first.status || 'queued',
    jobIds: jobs.map((job) => job.jobId),
    jobs,
    queuedCount: jobs.length,
  }
}

export async function fetchKbStatus(jobId: string): Promise<StatusResponse | null> {
  const res = await fetch(`${webhookUrl('/webhook/job-status')}?jobId=${encodeURIComponent(jobId)}`, await withFreshAuth())
  if (!res.ok) throw new Error('Failed to fetch job status')
  const raw = await res.json()
  const data = Array.isArray(raw) ? raw[0] : raw
  return data ?? null
}

export type DocumentArtifactKey =
  | 'strategy'
  | 'plan'
  | 'risk'
  | 'testCases'
  | 'epicsAndStories'
  | 'traceability_matrix'

export function mapArtifactToDocumentType(artifact: DocumentArtifactKey): string {
  switch (artifact) {
    case 'strategy':
      return 'test_strategy'
    case 'plan':
      return 'test_plan'
    case 'risk':
      return 'risk_matrix'
    case 'testCases':
      return 'story_test_cases'
    case 'epicsAndStories':
      return 'user_stories'
    case 'traceability_matrix':
      return 'traceability_matrix'
    default:
      return artifact
  }
}

export type GenerateDocPayload = {
  projectId?: string
  projectName: string
  artifact: DocumentArtifactKey
  productOwner?: string
  generationMode?: 'create' | 'update' | 'retry'
  updateContext?: Record<string, any>
  retryJobId?: string
  retryInstruction?: string
  retryContext?: Record<string, any>
}

export async function generateDocument(payload: GenerateDocPayload): Promise<UploadResponse> {
  const res = await fetch(webhookUrl('/webhook/generate-qa-doc'), await withFreshAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: payload.projectId,
      projectName: payload.projectName,
      documentType: mapArtifactToDocumentType(payload.artifact),
      productOwner: payload.productOwner || 'PO',
      environment: 'local',
      generationMode: payload.generationMode,
      updateContext: payload.updateContext,
      retryJobId: payload.retryJobId,
      retryInstruction: payload.retryInstruction,
      retryContext: payload.retryContext,
    }),
  }))
  const { data } = await readApiJson(res)
  if (!res.ok) throw new Error(apiErrorMessage(data, res, 'Document generation could not be queued.'))
  if (!data?.jobId) throw new Error(apiErrorMessage(data, res, 'Document generation API did not return a job id.'))
  return data
}

export async function generateStoryTestCases(payload: GenerateDocPayload): Promise<UploadResponse> {
  const res = await fetch(webhookUrl('/webhook/generate-story-test-cases'), await withFreshAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: payload.projectId,
      projectName: payload.projectName,
      documentType: mapArtifactToDocumentType(payload.artifact),
      productOwner: payload.productOwner || 'PO',
      environment: 'local',
      generationMode: payload.generationMode,
      updateContext: payload.updateContext,
      retryJobId: payload.retryJobId,
      retryInstruction: payload.retryInstruction,
      retryContext: payload.retryContext,
    }),
  }))
  const { data } = await readApiJson(res)
  if (!res.ok) throw new Error(apiErrorMessage(data, res, 'Story Test Cases generation could not be queued.'))
  if (!data?.jobId) throw new Error(apiErrorMessage(data, res, 'Story Test Cases generation API did not return a job id.'))
  return data
}

export async function fetchDocStatus(jobId: string): Promise<StatusResponse | null> {
  let primaryError: unknown = null
  try {
    const res = await fetch(`${webhookUrl('/webhook/job-status-retrieve')}?jobId=${encodeURIComponent(jobId)}`, await withFreshAuth())
    if (!res.ok) throw new Error('Failed to fetch doc job status')
    const raw = await res.json()
    const data = Array.isArray(raw) ? raw[0] : raw
    if (data?.status && data.status !== 'not_found') return data
    if (data?.status === 'not_found') primaryError = new Error('Document job status returned not_found')
  } catch (error) {
    primaryError = error
  }

  const documents = await fetchGeneratedDocuments()
  const document = documents?.find((item) => item.jobId === jobId || item.id === jobId)
  if (document?.status) {
    return {
      jobId: document.jobId || document.id || jobId,
      status: document.status,
      output: document.output ?? null,
      documentType: document.documentType,
      projectName: document.projectName,
      url: document.url,
    }
  }

  if (primaryError) throw primaryError
  return null
}

export async function createDeliveryIntelligenceJob(payload: DeliveryIntelligenceJobPayload): Promise<DeliveryIntelligenceJobResponse> {
  const res = await fetch(webhookUrl('/webhook/di/jobs'), await withFreshAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }))
  const data = await res.json().catch(() => null)
  if (!res.ok || !data) {
    throw new Error(data?.error || data?.message || 'Delivery Intelligence job could not be queued.')
  }
  const jobId = data.jobId || data.job_id
  if (!jobId) throw new Error('Delivery Intelligence API did not return a job id.')
  return data as DeliveryIntelligenceJobResponse
}

export async function fetchDeliveryIntelligenceJob(jobId: string): Promise<DeliveryIntelligenceJobResponse | null> {
  const data = await fetchOptional<DeliveryIntelligenceJobResponse | DeliveryIntelligenceJobResponse[]>(
    `/webhook/di/jobs?jobId=${encodeURIComponent(jobId)}`,
    undefined,
    10000,
    true,
  )
  if (!data) return null
  return Array.isArray(data) ? data[0] ?? null : data
}

export async function searchDeliveryIntelligence(params: {
  q: string
  projectId?: string
  limit?: number
}): Promise<DeliveryIntelligenceSearchResponse | null> {
  const query = new URLSearchParams()
  query.set('q', params.q)
  if (params.projectId) query.set('projectId', params.projectId)
  query.set('limit', String(params.limit || 25))
  return fetchOptional<DeliveryIntelligenceSearchResponse>(`/webhook/di/search?${query.toString()}`, undefined, 10000, true)
}

function normalizeInsightsProfile(row: Record<string, any> | null | undefined): DeliveryIntelligenceProfile | null {
  if (!row) return null
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name,
    projectStatus: row.project_status,
    executiveSummary: row.executive_summary,
    deliverySummary: row.delivery_summary,
    technologySummary: row.technology_summary,
    reuseSummary: row.reuse_summary,
    recommendationSummary: row.recommendation_summary,
    signals: row.signals || {},
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    solutionHighlights: Array.isArray(row.solution_highlights) ? row.solution_highlights : [],
    learningHighlights: Array.isArray(row.learning_highlights) ? row.learning_highlights : [],
    recommendationHighlights: Array.isArray(row.recommendation_highlights) ? row.recommendation_highlights : [],
    qaArtifacts: Array.isArray(row.qa_artifacts) ? row.qa_artifacts : [],
    sourceCounts: row.source_counts || {},
    lastIntelligenceJobId: row.last_intelligence_job_id || null,
    updatedAt: row.updated_at,
  }
}

function normalizeInsightsGuide(row: Record<string, any> | null | undefined): DeliveryIntelligenceOnboardingGuide | null {
  if (!row) return null
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    audience: row.audience,
    overview: row.overview,
    firstSteps: Array.isArray(row.first_steps) ? row.first_steps.map(String) : [],
    keyAssets: Array.isArray(row.key_assets) ? row.key_assets : [],
    keyTechnologies: Array.isArray(row.key_technologies) ? row.key_technologies : [],
    solutionShortlist: Array.isArray(row.solution_shortlist) ? row.solution_shortlist : [],
    recommendationShortlist: Array.isArray(row.recommendation_shortlist) ? row.recommendation_shortlist : [],
    deliveryContext: row.delivery_context || {},
    sourceJobId: row.source_job_id || null,
    updatedAt: row.updated_at,
  }
}

async function fetchDeliveryIntelligenceInsightsFromSupabase(params: {
  projectId?: string
  limit?: number
}): Promise<DeliveryIntelligenceInsightsResponse | null> {
  if (!getAccessToken()) return null
  const warnings: string[] = []
  const limit = Math.min(params.limit || 25, 100)
  const [
    projects,
    profiles,
    onboardingGuides,
    similarityMatches,
    intelligenceJobs,
    jobMetrics,
    solutions,
    reviews,
    recommendations,
  ] = await Promise.all([
    fetchSupabaseRows('qops_projects?select=id,name,description,owner,module,release,status,tags,updated_at&limit=500', warnings),
    fetchSupabaseRows('di_project_profiles?select=*&order=updated_at.desc&limit=100', warnings),
    fetchSupabaseRows('di_onboarding_guides?select=*&order=updated_at.desc&limit=100', warnings),
    fetchSupabaseRows('di_similarity_matches?select=*&order=confidence_score.desc,updated_at.desc&limit=200', warnings),
    fetchSupabaseRows(`di_intelligence_jobs?select=job_id,status,job_type,project_id,input,output,error,created_at,updated_at&order=updated_at.desc&limit=${Math.max(limit, 25)}`, warnings),
    fetchSupabaseRows('di_job_metrics?select=*&order=updated_at.desc&limit=200', warnings),
    fetchSupabaseRows('di_reusable_solutions?select=id,title,summary,implementation_complexity,visibility_level,status,source_project_id,updated_at&order=updated_at.desc&limit=200', warnings),
    fetchSupabaseRows('di_solution_reviews?select=*&order=updated_at.desc&limit=300', warnings),
    fetchSupabaseRows('di_recommendations?select=id,project_id,title,summary,recommendation_type,status,confidence_score,updated_at&order=updated_at.desc&limit=200', warnings),
  ])
  if (warnings.length >= 8) return null

  const selectedProjectId = params.projectId || projects[0]?.id || null
  const projectMap = byId(projects)
  const profile = normalizeInsightsProfile(
    profiles.find((row) => !selectedProjectId || row.project_id === selectedProjectId) || null,
  )
  const onboardingGuide = normalizeInsightsGuide(
    onboardingGuides.find((row) => !selectedProjectId || row.project_id === selectedProjectId) || null,
  )
  const filteredSimilarity = similarityMatches
    .filter((row) => !selectedProjectId || row.project_id === selectedProjectId || row.related_project_id === selectedProjectId)
    .map((row) => ({
      id: row.id,
      projectId: row.project_id,
      relatedProjectId: row.related_project_id,
      relatedProjectName: projectMap[row.related_project_id]?.name || row.related_project_id,
      confidenceScore: (() => {
        const numeric = Number(row.confidence_score)
        if (!Number.isFinite(numeric)) return null
        if (numeric > 1) return Math.min(1, numeric / 100)
        return Math.max(0, Math.min(1, numeric))
      })(),
      rationale: row.rationale,
      overlappingTechnologies: Array.isArray(row.overlapping_technologies) ? row.overlapping_technologies : [],
      overlappingSolutions: Array.isArray(row.overlapping_solutions) ? row.overlapping_solutions : [],
      overlappingLearningCategories: Array.isArray(row.overlapping_learning_categories) ? row.overlapping_learning_categories : [],
      evidence: Array.isArray(row.evidence) ? row.evidence : [],
      status: row.status,
      updatedAt: row.updated_at,
    }))
    .slice(0, limit)
  const filteredJobs = intelligenceJobs
    .filter((row) => !selectedProjectId || row.project_id === selectedProjectId)
    .slice(0, limit)
    .map((row) => ({
      ok: true,
      jobId: row.job_id,
      job_id: row.job_id,
      status: row.status,
      jobType: row.job_type,
      job_type: row.job_type,
      projectId: row.project_id,
      project_id: row.project_id,
      input: row.input || {},
      output: row.output || {},
      error: row.error || null,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      updated_at: row.updated_at,
    }))
  const filteredMetrics = jobMetrics
    .filter((row) => !selectedProjectId || row.project_id === selectedProjectId)
    .slice(0, limit)
  const filteredSolutions = solutions
    .filter((row) => !selectedProjectId || row.source_project_id === selectedProjectId)
    .slice(0, limit)
  const reviewsBySolution = reviews.reduce<Record<string, Record<string, any>[]>>((acc, row) => {
    const key = String(row.solution_id || '')
    if (!key) return acc
    ;(acc[key] ||= []).push(row)
    return acc
  }, {})
  const governanceSolutions: DeliveryIntelligenceGovernanceSolution[] = filteredSolutions.map((solution) => ({
    id: solution.id,
    title: solution.title,
    summary: solution.summary || 'Reusable solution candidate synthesized from internal DI signals.',
    status: solution.status,
    visibility: solution.visibility_level,
    implementationComplexity: solution.implementation_complexity,
    sourceProjectId: solution.source_project_id,
    latestReview: reviewsBySolution[solution.id]?.[0] || null,
    reviewCount: reviewsBySolution[solution.id]?.length || 0,
    updatedAt: solution.updated_at,
  }))
  const governanceSummary = {
    totalSolutions: governanceSolutions.length,
    drafts: governanceSolutions.filter((item) => item.status === 'draft').length,
    inReview: governanceSolutions.filter((item) => item.status === 'review').length,
    published: governanceSolutions.filter((item) => item.status === 'published').length,
    reviewedSolutions: governanceSolutions.filter((item) => (item.reviewCount || 0) > 0).length,
  }

  return {
    ok: true,
    projectId: selectedProjectId,
    generatedAt: new Date().toISOString(),
    profile,
    onboardingGuide,
    similarityMatches: filteredSimilarity,
    jobs: filteredJobs,
    jobMetrics: filteredMetrics,
    governance: {
      summary: governanceSummary,
      solutions: governanceSolutions,
    },
    recommendations: recommendations
      .filter((row) => !selectedProjectId || row.project_id === selectedProjectId)
      .slice(0, limit),
    accessibleProjects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      owner: project.owner,
      status: project.status,
      module: project.module,
      release: project.release,
    })),
    source: 'supabase_direct_rls_fallback',
    warnings,
  }
}

function mergeDeliveryIntelligenceInsights(
  primary: DeliveryIntelligenceInsightsResponse,
  fallback: DeliveryIntelligenceInsightsResponse | null,
): DeliveryIntelligenceInsightsResponse {
  if (!fallback?.ok) return primary
  return {
    ...fallback,
    ...primary,
    profile: primary.profile || fallback.profile || null,
    onboardingGuide: primary.onboardingGuide || fallback.onboardingGuide || null,
    similarityMatches: Array.isArray(primary.similarityMatches) && primary.similarityMatches.length ? primary.similarityMatches : fallback.similarityMatches || [],
    jobs: Array.isArray(primary.jobs) && primary.jobs.length ? primary.jobs : fallback.jobs || [],
    jobMetrics: Array.isArray(primary.jobMetrics) && primary.jobMetrics.length ? primary.jobMetrics : fallback.jobMetrics || [],
    governance: {
      summary: primary.governance?.summary || fallback.governance?.summary || {},
      solutions: Array.isArray(primary.governance?.solutions) && primary.governance?.solutions.length
        ? primary.governance?.solutions
        : fallback.governance?.solutions || [],
    },
    recommendations: Array.isArray(primary.recommendations) && primary.recommendations.length ? primary.recommendations : fallback.recommendations || [],
    accessibleProjects: Array.isArray(primary.accessibleProjects) && primary.accessibleProjects.length ? primary.accessibleProjects : fallback.accessibleProjects || [],
    warnings: Array.isArray(primary.warnings) && primary.warnings.length
      ? primary.warnings
      : Array.isArray(fallback.warnings)
        ? fallback.warnings
        : primary.warnings,
  }
}

function supabaseRestHeaders() {
  const token = getAccessToken()
  if (!token) return null
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export function mapDocumentTypeToArtifact(value?: string): DocumentArtifactKey | null {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  switch (normalized) {
    case 'strategy':
    case 'test_strategy':
      return 'strategy'
    case 'plan':
    case 'test_plan':
      return 'plan'
    case 'risk':
    case 'risk_matrix':
      return 'risk'
    case 'testcases':
    case 'test_cases':
    case 'story_test_cases':
      return 'testCases'
    case 'epics_and_user_stories':
    case 'epics_user_stories':
    case 'user_stories':
      return 'epicsAndStories'
    case 'traceability_matrix':
      return 'traceability_matrix'
    default:
      return null
  }
}

async function fetchSupabaseRows<T = Record<string, any>>(path: string, warnings: string[]): Promise<T[]> {
  const headers = supabaseRestHeaders()
  if (!headers) return []
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      warnings.push(`${path.split('?')[0]} returned ${res.status}${body ? `: ${body.slice(0, 160)}` : ''}`)
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    warnings.push(`${path.split('?')[0]} could not be read: ${error instanceof Error ? error.message : 'unknown error'}`)
    return []
  }
}

function byId<T extends Record<string, any>>(rows: T[]) {
  return Object.fromEntries(rows.map((row) => [row.id, row])) as Record<string, T>
}

function isVisibleForProject(row: Record<string, any>, projectId?: string) {
  if (!projectId) return true
  return [row.project_id, row.source_project_id, row.source_entity_id, row.target_entity_id].includes(projectId)
}

function directCatalogCount(data: DeliveryIntelligenceCatalogResponse['data'], projectCount = 0) {
  return {
    projects: projectCount,
    jobs: data?.jobs?.length || 0,
    solutions: data?.solutions?.length || 0,
    technologies: data?.technologies?.length || 0,
    projectTechnologies: data?.technologies?.reduce((total: number, item: any) => total + (Array.isArray(item.projects) ? item.projects.length : 0), 0) || 0,
    solutionTechnologies: data?.solutions?.reduce((total: number, item: any) => total + (Array.isArray(item.technologies) ? item.technologies.length : 0), 0) || 0,
    solutionAssets: data?.solutions?.reduce((total: number, item: any) => total + (Array.isArray(item.assets) ? item.assets.length : 0), 0) || 0,
    learnings: data?.learnings?.length || 0,
    relationships: data?.relationships?.length || 0,
    recommendations: data?.recommendations?.length || 0,
    latestJob: data?.jobs?.[0] || null,
  }
}

async function fetchDeliveryIntelligenceCatalogFromSupabase(params: {
  entity?: DeliveryIntelligenceCatalogEntity
  projectId?: string
  limit?: number
}): Promise<DeliveryIntelligenceCatalogResponse | null> {
  if (!getAccessToken()) return null
  const warnings: string[] = []
  const limit = Math.min(params.limit || 100, 300)
  const [
    projects,
    jobs,
    solutions,
    technologies,
    projectTechnologies,
    solutionTechnologies,
    solutionAssets,
    learnings,
    relationships,
    recommendations,
  ] = await Promise.all([
    fetchSupabaseRows('qops_projects?select=id,name,owner,status,updated_at&limit=500', warnings),
    fetchSupabaseRows(`di_intelligence_jobs?select=job_id,status,job_type,project_id,input,output,error,created_at,updated_at&order=updated_at.desc&limit=${limit}`, warnings),
    fetchSupabaseRows(`di_reusable_solutions?select=id,title,slug,summary,problem_statement,implementation_approach,qa_approach,risk_factors,production_learnings,implementation_complexity,applicability_tags,visibility_level,owner_team,source_project_id,ai_summary,status,created_at,updated_at&order=updated_at.desc&limit=${limit}`, warnings),
    fetchSupabaseRows('di_technologies?select=id,name,normalized_name,category,description,vendor,tags,created_at,updated_at&order=updated_at.desc&limit=500', warnings),
    fetchSupabaseRows('di_project_technologies?select=id,project_id,technology_id,version,confidence_score,source_type,source_ref,created_at&order=created_at.desc&limit=500', warnings),
    fetchSupabaseRows('di_solution_technologies?select=id,solution_id,technology_id,created_at&order=created_at.desc&limit=500', warnings),
    fetchSupabaseRows('di_solution_assets?select=id,solution_id,asset_type,title,url,storage_path,description,visibility_level,created_at&order=created_at.desc&limit=500', warnings),
    fetchSupabaseRows(`di_organizational_learnings?select=id,title,category,source_project_id,learning_summary,impact_level,reusable_recommendation,visibility_level,source_ref,created_by_ai,created_at,updated_at&order=updated_at.desc&limit=${limit}`, warnings),
    fetchSupabaseRows(`di_knowledge_relationships?select=id,source_entity_type,source_entity_id,target_entity_type,target_entity_id,relationship_type,confidence_score,evidence,created_by_ai,visibility_level,created_at&order=created_at.desc&limit=${limit}`, warnings),
    fetchSupabaseRows(`di_recommendations?select=id,project_id,recommendation_type,title,summary,rationale,related_entity_type,related_entity_id,confidence_score,status,assigned_to,feedback,created_at,updated_at&order=updated_at.desc&limit=${limit}`, warnings),
  ])
  if (warnings.length >= 10) return null

  const projectId = params.projectId
  const projectMap = byId(projects)
  const techById = byId(technologies)
  const filteredSolutions = solutions.filter((row) => isVisibleForProject(row, projectId)).slice(0, limit)
  const solutionById = byId(filteredSolutions)
  const filteredLearnings = learnings.filter((row) => isVisibleForProject(row, projectId)).slice(0, limit)
  const learningById = byId(filteredLearnings)
  const filteredRecommendations = recommendations.filter((row) => isVisibleForProject(row, projectId)).slice(0, limit)
  const recommendationById = byId(filteredRecommendations)
  const filteredProjectTech = projectTechnologies.filter((row) => !projectId || row.project_id === projectId)
  const filteredJobs = jobs.filter((row) => isVisibleForProject(row, projectId)).slice(0, limit)
  const filteredRelationships = relationships.filter((row) => isVisibleForProject(row, projectId)).slice(0, limit)
  const solutionIds = new Set(filteredSolutions.map((row) => row.id))
  const visibleTechIds = new Set(filteredProjectTech.map((row) => row.technology_id))
  solutionTechnologies.filter((row) => solutionIds.has(row.solution_id)).forEach((row) => visibleTechIds.add(row.technology_id))

  const assetsBySolution = solutionAssets.reduce<Record<string, any[]>>((acc, asset) => {
    if (solutionIds.has(asset.solution_id)) (acc[asset.solution_id] ||= []).push(asset)
    return acc
  }, {})
  const techBySolution = solutionTechnologies.reduce<Record<string, any[]>>((acc, link) => {
    const tech = techById[link.technology_id]
    if (solutionIds.has(link.solution_id) && tech) (acc[link.solution_id] ||= []).push({ id: tech.id, name: tech.name, category: tech.category })
    return acc
  }, {})
  const resolveTitle = (type: string, id: string) => {
    if (!id) return ''
    if (type === 'technology') return techById[id]?.name || id
    if (type === 'reusable_solution' || type === 'solution') return solutionById[id]?.title || id
    if (type === 'learning') return learningById[id]?.title || id
    if (type === 'recommendation') return recommendationById[id]?.title || id
    return techById[id]?.name || solutionById[id]?.title || learningById[id]?.title || recommendationById[id]?.title || id
  }

  const data = {
    jobs: filteredJobs.map((job) => ({
      type: 'job',
      id: job.job_id,
      jobId: job.job_id,
      title: job.job_id,
      status: job.status,
      jobType: job.job_type,
      projectId: job.project_id,
      projectName: projectMap[job.project_id]?.name || job.project_id,
      input: job.input || {},
      output: job.output || {},
      error: job.error,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    })),
    solutions: filteredSolutions.map((solution) => ({
      type: 'solution',
      id: solution.id,
      title: solution.title,
      slug: solution.slug,
      summary: solution.summary || solution.ai_summary || solution.problem_statement,
      problemStatement: solution.problem_statement,
      implementationApproach: solution.implementation_approach,
      qaApproach: solution.qa_approach,
      riskFactors: solution.risk_factors || [],
      productionLearnings: solution.production_learnings || [],
      implementationComplexity: solution.implementation_complexity,
      applicabilityTags: solution.applicability_tags || [],
      visibility: solution.visibility_level,
      status: solution.status,
      sourceProjectId: solution.source_project_id,
      projectId: solution.source_project_id,
      projectName: projectMap[solution.source_project_id]?.name || solution.source_project_id,
      technologies: techBySolution[solution.id] || [],
      assets: assetsBySolution[solution.id] || [],
      updatedAt: solution.updated_at,
      raw: solution,
    })),
    technologies: technologies
      .filter((tech) => !projectId || visibleTechIds.has(tech.id))
      .map((tech) => {
        const usage = filteredProjectTech.filter((item) => item.technology_id === tech.id)
        const relatedSolutions = solutionTechnologies.filter((item) => item.technology_id === tech.id && solutionById[item.solution_id])
        return {
          type: 'technology',
          id: tech.id,
          title: tech.name,
          name: tech.name,
          normalizedName: tech.normalized_name,
          summary: tech.description || tech.category || 'Technology detected by Delivery Intelligence.',
          category: tech.category,
          vendor: tech.vendor,
          tags: tech.tags || [],
          usageCount: usage.length,
          projects: usage.map((item) => ({ projectId: item.project_id, projectName: projectMap[item.project_id]?.name || item.project_id, confidenceScore: item.confidence_score, sourceType: item.source_type, sourceRef: item.source_ref })),
          relatedSolutions: relatedSolutions.map((item) => ({ solutionId: item.solution_id, title: solutionById[item.solution_id]?.title })),
          updatedAt: tech.updated_at,
          raw: tech,
        }
      })
      .slice(0, limit),
    learnings: filteredLearnings.map((learning) => ({
      type: 'learning',
      id: learning.id,
      title: learning.title,
      summary: learning.learning_summary,
      category: learning.category,
      impactLevel: learning.impact_level,
      reusableRecommendation: learning.reusable_recommendation,
      visibility: learning.visibility_level,
      projectId: learning.source_project_id,
      sourceProjectId: learning.source_project_id,
      projectName: projectMap[learning.source_project_id]?.name || learning.source_project_id,
      sourceRef: learning.source_ref,
      createdByAi: learning.created_by_ai,
      createdAt: learning.created_at,
      updatedAt: learning.updated_at,
      raw: learning,
    })),
    relationships: filteredRelationships.map((relationship) => ({
      type: 'relationship',
      id: relationship.id,
      title: `${relationship.source_entity_type} ${relationship.relationship_type} ${relationship.target_entity_type}`,
      summary: `${resolveTitle(relationship.source_entity_type, relationship.source_entity_id)} -> ${resolveTitle(relationship.target_entity_type, relationship.target_entity_id)}`,
      sourceEntityType: relationship.source_entity_type,
      sourceEntityId: relationship.source_entity_id,
      sourceTitle: resolveTitle(relationship.source_entity_type, relationship.source_entity_id),
      targetEntityType: relationship.target_entity_type,
      targetEntityId: relationship.target_entity_id,
      targetTitle: resolveTitle(relationship.target_entity_type, relationship.target_entity_id),
      relationshipType: relationship.relationship_type,
      confidenceScore: relationship.confidence_score,
      evidence: relationship.evidence || [],
      visibility: relationship.visibility_level,
      createdAt: relationship.created_at,
      raw: relationship,
    })),
    recommendations: filteredRecommendations.map((recommendation) => ({
      type: 'recommendation',
      id: recommendation.id,
      title: recommendation.title,
      summary: recommendation.summary,
      rationale: recommendation.rationale,
      recommendationType: recommendation.recommendation_type,
      status: recommendation.status,
      confidenceScore: recommendation.confidence_score,
      projectId: recommendation.project_id,
      projectName: projectMap[recommendation.project_id]?.name || recommendation.project_id,
      relatedEntityType: recommendation.related_entity_type,
      relatedEntityId: recommendation.related_entity_id,
      relatedTitle: resolveTitle(recommendation.related_entity_type, recommendation.related_entity_id),
      feedback: recommendation.feedback || {},
      createdAt: recommendation.created_at,
      updatedAt: recommendation.updated_at,
      raw: recommendation,
    })),
  }
  const counts = directCatalogCount(data, projects.length)
  const entity = params.entity || 'overview'
  const items = entity === 'all'
    ? [...data.solutions, ...data.technologies, ...data.learnings, ...data.recommendations, ...data.relationships, ...data.jobs]
    : entity === 'overview'
      ? []
      : data[entity as keyof typeof data] || []
  return {
    ok: true,
    entity,
    projectId: projectId || null,
    generatedAt: new Date().toISOString(),
    counts,
    items,
    data: { overview: counts, ...data },
    source: 'supabase_direct_rls_fallback',
    warnings,
  }
}

export async function fetchDeliveryIntelligenceCatalog(params: {
  entity?: DeliveryIntelligenceCatalogEntity
  projectId?: string
  limit?: number
}): Promise<DeliveryIntelligenceCatalogResponse | null> {
  const query = new URLSearchParams()
  query.set('entity', params.entity || 'overview')
  if (params.projectId) query.set('projectId', params.projectId)
  query.set('limit', String(params.limit || 100))
  const catalog = await fetchOptional<DeliveryIntelligenceCatalogResponse>(`/webhook/di/catalog?${query.toString()}`, undefined, 15000, true)
  if (catalog?.ok) return catalog
  return fetchDeliveryIntelligenceCatalogFromSupabase(params)
}

export async function fetchDeliveryIntelligenceInsights(params: {
  projectId?: string
  limit?: number
}): Promise<DeliveryIntelligenceInsightsResponse | null> {
  const query = new URLSearchParams()
  if (params.projectId) query.set('projectId', params.projectId)
  query.set('limit', String(params.limit || 25))
  const insights = await fetchOptional<DeliveryIntelligenceInsightsResponse>(`/webhook/di/insights?${query.toString()}`, undefined, 15000, true)
  if (insights?.ok) {
    const needsSupplementalData = !Array.isArray(insights.jobs) || !insights.jobs.length
    if (!needsSupplementalData) return insights
    const fallback = await fetchDeliveryIntelligenceInsightsFromSupabase(params)
    return mergeDeliveryIntelligenceInsights(insights, fallback)
  }
  return fetchDeliveryIntelligenceInsightsFromSupabase(params)
}

export async function updateDeliveryRecommendationFeedback(payload: {
  recommendationId: string
  action: DeliveryRecommendationFeedbackAction
  comment?: string
  feedback?: Record<string, any>
}): Promise<any | null> {
  return fetchOptional('/webhook/di/recommendations/feedback', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 10000, true)
}

export async function submitDeliveryIntelligenceSolutionReview(payload: DeliveryIntelligenceSolutionReviewPayload): Promise<any | null> {
  const workflowResult = await fetchOptional<any>('/webhook/di/solutions/review', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 10000, true)
  if (workflowResult?.ok) return workflowResult

  const headers = supabaseRestHeaders()
  if (!headers) return workflowResult
  try {
    const reviewRes = await fetch(`${SUPABASE_URL}/rest/v1/di_solution_reviews`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        solution_id: payload.solutionId,
        project_id: payload.projectId || null,
        decision: payload.decision,
        review_notes: payload.reviewNotes || null,
        governance_tags: payload.governanceTags || [],
        visibility_override: payload.visibilityOverride || null,
        published_title: payload.publishedTitle || null,
        published_summary: payload.publishedSummary || null,
      }),
    })
    if (!reviewRes.ok) return workflowResult

    const patchBody: Record<string, any> = {
      status: payload.decision === 'submitted' ? 'review' : payload.decision,
      updated_at: new Date().toISOString(),
    }
    if (payload.visibilityOverride) patchBody.visibility_level = payload.visibilityOverride
    if (payload.publishedTitle) patchBody.title = payload.publishedTitle
    if (payload.publishedSummary) patchBody.summary = payload.publishedSummary

    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/di_reusable_solutions?id=eq.${encodeURIComponent(payload.solutionId)}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patchBody),
    })
    if (!updateRes.ok) return workflowResult
    const updated = await updateRes.json().catch(() => [])
    return {
      ok: true,
      solutionId: payload.solutionId,
      status: updated?.[0]?.status || patchBody.status,
      decision: payload.decision,
      source: 'supabase_direct_fallback',
    }
  } catch {
    return workflowResult
  }
}

export function isTemplateError(status: unknown): boolean {
  return typeof status === 'string' && status.includes('{{')
}

export async function fetchAnalyticsSummary(params: { pipeline?: string; days?: number; projectId?: string } = {}): Promise<AnalyticsSummary | null> {
  const query = new URLSearchParams()
  query.set('pipeline', params.pipeline || 'all')
  query.set('days', String(params.days || 30))
  if (params.projectId) query.set('projectId', params.projectId)
  return fetchOptional<AnalyticsSummary>(`/webhook/analytics-summary?${query.toString()}`, undefined, 10000, true)
}

export async function fetchHealthStatus(): Promise<HealthStatus | null> {
  return fetchOptional<HealthStatus>('/webhook/health', undefined, 10000)
}

export async function fetchInfrastructureLoad(): Promise<InfrastructureLoad | null> {
  const data = await fetchOptional<InfrastructureLoad>('/webhook/infrastructure-load', undefined, 10000, true)
  return data?.score !== undefined ? data : null
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  return fetchOptional<CurrentUser>('/webhook/me', undefined, 10000, true)
}

export async function fetchUsers(): Promise<ApiUser[] | null> {
  const data = await fetchOptional<ApiUser[] | { users?: ApiUser[] }>('/webhook/users', undefined, 10000, true)
  if (!data) return null
  const users = Array.isArray(data) ? data : data.users
  return Array.isArray(users) ? users : null
}

export async function inviteUser(payload: InviteUserPayload): Promise<ApiUser | null> {
  const { projectAssignments: _projectAssignments, ...invitePayload } = payload
  const data = await fetchOptional<ApiUser | { user?: ApiUser }>('/webhook/users/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...invitePayload, redirectTo: `${window.location.origin}/auth/callback` }),
  }, 15000, true)
  if (!data) return null
  return 'user' in data && data.user ? data.user : data as ApiUser
}

export async function updateUser(payload: UpdateUserPayload): Promise<ApiUser | null> {
  const { projectAssignments: _projectAssignments, ...userPayload } = payload
  const data = await fetchOptional<ApiUser | { user?: ApiUser }>('/webhook/users/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload),
  }, 10000, true)
  if (!data) return null
  return 'user' in data && data.user ? data.user : data as ApiUser
}

export async function updateUserProjectAssignments(payload: {
  userId: string
  projectAssignments: ProjectAssignmentPayload[]
}): Promise<{ ok?: boolean; userId?: string; assignments?: ProjectAssignmentPayload[] } | null> {
  return fetchOptional('/webhook/users/project-assignments', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 10000, true)
}

export async function acceptUserInvite(): Promise<CurrentUser | null> {
  const data = await fetchOptional<CurrentUser | { user?: CurrentUser }>('/webhook/users/accept-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptedAt: new Date().toISOString() }),
  }, 10000, true)
  if (!data) return null
  return 'user' in data && data.user ? data.user : data as CurrentUser
}

export async function auditPasswordReset(): Promise<boolean> {
  const data = await fetchOptional<{ ok?: boolean }>('/webhook/users/password-reset-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetAt: new Date().toISOString() }),
  }, 10000, true)
  return Boolean(data?.ok)
}

export async function fetchProjects(): Promise<ApiProject[] | null> {
  const data = await fetchOptional<ApiProject[] | { projects?: ApiProject[] }>('/webhook/projects', undefined, 10000, true)
  if (data) {
    const projects = Array.isArray(data) ? data : data.projects
    if (Array.isArray(projects)) return projects.map((project) => normalizeApiProject(project as Record<string, any>))
  }

  const warnings: string[] = []
  const projects = await fetchSupabaseRows(
    'qops_projects?select=id,name,description,owner,module,release,status,tags,created_at,updated_at&order=updated_at.desc&limit=500',
    warnings,
  )
  return projects.length ? projects.map(normalizeApiProject) : null
}

export async function createProjectRecord(project: ApiProject): Promise<ApiProject | null> {
  const data = await fetchOptional<ApiProject | { project?: ApiProject }>('/webhook/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  }, 10000, true)
  if (data) {
    const saved = 'project' in data && data.project ? data.project : data as ApiProject
    if (saved?.name) return normalizeApiProject(saved as Record<string, any>)
  }

  const headers = supabaseRestHeaders()
  if (!headers || !project.name?.trim()) return null
  const warnings: string[] = []
  const existing = await fetchSupabaseRows(
    `qops_projects?select=id,name,description,owner,module,release,status,tags,created_at,updated_at&name=eq.${encodeURIComponent(project.name.trim())}&order=created_at.desc&limit=1`,
    warnings,
  )
  if (existing[0]) return normalizeApiProject(existing[0])

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/qops_projects`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id: project.id,
        name: project.name.trim(),
        description: project.description || null,
        owner: project.owner || null,
        module: project.module || null,
        release: project.release || null,
        tags: Array.isArray(project.tags) ? project.tags : [],
        status: project.status || 'draft',
      }),
    })
    if (!res.ok) return null
    const rows = await res.json().catch(() => [])
    return Array.isArray(rows) && rows[0] ? normalizeApiProject(rows[0]) : null
  } catch {
    return null
  }
}

export async function fetchArtifacts(): Promise<ApiArtifact[] | null> {
  const data = await fetchOptional<ApiArtifact[] | { artifacts?: ApiArtifact[] }>('/webhook/artifacts')
  if (!data) return null
  const artifacts = Array.isArray(data) ? data : data.artifacts
  return Array.isArray(artifacts) ? artifacts : null
}

export async function fetchGeneratedDocuments(): Promise<ApiGeneratedDocument[] | null> {
  const data = await fetchOptional<ApiGeneratedDocument[] | { documents?: ApiGeneratedDocument[] }>('/webhook/generated-documents', undefined, 10000, true)
  if (!data) return null
  const documents = Array.isArray(data) ? data : data.documents
  return Array.isArray(documents) ? documents : null
}

export async function fetchGenerationJobMetrics(): Promise<ApiJobMetric[] | null> {
  const summary = await fetchAnalyticsSummary({ pipeline: 'generation', days: 90 })
  const summaryMetrics = (summary?.recentJobs ?? [])
    .filter((job) => String(job.pipeline || 'generation') !== 'ingestion')
    .map((job): ApiJobMetric => ({
      jobId: job.jobId,
      projectName: job.projectName || null,
      documentType: job.documentType || null,
      pipeline: job.pipeline || 'generation',
      event: job.event || null,
      status: job.status || null,
      wordCount: job.wordCount ?? null,
      tokensTotal: job.tokensTotal ?? null,
      estimatedCostUsd: job.estimatedCostUsd ?? null,
      durationMs: job.durationMs ?? null,
      metadata: job.metadata ?? null,
      createdAt: job.createdAt || null,
    }))
  return summaryMetrics.length ? summaryMetrics : null
}

export async function fetchAuditEvents(): Promise<ApiAuditEvent[] | null> {
  const data = await fetchOptional<ApiAuditEvent[] | { events?: ApiAuditEvent[] }>('/webhook/audit-events', undefined, 10000, true)
  if (!data) return null
  const events = Array.isArray(data) ? data : data.events
  return Array.isArray(events) ? events : null
}

export async function reprocessArtifact(artifactId: string): Promise<UploadResponse | null> {
  const data = await fetchOptional<UploadResponse>('/webhook/artifacts/reprocess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifactId }),
  }, 10000, true)
  return data?.jobId ? data : null
}

export type IntegrationSetting = {
  environmentKey: string
  integrationKey: string
  scope?: IntegrationSettingsScope
  userId?: string
  projectId?: string
  displayName?: string
  enabled: boolean
  config: Record<string, any>
  secretRefs?: Record<string, any>
  status?: string
  settingsVersion?: number
  updatedAt?: string
  latestTest?: {
    status?: string
    latencyMs?: number
    message?: string
    checkedAt?: string
    checkedBy?: string
  } | null
}

export type IntegrationSettingsScope = 'workspace' | 'user' | 'project'

export type EnvironmentSetting = {
  environmentKey: string
  displayName?: string
  apiBaseUrl?: string
  n8nBaseUrl?: string
  webhookPaths?: Record<string, string>
  isActive: boolean
  updatedAt?: string
  integrations: IntegrationSetting[]
}

export type SettingsResponse = {
  environments: EnvironmentSetting[]
  environmentSettings?: any[]
  integrations?: any[]
  userIntegrations?: IntegrationSetting[]
  projectOverrides?: IntegrationSetting[]
  projectMemberships?: Array<{ project_id?: string; projectId?: string; project_role?: string; role?: string }>
  currentUser?: Pick<CurrentUser, 'id' | 'email' | 'name' | 'role' | 'status'> | null
  latestResults?: any[]
}

export async function fetchSettings(params: { environmentKey?: string; projectId?: string } = {}): Promise<SettingsResponse | null> {
  const query = new URLSearchParams()
  if (params.environmentKey) query.set('environmentKey', params.environmentKey)
  if (params.projectId) query.set('projectId', params.projectId)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  try {
    const res = await fetch(webhookUrl(`/webhook/settings${suffix}`), await withFreshAuth())
    if (!res.ok) return null
    return (await res.json()) as SettingsResponse
  } catch {
    return null
  }
}

export async function patchSettings(payload: {
  environmentKey?: string
  integrationKey?: string
  scope?: IntegrationSettingsScope
  projectId?: string
  integration?: {
    integrationKey?: string
    scope?: IntegrationSettingsScope
    projectId?: string
    enabled?: boolean
    config?: Record<string, any>
    secretRefs?: Record<string, any>
    status?: string
  }
  config?: Record<string, any>
  enabled?: boolean
  actorUserId?: string
  actorName?: string
}): Promise<any | null> {
  try {
    const res = await fetch(webhookUrl('/webhook/settings'), await withFreshAuth({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }))
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function testIntegration(integrationKey: string): Promise<any | null> {
  return fetchOptional<any>('/webhook/integrations/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integrationKey, environmentKey: 'local' }),
  }, 15000, true)
}

export async function testAllIntegrations(): Promise<any | null> {
  return fetchOptional<any>('/webhook/integrations/test-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ environmentKey: 'local' }),
  }, 20000, true)
}
