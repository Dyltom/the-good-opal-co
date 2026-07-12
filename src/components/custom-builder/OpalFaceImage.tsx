'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { applyPhotoPlacement, computePhotoCrop } from '@/lib/custom-builder/photo-crop'
import type { BuilderOpal, OpalPlacement } from './config'

interface OpalFaceImageProps {
  alt: string
  className?: string
  opal: BuilderOpal
  placement?: OpalPlacement
  sizes: string
}

export function OpalFaceImage({ alt, className, opal, placement, sizes }: OpalFaceImageProps) {
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>()
  const stoneAspect = 1 / opal.visual.aspectRatio
  const adjustedFocus = applyPhotoPlacement(
    opal.visual.textureCrop ?? { focalX: 0.5, focalY: 0.5, zoom: 1 },
    placement
  )
  const crop = useMemo(
    () =>
      imageSize
        ? computePhotoCrop(imageSize.width, imageSize.height, stoneAspect, adjustedFocus)
        : undefined,
    [adjustedFocus, imageSize, stoneAspect]
  )

  useEffect(() => setImageSize(undefined), [opal.imageUrl])

  const rotation = placement?.opalRotation ?? 0
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
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            width: `${100 / crop.width}%`,
          }}
        >
          <Image src={opal.imageUrl} alt={alt} fill sizes={sizes} onLoad={handleLoad} />
        </div>
      ) : (
        <Image
          src={opal.imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          style={{ transform: `rotate(${rotation}deg) scale(${rotation === 0 ? 1 : 1.15})` }}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}
