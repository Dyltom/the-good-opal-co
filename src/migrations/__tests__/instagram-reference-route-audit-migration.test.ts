import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import { ringDesignSourceReferenceSchema } from '../../lib/custom-builder/ring-design-reference'
import {
  down,
  instagramReferenceRouteAudit,
  up,
} from '../20260715_010500_instagram_reference_route_audit'

describe('Instagram reference route audit migration', () => {
  test('records the honest verification level separately from the post date', () => {
    expect(
      ringDesignSourceReferenceSchema.safeParse({
        accountHandle: '@thegoodopalco',
        assetPath: 'instagram://thegoodopalco/p/example',
        observedAt: '2021-12-07T00:00:00.000Z',
        sourceType: 'instagram',
        sourceUrl: 'https://www.instagram.com/thegoodopalco/p/example/',
        verificationLevel: instagramReferenceRouteAudit.verificationLevel,
        verifiedAt: instagramReferenceRouteAudit.verifiedAt,
        view: 'top',
      }).success
    ).toBe(true)
    expect(instagramReferenceRouteAudit.verificationLevel).toBe('route-available')
  })

  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('casts interpolated JSON metadata so PostgreSQL can infer parameter types', () => {
    const migrationSource = readFileSync(
      resolve(
        process.cwd(),
        'src/migrations/20260715_010500_instagram_reference_route_audit.ts'
      ),
      'utf8'
    )

    expect(migrationSource).toContain(
      'instagramReferenceRouteAudit.verificationLevel}::text'
    )
    expect(migrationSource).toContain('instagramReferenceRouteAudit.verifiedAt}::text')
  })
})
