import { after } from 'next/server'
import { retrySerializableTransaction } from '@/lib/postgres-retry'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import type { Media as MediaDoc } from '../../types/payload-types.ts'
import { describePhoto, photoDescriberEnabled } from '../../lib/describe-photo.ts'
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

export const DESCRIBE_PHOTO_CONTEXT = 'describePhoto'

export interface DescribePhotoRequest {
  productName?: string
}

function describePhotoRequest(value: unknown): DescribePhotoRequest | null {
  if (!value || typeof value !== 'object') return null
  const productName = Reflect.get(value, 'productName')
  return typeof productName === 'string' ? { productName } : {}
}

const fillMissingAlt: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (!data) return data
  const alt = typeof data['alt'] === 'string' ? data['alt'].trim() : data['alt']
  if (operation === 'create' && !alt) {
    req.context[DESCRIBE_PHOTO_CONTEXT] ??= {}
    return { ...data, alt: altFromFilename(req.file?.name) }
  }
  if (alt === null) return { ...data, alt: '' }
  return data
}

const describeNewPhoto: CollectionAfterChangeHook<MediaDoc> = ({
  context,
  doc,
  operation,
  req,
}) => {
  const request = describePhotoRequest(context[DESCRIBE_PHOTO_CONTEXT])
  const image = req.file?.data
  if (operation !== 'create' || !request || !image?.byteLength) return doc
  if (!doc.mimeType?.startsWith('image/') || !photoDescriberEnabled()) return doc

  const altWhenUploaded = doc.alt ?? ''
  const warn = (error: unknown) =>
    req.payload.logger.warn({
      msg: 'Photo description failed; the upload keeps its fallback description',
      mediaId: doc.id,
      error: error instanceof Error ? error.message : String(error),
    })
  try {
    after(async () => {
      try {
        const alt = await describePhoto(image, request.productName)
        if (!alt) return
        const current = await req.payload.findByID({ collection: 'media', id: doc.id, depth: 0 })
        if ((current.alt ?? '') !== altWhenUploaded) return
        await retrySerializableTransaction(() =>
          req.payload.update({ collection: 'media', id: doc.id, data: { alt } })
        )
      } catch (error: unknown) {
        warn(error)
      }
    })
  } catch (error: unknown) {
    warn(error)
  }
  return doc
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
    afterChange: [invalidateBuilderMappingsForMediaReplacement, describeNewPhoto],
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
          'Optional. What the photo shows, for search engines and screen readers. Left blank, it is filled in for you.',
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
