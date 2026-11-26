import { beforeEach, describe, expect, test, vi } from 'vitest'

const {
  getCart,
  checkoutHoldToken,
  setCheckoutHold,
  releaseInventoryReservation,
  getConfiguredStripeSecretKey,
  getRequestIdentifier,
  checkRateLimit,
  createStripeSession,
  retrieveStripeSession,
  expireStripeSession,
  findReservationByToken,
  reserveCheckoutInventory,
  InventoryUnavailableError,
  recordServerError,
  holdGiftVoucher,
  releaseGiftVoucherHold,
  createCoupon,
} = vi.hoisted(() => {
  class TestInventoryUnavailableError extends Error {}
  return {
    getCart: vi.fn(),
    checkoutHoldToken: vi.fn(),
    setCheckoutHold: vi.fn(),
    releaseInventoryReservation: vi.fn(),
    getConfiguredStripeSecretKey: vi.fn(),
    getRequestIdentifier: vi.fn(),
    checkRateLimit: vi.fn(),
    createStripeSession: vi.fn(),
    retrieveStripeSession: vi.fn(),
    expireStripeSession: vi.fn(),
    findReservationByToken: vi.fn(),
    reserveCheckoutInventory: vi.fn(),
    InventoryUnavailableError: TestInventoryUnavailableError,
    recordServerError: vi.fn(),
    holdGiftVoucher: vi.fn(),
    releaseGiftVoucherHold: vi.fn(),
    createCoupon: vi.fn(),
  }
})

vi.mock('@/lib/cart', () => ({ getCart, checkoutHoldToken, setCheckoutHold }))
vi.mock('@/lib/constants', () => ({ APP_URL: 'https://shop.example' }))
vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey }))
vi.mock('@/lib/rate-limit', () => ({ getRequestIdentifier, checkRateLimit }))
vi.mock('@/lib/insights/record', () => ({ recordServerError }))
vi.mock('@/lib/inventory-reservations', () => ({
  checkoutReservationExpiresAt: () => new Date('2026-07-12T00:31:00.000Z'),
  findReservationByToken,
  INVENTORY_RESERVATION_METADATA_KEY: 'inventoryReservationToken',
  InventoryUnavailableError,
  releaseInventoryReservation,
  reserveCheckoutInventory,
}))
vi.mock('@/lib/gift-vouchers', () => ({
  GIFT_VOUCHER_METADATA_KEY: 'giftVoucherCode',
  holdGiftVoucher,
  lookupGiftVoucher: vi.fn(),
  releaseGiftVoucherHold,
}))
vi.mock('stripe', () => ({
  default: class StripeMock {
    coupons = { create: createCoupon }
    checkout = {
      sessions: {
        create: createStripeSession,
        retrieve: retrieveStripeSession,
        expire: expireStripeSession,
      },
    }
  },
}))

import { createCheckoutSession } from '../actions'

function checkoutForm() {
  return { country: 'AU' as const, checkoutAttemptId: 'd42cead1-0366-4f5f-a173-5f4c334c9513' }
}

describe('checkout Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCart.mockResolvedValue({
      items: [
        {
          productId: '1',
          slug: 'opal-ring',
          name: 'Opal ring',
          price: 150,
          quantity: 1,
        },
      ],
      total: 150,
      itemCount: 1,
    })
    getConfiguredStripeSecretKey.mockReturnValue('sk_test_valid_for_mock')
    getRequestIdentifier.mockResolvedValue('buyer')
    checkRateLimit.mockResolvedValue(true)
    findReservationByToken.mockResolvedValue(null)
    createStripeSession.mockResolvedValue({
      id: 'cs_test_reserved',
      status: 'open',
      url: 'https://checkout.stripe.test/session',
    })
    reserveCheckoutInventory.mockResolvedValue({ id: 1 })
    expireStripeSession.mockResolvedValue({ id: 'cs_test_reserved', status: 'expired' })
    releaseGiftVoucherHold.mockResolvedValue(true)
    createCoupon.mockResolvedValue({ id: 'coupon_voucher' })
  })

  test('takes the held gift voucher amount off the Stripe session as a one-off coupon', async () => {
    holdGiftVoucher.mockResolvedValue({ ok: true, code: 'GOOD-AB2C-DE3F', amountCents: 4000 })

    await expect(
      createCheckoutSession({ ...checkoutForm(), giftVoucherCode: 'good-ab2c-de3f' })
    ).resolves.toMatchObject({ success: true })

    expect(createCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ amount_off: 4000, currency: 'aud', duration: 'once', max_redemptions: 1 }),
      { idempotencyKey: 'gift-voucher-coupon/d42cead1-0366-4f5f-a173-5f4c334c9513/4000' }
    )
    expect(createStripeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        discounts: [{ coupon: 'coupon_voucher' }],
        metadata: expect.objectContaining({ giftVoucherCode: 'GOOD-AB2C-DE3F' }),
      }),
      expect.anything()
    )
  })

  test('gives the gift voucher hold back when Stripe fails to start checkout', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    holdGiftVoucher.mockResolvedValue({ ok: true, code: 'GOOD-AB2C-DE3F', amountCents: 4000 })
    createStripeSession.mockRejectedValue(new Error('Stripe down'))

    await expect(
      createCheckoutSession({ ...checkoutForm(), giftVoucherCode: 'GOOD-AB2C-DE3F' })
    ).resolves.toMatchObject({ success: false })

    expect(releaseGiftVoucherHold).toHaveBeenCalledWith('d42cead1-0366-4f5f-a173-5f4c334c9513')
    errorLog.mockRestore()
  })

  test('prefills the email but records no marketing consent when the box is unticked', async () => {
    await createCheckoutSession({ ...checkoutForm(), email: 'Shopper@Example.com', marketingConsent: false, js: '1' })

    const [params] = createStripeSession.mock.calls[0] ?? []
    expect(params.customer_email).toBe('shopper@example.com')
    expect(params.metadata).not.toHaveProperty('marketing_consent')
  })

  test('records marketing consent and when it was given when the box is ticked', async () => {
    await createCheckoutSession({ ...checkoutForm(), email: 'shopper@example.com', marketingConsent: true, js: '1' })

    const [params] = createStripeSession.mock.calls[0] ?? []
    expect(params.metadata).toMatchObject({
      marketing_consent: 'yes',
      marketing_consent_at: expect.any(String),
    })
  })

  test('ignores consent from a scripted post that never hydrated the page', async () => {
    await createCheckoutSession({ ...checkoutForm(), email: 'shopper@example.com', marketingConsent: true })

    const [params] = createStripeSession.mock.calls[0] ?? []
    expect(params.metadata).not.toHaveProperty('marketing_consent')
  })

  test('refuses to send a loose opal to Singapore before opening Stripe', async () => {
    getCart.mockResolvedValue({
      items: [{ productId: '2', slug: 'rough', name: 'Rough opal', price: 80, quantity: 1, looseStone: true }],
      total: 80,
      itemCount: 1,
    })

    const result = await createCheckoutSession({ ...checkoutForm(), country: 'SG' })

    expect(result).toMatchObject({ success: false, error: expect.stringContaining('Singapore') })
    expect(createStripeSession).not.toHaveBeenCalled()
  })

  test('returns a typed configuration error without constructing Stripe', async () => {
    getConfiguredStripeSecretKey.mockReturnValue(undefined)

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: false,
      error: 'Payment processing is not configured. Please contact support.',
    })
    expect(checkRateLimit).not.toHaveBeenCalled()
  })

  test('contains rate-limit infrastructure failures as a stable customer error', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    getConfiguredStripeSecretKey.mockReturnValue('sk_test_valid_for_mock')
    getRequestIdentifier.mockResolvedValue('buyer')
    checkRateLimit.mockRejectedValue(new Error('Redis unavailable'))

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: false,
      error: 'Payment could not be started. Please try again or contact support.',
    })
    expect(errorLog).toHaveBeenCalledOnce()
    expect(recordServerError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'checkout', path: '/checkout' })
    )
    errorLog.mockRestore()
  })

  test('creates an idempotent expiring Stripe session before reserving exact stock', async () => {
    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: true,
      url: 'https://checkout.stripe.test/session',
    })

    expect(createStripeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: 'd42cead1-0366-4f5f-a173-5f4c334c9513',
        expires_at: 1783816260,
        metadata: expect.objectContaining({
          inventoryReservationToken: 'd42cead1-0366-4f5f-a173-5f4c334c9513',
        }),
      }),
      { idempotencyKey: 'checkout/d42cead1-0366-4f5f-a173-5f4c334c9513' }
    )
    expect(reserveCheckoutInventory).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: 'cs_test_reserved',
        items: [
          expect.objectContaining({
            productId: '1',
            unitAmountCents: 15000,
            quantity: 1,
          }),
        ],
      })
    )
  })

  test('shows each piece and the shop brand on the Stripe payment page', async () => {
    getCart.mockResolvedValue({
      items: [
        {
          productId: '1',
          slug: 'opal-ring',
          name: 'Opal ring',
          price: 150,
          quantity: 1,
          image: '/api/media/file/opal-ring.jpg',
        },
      ],
      total: 150,
      itemCount: 1,
    })

    await createCheckoutSession(checkoutForm())

    const params = createStripeSession.mock.calls[0]?.[0]
    expect(params.line_items[0].price_data.product_data.images).toEqual([
      'https://shop.example/api/media/file/opal-ring.jpg',
    ])
    expect(params.branding_settings).toMatchObject({
      display_name: 'The Good Opal Co',
      icon: { type: 'url', url: 'https://shop.example/logo.png' },
    })
  })

  test('ships only to the chosen country and lets the buyer pick its Australia Post services', async () => {
    await createCheckoutSession({ ...checkoutForm(), country: 'NZ' })

    const params = createStripeSession.mock.calls[0]?.[0]
    expect(params.shipping_address_collection.allowed_countries).toEqual(['NZ'])
    expect(
      params.shipping_options.map(
        (option: { shipping_rate_data: { display_name: string; fixed_amount: { amount: number } } }) => [
          option.shipping_rate_data.display_name,
          option.shipping_rate_data.fixed_amount.amount,
        ]
      )
    ).toEqual([
      ['International Standard', 1790],
      ['International Express', 3490],
    ])
  })

  test('sends Stripe only insured, signed-for options for an Australian order over $100', async () => {
    getCart.mockResolvedValue({
      items: [{ productId: '1', slug: 'opal-ring', name: 'Opal ring', price: 500, quantity: 1 }],
      total: 500,
      itemCount: 1,
    })

    await createCheckoutSession(checkoutForm())

    const params = createStripeSession.mock.calls[0]?.[0]
    expect(params.shipping_address_collection.allowed_countries).toEqual(['AU'])
    expect(params.shipping_options).toEqual([
      expect.objectContaining({
        shipping_rate_data: expect.objectContaining({
          display_name: 'Parcel Post with Extra Cover for $500 and signature',
          fixed_amount: { amount: 2315, currency: 'aud' },
        }),
      }),
      expect.objectContaining({
        shipping_rate_data: expect.objectContaining({
          display_name: 'Express Post with Extra Cover for $500 and signature',
          fixed_amount: { amount: 2615, currency: 'aud' },
        }),
      }),
    ])
  })

  test('expires an unreachable Stripe session when stock cannot be reserved', async () => {
    reserveCheckoutInventory.mockRejectedValue(new InventoryUnavailableError())
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: false,
      error: 'One or more pieces were just reserved by another customer. Please review your bag.',
    })
    expect(expireStripeSession).toHaveBeenCalledWith('cs_test_reserved')
    errorLog.mockRestore()
  })

  test('reuses an active attempt without decrementing stock twice', async () => {
    findReservationByToken.mockResolvedValue({
      status: 'active',
      stripeSessionId: 'cs_test_existing',
    })
    retrieveStripeSession.mockResolvedValue({
      id: 'cs_test_existing',
      status: 'open',
      url: 'https://checkout.stripe.test/existing',
    })

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: true,
      url: 'https://checkout.stripe.test/existing',
    })
    expect(createStripeSession).not.toHaveBeenCalled()
    expect(reserveCheckoutInventory).not.toHaveBeenCalled()
    expect(getCart).not.toHaveBeenCalled()
  })

  test('a buyer back from Stripe can check out again: their earlier hold is released first', async () => {
    const order: string[] = []
    checkoutHoldToken.mockResolvedValue('earlier-attempt')
    findReservationByToken.mockImplementation(async (token: string) =>
      token === 'earlier-attempt' ? { status: 'active', stripeSessionId: 'cs_test_earlier' } : null
    )
    retrieveStripeSession.mockResolvedValue({ id: 'cs_test_earlier', status: 'open' })
    expireStripeSession.mockResolvedValue({ id: 'cs_test_earlier', status: 'expired' })
    releaseInventoryReservation.mockImplementation(async () => {
      order.push('release')
    })
    reserveCheckoutInventory.mockImplementation(async () => {
      order.push('reserve')
      return { id: 2 }
    })

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: true,
      url: 'https://checkout.stripe.test/session',
    })
    expect(expireStripeSession).toHaveBeenCalledWith('cs_test_earlier')
    expect(releaseInventoryReservation).toHaveBeenCalledWith('earlier-attempt', 'checkout-replaced')
    expect(order).toEqual(['release', 'reserve'])
    expect(setCheckoutHold).toHaveBeenCalledWith(
      'd42cead1-0366-4f5f-a173-5f4c334c9513',
      new Date('2026-07-12T00:31:00.000Z')
    )
  })

  test('never releases a hold whose payment already completed', async () => {
    checkoutHoldToken.mockResolvedValue('paid-attempt')
    findReservationByToken.mockImplementation(async (token: string) =>
      token === 'paid-attempt' ? { status: 'active', stripeSessionId: 'cs_test_paid' } : null
    )
    retrieveStripeSession.mockResolvedValue({ id: 'cs_test_paid', status: 'complete' })

    await createCheckoutSession(checkoutForm())

    expect(expireStripeSession).not.toHaveBeenCalled()
    expect(releaseInventoryReservation).not.toHaveBeenCalled()
  })

  test('lets shoppers enter a welcome code only outside a sale and never on a deposit', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    try {
      vi.setSystemTime(new Date('2026-12-05T00:00:00.000Z'))
      await createCheckoutSession(checkoutForm())
      expect(createStripeSession.mock.calls.at(-1)?.[0]).toMatchObject({ allow_promotion_codes: true })

      vi.setSystemTime(new Date('2026-11-28T00:00:00.000Z'))
      await createCheckoutSession(checkoutForm())
      expect(createStripeSession.mock.calls.at(-1)?.[0]).toMatchObject({ allow_promotion_codes: false })

      vi.setSystemTime(new Date('2026-12-05T00:00:00.000Z'))
      getCart.mockResolvedValue({
        items: [{ productId: '9', slug: 'deposit', name: 'Custom deposit', price: 50, quantity: 1, deposit: true }],
        total: 50,
        itemCount: 1,
      })
      await createCheckoutSession(checkoutForm())
      expect(createStripeSession.mock.calls.at(-1)?.[0]).toMatchObject({ allow_promotion_codes: false })
    } finally {
      vi.useRealTimers()
    }
  })
})
