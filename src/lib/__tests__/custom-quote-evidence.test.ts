import { describe, expect, it } from 'vitest'
import {
  hasCompleteAcceptanceEvidence,
  hasCompleteDepositEvidence,
  quoteTermsHash,
  type QuoteEvidenceSnapshot,
} from '../custom-quote-evidence'

const quote: QuoteEvidenceSnapshot = {
  quoteNumber: 'QUOTE-ABC-R1',
  revision: 1,
  amountCents: 120_000,
  depositAmountCents: 30_000,
  currency: 'AUD',
  validUntil: '2026-08-01T00:00:00.000Z',
  terms: 'One sterling silver ring with the selected opal.',
}

describe('custom quote evidence', () => {
  it('binds acceptance to the exact commercial revision', () => {
    const hash = quoteTermsHash(quote)

    expect(
      hasCompleteAcceptanceEvidence({
        acceptedAt: new Date(Date.now() - 1_000).toISOString(),
        acceptedByEmail: 'BUYER@example.com',
        acceptedTermsHash: hash,
        customerEmail: 'buyer@example.com',
        snapshot: quote,
      })
    ).toBe(true)
    expect(quoteTermsHash({ ...quote, amountCents: quote.amountCents + 1 })).not.toBe(hash)
  })

  it('rejects acceptance by another email or against altered terms', () => {
    expect(
      hasCompleteAcceptanceEvidence({
        acceptedAt: '2026-07-12T00:00:00.000Z',
        acceptedByEmail: 'other@example.com',
        acceptedTermsHash: quoteTermsHash(quote),
        customerEmail: 'buyer@example.com',
        snapshot: quote,
      })
    ).toBe(false)
    expect(
      hasCompleteAcceptanceEvidence({
        acceptedAt: '2026-08-02T00:00:00.000Z',
        acceptedByEmail: 'buyer@example.com',
        acceptedTermsHash: quoteTermsHash(quote),
        customerEmail: 'buyer@example.com',
        snapshot: quote,
      })
    ).toBe(false)
    expect(
      hasCompleteAcceptanceEvidence({
        acceptedAt: '2026-07-12T00:00:00.000Z',
        acceptedByEmail: 'buyer@example.com',
        acceptedTermsHash: quoteTermsHash(quote),
        customerEmail: 'buyer@example.com',
        snapshot: { ...quote, terms: 'Changed terms' },
      })
    ).toBe(false)
  })

  it('requires complete Stripe evidence for a required deposit', () => {
    expect(
      hasCompleteDepositEvidence({
        amountPaidCents: 30_000,
        depositAmountCents: 30_000,
        paidAt: '2026-07-12T00:00:00.000Z',
        stripeCheckoutSessionId: 'cs_123',
        stripePaymentIntentId: 'pi_123',
      })
    ).toBe(true)
    expect(
      hasCompleteDepositEvidence({
        amountPaidCents: 30_001,
        depositAmountCents: 30_000,
        paidAt: '2026-07-12T00:00:00.000Z',
        stripeCheckoutSessionId: 'cs_123',
        stripePaymentIntentId: 'pi_123',
      })
    ).toBe(false)
  })
})
