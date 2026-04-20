import * as React from 'react'
import { formatCurrency } from '@/lib/utils'

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
  tax: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
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
                    <p style={{ color: '#cccccc', margin: '10px 0 0 0', fontSize: '16px' }}>
                      Thank You for Your Order!
                    </p>
                  </td>
                </tr>

                {/* Order Confirmation */}
                <tr>
                  <td style={{ padding: '40px 30px', backgroundColor: '#f8f8f8', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', padding: '15px 30px', backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>Order Number</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {orderNumber}
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Customer Greeting */}
                <tr>
                  <td style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '24px', margin: '0 0 15px 0', color: '#1a1a1a' }}>
                      Dear {customerName},
                    </h2>
                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666666' }}>
                      Thank you for your order! We're excited to prepare your beautiful Australian opals for shipment.
                      Your order has been received and is being processed.
                    </p>
                  </td>
                </tr>

                {/* Order Items */}
                <tr>
                  <td style={{ padding: '0 30px 30px' }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 20px 0', color: '#1a1a1a' }}>
                      Order Details
                    </h3>
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderTop: '1px solid #e0e0e0' }}>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '20px 0', borderBottom: '1px solid #e0e0e0' }}>
                            <table width="100%" cellPadding="0" cellSpacing="0">
                              <tr>
                                <td width="80">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  ) : (
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', borderRadius: '8px' }} />
                                  )}
                                </td>
                                <td style={{ paddingLeft: '20px' }}>
                                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                                    {item.name}
                                  </p>
                                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666666' }}>
                                    Qty: {item.quantity}
                                  </p>
                                </td>
                                <td align="right" style={{ fontSize: '16px', color: '#1a1a1a' }}>
                                  {formatCurrency(item.price * item.quantity, 'AUD')}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      ))}
                    </table>

                    {/* Order Summary */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '20px' }}>
                      <tr>
                        <td style={{ padding: '10px 0', fontSize: '16px', color: '#666666' }}>Subtotal</td>
                        <td align="right" style={{ fontSize: '16px', color: '#666666' }}>
                          {formatCurrency(subtotal, 'AUD')}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0', fontSize: '16px', color: '#666666' }}>Shipping</td>
                        <td align="right" style={{ fontSize: '16px', color: '#666666' }}>
                          {shipping === 0 ? 'FREE' : formatCurrency(shipping, 'AUD')}
                        </td>
                      </tr>
                      {tax > 0 && (
                        <tr>
                          <td style={{ padding: '10px 0', fontSize: '16px', color: '#666666' }}>GST</td>
                          <td align="right" style={{ fontSize: '16px', color: '#666666' }}>
                            {formatCurrency(tax, 'AUD')}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '15px 0 0 0', borderTop: '2px solid #e0e0e0', fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                          Total
                        </td>
                        <td align="right" style={{ padding: '15px 0 0 0', borderTop: '2px solid #e0e0e0', fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                          {formatCurrency(total, 'AUD')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Shipping Address */}
                <tr>
                  <td style={{ padding: '0 30px 30px' }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#1a1a1a' }}>
                      Shipping Address
                    </h3>
                    <div style={{ padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5', color: '#666666' }}>
                        {customerName}<br />
                        {shippingAddress.line1}<br />
                        {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                        {shippingAddress.country}
                      </p>
                    </div>
                  </td>
                </tr>

                {/* What's Next */}
                <tr>
                  <td style={{ padding: '0 30px 30px' }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#1a1a1a' }}>
                      What Happens Next?
                    </h3>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4CAF50', color: '#ffffff', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold' }}>
                            1
                          </div>
                        </td>
                        <td style={{ paddingBottom: '15px' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                            Order Processing
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                            We're carefully preparing your opals for shipment (1-2 business days)
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="40" valign="top">
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2196F3', color: '#ffffff', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold' }}>
                            2
                          </div>
                        </td>
                        <td style={{ paddingBottom: '15px' }}>
                          <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                            Shipping Notification
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                            You'll receive tracking information once your order ships
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td width="40" valign="top">
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#9C27B0', color: '#ffffff', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold' }}>
                            3
                          </div>
                        </td>
                        <td>
                          <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                            Delivery
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                            Your treasures will arrive within 5-7 business days
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Help Section */}
                <tr>
                  <td style={{ backgroundColor: '#f8f8f8', padding: '30px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#1a1a1a' }}>
                      Need Help?
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666666', margin: '0 0 20px 0' }}>
                      Our customer support team is here to assist you with any questions about your order.
                    </p>
                    <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
                      <tr>
                        <td style={{ paddingRight: '15px' }}>
                          <a href="mailto:thegoodopalco@gmail.com" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#1a1a1a', color: '#ffffff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>
                            Email Support
                          </a>
                        </td>
                        <td>
                          <a href="https://thegoodpalco.com/contact" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#ffffff', color: '#1a1a1a', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', border: '1px solid #1a1a1a' }}>
                            Contact Us
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#1a1a1a', padding: '30px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#cccccc' }}>
                      © {new Date().getFullYear()} The Good Opal Co. All rights reserved.
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999999' }}>
                      Sydney, NSW, Australia | +61 2 XXXX XXXX
                    </p>
                    <div style={{ marginTop: '20px' }}>
                      <a href="https://thegoodpalco.com/shipping" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '12px', marginRight: '15px' }}>
                        Shipping Info
                      </a>
                      <a href="https://thegoodpalco.com/returns" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '12px', marginRight: '15px' }}>
                        Returns
                      </a>
                      <a href="https://thegoodpalco.com/legal/privacy" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '12px' }}>
                        Privacy
                      </a>
                    </div>
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