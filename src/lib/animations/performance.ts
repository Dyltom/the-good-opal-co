/**
 * Animation Performance Utilities
 *
 * Optimizes animations for mobile devices and respects user preferences
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is mobile/tablet
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check touch capability and screen size
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth <= 1024

  return hasTouch || isSmallScreen
}

/**
 * Check if device has low performance
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check for low core count
  const cores = navigator.hardwareConcurrency || 1
  if (cores <= 2) return true

  // Check for low memory (if available)
  // @ts-ignore - deviceMemory is not in TypeScript types yet
  const memory = navigator.deviceMemory
  if (memory && memory <= 4) return true

  // Check connection speed
  // @ts-ignore - connection is not in TypeScript types yet
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return true
  }

  return false
}

/**
 * Get optimized animation duration
 */
export function getAnimationDuration(baseDuration: number): number {
  if (prefersReducedMotion()) return 0
  if (isLowEndDevice()) return baseDuration * 0.5
  if (isMobileDevice()) return baseDuration * 0.8
  return baseDuration
}

/**
 * Get optimized spring animation config
 */
export function getSpringConfig(type: 'default' | 'gentle' | 'wobbly' | 'stiff' = 'default') {
  const reduced = prefersReducedMotion()
  const mobile = isMobileDevice()
  const lowEnd = isLowEndDevice()

  // No animation for reduced motion
  if (reduced) {
    return { duration: 0 }
  }

  // Simplified animations for low-end devices
  if (lowEnd) {
    return { duration: 0.2, ease: 'easeOut' }
  }

  // Mobile-optimized springs
  if (mobile) {
    const configs = {
      default: { type: 'spring' as const, stiffness: 400, damping: 30 },
      gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
      wobbly: { type: 'spring' as const, stiffness: 150, damping: 15 },
      stiff: { type: 'spring' as const, stiffness: 500, damping: 35 },
    }
    return configs[type]
  }

  // Desktop springs
  const configs = {
    default: { type: 'spring' as const, stiffness: 300, damping: 25 },
    gentle: { type: 'spring' as const, stiffness: 120, damping: 20 },
    wobbly: { type: 'spring' as const, stiffness: 100, damping: 10 },
    stiff: { type: 'spring' as const, stiffness: 400, damping: 30 },
  }

  return configs[type]
}

/**
 * Should use GPU acceleration
 */
export function shouldUseGPU(): boolean {
  if (isLowEndDevice()) return false
  return true
}

/**
 * Get optimized transition properties
 */
export function getOptimizedTransition(properties: string[] = ['all']): string {
  const duration = getAnimationDuration(300)
  const timing = isLowEndDevice() ? 'ease-out' : 'cubic-bezier(0.4, 0, 0.2, 1)'

  if (duration === 0) return 'none'

  return properties
    .map(prop => `${prop} ${duration}ms ${timing}`)
    .join(', ')
}

/**
 * Animation frame throttler for scroll/resize events
 */
export class AnimationFrameThrottler {
  private ticking = false
  private callback: () => void

  constructor(callback: () => void) {
    this.callback = callback
  }

  request() {
    if (!this.ticking && !prefersReducedMotion()) {
      requestAnimationFrame(() => {
        this.callback()
        this.ticking = false
      })
      this.ticking = true
    }
  }
}

/**
 * Intersection Observer options for mobile
 */
export function getMobileIntersectionOptions(): IntersectionObserverInit {
  return {
    rootMargin: isMobileDevice() ? '50px' : '200px',
    threshold: isLowEndDevice() ? 0.1 : [0, 0.1, 0.5, 1],
  }
}

/**
 * CSS classes for performance
 */
export const PERFORMANCE_CLASSES = {
  // GPU acceleration
  gpu: 'transform-gpu',

  // Backface visibility
  backface: 'backface-hidden',

  // Will change
  willChange: {
    transform: 'will-change-transform',
    opacity: 'will-change-opacity',
    auto: 'will-change-auto',
  },

  // Reduced motion
  reducedMotion: {
    none: 'motion-reduce:transition-none',
    instant: 'motion-reduce:duration-[0.01ms]',
  },
} as const