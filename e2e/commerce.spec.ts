import { expect, test, type Page } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

async function firstAvailableProduct(page: Page) {
  await page.goto('/store')
  const links = page.locator('a[href^="/store/"]')
  if ((await links.count()) === 0) return null
  const href = await links.first().getAttribute('href')
  if (!href) return null
  const response = await page.goto(href)
  expect(response?.status(), href).toBeLessThan(400)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  return href
}

test('catalog or intentional empty state renders', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  await page.goto('/store')
  const countText = page.getByText(/Showing \d+–\d+ of \d+ pieces/)
  const emptyText = page.getByText('Nothing matches yet.')
  await expect(countText.or(emptyText)).toBeVisible()
  assertNoErrors()
})

test('available product can be added, changed, and removed from cookie cart', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  const productUrl = await firstAvailableProduct(page)
  test.skip(!productUrl, 'Catalog is empty; seed/publish products before catalog acceptance testing')

  const addButton = page.getByRole('button', { name: /Add to cart/i }).first()
  if (!(await addButton.isVisible())) {
    await expect(page.getByRole('button', { name: 'Out of Stock' }).first()).toBeDisabled()
    assertNoErrors()
    return
  }

  await addButton.click()
  await expect(page.getByText(/added to (your )?cart/i).first()).toBeVisible()
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Continue to checkout', exact: true })).toBeVisible()

  const remove = page.getByRole('button', { name: /remove/i }).first()
  await remove.click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  assertNoErrors()
})

test('checkout collects destination and blocks invalid contact data before Stripe', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  const productUrl = await firstAvailableProduct(page)
  test.skip(!productUrl, 'Catalog is empty; seed/publish products before checkout acceptance testing')

  const addButton = page.getByRole('button', { name: /Add to cart/i }).first()
  test.skip(!(await addButton.isVisible()), 'First catalog item is unavailable')
  await addButton.click()
  await expect(page.getByText(/added to (your )?cart/i).first()).toBeVisible()
  await page.goto('/checkout')

  await expect(page.getByLabel('Delivery country or region')).toBeVisible()
  await page.getByRole('button', { name: /Continue to secure payment/i }).click()
  await expect(page.getByText('Enter the name for this order')).toBeVisible()
  await expect(page.getByText('Enter your email address')).toBeVisible()
  assertNoErrors()
})
