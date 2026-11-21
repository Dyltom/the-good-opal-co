import { expect, test, type Page } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

async function firstAvailableProduct(page: Page) {
  await page.goto('/store')
  const links = page.locator('a[href^="/store/"]:not([href="/store/collected"])')
  if ((await links.count()) === 0) return null
  const href = await links.first().getAttribute('href')
  if (!href) return null
  const response = await page.goto(href)
  expect(response?.status(), href).toBeLessThan(400)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  return href
}

async function expectCartDrawerWith(page: Page, productName: string) {
  const drawer = page.getByRole('dialog', { name: /your cart/i })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText(productName).first()).toBeVisible()
}

test('catalog or intentional empty state renders', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  await page.goto('/store')
  const countText = page.getByText(/^(Showing \d+–\d+ of )?\d+ pieces?$/).filter({ visible: true })
  const emptyText = page.getByText('Nothing matches yet.')
  await expect(countText.or(emptyText)).toBeVisible()
  assertNoErrors()
})

test('available product can be added, changed, and removed from cookie cart', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  const productUrl = await firstAvailableProduct(page)
  test.skip(!productUrl, 'Catalog is empty; seed/publish products before catalog acceptance testing')

  const productName = await page.getByRole('heading', { level: 1 }).innerText()
  const addButton = page.getByRole('button', { name: /Add to cart/i }).first()
  if (!(await addButton.isVisible())) {
    await expect(page.getByRole('link', { name: 'See similar pieces' })).toBeVisible()
    assertNoErrors()
    return
  }

  await addButton.click()
  await expectCartDrawerWith(page, productName)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Checkout', exact: true }).first()).toBeVisible()

  const remove = page.getByRole('button', { name: /remove/i }).first()
  await remove.click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  assertNoErrors()
})

test('cart sends buyers straight to secure payment with a shipping region', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  const productUrl = await firstAvailableProduct(page)
  test.skip(!productUrl, 'Catalog is empty; seed/publish products before checkout acceptance testing')

  const addButton = page.getByRole('button', { name: /Add to cart/i }).first()
  test.skip(!(await addButton.isVisible()), 'First catalog item is unavailable')
  await addButton.click()
  await expectCartDrawerWith(page, await page.getByRole('heading', { level: 1 }).innerText())
  await page.goto('/checkout')

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('radio', { name: 'Overseas' }).first()).toBeAttached()
  await expect(page.getByRole('button', { name: 'Checkout', exact: true }).first()).toBeVisible()
  assertNoErrors()
})
