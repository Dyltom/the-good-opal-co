---
name: project-server-action
description: Use when creating or modifying Next.js Server Actions for The Good Opal Co mutations, forms, cart operations, checkout, admin actions, or Payload writes.
---

# Server Action Workflow

Server Actions should be small, typed, validated mutation boundaries.

## Steps

1. Put the action near the route that owns it, usually
   `src/app/(marketing)/{page}/actions.ts`.
2. Add `'use server'` at the top of the action file.
3. Accept `unknown` or a deliberately typed input and validate with Zod.
4. Return a discriminated typed result that the caller can narrow.
5. Use existing helpers for Payload, cart, pricing, auth, and formatting.
6. Revalidate only affected paths.
7. Avoid leaking internal errors to users. Log useful server-side context.

## Template

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const actionSchema = z.object({
  id: z.string().min(1),
})

type ActionResult = { success: true } | { success: false; error: string }

export async function actionName(input: unknown): Promise<ActionResult> {
  const parsed = actionSchema.safeParse(input)

  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }

  try {
    revalidatePath('/affected-path')
    return { success: true }
  } catch (error) {
    console.error('actionName failed', error)
    return { success: false, error: 'Operation failed' }
  }
}
```

## Verification

- Run `pnpm validate`.
- Add or update tests for validation failures and the main success path when the
  action has branching or user-visible behavior.
