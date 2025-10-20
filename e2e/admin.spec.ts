import { test, expect } from '@playwright/test'

test.describe('Admin Panel (Payload CMS)', () => {
  test('admin should load without errors', async ({ page }) => {
    const errors: string[] = []

    // Track console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Load admin
    await page.goto('/admin', { timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    // Should load Payload admin
    await expect(page).toHaveTitle(/Payload/)

    // Should not have critical errors
    const hasCriticalError = errors.some(
      (err) => err.includes('destructure') || err.includes('undefined')
    )

    if (hasCriticalError) {
      console.log('❌ CRITICAL ERRORS FOUND:', errors)
    }

    expect(hasCriticalError).toBe(false)
  })

  test('admin login page should be functional', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    // Should have login form
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()

    // Should have login button
    const loginButton = page.locator('button[type="submit"]')
    await expect(loginButton).toBeVisible()
  })

  test('admin should redirect to create first user', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // Should redirect to create first user page
    expect(page.url()).toContain('create-first-user')

    // Should have user creation form
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
  })
})
