/**
 * Analytics event helpers
 * Convenience functions for tracking common e-commerce events
 */

import type { CartItem } from '@/lib/cart'
import { captureInsight } from '@/lib/insights/client'
import { getAnalyticsService } from './service'
import type {
  ProductViewEvent,
  AddToCartEvent,
  RemoveFromCartEvent,
  BeginCheckoutEvent,
  PurchaseEvent,
  SearchEvent,
  ViewSearchResultsEvent,
  NewsletterSignupEvent,
  ShareEvent
} from './types'

const CURRENCY = 'AUD'

interface AnalyticsProduct {
  id: string
  name?: string
  category?: string
  price?: number
}

/**
 * Convert product to analytics item format
 * Single Responsibility: Only handles data transformation
 */
function productToAnalyticsItem(
  product: AnalyticsProduct,
  quantity = 1,
  variant?: string
) {
  return {
    item_id: product.id,
    item_name: product.name || 'Unknown Product',
    item_category: product.category,
    item_variant: variant,
    price: product.price || 0,
    quantity
  }
}

/**
 * Convert cart item to analytics format
 */
function cartItemToAnalyticsItem(item: CartItem) {
  return {
    item_id: item.productId,
    item_name: item.name || 'Unknown Product',
    item_category: undefined,
    item_variant: undefined,
    price: item.price || 0,
    quantity: item.quantity
  }
}

/**
 * Track product view
 */
export function trackProductView(product: AnalyticsProduct) {
  const analytics = getAnalyticsService()

  const event: ProductViewEvent = {
    eventName: 'view_item',
    parameters: {
      currency: CURRENCY,
      value: product.price || 0,
      items: [productToAnalyticsItem(product)]
    }
  }

  analytics.trackEvent(event)
  captureInsight('product_view', { productId: product.id, value: product.price })
}

/**
 * Track add to cart
 */
export function trackAddToCart(
  product: AnalyticsProduct,
  quantity: number,
  variant?: string
) {
  const analytics = getAnalyticsService()

  const event: AddToCartEvent = {
    eventName: 'add_to_cart',
    parameters: {
      currency: CURRENCY,
      value: (product.price || 0) * quantity,
      items: [productToAnalyticsItem(product, quantity, variant)]
    }
  }

  analytics.trackEvent(event)
  captureInsight('add_to_cart', {
    productId: product.id,
    value: event.parameters.value,
    detail: { quantity },
  })
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(item: CartItem) {
  const analytics = getAnalyticsService()

  const event: RemoveFromCartEvent = {
    eventName: 'remove_from_cart',
    parameters: {
      currency: CURRENCY,
      value: (item.price || 0) * item.quantity,
      items: [cartItemToAnalyticsItem(item)]
    }
  }

  analytics.trackEvent(event)
  captureInsight('remove_from_cart', {
    productId: item.productId,
    value: event.parameters.value,
    detail: { quantity: item.quantity },
  })
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(items: CartItem[], total: number) {
  const analytics = getAnalyticsService()

  const event: BeginCheckoutEvent = {
    eventName: 'begin_checkout',
    parameters: {
      currency: CURRENCY,
      value: total,
      items: items.map(cartItemToAnalyticsItem)
    }
  }

  analytics.trackEvent(event)
  captureInsight('begin_checkout', { value: total, detail: { items: items.length } })
}

export function trackCheckoutError(message: string) {
  captureInsight('checkout_error', { detail: { message: message.slice(0, 300) } })
}

/**
 * Track purchase completion
 */
export function trackPurchase(
  transactionId: string,
  items: CartItem[],
  total: number,
  shipping = 0,
  tax = 0
) {
  const analytics = getAnalyticsService()

  const event: PurchaseEvent = {
    eventName: 'purchase',
    parameters: {
      currency: CURRENCY,
      value: total,
      transaction_id: transactionId,
      shipping,
      tax,
      items: items.map(cartItemToAnalyticsItem)
    }
  }

  analytics.trackEvent(event)
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultCount: number) {
  const analytics = getAnalyticsService()

  const event: SearchEvent = {
    eventName: 'search',
    parameters: {
      search_term: searchTerm
    }
  }

  analytics.trackEvent(event)
  captureInsight('search', {
    detail: { term: searchTerm.trim().toLowerCase().slice(0, 100), results: resultCount },
  })
}

export function trackStoreFilter(filters: Record<string, string>, results: number) {
  captureInsight('store_filter', { detail: { ...filters, results } })
}

/**
 * Track view search results
 */
export function trackViewSearchResults(searchTerm: string) {
  const analytics = getAnalyticsService()

  const event: ViewSearchResultsEvent = {
    eventName: 'view_search_results',
    parameters: {
      search_term: searchTerm
    }
  }

  analytics.trackEvent(event)
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string) {
  const analytics = getAnalyticsService()

  const event: NewsletterSignupEvent = {
    eventName: 'sign_up',
    parameters: {
      method: 'email',
      source
    }
  }

  analytics.trackEvent(event)
  captureInsight('newsletter_signup', { detail: { source } })
}

export function trackEnquirySubmitted(inquiryType: string) {
  getAnalyticsService().trackEvent({
    eventName: 'generate_lead',
    parameters: { lead_type: inquiryType },
  })
  captureInsight('enquiry_submitted', { detail: { type: inquiryType } })
}

export function trackGalleryZoom(productName: string) {
  captureInsight('gallery_zoom', { detail: { product: productName.slice(0, 120) } })
}

export function trackGalleryFullscreen(productName: string) {
  captureInsight('gallery_fullscreen', { detail: { product: productName.slice(0, 120) } })
}

export function trackClientError(message: string, source?: string) {
  captureInsight('js_error', {
    detail: source
      ? { message: message.slice(0, 300), source: source.slice(0, 300) }
      : { message: message.slice(0, 300) },
  })
}

/**
 * Track social share
 */
export function trackShare(
  contentType: string,
  itemId: string,
  method: string
) {
  const analytics = getAnalyticsService()

  const event: ShareEvent = {
    eventName: 'share',
    parameters: {
      content_type: contentType,
      item_id: itemId,
      method
    }
  }

  analytics.trackEvent(event)
}
