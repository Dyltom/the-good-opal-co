'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  computePlacedPhotoCrop,
  constrainPhotoPlacementRotation,
  rotationCoverScale,
} from '@/lib/custom-builder/photo-crop'
import {
  getBuilderOpalPhotoSamplingDimensions,
  getBuilderOpalPhotoSource,
  type BuilderOpalPhotoSource,
} from '@/lib/custom-builder/opal-photo-source'
import type { BuilderOpal, OpalPlacement } from './config'
import { cssSilhouetteClipPath, getRenderedStoneAspect } from './geometry'

interface OpalFaceImageProps {
  alt: string
  className?: string
  clipToStone?: boolean
  eager?: boolean
  opal: BuilderOpal
  placement?: OpalPlacement
  sizes: string
}

export function OpalFaceImage({
  alt,
  className,
  clipToStone = false,
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
  const [failedCanonicalUrl, setFailedCanonicalUrl] = useState<string>()
  const photoSource = useMemo<BuilderOpalPhotoSource>(() => {
    const preferredPhotoSource = getBuilderOpalPhotoSource(opal)
    return preferredPhotoSource.kind === 'canonical-face' &&
      failedCanonicalUrl === preferredPhotoSource.url
      ? {
          crop: opal.visual.textureCrop,
          kind: 'listing-photo',
          url: opal.imageUrl,
        }
      : preferredPhotoSource
  }, [failedCanonicalUrl, opal])
  const stoneAspect = getRenderedStoneAspect({ shape: opal.visual.silhouette }, opal)
  const currentImageSize = imageSize?.url === photoSource.url ? imageSize : undefined
  const crop = useMemo(() => {
    if (!currentImageSize) return undefined
    const focus = photoSource.crop ?? { focalX: 0.5, focalY: 0.5, zoom: 1 }
    const samplingSize = getBuilderOpalPhotoSamplingDimensions(
      photoSource,
      currentImageSize,
      stoneAspect
    )
    return computePlacedPhotoCrop(
      samplingSize.width,
      samplingSize.height,
      stoneAspect,
      focus,
      placement
    )
  }, [currentImageSize, photoSource, placement, stoneAspect])

  const baseZoom = photoSource.crop?.zoom ?? 1
  const baseRotation = photoSource.crop?.rotation ?? 0
  const placementScale = placement?.opalScale ?? 1
  const customerRotation = useMemo(
    () =>
      constrainPhotoPlacementRotation(
        stoneAspect,
        baseZoom,
        placementScale,
        placement?.opalRotation ?? 0,
        baseRotation
      ),
    [baseRotation, baseZoom, placement?.opalRotation, placementScale, stoneAspect]
  )
  const rotation = baseRotation + customerRotation
  const coverScale = rotationCoverScale(stoneAspect, rotation)
  const silhouetteClipPath = clipToStone
    ? cssSilhouetteClipPath(opal.visual.silhouette, opal.visual.contour)
    : undefined
  const silhouetteClass = clipToStone
    ? {
        cushion: 'rounded-[22%]',
        elongated: 'rounded-[50%]',
        heart: '',
        oval: 'rounded-[50%]',
        pear: '',
        round: 'rounded-full',
      }[opal.visual.silhouette]
    : undefined
  const handleLoad: ComponentProps<typeof Image>['onLoad'] = (event) =>
    setImageSize({
      height: event.currentTarget.naturalHeight,
      url: photoSource.url,
      width: event.currentTarget.naturalWidth,
    })
  const handleError: ComponentProps<typeof Image>['onError'] = () => {
    if (photoSource.kind === 'canonical-face') {
      setFailedCanonicalUrl(photoSource.url)
    }
  }

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
      className={cn('relative overflow-hidden bg-cream/10', silhouetteClass, className)}
      aria-busy={!crop}
      data-opal-photo-state={crop ? 'ready' : 'loading'}
      data-opal-photo-source={photoSource.kind}
      style={{ aspectRatio: stoneAspect, clipPath: silhouetteClipPath }}
      data-opal-photo-shape={clipToStone ? opal.visual.silhouette : undefined}
    >
      <div className={cn('absolute', !crop && 'inset-0')} style={cropStyle}>
        <Image
          src={photoSource.url}
          alt={alt}
          draggable={false}
          fill
          loading={eager ? 'eager' : undefined}
          sizes={sizes}
          className={cn(
            'select-none transition-opacity duration-200 motion-reduce:transition-none',
            crop ? 'opacity-100' : 'opacity-0'
          )}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    </div>
  )
}
