import '../globals.css'
import type { Metadata } from 'next'
import { Bodoni_Moda, Schibsted_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { Torch } from '@/components/brand/Torch'
import { AnalyticsConsentGate } from '@/components/analytics/AnalyticsConsentGate'
import { GoogleTag } from '@/components/analytics/GoogleTag'
import { InsightsTracker } from '@/components/analytics/InsightsTracker'
import { APP_DESCRIPTION, APP_NAME, APP_URL, DEFAULT_LOCALE, SHARE_IMAGE_URL } from '@/lib/constants'
import { getTextDirection } from '@/lib/i18n'

const sans = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

const serif = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  manifest: '/manifest.webmanifest',
  description: APP_DESCRIPTION,
  alternates: {
    types: {
      'application/rss+xml': `${APP_URL}/feed.xml`,
    },
  },
  openGraph: {
    siteName: APP_NAME,
    type: 'website',
    locale: DEFAULT_LOCALE.replace('-', '_'),
    images: [
      {
        url: SHARE_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Opal rings and stones from The Good Opal Co',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [SHARE_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={getTextDirection(DEFAULT_LOCALE)}
      className={`${sans.variable} ${serif.variable}`}
    >
      <head>
        <GoogleTag />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${APP_NAME} journal feed`}
          href="/feed.xml"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body suppressHydrationWarning>
        <Torch />
        {children}
        <Toaster />
        <AnalyticsConsentGate />
        <InsightsTracker />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ? (
          <CookieConsent />
        ) : null}
      </body>
    </html>
  )
}
