'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { useEffect, useState } from 'react'
import { ProductGridSkeleton } from '@/components/ui/LoadingStates'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
  image?: string
}

interface FeaturedProductsProps {
  title?: string
  description?: string
  limit?: number
  featured?: boolean
  className?: string
  variant?: 'light' | 'dark'
  hideTitle?: boolean
}

/**
 * Professional Featured Products Section
 * Clean, minimal design with focus on products
 */
export function FeaturedProductsPro({
  title,
  description,
  limit = 8,
  featured = true,
  className = '',
  variant = 'light',
  hideTitle = false,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const filtered = featured ? data.filter((p: Product) => p.featured) : data
        setProducts(filtered.slice(0, limit))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch products:', err)
        setLoading(false)
      })
  }, [limit, featured])

  const isDark = variant === 'dark'

  return (
    <div className={className}>
      {!hideTitle && title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className={cn(
                "font-display text-3xl md:text-4xl font-bold",
                isDark ? "text-white" : "text-charcoal"
              )}>
                {title}
              </h2>
              {description && (
                <p className={cn(
                  "text-lg mt-2",
                  isDark ? "text-white/70" : "text-content-muted"
                )}>
                  {description}
                </p>
              )}
            </div>
            <Link
              href="/store"
              className={cn(
                "hidden md:flex items-center gap-2 text-sm font-medium transition-colors",
                isDark
                  ? "text-white/70 hover:text-white"
                  : "text-content-muted hover:text-charcoal"
              )}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Subtle separator line */}
          <div className={cn(
            "h-px",
            isDark ? "bg-white/10" : "bg-gray-200"
          )} />
        </motion.div>
      )}

      {loading ? (
        <ProductGridSkeleton count={limit} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              variant="museum"
              darkBackground={variant === 'dark'}
              showMetadata={true}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "text-center py-20 rounded-2xl",
            isDark ? "bg-white/5" : "bg-gray-50"
          )}
        >
          <div className={cn(
            "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
            isDark ? "bg-white/10" : "bg-gray-200"
          )}>
            <svg
              className={cn("w-10 h-10", isDark ? "text-white/50" : "text-gray-400")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className={cn(
            "text-xl font-semibold mb-2",
            isDark ? "text-white" : "text-charcoal"
          )}>
            Explore Our Collection
          </h3>
          <p className={cn(
            "max-w-md mx-auto mb-8",
            isDark ? "text-white/60" : "text-content-muted"
          )}>
            Discover unique Australian opals and handcrafted jewelry pieces in our store.
          </p>
          <Link
            href="/store"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all",
              isDark
                ? "bg-white text-charcoal hover:bg-gray-100"
                : "bg-charcoal text-white hover:bg-charcoal/90"
            )}
          >
            Visit Store
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Mobile view all link */}
      {!hideTitle && products.length > 0 && (
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/store"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium transition-colors",
              isDark
                ? "text-white/70 hover:text-white"
                : "text-content-muted hover:text-charcoal"
            )}
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}