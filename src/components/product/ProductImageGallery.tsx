'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductImage {
  url: string
  alt: string
}

interface ProductImageGalleryProps {
  productName: string
  images: ProductImage[]
  featured?: boolean
  stock?: number
}

export function ProductImageGallery({
  productName,
  images,
  featured,
  stock
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        {/* Fallback for no images */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep p-[1px] opacity-50">
            <div className="absolute inset-[1px] rounded-2xl bg-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-opal-electric/20 to-fire-pink/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink opacity-30" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const mainImage = images[selectedImageIndex]

  if (!mainImage) {
    return (
      <div className="space-y-4">
        {/* Fallback for invalid selection */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep p-[1px] opacity-50">
            <div className="absolute inset-[1px] rounded-2xl bg-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-opal-electric/20 to-fire-pink/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-opal-electric to-fire-pink opacity-30" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl group">
        {/* Premium border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-gold to-opal-deep p-[1px] opacity-50">
          <div className="absolute inset-[1px] rounded-2xl bg-white" />
        </div>

        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {featured && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-fire-gold to-fire-orange text-white text-xs font-bold rounded-full shadow-lg">
                FEATURED
              </span>
            )}
          </div>
          {stock !== undefined && stock <= 10 && stock > 0 && (
            <span className="px-3 py-1.5 bg-fire-pink text-white text-xs font-bold rounded-full shadow-lg">
              Only {stock} left
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200",
                selectedImageIndex === index
                  ? "border-opal-electric scale-105"
                  : "border-transparent hover:border-opal-electric/50"
              )}
              aria-label={`View image ${index + 1} of ${productName}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}