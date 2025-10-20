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

interface NewsletterWelcomeEmailProps {
  tenantName: string
  name?: string
}

/**
 * Newsletter Welcome Email Template
 *
 * Sent when user subscribes to newsletter
 */
export default function NewsletterWelcomeEmail({
  tenantName = 'The Good Opal Co',
  name,
}: NewsletterWelcomeEmailProps) {
  const greeting = name ? `Hi ${name},` : 'Hi there,'

  return (
    <Html>
      <Head />
      <Preview>Welcome to {tenantName} Newsletter!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thanks for Subscribing!</Heading>

          <Text style={text}>{greeting}</Text>

          <Text style={text}>
            You&apos;ve successfully subscribed to the <strong>{tenantName}</strong> newsletter.
          </Text>

          <Text style={text}>
            We&apos;ll keep you updated with our latest opal collections, jewelry care tips,
            exclusive offers, and stories from the Australian outback delivered straight to your inbox.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://thegoodopal.co">
              Shop Opal Jewelry
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Thanks,
            <br />
            The {tenantName} Team
          </Text>

          <Text style={footerSmall}>
            You received this email because you subscribed to our newsletter.
            If you didn&apos;t subscribe, you can safely ignore this email.
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
  color: '#333',
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
