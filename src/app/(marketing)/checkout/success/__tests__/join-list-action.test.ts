import { beforeEach, describe, expect, test, vi } from 'vitest'

const { retrieve, subscribe } = vi.hoisted(() => ({ retrieve: vi.fn(), subscribe: vi.fn() }))

vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey: () => 'sk_test_x' }))
vi.mock('@/lib/newsletter/service', () => ({ getNewsletterService: () => ({ subscribe }) }))
vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = { sessions: { retrieve } }
  },
}))

import { joinListFromCheckout } from '../actions'

const paidSession = {
  payment_status: 'paid',
  customer_details: { email: 'buyer@example.com', name: 'Sam Buyer' },
}

describe('checkout newsletter opt-in', () => {
  beforeEach(() => {
    retrieve.mockReset()
    subscribe.mockReset()
  })

  test('subscribes the paid buyer without a confirmation email', async () => {
    retrieve.mockResolvedValue(paidSession)
    subscribe.mockResolvedValue({ success: true, message: 'ok' })

    const result = await joinListFromCheckout('cs_test_abc123')

    expect(result.status).toBe('joined')
    expect(subscribe).toHaveBeenCalledWith('buyer@example.com', {
      name: 'Sam Buyer',
      source: 'checkout',
      skipConfirmation: true,
      tags: ['buyer'],
    })
  })

  test('never subscribes from an unpaid session or a malformed id', async () => {
    retrieve.mockResolvedValue({ ...paidSession, payment_status: 'unpaid' })

    expect((await joinListFromCheckout('cs_test_abc123')).status).toBe('error')
    expect((await joinListFromCheckout('not-a-session')).status).toBe('error')
    expect(subscribe).not.toHaveBeenCalled()
    expect(retrieve).toHaveBeenCalledTimes(1)
  })

  test('treats an existing subscriber as joined', async () => {
    retrieve.mockResolvedValue(paidSession)
    subscribe.mockResolvedValue({ success: false, message: 'You are already subscribed to our newsletter' })

    expect(await joinListFromCheckout('cs_live_abc123')).toEqual({
      status: 'joined',
      message: 'You are already on the list.',
    })
  })
})
