import { describe, expect, it, vi } from 'vitest'
import { scrubErrorMessage } from '@/lib/scrub-error'

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

describe('recordServerError', () => {
  async function stored(error: unknown) {
    const create = vi.fn()
    const { getPayload } = await import('@/lib/payload')
    vi.mocked(getPayload).mockResolvedValue({ create } as never)
    const { recordServerError } = await import('../record')
    await recordServerError({ kind: 'admin', path: '/admin', error, reference: 'cs_test_1' })
    return create.mock.calls[0]?.[0]?.data?.detail as Record<string, string> | undefined
  }

  it('stores the database cause of a failed query, scrubbed, with where it was thrown', async () => {
    const failure = new Error('Failed query: select "id" from "media" where "email" = $1', {
      cause: new Error('column "alt_text" does not exist for jane@example.com'),
    })

    const detail = await stored(failure)

    expect(detail?.message).toMatch(/^column "alt_text" does not exist for \[email\] \| Failed query/)
    expect(detail?.stack).toMatch(/^at /)
    expect(detail?.reference).toBe('cs_test_1')
  })

  it('ignores visitors who closed the page mid-response and scanners posting fake server actions', async () => {
    const reset = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })

    expect(await stored(new Error('aborted'))).toBeUndefined()
    expect(await stored(new Error('failed to pipe response'))).toBeUndefined()
    expect(await stored(reset)).toBeUndefined()
    expect(
      await stored(new Error('Failed to find Server Action. This request might be from an older or newer deployment.'))
    ).toBeUndefined()
  })
})
