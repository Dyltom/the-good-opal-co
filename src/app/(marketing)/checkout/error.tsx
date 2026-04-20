'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ShoppingCart, Mail } from 'lucide-react'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Checkout error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
              Checkout Error
            </h1>

            <p className="text-content mb-6">
              We encountered an issue processing your checkout. Don&apos;t worry - no payment has been taken.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Your cart items are safe and no charges have been made to your card.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full" size="lg">
                Try Checkout Again
              </Button>

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Return to Cart
                </Link>
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Still having issues?
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}