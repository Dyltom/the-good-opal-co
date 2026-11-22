import { afterEach, describe, expect, test, vi } from 'vitest'
import { getMetalSpot } from '../metal-spot'
import { estimateRingPrice, priceSheetSpot } from '../pricing'

const feed = vi.hoisted(() => vi.fn<(url: string) => unknown>())

vi.mock('node:https', async () => {
  const { PassThrough } = await import('node:stream')
  const get = (url: string, _options: unknown, onResponse: (response: PassThrough) => void) => {
    const response = Object.assign(new PassThrough(), { statusCode: 200 })
    queueMicrotask(() => {
      onResponse(response)
      response.end(JSON.stringify(feed(url)))
    })
    return Object.assign(new PassThrough(), { on: () => undefined })
  }
  return { get, default: { get } }
})

const goldUp = { ...priceSheetSpot, goldAudPerOz: priceSheetSpot.goldAudPerOz * 1.2 }

describe('custom ring pricing', () => {
  test("charges Steph's price sheet at the sheet's metal prices", () => {
    expect(estimateRingPrice({ metal: 'sterling-silver', style: 'gemini' }, priceSheetSpot)).toBe(
      450
    )
    expect(estimateRingPrice({ metal: '9ct-gold', style: 'gemini' }, priceSheetSpot)).toBe(1091)
    expect(estimateRingPrice({ metal: '9ct-gold', style: 'sun-moon' }, priceSheetSpot)).toBe(1091)
  })

  test('passes a gold price rise on to gold rings only', () => {
    const silver = estimateRingPrice({ metal: 'sterling-silver', style: 'gemini' }, goldUp)
    const gold = estimateRingPrice({ metal: '9ct-gold', style: 'gemini' }, goldUp)
    expect(silver).toBe(450)
    expect(gold).toBeGreaterThan(1091)
  })

  test('prices higher-carat gold above 9ct and leaves platinum to a quote', () => {
    const price = (metal: Parameters<typeof estimateRingPrice>[0]['metal']) =>
      estimateRingPrice({ metal, style: 'gemini' }, priceSheetSpot)!
    expect(price('14k-gold')).toBeGreaterThan(price('9ct-gold'))
    expect(price('18k-gold')).toBeGreaterThan(price('14k-gold'))
    expect(estimateRingPrice({ metal: 'platinum', style: 'gemini' }, priceSheetSpot)).toBeNull()
  })
})

describe('live metal prices', () => {
  afterEach(() => vi.restoreAllMocks())

  test('falls back to the price sheet when the feed returns an implausible price', async () => {
    feed.mockImplementation(() => ({ price: 1, updatedAt: '2026-11-22T00:00:00Z' }))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await getMetalSpot()).toEqual(priceSheetSpot)
  })

  test('uses the feed when it returns plausible prices', async () => {
    feed.mockImplementation((url: string) => ({
      price: url.includes('XAU') ? 5400 : 63,
      updatedAt: '2026-11-23T00:00:00Z',
    }))
    expect(await getMetalSpot()).toMatchObject({
      goldAudPerOz: 5400,
      silverAudPerOz: 63,
      live: true,
    })
  })
})
