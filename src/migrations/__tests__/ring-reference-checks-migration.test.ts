import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test, vi } from 'vitest'
import { down, up } from '../20260715_034500_ring_reference_checks'

describe('ring reference checks migration', () => {
  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })

  test('enforces append-only evidence targets and daily idempotency in PostgreSQL', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/migrations/20260715_034500_ring_reference_checks.ts'),
      'utf8'
    )

    expect(source).toContain('CONSTRAINT "ring_reference_checks_target_check" CHECK')
    expect(source).toContain('CREATE UNIQUE INDEX "ring_reference_checks_check_key_idx"')
    expect(source).toContain('ON DELETE restrict')
    expect(source).toContain('"enum_ring_reference_checks_outcome"')
    expect(source).toContain(
      "'available', 'redirected', 'not-found', 'rate-limited', 'blocked', 'error'"
    )
  })
})
