import { EmailFrame, emailColors, emailText } from './email-frame'

interface NewsletterConfirmationEmailProps {
  confirmationUrl: string
  email: string
  baseUrl: string
  supportEmail: string
}

export function NewsletterConfirmationEmail({
  confirmationUrl,
  email,
  baseUrl,
  supportEmail,
}: NewsletterConfirmationEmailProps) {
  return (
    <EmailFrame preview="One click to confirm your email." baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>Confirm your email</p>
      <h1 style={emailText.heading}>One click and you are on the list.</h1>
      <p style={emailText.body}>
        Confirm that {email} should get our emails about new opals, new pieces and sales.
      </p>
      <p style={{ margin: '24px 0' }}>
        <a
          href={confirmationUrl}
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
          Confirm my email
        </a>
      </p>
      <p style={emailText.small}>
        The link works for 24 hours. If you did not sign up, ignore this email and you will not hear
        from us.
      </p>
      <p style={{ ...emailText.small, marginTop: '12px', overflowWrap: 'anywhere' }}>
        If the button does not work, paste this into your browser: {confirmationUrl}
      </p>
    </EmailFrame>
  )
}
