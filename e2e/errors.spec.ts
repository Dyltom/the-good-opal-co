import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('should show 404 page for invalid route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    // Should show 404
    await expect(page.getByRole('heading', { name: /404/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Page Not Found/i })).toBeVisible()

    // Should have go home button
    await expect(page.getByRole('link', { name: /Go Home/i })).toBeVisible()
  })

  test('should show helpful error for admin without DB', async ({ page }) => {
    // This will fail to connect to DB
    const response = await page.goto('/admin')

    // Check we get a response (might be error page)
    expect(response).toBeTruthy()

    // Should show error message about database
    // Note: This tests graceful degradation
    await expect(
      page.getByText(/Database/i).or(page.getByText(/Error/i))
    ).toBeVisible({ timeout: 10000 })
  })

  test('should handle missing blog post gracefully', async ({ page }) => {
    await page.goto('/blog/non-existent-post')

    // Should show 404
    await expect(page.getByRole('heading', { name: /404/i })).toBeVisible()
  })
})
