import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  getRedis: () => null,
  getRateLimitNamespace: () => 'test',
}))

const shopper = new Headers({ 'x-forwarded-for': '203.0.113.7', 'user-agent': 'Mobile Chrome' })
const now = new Date('2026-11-26T13:15:00Z')

describe('visitorKey', () => {
  it('gives a checkout and a page beacon the same key when Next bundles the module twice', async () => {
    const beaconCopy = await import('../visitor')
    vi.resetModules()
    const checkoutCopy = await import('../visitor')

    expect(checkoutCopy.visitorKey).not.toBe(beaconCopy.visitorKey)
    expect(await checkoutCopy.visitorKey(shopper, now)).toBe(
      await beaconCopy.visitorKey(shopper, now)
    )
  })

  it('rotates the key each day', async () => {
    const { visitorKey } = await import('../visitor')

    expect(await visitorKey(shopper, new Date('2026-11-27T01:00:00Z'))).not.toBe(
      await visitorKey(shopper, now)
    )
  })
})
