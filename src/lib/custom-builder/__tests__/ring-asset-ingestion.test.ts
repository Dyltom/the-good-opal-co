import { describe, expect, test } from 'vitest'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { makeRingGlbFixture } from '@/test/ring-glb-fixture'
import {
  inspectRingGlb,
  MAX_RING_ASSET_BYTES,
  RING_ASSET_VALIDATION_VERSION,
  validateStoredRingAssets,
} from '../ring-asset-ingestion'

function approvedModel(inspection: ReturnType<typeof inspectRingGlb>) {
  const url = `https://assets.goodopalco.com/rings/${inspection.sha256}-immutable.glb`
  return {
    contractVersion: 'ring-asset-v1',
    source: 'hybrid',
    variants: [
      {
        assembly: 'authored-head-procedural-shank',
        asset: { byteLength: inspection.byteLength, sha256: inspection.sha256, url },
        materialSlots: {
          metal: ['STERLING_SILVER'],
          patina: ['OXIDIZED_RECESS'],
          preserve: ['MAKER_MARK'],
        },
        nodes: {
          root: 'RING_ROOT',
          shankJoinLeft: 'SHANK_JOIN_LEFT',
          shankJoinRight: 'SHANK_JOIN_RIGHT',
          stoneAnchor: 'STONE_ANCHOR',
        },
      },
    ],
    version: 'gemini-cad-v1',
  }
}

function storedAsset(inspection: ReturnType<typeof inspectRingGlb>) {
  const url = `https://assets.goodopalco.com/rings/${inspection.sha256}-immutable.glb`
  return {
    ...inspection,
    filename: `${inspection.sha256}.glb`,
    filesize: inspection.byteLength,
    mimeType: 'model/gltf-binary',
    url,
    validated: true,
  }
}

function parseWithProductionLoader(bytes: Buffer): Promise<void> {
  const data = new Uint8Array(bytes).buffer
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(data, '', () => resolve(), reject)
  })
}

describe('ring GLB ingestion', () => {
  test('parses exact bytes, embedded resources, named slots, and world bounds', () => {
    const bytes = makeRingGlbFixture()
    const inspection = inspectRingGlb(bytes)

    expect(inspection).toMatchObject({
      bounds: { min: [-10, -10, -3], max: [10, 10, 3], size: [20, 20, 6] },
      byteLength: bytes.length,
      materialNames: ['MAKER_MARK', 'OXIDIZED_RECESS', 'STERLING_SILVER'],
      nodeNames: ['RING_ROOT', 'SHANK_JOIN_LEFT', 'SHANK_JOIN_RIGHT', 'STONE_ANCHOR'],
      validationVersion: RING_ASSET_VALIDATION_VERSION,
    })
    expect(inspection.sha256).toMatch(/^[a-f0-9]{64}$/)
  })

  test('accepts a static jewellery subset the production Three.js loader can parse', async () => {
    const bytes = makeRingGlbFixture()
    expect(inspectRingGlb(bytes).validationVersion).toBe(RING_ASSET_VALIDATION_VERSION)
    await expect(parseWithProductionLoader(bytes)).resolves.toBeUndefined()
  })

  test.each([
    ['external resources', makeRingGlbFixture({ externalBufferUri: 'https://evil.test/a.bin' })],
    ['missing root', makeRingGlbFixture({ missingNode: 'RING_ROOT' })],
    ['missing stone anchor', makeRingGlbFixture({ missingNode: 'STONE_ANCHOR' })],
    ['duplicate materials', makeRingGlbFixture({ duplicateMaterial: true })],
    ['unnamed materials', makeRingGlbFixture({ unnamedMaterial: true })],
    [
      'unapproved required renderer extensions',
      makeRingGlbFixture({ requiredExtension: 'KHR_draco_mesh_compression' }),
    ],
    [
      'implausible bounds',
      makeRingGlbFixture({ bounds: { min: [-100, -10, -3], max: [100, 10, 3] } }),
    ],
    ['degenerate triangles', makeRingGlbFixture({ degenerateTriangles: true })],
    ['non-affine node matrices', makeRingGlbFixture({ invalidMatrix: true })],
    ['reflected node transforms', makeRingGlbFixture({ reflectedRoot: true })],
    ['out-of-range accessor', makeRingGlbFixture({ positionBufferViewLength: 12 })],
    ['unknown normal accessor', makeRingGlbFixture({ normalAccessor: 999 })],
    ['unknown index accessor', makeRingGlbFixture({ indicesAccessor: 999 })],
    ['camera references', makeRingGlbFixture({ invalidCamera: true })],
    ['malformed material fields', makeRingGlbFixture({ invalidMaterialField: true })],
    ['material texture references', makeRingGlbFixture({ invalidMaterialTexture: true })],
    ['malformed node fields', makeRingGlbFixture({ invalidNodeField: true })],
    ['additional scene references', makeRingGlbFixture({ invalidScene: true })],
    ['whitespace-padded node names', makeRingGlbFixture({ whitespaceNode: 'STONE_ANCHOR' })],
    ['whitespace-padded material names', makeRingGlbFixture({ whitespaceMaterial: true })],
    [
      'declared bounds that do not match embedded vertices',
      makeRingGlbFixture({
        declaredBounds: { min: [-9, -10, -3], max: [10, 10, 3] },
      }),
    ],
    ['required nodes outside the rendered scene', makeRingGlbFixture({ unreachableNode: 'STONE_ANCHOR' })],
  ])('rejects %s', (_, bytes) => {
    expect(() => inspectRingGlb(bytes)).toThrow()
  })

  test('rejects invalid headers and oversized files before parsing JSON', () => {
    const invalidMagic = Buffer.from(makeRingGlbFixture())
    invalidMagic.writeUInt32LE(0, 0)
    expect(() => inspectRingGlb(invalidMagic)).toThrow('not a GLB')
    expect(() => inspectRingGlb(Buffer.alloc(MAX_RING_ASSET_BYTES + 1))).toThrow('upload limit')
  })

  test('accepts only the exact CMS identity and authored head contract names', () => {
    const inspection = inspectRingGlb(makeRingGlbFixture())
    const model = approvedModel(inspection)
    const stored = storedAsset(inspection)

    expect(validateStoredRingAssets(model, [stored])).toBe(true)
    expect(
      validateStoredRingAssets(model, [{ ...stored, url: 'https://evil.test/model.glb' }])
    ).toBe(`Ring asset ${inspection.sha256} identity does not match its validated CMS upload`)
    expect(validateStoredRingAssets(model, [{ ...stored, nodeNames: ['RING_ROOT'] }])).toContain(
      `Ring asset ${inspection.sha256} is missing required node`
    )
    expect(
      validateStoredRingAssets(model, [
        { ...stored, materialNames: ['OXIDIZED_RECESS', 'MAKER_MARK'] },
      ])
    ).toBe(`Ring asset ${inspection.sha256} is missing required material STERLING_SILVER`)
    expect(
      validateStoredRingAssets(model, [
        { ...stored, materialNames: [...stored.materialNames, 'UNREVIEWED'] },
      ])
    ).toBe(`Ring asset ${inspection.sha256} has unassigned material UNREVIEWED`)
  })

  test('rejects stale validation versions and malformed stored bounds', () => {
    const inspection = inspectRingGlb(makeRingGlbFixture())
    const model = approvedModel(inspection)
    const stored = storedAsset(inspection)
    expect(validateStoredRingAssets(model, [{ ...stored, validationVersion: 'old' }])).not.toBe(
      true
    )
    expect(validateStoredRingAssets(model, [{ ...stored, bounds: { min: [0, 0, 0] } }])).toContain(
      'invalid millimetre-scale geometry bounds'
    )
  })
})
