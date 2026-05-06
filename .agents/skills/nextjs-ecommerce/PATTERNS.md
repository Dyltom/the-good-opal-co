# Component Patterns

## Server Component with Data Fetching

```typescript
// Best for: Pages, data-heavy components
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: params.slug } },
    limit: 1
  })

  if (!docs[0]) notFound()

  return <ProductDetails product={docs[0]} />
}
```

## Client Component with Server Action

```typescript
// Best for: Interactive forms, buttons
'use client'

import { useTransition } from 'react'
import { addToCart } from '@/app/(marketing)/cart/actions'
import { useToast } from '@/hooks/use-toast'

export function AddToCartButton({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      })

      if (result.success) {
        toast({ title: 'Added to cart' })
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}
```

## Form with Server Action

```typescript
'use client'

import { useActionState } from 'react'
import { createCheckoutSession } from '@/app/(marketing)/checkout/actions'

export function CheckoutForm() {
  const [state, action, isPending] = useActionState(createCheckoutSession, null)

  return (
    <form action={action}>
      <Input name="email" type="email" required />
      <Input name="name" required />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Proceed to Payment'}
      </Button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  )
}
```

## Conditional Styling with cn()

```typescript
import { cn } from '@/lib/utils'

export function ProductCard({ product, className }: Props) {
  return (
    <div className={cn(
      'rounded-lg border p-4',
      product.stock === 0 && 'opacity-50',
      className
    )}>
      {/* ... */}
    </div>
  )
}
```

## Stock Status Component

```typescript
export function StockStatus({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="text-red-500">Out of Stock</span>
  }
  if (stock <= 5) {
    return <span className="text-amber-500">Only {stock} left!</span>
  }
  return <span className="text-green-500">In Stock</span>
}
```

## Loading Skeleton

```typescript
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-lg" />
      <div className="h-4 bg-gray-200 rounded mt-2 w-3/4" />
      <div className="h-4 bg-gray-200 rounded mt-1 w-1/2" />
    </div>
  )
}
```

## Error Boundary

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="text-center py-10">
      <h2>Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```
