'use server'

import { z } from 'zod'
import { getPayload } from '@/lib/payload'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'

const trackingSchema = z.object({
  orderNumber: z.string().trim().min(12).max(80),
  email: z.string().trim().email('Valid email is required').max(254)
})

export async function trackOrder(_prevState: unknown, formData: FormData) {
  try {
    const data = trackingSchema.parse({
      orderNumber: formData.get('orderNumber'),
      email: formData.get('email')
    })
    const identifier = await getRequestIdentifier(data.email)
    const allowed = await checkRateLimit({
      scope: 'order-tracking',
      identifier,
      limit: 10,
      windowSeconds: 15 * 60,
    })
    if (!allowed) {
      return { error: 'Too many attempts. Please try again later.', order: null }
    }

    const payload = await getPayload()

    // Find order by number and email
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          {
            orderNumber: {
              equals: data.orderNumber.toUpperCase()
            }
          },
          {
            'customer.email': {
              equals: data.email.toLowerCase()
            }
          }
        ]
      },
      limit: 1
    })

    if (orders.docs.length === 0) {
      return {
        error: 'No order found with these details. Please check your order number and email.',
        order: null
      }
    }

    const order = orders.docs[0]!

    // Return sanitized order data
    return {
      error: null,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        total: order.total,
        shippingDestination: {
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
        },
        trackingNumber: order.trackingNumber || null,
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Please enter a valid order number and email address.',
        order: null
      }
    }

    console.error('Order tracking error:', error)
    return {
      error: 'Unable to track order at this time. Please try again later.',
      order: null
    }
  }
}
