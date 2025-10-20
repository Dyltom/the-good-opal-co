/**
 * Database utilities and helpers
 * Type-safe database query helpers with tenant scoping
 */

import type { ID } from '@/types'

/**
 * Base query filter with tenant scoping
 */
export interface TenantScopedQuery {
  tenantId: {
    equals: ID
  }
}

/**
 * Create a tenant-scoped query filter
 * Ensures all queries are automatically scoped to the current tenant
 * @param tenantId - Tenant ID to scope to
 * @param additionalFilters - Additional query filters
 * @returns Combined query filter
 */
export function createTenantScope<T extends Record<string, unknown>>(
  tenantId: ID,
  additionalFilters?: T
): TenantScopedQuery & T {
  return {
    tenantId: {
      equals: tenantId,
    },
    ...(additionalFilters || ({} as T)),
  }
}

/**
 * Tenant-scoped Payload query options
 */
export interface TenantQueryOptions {
  tenantId: ID
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, unknown>
}

/**
 * Build Payload where clause with tenant scoping
 * @param options - Query options
 * @returns Where clause object
 */
export function buildTenantWhereClause(options: TenantQueryOptions): Record<string, unknown> {
  const { tenantId, where = {} } = options

  return {
    and: [
      {
        tenantId: {
          equals: tenantId,
        },
      },
      ...(Object.keys(where).length > 0 ? [where] : []),
    ],
  }
}

/**
 * Build Payload query with tenant scoping
 * @param options - Query options
 * @returns Full query object for Payload
 */
export function buildTenantQuery(options: TenantQueryOptions) {
  const { tenantId, limit, page, sort, where } = options

  return {
    where: buildTenantWhereClause({ tenantId, where }),
    limit,
    page,
    sort,
  }
}

/**
 * Validate tenant ownership of a record
 * @param recordTenantId - Tenant ID from the record
 * @param currentTenantId - Current tenant ID
 * @returns True if tenant owns the record
 */
export function validateTenantOwnership(recordTenantId: ID, currentTenantId: ID): boolean {
  return recordTenantId === currentTenantId
}

/**
 * Filter array by tenant ID
 * @param items - Array of items with tenantId
 * @param tenantId - Tenant ID to filter by
 * @returns Filtered array
 */
export function filterByTenant<T extends { tenantId: ID }>(items: T[], tenantId: ID): T[] {
  return items.filter((item) => item.tenantId === tenantId)
}

/**
 * Check if user has access to tenant
 * @param _userId - User ID
 * @param _tenantId - Tenant ID
 * @returns True if user has access (would query DB in production)
 */
export async function userHasAccessToTenant(_userId: ID, _tenantId: ID): Promise<boolean> {
  // This would query the database to check user-tenant relationship
  // For now, return true (mock)
  return true
}

/**
 * Get user's tenants
 * @param _userId - User ID
 * @returns Array of tenant IDs user has access to
 */
export async function getUserTenants(_userId: ID): Promise<ID[]> {
  // This would query the database for user's tenants
  // For now, return empty array (mock)
  return []
}
