'use server'

/**
 * Newsletter Server Actions
 *
 * Handles newsletter subscription with Resend email integration.
 * Uses Server Actions for form submission.
 */

import { z } from 'zod'
import { getNewsletterService } from '@/lib/newsletter/service'
import { redirect } from 'next/navigation'
import { trackNewsletterSignup } from '@/lib/analytics'

/**
 * Validation schema for newsletter subscription
 */
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1).optional(),
  source: z.enum(['footer', 'popup', 'checkout', 'account']).optional()
})

/**
 * Subscribe to newsletter with email confirmation
 */
export async function subscribeToNewsletter(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const data = subscribeSchema.parse({
      email: formData.get('email'),
      name: formData.get('name') || undefined,
      source: formData.get('source') || 'footer'
    })

    const service = getNewsletterService()
    const result = await service.subscribe(data.email, {
      name: data.name,
      source: data.source
    })

    return {
      success: result.success,
      message: result.message,
      requiresConfirmation: result.requiresConfirmation
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || 'Invalid input'
      }
    }

    return {
      success: false,
      message: 'Something went wrong. Please try again.'
    }
  }
}

/**
 * Confirm newsletter subscription
 */
export async function confirmNewsletterSubscription(token: string) {
  const service = getNewsletterService()
  const result = await service.confirm(token)

  if (result.success) {
    // Track newsletter signup event
    trackNewsletterSignup('email-confirmation')

    redirect('/newsletter/success')
  }

  return result
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(token: string) {
  const service = getNewsletterService()
  return await service.unsubscribe(token)
}
