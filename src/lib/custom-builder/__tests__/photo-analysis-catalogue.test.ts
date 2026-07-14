import { resolve } from 'node:path'
import sharp from 'sharp'
import { describe, expect, test } from 'vitest'
import {
  analyzeOpalRaster,
  type OpalShapeHint,
  type ReviewedOpalCropHint,
} from '../photo-analysis'
import { parseBuilderStoneContour } from '../stone-contour'

interface CatalogueFixture {
  expectedSource: 'image' | 'reviewed-fallback'
  filename: string
  hint: ReviewedOpalCropHint
  shapeHint: OpalShapeHint
  stoneAspect?: number
}

const fixtures: Record<string, CatalogueFixture> = {
  'lightning-ridge-black-opal-6-30ct': {
    expectedSource: 'image',
    filename: '20211129_164004-1-1.jpg',
    hint: { focalX: 0.452, focalY: 0.537, rotation: 0, zoom: 3.2 },
    shapeHint: 'pear',
  },
  'lightning-ridge-black-opal-1-45-cts': {
    expectedSource: 'reviewed-fallback',
    filename: '20211129_164200-1-1.jpg',
    hint: { focalX: 0.465, focalY: 0.52, rotation: 0, zoom: 10 },
    shapeHint: 'elongated',
  },
  'lightning-ridge-semi-black-opal-1-40-cts': {
    expectedSource: 'reviewed-fallback',
    filename: 'Screenshot_20211129-234455_Gallery.jpg',
    hint: { focalX: 0.45, focalY: 0.52, rotation: 0, zoom: 8 },
    shapeHint: 'elongated',
  },
  'lightning-ridge-semi-black-opal-5-50-cts': {
    expectedSource: 'image',
    filename: '20210914_143552-1.jpg',
    hint: { focalX: 0.526, focalY: 0.584, rotation: 0, zoom: 3.91 },
    shapeHint: 'elongated',
  },
  'coober-pedy-white-opal-6-35-cts': {
    expectedSource: 'reviewed-fallback',
    filename: '20211129_164407-1-1.jpg',
    hint: { focalX: 0.5, focalY: 0.52, rotation: 0, zoom: 3.35 },
    shapeHint: 'cushion',
  },
  'mintabie-semi-black-opal-6-80-cts': {
    expectedSource: 'reviewed-fallback',
    filename: '20210523_092426-1.jpg',
    hint: { focalX: 0.525, focalY: 0.52, rotation: 0, zoom: 6.5 },
    shapeHint: 'pear',
  },
  'coober-pedy-white-opal-2-30-cts-copy': {
    expectedSource: 'reviewed-fallback',
    filename: '20210606_144434.jpg',
    hint: { focalX: 0.48, focalY: 0.48, rotation: 0, zoom: 6 },
    shapeHint: 'oval',
  },
  'mintabie-semi-black-opal-1-35-cts': {
    expectedSource: 'image',
    filename: '20210923_173846-1.jpg',
    hint: { focalX: 0.501, focalY: 0.493, rotation: 0, zoom: 3.61 },
    shapeHint: 'oval',
    stoneAspect: 7 / 8,
  },
  'mintabie-semi-black-opal-1-05-cts': {
    expectedSource: 'reviewed-fallback',
    filename: '20210923_174046.jpg',
    hint: { focalX: 0.515, focalY: 0.49, rotation: 0, zoom: 7 },
    shapeHint: 'cushion',
    stoneAspect: 5 / 6.5,
  },
  'queensland-crystal-pipe-opal-1-45-cts': {
    expectedSource: 'image',
    filename: '20211012_173649.jpg',
    hint: { focalX: 0.517, focalY: 0.466, rotation: 0, zoom: 4.74 },
    shapeHint: 'elongated',
    stoneAspect: 5.3 / 9.5,
  },
  'lightning-ridge-white-opal-1-70-cts-2': {
    expectedSource: 'reviewed-fallback',
    filename: '20211104_231959.jpg',
    hint: { focalX: 0.55, focalY: 0.48, rotation: 0, zoom: 5.5 },
    shapeHint: 'pear',
    stoneAspect: 8.5 / 13,
  },
  'lightning-ridge-white-opal-1-05-cts': {
    expectedSource: 'image',
    filename: '20211104_234659-1-1.jpg',
    hint: { focalX: 0.507, focalY: 0.489, rotation: 0, zoom: 4.16 },
    shapeHint: 'oval',
    stoneAspect: 6 / 7,
  },
  'mintabie-carved-heart': {
    expectedSource: 'image',
    filename: 'IMG_0774.jpg',
    hint: { focalX: 0.4875, focalY: 0.532, rotation: 0, zoom: 3.2 },
    shapeHint: 'heart',
    stoneAspect: 5.5 / 6,
  },
}

describe('current individual-opal catalogue analysis', () => {
  test(
    'produces a reviewable truthful candidate for every current source photo',
    async () => {
      const outcomes = await Promise.all(
        Object.entries(fixtures).map(async ([slug, fixture]) => {
          const raster = await sharp(
            resolve(process.cwd(), 'public/images/products', fixture.filename)
          )
            .rotate()
            .toColourspace('srgb')
            .removeAlpha()
            .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
            .raw()
            .toBuffer({ resolveWithObject: true })
          const analysis = analyzeOpalRaster({
            channels: raster.info.channels,
            data: raster.data,
            height: raster.info.height,
            reviewedCropHint: fixture.hint,
            shapeHint: fixture.shapeHint,
            stoneAspect: fixture.stoneAspect,
            width: raster.info.width,
          })
          return { analysis, fixture, slug }
        })
      )

      expect(outcomes).toHaveLength(13)
      for (const { analysis, fixture, slug } of outcomes) {
        expect(analysis, slug).toBeDefined()
        expect(parseBuilderStoneContour(analysis?.contour), slug).toBeDefined()
        if (fixture.expectedSource === 'reviewed-fallback') {
          expect(analysis, slug).toMatchObject({
            confidence: 0.7,
            focalX: fixture.hint.focalX,
            focalY: fixture.hint.focalY,
            rotation: fixture.hint.rotation,
            zoom: fixture.hint.zoom,
          })
        } else {
          expect(analysis?.confidence, slug).not.toBe(0.7)
        }
      }
    },
    20_000
  )
})
