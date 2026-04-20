/**
 * Global color replacements for accessibility
 *
 * This file contains mappings for replacing non-compliant colors
 * with their WCAG AA compliant alternatives throughout the codebase
 */

export const colorReplacements = {
  // Text colors that need to be replaced
  textReplacements: {
    // Opal electric colors - replace with accessible variant
    'text-opal-electric': 'text-opal-electric-accessible',
    'text-opal-electric-light': 'text-opal-electric-accessible',
    'text-opal-light': 'text-opal-deep', // On white backgrounds
    'text-fire-gold': 'text-fire-gold-dark', // Better contrast
    'text-opal-teal': 'text-opal-deep', // Better contrast

    // Hover states
    'hover:text-opal-electric': 'hover:text-opal-electric-accessible',
    'hover:text-opal-light': 'hover:text-opal-deep',

    // Focus states
    'focus:text-opal-electric': 'focus:text-opal-electric-accessible',
  },

  // Border colors that need better contrast
  borderReplacements: {
    'border-opal-electric': 'border-opal-electric-accessible',
    'border-opal-light': 'border-opal-deep',
    'focus:border-opal-electric': 'focus:border-opal-electric-accessible',
    'hover:border-opal-electric': 'hover:border-opal-electric-accessible',
  },

  // Ring colors for focus states
  ringReplacements: {
    'ring-opal-electric': 'ring-opal-electric-accessible',
    'focus:ring-opal-electric': 'focus:ring-opal-electric-accessible',
  },

  // Background colors that need adjustment when used with text
  backgroundReplacements: {
    // These are fine as backgrounds, but ensure text on them has contrast
    'bg-opal-light': 'bg-opal-light', // Keep, but use dark text
    'bg-fire-gold': 'bg-fire-gold', // Keep, but use dark text
  },
}

/**
 * Get accessible color class
 */
export function getAccessibleColor(className: string): string {
  // Check all replacement categories
  for (const category of Object.values(colorReplacements)) {
    if (className in category) {
      return category[className as keyof typeof category]
    }
  }
  return className
}

/**
 * Replace all color classes in a className string
 */
export function replaceColorClasses(classNames: string): string {
  const classes = classNames.split(' ')

  return classes
    .map(cls => {
      // Check if this class needs replacement
      for (const category of Object.values(colorReplacements)) {
        if (cls in category) {
          return category[cls as keyof typeof category]
        }
      }
      return cls
    })
    .join(' ')
}

/**
 * Color combinations that are WCAG AA compliant
 */
export const accessibleColorCombos = {
  // Primary CTAs
  primaryButton: {
    default: 'bg-black text-white hover:bg-gray-800',
    outline: 'border-black text-black hover:bg-black hover:text-white',
  },

  // Secondary CTAs
  secondaryButton: {
    default: 'bg-opal-electric-accessible text-white hover:bg-opal-electric-dark',
    outline: 'border-opal-electric-accessible text-opal-electric-accessible hover:bg-opal-electric-accessible hover:text-white',
  },

  // Success states
  success: {
    text: 'text-green-700',
    bg: 'bg-green-50 text-green-800',
    border: 'border-green-600',
  },

  // Error states
  error: {
    text: 'text-red-700',
    bg: 'bg-red-50 text-red-800',
    border: 'border-red-600',
  },

  // Warning states
  warning: {
    text: 'text-amber-700',
    bg: 'bg-amber-50 text-amber-800',
    border: 'border-amber-600',
  },

  // Info states
  info: {
    text: 'text-blue-700',
    bg: 'bg-blue-50 text-blue-800',
    border: 'border-blue-600',
  },
}

/**
 * Ensure minimum contrast ratio
 */
export function ensureContrast(
  foreground: string,
  background: string,
  // minRatio: 4.5 = WCAG AA for normal text (reserved for future contrast calculation)
): boolean {
  // This would normally calculate actual contrast ratio
  // For now, return true for known good combinations
  const goodCombos: [string, string][] = [
    ['white', 'black'],
    ['black', 'white'],
    ['opal-electric-accessible', 'white'],
    ['white', 'opal-electric-accessible'],
    ['opal-deep', 'white'],
    ['white', 'opal-deep'],
  ]

  return goodCombos.some(
    ([fg, bg]) =>
      (foreground.includes(fg) && background.includes(bg)) ||
      (foreground.includes(bg) && background.includes(fg))
  )
}