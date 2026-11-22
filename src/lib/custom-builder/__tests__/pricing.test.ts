import { afterEach, describe, expect, test, vi } from 'vitest'
import { getMetalSpot } from '../metal-spot'
import { estimateRingPrice, priceSheetSpot } from '../pricing'

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
  afterEach(() => vi.unstubAllGlobals())

  test('falls back to the price sheet when the feed returns an implausible price', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ price: 1, updatedAt: '2026-11-22T00:00:00Z' }))
    )
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await getMetalSpot()).toEqual(priceSheetSpot)
  })

  test('uses the feed when it returns plausible prices', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        Response.json({ price: url.includes('XAU') ? 5400 : 63, updatedAt: '2026-11-23T00:00:00Z' })
      )
    )
    expect(await getMetalSpot()).toMatchObject({
      goldAudPerOz: 5400,
      silverAudPerOz: 63,
      live: true,
    })
  })
})
