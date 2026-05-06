# Reference Documentation

## Payload Collections

### Products

```typescript
{
  slug: 'products',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'price', type: 'number', required: true }, // confirm unit in the touched code path
    { name: 'compareAtPrice', type: 'number' },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'stock', type: 'number', defaultValue: 0 },
    { name: 'material', type: 'text' },
    { name: 'stoneType', type: 'select', options: ['boulder', 'black', 'white', 'crystal', 'matrix'] },
    { name: 'stoneOrigin', type: 'text' },
    { name: 'dimensions', type: 'text' },
    { name: 'weight', type: 'number' },
    { name: 'certified', type: 'checkbox' },
    { name: 'certificateNumber', type: 'text' },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' }
  ]
}
```

### Orders

```typescript
{
  slug: 'orders',
  fields: [
    { name: 'orderNumber', type: 'text', unique: true },
    { name: 'status', type: 'select', options: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
    { name: 'customer', type: 'group', fields: [
      { name: 'email', type: 'email' },
      { name: 'name', type: 'text' }
    ]},
    { name: 'shippingAddress', type: 'group', fields: [...] },
    { name: 'items', type: 'array', fields: [
      { name: 'productId', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'price', type: 'number' },
      { name: 'quantity', type: 'number' }
    ]},
    { name: 'subtotal', type: 'number' },
    { name: 'shipping', type: 'number' },
    { name: 'tax', type: 'number' },
    { name: 'total', type: 'number' },
    { name: 'stripeSessionId', type: 'text' },
    { name: 'stripePaymentIntentId', type: 'text' }
  ]
}
```

### Customers

```typescript
{
  slug: 'customers',
  fields: [
    { name: 'email', type: 'email', unique: true },
    { name: 'name', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'subscribedToNewsletter', type: 'checkbox' },
    { name: 'totalOrders', type: 'number' },
    { name: 'totalSpent', type: 'number' },
    { name: 'lastOrderDate', type: 'date' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] }
  ]
}
```

## Utility Functions

### Price formatting

Older code paths use both cent-based and dollar-based helpers. Confirm the
expected unit before changing price math, discounts, shipping, or Stripe
`unit_amount`.

### formatPrice

```typescript
// lib/utils.ts
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(cents / 100)
}
```

### getPayload

```typescript
// lib/payload.ts
import { getPayload as getPayloadClient } from 'payload'
import config from '@/payload.config'

let cached: ReturnType<typeof getPayloadClient> | null = null

export async function getPayload() {
  if (cached) return cached
  cached = getPayloadClient({ config })
  return cached
}
```

## Environment Variables

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=goodopalco
POSTGRES_USER=goodopalco
POSTGRES_PASSWORD=goodopalcopass

# Payload
PAYLOAD_SECRET=your-32-char-secret
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:8412

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:8412

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@thegoodopaco.com.au
```
