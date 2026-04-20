'use client'

import { useActionState } from 'react'
import { subscribeToNewsletter } from '@/app/(marketing)/newsletter/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterFormProps {
  variant?: 'default' | 'compact' | 'hero'
  source?: 'footer' | 'popup' | 'checkout' | 'account'
  className?: string
  showName?: boolean
}

export function NewsletterForm({
  variant = 'default',
  source = 'footer',
  className,
  showName = false
}: NewsletterFormProps) {
  const [state, formAction] = useActionState(subscribeToNewsletter, null)

  return (
    <form action={formAction} className={cn('w-full', className)}>
      <input type="hidden" name="source" value={source} />

      {variant === 'hero' && (
        <div className="text-center mb-8">
          <h3 className="text-2xl font-display font-bold text-charcoal mb-2">
            Stay in the Loop
          </h3>
          <p className="text-content">
            Get exclusive offers and be the first to know about new collections
          </p>
        </div>
      )}

      <div className={cn(
        'space-y-4',
        variant === 'compact' && 'space-y-3'
      )}>
        {showName && (
          <Input
            name="name"
            type="text"
            placeholder="Your name (optional)"
            className="h-12"
            autoComplete="name"
          />
        )}

        <div className={cn(
          'flex gap-3',
          variant === 'default' && 'flex-col sm:flex-row',
          variant === 'compact' && 'flex-row'
        )}>
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="pl-10 h-12"
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            size={variant === 'compact' ? 'default' : 'lg'}
            className={cn(
              variant === 'default' && 'sm:w-auto',
              variant === 'hero' && 'px-8'
            )}
          >
            Subscribe
          </Button>
        </div>

        {/* Status messages */}
        {state && (
          <div
            className={cn(
              'flex items-start gap-2 text-sm',
              state.success ? 'text-green-600' : 'text-red-600'
            )}
          >
            {state.success ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        )}

        {/* Privacy notice */}
        <p className="text-xs text-gray-500 text-center">
          By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
        </p>
      </div>
    </form>
  )
}

/**
 * Newsletter form with loading states
 * Interface Segregation: Separate component for advanced features
 */
export function NewsletterFormWithLoading(props: NewsletterFormProps) {
  return (
    <div className={props.className}>
      <NewsletterForm {...props} />
    </div>
  )
}