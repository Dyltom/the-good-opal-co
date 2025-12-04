/**
 * Color class mappings for WCAG AA compliance
 * Maps semantic intentions to accessible color classes
 */

export const colorClasses = {
  // Brand colors on white backgrounds (use darker variants)
  brand: {
    opal: {
      text: 'text-opal-electric-accessible', // #005A87 - 4.5:1 on white
      hover: 'hover:text-opal-electric-accessible-dark',
      bg: 'bg-opal-electric',
      bgHover: 'hover:bg-opal-electric-dark',
    },
    pink: {
      text: 'text-fire-pink-dark', // #CC5A7A - 4.5:1 on white
      hover: 'hover:text-fire-pink',
      bg: 'bg-fire-pink',
      bgHover: 'hover:bg-fire-pink-dark',
    },
    emerald: {
      text: 'text-opal-emerald-dark', // #1A7F41 - 4.5:1 on white
      hover: 'hover:text-opal-emerald',
      bg: 'bg-opal-emerald',
      bgHover: 'hover:bg-opal-emerald-dark',
    },
  },

  // Status colors (already updated for accessibility)
  status: {
    success: {
      text: 'text-success', // #059669
      bg: 'bg-success',
      light: 'bg-success/10 text-success',
    },
    error: {
      text: 'text-error', // #DC2626
      bg: 'bg-error',
      light: 'bg-error/10 text-error',
    },
    warning: {
      text: 'text-warning', // #D97706
      bg: 'bg-warning',
      light: 'bg-warning/10 text-warning',
    },
    info: {
      text: 'text-info', // #2563EB
      bg: 'bg-info',
      light: 'bg-info/10 text-info',
    },
  },

  // Content colors
  content: {
    primary: 'text-content-primary',
    secondary: 'text-content-secondary',
    muted: 'text-content-muted',
    inverse: 'text-content-inverse',
  },

  // Interactive states
  interactive: {
    link: 'text-opal-electric-accessible hover:text-opal-electric-accessible-dark',
    button: {
      primary: 'bg-opal-electric text-white hover:bg-opal-electric-dark',
      secondary: 'bg-white text-opal-electric-accessible hover:bg-gray-50',
      outline: 'border-opal-electric-accessible text-opal-electric-accessible hover:bg-opal-electric hover:text-white',
    },
  },
} as const

/**
 * Get accessible text color class based on background
 */
export function getTextColorForBackground(background: 'light' | 'dark' | 'brand'): string {
  switch (background) {
    case 'dark':
      return 'text-white'
    case 'brand':
      return 'text-white'
    case 'light':
    default:
      return 'text-content-inverse'
  }
}

/**
 * Utility to replace old color classes with accessible ones
 */
export const colorReplacements: Record<string, string> = {
  // Direct replacements for text colors on white backgrounds
  'text-opal-electric-accessible': 'text-opal-electric-accessible',
  'text-fire-pink': 'text-fire-pink-dark',
  'text-opal-emerald': 'text-opal-emerald-dark',

  // Hover states
  'hover:text-opal-electric-accessible': 'hover:text-opal-electric-accessible-dark',
  'hover:text-fire-pink': 'hover:text-fire-pink-dark',
  'hover:text-opal-emerald': 'hover:text-opal-emerald-dark',

  // Border colors
  'border-opal-electric-accessible': 'border-opal-electric-accessible',
  'border-fire-pink': 'border-fire-pink-dark',
  'border-opal-emerald': 'border-opal-emerald-dark',

  // Status colors (already accessible, but mapped for consistency)
  'text-success-dark': 'text-success',
  'text-error-dark': 'text-error',
  'text-warning-dark': 'text-warning',
  'text-info-dark': 'text-info',

  // Light backgrounds with dark text
  'bg-success-light text-success-dark': 'bg-success/10 text-success',
  'bg-error-light text-error-dark': 'bg-error/10 text-error',
  'bg-warning-light text-warning-dark': 'bg-warning/10 text-warning',
}