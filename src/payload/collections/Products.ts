import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.['role'] === 'admin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status', 'stock', 'updatedAt'],
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
      type: 'richText',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price (for showing discounts)',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Available quantity (0 = out of stock)',
      },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
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
