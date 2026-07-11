'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a small delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
      return
    }

    try {
      const parsed: unknown = JSON.parse(consent)
      if (parsed && typeof parsed === 'object') {
        setPreferences((current) => ({
          ...current,
          ...parsed,
          necessary: true,
        }))
      }
    } catch {
      localStorage.removeItem('cookie-consent')
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    savePreferences(allAccepted)
  }

  const acceptNecessary = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    savePreferences(onlyNecessary)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    window.dispatchEvent(new Event('cookie-consent-updated'))

    // Initialize analytics and marketing based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        })
      }
    }

    if (prefs.marketing) {
      // Initialize marketing cookies (Facebook Pixel, etc)
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('consent', 'grant')
      }
    }

    // Hide banner
    setShowBanner(false)
    setShowSettings(false)
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
        >
          <div className="mx-auto max-w-xl sm:ml-auto sm:mr-0">
            <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-lg border border-warm-grey bg-cream shadow-lg">
              {/* Main Banner */}
              <div className={cn('p-3 sm:p-5', showSettings && 'border-b border-warm-grey')}>
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-charcoal sm:mb-2 sm:text-lg">
                        Your privacy choices
                      </h3>
                      <p className="mb-3 text-xs leading-5 text-charcoal/70 sm:mb-4 sm:text-sm sm:leading-6">
                        Choose whether we may use analytics and marketing cookies. Necessary cookies
                        keep the shop working.{' '}
                        <Link
                          href="/legal/cookies"
                          className="text-opal-electric-accessible hover:underline"
                        >
                          Read our Cookie Policy
                        </Link>
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                        <Button
                          onClick={acceptAll}
                          size="sm"
                          className="w-full bg-charcoal text-cream hover:bg-charcoal-dark sm:w-auto"
                        >
                          Accept All
                        </Button>
                        <Button
                          onClick={acceptNecessary}
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Necessary Only
                        </Button>
                        <Button
                          onClick={toggleSettings}
                          size="sm"
                          variant="ghost"
                          className="col-span-2 w-full gap-2 sm:w-auto"
                        >
                          <Settings className="h-4 w-4" />
                          Cookie Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={acceptNecessary}
                    className="-mr-2 -mt-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible/30 sm:-mr-3 sm:-mt-3"
                    aria-label="Use necessary cookies only and close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white p-5">
                      <h4 className="mb-4 font-medium text-charcoal">Manage Cookie Preferences</h4>
                      <div className="space-y-4">
                        {/* Necessary Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="mb-1 text-sm font-medium text-charcoal">
                              Necessary Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Required for the website to function properly. Cannot be disabled.
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={preferences.necessary}
                              disabled
                              className="h-4 w-4 cursor-not-allowed rounded text-opal-electric"
                            />
                            <span className="ml-2 text-xs text-gray-500">Always On</span>
                          </div>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="mb-1 text-sm font-medium text-charcoal">
                              Analytics Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Help us understand how visitors interact with our website.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                analytics: e.target.checked,
                              })
                            }
                            className="h-4 w-4 cursor-pointer rounded text-opal-electric"
                          />
                        </div>

                        {/* Marketing Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="mb-1 text-sm font-medium text-charcoal">
                              Marketing Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Used to deliver personalized advertisements based on your interests.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                marketing: e.target.checked,
                              })
                            }
                            className="h-4 w-4 cursor-pointer rounded text-opal-electric"
                          />
                        </div>

                        {/* Preference Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="mb-1 text-sm font-medium text-charcoal">
                              Preference Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Remember your preferences like language and currency.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.preferences}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                preferences: e.target.checked,
                              })
                            }
                            className="h-4 w-4 cursor-pointer rounded text-opal-electric"
                          />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-2 sm:flex sm:gap-3">
                        <Button
                          onClick={() => savePreferences(preferences)}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          Save Preferences
                        </Button>
                        <Button
                          onClick={() => {
                            setPreferences({
                              necessary: true,
                              analytics: true,
                              marketing: true,
                              preferences: true,
                            })
                          }}
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto"
                        >
                          Select All
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
      className={cn('text-sm text-content-muted transition-colors hover:text-charcoal', className)}
    >
      Cookie Settings
    </button>
  ) : null
}
