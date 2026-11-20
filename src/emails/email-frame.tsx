import type { ReactNode } from 'react'

export const emailColors = {
  page: '#F3F1EC',
  paper: '#FAF9F6',
  ink: '#2C2C2C',
  muted: '#625F5A',
  rule: '#E2DDD3',
  well: '#EFEBE3',
  link: '#005A87',
} as const

export const emailFont = "Georgia, 'Times New Roman', serif"

export const emailText = {
  eyebrow: {
    color: emailColors.muted,
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  heading: { color: emailColors.ink, fontSize: '30px', fontWeight: 400, lineHeight: 1.15, margin: '0 0 16px' },
  subheading: { color: emailColors.ink, fontSize: '19px', fontWeight: 400, margin: '0 0 12px' },
  body: { color: emailColors.ink, fontSize: '16px', lineHeight: 1.65, margin: '0 0 14px' },
  small: { color: emailColors.muted, fontSize: '14px', lineHeight: 1.6, margin: 0 },
} as const

interface EmailFrameProps {
  preview: string
  baseUrl: string
  supportEmail: string
  children: ReactNode
}

export function EmailFrame({ preview, baseUrl, supportEmail, children }: EmailFrameProps) {
  const footerLink = { color: emailColors.muted, textDecoration: 'underline', marginRight: '16px' }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ backgroundColor: emailColors.page, color: emailColors.ink, fontFamily: emailFont, margin: 0, padding: '24px 12px' }}>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{preview}</div>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '0 auto', maxWidth: '600px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 4px 20px' }}>
                <a href={baseUrl || undefined} style={{ color: emailColors.ink, fontSize: '22px', textDecoration: 'none' }}>
                  The Good Opal Co
                </a>
                <p style={{ ...emailText.eyebrow, margin: '4px 0 0' }}>Australian opals</p>
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: emailColors.paper, border: `1px solid ${emailColors.rule}`, padding: '36px 32px' }}>
                {children}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '24px 4px 8px', fontFamily: emailFont, fontSize: '13px', lineHeight: 1.7, color: emailColors.muted }}>
                {supportEmail ? (
                  <p style={{ margin: '0 0 10px' }}>
                    Questions? Write to{' '}
                    <a href={`mailto:${supportEmail}`} style={{ color: emailColors.link }}>
                      {supportEmail}
                    </a>
                    .
                  </p>
                ) : null}
                {baseUrl ? (
                  <p style={{ margin: '0 0 10px' }}>
                    <a href={`${baseUrl}/shipping`} style={footerLink}>Shipping</a>
                    <a href={`${baseUrl}/returns`} style={footerLink}>Returns</a>
                    <a href={`${baseUrl}/legal/privacy`} style={{ ...footerLink, marginRight: 0 }}>Privacy</a>
                  </p>
                ) : null}
                <p style={{ margin: 0 }}>The Good Opal Co, Australia</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
