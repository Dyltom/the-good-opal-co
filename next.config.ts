import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 92, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
}

export default withPayload(nextConfig)
