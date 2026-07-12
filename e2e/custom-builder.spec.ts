import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('custom ring builder keeps live opal state with a progressive 3D preview', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const assertNoErrors = failOnRuntimeErrors(page)
  const response = await page.goto('/services/design', { waitUntil: 'domcontentloaded' })

  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: 'See the possibilities.' })).toBeVisible()
  await expect(page.getByRole('group', { name: '2. Choose an available opal' })).toBeVisible()

  const opalGroup = page.getByRole('group', { name: '2. Choose an available opal' })
  const opals = opalGroup.getByRole('button')
  expect(await opals.count()).toBeGreaterThan(1)

  await opalGroup.getByRole('combobox', { name: 'Filter available opals' }).selectOption('individual')
  const individualOpals = opalGroup.getByRole('button').filter({ hasText: 'Individual stone' })
  expect(await individualOpals.count()).toBeGreaterThan(1)
  await individualOpals.nth(1).click()
  await expect(page).toHaveURL(/[?&]p=\d+/)
  await expect(page.getByRole('link', { name: 'View selected loose opal' })).toBeVisible()

  const styles = page.getByRole('group', { name: '3. Choose a collection design' })
  await expect(styles).toBeVisible()
  const compatibleStyles = styles.locator('button:not([disabled]):not([aria-pressed="true"])')
  expect(await compatibleStyles.count()).toBeGreaterThan(0)
  await compatibleStyles.first().click()
  await expect(page).toHaveURL(/[?&]y=(gemini|coral|sun-moon|aurora)/)

  const canvas = page.locator('canvas')
  const fallback = page.getByText('Interactive 3D is unavailable on this device.')
  await expect(canvas.or(fallback)).toBeVisible({ timeout: 15_000 })
  await expect
    .poll(async () => (await canvas.count()) + (await fallback.count()), { timeout: 15_000 })
    .toBe(1)
  const fallbackCount = await fallback.count()
  if (fallbackCount === 0) assertNoErrors()
})
