import { EmailButton, EmailFrame, emailColors, emailText } from './email-frame'

interface ShippingNotificationEmailProps {
  baseUrl: string
  carrier: string
  customerName: string
  orderNumber: string
  supportEmail: string
  trackingNumber: string
  trackingUrl: string
}

const label = { ...emailText.eyebrow, margin: '0 0 4px' }
const value = { fontSize: '17px', margin: '0 0 16px' }

export function ShippingNotificationEmail({
  baseUrl,
  carrier,
  customerName,
  orderNumber,
  supportEmail,
  trackingNumber,
  trackingUrl,
}: ShippingNotificationEmailProps) {
  const firstName = customerName.trim().split(/\s+/)[0] || 'there'

  return (
    <EmailFrame preview={`Order ${orderNumber} is on its way with ${carrier}.`} baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>Dispatched</p>
      <h1 style={emailText.heading}>Your opal is on its way, {firstName}.</h1>
      <p style={emailText.body}>Your order has left us. Here are the details to follow it.</p>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: emailColors.well, margin: '24px 0 0' }}>
        <tbody>
          <tr>
            <td style={{ padding: '20px 22px 4px' }}>
              <p style={label}>Order number</p>
              <p style={{ ...value, overflowWrap: 'anywhere' }}>{orderNumber}</p>
              <p style={label}>Carrier</p>
              <p style={value}>{carrier}</p>
              <p style={label}>Tracking number</p>
              <p style={{ ...value, fontWeight: 700, overflowWrap: 'anywhere' }}>{trackingNumber}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <EmailButton href={trackingUrl}>Track your parcel</EmailButton>

      <p style={emailText.body}>
        Tracking can take a few hours to show
        the first scan after dispatch.
      </p>
      {baseUrl ? (
        <p style={{ ...emailText.body, margin: 0 }}>
          You can also see your order status on our{' '}
          <a href={`${baseUrl}/order-tracking`} style={{ color: emailColors.link }}>order tracking page</a>{' '}
          with your order number and this email address.
        </p>
      ) : null}
    </EmailFrame>
  )
}
