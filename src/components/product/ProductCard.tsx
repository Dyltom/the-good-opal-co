'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { getCategoryGradient } from '@/data/categories'

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
        {/* Product Image Area with Opal-inspired Gradient */}
        <div className="relative aspect-square overflow-hidden">
          {/* Beautiful gradient representing opal colors */}
          <div className={`absolute inset-0 ${getCategoryGradient(product.category)} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}>
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Centered Gemstone Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-110 duration-500 transform">
              💎
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            <div className="flex flex-col gap-2">
              {product.featured && (
                <Badge className="bg-black/80 text-white backdrop-blur-sm border-0 hover:bg-black/90">
                  Featured
                </Badge>
              )}
              {discountPercent > 0 && (
                <Badge className="bg-red-500 text-white backdrop-blur-sm border-0 hover:bg-red-600">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>
            {product.stock <= 3 && product.stock > 0 && (
              <Badge className="bg-amber-500/90 text-white backdrop-blur-sm border-0">
                Only {product.stock} left
              </Badge>
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

          {/* Stock Status */}
          {product.stock === 0 ? (
            <p className="text-sm font-medium text-red-600">Out of Stock</p>
          ) : product.stock <= 3 ? (
            <p className="text-sm font-medium text-amber-600">Limited Availability</p>
          ) : (
            <p className="text-sm font-medium text-green-600">In Stock</p>
          )}
        </div>
      </Card>
    </Link>
  )
}
