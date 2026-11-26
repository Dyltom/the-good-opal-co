import { EmailButton, EmailFrame, emailColors, emailText } from './email-frame'

export interface ReviewRequestPiece {
  name: string
  slug?: string | null
}

interface ReviewRequestEmailProps {
  firstName: string
  orderNumber: string
  pieces: ReviewRequestPiece[]
  baseUrl: string
  supportEmail: string
  unsubscribeUrl: string
}

export function reviewReplyHref(supportEmail: string, orderNumber: string): string {
  return `mailto:${supportEmail}?subject=${encodeURIComponent(`About my order ${orderNumber}`)}`
}

export function ReviewRequestEmail({
  firstName,
  orderNumber,
  pieces,
  baseUrl,
  supportEmail,
  unsubscribeUrl,
}: ReviewRequestEmailProps) {
  return (
    <EmailFrame
      preview="How did your opal arrive? I would love to hear."
      baseUrl={baseUrl}
      supportEmail={supportEmail}
    >
      <p style={emailText.eyebrow}>Order {orderNumber}</p>
      <h1 style={emailText.heading}>How did your opal arrive?</h1>
      <p style={emailText.body}>
        {firstName ? `Hi ${firstName}, thank you` : 'Thank you'} for buying from The Good Opal Co.
        Your order should have reached you by now, and I would love to know how it arrived and how
        you are finding it.
      </p>

      <ul style={{ ...emailText.body, margin: '0 0 20px', paddingLeft: '20px' }}>
        {pieces.map((piece, index) => (
          <li key={`${piece.slug ?? piece.name}-${index}`} style={{ marginBottom: '6px' }}>
            {piece.slug ? (
              <a href={`${baseUrl}/store/${piece.slug}`} style={{ color: emailColors.ink }}>
                {piece.name}
              </a>
            ) : (
              piece.name
            )}
          </li>
        ))}
      </ul>

      <p style={emailText.body}>
        If you have a moment, just reply to this email with a few words, and a photo if you like.
        I read every reply myself.
      </p>
      <EmailButton href={reviewReplyHref(supportEmail, orderNumber)}>Reply to Steph</EmailButton>
      <p style={emailText.body}>
        If you are happy for me to share your words on the site, I will only use your first name and
        last initial. If something is not right with your piece, just reply and let me know.
      </p>
      <p style={emailText.body}>Steph</p>

      <p style={{ ...emailText.small, marginTop: '26px' }}>
        You are getting this because you bought from goodopalco.com. Sent by The Good Opal Co, Cowra
        NSW 2794, Australia.{' '}
        <a href={unsubscribeUrl} style={{ color: emailColors.ink }}>
          Unsubscribe
        </a>{' '}
        and we will not email you again.
      </p>
    </EmailFrame>
  )
}
