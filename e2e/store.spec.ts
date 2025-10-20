import { test, expect } from '@playwright/test'

test.describe('Store E2E Tests', () => {
  test('should load store page with products', async ({ page }) => {
    await page.goto('/store')

    // Check header (use exact match to avoid matching "Manage Your Store")
    await expect(page.getByRole('heading', { name: 'Our Store', exact: true })).toBeVisible()

    // Check at least one product is visible
    await expect(page.getByText(/Premium Coffee Beans/i)).toBeVisible()

    // Check prices display
    await expect(page.getByText(/\$24.99/)).toBeVisible()
  })

  test('should navigate to product detail page', async ({ page }) => {
    await page.goto('/store')

    // Click first "Details" link
    await page.getByRole('link', { name: /Details/i }).first().click()

    // Should navigate to product page
    await expect(page).toHaveURL(/\/store\/.+/)

    // Should show "Add to Cart" button
    await expect(page.getByRole('button', { name: /Add to Cart/i })).toBeVisible()

    // Should show "Back to Store" link
    await expect(page.getByRole('link', { name: /Back to Store/i })).toBeVisible()
  })

  test('should open cart drawer from button click', async ({ page }) => {
    await page.goto('/store')

    // Click cart button to open drawer
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await cartButton.click()

    // Should show cart drawer with empty state
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible()
  })

  test('should navigate back from cart to store', async ({ page }) => {
    await page.goto('/cart')

    // Click Continue Shopping
    await page.getByRole('link', { name: /Continue Shopping/i }).click()

    // Should navigate to store
    await expect(page).toHaveURL('/store')

    // Should show products
    await expect(page.getByText(/Premium Coffee Beans/i)).toBeVisible()
  })

  test('should show correct product information on detail page', async ({ page }) => {
    await page.goto('/store/premium-coffee-beans')

    // Check product name
    await expect(page.getByRole('heading', { name: /Premium Coffee Beans/i })).toBeVisible()

    // Check price
    await expect(page.getByText(/\$24.99/)).toBeVisible()

    // Check stock status
    await expect(page.getByText(/In Stock/i)).toBeVisible()

    // Check SKU
    await expect(page.getByText(/SKU:/)).toBeVisible()
  })

  test('should display sale badge for discounted products', async ({ page }) => {
    await page.goto('/store')

    // Check for sale badges on products with compareAtPrice
    const saleBadges = page.getByText('Sale')
    await expect(saleBadges.first()).toBeVisible()
  })

  test('should show stock indicators', async ({ page }) => {
    await page.goto('/store')

    // Should show stock status
    await expect(page.getByText(/In Stock/i).first()).toBeVisible()
  })

  test('should update cart button count when items are added', async ({ page }) => {
    // Clear cart first
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())

    // Cart button should initially show no badge (count 0)
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await expect(cartButton).toBeVisible()

    // Navigate to product detail
    await page.goto('/store/premium-coffee-beans')

    // Add item to cart
    await page.getByRole('button', { name: /Add to Cart/i }).click()

    // Wait a moment for cart to update
    await page.waitForTimeout(100)

    // Navigate back to store
    await page.goto('/store')

    // Cart button should now show badge with count "1"
    const badge = page.locator('.absolute.-top-2.-right-2', { hasText: '1' })
    await expect(badge).toBeVisible()
  })

  test('should maintain cart count across page navigation', async ({ page }) => {
    // Clear any existing cart data
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())

    // Add first item
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)
    await page.goto('/store')

    // Add second item (artisan-tea-collection is the second product)
    await page.goto('/store/artisan-tea-collection')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)
    await page.goto('/store')

    // Cart button should show "2"
    const badge = page.locator('.absolute.-top-2.-right-2', { hasText: '2' })
    await expect(badge).toBeVisible()
  })

  test('should add item to cart and show in cart page', async ({ page }) => {
    // Clear cart
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())

    // Navigate to product and add to cart
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Navigate to cart page
    await page.goto('/cart')

    // Verify on cart page
    await expect(page).toHaveURL('/cart')
    await expect(page.getByRole('heading', { name: /Shopping Cart/i })).toBeVisible()

    // Check product appears in cart
    await expect(page.getByRole('heading', { name: /Premium Coffee Beans/i })).toBeVisible()
    await expect(page.getByText(/\$24.99 each/)).toBeVisible()
  })

  test('should update quantity in cart', async ({ page }) => {
    // Clear cart and add item
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Navigate to cart page
    await page.goto('/cart')
    await expect(page).toHaveURL('/cart')

    // Verify initial quantity is 1
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible()

    // Increase quantity by clicking the + button (using aria-label)
    const increaseButton = page.getByRole('button', { name: /Increase quantity/i }).first()
    await increaseButton.click()

    // Verify quantity is now 2
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible()

    // Navigate back to store and verify cart count
    await page.goto('/store')
    const badge = page.locator('.absolute.-top-2.-right-2', { hasText: '2' })
    await expect(badge).toBeVisible()
  })

  test('should remove item from cart', async ({ page }) => {
    // Clear cart and add item
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/store/premium-coffee-beans')
    await page.getByRole('button', { name: /Add to Cart/i }).click()
    await page.waitForTimeout(100)

    // Navigate to cart page
    await page.goto('/cart')
    await expect(page).toHaveURL('/cart')

    // Remove the item
    const removeButton = page.getByRole('button', { name: /remove/i }).first()
    await removeButton.click()

    // Should show empty cart message
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible()

    // Navigate to store and verify no badge
    await page.goto('/store')
    const badge = page.locator('.absolute.-top-2.-right-2')
    await expect(badge).not.toBeVisible()
  })

  test('should quick add item and show in cart drawer immediately', async ({ page }) => {
    // Clear cart
    await page.goto('/store')
    await page.evaluate(() => localStorage.clear())

    // Click "Add" button on first product card
    const firstAddButton = page.getByRole('button', { name: /^Add$/i }).first()
    await expect(firstAddButton).toBeVisible()
    await firstAddButton.click()

    // Wait for button feedback (shows checkmark)
    await page.waitForTimeout(200)

    // Open cart drawer immediately
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await cartButton.click()

    // Cart drawer should show the item AND the total
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText(/Shopping Cart \(1 item/i)).toBeVisible()
    await expect(drawer.getByRole('heading', { name: /Premium Coffee Beans/i })).toBeVisible()
    await expect(drawer.getByText(/Total:/i)).toBeVisible()
  })
})
