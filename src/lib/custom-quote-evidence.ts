import { createHash, createHmac } from 'node:crypto'

export interface QuoteEvidenceSnapshot {
  quoteNumber: string
  revision: number
  amountCents: number
  depositAmountCents: number
  currency: string
  validUntil: string
  terms: string
}

export function formatCustomQuoteExpiry(value: string): string {
  return `${new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Australia/Sydney',
  }).format(new Date(value))} Sydney time`
}

export function quoteTermsHash(snapshot: QuoteEvidenceSnapshot): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        amountCents: snapshot.amountCents,
        currency: snapshot.currency,
        depositAmountCents: snapshot.depositAmountCents,
        quoteNumber: snapshot.quoteNumber,
        revision: snapshot.revision,
        terms: snapshot.terms,
        validUntil: snapshot.validUntil,
      })
    )
    .digest('hex')
}

export function quoteAcceptanceEvidenceHash(input: {
  acceptedAt: string
  customerEmail: string
  snapshot: QuoteEvidenceSnapshot
  statementVersion: string
  secret?: string
}): string {
  const secret = input.secret ?? process.env['QUOTE_LINK_SECRET']
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('QUOTE_LINK_SECRET must contain at least 32 bytes')
  }
  return createHmac('sha256', secret)
    .update(
      JSON.stringify({
        acceptedAt: input.acceptedAt,
        customerEmail: input.customerEmail.trim().toLowerCase(),
        quoteTermsHash: quoteTermsHash(input.snapshot),
        statementVersion: input.statementVersion,
      })
    )
    .digest('hex')
}

export function hasCompleteAcceptanceEvidence(input: {
  acceptedAt?: string | null
  acceptedByEmail?: string | null
  acceptedTermsHash?: string | null
  customerEmail: string
  snapshot: QuoteEvidenceSnapshot
}): boolean {
  const acceptedAt = input.acceptedAt ? new Date(input.acceptedAt).getTime() : Number.NaN
  const validUntil = new Date(input.snapshot.validUntil).getTime()
  return Boolean(
    Number.isFinite(acceptedAt) &&
    Number.isFinite(validUntil) &&
    acceptedAt <= validUntil &&
    acceptedAt <= Date.now() &&
    input.acceptedByEmail?.trim().toLowerCase() === input.customerEmail.trim().toLowerCase() &&
    input.acceptedTermsHash === quoteTermsHash(input.snapshot)
  )
}

export function hasCompleteDepositEvidence(input: {
  amountPaidCents?: number | null
  depositAmountCents: number
  paidAt?: string | null
  stripeRefundedAmountCents?: number | null
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
}): boolean {
  if (input.depositAmountCents === 0) return true

  return Boolean(
    input.amountPaidCents !== undefined &&
    input.amountPaidCents !== null &&
    input.amountPaidCents === input.depositAmountCents &&
    (input.stripeRefundedAmountCents ?? 0) === 0 &&
    input.paidAt &&
    input.stripeCheckoutSessionId?.trim() &&
    input.stripePaymentIntentId?.trim()
  )
}
