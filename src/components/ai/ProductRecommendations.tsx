'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock, Heart } from 'lucide-react'
import { useRecommendations } from '@/hooks/usePersonalization'
import { EnhancedProductCard } from '@/components/product/EnhancedProductCard'
import { ProductCardSkeleton } from '@/components/ui/LoadingStates'
import type { Product } from '@/app/(marketing)/store/page'

interface ProductRecommendationsProps {
  products: Product[]
  title?: string
  subtitle?: string
  variant?: 'default' | 'compact'
}

/**
 * AI-Powered Product Recommendations Component
 * Shows personalized product suggestions based on user behavior
 */
export function ProductRecommendations({
  products,
  title,
  subtitle,
  variant = 'default',
}: ProductRecommendationsProps) {
  const recommendations = useRecommendations(products, variant === 'compact' ? 4 : 8)

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-opal-electric to-opal-deep mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-3xl font-serif mb-3">
            {title || 'Recommended for You'}
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle || 'Based on your preferences and browsing history, we think you'll love these opals'}
          </p>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className={variant === 'compact'
        ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
        : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
      }>
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: [0.21, 1.02, 0.73, 1]
            }}
          >
            <EnhancedProductCard
              product={product}
              index={index}
              variant={variant === 'compact' ? 'minimal' : 'default'}
              showRating
              showQuickView
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/**
 * Recently Viewed Products Component
 * Shows products the user has recently looked at
 */
export function RecentlyViewedProducts({ products }: { products: Product[] }) {
  // In a real app, this would pull from personalization data
  // For now, we'll show a subset of products
  const recentProducts = products.slice(0, 4)

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Recently Viewed</h3>
        </div>
        <button className="text-sm text-opal-electric hover:text-opal-electric-accessible transition-colors">
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentProducts.map((product, index) => (
          <EnhancedProductCard
            key={product.id}
            product={product}
            index={index}
            variant="minimal"
            showWishlist={false}
            animated={false}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Trending Now Component
 * Shows products that are currently popular
 */
export function TrendingNow({ products }: { products: Product[] }) {
  // Filter for featured or high-stock products as "trending"
  const trendingProducts = products
    .filter(p => p.featured || p.stock > 5)
    .slice(0, 6)

  if (trendingProducts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fire-gold/10">
              <TrendingUp className="w-6 h-6 text-fire-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-serif">Trending Now</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Popular choices from other collectors
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {trendingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative">
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-fire-gold text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                      #1 Trending
                    </div>
                  </div>
                )}
                <EnhancedProductCard
                  product={product}
                  index={index}
                  showRating
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Wishlist Reminder Component
 * Shows items from user's wishlist that are low in stock
 */
export function WishlistReminder({ products }: { products: Product[] }) {
  // In a real app, this would pull from actual wishlist data
  const wishlistItems = products.filter(p => p.stock > 0 && p.stock <= 3).slice(0, 3)

  if (wishlistItems.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-fire-pink/10 to-fire-coral/10 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-white shadow-sm">
          <Heart className="w-6 h-6 text-fire-pink" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Items in your wishlist are running low!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Some of your saved items have limited stock. Don't miss out!
          </p>
          <div className="grid grid-cols-3 gap-3">
            {wishlistItems.map((product) => (
              <a
                key={product.id}
                href={`/store/${product.slug}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-red-600">Only {product.stock} left</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}