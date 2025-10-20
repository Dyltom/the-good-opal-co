/**
 * Common utility types used throughout the application
 * These types are reusable and help maintain type safety
 */

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * Make all properties in T required recursively
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

/**
 * Extract keys from T where the value is of type V
 */
export type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]

/**
 * Make specific properties K in T required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Make specific properties K in T optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Extract the type of an array element
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * Make a type nullable
 */
export type Nullable<T> = T | null

/**
 * Make a type possibly undefined
 */
export type Optional<T> = T | undefined

/**
 * Unwrap a Promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Common status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived'

/**
 * Common visibility types
 */
export type Visibility = 'public' | 'private' | 'unlisted'

/**
 * Timestamp fields for database records
 */
export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

/**
 * Soft delete timestamp
 */
export interface SoftDelete {
  deletedAt: Date | null
}

/**
 * Complete audit trail
 */
export interface AuditTrail extends Timestamps, SoftDelete {
  createdBy?: string
  updatedBy?: string
  deletedBy?: string | null
}

/**
 * ID types for different entities
 */
export type ID = string | number

/**
 * Slug type for URL-friendly identifiers
 */
export type Slug = string

/**
 * Image object
 */
export interface Image {
  id: ID
  url: string
  alt: string
  width?: number
  height?: number
  caption?: string
}

/**
 * Link object
 */
export interface Link {
  href: string
  label: string
  external?: boolean
  target?: '_blank' | '_self'
}

/**
 * Social media links
 */
export interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  github?: string
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string
  phone?: string
  address?: Address
}

/**
 * Address structure
 */
export interface Address {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

/**
 * SEO metadata
 */
export interface SEO {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image'
  canonicalUrl?: string
  noindex?: boolean
  nofollow?: boolean
}

/**
 * Form field base type
 */
export interface FormField<T = string> {
  name: string
  label: string
  type: string
  value?: T
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
}

/**
 * Validation error type
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }
