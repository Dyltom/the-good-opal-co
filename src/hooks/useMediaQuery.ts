'use client'

import { useEffect, useState } from 'react'

/**
 * useMediaQuery Hook
 * Track media query matches in React components
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * useIsMobile Hook
 * Check if viewport is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * useIsTablet Hook
 * Check if viewport is tablet size
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

/**
 * useIsDesktop Hook
 * Check if viewport is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}
