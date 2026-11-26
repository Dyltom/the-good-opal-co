import { formatCurrency } from '@/lib/utils'
import { EmailFrame, emailColors, emailText } from './email-frame'

export function formatVoucherDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Sydney',
  })
}

interface GiftVoucherEmailProps {
  code: string
  amount: number
  expiresAt: string
  recipientName?: string
  fromName?: string
  message?: string
  baseUrl: string
  supportEmail: string
}

export function GiftVoucherEmail({
  code,
  amount,
  expiresAt,
  recipientName,
  fromName,
  message,
  baseUrl,
  supportEmail,
}: GiftVoucherEmailProps) {
  const firstName = recipientName?.trim().split(/\s+/)[0]
  return (
    <EmailFrame
      preview={`A ${formatCurrency(amount, 'AUD')} gift voucher for The Good Opal Co`}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
    >
      <p style={emailText.eyebrow}>Gift voucher</p>
      <h1 style={emailText.heading}>
        {firstName ? `${firstName}, you have a gift.` : 'You have a gift.'}
      </h1>
      <p style={emailText.body}>
        {fromName ? `${fromName} has sent you` : 'Here is'} a {formatCurrency(amount, 'AUD')} gift voucher
        for The Good Opal Co, to spend on natural Australian opals and opal jewellery.
      </p>
      {message ? (
        <p style={{ ...emailText.body, borderLeft: `2px solid ${emailColors.rule}`, fontStyle: 'italic', paddingLeft: '14px', whiteSpace: 'pre-line' }}>
          {message}
        </p>
      ) : null}

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: emailColors.well, margin: '24px 0 28px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '18px 20px' }}>
              <p style={{ ...emailText.eyebrow, margin: '0 0 4px' }}>Voucher code</p>
              <p style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.08em', margin: '0 0 12px' }}>{code}</p>
              <p style={{ ...emailText.small, margin: 0 }}>
                Value {formatCurrency(amount, 'AUD')} AUD. Valid until {formatVoucherDate(expiresAt)}.
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={emailText.subheading}>How to use it</h2>
      <ol style={{ ...emailText.body, margin: '0 0 8px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '8px' }}>
          Choose your pieces{baseUrl ? (
            <>
              {' '}at <a href={`${baseUrl}/store`} style={{ color: emailColors.link }}>goodopalco.com/store</a>
            </>
          ) : null}{' '}
          and add them to your bag.
        </li>
        <li style={{ marginBottom: '8px' }}>Enter the code in your bag under Gift voucher, then check out.</li>
        <li>
          If your order costs less than the voucher, the rest stays on the code for next time. If it
          costs more, pay the difference by card.
        </li>
      </ol>
    </EmailFrame>
  )
}

interface GiftVoucherPurchaseEmailProps {
  purchaserName: string
  amount: number
  expiresAt: string
  sentTo: string
  recipientName?: string
  baseUrl: string
  supportEmail: string
}

export function GiftVoucherPurchaseEmail({
  purchaserName,
  amount,
  expiresAt,
  sentTo,
  recipientName,
  baseUrl,
  supportEmail,
}: GiftVoucherPurchaseEmailProps) {
  const firstName = purchaserName.trim().split(/\s+/)[0] || 'there'
  return (
    <EmailFrame preview="Your gift voucher is on its way." baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>Gift voucher sent</p>
      <h1 style={emailText.heading}>Thank you, {firstName}.</h1>
      <p style={emailText.body}>
        Your {formatCurrency(amount, 'AUD')} gift voucher has been emailed to {recipientName ? `${recipientName} at ` : ''}
        {sentTo}. It is valid until {formatVoucherDate(expiresAt)}.
      </p>
      <p style={emailText.body}>
        If it does not arrive, or the code is ever lost, reply to this email and we will resend it.
      </p>
    </EmailFrame>
  )
}
