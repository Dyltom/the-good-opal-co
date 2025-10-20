import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ContactFormEmailProps {
  tenantName: string
  name: string
  email: string
  phone?: string
  message: string
}

/**
 * Contact Form Email Template
 *
 * Sent to business owner when customer submits contact form
 */
export default function ContactFormEmail({
  tenantName = 'The Good Opal Co',
  name = 'John Doe',
  email = 'john@example.com',
  phone,
  message = 'This is a test message.',
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Form Submission</Heading>
          <Text style={text}>
            You received a new message from <strong>{tenantName}</strong> contact form:
          </Text>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>From:</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Email:</Text>
            <Text style={value}>
              <a href={`mailto:${email}`} style={link}>
                {email}
              </a>
            </Text>
          </Section>

          {phone && (
            <Section style={section}>
              <Text style={label}>Phone:</Text>
              <Text style={value}>
                <a href={`tel:${phone}`} style={link}>
                  {phone}
                </a>
              </Text>
            </Section>
          )}

          <Section style={section}>
            <Text style={label}>Message:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent from your {tenantName} website contact form.
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
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const section = {
  padding: '0 48px',
  marginBottom: '16px',
}

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
  margin: '0 0 4px',
}

const value = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const messageText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  borderLeft: '4px solid #0099FF',
}

const link = {
  color: '#0099FF',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  padding: '0 48px',
}
