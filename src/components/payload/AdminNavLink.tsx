'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavGroup } from '@payloadcms/ui'

export function AdminNavLink({ group, href, id, label }: { group: string; href: string; id: string; label: string }) {
  const pathname = usePathname()
  const content = (
    <>
      {pathname === href ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">{label}</span>
    </>
  )

  return (
    <NavGroup label={group}>
      {pathname === href ? (
        <div className="nav__link" id={id}>
          {content}
        </div>
      ) : (
        <Link className="nav__link" href={href} id={id} prefetch={false}>
          {content}
        </Link>
      )}
    </NavGroup>
  )
}
