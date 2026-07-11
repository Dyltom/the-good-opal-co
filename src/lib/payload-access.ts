import { timingSafeEqual } from 'node:crypto'
import type { Access, FieldAccess } from 'payload'

type UserWithRole = {
  id: string | number
  role?: unknown
}

function requestUser(user: unknown): UserWithRole | null {
  if (!user || typeof user !== 'object' || !('id' in user)) return null
  return user as UserWithRole
}

function isProductionDeployment(): boolean {
  const vercelEnvironment = process.env.VERCEL_ENV?.trim()
  return vercelEnvironment
    ? vercelEnvironment === 'production'
    : process.env.NODE_ENV === 'production'
}

function matchesBootstrapPassword(requestedPassword: unknown): boolean {
  const configuredPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD

  // Local development keeps Payload's convenient first-user screen. Production
  // requires a temporary second factor because the configured owner email is
  // normally public knowledge.
  if (!isProductionDeployment() && !configuredPassword) return true
  if (
    typeof requestedPassword !== 'string' ||
    !configuredPassword ||
    configuredPassword.length < 16
  ) {
    return false
  }

  const expected = Buffer.from(configuredPassword)
  const actual = Buffer.from(requestedPassword)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export const isAdmin: Access = ({ req }) => requestUser(req.user)?.role === 'admin'

export const isAdminField: FieldAccess = ({ req }) => requestUser(req.user)?.role === 'admin'

export const isAdminOrFirstUser: Access = async ({ req, data }) => {
  if (requestUser(req.user)?.role === 'admin') return true

  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const requestedEmail =
    data && typeof data === 'object' && 'email' in data && typeof data.email === 'string'
      ? data.email.trim().toLowerCase()
      : null
  const requestedPassword =
    data && typeof data === 'object' && 'password' in data ? data.password : null

  if (isProductionDeployment() && !bootstrapEmail) return false
  if (bootstrapEmail && requestedEmail !== bootstrapEmail) return false
  if (!matchesBootstrapPassword(requestedPassword)) return false

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
