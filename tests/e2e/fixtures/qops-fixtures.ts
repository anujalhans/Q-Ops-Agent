import type { Page, Route } from '@playwright/test'

export const nowIso = '2026-05-09T10:00:00.000Z'

export const adminUser = {
  id: 'user-admin-1',
  authUserId: 'auth-admin-1',
  email: 'admin@qops.test',
  name: 'Admin User',
  title: 'QA Lead',
  role: 'admin',
  status: 'active',
  projects: ['All projects'],
}

export const registeredUser = {
  id: 'user-registered-1',
  authUserId: 'auth-registered-1',
  email: 'analyst@qops.test',
  name: 'Registered Analyst',
  title: 'QA Analyst',
  role: 'registered_user',
  status: 'active',
  projects: ['project-payments'],
  projectRoles: [{ projectId: 'project-payments', projectName: 'Payments Modernization', role: 'editor' }],
}

export const disabledUser = {
  ...registeredUser,
  id: 'user-disabled-1',
  authUserId: 'auth-disabled-1',
  email: 'disabled@qops.test',
  name: 'Disabled User',
  status: 'disabled',
}

export const projects = [
  {
    id: 'project-payments',
    name: 'Payments Modernization',
    description: 'Checkout and settlement modernization.',
    owner: 'Product Owner',
    module: 'Checkout',
    release: 'Release 2.4',
    tags: ['payments', 'regression'],
    status: 'ready',
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'project-claims',
    name: 'Claims Portal',
    description: 'Insurance workflow modernization.',
    owner: 'Claims Owner',
    module: 'Claims',
    release: 'Release 1.1',
    tags: ['claims'],
    status: 'draft',
    createdAt: nowIso,
    updatedAt: nowIso,
  },
]

export const artifacts = [
  {
    id: 'artifact-1',
    projectName: 'Payments Modernization',
    type: 'BRD',
    fileName: 'payments-brd.pdf',
    size: 2048,
    uploadedAt: nowIso,
    status: 'processed',
    url: 'https://example.test/payments-brd.pdf',
    jobId: 'ING-TEST-001',
  },
]

export const generatedDocuments = [
  {
    id: 'doc-1',
    jobId: 'GEN-TEST-001',
    projectName: 'Payments Modernization',
    documentType: 'test_strategy',
    artifactLabel: 'Test Strategy',
    createdAt: nowIso,
    status: 'completed',
    url: 'https://example.test/test-strategy',
    output: {
      url: 'https://example.test/test-strategy',
      wordCount: 1840,
      tokenUsage: { total: 6200, estimatedCostUsd: 0.012 },
    },
  },
]

export const auditEvents = [
  {
    id: 'audit-1',
    actor: 'Admin User',
    action: 'Document generation completed',
    project: 'Payments Modernization',
    entity: 'Test Strategy',
    status: 'success',
    timestamp: nowIso,
    details: 'Generation completed in mocked backend.',
  },
]

const settingsResponse = {
  environments: [
    {
      environmentKey: 'local',
      displayName: 'Local development',
      apiBaseUrl: 'http://localhost:5678',
      n8nBaseUrl: 'http://localhost:5678',
      isActive: true,
      integrations: [
        {
          environmentKey: 'local',
          integrationKey: 'jira',
          displayName: 'Jira Software',
          enabled: true,
          config: {
            baseUrl: 'https://company.atlassian.net',
            projectKey: 'KAN',
            projectId: '10001',
            idempotencyLabelPrefix: 'qops',
          },
          status: 'configured',
          settingsVersion: 3,
          updatedAt: nowIso,
        },
        {
          environmentKey: 'local',
          integrationKey: 'confluence',
          displayName: 'Confluence',
          enabled: true,
          config: {
            baseUrl: 'https://company.atlassian.net/wiki',
            spaceKey: 'TD',
            parentPageId: '123',
            pageTitlePattern: '{documentTitle} - {projectName}',
          },
          status: 'configured',
          settingsVersion: 3,
          updatedAt: nowIso,
        },
      ],
    },
  ],
}

const analyticsSummary = {
  overview: {
    totalJobsCompleted: 12,
    totalDocumentsGenerated: 7,
    totalIngestionJobsCompleted: 5,
    totalJobsFailed: 1,
    successRate: 92,
    totalCostUsd: 1.23,
    avgCostPerDocument: 0.18,
    totalTokensConsumed: 65000,
    totalChunksIngested: 420,
    avgDurationMs: 180000,
    totalFilesProcessed: 18,
  },
  byDocumentType: [{ documentType: 'test_strategy', count: 2 }],
  failureRate: { generation: 8, ingestion: 0 },
  recentJobs: [{ jobId: 'GEN-TEST-001', projectName: 'Payments Modernization', status: 'completed', pipeline: 'generation' }],
  failures: { recent: [], byPipeline: [] },
  costs: { byPipeline: [], byProject: [] },
  meta: { generatedAt: nowIso, dateFrom: '2026-04-09', pipeline: 'all', daysRequested: 30 },
}

const healthStatus = {
  status: 'ok',
  generatedAt: nowIso,
  services: [
    { name: 'n8n', status: 'ok', detail: 'Reachable' },
    { name: 'Supabase', status: 'ok', detail: 'Reachable' },
    { name: 'OpenAI', status: 'configured', detail: 'Credential configured' },
  ],
  webhooks: {
    projects: '/webhook/projects',
    artifacts: '/webhook/artifacts',
    generatedDocuments: '/webhook/generated-documents',
    auditEvents: '/webhook/audit-events',
  },
}

const infrastructureLoad = {
  status: 'ok',
  score: 96,
  generatedAt: nowIso,
  queues: {
    pending: 1,
    processing: 0,
    active: 1,
    failedLast24h: 0,
    oldestPendingAgeSeconds: 30,
  },
  workflows: {
    activeExecutions: 1,
    failedLast24h: 0,
    avgDurationMs: 120000,
  },
  services: [
    { name: 'n8n', key: 'n8n', status: 'ok', latencyMs: 24, message: 'healthy', checkedAt: nowIso },
    { name: 'Supabase', key: 'supabase', status: 'ok', latencyMs: 35, message: 'healthy', checkedAt: nowIso },
  ],
  usage: {
    tokensToday: 12345,
    costTodayUsd: 0.42,
    jobsCompletedToday: 3,
  },
}

export async function seedSession(page: Page, user = adminUser) {
  await page.addInitScript(({ sessionUser }) => {
    window.localStorage.setItem(
      'qops-agent-supabase-session',
      JSON.stringify({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user: { id: sessionUser.authUserId, email: sessionUser.email },
      }),
    )
    window.localStorage.setItem('qops-agent-api-base-url', 'http://localhost:5678')
  }, { sessionUser: user })
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

type MockOptions = {
  rejectPasswordLogin?: boolean
  uploadResponse?: unknown
  generationResponse?: unknown
  kbStatusResponse?: unknown
  docStatusResponse?: unknown
}

export async function mockQopsBackend(page: Page, user = adminUser, options: MockOptions = {}) {
  await page.route('https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/**', async (route) => {
    const request = route.request()
    if (request.url().includes('/token?grant_type=password')) {
      if (options.rejectPasswordLogin) {
        return fulfill(route, {
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }, 400)
      }
      return fulfill(route, {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        user: { id: user.authUserId, email: user.email },
      })
    }
    if (request.url().includes('/recover')) return fulfill(route, {})
    if (request.url().includes('/logout')) return fulfill(route, {})
    if (request.url().includes('/user')) return fulfill(route, { id: user.authUserId, email: user.email })
    return fulfill(route, {})
  })

  await page.route('http://localhost:5678/webhook/**', async (route) => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    const path = url.pathname

    if (path === '/webhook/me') return fulfill(route, user)
    if (path === '/webhook/health') return fulfill(route, healthStatus)
    if (path === '/webhook/infrastructure-load') return fulfill(route, infrastructureLoad)
    if (path === '/webhook/projects' && method === 'GET') return fulfill(route, { projects })
    if (path === '/webhook/projects' && method === 'POST') return fulfill(route, projects[0])
    if (path === '/webhook/artifacts') return fulfill(route, { artifacts })
    if (path === '/webhook/generated-documents') return fulfill(route, { documents: generatedDocuments })
    if (path === '/webhook/audit-events') return fulfill(route, { events: auditEvents })
    if (path === '/webhook/analytics-summary') return fulfill(route, analyticsSummary)
    if (path === '/webhook/settings' && method === 'GET') return fulfill(route, settingsResponse)
    if (path === '/webhook/settings' && method === 'PATCH') return fulfill(route, { ok: true, settingsVersion: 4 })
    if (path === '/webhook/users') return fulfill(route, { users: [adminUser, registeredUser] })
    if (path === '/webhook/users/invite') return fulfill(route, { user: { ...registeredUser, id: 'user-invited-1', email: 'new.user@qops.test', status: 'pending_invite' } })
    if (path === '/webhook/users/update') return fulfill(route, { user: registeredUser })
    if (path === '/webhook/users/project-assignments') return fulfill(route, { ok: true })
    if (path === '/webhook/integrations/test') return fulfill(route, { ok: true, status: 'ok' })
    if (path === '/webhook/integrations/test-all') return fulfill(route, { ok: true, status: 'ok' })
    if (path === '/webhook/upload-test-artifacts') return fulfill(route, options.uploadResponse ?? { jobId: 'ING-E2E-001', status: 'queued' })
    if (path === '/webhook/job-status') return fulfill(route, options.kbStatusResponse ?? { status: 'completed', output: { totalChunksStored: 4 } })
    if (path === '/webhook/generate-qa-doc') return fulfill(route, options.generationResponse ?? { jobId: 'GEN-E2E-001', status: 'queued' })
    if (path === '/webhook/job-status-retrieve') {
      return fulfill(route, options.docStatusResponse ?? {
        status: 'completed',
        output: {
          url: 'https://example.test/generated/test-strategy',
          wordCount: 2100,
          tokenUsage: { total: 7200, estimatedCostUsd: 0.015 },
        },
      })
    }
    return fulfill(route, { ok: true })
  })
}
