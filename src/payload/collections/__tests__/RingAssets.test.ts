import { describe, expect, test, vi } from 'vitest'
import { makeRingGlbFixture } from '@/test/ring-glb-fixture'
import {
  inspectRingAssetUpload,
  prepareRingAssetUpload,
  preventRingAssetDeletion,
  RingAssets,
} from '../RingAssets'

function request(bytes = makeRingGlbFixture()) {
  return {
    file: {
      data: bytes,
      mimetype: 'model/gltf-binary',
      name: 'artist-export.glb',
      size: bytes.length,
    },
  }
}

describe('RingAssets collection', () => {
  test('keeps validated maker assets permanently addressable', () => {
    expect(() => preventRingAssetDeletion()).toThrow('cannot be deleted')
    expect(RingAssets.hooks?.beforeDelete).toContain(preventRingAssetDeletion)
  })

  test('is admin-only and accepts only GLB uploads', () => {
    expect(RingAssets.access?.read?.({ req: { user: null } } as never)).toBe(false)
    expect(RingAssets.upload).toMatchObject({
      hideRemoveFile: true,
      mimeTypes: ['model/gltf-binary'],
      pasteURL: false,
    })
  })

  test('fingerprints bytes, writes immutable metadata, and content-addresses filename', async () => {
    const req = request()
    prepareRingAssetUpload({ operation: 'create', req } as never)
    const data = await inspectRingAssetUpload({ data: { name: 'Gemini head' }, req } as never)

    expect(req.file.name).toMatch(/^[a-f0-9]{64}\.glb$/)
    expect(data).toMatchObject({
      byteLength: req.file.data.length,
      name: 'Gemini head',
      validated: true,
      validationVersion: 'glb-ring-v6',
    })
    expect(Reflect.get(data ?? {}, 'sha256')).toBe(req.file.name.replace('.glb', ''))
  })

  test('rejects byte replacement and unavailable direct-upload bytes', () => {
    expect(() => prepareRingAssetUpload({ operation: 'update', req: request() } as never)).toThrow(
      'immutable'
    )
    expect(() =>
      inspectRingAssetUpload({
        data: { name: 'No bytes' },
        req: { file: { mimetype: 'model/gltf-binary' } },
      } as never)
    ).toThrow('bytes are unavailable')
  })

  test('does not accept client-authored validation metadata on ordinary updates', async () => {
    const originalDoc = {
      bounds: { min: [-1, -1, -1], max: [1, 1, 1], size: [2, 2, 2] },
      byteLength: 100,
      materialNames: ['METAL'],
      nodeNames: ['RING_ROOT', 'STONE_ANCHOR'],
      sha256: 'a'.repeat(64),
      validated: true,
      validationVersion: 'glb-ring-v6',
    }
    const result = await inspectRingAssetUpload({
      data: { name: 'Renamed', sha256: 'b'.repeat(64), validated: false },
      originalDoc,
      req: {},
    } as never)
    expect(result).toMatchObject({ ...originalDoc, name: 'Renamed' })
  })

  test('registers both immutable upload hooks in order', () => {
    expect(RingAssets.hooks?.beforeOperation).toEqual([prepareRingAssetUpload])
    expect(RingAssets.hooks?.beforeValidate).toEqual([inspectRingAssetUpload])
    expect(vi.isMockFunction(prepareRingAssetUpload)).toBe(false)
  })
})
