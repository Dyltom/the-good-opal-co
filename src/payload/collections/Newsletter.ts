import type { CollectionConfig } from 'payload'

export const Newsletter: CollectionConfig = {
  slug: 'newsletter-subscribers',
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true, // Allow public signups
    update: ({ req: { user } }) => user?.['role'] === 'admin',
    delete: ({ req: { user } }) => user?.['role'] === 'admin',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'subscribedAt', 'updatedAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Unsubscribed',
          value: 'unsubscribed',
        },
        {
          label: 'Bounced',
          value: 'bounced',
        },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      admin: {
        description: 'Associated tenant ID for multi-tenancy',
      },
      index: true,
    },
  ],
  timestamps: true,
}
