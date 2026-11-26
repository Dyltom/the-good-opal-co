import type { WelcomeCode } from '@/lib/welcome-offer'

export interface NewsletterSubscriber {
  email: string
  name?: string
  subscribedAt: Date
  confirmed: boolean
  confirmationToken?: string
  unsubscribeToken?: string
  source?: 'footer' | 'popup' | 'checkout' | 'account'
  tags?: string[]
  welcomeCode?: WelcomeCode | undefined
}

export interface SubscriptionResult {
  success: boolean
  message: string
  requiresConfirmation?: boolean
}

export interface UnsubscribeResult {
  success: boolean
  message: string
}

export interface NewsletterService {
  subscribe(email: string, options?: SubscribeOptions): Promise<SubscriptionResult>
  confirm(token: string): Promise<SubscriptionResult>
  unsubscribe(token: string): Promise<UnsubscribeResult>
  sendWelcomeEmail(subscriber: NewsletterSubscriber): Promise<void>
  sendCampaign(
    subject: string,
    content: string,
    segment?: string[]
  ): Promise<{ sent: number; failed: number }>
}

export const ALERT_TAG_PREFIX = 'alert:'

export interface SubscribeOptions {
  name?: string
  source?: NewsletterSubscriber['source']
  tags?: string[]
  skipConfirmation?: boolean
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}
