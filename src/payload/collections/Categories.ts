import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'postCount', 'updatedAt'],
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'postCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of posts in this category',
      },
      defaultValue: 0,
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
