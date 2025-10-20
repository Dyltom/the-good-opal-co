import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  tenantName: string
  name: string
  orderId: string
  total: string
  orderUrl?: string
}

/**
 * Order Confirmation Email Template
 *
 * Sent when order is successfully placed
 */
export default function OrderConfirmationEmail({
  tenantName = 'The Good Opal Co',
  name = 'John Doe',
  orderId = 'ORDER-12345',
  total = '$99.99',
  orderUrl,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Order {orderId} confirmed - Thank you for your purchase!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed!</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            Thank you for your order! We&apos;re thrilled you&apos;ve chosen to add authentic Australian
            opal jewelry to your collection. Your piece is being carefully prepared for shipment.
          </Text>

          <Section style={orderBox}>
            <Text style={orderLabel}>Order Number</Text>
            <Text style={orderValue}>{orderId}</Text>

            <Text style={orderLabel}>Total</Text>
            <Text style={orderTotal}>{total}</Text>
          </Section>

          {orderUrl && (
            <Section style={buttonContainer}>
              <Button style={button} href={orderUrl}>
                View Order Details
              </Button>
            </Section>
          )}

          <Text style={text}>
            We&apos;ll send you another email when your order ships.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Thanks for choosing {tenantName}!
            <br />
            If you have any questions, please reply to this email.
          </Text>

          <Text style={footerSmall}>
            This is an automated confirmation email. Please do not reply to this message.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
}

const h1 = {
  color: '#0099FF',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
  marginBottom: '16px',
}

const orderBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '24px',
  margin: '24px 48px',
}

const orderLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const orderValue = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const orderTotal = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0',
}

const buttonContainer = {
  padding: '24px 48px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#0099FF',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 48px',
}

const footer = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '0 48px',
  marginBottom: '16px',
}

const footerSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  padding: '0 48px',
}
