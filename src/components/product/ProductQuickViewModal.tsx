'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gem, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductQuickViewModalProps {
  product: {
    id: string
    slug: string
    name: string
    description?: string
    price: number
    compareAtPrice?: number | null
    image?: string
    stock?: number
    stoneType?: string
    stoneOrigin?: string
    featured?: boolean
    createdAt?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function ProductQuickViewModal({ product, isOpen, onClose }: ProductQuickViewModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)
  const isAvailable = product.stock ? product.stock > 0 : false
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-4xl w-[calc(100%-2rem)] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
              {/* Image Section */}
              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                {product.image ? (
                  <>
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onLoad={() => setIsImageLoading(false)}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No image available</p>
                    </div>
                  </div>
                )}

                {/* Badges */}
                {isAvailable && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.featured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-opal-electric to-opal-deep text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="px-3 py-1 bg-fire-coral text-white text-xs font-medium rounded-full">
                        {discount}% Off
                      </span>
                    )}
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Info Section */}
              <div className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">
                  {product.name}
                </h2>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {product.stoneType && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Gem size={16} className="text-opal-electric" />
                      <span>{product.stoneType}</span>
                    </div>
                  )}
                  {product.stoneOrigin && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin size={16} className="text-opal-electric" />
                      <span>{product.stoneOrigin}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 mb-6 line-clamp-4">
                    {product.description}
                  </p>
                )}

                {/* Unique piece indicator */}
                <div className="mb-6 p-4 bg-gradient-to-r from-opal-electric/5 to-fire-gold/5 rounded-lg border border-opal-electric/20">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    ✨ One-of-a-Kind Piece
                  </p>
                  <p className="text-xs text-gray-600">
                    This is a unique opal. Once sold, it cannot be replaced.
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isAvailable ? (
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-semibold text-gray-900">
                          {formatCurrency(product.price, 'AUD')}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-lg line-through text-gray-400">
                            {formatCurrency(product.compareAtPrice, 'AUD')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.stock === 1 ? 'Only 1 available' : `${product.stock} available`}
                      </p>
                    </div>
                  ) : (
                    <div className="text-2xl font-medium text-gray-500">Sold</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  {isAvailable ? (
                    <>
                      <AddToCartButton
                        product={product}
                        variant="default"
                        size="lg"
                        className="flex-1"
                      >
                        Add to Cart
                      </AddToCartButton>
                      <a
                        href={`/store/${product.slug}`}
                        className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </a>
                    </>
                  ) : (
                    <a
                      href={`/store/${product.slug}`}
                      className="flex-1 px-6 py-3 bg-gray-100 rounded-lg font-medium text-gray-500 text-center"
                    >
                      View Details
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
