import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CanonicalFaceArtifactEvent, CanonicalFaceArtifactReceipt } from './mapping-processor'

const CANONICAL_FACE_STORAGE_KEY_PATTERN = /^builder\/opal-faces\/v\d+\/[a-f0-9]{64}\.png$/

function assertCanonicalFaceStorageKey(storageKey: string): void {
  if (!CANONICAL_FACE_STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error('Canonical face artifact has an invalid storage key')
  }
}

function artifactPath(storageKey: string): string {
  const uploadDir = path.resolve(process.env['UPLOAD_DIR']?.trim() || process.cwd())
  return path.join(uploadDir, storageKey)
}

async function storedHash(filePath: string): Promise<string | undefined> {
  try {
    return createHash('sha256').update(await readFile(filePath)).digest('hex')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

export async function persistCanonicalFaceArtifact(
  event: CanonicalFaceArtifactEvent
): Promise<CanonicalFaceArtifactReceipt> {
  const { artifact } = event
  const { contentHash, storageKey } = artifact.metadata
  const actualHash = createHash('sha256').update(artifact.bytes).digest('hex')

  assertCanonicalFaceStorageKey(storageKey)
  if (contentHash !== actualHash) {
    throw new Error('Canonical face artifact content hash does not match its bytes')
  }
  if (artifact.metadata.byteLength !== artifact.bytes.byteLength) {
    throw new Error('Canonical face artifact byte length does not match its bytes')
  }

  const filePath = artifactPath(storageKey)
  if ((await storedHash(filePath)) !== contentHash) {
    await mkdir(path.dirname(filePath), { recursive: true })
    const tempPath = `${filePath}.${randomUUID()}.tmp`
    try {
      await writeFile(tempPath, artifact.bytes)
      await rename(tempPath, filePath)
    } finally {
      await rm(tempPath, { force: true })
    }
  }

  return { contentHash, pathname: storageKey }
}

export async function lookupCanonicalFaceArtifact(storageKey: string): Promise<Buffer | undefined> {
  assertCanonicalFaceStorageKey(storageKey)
  const filePath = artifactPath(storageKey)
  try {
    if (!(await stat(filePath)).isFile()) return undefined
    return await readFile(filePath)
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}
