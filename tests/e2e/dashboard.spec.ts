import { expect, test } from '@playwright/test'
import { adminUser, mockQopsBackend, registeredUser, seedSession } from './fixtures/qops-fixtures'

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
})
