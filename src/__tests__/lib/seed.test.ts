import { describe, it, expect, vi, beforeEach } from 'vitest'
import { seedProducts, seedBlogPosts, seedTeamMembers, seedTestimonials, seedAllDemoData } from '@/lib/seed'

// Mock Payload
const mockPayload = {
  create: vi.fn(),
}

describe('Seed Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('seedProducts', () => {
    it('should create multiple products', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      const result = await seedProducts(mockPayload as any, tenantId)

      expect(mockPayload.create).toHaveBeenCalled()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should create products with correct data structure', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedProducts(mockPayload as any, tenantId)

      const firstCall = mockPayload.create.mock.calls[0]?.[0]
      expect(firstCall.collection).toBe('products')
      expect(firstCall.data).toHaveProperty('name')
      expect(firstCall.data).toHaveProperty('slug')
      expect(firstCall.data).toHaveProperty('price')
      expect(firstCall.data).toHaveProperty('status', 'published')
      expect(firstCall.data).toHaveProperty('tenantId', tenantId)
    })

    it('should include required product fields', async () => {
      const tenantId = 'test-tenant'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedProducts(mockPayload as any, tenantId)

      const productData = mockPayload.create.mock.calls[0]?.[0]?.data
      expect(productData.name).toBeTruthy()
      expect(productData.slug).toBeTruthy()
      expect(productData.price).toBeGreaterThan(0)
      expect(productData.stock).toBeGreaterThanOrEqual(0)
      expect(productData.sku).toBeTruthy()
    })
  })

  describe('seedBlogPosts', () => {
    it('should create multiple blog posts', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      const result = await seedBlogPosts(mockPayload as any, tenantId)

      expect(mockPayload.create).toHaveBeenCalled()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should create posts with correct data structure', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedBlogPosts(mockPayload as any, tenantId)

      const firstCall = mockPayload.create.mock.calls[0]?.[0]
      expect(firstCall.collection).toBe('posts')
      expect(firstCall.data).toHaveProperty('title')
      expect(firstCall.data).toHaveProperty('slug')
      expect(firstCall.data).toHaveProperty('content')
      expect(firstCall.data).toHaveProperty('status', 'published')
      expect(firstCall.data).toHaveProperty('tenantId', tenantId)
    })
  })

  describe('seedTeamMembers', () => {
    it('should create multiple team members', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      const result = await seedTeamMembers(mockPayload as any, tenantId)

      expect(mockPayload.create).toHaveBeenCalled()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should create members with correct data structure', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedTeamMembers(mockPayload as any, tenantId)

      const firstCall = mockPayload.create.mock.calls[0]?.[0]
      expect(firstCall.collection).toBe('team-members')
      expect(firstCall.data).toHaveProperty('name')
      expect(firstCall.data).toHaveProperty('slug')
      expect(firstCall.data).toHaveProperty('role')
      expect(firstCall.data).toHaveProperty('email')
      expect(firstCall.data).toHaveProperty('tenantId', tenantId)
    })
  })

  describe('seedTestimonials', () => {
    it('should create multiple testimonials', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      const result = await seedTestimonials(mockPayload as any, tenantId)

      expect(mockPayload.create).toHaveBeenCalled()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should create testimonials with correct data structure', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedTestimonials(mockPayload as any, tenantId)

      const firstCall = mockPayload.create.mock.calls[0]?.[0]
      expect(firstCall.collection).toBe('testimonials')
      expect(firstCall.data).toHaveProperty('name')
      expect(firstCall.data).toHaveProperty('content')
      expect(firstCall.data).toHaveProperty('rating')
      expect(firstCall.data).toHaveProperty('tenantId', tenantId)
    })

    it('should create testimonials with 5-star ratings', async () => {
      const tenantId = 'test-tenant'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedTestimonials(mockPayload as any, tenantId)

      const testimonialData = mockPayload.create.mock.calls[0]?.[0]?.data
      expect(testimonialData.rating).toBe(5)
    })
  })

  describe('seedAllDemoData', () => {
    it('should seed all data types', async () => {
      const tenantId = 'test-tenant-123'
      mockPayload.create.mockResolvedValue({ id: '1' })

      const result = await seedAllDemoData(mockPayload as any, tenantId)

      expect(result).toHaveProperty('products')
      expect(result).toHaveProperty('posts')
      expect(result).toHaveProperty('teamMembers')
      expect(result).toHaveProperty('testimonials')
    })

    it('should create data in all collections', async () => {
      const tenantId = 'test-tenant'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedAllDemoData(mockPayload as any, tenantId)

      // Should have created items in multiple collections
      expect(mockPayload.create).toHaveBeenCalledTimes(9) // 3 products + 2 posts + 2 team + 2 testimonials
    })

    it('should use the provided tenant ID for all items', async () => {
      const tenantId = 'my-unique-tenant'
      mockPayload.create.mockResolvedValue({ id: '1' })

      await seedAllDemoData(mockPayload as any, tenantId)

      // Check all calls used the correct tenantId
      mockPayload.create.mock.calls.forEach((call: any) => {
        expect(call[0].data.tenantId).toBe(tenantId)
      })
    })
  })
})
