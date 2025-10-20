import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  parseRequestBody,
  withErrorHandler,
} from '@/lib/api'
import { createCheckoutSession } from '@/lib/stripe'

/**
 * Stripe Checkout Session API
 * Create a checkout session for product purchase
 */
async function handleCheckout(request: NextRequest) {
  const body = await parseRequestBody<{
    productId: string
    productName: string
    price: number
    currency?: string
  }>(request)

  if (!body) {
    return errorResponse('Invalid request body', 'INVALID_BODY', 400)
  }

  // Validation
  const errors = []
  if (!body.productId) {
    errors.push({ field: 'productId', message: 'Product ID is required' })
  }
  if (!body.productName) {
    errors.push({ field: 'productName', message: 'Product name is required' })
  }
  if (!body.price || body.price <= 0) {
    errors.push({ field: 'price', message: 'Valid price is required' })
  }

  if (errors.length > 0) {
    return validationErrorResponse(errors)
  }

  try {
    // Get base URL
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'

    // Create checkout session
    const session = await createCheckoutSession({
      productId: body.productId,
      productName: body.productName,
      price: body.price,
      currency: body.currency || 'usd',
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/products/${body.productId}`,
      metadata: {
        productId: body.productId,
      },
    })

    return successResponse({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return errorResponse('Failed to create checkout session', 'STRIPE_ERROR', 500)
  }
}

export const POST = withErrorHandler(handleCheckout)
