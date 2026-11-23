import type { AfterErrorHook } from 'payload'

export const recordAdminError: AfterErrorHook = async ({ collection, error, req }) => {
  if (collection?.slug === 'insight-events') return
  const status = 'status' in error && typeof error.status === 'number' ? error.status : 500
  if (status < 500 && req.user?.collection !== 'users') return
  const { recordServerError } = await import('@/lib/insights/record')
  await recordServerError({ kind: 'admin', path: req.pathname ?? '/api', error })
}
