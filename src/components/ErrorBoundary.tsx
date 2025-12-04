'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component following SOLID principles
 *
 * Single Responsibility: Only handles error boundaries
 * Open/Closed: Extensible via fallback prop
 * Liskov Substitution: Can be used anywhere in component tree
 * Interface Segregation: Simple props interface
 * Dependency Inversion: Depends on ReactNode abstraction
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, info)
    }

    // In production, you might want to send this to an error reporting service
    // Example: reportErrorToService(error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-status-error/10 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-status-error" />
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold mb-2 text-content-inverse">
              Something went wrong
            </h2>
            <p className="text-content-muted mb-6">
              We encountered an error while loading this section. This is usually temporary.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-content-muted hover:text-content-inverse">
                  Error details
                </summary>
                <pre className="mt-2 p-4 bg-surface-secondary rounded-lg text-xs overflow-auto max-h-40">
                  {this.state.error.stack || this.state.error.message}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button onClick={this.reset} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher Order Component to wrap any component with ErrorBoundary
 *
 * Usage:
 * const SafeComponent = withErrorBoundary(MyComponent)
 *
 * Or with custom fallback:
 * const SafeComponent = withErrorBoundary(MyComponent, CustomErrorFallback)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Preserve display name for React DevTools
  const componentName = Component.displayName || Component.name || 'Component'
  WrappedComponent.displayName = `withErrorBoundary(${componentName})`

  return WrappedComponent
}

/**
 * Custom error fallback for product-related errors
 */
export function ProductErrorFallback(_error: Error, reset: () => void) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-surface-secondary rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-content-inverse">
          Unable to load products
        </h3>
        <p className="text-sm text-content-muted mb-4">
          Please check your connection and try again
        </p>
        <Button onClick={reset} size="sm">
          Retry
        </Button>
      </div>
    </div>
  )
}

/**
 * Custom error fallback for checkout-related errors
 */
export function CheckoutErrorFallback(_error: Error, reset: () => void) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-status-error/5 rounded-lg border border-status-error/20">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-status-error mb-4 mx-auto" />
        <h3 className="text-lg font-semibold mb-2 text-content-inverse">
          Checkout Error
        </h3>
        <p className="text-sm text-content-muted mb-4">
          We couldn&apos;t process your checkout. Your cart items are safe.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/cart'} variant="outline">
            View Cart
          </Button>
        </div>
      </div>
    </div>
  )
}