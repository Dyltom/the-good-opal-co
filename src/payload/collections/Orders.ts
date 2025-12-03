import type { CollectionConfig } from 'payload'

/**
 * Orders Collection
 *
 * Stores customer orders with Stripe integration.
 * Orders are created by the Stripe webhook after successful payment.
 *
 * Key features:
 * - Order tracking and status management
 * - Customer and shipping information
 * - Line items with product details
 * - Stripe session and payment intent IDs
 * - Audit trail with timestamps
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'customer.email', 'createdAt'],
    group: 'E-commerce',
    description: 'Customer orders with payment and shipping details',
  },
  access: {
    // Only authenticated users can read orders
    read: ({ req }) => !!req.user,
    // Orders are created by webhook (no auth required)
    create: () => true,
    // Only authenticated users can update orders
    update: ({ req }) => !!req.user,
    // Only admins can delete orders
    delete: ({ req }) => req.user?.['role'] === 'admin',
  },
  fields: [
    // Order Identification
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Unique order identifier (e.g., OPAL-ABC123)',
      },
    },

    // Order Status
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // Customer Information
    {
      name: 'customer',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          index: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
      ],
    },

    // Shipping Address
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'line1',
          type: 'text',
          required: true,
        },
        {
          name: 'line2',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          defaultValue: 'AU',
        },
      ],
    },

    // Order Line Items
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'productId',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'image',
          type: 'text',
        },
      ],
    },

    // Order Totals
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Sum of item prices before shipping and tax',
      },
    },
    {
      name: 'shipping',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'tax',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Final order total including shipping and tax',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'AUD',
      admin: {
        position: 'sidebar',
      },
    },

    // Stripe Integration
    {
      name: 'stripeSessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Stripe Checkout Session ID',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Stripe Payment Intent ID',
      },
    },

    // Shipping & Tracking
    {
      name: 'trackingNumber',
      type: 'text',
      admin: {
        description: 'Shipping carrier tracking number',
      },
    },
    {
      name: 'shippingCarrier',
      type: 'select',
      options: [
        { label: 'Australia Post', value: 'australia-post' },
        { label: 'StarTrack', value: 'startrack' },
        { label: 'DHL', value: 'dhl' },
        { label: 'FedEx', value: 'fedex' },
        { label: 'Other', value: 'other' },
      ],
    },

    // Internal Notes
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this order',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Generate order number on create
        if (operation === 'create' && !data?.orderNumber) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          return {
            ...data,
            orderNumber: `OPAL-${timestamp}-${random}`,
          }
        }
        return data
      },
    ],
  },
}
