import { createHash } from 'node:crypto'
import { head, put } from '@vercel/blob'
import type { CanonicalFaceArtifactEvent, CanonicalFaceArtifactReceipt } from './mapping-processor'

const CANONICAL_FACE_STORAGE_KEY_PATTERN = /^builder\/opal-faces\/v\d+\/[a-f0-9]{64}\.png$/
const IMMUTABLE_CACHE_SECONDS = 31_536_000

function assertCanonicalFaceStorageKey(storageKey: string): void {
  if (!CANONICAL_FACE_STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error('Canonical face artifact has an invalid storage key')
  }
}

/**
 * Persists a generated face under its input-addressed public Blob pathname.
 * Replays overwrite the same immutable bytes instead of creating random keys.
 */
export async function persistCanonicalFaceArtifact(
  event: CanonicalFaceArtifactEvent
): Promise<CanonicalFaceArtifactReceipt> {
  const { artifact } = event
  const { contentHash, mediaType, storageKey } = artifact.metadata
  const actualHash = createHash('sha256').update(artifact.bytes).digest('hex')

  assertCanonicalFaceStorageKey(storageKey)
  if (contentHash !== actualHash) {
    throw new Error('Canonical face artifact content hash does not match its bytes')
  }
  if (artifact.metadata.byteLength !== artifact.bytes.byteLength) {
    throw new Error('Canonical face artifact byte length does not match its bytes')
  }

  const blob = await put(storageKey, artifact.bytes, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: IMMUTABLE_CACHE_SECONDS,
    contentType: mediaType,
  })

  if (blob.pathname !== storageKey) {
    throw new Error('Canonical face artifact Blob pathname does not match its storage key')
  }

  return {
    contentHash,
    pathname: blob.pathname,
    url: blob.url,
  }
}

/** Resolves a deterministic canonical-face pathname without storing Blob URLs in Payload. */
export async function lookupCanonicalFaceArtifact(storageKey: string) {
  assertCanonicalFaceStorageKey(storageKey)
  return head(storageKey)
}
