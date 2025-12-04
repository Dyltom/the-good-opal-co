'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { StoreContentPro } from '@/app/(marketing)/store/store-content-pro'
import { MobileStoreContent } from '@/components/mobile/MobileStoreContent'
import type { Product } from '@/app/(marketing)/store/page'

interface ResponsiveStoreContentProps {
  products: Product[]
}

export function ResponsiveStoreContent({ products }: ResponsiveStoreContentProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Show mobile UI for mobile devices
  if (isMobile) {
    return <MobileStoreContent products={products} />
  }

  // Show desktop UI for larger screens
  return <StoreContentPro products={products} />
}