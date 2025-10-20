import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  parseRequestBody,
  withErrorHandler,
} from '@/lib/api'
import { createCartCheckoutSession } from '@/lib/stripe'

/**
 * Stripe Cart Checkout Session API
 * Create a checkout session for multiple cart items
 */
async function handleCartCheckout(request: NextRequest) {
  const body = await parseRequestBody<{
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>
    currency?: string
    customerEmail?: string
    shippingAddress?: {
      firstName: string
      lastName: string
      address: string
      city: string
      state: string
      zip: string
    }
  }>(request)

  if (!body) {
    return errorResponse('Invalid request body', 'INVALID_BODY', 400)
  }

  // Validation
  const errors = []
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push({ field: 'items', message: 'Cart items are required' })
  } else {
    body.items.forEach((item, index) => {
      if (!item.id) {
        errors.push({ field: `items[${index}].id`, message: 'Item ID is required' })
      }
      if (!item.name) {
        errors.push({ field: `items[${index}].name`, message: 'Item name is required' })
      }
      if (!item.price || item.price <= 0) {
        errors.push({ field: `items[${index}].price`, message: 'Valid price is required' })
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Valid quantity is required' })
      }
    })
  }

  if (errors.length > 0) {
    return validationErrorResponse(errors)
  }

  try {
    // Get base URL
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'

    // Prepare shipping address if provided
    let shippingAddress
    if (body.shippingAddress) {
      shippingAddress = {
        name: `${body.shippingAddress.firstName} ${body.shippingAddress.lastName}`,
        line1: body.shippingAddress.address,
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        postal_code: body.shippingAddress.zip,
        country: 'US', // Default to US, could be made configurable
      }
    }

    // Create checkout session
    const session = await createCartCheckoutSession({
      items: body.items,
      currency: body.currency || 'usd',
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout`,
      customerEmail: body.customerEmail,
      shippingAddress,
      metadata: {
        itemCount: body.items.length.toString(),
        itemIds: body.items.map((item) => item.id).join(','),
      },
    })

    return successResponse({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe cart checkout error:', error)
    return errorResponse('Failed to create checkout session', 'STRIPE_ERROR', 500)
  }
}

export const POST = withErrorHandler(handleCartCheckout)
