'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

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
  }
}

/**
 * Product Card Component
 *
 * Displays product with Quick Add functionality
 * Includes hover effects and visual feedback
 */
export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event from bubbling to Link
    setIsAdding(true)

    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
    })

    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    })

    // Reset button state
    setTimeout(() => setIsAdding(false), 1000)
  }

  const stockStatus = product.stock > 20 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'
  const stockColor = stockStatus === 'in-stock' ? 'text-green-600' : stockStatus === 'low-stock' ? 'text-orange-600' : 'text-red-600'

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      {/* Product Image */}
      <Link href={`/store/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-110">
            {product.name.includes('Coffee') && '☕'}
            {product.name.includes('Tea') && '🍵'}
            {product.name.includes('Mug') && '🍺'}
            {product.name.includes('Grinder') && '⚙️'}
            {product.name.includes('Press') && '🫖'}
            {product.name.includes('Infuser') && '🌿'}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
            <div className="flex flex-col gap-1">
              {product.featured && (
                <Badge className="w-fit">Featured</Badge>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <Badge variant="destructive" className="w-fit">
                  Sale
                </Badge>
              )}
            </div>
            {/* Stock indicator */}
            {product.stock <= 10 && product.stock > 0 && (
              <Badge variant="outline" className={`w-fit ${stockColor} bg-white/90`}>
                Only {product.stock} left!
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        <Link href={`/store/${product.slug}`} className="block">
          <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-lg font-bold">
              {formatCurrency(product.price, 'USD')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice, 'USD')}
                </span>
                <Badge variant="destructive" className="text-[10px] px-1 py-0">
                  −{formatCurrency(product.compareAtPrice - product.price, 'USD')}
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <p className={`text-xs font-medium ${stockColor} mb-3`}>
            {stockStatus === 'in-stock' && `In Stock (${product.stock})`}
            {stockStatus === 'low-stock' && `Only ${product.stock} left!`}
            {stockStatus === 'out-of-stock' && 'Out of Stock'}
          </p>
        </Link>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleQuickAdd}
            disabled={product.stock === 0 || isAdding}
          >
            {product.stock === 0 ? 'Out of Stock' : isAdding ? '✓' : 'Add'}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/store/${product.slug}`}>Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
