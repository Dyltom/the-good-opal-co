import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, publishedOrAdmin } from '../../lib/payload-access.ts'
import {
  validateBuilderProduct,
  validateCurrencyAmount,
  validateHexColour,
  validateWholeStock,
} from '../../lib/product-validation.ts'
import {
  applyBuilderMappingLifecycle,
  builderMappingNeedsReview,
} from '../../lib/custom-builder/mapping-lifecycle.ts'
import { validateBuilderStoneContour } from '../../lib/custom-builder/stone-contour.ts'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status', 'builderMappingStatus', 'stock', 'updatedAt'],
    components: {
      edit: {
        beforeDocumentControls: [
          '@/components/payload/AdoptBuilderCandidateButton#AdoptBuilderCandidateButton',
        ],
      },
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) =>
        applyBuilderMappingLifecycle(data, originalDoc, new Date().toISOString()),
      ({ data }) => {
        const result = validateBuilderProduct(data)
        if (result !== true) throw new Error(result)
        return data
      },
    ],
    afterChange: [
      ({ doc, previousDoc, req }) => {
        if (!builderMappingNeedsReview(doc, previousDoc)) return
        req.payload.logger.info({
          builderMappingStatus: doc.builderMappingStatus,
          msg: 'Opal builder mapping queued for admin review',
          productId: doc.id,
        })
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const activeReservations = await req.payload.count({
          collection: 'inventory-reservations',
          req,
          overrideAccess: true,
          where: {
            and: [
              { 'items.productId': { equals: String(id) } },
              { status: { in: ['active', 'pending-payment'] } },
            ],
          },
        })
        if (activeReservations.totalDocs > 0) {
          throw new Error('Product has an active checkout reservation and cannot be deleted')
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      validate: validateCurrencyAmount,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      validate: validateCurrencyAmount,
      admin: {
        description: 'Original price (for showing discounts)',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Opal Rings', value: 'opal-rings' },
        { label: 'Opal Necklaces & Pendants', value: 'opal-necklaces' },
        { label: 'Opal Earrings', value: 'opal-earrings' },
        { label: 'Opal Bracelets', value: 'opal-bracelets' },
        { label: 'Raw Opals', value: 'raw-opals' },
        { label: 'Custom Commissions', value: 'custom-commissions' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      min: 0,
      validate: validateWholeStock,
      admin: {
        description: 'Available quantity (0 = out of stock)',
      },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
      },
    },
    {
      name: 'legacyWooId',
      type: 'number',
      unique: true,
      index: true,
      access: { read: isAdminField },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Original WooCommerce product ID',
      },
    },
    {
      name: 'wooStatus',
      type: 'text',
      access: { read: isAdminField },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Original WooCommerce product status',
      },
    },
    {
      name: 'wooCatalogVisibility',
      type: 'text',
      access: { read: isAdminField },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'wooManageStock',
      type: 'checkbox',
      access: { read: isAdminField },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'wooModifiedAt',
      type: 'date',
      access: { read: isAdminField },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    // Jewelry-specific fields
    {
      name: 'material',
      type: 'select',
      options: [
        { label: 'Sterling Silver', value: 'sterling-silver' },
        { label: '14K Gold', value: '14k-gold' },
        { label: '18K Gold', value: '18k-gold' },
        { label: 'White Gold', value: 'white-gold' },
        { label: 'Rose Gold', value: 'rose-gold' },
        { label: 'Platinum', value: 'platinum' },
        { label: 'None (Raw Opal)', value: 'none' },
      ],
      admin: {
        description: 'Metal type used in the jewelry',
      },
    },
    {
      name: 'stoneType',
      type: 'select',
      options: [
        { label: 'Black Opal', value: 'black-opal' },
        { label: 'White Opal', value: 'white-opal' },
        { label: 'Boulder Opal', value: 'boulder-opal' },
        { label: 'Crystal Opal', value: 'crystal-opal' },
        { label: 'Fire Opal', value: 'fire-opal' },
        { label: 'Matrix Opal', value: 'matrix-opal' },
        { label: 'Opal Doublet', value: 'opal-doublet' },
      ],
      admin: {
        description: 'Type of opal used',
      },
    },
    {
      name: 'stoneOrigin',
      type: 'select',
      options: [
        { label: 'Lightning Ridge, NSW', value: 'lightning-ridge' },
        { label: 'Coober Pedy, SA', value: 'coober-pedy' },
        { label: 'Mintabie, SA', value: 'mintabie' },
        { label: 'Andamooka, SA', value: 'andamooka' },
        { label: 'Queensland', value: 'queensland' },
        { label: 'Other Australian', value: 'other-australian' },
      ],
      admin: {
        description: 'Australian mine location where opal was sourced',
      },
    },
    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'length',
          type: 'number',
          admin: {
            description: 'Length in mm',
          },
        },
        {
          name: 'width',
          type: 'number',
          admin: {
            description: 'Width in mm',
          },
        },
        {
          name: 'depth',
          type: 'number',
          admin: {
            description: 'Depth/height in mm',
          },
        },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        description: 'Weight in carats (for opals) or grams (for jewelry)',
      },
    },
    {
      name: 'weightUnit',
      type: 'select',
      options: [
        { label: 'Carats', value: 'carats' },
        { label: 'Grams', value: 'grams' },
      ],
      admin: {
        description: 'Required before displaying weight on finished jewellery',
      },
    },
    {
      type: 'collapsible',
      label: 'Opal builder mapping lifecycle',
      admin: {
        condition: (data) => data.category === 'raw-opals',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'builderMappingStatus',
              type: 'select',
              options: [
                { label: 'Pending review', value: 'pending' },
                { label: 'Reviewed inference', value: 'reviewed' },
                { label: 'Manual override approved', value: 'manual' },
                { label: 'Stale — review again', value: 'stale' },
              ],
              admin: {
                description:
                  'Review inferred values below. Use Manual when you intentionally override them.',
              },
            },
            {
              name: 'builderMappingConfidence',
              type: 'number',
              min: 0,
              max: 1,
              admin: {
                readOnly: true,
                description:
                  'Deterministic input completeness score; not image-recognition accuracy.',
              },
            },
            {
              name: 'builderMappingVersion',
              type: 'number',
              admin: {
                readOnly: true,
                description:
                  'Inference rules version. Version changes make approved mappings stale.',
              },
            },
            {
              name: 'builderMappingMode',
              type: 'select',
              options: [
                { label: 'Automatic inference', value: 'inferred' },
                { label: 'Protected manual mapping', value: 'manual' },
              ],
              access: { read: isAdminField },
              admin: {
                readOnly: true,
                description: 'Manual mappings remain protected when product images change.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderMappingSourceImageHash',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Changes whenever mapped source image identity or order changes.',
              },
            },
            {
              name: 'builderMappingInputHash',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Tracks source image, name, opal type, slug, and dimensions.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderMappedImageIndex',
              type: 'number',
              min: 0,
              defaultValue: 0,
              admin: {
                description: 'Zero-based gallery image used on the 3D opal face.',
              },
            },
            {
              name: 'builderMappingAnalyzedImageHash',
              type: 'text',
              access: { read: isAdminField },
              admin: {
                readOnly: true,
                description: 'Image hash last processed by automatic crop analysis.',
              },
            },
            {
              name: 'builderPhotoAnalysisVersion',
              type: 'number',
              access: { read: isAdminField },
              admin: { readOnly: true },
            },
            {
              name: 'builderPhotoAnalysisConfidence',
              type: 'number',
              min: 0,
              max: 1,
              access: { read: isAdminField },
              admin: {
                readOnly: true,
                description: 'Confidence that automatic analysis isolated one opal face.',
              },
            },
          ],
        },
        {
          name: 'builderMappingAnalysisError',
          type: 'text',
          access: { read: isAdminField },
          admin: {
            readOnly: true,
            description: 'Last automatic image-analysis failure. Empty after a successful run.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderContour',
              type: 'json',
              validate: validateBuilderStoneContour,
              admin: {
                description:
                  'Approved normalized 96-sample stone boundary. Automatic analysis never overwrites reviewed or manual values.',
              },
            },
            {
              name: 'builderContourCandidate',
              type: 'json',
              validate: validateBuilderStoneContour,
              access: { read: isAdminField },
              admin: {
                readOnly: true,
                description: 'Latest automatic contour candidate awaiting visual review.',
              },
            },
          ],
        },
        {
          name: 'builderContourSourceImageHash',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'SHA-256 of the source bytes used by the approved contour.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderPhotoCandidateFocalX',
              type: 'number',
              min: 0,
              max: 1,
              access: { read: isAdminField },
              admin: { readOnly: true, description: 'Candidate crop horizontal focus.' },
            },
            {
              name: 'builderPhotoCandidateFocalY',
              type: 'number',
              min: 0,
              max: 1,
              access: { read: isAdminField },
              admin: { readOnly: true, description: 'Candidate crop vertical focus.' },
            },
            {
              name: 'builderPhotoCandidateZoom',
              type: 'number',
              min: 1,
              max: 12,
              access: { read: isAdminField },
              admin: { readOnly: true, description: 'Candidate crop zoom.' },
            },
            {
              name: 'builderPhotoCandidateRotation',
              type: 'number',
              min: -180,
              max: 180,
              access: { read: isAdminField },
              admin: { readOnly: true, description: 'Candidate crop rotation in degrees.' },
            },
          ],
        },
        {
          name: 'builderMappingReviewedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Set when mapping is explicitly approved as Reviewed or Manual.',
          },
        },
        {
          name: 'builderMappingNotes',
          type: 'textarea',
          access: { read: isAdminField },
          admin: {
            description: 'Internal review notes, image caveats, and reasons for manual overrides.',
          },
        },
      ],
    },
    {
      name: 'builderEligible',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Show this loose opal in the custom ring builder. Requires Reviewed or Manual mapping and complete visual fields.',
        condition: (data) => data.category === 'raw-opals',
      },
    },
    {
      type: 'collapsible',
      label: 'Ring builder visual review and manual overrides',
      admin: {
        condition: (data) => data.category === 'raw-opals',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'builderSilhouette',
              type: 'select',
              options: [
                { label: 'Oval', value: 'oval' },
                { label: 'Round', value: 'round' },
                { label: 'Elongated', value: 'elongated' },
                { label: 'Cushion', value: 'cushion' },
                { label: 'Pear', value: 'pear' },
                { label: 'Heart', value: 'heart' },
              ],
            },
            {
              name: 'builderRecommendedStyle',
              type: 'select',
              options: [
                { label: 'Gemini', value: 'gemini' },
                { label: 'Coral', value: 'coral' },
                { label: 'Sun & Moon', value: 'sun-moon' },
                { label: 'Aurora', value: 'aurora' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderBodyColour',
              type: 'text',
              validate: validateHexColour,
              admin: { description: 'Six-digit hex body tone' },
            },
            {
              name: 'builderFlashColourPrimary',
              type: 'text',
              validate: validateHexColour,
              admin: { description: 'Primary play-of-colour hex' },
            },
            {
              name: 'builderFlashColourSecondary',
              type: 'text',
              validate: validateHexColour,
              admin: { description: 'Secondary play-of-colour hex' },
            },
            {
              name: 'builderFlashColourAccent',
              type: 'text',
              validate: validateHexColour,
              admin: { description: 'Accent play-of-colour hex' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'builderTransmission',
              type: 'number',
              min: 0,
              max: 1,
              admin: { description: '0 opaque, 1 transparent' },
            },
            {
              name: 'builderPhotoFocalX',
              type: 'number',
              min: 0,
              max: 1,
              admin: { description: 'Horizontal focal point, 0 to 1' },
            },
            {
              name: 'builderPhotoFocalY',
              type: 'number',
              min: 0,
              max: 1,
              admin: { description: 'Vertical focal point, 0 to 1' },
            },
            {
              name: 'builderPhotoZoom',
              type: 'number',
              min: 1,
              admin: { description: 'Crop zoom, 1 or greater' },
            },
            {
              name: 'builderPhotoRotation',
              type: 'number',
              min: -180,
              max: 180,
              defaultValue: 0,
              admin: { description: 'Base image rotation used before customer adjustments' },
            },
          ],
        },
      ],
    },
    {
      name: 'ringSize',
      type: 'text',
      admin: {
        description: 'Ring size (if applicable)',
        condition: (data) => data.category === 'opal-rings',
      },
    },
    {
      name: 'careInstructions',
      type: 'richText',
      admin: {
        description: 'Care and maintenance instructions',
      },
    },
    {
      name: 'certified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Comes with certificate of authenticity',
      },
    },
    {
      name: 'certificateNumber',
      type: 'text',
      admin: {
        description: 'Certificate of authenticity number',
        condition: (data) => data.certified,
      },
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      access: { read: isAdminField },
      admin: {
        description: 'Associated tenant ID for multi-tenancy',
      },
      index: true,
    },
  ],
  timestamps: true,
}
