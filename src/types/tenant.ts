/**
 * Multi-tenancy types for the Rapid Sites platform
 * These types handle tenant identification, configuration, and scoping
 */

import type { AuditTrail, ContactInfo, ID, SocialLinks, Status } from './common'

/**
 * Tenant identification and configuration
 */
export interface Tenant extends AuditTrail {
  id: ID
  name: string
  slug: string
  domain?: string | null
  subdomain: string
  status: Status

  // Business information
  businessName: string
  description?: string | null
  logo?: string | null
  favicon?: string | null

  // Contact information
  contact?: ContactInfo

  // Social media
  social?: SocialLinks

  // Configuration
  config: TenantConfig
  theme: TenantTheme

  // Subscription/billing (future)
  plan?: SubscriptionPlan
  planExpiresAt?: Date | null
}

/**
 * Tenant configuration options
 */
export interface TenantConfig {
  // Features
  features: TenantFeatures

  // SEO settings
  seo: {
    defaultTitle?: string
    defaultDescription?: string
    googleAnalyticsId?: string
    googleTagManagerId?: string
  }

  // Email settings
  email: {
    fromName?: string
    fromEmail?: string
    replyTo?: string
  }

  // Booking settings (if enabled)
  booking?: {
    enabled: boolean
    calcomUrl?: string
    defaultDuration?: number
  }

  // Localization
  locale: {
    language: string
    timezone: string
    currency?: string
    dateFormat?: string
  }
}

/**
 * Feature flags for tenants
 */
export interface TenantFeatures {
  blog: boolean
  booking: boolean
  testimonials: boolean
  team: boolean
  gallery: boolean
  ecommerce: boolean
  contactForm: boolean
  newsletter: boolean
}

/**
 * Tenant theme configuration
 */
export interface TenantTheme {
  // Colors (CSS custom properties)
  colors: {
    primary: string
    secondary?: string
    accent?: string
    background: string
    foreground: string
    muted?: string
    border?: string
  }

  // Typography
  fonts: {
    heading?: string
    body?: string
  }

  // Layout
  layout: {
    containerMaxWidth?: string
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }

  // Custom CSS
  customCss?: string
}

/**
 * Subscription plan types
 */
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise'

/**
 * Tenant context for request handling
 */
export interface TenantContext {
  tenant: Tenant
  isSubdomain: boolean
  isCustomDomain: boolean
  hostname: string
}

/**
 * Tenant creation input
 */
export type CreateTenantInput = Pick<
  Tenant,
  'name' | 'subdomain' | 'businessName' | 'description'
> & {
  owner: {
    email: string
    name: string
    password: string
  }
}

/**
 * Tenant update input
 */
export type UpdateTenantInput = Partial<
  Pick<Tenant, 'name' | 'businessName' | 'description' | 'logo' | 'favicon' | 'contact' | 'social'>
>

/**
 * Tenant theme update input
 */
export type UpdateTenantThemeInput = Partial<TenantTheme>

/**
 * Tenant config update input
 */
export type UpdateTenantConfigInput = Partial<TenantConfig>

/**
 * Tenant resolution result
 */
export type TenantResolution =
  | { found: true; tenant: Tenant; context: TenantContext }
  | { found: false; error: string }
