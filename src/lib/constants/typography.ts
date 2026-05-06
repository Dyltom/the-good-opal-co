/**
 * Typography Constants
 *
 * Standardized typography scale and styles for consistent text hierarchy
 */

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    display: 'font-serif',   // Fraunces (soft variant)
    sans: 'font-sans',       // Plus Jakarta Sans
    serif: 'font-serif',     // Fraunces (soft variant)
    accent: 'font-accent',   // Dancing Script
  },

  // Font sizes with line heights
  fontSize: {
    xs: {
      class: 'text-xs',
      size: '0.75rem',    // 12px
      lineHeight: '1rem', // 16px
    },
    sm: {
      class: 'text-sm',
      size: '0.875rem',   // 14px
      lineHeight: '1.25rem', // 20px
    },
    base: {
      class: 'text-base',
      size: '1rem',       // 16px
      lineHeight: '1.5rem', // 24px
    },
    lg: {
      class: 'text-lg',
      size: '1.125rem',   // 18px
      lineHeight: '1.75rem', // 28px
    },
    xl: {
      class: 'text-xl',
      size: '1.25rem',    // 20px
      lineHeight: '1.75rem', // 28px
    },
    '2xl': {
      class: 'text-2xl',
      size: '1.5rem',     // 24px
      lineHeight: '2rem', // 32px
    },
    '3xl': {
      class: 'text-3xl',
      size: '1.875rem',   // 30px
      lineHeight: '2.25rem', // 36px
    },
    '4xl': {
      class: 'text-4xl',
      size: '2.25rem',    // 36px
      lineHeight: '2.5rem', // 40px
    },
    '5xl': {
      class: 'text-5xl',
      size: '3rem',       // 48px
      lineHeight: '1',
    },
    '6xl': {
      class: 'text-6xl',
      size: '3.75rem',    // 60px
      lineHeight: '1',
    },
  },

  // Font weights
  fontWeight: {
    light: 'font-light',     // 300
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',       // 700
  },

  // Line heights
  lineHeight: {
    none: 'leading-none',       // 1
    tight: 'leading-tight',     // 1.25
    snug: 'leading-snug',       // 1.375
    normal: 'leading-normal',   // 1.5
    relaxed: 'leading-relaxed', // 1.625
    loose: 'leading-loose',     // 2
  },

  // Letter spacing
  letterSpacing: {
    tighter: 'tracking-tighter', // -0.05em
    tight: 'tracking-tight',     // -0.025em
    normal: 'tracking-normal',   // 0
    wide: 'tracking-wide',       // 0.025em
    wider: 'tracking-wider',     // 0.05em
    widest: 'tracking-widest',   // 0.1em
  },
} as const

/**
 * Typography presets for common text elements
 */
export const TYPOGRAPHY_PRESETS = {
  // Display headings (marketing pages)
  display: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight',
    h3: 'text-2xl md:text-3xl font-serif font-semibold leading-snug',
  },

  // Regular headings (content pages)
  heading: {
    h1: 'text-3xl md:text-4xl font-serif font-bold leading-tight',
    h2: 'text-2xl md:text-3xl font-serif font-semibold leading-snug',
    h3: 'text-xl md:text-2xl font-serif font-semibold leading-snug',
    h4: 'text-lg md:text-xl font-sans font-semibold leading-snug',
    h5: 'text-base md:text-lg font-sans font-semibold',
    h6: 'text-sm md:text-base font-sans font-semibold',
  },

  // Body text
  body: {
    large: 'text-lg leading-relaxed',
    base: 'text-base leading-normal',
    small: 'text-sm leading-normal',
    tiny: 'text-xs leading-normal',
  },

  // Special text
  label: 'text-sm font-medium',
  caption: 'text-xs text-content-muted',
  overline: 'text-xs font-semibold uppercase tracking-wider',
  quote: 'text-xl font-serif italic leading-relaxed',

  // Interactive text
  button: {
    large: 'text-base font-semibold',
    medium: 'text-sm font-semibold',
    small: 'text-xs font-semibold',
  },

  link: {
    base: 'text-opal-electric-accessible hover:text-opal-electric-dark underline-offset-2 hover:underline transition-colors',
    nav: 'font-medium hover:text-opal-electric-accessible transition-colors',
  },
} as const

/**
 * Get responsive heading classes
 */
export function getHeadingClass(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', variant: 'display' | 'heading' = 'heading'): string {
  if (variant === 'display' && level in TYPOGRAPHY_PRESETS.display) {
    return TYPOGRAPHY_PRESETS.display[level as keyof typeof TYPOGRAPHY_PRESETS.display]
  }
  return TYPOGRAPHY_PRESETS.heading[level]
}

/**
 * Get body text classes
 */
export function getBodyClass(size: keyof typeof TYPOGRAPHY_PRESETS.body = 'base'): string {
  return TYPOGRAPHY_PRESETS.body[size]
}

/**
 * Text color presets
 */
export const TEXT_COLOR = {
  // Primary text colors
  primary: 'text-charcoal',
  secondary: 'text-charcoal-light',
  muted: 'text-content-muted',
  inverse: 'text-white',

  // Brand colors
  'opal-electric': 'text-opal-electric-accessible',
  'opal-electric-dark': 'text-opal-electric-dark',
  'fire-pink': 'text-fire-pink-dark',
  'emerald': 'text-opal-emerald-dark',

  // State colors
  error: 'text-status-error',
  success: 'text-opal-emerald-dark',
  warning: 'text-fire-orange',
  info: 'text-opal-electric-accessible',
} as const