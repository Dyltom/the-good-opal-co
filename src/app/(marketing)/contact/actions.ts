'use server'

import { Resend } from 'resend'
import { z } from 'zod'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
  orderNumber: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export async function sendContactEmail(data: ContactFormData) {
  try {
    // Validate input
    const validated = contactSchema.parse(data)

    // Send email to support team
    const { error: supportError } = await resend.emails.send({
      from: 'The Good Opal Co <noreply@thegoodpalco.com>',
      to: process.env.CONTACT_EMAIL || 'support@thegoodpalco.com',
      replyTo: validated.email,
      subject: `[Contact Form] ${validated.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${validated.name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${validated.email}</p>
            ${validated.phone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${validated.phone}</p>` : ''}
            ${validated.orderNumber ? `<p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> ${validated.orderNumber}</p>` : ''}
            <p style="margin: 0;"><strong>Subject:</strong> ${validated.subject}</p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Message:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${validated.message}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888;">
            <p>This email was sent from the contact form at thegoodpalco.com</p>
            <p>Submitted on: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</p>
          </div>
        </div>
      `,
    })

    if (supportError) {
      console.error('Failed to send email to support:', supportError)
      return {
        success: false,
        error: 'Failed to send message. Please try again later.',
      }
    }

    // Send confirmation email to customer
    const { error: customerError } = await resend.emails.send({
      from: 'The Good Opal Co <noreply@thegoodpalco.com>',
      to: validated.email,
      subject: 'Thank you for contacting The Good Opal Co',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 30px 0;">
            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">The Good Opal Co</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Australian Opal Specialists</p>
          </div>

          <div style="background-color: #f7f7f7; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Thank You for Contacting Us</h2>

            <p style="color: #666; line-height: 1.6;">
              Dear ${validated.name},
            </p>

            <p style="color: #666; line-height: 1.6;">
              We've received your message and appreciate you taking the time to contact us.
              Our team will review your inquiry and get back to you within 24 hours during business days.
            </p>

            <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a1a; margin-top: 0; font-size: 16px;">Your Message Details:</h3>
              <p style="color: #666; margin: 0 0 5px 0;"><strong>Subject:</strong> ${validated.subject}</p>
              <p style="color: #666; margin: 0;"><strong>Message:</strong></p>
              <p style="color: #666; margin: 10px 0 0 0; padding-left: 20px; border-left: 3px solid #e5e5e5;">
                ${validated.message}
              </p>
            </div>

            <p style="color: #666; line-height: 1.6;">
              In the meantime, you might find these helpful:
            </p>

            <ul style="color: #666; line-height: 1.8;">
              <li><a href="https://thegoodpalco.com/faq" style="color: #0066cc;">Frequently Asked Questions</a></li>
              <li><a href="https://thegoodpalco.com/shipping" style="color: #0066cc;">Shipping Information</a></li>
              <li><a href="https://thegoodpalco.com/returns" style="color: #0066cc;">Returns & Refunds</a></li>
              <li><a href="https://thegoodpalco.com/care-guide" style="color: #0066cc;">Opal Care Guide</a></li>
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
              Sydney, NSW, Australia | +61 2 XXXX XXXX
            </p>
          </div>
        </div>
      `,
    })

    if (customerError) {
      console.error('Failed to send confirmation email:', customerError)
      // Don't fail the whole operation if confirmation email fails
    }

    return { success: true }
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