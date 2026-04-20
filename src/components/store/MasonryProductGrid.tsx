'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

import { Spinner } from '@/components/ui/LoadingStates'
import type { Product } from '@/app/(marketing)/store/page'

interface MasonryProductGridProps {
  products: Product[]
  columns?: number
  gap?: number
  infiniteScroll?: boolean
  onLoadMore?: () => Promise<Product[]>
}

/**
 * Masonry Product Grid Component
 * Pinterest-style layout with variable height cards and infinite scroll
 */
export function MasonryProductGrid({
  products,
  columns = 4,
  gap = 16,
  infiniteScroll = true,
  onLoadMore,
}: MasonryProductGridProps) {
  const [items, setItems] = useState(products)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const columnHeightsRef = useRef<number[]>([])
  const observerRef = useRef<HTMLDivElement>(null)

  // Calculate responsive columns
  const getColumns = useCallback(() => {
    if (typeof window === 'undefined') return columns
    const width = window.innerWidth
    if (width < 640) return 1
    if (width < 768) return 2
    if (width < 1024) return 3
    return columns
  }, [columns])

  const [actualColumns, setActualColumns] = useState(getColumns())

  useEffect(() => {
    const handleResize = () => {
      setActualColumns(getColumns())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getColumns])

  // Initialize column heights
  useEffect(() => {
    columnHeightsRef.current = new Array(actualColumns).fill(0)
  }, [actualColumns])

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !onLoadMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true)
          try {
            const newProducts = await onLoadMore()
            if (newProducts.length === 0) {
              setHasMore(false)
            } else {
              setItems((prev) => [...prev, ...newProducts])
            }
          } catch (error) {
            console.error('Error loading more products:', error)
            setHasMore(false)
          } finally {
            setIsLoading(false)
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [infiniteScroll, onLoadMore, hasMore, isLoading])

  // Calculate item positions
  const getItemStyle = (index: number) => {
    const columnIndex = index % actualColumns
    const row = Math.floor(index / actualColumns)

    // Calculate variable heights for visual interest
    const baseHeight = 320 // Base card height
    const heightVariations = [0, 40, 80, 20, 60, 100, 30, 90]
    const extraHeight = heightVariations[index % heightVariations.length] ?? 0
    const totalHeight = baseHeight + extraHeight

    return {
      position: 'absolute' as const,
      width: `calc((100% - ${gap * (actualColumns - 1)}px) / ${actualColumns})`,
      left: `calc(${columnIndex} * (100% / ${actualColumns} + ${gap}px / ${actualColumns}))`,
      top: row * (baseHeight + gap) + (row * 20), // Slight offset for visual interest
      height: totalHeight,
    }
  }

  // Container height calculation
  const containerHeight = Math.ceil(items.length / actualColumns) * (320 + gap) + 200

  return (
    <div className="relative">
      {/* Grid container */}
      <div
        className="relative w-full transition-all duration-700"
        style={{ height: containerHeight }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{
                duration: 0.5,
                delay: (index % actualColumns) * 0.1,
                ease: [0.21, 1.02, 0.73, 1],
              }}
              style={getItemStyle(index)}
              className="masonry-item"
            >
              <div className="h-full">
                <MasonryProductCard product={product} index={index} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Infinite scroll trigger */}
      {infiniteScroll && hasMore && (
        <div ref={observerRef} className="h-20" />
      )}

      {/* End of results */}
      {!hasMore && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            You&apos;ve reached the end of our collection
          </p>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Masonry Product Card
 * Variant of product card optimized for masonry layout
 */
function MasonryProductCard({ product, index }: { product: Product; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Use different aspect ratios for visual variety
  const aspectRatios = ['4:5', '3:4', '1:1', '5:6']
  const aspectRatio = aspectRatios[index % aspectRatios.length] ?? '4:5'

  return (
    <div className="h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer">
      {/* Image container with variable aspect ratio */}
      <div
        className="relative overflow-hidden bg-gray-100"
        style={{
          aspectRatio: aspectRatio.replace(':', '/'),
        }}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {product.images?.[0]?.image?.url && (
            <>
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              )}

              <Image
                src={product.images[0].image.url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                onLoad={() => setImageLoaded(true)}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              />
            </>
          )}
        </motion.div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-serif text-lg mb-1">{product.name}</h3>
            <p className="text-sm opacity-90">
              {product.stoneType && product.stoneOrigin
                ? `${product.stoneType} from ${product.stoneOrigin}`
                : product.category.replace(/-/g, ' ')
              }
            </p>
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
            <span className="text-sm font-semibold text-charcoal">
              ${product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stock indicator */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute top-3 left-3">
            <div className="bg-red-500 text-white rounded-full px-3 py-1.5 text-xs font-medium shadow-md">
              Only {product.stock} left
            </div>
          </div>
        )}
      </div>

      {/* Quick info on mobile */}
      <div className="p-4 md:hidden">
        <h3 className="font-serif text-base mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground">
          ${product.price.toLocaleString()}
        </p>
      </div>
    </div>
  )
}