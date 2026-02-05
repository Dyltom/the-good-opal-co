/**
 * Google Analytics 4 Service
 * Implements analytics tracking with SOLID principles
 */

import type { AnalyticsService, GtmEvent } from './types'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Google Analytics 4 implementation
 * Single Responsibility: Handles GA4 event tracking only
 */
export class GoogleAnalyticsService implements AnalyticsService {
  private measurementId: string
  private debug: boolean

  constructor(measurementId: string, debug = false) {
    this.measurementId = measurementId
    this.debug = debug
  }

  /**
   * Track custom events
   * Open/Closed: Can track any event type without modification
   */
  trackEvent(event: GtmEvent): void {
    if (!this.isEnabled()) {
      this.logDebug('Analytics disabled or not initialized', event)
      return
    }

    try {
      window.gtag?.('event', event.eventName, event.parameters)
      this.logDebug('Event tracked', event)
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  /**
   * Track page views
   */
  pageView(path: string): void {
    if (!this.isEnabled()) {
      this.logDebug('Analytics disabled or not initialized for page view', path)
      return
    }

    try {
      window.gtag?.('config', this.measurementId, {
        page_path: path
      })
      this.logDebug('Page view tracked', path)
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  private isEnabled(): boolean {
    return typeof window !== 'undefined' &&
           !!window.gtag &&
           !!this.measurementId
  }

  private logDebug(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[GA4] ${message}`, data)
    }
  }
}

/**
 * Mock analytics service for development/testing
 * Liskov Substitution: Can replace GoogleAnalyticsService
 */
export class MockAnalyticsService implements AnalyticsService {
  private events: GtmEvent[] = []
  private pageViews: string[] = []

  trackEvent(event: GtmEvent): void {
    this.events.push(event)
    console.log('[Mock Analytics] Event tracked:', event)
  }

  pageView(path: string): void {
    this.pageViews.push(path)
    console.log('[Mock Analytics] Page view tracked:', path)
  }

  getEvents(): GtmEvent[] {
    return [...this.events]
  }

  getPageViews(): string[] {
    return [...this.pageViews]
  }

  clear(): void {
    this.events = []
    this.pageViews = []
  }
}

/**
 * Factory function for creating analytics service
 * Dependency Inversion: Depends on abstraction (AnalyticsService)
 */
export function createAnalyticsService(
  measurementId?: string,
  isDevelopment = false
): AnalyticsService {
  if (!measurementId || isDevelopment) {
    return new MockAnalyticsService()
  }

  return new GoogleAnalyticsService(measurementId, isDevelopment)
}

/**
 * Singleton instance
 */
let analyticsService: AnalyticsService | null = null

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = createAnalyticsService(
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      process.env.NODE_ENV === 'development'
    )
  }
  return analyticsService
}