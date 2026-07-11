'use server'

import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { z } from 'zod'
import { APP_URL } from '@/lib/constants'
import { customQuoteDepositMetadata } from '@/lib/custom-quote-deposits'
import { quoteAcceptanceEvidenceHash, quoteTermsHash } from '@/lib/custom-quote-evidence'
import {
  getCustomerQuoteAccess,
  QUOTE_ACCESS_COOKIE,
  type CustomerQuoteAccess,
} from '@/lib/custom-quotes/customer-access'
import { getPayload } from '@/lib/payload'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getConfiguredStripeSecretKey } from '@/lib/stripe-config'
import type { CustomQuote } from '@/types/payload-types'

export interface QuoteActionState {
  error?: string
  message?: string
  success: boolean
  url?: string
}

const acceptanceSchema = z.object({ accepted: z.literal('on') })
const ACCEPTANCE_STATEMENT_VERSION = 'custom-quote-v1'

async function accessFor(quoteNumber: string): Promise<CustomerQuoteAccess | null> {
  const store = await cookies()
  const token = store.get(QUOTE_ACCESS_COOKIE)?.value
  if (!token) return null
  const access = await getCustomerQuoteAccess(token)
  return access?.quote.quoteNumber === quoteNumber ? access : null
}

function quoteStillMatchesAccess(access: CustomerQuoteAccess, quote: CustomQuote): boolean {
  return (
    quote.quoteNumber === access.quote.quoteNumber &&
    quote.revision === access.claims.revision &&
    (quote.linkVersion ?? 1) === access.claims.linkVersion &&
    quoteTermsHash(quote) === access.claims.termsHash
  )
}

function enquiryId(quote: CustomQuote): number {
  return typeof quote.enquiry === 'number' ? quote.enquiry : quote.enquiry.id
}

export async function acceptCustomQuote(
  quoteNumber: string,
  _previous: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  if (!acceptanceSchema.safeParse({ accepted: formData.get('accepted') }).success) {
    return { success: false, error: 'Confirm that you accept the complete quote and terms.' }
  }
  const access = await accessFor(quoteNumber)
  if (!access) return { success: false, error: 'This secure quote link is unavailable.' }

  let identifier: string
  try {
    identifier = await getRequestIdentifier(access.quote.customerEmail)
    if (
      !(await checkRateLimit({
        scope: 'quote-acceptance',
        identifier,
        limit: 10,
        windowSeconds: 15 * 60,
      }))
    ) {
      return { success: false, error: 'Too many attempts. Please try again later.' }
    }
  } catch (error) {
    console.error('Quote acceptance abuse protection unavailable:', error)
    return { success: false, error: 'Quote acceptance is temporarily unavailable.' }
  }

  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) return { success: false, error: 'Quote acceptance is unavailable.' }
  const req = { transactionID }
  try {
    const quote = await payload.findByID({
      collection: 'custom-quotes',
      id: access.quote.id,
      req,
      overrideAccess: true,
      depth: 0,
    })
    if (!quoteStillMatchesAccess(access, quote)) {
      throw new Error('Quote revision no longer matches this secure link')
    }
    if (quote.status === 'accepted') {
      await payload.db.commitTransaction(transactionID)
      return { success: true, message: 'This quote is already accepted.' }
    }
    if (quote.status !== 'sent' || new Date(quote.validUntil).getTime() <= Date.now()) {
      throw new Error('This quote is no longer available for acceptance')
    }

    const acceptedAt = new Date().toISOString()
    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      req,
      overrideAccess: true,
      context: { quoteAcceptanceEvidence: true },
      data: {
        status: 'accepted',
        acceptedAt,
        acceptedByEmail: quote.customerEmail,
        acceptedTermsHash: quoteTermsHash(quote),
        acceptedStatementVersion: ACCEPTANCE_STATEMENT_VERSION,
        acceptedEvidenceHash: quoteAcceptanceEvidenceHash({
          acceptedAt,
          customerEmail: quote.customerEmail,
          snapshot: quote,
          statementVersion: ACCEPTANCE_STATEMENT_VERSION,
        }),
      },
    })
    await payload.update({
      collection: 'enquiries',
      id: enquiryId(quote),
      req,
      overrideAccess: true,
      data: { status: 'accepted' },
    })
    await payload.db.commitTransaction(transactionID)
    return { success: true, message: 'Quote accepted. You can now pay the deposit.' }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    console.error('Custom quote acceptance failed:', error)
    return { success: false, error: 'This quote could not be accepted. Please contact us.' }
  }
}

async function createDepositAttempt(
  access: CustomerQuoteAccess,
  stripe: Stripe
): Promise<QuoteActionState> {
  const payload = await getPayload()
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('Database transactions are required for deposits')
  const req = { transactionID }

  try {
    const quote = await payload.findByID({
      collection: 'custom-quotes',
      id: access.quote.id,
      req,
      overrideAccess: true,
      depth: 0,
    })
    if (!quoteStillMatchesAccess(access, quote) || quote.status !== 'accepted') {
      throw new Error('Quote is not accepted or no longer matches this link')
    }
    if (quote.depositStatus === 'paid') {
      await payload.db.commitTransaction(transactionID)
      return { success: true, message: 'Your deposit is already recorded.' }
    }
    if (quote.depositStatus !== 'awaiting-payment' || quote.depositAmountCents <= 0) {
      throw new Error('This quote does not have a payable deposit')
    }

    if (quote.pendingStripeCheckoutSessionId) {
      const pending = await stripe.checkout.sessions.retrieve(quote.pendingStripeCheckoutSessionId)
      if (pending.status === 'open' && pending.url) {
        await payload.db.commitTransaction(transactionID)
        return { success: true, url: pending.url }
      }
      if (pending.payment_status === 'paid') {
        await payload.db.commitTransaction(transactionID)
        return { success: true, message: 'Payment received. We are recording your deposit.' }
      }
    }

    const now = Date.now()
    const validUntil = new Date(quote.validUntil).getTime()
    if (validUntil - now < 31 * 60 * 1000) {
      throw new Error('Quote is too close to expiry for a new Stripe session')
    }
    const expiresAt = Math.min(now + 31 * 60 * 1000, validUntil)
    const generation = (quote.depositCheckoutGeneration ?? 0) + 1
    const metadata = customQuoteDepositMetadata(quote)
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        client_reference_id: `quote-${quote.id}-r${quote.revision}`,
        customer_email: quote.customerEmail,
        expires_at: Math.floor(expiresAt / 1000),
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: `Custom jewellery deposit – ${quote.quoteNumber}`,
                metadata,
              },
              unit_amount: quote.depositAmountCents,
            },
            quantity: 1,
          },
        ],
        metadata,
        payment_intent_data: { metadata },
        success_url: `${APP_URL}/quote/${encodeURIComponent(quote.quoteNumber)}?payment=return&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/quote/${encodeURIComponent(quote.quoteNumber)}?payment=cancelled`,
      },
      { idempotencyKey: `quote-deposit/${quote.id}/r${quote.revision}/g${generation}` }
    )
    if (session.status !== 'open' || !session.url) {
      throw new Error('Stripe quote deposit session did not open')
    }

    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      req,
      overrideAccess: true,
      context: { stripeQuoteDepositReconciliation: true },
      data: {
        depositCheckoutGeneration: generation,
        pendingStripeCheckoutSessionId: session.id,
        pendingStripeCheckoutExpiresAt: new Date(expiresAt).toISOString(),
      },
    })
    await payload.db.commitTransaction(transactionID)
    return { success: true, url: session.url }
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

export async function createCustomQuoteDepositCheckout(
  quoteNumber: string,
  _previous: QuoteActionState,
  _formData: FormData
): Promise<QuoteActionState> {
  const access = await accessFor(quoteNumber)
  if (!access) return { success: false, error: 'This secure quote link is unavailable.' }
  const stripeSecretKey = getConfiguredStripeSecretKey()
  if (!stripeSecretKey) {
    return { success: false, error: 'Payment processing is not configured. Please contact us.' }
  }

  try {
    const identifier = await getRequestIdentifier(access.quote.customerEmail)
    if (
      !(await checkRateLimit({
        scope: 'quote-deposit',
        identifier,
        limit: 10,
        windowSeconds: 15 * 60,
      }))
    ) {
      return { success: false, error: 'Too many attempts. Please try again later.' }
    }
  } catch (error) {
    console.error('Quote deposit abuse protection unavailable:', error)
    return { success: false, error: 'Deposit payment is temporarily unavailable.' }
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' })
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await createDepositAttempt(access, stripe)
    } catch (error) {
      if (attempt === 1) {
        console.error('Custom quote deposit checkout failed:', error)
      }
    }
  }
  return { success: false, error: 'Deposit payment could not be started. Please contact us.' }
}
