/**
 * Theme utilities
 * Convert tenant theme configuration to CSS variables
 */

import type { TenantTheme } from '@/types'

/**
 * Convert hex color to HSL
 * @param hex - Hex color code
 * @returns HSL string (e.g., "217 91% 60%")
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lPercent = Math.round(l * 100)

  return `${h} ${s}% ${lPercent}%`
}

/**
 * Generate CSS variables from tenant theme
 * @param theme - Tenant theme configuration
 * @returns CSS variable string
 */
export function generateThemeCSS(theme: TenantTheme): string {
  const { colors, fonts } = theme

  const cssVars: string[] = []

  // Colors
  if (colors.primary) {
    cssVars.push(`--primary: ${hexToHSL(colors.primary)};`)
  }
  if (colors.secondary) {
    cssVars.push(`--secondary: ${hexToHSL(colors.secondary)};`)
  }
  if (colors.accent) {
    cssVars.push(`--accent: ${hexToHSL(colors.accent)};`)
  }
  if (colors.background) {
    cssVars.push(`--background: ${hexToHSL(colors.background)};`)
  }
  if (colors.foreground) {
    cssVars.push(`--foreground: ${hexToHSL(colors.foreground)};`)
  }
  if (colors.muted) {
    cssVars.push(`--muted: ${hexToHSL(colors.muted)};`)
  }
  if (colors.border) {
    cssVars.push(`--border: ${hexToHSL(colors.border)};`)
  }

  // Fonts
  if (fonts.heading) {
    cssVars.push(`--font-heading: ${fonts.heading};`)
  }
  if (fonts.body) {
    cssVars.push(`--font-sans: ${fonts.body};`)
  }

  return `:root { ${cssVars.join(' ')} }`
}

/**
 * Generate style tag with tenant theme
 * @param theme - Tenant theme configuration
 * @returns Style tag string for SSR
 */
export function generateThemeStyleTag(theme: TenantTheme): string {
  const css = generateThemeCSS(theme)
  return `<style id="tenant-theme">${css}</style>`
}

/**
 * Get CSS variable value
 * @param variable - CSS variable name (without --)
 * @returns CSS variable value or null
 */
export function getCSSVariable(variable: string): string | null {
  if (typeof window === 'undefined') return null

  return getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`).trim()
}

/**
 * Set CSS variable value
 * @param variable - CSS variable name (without --)
 * @param value - Value to set
 */
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window === 'undefined') return

  document.documentElement.style.setProperty(`--${variable}`, value)
}

/**
 * Apply tenant theme to DOM
 * Client-side theme application
 * @param theme - Tenant theme configuration
 */
export function applyTenantTheme(theme: TenantTheme): void {
  if (typeof window === 'undefined') return

  const { colors, fonts } = theme

  // Apply colors
  if (colors.primary) setCSSVariable('primary', hexToHSL(colors.primary))
  if (colors.secondary) setCSSVariable('secondary', hexToHSL(colors.secondary))
  if (colors.accent) setCSSVariable('accent', hexToHSL(colors.accent))
  if (colors.background) setCSSVariable('background', hexToHSL(colors.background))
  if (colors.foreground) setCSSVariable('foreground', hexToHSL(colors.foreground))
  if (colors.muted) setCSSVariable('muted', hexToHSL(colors.muted))
  if (colors.border) setCSSVariable('border', hexToHSL(colors.border))

  // Apply fonts
  if (fonts.heading) setCSSVariable('font-heading', fonts.heading)
  if (fonts.body) setCSSVariable('font-sans', fonts.body)
}

/**
 * Remove tenant theme from DOM
 */
export function removeTenantTheme(): void {
  if (typeof window === 'undefined') return

  const styleEl = document.getElementById('tenant-theme')
  if (styleEl) {
    styleEl.remove()
  }
}
