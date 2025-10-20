import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should load checkout page with cart items', async ({ page }) => {
    // Add item to cart first
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Navigate to checkout
    await page.goto('/checkout')

    // Should show checkout page
    await expect(page.getByRole('heading', { name: /Checkout/i })).toBeVisible()

    // Should show order summary
    await expect(page.getByText(/Order Summary/i)).toBeVisible()
    await expect(page.getByText(/Premium Coffee Beans/i)).toBeVisible()
  })

  test('should show empty state when no items in cart', async ({ page }) => {
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())

    await page.goto('/checkout')

    // Should redirect or show empty state
    await expect(page.getByText(/Your cart is empty|No items in cart/i)).toBeVisible()
  })

  test('should navigate to checkout from cart drawer', async ({ page }) => {
    // Add item to cart
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Open cart drawer
    await page.goto('/store')
    await page.getByRole('button', { name: /cart/i }).first().click()

    // Click "Proceed to Checkout" in drawer
    await page.getByRole('link', { name: /Proceed to Checkout/i }).click()

    // Should navigate to checkout
    await expect(page).toHaveURL('/checkout')
  })

  test('should allow completing an order', async ({ page }) => {
    // Add item to cart
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Navigate to checkout
    await page.goto('/checkout')

    // Fill out shipping information
    await page.getByLabel('First Name').fill('John')
    await page.getByLabel('Last Name').fill('Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Address').fill('123 Main St')
    await page.getByLabel('City').fill('New York')
    await page.getByLabel('State').fill('NY')
    await page.getByLabel('ZIP Code').fill('10001')

    // Complete Order button should be enabled
    const completeOrderButton = page.getByRole('button', { name: /Complete Order/i })
    await expect(completeOrderButton).toBeEnabled()

    // Click Complete Order
    await completeOrderButton.click()

    // Should show loading state (check for either loading button text or navigation)
    // Note: Navigation might happen quickly, so we check for either state
    await Promise.race([
      expect(page.getByRole('button', { name: /Processing Order/i })).toBeVisible(),
      page.waitForURL(/\/checkout\/success/, { timeout: 3000 })
    ])

    // Should redirect to success page
    await expect(page).toHaveURL('/checkout/success', { timeout: 5000 })

    // Success page should show confirmation
    await expect(page.getByRole('heading', { name: /Order Complete/i })).toBeVisible()
  })
})
