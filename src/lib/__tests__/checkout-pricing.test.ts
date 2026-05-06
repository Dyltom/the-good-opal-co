import { describe, expect, test } from 'vitest'
import {
  calculateCheckoutPricing,
  calculateStripeCheckoutAmounts,
  dollarsToCents,
  toDiscountContext,
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

  test('converts dollar amounts to Stripe cents', () => {
    expect(dollarsToCents(15)).toBe(1500)
    expect(dollarsToCents(12.345)).toBe(1235)
  })

  test('passes cents to the discount engine without adding GST again', () => {
    expect(toDiscountContext(calculateCheckoutPricing(120))).toEqual({
      subtotal: 12000,
      shipping: 1500,
      tax: 0,
    })
  })

  test('keeps shipping discounts out of Stripe coupons to avoid double-discounting', () => {
    expect(
      calculateStripeCheckoutAmounts({
        shippingCents: 1500,
        discountAmountCents: 2000,
        shippingDiscountCents: 1500,
      })
    ).toEqual({
      couponAmountOffCents: 2000,
      adjustedShippingCents: 0,
    })
  })

  test('does not create a Stripe coupon for free shipping only', () => {
    expect(
      calculateStripeCheckoutAmounts({
        shippingCents: 1500,
        discountAmountCents: 0,
        shippingDiscountCents: 1500,
      })
    ).toEqual({
      couponAmountOffCents: undefined,
      adjustedShippingCents: 0,
    })
  })
})
