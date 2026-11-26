import { EmailButton, EmailFrame, emailColors, emailText } from './email-frame'
import { WELCOME_OFFER, type WelcomeCode } from '@/lib/welcome-offer'

interface NewsletterWelcomeEmailProps {
  name?: string
  unsubscribeUrl: string
  shopUrl: string
  baseUrl: string
  supportEmail: string
  welcomeCode?: WelcomeCode | undefined
}

export function NewsletterWelcomeEmail({
  name,
  unsubscribeUrl,
  shopUrl,
  baseUrl,
  supportEmail,
  welcomeCode,
}: NewsletterWelcomeEmailProps) {
  const firstName = name?.trim().split(/\s+/)[0]

  return (
    <EmailFrame preview={
        welcomeCode
          ? `Your ${WELCOME_OFFER.percentOff}% welcome code is inside.`
          : 'You are on the list for new opals from The Good Opal Co.'
      } baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>You are on the list</p>
      <h1 style={emailText.heading}>{firstName ? `Thanks, ${firstName}.` : 'Thanks for joining.'}</h1>
      <p style={emailText.body}>
        We will email you when new opals and pieces are ready, and when we run a sale. That is
        usually once a month, never more than a few times.
      </p>
      {welcomeCode ? (
        <div style={{ border: `1px solid ${emailColors.rule}`, margin: '24px 0 0', padding: '18px 20px' }}>
          <p style={{ ...emailText.small, margin: '0 0 6px' }}>Your welcome code, {WELCOME_OFFER.percentOff}% off one order</p>
          <p
            style={{
              color: emailColors.ink,
              fontFamily: 'Menlo, Consolas, monospace',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}
          >
            {welcomeCode.code}
          </p>
          <p style={{ ...emailText.small, margin: 0 }}>
            Enter it under &quot;Add promotion code&quot; at checkout. Use it once by{' '}
            {welcomeCode.expiresAt.toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Australia/Sydney',
            })}
            . It can&apos;t be combined with sale prices or gift vouchers, and it doesn&apos;t apply to custom
            jewellery deposits.
          </p>
        </div>
      ) : null}
      <EmailButton href={shopUrl}>See what is in the shop</EmailButton>
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
