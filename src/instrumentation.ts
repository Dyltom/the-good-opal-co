import type { Instrumentation } from 'next'

const MAX_PER_MINUTE = 30
let windowStart = 0
let recorded = 0

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const now = Date.now()
  if (now - windowStart > 60_000) {
    windowStart = now
    recorded = 0
  }
  if (recorded >= MAX_PER_MINUTE) return
  recorded += 1
  const { recordServerError } = await import('@/lib/insights/record')
  const digest =
    error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string'
      ? error.digest
      : undefined
  await recordServerError({ kind: context.routeType, path: request.path, error, digest })
}
