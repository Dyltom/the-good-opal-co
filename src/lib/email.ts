/**
 * Email Service
 * Send transactional emails via Resend with React Email templates
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { ContactFormEmail, NewsletterWelcomeEmail, OrderConfirmationEmail } from '@/emails'

/**
 * Lazy-loaded Resend client to avoid build-time errors when API key is missing
 */
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env['RESEND_API_KEY']
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

/**
 * Send contact form email
 * @param params - Email parameters
 */
export async function sendContactFormEmail(params: {
  from: string
  to: string
  name: string
  email: string
  phone?: string
  message: string
  tenantName: string
}) {
  const resend = getResendClient()

  const emailHtml = await render(
    ContactFormEmail({
      tenantName: params.tenantName,
      name: params.name,
      email: params.email,
      phone: params.phone,
      message: params.message,
    })
  )

  const { data, error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: `New Contact Form Submission from ${params.tenantName}`,
    html: emailHtml,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

/**
 * Send newsletter confirmation email
 * @param params - Email parameters
 */
export async function sendNewsletterConfirmation(params: {
  from: string
  to: string
  name?: string
  tenantName: string
}) {
  const resend = getResendClient()

  const emailHtml = await render(
    NewsletterWelcomeEmail({
      tenantName: params.tenantName,
      name: params.name,
    })
  )

  const { data, error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: `Welcome to ${params.tenantName} Newsletter`,
    html: emailHtml,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

/**
 * Send order confirmation email
 * @param params - Email parameters
 */
export async function sendOrderConfirmation(params: {
  from: string
  to: string
  name: string
  orderId: string
  total: string
  tenantName: string
  orderUrl?: string
}) {
  const resend = getResendClient()

  const emailHtml = await render(
    OrderConfirmationEmail({
      tenantName: params.tenantName,
      name: params.name,
      orderId: params.orderId,
      total: params.total,
      orderUrl: params.orderUrl,
    })
  )

  const { data, error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: `Order Confirmation - ${params.orderId}`,
    html: emailHtml,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}
