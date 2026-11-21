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
  'engagement',
  'web_vital',
  'rage_click',
  'checkout_feedback',
] as const

export type ClientInsightEvent = (typeof CLIENT_INSIGHT_EVENTS)[number]
export type ServerInsightEvent = 'purchase' | 'checkout_abandoned' | 'server_error'

export type InsightDetail = Record<string, string | number | boolean>

export const WEB_VITAL_METRICS = ['LCP', 'INP', 'CLS', 'TTFB'] as const
export type WebVitalMetric = (typeof WEB_VITAL_METRICS)[number]

export const PAGE_SECTIONS = ['photos', 'price', 'details'] as const
export type PageSection = (typeof PAGE_SECTIONS)[number]

export const CHECKOUT_FEEDBACK_REASONS = {
  shipping_cost: 'Shipping cost',
  total_price: 'The total price',
  more_photos: 'Wanted more photos or video',
  size_or_quality: 'Unsure about size or quality',
  payment_option: 'Wanted another way to pay',
  just_looking: 'Just looking for now',
  other: 'Something else',
} as const
export type CheckoutFeedbackReason = keyof typeof CHECKOUT_FEEDBACK_REASONS
export const CHECKOUT_FEEDBACK_NOTE_MAX = 280

export const INSIGHTS_ENDPOINT = '/api/insights'
export const INSIGHTS_VISITOR_METADATA_KEY = 'insightsVisitor'
export const INSIGHTS_RETENTION_DAYS = 400
