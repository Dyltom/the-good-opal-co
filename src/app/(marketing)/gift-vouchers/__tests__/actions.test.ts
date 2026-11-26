import { beforeEach, describe, expect, test, vi } from 'vitest'

const { createStripeSession } = vi.hoisted(() => ({ createStripeSession: vi.fn() }))

vi.mock('@/lib/constants', () => ({ APP_URL: 'https://shop.example' }))
vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey: () => 'sk_test_x' }))
vi.mock('@/lib/rate-limit', () => ({
  getRequestIdentifier: async () => 'ip',
  checkRateLimit: async () => true,
}))
vi.mock('@/lib/insights/record', () => ({ recordServerError: vi.fn() }))
vi.mock('@/lib/insights/visitor', () => ({ requestVisitorKey: async () => null }))
vi.mock('@/lib/gift-vouchers', () => ({
  GIFT_VOUCHER_PURCHASE_METADATA_KEY: 'giftVoucherPurchase',
}))
vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = { sessions: { create: createStripeSession } }
  },
}))

import { createGiftVoucherCheckout } from '../actions'

describe('gift voucher purchase', () => {
  beforeEach(() => {
    createStripeSession.mockReset()
    createStripeSession.mockResolvedValue({ url: 'https://checkout.stripe.test/s' })
  })

  test('charges exactly the face value of the voucher, once, with no discounts', async () => {
    const result = await createGiftVoucherCheckout({
      amount: 150,
      sendToSelf: true,
      recipientName: '',
      recipientEmail: '',
      senderName: 'Sam',
      message: '',
    })

    expect(result).toEqual({ success: true, url: 'https://checkout.stripe.test/s' })
    const params = createStripeSession.mock.calls[0]?.[0]
    expect(params.line_items).toEqual([
      expect.objectContaining({
        quantity: 1,
        price_data: expect.objectContaining({ currency: 'aud', unit_amount: 15000 }),
      }),
    ])
    expect(params.discounts).toBeUndefined()
    expect(params.allow_promotion_codes).toBeUndefined()
    expect(params.metadata).toMatchObject({ giftVoucherPurchase: 'true', amount: '150' })
  })

  test('rejects a bot that fills the hidden website field without starting a payment', async () => {
    const result = await createGiftVoucherCheckout({
      amount: 150,
      sendToSelf: true,
      recipientName: '',
      recipientEmail: '',
      senderName: 'Sam',
      message: '',
      website: 'http://spam.example',
    })

    expect(result.success).toBe(false)
    expect(createStripeSession).not.toHaveBeenCalled()
  })

  test('refuses an amount outside the allowed range without starting a payment', async () => {
    const result = await createGiftVoucherCheckout({
      amount: 1,
      sendToSelf: true,
      recipientName: '',
      recipientEmail: '',
      senderName: 'Sam',
      message: '',
    })

    expect(result.success).toBe(false)
    expect(createStripeSession).not.toHaveBeenCalled()
  })
})
