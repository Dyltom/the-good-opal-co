'use server'

import { getDiscountManager } from '@/lib/discounts'
import {
  calculateCheckoutPricing,
  calculateCheckoutSubtotal,
  centsToDollars,
  toDiscountContext,
} from '@/lib/checkout-pricing'
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

    const subtotal = calculateCheckoutSubtotal(cart.items)
    const pricing = calculateCheckoutPricing(subtotal)

    const result = await discountManager.applyDiscount(code, {
      ...toDiscountContext(pricing),
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
        subtotal: centsToDollars(result.finalSubtotal),
        shipping: centsToDollars(result.finalShipping),
        discount: centsToDollars(result.discountAmount + result.shippingDiscount),
        tax: 0,
        total: centsToDollars(result.finalTotal)
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
