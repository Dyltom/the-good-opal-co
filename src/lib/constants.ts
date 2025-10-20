/**
 * Application-wide constants
 * Centralized constants help maintain consistency and make updates easier
 */

import type { TenantFeatures } from '@/types'

/**
 * Application name and branding
 */
export const APP_NAME = 'The Good Opal Co' as const
export const APP_DESCRIPTION =
  'Premium Australian opal jewelry - authentic opals that don\'t cost the earth' as const
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
  titleTemplate: '%s | The Good Opal Co',
  defaultTitle: 'The Good Opal Co - Premium Australian Opal Jewelry',
  description:
    'Discover authentic Australian opal jewelry including rings, necklaces, earrings and raw opals. Premium quality opals that don\'t cost the earth.',
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
  team: false,
  gallery: true,
  ecommerce: true,
  contactForm: true,
  newsletter: true,
} as const

/**
 * Brand color palette
 * Inspired by the vibrant colors of Australian opal
 */
export const BRAND_COLORS = {
  // Primary blues from opal
  blue: {
    light: '#00CCFF',
    DEFAULT: '#0099FF',
    dark: '#0066CC',
  },
  // Teals and cyans
  teal: {
    light: '#00FFCC',
    DEFAULT: '#33CCCC',
    dark: '#009999',
  },
  // Pink/magenta fire
  pink: {
    light: '#FF66CC',
    DEFAULT: '#FF3399',
    dark: '#FF0099',
  },
  // Orange/coral fire
  orange: {
    light: '#FF9933',
    DEFAULT: '#FF6600',
    dark: '#CC5500',
  },
  // Accent yellow
  yellow: {
    light: '#FFDD00',
    DEFAULT: '#FFCC00',
    dark: '#FFAA00',
  },
  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const

/**
 * Default tenant theme
 * Opal-inspired color palette with vibrant blues, teals, and accent colors
 */
export const DEFAULT_TENANT_THEME = {
  colors: {
    primary: '#0099FF', // Vibrant opal blue
    secondary: '#00CCFF', // Teal/cyan from opal
    accent: '#FF6600', // Coral/orange from opal fire
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
  tenant: 'good-opal-tenant',
  session: 'good-opal-session',
  theme: 'good-opal-theme',
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'good-opal-theme',
  recentTenants: 'good-opal-recent-tenants',
} as const
