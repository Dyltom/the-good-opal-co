import type Stripe from 'stripe'
import type { CustomQuote } from '@/types/payload-types'
import { quoteTermsHash } from './custom-quote-evidence'

export const CUSTOM_QUOTE_PAYMENT_KIND = 'custom-quote-deposit'

export interface VerifiedQuoteDeposit {
  paymentIntentId: string
  paidAt: string
}

export function isCustomQuoteDepositSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.paymentKind === CUSTOM_QUOTE_PAYMENT_KIND
}

export function customQuoteDepositMetadata(quote: CustomQuote): Record<string, string> {
  return {
    paymentKind: CUSTOM_QUOTE_PAYMENT_KIND,
    quoteId: String(quote.id),
    quoteNumber: quote.quoteNumber,
    quoteRevision: String(quote.revision),
    quoteTermsHash: quoteTermsHash(quote),
  }
}

export function verifyPaidQuoteDepositSession({
  quote,
  session,
  eventCreated,
}: {
  quote: CustomQuote
  session: Stripe.Checkout.Session
  eventCreated: number
}): VerifiedQuoteDeposit {
  const metadata = customQuoteDepositMetadata(quote)
  const customerEmail = session.customer_email ?? session.customer_details?.email
  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
  const knownSessionId =
    quote.pendingStripeCheckoutSessionId ?? quote.stripeCheckoutSessionId ?? null

  if (quote.status !== 'accepted') throw new Error('Quote deposit requires an accepted quote')
  if (quote.depositStatus !== 'awaiting-payment' && quote.depositStatus !== 'paid') {
    throw new Error('Quote is not awaiting this deposit')
  }
  if (!knownSessionId || knownSessionId !== session.id) {
    throw new Error('Stripe session does not match the active quote deposit attempt')
  }
  if (
    session.mode !== 'payment' ||
    session.payment_status !== 'paid' ||
    session.amount_total !== quote.depositAmountCents ||
    session.currency?.toUpperCase() !== quote.currency ||
    customerEmail?.trim().toLowerCase() !== quote.customerEmail.trim().toLowerCase() ||
    !paymentIntentId
  ) {
    throw new Error('Stripe payment facts do not match the custom quote deposit')
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (session.metadata?.[key] !== value) {
      throw new Error(`Stripe quote metadata mismatch: ${key}`)
    }
  }
  if (
    quote.depositStatus === 'paid' &&
    (quote.stripeCheckoutSessionId !== session.id ||
      quote.stripePaymentIntentId !== paymentIntentId ||
      quote.amountPaidCents !== quote.depositAmountCents)
  ) {
    throw new Error('Conflicting payment evidence exists for this quote')
  }

  return {
    paymentIntentId,
    paidAt: new Date(eventCreated * 1000).toISOString(),
  }
}
