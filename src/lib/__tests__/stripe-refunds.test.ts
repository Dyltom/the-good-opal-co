import { describe, expect, it } from 'vitest'
import { calculateRefundAdjustment } from '@/lib/stripe-refunds'

describe('calculateRefundAdjustment', () => {
  it('applies only the new portion of cumulative partial refunds', () => {
    expect(
      calculateRefundAdjustment({
        orderTotal: 20_000,
        previousRefundedAmount: 2_500,
        stripeRefundedAmount: 7_000,
      })
    ).toEqual({ refundedAmount: 7_000, refundDelta: 4_500 })
  })

  it('makes replayed and stale events idempotent', () => {
    expect(
      calculateRefundAdjustment({
        orderTotal: 20_000,
        previousRefundedAmount: 7_000,
        stripeRefundedAmount: 7_000,
      })
    ).toEqual({ refundedAmount: 7_000, refundDelta: 0 })

    expect(
      calculateRefundAdjustment({
        orderTotal: 20_000,
        previousRefundedAmount: 7_000,
        stripeRefundedAmount: 2_500,
      })
    ).toEqual({ refundedAmount: 7_000, refundDelta: 0 })
  })

  it('applies the remaining delta when a partial refund becomes full', () => {
    expect(
      calculateRefundAdjustment({
        orderTotal: 20_000,
        previousRefundedAmount: 7_000,
        stripeRefundedAmount: 20_000,
      })
    ).toEqual({ refundedAmount: 20_000, refundDelta: 13_000 })
  })

  it('never subtracts more than the order contributed', () => {
    expect(
      calculateRefundAdjustment({
        orderTotal: 20_000,
        previousRefundedAmount: 0,
        stripeRefundedAmount: 25_000,
      })
    ).toEqual({ refundedAmount: 20_000, refundDelta: 20_000 })
  })
})
