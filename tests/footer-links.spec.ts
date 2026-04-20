import { test, expect } from '@playwright/test'

test.describe('Footer Privacy and Terms Links', () => {
  test('should navigate to privacy policy page from footer', async ({ page }) => {
    await page.goto('http://localhost:8412/')
    await page.waitForLoadState('networkidle')

    // Click Privacy Policy link in footer
    await page.getByRole('link', { name: 'Privacy Policy' }).click({ force: true })

    // Verify we're on the privacy page
    await expect(page).toHaveURL('http://localhost:8412/privacy')
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible()
  })

  test('should navigate to terms of service page from footer', async ({ page }) => {
    await page.goto('http://localhost:8412/')
    await page.waitForLoadState('networkidle')

    // Click Terms of Service link in footer
    await page.getByRole('link', { name: 'Terms of Service' }).click({ force: true })

    // Verify we're on the terms page
    await expect(page).toHaveURL('http://localhost:8412/terms')
    await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible()
  })

  test('should have working privacy and terms links in footer', async ({ page }) => {
    await page.goto('http://localhost:8412/')
    await page.waitForLoadState('networkidle')

    // Verify privacy link exists and is visible
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible()

    // Verify terms link exists and is visible
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible()
  })
})