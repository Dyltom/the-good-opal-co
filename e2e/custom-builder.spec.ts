import { expect, test } from '@playwright/test'
import { failOnRuntimeErrors } from './support/runtime-errors'

test('custom ring builder keeps live opal state with a progressive 3D preview', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const assertNoErrors = failOnRuntimeErrors(page)
  const response = await page.goto('/services/design', { waitUntil: 'domcontentloaded' })

  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: 'Design your opal ring' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Opal' })).toBeVisible()

  const previewSource = page.getByRole('group', { name: 'Preview source' })
  await expect(previewSource.getByRole('button', { name: '3D concept' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await previewSource.getByRole('button', { name: 'Sold ring reference' }).click()
  await expect(page.getByText('Sold reference')).toBeVisible()
  await expect(page.getByRole('img', { name: /sold Good Opal Co ring reference/ })).toBeVisible()
  await expect(page.getByText(/Your selected opal changes the final fit and scale/)).toBeVisible()
  await previewSource.getByRole('button', { name: '3D concept' }).click()

  const opalGroup = page.getByRole('group', { name: 'Opal' })
  const opals = opalGroup.getByRole('button')
  expect(await opals.count()).toBeGreaterThan(1)

  await opalGroup
    .getByRole('combobox', { name: 'Filter available opals' })
    .selectOption('individual')
  const individualOpals = opalGroup.locator('button[data-opal-id]')
  expect(await individualOpals.count()).toBeGreaterThan(1)
  await individualOpals.nth(1).click()
  await expect(page).toHaveURL(/[?&]p=\d+/)
  await expect(page.getByRole('link', { name: 'View selected loose opal' })).toBeVisible()

  const placementAperture = page.locator('[data-opal-placement-aperture]')
  await placementAperture.scrollIntoViewIfNeeded()
  const placementImage = placementAperture.locator('img')
  await expect(placementImage).toHaveAttribute('loading', 'eager')
  await expect
    .poll(
      () =>
        placementImage.evaluate(
          (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
        ),
      { timeout: 15_000 }
    )
    .toBe(true)

  await page.locator('summary').filter({ hasText: 'Fine position' }).click()
  await page.getByRole('slider', { name: 'Zoom' }).fill('1.35')
  const horizontalPosition = page.getByRole('slider', { name: 'Horizontal' })
  await expect(horizontalPosition).toBeEnabled()
  await horizontalPosition.fill('0.18')
  await page.getByRole('slider', { name: 'Rotation' }).fill('25')
  await expect(page).toHaveURL(/[?&]px=0\.18/)
  await expect(page).toHaveURL(/[?&]ps=1\.35/)
  await expect(page).toHaveURL(/[?&]pr=25/)

  const styles = page.getByRole('group', { name: 'Design' })
  await expect(styles).toBeVisible()
  await expect(styles.getByRole('button', { name: /Gemini/i })).toBeEnabled()
  await expect(styles.getByRole('button', { name: /Sun & Moon/i })).toBeEnabled()
  await expect(styles.getByRole('button', { name: /Coral/i })).toBeDisabled()
  await expect(styles.getByRole('button', { name: /Aurora/i })).toBeDisabled()
  await styles.getByRole('button', { name: /Sun & Moon/i }).click()
  await expect(page).toHaveURL(/[?&]y=sun-moon/)

  await individualOpals.nth(0).click()
  const selectedStyle = styles.locator('button[aria-pressed="true"]')
  await expect(selectedStyle).toHaveCount(1)
  await expect(selectedStyle).toBeEnabled()

  await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/The 3D view needs WebGL/)).toHaveCount(0)
  assertNoErrors()
})

test('every sold design silhouette renders as a complete 3D scene', async ({ page }) => {
  test.setTimeout(180_000)
  const assertNoErrors = failOnRuntimeErrors(page)

  for (const style of ['gemini', 'coral', 'sun-moon', 'aurora']) {
    const response = await page.goto(`/services/design?y=${style}&p=missing-test-opal`, {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.status(), style).toBeLessThan(400)
    await expect(page.locator('canvas')).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(new RegExp(`[?&]y=${style}`))
  }

  assertNoErrors()
})
