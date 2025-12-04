/**
 * Spacing Constants
 *
 * Standardized spacing values following an 8px grid system
 * for consistent UI across the application
 */

export const SPACING = {
  // Base unit (8px)
  unit: 8,

  // Spacing scale (multipliers of 8px)
  0: 0,        // 0px
  0.5: 4,      // 4px
  1: 8,        // 8px
  1.5: 12,     // 12px
  2: 16,       // 16px
  2.5: 20,     // 20px
  3: 24,       // 24px
  3.5: 28,     // 28px
  4: 32,       // 32px
  5: 40,       // 40px
  6: 48,       // 48px
  7: 56,       // 56px
  8: 64,       // 64px
  9: 72,       // 72px
  10: 80,      // 80px
  11: 88,      // 88px
  12: 96,      // 96px
  14: 112,     // 112px
  16: 128,     // 128px
  20: 160,     // 160px
  24: 192,     // 192px
  28: 224,     // 224px
  32: 256,     // 256px
} as const

/**
 * Section spacing for consistent vertical rhythm
 */
export const SECTION_SPACING = {
  xs: {
    mobile: 'py-8',      // 32px
    desktop: 'md:py-12'  // 48px
  },
  sm: {
    mobile: 'py-12',     // 48px
    desktop: 'md:py-16'  // 64px
  },
  md: {
    mobile: 'py-16',     // 64px
    desktop: 'md:py-20'  // 80px
  },
  lg: {
    mobile: 'py-20',     // 80px
    desktop: 'md:py-24'  // 96px
  },
  xl: {
    mobile: 'py-24',     // 96px
    desktop: 'md:py-32'  // 128px
  }
} as const

/**
 * Container padding for consistent horizontal spacing
 */
export const CONTAINER_PADDING = {
  mobile: 'px-4',      // 16px
  tablet: 'sm:px-6',   // 24px
  desktop: 'lg:px-8'   // 32px
} as const

/**
 * Component spacing presets
 */
export const COMPONENT_SPACING = {
  // Card internal padding
  card: {
    sm: 'p-4',         // 16px
    md: 'p-6',         // 24px
    lg: 'p-8',         // 32px
  },

  // Gap between elements
  gap: {
    xs: 'gap-2',       // 8px
    sm: 'gap-3',       // 12px
    md: 'gap-4',       // 16px
    lg: 'gap-6',       // 24px
    xl: 'gap-8',       // 32px
  },

  // Stack spacing (vertical lists)
  stack: {
    xs: 'space-y-2',   // 8px
    sm: 'space-y-3',   // 12px
    md: 'space-y-4',   // 16px
    lg: 'space-y-6',   // 24px
    xl: 'space-y-8',   // 32px
  },

  // Grid spacing
  grid: {
    sm: 'gap-4',       // 16px
    md: 'gap-6',       // 24px
    lg: 'gap-8',       // 32px
    xl: 'gap-12',      // 48px
  }
} as const

/**
 * Get section spacing classes
 */
export function getSectionSpacing(size: keyof typeof SECTION_SPACING = 'md'): string {
  const spacing = SECTION_SPACING[size]
  return `${spacing.mobile} ${spacing.desktop}`
}

/**
 * Get container padding classes
 */
export function getContainerPadding(): string {
  return `${CONTAINER_PADDING.mobile} ${CONTAINER_PADDING.tablet} ${CONTAINER_PADDING.desktop}`
}

/**
 * Typography spacing
 */
export const TYPOGRAPHY_SPACING = {
  // Heading margins
  h1: {
    top: 'mt-0',
    bottom: 'mb-6'    // 24px
  },
  h2: {
    top: 'mt-0',
    bottom: 'mb-4'    // 16px
  },
  h3: {
    top: 'mt-0',
    bottom: 'mb-3'    // 12px
  },
  h4: {
    top: 'mt-0',
    bottom: 'mb-2'    // 8px
  },

  // Paragraph spacing
  paragraph: {
    top: 'mt-0',
    bottom: 'mb-4'    // 16px
  },

  // List spacing
  list: {
    top: 'mt-0',
    bottom: 'mb-4',   // 16px
    itemGap: 'space-y-2' // 8px
  }
} as const

/**
 * Form element spacing
 */
export const FORM_SPACING = {
  // Field groups
  fieldGroup: 'space-y-4',    // 16px

  // Label to input
  labelGap: 'mb-2',           // 8px

  // Help text spacing
  helpTextGap: 'mt-2',        // 8px

  // Form sections
  sectionGap: 'space-y-6',    // 24px

  // Button group spacing
  buttonGroup: 'gap-3'        // 12px
} as const

/**
 * Modal and dialog spacing
 */
export const MODAL_SPACING = {
  padding: {
    sm: 'p-4',        // 16px
    md: 'p-6',        // 24px
    lg: 'p-8'         // 32px
  },
  header: 'pb-4',     // 16px
  body: 'py-4',       // 16px
  footer: 'pt-6'      // 24px
} as const