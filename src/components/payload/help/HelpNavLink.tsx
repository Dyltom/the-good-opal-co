'use client'

import { useAuth } from '@payloadcms/ui'
import type { User } from '@/types/payload-types'
import { AdminNavLink } from '../AdminNavLink'
import { HELP_PATH } from './help-links'

export function HelpNavLink() {
  const { user } = useAuth<User>()
  if (user?.role !== 'admin') return null
  return <AdminNavLink group="Help" href={HELP_PATH} id="nav-help" label="Owner guide" />
}
