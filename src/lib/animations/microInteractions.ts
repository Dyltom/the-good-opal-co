/**
 * Micro-interactions and animation utilities
 * Following 2025 best practices for smooth, performant animations
 */

import { type HTMLMotionProps } from 'framer-motion'

/**
 * Common spring configurations for consistent animations
 */
export const springConfig = {
  gentle: { type: 'spring', stiffness: 150, damping: 20 },
  snappy: { type: 'spring', stiffness: 300, damping: 30 },
  bouncy: { type: 'spring', stiffness: 400, damping: 25 },
} as const

/**
 * Common easing functions
 */
export const easing = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
} as const

/**
 * Hover animations for interactive elements
 */
export const hoverScale: HTMLMotionProps<'div'> = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springConfig.gentle,
}

export const hoverLift: HTMLMotionProps<'div'> = {
  whileHover: { y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' },
  transition: springConfig.gentle,
}

export const hoverGlow: HTMLMotionProps<'div'> = {
  whileHover: {
    boxShadow: '0 0 30px rgba(0, 180, 216, 0.3)',
    transition: { duration: 0.3 }
  },
}

/**
 * Focus animations for accessibility
 */
export const focusRing = {
  whileFocus: {
    boxShadow: '0 0 0 3px rgba(0, 180, 216, 0.5)',
    transition: { duration: 0.1 }
  },
}

/**
 * Fade animations
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: springConfig.gentle,
}

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: springConfig.snappy,
}

/**
 * Stagger animations for lists
 */
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: springConfig.gentle,
}

/**
 * Success animations
 */
export const successPulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
}

/**
 * Loading animations
 */
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

/**
 * Scroll-triggered animations
 */
export const scrollFadeIn = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: springConfig.gentle,
}

export const scrollScale = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: springConfig.bouncy,
}

/**
 * Button press effect
 */
export const buttonPress = {
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 },
}

/**
 * Drawer/Modal animations
 */
export const slideInFromRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: springConfig.snappy,
}

export const slideInFromBottom = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: springConfig.snappy,
}

/**
 * Backdrop animation
 */
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

/**
 * Utility to reduce motion for accessibility
 */
export function getMotionSafeAnimation<T extends Record<string, unknown>>(
  animation: T,
  prefersReducedMotion: boolean
): T | Record<string, never> {
  return prefersReducedMotion ? {} : animation
}

/**
 * Custom hook for motion preferences
 */
export function useReducedMotion() {
  if (typeof window === 'undefined') return false

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mediaQuery.matches
}