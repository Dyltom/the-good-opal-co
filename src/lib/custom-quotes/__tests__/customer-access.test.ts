import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findByID } = vi.hoisted(() => ({ findByID: vi.fn() }))
vi.mock('@/lib/payload', () => ({ getPayload: async () => ({ findByID }) }))

import type { CustomQuote } from '@/types/payload-types'
import { quoteTermsHash } from '@/lib/custom-quote-evidence'
import { getCustomerQuoteAccess } from '../customer-access'
import { createQuoteLinkToken } from '../quote-link-token'

const SECRET = '0123456789abcdef0123456789abcdef'
const quote = {
  id: 42,
  quoteNumber: 'QUOTE-ABC-R1',
  quoteSeriesId: 'abc',
  revision: 1,
  enquiry: 8,
  customerEmail: 'buyer@example.com',
  status: 'sent',
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: new Date(Date.now() + 60_000).toISOString(),
  terms: 'Exact terms.',
  depositStatus: 'awaiting-payment',
  linkVersion: 2,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
} satisfies CustomQuote

function token() {
  return createQuoteLinkToken({
    expiresAt: Math.floor(Date.now() / 1000) + 30,
    linkVersion: quote.linkVersion ?? 1,
    quoteId: quote.id,
    revision: quote.revision,
    termsHash: quoteTermsHash(quote),
  })
}

describe('customer quote access', () => {
  beforeEach(() => {
    vi.stubEnv('QUOTE_LINK_SECRET', SECRET)
    findByID.mockReset()
    findByID.mockResolvedValue(quote)
  })

  it('returns only the exact live revision bound into the signed token', async () => {
    await expect(getCustomerQuoteAccess(token())).resolves.toMatchObject({
      quote: { id: 42, quoteNumber: 'QUOTE-ABC-R1' },
      claims: { revision: 1, linkVersion: 2 },
    })
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'custom-quotes', id: 42, overrideAccess: true })
    )
  })

  it.each([
    { status: 'draft' },
    { revision: 2 },
    { linkVersion: 3 },
    { terms: 'Changed terms.' },
  ] as Array<Partial<CustomQuote>>)(
    'rejects revoked or mismatched live state %#',
    async (change) => {
      findByID.mockResolvedValue({ ...quote, ...change })
      await expect(getCustomerQuoteAccess(token())).resolves.toBeNull()
    }
  )

  it('does not query Payload for malformed bearer input', async () => {
    await expect(getCustomerQuoteAccess('not-a-token')).resolves.toBeNull()
    expect(findByID).not.toHaveBeenCalled()
  })
})
