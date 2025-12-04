/**
 * Design Token System for The Good Opal Co
 * Following 2025 best practices for scalable design systems
 *
 * Token categories:
 * - Spacing: Consistent spacing scale
 * - Colors: Semantic color tokens
 * - Typography: Font scales and line heights
 * - Motion: Animation durations and easings
 * - Shadows: Elevation levels
 * - Breakpoints: Responsive design points
 */

export const designTokens = {
  // Spacing scale (rem-based for accessibility)
  spacing: {
    '0': '0',
    'xs': '0.25rem',    // 4px
    'sm': '0.5rem',     // 8px
    'md': '1rem',       // 16px
    'lg': '1.5rem',     // 24px
    'xl': '2rem',       // 32px
    '2xl': '3rem',      // 48px
    '3xl': '4rem',      // 64px
    '4xl': '6rem',      // 96px
    '5xl': '8rem',      // 128px
    // Section-specific spacing
    'section-top': '7rem',      // 112px
    'section-bottom': '5rem',   // 80px
    'section-gap': '3.5rem',    // 56px
    'container': '1.5rem',      // 24px mobile padding
  },

  // Semantic color tokens using CSS variables for theme switching
  colors: {
    // Surface colors
    'surface-primary': 'var(--color-black-rich)',
    'surface-secondary': 'var(--color-cream)',
    'surface-tertiary': 'var(--color-white)',
    'surface-overlay': 'var(--color-black-rich-80)',
    'surface-card': 'var(--color-white)',

    // Content colors
    'content-primary': 'var(--color-white)',
    'content-secondary': 'var(--color-white-70)',
    'content-tertiary': 'var(--color-white-50)',
    'content-inverse': 'var(--color-black-rich)',
    'content-muted': 'var(--color-gray-600)',

    // Brand colors
    'brand-opal': 'var(--color-opal-electric)',
    'brand-fire': 'var(--color-fire-pink)',
    'brand-emerald': 'var(--color-opal-emerald)',
    'brand-ocean': 'var(--color-opal-ocean)',
    'brand-sunset': 'var(--color-opal-sunset)',

    // Interactive colors
    'interactive-primary': 'var(--color-opal-electric)',
    'interactive-primary-hover': 'var(--color-opal-electric-dark)',
    'interactive-secondary': 'var(--color-white)',
    'interactive-secondary-hover': 'var(--color-white-90)',

    // Status colors
    'status-success': 'var(--color-success)',
    'status-error': 'var(--color-error)',
    'status-warning': 'var(--color-warning)',
    'status-info': 'var(--color-info)',
  },

  // Typography scale
  typography: {
    // Font sizes
    fontSize: {
      'xs': '0.75rem',     // 12px
      'sm': '0.875rem',    // 14px
      'base': '1rem',      // 16px
      'lg': '1.125rem',    // 18px
      'xl': '1.25rem',     // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem',    // 36px
      '5xl': '3rem',       // 48px
      '6xl': '3.75rem',    // 60px
      '7xl': '4.5rem',     // 72px
    },

    // Line heights
    lineHeight: {
      'none': '1',
      'tight': '1.25',
      'snug': '1.375',
      'normal': '1.5',
      'relaxed': '1.625',
      'loose': '2',
    },

    // Font weights
    fontWeight: {
      'light': '300',
      'normal': '400',
      'medium': '500',
      'semibold': '600',
      'bold': '700',
    },
  },

  // Animation tokens
  motion: {
    // Durations
    duration: {
      'instant': '0ms',
      'fast': '150ms',
      'normal': '300ms',
      'slow': '500ms',
      'slower': '750ms',
    },

    // Easings
    easing: {
      'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'in': 'cubic-bezier(0.4, 0, 1, 1)',
      'out': 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Shadow/elevation tokens
  shadows: {
    'none': 'none',
    'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    'base': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    // Semantic shadows
    'elevation-low': '0 2px 4px rgb(0 0 0 / 0.05)',
    'elevation-medium': '0 8px 16px rgb(0 0 0 / 0.1)',
    'elevation-high': '0 16px 32px rgb(0 0 0 / 0.15)',
  },

  // Breakpoints
  breakpoints: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },

  // Border radius
  borderRadius: {
    'none': '0',
    'sm': '0.125rem',   // 2px
    'base': '0.25rem',  // 4px
    'md': '0.375rem',   // 6px
    'lg': '0.5rem',     // 8px
    'xl': '0.75rem',    // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    'full': '9999px',
  },

  // Z-index scale
  zIndex: {
    'auto': 'auto',
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    'dropdown': '1000',
    'sticky': '1010',
    'fixed': '1020',
    'modal': '1030',
    'popover': '1040',
    'tooltip': '1050',
    'notification': '1060',
    'max': '2147483647',
  },
} as const

// Export type for TypeScript support
export type DesignTokens = typeof designTokens

// CSS custom properties generator
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {}

  // Generate spacing variables
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })

  // Generate typography variables
  Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value
  })

  Object.entries(designTokens.typography.lineHeight).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = value
  })

  Object.entries(designTokens.typography.fontWeight).forEach(([key, value]) => {
    cssVars[`--font-weight-${key}`] = value
  })

  // Generate motion variables
  Object.entries(designTokens.motion.duration).forEach(([key, value]) => {
    cssVars[`--duration-${key}`] = value
  })

  Object.entries(designTokens.motion.easing).forEach(([key, value]) => {
    cssVars[`--easing-${key}`] = value
  })

  // Generate shadow variables
  Object.entries(designTokens.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value
  })

  // Generate border radius variables
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value
  })

  return cssVars
}