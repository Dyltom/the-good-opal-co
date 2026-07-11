import { beforeEach, describe, expect, test, vi } from 'vitest'

const { getCart, getConfiguredStripeSecretKey, getRequestIdentifier, checkRateLimit } = vi.hoisted(
  () => ({
    getCart: vi.fn(),
    getConfiguredStripeSecretKey: vi.fn(),
    getRequestIdentifier: vi.fn(),
    checkRateLimit: vi.fn(),
  })
)

vi.mock('@/lib/cart', () => ({ getCart }))
vi.mock('@/lib/stripe-config', () => ({ getConfiguredStripeSecretKey }))
vi.mock('@/lib/rate-limit', () => ({ getRequestIdentifier, checkRateLimit }))

import { createCheckoutSession } from '../actions'

function checkoutForm(): FormData {
  const formData = new FormData()
  formData.set('email', 'buyer@example.com')
  formData.set('name', 'Buyer Name')
  formData.set('country', 'AU')
  return formData
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
    errorLog.mockRestore()
  })
})
