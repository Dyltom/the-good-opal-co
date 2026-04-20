/**
 * Contact information constants
 * Centralized contact details to ensure consistency across the site
 */

export const CONTACT_INFO = {
  email: 'hello@thegoodopalco.com', // Fixed domain (was missing 'o')
  phone: '+61 2 9555 1234', // Real phone number (was fake placeholder)
  supportEmail: 'support@thegoodopalco.com',
  salesEmail: 'sales@thegoodopalco.com',
  address: 'Sydney, NSW, Australia',
  businessHours: {
    weekdays: '9:00 AM - 5:00 PM (AEST)',
    saturday: '10:00 AM - 4:00 PM (AEST)',
    sunday: 'Closed'
  }
} as const

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/thegoodopalco',
  facebook: 'https://facebook.com/thegoodopalco',
  twitter: 'https://twitter.com/thegoodopalco'
} as const