import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import ContactFormEmail from '@/emails/ContactFormEmail'

describe('ContactFormEmail', () => {
  describe('Rendering', () => {
    it('should render email HTML successfully', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test Site',
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message',
        })
      )

      expect(html).toBeTruthy()
      expect(html).toContain('<!DOCTYPE html')
    })

    it('should include tenant name in content', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'My Business',
          name: 'Jane',
          email: 'jane@test.com',
          message: 'Hello',
        })
      )

      expect(html).toContain('My Business')
    })

    it('should include sender name', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test',
        })
      )

      expect(html).toContain('John Doe')
    })

    it('should include sender email', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John',
          email: 'john@example.com',
          message: 'Test',
        })
      )

      expect(html).toContain('john@example.com')
      expect(html).toContain('mailto:john@example.com')
    })

    it('should include message content', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John',
          email: 'john@example.com',
          message: 'This is my important message',
        })
      )

      expect(html).toContain('This is my important message')
    })

    it('should include phone when provided', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John',
          email: 'john@example.com',
          phone: '555-0123',
          message: 'Test',
        })
      )

      expect(html).toContain('555-0123')
      expect(html).toContain('tel:555-0123')
    })

    it('should not include phone section when not provided', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John',
          email: 'john@example.com',
          message: 'Test',
        })
      )

      expect(html).not.toContain('tel:')
    })
  })

  describe('Email Structure', () => {
    it('should have proper HTML structure', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John',
          email: 'john@example.com',
          message: 'Test',
        })
      )

      expect(html).toContain('<html')
      expect(html).toContain('<head')
      expect(html).toContain('<body')
      expect(html).toContain('</html>')
    })

    it('should include preview text', async () => {
      const html = await render(
        ContactFormEmail({
          tenantName: 'Test',
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test',
        })
      )

      expect(html).toContain('John Doe')
    })
  })

  describe('Default Values', () => {
    it('should use defaults when no props provided', async () => {
      const html = await render(ContactFormEmail({} as any))

      expect(html).toContain('Rapid Sites')
      expect(html).toContain('John Doe')
      expect(html).toContain('john@example.com')
    })
  })
})
