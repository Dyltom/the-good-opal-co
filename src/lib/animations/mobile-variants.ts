/**
 * Mobile-Optimized Animation Variants
 *
 * Framer Motion variants optimized for mobile performance
 */

import { Variants } from 'framer-motion'
import { getAnimationDuration, getSpringConfig, shouldUseGPU } from './performance'

/**
 * Mobile-optimized fade variants
 */
export const mobileFrameFade: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: getAnimationDuration(0.2) },
  },
  visible: {
    opacity: 1,
    transition: { duration: getAnimationDuration(0.3) },
  },
  exit: {
    opacity: 0,
    transition: { duration: getAnimationDuration(0.2) },
  },
}

/**
 * Mobile-optimized slide variants
 */
export const mobileSlide: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
    transition: getSpringConfig('stiff'),
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: getSpringConfig('default'),
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: getSpringConfig('stiff'),
  },
}

/**
 * Mobile-optimized scale variants
 */
export const mobileScale: Variants = {
  hidden: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: getAnimationDuration(0.2) },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: getAnimationDuration(0.3) },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: getAnimationDuration(0.2) },
  },
}

/**
 * Stagger children animations (mobile-optimized)
 */
export const mobileStagger: Variants = {
  visible: {
    transition: {
      staggerChildren: getAnimationDuration(0.05),
      delayChildren: getAnimationDuration(0.1),
    },
  },
}

/**
 * Mobile list item variants
 */
export const mobileListItem: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: getAnimationDuration(0.3),
      ease: 'easeOut',
    },
  },
}

/**
 * Mobile drawer/sheet variants
 */
export const mobileDrawer: Variants = {
  hidden: {
    y: '100%',
    transition: {
      duration: getAnimationDuration(0.3),
      ease: 'easeInOut',
    },
  },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
      duration: getAnimationDuration(0.4),
    },
  },
}

/**
 * Mobile modal variants
 */
export const mobileModal: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: getAnimationDuration(0.2),
      ease: 'easeOut',
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: getAnimationDuration(0.3),
      ease: 'easeOut',
    },
  },
}

/**
 * Mobile tab variants
 */
export const mobileTab: Variants = {
  inactive: {
    opacity: 0.6,
  },
  active: {
    opacity: 1,
    transition: {
      duration: getAnimationDuration(0.2),
    },
  },
}

/**
 * Get optimized animation props
 */
export function getMobileAnimationProps(enableGPU = true) {
  const props: Record<string, string | boolean | Record<string, string>> = {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
  }

  if (enableGPU && shouldUseGPU()) {
    props.style = { transform: 'translateZ(0)' }
  }

  return props
}

/**
 * Gesture animation helpers
 */
export const mobileGestures = {
  tap: {
    scale: 0.97,
    transition: { duration: getAnimationDuration(0.1) },
  },
  hover: {
    scale: 1.02,
    transition: { duration: getAnimationDuration(0.2) },
  },
  drag: {
    scale: 1.05,
    transition: { duration: getAnimationDuration(0.1) },
  },
}

/**
 * Page transition variants
 */
export const mobilePageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getAnimationDuration(0.3),
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: getAnimationDuration(0.2),
      ease: 'easeIn',
    },
  },
}

/**
 * Loading skeleton animation
 */
export const mobileSkeleton = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: getAnimationDuration(1.5),
      ease: 'linear',
      repeat: Infinity,
    },
  },
}