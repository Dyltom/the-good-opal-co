import '../globals.css'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'

/**
 * Marketing Layout
 *
 * This layout wraps all marketing pages (homepage, blog, etc.)
 * It applies Tailwind CSS styles and provides the HTML structure.
 *
 * NOTE: The (payload) route group has its own layout that does NOT
 * import globals.css to avoid conflicts with Payload admin styles.
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
    <html lang="en">
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
      </body>
    </html>
  )
}
