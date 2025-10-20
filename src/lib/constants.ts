/**
 * Application-wide constants
 * Centralized constants help maintain consistency and make updates easier
 */

import type { TenantFeatures } from '@/types'

/**
 * Application name and branding
 */
export const APP_NAME = 'Rapid Sites' as const
export const APP_DESCRIPTION =
  'Multi-tenant website framework for small businesses' as const
export const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'

/**
 * API versioning
 */
export const API_VERSION = 'v1' as const
export const API_BASE_URL = `/api/${API_VERSION}` as const

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 10 as const
export const MAX_PAGE_SIZE = 100 as const
export const DEFAULT_PAGE = 1 as const

/**
 * Date and time formats
 */
export const DATE_FORMAT = 'MMM d, yyyy' as const
export const TIME_FORMAT = 'h:mm a' as const
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a' as const
export const ISO_DATE_FORMAT = 'yyyy-MM-dd' as const

/**
 * Localization defaults
 */
export const DEFAULT_LOCALE = 'en-US' as const
export const DEFAULT_TIMEZONE = 'America/New_York' as const
export const DEFAULT_CURRENCY = 'USD' as const

/**
 * SEO defaults
 */
export const DEFAULT_SEO = {
  titleTemplate: '%s | Rapid Sites',
  defaultTitle: 'Rapid Sites - Multi-tenant Website Framework',
  description:
    'Build and deploy professional websites for small businesses in minutes with our multi-tenant Next.js framework.',
  openGraph: {
    type: 'website',
    locale: DEFAULT_LOCALE,
    siteName: APP_NAME,
  },
  twitter: {
    cardType: 'summary_large_image',
  },
} as const

/**
 * File upload limits
 */
export const MAX_FILE_SIZE = 5242880 as const // 5MB
export const MAX_IMAGE_SIZE = 10485760 as const // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

/**
 * Image optimization sizes
 */
export const IMAGE_SIZES = {
  thumbnail: 150,
  small: 300,
  medium: 640,
  large: 1024,
  xlarge: 1920,
} as const

/**
 * Breakpoints (must match Tailwind config)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Z-index layers
 */
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
} as const

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

/**
 * Debounce delays (ms)
 */
export const DEBOUNCE_DELAY = {
  search: 300,
  input: 500,
  resize: 150,
} as const

/**
 * Tenant subdomain restrictions
 */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'mail',
  'email',
  'cdn',
  'assets',
  'static',
  'test',
  'staging',
  'dev',
  'development',
  'prod',
  'production',
] as const

/**
 * Tenant plan limits
 */
export const PLAN_LIMITS = {
  free: {
    pages: 5,
    blogPosts: 10,
    storage: 100 * 1024 * 1024, // 100MB
    bandwidth: 1 * 1024 * 1024 * 1024, // 1GB
    customDomain: false,
  },
  starter: {
    pages: 20,
    blogPosts: 50,
    storage: 500 * 1024 * 1024, // 500MB
    bandwidth: 10 * 1024 * 1024 * 1024, // 10GB
    customDomain: true,
  },
  professional: {
    pages: 100,
    blogPosts: 500,
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    bandwidth: 100 * 1024 * 1024 * 1024, // 100GB
    customDomain: true,
  },
  enterprise: {
    pages: Infinity,
    blogPosts: Infinity,
    storage: Infinity,
    bandwidth: Infinity,
    customDomain: true,
  },
} as const

/**
 * Default tenant features
 */
export const DEFAULT_TENANT_FEATURES: TenantFeatures = {
  blog: true,
  booking: false,
  testimonials: true,
  team: true,
  gallery: true,
  ecommerce: false,
  contactForm: true,
  newsletter: false,
} as const

/**
 * Default tenant theme
 */
export const DEFAULT_TENANT_THEME = {
  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#8b5cf6', // violet-500
    accent: '#f59e0b', // amber-500
    background: '#ffffff',
    foreground: '#0a0a0a',
    muted: '#f3f4f6', // gray-100
    border: '#e5e7eb', // gray-200
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  layout: {
    containerMaxWidth: '1280px',
    borderRadius: 'md' as const,
  },
} as const

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  api: {
    window: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
  auth: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
  contact: {
    window: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 submissions per hour
  },
} as const

/**
 * Cache durations (seconds)
 */
export const CACHE_DURATION = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 24 hours
} as const

/**
 * Regular expressions for validation
 */
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s()+-]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  subdomain: /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  notFound: 'The requested resource was not found.',
  unauthorized: 'You are not authorized to access this resource.',
  forbidden: 'Access to this resource is forbidden.',
  validation: 'Please check your input and try again.',
  network: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  tenantNotFound: 'Tenant not found. Please check the URL.',
  invalidCredentials: 'Invalid email or password.',
  emailTaken: 'This email is already in use.',
  subdomainTaken: 'This subdomain is already taken.',
  subdomainReserved: 'This subdomain is reserved.',
  uploadFailed: 'File upload failed. Please try again.',
  fileTooLarge: 'File is too large. Maximum size is {size}.',
  invalidFileType: 'Invalid file type. Allowed types: {types}.',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  saved: 'Changes saved successfully.',
  created: 'Created successfully.',
  updated: 'Updated successfully.',
  deleted: 'Deleted successfully.',
  sent: 'Sent successfully.',
  uploaded: 'Uploaded successfully.',
} as const

/**
 * Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Cookie names
 */
export const COOKIES = {
  tenant: 'rapid-sites-tenant',
  session: 'rapid-sites-session',
  theme: 'rapid-sites-theme',
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'rapid-sites-theme',
  recentTenants: 'rapid-sites-recent-tenants',
} as const
