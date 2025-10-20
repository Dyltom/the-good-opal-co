import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { EmailIcon, LinkedInIcon, TwitterIcon } from '@/components/icons'

describe('Social Icons', () => {
  describe('EmailIcon', () => {
    it('should render an email icon SVG', () => {
      const { container } = render(<EmailIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have correct viewBox for email icon', () => {
      const { container } = render(<EmailIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20')
    })

    it('should accept custom className', () => {
      const { container } = render(<EmailIcon className="custom-class" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-class')
    })

    it('should apply default size classes', () => {
      const { container } = render(<EmailIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-5')
      expect(svg).toHaveClass('w-5')
    })

    it('should merge custom classes with defaults', () => {
      const { container } = render(<EmailIcon className="text-red-500" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-5')
      expect(svg).toHaveClass('w-5')
      expect(svg).toHaveClass('text-red-500')
    })

    it('should have currentColor fill', () => {
      const { container } = render(<EmailIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('should have email icon paths', () => {
      const { container } = render(<EmailIcon />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(2)
    })
  })

  describe('LinkedInIcon', () => {
    it('should render a LinkedIn icon SVG', () => {
      const { container } = render(<LinkedInIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have correct viewBox for LinkedIn icon', () => {
      const { container } = render(<LinkedInIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('should accept custom className', () => {
      const { container } = render(<LinkedInIcon className="custom-linkedin" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-linkedin')
    })

    it('should apply default size classes', () => {
      const { container } = render(<LinkedInIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-5')
      expect(svg).toHaveClass('w-5')
    })

    it('should have currentColor fill', () => {
      const { container } = render(<LinkedInIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('should have LinkedIn icon path', () => {
      const { container } = render(<LinkedInIcon />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('TwitterIcon', () => {
    it('should render a Twitter/X icon SVG', () => {
      const { container } = render(<TwitterIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have correct viewBox for Twitter icon', () => {
      const { container } = render(<TwitterIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('should accept custom className', () => {
      const { container } = render(<TwitterIcon className="custom-twitter" />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('custom-twitter')
    })

    it('should apply default size classes', () => {
      const { container } = render(<TwitterIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass('h-5')
      expect(svg).toHaveClass('w-5')
    })

    it('should have currentColor fill', () => {
      const { container } = render(<TwitterIcon />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('should have Twitter icon path', () => {
      const { container } = render(<TwitterIcon />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('TypeScript Types', () => {
    it('should accept valid SVG props', () => {
      // Test that all icons accept standard SVG props
      const { container: emailContainer } = render(
        <EmailIcon aria-label="Email" data-testid="email" />
      )
      const { container: linkedinContainer } = render(
        <LinkedInIcon aria-label="LinkedIn" data-testid="linkedin" />
      )
      const { container: twitterContainer } = render(
        <TwitterIcon aria-label="Twitter" data-testid="twitter" />
      )

      expect(emailContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Email')
      expect(linkedinContainer.querySelector('svg')).toHaveAttribute('aria-label', 'LinkedIn')
      expect(twitterContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Twitter')
    })
  })

  describe('Consistency', () => {
    it('should have consistent API across all icons', () => {
      const { container: email } = render(<EmailIcon className="test" />)
      const { container: linkedin } = render(<LinkedInIcon className="test" />)
      const { container: twitter } = render(<TwitterIcon className="test" />)

      // All should accept className
      expect(email.querySelector('svg')).toHaveClass('test')
      expect(linkedin.querySelector('svg')).toHaveClass('test')
      expect(twitter.querySelector('svg')).toHaveClass('test')

      // All should have default size
      ;[email, linkedin, twitter].forEach((container) => {
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('h-5')
        expect(svg).toHaveClass('w-5')
      })
    })
  })
})
