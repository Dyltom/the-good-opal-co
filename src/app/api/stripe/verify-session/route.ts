import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api'
import { getCheckoutSession } from '@/lib/stripe'

/**
 * Verify Stripe Checkout Session API
 * Verify and retrieve details of a completed checkout session
 */
async function handleVerifySession(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return errorResponse('Session ID is required', 'MISSING_SESSION_ID', 400)
  }

  try {
    const session = await getCheckoutSession(sessionId)

    return successResponse({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return errorResponse('Failed to verify session', 'VERIFICATION_ERROR', 500)
  }
}

export const GET = withErrorHandler(handleVerifySession)
