'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getCategoryGradient } from '@/data/categories'
import { StockBadge, NewBadge, AuthenticityBadge } from '@/components/trust'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    description: string
    price: number
    compareAtPrice?: number
    stock: number
    featured?: boolean
    category?: string
  }
}

/**
 * Luxury Product Card Component
 * Premium jewelry display with elegant hover effects
 * Uses centralized category gradients for consistency
 */
export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Link href={`/store/${product.slug}`} className="group block">
      <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
        {/* Product Image Area */}
        <div className="relative aspect-square overflow-hidden bg-warm-grey-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || '/images/placeholder-opal.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="absolute inset-0 ${getCategoryGradient(product.category)} opacity-90">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-8xl opacity-60">💎</div>
                  </div>
                ` + parent.innerHTML
              }
            }}
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 gap-2">
            <div className="flex flex-col gap-2">
              {product.featured && <NewBadge />}
              {discountPercent > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error text-white shadow-lg backdrop-blur-sm">
                  <span className="text-xs font-bold">SAVE {discountPercent}%</span>
                </div>
              )}
            </div>
            {product.stock <= 10 && product.stock > 0 && (
              <StockBadge stock={product.stock} variant="compact" />
            )}
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg">
              View Details
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-opal-blue transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-2xl font-bold text-opal-blue">
              {formatCurrency(product.price, 'USD')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice, 'USD')}
              </span>
            )}
          </div>

          {/* Authenticity Badge */}
          <div className="pt-3 border-t border-warm-grey">
            <AuthenticityBadge />
          </div>

          {/* Add to Cart Button */}
          {product.stock > 0 && (
            <div className="pt-3" onClick={(e) => e.preventDefault()}>
              <AddToCartButton
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                }}
                className="w-full bg-opal-blue hover:bg-opal-blue-dark text-white font-semibold"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </AddToCartButton>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
