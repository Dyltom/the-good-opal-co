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
  const drawer = page.getByRole('dialog', { name: /your bag/i })
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
  const addButton = page.getByRole('button', { name: /Add to bag/i }).first()
  if (!(await addButton.isVisible())) {
    await expect(page.getByRole('link', { name: 'See similar pieces' })).toBeVisible()
    assertNoErrors()
    return
  }

  await addButton.click()
  await expectCartDrawerWith(page, productName)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Your bag', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Checkout', exact: true }).filter({ visible: true })).toHaveCount(1)

  const remove = page.getByRole('button', { name: /remove/i }).first()
  await remove.click()
  await expect(page.getByRole('heading', { name: 'Your bag is empty' })).toBeVisible()
  assertNoErrors()
})

test('quick add and remove leave the store grid still', async ({ page }) => {
  await page.addInitScript(() => {
    const calls = { count: 0 }
    Object.assign(window, { viewTransitions: calls })
    const start = Document.prototype.startViewTransition
    if (!start) return
    Document.prototype.startViewTransition = function (this: Document, ...args: Parameters<Document['startViewTransition']>) {
      calls.count += 1
      return start.apply(this, args)
    }
  })
  const viewTransitions = () => page.evaluate(() => (window as unknown as { viewTransitions: { count: number } }).viewTransitions.count)

  await page.goto('/store')
  const card = page.locator('[data-store-grid] article').filter({ has: page.getByRole('button', { name: /^(Quick add|Add .* to bag)$/, includeHidden: true }) }).first()
  test.skip((await card.count()) === 0, 'No available piece in the catalog')
  await page.waitForLoadState('networkidle')

  await card.hover()
  await card.getByRole('button', { name: /^(Quick add|Add .* to bag)$/ }).filter({ visible: true }).first().click()
  const drawer = page.getByRole('dialog', { name: /your bag/i })
  await expect(drawer.getByRole('button', { name: /^Remove .* from bag$/ })).toBeVisible()
  await page.waitForLoadState('networkidle')
  expect(await viewTransitions()).toBe(0)

  await drawer.getByRole('button', { name: /^Remove .* from bag$/ }).first().click()
  await expect(drawer.getByRole('button', { name: /^Remove .* from bag$/ })).toHaveCount(0)
  await page.waitForLoadState('networkidle')
  expect(await viewTransitions()).toBe(0)
})

test.describe('before the page hydrates', () => {
  test.use({ javaScriptEnabled: false })

  test('Add to bag still puts the piece in the bag', async ({ page }) => {
    const productUrl = await firstAvailableProduct(page)
    test.skip(!productUrl, 'Catalog is empty; seed/publish products before catalog acceptance testing')

    const productName = await page.getByRole('heading', { level: 1 }).innerText()
    const addButton = page.getByRole('button', { name: /Add to bag/i }).first()
    test.skip(!(await addButton.isVisible()), 'First catalog item is unavailable')

    await addButton.click()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole('heading', { name: 'Your bag', exact: true })).toBeVisible()
    await expect(page.getByText(productName).first()).toBeVisible()
  })
})

test('cart sends buyers straight to secure payment with a shipping region', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  const productUrl = await firstAvailableProduct(page)
  test.skip(!productUrl, 'Catalog is empty; seed/publish products before checkout acceptance testing')

  const addButton = page.getByRole('button', { name: /Add to bag/i }).first()
  test.skip(!(await addButton.isVisible()), 'First catalog item is unavailable')
  await addButton.click()
  await expectCartDrawerWith(page, await page.getByRole('heading', { level: 1 }).innerText())
  await page.goto('/checkout')

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('radio', { name: 'Overseas' }).first()).toBeAttached()
  await expect(page.getByRole('button', { name: 'Checkout', exact: true }).filter({ visible: true })).toHaveCount(1)
  assertNoErrors()
})
