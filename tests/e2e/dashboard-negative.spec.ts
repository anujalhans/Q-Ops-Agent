import { expect, test } from '@playwright/test'
import { adminUser, mockQopsBackend, seedSession } from './fixtures/qops-fixtures'

const documentTypeExpectations = [
  ['Test Strategy', 'test_strategy'],
  ['Test Plan', 'test_plan'],
  ['Risk Matrix', 'risk_matrix'],
  ['Test Cases', 'test_cases'],
  ['Epics & User Stories', 'user_stories'],
  ['Traceability Matrix', 'traceability_matrix'],
] as const

test.describe('dashboard negative and contract coverage', () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, adminUser)
  })

  test('document generation maps every UI artifact to the backend document type', async ({ page }) => {
    await mockQopsBackend(page, adminUser)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Doc Gen', exact: true }).click()

    for (const [label, expectedDocumentType] of documentTypeExpectations) {
      const generationRequest = page.waitForRequest((request) => request.url().endsWith('/webhook/generate-qa-doc') && request.method() === 'POST')

      await page.locator('select').first().selectOption('Payments Modernization')
      await page.locator('form').getByText(label, { exact: true }).click()
      await page.getByRole('button', { name: 'Generate Documents', exact: true }).click()

      const request = await generationRequest
      expect(request.postDataJSON()).toMatchObject({
        projectId: 'project-payments',
        projectName: 'Payments Modernization',
        documentType: expectedDocumentType,
        environment: 'local',
      })

      await page.getByRole('button', { name: 'Reset' }).last().click()
      await page.getByRole('button', { name: 'Doc Gen', exact: true }).click()
    }
  })

  test('generation validation blocks submit when artifact is missing', async ({ page }) => {
    await mockQopsBackend(page, adminUser)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Doc Gen', exact: true }).click()
    await page.locator('select').first().selectOption('Payments Modernization')
    await page.getByRole('button', { name: 'Generate Documents', exact: true }).click()

    await expect(page.getByText('Please select project and artifact type')).toBeVisible()
  })

  test('invalid upload queue response surfaces backend response error', async ({ page }) => {
    await mockQopsBackend(page, adminUser, { uploadResponse: { status: 'queued' } })

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Knowledge Base', exact: true }).click()
    await page.locator('select').first().selectOption('Payments Modernization')
    await page.getByRole('button', { name: 'Create Knowledge Base' }).click()

    await expect(page.getByRole('main').getByText('Invalid response from backend')).toBeVisible()
    await expect(page.getByText('Upload failed')).toBeVisible()
  })

  test('failed generation polling renders backend failure detail', async ({ page }) => {
    await mockQopsBackend(page, adminUser, {
      docStatusResponse: {
        status: 'failed',
        output: {
          errorType: 'GENERATOR_AGENT_FAILED',
          message: 'Quality gate rejected generated output.',
          failed_at: '2026-05-09T10:00:00.000Z',
        },
      },
    })

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Doc Gen', exact: true }).click()
    await page.locator('select').first().selectOption('Payments Modernization')
    await page.locator('form').getByText('Risk Matrix', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate Documents', exact: true }).click()

    await expect(page.getByText('Generation Failure Detail')).toBeVisible()
    await expect(page.getByText('GENERATOR_AGENT_FAILED')).toBeVisible()
    await expect(page.getByText('Quality gate rejected generated output.').last()).toBeVisible()
  })
})
