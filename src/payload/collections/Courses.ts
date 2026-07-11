import type { CollectionConfig } from 'payload'
import { isAdmin, publishedOrAdmin } from '../../lib/payload-access.ts'

export const Courses: CollectionConfig = {
  slug: 'courses',
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'format', 'availability', 'publishedAt', 'updatedAt'],
    group: 'Education',
    description: 'Public course outlines and interest status. Lesson access is managed separately.',
  },
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'legacyWordPressId',
      type: 'number',
      unique: true,
      index: true,
      admin: { description: 'Stable LearnDash course ID when imported', readOnly: true },
    },
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 160,
      admin: { description: 'Permanent public URL identifier' },
    },
    { name: 'summary', type: 'textarea', required: true, maxLength: 420 },
    {
      name: 'introduction',
      type: 'textarea',
      required: true,
      admin: { description: 'Public course overview. Do not include protected lesson content.' },
    },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'online',
      options: [
        { label: 'Online course', value: 'online' },
        { label: 'Live online', value: 'live-online' },
        { label: 'In person', value: 'in-person' },
      ],
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      defaultValue: 'all-levels',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'All levels', value: 'all-levels' },
        { label: 'Intermediate', value: 'intermediate' },
      ],
    },
    { name: 'duration', type: 'text', maxLength: 80 },
    {
      name: 'availability',
      type: 'select',
      required: true,
      defaultValue: 'register-interest',
      options: [
        { label: 'Register interest', value: 'register-interest' },
        { label: 'Coming soon', value: 'coming-soon' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'instructor',
      type: 'group',
      fields: [
        { name: 'name', type: 'text', required: true, maxLength: 100 },
        { name: 'role', type: 'text', maxLength: 120 },
        { name: 'bio', type: 'textarea' },
      ],
    },
    {
      name: 'curriculum',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 160 },
        { name: 'summary', type: 'textarea', required: true },
        {
          name: 'topics',
          type: 'textarea',
          admin: { description: 'One public topic per line' },
        },
      ],
    },
    {
      name: 'audience',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true, maxLength: 180 }],
    },
    {
      name: 'outcomes',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true, maxLength: 180 }],
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      defaultValue: 'good-opal-co',
      index: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
