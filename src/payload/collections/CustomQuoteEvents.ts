import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

export const CustomQuoteEvents: CollectionConfig = {
  slug: 'custom-quote-events',
  defaultSort: '-occurredAt',
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['quote', 'eventType', 'quoteRevision', 'occurredAt', 'actorType'],
    group: 'CRM',
    description: 'Append-only evidence ledger for custom quote lifecycle changes',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'quote',
      type: 'relationship',
      relationTo: 'custom-quotes',
      required: true,
      index: true,
    },
    { name: 'enquiry', type: 'relationship', relationTo: 'enquiries', required: true, index: true },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Created', value: 'created' },
        { label: 'Sent', value: 'sent' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Superseded', value: 'superseded' },
        { label: 'Deposit paid', value: 'deposit-paid' },
        { label: 'Deposit refunded', value: 'deposit-refunded' },
      ],
      admin: { readOnly: true },
    },
    { name: 'occurredAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'quoteRevision', type: 'number', required: true, admin: { readOnly: true } },
    {
      name: 'actorType',
      type: 'select',
      required: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Customer', value: 'customer' },
        { label: 'Stripe', value: 'stripe' },
        { label: 'System', value: 'system' },
      ],
      admin: { readOnly: true },
    },
    { name: 'actorEmail', type: 'email', admin: { readOnly: true } },
    { name: 'amountCents', type: 'number', required: true, min: 0, admin: { readOnly: true } },
    {
      name: 'depositAmountCents',
      type: 'number',
      required: true,
      min: 0,
      admin: { readOnly: true },
    },
    { name: 'currency', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'validUntil', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'termsSnapshot', type: 'textarea', required: true, admin: { readOnly: true } },
    { name: 'termsHash', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'evidence', type: 'json', admin: { readOnly: true } },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ context, operation }) => {
        if (operation !== 'create' || !context['quoteAuditAppend']) {
          throw new Error('Custom quote audit events are append-only system evidence')
        }
      },
    ],
    beforeDelete: [
      () => {
        throw new Error('Custom quote audit events cannot be deleted')
      },
    ],
  },
}
