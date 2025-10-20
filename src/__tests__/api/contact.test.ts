import { describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

// Mock email sending
vi.mock('@/lib/email', () => ({
  sendContactFormEmail: vi.fn().mockResolvedValue({ id: 'test-email' }),
}))

describe('Contact API', () => {
  it('should return 400 for invalid body', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(422) // Validation error
    expect(data.success).toBe(false)
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
        message: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(422)
    expect(data.error?.details?.errors).toBeDefined()
  })

  it('should accept valid contact form', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
