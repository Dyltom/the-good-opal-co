import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

const readOnly = { readOnly: true }

export const AuditEvents: CollectionConfig = {
  slug: 'audit-events',
  labels: { singular: 'Activity', plural: 'Activity log' },
  defaultSort: '-occurredAt',
  lockDocuments: false,
  timestamps: false,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['occurredAt', 'userEmail', 'action', 'collectionSlug', 'title'],
    listSearchableFields: ['title', 'userEmail', 'documentId'],
    group: 'Insights',
    description:
      'Who changed what in the admin, newest first. Entries cannot be edited or deleted.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'occurredAt',
      label: 'When',
      type: 'date',
      required: true,
      index: true,
      admin: { ...readOnly, date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'user', type: 'relationship', relationTo: 'users', admin: readOnly },
    { name: 'userEmail', label: 'Who', type: 'text', index: true, admin: readOnly },
    {
      name: 'how',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Claude connector', value: 'api-key' },
        { label: 'System', value: 'system' },
      ],
      admin: readOnly,
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Created', value: 'create' },
        { label: 'Updated', value: 'update' },
        { label: 'Moved to trash', value: 'trash' },
        { label: 'Restored from trash', value: 'restore' },
        { label: 'Deleted', value: 'delete' },
        { label: 'Logged in', value: 'login' },
      ],
      admin: readOnly,
    },
    {
      name: 'collectionSlug',
      label: 'Collection',
      type: 'text',
      required: true,
      index: true,
      admin: readOnly,
    },
    { name: 'documentId', type: 'text', index: true, admin: readOnly },
    { name: 'title', type: 'text', admin: readOnly },
    { name: 'changes', type: 'json', admin: readOnly },
  ],
}
