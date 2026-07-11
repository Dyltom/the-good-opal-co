import type { Access } from 'payload'

type UserWithRole = {
  id: string | number
  role?: unknown
}

function requestUser(user: unknown): UserWithRole | null {
  if (!user || typeof user !== 'object' || !('id' in user)) return null
  return user as UserWithRole
}

export const isAdmin: Access = ({ req }) => requestUser(req.user)?.role === 'admin'

export const isAdminOrFirstUser: Access = async ({ req, data }) => {
  if (requestUser(req.user)?.role === 'admin') return true

  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const requestedEmail =
    data && typeof data === 'object' && 'email' in data && typeof data.email === 'string'
      ? data.email.trim().toLowerCase()
      : null

  if (bootstrapEmail && requestedEmail !== bootstrapEmail) return false

  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
  })

  return totalDocs === 0
}

export const isAdminOrSelf: Access = ({ req }) => {
  const user = requestUser(req.user)
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    id: {
      equals: user.id,
    },
  }
}

export const publishedOrAdmin: Access = ({ req }) => {
  if (requestUser(req.user)?.role === 'admin') return true

  return {
    status: {
      equals: 'published',
    },
  }
}

export const publishedVersionOrAdmin: Access = ({ req }) => {
  if (requestUser(req.user)?.role === 'admin') return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
