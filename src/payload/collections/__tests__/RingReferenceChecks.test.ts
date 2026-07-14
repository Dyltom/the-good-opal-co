import { describe, expect, it } from 'vitest'

import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
} from 'payload'
import { guardRingReferenceCheckCreate, RingReferenceChecks } from '../RingReferenceChecks'

function accessArgs(user: PayloadRequest['user']): Parameters<Access>[0] {
  return { req: { user } } as Parameters<Access>[0]
}

function runGuard({
  operation,
  context = {},
  data = { ringDesign: 1 },
}: {
  operation: 'create' | 'update'
  context?: Record<string, unknown>
  data?: Record<string, unknown>
}) {
  return guardRingReferenceCheckCreate({
    data,
    operation,
    req: { context },
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])
}

function field(name: string) {
  return RingReferenceChecks.fields.find(
    (candidate) => 'name' in candidate && candidate.name === name
  )
}

describe('RingReferenceChecks collection', () => {
  it('allows only admins to read while closing every mutation access path', async () => {
    const admin = accessArgs({ id: 1, role: 'admin' } as PayloadRequest['user'])
    const anonymous = accessArgs(null)

    await expect(Promise.resolve(RingReferenceChecks.access?.read?.(admin))).resolves.toBe(true)
    await expect(Promise.resolve(RingReferenceChecks.access?.read?.(anonymous))).resolves.toBe(
      false
    )
    await expect(Promise.resolve(RingReferenceChecks.access?.create?.(admin))).resolves.toBe(false)
    await expect(Promise.resolve(RingReferenceChecks.access?.update?.(admin))).resolves.toBe(false)
    await expect(Promise.resolve(RingReferenceChecks.access?.delete?.(admin))).resolves.toBe(false)
  })

  it('accepts only trusted audit creates and rejects all updates', async () => {
    expect(() => runGuard({ operation: 'create' })).toThrow(
      'Ring reference checks are append-only system evidence'
    )
    expect(() =>
      runGuard({ operation: 'create', context: { ringReferenceAudit: true } })
    ).not.toThrow()
    expect(() => runGuard({ operation: 'update', context: { ringReferenceAudit: true } })).toThrow(
      'Ring reference checks are append-only system evidence'
    )
  })

  it('requires exactly one resolved design or unresolved candidate target', () => {
    const trustedContext = { ringReferenceAudit: true }

    expect(() =>
      runGuard({
        operation: 'create',
        context: trustedContext,
        data: { candidateKey: 'aurora-ring-1' },
      })
    ).not.toThrow()
    expect(() => runGuard({ operation: 'create', context: trustedContext, data: {} })).toThrow(
      'Ring reference checks require exactly one design target'
    )
    expect(() =>
      runGuard({
        operation: 'create',
        context: trustedContext,
        data: { candidateKey: '   ' },
      })
    ).toThrow('Ring reference checks require exactly one design target')
    expect(() =>
      runGuard({
        operation: 'create',
        context: trustedContext,
        data: { candidateKey: 'aurora-ring-1', ringDesign: 1 },
      })
    ).toThrow('Ring reference checks require exactly one design target')
  })

  it('rejects deletion even when Local API access is overridden', () => {
    const guard = RingReferenceChecks.hooks?.beforeDelete?.[0]

    expect(guard).toBeTypeOf('function')
    expect(() =>
      (guard as CollectionBeforeDeleteHook)({} as Parameters<CollectionBeforeDeleteHook>[0])
    ).toThrow('Ring reference checks cannot be deleted')
  })

  it('defines immutable source identity, outcome, timing, and optional design linkage', () => {
    expect(field('checkKey')).toMatchObject({ required: true, unique: true, index: true })
    expect(field('ringDesign')).toMatchObject({ relationTo: 'ring-designs' })
    expect(field('ringDesign')).not.toHaveProperty('required')
    expect(field('candidateKey')).not.toHaveProperty('required')
    expect(field('sourceUrl')).toMatchObject({ required: true })
    expect(field('accountHandle')).toMatchObject({ required: true })
    expect(field('shortcode')).toMatchObject({ required: true })
    expect(field('checkedAt')).toMatchObject({ required: true })
    expect(field('httpStatus')).not.toHaveProperty('required')
    expect(field('resolvedUrl')).not.toHaveProperty('required')
    expect(field('durationMs')).not.toHaveProperty('required')

    const outcome = field('outcome')
    expect(outcome && 'options' in outcome ? outcome.options : []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'available' }),
        expect.objectContaining({ value: 'redirected' }),
        expect.objectContaining({ value: 'not-found' }),
        expect.objectContaining({ value: 'rate-limited' }),
        expect.objectContaining({ value: 'blocked' }),
        expect.objectContaining({ value: 'error' }),
      ])
    )

    for (const candidate of RingReferenceChecks.fields) {
      expect('admin' in candidate ? candidate.admin?.readOnly : undefined).toBe(true)
    }
  })
})
