'use client'

import { ErrorBoundary, CartErrorFallback } from '@/components/error/ErrorBoundary'
import { CartDrawer } from './CartDrawer'

interface CartDrawerWithErrorBoundaryProps {
  children: React.ReactNode
  onCartUpdate?: () => void
}

export function CartDrawerWithErrorBoundary({
  children,
  onCartUpdate
}: CartDrawerWithErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={CartErrorFallback}>
      <CartDrawer onCartUpdate={onCartUpdate}>
        {children}
      </CartDrawer>
    </ErrorBoundary>
  )
}