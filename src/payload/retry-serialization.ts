import { AsyncLocalStorage } from 'node:async_hooks'
import { isPostgresSerializationFailure } from '@/lib/postgres-retry'

interface AttemptState {
  finalAttempt: boolean
  serializationFailed: boolean
}

interface RetryOptions {
  attempts?: number
  baseDelayMs?: number
  sleep?: (milliseconds: number) => Promise<void>
}

type RouteHandler<Args> = (request: Request, args: Args) => Promise<Response>

const currentAttempt = new AsyncLocalStorage<AttemptState>()

export function isRetriedSerializationFailure(error: unknown): boolean {
  const attempt = currentAttempt.getStore()
  if (!attempt || !isPostgresSerializationFailure(error)) return false
  attempt.serializationFailed = true
  return !attempt.finalAttempt
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

export function retryOnSerializationFailure<Args>(
  handler: RouteHandler<Args>,
  { attempts = 8, baseDelayMs = 100, sleep = wait }: RetryOptions = {}
): RouteHandler<Args> {
  return async (request, args) => {
    const body = request.body ? await request.arrayBuffer() : undefined

    for (let attempt = 1; ; attempt += 1) {
      const state: AttemptState = { finalAttempt: attempt === attempts, serializationFailed: false }
      const response = await currentAttempt.run(state, () =>
        handler(new Request(request, { body }), args)
      )
      if (!state.serializationFailed || state.finalAttempt) return response
      await sleep(baseDelayMs * 2 ** (attempt - 1) + Math.random() * baseDelayMs)
    }
  }
}
