import { getAccessToken } from './auth'

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
    const res = await fetch(webhookUrl(path), authenticated ? withAuth(request) : request)
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

export type JobStatus = 'idle' | 'queued' | 'pending' | 'processing' | 'completed' | 'failed' | 'not_found'

export type UploadResponse = { jobId: string; status?: string }

export type StatusResponse = {
  status: JobStatus | string
  output?: any
  [key: string]: any
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
}

export type ApiGeneratedDocument = {
  id?: string
  jobId?: string
  projectName: string
  artifactLabel?: string
  documentType?: string
  createdAt?: string
  status?: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  output?: any
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
  durationMs?: number
  wordCount?: number
  chunkCount?: number
  totalFiles?: number
  tokensTotal?: number
  estimatedCostUsd?: number
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
    successRate: number
    totalCostUsd: number
    avgCostPerDocument: number
    totalTokensConsumed: number
    totalChunksIngested: number
    avgDurationMs: number
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
    avgProcessingDurationMs: number
    totalFilesProcessed: number
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
  transcript: File | null
  images: File[]
}

export async function uploadKnowledgeBase(payload: KnowledgeBasePayload): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('projectName', payload.projectName)
  if (payload.projectId) fd.append('projectId', payload.projectId)
  fd.append('environment', 'local')
  if (payload.brd) fd.append('brd', payload.brd)
  if (payload.frd) fd.append('frd', payload.frd)
  if (payload.hld) fd.append('hld', payload.hld)
  if (payload.lld) fd.append('lld', payload.lld)
  if (payload.transcript) fd.append('transcript', payload.transcript)
  payload.images.forEach((img) => fd.append('image', img))

  const res = await fetch(webhookUrl('/webhook/upload-test-artifacts'), withAuth({ method: 'POST', body: fd }))
  const data = await res.json()
  if (!data?.jobId) throw new Error('Invalid response from backend')
  return data
}

export async function fetchKbStatus(jobId: string): Promise<StatusResponse | null> {
  const res = await fetch(`${webhookUrl('/webhook/job-status')}?jobId=${encodeURIComponent(jobId)}`)
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
      return 'test_cases'
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
}

export async function generateDocument(payload: GenerateDocPayload): Promise<UploadResponse> {
  const res = await fetch(webhookUrl('/webhook/generate-qa-doc'), {
    method: 'POST',
    ...withAuth({ headers: { 'Content-Type': 'application/json' } }),
    body: JSON.stringify({
      projectId: payload.projectId,
      projectName: payload.projectName,
      documentType: mapArtifactToDocumentType(payload.artifact),
      productOwner: payload.productOwner || 'PO',
      environment: 'local',
    }),
  })
  const data = await res.json()
  if (!data?.jobId) throw new Error('Invalid response from backend')
  return data
}

export async function fetchDocStatus(jobId: string): Promise<StatusResponse | null> {
  const res = await fetch(`${webhookUrl('/webhook/job-status-retrieve')}?jobId=${encodeURIComponent(jobId)}`)
  if (!res.ok) throw new Error('Failed to fetch doc job status')
  const raw = await res.json()
  const data = Array.isArray(raw) ? raw[0] : raw
  return data ?? null
}

export function isTemplateError(status: unknown): boolean {
  return typeof status === 'string' && status.includes('{{')
}

export async function fetchAnalyticsSummary(params: { pipeline?: string; days?: number } = {}): Promise<AnalyticsSummary | null> {
  const query = new URLSearchParams()
  query.set('pipeline', params.pipeline || 'all')
  query.set('days', String(params.days || 30))
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
  if (!data) return null
  const projects = Array.isArray(data) ? data : data.projects
  return Array.isArray(projects) ? projects : null
}

export async function createProjectRecord(project: ApiProject): Promise<ApiProject | null> {
  return fetchOptional<ApiProject>('/webhook/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  }, 10000, true)
}

export async function fetchArtifacts(): Promise<ApiArtifact[] | null> {
  const data = await fetchOptional<ApiArtifact[] | { artifacts?: ApiArtifact[] }>('/webhook/artifacts')
  if (!data) return null
  const artifacts = Array.isArray(data) ? data : data.artifacts
  return Array.isArray(artifacts) ? artifacts : null
}

export async function fetchGeneratedDocuments(): Promise<ApiGeneratedDocument[] | null> {
  const data = await fetchOptional<ApiGeneratedDocument[] | { documents?: ApiGeneratedDocument[] }>('/webhook/generated-documents')
  if (!data) return null
  const documents = Array.isArray(data) ? data : data.documents
  return Array.isArray(documents) ? documents : null
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
  latestResults?: any[]
}

export async function fetchSettings(): Promise<SettingsResponse | null> {
  return fetchOptional<SettingsResponse>('/webhook/settings', undefined, 10000, true)
}

export async function patchSettings(payload: {
  environmentKey?: string
  integrationKey?: string
  integration?: {
    integrationKey?: string
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
  return fetchOptional<any>('/webhook/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 10000, true)
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
