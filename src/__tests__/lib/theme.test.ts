import { describe, expect, it } from 'vitest'
import { generateThemeCSS, hexToHSL } from '@/lib/theme'
import type { TenantTheme } from '@/types'

describe('theme utilities', () => {
  describe('hexToHSL', () => {
    it('should convert hex to HSL', () => {
      // Blue (#3b82f6)
      const blue = hexToHSL('#3b82f6')
      expect(blue).toContain('217') // Hue around 217
      expect(blue).toContain('%') // Has percentage

      // Black
      const black = hexToHSL('#000000')
      expect(black).toBe('0 0% 0%')

      // White
      const white = hexToHSL('#ffffff')
      expect(white).toBe('0 0% 100%')
    })

    it('should handle hex without #', () => {
      const result = hexToHSL('3b82f6')
      expect(result).toContain('217')
    })
  })

  describe('generateThemeCSS', () => {
    it('should generate CSS variables from theme', () => {
      const theme: TenantTheme = {
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#ffffff',
          foreground: '#0a0a0a',
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Roboto, sans-serif',
        },
        layout: {
          containerMaxWidth: '1280px',
          borderRadius: 'md',
        },
      }

      const css = generateThemeCSS(theme)

      expect(css).toContain(':root')
      expect(css).toContain('--primary:')
      expect(css).toContain('--secondary:')
      expect(css).toContain('--accent:')
      expect(css).toContain('--background:')
      expect(css).toContain('--foreground:')
      expect(css).toContain('--font-heading:')
      expect(css).toContain('--font-sans:')
    })

    it('should handle optional color values', () => {
      const theme: TenantTheme = {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          foreground: '#0a0a0a',
        },
        fonts: {},
        layout: {
          borderRadius: 'md',
        },
      }

      const css = generateThemeCSS(theme)

      expect(css).toContain('--primary:')
      expect(css).not.toContain('--secondary:')
      expect(css).not.toContain('--accent:')
    })
  })
})
