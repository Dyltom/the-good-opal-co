import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import type { CustomQuote } from '@/types/payload-types'
import {
  customQuoteDepositMetadata,
  isCustomQuoteDepositSession,
  verifyPaidQuoteDepositSession,
} from '../custom-quote-deposits'

const quote = {
  id: 12,
  quoteNumber: 'QUOTE-ABC-R1',
  quoteSeriesId: 'abc',
  revision: 1,
  enquiry: 8,
  customerEmail: 'buyer@example.com',
  status: 'accepted',
  amountCents: 120_000,
  depositAmountCents: 30_000,
  currency: 'AUD',
  validUntil: '2026-08-01T00:00:00.000Z',
  terms: 'Exact quote terms.',
  depositStatus: 'awaiting-payment',
  pendingStripeCheckoutSessionId: 'cs_quote',
  linkVersion: 1,
  updatedAt: '2026-07-12T00:00:00.000Z',
  createdAt: '2026-07-12T00:00:00.000Z',
} satisfies CustomQuote

function session(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: 'cs_quote',
    object: 'checkout.session',
    mode: 'payment',
    payment_status: 'paid',
    amount_total: 30_000,
    currency: 'aud',
    customer_email: 'buyer@example.com',
    customer_details: null,
    payment_intent: 'pi_quote',
    metadata: customQuoteDepositMetadata(quote),
    ...overrides,
  } as Stripe.Checkout.Session
}

describe('custom quote Stripe deposits', () => {
  it('classifies and verifies exact server-authored deposit facts', () => {
    expect(isCustomQuoteDepositSession(session())).toBe(true)
    expect(
      verifyPaidQuoteDepositSession({ quote, session: session(), eventCreated: 1_784_000_000 })
    ).toEqual({
      paymentIntentId: 'pi_quote',
      paidAt: new Date(1_784_000_000 * 1000).toISOString(),
    })
  })

  it.each([
    { amount_total: 29_999 },
    { currency: 'usd' },
    { customer_email: 'other@example.com' },
    { payment_intent: null },
    { id: 'cs_other' },
  ] as Array<Partial<Stripe.Checkout.Session>>)('rejects mismatched payment facts %#', (change) => {
    expect(() =>
      verifyPaidQuoteDepositSession({ quote, session: session(change), eventCreated: 1 })
    ).toThrow()
  })

  it('accepts an exact paid replay and rejects conflicting evidence', () => {
    const paid = {
      ...quote,
      depositStatus: 'paid' as const,
      pendingStripeCheckoutSessionId: null,
      stripeCheckoutSessionId: 'cs_quote',
      stripePaymentIntentId: 'pi_quote',
      amountPaidCents: 30_000,
    }
    expect(() =>
      verifyPaidQuoteDepositSession({ quote: paid, session: session(), eventCreated: 1 })
    ).not.toThrow()
    expect(() =>
      verifyPaidQuoteDepositSession({
        quote: { ...paid, stripePaymentIntentId: 'pi_other' },
        session: session(),
        eventCreated: 1,
      })
    ).toThrow('Conflicting payment evidence')
  })
})
