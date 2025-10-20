/**
 * Core utility functions
 * Shared utilities used throughout the application
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with locale-specific separators
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format a currency value
 * @param value - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a date using locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Format a relative time string (e.g., "2 hours ago")
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Generate a slug from a string
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Truncate a string to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - suffix.length).trim() + suffix
}

/**
 * Capitalize the first letter of a string
 * @param text - Text to capitalize
 * @returns Capitalized string
 */
export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert a string to title case
 * @param text - Text to convert
 * @returns Title case string
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Generate initials from a name
 * @param name - Full name
 * @param maxLength - Maximum number of initials (default: 2)
 * @returns Initials string
 */
export function getInitials(name: string, maxLength: number = 2): string {
  const names = name.trim().split(' ')
  const initials = names.map((n) => n[0]?.toUpperCase()).filter(Boolean)

  return initials.slice(0, maxLength).join('')
}

/**
 * Debounce a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Throttle a function
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  throw new Error('Unable to clone object')
}

/**
 * Check if an object is empty
 * @param obj - Object to check
 * @returns True if empty
 */
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Sleep for a specified time
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random string
 * @param length - Length of string
 * @returns Random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Convert file size to human-readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimals (default: 2)
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Extract domain from URL
 * @param url - URL string
 * @returns Domain name or null
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * Check if code is running on the client
 * @returns True if client-side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if code is running on the server
 * @returns True if server-side
 */
export function isServer(): boolean {
  return !isClient()
}

/**
 * Get a nested property from an object using dot notation
 * @param obj - Object to search
 * @param path - Path to property (e.g., 'user.name')
 * @param defaultValue - Default value if not found
 * @returns Property value or default
 */
export function getNestedProperty<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return defaultValue
    }
  }

  return result as T
}
