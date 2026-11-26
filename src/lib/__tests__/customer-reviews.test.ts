import { describe, expect, test } from 'vitest'
import type Stripe from 'stripe'
import { surveyOptInFor } from '../customer-reviews'

function session(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: 'cs_test_1',
    created: Date.parse('2026-12-04T02:00:00Z') / 1000,
    customer_details: { email: 'buyer@example.com' },
    collected_information: { shipping_details: { address: { country: 'AU' } } },
    shipping_cost: {
      shipping_rate: { delivery_estimate: { maximum: { unit: 'business_day', value: 8 } } },
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session
}

describe('Google Customer Reviews survey opt-in', () => {
  test('asks Google to survey after the latest delivery date, skipping weekends', () => {
    expect(surveyOptInFor(session())).toEqual({
      orderId: 'cs_test_1',
      email: 'buyer@example.com',
      deliveryCountry: 'AU',
      estimatedDeliveryDate: '2026-12-16',
    })
  })

  test('offers no survey for orders with nothing posted, such as gift vouchers and deposits', () => {
    expect(surveyOptInFor(session({ shipping_cost: null }))).toBeNull()
  })
})
