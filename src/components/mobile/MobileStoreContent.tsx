'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Filter, X, ChevronUp, Search } from 'lucide-react'
import { MobileProductCard } from './MobileProductCard'
import { cn } from '@/lib/utils'
import type { Product } from '@/app/(marketing)/store/page'

interface MobileStoreContentProps {
  products: Product[]
}

export function MobileStoreContent({ products }: MobileStoreContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const filterY = useTransform(scrollYProgress, [0, 0.1], [0, -100])

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div ref={scrollRef} className="min-h-screen">
      {/* Sticky Header with Filters */}
      <motion.div
        style={{ y: filterY }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100"
      >
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search opals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-opal-electric-accessible/20"
            />
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="px-4 pb-4 -mt-2">
          <motion.div
            className="flex gap-2 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {category === 'all' ? 'All' : category.replace(/-/g, ' ')}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Products Grid with Stagger Animation */}
      <div className="p-4">
        <motion.div
          layout
          className="grid grid-cols-1 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <MobileProductCard
                key={product.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  compareAtPrice: product.compareAtPrice,
                  stock: product.stock,
                  image: product.images?.[0]?.image?.url,
                  createdAt: product.createdAt,
                }}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {/* Filter Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center z-30"
        >
          <Filter className="w-6 h-6" />
        </motion.button>

        {/* Scroll to Top */}
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-40 right-4 w-14 h-14 bg-white border border-gray-200 rounded-full shadow-xl flex items-center justify-center z-30"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Full Screen Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-hidden"
            >
              {/* Filter Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Price Range Slider */}
                <div>
                  <h4 className="font-medium text-sm mb-4">Price Range</h4>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>$0</span>
                      <span>$1000+</span>
                    </div>
                  </div>
                </div>

                {/* Other filters can be added here */}
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-black text-white rounded-full font-medium"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
