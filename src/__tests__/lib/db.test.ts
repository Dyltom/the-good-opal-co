import { describe, expect, it } from 'vitest'
import {
  buildTenantQuery,
  buildTenantWhereClause,
  createTenantScope,
  filterByTenant,
  validateTenantOwnership,
} from '@/lib/db'

describe('database utilities', () => {
  describe('createTenantScope', () => {
    it('should create tenant scope filter', () => {
      const scope = createTenantScope('tenant-1')

      expect(scope).toEqual({
        tenantId: {
          equals: 'tenant-1',
        },
      })
    })

    it('should merge with additional filters', () => {
      const scope = createTenantScope('tenant-1', {
        status: 'published',
      })

      expect(scope).toEqual({
        tenantId: {
          equals: 'tenant-1',
        },
        status: 'published',
      })
    })
  })

  describe('buildTenantWhereClause', () => {
    it('should build where clause with tenant scoping', () => {
      const where = buildTenantWhereClause({
        tenantId: 'tenant-1',
      })

      expect(where).toEqual({
        and: [
          {
            tenantId: {
              equals: 'tenant-1',
            },
          },
        ],
      })
    })

    it('should include additional where conditions', () => {
      const where = buildTenantWhereClause({
        tenantId: 'tenant-1',
        where: {
          status: 'published',
        },
      })

      expect(where).toEqual({
        and: [
          {
            tenantId: {
              equals: 'tenant-1',
            },
          },
          {
            status: 'published',
          },
        ],
      })
    })
  })

  describe('buildTenantQuery', () => {
    it('should build complete query with pagination', () => {
      const query = buildTenantQuery({
        tenantId: 'tenant-1',
        limit: 10,
        page: 1,
        sort: '-createdAt',
      })

      expect(query).toHaveProperty('where')
      expect(query.limit).toBe(10)
      expect(query.page).toBe(1)
      expect(query.sort).toBe('-createdAt')
    })
  })

  describe('validateTenantOwnership', () => {
    it('should validate matching tenant IDs', () => {
      expect(validateTenantOwnership('tenant-1', 'tenant-1')).toBe(true)
      expect(validateTenantOwnership('123', '123')).toBe(true)
    })

    it('should reject non-matching tenant IDs', () => {
      expect(validateTenantOwnership('tenant-1', 'tenant-2')).toBe(false)
      expect(validateTenantOwnership('123', '456')).toBe(false)
    })
  })

  describe('filterByTenant', () => {
    it('should filter array by tenant ID', () => {
      const items = [
        { id: '1', tenantId: 'tenant-1', name: 'Item 1' },
        { id: '2', tenantId: 'tenant-2', name: 'Item 2' },
        { id: '3', tenantId: 'tenant-1', name: 'Item 3' },
      ]

      const filtered = filterByTenant(items, 'tenant-1')

      expect(filtered).toHaveLength(2)
      expect(filtered[0]?.id).toBe('1')
      expect(filtered[1]?.id).toBe('3')
    })

    it('should return empty array if no matches', () => {
      const items = [
        { id: '1', tenantId: 'tenant-1', name: 'Item 1' },
        { id: '2', tenantId: 'tenant-2', name: 'Item 2' },
      ]

      const filtered = filterByTenant(items, 'tenant-3')

      expect(filtered).toHaveLength(0)
    })
  })
})
