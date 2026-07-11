import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('core public routes render without server or browser errors', async ({ page }) => {
  test.setTimeout(90_000)
  const assertNoErrors = failOnRuntimeErrors(page)
  const routes = [
    '/',
    '/store',
    '/services',
    '/about',
    '/contact',
    '/faq',
    '/shipping',
    '/returns',
    '/order-tracking',
    '/blog',
    '/legal/privacy',
    '/legal/terms',
    '/legal/cookies',
  ]

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), route).toBeLessThan(400)
    await expect(page.locator('main')).toBeVisible()
  }
  assertNoErrors()
})

test('navigation works at the active viewport', async ({ page }, testInfo) => {
  const assertNoErrors = failOnRuntimeErrors(page)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveTitle(/The Good Opal Co/)

  if (testInfo.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
  }

  await page.getByRole('link', { name: /Shop/i }).first().click()
  await expect(page).toHaveURL(/\/store/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  assertNoErrors()
})

test('health, robots, sitemap, redirects, and not-found behavior are coherent', async ({
  page,
}) => {
  const health = await page.request.get('/api/health')
  expect(health.status()).toBe(200)
  expect(await health.json()).toMatchObject({ status: 'healthy', database: 'connected' })

  const home = await page.request.get('/')
  expect(home.headers()['x-content-type-options']).toBe('nosniff')
  expect(home.headers()['x-frame-options']).toBe('DENY')
  expect(home.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(home.headers()['permissions-policy']).toBe('camera=(), geolocation=(), microphone=()')

  const robots = await page.request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).not.toContain('/_next/')
  expect((await page.request.get('/sitemap.xml')).status()).toBe(200)

  await page.goto('/account')
  await expect(page).toHaveURL(/\/order-tracking$/)
  await page.goto('/privacy')
  await expect(page).toHaveURL(/\/legal\/privacy$/)

  const missing = await page.goto('/definitely-not-a-real-page')
  expect(missing?.status()).toBe(404)
})

test('contact form exposes validation and accessible field names', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.getByLabel('Name *')).toBeVisible()
  await expect(page.getByLabel('Email *')).toBeVisible()
  await expect(page.getByLabel('Message *')).toBeVisible()
  await page.getByRole('button', { name: 'Send Message' }).click()
  await expect(page.getByText('Please enter your name.')).toBeVisible()
})
