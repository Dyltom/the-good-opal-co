import { Resend } from 'resend'
import { CustomQuoteDepositConfirmationEmail } from '@/emails/custom-quote-deposit-confirmation'
import { getPayload } from '@/lib/payload'

export async function sendQuoteDepositConfirmation(quoteId: number): Promise<void> {
  const payload = await getPayload()
  const quote = await payload.findByID({
    collection: 'custom-quotes',
    id: quoteId,
    overrideAccess: true,
    depth: 0,
  })
  if (quote.depositConfirmationEmailSentAt) return
  if (
    quote.depositStatus !== 'paid' ||
    !quote.stripeCheckoutSessionId ||
    quote.amountPaidCents !== quote.depositAmountCents
  ) {
    throw new Error('Deposit confirmation requires exact paid quote evidence')
  }

  const resend = new Resend(process.env['RESEND_API_KEY'] ?? '')
  const { data, error } = await resend.emails.send(
    {
      from: process.env['EMAIL_FROM'] ?? '',
      to: quote.customerEmail,
      subject: `Deposit confirmed – ${quote.quoteNumber}`,
      react: CustomQuoteDepositConfirmationEmail({
        depositAmountCents: quote.depositAmountCents,
        quoteNumber: quote.quoteNumber,
        supportEmail: process.env['CONTACT_EMAIL'] ?? '',
      }),
    },
    { idempotencyKey: `custom-quote-deposit/${quote.id}/${quote.stripeCheckoutSessionId}` }
  )

  if (error || !data?.id) {
    await payload.update({
      collection: 'custom-quotes',
      id: quote.id,
      overrideAccess: true,
      context: { stripeQuoteDepositReconciliation: true },
      data: { depositConfirmationEmailError: error?.message ?? 'Missing provider ID' },
    })
    throw new Error(`Deposit confirmation email failed: ${error?.message ?? 'missing provider ID'}`)
  }

  await payload.update({
    collection: 'custom-quotes',
    id: quote.id,
    overrideAccess: true,
    context: { stripeQuoteDepositReconciliation: true },
    data: {
      depositConfirmationEmailSentAt: new Date().toISOString(),
      depositConfirmationEmailProviderId: data.id,
      depositConfirmationEmailError: null,
    },
  })
}
