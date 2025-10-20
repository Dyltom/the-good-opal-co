import { describe, expect, it } from 'vitest'
import {
  buildTenantUrl,
  createTenantContext,
  extractSubdomain,
  isCustomDomain,
  validateSubdomain,
} from '@/lib/tenant'
import type { Tenant } from '@/types'

describe('tenant utilities', () => {
  describe('extractSubdomain', () => {
    it('should extract subdomain correctly', () => {
      expect(extractSubdomain('client.rapidsites.com')).toBe('client')
      expect(extractSubdomain('mysite.example.com')).toBe('mysite')
      expect(extractSubdomain('my-site.rapidsites.com')).toBe('my-site')
    })

    it('should return null for no subdomain', () => {
      expect(extractSubdomain('rapidsites.com')).toBe(null)
      expect(extractSubdomain('example.com')).toBe(null)
      expect(extractSubdomain('localhost')).toBe(null)
      expect(extractSubdomain('localhost:3000')).toBe(null)
    })

    it('should ignore www subdomain', () => {
      expect(extractSubdomain('www.rapidsites.com')).toBe(null)
      expect(extractSubdomain('www.example.com')).toBe(null)
    })

    it('should return null for reserved subdomains', () => {
      expect(extractSubdomain('api.rapidsites.com')).toBe(null)
      expect(extractSubdomain('admin.rapidsites.com')).toBe(null)
      expect(extractSubdomain('app.rapidsites.com')).toBe(null)
    })

    it('should handle hostname with port', () => {
      expect(extractSubdomain('client.rapidsites.com:3000')).toBe('client')
    })
  })

  describe('isCustomDomain', () => {
    it('should identify custom domains', () => {
      expect(isCustomDomain('customsite.com', 'rapidsites.com')).toBe(true)
      expect(isCustomDomain('client.com', 'rapidsites.com')).toBe(true)
    })

    it('should not identify subdomains as custom', () => {
      expect(isCustomDomain('client.rapidsites.com', 'rapidsites.com')).toBe(false)
      expect(isCustomDomain('www.rapidsites.com', 'rapidsites.com')).toBe(false)
      expect(isCustomDomain('rapidsites.com', 'rapidsites.com')).toBe(false)
    })

    it('should handle port in hostname', () => {
      expect(isCustomDomain('customsite.com:3000', 'rapidsites.com')).toBe(true)
    })
  })

  describe('validateSubdomain', () => {
    it('should validate correct subdomains', () => {
      expect(validateSubdomain('mysite').valid).toBe(true)
      expect(validateSubdomain('my-site').valid).toBe(true)
      expect(validateSubdomain('site123').valid).toBe(true)
      expect(validateSubdomain('abc').valid).toBe(true)
    })

    it('should reject invalid subdomains', () => {
      expect(validateSubdomain('').valid).toBe(false)
      expect(validateSubdomain('ab').valid).toBe(false) // too short
      expect(validateSubdomain('my_site').valid).toBe(false) // underscore
      expect(validateSubdomain('My-Site').valid).toBe(false) // uppercase
      expect(validateSubdomain('-mysite').valid).toBe(false) // starts with dash
      expect(validateSubdomain('mysite-').valid).toBe(false) // ends with dash
    })

    it('should reject reserved subdomains', () => {
      const result = validateSubdomain('admin')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('This subdomain is reserved')
    })

    it('should provide helpful error messages', () => {
      expect(validateSubdomain('').error).toBe('Subdomain is required')
      expect(validateSubdomain('ab').error).toBe('Subdomain must be at least 3 characters')
      expect(validateSubdomain('My-Site').error).toBe(
        'Subdomain can only contain lowercase letters, numbers, and hyphens'
      )
    })
  })

  describe('buildTenantUrl', () => {
    it('should build URL from subdomain', () => {
      const tenant = {
        subdomain: 'client',
        domain: null,
      } as Tenant

      // Note: This test depends on getBaseDomain() which might return localhost in test
      const url = buildTenantUrl(tenant, '/about')
      expect(url).toContain('client')
      expect(url).toContain('/about')
    })

    it('should prefer custom domain', () => {
      const tenant = {
        subdomain: 'client',
        domain: 'customsite.com',
      } as Tenant

      const url = buildTenantUrl(tenant, '/contact')
      expect(url).toBe('https://customsite.com/contact')
    })

    it('should default to root path', () => {
      const tenant = {
        subdomain: 'client',
        domain: 'customsite.com',
      } as Tenant

      const url = buildTenantUrl(tenant)
      expect(url).toBe('https://customsite.com/')
    })
  })

  describe('createTenantContext', () => {
    it('should create context with subdomain', () => {
      const tenant = {
        id: '1',
        subdomain: 'client',
        domain: null,
      } as Tenant

      const context = createTenantContext(tenant, 'client.rapidsites.com')

      expect(context.tenant).toBe(tenant)
      expect(context.isSubdomain).toBe(true)
      expect(context.hostname).toBe('client.rapidsites.com')
    })

    it('should create context with custom domain', () => {
      const tenant = {
        id: '1',
        subdomain: 'client',
        domain: 'customsite.com',
      } as Tenant

      const context = createTenantContext(tenant, 'customsite.com')

      expect(context.tenant).toBe(tenant)
      expect(context.hostname).toBe('customsite.com')
    })
  })
})
