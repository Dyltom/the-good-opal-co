import { redirect } from 'next/navigation'
import type { PayloadRequest } from 'payload'

export function requireAdminViewUser(req: PayloadRequest, path: string): NonNullable<PayloadRequest['user']> {
  if (!req.user) redirect(`/admin/login?redirect=${encodeURIComponent(path)}`)
  return req.user
}
