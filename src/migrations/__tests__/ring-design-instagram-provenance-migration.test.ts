import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { describe, expect, test, vi } from 'vitest'
import { ringDesignSourceReferenceSchema } from '../../lib/custom-builder/ring-design-reference'
import {
  down,
  instagramReferenceUrls,
  mergeInstagramReferences,
  ringDesignInstagramReferences,
  up,
} from '../20260714_231500_ring_design_instagram_provenance'

describe('ring design Instagram provenance migration', () => {
  test('stores valid public evidence for every governed ring style', () => {
    expect(Object.keys(ringDesignInstagramReferences).sort()).toEqual([
      'aurora',
      'coral',
      'gemini',
      'sun-moon',
    ])

    for (const references of Object.values(ringDesignInstagramReferences)) {
      expect(references.length).toBeGreaterThan(0)
      for (const reference of references) {
        expect(ringDesignSourceReferenceSchema.safeParse(reference).success).toBe(true)
        expect(reference.sourceType).toBe('instagram')
        expect(reference).not.toHaveProperty('measurements')
      }
    }

    expect(new Set(instagramReferenceUrls).size).toBe(instagramReferenceUrls.length)
  })

  test('deduplicates repeated runs by canonical source URL', () => {
    const reference = ringDesignInstagramReferences.gemini[0]!
    const once = mergeInstagramReferences([], [reference])
    const twice = mergeInstagramReferences(once, [reference])

    expect(twice).toEqual(once)
  })

  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('does not use a PostgreSQL reserved word as the evidence column name', () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        'src/migrations/20260714_231500_ring_design_instagram_provenance.ts'
      ),
      'utf8'
    )

    expect(migration).toContain('WITH evidence(style, reference_batch)')
    expect(migration).toContain('jsonb_array_elements(evidence.reference_batch)')
    expect(migration).not.toContain('WITH evidence(style, references)')
  })

  test('keeps the unnamed 2023 pear construction outside builder styles', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'docs/ring-design-candidates.json'), 'utf8')
    ) as {
      builderVisible: boolean
      candidates: Array<{
        requiresMakerApproval: boolean
        sourceUrl: string
        status: string
        unknown: string[]
      }>
    }

    expect(manifest.builderVisible).toBe(false)
    expect(manifest.candidates).toEqual([
      expect.objectContaining({
        requiresMakerApproval: true,
        sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CtEHPylykK3/',
        status: 'draft-evidence',
      }),
    ])
    expect(manifest.candidates[0]?.unknown).toContain('design name')
  })
})
