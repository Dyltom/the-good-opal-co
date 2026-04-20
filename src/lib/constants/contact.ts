/**
 * Contact information constants
 * Centralized contact details to ensure consistency across the site
 */

export const CONTACT_INFO = {
  email: 'thegoodopalco@gmail.com', // Main contact email
  phone: '+61 2 9555 1234', // Business phone number
  supportEmail: 'thegoodopalco@gmail.com', // Unified support email
  salesEmail: 'thegoodopalco@gmail.com', // Sales inquiries
  returnsEmail: 'thegoodopalco@gmail.com', // Returns and refunds
  shippingEmail: 'thegoodopalco@gmail.com', // Shipping inquiries
  ordersEmail: 'thegoodopalco@gmail.com', // Order inquiries
  legalEmail: 'thegoodopalco@gmail.com', // Legal matters
  privacyEmail: 'thegoodopalco@gmail.com', // Privacy concerns
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