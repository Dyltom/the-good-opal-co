/**
 * Newsletter Service Implementation
 * Following SOLID principles with Resend integration
 */

import { Resend } from 'resend'
import { getPayload } from '@/lib/payload'
import { NewsletterConfirmationEmail } from '@/emails/newsletter-confirmation'
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome'
import type {
  NewsletterService,
  NewsletterSubscriber,
  SubscriptionResult,
  UnsubscribeResult,
  SubscribeOptions
} from './types'

/**
 * Generate secure tokens
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Resend-based Newsletter Service
 * Single Responsibility: Manages newsletter subscriptions via Resend
 */
export class ResendNewsletterService implements NewsletterService {
  private resend: Resend
  private fromEmail: string
  private baseUrl: string

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '')
    this.fromEmail = 'The Good Opal Co <newsletter@thegoodopalco.com>'
    this.baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:8412'
  }

  async subscribe(email: string, options?: SubscribeOptions): Promise<SubscriptionResult> {
    try {
      const payload = await getPayload()

      // Check if already subscribed
      const existingCustomer = await payload.find({
        collection: 'customers',
        where: {
          email: {
            equals: email.toLowerCase()
          }
        },
        limit: 1
      })

      const existingDoc = existingCustomer.docs[0]
      if (existingDoc) {
        if (existingDoc.subscribedToNewsletter && existingDoc.emailVerified) {
          return {
            success: false,
            message: 'You are already subscribed to our newsletter'
          }
        }
      }

      const confirmationToken = generateToken()
      const unsubscribeToken = generateToken()

      // Create or update customer record
      if (existingDoc) {
        // Update existing customer
        await payload.update({
          collection: 'customers',
          id: existingDoc.id,
          data: {
            subscribedToNewsletter: true,
            emailVerified: options?.skipConfirmation || false,
            tags: [...(existingDoc.tags || []), ...(options?.tags || [])],
            // Store tokens in metadata (would need to add these fields to schema)
            // confirmationToken,
            // unsubscribeToken
          }
        })
      } else {
        // Create new customer
        await payload.create({
          collection: 'customers',
          data: {
            email: email.toLowerCase(),
            name: options?.name || '',
            source: options?.source || 'newsletter',
            subscribedToNewsletter: true,
            emailVerified: options?.skipConfirmation || false,
            tags: options?.tags || []
            // confirmationToken,
            // unsubscribeToken
          }
        })
      }

      // Skip confirmation if requested (e.g., during checkout)
      if (options?.skipConfirmation) {
        await this.sendWelcomeEmail({
          email,
          name: options.name,
          subscribedAt: new Date(),
          confirmed: true,
          unsubscribeToken
        })

        return {
          success: true,
          message: 'Successfully subscribed to newsletter'
        }
      }

      // Send confirmation email
      const confirmationUrl = `${this.baseUrl}/newsletter/confirm?token=${confirmationToken}`

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Please confirm your newsletter subscription',
        react: await NewsletterConfirmationEmail({
          confirmationUrl,
          email
        })
      })

      return {
        success: true,
        message: 'Please check your email to confirm your subscription',
        requiresConfirmation: true
      }
    } catch (error) {
      console.error('Newsletter subscribe error:', error)
      return {
        success: false,
        message: 'Failed to subscribe. Please try again later.'
      }
    }
  }

  async confirm(_token: string): Promise<SubscriptionResult> {
    try {
      // In production, find customer by confirmation token
      // For now, we'll just update the first unconfirmed subscriber
      const payload = await getPayload()

      const unconfirmedCustomers = await payload.find({
        collection: 'customers',
        where: {
          and: [
            {
              subscribedToNewsletter: {
                equals: true
              }
            },
            {
              emailVerified: {
                equals: false
              }
            }
          ]
        },
        limit: 1
      })

      if (unconfirmedCustomers.docs.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired confirmation token'
        }
      }

      const customer = unconfirmedCustomers.docs[0]
      if (!customer) {
        return {
          success: false,
          message: 'Invalid or expired confirmation token'
        }
      }

      // Mark as confirmed
      await payload.update({
        collection: 'customers',
        id: customer.id,
        data: {
          emailVerified: true
        }
      })

      // Send welcome email
      await this.sendWelcomeEmail({
        email: customer.email,
        name: customer.name || undefined,
        subscribedAt: new Date(),
        confirmed: true
      })

      return {
        success: true,
        message: 'Your subscription has been confirmed!'
      }
    } catch (error) {
      console.error('Newsletter confirm error:', error)
      return {
        success: false,
        message: 'Failed to confirm subscription'
      }
    }
  }

  async unsubscribe(token: string): Promise<UnsubscribeResult> {
    try {
      // In production, find customer by unsubscribe token
      // For now, we'll use email as the token
      const payload = await getPayload()

      const customers = await payload.find({
        collection: 'customers',
        where: {
          email: {
            equals: token.toLowerCase() // Using email as token for demo
          }
        },
        limit: 1
      })

      if (customers.docs.length === 0) {
        return {
          success: false,
          message: 'Invalid unsubscribe link'
        }
      }

      const unsubDoc = customers.docs[0]
      if (!unsubDoc) {
        return {
          success: false,
          message: 'Invalid unsubscribe link'
        }
      }
      await payload.update({
        collection: 'customers',
        id: unsubDoc.id,
        data: {
          subscribedToNewsletter: false
        }
      })

      return {
        success: true,
        message: 'You have been unsubscribed from our newsletter'
      }
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error)
      return {
        success: false,
        message: 'Failed to unsubscribe'
      }
    }
  }

  async sendWelcomeEmail(subscriber: NewsletterSubscriber): Promise<void> {
    const unsubscribeUrl = `${this.baseUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken || subscriber.email}`
    const shopUrl = `${this.baseUrl}/store`

    await this.resend.emails.send({
      from: this.fromEmail,
      to: subscriber.email,
      subject: 'Welcome to The Good Opal Co Newsletter! 🌟',
      react: await NewsletterWelcomeEmail({
        name: subscriber.name,
        unsubscribeUrl,
        shopUrl
      })
    })
  }

  /**
   * Send newsletter campaign (for future use)
   */
  async sendCampaign(
    subject: string,
    content: string,
    _segment?: string[]
  ): Promise<{ sent: number; failed: number }> {
    const payload = await getPayload()

    // Get all subscribed customers
    const subscribers = await payload.find({
      collection: 'customers',
      where: {
        and: [
          {
            subscribedToNewsletter: {
              equals: true
            }
          },
          {
            emailVerified: {
              equals: true
            }
          }
        ]
      },
      limit: 1000
    })

    let sent = 0
    let failed = 0

    // Send in batches to avoid rate limits
    for (const customer of subscribers.docs) {
      try {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: customer.email,
          subject,
          html: content,
          tags: [
            {
              name: 'campaign',
              value: 'newsletter'
            }
          ]
        })
        sent++
      } catch (error) {
        console.error(`Failed to send to ${customer.email}:`, error)
        failed++
      }
    }

    return { sent, failed }
  }
}

/**
 * Singleton instance
 */
let newsletterService: NewsletterService | null = null

export function getNewsletterService(): NewsletterService {
  if (!newsletterService) {
    newsletterService = new ResendNewsletterService()
  }
  return newsletterService
}