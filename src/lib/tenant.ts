/**
 * Tenant resolution and management utilities
 * Handles tenant identification from domains/subdomains
 */

import type { Tenant, TenantContext, TenantResolution } from '@/types'
import { RESERVED_SUBDOMAINS } from './constants'

/**
 * Extract subdomain from hostname
 * @param hostname - Full hostname (e.g., 'client.rapidsites.com')
 * @returns Subdomain or null if none/invalid
 */
export function extractSubdomain(hostname: string): string | null {
  if (!hostname) return null

  // Remove port if present
  const cleanHostname = hostname.split(':')[0]

  if (!cleanHostname) return null

  // Split by dots
  const parts = cleanHostname.split('.')

  // If localhost or IP, no subdomain
  if (parts.length === 1 || cleanHostname === 'localhost') {
    return null
  }

  // If www.domain.com or domain.com, no subdomain
  if (parts.length === 2) {
    return null
  }

  // If subdomain.domain.com, return subdomain
  if (parts.length >= 3) {
    const subdomain = parts[0]

    if (!subdomain) return null

    // Skip www
    if (subdomain === 'www') {
      return null
    }

    // Check if reserved
    if (RESERVED_SUBDOMAINS.includes(subdomain as (typeof RESERVED_SUBDOMAINS)[number])) {
      return null
    }

    return subdomain
  }

  return null
}

/**
 * Check if hostname is a custom domain (not a subdomain)
 * @param hostname - Full hostname
 * @param baseDomain - Base domain (e.g., 'rapidsites.com')
 * @returns True if custom domain
 */
export function isCustomDomain(hostname: string, baseDomain: string): boolean {
  if (!hostname || !baseDomain) return false

  const cleanHostname = hostname.split(':')[0]

  if (!cleanHostname) return false

  // If it doesn't end with base domain, it's custom
  if (!cleanHostname.endsWith(baseDomain)) {
    return true
  }

  // If it's exactly the base domain, not custom
  if (cleanHostname === baseDomain || cleanHostname === `www.${baseDomain}`) {
    return false
  }

  return false
}

/**
 * Get base domain from environment or default
 * @returns Base domain (e.g., 'rapidsites.com')
 */
export function getBaseDomain(): string {
  // In production, this would come from env
  const domain = process.env['NEXT_PUBLIC_BASE_DOMAIN'] || 'localhost:3000'
  return domain
}

/**
 * Resolve tenant from hostname
 * This would typically query the database
 * @param hostname - Full hostname
 * @returns Tenant resolution result
 */
export async function resolveTenantFromHostname(
  hostname: string
): Promise<TenantResolution> {
  const baseDomain = getBaseDomain()
  const subdomain = extractSubdomain(hostname)
  const customDomain = isCustomDomain(hostname, baseDomain)

  // For now, return a mock until we have DB connection
  // In production, this would query Payload CMS or database

  if (!subdomain && !customDomain) {
    return {
      found: false,
      error: 'No tenant identifier found in hostname',
    }
  }

  // Mock tenant data - replace with actual DB query
  return {
    found: false,
    error: 'Database connection required - tenant lookup not implemented',
  }
}

/**
 * Create tenant context from tenant data
 * @param tenant - Tenant object
 * @param hostname - Current hostname
 * @returns Tenant context
 */
export function createTenantContext(tenant: Tenant, hostname: string): TenantContext {
  const baseDomain = getBaseDomain()
  const isSubdomain = extractSubdomain(hostname) !== null
  const isCustomDom = isCustomDomain(hostname, baseDomain)

  return {
    tenant,
    isSubdomain,
    isCustomDomain: isCustomDom,
    hostname,
  }
}

/**
 * Build tenant URL
 * @param tenant - Tenant object
 * @param path - Path to append (default: '/')
 * @returns Full URL to tenant
 */
export function buildTenantUrl(tenant: Tenant, path: string = '/'): string {
  // If custom domain, use it
  if (tenant.domain) {
    return `https://${tenant.domain}${path}`
  }

  // Otherwise use subdomain
  const baseDomain = getBaseDomain()
  return `https://${tenant.subdomain}.${baseDomain}${path}`
}

/**
 * Validate subdomain format
 * @param subdomain - Subdomain to validate
 * @returns Validation result with error message if invalid
 */
export function validateSubdomain(subdomain: string): {
  valid: boolean
  error?: string
} {
  if (!subdomain) {
    return { valid: false, error: 'Subdomain is required' }
  }

  if (subdomain.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters' }
  }

  if (subdomain.length > 63) {
    return { valid: false, error: 'Subdomain must be less than 63 characters' }
  }

  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
    return {
      valid: false,
      error: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
    }
  }

  if (RESERVED_SUBDOMAINS.includes(subdomain as (typeof RESERVED_SUBDOMAINS)[number])) {
    return { valid: false, error: 'This subdomain is reserved' }
  }

  return { valid: true }
}

/**
 * Check if subdomain is available
 * This would query the database in production
 * @param subdomain - Subdomain to check
 * @returns True if available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  // Validate format first
  const validation = validateSubdomain(subdomain)
  if (!validation.valid) {
    return false
  }

  // Query database to check if subdomain exists
  // For now, return true (mock)
  return true
}

/**
 * Get tenant by ID
 * Mock function until DB is connected
 * @param _tenantId - Tenant ID
 * @returns Tenant or null
 */
export async function getTenantById(_tenantId: string): Promise<Tenant | null> {
  // This would query Payload CMS or database
  // For now, return null
  return null
}

/**
 * Get tenant by subdomain
 * Mock function until DB is connected
 * @param _subdomain - Subdomain
 * @returns Tenant or null
 */
export async function getTenantBySubdomain(_subdomain: string): Promise<Tenant | null> {
  // This would query Payload CMS or database
  // For now, return null
  return null
}

/**
 * Get tenant by custom domain
 * Mock function until DB is connected
 * @param _domain - Custom domain
 * @returns Tenant or null
 */
export async function getTenantByDomain(_domain: string): Promise<Tenant | null> {
  // This would query Payload CMS or database
  // For now, return null
  return null
}
