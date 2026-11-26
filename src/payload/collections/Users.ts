import { APIError } from 'payload'
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionConfig,
} from 'payload'
import { isAdmin, isAdminOrFirstUser, isAdminOrSelf } from '../../lib/payload-access.ts'
import { checkRateLimit, requestIdentifier } from '../../lib/rate-limit.ts'

export const promoteFirstUser: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0 ? { ...data, role: 'admin' } : data
}

const THROTTLED_AUTH_OPERATIONS = new Set(['login', 'forgotPassword', 'resetPassword', 'unlock'])

export const throttleAuthAttempts: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if (!THROTTLED_AUTH_OPERATIONS.has(operation)) return args
  const allowed = await checkRateLimit({
    scope: 'admin-auth',
    identifier: requestIdentifier(req.headers),
    limit: 10,
    windowSeconds: 15 * 60,
  })
  if (!allowed) throw new APIError('Too many attempts. Please wait 15 minutes and try again.', 429)
  return args
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
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
    beforeOperation: [throttleAuthAttempts],
  },
  timestamps: true,
}
