import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const { afterMock } = vi.hoisted(() => ({ afterMock: vi.fn() }))

vi.mock('next/server', () => ({ after: afterMock }))

import {
  BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT,
  shouldWakeBuilderMappingWorker,
  wakeBuilderMappingWorkerAfterProductChange,
} from '../builder-mapping-trigger'

const availableProduct = {
  builderMappingInputHash: 'current-input',
  builderMappingSourceImageHash: 'current-source',
  builderMappingStatus: 'pending',
  builderMappingVersion: 5,
  category: 'raw-opals',
  id: 42,
  images: [{ image: 7 }],
  status: 'published',
  stock: 1,
}

function hookArguments(
  doc: Record<string, unknown>,
  previousDoc?: Record<string, unknown>,
  context: Record<string, unknown> = {}
) {
  return {
    collection: null,
    context,
    doc,
    operation: previousDoc ? 'update' : 'create',
    previousDoc,
    req: { payload: { logger: { warn: vi.fn() } } },
  } as unknown as Parameters<typeof wakeBuilderMappingWorkerAfterProductChange>[0]
}

describe('builder mapping event trigger', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', 'opal-preview.example.vercel.app')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 202 })))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  test('wakes one authenticated worker after an available raw opal is created', async () => {
    let scheduled: (() => Promise<void>) | undefined
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      scheduled = callback
    })

    const result = wakeBuilderMappingWorkerAfterProductChange(hookArguments(availableProduct))

    expect(result).toBe(availableProduct)
    expect(afterMock).toHaveBeenCalledOnce()
    await scheduled?.()
    expect(fetch).toHaveBeenCalledWith(
      new URL('https://opal-preview.example.vercel.app/api/cron/builder-mappings?productId=42'),
      {
        headers: { authorization: 'Bearer cron-secret' },
        method: 'POST',
      }
    )
  })

  test('coalesces multiple relevant changes in one Payload request', () => {
    const context = {}
    afterMock.mockImplementation(() => undefined)

    wakeBuilderMappingWorkerAfterProductChange(hookArguments(availableProduct, undefined, context))
    wakeBuilderMappingWorkerAfterProductChange(
      hookArguments({ ...availableProduct, id: 43 }, undefined, context)
    )

    expect(afterMock).toHaveBeenCalledOnce()
  })

  test('does not wake from a batch-owned product mutation', () => {
    wakeBuilderMappingWorkerAfterProductChange(
      hookArguments(availableProduct, undefined, {
        [BUILDER_MAPPING_WAKE_SUPPRESS_CONTEXT]: true,
      })
    )

    expect(afterMock).not.toHaveBeenCalled()
  })

  test('skips irrelevant updates and worker-owned mapping updates', () => {
    const unchanged = { ...availableProduct }
    const workerUpdate = { ...availableProduct, builderPhotoAnalysisConfidence: 0.96 }
    const previousWorkerState = { ...availableProduct, builderPhotoAnalysisConfidence: null }

    expect(shouldWakeBuilderMappingWorker(unchanged, availableProduct)).toBe(false)
    expect(shouldWakeBuilderMappingWorker(workerUpdate, previousWorkerState)).toBe(false)
    expect(
      shouldWakeBuilderMappingWorker(
        { ...availableProduct, category: 'opal-rings' },
        availableProduct
      )
    ).toBe(false)
    expect(shouldWakeBuilderMappingWorker({ ...availableProduct, images: [] }, undefined)).toBe(
      false
    )
    expect(afterMock).not.toHaveBeenCalled()
  })

  test('wakes when a draft becomes available or its source mapping changes', () => {
    expect(
      shouldWakeBuilderMappingWorker(availableProduct, { ...availableProduct, status: 'draft' })
    ).toBe(true)
    expect(
      shouldWakeBuilderMappingWorker(availableProduct, {
        ...availableProduct,
        builderMappingInputHash: 'previous-input',
      })
    ).toBe(true)
    expect(
      shouldWakeBuilderMappingWorker(
        {
          ...availableProduct,
          builderMappingSourceImageHash: null,
          builderMappingStatus: 'stale',
        },
        { ...availableProduct, builderMappingStatus: 'reviewed' }
      )
    ).toBe(true)
  })

  test('does not fail the product update when background scheduling is unavailable', () => {
    afterMock.mockImplementation(() => {
      throw new Error('request context unavailable')
    })
    const args = hookArguments(availableProduct)

    expect(() => wakeBuilderMappingWorkerAfterProductChange(args)).not.toThrow()
    expect(args.req.payload.logger.warn).toHaveBeenCalledWith({
      error: 'request context unavailable',
      msg: 'Builder mapping immediate scheduler unavailable; scheduled cron remains fallback',
      productId: 42,
    })
  })

  test('never sends the cron secret to an insecure configured origin', async () => {
    vi.stubEnv('VERCEL_URL', '')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://remote.example')
    let scheduled: (() => Promise<void>) | undefined
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      scheduled = callback
    })
    const args = hookArguments(availableProduct)

    wakeBuilderMappingWorkerAfterProductChange(args)
    await scheduled?.()

    expect(fetch).not.toHaveBeenCalled()
    expect(args.req.payload.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'application-origin-missing' })
    )
  })

  test('never sends the cron secret to the public storefront fallback', async () => {
    vi.stubEnv('VERCEL_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    let scheduled: (() => Promise<void>) | undefined
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      scheduled = callback
    })
    const args = hookArguments(availableProduct)

    wakeBuilderMappingWorkerAfterProductChange(args)
    await scheduled?.()

    expect(fetch).not.toHaveBeenCalled()
    expect(args.req.payload.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'application-origin-missing' })
    )
  })
})
