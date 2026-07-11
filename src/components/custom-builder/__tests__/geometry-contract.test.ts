import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { ringStyleGeometryProfiles, ringStyles } from '../config'

const sceneSource = readFileSync(resolve(__dirname, '../RingScene.tsx'), 'utf8')

function capturedNumber(pattern: RegExp, label: string): number {
  const value = sceneSource.match(pattern)?.[1]
  if (!value) throw new Error(`Could not find ${label} in RingScene.tsx`)
  return Number(value)
}

describe('custom ring geometry contract', () => {
  test('mounts the setting face upright at the top of the shank', () => {
    expect(sceneSource).toContain(
      '<group position={[0, settingY, 0]} rotation={[-Math.PI / 2, 0, 0]}>'
    )

    // Local stone +Z becomes world +Y after this rotation: the face points away
    // from the finger instead of sideways along its axis.
    const localFaceNormal = { x: 0, y: 0, z: 1 }
    const angle = -Math.PI / 2
    const worldFaceNormal = {
      x: localFaceNormal.x,
      y: localFaceNormal.y * Math.cos(angle) - localFaceNormal.z * Math.sin(angle),
      z: localFaceNormal.y * Math.sin(angle) + localFaceNormal.z * Math.cos(angle),
    }

    expect(worldFaceNormal.x).toBeCloseTo(0)
    expect(worldFaceNormal.y).toBeCloseTo(1)
    expect(worldFaceNormal.z).toBeCloseTo(0)
  })

  test('seats the bezel on the band while keeping the stone base clear', () => {
    expect(sceneSource).toContain('const bezelBottom = depthProfile.baseZ - 0.012')
    expect(sceneSource).toContain('const bezelTop = depthProfile.girdleZ + 0.025')
    expect(sceneSource).toContain('const settingBottom = depthProfile.baseZ - 0.012')
    expect(sceneSource).toContain('const settingY = measurements.outerRadius - settingBottom')
    expect(sceneSource).toContain('bottomZ={bezelBottom}')
    expect(sceneSource).toContain('topZ={bezelTop}')
  })

  test('keeps ring and cabochon proportions monotonic and shape-specific', () => {
    const baseDiameter = capturedNumber(
      /const insideDiameterMm = ([\d.]+) \+ [\d.]+ \* config\.size/,
      'ring diameter intercept'
    )
    const sizeIncrement = capturedNumber(
      /const insideDiameterMm = [\d.]+ \+ ([\d.]+) \* config\.size/,
      'ring diameter increment'
    )
    const size4Diameter = baseDiameter + sizeIncrement * 4
    const size13Diameter = baseDiameter + sizeIncrement * 13

    expect(size4Diameter).toBeCloseTo(14.8812, 4)
    expect(size13Diameter).toBeCloseTo(22.1964, 4)
    expect(size13Diameter).toBeGreaterThan(size4Diameter)

    expect(sceneSource).toContain('round: [0.42, 0.42]')
    expect(sceneSource).toContain('oval: [0.4, 0.5]')
    expect(sceneSource).toContain('elongated: [0.35, 0.62]')
    expect(sceneSource).toContain('cushion: [0.5, 0.5]')
    expect(sceneSource).toContain('pear: [0.4, 0.5]')
    expect(sceneSource).toContain('depthMm * 0.1')
    expect(sceneSource).toContain(': Math.min(width, height) * 0.38')
    expect(sceneSource).toContain('const domeHeight = totalDepth * 0.58')
    expect(sceneSource).toContain("if (shape === 'elongated')")
    expect(sceneSource).toContain('Math.pow(Math.abs(cosine), 0.62)')
  })

  test('gives each named design meaningful geometry consumed by the scene', () => {
    const profiles = Object.entries(ringStyleGeometryProfiles)
    expect(profiles).toHaveLength(ringStyles.length)
    expect(new Set(profiles.map(([, profile]) => JSON.stringify(profile)))).toHaveLength(
      profiles.length
    )

    for (const [style, profile] of profiles) {
      expect(profile.shankRadius, style).toBeGreaterThanOrEqual(0.065)
      expect(profile.shankRadius, style).toBeLessThanOrEqual(0.08)
      expect(profile.shoulderRadius / profile.shankRadius, style).toBeGreaterThanOrEqual(0.95)
      expect(profile.shoulderRadius / profile.shankRadius, style).toBeLessThanOrEqual(1.05)

      if (profile.beadCount > 0) {
        expect(profile.beadRadius, style).toBeGreaterThan(0)
        expect(profile.haloOffset - profile.beadRadius, style).toBeGreaterThan(
          profile.bezelLipOffset
        )
      } else {
        expect(profile.beadRadius, style).toBe(0)
        expect(profile.haloOffset, style).toBe(0)
      }
    }

    expect(sceneSource).toContain('ringStyleGeometryProfiles[config.style]')
    for (const property of [
      'bezelWallOffset',
      'bezelWallThickness',
      'bezelLipOffset',
      'bezelLipRadius',
      'haloOffset',
      'haloSupportOffset',
      'haloSupportRadius',
      'beadRadius',
      'beadCount',
      'shankRadius',
      'shoulderRadius',
    ]) {
      expect(sceneSource, property).toMatch(new RegExp(`(?:profile|styleProfile)\\.${property}\\b`))
    }
  })

  test('keeps reviewed product photography untinted while restoring polished depth', () => {
    expect(sceneSource).toContain('map={photoTexture}')
    expect(sceneSource).toContain('emissiveMap={photoTexture}')
    expect(sceneSource).toContain('clearcoat={0.92}')
    expect(sceneSource).toContain('iridescence={0.18}')
    expect(sceneSource).not.toContain('<meshBasicMaterial attach="material-0"')
    expect(sceneSource).not.toContain('color="#f4fbf8"')
  })

  test('uses handmade sterling and soldered halo proportions from sold pieces', () => {
    expect(sceneSource).toContain("'sterling-silver': '#d2d3cf'")
    expect(sceneSource).toContain('envMapIntensity={1.2}')
    expect(sceneSource).toContain('const size = 0.94 + ((key * 7) % 7) * 0.022')
    expect(ringStyleGeometryProfiles['sun-moon']).toMatchObject({
      haloOffset: 0.043,
      beadRadius: 0.029,
      beadCount: 40,
      shankRadius: 0.078,
    })
    expect(ringStyleGeometryProfiles.aurora).toMatchObject({
      haloOffset: 0.042,
      beadRadius: 0.028,
      beadCount: 36,
    })
  })
})
