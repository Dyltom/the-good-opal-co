/**
 * Newsletter Types
 * Following Interface Segregation Principle
 */

export interface NewsletterSubscriber {
  email: string
  name?: string
  subscribedAt: Date
  confirmed: boolean
  confirmationToken?: string
  unsubscribeToken?: string
  source?: 'footer' | 'popup' | 'checkout' | 'account'
  tags?: string[]
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
}

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