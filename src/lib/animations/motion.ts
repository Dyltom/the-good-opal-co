/**
 * Motion preferences utility
 * Handles prefers-reduced-motion media query for accessibility
 */

import { useEffect, useState } from 'react'

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mediaQuery.matches
}

/**
 * Hook to detect prefers-reduced-motion changes
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }

    // No cleanup needed if neither method is available
    return undefined
  }, [])

  return prefersReduced
}

/**
 * Get motion-safe animation variants
 * Returns reduced variants if user prefers reduced motion
 */
export function getMotionSafeVariants<T extends Record<string, unknown>>(
  variants: T,
  reducedVariants: Partial<T>
): T {
  if (prefersReducedMotion()) {
    return { ...variants, ...reducedVariants }
  }
  return variants
}

/**
 * Motion-safe animation props for Framer Motion
 * Disables animations if user prefers reduced motion
 */
export function motionSafeProps(props: Record<string, unknown> = {}) {
  if (prefersReducedMotion()) {
    return {
      ...props,
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 }
    }
  }
  return props
}

/**
 * CSS class for reduced motion
 */
export const reducedMotionClass = 'motion-reduce:transition-none motion-reduce:animate-none'

/**
 * Duration multiplier for reduced motion
 * Use this to speed up necessary animations
 */
export function getMotionDuration(baseDuration: number): number {
  return prefersReducedMotion() ? Math.min(baseDuration * 0.1, 0.1) : baseDuration
}