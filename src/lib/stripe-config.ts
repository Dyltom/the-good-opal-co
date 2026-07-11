const STRIPE_SECRET_KEY_PATTERN = /^(?:sk|rk)_(?:test|live)_[A-Za-z0-9_]{16,}$/
const STRIPE_WEBHOOK_SECRET_PATTERN = /^whsec_[A-Za-z0-9_]{16,}$/
const PLACEHOLDER_PATTERN = /x{8,}|placeholder|pending|change[-_]?me/i

export function getConfiguredStripeSecretKey(
  value: string | undefined = process.env['STRIPE_SECRET_KEY']
): string | null {
  const key = value?.trim()
  if (!key || !STRIPE_SECRET_KEY_PATTERN.test(key) || PLACEHOLDER_PATTERN.test(key)) {
    return null
  }

  return key
}

export function getConfiguredStripeWebhookSecret(
  value: string | undefined = process.env['STRIPE_WEBHOOK_SECRET']
): string | null {
  const secret = value?.trim()
  if (!secret || !STRIPE_WEBHOOK_SECRET_PATTERN.test(secret) || PLACEHOLDER_PATTERN.test(secret)) {
    return null
  }

  return secret
}
