import { describe, expect, test } from 'vitest'
import {
  defaultRingConfig,
  describeRingConfig,
  metalIds,
  metals,
  mergeRingConfigSearchParams,
  ringStyleGeometryProfiles,
  ringConfigFromRecord,
  ringConfigToSearchParams,
} from '../config'

describe('custom ring configuration', () => {
  test('round-trips a shared configuration', () => {
    const config = {
      ...defaultRingConfig,
      metal: 'rose-gold',
      stone: 'sunset',
      style: 'coral',
      shape: 'cushion',
      setting: 'bezel',
      band: 'classic',
      size: 8.5,
      opalId: '127',
      opalPositionX: 0.18,
      opalPositionY: -0.12,
      opalScale: 1.35,
      opalRotation: 25,
    } as const
    const params = ringConfigToSearchParams(config)
    const values = Object.fromEntries(params.entries())

    expect(ringConfigFromRecord(values)).toEqual(config)
  })

  test('preserves an adapted stone shape in a shared collection design', () => {
    expect(ringConfigFromRecord({ y: 'coral', s: 'oval' })).toMatchObject({
      style: 'coral',
      shape: 'oval',
      setting: 'bezel',
    })
  })

  test('rejects tampered or incomplete URL state', () => {
    expect(ringConfigFromRecord({ m: 'plastic', z: '999' })).toEqual(defaultRingConfig)
  })

  test('updates builder-owned URL state without deleting unrelated parameters', () => {
    const merged = mergeRingConfigSearchParams(
      new URLSearchParams('utm_source=studio&m=plastic&px=0.4'),
      defaultRingConfig
    )

    expect(merged.get('utm_source')).toBe('studio')
    expect(merged.get('m')).toBe(defaultRingConfig.metal)
    expect(merged.has('px')).toBe(false)
  })

  test('rejects unsafe customer photo placement values', () => {
    const values = Object.fromEntries(ringConfigToSearchParams(defaultRingConfig))

    expect(ringConfigFromRecord({ ...values, px: '5', ps: '0.1' })).toEqual(defaultRingConfig)
  })

  test('preserves valid style, shape, and opal when one URL value is malformed', () => {
    expect(
      ringConfigFromRecord({ y: 'aurora', s: 'heart', p: '90', px: 'not-a-number', z: '7' })
    ).toMatchObject({
      style: 'aurora',
      shape: 'heart',
      setting: 'beaded',
      opalId: '90',
      opalPositionX: 0,
      size: 7,
    })
  })

  test('uses the product material identifiers as the public URL contract', () => {
    expect(metalIds).toEqual([
      'sterling-silver',
      '14k-gold',
      '18k-gold',
      'white-gold',
      'rose-gold',
      'platinum',
    ])
    expect(metals.map(({ id }) => id)).toEqual(metalIds)
    expect(new Set(metals.map(({ id }) => id))).toHaveLength(metals.length)
  })

  test('omits an unselected opal and accepts size boundaries', () => {
    const minimum = { ...defaultRingConfig, size: 4 }
    const maximum = { ...defaultRingConfig, size: 13 }

    expect(ringConfigToSearchParams(minimum).has('p')).toBe(false)
    expect(ringConfigFromRecord(Object.fromEntries(ringConfigToSearchParams(minimum)))).toEqual(
      minimum
    )
    expect(ringConfigFromRecord(Object.fromEntries(ringConfigToSearchParams(maximum)))).toEqual(
      maximum
    )
  })

  test('trims a store opal identifier before reusing URL state', () => {
    const values = Object.fromEntries(ringConfigToSearchParams(defaultRingConfig))

    expect(ringConfigFromRecord({ ...values, p: '  product-127  ' })).toEqual({
      ...defaultRingConfig,
      opalId: 'product-127',
    })
  })

  test('keeps a direct store opal link when other design parameters are omitted', () => {
    expect(ringConfigFromRecord({ p: '125' })).toEqual({
      ...defaultRingConfig,
      opalId: '125',
    })
  })

  test('creates a concise consultation summary', () => {
    expect(describeRingConfig(defaultRingConfig)).toBe(
      'Oval blue-green opal, Gemini design, sterling silver, size 7'
    )

    expect(describeRingConfig(defaultRingConfig, 'Lightning Ridge black crystal opal')).toBe(
      'Lightning Ridge black crystal opal, Gemini design, sterling silver, size 7'
    )
  })

  test('gives every photographed collection design distinct geometry', () => {
    const profiles = Object.values(ringStyleGeometryProfiles)
    const signatures = profiles.map((profile) => JSON.stringify(profile))

    expect(new Set(signatures)).toHaveLength(profiles.length)
    expect(ringStyleGeometryProfiles['sun-moon'].beadCount).toBeGreaterThan(0)
    expect(ringStyleGeometryProfiles.aurora.beadCount).toBeGreaterThan(0)
    expect(ringStyleGeometryProfiles.gemini.beadCount).toBe(0)
    expect(ringStyleGeometryProfiles.coral.beadCount).toBe(0)
  })
})
