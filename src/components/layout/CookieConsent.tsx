'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Cookie, Settings } from 'lucide-react'
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

    // Initialize analytics and marketing based on preferences
    if (prefs.analytics) {
      // Initialize Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Main Banner */}
              <div className={cn(
                "p-6 sm:p-8",
                showSettings && "border-b border-gray-200"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:block">
                      <div className="w-12 h-12 bg-opal-electric/10 rounded-full flex items-center justify-center">
                        <Cookie className="w-6 h-6 text-opal-electric" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-charcoal mb-2">
                        We value your privacy 🍪
                      </h3>
                      <p className="text-sm text-content mb-4">
                        We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                        By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                        <Link href="/legal/cookies" className="text-opal-electric-accessible hover:underline">
                          Read our Cookie Policy
                        </Link>
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={acceptAll}
                          size="sm"
                          className="bg-opal-electric hover:bg-opal-electric/90"
                        >
                          Accept All
                        </Button>
                        <Button
                          onClick={acceptNecessary}
                          size="sm"
                          variant="outline"
                        >
                          Necessary Only
                        </Button>
                        <Button
                          onClick={toggleSettings}
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Cookie Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close cookie banner"
                  >
                    <X className="w-5 h-5" />
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
                    <div className="p-6 sm:p-8 bg-gray-50">
                      <h4 className="font-medium text-charcoal mb-4">
                        Manage Cookie Preferences
                      </h4>
                      <div className="space-y-4">
                        {/* Necessary Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-charcoal mb-1">
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
                              className="w-4 h-4 text-opal-electric rounded cursor-not-allowed"
                            />
                            <span className="ml-2 text-xs text-gray-500">Always On</span>
                          </div>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-charcoal mb-1">
                              Analytics Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Help us understand how visitors interact with our website.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              analytics: e.target.checked
                            })}
                            className="w-4 h-4 text-opal-electric rounded cursor-pointer"
                          />
                        </div>

                        {/* Marketing Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-charcoal mb-1">
                              Marketing Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Used to deliver personalized advertisements based on your interests.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              marketing: e.target.checked
                            })}
                            className="w-4 h-4 text-opal-electric rounded cursor-pointer"
                          />
                        </div>

                        {/* Preference Cookies */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm text-charcoal mb-1">
                              Preference Cookies
                            </h5>
                            <p className="text-xs text-content-muted">
                              Remember your preferences like language and currency.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences.preferences}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              preferences: e.target.checked
                            })}
                            className="w-4 h-4 text-opal-electric rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button
                          onClick={() => savePreferences(preferences)}
                          size="sm"
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
export function CookieSettingsLink() {
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
      className="text-sm text-content-muted hover:text-charcoal transition-colors"
    >
      Cookie Settings
    </button>
  ) : null
}