import type { Order } from '@/types/payload-types'

export function requireOrderForPaymentEvent(
  order: Order | null,
  eventType: string,
  paymentIntentId: string
): Order {
  if (!order) {
    throw new Error(
      `Order for payment intent ${paymentIntentId} is not ready for ${eventType}; retry required`
    )
  }
  return order
}

export function statusToRestoreAfterWonDispute(value: string | null | undefined): Order['status'] {
  switch (value) {
    case 'pending':
    case 'processing':
    case 'shipped':
    case 'delivered':
    case 'cancelled':
    case 'refunded':
      return value
    default:
      return 'processing'
  }
}
