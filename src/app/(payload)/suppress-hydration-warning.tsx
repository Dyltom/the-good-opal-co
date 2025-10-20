'use client'

import { useEffect } from 'react'

/**
 * Suppress Hydration Warning Component
 *
 * Filters out hydration warnings caused by browser extensions (Grammarly, etc.)
 * adding attributes to the DOM before React hydrates.
 *
 * This is necessary because Payload CMS's RootLayout sets suppressHydrationWarning={false}
 * which we cannot override.
 */
export function SuppressHydrationWarning() {
  useEffect(() => {
    // Store original console.error
    const originalError = console.error

    // Override console.error to filter hydration warnings
    console.error = (...args: unknown[]) => {
      const errorMessage = args[0]?.toString() || ''

      // Suppress hydration warnings from browser extensions
      if (
        errorMessage.includes('Hydration') ||
        errorMessage.includes('data-new-gr-c-s-check-loaded') ||
        errorMessage.includes('data-gr-ext-installed') ||
        errorMessage.includes('did not match') ||
        errorMessage.includes('suppressHydrationWarning')
      ) {
        // Silently ignore these specific errors
        return
      }

      // Pass through all other errors
      originalError(...args)
    }

    // Cleanup on unmount
    return () => {
      console.error = originalError
    }
  }, [])

  return null
}
