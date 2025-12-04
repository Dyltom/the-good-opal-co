'use client'

/**
 * Skip Navigation Link
 * Provides keyboard accessibility by allowing users to skip to main content
 * Following WCAG 2.1 Level A guidelines
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-surface-card focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-elevation-high focus:ring-2 focus:ring-interactive-primary focus:ring-offset-2 focus:text-content-inverse font-medium"
      onFocus={(e) => {
        // Ensure smooth scroll behavior
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
    >
      Skip to main content
    </a>
  )
}