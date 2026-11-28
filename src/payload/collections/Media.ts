import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'
import { SHOP_TENANT_ID } from '../../lib/tenant.ts'
import { invalidateBuilderMappingsForMediaReplacement } from '../../lib/custom-builder/media-mapping-invalidation.ts'

const CAMERA_FILENAME_WORDS = new Set([
  'img',
  'dsc',
  'dscn',
  'dscf',
  'pxl',
  'image',
  'photo',
  'screenshot',
  'edited',
  'copy',
  'jpg',
  'jpeg',
  'heic',
  'png',
  'webp',
])

export function altFromFilename(filename: string | undefined): string {
  const name = (filename ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_\s]+/g, ' ')
    .trim()
  const describesThePhoto = name
    .split(/[^a-z]+/i)
    .some((word) => word.length >= 3 && !CAMERA_FILENAME_WORDS.has(word.toLowerCase()))
  return describesThePhoto ? name : ''
}

const fillMissingAlt: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (!data) return data
  const alt = typeof data['alt'] === 'string' ? data['alt'].trim() : data['alt']
  if (operation === 'create' && !alt) return { ...data, alt: altFromFilename(req.file?.name) }
  if (alt === null) return { ...data, alt: '' }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'filesize', 'updatedAt'],
  },
  hooks: {
    beforeValidate: [fillMissingAlt],
    afterChange: [invalidateBuilderMappingsForMediaReplacement],
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  },
  fields: [
    {
      name: 'legacyWordPressId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        description: 'Stable attachment ID imported from the legacy WordPress site',
        readOnly: true,
        condition: (data) => Boolean(data?.['legacyWordPressId']),
      },
    },
    {
      name: 'legacySourceUrl',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Original URL for a safely imported legacy asset',
        readOnly: true,
        condition: (data) => Boolean(data?.['legacySourceUrl']),
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Description',
      admin: {
        description:
          'Optional. What the photo shows, for search engines and screen readers. Left blank, the listing name is used.',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'tenantId',
      type: 'text',
      defaultValue: () => SHOP_TENANT_ID,
      admin: { hidden: true },
      index: true,
    },
  ],
  timestamps: true,
}
