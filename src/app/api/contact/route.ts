import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  parseRequestBody,
  withErrorHandler,
} from '@/lib/api'
import { sendContactFormEmail } from '@/lib/email'
import { contactFormSchema } from '@/lib/schemas'
import { rateLimit, getClientIP } from '@/lib/rate-limit'

/**
 * Contact Form Submission API
 */
async function handleContactSubmission(request: NextRequest) {
  // Rate limiting - protect from spam
  const ip = getClientIP(request.headers)
  const rateLimitResult = await rateLimit(ip)

  if (!rateLimitResult.success) {
    return errorResponse(
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
      {
        retryAfter: rateLimitResult.reset,
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
      }
    )
  }

  const body = await parseRequestBody<{
    name: string
    email: string
    phone?: string
    message: string
  }>(request)

  if (!body) {
    return errorResponse('Invalid request body', 'INVALID_BODY', 400)
  }

  // Zod validation - type-safe and comprehensive
  const validation = contactFormSchema.safeParse(body)

  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return validationErrorResponse(errors)
  }

  // TODO: Get tenant from context
  const tenantEmail = process.env['CONTACT_EMAIL'] || 'contact@rapidsites.dev'
  const tenantName = 'Rapid Sites' // TODO: Get from tenant context

  // Use validated data
  const validatedData = validation.data

  try {
    // Send email
    await sendContactFormEmail({
      from: process.env['EMAIL_FROM'] || 'noreply@rapidsites.dev',
      to: tenantEmail,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || undefined,
      message: validatedData.message,
      tenantName,
    })

    // TODO: Save to database (ContactSubmission collection)

    return successResponse({
      message: "Thank you for your message. We'll be in touch soon!",
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return errorResponse('Failed to send message. Please try again.', 'EMAIL_ERROR', 500)
  }
}

export const POST = withErrorHandler(handleContactSubmission)
