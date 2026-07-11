/**
 * Contact information constants
 * Centralized contact details to ensure consistency across the site
 */
import 'server-only'

const email = process.env.CONTACT_EMAIL?.trim() || 'thegoodopalco@gmail.com'

export const CONTACT_INFO = {
  email,
  supportEmail: email,
  salesEmail: email,
  returnsEmail: email,
  shippingEmail: email,
  ordersEmail: email,
  legalEmail: email,
  privacyEmail: email,
  address: 'Sydney, NSW, Australia',
} as const
