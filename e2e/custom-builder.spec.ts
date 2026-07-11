import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('custom ring builder keeps live opal state and one WebGL canvas across camera views', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const assertNoErrors = failOnRuntimeErrors(page)
  const response = await page.goto('/services/design', { waitUntil: 'domcontentloaded' })

  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: 'See the possibilities.' })).toBeVisible()
  await expect(page.getByRole('group', { name: '2. Choose an available opal' })).toBeVisible()

  const opals = page.getByRole('group', { name: '2. Choose an available opal' }).getByRole('button')
  expect(await opals.count()).toBeGreaterThan(1)

  await opals.nth(1).click()
  await expect(page).toHaveURL(/[?&]p=\d+/)
  await expect(page.getByRole('link', { name: 'View selected loose opal' })).toBeVisible()

  const styles = page.getByRole('group', { name: '3. Choose a collection design' })
  await expect(styles).toBeVisible()
  await styles.getByRole('button', { name: /Aurora/ }).click()
  await expect(page).toHaveURL(/[?&]y=aurora/)

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Top', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Top', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(canvas).toBeVisible()
  await expect(page.getByText('Interactive 3D is unavailable on this device.')).toHaveCount(0)

  await page.getByRole('button', { name: 'Profile', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Profile', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(canvas).toHaveCount(1)
  assertNoErrors()
})
