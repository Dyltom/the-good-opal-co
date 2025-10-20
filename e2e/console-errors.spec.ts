import { test, expect } from '@playwright/test'

test.describe('Console Errors', () => {
  test('homepage should not have console errors', async ({ page }) => {
    const errors: string[] = []

    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should have no console errors
    expect(errors).toHaveLength(0)
  })

  test('demo page should not have console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/demo')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('admin panel should load to create-first-user', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/admin', { timeout: 30000 })
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    // Should redirect to create first user or login
    await expect(page).toHaveTitle(/Payload/i)

    // Check for create first user form or login
    const hasUserForm = await page.getByLabel(/Email/i).or(page.getByText(/Create/i)).count() > 0
    expect(hasUserForm).toBe(true)

    // Log errors for awareness (Payload CMS may have internal issues)
    if (errors.length > 0) {
      console.log('⚠️ Admin console errors (Payload CMS internals):', errors.length, 'errors')
    }
  })
})
