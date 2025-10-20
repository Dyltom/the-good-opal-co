/**
 * Zod Validation Schemas
 *
 * Type-safe validation schemas using Zod
 * Replaces custom validation functions with industry-standard library
 */

import { z } from 'zod'

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Please enter a valid email address')

/**
 * Phone validation schema
 * Accepts formats: (555) 123-4567, 555-123-4567, 555.123.4567, 5551234567
 */
export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s()+-]+$/,
    'Phone number can only contain numbers, spaces, parentheses, plus and minus signs'
  )
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length >= 10 && val.length <= 15, {
    message: 'Phone number must be between 10 and 15 digits',
  })

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Please enter a valid URL')

/**
 * Slug validation schema
 * Only lowercase letters, numbers, and hyphens
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or less')

/**
 * Subdomain validation schema
 * 3-63 characters, alphanumeric and hyphens only
 */
export const subdomainSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
  .min(3, 'Subdomain must be at least 3 characters')
  .max(63, 'Subdomain must be 63 characters or less')
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
    message: 'Subdomain cannot start or end with a hyphen',
  })

/**
 * Password validation schema
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
})

/**
 * Newsletter subscription schema
 */
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().optional(),
})

/**
 * Product creation schema
 */
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: slugSchema,
  description: z.any(), // Rich text
  price: z.number().min(0, 'Price must be positive'),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  sku: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tenantId: z.string().min(1, 'Tenant ID is required'),
})

/**
 * Tenant creation schema
 */
export const tenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  subdomain: subdomainSchema,
  customDomain: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'suspended']),
})

/**
 * Type inference helpers
 */
export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterData = z.infer<typeof newsletterSchema>
export type ProductData = z.infer<typeof productSchema>
export type TenantData = z.infer<typeof tenantSchema>
