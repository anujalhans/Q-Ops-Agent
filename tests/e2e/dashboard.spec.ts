import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { adminUser, mockQopsBackend, nowIso, registeredUser, seedSession } from './fixtures/qops-fixtures'

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

async function seedNotifications(page: Page, notifications: unknown[]) {
  await page.evaluate((items) => {
    window.localStorage.setItem('qops-agent-notifications', JSON.stringify(items))
    window.localStorage.setItem('qops-agent-read-notification-ids', '[]')
  }, notifications)
}

test.describe('authenticated dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, adminUser)
    await mockQopsBackend(page, adminUser)
  })

  test('admin dashboard loads core modules and backend-backed metrics', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: /Good .* Admin/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Artifacts', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Doc Gen', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Knowledge Base', exact: true })).toBeVisible()
    await expect(page.getByText('Backend repositories connected')).toBeVisible()
    await expect(page.getByRole('paragraph').filter({ hasText: 'Payments Modernization' }).first()).toBeVisible()
  })

  test('knowledge ingestion posts selected artifacts and reaches completed status', async ({ page }) => {
    const uploadRequest = page.waitForRequest((request) => request.url().endsWith('/webhook/upload-test-artifacts') && request.method() === 'POST')

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Knowledge Base', exact: true }).click()
    await page.locator('select').first().selectOption('Payments Modernization')
    await page.locator('input[type="file"]').nth(0).setInputFiles({
      name: 'payments-brd.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('BRD content'),
    })
    await page.locator('input[type="file"]').nth(4).setInputFiles({
      name: 'standup-notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Transcript content'),
    })
    await page.getByRole('button', { name: 'Create Knowledge Base' }).click()

    const request = await uploadRequest
    expect(request.postData() || '').toContain('Payments Modernization')
    await expect(page.getByText('Knowledge base created successfully.')).toBeVisible()
    await expect(page.getByText('ING-E2E-001')).toBeVisible()
  })

  test('document generation sends mapped document type and displays generated link', async ({ page }) => {
    const generationRequest = page.waitForRequest((request) => request.url().endsWith('/webhook/generate-qa-doc') && request.method() === 'POST')

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Doc Gen' }).click()
    await page.locator('select').first().selectOption('Payments Modernization')
    await page.locator('form').getByText('Test Strategy', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate Documents', exact: true }).click()

    const request = await generationRequest
    expect(request.postDataJSON()).toMatchObject({
      projectId: 'project-payments',
      projectName: 'Payments Modernization',
      documentType: 'test_strategy',
    })
    await expect(page.getByText('Document generated successfully.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open Document' })).toHaveAttribute('href', 'https://example.test/generated/test-strategy')
    await expect(page.getByText('7,200')).toBeVisible()
  })

  test('settings supports integration save and health actions', async ({ page }) => {
    const settingsPatch = page.waitForRequest((request) => request.url().endsWith('/webhook/settings') && request.method() === 'PATCH')

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings Control Center' })).toBeVisible()
    await page.getByLabel('Jira base URL').fill('https://qa-team.atlassian.net')
    await page.getByRole('button', { name: 'Save' }).first().click()

    const request = await settingsPatch
    expect(request.postDataJSON()).toMatchObject({
      environmentKey: 'local',
      integrationKey: 'jira',
    })
    await expect(page.getByText('Settings saved')).toBeVisible()
  })

  test('notification tray only shows recent notifications', async ({ page }) => {
    await seedSession(page, adminUser)
    await mockQopsBackend(page, adminUser, { auditEventsResponse: { events: [] } })
    await seedNotifications(page, [
      {
        id: 'notification-old',
        title: 'Old job complete',
        message: 'This notification is older than the tray window.',
        type: 'info',
        createdAt: daysAgoIso(9),
        read: false,
        project: 'Payments Modernization',
      },
      {
        id: 'notification-recent',
        title: 'Recent job complete',
        message: 'This notification should remain visible.',
        type: 'success',
        createdAt: daysAgoIso(2),
        read: false,
        project: 'Payments Modernization',
      },
    ])

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Notifications', exact: true }).click()

    await expect(page.getByText('Recent job complete')).toBeVisible()
    await expect(page.getByText('Old job complete')).not.toBeVisible()
  })
})

test.describe('registered-user authorization surface', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, registeredUser)
    await mockQopsBackend(page, registeredUser)
  })

  test('registered user sees assigned project scope and no admin-only project creation', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('paragraph').filter({ hasText: 'Payments Modernization' }).first()).toBeVisible()
    await expect(page.getByText('Claims Portal')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /New Project/i })).not.toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings Control Center' })).toBeVisible()
    await expect(page.getByText('Registered User Profile')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Invite User' })).not.toBeVisible()
  })

  test('registered user audit log and notifications exclude previous project activity', async ({ page }) => {
    const quickCommerceUser = {
      ...registeredUser,
      email: 'anujalhans1@gmail.com',
      name: 'Anuj Alhans',
      projects: ['project-astracart-quick-commerce'],
      projectRoles: [{ projectId: 'project-astracart-quick-commerce', projectName: 'AstraCart Quick Commerce Application', role: 'editor' }],
    }
    const scopedProjects = [
      {
        id: 'project-astracart-quick-commerce',
        name: 'AstraCart Quick Commerce Application',
        description: 'Quick commerce validation project.',
        owner: 'Product Owner',
        module: 'Commerce',
        release: 'Release 1.0',
        tags: ['quick-commerce'],
        status: 'ready',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'project-previous',
        name: 'AstraCart Previous Assignment',
        description: 'A project that is no longer assigned.',
        owner: 'Product Owner',
        module: 'Legacy',
        release: 'Release 0.9',
        tags: ['legacy'],
        status: 'ready',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ]
    const scopedAuditEvents = [
      {
        id: 'audit-current-assignment',
        actor: 'Admin User',
        action: 'USER_PROJECT_ASSIGNMENTS_UPDATED',
        project: 'Backend',
        entity: 'anujalhans1@gmail.com',
        status: 'success',
        timestamp: nowIso,
        details: 'Anuj Alhans can now access AstraCart Quick Commerce Application as Editor.',
      },
      {
        id: 'audit-old-project',
        actor: 'anujalhans1@gmail.com',
        action: 'GENERATION_COMPLETED',
        project: 'AstraCart Previous Assignment',
        entity: 'Test Strategy',
        status: 'success',
        timestamp: nowIso,
        details: 'AstraCart Previous Assignment document generation completed.',
      },
    ]

    await page.unroute('https://ifnznfspkjayhnooncrv.supabase.co/auth/v1/**')
    await page.unroute('http://localhost:5678/webhook/**')
    await seedSession(page, quickCommerceUser)
    await mockQopsBackend(page, quickCommerceUser, {
      projectsResponse: { projects: scopedProjects },
      auditEventsResponse: { events: scopedAuditEvents },
    })

    await page.goto('/dashboard')

    await page.getByRole('button', { name: 'View Audit Log' }).click()
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible()
    await expect(page.getByText('AstraCart Quick Commerce Application').first()).toBeVisible()
    await expect(page.getByText('AstraCart Previous Assignment')).not.toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()

    await page.getByRole('button', { name: 'Notifications' }).click()
    await expect(page.getByText('Project access updated').first()).toBeVisible()
    await expect(page.getByText('AstraCart Quick Commerce Application').first()).toBeVisible()
    await expect(page.getByText('AstraCart Previous Assignment')).not.toBeVisible()
  })

  test('notification tray only shows recent notifications for registered users', async ({ page }) => {
    await seedSession(page, registeredUser)
    await mockQopsBackend(page, registeredUser, { auditEventsResponse: { events: [] } })
    await seedNotifications(page, [
      {
        id: 'notification-old-registered',
        title: 'Old registered notice',
        message: 'This notification is older than the tray window.',
        type: 'info',
        createdAt: daysAgoIso(8),
        read: false,
        project: 'Payments Modernization',
      },
      {
        id: 'notification-recent-registered',
        title: 'Recent registered notice',
        message: 'This notification should remain visible.',
        type: 'success',
        createdAt: daysAgoIso(1),
        read: false,
        project: 'Payments Modernization',
      },
    ])

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Notifications', exact: true }).click()

    await expect(page.getByText('Recent registered notice')).toBeVisible()
    await expect(page.getByText('Old registered notice')).not.toBeVisible()
  })
})
