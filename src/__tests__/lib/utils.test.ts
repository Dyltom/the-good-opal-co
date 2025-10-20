import { describe, expect, it } from 'vitest'
import {
  capitalize,
  cn,
  debounce,
  deepClone,
  extractDomain,
  formatCurrency,
  formatDate,
  formatFileSize,
  formatNumber,
  getInitials,
  getNestedProperty,
  isEmpty,
  randomString,
  slugify,
  titleCase,
  truncate,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
      expect(cn('px-4', 'px-8')).toBe('px-8')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with locale', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(99.99)
      expect(result).toContain('99.99')
      expect(result).toContain('$')
    })

    it('should handle different currencies', () => {
      const result = formatCurrency(100, 'EUR')
      expect(result).toContain('100')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2025-01-15')
      const result = formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })
      expect(result).toContain('2025')
      expect(result).toContain('January')
    })

    it('should handle string dates', () => {
      const result = formatDate('2025-01-15')
      expect(result).toBeTruthy()
      expect(result).not.toBe('Invalid date')
    })

    it('should return Invalid date for invalid input', () => {
      expect(formatDate('invalid')).toBe('Invalid date')
    })
  })

  describe('slugify', () => {
    it('should create valid slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Hello  World')).toBe('hello-world')
      expect(slugify('Hello-World')).toBe('hello-world')
    })

    it('should handle special characters', () => {
      expect(slugify('Hello & World!')).toBe('hello-world')
      expect(slugify('Café René')).toBe('cafe-rene')
    })

    it('should remove leading/trailing dashes', () => {
      expect(slugify('-hello-')).toBe('hello')
      expect(slugify('--hello--')).toBe('hello')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
      expect(truncate('Hello World', 5)).toBe('He...')
    })

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should handle custom suffix', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('titleCase', () => {
    it('should convert to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World')
      expect(titleCase('HELLO WORLD')).toBe('Hello World')
    })
  })

  describe('getInitials', () => {
    it('should extract initials', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('John Patrick Doe')).toBe('JP')
      expect(getInitials('John Patrick Doe', 3)).toBe('JPD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })
  })

  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('should clone arrays', () => {
      const arr = [1, 2, { a: 3 }]
      const cloned = deepClone(arr)

      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
    })

    it('should clone dates', () => {
      const date = new Date('2025-01-15')
      const cloned = deepClone(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })
  })

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })

  describe('randomString', () => {
    it('should generate random strings', () => {
      const str1 = randomString()
      const str2 = randomString()

      expect(str1).toHaveLength(10)
      expect(str1).not.toBe(str2)
    })

    it('should respect custom length', () => {
      expect(randomString(5)).toHaveLength(5)
      expect(randomString(20)).toHaveLength(20)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle decimals', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1536, 1)).toBe('1.5 KB')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com')
      expect(extractDomain('http://www.example.com')).toBe('www.example.com')
    })

    it('should return null for invalid URLs', () => {
      expect(extractDomain('not a url')).toBe(null)
    })
  })

  describe('getNestedProperty', () => {
    it('should get nested properties', () => {
      const obj = { a: { b: { c: 123 } } }

      expect(getNestedProperty(obj, 'a.b.c')).toBe(123)
      expect(getNestedProperty(obj, 'a.b')).toEqual({ c: 123 })
    })

    it('should return default for missing properties', () => {
      const obj = { a: { b: 1 } }

      expect(getNestedProperty(obj, 'a.c', 'default')).toBe('default')
      expect(getNestedProperty(obj, 'x.y.z', null)).toBe(null)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0
      const fn = () => callCount++
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      expect(callCount).toBe(0)

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(callCount).toBe(1)
    })
  })
})
