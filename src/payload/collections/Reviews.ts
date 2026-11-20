import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrAdmin } from '../../lib/payload-access.ts'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'source', 'reviewedAt', 'rating', 'status'],
    description:
      'Only add reviews customers actually wrote. Copy the words exactly and record where and when they were written.',
  },
  defaultSort: '-reviewedAt',
  fields: [
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 40,
      admin: { description: 'First name and last initial only, for example "Sam T."' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      maxLength: 1200,
      admin: { description: 'The review exactly as the customer wrote it.' },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Star rating out of 5. Leave empty if the customer did not give one.',
        step: 1,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'The date the customer wrote the review.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
    },
    {
      name: 'source',
      type: 'text',
      required: true,
      maxLength: 60,
      admin: { description: 'Where it was written, for example goodopalco.com, Google, Etsy or Instagram.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { description: 'Optional link to the original review.' },
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && /^https:\/\/\S+$/.test(value))
          ? true
          : 'Use a full https:// link',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: { description: 'The piece this review is about, if any. It then shows on that product page.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
