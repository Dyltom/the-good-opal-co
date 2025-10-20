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
      type: 'select',
      required: true,
      options: [
        { label: 'Opal Rings', value: 'opal-rings' },
        { label: 'Opal Necklaces & Pendants', value: 'opal-necklaces' },
        { label: 'Opal Earrings', value: 'opal-earrings' },
        { label: 'Opal Bracelets', value: 'opal-bracelets' },
        { label: 'Raw Opals', value: 'raw-opals' },
        { label: 'Custom Commissions', value: 'custom-commissions' },
      ],
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
    // Jewelry-specific fields
    {
      name: 'material',
      type: 'select',
      options: [
        { label: 'Sterling Silver', value: 'sterling-silver' },
        { label: '14K Gold', value: '14k-gold' },
        { label: '18K Gold', value: '18k-gold' },
        { label: 'White Gold', value: 'white-gold' },
        { label: 'Rose Gold', value: 'rose-gold' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'None (Raw Opal)', value: 'none' },
      ],
      admin: {
        description: 'Metal type used in the jewelry',
      },
    },
    {
      name: 'stoneType',
      type: 'select',
      options: [
        { label: 'Black Opal', value: 'black-opal' },
        { label: 'White Opal', value: 'white-opal' },
        { label: 'Boulder Opal', value: 'boulder-opal' },
        { label: 'Crystal Opal', value: 'crystal-opal' },
        { label: 'Fire Opal', value: 'fire-opal' },
        { label: 'Matrix Opal', value: 'matrix-opal' },
      ],
      admin: {
        description: 'Type of opal used',
      },
    },
    {
      name: 'stoneOrigin',
      type: 'select',
      options: [
        { label: 'Lightning Ridge, NSW', value: 'lightning-ridge' },
        { label: 'Coober Pedy, SA', value: 'coober-pedy' },
        { label: 'Mintabie, SA', value: 'mintabie' },
        { label: 'Andamooka, SA', value: 'andamooka' },
        { label: 'Queensland', value: 'queensland' },
        { label: 'Other Australian', value: 'other-australian' },
      ],
      admin: {
        description: 'Australian mine location where opal was sourced',
      },
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'length',
          type: 'number',
          admin: {
            description: 'Length in mm',
          },
        },
        {
          name: 'width',
          type: 'number',
          admin: {
            description: 'Width in mm',
          },
        },
        {
          name: 'depth',
          type: 'number',
          admin: {
            description: 'Depth/height in mm',
          },
        },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        description: 'Weight in carats (for opals) or grams (for jewelry)',
      },
    },
    {
      name: 'ringSize',
      type: 'text',
      admin: {
        description: 'Ring size (if applicable)',
        condition: (data) => data.category === 'opal-rings',
      },
    },
    {
      name: 'careInstructions',
      type: 'richText',
      admin: {
        description: 'Care and maintenance instructions',
      },
    },
    {
      name: 'certified',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Comes with certificate of authenticity',
      },
    },
    {
      name: 'certificateNumber',
      type: 'text',
      admin: {
        description: 'Certificate of authenticity number',
        condition: (data) => data.certified,
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
