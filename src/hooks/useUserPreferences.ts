'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * User Preferences Interface
 * Following SOLID principles - Interface Segregation
 */
export interface UserPreferences {
  // Visual preferences
  colorScheme: 'light' | 'dark' | 'auto'
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  highContrast: boolean

  // Commerce preferences
  currency: 'AUD' | 'USD' | 'EUR' | 'GBP'
  showPricesIncludingTax: boolean

  // Communication preferences
  emailNotifications: boolean
  marketingEmails: boolean

  // Accessibility preferences
  keyboardNavigation: boolean
  screenReaderOptimized: boolean
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  colorScheme: 'auto',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  currency: 'AUD',
  showPricesIncludingTax: true,
  emailNotifications: true,
  marketingEmails: false,
  keyboardNavigation: false,
  screenReaderOptimized: false,
}

/**
 * Storage key for preferences
 */
const STORAGE_KEY = 'opal-user-preferences'

/**
 * User Preferences Hook
 *
 * Provides adaptive UI based on user preferences
 * Following 2025 best practices for personalization
 *
 * Features:
 * - Persists to localStorage
 * - Respects system preferences
 * - Updates CSS variables for theming
 * - Provides motion and accessibility settings
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
        } else {
          // Check system preferences
          const systemPreferences: Partial<UserPreferences> = {}

          // Color scheme
          if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              systemPreferences.colorScheme = 'dark'
            }

            // Reduced motion
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              systemPreferences.reducedMotion = true
            }

            // High contrast
            if (window.matchMedia('(prefers-contrast: high)').matches) {
              systemPreferences.highContrast = true
            }
          }

          setPreferences({ ...DEFAULT_PREFERENCES, ...systemPreferences })
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    }
  }, [preferences, isLoading])

  // Apply preferences to DOM
  useEffect(() => {
    const root = document.documentElement

    // Color scheme
    if (preferences.colorScheme === 'auto') {
      root.classList.remove('light', 'dark')
    } else {
      root.classList.remove('light', 'dark')
      root.classList.add(preferences.colorScheme)
    }

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    }
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.fontSize])

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Keyboard navigation
    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-nav')
    } else {
      root.classList.remove('keyboard-nav')
    }

  }, [preferences])

  // Update a single preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [])

  // Update multiple preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Get adaptive styles based on preferences
  const adaptiveStyles = {
    motion: preferences.reducedMotion ? 'reduced' : 'normal',
    scale: preferences.fontSize,
    theme: preferences.colorScheme,
    contrast: preferences.highContrast ? 'high' : 'normal',
  }

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    adaptiveStyles,
    isLoading,
  }
}

/**
 * Hook for adaptive animations based on user preferences
 */
export function useAdaptiveAnimation() {
  const { preferences } = useUserPreferences()

  const getAnimationDuration = useCallback((baseDuration: number) => {
    return preferences.reducedMotion ? 0 : baseDuration
  }, [preferences.reducedMotion])

  const getAnimationClass = useCallback((animationClass: string) => {
    return preferences.reducedMotion ? '' : animationClass
  }, [preferences.reducedMotion])

  return {
    duration: getAnimationDuration,
    className: getAnimationClass,
    isReduced: preferences.reducedMotion,
  }
}