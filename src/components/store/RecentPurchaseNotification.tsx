'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import type { Product } from '@/app/(marketing)/store/page'

interface RecentPurchaseNotificationProps {
  products: Product[]
  enabled?: boolean
}

// Mock customer data for demonstration
const mockCustomers = [
  { name: 'Sarah M.', location: 'Sydney, NSW', timeAgo: '2 minutes ago' },
  { name: 'James K.', location: 'Melbourne, VIC', timeAgo: '5 minutes ago' },
  { name: 'Emily L.', location: 'Brisbane, QLD', timeAgo: '11 minutes ago' },
  { name: 'Michael R.', location: 'Perth, WA', timeAgo: '18 minutes ago' },
  { name: 'Jessica T.', location: 'Adelaide, SA', timeAgo: '23 minutes ago' },
  { name: 'David W.', location: 'Canberra, ACT', timeAgo: '31 minutes ago' },
]

/**
 * Recent Purchase Notification Component
 * Shows social proof through recent purchase notifications
 */
export function RecentPurchaseNotification({ products, enabled = true }: RecentPurchaseNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<{
    product: Product
    customer: typeof mockCustomers[0]
  } | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  const showRandomNotification = useCallback(() => {
    // Only show for available products
    const availableProducts = products.filter(p => p.stock > 0)
    if (availableProducts.length === 0) return

    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
    const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)]

    if (!randomProduct || !randomCustomer) return
    setCurrentNotification({ product: randomProduct, customer: randomCustomer })
    setIsVisible(true)
  }, [products])

  useEffect(() => {
    if (!enabled || products.length === 0 || hasInteracted) return

    // Initial delay before showing first notification
    const initialTimer = setTimeout(() => {
      showRandomNotification()
    }, 8000) // 8 seconds after page load

    return () => clearTimeout(initialTimer)
  }, [enabled, products, hasInteracted, showRandomNotification])

  useEffect(() => {
    if (!isVisible || !enabled || hasInteracted) return

    // Auto-hide notification after 6 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 6000)

    // Schedule next notification
    const nextTimer = setTimeout(() => {
      if (!hasInteracted) {
        showRandomNotification()
      }
    }, 25000) // 25 seconds between notifications

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(nextTimer)
    }
  }, [isVisible, enabled, hasInteracted, showRandomNotification])

  const handleClose = () => {
    setIsVisible(false)
    setHasInteracted(true) // Stop showing notifications after user closes one
  }

  if (!currentNotification) return null

  const { product, customer } = currentNotification

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 100, x: -20 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-100/80 backdrop-blur-sm flex items-center justify-center hover:bg-gray-200/80 transition-colors z-10"
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="flex gap-4 p-4">
              {/* Product image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {product.images?.[0]?.image?.url ? (
                    <OptimizedImage
                      src={product.images[0].image.url}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-1">
                  <span>{customer.name}</span>
                  <span className="text-gray-400">just purchased</span>
                </div>

                <h4 className="font-semibold text-gray-900 truncate pr-8">
                  {product.name}
                </h4>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{customer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{customer.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              className="h-1 bg-opal-electric"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 6,
                ease: "linear",
              }}
              style={{
                transformOrigin: "left",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}