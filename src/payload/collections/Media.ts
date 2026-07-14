import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../lib/payload-access.ts'
import { invalidateBuilderMappingsForMediaReplacement } from '../../lib/custom-builder/media-mapping-invalidation.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  hooks: {
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
    mimeTypes: ['image/*'],
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
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'tenantId',
      type: 'text',
      admin: {
        description: 'Associated tenant ID for multi-tenancy',
      },
      index: true,
    },
  ],
  timestamps: true,
}
