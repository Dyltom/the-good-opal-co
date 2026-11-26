import type { ReactNode } from 'react'

export const emailColors = {
  page: '#ebe6dd',
  paper: '#f5f2ec',
  ink: '#1c1813',
  muted: '#544c42',
  faint: '#6f665b',
  rule: '#ddd6ca',
  well: '#ebe6dd',
  link: '#1c1813',
} as const

export const emailFont = "'Helvetica Neue', Helvetica, Arial, sans-serif"
export const emailSerif = "Georgia, 'Times New Roman', serif"

export const emailText = {
  eyebrow: {
    color: emailColors.faint,
    fontFamily: emailFont,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.16em',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  heading: { color: emailColors.ink, fontFamily: emailSerif, fontSize: '30px', fontWeight: 400, lineHeight: 1.15, margin: '0 0 16px' },
  subheading: { color: emailColors.ink, fontFamily: emailSerif, fontSize: '20px', fontWeight: 400, margin: '0 0 12px' },
  body: { color: emailColors.ink, fontSize: '16px', lineHeight: 1.6, margin: '0 0 14px' },
  small: { color: emailColors.muted, fontSize: '14px', lineHeight: 1.55, margin: 0 },
} as const

export function EmailButton({ href, children, label }: { href: string; children: ReactNode; label?: string }) {
  return (
    <table cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '24px 0' }}>
      <tbody>
        <tr>
          <td style={{ backgroundColor: emailColors.ink }}>
            <a
              href={href}
              aria-label={label}
              style={{
                color: '#ffffff',
                display: 'inline-block',
                fontFamily: emailFont,
                fontSize: '15px',
                fontWeight: 500,
                lineHeight: 1.2,
                padding: '14px 24px',
                textDecoration: 'none',
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

interface EmailFrameProps {
  preview: string
  baseUrl: string
  supportEmail: string
  children: ReactNode
}

export function EmailFrame({ preview, baseUrl, supportEmail, children }: EmailFrameProps) {
  const footerLink = { color: emailColors.muted, textDecoration: 'underline', marginRight: '14px' }
  const wordmark = { color: emailColors.ink, fontFamily: emailSerif, fontSize: '22px', textDecoration: 'none' }

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
              <td style={{ padding: '4px 4px 18px' }}>
                {baseUrl ? (
                  <table cellPadding="0" cellSpacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td style={{ paddingRight: '12px', verticalAlign: 'middle' }}>
                          <a href={baseUrl}>
                            <img src={`${baseUrl}/logo.png`} alt="The Good Opal Co" width="48" height="48" style={{ borderRadius: '50%', display: 'block' }} />
                          </a>
                        </td>
                        <td style={{ verticalAlign: 'middle' }}>
                          <a href={baseUrl} style={wordmark}>The Good Opal Co</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <span style={wordmark}>The Good Opal Co</span>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: emailColors.paper, border: `1px solid ${emailColors.rule}`, padding: '32px 24px' }}>
                {children}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '22px 4px 8px', fontFamily: emailFont, fontSize: '13px', lineHeight: 1.7, color: emailColors.muted }}>
                {supportEmail ? (
                  <p style={{ margin: '0 0 10px' }}>
                    Questions? Reply to this email or write to{' '}
                    <a href={`mailto:${supportEmail}`} style={{ color: emailColors.muted }}>
                      {supportEmail}
                    </a>
                    .
                  </p>
                ) : null}
                {baseUrl ? (
                  <p style={{ margin: '0 0 10px' }}>
                    <a href={`${baseUrl}/store`} style={footerLink}>Shop</a>
                    <a href={`${baseUrl}/shipping`} style={footerLink}>Shipping</a>
                    <a href={`${baseUrl}/returns`} style={footerLink}>Returns</a>
                    <a href="https://www.instagram.com/goodopalco/" style={{ ...footerLink, marginRight: 0 }}>Instagram</a>
                  </p>
                ) : null}
                <p style={{ margin: 0 }}>The Good Opal Co · Australian opal that doesn&apos;t cost the earth</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
