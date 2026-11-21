'use client'

import { useAuth } from '@payloadcms/ui'
import type { User } from '@/types/payload-types'
import { AdminNavLink } from '../AdminNavLink'

export function InsightsNavLink() {
  const { user } = useAuth<User>()
  if (user?.role !== 'admin') return null
  return <AdminNavLink group="Reports" href="/admin/insights" id="nav-insights" label="Store insights" />
}
