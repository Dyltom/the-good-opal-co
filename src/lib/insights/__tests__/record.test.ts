import { describe, expect, it, vi } from 'vitest'
import { scrubErrorMessage } from '../record'

vi.mock('@/lib/payload', () => ({ getPayload: vi.fn() }))

describe('scrubErrorMessage', () => {
  it('removes emails, links, keys and tokens before an error is stored', () => {
    const message = scrubErrorMessage(
      new Error(
        'Stripe failed for jane.doe+opal@example.com at https://api.stripe.com/v1/checkout?x=1 with sk_live_abc123 and whsec_9z, token eyJhbGciOiJIUzI1NiJ9abcdefgh123'
      )
    )

    expect(message).toBe('Stripe failed for [email] at [url] with [key] and [key], token [token]')
  })

  it('keeps ordinary messages readable and bounded', () => {
    expect(scrubErrorMessage(new Error('Cannot read properties of undefined (reading "price")'))).toBe(
      'Cannot read properties of undefined (reading "price")'
    )
    expect(scrubErrorMessage('x '.repeat(400))).toHaveLength(300)
    expect(scrubErrorMessage({})).toBe('Unknown error')
    expect(scrubErrorMessage(new Error('   '))).toBe('No message')
  })
})
