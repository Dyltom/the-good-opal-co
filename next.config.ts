import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Required for Docker production builds
  output: 'standalone',

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Suppress hydration warnings from browser extensions (Grammarly, etc.)
  // This is necessary because Payload's RootLayout sets suppressHydrationWarning={false}
  // and browser extensions add attributes to the body tag causing hydration mismatches
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Experimental features
  experimental: {
    // Enable as needed
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
  },

  // Webpack config to suppress specific warnings
  webpack: (config, { isServer }) => {
    // Suppress hydration warnings in development
    if (!isServer && process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-module-source-map'
    }
    return config
  },
}

export default withPayload(nextConfig)
