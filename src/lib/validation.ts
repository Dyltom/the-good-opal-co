/**
 * Validation utility functions
 * Reusable validators for common data types
 */

import { REGEX, RESERVED_SUBDOMAINS } from './constants'

/**
 * Validate an email address
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  return REGEX.email.test(email.trim())
}

/**
 * Validate a phone number
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Validate a URL
 * @param url - URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    new URL(url)
    return REGEX.url.test(url)
  } catch {
    return false
  }
}

/**
 * Validate a slug format
 * @param slug - Slug to validate
 * @returns True if valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false
  return REGEX.slug.test(slug)
}

/**
 * Validate a subdomain format
 * @param subdomain - Subdomain to validate
 * @returns True if valid
 */
export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || typeof subdomain !== 'string') return false

  // Check format
  if (!REGEX.subdomain.test(subdomain)) {
    return false
  }

  // Check if reserved
  if (RESERVED_SUBDOMAINS.includes(subdomain as (typeof RESERVED_SUBDOMAINS)[number])) {
    return false
  }

  // Check length (must be between 3 and 63 characters)
  if (subdomain.length < 3 || subdomain.length > 63) {
    return false
  }

  return true
}

/**
 * Validate a hex color code
 * @param color - Color code to validate
 * @returns True if valid
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false
  return REGEX.hexColor.test(color)
}

/**
 * Validate a password strength
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 8)
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(
  password: string,
  minLength: number = 8
): {
  valid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (!password || password.length < minLength) {
    feedback.push(`Password must be at least ${minLength} characters`)
    return { valid: false, score: 0, feedback }
  }

  // Length
  if (password.length >= minLength) score++
  if (password.length >= 12) score++

  // Lowercase
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Add lowercase letters')
  }

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Add uppercase letters')
  }

  // Numbers
  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Add numbers')
  }

  // Special characters
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Add special characters')
  }

  const valid = score >= 4

  return { valid, score, feedback }
}

/**
 * Validate a required field
 * @param value - Value to validate
 * @returns Error message or undefined
 */
export function validateRequired(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') {
    return 'This field is required'
  }
  if (typeof value === 'string' && value.trim() === '') {
    return 'This field is required'
  }
  return undefined
}

/**
 * Validate minimum length
 * @param value - String to validate
 * @param min - Minimum length
 * @returns Error message or undefined
 */
export function validateMinLength(value: string, min: number): string | undefined {
  if (value && value.length < min) {
    return `Must be at least ${min} characters`
  }
  return undefined
}

/**
 * Validate maximum length
 * @param value - String to validate
 * @param max - Maximum length
 * @returns Error message or undefined
 */
export function validateMaxLength(value: string, max: number): string | undefined {
  if (value && value.length > max) {
    return `Must be at most ${max} characters`
  }
  return undefined
}

/**
 * Validate minimum value
 * @param value - Number to validate
 * @param min - Minimum value
 * @returns Error message or undefined
 */
export function validateMin(value: number, min: number): string | undefined {
  if (value < min) {
    return `Must be at least ${min}`
  }
  return undefined
}

/**
 * Validate maximum value
 * @param value - Number to validate
 * @param max - Maximum value
 * @returns Error message or undefined
 */
export function validateMax(value: number, max: number): string | undefined {
  if (value > max) {
    return `Must be at most ${max}`
  }
  return undefined
}

/**
 * Validate value is in range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Error message or undefined
 */
export function validateRange(value: number, min: number, max: number): string | undefined {
  if (value < min || value > max) {
    return `Must be between ${min} and ${max}`
  }
  return undefined
}

/**
 * Validate value matches pattern
 * @param value - String to validate
 * @param pattern - RegExp pattern
 * @param message - Custom error message
 * @returns Error message or undefined
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  message?: string
): string | undefined {
  if (value && !pattern.test(value)) {
    return message || 'Invalid format'
  }
  return undefined
}

/**
 * Sanitize HTML to prevent XSS
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Sanitize user input (trim and remove dangerous characters)
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Combine multiple validators
 * @param value - Value to validate
 * @param validators - Array of validator functions
 * @returns First error message or undefined
 */
export function combineValidators(
  value: unknown,
  validators: Array<(val: unknown) => string | undefined>
): string | undefined {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return undefined
}
