import { randomBytes } from 'node:crypto'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'
import {
  hasCompleteAcceptanceEvidence,
  hasCompleteDepositEvidence,
  quoteAcceptanceEvidenceHash,
  quoteTermsHash,
  type QuoteEvidenceSnapshot,
} from '../../lib/custom-quote-evidence.ts'
import { isAdmin } from '../../lib/payload-access.ts'

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'cancelled' | 'superseded'
type DepositStatus = 'not-required' | 'awaiting-payment' | 'paid' | 'refunded'

export interface QuoteRecord extends QuoteEvidenceSnapshot {
  id: number
  enquiry: number | { id: number }
  customerEmail: string
  quoteSeriesId: string
  status: QuoteStatus
  depositStatus: DepositStatus
  amountPaidCents?: number | null
  acceptedAt?: string | null
  acceptedByEmail?: string | null
  acceptedTermsHash?: string | null
  acceptedStatementVersion?: string | null
  acceptedEvidenceHash?: string | null
  paidAt?: string | null
  stripeRefundedAmountCents?: number | null
  refundedAt?: string | null
  depositCheckoutGeneration?: number | null
  pendingStripeCheckoutSessionId?: string | null
  pendingStripeCheckoutExpiresAt?: string | null
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
  stripeDisputeId?: string | null
  stripeDisputeStatus?: string | null
  depositDisputedAt?: string | null
  stripeDisputeEventAt?: string | null
  customerEmailSentAt?: string | null
  customerEmailProviderId?: string | null
  customerEmailError?: string | null
  deliveryStatus?: 'not-sent' | 'issuing' | 'sent' | 'failed' | null
  deliveryAttemptCount?: number | null
  deliveryLastAttemptAt?: string | null
  depositConfirmationEmailSentAt?: string | null
  depositConfirmationEmailProviderId?: string | null
  depositConfirmationEmailError?: string | null
  linkVersion?: number | null
  supersedes?: number | { id: number } | null
}

function relationshipId(value: QuoteRecord['enquiry'] | QuoteRecord['supersedes']): number | null {
  if (value === null || value === undefined) return null
  return typeof value === 'object' ? value.id : value
}

function snapshotFrom(value: Partial<QuoteRecord>): QuoteEvidenceSnapshot {
  if (
    !value.quoteNumber ||
    !value.revision ||
    value.amountCents === undefined ||
    value.depositAmountCents === undefined ||
    !value.currency ||
    !value.validUntil ||
    !value.terms
  ) {
    throw new Error('Quote commercial terms are incomplete')
  }

  return {
    quoteNumber: value.quoteNumber,
    revision: value.revision,
    amountCents: value.amountCents,
    depositAmountCents: value.depositAmountCents,
    currency: value.currency,
    validUntil: value.validUntil,
    terms: value.terms,
  }
}

const commercialFields: Array<keyof QuoteRecord> = [
  'amountCents',
  'depositAmountCents',
  'currency',
  'validUntil',
  'terms',
]

export function assertCustomQuoteEvidenceTransition(input: {
  previous: QuoteRecord
  current: QuoteRecord
  hasAcceptanceContext: boolean
  hasStripeContext: boolean
  hasRevisionContext: boolean
}): void {
  const { previous, current } = input
  const allowedTransitions: Record<QuoteStatus, readonly QuoteStatus[]> = {
    draft: ['draft', 'sent', 'cancelled'],
    sent: ['sent', 'accepted', 'expired', 'cancelled', 'superseded'],
    accepted: ['accepted', 'cancelled'],
    expired: ['expired', 'superseded'],
    cancelled: ['cancelled', 'superseded'],
    superseded: ['superseded'],
  }
  if (!allowedTransitions[previous.status].includes(current.status)) {
    throw new Error(`Invalid custom quote transition: ${previous.status} to ${current.status}`)
  }
  if (
    current.status === 'superseded' &&
    previous.status !== 'superseded' &&
    !input.hasRevisionContext
  ) {
    throw new Error('A quote is superseded only when its next revision is created')
  }
  if (current.status === 'accepted' && previous.status !== 'accepted') {
    if (previous.status !== 'sent') {
      throw new Error('Only a sent quote can be accepted')
    }
    if (Date.now() > new Date(current.validUntil).getTime()) {
      throw new Error('An expired quote cannot be accepted')
    }
    if (!input.hasAcceptanceContext) {
      throw new Error('Accepted status requires verified customer acceptance evidence')
    }
    if (
      !hasCompleteAcceptanceEvidence({
        acceptedAt: current.acceptedAt,
        acceptedByEmail: current.acceptedByEmail,
        acceptedTermsHash: current.acceptedTermsHash,
        customerEmail: current.customerEmail,
        snapshot: snapshotFrom(current),
      })
    ) {
      throw new Error('Customer acceptance evidence does not match this quote revision')
    }
    if (
      !current.acceptedStatementVersion ||
      !current.acceptedAt ||
      current.acceptedEvidenceHash !==
        quoteAcceptanceEvidenceHash({
          acceptedAt: current.acceptedAt,
          customerEmail: current.customerEmail,
          snapshot: snapshotFrom(current),
          statementVersion: current.acceptedStatementVersion,
        })
    ) {
      throw new Error('Customer acceptance statement evidence is incomplete')
    }
  }

  if (current.depositStatus !== previous.depositStatus) {
    const draftConfigurationChange =
      previous.status === 'draft' &&
      current.status === 'draft' &&
      ((previous.depositStatus === 'not-required' &&
        current.depositStatus === 'awaiting-payment') ||
        (previous.depositStatus === 'awaiting-payment' && current.depositStatus === 'not-required'))
    const verifiedStripeTransition =
      (previous.depositStatus === 'awaiting-payment' && current.depositStatus === 'paid') ||
      (previous.depositStatus === 'paid' && current.depositStatus === 'refunded')

    if (!draftConfigurationChange && (!input.hasStripeContext || !verifiedStripeTransition)) {
      throw new Error('Deposit status is controlled by verified Stripe reconciliation')
    }
    if (current.depositStatus === 'paid') {
      if (current.status !== 'accepted') {
        throw new Error('A deposit cannot be paid before quote acceptance')
      }
      if (!hasCompleteDepositEvidence(current)) {
        throw new Error('Paid deposit status requires complete Stripe payment evidence')
      }
    }
  }
}

export const guardCustomQuoteChange: CollectionBeforeChangeHook = async ({
  context,
  data,
  operation,
  originalDoc,
  req,
}) => {
  const next = { ...data } as Partial<QuoteRecord>

  if (operation === 'create') {
    const supersedesId = relationshipId(next.supersedes)
    if (supersedesId) {
      const prior = (await req.payload.findByID({
        collection: 'custom-quotes',
        id: supersedesId,
        req,
      })) as QuoteRecord
      if (!['sent', 'expired', 'cancelled'].includes(prior.status)) {
        throw new Error('Only an unaccepted issued quote can be revised')
      }
      if (prior.depositStatus === 'paid' || prior.depositStatus === 'refunded') {
        throw new Error('A quote with deposit activity cannot be superseded')
      }
      next.enquiry = relationshipId(prior.enquiry) ?? undefined
      next.customerEmail = prior.customerEmail
      next.quoteSeriesId = prior.quoteSeriesId
      next.revision = prior.revision + 1
    } else {
      const enquiryId = relationshipId(next.enquiry)
      if (!enquiryId) throw new Error('A quote must belong to an enquiry')
      const enquiry = await req.payload.findByID({ collection: 'enquiries', id: enquiryId, req })
      next.customerEmail = enquiry.email
      next.quoteSeriesId = randomBytes(12).toString('hex')
      next.revision = 1
    }

    next.quoteNumber = `QUOTE-${next.quoteSeriesId?.slice(0, 8).toUpperCase()}-R${next.revision}`
    next.status = 'draft'
    next.depositStatus =
      next.depositAmountCents && next.depositAmountCents > 0 ? 'awaiting-payment' : 'not-required'
    next.acceptedAt = null
    next.acceptedByEmail = null
    next.acceptedTermsHash = null
    next.acceptedStatementVersion = null
    next.acceptedEvidenceHash = null
    next.amountPaidCents = null
    next.paidAt = null
    next.stripeRefundedAmountCents = 0
    next.refundedAt = null
    next.depositCheckoutGeneration = 0
    next.pendingStripeCheckoutSessionId = null
    next.pendingStripeCheckoutExpiresAt = null
    next.stripeCheckoutSessionId = null
    next.stripePaymentIntentId = null
    next.stripeDisputeId = null
    next.stripeDisputeStatus = null
    next.depositDisputedAt = null
    next.stripeDisputeEventAt = null
    next.customerEmailSentAt = null
    next.customerEmailProviderId = null
    next.customerEmailError = null
    next.deliveryStatus = 'not-sent'
    next.deliveryAttemptCount = 0
    next.deliveryLastAttemptAt = null
    next.depositConfirmationEmailSentAt = null
    next.depositConfirmationEmailProviderId = null
    next.depositConfirmationEmailError = null
    next.linkVersion = 1
  } else if (
    originalDoc?.status === 'draft' &&
    next.depositAmountCents !== undefined &&
    next.depositAmountCents !== originalDoc.depositAmountCents
  ) {
    next.depositStatus = next.depositAmountCents > 0 ? 'awaiting-payment' : 'not-required'
  }

  const previous = originalDoc as QuoteRecord | undefined
  const merged = { ...previous, ...next } as QuoteRecord

  const stripeEvidenceFields: Array<keyof QuoteRecord> = [
    'amountPaidCents',
    'paidAt',
    'stripeRefundedAmountCents',
    'refundedAt',
    'depositCheckoutGeneration',
    'pendingStripeCheckoutSessionId',
    'pendingStripeCheckoutExpiresAt',
    'stripeCheckoutSessionId',
    'stripePaymentIntentId',
    'stripeDisputeId',
    'stripeDisputeStatus',
    'depositDisputedAt',
    'stripeDisputeEventAt',
    'depositConfirmationEmailSentAt',
    'depositConfirmationEmailProviderId',
    'depositConfirmationEmailError',
  ]
  if (
    previous &&
    stripeEvidenceFields.some(
      (field) => data?.[field] !== undefined && data[field] !== previous[field]
    ) &&
    !context['stripeQuoteDepositReconciliation']
  ) {
    throw new Error('Stripe payment evidence requires verified Stripe reconciliation')
  }

  if (merged.depositAmountCents > merged.amountCents) {
    throw new Error('Deposit cannot exceed the quote total')
  }

  const refundedAmount = merged.stripeRefundedAmountCents ?? 0
  if (
    refundedAmount < 0 ||
    refundedAmount > (merged.amountPaidCents ?? 0) ||
    refundedAmount < (previous?.stripeRefundedAmountCents ?? 0)
  ) {
    throw new Error('Stripe refunded amount must be cumulative and cannot exceed the deposit paid')
  }
  if (merged.depositStatus === 'refunded' && refundedAmount !== merged.amountPaidCents) {
    throw new Error('Refunded deposit status requires a full Stripe refund')
  }
  if (
    previous?.stripeDisputeEventAt &&
    merged.stripeDisputeEventAt &&
    new Date(merged.stripeDisputeEventAt).getTime() <
      new Date(previous.stripeDisputeEventAt).getTime()
  ) {
    throw new Error('Stripe dispute evidence cannot move backwards')
  }
  if (
    merged.status === 'cancelled' &&
    previous?.status !== 'cancelled' &&
    merged.depositStatus === 'paid'
  ) {
    throw new Error('A paid quote cannot be cancelled before its deposit is fully refunded')
  }
  if (
    merged.status === 'cancelled' &&
    previous?.status !== 'cancelled' &&
    merged.pendingStripeCheckoutSessionId
  ) {
    throw new Error('A quote cannot be cancelled while its Stripe deposit session is still open')
  }

  if (
    operation === 'update' &&
    previous &&
    previous.status !== 'draft' &&
    commercialFields.some((field) => data?.[field] !== undefined && data[field] !== previous[field])
  ) {
    throw new Error('Sent quote terms are immutable; create a new revision instead')
  }

  if (merged.status === 'sent' && new Date(merged.validUntil).getTime() <= Date.now()) {
    throw new Error('A quote cannot be sent after its expiry date')
  }

  if (previous) {
    assertCustomQuoteEvidenceTransition({
      previous,
      current: merged,
      hasAcceptanceContext: Boolean(context['quoteAcceptanceEvidence']),
      hasStripeContext: Boolean(context['stripeQuoteDepositReconciliation']),
      hasRevisionContext: Boolean(context['quoteRevisionSupersession']),
    })
  }

  if (
    previous?.status === 'accepted' &&
    ((data?.acceptedAt !== undefined && data.acceptedAt !== previous.acceptedAt) ||
      (data?.acceptedByEmail !== undefined && data.acceptedByEmail !== previous.acceptedByEmail) ||
      (data?.acceptedTermsHash !== undefined &&
        data.acceptedTermsHash !== previous.acceptedTermsHash) ||
      (data?.acceptedStatementVersion !== undefined &&
        data.acceptedStatementVersion !== previous.acceptedStatementVersion) ||
      (data?.acceptedEvidenceHash !== undefined &&
        data.acceptedEvidenceHash !== previous.acceptedEvidenceHash))
  ) {
    throw new Error('Customer acceptance evidence is immutable')
  }
  if (
    previous?.depositStatus === 'paid' &&
    ((data?.amountPaidCents !== undefined && data.amountPaidCents !== previous.amountPaidCents) ||
      (data?.paidAt !== undefined && data.paidAt !== previous.paidAt) ||
      (data?.stripeCheckoutSessionId !== undefined &&
        data.stripeCheckoutSessionId !== previous.stripeCheckoutSessionId) ||
      (data?.stripePaymentIntentId !== undefined &&
        data.stripePaymentIntentId !== previous.stripePaymentIntentId))
  ) {
    throw new Error('Stripe deposit evidence is immutable')
  }

  const deliveryEvidenceFields: Array<keyof QuoteRecord> = [
    'linkVersion',
    'customerEmailSentAt',
    'customerEmailProviderId',
    'customerEmailError',
    'deliveryStatus',
    'deliveryAttemptCount',
    'deliveryLastAttemptAt',
  ]
  if (
    deliveryEvidenceFields.some(
      (field) => data?.[field] !== undefined && data[field] !== previous?.[field]
    ) &&
    !context['quoteDeliveryEvidence']
  ) {
    throw new Error('Quote delivery evidence is system controlled')
  }

  if (
    merged.status === 'sent' &&
    previous?.status !== 'sent' &&
    (!context['quoteDeliveryEvidence'] ||
      !next.customerEmailSentAt ||
      !next.customerEmailProviderId ||
      next.deliveryStatus !== 'sent')
  ) {
    throw new Error('A quote cannot be sent without verified customer email delivery')
  }

  return next
}

function eventForTransition(previous: QuoteRecord | undefined, current: QuoteRecord) {
  if (!previous) return { eventType: 'created' as const, actorType: 'admin' as const }
  if (current.stripeDisputeStatus !== previous.stripeDisputeStatus) {
    return {
      eventType:
        current.stripeDisputeStatus === 'won'
          ? ('deposit-dispute-resolved' as const)
          : ('deposit-disputed' as const),
      actorType: 'stripe' as const,
    }
  }
  if ((current.stripeRefundedAmountCents ?? 0) > (previous.stripeRefundedAmountCents ?? 0)) {
    return { eventType: 'deposit-refunded' as const, actorType: 'stripe' as const }
  }
  if (previous.depositStatus !== current.depositStatus && current.depositStatus === 'paid') {
    return { eventType: 'deposit-paid' as const, actorType: 'stripe' as const }
  }
  if (previous.depositStatus !== current.depositStatus && current.depositStatus === 'refunded') {
    return { eventType: 'deposit-refunded' as const, actorType: 'stripe' as const }
  }
  if (previous.status !== current.status) {
    const actorType: 'customer' | 'admin' = current.status === 'accepted' ? 'customer' : 'admin'
    return { eventType: current.status, actorType }
  }
  return null
}

export const appendCustomQuoteEvidence: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (context['skipQuoteAudit']) return doc
  const quote = doc as QuoteRecord
  const event = eventForTransition(
    operation === 'create' ? undefined : (previousDoc as QuoteRecord),
    quote
  )
  if (!event || event.eventType === 'draft') return doc

  const snapshot = snapshotFrom(quote)
  await req.payload.create({
    collection: 'custom-quote-events',
    overrideAccess: true,
    req,
    context: { ...context, quoteAuditAppend: true },
    data: {
      quote: quote.id,
      enquiry: relationshipId(quote.enquiry) as number,
      eventType: event.eventType,
      occurredAt: new Date().toISOString(),
      quoteRevision: quote.revision,
      actorType: event.actorType,
      actorEmail: event.actorType === 'customer' ? quote.acceptedByEmail : req.user?.email,
      amountCents: quote.amountCents,
      depositAmountCents: quote.depositAmountCents,
      currency: quote.currency,
      validUntil: quote.validUntil,
      termsSnapshot: quote.terms,
      termsHash: quoteTermsHash(snapshot),
      evidence: {
        acceptedAt: quote.acceptedAt,
        acceptedTermsHash: quote.acceptedTermsHash,
        acceptedStatementVersion: quote.acceptedStatementVersion,
        acceptedEvidenceHash: quote.acceptedEvidenceHash,
        customerEmailSentAt: quote.customerEmailSentAt,
        customerEmailProviderId: quote.customerEmailProviderId,
        amountPaidCents: quote.amountPaidCents,
        paidAt: quote.paidAt,
        stripeRefundedAmountCents: quote.stripeRefundedAmountCents,
        refundedAt: quote.refundedAt,
        stripeDisputeId: quote.stripeDisputeId,
        stripeDisputeStatus: quote.stripeDisputeStatus,
        depositDisputedAt: quote.depositDisputedAt,
        stripeDisputeEventAt: quote.stripeDisputeEventAt,
        stripeCheckoutSessionId: quote.stripeCheckoutSessionId,
        stripePaymentIntentId: quote.stripePaymentIntentId,
      },
    },
  })

  if (operation === 'create') {
    const supersedesId = relationshipId(quote.supersedes)
    if (supersedesId) {
      await req.payload.update({
        collection: 'custom-quotes',
        id: supersedesId,
        req,
        context: { ...context, quoteRevisionSupersession: true },
        data: { status: 'superseded' },
      })
    }
  }

  return doc
}

export const CustomQuotes: CollectionConfig = {
  slug: 'custom-quotes',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'quoteNumber',
    defaultColumns: ['quoteNumber', 'customerEmail', 'status', 'amountCents', 'validUntil'],
    group: 'CRM',
    description: 'Revisioned custom jewellery quotes; amounts are stored in currency cents',
    components: {
      edit: {
        beforeDocumentControls: [
          '@/components/payload/SendCustomQuoteButton#SendCustomQuoteButton',
        ],
      },
    },
  },
  access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: () => false },
  fields: [
    {
      name: 'quoteNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: 'quoteSeriesId', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'revision', type: 'number', required: true, min: 1, admin: { readOnly: true } },
    {
      name: 'supersedes',
      type: 'relationship',
      relationTo: 'custom-quotes',
      admin: { description: 'Select an earlier quote to create its next immutable revision' },
    },
    { name: 'enquiry', type: 'relationship', relationTo: 'enquiries', required: true, index: true },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'sent', 'accepted', 'expired', 'cancelled', 'superseded'],
      admin: {
        position: 'sidebar',
        description: 'Use “Send / retry quote” to deliver a draft; Sent cannot be forged manually.',
      },
    },
    {
      name: 'amountCents',
      type: 'number',
      required: true,
      min: 1,
      admin: { description: 'Full quoted price in cents' },
    },
    {
      name: 'depositAmountCents',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: { description: 'Required deposit in cents; zero means no deposit' },
    },
    { name: 'currency', type: 'select', required: true, defaultValue: 'AUD', options: ['AUD'] },
    { name: 'validUntil', type: 'date', required: true },
    {
      name: 'terms',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Exact scope, materials, timing, inclusions, exclusions, and cancellation terms accepted for this revision',
      },
    },
    { name: 'acceptedAt', type: 'date', admin: { readOnly: true } },
    { name: 'acceptedByEmail', type: 'email', admin: { readOnly: true } },
    { name: 'acceptedTermsHash', type: 'text', admin: { readOnly: true, hidden: true } },
    { name: 'acceptedStatementVersion', type: 'text', admin: { readOnly: true } },
    { name: 'acceptedEvidenceHash', type: 'text', admin: { readOnly: true, hidden: true } },
    {
      name: 'depositStatus',
      type: 'select',
      required: true,
      defaultValue: 'not-required',
      options: ['not-required', 'awaiting-payment', 'paid', 'refunded'],
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'amountPaidCents', type: 'number', min: 0, admin: { readOnly: true } },
    { name: 'paidAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'stripeRefundedAmountCents',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'refundedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'depositCheckoutGeneration',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'pendingStripeCheckoutSessionId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: 'pendingStripeCheckoutExpiresAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'stripeCheckoutSessionId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: 'stripeDisputeId', type: 'text', unique: true, index: true, admin: { readOnly: true } },
    { name: 'stripeDisputeStatus', type: 'text', admin: { readOnly: true } },
    { name: 'depositDisputedAt', type: 'date', admin: { readOnly: true } },
    { name: 'stripeDisputeEventAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Private operational notes; not part of accepted terms' },
    },
    {
      name: 'linkVersion',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: { readOnly: true, hidden: true },
    },
    { name: 'customerEmailSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'customerEmailProviderId', type: 'text', admin: { readOnly: true } },
    { name: 'customerEmailError', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'deliveryStatus',
      type: 'select',
      required: true,
      defaultValue: 'not-sent',
      options: ['not-sent', 'issuing', 'sent', 'failed'],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'deliveryAttemptCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'deliveryLastAttemptAt', type: 'date', admin: { readOnly: true } },
    { name: 'depositConfirmationEmailSentAt', type: 'date', admin: { readOnly: true } },
    { name: 'depositConfirmationEmailProviderId', type: 'text', admin: { readOnly: true } },
    { name: 'depositConfirmationEmailError', type: 'textarea', admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [guardCustomQuoteChange],
    afterChange: [appendCustomQuoteEvidence],
    beforeDelete: [
      () => {
        throw new Error('Custom quotes are immutable business records and cannot be deleted')
      },
    ],
  },
  timestamps: true,
}
