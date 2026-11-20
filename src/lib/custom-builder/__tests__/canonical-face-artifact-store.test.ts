import { createHash } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { CANONICAL_FACE_TEXTURE_VERSION } from '../canonical-face-texture'
import { OPAL_PHOTO_ANALYSIS_VERSION } from '../photo-analysis'
import type { CanonicalFaceArtifactEvent } from '../mapping-processor'

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
  let uploadDir: string

  beforeEach(async () => {
    uploadDir = await mkdtemp(path.join(tmpdir(), 'canonical-face-'))
    vi.stubEnv('UPLOAD_DIR', uploadDir)
  })

  afterEach(async () => {
    vi.unstubAllEnvs()
    await rm(uploadDir, { force: true, recursive: true })
  })

  test('writes the bytes at the deterministic storage key and returns its receipt', async () => {
    const event = canonicalFaceEvent()
    const { contentHash, storageKey } = event.artifact.metadata

    await expect(persistCanonicalFaceArtifact(event)).resolves.toEqual({
      contentHash,
      pathname: storageKey,
    })
    await expect(readFile(path.join(uploadDir, storageKey))).resolves.toEqual(event.artifact.bytes)
    await expect(lookupCanonicalFaceArtifact(storageKey)).resolves.toEqual(event.artifact.bytes)
  })

  test('replays idempotently and replaces a corrupt file without leaving temp files', async () => {
    const event = canonicalFaceEvent()
    const filePath = path.join(uploadDir, event.artifact.metadata.storageKey)

    await persistCanonicalFaceArtifact(event)
    await writeFile(filePath, 'corrupt')
    await persistCanonicalFaceArtifact(event)
    await persistCanonicalFaceArtifact(event)

    await expect(readFile(filePath)).resolves.toEqual(event.artifact.bytes)
    await expect(readdir(path.dirname(filePath))).resolves.toEqual([path.basename(filePath)])
  })

  test('rejects mutated bytes before writing anything', async () => {
    const event = canonicalFaceEvent()
    event.artifact.bytes[0] = 0

    await expect(persistCanonicalFaceArtifact(event)).rejects.toThrow('content hash does not match')
    await expect(readdir(uploadDir)).resolves.toEqual([])
  })

  test('rejects a storage key that could escape the upload directory', async () => {
    await expect(lookupCanonicalFaceArtifact('../../etc/passwd')).rejects.toThrow(
      'invalid storage key'
    )
  })

  test('reports a missing artifact as absent', async () => {
    const storageKey = canonicalFaceEvent().artifact.metadata.storageKey
    await expect(lookupCanonicalFaceArtifact(storageKey)).resolves.toBeUndefined()
  })
})
