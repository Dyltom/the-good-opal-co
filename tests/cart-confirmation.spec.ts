import { test, expect } from '@playwright/test'

test.describe('Cart Clear Confirmation Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page first
    await page.goto('http://localhost:8412/')

    // Add some items to cart if possible
    // We'll navigate to a product page and add it to cart
    await page.goto('http://localhost:8412/store')
    await page.waitForLoadState('networkidle')

    // Look for an "Add to Cart" button and click it if it exists
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      // Wait for the item to be added
      await page.waitForTimeout(1000)
    }
  })

  test('should show confirmation dialog when Clear Cart is clicked', async ({ page }) => {
    // Navigate to cart page
    await page.goto('http://localhost:8412/cart')
    await page.waitForLoadState('networkidle')

    // Check if cart has items, if not, skip this test
    const clearCartButton = page.getByRole('button', { name: 'Clear Cart' })
    if (!(await clearCartButton.isVisible())) {
      test.skip('No items in cart to test clear functionality')
    }

    // Click the Clear Cart button
    await clearCartButton.click()

    // Verify confirmation dialog appears
    await expect(page.getByText('Clear Cart')).toBeVisible()
    await expect(page.getByText('Are you sure you want to clear your cart?')).toBeVisible()
    await expect(page.getByText(/This action will remove .* from your cart and cannot be undone/)).toBeVisible()

    // Verify dialog has Cancel and Clear buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible()
  })

  test('should close dialog when Cancel is clicked', async ({ page }) => {
    await page.goto('http://localhost:8412/cart')
    await page.waitForLoadState('networkidle')

    const clearCartButton = page.getByRole('button', { name: 'Clear Cart' })
    if (!(await clearCartButton.isVisible())) {
      test.skip('No items in cart to test clear functionality')
    }

    // Click Clear Cart to open dialog
    await clearCartButton.click()

    // Verify dialog is visible
    await expect(page.getByText('Clear Cart')).toBeVisible()

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Verify dialog is closed
    await expect(page.getByText('Clear Cart')).not.toBeVisible()

    // Verify items are still in cart (Clear Cart button should still be visible)
    await expect(clearCartButton).toBeVisible()
  })

  test('should clear cart when Clear is clicked', async ({ page }) => {
    await page.goto('http://localhost:8412/cart')
    await page.waitForLoadState('networkidle')

    const clearCartButton = page.getByRole('button', { name: 'Clear Cart' })
    if (!(await clearCartButton.isVisible())) {
      test.skip('No items in cart to test clear functionality')
    }

    // Click Clear Cart to open dialog
    await clearCartButton.click()

    // Click Clear button in dialog
    await page.getByRole('button', { name: 'Clear' }).click()

    // Wait for the cart to clear and page to refresh/update
    await page.waitForLoadState('networkidle')

    // Verify cart is empty - should show empty state
    await expect(page.getByText(/your cart is empty/i)).toBeVisible()

    // Verify Clear Cart button is no longer visible
    await expect(page.getByRole('button', { name: 'Clear Cart' })).not.toBeVisible()
  })
})