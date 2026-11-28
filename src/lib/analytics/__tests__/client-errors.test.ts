import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureInsight } from '@/lib/insights/client'
import { trackClientError } from '../events'

vi.mock('@/lib/insights/client', () => ({ captureInsight: vi.fn() }))

describe('trackClientError', () => {
  beforeEach(() => vi.mocked(captureInsight).mockClear())

  it('drops errors thrown by wallets, in-app browsers and extensions', () => {
    trackClientError(
      "TypeError: undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')",
      '/'
    )
    trackClientError("ReferenceError: Can't find variable: __firefox__", '/store')
    trackClientError('Boom', 'chrome-extension://abc/content.js')

    expect(captureInsight).not.toHaveBeenCalled()
  })

  it('keeps errors from the site itself', () => {
    trackClientError('Cannot read properties of undefined', '/_next/static/chunks/app.js')

    expect(captureInsight).toHaveBeenCalledWith('js_error', {
      detail: {
        message: 'Cannot read properties of undefined',
        source: '/_next/static/chunks/app.js',
      },
    })
  })
})
