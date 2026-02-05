/**
 * Google Analytics 4 types
 * Type definitions for analytics tracking
 */

export interface AnalyticsEvent {
  eventName: string
  parameters?: Record<string, unknown>
}

export interface ProductViewEvent extends AnalyticsEvent {
  eventName: 'view_item'
  parameters: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      item_category?: string
      item_variant?: string
      price: number
      quantity?: number
    }>
  }
}

export interface AddToCartEvent extends AnalyticsEvent {
  eventName: 'add_to_cart'
  parameters: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      item_category?: string
      item_variant?: string
      price: number
      quantity: number
    }>
  }
}

export interface RemoveFromCartEvent extends AnalyticsEvent {
  eventName: 'remove_from_cart'
  parameters: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      item_category?: string
      item_variant?: string
      price: number
      quantity: number
    }>
  }
}

export interface BeginCheckoutEvent extends AnalyticsEvent {
  eventName: 'begin_checkout'
  parameters: {
    currency: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      item_category?: string
      item_variant?: string
      price: number
      quantity: number
    }>
  }
}

export interface PurchaseEvent extends AnalyticsEvent {
  eventName: 'purchase'
  parameters: {
    currency: string
    value: number
    transaction_id: string
    shipping?: number
    tax?: number
    items: Array<{
      item_id: string
      item_name: string
      item_category?: string
      item_variant?: string
      price: number
      quantity: number
    }>
  }
}

export interface SearchEvent extends AnalyticsEvent {
  eventName: 'search'
  parameters: {
    search_term: string
  }
}

export interface ViewSearchResultsEvent extends AnalyticsEvent {
  eventName: 'view_search_results'
  parameters: {
    search_term: string
  }
}

export interface NewsletterSignupEvent extends AnalyticsEvent {
  eventName: 'sign_up'
  parameters: {
    method: 'email'
    source: string
  }
}

export interface ShareEvent extends AnalyticsEvent {
  eventName: 'share'
  parameters: {
    content_type: string
    item_id: string
    method: string
  }
}

export type GtmEvent =
  | ProductViewEvent
  | AddToCartEvent
  | RemoveFromCartEvent
  | BeginCheckoutEvent
  | PurchaseEvent
  | SearchEvent
  | ViewSearchResultsEvent
  | NewsletterSignupEvent
  | ShareEvent
  | AnalyticsEvent

export interface AnalyticsService {
  trackEvent(event: GtmEvent): void
  pageView(path: string): void
}