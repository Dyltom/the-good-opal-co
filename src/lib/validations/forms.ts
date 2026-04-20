import { z } from 'zod'

/**
 * Form Validation Schemas
 * Following SOLID principles:
 * - Single Responsibility: Each schema validates one form type
 * - Interface Segregation: Each schema only includes necessary fields
 * - Open/Closed: Can extend schemas without modifying base ones
 */

// Australian phone regex pattern
const AUSTRALIAN_PHONE_REGEX = /^(?:\+?61|0)?4\d{8}$/

// Australian postcode pattern (4 digits)
const AUSTRALIAN_POSTCODE_REGEX = /^\d{4}$/

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(AUSTRALIAN_PHONE_REGEX, 'Please enter a valid Australian mobile number')
    .optional()
    .or(z.literal('')),

  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject must be less than 100 characters'),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),

  // Honeypot field for spam protection
  website: z.string().max(0, 'This field should be empty').optional(),
})

/**
 * Newsletter Signup Schema
 */
export const newsletterSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),

  // Optional preferences
  preferences: z.object({
    newProducts: z.boolean().default(true),
    promotions: z.boolean().default(true),
    courses: z.boolean().default(false),
  }).optional(),
})

/**
 * Checkout Form Schema
 */
export const checkoutFormSchema = z.object({
  // Customer Information
  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(AUSTRALIAN_PHONE_REGEX, 'Please enter a valid Australian mobile number'),

  // Shipping Address
  shippingAddress: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),

    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),

    company: z.string().optional(),

    line1: z.string()
      .min(1, 'Address is required')
      .max(100, 'Address must be less than 100 characters'),

    line2: z.string()
      .max(100, 'Address line 2 must be less than 100 characters')
      .optional(),

    city: z.string()
      .min(1, 'City is required')
      .max(50, 'City must be less than 50 characters'),

    state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'])
      .describe('Please select a valid Australian state'),

    postalCode: z.string()
      .regex(AUSTRALIAN_POSTCODE_REGEX, 'Please enter a valid Australian postcode'),

    country: z.literal('AU').default('AU'),
  }),

  // Billing address same as shipping
  billingSameAsShipping: z.boolean().default(true),

  // Optional billing address (validated only if different from shipping)
  billingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    postalCode: z.string().regex(AUSTRALIAN_POSTCODE_REGEX),
    country: z.literal('AU').default('AU'),
  }).optional(),

  // Additional options
  giftMessage: z.string()
    .max(200, 'Gift message must be less than 200 characters')
    .optional(),

  marketingOptIn: z.boolean().default(false),

  // Terms acceptance
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
})

/**
 * Product Review Schema
 */
export const productReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be between 1 and 5'),

  title: z.string()
    .min(3, 'Review title must be at least 3 characters')
    .max(100, 'Review title must be less than 100 characters'),

  review: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must be less than 500 characters'),

  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  wouldRecommend: z.boolean().optional(),
})

/**
 * Custom Jewelry Request Schema
 */
export const customJewelrySchema = z.object({
  // Contact details
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(AUSTRALIAN_PHONE_REGEX, 'Please enter a valid Australian mobile number'),

  // Project details
  jewelleryType: z.enum(['ring', 'necklace', 'earrings', 'bracelet', 'other'])
      .describe( 'Please select a jewellery type'),

  customType: z.string()
    .max(50, 'Custom type must be less than 50 characters')
    .optional(),

  budget: z.enum(['under-500', '500-1000', '1000-2000', '2000-5000', 'over-5000'])
      .describe( 'Please select a budget range'),

  timeline: z.enum(['asap', '1-month', '2-months', '3-months', 'flexible'])
      .describe( 'Please select a timeline'),

  description: z.string()
    .min(20, 'Please provide more details about your vision (at least 20 characters)')
    .max(1000, 'Description must be less than 1000 characters'),

  // Style preferences
  stylePreferences: z.array(
    z.enum(['classic', 'modern', 'bohemian', 'minimalist', 'vintage', 'bold'])
  ).min(1, 'Please select at least one style preference'),

  // Metal preferences
  metalPreference: z.enum(['silver', 'gold', 'rose-gold', 'white-gold', 'mixed'])
      .describe( 'Please select a metal preference'),

  // Stone preferences
  opalType: z.array(
    z.enum(['black', 'white', 'crystal', 'boulder', 'fire', 'any'])
  ).min(1, 'Please select at least one opal type'),

  // Additional files (handled separately)
  hasInspirationImages: z.boolean().default(false),
})

/**
 * Opal Cutting Course Registration Schema
 */
export const courseRegistrationSchema = z.object({
  // Personal details
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(AUSTRALIAN_PHONE_REGEX, 'Please enter a valid Australian mobile number'),

  // Course selection
  courseType: z.enum(['beginner', 'intermediate', 'advanced', 'weekend-intensive'])
      .describe( 'Please select a course type'),

  preferredStartDate: z.string()
    .min(1, 'Please select a preferred start date'),

  // Experience level
  experienceLevel: z.enum(['none', 'hobby', 'some-professional', 'professional'])
      .describe( 'Please select your experience level'),

  // Additional information
  dietaryRequirements: z.string()
    .max(200, 'Dietary requirements must be less than 200 characters')
    .optional(),

  specialRequirements: z.string()
    .max(500, 'Special requirements must be less than 500 characters')
    .optional(),

  howDidYouHear: z.enum(['search', 'social', 'friend', 'newsletter', 'other'])
      .describe( 'Please select how you heard about us'),

  otherSource: z.string()
    .max(100, 'Source must be less than 100 characters')
    .optional(),

  // Terms and conditions
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),

  acceptCancellationPolicy: z.boolean()
    .refine(val => val === true, {
      message: 'You must accept the cancellation policy',
    }),
})

// Export inferred types for use in components
export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type ProductReviewData = z.infer<typeof productReviewSchema>
export type CustomJewelryData = z.infer<typeof customJewelrySchema>
export type CourseRegistrationData = z.infer<typeof courseRegistrationSchema>