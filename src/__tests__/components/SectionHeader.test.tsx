import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from '@/components/sections/SectionHeader'

describe('SectionHeader', () => {
  describe('Rendering', () => {
    it('should render title when provided', () => {
      render(<SectionHeader title="Test Title" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Test Title')
    })

    it('should render description when provided', () => {
      render(<SectionHeader description="Test description" />)
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render both title and description', () => {
      render(<SectionHeader title="Test Title" description="Test description" />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Title')
      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    it('should render nothing when neither title nor description provided', () => {
      const { container } = render(<SectionHeader />)
      expect(container.firstChild).toBeNull()
    })

    it('should render with only title (no description)', () => {
      const { container } = render(<SectionHeader title="Only Title" />)
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(container.querySelector('p')).not.toBeInTheDocument()
    })

    it('should render with only description (no title)', () => {
      const { container } = render(<SectionHeader description="Only description" />)
      expect(screen.getByText('Only description')).toBeInTheDocument()
      expect(container.querySelector('h2')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply centered classes by default', () => {
      const { container } = render(<SectionHeader title="Test" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('text-center')
      expect(wrapper).toHaveClass('max-w-3xl')
      expect(wrapper).toHaveClass('mx-auto')
    })

    it('should apply bottom margin by default', () => {
      const { container } = render(<SectionHeader title="Test" />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('mb-12')
    })

    it('should not apply centered classes when centered is false', () => {
      const { container } = render(<SectionHeader title="Test" centered={false} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).not.toHaveClass('text-center')
      expect(wrapper).not.toHaveClass('mx-auto')
    })

    it('should still apply max-width when not centered', () => {
      const { container } = render(<SectionHeader title="Test" centered={false} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('max-w-3xl')
    })
  })

  describe('Typography', () => {
    it('should apply correct title styles', () => {
      render(<SectionHeader title="Test Title" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('font-bold')
      expect(heading).toHaveClass('mb-4')
    })

    it('should apply correct description styles', () => {
      render(<SectionHeader description="Test description" />)
      const description = screen.getByText('Test description')
      expect(description).toHaveClass('text-lg')
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('should use h2 for title by default', () => {
      render(<SectionHeader title="Test" />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.tagName).toBe('H2')
    })

    it('should allow custom heading level', () => {
      render(<SectionHeader title="Test" headingLevel="h3" />)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading.tagName).toBe('H3')
    })

    it('should use semantic HTML for description', () => {
      render(<SectionHeader description="Test description" />)
      const description = screen.getByText('Test description')
      expect(description.tagName).toBe('P')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings for title', () => {
      const { container } = render(<SectionHeader title="" description="Desc" />)
      expect(container.querySelector('h2')).not.toBeInTheDocument()
      expect(screen.getByText('Desc')).toBeInTheDocument()
    })

    it('should handle empty strings for description', () => {
      const { container } = render(<SectionHeader title="Title" description="" />)
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(container.querySelector('p')).not.toBeInTheDocument()
    })

    it('should handle whitespace-only strings', () => {
      const { container } = render(<SectionHeader title="   " description="   " />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('TypeScript Types', () => {
    it('should accept all valid props', () => {
      // This test validates TypeScript compilation
      const validProps = {
        title: 'Test',
        description: 'Description',
        centered: true,
        headingLevel: 'h2' as const,
        className: 'custom-class',
      }
      render(<SectionHeader {...validProps} />)
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })
})
