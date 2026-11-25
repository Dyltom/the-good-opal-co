import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const m = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  listLineItems: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  send: vi.fn(),
  releaseInventoryReservation: vi.fn(),
  sendCartReminder: vi.fn(),
  joinListFromCheckout: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class StripeMock {
    webhooks = { constructEvent: m.constructEvent }
    checkout = { sessions: { listLineItems: m.listLineItems } }
  },
}))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: m.send }
  },
}))
vi.mock('@/lib/stripe-config', () => ({
  getConfiguredStripeSecretKey: () => 'sk_test_valid_for_mock',
  getConfiguredStripeWebhookSecret: () => 'whsec_valid_for_mock',
}))
vi.mock('@/lib/payload', () => ({
  getPayload: async () => ({
    find: m.find,
    create: m.create,
    update: m.update,
    db: {
      beginTransaction: async () => 'tx',
      commitTransaction: async () => undefined,
      rollbackTransaction: async () => undefined,
    },
  }),
}))
vi.mock('@/lib/inventory-reservations', () => ({
  markReservationPaymentPending: vi.fn(),
  releaseInventoryReservation: m.releaseInventoryReservation,
  reservationMatchesCheckoutItems: () => true,
  reservationTokenFromSession: () => 'token',
}))
vi.mock('@/lib/gift-vouchers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/gift-vouchers')>()),
  captureGiftVoucherHold: async () => null,
  keepGiftVoucherHoldUntilPaid: vi.fn(),
  releaseGiftVoucherHold: vi.fn(),
}))
vi.mock('@/lib/insights/record', () => ({
  recordCheckoutInsight: vi.fn(),
  recordServerError: vi.fn(),
}))
vi.mock('@/lib/cart-reminder', () => ({ sendCartReminder: m.sendCartReminder }))
vi.mock('@/app/(marketing)/checkout/success/actions', () => ({
  joinListFromCheckout: m.joinListFromCheckout,
}))

import { POST } from '../route'

const consent = { inventoryReservationToken: 'token', marketing_consent: 'yes' }

function webhook(type: string, session: Record<string, unknown>) {
  m.constructEvent.mockReturnValue({ type, created: 1_784_000_000, data: { object: session } })
  return POST(
    new NextRequest('https://goodopalco.com/api/webhooks/stripe', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'signed' },
    })
  )
}

describe('Stripe webhook marketing consent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.listLineItems.mockResolvedValue({
      data: [
        {
          id: 'li_1',
          quantity: 1,
          description: 'Opal ring',
          amount_total: 45000,
          price: {
            unit_amount: 45000,
            product: { name: 'Opal ring', images: [], metadata: { productId: '11', slug: 'ring' } },
          },
        },
      ],
    })
    m.find.mockResolvedValue({ docs: [] })
    m.create.mockImplementation(async ({ data }) => ({ id: 7, ...data }))
    m.update.mockResolvedValue({})
    m.send.mockResolvedValue({ data: { id: 'email' }, error: null })
  })

  it('sends a bag reminder after releasing the reservation when the shopper consented', async () => {
    m.sendCartReminder.mockResolvedValue('sent')
    const session = { id: 'cs_gone', customer_email: 'shopper@example.com', metadata: consent }

    expect((await webhook('checkout.session.expired', session)).status).toBe(200)

    expect(m.releaseInventoryReservation).toHaveBeenCalledWith(session, 'checkout-expired')
    expect(m.sendCartReminder).toHaveBeenCalledWith(session, [
      expect.objectContaining({ productId: '11', slug: 'ring', name: 'Opal ring', price: 450 }),
    ])
  })

  it('sends no reminder without consent', async () => {
    await webhook('checkout.session.expired', {
      id: 'cs_gone',
      customer_email: 'shopper@example.com',
      metadata: { inventoryReservationToken: 'token' },
    })

    expect(m.sendCartReminder).not.toHaveBeenCalled()
  })

  it('still releases the reservation when the reminder fails', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    m.sendCartReminder.mockRejectedValue(new Error('Resend down'))

    const response = await webhook('checkout.session.expired', {
      id: 'cs_gone',
      customer_email: 'shopper@example.com',
      metadata: consent,
    })

    expect(response.status).toBe(200)
    expect(m.releaseInventoryReservation).toHaveBeenCalled()
    errorLog.mockRestore()
  })

  it('adds a consenting buyer to the newsletter once their order is recorded', async () => {
    const logs = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const response = await webhook('checkout.session.completed', {
      id: 'cs_paid',
      mode: 'payment',
      payment_status: 'paid',
      created: 1_784_000_000,
      amount_total: 46020,
      currency: 'aud',
      customer_email: 'buyer@example.com',
      customer_details: { email: 'buyer@example.com', name: 'Jo Buyer' },
      collected_information: {
        shipping_details: {
          name: 'Jo Buyer',
          address: {
            line1: '1 Opal St',
            city: 'Cowra',
            state: 'NSW',
            postal_code: '2794',
            country: 'AU',
          },
        },
      },
      metadata: consent,
    })

    expect(response.status).toBe(200)
    expect(m.joinListFromCheckout).toHaveBeenCalledWith('cs_paid')
    logs.mockRestore()
  })

  it('does not add a buyer who did not tick the box', async () => {
    const logs = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    await webhook('checkout.session.completed', {
      id: 'cs_paid',
      mode: 'payment',
      payment_status: 'paid',
      created: 1_784_000_000,
      customer_details: { email: 'buyer@example.com', name: 'Jo Buyer' },
      collected_information: {
        shipping_details: {
          name: 'Jo Buyer',
          address: {
            line1: '1 Opal St',
            city: 'Cowra',
            state: 'NSW',
            postal_code: '2794',
            country: 'AU',
          },
        },
      },
      metadata: { inventoryReservationToken: 'token' },
    })

    expect(m.joinListFromCheckout).not.toHaveBeenCalled()
    logs.mockRestore()
  })
})
