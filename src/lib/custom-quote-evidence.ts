import { createHash } from 'node:crypto'

export interface QuoteEvidenceSnapshot {
  quoteNumber: string
  revision: number
  amountCents: number
  depositAmountCents: number
  currency: string
  validUntil: string
  terms: string
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
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
}): boolean {
  if (input.depositAmountCents === 0) return true

  return Boolean(
    input.amountPaidCents !== undefined &&
    input.amountPaidCents !== null &&
    input.amountPaidCents === input.depositAmountCents &&
    input.paidAt &&
    input.stripeCheckoutSessionId?.trim() &&
    input.stripePaymentIntentId?.trim()
  )
}
