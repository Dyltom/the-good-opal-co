'use client'

import { Container, Section } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { isValidEmail } from '@/lib/validation'
import { useFormState } from '@/hooks'

/**
 * Newsletter Section Props
 */
interface NewsletterSectionProps {
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  background?: 'default' | 'accent' | 'dark' | 'muted'
  className?: string
}

/**
 * Newsletter form fields
 */
type NewsletterFormFields = {
  email: string
}

/**
 * Newsletter Section Component
 * Email signup form for newsletter subscriptions
 */
export function Newsletter({
  title = 'Subscribe to Our Newsletter',
  description = 'Get the latest updates and news delivered to your inbox.',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  background = 'muted',
  className,
}: NewsletterSectionProps) {
  const form = useFormState<NewsletterFormFields>({ email: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    form.clearErrors()

    // Validate email
    if (!isValidEmail(form.values.email)) {
      form.setError('email', 'Please enter a valid email address')
      return
    }

    form.setStatus('loading')

    try {
      // TODO: Submit to API
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ email: form.values.email }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      form.setStatus('success')
      form.reset()

      // Reset success message after 3 seconds
      setTimeout(() => form.setStatus('idle'), 3000)
    } catch {
      form.setStatus('error')
      form.setError('email', 'Something went wrong. Please try again.')
    }
  }

  return (
    <Section
      padding="md"
      background={background}
      className={cn(
        background === 'dark' && 'text-background',
        className
      )}
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-muted-foreground mb-6">{description}</p>}

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              value={form.values.email}
              onChange={(e) => form.setValue('email', e.target.value)}
              placeholder={placeholder}
              disabled={form.isSubmitting || form.status === 'success'}
              className="flex-1"
              aria-label="Email address"
            />
            <Button
              type="submit"
              disabled={form.isSubmitting || form.status === 'success'}
            >
              {form.isSubmitting ? 'Subscribing...' : form.status === 'success' ? 'Subscribed!' : buttonText}
            </Button>
          </form>

          {form.errors.email && (
            <p className="text-sm text-destructive mt-2" role="alert">
              {form.errors.email}
            </p>
          )}

          {form.status === 'success' && (
            <p className="text-sm text-success mt-2" role="status">
              Thanks for subscribing! Check your email for confirmation.
            </p>
          )}
        </div>
      </Container>
    </Section>
  )
}
