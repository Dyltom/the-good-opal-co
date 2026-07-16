import { Box3, Mesh, Object3D, Quaternion, Sphere, Vector3 } from 'three'

export type Vector3Tuple = readonly [x: number, y: number, z: number]
export type QuaternionTuple = readonly [x: number, y: number, z: number, w: number]

export interface ApprovedAssetAnchorTransform {
  position: Vector3Tuple
  quaternion: QuaternionTuple
  /** Anchor-local scale after removing the model's millimetre-to-scene conversion. */
  scale: Vector3Tuple
}

export interface ApprovedAssetFraming {
  distance: number
  target: Vector3Tuple
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/**
 * Reads one authored anchor after the GLB root has received its runtime unit
 * conversion. Position and rotation stay in scene/world space. Scale removes
 * only that root conversion so deliberate anchor-local fitting is not lost or
 * accidentally applied twice to an already scene-sized opal mesh.
 */
export function getApprovedAssetAnchorTransform(
  model: Object3D,
  anchorName: string,
  runtimeScale: number
): ApprovedAssetAnchorTransform {
  if (!finitePositive(runtimeScale)) throw new Error('Approved ring asset runtime scale is invalid')

  model.updateMatrixWorld(true)
  const anchor = model.getObjectByName(anchorName)
  if (!anchor) throw new Error(`Approved ring asset is missing ${anchorName}`)

  const position = anchor.getWorldPosition(new Vector3())
  const quaternion = anchor.getWorldQuaternion(new Quaternion())
  const worldScale = anchor.getWorldScale(new Vector3())
  const scale = worldScale.divideScalar(runtimeScale)
  if (![scale.x, scale.y, scale.z].every(finitePositive)) {
    throw new Error(`Approved ring asset anchor ${anchorName} has invalid scale`)
  }

  return {
    position: [position.x, position.y, position.z],
    quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    scale: [scale.x, scale.y, scale.z],
  }
}

/**
 * Preserves the authored head's join span/skew, then returns the translation
 * that seats its midpoint onto the current procedural shank. This lets one
 * calibrated head support multiple ring radii without stretching jewellery.
 */
export function getApprovedAssetJoinTranslation(
  actualLeft: Vector3Tuple,
  actualRight: Vector3Tuple,
  expectedLeft: Vector3Tuple,
  expectedRight: Vector3Tuple,
  tolerance: number
): Vector3Tuple {
  if (!finitePositive(tolerance)) throw new Error('Approved ring join tolerance is invalid')

  const actualSpan: Vector3Tuple = [
    actualRight[0] - actualLeft[0],
    actualRight[1] - actualLeft[1],
    actualRight[2] - actualLeft[2],
  ]
  const expectedSpan: Vector3Tuple = [
    expectedRight[0] - expectedLeft[0],
    expectedRight[1] - expectedLeft[1],
    expectedRight[2] - expectedLeft[2],
  ]
  if (Math.hypot(...actualSpan.map((value, index) => value - expectedSpan[index]!)) > tolerance) {
    throw new Error('Approved ring head shank anchors do not match the procedural shank')
  }

  return [
    (expectedLeft[0] + expectedRight[0] - actualLeft[0] - actualRight[0]) / 2,
    (expectedLeft[1] + expectedRight[1] - actualLeft[1] - actualRight[1]) / 2,
    (expectedLeft[2] + expectedRight[2] - actualLeft[2] - actualRight[2]) / 2,
  ]
}

function visibleObjectBounds(object: Object3D): Box3 {
  const bounds = new Box3()
  object.updateWorldMatrix(true, true)
  object.traverseVisible((child) => {
    if (!(child instanceof Mesh)) return
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox()
    if (!child.geometry.boundingBox) return
    bounds.union(child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld))
  })
  return bounds
}

/** Fits the actual visible approved assembly, excluding its hidden reference stone. */
export function getApprovedAssetFraming(
  object: Object3D,
  cameraDirection: Vector3Tuple,
  viewportAspect: number,
  verticalFovDegrees: number,
  minimumDistance = 4.8,
  padding = 1.12
): ApprovedAssetFraming | undefined {
  if (
    !finitePositive(viewportAspect) ||
    !finitePositive(verticalFovDegrees) ||
    verticalFovDegrees >= 179 ||
    !finitePositive(minimumDistance) ||
    !finitePositive(padding)
  ) {
    return undefined
  }

  const bounds = visibleObjectBounds(object)
  if (bounds.isEmpty()) return undefined
  const sphere = bounds.getBoundingSphere(new Sphere())
  if (!finitePositive(sphere.radius)) return undefined

  const verticalHalfFov = (verticalFovDegrees * Math.PI) / 360
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * viewportAspect)
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov)
  const distance = Math.max(
    minimumDistance,
    (sphere.radius / Math.max(0.001, Math.sin(limitingHalfFov))) * padding
  )
  const direction = new Vector3(...cameraDirection)
  if (direction.lengthSq() === 0) return undefined

  return {
    distance,
    target: [sphere.center.x, sphere.center.y, sphere.center.z],
  }
}
