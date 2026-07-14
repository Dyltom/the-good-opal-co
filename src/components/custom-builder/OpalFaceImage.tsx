'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  computePlacedPhotoCrop,
  rotationCoverScale,
} from '@/lib/custom-builder/photo-crop'
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
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>()
  const stoneAspect = 1 / opal.visual.aspectRatio
  const crop = useMemo(
    () => {
      if (!imageSize) return undefined
      const focus = opal.visual.textureCrop ?? { focalX: 0.5, focalY: 0.5, zoom: 1 }
      return computePlacedPhotoCrop(
        imageSize.width,
        imageSize.height,
        stoneAspect,
        focus,
        placement
      )
    },
    [imageSize, opal.visual.textureCrop, placement, stoneAspect]
  )

  useEffect(() => setImageSize(undefined), [opal.imageUrl])

  const rotation = (opal.visual.textureCrop?.rotation ?? 0) + (placement?.opalRotation ?? 0)
  const coverScale = rotationCoverScale(stoneAspect, rotation)
  const handleLoad: ComponentProps<typeof Image>['onLoad'] = (event) =>
    setImageSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    })

  return (
    <div
      className={cn('relative overflow-hidden bg-cream/10', className)}
      style={{ aspectRatio: stoneAspect }}
    >
      {crop ? (
        <div
          className="absolute"
          style={{
            height: `${100 / crop.height}%`,
            left: `${(-crop.left / crop.width) * 100}%`,
            top: `${(-crop.top / crop.height) * 100}%`,
            transform: `rotate(${rotation}deg) scale(${coverScale})`,
            transformOrigin: `${(crop.left + crop.width / 2) * 100}% ${(crop.top + crop.height / 2) * 100}%`,
            width: `${100 / crop.width}%`,
          }}
        >
          <Image
            src={opal.imageUrl}
            alt={alt}
            fill
            loading={eager ? 'eager' : undefined}
            sizes={sizes}
            onLoad={handleLoad}
          />
        </div>
      ) : (
        <Image
          src={opal.imageUrl}
          alt={alt}
          fill
          loading={eager ? 'eager' : undefined}
          sizes={sizes}
          className="object-cover"
          style={{ transform: `rotate(${rotation}deg) scale(${coverScale})` }}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}
