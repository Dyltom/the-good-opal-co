import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  createAnalyticsService,
  GoogleAnalyticsService,
  MockAnalyticsService,
  NoopAnalyticsService,
} from '../service'

describe('analytics service consent', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    })
    window.gtag = vi.fn()
  })

  test('uses a silent no-op in production when no provider is configured', () => {
    expect(createAnalyticsService(undefined, false)).toBeInstanceOf(NoopAnalyticsService)
    expect(createAnalyticsService(undefined, true)).toBeInstanceOf(MockAnalyticsService)
  })

  test('does not send GA events before analytics consent', () => {
    const service = new GoogleAnalyticsService('G-TEST')
    service.trackEvent({ eventName: 'view_item', parameters: { item_id: '1' } })
    expect(window.gtag).not.toHaveBeenCalled()
  })

  test('sends GA events after analytics consent', () => {
    window.localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ necessary: true, analytics: true })
    )
    const service = new GoogleAnalyticsService('G-TEST')
    service.trackEvent({ eventName: 'view_item', parameters: { item_id: '1' } })
    expect(window.gtag).toHaveBeenCalledWith('event', 'view_item', { item_id: '1' })
  })
})
