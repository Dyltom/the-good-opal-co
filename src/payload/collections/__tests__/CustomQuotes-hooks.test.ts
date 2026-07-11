import { describe, expect, it } from 'vitest'

import type { CollectionBeforeChangeHook } from 'payload'
import { guardCustomQuoteChange, type QuoteRecord } from '../CustomQuotes'

const draft = {
  id: 1,
  enquiry: 2,
  customerEmail: 'buyer@example.com',
  quoteSeriesId: 'series',
  quoteNumber: 'QUOTE-SERIES-R1',
  revision: 1,
  status: 'draft',
  amountCents: 100_000,
  depositAmountCents: 25_000,
  currency: 'AUD',
  validUntil: new Date(Date.now() + 86_400_000).toISOString(),
  terms: 'Exact scope and terms.',
  depositStatus: 'awaiting-payment',
  linkVersion: 1,
} satisfies QuoteRecord

async function runGuard({
  context = {},
  data,
  originalDoc = draft,
}: {
  context?: Record<string, unknown>
  data: Record<string, unknown>
  originalDoc?: QuoteRecord
}) {
  return guardCustomQuoteChange({
    context,
    data,
    operation: 'update',
    originalDoc,
    req: { payload: {} },
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])
}

describe('custom quote system hooks', () => {
  it('requires durable delivery evidence before a quote can become sent', async () => {
    await expect(runGuard({ data: { status: 'sent' } })).rejects.toThrow(
      'cannot be sent without verified customer email delivery'
    )
    await expect(
      runGuard({
        context: { quoteDeliveryEvidence: true },
        data: {
          status: 'sent',
          deliveryStatus: 'sent',
          customerEmailSentAt: '2026-07-12T00:00:00.000Z',
          customerEmailProviderId: 'email_123',
        },
      })
    ).resolves.toMatchObject({ status: 'sent', deliveryStatus: 'sent' })
  })

  it('blocks forged delivery and pending Stripe evidence from admin/local API updates', async () => {
    await expect(
      runGuard({ data: { customerEmailSentAt: '2026-07-12T00:00:00.000Z' } })
    ).rejects.toThrow('delivery evidence is system controlled')
    await expect(
      runGuard({ data: { pendingStripeCheckoutSessionId: 'cs_forged' } })
    ).rejects.toThrow('requires verified Stripe reconciliation')
  })

  it('allows pending checkout evidence only under the trusted Stripe context', async () => {
    await expect(
      runGuard({
        context: { stripeQuoteDepositReconciliation: true },
        data: { pendingStripeCheckoutSessionId: 'cs_real' },
      })
    ).resolves.toMatchObject({ pendingStripeCheckoutSessionId: 'cs_real' })
  })

  it('blocks cancelling an accepted quote while its deposit remains paid', async () => {
    const paid = {
      ...draft,
      status: 'accepted' as const,
      depositStatus: 'paid' as const,
      amountPaidCents: 25_000,
      stripeRefundedAmountCents: 0,
    }
    await expect(runGuard({ originalDoc: paid, data: { status: 'cancelled' } })).rejects.toThrow(
      'cannot be cancelled before its deposit is fully refunded'
    )
  })

  it('blocks cancellation while a customer still has an open payable deposit session', async () => {
    const pending = {
      ...draft,
      status: 'accepted' as const,
      pendingStripeCheckoutSessionId: 'cs_open',
    }
    await expect(runGuard({ originalDoc: pending, data: { status: 'cancelled' } })).rejects.toThrow(
      'cannot be cancelled while its Stripe deposit session is still open'
    )
  })
})
