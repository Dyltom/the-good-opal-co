/**
 * Server-side tenant utilities
 * Functions for resolving tenant in server components and API routes
 */

import { headers } from 'next/headers'
import type { Tenant } from '@/types'

/**
 * Get tenant from request headers (set by middleware)
 * Use this in Server Components and API routes
 * @returns Tenant subdomain or domain, or null
 */
export async function getTenantFromHeaders(): Promise<{
  subdomain: string | null
  domain: string | null
  type: 'subdomain' | 'custom-domain' | null
}> {
  const headersList = await headers()

  const subdomain = headersList.get('x-tenant-subdomain')
  const domain = headersList.get('x-tenant-domain')
  const type = headersList.get('x-tenant-type') as 'subdomain' | 'custom-domain' | null

  return {
    subdomain,
    domain,
    type,
  }
}

/**
 * Get current tenant in server component
 * @returns Tenant object or null
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const { subdomain, domain } = await getTenantFromHeaders()

  if (!subdomain && !domain) {
    return null
  }

  // Query Payload CMS for tenant
  // This would use getPayload() and query the tenants collection
  // For now, return null until database is connected

  return null
}

/**
 * Get hostname from request headers
 * @returns Hostname string
 */
export async function getHostname(): Promise<string> {
  const headersList = await headers()
  return headersList.get('host') || ''
}

/**
 * Check if current request is for a tenant
 * @returns True if tenant context exists
 */
export async function isInTenantContext(): Promise<boolean> {
  const { subdomain, domain } = await getTenantFromHeaders()
  return !!(subdomain || domain)
}

/**
 * Require tenant or throw error
 * Use this in routes that must have tenant context
 * @returns Tenant object
 * @throws Error if no tenant found
 */
export async function requireTenant(): Promise<Tenant> {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    throw new Error('Tenant not found - this route requires tenant context')
  }

  return tenant
}

/**
 * Get tenant ID from headers (lighter weight than full tenant)
 * @returns Tenant ID or null
 */
export async function getTenantId(): Promise<string | null> {
  const { subdomain, domain } = await getTenantFromHeaders()

  // In production, this would query to get the tenant ID
  // For now, we could use subdomain/domain as identifier
  return subdomain || domain
}
