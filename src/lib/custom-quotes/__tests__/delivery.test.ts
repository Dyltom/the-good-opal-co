import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send }
  },
}))

import type { Payload } from 'payload'
import { deliverCustomQuote } from '../delivery'

describe('custom quote delivery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('QUOTE_LINK_SECRET', '0123456789abcdef0123456789abcdef')
    vi.stubEnv('EMAIL_FROM', 'The Good Opal Co <quotes@goodopalco.com>')
    vi.stubEnv('CONTACT_EMAIL', 'hello@goodopalco.com')
    send.mockResolvedValue({ data: { id: 'email_123' }, error: null })
  })

  it('sends an idempotent PII-free fragment link and returns provider evidence', async () => {
    const payload = {
      findByID: vi.fn().mockResolvedValue({ id: 8, name: 'Mia' }),
    } as unknown as Payload
    const result = await deliverCustomQuote(
      {
        id: 42,
        enquiry: 8,
        customerEmail: 'buyer@example.com',
        quoteNumber: 'QUOTE-ABC-R1',
        revision: 1,
        amountCents: 100_000,
        depositAmountCents: 25_000,
        currency: 'AUD',
        validUntil: new Date(Date.now() + 60_000).toISOString(),
        terms: 'Exact terms.',
        linkVersion: 2,
      },
      payload
    )

    expect(result).toMatchObject({ providerId: 'email_123' })
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'buyer@example.com',
      }),
      { idempotencyKey: 'custom-quote/42/r1/v2' }
    )
    const html = renderToStaticMarkup(send.mock.calls[0]?.[0].react as ReactElement)
    expect(html).toContain('/quote/access#v1.')
    expect(html).not.toContain('buyer@example.com')
  })

  it('fails closed when Resend does not return durable provider evidence', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'suppressed' } })
    const payload = {
      findByID: vi.fn().mockResolvedValue({ id: 8, name: 'Mia' }),
    } as unknown as Payload
    await expect(
      deliverCustomQuote(
        {
          id: 42,
          enquiry: 8,
          customerEmail: 'buyer@example.com',
          quoteNumber: 'QUOTE-ABC-R1',
          revision: 1,
          amountCents: 100_000,
          depositAmountCents: 25_000,
          currency: 'AUD',
          validUntil: new Date(Date.now() + 60_000).toISOString(),
          terms: 'Exact terms.',
        },
        payload
      )
    ).rejects.toThrow('Quote email delivery failed')
  })
})
