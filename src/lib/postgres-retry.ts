interface RetrySerializableOptions {
  attempts?: number
  baseDelayMs?: number
  random?: () => number
  sleep?: (milliseconds: number) => Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isPostgresSerializationFailure(error: unknown): boolean {
  return hasPostgresError(error, '40001', 'could not serialize access')
}

export function isPostgresUniqueViolation(error: unknown): boolean {
  return hasPostgresError(error, '23505', 'duplicate key value violates unique constraint')
}

function hasPostgresError(error: unknown, code: string, message: string): boolean {
  let current: unknown = error
  const seen = new Set<unknown>()

  while (current !== undefined && current !== null && !seen.has(current)) {
    seen.add(current)
    if (isRecord(current)) {
      if (current.code === code) return true
      if (typeof current.message === 'string' && current.message.includes(message)) return true
      current = current.cause
      continue
    }
    break
  }

  return false
}

export async function retrySerializableTransaction<T>(
  operation: () => Promise<T>,
  options: RetrySerializableOptions = {}
): Promise<T> {
  const attempts = options.attempts ?? 4
  const baseDelayMs = options.baseDelayMs ?? 250
  const random = options.random ?? Math.random
  const sleep =
    options.sleep ?? ((milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)))

  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error('Retry attempts must be a positive integer')
  }

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error: unknown) {
      const hasAttemptsRemaining = attempt + 1 < attempts
      if (!hasAttemptsRemaining || !isPostgresSerializationFailure(error)) throw error
      const jitterMs = Math.floor(random() * baseDelayMs)
      await sleep(baseDelayMs * 2 ** attempt + jitterMs)
    }
  }

  throw new Error('Serializable transaction retry exhausted unexpectedly')
}
