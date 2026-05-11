import { expect, test } from '@playwright/test'
import { adminUser, mockQopsBackend, seedSession } from './fixtures/qops-fixtures'

test.describe('public experience', () => {
  test.beforeEach(async ({ page }) => {
    await mockQopsBackend(page, adminUser)
  })

  test('landing page exposes primary navigation and login modal', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Build QA That Starts/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Explore More' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeEnabled()

    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Login to Q-Ops Agent' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('explore route is reachable and returns to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Explore More' }).first().click()

    await expect(page).toHaveURL(/\/explore$/)
    await expect(page.getByText('Q-Ops Agent', { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: /Back to login|Return to login|Login/i }).first().click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('forgot-password flow calls Supabase recovery endpoint', async ({ page }) => {
    const recoveryRequest = page.waitForRequest((request) => request.url().includes('/auth/v1/recover'))

    await page.goto('/')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.getByRole('button', { name: 'Forgot your password?' }).click()
    await page.getByLabel('Email Address').fill('admin@qops.test')
    await page.getByRole('button', { name: /Send reset link/i }).click()

    await recoveryRequest
    await expect(page.getByText('Password reset email sent')).toBeVisible()
  })

  test('explore page uses the Supabase session to show authenticated CTAs', async ({ page }) => {
    await seedSession(page, adminUser)

    await page.goto('/explore')

    await expect(page.getByRole('button', { name: 'Open Dashboard' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toHaveCount(0)
  })
})
