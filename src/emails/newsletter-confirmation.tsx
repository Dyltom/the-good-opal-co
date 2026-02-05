import * as React from 'react'

interface NewsletterConfirmationEmailProps {
  confirmationUrl: string
  email: string
}

export const NewsletterConfirmationEmail: React.FC<NewsletterConfirmationEmailProps> = ({
  confirmationUrl,
  email,
}) => {
  return (
    <html>
      <head />
      <body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f5f5', padding: '20px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#1a1a1a', padding: '30px', textAlign: 'center' }}>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                      The Good Opal Co
                    </h1>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#1a1a1a', textAlign: 'center' }}>
                      Confirm Your Subscription
                    </h2>

                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666666', margin: '0 0 30px 0' }}>
                      Thanks for signing up for our newsletter! We're excited to share exclusive offers,
                      new opal collections, and jewelry care tips with you.
                    </p>

                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666666', margin: '0 0 30px 0' }}>
                      Please confirm your email address ({email}) by clicking the button below:
                    </p>

                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ padding: '20px 0' }}>
                          <a
                            href={confirmationUrl}
                            style={{
                              display: 'inline-block',
                              padding: '16px 32px',
                              backgroundColor: '#7c3aed',
                              color: '#ffffff',
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            Confirm Subscription
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#999999', margin: '30px 0 0 0', textAlign: 'center' }}>
                      If you didn't sign up for our newsletter, you can safely ignore this email.
                    </p>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#999999', margin: '10px 0 0 0', textAlign: 'center' }}>
                      Or copy and paste this link into your browser:
                      <br />
                      <span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{confirmationUrl}</span>
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f8f8f8', padding: '30px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666666' }}>
                      © {new Date().getFullYear()} The Good Opal Co. All rights reserved.
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999999' }}>
                      Sydney, NSW, Australia
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}