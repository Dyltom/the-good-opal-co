'use client'

/**
 * Newsletter Subscription Form
 *
 * Reusable component for newsletter signup across the site.
 * Uses Server Actions for form submission.
 */

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/(marketing)/newsletter/actions'

interface NewsletterFormProps {
  variant?: 'default' | 'minimal' | 'footer'
  showName?: boolean
  className?: string
}

export function NewsletterForm({
  variant = 'default',
  showName = false,
  className = '',
}: NewsletterFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        // Reset form on success
        e.currentTarget?.reset()
      } else {
        setMessage({ type: 'error', text: result.error ?? result.message })
      }

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    })
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            disabled={isPending}
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
          >
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
        {message && (
          <p
            className={`mt-2 text-sm ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`bg-muted rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get the latest updates on new opals, exclusive offers, and opal care tips.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {showName && (
          <Input
            type="text"
            name="name"
            placeholder="Your name"
            disabled={isPending}
          />
        )}
        <div className="flex gap-2">
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
