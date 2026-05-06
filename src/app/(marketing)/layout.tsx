import '../globals.css'
import { Plus_Jakarta_Sans, Fraunces, Dancing_Script } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { GoogleAnalyticsProvider } from '@/components/analytics/GoogleAnalytics'

// Self-hosted via next/font — no external CDN request, optimal loading
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

// Fraunces is a variable font with a SOFT axis (0–100); we include it so
// globals.css can apply font-variation-settings: "SOFT" 100 for pillowy serifs.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
  axes: ['SOFT'],
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-accent',
  display: 'swap',
  preload: false, // Only preload critical fonts
})


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
      className={`${plusJakartaSans.variable} ${fraunces.variable} ${dancingScript.variable}`}
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
        <Analytics />
        <GoogleAnalyticsProvider />
        <CookieConsent />
      </body>
    </html>
  )
}
