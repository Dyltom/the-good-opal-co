import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { beforeAll, describe, expect, test } from 'vitest'
import {
  CANONICAL_FACE_TEXTURE_VERSION,
  createCanonicalFaceTextureIdentity,
  generateCanonicalFaceTexture,
} from '../canonical-face-texture'
import { computePhotoCrop, computePhotoTextureTransform } from '../photo-crop'
import { normalizedBuilderStoneContourPoint } from '../stone-contour'
import { OPAL_PHOTO_ANALYSIS_VERSION, type OpalPhotoAnalysis } from '../photo-analysis'

const contour = {
  version: 1 as const,
  radii: Array.from({ length: 96 }, () => 1),
}

const imageAnalysis: OpalPhotoAnalysis = {
  confidence: 0.96,
  contour,
  focalX: 0.5,
  focalY: 0.5,
  rotation: 0,
  source: 'image',
  stoneAspect: 0.75,
  zoom: 2,
}

let source: Buffer

beforeAll(async () => {
  const width = 96
  const height = 128
  const pixels = Buffer.alloc(width * height * 3)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3
      pixels[offset] = Math.round((x / (width - 1)) * 255)
      pixels[offset + 1] = Math.round((y / (height - 1)) * 255)
      pixels[offset + 2] = 170
    }
  }
  source = await sharp(pixels, { raw: { channels: 3, height, width } })
    .png()
    .toBuffer()
})

describe('canonical opal face texture', () => {
  test('samples the reviewed crop at the same texel centres as CSS and WebGL', async () => {
    const width = 4
    const height = 4
    const pixels = Buffer.alloc(width * height * 3)
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 3
        pixels[offset] = x * 50
        pixels[offset + 1] = y * 60
        pixels[offset + 2] = 180
      }
    }
    const source = await sharp(pixels, { raw: { channels: 3, height, width } })
      .png()
      .toBuffer()
    const asymmetricContour = {
      version: 1 as const,
      radii: Array.from({ length: 96 }, (_, index) => {
        const angle = (index / 96) * Math.PI * 2
        return 1 + Math.cos(angle) * 0.06 + Math.sin(angle * 2) * 0.035
      }),
    }
    const analysis: OpalPhotoAnalysis = {
      ...imageAnalysis,
      contour: asymmetricContour,
      focalX: 0.625,
      focalY: 0.375,
      rotation: 32,
      stoneAspect: 1,
      zoom: 2,
    }
    const outputSize = 33
    const generated = await generateCanonicalFaceTexture({ analysis, outputSize, source })
    expect(generated.status).toBe('generated')
    if (generated.status !== 'generated') return

    const decoded = await sharp(generated.bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const crop = computePhotoCrop(width, height, analysis.stoneAspect, analysis)
    const [m00, m01, m02, m10, m11, m12] = computePhotoTextureTransform(
      crop,
      analysis.stoneAspect,
      analysis.rotation
    ).matrix

    for (const [pixelX, pixelY] of [
      [16, 16],
      [13, 14],
      [19, 18],
    ] as const) {
      const canonicalU = (pixelX + 0.5) / outputSize
      const canonicalV = 1 - (pixelY + 0.5) / outputSize
      const sourceU = m00 * canonicalU + m01 * canonicalV + m02
      const sourceV = m10 * canonicalU + m11 * canonicalV + m12
      // Browser and GPU normalized texture coordinates address texel centres
      // at (index + 0.5) / size, with edge sampling clamped to the first or
      // final texel centre.
      const sourceX = Math.min(width - 1, Math.max(0, sourceU * width - 0.5))
      const sourceY = Math.min(height - 1, Math.max(0, (1 - sourceV) * height - 0.5))
      const offset = (pixelY * outputSize + pixelX) * 4

      expect(decoded.data[offset]).toBe(Math.round(sourceX * 50))
      expect(decoded.data[offset + 1]).toBe(Math.round(sourceY * 60))
      expect(decoded.data[offset + 2]).toBe(180)
      expect(decoded.data[offset + 3]).toBe(255)
    }

    const boundary = normalizedBuilderStoneContourPoint(asymmetricContour, Math.PI / 4)
    const alphaAt = (scale: number) => {
      const x = Math.round((boundary[0] * scale * 0.5 + 0.5) * outputSize - 0.5)
      const y = Math.round((0.5 - boundary[1] * scale * 0.5) * outputSize - 0.5)
      return decoded.data[(y * outputSize + x) * 4 + 3] ?? 0
    }
    expect(alphaAt(0.72)).toBe(255)
    expect(alphaAt(1.16)).toBe(255)
  })

  test('derives a lightweight identity from every pixel-affecting contract input', () => {
    const sourceImageHash = 'a'.repeat(64)
    const identity = createCanonicalFaceTextureIdentity({
      analysis: imageAnalysis,
      generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
      outputSize: 64,
      sourceImageHash,
    })
    const changedContour = {
      ...imageAnalysis,
      contour: {
        version: 1 as const,
        radii: contour.radii.map(
          (radius, index) => radius + Math.sin((index / contour.radii.length) * Math.PI * 2) * 0.02
        ),
      },
    }
    const variants = [
      {
        analysis: imageAnalysis,
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        sourceImageHash: 'b'.repeat(64),
      },
      {
        analysis: { ...imageAnalysis, focalX: 0.51 },
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        sourceImageHash,
      },
      {
        analysis: changedContour,
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        sourceImageHash,
      },
      {
        analysis: { ...imageAnalysis, stoneAspect: 0.76 },
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        sourceImageHash,
      },
      {
        analysis: imageAnalysis,
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION + 1,
        sourceImageHash,
      },
    ].map((variant) => createCanonicalFaceTextureIdentity({ ...variant, outputSize: 64 }))

    expect(identity).toMatchObject({
      generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
      inputHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      outputSize: 64,
    })
    expect(identity?.key).toBe(`v${CANONICAL_FACE_TEXTURE_VERSION}/${identity.inputHash}`)
    expect(new Set(variants.map((variant) => variant?.inputHash)).size).toBe(variants.length)
    for (const variant of variants) expect(variant?.inputHash).not.toBe(identity?.inputHash)
    expect(
      createCanonicalFaceTextureIdentity({
        analysis: { ...imageAnalysis, source: 'canonical-fallback' },
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        sourceImageHash,
      })
    ).toBeUndefined()
  })

  test('generates a deterministic content-addressed RGBA PNG and metadata contract', async () => {
    const first = await generateCanonicalFaceTexture({
      analysis: imageAnalysis,
      outputSize: 64,
      source,
    })
    const second = await generateCanonicalFaceTexture({
      analysis: imageAnalysis,
      outputSize: 64,
      source,
    })

    expect(first.status).toBe('generated')
    expect(second.status).toBe('generated')
    if (first.status !== 'generated' || second.status !== 'generated') return

    expect(first.bytes).toEqual(second.bytes)
    expect(first.metadata).toEqual(second.metadata)
    expect(first.metadata).toMatchObject({
      analysisConfidence: 0.96,
      analysisVersion: OPAL_PHOTO_ANALYSIS_VERSION,
      byteLength: first.bytes.byteLength,
      colorSpace: 'srgb',
      coordinateSpace: 'stone-normalized-y-up',
      crop: { focalX: 0.5, focalY: 0.5, rotation: 0, zoom: 2 },
      generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
      height: 64,
      mediaType: 'image/png',
      sourceImageHash: createHash('sha256').update(source).digest('hex'),
      stoneAspect: 0.75,
      transparentOutsideContour: false,
      width: 64,
    })
    expect(first.metadata.contentHash).toBe(createHash('sha256').update(first.bytes).digest('hex'))
    expect(first.metadata.inputHash).toMatch(/^[a-f0-9]{64}$/)
    expect(first.metadata.contourHash).toMatch(/^[a-f0-9]{64}$/)
    expect(first.metadata.storageKey).toBe(
      `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${first.metadata.inputHash}.png`
    )

    const decoded = await sharp(first.bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(decoded.info).toMatchObject({ channels: 4, height: 64, width: 64 })
    const centre = (32 * 64 + 32) * 4
    const corner = 0
    expect(decoded.data[centre + 3]).toBe(255)
    expect(decoded.data[corner]).toBeGreaterThan(0)
    expect(decoded.data[corner + 1]).toBeGreaterThan(0)
    expect(decoded.data[corner + 2]).toBe(170)
    for (let offset = 3; offset < decoded.data.length; offset += 4) {
      expect(decoded.data[offset]).toBe(255)
    }
    expect(decoded.data[corner + 3]).toBe(255)
    for (let offset = 0; offset < decoded.data.length; offset += 4) {
      expect(decoded.data[offset + 3]).toBe(255)
      expect(
        (decoded.data[offset] ?? 0) +
          (decoded.data[offset + 1] ?? 0) +
          (decoded.data[offset + 2] ?? 0)
      ).toBeGreaterThan(0)
    }
    const edgeAlpha = {
      bottom: Array.from({ length: 64 }, (_, x) => decoded.data[(63 * 64 + x) * 4 + 3] ?? 0),
      left: Array.from({ length: 64 }, (_, y) => decoded.data[y * 64 * 4 + 3] ?? 0),
      right: Array.from({ length: 64 }, (_, y) => decoded.data[(y * 64 + 63) * 4 + 3] ?? 0),
      top: Array.from({ length: 64 }, (_, x) => decoded.data[x * 4 + 3] ?? 0),
    }
    for (const alpha of Object.values(edgeAlpha)) {
      expect(Math.max(...alpha)).toBeGreaterThan(200)
    }
  })

  test('changes both input and content addresses when reviewed framing changes', async () => {
    const centred = await generateCanonicalFaceTexture({
      analysis: imageAnalysis,
      outputSize: 64,
      source,
    })
    const shifted = await generateCanonicalFaceTexture({
      analysis: { ...imageAnalysis, focalX: 0.55 },
      outputSize: 64,
      source,
    })

    expect(centred.status).toBe('generated')
    expect(shifted.status).toBe('generated')
    if (centred.status !== 'generated' || shifted.status !== 'generated') return
    expect(shifted.metadata.inputHash).not.toBe(centred.metadata.inputHash)
    expect(shifted.metadata.contentHash).not.toBe(centred.metadata.contentHash)
    expect(shifted.bytes).not.toEqual(centred.bytes)
  })

  test('truthfully skips a named-shape fallback instead of minting a photographed-face artifact', async () => {
    await expect(
      generateCanonicalFaceTexture({
        analysis: { ...imageAnalysis, confidence: 0.7, source: 'canonical-fallback' },
        outputSize: 64,
        source,
      })
    ).resolves.toEqual({ reason: 'canonical-fallback', status: 'skipped' })
  })

  test('rejects invalid output geometry before producing an artifact', async () => {
    await expect(
      generateCanonicalFaceTexture({
        analysis: imageAnalysis,
        outputSize: 31,
        source,
      })
    ).rejects.toThrow('Canonical face texture size must be an integer from 32 to 1024')

    await expect(
      generateCanonicalFaceTexture({
        analysis: { ...imageAnalysis, stoneAspect: 0 },
        outputSize: 64,
        source,
      })
    ).rejects.toThrow('Canonical face texture requires a positive stone aspect')
  })
})
