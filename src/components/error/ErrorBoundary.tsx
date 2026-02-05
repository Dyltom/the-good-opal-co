'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-charcoal mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-content mb-6">
          We encountered an unexpected error. Don't worry, your cart and preferences are safe.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Cart-specific error boundary
export function CartErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="font-semibold text-charcoal mb-2">
        Cart temporarily unavailable
      </h3>
      <p className="text-sm text-content mb-4">
        We're having trouble loading your cart. Your items are safe.
      </p>
      <Button onClick={reset} size="sm">
        <RefreshCw className="h-3 w-3 mr-1" />
        Refresh Cart
      </Button>
    </div>
  )
}

// Checkout-specific error boundary
export function CheckoutErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-charcoal mb-2">
        Checkout Error
      </h2>
      <p className="text-content mb-6">
        We encountered an issue processing your checkout. No charges have been made.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={reset}>
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">
            Return to Cart
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Product-specific error boundary
export function ProductErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 bg-gray-50 rounded-lg text-center">
      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
      <p className="text-sm text-gray-600 mb-3">
        Unable to load product details
      </p>
      <Button onClick={reset} size="sm" variant="outline">
        Try Again
      </Button>
    </div>
  )
}