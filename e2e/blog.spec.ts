import { test, expect } from '@playwright/test'

test.describe('Blog Pages', () => {
  test('should load blog listing page', async ({ page }) => {
    await page.goto('/blog')

    // Check page loaded
    await expect(page.getByRole('heading', { name: /Blog/i })).toBeVisible()

    // Check empty state (no DB)
    await expect(page.getByText(/No posts found/i)).toBeVisible()
    await expect(page.getByText(/Connect your database/i)).toBeVisible()
  })

  test('should show navigation on blog page', async ({ page }) => {
    await page.goto('/blog')

    // Check nav
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
  })
})
