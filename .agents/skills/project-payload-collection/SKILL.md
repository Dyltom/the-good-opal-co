---
name: project-payload-collection
description: Use when creating or modifying Payload CMS collections, fields, access control, admin config, hooks, or generated Payload types.
---

# Payload Collection Workflow

Use existing collection patterns in `src/payload/collections/` before adding new
schema shape.

## Steps

1. Read related collections and the collection index before editing.
2. Choose the minimal field set needed for the request.
3. Define access control deliberately. Do not make write access public.
4. Add admin columns and `useAsTitle` where useful for operators.
5. Keep hooks small and deterministic. Avoid hidden side effects.
6. Register new collections in the existing collection export path.
7. Run `pnpm payload generate` after schema changes.

## Template

```typescript
import type { CollectionConfig } from 'payload'

export const CollectionName: CollectionConfig = {
  slug: 'collection-name',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
```

## Verification

- Run `pnpm payload generate`.
- Run `pnpm validate`.
- Add tests or seed updates when the collection participates in a user flow.
