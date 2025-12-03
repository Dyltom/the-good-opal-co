'use server'

/**
 * Checkout Server Actions
 *
 * Handles Stripe checkout session creation.
 * Uses Server Actions instead of API routes for cleaner architecture.
 */

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { z } from 'zod'
import { getCart } from '@/lib/cart'

// Initialize Stripe
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] ?? '', {
  apiVersion: '2025-09-30.clover',
})

// Validation schema for checkout form
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

/**
 * Result type for checkout action
 */
interface CheckoutResult {
  success: boolean
  error?: string
  url?: string
}

/**
 * Create a Stripe Checkout Session
 *
 * @param formData - Form data containing customer email and name
 * @returns Result with checkout URL or error
 */
export async function createCheckoutSession(formData: FormData): Promise<CheckoutResult> {
  // Get cart from cookies
  const cart = await getCart()

  if (cart.items.length === 0) {
    return {
      success: false,
      error: 'Your cart is empty. Please add items before checking out.',
    }
  }

  // Validate form data
  const validationResult = checkoutSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  })

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message ?? 'Invalid form data',
    }
  }

  const { email, name } = validationResult.data

  // Check if Stripe is configured
  if (!process.env['STRIPE_SECRET_KEY']) {
    return {
      success: false,
      error: 'Payment processing is not configured. Please contact support.',
    }
  }

  try {
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
              slug: item.slug,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ['AU', 'NZ', 'US', 'GB', 'CA', 'SG', 'HK', 'JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: cart.total >= 500 ? 0 : 1500, // Free shipping over $500
              currency: 'aud',
            },
            display_name: cart.total >= 500 ? 'Free Express Shipping' : 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      metadata: {
        cartItems: JSON.stringify(cart.items),
        customerName: name,
      },
      success_url: `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/cart`,
    })

    // Return the URL for client-side redirect
    if (session.url) {
      return {
        success: true,
        url: session.url,
      }
    }

    return {
      success: false,
      error: 'Failed to create checkout session. Please try again.',
    }
  } catch (error) {
    console.error('Stripe checkout error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Create checkout and redirect
 *
 * Alternative action that redirects directly instead of returning URL
 */
export async function createCheckoutAndRedirect(formData: FormData): Promise<void> {
  const result = await createCheckoutSession(formData)

  if (result.success && result.url) {
    redirect(result.url)
  }

  // If there's an error, we can't redirect, so throw an error
  // The form should handle this with useActionState
  throw new Error(result.error ?? 'Failed to create checkout session')
}
