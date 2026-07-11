import { describe, expect, test } from 'vitest'
import { validateCheckoutEmail, validateCheckoutName } from '@/app/(marketing)/checkout/validation'

describe('checkout validation', () => {
  test.each(['王', 'محمد علي', 'Chloë Dubois', 'O’Connor', '김민준', 'Jean-Luc Picard'])(
    'accepts the international name %s',
    (name) => {
      expect(validateCheckoutName(name)).toBeUndefined()
    }
  )

  test('requires a name without restricting its alphabet', () => {
    expect(validateCheckoutName('   ')).toBe('Enter the name for this order')
    expect(validateCheckoutName('a'.repeat(101))).toBe('Name must be 100 characters or fewer')
  })

  test('gives actionable email feedback', () => {
    expect(validateCheckoutEmail('')).toBe('Enter your email address')
    expect(validateCheckoutEmail('not-an-email')).toBe(
      'Enter an email address in the format name@example.com'
    )
    expect(validateCheckoutEmail('buyer@example.com')).toBeUndefined()
  })
})
