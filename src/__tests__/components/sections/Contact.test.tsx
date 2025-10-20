import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Contact } from '@/components/sections/Contact'

// Mock fetch
global.fetch = vi.fn()

describe('Contact Section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default title', () => {
      render(<Contact />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Get in Touch')
    })

    it('should render with custom title', () => {
      render(<Contact title="Contact Us" />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Contact Us')
    })

    it('should render description when provided', () => {
      render(<Contact description="We'd love to hear from you" />)
      expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<Contact />)
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<Contact />)
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })
  })

  describe('Contact Information', () => {
    it('should not render contact info section when no info provided', () => {
      render(<Contact />)
      expect(screen.queryByText('Contact Information')).not.toBeInTheDocument()
    })

    it('should render email when provided', () => {
      render(<Contact email="test@example.com" />)
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should render phone when provided', () => {
      render(<Contact phone="555-0123" />)
      expect(screen.getByText('555-0123')).toBeInTheDocument()
    })

    it('should render address when provided', () => {
      render(<Contact address="123 Main St" />)
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
    })

    it('should render map placeholder when showMap is true', () => {
      render(<Contact showMap />)
      expect(screen.getByText('Map Placeholder')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        ok: true,
        json: async () => ({ data: { message: 'Success!' } }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      render(<Contact />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'Hello!')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/contact',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'John Doe',
              email: 'john@example.com',
              phone: '',
              message: 'Hello!',
            }),
          })
        )
      })
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global.fetch as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      render(<Contact />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'Hello!')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      expect(submitButton).toHaveTextContent('Sending...')
      expect(submitButton).toBeDisabled()
      expect(screen.getByLabelText(/name/i)).toBeDisabled()
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        ok: true,
        json: async () => ({ data: { message: 'Success!' } }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<Contact />)

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(messageInput, 'Hello!')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(emailInput.value).toBe('')
        expect(messageInput.value).toBe('')
      })

      alertMock.mockRestore()
    })

    it('should handle submission errors', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Failed to send' }),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<Contact />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'Hello!')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Failed to send')
      })

      alertMock.mockRestore()
    })

    it('should handle network errors', async () => {
      const user = userEvent.setup()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<Contact />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'Hello!')
      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Failed to send message. Please try again.')
      })

      alertMock.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<Contact />)

      expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message \*/i)).toBeInTheDocument()
    })

    it('should have required attributes on required fields', () => {
      render(<Contact />)

      expect(screen.getByLabelText(/name \*/i)).toBeRequired()
      expect(screen.getByLabelText(/email \*/i)).toBeRequired()
      expect(screen.getByLabelText(/message \*/i)).toBeRequired()
      expect(screen.getByLabelText(/phone/i)).not.toBeRequired()
    })

    it('should have correct input types', () => {
      render(<Contact />)

      expect(screen.getByLabelText(/email \*/i)).toHaveAttribute('type', 'email')
      expect(screen.getByLabelText(/phone/i)).toHaveAttribute('type', 'tel')
    })

    it('should have accessible links for contact info', () => {
      render(<Contact email="test@example.com" phone="555-0123" />)

      const emailLink = screen.getByRole('link', { name: 'test@example.com' })
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com')

      const phoneLink = screen.getByRole('link', { name: '555-0123' })
      expect(phoneLink).toHaveAttribute('href', 'tel:555-0123')
    })
  })

  describe('Form Validation', () => {
    it('should use HTML5 validation for required fields', () => {
      render(<Contact />)

      const nameInput = screen.getByLabelText(/name \*/i)
      const emailInput = screen.getByLabelText(/email \*/i)
      const messageInput = screen.getByLabelText(/message \*/i)

      expect(nameInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('required')
      expect(messageInput).toHaveAttribute('required')
    })

    it('should have email type for email validation', () => {
      render(<Contact />)

      const emailInput = screen.getByLabelText(/email \*/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })
})
