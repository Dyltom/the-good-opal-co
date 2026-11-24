import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  createAnalyticsService,
  GoogleAnalyticsService,
  MockAnalyticsService,
  NoopAnalyticsService,
} from '../service'

describe('analytics service consent', () => {
  beforeEach(() => {
    window.gtag = vi.fn()
  })

  test('uses a silent no-op in production when no provider is configured', () => {
    expect(createAnalyticsService(undefined, false)).toBeInstanceOf(NoopAnalyticsService)
    expect(createAnalyticsService(undefined, true)).toBeInstanceOf(MockAnalyticsService)
  })

  test('sends GA events before any consent choice, leaving consent mode to keep them cookieless', () => {
    const service = new GoogleAnalyticsService('G-TEST')
    service.trackEvent({ eventName: 'view_item', parameters: { item_id: '1' } })
    expect(window.gtag).toHaveBeenCalledWith('event', 'view_item', { item_id: '1' })
  })
})
