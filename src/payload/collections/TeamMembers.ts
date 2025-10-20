import type { CollectionConfig } from 'payload'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.['role'] === 'admin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'Job title or role (e.g., "CEO", "Lead Developer")',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'twitter',
          type: 'text',
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
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
