/**
 * Mobile Animation Hook
 *
 * Provides optimized animation values and controls for mobile devices
 */

import { useEffect, useState } from 'react'
import { useSpring, useMotionValue } from 'framer-motion'
import {
  prefersReducedMotion,
  isMobileDevice,
  isLowEndDevice,
  getSpringConfig,
  getAnimationDuration
} from '@/lib/animations/performance'

interface UseMobileAnimationReturn {
  shouldAnimate: boolean
  isMobile: boolean
  isLowEnd: boolean
  reducedMotion: boolean
  springConfig: ReturnType<typeof getSpringConfig>
  duration: (base: number) => number
}

/**
 * Hook for mobile-optimized animations
 */
export function useMobileAnimation(): UseMobileAnimationReturn {
  const [state, setState] = useState({
    shouldAnimate: true,
    isMobile: false,
    isLowEnd: false,
    reducedMotion: false,
  })

  useEffect(() => {
    const checkDevice = () => {
      const mobile = isMobileDevice()
      const lowEnd = isLowEndDevice()
      const reduced = prefersReducedMotion()

      setState({
        shouldAnimate: !reduced,
        isMobile: mobile,
        isLowEnd: lowEnd,
        reducedMotion: reduced,
      })
    }

    checkDevice()

    // Listen for changes in motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => checkDevice()

    // Use the newer API if available
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange)
    } else {
      motionQuery.addListener(handleMotionChange)
    }

    // Check on resize
    window.addEventListener('resize', checkDevice)

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange)
      } else {
        motionQuery.removeListener(handleMotionChange)
      }
      window.removeEventListener('resize', checkDevice)
    }
  }, [])

  return {
    ...state,
    springConfig: getSpringConfig('default'),
    duration: getAnimationDuration,
  }
}

/**
 * Hook for scroll-triggered animations
 */
export function useMobileScrollAnimation(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false)
  const { shouldAnimate, isMobile } = useMobileAnimation()

  useEffect(() => {
    if (!shouldAnimate) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
          }
        })
      },
      {
        threshold,
        rootMargin: isMobile ? '50px' : '100px',
      }
    )

    // Observe elements with data-animate attribute
    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [shouldAnimate, isMobile, threshold])

  return { isInView, shouldAnimate }
}

/**
 * Hook for touch gesture animations
 */
export function useMobileTouchAnimation() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const { isMobile, springConfig } = useMobileAnimation()

  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleTouchStart = (e: TouchEvent) => {
    if (!isMobile) return

    const touch = e.touches[0]
    x.set(touch.clientX)
    y.set(touch.clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isMobile) return

    const touch = e.touches[0]
    x.set(touch.clientX)
    y.set(touch.clientY)
  }

  const handleTouchEnd = () => {
    if (!isMobile) return

    x.set(0)
    y.set(0)
  }

  return {
    x: springX,
    y: springY,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

/**
 * Hook for parallax effects optimized for mobile
 */
export function useMobileParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0)
  const { shouldAnimate, isMobile, isLowEnd } = useMobileAnimation()

  useEffect(() => {
    if (!shouldAnimate || isLowEnd) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const calculatedOffset = scrollY * (isMobile ? speed * 0.5 : speed)
      setOffset(calculatedOffset)
    }

    // Use RAF for smooth animations
    let rafId: number
    const throttledScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      cancelAnimationFrame(rafId)
    }
  }, [shouldAnimate, isMobile, isLowEnd, speed])

  return shouldAnimate && !isLowEnd ? offset : 0
}