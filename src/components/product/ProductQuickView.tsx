'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Truck, Shield } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/app/(marketing)/store/page'

interface ProductQuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Product Quick View Modal
 * Shows product details in a slide-out panel for quick shopping
 */
export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  if (!product) return null

  const images = product.images || []
  const hasMultipleImages = images.length > 1
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = isOnSale
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implement actual wishlist functionality
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl font-serif">{product.name}</SheetTitle>
              {product.stoneType && (
                <p className="text-sm text-muted-foreground mt-1">{product.stoneType}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              className="rounded-full"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <AnimatePresence mode="wait">
              {images[currentImageIndex] && (
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <OptimizedImage
                    src={images[currentImageIndex]?.image?.url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isOnSale && (
                <Badge className="bg-red-500 text-white">
                  {discountPercentage}% OFF
                </Badge>
              )}
              {product.stock < 3 && product.stock > 0 && (
                <Badge variant="outline" className="bg-white/90">
                  Only {product.stock} left
                </Badge>
              )}
            </div>
          </div>

          {/* Price and Stock */}
          <div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-semibold">
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <p className="text-sm text-green-600">In stock</p>
            ) : (
              <p className="text-sm text-red-600">Sold out</p>
            )}
          </div>

          <Separator />

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              {product.stoneOrigin && (
                <div>
                  <p className="text-sm font-medium">Origin</p>
                  <p className="text-sm text-muted-foreground">{product.stoneOrigin}</p>
                </div>
              )}
              {product.weight && (
                <div>
                  <p className="text-sm font-medium">Weight</p>
                  <p className="text-sm text-muted-foreground">{product.weight}ct</p>
                </div>
              )}
              {product.material && (
                <div>
                  <p className="text-sm font-medium">Material</p>
                  <p className="text-sm text-muted-foreground">{product.material}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {product.category.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Trust Signals */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Authentic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Free shipping $500+</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              disabled={product.stock === 0}
              className="flex-1"
              size="lg"
              showConfetti
            />
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <a href={`/products/${product.slug}`}>
                View Full Details
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Import cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}