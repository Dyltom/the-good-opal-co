import '../globals.css'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from '@/contexts/CartContext'

/**
 * Marketing Layout
 *
 * This layout wraps all marketing pages (homepage, blog, etc.)
 * It applies Tailwind CSS styles and provides the HTML structure.
 *
 * NOTE: The (payload) route group has its own layout that does NOT
 * import globals.css to avoid conflicts with Payload admin styles.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body suppressHydrationWarning>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
