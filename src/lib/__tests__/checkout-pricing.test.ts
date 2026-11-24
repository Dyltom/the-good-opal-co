import { describe, expect, test } from 'vitest'
import { calculateCheckoutPricing, dollarsToCents } from '../checkout-pricing'
import { shippingOptions } from '@/lib/constants/shipping'

const prices = (country: Parameters<typeof shippingOptions>[0], subtotal: number) =>
  shippingOptions(country, subtotal).map(({ label, cents }) => [label, cents])

describe('Australia Post shipping options', () => {
  test('offers Parcel Post and Express Post at the published national price within Australia', () => {
    expect(prices('AU', 499.99)).toEqual([
      ['Parcel Post', 1055],
      ['Express Post', 1355],
    ])
  })

  test('charges each overseas zone its published standard and express price', () => {
    expect(prices('NZ', 100)).toEqual([['International Standard', 1790], ['International Express', 3490]])
    expect(prices('SG', 100)).toEqual([['International Standard', 2060], ['International Express', 3760]])
    expect(prices('HK', 100)).toEqual(prices('JP', 100))
    expect(prices('US', 100)).toEqual([['International Standard', 2305], ['International Express', 4005]])
    expect(prices('CA', 100)).toEqual(prices('US', 100))
    expect(prices('GB', 100)).toEqual([['International Standard', 2840], ['International Express', 4540]])
  })

  test('switches to one free option at AUD 500: Express Post at home, International Standard overseas', () => {
    expect(prices('AU', 500)).toEqual([['Free Express Post', 0]])
    expect(prices('GB', 500)).toEqual([['Free International Standard', 0]])
  })
})

describe('checkout pricing', () => {
  test('estimates the total with the cheapest option below the threshold', () => {
    const pricing = calculateCheckoutPricing([{ price: 499, quantity: 1 }])

    expect(pricing.shippingCents).toBe(1055)
    expect(pricing.totalCents).toBe(50955)
    expect(pricing.total).toBe(509.55)
    expect(pricing.shippingOptions).toHaveLength(2)
    expect(pricing.freeShippingRemaining).toBe(1)
  })

  test('makes shipping free at AUD 500', () => {
    const pricing = calculateCheckoutPricing([{ price: 250, quantity: 2 }])

    expect(pricing.shippingCents).toBe(0)
    expect(pricing.total).toBe(500)
    expect(pricing.freeShippingRemaining).toBe(0)
  })

  test('prices shipping for the chosen country', () => {
    const pricing = calculateCheckoutPricing([{ price: 100, quantity: 1 }], 'US')

    expect(pricing.shippingCents).toBe(2305)
    expect(pricing.total).toBe(123.05)
  })

  test('does not charge shipping on a deposit-only cart', () => {
    const pricing = calculateCheckoutPricing([{ price: 50, quantity: 2, deposit: true }], 'NZ')

    expect(pricing.shippingOptions).toEqual([expect.objectContaining({ cents: 0 })])
    expect(pricing.total).toBe(100)
    expect(pricing.freeShippingRemaining).toBe(0)
  })

  test('leaves deposits out of the free-shipping threshold', () => {
    const pricing = calculateCheckoutPricing([
      { price: 450, quantity: 1 },
      { price: 100, quantity: 1, deposit: true },
    ])

    expect(pricing.subtotal).toBe(550)
    expect(pricing.shippingCents).toBe(1055)
    expect(pricing.freeShippingRemaining).toBe(50)
  })

  test('converts dollar amounts to Stripe cents', () => {
    expect(dollarsToCents(15)).toBe(1500)
    expect(dollarsToCents(12.345)).toBe(1235)
  })
})
