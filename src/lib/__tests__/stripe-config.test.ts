import { describe, expect, it } from 'vitest'
import {
  getConfiguredStripeSecretKey,
  getConfiguredStripeWebhookSecret,
} from '@/lib/stripe-config'

describe('getConfiguredStripeSecretKey', () => {
  it('accepts plausible Stripe secret and restricted keys', () => {
    expect(getConfiguredStripeSecretKey('sk_live_1234567890abcdefgh')).toBe(
      'sk_live_1234567890abcdefgh'
    )
    expect(getConfiguredStripeSecretKey('rk_test_1234567890abcdefgh')).toBe(
      'rk_test_1234567890abcdefgh'
    )
  })

  it.each([undefined, '', 'sk_test_xxxxxxxxxxxx', 'whsec_not_a_secret_key', 'placeholder'])(
    'rejects absent or invalid configuration: %s',
    (value) => {
      expect(getConfiguredStripeSecretKey(value)).toBeNull()
    }
  )

  it('validates webhook secrets with the same placeholder rules', () => {
    expect(getConfiguredStripeWebhookSecret('whsec_1234567890abcdefgh')).toBe(
      'whsec_1234567890abcdefgh'
    )
    expect(getConfiguredStripeWebhookSecret('whsec_placeholder_1234567890')).toBeNull()
    expect(getConfiguredStripeWebhookSecret('whsec_xxxxxxxxxxxxxxxxxxxx')).toBeNull()
  })
})
