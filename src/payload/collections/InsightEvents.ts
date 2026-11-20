import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

const readOnly = { readOnly: true }

export const InsightEvents: CollectionConfig = {
  slug: 'insight-events',
  defaultSort: '-occurredAt',
  lockDocuments: false,
  timestamps: false,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'path', 'referrerHost', 'country', 'device', 'occurredAt'],
    group: 'Insights',
    description:
      'Anonymous first-party visit measurement. Visitors are a daily-rotating hash; no IP address, cookie or full browser string is stored.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true, admin: readOnly },
    { name: 'occurredAt', type: 'date', required: true, index: true, admin: readOnly },
    { name: 'path', type: 'text', required: true, admin: readOnly },
    { name: 'productId', type: 'text', index: true, admin: readOnly },
    { name: 'value', type: 'number', admin: readOnly },
    { name: 'visitor', type: 'text', index: true, admin: readOnly },
    { name: 'landingPage', type: 'text', admin: readOnly },
    { name: 'referrerHost', type: 'text', admin: readOnly },
    { name: 'utmSource', type: 'text', admin: readOnly },
    { name: 'utmMedium', type: 'text', admin: readOnly },
    { name: 'utmCampaign', type: 'text', admin: readOnly },
    { name: 'country', type: 'text', admin: readOnly },
    { name: 'device', type: 'text', admin: readOnly },
    { name: 'browser', type: 'text', admin: readOnly },
    { name: 'detail', type: 'json', admin: readOnly },
    { name: 'dedupeKey', type: 'text', unique: true, admin: { ...readOnly, hidden: true } },
  ],
}
