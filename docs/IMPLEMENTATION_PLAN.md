# The Good Opal Co - Modern Implementation Plan

> **Philosophy**: Server-first, minimal client JS, direct Payload queries, colocated code.

**Last Updated**: 2025-12-03
**Stack**: Next.js 15 | React 19 | Payload CMS 3 | PostgreSQL | Stripe | shadcn/ui

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [What to Delete](#what-to-delete)
3. [New Folder Structure](#new-folder-structure)
4. [Phase 1: Foundation Rebuild](#phase-1-foundation-rebuild)
5. [Phase 2: E-commerce Core](#phase-2-e-commerce-core)
6. [Phase 3: Orders & Checkout](#phase-3-orders--checkout)
7. [Phase 4: SEO & Performance](#phase-4-seo--performance)
8. [Phase 5: CRM & Growth](#phase-5-crm--growth)
9. [Code Patterns](#code-patterns)
10. [Migration Checklist](#migration-checklist)

---

## Architecture Overview

### The Modern Way (2025)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                   │
│  Minimal JS: Cart button, quantity selector, image gallery      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENTS                             │
│  • Product listings (direct Payload query)                      │
│  • Product detail pages                                         │
│  • Blog posts                                                   │
│  • Cart page (reads from cookie)                                │
│  • Checkout page                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS                                │
│  • addToCart()     → Updates cookie                             │
│  • removeFromCart() → Updates cookie                            │
│  • createCheckout() → Creates Stripe session                    │
│  • subscribe()      → Adds to newsletter                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYLOAD CMS (Local API)                       │
│  payload.find() / payload.create() / payload.update()           │
│  NO REST. NO GraphQL. Direct database queries.                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| **Server by default** | Only add `"use client"` when truly needed |
| **No API routes for internal data** | Use Payload Local API directly |
| **Server Actions for mutations** | Forms submit to actions, not `/api/*` |
| **Cookie-based cart** | No Context, no localStorage, works with SSR |
| **Colocated code** | Actions live next to pages that use them |
| **Minimal abstractions** | No service layer, no repository pattern |

---

## What to Delete

### Files to Remove

```bash
# Over-engineered API routes (replace with Server Actions)
src/app/api/stripe/checkout/route.ts
src/app/api/stripe/cart-checkout/route.ts
src/app/api/stripe/verify-session/route.ts
src/app/api/products/route.ts        # If exists - query Payload directly

# Context-based cart (replace with cookie cart)
src/contexts/CartContext.tsx
src/hooks/useCart.ts

# Over-abstracted utilities
src/lib/api.ts                       # No need for API helpers
src/hooks/useForm.ts                 # Use React 19 useActionState
src/hooks/useFormState.ts            # Use React 19 useActionState

# Unnecessary abstractions
src/lib/schemas.ts                   # Inline Zod schemas where used
```

### Patterns to Eliminate

| Old Pattern | Replace With |
|-------------|--------------|
| `fetch('/api/products')` | `payload.find({ collection: 'products' })` |
| `CartContext.Provider` | Cookie-based cart utilities |
| `useCart()` hook | `getCart()` server function + `addToCart` action |
| `useForm()` custom hook | `useActionState()` from React 19 |
| `/api/stripe/checkout` route | `createCheckoutSession` Server Action |

---

## New Folder Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx              # Marketing layout with nav/footer
│   │   ├── page.tsx                # Homepage
│   │   ├── about/page.tsx
│   │   ├── faq/page.tsx
│   │   └── blog/
│   │       ├── page.tsx            # Blog listing
│   │       └── [slug]/page.tsx     # Blog post
│   │
│   ├── (store)/
│   │   ├── layout.tsx              # Store layout
│   │   ├── page.tsx                # Store/products listing
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # Product detail
│   │   │   └── opengraph-image.tsx # Dynamic OG image
│   │   ├── cart/
│   │   │   ├── page.tsx            # Cart page (server rendered)
│   │   │   └── actions.ts          # addToCart, removeFromCart, updateQuantity
│   │   └── checkout/
│   │       ├── page.tsx            # Checkout form
│   │       ├── actions.ts          # createCheckoutSession
│   │       └── success/page.tsx    # Order confirmation
│   │
│   ├── (payload)/                   # Keep as-is
│   │   ├── admin/[[...segments]]/
│   │   └── api/[...slug]/route.ts  # Payload API (for admin)
│   │
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/route.ts     # ONLY webhook - must be API route
│   │
│   ├── sitemap.ts                   # Dynamic sitemap
│   ├── robots.ts                    # robots.txt
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # TweakCN theme
│
├── components/
│   ├── ui/                          # shadcn/ui (keep)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── product-card.tsx             # Simple product card
│   ├── product-grid.tsx             # Grid of products
│   ├── add-to-cart-button.tsx       # Client component (needs interactivity)
│   ├── cart-icon.tsx                # Header cart with count
│   ├── cart-items.tsx               # Cart line items
│   ├── checkout-form.tsx            # Client component for form
│   ├── newsletter-form.tsx          # Client component for form
│   ├── header.tsx                   # Site header
│   ├── footer.tsx                   # Site footer
│   └── json-ld.tsx                  # Structured data component
│
├── lib/
│   ├── payload.ts                   # Payload client singleton
│   ├── stripe.ts                    # Stripe client
│   ├── cart.ts                      # Cookie cart utilities
│   ├── utils.ts                     # cn(), formatPrice(), etc.
│   └── constants.ts                 # Site config, URLs
│
├── payload/
│   ├── collections/
│   │   ├── Products.ts              # Keep
│   │   ├── Orders.ts                # NEW
│   │   ├── Customers.ts             # NEW
│   │   ├── Posts.ts                 # Keep
│   │   ├── Categories.ts            # Keep
│   │   ├── Media.ts                 # Keep
│   │   └── Users.ts                 # Keep
│   └── payload.config.ts
│
├── emails/                          # Keep React Email templates
│   ├── order-confirmation.tsx
│   ├── newsletter-welcome.tsx
│   └── contact-form.tsx
│
├── data/
│   └── products.ts                  # Keep 79 products for seeding
│
└── types/
    └── index.ts                     # Minimal shared types
```

---

## Phase 1: Foundation Rebuild

> **Goal**: Set up the modern foundation with cookie cart and direct Payload queries.

### Task 1.1: Payload Client Singleton

**File**: `src/lib/payload.ts`

```typescript
import { getPayload as getPayloadClient } from 'payload'
import config from '@payload-config'

export const getPayload = () => getPayloadClient({ config })
```

### Task 1.2: Cookie-Based Cart

**File**: `src/lib/cart.ts`

```typescript
import { cookies } from 'next/headers'

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Cart {
  items: CartItem[]
  total: number
}

const CART_COOKIE = 'cart'

export async function getCart(): Promise<Cart> {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(CART_COOKIE)

  if (!cartCookie?.value) {
    return { items: [], total: 0 }
  }

  try {
    const items: CartItem[] = JSON.parse(cartCookie.value)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { items, total }
  } catch {
    return { items: [], total: 0 }
  }
}

export async function setCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}
```

### Task 1.3: Cart Server Actions

**File**: `src/app/(store)/cart/actions.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { getCart, setCart, type CartItem } from '@/lib/cart'

export async function addToCart(item: Omit<CartItem, 'quantity'>) {
  const cart = await getCart()
  const existingIndex = cart.items.findIndex(i => i.productId === item.productId)

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += 1
  } else {
    cart.items.push({ ...item, quantity: 1 })
  }

  await setCart(cart.items)
  revalidatePath('/', 'layout')
}

export async function removeFromCart(productId: string) {
  const cart = await getCart()
  const items = cart.items.filter(i => i.productId !== productId)
  await setCart(items)
  revalidatePath('/', 'layout')
}

export async function updateQuantity(productId: string, quantity: number) {
  const cart = await getCart()
  const item = cart.items.find(i => i.productId === productId)

  if (item) {
    if (quantity <= 0) {
      await removeFromCart(productId)
    } else {
      item.quantity = quantity
      await setCart(cart.items)
      revalidatePath('/', 'layout')
    }
  }
}

export async function clearCart() {
  await setCart([])
  revalidatePath('/', 'layout')
}
```

### Task 1.4: Add to Cart Button (Client Component)

**File**: `src/components/add-to-cart-button.tsx`

```typescript
'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/(store)/cart/actions'
import type { CartItem } from '@/lib/cart'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(product)
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}
```

---

## Phase 2: E-commerce Core

> **Goal**: Rebuild product pages with direct Payload queries.

### Task 2.1: Store Page (Server Component)

**File**: `src/app/(store)/page.tsx`

```typescript
import { getPayload } from '@/lib/payload'
import { ProductGrid } from '@/components/product-grid'

export const metadata = {
  title: 'Store | The Good Opal Co',
  description: 'Shop our collection of authentic Australian opals',
}

export default async function StorePage() {
  const payload = await getPayload()

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-serif mb-8">Our Collection</h1>
      <ProductGrid products={products} />
    </main>
  )
}
```

### Task 2.2: Product Detail Page

**File**: `src/app/(store)/[slug]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { formatPrice } from '@/lib/utils'
import { JsonLd } from '@/components/json-ld'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const product = docs[0]
  if (!product) return {}

  return {
    title: `${product.name} | The Good Opal Co`,
    description: product.description?.slice(0, 160),
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const product = docs[0]
  if (!product) notFound()

  return (
    <main className="container py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images?.[0]?.url,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'AUD',
            availability: product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product images */}
        <div>
          {/* Image gallery component */}
        </div>

        {/* Product info */}
        <div>
          <h1 className="text-3xl font-serif">{product.name}</h1>
          <p className="text-2xl mt-4">{formatPrice(product.price)}</p>
          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.url,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
```

### Task 2.3: Cart Page

**File**: `src/app/(store)/cart/page.tsx`

```typescript
import Link from 'next/link'
import { getCart } from '@/lib/cart'
import { CartItems } from '@/components/cart-items'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Cart | The Good Opal Co',
}

export default async function CartPage() {
  const cart = await getCart()

  if (cart.items.length === 0) {
    return (
      <main className="container py-12 text-center">
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <Button asChild>
          <Link href="/store">Continue Shopping</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-serif mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <CartItems items={cart.items} />
        </div>

        <div className="bg-card p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          <Button asChild className="w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
```

---

## Phase 3: Orders & Checkout

> **Goal**: Stripe checkout via Server Actions, webhook for order creation.

### Task 3.1: Orders Collection

**File**: `src/payload/collections/Orders.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'createdAt'],
  },
  access: {
    read: ({ req }) => !!req.user,
    create: () => true, // Webhook creates orders
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text', required: true },
        { name: 'postalCode', type: 'text', required: true },
        { name: 'country', type: 'text', required: true, defaultValue: 'AU' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'productId', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'image', type: 'text' },
      ],
    },
    { name: 'subtotal', type: 'number', required: true },
    { name: 'shipping', type: 'number', defaultValue: 0 },
    { name: 'tax', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    { name: 'currency', type: 'text', defaultValue: 'AUD' },
    { name: 'stripeSessionId', type: 'text', required: true, unique: true },
    { name: 'stripePaymentIntentId', type: 'text' },
    { name: 'trackingNumber', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
```

### Task 3.2: Checkout Server Action

**File**: `src/app/(store)/checkout/actions.ts`

```typescript
'use server'

import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { getCart, clearCart } from '@/lib/cart'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(formData: FormData) {
  const cart = await getCart()

  if (cart.items.length === 0) {
    throw new Error('Cart is empty')
  }

  const email = formData.get('email') as string
  const name = formData.get('name') as string

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: cart.items.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    shipping_address_collection: {
      allowed_countries: ['AU', 'NZ', 'US', 'GB', 'CA'],
    },
    metadata: {
      cartItems: JSON.stringify(cart.items),
      customerName: name,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
  })

  redirect(session.url!)
}
```

### Task 3.3: Stripe Webhook (Only API Route Needed)

**File**: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Check if order already exists (idempotency)
    const payload = await getPayload()
    const existing = await payload.find({
      collection: 'orders',
      where: { stripeSessionId: { equals: session.id } },
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ received: true })
    }

    // Parse cart from metadata
    const items = JSON.parse(session.metadata?.cartItems || '[]')
    const customerName = session.metadata?.customerName || ''

    // Generate order number
    const orderNumber = `OPAL-${Date.now().toString(36).toUpperCase()}`

    // Create order
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        status: 'processing',
        customer: {
          email: session.customer_email!,
          name: customerName,
        },
        shippingAddress: {
          line1: session.shipping_details?.address?.line1 || '',
          line2: session.shipping_details?.address?.line2 || '',
          city: session.shipping_details?.address?.city || '',
          state: session.shipping_details?.address?.state || '',
          postalCode: session.shipping_details?.address?.postal_code || '',
          country: session.shipping_details?.address?.country || 'AU',
        },
        items,
        subtotal: session.amount_subtotal! / 100,
        total: session.amount_total! / 100,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
      },
    })

    // Send confirmation email
    await resend.emails.send({
      from: 'orders@thegoodopal.co',
      to: session.customer_email!,
      subject: `Order Confirmed - ${orderNumber}`,
      // Use React Email template
    })

    // Decrement stock
    for (const item of items) {
      await payload.update({
        collection: 'products',
        id: item.productId,
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
```

### Task 3.4: Checkout Success Page

**File**: `src/app/(store)/checkout/success/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { clearCart } from '@/lib/cart'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/store')
  }

  const session = await stripe.checkout.sessions.retrieve(session_id)

  if (session.payment_status !== 'paid') {
    redirect('/cart')
  }

  // Clear the cart
  await clearCart()

  return (
    <main className="container py-12 text-center">
      <h1 className="text-3xl font-serif mb-4">Thank You!</h1>
      <p className="text-muted-foreground mb-8">
        Your order has been confirmed. We'll send you an email with tracking details soon.
      </p>
      <p className="text-sm">
        Order confirmation sent to: {session.customer_email}
      </p>
    </main>
  )
}
```

---

## Phase 4: SEO & Performance

> **Goal**: JSON-LD, sitemap, OG images, Core Web Vitals.

### Task 4.1: JSON-LD Component

**File**: `src/components/json-ld.tsx`

```typescript
interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### Task 4.2: Dynamic Sitemap

**File**: `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()
  const baseUrl = 'https://thegoodopal.co'

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 1000,
  })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 1000,
  })

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/store`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), priority: 0.7 },
    ...products.map(p => ({
      url: `${baseUrl}/store/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.8,
    })),
    ...posts.map(p => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.7,
    })),
  ]
}
```

### Task 4.3: Robots.txt

**File**: `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: 'https://thegoodopal.co/sitemap.xml',
  }
}
```

---

## Phase 5: CRM & Growth

> **Goal**: Customer collection, newsletter, analytics.

### Task 5.1: Customers Collection

**File**: `src/payload/collections/Customers.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'totalOrders', 'totalSpent'],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'name', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'totalOrders', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'totalSpent', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
```

### Task 5.2: Newsletter Server Action

**File**: `src/app/(marketing)/actions.ts`

```typescript
'use server'

import { getPayload } from '@/lib/payload'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  email: z.string().email(),
})

export async function subscribeToNewsletter(formData: FormData) {
  const result = schema.safeParse({ email: formData.get('email') })

  if (!result.success) {
    return { error: 'Invalid email address' }
  }

  const { email } = result.data
  const payload = await getPayload()

  // Check if already subscribed
  const existing = await payload.find({
    collection: 'newsletter-subscribers',
    where: { email: { equals: email } },
  })

  if (existing.docs.length > 0) {
    return { error: 'Already subscribed' }
  }

  // Create subscriber
  await payload.create({
    collection: 'newsletter-subscribers',
    data: { email, status: 'active', source: 'website' },
  })

  // Send welcome email
  await resend.emails.send({
    from: 'hello@thegoodopal.co',
    to: email,
    subject: 'Welcome to The Good Opal Co',
    // React Email template
  })

  return { success: true }
}
```

---

## Code Patterns

### Pattern 1: Server Component with Payload Query

```typescript
// Always use async Server Components
export default async function Page() {
  const payload = await getPayload()
  const data = await payload.find({ collection: 'xxx' })
  return <Component data={data.docs} />
}
```

### Pattern 2: Server Action with Form

```typescript
// actions.ts
'use server'
export async function myAction(formData: FormData) {
  // Process form
  revalidatePath('/')
}

// page.tsx (Server Component)
import { myAction } from './actions'

export default function Page() {
  return (
    <form action={myAction}>
      <input name="field" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Pattern 3: Client Component Only When Needed

```typescript
'use client'

import { useTransition } from 'react'

export function InteractiveComponent() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await serverAction()
    })
  }

  return <button onClick={handleClick} disabled={isPending}>Click</button>
}
```

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `src/lib/payload.ts`
- [ ] Create `src/lib/cart.ts` with cookie utilities
- [ ] Create `src/app/(store)/cart/actions.ts`
- [ ] Create `src/components/add-to-cart-button.tsx`
- [ ] Delete `src/contexts/CartContext.tsx`
- [ ] Delete `src/hooks/useCart.ts`

### Phase 2: E-commerce
- [ ] Rebuild `src/app/(store)/page.tsx` with direct Payload query
- [ ] Rebuild `src/app/(store)/[slug]/page.tsx`
- [ ] Rebuild `src/app/(store)/cart/page.tsx`
- [ ] Delete old API routes

### Phase 3: Orders
- [ ] Create `src/payload/collections/Orders.ts`
- [ ] Create `src/app/(store)/checkout/actions.ts`
- [ ] Create `src/app/api/webhooks/stripe/route.ts`
- [ ] Create `src/app/(store)/checkout/success/page.tsx`
- [ ] Delete old `/api/stripe/*` routes

### Phase 4: SEO
- [ ] Create `src/components/json-ld.tsx`
- [ ] Create `src/app/sitemap.ts`
- [ ] Create `src/app/robots.ts`
- [ ] Add JSON-LD to product pages

### Phase 5: CRM
- [ ] Create `src/payload/collections/Customers.ts`
- [ ] Create `src/payload/collections/NewsletterSubscribers.ts`
- [ ] Create newsletter subscription action
- [ ] Update webhook to create/update customers

---

## Summary

| Before | After |
|--------|-------|
| 15+ API routes | 1 webhook route |
| CartContext + localStorage | Cookie cart + Server Actions |
| Client-side data fetching | Server Component queries |
| Complex service layer | Direct Payload calls |
| ~50% client components | ~10% client components |

**Result**: Faster, simpler, more maintainable, SEO-friendly, and following 2025 best practices.

---

**Version**: 3.0
**Author**: Claude Code Agent
**Date**: 2025-12-03
