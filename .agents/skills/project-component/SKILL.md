---
name: project-component
description: Use when creating or modifying reusable React/Next.js components for The Good Opal Co, especially UI, product, cart, navigation, store, or section components.
---

# Project Component Workflow

Build components that match the existing design system and App Router patterns.

## Steps

1. Find the closest existing component in `src/components/` and match its style.
2. Decide whether the component can remain a Server Component. Add `'use client'`
   only when the component needs browser-only behavior.
3. Define explicit props. Do not use `any`.
4. Use existing UI primitives and `cn()` from `@/lib/utils`.
5. Keep business logic out of presentational components unless the existing
   nearby pattern already owns that logic.
6. Add labels, semantic elements, keyboard support, and focus states for
   interactive controls.

## Template

```typescript
import { cn } from '@/lib/utils'

export interface ComponentNameProps {
  className?: string
}

export function ComponentName({ className }: ComponentNameProps) {
  return <div className={cn('...', className)} />
}
```

## Verification

- Run `pnpm validate`.
- Add or update Vitest tests when behavior, branching, formatting, or state
  changes.
- For visible UI changes, verify in the Codex app browser at desktop and mobile
  widths.
