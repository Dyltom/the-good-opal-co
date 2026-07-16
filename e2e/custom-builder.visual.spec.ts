import { expect, test, type Locator, type Page } from '@playwright/test'
import sharp from 'sharp'

const screenshotOptions = {
  animations: 'disabled',
  caret: 'hide',
  maxDiffPixelRatio: 0.003,
  scale: 'css',
  threshold: 0.12,
  timeout: 15_000,
} as const

// Chromium's JPEG scaling differs slightly between macOS/CoreGraphics and
// Linux/Skia. Keep the 3D ring gate strict; only the photo-heavy CSS workbench
// receives enough tolerance for that measured cross-platform raster variance.
const workbenchScreenshotOptions = {
  ...screenshotOptions,
  maxDiffPixelRatio: 0.025,
} as const

const styles = ['gemini', 'coral', 'sun-moon', 'aurora'] as const

async function expectPixelSanity(canvas: Locator, label: string): Promise<void> {
  const screenshot = await canvas.screenshot({ animations: 'disabled', scale: 'css' })
  const stats = await sharp(screenshot).stats()
  const maximumDeviation = Math.max(...stats.channels.slice(0, 3).map(({ stdev }) => stdev))
  expect(maximumDeviation, `${label} must not be a blank or uniform canvas`).toBeGreaterThan(8)

  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const channels = info.channels
  const cornerCoordinates = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ] as const
  const background = [0, 1, 2].map((channel) => {
    const total = cornerCoordinates.reduce((sum, [x, y]) => {
      const offset = (y * info.width + x) * channels
      return sum + data[offset + channel]!
    }, 0)
    return total / cornerCoordinates.length
  })

  let maximumX = -1
  let maximumY = -1
  let minimumX = info.width
  let minimumY = info.height
  let nonBackgroundPixels = 0

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * channels
      const differsFromBackground = background.some(
        (value, channel) => Math.abs(data[offset + channel]! - value) > 18
      )
      if (!differsFromBackground) continue

      nonBackgroundPixels += 1
      minimumX = Math.min(minimumX, x)
      maximumX = Math.max(maximumX, x)
      minimumY = Math.min(minimumY, y)
      maximumY = Math.max(maximumY, y)
    }
  }

  const pixelRatio = nonBackgroundPixels / (info.width * info.height)
  expect(pixelRatio, `${label} must contain a visible ring`).toBeGreaterThan(0.03)
  expect(pixelRatio, `${label} foreground must not fill the canvas`).toBeLessThan(0.7)
  expect(minimumX, `${label} must not clip the left edge`).toBeGreaterThan(info.width * 0.01)
  expect(maximumX, `${label} must not clip the right edge`).toBeLessThan(info.width * 0.99)
  expect(minimumY, `${label} must not clip the top edge`).toBeGreaterThan(info.height * 0.01)
  expect(maximumY, `${label} must not clip the bottom edge`).toBeLessThan(info.height * 0.99)
}

async function expectRingSnapshot(page: Page, query: string, snapshotName: string): Promise<void> {
  const response = await page.goto(`/visual-tests/ring-scene?${query}`, {
    waitUntil: 'domcontentloaded',
  })
  expect(response?.status()).toBeLessThan(400)

  const harness = page.getByTestId('ring-scene-visual-harness')
  await expect(harness).toHaveAttribute('data-render-state', 'ready', { timeout: 30_000 })
  const canvas = harness.locator('canvas')
  await expect(canvas).toBeVisible()
  await expectPixelSanity(canvas, snapshotName)
  await expect(canvas).toHaveScreenshot(snapshotName, screenshotOptions)
}

test.describe('custom ring render fidelity', () => {
  test.skip(
    Boolean(process.env.PLAYWRIGHT_BASE_URL) && process.env.ENABLE_RING_VISUAL_HARNESS !== '1',
    'Visual harness is intentionally unavailable on deployed environments.'
  )

  for (const style of styles) {
    test(`${style} preserves its face-on construction`, async ({ page }) => {
      test.setTimeout(60_000)
      await expectRingSnapshot(page, `style=${style}&view=front`, `ring-${style}-front.png`)
    })

    test(`${style} keeps its setting seated in profile`, async ({ page }) => {
      test.setTimeout(60_000)
      await expectRingSnapshot(page, `style=${style}&view=profile`, `ring-${style}-profile.png`)
    })

    test(`${style} preserves its construction at three-quarter view`, async ({ page }) => {
      test.setTimeout(60_000)
      await expectRingSnapshot(
        page,
        `style=${style}&view=three-quarter`,
        `ring-${style}-three-quarter.png`
      )
    })
  }

  test('maps the reviewed listing crop onto the opal face', async ({ page }) => {
    test.setTimeout(60_000)
    await expectRingSnapshot(page, 'fixture=reviewed&view=front', 'ring-photo-reviewed.png')
  })

  test('maps customer placement onto the same photographed opal', async ({ page }) => {
    test.setTimeout(60_000)
    await expectRingSnapshot(page, 'fixture=placed&view=front', 'ring-photo-placed.png')
  })

  test('keeps rendering with the reviewed listing crop when a canonical artifact is missing', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    const requestedUrls: string[] = []
    page.on('request', (request) => requestedUrls.push(request.url()))

    const response = await page.goto(
      '/visual-tests/ring-scene?fixture=canonical-missing&view=front',
      { waitUntil: 'domcontentloaded' }
    )
    expect(response?.status()).toBeLessThan(400)

    const harness = page.getByTestId('ring-scene-visual-harness')
    await expect(harness).toHaveAttribute('data-render-state', 'ready', { timeout: 30_000 })
    await expect
      .poll(() => requestedUrls.some((url) => url.includes('missing-canonical-face.png')))
      .toBe(true)
    await expect
      .poll(() => requestedUrls.some((url) => url.includes('20211104_234659-1-1.jpg')))
      .toBe(true)
    await expectPixelSanity(harness.locator('canvas'), 'canonical fallback ring')
  })

  for (const silhouette of ['elongated', 'pear', 'heart'] as const) {
    test(`${silhouette} catalogue opal keeps its reviewed face inside the setting`, async ({
      page,
    }) => {
      test.setTimeout(60_000)
      await expectRingSnapshot(
        page,
        `fixture=${silhouette}&view=front`,
        `ring-photo-${silhouette}.png`
      )
    })

    test(`${silhouette} catalogue opal stays covered after customer placement`, async ({
      page,
    }) => {
      test.setTimeout(60_000)
      await expectRingSnapshot(
        page,
        `fixture=${silhouette}-placed&view=front`,
        `ring-photo-${silhouette}-placed.png`
      )
    })
  }

  test('keeps adapted Sun & Moon grains clear of a heart cleft', async ({ page }) => {
    test.setTimeout(60_000)
    await expectRingSnapshot(
      page,
      'fixture=heart&style=sun-moon&view=front',
      'ring-photo-heart-sun-moon.png'
    )
  })

  test('seats an adapted heart continuously inside the Sun & Moon cup', async ({ page }) => {
    test.setTimeout(60_000)
    await expectRingSnapshot(
      page,
      'fixture=heart&style=sun-moon&view=profile',
      'ring-photo-heart-sun-moon-profile.png'
    )
  })

  test('keeps the opal framing workbench clear and setting-specific', async ({ page }) => {
    test.setTimeout(60_000)
    const browserErrors: string[] = []
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ necessary: true, analytics: false })
      )
    })
    const response = await page.goto('/visual-tests/opal-placement', {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.status()).toBeLessThan(400)

    const harness = page.getByTestId('opal-placement-visual-harness')
    await expect(harness).toHaveAttribute('data-hydrated', 'true')
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })

    const workbench = page.getByTestId('opal-placement-workbench')
    await expect(workbench).toHaveScreenshot(
      'opal-placement-workbench.png',
      workbenchScreenshotOptions
    )

    await workbench.getByRole('button', { name: 'Start framing colour' }).click()
    await expect(workbench.getByRole('group', { name: /Drag the colour inside/ })).toBeVisible()
    await expect(workbench).toHaveScreenshot(
      'opal-placement-workbench-active.png',
      workbenchScreenshotOptions
    )
    expect(browserErrors).toEqual([])
  })
})
