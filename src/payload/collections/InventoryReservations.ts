import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

export const InventoryReservations: CollectionConfig = {
  slug: 'inventory-reservations',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'stripeSessionId',
    defaultColumns: ['stripeSessionId', 'status', 'expiresAt', 'updatedAt'],
    group: 'E-commerce',
    description: 'Short-lived stock holds created before redirecting a customer to Stripe',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending payment', value: 'pending-payment' },
        { label: 'Consumed by paid order', value: 'consumed' },
        { label: 'Released', value: 'released' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'releasedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'releaseReason',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'consumedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'productId', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'unitAmountCents', type: 'number', required: true, min: 0 },
        { name: 'quantity', type: 'number', required: true, min: 1 },
      ],
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
