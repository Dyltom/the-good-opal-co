'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { computePhotoCrop, type NormalizedPhotoCrop } from '@/lib/custom-builder/photo-crop'
import type { BuilderOpal } from './config'

interface OpalFaceImageProps {
  alt: string
  className?: string
  opal: BuilderOpal
  sizes: string
}

export function OpalFaceImage({ alt, className, opal, sizes }: OpalFaceImageProps) {
  const [crop, setCrop] = useState<NormalizedPhotoCrop>()
  const textureCrop = opal.visual.textureCrop
  const stoneAspect = 1 / opal.visual.aspectRatio

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
            width: `${100 / crop.width}%`,
          }}
        >
          <Image src={opal.imageUrl} alt={alt} fill sizes={sizes} />
        </div>
      ) : (
        <Image
          src={opal.imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onLoad={(event) => {
            if (!textureCrop) return
            setCrop(
              computePhotoCrop(
                event.currentTarget.naturalWidth,
                event.currentTarget.naturalHeight,
                stoneAspect,
                textureCrop
              )
            )
          }}
        />
      )}
    </div>
  )
}
