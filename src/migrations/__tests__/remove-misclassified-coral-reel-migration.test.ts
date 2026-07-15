import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import { ringDesignSourceReferenceSchema } from '../../lib/custom-builder/ring-design-reference'
import {
  down,
  misclassifiedCoralReference,
  up,
} from '../20260715_141500_remove_misclassified_coral_reel'

describe('misclassified Coral reel removal migration', () => {
  test('identifies the weak route-only collection reel without claiming measurements', () => {
    expect(ringDesignSourceReferenceSchema.safeParse(misclassifiedCoralReference).success).toBe(
      true
    )
    expect(misclassifiedCoralReference.verificationLevel).toBe('route-available')
    expect(misclassifiedCoralReference).not.toHaveProperty('measurements')
  })

  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('preserves product-gallery references that do not have a source URL', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'src/migrations/20260715_141500_remove_misclassified_coral_reel.ts'
      ),
      'utf8'
    )

    expect(source).toContain("(reference ->> 'sourceUrl') IS DISTINCT FROM")
    expect(source).not.toContain("reference ->> 'sourceUrl' <>")
  })
})
