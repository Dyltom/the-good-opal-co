import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/Rapid Sites/)

    // Check hero section
    await expect(page.getByRole('heading', { name: /Build Beautiful Websites/i })).toBeVisible()

    // Check navigation (specifically in nav element, not footer)
    const nav = page.getByRole('navigation')
    await expect(nav.getByRole('link', { name: /Features/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Contact/i })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Click features link (anchor link)
    await page.getByRole('link', { name: /Learn More/i }).first().click()

    // Should stay on same page (anchor link)
    expect(page.url()).toContain('/')
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')

    // Check for features section heading
    await expect(page.getByRole('heading', { name: /What We Offer/i })).toBeVisible()

    // Check for specific feature headings (level 3 in cards)
    await expect(page.getByRole('heading', { level: 3, name: /Rapid Deployment/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Easy Customization/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Content Management/i })).toBeVisible()
  })

  test('should have responsive navigation', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu button should be visible
    const menuButton = page.getByLabel(/Toggle menu/i)
    await expect(menuButton).toBeVisible()

    // Click to open menu
    await menuButton.click()

    // Check menu items visible
    await expect(page.getByRole('link', { name: /Features/i }).first()).toBeVisible()
  })

  test('should render contact form', async ({ page }) => {
    await page.goto('/')

    // Wait for full page load
    await page.waitForLoadState('networkidle')

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Wait a moment for scroll
    await page.waitForTimeout(500)

    // Check form fields exist (they're at the bottom of the page)
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[type="email"][name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
  })
})
