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
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-warm-grey/40 bg-white shadow-sm">
          <div className="absolute inset-0 bg-cream">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full border border-warm-grey/50 bg-white" />
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
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-warm-grey/40 bg-white shadow-sm">
          <div className="absolute inset-0 bg-cream">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full border border-warm-grey/50 bg-white" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-warm-grey/40 bg-white shadow-sm">
        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          fill
          className="object-cover transition-opacity duration-500 group-hover:opacity-95"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {featured && (
              <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-charcoal shadow-sm">
                Featured
              </span>
            )}
          </div>
          {stock !== undefined && stock <= 10 && stock > 0 && (
            <span className="rounded-full bg-fire-pink-dark px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
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
                  ? "border-opal-electric-accessible ring-2 ring-opal-electric-accessible ring-offset-2 ring-offset-white"
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
