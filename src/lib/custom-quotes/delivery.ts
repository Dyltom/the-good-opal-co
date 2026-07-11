import type { Payload } from 'payload'
import { Resend } from 'resend'
import { CustomQuoteEmail } from '@/emails/custom-quote'
import { APP_URL } from '@/lib/constants'
import {
  formatCustomQuoteExpiry,
  quoteTermsHash,
  type QuoteEvidenceSnapshot,
} from '../custom-quote-evidence'
import { createQuoteLinkToken } from './quote-link-token'

interface DeliverableCustomQuote extends QuoteEvidenceSnapshot {
  id: number
  enquiry: number | { id: number }
  customerEmail: string
  linkVersion?: number | null
}

export async function deliverCustomQuote(
  quote: DeliverableCustomQuote,
  payload: Payload
): Promise<{ providerId: string; sentAt: string }> {
  const enquiryId = typeof quote.enquiry === 'number' ? quote.enquiry : quote.enquiry.id
  const enquiry = await payload.findByID({
    collection: 'enquiries',
    id: enquiryId,
    overrideAccess: true,
    depth: 0,
  })
  const expiresAt = Math.floor(new Date(quote.validUntil).getTime() / 1000)
  const token = createQuoteLinkToken({
    expiresAt,
    linkVersion: quote.linkVersion ?? 1,
    quoteId: quote.id,
    revision: quote.revision,
    termsHash: quoteTermsHash(quote),
  })
  const quoteUrl = `${APP_URL}/quote/access#${token}`
  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')
  const { data, error } = await resend.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: quote.customerEmail,
      subject: `Your custom jewellery quote – ${quote.quoteNumber}`,
      react: CustomQuoteEmail({
        customerName: enquiry.name,
        depositAmountCents: quote.depositAmountCents,
        quoteNumber: quote.quoteNumber,
        quoteUrl,
        revision: quote.revision,
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
        totalAmountCents: quote.amountCents,
        validUntil: formatCustomQuoteExpiry(quote.validUntil),
      }),
    },
    { idempotencyKey: `custom-quote/${quote.id}/r${quote.revision}/v${quote.linkVersion ?? 1}` }
  )
  if (error || !data?.id) {
    throw new Error(`Quote email delivery failed: ${error?.message ?? 'missing provider ID'}`)
  }
  return { providerId: data.id, sentAt: new Date().toISOString() }
}
