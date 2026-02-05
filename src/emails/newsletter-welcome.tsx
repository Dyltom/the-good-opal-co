import * as React from 'react'

interface NewsletterWelcomeEmailProps {
  name?: string
  unsubscribeUrl: string
  shopUrl: string
  couponCode?: string
}

export const NewsletterWelcomeEmail: React.FC<NewsletterWelcomeEmailProps> = ({
  name,
  unsubscribeUrl,
  shopUrl,
  couponCode = 'WELCOME10',
}) => {
  return (
    <html>
      <head />
      <body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f5f5f5', padding: '20px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header with gradient */}
                <tr>
                  <td style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                    padding: '40px 30px',
                    textAlign: 'center'
                  }}>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                      Welcome to The Good Opal Co! ✨
                    </h1>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#1a1a1a' }}>
                      {name ? `Hi ${name}!` : 'Hello Opal Lover!'}
                    </h2>

                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666666', margin: '0 0 20px 0' }}>
                      Welcome to our exclusive newsletter! You're now part of a community that appreciates
                      the natural beauty of Australian opals.
                    </p>

                    {/* Welcome Offer */}
                    <div style={{
                      backgroundColor: '#f3e8ff',
                      border: '2px dashed #7c3aed',
                      borderRadius: '8px',
                      padding: '24px',
                      margin: '30px 0',
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        Here's your welcome gift!
                      </p>
                      <p style={{ margin: '0 0 20px 0', fontSize: '36px', fontWeight: 'bold', color: '#7c3aed' }}>
                        {couponCode}
                      </p>
                      <p style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#666666' }}>
                        Get 10% off your first purchase
                      </p>
                      <a
                        href={shopUrl}
                        style={{
                          display: 'inline-block',
                          padding: '12px 24px',
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        Shop Now
                      </a>
                    </div>

                    {/* What to Expect */}
                    <h3 style={{ fontSize: '18px', margin: '30px 0 15px 0', color: '#1a1a1a' }}>
                      What to expect from us:
                    </h3>
                    <ul style={{ margin: '0 0 30px 0', paddingLeft: '20px', color: '#666666', lineHeight: '1.8' }}>
                      <li>Exclusive subscriber-only offers and early access</li>
                      <li>New opal collection announcements</li>
                      <li>Jewelry care tips and styling guides</li>
                      <li>Behind-the-scenes stories from Australian opal mines</li>
                    </ul>

                    {/* Social Links */}
                    <div style={{ textAlign: 'center', margin: '40px 0' }}>
                      <p style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#666666' }}>
                        Follow us for daily opal inspiration:
                      </p>
                      <div>
                        <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#7c3aed', textDecoration: 'none' }}>
                          Instagram
                        </a>
                        <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#7c3aed', textDecoration: 'none' }}>
                          Facebook
                        </a>
                        <a href="#" style={{ display: 'inline-block', margin: '0 10px', color: '#7c3aed', textDecoration: 'none' }}>
                          Pinterest
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f8f8f8', padding: '30px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999999' }}>
                      You're receiving this email because you subscribed to our newsletter.
                    </p>
                    <a
                      href={unsubscribeUrl}
                      style={{ fontSize: '12px', color: '#999999', textDecoration: 'underline' }}
                    >
                      Unsubscribe
                    </a>
                    <p style={{ margin: '20px 0 0 0', fontSize: '12px', color: '#999999' }}>
                      © {new Date().getFullYear()} The Good Opal Co • Sydney, NSW, Australia
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