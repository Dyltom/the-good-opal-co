import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin } from '../../lib/payload-access.ts'

export const guardRingReferenceCheckCreate: CollectionBeforeChangeHook = ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || req.context['ringReferenceAudit'] !== true) {
    throw new Error('Ring reference checks are append-only system evidence')
  }

  const ringDesign = data?.['ringDesign']
  const candidateKey = data?.['candidateKey']
  const hasRingDesign = ringDesign !== undefined && ringDesign !== null && ringDesign !== ''
  const hasCandidateKey = typeof candidateKey === 'string' && candidateKey.trim().length > 0

  if (hasRingDesign === hasCandidateKey) {
    throw new Error('Ring reference checks require exactly one design target')
  }
}

export const RingReferenceChecks: CollectionConfig = {
  slug: 'ring-reference-checks',
  defaultSort: '-checkedAt',
  admin: {
    useAsTitle: 'checkKey',
    defaultColumns: ['checkKey', 'ringDesign', 'accountHandle', 'outcome', 'checkedAt'],
    description: 'Append-only Instagram reference availability evidence for ring designs.',
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'checkKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'ringDesign',
      type: 'relationship',
      relationTo: 'ring-designs',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'candidateKey',
      type: 'text',
      index: true,
      admin: { readOnly: true },
    },
    { name: 'sourceUrl', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'accountHandle', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'shortcode', type: 'text', required: true, index: true, admin: { readOnly: true } },
    {
      name: 'checkedAt',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'outcome',
      type: 'select',
      required: true,
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Redirected', value: 'redirected' },
        { label: 'Not found', value: 'not-found' },
        { label: 'Rate limited', value: 'rate-limited' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Error', value: 'error' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'httpStatus',
      type: 'number',
      min: 100,
      max: 599,
      admin: { readOnly: true },
    },
    { name: 'resolvedUrl', type: 'text', admin: { readOnly: true } },
    { name: 'durationMs', type: 'number', min: 0, admin: { readOnly: true } },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [guardRingReferenceCheckCreate],
    beforeDelete: [
      () => {
        throw new Error('Ring reference checks cannot be deleted')
      },
    ],
  },
}
