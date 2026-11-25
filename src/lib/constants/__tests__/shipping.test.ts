import { describe, expect, test } from 'vitest'
import { LOOSE_STONE_SINGAPORE_MESSAGE, shippingRestriction } from '../shipping'

describe('which bags can ship where', () => {
  const ring = { looseStone: false }
  const opal = { looseStone: true }

  test('stops a bag with a loose opal from shipping to Singapore', () => {
    expect(shippingRestriction('SG', [ring, opal])).toBe(LOOSE_STONE_SINGAPORE_MESSAGE)
  })

  test('lets jewellery ship to Singapore', () => {
    expect(shippingRestriction('SG', [ring])).toBeNull()
  })

  test('lets loose opals ship everywhere else we ship', () => {
    for (const country of ['AU', 'NZ', 'US'] as const) {
      expect(shippingRestriction(country, [opal])).toBeNull()
    }
  })
})
