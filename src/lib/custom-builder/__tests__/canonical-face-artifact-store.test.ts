import { createHash } from 'node:crypto'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { CANONICAL_FACE_TEXTURE_VERSION } from '../canonical-face-texture'
import { OPAL_PHOTO_ANALYSIS_VERSION } from '../photo-analysis'
import type { CanonicalFaceArtifactEvent } from '../mapping-processor'

const blob = vi.hoisted(() => ({
  head: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@vercel/blob', () => blob)

import {
  lookupCanonicalFaceArtifact,
  persistCanonicalFaceArtifact,
} from '../canonical-face-artifact-store'

function canonicalFaceEvent(): CanonicalFaceArtifactEvent {
  const bytes = Buffer.from('durable-canonical-face')
  const contentHash = createHash('sha256').update(bytes).digest('hex')

  return {
    artifact: {
      bytes,
      metadata: {
        analysisConfidence: 0.96,
        analysisVersion: OPAL_PHOTO_ANALYSIS_VERSION,
        byteLength: bytes.byteLength,
        colorSpace: 'srgb',
        contentHash,
        contourHash: 'b'.repeat(64),
        coordinateExtent: 1,
        coordinateSpace: 'stone-normalized-y-up',
        crop: { focalX: 0.5, focalY: 0.5, rotation: 0, zoom: 2 },
        generatorVersion: CANONICAL_FACE_TEXTURE_VERSION,
        height: 512,
        inputHash: 'c'.repeat(64),
        mediaType: 'image/png',
        sourceImageHash: 'd'.repeat(64),
        storageKey: `builder/opal-faces/v${CANONICAL_FACE_TEXTURE_VERSION}/${'c'.repeat(64)}.png`,
        stoneAspect: 0.75,
        transparentOutsideContour: false,
        width: 512,
      },
      status: 'generated',
    },
    productId: 42,
    productSlug: 'lightning-ridge-black-opal',
    sourceImageIndex: 1,
  }
}

describe('canonical face artifact store', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('writes the deterministic public pathname and returns its durable receipt', async () => {
    const event = canonicalFaceEvent()
    const pathname = event.artifact.metadata.storageKey
    blob.put.mockResolvedValue({
      downloadUrl: `https://store.public.blob.vercel-storage.com/${pathname}?download=1`,
      pathname,
      url: `https://store.public.blob.vercel-storage.com/${pathname}`,
    })

    await expect(persistCanonicalFaceArtifact(event)).resolves.toEqual({
      contentHash: event.artifact.metadata.contentHash,
      pathname,
      url: `https://store.public.blob.vercel-storage.com/${pathname}`,
    })
    expect(blob.put).toHaveBeenCalledWith(pathname, event.artifact.bytes, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 31_536_000,
      contentType: 'image/png',
    })
  })

  test('propagates Blob write failures so mappings remain retryable', async () => {
    blob.put.mockRejectedValue(new Error('blob unavailable'))

    await expect(persistCanonicalFaceArtifact(canonicalFaceEvent())).rejects.toThrow(
      'blob unavailable'
    )
  })

  test('rejects mutated bytes before attempting a durable write', async () => {
    const event = canonicalFaceEvent()
    event.artifact.bytes[0] = 0

    await expect(persistCanonicalFaceArtifact(event)).rejects.toThrow('content hash does not match')
    expect(blob.put).not.toHaveBeenCalled()
  })

  test('looks up the artifact by its deterministic public pathname', async () => {
    const storageKey = canonicalFaceEvent().artifact.metadata.storageKey
    blob.head.mockResolvedValue({ pathname: storageKey, url: 'https://store.example/face.png' })

    await expect(lookupCanonicalFaceArtifact(storageKey)).resolves.toMatchObject({
      pathname: storageKey,
    })
    expect(blob.head).toHaveBeenCalledWith(storageKey)
  })
})
