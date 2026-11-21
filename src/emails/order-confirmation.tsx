import { gstIncluded } from '@/lib/checkout-pricing'
import { formatCurrency } from '@/lib/utils'
import { EmailFrame, emailColors, emailText } from './email-frame'

interface OrderItem {
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode?: string
    country: string
  }
  baseUrl: string
  supportEmail: string
  requiresInventoryReview?: boolean
}

const cell = { borderBottom: `1px solid ${emailColors.rule}`, padding: '16px 0', verticalAlign: 'top' } as const
const totalRow = { color: emailColors.muted, fontSize: '15px', padding: '6px 0' } as const

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  baseUrl,
  supportEmail,
  requiresInventoryReview = false,
}: OrderConfirmationEmailProps) {
  const firstName = customerName.trim().split(/\s+/)[0] || 'there'
  const cityLine = [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(' ')
  const nextSteps = [
    requiresInventoryReview
      ? 'We check that your piece is still available, then pack it for dispatch. If anything needs attention, we will email you before it goes.'
      : 'We pack your piece for dispatch.',
    'When it ships, you will get an email with the carrier and tracking number.',
  ]

  return (
    <EmailFrame preview={`Order ${orderNumber} is confirmed.`} baseUrl={baseUrl} supportEmail={supportEmail}>
      <p style={emailText.eyebrow}>{requiresInventoryReview ? 'Payment received' : 'Order confirmed'}</p>
      <h1 style={emailText.heading}>Thank you, {firstName}.</h1>
      <p style={emailText.body}>
        {requiresInventoryReview
          ? 'Your payment has gone through. Before we dispatch, we are checking that every piece in your order is still available.'
          : 'Your order is in and your payment has gone through. Here is what you bought.'}
      </p>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: emailColors.well, margin: '24px 0 28px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '16px 20px' }}>
              <p style={{ ...emailText.eyebrow, margin: '0 0 4px' }}>Order number</p>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '17px', fontWeight: 700, margin: 0, overflowWrap: 'anywhere' }}>{orderNumber}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ borderTop: `1px solid ${emailColors.rule}` }}>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.name}-${index}`}>
              <td width="76" style={cell}>
                {item.image ? (
                  <img src={item.image} alt="" width="64" height="64" style={{ display: 'block', height: '64px', objectFit: 'cover', width: '64px' }} />
                ) : null}
              </td>
              <td style={{ ...cell, paddingRight: '12px' }}>
                <p style={{ fontSize: '16px', lineHeight: 1.4, margin: 0 }}>{item.name}</p>
                {item.quantity > 1 ? <p style={{ ...emailText.small, margin: '4px 0 0' }}>Quantity {item.quantity}</p> : null}
              </td>
              <td align="right" style={{ ...cell, fontSize: '16px', whiteSpace: 'nowrap' }}>
                {formatCurrency(item.price * item.quantity, 'AUD')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ margin: '12px 0 32px' }}>
        <tbody>
          <tr>
            <td style={totalRow}>Subtotal</td>
            <td align="right" style={totalRow}>{formatCurrency(subtotal, 'AUD')}</td>
          </tr>
          <tr>
            <td style={totalRow}>Shipping</td>
            <td align="right" style={totalRow}>{shipping === 0 ? 'Free' : formatCurrency(shipping, 'AUD')}</td>
          </tr>
          <tr>
            <td style={{ borderTop: `1px solid ${emailColors.ink}`, fontSize: '18px', padding: '12px 0 0' }}>Total</td>
            <td align="right" style={{ borderTop: `1px solid ${emailColors.ink}`, fontSize: '18px', padding: '12px 0 0' }}>
              {formatCurrency(total, 'AUD')} AUD
            </td>
          </tr>
          <tr>
            <td colSpan={2} align="right" style={{ ...emailText.small, padding: '6px 0 0' }}>
              Includes GST of {formatCurrency(gstIncluded(total), 'AUD')}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={emailText.subheading}>Sending to</h2>
      <p style={{ ...emailText.body, margin: '0 0 32px' }}>
        {customerName}
        <br />
        {shippingAddress.line1}
        {shippingAddress.line2 ? (
          <>
            <br />
            {shippingAddress.line2}
          </>
        ) : null}
        <br />
        {cityLine}
        <br />
        {shippingAddress.country}
      </p>

      <h2 style={emailText.subheading}>What happens next</h2>
      <ol style={{ ...emailText.body, margin: '0 0 8px', paddingLeft: '20px' }}>
        {nextSteps.map((step) => (
          <li key={step} style={{ marginBottom: '8px' }}>{step}</li>
        ))}
        {baseUrl ? (
          <li>
            You can check on your order at any time on our{' '}
            <a href={`${baseUrl}/order-tracking`} style={{ color: emailColors.link }}>order tracking page</a>{' '}
            with your order number and this email address.
          </li>
        ) : null}
      </ol>
    </EmailFrame>
  )
}
