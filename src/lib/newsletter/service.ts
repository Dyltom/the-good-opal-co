/**
 * Newsletter Service Implementation
 * Following SOLID principles with Resend integration
 */

import { Resend } from 'resend'
import { createHash, randomBytes } from 'node:crypto'
import { getPayload } from '@/lib/payload'
import { NewsletterConfirmationEmail } from '@/emails/newsletter-confirmation'
import { NewsletterWelcomeEmail } from '@/emails/newsletter-welcome'
import {
  createCampaignUnsubscribeToken,
  readCampaignUnsubscribeToken,
} from './campaign-unsubscribe-token'
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
  return randomBytes(32).toString('base64url')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function requireEmailConfig(): {
  apiKey: string
  fromEmail: string
  baseUrl: string
  tokenSecret: string
} {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromEmail = process.env.EMAIL_FROM?.trim()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  const tokenSecret = process.env.PAYLOAD_SECRET?.trim()

  if (!apiKey || !fromEmail || !baseUrl || !tokenSecret) {
    throw new Error(
      'RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL, and PAYLOAD_SECRET are required'
    )
  }

  return { apiKey, fromEmail, baseUrl, tokenSecret }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function hasRequestedSegment(
  tags: Array<{ tag?: string | null }> | null | undefined,
  segments: readonly string[]
): boolean {
  if (segments.length === 0) return true
  const customerTags = new Set(tags?.map(({ tag }) => tag).filter(Boolean))
  return segments.some((segment) => customerTags.has(segment))
}

/**
 * Resend-based Newsletter Service
 * Single Responsibility: Manages newsletter subscriptions via Resend
 */
export class ResendNewsletterService implements NewsletterService {
  private resend: Resend
  private fromEmail: string
  private baseUrl: string
  private tokenSecret: string

  constructor() {
    const config = requireEmailConfig()
    this.resend = new Resend(config.apiKey)
    this.fromEmail = config.fromEmail
    this.baseUrl = config.baseUrl
    this.tokenSecret = config.tokenSecret
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
      const confirmationTokenHash = hashToken(confirmationToken)
      const confirmationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const unsubscribeTokenHash = hashToken(unsubscribeToken)
      const optionTags = options?.tags ?? []
      const subscribedAt = new Date().toISOString()

      // Create or update customer record
      if (existingDoc) {
        const tags = Array.from(
          new Set([
            ...(existingDoc.tags ?? []).map(({ tag }) => tag),
            ...optionTags,
          ].filter((tag): tag is string => Boolean(tag)))
        ).map((tag) => ({ tag }))

        // Update existing customer
        await payload.update({
          collection: 'customers',
          id: existingDoc.id,
          data: {
            subscribedToNewsletter: true,
            subscribedAt,
            emailVerified: options?.skipConfirmation || false,
            tags,
            confirmationTokenHash: options?.skipConfirmation ? null : confirmationTokenHash,
            confirmationExpiresAt: options?.skipConfirmation ? null : confirmationExpiresAt,
            unsubscribeTokenHash,
          }
        })
      } else {
        // Create new customer
        await payload.create({
          collection: 'customers',
          data: {
            email: email.toLowerCase(),
            name: options?.name || '',
            source: options?.source === 'checkout' ? 'checkout' : 'newsletter',
            subscribedToNewsletter: true,
            subscribedAt,
            emailVerified: options?.skipConfirmation || false,
            tags: optionTags.map((tag) => ({ tag })),
            confirmationTokenHash: options?.skipConfirmation ? undefined : confirmationTokenHash,
            confirmationExpiresAt: options?.skipConfirmation ? undefined : confirmationExpiresAt,
            unsubscribeTokenHash,
          }
        })
      }

      // Skip confirmation if requested (e.g., during checkout)
      if (options?.skipConfirmation) {
        const customerId = existingDoc?.id ?? (
          await payload.find({
            collection: 'customers',
            where: { email: { equals: email.toLowerCase() } },
            limit: 1,
          })
        ).docs[0]?.id

        try {
          await this.sendWelcomeEmail({
            email,
            name: options.name,
            subscribedAt: new Date(),
            confirmed: true,
            unsubscribeToken
          })
          if (customerId) {
            await payload.update({
              collection: 'customers',
              id: customerId,
              data: { newsletterWelcomeSentAt: new Date().toISOString(), newsletterEmailError: null },
            })
          }
        } catch (error) {
          if (customerId) {
            await payload.update({
              collection: 'customers',
              id: customerId,
              data: {
                newsletterEmailError:
                  error instanceof Error ? error.message.slice(0, 1000) : 'Welcome email failed',
              },
            })
          }
          return {
            success: true,
            message: 'Subscribed successfully. The welcome email may be delayed.',
          }
        }

        return {
          success: true,
          message: 'Successfully subscribed to newsletter'
        }
      }

      // Send confirmation email
      const confirmationUrl = `${this.baseUrl}/newsletter/confirm?token=${confirmationToken}`

      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Please confirm your newsletter subscription',
        react: await NewsletterConfirmationEmail({
          confirmationUrl,
          email
        })
      })

      if (error) {
        const failedCustomer = await payload.find({
          collection: 'customers',
          where: { email: { equals: email.toLowerCase() } },
          limit: 1,
        })
        if (failedCustomer.docs[0]) {
          await payload.update({
            collection: 'customers',
            id: failedCustomer.docs[0].id,
            data: { newsletterEmailError: error.message.slice(0, 1000) },
          })
        }
        throw new Error(`Resend rejected newsletter confirmation: ${error.message}`)
      }

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

  async confirm(token: string): Promise<SubscriptionResult> {
    try {
      const payload = await getPayload()
      const tokenHash = hashToken(token)

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
            },
            {
              confirmationTokenHash: {
                equals: tokenHash
              }
            },
            {
              confirmationExpiresAt: {
                greater_than: new Date().toISOString()
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

      const unsubscribeToken = generateToken()

      // Consume the single-use confirmation token and issue an unsubscribe token.
      await payload.update({
        collection: 'customers',
        id: customer.id,
        data: {
          emailVerified: true,
          confirmationTokenHash: null,
          confirmationExpiresAt: null,
          unsubscribeTokenHash: hashToken(unsubscribeToken),
        }
      })

      try {
        await this.sendWelcomeEmail({
          email: customer.email,
          name: customer.name || undefined,
          subscribedAt: new Date(),
          confirmed: true,
          unsubscribeToken,
        })
        await payload.update({
          collection: 'customers',
          id: customer.id,
          data: { newsletterWelcomeSentAt: new Date().toISOString(), newsletterEmailError: null },
        })
      } catch (error) {
        await payload.update({
          collection: 'customers',
          id: customer.id,
          data: {
            newsletterEmailError:
              error instanceof Error ? error.message.slice(0, 1000) : 'Welcome email failed',
          },
        })
        return {
          success: true,
          message: 'Your subscription is confirmed. The welcome email may be delayed.',
        }
      }

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
      const payload = await getPayload()

      const signedCustomerId = readCampaignUnsubscribeToken(token, this.tokenSecret)
      if (signedCustomerId) {
        const customer = await payload.findByID({
          collection: 'customers',
          id: signedCustomerId,
        })

        if (!customer.subscribedToNewsletter) {
          return {
            success: true,
            message: 'You have been unsubscribed from our newsletter'
          }
        }

        await payload.update({
          collection: 'customers',
          id: customer.id,
          data: {
            subscribedToNewsletter: false,
            unsubscribeTokenHash: null,
          }
        })

        return {
          success: true,
          message: 'You have been unsubscribed from our newsletter'
        }
      }

      const customers = await payload.find({
        collection: 'customers',
        where: {
          unsubscribeTokenHash: {
            equals: hashToken(token)
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
          subscribedToNewsletter: false,
          unsubscribeTokenHash: null,
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
    if (!subscriber.unsubscribeToken) {
      throw new Error('An unsubscribe token is required for newsletter email delivery')
    }

    const unsubscribeUrl = `${this.baseUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`
    const shopUrl = `${this.baseUrl}/store`

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: subscriber.email,
      subject: 'Welcome to The Good Opal Co Newsletter! 🌟',
      react: await NewsletterWelcomeEmail({
        name: subscriber.name,
        unsubscribeUrl,
        shopUrl
      })
    })

    if (error) throw new Error(`Resend rejected newsletter welcome email: ${error.message}`)
  }

  async sendCampaign(
    subject: string,
    content: string,
    segment: string[] = []
  ): Promise<{ sent: number; failed: number }> {
    const payload = await getPayload()
    let sent = 0
    let failed = 0
    let page = 1
    let totalPages = 1

    do {
      const subscribers = await payload.find({
        collection: 'customers',
        where: {
          and: [
            { subscribedToNewsletter: { equals: true } },
            { emailVerified: { equals: true } },
          ]
        },
        limit: 100,
        page,
      })
      totalPages = subscribers.totalPages

      for (const customer of subscribers.docs) {
        if (!hasRequestedSegment(customer.tags, segment)) continue

        const unsubscribeToken = createCampaignUnsubscribeToken(customer.id, this.tokenSecret)
        const unsubscribeUrl = `${this.baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
        const campaignHtml = `${content}
          <hr style="margin:32px 0 20px;border:0;border-top:1px solid #ddd" />
          <p style="font-size:12px;line-height:1.5;color:#666">
            Sent by The Good Opal Co. Contact ${escapeHtml(this.fromEmail)}.<br />
            <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a> from marketing emails.
          </p>`

        try {
          const { error } = await this.resend.emails.send({
            from: this.fromEmail,
            to: customer.email,
            subject,
            html: campaignHtml,
            tags: [{ name: 'campaign', value: 'newsletter' }]
          })

          if (error) {
            failed++
            console.error(`Resend rejected campaign email to ${customer.email}: ${error.message}`)
          } else {
            sent++
          }
        } catch (error) {
          console.error(`Failed to send to ${customer.email}:`, error)
          failed++
        }
      }

      page++
    } while (page <= totalPages)

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
