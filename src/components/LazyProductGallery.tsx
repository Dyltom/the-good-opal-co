import dynamic from 'next/dynamic'

/**
 * Loading skeleton for product gallery
 */
export function ProductGallerySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Lazy-loaded Cart Page Content
 */
export const LazyCartContent = dynamic(
  () => import('@/app/(marketing)/cart/cart-content').then(mod => mod.CartPageContent),
  {
    loading: () => <CartContentSkeleton />,
    ssr: true,
  }
)

/**
 * Loading skeleton for cart content
 */
export function CartContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg">
          <div className="w-24 h-24 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Placeholder for future lazy-loaded checkout form
// export const LazyCheckoutForm = dynamic(...)

/**
 * Loading skeleton for checkout form
 */
export function CheckoutFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-12 bg-gray-300 rounded w-full" />
    </div>
  )
}