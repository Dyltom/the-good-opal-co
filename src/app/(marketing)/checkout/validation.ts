export const CHECKOUT_NAME_MAX_LENGTH = 100
export const CHECKOUT_COUNTRIES = ['AU', 'NZ', 'US', 'GB', 'CA', 'SG', 'HK', 'JP'] as const
export type CheckoutCountry = (typeof CHECKOUT_COUNTRIES)[number]

export function validateCheckoutName(value: string): string | undefined {
  const name = value.trim()

  if (!name) return 'Enter the name for this order'
  if (name.length > CHECKOUT_NAME_MAX_LENGTH) {
    return `Name must be ${CHECKOUT_NAME_MAX_LENGTH} characters or fewer`
  }

  return undefined
}

export function validateCheckoutEmail(value: string): string | undefined {
  const email = value.trim()

  if (!email) return 'Enter your email address'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    return 'Enter an email address in the format name@example.com'
  }

  return undefined
}
