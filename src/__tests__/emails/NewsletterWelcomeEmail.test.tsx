import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import NewsletterWelcomeEmail from '@/emails/NewsletterWelcomeEmail'

describe('NewsletterWelcomeEmail', () => {
  describe('Rendering', () => {
    it('should render email HTML successfully', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test Site',
        })
      )

      expect(html).toBeTruthy()
      expect(html).toContain('<!DOCTYPE html')
    })

    it('should include tenant name', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'My Newsletter',
        })
      )

      expect(html).toContain('My Newsletter')
    })

    it('should show personalized greeting when name provided', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test',
          name: 'Jane Doe',
        })
      )

      expect(html).toContain('Hi Jane Doe')
    })

    it('should show generic greeting when no name provided', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test',
        })
      )

      expect(html).toContain('Hi there')
    })

    it('should include welcome message', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test',
        })
      )

      expect(html).toContain('Thanks for Subscribing')
      expect(html).toContain('successfully subscribed')
    })

    it('should include call-to-action button', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test',
        })
      )

      expect(html).toContain('Visit Our Website')
      expect(html).toContain('href')
    })
  })

  describe('Email Structure', () => {
    it('should have proper HTML structure', async () => {
      const html = await render(
        NewsletterWelcomeEmail({
          tenantName: 'Test',
        })
      )

      expect(html).toContain('<html')
      expect(html).toContain('<head')
      expect(html).toContain('<body')
      expect(html).toContain('</html>')
    })
  })
})
