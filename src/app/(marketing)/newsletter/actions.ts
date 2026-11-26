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
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { ALERT_TAG_PREFIX } from '@/lib/newsletter/types'
import { STORE_CATEGORIES } from '@/app/(marketing)/store/store-query'

const ALERT_CATEGORIES = STORE_CATEGORIES.map(([value]) => value) as [string, ...string[]]

const CHECK_EMAIL = 'Check your email and tap the link to confirm. Your 10% code arrives as soon as you do.'

/**
 * Validation schema for newsletter subscription
 */
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1).optional(),
  source: z.enum(['footer', 'popup', 'checkout', 'account']).optional(),
  alert: z.enum(ALERT_CATEGORIES).optional()
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
      source: formData.get('source') || 'footer',
      alert: formData.get('alert') || undefined
    })

    if (formData.get('website') || formData.get('js') !== '1') {
      return { success: true, message: CHECK_EMAIL, requiresConfirmation: true }
    }

    const hour = 60 * 60
    const allowed =
      (await checkRateLimit({
        scope: 'newsletter',
        identifier: await getRequestIdentifier(data.email),
        limit: 5,
        windowSeconds: hour,
      })) &&
      (await checkRateLimit({
        scope: 'newsletter-address',
        identifier: await getRequestIdentifier(),
        limit: 3,
        windowSeconds: hour,
      })) &&
      (await checkRateLimit({
        scope: 'newsletter-sitewide',
        identifier: 'all',
        limit: 10,
        windowSeconds: hour,
      }))
    if (!allowed) {
      return { success: false, message: 'Too many attempts. Please try again later.' }
    }

    const service = getNewsletterService()
    const result = await service.subscribe(data.email, {
      name: data.name,
      source: data.source,
      tags: data.alert ? [ALERT_TAG_PREFIX + data.alert] : undefined
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

export async function submitNewsletterUnsubscribe(token: string, _formData: FormData) {
  const result = await unsubscribeFromNewsletter(token)
  const status = result.success ? 'success' : 'invalid'
  redirect(`/newsletter/unsubscribe?status=${status}`)
}
