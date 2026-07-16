'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gem, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
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
  const dialogRef = useFocusTrap<HTMLDivElement>({ active: isOpen, onEscape: onClose })
  const isAvailable = product.stock ? product.stock > 0 : false

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

          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-view-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="pointer-events-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-2xl"
            >
              <div className="grid flex-1 overflow-y-auto md:grid-cols-2">
                {/* Image Section */}
                <div className="relative aspect-square bg-cream md:min-h-full">
                  {product.image ? (
                    <>
                      {isImageLoading && (
                        <div className="absolute inset-0 bg-cream-dark animate-pulse" />
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
                        <div className="w-24 h-24 rounded-full bg-warm-grey mx-auto mb-3" />
                        <p className="text-sm text-charcoal/60">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  {isAvailable && product.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-opal-electric to-opal-deep text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 text-charcoal shadow-lg backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                    aria-label="Close quick view"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                {/* Info Section */}
                <div className="flex flex-col px-4 py-5 sm:px-6 md:p-8">
                  <h2 id="quick-view-title" className="text-2xl md:text-3xl font-serif text-charcoal mb-2">
                    {product.name}
                  </h2>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {product.stoneType && (
                      <div className="flex items-center gap-1.5 text-charcoal/70">
                        <Gem size={16} className="text-opal-electric-accessible" />
                        <span>{product.stoneType}</span>
                      </div>
                    )}
                    {product.stoneOrigin && (
                      <div className="flex items-center gap-1.5 text-charcoal/70">
                        <MapPin size={16} className="text-opal-electric-accessible" />
                        <span>{product.stoneOrigin}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-charcoal/70 mb-6 line-clamp-4">
                      {product.description}
                    </p>
                  )}

                  {/* Unique piece indicator */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-opal-electric/5 to-fire-gold/5 rounded-lg border border-opal-electric/20">
                    <p className="text-sm font-medium text-charcoal mb-1">
                      One-of-a-kind piece
                    </p>
                    <p className="text-xs text-charcoal/70">
                      This is a unique opal. Once sold, it cannot be replaced.
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {isAvailable ? (
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-semibold tabular-nums text-charcoal">
                            {formatCurrency(product.price, 'AUD')}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-lg line-through tabular-nums text-charcoal/45">
                              {formatCurrency(product.compareAtPrice, 'AUD')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-charcoal/70 mt-1">
                          {product.stock === 1 ? 'Only 1 available' : `${product.stock} available`}
                        </p>
                      </div>
                    ) : (
                      <div className="text-2xl font-medium text-charcoal/60">Collected</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-3 sm:flex-row border-t border-warm-grey/40 bg-white/95 px-4 pt-3 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none"
                    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                  >
                    {isAvailable ? (
                      <>
                        <AddToCartButton
                          product={product}
                          variant="default"
                          size="lg"
                          className="flex-1"
                        >
                          Add to cart
                        </AddToCartButton>
                        <Link
                          href={`/store/${product.slug}`}
                          className="flex min-h-[44px] items-center justify-center rounded-lg border border-warm-grey/60 px-6 py-3 font-medium text-charcoal/80 transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                        >
                          View details
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/store/${product.slug}`}
                        className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-cream-dark px-6 py-3 font-medium text-charcoal/60"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
