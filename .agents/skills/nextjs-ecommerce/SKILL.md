---
name: nextjs-ecommerce
description: Use for The Good Opal Co store, cart, checkout, Stripe payment, order, Payload CMS product, pricing, inventory, shipping, or webhook work in this Next.js ecommerce app.
---

# Next.js Ecommerce Workflow

Use this skill for ecommerce behavior changes or reviews in The Good Opal Co.
Keep implementation narrow and follow the existing Next.js App Router, Payload,
Stripe, and cookie-cart patterns.

## First Checks

1. Identify the affected flow: store browsing, PDP, cart, checkout, webhook,
   order creation, inventory, pricing, or shipping.
2. Read the nearest existing route/action/component before designing new code.
3. Confirm whether the change needs Payload schema work, generated types, Stripe
   behavior, or only UI/state handling.
4. State success criteria and the exact verification commands before editing.

## Core Rules

- Server Components are the default. Use `'use client'` only for client state,
  browser APIs, effects, or client-only libraries.
- Cart source of truth is cookie-based through `src/lib/cart.ts`.
- Server Actions live near the owning route, usually
  `src/app/(marketing)/{page}/actions.ts`.
- Validate external input with Zod at action/API boundaries.
- Import Payload generated types from `@/types/payload-types`.
- Price units vary in older code paths. Confirm whether the touched path expects
  dollars or cents before arithmetic, formatting, discounts, or Stripe
  `unit_amount`.
- Keep free shipping over AUD 500 and flat-rate shipping behavior centralized.
- Stripe checkout creates sessions only. Stock changes happen from webhook
  processing after payment completion.
- Dispatch `cart-updated` after client-visible cart changes.

## Implementation Pattern

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const inputSchema = z.object({
  productId: z.string().min(1),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function actionName(input: unknown): Promise<ActionResult> {
  const parsed = inputSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }

  // Perform the smallest necessary mutation here.
  revalidatePath('/cart')

  return { success: true }
}
```

## Verification

- UI-only ecommerce change: `pnpm validate` plus targeted browser verification
  when the change is visible.
- Cart/action utility change: `pnpm validate` and relevant Vitest tests.
- Checkout, Stripe, webhook, or order change: `pnpm validate` and targeted
  Playwright coverage for the purchase path when local services are available.
- Payload schema change: `pnpm payload generate`, then `pnpm validate`.

## References

- `REFERENCE.md` for Payload collection notes.
- `PATTERNS.md` for component and data-flow patterns.
- `docs/ARCHITECTURE.md` for full system context.
