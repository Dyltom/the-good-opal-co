import { describe, expect, test } from 'vitest'
import { calculateCheckoutPricing, dollarsToCents } from '../checkout-pricing'
import { shippingOptions } from '@/lib/constants/shipping'

const prices = (country: Parameters<typeof shippingOptions>[0], subtotal: number) =>
  shippingOptions(country, subtotal).map(({ label, cents }) => [label, cents])

describe('Australia Post shipping options', () => {
  test('offers Parcel Post and Express Post at the MyPost Business price within Australia', () => {
    expect(prices('AU', 100)).toEqual([
      ['Parcel Post', 1020],
      ['Express Post', 1320],
    ])
  })

  test('insures every Australian order over $100 with Extra Cover and signature on delivery', () => {
    expect(prices('AU', 150)).toEqual([
      ['Parcel Post with Extra Cover for $150 and signature', 1020 + 250 + 295],
      ['Express Post with Extra Cover for $150 and signature', 1320 + 250 + 295],
    ])
    expect(prices('AU', 650)).toEqual([
      ['Parcel Post with Extra Cover for $650 and signature', 1020 + 6 * 250 + 295],
      ['Express Post with Extra Cover for $650 and signature', 1320 + 6 * 250 + 295],
    ])
  })

  test('caps Extra Cover at $5,000', () => {
    expect(prices('AU', 6000)).toContainEqual([
      'Parcel Post with Extra Cover for $5,000 and signature',
      1020 + 49 * 250 + 295,
    ])
  })

  test('charges each overseas zone its published standard and express price', () => {
    expect(prices('NZ', 100)).toEqual([['International Standard', 1790], ['International Express', 3490]])
    expect(prices('SG', 100)).toEqual([['International Standard', 2060], ['International Express', 3760]])
    expect(prices('US', 100)).toEqual([['International Standard', 2305], ['International Express', 4005]])
  })

  test('charges postage on large orders too', () => {
    expect(prices('US', 5000)).toEqual([['International Standard', 2305], ['International Express', 4005]])
  })
})

describe('checkout pricing', () => {
  test('estimates the total with the cheapest insured option', () => {
    const pricing = calculateCheckoutPricing([{ price: 250, quantity: 2 }])

    expect(pricing.shippingCents).toBe(1020 + 4 * 250 + 295)
    expect(pricing.totalCents).toBe(50000 + 2315)
    expect(pricing.shippingOptions).toHaveLength(2)
  })

  test('charges the chosen express postage and offers it first at checkout', () => {
    const pricing = calculateCheckoutPricing([{ price: 80, quantity: 1 }], 'AU', 'express')

    expect(pricing.shippingCents).toBe(1320)
    expect(pricing.totalCents).toBe(8000 + 1320)
    expect(pricing.shippingOptions.map((option) => option.label)).toEqual([
      'Express Post',
      'Parcel Post',
    ])
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
  })

  test('insures only the shipped pieces, not deposits', () => {
    const pricing = calculateCheckoutPricing([
      { price: 100, quantity: 1 },
      { price: 450, quantity: 1, deposit: true },
    ])

    expect(pricing.subtotal).toBe(550)
    expect(pricing.shippingCents).toBe(1020)
  })

  test('converts dollar amounts to Stripe cents', () => {
    expect(dollarsToCents(15)).toBe(1500)
    expect(dollarsToCents(12.345)).toBe(1235)
  })
})
