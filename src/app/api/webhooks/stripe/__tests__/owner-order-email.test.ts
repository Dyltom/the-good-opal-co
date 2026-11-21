import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { constructEvent, find, send, update } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  find: vi.fn(),
  send: vi.fn(),
  update: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class StripeMock {
    webhooks = { constructEvent }
  },
}))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send }
  },
}))
vi.mock('@/lib/stripe-config', () => ({
  getConfiguredStripeSecretKey: () => 'sk_test_valid_for_mock',
  getConfiguredStripeWebhookSecret: () => 'whsec_valid_for_mock',
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({ find, update }),
}))

import type { Order } from '@/types/payload-types'
import { POST } from '../route'

const paidOrder = {
  id: 7,
  orderNumber: 'OPAL-TEST-1',
  status: 'processing',
  customer: { email: 'buyer@example.com', name: 'Jo Buyer', phone: '+61400000000' },
  shippingAddress: {
    line1: '1 Opal St',
    line2: 'Unit 2',
    city: 'Lightning Ridge',
    state: 'NSW',
    postalCode: '2834',
    country: 'AU',
  },
  items: [{ productId: '11', slug: 'ring', name: 'Black Opal Ring', price: 450, quantity: 1 }],
  subtotal: 450,
  shipping: 15,
  total: 465,
  currency: 'AUD',
  stripeSessionId: 'cs_paid',
  updatedAt: '2026-11-21T00:00:00.000Z',
  createdAt: '2026-11-21T00:00:00.000Z',
} as Order

function webhook() {
  return POST(
    new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'signed' },
    })
  )
}

function ownerEmails() {
  return send.mock.calls.filter(([message]) => message.to === process.env['CONTACT_EMAIL'])
}

describe('Stripe webhook owner order email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CONTACT_EMAIL', 'steph@example.com')
    vi.stubEnv('EMAIL_FROM', 'shop@example.com')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com/')
    send.mockResolvedValue({ data: { id: 'email' }, error: null })
    update.mockResolvedValue({})
    constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      created: 1_784_000_000,
      data: { object: { id: 'cs_paid', mode: 'payment', payment_status: 'paid', metadata: {} } },
    })
  })

  it('emails the owner once with the order details for a paid order', async () => {
    find.mockResolvedValue({ docs: [{ ...paidOrder, confirmationEmailSentAt: '2026-11-21' }] })

    expect((await webhook()).status).toBe(200)

    expect(ownerEmails()).toHaveLength(1)
    const [message, options] = ownerEmails()[0] ?? []
    expect(message).toMatchObject({
      from: 'shop@example.com',
      replyTo: 'buyer@example.com',
      subject: 'New order - OPAL-TEST-1',
    })
    expect(options).toEqual({ idempotencyKey: 'owner-order/7' })
    for (const detail of [
      'OPAL-TEST-1',
      'Total paid: $465.00 AUD (shipping $15.00)',
      '1 × Black Opal Ring, $450.00',
      'Jo Buyer',
      '+61400000000',
      '1 Opal St',
      'Lightning Ridge NSW 2834',
      'https://goodopalco.com/admin/collections/orders/7',
    ]) {
      expect(message.text).toContain(detail)
    }
    expect(message.text).not.toContain('INVENTORY REVIEW')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        id: 7,
        data: expect.objectContaining({ inventoryAlertSentAt: expect.any(String) }),
      })
    )
  })

  it('folds the inventory review warning into the owner email for a pending order', async () => {
    find.mockResolvedValue({
      docs: [{ ...paidOrder, status: 'pending', confirmationEmailSentAt: '2026-11-21' }],
    })

    await webhook()

    expect(ownerEmails()).toHaveLength(1)
    const [message] = ownerEmails()[0] ?? []
    expect(message.subject).toBe('Inventory review required - OPAL-TEST-1')
    expect(message.text).toContain('INVENTORY REVIEW REQUIRED')
  })

  it('does not email the owner again when Stripe retries a notified order', async () => {
    find.mockResolvedValue({
      docs: [
        {
          ...paidOrder,
          confirmationEmailSentAt: '2026-11-21',
          inventoryAlertSentAt: '2026-11-21',
        },
      ],
    })

    expect((await webhook()).status).toBe(200)

    expect(send).not.toHaveBeenCalled()
  })

  it('records a rejected owner email for retry without resending the customer confirmation', async () => {
    find.mockResolvedValue({ docs: [{ ...paidOrder, confirmationEmailSentAt: '2026-11-21' }] })
    send.mockResolvedValue({ data: null, error: { message: 'rate limited' } })
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect((await webhook()).status).toBe(500)

    expect(send).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, data: { inventoryAlertError: 'rate limited' } })
    )
    errorLog.mockRestore()
  })
})
