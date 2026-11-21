import type { CollectionConfig } from 'payload'
import { isAdmin, isLivePost, livePostOrAdmin } from '../../lib/payload-access.ts'
import { indexNowOnPublish } from '../../lib/indexnow.ts'
import { SHOP_TENANT_ID } from '../../lib/tenant.ts'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: livePostOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      indexNowOnPublish((doc) =>
        isLivePost(doc) && typeof doc.slug === 'string'
          ? `/blog/${encodeURIComponent(doc.slug)}`
          : null
      ),
    ],
  },
  fields: [
    {
      name: 'legacyWordPressId',
      type: 'number',
      unique: true,
      index: true,
      admin: {
        description: 'Stable post ID imported from the legacy WordPress site',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary of the post',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description:
          'When this post goes live. A published post with a future date stays hidden until then.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      defaultValue: () => SHOP_TENANT_ID,
      admin: { hidden: true },
      index: true,
    },
  ],
  timestamps: true,
}
