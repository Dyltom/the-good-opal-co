/**
 * Layout Constants
 *
 * Centralized layout values to ensure consistency across the application
 */

export const LAYOUT = {
  // Navigation heights
  navigation: {
    mobile: 64, // 4rem - Mobile nav height
    desktop: 80, // 5rem - Desktop nav height
    scrolled: 64, // 4rem - Height when scrolled
  },

  // Sticky offsets (accounts for navigation)
  stickyOffsets: {
    // Use these for sticky positioning
    mobile: 'top-16', // 64px
    desktop: 'top-20', // 80px
    desktopLg: 'lg:top-20', // 80px on large screens

    // CSS custom property approach for dynamic offsets
    cssVar: 'var(--nav-height, 80px)',
  },

  // Z-index scale
  zIndex: {
    base: 1,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    navigation: 50,
    toast: 60,
    tooltip: 70,
  },

  // Breakpoints (matching Tailwind)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Common spacing values
  spacing: {
    xs: '0.5rem', // 8px
    sm: '1rem', // 16px
    md: '1.5rem', // 24px
    lg: '2rem', // 32px
    xl: '3rem', // 48px
    '2xl': '4rem', // 64px
    '3xl': '6rem', // 96px
  },
} as const

/**
 * Get sticky offset class based on screen size
 */
export function getStickyOffset(responsive = true): string {
  if (!responsive) return LAYOUT.stickyOffsets.desktop

  return `${LAYOUT.stickyOffsets.mobile} ${LAYOUT.stickyOffsets.desktopLg}`
}

/**
 * Get navigation height in pixels
 */
export function getNavHeight(scrolled = false): number {
  if (typeof window === 'undefined') return LAYOUT.navigation.desktop

  const isMobile = window.innerWidth < LAYOUT.breakpoints.lg

  if (scrolled) return LAYOUT.navigation.scrolled
  return isMobile ? LAYOUT.navigation.mobile : LAYOUT.navigation.desktop
}

/**
 * CSS variable for dynamic nav height
 */
export const NAV_HEIGHT_CSS = `
  :root {
    --nav-height: ${LAYOUT.navigation.desktop}px;
    --nav-height-scrolled: ${LAYOUT.navigation.scrolled}px;
  }

  @media (max-width: ${LAYOUT.breakpoints.lg - 1}px) {
    :root {
      --nav-height: ${LAYOUT.navigation.mobile}px;
    }
  }
`