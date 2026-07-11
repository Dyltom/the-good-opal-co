interface RefundAdjustmentInput {
  orderTotal: number
  previousRefundedAmount: number
  stripeRefundedAmount: number
}

export interface RefundAdjustment {
  refundedAmount: number
  refundDelta: number
}

/**
 * Calculates the newly observed part of Stripe's cumulative refund amount.
 * All values use the currency's minor unit (cents for AUD).
 */
export function calculateRefundAdjustment({
  orderTotal,
  previousRefundedAmount,
  stripeRefundedAmount,
}: RefundAdjustmentInput): RefundAdjustment {
  const maximumRefund = Math.max(0, Math.round(orderTotal))
  const previous = Math.min(maximumRefund, Math.max(0, Math.round(previousRefundedAmount)))
  const cumulative = Math.min(maximumRefund, Math.max(0, Math.round(stripeRefundedAmount)))
  const refundedAmount = Math.max(previous, cumulative)

  return {
    refundedAmount,
    refundDelta: refundedAmount - previous,
  }
}
