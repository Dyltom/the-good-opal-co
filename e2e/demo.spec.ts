import { test, expect } from '@playwright/test'

test.describe('Demo Page (PageBuilder)', () => {
  test('should load demo page successfully', async ({ page }) => {
    await page.goto('/demo')

    // Check page loaded
    await expect(page).toHaveTitle(/Rapid Sites/)

    // Check hero
    await expect(
      page.getByRole('heading', { name: /Build with Configuration, Not Code/i })
    ).toBeVisible()
  })

  test('should display stats section', async ({ page }) => {
    await page.goto('/demo')

    // Check for stats
    await expect(page.getByText(/Framework Stats/i)).toBeVisible()
    await expect(page.getByText(/Tests Passing/i)).toBeVisible()
    await expect(page.getByText(/95/)).toBeVisible()
  })

  test('should show features grid', async ({ page }) => {
    await page.goto('/demo')

    // Check features
    await expect(page.getByText(/Why Use PageBuilder/i)).toBeVisible()
    await expect(page.getByText(/Configuration-Based/i)).toBeVisible()
    await expect(page.getByText(/Fully Reusable/i)).toBeVisible()
  })
})
