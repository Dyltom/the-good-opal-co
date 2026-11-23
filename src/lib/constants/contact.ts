/**
 * Contact information constants
 * Centralized contact details to ensure consistency across the site
 */
import 'server-only'
import { PUBLIC_CONTACT_EMAIL } from './social'

const email = process.env.CONTACT_EMAIL?.trim() || PUBLIC_CONTACT_EMAIL

export const CONTACT_INFO = {
  email,
  supportEmail: email,
  salesEmail: email,
  returnsEmail: email,
  shippingEmail: email,
  ordersEmail: email,
  legalEmail: email,
  privacyEmail: email,
  address: 'Cowra, New South Wales, Australia',
} as const
