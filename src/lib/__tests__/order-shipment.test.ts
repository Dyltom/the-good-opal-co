import { describe, expect, test, vi } from 'vitest'
import type { Order } from '@/types/payload-types'
import { sendShipmentNotification, shouldSendShipmentNotification } from '@/lib/order-shipment'

function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 42,
    orderNumber: 'OPAL-TEST-42',
    source: 'stripe',
    status: 'shipped',
    customer: { email: 'buyer@example.com', name: 'Opal Buyer' },
    shippingAddress: { line1: '1 Test Street', city: 'Sydney', country: 'AU' },
    items: [
      {
        productId: '7',
        slug: 'test-opal',
        name: 'Test opal',
        price: 120,
        quantity: 1,
      },
    ],
    subtotal: 120,
    total: 120,
    stripeSessionId: 'cs_test_42',
    trackingNumber: 'TRACK-42',
    shippingCarrier: 'australia-post',
    createdAt: '2026-07-12T00:00:00.000Z',
    updatedAt: '2026-07-12T00:00:00.000Z',
    ...overrides,
  }
}

describe('shipment notifications', () => {
  test('sends only when a shipped order has tracking and no prior delivery record', () => {
    expect(shouldSendShipmentNotification(order())).toBe(true)
    expect(shouldSendShipmentNotification(order({ status: 'processing' }))).toBe(false)
    expect(shouldSendShipmentNotification(order({ source: 'woocommerce' }))).toBe(false)
    expect(shouldSendShipmentNotification(order({ trackingNumber: '  ' }))).toBe(false)
    expect(
      shouldSendShipmentNotification(order({ shipmentEmailSentAt: '2026-07-12T01:00:00.000Z' }))
    ).toBe(false)
  })

  test('uses customer, tracking, carrier, and a stable idempotency key', async () => {
    const send = vi.fn().mockResolvedValue({ error: null })
    await sendShipmentNotification(order(), { emails: { send } })

    expect(send).toHaveBeenCalledOnce()
    expect(send.mock.calls[0]?.[0]).toMatchObject({
      to: 'buyer@example.com',
      subject: 'Your order OPAL-TEST-42 has shipped',
    })
    expect(send.mock.calls[0]?.[1]).toEqual({ idempotencyKey: 'shipment-notification/42' })
  })

  test('surfaces provider rejection so Payload can record and retry it', async () => {
    const send = vi.fn().mockResolvedValue({ error: { message: 'provider unavailable' } })

    await expect(sendShipmentNotification(order(), { emails: { send } })).rejects.toThrow(
      'provider unavailable'
    )
  })
})
