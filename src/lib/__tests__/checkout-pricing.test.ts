import { describe, expect, test } from 'vitest'
import {
  calculateCheckoutPricing,
  dollarsToCents,
  gstIncluded,
} from '../checkout-pricing'

describe('checkout pricing', () => {
  test('charges AUD 15 shipping below the AUD 500 free-shipping threshold', () => {
    const pricing = calculateCheckoutPricing(499)

    expect(pricing.shipping).toBe(15)
    expect(pricing.shippingCents).toBe(1500)
    expect(pricing.total).toBe(514)
    expect(pricing.freeShippingRemaining).toBe(1)
  })

  test('makes shipping free at AUD 500', () => {
    const pricing = calculateCheckoutPricing(500)

    expect(pricing.shipping).toBe(0)
    expect(pricing.shippingCents).toBe(0)
    expect(pricing.total).toBe(500)
    expect(pricing.freeShippingRemaining).toBe(0)
  })

  test('uses the international rate for non-Australian destinations', () => {
    const pricing = calculateCheckoutPricing(100, 'INTERNATIONAL')

    expect(pricing.shipping).toBe(25)
    expect(pricing.shippingCents).toBe(2500)
    expect(pricing.total).toBe(125)
  })

  test('converts dollar amounts to Stripe cents', () => {
    expect(dollarsToCents(15)).toBe(1500)
    expect(dollarsToCents(12.345)).toBe(1235)
  })

  test('reports the GST included in a GST-inclusive total as one eleventh, rounded to the cent', () => {
    expect(gstIncluded(110)).toBe(10)
    expect(gstIncluded(514)).toBe(46.73)
    expect(gstIncluded(125)).toBe(11.36)
    expect(gstIncluded(0)).toBe(0)
  })
})
