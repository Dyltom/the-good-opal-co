import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  parseRequestBody,
  withErrorHandler,
} from '@/lib/api'
import { sendNewsletterConfirmation } from '@/lib/email'
import { isValidEmail } from '@/lib/validation'

/**
 * Newsletter Subscription API
 */
async function handleNewsletterSubscription(request: NextRequest) {
  const body = await parseRequestBody<{
    email: string
    name?: string
  }>(request)

  if (!body) {
    return errorResponse('Invalid request body', 'INVALID_BODY', 400)
  }

  // Validation
  if (!body.email || !isValidEmail(body.email)) {
    return validationErrorResponse([{ field: 'email', message: 'Valid email is required' }])
  }

  // TODO: Get tenant from context
  const tenantName = 'Rapid Sites'

  try {
    // TODO: Save to Newsletter collection in database

    // Send confirmation email
    await sendNewsletterConfirmation({
      from: process.env['EMAIL_FROM'] || 'noreply@rapidsites.dev',
      to: body.email,
      name: body.name,
      tenantName,
    })

    return successResponse({
      message: 'Successfully subscribed! Check your email for confirmation.',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return errorResponse('Failed to subscribe. Please try again.', 'SUBSCRIPTION_ERROR', 500)
  }
}

export const POST = withErrorHandler(handleNewsletterSubscription)
