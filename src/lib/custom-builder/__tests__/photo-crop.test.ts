import { describe, expect, test } from 'vitest'
import {
  applyPhotoPlacement,
  computePhotoCrop,
  computePlacedPhotoCrop,
  computePhotoTextureTransform,
  rotationCoverScale,
} from '../photo-crop'

describe('custom builder photo crops', () => {
  test.each([
    [1839, 1920, 1 / 1.23, { focalX: 0.501, focalY: 0.493, zoom: 3.61 }],
    [1920, 1865, 1 / 1.16, { focalX: 0.504, focalY: 0.487, zoom: 4.81 }],
    [1825, 1920, 1 / 1.77, { focalX: 0.517, focalY: 0.466, zoom: 4.74 }],
    [1920, 1855, 1 / 1.12, { focalX: 0.507, focalY: 0.495, zoom: 3.08 }],
  ] as const)(
    'keeps a reviewed source crop in bounds without stretching (%i x %i)',
    (imageWidth, imageHeight, stoneAspect, focus) => {
      const crop = computePhotoCrop(imageWidth, imageHeight, stoneAspect, focus)
      const croppedPixelAspect = (crop.width * imageWidth) / (crop.height * imageHeight)

      expect(crop.left).toBeGreaterThanOrEqual(0)
      expect(crop.top).toBeGreaterThanOrEqual(0)
      expect(crop.left + crop.width).toBeLessThanOrEqual(1)
      expect(crop.top + crop.height).toBeLessThanOrEqual(1)
      expect(croppedPixelAspect).toBeCloseTo(stoneAspect, 6)
    }
  )

  test('falls back to the complete image for invalid measurements', () => {
    expect(computePhotoCrop(0, 0, 0, { focalX: 0.5, focalY: 0.5, zoom: 0 })).toEqual({
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    })
  })

  test('enlarges rotated source photos enough to keep the stone aperture covered', () => {
    expect(rotationCoverScale(1, 0)).toBeCloseTo(1)
    expect(rotationCoverScale(1, 45)).toBeCloseTo(Math.SQRT2)
    expect(rotationCoverScale(0.8, 90)).toBeCloseTo(1.25)
    expect(rotationCoverScale(0, 45)).toBe(1)
  })

  test('keeps the selected crop centre fixed when Three.js rotates the texture', () => {
    const crop = { left: 0.2, top: 0.1, width: 0.4, height: 0.6 }
    const transform = computePhotoTextureTransform(crop, 0.8, 45)

    expect(0.5 + transform.offsetX).toBeCloseTo(crop.left + crop.width / 2)
    expect(0.5 - transform.offsetY).toBeCloseTo(crop.top + crop.height / 2)
    expect(transform.repeatX).toBeLessThan(crop.width)
    expect(transform.repeatY).toBeLessThan(crop.height)
  })

  test('applies customer placement without allowing the source focus outside the image', () => {
    const adjusted = applyPhotoPlacement(
      { focalX: 0.5, focalY: 0.5, zoom: 3 },
      {
        opalPositionX: 0.2,
        opalPositionY: -0.15,
        opalScale: 1.4,
        opalRotation: 30,
      }
    )
    expect(adjusted.focalX).toBeCloseTo(0.3)
    expect(adjusted.focalY).toBeCloseTo(0.65)
    expect(adjusted.zoom).toBeCloseTo(4.2)

    expect(
      applyPhotoPlacement(
        { focalX: 0.9, focalY: 0.1, zoom: 8 },
        {
          opalPositionX: 0.45,
          opalPositionY: -0.45,
          opalScale: 2.25,
          opalRotation: 0,
        }
      )
    ).toEqual({ focalX: 0.45, focalY: 0.55, zoom: 12 })
  })

  test.each([1.5, 2.25, 4])(
    'uses the full pan range monotonically without dead zones at zoom %s',
    (zoom) => {
      const positions = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45]
      const leftEdges = positions.map((opalPositionX) =>
        computePlacedPhotoCrop(
          1200,
          1000,
          0.8,
          { focalX: 0.5, focalY: 0.5, zoom },
          {
            opalPositionX,
            opalPositionY: 0,
            opalScale: 1,
            opalRotation: 0,
          }
        ).left
      )

      for (let index = 1; index < leftEdges.length; index += 1) {
        expect(leftEdges[index]!).toBeLessThan(leftEdges[index - 1]!)
      }
      expect(leftEdges[0]).toBeGreaterThan(0)
      expect(leftEdges.at(-1)).toBeCloseTo(0, 12)
    }
  )
})
