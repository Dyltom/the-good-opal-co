import { describe, expect, it } from 'vitest'
import { quoteTermsHash } from '../../../lib/custom-quote-evidence'
import { quoteEvidenceSupportsEnquiryStatus, type OperationalQuoteEvidence } from '../Enquiries'

const future = new Date(Date.now() + 86_400_000).toISOString()
const base: OperationalQuoteEvidence = {
  status: 'sent',
  quoteNumber: 'QUOTE-ABC-R1',
  revision: 1,
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: future,
  terms: 'Exact custom ring scope.',
  customerEmail: 'buyer@example.com',
  depositStatus: 'awaiting-payment',
}

function acceptedQuote(): OperationalQuoteEvidence {
  const quote = { ...base, status: 'accepted' as const }
  return {
    ...quote,
    acceptedAt: new Date().toISOString(),
    acceptedByEmail: quote.customerEmail,
    acceptedStatementVersion: 'custom-quote-v1',
    acceptedEvidenceHash: 'evidence-hash',
    acceptedTermsHash: quoteTermsHash(quote),
  }
}

describe('enquiry quote evidence gates', () => {
  it('requires a live sent quote before an enquiry can claim quoted', () => {
    expect(quoteEvidenceSupportsEnquiryStatus('quoted', [base])).toBe(true)
    expect(
      quoteEvidenceSupportsEnquiryStatus('quoted', [
        { ...base, validUntil: '2020-01-01T00:00:00.000Z' },
      ])
    ).toBe(false)
  })

  it('requires exact acceptance evidence before accepted', () => {
    expect(quoteEvidenceSupportsEnquiryStatus('accepted', [acceptedQuote()])).toBe(true)
    expect(
      quoteEvidenceSupportsEnquiryStatus('accepted', [
        { ...acceptedQuote(), acceptedByEmail: 'other@example.com' },
      ])
    ).toBe(false)
  })

  it('requires Stripe evidence before deposit-paid or paid-deposit production', () => {
    const accepted = acceptedQuote()
    expect(quoteEvidenceSupportsEnquiryStatus('deposit-paid', [accepted])).toBe(false)
    expect(quoteEvidenceSupportsEnquiryStatus('in-production', [accepted])).toBe(false)

    const paid = {
      ...accepted,
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      paidAt: new Date().toISOString(),
      stripeCheckoutSessionId: 'cs_123',
      stripePaymentIntentId: 'pi_123',
    }
    expect(quoteEvidenceSupportsEnquiryStatus('deposit-paid', [paid])).toBe(true)
    expect(quoteEvidenceSupportsEnquiryStatus('in-production', [paid])).toBe(true)
  })
})
