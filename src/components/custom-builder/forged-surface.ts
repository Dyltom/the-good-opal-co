import type { BufferGeometry } from 'three'

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function surfaceNoise(
  x: number,
  y: number,
  z: number,
  seed: number,
  channel: number
): number {
  const phase = seed * 0.731 + channel * 2.417
  const broad = Math.sin(x * 12.7 + y * 17.3 - z * 11.1 + phase)
  const filed = Math.sin(x * 31.9 - y * 23.5 + z * 27.7 + phase * 1.61)
  return clamp(broad * 0.72 + filed * 0.28, -1, 1)
}

/**
 * Breaks mathematically perfect CAD highlights without moving jewellery.
 * Ring size, opal seat, silhouette, positions, and topology stay unchanged.
 */
export function applyForgedNormalVariation(
  geometry: BufferGeometry,
  strength: number,
  seed: number
): void {
  if (!Number.isFinite(strength) || strength <= 0) return

  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  if (!position || !normal || position.count !== normal.count) return

  const boundedStrength = clamp(strength, 0, 0.22)
  for (let index = 0; index < normal.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const nx = normal.getX(index)
    const ny = normal.getY(index)
    const nz = normal.getZ(index)
    const verticalReference = Math.abs(nz) < 0.9
    const referenceY = verticalReference ? 0 : 1
    const referenceZ = verticalReference ? 1 : 0
    let tangentX = ny * referenceZ - nz * referenceY
    let tangentY = -nx * referenceZ
    let tangentZ = nx * referenceY
    const tangentLength = Math.hypot(tangentX, tangentY, tangentZ) || 1
    tangentX /= tangentLength
    tangentY /= tangentLength
    tangentZ /= tangentLength

    const bitangentX = ny * tangentZ - nz * tangentY
    const bitangentY = nz * tangentX - nx * tangentZ
    const bitangentZ = nx * tangentY - ny * tangentX
    const tangentTilt = surfaceNoise(x, y, z, seed, 0) * boundedStrength
    const bitangentTilt = surfaceNoise(x, y, z, seed, 1) * boundedStrength
    const nextX = nx + tangentX * tangentTilt + bitangentX * bitangentTilt
    const nextY = ny + tangentY * tangentTilt + bitangentY * bitangentTilt
    const nextZ = nz + tangentZ * tangentTilt + bitangentZ * bitangentTilt
    const nextLength = Math.hypot(nextX, nextY, nextZ) || 1
    normal.setXYZ(index, nextX / nextLength, nextY / nextLength, nextZ / nextLength)
  }
  normal.needsUpdate = true
}
