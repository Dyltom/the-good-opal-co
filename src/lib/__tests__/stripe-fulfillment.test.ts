import { describe, expect, test } from 'vitest'
import {
  getRequiredCheckoutShippingDetails,
  shouldFinalizeCheckout,
} from '@/lib/stripe-fulfillment'

describe('Stripe checkout fulfilment', () => {
  test('reads shipping details from the current collected_information field', () => {
    expect(
      getRequiredCheckoutShippingDetails({
        collected_information: {
          shipping_details: {
            name: 'Mina Opal',
            address: {
              line1: '1 Gem Street',
              line2: null,
              city: 'Singapore',
              state: null,
              postal_code: null,
              country: 'SG',
            },
          },
        },
      })
    ).toEqual({
      name: 'Mina Opal',
      address: {
        line1: '1 Gem Street',
        line2: null,
        city: 'Singapore',
        state: null,
        postal_code: null,
        country: 'SG',
      },
    })
  })

  test('rejects sessions without valid current-version shipping details', () => {
    expect(() => getRequiredCheckoutShippingDetails({ collected_information: null })).toThrow(
      'Paid Stripe session is missing valid shipping details'
    )
  })

  test('clears the cart only after both payment and backend order confirmation', () => {
    expect(shouldFinalizeCheckout('paid', true)).toBe(true)
    expect(shouldFinalizeCheckout('paid', false)).toBe(false)
    expect(shouldFinalizeCheckout('unpaid', true)).toBe(false)
  })
})
