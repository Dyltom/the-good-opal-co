/**
 * WCAG 2.1 Color Contrast Utilities
 * Implements color contrast calculations for accessibility compliance
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return {
    r: parseInt(result[1] || '0', 16),
    g: parseInt(result[2] || '0', 16),
    b: parseInt(result[3] || '0', 16),
  }
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const rsRGB = rgb.r / 255
  const gsRGB = rgb.g / 255
  const bsRGB = rgb.b / 255

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const l1 = getRelativeLuminance(rgb1)
  const l2 = getRelativeLuminance(rgb2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  return largeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if contrast meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background)
  return largeText ? ratio >= 4.5 : ratio >= 7
}

/**
 * Color pairs used in the application
 */
export const colorPairs = {
  // Text on white backgrounds
  charcoalOnWhite: { fg: '#1A1A1A', bg: '#FFFFFF', name: 'Charcoal on White' },
  contentMutedOnWhite: { fg: '#6B7280', bg: '#FFFFFF', name: 'Muted Text on White' },
  opalElectricOnWhite: { fg: '#00B4D8', bg: '#FFFFFF', name: 'Opal Electric on White' },

  // Text on dark backgrounds
  whiteOnBlackRich: { fg: '#FFFFFF', bg: '#0A0A12', name: 'White on Black Rich' },
  white70OnBlackRich: { fg: 'rgba(255,255,255,0.7)', bg: '#0A0A12', name: 'White 70% on Black Rich' },
  white50OnBlackRich: { fg: 'rgba(255,255,255,0.5)', bg: '#0A0A12', name: 'White 50% on Black Rich' },

  // Interactive elements
  whiteOnOpalElectric: { fg: '#FFFFFF', bg: '#00B4D8', name: 'White on Opal Electric' },
  whiteOnFirePink: { fg: '#FFFFFF', bg: '#FF8FAB', name: 'White on Fire Pink' },
  whiteOnOpalEmerald: { fg: '#FFFFFF', bg: '#2ECC71', name: 'White on Opal Emerald' },

  // Status colors
  successOnWhite: { fg: '#10B981', bg: '#FFFFFF', name: 'Success on White' },
  errorOnWhite: { fg: '#EF4444', bg: '#FFFFFF', name: 'Error on White' },
  warningOnWhite: { fg: '#F59E0B', bg: '#FFFFFF', name: 'Warning on White' },
}

/**
 * Generate contrast report for all color pairs
 */
export function generateContrastReport() {
  const report: Array<{
    name: string
    ratio: number
    meetsAA: boolean
    meetsAAA: boolean
    recommendation?: string
  }> = []

  Object.entries(colorPairs).forEach(([_key, pair]) => {
    try {
      // Handle rgba colors
      const fgColor = pair.fg.startsWith('rgba')
        ? '#' + Math.round(255 * parseFloat(pair.fg.match(/[\d.]+/g)?.[3] || '1')).toString(16).padStart(2, '0') + 'FFFFFF'.slice(0, 6)
        : pair.fg

      const ratio = getContrastRatio(fgColor, pair.bg)
      const meetsAA = ratio >= 4.5
      const meetsAAA = ratio >= 7

      const result: {
        name: string
        ratio: number
        meetsAA: boolean
        meetsAAA: boolean
        recommendation?: string
      } = {
        name: pair.name,
        ratio: Math.round(ratio * 100) / 100,
        meetsAA,
        meetsAAA,
      }

      if (!meetsAA) {
        result.recommendation = `Increase contrast to at least 4.5:1 for WCAG AA compliance`
      }

      report.push(result)
    } catch (error) {
      console.error(`Error processing ${pair.name}:`, error)
    }
  })

  return report
}

/**
 * Get recommended text color for a given background
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor)
  const blackContrast = getContrastRatio('#000000', backgroundColor)

  // Prefer the color with higher contrast
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
}

/**
 * Suggest color adjustments to meet WCAG standards
 */
export function suggestColorAdjustment(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): { foreground: string; ratio: number } {
  const currentRatio = getContrastRatio(foreground, background)

  if (currentRatio >= targetRatio) {
    return { foreground, ratio: currentRatio }
  }

  // This is a simplified suggestion - in production, you'd want
  // to adjust the color while maintaining its hue
  const rgb = hexToRgb(foreground)
  const bgRgb = hexToRgb(background)
  const bgLuminance = getRelativeLuminance(bgRgb)

  // Determine if we need to lighten or darken
  const needsLightening = bgLuminance < 0.5

  const adjustedRgb = { ...rgb }
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const step = needsLightening ? 5 : -5
    adjustedRgb.r = Math.max(0, Math.min(255, adjustedRgb.r + step))
    adjustedRgb.g = Math.max(0, Math.min(255, adjustedRgb.g + step))
    adjustedRgb.b = Math.max(0, Math.min(255, adjustedRgb.b + step))

    const newColor = `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g.toString(16).padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`
    const newRatio = getContrastRatio(newColor, background)

    if (newRatio >= targetRatio) {
      return { foreground: newColor, ratio: newRatio }
    }

    attempts++
  }

  // If we can't meet the target, return the best we could do
  const finalColor = `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g.toString(16).padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`
  return { foreground: finalColor, ratio: getContrastRatio(finalColor, background) }
}