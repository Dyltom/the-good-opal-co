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

  test.each([
    {
      focus: { focalX: 0.465, focalY: 0.52, zoom: 10 },
      image: [1920, 1883],
      safe: { bottom: 0.64, left: 0.41, right: 0.52, top: 0.4 },
      stoneAspect: 1 / 2.25,
    },
    {
      focus: { focalX: 0.524, focalY: 0.519, zoom: 6.3 },
      image: [1920, 1865],
      safe: { bottom: 0.63, left: 0.44, right: 0.61, top: 0.41 },
      stoneAspect: 5 / 6.5,
    },
    {
      focus: { focalX: 0.45, focalY: 0.52, zoom: 8 },
      image: [990, 1123],
      safe: { bottom: 0.63, left: 0.32, right: 0.55, top: 0.35 },
      stoneAspect: 1 / 1.5,
    },
    {
      focus: { focalX: 0.525, focalY: 0.52, zoom: 6.5 },
      image: [1783, 1920],
      safe: { bottom: 0.64, left: 0.44, right: 0.61, top: 0.4 },
      stoneAspect: 1 / 1.55,
    },
    {
      focus: { focalX: 0.48, focalY: 0.48, zoom: 6 },
      image: [1743, 1920],
      safe: { bottom: 0.58, left: 0.39, right: 0.57, top: 0.38 },
      stoneAspect: 1 / 1.2,
    },
    {
      focus: { focalX: 0.55, focalY: 0.48, zoom: 5.5 },
      image: [1901, 1920],
      safe: { bottom: 0.63, left: 0.45, right: 0.65, top: 0.33 },
      stoneAspect: 8.5 / 13,
    },
  ] as const)(
    'keeps a manually reviewed crop inside measured stone-face pixels',
    ({ focus, image, safe, stoneAspect }) => {
      const crop = computePhotoCrop(image[0], image[1], stoneAspect, focus)

      expect(crop.left).toBeGreaterThanOrEqual(safe.left)
      expect(crop.top).toBeGreaterThanOrEqual(safe.top)
      expect(crop.left + crop.width).toBeLessThanOrEqual(safe.right)
      expect(crop.top + crop.height).toBeLessThanOrEqual(safe.bottom)
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
    const [m00, m01, m02, m10, m11, m12] = transform.matrix
    expect(m00 * 0.5 + m01 * 0.5 + m02).toBeCloseTo(crop.left + crop.width / 2)
    expect(m10 * 0.5 + m11 * 0.5 + m12).toBeCloseTo(1 - crop.top - crop.height / 2)
  })

  test('rotates non-square stone photos in physical pixels instead of distorted UV space', () => {
    const transform = computePhotoTextureTransform(
      { left: 0.2, top: 0.15, width: 0.2, height: 0.5 },
      0.5,
      90
    )
    const [, m01, , m10] = transform.matrix

    expect(Math.abs(m01)).toBeCloseTo(transform.repeatX / 0.5)
    expect(Math.abs(m10)).toBeCloseTo(transform.repeatY * 0.5)
    expect(Math.abs(m01)).not.toBeCloseTo(transform.repeatX)
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
    'uses the full safe face range monotonically without exposing source background at zoom %s',
    (zoom) => {
      const positions = [-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45]
      const safe = computePhotoCrop(1200, 1000, 0.8, {
        focalX: 0.5,
        focalY: 0.5,
        zoom,
      })
      const crops = positions.map((opalPositionX) =>
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
        )
      )
      const centres = crops.map((crop) => crop.left + crop.width / 2)

      for (let index = 1; index < centres.length; index += 1) {
        expect(centres[index]!).toBeLessThan(centres[index - 1]!)
      }
      for (const crop of crops) {
        expect(crop.left).toBeGreaterThanOrEqual(safe.left - 1e-12)
        expect(crop.top).toBeGreaterThanOrEqual(safe.top - 1e-12)
        expect(crop.left + crop.width).toBeLessThanOrEqual(safe.left + safe.width + 1e-12)
        expect(crop.top + crop.height).toBeLessThanOrEqual(
          safe.top + safe.height + 1e-12
        )
      }
      expect(crops[0]!.left + crops[0]!.width).toBeCloseTo(safe.left + safe.width, 12)
      expect(crops.at(-1)!.left).toBeCloseTo(safe.left, 12)
    }
  )
})
