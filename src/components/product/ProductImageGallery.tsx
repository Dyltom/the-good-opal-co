'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

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
  const [isZoomed, setIsZoomed] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lightboxRef = useFocusTrap<HTMLDivElement>({ active: isZoomed })

  useEffect(() => {
    if (!isZoomed) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsZoomed(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isZoomed])

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
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        className="group relative block aspect-square w-full overflow-hidden border border-warm-grey/55 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
        aria-label={`Open a larger view of ${productName}`}
      >
        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
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
              {stock === 1 ? 'One available' : `${stock} available`}
            </span>
          )}
        </div>
        <span className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 bg-cream/95 px-4 font-sans text-xs font-semibold text-charcoal">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
          View larger
        </span>
      </button>

      {/* Image Gallery Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              aria-current={selectedImageIndex === index ? 'true' : undefined}
              className={cn(
                "h-20 w-20 flex-shrink-0 overflow-hidden border-2 transition-colors duration-150",
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

      {isZoomed ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Large image of ${productName}`}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/95 p-4 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsZoomed(false)
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute right-4 top-4 z-10 flex min-h-11 min-w-11 items-center justify-center border border-cream/30 bg-charcoal text-cream hover:bg-cream hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream sm:right-7 sm:top-7"
            aria-label="Close large image"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="relative h-full w-full max-w-6xl">
            <Image
              src={mainImage.url}
              alt={mainImage.alt}
              fill
              sizes="100vw"
              className="object-contain"
              quality={95}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
