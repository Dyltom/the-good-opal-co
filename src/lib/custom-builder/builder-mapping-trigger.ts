import { after } from 'next/server'
import type { CollectionAfterChangeHook } from 'payload'

import { builderMappingNeedsReview } from './mapping-lifecycle'
import { BUILDER_MAPPING_WORKER_CONTEXT } from './mapping-lifecycle'
import { BUILDER_PHOTO_PIPELINE_VERSION } from './mapping-version'

type ProductRecord = Record<string, unknown>

interface TriggerLogger {
  warn: (details: Record<string, unknown>) => void
}

const BUILDER_MAPPING_WAKE_CONTEXT = 'builderMappingWorkerWakeScheduled'
export const BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT = 'builderMappingWorkerWakeSuppressed'

function isRecord(value: unknown): value is ProductRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isAvailableMappingSource(value: unknown): value is ProductRecord {
  if (!isRecord(value)) return false

  return (
    value.category === 'raw-opals' &&
    value.status === 'published' &&
    typeof value.stock === 'number' &&
    value.stock > 0 &&
    Array.isArray(value.images) &&
    value.images.length > 0 &&
    (value.builderMappingStatus === 'pending' ||
      value.builderMappingStatus === 'stale' ||
      ((value.builderMappingStatus === 'reviewed' || value.builderMappingStatus === 'manual') &&
        value.builderPhotoAnalysisVersion !== BUILDER_PHOTO_PIPELINE_VERSION))
  )
}

export function shouldWakeBuilderMappingWorker(doc: unknown, previousDoc: unknown): boolean {
  if (!isAvailableMappingSource(doc)) return false
  if (!isAvailableMappingSource(previousDoc)) return true

  return (
    builderMappingNeedsReview(doc, previousDoc) ||
    doc.builderMappingStatus !== previousDoc.builderMappingStatus ||
    doc.builderPhotoAnalysisVersion !== previousDoc.builderPhotoAnalysisVersion ||
    doc.builderContourSourceImageHash !== previousDoc.builderContourSourceImageHash
  )
}

function applicationOrigin(): string | undefined {
  const vercelOrigin =
    process.env.VERCEL_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  const publicOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const configured = vercelOrigin || publicOrigin
  if (!configured) return undefined

  try {
    const url = new URL(configured.includes('://') ? configured : `https://${configured}`)
    const localHttp =
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
    const localHttps =
      url.protocol === 'https:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
    if (url.protocol !== 'https:' && !localHttp) return undefined
    if (!vercelOrigin && !localHttp && !localHttps) return undefined
    if (url.username || url.password) return undefined
    return url.origin
  } catch {
    return undefined
  }
}

async function requestBuilderMappingWorker(
  productId: number | string,
  logger: TriggerLogger
): Promise<void> {
  const origin = applicationOrigin()
  const secret = process.env.CRON_SECRET?.trim()
  if (!origin || !secret) {
    logger.warn({
      msg: 'Builder mapping immediate trigger unavailable; scheduled cron remains fallback',
      productId,
      reason: !origin ? 'application-origin-missing' : 'cron-secret-missing',
    })
    return
  }

  try {
    const endpoint = new URL('/api/cron/builder-mappings', origin)
    endpoint.searchParams.set('productId', String(productId))
    const response = await fetch(endpoint, {
      headers: { authorization: `Bearer ${secret}` },
      method: 'POST',
    })
    if (!response.ok) {
      logger.warn({
        msg: 'Builder mapping immediate trigger failed; scheduled cron remains fallback',
        productId,
        status: response.status,
      })
    }
  } catch (error: unknown) {
    logger.warn({
      error: error instanceof Error ? error.message : 'Unknown trigger error',
      msg: 'Builder mapping immediate trigger failed; scheduled cron remains fallback',
      productId,
    })
  }
}

export const wakeBuilderMappingWorkerAfterProductChange: CollectionAfterChangeHook = ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  if (context[BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT] || context[BUILDER_MAPPING_WORKER_CONTEXT]) {
    return doc
  }
  if (!shouldWakeBuilderMappingWorker(doc, previousDoc)) return doc
  if (context[BUILDER_MAPPING_WAKE_CONTEXT]) return doc

  const productId = doc.id
  if (typeof productId !== 'number' && typeof productId !== 'string') return doc
  context[BUILDER_MAPPING_WAKE_CONTEXT] = true

  try {
    after(() => requestBuilderMappingWorker(productId, req.payload.logger))
  } catch (error: unknown) {
    req.payload.logger.warn({
      error: error instanceof Error ? error.message : 'Unknown scheduler error',
      msg: 'Builder mapping immediate scheduler unavailable; scheduled cron remains fallback',
      productId,
    })
  }

  return doc
}
