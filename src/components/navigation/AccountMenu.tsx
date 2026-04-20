'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { User, Package, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth-simple'

interface AccountMenuProps {
  user: AuthUser | null
  className?: string
}

export function AccountMenu({ user, className }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  if (!user) {
    return (
      <Button asChild size="sm" variant="ghost" className={className}>
        <Link href="/account/login">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Link>
      </Button>
    )
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Account</span>
        <ChevronDown className={cn(
          'h-3 w-3 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-charcoal truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            My Account
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Package className="h-4 w-4" />
            Order History
          </Link>

          <div className="my-1 border-t border-gray-100" />

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
              onClick={() => setIsOpen(false)}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}