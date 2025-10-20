import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import OrderConfirmationEmail from '@/emails/OrderConfirmationEmail'

describe('OrderConfirmationEmail', () => {
  describe('Rendering', () => {
    it('should render email HTML successfully', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test Store',
          name: 'John Doe',
          orderId: 'ORDER-123',
          total: '$99.99',
        })
      )

      expect(html).toBeTruthy()
      expect(html).toContain('<!DOCTYPE html')
    })

    it('should include order ID', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-456',
          total: '$50',
        })
      )

      expect(html).toContain('ORDER-456')
    })

    it('should include order total', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$149.99',
        })
      )

      expect(html).toContain('$149.99')
    })

    it('should include customer name', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'Jane Smith',
          orderId: 'ORDER-123',
          total: '$99',
        })
      )

      expect(html).toContain('Jane Smith')
      expect(html).toContain('Hi')
    })

    it('should include view order button when URL provided', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$99',
          orderUrl: 'https://example.com/orders/123',
        })
      )

      expect(html).toContain('View Order Details')
      expect(html).toContain('https://example.com/orders/123')
    })

    it('should not include button when no URL provided', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$99',
        })
      )

      expect(html).not.toContain('View Order Details')
    })

    it('should include confirmation message', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$99',
        })
      )

      expect(html).toContain('Order Confirmed')
      expect(html).toContain('Thank you for your order')
    })

    it('should include shipping notification', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$99',
        })
      )

      expect(html).toContain('when your order ships')
    })
  })

  describe('Email Structure', () => {
    it('should have proper HTML structure', async () => {
      const html = await render(
        OrderConfirmationEmail({
          tenantName: 'Test',
          name: 'John',
          orderId: 'ORDER-123',
          total: '$99',
        })
      )

      expect(html).toContain('<html')
      expect(html).toContain('<head')
      expect(html).toContain('<body')
      expect(html).toContain('</html>')
    })
  })
})
