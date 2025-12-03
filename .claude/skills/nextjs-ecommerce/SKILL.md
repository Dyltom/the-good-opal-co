---
name: Next.js E-commerce
description: Specialized knowledge for building e-commerce features in Next.js 15 with Payload CMS and Stripe
triggers:
  - store
  - cart
  - checkout
  - product
  - order
  - payment
  - stripe
---

# Next.js 15 E-commerce Development

This skill provides specialized knowledge for The Good Opal Co e-commerce platform.

## Architecture Patterns

### Server Components (Default)
```typescript
// app/(marketing)/store/page.tsx
export default async function StorePage() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } }
  })
  return <StoreContent products={docs} />
}
```

### Server Actions for Mutations
```typescript
// app/(marketing)/cart/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getCart, setCart } from '@/lib/cart'

export async function addToCart(item: CartItem) {
  const cart = await getCart()
  // Update cart logic
  await setCart(updatedCart)
  revalidatePath('/cart')
  return { success: true }
}
```

### Cookie-Based Cart (NOT Context)
```typescript
// lib/cart.ts
import { cookies } from 'next/headers'

export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies()
  const cart = cookieStore.get('cart')
  return cart ? JSON.parse(cart.value) : []
}

export async function setCart(items: CartItem[]) {
  const cookieStore = await cookies()
  cookieStore.set('cart', JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
}
```

## Stripe Integration

### Checkout Session Creation
```typescript
export async function createCheckoutSession(formData: FormData) {
  const cart = await getCart()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'aud',
    line_items: cart.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: { name: item.name },
        unit_amount: item.price // in cents
      },
      quantity: item.quantity
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: { cartItems: JSON.stringify(cart) }
  })
  redirect(session.url!)
}
```

### Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body, sig, process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // Create order in Payload
    // Update customer
    // Decrement stock
  }

  return NextResponse.json({ received: true })
}
```

## Key Rules

1. **Prices in cents** - Store as integers, use `formatPrice()` for display
2. **AUD currency** - All Stripe operations use 'aud'
3. **Free shipping over $500** - Otherwise $15 flat rate
4. **Stock via webhook** - Never decrement stock in checkout action
5. **Zod validation** - All server action inputs validated

## See Also

- `REFERENCE.md` for Payload collection schemas
- `PATTERNS.md` for component patterns
