interface ShippingNotificationEmailProps {
  carrier: string
  customerName: string
  orderNumber: string
  supportEmail: string
  trackingNumber: string
}

export function ShippingNotificationEmail({
  carrier,
  customerName,
  orderNumber,
  supportEmail,
  trackingNumber,
}: ShippingNotificationEmailProps) {
  return (
    <html>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head />
      <body
        style={{
          backgroundColor: '#f5f3ee',
          color: '#2c2c2c',
          fontFamily: 'Georgia, serif',
          margin: 0,
          padding: '24px 12px',
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          style={{ margin: '0 auto', maxWidth: '600px' }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: '#171714',
                  color: '#faf9f6',
                  padding: '28px 32px',
                  textAlign: 'center',
                }}
              >
                <h1 style={{ fontSize: '28px', fontWeight: 500, margin: 0 }}>
                  Your opal is on its way
                </h1>
                <p style={{ color: '#d9d9d4', margin: '8px 0 0' }}>The Good Opal Co</p>
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: '#faf9f6', padding: '34px 32px' }}>
                <p style={{ fontSize: '17px', lineHeight: 1.6, margin: '0 0 18px' }}>
                  Hi {customerName}, your order has been dispatched.
                </p>
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  role="presentation"
                  style={{ backgroundColor: '#f0ede6', borderRadius: '8px', margin: '20px 0' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '20px 22px' }}>
                        <p style={{ color: '#6b6966', fontSize: '13px', margin: '0 0 4px' }}>
                          Order
                        </p>
                        <p style={{ fontSize: '17px', margin: '0 0 16px' }}>{orderNumber}</p>
                        <p style={{ color: '#6b6966', fontSize: '13px', margin: '0 0 4px' }}>
                          Carrier
                        </p>
                        <p style={{ fontSize: '17px', margin: '0 0 16px' }}>{carrier}</p>
                        <p style={{ color: '#6b6966', fontSize: '13px', margin: '0 0 4px' }}>
                          Tracking number
                        </p>
                        <p
                          style={{
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '17px',
                            margin: 0,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {trackingNumber}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ color: '#6b6966', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                  Use the tracking number on the carrier&apos;s website. Tracking can take several
                  hours to update after dispatch.
                </p>
                <p
                  style={{
                    color: '#6b6966',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: '22px 0 0',
                  }}
                >
                  Need help? Email{' '}
                  <a href={`mailto:${supportEmail}`} style={{ color: '#005a87' }}>
                    {supportEmail}
                  </a>
                  .
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
