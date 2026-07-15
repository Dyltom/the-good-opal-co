import { describe, expect, test } from 'vitest'
import type { BuilderOpal } from '@/components/custom-builder/config'
import {
  getBuilderOpalPhotoSamplingDimensions,
  getBuilderOpalPhotoSource,
} from '../opal-photo-source'

const opal: BuilderOpal = {
  id: '52',
  imageAlt: 'Black opal',
  imageUrl: '/listing.jpg',
  name: 'Lightning Ridge black opal',
  price: 120,
  renderStone: 'lightning',
  selectionKind: 'individual',
  slug: 'lightning-ridge-black-opal',
  stoneType: 'black-opal',
  stoneTypeLabel: 'Black opal',
  visual: {
    aspectRatio: 1.3,
    bodyColour: '#071521',
    evidence: 'catalogue',
    flashColours: ['#315cff', '#42e29a'],
    patternSeed: 52,
    photoFit: 'reviewed',
    recommendedStyle: 'aurora',
    silhouette: 'pear',
    textureCrop: { focalX: 0.452, focalY: 0.537, rotation: 4, zoom: 3.2 },
    transmission: 0.035,
  },
}

describe('builder opal photo source', () => {
  test('uses the listing photo and its reviewed crop by default', () => {
    expect(getBuilderOpalPhotoSource(opal)).toEqual({
      crop: opal.visual.textureCrop,
      kind: 'listing-photo',
      url: '/listing.jpg',
    })
  })

  test('uses an identity crop for an already rectified canonical face', () => {
    const canonical: BuilderOpal = {
      ...opal,
      visual: {
        ...opal.visual,
        canonicalFace: {
          inputHash: 'a'.repeat(64),
          sourceImageHash: 'b'.repeat(64),
          url: `/api/builder/opal-face/v1/52/${'a'.repeat(64)}.png`,
        },
      },
    }

    const source = getBuilderOpalPhotoSource(canonical)
    expect(source).toEqual({
      crop: { focalX: 0.5, focalY: 0.5, rotation: 0, zoom: 1 },
      kind: 'canonical-face',
      url: canonical.visual.canonicalFace?.url,
    })
    expect(getBuilderOpalPhotoSamplingDimensions(source, { height: 512, width: 512 }, 1.3)).toEqual(
      { height: 1, width: 1.3 }
    )
  })

  test('preserves real listing dimensions for reviewed source-photo crops', () => {
    const source = getBuilderOpalPhotoSource(opal)
    expect(
      getBuilderOpalPhotoSamplingDimensions(source, { height: 900, width: 1200 }, 1.3)
    ).toEqual({ height: 900, width: 1200 })
  })
})
