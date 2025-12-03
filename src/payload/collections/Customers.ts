/**
 * Customers Collection
 *
 * Stores customer information for CRM and email marketing.
 * Linked to orders for purchase history tracking.
 */

import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'subscribedToNewsletter', 'totalOrders', 'createdAt'],
    group: 'CRM',
    description: 'Customer database for CRM and marketing',
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
      name: 'phone',
      type: 'text',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subscribedToNewsletter',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Has opted in to receive marketing emails',
          },
        },
        {
          name: 'emailVerified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '50%',
            description: 'Email address has been verified',
          },
        },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: {
        description: 'Date when customer subscribed to newsletter',
        condition: (data) => data?.subscribedToNewsletter === true,
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Website Checkout', value: 'checkout' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Contact Form', value: 'contact' },
        { label: 'Manual Entry', value: 'manual' },
        { label: 'Import', value: 'import' },
      ],
      defaultValue: 'newsletter',
      admin: {
        description: 'How this customer was acquired',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this customer',
      },
    },
    // Statistics (computed fields)
    {
      name: 'totalOrders',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total number of orders placed',
      },
    },
    {
      name: 'totalSpent',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total amount spent (AUD)',
      },
    },
    {
      name: 'lastOrderDate',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Date of most recent order',
      },
    },
    // Shipping address (from last order)
    {
      name: 'defaultAddress',
      type: 'group',
      admin: {
        description: 'Default shipping address (from most recent order)',
      },
      fields: [
        {
          name: 'line1',
          type: 'text',
        },
        {
          name: 'line2',
          type: 'text',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              type: 'text',
              admin: { width: '50%' },
            },
            {
              name: 'state',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'postalCode',
              type: 'text',
              admin: { width: '50%' },
            },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'AU',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    // Tags for segmentation
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for customer segmentation and marketing',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set subscribedAt date when subscribing
        if (operation === 'create' && data?.subscribedToNewsletter && !data?.subscribedAt) {
          data.subscribedAt = new Date().toISOString()
        }
        // Update subscribedAt when toggling subscription
        if (operation === 'update' && data?.subscribedToNewsletter) {
          if (!data?.subscribedAt) {
            data.subscribedAt = new Date().toISOString()
          }
        }
        return data
      },
    ],
  },
}
