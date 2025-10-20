import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.['role'] === 'admin',
    update: ({ req: { user } }) => user?.['role'] === 'admin',
    delete: ({ req: { user } }) => user?.['role'] === 'admin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subdomain', 'status', 'plan', 'updatedAt'],
  },
  fields: [
    // Basic Information
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
      name: 'subdomain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Subdomain for the tenant (e.g., "client" for client.rapidsites.com)',
      },
    },
    {
      name: 'domain',
      type: 'text',
      unique: true,
      admin: {
        description: 'Custom domain (optional)',
      },
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
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },

    // Business Information
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },

    // Contact Information
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'street',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
            },
            {
              name: 'state',
              type: 'text',
            },
            {
              name: 'zip',
              type: 'text',
            },
            {
              name: 'country',
              type: 'text',
            },
          ],
        },
      ],
    },

    // Social Links
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'twitter',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'youtube',
          type: 'text',
        },
        {
          name: 'github',
          type: 'text',
        },
      ],
    },

    // Theme Configuration
    {
      name: 'theme',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#3b82f6',
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#8b5cf6',
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#f59e0b',
        },
        {
          name: 'fontHeading',
          type: 'text',
          defaultValue: 'Inter, sans-serif',
        },
        {
          name: 'fontBody',
          type: 'text',
          defaultValue: 'Inter, sans-serif',
        },
      ],
    },

    // Features
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'blog',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'booking',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'testimonials',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'team',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'gallery',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'ecommerce',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'contactForm',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'newsletter',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },

    // SEO Settings
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
        },
        {
          name: 'googleAnalyticsId',
          type: 'text',
        },
        {
          name: 'googleTagManagerId',
          type: 'text',
        },
      ],
    },

    // Subscription Plan
    {
      name: 'plan',
      type: 'select',
      defaultValue: 'free',
      options: [
        {
          label: 'Free',
          value: 'free',
        },
        {
          label: 'Starter',
          value: 'starter',
        },
        {
          label: 'Professional',
          value: 'professional',
        },
        {
          label: 'Enterprise',
          value: 'enterprise',
        },
      ],
    },
    {
      name: 'planExpiresAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
