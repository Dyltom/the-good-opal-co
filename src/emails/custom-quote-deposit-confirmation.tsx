import { formatPrice } from '@/lib/utils'
import { EmailFrame, emailText } from './email-frame'

export function CustomQuoteDepositConfirmationEmail({
  baseUrl,
  depositAmountCents,
  quoteNumber,
  supportEmail,
}: {
  baseUrl: string
  depositAmountCents: number
  quoteNumber: string
  supportEmail: string
}) {
  return (
    <EmailFrame preview={`Deposit received for ${quoteNumber}.`} baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>Deposit received</p>
      <h1 style={emailText.heading}>Your deposit is confirmed</h1>
      <p style={emailText.body}>
        We received <strong>{formatPrice(depositAmountCents)} AUD</strong> for {quoteNumber}. Your
        accepted quote and payment evidence are safely recorded. We&apos;ll contact you with the next
        production update.
      </p>
    </EmailFrame>
  )
}
