import { describe, expect, it } from 'vitest'
import {
  combineValidators,
  isValidEmail,
  isValidHexColor,
  isValidPhone,
  isValidSlug,
  isValidSubdomain,
  isValidUrl,
  sanitizeInput,
  validateMax,
  validateMaxLength,
  validateMin,
  validateMinLength,
  validatePasswordStrength,
  validatePattern,
  validateRange,
  validateRequired,
} from '@/lib/validation'

describe('validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true)
      expect(isValidPhone('(123) 456-7890')).toBe(true)
      expect(isValidPhone('+1 234-567-8900')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('abc')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://www.example.com/path')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('isValidSlug', () => {
    it('should validate slugs', () => {
      expect(isValidSlug('hello-world')).toBe(true)
      expect(isValidSlug('test-123')).toBe(true)
      expect(isValidSlug('a')).toBe(true)
    })

    it('should reject invalid slugs', () => {
      expect(isValidSlug('Hello World')).toBe(false)
      expect(isValidSlug('hello_world')).toBe(false)
      expect(isValidSlug('hello-')).toBe(false)
      expect(isValidSlug('-hello')).toBe(false)
      expect(isValidSlug('')).toBe(false)
    })
  })

  describe('isValidSubdomain', () => {
    it('should validate subdomains', () => {
      expect(isValidSubdomain('mysite')).toBe(true)
      expect(isValidSubdomain('my-site')).toBe(true)
      expect(isValidSubdomain('site123')).toBe(true)
    })

    it('should reject reserved subdomains', () => {
      expect(isValidSubdomain('www')).toBe(false)
      expect(isValidSubdomain('api')).toBe(false)
      expect(isValidSubdomain('admin')).toBe(false)
    })

    it('should reject invalid formats', () => {
      expect(isValidSubdomain('my_site')).toBe(false)
      expect(isValidSubdomain('-mysite')).toBe(false)
      expect(isValidSubdomain('my')).toBe(false) // too short
      expect(isValidSubdomain('')).toBe(false)
    })
  })

  describe('isValidHexColor', () => {
    it('should validate hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#ABC123')).toBe(true)
    })

    it('should reject invalid colors', () => {
      expect(isValidHexColor('ffffff')).toBe(false)
      expect(isValidHexColor('#gggggg')).toBe(false)
      expect(isValidHexColor('')).toBe(false)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('Test123!@#')
      expect(result.valid).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(4)
    })

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak')
      expect(result.valid).toBe(false)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should provide feedback', () => {
      const result = validatePasswordStrength('lowercase')
      expect(result.feedback).toContain('Add uppercase letters')
      expect(result.feedback).toContain('Add numbers')
    })
  })

  describe('validateRequired', () => {
    it('should pass for valid values', () => {
      expect(validateRequired('value')).toBeUndefined()
      expect(validateRequired(123)).toBeUndefined()
    })

    it('should fail for empty values', () => {
      expect(validateRequired('')).toBe('This field is required')
      expect(validateRequired(null)).toBe('This field is required')
      expect(validateRequired(undefined)).toBe('This field is required')
      expect(validateRequired('   ')).toBe('This field is required')
    })
  })

  describe('validateMinLength', () => {
    it('should pass for valid lengths', () => {
      expect(validateMinLength('hello', 3)).toBeUndefined()
      expect(validateMinLength('hello', 5)).toBeUndefined()
    })

    it('should fail for short strings', () => {
      expect(validateMinLength('hi', 5)).toBe('Must be at least 5 characters')
    })
  })

  describe('validateMaxLength', () => {
    it('should pass for valid lengths', () => {
      expect(validateMaxLength('hello', 10)).toBeUndefined()
      expect(validateMaxLength('hello', 5)).toBeUndefined()
    })

    it('should fail for long strings', () => {
      expect(validateMaxLength('hello world', 5)).toBe('Must be at most 5 characters')
    })
  })

  describe('validateMin', () => {
    it('should pass for valid values', () => {
      expect(validateMin(10, 5)).toBeUndefined()
      expect(validateMin(5, 5)).toBeUndefined()
    })

    it('should fail for small values', () => {
      expect(validateMin(3, 5)).toBe('Must be at least 5')
    })
  })

  describe('validateMax', () => {
    it('should pass for valid values', () => {
      expect(validateMax(5, 10)).toBeUndefined()
      expect(validateMax(10, 10)).toBeUndefined()
    })

    it('should fail for large values', () => {
      expect(validateMax(15, 10)).toBe('Must be at most 10')
    })
  })

  describe('validateRange', () => {
    it('should pass for values in range', () => {
      expect(validateRange(5, 1, 10)).toBeUndefined()
      expect(validateRange(1, 1, 10)).toBeUndefined()
      expect(validateRange(10, 1, 10)).toBeUndefined()
    })

    it('should fail for values out of range', () => {
      expect(validateRange(0, 1, 10)).toBe('Must be between 1 and 10')
      expect(validateRange(11, 1, 10)).toBe('Must be between 1 and 10')
    })
  })

  describe('validatePattern', () => {
    it('should pass for matching patterns', () => {
      expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBeUndefined()
    })

    it('should fail for non-matching patterns', () => {
      expect(validatePattern('ABC', /^[a-z]+$/)).toBe('Invalid format')
      expect(validatePattern('ABC', /^[a-z]+$/, 'Must be lowercase')).toBe('Must be lowercase')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)')
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })
  })

  describe('combineValidators', () => {
    it('should return first error', () => {
      const validators = [
        (val: unknown) => validateRequired(val),
        (val: unknown) => validateMinLength(val as string, 5),
      ]

      expect(combineValidators('', validators)).toBe('This field is required')
      expect(combineValidators('hi', validators)).toBe('Must be at least 5 characters')
      expect(combineValidators('hello', validators)).toBeUndefined()
    })
  })
})
