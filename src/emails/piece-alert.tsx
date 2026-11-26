import { formatCurrency } from '@/lib/utils'
import { EmailButton, EmailFrame, emailColors, emailText } from './email-frame'

export interface PieceAlertLine {
  name: string
  slug: string
  price: number
  image?: string
}

interface PieceAlertEmailProps {
  heading: string
  pieces: PieceAlertLine[]
  baseUrl: string
  supportEmail: string
  unsubscribeUrl: string
}

export function PieceAlertEmail({ heading, pieces, baseUrl, supportEmail, unsubscribeUrl }: PieceAlertEmailProps) {
  return (
    <EmailFrame preview={`${heading} at The Good Opal Co.`} baseUrl={baseUrl} supportEmail={supportEmail}>
      <h1 style={emailText.heading}>{heading}</h1>
      <p style={emailText.body}>
        You asked me to let you know when a piece like the one you saw came in. {pieces.length > 1 ? 'These are' : 'This one is'} new
        in the shop. Every piece is one of a kind, so once it sells it is gone.
      </p>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '20px 0 24px' }}>
        <tbody>
          {pieces.map((piece) => {
            const url = `${baseUrl}/store/${piece.slug}`
            return (
              <tr key={piece.slug}>
                <td style={{ borderTop: `1px solid ${emailColors.rule}`, padding: '12px 14px 12px 0', width: '88px' }}>
                  {piece.image ? (
                    <a href={url}>
                      <img src={piece.image} alt={piece.name} width="88" height="88" style={{ display: 'block', objectFit: 'cover' }} />
                    </a>
                  ) : null}
                </td>
                <td style={{ borderTop: `1px solid ${emailColors.rule}`, padding: '12px 0', verticalAlign: 'middle' }}>
                  <a href={url} style={{ color: emailColors.ink, fontSize: '16px', textDecoration: 'none' }}>
                    {piece.name}
                  </a>
                  <p style={{ ...emailText.small, margin: '4px 0 0' }}>{formatCurrency(piece.price, 'AUD')}</p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <EmailButton href={`${baseUrl}/store/${pieces[0]?.slug ?? ''}`}>{pieces.length > 1 ? 'See the first one' : 'See the piece'}</EmailButton>
      <p style={emailText.body}>Questions about a stone? Reply to this email and I will help.</p>

      <p style={{ ...emailText.small, marginTop: '26px' }}>
        You asked on a sold piece at goodopalco.com to hear when a similar one is listed. Sent by The Good Opal Co, Cowra NSW
        2794, Australia.{' '}
        <a href={unsubscribeUrl} style={{ color: emailColors.ink }}>
          Unsubscribe
        </a>{' '}
        and we will not email you again.
      </p>
    </EmailFrame>
  )
}
