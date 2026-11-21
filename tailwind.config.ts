import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/components/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f2ec',
        plinth: { DEFAULT: '#ebe6dd', 2: '#e2dcd1' },
        ink: { DEFAULT: '#1c1813', 2: '#544c42', 3: '#6f665b' },
        rule: { DEFAULT: 'rgb(28 24 19 / 0.12)', 2: 'rgb(28 24 19 / 0.24)' },
        accent: '#7a5c24',
        destructive: '#a8321f',
        success: '#3d6b35',
      },
      borderColor: {
        DEFAULT: 'rgb(28 24 19 / 0.12)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      spacing: {
        mast: '56px',
        gut: 'clamp(12px, 2vw, 28px)',
        sec: 'clamp(56px, 8vw, 112px)',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [forms({ strategy: 'class' }), typography],
}

export default config
