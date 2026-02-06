'use server'

import { getDiscountManager } from '@/lib/discounts'
import { fetchCart } from '../cart/actions'

export async function applyDiscountCode(code: string) {
  try {
    const cartResult = await fetchCart()
    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        error: 'Unable to fetch cart'
      }
    }

    const cart = cartResult.data
    const discountManager = getDiscountManager()

    // Calculate current totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Free shipping over $500
    const shipping = subtotal >= 50000 ? 0 : 1500
    const tax = Math.floor(subtotal * 0.1) // 10% GST

    const result = await discountManager.applyDiscount(code, {
      subtotal,
      shipping,
      tax,
      customerId: undefined, // Could pass authenticated user ID here
      currentDate: new Date()
    })

    if (result.error) {
      return {
        success: false,
        error: result.error
      }
    }

    return {
      success: true,
      discount: result.application,
      totals: {
        subtotal: result.finalSubtotal,
        shipping: result.finalShipping,
        discount: result.discountAmount + result.shippingDiscount,
        tax,
        total: result.finalTotal
      }
    }
  } catch (error) {
    console.error('Apply discount error:', error)
    return {
      success: false,
      error: 'Unable to apply discount code'
    }
  }
}

export async function validateDiscountCode(code: string) {
  try {
    const discountManager = getDiscountManager()
    const result = await discountManager.getDiscountInfo(code)

    return {
      success: result.valid,
      description: result.description,
      error: result.error
    }
  } catch (error) {
    console.error('Validate discount error:', error)
    return {
      success: false,
      error: 'Unable to validate discount code'
    }
  }
}