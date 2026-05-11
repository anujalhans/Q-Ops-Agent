import { expect, test } from '@playwright/test'
import { adminUser, disabledUser, mockQopsBackend, seedSession } from './fixtures/qops-fixtures'

test.describe('authentication, authorization, and session lifecycle', () => {
  test('valid Supabase login resolves Q-Ops profile and opens dashboard', async ({ page }) => {
    await mockQopsBackend(page, adminUser)

    await page.goto('/')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.getByLabel('Email').fill('admin@qops.test')
    await page.getByLabel('Password').fill('correct-password')
    await page.getByRole('button', { name: 'Login', exact: true }).last().click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: /Good .* Admin/i })).toBeVisible()
    await expect(page.evaluate(() => window.localStorage.getItem('qops-agent-supabase-session'))).resolves.toContain('test-access-token')
  })

  test('invalid Supabase login keeps user on landing page and shows error', async ({ page }) => {
    await mockQopsBackend(page, adminUser, { rejectPasswordLogin: true })

    await page.goto('/')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.getByLabel('Email').fill('admin@qops.test')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Login', exact: true }).last().click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Unable to sign in with those credentials.')).toBeVisible()
    await expect(page.getByText('Authentication failed')).toBeVisible()
  })

  test('disabled Q-Ops profile is rejected after Supabase authentication', async ({ page }) => {
    await mockQopsBackend(page, disabledUser)

    await page.goto('/')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await page.getByLabel('Email').fill('disabled@qops.test')
    await page.getByLabel('Password').fill('correct-password')
    await page.getByRole('button', { name: 'Login', exact: true }).last().click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Your account is not active in Q-Ops Agent.')).toBeVisible()
    await expect(page.evaluate(() => window.localStorage.getItem('qops-agent-supabase-session'))).resolves.toBeNull()
  })

  test('logout clears Supabase session and returns to landing page', async ({ page }) => {
    await seedSession(page, adminUser)
    await mockQopsBackend(page, adminUser)

    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Logout' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.evaluate(() => window.localStorage.getItem('qops-agent-supabase-session'))).resolves.toBeNull()
    await expect(page.evaluate(() => window.localStorage.getItem('qops-agent-auth'))).resolves.toBeNull()
  })
})
