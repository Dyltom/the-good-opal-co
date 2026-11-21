import { Resend } from 'resend'
import { getPayload } from '@/lib/payload'
import { formatPrice } from '@/lib/utils'
import type { CustomQuote } from '@/types/payload-types'

export type OwnerQuoteEvent = 'accepted' | 'deposit-paid'

function ownerQuoteEmailText(quote: CustomQuote, event: OwnerQuoteEvent): string {
  const enquiry = typeof quote.enquiry === 'object' ? quote.enquiry : null
  const adminUrl = `${(process.env['NEXT_PUBLIC_APP_URL'] ?? '').replace(/\/$/, '')}/admin/collections/custom-quotes/${quote.id}`
  const deposit =
    event === 'deposit-paid'
      ? `Deposit paid: ${formatPrice(quote.amountPaidCents ?? quote.depositAmountCents)}`
      : quote.depositAmountCents > 0
        ? `Deposit due: ${formatPrice(quote.depositAmountCents)}`
        : 'No deposit required'
  return [
    event === 'accepted'
      ? `${quote.customerEmail} accepted quote ${quote.quoteNumber}.`
      : `The deposit for quote ${quote.quoteNumber} has been paid.`,
    '',
    `Quote total: ${formatPrice(quote.amountCents)}`,
    deposit,
    '',
    'Customer:',
    ...(enquiry ? [enquiry.name] : []),
    quote.customerEmail,
    ...(enquiry ? [`Enquiry ${enquiry.reference}`] : []),
    '',
    `Open the quote: ${adminUrl}`,
  ].join('\n')
}

export async function notifyOwnerOfQuoteEvent(
  quoteId: number,
  event: OwnerQuoteEvent
): Promise<void> {
  try {
    const payload = await getPayload()
    const quote = await payload.findByID({
      collection: 'custom-quotes',
      id: quoteId,
      overrideAccess: true,
      depth: 1,
    })
    const { error } = await new Resend(process.env['RESEND_API_KEY'] ?? '').emails.send(
      {
        from: process.env['EMAIL_FROM'] ?? '',
        to: process.env['CONTACT_EMAIL'] ?? '',
        replyTo: quote.customerEmail,
        subject: `${event === 'accepted' ? 'Quote accepted' : 'Deposit paid'} - ${quote.quoteNumber}`,
        text: ownerQuoteEmailText(quote, event),
      },
      { idempotencyKey: `owner-quote-${event}/${quote.id}` }
    )
    if (error) throw new Error(error.message)
  } catch (error) {
    console.error(`Owner quote ${event} email failed:`, error)
  }
}
