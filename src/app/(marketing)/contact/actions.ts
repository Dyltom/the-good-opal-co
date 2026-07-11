'use server'

import { Resend } from 'resend'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { inquiryLabels } from './contact-intent'
import { contactSchema } from './schema'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getPayload } from '@/lib/payload'
import { ringConfigSchema } from '@/components/custom-builder/config'
import type { RingConfig } from '@/components/custom-builder/config'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export type ContactActionResult =
  | { success: true; reference: string; confirmationDelayed?: boolean }
  | { success: false; error: string }

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function optionalDetail(label: string, value?: string): string {
  if (!value) return ''
  return `<p style="margin: 0 0 10px 0;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`
}

function parseDesignConfiguration(value?: string): RingConfig | undefined {
  if (!value) return undefined

  try {
    const parsed = ringConfigSchema.safeParse(JSON.parse(value))
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown email delivery error'
}

export async function sendContactEmail(data: unknown): Promise<ContactActionResult> {
  try {
    const validated = contactSchema.parse(data)
    const identifier = await getRequestIdentifier(validated.email)
    const allowed = await checkRateLimit({
      scope: 'contact',
      identifier,
      limit: 5,
      windowSeconds: 60 * 60,
    })
    if (!allowed) {
      return { success: false, error: 'Too many messages. Please try again later.' }
    }

    const inquiryLabel = inquiryLabels[validated.inquiryType]
    const designConfiguration = parseDesignConfiguration(validated.designConfiguration)
    if (
      validated.designConfiguration &&
      (!designConfiguration || validated.inquiryType !== 'custom-design')
    ) {
      return {
        success: false,
        error: 'The custom design details are invalid. Please reopen the builder and try again.',
      }
    }
    const safeName = escapeHtml(validated.name)
    const safeEmail = escapeHtml(validated.email)
    const safeMessage = escapeHtml(validated.message)
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
    const reference = `ENQ-${randomBytes(5).toString('hex').toUpperCase()}`
    const payload = await getPayload()
    const enquiry = await payload.create({
      collection: 'enquiries',
      data: {
        reference,
        type: validated.inquiryType,
        status: 'new',
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        orderNumber: validated.orderNumber,
        product: validated.product,
        budget: validated.budget,
        timeline: validated.timeline,
        message: validated.message,
        designConfiguration,
        source: designConfiguration ? 'custom-builder' : 'website-contact',
        submittedAt: new Date().toISOString(),
      },
    })

    let ownerEmailSentAt: string | undefined
    let customerEmailSentAt: string | undefined
    const deliveryErrors: string[] = []

    // Send email to support team
    let supportError: { message: string } | null = null
    try {
      const result = await resend.emails.send({
        from: process.env['EMAIL_FROM'] ?? 'The Good Opal Co <onboarding@resend.dev>',
        to: process.env.CONTACT_EMAIL || 'thegoodopalco@gmail.com',
        replyTo: validated.email,
        subject: `[${reference}] ${inquiryLabel}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin: 0 0 10px 0;"><strong>Inquiry:</strong> ${inquiryLabel}</p>
            <p style="margin: 0 0 10px 0;"><strong>Reference:</strong> ${reference}</p>
            ${optionalDetail('Phone', validated.phone)}
            ${optionalDetail('Order number', validated.orderNumber)}
            ${optionalDetail('Product or piece', validated.product)}
            ${optionalDetail('Budget', validated.budget)}
            ${optionalDetail('Timeline', validated.timeline)}
            ${optionalDetail('Design configuration', designConfiguration ? JSON.stringify(designConfiguration) : undefined)}
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888;">
            <p>This email was sent from the website contact form.</p>
            <p>Submitted on: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
          </div>
        </div>
      `,
      })
      supportError = result.error
    } catch (emailError) {
      supportError = { message: errorMessage(emailError) }
    }

    if (supportError) {
      console.error('Failed to send email to support:', supportError)
      deliveryErrors.push(`Owner email: ${supportError.message}`)
    } else {
      ownerEmailSentAt = new Date().toISOString()
    }

    // Send confirmation email to customer
    let customerError: { message: string } | null = null
    try {
      const result = await resend.emails.send({
        from: process.env['EMAIL_FROM'] ?? 'The Good Opal Co <onboarding@resend.dev>',
        to: validated.email,
        subject: `${reference}: We received your enquiry`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 30px 0;">
            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">The Good Opal Co</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Australian Opal Specialists</p>
          </div>

          <div style="background-color: #f7f7f7; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Thank You for Contacting Us</h2>
            <p style="color: #666; line-height: 1.6;"><strong>Your reference:</strong> ${reference}</p>

            <p style="color: #666; line-height: 1.6;">
              Dear ${safeName},
            </p>

            <p style="color: #666; line-height: 1.6;">
              We&apos;ve received your ${inquiryLabel.toLowerCase()} inquiry. We&apos;ll review the details and reply by email.
            </p>

            <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a1a; margin-top: 0; font-size: 16px;">Your Message Details:</h3>
              <p style="color: #666; margin: 0 0 5px 0;"><strong>Inquiry:</strong> ${inquiryLabel}</p>
              <p style="color: #666; margin: 0;"><strong>Message:</strong></p>
              <p style="color: #666; margin: 10px 0 0 0; padding-left: 20px; border-left: 3px solid #e5e5e5;">
                ${safeMessage}
              </p>
            </div>

            <p style="color: #666; line-height: 1.6;">
              In the meantime, you might find these helpful:
            </p>

            <ul style="color: #666; line-height: 1.8;">
              <li><a href="${baseUrl}/faq" style="color: #0066cc;">Frequently Asked Questions</a></li>
              <li><a href="${baseUrl}/shipping" style="color: #0066cc;">Shipping Information</a></li>
              <li><a href="${baseUrl}/returns" style="color: #0066cc;">Returns & Refunds</a></li>
            </ul>

            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              The Good Opal Co Team
            </p>
          </div>

          <div style="text-align: center; padding: 30px 0; font-size: 12px; color: #888;">
            <p style="margin: 0 0 10px 0;">
              © ${new Date().getFullYear()} The Good Opal Co. All rights reserved.
            </p>
            <p style="margin: 0;">
              Australia
            </p>
          </div>
        </div>
      `,
      })
      customerError = result.error
    } catch (emailError) {
      customerError = { message: errorMessage(emailError) }
    }

    if (customerError) {
      console.error('Failed to send confirmation email:', customerError)
      deliveryErrors.push(`Customer email: ${customerError.message}`)
    } else {
      customerEmailSentAt = new Date().toISOString()
    }

    try {
      await payload.update({
        collection: 'enquiries',
        id: enquiry.id,
        data: {
          ownerEmailSentAt,
          customerEmailSentAt,
          emailDeliveryError: deliveryErrors.length > 0 ? deliveryErrors.join('\n') : undefined,
        },
      })
    } catch (updateError) {
      console.error(`Failed to update email delivery state for ${reference}:`, updateError)
    }

    return {
      success: true,
      reference,
      confirmationDelayed: deliveryErrors.length > 0 || undefined,
    }
  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid form data. Please check your input.',
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
}
