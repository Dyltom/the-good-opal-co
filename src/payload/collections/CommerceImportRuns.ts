import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'

export const CommerceImportRuns: CollectionConfig = {
  slug: 'commerce-import-runs',
  defaultSort: '-startedAt',
  admin: {
    useAsTitle: 'runId',
    defaultColumns: ['runId', 'mode', 'status', 'startedAt', 'completedAt'],
    group: 'E-commerce',
    description: 'Immutable ledger preventing a WooCommerce cutover import from running twice',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'runId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'mode',
      type: 'select',
      required: true,
      options: [
        { label: 'Initial import', value: 'initial' },
        { label: 'Final cutover delta', value: 'final-delta' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { readOnly: true },
    },
    { name: 'deploymentId', type: 'text', admin: { readOnly: true } },
    { name: 'startedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'completedAt', type: 'date', admin: { readOnly: true } },
    { name: 'failedAt', type: 'date', admin: { readOnly: true } },
    { name: 'summary', type: 'json', admin: { readOnly: true } },
    { name: 'error', type: 'textarea', admin: { readOnly: true } },
  ],
}
