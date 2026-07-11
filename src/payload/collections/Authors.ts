import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'legacyWordPressId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        description: 'Stable public author ID from the legacy WordPress site',
        readOnly: true,
      },
    },
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
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
