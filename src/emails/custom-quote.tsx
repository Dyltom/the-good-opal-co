import { formatPrice } from '@/lib/utils'
import { EmailButton, EmailFrame, emailColors, emailText } from './email-frame'

export interface CustomQuoteEmailProps {
  baseUrl: string
  customerName: string
  depositAmountCents: number
  quoteNumber: string
  quoteUrl: string
  revision: number
  supportEmail: string
  totalAmountCents: number
  validUntil: string
}

const label = { ...emailText.eyebrow, margin: '0 0 4px' }

export function CustomQuoteEmail({
  baseUrl,
  customerName,
  depositAmountCents,
  quoteNumber,
  quoteUrl,
  revision,
  supportEmail,
  totalAmountCents,
  validUntil,
}: CustomQuoteEmailProps) {
  const revisionLabel = revision > 1 ? ` · Revision ${revision}` : ''

  return (
    <EmailFrame
      preview={`Review your personal quote from The Good Opal Co before ${validUntil}.`}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
    >
      <p style={emailText.eyebrow}>
        {quoteNumber}
        {revisionLabel}
      </p>
      <h1 style={emailText.heading}>Your custom quote is ready</h1>
      <p style={emailText.body}>Hi {customerName},</p>
      <p style={emailText.body}>
        We&apos;ve prepared the details for your one-of-a-kind piece. Review the design, pricing,
        deposit and terms before deciding whether to accept. Custom work, including its deposit, is
        not eligible for change-of-mind returns.
      </p>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: emailColors.well, margin: '24px 0 0' }}>
        <tbody>
          <tr>
            <td style={{ padding: '18px 20px 8px' }}>
              <p style={label}>Quoted total</p>
              <p style={{ fontSize: '22px', margin: 0 }}>{formatPrice(totalAmountCents)} AUD</p>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 20px 18px' }}>
              <p style={label}>Deposit after acceptance</p>
              <p style={{ fontSize: '17px', margin: 0 }}>
                {depositAmountCents > 0 ? `${formatPrice(depositAmountCents)} AUD` : 'No deposit required'}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <EmailButton href={quoteUrl} label={`Review custom quote ${quoteNumber}`}>
        Review your quote
      </EmailButton>

      <p style={emailText.small}>
        Valid until <strong>{validUntil}</strong>. Opening the quote does not accept it or take payment.
      </p>
      <p style={{ ...emailText.small, marginTop: '16px', overflowWrap: 'anywhere' }}>
        Button not working? Copy this secure link into your browser:
        <br />
        <a href={quoteUrl} style={{ color: emailColors.muted }}>
          {quoteUrl}
        </a>
      </p>
    </EmailFrame>
  )
}

export default CustomQuoteEmail
