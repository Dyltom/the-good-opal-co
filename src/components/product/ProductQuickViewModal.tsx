'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { formatCurrency, savePercent } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { storeLabel } from '@/app/(marketing)/store/store-query'

interface ProductQuickViewModalProps {
  product: {
    id: string
    slug: string
    name: string
    description?: string
    price: number
    compareAtPrice?: number | null
    image?: string
    stock: number
    soldPerUnit?: boolean
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
  const discount = savePercent(product.price, product.compareAtPrice)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/30 z-50"
          />

          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 pointer-events-none">
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-view-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="pointer-events-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-sm bg-bg shadow-2xl sm:max-w-4xl sm:rounded-sm"
            >
              <div className="grid flex-1 overflow-y-auto md:grid-cols-2">
                <div className="relative aspect-[4/5] bg-plinth md:aspect-auto md:min-h-[24rem]">
                  {product.image ? (
                    <>
                      {isImageLoading && (
                        <div className="absolute inset-0 bg-plinth animate-pulse" />
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
                    <div className="flex h-full w-full items-center justify-center">
                      <p className="text-sm text-ink-2">No image available</p>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute left-3 top-3">
                      <span className="rounded-sm border border-rule bg-bg px-2 py-1 text-[11px] text-ink">
                        Featured
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-rule bg-bg text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close quick view"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-col px-4 py-5 sm:px-6 md:p-8">
                  <h2 id="quick-view-title" className="mb-2 font-serif text-[26px] italic leading-[1.1] text-ink md:text-[30px]">
                    {product.name}
                  </h2>
                  {product.stoneType || product.stoneOrigin ? (
                    <p className="mb-4 text-[13px] text-ink-2">
                      {[product.stoneType, product.stoneOrigin]
                        .filter((value): value is string => Boolean(value))
                        .map((value) => storeLabel(value))
                        .join(' · ')}
                    </p>
                  ) : null}
                  {product.description && (
                    <p className="mb-5 line-clamp-4 text-[14.5px] leading-[1.6] text-ink-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-medium text-ink">
                        {formatCurrency(product.price, 'AUD')}
                      </span>
                      {discount && product.compareAtPrice ? (
                        <>
                          <span className="text-sm text-ink-3 line-through">
                            {formatCurrency(product.compareAtPrice, 'AUD')}
                          </span>
                          <span className="text-sm font-medium text-accent">Save {discount}%</span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] text-accent">
                      {product.soldPerUnit
                        ? 'Priced per stone. Stones are selected at random from this batch.'
                        : product.stock === 1
                          ? 'One of a kind. Once sold, it cannot be replaced.'
                          : `${product.stock} available`}
                    </p>
                  </div>
                  <div
                    className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-3 sm:flex-row border-t border-rule bg-bg px-4 pt-3 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-0"
                    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                  >
                    <AddToCartButton
                      product={product}
                      variant="default"
                      size="lg"
                      className="flex-1"
                      onAdded={onClose}
                    >
                      Add to bag
                    </AddToCartButton>
                    <Link
                      href={`/store/${product.slug}`}
                      className="flex min-h-[44px] items-center justify-center rounded-sm border border-rule-2 px-6 py-3 font-medium text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      View details
                    </Link>
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
