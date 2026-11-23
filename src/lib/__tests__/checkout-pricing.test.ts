import { describe, expect, test } from 'vitest'
import {
  calculateCheckoutPricing,
  dollarsToCents,
} from '../checkout-pricing'

describe('checkout pricing', () => {
  test('charges AUD 15 shipping below the AUD 500 free-shipping threshold', () => {
    const pricing = calculateCheckoutPricing([{ price: 499, quantity: 1 }])

    expect(pricing.shipping).toBe(15)
    expect(pricing.shippingCents).toBe(1500)
    expect(pricing.total).toBe(514)
    expect(pricing.freeShippingRemaining).toBe(1)
  })

  test('makes shipping free at AUD 500', () => {
    const pricing = calculateCheckoutPricing([{ price: 250, quantity: 2 }])

    expect(pricing.shipping).toBe(0)
    expect(pricing.shippingCents).toBe(0)
    expect(pricing.total).toBe(500)
    expect(pricing.freeShippingRemaining).toBe(0)
  })

  test('uses the international rate for non-Australian destinations', () => {
    const pricing = calculateCheckoutPricing([{ price: 100, quantity: 1 }], 'INTERNATIONAL')

    expect(pricing.shipping).toBe(25)
    expect(pricing.shippingCents).toBe(2500)
    expect(pricing.total).toBe(125)
  })

  test('does not charge shipping on a deposit-only cart', () => {
    const pricing = calculateCheckoutPricing([{ price: 50, quantity: 2, deposit: true }], 'INTERNATIONAL')

    expect(pricing.shipping).toBe(0)
    expect(pricing.total).toBe(100)
    expect(pricing.freeShippingRemaining).toBe(0)
  })

  test('leaves deposits out of the free-shipping threshold', () => {
    const pricing = calculateCheckoutPricing([
      { price: 450, quantity: 1 },
      { price: 100, quantity: 1, deposit: true },
    ])

    expect(pricing.subtotal).toBe(550)
    expect(pricing.shipping).toBe(15)
    expect(pricing.total).toBe(565)
    expect(pricing.freeShippingRemaining).toBe(50)
  })

  test('converts dollar amounts to Stripe cents', () => {
    expect(dollarsToCents(15)).toBe(1500)
    expect(dollarsToCents(12.345)).toBe(1235)
  })
})
