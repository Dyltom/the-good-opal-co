'use server'

/**
 * Newsletter Server Actions
 *
 * Handles newsletter subscription with customer creation/update in Payload.
 * Uses Server Actions for form submission.
 */

import { z } from 'zod'
import { getPayload } from '@/lib/payload'

/**
 * Validation schema for newsletter subscription
 */
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Please enter your name').optional(),
})

/**
 * Result type for newsletter actions
 */
interface NewsletterResult {
  success: boolean
  message: string
  error?: string
}

/**
 * Subscribe to newsletter
 *
 * Creates or updates a customer record with newsletter subscription.
 * Handles duplicate emails gracefully.
 */
export async function subscribeToNewsletter(formData: FormData): Promise<NewsletterResult> {
  const rawEmail = formData.get('email')
  const rawName = formData.get('name')

  // Validate input
  const validation = subscribeSchema.safeParse({
    email: rawEmail,
    name: rawName || undefined,
  })

  if (!validation.success) {
    return {
      success: false,
      message: 'Validation failed',
      error: validation.error.issues[0]?.message ?? 'Invalid email address',
    }
  }

  const { email, name } = validation.data

  try {
    const payload = await getPayload()

    // Check if customer already exists
    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: { equals: email.toLowerCase() },
      },
      limit: 1,
    })

    const customer = existingCustomer.docs[0]
    if (customer) {
      // Already subscribed
      if (customer['subscribedToNewsletter']) {
        return {
          success: true,
          message: "You're already subscribed to our newsletter!",
        }
      }

      // Update existing customer to subscribe
      await payload.update({
        collection: 'customers',
        id: customer['id'],
        data: {
          subscribedToNewsletter: true,
          subscribedAt: new Date().toISOString(),
          name: name ?? customer['name'],
        },
      })

      return {
        success: true,
        message: 'Welcome back! You are now subscribed to our newsletter.',
      }
    }

    // Create new customer with newsletter subscription
    await payload.create({
      collection: 'customers',
      data: {
        email: email.toLowerCase(),
        name: name ?? '',
        subscribedToNewsletter: true,
        subscribedAt: new Date().toISOString(),
        source: 'newsletter',
      },
    })

    return {
      success: true,
      message: 'Thank you for subscribing! Check your inbox for a welcome email.',
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)

    return {
      success: false,
      message: 'Subscription failed',
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
}

/**
 * Unsubscribe from newsletter
 *
 * Updates customer record to unsubscribe from newsletter.
 */
export async function unsubscribeFromNewsletter(email: string): Promise<NewsletterResult> {
  const validation = z.string().email().safeParse(email)

  if (!validation.success) {
    return {
      success: false,
      message: 'Invalid email',
      error: 'Please provide a valid email address',
    }
  }

  try {
    const payload = await getPayload()

    const existingCustomer = await payload.find({
      collection: 'customers',
      where: {
        email: { equals: email.toLowerCase() },
      },
      limit: 1,
    })

    if (existingCustomer.docs.length === 0) {
      return {
        success: true,
        message: 'You have been unsubscribed.',
      }
    }

    const customer = existingCustomer.docs[0]
    if (!customer) {
      return {
        success: true,
        message: 'You have been unsubscribed.',
      }
    }

    await payload.update({
      collection: 'customers',
      id: customer['id'],
      data: {
        subscribedToNewsletter: false,
      },
    })

    return {
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
    }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)

    return {
      success: false,
      message: 'Unsubscribe failed',
      error: 'An unexpected error occurred. Please try again later.',
    }
  }
}
