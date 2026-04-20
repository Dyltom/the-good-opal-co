/**
 * Navigation Constants
 *
 * Centralized navigation items for consistent usage across the application.
 * Update these values to change navigation site-wide.
 */

export interface NavigationItem {
  href: string
  label: string
}

export interface NavigationLogo {
  id: string
  url: string
  alt: string
  width: number
  height: number
}

/**
 * Main navigation items
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/store', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
]

/**
 * Default logo configuration
 */
export const NAVIGATION_LOGO: NavigationLogo = {
  id: 'logo',
  url: '/logo.png',
  alt: 'The Good Opal Co',
  width: 48,
  height: 48,
}

/**
 * Footer navigation items (typically same as main nav)
 */
export const FOOTER_NAVIGATION_ITEMS = NAVIGATION_ITEMS

/**
 * Helper to get navigation props for consistent usage
 */
export function getNavigationProps(overrides?: {
  transparent?: boolean
  sticky?: boolean
}) {
  return {
    logo: NAVIGATION_LOGO,
    items: NAVIGATION_ITEMS,
    transparent: overrides?.transparent || false,
    sticky: overrides?.sticky !== false, // Default to true
  }
}