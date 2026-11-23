import { EmailFrame, emailColors, emailText } from './email-frame'

interface NewsletterWelcomeEmailProps {
  name?: string
  unsubscribeUrl: string
  shopUrl: string
  baseUrl: string
  supportEmail: string
}

export function NewsletterWelcomeEmail({
  name,
  unsubscribeUrl,
  shopUrl,
  baseUrl,
  supportEmail,
}: NewsletterWelcomeEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0]

  return (
    <EmailFrame preview="You are on the list for new opals from The Good Opal Co." baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>You are on the list</p>
      <h1 style={emailText.heading}>{firstName ? `Thanks, ${firstName}.` : 'Thanks for joining.'}</h1>
      <p style={emailText.body}>
        We will email you when new opals and pieces are ready, and when we run a sale. That is
        usually once a month, never more than a few times.
      </p>
      <p style={{ margin: '24px 0' }}>
        <a
          href={shopUrl}
          style={{
            backgroundColor: emailColors.ink,
            color: emailColors.paper,
            display: 'inline-block',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            padding: '13px 22px',
            textDecoration: 'none',
          }}
        >
          See what is in the shop
        </a>
      </p>
      <p style={{ ...emailText.small, margin: 0 }}>
        Changed your mind?{' '}
        <a href={unsubscribeUrl} style={{ color: emailColors.muted, textDecoration: 'underline' }}>
          Unsubscribe
        </a>{' '}
        and we will not email you again.
      </p>
    </EmailFrame>
  )
}
