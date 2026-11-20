export const CLIENT_INSIGHT_EVENTS = [
  'page_view',
  'product_view',
  'gallery_zoom',
  'gallery_fullscreen',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'checkout_error',
  'search',
  'store_filter',
  'enquiry_submitted',
  'newsletter_signup',
  'js_error',
] as const

export type ClientInsightEvent = (typeof CLIENT_INSIGHT_EVENTS)[number]
export type ServerInsightEvent = 'purchase' | 'checkout_abandoned'

export type InsightDetail = Record<string, string | number | boolean>

export const INSIGHTS_ENDPOINT = '/api/insights'
export const INSIGHTS_VISITOR_METADATA_KEY = 'insightsVisitor'
export const INSIGHTS_RETENTION_DAYS = 400
