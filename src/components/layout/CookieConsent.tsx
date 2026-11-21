'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  allCookiePreferences,
  necessaryCookiePreferences,
  parseCookiePreferences,
  type CookiePreferences,
} from '@/lib/cookie-consent'
import { cn } from '@/lib/utils'

export function CookieConsent() {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (pathname.startsWith('/quote')) return undefined
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a small delay for better UX
      const timer = window.setTimeout(() => setShowBanner(true), 1000)
      return () => window.clearTimeout(timer)
    }

    if (!parseCookiePreferences(consent)) {
      localStorage.removeItem('cookie-consent')
      setShowBanner(true)
    }
    return undefined
  }, [pathname])

  const acceptAll = () => {
    savePreferences(allCookiePreferences)
  }

  const acceptNecessary = () => {
    savePreferences(necessaryCookiePreferences)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    window.dispatchEvent(new Event('cookie-consent-updated'))

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
      })
    }

    // Hide banner
    setShowBanner(false)
  }

  if (pathname.startsWith('/quote')) return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          role="region"
          aria-label="Privacy choices"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="fixed bottom-3 left-3 right-3 z-50 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-rule bg-bg px-4 py-3 text-xs leading-5 text-ink shadow-md">
            <p className="min-w-0 flex-1 basis-56">
              May we use optional analytics to improve the store?{' '}
              <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-ink">
                Cookie policy
              </Link>
            </p>
            <div className="flex gap-2">
              <Button onClick={acceptNecessary} size="sm" variant="quiet" className="min-h-[44px] min-w-[44px] px-3">
                Necessary only
              </Button>
              <Button onClick={acceptAll} size="sm" className="min-h-[44px] min-w-[44px] bg-ink px-3 text-bg hover:bg-ink">
                Accept analytics
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Cookie Settings Link Component for Footer
export function CookieSettingsLink({ className }: { className?: string }) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    setHasConsent(!!consent)
  }, [])

  const openSettings = () => {
    // Clear consent to show banner again
    localStorage.removeItem('cookie-consent')
    localStorage.removeItem('cookie-consent-date')
    // Reload page to show banner
    window.location.reload()
  }

  return hasConsent ? (
    <button
      onClick={openSettings}
      className={cn('text-sm text-ink-2 transition-colors hover:text-ink', className)}
    >
      Cookie Settings
    </button>
  ) : null
}
