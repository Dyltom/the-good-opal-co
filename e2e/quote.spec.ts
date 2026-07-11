import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('private quote access clears the bearer fragment and fails without disclosure', async ({ page }) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  await page.goto('/quote/access#not-a-valid-token', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/quote\/access$/)
  await expect(page.getByText(/secure quote link is unavailable/i)).toBeVisible()
  await expect(page.getByText(/requires JavaScript/i)).toBeVisible()
  assertNoErrors()
})

test('private quote pages are no-store, no-referrer, and non-enumerating', async ({ page }) => {
  const response = await page.goto('/quote/QUOTE-DOES-NOT-EXIST', {
    waitUntil: 'domcontentloaded',
  })
  expect(response?.status()).toBe(200)
  expect(response?.headers()['cache-control']).toContain('no-store')
  expect(response?.headers()['referrer-policy']).toBe('no-referrer')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.getByRole('heading', { name: 'This quote is unavailable' })).toBeVisible()
})
