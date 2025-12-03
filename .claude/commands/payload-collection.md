# Create Payload Collection

Create a new Payload CMS collection following project conventions:

## Template
```typescript
import type { CollectionConfig } from 'payload'

export const CollectionName: CollectionConfig = {
  slug: 'collection-name',
  admin: {
    useAsTitle: 'name', // Field to use as title
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
    // Add more fields
  ],
  hooks: {
    beforeChange: [],
    afterChange: [],
  },
}
```

## Field Types Available
- `text`, `textarea`, `richText`
- `number`, `checkbox`, `date`
- `select`, `radio`, `relationship`
- `array`, `blocks`, `group`
- `upload`, `point`, `json`

## Requirements
- Use singular slug (e.g., 'product' not 'products')
- Define proper access control
- Add admin configuration for usability
- Include timestamps (automatic)
- Add to `src/payload/collections/index.ts`

What collection should I create?
