import { beforeEach, describe, expect, test, vi } from 'vitest'

const {
  getCart,
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
} = vi.hoisted(() => {
  class TestInventoryUnavailableError extends Error {}
  return {
    getCart: vi.fn(),
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
  }
})

vi.mock('@/lib/cart', () => ({ getCart }))
vi.mock('@/lib/constants', () => ({ APP_URL: 'https://shop.example' }))
vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey }))
vi.mock('@/lib/rate-limit', () => ({ getRequestIdentifier, checkRateLimit }))
vi.mock('@/lib/insights/record', () => ({ recordServerError }))
vi.mock('@/lib/inventory-reservations', () => ({
  checkoutReservationExpiresAt: () => new Date('2026-07-12T00:31:00.000Z'),
  findReservationByToken,
  INVENTORY_RESERVATION_METADATA_KEY: 'inventoryReservationToken',
  InventoryUnavailableError,
  reserveCheckoutInventory,
}))
vi.mock('stripe', () => ({
  default: class StripeMock {
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
  return { region: 'AU' as const, checkoutAttemptId: 'd42cead1-0366-4f5f-a173-5f4c334c9513' }
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
    expect(createStripeSession.mock.calls[0]?.[0]).not.toHaveProperty(
      'shipping_options.0.shipping_rate_data.delivery_estimate'
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

  test('lets overseas buyers enter any supported non-Australian address', async () => {
    await createCheckoutSession({ ...checkoutForm(), region: 'INTL' })

    const params = createStripeSession.mock.calls[0]?.[0]
    expect(params.shipping_address_collection.allowed_countries).not.toContain('AU')
    expect(params.shipping_address_collection.allowed_countries).toContain('NZ')
  })

  test('expires an unreachable Stripe session when stock cannot be reserved', async () => {
    reserveCheckoutInventory.mockRejectedValue(new InventoryUnavailableError())
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(createCheckoutSession(checkoutForm())).resolves.toEqual({
      success: false,
      error: 'One or more pieces were just reserved by another customer. Please review your cart.',
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
})
