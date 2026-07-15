import { BoxGeometry, Group, Mesh, Object3D } from 'three'
import { describe, expect, test } from 'vitest'
import {
  assertApprovedAssetJoinAlignment,
  getApprovedAssetAnchorTransform,
  getApprovedAssetFraming,
} from '../approved-asset'

describe('approved ring asset placement', () => {
  test('preserves deliberate anchor scale without applying runtime conversion twice', () => {
    const model = new Group()
    model.scale.setScalar(0.1)
    const anchor = new Object3D()
    anchor.name = 'STONE_ANCHOR'
    anchor.position.set(3, 9, -2)
    anchor.rotation.set(0.2, -0.3, 0.4)
    anchor.scale.set(1.1, 0.95, 1.2)
    model.add(anchor)

    const transform = getApprovedAssetAnchorTransform(model, 'STONE_ANCHOR', 0.1)

    expect(transform.position[0]).toBeCloseTo(0.3, 12)
    expect(transform.position[1]).toBeCloseTo(0.9, 12)
    expect(transform.position[2]).toBeCloseTo(-0.2, 12)
    expect(transform.scale[0]).toBeCloseTo(1.1, 12)
    expect(transform.scale[1]).toBeCloseTo(0.95, 12)
    expect(transform.scale[2]).toBeCloseTo(1.2, 12)
    expect(transform.quaternion[3]).toBeLessThan(1)
  })

  test('fails closed when an authored head cannot meet its procedural shank', () => {
    expect(() =>
      assertApprovedAssetJoinAlignment(
        [-0.3, 0.8, 0],
        [0.3, 0.8, 0],
        [-0.31, 0.81, 0],
        [0.31, 0.81, 0],
        0.05
      )
    ).not.toThrow()

    expect(() =>
      assertApprovedAssetJoinAlignment(
        [-0.1, 0.8, 0],
        [0.1, 0.8, 0],
        [-0.31, 0.81, 0],
        [0.31, 0.81, 0],
        0.05
      )
    ).toThrow('shank anchors do not match')
  })

  test('frames visible assembly bounds and ignores the hidden reference stone', () => {
    const assembly = new Group()
    const ring = new Mesh(new BoxGeometry(2, 1, 0.5))
    ring.position.set(0, 0.5, 0)
    assembly.add(ring)
    const hiddenReference = new Mesh(new BoxGeometry(100, 100, 100))
    hiddenReference.visible = false
    assembly.add(hiddenReference)

    const wide = getApprovedAssetFraming(assembly, [0, 1, 0], 1.5, 32)
    const narrow = getApprovedAssetFraming(assembly, [0, 1, 0], 0.5, 32)

    expect(wide?.target[0]).toBeCloseTo(0, 12)
    expect(wide?.target[1]).toBeCloseTo(0.5, 12)
    expect(wide?.target[2]).toBeCloseTo(0, 12)
    expect(wide?.distance).toBe(4.8)
    expect(narrow?.distance).toBeGreaterThan(wide?.distance ?? 0)

    ring.geometry.dispose()
    hiddenReference.geometry.dispose()
  })
})
