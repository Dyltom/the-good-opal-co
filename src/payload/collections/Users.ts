import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { isAdmin, isAdminOrFirstUser, isAdminOrSelf } from '../../lib/payload-access.ts'

export const promoteFirstUser: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0 ? { ...data, role: 'admin' } : data
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
  },
  access: {
    read: isAdminOrSelf,
    create: isAdminOrFirstUser,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      access: {
        create: ({ req: { user } }) => user?.['role'] === 'admin',
        update: ({ req: { user } }) => user?.['role'] === 'admin',
      },
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
  hooks: {
    beforeChange: [promoteFirstUser],
  },
  timestamps: true,
}
