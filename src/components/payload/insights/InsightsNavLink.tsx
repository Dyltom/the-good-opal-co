'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavGroup, useAuth } from '@payloadcms/ui'
import type { User } from '@/types/payload-types'

const HREF = '/admin/insights'

export function InsightsNavLink() {
  const { user } = useAuth<User>()
  const pathname = usePathname()
  if (user?.role !== 'admin') return null

  const label = (
    <>
      {pathname === HREF ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">Store insights</span>
    </>
  )

  return (
    <NavGroup label="Reports">
      {pathname === HREF ? (
        <div className="nav__link" id="nav-insights">
          {label}
        </div>
      ) : (
        <Link className="nav__link" href={HREF} id="nav-insights" prefetch={false}>
          {label}
        </Link>
      )}
    </NavGroup>
  )
}
