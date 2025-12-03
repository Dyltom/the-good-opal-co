# The Good Opal Co - Architecture Reference

> Quick reference for codebase structure and patterns.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| React | React | 19.x |
| CMS | Payload CMS | 3.60 |
| Database | PostgreSQL | 16 |
| ORM | Drizzle | 0.44 |
| Payments | Stripe | 19.x |
| Email | Resend + React Email | 6.x |
| UI | shadcn/ui + Radix | Latest |
| Styling | Tailwind CSS + TweakCN | 3.4 |
| Testing | Vitest + Playwright | Latest |

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Public website routes
│   │   ├── page.tsx             # Homepage
│   │   ├── store/               # Product catalog
│   │   ├── blog/                # Blog pages
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout flow
│   │   └── faq/                 # FAQ page
│   ├── (payload)/               # CMS admin routes
│   │   └── admin/               # Payload admin UI
│   └── api/                     # API routes
│       ├── stripe/              # Payment endpoints
│       ├── products/            # Product API
│       └── health/              # Health check
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── sections/                # Page sections (Hero, CTA, etc.)
│   ├── navigation/              # Header, Footer
│   ├── product/                 # Product-specific
│   ├── cart/                    # Cart components
│   ├── store/                   # Store/shop components
│   ├── blog/                    # Blog components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout helpers
│   ├── trust/                   # Trust badges
│   └── icons/                   # Icon components
├── contexts/
│   └── CartContext.tsx          # Shopping cart state
├── hooks/                       # Custom React hooks
├── lib/
│   ├── stripe.ts                # Stripe client
│   ├── email.ts                 # Email service
│   ├── api.ts                   # API helpers
│   ├── seo.ts                   # SEO utilities
│   ├── validation.ts            # Input validation
│   ├── schemas.ts               # Zod schemas
│   ├── constants.ts             # App constants
│   └── utils.ts                 # General utilities
├── payload/
│   └── collections/             # Payload CMS collections
│       ├── Users.ts
│       ├── Products.ts
│       ├── Posts.ts
│       ├── Categories.ts
│       └── Media.ts
├── data/
│   ├── products.ts              # Static product data (79 items)
│   ├── categories.ts            # Category definitions
│   └── features.ts              # Feature flags/data
├── emails/                      # React Email templates
│   ├── ContactFormEmail.tsx
│   ├── NewsletterWelcomeEmail.tsx
│   └── OrderConfirmationEmail.tsx
├── types/                       # TypeScript definitions
└── styles/                      # Global styles
```

## Key Patterns

### Component Organization

```typescript
// UI components (src/components/ui/) - Primitives
// - No business logic
// - Styled with CVA variants
// - Exported from index.ts

// Feature components (src/components/[feature]/) - Business logic
// - Compose UI primitives
// - Handle data fetching
// - Manage local state
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│   Payload   │
│   (React)   │◀────│  (Server)   │◀────│   (CMS)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Stripe    │     │   Resend    │     │  PostgreSQL │
│  (Payments) │     │  (Email)    │     │  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
```

### State Management

| State Type | Solution | Location |
|------------|----------|----------|
| Server State | React Server Components | `app/` pages |
| Cart State | React Context + localStorage | `CartContext.tsx` |
| Form State | React Hook Form / useState | Component-level |
| URL State | Next.js searchParams | Route handlers |
| CMS State | Payload Admin | `/admin` |

### API Routes Pattern

```typescript
// src/app/api/[resource]/route.ts

import { NextResponse } from 'next/server'
import { apiResponse, apiError } from '@/lib/api'

export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return NextResponse.json(apiResponse(data))
  } catch (error) {
    return NextResponse.json(apiError('Failed to fetch'), { status: 500 })
  }
}
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Payload CMS
PAYLOAD_SECRET=...
PAYLOAD_PUBLIC_SERVER_URL=...

# Next.js
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_BASE_DOMAIN=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@thegoodopal.co
CONTACT_EMAIL=contact@thegoodopal.co

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

## Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm docker:up           # Start PostgreSQL

# Testing
pnpm test                # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm validate           # Type check + lint + test

# Build
pnpm build              # Production build
pnpm start              # Start production server

# Email
pnpm email              # Preview email templates
```

## Payload Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| Users | Admin authentication | email, role |
| Products | Jewelry inventory | name, price, stock, material, stoneType |
| Posts | Blog articles | title, content, author, status |
| Categories | Blog categories | name, slug |
| Media | Image uploads | filename, alt, sizes |

## Stripe Integration

```typescript
// Checkout flow:
// 1. Client adds to cart → CartContext
// 2. Client clicks checkout → /checkout page
// 3. Server creates session → /api/stripe/cart-checkout
// 4. Redirect to Stripe → stripe.redirectToCheckout()
// 5. Success redirect → /checkout/success?session_id=
// 6. Verify session → /api/stripe/verify-session
```

## Theme System (TweakCN)

Colors use oklch for modern color accuracy:

```css
/* Primary - Opal Teal */
--primary: oklch(0.7309 0.1192 183.7657);

/* Secondary - Opal Purple */
--secondary: oklch(0.5772 0.1525 315.3182);

/* Accent - Opal Blue */
--accent: oklch(0.6531 0.1347 242.6867);
```

Fonts:
- Sans: Montserrat
- Serif: Playfair Display (headings)
- Mono: Fira Code

---

**Last Updated**: 2025-12-03
