import { describe, expect, it } from 'vitest'
import { quoteTermsHash } from '../../../lib/custom-quote-evidence'
import { assertCustomQuoteEvidenceTransition, type QuoteRecord } from '../CustomQuotes'

const future = new Date(Date.now() + 86_400_000).toISOString()
const sent: QuoteRecord = {
  id: 1,
  enquiry: 2,
  customerEmail: 'buyer@example.com',
  quoteSeriesId: 'series',
  quoteNumber: 'QUOTE-SERIES-R1',
  revision: 1,
  status: 'sent',
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: future,
  terms: 'Exact scope and terms.',
  depositStatus: 'awaiting-payment',
}

function accepted(): QuoteRecord {
  const evidence = {
    ...sent,
    status: 'accepted' as const,
    acceptedAt: new Date().toISOString(),
    acceptedByEmail: sent.customerEmail,
  }
  return { ...evidence, acceptedTermsHash: quoteTermsHash(evidence) }
}

describe('custom quote transition evidence', () => {
  it('blocks manual acceptance and acceptance from an unsent quote', () => {
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: sent,
        current: accepted(),
        hasAcceptanceContext: false,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).toThrow('verified customer acceptance evidence')
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: { ...sent, status: 'draft' },
        current: accepted(),
        hasAcceptanceContext: true,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).toThrow('Invalid custom quote transition')
  })

  it('allows exact evidence for a sent, unexpired quote', () => {
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: sent,
        current: accepted(),
        hasAcceptanceContext: true,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).not.toThrow()
  })

  it('blocks manual deposit state and requires accepted exact Stripe payment evidence', () => {
    const paid = {
      ...accepted(),
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      paidAt: new Date().toISOString(),
      stripeCheckoutSessionId: 'cs_123',
      stripePaymentIntentId: 'pi_123',
    }
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: accepted(),
        current: paid,
        hasAcceptanceContext: false,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).toThrow('verified Stripe reconciliation')
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: accepted(),
        current: paid,
        hasAcceptanceContext: false,
        hasStripeContext: true,
        hasRevisionContext: false,
      })
    ).not.toThrow()
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: accepted(),
        current: { ...paid, amountPaidCents: 100_000 },
        hasAcceptanceContext: false,
        hasStripeContext: true,
        hasRevisionContext: false,
      })
    ).toThrow('complete Stripe payment evidence')
  })

  it('prevents status rollback and manual supersession', () => {
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: accepted(),
        current: { ...accepted(), status: 'sent' },
        hasAcceptanceContext: false,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).toThrow('Invalid custom quote transition')
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: sent,
        current: { ...sent, status: 'superseded' },
        hasAcceptanceContext: false,
        hasStripeContext: false,
        hasRevisionContext: false,
      })
    ).toThrow('only when its next revision is created')
  })

  it('enforces the deposit state machine', () => {
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: accepted(),
        current: { ...accepted(), depositStatus: 'refunded' },
        hasAcceptanceContext: false,
        hasStripeContext: true,
        hasRevisionContext: false,
      })
    ).toThrow('verified Stripe reconciliation')

    const paid = {
      ...accepted(),
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      paidAt: new Date().toISOString(),
      stripeCheckoutSessionId: 'cs_123',
      stripePaymentIntentId: 'pi_123',
    }
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: paid,
        current: { ...paid, depositStatus: 'awaiting-payment' },
        hasAcceptanceContext: false,
        hasStripeContext: true,
        hasRevisionContext: false,
      })
    ).toThrow('verified Stripe reconciliation')
    expect(() =>
      assertCustomQuoteEvidenceTransition({
        previous: paid,
        current: { ...paid, depositStatus: 'refunded' },
        hasAcceptanceContext: false,
        hasStripeContext: true,
        hasRevisionContext: false,
      })
    ).not.toThrow()
  })
})
