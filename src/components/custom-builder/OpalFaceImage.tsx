'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { computePlacedPhotoCrop, rotationCoverScale } from '@/lib/custom-builder/photo-crop'
import type { BuilderOpal, OpalPlacement } from './config'

interface OpalFaceImageProps {
  alt: string
  className?: string
  eager?: boolean
  opal: BuilderOpal
  placement?: OpalPlacement
  sizes: string
}

export function OpalFaceImage({
  alt,
  className,
  eager = false,
  opal,
  placement,
  sizes,
}: OpalFaceImageProps) {
  const [imageSize, setImageSize] = useState<{
    height: number
    url: string
    width: number
  }>()
  const stoneAspect = 1 / opal.visual.aspectRatio
  const currentImageSize = imageSize?.url === opal.imageUrl ? imageSize : undefined
  const crop = useMemo(() => {
    if (!currentImageSize) return undefined
    const focus = opal.visual.textureCrop ?? { focalX: 0.5, focalY: 0.5, zoom: 1 }
    return computePlacedPhotoCrop(
      currentImageSize.width,
      currentImageSize.height,
      stoneAspect,
      focus,
      placement
    )
  }, [currentImageSize, opal.visual.textureCrop, placement, stoneAspect])

  const rotation = (opal.visual.textureCrop?.rotation ?? 0) + (placement?.opalRotation ?? 0)
  const coverScale = rotationCoverScale(stoneAspect, rotation)
  const handleLoad: ComponentProps<typeof Image>['onLoad'] = (event) =>
    setImageSize({
      height: event.currentTarget.naturalHeight,
      url: opal.imageUrl,
      width: event.currentTarget.naturalWidth,
    })

  const cropStyle = crop
    ? {
        height: `${100 / crop.height}%`,
        left: `${(-crop.left / crop.width) * 100}%`,
        top: `${(-crop.top / crop.height) * 100}%`,
        transform: `rotate(${rotation}deg) scale(${coverScale})`,
        transformOrigin: `${(crop.left + crop.width / 2) * 100}% ${(crop.top + crop.height / 2) * 100}%`,
        width: `${100 / crop.width}%`,
      }
    : undefined

  return (
    <div
      className={cn('relative overflow-hidden bg-cream/10', className)}
      aria-busy={!crop}
      data-opal-photo-state={crop ? 'ready' : 'loading'}
      style={{ aspectRatio: stoneAspect }}
    >
      <div className={cn('absolute', !crop && 'inset-0')} style={cropStyle}>
        <Image
          src={opal.imageUrl}
          alt={alt}
          draggable={false}
          fill
          loading={eager ? 'eager' : undefined}
          sizes={sizes}
          className={cn(
            'select-none transition-opacity duration-200 motion-reduce:transition-none',
            crop ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
        />
      </div>
    </div>
  )
}
