import '../globals.css'
import type { Metadata } from 'next'
import { Merriweather, EB_Garamond, Dancing_Script } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { AnalyticsConsentGate } from '@/components/analytics/AnalyticsConsentGate'
import { APP_URL } from '@/lib/constants'

// Self-hosted via next/font — no external CDN request, optimal loading
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-accent',
  display: 'swap',
  preload: false, // Only preload critical fonts
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
}

/**
 * Marketing Layout
 *
 * This layout wraps all marketing pages (homepage, blog, etc.)
 * It applies Tailwind CSS styles and provides the HTML structure.
 *
 * NOTE: The (payload) route group has its own layout that does NOT
 * import globals.css to avoid conflicts with Payload admin styles.
 *
 * Fonts are self-hosted via next/font/google (no CDN dependency).
 * CSS variables --font-sans, --font-serif, --font-inter are injected
 * onto <html> and consumed by the design tokens in globals.css.
 *
 * Cart management now uses cookie-based storage with Server Actions,
 * eliminating the need for a CartProvider context.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${ebGaramond.variable} ${dancingScript.variable}`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
        <AnalyticsConsentGate />
        <CookieConsent />
      </body>
    </html>
  )
}
