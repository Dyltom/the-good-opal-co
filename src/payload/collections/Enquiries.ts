import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'
import {
  hasCompleteAcceptanceEvidence,
  hasCompleteDepositEvidence,
} from '../../lib/custom-quote-evidence.ts'

type EvidenceControlledStatus = 'quoted' | 'accepted' | 'deposit-paid' | 'in-production'

export interface OperationalQuoteEvidence {
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'cancelled' | 'superseded'
  quoteNumber: string
  revision: number
  amountCents: number
  depositAmountCents: number
  currency: string
  validUntil: string
  terms: string
  customerEmail: string
  acceptedAt?: string | null
  acceptedByEmail?: string | null
  acceptedTermsHash?: string | null
  depositStatus: 'not-required' | 'awaiting-payment' | 'paid' | 'refunded'
  amountPaidCents?: number | null
  paidAt?: string | null
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
}

function quoteHasAcceptance(quote: OperationalQuoteEvidence): boolean {
  return (
    quote.status === 'accepted' &&
    hasCompleteAcceptanceEvidence({
      acceptedAt: quote.acceptedAt,
      acceptedByEmail: quote.acceptedByEmail,
      acceptedTermsHash: quote.acceptedTermsHash,
      customerEmail: quote.customerEmail,
      snapshot: {
        quoteNumber: quote.quoteNumber,
        revision: quote.revision,
        amountCents: quote.amountCents,
        depositAmountCents: quote.depositAmountCents,
        currency: quote.currency,
        validUntil: quote.validUntil,
        terms: quote.terms,
      },
    })
  )
}

function quoteHasPaidDeposit(quote: OperationalQuoteEvidence): boolean {
  return (
    quote.depositStatus === 'paid' &&
    hasCompleteDepositEvidence({
      amountPaidCents: quote.amountPaidCents,
      depositAmountCents: quote.depositAmountCents,
      paidAt: quote.paidAt,
      stripeCheckoutSessionId: quote.stripeCheckoutSessionId,
      stripePaymentIntentId: quote.stripePaymentIntentId,
    })
  )
}

export function quoteEvidenceSupportsEnquiryStatus(
  status: EvidenceControlledStatus,
  quotes: readonly OperationalQuoteEvidence[]
): boolean {
  const liveQuotes = quotes.filter(
    (quote) => quote.status !== 'cancelled' && quote.status !== 'superseded'
  )
  if (status === 'quoted') {
    return liveQuotes.some(
      (quote) =>
        (quote.status === 'sent' || quote.status === 'accepted') &&
        new Date(quote.validUntil).getTime() > Date.now()
    )
  }
  if (status === 'accepted') return liveQuotes.some(quoteHasAcceptance)
  if (status === 'deposit-paid') {
    return liveQuotes.some((quote) => quoteHasAcceptance(quote) && quoteHasPaidDeposit(quote))
  }
  return liveQuotes.some(
    (quote) =>
      quoteHasAcceptance(quote) && (quote.depositAmountCents === 0 || quoteHasPaidDeposit(quote))
  )
}

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  defaultSort: '-submittedAt',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'type', 'status', 'name', 'email', 'submittedAt'],
    group: 'CRM',
    description: 'Website enquiries, custom design leads, and course interest',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'General question', value: 'general' },
        { label: 'Custom jewellery', value: 'custom-design' },
        { label: 'Product viewing', value: 'virtual-viewing' },
        { label: 'Product question', value: 'product-question' },
        { label: 'Order support', value: 'order-support' },
        { label: 'Return or exchange', value: 'returns' },
        { label: 'Wholesale or trade', value: 'wholesale' },
        { label: 'Course or workshop interest', value: 'course-interest' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Awaiting customer', value: 'awaiting-customer' },
        { label: 'Consultation', value: 'consultation' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Deposit paid', value: 'deposit-paid' },
        { label: 'In production', value: 'in-production' },
        { label: 'Completed', value: 'completed' },
        { label: 'Declined', value: 'declined' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'orderNumber', type: 'text' },
    { name: 'product', type: 'text' },
    { name: 'budget', type: 'text' },
    { name: 'timeline', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'designConfiguration',
      type: 'json',
      admin: { description: 'Validated custom builder configuration snapshot' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website-contact',
      options: [
        { label: 'Website contact', value: 'website-contact' },
        { label: 'Custom builder', value: 'custom-builder' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'ownerEmailSentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'customerEmailSentAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'emailDeliveryError', type: 'textarea', admin: { readOnly: true } },
    { name: 'internalNotes', type: 'textarea', admin: { description: 'Private staff notes' } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation !== 'update' || !data?.status || data.status === originalDoc?.status)
          return data
        if (!['quoted', 'accepted', 'deposit-paid', 'in-production'].includes(data.status))
          return data

        const quotes = await req.payload.find({
          collection: 'custom-quotes',
          where: { enquiry: { equals: originalDoc.id } },
          pagination: false,
          req,
        })
        const targetStatus = data.status as EvidenceControlledStatus
        if (!quoteEvidenceSupportsEnquiryStatus(targetStatus, quotes.docs)) {
          throw new Error(
            `Enquiry cannot move to ${targetStatus} without matching immutable quote, acceptance, and Stripe deposit evidence`
          )
        }
        return data
      },
    ],
  },
}
