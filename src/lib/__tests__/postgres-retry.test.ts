import { describe, expect, it, vi } from 'vitest'
import {
  isPostgresSerializationFailure,
  isPostgresUniqueViolation,
  retrySerializableTransaction,
} from '../postgres-retry'

describe('Postgres serialization retry', () => {
  it('recognizes direct and wrapped serialization failures', () => {
    expect(isPostgresSerializationFailure({ code: '40001' })).toBe(true)
    expect(
      isPostgresSerializationFailure(
        new Error('Failed query', {
          cause: new Error('could not serialize access due to read/write dependencies'),
        })
      )
    ).toBe(true)
    expect(isPostgresSerializationFailure(new Error('Connection refused'))).toBe(false)
    expect(isPostgresUniqueViolation({ cause: { code: '23505' } })).toBe(true)
    expect(isPostgresUniqueViolation(new Error('Connection refused'))).toBe(false)
  })

  it('retries serialization failures with bounded exponential delays', async () => {
    const operation = vi
      .fn<() => Promise<number>>()
      .mockRejectedValueOnce({ code: '40001' })
      .mockRejectedValueOnce(new Error('could not serialize access'))
      .mockResolvedValue(152)
    const sleep = vi.fn<(milliseconds: number) => Promise<void>>().mockResolvedValue(undefined)

    await expect(
      retrySerializableTransaction(operation, {
        attempts: 4,
        baseDelayMs: 10,
        random: () => 0,
        sleep,
      })
    ).resolves.toBe(152)
    expect(operation).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenNthCalledWith(1, 10)
    expect(sleep).toHaveBeenNthCalledWith(2, 20)
  })

  it('does not retry unrelated failures', async () => {
    const error = new Error('Permission denied')
    const operation = vi.fn<() => Promise<void>>().mockRejectedValue(error)
    const sleep = vi.fn<(milliseconds: number) => Promise<void>>()

    await expect(retrySerializableTransaction(operation, { sleep })).rejects.toBe(error)
    expect(operation).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('stops after the configured attempt limit', async () => {
    const error = { code: '40001' }
    const operation = vi.fn<() => Promise<void>>().mockRejectedValue(error)
    const sleep = vi.fn<(milliseconds: number) => Promise<void>>().mockResolvedValue(undefined)

    await expect(
      retrySerializableTransaction(operation, { attempts: 3, random: () => 0, sleep })
    ).rejects.toBe(error)
    expect(operation).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenCalledTimes(2)
  })
})
