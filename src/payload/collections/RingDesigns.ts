import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { isAdmin, publishedOrAdmin } from '../../lib/payload-access.ts'
import {
  ringDesignAssetContractSchema,
  ringDesignStyles,
  applyRingDesignApprovalLifecycle,
  validateRingDesignReference,
} from '../../lib/custom-builder/ring-design-reference.ts'
import {
  validateStoredRingAssets,
  type StoredRingAssetRecord,
} from '../../lib/custom-builder/ring-asset-ingestion.ts'

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined
}

export const invalidateRingDesignApprovalOnFidelityChange: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  const next = record(data)
  const previous = record(originalDoc)
  return applyRingDesignApprovalLifecycle(next, previous, operation)
}

interface RingAssetFinder {
  find(args: {
    collection: 'ring-assets'
    depth: 0
    overrideAccess: true
    pagination: false
    req: unknown
    where: { sha256: { in: string[] } }
  }): Promise<{ docs: StoredRingAssetRecord[] }>
}

export const requireStoredRingAssetsForApproval: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const document = { ...record(originalDoc), ...record(data) }
  if (document['status'] !== 'published') return data

  const model = ringDesignAssetContractSchema.safeParse(document['modelDefinition'])
  if (!model.success) return data
  const digests = model.data.variants.map(({ asset }) => asset.sha256)
  const payload = req.payload as unknown as RingAssetFinder
  const stored = await payload.find({
    collection: 'ring-assets',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    req,
    where: { sha256: { in: digests } },
  })
  const result = validateStoredRingAssets(model.data, stored.docs)
  if (result !== true) throw new Error(result)
  return data
}

export const RingDesigns: CollectionConfig = {
  slug: 'ring-designs',
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'style', 'status', 'makerApproved', 'updatedAt'],
    description: 'Physical reference evidence and maker approval for each ring-builder design.',
  },
  hooks: {
    beforeValidate: [
      invalidateRingDesignApprovalOnFidelityChange,
      requireStoredRingAssetsForApproval,
      ({ data, originalDoc }) => {
        const result = validateRingDesignReference(data, originalDoc)
        if (result !== true) throw new Error(result)
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'style',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: ringDesignStyles.map((value) => ({
        label: value === 'sun-moon' ? 'Sun & Moon' : `${value[0]?.toUpperCase()}${value.slice(1)}`,
        value,
      })),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft evidence', value: 'draft' },
        { label: 'Maker approved', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'sourceReferences',
      type: 'json',
      required: true,
      defaultValue: [],
      admin: {
        description:
          'Versioned source records: assetPath, sourceType, view, productSlug/sourceUrl, publication observation, verification level/date, account handle, and notes.',
      },
    },
    {
      name: 'measurements',
      type: 'json',
      admin: {
        description:
          'Caliper, photogrammetry, or maker-drawing measurements in millimetres. Required before approval.',
      },
    },
    {
      name: 'modelDefinition',
      type: 'json',
      admin: {
        description:
          'Model source, version, optional asset URL, and notes. Procedural constants alone remain draft evidence.',
      },
    },
    {
      name: 'makerApproved',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Confirms the rendered construction matches the physical master.' },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'approvalNotes',
      type: 'textarea',
      admin: {
        description: 'Name the physical master, remaining tolerances, and who approved it.',
      },
    },
  ],
  timestamps: true,
}
