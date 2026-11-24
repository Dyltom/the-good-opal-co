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
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
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
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    window.dispatchEvent(new Event('cookie-consent-updated'))

    if (typeof window !== 'undefined' && window.gtag) {
      const state = prefs.analytics ? 'granted' : 'denied'
      window.gtag('consent', 'update', {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
      })
    }

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
          className="fixed bottom-3 left-3 right-3 z-50 sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm max-lg:[body:has([data-bottom-bar])_&]:bottom-36 lg:[body:has([data-bottom-bar])_&]:left-5 lg:[body:has([data-bottom-bar])_&]:right-auto [body:has([role=dialog][data-state=open])_&]:hidden"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border border-rule bg-bg px-3 py-2 text-xs sm:gap-y-2 sm:px-4 sm:py-3 leading-5 text-ink shadow-md">
            <p className="min-w-0 flex-1 basis-full sm:basis-56">
              <span className="sm:hidden">Optional analytics and ad measurement?</span>
              <span className="hidden sm:inline">
                May we use optional analytics, including which of our Google ads lead to a sale?
              </span>{' '}
              <Link href="/legal/cookies" className="underline underline-offset-2 hover:text-ink">
                Cookie policy
              </Link>
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                onClick={acceptNecessary}
                size="sm"
                variant="quiet"
                className="min-h-[44px] min-w-[44px] flex-1 px-3 sm:flex-none"
              >
                Necessary only
              </Button>
              <Button
                onClick={acceptAll}
                size="sm"
                className="min-h-[44px] min-w-[44px] flex-1 bg-ink px-3 text-bg hover:bg-ink sm:flex-none"
              >
                Accept analytics
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CookieSettingsLink({ className }: { className?: string }) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const sync = () => setHasConsent(!!localStorage.getItem('cookie-consent'))
    sync()
    window.addEventListener('cookie-consent-updated', sync)
    return () => window.removeEventListener('cookie-consent-updated', sync)
  }, [])

  const openSettings = () => {
    localStorage.removeItem('cookie-consent')
    localStorage.removeItem('cookie-consent-date')
    window.location.reload()
  }

  return hasConsent ? (
    <button onClick={openSettings} className={cn('transition-colors', className)}>
      Cookie settings
    </button>
  ) : null
}
