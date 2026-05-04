export const API_BASE_URL_KEY = 'qops-agent-api-base-url'
export const DEFAULT_API_BASE_URL = 'http://localhost:5678'

export function getApiBaseUrl() {
  return localStorage.getItem(API_BASE_URL_KEY) || DEFAULT_API_BASE_URL
}

function webhookUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

export type JobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed' | 'not_found'

export type UploadResponse = { jobId: string; status?: string }

export type StatusResponse = {
  status: JobStatus | string
  output?: any
  [key: string]: any
}

export type KnowledgeBasePayload = {
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
  if (payload.brd) fd.append('brd', payload.brd)
  if (payload.frd) fd.append('frd', payload.frd)
  if (payload.hld) fd.append('hld', payload.hld)
  if (payload.lld) fd.append('lld', payload.lld)
  if (payload.transcript) fd.append('transcript', payload.transcript)
  payload.images.forEach((img) => fd.append('image', img))

  const res = await fetch(webhookUrl('/webhook/upload-test-artifacts'), { method: 'POST', body: fd })
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
  projectName: string
  artifact: DocumentArtifactKey
}

export async function generateDocument(payload: GenerateDocPayload): Promise<UploadResponse> {
  const res = await fetch(webhookUrl('/webhook/generate-qa-doc'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: payload.projectName,
      documentType: mapArtifactToDocumentType(payload.artifact),
      productOwner: 'PO',
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
