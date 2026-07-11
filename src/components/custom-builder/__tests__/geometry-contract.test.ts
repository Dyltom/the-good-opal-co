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
      '<group position={[0, measurements.settingY, 0]} rotation={[-Math.PI / 2, 0, 0]}>'
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
    const settingLift = capturedNumber(/settingY: outerRadius \+ ([\d.]+)/, 'setting lift')
    const bezelBottom = capturedNumber(/outerY,\s+(-[\d.]+),\s+outerX/, 'bezel bottom')
    const bezelTop = capturedNumber(
      /outerY,\s+-[\d.]+,\s+outerX,\s+outerY,\s+([\d.]+)/,
      'bezel top'
    )
    const stoneBase = capturedNumber(/const baseZ = (-[\d.]+)/, 'stone base')
    const stoneGirdle = capturedNumber(/const girdleZ = ([\d.]+)/, 'stone girdle')

    expect(settingLift + bezelBottom).toBeCloseTo(0)
    expect(settingLift + stoneBase).toBeGreaterThan(0)
    expect(bezelBottom).toBeLessThan(stoneBase)
    expect(bezelTop).toBeGreaterThan(stoneGirdle)
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
    expect(sceneSource).toContain('const domeHeight = Math.min(width, height) * 0.25')
  })

  test('gives each named design meaningful geometry consumed by the scene', () => {
    const profiles = Object.entries(ringStyleGeometryProfiles)
    expect(profiles).toHaveLength(ringStyles.length)
    expect(new Set(profiles.map(([, profile]) => JSON.stringify(profile)))).toHaveLength(
      profiles.length
    )

    for (const [style, profile] of profiles) {
      expect(profile.shankRadius, style).toBeGreaterThanOrEqual(0.075)
      expect(profile.shankRadius, style).toBeLessThanOrEqual(0.09)
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

  test('does not wash reviewed product photography with a white material overlay', () => {
    expect(sceneSource).toContain(
      '<meshBasicMaterial attach="material-0" map={photoTexture} toneMapped={false} />'
    )
    expect(sceneSource).not.toContain('color="#f4fbf8"')
  })

  test('uses handmade sterling and soldered halo proportions from sold pieces', () => {
    expect(sceneSource).toContain("'sterling-silver': '#c9cac7'")
    expect(sceneSource).toContain('envMapIntensity={isSterlingSilver ? 0.9 : 1.2}')
    expect(sceneSource).toContain('position={[x, y, 0.06]} scale={[1, 1, 0.72]}')
    expect(ringStyleGeometryProfiles['sun-moon']).toMatchObject({
      haloOffset: 0.064,
      beadRadius: 0.043,
      shankRadius: 0.09,
    })
    expect(ringStyleGeometryProfiles.aurora).toMatchObject({
      haloOffset: 0.059,
      beadRadius: 0.043,
    })
  })
})
