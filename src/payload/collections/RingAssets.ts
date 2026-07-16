import type {
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'
import {
  inspectRingGlb,
  MAX_RING_ASSET_BYTES,
  RING_ASSET_VALIDATION_VERSION,
} from '../../lib/custom-builder/ring-asset-ingestion.ts'

const validationFields = [
  'bounds',
  'byteLength',
  'filename',
  'filesize',
  'materialNames',
  'mimeType',
  'nodeNames',
  'sha256',
  'validated',
  'validationVersion',
  'url',
] as const

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function uploadedFile(req: object): Record<string, unknown> | undefined {
  return record(Reflect.get(req, 'file'))
}

function uploadedBytes(file: Record<string, unknown>): Buffer {
  const data = file['data']
  if (Buffer.isBuffer(data)) return data
  if (data instanceof Uint8Array) return Buffer.from(data)
  throw new Error('Ring GLB upload bytes are unavailable for server-side validation')
}

/** Keeps validation metadata server-authored and tied to the exact upload bytes. */
export const inspectRingAssetUpload: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
  req,
}) => {
  const next = record(data) ?? {}
  const previous = record(originalDoc)
  const file = uploadedFile(req)

  if (!file) {
    if (!previous) return { ...next, validated: false }
    return {
      ...next,
      ...Object.fromEntries(validationFields.map((field) => [field, previous[field]])),
    }
  }

  if (file['mimetype'] !== 'model/gltf-binary') {
    throw new Error('Ring assets must use the model/gltf-binary MIME type')
  }
  const inspection = inspectRingGlb(uploadedBytes(file))
  Reflect.set(file, 'name', `${inspection.sha256}.glb`)

  return {
    ...next,
    ...inspection,
    validated: true,
  }
}

/** Content identities are immutable; revised exports are separate records. */
export const prepareRingAssetUpload: CollectionBeforeOperationHook = ({ operation, req }) => {
  const file = uploadedFile(req)
  if (!file) return
  if (operation === 'update') {
    throw new Error('Ring asset bytes are immutable; create a new asset for each revised GLB')
  }
  if (file['mimetype'] !== 'model/gltf-binary') {
    throw new Error('Ring assets must use the model/gltf-binary MIME type')
  }
  const inspection = inspectRingGlb(uploadedBytes(file))
  Reflect.set(file, 'name', `${inspection.sha256}.glb`)
}

/** Published contracts store content identity in JSON, so assets stay permanent. */
export function preventRingAssetDeletion(): never {
  throw new Error('Validated ring assets are immutable and cannot be deleted')
}

export const RingAssets: CollectionConfig = {
  slug: 'ring-assets',
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sha256', 'byteLength', 'validated', 'updatedAt'],
    description: `Immutable maker-reviewed GLB models, maximum ${MAX_RING_ASSET_BYTES / 1024 / 1024} MiB. Revised bytes require a new content identity.`,
  },
  hooks: {
    beforeOperation: [prepareRingAssetUpload],
    beforeValidate: [inspectRingAssetUpload],
    beforeDelete: [preventRingAssetDeletion],
  },
  upload: {
    staticDir: 'ring-assets',
    mimeTypes: ['model/gltf-binary'],
    pasteURL: false,
    hideRemoveFile: true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Artist/CAD source, export settings, and physical master provenance.' },
    },
    {
      name: 'sha256',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'byteLength',
      type: 'number',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'validationVersion',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'validated',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'nodeNames',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: 'Unique named nodes parsed from the GLB default scene.',
      },
    },
    {
      name: 'materialNames',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: 'Unique named materials parsed from the GLB.',
      },
    },
    {
      name: 'bounds',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: `World bounds in authored millimetres, validated by ${RING_ASSET_VALIDATION_VERSION}.`,
      },
    },
  ],
  timestamps: true,
}
