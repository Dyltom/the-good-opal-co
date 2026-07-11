import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('private quote access clears the bearer fragment and fails without disclosure', async ({
  page,
}) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  await page.goto('/quote/access#not-a-valid-token', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/quote\/access$/)
  await expect(page.getByText(/secure quote link is unavailable/i)).toBeVisible()
  await expect(page.getByText(/require JavaScript/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Your privacy choices' })).toHaveCount(0)
  assertNoErrors()
})

test('private quote pages are no-store, no-referrer, and non-enumerating', async ({ page }) => {
  const response = await page.goto('/quote/QUOTE-DOES-NOT-EXIST', {
    waitUntil: 'domcontentloaded',
  })
  expect(response?.status()).toBe(200)
  const cacheControl = response?.headers()['cache-control'] ?? ''
  // Next.js development mode deliberately replaces route headers with
  // `no-cache, must-revalidate`; deployed production responses retain the
  // stricter configured `private, no-store, max-age=0` policy.
  expect(cacheControl).toMatch(/no-store|no-cache, must-revalidate/)
  expect(cacheControl).not.toContain('public')
  expect(response?.headers()['referrer-policy']).toBe('no-referrer')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
  await expect(page.getByRole('heading', { name: 'This quote is unavailable' })).toBeVisible()
})
